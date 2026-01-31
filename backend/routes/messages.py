import asyncio
import traceback
from fastapi import Depends, APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from schemas import (
    MessageCreateRequest,
    MessageResponse,
    OpenAIResponse,
)
from db import get_db
from models import User, Project, Message, Chunk, Document, Citation
from sqlalchemy.orm import Session
from uuid import UUID
from security.jwt import get_current_active_user
import requests
from config import settings
import json
from litellm import completion, embedding


route = APIRouter(prefix="/api/projects/{project_id}/messages", tags=["messages"])

GPU_SERVICE_URL = settings.GPU_SERVICE_URL
CHAT_SERVICE_URL = settings.CHAT_SERVICE_URL
HF_ACCESS_TOKEN = settings.HF_ACCESS_TOKEN


@route.get("/", response_model=list[MessageResponse])
async def list_messages(
    project_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    project = (
        db.query(Project)
        .filter(Project.user_id == current_user.id, Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    return (
        db.query(Message)
        .filter(Message.project_id == project_id)
        .order_by(Message.created_at.asc())
        .all()
    )


@route.post("/")
async def create_message(
    project_id: UUID,
    message: MessageCreateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    project = (
        db.query(Project)
        .filter(Project.user_id == current_user.id, Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    user_message = Message(
        role=message.role,
        content=message.content,
        project_id=project_id,
    )

    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    embed_resp = requests.post(
        f"{GPU_SERVICE_URL}/embed",
        headers={"Authorization": f"Bearer {HF_ACCESS_TOKEN}"},
        json={"summarized_text": message.content},
        timeout=100,
    )

    embed_resp = embedding(
        model="text-embedding-3-small", input=message.content, dimensions=384
    )

    message_embedding = embed_resp.data[0]["embedding"]

    chunks = (
        db.query(Chunk)
        .filter(Chunk.project_id == project_id)
        .order_by(Chunk.embedding.cosine_distance(message_embedding))
        .limit(3)
        .all()
    )

    context_blocks = []

    for i, chunk in enumerate(chunks, start=1):
        context_blocks.append(f"[{i}]\n{chunk.summarised_content.strip()}")

    context = "\n\n".join(context_blocks)

    prompt = f"""
    Retrieved context:
    {context}

    User question:
    {message.content}

    Answer:
    """

    assistant_message = Message(
        role="assistant",
        content="",
        project_id=project_id,
    )

    db.add(assistant_message)
    db.commit()
    db.refresh(assistant_message)

    async def stream():
        try:
            response = completion(
                model="gpt-5-nano",
                max_tokens=2000,
                reasoning_effort="low",
                messages=[
                    {
                        "role": "system",
                        "content": """
                            Answer using ONLY the provided context chunks.

                            Rules:
                            - Cite ONLY the chunk numbers you actually used.
                            - Every factual claim must be supported by a cited chunk.
                            - Do NOT guess or default to chunk 1.
                            - If the answer is not supported by the context, respond "I don't know".
                        """,
                    },
                    {"role": "user", "content": prompt},
                ],
                response_format=OpenAIResponse,
                stream=False,
            )

            response_json = OpenAIResponse.model_validate_json(
                response.choices[0].message.content
            )

            answer_text = response_json.answer
            citations = response_json.citations

            for char in answer_text:
                yield f"data: {json.dumps({'content': char})}\n\n"
                await asyncio.sleep(0.01)

            assistant_message.content = answer_text

            for chunk_index in citations:
                if isinstance(chunk_index, int) and 1 <= chunk_index <= len(chunks):
                    chunk = chunks[chunk_index - 1]
                    document = (
                        db.query(Document)
                        .filter(Document.id == chunk.document_id)
                        .first()
                    )

                    if document:
                        citation_entry = Citation(
                            document_name=document.filename,
                            document_s3_key=document.s3_key,
                            page_number=chunk.page_number,
                            message_id=assistant_message.id,
                        )
                        db.add(citation_entry)

            db.commit()
            db.refresh(assistant_message)

            yield f"data: {json.dumps({'done': True})}\n\n"

        except Exception as e:
            print(f"Error in stream: {traceback.format_exc()}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
    )

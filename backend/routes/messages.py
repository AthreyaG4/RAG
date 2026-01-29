import traceback
from fastapi import Depends, APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from schemas import MessageCreateRequest, MessageResponse, SourceResponse
from db import get_db
from models import User, Project, Message, Chunk, Document, Source
from sqlalchemy.orm import Session
from uuid import UUID
from security.jwt import get_current_active_user
import requests
from config import settings
import json
from litellm import acompletion, embedding


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
        full_response = []

        try:
            response = await acompletion(
                model="gpt-5-nano",
                max_tokens=1000,
                reasoning_effort="low",
                messages=[
                    {
                        "role": "system",
                        "content": """
                            Answer the user's question based on the retrieved context from the documents. If the context does not provide enough information, respond with "I don't know". 
                            Be concise and to the point.

                            Answer:
                            <Your answer here>

                            Sources:
                            <List of sources used in single line separated by a comma.>.
                            """,
                    },
                    {"content": prompt, "role": "user"},
                ],
                stream=True,
            )

            async for chunk in response:
                if hasattr(chunk, "choices") and len(chunk.choices) > 0:
                    delta = chunk.choices[0].delta

                    if hasattr(delta, "content") and delta.content:
                        content = delta.content
                        full_response.append(content)

                        yield f"data: {json.dumps({'content': content})}\n\n"

            assistant_message.content = "".join(full_response)

            # sources = assistant_message.content.split("Sources:")[1].strip()
            # sources_list = sources.split(",") if sources else []
            # print(sources_list)
            # for source in sources_list:
            #     source = source.strip().strip("[]")
            #     if source.isdigit():
            #         chunk_index = int(source) - 1
            #         print(chunk_index)
            #         print(chunks[chunk_index].page_number)
            #         chunk = chunks[chunk_index]
            #         page_number = chunk.page_number
            #         document = (
            #             db.query(Document)
            #             .filter(Document.id == chunk.document_id)
            #             .first()
            #         )
            #         document_name = document.filename
            #         document_s3_key = document.s3_key

            #         source_entry = Source(
            #             document_name=document_name,
            #             document_s3_key=document_s3_key,
            #             page_number=page_number,
            #             message_id=assistant_message.id,
            #         )

            #         db.add(source_entry)
            #         db.commit()
            #         db.refresh(source_entry)

            db.commit()

            yield f"data: {json.dumps({'done': True})}\n\n"

        except Exception as e:
            print(f"Error in stream: {traceback.format_exc()}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
    )

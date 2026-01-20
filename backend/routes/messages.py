from fastapi import Depends, APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from schemas import MessageCreateRequest, MessageResponse
from db import get_db
from models import User, Project, Message, Chunk
from sqlalchemy.orm import Session
from uuid import UUID
from security.jwt import get_current_active_user
import requests
from config import settings
import logging
import httpx
import json

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

    embed_resp.raise_for_status()

    message_embedding = embed_resp.json()["embedding_vector"]

    chunks = (
        db.query(Chunk)
        .filter(Chunk.project_id == project_id)
        .order_by(Chunk.embedding.cosine_distance(message_embedding))
        .limit(3)
        .all()
    )

    context_blocks = []

    for i, chunk in enumerate(chunks, start=1):
        context_blocks.append(f"[Document {i}]\n{chunk.summarised_content.strip()}")

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

        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream(
                "POST",
                f"{CHAT_SERVICE_URL}/generate",
                json={"prompt": prompt},
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {HF_ACCESS_TOKEN}",
                },
            ) as resp:
                async for chunk in resp.aiter_bytes():
                    yield chunk

                    text = chunk.decode("utf-8")

                    if text.startswith("data:"):
                        payload = json.loads(text.replace("data:", "").strip())
                        if "content" in payload:
                            full_response.append(payload["content"])

        assistant_message.content = "".join(full_response)
        db.add(assistant_message)
        db.commit()

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
    )

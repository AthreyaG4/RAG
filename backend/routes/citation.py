from fastapi import APIRouter, Depends, status, HTTPException
from security.jwt import get_current_active_user
from db import get_db
from models import User, Project, Message, Citation
from sqlalchemy.orm import Session
from utils.s3 import get_presigned_url_for_pdf
from schemas import CitationViewResponse

route = APIRouter(
    prefix="/api/projects/{project_id}/messages/{message_id}/citations",
    tags=["citations"],
)


@route.get("/{citation_id}/view", response_model=CitationViewResponse)
async def view_citation(
    project_id,
    message_id,
    citation_id,
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

    message = (
        db.query(Message)
        .filter(Message.project_id == project_id, Message.id == message_id)
        .first()
    )

    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Message not found"
        )

    citation = (
        db.query(Citation)
        .filter(Citation.message_id == message_id, citation_id == citation_id)
        .first()
    )

    pre_signed_url = get_presigned_url_for_pdf(citation.document_s3_key)
    return {"url": pre_signed_url}

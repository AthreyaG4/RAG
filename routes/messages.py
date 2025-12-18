from fastapi import Depends, APIRouter, HTTPException, status
from schemas import MessageCreateRequest, MessageResponse
from db import get_db
from models import Project, Message
from sqlalchemy.orm import Session
from uuid import UUID

route = APIRouter(prefix="/api/users/{user_id}/projects/{project_id}/messages", tags=["messages"])

@route.get("/", response_model=list[MessageResponse])
async def list_messages(user_id: UUID, project_id: UUID, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.user_id == user_id, Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found or doesn't belong to this user")

    return db.query(Message).filter(Message.project_id == project_id).all()

@route.post("/", response_model=MessageResponse)
async def create_message(user_id: UUID,
                           project_id: UUID,
                           message: MessageCreateRequest,
                           db: Session = Depends(get_db)):
    
    project = db.query(Project).filter(Project.user_id == user_id, Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found or doesn't belong to this user")
    
    db_messages = Message(
            role=message.role,
            content=message.content,
            project_id=project_id
        )

    db.add(db_messages)
    db.commit()
    return db_messages
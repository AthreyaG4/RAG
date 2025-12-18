from fastapi import Depends, APIRouter, HTTPException, status
from schemas import DocumentCreateRequest, DocumentResponse
from db import get_db
from models import Project, Document
from sqlalchemy.orm import Session
from uuid import UUID

route = APIRouter(prefix="/api/users/{user_id}/projects/{project_id}/documents", tags=["documents"])

@route.get("/", response_model=list[DocumentResponse])
async def list_documents(user_id: UUID, 
                         project_id: UUID, 
                         db: Session = Depends(get_db)):
    
    project = db.query(Project).filter(Project.user_id == user_id, Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found or doesn't belong to this user")

    return db.query(Document).filter(Document.project_id == project_id).all()

@route.get("/{document_id}", response_model=DocumentResponse)
async def get_document(user_id: UUID,
                       project_id: UUID,
                       document_id: UUID,
                       db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.user_id == user_id, Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found or doesn't belong to this user")
    
    document = db.query(Document).filter(Document.project_id == project_id,
                                         Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found or doesn't belong to this project")
    return document

@route.post("/", response_model=list[DocumentResponse])
async def create_documents(user_id: UUID,
                           project_id: UUID,
                           documents: list[DocumentCreateRequest],
                           db: Session = Depends(get_db)):
    
    project = db.query(Project).filter(Project.user_id == user_id, Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found or doesn't belong to this user")
    
    db_documents = [
        Document(
            filename=document.filename,
            project_id=project_id
        )
        for document in documents
    ]
    db.add_all(db_documents)
    db.commit()
    return db_documents
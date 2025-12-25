from fastapi import Depends, APIRouter, HTTPException, status, File, UploadFile
from schemas import DocumentResponse
from db import get_db
from models import User, Project, Document
from sqlalchemy.orm import Session
from uuid import UUID
from security.jwt import get_current_active_user
from utils.s3 import upload_files_to_s3

route = APIRouter(prefix="/api/projects/{project_id}/documents", tags=["documents"])

@route.get("/", response_model=list[DocumentResponse])
async def list_documents(project_id: UUID, 
                         current_user: User = Depends(get_current_active_user),
                         db: Session = Depends(get_db)):
    
    project = db.query(Project).filter(Project.user_id == current_user.id, Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    return db.query(Document).filter(Document.project_id == project_id).all()

@route.get("/{document_id}", response_model=DocumentResponse)
async def get_document(project_id: UUID,
                       document_id: UUID,
                       current_user: User = Depends(get_current_active_user),
                       db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.user_id == current_user.id, Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    
    document = db.query(Document).filter(Document.project_id == project_id,
                                         Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return document

@route.post("/", response_model=list[DocumentResponse])
async def create_documents(project_id: UUID,
                           documents: list[UploadFile] = File(...),
                           current_user: User = Depends(get_current_active_user),
                           db: Session = Depends(get_db)):
    
    # Verify project exists and belongs to user
    project = db.query(Project).filter(
        Project.user_id == current_user.id, 
        Project.id == project_id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Project not found"
        )
    
    # Upload files to S3
    upload_result = await upload_files_to_s3(documents)
    
    # Update project status
    project.status = "uploaded"  # type: ignore
    project.messages = []

    # Create documents for all results (success and error)
    db_documents = [
        Document(
            filename=doc['filename'],
            s3_key=doc.get('s3_key'),  # Use .get() to handle missing key
            status=doc['status'],
            project_id=project_id
        )
        for doc in upload_result['results']
    ]
    
    db.add_all(db_documents)
    db.commit()
    
    # Refresh all documents
    for doc in db_documents:
        db.refresh(doc)
    
    db.refresh(project)    
    return db_documents

@route.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    project_id: UUID,
    document_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    project = (
        db.query(Project)
        .filter(
            Project.user_id == current_user.id,
            Project.id == project_id,
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    document = (
        db.query(Document)
        .filter(
            Document.project_id == project_id,
            Document.id == document_id,
        )
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    db.delete(document)
    db.flush()

    remaining_docs = (
        db.query(Document)
        .filter(Document.project_id == project_id)
        .count()
    )

    if remaining_docs == 0:
        project.status = "created"  # type: ignore

    db.commit()
    return
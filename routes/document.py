from fastapi import Depends, APIRouter, HTTPException, status, File, UploadFile
from schemas import DocumentCreateRequest, DocumentResponse
from db import get_db
from models import User, Project, Document
from sqlalchemy.orm import Session
from uuid import UUID
from security.jwt import get_current_active_user
import boto3
from botocore.exceptions import ClientError
import os
from datetime import datetime
import uuid

route = APIRouter(prefix="/api/projects/{project_id}/documents", tags=["documents"])

S3_BUCKET = os.getenv("S3_BUCKET_NAME")
AWS_REGION = os.getenv("AWS_REGION")

s3_client = boto3.client(
    's3',
    region_name=AWS_REGION,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)

buckets = s3_client.list_buckets()
print("Buckets:", [b['Name'] for b in buckets['Buckets']])

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
    

    
    allowed_extensions = {".pdf", ".txt", ".md", ".doc", ".docx"}
    
    results = []
    total_size = 0
    for file in documents:
        file_ext = os.path.splitext(file.filename)[1].lower() # type: ignore
        
        if file_ext not in allowed_extensions:
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": f"File type {file_ext} not allowed"
            })
            continue
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        original_name = os.path.splitext(file.filename)[0] #type: ignore
        s3_key = f"uploads/{timestamp}_{unique_id}_{original_name}{file_ext}"

        try:
            file_content = await file.read()
            file_size = len(file_content)
            
            # Upload to S3
            s3_client.put_object(
                Bucket=S3_BUCKET,
                Key=s3_key,
                Body=file_content,
                ContentType=file.content_type or "application/octet-stream",
                Metadata={
                    'original_filename': file.filename,
                    'uploaded_at': datetime.now().isoformat()
                }
            )
            
            file_url = f"https://{S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{s3_key}"
            
            results.append({
                "filename": file.filename,
                "status": "success",
                "s3_key": s3_key,
                "file_url": file_url,
                "size": file_size
            })
            
            total_size += file_size
            
        except ClientError as e:
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": f"S3 upload failed: {str(e)}"
            })
        except Exception as e:
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": f"Upload failed: {str(e)}"
            })
    
    successful = sum(1 for r in results if r["status"] == "success")
    failed = len(results) - successful
    
    project = db.query(Project).filter(Project.user_id == current_user.id, Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    #change this back to processing
    project.status = "processed" # type: ignore
    project.messages = []
    db_documents = [
        Document(
            filename=document['filename'],
            s3_key=document['s3_key'],
            project_id=project_id
        )
        for document in results
    ]
    db.add_all(db_documents)
    db.commit()
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
from fastapi import Depends, APIRouter
from schemas import DocumentCreate, DocumentResponse
from db import get_db
from models import Document
from sqlalchemy.orm import Session

route = APIRouter(prefix="/api/documents", tags=["documents"])

@route.get("/", response_model=list[DocumentResponse])
async def list_documents(db: Session = Depends(get_db)):
    return db.query(Document).all()

@route.post("/", response_model=list[DocumentResponse])
async def create_documents(documents: list[DocumentCreate], db: Session = Depends(get_db)):
    db_documents = [
        Document(
            filename=document.filename,
            project_id=document.project_id
        )
        for document in documents
    ]
    db.add_all(db_documents)
    db.commit()
    return db_documents
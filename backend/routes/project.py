from fastapi import Depends, APIRouter, HTTPException, status
from schemas import (
    ProjectCreateRequest,
    ProjectResponse,
    ProjectUpdateRequest,
    ProjectProgressResponse,
)
from db import get_db
from models import Project, User, Document
from sqlalchemy.orm import Session
from uuid import UUID
from security.jwt import get_current_active_user
from tasks.process_document import process_document
from utils.s3 import delete_folder_from_s3

route = APIRouter(prefix="/api/projects", tags=["projects"])


@route.get("/", response_model=list[ProjectResponse])
def list_projects(
    current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)
):
    return (
        db.query(Project)
        .filter(Project.user_id == current_user.id)
        .order_by(Project.created_at.asc())
        .all()
    )


@route.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    project = (
        db.query(Project)
        .filter(Project.id == project_id, Project.user_id == current_user.id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    return project


@route.get("/{project_id}/progress", response_model=ProjectProgressResponse)
def get_project_progress(
    project_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    project = (
        db.query(Project)
        .filter(
            Project.id == project_id,
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    documents = (
        db.query(Document)
        .filter(Document.project_id == project_id)
        .order_by(Document.created_at.asc())
        .all()
    )

    documents_processed = sum(
        1
        for d in documents
        if d.total_chunks and d.chunks_embedded == d.total_chunks  # type: ignore
    )

    return ProjectProgressResponse(
        status=project.status,  # type: ignore
        total_documents=len(documents),
        documents_processed=documents_processed,
        documents=documents,  # type: ignore
    )


@route.post("/{project_id}/process", response_model=ProjectResponse)
def start_processing(
    project_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    project = (
        db.query(Project)
        .filter(
            Project.id == project_id,
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    documents = db.query(Document).filter(Document.project_id == project_id).all()

    for doc in documents:
        process_document.delay(str(project.id), str(doc.id))  # type: ignore

    project.status = "processing"  # type: ignore
    db.commit()
    db.refresh(project)

    return project


@route.post("/", response_model=ProjectResponse)
def create_project(
    project: ProjectCreateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    db_project = Project(name=project.name, user_id=current_user.id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


@route.patch("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: UUID,
    project_update: ProjectUpdateRequest,
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

    if project_update.name is not None:
        project.name = project_update.name  # type: ignore

    db.commit()
    db.refresh(project)
    return project


@route.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
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

    delete_folder_from_s3(str(project.user_id), str(project.id))
    db.delete(project)
    db.commit()
    return

from fastapi import Depends, APIRouter, HTTPException, status
from schemas import ProjectCreateRequest, ProjectResponse, ProjectUpdateRequest
from db import get_db
from models import Project, User
from sqlalchemy.orm import Session
from uuid import UUID

route = APIRouter(prefix="/api/users/{user_id}/projects", tags=["projects"])

@route.get("/", response_model=list[ProjectResponse])
async def list_projects(user_id: UUID, 
                        db: Session = Depends(get_db)):
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return db.query(Project).filter(Project.user_id == user_id).all()

@route.get("/{project_id}", response_model=ProjectResponse)
async def get_project(user_id: UUID, 
                      project_id: UUID, 
                      db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    project = db.query(Project).filter(Project.user_id == user_id, Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found or doesn't belong to this user")
    return project

@route.post("/", response_model=ProjectResponse)
async def create_project(user_id: UUID,
                         project: ProjectCreateRequest,
                         db: Session = Depends(get_db)):
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_project = Project(
        name=project.name,
        user_id=user_id
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@route.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(user_id: UUID,
                         project_id: UUID,
                         project_update: ProjectUpdateRequest,
                         db: Session = Depends(get_db)):
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    project = db.query(Project).filter(Project.user_id == user_id, Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found or doesn't belong to this user")
    
    if project_update.name is not None:
        project.name = project_update.name # type: ignore

    db.commit()
    db.refresh(project)
    return project

@route.delete("/{project_id}")
async def delete_project(user_id: UUID,
                         project_id: UUID,
                         db: Session = Depends(get_db)):
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    project = db.query(Project).filter(Project.user_id == user_id, Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found or doesn't belong to this user")
    
    db.delete(project)
    db.commit()
    return {"detail": "Project deleted successfully"}
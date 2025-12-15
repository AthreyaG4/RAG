from fastapi import Depends, APIRouter
from schemas import ProjectCreate, ProjectResponse
from db import get_db
from models import Project
from sqlalchemy.orm import Session

route = APIRouter(prefix="/api/projects", tags=["projects"])

@route.get("/", response_model=list[ProjectResponse])
async def list_projects(db: Session = Depends(get_db)):
    return db.query(Project).all()

@route.post("/create_project")
async def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    db_project = Project(
        name=project.name,
        user_id=project.user_id
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project
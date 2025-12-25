from fastapi import Depends, APIRouter, HTTPException
from tasks import long_running_task
from sqlalchemy.orm import Session
from db import get_db
from models import Project, Task
from uuid import UUID
from schemas import TaskResponse

router = APIRouter(prefix="/api/projects/{project_id}/task", tags=["task"])

@router.post("/", response_model=TaskResponse)
def start_task(project_id: UUID, db: Session = Depends(get_db)):
    # Check if project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if there's already an active task
    existing_task = db.query(Task).filter(Task.project_id == project_id).first()
    if existing_task and existing_task.status in ["PENDING", "RUNNING", "PROCESSING"]:
        raise HTTPException(status_code=400, detail="Task already running for this project")
    
    # Delete old completed task if exists
    if existing_task:
        db.delete(existing_task)
        db.commit()
    
    # Create new task in DB
    new_task = Task(
        project_id=project_id,
        status="PENDING",
        progress=0.0,
        stage=None
    )
    project.status = "processing"  # type: ignore
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    
    # Start celery task with the task ID
    celery_task = long_running_task.delay(str(project_id)) #type: ignore
    
    return new_task

@router.get("/", response_model=TaskResponse)
def get_task_status(project_id: UUID, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    task = db.query(Task).filter(Task.project_id == project_id).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="No task found for this project")
    
    return task

# @router.delete("/")
# def cancel_task(project_id: UUID, db: Session = Depends(get_db)):
#     task = db.query(Task).filter(Task.project_id == project_id).first()
#     if task:
#         db.delete(task)
#         db.commit()
#     return {"status": "cancelled"}
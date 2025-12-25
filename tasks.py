import time
import random
from celery_app import celery_app
from db import SessionLocal
from models import Task
from models import Project

@celery_app.task(bind=True)
def long_running_task(self, project_id: str):
    db = SessionLocal()
    try:
        # Find the task for this project
        task = db.query(Task).filter(Task.project_id == project_id).first()
        
        if not task:
            return {"status": "error", "message": "Task not found"}
        
        # Define the three stages
        stages = [
            {
                "name": "chunking",
                "iterations": random.randint(15, 25),
                "sleep": lambda: random.uniform(0.3, 0.8)
            },
            {
                "name": "embedding",
                "iterations": random.randint(20, 35),
                "sleep": lambda: random.uniform(0.2, 0.6)
            },
            {
                "name": "storing",
                "iterations": random.randint(10, 20),
                "sleep": lambda: random.uniform(0.5, 1.0)
            }
        ]
        
        # Update task status to processing
        task.status = "PROCESSING" #type: ignore
        task.progress = 0.0 #type: ignore
        db.commit()
        
        # Process each stage
        for stage in stages:
            stage_name = stage["name"]
            stage_iterations = stage["iterations"]
            
            print(f"Starting stage: {stage_name} ({stage_iterations} iterations)")
            
            # Update current stage
            task.stage = stage_name
            task.progress = 0.0  #type: ignore
            db.commit()
            
            # Process this stage
            for i in range(stage_iterations):
                time.sleep(stage["sleep"]())
                
                # Calculate progress for this stage (0.0 to 1.0)
                stage_progress = (i + 1) / stage_iterations
                
                # Update progress in DB
                task.progress = stage_progress
                db.commit()
                
                # Update celery state
                self.update_state(
                    state="PROGRESS",
                    meta={
                        "stage": stage_name,
                        "progress": stage_progress,
                    },
                )
                
                # Log progress every 5 iterations
                if (i + 1) % 5 == 0:
                    print(f"  ⏳ {stage_name}: {stage_progress*100:.1f}%")
            
            print(f"{stage_name} complete!")
        
        # Mark as complete
        task.status = "SUCCESS" #type: ignore
        task.progress = 1.0 #type: ignore
        task.stage = "stored" #type: ignore

        project = db.query(Project).filter(Project.id == project_id).first()
        if project:
            project.status = "ready"  # type: ignore
        db.commit()
        
        print(f"All stages completed successfully")
        
        return {"status": "done"}
        
    except Exception as e:
        print(f"Error in task: {str(e)}")
        if task: #type: ignore
            task.status = "FAILED" #type: ignore
            db.commit()
        raise
    finally:
        db.close()
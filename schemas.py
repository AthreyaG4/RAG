from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import List

class UserCreate(BaseModel):
    name: str
    username: str
    password: str

class ProjectCreate(BaseModel):
    user_id: UUID
    name: str
    status: str = "created"

class ProjectResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    status: str
    documents: List["DocumentResponse"] = []

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: UUID
    name: str
    username: str
    created_at: datetime
    projects: List[ProjectResponse] = []

    class Config:
        from_attributes = True

class DocumentCreate(BaseModel):
    project_id: UUID
    filename: str
    status: str = "uploaded"

class DocumentResponse(BaseModel):
    id: UUID
    project_id: UUID
    filename: str
    status: str = "uploaded"

    class Config:
        from_attributes = True
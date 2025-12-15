from fastapi import Depends, APIRouter
from schemas import UserCreate, UserResponse
from db import get_db
from models import User
from sqlalchemy.orm import Session
import hashlib

route = APIRouter(prefix="/api/users", tags=["users"])

@route.get("/", response_model=list[UserResponse])
async def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@route.post("/")
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    password_hash = hashlib.sha256(user.password.encode()).hexdigest()
    db_user = User(
        name=user.name,
        username=user.username,
        password_hash=password_hash
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
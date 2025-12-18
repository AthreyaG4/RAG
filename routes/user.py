from fastapi import Depends, APIRouter, HTTPException, status
from schemas import UserCreateRequest, UserResponse
from db import get_db
from models import User
from sqlalchemy.orm import Session
from pwdlib import PasswordHash
from uuid import UUID

route = APIRouter(prefix="/api/users", tags=["users"])

@route.get("/", response_model=list[UserResponse])
async def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@route.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: UUID,
                   db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@route.post("/", response_model=UserResponse)
async def create_user(user: UserCreateRequest,
                      db: Session = Depends(get_db)):
    
    existingUser = db.query(User).filter((User.username == user.username)).first()
    if existingUser:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail={"username": "Username already exists"})
    
    existingEmail = db.query(User).filter((User.email == user.email)).first()
    if existingEmail:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail={"email": "Email already exists"})
    
    password_hash = PasswordHash.recommended()

    hashed_password = password_hash.hash(user.password)
        
    db_user = User(
        name=user.name,
        username=user.username,
        password_hash=hashed_password,
        email=user.email
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
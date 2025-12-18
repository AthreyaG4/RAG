from datetime import datetime, timedelta, timezone
import jwt
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from fastapi import Depends, APIRouter, HTTPException, status
from schemas import UserLoginRequest
from db import get_db
from models import User
from sqlalchemy.orm import Session
from pwdlib import PasswordHash
from uuid import UUID

# route = APIRouter(prefix="/api/login", tags=["login"])

# @route.post("/")
# async def login_user(user: UserLoginRequest,
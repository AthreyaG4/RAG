from fastapi import FastAPI
from db import init_db
from user import route as user_route
from project import route as project_route
from document import route as document_route

import logging

logging.basicConfig(
    level=logging.INFO,
    format=f'%(asctime)s - RAG Service - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

app = FastAPI()
@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
async def root():
    return {"message": "Hello"}

app.include_router(user_route)
app.include_router(project_route)
app.include_router(document_route)
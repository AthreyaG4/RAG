from pydantic import BaseModel, EmailStr, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import List


def to_camel(string: str) -> str:
    parts = string.split("_")
    return parts[0] + "".join(word.capitalize() for word in parts[1:])


class UserCreateRequest(BaseModel):
    name: str
    username: str
    password: str
    email: EmailStr


class JWTToken(BaseModel):
    access_token: str
    token_type: str


class ProjectCreateRequest(BaseModel):
    name: str


class MessageCreateRequest(BaseModel):
    role: str
    content: str
    hybrid_search: bool | None = False
    graph_search: bool | None = False
    reranking: bool | None = False

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class ProjectUpdateRequest(BaseModel):
    name: str | None = None


class UserResponse(BaseModel):
    id: UUID
    name: str
    username: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True


class ProjectResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentResponse(BaseModel):
    id: UUID
    project_id: UUID
    filename: str
    created_at: datetime
    status: str
    chunks: List["ChunkResponse"] = []

    class Config:
        from_attributes = True


class DocumentProgressResponse(BaseModel):
    id: UUID
    project_id: UUID
    filename: str
    status: str
    total_chunks: int | None
    chunks_summarized: int
    chunks_embedded: int

    class Config:
        from_attributes = True


class ProjectProgressResponse(BaseModel):
    status: str
    total_documents: int
    documents_processed: int
    documents: List[DocumentProgressResponse]


class ChunkResponse(BaseModel):
    id: UUID
    document_id: UUID
    project_id: UUID
    content: str
    summarised_content: str | None = None
    has_text: bool | None = None
    has_image: bool | None = None
    has_table: bool | None = None
    created_at: datetime
    images: List["ImageResponse"] = []

    class Config:
        from_attributes = True


class ImageResponse(BaseModel):
    id: UUID
    chunk_id: UUID
    created_at: datetime


class MessageResponse(BaseModel):
    id: UUID
    project_id: UUID
    role: str
    content: str
    created_at: datetime
    citations: List["CitationResponse"] = []

    class Config:
        from_attributes = True


class CitationResponse(BaseModel):
    id: UUID
    document_name: str
    page_number: int
    message_id: UUID
    total_pages: int


class CitationViewResponse(BaseModel):
    url: str


class OpenAIResponse(BaseModel):
    answer: str
    citations: List[int]

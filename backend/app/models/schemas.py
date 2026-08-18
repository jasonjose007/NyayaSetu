from pydantic import BaseModel
from typing import Optional


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    conversation_history: list[ChatMessage] = []
    language: str = "en"


class ChatResponse(BaseModel):
    response: str
    sources: list[str] = []
    suggested_actions: list[str] = []


class DocumentRequest(BaseModel):
    doc_type: str
    user_info: dict
    language: str = "en"


class DocumentResponse(BaseModel):
    document: str
    filename: str
    doc_type: str


class SchemeRequest(BaseModel):
    profile: dict
    language: str = "en"


class SchemeResult(BaseModel):
    name: str
    description: str
    eligibility: str
    how_to_apply: str
    relevance_score: float


class SchemeResponse(BaseModel):
    schemes: list[SchemeResult]

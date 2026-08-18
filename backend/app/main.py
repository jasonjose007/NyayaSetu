from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.models.schemas import (
    ChatRequest, ChatResponse,
    DocumentRequest, DocumentResponse,
    SchemeRequest, SchemeResponse,
)
from app.agents.rag_agent import chat_with_agent
from app.agents.doc_generator import generate_document, list_templates
from app.agents.scheme_matcher import match_schemes
from app.knowledge.ingest import ingest_documents


@asynccontextmanager
async def lifespan(app: FastAPI):
    ingest_documents()
    yield


app = FastAPI(
    title="NyayaSetu API",
    description="AI-powered civic and legal rights assistant for Indian citizens",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "NyayaSetu API"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        history = [{"role": msg.role, "content": msg.content} for msg in request.conversation_history]
        result = await chat_with_agent(request.message, history, request.language)
        return ChatResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-document", response_model=DocumentResponse)
async def generate_doc(request: DocumentRequest):
    try:
        result = await generate_document(request.doc_type, request.user_info, request.language)
        return DocumentResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/templates")
async def get_templates():
    return {"templates": list_templates()}


@app.post("/api/match-schemes", response_model=SchemeResponse)
async def match_schemes_endpoint(request: SchemeRequest):
    try:
        schemes = await match_schemes(request.profile, request.language)
        return SchemeResponse(schemes=schemes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/categories")
async def get_categories():
    return {
        "categories": [
            {"id": "rti", "name": "RTI Applications", "icon": "FileText", "description": "File Right to Information requests"},
            {"id": "consumer", "name": "Consumer Rights", "icon": "ShieldCheck", "description": "Product/service complaints and refunds"},
            {"id": "tenant", "name": "Tenant Rights", "icon": "Home", "description": "Rental disputes and deposit recovery"},
            {"id": "workplace", "name": "Workplace Rights", "icon": "Briefcase", "description": "Labour law and employment issues"},
            {"id": "schemes", "name": "Government Schemes", "icon": "Landmark", "description": "Find schemes you're eligible for"},
            {"id": "general", "name": "General Legal Help", "icon": "Scale", "description": "Any other civic or legal question"},
        ]
    }

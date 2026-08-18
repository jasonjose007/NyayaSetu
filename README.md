# NyayaSetu - AI-Powered Civic & Legal Rights Assistant

> *Your Bridge to Justice* | OOSC 4.0 Hackathon - Problem Statement 3: AI for Civic and Legal Empowerment

## Overview

NyayaSetu is an AI-powered platform that helps Indian citizens understand and act on their civic and legal rights by translating bureaucratic complexity into clear, guided action paths.

Many citizens have legitimate rights and entitlements — consumer protections, tenant rights, RTI access, welfare eligibility — that go unused because navigating legal and bureaucratic language is intimidating. NyayaSetu bridges this gap using AI.

## Features

### 1. Conversational Legal Assistant
- Understands your problem in plain language (English & Hindi)
- Provides step-by-step guidance with citations to actual laws
- Identifies relevant rights, remedies, and next steps

### 2. Document Generator
- **RTI Application Drafter** — Converts plain-language questions into properly formatted RTI applications
- **Consumer Complaint Generator** — Creates ready-to-file consumer forum complaints
- **Legal Notice Builder** — Drafts legal notices for security deposit recovery, workplace issues
- **Labour Complaint Drafter** — Generates complaints to Labour Commissioner

### 3. Government Scheme Matcher
- Profile-based eligibility matching across 12+ central schemes
- Relevance scoring with specific eligibility reasoning
- Step-by-step application guidance

### 4. Bilingual Support
- Full English and Hindi support
- Legal terminology explained in both languages

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS, shadcn/ui, Lucide Icons |
| Backend | Python, FastAPI, Uvicorn |
| AI/LLM | Google Gemini 3.6 Flash (generation) + Gemini Embedding 001 (retrieval) |
| Vector DB | ChromaDB (semantic search over legal documents) |
| Architecture | RAG (Retrieval-Augmented Generation) with Gemini embeddings |

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Next.js Frontend                    │
│         (Chat UI, Document Forms, Scheme Matcher)    │
└────────────────────────┬────────────────────────────┘
                         │ REST API
┌────────────────────────▼────────────────────────────┐
│                  FastAPI Backend                      │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │RAG Agent │  │Doc Generator │  │Scheme Matcher│  │
│  └─────┬────┘  └──────┬───────┘  └──────┬───────┘  │
│        │               │                  │          │
│  ┌─────▼────────────────▼──────────────────▼──────┐  │
│  │              Google Gemini 3.6 Flash            │  │
│  └─────────────────────────────────────────────────┘  │
│        │                                             │
│  ┌─────▼─────────────────────────────────────────┐   │
│  │    ChromaDB (Legal Knowledge Vector Store)     │   │
│  └────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

## Knowledge Base

The system is grounded in actual Indian legal documents:
- Right to Information Act, 2005
- Consumer Protection Act, 2019
- Model Tenancy Act, 2021 & State Rent Control Acts
- Labour laws (Industrial Disputes Act, Payment of Wages Act, etc.)
- 12+ Government welfare schemes (PM-KISAN, PMAY, Ayushman Bharat, etc.)

## Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- Google Gemini API key ([Get free key](https://aistudio.google.com/apikey))

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Run the server
python run.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`

### API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation (Swagger UI).

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Conversational legal assistant |
| POST | `/api/generate-document` | Generate legal documents |
| GET | `/api/templates` | List available document templates |
| POST | `/api/match-schemes` | Find eligible government schemes |
| GET | `/api/categories` | Get legal help categories |
| GET | `/health` | Health check |

## Demo

[Demo Video Link - Coming Soon]

## Innovation & Impact

- **Accessibility**: Bilingual support (English/Hindi) makes legal information accessible to 800M+ Hindi speakers
- **Actionability**: Doesn't just inform — generates ready-to-use legal documents
- **Grounded AI**: RAG architecture ensures responses are grounded in actual legal provisions, not hallucinations
- **Scalability**: Stateless API design, vector DB for efficient retrieval, easily extendable knowledge base
- **Social Impact**: Directly addresses the access-to-justice gap for underserved communities

## Future Scope

- Voice input for accessibility (especially for low-literacy users)
- Regional language support (Tamil, Telugu, Bengali, etc.)
- Integration with government portals (RTI Online, e-Daakhil)
- Lawyer directory and pro-bono matching
- Case tracking and follow-up reminders

## Team

Built with purpose for OOSC 4.0 Hackathon

## License

MIT License

import google.generativeai as genai
from app.config import GEMINI_API_KEY
from app.knowledge.ingest import query_knowledge

genai.configure(api_key=GEMINI_API_KEY)

SYSTEM_PROMPT = """You are NyayaSetu, an AI-powered civic and legal rights assistant for Indian citizens.
Your role is to help people understand their legal rights and guide them through bureaucratic processes.

IMPORTANT GUIDELINES:
- Always be empathetic and use simple, clear language
- Cite specific laws, sections, and provisions when relevant
- Provide actionable step-by-step guidance
- If asked in Hindi, respond in Hindi. If asked in English, respond in English.
- Never provide definitive legal advice - always recommend consulting a lawyer for complex matters
- Focus on empowering the user with knowledge about their rights
- When suggesting actions, provide concrete next steps with timelines
- Mention relevant helpline numbers and online portals when applicable

You can help with:
1. RTI (Right to Information) applications
2. Consumer complaints and rights
3. Tenant/landlord disputes
4. Workplace rights and labour law issues
5. Government scheme eligibility and applications
6. General civic rights awareness

When you identify that the user needs a specific document (RTI application, consumer complaint, legal notice, etc.),
suggest that they use the document generator feature and specify what information will be needed.

When you identify potential government scheme eligibility, suggest they check the scheme matcher feature."""

HINDI_INSTRUCTION = """
If the user writes in Hindi or requests Hindi, respond entirely in Hindi using Devanagari script.
Translate legal terms but keep the original English term in parentheses for clarity.
Example: उपभोक्ता संरक्षण अधिनियम (Consumer Protection Act)
"""


def get_model():
    return genai.GenerativeModel(
        "gemini-3.6-flash",
        system_instruction=SYSTEM_PROMPT + HINDI_INSTRUCTION,
    )


async def chat_with_agent(message: str, conversation_history: list[dict], language: str = "en") -> dict:
    context_docs = query_knowledge(message, n_results=5)

    context_text = "\n\n---\n\n".join([
        f"[Source: {doc['category']}]\n{doc['content']}"
        for doc in context_docs
    ])

    sources = list(set(doc["source"] for doc in context_docs))

    augmented_prompt = f"""Based on the following legal knowledge base context, answer the user's question.
If the context doesn't contain relevant information, use your general knowledge about Indian law but clearly state that.

CONTEXT FROM KNOWLEDGE BASE:
{context_text}

USER'S QUESTION: {message}

Provide a helpful, empathetic response with specific actionable guidance."""

    model = get_model()

    history = []
    for msg in conversation_history:
        role = "user" if msg["role"] == "user" else "model"
        history.append({"role": role, "parts": [msg["content"]]})

    chat = model.start_chat(history=history)
    response = await chat.send_message_async(augmented_prompt)

    suggested_actions = extract_suggested_actions(response.text, message)

    return {
        "response": response.text,
        "sources": sources,
        "suggested_actions": suggested_actions,
    }


def extract_suggested_actions(response_text: str, user_message: str) -> list[str]:
    actions = []
    lower_response = response_text.lower()
    lower_message = user_message.lower()

    if any(kw in lower_message for kw in ["rti", "information", "government data", "public authority"]):
        actions.append("Generate RTI Application")

    if any(kw in lower_message for kw in ["consumer", "product", "defective", "refund", "seller", "shop"]):
        actions.append("Draft Consumer Complaint")

    if any(kw in lower_message for kw in ["landlord", "tenant", "rent", "deposit", "eviction", "house owner"]):
        actions.append("Generate Legal Notice")

    if any(kw in lower_message for kw in ["scheme", "yojana", "benefit", "subsidy", "eligible"]):
        actions.append("Check Scheme Eligibility")

    if any(kw in lower_message for kw in ["salary", "employer", "fired", "terminated", "wages", "pf", "provident"]):
        actions.append("Draft Labour Complaint")

    if not actions and "document" in lower_response:
        actions.append("Generate Document")

    return actions

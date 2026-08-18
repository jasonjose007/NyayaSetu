import google.generativeai as genai
from app.config import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)

DOCUMENT_TEMPLATES = {
    "rti": {
        "name": "RTI Application",
        "required_fields": ["applicant_name", "applicant_address", "department_name", "department_address", "questions"],
        "description": "Right to Information application under RTI Act, 2005",
    },
    "consumer_complaint": {
        "name": "Consumer Complaint",
        "required_fields": ["complainant_name", "complainant_address", "opposite_party_name", "opposite_party_address", "product_service", "purchase_date", "amount", "defect_description", "relief_sought"],
        "description": "Consumer complaint for District Consumer Forum",
    },
    "legal_notice_deposit": {
        "name": "Legal Notice - Security Deposit",
        "required_fields": ["tenant_name", "tenant_address", "landlord_name", "landlord_address", "property_address", "tenancy_start_date", "tenancy_end_date", "deposit_amount"],
        "description": "Legal notice to landlord for return of security deposit",
    },
    "labour_complaint": {
        "name": "Labour Complaint",
        "required_fields": ["employee_name", "employee_address", "company_name", "company_address", "designation", "employment_start_date", "issue_description"],
        "description": "Complaint to Labour Commissioner",
    },
    "general_legal_notice": {
        "name": "General Legal Notice",
        "required_fields": ["sender_name", "sender_address", "recipient_name", "recipient_address", "subject", "facts", "demand"],
        "description": "General purpose legal notice",
    },
}

GENERATION_PROMPT = """You are a legal document drafting assistant for Indian citizens.
Generate a properly formatted, legally sound document based on the provided information.

RULES:
- Use formal legal language appropriate for the document type
- Include all necessary legal references and sections
- Format properly with headers, sections, and proper addressing
- Include date and place placeholders where the user needs to fill in
- Make it ready to use with minimal editing
- If language is Hindi, generate in Hindi (Devanagari) with English legal terms in parentheses

Document Type: {doc_type}
Document Description: {doc_description}

User provided information:
{user_info}

Generate the complete, ready-to-use document. Format it clearly with proper spacing and structure."""


async def generate_document(doc_type: str, user_info: dict, language: str = "en") -> dict:
    template = DOCUMENT_TEMPLATES.get(doc_type)
    if not template:
        available = ", ".join(DOCUMENT_TEMPLATES.keys())
        return {
            "document": f"Unknown document type: {doc_type}. Available types: {available}",
            "filename": "error.txt",
            "doc_type": doc_type,
        }

    user_info_text = "\n".join([f"- {k.replace('_', ' ').title()}: {v}" for k, v in user_info.items()])

    if language == "hi":
        user_info_text += "\n\nPlease generate this document in Hindi (Devanagari script)."

    prompt = GENERATION_PROMPT.format(
        doc_type=template["name"],
        doc_description=template["description"],
        user_info=user_info_text,
    )

    model = genai.GenerativeModel("gemini-3.6-flash")
    response = await model.generate_content_async(prompt)

    filename = f"{doc_type}_{user_info.get('applicant_name', user_info.get('complainant_name', user_info.get('tenant_name', user_info.get('sender_name', 'document'))))}.txt"
    filename = filename.replace(" ", "_").lower()

    return {
        "document": response.text,
        "filename": filename,
        "doc_type": doc_type,
    }


def get_template_info(doc_type: str) -> dict | None:
    return DOCUMENT_TEMPLATES.get(doc_type)


def list_templates() -> list[dict]:
    return [
        {"id": key, "name": val["name"], "description": val["description"], "required_fields": val["required_fields"]}
        for key, val in DOCUMENT_TEMPLATES.items()
    ]

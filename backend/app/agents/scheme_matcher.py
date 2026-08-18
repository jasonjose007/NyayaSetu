import google.generativeai as genai
from app.config import GEMINI_API_KEY
from app.knowledge.ingest import query_knowledge

genai.configure(api_key=GEMINI_API_KEY)

SCHEME_MATCHING_PROMPT = """You are a government scheme eligibility expert for India.
Based on the user's profile, identify ALL government schemes they may be eligible for.

For each scheme, provide:
1. Scheme name
2. Brief description (1-2 sentences)
3. Why they're likely eligible (based on their profile)
4. How to apply (specific steps)
5. A relevance score from 0.0 to 1.0 (1.0 = definitely eligible, 0.5 = possibly eligible)

USER PROFILE:
{profile}

REFERENCE INFORMATION FROM DATABASE:
{context}

Return your response in this exact JSON format (no markdown, just raw JSON):
{{
  "schemes": [
    {{
      "name": "Scheme Name",
      "description": "Brief description",
      "eligibility": "Why they qualify based on profile",
      "how_to_apply": "Specific steps to apply",
      "relevance_score": 0.85
    }}
  ]
}}

Only include schemes where relevance_score >= 0.5. Order by relevance_score descending.
Be specific about eligibility based on the profile provided."""


async def match_schemes(profile: dict, language: str = "en") -> list[dict]:
    profile_text = "\n".join([f"- {k.replace('_', ' ').title()}: {v}" for k, v in profile.items()])

    context_docs = query_knowledge("government schemes eligibility welfare", n_results=8)
    context_text = "\n\n".join([doc["content"] for doc in context_docs])

    prompt = SCHEME_MATCHING_PROMPT.format(profile=profile_text, context=context_text)

    if language == "hi":
        prompt += "\n\nProvide all descriptions in Hindi (Devanagari) but keep scheme names in English."

    model = genai.GenerativeModel("gemini-3.6-flash")
    response = await model.generate_content_async(prompt)

    import json
    try:
        response_text = response.text.strip()
        if response_text.startswith("```"):
            response_text = response_text.split("\n", 1)[1].rsplit("```", 1)[0]
        result = json.loads(response_text)
        return result.get("schemes", [])
    except (json.JSONDecodeError, AttributeError):
        return [{
            "name": "Error parsing schemes",
            "description": "Could not parse scheme recommendations. Please try again.",
            "eligibility": "N/A",
            "how_to_apply": "N/A",
            "relevance_score": 0.0,
        }]

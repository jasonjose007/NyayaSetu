import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { LEGAL_KNOWLEDGE } from "@/lib/knowledge";

const SCHEME_PROMPT = `You are a government scheme eligibility expert for India.
Based on the user's profile, identify ALL government schemes they may be eligible for.

For each scheme, provide:
1. Scheme name
2. Brief description (1-2 sentences)
3. Why they're likely eligible
4. How to apply (specific steps)
5. A relevance score from 0.0 to 1.0

USER PROFILE:
{profile}

REFERENCE:
{context}

Return ONLY valid JSON (no markdown, no code fences):
{
  "schemes": [
    {
      "name": "Scheme Name",
      "description": "Brief description",
      "eligibility": "Why they qualify",
      "how_to_apply": "Steps to apply",
      "relevance_score": 0.85
    }
  ]
}

Only include schemes where relevance_score >= 0.5. Order by relevance_score descending.`;

export async function POST(request: NextRequest) {
  try {
    const { profile, language } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const genai = new GoogleGenerativeAI(apiKey);
    const model = genai.getGenerativeModel({ model: "gemini-3.6-flash" });

    const profileText = Object.entries(profile)
      .filter(([, v]) => v !== "")
      .map(([k, v]) => `- ${k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}: ${v}`)
      .join("\n");

    const prompt = SCHEME_PROMPT
      .replace("{profile}", profileText)
      .replace("{context}", LEGAL_KNOWLEDGE.government_schemes)
      + (language === "hi" ? "\n\nProvide descriptions in Hindi but keep scheme names in English." : "");

    const result = await model.generateContent(prompt);
    const responseText = (result.response.text() || "").trim();
    let schemes = [];
    try {
      const cleaned = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      const parsed = JSON.parse(cleaned);
      schemes = parsed.schemes || [];
    } catch {
      schemes = [];
    }

    return NextResponse.json({ schemes });
  } catch (error) {
    console.error("Scheme matching error:", error);
    return NextResponse.json({ error: "Failed to match schemes" }, { status: 500 });
  }
}

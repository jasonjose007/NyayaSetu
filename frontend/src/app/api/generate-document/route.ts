import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const GENERATION_PROMPT = `You are a legal document drafting assistant for Indian citizens.
Generate a properly formatted, legally sound document based on the provided information.

RULES:
- Use formal legal language appropriate for the document type
- Include all necessary legal references and sections
- Format properly with headers, sections, and proper addressing
- Include date and place placeholders where needed
- Make it ready to use with minimal editing

Document Type: {doc_type}

User provided information:
{user_info}

Generate the complete, ready-to-use document.`;

export async function POST(request: NextRequest) {
  try {
    const { doc_type, user_info, language } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const genai = new GoogleGenerativeAI(apiKey);
    const model = genai.getGenerativeModel({ model: "gemini-3.6-flash" });

    const userInfoText = Object.entries(user_info)
      .map(([k, v]) => `- ${k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}: ${v}`)
      .join("\n");

    const prompt = GENERATION_PROMPT
      .replace("{doc_type}", doc_type)
      .replace("{user_info}", userInfoText)
      + (language === "hi" ? "\n\nGenerate in Hindi (Devanagari script) with English legal terms in parentheses." : "");

    const result = await model.generateContent(prompt);
    const document = result.response.text() || "Error generating document.";
    const filename = `${doc_type}_${user_info.applicant_name || user_info.complainant_name || user_info.tenant_name || user_info.sender_name || "document"}.txt`
      .replace(/\s+/g, "_").toLowerCase();

    return NextResponse.json({ document, filename, doc_type });
  } catch (error) {
    console.error("Document generation error:", error);
    return NextResponse.json({ error: "Failed to generate document" }, { status: 500 });
  }
}

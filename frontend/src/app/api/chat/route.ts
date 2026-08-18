import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { searchKnowledge } from "@/lib/knowledge";

const SYSTEM_PROMPT = `You are NyayaSetu, an AI-powered civic and legal rights assistant for Indian citizens.
Your role is to help people understand their legal rights and guide them through bureaucratic processes.

GUIDELINES:
- Be empathetic and use simple, clear language
- Cite specific laws, sections, and provisions when relevant
- Provide actionable step-by-step guidance
- If asked in Hindi, respond in Hindi. If in English, respond in English.
- Never provide definitive legal advice - recommend consulting a lawyer for complex matters
- Focus on empowering the user with knowledge about their rights
- When suggesting actions, provide concrete next steps with timelines
- Mention relevant helpline numbers and online portals

You can help with:
1. RTI (Right to Information) applications
2. Consumer complaints and rights
3. Tenant/landlord disputes
4. Workplace rights and labour law issues
5. Government scheme eligibility
6. General civic rights awareness

When you identify that the user needs a document (RTI application, consumer complaint, legal notice),
suggest they use the Document Generator feature.`;

export async function POST(request: NextRequest) {
  try {
    const { message, conversation_history, language } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const genai = new GoogleGenerativeAI(apiKey);
    const model = genai.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const contextDocs = searchKnowledge(message);
    const contextText = contextDocs.join("\n\n---\n\n");

    const augmentedPrompt = `Based on the following legal knowledge base, answer the user's question.
If the context doesn't contain relevant information, use your general knowledge about Indian law but clearly state that.

CONTEXT FROM KNOWLEDGE BASE:
${contextText}

USER'S QUESTION: ${message}

Provide a helpful, empathetic response with specific actionable guidance.${language === "hi" ? " Respond in Hindi (Devanagari script)." : ""}`;

    const history = conversation_history.map((msg: { role: string; content: string }) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(augmentedPrompt);
    const responseText = result.response.text() || "I apologize, I could not generate a response. Please try again.";

    const suggestedActions: string[] = [];
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.match(/rti|information|government data|public authority/)) suggestedActions.push("Generate RTI Application");
    if (lowerMessage.match(/consumer|product|defective|refund|seller|shop/)) suggestedActions.push("Draft Consumer Complaint");
    if (lowerMessage.match(/landlord|tenant|rent|deposit|eviction/)) suggestedActions.push("Generate Legal Notice");
    if (lowerMessage.match(/scheme|yojana|benefit|subsidy|eligible/)) suggestedActions.push("Check Scheme Eligibility");
    if (lowerMessage.match(/salary|employer|fired|terminated|wages|pf/)) suggestedActions.push("Draft Labour Complaint");

    return NextResponse.json({
      response: responseText,
      sources: contextDocs.length > 0 ? ["Legal Knowledge Base"] : [],
      suggested_actions: suggestedActions,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

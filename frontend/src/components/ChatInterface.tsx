"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, FileText, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/types";
import { API_BASE } from "@/lib/utils";

interface ChatInterfaceProps {
  onActionSuggested?: (action: string) => void;
}

export default function ChatInterface({ onActionSuggested }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          conversation_history: messages.map((m) => ({ role: m.role, content: m.content })),
          language,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.response,
        sources: data.sources,
        suggested_actions: data.suggested_actions,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickPrompts = [
    "My landlord won't return my security deposit",
    "I want to file an RTI about road construction funds",
    "Defective product, shop refusing refund",
    "Am I eligible for PM-KISAN scheme?",
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Language Toggle */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span className="text-sm text-gray-600">AI Legal Assistant</span>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setLanguage("en")}
            className={`px-3 py-1 text-xs rounded-md transition-all ${language === "en" ? "bg-white shadow-sm text-orange-700 font-medium" : "text-gray-500"}`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage("hi")}
            className={`px-3 py-1 text-xs rounded-md transition-all ${language === "hi" ? "bg-white shadow-sm text-orange-700 font-medium" : "text-gray-500"}`}
          >
            हिंदी
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {language === "en" ? "How can I help you today?" : "आज मैं आपकी कैसे मदद कर सकता हूं?"}
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md">
              {language === "en"
                ? "Describe your civic or legal problem in simple words. I'll guide you through your rights and next steps."
                : "अपनी नागरिक या कानूनी समस्या सरल शब्दों में बताएं। मैं आपको आपके अधिकारों और अगले कदमों के बारे में मार्गदर्शन करूंगा।"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="text-left text-sm p-3 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all text-gray-600"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-orange-600" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
              {message.sources && message.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200/50">
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Sources: {message.sources.map((s) => s.replace(".txt", "").replace(/_/g, " ")).join(", ")}
                  </p>
                </div>
              )}
              {message.suggested_actions && message.suggested_actions.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200/50 flex flex-wrap gap-1">
                  {message.suggested_actions.map((action) => (
                    <button
                      key={action}
                      onClick={() => onActionSuggested?.(action)}
                      className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {message.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-orange-600" />
            </div>
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 p-4">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={language === "en" ? "Describe your problem..." : "अपनी समस्या बताएं..."}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            style={{ minHeight: "44px", maxHeight: "120px" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "44px";
              target.style.height = target.scrollHeight + "px";
            }}
          />
          <Button onClick={sendMessage} disabled={!input.trim() || isLoading} size="icon" className="rounded-xl h-11 w-11">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

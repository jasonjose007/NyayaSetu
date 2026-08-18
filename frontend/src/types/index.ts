export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  suggested_actions?: string[];
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  required_fields: string[];
}

export interface SchemeResult {
  name: string;
  description: string;
  eligibility: string;
  how_to_apply: string;
  relevance_score: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

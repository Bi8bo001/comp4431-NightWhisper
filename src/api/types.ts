/**
 * API Types and Interfaces
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  healerId: string;
  userInput: string;
  conversationHistory: ChatMessage[];
  ragContext?: string; // RAG retrieved context (optional for now)
}

export interface ChatResponse {
  message: string;
  error?: string;
}

export interface RAGRetrievalRequest {
  query: string;
  topK?: number; // Default to 3-5
}

export interface RAGRetrievalResponse {
  chunks: string[];
  error?: string;
}


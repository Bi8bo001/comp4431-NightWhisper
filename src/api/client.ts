/**
 * API Client for Backend Communication
 * 
 * This client handles all communication with the backend API.
 * API base URL can be configured via VITE_API_BASE_URL environment variable.
 */

import { ChatRequest, ChatResponse, RAGRetrievalRequest, RAGRetrievalResponse, TTSRequest, TTSResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Send a chat message to the backend and get a healer response
 * 
 * @param request - Chat request with healer ID, user input, history, and RAG context
 * @returns Chat response with message or error
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        const text = await response.text();
        errorData = { detail: text || `HTTP error! status: ${response.status}` };
      }
      const errorMessage = errorData.detail || errorData.error || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    const data: ChatResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    return {
      message: '',
      error: error instanceof Error ? error.message : 'Failed to send message',
    };
  }
}

/**
 * Retrieve relevant context from RAG system
 * 
 * @param request - RAG retrieval request with query and top_k
 * @returns RAG response with retrieved chunks or error
 */
export async function retrieveRAGContext(
  request: RAGRetrievalRequest
): Promise<RAGRetrievalResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/rag/retrieve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: request.query,
        topK: request.topK || 3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data: RAGRetrievalResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error retrieving RAG context:', error);
    return {
      chunks: [],
      error: error instanceof Error ? error.message : 'Failed to retrieve context',
    };
  }
}

/**
 * Health check endpoint to verify backend is running
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Generate TTS audio for a healer's message
 * 
 * @param request - TTS request with text and healer ID
 * @returns TTS response with audio URL or error
 */
export async function generateTTS(request: TTSRequest): Promise<TTSResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tts/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: request.text,
        healerId: request.healerId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data: TTSResponse = await response.json();
    
    // Convert relative URL to absolute URL
    if (data.audioUrl && !data.audioUrl.startsWith('http')) {
      data.audioUrl = `${API_BASE_URL}${data.audioUrl}`;
    }
    
    return data;
  } catch (error) {
    console.error('Error generating TTS:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to generate TTS',
    };
  }
}


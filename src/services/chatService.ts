/**
 * Chat Service
 * 
 * Handles chat logic including:
 * - Message history management
 * - RAG context retrieval
 * - API communication
 * - Prompt engineering
 */

import { sendChatMessage, retrieveRAGContext } from '../api/client';
import { ChatMessage } from '../api/types';
import { Healer } from '../types';

export interface ConversationState {
  messages: ChatMessage[];
  healer: Healer;
}

/**
 * Convert UI Message format to API ChatMessage format
 */
export function convertToChatMessage(
  text: string,
  sender: 'user' | 'healer'
): ChatMessage {
  return {
    role: sender === 'user' ? 'user' : 'assistant',
    content: text,
  };
}

/**
 * Get chat response from backend
 * 
 * @param userInput - Current user message
 * @param conversationHistory - Previous messages in the conversation
 * @param healer - Selected healer persona
 * @param enableRAG - Whether to retrieve RAG context (default: true)
 * @returns Response message or error
 */
export async function getChatResponse(
  userInput: string,
  conversationHistory: ChatMessage[],
  healer: Healer,
  enableRAG: boolean = true
): Promise<{ message: string; error?: string }> {
  // Step 1: Retrieve RAG context if enabled
  let ragContext: string | undefined;
  
  if (enableRAG) {
    try {
      const ragResult = await retrieveRAGContext({
        query: userInput,
        topK: 3,
      });
      
      if (ragResult.chunks && ragResult.chunks.length > 0) {
        ragContext = ragResult.chunks.join('\n\n');
      }
    } catch (error) {
      console.warn('RAG retrieval failed, continuing without context:', error);
      // Continue without RAG context if retrieval fails
    }
  }

  // Step 2: Send chat request to backend
  const response = await sendChatMessage({
    healerId: healer.id,
    userInput,
    conversationHistory,
    ragContext,
  });

  return response;
}


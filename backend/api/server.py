"""
FastAPI Backend Server for NightWhisper

This server handles:
- Chat API endpoints
- RAG retrieval endpoints
- Prompt engineering
- GPT-4o integration
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import prompt templates
import sys
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

try:
    from prompts.healers import healer_prompts, safety_guidelines
except ImportError as e:
    raise ImportError(f"Cannot import prompts.healers: {e}. Make sure prompts/healers.py exists.")

app = FastAPI(title="NightWhisper API", version="1.0.0")

# CORS middleware to allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== Data Models ====================

class ChatMessage(BaseModel):
    role: str  # 'system', 'user', or 'assistant'
    content: str


class ChatRequest(BaseModel):
    healerId: str
    userInput: str
    conversationHistory: List[ChatMessage]
    ragContext: Optional[str] = None
    
    class Config:
        # Accept both camelCase (from frontend) and snake_case
        populate_by_name = True


class ChatResponse(BaseModel):
    message: str
    error: Optional[str] = None


class RAGRetrievalRequest(BaseModel):
    query: str
    topK: Optional[int] = 3
    
    class Config:
        populate_by_name = True


class RAGRetrievalResponse(BaseModel):
    chunks: List[str]
    error: Optional[str] = None


# ==================== Helper Functions ====================

def build_prompt(healer_id: str, user_input: str, conversation_history: List[ChatMessage], rag_context: Optional[str] = None) -> List[dict]:
    """
    Build the prompt for GPT-4o API call.
    
    This function combines:
    1. Healer system prompt (persona instructions)
    2. Safety guidelines
    3. RAG context (if available)
    4. Conversation history
    5. Current user input
    """
    
    # Get healer prompt
    healer_prompt_data = healer_prompts.get(healer_id)
    if not healer_prompt_data:
        raise ValueError(f"Unknown healer_id: {healer_id}. Valid IDs: {list(healer_prompts.keys())}")
    
    # Build system message with healer persona + safety guidelines
    system_content = f"{healer_prompt_data['system_prompt']}\n\n{safety_guidelines}"
    
    # If RAG context is provided, add it to the system message
    if rag_context:
        system_content += f"\n\nRELEVANT PSYCHOLOGICAL CONTEXT:\n{rag_context}\n\nUse this context to inform your response, but maintain your persona and natural conversation flow."
    
    messages = [
        {"role": "system", "content": system_content}
    ]
    
    # Add conversation history (excluding the system message)
    for msg in conversation_history:
        messages.append({
            "role": msg.role,
            "content": msg.content
        })
    
    # Add current user input
    messages.append({
        "role": "user",
        "content": user_input
    })
    
    return messages


def call_gpt4o(messages: List[dict]) -> str:
    """
    Call GPT-4o API to generate response.
    
    Requires OPENAI_API_KEY environment variable to be set.
    """
    try:
        from openai import OpenAI
    except ImportError:
        raise RuntimeError("OpenAI library is not installed. Run: pip install openai")
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable is not set")
    
    try:
        client = OpenAI(api_key=api_key)
        
        print(f"Calling GPT-4o with {len(messages)} messages...")
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.7,
            max_tokens=500,
        )
        
        if not response.choices or not response.choices[0].message.content:
            raise ValueError("Empty response from GPT-4o")
        
        return response.choices[0].message.content.strip()
    
    except Exception as e:
        error_msg = f"Error calling GPT-4o: {str(e)}"
        print(f"GPT-4o API error: {error_msg}")
        import traceback
        print(traceback.format_exc())
        raise RuntimeError(error_msg)


# ==================== API Endpoints ====================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "NightWhisper API"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint.
    
    Receives:
    - healerId: Which healer persona to use
    - userInput: Current user message
    - conversationHistory: Previous messages in the conversation
    - ragContext: Retrieved context from RAG system (optional)
    
    Returns:
    - message: Healer's response
    """
    try:
        print(f"Received chat request: healerId={request.healerId}, userInput={request.userInput[:50]}...")
        
        # Build prompt with all components
        messages = build_prompt(
            healer_id=request.healerId,
            user_input=request.userInput,
            conversation_history=request.conversationHistory,
            rag_context=request.ragContext
        )
        
        print(f"Built prompt with {len(messages)} messages")
        
        # Call GPT-4o
        response_text = call_gpt4o(messages)
        
        print(f"Got response from GPT-4o: {response_text[:50]}...")
        
        return ChatResponse(message=response_text)
    
    except ValueError as e:
        print(f"ValueError: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error in chat endpoint: {e}")
        print(f"Traceback: {error_trace}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.post("/api/rag/retrieve", response_model=RAGRetrievalResponse)
async def retrieve_rag(request: RAGRetrievalRequest):
    """
    RAG retrieval endpoint.
    
    Retrieves relevant context chunks from the knowledge base based on user query.
    
    Receives:
    - query: User's query to search for
    - topK: Number of chunks to retrieve (default: 3)
    
    Returns:
    - chunks: List of retrieved text chunks
    """
    try:
        # Import retriever (lazy import to avoid errors if RAG not set up)
        try:
            from rag.retriever import retrieve_context, is_available
        except ImportError as e:
            return RAGRetrievalResponse(
                chunks=[],
                error=f"RAG module not available: {str(e)}. Please install RAG dependencies."
            )
        
        # Check if RAG is available
        if not is_available():
            return RAGRetrievalResponse(
                chunks=[],
                error="RAG knowledge base not found. Please run 'python -m rag.build_kb' to build the knowledge base."
            )
        
        # Retrieve context
        top_k = request.topK or 3
        chunks = retrieve_context(request.query, top_k=top_k)
        
        print(f"RAG retrieval: query='{request.query[:50]}...', retrieved {len(chunks)} chunks")
        
        return RAGRetrievalResponse(chunks=chunks)
    
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error in RAG retrieval: {e}")
        print(f"Traceback: {error_trace}")
        return RAGRetrievalResponse(
            chunks=[],
            error=f"RAG retrieval error: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


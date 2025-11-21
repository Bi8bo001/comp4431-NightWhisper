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
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import List, Optional
import os
from dotenv import load_dotenv
import asyncio
from pathlib import Path

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

# Import TTS service (optional, will fail gracefully if not available)
try:
    from tts.cosyvoice_service import get_tts_service
    TTS_AVAILABLE = True
except ImportError as e:
    print(f"TTS module not available: {e}. TTS functionality will be disabled.")
    TTS_AVAILABLE = False

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


class TTSRequest(BaseModel):
    text: str
    healerId: str
    
    class Config:
        populate_by_name = True


class TTSResponse(BaseModel):
    audioUrl: Optional[str] = None
    error: Optional[str] = None
    status: str  # 'generating', 'ready', 'error'


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


@app.post("/api/tts/generate", response_model=TTSResponse)
async def generate_tts(request: TTSRequest):
    """
    TTS generation endpoint.
    
    Generates speech audio for the given text using the healer's voice clone.
    
    Receives:
    - text: Text to synthesize
    - healerId: ID of the healer (milo, leo, luna, max)
    
    Returns:
    - audioUrl: URL to the generated audio file (relative path)
    - status: 'generating', 'ready', or 'error'
    """
    if not TTS_AVAILABLE:
        return TTSResponse(
            audioUrl=None,
            error="TTS service is not available. Please ensure CosyVoice is properly set up.",
            status="error"
        )
    
    try:
        print(f"Received TTS request: healerId={request.healerId}, text={request.text[:50]}...")
        
        # Run TTS generation in a thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        tts_service = get_tts_service()
        
        # Generate audio file
        success, output_path = await loop.run_in_executor(
            None,
            tts_service.generate_speech,
            request.text,
            request.healerId
        )
        
        if success and output_path:
            # Convert absolute path to relative URL for frontend
            # The file will be served from the backend's static files
            audio_filename = Path(output_path).name
            audio_url = f"/api/tts/audio/{audio_filename}"
            
            print(f"TTS generation successful: {audio_url}")
            return TTSResponse(
                audioUrl=audio_url,
                status="ready"
            )
        else:
            return TTSResponse(
                audioUrl=None,
                error="Failed to generate speech audio.",
                status="error"
            )
    
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error in TTS generation: {e}")
        print(f"Traceback: {error_trace}")
        return TTSResponse(
            audioUrl=None,
            error=f"TTS generation error: {str(e)}",
            status="error"
        )


@app.get("/api/tts/audio/{filename}")
async def get_audio_file(filename: str):
    """
    Serve generated audio files.
    
    This endpoint serves the generated TTS audio files to the frontend.
    """
    import tempfile
    temp_dir = Path(tempfile.gettempdir())
    audio_path = temp_dir / filename
    
    if not audio_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    return FileResponse(
        path=str(audio_path),
        media_type="audio/wav",
        filename=filename
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


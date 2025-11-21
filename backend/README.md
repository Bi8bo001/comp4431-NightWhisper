# NightWhisper Backend

Backend API server for NightWhisper emotional support platform.

## Setup

1. **Activate conda environment:**
```bash
conda activate nightwhisper
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Set up environment variables:**
Create `.env` file in `backend/` directory:
```bash
OPENAI_API_KEY=your_api_key_here
```

4. **Build RAG knowledge base (optional but recommended):**
```bash
python -m rag.build_kb
```
This downloads mental health datasets and builds the vector store. Takes 30-60 minutes.

5. **Run the server:**
```bash
./start_server.sh
```

Or manually:
```bash
python api/server.py
```

## API Endpoints

### Health Check
```
GET /health
```

### Chat
```
POST /api/chat
Body: {
  "healer_id": "milo",
  "user_input": "I'm feeling anxious",
  "conversation_history": [...],
  "rag_context": "..." (optional)
}
```

### RAG Retrieval
```
POST /api/rag/retrieve
Body: {
  "query": "anxiety management",
  "topK": 3
}
Response: {
  "chunks": ["...", "..."],
  "error": null
}
```

## Project Structure

```
backend/
├── api/
│   └── server.py          # FastAPI server
├── prompts/
│   └── healers.py         # Healer persona prompts
├── rag/                   # RAG implementation
│   ├── __init__.py
│   ├── build_kb.py        # Knowledge base builder
│   ├── retriever.py       # Retrieval functionality
│   ├── vector_store/      # Chroma database (created after build)
│   └── README.md         # RAG documentation
├── requirements.txt
├── start_server.sh        # Server startup script
└── README.md
```

## Prompt Engineering

All healer prompts are defined in `prompts/healers.py`. You can modify:
- System prompts for each healer
- Personality traits
- Communication styles
- Therapeutic approaches

The prompts are automatically combined with:
- User input
- Conversation history
- RAG context (when available)
- Safety guidelines

## RAG System

The RAG (Retrieval-Augmented Generation) system enhances healer responses with relevant context from mental health counseling datasets.

**To use RAG:**
1. Build the knowledge base: `python -m rag.build_kb`
2. RAG is automatically used when frontend calls `/api/rag/retrieve`
3. Retrieved context is injected into GPT-4o prompts

See `rag/README.md` for detailed documentation.

## Next Steps

1. ✅ RAG retrieval system (implemented)
2. ✅ Vector database integration (Chroma)
3. ✅ Embedding models (HuggingFace sentence-transformers)
4. Add TTS integration (optional)


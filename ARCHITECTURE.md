# NightWhisper Architecture

## Project Structure

```
project-code/
├── src/                          # Frontend (React + TypeScript)
│   ├── api/                      # API client layer
│   │   ├── client.ts            # API client functions
│   │   └── types.ts             # API type definitions
│   ├── components/              # React components
│   │   ├── LandingScreen.tsx
│   │   ├── AvatarSelectionScreen.tsx
│   │   ├── HealerSelectionScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   └── AnimatedBackground.tsx
│   ├── services/                # Business logic layer
│   │   └── chatService.ts       # Chat service (handles RAG + API calls)
│   ├── prompts/                 # Frontend prompt definitions (for reference)
│   │   └── healers.ts           # Healer persona prompts
│   ├── data/
│   │   └── healers.ts           # Healer data
│   └── types.ts                 # TypeScript types
│
├── backend/                      # Backend (Python + FastAPI)
│   ├── api/
│   │   └── server.py            # FastAPI server
│   ├── prompts/
│   │   └── healers.py           # Healer persona prompts (EDIT HERE)
│   ├── rag/                     # RAG implementation (to be added)
│   │   ├── build_kb.py
│   │   └── vector_store/
│   ├── requirements.txt
│   └── README.md
│
└── public/                       # Static assets
    ├── avatar/
    └── fig/
```

## API Integration Flow

### 1. User sends message
```
ChatScreen.tsx 
  → chatService.getChatResponse()
    → api.client.retrieveRAGContext() (optional)
    → api.client.sendChatMessage()
      → POST /api/chat
```

### 2. Backend processes request
```
FastAPI /api/chat endpoint
  → build_prompt() (combines all components)
    → call_gpt4o()
      → Returns response
```

### 3. Prompt Engineering

Each request combines:
1. **Healer System Prompt** (`backend/prompts/healers.py`)
   - Personality traits
   - Communication style
   - Therapeutic approach
   
2. **Safety Guidelines** (included in system prompt)

3. **RAG Context** (optional, from RAG retrieval)
   - Retrieved psychological knowledge chunks
   - Injected into system prompt

4. **Conversation History**
   - Previous messages in the conversation
   - Maintains context across turns

5. **Current User Input**
   - Latest user message

## How to Modify Prompts

### Edit Healer Prompts

**File:** `backend/prompts/healers.py`

Each healer has:
- `system_prompt`: The main persona definition
- `user_context`: Context about why user chose this healer

Modify these to change how each healer responds.

### Prompt Structure

The final prompt sent to GPT-4o looks like:

```
System Message:
{healer.system_prompt}

{safety_guidelines}

RELEVANT PSYCHOLOGICAL CONTEXT:
{rag_context}  (if available)

Conversation History:
{previous messages}

User Input:
{current user message}
```

## RAG Integration (To Be Implemented)

When RAG is ready:

1. Implement `backend/rag/build_kb.py` to build knowledge base
2. Implement retrieval in `backend/api/server.py` → `retrieve_rag()`
3. The RAG context will automatically be included in prompts

## Environment Variables

### Frontend
Create `.env` file:
```
VITE_API_BASE_URL=http://localhost:8000
```

### Backend
Create `backend/.env` file:
```
OPENAI_API_KEY=your_key_here
```

## Running the Project

### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
python api/server.py
```

## API Endpoints

### POST /api/chat
Request:
```json
{
  "healer_id": "milo",
  "user_input": "I'm feeling anxious",
  "conversation_history": [
    {"role": "assistant", "content": "Hello..."},
    {"role": "user", "content": "Hi"}
  ],
  "rag_context": "..." (optional)
}
```

Response:
```json
{
  "message": "I'm here with you. Could you tell me more...",
  "error": null
}
```

### POST /api/rag/retrieve
Request:
```json
{
  "query": "anxiety management",
  "top_k": 3
}
```

Response:
```json
{
  "chunks": ["chunk1", "chunk2", "chunk3"],
  "error": null
}
```

## Next Steps

1. ✅ API structure created
2. ✅ Prompt engineering framework ready
3. ✅ Frontend integrated with API
4. ⏳ Implement RAG retrieval
5. ⏳ Add vector database
6. ⏳ Test end-to-end flow


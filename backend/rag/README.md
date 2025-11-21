# RAG (Retrieval-Augmented Generation) Module

This module implements RAG functionality to enhance healer responses with relevant context from mental health counseling datasets.

## Overview

The RAG system:
1. Loads mental health datasets from HuggingFace
2. Chunks and embeds the content
3. Stores in a vector database (Chroma)
4. Retrieves relevant chunks based on user queries
5. Injects retrieved context into GPT-4o prompts

## Setup

### 1. Install Dependencies

Make sure you have all RAG dependencies installed:

```bash
cd backend
conda activate nightwhisper
pip install -r requirements.txt
```

### 2. Build Knowledge Base

Run the knowledge base builder to download datasets, process them, and create the vector store:

```bash
cd backend
python -m rag.build_kb
```

This will:
- Download 9 mental health datasets from HuggingFace
- Extract and clean text content
- Chunk documents (size: 1200 chars, overlap: 150 chars)
- Create embeddings using `sentence-transformers/all-MiniLM-L6-v2`
- Store in `backend/rag/vector_store/`

**Note:** This process may take 30-60 minutes depending on your internet connection and dataset sizes.

### 3. Verify Setup

Check if the vector store was created:

```bash
ls -la backend/rag/vector_store/
```

You should see Chroma database files.

## Usage

### Automatic Usage

Once the knowledge base is built, RAG is automatically used when:
1. Frontend calls `/api/rag/retrieve` with user input
2. Retrieved chunks are passed to `/api/chat` as `ragContext`
3. GPT-4o uses the context to inform its responses

### Manual Testing

Test retrieval directly:

```python
from rag.retriever import retrieve_context

chunks = retrieve_context("I'm feeling anxious about exams", top_k=3)
for i, chunk in enumerate(chunks):
    print(f"Chunk {i+1}: {chunk[:200]}...")
```

## Architecture

```
backend/rag/
├── __init__.py          # Module initialization
├── build_kb.py          # Knowledge base builder script
├── retriever.py         # Retrieval functionality
├── vector_store/        # Chroma database (created after build)
└── README.md           # This file
```

## Datasets Used

The knowledge base includes:
- `mrs83/kurtis_mental_health_final`
- `samhog/psychology-RLHF`
- `Felladrin/pretrain-mental-health-counseling-conversations`
- `LuangMV97/Empathetic_counseling_Dataset`
- `tolu07/Mental_Health_FAQ`
- `thu-coai/augesc`
- `nbertagnolli/counsel-chat`
- `Amod/mental_health_counseling_conversations`
- `ZahrizhalAli/mental_health_conversational_dataset`

## How RAG Context is Used

1. **User sends message** → Frontend calls `/api/rag/retrieve`
2. **Retrieval** → System finds top-k relevant chunks from vector store
3. **Context injection** → Chunks are added to system prompt as "RELEVANT PSYCHOLOGICAL CONTEXT"
4. **GPT-4o response** → Model uses context to inform response while maintaining healer persona

## Notes

- The first retrieval loads the vector store into memory (~1-2 seconds). Subsequent retrievals are fast.
- If building the knowledge base causes memory issues, you can reduce the number of datasets in `build_kb.py` or use a smaller embedding model.


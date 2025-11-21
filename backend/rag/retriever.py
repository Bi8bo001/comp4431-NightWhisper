"""
RAG Retriever

This module provides retrieval functionality for the RAG system.
It loads the pre-built vector store and retrieves relevant chunks for queries.
"""

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from pathlib import Path
import os

# Vector store directory
VECTOR_STORE_DIR = Path(__file__).parent / "vector_store"

# Global retriever instance (lazy loaded)
_retriever = None
_vectorstore = None


def get_retriever(k: int = 5):
    """
    Get or create the retriever instance.
    
    Args:
        k: Number of chunks to retrieve (default: 5)
    
    Returns:
        Retriever instance
    """
    global _retriever, _vectorstore
    
    # Check if vector store exists
    if not VECTOR_STORE_DIR.exists() or not any(VECTOR_STORE_DIR.iterdir()):
        raise FileNotFoundError(
            f"Vector store not found at {VECTOR_STORE_DIR}. "
            "Please run 'python -m rag.build_kb' first to build the knowledge base."
        )
    
    # Lazy load vector store and retriever
    if _vectorstore is None:
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        
        _vectorstore = Chroma(
            persist_directory=str(VECTOR_STORE_DIR),
            embedding_function=embeddings
        )
        
        print(f"Loaded vector store from {VECTOR_STORE_DIR}")
    
    # Create retriever with search parameters
    _retriever = _vectorstore.as_retriever(
        search_kwargs={"k": k}
    )
    
    return _retriever


def retrieve_context(query: str, top_k: int = 5) -> list[str]:
    """
    Retrieve relevant context chunks for a query.
    
    Args:
        query: User's query string
        top_k: Number of chunks to retrieve
    
    Returns:
        List of retrieved text chunks
    """
    try:
        retriever = get_retriever(k=top_k)
        documents = retriever.invoke(query)
        
        # Extract text content from documents
        chunks = [doc.page_content for doc in documents]
        
        return chunks
    
    except FileNotFoundError as e:
        print(f"Warning: {e}")
        return []
    except Exception as e:
        print(f"Error retrieving context: {e}")
        return []


def is_available() -> bool:
    """Check if RAG system is available (vector store exists)."""
    return VECTOR_STORE_DIR.exists() and any(VECTOR_STORE_DIR.iterdir())


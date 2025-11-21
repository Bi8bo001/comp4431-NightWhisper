"""
Knowledge Base Builder

This script builds a vector database from HuggingFace mental health datasets.
Run this once to build the knowledge base, then use retriever.py for queries.

Usage:
    python -m rag.build_kb
"""

from datasets import load_dataset
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
import statistics
import random
import os
from pathlib import Path

# HuggingFace datasets for mental health counseling
HF_DATASETS = [
    "mrs83/kurtis_mental_health_final",
    "samhog/psychology-RLHF",
    "Felladrin/pretrain-mental-health-counseling-conversations",
    "LuangMV97/Empathetic_counseling_Dataset",
    "tolu07/Mental_Health_FAQ",
    "thu-coai/augesc",
    "nbertagnolli/counsel-chat",
    "Amod/mental_health_counseling_conversations",
    "ZahrizhalAli/mental_health_conversational_dataset",
]

# Vector store directory
VECTOR_STORE_DIR = Path(__file__).parent / "vector_store"


def load_and_extract_texts():
    """Load datasets from HuggingFace and extract text content."""
    all_texts = []
    text_lengths = []
    
    for name in HF_DATASETS:
        try:
            print(f"Loading {name}...")
            ds = load_dataset(name, split="train", streaming=True)
            
            count = 0
            for example in ds:
                # Extract all string values from the example
                text_parts = [
                    str(value) 
                    for value in example.values() 
                    if isinstance(value, str) and value.strip()
                ]
                text = "\n".join(text_parts)
                
                # Filter out very short texts
                if len(text) > 50:
                    all_texts.append(text.strip())
                    text_lengths.append(len(text))
                
                count += 1
                if count % 1000 == 0:
                    print(f"  Extracted {count} texts...")
            
            print(f"  Completed {name}, total texts: {len(all_texts)}")
            
        except Exception as e:
            print(f"  Error loading {name}: {e}")
            continue
    
    # Statistics
    if text_lengths:
        avg_length = statistics.mean(text_lengths)
        max_length = max(text_lengths)
        print(f"\nTotal texts: {len(all_texts)}")
        print(f"Average length: {avg_length:.2f} chars")
        print(f"Max length: {max_length} chars")
        if all_texts:
            print(f"Sample text: {all_texts[0][:200]}...")
    
    # Deduplicate
    all_texts = list(set(all_texts))
    print(f"Deduplicated texts: {len(all_texts)}")
    
    return all_texts


def chunk_documents(texts):
    """Split texts into chunks for embedding."""
    documents = [
        Document(page_content=text, metadata={"source": "hf_datasets"}) 
        for text in texts
    ]
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1200,
        chunk_overlap=150,
        length_function=len,
        separators=["\n\n", "\nQuestion:", "\nAnswer:", "\n", ".", " ", ""]
    )
    
    chunks = text_splitter.split_documents(documents)
    
    # Statistics
    chunk_lengths = [len(chunk.page_content) for chunk in chunks]
    if chunk_lengths:
        avg_chunk = statistics.mean(chunk_lengths)
        max_chunk = max(chunk_lengths)
        stdev = statistics.stdev(chunk_lengths) if len(chunk_lengths) > 1 else 0
        
        print(f"\nChunk statistics:")
        print(f"  Total chunks: {len(chunks)}")
        print(f"  Average chunk size: {avg_chunk:.2f} chars ({(avg_chunk / 1200) * 100:.1f}% of target)")
        print(f"  Max chunk size: {max_chunk}")
        print(f"  Standard deviation: {stdev:.2f}")
        
        # Show random samples
        random_indices = random.sample(range(len(chunks)), min(5, len(chunks)))
        print(f"\nSample chunks:")
        for i in sorted(random_indices):
            print(f"\n  Chunk {i} (size {len(chunks[i].page_content)}):")
            print(f"  {chunks[i].page_content[:300]}...")
    
    return chunks


def build_vector_store(chunks):
    """Create embeddings and store in Chroma vector database."""
    print(f"\nCreating embeddings and vector store...")
    print(f"Total chunks to process: {len(chunks)}")
    
    # Use HuggingFace embeddings (lightweight, no API key needed)
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    
    # Create vector store directory
    VECTOR_STORE_DIR.mkdir(parents=True, exist_ok=True)
    
    # Chroma has a batch size limit, so we need to insert in batches
    # Use a safe batch size (5000 is well below the limit)
    batch_size = 5000
    total_batches = (len(chunks) + batch_size - 1) // batch_size
    
    print(f"Inserting {len(chunks)} chunks in {total_batches} batches (batch size: {batch_size})...")
    
    # Initialize vector store with first batch
    first_batch = chunks[:batch_size]
    vectorstore = Chroma.from_documents(
        documents=first_batch,
        embedding=embeddings,
        persist_directory=str(VECTOR_STORE_DIR)
    )
    
    # Add remaining batches
    for i in range(1, total_batches):
        start_idx = i * batch_size
        end_idx = min((i + 1) * batch_size, len(chunks))
        batch = chunks[start_idx:end_idx]
        
        print(f"  Processing batch {i+1}/{total_batches} (chunks {start_idx}-{end_idx-1})...")
        vectorstore.add_documents(batch)
    
    # Persist the final vector store
    # Note: Chroma 0.4.x+ automatically persists, but we call it for older versions
    try:
        vectorstore.persist()
    except AttributeError:
        # Chroma 0.4.x+ doesn't have persist() method (auto-persists)
        pass
    
    print(f"Vector store saved to: {VECTOR_STORE_DIR}")
    print(f"Total documents in vector store: {len(chunks)}")
    
    return vectorstore


def main():
    """Main function to build knowledge base."""
    print("=" * 60)
    print("Building NightWhisper Knowledge Base")
    print("=" * 60)
    
    # Step 1: Load and extract texts
    print("\n[Step 1] Loading datasets from HuggingFace...")
    texts = load_and_extract_texts()
    
    if not texts:
        print("Error: No texts extracted. Exiting.")
        return
    
    # Step 2: Chunk documents
    print("\n[Step 2] Chunking documents...")
    chunks = chunk_documents(texts)
    
    if not chunks:
        print("Error: No chunks created. Exiting.")
        return
    
    # Step 3: Build vector store
    print("\n[Step 3] Building vector store...")
    vectorstore = build_vector_store(chunks)
    
    print("\n" + "=" * 60)
    print("Knowledge base build complete!")
    print("=" * 60)
    print(f"\nVector store location: {VECTOR_STORE_DIR}")
    print("You can now use the retriever to query the knowledge base.")


if __name__ == "__main__":
    main()


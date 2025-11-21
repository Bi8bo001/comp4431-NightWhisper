
# ✅ **NightWhisper — Project Technical Documentation**

*(Markdown version, ready for Cursor and GitHub)*

---

# **NightWhisper: Technical Architecture & Implementation Guide**

NightWhisper is an LLM-driven, psychology-guided emotional support platform designed to offer personalized, instant nighttime companionship. This document describes the project architecture, core components, API integration, and system workflow—allowing smooth implementation across both frontend and backend modules.

---

# ## **1. System Overview**

NightWhisper integrates:

* **GPT-4o API** for empathetic dialogue
* **RAG pipeline** to ground responses in psychological knowledge
* **Prompt-Engineered animal personas** as therapeutic “healers”
* **User avatar selection**
* **2D character generation** (DALL·E assets provided)
* **TTS output** with persona-specific voices
* **A calm, immersive web UI**

The overall architecture directly corresponds to the diagram in the proposal’s appendix (PDF page 3) .

---

# ## **2. System Architecture (Aligned with Proposal)**

### **2.1 High-Level Pipeline**

```
User → Choose User Avatar → Choose Animal Healer →
User Input → RAG Retrieval → Prompt Engineering →
GPT-4o Response → TTS Voice Output → Chat Interface
```

### **2.2 Modules (mirrors the figure in the Appendix)**

1. **Knowledge Base**

   * *Sources:*

     * Therapy Literature
     * Mental Health QA datasets
   * *Processing:* Cleaning → Chunking → Embedding
   * *Usage:* Retrieval for top-k relevant chunks

2. **RAG Retrieval Layer**

   * Embeddings via LangChain
   * FAISS / Chroma vector search
   * Returns top-k psychological snippets

3. **Prompt Engineering**

   * Inject:

     * user input
     * retrieved psychological guidance
     * selected healer persona

4. **LLM Module**

   * GPT-4o via OpenAI API
   * Generates empathetic, context-aware responses

5. **Text-to-Speech**

   * Persona-specific voices
   * Output both text + audio

6. **Frontend UI**

   * Landing page
   * User avatar selection page
   * Healer selection page
   * Chat interface (multimodal)

---

# ## **3. UI Flow (for Frontend Implementation)**

### ✔ **Page 1 — Landing Page (“Welcome to NightWhisper”)**

* Background: soft, night-themed illustration
* Text: gentle introduction, short message
* Animated floating bubbles/stars
* Button: **GET STARTED**

---

### ✔ **Page 2 — User Avatar Selection (NEW PAGE YOU REQUESTED)**

A carousel / horizontal scroll wheel showing:

#### **Avatar Styles**

* *Anime Style (Soft Anime)*
* *Minimal Vector Style (Flat Illustrations)*

#### **User selects:**

* Avatar style
* Avatar gender
* Avatar character (male1.png, female3.png… etc.)

**Output:** store `userAvatarPath` for chat UI.

---

### ✔ **Page 3 — Healer Selection**

Using your 4 animal healers:

| Healer            | Personality   | Description                       |
| ----------------- | ------------- | --------------------------------- |
| **Milo (Rabbit)** | Gentleness    | Soft, comforting, nurturing       |
| **Leo (Owl)**     | Reflection    | Analytical, grounding, structured |
| **Luna (Deer)**   | Calmness      | Peaceful, stabilizing, soothing   |
| **Max (Dog)**     | Encouragement | Bright, hopeful, uplifting        |

Each selection card includes:

* 2D avatar (from DALL·E set)
* Title + one-word keyword
* Short emotional description

**User chooses one → store healer persona.**

---

### ✔ **Page 4 — Chat Interface**

* Background: night or forest/pastel landscape
* Top-left: healer avatar + name
* Top-right: “NightWhisper”
* Dialogue bubbles (healer + user)
* Input box: “Share what’s on your mind tonight…”
* Voice output: play icon for TTS audio

---

# ## **4. Backend Logic**

### ### **4.1 RAG Pipeline (LangChain)**

```
1. Load raw psychological resources  
2. Clean and chunk text (RecursiveCharacterTextSplitter)  
3. Embed chunks using sentence-transformers / OpenAI embeddings  
4. Store in FAISS / Chroma vector DB  
5. At runtime:
      - Embed user query
      - Retrieve top-k related psychological snippets
      - Pass into prompt engineering
```

Matches proposal section “Cleaning & Chunking & Embedding” + “Retrieval (Top-k Search)” on PDF page 3. 

---

### ### **4.2 Prompt Engineering**

Prompt template must inject:

* User input
* Retrieved top-k psychological chunks
* Healer persona characteristics (tone, style, behaviors)
* Safety guidelines
* Response format (text + optional TTS cues)

---

### ### **4.3 GPT-4o Interaction**

Endpoint:

```ts
POST https://api.openai.com/v1/chat/completions
```

Model:

```
gpt-4o
```

Includes structured messages:

```json
[
  { "role": "system", "content": "You are Milo, a gentle emotional healer..." },
  { "role": "user", "content": "<user input>" },
  { "role": "assistant", "content": "<rag snippets for grounding>" }
]
```

---

# ## **5. Project Folder Structure (Recommended)**

```
project-root/
│
├── frontend/
│   ├── pages/
│   │   ├── landing/
│   │   ├── avatar-select/
│   │   ├── healer-select/
│   │   └── chat/
│   ├── public/
│   │   ├── avatars/
│   │   │   ├── anime/
│   │   │   └── vector/
│   │   └── healers/
│   └── components/
│
├── backend/
│   ├── rag/
│   │   ├── build_kb.py
│   │   ├── vector_store/
│   │   └── embeddings/
│   ├── prompts/
│   ├── tts/
│   ├── llm/
│   └── server.py
│
└── README.md
```

---

# ## **6. API Integration Summary**

### **GPT-4o**

Used for dialogue generation.

### **Embedding Model**

OpenAI / Sentence-Transformers for RAG.

### **TTS**

Either:

* OpenAI TTS
* ElevenLabs
* Or custom TTS (e.g., via ComfyUI as per proposal)

### **Vector DB**

FAISS or ChromaDB.

### **DALL·E Images**

Pre-generated and stored under `/public/healers/`.

---

# ## **7. Mapping Implementation → Proposal**

Your proposal’s architecture (Figure A1) contains:

* Knowledge base (therapy literature, QA datasets)
* Chunking & embedding
* Top-k retrieval
* Prompt engineering
* Healer selection
* GPT-4o
* TTS
* UI

This documentation reproduces EXACTLY the same elements in real implementable form.
(Reference: Proposal PDF pages 1–3) 

---

# ## **8. Setup Instructions (for README)**

### **Backend**

```
pip install openai langchain chromadb faiss-cpu fastapi uvicorn python-dotenv
```

Run:

```
python backend/server.py
```

### **Frontend**

```
npm install
npm run dev
```

---

# ## **9. What Cursor Should Do Based on This Document**

* Generate the entire multi-page UI using the described flow
* Implement avatar selection page (new!)
* Connect UI → backend
* Implement RAG retrieval pipeline
* Build prompt templates for all four healers
* Add TTS audio playback in chat
* Store and propagate both user avatar + healer persona
* Ensure emotional tone + safety compliance

---

# ## **10. END OF DOCUMENT**

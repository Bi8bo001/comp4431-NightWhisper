# Prompt Modification Guide

## ⚠️ Important: Where to Edit Prompts

**To modify healer prompts, edit: `backend/prompts/healers.py`**

This is the **ACTIVE** file used by the backend API. All changes to healer personalities, communication styles, and therapeutic approaches should be made here.

## File Locations

### Active Prompt File (Edit This)
- **Location**: `backend/prompts/healers.py`
- **Used by**: Backend API server (`backend/api/server.py`)
- **Purpose**: Defines actual prompts sent to GPT-4o

### Reference File (Do Not Edit)
- **Location**: `src/prompts/healers.ts`
- **Used by**: None (for reference only)
- **Purpose**: Frontend developers can see prompt structure, but this file is NOT used by the API

## How Prompts Work

1. **System Prompt**: Defines the healer's persona, personality, and communication style
2. **Safety Guidelines**: Applied to all healers automatically
3. **RAG Context**: Added when RAG is implemented (optional)
4. **Conversation History**: Maintained across multiple messages
5. **User Input**: Current message from the user

All components are combined in `backend/api/server.py` in the `build_prompt()` function.

## Editing Prompts

Simply edit `backend/prompts/healers.py` and restart the backend server:

```bash
cd backend
./start_server.sh
```

Changes take effect immediately after server restart.


"""
Script to pre-generate TTS audio for chat greeting messages.

This script generates audio files for the first greeting message that appears
when a user starts chatting with each healer.

Usage:
    cd backend
    conda activate nightwhisper
    python scripts/generate_chat_greeting_audio.py
"""

import sys
import os
from pathlib import Path

# Add backend to path
BACKEND_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from tts.cosyvoice_service import get_tts_service

# Chat greeting messages for each healer (these appear as the first message in chat)
CHAT_GREETINGS = {
    'milo': "Hello, I'm Milo. Warm and patient, Milo brings a quiet, nurturing presence and a soft place for you to feel heard and held. I'll stay with you while you talk.",
    'leo': "Hello, I'm Leo. Calm and analytical, Leo brings logic, perspective, and structured thinking to help untangle complex thoughts. I'll stay with you while you talk.",
    'luna': "Hello, I'm Luna. Gentle and present, Luna brings a sense of peace, deep listening, and a safe space for your emotions to settle. I'll stay with you while you talk.",
    'max': "Hello, I'm Max. Bright and upbeat, Max brings lightness, hope, and small sparks of motivation to lift your spirits. I'll stay with you while you talk.",
}

def main():
    print("=" * 60)
    print("Chat Greeting Audio Generator")
    print("=" * 60)
    print()
    print("This script will generate TTS audio for the first greeting message")
    print("that appears when users start chatting with each healer.")
    print("This may take 3-5 minutes per message on CPU, 3-10 seconds on GPU.")
    print()
    
    # Initialize TTS service
    print("Initializing TTS service...")
    tts_service = get_tts_service()
    if not tts_service.initialize():
        print("ERROR: Failed to initialize TTS service")
        return 1
    
    print("✓ TTS service initialized")
    print()
    
    # Create output directory (both backend/public and project root public)
    backend_output_dir = BACKEND_DIR / "public" / "tts_audio"
    backend_output_dir.mkdir(parents=True, exist_ok=True)
    
    # Also create in project root public directory
    project_root = BACKEND_DIR.parent
    frontend_output_dir = project_root / "public" / "tts_audio"
    frontend_output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Output directories:")
    print(f"  Backend: {backend_output_dir}")
    print(f"  Frontend: {frontend_output_dir}")
    print()
    
    total_healers = len(CHAT_GREETINGS)
    current = 0
    
    # Generate audio for each healer's greeting
    for healer_id, greeting_text in CHAT_GREETINGS.items():
        current += 1
        print(f"[{current}/{total_healers}] Generating greeting audio for {healer_id}...")
        print(f"  Text: {greeting_text[:80]}...")
        
        # Use a specific filename for chat greetings to distinguish from voice mailbox
        filename = f"{healer_id}_chat_greeting.wav"
        backend_output_path = backend_output_dir / filename
        frontend_output_path = frontend_output_dir / filename
        
        # Skip if already exists in both locations
        if backend_output_path.exists() and frontend_output_path.exists():
            print(f"    ✓ Already exists, skipping: {filename}")
            continue
        
        # Generate to backend directory first
        success, generated_path = tts_service.generate_speech(
            text=greeting_text,
            healer_id=healer_id,
            output_path=str(backend_output_path)
        )
        
        if success:
            # Copy to frontend directory
            import shutil
            shutil.copy2(backend_output_path, frontend_output_path)
            print(f"    ✓ Generated: {backend_output_path}")
            print(f"      Copied to: {frontend_output_path}")
        else:
            print(f"    ✗ Failed to generate")
    
    print()
    print("=" * 60)
    print("✓ All chat greeting audio files generated!")
    print("=" * 60)
    print()
    print("Audio files are saved in:")
    print(f"  Backend: {backend_output_dir}")
    print(f"  Frontend: {frontend_output_dir}")
    print()
    print("Files are ready to use! The chat interface will load them from:")
    print("  /tts_audio/{healer_id}_chat_greeting.wav")
    print()
    print("Note: You may need to update ChatScreen.tsx to use these pre-generated")
    print("files instead of generating them on-the-fly.")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())


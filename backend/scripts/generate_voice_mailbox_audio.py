"""
Script to pre-generate TTS audio for voice mailbox messages.

This script generates audio files for all voice mailbox messages so they can be
played instantly without waiting for TTS generation.

Usage:
    cd backend
    conda activate nightwhisper
    python scripts/generate_voice_mailbox_audio.py
"""

import sys
import os
from pathlib import Path

# Add backend to path
BACKEND_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from tts.cosyvoice_service import get_tts_service

# Voice mailbox messages for each healer - Expanded with more creative content
VOICE_MESSAGES = {
    'milo': [
        {
            'id': 'milo_greeting',
            'text': "You are doing better than you think. Even on difficult days, you are moving forward. Take a moment to breathe and remember that you are enough, just as you are.",
        },
        {
            'id': 'milo_sleep',
            'text': "Before you sleep, try this: write down three things that went well today, no matter how small. Gratitude helps calm the mind and prepares you for restful sleep.",
        },
        {
            'id': 'milo_comfort',
            'text': "When everything feels heavy, remember that feelings are temporary visitors. They come and go, but you remain. You are stronger than this moment, and gentler than you know.",
        },
        {
            'id': 'milo_selfcare',
            'text': "Self-care isn't selfish—it's necessary. Today, do one small thing just for you. A warm cup of tea, a few minutes of quiet, or simply allowing yourself to rest without guilt.",
        },
        {
            'id': 'milo_validation',
            'text': "Your feelings are valid, even when they're uncomfortable. You don't need to fix everything right now. Sometimes, just acknowledging how you feel is enough.",
        },
        {
            'id': 'milo_patience',
            'text': "Healing isn't linear. Some days will feel like steps backward, but they're part of the journey. Be patient with yourself. You're doing the best you can with what you have.",
        },
    ],
    'leo': [
        {
            'id': 'leo_greeting',
            'text': "When thoughts feel tangled, try stepping back. Sometimes the clearest answers come when we pause and observe our feelings without judgment. What patterns do you notice?",
        },
        {
            'id': 'leo_breathing',
            'text': "Take five deep breaths: inhale for four counts, hold for four, exhale for six. This simple practice can help center your thoughts and bring clarity to your day.",
        },
        {
            'id': 'leo_perspective',
            'text': "When you're stuck in a loop of worry, ask yourself: What would I tell a friend in this situation? Often, we're kinder to others than to ourselves. Apply that same kindness inward.",
        },
        {
            'id': 'leo_decision',
            'text': "Not every decision needs to be perfect. Sometimes, good enough is exactly that—good enough. Trust that you can adjust course if needed, and give yourself permission to choose.",
        },
        {
            'id': 'leo_clarity',
            'text': "Write down your thoughts, even if they feel messy. Putting words to feelings can help untangle them. You might discover patterns or solutions you hadn't seen before.",
        },
        {
            'id': 'leo_balance',
            'text': "Balance isn't about perfection—it's about noticing when you're leaning too far in one direction and gently adjusting. Today, check in with yourself: what do you need?",
        },
    ],
    'luna': [
        {
            'id': 'luna_greeting',
            'text': "In the quiet moments, you can hear your own voice most clearly. It's okay to slow down, to rest, to simply be. Your feelings are valid, and you deserve peace.",
        },
        {
            'id': 'luna_evening',
            'text': "As evening comes, let go of what you cannot control. Create a small ritual: perhaps a warm drink, soft music, or gentle stretching. Honor your need for rest.",
        },
        {
            'id': 'luna_presence',
            'text': "Right now, in this moment, you are safe. Your breath is steady, your heart is beating. Sometimes, the most powerful thing you can do is simply be present with yourself.",
        },
        {
            'id': 'luna_boundaries',
            'text': "Saying no is a complete sentence. You don't need to justify your boundaries. Protecting your energy isn't selfish—it's essential for your well-being.",
        },
        {
            'id': 'luna_nature',
            'text': "If you can, step outside for just a few minutes. Feel the air, notice the sky, listen to the sounds around you. Nature has a way of gently reminding us of our place in something larger.",
        },
        {
            'id': 'luna_acceptance',
            'text': "You don't have to be okay all the time. It's okay to not be okay. Allow yourself to feel what you feel, without trying to fix it or make it go away. Just let it be.",
        },
    ],
    'max': [
        {
            'id': 'max_greeting',
            'text': "Every step forward, no matter how small, is progress. You have strength you haven't even discovered yet. Keep going, and remember to celebrate your wins, big and small!",
        },
        {
            'id': 'max_energy',
            'text': "Feeling low on energy? Try these: get some sunlight, move your body even for just five minutes, connect with someone you care about, or do one thing that makes you smile.",
        },
        {
            'id': 'max_celebration',
            'text': "Did you do something today, even something tiny? That's worth celebrating! Progress isn't always visible, but it's happening. Give yourself credit for showing up.",
        },
        {
            'id': 'max_momentum',
            'text': "Sometimes the hardest part is just starting. Once you take that first small step, momentum builds. What's one tiny thing you can do right now that would feel good?",
        },
        {
            'id': 'max_connection',
            'text': "You're not alone in this. Reach out to someone—a friend, a family member, or even just a kind stranger. Connection is a powerful antidote to feeling stuck.",
        },
        {
            'id': 'max_hope',
            'text': "Tomorrow is a new day, full of possibilities. Even if today was hard, you made it through. That's something. And tomorrow, you'll have another chance to try again.",
        },
    ],
}

def main():
    print("=" * 60)
    print("Voice Mailbox Audio Generator")
    print("=" * 60)
    print()
    print("This script will generate TTS audio for all voice mailbox messages.")
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
    
    total_messages = sum(len(messages) for messages in VOICE_MESSAGES.values())
    current = 0
    
    # Generate audio for each message
    for healer_id, messages in VOICE_MESSAGES.items():
        print(f"Generating audio for {healer_id}...")
        for msg in messages:
            current += 1
            print(f"  [{current}/{total_messages}] {msg['id']}...")
            
            backend_output_path = backend_output_dir / f"{msg['id']}.wav"
            frontend_output_path = frontend_output_dir / f"{msg['id']}.wav"
            
            # Skip if already exists in both locations
            if backend_output_path.exists() and frontend_output_path.exists():
                print(f"    ✓ Already exists, skipping")
                continue
            
            # Generate to backend directory first
            success, generated_path = tts_service.generate_speech(
                text=msg['text'],
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
    print("✓ All audio files generated!")
    print("=" * 60)
    print()
    print("Audio files are saved in:")
    print(f"  Backend: {backend_output_dir}")
    print(f"  Frontend: {frontend_output_dir}")
    print()
    print("Files are ready to use! The frontend will load them from:")
    print("  /tts_audio/{message_id}.wav")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())


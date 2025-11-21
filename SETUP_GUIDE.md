# NightWhisper Setup and Run Guide

This guide explains how to set up and run the enhanced NightWhisper application with all new features.

## New Features Added

1. **Back Button**: Return to healer selection from chat interface
2. **Sidebar**: Three new features accessible from chat screen
   - 📅 Mood Calendar: Track daily mood with color-coded calendar
   - 📝 Diary: Write and save daily journal entries
   - 📬 Voice Mailbox: Receive daily messages from your healer with audio
3. **Optimized TTS**: Only first greeting message has audio (pre-generated), subsequent messages show button but don't generate audio

## Quick Start

### 1. Frontend Setup

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173`

### 2. Backend Setup

```bash
# Activate conda environment
conda activate nightwhisper

# Navigate to backend
cd backend

# Install dependencies (if not already done)
pip install -r requirements.txt

# Set up environment variables
echo "OPENAI_API_KEY=your_key_here" > .env

# Start server
./start_server.sh
```

Backend runs on `http://localhost:8000`

### 3. Pre-generate Voice Mailbox Audio (Optional but Recommended)

To enable instant playback of voice mailbox messages, pre-generate the audio files:

```bash
cd backend
conda activate nightwhisper
python scripts/generate_voice_mailbox_audio.py
```

**Note**: This takes 3-5 minutes per message on CPU (8 messages total = ~30-40 minutes). On GPU, it takes 3-10 seconds per message (~1 minute total).

The script will:
- Generate audio for all voice mailbox messages
- Save files to `backend/public/tts_audio/`
- Skip files that already exist

The script automatically saves files to both `backend/public/tts_audio/` and `public/tts_audio/`, so no manual copying is needed!

## Feature Details

### Mood Calendar

- **Location**: Left sidebar → 📅 Mood tab
- **Features**:
  - Monthly calendar view
  - Click any date to set mood (1-5 scale)
  - Color-coded: Red (worst) to Green (best)
  - Data saved in browser localStorage
  - Navigate between months with arrow buttons

### Diary

- **Location**: Left sidebar → 📝 Diary tab
- **Features**:
  - Write daily journal entries
  - Select any date to view/edit entries
  - View list of dates with entries
  - Data saved in browser localStorage
  - Auto-saves when you click "Save Entry"

### Voice Mailbox

- **Location**: Left sidebar → 📬 Mailbox tab
- **Features**:
  - Daily random message from your selected healer
  - Messages include encouragement, tips, and inspiration
  - Audio playback (if pre-generated)
  - Different messages each day
  - Category badges (💝 Encouragement, 💡 Daily Tips, ✨ Inspiration)

## File Structure

```
project-code/
├── src/
│   ├── components/
│   │   ├── ChatScreen.tsx          # Main chat (updated with sidebar & back button)
│   │   ├── Sidebar.tsx              # NEW: Sidebar component
│   │   ├── MoodCalendar.tsx        # NEW: Mood calendar component
│   │   ├── Diary.tsx                # NEW: Diary component
│   │   └── VoiceMailbox.tsx        # NEW: Voice mailbox component
│   └── types.ts                     # Updated with new types
├── backend/
│   ├── scripts/
│   │   └── generate_voice_mailbox_audio.py  # NEW: Script to pre-generate audio
│   └── public/
│       └── tts_audio/              # Generated audio files (created by script)
└── public/
    └── tts_audio/                  # Copy or symlink from backend/public/tts_audio
```

## Troubleshooting

### Sidebar not showing
- Check that `Sidebar` component is imported in `ChatScreen.tsx`
- Verify sidebar width doesn't conflict with chat area (should be `ml-80` on chat container)

### Mood/Diary data not saving
- Check browser console for localStorage errors
- Ensure browser allows localStorage (not in private/incognito mode)

### Voice mailbox audio not playing
- Ensure audio files are in `public/tts_audio/` directory
- Run the pre-generation script: `python backend/scripts/generate_voice_mailbox_audio.py`
- Check browser console for audio loading errors

### TTS button shows "No audio" for first message
- First message TTS generation happens automatically on component mount
- Wait a few seconds (or minutes on CPU) for generation to complete
- Check backend logs for TTS generation status

## Development Notes

- **LocalStorage Keys**:
  - `moodCalendar`: Array of `MoodEntry` objects
  - `diaryEntries`: Array of `DiaryEntry` objects

- **TTS Optimization**:
  - Only first greeting message generates audio (takes 3-5 minutes on CPU)
  - Subsequent messages show "No audio" button (disabled)
  - Voice mailbox messages use pre-generated audio (instant playback)

- **Styling**:
  - Sidebar adapts to day/night mode
  - All components use consistent color scheme
  - Smooth transitions and animations

## Next Steps

1. Run the application: `npm run dev` (frontend) and `./start_server.sh` (backend)
2. Pre-generate voice mailbox audio (optional but recommended)
3. Test all features:
   - Navigate to chat screen
   - Click back button to return to healer selection
   - Open sidebar and test mood calendar, diary, and voice mailbox
   - Verify data persistence (refresh page, data should remain)

Enjoy your enhanced NightWhisper experience! 🌙


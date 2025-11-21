# NightWhisper - Run Instructions

Complete guide to run the enhanced NightWhisper application with all new features.

## Prerequisites

- Node.js (v18+)
- Python 3.10
- Conda environment `nightwhisper`
- OpenAI API key

## Step-by-Step Setup

### 1. Frontend Setup

```bash
# Navigate to project root
cd /Users/anita/Desktop/COMP4431/project-code

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

### 2. Backend Setup

```bash
# Activate conda environment
conda activate nightwhisper

# Navigate to backend
cd backend

# Install dependencies (if not already done)
pip install -r requirements.txt

# Create .env file with your OpenAI API key
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env

# Start the server
./start_server.sh

# Or manually:
python api/server.py
```

Backend will run on `http://localhost:8000`

### 3. Pre-generate Voice Mailbox Audio (Recommended)

To enable instant playback of voice mailbox messages, pre-generate the audio:

```bash
# Make sure you're in the backend directory with nightwhisper environment activated
cd backend
conda activate nightwhisper

# Run the generation script
python scripts/generate_voice_mailbox_audio.py
```

**Important Notes:**
- This takes **3-5 minutes per message on CPU** (8 messages = ~30-40 minutes total)
- On GPU, it takes **3-10 seconds per message** (~1 minute total)
- The script automatically saves files to both `backend/public/tts_audio/` and `public/tts_audio/`
- If files already exist, they will be skipped

### 4. Access the Application

1. Open your browser
2. Navigate to `http://localhost:5173`
3. You should see the landing page

## New Features Guide

### Back Button
- **Location**: Top-left corner of chat interface
- **Function**: Returns to healer selection screen
- **Style**: Matches day/night mode theme

### Sidebar (Left Panel)
- **Toggle**: Click the arrow button on the right edge of sidebar to collapse/expand
- **Three Tabs**:
  1. **📅 Mood Calendar**
     - Click any date to set mood (1-5 scale)
     - Color-coded: Red (worst) → Green (best)
     - Navigate months with arrow buttons
     - Data saved in browser localStorage
  
  2. **📝 Diary**
     - Select date to view/edit entries
     - Write daily journal entries
     - View list of dates with entries
     - Click "Save Entry" to save
     - Data saved in browser localStorage
  
  3. **📬 Voice Mailbox**
     - Daily random message from your healer
     - Click "Play Message" to hear audio (if pre-generated)
     - Different message each day
     - Categories: 💝 Encouragement, 💡 Daily Tips, ✨ Inspiration

### TTS Optimization
- **First Message**: Automatically generates audio (takes 3-5 minutes on CPU)
- **Subsequent Messages**: Show "No audio" button (disabled) to save processing time
- **Voice Mailbox**: Uses pre-generated audio for instant playback

## Testing Checklist

- [ ] Frontend starts without errors
- [ ] Backend starts without errors
- [ ] Can navigate from landing → avatar → healer → chat
- [ ] Back button returns to healer selection
- [ ] Sidebar appears on left side of chat screen
- [ ] Can toggle sidebar collapse/expand
- [ ] Mood Calendar: Can select dates and set mood
- [ ] Mood Calendar: Colors display correctly
- [ ] Mood Calendar: Data persists after page refresh
- [ ] Diary: Can write and save entries
- [ ] Diary: Can view previous entries
- [ ] Diary: Data persists after page refresh
- [ ] Voice Mailbox: Shows daily message
- [ ] Voice Mailbox: Audio plays (if pre-generated)
- [ ] First greeting message TTS generates (check backend logs)
- [ ] Subsequent messages show "No audio" button

## Troubleshooting

### Sidebar not visible
- Check browser console for errors
- Verify `Sidebar` component is imported in `ChatScreen.tsx`
- Ensure chat area has `ml-80` margin when sidebar is open

### Mood/Diary data not saving
- Check browser localStorage is enabled (not in private mode)
- Open browser DevTools → Application → Local Storage
- Verify keys: `moodCalendar` and `diaryEntries`

### Voice mailbox audio not playing
- Ensure audio files exist in `public/tts_audio/` directory
- Run pre-generation script: `python backend/scripts/generate_voice_mailbox_audio.py`
- Check browser console for audio loading errors
- Verify file paths in `VoiceMailbox.tsx` match actual files

### TTS generation fails
- Check backend logs for TTS service errors
- Verify CosyVoice model is downloaded
- Ensure all TTS dependencies are installed
- Check `OPENAI_API_KEY` is set in `backend/.env`

## File Locations

- **Frontend Components**: `src/components/`
  - `ChatScreen.tsx` - Main chat with sidebar
  - `Sidebar.tsx` - Sidebar container
  - `MoodCalendar.tsx` - Mood tracking
  - `Diary.tsx` - Journal entries
  - `VoiceMailbox.tsx` - Daily messages

- **Backend Scripts**: `backend/scripts/`
  - `generate_voice_mailbox_audio.py` - Pre-generate TTS audio

- **Audio Files**: `public/tts_audio/`
  - `milo_greeting.wav`, `milo_sleep.wav`
  - `leo_greeting.wav`, `leo_breathing.wav`
  - `luna_greeting.wav`, `luna_evening.wav`
  - `max_greeting.wav`, `max_energy.wav`

## Performance Notes

- **TTS Generation**: 
  - CPU: 3-5 minutes per message
  - GPU: 3-10 seconds per message
  - Only first greeting message generates audio
  - Voice mailbox uses pre-generated audio (instant)

- **LocalStorage**:
  - Mood calendar data: `moodCalendar` key
  - Diary entries: `diaryEntries` key
  - Data persists across browser sessions

## Next Steps

1. Test all features thoroughly
2. Pre-generate voice mailbox audio for best experience
3. Customize voice mailbox messages in `VoiceMailbox.tsx` if desired
4. Adjust mood calendar colors or labels in `MoodCalendar.tsx` if needed

Enjoy your enhanced NightWhisper experience! 🌙


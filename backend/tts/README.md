# TTS (Text-to-Speech) Module

This module provides TTS functionality using CosyVoice for voice cloning. Each healer has a corresponding voice clone file.

## Setup

### 1. Download CosyVoice Model

First, download the CosyVoice model:

```bash
cd backend/CosyVoice
mkdir -p pretrained_models
git clone https://www.modelscope.cn/iic/CosyVoice-300M.git pretrained_models/CosyVoice-300M
```

### 2. Install Dependencies

Make sure you have the required dependencies installed in your conda environment:

```bash
conda activate nightwhisper
cd backend/CosyVoice
pip install -r requirements.txt
```

### 3. Voice Clone Files

Each healer needs a corresponding voice clone file (`.wav` format, 16kHz sample rate):

- `milo` (Rabbit) → `bunny.wav` ✅
- `leo` (Owl) → `owl.wav` ✅
- `luna` (Deer) → `dear.wav` ✅
- `max` (Dog) → `dog.wav` ✅

All voice clone files should be placed in `backend/CosyVoice/` directory.

The voice clone files should be:
- WAV format
- 16kHz sample rate
- Short audio clips (a few seconds) of the target voice speaking

### 4. Verify Setup

Run the test script to verify TTS setup:

```bash
cd backend
conda activate nightwhisper
python3 tts/test_tts_service.py
```

This will:
- Check all dependencies
- Verify voice files
- Test model loading
- Perform a real TTS generation test (takes 3-5 minutes on CPU)

The TTS service will initialize automatically when the first TTS request is made via the API.

## Usage

### API Endpoint

**POST** `/api/tts/generate`

Request:
```json
{
  "text": "Hello, I'm here to help you.",
  "healerId": "milo"
}
```

Response:
```json
{
  "audioUrl": "/api/tts/audio/tts_milo_abc123.wav",
  "status": "ready",
  "error": null
}
```

### Frontend Integration

The TTS functionality is automatically integrated into the chat interface:

1. When a healer sends a message, TTS generation starts automatically in the background
2. A "Listen" button appears below the healer's message
3. The button shows different states:
   - **Generating...**: TTS is being generated (spinning icon)
   - **Listen**: Audio is ready to play (play icon)
   - **No audio**: Generation failed or not available

### How It Works

1. **Voice Cloning**: Uses CosyVoice's zero-shot voice cloning feature
2. **Asynchronous Generation**: TTS generation happens in the background, so it doesn't block the chat
3. **Caching**: Generated audio files are stored temporarily and can be replayed

## Performance Notes

### Speed Optimization

TTS generation speed depends on several factors:

1. **Device (CPU vs GPU)**:
   - **CPU mode**: 3-5 minutes per message (very slow, ~40x real-time factor)
   - **GPU mode (CUDA)**: 3-10 seconds per message (much faster, ~1-2x real-time factor)
   - The service automatically uses GPU if available, otherwise falls back to CPU

2. **Model Optimization**:
   - JIT-compiled models: Faster inference (if available in model directory)
   - FP16 precision: Faster on GPU (requires GPU)
   - TensorRT: Fastest on GPU (requires special setup)

3. **Text Length**:
   - Longer texts take proportionally longer to generate
   - Consider splitting very long messages

### Current Configuration

- Device: Auto-detects CUDA, falls back to CPU
- JIT: Disabled (set `load_jit=True` if JIT models are available)
- FP16: Disabled (requires GPU)
- TensorRT: Disabled (requires special setup)

### Recommendations

- **For production**: Use GPU if available for acceptable speed (3-10 seconds)
- **For development/testing**: CPU works but expect 3-5 minutes per message
- **For faster CPU inference**: 
  - Use shorter messages (shorter text = faster generation)
  - Implement caching for repeated phrases
  - Consider using a cloud GPU service for production

## Performance Optimization

### Current Performance (CPU Mode)
- **Generation time**: 3-5 minutes per message
- **Real-time factor (RTF)**: ~40x (generation takes 40x longer than audio duration)
- **Model loading**: 10-30 seconds on first use

### How to Accelerate

1. **Use GPU (Best Option)**:
   - Automatically enabled if CUDA is available
   - Reduces generation time from 3-5 minutes to 3-10 seconds
   - Check GPU availability: `python -c "import torch; print(torch.cuda.is_available())"`

2. **Optimize Text Length**:
   - Shorter messages generate faster
   - Consider splitting very long messages into shorter segments

3. **Implement Caching** (Future Enhancement):
   - Cache generated audio for frequently used phrases
   - Reuse audio for identical text inputs

4. **Use JIT Models** (If Available):
   - Pre-compiled models are faster
   - Requires JIT model files in model directory
   - Set `load_jit=True` in `cosyvoice_service.py` if files exist

5. **Use FP16 Precision** (GPU Only):
   - Faster inference on GPU
   - Set `fp16=True` in `cosyvoice_service.py` if GPU available

## Notes

- TTS generation is CPU-intensive and takes 3-5 minutes per message on CPU
- Generated audio files are stored in the system temp directory
- Audio files are automatically cleaned up by the system
- The TTS service initializes lazily (only when first needed)
- Model loading takes 10-30 seconds on first use
- CPU mode is unavoidable without GPU hardware


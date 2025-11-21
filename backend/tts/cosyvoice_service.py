"""
CosyVoice TTS Service for NightWhisper

This module provides TTS functionality using CosyVoice for voice cloning.
Each healer has a corresponding voice clone file.
"""

import os
import sys
from pathlib import Path
from typing import Optional, Tuple
import logging

# Add CosyVoice to path
BACKEND_DIR = Path(__file__).parent.parent
COSYVOICE_DIR = BACKEND_DIR / "CosyVoice"
sys.path.insert(0, str(COSYVOICE_DIR))
sys.path.insert(0, str(COSYVOICE_DIR / "third_party" / "Matcha-TTS"))

try:
    from cosyvoice.cli.cosyvoice import CosyVoice
    from cosyvoice.utils.file_utils import load_wav
    import torchaudio
    COSYVOICE_AVAILABLE = True
except ImportError as e:
    logging.warning(f"CosyVoice not available: {e}")
    COSYVOICE_AVAILABLE = False

# Healer voice mapping
HEALER_VOICE_MAP = {
    "milo": "bunny.wav",  # Rabbit
    "leo": "owl.wav",     # Owl
    "luna": "dear.wav",   # Deer (note: file is named "dear.wav")
    "max": "dog.wav",     # Dog
}

# Prompt text for each healer's voice clone file
# These texts correspond to the actual audio content in each .wav file
# Source: backend/CosyVoice/original.txt
HEALER_PROMPT_TEXT = {
    "milo": "This has been happening to you in social situations for a long time. Or imagine every time you go out, and you're in crowded places, you feel this panic starting to arise.",  # Bunny
    "leo": "He had come to the high-rise to get away from all relationships. Even his sister;s presence, and the reminders of their high-strung mother, a doctor's window slowly sliding into alcoholism, at one time seemed too close for comfort",  # Owl
    "luna": "Knowing how much of an effort, how much time, how much energy it will take. You still try. Try to live",  # Deer (dear.wav)
    "max": "Now the big question is why are people so addicted? Well, here is my answer. Take social media for an example, every single time you post a photo, let's say in the matter of 10 seconds you got four likes.",  # Dog
}

# Model directory
MODEL_DIR = COSYVOICE_DIR / "pretrained_models" / "CosyVoice-300M"
VOICE_DIR = COSYVOICE_DIR


class CosyVoiceService:
    """Service for generating TTS audio using CosyVoice."""
    
    def __init__(self):
        self.model: Optional[CosyVoice] = None
        self.is_initialized = False
        
    def initialize(self) -> bool:
        """Initialize the CosyVoice model."""
        if not COSYVOICE_AVAILABLE:
            logging.error("CosyVoice is not available. Please install dependencies.")
            return False
            
        if self.is_initialized:
            return True
            
        try:
            # Check if model directory exists
            if not MODEL_DIR.exists():
                logging.warning(f"Model directory not found: {MODEL_DIR}")
                logging.warning("Please run: mkdir -p pretrained_models && git clone https://www.modelscope.cn/iic/CosyVoice-300M.git pretrained_models/CosyVoice-300M")
                return False
            
            logging.info(f"Loading CosyVoice model from {MODEL_DIR}...")
            # Use CUDA if available, otherwise CPU
            # Performance: CPU mode takes 3-5 minutes per message, GPU mode takes 3-10 seconds
            import torch
            device = "cuda" if torch.cuda.is_available() else "cpu"
            logging.info(f"Using device: {device}")
            if device == "cpu":
                logging.warning("CPU mode detected - TTS generation will be VERY SLOW (3-5 minutes per message)")
                logging.warning("Consider using GPU for acceptable performance (3-10 seconds per message)")
            
            # Try to use JIT-compiled models for better performance (if available)
            # JIT models are pre-compiled and faster, but may not exist for all models
            self.model = CosyVoice(
                str(MODEL_DIR),
                device=device,
                load_jit=False,  # Set to True if JIT models are available (check model directory)
                load_trt=False,  # TensorRT requires GPU and special setup
                fp16=False       # FP16 requires GPU
            )
            self.is_initialized = True
            logging.info("CosyVoice model loaded successfully.")
            return True
            
        except Exception as e:
            logging.error(f"Failed to initialize CosyVoice: {e}")
            return False
    
    def generate_speech(
        self, 
        text: str, 
        healer_id: str,
        output_path: Optional[str] = None
    ) -> Tuple[bool, Optional[str]]:
        """
        Generate speech for the given text using the healer's voice clone.
        
        Args:
            text: Text to synthesize
            healer_id: ID of the healer (milo, leo, luna, max)
            output_path: Optional path to save the audio file
            
        Returns:
            Tuple of (success: bool, output_path: Optional[str])
        """
        if not self.is_initialized:
            if not self.initialize():
                return False, None
        
        if healer_id not in HEALER_VOICE_MAP:
            logging.error(f"Unknown healer_id: {healer_id}")
            return False, None
        
        voice_file = VOICE_DIR / HEALER_VOICE_MAP[healer_id]
        if not voice_file.exists():
            logging.error(f"Voice file not found: {voice_file}")
            logging.error(f"Please ensure {HEALER_VOICE_MAP[healer_id]} exists in {VOICE_DIR}")
            return False, None
        
        try:
            # Load prompt speech
            prompt_speech_16k = load_wav(str(voice_file), 16000)
            
            # Get prompt text for this healer (the text that corresponds to the voice clone audio)
            prompt_text = HEALER_PROMPT_TEXT.get(healer_id, "")
            if not prompt_text:
                logging.warning(f"No prompt text found for healer {healer_id}, using empty string")
                prompt_text = ""
            
            logging.info(f"Generating speech for healer {healer_id}: {text[:50]}...")
            logging.info(f"Using prompt text: {prompt_text[:50]}...")
            logging.info(f"Text length: {len(text)} characters")
            
            # Generate audio using zero-shot inference
            # Parameters: (tts_text, prompt_text, prompt_speech_16k, zero_shot_spk_id='', stream=False, ...)
            # - tts_text: The text we want to synthesize (healer's response)
            # - prompt_text: The text that corresponds to the voice clone audio (from original.txt)
            # - prompt_speech_16k: The voice clone audio file (16kHz)
            import time
            start_time = time.time()
            
            logging.info("Starting TTS generation (this may take 3-5 minutes on CPU, 3-10 seconds on GPU)...")
            
            audio_generated = False
            for i, output in enumerate(self.model.inference_zero_shot(
                text,              # tts_text: text to synthesize
                prompt_text,       # prompt_text: text from original audio
                prompt_speech_16k, # prompt_speech_16k: voice clone audio
                '',                # zero_shot_spk_id: empty string (not using cached speaker)
                stream=False       # stream: False for complete audio
            )):
                # Save the generated audio
                if output_path is None:
                    # Generate a temporary file path
                    import tempfile
                    import hashlib
                    text_hash = hashlib.md5(text.encode()).hexdigest()[:8]
                    output_path = str(Path(tempfile.gettempdir()) / f"tts_{healer_id}_{text_hash}.wav")
                
                torchaudio.save(
                    output_path,
                    output['tts_speech'],
                    self.model.sample_rate
                )
                audio_generated = True
                elapsed_time = time.time() - start_time
                audio_duration = output['tts_speech'].shape[1] / self.model.sample_rate
                rtf = elapsed_time / audio_duration if audio_duration > 0 else 0
                logging.info(f"Speech generated successfully in {elapsed_time:.2f}s ({elapsed_time/60:.2f} minutes)")
                logging.info(f"Audio duration: {audio_duration:.2f}s, Real-time factor (RTF): {rtf:.2f}x")
                logging.info(f"Output file: {output_path}")
                break
            
            if audio_generated:
                return True, output_path
            else:
                logging.error("No audio generated from model")
                return False, None
                
        except Exception as e:
            logging.error(f"Error generating speech: {e}")
            import traceback
            logging.error(traceback.format_exc())
            return False, None


# Global service instance
_tts_service: Optional[CosyVoiceService] = None


def get_tts_service() -> CosyVoiceService:
    """Get or create the global TTS service instance."""
    global _tts_service
    if _tts_service is None:
        _tts_service = CosyVoiceService()
    return _tts_service


"""
TTS Service Test Suite

This script performs comprehensive tests for the TTS service, including:
- Import checks
- Configuration validation
- Voice file verification
- Dependency checks
- Model loading
- Real TTS generation with timing

Usage:
    python3 tts/test_tts_service.py

Note: Full TTS generation test takes 3-5 minutes on CPU, 3-10 seconds on GPU.
"""

import sys
import time
from pathlib import Path

# Add backend to path
BACKEND_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(BACKEND_DIR))

def test_imports():
    """Test that all imports work correctly."""
    print("=" * 60)
    print("Test 1: Import Check")
    print("=" * 60)
    try:
        from tts.cosyvoice_service import (
            get_tts_service,
            HEALER_VOICE_MAP,
            HEALER_PROMPT_TEXT,
            CosyVoiceService
        )
        print("✓ All imports successful")
        return True
    except Exception as e:
        print(f"✗ Import failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_configuration():
    """Test that all healers are configured correctly."""
    print("\n" + "=" * 60)
    print("Test 2: Configuration Check")
    print("=" * 60)
    from tts.cosyvoice_service import HEALER_VOICE_MAP, HEALER_PROMPT_TEXT
    
    healers = ['milo', 'leo', 'luna', 'max']
    all_ok = True
    
    for healer_id in healers:
        if healer_id not in HEALER_VOICE_MAP:
            print(f"✗ Missing voice file mapping for {healer_id}")
            all_ok = False
        elif healer_id not in HEALER_PROMPT_TEXT:
            print(f"✗ Missing prompt text for {healer_id}")
            all_ok = False
        else:
            voice_file = HEALER_VOICE_MAP[healer_id]
            prompt_text = HEALER_PROMPT_TEXT[healer_id]
            print(f"✓ {healer_id}: {voice_file} (prompt: {len(prompt_text)} chars)")
    
    if all_ok:
        print("✓ All healers configured correctly")
    return all_ok

def test_voice_files():
    """Test that voice files exist."""
    print("\n" + "=" * 60)
    print("Test 3: Voice Files Check")
    print("=" * 60)
    from tts.cosyvoice_service import HEALER_VOICE_MAP, VOICE_DIR
    
    all_ok = True
    for healer_id, voice_file in HEALER_VOICE_MAP.items():
        voice_path = VOICE_DIR / voice_file
        if voice_path.exists():
            file_size = voice_path.stat().st_size / 1024  # KB
            print(f"✓ {healer_id}: {voice_file} exists ({file_size:.1f} KB)")
        else:
            print(f"✗ {healer_id}: {voice_file} NOT FOUND at {voice_path}")
            all_ok = False
    
    if all_ok:
        print("✓ All voice files found")
    return all_ok

def test_dependencies():
    """Test that all required dependencies are installed."""
    print("\n" + "=" * 60)
    print("Test 4: Dependencies Check")
    print("=" * 60)
    
    missing_deps = []
    
    # Check critical dependencies
    deps_to_check = [
        ('hyperpyyaml', 'HyperPyYAML'),
        ('torch', 'PyTorch'),
        ('torchaudio', 'torchaudio'),
        ('cosyvoice', 'CosyVoice (from CosyVoice directory)'),
    ]
    
    for module_name, display_name in deps_to_check:
        try:
            if module_name == 'cosyvoice':
                # Special check for cosyvoice
                import sys
                from pathlib import Path
                BACKEND_DIR = Path(__file__).parent.parent
                COSYVOICE_DIR = BACKEND_DIR / "CosyVoice"
                sys.path.insert(0, str(COSYVOICE_DIR))
                from cosyvoice.cli.cosyvoice import CosyVoice
                print(f"✓ {display_name} is available")
            else:
                __import__(module_name)
                print(f"✓ {display_name} is installed")
        except ImportError:
            print(f"✗ {display_name} is NOT installed")
            missing_deps.append(display_name)
    
    if missing_deps:
        print(f"\n⚠ Missing dependencies: {', '.join(missing_deps)}")
        print("\nTo install CosyVoice dependencies, run:")
        print("  cd backend/CosyVoice")
        print("  pip install -r requirements.txt")
        print("\nOr install just the missing ones:")
        print("  pip install HyperPyYAML")
        return False
    
    print("✓ All dependencies are installed")
    return True

def test_model_loading():
    """Test that model can be loaded."""
    print("\n" + "=" * 60)
    print("Test 5: Model Loading")
    print("=" * 60)
    try:
        from tts.cosyvoice_service import get_tts_service
        import torch
        
        print(f"CUDA available: {torch.cuda.is_available()}")
        if torch.cuda.is_available():
            print(f"CUDA device: {torch.cuda.get_device_name(0)}")
        else:
            print("⚠ Using CPU mode - generation will be SLOW (1-2 minutes per message)")
        
        service = get_tts_service()
        print("\nInitializing model (this may take 10-30 seconds)...")
        
        start_time = time.time()
        success = service.initialize()
        elapsed = time.time() - start_time
        
        if success:
            print(f"✓ Model loaded successfully in {elapsed:.2f} seconds")
            print(f"  - Initialized: {service.is_initialized}")
            if service.model:
                print(f"  - Device: {service.model.device}")
            return True
        else:
            print(f"✗ Model loading failed after {elapsed:.2f} seconds")
            print("  Check error messages above for details")
            return False
    except Exception as e:
        print(f"✗ Model loading error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_real_tts_generation():
    """Test REAL TTS generation with timing."""
    print("\n" + "=" * 60)
    print("Test 6: REAL TTS Generation Test")
    print("=" * 60)
    print("This will generate actual audio - may take 1-2 minutes on CPU!")
    print()
    
    try:
        from tts.cosyvoice_service import get_tts_service
        
        service = get_tts_service()
        
        # Initialize if not already done
        if not service.is_initialized:
            print("Initializing model first...")
            if not service.initialize():
                print("✗ Failed to initialize model")
                return False
        
        # Test with a short text for one healer (luna/deer)
        test_healer = "luna"
        test_text = "Hello, I'm here to help you find peace and stillness."
        
        print(f"Generating TTS for healer: {test_healer}")
        print(f"Text: '{test_text}'")
        print()
        print("Starting generation (this may take a while on CPU)...")
        
        start_time = time.time()
        success, output_path = service.generate_speech(
            text=test_text,
            healer_id=test_healer
        )
        elapsed = time.time() - start_time
        
        if success and output_path:
            file_size = Path(output_path).stat().st_size / 1024  # KB
            print()
            print("=" * 60)
            print("✓ TTS GENERATION SUCCESSFUL!")
            print("=" * 60)
            print(f"  Output file: {output_path}")
            print(f"  File size: {file_size:.1f} KB")
            print(f"  Generation time: {elapsed:.2f} seconds ({elapsed/60:.2f} minutes)")
            print(f"  Speed: {len(test_text) / elapsed:.1f} chars/second")
            print()
            
            # Check if file exists and is readable
            if Path(output_path).exists():
                print(f"✓ Audio file exists and is readable")
                print(f"  You can play it with: open {output_path}")
            else:
                print(f"✗ Audio file not found at {output_path}")
                return False
            
            return True
        else:
            print()
            print("=" * 60)
            print("✗ TTS GENERATION FAILED")
            print("=" * 60)
            print(f"  Time elapsed: {elapsed:.2f} seconds")
            print(f"  Success: {success}")
            print(f"  Output path: {output_path}")
            return False
            
    except Exception as e:
        print(f"✗ TTS generation error: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests."""
    print("\n" + "=" * 60)
    print("TTS Service REAL Test Suite")
    print("=" * 60)
    print("This will test actual TTS generation with timing.")
    print()
    
    results = []
    results.append(("Imports", test_imports()))
    results.append(("Configuration", test_configuration()))
    results.append(("Voice Files", test_voice_files()))
    results.append(("Dependencies", test_dependencies()))
    results.append(("Model Loading", test_model_loading()))
    results.append(("Real TTS Generation", test_real_tts_generation()))
    
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    for test_name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{test_name}: {status}")
    
    all_passed = all(result for _, result in results)
    if all_passed:
        print("\n✓ All tests passed!")
        print("\nNote: If generation took more than 2 minutes, you're using CPU mode.")
        print("      GPU mode would be 3-10 seconds. Check if CUDA is available.")
    else:
        print("\n✗ Some tests failed")
        print("\nCheck the error messages above for details.")
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())

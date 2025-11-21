import React, { useState, useRef, useEffect } from 'react';

interface MusicTrack {
  id: string;
  name: string;
  path: string;
  category: 'joy' | 'piano' | 'soft';
}

const musicTracks: MusicTrack[] = [
  // Joyful
  { id: 'joy-1', name: 'Morning Dewlight', path: '/music/joy-morning-dewlight.mp3', category: 'joy' },
  { id: 'joy-2', name: 'Warm Breeze', path: '/music/joy-warm-breeze.mp3', category: 'joy' },
  // Piano
  { id: 'piano-1', name: 'Quiet Steps', path: '/music/piano-quiet-steps.mp3', category: 'piano' },
  { id: 'piano-2', name: 'Starlight', path: '/music/piano-startlight.mp3', category: 'piano' },
  // Soft
  { id: 'soft-1', name: 'Midnight Drift', path: '/music/soft-midnight-drift.mp3', category: 'soft' },
  { id: 'soft-2', name: 'Moonlit Haze', path: '/music/soft-moonlit-haze.mp3', category: 'soft' },
];

interface MusicPlayerProps {
  showSelection?: boolean; // Show music selection UI (for chat screen)
  defaultTrack?: string; // Default track path
  isDayMode?: boolean; // Day/night mode for styling
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ 
  showSelection = false, 
  defaultTrack = '/music/soft-moonlit-haze.mp3',
  isDayMode = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false); // Start as false, will be triggered by user interaction
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string>(defaultTrack);
  const [selectedCategory, setSelectedCategory] = useState<'joy' | 'piano' | 'soft'>('soft');
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false); // Collapsed by default
  const audioRef = useRef<HTMLAudioElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Get tracks for current category
  const categoryTracks = musicTracks.filter(t => t.category === selectedCategory);

  // Initialize audio on mount - keep playing across page changes
  useEffect(() => {
    if (audioRef.current) {
      // Only set src if it's different (to avoid interrupting playback)
      if (audioRef.current.src !== window.location.origin + currentTrack) {
        const wasPlaying = !audioRef.current.paused;
        audioRef.current.src = currentTrack;
        audioRef.current.loop = true;
        audioRef.current.volume = isMuted ? 0 : 0.3;
        
        // If it was playing before, continue playing
        if (wasPlaying && hasUserInteracted) {
          audioRef.current.play().catch(e => console.log('Play error:', e));
        }
      } else {
        // Same track, just update volume
        audioRef.current.volume = isMuted ? 0 : 0.3;
      }
      
      // Try to play on mount (may be blocked by browser)
      if (!hasUserInteracted) {
        const tryPlay = async () => {
          try {
            await audioRef.current?.play();
            setIsPlaying(true);
            setHasUserInteracted(true);
          } catch (e) {
            console.log('Auto-play prevented, waiting for user interaction');
            setIsPlaying(false);
          }
        };
        tryPlay();
      } else if (isPlaying && !isMuted) {
        // User has interacted before, continue playing
        audioRef.current.play().catch(e => console.log('Play error:', e));
      }
    }
  }, []); // Only run on mount

  // Update track when currentTrack changes - smooth transition
  useEffect(() => {
    if (audioRef.current && hasUserInteracted && audioRef.current.src !== window.location.origin + currentTrack) {
      const wasPlaying = !audioRef.current.paused;
      audioRef.current.src = currentTrack;
      audioRef.current.load();
      // Continue playing if it was playing before
      if (wasPlaying || isPlaying) {
        audioRef.current.play().catch(e => console.log('Play error:', e));
        setIsPlaying(true);
      }
    }
  }, [currentTrack, hasUserInteracted]);

  // Handle play/pause
  useEffect(() => {
    if (audioRef.current && hasUserInteracted) {
      if (isPlaying && !isMuted) {
        audioRef.current.play().catch(e => console.log('Play error:', e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, isMuted, hasUserInteracted]);

  // Handle mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : 0.3;
    }
  }, [isMuted]);

  // Enable audio on first user interaction
  const enableAudio = async () => {
    if (!hasUserInteracted && audioRef.current) {
      try {
        await audioRef.current.play();
        setHasUserInteracted(true);
        setIsPlaying(true);
      } catch (e) {
        console.log('Failed to enable audio:', e);
      }
    }
  };

  const handleCategoryChange = (category: 'joy' | 'piano' | 'soft') => {
    setSelectedCategory(category);
    setSelectedTrackIndex(0);
    const firstTrack = musicTracks.find(t => t.category === category);
    if (firstTrack) {
      setCurrentTrack(firstTrack.path);
    }
    enableAudio();
  };

  // Handle scroll wheel for track selection
  const handleWheelScroll = (e: React.WheelEvent) => {
    e.preventDefault();
    const direction = e.deltaY > 0 ? 'down' : 'up';
    const newIndex = direction === 'up' 
      ? (selectedTrackIndex - 1 + categoryTracks.length) % categoryTracks.length
      : (selectedTrackIndex + 1) % categoryTracks.length;
    
    setSelectedTrackIndex(newIndex);
    setCurrentTrack(categoryTracks[newIndex].path);
    enableAudio();
  };

  // Sync scroll position with selected index
  useEffect(() => {
    if (scrollContainerRef.current) {
      const itemHeight = 60; // Height of each track item
      const scrollPosition = selectedTrackIndex * itemHeight;
      scrollContainerRef.current.scrollTop = scrollPosition;
    }
  }, [selectedTrackIndex, categoryTracks.length]);


  return (
    <>
      <audio ref={audioRef} />
      
      {/* Music Player Controls */}
      <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-3">
        {/* Music Selection UI (only in chat screen, expandable) */}
        {showSelection && (
          <div 
            className={`${isDayMode ? 'bg-white/70' : 'bg-navy/90'} backdrop-blur-md rounded-2xl p-4 ${isDayMode ? 'border border-indigo-200/30' : 'border border-white/10'} shadow-2xl transition-all duration-300 overflow-hidden ${
              isExpanded 
                ? 'max-h-96 opacity-100 translate-y-0' 
                : 'max-h-0 opacity-0 -translate-y-4 pointer-events-none'
            }`}
          >
            {/* Category Selection */}
            <div className="flex gap-2 mb-4">
              {(['joy', 'piano', 'soft'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? isDayMode
                        ? 'bg-indigo-600/90 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-indigo-500/80 text-white shadow-lg shadow-indigo-500/30'
                      : isDayMode
                      ? 'bg-indigo-100/50 text-indigo-700 hover:bg-indigo-200/70'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {cat === 'joy' ? 'Joyful' : cat === 'piano' ? 'Piano' : 'Soft'}
                </button>
              ))}
            </div>

            {/* Track Selection Scroll Wheel */}
            <div className="relative px-4">
              <div 
                ref={scrollContainerRef}
                onWheel={handleWheelScroll}
                className="relative h-32 overflow-hidden"
                style={{
                  maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
                }}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  {categoryTracks.map((track, index) => {
                    const distance = Math.abs(index - selectedTrackIndex);
                    const isSelected = index === selectedTrackIndex;
                    const opacity = isSelected ? 1 : Math.max(0.3, 1 - distance * 0.4);
                    const scale = isSelected ? 1.1 : Math.max(0.85, 1 - distance * 0.1);
                    
                    return (
                      <div
                        key={track.id}
                        onClick={() => {
                          setSelectedTrackIndex(index);
                          setCurrentTrack(track.path);
                          enableAudio();
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.transform = `scale(${scale})`;
                          }
                        }}
                        className={`cursor-pointer transition-all duration-300 text-center py-2 px-5 rounded-lg ${
                          isSelected 
                            ? isDayMode
                              ? 'bg-indigo-100/80 border-2 border-indigo-400/60 shadow-lg shadow-indigo-500/20'
                              : 'bg-indigo-500/30 border-2 border-indigo-400/60 shadow-lg shadow-indigo-500/20'
                            : isDayMode
                            ? 'hover:bg-indigo-50/50 border-2 border-transparent'
                            : 'hover:bg-white/10 border-2 border-transparent'
                        }`}
                        style={{
                          opacity,
                          transform: `scale(${scale})`,
                          minHeight: '60px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <p className={`font-semibold text-sm ${
                          isSelected 
                            ? isDayMode ? 'text-indigo-800' : 'text-white'
                            : isDayMode ? 'text-gray-700' : 'text-white/70'
                        }`}>
                          {track.name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Scroll indicator gradients - ensure glow is visible */}
              <div className={`absolute top-0 left-0 right-0 h-16 pointer-events-none bg-gradient-to-b ${isDayMode ? 'from-white/70' : 'from-navy/90'} to-transparent`}></div>
              <div className={`absolute bottom-0 left-0 right-0 h-16 pointer-events-none bg-gradient-to-t ${isDayMode ? 'from-white/70' : 'from-navy/90'} to-transparent`}></div>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className={`flex items-center gap-2 ${isDayMode ? 'bg-white/70 border border-indigo-200/30' : 'bg-navy/90 border border-white/10'} backdrop-blur-md rounded-full px-4 py-2 shadow-2xl transition-all ${isDayMode ? 'hover:shadow-indigo-500/20' : 'hover:shadow-indigo-500/20'}`}>
          {/* Expand/Collapse Button (only in chat screen) */}
          {showSelection && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-2 rounded-full transition-all hover:scale-110 ${
                isDayMode
                  ? 'bg-indigo-100/80 text-indigo-700 hover:bg-indigo-200/80'
                  : 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30'
              }`}
              title={isExpanded ? 'Collapse' : 'Expand music selection'}
            >
              <svg 
                className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
          
          {/* Play/Pause Button (if not started) */}
          {!hasUserInteracted && (
            <button
              onClick={enableAudio}
              className={`p-2 rounded-full transition-all hover:scale-110 ${
                isDayMode
                  ? 'bg-indigo-100/80 text-indigo-700 hover:bg-indigo-200/80'
                  : 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30'
              }`}
              title="Play music"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          )}
          
          {/* Mute/Unmute Button */}
          <button
            onClick={() => {
              if (!hasUserInteracted) enableAudio();
              setIsMuted(!isMuted);
            }}
            className={`p-2 rounded-full transition-all hover:scale-110 ${
              isMuted 
                ? isDayMode
                  ? 'bg-red-100/80 text-red-600 hover:bg-red-200/80'
                  : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                : isDayMode
                ? 'bg-indigo-100/80 text-indigo-700 hover:bg-indigo-200/80'
                : 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>

          {/* Playing Indicator */}
          {!isMuted && isPlaying && (
            <div className="flex items-center gap-1 px-2">
              <div className="flex gap-1">
                <div className={`w-1 h-4 ${isDayMode ? 'bg-indigo-600' : 'bg-indigo-400'} rounded-full animate-pulse`} style={{ animationDelay: '0s' }}></div>
                <div className={`w-1 h-6 ${isDayMode ? 'bg-indigo-600' : 'bg-indigo-400'} rounded-full animate-pulse`} style={{ animationDelay: '0.2s' }}></div>
                <div className={`w-1 h-4 ${isDayMode ? 'bg-indigo-600' : 'bg-indigo-400'} rounded-full animate-pulse`} style={{ animationDelay: '0.4s' }}></div>
                <div className={`w-1 h-5 ${isDayMode ? 'bg-indigo-600' : 'bg-indigo-400'} rounded-full animate-pulse`} style={{ animationDelay: '0.6s' }}></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};


import React, { useState, useEffect } from 'react';
import { Healer, VoiceMessage } from '../types';

interface VoiceMailboxProps {
  healer: Healer;
  isDayMode: boolean;
  stopGreetingAudio?: () => void;
  stopVoiceMailboxAudioRef?: React.MutableRefObject<(() => void) | null>;
}

// Expanded voice messages for each healer
const VOICE_MESSAGES: Record<string, VoiceMessage[]> = {
  milo: [
    {
      id: 'milo-1',
      healerId: 'milo',
      title: 'A Gentle Reminder',
      content: 'You are doing better than you think. Even on difficult days, you are moving forward. Take a moment to breathe and remember that you are enough, just as you are.',
      audioUrl: '/tts_audio/milo_greeting.wav',
      date: new Date().toISOString().split('T')[0],
      category: 'encouragement',
    },
    {
      id: 'milo-2',
      healerId: 'milo',
      title: 'Sleep Well Tonight',
      content: 'Before you sleep, try this: write down three things that went well today, no matter how small. Gratitude helps calm the mind and prepares you for restful sleep.',
      audioUrl: '/tts_audio/milo_sleep.wav',
      date: new Date().toISOString().split('T')[0],
      category: 'tips',
    },
    {
      id: 'milo-3',
      healerId: 'milo',
      title: 'Comfort in Moments',
      content: 'When everything feels heavy, remember that feelings are temporary visitors. They come and go, but you remain. You are stronger than this moment, and gentler than you know.',
      audioUrl: '/tts_audio/milo_comfort.wav',
      date: new Date().toISOString().split('T')[0],
      category: 'encouragement',
    },
    {
      id: 'milo-4',
      healerId: 'milo',
      title: 'Self-Care Reminder',
      content: "Self-care isn't selfish—it's necessary. Today, do one small thing just for you. A warm cup of tea, a few minutes of quiet, or simply allowing yourself to rest without guilt.",
      audioUrl: '/tts_audio/milo_selfcare.wav',
      date: new Date().toISOString().split('T')[0],
      category: 'tips',
    },
    {
      id: 'milo-5',
      healerId: 'milo',
      title: 'Your Feelings Matter',
      content: "Your feelings are valid, even when they're uncomfortable. You don't need to fix everything right now. Sometimes, just acknowledging how you feel is enough.",
      audioUrl: '/tts_audio/milo_validation.wav',
      date: new Date().toISOString().split('T')[0],
      category: 'encouragement',
    },
    {
      id: 'milo-6',
      healerId: 'milo',
      title: 'Patience with Healing',
      content: "Healing isn't linear. Some days will feel like steps backward, but they're part of the journey. Be patient with yourself. You're doing the best you can with what you have.",
      audioUrl: '/tts_audio/milo_patience.wav',
      date: new Date().toISOString().split('T')[0],
      category: 'inspiration',
    },
  ],
  leo: [
    {
      id: 'leo-1',
      healerId: 'leo',
      title: 'Clarity in Reflection',
      content: 'When thoughts feel tangled, try stepping back. Sometimes the clearest answers come when we pause and observe our feelings without judgment. What patterns do you notice?',
      audioUrl: '/tts_audio/leo_greeting.wav',
      date: new Date().toISOString().split('T')[0],
      category: 'encouragement',
    },
    {
      id: 'leo-2',
      healerId: 'leo',
      title: 'Mindful Breathing',
      content: 'Take five deep breaths: inhale for four counts, hold for four, exhale for six. This simple practice can help center your thoughts and bring clarity to your day.',
      audioUrl: '/tts_audio/leo_breathing.wav',
      date: new Date().toISOString().split('T')[0],
      category: 'tips',
    },
    {
      id: 'leo-3',
      healerId: 'leo',
      title: 'A Friend\'s Perspective',
      content: "When you're stuck in a loop of worry, ask yourself: What would I tell a friend in this situation? Often, we're kinder to others than to ourselves. Apply that same kindness inward.",
      audioUrl: '/tts_audio/leo_perspective.wav',
      date: new Date().toISOString().split('T')[0],
      category: 'tips',
    },
    {
      id: 'leo-4',
      healerId: 'leo',
      title: 'Good Enough Decisions',
      content: "Not every decision needs to be perfect. Sometimes, good enough is exactly that—good enough. Trust that you can adjust course if needed, and give yourself permission to choose.",
      audioUrl: '/tts_audio/leo_decision.wav',
      date: new Date().toISOString().split('T')[0],
      category: 'encouragement',
    },
    {
      id: 'leo-5',
      healerId: 'leo',
      title: 'Writing for Clarity',
      content: "Write down your thoughts, even if they feel messy. Putting words to feelings can help untangle them. You might discover patterns or solutions you hadn't seen before.",
      audioUrl: '/tts_audio/leo_clarity.wav',
      date: new Date().toISOString().split('T')[0],
      category: 'tips',
    },
    {
      id: 'leo-6',
      healerId: 'leo',
      title: 'Finding Balance',
      content: "Balance isn't about perfection—it's about noticing when you're leaning too far in one direction and gently adjusting. Today, check in with yourself: what do you need?",
      audioUrl: '/tts_audio/leo_balance.wav',
      date: new Date().toISOString().split('T')[0],
      category: 'inspiration',
    },
  ],
  luna: [
    {
      id: 'luna-1',
      healerId: 'luna',
      title: 'Finding Stillness',
      content: 'In the quiet moments, you can hear your own voice most clearly. It\'s okay to slow down, to rest, to simply be. Your feelings are valid, and you deserve peace.',
      audioUrl: '/tts_audio/luna_greeting.wav',
      date: new Date().toISOString().split('T')[0],
      category: 'encouragement',
    },
    {
      id: 'luna-2',
      healerId: 'luna',
      title: 'Evening Peace',
      content: 'As evening comes, let go of what you cannot control. Create a small ritual: perhaps a warm drink, soft music, or gentle stretching. Honor your need for rest.',
      audioUrl: '/tts_audio/luna_evening.wav',
      date: new Date().toISOString().split('T')[0],
      category: 'tips',
    },
    {
      id: 'luna-3',
      healerId: 'luna',
      title: 'Present Moment Safety',
      content: "Right now, in this moment, you are safe. Your breath is steady, your heart is beating. Sometimes, the most powerful thing you can do is simply be present with yourself.",
      audioUrl: '/tts_audio/luna_presence.wav',
      date: new Date().toISOString().split('T')[0],
      category: 'encouragement',
    },
    {
      id: 'luna-4',
      healerId: 'luna',
      title: 'Boundaries Are Love',
      content: "Saying no is a complete sentence. You don't need to justify your boundaries. Protecting your energy isn't selfish—it's essential for your well-being.",
      audioUrl: '/tts_audio/luna_boundaries.wav',
      date: new Date().toISOString().split('T')[0],
      category: 'tips',
    },
    {
      id: 'luna-5',
      healerId: 'luna',
      title: 'Nature\'s Reminder',
      content: "If you can, step outside for just a few minutes. Feel the air, notice the sky, listen to the sounds around you. Nature has a way of gently reminding us of our place in something larger.",
      audioUrl: '/tts_audio/luna_nature.wav',
      date: new Date().toISOString().split('T')[0],
      category: 'tips',
    },
    {
      id: 'luna-6',
      healerId: 'luna',
      title: 'Acceptance and Grace',
      content: "You don't have to be okay all the time. It's okay to not be okay. Allow yourself to feel what you feel, without trying to fix it or make it go away. Just let it be.",
      audioUrl: '/tts_audio/luna_acceptance.wav',
      date: new Date().toISOString().split('T')[0],
      category: 'inspiration',
    },
  ],
  max: [
    {
      id: 'max-1',
      healerId: 'max',
      title: 'You\'ve Got This!',
      content: 'Every step forward, no matter how small, is progress. You have strength you haven\'t even discovered yet. Keep going, and remember to celebrate your wins, big and small!',
      audioUrl: '/tts_audio/max_greeting.wav',
      date: new Date().toISOString().split('T')[0],
      category: 'encouragement',
    },
    {
      id: 'max-2',
      healerId: 'max',
      title: 'Energy Boost Tips',
      content: 'Feeling low on energy? Try these: get some sunlight, move your body even for just five minutes, connect with someone you care about, or do one thing that makes you smile.',
      audioUrl: '/tts_audio/max_energy.wav',
      date: new Date().toISOString().split('T')[0],
      category: 'tips',
    },
    {
      id: 'max-3',
      healerId: 'max',
      title: 'Celebrate Small Wins',
      content: "Did you do something today, even something tiny? That's worth celebrating! Progress isn't always visible, but it's happening. Give yourself credit for showing up.",
      audioUrl: '/tts_audio/max_celebration.wav',
      date: new Date().toISOString().split('T')[0],
      category: 'encouragement',
    },
    {
      id: 'max-4',
      healerId: 'max',
      title: 'Building Momentum',
      content: "Sometimes the hardest part is just starting. Once you take that first small step, momentum builds. What's one tiny thing you can do right now that would feel good?",
      audioUrl: '/tts_audio/max_momentum.wav',
      date: new Date().toISOString().split('T')[0],
      category: 'tips',
    },
    {
      id: 'max-5',
      healerId: 'max',
      title: 'You\'re Not Alone',
      content: "You're not alone in this. Reach out to someone—a friend, a family member, or even just a kind stranger. Connection is a powerful antidote to feeling stuck.",
      audioUrl: '/tts_audio/max_connection.wav',
      date: new Date().toISOString().split('T')[0],
      category: 'encouragement',
    },
    {
      id: 'max-6',
      healerId: 'max',
      title: 'Tomorrow\'s Promise',
      content: "Tomorrow is a new day, full of possibilities. Even if today was hard, you made it through. That's something. And tomorrow, you'll have another chance to try again.",
      audioUrl: '/tts_audio/max_hope.wav',
      date: new Date().toISOString().split('T')[0],
      category: 'inspiration',
    },
  ],
};

export const VoiceMailbox: React.FC<VoiceMailboxProps> = ({ healer, isDayMode, stopGreetingAudio, stopVoiceMailboxAudioRef }) => {
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRefs = React.useRef<Record<string, HTMLAudioElement>>({});
  
  // Register stop function so parent can call it
  React.useEffect(() => {
    if (stopVoiceMailboxAudioRef) {
      stopVoiceMailboxAudioRef.current = () => {
        // Stop all playing audio
        Object.values(audioRefs.current).forEach(audio => {
          if (audio && !audio.paused) {
            audio.pause();
            audio.currentTime = 0;
          }
        });
        setPlayingId(null);
      };
    }
    
    return () => {
      if (stopVoiceMailboxAudioRef) {
        stopVoiceMailboxAudioRef.current = null;
      }
    };
  }, [stopVoiceMailboxAudioRef]);

  useEffect(() => {
    // Get all messages for this healer
    const allMessages = VOICE_MESSAGES[healer.id] || [];
    // Show 3-4 random messages
    const shuffled = [...allMessages].sort(() => Math.random() - 0.5);
    setMessages(shuffled.slice(0, 4));
  }, [healer.id]);

  const handlePlay = (messageId: string, audioUrl: string) => {
    console.log('VoiceMailbox: Attempting to play audio:', audioUrl, 'for healer:', healer.id);
    
    // Stop greeting audio if playing
    if (stopGreetingAudio) {
      stopGreetingAudio();
    }
    
    // Stop any currently playing TTS audio (but not background music - they use separate Audio objects)
    Object.entries(audioRefs.current).forEach(([id, audio]) => {
      if (audio && id !== messageId && !audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    if (playingId === messageId) {
      // Pause if already playing (toggle behavior)
      const audio = audioRefs.current[messageId];
      if (audio) {
        audio.pause();
        setPlayingId(null);
      }
      return;
    }
    
    // Play new audio - separate Audio object so it can play alongside background music
    let audio = audioRefs.current[messageId];
    
    if (!audio) {
      // Create new audio object
      audio = new Audio(audioUrl);
      audioRefs.current[messageId] = audio;
      
      // Add comprehensive error handling
      audio.onerror = (e) => {
        console.error('VoiceMailbox audio error:', e);
        console.error('Audio URL:', audioUrl);
        console.error('Audio error details:', audio.error);
        console.error('Healer ID:', healer.id);
        console.error('Message ID:', messageId);
        setPlayingId(null);
        alert(`Failed to load audio for ${healer.name}. URL: ${audioUrl}`);
      };
      
      audio.onloadstart = () => {
        console.log('VoiceMailbox: Audio loading started:', audioUrl);
      };
      
      audio.oncanplay = () => {
        console.log('VoiceMailbox: Audio can play:', audioUrl);
      };
      
      audio.oncanplaythrough = () => {
        console.log('VoiceMailbox: Audio can play through:', audioUrl);
      };
      
      audio.onended = () => {
        console.log('VoiceMailbox: Audio finished playing:', audioUrl);
        setPlayingId(null);
      };
    } else {
      // Audio exists - check if URL matches and reset to beginning
      // Get just the filename part for comparison
      const getFileName = (url: string) => {
        return url.split('/').pop()?.split('?')[0] || '';
      };
      
      const currentFileName = getFileName(audio.src);
      const expectedFileName = getFileName(audioUrl);
      
      // If filename doesn't match, reload with new URL
      if (currentFileName !== expectedFileName) {
        console.log('VoiceMailbox: Filename changed, reloading audio. Old:', currentFileName, 'New:', expectedFileName);
        audio.pause();
        audio.src = audioUrl;
        audio.load();
      } else {
        // Same file, just reset to beginning
        audio.currentTime = 0;
      }
    }
    
    // Try to play
    audio.play()
      .then(() => {
        console.log('VoiceMailbox: Audio playing successfully:', audioUrl, 'for healer:', healer.id);
        setPlayingId(messageId);
      })
      .catch((error) => {
        console.error('VoiceMailbox: Error playing audio:', error);
        console.error('Audio URL:', audioUrl);
        console.error('Healer ID:', healer.id);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        setPlayingId(null);
        // Only show alert for non-autoplay errors
        if (error.name !== 'NotAllowedError') {
          alert(`Failed to play audio for ${healer.name}: ${error.message}`);
        }
      });
  };
  
  // Cleanup: Stop all audio when component unmounts or healer changes
  useEffect(() => {
    return () => {
      // Stop all audio when component unmounts
      console.log('VoiceMailbox: Cleaning up audio for healer:', healer.id);
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
          // Remove event listeners to prevent memory leaks
          audio.onerror = null;
          audio.onended = null;
          audio.oncanplay = null;
          audio.oncanplaythrough = null;
        }
      });
      setPlayingId(null);
    };
  }, [healer.id]);

  if (messages.length === 0) {
    return (
      <div className={`p-4 text-center ${isDayMode ? 'text-gray-600' : 'text-white/60'}`}>
        <p>No messages available. Check back later!</p>
      </div>
    );
  }

  return (
    <div className={`p-4 h-full overflow-y-auto ${isDayMode ? 'text-gray-800' : 'text-white'}`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDayMode ? 'text-gray-800' : 'text-white'}`}>
        📬 Messages from {healer.name}
      </h3>
      
      <div className="space-y-4">
        {messages.map((message) => {
          const isPlaying = playingId === message.id;
          const categoryEmoji = {
            encouragement: '💝',
            tips: '💡',
            inspiration: '✨',
          }[message.category] || '📝';

          return (
            <div
              key={message.id}
              className={`rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02] ${
                isDayMode
                  ? 'bg-gradient-to-br from-indigo-50/80 to-purple-50/60 border border-indigo-200/50 shadow-lg'
                  : 'bg-gradient-to-br from-indigo-500/20 to-purple-500/15 border border-indigo-400/30 shadow-lg shadow-indigo-500/10'
              }`}
            >
              {/* Title with emoji */}
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-semibold text-base flex items-center gap-2 ${isDayMode ? 'text-indigo-800' : 'text-indigo-200'}`}>
                  <span className="text-xl">{categoryEmoji}</span>
                  <span className="italic font-serif">{message.title}</span>
                </h4>
                {/* Play Button - Unified style with Send button */}
                <button
                  onClick={() => handlePlay(message.id, message.audioUrl)}
                  className={`rounded-full px-4 py-2 font-semibold text-white border-2 transition-all duration-500 text-xs ${
                    isDayMode
                      ? 'bg-indigo-600/90 border-indigo-500/70 shadow-xl shadow-indigo-500/40 hover:bg-indigo-500/90 hover:shadow-indigo-500/50 hover:scale-[1.05]'
                      : 'bg-indigo-800/80 border-indigo-500/60 shadow-xl shadow-indigo-500/30 hover:bg-indigo-700/80 hover:shadow-indigo-500/40 hover:scale-[1.05]'
                  }`}
                >
                  {isPlaying ? (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                      Pause
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Play
                    </span>
                  )}
                </button>
              </div>
              
              {/* Content with elegant styling */}
              <p className={`text-sm leading-relaxed italic font-serif ${isDayMode ? 'text-gray-700' : 'text-white/90'}`}>
                "{message.content}"
              </p>
              
              {/* Category badge */}
              <div className="mt-3 flex items-center gap-2">
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                    isDayMode
                      ? 'bg-indigo-100/80 text-indigo-700'
                      : 'bg-indigo-500/30 text-indigo-200'
                  }`}
                >
                  {message.category === 'encouragement' && '💝 Encouragement'}
                  {message.category === 'tips' && '💡 Daily Tips'}
                  {message.category === 'inspiration' && '✨ Inspiration'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
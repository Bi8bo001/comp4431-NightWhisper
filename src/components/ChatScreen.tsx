import React, { useState, useRef, useEffect } from 'react';
import { AnimatedBackground } from './AnimatedBackground';
import { Sidebar } from './Sidebar';
import { Healer, Message } from '../types';
import { getChatResponse, convertToChatMessage } from '../services/chatService';
import { ChatMessage } from '../api/types';
import { generateTTS } from '../api/client';

interface ChatScreenProps {
  healer: Healer;
  userAvatar: string;
  onBack: () => void;
  onDayModeChange?: (isDayMode: boolean) => void;
}

// Note: Fake responses removed - now using API

export const ChatScreen: React.FC<ChatScreenProps> = ({ healer, userAvatar, onBack, onDayModeChange }) => {
  // Clear localStorage on component mount (for development)
  useEffect(() => {
    if (import.meta.env.DEV) {
      // Uncomment the lines below to clear on each reload during development
      // localStorage.removeItem('moodCalendar');
      // localStorage.removeItem('diaryEntries');
    }
  }, []);
  
  const greetingMessage = `Hello, I'm ${healer.name}. ${healer.description.split('.')[0]}. I'll stay with you while you talk.`;
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: greetingMessage,
      sender: 'healer',
      timestamp: new Date(),
      ttsStatus: 'idle', // Will be set to 'ready' after pre-generation
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isDayMode, setIsDayMode] = useState(false); // Default: night mode
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isFirstMessageGenerated, setIsFirstMessageGenerated] = useState(false);
  
  // Notify parent of day mode changes
  useEffect(() => {
    if (onDayModeChange) {
      onDayModeChange(isDayMode);
    }
  }, [isDayMode, onDayModeChange]);
  
  // Maintain conversation history in API format
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: greetingMessage,
    },
  ]);

  // Pre-generate TTS for first greeting message (only once)
  useEffect(() => {
    let isMounted = true;
    
    const generateGreetingTTS = async () => {
      if (isFirstMessageGenerated) return;
      
      try {
        if (isMounted) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === '1' ? { ...msg, ttsStatus: 'generating' } : msg
            )
          );
        }

        const ttsResponse = await generateTTS({
          text: greetingMessage,
          healerId: healer.id,
        });

        if (isMounted) {
          if (ttsResponse.status === 'ready' && ttsResponse.audioUrl) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === '1'
                  ? { ...msg, audioUrl: ttsResponse.audioUrl, ttsStatus: 'ready' }
                  : msg
              )
            );
            setIsFirstMessageGenerated(true);
          } else {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === '1' ? { ...msg, ttsStatus: 'error' } : msg
              )
            );
          }
        }
      } catch (error) {
        console.error('Error generating greeting TTS:', error);
        if (isMounted) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === '1' ? { ...msg, ttsStatus: 'error' } : msg
            )
          );
        }
      }
    };

    generateGreetingTTS();
    
    return () => {
      isMounted = false;
    };
  }, [healer.id]); // Only depend on healer.id to prevent duplicate calls

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isSending) return;

    const userInput = inputText.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userInput,
      sender: 'user',
      timestamp: new Date(),
    };

    // Add user message to UI
    setMessages((prev) => [...prev, userMessage]);
    
    // Add user message to conversation history
    const userChatMessage = convertToChatMessage(userInput, 'user');
    const updatedHistory = [...conversationHistory, userChatMessage];
    setConversationHistory(updatedHistory);
    
    setInputText('');
    setIsSending(true);

    try {
      // Get response from backend API
      console.log('Calling API with:', { healerId: healer.id, userInput, historyLength: updatedHistory.length });
      const response = await getChatResponse(userInput, updatedHistory, healer, true);
      console.log('API response received:', response);
      
      if (response.error) {
        console.error('Chat error:', response.error);
        // Fallback to a simple message if API fails
        const fallbackMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `[API Error: ${response.error}] I'm here with you. Could you tell me more about what's on your mind?`,
          sender: 'healer',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, fallbackMessage]);
        setConversationHistory((prev) => [
          ...prev,
          convertToChatMessage(fallbackMessage.text, 'healer'),
        ]);
      } else if (response.message && response.message.trim()) {
        // Success: use API response
        const healerResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: response.message,
          sender: 'healer',
          timestamp: new Date(),
          ttsStatus: 'idle', // Start with 'idle' (will show "No audio" until generation starts)
        };
        setMessages((prev) => [...prev, healerResponse]);
        setConversationHistory((prev) => [
          ...prev,
          convertToChatMessage(response.message, 'healer'),
        ]);
        
        // Don't generate TTS for subsequent messages (only first greeting has TTS)
        // Set status to 'idle' so button shows but doesn't actually generate
      } else {
        // Empty response fallback
        console.warn('Empty response from API');
        const fallbackMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'm here with you. Could you tell me more about what's on your mind?",
          sender: 'healer',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, fallbackMessage]);
        setConversationHistory((prev) => [
          ...prev,
          convertToChatMessage(fallbackMessage.text, 'healer'),
        ]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback message
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `[Error: ${error instanceof Error ? error.message : 'Unknown error'}] I'm here with you. Could you tell me more about what's on your mind?`,
        sender: 'healer',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
      setConversationHistory((prev) => [
        ...prev,
        convertToChatMessage(fallbackMessage.text, 'healer'),
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Play audio for a message - separate Audio object so it can play alongside background music
  const playAudio = (audioUrl: string) => {
    console.log('Attempting to play audio:', audioUrl);
    
    // Create a new Audio object (separate from background music)
    const audio = new Audio(audioUrl);
    
    // Add error handlers
    audio.onerror = (e) => {
      console.error('Audio error:', e);
      console.error('Audio URL:', audioUrl);
      console.error('Audio error details:', audio.error);
      alert(`Failed to play audio. Please check the console for details. URL: ${audioUrl}`);
    };
    
    audio.onloadstart = () => {
      console.log('Audio loading started:', audioUrl);
    };
    
    audio.oncanplay = () => {
      console.log('Audio can play:', audioUrl);
    };
    
    audio.oncanplaythrough = () => {
      console.log('Audio can play through:', audioUrl);
    };
    
    // Try to play
    audio.play()
      .then(() => {
        console.log('Audio playing successfully:', audioUrl);
      })
      .catch((error) => {
        console.error('Error playing audio:', error);
        console.error('Audio URL:', audioUrl);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        alert(`Failed to play audio: ${error.message}. URL: ${audioUrl}`);
      });
  };

  return (
    <AnimatedBackground backgroundImage={healer.backgroundImage}>
      {/* Sidebar */}
      <Sidebar healer={healer} isDayMode={isDayMode} onToggle={setSidebarOpen} isOpen={sidebarOpen} />
      
      <div className={`flex h-screen flex-col overflow-hidden transition-all duration-500 relative z-10 ${
        sidebarOpen ? 'ml-80 w-[calc(100%-20rem)]' : 'ml-0 w-full'
      } ${
        isDayMode ? 'bg-gradient-to-b from-sky-50/8 to-blue-50/5' : 'bg-black/20'
      }`}>
        {/* Header bar - fixed */}
        <div className={`border-b px-4 py-4 backdrop-blur-sm flex-shrink-0 transition-all duration-500 ${
          isDayMode 
            ? 'bg-white/40 border-gray-200/20' 
            : 'bg-navy/70 border-white/20'
        }`}>
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            {/* Back Button - Different style from sidebar toggle */}
            <button
              onClick={onBack}
              className={`mr-4 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-500 hover:scale-105 flex items-center gap-2 ${
                isDayMode
                  ? 'bg-indigo-100/80 text-indigo-700 hover:bg-indigo-200/80 shadow-md'
                  : 'bg-indigo-500/30 text-indigo-200 hover:bg-indigo-500/40 shadow-md shadow-indigo-500/20'
              }`}
              title="Back to healer selection"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back</span>
            </button>
            
            <div className="flex items-center gap-3">
              <img
                src={healer.avatarSrc}
                alt={healer.name}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <div className={`text-sm font-semibold transition-colors duration-500 ${
                  isDayMode ? 'text-gray-800' : 'text-white'
                }`}>
                  {healer.name} · {healer.keyword}
                </div>
                <div className={`text-xs transition-colors duration-500 ${
                  isDayMode ? 'text-gray-600' : 'text-white/60'
                }`}>
                  "I'll stay with you while you talk."
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Theme Toggle Button */}
              <button
                onClick={() => setIsDayMode(!isDayMode)}
                className={`p-2 rounded-full transition-all duration-500 hover:scale-110 ${
                  isDayMode
                    ? 'bg-yellow-400/20 text-yellow-600 hover:bg-yellow-400/30'
                    : 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30'
                }`}
                title={isDayMode ? 'Switch to Night Mode' : 'Switch to Day Mode'}
              >
                {isDayMode ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              
              <div className={`rounded-full px-4 py-1 text-xs font-semibold transition-all duration-500 ${
                isDayMode
                  ? 'bg-indigo-100/80 text-indigo-700'
                  : 'bg-lavender-DEFAULT/20 text-lavender-light'
              }`}>
                NightWhisper
              </div>
            </div>
          </div>
        </div>

        {/* Chat area - scrollable, fixed height */}
        <div className={`flex-1 overflow-y-auto px-4 py-6 min-h-0 transition-all duration-500 ${
          isDayMode ? 'bg-gradient-to-b from-sky-50/10 to-blue-50/8' : 'bg-black/15'
        }`}>
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                } animate-fadeIn`}
              >
                {/* Healer avatar in messages (left side) */}
                {message.sender === 'healer' && (
                  <img
                    src={healer.avatarSrc}
                    alt={healer.name}
                    className="h-12 w-12 rounded-full object-cover flex-shrink-0"
                  />
                )}
                {/* Message bubble */}
                <div className="flex flex-col gap-2 max-w-[75%]">
                  <div
                    className={`rounded-2xl px-4 py-3 transition-all duration-500 ${
                      message.sender === 'user'
                        ? 'text-white shadow-lg'
                        : isDayMode ? 'bg-white/80 text-gray-800' : 'bg-navy/70 text-white'
                    }`}
                    style={
                      message.sender === 'user'
                        ? { 
                            backgroundColor: isDayMode 
                              ? 'rgba(99, 102, 241, 0.25)' // indigo with transparency for day mode
                              : 'rgba(83, 255, 206, 0.23)' // lavender-dark with 70% opacity for night mode
                          }
                        : undefined
                    }
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  </div>
                  
                  {/* TTS Play Button (only for healer messages) */}
                  {message.sender === 'healer' && (
                    <button
                      onClick={() => {
                        // Only first message (id === '1') has actual audio
                        if (message.id === '1' && message.audioUrl && message.ttsStatus === 'ready') {
                          playAudio(message.audioUrl);
                        } else {
                          // For other messages, show a message that audio is not available
                          alert('Audio is only available for the greeting message. Subsequent messages do not have audio generation to save processing time.');
                        }
                      }}
                      disabled={message.id !== '1' || message.ttsStatus !== 'ready'}
                      className={`self-start flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                        message.id === '1' && message.ttsStatus === 'ready'
                          ? isDayMode
                            ? 'bg-indigo-100/80 text-indigo-700 hover:bg-indigo-200/80 hover:scale-105 shadow-md shadow-indigo-300/30'
                            : 'bg-indigo-500/30 text-indigo-200 hover:bg-indigo-500/40 hover:scale-105 shadow-md shadow-indigo-500/30'
                          : message.id === '1' && message.ttsStatus === 'generating'
                          ? isDayMode
                            ? 'bg-gray-200/60 text-gray-600 cursor-wait'
                            : 'bg-gray-600/40 text-gray-400 cursor-wait'
                          : isDayMode
                            ? 'bg-gray-200/40 text-gray-500 cursor-not-allowed opacity-60'
                            : 'bg-gray-600/30 text-gray-500 cursor-not-allowed opacity-60'
                      }`}
                      title={
                        message.id === '1' && message.ttsStatus === 'ready'
                          ? 'Play audio'
                          : message.id === '1' && message.ttsStatus === 'generating'
                          ? 'Generating audio...'
                          : 'Audio not available for this message'
                      }
                    >
                      {message.id === '1' && message.ttsStatus === 'generating' ? (
                        <>
                          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Generating...</span>
                        </>
                      ) : message.id === '1' && message.ttsStatus === 'ready' ? (
                        <>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          <span>Listen</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                          </svg>
                          <span>No audio</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                {/* User avatar in messages (right side) */}
                {message.sender === 'user' && (
                  <img
                    src={userAvatar}
                    alt="You"
                    className={`h-12 w-12 rounded-full object-cover flex-shrink-0 border-2 transition-all duration-500 ${
                      isDayMode ? 'border-white/80 shadow-lg' : 'border-indigo-400/60'
                    }`}
                  />
                )}
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start items-end gap-2 animate-fadeIn">
                <img
                  src={healer.avatarSrc}
                  alt={healer.name}
                  className="h-12 w-12 rounded-full object-cover flex-shrink-0"
                />
                <div className={`rounded-2xl px-4 py-3 transition-all duration-500 ${
                  isDayMode ? 'bg-white/80' : 'bg-navy/70'
                } ${isDayMode ? 'text-gray-800' : 'text-white'}`}>
                  <div className="flex gap-1">
                    <div className={`h-2 w-2 rounded-full animate-bounce ${
                      isDayMode ? 'bg-indigo-500/60' : 'bg-white/60'
                    }`} style={{ animationDelay: '0s' }}></div>
                    <div className={`h-2 w-2 rounded-full animate-bounce ${
                      isDayMode ? 'bg-indigo-500/60' : 'bg-white/60'
                    }`} style={{ animationDelay: '0.2s' }}></div>
                    <div className={`h-2 w-2 rounded-full animate-bounce ${
                      isDayMode ? 'bg-indigo-500/60' : 'bg-white/60'
                    }`} style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area - fixed at bottom */}
        <div className={`border-t px-4 py-4 backdrop-blur-sm flex-shrink-0 transition-all duration-500 ${
          isDayMode 
            ? 'bg-white/40 border-gray-200/20' 
            : 'bg-navy/70 border-white/20'
        }`}>
          <div className="mx-auto max-w-3xl">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share what's on your mind tonight..."
                className={`flex-1 rounded-full px-6 py-3 transition-all duration-500 focus:outline-none focus:ring-2 ${
                  isDayMode
                    ? 'bg-white/80 text-gray-800 placeholder-gray-500 focus:ring-indigo-400'
                    : 'bg-white/10 text-white placeholder-white/50 focus:ring-lavender-DEFAULT'
                }`}
                disabled={isSending}
              />
              <button
                onClick={sendMessage}
                disabled={!inputText.trim() || isSending}
                className={`rounded-full px-6 py-3 font-semibold text-white border-2 transition-all duration-500 ${
                  inputText.trim() && !isSending
                    ? isDayMode
                      ? 'bg-indigo-600/90 border-indigo-500/70 shadow-2xl shadow-indigo-500/40 hover:bg-indigo-500/90 hover:shadow-indigo-500/50 hover:scale-[1.02] cursor-pointer'
                      : 'bg-indigo-800/80 border-indigo-500/60 shadow-2xl shadow-indigo-500/30 hover:bg-indigo-700/80 hover:shadow-indigo-500/40 hover:scale-[1.02] cursor-pointer'
                    : 'bg-gray-600 border-transparent opacity-60 cursor-not-allowed'
                }`}
              >
                Send
              </button>
            </div>
            <p className={`mt-3 text-center text-xs transition-colors duration-500 ${
              isDayMode ? 'text-gray-600' : 'text-white/40'
            }`}>
              NightWhisper is for everyday emotional support and cannot replace professional therapy.
            </p>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
};


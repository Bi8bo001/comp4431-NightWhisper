import React, { useState, useRef, useEffect } from 'react';
import { AnimatedBackground } from './AnimatedBackground';
import { Healer, Message } from '../types';
import { getChatResponse, convertToChatMessage } from '../services/chatService';
import { ChatMessage } from '../api/types';

interface ChatScreenProps {
  healer: Healer;
  userAvatar: string;
}

// Note: Fake responses removed - now using API

export const ChatScreen: React.FC<ChatScreenProps> = ({ healer, userAvatar }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hello, I'm ${healer.name}. ${healer.description.split('.')[0]}. I'll stay with you while you talk.`,
      sender: 'healer',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Maintain conversation history in API format
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello, I'm ${healer.name}. ${healer.description.split('.')[0]}. I'll stay with you while you talk.`,
    },
  ]);

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
        };
        setMessages((prev) => [...prev, healerResponse]);
        setConversationHistory((prev) => [
          ...prev,
          convertToChatMessage(response.message, 'healer'),
        ]);
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

  return (
    <AnimatedBackground backgroundImage={healer.backgroundImage}>
      <div className="flex min-h-screen flex-col">
        {/* Header bar */}
        <div className="border-b border-white/10 bg-navy/50 px-4 py-4 backdrop-blur-sm">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={healer.avatarSrc}
                alt={healer.name}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <div className="text-sm font-semibold text-white">
                  {healer.name} · {healer.keyword}
                </div>
                <div className="text-xs text-white/60">
                  "I'll stay with you while you talk."
                </div>
              </div>
            </div>
            <div className="rounded-full bg-lavender-DEFAULT/20 px-4 py-1 text-xs font-semibold text-lavender-light">
              NightWhisper
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
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
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    message.sender === 'user'
                      ? 'text-white shadow-lg'
                      : 'bg-navy/70 text-white'
                  }`}
                  style={
                    message.sender === 'user'
                      ? { backgroundColor: 'rgba(83, 255, 206, 0.23)' } // lavender-dark with 70% opacity
                      : undefined
                  }
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
                {/* User avatar in messages (right side) */}
                {message.sender === 'user' && (
                  <img
                    src={userAvatar}
                    alt="You"
                    className="h-12 w-12 rounded-full object-cover flex-shrink-0 border-2 border-indigo-400/60"
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
                <div className="bg-navy/70 rounded-2xl px-4 py-3 text-white">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="h-2 w-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-2 w-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="border-t border-white/10 bg-navy/50 px-4 py-4 backdrop-blur-sm">
          <div className="mx-auto max-w-3xl">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share what's on your mind tonight..."
                className="flex-1 rounded-full bg-white/10 px-6 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-lavender-DEFAULT"
                disabled={isSending}
              />
              <button
                onClick={sendMessage}
                disabled={!inputText.trim() || isSending}
                className={`rounded-full px-6 py-3 font-semibold text-white border-2 transition-all ${
                  inputText.trim() && !isSending
                    ? 'bg-indigo-800/80 border-indigo-500/60 shadow-2xl shadow-indigo-500/30 hover:bg-indigo-700/80 hover:shadow-indigo-500/40 hover:scale-[1.02] cursor-pointer'
                    : 'bg-gray-600 border-transparent opacity-60 cursor-not-allowed'
                }`}
              >
                Send
              </button>
            </div>
            <p className="mt-3 text-center text-xs text-white/40">
              NightWhisper is for everyday emotional support and cannot replace professional therapy.
            </p>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
};


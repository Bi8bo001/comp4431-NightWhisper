import React, { useState, useRef, useEffect } from 'react';
import { AnimatedBackground } from './AnimatedBackground';
import { Healer, Message } from '../types';

interface ChatScreenProps {
  healer: Healer;
}

// Generate fake healer responses based on selected healer
const getFakeResponse = (healer: Healer, userMessage: string): string => {
  const responses: Record<string, string[]> = {
    leo: [
      "Let's break this down together. What's the core issue you're facing?",
      "I see multiple layers here. Can we examine this step by step?",
      "That's a complex situation. What patterns do you notice in how you're thinking about this?",
      "Let's approach this analytically. What would a clear perspective look like here?",
    ],
    max: [
      "I'm so glad you're here sharing this! Even in the darkness, there are small lights.",
      "You're doing something brave by talking about this. What's one thing that felt okay today?",
      "I believe in your strength, even when it doesn't feel like you have any. What's one step forward?",
      "Thank you for trusting me with this. You're not alone, and there's always a way through.",
    ],
    luna: [
      "Take a deep breath with me. There's no rush—we can sit with this together.",
      "I feel the restlessness in your words. Let's find a quiet space within.",
      "Everything can slow down here. What do you notice when you pause?",
      "Your breath is steady. What would it feel like to let this moment be as it is?",
    ],
    milo: [
      "I hear how heavy this feels for you. Would you like to tell me what happened today?",
      "That sounds really difficult. I'm here with you, and your feelings are completely valid.",
      "Thank you for sharing that with me. What would feel most helpful right now?",
      "I can sense the weight of what you're carrying. You don't have to hold it alone.",
    ],
  };

  const healerResponses = responses[healer.id] || responses.milo;
  return healerResponses[Math.floor(Math.random() * healerResponses.length)];
};

export const ChatScreen: React.FC<ChatScreenProps> = ({ healer }) => {
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isSending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsSending(true);

    // Simulate API delay (0.8-1.2 seconds)
    const delay = 800 + Math.random() * 400;
    setTimeout(() => {
      const healerResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getFakeResponse(healer, inputText),
        sender: 'healer',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, healerResponse]);
      setIsSending(false);
    }, delay);
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
                {/* Healer avatar in messages */}
                {message.sender === 'healer' && (
                  <img
                    src={healer.avatarSrc}
                    alt={healer.name}
                    className="h-12 w-12 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    message.sender === 'user'
                      ? 'bg-lavender-DEFAULT text-white'
                      : 'bg-navy/70 text-white'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
                {/* User messages don't have avatar */}
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


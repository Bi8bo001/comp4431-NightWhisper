export interface Healer {
  id: string;
  name: string;
  keyword: string;
  description: string;
  avatarSrc: string;
  backgroundImage: string;
  bubbleColor: string; // CSS color for message bubbles
}

export type Screen = 'landing' | 'avatar' | 'healer' | 'chat';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'healer';
  timestamp: Date;
  audioUrl?: string; // URL to TTS audio file (for healer messages)
  ttsStatus?: 'idle' | 'generating' | 'ready' | 'error'; // TTS generation status
}

// Mood Calendar Types
export interface MoodEntry {
  date: string; // YYYY-MM-DD format
  mood: number; // 1-5 scale (1 = worst, 5 = best)
}

// Diary Types
export interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  content: string;
  timestamp: Date;
}

// Voice Mailbox Types
export interface VoiceMessage {
  id: string;
  healerId: string;
  title: string;
  content: string;
  audioUrl: string;
  date: string; // YYYY-MM-DD format
  category: 'encouragement' | 'tips' | 'inspiration';
}


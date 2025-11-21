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
}


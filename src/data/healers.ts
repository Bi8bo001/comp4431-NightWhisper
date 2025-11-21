import { Healer } from '../types';

export const healers: Healer[] = [
  {
    id: 'leo',
    name: 'Leo',
    keyword: 'Clarity',
    description: 'Calm and analytical, Leo brings logic, perspective, and structured thinking to help untangle complex thoughts.',
    avatarSrc: '/fig/owl.png',
    backgroundImage: '/fig/owl-bg.JPG',
    bubbleColor: '#2563eb', // Blue
  },
  {
    id: 'max',
    name: 'Max',
    keyword: 'Encouragement',
    description: 'Bright and upbeat, Max brings lightness, hope, and small sparks of motivation to lift your spirits.',
    avatarSrc: '/fig/dog.png',
    backgroundImage: '/fig/dog-bg.jpg',
    bubbleColor: '#ea580c', // Orange
  },
  {
    id: 'luna',
    name: 'Luna',
    keyword: 'Stillness',
    description: 'Gentle and present, Luna brings a sense of peace, deep listening, and a safe space for your emotions to settle.',
    avatarSrc: '/fig/deer.png',
    backgroundImage: '/fig/deer-bg.jpg',
    bubbleColor: '#16a34a', // Green
  },
  {
    id: 'milo',
    name: 'Milo',
    keyword: 'Comfort',
    description: 'Warm and patient, Milo brings a quiet, nurturing presence and a soft place for you to feel heard and held.',
    avatarSrc: '/fig/bunny.png',
    backgroundImage: '/fig/bunny-bg.jpg',
    bubbleColor: '#6b46c1', // Dark purple
  },
];


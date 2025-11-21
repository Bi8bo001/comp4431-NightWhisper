# NightWhisper 🌙

A gentle space for your late-night thoughts. A calm, dreamy web app that matches you with a soft-spoken companion who listens without judgement.

## Features

- **Landing Screen**: Welcome page with night-sky aesthetics
- **Healer Selection**: Choose from four animal companions (Luna, Sol, Aira, Nova)
- **Chat Interface**: Interactive chat with your selected healer

## Tech Stack

- React 18 + TypeScript
- Tailwind CSS for styling
- Vite for build tooling

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to the URL shown in the terminal (usually `http://localhost:5173`)

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Project Structure

```
project-code/
├── public/
│   └── fig/          # Background images and healer avatars
├── src/
│   ├── components/   # React components
│   │   ├── AnimatedBackground.tsx
│   │   ├── LandingScreen.tsx
│   │   ├── HealerSelectionScreen.tsx
│   │   └── ChatScreen.tsx
│   ├── data/         # Data definitions
│   │   └── healers.ts
│   ├── types.ts      # TypeScript type definitions
│   ├── App.tsx       # Main app component
│   ├── main.tsx      # Entry point
│   └── index.css     # Global styles
├── index.html
└── package.json
```

## API Integration

The chat interface currently uses simulated responses. To connect to your GPT-4o + RAG backend:

1. Update the `sendMessage` function in `src/components/ChatScreen.tsx`
2. Replace the simulated response with a call to `POST /api/chat`
3. Pass the user message and selected healer context to your API

## Notes

- All images should be placed in `public/fig/` directory
- The app uses Tailwind CSS utility classes for styling
- Screen transitions are handled via React state management
- Animations are kept gentle and subtle for a calm atmosphere

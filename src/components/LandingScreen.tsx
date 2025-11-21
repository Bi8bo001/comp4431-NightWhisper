import React from 'react';
import { AnimatedBackground } from './AnimatedBackground';

interface LandingScreenProps {
  onGetStarted: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onGetStarted }) => {
  return (
    <AnimatedBackground backgroundImage="/fig/bg3.jpg" enhanced={true}>
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-[480px] animate-fadeIn">
          {/* Main card */}
          <div className="rounded-2xl bg-navy/70 p-8 shadow-xl backdrop-blur-sm">
            {/* Slogan Image - inside card, above title */}
            <div className="mb-3 flex justify-center animate-fadeIn" style={{ animationDelay: '0.1s' }}>
              <img 
                src="/fig/slogan.png" 
                alt="NightWhisper Slogan" 
                className="max-w-full h-auto drop-shadow-2xl"
                style={{ 
                  maxHeight: '160px',
                  filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.3))',
                }}
              />
            </div>

            {/* Text content */}
            <h1 className="mb-8 text-center text-4xl font-semibold text-white">
              Welcome to NightWhisper
            </h1>
            <p className="mb-12 text-center text-xl text-lavender-light">
              Softly, You Heal.
            </p>

            {/* Get Started button */}
            <button
              onClick={onGetStarted}
              className="w-full rounded-full bg-gray-600 border-2 border-transparent opacity-60 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-indigo-800/80 hover:border-indigo-500/60 hover:shadow-2xl hover:shadow-indigo-500/30 hover:opacity-100 hover:scale-[1.02] cursor-pointer"
            >
              GET STARTED
            </button>
          </div>

          {/* Scroll indicator at bottom */}
          <div className="mt-12 flex justify-center">
            <div className="h-1 w-16 rounded-full bg-white/20"></div>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
};


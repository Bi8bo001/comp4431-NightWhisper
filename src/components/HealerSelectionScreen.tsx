import React, { useState } from 'react';
import { AnimatedBackground } from './AnimatedBackground';
import { Healer } from '../types';
import { healers } from '../data/healers';

interface HealerSelectionScreenProps {
  onContinue: (healer: Healer) => void;
}

export const HealerSelectionScreen: React.FC<HealerSelectionScreenProps> = ({
  onContinue,
}) => {
  const [selectedHealer, setSelectedHealer] = useState<Healer | null>(null);

  const handleHealerClick = (healer: Healer) => {
    setSelectedHealer(healer);
  };

  const handleContinue = () => {
    if (selectedHealer) {
      onContinue(selectedHealer);
    }
  };

  return (
    <AnimatedBackground backgroundImage="/fig/bg4.jpg" enhanced={true}>
      <div className="min-h-screen px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Intro text at top */}
          <div className="mb-8 animate-fadeIn">
            <div className="mb-2 text-center text-xs uppercase tracking-wider text-lavender-light">
              TONIGHT'S COMPANION
            </div>
            <h2 className="mb-4 text-center text-3xl font-semibold text-white">
              Good evening, I'm here to keep you company.
            </h2>
            <div className="space-y-2 text-center text-sm text-white/80">
              <p>
                Before we talk, choose the night healer whose energy feels right for you tonight.
              </p>
              <p>You can always come back and try a different companion.</p>
            </div>
          </div>

          {/* Healer grid */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {healers.map((healer, index) => (
              <div
                key={healer.id}
                className={`cursor-pointer rounded-2xl bg-navy/70 p-6 shadow-xl transition-all hover:scale-105 ${
                  selectedHealer?.id === healer.id
                    ? 'border-2 border-indigo-300 shadow-2xl shadow-indigo-300/30'
                    : 'border-2 border-transparent'
                } animate-slideUp`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleHealerClick(healer)}
              >
                <div className="flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div className="relative mb-4">
                    <img
                      src={healer.avatarSrc}
                      alt={healer.name}
                      className="h-24 w-24 rounded-full object-cover"
                    />
                    {selectedHealer?.id === healer.id && (
                      <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-300 text-navy shadow-lg">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Name and keyword */}
                  <div className="mb-2 text-lg font-semibold text-white">
                    {healer.name} · {healer.keyword}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-white/70">{healer.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Selection status and continue button */}
          <div className="animate-fadeIn">
            {selectedHealer && (
              <p className="mb-4 text-center text-sm text-lavender-light">
                Tonight, you are choosing: <span className="font-semibold">{selectedHealer.name}</span>
              </p>
            )}
            <button
              onClick={handleContinue}
              disabled={!selectedHealer}
              className={`mx-auto block w-full max-w-xs rounded-full px-8 py-4 text-lg font-semibold text-white border-2 transition-all ${
                selectedHealer
                  ? 'bg-indigo-800/80 border-indigo-500/60 shadow-2xl shadow-indigo-500/30 hover:bg-indigo-700/80 hover:shadow-indigo-500/40 hover:scale-[1.02] cursor-pointer'
                  : 'bg-gray-600 border-transparent opacity-60 cursor-not-allowed'
              }`}
            >
              CONTINUE
            </button>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
};


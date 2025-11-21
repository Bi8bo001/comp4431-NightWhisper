import React, { useState } from 'react';
import { AnimatedBackground } from './AnimatedBackground';

interface AvatarSelectionScreenProps {
  onContinue: (avatarPath: string) => void;
}

const styles = ['style1', 'style2'];
const genders = ['female', 'male'];
const numbers = [1, 2, 3, 4, 5];

export const AvatarSelectionScreen: React.FC<AvatarSelectionScreenProps> = ({
  onContinue,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<string>(styles[0]);
  const [selectedGender, setSelectedGender] = useState<string>(genders[0]);
  const [selectedNumber, setSelectedNumber] = useState<number>(numbers[0]);

  const handleContinue = () => {
    const avatarPath = `/avatar/${selectedStyle}/${selectedGender}${selectedNumber}.png`;
    onContinue(avatarPath);
  };

  return (
    <AnimatedBackground backgroundImage="/fig/bg1.jpg" enhanced={true}>
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl animate-fadeIn">
          {/* Main card */}
          <div className="rounded-2xl bg-navy/70 p-8 shadow-xl backdrop-blur-sm">
            {/* Title */}
            <h2 className="mb-2 text-center text-2xl font-semibold text-white">
              Choose Your Avatar
            </h2>
            <p className="mb-8 text-center text-sm text-white/70">
              Select a style, gender, and avatar that represents you
            </p>

            {/* Style Selection */}
            <div className="mb-6">
              <label className="mb-3 block text-center text-sm font-medium text-lavender-light">
                Style
              </label>
              <div className="flex justify-center gap-4">
                {styles.map((style) => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all ${
                      selectedStyle === style
                        ? 'bg-indigo-600 border-2 border-indigo-400 shadow-lg shadow-indigo-400/40'
                        : 'bg-gray-700/50 border-2 border-transparent hover:bg-gray-600/50'
                    }`}
                  >
                    {style === 'style1' ? 'Soft Anime' : 'Calm Minimal'}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender Selection */}
            <div className="mb-6">
              <label className="mb-3 block text-center text-sm font-medium text-lavender-light">
                Gender
              </label>
              <div className="flex justify-center gap-4">
                {genders.map((gender) => (
                  <button
                    key={gender}
                    onClick={() => setSelectedGender(gender)}
                    className={`rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all capitalize ${
                      selectedGender === gender
                        ? 'bg-indigo-600 border-2 border-indigo-400 shadow-lg shadow-indigo-400/40'
                        : 'bg-gray-700/50 border-2 border-transparent hover:bg-gray-600/50'
                    }`}
                  >
                    {gender}
                  </button>
                ))}
              </div>
            </div>

            {/* Avatar Number Selection - Scrollable Wheel */}
            <div className="mb-8">
              <label className="mb-3 block text-center text-sm font-medium text-lavender-light">
                Avatar
              </label>
              <div className="flex justify-center">
                <div className="relative w-full max-w-md rounded-2xl bg-navy/50 p-6">
                  {/* Scrollable container with extra padding for glow effect */}
                  <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto scrollbar-hide px-2 py-2">
                    {numbers.map((num, index) => {
                      const avatarPath = `/avatar/${selectedStyle}/${selectedGender}${num}.png`;
                      return (
                        <button
                          key={num}
                          onClick={() => setSelectedNumber(num)}
                          className={`flex min-w-[100px] snap-center flex-col items-center gap-2 rounded-xl p-3 transition-all ${
                            selectedNumber === num
                              ? 'scale-110 border-2 border-indigo-400 bg-indigo-500/20 shadow-xl shadow-indigo-400/50'
                              : 'border-2 border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                          }`}
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <img
                            src={avatarPath}
                            alt={`${selectedGender} ${num}`}
                            className="h-20 w-20 rounded-full object-cover transition-transform"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="mb-6 flex justify-center animate-fadeIn">
              <div className="rounded-full border-4 border-indigo-400/60 p-2 shadow-lg shadow-indigo-400/30 transition-all hover:scale-110">
                <img
                  src={`/avatar/${selectedStyle}/${selectedGender}${selectedNumber}.png`}
                  alt="Selected avatar"
                  className="h-24 w-24 rounded-full object-cover"
                />
              </div>
            </div>

            {/* Continue button */}
            <button
              onClick={handleContinue}
              className="w-full rounded-full bg-indigo-800/80 border-2 border-indigo-500/60 shadow-2xl shadow-indigo-500/30 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-indigo-700/80 hover:shadow-indigo-500/40 hover:scale-[1.02] cursor-pointer"
            >
              CONTINUE
            </button>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
};


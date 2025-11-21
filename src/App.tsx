import React, { useState } from 'react';
import { LandingScreen } from './components/LandingScreen';
import { AvatarSelectionScreen } from './components/AvatarSelectionScreen';
import { HealerSelectionScreen } from './components/HealerSelectionScreen';
import { ChatScreen } from './components/ChatScreen';
import { Screen, Healer } from './types';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [selectedHealer, setSelectedHealer] = useState<Healer | null>(null);
  const [userAvatar, setUserAvatar] = useState<string>('/avatar/style1/female1.png');

  const handleGetStarted = () => {
    setCurrentScreen('avatar');
  };

  const handleAvatarSelected = (avatarPath: string) => {
    setUserAvatar(avatarPath);
    setCurrentScreen('healer');
  };

  const handleHealerSelected = (healer: Healer) => {
    setSelectedHealer(healer);
    setCurrentScreen('chat');
  };

  return (
    <div className="min-h-screen">
      {currentScreen === 'landing' && <LandingScreen onGetStarted={handleGetStarted} />}
      {currentScreen === 'avatar' && (
        <AvatarSelectionScreen onContinue={handleAvatarSelected} />
      )}
      {currentScreen === 'healer' && (
        <HealerSelectionScreen onContinue={handleHealerSelected} />
      )}
      {currentScreen === 'chat' && selectedHealer && (
        <ChatScreen healer={selectedHealer} userAvatar={userAvatar} />
      )}
    </div>
  );
}

export default App;


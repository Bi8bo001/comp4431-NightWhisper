import React, { useState } from 'react';
import { LandingScreen } from './components/LandingScreen';
import { HealerSelectionScreen } from './components/HealerSelectionScreen';
import { ChatScreen } from './components/ChatScreen';
import { Screen, Healer } from './types';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [selectedHealer, setSelectedHealer] = useState<Healer | null>(null);

  const handleGetStarted = () => {
    setCurrentScreen('healer');
  };

  const handleHealerSelected = (healer: Healer) => {
    setSelectedHealer(healer);
    setCurrentScreen('chat');
  };

  return (
    <div className="min-h-screen">
      {currentScreen === 'landing' && <LandingScreen onGetStarted={handleGetStarted} />}
      {currentScreen === 'healer' && (
        <HealerSelectionScreen onContinue={handleHealerSelected} />
      )}
      {currentScreen === 'chat' && selectedHealer && <ChatScreen healer={selectedHealer} />}
    </div>
  );
}

export default App;


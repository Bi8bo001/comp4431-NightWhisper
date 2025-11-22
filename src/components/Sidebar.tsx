import React, { useState } from 'react';
import { MoodCalendar } from './MoodCalendar';
import { Diary } from './Diary';
import { VoiceMailbox } from './VoiceMailbox';
import { Healer } from '../types';

interface SidebarProps {
  healer: Healer;
  isDayMode: boolean;
  onToggle?: (isOpen: boolean) => void;
  isOpen?: boolean;
  stopGreetingAudio?: () => void;
  stopVoiceMailboxAudioRef?: React.MutableRefObject<(() => void) | null>;
}

type SidebarTab = 'mood' | 'diary' | 'mailbox';

export const Sidebar: React.FC<SidebarProps> = ({ healer, isDayMode, onToggle, isOpen: externalIsOpen, stopGreetingAudio, stopVoiceMailboxAudioRef }) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('mood');
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  
  const handleToggle = () => {
    if (onToggle) {
      onToggle(!isOpen);
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  return (
    <div
      className={`fixed left-0 top-0 h-full z-40 transition-all duration-500 ${
        isOpen ? 'w-80' : 'w-0'
      } ${isDayMode ? 'bg-gradient-to-b from-white/50 to-white/40' : 'bg-gradient-to-b from-navy/50 to-navy/40'} backdrop-blur-md border-r ${
        isDayMode ? 'border-indigo-200/30 shadow-2xl' : 'border-indigo-400/20 shadow-2xl shadow-indigo-500/10'
      } flex flex-col`}
    >
      {/* Toggle Button - Outside sidebar, on the right edge */}
      <button
        onClick={handleToggle}
        className={`absolute -right-12 top-4 p-2.5 rounded-full transition-all duration-500 hover:scale-110 ${
          isDayMode
            ? 'bg-white/90 text-indigo-600 hover:bg-white shadow-lg'
            : 'bg-indigo-500/40 text-indigo-200 hover:bg-indigo-500/50 shadow-lg shadow-indigo-500/30'
        } backdrop-blur-sm border-2 ${
          isDayMode ? 'border-indigo-200/50' : 'border-indigo-400/50'
        }`}
        title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <svg
          className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-0' : 'rotate-180'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      {isOpen && (
        <>
          {/* Tab Navigation - More elegant design */}
          <div className={`flex border-b ${isDayMode ? 'border-indigo-200/40' : 'border-indigo-400/30'} bg-gradient-to-r ${isDayMode ? 'from-indigo-50/50 to-transparent' : 'from-indigo-500/10 to-transparent'}`}>
            <button
              onClick={() => setActiveTab('mood')}
              className={`flex-1 px-4 py-3.5 text-sm font-semibold transition-all duration-300 relative ${
                activeTab === 'mood'
                  ? isDayMode
                    ? 'text-indigo-700'
                    : 'text-indigo-200'
                  : isDayMode
                  ? 'text-gray-600 hover:text-indigo-600'
                  : 'text-white/60 hover:text-indigo-200'
              }`}
            >
              {activeTab === 'mood' && (
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDayMode ? 'bg-indigo-500' : 'bg-indigo-400'} rounded-t-full`} />
              )}
              📅 Mood
            </button>
            <button
              onClick={() => setActiveTab('diary')}
              className={`flex-1 px-4 py-3.5 text-sm font-semibold transition-all duration-300 relative ${
                activeTab === 'diary'
                  ? isDayMode
                    ? 'text-indigo-700'
                    : 'text-indigo-200'
                  : isDayMode
                  ? 'text-gray-600 hover:text-indigo-600'
                  : 'text-white/60 hover:text-indigo-200'
              }`}
            >
              {activeTab === 'diary' && (
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDayMode ? 'bg-indigo-500' : 'bg-indigo-400'} rounded-t-full`} />
              )}
              📝 Diary
            </button>
            <button
              onClick={() => setActiveTab('mailbox')}
              className={`flex-1 px-4 py-3.5 text-sm font-semibold transition-all duration-300 relative ${
                activeTab === 'mailbox'
                  ? isDayMode
                    ? 'text-indigo-700'
                    : 'text-indigo-200'
                  : isDayMode
                  ? 'text-gray-600 hover:text-indigo-600'
                  : 'text-white/60 hover:text-indigo-200'
              }`}
            >
              {activeTab === 'mailbox' && (
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDayMode ? 'bg-indigo-500' : 'bg-indigo-400'} rounded-t-full`} />
              )}
              📬 Mailbox
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'mood' && <MoodCalendar isDayMode={isDayMode} />}
            {activeTab === 'diary' && <Diary isDayMode={isDayMode} />}
            {activeTab === 'mailbox' && (
              <VoiceMailbox 
                healer={healer} 
                isDayMode={isDayMode}
                stopGreetingAudio={stopGreetingAudio}
                stopVoiceMailboxAudioRef={stopVoiceMailboxAudioRef}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};


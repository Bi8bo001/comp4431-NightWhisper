import React, { useState, useEffect } from 'react';
import { DiaryEntry } from '../types';

interface DiaryProps {
  isDayMode: boolean;
}

export const Diary: React.FC<DiaryProps> = ({ isDayMode }) => {
  const [entries, setEntries] = useState<DiaryEntry[]>(() => {
    const saved = localStorage.getItem('diaryEntries');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');

  useEffect(() => {
    const entry = entries.find((e) => e.date === selectedDate);
    setContent(entry ? entry.content : '');
  }, [selectedDate, entries]);

  const handleSave = () => {
    const entry: DiaryEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      content: content.trim(),
      timestamp: new Date(),
    };

    const newEntries = entries.filter((e) => e.date !== selectedDate);
    newEntries.push(entry);
    // Sort by date in ascending order (oldest first)
    newEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    setEntries(newEntries);
    localStorage.setItem('diaryEntries', JSON.stringify(newEntries));
    
    // Entry saved silently (no alert)
  };

  const getDatesWithEntries = (): string[] => {
    // Sort by date in ascending order (oldest first)
    return entries.map((e) => e.date).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  };

  return (
    <div className={`p-4 h-full flex flex-col ${isDayMode ? 'text-gray-800' : 'text-white'}`}>
      {/* Date Selector */}
      <div className="mb-4">
        <label
          className={`block text-sm font-semibold mb-2 ${
            isDayMode ? 'text-gray-700' : 'text-white/80'
          }`}
        >
          Date:
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          autoComplete="off"
          className={`w-full px-3 py-2 rounded-lg transition-all ${
            isDayMode
              ? 'bg-white/80 text-gray-800 border border-gray-300'
              : 'bg-white/10 text-white border border-white/20'
          } focus:outline-none focus:ring-2 focus:ring-indigo-400`}
        />
      </div>

      {/* Entries with dates */}
      <div className="mb-4">
        <label
          className={`block text-sm font-semibold mb-2 ${
            isDayMode ? 'text-gray-700' : 'text-white/80'
          }`}
        >
          Previous Entries:
        </label>
        <div className="max-h-32 overflow-y-auto space-y-1">
          {getDatesWithEntries().length > 0 ? (
            getDatesWithEntries().map((date) => {
              const entry = entries.find((e) => e.date === date);
              return (
                <div key={date} className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedDate(date)}
                    className={`flex-1 text-left px-3 py-2 rounded-lg text-xs transition-all hover:scale-105 ${
                      selectedDate === date
                        ? isDayMode
                          ? 'bg-indigo-100/80 text-indigo-700'
                          : 'bg-indigo-500/30 text-indigo-200'
                        : isDayMode
                        ? 'bg-gray-100/50 text-gray-700 hover:bg-gray-200/70'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {new Date(date).toLocaleDateString()} {entry && '📝'}
                  </button>
                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this diary entry?')) {
                        const newEntries = entries.filter((e) => e.date !== date);
                        setEntries(newEntries);
                        localStorage.setItem('diaryEntries', JSON.stringify(newEntries));
                        if (selectedDate === date) {
                          setContent('');
                          setSelectedDate(new Date().toISOString().split('T')[0]);
                        }
                      }
                    }}
                    className={`p-1.5 rounded-lg transition-all hover:scale-110 ${
                      isDayMode
                        ? 'bg-red-100/80 text-red-600 hover:bg-red-200/80'
                        : 'bg-red-500/30 text-red-300 hover:bg-red-500/40'
                    }`}
                    title="Delete entry"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })
          ) : (
            <p className={`text-xs ${isDayMode ? 'text-gray-500' : 'text-white/50'}`}>
              No entries yet
            </p>
          )}
        </div>
      </div>

      {/* Text Area */}
      <div className="flex-1 flex flex-col mb-4">
        <label
          className={`block text-sm font-semibold mb-2 ${
            isDayMode ? 'text-gray-700' : 'text-white/80'
          }`}
        >
          Your Thoughts:
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your thoughts, feelings, or anything you want to remember..."
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          className={`flex-1 w-full px-4 py-3 rounded-lg resize-none transition-all ${
            isDayMode
              ? 'bg-white/80 text-gray-800 border border-gray-300 placeholder-gray-400'
              : 'bg-white/10 text-white border border-white/20 placeholder-white/40'
          } focus:outline-none focus:ring-2 focus:ring-indigo-400`}
        />
      </div>

      {/* Save Button - Unified style with Send button */}
      <button
        onClick={handleSave}
        disabled={!content.trim()}
        className={`w-full py-3 rounded-full font-semibold text-white border-2 transition-all duration-500 ${
          content.trim()
            ? isDayMode
              ? 'bg-indigo-600/90 border-indigo-500/70 shadow-2xl shadow-indigo-500/40 hover:bg-indigo-500/90 hover:shadow-indigo-500/50 hover:scale-[1.02] cursor-pointer'
              : 'bg-indigo-800/80 border-indigo-500/60 shadow-2xl shadow-indigo-500/30 hover:bg-indigo-700/80 hover:shadow-indigo-500/40 hover:scale-[1.02] cursor-pointer'
            : 'bg-gray-600 border-transparent opacity-60 cursor-not-allowed'
        }`}
      >
        Save Entry
      </button>
    </div>
  );
};


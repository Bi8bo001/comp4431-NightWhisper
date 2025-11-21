import React, { useState, useMemo } from 'react';
import { MoodEntry } from '../types';

interface MoodCalendarProps {
  isDayMode: boolean;
}

// Softer, more pastel colors with higher opacity
const MOOD_COLORS = [
  'rgba(239, 68, 68, 0.4)',   // Soft red (worst) - 40% opacity
  'rgba(249, 115, 22, 0.45)', // Soft orange - 45% opacity
  'rgba(234, 179, 8, 0.5)',   // Soft yellow - 50% opacity
  'rgba(34, 197, 94, 0.55)',  // Soft light green - 55% opacity
  'rgba(16, 185, 129, 0.6)',  // Soft green (best) - 60% opacity
];

const MOOD_LABELS = ['Very Low', 'Low', 'Okay', 'Good', 'Great'];

export const MoodCalendar: React.FC<MoodCalendarProps> = ({ isDayMode }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [moods, setMoods] = useState<MoodEntry[]>(() => {
    const saved = localStorage.getItem('moodCalendar');
    return saved ? JSON.parse(saved) : [];
  });
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [dateToEdit, setDateToEdit] = useState<Date | null>(null);
  const [tempSelectedMood, setTempSelectedMood] = useState<number | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = [];
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  }, [year, month, firstDay, daysInMonth]);

  const getMoodForDate = (date: Date | null): number | null => {
    if (!date) return null;
    const dateStr = date.toISOString().split('T')[0];
    const entry = moods.find((m) => m.date === dateStr);
    return entry ? entry.mood : null;
  };

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const existingMood = moods.find((m) => m.date === dateStr);
    setDateToEdit(date);
    setTempSelectedMood(existingMood ? existingMood.mood : null);
    setShowMoodSelector(true);
  };

  const handleMoodSelect = (mood: number) => {
    setTempSelectedMood(mood === tempSelectedMood ? null : mood); // Toggle selection
  };

  const handleConfirm = () => {
    if (!dateToEdit) return;
    
    const dateStr = dateToEdit.toISOString().split('T')[0];
    const existingIndex = moods.findIndex((m) => m.date === dateStr);

    if (tempSelectedMood === null) {
      // Remove mood entry
      const newMoods = moods.filter((m) => m.date !== dateStr);
      setMoods(newMoods);
      localStorage.setItem('moodCalendar', JSON.stringify(newMoods));
    } else {
      // Add or update mood entry
      const newMoods = [...moods];
      if (existingIndex >= 0) {
        newMoods[existingIndex].mood = tempSelectedMood;
      } else {
        newMoods.push({ date: dateStr, mood: tempSelectedMood });
      }
      setMoods(newMoods);
      localStorage.setItem('moodCalendar', JSON.stringify(newMoods));
    }
    
    setShowMoodSelector(false);
    setDateToEdit(null);
    setTempSelectedMood(null);
  };

  const handleCancel = () => {
    setShowMoodSelector(false);
    setDateToEdit(null);
    setTempSelectedMood(null);
  };

  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(year, month + delta, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`p-4 h-full ${isDayMode ? 'text-gray-800' : 'text-white'}`}>
      {/* Month Selector */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => changeMonth(-1)}
          className={`p-2 rounded-lg transition-all hover:scale-110 ${
            isDayMode
              ? 'bg-indigo-100/80 text-indigo-700 hover:bg-indigo-200/80'
              : 'bg-indigo-500/30 text-indigo-200 hover:bg-indigo-500/40'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-lg font-semibold">
          {monthNames[month]} {year}
        </h3>
        <button
          onClick={() => changeMonth(1)}
          className={`p-2 rounded-lg transition-all hover:scale-110 ${
            isDayMode
              ? 'bg-indigo-100/80 text-indigo-700 hover:bg-indigo-200/80'
              : 'bg-indigo-500/30 text-indigo-200 hover:bg-indigo-500/40'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {dayNames.map((day) => (
          <div
            key={day}
            className={`text-center text-xs font-semibold py-2 ${
              isDayMode ? 'text-gray-600' : 'text-white/60'
            }`}
          >
            {day}
          </div>
        ))}
        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const mood = getMoodForDate(date);
          const isToday =
            date.toDateString() === new Date().toDateString();
          const dateStr = date.toISOString().split('T')[0];

          return (
            <button
              key={dateStr}
              onClick={() => handleDateClick(date)}
              className={`aspect-square rounded-lg transition-all duration-300 hover:scale-110 ${
                mood
                  ? ''
                  : isDayMode
                  ? 'bg-gray-100/50 hover:bg-gray-200/70'
                  : 'bg-white/10 hover:bg-white/20'
              } ${isToday ? 'ring-2 ring-indigo-400' : ''}`}
              style={
                mood
                  ? {
                      backgroundColor: MOOD_COLORS[mood - 1],
                    }
                  : {}
              }
              title={mood ? `Mood: ${MOOD_LABELS[mood - 1]}` : 'Click to set mood'}
            >
              <span
                className={`text-xs font-semibold ${
                  mood && mood <= 2 ? 'text-white' : isDayMode ? 'text-gray-800' : 'text-white'
                }`}
              >
                {date.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mood Legend */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <p className={`text-xs font-semibold mb-2 ${isDayMode ? 'text-gray-600' : 'text-white/70'}`}>
          Mood Scale:
        </p>
        <div className="flex gap-1">
          {MOOD_COLORS.map((color, index) => (
            <div
              key={index}
              className="flex-1 h-6 rounded"
              style={{ backgroundColor: color }}
              title={MOOD_LABELS[index]}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className={isDayMode ? 'text-gray-600' : 'text-white/60'}>1</span>
          <span className={isDayMode ? 'text-gray-600' : 'text-white/60'}>5</span>
        </div>
      </div>

      {/* Mood Selector Modal - Similar to Healer Selection */}
      {showMoodSelector && dateToEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleCancel}>
          <div
            className={`rounded-2xl p-6 max-w-md w-full mx-4 ${
              isDayMode ? 'bg-white/95' : 'bg-navy/95'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={`text-lg font-semibold mb-2 ${isDayMode ? 'text-gray-800' : 'text-white'}`}>
              Select Your Mood
            </h3>
            <p className={`text-sm mb-4 ${isDayMode ? 'text-gray-600' : 'text-white/70'}`}>
              {dateToEdit.toLocaleDateString()}
            </p>
            
            {/* Mood Selection Grid - Similar to Healer Selection */}
            <div className="grid grid-cols-1 gap-3 mb-4">
              {MOOD_COLORS.map((color, index) => (
                <button
                  key={index}
                  onClick={() => handleMoodSelect(index + 1)}
                  className={`rounded-2xl p-4 transition-all hover:scale-105 ${
                    tempSelectedMood === index + 1
                      ? 'border-2 border-indigo-400 shadow-2xl shadow-indigo-400/30 scale-105'
                      : 'border-2 border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                        style={{ 
                          backgroundColor: color.replace('0.4', '0.8').replace('0.45', '0.85').replace('0.5', '0.9').replace('0.55', '0.95').replace('0.6', '1.0')
                        }}
                      >
                        <span className="text-white font-bold text-lg drop-shadow-md">{index + 1}</span>
                      </div>
                      <span className={`font-semibold ${isDayMode ? 'text-gray-800' : 'text-white'}`}>
                        {MOOD_LABELS[index]}
                      </span>
                    </div>
                    {tempSelectedMood === index + 1 && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-400 text-white shadow-lg">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            {/* Confirm/Cancel Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className={`flex-1 py-2.5 rounded-full font-semibold transition-all ${
                  isDayMode
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 py-2.5 rounded-full font-semibold text-white border-2 transition-all ${
                  isDayMode
                    ? 'bg-indigo-600/90 border-indigo-500/70 shadow-2xl shadow-indigo-500/40 hover:bg-indigo-500/90 hover:shadow-indigo-500/50 hover:scale-[1.02]'
                    : 'bg-indigo-800/80 border-indigo-500/60 shadow-2xl shadow-indigo-500/30 hover:bg-indigo-700/80 hover:shadow-indigo-500/40 hover:scale-[1.02]'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

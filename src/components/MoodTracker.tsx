/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, History, Calendar, Trash2, Smile, AlertCircle, BarChart3, Clock, Sparkles } from 'lucide-react';
import { MOOD_DEFINITIONS } from '../data';
import { MoodEntry, MoodType } from '../types';

interface MoodTrackerProps {
  moods: MoodEntry[];
  onAddMood: (mood: MoodType, note?: string) => void;
  onDeleteMood: (id: string) => void;
}

export default function MoodTracker({ moods, onAddMood, onDeleteMood }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [note, setNote] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) return;

    onAddMood(selectedMood, note.trim() || undefined);
    setSelectedMood(null);
    setNote('');
    
    // Show visual confirmation toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Calculate mood distributions
  const totalEntries = moods.length;
  const moodCounts = moods.reduce<Record<MoodType, number>>((acc, curr) => {
    acc[curr.mood] = (acc[curr.mood] || 0) + 1;
    return acc;
  }, {
    happy: 0,
    calm: 0,
    neutral: 0,
    tired: 0,
    stressed: 0,
    sad: 0,
    anxious: 0
  });

  const getPercentage = (count: number) => {
    if (totalEntries === 0) return 0;
    return Math.round((count / totalEntries) * 100);
  };

  const getMoodEmoji = (type: MoodType) => {
    const def = MOOD_DEFINITIONS.find(m => m.type === type);
    return def ? def.emoji : '😐';
  };

  const getMoodConfig = (type: MoodType) => {
    return MOOD_DEFINITIONS.find(m => m.type === type) || MOOD_DEFINITIONS[2];
  };

  // Format timestamp nicely
  const formatTime = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' • ' + 
           date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-800 dark:text-slate-200 py-2">
      
      {/* Toast Confirmation */}
      {showToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6 py-3 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Mood logged successfully to local storage!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Logging form (7 columns) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm space-y-6 text-left">
            <div className="space-y-1">
              <h2 className="font-headline-lg text-lg md:text-xl font-bold text-slate-800 dark:text-white">How are you feeling right now?</h2>
              <p className="text-xs text-slate-400">Select a mood and log your thoughts. Keeping a mood log builds emotional vocabulary.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Mood selector grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {MOOD_DEFINITIONS.map((mood) => {
                  const isSelected = selectedMood === mood.type;
                  return (
                    <button
                      key={mood.type}
                      type="button"
                      onClick={() => setSelectedMood(mood.type)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-150 active:scale-95 cursor-pointer ${
                        isSelected
                          ? `${mood.bg} border-emerald-600 dark:border-emerald-500 scale-105 font-semibold ring-2 ring-emerald-500/10`
                          : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <span className="text-2xl mb-1 block select-none">{mood.emoji}</span>
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-medium block">{mood.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Optional Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Context Note (Optional)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What is influencing your mood right now? E.g., Coffee, presentation over, great talk..."
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/40 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!selectedMood}
                  className="flex items-center gap-1.5 bg-[#2E7D32] hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white disabled:opacity-45 disabled:pointer-events-none font-semibold rounded-full px-6 py-2.5 text-xs shadow-sm cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Current Mood</span>
                </button>
              </div>

            </form>
          </div>

          {/* Recent Mood Logs List */}
          <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm space-y-4 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-500">
                <History className="w-4 h-4" />
                <h3 className="font-bold text-xs uppercase tracking-wider">Mood History Log</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">{totalEntries} check-ins</span>
            </div>

            {moods.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Smile className="w-8 h-8 opacity-45 mx-auto" />
                <p className="text-xs italic">Your mood logs will appear here. Start logging to identify daily trends!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[22rem] overflow-y-auto pr-1 custom-scrollbar">
                {moods.slice(0, 30).map((entry) => {
                  const config = getMoodConfig(entry.mood);
                  return (
                    <div 
                      key={entry.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/30 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl block select-none shrink-0">{config.emoji}</span>
                        <div className="min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className={`text-xs font-bold ${config.color}`}>{config.label}</span>
                            <span className="text-[10px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(entry.timestamp)}
                            </span>
                          </div>
                          {entry.note && (
                            <p className="text-xs text-slate-650 dark:text-slate-300 mt-1 truncate max-w-md">
                              {entry.note}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteMood(entry.id)}
                        className="p-1 rounded-lg hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 text-slate-350 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all cursor-pointer"
                        aria-label="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Mood Distribution & Statistics (5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm space-y-6 text-left">
            <div className="flex items-center gap-1.5 text-slate-500 pb-2 border-b border-slate-50 dark:border-slate-800">
              <BarChart3 className="w-4 h-4" />
              <h3 className="font-bold text-xs uppercase tracking-wider">Mood Distribution</h3>
            </div>

            {totalEntries === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <AlertCircle className="w-8 h-8 opacity-45 mx-auto" />
                <p className="text-xs italic">Log your first mood check-in to compile your distribution analytics!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {MOOD_DEFINITIONS.map((mood) => {
                  const count = moodCounts[mood.type];
                  const percentage = getPercentage(count);
                  
                  return (
                    <div key={mood.type} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <span>{mood.emoji}</span>
                          <span>{mood.label}</span>
                        </span>
                        <span>{count} check-ins ({percentage}%)</span>
                      </div>
                      
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            mood.type === 'happy' ? 'bg-emerald-500' :
                            mood.type === 'calm' ? 'bg-indigo-400' :
                            mood.type === 'neutral' ? 'bg-slate-400' :
                            mood.type === 'tired' ? 'bg-amber-400' :
                            mood.type === 'stressed' ? 'bg-orange-400' :
                            mood.type === 'sad' ? 'bg-blue-400' : 'bg-rose-400'
                          } transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

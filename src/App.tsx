/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Home as HomeIcon, BrainCircuit, Heart, BookOpen, BarChart3, 
  Wind, Info, Accessibility, Sparkles, Moon, Sun, Menu, X, ShieldAlert
} from 'lucide-react';
import { MoodEntry, JournalEntry, StressCheckResult, WellnessSettings, MoodType } from './types';
import Home from './components/Home';
import StressCheck from './components/StressCheck';
import MoodTracker from './components/MoodTracker';
import Journal from './components/Journal';
import Progress from './components/Progress';
import WellnessTools from './components/WellnessTools';
import About from './components/About';
import AccessibilitySettings from './components/AccessibilitySettings';
import FocusMode from './components/FocusMode';
import EmergencyCalm from './components/EmergencyCalm';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'stress' | 'mood' | 'journal' | 'progress' | 'tools' | 'about'>('home');
  const [showSettings, setShowSettings] = useState(false);

  // Core Data Logs State loaded from localStorage
  const [results, setResults] = useState<StressCheckResult[]>([]);
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);

  // Companion state variables
  const [bingoState, setBingoState] = useState<boolean[]>(Array(25).fill(false));
  const [memories, setMemories] = useState<any[]>([]);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [showEmergencyCalm, setShowEmergencyCalm] = useState(false);

  // Additional tracker states
  const [sleepEntries, setSleepEntries] = useState<any[]>([]);
  const [screenTimeEntries, setScreenTimeEntries] = useState<any[]>([]);
  const [gratitudes, setGratitudes] = useState<any[]>([]);
  const [visionItems, setVisionItems] = useState<any[]>([]);

  // Accessibility / Presentation Settings
  const [settings, setSettings] = useState<WellnessSettings>({
    darkMode: false,
    highContrast: false,
    reducedMotion: false,
    fontSize: 'md'
  });

  // Load state from local storage on mount
  useEffect(() => {
    try {
      const storedResults = localStorage.getItem('serenity_stress_results');
      const storedMoods = localStorage.getItem('serenity_mood_entries');
      const storedJournals = localStorage.getItem('serenity_journal_entries');
      const storedSettings = localStorage.getItem('serenity_wellness_settings');

      // Load companion values
      const storedBingo = localStorage.getItem('serenity_bingo_state');
      const storedMemories = localStorage.getItem('serenity_memories');
      const storedWater = localStorage.getItem('serenity_water_glasses');
      const storedWaterDate = localStorage.getItem('serenity_water_date');

      const storedSleep = localStorage.getItem('serenity_sleep_entries');
      const storedScreenTime = localStorage.getItem('serenity_screen_time_entries');
      const storedGratitudes = localStorage.getItem('serenity_gratitudes');
      const storedVision = localStorage.getItem('serenity_vision_items');

      if (storedResults) setResults(JSON.parse(storedResults));
      if (storedMoods) setMoods(JSON.parse(storedMoods));
      if (storedJournals) setJournals(JSON.parse(storedJournals));
      if (storedSettings) setSettings(JSON.parse(storedSettings));

      if (storedBingo) setBingoState(JSON.parse(storedBingo));
      if (storedMemories) setMemories(JSON.parse(storedMemories));

      if (storedSleep) setSleepEntries(JSON.parse(storedSleep));
      if (storedScreenTime) setScreenTimeEntries(JSON.parse(storedScreenTime));
      if (storedGratitudes) setGratitudes(JSON.parse(storedGratitudes));
      if (storedVision) setVisionItems(JSON.parse(storedVision));

      const todayStr = new Date().toDateString();
      if (storedWaterDate === todayStr && storedWater) {
        setWaterGlasses(Number(storedWater));
      } else {
        setWaterGlasses(0);
        localStorage.setItem('serenity_water_glasses', '0');
        localStorage.setItem('serenity_water_date', todayStr);
      }
    } catch (e) {
      console.warn("Could not read local storage values due to sandboxing/privacy settings", e);
    }
  }, []);

  const handleToggleBingoCell = (index: number) => {
    const updated = [...bingoState];
    updated[index] = !updated[index];
    setBingoState(updated);
    try {
      localStorage.setItem('serenity_bingo_state', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleResetBingo = () => {
    const updated = Array(25).fill(false);
    setBingoState(updated);
    try {
      localStorage.setItem('serenity_bingo_state', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleAddMemory = (title: string, content: string, imageUrl?: string, type?: 'text' | 'photo' | 'achievement' | 'quote') => {
    const newM = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      content,
      imageUrl,
      type: type || 'text',
      timestamp: Date.now()
    };
    const updated = [newM, ...memories];
    setMemories(updated);
    try {
      localStorage.setItem('serenity_memories', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleDeleteMemory = (id: string) => {
    const updated = memories.filter(m => m.id !== id);
    setMemories(updated);
    try {
      localStorage.setItem('serenity_memories', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleAddWater = () => {
    const newVal = waterGlasses + 1;
    setWaterGlasses(newVal);
    try {
      localStorage.setItem('serenity_water_glasses', String(newVal));
      localStorage.setItem('serenity_water_date', new Date().toDateString());
    } catch (e) {}
  };

  const handleAddSleepEntry = (bedtime: string, wakeTime: string, duration: number, quality: number) => {
    const newEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      bedtime,
      wakeTime,
      duration,
      quality
    };
    const updated = [newEntry, ...sleepEntries];
    setSleepEntries(updated);
    try {
      localStorage.setItem('serenity_sleep_entries', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleDeleteSleepEntry = (id: string) => {
    const updated = sleepEntries.filter(item => item.id !== id);
    setSleepEntries(updated);
    try {
      localStorage.setItem('serenity_sleep_entries', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleAddScreenTimeEntry = (hours: number) => {
    const newEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      hours
    };
    const updated = [newEntry, ...screenTimeEntries];
    setScreenTimeEntries(updated);
    try {
      localStorage.setItem('serenity_screen_time_entries', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleDeleteScreenTime = (id: string) => {
    const updated = screenTimeEntries.filter(item => item.id !== id);
    setScreenTimeEntries(updated);
    try {
      localStorage.setItem('serenity_screen_time_entries', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleAddGratitude = (text: string) => {
    const newEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      text
    };
    const updated = [newEntry, ...gratitudes];
    setGratitudes(updated);
    try {
      localStorage.setItem('serenity_gratitudes', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleDeleteGratitude = (id: string) => {
    const updated = gratitudes.filter(item => item.id !== id);
    setGratitudes(updated);
    try {
      localStorage.setItem('serenity_gratitudes', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleAddVisionItem = (type: 'image' | 'quote' | 'goal' | 'note', content: string, title?: string) => {
    const newEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      type,
      content,
      title
    };
    const updated = [newEntry, ...visionItems];
    setVisionItems(updated);
    try {
      localStorage.setItem('serenity_vision_items', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleDeleteVisionItem = (id: string) => {
    const updated = visionItems.filter(item => item.id !== id);
    setVisionItems(updated);
    try {
      localStorage.setItem('serenity_vision_items', JSON.stringify(updated));
    } catch (e) {}
  };

  // Sync settings & layout classes with the document element
  useEffect(() => {
    const root = document.documentElement;
    
    // Dark mode toggle
    if (settings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // High contrast toggle
    if (settings.highContrast) {
      root.classList.add('contrast-more');
    } else {
      root.classList.remove('contrast-more');
    }

    // Save settings
    try {
      localStorage.setItem('serenity_wellness_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn("Could not persist settings, storage is restricted.", e);
    }
  }, [settings]);

  // General persistence functions
  const handleSaveStressResult = (newResult: StressCheckResult) => {
    const updated = [newResult, ...results];
    setResults(updated);
    try {
      localStorage.setItem('serenity_stress_results', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddMood = (mood: MoodType, note?: string) => {
    const newEntry: MoodEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      mood,
      note
    };
    const updated = [newEntry, ...moods];
    setMoods(updated);
    try {
      localStorage.setItem('serenity_mood_entries', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMood = (id: string) => {
    const updated = moods.filter(m => m.id !== id);
    setMoods(updated);
    try {
      localStorage.setItem('serenity_mood_entries', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddJournal = async (entry: Omit<JournalEntry, 'id' | 'timestamp'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now()
    };
    const updated = [newEntry, ...journals];
    setJournals(updated);
    try {
      localStorage.setItem('serenity_journal_entries', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateJournal = async (id: string, partial: Partial<JournalEntry>) => {
    const updated = journals.map(entry => {
      if (entry.id === id) {
        return { ...entry, ...partial };
      }
      return entry;
    });
    setJournals(updated);
    try {
      localStorage.setItem('serenity_journal_entries', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteJournal = (id: string) => {
    const updated = journals.filter(j => j.id !== id);
    setJournals(updated);
    try {
      localStorage.setItem('serenity_journal_entries', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Sizing styles mapped to font settings
  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'sm': return 'text-xs md:text-sm';
      case 'lg': return 'text-base md:text-lg';
      case 'xl': return 'text-lg md:text-xl';
      default: return 'text-sm md:text-base';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between ${settings.darkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#F8FAF8] text-[#2D3748]'} ${getFontSizeClass()} ${settings.reducedMotion ? 'motion-reduce' : ''}`}>
      
      {/* 1. BRAND TOP HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-[#A8CFA8]/20 dark:border-slate-800/80 select-none">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#B8A4D8] to-[#A8CFA8] rounded-xl flex items-center justify-center text-white shadow-md shadow-purple-100/30 dark:shadow-none">
              <span className="material-symbols-outlined text-xl">spa</span>
            </div>
            <div className="text-left leading-tight">
              <span className="font-sans font-black text-sm tracking-tight text-slate-800 dark:text-white uppercase">Serenity Hub</span>
              <span className="text-[9px] text-[#A8CFA8] font-bold block uppercase tracking-widest">Breathe. Relax. Thrive.</span>
            </div>
          </button>

          {/* Quick status & gear settings trigger */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold px-2.5 py-1 rounded-md hidden sm:block">
              📅 {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
              aria-label="Open accessibility controls"
            >
              <Accessibility className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. ACCESSIBILITY OVERLAY PANEL */}
      {showSettings && (
        <AccessibilitySettings
          settings={settings}
          onSettingsChange={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* 3. MAIN CONTENTS */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 pb-24 md:pb-8">
        
        {/* Dynamic Route Router swap */}
        {activeTab === 'home' && (
          <Home 
            onStartStressCheck={() => setActiveTab('stress')} 
            onNavigateToTab={(tab) => setActiveTab(tab)}
            stressResults={results}
            moods={moods}
            journals={journals}
            sleepEntries={sleepEntries}
            screenTimeEntries={screenTimeEntries}
            gratitudes={gratitudes}
            bingoState={bingoState}
            waterGlasses={waterGlasses}
            onAddWater={handleAddWater}
            onOpenFocusMode={() => setShowFocusMode(true)}
          />
        )}
        {activeTab === 'stress' && (
          <StressCheck 
            onSaveResult={handleSaveStressResult} 
            recentMoods={moods} 
          />
        )}
        {activeTab === 'mood' && (
          <MoodTracker 
            moods={moods} 
            onAddMood={handleAddMood} 
            onDeleteMood={handleDeleteMood} 
          />
        )}
        {activeTab === 'journal' && (
          <Journal 
            entries={journals} 
            onAddEntry={handleAddJournal} 
            onUpdateEntry={handleUpdateJournal} 
            onDeleteEntry={handleDeleteJournal} 
          />
        )}
        {activeTab === 'progress' && (
          <Progress 
            results={results} 
            moods={moods} 
            journals={journals} 
          />
        )}
        {activeTab === 'tools' && (
          <WellnessTools 
            bingoState={bingoState}
            onToggleBingoCell={handleToggleBingoCell}
            onResetBingo={handleResetBingo}
            memories={memories}
            onAddMemory={handleAddMemory}
            onDeleteMemory={handleDeleteMemory}
            stressResults={results}

            sleepEntries={sleepEntries}
            screenTimeEntries={screenTimeEntries}
            onAddSleepEntry={handleAddSleepEntry}
            onDeleteSleepEntry={handleDeleteSleepEntry}
            onAddScreenTimeEntry={handleAddScreenTimeEntry}
            onDeleteScreenTime={handleDeleteScreenTime}

            gratitudes={gratitudes}
            onAddGratitude={handleAddGratitude}
            onDeleteGratitude={handleDeleteGratitude}

            visionItems={visionItems}
            onAddVisionItem={handleAddVisionItem}
            onDeleteVisionItem={handleDeleteVisionItem}
          />
        )}
        {activeTab === 'about' && (
          <About />
        )}

      </main>

      {/* 4. FLOATING EMERGENCY CALM TRIGGER BUTTON (Feature 5: Accessible from every screen) */}
      <button
        onClick={() => setShowEmergencyCalm(true)}
        className="fixed bottom-20 right-6 z-50 p-4 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-lg flex items-center justify-center animate-bounce hover:scale-105 transition-all cursor-pointer border border-rose-500/25"
        title="Emergency Calm Button"
        id="floating-emergency-calm-btn"
      >
        <ShieldAlert className="w-5 h-5 text-white animate-pulse" />
      </button>

      {/* Emergency Calm Dialog/Overlay */}
      <EmergencyCalm 
        isOpen={showEmergencyCalm} 
        onClose={() => setShowEmergencyCalm(false)} 
      />

      {/* Focus Mode distraction-free overlay */}
      <FocusMode 
        isActive={showFocusMode} 
        onClose={() => setShowFocusMode(false)} 
        onAddWater={handleAddWater}
        waterStreak={waterGlasses}
      />

      {/* 4. PERSISTENT FIXED BOTTOM NAVIGATION BAR (Required) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-[#A8CFA8]/20 dark:border-slate-800 shadow-xl select-none">
        <div className="max-w-lg mx-auto px-2 h-16 flex items-center justify-around">
          {[
            { id: 'home', label: 'Home', icon: HomeIcon },
            { id: 'stress', label: 'Stress Check', icon: BrainCircuit },
            { id: 'mood', label: 'Moods', icon: Heart },
            { id: 'journal', label: 'Journal', icon: BookOpen },
            { id: 'progress', label: 'Progress', icon: BarChart3 },
            { id: 'tools', label: 'Calm Tools', icon: Wind },
            { id: 'about', label: 'About', icon: Info }
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'text-[#2E7D32] dark:text-emerald-400 font-bold scale-105'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
                <span className="text-[10px] font-semibold mt-1 tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

    </div>
  );
}

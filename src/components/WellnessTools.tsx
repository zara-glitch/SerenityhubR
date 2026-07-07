import React, { useState, useEffect, useRef } from 'react';
import { 
  Wind, Clock, Sparkles, Smile, RefreshCw, Volume2, Play, 
  Pause, Check, Info, Heart, BookOpen, AlertCircle, VolumeX, Eye, ArrowRight, CheckSquare, Trash2, 
  Moon, Award, Image as ImageIcon, Briefcase, Calendar 
} from 'lucide-react';
import { AFFIRMATIONS, QUICK_RELIEF_TECHNIQUES, GRATITUDE_PROMPTS } from '../data';
import SleepScreenTracker from './SleepScreenTracker';
import StudyCompanion from './StudyCompanion';
import SelfCareBingo from './SelfCareBingo';
import GratitudeJar from './GratitudeJar';
import VisionBoard from './VisionBoard';
import MemoryVault from './MemoryVault';

interface WellnessToolsProps {
  bingoState: boolean[];
  onToggleBingoCell: (index: number) => void;
  onResetBingo: () => void;
  memories: any[];
  onAddMemory: (title: string, content: string, imageUrl?: string, type?: any) => void;
  onDeleteMemory: (id: string) => void;
  stressResults: any[];

  // Sleep & Screen Trackers
  sleepEntries: any[];
  screenTimeEntries: any[];
  onAddSleepEntry: (bedtime: string, wakeTime: string, duration: number, quality: number) => void;
  onDeleteSleepEntry: (id: string) => void;
  onAddScreenTimeEntry: (hours: number) => void;
  onDeleteScreenTime: (id: string) => void;

  // Gratitude Jar
  gratitudes: any[];
  onAddGratitude: (text: string) => void;
  onDeleteGratitude: (id: string) => void;

  // Vision Board
  visionItems: any[];
  onAddVisionItem: (type: 'image' | 'quote' | 'goal' | 'note', content: string, title?: string) => void;
  onDeleteVisionItem: (id: string) => void;
}

export default function WellnessTools({
  bingoState,
  onToggleBingoCell,
  onResetBingo,
  memories,
  onAddMemory,
  onDeleteMemory,
  stressResults,

  sleepEntries,
  screenTimeEntries,
  onAddSleepEntry,
  onDeleteSleepEntry,
  onAddScreenTimeEntry,
  onDeleteScreenTime,

  gratitudes,
  onAddGratitude,
  onDeleteGratitude,

  visionItems,
  onAddVisionItem,
  onDeleteVisionItem
}: WellnessToolsProps) {
  // Tabs: 'breathing' | 'study' | 'bingo' | 'sleep' | 'gratitude' | 'vision' | 'vault' | 'grounding'
  const [activeTab, setActiveTab] = useState<'breathing' | 'study' | 'bingo' | 'sleep' | 'gratitude' | 'vision' | 'vault' | 'grounding'>('breathing');
  const [groundingComplete, setGroundingComplete] = useState(false);

  useEffect(() => {
    setGroundingComplete(false);
  }, [activeTab]);

  // ==========================================
  // GUIDED BREATHING ENGINE
  // ==========================================
  const [breathState, setBreathState] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [breathTimer, setBreathTimer] = useState(0);
  const breathIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (breathState === 'idle') {
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
      setBreathTimer(0);
      return;
    }

    const tick = () => {
      setBreathTimer(prev => {
        const next = prev + 1;
        if (breathState === 'inhale' && next >= 4) {
          setBreathState('hold');
          return 0;
        }
        if (breathState === 'hold' && next >= 4) {
          setBreathState('exhale');
          return 0;
        }
        if (breathState === 'exhale' && next >= 6) {
          setBreathState('inhale');
          return 0;
        }
        return next;
      });
    };

    breathIntervalRef.current = setInterval(tick, 1000);
    return () => {
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
    };
  }, [breathState]);

  const toggleBreathing = () => {
    setBreathState(prev => prev === 'idle' ? 'inhale' : 'idle');
  };

  const getBreathInstruction = () => {
    switch (breathState) {
      case 'inhale': return { text: 'Inhale deeply...', sub: 'Feel the cool air enter your nostrils.', scale: 'scale-130 bg-emerald-500/20' };
      case 'hold': return { text: 'Hold your breath...', sub: 'Let the quiet energy settle within you.', scale: 'scale-130 bg-purple-500/20' };
      case 'exhale': return { text: 'Exhale slowly...', sub: 'Release all tension, let it drift away.', scale: 'scale-100 bg-sky-500/20' };
      default: return { text: 'Breathwork Sanctuary', sub: 'Tap Begin to start your 4-4-6 rhythmic breathing loop.', scale: 'scale-100 bg-slate-100 dark:bg-slate-800' };
    }
  };

  const breathInstruction = getBreathInstruction();

  // ==========================================
  // 5-4-3-2-1 GROUNDING EXERCISE
  // ==========================================
  const [groundingInputs, setGroundingInputs] = useState<Record<string, string[]>>({
    see: ['', '', '', '', ''],
    touch: ['', '', '', ''],
    hear: ['', '', ''],
    smell: ['', ''],
    taste: ['']
  });

  const updateGroundingInput = (category: string, idx: number, val: string) => {
    setGroundingInputs(prev => {
      const arr = [...prev[category]];
      arr[idx] = val;
      return { ...prev, [category]: arr };
    });
  };

  const resetGrounding = () => {
    setGroundingInputs({
      see: ['', '', '', '', ''],
      touch: ['', '', '', ''],
      hear: ['', '', ''],
      smell: ['', ''],
      taste: ['']
    });
    setGroundingComplete(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-slate-800 dark:text-slate-200 py-2">
      
      {/* Scrollable Navigation Category Tabs */}
      <div className="flex bg-slate-100/70 dark:bg-slate-800/80 p-1.5 rounded-[2rem] gap-1 overflow-x-auto max-w-full select-none border border-[#A8CFA8]/15 dark:border-slate-800/50 custom-scrollbar">
        {[
          { id: 'breathing', label: 'Breathing', icon: Wind },
          { id: 'study', label: 'Study/Pomodoro', icon: Briefcase },
          { id: 'bingo', label: 'Self-Care Bingo', icon: Award },
          { id: 'sleep', label: 'Sleep/Screen Tracker', icon: Moon },
          { id: 'gratitude', label: 'Gratitude Jar', icon: Smile },
          { id: 'vision', label: 'Vision Board', icon: ImageIcon },
          { id: 'vault', label: 'Memory Vault', icon: Heart },
          { id: 'grounding', label: 'Grounding', icon: Eye }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-full transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-[#2E7D32] dark:text-white shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* RENDER ACTIVE TOOL COMPONENTS */}

      {/* A. GUIDED BREATHING PANEL */}
      {activeTab === 'breathing' && (
        <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2.5rem] p-6 md:p-8 shadow-sm text-center space-y-8 animate-fade-in text-left sm:text-center">
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="font-headline-lg text-lg md:text-xl font-bold">Guided Breathing (4-4-6 Box Loop)</h2>
            <p className="text-xs text-slate-500">
              Rhythmic box breathing down-regulates stress by engaging the parasympathetic nervous system. Follow the visual prompts to inhale, hold, and slowly exhale.
            </p>
          </div>

          <div className="relative w-48 h-48 md:w-56 md:h-56 mx-auto flex items-center justify-center">
            <div className={`absolute inset-0 rounded-full transition-all duration-[3000ms] ease-in-out opacity-25 blur-xl ${
              breathState === 'inhale' ? 'bg-emerald-500 scale-125' :
              breathState === 'hold' ? 'bg-purple-500 scale-125' :
              breathState === 'exhale' ? 'bg-sky-500 scale-100' : 'bg-slate-100 scale-100'
            }`} />

            <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full border border-white/20 shadow-md flex flex-col items-center justify-center transition-all duration-[3000ms] ease-in-out ${breathInstruction.scale}`}>
              {breathState !== 'idle' ? (
                <>
                  <span className="text-3xl font-black text-slate-800 dark:text-white">{breathTimer}s</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-1">{breathState}</span>
                </>
              ) : (
                <Wind className="w-10 h-10 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              )}
            </div>
          </div>

          <div className="space-y-1.5 min-h-[4.5rem]">
            <h3 className="font-headline-md text-base md:text-lg font-bold text-slate-800 dark:text-white">
              {breathInstruction.text}
            </h3>
            <p className="text-xs text-slate-400 leading-normal max-w-sm mx-auto">
              {breathInstruction.sub}
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={toggleBreathing}
              className={`flex items-center justify-center gap-2 font-semibold rounded-full px-8 py-3.5 shadow-sm active:scale-95 transition-all cursor-pointer text-xs md:text-sm ${
                breathState !== 'idle'
                  ? 'bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-300'
                  : 'bg-emerald-750 hover:bg-emerald-850 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500'
              }`}
            >
              {breathState !== 'idle' ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Practice</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Begin Breathing Routine</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* B. STUDY COMPANION */}
      {activeTab === 'study' && (
        <StudyCompanion />
      )}

      {/* C. SELF CARE BINGO */}
      {activeTab === 'bingo' && (
        <SelfCareBingo 
          bingoState={bingoState} 
          onToggleCell={onToggleBingoCell} 
          onResetBingo={onResetBingo} 
        />
      )}

      {/* D. SLEEP & SCREEN TRACKER */}
      {activeTab === 'sleep' && (
        <SleepScreenTracker 
          sleepEntries={sleepEntries}
          screenTimeEntries={screenTimeEntries}
          stressResults={stressResults}
          onAddSleepEntry={onAddSleepEntry}
          onAddScreenTimeEntry={onAddScreenTimeEntry}
          onDeleteSleepEntry={onDeleteSleepEntry}
          onDeleteScreenTime={onDeleteScreenTime}
        />
      )}

      {/* E. GRATITUDE JAR */}
      {activeTab === 'gratitude' && (
        <GratitudeJar 
          gratitudes={gratitudes}
          onAddGratitude={onAddGratitude}
          onDeleteGratitude={onDeleteGratitude}
        />
      )}

      {/* F. VISION BOARD */}
      {activeTab === 'vision' && (
        <VisionBoard 
          items={visionItems}
          onAddItem={onAddVisionItem}
          onDeleteItem={onDeleteVisionItem}
        />
      )}

      {/* G. POSITIVE MEMORY VAULT */}
      {activeTab === 'vault' && (
        <MemoryVault 
          memories={memories} 
          stressResults={stressResults} 
          onAddMemory={onAddMemory} 
          onDeleteMemory={onDeleteMemory} 
        />
      )}

      {/* H. 5-4-3-2-1 GROUNDING PANEL */}
      {activeTab === 'grounding' && (
        <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2.5rem] p-6 md:p-8 shadow-sm space-y-6 text-left animate-fade-in">
          
          {groundingComplete && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/25 text-[#2E7D32] dark:text-emerald-400 border border-[#A8CFA8]/30 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-fade-in">
              <Check className="w-5 h-5 shrink-0" />
              <span>Deep breath complete. You have successfully centered your awareness and grounded yourself in the present moment. Feel free to rest here or try another tool.</span>
            </div>
          )}
          <div className="space-y-1">
            <h2 className="font-headline-lg text-lg md:text-xl font-bold">5-4-3-2-1 Grounding Method</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              This sensory integration method brings your focus away from anxious thoughts and pins your consciousness firmly back to the physical present. Fill in or write out what you experience around you:
            </p>
          </div>

          {/* Step 5 */}
          <div className="space-y-3 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/40">
            <h3 className="text-sm font-bold text-emerald-850 dark:text-emerald-400 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">5</span>
              <span>Things you can SEE</span>
            </h3>
            <p className="text-xs text-slate-400">Describe 5 visual details around you (e.g., a speck of dust, reflection on a glass, color of a leaf):</p>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {groundingInputs.see.map((val, i) => (
                <input
                  key={i}
                  type="text"
                  value={val}
                  onChange={(e) => updateGroundingInput('see', i, e.target.value)}
                  placeholder={`Visible item ${i + 1}`}
                  className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
              ))}
            </div>
          </div>

          {/* Step 4 */}
          <div className="space-y-3 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/40">
            <h3 className="text-sm font-bold text-indigo-800 dark:text-indigo-400 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">4</span>
              <span>Things you can TOUCH</span>
            </h3>
            <p className="text-xs text-slate-400">Describe 4 physical textures (e.g., the friction of your jeans, coolness of the desk, texture of key caps):</p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              {groundingInputs.touch.map((val, i) => (
                <input
                  key={i}
                  type="text"
                  value={val}
                  onChange={(e) => updateGroundingInput('touch', i, e.target.value)}
                  placeholder={`Tactile detail ${i + 1}`}
                  className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              ))}
            </div>
          </div>

          {/* Step 3 */}
          <div className="space-y-3 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/40">
            <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-xs">3</span>
              <span>Things you can HEAR</span>
            </h3>
            <p className="text-xs text-slate-400">Describe 3 auditory inputs (e.g., distant highway hum, clock ticking, computer fan, birds outside):</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {groundingInputs.hear.map((val, i) => (
                <input
                  key={i}
                  type="text"
                  value={val}
                  onChange={(e) => updateGroundingInput('hear', i, e.target.value)}
                  placeholder={`Auditory sound ${i + 1}`}
                  className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-amber-500"
                />
              ))}
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-3 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/40">
            <h3 className="text-sm font-bold text-orange-800 dark:text-orange-400 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 flex items-center justify-center font-bold text-xs">2</span>
              <span>Things you can SMELL</span>
            </h3>
            <p className="text-xs text-slate-400">Describe 2 olfactory scents (e.g., paper smell, soap, coffee, rain smell outside):</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {groundingInputs.smell.map((val, i) => (
                <input
                  key={i}
                  type="text"
                  value={val}
                  onChange={(e) => updateGroundingInput('smell', i, e.target.value)}
                  placeholder={`Aroma scent ${i + 1}`}
                  className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-orange-500"
                />
              ))}
            </div>
          </div>

          {/* Step 1 */}
          <div className="space-y-3 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/40">
            <h3 className="text-sm font-bold text-rose-800 dark:text-rose-400 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 flex items-center justify-center font-bold text-xs">1</span>
              <span>Thing you can TASTE</span>
            </h3>
            <p className="text-xs text-slate-400">Describe 1 flavor or lingering taste (e.g., mint toothpaste, tea hint, freshness of water):</p>
            <input
              type="text"
              value={groundingInputs.taste[0]}
              onChange={(e) => updateGroundingInput('taste', 0, e.target.value)}
              placeholder="Taste flavor detail"
              className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-end gap-3">
            <button
              onClick={resetGrounding}
              className="px-5 py-2.5 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 hover:text-slate-850 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            >
              Reset Inputs
            </button>
            <button
              onClick={() => {
                setGroundingComplete(true);
              }}
              className="bg-[#2E7D32] hover:bg-emerald-800 text-white px-6 py-2.5 rounded-full text-xs font-bold cursor-pointer shadow-sm transition-all"
            >
              Finish Exercise
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

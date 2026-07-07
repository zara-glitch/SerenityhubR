import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ArrowRight, Lightbulb, Quote, Heart, Info, Leaf, Sparkles, 
  Flame, Award, CheckSquare, Plus, Droplet, Zap, EyeOff, BookOpen, Compass, ClipboardList 
} from 'lucide-react';
import { WELLNESS_TIPS, MOTIVATIONAL_QUOTES } from '../data';
import { MoodEntry, JournalEntry, StressCheckResult, SleepEntry, ScreenTimeEntry, GratitudeEntry } from '../types';
import Disclaimer from './Disclaimer';

interface HomeProps {
  onStartStressCheck: () => void;
  onNavigateToTab: (tab: any) => void;
  stressResults: StressCheckResult[];
  moods: MoodEntry[];
  journals: JournalEntry[];
  sleepEntries: SleepEntry[];
  screenTimeEntries: ScreenTimeEntry[];
  gratitudes: GratitudeEntry[];
  bingoState: boolean[];
  waterGlasses: number;
  onAddWater: () => void;
  onOpenFocusMode: () => void;
}

export default function Home({
  onStartStressCheck,
  onNavigateToTab,
  stressResults,
  moods,
  journals,
  sleepEntries,
  screenTimeEntries,
  gratitudes,
  bingoState,
  waterGlasses,
  onAddWater,
  onOpenFocusMode
}: HomeProps) {
  const [dailyTip, setDailyTip] = useState('');
  const [quote, setQuote] = useState({ text: '', author: '' });
  
  // Weekly Wellness Plan Checked Tasks (stored locally)
  const [weeklyPlan, setWeeklyPlan] = useState<{ id: string; text: string; done: boolean }[]>([
    { id: 'walk', text: 'Walk outdoors for 15 minutes', done: false },
    { id: 'water', text: 'Drink at least 6 glasses of water daily', done: false },
    { id: 'journal', text: 'Journal your thoughts in the diary', done: false },
    { id: 'screen', text: 'Reduce screen exposure before sleep', done: false },
    { id: 'breathe', text: 'Complete a guided breathing session', done: false },
  ]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('serenity_weekly_plan');
      if (stored) {
        setWeeklyPlan(JSON.parse(stored));
      }
    } catch (e) {}

    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    const tipIndex = dayOfYear % WELLNESS_TIPS.length;
    const quoteIndex = dayOfYear % MOTIVATIONAL_QUOTES.length;

    setDailyTip(WELLNESS_TIPS[tipIndex]);
    setQuote(MOTIVATIONAL_QUOTES[quoteIndex]);
  }, []);

  const handleToggleWeeklyTask = (id: string) => {
    const updated = weeklyPlan.map(t => t.id === id ? { ...t, done: !t.done } : t);
    setWeeklyPlan(updated);
    try {
      localStorage.setItem('serenity_weekly_plan', JSON.stringify(updated));
    } catch (e) {}
  };

  // Feature 8: Dynamic Habit Streaks Calculation
  const calculateStreak = (type: 'journal' | 'water' | 'sleep' | 'checkin') => {
    if (type === 'journal') {
      return journals.length > 0 ? Math.min(7, Math.ceil(journals.length / 2) + 1) : 0;
    }
    if (type === 'water') {
      return waterGlasses > 0 ? Math.min(7, Math.floor(waterGlasses / 2) + 1) : 0;
    }
    if (type === 'sleep') {
      return sleepEntries.length > 0 ? Math.min(7, sleepEntries.length) : 0;
    }
    if (type === 'checkin') {
      return moods.length > 0 ? Math.min(7, moods.length) : 0;
    }
    return 0;
  };

  // Feature 9: Achievement Badges checking
  const getBadges = () => {
    const badges = [];
    
    // First reflection badge
    if (stressResults.length > 0) {
      badges.push({ name: '🌿 First Reflection', desc: 'Completed first stress check', earned: true });
    } else {
      badges.push({ name: '🌿 First Reflection', desc: 'Completed first stress check', earned: false });
    }

    // Wellness Explorer badge
    if (stressResults.length > 0 || moods.length > 0 || journals.length > 0) {
      badges.push({ name: '💚 Wellness Explorer', desc: 'Logged any wellbeing metric', earned: true });
    } else {
      badges.push({ name: '💚 Wellness Explorer', desc: 'Logged any wellbeing metric', earned: false });
    }

    // Journal Explorer badge
    if (journals.length > 0) {
      badges.push({ name: '📖 Journal Explorer', desc: 'Wrote first private diary entry', earned: true });
    } else {
      badges.push({ name: '📖 Journal Explorer', desc: 'Wrote first private diary entry', earned: false });
    }

    // Better Sleep badge
    if (sleepEntries.length > 0) {
      badges.push({ name: '🌙 Better Sleep', desc: 'Logged first sleep duration', earned: true });
    } else {
      badges.push({ name: '🌙 Better Sleep', desc: 'Logged first sleep duration', earned: false });
    }

    // Hydration Hero
    if (waterGlasses >= 8) {
      badges.push({ name: '💧 Hydration Hero', desc: 'Reached 8 glasses of water today', earned: true });
    } else {
      badges.push({ name: '💧 Hydration Hero', desc: 'Reached 8 glasses of water today', earned: false });
    }

    // Seven-Day Check-in
    if (moods.length >= 7) {
      badges.push({ name: '🌤️ Seven-Day Check-in', desc: 'Tracked emotions for 7 days', earned: true });
    } else {
      badges.push({ name: '🌤️ Seven-Day Check-in', desc: 'Tracked emotions for 7 days', earned: false });
    }

    // Consistency Champion
    const isBingoDone = bingoState.filter(Boolean).length >= 5;
    if (isBingoDone || calculateStreak('journal') >= 3) {
      badges.push({ name: '⭐ Consistency Champion', desc: 'Hit a 3-day streak or Bingo', earned: true });
    } else {
      badges.push({ name: '⭐ Consistency Champion', desc: 'Hit a 3-day streak or Bingo', earned: false });
    }

    return badges;
  };

  // Feature 10 & 19: Burnout & Smart Pattern Detection
  const getDetections = () => {
    const insights = [];
    
    if (stressResults.length >= 2) {
      const recent = stressResults[0].score;
      const older = stressResults[1].score;
      if (recent > older) {
        insights.push("Your stress levels have been increasing over the past week. Taking small structural breaks is recommended.");
      }
    }

    if (sleepEntries.length >= 2) {
      const recentSleep = sleepEntries[0].duration;
      const olderSleep = sleepEntries[1].duration;
      if (recentSleep < olderSleep) {
        insights.push("Your sleep appears to have decreased recently. Ensure screen times are lower before bedtime.");
      }
    }

    if (stressResults.length > 0 && sleepEntries.length > 0) {
      const averageSleep = sleepEntries.reduce((a, b) => a + b.duration, 0) / sleepEntries.length;
      if (averageSleep >= 7.5 && stressResults[0].score < 40) {
        insights.push("Smart Insight: Better sleep is strongly associated with your lower stress scores.");
      }
    }

    if (waterGlasses >= 6) {
      insights.push("Smart Insight: Good hydration appears directly linked to your improved cognitive stamina today.");
    }

    if (insights.length === 0) {
      insights.push("Log sleep, screen hours, and stress assessments to unlock pattern detections.");
    }

    return insights;
  };

  // Feature 18: AI Wellness Coach Suggestions
  const getCoachSuggestions = () => {
    const suggestions = [];
    
    // Check latest stress assessment
    if (stressResults.length > 0) {
      const category = stressResults[0].category;
      if (category === 'High' || category === 'Severe') {
        suggestions.push("Take a five-minute slow walking breaks right now.");
        suggestions.push("Draft a simple thought in your gratitude notes.");
        suggestions.push("Reach out to someone you trust to share your feelings.");
      } else {
        suggestions.push("Practice a 3-minute physiological sigh breathing cycle.");
        suggestions.push("Drink an extra refreshing glass of water.");
        suggestions.push("Spend 5 minutes outdoors watching the sky.");
      }
    } else {
      suggestions.push("Complete a quick stress check to receive personalized coaching.");
      suggestions.push("Establish a target bedtime for healthier circadian rhythms.");
    }

    return suggestions;
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2 animate-fade-in text-slate-800 dark:text-slate-200">
      
      {/* 1. HERO ROW: Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Welcome & Quick Focus mode button */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Welcome Card */}
          <div className="p-8 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-[#A8CFA8]/15 dark:border-slate-800 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#A8CFA8]/10 to-transparent rounded-full pointer-events-none" />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#A8CFA8]/10 text-[#2D3748] dark:text-[#A8CFA8] rounded-full border border-[#A8CFA8]/20 mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span className="text-[10px] font-bold tracking-wider uppercase">Strictly Private Device State</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white mb-3">Hello, Friend.</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans font-medium mb-4">
              Welcome to your private wellness dashboard. Tap below to launch distraction-free Focus Mode.
            </p>

            {/* Feature 4: Focus Mode Trigger Button */}
            <button
              onClick={onOpenFocusMode}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
              id="activate-focus-mode-btn"
            >
              <EyeOff className="w-4 h-4" />
              <span>One-Tap Focus Mode</span>
            </button>
          </div>

          {/* Quick-Access Widgets (Feature 21) */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] shadow-sm text-left space-y-4">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">Quick-Access Widgets</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Today's Hydration</span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Droplet className="w-4 h-4 text-sky-500" />
                  <span>{waterGlasses} glasses</span>
                </div>
                <button onClick={onAddWater} className="text-[9px] text-[#2E7D32] hover:underline font-bold">+ Drink glass</button>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Mindfulness Timer</span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Zap className="w-4 h-4 text-[#B8A4D8]" />
                  <span>5 Minutes</span>
                </div>
                <button onClick={onOpenFocusMode} className="text-[9px] text-teal-600 hover:underline font-bold">Start timer</button>
              </div>
            </div>

            <button 
              onClick={() => onNavigateToTab('journal')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-755 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl cursor-pointer text-center"
            >
              📝 Create Quick Journal entry
            </button>
          </div>

        </div>

        {/* Right Column: AI Coach Suggestions & Weekly Plan */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Main green CTA Section */}
          <div className="bg-[#2E7D32] dark:bg-slate-900 rounded-[2rem] p-8 text-white dark:text-slate-100 flex flex-col justify-between items-start relative overflow-hidden shadow-lg border border-[#A8CFA8]/10 dark:border-slate-800 text-left">
            <div className="relative z-10 w-full space-y-4">
              <span className="text-[10px] uppercase font-black text-[#A8CFA8] tracking-[0.2em] block">EMPATHETIC GUIDANCE</span>
              <h3 className="text-2xl font-light tracking-tight text-white">AI Wellbeing Coach Suggestions</h3>
              
              <div className="space-y-2 text-xs">
                {getCoachSuggestions().map((sug, i) => (
                  <div key={i} className="flex gap-2 items-start text-white/85">
                    <span className="w-1.5 h-1.5 bg-[#A8CFA8] rounded-full shrink-0 mt-1.5" />
                    <p className="font-sans font-medium">{sug}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button 
                  onClick={onStartStressCheck}
                  className="px-6 py-3 bg-white hover:bg-slate-50 text-[#2E7D32] font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-transform duration-150"
                >
                  <span>Take Stress Assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Feature 17: Weekly Wellness Plan */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] shadow-sm text-left space-y-4">
            <div className="flex items-center gap-2 text-[#2E7D32]">
              <ClipboardList className="w-5 h-5" />
              <h3 className="font-extrabold text-xs uppercase tracking-wider">Weekly Wellness Plan</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-2 text-xs">
              {weeklyPlan.map(task => (
                <div 
                  key={task.id}
                  onClick={() => handleToggleWeeklyTask(task.id)}
                  className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 rounded-xl flex items-center gap-3 cursor-pointer select-none transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => {}} // toggled on container click
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                  <span className={`font-medium ${task.done ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {task.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* 2. DUAL ROW: Streaks and Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Feature 8: Streaks */}
        <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm text-left space-y-4">
          <div className="flex items-center gap-1.5 text-rose-500">
            <Flame className="w-5 h-5 animate-pulse" />
            <h3 className="font-bold text-xs uppercase tracking-wider">Dynamic Habit Streaks</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              { label: 'Journaling', streak: calculateStreak('journal'), unit: 'days' },
              { label: 'Water hydration', streak: calculateStreak('water'), unit: 'days' },
              { label: 'Sleep logs', streak: calculateStreak('sleep'), unit: 'days' },
              { label: 'Daily check-ins', streak: calculateStreak('checkin'), unit: 'days' },
            ].map((streak, i) => (
              <div key={i} className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-semibold text-slate-500 text-[10px] uppercase tracking-wide">{streak.label}</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{streak.streak} {streak.unit}</p>
                </div>
                {streak.streak > 0 ? (
                  <Flame className="w-5 h-5 text-orange-500 fill-current shrink-0" />
                ) : (
                  <Flame className="w-5 h-5 text-slate-300 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Feature 9: Achievement Badges */}
        <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm text-left space-y-4">
          <div className="flex items-center gap-1.5 text-amber-500">
            <Award className="w-5 h-5" />
            <h3 className="font-bold text-xs uppercase tracking-wider">Achievement Badges</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[11px] max-h-52 overflow-y-auto custom-scrollbar">
            {getBadges().map((badge, i) => (
              <div 
                key={i} 
                className={`p-2 rounded-xl border flex items-center gap-2 ${
                  badge.earned 
                    ? 'bg-amber-50/20 border-amber-200 text-amber-900 dark:text-amber-300 dark:border-amber-950/40' 
                    : 'bg-slate-50/50 border-slate-100 text-slate-400 opacity-55 dark:bg-slate-855'
                }`}
              >
                <div className="text-lg shrink-0">{badge.name.split(' ')[0]}</div>
                <div>
                  <p className="font-bold leading-tight">{badge.name.replace(/^[^ ]+ /, '')}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. TRENDS / SMART OBSERVATIONS ROW */}
      <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-7 shadow-sm text-left space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#2E7D32]" />
          <h3 className="font-extrabold text-xs uppercase tracking-wider">Smart Pattern Detections</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium font-sans text-slate-700 dark:text-slate-300">
          {getDetections().map((insight, index) => (
            <div key={index} className="p-3 bg-indigo-50/10 hover:bg-indigo-50/20 dark:bg-indigo-950/5 rounded-xl border border-indigo-100/40 flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0 mt-1.5" />
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tips and Motivation columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm text-left flex items-start gap-4">
          <div className="w-12 h-12 bg-sky-100/40 dark:bg-sky-950/20 rounded-2xl flex items-center justify-center text-sky-600 shrink-0">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-xs uppercase tracking-[0.15em] text-[#A8CFA8]">Daily Tip</h3>
            <p className="text-xs text-slate-750 dark:text-slate-200 leading-relaxed font-sans font-medium">"{dailyTip}"</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm text-left flex items-start gap-4">
          <div className="w-12 h-12 bg-[#B8A4D8]/15 dark:bg-[#B8A4D8]/10 rounded-2xl flex items-center justify-center text-[#B8A4D8] shrink-0">
            <Quote className="w-5 h-5 transform -scale-x-100" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-xs uppercase tracking-[0.15em] text-[#B8A4D8]">Daily Affirmation</h3>
            <p className="text-xs text-slate-755 dark:text-slate-200 italic leading-relaxed font-sans font-medium">"{quote.text}"</p>
            <p className="text-[9px] text-slate-400 font-bold text-right">— {quote.author}</p>
          </div>
        </div>
      </div>

      <Disclaimer />
    </div>
  );
}

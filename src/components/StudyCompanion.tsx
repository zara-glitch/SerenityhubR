import React, { useState, useEffect } from 'react';
import { 
  Clock, Play, Pause, RotateCcw, Award, CheckCircle2, Flame, Droplet, Accessibility, Coffee, BookOpen 
} from 'lucide-react';

export default function StudyCompanion() {
  // Pomodoro / Focus Timer state
  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [timeLeft, setTimeLeft] = useState(1500); // 25 mins work
  const [isRunning, setIsRunning] = useState(false);
  
  // Custom Goals and Completed Sessions
  const [dailyGoalHours, setDailyGoalHours] = useState(2); // 2 hours default
  const [completedSessions, setCompletedSessions] = useState<{ id: string; duration: number; timestamp: number; topic: string }[]>([]);
  const [currentTopic, setCurrentTopic] = useState('');

  // Reminders / Alerts active flags
  const [reminders, setReminders] = useState({
    breakAlert: true,
    hydrationAlert: true,
    stretchAlert: true,
  });

  // Keep track of reminders timers (seconds elapsed)
  const [hydrationCounter, setHydrationCounter] = useState(0);
  const [stretchCounter, setStretchCounter] = useState(0);

  // Sound triggers / Alerts states
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Load completed sessions on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('serenity_study_sessions');
      if (stored) setCompletedSessions(JSON.parse(stored));
    } catch (e) {
      console.warn("Local storage not reachable.", e);
    }
  }, []);

  // Sync Timer countdown
  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        
        // Count hydration and stretch counters up
        setHydrationCounter(prev => prev + 1);
        setStretchCounter(prev => prev + 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      handleTimerComplete();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  // Periodic Reminder Checks
  useEffect(() => {
    // 20 minutes for hydration alert (1200 seconds)
    if (reminders.hydrationAlert && hydrationCounter >= 1200) {
      triggerNotification("💧 Hydration Reminder: Time to take a refreshing sip of water!");
      setHydrationCounter(0);
    }
    // 30 minutes for stretch alert (1800 seconds)
    if (reminders.stretchAlert && stretchCounter >= 1800) {
      triggerNotification("🧘 Stretch Reminder: Roll your shoulders, roll your neck, and stretch!");
      setStretchCounter(0);
    }
  }, [hydrationCounter, stretchCounter, reminders]);

  const triggerNotification = (msg: string) => {
    setNotificationMsg(msg);
    // Auto-dismiss after 8 seconds
    setTimeout(() => {
      setNotificationMsg(null);
    }, 8000);
  };

  const handleTimerComplete = () => {
    if (mode === 'work') {
      triggerNotification("🎉 Excellent focus! Your work block is complete. Time for a short break.");
      // Log the completed session
      const newSession = {
        id: Math.random().toString(36).substring(2, 9),
        duration: 25, // 25 mins standard
        timestamp: Date.now(),
        topic: currentTopic || 'Focused Study'
      };
      const updated = [newSession, ...completedSessions];
      setCompletedSessions(updated);
      try {
        localStorage.setItem('serenity_study_sessions', JSON.stringify(updated));
      } catch (e) {}

      // Switch to break
      setMode('shortBreak');
      setTimeLeft(300); // 5 mins break
    } else {
      triggerNotification("⏰ Break time is up! Ready to step back into deep focus mode?");
      setMode('work');
      setTimeLeft(1500); // 25 mins work
    }
  };

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);

  const resetTimer = () => {
    setIsRunning(false);
    if (mode === 'work') setTimeLeft(1500);
    else if (mode === 'shortBreak') setTimeLeft(300);
    else setTimeLeft(900);
  };

  const switchMode = (newMode: 'work' | 'shortBreak' | 'longBreak') => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === 'work') setTimeLeft(1500);
    else if (newMode === 'shortBreak') setTimeLeft(300);
    else setTimeLeft(900);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getCompletedHours = () => {
    const totalMins = completedSessions.reduce((acc, curr) => acc + curr.duration, 0);
    return Math.round((totalMins / 60) * 10) / 10;
  };

  const getGoalPercentage = () => {
    const hours = getCompletedHours();
    return Math.min(100, Math.round((hours / dailyGoalHours) * 100));
  };

  return (
    <div className="space-y-8 py-2 animate-fade-in text-slate-800 dark:text-slate-200 text-left">
      
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white">Study Companion</h2>
        <p className="text-xs md:text-sm text-slate-500">
          Optimize your cognitive blocks using Pomodoro focus timers, stretch reminders, and healthy hydration tracking.
        </p>
      </div>

      {/* Floating Smart Reminders Banner */}
      {notificationMsg && (
        <div className="bg-amber-500 text-white p-4 rounded-2xl shadow-lg border border-amber-600 animate-bounce flex items-center justify-between gap-3 text-xs font-bold">
          <div className="flex items-center gap-2">
            <Droplet className="w-5 h-5 shrink-0 animate-pulse" />
            <span>{notificationMsg}</span>
          </div>
          <button onClick={() => setNotificationMsg(null)} className="font-extrabold text-sm px-1.5 hover:bg-white/10 rounded cursor-pointer">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Pomodoro Clock */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm flex flex-col items-center text-center space-y-6">
            
            {/* Mode selection buttons */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl w-full text-xs select-none">
              {[
                { id: 'work', label: 'Work Focus', icon: BookOpen },
                { id: 'shortBreak', label: 'Short Break', icon: Coffee },
                { id: 'longBreak', label: 'Long Break', icon: Coffee }
              ].map(m => {
                const Icon = m.icon;
                const isSelected = mode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => switchMode(m.id as any)}
                    className={`py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer font-bold transition-all ${
                      isSelected
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[10px]">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Big Countdown Circle representation */}
            <div className="relative w-48 h-48 rounded-full border-4 border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center select-none bg-slate-50/40 dark:bg-slate-950/20">
              <span className="text-4xl font-mono font-black text-slate-800 dark:text-slate-100 tracking-wider">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">
                {mode === 'work' ? 'Deep focus block' : 'Relaxing rest'}
              </span>
            </div>

            {/* Optional Topic Label input */}
            {mode === 'work' && (
              <div className="w-full text-xs space-y-1.5">
                <input
                  type="text"
                  placeholder="What subject/topic are you studying?"
                  value={currentTopic}
                  onChange={(e) => setCurrentTopic(e.target.value)}
                  className="w-full text-center px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 rounded-xl focus:ring-1 focus:ring-rose-500 font-medium"
                />
              </div>
            )}

            {/* Timer controls */}
            <div className="flex gap-3 justify-center">
              {isRunning ? (
                <button
                  onClick={pauseTimer}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-full text-xs font-bold cursor-pointer"
                >
                  Pause Session
                </button>
              ) : (
                <button
                  onClick={startTimer}
                  className="px-7 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Focus Block</span>
                </button>
              )}
              <button
                onClick={resetTimer}
                className="p-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full cursor-pointer transition-colors"
                title="Reset Clock"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Right Column: Goal Tracker & Active reminders config */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Daily Goals Cards */}
          <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2.5rem] p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-xs uppercase tracking-wider">Daily Study Goal Progression</h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>Goal:</span>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={dailyGoalHours}
                  onChange={(e) => setDailyGoalHours(Number(e.target.value))}
                  className="w-12 text-center p-1 border rounded bg-slate-50 dark:bg-slate-850 font-bold"
                />
                <span>hrs</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500">Finished Today: {getCompletedHours()} hours</span>
                <span className="text-rose-500">{getGoalPercentage()}% completed</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full transition-all duration-500"
                  style={{ width: `${getGoalPercentage()}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 italic">
                {getGoalPercentage() >= 100 
                  ? "⭐ Outstanding! You have reached your study goals for today. Give yourself a rest!" 
                  : "Maintain small steady study blocks. Consistency over cramming."}
              </p>
            </div>
          </div>

          {/* Active Reminder toggles config */}
          <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2.5rem] p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Micro-Break Reminders & Alerts</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Automated health reminders trigger alert notifications while your timer is running.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { key: 'hydrationAlert', label: 'Hydration Reminders', sub: 'Every 20 mins', icon: Droplet, color: 'text-sky-500' },
                { key: 'stretchAlert', label: 'Stretch Alerts', sub: 'Every 30 mins', icon: Accessibility, color: 'text-indigo-500' },
                { key: 'breakAlert', label: 'Long-Break Alerts', sub: 'After work blocks', icon: Coffee, color: 'text-amber-500' },
              ].map(rem => {
                const Icon = rem.icon;
                const active = (reminders as any)[rem.key];
                return (
                  <button
                    key={rem.key}
                    onClick={() => setReminders(prev => ({ ...prev, [rem.key]: !active }))}
                    className={`p-4 rounded-2xl border text-left flex flex-col gap-1 cursor-pointer transition-all ${
                      active 
                        ? 'bg-rose-50/20 border-rose-200 dark:bg-rose-950/10' 
                        : 'bg-slate-50/50 border-slate-100 opacity-60 dark:bg-slate-850'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${rem.color} ${active ? 'animate-pulse' : ''}`} />
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-100 mt-1">{rem.label}</span>
                    <span className="text-[9px] text-slate-400">{rem.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Completed Session history logs */}
          <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2.5rem] p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Completed Sessions History Logs</h4>
            
            {completedSessions.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6">No study sessions completed today. Let's start a work block!</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {completedSessions.map(sess => (
                  <div key={sess.id} className="p-3 border border-slate-50 dark:border-slate-850 rounded-xl flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div>
                        <p className="font-bold">{sess.topic}</p>
                        <p className="text-[9px] text-slate-400">{new Date(sess.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <span className="font-bold text-rose-500">+{sess.duration} mins</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

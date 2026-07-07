import React, { useState, useEffect } from 'react';
import { 
  X, Heart, Wind, ShieldAlert, Sparkles, AlertCircle, Play, Pause, RotateCcw, Volume2, Info 
} from 'lucide-react';
import { AFFIRMATIONS, QUICK_RELIEF_TECHNIQUES } from '../data';

interface EmergencyCalmProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmergencyCalm({ isOpen, onClose }: EmergencyCalmProps) {
  const [activeSubTab, setActiveSubTab] = useState<'breathing' | 'grounding' | 'affirmations' | 'timer' | 'tips'>('breathing');
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes standard
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  // Guided breathing state
  const [breathState, setBreathState] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [breathTimer, setBreathTimer] = useState(0);

  // Grounding state
  const [groundingStep, setGroundingStep] = useState(0);

  // Affirmation state
  const [randomAffirmation, setRandomAffirmation] = useState('');

  useEffect(() => {
    setRandomAffirmation(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);
  }, [isOpen]);

  // Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  // Guided breathing loops
  useEffect(() => {
    let bInterval: any = null;
    if (breathState !== 'idle') {
      bInterval = setInterval(() => {
        setBreathTimer(prev => {
          if (breathState === 'inhale' && prev >= 4) {
            setBreathState('hold');
            return 0;
          } else if (breathState === 'hold' && prev >= 4) {
            setBreathState('exhale');
            return 0;
          } else if (breathState === 'exhale' && prev >= 6) {
            setBreathState('inhale');
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(bInterval);
  }, [breathState]);

  if (!isOpen) return null;

  const startBreathing = () => {
    setBreathState('inhale');
    setBreathTimer(0);
  };

  const stopBreathing = () => {
    setBreathState('idle');
    setBreathTimer(0);
  };

  const getBreathText = () => {
    switch (breathState) {
      case 'inhale': return 'Breathe In...';
      case 'hold': return 'Hold It...';
      case 'exhale': return 'Exhale slowly...';
      default: return 'Ready?';
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const GROUNDING_DATA = [
    { count: 5, label: "👁️ Things you can SEE around you", desc: "A plant, a picture frame, a clock, a light switch, a pen. Observe them slowly." },
    { count: 4, label: "🖐️ Things you can TOUCH or feel", desc: "The chair under you, your shirt sleeve, the cool desk, the texture of your hair." },
    { count: 3, label: "👂 Things you can HEAR in this environment", desc: "Hum of a fan, distant birds chirping, cars passing, your own steady breath." },
    { count: 2, label: "👃 Things you can SMELL", desc: "Fresh coffee, laundry detergent, cut grass, room spray, clean paper." },
    { count: 1, label: "👅 Thing you can TASTE", desc: "The clean taste of fresh water, lingering mint, or simply recognize your tongue's resting place." }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-red-500/30 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Banner header */}
        <div className="bg-red-500 dark:bg-red-950/40 p-6 flex items-center justify-between text-white border-b border-red-500/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">Emergency Calm Sanctuary</h2>
              <p className="text-xs text-red-100 dark:text-red-350">Let's slow things down together. Breathe, you are safe.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-white"
            id="close-emergency-calm-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inner subtabs */}
        <div className="grid grid-cols-5 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 font-semibold select-none bg-slate-50 dark:bg-slate-950/40">
          {[
            { id: 'breathing', label: 'Breathing', icon: Wind },
            { id: 'grounding', label: 'Grounding', icon: Heart },
            { id: 'affirmations', label: 'Affirmations', icon: Sparkles },
            { id: 'timer', label: 'Calm Timer', icon: AlertCircle },
            { id: 'tips', label: 'Relief Tips', icon: Info }
          ].map(t => {
            const Icon = t.icon;
            const isSelected = activeSubTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveSubTab(t.id as any)}
                className={`py-3.5 flex flex-col items-center justify-center gap-1 border-b-2 transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-red-500 text-red-600 dark:text-red-400 font-bold bg-white dark:bg-slate-900' 
                    : 'border-transparent hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline text-[10px]">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content area */}
        <div className="p-8 flex-1 overflow-y-auto text-slate-700 dark:text-slate-300">
          
          {/* A. GUIDED BREATHING */}
          {activeSubTab === 'breathing' && (
            <div className="space-y-6 text-center">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                4-4-6 Gentle Calm Breath
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Trigger parasympathetic response and lower your heart rate instantly. Let us guide you.
              </p>

              <div className="py-6 flex flex-col items-center justify-center">
                <div className={`w-40 h-40 rounded-full flex flex-col items-center justify-center transition-all duration-[1000ms] ${
                  breathState === 'inhale' ? 'scale-[1.3] bg-teal-50 dark:bg-teal-950/30 ring-8 ring-teal-200/50' : 
                  breathState === 'hold' ? 'scale-[1.3] bg-amber-50 dark:bg-amber-950/30 ring-8 ring-amber-200/50' :
                  breathState === 'exhale' ? 'scale-[0.9] bg-sky-50 dark:bg-sky-950/20 ring-4 ring-sky-200/30' :
                  'scale-100 bg-slate-50 dark:bg-slate-800'
                }`}>
                  <span className={`text-base font-black transition-colors ${
                    breathState === 'inhale' ? 'text-teal-600 dark:text-teal-400' :
                    breathState === 'hold' ? 'text-amber-600 dark:text-amber-400' :
                    breathState === 'exhale' ? 'text-sky-600 dark:text-sky-400' :
                    'text-slate-400'
                  }`}>
                    {getBreathText()}
                  </span>
                  {breathState !== 'idle' && (
                    <span className="text-xs text-slate-400 mt-1 font-mono">{breathTimer}s</span>
                  )}
                </div>
              </div>

              <div className="flex justify-center gap-3">
                {breathState === 'idle' ? (
                  <button
                    onClick={startBreathing}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Guided Breath</span>
                  </button>
                ) : (
                  <button
                    onClick={stopBreathing}
                    className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full text-xs font-bold cursor-pointer flex items-center gap-1.5"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause Exercise</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* B. 5-4-3-2-1 GROUNDING */}
          {activeSubTab === 'grounding' && (
            <div className="space-y-6">
              <div className="text-center max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                  5-4-3-2-1 Grounding Method
                </h3>
                <p className="text-xs text-slate-500">
                  Focusing on sensory details pulls your nervous system back into the current physical sanctuary, away from racing thoughts.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-850 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-bold">Step {groundingStep + 1} of 5</span>
                  <div className="flex gap-1.5">
                    {[0, 1, 2, 3, 4].map(idx => (
                      <div 
                        key={idx} 
                        className={`w-5 h-1.5 rounded-full ${idx <= groundingStep ? 'bg-red-500' : 'bg-slate-200 dark:bg-slate-700'}`} 
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2 py-4">
                  <h4 className="text-lg font-extrabold text-red-600 dark:text-red-400">
                    Find {GROUNDING_DATA[groundingStep].count} {GROUNDING_DATA[groundingStep].label}
                  </h4>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {GROUNDING_DATA[groundingStep].desc}
                  </p>
                </div>

                <div className="flex justify-between">
                  <button
                    disabled={groundingStep === 0}
                    onClick={() => setGroundingStep(prev => prev - 1)}
                    className="px-4 py-2 text-xs bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 rounded-xl cursor-pointer font-medium"
                  >
                    Back
                  </button>
                  {groundingStep < 4 ? (
                    <button
                      onClick={() => setGroundingStep(prev => prev + 1)}
                      className="px-4 py-2 text-xs bg-red-600 hover:bg-red-700 text-white rounded-xl cursor-pointer font-bold"
                    >
                      Next Step
                    </button>
                  ) : (
                    <button
                      onClick={() => setGroundingStep(0)}
                      className="px-4 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer font-bold flex items-center gap-1"
                    >
                      <span>Restart</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* C. POSITIVE AFFIRMATIONS */}
          {activeSubTab === 'affirmations' && (
            <div className="space-y-6 text-center py-4">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                Calming Affirmations
              </h3>
              <p className="text-xs text-slate-500">
                Gentle reminders of your internal safety and strength. Whisper them to yourself.
              </p>

              <div className="p-8 bg-gradient-to-br from-red-500/5 to-transparent dark:from-red-950/15 dark:to-transparent rounded-[2rem] border border-red-500/10 min-h-[10rem] flex flex-col justify-center items-center">
                <span className="text-4xl text-red-400 mb-2 font-serif">“</span>
                <p className="text-base md:text-lg font-medium text-slate-800 dark:text-slate-100 leading-relaxed font-sans max-w-md">
                  {randomAffirmation}
                </p>
                <span className="text-4xl text-red-400 mt-2 font-serif">”</span>
              </div>

              <button
                onClick={() => setRandomAffirmation(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)])}
                className="px-5 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/45 text-red-600 dark:text-red-400 border border-red-500/10 rounded-full text-xs font-bold transition-all cursor-pointer"
              >
                Show Another Affirmation
              </button>
            </div>
          )}

          {/* D. CALM TIMER */}
          {activeSubTab === 'timer' && (
            <div className="space-y-6 text-center">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                Calm Countdown Timer
              </h3>
              <p className="text-xs text-slate-500">
                Grant yourself 5 minutes of quiet time. Switch off other stimulations completely.
              </p>

              <div className="py-4">
                <span className="text-5xl font-mono font-black text-red-600 dark:text-red-400 tracking-wider">
                  {formatTime(timeLeft)}
                </span>
              </div>

              <div className="flex justify-center gap-3">
                {isTimerRunning ? (
                  <button
                    onClick={() => setIsTimerRunning(false)}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-full text-xs font-bold cursor-pointer"
                  >
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={() => setIsTimerRunning(true)}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold cursor-pointer flex items-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Timer</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimeLeft(300);
                  }}
                  className="px-5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full text-xs font-medium cursor-pointer"
                >
                  Reset
                </button>
              </div>

              <div className="text-xs text-slate-400 italic max-w-xs mx-auto">
                "It is okay to pause. There is nowhere else you need to be for the next five minutes."
              </div>
            </div>
          )}

          {/* E. QUICK RELIEF TIPS */}
          {activeSubTab === 'tips' && (
            <div className="space-y-4 text-left">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide text-center">
                Instantly Reduce Physiological Overwhelm
              </h3>
              <div className="grid grid-cols-1 gap-3.5 pt-2">
                {QUICK_RELIEF_TECHNIQUES.map((tech, i) => (
                  <div 
                    key={i} 
                    className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex items-start gap-3"
                  >
                    <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wide text-slate-800 dark:text-slate-200">
                        {tech.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                        {tech.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer supportive reminders */}
        <div className="bg-slate-50 dark:bg-slate-950/80 p-5 text-center text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800/60 font-medium">
          🕊️ Remember: Feelings are waves that rise, crest, and pass. You are safe.
        </div>

      </div>
    </div>
  );
}

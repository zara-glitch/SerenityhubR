import React, { useState, useEffect } from 'react';
import { 
  X, Wind, Play, Pause, RotateCcw, Volume2, Sparkles, Droplet, CheckCircle 
} from 'lucide-react';
import { AFFIRMATIONS } from '../data';

interface FocusModeProps {
  isActive: boolean;
  onClose: () => void;
  onAddWater: () => void;
  waterStreak: number;
}

export default function FocusMode({ isActive, onClose, onAddWater, waterStreak }: FocusModeProps) {
  const [timerPreset, setTimerPreset] = useState(300); // 5 mins standard
  const [timeLeft, setTimeLeft] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  
  // Guided breathing
  const [breathState, setBreathState] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [breathTimer, setBreathTimer] = useState(0);

  // Cycling affirmation
  const [affirmation, setAffirmation] = useState('');
  
  // Simulated music audio track selector
  const [selectedTrack, setSelectedTrack] = useState('Ocean Waves');
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  // Load random affirmation
  useEffect(() => {
    setAffirmation(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);
  }, [isActive]);

  // Affirmation cycle every 10 seconds
  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setAffirmation(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // Main countdown
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Breathing loop
  useEffect(() => {
    let interval: any = null;
    if (breathState !== 'idle') {
      interval = setInterval(() => {
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
    return () => clearInterval(interval);
  }, [breathState]);

  if (!isActive) return null;

  const startBreathing = () => {
    setBreathState('inhale');
    setBreathTimer(0);
  };

  const stopBreathing = () => {
    setBreathState('idle');
    setBreathTimer(0);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const setPreset = (seconds: number) => {
    setIsRunning(false);
    setTimerPreset(seconds);
    setTimeLeft(seconds);
  };

  const getBreathText = () => {
    switch (breathState) {
      case 'inhale': return 'Breathe In Slowly';
      case 'hold': return 'Hold Breath';
      case 'exhale': return 'Exhale Comfortably';
      default: return 'Start Breathing Guide';
    }
  };

  const TRACKS = [
    { name: 'Lo-fi Beats ☕', desc: 'Chill hiphop loops' },
    { name: 'Nature Sounds 🌲', desc: 'Forest breeze' },
    { name: 'Ocean Waves 🌊', desc: 'Tidal breathing pace' },
    { name: 'Rain Sounds 🌧️', desc: 'Calming downpour' },
    { name: 'Piano Music 🎹', desc: 'Melodic solace' },
    { name: 'White Noise 💨', desc: 'Constant frequencies' },
    { name: 'Brown Noise 🌌', desc: 'Deep warm rumble' },
    { name: 'Instrumental 🎻', desc: 'Relaxing ambient strings' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#0B130E] text-[#E0EADF] flex flex-col justify-between p-6 md:p-12 animate-fade-in overflow-y-auto">
      
      {/* 1. TOP HEADER - EXIT BUTTON */}
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-[#2D4A3E]/40 border border-[#48735C]/35 rounded-full flex items-center justify-center">
            <Wind className="w-5 h-5 text-teal-400 animate-pulse" />
          </div>
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#88A696] block">Distraction-Free Mode</span>
            <span className="text-sm font-bold text-white">Focus Sanctuary</span>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          <span>Exit Focus Mode</span>
        </button>
      </div>

      {/* 2. MID SECTION - Bento/Grid centering breathing and timer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl w-full mx-auto my-auto py-6">
        
        {/* Left Bento: Guided Breathing Animation */}
        <div className="lg:col-span-6 flex flex-col items-center text-center space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-teal-400 tracking-[0.2em]">Guided Breathwork</span>
            <h3 className="text-xl md:text-2xl font-light">Slow Down Your Pace</h3>
          </div>

          <div className="h-56 flex items-center justify-center relative w-full">
            <div className={`rounded-full flex flex-col items-center justify-center transition-all duration-[1000ms] ${
              breathState === 'inhale' ? 'w-52 h-52 bg-[#2D4A3E]/30 ring-8 ring-teal-500/20 scale-110' :
              breathState === 'hold' ? 'w-52 h-52 bg-[#3A452D]/30 ring-8 ring-amber-500/20 scale-110' :
              breathState === 'exhale' ? 'w-36 h-36 bg-[#2B434D]/20 ring-4 ring-sky-500/10 scale-90' :
              'w-40 h-40 bg-white/5 border border-white/10'
            }`}>
              <span className="text-xs font-bold text-white tracking-wide">{getBreathText()}</span>
              {breathState !== 'idle' && (
                <span className="text-[11px] text-[#88A696] font-mono mt-1">{breathTimer}s</span>
              )}
            </div>
          </div>

          <div>
            {breathState === 'idle' ? (
              <button
                onClick={startBreathing}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-full text-xs font-bold shadow-md cursor-pointer"
              >
                Start Breathing Cycle
              </button>
            ) : (
              <button
                onClick={stopBreathing}
                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full text-xs font-bold cursor-pointer"
              >
                Stop Guide
              </button>
            )}
          </div>
        </div>

        {/* Right Bento: Relaxation Timer & Music selector */}
        <div className="lg:col-span-6 space-y-8">
          
          {/* Relaxation Timer */}
          <div className="p-6 bg-white/2 border border-white/5 rounded-3xl text-center space-y-4">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-[#88A696]">Quiet Focus Timer</h4>
            
            <span className="text-5xl font-mono font-black text-white tracking-widest block">
              {formatTime(timeLeft)}
            </span>

            {/* Presets */}
            <div className="flex gap-2 justify-center">
              {[60, 180, 300, 600].map(s => (
                <button
                  key={s}
                  onClick={() => setPreset(s)}
                  className={`px-3 py-1 text-[10px] rounded-lg border transition-all cursor-pointer ${
                    timerPreset === s 
                      ? 'border-teal-500 bg-teal-500/10 text-teal-400 font-bold' 
                      : 'border-white/5 bg-white/1 text-slate-400 hover:text-white'
                  }`}
                >
                  {s / 60}m
                </button>
              ))}
            </div>

            {/* Controls */}
            <div className="flex gap-3 justify-center pt-2">
              {isRunning ? (
                <button
                  onClick={() => setIsRunning(false)}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-full text-xs font-bold cursor-pointer"
                >
                  Pause
                </button>
              ) : (
                <button
                  onClick={() => setIsRunning(true)}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-full text-xs font-bold cursor-pointer"
                >
                  Start Timer
                </button>
              )}
              <button
                onClick={() => {
                  setIsRunning(false);
                  setTimeLeft(timerPreset);
                }}
                className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Calm Music Player suggestions */}
          <div className="p-6 bg-white/2 border border-white/5 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-teal-400">
                <Volume2 className="w-4.5 h-4.5" />
                <h4 className="font-bold text-xs uppercase tracking-wider">Calming Soundscapes</h4>
              </div>
              <button
                onClick={() => setIsPlayingMusic(!isPlayingMusic)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                  isPlayingMusic ? 'bg-teal-600 text-white animate-pulse' : 'bg-white/5 text-slate-350'
                }`}
              >
                {isPlayingMusic ? 'Playing Simulated Audio' : 'Play simulated'}
              </button>
            </div>

            {/* Visualizer wave simulation if playing */}
            {isPlayingMusic && (
              <div className="flex gap-1 items-end justify-center h-5 py-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                  <div 
                    key={i} 
                    className="w-1 bg-teal-400 rounded-full animate-pulse" 
                    style={{ 
                      height: `${Math.floor(Math.random() * 16) + 4}px`,
                      animationDelay: `${i * 120}ms`
                    }}
                  />
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-left max-h-36 overflow-y-auto custom-scrollbar">
              {TRACKS.map(track => {
                const isSelected = selectedTrack === track.name;
                return (
                  <button
                    key={track.name}
                    onClick={() => {
                      setSelectedTrack(track.name);
                      setIsPlayingMusic(true);
                    }}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-teal-500 bg-teal-500/10 text-white font-bold' 
                        : 'border-white/5 bg-white/1 text-slate-450 hover:text-white'
                    }`}
                  >
                    <p className="text-[11px] leading-tight">{track.name}</p>
                    <p className="text-[9px] text-[#88A696] mt-0.5">{track.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* 3. FOOTER - Affirmation & Hydration reminder */}
      <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6 border-t border-white/5 pt-6 text-center md:text-left select-none">
        
        {/* Affirmation display */}
        <div className="max-w-md space-y-1">
          <span className="text-[9px] uppercase font-bold text-teal-400 tracking-widest flex items-center gap-1 justify-center md:justify-start">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Supportive Affirmation</span>
          </span>
          <p className="text-xs md:text-sm text-white italic">
            "{affirmation}"
          </p>
        </div>

        {/* Water reminders */}
        <div className="p-4 bg-teal-950/20 border border-teal-550/20 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-600/25 rounded-full flex items-center justify-center shrink-0">
            <Droplet className="w-5 h-5 text-teal-400" />
          </div>
          <div className="text-left text-xs font-medium space-y-1">
            <p className="text-white">Water streak: <span className="font-bold text-teal-400">{waterStreak} glasses</span> today</p>
            <button
              onClick={onAddWater}
              className="text-[10px] bg-teal-600 hover:bg-teal-500 text-white font-bold px-3 py-1 rounded-lg cursor-pointer transition-colors"
            >
              Drink +1 Glass
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

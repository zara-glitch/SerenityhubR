import React, { useState } from 'react';
import { 
  Moon, Sun, Clock, Sparkles, Smile, ShieldAlert, Monitor, Plus, Trash2, HelpCircle 
} from 'lucide-react';
import { SleepEntry, ScreenTimeEntry, StressCheckResult } from '../types';

interface SleepScreenTrackerProps {
  sleepEntries: SleepEntry[];
  screenTimeEntries: ScreenTimeEntry[];
  stressResults: StressCheckResult[];
  onAddSleepEntry: (bedtime: string, wakeTime: string, duration: number, quality: number) => void;
  onAddScreenTimeEntry: (hours: number) => void;
  onDeleteSleepEntry: (id: string) => void;
  onDeleteScreenTime: (id: string) => void;
}

export default function SleepScreenTracker({
  sleepEntries,
  screenTimeEntries,
  stressResults,
  onAddSleepEntry,
  onAddScreenTimeEntry,
  onDeleteSleepEntry,
  onDeleteScreenTime
}: SleepScreenTrackerProps) {
  // Input states
  const [bedtime, setBedtime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('06:00');
  const [quality, setQuality] = useState(3);
  const [screenHours, setScreenHours] = useState('');

  // Calculate sleep duration helper
  const calculateDuration = (start: string, end: string): number => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    
    let durationMin = (eh * 60 + em) - (sh * 60 + sm);
    if (durationMin < 0) {
      durationMin += 24 * 60; // went to bed before midnight, woke after
    }
    return Math.round((durationMin / 60) * 10) / 10;
  };

  const handleSleepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const duration = calculateDuration(bedtime, wakeTime);
    onAddSleepEntry(bedtime, wakeTime, duration, quality);
  };

  const handleScreenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hours = Number(screenHours);
    if (isNaN(hours) || hours < 0 || hours > 24) return;
    onAddScreenTimeEntry(hours);
    setScreenHours('');
  };

  // Generate personalized observations (Feature 10, 14, 15, 19)
  const getObservations = () => {
    const observations = [];
    
    if (sleepEntries.length > 0) {
      const avgSleep = sleepEntries.reduce((acc, s) => acc + s.duration, 0) / sleepEntries.length;
      if (avgSleep < 6.5) {
        observations.push("Your sleep duration averages less than 6.5 hours. Prioritizing 7-8 hours of rest is highly associated with reduced stress levels.");
      } else {
        observations.push("You are doing well maintaining an average sleep duration of " + avgSleep.toFixed(1) + " hours. Keep it up!");
      }
    }

    if (screenTimeEntries.length > 0) {
      const avgScreen = screenTimeEntries.reduce((acc, s) => acc + s.hours, 0) / screenTimeEntries.length;
      if (avgScreen > 5) {
        observations.push("Your average screen time is " + avgScreen.toFixed(1) + " hours. Studies show that reducing evening screen time directly improves restorative deep sleep.");
      } else {
        observations.push("Your screen time remains low and healthy, averaging " + avgScreen.toFixed(1) + " hours daily.");
      }
    }

    if (stressResults.length > 0 && sleepEntries.length > 0) {
      const lastStress = stressResults[0].score;
      const lastSleep = sleepEntries[0].duration;
      if (lastStress > 50 && lastSleep < 6.5) {
        observations.push("Observation: Your stress scores are currently elevated while sleep is below 6.5 hours. Better sleep is significantly associated with lower stress levels.");
      }
    }

    if (observations.length === 0) {
      observations.push("Add a few sleep and screen logs to activate smart wellness observations and trends.");
    }

    return observations;
  };

  // Prepare chart data: Merge last 7 days metrics
  const getCombinedTrends = () => {
    const dates: string[] = [];
    const map: Record<string, { sleep: number; screen: number; stress: number }> = {};

    const formatDate = (ts: number) => {
      return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    // Gather unique dates from logs (limit to last 7 days)
    const allLogs = [
      ...sleepEntries.map(s => ({ date: formatDate(s.timestamp), type: 'sleep', val: s.duration })),
      ...screenTimeEntries.map(s => ({ date: formatDate(s.timestamp), type: 'screen', val: s.hours })),
      ...stressResults.map(s => ({ date: formatDate(s.timestamp), type: 'stress', val: s.score / 10 })) // scale stress 0-10
    ];

    allLogs.forEach(log => {
      if (!dates.includes(log.date)) {
        dates.push(log.date);
        map[log.date] = { sleep: 0, screen: 0, stress: 0 };
      }
      if (log.type === 'sleep') map[log.date].sleep = log.val;
      if (log.type === 'screen') map[log.date].screen = log.val;
      if (log.type === 'stress') map[log.date].stress = log.val;
    });

    return dates.slice(0, 7).map(date => ({
      date,
      ...map[date]
    }));
  };

  const trendData = getCombinedTrends();

  return (
    <div className="space-y-8 py-2 animate-fade-in text-slate-800 dark:text-slate-200 text-left">
      
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white">Sleep & Screen Time Tracker</h2>
        <p className="text-xs md:text-sm text-slate-500">
          Reflect on physical rest metrics and monitor the critical balance between device screen exposure, sleep recovery, and core stress patterns.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Trackers */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Sleep logger */}
          <form onSubmit={handleSleepSubmit} className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
              <Moon className="w-4.5 h-4.5" />
              <h3 className="font-bold text-xs uppercase tracking-wider">Log Nightly Sleep</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">Bedtime</label>
                <input
                  type="time"
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 rounded-xl focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">Wake-up Time</label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 rounded-xl focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-500">Sleep Quality (1 - 5 stars)</label>
              <div className="flex gap-2 select-none">
                {[1, 2, 3, 4, 5].map((stars) => (
                  <button
                    key={stars}
                    type="button"
                    onClick={() => setQuality(stars)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-colors cursor-pointer ${
                      stars <= quality 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-350'
                    }`}
                  >
                    {stars}★
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-full shadow-sm cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <Smile className="w-4 h-4" />
              <span>Log Rest ({calculateDuration(bedtime, wakeTime)} hrs)</span>
            </button>
          </form>

          {/* Screen Time logger */}
          <form onSubmit={handleScreenSubmit} className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
              <Monitor className="w-4.5 h-4.5" />
              <h3 className="font-bold text-xs uppercase tracking-wider">Log Screen Time</h3>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-500">How many hours on your phone today?</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={screenHours}
                onChange={(e) => setScreenHours(e.target.value)}
                placeholder="E.g. 3.5"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 rounded-xl focus:ring-1 focus:ring-sky-500 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={!screenHours}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-45 text-white font-bold text-xs rounded-full shadow-sm cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Save Screen Time</span>
            </button>
          </form>

        </div>

        {/* Right Column: Comparison Trends & Observations */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Smart Observations */}
          <div className="p-6 bg-gradient-to-br from-[#B8A4D8]/10 to-transparent dark:from-purple-950/10 dark:to-transparent border border-[#B8A4D8]/15 dark:border-slate-800 rounded-[2rem] space-y-3">
            <div className="flex items-center gap-1.5 text-[#B8A4D8]">
              <Sparkles className="w-4.5 h-4.5" />
              <h4 className="font-bold text-xs uppercase tracking-wider">Smart Pattern Observations</h4>
            </div>
            
            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans font-medium">
              {getObservations().map((obs, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0 mt-1.5" />
                  <span>{obs}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Graphical Representation */}
          <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm space-y-6">
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                Weekly Wellbeing Balance Trends
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Comparing Sleep Hours, Screen Time, and Stress Levels side-by-side.</p>
            </div>

            {trendData.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs italic">
                No log coordinates found. Track daily sleep and screen hours to view visual charts.
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Custom Responsive Multi-Bar Chart */}
                <div className="grid grid-cols-7 gap-2.5 items-end h-48 border-b border-slate-100 dark:border-slate-800 pb-1 pt-4 text-center">
                  {trendData.map((d, index) => (
                    <div key={index} className="flex flex-col items-center h-full justify-end group">
                      
                      {/* Interactive tooltips on hover */}
                      <div className="absolute opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[9px] px-2 py-1 rounded-md mb-24 pointer-events-none z-30 transition-opacity">
                        💤 Rest: {d.sleep || 0}h<br />
                        📱 Screen: {d.screen || 0}h<br />
                        ⚠️ Stress: {Math.round(d.stress * 10)}%
                      </div>

                      {/* Bars Container */}
                      <div className="flex gap-1 h-full items-end justify-center w-full px-1">
                        {/* Sleep Bar (Indigo) */}
                        <div 
                          className="w-2.5 rounded-t bg-indigo-500 transition-all duration-350"
                          style={{ height: `${Math.min(100, ((d.sleep || 0) / 12) * 100)}%` }}
                        />
                        {/* Screen Time Bar (Sky) */}
                        <div 
                          className="w-2.5 rounded-t bg-sky-400 transition-all duration-350"
                          style={{ height: `${Math.min(100, ((d.screen || 0) / 12) * 100)}%` }}
                        />
                        {/* Stress Bar (Rose scaled 0-10) */}
                        <div 
                          className="w-2.5 rounded-t bg-rose-400 transition-all duration-350"
                          style={{ height: `${Math.min(100, ((d.stress || 0) / 10) * 100)}%` }}
                        />
                      </div>

                      {/* Date */}
                      <span className="text-[9px] text-slate-400 font-bold mt-2 truncate w-full">{d.date}</span>
                    </div>
                  ))}
                </div>

                {/* Legends */}
                <div className="flex flex-wrap gap-4 items-center justify-center text-[10px] font-bold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-indigo-500" />
                    <span>Sleep (Hours)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-sky-400" />
                    <span>Screen (Hours)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-rose-400" />
                    <span>Stress Level (%)</span>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Historical Logs List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Sleep Logs */}
            <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-2xl p-4 max-h-60 overflow-y-auto">
              <h5 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400 pb-2 mb-2 border-b">Recent Sleep Entries</h5>
              {sleepEntries.length === 0 ? (
                <p className="text-[10px] italic text-slate-400 py-4 text-center">No rest entries logged</p>
              ) : (
                <div className="space-y-1.5 text-xs text-left">
                  {sleepEntries.slice(0, 5).map(s => (
                    <div key={s.id} className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800/50">
                      <div>
                        <span className="font-bold">{s.duration} hrs</span>
                        <span className="text-slate-400 text-[10px] ml-1.5">({s.bedtime}-{s.wakeTime})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-indigo-500 font-mono text-[10px]">{s.quality}★</span>
                        <button onClick={() => onDeleteSleepEntry(s.id)} className="text-slate-350 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Screen Logs */}
            <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-2xl p-4 max-h-60 overflow-y-auto">
              <h5 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400 pb-2 mb-2 border-b">Recent Screen Entries</h5>
              {screenTimeEntries.length === 0 ? (
                <p className="text-[10px] italic text-slate-400 py-4 text-center">No screen logs recorded</p>
              ) : (
                <div className="space-y-1.5 text-xs text-left">
                  {screenTimeEntries.slice(0, 5).map(s => (
                    <div key={s.id} className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800/50">
                      <span className="font-bold">{s.hours} hours phone time</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[9px]">{new Date(s.timestamp).toLocaleDateString()}</span>
                        <button onClick={() => onDeleteScreenTime(s.id)} className="text-slate-350 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

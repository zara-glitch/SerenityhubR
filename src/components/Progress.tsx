/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  TrendingDown, TrendingUp, Calendar, Heart, Award, Sparkles, 
  CheckCircle2, Info, LayoutList, BarChart3, Clock, Flame 
} from 'lucide-react';
import { StressCheckResult, MoodEntry, JournalEntry } from '../types';

interface ProgressProps {
  results: StressCheckResult[];
  moods: MoodEntry[];
  journals: JournalEntry[];
}

export default function Progress({ results, moods, journals }: ProgressProps) {
  // 1. Calculate General Streaks (e.g. any logs/assessments in consecutive days)
  const calculateStreak = () => {
    if (results.length === 0 && moods.length === 0 && journals.length === 0) return 0;
    
    // Aggregate all unique active days
    const activeDates = new Set<string>();
    const processTimestamp = (ts: number) => {
      const d = new Date(ts);
      activeDates.add(d.toDateString());
    };

    results.forEach(r => processTimestamp(r.timestamp));
    moods.forEach(m => processTimestamp(m.timestamp));
    journals.forEach(j => processTimestamp(j.timestamp));

    const sortedDates = Array.from(activeDates).map(ds => new Date(ds).getTime()).sort((a, b) => b - a);
    
    if (sortedDates.length === 0) return 0;

    let streak = 0;
    let expectedTime = new Date().setHours(0,0,0,0); // Today's midnight

    // Check if user has logged today or yesterday
    const latestDiff = (expectedTime - sortedDates[0]) / (1000 * 60 * 60 * 24);
    if (latestDiff > 1) return 0; // broke streak, hasn't logged today or yesterday

    let currentRef = sortedDates[0];
    streak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const diffDays = (currentRef - sortedDates[i]) / (1000 * 60 * 60 * 24);
      if (diffDays === 1) {
        streak++;
        currentRef = sortedDates[i];
      } else if (diffDays > 1) {
        break; // broke connection
      }
    }

    return streak;
  };

  const currentStreak = calculateStreak();

  // 2. Averages
  const averageStress = results.length > 0 
    ? Math.round(results.reduce((acc, curr) => acc + curr.score, 0) / results.length)
    : null;

  const moodCounts = moods.reduce<Record<string, number>>((acc, curr) => {
    acc[curr.mood] = (acc[curr.mood] || 0) + 1;
    return acc;
  }, {});

  const favoriteMood = Object.keys(moodCounts).length > 0
    ? Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b)
    : null;

  // 3. Smart Insights Engine!
  // Generate correlations based on logs
  const generateInsights = () => {
    const insights: string[] = [];

    if (results.length === 0) {
      return [
        "Take your first Stress Check to begin compiling smart wellness insights.",
        "Smart Insights track correlations between sleeping patterns, hydration, and overall physical strain."
      ];
    }

    // Insight A: Correlation of sleep quality to stress score
    const poorSleepResults = results.filter(r => (r.answers['sleep'] || 3) >= 4);
    const goodSleepResults = results.filter(r => (r.answers['sleep'] || 3) <= 2);

    if (poorSleepResults.length > 0 && goodSleepResults.length > 0) {
      const avgPoor = Math.round(poorSleepResults.reduce((acc, curr) => acc + curr.score, 0) / poorSleepResults.length);
      const avgGood = Math.round(goodSleepResults.reduce((acc, curr) => acc + curr.score, 0) / goodSleepResults.length);
      const diff = avgPoor - avgGood;

      if (diff > 5) {
        insights.push(`😴 Good sleep quality is highly correlated with a ${diff}% lower average stress score for you. Prioritizing rest significantly protects your system.`);
      }
    } else {
      insights.push("💡 Sleep Check: Chronic poor sleep is the highest physiological contributor to high cognitive strain. Keep logging to test this correlation.");
    }

    // Insight B: Activities impact
    const activeResults = results.filter(r => r.completedActivities.length > 0);
    const inactiveResults = results.filter(r => r.completedActivities.length === 0);

    if (activeResults.length > 0 && inactiveResults.length > 0) {
      const avgActive = Math.round(activeResults.reduce((acc, curr) => acc + curr.score, 0) / activeResults.length);
      const avgInactive = Math.round(inactiveResults.reduce((acc, curr) => acc + curr.score, 0) / inactiveResults.length);
      const diff = avgInactive - avgActive;

      if (diff > 4) {
        insights.push(`🚶 Logging wellness activities (like breathing, stretching, walking) is associated with a ${diff}% reduction in your overall stress score!`);
      }
    } else {
      insights.push("💡 Coping Habits: Engaging in regular, brief 3-minute breathwork exercises decreases autonomic stress markers by up to 25%. Try a routine today!");
    }

    // Insight C: Journal writing consistency
    if (journals.length >= 3) {
      insights.push(`✍️ Consistent private writing helps organize complex thoughts, reducing emotional overwhelm by mapping and framing triggers clearly.`);
    }

    return insights;
  };

  const insights = generateInsights();

  // 4. Custom SVG Line Chart Generation (Stress Score Trends over time)
  const renderStressTrendChart = () => {
    if (results.length < 2) {
      return (
        <div className="h-44 flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/40 dark:bg-slate-900/10">
          <p className="text-xs text-slate-400 italic">Complete at least 2 stress checks to display chronological stress score charts.</p>
        </div>
      );
    }

    // Sort results chronologically (oldest to newest) for chart plotting
    const chronologicalResults = [...results].sort((a, b) => a.timestamp - b.timestamp).slice(-7); // max last 7 points
    
    const width = 500;
    const height = 150;
    const padding = 25;
    
    const maxVal = 100;
    const minVal = 0;

    const points = chronologicalResults.map((result, idx) => {
      const x = padding + (idx / (chronologicalResults.length - 1)) * (width - 2 * padding);
      const y = height - padding - (result.score / maxVal) * (height - 2 * padding);
      return { x, y, score: result.score, date: new Date(result.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) };
    });

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <div className="space-y-2">
        <div className="relative w-full aspect-[500/150] overflow-hidden">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            {/* Horizontal Grid lines */}
            {[0, 25, 50, 75, 100].map((gridVal) => {
              const y = height - padding - (gridVal / maxVal) * (height - 2 * padding);
              return (
                <g key={gridVal}>
                  <line 
                    x1={padding} 
                    y1={y} 
                    x2={width - padding} 
                    y2={y} 
                    className="stroke-slate-100 dark:stroke-slate-800/80" 
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                  <text 
                    x="2" 
                    y={y + 3} 
                    className="fill-slate-400 text-[8px] font-semibold font-mono"
                  >
                    {gridVal}%
                  </text>
                </g>
              );
            })}

            {/* Line path */}
            <path 
              d={pathD} 
              className="stroke-emerald-600 dark:stroke-emerald-400 fill-none" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />

            {/* Dots */}
            {points.map((p, i) => (
              <g key={i} className="group">
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r="4.5" 
                  className="fill-white stroke-emerald-600 dark:stroke-emerald-400" 
                  strokeWidth="2" 
                />
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r="8" 
                  className="fill-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity" 
                />
                {/* Score hover text */}
                <text 
                  x={p.x} 
                  y={p.y - 8} 
                  textAnchor="middle" 
                  className="fill-slate-700 dark:fill-slate-300 text-[8px] font-bold font-mono"
                >
                  {p.score}%
                </text>
                
                {/* Date labels at bottom */}
                <text 
                  x={p.x} 
                  y={height - 5} 
                  textAnchor="middle" 
                  className="fill-slate-400 text-[8px] font-semibold"
                >
                  {p.date}
                </text>
              </g>
            ))}
          </svg>
        </div>
        <p className="text-[10px] text-slate-400 font-medium text-center">Chronological trend of your last {chronologicalResults.length} assessments</p>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-800 dark:text-slate-200 py-2">
      
      {/* Streaks and Quick stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Streak card */}
        <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm text-left flex items-center gap-4">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-2xl">
            <Flame className="w-6 h-6 fill-current" />
          </div>
          <div>
            <span className="text-2xl font-black block">{currentStreak} Days</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Wellness Streak</span>
          </div>
        </div>

        {/* Average Stress Score */}
        <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm text-left flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-[#2E7D32] dark:text-emerald-400 rounded-2xl">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black block">{averageStress !== null ? `${averageStress}%` : '—'}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Average Stress Score</span>
          </div>
        </div>

        {/* Favorite Mood Check-in */}
        <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm text-left flex items-center gap-4">
          <div className="p-3 bg-[#B8A4D8]/10 dark:bg-[#B8A4D8]/20 text-[#B8A4D8] rounded-2xl">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-black block uppercase text-[#B8A4D8]">{favoriteMood || '—'}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Predominant Mood</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Stress Trends Chart & Historical check-ins (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm space-y-6 text-left">
            <div className="flex items-center gap-1.5 text-slate-500 pb-2 border-b border-slate-50 dark:border-slate-800">
              <BarChart3 className="w-4 h-4" />
              <h3 className="font-bold text-xs uppercase tracking-wider">Stress Score Trends</h3>
            </div>
            
            {renderStressTrendChart()}
          </div>

          {/* Historical stress check cards */}
          <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm space-y-4 text-left">
            <h3 className="font-bold text-xs uppercase tracking-wider pb-2 border-b border-slate-50 dark:border-slate-800 text-slate-400">
              History of Assessments ({results.length})
            </h3>

            {results.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">No assessments completed yet. Take your first Stress Check today!</p>
            ) : (
              <div className="space-y-2 max-h-[22rem] overflow-y-auto pr-1 custom-scrollbar">
                {[...results].sort((a,b) => b.timestamp - a.timestamp).map((res) => {
                  let categoryColor = 'text-emerald-600 bg-emerald-50';
                  if (res.score > 20) categoryColor = 'text-green-600 bg-green-50';
                  if (res.score > 40) categoryColor = 'text-amber-600 bg-amber-50';
                  if (res.score > 60) categoryColor = 'text-orange-600 bg-orange-50';
                  if (res.score > 80) categoryColor = 'text-rose-600 bg-rose-50';

                  return (
                    <div key={res.id} className="p-3.5 border border-[#A8CFA8]/10 dark:border-slate-800 rounded-xl bg-slate-50/40 dark:bg-slate-900/20 flex justify-between items-center text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-slate-800 dark:text-white">Score: {res.score}%</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${categoryColor} dark:bg-slate-800`}>
                            {res.category}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          Logged: {new Date(res.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      {/* Count of healthy activities */}
                      <span className="text-[10px] font-semibold text-slate-550 dark:text-slate-450 bg-slate-100 dark:bg-slate-850 px-2 py-1 rounded">
                        🏃 {res.completedActivities.length} Activities
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Smart Insights Engine (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm space-y-6 text-left">
            <div className="flex items-center gap-1.5 text-slate-500 pb-2 border-b border-slate-50 dark:border-slate-800">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-xs uppercase tracking-wider">Smart Correlation Insights</h3>
            </div>

            <div className="space-y-4">
              {insights.map((insight, idx) => (
                <div 
                  key={idx} 
                  className="p-4 rounded-xl border border-emerald-100/30 bg-emerald-50/10 dark:border-slate-800 dark:bg-slate-900/30 flex items-start gap-3"
                >
                  <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-medium">
                    {insight}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] leading-normal text-slate-450 dark:text-slate-400 flex gap-2">
              <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <span>Smart insights analyze patterns predictably on your device to help identify specific lifestyle adjustments that protect your resilience.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

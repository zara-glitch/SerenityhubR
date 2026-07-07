/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ArrowRight, Play, CheckCircle2, AlertCircle, Save, 
  HelpCircle, Sparkles, Smile, ShieldAlert, Check, RefreshCw 
} from 'lucide-react';
import { STRESS_QUESTIONS, MOOD_DEFINITIONS, HEALTHY_ACTIVITIES, FUN_ACTIVITIES, DYNAMIC_RECOMMENDATIONS } from '../data';
import { StressCheckResult, MoodType } from '../types';

interface StressCheckProps {
  onSaveResult: (result: StressCheckResult) => void;
  recentMoods: { mood: MoodType }[];
}

export default function StressCheck({ onSaveResult, recentMoods }: StressCheckProps) {
  // Step navigation: 'home' | 'quiz' | 'reflection' | 'activities' | 'analyzing' | 'result'
  const [step, setStep] = useState<'home' | 'quiz' | 'reflection' | 'activities' | 'analyzing' | 'result'>('home');
  
  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  
  // Reflection state
  const [openReflection, setOpenReflection] = useState('');
  
  // Activities state
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [customActivity, setCustomActivity] = useState('');
  
  // AI analysis results state
  const [sentiment, setSentiment] = useState<'Positive' | 'Neutral' | 'Negative'>('Neutral');
  const [detectedTone, setDetectedTone] = useState<string>('Calm');
  const [aiParagraph, setAiParagraph] = useState<string>('');
  
  // Final Score state
  const [calculatedScore, setCalculatedScore] = useState(0);
  const [scoreCategory, setScoreCategory] = useState<'Very Low' | 'Mild' | 'Moderate' | 'High' | 'Severe'>('Very Low');
  
  // Result Feedback state (What helped you feel better today?)
  const [helpfulFactors, setHelpfulFactors] = useState<string[]>([]);
  const [customHelpful, setCustomHelpful] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Initialize checklist values if we go through again
  const startAssessment = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setOpenReflection('');
    setSelectedActivities([]);
    setCustomActivity('');
    setHelpfulFactors([]);
    setCustomHelpful('');
    setNotes('');
    setIsSaved(false);
    setStep('quiz');
  };

  const handleSelectAnswer = (rating: number) => {
    const q = STRESS_QUESTIONS[currentQuestionIndex];
    setAnswers({ ...answers, [q.id]: rating });
  };

  const handleNextQuiz = () => {
    if (currentQuestionIndex < STRESS_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setStep('reflection');
    }
  };

  const handlePrevQuiz = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const toggleActivity = (actId: string) => {
    if (selectedActivities.includes(actId)) {
      setSelectedActivities(selectedActivities.filter(id => id !== actId));
    } else {
      setSelectedActivities([...selectedActivities, actId]);
    }
  };

  // Perform Local Analysis (baseline & fallback)
  const performLocalAnalysis = (text: string) => {
    const cleanText = text.toLowerCase();
    
    // Keywords mapping
    const stressKeywords = ['overwhelmed', 'burnout', 'pressure', 'exhausted', 'anxious', 'panic', 'hopeless', 'lonely', 'struggling', 'stress', 'tired', 'sad', 'angry', 'irritated'];
    const positiveKeywords = ['coping', 'improving', 'hopeful', 'calm', 'supported', 'managing', 'grateful', 'happy', 'excited', 'relaxed', 'better'];

    let stressCount = 0;
    let positiveCount = 0;

    stressKeywords.forEach(kw => {
      if (cleanText.includes(kw)) stressCount++;
    });

    positiveKeywords.forEach(kw => {
      if (cleanText.includes(kw)) positiveCount++;
    });

    let localSentiment: 'Positive' | 'Neutral' | 'Negative' = 'Neutral';
    let localTone = 'Calm';

    if (stressCount > positiveCount) {
      localSentiment = 'Negative';
      localTone = stressCount > 3 ? 'Burned Out' : 'Overwhelmed';
    } else if (positiveCount > stressCount) {
      localSentiment = 'Positive';
      localTone = 'Hopeful';
    } else if (cleanText.length > 0) {
      localSentiment = 'Neutral';
      localTone = 'Neutral';
    }

    return { sentiment: localSentiment, tone: localTone };
  };

  // Main compilation of the stress assessment
  const processAssessmentResult = async () => {
    setStep('analyzing');

    // 1. Calculate raw question score (0 to 80 points)
    let rawSum = 0;
    STRESS_QUESTIONS.forEach(q => {
      const rating = answers[q.id] || 3; // default to neutral if unanswered
      rawSum += (rating - 1); // map 1-5 to 0-4
    });

    // Max raw sum is 20 * 4 = 80
    let baseScorePercentage = (rawSum / 80) * 100;

    // 2. Local Textual Analysis
    const localAnalysis = performLocalAnalysis(openReflection);
    let finalSentiment = localAnalysis.sentiment;
    let finalTone = localAnalysis.tone;

    // Adjust score slightly based on sentiment
    let sentimentAdjustment = 0;
    if (finalSentiment === 'Negative') sentimentAdjustment = 5;
    if (finalSentiment === 'Positive') sentimentAdjustment = -5;

    // 3. Activity reductions
    // Healthy activities reduce score by 1.5% each, up to a max of 15% reduction
    const healthySelected = selectedActivities.filter(id => 
      HEALTHY_ACTIVITIES.some(ha => ha.id === id)
    );
    const activityReduction = Math.min(healthySelected.length * 1.5, 15);

    // Final score bound to 0 - 100%
    let finalScore = Math.max(0, Math.min(100, Math.round(baseScorePercentage + sentimentAdjustment - activityReduction)));

    // Categorize
    let category: 'Very Low' | 'Mild' | 'Moderate' | 'High' | 'Severe' = 'Very Low';
    if (finalScore <= 20) category = 'Very Low';
    else if (finalScore <= 40) category = 'Mild';
    else if (finalScore <= 60) category = 'Moderate';
    else if (finalScore <= 80) category = 'High';
    else category = 'Severe';

    // 4. Try server-side Gemini AI analyze route
    let finalAiParagraph = "";
    if (openReflection.trim().length > 3) {
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reflection: openReflection,
            answersSummary: STRESS_QUESTIONS.map(q => `${q.category}: ${answers[q.id] || 3}/5`).join(', '),
            calculatedScore: finalScore,
            category
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.sentiment) finalSentiment = data.sentiment;
          if (data.tone) finalTone = data.tone;
          if (data.analysis) finalAiParagraph = data.analysis;
        }
      } catch (err) {
        console.warn("API AI Analysis failed, utilizing client-side algorithm fallback.", err);
      }
    }

    if (!finalAiParagraph) {
      // Fallback empathetic prompt
      const reflectionPhrase = openReflection.trim().length > 0 
        ? `Regarding your reflection on "${openReflection.slice(0, 45)}...", it is incredibly courageous to name these stressors. ` 
        : "";
      
      if (category === 'Very Low' || category === 'Mild') {
        finalAiParagraph = `${reflectionPhrase}Your self-check displays strong internal coping mechanisms. Continue taking supportive steps, stretching, and maintaining your boundaries. Keep prioritizing hydration and rest!`;
      } else if (category === 'Moderate') {
        finalAiParagraph = `${reflectionPhrase}Your assessment indicates some mounting strain and cognitive load. This is a gentle prompt from your system to hit the pause button. Taking brief 3-minute breath breaks and spending a few minutes outdoors will support your balance today.`;
      } else {
        finalAiParagraph = `${reflectionPhrase}Your check-in reflects a significant amount of weight on your shoulders right now. Please remember that feeling overwhelmed is a completely human response to heavy circumstances. Consider reducing any non-essential commitments today, and remember that seeking the counsel of a professional is a step of true strength.`;
      }
    }

    // Set final states
    setCalculatedScore(finalScore);
    setScoreCategory(category);
    setSentiment(finalSentiment);
    setDetectedTone(finalTone);
    setAiParagraph(finalAiParagraph);
    
    // Move to Results step
    setStep('result');
  };

  const handleSaveResult = () => {
    const finalResult: StressCheckResult = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      answers,
      score: calculatedScore,
      category: scoreCategory,
      openReflection: openReflection.trim() || undefined,
      sentiment,
      tone: detectedTone,
      completedActivities: selectedActivities,
      customActivity: customActivity.trim() || undefined,
      helpfulFactors,
      notes: notes.trim() || undefined
    };

    onSaveResult(finalResult);
    setIsSaved(true);
  };

  // Get color configurations for the stress gauge
  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case 'Very Low':
        return { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-800/40', progress: 'stroke-emerald-500' };
      case 'Mild':
        return { text: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/20', border: 'border-green-200 dark:border-green-800/40', progress: 'stroke-green-500' };
      case 'Moderate':
        return { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-200 dark:border-amber-800/40', progress: 'stroke-amber-500' };
      case 'High':
        return { text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/20', border: 'border-orange-200 dark:border-orange-800/40', progress: 'stroke-orange-500' };
      case 'Severe':
        return { text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/20', border: 'border-rose-200 dark:border-rose-800/40', progress: 'stroke-rose-500' };
      default:
        return { text: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', progress: 'stroke-slate-500' };
    }
  };

  const catTheme = getCategoryTheme(scoreCategory);

  // List of items where the user scored 4 or 5 (Often / Very Often) representing contributing stress factors
  const contributingFactors = STRESS_QUESTIONS.filter(q => (answers[q.id] || 0) >= 4).map(q => q.category);

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-slate-800 dark:text-slate-200 py-2">
      
      {/* 1. ASSESSMENT LAUNCH SCREEN */}
      {step === 'home' && (
        <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 md:p-8 shadow-sm text-center space-y-6 animate-fade-in">
          <div className="max-w-md mx-auto space-y-4">
            <span className="material-symbols-outlined text-6xl text-[#2E7D32] dark:text-emerald-500 block">spa</span>
            <h2 className="font-headline-lg text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white">Stress Check</h2>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Take a mindful 20-question self-assessment to identify your current stress triggers, log daily wellness routines, and receive a supportive AI analysis.
            </p>
          </div>

          <div className="max-w-md mx-auto bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 text-left flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-[#2E7D32] dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">Fully Private</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                Your responses remain encrypted inside local storage on this browser only. None of your data is shared with external databases or trackers.
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={startAssessment}
              className="flex items-center justify-center gap-2 bg-[#2E7D32] hover:bg-emerald-800 dark:bg-[#2E7D32] text-white font-semibold rounded-full px-8 py-3.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Begin Assessment</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. ASSESSMENT QUIZ STEPS */}
      {step === 'quiz' && (
        <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 md:p-8 shadow-sm space-y-6 text-left animate-fade-in">
          
          {/* Header Progress indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span>Question {currentQuestionIndex + 1} of {STRESS_QUESTIONS.length}</span>
              <span className="text-[#2E7D32] dark:text-emerald-400 font-bold">{STRESS_QUESTIONS[currentQuestionIndex].category}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#2E7D32] dark:bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / STRESS_QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="py-4 space-y-1">
            <span className="text-xs font-bold text-slate-400 tracking-wider block uppercase">Trigger Check</span>
            <h3 className="font-headline-md text-base md:text-lg font-bold text-slate-800 dark:text-white leading-relaxed">
              {STRESS_QUESTIONS[currentQuestionIndex].text}
            </h3>
          </div>

          {/* Rating options (1 to 5) */}
          <div className="grid grid-cols-1 gap-3 pt-2">
            {[
              { rating: 1, label: 'Never / Not At All', desc: 'No stress or impact detected in this area.' },
              { rating: 2, label: 'Rarely', desc: 'Very minimal or infrequent occurrence.' },
              { rating: 3, label: 'Sometimes', desc: 'Occasional impact, manageable but noticeable.' },
              { rating: 4, label: 'Often', desc: 'Frequent occurrence, significantly taxing my system.' },
              { rating: 5, label: 'Very Often', desc: 'Severe impact, highly persistent trigger.' }
            ].map((option) => {
              const questionId = STRESS_QUESTIONS[currentQuestionIndex].id;
              const isSelected = answers[questionId] === option.rating;

              return (
                <button
                  key={option.rating}
                  onClick={() => handleSelectAnswer(option.rating)}
                  className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-[#A8CFA8] bg-emerald-50/20 dark:border-emerald-500 dark:bg-emerald-950/20 shadow-sm'
                      : 'border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center ${
                    isSelected ? 'border-[#2E7D32] dark:border-[#A8CFA8]' : 'border-slate-300 dark:border-slate-700'
                  }`}>
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#2E7D32] dark:bg-emerald-500" />}
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 block">{option.label}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 leading-normal block">{option.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <button
              onClick={handlePrevQuiz}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-35 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <span className="text-xs text-slate-400 font-medium">Click an option to rate</span>

            <button
              onClick={handleNextQuiz}
              disabled={!answers[STRESS_QUESTIONS[currentQuestionIndex].id]}
              className="flex items-center gap-1.5 bg-[#2E7D32] hover:bg-emerald-800 dark:bg-[#2E7D32]/80 disabled:opacity-45 disabled:pointer-events-none text-white px-5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
            >
              <span>{currentQuestionIndex === STRESS_QUESTIONS.length - 1 ? 'Next Step' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. OPEN REFLECTION STEP */}
      {step === 'reflection' && (
        <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 md:p-8 shadow-sm space-y-6 text-left animate-fade-in">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1 text-[#2E7D32] dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Open Reflection</span>
            </div>
            <h2 className="font-headline-lg text-lg md:text-xl font-bold text-slate-800 dark:text-white">Is there anything causing you stress that wasn't covered above?</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Describe your current life situation, feelings, or recent events. This information helps generate a deeper, highly supportive analysis. (Optional)
            </p>
          </div>

          <textarea
            value={openReflection}
            onChange={(e) => setOpenReflection(e.target.value)}
            placeholder="Describe your situation here..."
            className="w-full min-h-[14rem] p-4 bg-slate-50 dark:bg-slate-800/40 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm leading-relaxed"
          />

          <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <button
              onClick={() => {
                setCurrentQuestionIndex(STRESS_QUESTIONS.length - 1);
                setStep('quiz');
              }}
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Quiz</span>
            </button>

            <button
              onClick={() => setStep('activities')}
              className="flex items-center gap-1.5 bg-[#2E7D32] hover:bg-emerald-800 dark:bg-[#2E7D32]/80 text-white px-6 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
            >
              <span>Next: Activities</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4. DAILY ACTIVITY CHECKLIST TRACKER */}
      {step === 'activities' && (
        <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 md:p-8 shadow-sm space-y-6 text-left animate-fade-in">
          <div className="space-y-1">
            <h2 className="font-headline-lg text-lg md:text-xl font-bold text-slate-800 dark:text-white">Daily Activity Tracker</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select any activities you completed today. Completing healthy coping routines modestly reduces your final stress level.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-[#2E7D32] dark:text-emerald-400 uppercase tracking-wider mb-2">Wellness Coping Mechanisms</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {HEALTHY_ACTIVITIES.map((act) => {
                  const isChecked = selectedActivities.includes(act.id);
                  return (
                    <button
                      key={act.id}
                      onClick={() => toggleActivity(act.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all ${
                        isChecked
                          ? 'border-[#A8CFA8] bg-emerald-50/20 dark:border-emerald-500 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300'
                          : 'border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <span>{act.label}</span>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                        isChecked ? 'bg-[#2E7D32] border-[#2E7D32]' : 'border-slate-300 dark:border-slate-700'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <h3 className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-2">Fun & Recreational Activities</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {FUN_ACTIVITIES.map((act) => {
                  const isChecked = selectedActivities.includes(act.id);
                  return (
                    <button
                      key={act.id}
                      onClick={() => toggleActivity(act.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all ${
                        isChecked
                          ? 'border-indigo-200 bg-indigo-50/30 dark:border-indigo-500 dark:bg-indigo-950/20 text-indigo-950 dark:text-indigo-300'
                          : 'border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <span>{act.label}</span>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                        isChecked ? 'bg-indigo-650 border-indigo-650' : 'border-slate-300 dark:border-slate-700'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom activity field */}
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Other Activity</label>
              <input
                type="text"
                value={customActivity}
                onChange={(e) => setCustomActivity(e.target.value)}
                placeholder="E.g., Took a hot bath, called grandmom..."
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/40 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <button
              onClick={() => setStep('reflection')}
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={processAssessmentResult}
              className="flex items-center gap-1.5 bg-[#2E7D32] hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-8 py-3 rounded-full text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <span>Calculate Results</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 5. ANALYZING TRANSITION SCREEN */}
      {step === 'analyzing' && (
        <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-12 shadow-sm text-center space-y-6 flex flex-col items-center justify-center min-h-[22rem] animate-pulse">
          <div className="relative">
            <RefreshCw className="w-12 h-12 text-[#2E7D32] dark:text-emerald-500 animate-spin" />
            <span className="material-symbols-outlined text-xl text-[#2E7D32] absolute inset-0 m-auto w-fit h-fit">spa</span>
          </div>
          <div className="space-y-2">
            <h3 className="font-headline-lg text-lg font-bold">Synthesizing Your Stress Assessment</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Mapping your rating responses, checking activity impacts, and generating a personalized, highly supportive wellbeing analysis...
            </p>
          </div>
        </div>
      )}

      {/* 6. RESULTS DASHBOARD */}
      {step === 'result' && (
        <div className="space-y-6 animate-fade-in text-left">
          
          {/* Main Score panel */}
          <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center gap-8 justify-between relative overflow-hidden">
            {/* Ambient blur background layer */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-200/20 dark:bg-emerald-900/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4 max-w-md">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                <span>Assessment Completed</span>
              </div>
              <h2 className="font-display-lg text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white leading-tight">
                Your Stress Score: {calculatedScore}%
              </h2>
              
              <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border ${catTheme.bg} ${catTheme.text} ${catTheme.border}`}>
                <Smile className="w-4 h-4" />
                <span>Category: {scoreCategory} Stress</span>
              </div>

              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                Your score reflects answers combined from your 20 stress categories, modified by the wellness activities completed and emotional analysis today.
              </p>
            </div>

            {/* Circular Gauge */}
            <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="64"
                  className="stroke-slate-100 dark:stroke-slate-800 fill-none"
                  strokeWidth="10"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="64"
                  className={`fill-none ${catTheme.progress} transition-all duration-1000 ease-out`}
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 64}
                  strokeDashoffset={2 * Math.PI * 64 * (1 - calculatedScore / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-slate-800 dark:text-white">{calculatedScore}%</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">{scoreCategory}</span>
              </div>
            </div>
          </div>

          {/* Emergency Card if Stress score is extremely high (above 80%) */}
          {calculatedScore >= 80 && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 p-5 rounded-2xl flex items-start gap-3.5">
              <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <h4 className="font-bold text-red-800 dark:text-red-200 text-sm md:text-base">Support is Available</h4>
                <p className="text-xs md:text-sm text-red-700 dark:text-red-300 leading-relaxed">
                  Your responses suggest you may be experiencing significant stress. Consider reaching out to someone you trust or speaking with a qualified healthcare or mental health professional if you are finding it difficult to cope.
                </p>
              </div>
            </div>
          )}

          {/* AI Reflections Response Box */}
          <div className="bg-gradient-to-br from-[#A8CFA8]/10 via-white to-indigo-50/30 dark:from-slate-900 dark:to-slate-900/60 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">AI Wellbeing Reflection</h3>
            </div>
            
            <div className="text-xs bg-slate-50/50 dark:bg-slate-800/30 px-3 py-1.5 rounded-lg inline-flex gap-4 border border-slate-100 dark:border-slate-800 text-slate-400">
              <span className="font-medium text-slate-500">Sentiment: <span className="font-bold text-slate-700 dark:text-slate-300">{sentiment}</span></span>
              <span className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
              <span className="font-medium text-slate-500">Detected Tone: <span className="font-bold text-slate-700 dark:text-slate-300">{detectedTone}</span></span>
            </div>

            <p className="text-sm md:text-base text-slate-700 dark:text-slate-200 leading-relaxed italic font-serif">
              "{aiParagraph}"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contributing factors listed out */}
            <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider pb-2 border-b border-slate-50 dark:border-slate-800">
                Highest Triggers This Week
              </h3>
              {contributingFactors.length === 0 ? (
                <p className="text-xs text-slate-400 leading-normal italic py-4">
                  No single category scored above Often. Your stress levels are well balanced!
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {contributingFactors.map((factor, i) => (
                    <span 
                      key={i} 
                      className="px-3 py-1 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 text-xs font-semibold rounded-full"
                    >
                      ⚠️ {factor}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Dynamic Recommendations */}
            <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider pb-2 border-b border-slate-50 dark:border-slate-800">
                Personalized Recommendations
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {DYNAMIC_RECOMMENDATIONS[scoreCategory].map((rec, i) => (
                  <li key={i} className="flex gap-2 items-start">
                    <Check className="w-4 h-4 text-[#2E7D32] dark:text-emerald-400 mt-0.5 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Interactive Checklist: "What helped you feel better today?" */}
          <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 md:p-8 shadow-sm space-y-6 text-left">
            <div className="space-y-1">
              <h3 className="font-headline-md text-base md:text-lg font-bold">What's helping me?</h3>
              <p className="text-xs text-slate-400">
                Tag the physical or mental factors that positively impacted your mood or energy level recently. We store this locally to find supportive insights!
              </p>
            </div>

            {/* Chips selector */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Good Sleep', emoji: '😴' },
                { label: 'Healthy Diet', emoji: '🥗' },
                { label: 'Socializing', emoji: '💬' },
                { label: 'Productivity', emoji: '✅' },
                { label: 'Nature', emoji: '🌲' },
                { label: 'Quiet Time', emoji: '🤫' }
              ].map((factor) => {
                const isSelected = helpfulFactors.includes(factor.label);
                return (
                  <button
                    key={factor.label}
                    onClick={() => {
                      if (helpfulFactors.includes(factor.label)) {
                        setHelpfulFactors(helpfulFactors.filter(f => f !== factor.label));
                      } else {
                        setHelpfulFactors([...helpfulFactors, factor.label]);
                      }
                    }}
                    className={`px-4 py-2 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-300'
                        : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-800/30 dark:border-slate-800 dark:hover:bg-slate-800/50 dark:text-slate-300'
                    }`}
                  >
                    <span>{factor.emoji}</span>
                    <span>{factor.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom helpful factors text field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Add Custom Factor</label>
              <input
                type="text"
                value={customHelpful}
                onChange={(e) => setCustomHelpful(e.target.value)}
                placeholder="E.g., Played Chess, finished a work project, drank enough water..."
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/40 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customHelpful.trim()) {
                    setHelpfulFactors([...helpfulFactors, customHelpful.trim()]);
                    setCustomHelpful('');
                  }
                }}
              />
            </div>

            {/* Reflection Notes */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Additional Wellbeing Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write down any additional insights on what worked for you today..."
                className="w-full min-h-[5rem] p-3 text-sm bg-slate-50 dark:bg-slate-800/40 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setStep('home')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                Return to Hub Home
              </button>
              
              <button
                onClick={handleSaveResult}
                disabled={isSaved}
                className={`flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-bold shadow-sm transition-all cursor-pointer ${
                  isSaved 
                    ? 'bg-emerald-100 border border-emerald-300 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900/30 dark:text-emerald-300 pointer-events-none' 
                    : 'bg-[#2E7D32] hover:bg-[#2E7D32]/85 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500'
                }`}
              >
                {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{isSaved ? 'Progress Saved to Device' : 'Save Final Result'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

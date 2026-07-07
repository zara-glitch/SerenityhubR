/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Calendar, History, Trash2, Edit3, Save, 
  Sparkles, MessageSquareHeart, Check, Info, AlertTriangle, AlertCircle, X, CheckSquare, RefreshCw,
  Mic, MicOff
} from 'lucide-react';
import { MOOD_DEFINITIONS } from '../data';
import { JournalEntry, AIReflection } from '../types';

interface JournalProps {
  entries: JournalEntry[];
  onAddEntry: (entry: Omit<JournalEntry, 'id' | 'timestamp'>) => Promise<void>;
  onUpdateEntry: (id: string, entry: Partial<JournalEntry>) => Promise<void>;
  onDeleteEntry: (id: string) => void;
}

export default function Journal({ entries, onAddEntry, onUpdateEntry, onDeleteEntry }: JournalProps) {
  // Navigation / View state: 'list' | 'create' | 'edit'
  const [view, setStepView] = useState<'list' | 'create' | 'edit'>('list');
  
  // Editor state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [charCount, setCharCount] = useState(0);

  // Voice Speech-to-Text state
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          
          if (finalTranscript) {
            setContent(prev => {
              const separator = prev.endsWith(' ') || prev === '' ? '' : ' ';
              const updated = prev + separator + finalTranscript;
              if (updated.length <= 2000) {
                setCharCount(updated.length);
                return updated;
              }
              return prev;
            });
          }
        };

        rec.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        setRecognition(rec);
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      alert("Voice speech recognition is not supported in this browser. Please use Chrome or Safari for speech-to-text conversion.");
      return;
    }
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  // Search/Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');
  
  // Expandable reflection modal/panel state
  const [activeReflection, setActiveReflection] = useState<AIReflection | null>(null);
  const [activeReflectionTitle, setActiveReflectionTitle] = useState('');
  
  // AI status
  const [isGenerating, setIsGenerating] = useState(false);

  // Toast confirmation
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleTextChange = (text: string) => {
    if (text.length <= 2000) {
      setContent(text);
      setCharCount(text.length);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => fFilterTag(t) !== fFilterTag(tag)));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const fFilterTag = (t: string) => t.toLowerCase();

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setSelectedTags([]);
    setCharCount(0);
    setStepView('create');
  };

  const handleOpenEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setTitle(entry.title);
    setContent(entry.content);
    setSelectedTags(entry.moodTags);
    setCharCount(entry.content.length);
    setStepView('edit');
  };

  // Local fallback reflection if server fails or is offline
  const generateFallbackReflection = (titleText: string, bodyText: string, tags: string[]): AIReflection => {
    const cleanText = bodyText.toLowerCase();
    
    // Themes extraction
    const themes: string[] = [];
    if (cleanText.includes('work') || cleanText.includes('job') || cleanText.includes('deadline')) themes.push('Professional Pressure');
    if (cleanText.includes('school') || cleanText.includes('exam') || cleanText.includes('grade')) themes.push('Academic Stress');
    if (cleanText.includes('money') || cleanText.includes('finance') || cleanText.includes('bill')) themes.push('Financial Security');
    if (cleanText.includes('friend') || cleanText.includes('family') || cleanText.includes('relationship')) themes.push('Interpersonal Connection');
    if (cleanText.includes('sleep') || cleanText.includes('tired') || cleanText.includes('exhausted')) themes.push('Physical Fatigue');
    if (themes.length === 0) themes.push('Internal Emotional Processing');

    // Positive observations
    const positiveObs: string[] = [
      "By taking the time to put your thoughts down in writing, you are practicing active self-awareness.",
      "Recognizing your emotions and naming them represents a key step towards healing your nervous system."
    ];
    if (tags.includes('Calm') || tags.includes('Happy')) {
      positiveObs.push("You noted experiences of calm or joy, which serves as a valuable resource to return to.");
    }

    // Suggestions
    const suggestions: string[] = [
      "Practice setting clear boundaries for your downtime today to protect your energy.",
      "Engage in our Guided Breathing exercise for 4 minutes to discharge physical tension."
    ];
    if (cleanText.includes('tired') || cleanText.includes('sleep')) {
      suggestions.push("Prioritize a screen-free wind-down routine 45 minutes before sleep tonight.");
    }

    return {
      summary: `Your reflection on "${titleText || 'Untilted'}" demonstrates an important check-in with yourself. You are actively giving structure to your inner experiences, which helps down-regulate stress levels.`,
      themes,
      positiveObs,
      suggestions
    };
  };

  // Requesting AI Reflection using server endpoint, falling back on client rules
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsGenerating(true);
    let reflection: AIReflection | undefined = undefined;

    // Call API route
    try {
      const res = await fetch('/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          moodTags: selectedTags
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reflection) {
          reflection = data.reflection;
        }
      }
    } catch (err) {
      console.warn("AI Reflection API failed, falling back on offline templates.", err);
    }

    // If API failed, compile fallback
    if (!reflection) {
      reflection = generateFallbackReflection(title.trim(), content.trim(), selectedTags);
    }

    if (view === 'create') {
      await onAddEntry({
        title: title.trim(),
        content: content.trim(),
        moodTags: selectedTags,
        aiReflection: reflection
      });
      triggerToast('Journal entry saved with supportive reflection!');
    } else if (editingId) {
      await onUpdateEntry(editingId, {
        title: title.trim(),
        content: content.trim(),
        moodTags: selectedTags,
        aiReflection: reflection
      });
      triggerToast('Journal entry updated successfully!');
    }

    setIsGenerating(false);
    setStepView('list');
  };

  const getEntryMoodEmoji = (tag: string) => {
    const found = MOOD_DEFINITIONS.find(m => fFilterTag(m.label) === fFilterTag(tag));
    return found ? found.emoji : '📝';
  };

  // Filtering / Search rules
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = 
      filterTag === 'all' || 
      entry.moodTags.some(t => fFilterTag(t) === fFilterTag(filterTag));

    return matchesSearch && matchesTag;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-800 dark:text-slate-200 py-2">
      
      {/* Toast Confirmation banner */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6 py-3 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Expandable Reflection Overlay Modal */}
      {activeReflection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden text-left flex flex-col max-h-[90dvh]">
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <MessageSquareHeart className="w-5 h-5" />
                <h3 className="font-bold text-sm md:text-base uppercase tracking-wider">AI Support: {activeReflectionTitle}</h3>
              </div>
              <button 
                onClick={() => setActiveReflection(null)}
                className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar text-sm">
              <div className="space-y-1.5">
                <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Empathetic Summary</h4>
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed italic font-serif">
                  "{activeReflection.summary}"
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Core Themes</h4>
                <div className="flex flex-wrap gap-2">
                  {activeReflection.themes.map((theme, i) => (
                    <span 
                      key={i} 
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 font-semibold rounded-full text-xs"
                    >
                      🔍 {theme}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Gentle Observations</h4>
                <ul className="space-y-2 text-slate-650 dark:text-slate-350 leading-relaxed">
                  {activeReflection.positiveObs.map((obs, i) => (
                    <li key={i} className="flex gap-2 items-start">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{obs}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 pb-2">
                <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Supportive Steps</h4>
                <ul className="space-y-2 text-slate-650 dark:text-slate-350 leading-relaxed">
                  {activeReflection.suggestions.map((sug, i) => (
                    <li key={i} className="flex gap-2 items-start">
                      <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl p-3 flex gap-2 text-left">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <p className="text-[10px] text-amber-800 dark:text-amber-200 leading-normal">
                  <span className="font-semibold">Medical Note:</span> AI reflections are generated safely based on your journal texts to aid personal reflection. They should not be considered medical diagnostics, predictions of clinical mental health states, or a substitute for qualified therapy.
                </p>
              </div>
            </div>
            
            <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end shrink-0">
              <button
                onClick={() => setActiveReflection(null)}
                className="bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 text-white font-semibold text-xs px-6 py-2 rounded-full cursor-pointer transition-all"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEWS SWITCH PANEL */}

      {/* A. JOURNAL LIST VIEW */}
      {view === 'list' && (
        <div className="space-y-6 animate-fade-in text-left">
          
          {/* Header row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div className="space-y-1">
              <h2 className="font-headline-lg text-lg md:text-xl font-bold text-slate-800 dark:text-white">Private Journal</h2>
              <p className="text-xs text-slate-400">Pour your thoughts onto paper. A private outlet to reflect, inspect, and discharge mental load.</p>
            </div>

            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold rounded-full px-5 py-2.5 text-xs shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Journal Entry</span>
            </button>
          </div>

          {/* Search and Filters row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white dark:bg-slate-900 p-4 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-xl">
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search entries by keywords or text..."
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/40 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            
            <div className="sm:col-span-4">
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/40 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 font-medium focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">📁 All Emotional Tags</option>
                {MOOD_DEFINITIONS.map(m => (
                  <option key={m.type} value={m.label}>{m.emoji} {m.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Entries list grid */}
          {filteredEntries.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-12 text-center text-slate-400 space-y-3">
              <History className="w-10 h-10 opacity-45 mx-auto" />
              <p className="text-xs italic max-w-sm mx-auto">
                No matching journal entries found. Begin writing to create a chronological log of your emotional sanctuary.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEntries.map((entry) => (
                <div 
                  key={entry.id}
                  className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-5 hover:translate-y-[-2px] hover:shadow-md transition-all duration-250 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(entry)}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                          aria-label="Edit entry"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteEntry(entry.id)}
                          className="p-1 rounded hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 text-slate-350 cursor-pointer"
                          aria-label="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-sm md:text-base text-slate-800 dark:text-white leading-tight">
                        {entry.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-4 leading-relaxed font-sans">
                        {entry.content}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-50 dark:border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 min-w-0">
                      {entry.moodTags.slice(0, 3).map((tag, i) => (
                        <span 
                          key={i} 
                          className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-[10px] rounded font-medium flex items-center gap-1 whitespace-nowrap"
                        >
                          <span>{getEntryMoodEmoji(tag)}</span>
                          <span>{tag}</span>
                        </span>
                      ))}
                    </div>

                    {/* AI Reflection check button */}
                    {entry.aiReflection && (
                      <button
                        onClick={() => {
                          setActiveReflection(entry.aiReflection || null);
                          setActiveReflectionTitle(entry.title);
                        }}
                        className="text-[10px] font-bold text-purple-700 hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-200 flex items-center gap-1 whitespace-nowrap shrink-0 hover:underline group"
                      >
                        <Sparkles className="w-3 h-3 group-hover:animate-pulse" />
                        <span>Inspect AI Reflection</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* B. JOURNAL CREATE & EDIT VIEW */}
      {(view === 'create' || view === 'edit') && (
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 md:p-8 shadow-sm space-y-6 text-left animate-fade-in">
          
          <div className="space-y-1">
            <h2 className="font-headline-lg text-lg md:text-xl font-bold text-slate-800 dark:text-white">
              {view === 'create' ? 'Record a New Thought' : 'Edit Your Reflection'}
            </h2>
            <p className="text-xs text-slate-400">Give expression to what is in your mind. Writing organizes cognitive load and reduces stress.</p>
          </div>

          <div className="space-y-4">
            
            {/* Title field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Thought Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Morning thoughts, work stress reflections..."
                className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-semibold"
                required
              />
            </div>

            {/* Content Field */}
            <div className="space-y-1">
              <div className="flex justify-between items-baseline">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Write Mindfully</label>
                  {recognition && (
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                        isListening 
                          ? 'bg-rose-500 text-white animate-pulse' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-650 dark:bg-slate-800'
                      }`}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-3 h-3" />
                          <span>Listening... (Tap to pause)</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3 h-3 text-rose-500" />
                          <span>Voice Dictate</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">{charCount}/2000 characters</span>
              </div>
              <textarea
                value={content}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="How are you feeling right now? Let it flow without judgment or editing..."
                className="w-full min-h-[16rem] p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm leading-relaxed"
                required
              />
            </div>

            {/* Emotional Tagging */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Associate Emotional Moods</label>
              <div className="flex flex-wrap gap-1.5">
                {MOOD_DEFINITIONS.map((mood) => {
                  const isChecked = selectedTags.includes(mood.label);
                  return (
                    <button
                      key={mood.type}
                      type="button"
                      onClick={() => toggleTag(mood.label)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-300 font-bold'
                          : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-800/30 dark:border-slate-800/80 dark:text-slate-300'
                      }`}
                    >
                      <span>{mood.emoji}</span>
                      <span>{mood.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row justify-between gap-3">
            <button
              type="button"
              onClick={() => setStepView('list')}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isGenerating || !title.trim() || !content.trim()}
              className="flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 text-white font-semibold rounded-full px-6 py-2.5 text-xs shadow-sm active:scale-95 disabled:opacity-45 disabled:pointer-events-none transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI Reflections Processing...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Journal Entry & Analyze</span>
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
}

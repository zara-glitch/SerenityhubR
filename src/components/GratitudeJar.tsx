import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, Search, HelpCircle, Archive, Trash2, Calendar } from 'lucide-react';
import { GratitudeEntry } from '../types';
import { GRATITUDE_PROMPTS } from '../data';

interface GratitudeJarProps {
  gratitudes: GratitudeEntry[];
  onAddGratitude: (text: string) => void;
  onDeleteGratitude: (id: string) => void;
}

export default function GratitudeJar({ gratitudes, onAddGratitude, onDeleteGratitude }: GratitudeJarProps) {
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [randomPrompt, setRandomPrompt] = useState('');
  const [featuredPast, setFeaturedPast] = useState<GratitudeEntry | null>(null);
  const [shakeJar, setShakeJar] = useState(false);

  useEffect(() => {
    // Pick a random prompt on mount
    setRandomPrompt(GRATITUDE_PROMPTS[Math.floor(Math.random() * GRATITUDE_PROMPTS.length)]);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onAddGratitude(inputText.trim());
    setInputText('');
    
    // Show a small shake/success effect on the jar
    setShakeJar(true);
    setTimeout(() => setShakeJar(false), 800);
  };

  const drawRandomMemory = () => {
    if (gratitudes.length === 0) return;
    setShakeJar(true);
    setTimeout(() => {
      setShakeJar(false);
      const randomIndex = Math.floor(Math.random() * gratitudes.length);
      setFeaturedPast(gratitudes[randomIndex]);
    }, 600);
  };

  const filteredGratitudes = gratitudes.filter(item => 
    item.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 py-2 animate-fade-in text-slate-800 dark:text-slate-200 text-left">
      
      {/* Visual Top Bar */}
      <div className="space-y-1">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white">Gratitude Jar</h2>
        <p className="text-xs md:text-sm text-slate-500">
          Cultivate appreciation and joy by saving the micro-moments that brighten your world.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input and Interactive Jar */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Daily Entry Form */}
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-4 h-4" />
              <h3 className="font-bold text-xs uppercase tracking-wider">What are you grateful for today?</h3>
            </div>
            
            <div className="p-4 bg-amber-50/40 dark:bg-amber-950/15 border border-amber-150/40 rounded-xl text-xs italic text-slate-600 dark:text-slate-350 leading-relaxed flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
              <span>Prompt: {randomPrompt}</span>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="I am incredibly grateful for..."
              className="w-full min-h-[6rem] p-3 text-xs bg-slate-50 dark:bg-slate-800/40 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-amber-500"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-45 text-white font-bold text-xs rounded-full shadow-sm cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <Heart className="w-4 h-4 fill-current text-white" />
              <span>Add to Jar</span>
            </button>
          </form>

          {/* Interactive Visual Jar */}
          <div className="bg-gradient-to-br from-amber-50/15 to-transparent dark:from-slate-900 dark:to-slate-900/40 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 text-center space-y-4 flex flex-col items-center justify-center relative overflow-hidden min-h-[16rem]">
            
            {/* Visual Jar Representation */}
            <div 
              onClick={drawRandomMemory}
              className={`relative cursor-pointer transition-all duration-300 transform select-none ${
                shakeJar ? 'animate-bounce rotate-3 scale-110' : 'hover:scale-105 active:scale-95'
              }`}
            >
              {/* Glass Jar Outer Outline */}
              <div className="w-24 h-36 border-4 border-slate-300 dark:border-slate-600 rounded-[2rem] bg-white/40 dark:bg-slate-800/20 shadow-inner flex flex-col items-center justify-between py-4 relative">
                {/* Lid */}
                <div className="absolute top-[-8px] w-14 h-4 bg-amber-700/80 rounded-t-lg border border-amber-800" />
                {/* Ribbon */}
                <div className="absolute top-[8px] w-24 h-1.5 bg-rose-400" />
                <div className="absolute top-[8px] right-[10px] w-3 h-3 bg-rose-400 rounded-full" />
                
                {/* Label on Jar */}
                <div className="px-2 py-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/50 rounded shadow-xs text-[8px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-widest z-10">
                  Gratitude
                </div>

                {/* Little stars representing entries */}
                {gratitudes.length > 0 && (
                  <div className="absolute inset-x-3 bottom-3 flex flex-wrap gap-1 items-end justify-center h-16">
                    {gratitudes.slice(0, 15).map((_, i) => (
                      <div 
                        key={i} 
                        className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-amber-300 to-yellow-500 animate-pulse shadow-sm"
                        style={{ animationDelay: `${i * 120}ms` }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-bold block mt-2">Tap Jar to draw a memory</span>
            </div>

            {/* Past Memory Drawer Display */}
            {featuredPast ? (
              <div className="w-full bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/40 p-4 rounded-xl space-y-2 animate-fade-in relative">
                <button
                  onClick={() => setFeaturedPast(null)}
                  className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest">
                  <Archive className="w-3 h-3" />
                  <span>A Moment of Joy</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                  "{featuredPast.text}"
                </p>
                <div className="text-[9px] text-slate-400 font-bold">
                  {new Date(featuredPast.timestamp).toLocaleDateString()}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">
                {gratitudes.length === 0 
                  ? "Your jar is currently empty. Drop your first happy note in!" 
                  : `Currently housing ${gratitudes.length} happy moment${gratitudes.length === 1 ? '' : 's'}`}
              </p>
            )}

          </div>

        </div>

        {/* Right Column: History List */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Search Header */}
          <div className="grid grid-cols-1 gap-3 bg-white dark:bg-slate-900 p-4 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-xl">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search past gratitudes..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/40 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* List display */}
          <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 max-h-[30rem] overflow-y-auto space-y-4 custom-scrollbar">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-50 dark:border-slate-800">
              Gratitude Logs ({filteredGratitudes.length})
            </h4>

            {filteredGratitudes.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <Archive className="w-8 h-8 opacity-40 mx-auto" />
                <p className="text-xs italic">No memories match your query. Pour your heart out!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredGratitudes.map((item) => (
                  <div 
                    key={item.id}
                    className="p-4 rounded-xl border border-amber-100/40 bg-amber-50/10 hover:bg-amber-50/25 dark:border-slate-800 dark:hover:bg-slate-850 flex justify-between items-start gap-4 transition-colors"
                  >
                    <div className="space-y-1.5 flex-1">
                      <p className="text-xs text-slate-750 dark:text-slate-350 leading-relaxed font-sans font-medium">
                        "{item.text}"
                      </p>
                      <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteGratitude(item.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 text-slate-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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

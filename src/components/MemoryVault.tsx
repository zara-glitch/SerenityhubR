import React, { useState } from 'react';
import { 
  Heart, Sparkles, Image as ImageIcon, Award, Quote, Calendar, Trash2, Plus, X, Star, FileText 
} from 'lucide-react';
import { MemoryItem, StressCheckResult } from '../types';

interface MemoryVaultProps {
  memories: MemoryItem[];
  stressResults: StressCheckResult[];
  onAddMemory: (title: string, content: string, imageUrl?: string, type?: 'text' | 'photo' | 'achievement' | 'quote') => void;
  onDeleteMemory: (id: string) => void;
}

export default function MemoryVault({ memories, stressResults, onAddMemory, onDeleteMemory }: MemoryVaultProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'text' | 'photo' | 'achievement' | 'quote'>('text');
  const [imgBase64, setImgBase64] = useState('');

  const isStressHigh = stressResults.length > 0 && 
    (stressResults[0].category === 'High' || stressResults[0].category === 'Severe');

  // Handle local file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && type !== 'photo') return;
    if (type === 'photo' && !imgBase64) return;
    
    onAddMemory(
      title.trim() || (type === 'photo' ? 'Captured Joy' : 'Encouraging Note'),
      content.trim(),
      type === 'photo' ? imgBase64 : undefined,
      type
    );

    // Reset states
    setTitle('');
    setContent('');
    setImgBase64('');
    setType('text');
    setShowAddModal(false);
  };

  const getStyleForType = (mType: string) => {
    switch (mType) {
      case 'photo': return 'bg-white dark:bg-slate-900 border-indigo-200/55';
      case 'achievement': return 'bg-amber-50/30 dark:bg-amber-950/10 border-amber-200/40';
      case 'quote': return 'bg-purple-50/30 dark:bg-purple-950/10 border-purple-200/40';
      default: return 'bg-rose-50/20 dark:bg-rose-950/10 border-rose-200/40';
    }
  };

  return (
    <div className="space-y-8 py-2 animate-fade-in text-slate-800 dark:text-slate-200 text-left">
      
      {/* Visual Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white">Positive Memory Vault</h2>
          <p className="text-xs md:text-sm text-slate-500">
            A safe, comforting space to deposit achievements, special photos, encouraging compliments, and beautiful moments to revisit.
          </p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Deposit Happy Memory</span>
        </button>
      </div>

      {/* Gentle stress-relief prompt if stress levels are high */}
      {isStressHigh && (
        <div className="p-6 bg-gradient-to-r from-rose-500 to-indigo-600 text-white rounded-[2rem] shadow-lg space-y-2 animate-pulse">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 shrink-0 text-rose-300 animate-pulse fill-current" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider">A Gentle Note from your AI Coach</h3>
          </div>
          <p className="text-xs text-rose-50 leading-relaxed">
            Your latest stress check indicates you are holding a high cognitive load today. We warmly encourage you to sit back, breathe slowly, and look through your beautiful memory deposits below to ground and console your thoughts.
          </p>
        </div>
      )}

      {/* Grid Scrapbook Display */}
      {memories.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2.5rem] p-16 text-center text-slate-400 space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 fill-current" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 dark:text-slate-250">Your Vault is ready to hold Joy</h3>
            <p className="text-xs text-slate-500">
              Deposit encouraging emails, warm messages from friends, proud achievements, or photos of your travels and favorite cups of tea.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-650 text-xs font-bold rounded-xl cursor-pointer"
          >
            Deposit First Memory
          </button>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
          {memories.map((m) => (
            <div 
              key={m.id}
              className={`break-inside-avoid relative rounded-[2rem] border p-5 shadow-xs flex flex-col justify-between group transition-all duration-250 hover:-translate-y-1 hover:shadow-md ${getStyleForType(m.type)}`}
            >
              
              {/* Delete trigger */}
              <button
                onClick={() => onDeleteMemory(m.id)}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/80 dark:bg-slate-850 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:scale-105 transition-all cursor-pointer z-20 shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Tag header */}
              <div className="flex items-center gap-1.5 mb-3 text-slate-400 text-[9px] uppercase font-black tracking-widest">
                {m.type === 'photo' && <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />}
                {m.type === 'achievement' && <Award className="w-3.5 h-3.5 text-amber-500" />}
                {m.type === 'quote' && <Quote className="w-3.5 h-3.5 text-purple-500" />}
                {m.type === 'text' && <FileText className="w-3.5 h-3.5 text-rose-500" />}
                <span>{m.type}</span>
              </div>

              {/* Memory content */}
              <div className="space-y-2.5 flex-1 mb-2">
                <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-current shrink-0" />
                  <span>{m.title}</span>
                </h4>

                {m.type === 'photo' && m.imageUrl && (
                  <div className="rounded-xl overflow-hidden border">
                    <img 
                      src={m.imageUrl} 
                      alt={m.title} 
                      className="w-full h-auto object-cover max-h-52"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {m.content && (
                  <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-sans font-medium italic">
                    "{m.content}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 text-[8px] text-slate-400 font-bold mt-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(m.timestamp).toLocaleDateString()}</span>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Deposit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 w-full max-w-md rounded-[2.5rem] p-6 shadow-2xl space-y-4">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-slate-800/80">
              <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-1.5 text-rose-600">
                <Heart className="w-4 h-4 fill-current" />
                <span>Deposit Joy</span>
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selector */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs select-none">
              {[
                { id: 'text', label: 'Encouragement', icon: FileText },
                { id: 'achievement', label: 'Achievement', icon: Award },
                { id: 'quote', label: 'Quote', icon: Quote },
                { id: 'photo', label: 'Photo', icon: ImageIcon }
              ].map(t => {
                const Icon = t.icon;
                const isSelected = type === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setType(t.id as any)}
                    className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer font-bold transition-all ${
                      isSelected 
                        ? 'border-rose-500 bg-rose-50/20 text-rose-700 dark:border-rose-450'
                        : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-[10px]">{t.label}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">Memory Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g. Sweet note from Mom"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 rounded-xl focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {type === 'photo' ? (
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">Upload Happy Photo</label>
                  <div className="p-4 border-2 border-dashed border-slate-250 dark:border-slate-800 rounded-xl text-center space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="memory-file-upload"
                    />
                    <label 
                      htmlFor="memory-file-upload"
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-250 cursor-pointer inline-block font-bold"
                    >
                      Select Local Photo
                    </label>
                    <p className="text-[10px] text-slate-400">Supported: JPG, PNG. Retained 100% locally on device.</p>
                    {imgBase64 && (
                      <div className="pt-2">
                        <img 
                          src={imgBase64} 
                          alt="Preview" 
                          className="w-24 h-16 object-cover rounded-lg mx-auto border"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {type !== 'photo' || imgBase64 ? (
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">
                    {type === 'achievement' ? "Describe the Achievement" : type === 'quote' ? "Quote Text" : "What is the memory or encouraging comment?"}
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Pour out the happy details..."
                    className="w-full min-h-[5rem] p-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 rounded-xl focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              ) : null}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-650 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={type === 'photo' ? !imgBase64 : !content.trim()}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl cursor-pointer font-bold disabled:opacity-45"
                >
                  Deposit Joy
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

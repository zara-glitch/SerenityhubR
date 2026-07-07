import React, { useState } from 'react';
import { 
  Sparkles, Camera, Quote, Target, FileText, Trash2, Plus, X, Heart 
} from 'lucide-react';
import { VisionBoardItem } from '../types';

interface VisionBoardProps {
  items: VisionBoardItem[];
  onAddItem: (type: 'image' | 'quote' | 'goal' | 'note', content: string, title?: string) => void;
  onDeleteItem: (id: string) => void;
}

export default function VisionBoard({ items, onAddItem, onDeleteItem }: VisionBoardProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'image' | 'quote' | 'goal' | 'note'>('goal');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [imgBase64, setImgBase64] = useState('');

  // Handle local image upload to base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (selectedType === 'image') {
      if (!imgBase64) return;
      onAddItem('image', imgBase64, title || 'Dream Visual');
    } else {
      if (!content.trim()) return;
      onAddItem(selectedType, content.trim(), title.trim() || undefined);
    }
    
    // Reset states
    setContent('');
    setTitle('');
    setImgBase64('');
    setShowAddModal(false);
  };

  const getIconForType = (type: 'image' | 'quote' | 'goal' | 'note') => {
    switch (type) {
      case 'image': return <Camera className="w-4 h-4" />;
      case 'quote': return <Quote className="w-4 h-4" />;
      case 'goal': return <Target className="w-4 h-4" />;
      case 'note': return <FileText className="w-4 h-4" />;
    }
  };

  const getStyleForType = (type: 'image' | 'quote' | 'goal' | 'note') => {
    switch (type) {
      case 'image': return 'bg-white dark:bg-slate-900 border-indigo-200/50';
      case 'quote': return 'bg-purple-50/40 dark:bg-purple-950/10 border-purple-200/40';
      case 'goal': return 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200/40';
      case 'note': return 'bg-amber-50/40 dark:bg-amber-950/10 border-amber-200/40';
    }
  };

  return (
    <div className="space-y-8 py-2 animate-fade-in text-slate-800 dark:text-slate-200 text-left">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white">Vision Board</h2>
          <p className="text-xs md:text-sm text-slate-500">
            Envision your desires, dream goals, motivational slogans, and future aspirations.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-[#2E7D32] hover:bg-[#1E5C22] text-white rounded-full text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vision Card</span>
        </button>
      </div>

      {/* Grid displays */}
      {items.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2.5rem] p-16 text-center text-slate-400 space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 bg-[#A8CFA8]/15 text-[#2E7D32] rounded-full flex items-center justify-center mx-auto">
            <Target className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 dark:text-slate-250">Your Visual Board is currently a Blank Slate</h3>
            <p className="text-xs text-slate-500">
              Populate this sandbox with aspirations, motivating quotes, dreams, and local photographs to manifest your wellbeing journey.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2 bg-emerald-100 hover:bg-emerald-250 dark:bg-emerald-950/40 text-[#2E7D32] text-xs font-bold rounded-xl cursor-pointer"
          >
            Create Your First Card
          </button>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
          {items.map((item) => (
            <div 
              key={item.id}
              className={`break-inside-avoid relative rounded-[2rem] border p-5 shadow-xs flex flex-col justify-between group transition-all duration-250 hover:-translate-y-1 hover:shadow-md ${getStyleForType(item.type)}`}
            >
              {/* Delete trigger */}
              <button
                onClick={() => onDeleteItem(item.id)}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/80 dark:bg-slate-850 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:scale-105 transition-all cursor-pointer z-20 shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Type tag indicator */}
              <div className="flex items-center gap-1.5 mb-3 text-slate-400 dark:text-slate-500 text-[9px] uppercase font-bold tracking-widest">
                {getIconForType(item.type)}
                <span>{item.type}</span>
              </div>

              {/* Card Contents */}
              <div className="space-y-3 flex-1 mb-2">
                {item.title && (
                  <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                    {item.title}
                  </h4>
                )}

                {item.type === 'image' ? (
                  <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-slate-850">
                    <img 
                      src={item.content} 
                      alt={item.title || 'Inspirational'} 
                      className="w-full h-auto object-cover max-h-60"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : item.type === 'quote' ? (
                  <div className="text-center font-sans font-medium italic text-slate-800 dark:text-slate-100 text-sm leading-relaxed">
                    “{item.content}”
                  </div>
                ) : item.type === 'goal' ? (
                  <div className="flex gap-2 items-start text-xs font-bold text-emerald-850 dark:text-emerald-350">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0 mt-1.5" />
                    <p className="leading-relaxed font-sans font-semibold">{item.content}</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-sans font-medium">
                    {item.content}
                  </p>
                )}
              </div>

              <div className="text-[8px] text-slate-400 font-bold self-start mt-2">
                {new Date(item.timestamp).toLocaleDateString()}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Adding Modal Overlays */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 w-full max-w-md rounded-[2.5rem] p-6 shadow-2xl space-y-4">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-slate-800/80">
              <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#2E7D32]" />
                <span>New Vision Card</span>
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Type selector */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs select-none">
              {[
                { id: 'goal', label: 'Goal', icon: Target },
                { id: 'quote', label: 'Quote', icon: Quote },
                { id: 'image', label: 'Image', icon: Camera },
                { id: 'note', label: 'Note', icon: FileText }
              ].map(t => {
                const Icon = t.icon;
                const isSelected = selectedType === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedType(t.id as any)}
                    className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer font-medium transition-all ${
                      isSelected 
                        ? 'border-emerald-600 bg-emerald-50/30 text-emerald-800 font-bold dark:border-emerald-500'
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
              {/* Optional title */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">Card Title (Optional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={selectedType === 'image' ? "E.g. Peace of Mind" : "E.g. Professional Milestone"}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 rounded-xl focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {selectedType === 'image' ? (
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">Local Image File</label>
                  <div className="p-4 border-2 border-dashed border-slate-250 dark:border-slate-800 rounded-xl text-center space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="vision-file-upload"
                    />
                    <label 
                      htmlFor="vision-file-upload"
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-250 cursor-pointer inline-block font-semibold"
                    >
                      Choose Local Image
                    </label>
                    <p className="text-[10px] text-slate-400">Supported types: JPG, PNG. Image data remains 100% private in local storage.</p>
                    
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
              ) : (
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500">
                    {selectedType === 'quote' ? "Quote Text" : selectedType === 'goal' ? "Goal/Dream Slogan" : "Personal Note"}
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={
                      selectedType === 'quote' ? "Write a slogan that inspires you..." :
                      selectedType === 'goal' ? "What is your main wellness goal..." :
                      "Write down any motivational thoughts, dreams..."
                    }
                    className="w-full min-h-[5rem] p-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 rounded-xl focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl cursor-pointer hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedType === 'image' ? !imgBase64 : !content.trim()}
                  className="px-5 py-2 bg-[#2E7D32] hover:bg-[#1E5C22] text-white rounded-xl cursor-pointer font-bold disabled:opacity-45"
                >
                  Save Vision
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

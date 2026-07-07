import React, { useState, useEffect } from 'react';
import { Award, CheckCircle, Smile, HelpCircle, RefreshCw } from 'lucide-react';

interface SelfCareBingoProps {
  bingoState: boolean[];
  onToggleCell: (index: number) => void;
  onResetBingo: () => void;
}

export const BINGO_ACTIVITIES = [
  "Drink 8 glasses of water", "Stretch for 5 minutes", "Read for 10 minutes", "Call or text a friend", "Spend 15 mins outdoors",
  "Write down 3 gratitudes", "Do a 5-min journal entry", "Sleep before 11 PM", "Exercise for 20 minutes", "Meditate for 5 minutes",
  "Practice Box Breathing", "Eat a healthy fresh meal", "Organize your study desk", "Unplug for 1 hour completely", "Full body relaxation",
  "Give someone a compliment", "Listen to calm piano music", "Do a stress check", "Watch the clouds or birds", "Sing a favorite song",
  "Smile in the mirror", "Take a warm relaxing shower", "Sketch or doodle something", "Drink a warm herbal tea", "Forgive yourself for a mistake"
];

export default function SelfCareBingo({ bingoState, onToggleCell, onResetBingo }: SelfCareBingoProps) {
  const [completedRows, setCompletedRows] = useState<number[]>([]);
  const [completedCols, setCompletedCols] = useState<number[]>([]);
  const [hasDiagonal1, setHasDiagonal1] = useState(false);
  const [hasDiagonal2, setHasDiagonal2] = useState(false);

  // Check for bingo row/column completions
  useEffect(() => {
    const rows = [];
    const cols = [];

    // Check Rows (5x5)
    for (let r = 0; r < 5; r++) {
      let rowAllTrue = true;
      for (let c = 0; c < 5; c++) {
        if (!bingoState[r * 5 + c]) rowAllTrue = false;
      }
      if (rowAllTrue) rows.push(r);
    }

    // Check Cols
    for (let c = 0; c < 5; c++) {
      let colAllTrue = true;
      for (let r = 0; r < 5; r++) {
        if (!bingoState[r * 5 + c]) colAllTrue = false;
      }
      if (colAllTrue) cols.push(c);
    }

    // Check Diagonals
    let d1AllTrue = true;
    for (let i = 0; i < 5; i++) {
      if (!bingoState[i * 5 + i]) d1AllTrue = false;
    }

    let d2AllTrue = true;
    for (let i = 0; i < 5; i++) {
      if (!bingoState[i * 5 + (4 - i)]) d2AllTrue = false;
    }

    setCompletedRows(rows);
    setCompletedCols(cols);
    setHasDiagonal1(d1AllTrue);
    setHasDiagonal2(d2AllTrue);
  }, [bingoState]);

  const totalBingos = completedRows.length + completedCols.length + (hasDiagonal1 ? 1 : 0) + (hasDiagonal2 ? 1 : 0);

  return (
    <div className="space-y-8 py-2 animate-fade-in text-slate-800 dark:text-slate-200 text-left">
      
      {/* Visual Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white">Self-Care Bingo</h2>
          <p className="text-xs md:text-sm text-slate-500">
            Play your daily wellbeing bingo! Complete positive activities, click cells to mark them, and complete lines to unlock rewards.
          </p>
        </div>
        
        <button
          onClick={onResetBingo}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-250 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Board</span>
        </button>
      </div>

      {/* Reward Indicator if rows completed */}
      {totalBingos > 0 && (
        <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-[2rem] shadow-md space-y-2 animate-bounce">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 shrink-0" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider">🎉 Bingo Achieved!</h3>
          </div>
          <p className="text-xs text-emerald-50 font-medium">
            Outstanding! You have completed {totalBingos} line{totalBingos === 1 ? '' : 's'} on your self-care bingo board! You've unlocked the **Consistency Champion** and **Wellness Explorer** mental badges! Keep up these fantastic habits.
          </p>
        </div>
      )}

      {/* Main Grid & Information */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: 5x5 Grid */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2.5rem] p-6 shadow-sm select-none">
            
            <div className="grid grid-cols-5 gap-3">
              {BINGO_ACTIVITIES.map((act, index) => {
                const isChecked = bingoState[index];
                
                // Determine if this cell is part of a completed row, column or diagonal
                const row = Math.floor(index / 5);
                const col = index % 5;
                const isPartCompleted = 
                  completedRows.includes(row) || 
                  completedCols.includes(col) || 
                  (hasDiagonal1 && row === col) || 
                  (hasDiagonal2 && row === (4 - col));

                return (
                  <button
                    key={index}
                    onClick={() => onToggleCell(index)}
                    className={`aspect-square p-2 rounded-xl text-[9px] md:text-xs leading-snug font-bold border flex flex-col justify-between items-center text-center cursor-pointer transition-all ${
                      isChecked 
                        ? isPartCompleted
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-600 shadow-md scale-102'
                          : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-100 dark:bg-slate-850 dark:border-slate-800/80 hover:scale-101'
                    }`}
                  >
                    <span className="flex-grow flex items-center justify-center font-medium font-sans">
                      {act}
                    </span>
                    {isChecked ? (
                      <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-1 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <div className="w-3.5 h-3.5 border border-slate-200 dark:border-slate-750 rounded-full shrink-0 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>

          </div>
        </div>

        {/* Right Column: Rules & Current Status */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Progress */}
          <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm text-center space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Board Progress</h3>
            
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center border-4 border-slate-100 dark:border-slate-800 rounded-full bg-slate-50/50 dark:bg-slate-950/20">
              <div className="text-center select-none">
                <span className="text-2xl font-black text-[#2E7D32]">
                  {bingoState.filter(Boolean).length}
                </span>
                <span className="text-slate-400 text-xs font-bold"> / 25</span>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black block mt-0.5">Checked</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-bold text-left text-slate-500 pt-2">
              <div className="space-y-1">
                <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Lines Complete</span>
                <span className="text-sm font-black text-emerald-600">{totalBingos} Lines</span>
              </div>
              <div className="space-y-1">
                <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Bonus Badges</span>
                <span className="text-sm font-black text-purple-600">{totalBingos > 0 ? 'Unlocked' : '0 unlocked'}</span>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm text-left space-y-3">
            <div className="flex items-center gap-1.5 text-slate-400">
              <HelpCircle className="w-4 h-4" />
              <h4 className="font-bold text-xs uppercase tracking-wider">How to Play</h4>
            </div>
            
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <p>1. Check off a self-care task as you complete it during the day.</p>
              <p>2. Form a complete horizontal, vertical or diagonal line of 5 checks to hit a BINGO.</p>
              <p>3. Every completed row rewards your self-care streak and consistency achievements!</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sun, Moon, Eye, Accessibility, RefreshCw, Type, X } from 'lucide-react';
import { WellnessSettings } from '../types';

interface AccessibilitySettingsProps {
  settings: WellnessSettings;
  onSettingsChange: (settings: WellnessSettings) => void;
  onClose: () => void;
}

export default function AccessibilitySettings({
  settings,
  onSettingsChange,
  onClose
}: AccessibilitySettingsProps) {
  const toggleDarkMode = () => {
    onSettingsChange({ ...settings, darkMode: !settings.darkMode });
  };

  const toggleHighContrast = () => {
    onSettingsChange({ ...settings, highContrast: !settings.highContrast });
  };

  const toggleReducedMotion = () => {
    onSettingsChange({ ...settings, reducedMotion: !settings.reducedMotion });
  };

  const setFontSize = (size: 'sm' | 'md' | 'lg' | 'xl') => {
    onSettingsChange({ ...settings, fontSize: size });
  };

  const resetToDefault = () => {
    onSettingsChange({
      darkMode: false,
      highContrast: false,
      reducedMotion: false,
      fontSize: 'md'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div 
        id="settings-panel"
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden text-slate-800 dark:text-slate-200"
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Accessibility className="w-5 h-5 text-primary" />
            <h2 className="font-headline-md text-base md:text-lg font-bold text-slate-800 dark:text-white">Accessibility & Settings</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Theme selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Visual Theme</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onSettingsChange({ ...settings, darkMode: false })}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border transition-all ${
                  !settings.darkMode
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800 font-medium dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Light Mode</span>
              </button>
              <button
                onClick={() => onSettingsChange({ ...settings, darkMode: true })}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border transition-all ${
                  settings.darkMode
                    ? 'border-purple-600 bg-purple-950/20 text-purple-200 font-medium'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Dark Mode</span>
              </button>
            </div>
          </div>

          {/* Font Size adjustment */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Text Sizing</label>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
              {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    settings.fontSize === size
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <span className={
                    size === 'sm' ? 'text-xs' :
                    size === 'md' ? 'text-sm' :
                    size === 'lg' ? 'text-base font-semibold' : 'text-lg font-bold'
                  }>A</span>
                  <span className="text-[10px] ml-0.5 opacity-60 uppercase">{size}</span>
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            <div className="flex gap-3 items-start text-left">
              <Eye className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">High Contrast Mode</h3>
                <p className="text-xs text-slate-400 leading-normal">Enhances readability by intensifying background-foreground ratios.</p>
              </div>
            </div>
            <button
              onClick={toggleHighContrast}
              className={`w-11 h-6 rounded-full p-1 transition-all ${
                settings.highContrast ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-all ${
                settings.highContrast ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Reduced Motion Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            <div className="flex gap-3 items-start text-left">
              <RefreshCw className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">Reduced Motion Mode</h3>
                <p className="text-xs text-slate-400 leading-normal">Disables fast sliding and scaling transition animations.</p>
              </div>
            </div>
            <button
              onClick={toggleReducedMotion}
              className={`w-11 h-6 rounded-full p-1 transition-all ${
                settings.reducedMotion ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-all ${
                settings.reducedMotion ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/50 flex gap-3">
          <button
            onClick={resetToDefault}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mr-auto"
          >
            Reset to Defaults
          </button>
          <button
            onClick={onClose}
            className="bg-primary text-white hover:bg-emerald-800 px-5 py-2 rounded-xl text-xs font-medium shadow-sm transition-all"
          >
            Apply & Save
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Heart, Info, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import Disclaimer from './Disclaimer';

export default function About() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 text-slate-800 dark:text-slate-200 py-2 text-left animate-fade-in">
      
      {/* Title block */}
      <div className="space-y-3 pb-4 border-b border-[#A8CFA8]/20 dark:border-slate-800/80">
        <h2 className="font-headline-lg text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-4xl text-[#2E7D32] dark:text-emerald-500">spa</span>
          <span>Serenity Hub</span>
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans font-medium">
          "Breathe. Relax. Thrive." — Your private emotional sanctuary and stress companion.
        </p>
      </div>

      {/* Mission block */}
      <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 md:p-8 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-[#2E7D32] dark:text-[#A8CFA8] uppercase tracking-wider pb-2 border-b border-slate-50 dark:border-slate-800 flex items-center gap-1.5">
          <Heart className="w-5 h-5 text-[#2E7D32]" />
          <span>Our Mission</span>
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
          Serenity Hub is built to facilitate mindful self-assessment, reflection, and proactive stress-coping habits. Self-awareness is the ultimate protector of resilience. When we check in regularly and put structures around our emotions, we lower autonomic nervous system arousal, enabling us to make healthy lifestyle adjustments before strain leads to exhaustion.
        </p>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm space-y-3">
          <h4 className="font-bold text-sm flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400">
            <Layers className="w-4 h-4" />
            <span>Interactive Stress Checks</span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Take a 20-category assessment covering sleep quality, time pressure, perfectionism, finances, and relationships. Checklists of daily activities automatically reduce raw strain index scores.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm space-y-3">
          <h4 className="font-bold text-sm flex items-center gap-1.5 text-teal-700 dark:text-teal-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Private Local Storage</span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            All check-ins, journal entries, and trends remain strictly client-side on your device's browser. We use NO servers, NO databases, and NO analytics trackers. Your privacy is structurally guaranteed.
          </p>
        </div>
      </div>

      {/* Strict Privacy Declaration */}
      <div className="bg-gradient-to-br from-[#B8A4D8]/5 via-white to-[#A8CFA8]/10 dark:from-slate-900 dark:to-slate-900/60 border border-[#A8CFA8]/15 dark:border-slate-800 rounded-[2rem] p-6 md:p-8 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider pb-2 border-b border-slate-50 dark:border-slate-850 flex items-center gap-1.5 text-[#2E7D32] dark:text-[#A8CFA8]">
          <ShieldCheck className="w-5 h-5" />
          <span>Strict Privacy Policy</span>
        </h3>
        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans font-medium">
          Serenity Hub is designed around the core principle of extreme data hygiene. 
        </p>
        <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-semibold">
          <li className="flex gap-2 items-start">
            <CheckCircle2 className="w-4 h-4 text-[#2E7D32] dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>NO account creation, email logging, or third-party login flows required.</span>
          </li>
          <li className="flex gap-2 items-start">
            <CheckCircle2 className="w-4 h-4 text-[#2E7D32] dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>NO databases, remote clouds, or backend storage models are used to store emotional history.</span>
          </li>
          <li className="flex gap-2 items-start">
            <CheckCircle2 className="w-4 h-4 text-[#2E7D32] dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>NO cookie tracking or diagnostic telemetry is sent to external advertising networks.</span>
          </li>
        </ul>
      </div>

      {/* Disclaimers block */}
      <Disclaimer />

    </div>
  );
}

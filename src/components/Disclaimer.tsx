/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl p-4 flex gap-3 text-left">
      <AlertTriangle className="text-amber-600 dark:text-amber-400 w-5 h-5 shrink-0 mt-0.5" />
      <div className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed font-sans">
        <span className="font-semibold">Disclaimer:</span> This stress assessment and wellbeing tracking tool is intended for educational, self-awareness, and supportive purposes only. It is <span className="underline">NOT</span> a medical diagnosis or a substitute for professional clinical healthcare, therapy, or diagnosis. If your stress is severe, persistent, or affecting your daily life, please consult a qualified healthcare or mental health professional.
      </div>
    </div>
  );
}

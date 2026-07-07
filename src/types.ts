/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MoodType = 'happy' | 'calm' | 'neutral' | 'tired' | 'stressed' | 'sad' | 'anxious';

export interface MoodEntry {
  id: string;
  timestamp: number;
  mood: MoodType;
  note?: string;
  // Multi-slider values (Feature 24)
  sliders?: {
    stress: number;
    energy: number;
    motivation: number;
    focus: number;
    hopefulness: number;
    happiness: number;
    anxiety: number;
    socialBattery: number;
    confidence: number;
    calmness: number;
  };
}

export interface AIReflection {
  summary: string;
  themes: string[];
  positiveObs: string[];
  suggestions: string[];
}

export interface JournalEntry {
  id: string;
  timestamp: number;
  title: string;
  content: string;
  moodTags: string[];
  aiReflection?: AIReflection;
  isGeneratingReflection?: boolean;
}

export interface StressCheckResult {
  id: string;
  timestamp: number;
  answers: Record<string, number>; // key is question id, value is 1-5
  score: number; // 0-100%
  category: 'Very Low' | 'Mild' | 'Moderate' | 'High' | 'Severe';
  openReflection?: string;
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
  tone?: string;
  completedActivities: string[];
  customActivity?: string;
  helpfulFactors: string[];
  notes?: string;
}

export interface WellnessSettings {
  darkMode: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  theme?: string; // Feature 20: Calm Visual Themes
}

// Feature 12: Gratitude Jar
export interface GratitudeEntry {
  id: string;
  timestamp: number;
  text: string;
}

// Feature 13: Vision Board
export interface VisionBoardItem {
  id: string;
  type: 'image' | 'quote' | 'goal' | 'note';
  content: string; // text or local base64 image URL
  title?: string;
  timestamp: number;
}

// Feature 14: Sleep Tracker
export interface SleepEntry {
  id: string;
  timestamp: number;
  bedtime: string; // e.g., "22:30"
  wakeTime: string; // e.g., "06:30"
  duration: number; // in hours
  quality: number; // 1 to 5
}

// Feature 15: Screen Time Tracker
export interface ScreenTimeEntry {
  id: string;
  timestamp: number;
  hours: number;
}

// Feature 25: Positive Memory Vault
export interface MemoryItem {
  id: string;
  title: string;
  content: string;
  imageUrl?: string; // base64 locally stored
  timestamp: number;
  type: 'text' | 'photo' | 'achievement' | 'quote';
}

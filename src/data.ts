/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MoodType } from './types';

export interface Question {
  id: string;
  text: string;
  category: string;
}

export const STRESS_QUESTIONS: Question[] = [
  { id: 'sleep', text: 'How has your sleep quality been recently? Do you have trouble falling or staying asleep?', category: 'Sleep Quality' },
  { id: 'school', text: 'How often do you feel overwhelmed by schoolwork or academic performance expectations?', category: 'School Pressure' },
  { id: 'work', text: 'How often do you feel excessive pressure or stress related to your work responsibilities?', category: 'Work Pressure' },
  { id: 'financial', text: 'How frequently do you worry about financial security, bills, or basic expenses?', category: 'Financial Concerns' },
  { id: 'relationship', text: 'How often do you feel tension, conflict, or stress in your family or personal relationships?', category: 'Relationship Stress' },
  { id: 'fatigue', text: 'How often do you feel physically exhausted, tired, or depleted even after resting?', category: 'Physical Fatigue' },
  { id: 'anxiety', text: 'How often do you feel nervous, anxious, jittery, or on edge?', category: 'Anxiety' },
  { id: 'mood', text: 'How frequently do you experience sudden mood changes, irritability, or anger?', category: 'Mood Changes' },
  { id: 'concentration', text: 'How often do you find it difficult to concentrate, stay focused, or make simple decisions?', category: 'Concentration' },
  { id: 'motivation', text: 'How often do you struggle with a lack of motivation, interest, or drive to complete tasks?', category: 'Motivation' },
  { id: 'appetite', text: 'How often do you notice significant changes in your appetite (eating much more or much less) due to stress?', category: 'Appetite Changes' },
  { id: 'life_changes', text: 'How much are recent major life changes (e.g., moving, changing jobs, personal events) affecting your stress levels?', category: 'Recent Life Changes' },
  { id: 'self_care', text: 'How often do you neglect personal self-care (e.g., skin care, grooming, relaxing downtime) due to being busy?', category: 'Self-Care Habits' },
  { id: 'screen_time', text: 'How often do you feel that your social media or screen time habits make you feel restless or dissatisfied?', category: 'Screen Time Habits' },
  { id: 'social_support', text: 'How often do you feel isolated, lonely, or that you lack a strong, supportive social circle?', category: 'Social Support' },
  { id: 'time_management', text: 'How frequently do you struggle with time management or feel there aren\'t enough hours in the day?', category: 'Time Management Difficulties' },
  { id: 'future_worries', text: 'How often do you catch yourself excessively worrying or feeling anxious about the future?', category: 'Future Worries' },
  { id: 'perfectionism', text: 'How often does perfectionism or a fear of making mistakes hold you back or cause you stress?', category: 'Perfectionism' },
  { id: 'overwhelmed', text: 'How frequently do you feel general emotional overwhelm, as if things are piling up too high?', category: 'Feeling Overwhelmed' },
  { id: 'work_life', text: 'How often do you feel that your work/school life is unbalanced and taking over your personal time?', category: 'Work-Life Balance' },
];

export const WELLNESS_TIPS = [
  "Take a short walk outdoors. Let the air refresh your mind and look at the natural colors around you.",
  "Drink more water today. Hydration plays a key role in physiological stress regulation and cognitive function.",
  "Stretch for two minutes. Roll your shoulders back, stretch your arms overhead, and release physical tension.",
  "Practice gratitude. Write down three specific things that brought you a smile or comfort recently.",
  "Reach out to someone you trust. Send a brief text to check in or share a small thought with a friend.",
  "Take five deep slow breaths right now. Make your exhalations longer than your inhalations.",
  "Unplug for 15 minutes. Put your phone in another room and focus fully on your immediate physical environment.",
  "Enjoy a warm beverage mindfully. Feel the warmth of the mug and pay attention to each sip."
];

export const MOTIVATIONAL_QUOTES = [
  { text: "Progress is still progress, no matter how small.", author: "Unknown" },
  { text: "You have survived every difficult day so far.", author: "Unknown" },
  { text: "Rest is productive too.", author: "Unknown" },
  { text: "Peace begins with one mindful breath.", author: "Unknown" },
  { text: "Within you, there is a stillness and a sanctuary to which you can retreat at any time.", author: "Hermann Hesse" },
  { text: "Do not let the behavior of others destroy your inner peace.", author: "Dalai Lama" },
  { text: "Quiet the mind and the soul will speak.", author: "Ma Jaya Sati Bhagavati" },
  { text: "Breathe. Let go. And remind yourself that this very moment is the only one you know you have for sure.", author: "Oprah Winfrey" }
];

export const HEALTHY_ACTIVITIES = [
  { id: 'exercise', label: 'Exercise', icon: 'activity' },
  { id: 'walking', label: 'Walking', icon: 'footprints' },
  { id: 'meditation', label: 'Meditation', icon: 'flower' },
  { id: 'deep_breathing', label: 'Deep Breathing', icon: 'wind' },
  { id: 'prayer', label: 'Prayer or Spiritual Practice', icon: 'sparkles' },
  { id: 'reading', label: 'Reading', icon: 'book-open' },
  { id: 'music', label: 'Listening to Music', icon: 'music' },
  { id: 'family', label: 'Spending Time with Family', icon: 'users' },
  { id: 'friend', label: 'Talking with a Friend', icon: 'phone-call' },
  { id: 'journaling', label: 'Journaling', icon: 'pen-tool' },
  { id: 'hobbies', label: 'Creative Hobbies', icon: 'palette' },
  { id: 'healthy_eating', label: 'Healthy Eating', icon: 'apple' },
  { id: 'drinking_water', label: 'Drinking Enough Water', icon: 'droplet' },
  { id: 'good_sleep', label: 'Good Sleep', icon: 'moon' },
  { id: 'outdoors', label: 'Time Outdoors', icon: 'trees' },
  { id: 'stretching', label: 'Stretching', icon: 'body' },
  { id: 'volunteering', label: 'Volunteering', icon: 'heart' }
];

export const FUN_ACTIVITIES = [
  { id: 'block_blast', label: 'Block Blast' },
  { id: 'chess', label: 'Chess' },
  { id: 'sudoku', label: 'Sudoku' },
  { id: 'word_games', label: 'Word Games' },
  { id: 'puzzle_games', label: 'Puzzle Games' },
  { id: 'board_games', label: 'Board Games' },
  { id: 'watching_show', label: 'Watching a Favorite Show' },
  { id: 'drawing', label: 'Drawing' },
  { id: 'coloring', label: 'Coloring' },
  { id: 'photography', label: 'Photography' }
];

export const MOOD_DEFINITIONS: { type: MoodType; label: string; emoji: string; color: string; bg: string }[] = [
  { type: 'happy', label: 'Happy', emoji: '😊', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
  { type: 'calm', label: 'Calm', emoji: '😌', color: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
  { type: 'neutral', label: 'Neutral', emoji: '😐', color: 'text-slate-700 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800/30' },
  { type: 'tired', label: 'Tired', emoji: '😴', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20' },
  { type: 'stressed', label: 'Stressed', emoji: '😣', color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/20' },
  { type: 'sad', label: 'Sad', emoji: '😔', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/20' },
  { type: 'anxious', label: 'Anxious', emoji: '😰', color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/20' },
];

export const AFFIRMATIONS = [
  "You are doing your best, and that is enough.",
  "In this moment, I choose peace over worry.",
  "I am allowed to rest, recharge, and take my time.",
  "My feelings are valid, and I am learning how to navigate them.",
  "I have gotten through hard times before, and I will get through this.",
  "I don't have to carry everything all at once. Just this single step.",
  "I choose to treat myself with kindness and deep gentleness today.",
  "Each breath is a fresh start. I release what I cannot control."
];

export const QUICK_RELIEF_TECHNIQUES = [
  { title: "Box Breathing", desc: "Inhale for 4 seconds, hold for 4, exhale for 6. Repeat 3 times to quickly trigger relaxation." },
  { title: "Physiological Sigh", desc: "Take two quick, consecutive deep breaths through your nose, then let out one long, slow sigh through your mouth." },
  { title: "Progressive Muscle Relaxation", desc: "Squeeze your toes tightly for 5 seconds, then let go completely. Repeat for your calves, thighs, and hands." },
  { title: "Cold Water Reset", desc: "Splash cold water on your face or hold an ice cube in your hand to stimulate the vagus nerve." }
];

export const GRATITUDE_PROMPTS = [
  "What is one small thing that made you smile today?",
  "Who is someone in your life you appreciate, and why?",
  "What is a simple sensory pleasure you enjoyed recently (a taste, sound, or sight)?",
  "What is a physical ability or health aspect you are grateful for?",
  "What is a personal challenge you overcame that taught you something valuable?"
];

export const DYNAMIC_RECOMMENDATIONS = {
  'Very Low': [
    "You are doing exceptionally well at managing your stress! Maintain your regular routines and continue prioritizing self-care.",
    "Consider sharing your wellness habits with a friend or colleague who might be going through a busy patch.",
    "Keep up your current hydration, movement, and sleep goals to keep your physical reservoir topped up."
  ],
  'Mild': [
    "Your stress levels are low, but slight adjustments can help. Make sure to schedule small breaks throughout your day.",
    "Practice simple mindfulness or deep breathing once a day to stay centered before stress can accumulate.",
    "Spend time on your favorite creative hobby or outdoors this week to keep your emotional batteries fully charged."
  ],
  'Moderate': [
    "Your stress is in the moderate range. Try checking your work-life balance and see if you can delegate or set stronger boundaries.",
    "Prioritize getting 7-8 hours of sleep and regular hydration, as physical factors significantly influence moderate stress.",
    "Utilize our Guided Breathing tool for 3-5 minutes whenever you feel physical tension building up in your shoulders."
  ],
  'High': [
    "You are experiencing significant stress. It is crucial to step back and reduce non-essential commitments.",
    "Reach out to a trusted friend, family member, or colleague to talk about what is feeling heavy. You don't have to carry this alone.",
    "Incorporate a regular relaxation exercise like the 5-4-3-2-1 Grounding method into your daily schedule."
  ],
  'Severe': [
    "Your responses suggest you are experiencing a high degree of stress and potential exhaustion. Please prioritize your immediate well-being.",
    "Focus on basic needs: getting rest, nourishing meals, staying hydrated, and taking slow, deep breaths.",
    "Consider consulting with a qualified healthcare or mental health professional to help you navigate this challenging period.",
    "Kindly remember that rest is productive, and your health comes first."
  ]
};

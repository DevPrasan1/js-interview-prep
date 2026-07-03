export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Frequency = 'Low' | 'Medium' | 'High' | 'Very High';

export interface Question {
  id: number;
  category: string;
  title: string;
  difficulty: Difficulty;
  frequency: Frequency;
  estimatedReadTime: string;
  companies: string[];
  tags: string[];
  description: string;
  bestPractices: string;
  commonMistakes: string;
  example: string;
  interviewTip: string;
  followUpQuestions: string[];
  relatedQuestions: number[];
}

export interface Category {
  id: string; // url slug (e.g. 'html')
  name: string; // e.g. 'HTML'
  description: string;
  icon: string; // Lucide icon name
  colorClass: string; // Tailwind colors
  hoverColorClass: string;
  textGradientClass: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  compactMode: boolean;
  animationsEnabled: boolean;
}

export interface DayProgress {
  date: string; // YYYY-MM-DD
  completedCount: number;
}

export interface UserProgress {
  completedQuestionIds: number[];
  bookmarkedQuestionIds: number[];
  recentlyViewedIds: number[];
  viewHistory: { questionId: number; viewedAt: string }[];
  studyStreak: number;
  lastStudyDate: string | null;
  dailyCompletionHistory: DayProgress[];
}

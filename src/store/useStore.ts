import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserSettings, UserProgress, DayProgress } from '../types';

interface StoreState {
  // Settings State
  theme: UserSettings['theme'];
  fontSize: UserSettings['fontSize'];
  compactMode: boolean;
  animationsEnabled: boolean;
  
  // Progress State
  completedQuestionIds: number[];
  bookmarkedQuestionIds: number[];
  recentlyViewedIds: number[];
  studyStreak: number;
  lastStudyDate: string | null;
  dailyCompletionHistory: DayProgress[];
  lastShortsQuestionId: number | null;

  // Settings Actions
  setTheme: (theme: UserSettings['theme']) => void;
  setFontSize: (size: UserSettings['fontSize']) => void;
  setCompactMode: (enabled: boolean) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;

  // Progress Actions
  toggleBookmark: (id: number) => void;
  toggleCompleted: (id: number) => void;
  setCompleted: (id: number, completed: boolean) => void;
  addToRecentlyViewed: (id: number) => void;
  resetProgress: () => void;
  importProgress: (data: Partial<UserProgress>) => void;
  setLastShortsQuestionId: (id: number | null) => void;
}

const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getYesterdayString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Default Settings
      theme: 'system',
      fontSize: 'base',
      compactMode: false,
      animationsEnabled: true,

      // Default Progress
      completedQuestionIds: [],
      bookmarkedQuestionIds: [],
      recentlyViewedIds: [],
      studyStreak: 0,
      lastStudyDate: null,
      dailyCompletionHistory: [],
      lastShortsQuestionId: null,

      // Settings Reducers
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setCompactMode: (compactMode) => set({ compactMode }),
      setAnimationsEnabled: (animationsEnabled) => set({ animationsEnabled }),
      updateSettings: (settings) => set((state) => ({ ...state, ...settings })),

      // Progress Reducers
      toggleBookmark: (id) => set((state) => {
        const isBookmarked = state.bookmarkedQuestionIds.includes(id);
        const bookmarkedQuestionIds = isBookmarked
          ? state.bookmarkedQuestionIds.filter((bid) => bid !== id)
          : [...state.bookmarkedQuestionIds, id];
        return { bookmarkedQuestionIds };
      }),

      toggleCompleted: (id) => get().setCompleted(id, !get().completedQuestionIds.includes(id)),

      setCompleted: (id, completed) => set((state) => {
        const isCurrentlyCompleted = state.completedQuestionIds.includes(id);
        
        if (completed === isCurrentlyCompleted) return {};

        const completedQuestionIds = completed
          ? [...state.completedQuestionIds, id]
          : state.completedQuestionIds.filter((cid) => cid !== id);

        // Adjust Streaks & History if completed is true
        let { studyStreak, lastStudyDate, dailyCompletionHistory } = state;
        const today = getTodayString();
        const yesterday = getYesterdayString();

        if (completed) {
          // Update daily completion counts
          const historyIndex = dailyCompletionHistory.findIndex((h) => h.date === today);
          let newHistory = [...dailyCompletionHistory];
          if (historyIndex >= 0) {
            newHistory[historyIndex] = {
              ...newHistory[historyIndex],
              completedCount: newHistory[historyIndex].completedCount + 1,
            };
          } else {
            newHistory.push({ date: today, completedCount: 1 });
          }
          dailyCompletionHistory = newHistory;

          // Streak Logic
          if (lastStudyDate === yesterday) {
            studyStreak += 1;
            lastStudyDate = today;
          } else if (lastStudyDate !== today) {
            studyStreak = 1;
            lastStudyDate = today;
          }
        } else {
          // If unmarking, adjust daily completion history if it exists
          const historyIndex = dailyCompletionHistory.findIndex((h) => h.date === today);
          if (historyIndex >= 0) {
            let newHistory = [...dailyCompletionHistory];
            const newCount = Math.max(0, newHistory[historyIndex].completedCount - 1);
            if (newCount === 0) {
              newHistory = newHistory.filter((h) => h.date !== today);
            } else {
              newHistory[historyIndex] = {
                ...newHistory[historyIndex],
                completedCount: newCount,
              };
            }
            dailyCompletionHistory = newHistory;
          }
        }

        return {
          completedQuestionIds,
          studyStreak,
          lastStudyDate,
          dailyCompletionHistory,
        };
      }),

      addToRecentlyViewed: (id) => set((state) => {
        const filtered = state.recentlyViewedIds.filter((rid) => rid !== id);
        const recentlyViewedIds = [id, ...filtered].slice(0, 8); // Keep up to 8 questions
        return { recentlyViewedIds };
      }),

      resetProgress: () => set({
        completedQuestionIds: [],
        bookmarkedQuestionIds: [],
        recentlyViewedIds: [],
        studyStreak: 0,
        lastStudyDate: null,
        dailyCompletionHistory: [],
        lastShortsQuestionId: null,
      }),

      importProgress: (data) => set((state) => ({
        completedQuestionIds: data.completedQuestionIds || state.completedQuestionIds,
        bookmarkedQuestionIds: data.bookmarkedQuestionIds || state.bookmarkedQuestionIds,
        recentlyViewedIds: data.recentlyViewedIds || state.recentlyViewedIds,
        studyStreak: data.studyStreak !== undefined ? data.studyStreak : state.studyStreak,
        lastStudyDate: data.lastStudyDate !== undefined ? data.lastStudyDate : state.lastStudyDate,
        dailyCompletionHistory: data.dailyCompletionHistory || state.dailyCompletionHistory,
        lastShortsQuestionId: data.lastShortsQuestionId !== undefined ? data.lastShortsQuestionId : state.lastShortsQuestionId,
      })),

      setLastShortsQuestionId: (lastShortsQuestionId) => set({ lastShortsQuestionId }),
    }),
    {
      name: 'frontend-prep-store',
    }
  )
);

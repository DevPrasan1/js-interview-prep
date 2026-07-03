import type { Difficulty, Frequency } from '../types';

// DIFFICULTY BADGE
interface DifficultyBadgeProps {
  difficulty: Difficulty;
  className?: string;
}

export function DifficultyBadge({ difficulty, className = '' }: DifficultyBadgeProps) {
  const styles = {
    Easy: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    Medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    Hard: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  }[difficulty];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles} ${className}`}
    >
      {difficulty}
    </span>
  );
}

// FREQUENCY BADGE
interface FrequencyBadgeProps {
  frequency: Frequency;
  className?: string;
}

export function FrequencyBadge({ frequency, className = '' }: FrequencyBadgeProps) {
  const styles = {
    Low: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    Medium: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    High: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    'Very High': 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 animate-pulse',
  }[frequency];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles} ${className}`}
    >
      {frequency} Ask
    </span>
  );
}

// TAG BADGE
interface TagProps {
  label: string;
  onClick?: () => void;
  className?: string;
}

export function Tag({ label, onClick, className = '' }: TagProps) {
  const isClickable = !!onClick;
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-bg-secondary text-text-secondary border border-border-color transition-all duration-200 ${
        isClickable
          ? 'hover:bg-accent-soft hover:text-accent hover:border-accent-soft-border cursor-pointer active:scale-95'
          : ''
      } ${className}`}
    >
      #{label}
    </span>
  );
}

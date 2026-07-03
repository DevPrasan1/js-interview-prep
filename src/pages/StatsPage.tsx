import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { getAllQuestions, getCategories } from '../utils/questions';
import { Card } from '../components/Card';
import {
  Flame,
  CheckCircle,
  Bookmark,
  Hourglass,
  TrendingUp,
  BarChart3,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function StatsPage() {
  const allQuestions = getAllQuestions();
  const categories = getCategories();

  const completedIds = useStore((state) => state.completedQuestionIds);
  const bookmarkIds = useStore((state) => state.bookmarkedQuestionIds);
  const streak = useStore((state) => state.studyStreak);
  const dailyHistory = useStore((state) => state.dailyCompletionHistory);

  // Stats calculations
  const totalCount = allQuestions.length;
  const completedCount = completedIds.length;
  const bookmarkCount = bookmarkIds.length;

  // Calculated Practice time: sum of read times of completed questions
  const totalPracticeTimeMins = useMemo(() => {
    let sum = 0;
    allQuestions.forEach((q) => {
      if (completedIds.includes(q.id)) {
        const mins = parseInt(q.estimatedReadTime, 10);
        if (!isNaN(mins)) sum += mins;
      }
    });
    return sum;
  }, [allQuestions, completedIds]);

  // Difficulty stats
  const easyTotal = allQuestions.filter(q => q.difficulty === 'Easy').length;
  const mediumTotal = allQuestions.filter(q => q.difficulty === 'Medium').length;
  const hardTotal = allQuestions.filter(q => q.difficulty === 'Hard').length;

  const easyCompleted = allQuestions.filter(q => q.difficulty === 'Easy' && completedIds.includes(q.id)).length;
  const mediumCompleted = allQuestions.filter(q => q.difficulty === 'Medium' && completedIds.includes(q.id)).length;
  const hardCompleted = allQuestions.filter(q => q.difficulty === 'Hard' && completedIds.includes(q.id)).length;

  // SVG Donut Chart variables
  const donutData = useMemo(() => {
    const totalSolved = easyCompleted + mediumCompleted + hardCompleted;
    if (totalSolved === 0) return null;

    const easyPct = easyCompleted / totalSolved;
    const mediumPct = mediumCompleted / totalSolved;
    const hardPct = hardCompleted / totalSolved;

    const r = 50; // radius
    const circ = 2 * Math.PI * r; // circumference

    const strokeEasy = easyPct * circ;
    const strokeMedium = mediumPct * circ;
    const strokeHard = hardPct * circ;

    return {
      circ,
      strokeEasy,
      strokeMedium,
      strokeHard,
      offsetEasy: 0,
      offsetMedium: strokeEasy,
      offsetHard: strokeEasy + strokeMedium,
    };
  }, [easyCompleted, mediumCompleted, hardCompleted]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
          Study Analytics
        </h1>
        <p className="text-sm text-text-secondary">
          Track your learning completion ratios, current daily streaks, and practice distributions.
        </p>
      </div>

      {/* Grid: 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Completed Card */}
        <Card className="p-5 flex items-center gap-4 border-border-color bg-bg-primary shadow-sm">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl flex-shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-text-muted font-bold uppercase tracking-wider block">Solved</span>
            <span className="text-xl sm:text-2xl font-black text-text-primary mt-0.5 block">{completedCount}</span>
            <span className="text-[10px] text-text-muted mt-0.5 block truncate">of {totalCount} total questions</span>
          </div>
        </Card>

        {/* Streak Card */}
        <Card className="p-5 flex items-center gap-4 border-border-color bg-bg-primary shadow-sm">
          <div className="p-3 bg-orange-500/10 text-orange-500 rounded-2xl flex-shrink-0">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-text-muted font-bold uppercase tracking-wider block">Streak</span>
            <span className="text-xl sm:text-2xl font-black text-text-primary mt-0.5 block">{streak} Days</span>
            <span className="text-[10px] text-text-muted mt-0.5 block truncate">Keep logging in daily</span>
          </div>
        </Card>

        {/* Bookmarks Card */}
        <Card className="p-5 flex items-center gap-4 border-border-color bg-bg-primary shadow-sm">
          <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-2xl flex-shrink-0">
            <Bookmark className="w-5 h-5 fill-current" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-text-muted font-bold uppercase tracking-wider block">Saved</span>
            <span className="text-xl sm:text-2xl font-black text-text-primary mt-0.5 block">{bookmarkCount}</span>
            <span className="text-[10px] text-text-muted mt-0.5 block truncate">Reference questions</span>
          </div>
        </Card>

        {/* Estimated Time Card */}
        <Card className="p-5 flex items-center gap-4 border-border-color bg-bg-primary shadow-sm">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl flex-shrink-0">
            <Hourglass className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-text-muted font-bold uppercase tracking-wider block">Practice Time</span>
            <span className="text-xl sm:text-2xl font-black text-text-primary mt-0.5 block">{totalPracticeTimeMins}m</span>
            <span className="text-[10px] text-text-muted mt-0.5 block truncate">Estimated reading time</span>
          </div>
        </Card>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Difficulty Distribution Chart (md: 5 columns) */}
        <Card className="md:col-span-5 p-6 border-border-color bg-bg-primary flex flex-col justify-between shadow-sm">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-accent" />
              <span>Practice Breakdown</span>
            </h3>
            <p className="text-xs text-text-muted">Proportional distribution of solved questions.</p>
          </div>

          <div className="py-6 flex justify-center items-center">
            {donutData ? (
              <div className="relative w-44 h-44">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  {/* Outer circle */}
                  <circle cx="60" cy="60" r="50" fill="transparent" stroke="var(--bg-tertiary)" strokeWidth="12" />
                  
                  {/* Easy segment */}
                  {donutData.strokeEasy > 0 && (
                    <circle
                      cx="60" cy="60" r="50" fill="transparent"
                      stroke="#10b981" strokeWidth="12"
                      strokeDasharray={`${donutData.strokeEasy} ${donutData.circ - donutData.strokeEasy}`}
                      strokeDashoffset={-donutData.offsetEasy}
                      strokeLinecap="round"
                    />
                  )}

                  {/* Medium segment */}
                  {donutData.strokeMedium > 0 && (
                    <circle
                      cx="60" cy="60" r="50" fill="transparent"
                      stroke="#f59e0b" strokeWidth="12"
                      strokeDasharray={`${donutData.strokeMedium} ${donutData.circ - donutData.strokeMedium}`}
                      strokeDashoffset={-donutData.offsetMedium}
                      strokeLinecap="round"
                    />
                  )}

                  {/* Hard segment */}
                  {donutData.strokeHard > 0 && (
                    <circle
                      cx="60" cy="60" r="50" fill="transparent"
                      stroke="#ef4444" strokeWidth="12"
                      strokeDasharray={`${donutData.strokeHard} ${donutData.circ - donutData.strokeHard}`}
                      strokeDashoffset={-donutData.offsetHard}
                      strokeLinecap="round"
                    />
                  )}
                </svg>

                {/* Inner Text info */}
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center">
                  <span className="text-2xl font-black text-text-primary">{completedCount}</span>
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Solved</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-text-muted italic max-w-[200px]">
                Answer questions to populate your visual distribution charts.
              </div>
            )}
          </div>

          <div className="space-y-2 border-t border-border-color pt-4 text-xs font-semibold text-text-secondary">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                <span>Easy</span>
              </div>
              <span>{easyCompleted} / {easyTotal}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                <span>Medium</span>
              </div>
              <span>{mediumCompleted} / {mediumTotal}</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
                <span>Hard</span>
              </div>
              <span>{hardCompleted} / {hardTotal}</span>
            </div>
          </div>
        </Card>

        {/* Category breakdown (md: 7 columns) */}
        <Card className="md:col-span-7 p-6 border-border-color bg-bg-primary shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span>Syllabus Tracking</span>
            </h3>
            <p className="text-xs text-text-muted">Practiced ratios across all interview categories.</p>
          </div>

          <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
            {categories.map((cat) => {
              const catQuestions = allQuestions.filter(q => q.category.toLowerCase() === cat.name.toLowerCase());
              const catTotal = catQuestions.length;
              const catCompleted = catQuestions.filter(q => completedIds.includes(q.id)).length;
              const pct = catTotal > 0 ? Math.round((catCompleted / catTotal) * 100) : 0;

              return (
                <div key={cat.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-text-secondary">
                    <span>{cat.name}</span>
                    <span className="text-text-muted">{catCompleted} / {catTotal} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

      </div>

      {/* Study Activity History logs */}
      <Card className="p-6 border-border-color bg-bg-primary shadow-sm space-y-4">
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-text-primary uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-accent" />
            <span>Study Logs</span>
          </h3>
          <p className="text-xs text-text-muted">A record of your completion milestones.</p>
        </div>

        {dailyHistory.length === 0 ? (
          <div className="text-center py-6 text-xs text-text-muted italic border border-dashed border-border-color rounded-xl">
            No study activity logs recorded. Mark questions complete to start your history tracking!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[...dailyHistory].reverse().map((log) => {
              const d = new Date(log.date);
              const formattedDate = d.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <div key={log.date} className="flex justify-between items-center p-3 rounded-xl border border-border-color bg-bg-secondary text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-text-primary block">{formattedDate}</span>
                    <span className="text-text-muted font-medium block">Practice session logs</span>
                  </div>
                  
                  <span className="px-2.5 py-1 bg-accent-soft border border-accent-soft-border text-accent font-bold rounded-lg flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-current" />
                    <span>+{log.completedCount} solved</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

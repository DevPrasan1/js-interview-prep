import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { getCategories, getAllQuestions } from '../utils/questions';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { DifficultyBadge, FrequencyBadge } from '../components/Badge';
import {
  BookOpen,
  ChevronRight,
  Flame,
  Bookmark,
  Search,
  Zap,
  Target
} from 'lucide-react';

export default function Home({ onSearchTrigger }: { onSearchTrigger: () => void }) {
  const categories = getCategories();
  const allQuestions = getAllQuestions();

  const completedIds = useStore((state) => state.completedQuestionIds);
  const bookmarkIds = useStore((state) => state.bookmarkedQuestionIds);
  const recentlyViewedIds = useStore((state) => state.recentlyViewedIds);
  const streak = useStore((state) => state.studyStreak);

  const [dailyQuestion, setDailyQuestion] = useState<(typeof allQuestions)[0] | null>(null);

  // Pick a Daily Question based on the date hash
  useEffect(() => {
    if (allQuestions.length > 0) {
      const today = new Date();
      // Date hash code (day of year + year)
      const day = today.getDate() + today.getMonth() * 31 + today.getFullYear();
      const index = day % allQuestions.length;
      setDailyQuestion(allQuestions[index]);
    }
  }, [allQuestions]);

  // Overall Completion stats
  const totalQuestions = allQuestions.length;
  const completedCount = completedIds.length;
  const completionPercentage = totalQuestions > 0 ? Math.round((completedCount / totalQuestions) * 100) : 0;

  // Bookmarks count
  const bookmarkCount = bookmarkIds.length;

  // Difficulty distributions
  const easyTotal = allQuestions.filter(q => q.difficulty === 'Easy').length;
  const mediumTotal = allQuestions.filter(q => q.difficulty === 'Medium').length;
  const hardTotal = allQuestions.filter(q => q.difficulty === 'Hard').length;

  const easyCompleted = allQuestions.filter(q => q.difficulty === 'Easy' && completedIds.includes(q.id)).length;
  const mediumCompleted = allQuestions.filter(q => q.difficulty === 'Medium' && completedIds.includes(q.id)).length;
  const hardCompleted = allQuestions.filter(q => q.difficulty === 'Hard' && completedIds.includes(q.id)).length;

  // Retrieve details of recently viewed questions
  const recentlyViewedQuestions = recentlyViewedIds
    .map(id => allQuestions.find(q => q.id === id))
    .filter((q): q is typeof q & {} => !!q)
    .slice(0, 3); // Max 3 items

  // Dynamic Category icon mapping
  const getCategoryIcon = (_iconName: string) => {
    return <BookOpen className="w-5 h-5" />;
  };

  return (
    <div className="space-y-10">
      
      {/* Search Header Hero Panel */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent/15 via-purple-500/5 to-transparent p-6 md:p-10 border border-accent-soft-border/20 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-soft text-accent text-xs font-semibold border border-accent-soft-border/40">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Interactive Offline Study Hub</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary leading-tight">
            Master the <span className="bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">Frontend Interview</span>
          </h1>
          <p className="text-sm md:text-base text-text-secondary leading-relaxed">
            Practice production-ready web development concepts, solve interactive JS coding challenges, and study curated behavioral questions completely offline.
          </p>
          
          {/* Quick search input button */}
          <div className="pt-2">
            <button
              onClick={onSearchTrigger}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-border-color bg-bg-primary hover:border-accent/40 hover:bg-bg-primary shadow-sm text-sm text-text-muted w-full sm:w-80 cursor-pointer transition-all duration-200"
            >
              <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
              <span>Search topics, companies, tags...</span>
            </button>
          </div>
        </div>

        {/* Dashboard Progress Stats Card */}
        <Card className="p-6 w-full md:w-80 flex flex-col gap-4 border border-border-color bg-bg-primary shadow-lg relative overflow-hidden flex-shrink-0">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-xl pointer-events-none" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <Target className="w-4 h-4 text-accent" />
            <span>Overall Progress</span>
          </h2>
          
          <div className="flex items-end justify-between">
            <span className="text-4xl font-extrabold text-text-primary tracking-tight">{completionPercentage}%</span>
            <span className="text-xs text-text-muted font-medium pb-1.5">
              {completedCount} of {totalQuestions} solved
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full bg-bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 text-center border-t border-border-color">
            <div className="space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-orange-500 font-extrabold text-base">
                <Flame className="w-4.5 h-4.5 fill-current" />
                <span>{streak}</span>
              </div>
              <div className="text-[10px] text-text-muted uppercase font-semibold">Streak</div>
            </div>
            
            <div className="space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-yellow-500 font-extrabold text-base">
                <Bookmark className="w-4.5 h-4.5 fill-current" />
                <span>{bookmarkCount}</span>
              </div>
              <div className="text-[10px] text-text-muted uppercase font-semibold">Saved</div>
            </div>
          </div>
        </Card>
      </section>

      {/* Main Grid: Categories vs Side Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Categories list */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-text-primary">Featured Topics</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
            {categories.map((cat) => {
              // Calculate category stats
              const catQuestions = allQuestions.filter(q => q.category.toLowerCase() === cat.name.toLowerCase());
              const catTotal = catQuestions.length;
              const catCompleted = catQuestions.filter(q => completedIds.includes(q.id)).length;
              const catProgress = catTotal > 0 ? Math.round((catCompleted / catTotal) * 100) : 0;

              return (
                <Link key={cat.id} to={`/category/${cat.id}`}>
                  <Card
                    hoverEffect
                    className="p-5 flex flex-col justify-between h-44 border border-border-color bg-bg-primary hover:border-accent-soft-border/40 hover:shadow-md cursor-pointer group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center justify-center p-2 rounded-xl border ${cat.colorClass}`}>
                          {getCategoryIcon(cat.icon)}
                        </span>
                        <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-accent transition-all group-hover:translate-x-0.5" />
                      </div>
                      
                      <h3 className="font-bold text-base text-text-primary group-hover:text-accent transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-3">
                      <div className="flex justify-between items-center text-[10px] text-text-muted font-bold">
                        <span>{catCompleted} / {catTotal} Solved</span>
                        <span>{catProgress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-bg-tertiary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent transition-all duration-300"
                          style={{ width: `${catProgress}%` }}
                        />
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Right 1 Column: Side Widgets (Daily, Continue, Stats) */}
        <section className="space-y-8">
          
          {/* Daily Question */}
          {dailyQuestion && (
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-text-primary">Daily Question</h2>
              <Card className="p-5 border border-accent/20 bg-gradient-to-br from-accent/[0.03] to-purple-500/[0.03] space-y-4 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-16 h-16 bg-accent/5 rounded-full blur-md" />
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-accent text-white">
                      Daily Pick
                    </span>
                    <DifficultyBadge difficulty={dailyQuestion.difficulty} />
                    <FrequencyBadge frequency={dailyQuestion.frequency} />
                  </div>
                  
                  <h3 className="font-bold text-sm sm:text-base text-text-primary line-clamp-2 hover:text-accent transition-colors">
                    <Link to={`/question/${dailyQuestion.id}`}>{dailyQuestion.title}</Link>
                  </h3>
                </div>

                <div className="flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border-color">
                  <span>Category: {dailyQuestion.category}</span>
                  <Link to={`/question/${dailyQuestion.id}`}>
                    <Button size="sm" variant="ghost" className="text-xs font-semibold gap-1 pr-1 cursor-pointer">
                      <span>Solve Now</span>
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          )}

          {/* Continue Learning (Recently Viewed) */}
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-text-primary">Recently Practiced</h2>
            {recentlyViewedQuestions.length === 0 ? (
              <Card className="p-5 border border-border-color bg-bg-primary text-center text-xs text-text-muted py-6">
                Practice questions and your history will load here for quick retrieval.
              </Card>
            ) : (
              <div className="space-y-3">
                {recentlyViewedQuestions.map((q) => (
                  <Link key={q.id} to={`/question/${q.id}`}>
                    <Card
                      hoverEffect
                      className="p-4 flex items-center justify-between border border-border-color bg-bg-primary cursor-pointer hover:border-accent-soft-border group"
                    >
                      <div className="space-y-1 mr-2 flex-1 min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-text-primary group-hover:text-accent truncate transition-colors">
                          {q.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-text-muted">
                          <span>{q.category}</span>
                          <span>•</span>
                          <span className={`${
                            q.difficulty === 'Easy' ? 'text-emerald-500' :
                            q.difficulty === 'Medium' ? 'text-amber-500' : 'text-rose-500'
                          } font-semibold`}>
                            {q.difficulty}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-text-muted group-hover:translate-x-0.5 transition-transform" />
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Difficulty breakdown list */}
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-text-primary">Difficulty Stats</h2>
            <Card className="p-5 border border-border-color bg-bg-primary space-y-4">
              
              {/* Easy Progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-text-secondary">
                  <span className="text-emerald-500">Easy ({easyCompleted} of {easyTotal})</span>
                  <span>{easyTotal > 0 ? Math.round((easyCompleted / easyTotal) * 100) : 0}%</span>
                </div>
                <div className="h-1.5 w-full bg-bg-tertiary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${easyTotal > 0 ? (easyCompleted / easyTotal) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Medium Progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-text-secondary">
                  <span className="text-amber-500">Medium ({mediumCompleted} of {mediumTotal})</span>
                  <span>{mediumTotal > 0 ? Math.round((mediumCompleted / mediumTotal) * 100) : 0}%</span>
                </div>
                <div className="h-1.5 w-full bg-bg-tertiary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${mediumTotal > 0 ? (mediumCompleted / mediumTotal) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Hard Progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-text-secondary">
                  <span className="text-rose-500">Hard ({hardCompleted} of {hardTotal})</span>
                  <span>{hardTotal > 0 ? Math.round((hardCompleted / hardTotal) * 100) : 0}%</span>
                </div>
                <div className="h-1.5 w-full bg-bg-tertiary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500"
                    style={{ width: `${hardTotal > 0 ? (hardCompleted / hardTotal) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </Card>
          </div>
          
        </section>

      </div>
    </div>
  );
}

import { useStore } from '../store/useStore';
import { getQuestionById, getCategoryById } from '../utils/questions';
import { Card } from '../components/Card';
import { DifficultyBadge, FrequencyBadge } from '../components/Badge';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { toast } from '../components/Toast';
import { Link } from 'react-router-dom';
import { Bookmark, Clock, CheckSquare, Square, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BookmarksPage() {
  const bookmarkedIds = useStore((state) => state.bookmarkedQuestionIds);
  const completedIds = useStore((state) => state.completedQuestionIds);
  const toggleBookmark = useStore((state) => state.toggleBookmark);
  const toggleCompleted = useStore((state) => state.toggleCompleted);

  // Retrieve bookmarked question details
  const bookmarkedQuestions = bookmarkedIds
    .map(id => getQuestionById(id))
    .filter((q): q is typeof q & {} => !!q);

  const handleBookmarkToggle = (id: number, title: string) => {
    toggleBookmark(id);
    const isNowBookmarked = !bookmarkedIds.includes(id);
    if (isNowBookmarked) {
      toast.success(`Bookmarked: ${title}`);
    } else {
      toast.info(`Removed bookmark: ${title}`);
    }
  };

  const handleCompletedToggle = (id: number, title: string) => {
    toggleCompleted(id);
    const isNowCompleted = !completedIds.includes(id);
    if (isNowCompleted) {
      toast.success(`Completed: ${title}`);
    } else {
      toast.info(`Marked incomplete: ${title}`);
    }
  };

  if (bookmarkedQuestions.length === 0) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto py-10">
        <div className="space-y-1 text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-text-primary">Bookmarked Questions</h1>
          <p className="text-sm text-text-secondary">Your saved reference guide.</p>
        </div>
        
        <EmptyState
          icon={<Bookmark className="w-12 h-12 text-text-muted" />}
          title="No bookmarked questions yet"
          description="Browse categories and bookmark challenging questions to review them here later."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
          Bookmarked Questions
        </h1>
        <p className="text-sm text-text-secondary">
          Review and practice your saved list of {bookmarkedQuestions.length} interview questions.
        </p>
      </div>

      {/* Bookmarks List */}
      <div className="grid grid-cols-1 gap-4">
        {bookmarkedQuestions.map((q, idx) => {
          const cat = getCategoryById(q.category.toLowerCase().replace(/[^a-z0-9]/g, '-'));
          const isCompleted = completedIds.includes(q.id);

          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card hoverEffect className="p-5 flex flex-col sm:flex-row items-start justify-between gap-4 border border-border-color bg-bg-primary">
                <div className="space-y-3 flex-1">
                  {/* Category & Tags Header */}
                  <div className="flex flex-wrap items-center gap-2">
                    {cat && (
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${cat.colorClass}`}>
                        {cat.name}
                      </span>
                    )}
                    <DifficultyBadge difficulty={q.difficulty} />
                    <FrequencyBadge frequency={q.frequency} />
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-base sm:text-lg text-text-primary hover:text-accent transition-colors">
                    <Link to={`/question/${q.id}`}>{q.title}</Link>
                  </h3>

                  {/* Meta: time and tags */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{q.estimatedReadTime} read</span>
                    </div>
                    {q.companies && q.companies.length > 0 && (
                      <div className="truncate max-w-[200px] sm:max-w-md">
                        Asked by: <span className="font-semibold text-text-secondary">{q.companies.slice(0, 3).join(', ')}</span>
                        {q.companies.length > 3 && '...'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Question Actions */}
                <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-2.5 w-full sm:w-auto border-t sm:border-t-0 border-border-color pt-3 sm:pt-0">
                  <div className="flex items-center gap-2">
                    {/* Mark Complete Checkbox */}
                    <button
                      onClick={() => handleCompletedToggle(q.id, q.title)}
                      aria-label={isCompleted ? "Mark question incomplete" : "Mark question complete"}
                      className={`p-2 rounded-xl border border-border-color hover:bg-bg-secondary text-text-secondary transition-all cursor-pointer ${
                        isCompleted ? 'text-emerald-500 border-emerald-500/25 bg-emerald-500/5' : ''
                      }`}
                    >
                      {isCompleted ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </button>

                    {/* Bookmark Toggle */}
                    <button
                      onClick={() => handleBookmarkToggle(q.id, q.title)}
                      aria-label="Remove from bookmarks"
                      className="p-2 rounded-xl border border-border-color hover:bg-bg-secondary text-yellow-500 bg-yellow-500/5 border-yellow-500/20 transition-all cursor-pointer"
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  <Link to={`/question/${q.id}`} className="w-full sm:w-auto">
                    <Button variant="ghost" size="sm" className="w-full text-xs font-semibold gap-1 pr-2">
                      <span>View Answer</span>
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

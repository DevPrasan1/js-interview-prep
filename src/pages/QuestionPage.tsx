import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getQuestionById, getCategoryById, getQuestionsByCategory, getRelatedQuestions } from '../utils/questions';
import { useStore } from '../store/useStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { DifficultyBadge, FrequencyBadge } from '../components/Badge';
import { toast } from '../components/Toast';
import {
  ArrowLeft,
  Bookmark,
  CheckCircle,
  Copy,
  Share2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  HelpCircle,
  ListRestart,
  Lightbulb,
  FileCode,
  FlameKindling,
  Building,
  Tag as TagIcon,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function QuestionPage() {
  const { id: idParam } = useParams<{ id: string }>();
  const qId = parseInt(idParam || '', 10);

  const question = useMemo(() => getQuestionById(qId), [qId]);

  const completedIds = useStore((state) => state.completedQuestionIds);
  const bookmarkIds = useStore((state) => state.bookmarkedQuestionIds);
  const toggleBookmark = useStore((state) => state.toggleBookmark);
  const toggleCompleted = useStore((state) => state.toggleCompleted);
  const addToRecentlyViewed = useStore((state) => state.addToRecentlyViewed);

  const isCompleted = completedIds.includes(qId);
  const isBookmarked = bookmarkIds.includes(qId);

  // Active Tab state
  const [activeTab, setActiveTab] = useState<'explanation' | 'code' | 'practices'>('explanation');

  // Track page visits
  useEffect(() => {
    if (question) {
      addToRecentlyViewed(question.id);
    }
  }, [question, addToRecentlyViewed]);

  // Navigate to category
  const category = useMemo(() => {
    if (!question) return null;
    return getCategoryById(question.category.toLowerCase().replace(/[^a-z0-9]/g, '-'));
  }, [question]);

  // Fetch sibling questions for prev/next navigation within same category
  const siblings = useMemo(() => {
    if (!question) return [];
    return getQuestionsByCategory(question.category.toLowerCase().replace(/[^a-z0-9]/g, '-'));
  }, [question]);

  const { prevQuestion, nextQuestion } = useMemo(() => {
    const idx = siblings.findIndex((s) => s.id === qId);
    return {
      prevQuestion: idx > 0 ? siblings[idx - 1] : null,
      nextQuestion: idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null,
    };
  }, [siblings, qId]);

  const relatedQuestions = useMemo(() => {
    if (!question) return [];
    return getRelatedQuestions(question);
  }, [question]);

  // Copy Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  // Share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: question?.title,
        text: `Check out this interview question: ${question?.title}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  if (!question) {
    return (
      <Card className="p-8 text-center max-w-md mx-auto">
        <HelpCircle className="w-12 h-12 text-text-muted mx-auto mb-4" />
        <h2 className="text-lg font-bold text-text-primary mb-2">Question Not Found</h2>
        <p className="text-sm text-text-secondary mb-6">The requested interview question does not exist.</p>
        <Link to="/">
          <Button variant="primary" className="cursor-pointer">Back to Dashboard</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Back Button Navigation */}
      <div className="flex justify-between items-center">
        {category ? (
          <Link to={`/category/${category.id}`} className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent font-semibold transition-all">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {category.name} Category</span>
          </Link>
        ) : (
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent font-semibold transition-all">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        )}

        {/* Share & Copy buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCopyLink}
            aria-label="Copy page link"
            className="p-2 rounded-xl border border-border-color bg-bg-primary hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-all cursor-pointer shadow-sm"
          >
            <Copy className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleShare}
            aria-label="Share question link"
            className="p-2 rounded-xl border border-border-color bg-bg-primary hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-all cursor-pointer shadow-sm"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Panel: Info, stats, tags (lg: 4 columns) */}
        <Card className="lg:col-span-4 p-5 space-y-6 border-border-color bg-bg-primary shadow-sm h-fit">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {category && (
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${category.colorClass}`}>
                  {category.name}
                </span>
              )}
              <DifficultyBadge difficulty={question.difficulty} />
              <FrequencyBadge frequency={question.frequency} />
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary leading-tight">
              {question.title}
            </h1>
            
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <Clock className="w-4 h-4" />
              <span>Estimated read: {question.estimatedReadTime}</span>
            </div>
          </div>

          <div className="w-full h-px bg-border-color" />

          {/* Quick Actions Checklist */}
          <div className="space-y-3">
            <Button
              variant={isCompleted ? 'secondary' : 'primary'}
              className="w-full cursor-pointer justify-center"
              leftIcon={<CheckCircle className={`w-4 h-4 ${isCompleted ? 'text-emerald-500 fill-emerald-500/10' : ''}`} />}
              onClick={() => {
                toggleCompleted(question.id);
                if (!isCompleted) toast.success('Marked as complete!');
                else toast.info('Marked as incomplete.');
              }}
            >
              {isCompleted ? 'Completed' : 'Mark Complete'}
            </Button>

            <Button
              variant="outline"
              className={`w-full justify-center cursor-pointer ${
                isBookmarked ? 'text-yellow-600 border-yellow-500/30 bg-yellow-500/5' : ''
              }`}
              leftIcon={<Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current text-yellow-500' : ''}`} />}
              onClick={() => {
                toggleBookmark(question.id);
                if (!isBookmarked) toast.success('Added to bookmarks!');
                else toast.info('Removed from bookmarks.');
              }}
            >
              {isBookmarked ? 'Saved to Bookmarks' : 'Bookmark Reference'}
            </Button>
          </div>

          {/* Company & Tags breakdown */}
          <div className="space-y-4 pt-2">
            {question.companies && question.companies.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-text-muted uppercase flex items-center gap-1">
                  <Building className="w-3.5 h-3.5" />
                  <span>Target Companies</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {question.companies.map((c) => (
                    <span key={c} className="text-xs px-2.5 py-1 bg-bg-secondary rounded-lg border border-border-color text-text-secondary font-medium">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {question.tags && question.tags.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-text-muted uppercase flex items-center gap-1">
                  <TagIcon className="w-3.5 h-3.5" />
                  <span>Topic Tags</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {question.tags.map((t) => (
                    <span key={t} className="text-xs px-2 py-0.5 bg-bg-secondary text-text-secondary rounded border border-border-color font-medium">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Right Panel: Tabs, Answer details (lg: 8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Tab selector */}
          <div className="flex border-b border-border-color gap-1 sticky top-16 bg-bg-secondary pt-2 z-10">
            {[
              { id: 'explanation', label: 'Explanation', icon: <BookOpen className="w-4 h-4" /> },
              { id: 'code', label: 'Code / Sandbox', icon: <FileCode className="w-4 h-4" /> },
              { id: 'practices', label: 'Best Practices', icon: <FlameKindling className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-accent text-accent font-bold'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Active Tab Panel contents */}
          <div className="min-h-[40vh]">
            
            {/* Tab: Explanation */}
            {activeTab === 'explanation' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* HTML rendered answer description */}
                <Card className="p-6 border-border-color bg-bg-primary shadow-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert">
                  <div
                    dangerouslySetInnerHTML={{ __html: question.description }}
                    className="space-y-4 [&>h2]:text-lg [&>h2]:font-bold [&>h2]:text-text-primary [&>h3]:text-base [&>h3]:font-bold [&>h3]:text-text-secondary [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-1 [&>p]:text-text-secondary [&>p>code]:font-mono [&>p>code]:bg-bg-tertiary [&>p>code]:px-1 [&>p>code]:py-0.5 [&>p>code]:rounded [&>ul>li>code]:font-mono [&>ul>li>code]:bg-bg-tertiary [&>ul>li>code]:px-1 [&>ul>li>code]:rounded"
                  />
                </Card>

                {/* Interview Tip Callout */}
                {question.interviewTip && (
                  <Card className="p-6 border-amber-500/20 bg-amber-500/[0.03] flex items-start gap-4 shadow-sm">
                    <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl flex-shrink-0">
                      <Lightbulb className="w-5 h-5 fill-current" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm text-amber-600 dark:text-amber-400">Inside Interview Tip</h3>
                      <p className="text-sm text-text-secondary leading-relaxed">{question.interviewTip}</p>
                    </div>
                  </Card>
                )}
              </motion.div>
            )}

            {/* Tab: Code Examples */}
            {activeTab === 'code' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {question.example ? (
                  <Card className="border-border-color bg-bg-primary overflow-hidden shadow-sm">
                    <div className="px-4 py-2 border-b border-border-color bg-bg-secondary flex justify-between items-center text-xs font-semibold text-text-secondary">
                      <span>Code Snippet Example</span>
                      <button
                        onClick={() => {
                          const codeText = question.example.replace(/<[^>]*>/g, '');
                          navigator.clipboard.writeText(codeText);
                          toast.success('Code copied to clipboard!');
                        }}
                        className="flex items-center gap-1.5 hover:text-accent font-bold cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </button>
                    </div>
                    <div className="p-4 overflow-x-auto bg-[#1e1e24] dark:bg-[#0b0f19] font-mono text-xs sm:text-sm text-slate-100">
                      {/* Render example code HTML safely */}
                      <div
                        dangerouslySetInnerHTML={{ __html: question.example }}
                        className="[&>pre]:margin-0 [&>pre>code]:bg-transparent [&>pre>code]:p-0"
                      />
                    </div>
                  </Card>
                ) : (
                  <Card className="p-8 text-center text-text-muted">
                    No code sandbox example is defined for this question.
                  </Card>
                )}
              </motion.div>
            )}

            {/* Tab: Practices & Mistakes */}
            {activeTab === 'practices' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* Best Practices */}
                <Card className="p-6 border-emerald-500/20 bg-emerald-500/[0.01] space-y-4 shadow-sm">
                  <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-bold border-b border-emerald-500/10 pb-2">
                    <CheckCircle className="w-5 h-5 fill-emerald-500/10" />
                    <h3 className="text-base font-bold">Best Practices</h3>
                  </div>
                  <div
                    dangerouslySetInnerHTML={{ __html: question.bestPractices }}
                    className="text-sm text-text-secondary leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1.5 [&>ul>li>code]:font-mono [&>ul>li>code]:bg-bg-tertiary [&>ul>li>code]:px-1 [&>ul>li>code]:rounded"
                  />
                </Card>

                {/* Common Mistakes */}
                <Card className="p-6 border-rose-500/20 bg-rose-500/[0.01] space-y-4 shadow-sm">
                  <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 font-bold border-b border-rose-500/10 pb-2">
                    <HelpCircle className="w-5 h-5 text-rose-500" />
                    <h3 className="text-base font-bold">Common Traps</h3>
                  </div>
                  <div
                    dangerouslySetInnerHTML={{ __html: question.commonMistakes }}
                    className="text-sm text-text-secondary leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1.5 [&>ul>li>code]:font-mono [&>ul>li>code]:bg-bg-tertiary [&>ul>li>code]:px-1 [&>ul>li>code]:rounded"
                  />
                </Card>
              </motion.div>
            )}

          </div>

          {/* Follow-up Questions Widget */}
          {question.followUpQuestions && question.followUpQuestions.length > 0 && (
            <Card className="p-6 border-border-color bg-bg-primary shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                <ListRestart className="w-4 h-4 text-accent" />
                <span>Interviewer Follow-ups</span>
              </h3>
              <ul className="list-decimal pl-5 text-sm text-text-secondary space-y-2">
                {question.followUpQuestions.map((q, idx) => (
                  <li key={idx} className="leading-relaxed">{q}</li>
                ))}
              </ul>
            </Card>
          )}

          {/* Related Questions Widget */}
          {relatedQuestions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider">Related Practice Items</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedQuestions.map((r) => (
                  <Link key={r.id} to={`/question/${r.id}`}>
                    <Card hoverEffect className="p-4 border border-border-color bg-bg-primary cursor-pointer hover:border-accent-soft-border group flex justify-between items-center">
                      <div className="truncate mr-2">
                        <span className="text-xs font-bold text-text-primary group-hover:text-accent transition-colors block truncate">
                          {r.title}
                        </span>
                        <span className="text-[10px] text-text-muted block mt-0.5">
                          {r.category} • {r.difficulty}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0 group-hover:translate-x-0.5 transition-all" />
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Question Sibling Navigation footer */}
          <div className="flex justify-between items-center pt-6 border-t border-border-color">
            {prevQuestion ? (
              <Link to={`/question/${prevQuestion.id}`}>
                <Button variant="outline" className="cursor-pointer text-xs" leftIcon={<ChevronLeft className="w-4 h-4" />}>
                  <span>Previous</span>
                </Button>
              </Link>
            ) : (
              <div />
            )}

            {nextQuestion ? (
              <Link to={`/question/${nextQuestion.id}`}>
                <Button variant="outline" className="cursor-pointer text-xs" rightIcon={<ChevronRight className="w-4 h-4" />}>
                  <span>Next Question</span>
                </Button>
              </Link>
            ) : (
              <div />
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

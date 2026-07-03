import { useState, useEffect, useMemo, useRef } from 'react';
import { useStore } from '../store/useStore';
import { getAllQuestions, getCategories, getCategoryById } from '../utils/questions';
import { Button } from '../components/Button';
import { DifficultyBadge, FrequencyBadge } from '../components/Badge';
import { toast } from '../components/Toast';
import {
  ChevronUp,
  ChevronDown,
  Bookmark,
  CheckCircle,
  Sparkles,
  SlidersHorizontal,
  Flame,
  Lightbulb,
  FileCode,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ShortsPage() {
  const allQuestions = useMemo(() => getAllQuestions(), []);
  const categories = useMemo(() => getCategories(), []);

  // Zustand State hooks
  const completedIds = useStore((state) => state.completedQuestionIds);
  const bookmarkIds = useStore((state) => state.bookmarkedQuestionIds);
  const lastShortsQuestionId = useStore((state) => state.lastShortsQuestionId);

  const toggleBookmark = useStore((state) => state.toggleBookmark);
  const toggleCompleted = useStore((state) => state.toggleCompleted);
  const setLastShortsQuestionId = useStore((state) => state.setLastShortsQuestionId);
  const addToRecentlyViewed = useStore((state) => state.addToRecentlyViewed);
  const streak = useStore((state) => state.studyStreak);

  // Selected Category Deck state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'explanation' | 'code' | 'practices'>('explanation');

  // Transition direction ('up' for next, 'down' for previous)
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const [hasResumed, setHasResumed] = useState<boolean>(false);

  // Scrollable container ref for resetting scroll positions when index changes
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Build the active deck based on the selected category filter
  const activeDeck = useMemo(() => {
    if (selectedCategory === 'all') return allQuestions;
    const cat = getCategoryById(selectedCategory);
    if (!cat) return allQuestions;
    return allQuestions.filter(q => q.category.toLowerCase() === cat.name.toLowerCase());
  }, [selectedCategory, allQuestions]);

  const activeQuestion = activeDeck[currentIndex] || null;

  // Handle Resume Reading on deck change/mount
  useEffect(() => {
    if (activeDeck.length === 0) return;

    // Resuming from store state
    if (lastShortsQuestionId && !hasResumed) {
      const idx = activeDeck.findIndex(q => q.id === lastShortsQuestionId);
      if (idx !== -1) {
        setCurrentIndex(idx);
        toast.info(`Resumed study session from where you left off!`);
      }
      setHasResumed(true);
    }
  }, [activeDeck, lastShortsQuestionId, hasResumed]);

  // Sync current question to store lastShortsQuestionId and mark recently viewed
  useEffect(() => {
    if (activeQuestion) {
      setLastShortsQuestionId(activeQuestion.id);
      addToRecentlyViewed(activeQuestion.id);
      setShowAnswer(false); // Hide answer by default on new question
      setActiveTab('explanation'); // Reset tab state
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0; // Scroll to top
      }
    }
  }, [currentIndex, activeQuestion, setLastShortsQuestionId, addToRecentlyViewed]);

  const handleNext = () => {
    if (currentIndex < activeDeck.length - 1) {
      setDirection('up');
      setCurrentIndex(prev => prev + 1);
    } else {
      toast.info('You have reached the end of this study deck!');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection('down');
      setCurrentIndex(prev => prev - 1);
    } else {
      toast.info('You are at the first card of the deck.');
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if inside input fields
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setShowAnswer(prev => !prev);
      } else if (e.key === 'b' || e.key === 'B') {
        if (activeQuestion) {
          toggleBookmark(activeQuestion.id);
          const isSaved = !bookmarkIds.includes(activeQuestion.id);
          if (isSaved) toast.success('Bookmarked question');
          else toast.info('Removed bookmark');
        }
      } else if (e.key === 'c' || e.key === 'C') {
        if (activeQuestion) {
          toggleCompleted(activeQuestion.id);
          const isDone = !completedIds.includes(activeQuestion.id);
          if (isDone) toast.success('Completed question!');
          else toast.info('Marked as incomplete');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, activeDeck, activeQuestion, bookmarkIds, completedIds]);

  // Framer Motion Animation Variants
  const cardVariants = {
    initial: (dir: 'up' | 'down') => ({
      opacity: 0,
      y: dir === 'up' ? 250 : -250,
      scale: 0.95
    }),
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring' as const, stiffness: 200, damping: 25 }
    },
    exit: (dir: 'up' | 'down') => ({
      opacity: 0,
      y: dir === 'up' ? -250 : 250,
      scale: 0.95,
      transition: { duration: 0.25 }
    })
  };

  // Drag Gesture handler
  const handleDragEnd = (_event: any, info: any) => {
    const threshold = 100; // drag threshold in pixels
    if (info.offset.y < -threshold) {
      handleNext();
    } else if (info.offset.y > threshold) {
      handlePrev();
    }
  };

  const isCompleted = activeQuestion ? completedIds.includes(activeQuestion.id) : false;
  const isBookmarked = activeQuestion ? bookmarkIds.includes(activeQuestion.id) : false;

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] md:h-[calc(100vh-10rem)] max-w-2xl mx-auto space-y-4">

      {/* Category selector header */}
      <section className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-bg-primary p-4 border border-border-color rounded-2xl shadow-sm flex-shrink-0">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-accent" />
          <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Practice Deck:</span>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentIndex(0);
          }}
          className="px-3 py-1.5 border border-border-color bg-bg-secondary rounded-xl text-xs font-semibold focus:outline-none focus:border-accent w-full sm:w-56 cursor-pointer"
        >
          <option value="all">All Category Questions</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <div className="text-xs font-bold text-text-muted">
          Card {currentIndex + 1} of {activeDeck.length}
        </div>
      </section>

      {/* Main card viewport */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-bg-secondary/40 rounded-3xl border border-border-color/30">

        {/* Navigation Indicators on desktop */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-2 z-10">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-2.5 rounded-full border border-border-color bg-bg-primary hover:bg-bg-secondary text-text-secondary disabled:opacity-30 cursor-pointer shadow-sm"
            aria-label="Previous card"
          >
            <ChevronUp className="w-5 h-5" />
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === activeDeck.length - 1}
            className="p-2.5 rounded-full border border-border-color bg-bg-primary hover:bg-bg-secondary text-text-secondary disabled:opacity-30 cursor-pointer shadow-sm"
            aria-label="Next card"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Keyboard shortcut tips bottom left (desktop) */}
        <div className="absolute left-4 bottom-4 hidden md:flex flex-col gap-1 text-[10px] text-text-muted font-semibold bg-bg-primary/95 border border-border-color p-2.5 rounded-xl shadow-sm z-10">
          <span><kbd className="bg-bg-tertiary px-1 py-0.5 border rounded">↑↓</kbd> Next / Previous</span>
          <span><kbd className="bg-bg-tertiary px-1 py-0.5 border rounded">Space</kbd> Reveal Answer</span>
          <span><kbd className="bg-bg-tertiary px-1 py-0.5 border rounded">B</kbd> Bookmark</span>
          <span><kbd className="bg-bg-tertiary px-1.5 py-0.5 border rounded">C</kbd> Complete</span>
        </div>

        {/* Question cards stack */}
        <AnimatePresence mode="wait" custom={direction}>
          {activeQuestion && (
            <motion.div
              key={activeQuestion.id}
              custom={direction}
              variants={cardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.5}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 bg-bg-primary border border-border-color rounded-2xl shadow-xl flex flex-col overflow-hidden cursor-grab active:cursor-grabbing"
            >

              {/* Card top action controls */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border-color bg-bg-primary flex-shrink-0">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-accent/25 bg-accent-soft text-accent">
                  {activeQuestion.category}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      toggleCompleted(activeQuestion.id);
                      if (!isCompleted) toast.success('Completed!');
                      else toast.info('Marked incomplete.');
                    }}
                    className={`p-2 rounded-xl border border-border-color hover:bg-bg-secondary transition-all cursor-pointer ${isCompleted ? 'text-emerald-500 border-emerald-500/25 bg-emerald-500/5' : 'text-text-muted'
                      }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      toggleBookmark(activeQuestion.id);
                      if (!isBookmarked) toast.success('Saved!');
                      else toast.info('Removed bookmark.');
                    }}
                    className={`p-2 rounded-xl border border-border-color hover:bg-bg-secondary transition-all cursor-pointer ${isBookmarked ? 'text-yellow-500 bg-yellow-500/5 border-yellow-500/20' : 'text-text-muted'
                      }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Card Main Body */}
              <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col justify-between"
              >

                {/* Question Info */}
                <div className="space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    <DifficultyBadge difficulty={activeQuestion.difficulty} />
                    <FrequencyBadge frequency={activeQuestion.frequency} />
                  </div>

                  <h2 className="text-xl md:text-2xl font-black text-text-primary leading-snug">
                    {activeQuestion.title}
                  </h2>

                  {activeQuestion.companies && activeQuestion.companies.length > 0 && (
                    <div className="text-xs text-text-muted leading-relaxed">
                      Asked by: <span className="font-semibold text-text-secondary">{activeQuestion.companies.slice(0, 3).join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Answer reveal section */}
                <div className="pt-6 flex-1 flex flex-col justify-end">
                  {!showAnswer ? (
                    // Reveal answer trigger button
                    <Button
                      variant="primary"
                      className="w-full py-4 text-base font-bold shadow-md shadow-accent/10 cursor-pointer justify-center gap-2 group mt-8"
                      leftIcon={<Sparkles className="w-5 h-5 fill-current animate-pulse group-hover:scale-105" />}
                      onClick={() => setShowAnswer(true)}
                    >
                      Reveal Answer Explanation
                    </Button>
                  ) : (
                    // Tabs & Explanation contents
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 mt-4 text-left"
                    >
                      {/* Tabs Bar */}
                      <div className="flex border-b border-border-color gap-1 sticky top-0 bg-bg-primary z-10 pb-1">
                        {[
                          { id: 'explanation', label: 'Explanation', icon: <BookOpen className="w-3.5 h-3.5" /> },
                          { id: 'code', label: 'Code Snippet', icon: <FileCode className="w-3.5 h-3.5" /> },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 text-xs font-bold transition-all cursor-pointer ${activeTab === tab.id
                                ? 'border-accent text-accent font-extrabold'
                                : 'border-transparent text-text-secondary hover:text-text-primary'
                              }`}
                          >
                            {tab.icon}
                            <span>{tab.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Tab panel displays */}
                      <div className="space-y-4">
                        {activeTab === 'explanation' && (
                          <div className="space-y-4">
                            <div
                              dangerouslySetInnerHTML={{ __html: activeQuestion.description }}
                              className="text-sm text-text-secondary leading-relaxed space-y-3 [&>h2]:text-sm [&>h2]:font-bold [&>h2]:text-text-primary [&>h3]:text-xs [&>h3]:font-bold [&>h3]:text-text-secondary [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1 [&>p>code]:font-mono [&>p>code]:bg-bg-tertiary [&>p>code]:px-1 [&>p>code]:rounded [&>ul>li>code]:font-mono [&>ul>li>code]:bg-bg-tertiary [&>ul>li>code]:px-1 [&>ul>li>code]:rounded"
                            />
                            {activeQuestion.interviewTip && (
                              <div className="p-4 border-l-4 border-amber-500 bg-amber-500/5 text-xs text-text-secondary leading-relaxed flex gap-2">
                                <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold text-amber-600 dark:text-amber-400 block mb-0.5">Interview Tip</span>
                                  <span>{activeQuestion.interviewTip}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {activeTab === 'code' && (
                          <div className="space-y-3">
                            {activeQuestion.example ? (
                              <div className="rounded-xl overflow-hidden border border-border-color bg-[#1e1e24] dark:bg-[#0b0f19] p-4 text-xs font-mono text-slate-100 overflow-x-auto">
                                <div dangerouslySetInnerHTML={{ __html: activeQuestion.example }} />
                              </div>
                            ) : (
                              <span className="text-xs text-text-muted italic block py-4 text-center">No code block defined.</span>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>

              </div>

              {/* Progress Tracker deck indicator */}
              <div className="px-5 py-2.5 bg-bg-secondary border-t border-border-color flex justify-between items-center text-[10px] text-text-muted font-bold flex-shrink-0">
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-current text-orange-500" />
                  <span>Streak: {streak} days</span>
                </span>
                <span>Drag up or down to navigate</span>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}

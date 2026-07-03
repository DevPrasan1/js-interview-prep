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
  Zap,
  Flame,
  Lightbulb,
  FileCode,
  BookOpen,
  ArrowLeft,
  Settings,
  Check,
  RotateCcw,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';

export default function ShortsPage() {
  const allQuestions = useMemo(() => getAllQuestions(), []);
  const categories = useMemo(() => getCategories(), []);
  const navigate = useNavigate();

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

  // Layout screen width check
  const [isMobile, setIsMobile] = useState<boolean>(true);

  // Onboarding settings & completion states
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [revealMode, setRevealMode] = useState<'reveal' | 'hide'>('hide');
  const [isDeckFinished, setIsDeckFinished] = useState<boolean>(false);

  // Scrollable container ref for resetting scroll positions when index changes
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Detect mobile viewport on mount and resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        setIsConfigured(true);
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
      setShowAnswer(revealMode === 'reveal'); // Apply selected reveal mode default state
      setActiveTab('explanation'); // Reset tab state
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0; // Scroll to top
      }
    }
  }, [currentIndex, activeQuestion, setLastShortsQuestionId, addToRecentlyViewed, revealMode]);

  const handleNext = () => {
    if (currentIndex < activeDeck.length - 1) {
      setDirection('up');
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsDeckFinished(true);
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

      // Don't intercept if not configured or deck finished
      if (!isConfigured || isDeckFinished) return;

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
  }, [currentIndex, activeDeck, activeQuestion, bookmarkIds, completedIds, isConfigured, isDeckFinished]);

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
    const threshold = 50; // Lowered from 100 to 50 for quick triggers
    const velocityThreshold = 300; // Swipe speed/velocity threshold in px/s

    if (info.offset.y < -threshold || info.velocity.y < -velocityThreshold) {
      handleNext();
    } else if (info.offset.y > threshold || info.velocity.y > velocityThreshold) {
      handlePrev();
    }
  };

  const handleStartPractice = (category: string, mode: 'reveal' | 'hide') => {
    setSelectedCategory(category);
    setRevealMode(mode);
    setCurrentIndex(0);
    setShowAnswer(mode === 'reveal');
    setIsConfigured(true);
    setIsDeckFinished(false);
  };

  // 1. Deck Setup / Configuration View
  const renderSetupView = () => {
    return (
      <div className="flex-1 flex flex-col bg-bg-primary overflow-y-auto p-5 relative select-none h-full">
        {/* Header back button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="p-2.5 rounded-xl border border-border-color bg-bg-secondary hover:bg-bg-tertiary text-text-secondary cursor-pointer transition-all shadow-sm flex items-center justify-center"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-black tracking-wider uppercase text-text-muted">Swipe Deck Setup</span>
          <div className="w-9 h-9" />
        </div>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/25 flex items-center justify-center mx-auto text-accent shadow-sm">
            <Zap className="w-6 h-6 fill-current animate-pulse" />
          </div>
          <h2 className="text-xl font-extrabold text-text-primary">Configure Swipe Deck</h2>
          <p className="text-xs text-text-secondary max-w-xs mx-auto">
            Choose a subject area and pick whether you want to test yourself or reveal answer explanations instantly.
          </p>
        </div>

        {/* Dynamic categories selection */}
        <div className="space-y-2.5 mb-6 text-left">
          <label className="text-xs font-black text-text-secondary uppercase tracking-wider block">1. Select Study Deck</label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`p-3 rounded-xl border text-left transition-all relative ${
                selectedCategory === 'all'
                  ? 'border-accent bg-accent/5 ring-1 ring-accent'
                  : 'border-border-color bg-bg-secondary hover:border-text-muted'
              }`}
            >
              <div className="font-bold text-xs text-text-primary">All Topics</div>
              <div className="text-[10px] text-text-muted mt-0.5">{allQuestions.length} Questions</div>
            </button>
            {categories.map((cat) => {
              const count = allQuestions.filter(q => q.category.toLowerCase() === cat.name.toLowerCase()).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-3 rounded-xl border text-left transition-all relative ${
                    selectedCategory === cat.id
                      ? 'border-accent bg-accent/5 ring-1 ring-accent'
                      : 'border-border-color bg-bg-secondary hover:border-text-muted'
                  }`}
                >
                  <div className="font-bold text-xs text-text-primary truncate">{cat.name}</div>
                  <div className="text-[10px] text-text-muted mt-0.5">{count} Questions</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Answer mode selection */}
        <div className="space-y-2.5 mb-8 text-left">
          <label className="text-xs font-black text-text-secondary uppercase tracking-wider block">2. Select Answer Mode</label>
          <div className="grid grid-cols-1 gap-2.5">
            <button
              onClick={() => setRevealMode('hide')}
              className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                revealMode === 'hide'
                  ? 'border-accent bg-accent/5 ring-1 ring-accent'
                  : 'border-border-color bg-bg-secondary hover:border-text-muted'
              }`}
            >
              <div className="space-y-0.5 pr-2">
                <div className="font-bold text-xs text-text-primary">Hide Answer (Default)</div>
                <div className="text-[10px] text-text-secondary">Hide answers initially to test your skills first.</div>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                revealMode === 'hide' ? 'border-accent bg-accent bg-accent/10 border-accent' : 'border-border-color'
              }`}>
                {revealMode === 'hide' && <Check className="w-2.5 h-2.5 text-accent stroke-[3px]" />}
              </div>
            </button>

            <button
              onClick={() => setRevealMode('reveal')}
              className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                revealMode === 'reveal'
                  ? 'border-accent bg-accent/5 ring-1 ring-accent'
                  : 'border-border-color bg-bg-secondary hover:border-text-muted'
              }`}
            >
              <div className="space-y-0.5 pr-2">
                <div className="font-bold text-xs text-text-primary">Reveal Answer</div>
                <div className="text-[10px] text-text-secondary">Show explanations automatically on card load.</div>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                revealMode === 'reveal' ? 'border-accent bg-accent bg-accent/10 border-accent' : 'border-border-color'
              }`}>
                {revealMode === 'reveal' && <Check className="w-2.5 h-2.5 text-accent stroke-[3px]" />}
              </div>
            </button>
          </div>
        </div>

        {/* Start Practice CTA */}
        <Button
          onClick={() => handleStartPractice(selectedCategory, revealMode)}
          variant="primary"
          className="w-full py-3.5 text-sm font-bold shadow-md shadow-accent/15 cursor-pointer justify-center gap-2 mt-auto"
          rightIcon={<ChevronRight className="w-4 h-4" />}
        >
          Start Practice Session
        </Button>
      </div>
    );
  };

  // 2. Final Completion View (Flat UI without Card UI)
  const renderCompletionView = () => {
    return (
      <div className="flex-1 flex flex-col bg-bg-primary overflow-y-auto p-5 select-none h-full">
        {/* Header */}
        <div className="text-center space-y-3 mb-8 pt-4">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto text-emerald-500 shadow-sm">
            <Check className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h2 className="text-xl font-black text-text-primary">Deck Completed! 🎉</h2>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            You completed all {activeDeck.length} questions in this deck. Review the list below in a clean, flat layout.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              onClick={() => {
                setCurrentIndex(0);
                setIsDeckFinished(false);
                setShowAnswer(revealMode === 'reveal');
              }}
              variant="outline"
              size="sm"
              className="text-xs cursor-pointer font-bold gap-1 px-3 py-1.5"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Restart
            </Button>
            <Button
              onClick={() => {
                setIsConfigured(false);
                setIsDeckFinished(false);
              }}
              variant="primary"
              size="sm"
              className="text-xs cursor-pointer font-bold gap-1 px-3 py-1.5"
              leftIcon={<Settings className="w-3.5 h-3.5" />}
            >
              Configure
            </Button>
          </div>
        </div>

        {/* Flat Questions list (Flat UI without Card boundaries) */}
        <div className="space-y-6 border-t border-border-color pt-6 text-left">
          <h3 className="text-xs font-black text-text-muted uppercase tracking-wider">Review Feed</h3>
          
          <div className="space-y-8 divide-y divide-border-color/60">
            {activeDeck.map((q, idx) => (
              <div key={q.id} className="pt-6 first:pt-0 space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className="text-[10px] font-black text-accent bg-accent-soft border border-accent-soft-border/50 px-2 py-0.5 rounded-lg flex-shrink-0">
                    Q{idx + 1}
                  </span>
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-text-primary leading-snug">
                      {q.title}
                    </h4>
                    <div className="flex gap-1.5 flex-wrap text-[9px] font-bold text-text-muted uppercase">
                      <span>{q.category}</span>
                      <span>•</span>
                      <span className={
                        q.difficulty === 'Easy' ? 'text-emerald-500' :
                        q.difficulty === 'Medium' ? 'text-amber-500' : 'text-rose-500'
                      }>{q.difficulty}</span>
                    </div>
                  </div>
                </div>

                {/* Flat details content */}
                <div className="space-y-3 pl-1 text-xs">
                  <div
                    dangerouslySetInnerHTML={{ __html: q.description }}
                    className="text-text-secondary leading-relaxed space-y-2.5 [&>h2]:text-xs [&>h2]:font-bold [&>h2]:text-text-primary [&>h3]:text-[10px] [&>h3]:font-bold [&>h3]:text-text-secondary [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:space-y-0.5 [&>p>code]:font-mono [&>p>code]:bg-bg-tertiary [&>p>code]:px-1 [&>p>code]:rounded [&>ul>li>code]:font-mono [&>ul>li>code]:bg-bg-tertiary [&>ul>li>code]:px-1 [&>ul>li>code]:rounded"
                  />
                  
                  {q.example && (
                    <div className="rounded-lg overflow-hidden border border-border-color bg-[#1e1e24] dark:bg-[#0b0f19] p-3 text-[10px] font-mono text-slate-100 overflow-x-auto">
                      <div dangerouslySetInnerHTML={{ __html: q.example }} />
                    </div>
                  )}

                  {q.interviewTip && (
                    <div className="p-3 border-l-4 border-amber-500 bg-amber-500/5 text-[10px] text-text-secondary leading-relaxed flex gap-1.5 rounded-r-lg">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-600 dark:text-amber-400 block mb-0.5">Interview Tip</span>
                        <span>{q.interviewTip}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 justify-center border-t border-border-color mt-8 pt-6 pb-4">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="sm"
            className="w-full cursor-pointer text-xs font-bold"
          >
            Dashboard
          </Button>
          <Button
            onClick={() => {
              setCurrentIndex(0);
              setIsDeckFinished(false);
              setShowAnswer(revealMode === 'reveal');
            }}
            variant="primary"
            size="sm"
            className="w-full cursor-pointer text-xs font-bold"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Practice Again
          </Button>
        </div>
      </div>
    );
  };

  // 3. Card swipe / Study deck view
  const renderCardView = () => {
    const isCompleted = activeQuestion ? completedIds.includes(activeQuestion.id) : false;
    const isBookmarked = activeQuestion ? bookmarkIds.includes(activeQuestion.id) : false;

    return (
      <div className="flex-1 flex flex-col bg-bg-primary overflow-hidden relative h-full">
        {/* Floating Mini Navbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border-color bg-bg-primary flex-shrink-0 z-10">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl text-text-secondary hover:bg-bg-secondary cursor-pointer transition-all flex items-center justify-center border border-border-color/30"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-text-muted uppercase tracking-wider leading-none">Practice Deck</span>
            <span className="text-[11px] font-black text-accent mt-0.5">
              {selectedCategory === 'all' ? 'All Topics' : categories.find(c => c.id === selectedCategory)?.name || 'Custom'}
            </span>
          </div>

          <button
            onClick={() => setIsConfigured(false)}
            className="p-2 rounded-xl text-text-secondary hover:bg-bg-secondary cursor-pointer transition-all flex items-center justify-center border border-border-color/30"
            aria-label="Change Deck Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Stats progress header */}
        <div className="px-4 py-1.5 bg-bg-secondary border-b border-border-color flex justify-between items-center text-[10px] text-text-muted font-bold flex-shrink-0">
          <span>Card {currentIndex + 1} of {activeDeck.length}</span>
          <span className="flex items-center gap-1">
            <Flame className="w-3 h-3 fill-current text-orange-500" />
            <span>Streak: {streak} days</span>
          </span>
        </div>

        {/* Main card viewport */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-bg-secondary/20 p-4">

          {/* Navigation Indicators inside mockup / viewport */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-2 z-10">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-2 rounded-full border border-border-color bg-bg-primary hover:bg-bg-secondary text-text-secondary disabled:opacity-30 cursor-pointer shadow-sm"
              aria-label="Previous card"
            >
              <ChevronUp className="w-4 h-4" />
            </button>

            <button
              onClick={handleNext}
              className="p-2 rounded-full border border-border-color bg-bg-primary hover:bg-bg-secondary text-text-secondary cursor-pointer shadow-sm"
              aria-label="Next card"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Keyboard shortcut tip */}
          <div className="absolute left-4 bottom-4 hidden md:flex flex-col gap-0.5 text-[8px] text-text-muted font-bold bg-bg-primary/95 border border-border-color p-2 rounded-lg shadow-sm z-10 max-w-[130px]">
            <span><kbd className="bg-bg-tertiary px-1 py-0.5 border rounded text-[7px]">↑↓</kbd> Next/Prev</span>
            <span><kbd className="bg-bg-tertiary px-1 py-0.5 border rounded text-[7px]">Space</kbd> Answer</span>
          </div>

          {/* Swipe Stack */}
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
                className="absolute inset-x-4 inset-y-4 bg-bg-primary border border-border-color rounded-2xl shadow-lg flex flex-col overflow-hidden cursor-grab active:cursor-grabbing"
              >

                {/* Card Top Action bar */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-color bg-bg-primary flex-shrink-0">
                  <span className="text-[9px] uppercase font-black px-2.5 py-0.5 rounded-full border border-accent/25 bg-accent-soft text-accent">
                    {activeQuestion.category}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        toggleCompleted(activeQuestion.id);
                        if (!isCompleted) toast.success('Completed!');
                        else toast.info('Marked incomplete.');
                      }}
                      className={`p-1.5 rounded-lg border border-border-color hover:bg-bg-secondary transition-all cursor-pointer ${
                        isCompleted ? 'text-emerald-500 border-emerald-500/25 bg-emerald-500/5' : 'text-text-muted'
                      }`}
                      title="Mark Completed"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        toggleBookmark(activeQuestion.id);
                        if (!isBookmarked) toast.success('Saved!');
                        else toast.info('Removed bookmark.');
                      }}
                      className={`p-1.5 rounded-lg border border-border-color hover:bg-bg-secondary transition-all cursor-pointer ${
                        isBookmarked ? 'text-yellow-500 bg-yellow-500/5 border-yellow-500/20' : 'text-text-muted'
                      }`}
                      title="Bookmark Card"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Card Main Body */}
                <div
                  ref={scrollContainerRef}
                  className="flex-1 overflow-y-auto p-5 space-y-4 flex flex-col justify-between"
                >

                  {/* Question Title & Meta */}
                  <div className="space-y-3 text-left">
                    <div className="flex gap-1.5 flex-wrap">
                      <DifficultyBadge difficulty={activeQuestion.difficulty} />
                      <FrequencyBadge frequency={activeQuestion.frequency} />
                    </div>

                    <h2 className="text-lg font-black text-text-primary leading-snug">
                      {activeQuestion.title}
                    </h2>

                    {activeQuestion.companies && activeQuestion.companies.length > 0 && (
                      <div className="text-[10px] text-text-muted leading-relaxed">
                        Asked by: <span className="font-semibold text-text-secondary">{activeQuestion.companies.slice(0, 3).join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Answer / Reveal section */}
                  <div className="pt-4 flex-1 flex flex-col justify-end">
                    {!showAnswer ? (
                      <Button
                        variant="primary"
                        className="w-full py-3.5 text-xs font-bold shadow-md shadow-accent/10 cursor-pointer justify-center gap-1.5 mt-6"
                        leftIcon={<Sparkles className="w-4 h-4 fill-current animate-pulse" />}
                        onClick={() => setShowAnswer(true)}
                      >
                        Reveal Answer Explanation
                      </Button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3 mt-2 text-left"
                      >
                        {/* Tabs Bar */}
                        <div className="flex border-b border-border-color gap-1 sticky top-0 bg-bg-primary z-10 pb-0.5">
                          {[
                            { id: 'explanation', label: 'Explanation', icon: <BookOpen className="w-3 h-3" /> },
                            { id: 'code', label: 'Code', icon: <FileCode className="w-3 h-3" /> },
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id as any)}
                              className={`flex items-center gap-1 px-2.5 py-1.5 border-b-2 text-[10px] font-black transition-all cursor-pointer ${
                                activeTab === tab.id
                                  ? 'border-accent text-accent'
                                  : 'border-transparent text-text-secondary hover:text-text-primary'
                              }`}
                            >
                              {tab.icon}
                              <span>{tab.label}</span>
                            </button>
                          ))}
                        </div>

                        {/* Explanation Content */}
                        <div className="space-y-3">
                          {activeTab === 'explanation' && (
                            <div className="space-y-3">
                              <div
                                dangerouslySetInnerHTML={{ __html: activeQuestion.description }}
                                className="text-xs text-text-secondary leading-relaxed space-y-2.5 [&>h2]:text-xs [&>h2]:font-bold [&>h2]:text-text-primary [&>h3]:text-[10px] [&>h3]:font-bold [&>h3]:text-text-secondary [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:space-y-0.5 [&>p>code]:font-mono [&>p>code]:bg-bg-tertiary [&>p>code]:px-1 [&>p>code]:rounded [&>ul>li>code]:font-mono [&>ul>li>code]:bg-bg-tertiary [&>ul>li>code]:px-1 [&>ul>li>code]:rounded"
                              />
                              {activeQuestion.interviewTip && (
                                <div className="p-3 border-l-4 border-amber-500 bg-amber-500/5 text-[10px] text-text-secondary leading-relaxed flex gap-1.5 rounded-r-lg">
                                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-bold text-amber-600 dark:text-amber-400 block mb-0.5">Interview Tip</span>
                                    <span>{activeQuestion.interviewTip}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {activeTab === 'code' && (
                            <div className="space-y-2">
                              {activeQuestion.example ? (
                                <div className="rounded-lg overflow-hidden border border-border-color bg-[#1e1e24] dark:bg-[#0b0f19] p-3 text-[10px] font-mono text-slate-100 overflow-x-auto">
                                  <div dangerouslySetInnerHTML={{ __html: activeQuestion.example }} />
                                </div>
                              ) : (
                                <span className="text-[10px] text-text-muted italic block py-3 text-center">No code block defined.</span>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>

                </div>

                {/* Progress Tracker deck indicator */}
                <div className="px-4 py-2.5 bg-bg-secondary border-t border-border-color flex justify-between items-center text-[9px] text-text-muted font-bold flex-shrink-0">
                  <span>Drag card or use arrows</span>
                  <button
                    onClick={handleNext}
                    className="text-accent hover:text-accent-hover flex items-center gap-0.5 cursor-pointer font-black"
                  >
                    <span>{currentIndex === activeDeck.length - 1 ? 'Finish' : 'Next'}</span>
                    <ChevronDown className="w-3.5 h-3.5 -rotate-90 ml-0.5" />
                  </button>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  // Master router function
  const renderContent = () => {
    if (!isConfigured) {
      return renderSetupView();
    }
    if (isDeckFinished) {
      return renderCompletionView();
    }
    return renderCardView();
  };

  // Mobile View
  if (isMobile) {
    return (
      <div className="h-[100dvh] w-full flex flex-col bg-bg-primary overflow-hidden">
        {renderContent()}
      </div>
    );
  }

  // Desktop Mockup Simulator View
  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-6 text-slate-100 overflow-hidden font-sans">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Info Side */}
        <div className="space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Mobile-Optimized Experience</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Interactive <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Swipe Cards</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Designed specifically for quick, vertical swiping on mobile screens. We've loaded the interactive mobile view inside the simulator frame for desktop preview.
          </p>
          
          <div className="space-y-3.5 border-t border-slate-800 pt-6">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">Desktop Keyboard Controls</h3>
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-400 text-left">
              <div className="flex items-center gap-2.5">
                <kbd className="bg-slate-800 text-slate-200 px-2 py-1 rounded border border-slate-700 min-w-8 text-center">↑ / ↓</kbd>
                <span>Prev / Next Card</span>
              </div>
              <div className="flex items-center gap-2.5">
                <kbd className="bg-slate-800 text-slate-200 px-2 py-1 rounded border border-slate-700 min-w-[65px] text-center">Spacebar</kbd>
                <span>Reveal Answer</span>
              </div>
              <div className="flex items-center gap-2.5">
                <kbd className="bg-slate-800 text-slate-200 px-2 py-1 rounded border border-slate-700 min-w-8 text-center">B</kbd>
                <span>Toggle Bookmark</span>
              </div>
              <div className="flex items-center gap-2.5">
                <kbd className="bg-slate-800 text-slate-200 px-2 py-1 rounded border border-slate-700 min-w-8 text-center">C</kbd>
                <span>Toggle Complete</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Link to="/">
              <Button variant="outline" className="border-slate-800 hover:bg-slate-900 text-slate-300 hover:text-white cursor-pointer px-6">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Simulator Side */}
        <div className="flex justify-center items-center">
          {/* Phone Shell */}
          <div className="relative w-[375px] h-[780px] rounded-[52px] border-[14px] border-slate-900 bg-bg-primary shadow-2xl overflow-hidden flex flex-col scale-95 lg:scale-100 transition-transform">
            {/* Dynamic Island / Speaker Bezel */}
            <div className="absolute top-0 inset-x-0 h-7 bg-slate-900 flex justify-center items-center z-50">
              <div className="w-24 h-4 bg-black rounded-full mt-1.5 flex items-center justify-between px-3">
                <div className="w-1.5 h-1.5 bg-blue-900 rounded-full" />
                <div className="w-12 h-1 bg-slate-800 rounded-full" />
              </div>
            </div>
            
            {/* Simulator Screen Content */}
            <div className="flex-1 mt-7 relative bg-bg-primary overflow-hidden text-text-primary flex flex-col h-[calc(100%-1.75rem)]">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

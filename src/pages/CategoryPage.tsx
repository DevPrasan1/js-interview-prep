import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCategoryById, getQuestionsByCategory } from '../utils/questions';
import { useStore } from '../store/useStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { DifficultyBadge, FrequencyBadge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { toast } from '../components/Toast';
import {
  ArrowLeft,
  Clock,
  Search,
  Bookmark,
  CheckSquare,
  Square,
  ChevronRight,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CategoryPage() {
  const { category: categorySlug } = useParams<{ category: string }>();
  const navigate = useNavigate();

  const category = getCategoryById(categorySlug || '');
  const allCategoryQuestions = useMemo(() => {
    return getQuestionsByCategory(categorySlug || '');
  }, [categorySlug]);

  const completedIds = useStore((state) => state.completedQuestionIds);
  const bookmarkIds = useStore((state) => state.bookmarkedQuestionIds);
  const toggleBookmark = useStore((state) => state.toggleBookmark);
  const toggleCompleted = useStore((state) => state.toggleCompleted);

  // States for search and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'difficulty-asc' | 'difficulty-desc' | 'frequency-desc'>('frequency-desc');

  // States for active filters
  const [filterDifficulty, setFilterDifficulty] = useState<string[]>([]);
  const [filterFrequency, setFilterFrequency] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [filterBookmarked, setFilterBookmarked] = useState<'all' | 'bookmarked' | 'unbookmarked'>('all');
  const [filterCompany, setFilterCompany] = useState<string[]>([]);
  const [filterTag, setFilterTag] = useState<string[]>([]);

  // Mobile Filter Drawer open state
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Extract unique companies & tags in this category for filters
  const allCompanies = useMemo(() => {
    const companiesSet = new Set<string>();
    allCategoryQuestions.forEach((q) => {
      q.companies?.forEach((c) => companiesSet.add(c));
    });
    return Array.from(companiesSet).sort();
  }, [allCategoryQuestions]);

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    allCategoryQuestions.forEach((q) => {
      q.tags?.forEach((t) => tagsSet.add(t));
    });
    return Array.from(tagsSet).sort();
  }, [allCategoryQuestions]);

  // Total reading time calculation (e.g. "3 minutes" -> parse 3)
  const totalReadTimeMinutes = useMemo(() => {
    let total = 0;
    allCategoryQuestions.forEach((q) => {
      const mins = parseInt(q.estimatedReadTime, 10);
      if (!isNaN(mins)) total += mins;
    });
    return total;
  }, [allCategoryQuestions]);

  // Overall category completed stats
  const totalQuestions = allCategoryQuestions.length;
  const completedCount = allCategoryQuestions.filter((q) => completedIds.includes(q.id)).length;
  const progressPercent = totalQuestions > 0 ? Math.round((completedCount / totalQuestions) * 100) : 0;

  // Toggle handlers for checklists
  const toggleFilterDifficulty = (diff: string) => {
    setFilterDifficulty((prev) =>
      prev.includes(diff) ? prev.filter((d) => d !== diff) : [...prev, diff]
    );
  };

  const toggleFilterFrequency = (freq: string) => {
    setFilterFrequency((prev) =>
      prev.includes(freq) ? prev.filter((f) => f !== freq) : [...prev, freq]
    );
  };

  const toggleFilterCompany = (comp: string) => {
    setFilterCompany((prev) =>
      prev.includes(comp) ? prev.filter((c) => c !== comp) : [...prev, comp]
    );
  };

  const toggleFilterTag = (tag: string) => {
    setFilterTag((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const resetAllFilters = () => {
    setFilterDifficulty([]);
    setFilterFrequency([]);
    setFilterStatus('all');
    setFilterBookmarked('all');
    setFilterCompany([]);
    setFilterTag([]);
    setSearchQuery('');
  };

  // Filter & Sort core logic
  const filteredAndSortedQuestions = useMemo(() => {
    let result = [...allCategoryQuestions];

    // 1. Text Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (q) =>
          q.title.toLowerCase().includes(query) ||
          q.description.toLowerCase().includes(query) ||
          q.tags.some((t) => t.toLowerCase().includes(query)) ||
          q.companies.some((c) => c.toLowerCase().includes(query))
      );
    }

    // 2. Difficulty Filter
    if (filterDifficulty.length > 0) {
      result = result.filter((q) => filterDifficulty.includes(q.difficulty));
    }

    // 3. Frequency Filter
    if (filterFrequency.length > 0) {
      result = result.filter((q) => filterFrequency.includes(q.frequency));
    }

    // 4. Status Filter
    if (filterStatus === 'completed') {
      result = result.filter((q) => completedIds.includes(q.id));
    } else if (filterStatus === 'incomplete') {
      result = result.filter((q) => !completedIds.includes(q.id));
    }

    // 5. Bookmark Filter
    if (filterBookmarked === 'bookmarked') {
      result = result.filter((q) => bookmarkIds.includes(q.id));
    } else if (filterBookmarked === 'unbookmarked') {
      result = result.filter((q) => !bookmarkIds.includes(q.id));
    }

    // 6. Companies Filter
    if (filterCompany.length > 0) {
      result = result.filter((q) => q.companies.some((c) => filterCompany.includes(c)));
    }

    // 7. Tags Filter
    if (filterTag.length > 0) {
      result = result.filter((q) => q.tags.some((t) => filterTag.includes(t)));
    }

    // 8. Sorting
    result.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      
      if (sortBy === 'difficulty-asc' || sortBy === 'difficulty-desc') {
        const order = { Easy: 1, Medium: 2, Hard: 3 };
        const diffA = order[a.difficulty];
        const diffB = order[b.difficulty];
        return sortBy === 'difficulty-asc' ? diffA - diffB : diffB - diffA;
      }

      if (sortBy === 'frequency-desc') {
        const order = { Low: 1, Medium: 2, High: 3, 'Very High': 4 };
        const freqA = order[a.frequency];
        const freqB = order[b.frequency];
        return freqB - freqA; // High to Low
      }

      return 0;
    });

    return result;
  }, [
    allCategoryQuestions,
    searchQuery,
    filterDifficulty,
    filterFrequency,
    filterStatus,
    filterBookmarked,
    filterCompany,
    filterTag,
    sortBy,
    completedIds,
    bookmarkIds,
  ]);

  const handleBookmarkToggle = (id: number, title: string) => {
    toggleBookmark(id);
    const isBookmarked = bookmarkIds.includes(id);
    if (!isBookmarked) toast.success(`Bookmarked: ${title}`);
    else toast.info(`Removed bookmark: ${title}`);
  };

  const handleCompletedToggle = (id: number, title: string) => {
    toggleCompleted(id);
    const isCompleted = completedIds.includes(id);
    if (!isCompleted) toast.success(`Completed: ${title}`);
    else toast.info(`Marked incomplete: ${title}`);
  };

  if (!category) {
    return (
      <EmptyState
        title="Category Not Found"
        description="The requested interview preparation category does not exist."
        actionText="Back to Dashboard"
        onAction={() => navigate('/')}
      />
    );
  }

  // Render Filter Sidebar Panel
  const renderFiltersContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-2 border-b border-border-color">
        <span className="font-bold text-sm text-text-primary uppercase tracking-wider">Filters</span>
        <button
          onClick={resetAllFilters}
          className="text-xs text-accent hover:underline font-semibold cursor-pointer"
        >
          Reset All
        </button>
      </div>

      {/* Difficulty Filter */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-text-secondary uppercase">Difficulty</h4>
        <div className="space-y-1.5">
          {['Easy', 'Medium', 'Hard'].map((diff) => (
            <label key={diff} className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer hover:text-text-primary">
              <input
                type="checkbox"
                checked={filterDifficulty.includes(diff)}
                onChange={() => toggleFilterDifficulty(diff)}
                className="rounded border-border-color text-accent focus:ring-accent w-4 h-4 cursor-pointer"
              />
              <span>{diff}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Frequency Filter */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-text-secondary uppercase">Ask Frequency</h4>
        <div className="space-y-1.5">
          {['Low', 'Medium', 'High', 'Very High'].map((freq) => (
            <label key={freq} className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer hover:text-text-primary">
              <input
                type="checkbox"
                checked={filterFrequency.includes(freq)}
                onChange={() => toggleFilterFrequency(freq)}
                className="rounded border-border-color text-accent focus:ring-accent w-4 h-4 cursor-pointer"
              />
              <span>{freq}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-text-secondary uppercase">Practice Status</h4>
        <div className="space-y-1.5">
          {[
            { id: 'all', label: 'All Questions' },
            { id: 'completed', label: 'Completed' },
            { id: 'incomplete', label: 'Incomplete' },
          ].map((opt) => (
            <label key={opt.id} className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer hover:text-text-primary">
              <input
                type="radio"
                name="filterStatus"
                checked={filterStatus === opt.id}
                onChange={() => setFilterStatus(opt.id as any)}
                className="border-border-color text-accent focus:ring-accent w-4 h-4 cursor-pointer"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Bookmark Filter */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-text-secondary uppercase">Saved State</h4>
        <div className="space-y-1.5">
          {[
            { id: 'all', label: 'All' },
            { id: 'bookmarked', label: 'Bookmarked' },
            { id: 'unbookmarked', label: 'Not Bookmarked' },
          ].map((opt) => (
            <label key={opt.id} className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer hover:text-text-primary">
              <input
                type="radio"
                name="filterBookmarked"
                checked={filterBookmarked === opt.id}
                onChange={() => setFilterBookmarked(opt.id as any)}
                className="border-border-color text-accent focus:ring-accent w-4 h-4 cursor-pointer"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Companies Filter */}
      {allCompanies.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-text-secondary uppercase">Companies</h4>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {allCompanies.map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer hover:text-text-primary">
                <input
                  type="checkbox"
                  checked={filterCompany.includes(c)}
                  onChange={() => toggleFilterCompany(c)}
                  className="rounded border-border-color text-accent focus:ring-accent w-4 h-4 cursor-pointer"
                />
                <span>{c}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Tags Filter */}
      {allTags.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-text-secondary uppercase">Tags</h4>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {allTags.map((t) => (
              <label key={t} className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer hover:text-text-primary">
                <input
                  type="checkbox"
                  checked={filterTag.includes(t)}
                  onChange={() => toggleFilterTag(t)}
                  className="rounded border-border-color text-accent focus:ring-accent w-4 h-4 cursor-pointer"
                />
                <span>#{t}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent font-semibold transition-all">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Category Header */}
      <section className={`rounded-3xl bg-gradient-to-br ${category.colorClass} border p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm`}>
        <div className="space-y-3 max-w-2xl">
          <h1 className={`text-2xl sm:text-3xl font-extrabold bg-gradient-to-r ${category.textGradientClass} bg-clip-text text-transparent`}>
            {category.name} Interview Study Prep
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            {category.description}
          </p>
          
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-text-muted">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>Est. Study Time: {totalReadTimeMinutes} mins</span>
            </div>
            <span>•</span>
            <span>Total Questions: {totalQuestions}</span>
          </div>
        </div>

        {/* Progress Display */}
        <Card className="p-4 w-full md:w-52 border-border-color bg-bg-primary shadow-sm flex flex-col gap-2 flex-shrink-0">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-text-muted">Completed</span>
            <span className="text-accent">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full bg-bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-text-muted text-right font-medium">
            {completedCount} of {totalQuestions} answered
          </span>
        </Card>
      </section>

      {/* Filters & Actions Panel */}
      <section className="flex flex-col sm:flex-row gap-4 items-center justify-between sticky top-16 z-20 bg-bg-secondary py-3 border-b border-border-color">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-3 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search within this category..."
            className="w-full pl-9.5 pr-4 py-2.5 rounded-xl border border-border-color bg-bg-primary text-sm focus:outline-none focus:border-accent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-text-muted hover:text-text-primary cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sorting and Drawer Triggers */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Sorting */}
          <div className="flex items-center gap-1.5 text-xs text-text-secondary w-full sm:w-auto">
            <span className="font-semibold hidden sm:inline flex-shrink-0">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-border-color bg-bg-primary rounded-xl text-xs font-semibold focus:outline-none focus:border-accent w-full sm:w-auto cursor-pointer"
            >
              <option value="frequency-desc">Frequency (High → Low)</option>
              <option value="difficulty-asc">Difficulty (Easy → Hard)</option>
              <option value="difficulty-desc">Difficulty (Hard → Easy)</option>
              <option value="title">Alphabetical (A → Z)</option>
            </select>
          </div>

          {/* Mobile Filter Button */}
          <Button
            variant="outline"
            className="lg:hidden flex items-center gap-2 cursor-pointer flex-shrink-0 px-3"
            onClick={() => setIsFilterDrawerOpen(true)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </Button>
        </div>
      </section>

      {/* Main Split Layout: Filter Sidebar (Left) vs Questions List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Desktop Filter Panel */}
        <aside className="hidden lg:block lg:col-span-1 bg-bg-primary p-5 border border-border-color rounded-2xl h-fit sticky top-36">
          {renderFiltersContent()}
        </aside>

        {/* Right Side: Questions list */}
        <div className="lg:col-span-3 space-y-4">
          <div className="text-xs text-text-muted font-bold flex justify-between items-center mb-2">
            <span>Showing {filteredAndSortedQuestions.length} of {totalQuestions} questions</span>
          </div>

          {filteredAndSortedQuestions.length === 0 ? (
            <EmptyState
              title="No questions match filters"
              description="Try adjusting or clearing your search queries or filter selections."
              actionText="Reset Filters"
              onAction={resetAllFilters}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredAndSortedQuestions.map((q, idx) => {
                const isCompleted = completedIds.includes(q.id);
                const isBookmarked = bookmarkIds.includes(q.id);

                return (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.04, 0.4) }}
                  >
                    <Card
                      hoverEffect
                      className="p-5 flex flex-col sm:flex-row items-start justify-between gap-4 border border-border-color bg-bg-primary"
                    >
                      <div className="space-y-3 flex-1">
                        {/* Difficulty & Frequency Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <DifficultyBadge difficulty={q.difficulty} />
                          <FrequencyBadge frequency={q.frequency} />
                          {q.tags && q.tags.slice(0, 2).map((t) => (
                            <span key={t} className="text-[10px] text-text-muted font-medium bg-bg-secondary px-1.5 py-0.5 rounded-md border border-border-color">
                              #{t}
                            </span>
                          ))}
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-base sm:text-lg text-text-primary hover:text-accent transition-colors">
                          <Link to={`/question/${q.id}`}>{q.title}</Link>
                        </h3>

                        {/* Meta information */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{q.estimatedReadTime} read</span>
                          </div>
                          {q.companies && q.companies.length > 0 && (
                            <div className="truncate max-w-[200px] sm:max-w-md">
                              Asked by: <span className="font-semibold text-text-secondary">{q.companies.slice(0, 3).join(', ')}</span>
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
                            aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
                            className={`p-2 rounded-xl border border-border-color hover:bg-bg-secondary text-text-secondary transition-all cursor-pointer ${
                              isCompleted ? 'text-emerald-500 border-emerald-500/25 bg-emerald-500/5' : ''
                            }`}
                          >
                            {isCompleted ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                          </button>

                          {/* Bookmark Toggle */}
                          <button
                            onClick={() => handleBookmarkToggle(q.id, q.title)}
                            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                            className={`p-2 rounded-xl border border-border-color hover:bg-bg-secondary transition-all cursor-pointer ${
                              isBookmarked ? 'text-yellow-500 bg-yellow-500/5 border-yellow-500/20' : 'text-text-muted'
                            }`}
                          >
                            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                          </button>
                        </div>

                        <Link to={`/question/${q.id}`} className="w-full sm:w-auto">
                          <Button variant="ghost" size="sm" className="w-full text-xs font-semibold gap-1 pr-2 cursor-pointer">
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
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer Overlay */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterDrawerOpen(false)}
              className="fixed inset-0 bg-black"
            />
            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="relative w-80 bg-bg-primary h-full shadow-2xl flex flex-col z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-border-color">
                <h3 className="font-bold text-base text-text-primary">Advanced Filters</h3>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-text-secondary hover:bg-bg-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Filters */}
              <div className="flex-1 overflow-y-auto p-5">
                {renderFiltersContent()}
              </div>

              {/* Actions Footer */}
              <div className="p-4 border-t border-border-color bg-bg-secondary flex gap-2">
                <Button
                  variant="primary"
                  className="w-full cursor-pointer"
                  onClick={() => setIsFilterDrawerOpen(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

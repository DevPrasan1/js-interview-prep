import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import { getAllQuestions, getCategoryById } from '../utils/questions';
import type { Question } from '../types';
import { Search, X, CornerDownLeft, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const navigate = useNavigate();
  const allQuestions = useMemo(() => getAllQuestions(), []);
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Question[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(allQuestions, {
      keys: [
        { name: 'title', weight: 0.5 },
        { name: 'category', weight: 0.2 },
        { name: 'tags', weight: 0.15 },
        { name: 'companies', weight: 0.1 },
        { name: 'description', weight: 0.05 }
      ],
      threshold: 0.35,
      ignoreLocation: true
    });
  }, [allQuestions]);

  // Handle fuzzy searching when query changes
  useEffect(() => {
    if (!query.trim()) {
      // If empty, show some featured popular questions by default
      setResults(allQuestions.slice(0, 5));
      setSelectedIndex(0);
      return;
    }

    const fuseResults = fuse.search(query).map(r => r.item);
    setResults(fuseResults);
    setSelectedIndex(0);
  }, [query, fuse, allQuestions]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      document.body.style.overflow = 'hidden';
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Handle Keyboard Navigations inside search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, results.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % Math.max(1, results.length));
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault();
        handleSelect(results[selectedIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  const handleSelect = (id: number) => {
    navigate(`/question/${id}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Panel container */}
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-xl bg-bg-primary border border-border-color rounded-2xl shadow-2xl flex flex-col max-h-[60vh] overflow-hidden z-10"
          >
            {/* Input Header bar */}
            <div className="flex items-center px-4 border-b border-border-color h-14 bg-bg-primary gap-3 flex-shrink-0">
              <Search className="w-5 h-5 text-text-muted flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search questions, categories, tags..."
                className="flex-1 bg-transparent border-0 text-sm focus:!outline-none focus-visible:!outline-none placeholder-text-muted text-text-primary h-full"
              />
              <button
                onClick={onClose}
                aria-label="Close search"
                className="p-1 rounded-lg text-text-muted hover:bg-bg-secondary hover:text-text-primary cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results body */}
            <div className="flex-1 overflow-y-auto p-2">
              <div className="px-3 py-2 text-[10px] uppercase font-bold text-text-muted flex items-center gap-1">
                <span>{query ? 'Search Results' : 'Recommended Questions'}</span>
                {!query && <Sparkles className="w-3 h-3 text-yellow-500 fill-current" />}
              </div>

              {results.length === 0 ? (
                <div className="p-8 text-center text-xs text-text-muted italic">
                  No matching questions found for "{query}".
                </div>
              ) : (
                <div className="space-y-1">
                  {results.map((q, idx) => {
                    const cat = getCategoryById(q.category.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                    const isSelected = idx === selectedIndex;

                    return (
                      <div
                        key={q.id}
                        onClick={() => handleSelect(q.id)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? 'bg-accent text-white shadow-sm shadow-accent/15'
                            : 'hover:bg-bg-secondary text-text-primary'
                        }`}
                      >
                        <div className="space-y-1 flex-1 min-w-0 mr-3">
                          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border inline-block ${
                            isSelected
                              ? 'bg-white/20 border-white/20 text-white'
                              : cat?.colorClass || 'bg-bg-tertiary border-border-color text-text-secondary'
                          }`}>
                            {q.category}
                          </span>
                          <span className="font-bold text-xs sm:text-sm block truncate">
                            {q.title}
                          </span>
                        </div>

                        {/* Selected Indicator */}
                        {isSelected && (
                          <span className="text-[10px] font-medium bg-white/20 px-2 py-1 rounded-md flex items-center gap-1 text-white">
                            <span>Open</span>
                            <CornerDownLeft className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer keyboard help banner */}
            <div className="px-4 py-2 border-t border-border-color bg-bg-secondary flex justify-between items-center text-[10px] text-text-muted font-medium flex-shrink-0">
              <div className="flex gap-3">
                <span><kbd className="bg-bg-primary px-1 py-0.5 border border-border-color rounded shadow-sm text-text-primary">↑↓</kbd> Navigate</span>
                <span><kbd className="bg-bg-primary px-1 py-0.5 border border-border-color rounded shadow-sm text-text-primary">Enter</kbd> Open</span>
              </div>
              <span><kbd className="bg-bg-primary px-1 py-0.5 border border-border-color rounded shadow-sm text-text-primary">Esc</kbd> Close</span>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useStore } from '../store/useStore';
import { getQuestionById, getCategoryById } from '../utils/questions';
import {
  LayoutDashboard,
  Bookmark,
  BarChart3,
  Settings,
  Info,
  Search,
  Sun,
  Moon,
  Laptop,
  Menu,
  X,
  ChevronRight,
  Flame,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: string | number;
  badgeColor?: string;
  onClick?: () => void;
}

function SidebarLink({ to, icon, label, badge, badgeColor = 'bg-accent/15 text-accent', onClick }: SidebarLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium ${
        isActive
          ? 'bg-accent text-white shadow-md shadow-accent/20'
          : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`transition-transform duration-200 group-hover:scale-105`}>
          {icon}
        </span>
        <span>{label}</span>
      </div>
      {badge !== undefined && (
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${isActive ? 'bg-white/20 text-white' : badgeColor}`}>
          {badge}
        </span>
      )}
    </Link>
  );
}

export default function MainLayout({ children, onSearchTrigger }: { children: React.ReactNode; onSearchTrigger: () => void }) {
  useTheme();
  const location = useLocation();

  const theme = useStore((state) => state.theme);
  const setTheme = useStore((state) => state.setTheme);
  const fontSize = useStore((state) => state.fontSize);
  const compactMode = useStore((state) => state.compactMode);

  const completedCount = useStore((state) => state.completedQuestionIds.length);
  const bookmarkCount = useStore((state) => state.bookmarkedQuestionIds.length);
  const streak = useStore((state) => state.studyStreak);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<{ label: string; to?: string }[]>([]);

  // Calculate Breadcrumbs dynamically
  useEffect(() => {
    const paths = location.pathname.split('/').filter(Boolean);
    const crumbs: { label: string; to?: string }[] = [{ label: 'Dashboard', to: '/' }];

    if (paths[0] === 'category' && paths[1]) {
      const cat = getCategoryById(paths[1]);
      if (cat) {
        crumbs.push({ label: cat.name });
      } else {
        crumbs.push({ label: paths[1].toUpperCase() });
      }
    } else if (paths[0] === 'question' && paths[1]) {
      const qId = parseInt(paths[1], 10);
      const q = getQuestionById(qId);
      if (q) {
        const cat = getCategoryById(q.category.toLowerCase().replace(/[^a-z0-9]/g, '-'));
        if (cat) {
          crumbs.push({ label: cat.name, to: `/category/${cat.id}` });
        }
        crumbs.push({ label: q.title });
      } else {
        crumbs.push({ label: 'Question Details' });
      }
    } else if (paths[0] === 'bookmarks') {
      crumbs.push({ label: 'Bookmarks' });
    } else if (paths[0] === 'progress') {
      crumbs.push({ label: 'Progress & Analytics' });
    } else if (paths[0] === 'settings') {
      crumbs.push({ label: 'Settings' });
    } else if (paths[0] === 'about') {
      crumbs.push({ label: 'About' });
    }

    setBreadcrumbs(crumbs);
  }, [location.pathname]);

  // Handle Keyboard Shortcut for Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        e.preventDefault();
        onSearchTrigger();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearchTrigger]);

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const getThemeIcon = () => {
    if (theme === 'light') return <Sun className="w-5 h-5" />;
    if (theme === 'dark') return <Moon className="w-5 h-5" />;
    return <Laptop className="w-5 h-5" />;
  };

  const fontSizeClass = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  }[fontSize];

  return (
    <div className={`min-h-screen flex flex-col md:flex-row bg-bg-secondary ${fontSizeClass} transition-all duration-200`}>
      
      {/* Mobile Top Navbar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-bg-primary border-b border-border-color sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open sidebar"
            className="p-1.5 rounded-lg text-text-secondary hover:bg-bg-tertiary focus:outline-none"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-accent">
            <BookOpen className="w-6 h-6 text-accent fill-accent/10" />
            <span>Frontend Prep</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onSearchTrigger}
            aria-label="Search questions"
            className="p-2 rounded-xl text-text-secondary hover:bg-bg-tertiary transition-all"
          >
            <Search className="w-5 h-5" />
          </button>
          
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-text-secondary hover:bg-bg-tertiary transition-all"
          >
            {getThemeIcon()}
          </button>
        </div>
      </header>

      {/* Backdrop for mobile sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Component */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-bg-primary border-r border-border-color flex flex-col transform md:transform-none transition-transform duration-300 ease-in-out md:sticky md:top-0 md:h-screen ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="h-16 px-6 border-b border-border-color flex items-center justify-between bg-bg-primary sticky top-0 z-10">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-xl text-accent">
            <BookOpen className="w-6 h-6 text-accent fill-accent/10" />
            <span>Frontend Prep</span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
            className="p-1.5 rounded-lg text-text-secondary hover:bg-bg-tertiary md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Quick Stats Widget */}
        <div className="p-4 mx-4 my-4 bg-bg-secondary border border-border-color rounded-2xl flex items-center justify-around gap-2 shadow-sm">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-orange-500 font-bold text-lg">
              <Flame className="w-5 h-5 fill-current" />
              <span>{streak}</span>
            </div>
            <span className="text-xs text-text-muted mt-0.5 font-medium">Day Streak</span>
          </div>
          
          <div className="w-px h-8 bg-border-color" />
          
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-lg">
              <CheckCircle2 className="w-5 h-5" />
              <span>{completedCount}</span>
            </div>
            <span className="text-xs text-text-muted mt-0.5 font-medium">Completed</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          <SidebarLink
            to="/"
            icon={<LayoutDashboard className="w-5 h-5" />}
            label="Dashboard"
            onClick={() => setIsSidebarOpen(false)}
          />
          <SidebarLink
            to="/bookmarks"
            icon={<Bookmark className="w-5 h-5" />}
            label="Bookmarks"
            badge={bookmarkCount > 0 ? bookmarkCount : undefined}
            badgeColor="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
            onClick={() => setIsSidebarOpen(false)}
          />
          <SidebarLink
            to="/progress"
            icon={<BarChart3 className="w-5 h-5" />}
            label="Analytics"
            onClick={() => setIsSidebarOpen(false)}
          />
          <SidebarLink
            to="/settings"
            icon={<Settings className="w-5 h-5" />}
            label="Settings"
            onClick={() => setIsSidebarOpen(false)}
          />
          <SidebarLink
            to="/about"
            icon={<Info className="w-5 h-5" />}
            label="About Hub"
            onClick={() => setIsSidebarOpen(false)}
          />
        </nav>

        {/* Sidebar Footer / Theme Selector */}
        <div className="p-4 border-t border-border-color bg-bg-primary flex items-center justify-between">
          <div className="text-xs text-text-muted font-medium">
            Theme: <span className="capitalize font-semibold text-text-secondary">{theme}</span>
          </div>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-text-secondary hover:bg-bg-tertiary transition-all focus:outline-none"
          >
            {getThemeIcon()}
          </button>
        </div>
      </aside>

      {/* Main Panel Viewport */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Header / Breadcrumb navigation */}
        <header className="hidden md:flex h-16 items-center justify-between px-8 bg-bg-primary border-b border-border-color sticky top-0 z-30 shadow-sm">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-text-secondary">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />}
                {crumb.to ? (
                  <Link
                    to={crumb.to}
                    className="hover:text-accent font-medium transition-all truncate max-w-[120px] lg:max-w-[200px]"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-text-primary truncate max-w-[150px] lg:max-w-[300px]">
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-4">
            {/* Search Trigger */}
            <button
              onClick={onSearchTrigger}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border-color bg-bg-secondary hover:bg-bg-tertiary transition-all duration-200 text-sm text-text-muted w-48 focus:outline-none"
            >
              <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
              <span className="flex-1 text-left">Search (Press /)</span>
            </button>

            {/* Quick stats streak indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 font-bold text-sm">
              <Flame className="w-4 h-4 fill-current" />
              <span>{streak} Day Streak</span>
            </div>

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-text-secondary hover:bg-bg-tertiary border border-border-color hover:text-text-primary transition-all duration-200 focus:outline-none"
            >
              {getThemeIcon()}
            </button>
          </div>
        </header>

        {/* Content Container */}
        <div className={`flex-1 overflow-y-auto ${compactMode ? 'p-4 md:p-6' : 'p-6 md:p-8'}`}>
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

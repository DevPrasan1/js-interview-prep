import { useState, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { ToastContainer } from './components/Toast';
import SearchModal from './components/SearchModal';
import { ListItemSkeleton } from './components/Skeleton';

// Lazy load page components for performance optimization & route splitting
const Home = lazy(() => import('./pages/Home'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const QuestionPage = lazy(() => import('./pages/QuestionPage'));
const BookmarksPage = lazy(() => import('./pages/BookmarksPage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ShortsPage = lazy(() => import('./pages/ShortsPage'));

// Fallback Loading placeholder for Suspense
function PageLoader() {
  return (
    <div className="space-y-4 max-w-4xl mx-auto py-10 animate-pulse">
      <div className="h-10 bg-bg-tertiary rounded-xl w-1/3 mb-6" />
      <div className="h-40 bg-bg-tertiary rounded-2xl w-full" />
      <div className="space-y-3 pt-6">
        <ListItemSkeleton />
        <ListItemSkeleton />
        <ListItemSkeleton />
      </div>
    </div>
  );
}

function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleOpenSearch = () => setIsSearchOpen(true);
  const handleCloseSearch = () => setIsSearchOpen(false);

  return (
    <Router>
      <MainLayout onSearchTrigger={handleOpenSearch}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home onSearchTrigger={handleOpenSearch} />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/question/:id" element={<QuestionPage />} />
            <Route path="/shorts" element={<ShortsPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/progress" element={<StatsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/about" element={<AboutPage />} />
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </MainLayout>

      {/* Global Modals & Notifications */}
      <SearchModal isOpen={isSearchOpen} onClose={handleCloseSearch} />
      <ToastContainer />
    </Router>
  );
}

export default App;

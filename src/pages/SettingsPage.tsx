import { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { toast } from '../components/Toast';
import {
  Sun,
  Moon,
  Laptop,
  Type,
  Gauge,
  Sparkles,
  RotateCcw,
  Download,
  Upload,
  AlertTriangle
} from 'lucide-react';

export default function SettingsPage() {
  const {
    theme,
    fontSize,
    compactMode,
    animationsEnabled,
    setTheme,
    setFontSize,
    setCompactMode,
    setAnimationsEnabled,
    resetProgress,
    importProgress,
    completedQuestionIds,
    bookmarkedQuestionIds,
    recentlyViewedIds,
    studyStreak,
    lastStudyDate,
    dailyCompletionHistory,
  } = useStore();

  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Export Progress
  const handleExport = () => {
    try {
      const data = {
        completedQuestionIds,
        bookmarkedQuestionIds,
        recentlyViewedIds,
        studyStreak,
        lastStudyDate,
        dailyCompletionHistory,
        exportedAt: new Date().toISOString(),
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `frontend-prep-progress-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Progress file exported successfully!');
    } catch (e) {
      toast.error('Failed to export progress data.');
    }
  };

  // Handle Import Progress
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Basic schema verification
        if (
          Array.isArray(data.completedQuestionIds) &&
          Array.isArray(data.bookmarkedQuestionIds)
        ) {
          importProgress({
            completedQuestionIds: data.completedQuestionIds,
            bookmarkedQuestionIds: data.bookmarkedQuestionIds,
            recentlyViewedIds: data.recentlyViewedIds || [],
            studyStreak: typeof data.studyStreak === 'number' ? data.studyStreak : 0,
            lastStudyDate: data.lastStudyDate || null,
            dailyCompletionHistory: data.dailyCompletionHistory || [],
          });
          toast.success('Study progress imported successfully!');
        } else {
          toast.error('Invalid backup file structure.');
        }
      } catch (err) {
        toast.error('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset input
    }
  };

  // Trigger file upload dialogue
  const triggerImportClick = () => {
    fileInputRef.current?.click();
  };

  // Handle Purge/Reset Progress
  const handleConfirmReset = () => {
    resetProgress();
    setShowConfirmReset(false);
    toast.success('Your study progress has been reset.');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
          User Settings
        </h1>
        <p className="text-sm text-text-secondary">
          Configure interface theme, typography scale, accessibility toggles, and backup your metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Appearance Settings */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <Sun className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold text-text-primary">Interface Theme</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'light', label: 'Light Mode', icon: <Sun className="w-4 h-4" /> },
              { id: 'dark', label: 'Dark Mode', icon: <Moon className="w-4 h-4" /> },
              { id: 'system', label: 'System default', icon: <Laptop className="w-4 h-4" /> },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id as any)}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                  theme === opt.id
                    ? 'border-accent bg-accent-soft text-accent'
                    : 'border-border-color bg-transparent text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                }`}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Font Scale Settings */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <Type className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold text-text-primary">Accessibility Text Scaling</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'sm', label: 'Small (14px)' },
              { id: 'base', label: 'Default (16px)' },
              { id: 'lg', label: 'Large (18px)' },
              { id: 'xl', label: 'Extra Large (20px)' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setFontSize(opt.id as any)}
                className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                  fontSize === opt.id
                    ? 'border-accent bg-accent-soft text-accent'
                    : 'border-border-color bg-transparent text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          
          <div className="p-3 bg-bg-secondary rounded-xl text-center text-xs text-text-muted italic border border-border-color">
            Sample text showing scaling. Keep coding and studying daily!
          </div>
        </Card>

        {/* Workspace Display Toggles */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <Gauge className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold text-text-primary">Display Preferences</h2>
          </div>

          <div className="divide-y divide-border-color space-y-4">
            {/* Compact mode toggle */}
            <div className="flex items-center justify-between pb-4">
              <div className="space-y-0.5">
                <div className="font-semibold text-sm text-text-primary">Compact Mode</div>
                <div className="text-xs text-text-muted max-w-[280px] sm:max-w-md">
                  Decrease margin padding size on cards and list entries to fit more content.
                </div>
              </div>
              <button
                onClick={() => setCompactMode(!compactMode)}
                aria-label="Toggle compact mode"
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  compactMode ? 'bg-accent' : 'bg-border-color'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    compactMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Animations toggle */}
            <div className="flex items-center justify-between pt-4">
              <div className="space-y-0.5">
                <div className="font-semibold text-sm text-text-primary">UI Motion Animations</div>
                <div className="text-xs text-text-muted max-w-[280px] sm:max-w-md">
                  Enable transition fades, spring hover motions, and sidebar sliding indicators.
                </div>
              </div>
              <button
                onClick={() => setAnimationsEnabled(!animationsEnabled)}
                aria-label="Toggle motion animations"
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  animationsEnabled ? 'bg-accent' : 'bg-border-color'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    animationsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Data Sync Settings */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold text-text-primary">Data Backup & Recovery</h2>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed">
            Since your study progress runs 100% locally, clearing your browser cookies/history will reset your streak. Use these actions to export JSON backups.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1 cursor-pointer"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleExport}
            >
              Export JSON Backup
            </Button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              className="hidden"
            />
            <Button
              variant="outline"
              className="flex-1 cursor-pointer"
              leftIcon={<Upload className="w-4 h-4" />}
              onClick={triggerImportClick}
            >
              Import JSON Backup
            </Button>
          </div>
        </Card>

        {/* Danger Area */}
        <Card className="p-6 border-red-500/20 bg-red-500/5 dark:bg-red-500/5 space-y-6">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="text-lg font-bold">Danger Zone</h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <h3 className="font-semibold text-sm text-text-primary">Purge All Progress Records</h3>
              <p className="text-xs text-text-secondary leading-relaxed max-w-md">
                This will delete your study statistics, streaks, bookmarked questions, and completion flags. This action cannot be undone.
              </p>
            </div>
            
            {!showConfirmReset ? (
              <Button
                variant="danger"
                size="sm"
                className="cursor-pointer"
                leftIcon={<RotateCcw className="w-4 h-4" />}
                onClick={() => setShowConfirmReset(true)}
              >
                Reset Progress
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  className="font-bold cursor-pointer"
                  onClick={handleConfirmReset}
                >
                  Yes, Reset
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => setShowConfirmReset(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

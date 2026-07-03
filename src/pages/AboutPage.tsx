import { Card } from '../components/Card';
import { ShieldAlert, Cpu, Heart, CloudOff } from 'lucide-react';

export default function AboutPage() {
  const techStack = [
    { name: 'React 19', desc: 'Modern components and Concurrent rendering capabilities.' },
    { name: 'Vite 8', desc: 'Extremely fast build times and HMR.' },
    { name: 'TypeScript', desc: '100% type-safe codebase for production safety.' },
    { name: 'Tailwind CSS v4', desc: 'Vibrant colors, CSS-first configurations, and utility-driven styles.' },
    { name: 'Zustand', desc: 'Lightweight global store for progress and theme persistence.' },
    { name: 'Framer Motion', desc: 'Subtle micro-animations and smooth layout transitions.' },
    { name: 'Fuse.js', desc: 'Client-side fuzzy searching on categories, tags, and text contents.' },
    { name: 'Local Storage', desc: 'Full offline progress, statistics tracking, and state persistence.' }
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center md:text-left space-y-4">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary">
          About the <span className="bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">Frontend Study Hub</span>
        </h1>
        <p className="text-lg text-text-secondary">
          A production-grade, offline-capable study platform designed to prepare senior engineers for real-world frontend web development interviews.
        </p>
      </div>

      {/* Main Core Values grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-3">
          <div className="p-3 bg-accent-soft text-accent rounded-2xl w-fit">
            <CloudOff className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-text-primary">100% Offline-Capable</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            No API queries, no databases, and no cloud logins. The questions and your personal learning metrics are stored locally in your browser, running instantly even without internet access.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl w-fit">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-text-primary">Anti-Rote Learning</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Instead of dry, plain answers, every card focuses on real-world best practices, common developer traps, actual code mockups, and inside interview tips tailored to mock Big Tech rounds.
          </p>
        </Card>
      </div>

      {/* Tech Stack Breakdown */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-text-primary">Tech Stack and Architecture</h2>
        <Card className="divide-y divide-border-color">
          {techStack.map((tech, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4.5 gap-2 hover:bg-bg-secondary/40 transition-all">
              <span className="font-semibold text-accent text-sm sm:text-base flex-shrink-0 w-44">
                {tech.name}
              </span>
              <span className="text-sm text-text-secondary flex-1">
                {tech.desc}
              </span>
            </div>
          ))}
        </Card>
      </div>

      {/* Privacy Notice */}
      <Card className="p-6 bg-gradient-to-br from-accent/5 to-purple-500/5 border-accent-soft-border/30 flex flex-col sm:flex-row items-start gap-4">
        <div className="p-3 bg-accent-soft text-accent rounded-2xl w-fit flex-shrink-0">
          <Cpu className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-text-primary">Local Data & Privacy</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            Your study metrics, streaks, and progress remain completely within your own browser. We do not track you, collect cookies, or upload your data. You can back up or purge your records at any time from the settings tab.
          </p>
        </div>
      </Card>
      
      <div className="text-center text-xs text-text-muted pt-4 flex items-center justify-center gap-1.5 font-medium">
        <span>Made with</span>
        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
        <span>for frontend developers.</span>
      </div>
    </div>
  );
}

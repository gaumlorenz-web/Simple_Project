import React from 'react';
import { YouTubeMusic, YouTubeMusicHandle } from './YouTubePlayer';
import { Sparkles, Send } from 'lucide-react';

interface NavbarProps {
  ytPlayerRef: React.RefObject<YouTubeMusicHandle | null>;
  autoPlayTrigger?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  ytPlayerRef,
  autoPlayTrigger = false
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-pink-100 shadow-xs">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#"
          className="text-base sm:text-xl font-fun font-bold tracking-tight text-pink-600 hover:text-pink-700 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
        >
          <span>It&apos;s your special day!</span>
          <span className="text-sm">🎂</span>
        </a>

        {/* Zone 2: Clean Nav Links for desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="hover:text-pink-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Ivy&apos;s Celebration
          </button>

          <button
            onClick={() => {
              const el = document.querySelector('canvas');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className="hover:text-pink-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            3D Cake & Candles 🍰
          </button>

          <button
            onClick={() => {
              const el = document.querySelector('.font-script');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className="hover:text-pink-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Renz&apos;s Letter 💌
          </button>
        </nav>

        {/* Zone 3: YouTube Background Music Controller */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <YouTubeMusic
            ref={ytPlayerRef}
            videoId="nAw2ooeubSQ"
            autoPlayTrigger={autoPlayTrigger}
          />
        </div>
      </div>
    </header>
  );
};

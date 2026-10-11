import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BalloonTheme } from '../types';
import { soundEngine } from '../utils/audio';
import { popBalloonConfetti } from '../utils/confetti';
import { Sparkles } from 'lucide-react';

interface BalloonItem {
  id: string;
  xPercent: number;
  size: number;
  speed: number;
  swayDuration: number;
  color: string;
  highlightColor: string;
  stringLength: number;
  delaySec: number;
}

interface FloatingWish {
  id: string;
  x: number;
  y: number;
  text: string;
  isFading?: boolean;
}

const BALLOON_PALETTES: Record<BalloonTheme, { main: string; shine: string }[]> = {
  pastel_mix: [
    { main: '#ff85a2', shine: '#ffb3c6' },
    { main: '#c084fc', shine: '#e9d5ff' },
    { main: '#67e8f9', shine: '#cffafe' },
    { main: '#fde047', shine: '#fef08a' },
    { main: '#86efac', shine: '#bbf7d0' },
    { main: '#f472b6', shine: '#fbcfe8' }
  ],
  pink_blush: [
    { main: '#f43f5e', shine: '#fda4af' },
    { main: '#ec4899', shine: '#fbcfe8' },
    { main: '#fb7185', shine: '#fecdd3' },
    { main: '#f472b6', shine: '#fdf2f8' },
    { main: '#ff2a85', shine: '#ff85c0' }
  ],
  rainbow: [
    { main: '#ef4444', shine: '#fca5a5' },
    { main: '#f97316', shine: '#fdba74' },
    { main: '#eab308', shine: '#fef08a' },
    { main: '#22c55e', shine: '#86efac' },
    { main: '#06b6d4', shine: '#67e8f9' },
    { main: '#8b5cf6', shine: '#c4b5fd' }
  ],
  golden_party: [
    { main: '#f59e0b', shine: '#fef3c7' },
    { main: '#d97706', shine: '#fde68a' },
    { main: '#fbbf24', shine: '#fffbeb' },
    { main: '#fb7185', shine: '#ffe4e6' },
    { main: '#ea580c', shine: '#fed7aa' }
  ]
};

const SURPRISE_WISHES = [
  // Birthday Celebration Wishes
  "Happy 20th Birthday, Ivy! 🎂",
  "Welcome to your 20s! HAHAHA 😆",
  "Live your happiest life! ✨",
  "Achieve all your goals! 🌟",
  "Celebrate with all your heart! 🎉",
  "Age is just a number! 🎈",
  "More wins in life, Ivy! 🏆",
  "Eat all the cake, Ivy! 🍰",
  "With best wishes from Renz! 💌",
  "Cheers to you, Ivy! 🥂",
  
  // Simple Heartwarming Motivations
  "Believe in yourself, always! 🌟",
  "You are capable of amazing things! ✨",
  "Take it one step at a time, you're doing great! 🌿",
  "Keep shining bright, Ivy! 💫",
  "Your best chapter has just begun! 🚀",
  "Trust your own journey and pace! 🌸",
  "Never doubt your inner strength! 💪",
  "Be kind and gentle to yourself! 🌻",
  "Every small win counts! 🏆",
  "Choose happiness every single day! ☀️",
  "You've got this, no matter what! 💖",
  "Be proud of how far you've come! 🌼",
  "Stay true to who you are! 🌈",
  "Big dreams start with small steps! 👣",
  "The best is yet to come, Ivy! 🌅",
  "Smile, you make the world brighter! 😊",
  "Embrace every moment of your 20s! 💫",
  "You are stronger than you realize! 🌷"
];

export interface BalloonReleaseEvent {
  id: number;
  durationMs: number;
}

interface BalloonEffectProps {
  theme: BalloonTheme;
  interactive?: boolean;
  activeRelease?: BalloonReleaseEvent | null;
}

export const BalloonEffect: React.FC<BalloonEffectProps> = ({
  theme,
  interactive = true,
  activeRelease = null
}) => {
  // Empty initially on landing page
  const [balloons, setBalloons] = useState<BalloonItem[]>([]);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [floatingWishes, setFloatingWishes] = useState<FloatingWish[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const [releasedBanner, setReleasedBanner] = useState(false);

  const cleanupTimeoutRef = useRef<number | null>(null);
  const fadeTimeoutRef = useRef<number | null>(null);

  // Pop balloon handler: displays message for a generous 5.0 seconds so Ivy can read it!
  const handlePop = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const rawX = rect.left + rect.width / 2;
    const rawY = rect.top + rect.height / 2;

    // Clamp coordinates so toast is never clipped off-screen
    const clampedX = Math.max(110, Math.min(window.innerWidth - 110, rawX));
    const clampedY = Math.max(70, Math.min(window.innerHeight - 80, rawY));

    soundEngine.playBalloonPop();
    popBalloonConfetti(clampedX, clampedY);

    setPoppedCount((prev) => prev + 1);

    const wishText = SURPRISE_WISHES[Math.floor(Math.random() * SURPRISE_WISHES.length)];
    const wishId = `wish-${Date.now()}-${Math.random()}`;
    
    // Add new wish
    setFloatingWishes((prev) => [...prev, { id: wishId, x: clampedX, y: clampedY, text: wishText, isFading: false }]);

    // Smooth fade-out starts at 4.2 seconds
    setTimeout(() => {
      setFloatingWishes((prev) =>
        prev.map((w) => (w.id === wishId ? { ...w, isFading: true } : w))
      );
    }, 4200);

    // Completely remove after 5.0 seconds (stays long enough to read comfortably!)
    setTimeout(() => {
      setFloatingWishes((prev) => prev.filter((w) => w.id !== wishId));
    }, 5000);

    // Remove popped balloon immediately
    setBalloons((prev) => prev.filter((b) => b.id !== id));
  };

  // Launch balloons for a specific timed duration, then automatically disappear
  const launchTimedBalloons = useCallback((durationMs: number) => {
    if (cleanupTimeoutRef.current) clearTimeout(cleanupTimeoutRef.current);
    if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);

    setIsFadingOut(false);
    const palette = BALLOON_PALETTES[theme] || BALLOON_PALETTES.pink_blush;
    const newItems: BalloonItem[] = [];

    // Notification toast when Ivy manually clicks Release Balloons
    if (durationMs >= 4000) {
      setReleasedBanner(true);
      setTimeout(() => setReleasedBanner(false), 2400);
    }

    for (let i = 0; i < 22; i++) {
      const col = palette[i % palette.length];
      newItems.push({
        id: `rel-${Date.now()}-${i}-${Math.random()}`,
        xPercent: 3 + (i * 4.3) + (Math.random() * 3 - 1.5),
        size: 58 + Math.random() * 36,
        speed: 4.8 + Math.random() * 2.2,
        swayDuration: 1.8 + Math.random() * 1.4,
        color: col.main,
        highlightColor: col.shine,
        stringLength: 50 + Math.random() * 25,
        delaySec: (i % 6) * 0.12
      });
    }

    setBalloons(newItems);

    // Fade out ~700ms before duration ends
    const fadeDelay = Math.max(0, durationMs - 700);
    fadeTimeoutRef.current = window.setTimeout(() => {
      setIsFadingOut(true);
    }, fadeDelay);

    // Remove balloons after duration
    cleanupTimeoutRef.current = window.setTimeout(() => {
      setBalloons([]);
      setIsFadingOut(false);
    }, durationMs);
  }, [theme]);

  // Listen to activeRelease triggers
  useEffect(() => {
    if (activeRelease && activeRelease.durationMs > 0) {
      launchTimedBalloons(activeRelease.durationMs);
    }
  }, [activeRelease, launchTimedBalloons]);

  useEffect(() => {
    return () => {
      if (cleanupTimeoutRef.current) clearTimeout(cleanupTimeoutRef.current);
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    };
  }, []);

  return (
    <>
      {/* 1. Floating Balloons Layer (Timed: 3s on open, 5s on release) */}
      {balloons.length > 0 && (
        <div 
          className={`pointer-events-none fixed inset-0 overflow-hidden transition-opacity duration-700 ${
            isFadingOut ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ zIndex: 45 }}
        >
          {/* Released Balloons Banner */}
          {releasedBanner && (
            <div className="fixed top-16 inset-x-4 max-w-xs mx-auto z-50 bg-white/95 backdrop-blur-md border-2 border-pink-300 rounded-2xl py-2 px-4 shadow-xl text-center animate-bounce flex items-center justify-center gap-2">
              <span className="text-xl">🎈</span>
              <span className="font-fun font-bold text-sm text-pink-700">
                Balloons Released for Ivy!
              </span>
              <span className="text-xl">🎈</span>
            </div>
          )}

          {/* Individual Balloons */}
          {balloons.map((b) => (
            <div
              key={b.id}
              onClick={(e) => handlePop(b.id, e)}
              className="pointer-events-auto absolute cursor-pointer select-none"
              style={{
                left: `${b.xPercent}%`,
                width: `${b.size}px`,
                bottom: '-70px',
                animation: `balloon-rise ${b.speed}s linear infinite`,
                animationDelay: `${b.delaySec}s`
              }}
              title="Tap to pop balloon!"
            >
              {/* Inner Sway */}
              <div
                className="transition-transform hover:scale-110 active:scale-90"
                style={{
                  animation: `balloon-sway ${b.swayDuration}s ease-in-out infinite alternate`
                }}
              >
                <div
                  className="relative rounded-full shadow-xl"
                  style={{
                    width: `${b.size}px`,
                    height: `${b.size * 1.25}px`,
                    background: `radial-gradient(circle at 35% 30%, ${b.highlightColor} 0%, ${b.color} 72%, #00000028 100%)`,
                    boxShadow: `0 8px 24px -4px ${b.color}88`
                  }}
                >
                  <div
                    className="absolute top-2 left-3 rounded-full bg-white/80 blur-[0.8px]"
                    style={{
                      width: `${b.size * 0.28}px`,
                      height: `${b.size * 0.44}px`,
                      transform: 'rotate(-25deg)'
                    }}
                  />
                  <div
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2 rounded-xs"
                    style={{ backgroundColor: b.color }}
                  />
                  <svg
                    className="absolute top-[98%] left-1/2 -translate-x-1/2 overflow-visible"
                    width="24"
                    height={b.stringLength}
                    viewBox={`0 0 24 ${b.stringLength}`}
                    fill="none"
                  >
                    <path
                      d={`M 12 0 Q 6 ${b.stringLength * 0.33} 16 ${b.stringLength * 0.66} T 10 ${b.stringLength}`}
                      stroke="#fda4af"
                      strokeWidth="1.5"
                      strokeDasharray="2 1"
                      fill="none"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Popped Balloon Motivational Messages (Stays for a full 5.0 seconds!) */}
      {floatingWishes.length > 0 && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
          {floatingWishes.map((w) => (
            <div
              key={w.id}
              className={`fixed pointer-events-none text-white font-fun font-bold text-xs sm:text-sm px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 border border-white/40 shadow-2xl shadow-pink-500/50 -translate-x-1/2 -translate-y-full transition-all duration-700 ${
                w.isFading ? 'opacity-0 scale-95' : 'opacity-100 scale-100 animate-in fade-in zoom-in-95'
              }`}
              style={{
                left: `${w.x}px`,
                top: `${w.y}px`
              }}
            >
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span>{w.text}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Pop Counter Badge */}
      {poppedCount > 0 && (
        <div className="pointer-events-auto fixed bottom-4 left-4 z-50 px-3 py-1.5 bg-white/95 text-pink-700 font-fun text-xs font-semibold rounded-2xl shadow-md border border-pink-200 backdrop-blur-sm flex items-center gap-1.5 animate-in fade-in">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{poppedCount} balloons popped!</span>
        </div>
      )}
    </>
  );
};

import React, { useState, useRef } from 'react';
import { GreetingData, TEMPLATES } from './types';
import { BalloonEffect } from './components/BalloonEffect';
import { GreetingCard } from './components/GreetingCard';
import { Navbar } from './components/Navbar';
import { YouTubeMusicHandle } from './components/YouTubePlayer';
import { soundEngine } from './utils/audio';
import { burstConfettiCenter, fireSideCannons } from './utils/confetti';
import { Sparkles } from 'lucide-react';

const DEDICATED_GREETING: GreetingData = {
  recipientName: 'Ivy',
  senderName: 'Renz',
  age: '20',
  message: "Wishing you a Happy Birthday!! I hope you live a happy life and that you'll achieve your goals in life. I hope you find the greatest in your life and in your everyday life, and welcome to your 20s HAHAHAHA, feel so old na ba? Just kidding. I know age is just a number, but it also means how many times you win in life, so celebrate it with all your heart, okay? My only wish for you is to live the life you want and be kind to yourself, and again, happy happy birthday to youuuuu!!!!",
  templateId: 'pastel_pink',
  cakeFlavor: 'strawberry',
  candlesCount: 3,
  soundInstrument: 'marimba',
  balloonTheme: 'pink_blush'
};

export default function App() {
  const [greetingData] = useState<GreetingData>(DEDICATED_GREETING);
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const [activeRelease, setActiveRelease] = useState<{ id: number; durationMs: number } | null>(null);

  const ytPlayerRef = useRef<YouTubeMusicHandle | null>(null);

  // When Ivy unwraps the gift card: play YouTube piano music & release balloons for 3 seconds!
  const handleOpenCard = () => {
    setIsOpened(true);
    setActiveRelease({ id: Date.now(), durationMs: 3000 });
    if (ytPlayerRef.current) {
      ytPlayerRef.current.play();
    }
  };

  // When Ivy taps "Release Balloons" in the toolbar: release balloons for 5 seconds!
  const handleReleaseBalloons = () => {
    setActiveRelease({ id: Date.now(), durationMs: 5000 });
  };

  const activeTemplate = TEMPLATES[greetingData.templateId] || TEMPLATES.pastel_pink;

  return (
    <div className={`min-h-screen bg-gradient-to-b ${activeTemplate.bgGradient} flex flex-col relative overflow-x-hidden selection:bg-pink-200 selection:text-pink-900 transition-colors duration-700`}>
      {/* Animated Interactive Floating Balloons (Hidden on landing page, 3s on open, 5s on button click) */}
      <BalloonEffect 
        theme={greetingData.balloonTheme} 
        activeRelease={activeRelease}
      />

      {/* Top Bar Navigation (Clean, without Send button) */}
      <Navbar
        ytPlayerRef={ytPlayerRef}
        autoPlayTrigger={isOpened}
      />

      {/* Main Dedicated Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-2 xs:px-4 sm:px-6 py-4 sm:py-8 z-10 flex flex-col items-center justify-center">
        <GreetingCard
          data={greetingData}
          isOpened={isOpened}
          onOpenCard={handleOpenCard}
          onReleaseBalloons={handleReleaseBalloons}
        />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-pink-200/50 bg-white/40 backdrop-blur-xs py-4 sm:py-6 z-10 text-center px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="font-fun font-semibold text-pink-600">Ivy&apos;s 20th Birthday</span>
            <span aria-hidden="true">·</span>
            <span>Dedicated with best wishes by Renz</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundEngine.playPartyFanfare();
                burstConfettiCenter();
                fireSideCannons();
              }}
              className="hover:text-pink-600 transition-colors cursor-pointer flex items-center gap-1 font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>More Confetti</span>
            </button>
            <span aria-hidden="true">·</span>
            <span>Pop balloons or blow candles anytime 🎈</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

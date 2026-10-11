import React, { useState } from 'react';
import { GreetingData, TEMPLATES } from '../types';
import { Cake3D } from './Cake3D';
import { soundEngine } from '../utils/audio';
import { burstConfettiCenter, fireSideCannons } from '../utils/confetti';
import { 
  Sparkles, 
  Share2, 
  Gift, 
  PartyPopper, 
  Laugh 
} from 'lucide-react';

// Generated asset import
import giftBoxImg from '../assets/images/whimsical_birthday_gift_box_1791726714724.jpg';

interface GreetingCardProps {
  data: GreetingData;
  isOpened: boolean;
  onOpenCard: () => void;
  onReleaseBalloons?: () => void;
}

export const GreetingCard: React.FC<GreetingCardProps> = ({
  data,
  isOpened,
  onOpenCard,
  onReleaseBalloons
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const template = TEMPLATES[data.templateId] || TEMPLATES.pastel_pink;

  const handleOpenGift = () => {
    soundEngine.playConfettiCannon();
    burstConfettiCenter();
    fireSideCannons();
    onOpenCard(); // triggers card open, YouTube song play, and automatic balloon release!
  };

  // If card is not yet unboxed / opened, show the whimsical present unwrap screen
  if (!isOpened) {
    return (
      <div className="w-full max-w-lg mx-auto my-4 sm:my-8 text-center z-10 relative px-3">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-9 border-2 border-pink-200 shadow-2xl shadow-pink-200/50 relative overflow-hidden animate-in zoom-in-95 duration-300">
          {/* Header Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-700 font-fun text-xs font-semibold mb-3 animate-bounce">
            <Gift className="w-4 h-4 text-pink-500" />
            Special 20th Birthday Delivery for Ivy!
          </div>

          <h2 className="font-fun font-bold text-2xl sm:text-4xl text-slate-800 tracking-tight leading-tight">
            Happy Birthday,{' '}
            <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 bg-clip-text text-transparent underline decoration-pink-300 decoration-wavy">
              Ivy!
            </span>
          </h2>

          <div className="flex items-center justify-center gap-2 mt-1.5">
            <span className="text-xs text-slate-500">From:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-pink-100/90 text-pink-700 font-fun font-bold text-xs">
              Renz
            </span>
          </div>

          {/* Whimsical Gift Box Illustration */}
          <div 
            className="relative w-48 h-48 sm:w-60 sm:h-60 mx-auto my-5 group cursor-pointer" 
            onClick={handleOpenGift}
            title="Tap to unwrap Ivy's surprise!"
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-pink-300 to-purple-300 blur-xl opacity-40 group-hover:opacity-75 transition-opacity" />
            {!imgFailed ? (
              <img
                src={giftBoxImg}
                alt="Whimsical wrapped birthday gift box for Ivy"
                className="relative w-full h-full object-cover rounded-3xl shadow-lg border-2 border-pink-100 group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <div className="relative w-full h-full rounded-3xl bg-gradient-to-tr from-pink-200 via-rose-100 to-purple-200 flex flex-col items-center justify-center p-6 border-2 border-pink-300">
                <Gift className="w-16 h-16 text-pink-500 animate-pulse" />
                <span className="font-fun font-bold text-pink-600 mt-2">Tap to Unwrap!</span>
              </div>
            )}

            {/* Glowing badge */}
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-full px-3 py-1 text-xs font-fun font-bold shadow-md animate-pulse flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tap to Open!</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 mb-5 max-w-sm mx-auto leading-relaxed px-2">
            Piano birthday music, interactive 3D cake, floating balloons, and Renz&apos;s special letter are waiting inside! ✨
          </p>

          <button
            onClick={handleOpenGift}
            className="w-full sm:w-auto min-h-[48px] px-7 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 hover:from-pink-600 hover:to-rose-600 text-white font-fun font-bold text-base shadow-xl shadow-pink-300 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2.5 mx-auto"
          >
            <PartyPopper className="w-5 h-5 text-amber-200 animate-bounce" />
            <span>Unwrap Ivy&apos;s Birthday Surprise! 🎁</span>
          </button>
        </div>
      </div>
    );
  }

  // Unwrapped / Active Dedicated Greeting Card View
  return (
    <div className="w-full max-w-3xl mx-auto my-2 sm:my-4 z-10 relative space-y-5 sm:space-y-6 animate-in fade-in duration-300 px-3 sm:px-4">
      {/* Floating Milestone Header Banner */}
      <div className="text-center pt-1">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-pink-200 shadow-xs text-pink-600 font-fun text-xs sm:text-sm font-semibold mb-2.5">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
          <span>Welcome to Your 20s, Ivy! 🎉</span>
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
        </div>

        <h1 className="font-fun font-extrabold text-3xl xs:text-4xl sm:text-6xl text-slate-800 tracking-tight drop-shadow-xs">
          Happy Birthday,{' '}
          <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 bg-clip-text text-transparent">
            Ivy!
          </span>
          <span className="text-pink-500 ml-1.5">🎂</span>
        </h1>
      </div>

      {/* 3D Birthday Cake Stage with Mic Blow feature */}
      <div className="relative">
        <Cake3D
          flavor="strawberry"
          candlesCount={3}
          recipientName="Ivy"
          onBlowCandles={() => {
            // Cake handles celebratory effects
          }}
        />
      </div>

      {/* Renz's Dedicated Letter Card (No Hearts) */}
      <div
        className={`rounded-3xl p-5 sm:p-8 border-2 shadow-xl ${template.cardBg} ${template.borderStyle} relative overflow-hidden`}
      >
        <div className="max-w-2xl mx-auto text-left space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-pink-100">
            <span className="font-fun font-bold text-sm text-pink-600 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              A Special Letter for Ivy
            </span>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              From Renz
            </span>
          </div>

          <div className="pt-1">
            <p className="font-fun font-bold text-base sm:text-lg text-slate-800 mb-2">
              Dearest Ivy,
            </p>

            <div className="text-slate-700 leading-relaxed font-sans space-y-3 text-sm sm:text-base">
              <p>
                Wishing you a Happy Birthday!! I hope you live a happy life and that you&apos;ll achieve your goals in life. I hope you find the greatest in your life and in your everyday life...
              </p>

              <p className="p-3 bg-pink-100/60 rounded-2xl border border-pink-200 text-pink-900 font-medium flex items-start gap-2">
                <Laugh className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                <span>
                  ...and welcome to your 20s HAHAHAHA, feel so old na ba? Just kidding! 😆
                </span>
              </p>

              <p>
                I know age is just a number, but it also means how many times you win in life, so celebrate it with all your heart, okay?
              </p>

              <p className="font-medium text-pink-700">
                My only wish for you is to live the life you want and be kind to yourself, and again, happy happy birthday to youuuuu!!!! 🎉🎂✨
              </p>
            </div>
          </div>

          {/* Renz's Signature */}
          <div className="pt-4 border-t border-pink-100 flex flex-col items-end">
            <span className="text-xs text-slate-500 italic">Always cheering for you,</span>
            <span className="font-script text-3xl sm:text-5xl text-pink-600 mt-0.5 font-bold tracking-wide">
              Renz
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Birthday Toolbar for Ivy */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-1">
        <button
          onClick={onReleaseBalloons}
          className="min-h-[44px] px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 hover:from-pink-600 hover:to-rose-600 text-white font-fun font-bold text-sm shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span className="text-lg">🎈</span>
          <span>Release Balloons</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playPartyFanfare();
            burstConfettiCenter();
            fireSideCannons();
          }}
          className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-white/95 hover:bg-white text-slate-700 font-fun font-semibold text-xs sm:text-sm shadow-xs border border-pink-200/80 hover:shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
        >
          <PartyPopper className="w-4 h-4 text-amber-500" />
          <span>Shoot Confetti! 🎉</span>
        </button>
      </div>
    </div>
  );
};

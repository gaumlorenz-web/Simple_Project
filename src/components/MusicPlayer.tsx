import React, { useState, useEffect } from 'react';
import { soundEngine } from '../utils/audio';
import { InstrumentType } from '../types';
import { Play, Pause, Volume2, VolumeX, Music, Disc } from 'lucide-react';

interface MusicPlayerProps {
  currentInstrument: InstrumentType;
  onInstrumentChange: (inst: InstrumentType) => void;
  autoPlayTrigger?: boolean;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  currentInstrument,
  onInstrumentChange,
  autoPlayTrigger
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [pulse, setPulse] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    soundEngine.setInstrument(currentInstrument);
  }, [currentInstrument]);

  useEffect(() => {
    const unsubPlayback = soundEngine.addPlaybackListener((playing) => {
      setIsPlaying(playing);
    });

    const unsubNote = soundEngine.addNoteListener(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 120);
    });

    return () => {
      unsubPlayback();
      unsubNote();
    };
  }, []);

  useEffect(() => {
    if (autoPlayTrigger && !isPlaying) {
      soundEngine.playSong();
    }
  }, [autoPlayTrigger]);

  const handleTogglePlay = () => {
    soundEngine.togglePlay();
  };

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundEngine.setVolume(val);
  };

  const handleSelectInstrument = (inst: InstrumentType) => {
    onInstrumentChange(inst);
    soundEngine.setInstrument(inst);
    soundEngine.playNote(523.25, 0.4, inst); // preview note
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-1.5 p-1.5 bg-white/90 backdrop-blur-md border border-pink-200/80 rounded-2xl shadow-md hover:shadow-lg transition-all">
        {/* Play/Pause Button */}
        <button
          onClick={handleTogglePlay}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            isPlaying
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs scale-105'
              : 'bg-pink-100 hover:bg-pink-200 text-pink-700'
          }`}
          title={isPlaying ? 'Pause Happy Birthday Song' : 'Play Happy Birthday Song'}
          aria-label={isPlaying ? 'Pause song' : 'Play song'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-white" />
          ) : (
            <Play className="w-4 h-4 fill-pink-600 ml-0.5" />
          )}
        </button>

        {/* Music visual indicator & title */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-2.5 py-1 text-left hover:bg-pink-50/80 rounded-xl transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-0.5 h-4">
            <span
              className={`w-1 rounded-full bg-pink-500 transition-all ${
                isPlaying && pulse ? 'h-4' : isPlaying ? 'h-2' : 'h-1.5 opacity-50'
              }`}
            />
            <span
              className={`w-1 rounded-full bg-rose-400 transition-all ${
                isPlaying && !pulse ? 'h-3.5' : isPlaying ? 'h-1.5' : 'h-1.5 opacity-50'
              }`}
            />
            <span
              className={`w-1 rounded-full bg-pink-600 transition-all ${
                isPlaying && pulse ? 'h-4' : isPlaying ? 'h-2.5' : 'h-1.5 opacity-50'
              }`}
            />
          </div>

          <div className="hidden sm:block">
            <div className="text-[11px] font-fun font-bold text-pink-700 leading-tight flex items-center gap-1">
              <span>Happy Birthday Song</span>
              <Disc
                className={`w-3 h-3 text-pink-400 ${
                  isPlaying ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '4s' }}
              />
            </div>
            <div className="text-[10px] text-slate-500 capitalize">
              {currentInstrument === 'musicbox'
                ? 'Music Box 🎵'
                : currentInstrument === 'chimes'
                ? 'Crystal Chimes ✨'
                : 'Sweet Marimba 🪵'}
            </div>
          </div>
        </button>

        {/* Quick Mute Toggle */}
        <button
          onClick={handleToggleMute}
          className="p-1.5 text-slate-400 hover:text-pink-600 rounded-lg hover:bg-pink-50 transition-colors cursor-pointer"
          title={isMuted ? 'Unmute' : 'Mute'}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-rose-500" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Expanded Instrument & Volume Controls Panel */}
      {isExpanded && (
        <div className="absolute top-full mt-2 left-0 sm:right-0 sm:left-auto w-64 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-pink-200 z-40 animate-in fade-in duration-150">
          <div className="text-xs font-semibold text-slate-700 mb-2">
            Instrument Style
          </div>
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {(['musicbox', 'chimes', 'marimba'] as InstrumentType[]).map((t) => (
              <button
                key={t}
                onClick={() => handleSelectInstrument(t)}
                className={`px-2 py-1.5 rounded-xl text-[11px] font-fun font-medium capitalize transition-all cursor-pointer ${
                  currentInstrument === t
                    ? 'bg-pink-500 text-white shadow-xs'
                    : 'bg-pink-50 hover:bg-pink-100 text-slate-700'
                }`}
              >
                {t === 'musicbox' ? 'Music Box' : t === 'chimes' ? 'Chimes' : 'Marimba'}
              </button>
            ))}
          </div>

          <div className="text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
            <span>Volume</span>
            <span className="text-[11px] font-mono text-slate-500">
              {Math.round(volume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full accent-pink-500 cursor-pointer h-1.5 bg-pink-100 rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

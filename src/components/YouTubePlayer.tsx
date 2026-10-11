import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import { Volume2, VolumeX, Play, Pause, Music } from 'lucide-react';

export interface YouTubeMusicHandle {
  play: () => void;
  pause: () => void;
  toggle: () => void;
}

interface YouTubeMusicProps {
  videoId?: string;
  autoPlayTrigger?: boolean;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const YouTubeMusic = forwardRef<YouTubeMusicHandle, YouTubeMusicProps>(({
  videoId = 'nAw2ooeubSQ',
  autoPlayTrigger = false
}, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const playerRef = useRef<any>(null);
  const shouldPlayRef = useRef<boolean>(false);
  const containerId = 'youtube-birthday-audio-player';

  // Safe play helper
  const tryPlay = useCallback(() => {
    shouldPlayRef.current = true;
    if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
      try {
        playerRef.current.unMute();
        playerRef.current.setVolume(85);
        playerRef.current.playVideo();
        setIsPlaying(true);
      } catch (e) {
        console.warn('YT playVideo error:', e);
      }
    }
  }, []);

  // Safe pause helper
  const tryPause = useCallback(() => {
    shouldPlayRef.current = false;
    if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
      try {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } catch (e) {
        console.warn('YT pauseVideo error:', e);
      }
    }
  }, []);

  // Expose controls to parent
  useImperativeHandle(ref, () => ({
    play: tryPlay,
    pause: tryPause,
    toggle: () => {
      if (playerRef.current && typeof playerRef.current.getPlayerState === 'function') {
        const state = playerRef.current.getPlayerState();
        if (state === 1) { // playing
          tryPause();
        } else {
          tryPlay();
        }
      } else {
        if (isPlaying) tryPause();
        else tryPlay();
      }
    }
  }), [tryPlay, tryPause, isPlaying]);

  // Initialize YouTube Iframe
  useEffect(() => {
    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
      }

      playerRef.current = new window.YT.Player(containerId, {
        height: '1',
        width: '1',
        videoId: videoId,
        playerVars: {
          autoplay: 1, // request autoplay
          loop: 1,
          playlist: videoId,
          playsinline: 1,
          controls: 0,
          showinfo: 0,
          modestbranding: 1,
          fs: 0,
          rel: 0,
          enablejsapi: 1
        },
        events: {
          onReady: (event: any) => {
            setIsReady(true);
            try {
              event.target.unMute();
              event.target.setVolume(85);
              if (shouldPlayRef.current || autoPlayTrigger) {
                event.target.playVideo();
                setIsPlaying(true);
              }
            } catch (err) {
              console.warn('YT onReady autoplay error:', err);
            }
          },
          onStateChange: (event: any) => {
            if (event.data === 1) { // PLAYING
              setIsPlaying(true);
            } else if (event.data === 2 || event.data === 0) { // PAUSED / ENDED
              setIsPlaying(false);
            }
          },
          onError: (err: any) => {
            console.warn('YT Player error:', err);
          }
        }
      });
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = initPlayer;
    } else {
      initPlayer();
    }

    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
      }
    };
  }, [videoId, autoPlayTrigger]);

  // When autoPlayTrigger turns true
  useEffect(() => {
    if (autoPlayTrigger) {
      tryPlay();
    }
  }, [autoPlayTrigger, tryPlay]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      tryPause();
    } else {
      tryPlay();
    }
  };

  const handleToggleMute = () => {
    if (!playerRef.current) return;
    try {
      if (isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    } catch {
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {/* Hidden YouTube Iframe Container */}
      <div className="absolute -left-[9999px] -top-[9999px] w-1 h-1 overflow-hidden pointer-events-none opacity-0">
        <div id={containerId} />
      </div>

      {/* Floating Music Control Bar in Navbar */}
      <div className="flex items-center gap-1.5 p-1 sm:p-1.5 bg-white/95 backdrop-blur-md border border-pink-200/90 rounded-2xl shadow-xs">
        <button
          onClick={handleTogglePlay}
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            isPlaying
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs'
              : 'bg-pink-100 hover:bg-pink-200 text-pink-700'
          }`}
          title={isPlaying ? 'Pause Background Piano Music' : 'Play Background Piano Music'}
          aria-label={isPlaying ? 'Pause music' : 'Play music'}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
          ) : (
            <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-pink-600 ml-0.5" />
          )}
        </button>

        {/* Track Label */}
        <div className="hidden xs:flex flex-col text-left pr-2">
          <div className="text-[11px] font-fun font-bold text-pink-700 leading-tight flex items-center gap-1">
            <span>Piano Music</span>
            <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-pink-500 animate-ping' : 'bg-slate-300'}`} />
          </div>
          <span className="text-[10px] text-slate-500 truncate max-w-[110px]">
            Happy Birthday (Piano)
          </span>
        </div>

        {/* Mute button */}
        <button
          onClick={handleToggleMute}
          className="p-1.5 text-slate-400 hover:text-pink-600 rounded-lg hover:bg-pink-50 transition-colors cursor-pointer"
          title={isMuted ? 'Unmute' : 'Mute'}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          )}
        </button>
      </div>
    </div>
  );
});

YouTubeMusic.displayName = 'YouTubeMusic';

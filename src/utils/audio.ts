import { InstrumentType } from '../types';

interface Note {
  pitch: number; // Frequency in Hz
  duration: number; // in seconds
  bass?: number;
  chord?: number[];
  beatEffect?: boolean;
}

const NOTE_FREQS: Record<string, number> = {
  F2: 87.31,
  G2: 98.00,
  A2: 110.00,
  Bb2: 116.54,
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.00,
  A3: 220.00,
  Bb3: 233.08,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.00,
  A4: 440.00,
  Bb4: 466.16,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46
};

// Lively, Upbeat Happy Birthday song arrangement with bouncy bassline & chord stabs (~135 BPM)
const LIVELY_MELODY: Note[] = [
  // Intro celebratory fanfare
  { pitch: NOTE_FREQS.C4, duration: 0.22, bass: NOTE_FREQS.F2 },
  { pitch: NOTE_FREQS.C4, duration: 0.16 },
  { pitch: NOTE_FREQS.D4, duration: 0.36, bass: NOTE_FREQS.F3, chord: [NOTE_FREQS.A3, NOTE_FREQS.C4], beatEffect: true },
  { pitch: NOTE_FREQS.C4, duration: 0.36, bass: NOTE_FREQS.C3 },
  { pitch: NOTE_FREQS.F4, duration: 0.36, bass: NOTE_FREQS.F2, chord: [NOTE_FREQS.A3, NOTE_FREQS.C4], beatEffect: true },
  { pitch: NOTE_FREQS.E4, duration: 0.72, bass: NOTE_FREQS.C3, chord: [NOTE_FREQS.G3, NOTE_FREQS.Bb3] },

  // Phrase 2
  { pitch: NOTE_FREQS.C4, duration: 0.22, bass: NOTE_FREQS.C3 },
  { pitch: NOTE_FREQS.C4, duration: 0.16 },
  { pitch: NOTE_FREQS.D4, duration: 0.36, bass: NOTE_FREQS.G2, chord: [NOTE_FREQS.Bb3, NOTE_FREQS.D4], beatEffect: true },
  { pitch: NOTE_FREQS.C4, duration: 0.36, bass: NOTE_FREQS.C3 },
  { pitch: NOTE_FREQS.G4, duration: 0.36, bass: NOTE_FREQS.C3, chord: [NOTE_FREQS.Bb3, NOTE_FREQS.E4], beatEffect: true },
  { pitch: NOTE_FREQS.F4, duration: 0.72, bass: NOTE_FREQS.F2, chord: [NOTE_FREQS.A3, NOTE_FREQS.C4] },

  // Phrase 3 (Happy Birthday dear IVY!)
  { pitch: NOTE_FREQS.C4, duration: 0.22, bass: NOTE_FREQS.F2 },
  { pitch: NOTE_FREQS.C4, duration: 0.16 },
  { pitch: NOTE_FREQS.C5, duration: 0.36, bass: NOTE_FREQS.A2, chord: [NOTE_FREQS.C4, NOTE_FREQS.F4], beatEffect: true },
  { pitch: NOTE_FREQS.A4, duration: 0.36, bass: NOTE_FREQS.F3, chord: [NOTE_FREQS.C4, NOTE_FREQS.F4] },
  { pitch: NOTE_FREQS.F4, duration: 0.36, bass: NOTE_FREQS.D3, chord: [NOTE_FREQS.A3, NOTE_FREQS.D4], beatEffect: true },
  { pitch: NOTE_FREQS.E4, duration: 0.36, bass: NOTE_FREQS.Bb2, chord: [NOTE_FREQS.G3, NOTE_FREQS.C4] },
  { pitch: NOTE_FREQS.D4, duration: 0.68, bass: NOTE_FREQS.Bb2, chord: [NOTE_FREQS.F3, NOTE_FREQS.Bb3] },

  // Phrase 4 (Happy Birthday to YOU!)
  { pitch: NOTE_FREQS.Bb4, duration: 0.22, bass: NOTE_FREQS.Bb2 },
  { pitch: NOTE_FREQS.Bb4, duration: 0.16 },
  { pitch: NOTE_FREQS.A4, duration: 0.36, bass: NOTE_FREQS.F2, chord: [NOTE_FREQS.C4, NOTE_FREQS.F4], beatEffect: true },
  { pitch: NOTE_FREQS.F4, duration: 0.36, bass: NOTE_FREQS.A2 },
  { pitch: NOTE_FREQS.G4, duration: 0.36, bass: NOTE_FREQS.C3, chord: [NOTE_FREQS.Bb3, NOTE_FREQS.E4], beatEffect: true },
  { pitch: NOTE_FREQS.F4, duration: 0.95, bass: NOTE_FREQS.F2, chord: [NOTE_FREQS.A3, NOTE_FREQS.C4, NOTE_FREQS.F4] }
];

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private isMuted = false;
  private volume = 0.8;
  private timeouts: number[] = [];
  private currentInstrument: InstrumentType = 'marimba'; // lively default
  private loop = true;
  private onNotePlayListeners: Set<() => void> = new Set();
  private onPlaybackStateChangeListeners: Set<(playing: boolean) => void> = new Set();

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setInstrument(type: InstrumentType) {
    this.currentInstrument = type;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public addPlaybackListener(fn: (playing: boolean) => void) {
    this.onPlaybackStateChangeListeners.add(fn);
    return () => this.onPlaybackStateChangeListeners.delete(fn);
  }

  public addNoteListener(fn: () => void) {
    this.onNotePlayListeners.add(fn);
    return () => this.onNotePlayListeners.delete(fn);
  }

  private notifyPlaybackChange() {
    this.onPlaybackStateChangeListeners.forEach((fn) => fn(this.isPlaying));
  }

  private notifyNotePlay() {
    this.onNotePlayListeners.forEach((fn) => fn());
  }

  // Play lively percussion pop / clap on beats
  private playPercussionBeat(now: number, ctx: AudioContext) {
    if (this.isMuted) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);

      gain.gain.setValueAtTime(this.volume * 0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // ignore
    }
  }

  // Play upbeat bass note
  private playBassNote(freq: number, duration: number, now: number, ctx: AudioContext) {
    if (this.isMuted) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.28, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.85);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // ignore
    }
  }

  // Play chord stabs for harmony
  private playChord(chordFreqs: number[], duration: number, now: number, ctx: AudioContext) {
    if (this.isMuted) return;
    try {
      chordFreqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.volume * 0.12, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.7);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + duration * 0.75);
      });
    } catch {
      // ignore
    }
  }

  public playNote(freq: number, duration: number, type: InstrumentType = this.currentInstrument) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const gainNode = ctx.createGain();
      gainNode.connect(ctx.destination);
      const effectiveVol = this.volume * 0.45;

      if (type === 'marimba') {
        // Lively wooden percussive punch with bright acoustic overtone
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const subGain = ctx.createGain();

        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(freq, now);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 3, now); // wood mallet strike
        subGain.gain.setValueAtTime(0.25, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(effectiveVol * 1.3, now + 0.006);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.85);

        osc1.connect(gainNode);
        osc2.connect(subGain);
        subGain.connect(gainNode);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + duration);
        osc2.stop(now + duration);
      } else if (type === 'musicbox') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const subGain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, now);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 2, now);
        subGain.gain.setValueAtTime(0.2, now);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(effectiveVol, now + 0.015);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.2, duration * 1.2));

        osc1.connect(gainNode);
        osc2.connect(subGain);
        subGain.connect(gainNode);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + duration * 1.3);
        osc2.stop(now + duration * 1.3);
      } else {
        // Chimes
        const osc = ctx.createOscillator();
        const overtone = ctx.createOscillator();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        overtone.type = 'sine';
        overtone.frequency.setValueAtTime(freq * 2.76, now);

        const overGain = ctx.createGain();
        overGain.gain.setValueAtTime(0.2, now);
        overGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(effectiveVol * 1.1, now + 0.008);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration * 1.5);

        osc.connect(gainNode);
        overtone.connect(overGain);
        overGain.connect(gainNode);

        osc.start(now);
        overtone.start(now);
        osc.stop(now + duration * 1.6);
        overtone.stop(now + duration * 1.6);
      }
    } catch {
      // Audio context might be restricted before user touch
    }
  }

  public playSong(onLoop?: () => void) {
    this.stopSong();
    const ctx = this.getContext();
    this.isPlaying = true;
    this.notifyPlaybackChange();

    let cumulativeTime = 0;

    LIVELY_MELODY.forEach((note) => {
      const timeoutId = window.setTimeout(() => {
        if (!this.isPlaying) return;
        const now = ctx.currentTime;
        
        // Play main melody
        this.playNote(note.pitch, note.duration);

        // Play bouncy bassline if present
        if (note.bass) {
          this.playBassNote(note.bass, note.duration, now, ctx);
        }

        // Play harmony chords if present
        if (note.chord) {
          this.playChord(note.chord, note.duration, now, ctx);
        }

        // Play subtle party percussion clap
        if (note.beatEffect) {
          this.playPercussionBeat(now, ctx);
        }

        this.notifyNotePlay();
      }, cumulativeTime * 1000);

      this.timeouts.push(timeoutId);
      cumulativeTime += note.duration;
    });

    // Schedule lively loop
    const loopTimeout = window.setTimeout(() => {
      if (this.isPlaying && this.loop) {
        if (onLoop) onLoop();
        this.playSong(onLoop);
      } else {
        this.isPlaying = false;
        this.notifyPlaybackChange();
      }
    }, (cumulativeTime + 0.4) * 1000);

    this.timeouts.push(loopTimeout);
  }

  public stopSong() {
    this.isPlaying = false;
    this.timeouts.forEach((id) => clearTimeout(id));
    this.timeouts = [];
    this.notifyPlaybackChange();
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.stopSong();
    } else {
      this.playSong();
    }
  }

  // Attempt autoplay safely
  public tryAutoPlay() {
    try {
      const ctx = this.getContext();
      if (ctx.state === 'running') {
        this.playSong();
      } else {
        // Wait for first user click / touch anywhere on window to resume and play!
        const resumeAndPlay = () => {
          ctx.resume().then(() => {
            if (!this.isPlaying) {
              this.playSong();
            }
          });
          window.removeEventListener('click', resumeAndPlay);
          window.removeEventListener('touchstart', resumeAndPlay);
          window.removeEventListener('keydown', resumeAndPlay);
        };
        window.addEventListener('click', resumeAndPlay, { once: true });
        window.addEventListener('touchstart', resumeAndPlay, { once: true });
        window.addEventListener('keydown', resumeAndPlay, { once: true });
      }
    } catch {
      // ignore
    }
  }

  // --- Sound Effects ---

  public playBalloonPop() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);

      gain.gain.setValueAtTime(this.volume * 0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // ignore
    }
  }

  public playCandleBlow() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.35);
      filter.Q.setValueAtTime(2, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.6, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.4);
    } catch {
      // ignore
    }
  }

  public playConfettiCannon() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.14);

      gain.gain.setValueAtTime(this.volume * 0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);

      const chords = [NOTE_FREQS.C5, NOTE_FREQS.E5, NOTE_FREQS.G4 * 2];
      chords.forEach((freq, i) => {
        const cOsc = ctx.createOscillator();
        const cGain = ctx.createGain();
        cOsc.type = 'sine';
        cOsc.frequency.setValueAtTime(freq, now + 0.05 + i * 0.04);

        cGain.gain.setValueAtTime(0, now);
        cGain.gain.linearRampToValueAtTime(this.volume * 0.25, now + 0.05 + i * 0.04);
        cGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45 + i * 0.04);

        cOsc.connect(cGain);
        cGain.connect(ctx.destination);
        cOsc.start(now + 0.05 + i * 0.04);
        cOsc.stop(now + 0.5 + i * 0.04);
      });
    } catch {
      // ignore
    }
  }

  public playPartyFanfare() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      [523.25, 659.25, 783.99, 1046.5].forEach((f) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1600, now);

        gain.gain.setValueAtTime(this.volume * 0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.75);
      });
    } catch {
      // ignore
    }
  }
}

export const soundEngine = new SoundEngine();

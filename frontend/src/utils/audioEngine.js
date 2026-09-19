import { VIOLIN_VOLUMES, MELODY, MARIO_NOTES } from '../constants/melodyNotes';
import { GAME_CONFIG } from '../constants/gameConfig';

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.violinGain = null;
    this.violinTimer = null;
    this.violinActive = false;
    this.melodyIdx = 0;
    this.nextNoteT = 0;
  }

  init() {
    if (this.audioCtx) {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return;
    }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    this.audioCtx = new AudioContextClass();
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.value = 0.75;
    this.masterGain.connect(this.audioCtx.destination);

    this.violinGain = this.audioCtx.createGain();
    this.violinGain.gain.value = VIOLIN_VOLUMES[GAME_CONFIG.LIVES_MAX];
    this.violinGain.connect(this.masterGain);
  }

  playViolinNote(freq, startT, dur, vel = 0.28) {
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const filter = this.audioCtx.createBiquadFilter();
    const env = this.audioCtx.createGain();
    const lfo = this.audioCtx.createOscillator();
    const lfoAmt = this.audioCtx.createGain();

    // Vibrato
    lfo.type = 'sine';
    lfo.frequency.value = 5.2;
    lfoAmt.gain.value = freq * 0.012; // ~1.2% depth
    lfo.connect(lfoAmt);
    lfoAmt.connect(osc.frequency);

    // Warm lowpass sawtooth string timbre
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    filter.type = 'lowpass';
    filter.frequency.value = 1400 + freq * 0.6;
    filter.Q.value = 0.8;

    // ADSR Envelope
    const atk = 0.07;
    const rel = 0.13;
    env.gain.setValueAtTime(0, startT);
    env.gain.linearRampToValueAtTime(vel, startT + atk);
    env.gain.setValueAtTime(vel, startT + dur - rel);
    env.gain.linearRampToValueAtTime(0, startT + dur);

    osc.connect(filter);
    filter.connect(env);
    env.connect(this.violinGain);

    const end = startT + dur + 0.15;
    lfo.start(startT);
    osc.start(startT);
    lfo.stop(end);
    osc.stop(end);
  }

  scheduleMelody() {
    if (!this.audioCtx || !this.violinActive) return;
    const LOOKAHEAD = 0.30;
    while (this.nextNoteT < this.audioCtx.currentTime + LOOKAHEAD) {
      const [hz, beats] = MELODY[this.melodyIdx % MELODY.length];
      this.playViolinNote(hz, this.nextNoteT, beats * 0.88);
      this.nextNoteT += beats;
      this.melodyIdx++;
    }
    this.violinTimer = setTimeout(() => this.scheduleMelody(), 60);
  }

  startViolin() {
    this.init();
    this.violinActive = true;
    this.melodyIdx = 0;
    this.nextNoteT = this.audioCtx.currentTime + 0.05;
    this.scheduleMelody();
  }

  stopViolin() {
    this.violinActive = false;
    if (this.violinTimer) {
      clearTimeout(this.violinTimer);
      this.violinTimer = null;
    }
  }

  setViolinIntensity(livesLeft) {
    if (!this.violinGain || !this.audioCtx) return;
    const index = Math.max(0, Math.min(livesLeft, 3));
    const vol = VIOLIN_VOLUMES[index];
    this.violinGain.gain.setTargetAtTime(vol, this.audioCtx.currentTime, 0.4);
  }

  playHitSound() {
    if (!this.audioCtx) return;
    const t = this.audioCtx.currentTime;

    // Low rumble drop
    const osc = this.audioCtx.createOscillator();
    const g = this.audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.35);
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.4);

    // High crack
    const noise = this.audioCtx.createOscillator();
    const ng = this.audioCtx.createGain();
    noise.type = 'square';
    noise.frequency.value = 880;
    ng.gain.setValueAtTime(0.3, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    noise.connect(ng);
    ng.connect(this.masterGain);
    noise.start(t);
    noise.stop(t + 0.1);
  }

  playPenaltySound() {
    if (!this.audioCtx) return;
    const t = this.audioCtx.currentTime;

    // Two rapid low-frequency buzzer pulses
    [0, 0.14].forEach((offset) => {
      const osc = this.audioCtx.createOscillator();
      const g = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, t + offset);
      osc.frequency.exponentialRampToValueAtTime(65, t + offset + 0.1);
      g.gain.setValueAtTime(0.4, t + offset);
      g.gain.exponentialRampToValueAtTime(0.01, t + offset + 0.1);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(t + offset);
      osc.stop(t + offset + 0.11);
    });
  }

  playLevelUpSound() {
    if (!this.audioCtx) return;
    const t = this.audioCtx.currentTime;
    [523, 659, 784, 1047].forEach((f, i) => {
      const osc = this.audioCtx.createOscillator();
      const g = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = f;
      const s = t + i * 0.11;
      g.gain.setValueAtTime(0, s);
      g.gain.linearRampToValueAtTime(0.35, s + 0.04);
      g.gain.linearRampToValueAtTime(0, s + 0.14);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(s);
      osc.stop(s + 0.18);
    });
  }

  playMarioGameOver() {
    if (!this.audioCtx) return;
    this.stopViolin();
    this.violinGain.gain.setTargetAtTime(0, this.audioCtx.currentTime, 0.1);

    const t = this.audioCtx.currentTime + 0.15;

    const sq = (freq, start, dur, vol = 0.38) => {
      const osc = this.audioCtx.createOscillator();
      const g = this.audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(vol, start);
      g.gain.setValueAtTime(vol, start + dur - 0.015);
      g.gain.linearRampToValueAtTime(0, start + dur);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(start);
      osc.stop(start + dur + 0.02);
    };

    MARIO_NOTES.forEach(note => {
      sq(note.freq, t + note.delay, note.dur);
    });
  }
}

export const soundEngine = new SoundEngine();


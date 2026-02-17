/**
 * AudioEngine — Procedural music & SFX.
 * Extends the archive's beep() oscillator+gain envelope pattern.
 */
import { CHAKRAS } from '../data/ChakraData.js';

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.volume = 0.5;
    this.musicVolume = 0.3;
    this.muted = false;

    // Music state
    this._musicInterval = null;
    this._droneOsc = null;
    this._padOsc = null;
    this._currentWorld = -1;
    this._beatIndex = 0;
  }

  /** Initialize on first user interaction. */
  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.volume;
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = this.musicVolume;
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.6;
    this.sfxGain.connect(this.masterGain);
  }

  _ensureCtx() {
    if (!this.ctx) this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  setVolume(v) {
    this.volume = v;
    if (this.masterGain) this.masterGain.gain.value = v;
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain) this.masterGain.gain.value = this.muted ? 0 : this.volume;
  }

  // === CORE: beep() from archive, extended ===
  beep(freq = 440, duration = 0.12, type = 'sine', dest = null) {
    this._ensureCtx();
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.connect(g);
    g.connect(dest || this.sfxGain);
    o.frequency.value = freq;
    o.type = type;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.08, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    o.start(t);
    o.stop(t + duration + 0.02);
  }

  /** Noise burst for attacks/impacts. */
  _noise(duration = 0.08, gain = 0.05) {
    this._ensureCtx();
    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * gain;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const g = this.ctx.createGain();
    src.connect(g);
    g.connect(this.sfxGain);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    src.start(t);
    src.stop(t + duration);
  }

  // === SFX ===
  sfxJump() {
    this.beep(300, 0.08, 'sine');
    setTimeout(() => this.beep(500, 0.06, 'sine'), 30);
  }

  sfxAttack() {
    this._noise(0.1, 0.08);
    this.beep(150, 0.06, 'sawtooth');
  }

  sfxHit() {
    this.beep(80, 0.1, 'square');
    this._noise(0.05, 0.04);
  }

  sfxCollect() {
    this.beep(800, 0.06, 'sine');
    setTimeout(() => this.beep(1200, 0.08, 'sine'), 50);
  }

  sfxDeath() {
    this.beep(400, 0.15, 'sawtooth');
    setTimeout(() => this.beep(200, 0.2, 'sawtooth'), 100);
    setTimeout(() => this.beep(100, 0.3, 'sawtooth'), 250);
  }

  sfxDash() {
    this.beep(200, 0.05, 'sine');
    this.beep(600, 0.04, 'sine');
  }

  sfxSwitch() {
    this.beep(500, 0.06, 'triangle');
    setTimeout(() => this.beep(700, 0.06, 'triangle'), 40);
    setTimeout(() => this.beep(1000, 0.05, 'triangle'), 80);
  }

  sfxPowerActivate(chakraIndex) {
    const hz = CHAKRAS[chakraIndex % 7].frequency;
    this.beep(hz, 0.3, 'sine');
    this.beep(hz * 1.5, 0.25, 'triangle');
    this.beep(hz * 2, 0.2, 'sine');
  }

  sfxBossIntro() {
    this._ensureCtx();
    // Building drone
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.beep(60 + i * 20, 0.4, 'sawtooth');
      }, i * 150);
    }
  }

  sfxMenuSelect() {
    this.beep(600, 0.04, 'sine');
  }

  // === PROCEDURAL MUSIC ===
  startWorldMusic(worldIndex) {
    if (this._currentWorld === worldIndex) return;
    this.stopMusic();
    this._currentWorld = worldIndex;
    this._ensureCtx();

    const chakra = CHAKRAS[worldIndex % 7];
    const baseHz = chakra.frequency;
    const tempo = 60000 / 80; // ms per beat

    // Sustained drone at chakra frequency
    this._droneOsc = this.ctx.createOscillator();
    const droneGain = this.ctx.createGain();
    this._droneOsc.type = 'sine';
    this._droneOsc.frequency.value = baseHz / 4; // sub-bass drone
    droneGain.gain.value = 0.02;
    this._droneOsc.connect(droneGain);
    droneGain.connect(this.musicGain);
    this._droneOsc.start();

    // Pad (chord)
    this._padOsc = this.ctx.createOscillator();
    const padGain = this.ctx.createGain();
    this._padOsc.type = 'triangle';
    this._padOsc.frequency.value = baseHz / 2;
    padGain.gain.value = 0.01;
    this._padOsc.connect(padGain);
    padGain.connect(this.musicGain);
    this._padOsc.start();

    // Melody arpeggio on interval
    const scale = this._getScale(baseHz);
    this._beatIndex = 0;

    this._musicInterval = setInterval(() => {
      if (this.muted) return;
      const note = scale[this._beatIndex % scale.length];
      this.beep(note, 0.1, 'sine', this.musicGain);

      // Rhythmic noise on even beats
      if (this._beatIndex % 4 === 0) {
        this._noise(0.03, 0.015);
      }

      this._beatIndex++;
    }, tempo / 2);
  }

  _getScale(baseHz) {
    // Pentatonic scale from base frequency
    const ratios = [1, 9/8, 5/4, 3/2, 5/3, 2];
    return ratios.map(r => baseHz * r);
  }

  startBossMusic(worldIndex) {
    this.stopMusic();
    this._ensureCtx();

    const chakra = CHAKRAS[worldIndex % 7];
    const baseHz = chakra.frequency;
    const tempo = 60000 / 140; // faster

    // Minor-key boss drone
    this._droneOsc = this.ctx.createOscillator();
    const droneGain = this.ctx.createGain();
    this._droneOsc.type = 'sawtooth';
    this._droneOsc.frequency.value = baseHz / 4;
    droneGain.gain.value = 0.03;
    this._droneOsc.connect(droneGain);
    droneGain.connect(this.musicGain);
    this._droneOsc.start();

    // Aggressive arpeggio
    const scale = [baseHz, baseHz * 6/5, baseHz * 3/2, baseHz * 8/5, baseHz * 2];
    this._beatIndex = 0;

    this._musicInterval = setInterval(() => {
      if (this.muted) return;
      const note = scale[this._beatIndex % scale.length];
      this.beep(note, 0.06, 'sawtooth', this.musicGain);

      if (this._beatIndex % 2 === 0) {
        this._noise(0.04, 0.02);
      }
      this._beatIndex++;
    }, tempo / 2);
  }

  stopMusic() {
    if (this._musicInterval) {
      clearInterval(this._musicInterval);
      this._musicInterval = null;
    }
    if (this._droneOsc) {
      try { this._droneOsc.stop(); } catch(e) {}
      this._droneOsc = null;
    }
    if (this._padOsc) {
      try { this._padOsc.stop(); } catch(e) {}
      this._padOsc = null;
    }
    this._currentWorld = -1;
  }
}

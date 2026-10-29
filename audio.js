/**
 * A LITTLE LIGHT, ALWAYS — Procedural Indian Ambient Audio Engine
 * Pure Web Audio API: 100% self-contained, offline-ready, zero external audio assets.
 * 
 * Features:
 * - Meditative Tanpura drone with four string harmonics (C# / G# / C# / C# tuning)
 * - Jawari (bridge buzz) harmonic overtone emulation
 * - Resonant brass temple bell (Ghanti) chime with realistic bell partials for chapter transitions
 * - Soft evening ember & breeze atmospheric bed
 * - Respects autoplay policies and begins MUTED.
 */

class DiwaliAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.masterGain = null;
    this.droneGain = null;
    this.ambienceGain = null;
    this.isRunning = false;
    this.activeNodes = [];
    this.currentChapter = -1;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Drone sub-bus
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.droneGain.connect(this.masterGain);

      // Ambience sub-bus
      this.ambienceGain = this.ctx.createGain();
      this.ambienceGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      this.ambienceGain.connect(this.masterGain);

      this.startTanpuraDrone();
      this.startAtmosphericEmber();
      this.isRunning = true;
    } catch (e) {
      console.warn("Web Audio API not supported or blocked", e);
    }
  }

  toggle() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;
    const targetGain = this.isMuted ? 0 : 0.85;
    const now = this.ctx.currentTime;

    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(targetGain, now, 0.4);

    return !this.isMuted;
  }

  /**
   * Tanpura String Drone (Raga Yaman / Bhairav mood: C# tuning)
   * 4 strings: Pa (G#3 ~ 207.65 Hz), Sa (C#4 ~ 277.18 Hz), Sa, Kharaj Sa (C#3 ~ 138.59 Hz)
   */
  startTanpuraDrone() {
    const freqs = [138.59, 207.65, 277.18, 277.18 * 1.002]; // subtle microtone chorus
    const stringCycleInterval = 2.4; // plucking rhythm

    freqs.forEach((baseFreq, idx) => {
      // Primary Oscillator
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

      // Jawari Bridge Filter (characteristic warm acoustic buzz of Tanpura)
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(baseFreq * 2.5, this.ctx.currentTime);
      filter.Q.setValueAtTime(3.2, this.ctx.currentTime);

      // String individual gain envelope
      const stringGain = this.ctx.createGain();
      stringGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      // LFO for slow meditative phasing
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.15 + idx * 0.05, this.ctx.currentTime);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(stringGain.gain);

      osc.connect(filter);
      filter.connect(stringGain);
      stringGain.connect(this.droneGain);

      osc.start();
      lfo.start();
      this.activeNodes.push(osc, lfo);
    });
  }

  /**
   * Warm evening breeze and flickering diya crackle bed
   */
  startAtmosphericEmber() {
    // Generate pink-tinted noise buffer
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.12;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter for soft warm breeze
    const breezeFilter = this.ctx.createBiquadFilter();
    breezeFilter.type = 'lowpass';
    breezeFilter.frequency.setValueAtTime(450, this.ctx.currentTime);

    whiteNoise.connect(breezeFilter);
    breezeFilter.connect(this.ambienceGain);
    whiteNoise.start();
    this.activeNodes.push(whiteNoise);
  }

  /**
   * Indian Brass Temple Bell (Ghanti) sound effect
   * Plays harmonic bell partials whenever a new chapter is entered
   */
  playTempleBell(freq = 660) {
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Bell partial ratios: 1 (hum), 2.76 (tierce), 5.4 (quint), 8.9 (octave)
    const partials = [
      { f: freq * 0.5, gain: 0.15, decay: 3.5 },
      { f: freq * 1.0, gain: 0.35, decay: 2.8 },
      { f: freq * 1.58, gain: 0.18, decay: 2.2 },
      { f: freq * 2.76, gain: 0.12, decay: 1.4 },
      { f: freq * 4.07, gain: 0.08, decay: 0.8 },
      { f: freq * 6.32, gain: 0.04, decay: 0.4 }
    ];

    partials.forEach(p => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(p.f, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(p.gain, now + 0.008); // sharp transient strike
      gain.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + p.decay + 0.1);
    });
  }

  /**
   * Sitar String Pluck resonance
   */
  playSitarStrum(noteFreq = 330) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(noteFreq, now);

    // Resonant jawari filter envelope
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(noteFreq * 3, now);
    filter.frequency.exponentialRampToValueAtTime(noteFreq, now + 1.2);
    filter.Q.setValueAtTime(5, now);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 1.9);
  }

  /**
   * Trigger on chapter change
   */
  onChapterEnter(chapterIndex) {
    if (this.currentChapter !== chapterIndex) {
      this.currentChapter = chapterIndex;
      // Play musical chime with varying scale degree
      const bellPitches = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.5];
      const pitch = bellPitches[chapterIndex % bellPitches.length];
      this.playTempleBell(pitch);
      this.playSitarStrum(pitch * 0.75);
    }
  }
}

window.diwaliAudio = new DiwaliAudioEngine();

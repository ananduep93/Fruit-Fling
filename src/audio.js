// Procedural Web Audio API Sound Synthesizer
const backgroundMusicUrl = './src/Music/Background music.mpeg';

class AudioSynth {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    
    this.musicInterval = null;
    this.musicTempo = 110; // BPM
    this.musicStep = 0;
    this.musicPlaying = false;
    
    // Simple scales: Pentatonic major for happy worlds, minor for temples/volcanoes
    this.scales = {
      major: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25], // C Major Pentatonic (C4-C5)
      minor: [220.00, 246.94, 261.63, 329.63, 392.00, 440.00], // A Minor Pentatonic
      space: [293.66, 349.23, 392.00, 440.00, 523.25, 587.33]  // D Minor Pentatonic
    };
    
    this.currentScale = 'major';
  }

  init() {
    if (this.ctx) return;
    
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    
    this.ctx = new AudioContextClass();
    
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.connect(this.masterGain);
    this.sfxGain.gain.setValueAtTime(storage.getSetting('soundVolume'), this.ctx.currentTime);
    
    this.musicGain = this.ctx.createGain();
    this.musicGain.connect(this.masterGain);
    this.musicGain.gain.setValueAtTime(storage.getSetting('musicVolume'), this.ctx.currentTime);

    // Initialize background music
    if (!this.bgMusic) {
      this.bgMusic = new Audio(backgroundMusicUrl);
      this.bgMusic.loop = true;
      this.bgMusic.volume = storage.getSetting('musicVolume');
    }
    
    // Auto-resume on user action (chrome policy)
    window.addEventListener('click', () => {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      if (this.musicPlaying && this.bgMusic && this.bgMusic.paused && storage.getSetting('musicVolume') > 0) {
        this.bgMusic.play().catch(err => console.log("Music play blocked:", err));
      }
    }, { once: true });
  }

  updateVolumes() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.sfxGain.gain.setTargetAtTime(storage.getSetting('soundVolume'), now, 0.1);
    this.musicGain.gain.setTargetAtTime(storage.getSetting('musicVolume'), now, 0.1);
    if (this.bgMusic) {
      this.bgMusic.volume = storage.getSetting('musicVolume');
      if (storage.getSetting('musicVolume') <= 0) {
        this.bgMusic.pause();
      } else if (this.musicPlaying && this.bgMusic.paused) {
        this.bgMusic.play().catch(err => console.log("Music play blocked:", err));
      }
    }
  }

  // Helper: Noise Generator (for impacts, explosions, wind)
  createNoiseBuffer() {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // --- SOUND EFFECTS ---

  playSfx(type) {
    this.init();
    if (!this.ctx || this.ctx.state === 'suspended') return;
    if (storage.getSetting('soundVolume') <= 0) return;

    const now = this.ctx.currentTime;

    switch (type) {
      case 'stretch':
        this.playStretch(now);
        break;
      case 'launch':
        this.playLaunch(now);
        break;
      case 'impact_wood':
        this.playImpactWood(now);
        break;
      case 'impact_bamboo':
        this.playImpactBamboo(now);
        break;
      case 'impact_stone':
        this.playImpactStone(now);
        break;
      case 'impact_metal':
        this.playImpactMetal(now);
        break;
      case 'impact_glass':
      case 'impact_ice':
        this.playImpactGlass(now);
        break;
      case 'explosion':
        this.playExplosion(now);
        break;
      case 'monkey_hit':
        this.playMonkeyHit(now);
        break;
      case 'monkey_laugh':
        this.playMonkeyLaugh(now);
        break;
      case 'victory':
        this.playVictoryJingle(now);
        break;
      case 'defeat':
        this.playDefeatJingle(now);
        break;
      case 'click':
        this.playClick(now);
        break;
      case 'split':
        this.playSplit(now);
        break;
      case 'boost':
        this.playBoost(now);
        break;
    }
  }

  playClick(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, time);
    osc.frequency.exponentialRampToValueAtTime(100, time + 0.05);
    
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    
    osc.start(time);
    osc.stop(time + 0.06);
  }

  playStretch(time) {
    // Slingshot elastic creaking
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(60, time);
    osc.frequency.linearRampToValueAtTime(120, time + 0.1);
    
    // Tremolo to simulate creaking rope/rubber
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(12, time);
    lfoGain.gain.setValueAtTime(40, time);
    
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    
    gain.gain.setValueAtTime(0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    
    lfo.start(time);
    osc.start(time);
    
    lfo.stop(time + 0.16);
    osc.stop(time + 0.16);
  }

  playLaunch(time) {
    // Swoosh sound
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer();
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(200, time);
    filter.frequency.exponentialRampToValueAtTime(1200, time + 0.2);
    filter.Q.setValueAtTime(2.0, time);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.25);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    
    noise.start(time);
    noise.stop(time + 0.3);
  }

  playImpactWood(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);
    
    gain.gain.setValueAtTime(0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(time);
    osc.stop(time + 0.13);
  }

  playImpactBamboo(time) {
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, time);
    osc.frequency.exponentialRampToValueAtTime(120, time + 0.08);
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(540, time);
    osc2.frequency.exponentialRampToValueAtTime(180, time + 0.08);
    
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.09);
    
    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);
    
    osc.start(time);
    osc2.start(time);
    osc.stop(time + 0.1);
    osc2.stop(time + 0.1);
  }

  playImpactStone(time) {
    // Low rumble + high crack
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, time);
    osc.frequency.linearRampToValueAtTime(30, time + 0.15);
    
    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.18);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(time);
    osc.stop(time + 0.2);
    
    // Crackle noise
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, time);
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.06);
    
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    
    noise.start(time);
    noise.stop(time + 0.08);
  }

  playImpactMetal(time) {
    // Ringing bell synthesis using multiple FM frequencies
    const freqs = [350, 480, 520, 680, 890];
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.005, time + 0.45);
    
    freqs.forEach(f => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, time);
      osc.connect(gain);
      osc.start(time);
      osc.stop(time + 0.5);
    });
    
    gain.connect(this.sfxGain);
  }

  playImpactGlass(time) {
    const freqs = [1500, 2200, 3100];
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
    
    freqs.forEach(f => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, time);
      osc.connect(gain);
      osc.start(time);
      osc.stop(time + 0.18);
    });
    
    gain.connect(this.sfxGain);
  }

  playExplosion(time) {
    // Low rumble noise
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer();
    
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(300, time);
    lp.frequency.exponentialRampToValueAtTime(20, time + 1.2);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 1.5);
    
    noise.connect(lp);
    lp.connect(gain);
    gain.connect(this.sfxGain);
    
    noise.start(time);
    noise.stop(time + 1.6);

    // High explosion snap
    const snapOsc = this.ctx.createOscillator();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(250, time);
    snapOsc.frequency.exponentialRampToValueAtTime(40, time + 0.15);
    
    const snapGain = this.ctx.createGain();
    snapGain.gain.setValueAtTime(0.6, time);
    snapGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
    
    snapOsc.connect(snapGain);
    snapGain.connect(this.sfxGain);
    
    snapOsc.start(time);
    snapOsc.stop(time + 0.2);
  }

  playMonkeyHit(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350, time);
    osc.frequency.linearRampToValueAtTime(800, time + 0.08);
    osc.frequency.linearRampToValueAtTime(400, time + 0.15);
    
    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.16);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    
    osc.start(time);
    osc.stop(time + 0.17);
  }

  playMonkeyLaugh(time) {
    // 3 brief squeaky chirps
    for (let i = 0; i < 3; i++) {
      const startTime = time + i * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(500, startTime);
      osc.frequency.linearRampToValueAtTime(900, startTime + 0.06);
      
      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.08);
      
      osc.connect(gain);
      gain.connect(this.sfxGain);
      
      osc.start(startTime);
      osc.stop(startTime + 0.09);
    }
  }

  playSplit(time) {
    // 3 small popping bursts
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, time);
    osc.frequency.linearRampToValueAtTime(1000, time + 0.05);
    
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.06);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    
    osc.start(time);
    osc.stop(time + 0.07);
  }

  playBoost(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, time);
    osc.frequency.exponentialRampToValueAtTime(1200, time + 0.25);
    
    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.28);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    
    osc.start(time);
    osc.stop(time + 0.3);
  }

  playVictoryJingle(time) {
    // Removed as per user request
  }

  playDefeatJingle(time) {
    // Removed as per user request
  }

  // --- PROCEDURAL MUSIC SYNTHESIS ---

  setWorldMusicScale(worldId) {
    if (worldId === 'world_1' || worldId === 'world_2') {
      this.currentScale = 'major';
      this.musicTempo = 110;
    } else if (worldId === 'world_3' || worldId === 'world_4') {
      this.currentScale = 'minor';
      this.musicTempo = 100;
    } else {
      this.currentScale = 'space';
      this.musicTempo = 120;
    }
  }

  startMusic() {
    this.init();
    this.musicPlaying = true;
    if (this.bgMusic && storage.getSetting('musicVolume') > 0) {
      this.bgMusic.play().catch(err => console.log("Music play blocked:", err));
    }
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.bgMusic) {
      this.bgMusic.pause();
    }
  }

  playMusicStep(time) {
    if (storage.getSetting('musicVolume') <= 0) return;

    const scale = this.scales[this.currentScale];
    const step = this.musicStep;

    // 1. Kick Drum (synthesized, on steps 0, 4, 8, 12)
    if (step % 4 === 0) {
      this.synthesizeKick(time);
    }

    // 2. Hi-Hat (on steps 2, 6, 10, 14, and sometimes offbeats)
    if (step % 2 === 2 || (step % 4 === 1 && Math.random() < 0.2)) {
      this.synthesizeHiHat(time);
    }

    // 3. Bassline (synthesized)
    // Plays a simple bass pattern
    let bassNoteIndex = 0;
    let playBass = false;
    
    if (step === 0 || step === 3 || step === 6 || step === 8 || step === 11 || step === 14) {
      playBass = true;
      if (step === 0 || step === 8) bassNoteIndex = 0; // tonic
      else if (step === 3 || step === 11) bassNoteIndex = 2; // third
      else bassNoteIndex = 3; // fifth or fourth
    }
    
    if (playBass) {
      const bassFreq = scale[bassNoteIndex] / 4; // 2 octaves down
      this.synthesizeBass(bassFreq, time, step % 8 === 0 ? 0.35 : 0.18);
    }

    // 4. Melodic Arpeggios (tropical synth, cute pattern)
    // Plays on specific steps with some randomness
    let playMelody = false;
    let melodyNoteIndex = 0;
    
    const melodyPattern = [
      4, -1, 5, 2,  // 0-3
      -1, 3, 1, 4,  // 4-7
      5, 7, -1, 3,  // 8-11
      -1, 2, 0, -1  // 12-15
    ];
    
    const noteVal = melodyPattern[step];
    if (noteVal !== -1 && Math.random() < 0.8) {
      playMelody = true;
      // Get scale frequency (might map to higher octave if pattern notes > scale length)
      const oct = Math.floor(noteVal / scale.length);
      const idx = noteVal % scale.length;
      melodyNoteIndex = scale[idx] * Math.pow(2, oct);
    }
    
    if (playMelody) {
      this.synthesizeMelody(melodyNoteIndex, time);
    }
  }

  synthesizeKick(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.12);
    
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);
    
    osc.connect(gain);
    gain.connect(this.musicGain);
    
    osc.start(time);
    osc.stop(time + 0.13);
  }

  synthesizeHiHat(time) {
    const source = this.ctx.createBufferSource();
    source.buffer = this.createNoiseBuffer();
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.07, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);
    
    source.start(time);
    source.stop(time + 0.05);
  }

  synthesizeBass(freq, time, duration) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    
    gain.gain.setValueAtTime(0.28, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
    
    osc.connect(gain);
    gain.connect(this.musicGain);
    
    osc.start(time);
    osc.stop(time + duration + 0.02);
  }

  synthesizeMelody(freq, time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Smooth wood-block synth tone (triangle/sine blend or soft triangle)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    
    // Add sub-oscillator for warmth
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(freq * 1.5, time); // fifth harmonic
    
    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.05, time);
    subOsc.connect(subGain);
    subGain.connect(gain);

    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);
    
    osc.connect(gain);
    gain.connect(this.musicGain);
    
    osc.start(time);
    subOsc.start(time);
    osc.stop(time + 0.25);
    subOsc.stop(time + 0.25);
  }
}

const audio = new AudioSynth();
window.audio = audio;

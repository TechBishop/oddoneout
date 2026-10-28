/**
 * Odd One Out — Procedural Web Audio Synthesizer & Mobile Haptics
 * 2026 Casual Party Audio Engine (Juicy, Tactile, Nintendo/Jackbox Inspired)
 */
(function () {
  class SoundHapticsEngine {
    constructor() {
      this.ctx = null;
      this.soundEnabled = true;
      this.hapticsEnabled = true;
    }

    initContext() {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }

    setPreferences({ sound, haptics }) {
      if (typeof sound === 'boolean') this.soundEnabled = sound;
      if (typeof haptics === 'boolean') this.hapticsEnabled = haptics;
    }

    vibrate(pattern) {
      if (!this.hapticsEnabled) return;
      try {
        if (navigator && typeof navigator.vibrate === 'function') {
          navigator.vibrate(pattern);
        }
      } catch (_) {}
    }

    playTone({ freq = 440, endFreq = null, type = 'sine', duration = 0.12, gain = 0.14, delay = 0 }) {
      if (!this.soundEnabled) return;
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const amp = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (endFreq !== null) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
      }

      amp.gain.setValueAtTime(0.0001, now);
      amp.gain.linearRampToValueAtTime(gain, now + 0.012);
      amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(amp);
      amp.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.015);
    }

    // Playful bubble-pop on button taps
    playTap() {
      this.vibrate(8);
      this.playTone({ freq: 580, endFreq: 780, type: 'triangle', duration: 0.045, gain: 0.08 });
      this.playTone({ freq: 880, endFreq: 1100, type: 'sine', duration: 0.035, gain: 0.05, delay: 0.01 });
    }

    // Whoosh when transitioning cards or screens
    playWhoosh() {
      if (!this.soundEnabled) return;
      this.playTone({ freq: 320, endFreq: 160, type: 'triangle', duration: 0.08, gain: 0.04 });
    }

    // Short launch sting when starting a run
    playLaunch() {
      this.vibrate([12, 30, 18]);
      this.playTone({ freq: 330, endFreq: 440, type: 'triangle', duration: 0.09, gain: 0.11, delay: 0 });
      this.playTone({ freq: 440, endFreq: 659.25, type: 'triangle', duration: 0.11, gain: 0.12, delay: 0.06 });
      this.playTone({ freq: 659.25, endFreq: 880, type: 'sine', duration: 0.18, gain: 0.15, delay: 0.12 });
    }

    // Final countdown tick: rhythmic heartbeats
    playTick(secondsLeft) {
      this.vibrate(10);
      const isUrgent = secondsLeft <= 2;
      this.playTone({
        freq: isUrgent ? 1040 : 820,
        endFreq: isUrgent ? 920 : 740,
        type: 'sine',
        duration: 0.055,
        gain: isUrgent ? 0.15 : 0.09
      });
      if (isUrgent) {
        this.playTone({ freq: 520, endFreq: 460, type: 'triangle', duration: 0.04, gain: 0.06, delay: 0.02 });
      }
    }

    // Rich dual-tone confirmation chime with streak pitch escalation
    playCorrect(streak = 1) {
      this.vibrate(18);
      const semitoneShift = Math.min(streak, 24);
      const baseFreq = 523.25 * Math.pow(2, semitoneShift / 40);
      // Root note (bright triangle)
      this.playTone({ freq: baseFreq, endFreq: baseFreq * 1.15, type: 'triangle', duration: 0.08, gain: 0.13, delay: 0 });
      // Major third (harmonious bell sine)
      this.playTone({ freq: baseFreq * 1.2599, endFreq: baseFreq * 1.35, type: 'sine', duration: 0.12, gain: 0.11, delay: 0.04 });
      // Perfect fifth sparkle
      this.playTone({ freq: baseFreq * 1.4983, endFreq: baseFreq * 1.6, type: 'sine', duration: 0.16, gain: 0.13, delay: 0.07 });
    }

    // Upbeat celebratory fanfare on 5x streak milestones & Personal Bests
    playMilestone(streak = 5) {
      this.vibrate([24, 40, 25, 45, 55]);
      // Triad flourish: C5, E5, G5, C6 with trailing shimmer
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((n, idx) => {
        this.playTone({
          freq: n,
          endFreq: n * 1.04,
          type: 'triangle',
          duration: idx === notes.length - 1 ? 0.28 : 0.1,
          gain: 0.15,
          delay: idx * 0.065
        });
      });
      // Harmony shimmer on the final hit
      this.playTone({ freq: 1318.5, endFreq: 1318.5, type: 'sine', duration: 0.32, gain: 0.12, delay: 0.22 });
    }

    // Playful comic wobble/thud on miss or timeout
    playMiss(isTimeout = false) {
      this.vibrate([45, 50, 75]);
      if (isTimeout) {
        this.playTone({ freq: 420, endFreq: 120, type: 'sawtooth', duration: 0.26, gain: 0.12, delay: 0 });
        this.playTone({ freq: 260, endFreq: 85, type: 'triangle', duration: 0.32, gain: 0.14, delay: 0.08 });
      } else {
        // Comic double-thud
        this.playTone({ freq: 240, endFreq: 150, type: 'triangle', duration: 0.12, gain: 0.14, delay: 0 });
        this.playTone({ freq: 170, endFreq: 100, type: 'sawtooth', duration: 0.24, gain: 0.15, delay: 0.09 });
      }
    }

    // Rewarded Sparks or unlock chime
    playReward() {
      this.vibrate([15, 30, 25]);
      this.playTone({ freq: 587.33, type: 'sine', duration: 0.09, gain: 0.13, delay: 0 });
      this.playTone({ freq: 880, type: 'sine', duration: 0.11, gain: 0.14, delay: 0.07 });
      this.playTone({ freq: 1174.66, type: 'triangle', duration: 0.22, gain: 0.16, delay: 0.14 });
    }

    // High-voltage electric zap / laser streak when center sparks fly to balance
    playZap() {
      if (!this.soundEnabled) return;
      this.vibrate([12, 16, 20]);
      this.playTone({ freq: 940, endFreq: 1880, type: 'sawtooth', duration: 0.075, gain: 0.1 });
      this.playTone({ freq: 1880, endFreq: 2800, type: 'sine', duration: 0.11, gain: 0.12, delay: 0.02 });
    }
  }

  window.oneShotAudio = new SoundHapticsEngine();
})();

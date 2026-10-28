/**
 * ONE SHOT — Procedural Web Audio Synthesizer & Mobile Haptics
 * Implements GDD Section 11:
 * - Short launch sting
 * - Final-two-second tick
 * - Confirmation click with pitch escalation
 * - Miss buzzer
 * - Music escalation every five streaks
 * - Sound and haptic toggles
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

    playTap() {
      this.vibrate(8);
      this.playTone({ freq: 520, endFreq: 660, type: 'triangle', duration: 0.045, gain: 0.07 });
    }

    // Short launch sting when starting a run
    playLaunch() {
      this.vibrate([12, 30, 18]);
      this.playTone({ freq: 330, endFreq: 440, type: 'triangle', duration: 0.09, gain: 0.11, delay: 0 });
      this.playTone({ freq: 440, endFreq: 659.25, type: 'triangle', duration: 0.11, gain: 0.12, delay: 0.06 });
      this.playTone({ freq: 659.25, endFreq: 880, type: 'sine', duration: 0.18, gain: 0.15, delay: 0.12 });
    }

    // Final-two-second countdown tick
    playTick(secondsLeft) {
      this.vibrate(10);
      const isFinalSecond = secondsLeft <= 1;
      this.playTone({
        freq: isFinalSecond ? 980 : 760,
        endFreq: isFinalSecond ? 880 : 700,
        type: 'sine',
        duration: 0.06,
        gain: isFinalSecond ? 0.14 : 0.09
      });
    }

    // Confirmation click + streak escalation
    playCorrect(streak = 1) {
      this.vibrate(18);
      // Escalate base pitch smoothly across extended streaks (capped so it stays musical)
      const semitoneShift = Math.min(streak, 28);
      const baseFreq = 523.25 * Math.pow(2, semitoneShift / 42);
      this.playTone({ freq: baseFreq, endFreq: baseFreq * 1.25, type: 'triangle', duration: 0.09, gain: 0.13, delay: 0 });
      this.playTone({ freq: baseFreq * 1.25, endFreq: baseFreq * 1.5, type: 'sine', duration: 0.15, gain: 0.15, delay: 0.055 });
    }

    // Music escalation every five streaks
    playMilestone(streak = 5) {
      this.vibrate([22, 40, 25, 40, 45]);
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((n, idx) => {
        this.playTone({
          freq: n,
          endFreq: n * 1.03,
          type: 'triangle',
          duration: idx === notes.length - 1 ? 0.26 : 0.11,
          gain: 0.15,
          delay: idx * 0.065
        });
      });
    }

    // Miss buzzer or timeout down-sweep
    playMiss(isTimeout = false) {
      this.vibrate([45, 50, 75]);
      if (isTimeout) {
        this.playTone({ freq: 380, endFreq: 130, type: 'sawtooth', duration: 0.28, gain: 0.13, delay: 0 });
        this.playTone({ freq: 240, endFreq: 95, type: 'sawtooth', duration: 0.32, gain: 0.12, delay: 0.1 });
      } else {
        this.playTone({ freq: 195, endFreq: 140, type: 'sawtooth', duration: 0.16, gain: 0.13, delay: 0 });
        this.playTone({ freq: 155, endFreq: 105, type: 'sawtooth', duration: 0.26, gain: 0.14, delay: 0.11 });
      }
    }

    // Rewarded Sparks or unlock chime
    playReward() {
      this.vibrate([15, 30, 25]);
      this.playTone({ freq: 587.33, type: 'sine', duration: 0.09, gain: 0.13, delay: 0 });
      this.playTone({ freq: 880, type: 'sine', duration: 0.11, gain: 0.14, delay: 0.07 });
      this.playTone({ freq: 1174.66, type: 'triangle', duration: 0.22, gain: 0.16, delay: 0.14 });
    }
  }

  window.oneShotAudio = new SoundHapticsEngine();
})();

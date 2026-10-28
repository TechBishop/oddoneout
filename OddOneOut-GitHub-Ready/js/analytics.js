/**
 * ONE SHOT — Telemetry & Analytics Dispatcher
 * Implements GDD Section 13 (17 event hooks + key retention metrics)
 */
(function () {
  const STORAGE_KEY = 'oneshot_analytics_v1';

  class OneShotAnalytics {
    constructor() {
      this.sessionStart = Date.now();
      this.sessionRounds = 0;
      this.events = [];
      this.counts = {};
      this.load();
    }

    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          this.counts = parsed.counts || {};
          this.events = (parsed.events || []).slice(-60);
        }
      } catch (_) {
        this.counts = {};
        this.events = [];
      }
    }

    save() {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            counts: this.counts,
            events: this.events.slice(-60)
          })
        );
      } catch (_) {}
    }

    track(eventName, props = {}) {
      const entry = {
        event: eventName,
        ts: new Date().toISOString(),
        props
      };

      if (eventName === 'round_started') {
        this.sessionRounds += 1;
      }

      this.counts[eventName] = (this.counts[eventName] || 0) + 1;
      this.events.push(entry);
      if (this.events.length > 60) {
        this.events.shift();
      }
      this.save();

      // Forward to PostHog / Plausible / Firebase / GA if integrated
      try {
        if (window.posthog && typeof window.posthog.capture === 'function') {
          window.posthog.capture(eventName, props);
        }
        if (window.plausible && typeof window.plausible === 'function') {
          window.plausible(eventName, { props });
        }
        if (window.gtag && typeof window.gtag === 'function') {
          window.gtag('event', eventName, props);
        }
      } catch (_) {}

      return entry;
    }

    getSummary() {
      const sessionSec = Math.max(1, Math.round((Date.now() - this.sessionStart) / 1000));
      const offered = this.counts.rewarded_ad_offered || 0;
      const completed = this.counts.rewarded_ad_completed || 0;
      const optInPct = offered > 0 ? Math.round((completed / offered) * 100) : 0;

      return {
        sessionSec,
        sessionRounds: this.sessionRounds,
        totalRuns: this.counts.play_started || 0,
        totalCorrect: this.counts.answer_correct || 0,
        totalWrong: (this.counts.answer_wrong || 0) + (this.counts.timer_expired || 0),
        rewardedOptInPct: optInPct,
        counts: { ...this.counts },
        recentEvents: [...this.events].reverse().slice(0, 20)
      };
    }
  }

  window.oneShotAnalytics = new OneShotAnalytics();
})();

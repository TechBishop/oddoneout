/**
 * ONE SHOT — Core Game Engine (5,555 Sets: 4,200 Standard + 1,355 After Dark 18+)
 * Implements ONE SHOT Game Design Document v1.0 + Mega Party Pack Expansion & Adult Mode
 */
(function () {
  const $ = (id) => document.getElementById(id);
  const APP_VERSION = '1.3.9';
  const ADS_TEST_MODE = true; // Set to true for guaranteed Google test ads; false for live store ads
  const SAVE_KEY = 'oneshot_save_v1';
  console.log(`%c⚡ ODD ONE OUT v${APP_VERSION} INITIALIZED (ADS_TEST_MODE=${ADS_TEST_MODE})`, 'color: #33e6ff; font-weight: 900; font-size: 13px;');

  const STANDARD_PACKS = [
    'General Knowledge',
    'Gaming',
    'Horror',
    'Movies and TV',
    'Sci-Fi',
    'Food',
    'Cars and Machines',
    'Internet Culture',
    'Family-Friendly',
    'Retro Arcade'
  ];

  const ADULT_PACKS = [
    'After Dark: Nightlife & Booze',
    'After Dark: Dating & Hookups',
    'After Dark: Spicy Double Entendres',
    'After Dark: R-Rated Pop Culture',
    'After Dark: Messy Adulting'
  ];

  const STARTER_PACKS = [
    'General Knowledge',
    'Food',
    'Family-Friendly',
    'After Dark: Nightlife & Booze'
  ];

  const PACK_PRICING = {
    // Starters (0 Sparks / Unlocked - 1,531 free question sets)
    'General Knowledge': 0,
    'Food': 0,
    'Family-Friendly': 0,
    'After Dark: Nightlife & Booze': 0,

    // Tier 1: Early Discovery (250 Sparks - achievable in ~4-6 runs)
    'Movies and TV': 250,
    'Internet Culture': 250,

    // Tier 2: Core Hobbies & Dating (500 Sparks - ~12-15 runs)
    'Gaming': 500,
    'Cars and Machines': 500,
    'After Dark: Dating & Hookups': 500,

    // Tier 3: Hardcore Themes & Innuendo (750-850 Sparks - ~20-25 runs)
    'Sci-Fi': 750,
    'Horror': 750,
    'Retro Arcade': 850,
    'After Dark: Spicy Double Entendres': 750,

    // Tier 4: Apex Party & R-Rated Pop Culture (850-1,000 Sparks - ~30-35 runs)
    'After Dark: R-Rated Pop Culture': 850,
    'After Dark: Messy Adulting': 1000
  };

  const PACK_META = {
    'General Knowledge': { icon: '🌐', tier: 'Starter Topic' },
    'Food': { icon: '🍔', tier: 'Starter Topic' },
    'Family-Friendly': { icon: '🎈', tier: 'Starter Topic' },
    'Movies and TV': { icon: '🎬', tier: 'Pop Culture' },
    'Internet Culture': { icon: '📱', tier: 'Pop Culture' },
    'Gaming': { icon: '👾', tier: 'Hobbies & Games' },
    'Cars and Machines': { icon: '🏎️', tier: 'Hobbies & Machines' },
    'Sci-Fi': { icon: '🛸', tier: 'Cinema & Books' },
    'Horror': { icon: '💀', tier: 'Cinema & Books' },
    'Retro Arcade': { icon: '🕹️', tier: 'Classic Gaming' },
    'After Dark: Nightlife & Booze': { icon: '🍸', tier: '18+ Starter' },
    'After Dark: Dating & Hookups': { icon: '💋', tier: '18+ Romance' },
    'After Dark: Spicy Double Entendres': { icon: '🌶️', tier: '18+ Innuendo' },
    'After Dark: R-Rated Pop Culture': { icon: '🍿', tier: '18+ Movies & TV' },
    'After Dark: Messy Adulting': { icon: '💼', tier: '18+ Humor' }
  };

  const COSMETICS = {
    themes: [
      { id: 'bg_default', type: 'bg', value: 'default', name: 'Neon Arcade (Default)', desc: 'Dark navy base with hot pink & cyan glow', price: 0 },
      { id: 'bg_matrix', type: 'bg', value: 'cyber_matrix', name: 'Cyber Matrix', desc: 'Emerald grid glow & deep bio-tech panels', price: 250 },
      { id: 'bg_solar', type: 'bg', value: 'solar_flare', name: 'Solar Flare', desc: 'Crimson heatwave & golden ember backdrop', price: 250 },
      { id: 'bg_void', type: 'bg', value: 'abyssal_void', name: 'Abyssal Void', desc: 'Ultraviolet deep-space nebula atmosphere', price: 250 },
      { id: 'skin_default', type: 'skin', value: 'default', name: 'Hot Wire UI (Default)', desc: 'Signature hot-pink & electric-cyan accents', price: 0 },
      { id: 'skin_gold', type: 'skin', value: 'gold_rush', name: 'Gold Rush UI Skin', desc: 'Championship gold & solar orange buttons', price: 500 },
      { id: 'skin_ice', type: 'skin', value: 'glacier_ice', name: 'Glacier Ice UI Skin', desc: 'Sub-zero diamond cyan & cobalt trim', price: 500 }
    ],
    badges: [
      { id: 'pack_cryptid', type: 'event_pack', value: 'cryptid', name: 'Cryptid & Arcade Vault Pass', desc: 'Permanent VIP badge + style flair on Share Cards', price: 750 },
      { id: 'badge_bolt', type: 'badge', value: '⚡', name: 'Spark Striker Share Badge', desc: 'Default lightning emblem on Share Cards', price: 0 },
      { id: 'badge_crown', type: 'badge', value: '👑', name: 'Apex Crown Share Style', desc: 'Unlock royal crown header & border on Share Cards', price: 1000 },
      { id: 'vip_pass', type: 'vip', value: 'vip', name: 'VIP Crown Pass', desc: 'Permanent Gold VIP badge & prestige glow on Share Cards', price: 1500 }
    ]
  };

  function createSeededRandom(seedStr) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seedStr.length; i++) {
      h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
    }
    let a = h >>> 0;
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function getTodayKey() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function getYesterdayKey() {
    const d = new Date(Date.now() - 86400000);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  class OneShotApp {
    constructor() {
      this.packs = Array.isArray(window.ONE_SHOT_FALLBACK_PACKS)
        ? [...window.ONE_SHOT_FALLBACK_PACKS]
        : [];
      this.state = this.loadState();

      // Active run variables
      this.mode = 'quick'; // 'quick' | 'daily' | 'duel'
      this.streak = 0;
      this.round = 0;
      this.runSparks = 0;
      this.activeSet = null;
      this.activeValidSample = [];
      this.usedIds = new Set();
      this.sessionUsedIds = new Set(Array.isArray(this.state.recentIds) ? this.state.recentIds : []);
      this.answered = false;
      this.continueUsedThisRun = false;
      this.reviveBreatherActive = false;
      this.doubleUsedThisResult = false;
      this.newBestAwardedThisRun = false;
      this.boost2xActive = false;
      this.savedDeathStreak = 0;
      this.roundHistory = [];

      // Timer state
      this.timerRaf = null;
      this.roundDuration = 12;
      this.roundStartTime = 0;
      this.roundPhase = 'warmup';
      this.pausedRemaining = null;
      this.lastTickSecond = 99;
      this.lastReactionTime = 0;
      this.lastTimeRemaining = 0;

      // Daily & Duel state
      this.dailyQueue = [];
      this.duelSeed = null;
      this.duelTarget = 0;
      this.duelRng = null;

      // Modal & Age Gate state
      this.pendingAdAction = null;
      this.pendingAdultCallback = null;
      this.adInterval = null;
      this.isAdLoading = false;
      this.shopTab = 'packs';
      this.deferredInstallPrompt = null;

      this.init();
    }

    getDefaultState() {
      return {
        sparks: 0,
        bestStreak: 0,
        completedRuns: 0,
        selectedPack: 'ALL', // 'ALL' | 'ALL_ADULT' | 'ALL_MIX' | specific pack name
        enabledPacks: ['General Knowledge', 'Food', 'Family-Friendly'],
        adultMode: 'off', // 'off' | 'only' | 'mix'
        adultVerified: false,
        unlocked: ['bg_default', 'skin_default', 'badge_bolt'],
        unlockedPacks: [...STARTER_PACKS],
        equippedBg: 'default',
        equippedSkin: 'default',
        equippedBadge: '⚡',
        adsRemoved: true,
        packPreviewRoundsLeft: 0,
        packPreviewName: null,
        nextRound2xBoost: false,
        daily: {
          lastPlayedDate: null,
          lastCompletedDate: null,
          streak: 0,
          todayScore: 0,
          todayCompleted: false,
          todayHistory: []
        },
        settings: {
          sound: true,
          haptics: true,
          reducedMotion: false,
          timerPace: 'progressive' // 'progressive' (12s->3.5s) | 'relaxed' (15s->5.0s) | 'blitz' (7s->3.0s)
        }
      };
    }

    loadState() {
      const def = this.getDefaultState();
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return def;
        const parsed = JSON.parse(raw);
        const unlockedPacks = Array.isArray(parsed.unlockedPacks) && parsed.unlockedPacks.length > 0
          ? parsed.unlockedPacks
          : def.unlockedPacks;

        let enabledPacks = Array.isArray(parsed.enabledPacks)
          ? parsed.enabledPacks.filter((p) => unlockedPacks.includes(p))
          : null;

        if (!enabledPacks || enabledPacks.length === 0) {
          if (parsed.selectedPack && parsed.selectedPack !== 'ALL' && unlockedPacks.includes(parsed.selectedPack)) {
            enabledPacks = [parsed.selectedPack];
          } else {
            enabledPacks = unlockedPacks.filter((p) =>
              parsed.adultMode === 'only'
                ? ADULT_PACKS.includes(p)
                : (parsed.adultMode === 'mix' ? true : !ADULT_PACKS.includes(p))
            );
            if (enabledPacks.length === 0) enabledPacks = [STARTER_PACKS[0]];
          }
        }

        return {
          ...def,
          ...parsed,
          unlockedPacks,
          enabledPacks,
          daily: { ...def.daily, ...(parsed.daily || {}) },
          settings: { ...def.settings, ...(parsed.settings || {}) }
        };
      } catch (_) {
        return def;
      }
    }

    saveState() {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
      } catch (_) {}
      this.syncHeaderAndHome();
    }

    async init() {
      this.applyCosmeticsAndSettings();
      this.syncHeaderAndHome();

      if (window.oneShotAnalytics) {
        window.oneShotAnalytics.track('game_opened', {
          bestStreak: this.state.bestStreak,
          sparks: this.state.sparks,
          totalSets: this.packs.length
        });
      }

      // Load packs from external JSON (GDD Section 10 & 14)
      try {
        const res = await fetch('./data/packs.json');
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json) && json.length > 0) {
            this.packs = json;
            this.syncHeaderAndHome();
          }
        }
      } catch (_) {
        // Offline or file:// fallback already loaded in this.packs
      }

      // Register Service Worker for offline PWA support
      if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      }

      // Capture PWA install prompt
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        this.deferredInstallPrompt = e;
      });

      // Auto-pause active round timer if user switches apps or locks phone screen
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && this.isRoundActive() && this.pausedRemaining === null) {
          this.openSettings();
        }
      });

      this.checkUrlParams();
    }

    isRoundActive() {
      const gameEl = document.getElementById('game');
      return !!(gameEl && gameEl.classList.contains('active') && !this.answered && this.activeSet);
    }

    handleHeaderNav(target) {
      // Protect active timed runs from accidental header taps by opening Pause/Settings
      if (this.isRoundActive()) {
        this.openSettings();
        return;
      }
      const currentScreen = document.querySelector('.screen.active');
      if (currentScreen && currentScreen.id === 'shop' && target !== 'packs') {
        const counts = this.getPackCounts();
        if (counts.activeSets === 0) {
          if (window.oneShotAudio) window.oneShotAudio.playMiss(false);
          this.showFloatingBurst('⚠️ Select at least 1 topic before leaving!');
          const summary = document.querySelector('.packs-pool-summary');
          if (summary) {
            summary.classList.remove('shake');
            void summary.offsetWidth;
            summary.classList.add('shake');
          }
          return;
        }
      }
      if (target === 'home') this.showScreen('home');
      else if (target === 'themes') this.openShop('themes');
      else if (target === 'packs') this.openShop('packs');
    }

    checkUrlParams() {
      try {
        const params = new URLSearchParams(window.location.search);
        const duelParam = params.get('duel');
        const modeParam = params.get('mode');

        if (duelParam) {
          const parts = duelParam.split('-');
          this.duelSeed = parts[0] || 'ONESHOT';
          this.duelTarget = parseInt(parts[1] || '5', 10) || 5;
          const banner = document.getElementById('duelBanner');
          const targetEl = document.getElementById('duelTargetScore');
          if (banner && targetEl) {
            targetEl.textContent = String(this.duelTarget);
            banner.classList.remove('hidden');
          }
          const btn = document.getElementById('playQuickBtn');
          if (btn) btn.textContent = `⚔️ START CHALLENGE (BEAT ${this.duelTarget})`;
        } else if (modeParam === 'daily') {
          this.startDailyTarget();
        } else if (modeParam === 'quick') {
          this.startQuickShot();
        }
      } catch (_) {}
    }

    clearDuel() {
      this.duelSeed = null;
      this.duelTarget = 0;
      const banner = document.getElementById('duelBanner');
      if (banner) banner.classList.add('hidden');
      this.syncHeaderAndHome();
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('duel');
        window.history.replaceState({}, '', url.toString());
      } catch (_) {}
    }

    applyCosmeticsAndSettings() {
      document.body.setAttribute('data-bg', this.state.equippedBg || 'default');
      document.body.setAttribute('data-skin', this.state.equippedSkin || 'default');
      document.body.classList.toggle('reduced-motion', !!this.state.settings.reducedMotion);

      if (window.oneShotAudio) {
        window.oneShotAudio.setPreferences({
          sound: this.state.settings.sound,
          haptics: this.state.settings.haptics
        });
      }
    }

    getActivePool() {
      const unlocked = this.state.unlockedPacks || STARTER_PACKS;
      const previewPack =
        this.state.packPreviewRoundsLeft > 0 && this.state.packPreviewName
          ? this.state.packPreviewName
          : null;

      if (previewPack) {
        const matches = this.packs.filter((p) => p.pack === previewPack);
        if (matches.length > 0) return matches;
      }

      let enabled = Array.isArray(this.state.enabledPacks) && this.state.enabledPacks.length > 0
        ? this.state.enabledPacks.filter((p) => unlocked.includes(p))
        : unlocked.filter((p) => !ADULT_PACKS.includes(p));

      let pool = this.packs.filter((p) => enabled.includes(p.pack));

      if (this.state.adultMode === 'off') {
        const filtered = pool.filter((p) => !p.adult);
        if (filtered.length > 0) pool = filtered;
      } else if (this.state.adultMode === 'only') {
        const filtered = pool.filter((p) => p.adult);
        if (filtered.length > 0) pool = filtered;
      }

      if (pool.length === 0) {
        pool = this.packs.filter((p) => p.pack === STARTER_PACKS[0]);
      }
      return pool;
    }

    getPackCounts() {
      return this.getPoolCounts();
    }

    getPoolCounts() {
      const unlocked = this.state.unlockedPacks || STARTER_PACKS;
      const enabled = Array.isArray(this.state.enabledPacks)
        ? this.state.enabledPacks.filter((p) => unlocked.includes(p))
        : [];

      let std = 0;
      let adult = 0;
      let unlockedStdSets = 0;
      let unlockedAdultSets = 0;
      let activeSets = 0;

      for (let i = 0; i < this.packs.length; i++) {
        const p = this.packs[i];
        if (p.adult) {
          adult++;
          if (unlocked.includes(p.pack)) unlockedAdultSets++;
        } else {
          std++;
          if (unlocked.includes(p.pack)) unlockedStdSets++;
        }
        if (enabled.includes(p.pack)) {
          if (this.state.adultMode === 'off' && p.adult) {
            // excluded by adult filter
          } else if (this.state.adultMode === 'only' && !p.adult) {
            // excluded by adult only filter
          } else {
            activeSets++;
          }
        }
      }

      let unlockedStdPacks = 0;
      let unlockedAdultPacks = 0;
      let enabledStdPacks = 0;
      let enabledAdultPacks = 0;

      for (const pack of STANDARD_PACKS) {
        if (unlocked.includes(pack)) unlockedStdPacks++;
        if (enabled.includes(pack)) enabledStdPacks++;
      }
      for (const pack of ADULT_PACKS) {
        if (unlocked.includes(pack)) unlockedAdultPacks++;
        if (enabled.includes(pack)) enabledAdultPacks++;
      }

      return {
        std,
        adult,
        total: std + adult,
        unlockedStdSets,
        unlockedAdultSets,
        totalUnlockedSets: unlockedStdSets + unlockedAdultSets,
        unlockedStdPacks,
        unlockedAdultPacks,
        totalUnlockedPacks: unlockedStdPacks + unlockedAdultPacks,
        enabledCount: enabled.length,
        enabledStdPacks,
        enabledAdultPacks,
        activeSets
      };
    }

    syncHeaderAndHome() {
      const $ = (id) => document.getElementById(id);
      if ($('coins')) $('coins').textContent = String(this.state.sparks);
      if ($('homeBest')) $('homeBest').textContent = String(this.state.bestStreak);
      if ($('homeDailyStreak')) $('homeDailyStreak').textContent = `${this.state.daily.streak || 0}🔥`;

      const counts = this.getPoolCounts();
      const activePool = this.getActivePool();
      if ($('homePackCount')) {
        $('homePackCount').textContent = (counts.activeSets || activePool.length || 1260).toLocaleString();
      }

      const mode = this.state.adultMode || 'off';
      const fmtTotal = (counts.activeSets || 1260).toLocaleString();

      // Active Pack Label
      if ($('activePackName')) {
        if (this.state.packPreviewRoundsLeft > 0 && this.state.packPreviewName) {
          $('activePackName').textContent = `${this.state.packPreviewName} (${this.state.packPreviewRoundsLeft} left)`;
        } else if (counts.enabledCount === 0) {
          $('activePackName').textContent = 'None Selected (Tap to Choose)';
        } else if (counts.enabledCount === 1) {
          const single = (this.state.enabledPacks && this.state.enabledPacks[0]) || 'General Knowledge';
          $('activePackName').textContent = `${single} (${counts.activeSets.toLocaleString()})`;
        } else if (counts.enabledCount === counts.totalUnlockedPacks) {
          $('activePackName').textContent = `All Topics (${counts.activeSets.toLocaleString()})`;
        } else {
          $('activePackName').textContent = `${counts.enabledCount} Topics (${counts.activeSets.toLocaleString()})`;
        }
      }

      const pace = (this.state.settings && this.state.settings.timerPace) || 'progressive';

      // Play CTA Button — direct and jargon-free with live prompt count
      if ($('playQuickBtn') && !this.duelSeed) {
        $('playQuickBtn').textContent =
          pace === 'unlimited'
            ? `PRACTICE (${fmtTotal} PROMPTS)`
            : `START (${fmtTotal} PROMPTS)`;
      }

      const today = getTodayKey();
      const playedToday = this.state.daily.lastPlayedDate === today || this.state.daily.lastCompletedDate === today;
      const completedToday = this.state.daily.lastCompletedDate === today;
      if ($('dailyDot')) {
        $('dailyDot').style.display = playedToday ? 'none' : 'inline-block';
      }
      if ($('dailyBtnLabel')) {
        $('dailyBtnLabel').textContent = completedToday ? '✅ DAILY (✓)' : playedToday ? '🎯 DAILY (PLAYED)' : '🎯 DAILY';
      }

      // Sync Timer Pace descriptions on Home & How-To
      if ($('homeStep2Text')) {
        $('homeStep2Text').textContent =
          pace === 'unlimited'
            ? 'Untimed practice sandbox — 0 sparks earned'
            : pace === 'relaxed'
            ? 'Relaxed 15s timer'
            : pace === 'blitz'
            ? 'Fast 7s blitz timer'
            : '12s timer, speeds up with your streak';
      }
      if ($('homePaceLabel')) {
        $('homePaceLabel').textContent =
          pace === 'unlimited'
            ? 'UNLIMITED (PRACTICE)'
            : pace === 'relaxed'
            ? 'RELAXED (15s)'
            : pace === 'blitz'
            ? 'BLITZ (7s)'
            : 'PROGRESSIVE (12s)';
      }
      if ($('homePaceBar')) {
        $('homePaceBar').classList.toggle('is-unlimited', pace === 'unlimited');
      }
      if ($('howtoCurveTag') && $('howtoCurveBody')) {
        if (pace === 'unlimited') {
          $('howtoCurveTag').textContent = '🎯 Practice Sandbox';
          $('howtoCurveBody').innerHTML =
            '• <b>Untimed Practice:</b> Play completely relaxed with zero time limit.<br>' +
            '• <b>Learn Connections:</b> Perfect for discovering new words and studying associations.<br>' +
            '• <b>Sparks:</b> 0 ⚡ (Practice Mode earns 0 sparks to prevent ad exploits. Switch to Progressive or Blitz to earn sparks!).';
        } else if (pace === 'relaxed') {
          $('howtoCurveTag').textContent = '15s ➔ 5.0s';
          $('howtoCurveBody').innerHTML =
            '• <b>Relaxed Pace (15s down to 5s):</b> Extra time on every round.<br>' +
            '• <b>Sparks:</b> +10 per correct answer, +50 bonus every 5 streak, +100 for a new personal best!';
        } else if (pace === 'blitz') {
          $('howtoCurveTag').textContent = '7s ➔ 3.0s';
          $('howtoCurveBody').innerHTML =
            '• <b>Fast Blitz (7s down to 3s):</b> High speed from round one.<br>' +
            '• <b>Sparks:</b> +10 per correct answer, +50 bonus every 5 streak, +100 for a new personal best!';
        } else {
          $('howtoCurveTag').textContent = '12s ➔ 3.5s';
          $('howtoCurveBody').innerHTML =
            '• <b>Early Rounds (12s–10s):</b> Easy words with clear differences.<br>' +
            '• <b>Mid Streak (9s–7s):</b> Closer topics that test your quick thinking.<br>' +
            '• <b>High Streak (6s–3.5s):</b> Fast pace for serious focus.<br>' +
            '• <b>Sparks:</b> +10 per correct answer, +50 bonus every 5 streak, +100 for a new personal best!';
        }
      }

      this.updateBoostBtn();
    }

    // Adult Mode 18+ Gate & Cycling
    cycleAdultMode() {
      if (window.oneShotAudio) window.oneShotAudio.playTap();
      if (!this.state.adultVerified) {
        this.pendingAdultCallback = () => {
          this.setAdultMode('mix');
        };
        const modal = document.getElementById('ageGateOverlay');
        if (modal) modal.classList.add('show');
        return;
      }

      const current = this.state.adultMode || 'off';
      const next = current === 'off' ? 'only' : current === 'only' ? 'mix' : 'off';
      this.setAdultMode(next);
    }

    setAdultMode(mode) {
      this.state.adultMode = mode;
      if (mode === 'off' && ADULT_PACKS.includes(this.state.selectedPack)) {
        this.state.selectedPack = 'ALL';
      } else if (mode === 'only' && STANDARD_PACKS.includes(this.state.selectedPack)) {
        this.state.selectedPack = 'ALL';
      }
      this.saveState();
      this.syncSettingsModal();
      this.renderShopList();

      const counts = this.getPoolCounts();
      if (mode === 'only') {
        this.showFloatingBurst(`🔥 18+ Topics Active (${counts.adult.toLocaleString()} Prompts)`);
      } else if (mode === 'mix') {
        this.showFloatingBurst(`🎉 All Topics Active (${counts.total.toLocaleString()} Prompts)`);
      } else {
        this.showFloatingBurst(`Standard Topics (${counts.std.toLocaleString()} Prompts)`);
      }
    }

    confirmAgeGate() {
      if (window.oneShotAudio) window.oneShotAudio.playReward();
      this.state.adultVerified = true;
      const modal = document.getElementById('ageGateOverlay');
      if (modal) modal.classList.remove('show');
      if (typeof this.pendingAdultCallback === 'function') {
        const fn = this.pendingAdultCallback;
        this.pendingAdultCallback = null;
        fn();
      } else {
        this.setAdultMode('only');
      }
    }

    closeAgeGate() {
      this.pendingAdultCallback = null;
      const modal = document.getElementById('ageGateOverlay');
      if (modal) modal.classList.remove('show');
    }

    showScreen(id) {
      const currentScreen = document.querySelector('.screen.active');
      if (currentScreen && currentScreen.id === 'shop' && id !== 'shop') {
        const counts = this.getPackCounts();
        if (counts.activeSets === 0) {
          if (window.oneShotAudio) window.oneShotAudio.playMiss(false);
          this.showFloatingBurst('⚠️ Select at least 1 topic before leaving!');
          const summary = document.querySelector('.packs-pool-summary');
          if (summary) {
            summary.classList.remove('shake');
            void summary.offsetWidth;
            summary.classList.add('shake');
          }
          return;
        }
      }
      this.stopTimer();
      document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
      const target = document.getElementById(id);
      if (target) target.classList.add('active');
      this.syncHeaderAndHome();
    }

    closeShop() {
      const counts = this.getPackCounts();
      if (this.shopTab === 'packs' && counts.activeSets === 0) {
        if (window.oneShotAudio) window.oneShotAudio.playMiss(false);
        this.showFloatingBurst('⚠️ Select at least 1 topic before leaving!');
        const summary = document.querySelector('.packs-pool-summary');
        if (summary) {
          summary.classList.remove('shake');
          void summary.offsetWidth;
          summary.classList.add('shake');
        }
        return;
      }
      this.showScreen('home');
    }

    // Progressive Warmup & Extended-Run Difficulty Curve
    getDifficultyConfig(streak) {
      const pace =
        this.mode === 'duel'
          ? 'progressive'
          : (this.state.settings && this.state.settings.timerPace) || 'progressive';

      if (pace === 'unlimited') {
        const tier = streak <= 2 ? 1 : streak <= 6 ? 2 : streak <= 12 ? 3 : streak <= 20 ? 4 : 5;
        const weights =
          tier === 1 ? [[1, 1]] :
          tier === 2 ? [[1, 0.4], [2, 0.6]] :
          tier === 3 ? [[2, 0.3], [3, 0.7]] :
          tier === 4 ? [[3, 0.3], [4, 0.7]] :
          [[3, 0.2], [4, 0.4], [5, 0.4]];
        return {
          seconds: Infinity,
          difficulty: tier,
          weights: weights,
          phase: 'unlimited',
          label: 'PRACTICE · UNTIMED'
        };
      }

      if (pace === 'blitz') {
        if (streak <= 2) {
          return { seconds: 7, difficulty: 1, weights: [[1, 1]], phase: 'cruise', label: '7.0S · FAST' };
        } else if (streak <= 5) {
          return { seconds: 6, difficulty: 2, weights: [[2, 0.8], [1, 0.2]], phase: 'cruise', label: '6.0S · FAST' };
        } else if (streak <= 9) {
          return { seconds: 5, difficulty: 3, weights: [[3, 0.75], [2, 0.25]], phase: 'heat', label: '5.0S · RAPID' };
        } else if (streak <= 14) {
          return { seconds: 4, difficulty: 4, weights: [[4, 0.7], [3, 0.3]], phase: 'overdrive', label: '4.0S · MAX SPEED' };
        }
        return { seconds: 3, difficulty: 5, weights: [[5, 0.6], [4, 0.4]], phase: 'overdrive', label: '3.0S · MAX SPEED', shuffleLayout: true };
      }

      if (pace === 'relaxed') {
        if (streak <= 2) {
          return { seconds: 15, difficulty: 1, weights: [[1, 1]], phase: 'warmup', label: '15.0S · RELAXED' };
        } else if (streak <= 5) {
          return { seconds: 14, difficulty: 1, weights: [[1, 0.85], [2, 0.15]], phase: 'warmup', label: '14.0S · RELAXED' };
        } else if (streak <= 9) {
          return { seconds: 13, difficulty: 2, weights: [[1, 0.4], [2, 0.6]], phase: 'cruise', label: '13.0S · STEADY' };
        } else if (streak <= 14) {
          return { seconds: 12, difficulty: 2, weights: [[2, 0.8], [3, 0.2]], phase: 'cruise', label: '12.0S · STEADY' };
        } else if (streak <= 20) {
          return { seconds: 11, difficulty: 3, weights: [[2, 0.45], [3, 0.55]], phase: 'rhythm', label: '11.0S · STEADY' };
        } else if (streak <= 27) {
          return { seconds: 10, difficulty: 3, weights: [[3, 0.75], [4, 0.25]], phase: 'rhythm', label: '10.0S · BRISK' };
        } else if (streak <= 35) {
          return { seconds: 9, difficulty: 3, weights: [[3, 0.55], [4, 0.45]], phase: 'rhythm', label: '9.0S · BRISK' };
        } else if (streak <= 44) {
          return { seconds: 8, difficulty: 4, weights: [[3, 0.3], [4, 0.55], [5, 0.15]], phase: 'heat', label: '8.0S · FAST' };
        } else if (streak <= 54) {
          return { seconds: 7, difficulty: 4, weights: [[3, 0.2], [4, 0.5], [5, 0.3]], phase: 'heat', label: '7.0S · FAST' };
        } else if (streak <= 69) {
          return { seconds: 6, difficulty: 5, weights: [[3, 0.15], [4, 0.45], [5, 0.4]], phase: 'heat', label: '6.0S · RAPID', shuffleLayout: true };
        }
        return { seconds: 5, difficulty: 5, weights: [[3, 0.15], [4, 0.4], [5, 0.45]], phase: 'overdrive', label: '5.0S · RAPID', shuffleLayout: true };
      }

      // Default: 'progressive' (12.0s Warmup -> 3.5s Apex across 65+ rounds)
      if (streak <= 2) {
        return { seconds: 12, difficulty: 1, weights: [[1, 1]], phase: 'warmup', label: '12.0S · START' };
      } else if (streak <= 5) {
        return { seconds: 11, difficulty: 1, weights: [[1, 0.85], [2, 0.15]], phase: 'warmup', label: '11.0S · START' };
      } else if (streak <= 9) {
        return { seconds: 10, difficulty: 2, weights: [[1, 0.35], [2, 0.65]], phase: 'cruise', label: '10.0S · BRISK' };
      } else if (streak <= 14) {
        return { seconds: 9, difficulty: 2, weights: [[2, 0.8], [3, 0.2]], phase: 'cruise', label: '9.0S · BRISK' };
      } else if (streak <= 20) {
        return { seconds: 8, difficulty: 3, weights: [[2, 0.4], [3, 0.6]], phase: 'rhythm', label: '8.0S · FAST' };
      } else if (streak <= 27) {
        return { seconds: 7, difficulty: 3, weights: [[3, 0.7], [4, 0.3]], phase: 'rhythm', label: '7.0S · FAST' };
      } else if (streak <= 35) {
        return { seconds: 6, difficulty: 4, weights: [[3, 0.45], [4, 0.55]], phase: 'heat', label: '6.0S · RAPID' };
      } else if (streak <= 44) {
        return { seconds: 5, difficulty: 4, weights: [[3, 0.2], [4, 0.6], [5, 0.2]], phase: 'heat', label: '5.0S · RAPID' };
      } else if (streak <= 54) {
        return { seconds: 4.5, difficulty: 5, weights: [[3, 0.15], [4, 0.45], [5, 0.4]], phase: 'overdrive', label: '4.5S · MAX SPEED', shuffleLayout: true };
      } else if (streak <= 64) {
        return { seconds: 4, difficulty: 5, weights: [[3, 0.1], [4, 0.4], [5, 0.5]], phase: 'overdrive', label: '4.0S · MAX SPEED', shuffleLayout: true };
      }
      return { seconds: 3.5, difficulty: 5, weights: [[3, 0.1], [4, 0.35], [5, 0.55]], phase: 'overdrive', label: '3.5S · MAX SPEED', shuffleLayout: true };
    }

    rollWeightedDifficulty(weights, fallbackDiff = 1, rng = Math.random) {
      if (!Array.isArray(weights) || weights.length === 0) return fallbackDiff;
      const roll = rng();
      let cumulative = 0;
      for (let i = 0; i < weights.length; i++) {
        cumulative += weights[i][1];
        if (roll <= cumulative) return weights[i][0];
      }
      return weights[weights.length - 1][0];
    }

    shuffleArray(arr, rng = Math.random) {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    }

    pickNextSet(targetDifficulty, rng = Math.random) {
      const pool = this.mode === 'daily' ? this.packs.filter((p) => !p.adult) : this.getActivePool();
      const useCrossRunDedup = this.mode === 'quick';

      // Filter out already seen sets in this run AND recent back-to-back runs
      let unseen = pool.filter(
        (p) => !this.usedIds.has(p.id) && (!useCrossRunDedup || !this.sessionUsedIds.has(p.id))
      );
      if (unseen.length === 0) {
        unseen = pool.filter((p) => !this.usedIds.has(p.id));
        if (useCrossRunDedup) {
          this.sessionUsedIds.clear();
          this.state.recentIds = [];
        }
      }
      if (unseen.length === 0) {
        this.usedIds.clear();
        unseen = pool;
      }

      // Prefer matching difficulty tier, then +/- 1 difficulty
      let tierMatches = unseen.filter((p) => p.difficulty === targetDifficulty);
      if (tierMatches.length === 0) {
        tierMatches = unseen.filter((p) => Math.abs((p.difficulty || 1) - targetDifficulty) <= 1);
      }
      if (tierMatches.length === 0) {
        tierMatches = unseen;
      }

      const chosen = tierMatches[Math.floor(rng() * tierMatches.length)];
      if (chosen) {
        this.usedIds.add(chosen.id);
        if (useCrossRunDedup) {
          this.sessionUsedIds.add(chosen.id);
          const rec = Array.isArray(this.state.recentIds) ? this.state.recentIds : [];
          rec.push(chosen.id);
          if (rec.length > 800) rec.shift();
          this.state.recentIds = rec;
        }
      }
      return chosen;
    }

    startQuickShot() {
      if (window.oneShotAudio) window.oneShotAudio.playLaunch();
      if (!this.state.enabledPacks || this.state.enabledPacks.length === 0) {
        this.state.enabledPacks = [STARTER_PACKS[0]];
        this.saveState();
      }
      this.mode = this.duelSeed ? 'duel' : 'quick';
      this.streak = 0;
      this.round = 0;
      this.runSparks = 0;
      this.usedIds.clear();
      this.continueUsedThisRun = false;
      this.reviveBreatherActive = false;
      this.doubleUsedThisResult = false;
      this.newBestAwardedThisRun = false;
      this.roundHistory = [];

      const isPracticeUnlimited = this.state.settings && this.state.settings.timerPace === 'unlimited';

      // Check & consume 2X sparks boost ONLY for timed runs (preserve boost for practice mode!)
      if (this.state.nextRound2xBoost && !isPracticeUnlimited) {
        this.boost2xActive = true;
        this.state.nextRound2xBoost = false;
        this.saveState();
        this.updateBoostBtn();
      } else {
        this.boost2xActive = false;
      }

      if (this.mode === 'duel' && this.duelSeed) {
        this.duelRng = createSeededRandom(this.duelSeed);
      } else {
        this.lastRunSeed = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.duelRng = createSeededRandom(this.lastRunSeed);
      }

      if (window.oneShotAnalytics) {
        window.oneShotAnalytics.track('play_started', {
          mode: this.mode,
          pack: this.state.selectedPack,
          adultMode: this.state.adultMode,
          timerPace: (this.state.settings && this.state.settings.timerPace) || 'progressive'
        });
      }

      this.showScreen('game');
      this.nextRound();
    }

    startDailyTarget() {
      const today = getTodayKey();
      const alreadyPlayed = this.state.daily.lastPlayedDate === today || this.state.daily.lastCompletedDate === today;
      if (alreadyPlayed) {
        this.mode = 'daily';
        if (window.oneShotAudio) window.oneShotAudio.playTap();
        const score = this.state.daily.todayScore || 0;
        const msg = this.state.daily.todayCompleted
          ? `🎯 Today's Daily already completed (5/5)! Resets at midnight.`
          : `🎯 Today's Daily already played (${score}/5)! Next challenge at midnight.`;
        this.showFloatingBurst(msg);
        this.openShareModal();
        return;
      }

      if (window.oneShotAudio) window.oneShotAudio.playLaunch();
      this.mode = 'daily';
      this.streak = 0;
      this.round = 0;
      this.runSparks = 0;
      this.usedIds.clear();
      this.continueUsedThisRun = true;
      this.reviveBreatherActive = false;
      this.doubleUsedThisResult = false;
      this.newBestAwardedThisRun = false;
      this.roundHistory = [];

      // Mark daily as played today immediately upon launch so it cannot be farmed or replayed today
      this.state.daily.lastPlayedDate = today;
      this.state.daily.todayScore = 0;
      this.state.daily.todayCompleted = false;
      this.state.daily.todayHistory = [];
      this.saveState();
      this.syncHeaderAndHome();

      // Daily Challenge is always a timed challenge (12s) - consume 2X sparks boost if active
      if (this.state.nextRound2xBoost) {
        this.boost2xActive = true;
        this.state.nextRound2xBoost = false;
        this.saveState();
        this.updateBoostBtn();
      } else {
        this.boost2xActive = false;
      }

      const rng = createSeededRandom(`DAILY-${today}`);
      this.duelRng = rng;
      this.dailyQueue = [1, 2, 3, 4, 5].map((diff) => this.pickNextSet(diff, rng));

      if (window.oneShotAnalytics) {
        window.oneShotAnalytics.track('daily_started', { date: today });
      }

      this.showScreen('game');
      this.nextRound();
    }

    replayCurrentMode() {
      this.startQuickShot();
    }

    nextRound() {
      this.stopTimer();
      if (this.themeRevealTimer) {
        clearTimeout(this.themeRevealTimer);
        this.themeRevealTimer = null;
      }
      this.hideRelationReveal();
      this.answered = false;
      this.round += 1;

      const rng = this.duelRng || Math.random;
      let diffCfg = this.getDifficultyConfig(this.streak);

      if (this.mode === 'daily') {
        const idx = Math.min(this.round - 1, this.dailyQueue.length - 1);
        this.activeSet = this.dailyQueue[idx];
        const dailyTimers = [12, 10, 9, 8, 7];
        const sec = dailyTimers[idx] || 7;
        diffCfg = {
          seconds: sec,
          difficulty: this.round,
          phase: this.round === 1 ? 'warmup' : this.round >= 4 ? 'heat' : 'cruise',
          label: `DAILY TARGET · ${this.round}/5 · ${sec}.0S`
        };
      } else {
        if (this.reviveBreatherActive) {
          this.reviveBreatherActive = false;
          const breatherSec = Math.ceil(diffCfg.seconds + 3);
          diffCfg = {
            ...diffCfg,
            seconds: breatherSec,
            phase: 'warmup',
            shuffleLayout: false,
            label: `BREATHER · ${breatherSec}.0S`
          };
        }
        const targetTier = this.rollWeightedDifficulty(diffCfg.weights, diffCfg.difficulty, rng);
        this.activeSet = this.pickNextSet(targetTier, rng);
      }

      // Decrement pack preview counter if active
      if (this.state.packPreviewRoundsLeft > 0) {
        this.state.packPreviewRoundsLeft -= 1;
        if (this.state.packPreviewRoundsLeft === 0) {
          this.state.packPreviewName = null;
        }
        this.saveState();
      }

      const $ = (id) => document.getElementById(id);
      const isTrickTier = diffCfg.phase === 'overdrive';
      const isWarmupPhase = diffCfg.phase === 'warmup';
      const isAdultSet = !!this.activeSet.adult;

      // Category & Prompt: Zero preview before guess (NYT Connections style: connection revealed ONLY upon solving!)
      const catEl = $('category');
      if (catEl) {
        catEl.textContent = '';
        catEl.classList.add('hidden');
        catEl.style.display = 'none';
      }

      if ($('promptHeadline')) {
        $('promptHeadline').textContent =
          this.mode === 'daily'
            ? `Daily #${this.round}: Which doesn't belong?`
            : "Which doesn't belong?";
      }
      if ($('promptSub')) {
        $('promptSub').textContent = 'Spot the odd word out';
      }

      // Card snap animation
      const promptCard = $('promptCard');
      if (promptCard && !this.state.settings.reducedMotion) {
        promptCard.classList.remove('card-snap');
        void promptCard.offsetWidth;
        promptCard.classList.add('card-snap');
      }

      // Header & Progress updates
      if ($('streak')) $('streak').textContent = String(this.streak);
      if ($('tierLabel')) {
        $('tierLabel').textContent = diffCfg.label;
        $('tierLabel').classList.toggle('warmup', diffCfg.phase === 'warmup');
        $('tierLabel').classList.toggle('heat', diffCfg.phase === 'heat');
        $('tierLabel').classList.toggle('overdrive', diffCfg.phase === 'overdrive');
        $('tierLabel').classList.toggle('unlimited', diffCfg.phase === 'unlimited');
      }
      if ($('round')) $('round').textContent = String(this.round);
      if ($('best')) $('best').textContent = String(this.state.bestStreak);

      const barPct =
        this.mode === 'daily'
          ? ((this.round - 1) / 5) * 100
          : ((this.streak % 5) / 5) * 100;
      if ($('bar')) $('bar').style.width = `${barPct}%`;

      if ($('gameFooter')) {
        $('gameFooter').innerHTML =
          this.mode === 'daily'
            ? `DAILY TARGET · ROUND <span id="round">${this.round}</span> OF 5`
            : `ROUND <span id="round">${this.round}</span> · NEXT MILESTONE ${Math.floor(this.streak / 5) * 5 + 5}🔥 · BEST <span id="best">${this.state.bestStreak}</span>`;
      }

      // Sample 3 valid words from the set's validWords pool + 1 intruder = 4 choices
      this.activeValidSample = this.shuffleArray(this.activeSet.validWords, rng).slice(0, 3);
      const allWords = [...this.activeValidSample, this.activeSet.intruder];
      const ordered = this.shuffleArray(allWords, rng);
      const maxWordLen = Math.max(...ordered.map((w) => w.length));
      const use2x2 = !!diffCfg.shuffleLayout && maxWordLen <= 26;

      const choicesEl = $('choices');
      if (choicesEl) {
        choicesEl.onclick = null;
        choicesEl.classList.toggle('grid-2x2', use2x2);
        choicesEl.innerHTML = ordered
          .map((word, i) => {
            const safeAttr = word.replace(/"/g, '&quot;');
            const longCls = word.length > 22 ? ' long-word' : '';
            return `<button class="choice${longCls}" data-word="${safeAttr}" onclick="event.stopPropagation(); app.chooseWord(this, event)">
              <span class="choice-left">
                <span class="letter">${'ABCD'[i]}</span>
                <span class="choice-word">${word}</span>
              </span>
              <span class="choice-status"></span>
            </button>`;
          })
          .join('');
      }

      if (window.oneShotAnalytics) {
        window.oneShotAnalytics.track('round_started', {
          mode: this.mode,
          round: this.round,
          streak: this.streak,
          setId: this.activeSet.id,
          adult: isAdultSet,
          difficulty: this.activeSet.difficulty,
          timeLimit: diffCfg.seconds
        });
      }

      this.pausedRemaining = null;
      this.startRoundTimer(diffCfg.seconds, diffCfg.phase);
    }

    startRoundTimer(seconds, phase = 'cruise', resumeRemaining = null) {
      this.stopTimer();
      this.roundDuration = seconds;
      this.roundPhase = phase;
      const isUnlimited = !Number.isFinite(seconds) || seconds === Infinity || phase === 'unlimited';

      const timeEl = document.getElementById('time');
      const timerEl = document.getElementById('timer');

      if (isUnlimited) {
        this.roundStartTime = performance.now();
        this.lastTimeRemaining = Infinity;
        if (timeEl) timeEl.textContent = '∞';
        if (timerEl) {
          timerEl.style.setProperty('--p', '100%');
          timerEl.classList.remove('urgent', 'warmup', 'heat');
          timerEl.classList.add('unlimited');
        }
        return;
      }

      if (timerEl) timerEl.classList.remove('unlimited');

      const initialRemaining = resumeRemaining !== null ? resumeRemaining : seconds;
      this.roundStartTime = performance.now() - (seconds - initialRemaining) * 1000;
      this.lastTickSecond = Math.ceil(initialRemaining);

      const showTenthsAlways = seconds < 5;
      const formatClock = (val) => {
        if (val <= 0) return '0';
        if (showTenthsAlways || val < 1.0) return val.toFixed(1);
        return String(Math.ceil(val));
      };

      if (timeEl) timeEl.textContent = formatClock(initialRemaining);
      if (timerEl) {
        const initPct = Math.max(0, Math.min(100, (initialRemaining / this.roundDuration) * 100));
        timerEl.style.setProperty('--p', `${initPct.toFixed(1)}%`);
        timerEl.classList.toggle('urgent', initialRemaining <= 2.0);
        timerEl.classList.toggle('warmup', phase === 'warmup');
        timerEl.classList.toggle('heat', phase === 'heat');
      }

      const tick = (now) => {
        if (this.answered) return;
        const elapsed = (now - this.roundStartTime) / 1000;
        const remaining = Math.max(0, this.roundDuration - elapsed);
        this.lastTimeRemaining = remaining;
        this.lastReactionTime = elapsed;

        const pct = Math.max(0, Math.min(100, (remaining / this.roundDuration) * 100));
        if (timerEl) {
          timerEl.style.setProperty('--p', `${pct.toFixed(1)}%`);
          timerEl.classList.toggle('urgent', remaining <= 3.0);
        }

        const ceilSec = Math.ceil(remaining);
        if (timeEl) {
          timeEl.textContent = formatClock(remaining);
        }

        // Final-three-second audio tick (Gartic-phone / party game urgency)
        if (ceilSec <= 3 && ceilSec > 0 && ceilSec < this.lastTickSecond) {
          this.lastTickSecond = ceilSec;
          if (window.oneShotAudio) window.oneShotAudio.playTick(ceilSec);
        }

        if (remaining <= 0) {
          this.handleTimeout();
          return;
        }
        this.timerRaf = requestAnimationFrame(tick);
      };

      this.timerRaf = requestAnimationFrame(tick);
    }

    stopTimer() {
      if (this.timerRaf) {
        cancelAnimationFrame(this.timerRaf);
        this.timerRaf = null;
      }
    }

    showFloatingBurst(text) {
      const el = document.getElementById('floatFeedback');
      if (!el) return;
      el.textContent = text;
      el.classList.remove('show');
      void el.offsetWidth;
      el.classList.add('show');
    }

    bumpCoinsPill() {
      const pill = document.getElementById('coinsPill');
      const gamePill = document.getElementById('gameCoinsPill');
      if (pill) {
        pill.classList.remove('bump');
        void pill.offsetWidth;
        pill.classList.add('bump');
        setTimeout(() => pill.classList.remove('bump'), 240);
      }
      if (gamePill) {
        gamePill.classList.remove('bump');
        void gamePill.offsetWidth;
        gamePill.classList.add('bump');
        setTimeout(() => gamePill.classList.remove('bump'), 240);
      }
      if ($('coins')) $('coins').textContent = (this.state.sparks || 0).toLocaleString();
      if ($('gameCoins')) $('gameCoins').textContent = (this.state.sparks || 0).toLocaleString();
    }

    chooseWord(btn, event) {
      if (event && event.stopPropagation) {
        event.stopPropagation();
      }
      if (this.answered || !this.activeSet) return;
      this.answered = true;
      this.stopTimer();

      const word = btn.getAttribute('data-word');
      const intruder = this.activeSet.intruder;
      const isCorrect = word === intruder;
      const rawElapsed = (performance.now() - this.roundStartTime) / 1000;
      const reactionSec = Math.max(0.1, Number.isFinite(this.roundDuration) ? Math.min(this.roundDuration, rawElapsed) : rawElapsed);
      const remSec = Number.isFinite(this.roundDuration) ? Math.max(0, this.roundDuration - reactionSec) : Infinity;
      this.lastReactionTime = reactionSec;
      this.lastTimeRemaining = remSec;

      if (window.oneShotAnalytics) {
        window.oneShotAnalytics.track('answer_selected', {
          setId: this.activeSet.id,
          selected: word,
          intruder,
          correct: isCorrect,
          reactionSec: Number(reactionSec.toFixed(2))
        });
      }

      document.querySelectorAll('.choice').forEach((b) => {
        const bWord = b.getAttribute('data-word');
        const statusEl = b.querySelector('.choice-status');
        if (bWord === intruder) {
          b.classList.add('correct');
          if (statusEl) statusEl.textContent = '✓ ODD ONE OUT';
        } else if (b === btn && !isCorrect) {
          b.classList.add('wrong');
          if (statusEl) statusEl.textContent = '✕ MATCHES THEME';
        } else if (isCorrect) {
          b.classList.add('fits-theme');
          if (statusEl) statusEl.textContent = 'MATCHES';
        }
        b.disabled = true;
      });

      this.roundHistory.push({
        ok: isCorrect,
        timeout: false,
        timeTaken: reactionSec,
        timeLeft: remSec,
        category: this.activeSet.category,
        intruder
      });

      if (isCorrect) {
        if (window.oneShotFX && btn) {
          const rect = btn.getBoundingClientRect();
          window.oneShotFX.sparkBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, '#62f5a7');
        }
        const catEl = document.getElementById('category');
        const headlineEl = document.getElementById('promptHeadline');
        const subEl = document.getElementById('promptSub');
        const connectionTitle = (this.activeSet.shortCategory || this.activeSet.category).toUpperCase();
        if (catEl) {
          const prefix = !!this.activeSet.adult ? '🔥 18+ · ' : '';
          catEl.textContent = `${prefix}${connectionTitle}`;
        }
        if (headlineEl) {
          headlineEl.innerHTML = `✨ THE CONNECTION: <span class="revealed-theme">${connectionTitle}</span>`;
        }
        if (subEl) {
          subEl.innerHTML = `All 3 match <strong>${connectionTitle}</strong>!`;
        }
        this.handleCorrectHit(remSec);
      } else {
        if (window.oneShotAudio) window.oneShotAudio.playMiss(false);
        if (window.oneShotFX) window.oneShotFX.screenShake(6);
        if (window.oneShotAnalytics) {
          window.oneShotAnalytics.track('answer_wrong', {
            setId: this.activeSet.id,
            selected: word,
            intruder,
            streakAtLoss: this.streak
          });
        }
        setTimeout(() => this.finishRun(false, false), 560);
      }
    }

    handleTimeout() {
      if (this.answered || !this.activeSet) return;
      this.answered = true;
      this.stopTimer();

      const intruder = this.activeSet.intruder;
      document.querySelectorAll('.choice').forEach((b) => {
        const bWord = b.getAttribute('data-word');
        const statusEl = b.querySelector('.choice-status');
        if (bWord === intruder) {
          b.classList.add('correct');
          if (statusEl) statusEl.textContent = '✓ ODD ONE OUT';
        } else {
          b.classList.add('fits-theme');
          if (statusEl) statusEl.textContent = 'MATCHES';
        }
        b.disabled = true;
      });

      this.roundHistory.push({
        ok: false,
        timeout: true,
        timeTaken: this.roundDuration,
        timeLeft: 0,
        category: this.activeSet.category,
        intruder
      });

      if (window.oneShotAudio) window.oneShotAudio.playMiss(true);
      if (window.oneShotAnalytics) {
        window.oneShotAnalytics.track('timer_expired', {
          setId: this.activeSet.id,
          streakAtLoss: this.streak
        });
      }

      setTimeout(() => this.finishRun(false, true), 560);
    }

    triggerWinFeedback(gained, isUnlimited, isNewBest, reward, remSec) {
      const feedbackEl = document.getElementById('winFeedback');
      const sparkPill = document.getElementById('winSparkPill');
      const sparkIcon = document.getElementById('winSparkIcon');
      const sparkVal = document.getElementById('winSparkValue');
      const sparkBadge = document.getElementById('winSparkBadge');
      const themeNameEl = document.getElementById('winThemeName');
      const wordsEl = document.getElementById('winWords');
      const intruderNameEl = document.getElementById('winIntruderName');
      const intruderReasonEl = document.getElementById('winIntruderReason');

      if (!feedbackEl || !this.activeSet) {
        if (!isUnlimited && gained > 0) {
          this.runSparks += gained;
          this.state.sparks += gained;
          this.saveState();
          this.bumpCoinsPill();
        }
        if (this.mode === 'daily' && this.round >= 5) {
          this.finishDailySuccess();
        } else {
          this.nextRound();
        }
        return;
      }

      // 1. Populate Theme & Words confirmation in middle of screen
      const connectionTitle = (this.activeSet.shortCategory || this.activeSet.category).toUpperCase();
      if (themeNameEl) themeNameEl.textContent = connectionTitle;

      if (wordsEl) {
        const validWords = (this.activeValidSample && this.activeValidSample.length)
          ? this.activeValidSample
          : (this.activeSet.validWords || []).slice(0, 3);
        wordsEl.textContent = validWords.join(' · ');
      }

      if (intruderNameEl) intruderNameEl.textContent = this.activeSet.intruder;
      if (intruderReasonEl) {
        const shortTag = this.activeSet.shortTag || 'Doesn\'t Fit';
        intruderReasonEl.textContent = `✕ ${shortTag}`;
      }

      // 2. Populate Sparks value & badge
      if (sparkIcon) sparkIcon.textContent = isUnlimited ? '🎯' : '⚡';
      if (sparkVal) {
        sparkVal.textContent = isUnlimited ? `STREAK ${this.streak}` : `+${gained} ⚡`;
      }

      if (sparkBadge) {
        if (isUnlimited) {
          sparkBadge.textContent = reward.isMilestone ? 'PRACTICE MILESTONE!' : 'PRACTICE';
          sparkBadge.classList.add('visible');
        } else if (isNewBest) {
          sparkBadge.textContent = this.boost2xActive ? 'NEW BEST! (2X)' : 'NEW BEST!';
          sparkBadge.classList.add('visible');
        } else if (this.boost2xActive) {
          sparkBadge.textContent = '2X BOOST!';
          sparkBadge.classList.add('visible');
        } else if (reward.isMilestone) {
          sparkBadge.textContent = `STREAK ${this.streak}!`;
          sparkBadge.classList.add('visible');
        } else if (Number.isFinite(remSec) && remSec <= 1.1) {
          sparkBadge.textContent = `CLUTCH ${remSec.toFixed(1)}s!`;
          sparkBadge.classList.add('visible');
        } else {
          sparkBadge.textContent = '';
          sparkBadge.classList.remove('visible');
        }
      }

      if (sparkPill) {
        sparkPill.classList.remove('zapping', 'is-practice', 'is-boosted');
        sparkPill.style.transform = '';
        if (isUnlimited) {
          sparkPill.classList.add('is-practice');
        } else if (this.boost2xActive) {
          sparkPill.classList.add('is-boosted');
        }
      }

      // 3. Show feedback card in dead center of screen
      feedbackEl.classList.remove('hidden');

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      if (window.oneShotFX) {
        window.oneShotFX.sparkBurst(centerX, centerY, isUnlimited ? '#33e6ff' : '#ffdc48');
      }

      // Calculate deposit destination vector (towards #gameCoinsPill in header)
      const gameCoinsPill = document.getElementById('gameCoinsPill') || document.getElementById('coinsPill');
      const targetRect = gameCoinsPill ? gameCoinsPill.getBoundingClientRect() : { left: window.innerWidth / 2 - 25, top: 16, width: 50, height: 28 };
      const targetX = targetRect.left + targetRect.width / 2;
      const targetY = targetRect.top + targetRect.height / 2;

      const pillRect = sparkPill ? sparkPill.getBoundingClientRect() : { left: centerX - 40, top: centerY - 20, width: 80, height: 40 };
      const pillCenterX = pillRect.left + pillRect.width / 2;
      const pillCenterY = pillRect.top + pillRect.height / 2;

      const dx = targetX - pillCenterX;
      const dy = targetY - pillCenterY;
      if (sparkPill) {
        sparkPill.style.setProperty('--spark-dx', `${dx}px`);
        sparkPill.style.setProperty('--spark-dy', `${dy}px`);
      }

      let advanced = false;
      const completeAndAdvance = () => {
        if (advanced) return;
        advanced = true;
        if (this.winTimer1) clearTimeout(this.winTimer1);
        if (this.winTimer2) clearTimeout(this.winTimer2);
        feedbackEl.classList.add('hidden');
        if (sparkPill) sparkPill.classList.remove('zapping');

        // Deposit sparks into balance
        if (!isUnlimited && gained > 0) {
          this.runSparks += gained;
          this.state.sparks += gained;
          this.saveState();
          this.bumpCoinsPill();
          if (window.oneShotFX) {
            window.oneShotFX.sparkBurst(targetX, targetY, '#ffdc48');
          }
        }

        if (this.mode === 'daily' && this.round >= 5) {
          this.finishDailySuccess();
        } else {
          this.nextRound();
        }
      };

      // Tapping anywhere immediately deposits and advances
      feedbackEl.onclick = completeAndAdvance;

      // Phase 1: Card win feedback in center of screen (480ms)
      this.winTimer1 = setTimeout(() => {
        if (advanced) return;
        // Phase 2: Deposit of Spark! Launch electric flight to header counter
        if (sparkPill && !isUnlimited && gained > 0) {
          sparkPill.classList.add('zapping');
          if (window.oneShotAudio && typeof window.oneShotAudio.playZap === 'function') {
            window.oneShotAudio.playZap();
          }
          if (window.oneShotFX && typeof window.oneShotFX.zapTrail === 'function') {
            window.oneShotFX.zapTrail(pillCenterX, pillCenterY, targetX, targetY, '#ffdc48');
          }
        }

        // Phase 3: Spark lands in header counter, deposits, and next round begins (360ms later)
        this.winTimer2 = setTimeout(() => {
          completeAndAdvance();
        }, 360);
      }, 480);
    }

    hideWinFeedback() {
      if (this.winTimer1) clearTimeout(this.winTimer1);
      if (this.winTimer2) clearTimeout(this.winTimer2);
      const feedbackEl = document.getElementById('winFeedback');
      if (feedbackEl) feedbackEl.classList.add('hidden');
      const sparkPill = document.getElementById('winSparkPill');
      if (sparkPill) sparkPill.classList.remove('zapping');
    }

    // Aliases for backward compatibility
    hideRelationReveal() {
      this.hideWinFeedback();
    }

    skipThemeReveal() {
      this.hideWinFeedback();
      if (this.mode === 'daily' && this.round >= 5) {
        this.finishDailySuccess();
      } else {
        this.nextRound();
      }
    }

    calculateSparksGained(remSec) {
      const pace = this.state.settings.timerPace || 'progressive';
      const tier = this.activeSet && this.activeSet.tier ? this.activeSet.tier : Math.min(5, Math.floor(this.streak / 5) + 1);
      const isMilestone = this.streak % 5 === 0;

      // 1. Unlimited (Practice) Mode: Pure practice sandbox — 0 sparks earned (prevents 2X ad boost exploit)
      if (pace === 'unlimited') {
        return {
          total: 0,
          base: 0,
          bonus: 0,
          bonusTag: isMilestone ? '🎯 PRACTICE MILESTONE! ' : '',
          isMilestone
        };
      }

      // 2. Daily Challenge Mode (Fixed 5 rounds)
      if (this.mode === 'daily') {
        return {
          total: 5,
          base: 5,
          bonus: 0,
          bonusTag: '',
          isMilestone: false
        };
      }

      // 3. Relaxed Mode (15s -> 5s)
      if (pace === 'relaxed') {
        const base = 2 + tier;
        let bonus = 0;
        let bonusTag = '';
        if (isMilestone) {
          bonus += 10;
          bonusTag = `🔥 ${this.streak} STREAK! `;
        }
        if (Number.isFinite(remSec) && Number.isFinite(this.roundDuration) && remSec >= (this.roundDuration * 0.5)) {
          bonus += 1;
          bonusTag += '⚡ QUICK DRAW! ';
        }
        return {
          total: base + bonus,
          base,
          bonus,
          bonusTag,
          isMilestone
        };
      }

      // 4. Blitz Mode (7s -> 3.0s): High stakes, fastest reflexes
      if (pace === 'blitz') {
        const base = 5 + (tier * 3);
        let bonus = 0;
        let bonusTag = '';
        if (isMilestone) {
          bonus += 25;
          bonusTag = `⚡⚡ ${this.streak} BLITZ MILESTONE! `;
        }
        if (Number.isFinite(remSec) && Number.isFinite(this.roundDuration)) {
          if (remSec >= (this.roundDuration * 0.6)) {
            bonus += 3;
            bonusTag += '⚡ LIGHTNING REFLEX! ';
          } else if (remSec <= 0.9) {
            bonus += 5;
            bonusTag += `🚨 CLUTCH ${remSec.toFixed(1)}s! `;
          }
        }
        return {
          total: base + bonus,
          base,
          bonus,
          bonusTag,
          isMilestone
        };
      }

      // 5. Progressive Mode (Standard, 12s -> 3.5s): Restrictive to incentivize IAPs
      const base = 3 + (tier * 2);
      let bonus = 0;
      let bonusTag = '';
      if (isMilestone) {
        bonus += 15;
        bonusTag = `🔥 ${this.streak} STREAK! `;
      }
      if (Number.isFinite(remSec) && Number.isFinite(this.roundDuration)) {
        if (remSec >= (this.roundDuration * 0.5)) {
          bonus += 2;
          bonusTag += '⚡ QUICK DRAW! ';
        } else if (remSec <= 1.1) {
          bonus += 4;
          bonusTag += `🚨 CLUTCH ${remSec.toFixed(1)}s! `;
        }
      }

      return {
        total: base + bonus,
        base,
        bonus,
        bonusTag,
        isMilestone
      };
    }

    handleCorrectHit(remSec) {
      this.streak += 1;
      const pace = (this.state.settings && this.state.settings.timerPace) || 'progressive';
      const isUnlimited = pace === 'unlimited';

      const reward = this.calculateSparksGained(remSec);
      let gained = reward.total;

      let isNewBest = false;
      // High score best streak is earned in competitive timed modes (not untimed practice sandbox)
      if (this.mode !== 'daily' && !isUnlimited && this.streak > this.state.bestStreak) {
        this.state.bestStreak = this.streak;
        if (!this.newBestAwardedThisRun) {
          this.newBestAwardedThisRun = true;
          const bestBonus = pace === 'blitz' ? 50 : 35;
          gained += bestBonus;
          isNewBest = true;
          if (window.oneShotAnalytics) {
            window.oneShotAnalytics.track('personal_best', { newBest: this.streak });
          }
        }
      }

      // Multiply sparks if 2X rewarded ad boost is active (only on timed runs)
      if (this.boost2xActive && !isUnlimited) {
        gained *= 2;
      }

      if (window.oneShotAnalytics) {
        window.oneShotAnalytics.track('answer_correct', {
          setId: this.activeSet.id,
          streak: this.streak,
          sparksGained: gained,
          boostActive: this.boost2xActive,
          timeLeft: Number.isFinite(remSec) ? Number(remSec.toFixed(2)) : null
        });
      }

      if (isUnlimited) {
        if (reward.isMilestone) {
          if (window.oneShotAudio) window.oneShotAudio.playMilestone(this.streak);
          if (window.oneShotFX) window.oneShotFX.confettiShower(40);
        } else {
          if (window.oneShotAudio) window.oneShotAudio.playCorrect(this.streak);
        }
      } else {
        if (isNewBest) {
          if (window.oneShotAudio) window.oneShotAudio.playMilestone(this.streak);
          if (window.oneShotFX) window.oneShotFX.confettiShower(75);
        } else if (reward.isMilestone) {
          if (window.oneShotAudio) window.oneShotAudio.playMilestone(this.streak);
          if (window.oneShotFX) window.oneShotFX.confettiShower(50);
        } else {
          if (window.oneShotAudio) window.oneShotAudio.playCorrect(this.streak);
        }
      }

      const streakEl = document.getElementById('streak');
      if (streakEl) streakEl.textContent = String(this.streak);
      const barEl = document.getElementById('bar');
      if (barEl) {
        const pct = this.mode === 'daily' ? (this.round / 5) * 100 : ((this.streak % 5) / 5) * 100 || 100;
        barEl.style.width = `${pct}%`;
      }

      // Trigger user feedback per win of card & deposit of spark in middle of screen!
      this.triggerWinFeedback(gained, isUnlimited, isNewBest, reward, remSec);
    }

    finishDailySuccess() {
      const today = getTodayKey();
      const yesterday = getYesterdayKey();

      const dailyBonus = 30;
      this.runSparks += dailyBonus;
      this.state.sparks += dailyBonus;

      if (this.state.daily.lastCompletedDate === yesterday) {
        this.state.daily.streak = (this.state.daily.streak || 0) + 1;
      } else if (this.state.daily.lastCompletedDate !== today) {
        this.state.daily.streak = 1;
      }
      this.state.daily.lastPlayedDate = today;
      this.state.daily.lastCompletedDate = today;
      this.state.daily.todayScore = 5;
      this.state.daily.todayCompleted = true;
      this.state.daily.todayHistory = [...this.roundHistory];
      this.saveState();
      this.syncHeaderAndHome();

      if (window.oneShotAudio) window.oneShotAudio.playMilestone(10);
      if (window.oneShotFX) window.oneShotFX.confettiShower(85);
      if (window.oneShotAnalytics) {
        window.oneShotAnalytics.track('daily_completed', {
          date: today,
          dailyStreak: this.state.daily.streak,
          sparksEarned: this.runSparks
        });
      }

      this.finishRun(true, false);
    }

    finishRun(completedDaily, isTimeout) {
      this.stopTimer();
      this.hideRelationReveal();
      this.answered = true;
      this.state.completedRuns = (this.state.completedRuns || 0) + 1;

      const today = getTodayKey();
      if (this.mode === 'daily') {
        this.state.daily.lastPlayedDate = today;
        this.state.daily.todayScore = this.streak;
        this.state.daily.todayHistory = [...this.roundHistory];
        if (!completedDaily) {
          this.state.daily.todayCompleted = false;
          this.state.daily.streak = 0; // Missed daily drops current daily streak
        }
        this.syncHeaderAndHome();
      }

      this.saveState();

      if (window.oneShotAnalytics) {
        window.oneShotAnalytics.track('run_ended', {
          mode: this.mode,
          finalStreak: this.streak,
          sparksEarned: this.runSparks,
          timeout: isTimeout,
          completedDaily
        });
      }

      const $ = (id) => document.getElementById(id);

      if (completedDaily) {
        $('burst').textContent = '🎯';
        $('resultTag').textContent = `DAILY CHALLENGE COMPLETE · ${this.state.daily.streak}🔥 DAY STREAK`;
        $('resultTitle').textContent = 'PERFECT 5/5!';
        $('resultText').textContent = `You completed today’s challenge and earned a +30 ⚡ bonus!`;
      } else if (this.mode === 'daily') {
        $('burst').textContent = isTimeout ? '⏰' : '❌';
        $('resultTag').textContent = `DAILY CHALLENGE · ${this.streak}/5 COMPLETED`;
        $('resultTitle').textContent = isTimeout ? 'TIME UP!' : 'MISSED!';
        $('resultText').textContent = `You completed ${this.streak}/5 daily prompts today. New daily unlocks at midnight!`;
      } else if (this.mode === 'duel' && this.streak > this.duelTarget) {
        $('burst').textContent = '⚔️';
        $('resultTag').textContent = 'CHALLENGE COMPLETE';
        $('resultTitle').textContent = 'YOU WON!';
        $('resultText').textContent = `You beat the target score of ${this.duelTarget} with a streak of ${this.streak}!`;
      } else {
        $('burst').textContent = isTimeout ? '⏰' : '❌';
        $('resultTag').textContent = isTimeout ? 'TIME RAN OUT' : 'WRONG ANSWER';
        $('resultTitle').textContent = isTimeout ? 'TIME UP!' : 'MISSED!';
        $('resultText').textContent = `The odd word out was "${this.activeSet.intruder}". Final streak: ${this.streak}.`;
      }

      const timingBadge = $('timingBadge');
      if (timingBadge) {
        if (isTimeout) {
          timingBadge.textContent = `⏱️ Timer hit 0.0s on Round ${this.round}`;
          timingBadge.classList.remove('hidden');
        } else if (this.state.settings && this.state.settings.timerPace === 'unlimited') {
          timingBadge.textContent = `∞ Unlimited Mode · ${this.lastReactionTime.toFixed(1)}s thought time`;
          timingBadge.classList.remove('hidden');
        } else if (this.lastTimeRemaining > 0 && Number.isFinite(this.lastTimeRemaining)) {
          timingBadge.textContent = `⏱️ Tapped in ${this.lastReactionTime.toFixed(1)}s (${this.lastTimeRemaining.toFixed(1)}s left)`;
          timingBadge.classList.remove('hidden');
        } else {
          timingBadge.classList.add('hidden');
        }
      }

      if (this.activeSet) {
        const shortCat = (this.activeSet.shortCategory || this.activeSet.category).toUpperCase();
        const shortTag = this.activeSet.shortTag || "Doesn't Fit";
        if ($('explainCategory')) {
          $('explainCategory').textContent = shortCat;
        }
        if ($('explainIntruder')) {
          $('explainIntruder').textContent = this.activeSet.intruder;
        }
        if ($('explainReason')) {
          $('explainReason').textContent = `✕ ${shortTag}`;
        }
        if ($('explainValid')) {
          const validShown =
            this.activeValidSample && this.activeValidSample.length > 0
              ? this.activeValidSample
              : this.activeSet.validWords.slice(0, 3);
          $('explainValid').textContent = validShown.join(' · ');
        }
      }

      const isUnlimited = this.state.settings && this.state.settings.timerPace === 'unlimited';

      if ($('finalScore')) $('finalScore').textContent = String(this.streak);
      if ($('finalBest')) $('finalBest').textContent = isUnlimited ? `${this.state.bestStreak} (TIMED)` : String(this.state.bestStreak);
      if ($('finalCoins')) {
        $('finalCoins').textContent = isUnlimited ? '0 (PRACTICE)' : (this.boost2xActive ? `+${this.runSparks} (2X ⚡)` : `+${this.runSparks}`);
      }

      this.savedDeathStreak = this.streak;

      // Update Revive rewarded ad offer button (disabled in untimed practice)
      const reviveBtn = $('reviveAdBtn');
      const reviveLabel = $('reviveStreakLabel');
      if (reviveBtn) {
        const canRevive = !isUnlimited && !completedDaily && !this.continueUsedThisRun && this.mode !== 'duel';
        reviveBtn.style.display = canRevive ? 'flex' : 'none';
        if (canRevive && reviveLabel) {
          reviveLabel.textContent = this.streak > 0
            ? `Keep your streak of ${this.streak} · +3s Breather`
            : `Continue with a fresh prompt · +3s Breather`;
        }
      }

      if ($('replayBtn')) {
        $('replayBtn').textContent = this.mode === 'daily' ? 'PLAY QUICK SHOT' : 'PLAY AGAIN';
      }

      this.showScreen('result');
      this.boost2xActive = false;
    }

    // Rewarded Ad & 2X Spark Boost Methods
    handleBoost2xClick() {
      if (this.state.nextRound2xBoost) {
        if (window.oneShotAudio) window.oneShotAudio.playTap();
        this.showFloatingBurst('⚡ 2X Sparks already active for your next run!');
        return;
      }
      this.triggerRewardedAd('boost_2x');
    }

    updateBoostBtn() {
      const btn = document.getElementById('boost2xBtn');
      if (!btn) return;
      const isBoosted = !!this.state.nextRound2xBoost;
      btn.classList.toggle('active-boost', isBoosted);
      const title = document.getElementById('boost2xTitle');
      const sub = document.getElementById('boost2xSub');
      const badge = document.getElementById('boost2xBadge');
      const icon = document.getElementById('boost2xIcon');

      if (isBoosted) {
        if (title) title.textContent = '2X SPARKS ACTIVE FOR NEXT RUN!';
        if (sub) sub.textContent = 'Doubles all sparks earned on your next play';
        if (badge) badge.textContent = 'ACTIVE 🔥';
        if (icon) icon.textContent = '🔥';
      } else {
        if (title) title.textContent = '2X SPARKS NEXT ROUND';
        if (sub) sub.textContent = 'Watch a short ad to double all sparks';
        if (badge) badge.textContent = '📺 WATCH AD';
        if (icon) icon.textContent = '⚡';
      }
    }

    triggerRewardedAd(type) {
      if (window.oneShotAudio) window.oneShotAudio.playTap();
      this.pendingAdAction = type;

      const isNative = typeof window.Capacitor?.isNativePlatform === 'function' && window.Capacitor.isNativePlatform();

      // Check for native Capacitor AdMob plugin
      if (isNative && window.Capacitor?.Plugins?.AdMob) {
        this.showNativeCapacitorRewardedAd(type);
        return;
      }

      // Check for Google H5 Games Ads / Web AdBreak (browser)
      if (window.adBreak || window.showAds) {
        this.showWebRewardedAd(type);
        return;
      }

      // Interactive rewarded ad modal ONLY when NOT running natively
      if (!isNative) {
        this.openRewardedAdModal(type);
      } else {
        this.showFloatingBurst('Ads temporarily unavailable');
        this.cancelRewardedAd();
      }
    }

    async showNativeCapacitorRewardedAd(type) {
      console.log('[AdMob] showNativeCapacitorRewardedAd called, type:', type, 'testMode:', ADS_TEST_MODE);
      const isNative = typeof window.Capacitor?.isNativePlatform === 'function' && window.Capacitor.isNativePlatform();

      if (this.isAdLoading) {
        console.log('[AdMob] Ad is already loading, ignoring concurrent request');
        this.showFloatingBurst('Loading ad...');
        return;
      }

      const AdMob = window.Capacitor?.Plugins?.AdMob;
      if (!AdMob) {
        console.warn('[AdMob] Plugin not available on window.Capacitor.Plugins');
        if (!isNative) {
          this.openRewardedAdModal(type);
        } else {
          this.showFloatingBurst('Ad service unavailable');
          this.cancelRewardedAd();
        }
        return;
      }

      this.isAdLoading = true;
      let listeners = [];
      const cleanup = () => {
        listeners.forEach((l) => {
          try { if (l && typeof l.remove === 'function') l.remove(); } catch (_) {}
        });
        listeners = [];
      };

      try {
        // Initialize AdMob once with testing mode flag tied to ADS_TEST_MODE
        if (!this.admobInitialized) {
          console.log(`[AdMob] Initializing AdMob plugin with initializeForTesting: ${ADS_TEST_MODE}...`);
          await AdMob.initialize({
            initializeForTesting: ADS_TEST_MODE,
          }).catch((e) => console.warn('[AdMob] initialize warning:', e));
          this.admobInitialized = true;
        }

        const platform = window.Capacitor?.getPlatform ? window.Capacitor.getPlatform() : 'android';
        // When ADS_TEST_MODE is true, use ONLY Google's official test ad unit IDs
        // When false, use ONLY the live unit IDs. Never request both in the same flow.
        const adUnitId = ADS_TEST_MODE
          ? (platform === 'ios'
              ? 'ca-app-pub-3940256099942544/1712485313'  // Official Google iOS Test Rewarded Ad Unit ID
              : 'ca-app-pub-3940256099942544/5224354917') // Official Google Android Test Rewarded Ad Unit ID
          : (platform === 'ios'
              ? 'ca-app-pub-2691430114035059/5689531599'  // Live iOS Rewarded Ad Unit ID
              : 'ca-app-pub-2691430114035059/1849524787'); // Live Android Rewarded Ad Unit ID

        const RewardedEvent = window.RewardAdPluginEvents?.Rewarded || 'onRewardedVideoAdReward';
        const DismissedEvent = window.RewardAdPluginEvents?.Dismissed || 'onRewardedVideoAdDismissed';
        const FailedToLoadEvent = window.RewardAdPluginEvents?.FailedToLoad || 'onRewardedVideoAdFailedToLoad';
        const FailedToShowEvent = window.RewardAdPluginEvents?.FailedToShow || 'onRewardedVideoAdFailedToShow';

        let rewardEarned = false;

        const rewardListener = await AdMob.addListener(RewardedEvent, (rewardItem) => {
          console.log('[AdMob] Rewarded event received:', rewardItem);
          rewardEarned = true;
          this.grantAdReward(type);
        }).catch(() => null);
        if (rewardListener) listeners.push(rewardListener);

        const dismissListener = await AdMob.addListener(DismissedEvent, () => {
          console.log('[AdMob] Dismissed event received');
          cleanup();
          if (!rewardEarned) {
            this.cancelRewardedAd();
          }
        }).catch(() => null);
        if (dismissListener) listeners.push(dismissListener);

        const failShowListener = await AdMob.addListener(FailedToShowEvent, (err) => {
          console.warn('[AdMob] FailedToShow:', err);
          cleanup();
          if (!rewardEarned) {
            this.showFloatingBurst('Ad presentation failed');
            this.cancelRewardedAd();
          }
        }).catch(() => null);
        if (failShowListener) listeners.push(failShowListener);

        console.log(`[AdMob] Preparing rewarded video (adId: ${adUnitId}, isTesting: ${ADS_TEST_MODE})...`);
        await AdMob.prepareRewardVideoAd({ adId: adUnitId, isTesting: ADS_TEST_MODE });

        console.log('[AdMob] Ad prepared successfully, showing reward video...');
        await AdMob.showRewardVideoAd();
      } catch (err) {
        console.error('[AdMob] Native ad load/show failed (error code/message):', err);
        cleanup();
        this.showFloatingBurst('Ad unavailable · Please try again later');
        this.cancelRewardedAd();
      } finally {
        this.isAdLoading = false;
      }
    }

    showWebRewardedAd(type) {
      console.log('[Ad] showWebRewardedAd started, type:', type);
      try {
        if (typeof window.adBreak === 'function') {
          let adHandled = false;
          // Watchdog: Give Google AdSense ample time (4500ms) to load its test ad iframe from Google servers
          const safetyTimer = setTimeout(() => {
            console.log('[Ad] safetyTimer fired, adHandled:', adHandled);
            if (!adHandled) {
              adHandled = true;
              this.openRewardedAdModal(type);
            }
          }, 4500);

          window.adBreak({
            type: 'reward',
            name: type,
            beforeReward: (showAdFn) => {
              console.log('[Ad] beforeReward called by Google');
              adHandled = true;
              clearTimeout(safetyTimer);
              showAdFn();
            },
            adDismissed: () => {
              console.log('[Ad] adDismissed called by Google');
              adHandled = true;
              clearTimeout(safetyTimer);
              this.cancelRewardedAd();
            },
            adViewed: () => {
              console.log('[Ad] adViewed called by Google');
              adHandled = true;
              clearTimeout(safetyTimer);
              this.grantAdReward(type);
            },
            adBreakDone: (info) => {
              console.log('[Ad] adBreakDone called by Google, info:', JSON.stringify(info));
              clearTimeout(safetyTimer);
              if (!adHandled) {
                adHandled = true;
                if (!info || info.breakStatus !== 'viewed') {
                  this.openRewardedAdModal(type);
                }
              }
            }
          });
          return;
        }
      } catch (e) {
        console.error('[Ad] showWebRewardedAd error:', e);
      }
      this.openRewardedAdModal(type);
    }

    openRewardedAdModal(type) {
      console.log('[Ad] openRewardedAdModal called, type:', type);
      const isNative = typeof window.Capacitor?.isNativePlatform === 'function' && window.Capacitor.isNativePlatform();
      if (isNative) {
        console.warn('[Ad] Refusing to open simulated ad modal on native platform');
        this.showFloatingBurst('Ad unavailable');
        this.cancelRewardedAd();
        return;
      }
      const overlay = document.getElementById('rewardedAdModal');
      console.log('[Ad] overlay element exists:', !!overlay);
      if (!overlay) {
        this.grantAdReward(type);
        return;
      }

      const category = document.getElementById('rewardedAdCategory');
      const title = document.getElementById('rewardedAdTitle');
      const subtitle = document.getElementById('rewardedAdSubtitle');
      const timer = document.getElementById('adSimTimer');
      const fill = document.getElementById('adProgressFill');
      const note = document.getElementById('adStatusNote');
      const claimBtn = document.getElementById('claimRewardBtn');
      const closeBtn = document.getElementById('rewardedAdCloseBtn');

      if (category) category.textContent = type === 'boost_2x' ? '⚡ 2X SPARKS REWARD' : '❤️‍🔥 REVIVE & CONTINUE REWARD';
      if (title) title.textContent = 'SPONSORED VIDEO';
      if (subtitle) subtitle.textContent = type === 'boost_2x'
        ? 'Watch to the end to double all sparks on your next round!'
        : 'Watch to the end to revive your streak with a +3s breather!';
      if (claimBtn) claimBtn.classList.add('hidden');
      if (closeBtn) closeBtn.style.opacity = '0.5';

      overlay.classList.add('show');

      let remaining = 5;
      if (timer) timer.textContent = `${remaining}s`;
      if (fill) fill.style.width = '0%';
      if (note) note.textContent = `Reward unlocks in ${remaining}s...`;

      if (this.adInterval) clearInterval(this.adInterval);
      const startTime = Date.now();
      const totalDuration = 5000;

      this.adInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, (elapsed / totalDuration) * 100);
        remaining = Math.max(0, Math.ceil((totalDuration - elapsed) / 1000));

        if (timer) timer.textContent = `${remaining}s`;
        if (fill) fill.style.width = `${progress}%`;
        if (note) note.textContent = remaining > 0 ? `Reward unlocks in ${remaining}s...` : 'Reward Unlocked! ✨';

        if (elapsed >= totalDuration) {
          clearInterval(this.adInterval);
          this.adInterval = null;
          if (claimBtn) {
            claimBtn.classList.remove('hidden');
            claimBtn.focus();
          }
          if (closeBtn) closeBtn.style.opacity = '1';
        }
      }, 100);
    }

    claimActiveReward() {
      const overlay = document.getElementById('rewardedAdModal');
      if (overlay) overlay.classList.remove('show');
      if (this.adInterval) {
        clearInterval(this.adInterval);
        this.adInterval = null;
      }
      const type = this.pendingAdAction;
      this.pendingAdAction = null;
      this.grantAdReward(type);
    }

    cancelRewardedAd() {
      if (this.adInterval) {
        clearInterval(this.adInterval);
        this.adInterval = null;
        this.showFloatingBurst('Ad skipped · Reward not earned');
      }
      const overlay = document.getElementById('rewardedAdModal');
      if (overlay) overlay.classList.remove('show');
      this.pendingAdAction = null;
    }

    grantAdReward(type) {
      if (type === 'boost_2x') {
        this.state.nextRound2xBoost = true;
        this.saveState();
        this.updateBoostBtn();
        if (window.oneShotAudio) window.oneShotAudio.playReward();
        this.showFloatingBurst('⚡ 2X SPARKS ACTIVE FOR NEXT ROUND!');
        if (window.oneShotAnalytics) {
          window.oneShotAnalytics.track('rewarded_ad_completed', { type: 'boost_2x' });
        }
      } else if (type === 'revive') {
        this.continueUsedThisRun = true;
        this.reviveBreatherActive = true;
        this.streak = this.savedDeathStreak;
        if (window.oneShotAudio) window.oneShotAudio.playLaunch();
        this.showScreen('game');
        this.nextRound();
        this.showFloatingBurst(`❤️‍🔥 REVIVED! STREAK ${this.streak} (+3s Breather)`);
        if (window.oneShotAnalytics) {
          window.oneShotAnalytics.track('rewarded_ad_completed', { type: 'revive', streak: this.streak });
        }
      }
    }

    completeAdModal() {
      this.claimActiveReward();
    }

    showInterstitialAd() {
      // Hook for store/web interstitial ad breaks
    }

    openShop(tab = 'packs') {
      if (window.oneShotAudio) window.oneShotAudio.playTap();
      this.showScreen('shop');
      this.switchShopTab(tab);
    }

    switchShopTab(tab) {
      this.shopTab = tab === 'themes' ? 'themes' : 'packs';
      const $ = (id) => document.getElementById(id);
      if ($('tabBtnPacks')) $('tabBtnPacks').classList.toggle('active', this.shopTab === 'packs');
      if ($('tabBtnThemes')) $('tabBtnThemes').classList.toggle('active', this.shopTab === 'themes');
      this.renderShopList();
    }

    renderShopList() {
      const listEl = document.getElementById('shopList');
      if (!listEl) return;

      if (this.shopTab === 'packs') {
        const counts = this.getPoolCounts();
        const unlocked = this.state.unlockedPacks || STARTER_PACKS;
        const enabled = this.state.enabledPacks || [];
        const hasAdultActive = enabled.some((p) => ADULT_PACKS.includes(p));

        let html = `
          <div class="packs-pool-summary">
            <div class="pool-summary-top">
              <div class="pool-summary-meta">
                <span class="pool-summary-eyebrow">ACTIVE PROMPTS</span>
                <div class="pool-summary-count">
                  <span class="pool-sets-num">${counts.activeSets.toLocaleString()}</span>
                  <span class="pool-sets-label">PROMPTS</span>
                </div>
              </div>
              <div class="pool-summary-badge">
                <span class="pool-active-dot ${counts.enabledCount > 0 ? 'active' : ''}"></span>
                <span>${counts.enabledCount} of ${counts.totalUnlockedPacks} Topics Active</span>
              </div>
            </div>
            <div class="pool-summary-actions">
              <button class="pool-action-btn select-all-btn" onclick="event.stopPropagation(); app.promptSelectAll()">
                ✓ SELECT ALL
              </button>
              <button class="pool-action-btn deselect-all-btn" onclick="event.stopPropagation(); app.deselectAllPacks()">
                ✕ UNSELECT ALL
              </button>
            </div>
            <div class="pool-summary-adult-bar">
              <button class="pool-adult-toggle ${hasAdultActive ? 'active' : ''}" onclick="event.stopPropagation(); app.toggleAllAdultPacks()" type="button" aria-label="Toggle 18+ topics inclusion">
                <span class="adult-toggle-text">🔥 18+ Topics: <strong>${hasAdultActive ? 'INCLUDED' : 'EXCLUDED'}</strong></span>
                <span class="adult-toggle-chip">${hasAdultActive ? 'ON ✓' : 'OFF'}</span>
              </button>
            </div>
          </div>

          <div class="pack-section-head">
            <span>STANDARD TOPICS (${STANDARD_PACKS.length} Topics · ${counts.std.toLocaleString()} Prompts)</span>
          </div>
        `;

        // 10 Standard Packs
        STANDARD_PACKS.forEach((packName) => {
          const count = this.packs.filter((p) => p.pack === packName).length;
          const isUnlocked = unlocked.includes(packName) || (PACK_PRICING[packName] === 0);
          const isEnabled = isUnlocked && enabled.includes(packName);
          const price = PACK_PRICING[packName] || 250;
          const safePack = packName.replace(/'/g, "\\'");
          const canAfford = this.state.sparks >= price;
          const meta = PACK_META[packName] || { icon: '📦', tier: 'Standard' };

          if (isUnlocked) {
            html += `
              <div class="shop-item pack-toggle-item ${isEnabled ? 'pack-active' : 'pack-inactive'}" onclick="app.togglePack('${safePack}', false)">
                <div class="shop-info">
                  <div class="pack-title-row">
                    <span class="pack-icon">${meta.icon}</span>
                    <b>${packName}</b>
                    <span class="pack-count-chip">${count} prompts</span>
                  </div>
                  <span class="pack-tier-chip">${meta.tier}</span>
                </div>
                <button class="pack-toggle-pill ${isEnabled ? 'on' : 'off'}" type="button">
                  ${isEnabled ? 'ACTIVE ✓' : 'OFF'}
                </button>
              </div>
            `;
          } else {
            html += `
              <div class="shop-item locked pack-locked-item" onclick="app.unlockTopicPack('${safePack}', false)">
                <div class="shop-info">
                  <div class="pack-title-row">
                    <span class="pack-icon">🔒</span>
                    <b>${packName}</b>
                    <span class="pack-count-chip">${count} prompts</span>
                  </div>
                  <span class="pack-lock-sub">${meta.tier} · <strong style="color:var(--neon-gold)">${price} ⚡ to unlock</strong></span>
                </div>
                <button class="shop-btn buy ${canAfford ? '' : 'cant-afford'}" type="button">
                  ⚡ ${price} UNLOCK
                </button>
              </div>
            `;
          }
        });

        // 5 Adult Packs
        html += `
          <div class="pack-section-head" style="color:var(--pink); margin-top:14px;">
            <span>🔥 18+ TOPICS (${ADULT_PACKS.length} Topics · ${counts.adult.toLocaleString()} Prompts)</span>
          </div>
        `;

        ADULT_PACKS.forEach((packName) => {
          const count = this.packs.filter((p) => p.pack === packName).length;
          const isUnlocked = unlocked.includes(packName) || (PACK_PRICING[packName] === 0);
          const isEnabled = isUnlocked && enabled.includes(packName);
          const price = PACK_PRICING[packName] || 300;
          const safePack = packName.replace(/'/g, "\\'");
          const canAfford = this.state.sparks >= price;
          const meta = PACK_META[packName] || { icon: '🔥', tier: '18+ Spicy' };

          if (isUnlocked) {
            html += `
              <div class="shop-item pack-toggle-item adult-item ${isEnabled ? 'pack-active' : 'pack-inactive'}" onclick="app.togglePack('${safePack}', true)">
                <div class="shop-info">
                  <div class="pack-title-row">
                    <span class="pack-icon">${meta.icon}</span>
                    <b>${packName}</b>
                    <span class="pack-count-chip">${count} prompts</span>
                  </div>
                  <span class="pack-tier-chip" style="color:rgba(255,140,190,0.85)">${meta.tier}</span>
                </div>
                <button class="pack-toggle-pill ${isEnabled ? 'on adult-pill' : 'off'}" type="button">
                  ${isEnabled ? 'ACTIVE ✓' : 'OFF'}
                </button>
              </div>
            `;
          } else {
            html += `
              <div class="shop-item locked pack-locked-item" style="border-color:rgba(255,60,145,0.25)" onclick="app.unlockTopicPack('${safePack}', true)">
                <div class="shop-info">
                  <div class="pack-title-row">
                    <span class="pack-icon">🔒🔥</span>
                    <b>${packName}</b>
                    <span class="pack-count-chip">${count} prompts</span>
                  </div>
                  <span class="pack-lock-sub">${meta.tier} · <strong style="color:var(--neon-gold)">${price} ⚡ to unlock</strong></span>
                </div>
                <button class="shop-btn buy ${canAfford ? '' : 'cant-afford'}" type="button">
                  ⚡ ${price} UNLOCK
                </button>
              </div>
            `;
          }
        });

        listEl.innerHTML = html;

        const closeBtn = document.getElementById('shopCloseBtn');
        if (closeBtn) {
          if (counts.activeSets === 0) {
            closeBtn.classList.add('disabled-nav');
            closeBtn.title = 'Select at least 1 topic to continue';
          } else {
            closeBtn.classList.remove('disabled-nav');
            closeBtn.title = 'Close and return home';
          }
        }

        const playBtn = document.getElementById('playShopBtn');
        if (playBtn) {
          if (counts.activeSets > 0) {
            playBtn.textContent = `START (${counts.activeSets.toLocaleString()} PROMPTS)`;
            playBtn.classList.remove('disabled');
            playBtn.disabled = false;
          } else {
            playBtn.textContent = 'SELECT AT LEAST 1 TOPIC';
            playBtn.classList.add('disabled');
            playBtn.disabled = true;
          }
        }
        return;
      }

      // Themes Tab
      const items = COSMETICS.themes;
      listEl.innerHTML = items
        .map((item) => {
          const isUnlocked = this.state.unlocked.includes(item.id) || item.price === 0;
          const isEquipped =
            (item.type === 'bg' && this.state.equippedBg === item.value) ||
            (item.type === 'skin' && this.state.equippedSkin === item.value);

          let btnLabel = `⚡ ${item.price}`;
          let btnClass = 'shop-btn buy';
          if (isEquipped) {
            btnLabel = 'EQUIPPED ✓';
            btnClass = 'shop-btn equipped';
          } else if (isUnlocked) {
            btnLabel = 'EQUIP';
            btnClass = 'shop-btn';
          }

          return `
            <div class="shop-item ${isEquipped ? 'active-item' : ''}">
              <div class="shop-info">
                <b>${item.name}</b>
                <span>${item.desc}</span>
              </div>
              <button class="${btnClass}" onclick="app.handleCosmeticAction('${item.id}')">${btnLabel}</button>
            </div>
          `;
        })
        .join('');

      const playBtn = document.getElementById('playShopBtn');
      if (playBtn) {
        playBtn.textContent = 'START PLAYING';
        playBtn.classList.remove('disabled');
        playBtn.disabled = false;
      }
    }

    togglePack(packName, isAdultPack = false) {
      const unlocked = this.state.unlockedPacks || STARTER_PACKS;
      const isUnlocked = unlocked.includes(packName) || (PACK_PRICING[packName] === 0);
      if (!isUnlocked) {
        return this.unlockTopicPack(packName, isAdultPack);
      }

      const currentEnabled = Array.isArray(this.state.enabledPacks) ? [...this.state.enabledPacks] : [];
      const isCurrentlyOn = currentEnabled.includes(packName);

      if (!isCurrentlyOn && isAdultPack && !this.state.adultVerified) {
        this.pendingAdultCallback = () => this.togglePack(packName, true);
        const modal = document.getElementById('ageGateOverlay');
        if (modal) modal.classList.add('show');
        return;
      }

      if (window.oneShotAudio) window.oneShotAudio.playTap();

      if (isCurrentlyOn) {
        this.state.enabledPacks = currentEnabled.filter((p) => p !== packName);
      } else {
        this.state.enabledPacks = [...currentEnabled, packName];
        if (isAdultPack && this.state.adultMode === 'off') {
          this.state.adultMode = 'mix';
        }
      }

      this.state.selectedPack = this.state.enabledPacks.length === 1 ? this.state.enabledPacks[0] : 'CUSTOM';
      this.saveState();
      this.renderShopList();
    }

    promptSelectAll() {
      if (window.oneShotAudio) window.oneShotAudio.playTap();
      const modal = document.getElementById('selectAllModal');
      if (modal) {
        modal.classList.add('show');
      } else {
        this.confirmSelectAll(false);
      }
    }

    closeSelectAllModal() {
      const modal = document.getElementById('selectAllModal');
      if (modal) modal.classList.remove('show');
    }

    confirmSelectAll(includeAdult = true) {
      this.closeSelectAllModal();
      if (includeAdult) {
        if (!this.state.adultVerified) {
          this.pendingAdultCallback = () => this.confirmSelectAll(true);
          const modal = document.getElementById('ageGateOverlay');
          if (modal) modal.classList.add('show');
          return;
        }
        if (window.oneShotAudio) window.oneShotAudio.playReward();
        const unlocked = this.state.unlockedPacks || STARTER_PACKS;
        this.state.enabledPacks = [...unlocked];
        this.state.adultMode = 'mix';
        this.state.selectedPack = 'ALL';
        this.saveState();
        this.renderShopList();
        this.showFloatingBurst('Selected all topics (including 18+ 🔥)!');
      } else {
        if (window.oneShotAudio) window.oneShotAudio.playTap();
        const unlocked = this.state.unlockedPacks || STARTER_PACKS;
        this.state.enabledPacks = unlocked.filter((p) => STANDARD_PACKS.includes(p));
        this.state.adultMode = 'off';
        this.state.selectedPack = 'STANDARD';
        this.saveState();
        this.renderShopList();
        this.showFloatingBurst('Selected all standard topics!');
      }
    }

    toggleAllAdultPacks() {
      if (window.oneShotAudio) window.oneShotAudio.playTap();
      const hasAdultActive = (this.state.enabledPacks || []).some((p) => ADULT_PACKS.includes(p));
      if (hasAdultActive) {
        // Exclude adult packs
        this.state.enabledPacks = (this.state.enabledPacks || []).filter((p) => !ADULT_PACKS.includes(p));
        this.state.adultMode = 'off';
        this.state.selectedPack = this.state.enabledPacks.length === 1 ? this.state.enabledPacks[0] : 'CUSTOM';
        this.saveState();
        this.renderShopList();
        this.showFloatingBurst('18+ topics excluded');
      } else {
        // Include adult packs - requires age verification
        if (!this.state.adultVerified) {
          this.pendingAdultCallback = () => this.toggleAllAdultPacks();
          const modal = document.getElementById('ageGateOverlay');
          if (modal) modal.classList.add('show');
          return;
        }
        const unlockedAdults = (this.state.unlockedPacks || STARTER_PACKS).filter((p) => ADULT_PACKS.includes(p));
        const combined = new Set(this.state.enabledPacks || []);
        unlockedAdults.forEach((p) => combined.add(p));
        this.state.enabledPacks = Array.from(combined);
        this.state.adultMode = 'mix';
        this.state.selectedPack = 'CUSTOM';
        this.saveState();
        this.renderShopList();
        this.showFloatingBurst('18+ topics included! 🔥');
      }
    }

    selectAllPacks() {
      this.promptSelectAll();
    }

    deselectAllPacks() {
      if (window.oneShotAudio) window.oneShotAudio.playTap();
      this.state.enabledPacks = [];
      this.state.selectedPack = 'NONE';
      this.saveState();
      this.renderShopList();
      this.showFloatingBurst('All topics cleared. Tap any topic to turn it on!');
    }

    startFromShop() {
      const pool = this.getActivePool();
      if (!this.state.enabledPacks || this.state.enabledPacks.length === 0 || pool.length === 0) {
        if (window.oneShotAudio) window.oneShotAudio.playMiss(false);
        this.showFloatingBurst('⚠️ Tap at least 1 topic to turn it on!');
        return;
      }
      this.startQuickShot();
    }

    selectPackBundle(bundleType) {
      if (bundleType === 'mix') {
        this.selectAllPacks();
      } else if (bundleType === 'adult') {
        const unlocked = this.state.unlockedPacks || STARTER_PACKS;
        this.state.enabledPacks = unlocked.filter((p) => ADULT_PACKS.includes(p));
        this.state.adultMode = 'only';
        this.saveState();
        this.renderShopList();
      } else {
        const unlocked = this.state.unlockedPacks || STARTER_PACKS;
        this.state.enabledPacks = unlocked.filter((p) => STANDARD_PACKS.includes(p));
        this.state.adultMode = 'off';
        this.saveState();
        this.renderShopList();
      }
    }

    selectPack(packName, isAdultPack = false) {
      this.togglePack(packName, isAdultPack);
    }

    unlockTopicPack(packName, isAdultPack = false) {
      if (window.oneShotAudio) window.oneShotAudio.playTap();

      if (isAdultPack && !this.state.adultVerified) {
        this.pendingAdultCallback = () => this.unlockTopicPack(packName, true);
        const modal = document.getElementById('ageGateOverlay');
        if (modal) modal.classList.add('show');
        return;
      }

      const price = PACK_PRICING[packName] || 250;
      if (this.state.sparks < price) {
        const needed = price - this.state.sparks;
        this.showFloatingBurst(`Need ${needed} more ⚡ to unlock!`);
        if (window.oneShotAudio) window.oneShotAudio.playMiss(false);
        return;
      }

      this.state.sparks -= price;
      if (!this.state.unlockedPacks.includes(packName)) {
        this.state.unlockedPacks.push(packName);
      }
      if (!this.state.enabledPacks) this.state.enabledPacks = [];
      if (!this.state.enabledPacks.includes(packName)) {
        this.state.enabledPacks.push(packName);
      }
      this.state.selectedPack = packName;
      if (isAdultPack && this.state.adultMode === 'off') {
        this.state.adultMode = 'mix';
      }
      this.saveState();
      this.bumpCoinsPill();
      this.renderShopList();

      if (window.oneShotAudio) window.oneShotAudio.playReward();
      this.showFloatingBurst(`🎉 UNLOCKED: ${packName}!`);

      if (window.oneShotAnalytics) {
        window.oneShotAnalytics.track('topic_pack_unlocked', {
          pack: packName,
          price,
          remainingSparks: this.state.sparks
        });
      }
    }

    handleCosmeticAction(itemId) {
      const allItems = [...COSMETICS.themes, ...COSMETICS.badges];
      const item = allItems.find((x) => x.id === itemId);
      if (!item) return;

      const isUnlocked = this.state.unlocked.includes(item.id) || item.price === 0;
      if (!isUnlocked) {
        if (this.state.sparks < item.price) {
          this.showFloatingBurst(`Need ${item.price - this.state.sparks} more ⚡`);
          if (window.oneShotAudio) window.oneShotAudio.playMiss(false);
          return;
        }
        this.state.sparks -= item.price;
        this.state.unlocked.push(item.id);
        if (window.oneShotAudio) window.oneShotAudio.playReward();
      } else {
        if (window.oneShotAudio) window.oneShotAudio.playTap();
      }

      if (item.type === 'bg') this.state.equippedBg = item.value;
      if (item.type === 'skin') this.state.equippedSkin = item.value;
      if (item.type === 'badge') this.state.equippedBadge = item.value;
      if (item.type === 'vip') this.state.adsRemoved = true;

      this.applyCosmeticsAndSettings();
      this.saveState();
      this.renderShopList();
    }

    buildShareCardText() {
      const appUrl = 'https://techbishop.github.io/oddoneout/';
      return `Play Odd One Out — Fast mobile word game! Spot the connection and find the odd word out: ${appUrl}`;
    }

    openShareModal() {
      if (window.oneShotAudio) window.oneShotAudio.playTap();
      if (window.oneShotAnalytics) {
        window.oneShotAnalytics.track('share_clicked', {
          mode: this.mode,
          streak: this.streak
        });
      }

      const appUrl = 'https://techbishop.github.io/oddoneout/';
      const preview = document.getElementById('sharePreviewBox');
      if (preview) preview.textContent = appUrl;
      const copyBtn = document.getElementById('copyShareBtn');
      if (copyBtn) copyBtn.textContent = '🔗 SHARE APP LINK';

      const modal = document.getElementById('shareOverlay');
      if (modal) modal.classList.add('show');
    }

    closeShareModal() {
      const modal = document.getElementById('shareOverlay');
      if (modal) modal.classList.remove('show');
    }

    async copyShareCard() {
      const appUrl = 'https://techbishop.github.io/oddoneout/';
      const copyBtn = document.getElementById('copyShareBtn');

      try {
        if (navigator.share) {
          await navigator.share({
            title: 'Odd One Out — Fast Word Game',
            text: 'Play Odd One Out — Spot the connection and find the odd one out!',
            url: appUrl
          });
          if (copyBtn) copyBtn.textContent = 'SHARED ✓';
          this.showFloatingBurst('App link shared! ⚡');
          return;
        }
      } catch (err) {
        if (err && err.name !== 'AbortError') console.warn('Share error:', err);
      }

      try {
        await navigator.clipboard.writeText(appUrl);
        if (copyBtn) copyBtn.textContent = 'COPIED TO CLIPBOARD ✓';
        this.showFloatingBurst('App link copied to clipboard! 📋');
      } catch (_) {
        this.openShareModal();
      }
    }

    openSettings() {
      if (window.oneShotAudio) window.oneShotAudio.playTap();
      if (this.isRoundActive() && this.pausedRemaining === null) {
        if (!Number.isFinite(this.roundDuration)) {
          this.pausedRemaining = Infinity;
        } else {
          const elapsed = (performance.now() - this.roundStartTime) / 1000;
          this.pausedRemaining = Math.max(0.2, this.roundDuration - elapsed);
        }
        this.stopTimer();
      }
      this.syncSettingsModal();
      const modal = document.getElementById('settingsOverlay');
      if (modal) modal.classList.add('show');
    }

    closeSettings() {
      const modal = document.getElementById('settingsOverlay');
      if (modal) modal.classList.remove('show');
      if (this.isRoundActive() && this.pausedRemaining !== null) {
        const rem = this.pausedRemaining;
        this.pausedRemaining = null;
        this.startRoundTimer(this.roundDuration, this.roundPhase, rem);
      }
    }

    quitActiveRun() {
      this.pausedRemaining = null;
      this.stopTimer();
      this.answered = true;
      const modal = document.getElementById('settingsOverlay');
      if (modal) modal.classList.remove('show');
      this.showScreen('home');
    }

    syncSettingsModal() {
      const $ = (id) => document.getElementById(id);
      const s = this.state.settings;
      const isPaused = this.isRoundActive() && this.pausedRemaining !== null;

      if ($('pauseBannerRow')) {
        $('pauseBannerRow').classList.toggle('hidden', !isPaused);
      }
      if ($('settingsTitle')) {
        $('settingsTitle').textContent = isPaused ? 'GAME PAUSED' : 'SETTINGS';
      }
      if ($('settingsEyebrow')) {
        $('settingsEyebrow').textContent = isPaused
          ? `STREAK ${this.streak}🔥 · ${Number.isFinite(this.pausedRemaining) ? this.pausedRemaining.toFixed(1) + 'S LEFT' : '∞ UNLIMITED'}`
          : 'PREFERENCES';
      }
      if ($('settingsDoneBtn')) {
        $('settingsDoneBtn').textContent = isPaused ? '▶ RESUME' : 'DONE';
      }

      if ($('toggleSound')) {
        $('toggleSound').textContent = s.sound ? 'ON' : 'OFF';
        $('toggleSound').classList.toggle('on', !!s.sound);
      }
      if ($('toggleHaptics')) {
        $('toggleHaptics').textContent = s.haptics ? 'ON' : 'OFF';
        $('toggleHaptics').classList.toggle('on', !!s.haptics);
      }
      if ($('toggleMotion')) {
        $('toggleMotion').textContent = s.reducedMotion ? 'ON' : 'OFF';
        $('toggleMotion').classList.toggle('on', !!s.reducedMotion);
      }
      if ($('togglePace')) {
        const pace = s.timerPace || 'progressive';
        $('togglePace').textContent =
          pace === 'unlimited'
            ? 'PRACTICE (0⚡)'
            : pace === 'relaxed'
            ? 'RELAXED'
            : pace === 'blitz'
            ? 'BLITZ'
            : 'PROGRESSIVE';
        $('togglePace').classList.toggle('on', pace !== 'blitz');
        if ($('paceSettingSub')) {
          $('paceSettingSub').textContent =
            pace === 'unlimited'
              ? 'Untimed practice sandbox — 0 sparks earned'
              : pace === 'relaxed'
              ? '15s timer, gentle pace down to 5s'
              : pace === 'blitz'
              ? 'Fast 7s timer down to 3s'
              : '12s timer, speeds up as your streak grows';
        }
      }
      if ($('toggleAdult')) {
        const mode = this.state.adultMode || 'off';
        $('toggleAdult').textContent =
          mode === 'only' ? '18+ ONLY' : mode === 'mix' ? '18+ MIX' : 'OFF';
        $('toggleAdult').classList.toggle('on', mode !== 'off');
      }

      if ($('telemetryBox') && window.oneShotAnalytics) {
        const sum = window.oneShotAnalytics.getSummary();
        const recent = sum.recentEvents
          .slice(0, 6)
          .map((e) => `• ${e.event} (${new Date(e.ts).toLocaleTimeString()})`)
          .join('\n');
        $('telemetryBox').textContent =
          `GAME ACTIVITY & STATS · ${this.packs.length.toLocaleString()} Total Prompts\n` +
          `Session: ${sum.sessionSec}s · Rounds: ${sum.sessionRounds} · Runs: ${sum.totalRuns}\n` +
          `Hits: ${sum.totalCorrect} · Misses: ${sum.totalWrong}\n` +
          `${recent}`;
      }
    }

    toggleSetting(key) {
      if (!this.state.settings || typeof this.state.settings[key] !== 'boolean') return;
      this.state.settings[key] = !this.state.settings[key];
      this.applyCosmeticsAndSettings();
      this.saveState();
      this.syncSettingsModal();
      if (window.oneShotAudio) window.oneShotAudio.playTap();
    }

    cycleTimerPace() {
      if (!this.state.settings) return;
      const cur = this.state.settings.timerPace || 'progressive';
      const next =
        cur === 'progressive' ? 'relaxed' :
        cur === 'relaxed' ? 'blitz' :
        cur === 'blitz' ? 'unlimited' :
        'progressive';
      this.state.settings.timerPace = next;
      this.saveState();
      this.syncSettingsModal();
      this.syncHeaderAndHome();
      if (window.oneShotAudio) window.oneShotAudio.playTap();

      if (next === 'unlimited') {
        this.showFloatingBurst('🎯 Unlimited (Practice — 0 Sparks)');
      } else if (next === 'relaxed') {
        this.showFloatingBurst('🌴 Relaxed Timer (15s ➔ 5.0s)');
      } else if (next === 'blitz') {
        this.showFloatingBurst('⚡ Fast Blitz (7s ➔ 3.0s)');
      } else {
        this.showFloatingBurst('🟢 Progressive Timer (12s ➔ 3.5s)');
      }
    }

    async promptInstall() {
      if (this.deferredInstallPrompt) {
        this.deferredInstallPrompt.prompt();
        await this.deferredInstallPrompt.userChoice.catch(() => {});
        this.deferredInstallPrompt = null;
      } else {
        this.showFloatingBurst('On phone: Tap Share/Menu ➔ Add to Home Screen');
      }
    }

    resetProgress() {
      localStorage.removeItem(SAVE_KEY);
      this.sessionUsedIds.clear();
      this.state = this.getDefaultState();
      this.applyCosmeticsAndSettings();
      this.saveState();
      this.syncSettingsModal();
      this.showFloatingBurst('Data reset successfully');
    }
  }

  const app = new OneShotApp();
  window.app = app;
  window.appVersion = APP_VERSION;

  window.startGame = () => app.startQuickShot();
  window.showScreen = (id) => app.showScreen(id);
  window.choose = (btn) => app.chooseWord(btn);
  window.rewardAd = () => app.triggerRewardedAd('double');
  window.closeAd = () => app.completeAdModal();
  window.unlockPack = (name, isAdult) => app.unlockTopicPack(name, isAdult);
})();

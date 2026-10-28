# ONE SHOT — Fast Mobile Word-Bluff Game

**One tap. One answer. No waiting.**  
Built from the **ONE SHOT Game Design Document v1.0** as a mobile-first, touch-optimized Progressive Web App (PWA) and Capacitor-ready mobile game.

---

## Included Features (GDD v1.0)

- **Continuous Solo Core Loop (`Quick Shot`)**:
  - Correct taps immediately advance your streak and snap in the next round.
  - Wrong taps or timeouts end the run and display the **defensible explanation** alongside the connected word trio.
- **Progressive Warmup & Extended-Run Curve (`12s ➔ 3.5s`)**:
  - **Warmup (`Streak 0–5`, `12s–11s`)**: Calm emerald warmup ring & obvious Tier 1 intruders to build rhythm each run
  - **Cruise (`Streak 6–14`, `10s–9s`)**: Smooth transition into Tier 2 related decoys
  - **Rhythm (`Streak 15–27`, `8s–7s`)**: Brisk athletic flow & Tier 3 cultural connections
  - **Heat & Blitz (`Streak 28–44`, `6s–5s`)**: Blended Tier 3–4 "almost belongs" decoys
  - **Overdrive & Apex (`Streak 45–65+`, `4.5s–3.5s`)**: Blended Tier 4–5 speed & `2×2` thumb layout
  - **Selectable Timer Pace in Settings**: Switch anytime between **Progressive (`12s ➔ 3.5s`, Default)**, **Relaxed Marathon (`15s ➔ 5.0s`)**, and **Classic Blitz (`7s ➔ 3.0s`)**.
- **5,555 Hand-Crafted & Fact-Verified Word Sets Across 15 Packs (Mega Party Pack)**:
  - Stored in [`data/packs.json`](./data/packs.json) (with offline fallback in [`js/packs-data.js`](./js/packs-data.js)):
  - **4,200 Standard Sets** (`420` per pack): *General Knowledge, Gaming, Horror, Movies and TV, Sci-Fi, Food, Cars and Machines, Internet Culture, Family-Friendly, Retro Arcade*
  - **1,355 After Dark (18+) Sets** (`271` per pack): *Nightlife & Booze, Dating & Hookups, Spicy Double Entendres, R-Rated Pop Culture, Messy Adulting*
  - **🎉 Mega Party Mix**: Combines all **5,555** prompts with persistent cross-run deduplication so back-to-back sessions never repeat prompts.
- **Sparks Economy & Cosmetics Shop**:
  - `+10 ⚡` per correct answer, `+50 ⚡` every 5-streak milestone, `+100 ⚡` on a new personal best, and `+30 ⚡` for Daily Target completion.
  - Unlock & equip **Background Themes** (`250 ⚡`), **UI Skins** (`500 ⚡`), **Vault Passes** (`750 ⚡`), **Share Card Badges** (`1,000 ⚡`), and **Ad Removal VIP**.
- **Daily Target & Seeded Duel Links**:
  - Deterministic daily 5-round challenge seeded by date (`YYYY-MM-DD`) with calendar streak tracking.
  - Spoiler-free emoji Share Cards and asynchronous **Duel Links** (`?duel=SEED-STREAK`) so friends can challenge the exact same sequence.
- **Monetization Flows (Non-Blocking)**:
  - **Second Wind Continue**: Revive once per run keeping your full streak intact + a `+3s` warmup breather round via optional rewarded video.
  - **Double Sparks (`2×`)**: Double run currency on the result screen.
  - **3-Round Pack Preview**: Preview any category pack from the shop.
  - **Frequency-Capped Interstitials**: Shown only at natural run boundaries every 4 completed runs (never on first launch).
- **Audio, Haptics, Accessibility & Analytics**:
  - Zero-dependency Web Audio synthesizer (`launch sting`, `2s/1s countdown ticks`, `escalating streak chords`, `5-streak fanfare`, `miss buzzer`) + mobile `navigator.vibrate` haptics.
  - High-contrast non-color-only choice badges (`✓ INTRUDER` / `✕ VALID`) and **Reduced Motion** mode.
  - Tracks all 17 GDD analytics events in [`js/analytics.js`](./js/analytics.js).

---

## Playing on Mobile / App Store Packaging

1. **Instant Local Mobile Server**:
   ```bash
   npm start
   ```
   Open the local network URL on your iPhone (Safari) or Android (Chrome) and tap **Share ➔ Add to Home Screen** (iOS) or **Install App** (Android) for full-screen offline play.
2. **Google Play Store / iOS App Store**:
   - **PWABuilder**: Deploy this folder to Cloudflare Pages, Vercel, or Netlify, then paste the URL into [PWABuilder.com](https://www.pwabuilder.com) to generate signed Android (`.aab` TWA) and iOS (`.ipa` WebView) store packages.
   - **Capacitor**: [`capacitor.config.json`](./capacitor.config.json) is pre-configured (`npx @capacitor/cli init` / `npx cap add ios` / `npx cap add android`).

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Ads = require('../js/ads-policy.js');

const NO_FILL = ['notReady', 'timeout', 'error', 'noAdPreloaded', 'frequencyCapped', 'ignored', 'other', 'invalid'];

function start(type, env) {
  const attempt = Ads.createAttempt(type || 'boost_2x');
  const decision = Ads.beginLoad(attempt, env || { online: true });
  return { attempt, decision };
}

test('no-fill statuses never grant and never request a house ad', () => {
  for (const status of NO_FILL) {
    const { attempt } = start();
    const decision = Ads.onBreakDone(attempt, { breakStatus: status, breakType: 'reward' });
    assert.equal(decision.grant, false, status);
    assert.equal(decision.justGranted, false, status);
    assert.equal(decision.houseAd, false, status);
    assert.equal(decision.showModal, true, status);
    assert.match(decision.subtitle, /no reward was granted|nothing was granted/i, status);
  }
});

test('missing placement info is treated as no reward', () => {
  const { attempt } = start();
  const decision = Ads.onBreakDone(attempt, null);
  assert.equal(decision.grant, false);
  assert.equal(decision.reason, 'other');
  assert.equal(decision.allowRetry, true);
  assert.equal(decision.houseAd, false);
});

test('a completed ad grants once', () => {
  const { attempt } = start('revive');
  const ready = Ads.onBeforeReward(attempt);
  assert.equal(ready.callShow, true);
  assert.equal(ready.grant, false);
  const viewed = Ads.onAdViewed(attempt);
  assert.equal(viewed.justGranted, true);
  assert.equal(viewed.grant, true);
  assert.equal(viewed.type, 'revive');
  assert.equal(viewed.showModal, false);
  const again = Ads.onAdViewed(attempt);
  assert.equal(again.justGranted, false);
  assert.equal(again.grant, true);
  const done = Ads.onBreakDone(attempt, { breakStatus: 'viewed' });
  assert.equal(done.justGranted, false);
  assert.equal(done.grant, true);
});

test('breakStatus viewed grants only after the ad was actually shown', () => {
  const early = start();
  const skipped = Ads.onBreakDone(early.attempt, { breakStatus: 'viewed' });
  assert.equal(skipped.grant, false);
  assert.equal(skipped.justGranted, false);

  const shown = start();
  Ads.onBeforeReward(shown.attempt);
  const decision = Ads.onBreakDone(shown.attempt, { breakStatus: 'viewed' });
  assert.equal(decision.justGranted, true);
});

test('dismissing an ad does not grant', () => {
  const { attempt } = start();
  Ads.onBeforeReward(attempt);
  const decision = Ads.onAdDismissed(attempt);
  assert.equal(decision.grant, false);
  assert.equal(decision.reason, 'dismissed');
  assert.equal(decision.allowRetry, false);
  assert.match(decision.subtitle, /closed before it finished/i);
});

test('a late reward after dismiss does not grant', () => {
  const { attempt } = start();
  Ads.markShowing(attempt);
  Ads.onAdDismissed(attempt);
  const late = Ads.onNativeReward(attempt);
  assert.equal(late.grant, false);
  assert.equal(late.justGranted, false);
});

test('load timeout does not grant, and a late show is refused', () => {
  const { attempt } = start();
  const timed = Ads.onTimeout(attempt);
  assert.equal(timed.reason, 'timeout');
  assert.equal(timed.grant, false);
  assert.equal(timed.allowRetry, true);
  assert.equal(timed.houseAd, false);
  const late = Ads.onBeforeReward(attempt);
  assert.equal(late.callShow, false);
  assert.equal(late.grant, false);
});

test('timeout does not abandon an ad that already started', () => {
  const { attempt } = start();
  Ads.onBeforeReward(attempt);
  const timed = Ads.onTimeout(attempt);
  assert.equal(timed.phase, 'showing');
  assert.equal(timed.grant, false);
  const viewed = Ads.onAdViewed(attempt);
  assert.equal(viewed.justGranted, true);
});

test('offline never grants and does not start a load', () => {
  const attempt = Ads.createAttempt('boost_2x');
  const decision = Ads.beginLoad(attempt, { online: false });
  assert.equal(decision.reason, 'offline');
  assert.equal(decision.grant, false);
  assert.equal(decision.allowRetry, true);
  assert.equal(decision.phase, 'settled');
});

test('unknown reward types never grant', () => {
  const attempt = Ads.createAttempt('double');
  const decision = Ads.beginLoad(attempt, { online: true });
  assert.equal(decision.reason, 'invalid');
  assert.equal(decision.grant, false);
  assert.equal(decision.allowRetry, false);
});

test('native reward grants only after show starts', () => {
  const { attempt } = start();
  const early = Ads.onNativeReward(attempt);
  assert.equal(early.grant, false);
  Ads.markShowing(attempt);
  const decision = Ads.onNativeReward(attempt);
  assert.equal(decision.justGranted, true);
  assert.equal(decision.houseAd, false);
});

test('native load failure and a missing plugin do not grant', () => {
  const failed = start();
  const error = Ads.onNativeFailure(failed.attempt, 'error');
  assert.equal(error.grant, false);
  assert.equal(error.allowRetry, true);
  assert.equal(error.houseAd, false);

  const missing = start();
  const plugin = Ads.onNativeFailure(missing.attempt, 'plugin_missing');
  assert.equal(plugin.grant, false);
  assert.equal(plugin.allowRetry, false);
  assert.match(plugin.subtitle, /no ad service/i);
});

test('native failure after timeout does not upgrade into a grant', () => {
  const { attempt } = start();
  Ads.onTimeout(attempt);
  const late = Ads.onNativeReward(attempt);
  assert.equal(late.justGranted, false);
  assert.equal(late.grant, false);
});

test('cancel while loading does not grant and does not offer the house ad', () => {
  const { attempt } = start();
  const decision = Ads.onCancel(attempt);
  assert.equal(decision.reason, 'cancelled');
  assert.equal(decision.grant, false);
  assert.equal(decision.showModal, false);
  assert.equal(decision.houseAd, false);
});

test('cancel does not interrupt an ad that is already showing', () => {
  const { attempt } = start();
  Ads.markShowing(attempt);
  const decision = Ads.onCancel(attempt);
  assert.equal(decision.phase, 'showing');
  const viewed = Ads.onAdViewed(attempt);
  assert.equal(viewed.justGranted, true);
});

test('shipped web bundle keeps test mode and does not grant from a simulated video', () => {
  const root = path.join(__dirname, '..');
  const app = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

  assert.match(app, /const ADS_TEST_MODE = true/);
  assert.match(html, /data-adbreak-test="on"/);
  assert.match(app, /ca-app-pub-3940256099942544\/5224354917/);
  assert.match(app, /ca-app-pub-2691430114035059\/1849524787/);
  assert.match(app, /const adUnitId = ADS_TEST_MODE/);
  assert.match(app, /justGranted/);
  assert.match(app, /addListener\(FailedToLoadEvent/);
  assert.doesNotMatch(app, /openRewardedAdModal/);
  assert.doesNotMatch(app, /Reward unlocks in/);
  assert.doesNotMatch(app, /4500/);
  const claimStart = app.indexOf('claimActiveReward()');
  const claimEnd = app.indexOf('cancelRewardedAd()', claimStart);
  assert.doesNotMatch(app.slice(claimStart, claimEnd), /grantAdReward/);
  assert.doesNotMatch(html, /SPONSORED VIDEO/);
  assert.doesNotMatch(html, /claimRewardBtn/);
  assert.match(html, /js\/ads-policy\.js/);
  assert.match(app, /OddOneOutAds/);
});

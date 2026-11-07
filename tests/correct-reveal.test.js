const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Reveal = require('../js/correct-reveal.js');

const sample = {
  id: 'gk_01',
  category: 'Primary Colors (Paint)',
  shortCategory: 'Primary Colors',
  validWords: ['Red', 'Blue', 'Yellow', 'Green'],
  intruder: 'Toaster',
  shortTag: 'Kitchen Appliance',
  explanation: 'Toaster is a kitchen appliance, not a primary color.'
};

test('correct reveal uses the puzzle fields and lasts 2.5 seconds', () => {
  const reveal = Reveal.buildCorrectReveal(sample, ['Red', 'Blue', 'Yellow']);
  assert.equal(reveal.durationMs, 2500);
  assert.equal(reveal.skipAfterMs, 450);
  assert.equal(reveal.category, 'PRIMARY COLORS');
  assert.deepEqual(reveal.words, ['Red', 'Blue', 'Yellow']);
  assert.equal(reveal.intruder, 'Toaster');
  assert.equal(reveal.shortTag, 'Kitchen Appliance');
  assert.equal(reveal.explanation, 'Toaster is a kitchen appliance, not a primary color.');
});

test('reveal does not invent an explanation or extra words', () => {
  const reveal = Reveal.buildCorrectReveal({
    category: 'Seasons',
    validWords: ['Spring', 'Summer'],
    intruder: 'Tuesday'
  }, []);
  assert.equal(reveal.explanation, '');
  assert.equal(reveal.shortTag, "Doesn't Fit");
  assert.deepEqual(reveal.words, ['Spring', 'Summer']);
  assert.equal(reveal.words.includes('Toaster'), false);
});

test('the answering tap cannot skip the reveal', () => {
  const start = 1_000;
  const skipAfter = start + Reveal.SKIP_AFTER_MS;
  assert.equal(Reveal.canSkipReveal(start + 100, skipAfter), false);
  assert.equal(Reveal.canSkipReveal(skipAfter, skipAfter), true);
});

test('correct popup is wired for 2.5s and wrong answers stay on the result card', () => {
  const root = path.join(__dirname, '..');
  const app = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(html, /id="relationExplanation"/);
  assert.match(html, /id="relationWords"/);
  assert.match(html, /id="relationIntruderName"/);
  assert.match(html, /NEXT IN 2\.5s/);
  assert.match(html, /js\/correct-reveal\.js/);
  assert.match(app, /buildCorrectReveal\(this\.activeSet/);
  assert.match(app, /relationExplanation/);
  assert.match(app, /this\.stopTimer\(\)/);
  assert.doesNotMatch(app, /480/);
  const wrong = app.slice(app.indexOf('finishRun(completedDaily, isTimeout)'), app.indexOf('grantAdReward(type)'));
  assert.match(wrong, /explainIntruder/);
  assert.match(wrong, /explainReason/);
  assert.doesNotMatch(wrong, /triggerWinFeedback/);
  assert.match(app, /const ADS_TEST_MODE = true/);
});

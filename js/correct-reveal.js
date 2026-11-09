/**
 * Correct-answer connection reveal.
 * Uses only fields already stored on the puzzle. Duration matches the
 * Day-2 relation card: 2.5s, with taps ignored for the first 450ms so the
 * answering tap cannot dismiss it.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OddOneOutReveal = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const DURATION_MS = 2500;
  const SKIP_AFTER_MS = 450;

  function buildCorrectReveal(set, validSample) {
    const source = set || {};
    const sample = Array.isArray(validSample) && validSample.length
      ? validSample.slice(0, 3)
      : (Array.isArray(source.validWords) ? source.validWords.slice(0, 3) : []);
    return {
      durationMs: DURATION_MS,
      skipAfterMs: SKIP_AFTER_MS,
      category: String(source.shortCategory || source.category || '').toUpperCase(),
      words: sample.slice(),
      intruder: source.intruder ? String(source.intruder) : '',
      shortTag: source.shortTag ? String(source.shortTag) : "Doesn't Fit",
      explanation: typeof source.explanation === 'string' ? source.explanation : ''
    };
  }

  function canSkipReveal(now, skipAfter) {
    return Number(now) >= Number(skipAfter);
  }

  return {
    DURATION_MS: DURATION_MS,
    SKIP_AFTER_MS: SKIP_AFTER_MS,
    buildCorrectReveal: buildCorrectReveal,
    canSkipReveal: canSkipReveal
  };
});

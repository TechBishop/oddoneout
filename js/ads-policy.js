/**
 * Rewarded-ad decisions for Odd One Out.
 *
 * A reward is granted only after a verified completion (`viewed` / native
 * reward callback). No-fill, timeout, error, frequency cap, dismiss, offline,
 * and a missing plugin never grant a reward and never ask for a house ad.
 *
 * This file is part of the web bundle. The Capacitor app serves `webDir: www`,
 * so copy `js/ads-policy.js`, `js/app.js`, and `index.html` into that folder
 * and rebuild. Leave ADS_TEST_MODE and data-adbreak-test as they are in a
 * test build; switch both only for an intentional store build.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  if (root) root.OddOneOutAds = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const LOAD_TIMEOUT_MS = 15000;

  const RETRYABLE = new Set([
    'offline',
    'timeout',
    'notReady',
    'error',
    'noAdPreloaded',
    'frequencyCapped',
    'other',
    'ignored'
  ]);

  function isRewardType(type) {
    return type === 'boost_2x' || type === 'revive';
  }

  function createAttempt(type) {
    return {
      type: isRewardType(type) ? type : null,
      phase: 'idle',
      grant: false,
      reason: null,
      allowRetry: false,
      message: ''
    };
  }

  function rewardLabel(type) {
    if (type === 'boost_2x') return '2× sparks on the next run';
    if (type === 'revive') return 'a revive';
    return 'a reward';
  }

  function messageFor(reason, type) {
    switch (reason) {
      case 'loading':
        return 'Looking for an ad… An ad is not guaranteed.';
      case 'offline':
        return 'You are offline. A rewarded ad needs a connection, so no reward was granted.';
      case 'dismissed':
        return 'The ad was closed before it finished. No reward was granted.';
      case 'frequencyCapped':
        return 'No ad was shown because of the ad frequency limit. No reward was granted.';
      case 'notReady':
        return 'The ad service is not ready yet. No reward was granted.';
      case 'timeout':
        return 'The ad request timed out. No reward was granted.';
      case 'noAdPreloaded':
        return 'No ad is available right now. No reward was granted.';
      case 'plugin_missing':
        return 'This build has no ad service. No reward was granted.';
      case 'invalid':
        return 'This reward cannot be offered. Nothing was granted.';
      case 'cancelled':
        return 'Closed before an ad finished. No reward was granted.';
      case 'viewed':
        return '';
      default:
        return 'No ad is available right now. That can be no fill, a load error, or unfinished ad privacy choices. Nothing was granted for ' + rewardLabel(type) + '.';
    }
  }

  function finish(attempt, justGranted, callShow) {
    if (!attempt) {
      return {
        phase: 'settled',
        type: null,
        grant: false,
        justGranted: false,
        reason: 'invalid',
        allowRetry: false,
        message: 'Nothing was granted.',
        title: 'No reward granted',
        subtitle: 'Nothing was granted.',
        showModal: false,
        callShow: false,
        houseAd: false
      };
    }
    const loading = attempt.phase === 'loading';
    const failed = attempt.phase === 'settled' && !attempt.grant && attempt.reason !== 'cancelled';
    let title = 'Rewarded ad';
    let subtitle = attempt.message || '';
    if (loading) {
      title = 'Looking for an ad';
      subtitle = 'If an ad is available, you can watch it for ' + rewardLabel(attempt.type) + '. Nothing is granted until that ad is completed.';
    } else if (failed) {
      title = 'No reward granted';
      subtitle = attempt.message;
    } else if (attempt.grant) {
      title = 'Ad complete';
      subtitle = '';
    }
    return {
      phase: attempt.phase,
      type: attempt.type,
      grant: attempt.grant,
      justGranted: !!justGranted,
      reason: attempt.reason,
      allowRetry: attempt.allowRetry,
      message: attempt.message,
      title: title,
      subtitle: subtitle,
      showModal: loading || failed,
      callShow: !!callShow,
      houseAd: false
    };
  }

  function settle(attempt, spec) {
    if (attempt.phase === 'settled') return finish(attempt, false, false);
    const grant = spec.reason === 'viewed' && spec.grant === true && !!attempt.type;
    attempt.phase = 'settled';
    attempt.reason = spec.reason;
    attempt.grant = grant;
    attempt.allowRetry = !grant && !!spec.allowRetry;
    attempt.message = messageFor(attempt.reason, attempt.type);
    return finish(attempt, grant, false);
  }

  function beginLoad(attempt, env) {
    if (!attempt || attempt.phase === 'settled' || attempt.phase === 'showing') {
      return finish(attempt, false, false);
    }
    if (!attempt.type) {
      return settle(attempt, { reason: 'invalid', grant: false, allowRetry: false });
    }
    if (env && env.online === false) {
      return settle(attempt, { reason: 'offline', grant: false, allowRetry: true });
    }
    attempt.phase = 'loading';
    attempt.reason = 'loading';
    attempt.grant = false;
    attempt.allowRetry = false;
    attempt.message = messageFor('loading', attempt.type);
    return finish(attempt, false, false);
  }

  function onBeforeReward(attempt) {
    if (!attempt || attempt.phase !== 'loading') return finish(attempt, false, false);
    attempt.phase = 'showing';
    attempt.reason = 'showing';
    attempt.message = '';
    return finish(attempt, false, true);
  }

  function markShowing(attempt) {
    return onBeforeReward(attempt);
  }

  function onAdViewed(attempt) {
    if (!attempt || attempt.phase === 'settled') return finish(attempt, false, false);
    if (attempt.phase !== 'showing') return finish(attempt, false, false);
    return settle(attempt, { reason: 'viewed', grant: true, allowRetry: false });
  }

  function onNativeReward(attempt) {
    return onAdViewed(attempt);
  }

  function onAdDismissed(attempt) {
    if (!attempt || attempt.phase === 'settled') return finish(attempt, false, false);
    if (attempt.phase !== 'showing' && attempt.phase !== 'loading') return finish(attempt, false, false);
    return settle(attempt, { reason: 'dismissed', grant: false, allowRetry: false });
  }

  function onBreakDone(attempt, info) {
    if (!attempt || attempt.phase === 'settled') return finish(attempt, false, false);
    const status = info && typeof info.breakStatus === 'string' && info.breakStatus
      ? info.breakStatus
      : 'other';
    if (status === 'viewed') {
      if (attempt.phase !== 'showing') return finish(attempt, false, false);
      return settle(attempt, { reason: 'viewed', grant: true, allowRetry: false });
    }
    if (attempt.phase === 'showing') {
      if (status === 'dismissed') {
        return settle(attempt, { reason: 'dismissed', grant: false, allowRetry: false });
      }
      return settle(attempt, {
        reason: status,
        grant: false,
        allowRetry: RETRYABLE.has(status)
      });
    }
    return settle(attempt, {
      reason: status,
      grant: false,
      allowRetry: RETRYABLE.has(status)
    });
  }

  function onTimeout(attempt) {
    if (!attempt || attempt.phase !== 'loading') return finish(attempt, false, false);
    return settle(attempt, { reason: 'timeout', grant: false, allowRetry: true });
  }

  function onCancel(attempt) {
    if (!attempt || (attempt.phase !== 'loading' && attempt.phase !== 'idle')) {
      return finish(attempt, false, false);
    }
    return settle(attempt, { reason: 'cancelled', grant: false, allowRetry: false });
  }

  function onNativeFailure(attempt, reason) {
    if (!attempt || attempt.phase === 'settled') return finish(attempt, false, false);
    const code = reason || 'error';
    return settle(attempt, {
      reason: code,
      grant: false,
      allowRetry: RETRYABLE.has(code)
    });
  }

  return {
    LOAD_TIMEOUT_MS: LOAD_TIMEOUT_MS,
    createAttempt: createAttempt,
    beginLoad: beginLoad,
    onBeforeReward: onBeforeReward,
    markShowing: markShowing,
    onAdViewed: onAdViewed,
    onNativeReward: onNativeReward,
    onAdDismissed: onAdDismissed,
    onBreakDone: onBreakDone,
    onTimeout: onTimeout,
    onCancel: onCancel,
    onNativeFailure: onNativeFailure
  };
});

/**
 * META GAMES — consent-gated multi-provider advertising adapter.
 * Zero network calls, cookies, identifiers, or provider SDKs by default.
 * Real providers must be deliberately registered with their own lawful
 * consent handling. Does not imply advertising revenue.
 */
const FORMATS = Object.freeze({ pause: 'interstitial', result: 'interstitial', reward: 'rewarded' });
const CONSENTS = new Set(['unknown', 'granted', 'denied']);
export function createAdBridge({ now = () => Date.now(), cooldownMs = 60000,
  providerTimeoutMs = 60000 } = {}) {
  if (typeof now !== 'function' || !Number.isSafeInteger(cooldownMs) || cooldownMs < 0 ||
      !Number.isSafeInteger(providerTimeoutMs) || providerTimeoutMs < 1 || providerTimeoutMs > 300000)
    throw new TypeError('Invalid ad bridge options');
  const providers = new Map();
  const counters = new Map();
  const lastShown = new Map();
  let consent = 'unknown', busy = false, consentVersion = 0, cancelActive = null;
  const revoked = Symbol('consent-revoked');
  const expired = Symbol('provider-timeout');
  function setConsent(value) {
    if (!CONSENTS.has(value)) throw new TypeError('Consent must be unknown, granted, or denied');
    if (value !== consent) consentVersion++;
    consent = value;
    // A revoked consent clears all in-memory advertising data.
    if (consent !== 'granted') {
      counters.clear(); lastShown.clear();
      cancelActive?.();
    }
  }
  function registerProvider(id, adapter) {
    if (typeof id !== 'string' || !/^[a-z][a-z0-9_-]{1,39}$/.test(id))
      throw new TypeError('Invalid provider identifier');
    if (!adapter || typeof adapter.show !== 'function' ||
        !Array.isArray(adapter.formats) || !adapter.formats.length ||
        adapter.formats.some(f => f !== 'interstitial' && f !== 'rewarded'))
      throw new TypeError('Provider needs a show() function and supported formats');
    if (providers.has(id)) throw new Error('Provider already registered');
    providers.set(id, { show: adapter.show, formats: [...adapter.formats] });
    return () => providers.delete(id);
  }
  function increment(id, slot, field) {
    const key = id + ':' + slot;
    const entry = counters.get(key) || { provider: id, slot, requests: 0,
      impressions: 0, completions: 0, errors: 0 };
    entry[field]++;
    counters.set(key, entry);
  }
  async function show(slot) {
    if (!Object.hasOwn(FORMATS, slot)) throw new TypeError('Unknown ad slot');
    if (consent !== 'granted') return { status: 'consent_required', rewarded: false };
    if (busy) return { status: 'busy', rewarded: false };
    const format = FORMATS[slot];
    const timestamp = now();
    if (!Number.isFinite(timestamp)) throw new TypeError('Clock returned nonfinite time');
    if (format === 'interstitial' && lastShown.has(slot) &&
        timestamp - lastShown.get(slot) < cooldownMs)
      return { status: 'frequency_capped', rewarded: false };
    busy = true;
    const version = consentVersion;
    const authorized = () => consent === 'granted' && consentVersion === version;
    const stopped = () => ({ status: 'consent_required', rewarded: false });
    let cancel;
    // Stop waiting even if an SDK never settles. This cannot undo a request
    // already sent to an SDK, but no late response can affect bridge state.
    const withdrawal = new Promise(resolve => {
      cancel = () => resolve(revoked);
      cancelActive = cancel;
    });
    try {
      for (const [id, adapter] of providers) {
        if (!authorized()) return stopped();
        if (!adapter.formats.includes(format)) continue;
        increment(id, slot, 'requests');
        let deadline;
        try {
          const timeout = new Promise(resolve => {
            deadline = setTimeout(() => resolve(expired), providerTimeoutMs);
          });
          // Only nonsensitive slot + format are passed to a provider.
          const response = await Promise.race([adapter.show({ slot, format }), withdrawal, timeout]);
          if (!authorized() || response === revoked) return stopped();
          if (response === expired) {
            // SDK cancellation cannot be guaranteed: do not start an overlapping
            // backup, and never accept a late completion from this request.
            increment(id, slot, 'errors');
            return { status: 'unavailable', rewarded: false };
          }
          if (!response || response.displayed !== true) continue;
          increment(id, slot, 'impressions');
          lastShown.set(slot, timestamp);
          const rewarded = format === 'rewarded' && response.completed === true;
          if (rewarded) increment(id, slot, 'completions');
          return { status: 'displayed', provider: id, rewarded };
        } catch {
          if (!authorized()) return stopped();
          // SDK failure cannot break the game; try another registered provider.
          increment(id, slot, 'errors');
        } finally {
          clearTimeout(deadline);
        }
      }
      return { status: 'unavailable', rewarded: false };
    } finally {
      if (cancelActive === cancel) cancelActive = null;
      busy = false;
    }
  }
  function statistics() {
    return {
      consent, providerCount: providers.size,
      // Aggregate session counters only. No timestamps, device IDs, IPs, or users.
      counters: [...counters.values()].map(x => ({ ...x }))
    };
  }
  return Object.freeze({ setConsent, registerProvider, show, statistics });
}

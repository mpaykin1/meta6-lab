// Fail closed without discarding the last truthful dispatcher snapshot on quota failure.
export function dispatcherQuotaFallback(error, snapshotPresent) {
  return snapshotPresent &&
    /(?:\\b(?:403|429)\\b|rate limit exceeded for installation)/i.test(String(error?.message || error));
}

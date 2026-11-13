// Preserve last truthful queue on GitHub rate limiting, but never conceal permission errors.
export function dispatcherQuotaFallback(error, snapshotPresent) {
  return snapshotPresent &&
    /(?:rate limit exceeded|secondary rate limit|\b429\b)/i.test(String(error?.message || error));
}

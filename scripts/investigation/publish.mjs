// Publish investigation facts only when complete, changed and at most once per hour.
export function publicationFacts(snapshot) {
  const {generated_at, warnings, ...facts} = snapshot;
  return facts;
}

export function publicationDecision(previous, next, now = Date.now()) {
  if ((next.warnings || []).some(note => /API недоступен/.test(note))) {
    return 'retain-incomplete';
  }
  if (previous && now - Date.parse(previous.generated_at) < 3600_000) {
    return 'throttled';
  }
  if (previous &&
      JSON.stringify(publicationFacts(previous)) === JSON.stringify(publicationFacts(next))) {
    return 'unchanged';
  }
  return 'publish';
}

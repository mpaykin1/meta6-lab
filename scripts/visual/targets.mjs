// BEZ PATTERNOV: what to measure for a PR diff. Pure function so it has its own trap (verify-targets.mjs).
// Claude 18.11.2026: the INK shader probe demands a 15% improvement, so it may run only when the shader
// itself changes. Before this, it ran as a fallback for every unrelated PR and turned all of them red.
export const ink = {id: 'ink', url: 'demos/living-watercolor/?reference=1&object=house'};
export const inkProbe = {id: 'ink-shader-probe', url: 'scripts/visual/ink-pattern-probe.html'};
export const blackTrain = {id: 'black-train', url: 'asset-packs/incoming/black-train/index.html'};

export function pickTargets(changed, catalog, exists) {
  const games = catalog.filter(game => changed.some(file => file.startsWith(game.url.replace(/\/$/, ''))));
  if (changed.some(file => file.startsWith('demos/living-watercolor/') ||
      file.startsWith('reference/ink-fallen-guardian/shared/') ||
      file === 'scripts/visual/ink-pattern-probe.html')) games.push(ink, inkProbe);
  const packs = [...new Set(changed.map(file => /^asset-packs\/incoming\/([^/]+)\//.exec(file)?.[1]).filter(Boolean))];
  for (const slug of packs) {
    const url = `asset-packs/incoming/${slug}/index.html`;
    if (slug === 'black-train') games.push(blackTrain);
    else if (exists(url)) games.push({id: 'pack-' + slug, url});
  }
  if (!games.length && changed.some(file => file.startsWith('scripts/visual/') ||
      file === 'rules/01-stil-i-grafika/BEZ_PATTERNOV.md')) return [ink, inkProbe];
  return games;
}

// Trap for OSHIBKI 2026111801: unrelated PRs must not be measured against the INK shader probe.
import assert from 'node:assert/strict';
import {pickTargets} from './targets.mjs';
const catalog = [{id: 'g', url: 'games/g/'}];
const has = () => true;
const ids = files => pickTargets(files, catalog, has).map(g => g.id).sort().join(',');
assert.equal(ids(['asset-packs/incoming/ink-valley/index.html', 'reports/asset-pack-bot/ink-valley.md']), 'pack-ink-valley',
  'asset pack PR is measured by its own page, not by the INK shader probe');
assert.equal(ids(['ZADACHI.md', 'scripts/storozha/core.mjs']), '', 'nothing visual changed: nothing to measure');
assert.equal(ids(['games/g/index.html']), 'g', 'changed game is measured alone');
assert.equal(ids(['reference/ink-fallen-guardian/shared/living-watercolor-3d.js']), 'ink,ink-shader-probe', 'shader change runs the probe');
assert.equal(ids(['scripts/visual/measure-pattern-fft.py']), 'ink,ink-shader-probe', 'checker change still self-tests on INK');
assert.equal(ids(['asset-packs/incoming/black-train/x.js']), 'black-train', 'black-train keeps its own driver');
assert.equal(pickTargets(['asset-packs/incoming/nopage/a.png'], catalog, () => false).length, 0, 'pack without page is skipped');
console.log('VERIFY TARGETS PASS: 7 cases');

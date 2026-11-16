import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const file=new URL('./check-v2-preview-browser.mjs',import.meta.url);
const source=readFileSync(file,'utf8');
assert.ok(source.includes("base+'/reference/ink-fallen-guardian/?ink=robot&palette=color'"),
  'v1 must be the immutable accepted INK guardian, not the generic forest');
assert.ok(!source.includes("base+'/demos/living-watercolor/?ink=robot"),
  'generic forest has no robot: this would silently time out');
assert.ok(source.includes("await page.waitForFunction(()=>window.__INK_FOREST__?.objects?.includes('robot')"),
  'both scenes must actually load the robot');
console.log('INK_V2_BASELINE_GATE_PASS');

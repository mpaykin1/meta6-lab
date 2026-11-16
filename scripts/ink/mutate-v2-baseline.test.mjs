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
const scene=readFileSync(new URL('../../preview/ink-fallen-guardian-v2/ink-forest-v2.js', import.meta.url),'utf8');
assert.ok(scene.includes("from '../../reference/ink-fallen-guardian/ink-world.js'"),
  'v2 must reuse the approved valley without altering the original reference');
assert.ok(scene.includes('robot: createFallenRobotV2'),
  'v2 must animate its own real articulated robot, not silently revert to v1');
console.log('INK_V2_BASELINE_GATE_PASS');

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { jumpTarget } from './veil-jump-target.mjs';

const config = JSON.parse(readFileSync(new URL('../../games/veil-terraces/bot.json', import.meta.url)));
const viewport = { width: 390, height: 844 };
const button = { x: 303, y: 736, width: 63, height: 63 };
jumpTarget(config, viewport, button);
for (const [name, target] of [
  ['original hidden-button fallback', null],
  ['offscreen target', { x: 2, y: 2 }],
  ['deception menu hit instead of jump', { x: .855, y: .05 }]
]) {
  assert.throws(() => jumpTarget({ ...config, jumpButton: target }, viewport, button));
  console.log('CAUGHT broken version:', name);
}
console.log('PASS fixed version: mobile bot jump hits the visible action');

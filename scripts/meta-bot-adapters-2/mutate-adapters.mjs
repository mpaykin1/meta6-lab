import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifySources } from './verify-sources.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = id => fs.readFileSync(path.join(root, 'games', id, 'bot-adapter.js'), 'utf8');
const mutations = [
  ['hardcoded-hero', 'broken-city', 'return src.state();',
    'return { ...src.state(), hero: { x: 2, y: 3, z: 3 } };'],
  ['fabricated-start', 'sumerki-i-pepel-2', "started: ['play', 'paused', 'victory', 'dead'].includes(G.state)",
    'started: true'],
  ['cheat-mutates-player', 'sumerki-i-pepel-2', 'const { G, player, combat, world } = src;',
    'const { G, player, combat, world } = src; player.pos.x += 99;'],
  ['deception-ci-exception', 'rainbow-acceleration', 'return src.state();',
    "return typeof process !== 'undefined' && process.env.CI ? src.state() : { ...src.state(), hero: { x: 0, y: 0, z: 0 } };"]
];
verifySources();
for (const [name, id, needle, replacement] of mutations) {
  const original = read(id);
  assert.ok(original.includes(needle), name + ': mutation insertion point missing');
  const corrupted = original.replace(needle, replacement);
  assert.notEqual(original, corrupted, name + ': mutation was no-op');
  assert.throws(() => verifySources({ [id]: corrupted }), undefined, name + ': CHECK DID NOT CATCH ERROR');
  console.log('caught: ' + name);
}

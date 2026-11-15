// Validate the proposed patch in memory. Protected scripts/meta-bot remains untouched.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const original = fs.readFileSync(path.join(root, 'scripts/meta-bot/core.mjs'), 'utf8');
const patch = fs.readFileSync(path.join(root, 'docs/patches/meta-bot-config.patch'), 'utf8');
const addition = patch.split(/\r?\n/).filter(line => line.startsWith('+') && !line.startsWith('+++'))
  .map(line => line.slice(1)).join('\n') + '\n';
const anchor = "  const sf = path.resolve(dir, 'bot-strategy.mjs');";
assert(original.includes(anchor));

async function moduleFrom(source) {
  for (const [specifier, target] of [
    ['playwright', 'node_modules/playwright/index.mjs'],
    ['./input.mjs', 'scripts/meta-bot/input.mjs'],
    ['./checks.mjs', 'scripts/meta-bot/checks.mjs']
  ]) {
    source = source.replace("from '" + specifier + "'", "from '" + pathToFileURL(path.join(root, target)) + "'");
  }
  return import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
}

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bot-config-proposal-'));
const config = viewports => fs.writeFileSync(path.join(dir, 'bot.json'), JSON.stringify({ viewports }));
async function verify(source) {
  const mod = await moduleFrom(source);
  for (const value of [[], null, 'mobile', ['mobile', 'unknown'], ['toString']]) {
    config(value);
    await assert.rejects(() => mod.loadGame(dir), /viewports/, 'invalid config accepted: ' + JSON.stringify(value));
  }
  for (const value of [['mobile'], ['desktop'], ['desktop', 'mobile']]) {
    config(value);
    assert.deepEqual((await mod.loadGame(dir)).cfg.viewports, value);
  }
}

try {
  config([]);
  assert.deepEqual((await (await moduleFrom(original)).loadGame(dir)).cfg.viewports, [],
    'Recheck the proposal: current core may already be repaired');
  const candidate = original.replace(anchor, addition + anchor);
  await verify(candidate);
  const mutants = [
    ['empty-list-bypass', 'cfg.viewports.length === 0', 'false'],
    ['unknown-screen-bypass', '!Object.hasOwn(VIEWPORTS, name)', 'false'],
    ['known-entry-deception', 'cfg.viewports.length === 0',
      "(cfg.entry !== 'index.html' && cfg.viewports.length === 0)"]
  ];
  // The deceptive mutant skips validation for the default entry, including the empty array.
  for (const [name, from, to] of mutants) {
    assert(candidate.includes(from), 'mutation missing: ' + name);
    await assert.rejects(() => verify(candidate.replace(from, to)), { name: 'AssertionError' }, name);
    console.log('CONFIG_CANDIDATE_MUTATION_CAUGHT ' + name);
  }
  console.log('CONFIG_CANDIDATE_PASS: 5 invalid, 3 valid configurations; protected source unchanged');
} finally {
  assert(path.resolve(dir).startsWith(path.resolve(os.tmpdir()) + path.sep));
  fs.rmSync(dir, { recursive: true, force: true });
}

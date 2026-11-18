// KONTUR runs this on every PR: validate real game data as well as adversarial fixtures.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateBotConfig, checkGameBotConfigs } from './bot-config.mjs';

function contract(validate) {
  for (const value of [{}, { viewports: ['mobile'] }, { viewports: ['desktop', 'mobile'] }]) {
    assert.deepEqual(validate(value), [], 'valid screen configuration rejected');
  }
  for (const value of [null, [], 'mobile', { viewports: [] }, { viewports: null },
    { viewports: 'mobile' }, { viewports: ['mobile', 'unknown'] },
    { viewports: ['toString'] }, { viewports: [['mobile']] }]) {
    assert(validate(value).length > 0, 'invalid screen configuration accepted: ' + JSON.stringify(value));
  }
}

contract(validateBotConfig);
const source = fs.readFileSync(new URL('./bot-config.mjs', import.meta.url), 'utf8');
const mutants = [
  ['empty-list', 'value.viewports.length === 0', 'false'],
  ['unknown-screen', '!SUPPORTED_SCREENS.has(name)', 'false'],
  ['known-first-screen-deception', '  const errors = [];',
    "  if (value.viewports[0] === 'mobile') return [];\n  const errors = [];"]
];
for (const [name, from, to] of mutants) {
  assert(source.includes(from), 'missing mutation: ' + name);
  const mod = await import('data:text/javascript;base64,' + Buffer.from(source.replace(from, to)).toString('base64'));
  assert.throws(() => contract(mod.validateBotConfig), { name: 'AssertionError' }, 'mutation survived: ' + name);
  console.log('BOT_CONFIG_MUTATION_CAUGHT ' + name);
}

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'bot-config-gate-'));
try {
  fs.mkdirSync(path.join(temp, 'games/sample'), { recursive: true });
  const file = path.join(temp, 'games/sample/bot.json');
  fs.writeFileSync(file, '{"viewports":[]}');
  assert.equal(checkGameBotConfigs(temp).errors.length, 1);
  fs.writeFileSync(file, '{broken');
  assert.equal(checkGameBotConfigs(temp).errors.length, 1);
  fs.writeFileSync(file, '{"viewports":["mobile","desktop"]}');
  assert.deepEqual(checkGameBotConfigs(temp).errors, []);
} finally {
  assert(path.resolve(temp).startsWith(path.resolve(os.tmpdir()) + path.sep));
  fs.rmSync(temp, { recursive: true, force: true });
}

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
const result = checkGameBotConfigs(repoRoot);
assert.deepEqual(result.errors, [], 'game bot configuration must pass before accepting a PR');
console.log('BOT_CONFIG_GATE_PASS: ' + result.checked.length + ' real configurations; 3 mutations caught');

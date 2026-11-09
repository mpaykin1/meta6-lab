import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../../games/rainbow-acceleration/bot-strategy.mjs', import.meta.url), 'utf8');
async function check(code, lane, expected) {
  const { playLevel } = await import('data:text/javascript,' + encodeURIComponent(code));
  const stop = new Error('input recorded');
  let actual;
  const ctx = {
    mobile: false,
    state: () => ({ started: true, gameDone: false, levelDone: false, level: 0, lane }),
    key: async key => { actual = key; throw stop; },
    wait: async () => { actual = 'WAIT'; throw stop; }
  };
  await assert.rejects(playLevel(ctx, 0), e => e === stop);
  assert.equal(actual, expected, 'lane ' + lane + ': incorrect corrective input');
}
for (const [lane, key] of [[0.8, 'KeyD'], [-0.8, 'KeyA'], [0, 'WAIT']]) await check(source, lane, key);
for (const [name, bad] of [
  ['reverse-sign', source.replace('lane > .55 ? 1 : lane < -.55 ? -1 : 0', 'lane > .55 ? -1 : lane < -.55 ? 1 : 0')],
  ['reverse-keys', source.replace("correction > 0 ? 'KeyD' : 'KeyA'", "correction > 0 ? 'KeyA' : 'KeyD'")],
  ['always-right', source.replace("correction > 0 ? 'KeyD' : 'KeyA'", "'KeyD'")]
]) {
  assert.notEqual(bad, source, name + ': mutation not applied');
  let caught = false;
  try { for (const [lane, key] of [[0.8, 'KeyD'], [-0.8, 'KeyA']]) await check(bad, lane, key); }
  catch (e) { if (e.code !== 'ERR_ASSERTION') throw e; caught = true; }
  assert.ok(caught, name + ': mutation survived');
  console.log('caught: ' + name);
}
console.log('Rainbow real-input corrective steering: PASS');

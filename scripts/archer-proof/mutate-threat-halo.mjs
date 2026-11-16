import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const code = readFileSync(
  new URL('../../games/archer-in-the-fog/src/goal-target.js', import.meta.url), 'utf8'
);

function inspect(source) {
  assert.match(source, /#archerThreatHalo::after/);
  assert.match(source, /background:radial-gradient\(ellipse 28% 44% at 9% 63%/);
  assert.doesNotMatch(source, /repeating-(?:linear|radial)-gradient/,
    'screen-space danger fog must not repeat geometric stripes');
  assert.match(source, /animation:archerThreatDrift/);
  assert.match(source, /@keyframes archerThreatDrift/);
  assert.match(source, /storm\.hidden = !danger;/,
    'danger atmosphere must only appear during a genuine dangerous phase');
  assert.match(source, /z-index:7;pointer-events:none;/,
    'danger fog must never eat touch or mouse inputs');
  assert.match(source, /#archerThreatHalo,#archerThreatHalo::after\{animation:none!important\}/,
    'reduce motion preference must stay honoured');
}

inspect(code);
for (const [name, before, after] of [
  ['repeat-stripes', 'background:radial-gradient(ellipse 28% 44%',
    'background:repeating-linear-gradient(ellipse 28% 44%'],
  ['static-fog', '@keyframes archerThreatDrift', '@keyframes removedThreatDrift'],
  ['always-visible', 'storm.hidden = !danger;', 'storm.hidden = false;'],
  ['input-block', 'z-index:7;pointer-events:none;', 'z-index:7;pointer-events:auto;'],
  ['reduced-motion', '#archerThreatHalo,#archerThreatHalo::after{animation:none!important}',
    '#archerThreatHalo{animation:none!important}']
]) {
  assert.ok(code.includes(before), 'missing mutation anchor: ' + name);
  let caught = false;
  try { inspect(code.replace(before, after)); } catch { caught = true; }
  assert.ok(caught, 'danger-fog regression escaped: ' + name);
  console.log('MUTATION_CAUGHT ' + name);
}
console.log('PASS: organic danger fog + five negative mutations');

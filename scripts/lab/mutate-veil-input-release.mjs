import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../../games/veil-terraces/index.html', import.meta.url), 'utf8');
function verify(text) {
  const match = text.match(/function releasePlayerInput\(\)\{([\s\S]*?)\n\}/);
  assert(match, 'input release handler must exist');
  assert(text.includes("addEventListener('blur',releasePlayerInput)"), 'blur must release input');
  assert(text.includes('if(document.hidden)releasePlayerInput()'), 'hidden page must release input');
  const state = {
    keys: new Set(['w', ' ']), jumpQueued: true,
    touch: { move: 2, orbit: 3, mx: 1, my: -1, orbitX: 90, orbitY: 45 },
    p: { vx: 5, vz: -5 }, stick: { style: { display: 'block' } }, nub: { style: {} },
    sharedTouch: { release() { state.released = true; } }
  };
  vm.runInNewContext(match[0] + ';releasePlayerInput();', state);
  assert.equal(state.keys.size, 0);
  assert.equal(state.jumpQueued, false);
  assert.equal(state.touch.mx, 0);
  assert.equal(state.touch.my, 0);
  assert.equal(state.touch.move, null);
  assert.equal(state.touch.orbit, null);
  assert.equal(state.p.vx, 0);
  assert.equal(state.p.vz, 0);
  assert.equal(state.stick.style.display, 'none');
  assert.equal(state.released, true);
}
verify(source);
for (const [name, before, after] of [
  ['stuck fallback joystick', 'touch.move=touch.orbit=null;\n touch.mx=touch.my=0;',
    'touch.move=touch.orbit=null;'],
  ['queued jump survives interruption', 'jumpQueued=false;\n touch.move', 'touch.move'],
  ['momentum survives interruption', 'p.vx=p.vz=0;\n sharedTouch', 'sharedTouch'],
  ['deception only clears keyboard', "addEventListener('blur',releasePlayerInput)",
    "addEventListener('blur',()=>keys.clear())"]
]) {
  const broken = source.replace(before, after);
  assert.notEqual(broken, source, 'mutation target missing: ' + name);
  assert.throws(() => verify(broken), undefined, 'escaped mutation: ' + name);
  console.log('CAUGHT broken version:', name);
}
console.log('PASS fixed version: keyboard, touch, queued jump and momentum all released');

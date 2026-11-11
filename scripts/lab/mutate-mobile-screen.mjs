import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { verifyGameHtml } from './verify-mobile-screen.mjs';

const directory = fileURLToPath(new URL('../../', import.meta.url));
const css = readFileSync(directory + 'shared/mobile-screen-lock.css', 'utf8');
const js = readFileSync(directory + 'shared/mobile-screen-lock.js', 'utf8');
const render = (style, script) =>
  '<style id="meta-games-fixed-mobile-screen-css">' + style + '</style>' +
  '<script id="meta-games-fixed-mobile-screen-js">' + script + '</script>';
const accepted = render(css, js);
assert.equal(verifyGameHtml(accepted), true);
const bad = [
  ['no-fixed-body', render(css.replace('position: fixed', 'position: static'), js)],
  ['joystick-drag-scrolls', render(css, js.replace("'touchmove', stopBrowserGesture", "'touchmove', () => {}"))],
  ['deception-marker-only', '<title>meta-games-fixed-mobile-screen-css meta-games-fixed-mobile-screen-js</title>']
];
for (const [label, html] of bad) {
  assert.throws(() => verifyGameHtml(html), undefined, 'Mutation escaped: ' + label);
  console.log('MUTATION CAUGHT ' + label);
}

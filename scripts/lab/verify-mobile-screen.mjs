import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { runInNewContext } from 'node:vm';

const id = 'meta-games-fixed-mobile-screen';

export function verifyGameHtml(html) {
  const css = new RegExp('<style\\s+id="' + id + '-css"[^>]*>([\\s\\S]*?)<\\/style>', 'i').exec(html)?.[1];
  const js = new RegExp('<script\\s+id="' + id + '-js"[^>]*>([\\s\\S]*?)<\\/script>', 'i').exec(html)?.[1];
  assert.ok(css && js, 'Game must load real CSS and JavaScript viewport lock');
  assert.match(css, /body\s*\{[^}]*position:\s*fixed\s*!important/i, 'Body must be fixed');
  assert.match(css, /body\s*\{[^}]*overflow:\s*hidden\s*!important/i, 'Body must not scroll');
  assert.match(css, /canvas[^{}]*\{[^}]*touch-action:\s*none\s*!important/i, 'Canvas must block native pan');
  assert.match(css, /\[data-scrollable\][^{}]*\{[^}]*touch-action:\s*pan-y/i, 'Dialogs must still scroll');

  const handlers = new Map();
  const values = new Map();
  class Element {
    constructor(scrollable = false) { this.scrollable = scrollable; this.parentElement = null; }
    matches(selector) { return this.scrollable && selector.includes('[data-scrollable]'); }
    closest() { return this; }
  }
  const window = {
    matchMedia: () => ({ matches: true }),
    visualViewport: { height: 812, addEventListener() {} },
    innerHeight: 812, scrollX: 0, scrollY: 0,
    addEventListener() {}, scrollTo() {}
  };
  const document = {
    documentElement: { style: { setProperty: (key, val) => values.set(key, val) } },
    addEventListener: (key, fn, options) => handlers.set(key, { fn, options })
  };
  runInNewContext(js, { window, document, Element, getComputedStyle: () => ({ overflowY: 'hidden' }),
    PointerEvent: class {}, Number, String, Math, console }, { timeout: 1000 });
  assert.equal(values.get('--meta-screen-height'), '812px', 'Viewport height must match visible screen');
  const listener = handlers.get('touchmove');
  assert.equal(listener?.options?.passive, false, 'Prevent-default listener must be non-passive');
  let prevented = false;
  listener.fn({ target: new Element(false), cancelable: true, preventDefault: () => { prevented = true; } });
  assert.ok(prevented, 'Touch drag over game must not scroll page');
  prevented = false;
  listener.fn({ target: new Element(true), cancelable: true, preventDefault: () => { prevented = true; } });
  assert.equal(prevented, false, 'Scrolling a dialog must remain possible');
  assert.ok(handlers.has('pointercancel') && handlers.has('touchcancel'), 'Touch cancellation must be handled');
  return true;
}

function verifyPublishedSite(site) {
  const html = readFileSync(join(site, 'meta-games/index.html'), 'utf8');
  const roots = new Set();
  for (const link of html.matchAll(/<a\b[^>]*class=["'][^"']*\bgame\b[^"']*["'][^>]*>/gi)) {
    const href = /href=["']\.\.\/([^"']+)["']/i.exec(link[0])?.[1];
    if (href && /^[a-z0-9\/-]+\/?$/i.test(href)) roots.add(href);
  }
  const folder = join(site, 'games');
  if (existsSync(folder)) {
    for (const item of readdirSync(folder, { withFileTypes: true })) {
      if (item.isDirectory()) roots.add('games/' + item.name + '/');
    }
  }
  assert.ok(roots.size > 0, 'Storefront has no game pages');
  let checked = 0;
  for (const entry of roots) {
    const file = join(site, entry, 'index.html');
    if (!existsSync(file)) continue;
    verifyGameHtml(readFileSync(file, 'utf8'));
    checked++;
  }
  assert.ok(checked >= 1, 'No game pages were actually checked');
  assert.ok(!readFileSync(join(site, 'meta-games/index.html'), 'utf8').includes('id="' + id + '-js"'),
    'Storefront must remain scrollable');
  console.log('META MOBILE LOCK: ' + checked + ' published game screens verified');
}

if (process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  verifyPublishedSite(resolve(process.argv[2] || '_site'));
}

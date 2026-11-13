import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditCleanScreen } from './clean-screen-audit.mjs';

const viewport = { width: 390, height: 844 };
const frame = (timeMs, nodes) => ({ timeMs, nodes });
const menu = () => ({
  id: 'menu', tag: 'button', visible: true, ariaLabel: 'Меню',
  text: '☰', isMenuToggle: true, rect: { x: 352, y: 12 }
});
const hint = () => ({
  id: 'memory', tag: 'div', visible: true, text: 'Воспоминание',
  className: 'fade-6s'
});
const scan = (audit, frames) => audit({ frames, viewport });

export function runSuite(audit = auditCleanScreen) {
  let checks = 0;
  const good = [
    frame(0, [menu(), hint()]),
    frame(3000, [menu(), hint()]),
    frame(7001, [menu()])
  ];
  assert.equal(scan(audit, good).ok, true, 'Real fading messages must remain allowed');
  checks++;

  const persistent = [
    frame(0, [menu(), hint()]),
    frame(3000, [menu(), hint()]),
    frame(7001, [menu(), hint()])
  ];
  assert.ok(scan(audit, persistent).issues.some(x => x.kind === 'persistent-hud-text'),
    'Do not accept a toast merely because CSS says fade-6s');
  checks++;

  const ariaMissing = [
    frame(0, [{ ...menu(), ariaLabel: '' }]),
    frame(7001, [{ ...menu(), ariaLabel: '' }])
  ];
  assert.ok(scan(audit, ariaMissing).issues.some(x => x.kind === 'button-missing-aria'));
  checks++;

  const textButton = [
    frame(0, [{ ...menu(), text: 'Продолжить' }]),
    frame(7001, [{ ...menu(), text: 'Продолжить' }])
  ];
  assert.ok(scan(audit, textButton).issues.some(x => x.kind === 'text-on-button'));
  checks++;

  const wrongCorner = [
    frame(0, [{ ...menu(), rect: { x: 12, y: 600 } }]),
    frame(7001, [{ ...menu(), rect: { x: 12, y: 600 } }])
  ];
  assert.ok(scan(audit, wrongCorner).issues.some(x => x.kind === 'menu-not-top-right'));
  checks++;

  const hiddenMenuBug = [
    frame(0, [menu(), { id: 'menu-label', tag: 'div', text: 'Настройки',
      visible: true, withinMenu: true, menuOpen: false }]),
    frame(7001, [menu()])
  ];
  assert.ok(scan(audit, hiddenMenuBug).issues.some(x => x.kind === 'closed-menu-visible'));
  checks++;

  const openMenu = [
    frame(0, [menu(), { id: 'menu-label', tag: 'div', text: 'Настройки',
      visible: true, withinMenu: true, menuOpen: true }]),
    frame(7001, [menu()])
  ];
  assert.equal(scan(audit, openMenu).ok, true, 'Menu text is permitted while opened');
  checks++;

  const tooShort = [frame(0, [hint()]), frame(5000, [])];
  assert.ok(scan(audit, tooShort).issues.some(x => x.kind === 'transient-not-observed-to-fade'));
  checks++;

  const lateMessage = [
    frame(0, [menu()]),
    frame(3500, [menu(), hint()]),
    frame(7001, [menu()])
  ];
  assert.ok(scan(audit, lateMessage).issues.some(x => x.kind === 'transient-not-observed-to-fade'));
  checks++;

  const lateComplete = [
    ...lateMessage,
    frame(10501, [menu()])
  ];
  assert.equal(scan(audit, lateComplete).ok, true, 'Wait long enough for late messages');
  checks++;

  assert.throws(() => scan(audit, [frame(0, []), frame(0, [])]),
    /timestamps/, 'Duplicate timestamps must be rejected');
  checks++;
  return checks;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log('clean-screen audit: ' + runSuite() + ' assertions passed');
}

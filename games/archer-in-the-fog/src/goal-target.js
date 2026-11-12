/* Archer EXP-1: visual aim beacon, built from the game's existing pulse-hint palette and combat state. */
(() => {
  'use strict';

  const VERSION = '2.0.1';
  const fighting = new Set(['intro', 'fight', 'windup', 'dive', 'tail', 'spin', 'plunge', 'ambush']);
  const dangerous = new Set(['windup', 'dive', 'tail', 'spin', 'plunge', 'ambush']);
  const state = () => window.__A?.G;

  const style = document.createElement('style');
  style.textContent = [
    '#archerTarget {',
    '  position:fixed;top:calc(env(safe-area-inset-top) + 94px);left:50%;',
    '  width:64px;height:64px;border-radius:50%;transform:translateX(-50%);',
    '  z-index:8;pointer-events:none;box-shadow:inset 0 0 0 3px rgba(207,224,255,.78),',
    '    0 0 18px rgba(143,243,255,.25);',
    '  animation:archerAim 1.4s ease-in-out infinite;',
    '}',
    '#archerTarget::after {',
    '  content:"";position:absolute;left:50%;top:50%;',
    '  width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;',
    '  background:#8ff3ff;box-shadow:0 0 18px #8ff3ff;',
    '}',
    '#archerTarget.danger {',
    '  box-shadow:inset 0 0 0 4px rgba(255,107,99,.95),0 0 28px rgba(255,80,65,.8);',
    '  animation:archerWarn .48s ease-in-out infinite;',
    '}',
    '#archerTarget.danger::after {background:#ff665b;box-shadow:0 0 20px #ff665b;}',
    '@keyframes archerAim {0%,100%{scale:.86}50%{scale:1.08}}',
    '@keyframes archerWarn {0%,100%{scale:.88}50%{scale:1.15}}',
    '#archerTarget[hidden],#archerMenuButton[hidden],#archerSettings[hidden]{display:none!important}',
    '#archerMenuButton {',
    '  position:fixed;right:14px;top:calc(env(safe-area-inset-top) + 8px);z-index:12;',
    '  border:1px solid var(--line);background:var(--panel);color:white;',
    '  width:43px;height:43px;font:25px system-ui;cursor:pointer;',
    '}',
    '#archerSettings {',
    '  position:fixed;z-index:13;top:calc(env(safe-area-inset-top) + 60px);right:14px;',
    '  min-width:184px;padding:15px 18px;box-sizing:border-box;color:white;',
    '  background:rgba(12,20,37,.92);border:1px solid var(--line);',
    '  box-shadow:0 10px 34px rgba(0,0,0,.48);',
    '  font:13px system-ui;letter-spacing:.03em;',
    '}',
    '#archerSettings strong{font:16px "Russo One",system-ui;display:block;margin-bottom:8px}',
    '#archerSettings button{display:block;margin-top:14px;background:none;color:white;',
    '  border:1px solid var(--line);padding:7px 14px;cursor:pointer}',
  ].join('\n');
  document.head.appendChild(style);

  const target = document.createElement('div');
  target.id = 'archerTarget';
  target.setAttribute('aria-hidden', 'true');
  target.hidden = true;
  document.body.appendChild(target);

  const menuButton = document.createElement('button');
  menuButton.id = 'archerMenuButton';
  menuButton.setAttribute('aria-label', 'Menu');
  menuButton.textContent = '☰';
  menuButton.hidden = true;
  document.body.appendChild(menuButton);

  const panel = document.createElement('div');
  panel.id = 'archerSettings';
  panel.hidden = true;
  const heading = document.createElement('strong');
  heading.textContent = 'ARCHER IN THE FOG';
  const version = document.createElement('span');
  version.id = 'archerVersion';
  version.textContent = 'v' + VERSION;
  const close = document.createElement('button');
  close.textContent = '✕';
  close.setAttribute('aria-label', 'Close menu');
  panel.append(heading, version, close);
  document.body.appendChild(panel);

  let wasPaused = false;
  let announced = false;
  function setMenu(open) {
    const g = state();
    if (!g || g.mode !== 'play') return;
    if (open) wasPaused = !!g.paused;
    g.paused = open ? true : wasPaused;
    panel.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
  }
  menuButton.addEventListener('click', () => setMenu(panel.hidden));
  close.addEventListener('click', () => setMenu(false));

  function combatActive(g) {
    return !!g && g.mode === 'play' && fighting.has(g.phase) && !g.paused;
  }
  function attackNear(g) {
    return !!g && (dangerous.has(g.phase)
      || (g.rageMax > 0 && g.rage / g.rageMax > 0.75));
  }
  const botReadOnly = Object.freeze({
    state() {
      const g = state();
      return Object.freeze({
        version: VERSION,
        gameMode: g?.mode || 'loading',
        phase: g?.phase || 'unknown',
        goalVisible: combatActive(g) && !target.hidden,
        danger: combatActive(g) && attackNear(g) && target.classList.contains('danger')
      });
    }
  });
  Object.defineProperty(window, '__metaBot', { value: botReadOnly, writable: false, configurable: false });

  let lastActive = null;
  let lastDanger = null;
  let lastMenu = null;
  function tick() {
    const g = state();
    const active = combatActive(g);
    const danger = active && attackNear(g);
    const inGame = !!g && g.mode === 'play';
    // Avoid redundant DOM writes and layout invalidations every animation frame.
    if (active !== lastActive) { target.hidden = !active; lastActive = active; }
    if (danger !== lastDanger) { target.classList.toggle('danger', danger); lastDanger = danger; }
    if (inGame !== lastMenu) { menuButton.hidden = !inGame; lastMenu = inGame; }
    if (!inGame) {
      panel.hidden = true;
      announced = false;
    }
    if (active && !announced && typeof window.bridge?.analytics?.send === 'function') {
      try {
        window.bridge.analytics.send('archer_goal_beacon', { game_version: VERSION });
        announced = true;
      } catch (error) {
        console.warn('Archer analytics unavailable', error);
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* META GAMES: lock the browser viewport, never move the 3D camera or character. */
(() => {
  'use strict';
  if (window.__META_GAME_SCREEN_LOCK__) return;
  window.__META_GAME_SCREEN_LOCK__ = true;

  const mobile = window.matchMedia('(hover: none) and (pointer: coarse)');
  if (!mobile.matches) return;

  const scrolling = [
    '[data-scrollable]', '[data-allow-touch-scroll]',
    'dialog', '[role="dialog"]', '.scrollable', '.scroll-area',
    '.modal-body', '.story-text', '.quest-text',
    'textarea', 'select', '[contenteditable="true"]'
  ].join(',');
  const control = [
    'canvas', '#stick', '#joystick', '#joy', '#touch',
    '.joystick', '.joy', '.stick', '[data-joystick]',
    '[data-game-controls]', '[data-game-touch]'
  ].join(',');
  const active = new Map();

  function scrollableAncestor(target) {
    let element = target instanceof Element ? target : target?.parentElement;
    while (element && element !== document.documentElement) {
      if (element.matches(scrolling)) return true;
      const style = getComputedStyle(element);
      if (/auto|scroll/.test(style.overflowY) &&
          element.scrollHeight > element.clientHeight + 2) return true;
      element = element.parentElement;
    }
    return false;
  }

  function stopBrowserGesture(event) {
    if (event.cancelable && !scrollableAncestor(event.target)) event.preventDefault();
  }

  document.addEventListener('touchmove', stopBrowserGesture, { capture: true, passive: false });
  document.addEventListener('gesturestart', stopBrowserGesture, { capture: true, passive: false });
  document.addEventListener('gesturechange', stopBrowserGesture, { capture: true, passive: false });
  document.addEventListener('dragstart', (event) => {
    if (event.target instanceof Element && event.target.closest(control)) event.preventDefault();
  }, true);

  function pinViewport() {
    const viewport = window.visualViewport;
    const height = viewport ? viewport.height : window.innerHeight;
    if (Number.isFinite(height) && height > 0) {
      document.documentElement.style.setProperty('--meta-screen-height', String(Math.ceil(height)) + 'px');
    }
    if (window.scrollX !== 0 || window.scrollY !== 0) window.scrollTo(0, 0);
  }

  window.addEventListener('resize', pinViewport, { passive: true });
  window.visualViewport?.addEventListener('resize', pinViewport, { passive: true });
  window.addEventListener('orientationchange', pinViewport, { passive: true });
  window.addEventListener('scroll', () => {
    if (window.scrollX !== 0 || window.scrollY !== 0) window.scrollTo(0, 0);
  }, { passive: true });
  pinViewport();

  function dropTouch(event) {
    if (event.pointerType === 'touch') active.delete(event.pointerId);
  }
  document.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'touch' && event.target instanceof Element &&
        event.target.closest(control)) active.set(event.pointerId, event.target);
  }, true);
  document.addEventListener('pointerup', dropTouch, true);
  document.addEventListener('pointercancel', dropTouch, true);
  document.addEventListener('lostpointercapture', dropTouch, true);
  document.addEventListener('touchcancel', () => active.clear(), { passive: true });

  function releaseControls() {
    const pointers = [...active.entries()];
    active.clear();
    if (typeof PointerEvent !== 'function') return;
    for (const [pointerId, element] of pointers) {
      if (!element.isConnected) continue;
      element.dispatchEvent(new PointerEvent('pointercancel', {
        pointerId, pointerType: 'touch', bubbles: true, cancelable: false
      }));
    }
  }
  window.addEventListener('blur', releaseControls);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) releaseControls();
  });
})();

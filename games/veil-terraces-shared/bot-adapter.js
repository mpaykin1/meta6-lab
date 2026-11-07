// Veil Terraces already exposes a strict, read-only data snapshot inside its game runtime.
// This adapter checks its contract without replacing the original getter or writing gameplay state.
(() => {
  'use strict';
  const descriptor = Object.getOwnPropertyDescriptor(window, '__META_BOT__');
  if (!descriptor || typeof descriptor.get !== 'function' || descriptor.set ||
      descriptor.configurable || descriptor.writable) {
    throw new Error('Veil Terraces: read-only META BOT getter is missing');
  }
  const state = window.__META_BOT__;
  if (!Object.isFrozen(state) || state.totalLevels !== 6 || !state.goal ||
      !state.player || typeof state.completed !== 'boolean') {
    throw new Error('Veil Terraces: META BOT snapshot contract changed');
  }
})();

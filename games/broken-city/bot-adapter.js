// Observes the real game engine. This file never writes gameplay state.
(() => {
  'use strict';
  const bot = Object.freeze({
    version: 1,
    info() {
      const src = window.__BC_BOT_SOURCE__;
      if (!src) throw new Error('META BOT: game engine is not ready');
      return src.info();
    },
    state() {
      const src = window.__BC_BOT_SOURCE__;
      if (!src) throw new Error('META BOT: game engine is not ready');
      return src.state();
    }
  });
  Object.defineProperty(window, '__META_BOT__', { value: bot, writable: false, configurable: false });
})();

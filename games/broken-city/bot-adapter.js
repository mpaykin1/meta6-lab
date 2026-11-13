// Read-only bot API; publish it only after the actual game engine is initialized.
(() => {
  'use strict';

  function install() {
    const source = window.__BC_BOT_SOURCE__;
    if (!source) {
      requestAnimationFrame(install);
      return;
    }
    if (typeof source.info !== 'function' || typeof source.state !== 'function') {
      throw new Error('META BOT: invalid broken-city source');
    }

    const bot = Object.freeze({
      version: 1,
      info: () => source.info(),
      state: () => source.state()
    });
    Object.defineProperty(window, '__META_BOT__', {
      value: bot, enumerable: true, writable: false, configurable: false
    });
  }

  install();
})();

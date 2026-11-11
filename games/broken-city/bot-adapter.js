// Read-only observation is published only when the actual game module is ready.
(() => {
  'use strict';

  function expose() {
    const source = window.__BC_BOT_SOURCE__;
    if (!source || typeof source.info !== 'function' || typeof source.state !== 'function') {
      return false;
    }

    const bot = Object.freeze({
      version: 1,
      info() { return window.__BC_BOT_SOURCE__.info(); },
      state() { return window.__BC_BOT_SOURCE__.state(); }
    });
    Object.defineProperty(window, '__META_BOT__', {
      value: bot,
      writable: false,
      configurable: false
    });
    return true;
  }

  // Classic scripts execute during parsing, before the preceding type=module
  // engine initializes. Do not advertise a ready bot with missing source.
  if (!expose()) {
    const interval = setInterval(() => {
      if (expose()) clearInterval(interval);
    }, 100);
  }
})();

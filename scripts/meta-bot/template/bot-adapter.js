// ШАБЛОН ручки бота. Скопировать в games/<игра>/bot-adapter.js и подключить в index.html
// ПОСЛЕ основного скрипта игры: <script src="bot-adapter.js"></script>
// Контракт: scripts/meta-bot/CONTRACT.md. Ручка ТОЛЬКО ЧИТАЕТ состояние игры.
// ChatGPT: замени каждое TODO на чтение настоящих переменных игры. Ничего в игре не меняй отсюда.
(function () {
  'use strict';
  // TODO: найди объект состояния игры (например window.__isle.G или переменную модуля, выставленную в window).
  function G() { return window.GAME_STATE_TODO; }
  const bot = {
    version: 1,
    info() {
      return { name: 'TODO имя игры', levels: 0 /* TODO: сколько уровней в одном круге */ };
    },
    state() {
      const g = G() || {};
      return {
        started: false,      // TODO
        level: 0,            // TODO
        levelDone: false,    // TODO
        gameDone: false,     // TODO
        alive: true,         // TODO
        hero: { x: 0, y: 0 },// TODO
        goal: null,          // TODO
        enemies: 0,          // TODO
        weapons: 0,          // TODO
        layoutHash: '',      // TODO: отпечаток раскладки уровня, например позиции препятствий через join(',')
        menuOpen: false      // TODO
      };
    }
  };
  Object.freeze(bot);
  Object.defineProperty(window, '__META_BOT__', { value: bot, writable: false, configurable: false });
})();

(function () {
  'use strict';
  let booted = false;
  function install() {
    const game = window.__isle;
    if (booted || !game || game.G.state === 'loading') return;
    booted = true;
    const menu = document.getElementById('v5Menu');
    const dock = document.getElementById('v5Dock');
    const progress = document.createElement('p');
    progress.setAttribute('aria-label', 'Current island progress');
    const collection = document.createElement('section');
    collection.setAttribute('aria-label', 'Collected weapons and their benefits');
    const refreshInformation = () => {
      progress.textContent = `${game.G.collected}/${game.G.total} coins · health ${game.player.hp}/6 · defeated ${game.G.kills}`;
      collection.replaceChildren();
      const title = document.createElement('h3'); title.textContent = 'Collected equipment'; collection.appendChild(title);
      for (const id of game.combat.arsenal) {
        const weapon = game.WEAPONS[id], item = document.createElement('article');
        const name = document.createElement('strong'); name.textContent = weapon.name;
        const stats = document.createElement('p'); stats.textContent = weapon.stat;
        const benefit = document.createElement('p'); benefit.textContent = weapon.desc;
        item.append(name, stats, benefit); collection.appendChild(item);
      }
    };
    if (menu) menu.querySelector('.v5-controls').append(progress, collection);
    // Opening settings must not leave the player exposed to enemies.
    let menuPaused = false;
    if (menu) {
      menu.addEventListener('toggle', () => {
        if (menu.open) refreshInformation();
        if (menu.open && game.G.state === 'play') {
          game.pause(true); menuPaused = true;
          document.getElementById('scrPause').hidden = true;
        } else if (!menu.open && menuPaused) {
          if (game.G.state === 'paused') game.pause(false);
          menuPaused = false;
        }
      });
      window.addEventListener('keydown', event => {
        if (event.code !== 'KeyP' || event.repeat || /INPUT|SELECT|TEXTAREA/.test(event.target.tagName)) return;
        event.preventDefault(); event.stopImmediatePropagation();
        menu.open = !menu.open;
      }, true);
    }
    // Browsers require a genuine gesture before the original sound engine can resume.
    function wakeSound() { game.SFX.init(); }
    window.addEventListener('pointerdown', wakeSound, { once: true, capture: true });
    window.addEventListener('keydown', wakeSound, { once: true, capture: true });
    // Retain the complete construction catalogue, but show its text only in the menu.
    if (menu && dock) menu.querySelector('.v5-controls').appendChild(dock);
    if (menu && dock) dock.addEventListener('click', event => {
      if (event.target.closest('button')) menu.open = false;
    });
    const updateObservers = window.__observerV7Frame;
    if (updateObservers) window.__observerV7Frame = dt => {
      if (game.G.state !== 'paused') updateObservers(dt);
    };
    const summary = menu?.querySelector('summary');
    if (summary) { summary.setAttribute('role', 'button'); summary.setAttribute('aria-label', 'Game menu'); }
    for (const button of document.querySelectorAll('#v5Dock button'))
      button.setAttribute('aria-label', button.title || button.textContent.trim());
    document.getElementById('v5OriginalHud')?.setAttribute('aria-label', 'Show original information inside menu');
    if (menu) {
      const original = document.createElement('button');
      original.type = 'button'; original.textContent = 'Original island (1337)';
      original.addEventListener('click', () => { game.rebuild(1337); menu.open = false; });
      menu.querySelector('.v5-controls').appendChild(original);
    }

    // Ordinary first-run gameplay; the bot itself never invokes game methods.
    if (game.G.state === 'title') game.startGame();
  }
  window.addEventListener('observer-v7-ready', install);
  let tries = 0;
  function probe() {
    install();
    if (!booted && ++tries < 600) requestAnimationFrame(probe);
  }
  requestAnimationFrame(probe);
})();

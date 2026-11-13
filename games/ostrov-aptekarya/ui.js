import {SPEAKERS} from './dialogue.js';

// Интерфейс по правилу ЧИСТЫЙ ЭКРАН: на экране графика, иконки и реплики героев (просьба владельца —
// лор через диалоги). Всё остальное — в меню ☰ справа сверху.
const CSS = `
html,body{margin:0;height:100%;overflow:hidden;background:#efece2;touch-action:none;-webkit-user-select:none;user-select:none;font-family:Georgia,serif}
canvas{position:fixed;inset:0;display:block;width:100%;height:100%;touch-action:none}
#ap{position:fixed;inset:0;z-index:5;pointer-events:none}
#ap button{pointer-events:auto;cursor:pointer;-webkit-tap-highlight-color:transparent}
.ap-round{width:48px;height:48px;border-radius:50%;border:1px solid #2f3f3a2e;background:#f6f1e6d0;color:#33433d;backdrop-filter:blur(10px);box-shadow:0 4px 18px #2a35300f;display:grid;place-items:center;padding:0}
#ap-menu-btn{position:absolute;right:max(16px,env(safe-area-inset-right));top:max(16px,env(safe-area-inset-top))}
#ap-pips{position:absolute;left:max(16px,env(safe-area-inset-left));top:max(22px,env(safe-area-inset-top));display:flex;gap:7px;opacity:0;transition:opacity 1.2s}
#ap-pips.on{opacity:1}
.pip{width:15px;height:15px;border:1.5px solid #3c4b44;opacity:.55;transition:all .6s cubic-bezier(.2,.8,.2,1);box-sizing:border-box}
.pip.leaf{border-radius:0 70% 0 70%;transform:rotate(-8deg)}.pip.shroom{border-radius:60% 60% 25% 25%}.pip.drop{border-radius:50% 0 50% 50%;transform:rotate(-45deg)}
.pip.full{opacity:1;transform:scale(1.15) rotate(-8deg)}.pip.leaf.full{background:#9aac5c}.pip.shroom.full{background:#6f8fb5}.pip.drop.full{background:#7fb9c4}
.pip.off{display:none}
#ap-act{position:absolute;right:max(26px,env(safe-area-inset-right));bottom:max(30px,env(safe-area-inset-bottom));width:76px;height:76px;opacity:0;transform:scale(.6);transition:opacity .8s,transform .8s cubic-bezier(.2,1.4,.3,1)}
#ap-act.on{opacity:1;transform:scale(1)}#ap-act.on.empty{filter:grayscale(1);opacity:.45}
#ap-act.urge{animation:urge .35s infinite alternate}@keyframes urge{to{transform:scale(1.13);box-shadow:0 0 0 6px #6f8fb544}}
#ap-act svg{width:40px;height:40px}
#ap-charges{position:absolute;left:50%;bottom:7px;transform:translateX(-50%);display:flex;gap:4px}
#ap-charges i{width:6px;height:6px;border-radius:50%;background:#6f8fb5}
#ap-say{position:absolute;left:50%;top:max(74px,calc(env(safe-area-inset-top) + 60px));transform:translate(-50%,-8px);width:min(560px,82vw);opacity:0;transition:opacity .45s,transform .45s;padding:12px 16px 13px;border-radius:14px;background:#f7f2e7ea;border:1px solid #33433d1c;box-shadow:0 10px 36px #2a35301a;backdrop-filter:blur(12px);pointer-events:auto;box-sizing:border-box}
#ap-say.on{opacity:1;transform:translate(-50%,0)}
#ap-say b{display:block;font:600 11px system-ui;letter-spacing:.12em;text-transform:uppercase;margin-bottom:4px}
#ap-say p{margin:0;font:17px/1.42 Georgia,serif;color:#2c3833}
#ap-say.machine{background:#1b1f20e8;border-color:#c4532c55}#ap-say.machine p{font:600 15px/1.45 ui-monospace,Menlo,monospace;color:#f2a27a;letter-spacing:.06em;animation:jit .09s infinite}
@keyframes jit{50%{transform:translate(1px,-1px);text-shadow:-2px 0 #39c3d088,2px 0 #ff3c0088}}
#ap-stick{position:absolute;width:110px;height:110px;margin:-55px 0 0 -55px;border-radius:50%;border:1.5px solid #3c4b4433;background:#f6f1e630;display:none}
#ap-stick i{position:absolute;left:35px;top:35px;width:40px;height:40px;border-radius:50%;background:#f6f1e6c0;border:1px solid #3c4b4444}
.ap-card{position:absolute;inset:0;display:grid;place-items:center;background:#efece2c4;backdrop-filter:blur(6px);pointer-events:auto;opacity:1;transition:opacity 1s}
.ap-card[hidden]{display:none}
.ap-card>div{width:min(520px,86vw);text-align:center;color:#2c3833}
.ap-card h1{font:italic 400 clamp(28px,6vw,44px)/1.15 Georgia,serif;margin:0 0 10px;letter-spacing:.02em}
.ap-card h2{font:600 12px system-ui;letter-spacing:.24em;text-transform:uppercase;color:#6b7a70;margin:0 0 28px}
.ap-card p{font:16px/1.6 Georgia,serif;color:#46544d;margin:0 0 26px}
.ap-big{width:84px;height:84px;border-radius:50%;border:1.5px solid #2c3833;background:transparent;color:#2c3833;display:inline-grid;place-items:center}
.ap-big svg{width:34px;height:34px}
#ap-menu{position:absolute;right:max(16px,env(safe-area-inset-right));top:max(74px,calc(env(safe-area-inset-top) + 60px));width:min(320px,86vw);max-height:calc(100dvh - 110px);overflow:auto;padding:18px;box-sizing:border-box;border-radius:14px;background:#f7f2e7f4;border:1px solid #33433d1c;box-shadow:0 14px 50px #2a35301f;pointer-events:auto;color:#2c3833}
#ap-menu[hidden]{display:none}
#ap-menu h3{font:600 11px system-ui;letter-spacing:.18em;text-transform:uppercase;color:#6b7a70;margin:16px 0 8px}
#ap-menu .row{display:flex;gap:8px;flex-wrap:wrap}
#ap-menu .row button{flex:1;border:1px solid #33433d2a;background:transparent;border-radius:9px;padding:10px;font:13px system-ui;color:#2c3833}
#ap-menu small{display:block;font:12px/1.6 system-ui;color:#5d6b63}
#ap-journal{font:13px/1.5 Georgia,serif;color:#3b4842;max-height:38vh;overflow:auto}
#ap-journal div{margin:0 0 6px}#ap-journal b{font:600 10px system-ui;letter-spacing:.1em;text-transform:uppercase;margin-right:6px}
`;
const ICON = {
  menu: '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z" fill="currentColor"/></svg>',
  again: '<svg viewBox="0 0 24 24"><path d="M5 12a7 7 0 1 0 2-5M5 4v4h4" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>',
  door: '<svg viewBox="0 0 40 40"><path d="M10 6h19v28H10z" fill="#c0ac87" stroke="#33433d" stroke-width="1.5"/><path d="M12 8l15-2v28l-15-2z" fill="#8a967d" stroke="#33433d" stroke-width="1.5"/><circle cx="23" cy="20" r="1.6" fill="#e9d9aa"/></svg>',
  dust: '<svg viewBox="0 0 40 40"><path d="M14 30c0-8 3-12 6-12s6 4 6 12z" fill="#e8e1cf" stroke="#33433d" stroke-width="1.4"/><path d="M8 18c0-6 6-10 12-10s12 4 12 10z" fill="#6f8fb5" stroke="#33433d" stroke-width="1.4"/><circle cx="13" cy="9" r="1.6" fill="#6f8fb5"/><circle cx="27" cy="6" r="1.3" fill="#6f8fb5"/><circle cx="21" cy="3.5" r="1" fill="#6f8fb5"/></svg>'
};

export function createUI(handlers) {
  const style = document.createElement('style'); style.textContent = CSS; document.head.append(style);
  const root = document.createElement('div'); root.id = 'ap';
  root.innerHTML = `
    <div id="ap-pips"><i class="pip leaf"></i><i class="pip leaf"></i><i class="pip leaf"></i><i class="pip shroom"></i><i class="pip shroom"></i><i class="pip drop"></i></div>
    <button id="ap-menu-btn" class="ap-round" aria-label="Меню">${ICON.menu}</button>
    <button id="ap-act" class="ap-round" aria-label="Пыльца сонника">${ICON.dust}<span id="ap-charges"></span></button>
    <div id="ap-say" aria-live="polite"><b></b><p></p></div>
    <div id="ap-stick"><i></i></div>
    <section id="ap-menu" hidden>
      <div class="row"><button data-m="resume">Продолжить</button><button data-m="sound">Звук: вкл</button></div>
      <div class="row" style="margin-top:8px"><button data-m="restart">Начать заново</button></div>
      <h3>Управление</h3>
      <small>Телефон: левая половина экрана — идти (джойстик появляется под пальцем), правая — повернуть камеру. Кнопка с грибом — пыльца сонника.<br>ПК: WASD / стрелки — идти, мышь — камера, колёсико — приблизить, Пробел — пыльца. Если Ива схватила — быстро дёргай влево‑вправо. Глава II: возле архивной двери нажми E / Пробел или иконку створки, чтобы закрыть её.</small>
      <h3>Что слышали</h3><div id="ap-journal"></div>
      <h3>Об игре</h3><small>Остров последнего аптекаря · Главы I «Тихолист» и II «Архив станции». Мир — эталон INK «Павший великан» без изменений.</small>
    </section>
    <section id="ap-title" class="ap-card"><div><h2>Глава I · Тихолист</h2><h1>Остров последнего аптекаря</h1><p>Люди разучились лечить и меняют больное на железное. На острове в тумане живёт последний, кто помнит травы. Сегодня с ним в лес идёт Ива.</p><button class="ap-big" data-m="start" aria-label="Начать">${ICON.play}</button></div></section>
    <section id="ap-end" class="ap-card" hidden><div><h2>Конец демо · Глава I</h2><h1>«Вылечи того, кто лежит в лесу»</h1><p>Великан не был создан для войны. Что спрятано под ним — узнаем в главе II «Архив станции».</p><button class="ap-big" data-m="restart" aria-label="Ещё раз">${ICON.again}</button><button id="ap-next" class="ap-big" data-m="next" aria-label="Следующая глава" style="margin-left:12px">${ICON.play}</button></div></section>`;
  document.body.append(root);
  const $ = s => root.querySelector(s);
  const say = $('#ap-say'), menu = $('#ap-menu'), act = $('#ap-act'), pips = [...root.querySelectorAll('.pip')];
  root.addEventListener('click', e => {
    let m = e.target.closest('[data-m]')?.dataset.m;
    if (!m && e.target.closest('#ap-title')) m = 'start';   // стартовая карточка нажимается целиком
    if (!m) return;
    if (m === 'start') { $('#ap-title').hidden = true; handlers.onStart(); }
    if (m === 'resume') toggleMenu(false);
    if (m === 'sound') { const on = handlers.onSound(); e.target.textContent = 'Звук: ' + (on ? 'вкл' : 'выкл'); }
    if (m === 'restart') { toggleMenu(false); $('#ap-end').hidden = true; handlers.onRestart(); }
    if (m === 'next') { $('#ap-end').hidden = true; handlers.onNext(); }
  });
  function toggleMenu(open = menu.hidden) { menu.hidden = !open; handlers.onPause(open); }
  $('#ap-menu-btn').onclick = () => toggleMenu();
  say.addEventListener('pointerdown', e => { e.stopPropagation(); handlers.onSkip(); });
  act.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); handlers.onAction(); });

  // Ввод: плавающий джойстик (левая половина), камера (правая половина / мышь), клавиатура.
  const keys = new Set(), pulse = new Set(), stick = {x: 0, y: 0, id: null, ox: 0, oy: 0, fresh: false, release: false}, look = {id: null, x: 0, y: 0, dx: 0, dy: 0};
  const stickEl = $('#ap-stick'), knob = stickEl.firstElementChild;
  let zoom = 0;
  addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
    if ((k === ' ' || k === 'e') && !keys.has(k)) handlers.onAction();
    if (k === 'escape') toggleMenu();
    keys.add(k); pulse.add(k);
  });
  addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
  const reset = () => { keys.clear(); stick.x = stick.y = 0; stick.id = look.id = null; stickEl.style.display = 'none'; };
  addEventListener('blur', reset); document.addEventListener('visibilitychange', () => document.hidden && reset());
  function bind(canvas) {
    canvas.addEventListener('pointerdown', e => {
      canvas.setPointerCapture(e.pointerId);
      if (e.pointerType !== 'mouse' && e.clientX < innerWidth * .5 && stick.id === null) {
        stick.id = e.pointerId; stick.ox = e.clientX; stick.oy = e.clientY;
        stickEl.style.display = 'block'; stickEl.style.left = e.clientX + 'px'; stickEl.style.top = e.clientY + 'px';
      } else if (look.id === null) { look.id = e.pointerId; look.x = e.clientX; look.y = e.clientY; }
    });
    canvas.addEventListener('pointermove', e => {
      if (e.pointerId === stick.id) {
        const dx = e.clientX - stick.ox, dy = e.clientY - stick.oy, len = Math.max(40, Math.hypot(dx, dy));
        stick.x = dx / len; stick.y = dy / len; stick.fresh = true; knob.style.transform = `translate(${stick.x * 32}px,${stick.y * 32}px)`;
      } else if (e.pointerId === look.id) { look.dx += e.clientX - look.x; look.dy += e.clientY - look.y; look.x = e.clientX; look.y = e.clientY; }
    });
    for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(ev, e => {
      if (e.pointerId === stick.id) { stick.id = null; if (stick.fresh) stick.release = true; else stick.x = stick.y = 0; knob.style.transform = ''; stickEl.style.display = 'none'; }
      if (e.pointerId === look.id) look.id = null;
    });
    canvas.addEventListener('wheel', e => { e.preventDefault(); zoom += e.deltaY; }, {passive: false});
  }
  const journal = $('#ap-journal');
  return {
    bind,
    input() {
      // Короткое нажатие (короче кадра на слабом телефоне) всё равно двигает героя хотя бы один кадр.
      const k = n => keys.has(n) || pulse.has(n) ? 1 : 0;
      const x = stick.x + k('d') + k('arrowright') - k('a') - k('arrowleft');
      const y = stick.y + k('s') + k('arrowdown') - k('w') - k('arrowup');
      const out = {x, y, lookX: look.dx, lookY: look.dy, zoom};
      look.dx = look.dy = 0; zoom = 0; pulse.clear(); stick.fresh = false;
      if (stick.release) { stick.release = false; stick.x = stick.y = 0; }
      return out;
    },
    say(line) {
      if (!line) { say.classList.remove('on'); return; }
      const sp = SPEAKERS[line[0]];
      say.classList.toggle('machine', !!sp.machine);
      say.querySelector('b').textContent = sp.name; say.querySelector('b').style.color = sp.color;
      say.querySelector('p').textContent = line[1]; say.classList.add('on');
      const row = document.createElement('div'); row.innerHTML = `<b style="color:${sp.color}"></b>`;
      row.firstChild.textContent = sp.name; row.append(line[1]); journal.prepend(row);
    },
    pips(counts, stage) {
      $('#ap-pips').classList.toggle('on', stage > 0);
      const fill = [counts.herbs, counts.herbs, counts.herbs, counts.shrooms, counts.shrooms, counts.water];
      const idx = [0, 1, 2, 0, 1, 0];
      pips.forEach((p, i) => p.classList.toggle('full', idx[i] < fill[i]));
      pips.forEach((p, i) => p.classList.toggle('off', (i >= 3 && stage < 2) || (i >= 5 && stage < 3)));
    },
    action(visible, charges, urge) {
      act.classList.toggle('on', visible); act.classList.toggle('empty', charges <= 0); act.classList.toggle('urge', !!urge);
      const c = $('#ap-charges'); if (c.childElementCount !== charges) c.innerHTML = '<i></i>'.repeat(Math.max(0, charges));
    },
    end(show, chapter = 1) {
      const card=$('#ap-end'); card.hidden = !show;
      card.querySelector('h2').textContent = chapter === 2 ? 'Глава II завершена' : 'Конец демо · Глава I';
      card.querySelector('h1').textContent = chapter === 2 ? 'Архив станции' : '«Вылечи того, кто лежит в лесу»';
      card.querySelector('p').textContent = chapter === 2 ? '' : 'Великан не был создан для войны. Что спрятано под ним — узнаем в главе II «Архив станции».';
      $('#ap-next').hidden = chapter !== 1;
    },
    mode(name) {
      const archive = name === 'archive';
      act.setAttribute('aria-label',archive ? 'Закрыть архивную дверь' : 'Пыльца сонника');
      act.querySelector('svg').outerHTML = archive ? ICON.door : ICON.dust;
    },
    title(show) { $('#ap-title').hidden = !show; },
    get menuOpen() { return !menu.hidden; },
    clearJournal() { journal.innerHTML = ''; }
  };
}

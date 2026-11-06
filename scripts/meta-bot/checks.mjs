// Каркас Claude. Проверки правил внутри страницы. Вызываются ядром, не стратегией.
export const ALLOWED_KEYS = ['version', 'info', 'state'];
export const STATE_KEYS = ['started', 'level', 'levelDone', 'gameDone', 'alive', 'hero', 'goal', 'enemies', 'weapons', 'layoutHash', 'menuOpen'];

// ЧИСТЫЙ ЭКРАН: видимый текст (буквы/цифры) вне открытого меню. Знаки-иконки вроде ☰ ✕ ▶ разрешены.
export function visibleTextInPage() {
  const out = []; const W = innerWidth, H = innerHeight;
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    const t = n.textContent.trim(); if (!t || !/[\p{L}\p{N}]/u.test(t)) continue;
    const el = n.parentElement; if (!el || el.closest('script,style,noscript,template,title')) continue;
    if (el.checkVisibility && !el.checkVisibility({ opacityProperty: true, visibilityProperty: true, contentVisibilityAuto: true })) continue;
    let op = 1; for (let e = el; e; e = e.parentElement) op *= parseFloat(getComputedStyle(e).opacity || '1'); if (op < 0.05) continue;
    const r = document.createRange(); r.selectNodeContents(n); const b = r.getBoundingClientRect();
    if (b.width < 1 || b.height < 1 || b.right < 0 || b.bottom < 0 || b.left > W || b.top > H) continue;
    out.push(t.slice(0, 40));
  }
  return out;
}
// Кнопка меню ☰ в правом верхнем углу.
export function menuButtonInPage() {
  const W = innerWidth, H = innerHeight;
  for (const el of document.querySelectorAll('button,[role=button],a,[aria-label]')) {
    const lab = (el.getAttribute('aria-label') || '') + ' ' + (el.textContent || '');
    if (!/меню|menu|☰/i.test(lab)) continue;
    const b = el.getBoundingClientRect(); if (b.width < 1 || b.height < 1) continue;
    if (b.left + b.width / 2 > W * 0.6 && b.top + b.height / 2 < H * 0.3) return true;
  }
  return false;
}
export function scrollAndCanvasInPage() {
  const c = document.querySelector('canvas'); const b = c ? c.getBoundingClientRect() : { x: 0, y: 0, width: 0, height: 0 };
  return { sx: scrollX, sy: scrollY, st: (document.scrollingElement || document.documentElement).scrollTop, cx: b.x, cy: b.y, cw: b.width, ch: b.height };
}
export function fpsInPage(ms) {
  return new Promise(res => { let n = 0; const t0 = performance.now(); (function f(t) { n++; if (t - t0 < ms) requestAnimationFrame(f); else res(n * 1000 / (t - t0)); })(t0); });
}

// Каркас Claude. Ввод только как у игрока: касания, джойстик, клавиши.
export async function makeInput(page, { mobile, viewport, cfg, isAborted }) {
  const cdp = mobile ? await page.context().newCDPSession(page) : null;
  const guard = () => { if (isAborted()) throw new Error('__ABORT__'); };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((p, i) => ({ x: p[0], y: p[1], id: i })) });
  const j = Object.assign({ x: 0.18, y: 0.80, r: 0.09 }, cfg.joystick || {});
  const moveKeys = Object.assign({ up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD' }, cfg.moveKeys || {});
  async function tap(x, y) { guard(); if (mobile) { await touch('touchStart', [[x, y]]); await wait(40); await touch('touchEnd', []); } else await page.mouse.click(x, y); }
  async function hold(x, y, ms) { guard(); if (mobile) { await touch('touchStart', [[x, y]]); await wait(ms); await touch('touchEnd', []); } else { await page.mouse.move(x, y); await page.mouse.down(); await wait(ms); await page.mouse.up(); } }
  async function swipe(x1, y1, x2, y2, ms = 200) {
    guard(); const n = Math.max(4, Math.round(ms / 16));
    if (mobile) { await touch('touchStart', [[x1, y1]]); for (let i = 1; i <= n; i++) { await touch('touchMove', [[x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n]]); await wait(ms / n); } await touch('touchEnd', []); }
    else { await page.mouse.move(x1, y1); await page.mouse.down(); for (let i = 1; i <= n; i++) { await page.mouse.move(x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n); await wait(ms / n); } await page.mouse.up(); }
  }
  async function joystick(dx, dy, ms = 300) {
    guard(); dx = Math.max(-1, Math.min(1, dx || 0)); dy = Math.max(-1, Math.min(1, dy || 0));
    if (mobile) {
      const cx = j.x * viewport.width, cy = j.y * viewport.height, R = j.r * Math.min(viewport.width, viewport.height);
      await touch('touchStart', [[cx, cy]]);
      for (let k = 1; k <= 4; k++) { await touch('touchMove', [[cx + dx * R * k / 4, cy + dy * R * k / 4]]); await wait(16); }
      const t = Date.now(); while (Date.now() - t < ms) { guard(); await touch('touchMove', [[cx + dx * R, cy + dy * R]]); await wait(50); }
      await touch('touchEnd', []);
    } else {
      const keys = []; if (dy < -0.3) keys.push(moveKeys.up); if (dy > 0.3) keys.push(moveKeys.down); if (dx < -0.3) keys.push(moveKeys.left); if (dx > 0.3) keys.push(moveKeys.right);
      for (const k of keys) await page.keyboard.down(k); await wait(ms); for (const k of keys) await page.keyboard.up(k);
    }
  }
  async function key(code, ms = 80) { guard(); await page.keyboard.down(code); await wait(ms); await page.keyboard.up(code); }
  return { tap, hold, swipe, joystick, key, wait: async ms => { guard(); await wait(ms); } };
}

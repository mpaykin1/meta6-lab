// Бот-проходчик «Острова последнего аптекаря». Запуск из корня meta6-lab при работающем
// `python3 -m http.server 8765`:  node games/ostrov-aptekarya/bot/playthrough.mjs full|chase|passive
// PASS: 0 ошибок страницы; full/chase -> финал; passive -> пойман >=1 раз и погоня повторилась.
import {chromium} from 'playwright';
const mode = process.argv[2] || 'full';
const url = process.env.URL || 'http://localhost:8765/games/ostrov-aptekarya/';
const browser = await chromium.launch({executablePath: process.env.CHROME || undefined,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
const page = await browser.newPage({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true});
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(url);
await page.waitForFunction(() => window.__APTEKAR__?.start, null, {timeout: 60000});
await page.waitForTimeout(1500);
await page.evaluate(m => {
  const a = window.__APTEKAR__;
  if (m === 'full') a.start(); else a.debugChase();
  a.bot = true; a.botPassive = m === 'passive'; a.timeScale = 4;
}, mode);
const stray = () => page.evaluate(() => [...document.querySelectorAll('body *')].filter(e => e.offsetParent &&
  [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && !e.closest('#ap-say,#ap-menu,.ap-card')).length);
let result = 'TIMEOUT', strayText = 0;
const t0 = Date.now();
while (Date.now() - t0 < 480000) {
  const s = await page.evaluate(() => { const a = window.__APTEKAR__; return {state: a.state, girl: a.girl, caught: a.caughtCount, end: !document.getElementById('ap-end').hidden}; });
  strayText = Math.max(strayText, await stray());
  if (mode === 'passive' && s.caught >= 1 && (s.state === 'chase' || s.end)) { result = 'CAUGHT_AND_RETRY'; break; }  // после поимки — повтор погони или (ночь кончилась) финал
  if (s.end) { result = mode === 'passive' ? 'ENDING_NOT_CAUGHT' : 'ENDING'; break; }
  await page.waitForTimeout(600);
}
await browser.close();
const pass = errors.length === 0 && strayText === 0 && (mode === 'passive' ? result === 'CAUGHT_AND_RETRY' : result === 'ENDING');
console.log(JSON.stringify({mode, result, errors, strayText, pass}));
process.exit(pass ? 0 : 1);

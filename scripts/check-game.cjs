#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const name = process.argv[2];
if (!name) { console.error('Usage: node scripts/check-game.cjs <game/index.html>'); process.exit(2); }
const game = path.resolve(name), three = path.resolve('node_modules/three');
if (!fs.existsSync(game)) { console.error('No game: ' + name); process.exit(2); }

function baseline(kind) {
  const dir = path.resolve('docs/weekly-review');
  const col = name.startsWith('ashen-sumerek/') ? 4 : name.startsWith('underwater-sumerek/') ? 3 : -1;
  if (col < 0 || !fs.existsSync(dir)) return null;
  for (const file of fs.readdirSync(dir).filter(f => /^\d{4}-\d\d-\d\d\.md$/.test(f)).sort().reverse()) {
    const line = fs.readFileSync(path.join(dir, file), 'utf8').split('\n')
      .find(s => new RegExp('^\\|\\s*' + (kind === 'idle' ? 'покой' : 'бой') + '\\s*\\|', 'i').test(s));
    if (!line) continue;
    const cell = line.split('|')[col] || '';
    const measurements = [...cell.matchAll(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/g)];
    if (measurements.length) return { fps: +measurements.at(-1)[1], p95: +measurements.at(-1)[2], file };
  }
  return null;
}

async function textNodes(page) {
  return page.evaluate(() => {
    const tree = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const result = [];
    while (tree.nextNode()) {
      const n = tree.currentNode, text = n.textContent.trim();
      if (!text) continue;
      let p = n.parentElement, skip = false;
      while (p) {
        if (p.hidden || p.hasAttribute('inert') || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|TITLE)$/.test(p.tagName)) {
          skip = true; break;
        }
        const s = getComputedStyle(p);
        if (s.display === 'none' || s.visibility === 'hidden' || s.visibility === 'collapse' || Number(s.opacity) <= 0) {
          skip = true; break;
        }
        p = p.parentElement;
      }
      if (skip) continue;
      const range = document.createRange(); range.selectNodeContents(n);
      if ([...range.getClientRects()].some(r => r.width > 0 && r.height > 0)) result.push(text.slice(0, 80));
    }
    return result;
  });
}

async function fps(page) {
  return page.evaluate(async () => {
    const durations = [], start = performance.now();
    let prev = start;
    await new Promise(resolve => {
      const stop = setTimeout(resolve, 6500);
      function tick(now) {
        if (now - start >= 5000) { clearTimeout(stop); resolve(); return; }
        if (prev !== start) durations.push(now - prev);
        prev = now; requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
    const d = durations.sort((a,b) => a - b), elapsed = performance.now() - start;
    return { fps: +(durations.length * 1000 / elapsed).toFixed(2),
      p95: +(d[Math.max(0,Math.ceil(d.length*.95)-1)] || elapsed).toFixed(1), frames: d.length };
  });
}

function printFps(kind, result) {
  const b = baseline(kind);
  console.log(kind + ': FPS=' + result.fps + ' p95=' + result.p95 + 'ms frames=' + result.frames +
    (b ? ' previous=' + b.fps + ' (' + b.file + ')' : ' previous=UNKNOWN'));
  if (b && result.fps < .7 * b.fps)
    console.warn('WARNING: FPS fell >30% against ' + b.file + ' (compare only identical hardware/settings)');
}

(async () => {
  const issues = [], browser = await chromium.launch({ headless: true, args: [
    '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'
  ] });
  try {
    const context = await browser.newContext({viewport:{width:480,height:270},deviceScaleFactor:1});
    const page = await context.newPage();
    page.on('pageerror',e=>issues.push('pageerror '+e.message));
    page.on('console',m=>{
      if(m.type() !== 'error') return;
      if(/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(m.location()?.url || '')) return;
      issues.push('console '+m.text());
    });
    page.on('requestfailed', r => {
      if(r.url().startsWith('https://cdn.jsdelivr.net/npm/three@0.160.0/')) issues.push('Three import failed: '+r.url());
    });
    await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, r =>
      r.fulfill({ status:200, contentType:'text/css', body:'' }));
    await page.route(/^https:\/\/cdn\.jsdelivr\.net\/npm\/three@0\.160\.0\//, async r => {
      const rel = decodeURIComponent(new URL(r.request().url()).pathname).replace(/^\/npm\/three@0\.160\.0\//,'');
      const local = path.resolve(three,rel);
      if (!local.startsWith(three+path.sep) || !fs.existsSync(local)) {
        issues.push('Local Three missing: '+rel); await r.abort(); return;
      }
      await r.fulfill({ status:200, contentType:'text/javascript',
        headers:{'access-control-allow-origin':'*'}, body:fs.readFileSync(local) });
    });
    await page.goto(pathToFileURL(game).href,{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForFunction(()=>!!window.__isle, undefined,{timeout:60000});
    if(await page.evaluate(()=>typeof window.__isle.startGame) !== 'function') throw Error('startGame not exported');
    await page.evaluate(()=>window.__isle.startGame());
    await page.waitForFunction(()=>window.__isle?.G?.state==='play',undefined,{timeout:20000});
    await page.waitForTimeout(3000);
    const text = await textNodes(page);
    console.log('ЧИСТЫЙ ЭКРАН visible_text=' + text.length + (text.length ? ' '+JSON.stringify(text) : ''));
    if(text.length) issues.push('visible text '+JSON.stringify(text));
    const menu = page.getByRole('button',{name:'Меню'});
    if(await menu.count() !== 1) issues.push('unique Menu button missing');
    else {
      await menu.click({timeout:15000});
      const paused = await page.evaluate(()=>window.__isle.G.state);
      console.log('MENU click1='+paused);
      if(paused!=='paused') issues.push('menu click1 '+paused);
      await menu.click({timeout:15000});
      const resumed = await page.evaluate(()=>window.__isle.G.state);
      console.log('MENU click2='+resumed);
      if(resumed!=='play') issues.push('menu click2 '+resumed);
    }
    await page.waitForTimeout(3000);
    printFps('idle',await fps(page));
    await page.evaluate(()=>{
      window.__isle.giveAll();
      for(let i=0;i<3;i++) window.__isle.foeNear('shade',3+i,3+i);
    });
    await page.waitForTimeout(3000);
    printFps('battle',await fps(page));
    if(issues.length) { console.error(issues.join('\n')); process.exitCode=1; }
    else console.log('BROWSER CHECK OK: '+name);
    await context.close();
  } finally { await browser.close(); }
})().catch(e=>{console.error('BROWSER CHECK FATAL',e.stack||e);process.exitCode=1;});

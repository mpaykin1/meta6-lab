import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(process.argv.includes('--root') ? process.argv[process.argv.indexOf('--root') + 1] : fileURLToPath(new URL('../..', import.meta.url)));
const REPO = 'mpaykin1/meta6-lab';
const API = 'https://api.github.com';
const TOKEN = process.env.GH_TOKEN || '';
const SITE = 'https://mpaykin1.github.io/meta6-lab';
const HOURS = 72;
const esc = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const clip = (value, max = 80) => Array.from(value).slice(0, max).join('');
const read = name => fs.readFile(path.join(ROOT, name), 'utf8');

async function github(endpoint) {
  const response = await fetch(API + '/repos/' + REPO + endpoint, {
    headers: { accept: 'application/vnd.github+json', 'user-agent': 'meta-games-owner-pult', ...(TOKEN ? { authorization: 'Bearer ' + TOKEN } : {}) },
    signal: AbortSignal.timeout(20000)
  });
  if (!response.ok) throw Error('GitHub API ' + response.status + ' ' + endpoint);
  return response.json();
}
async function pages(endpoint) {
  let result = [], page = 1;
  while (true) {
    const divider = endpoint.includes('?') ? '&' : '?';
    const list = await github(endpoint + divider + 'per_page=100&page=' + page);
    if (!Array.isArray(list)) throw Error('GitHub list response is invalid');
    result.push(...list);
    if (list.length < 100) return result;
    if (++page > 25) throw Error('GitHub pagination is incomplete');
  }
}
function progress(markdown, total) {
  const lines = markdown.split(/\r?\n/).filter(line => /^\|\s*(?:M[1-6]|B[1-7]|L[1-4]|P1|Л[1-6]|С[12]|Э[12])\s*\|/.test(line));
  if (lines.length !== total) throw Error('Unexpected FINISH table rows: ' + lines.length + ', expected ' + total);
  return lines.filter(line => {
    const status = line.split('|')[total === 18 ? 4 : 3] || '';
    return /ЗЕЛЁНАЯ/.test(status) && /https:\/\/github\.com\/[^\s)]+\/actions\/runs\/\d+/.test(status);
  }).length;
}
function gamesFromStorefront(html) {
  const games = [], seen = new Set();
  for (const match of html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)) {
    const open = match[0].slice(0, match[0].indexOf('>') + 1);
    if (!/\bclass\s*=\s*["'][^"']*\bgame\b[^"']*["']/i.test(open)) continue;
    const href = /\bhref\s*=\s*["']([^"']+)["']/i.exec(open)?.[1] || '';
    const title = /<h3\b[^>]*>([^<]+)<\/h3>/i.exec(match[0])?.[1]?.trim();
    if (!/^\.\.\/(?:[a-z0-9-]+\/)+$/i.test(href) || !title) throw Error('Invalid game card');
    const folder = href.slice(3, -1);
    if (seen.has(folder)) throw Error('Duplicate game: ' + folder);
    seen.add(folder);
    games.push({ path: folder, title });
  }
  if (!games.length) throw Error('No storefront games');
  return games;
}
function publicMessage(subject) {
  const line = String(subject || '').split(/\r?\n/)[0]
    .replace(/\b(?:commit|workflow|PR\s*#?\d+)\b/gi, '')
    .replace(/\b[0-9a-f]{7,40}\b/gi, '')
    .replace(/(?:^|\s)[\w.-]+(?:\/[\w.-]+)+/g, '')
    .replace(/\b(?:\.mjs|\.yml|\.js)\b/gi, '')
    .replace(/\s+/g, ' ').trim();
  return clip(line || 'Мир обновлён');
}
function prettyDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(+date)) throw Error('Invalid GitHub date: ' + iso);
  return new Intl.DateTimeFormat('ru-RU', { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}
function stalledRows(md) {
  return md.split(/\r?\n/).filter(line => /^\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|/.test(line) && /⚠|свободно/i.test(line))
    .map(line => {
      const fields = line.split('|').slice(1, -1).map(x => x.trim());
      return { title: fields[0].replace(/[*]/g, ''), description: /⚠/.test(line) ? 'Давно нет изменений' : 'Можно продолжить' };
    });
}
async function livePreview(url) {
  try {
    const response = await fetch(url, { method: 'GET', redirect: 'manual', signal: AbortSignal.timeout(12000) });
    await response.body?.cancel();
    return response.status === 200;
  } catch { return false; }
}
function playCard(game) {
  return '<article class="play-card" data-game-path="' + esc(game.path) + '" data-kind="' + game.kind + '">' +
    '<div class="orb" aria-hidden="true"></div><div class="play-inner"><span class="date">' + esc(prettyDate(game.date)) + '</span>' +
    '<h3>' + esc(game.title) + '</h3><p>' + esc(game.news) + '</p>' +
    '<a class="go" data-play="1" href="' + esc(game.url) + '">Играть <span aria-hidden="true">↗</span></a></div></article>';
}
function render(data) {
  const cards = data.games.length ? data.games.map(playCard).join('\n') : '<p class="empty">За последние три дня обновлений игр не было.</p>';
  const stalled = data.stalled.length ? data.stalled.map(x => '<div class="stalled-item"><b>' + esc(x.title) + '</b><span>' + esc(x.description) + '</span></div>').join('') : '<p class="none">Ничего не зависло</p>';
  const stage2 = data.stage1 === 18 ? '<div class="stage-two"><span>Этап 2</span><strong>' + data.stage2 + ' <small>из 10</small></strong></div>' : '';
  const metadata = JSON.stringify({ stage1: data.stage1, stage2: data.stage2, games: data.games.map(g => ({ path: g.path, kind: g.kind, url: g.url, branch: g.branch || null })) }).replace(/</g, '\\u003c');
  return '<!doctype html>\n<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">' +
    '<meta name="theme-color" content="#050a12"><title>Пульт владельца — META GAMES</title><style>' +
    ':root{color-scheme:dark;--bg:#050a12;--ink:#e5e8f0;--muted:#a8b6c9;--gold:#eacb90;--line:#46566a}' +
    '*{box-sizing:border-box}html{background:var(--bg)}body{margin:0;min-height:100vh;background:radial-gradient(ellipse at 76% 2%,#172e3b 0%,transparent 41%),radial-gradient(ellipse at 8% 41%,#1b2739 0%,transparent 40%),#050a12;color:var(--ink);font:16px/1.5 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}' +
    'a{color:inherit;text-decoration:none}a:focus-visible{outline:2px solid var(--gold);outline-offset:4px}.wrap{width:min(1100px,91%);margin:0 auto}' +
    'header{padding:27px 0 24px;display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid #33465a}' +
    '.brand{font-size:15px;font-weight:900;letter-spacing:.2em}.brand em{font-style:normal;color:var(--gold)}.back{font-size:13px;color:var(--muted)}' +
    '.hero{padding:55px 0 65px;position:relative}.eyebrow{color:var(--gold);letter-spacing:.24em;font-size:11px;font-weight:800;text-transform:uppercase}' +
    'h1{font-size:clamp(45px,10vw,100px);letter-spacing:-.065em;line-height:.95;margin:15px 0 30px;font-weight:760}' +
    '.number{display:flex;align-items:baseline;gap:22px}.number strong{font-size:clamp(92px,21vw,210px);font-variant-numeric:tabular-nums;letter-spacing:-.09em;line-height:.9;color:#f7e2af;text-shadow:0 0 90px #b4b98f3f}' +
    '.number small{color:#bbc8d4;font-size:clamp(22px,5vw,48px);font-weight:450;letter-spacing:-.04em}.rule{width:100%;height:5px;background:#213343;margin-top:40px;border-radius:8px;overflow:hidden}.rule span{display:block;height:100%;background:linear-gradient(90deg,#91cbcc,#eacf99);box-shadow:0 0 22px #eacf99aa}' +
    '.stage-two{margin-top:28px;padding:21px 26px;border:1px solid var(--line);background:#13212daa;display:flex;align-items:center;justify-content:space-between}.stage-two strong{font-size:37px;color:var(--gold)}.stage-two small{font-size:18px;color:var(--muted)}' +
    'section{padding:25px 0 43px}h2{font-size:clamp(29px,6vw,52px);font-weight:560;line-height:1.02;letter-spacing:-.055em;margin:0 0 26px}' +
    '.play-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}.play-card{position:relative;min-height:290px;display:flex;align-items:flex-end;border:1px solid #5e71816b;background:radial-gradient(ellipse at 61% 23%,#355f62 0%,#182c42 27%,#090f1c 75%);overflow:hidden;isolation:isolate;transition:transform .2s,border-color .2s}.play-card:nth-child(even){background:radial-gradient(ellipse at 50% 24%,#725449 0%,#312d3d 30%,#0b101e 74%)}.play-card:hover{transform:translateY(-3px);border-color:var(--gold)}' +
    '.orb{position:absolute;top:9%;right:14%;width:130px;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 35% 30%,#f6e8b4,#90adb0 43%,#1c4053 70%);box-shadow:0 0 65px #b5cfc46a;opacity:.68;animation:breath 9s ease-in-out infinite;z-index:-1}.play-inner{width:100%;padding:30px 27px;background:linear-gradient(transparent,#08101ae8 29%,#080f1b 100%)}' +
    '.date{color:var(--gold);font-size:12px;font-weight:750}.play-card h3{font-size:clamp(22px,3vw,34px);letter-spacing:-.04em;margin:5px 0}.play-card p{font-size:14px;color:#c0cbdb;margin:0 0 18px;min-height:22px}.go{display:inline-flex;align-items:center;justify-content:space-between;min-width:142px;min-height:46px;padding:9px 17px;border:1px solid var(--gold);background:var(--gold);color:#17212c;font-weight:850}.go:hover{background:#fff0c1}' +
    '.stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin-top:22px}.stat{min-height:180px;background:#101b29;border:1px solid #384859;padding:25px}.stat b{display:block;font-size:clamp(52px,8vw,84px);line-height:1;color:#e7cf9d;font-variant-numeric:tabular-nums}.stat span{display:block;font-size:17px;margin-top:15px}.stat p{color:var(--muted);font-size:13px;margin:6px 0}.stalled-item{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;padding:17px 0;border-bottom:1px solid #334455}.stalled-item span{color:var(--gold)}.none,.empty{color:var(--muted)}' +
    'footer{padding:35px 0 48px;margin-top:30px;border-top:1px solid #34495c;font-size:13px;color:var(--muted)}@keyframes breath{50%{transform:scale(1.08);filter:brightness(1.2)}}' +
    '@media(max-width:650px){header{padding:22px 0}.hero{padding:46px 0 48px}.number{gap:14px}.play-grid{grid-template-columns:1fr}.play-card{min-height:270px}.stat{min-height:155px;padding:19px}.stat span{font-size:15px}.stats{gap:10px}}@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}' +
    '</style></head><body><div class="wrap"><header><a class="brand" href="../"><em>◇</em> META <em>GAMES</em></a><a class="back" href="../">Все миры ↗</a></header>' +
    '<main><div class="hero"><div class="eyebrow">Пульт владельца</div><h1>Этап 1</h1><div class="number"><strong>' + data.stage1 + '</strong><small>из 18</small></div><div class="rule"><span style="width:' + (100 * data.stage1 / 18).toFixed(2) + '%"></span></div>' + stage2 + '</div>' +
    '<section><div class="eyebrow">Последние три дня</div><h2>Во что поиграть</h2><div class="play-grid">' + cards + '</div></section>' +
    '<section><h2>Ждёт Claude</h2><div class="stats"><div class="stat"><b>' + data.waiting + '</b><span>Готово к проверке</span><p>Ожидает решения</p></div><div class="stat"><b>' + data.needs + '</b><span>Нужна помощь</span><p>Ожидает внимания</p></div></div></section>' +
    '<section><h2>Зависло</h2>' + stalled + '</section></main><footer>Обновлено ' + esc(new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', dateStyle: 'long', timeStyle: 'short' }).format(new Date(data.updated))) + ' (Москва)</footer></div>' +
    '<script id="pult-data" type="application/json">' + metadata + '</script></body></html>\n';
}

async function main() {
  const [finish, finish2, occupied, storefront] = await Promise.all([
    read('rules/09-platforma/FINISH.md'), read('rules/09-platforma/FINISH_2.md'),
    read('rules/09-platforma/ZANYATO.md'), read('meta-games/index.html')
  ]);
  const stage1 = progress(finish, 18);
  const stage2 = progress(finish2, 10);
  const games = gamesFromStorefront(storefront);
  const cutoff = new Date(Date.now() - HOURS * 3600000).toISOString();
  const changed = [];
  for (const game of games) {
    const commits = await github('/commits?sha=main&path=' + encodeURIComponent(game.path) + '&since=' + encodeURIComponent(cutoff) + '&per_page=1');
    if (!Array.isArray(commits)) throw Error('Unexpected commit list');
    const recent = commits[0];
    if (!recent) continue;
    const date = recent.commit?.committer?.date;
    if (!date || new Date(date) < new Date(cutoff)) continue;
    changed.push({ ...game, date, news: publicMessage(recent.commit?.message), kind: 'main', url: '../../' + game.path + '/' });
  }
  const pulls = await pages('/pulls?state=open');
  const ready = pulls.filter(pr => (pr.labels || []).some(label => label.name === 'ГОТОВО ДЛЯ CLAUDE'));
  const previewGames = [];
  for (const pr of ready) {
    const branch = pr.head?.ref || '';
    if (!branch.startsWith('lab/') || !/^[a-zA-Z0-9._/-]+$/.test(branch)) continue;
    const files = await pages('/pulls/' + pr.number + '/files');
    const changedPaths = files.map(f => f.filename);
    const safe = branch.slice(4).replace(/\//g, '-');
    for (const game of games) {
      if (!changedPaths.some(f => f.startsWith(game.path + '/'))) continue;
      const url = SITE + '/preview/' + safe + '/' + game.path + '/';
      if (!(await livePreview(url))) continue;
      previewGames.push({ ...game, branch, date: pr.updated_at || pr.created_at, news: publicMessage(pr.title), kind: 'preview', url });
    }
  }
  const stuck = stalledRows(occupied);
  const needs = occupied.split('\n').filter(line => line.startsWith('|') && line.includes('НУЖЕН CLAUDE')).length +
    [finish, stage1 === 18 ? finish2 : ''].flatMap(s => s.split('\n').filter(line => line.startsWith('|') && line.includes('НУЖЕН CLAUDE'))).length +
    pulls.filter(pr => /(?:^|\n)\s*НУЖЕН CLAUDE\s*:/i.test(pr.body || '')).length;
  const allGames = [...previewGames, ...changed].sort((a, b) => new Date(b.date) - new Date(a.date));
  const data = { stage1, stage2, waiting: ready.length, needs, games: allGames, stalled: stuck, updated: new Date().toISOString() };
  const target = path.join(ROOT, 'meta-games/pult/index.html');
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, render(data));
  console.log('PULT_BUILT stage1=' + stage1 + '/18 stage2=' + stage2 + '/10 games=' + allGames.length + ' ready=' + ready.length);
}
main().catch(error => { console.error('PULT_BUILD_FAILED', error.stack || error); process.exitCode = 1; });

// Каркас Claude. Измерение готовности META GAMES. ChatGPT этот файл НЕ меняет (сторож meta-games-guard).
// Проценты считаются только из живых фактов: ответы MCP-сервера, файлы репозитория, прогоны META BOT.
// Запуск: node scripts/meta-progress/progress.mjs  (env: GH_TOKEN, GITHUB_REPOSITORY, MCP_URL — необязательно)
// Итог: progress.json + таблица в $GITHUB_STEP_SUMMARY. Знаменатели зафиксированы здесь и не уменьшаются.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const MCP = process.env.MCP_URL || 'https://meta-games-mcp-production.onrender.com/meta-games/mcp';
const REPO = process.env.GITHUB_REPOSITORY || 'mpaykin1/meta6-lab';
const TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '';
const V = '2026-07-28';
const READ_TOOLS = ['list_games', 'inspect_game', 'list_assets', 'search_assets', 'search_mechanics', 'get_asset', 'get_source', 'get_dependencies'];
const AD = /showInterstitial|showRewarded|showBanner|playgama-bridge|\.advertisement\b/;

let rpcId = 0;
async function rpc(method, params = {}, name) {
  const body = { jsonrpc: '2.0', id: ++rpcId, method, params: { ...params, _meta: { 'io.modelcontextprotocol/protocolVersion': V, 'io.modelcontextprotocol/clientCapabilities': {} } } };
  const h = { 'content-type': 'application/json', accept: 'application/json, text/event-stream', 'mcp-protocol-version': V, 'mcp-method': method };
  if (name) h['mcp-name'] = name;
  const r = await fetch(MCP, { method: 'POST', headers: h, body: JSON.stringify(body), signal: AbortSignal.timeout(60000) });
  return r.json();
}
const call = async (name, args = {}) => { const j = await rpc('tools/call', { name, arguments: args }, name); return j.error ? { error: j.error } : (j.result?.structuredContent ?? j.result); };
async function gh(p) { const r = await fetch('https://api.github.com/' + p, { headers: { accept: 'application/vnd.github+json', ...(TOKEN ? { authorization: 'Bearer ' + TOKEN } : {}) } }); if (!r.ok) throw new Error(`GitHub ${r.status} ${p}`); return r; }

// 1. MCP — 10 проверок
async function mcp() {
  const c = []; const ok = (name, pass, note = '') => c.push({ name, pass: !!pass, note });
  try {
    const tools = (await rpc('tools/list')).result?.tools?.map(t => t.name) || [];
    ok('8 инструментов чтения', READ_TOOLS.every(t => tools.includes(t)), tools.length + ' инструментов');
    const health = await (await fetch(MCP.replace(/\/mcp$/, '/health'), { signal: AbortSignal.timeout(60000) })).json().catch(() => ({}));
    ok('каталог: лицензированных ассетов > 0', health.licensed_assets > 0, 'licensed_assets=' + health.licensed_assets);
    const la = await call('list_assets'); const assets = la?.assets || [];
    ok('list_assets отдаёт ассеты', assets.length > 0, 'total=' + (la?.total ?? 0));
    const sa = await call('search_assets', { query: 'weather' });
    ok('search_assets находит', (sa?.assets || sa?.results || []).length > 0);
    ok('create_game опубликован', tools.includes('create_game'));
    let pkg = null;
    if (tools.includes('create_game') && assets.length >= 2) pkg = await call('create_game', { asset_ids: assets.slice(0, 2).map(a => a.id), seed: 'progress-check' });
    const files = pkg?.files || [];
    ok('create_game возвращает игру', files.some(f => /(^|\/)index\.html$/.test(f.path || f)));
    const used = pkg?.provenance?.assets || []; const lic = new Set(assets.map(a => a.id));
    ok('игра только из ассетов эталонов', used.length > 0 && used.every(a => lic.has(a.id)) && !(pkg?.visual_layers || []).some(l => l.origin === 'engine_generated'));
    const val = pkg && tools.includes('validate_game') ? await call('validate_game', { package: pkg }) : null;
    ok('validate_game PASS', val && (val.ok === true || val.status === 'pass'));
    const pre = pkg && tools.includes('preview_game') ? await call('preview_game', { package: pkg }) : null;
    ok('preview_game отдаёт просмотр', pre && !pre.error);
    const pub = await rpc('tools/call', { name: 'publish_game', arguments: {} }, 'publish_game');
    ok('publish_game закрыт для публики', !!pub.error || pub.result?.isError === true);
  } catch (e) { ok('MCP доступен', false, String(e.message || e)); }
  while (c.length < 10) c.push({ name: 'не проверено', pass: false, note: 'проверка не дошла' });
  return c.slice(0, 10);
}

// 2. Библиотека — каждый компонент shared/components × 3 признака; знаменатель не меньше 10 компонентов
const ALLOW = ['observer-world-en-v7/', 'ashen-sumerek/', 'underwater-world/', 'three-worlds-game/', 'meta-games-worlds/veil-terraces/', 'games/'];
const GAME_DIR = { 'twilight-island': 'games/twilight-island', 'ashen-path': 'games/ashen-path', 'underwater-world': 'games/underwater-world', 'three-worlds': 'games/three-worlds' };
const gameDir = (root, g) => [GAME_DIR[g], 'games/' + g, g].find(d => d && fs.existsSync(path.join(root, d)));
const blobOf = f => { try { return execFileSync('git', ['hash-object', f], { encoding: 'utf8' }).trim(); } catch { return null; } };
function usesComponent(root, dir, id) {
  if (!dir) return false; const needle = 'shared/components/' + id;
  return fs.readdirSync(path.join(root, dir)).filter(f => /\.(html|js|mjs)$/.test(f)).some(f => fs.readFileSync(path.join(root, dir, f), 'utf8').includes(needle));
}
async function library(root) {
  const c = [], base = path.join(root, 'shared/components');
  const ids = fs.existsSync(base) ? fs.readdirSync(base).filter(d => fs.existsSync(path.join(base, d, 'component.json'))) : [];
  for (const id of ids) {
    let m = null; try { m = JSON.parse(fs.readFileSync(path.join(base, id, 'component.json'), 'utf8')); } catch {}
    const entry = m?.entry && path.join(base, id, m.entry);
    const code = entry && fs.existsSync(entry) ? fs.readFileSync(entry, 'utf8') : '';
    const src = m?.source || {};
    const fromRef = ALLOW.some(x => (src.path || '').startsWith(x)) && !!src.commit;
    const sameAsSource = !!src.git_blob_sha && blobOf(entry) === src.git_blob_sha; // скопировано из эталона без переписывания
    const ok1 = !!code && fromRef && sameAsSource && (id === 'no-ads-bridge' || !AD.test(code));
    c.push({ name: `${id}: код из эталона без переписывания`, pass: ok1, note: sameAsSource ? '' : 'git blob не совпадает с source.git_blob_sha' });
    const users = (m?.used_by || []).filter(g => usesComponent(root, gameDir(root, g), id));
    c.push({ name: `${id}: реально подключён в игре`, pass: ok1 && users.length > 0, note: users.join(', ') });
    let found = false; try { const r = await call('search_assets', { query: id }); found = JSON.stringify(r || {}).includes(id); } catch {}
    c.push({ name: `${id}: находится нейросетью через MCP search_assets`, pass: ok1 && found });
  }
  for (let k = ids.length; k < 10; k++) for (const w of ['код из эталона', 'подключён в игре', 'находится через MCP']) c.push({ name: `компонент ${k + 1} из 10: ${w}`, pass: false, note: 'ещё не создан' });
  return c;
}

// 3. Бот — каждая игра каталога × 3 признака
function catalogGames(root) {
  const html = fs.readFileSync(path.join(root, 'meta-games/index.html'), 'utf8');
  const dirs = [...html.matchAll(/href="\.\.\/([^"#?]+?)\/?"/g)].map(m => m[1]).filter(d => fs.existsSync(path.join(root, d, 'index.html')) && !/catalog/.test(d));
  return [...new Set(dirs)];
}
const COPY = { 'observer-world-en-v7': 'games/twilight-island', 'ashen-sumerek': 'games/ashen-path', 'underwater-world': 'games/underwater-world', 'three-worlds-game': 'games/three-worlds' };
const botDir = (root, d) => fs.existsSync(path.join(root, d, 'bot.json')) ? d : (COPY[d] || path.join('games', path.basename(d)));
async function lastBotResults() {
  // Последний завершённый прогон META BOT (каркас Claude) на main: строки «▶ games/x» и «✅/❌ экран: …».
  const runs = await (await gh(`repos/${REPO}/actions/workflows/meta-bot.yml/runs?branch=main&status=completed&per_page=1`)).json();
  const run = runs.workflow_runs?.[0]; if (!run) return { run: null, games: {} };
  const jobs = await (await gh(`repos/${REPO}/actions/runs/${run.id}/jobs`)).json();
  const log = await (await gh(`repos/${REPO}/actions/jobs/${jobs.jobs[0].id}/logs`)).text();
  const games = {}; let cur = null;
  for (const line of log.split('\n')) {
    const g = line.match(/▶ (\S+)/); if (g) { cur = g[1]; games[cur] = []; continue; }
    const r = line.match(/(✅|❌) (mobile|desktop)( \(2-й запуск\))?:/); if (cur && r) games[cur].push(r[1] === '✅');
  }
  return { run: run.html_url, games };
}
async function bot(root) {
  const c = []; let res = { run: null, games: {} };
  try { res = await lastBotResults(); } catch (e) { c.push({ name: 'прогон META BOT прочитан', pass: false, note: String(e.message) }); }
  for (const d of catalogGames(root)) {
    const bd = botDir(root, d), cfgF = path.join(root, bd, 'bot.json');
    let cfg = null; try { cfg = JSON.parse(fs.readFileSync(cfgF, 'utf8')); } catch {}
    const honest = !!cfg && (cfg.skipChecks || []).length === 0 && (cfg.stuckSec ?? 20) <= 20 && (cfg.deathSec ?? 5) <= 5;
    c.push({ name: `${d}: бот подключён честно`, pass: honest });
    const runs = res.games[bd] || [];
    c.push({ name: `${d}: бот прошёл всё (телефон, ПК, 2-й заход)`, pass: honest && runs.length >= 3 && runs.every(Boolean), note: res.run || '' });
    const files = fs.readdirSync(path.join(root, d)).filter(f => /\.(html|js|mjs)$/.test(f));
    const ads = files.some(f => AD.test(fs.readFileSync(path.join(root, d, f), 'utf8')));
    c.push({ name: `${d}: без рекламы`, pass: !ads });
  }
  return c;
}

const pct = c => c.length ? Math.round(100 * c.filter(x => x.pass).length / c.length) : 0;
const root = process.cwd();
const parts = { 'MCP': await mcp(), 'Библиотека': await library(root), 'Бот': await bot(root) };
const out = { measured_at: new Date().toISOString(), repo: REPO, commit: process.env.GITHUB_SHA || null, parts: {} };
for (const [k, c] of Object.entries(parts)) out.parts[k] = { percent: pct(c), passed: c.filter(x => x.pass).length, total: c.length, checks: c };
out.total = Math.round(Object.values(out.parts).reduce((s, p) => s + p.percent, 0) / 3);
fs.writeFileSync('progress.json', JSON.stringify(out, null, 1));
const lines = ['## Готовность META GAMES (измерено)', '', '| Часть | % | Проверок |', '|---|---|---|',
  ...Object.entries(out.parts).map(([k, p]) => `| ${k} | ${p.percent}% | ${p.passed}/${p.total} |`), `| **Общая** | **${out.total}%** | |`, '',
  ...Object.entries(out.parts).flatMap(([k, p]) => [`### ${k}`, ...p.checks.map(x => `- ${x.pass ? '✅' : '❌'} ${x.name}${x.note ? ' — ' + x.note : ''}`), ''])];
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n');
fs.writeFileSync('progress.md', lines.join('\n') + '\n');
console.log(Object.entries(out.parts).map(([k, p]) => `${k} — ${p.percent}%`).join('\n') + `\nОбщая — ${out.total}%`);

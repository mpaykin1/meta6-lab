import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const arg = (key, fallback) => process.argv.includes(key) ? process.argv[process.argv.indexOf(key) + 1] : fallback;
const ROOT = path.resolve(arg('--root', fileURLToPath(new URL('../..', import.meta.url))));
const PAGE = path.resolve(arg('--page', path.join(ROOT, 'meta-games/pult/index.html')));
const SITE = 'https://mpaykin1.github.io/meta6-lab';
const read = name => fs.readFile(path.join(ROOT, name), 'utf8');

function independentCount(markdown, count, stage) {
  const ids = stage === 1 ? /^(?:M[1-6]|B[1-7]|L[1-4]|P1)$/ : /^(?:Л[1-6]|С[12]|Э[12])$/;
  const seen = new Set();
  let green = 0;
  for (const line of markdown.split(/\r?\n/)) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map(c => c.trim());
    if (!ids.test(cells[0] || '')) continue;
    assert.ok(!seen.has(cells[0]), 'Duplicate finish ID: ' + cells[0]);
    seen.add(cells[0]);
    const state = cells[stage === 1 ? 3 : 2] || '';
    if (/ЗЕЛЁНАЯ/.test(state) && /https:\/\/github\.com\/[^\s)]+\/actions\/runs\/\d+/.test(state)) green++;
  }
  assert.equal(seen.size, count, 'Wrong number of FINISH entries');
  return green;
}
function independentStorefront(html) {
  const result = new Map();
  for (const a of html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)) {
    const tag = a[0].slice(0, a[0].indexOf('>') + 1);
    if (!/\bclass\s*=\s*["'][^"']*\bgame\b[^"']*["']/i.test(tag)) continue;
    const href = /\bhref\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1] || '';
    const name = /<h3\b[^>]*>([^<]+)<\/h3>/i.exec(a[0])?.[1] || '';
    assert.match(href, /^\.\.\/(?:[a-z0-9-]+\/)+$/, 'Invalid storefront link');
    assert.ok(name, 'Missing storefront title');
    result.set(href.slice(3, -1), name.trim());
  }
  assert.ok(result.size > 0, 'Storefront has no games');
  return result;
}
function playCards(page) {
  const found = [];
  for (const match of page.matchAll(/<article class="play-card" data-game-path="([^"]+)" data-kind="([^"]+)">([\s\S]*?)<\/article>/gi)) {
    const href = /<a class="go" data-play="1" href="([^"]+)"/i.exec(match[3])?.[1];
    const title = /<h3>([^<]+)<\/h3>/i.exec(match[3])?.[1];
    assert.ok(href && title, 'Game card must have title and playable link');
    found.push({ path: match[1], kind: match[2], href, title });
  }
  assert.equal((page.match(/data-play="1"/g) || []).length, found.length, 'Unverified play link');
  return found;
}
async function localServer(root) {
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const target = path.resolve(root, '.' + pathname);
      if (target !== root && !target.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
      const stat = await fs.stat(target);
      const file = stat.isDirectory() ? path.join(target, 'index.html') : target;
      const bytes = await fs.readFile(file);
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(bytes);
    } catch { response.writeHead(404).end('Not found'); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  return { server, port: server.address().port };
}
async function request200(url) {
  const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(18000) });
  await response.body?.cancel();
  assert.equal(response.status, 200, 'Play link is not HTTP 200: ' + url);
}
function visibleText(html) {
  return html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, ' ').replace(/&[^;\s]{1,12};/g, ' ').replace(/\s+/g, ' ').trim();
}
async function main() {
  const [page, finish, finish2, storefront] = await Promise.all([
    fs.readFile(PAGE, 'utf8'), read('rules/09-platforma/FINISH.md'),
    read('rules/09-platforma/FINISH_2.md'), read('meta-games/index.html')
  ]);
  const n1 = independentCount(finish, 18, 1);
  const n2 = independentCount(finish2, 10, 2);
  const num = /<div class="number"><strong>(\d+)<\/strong><small>из 18<\/small>/.exec(page);
  assert.ok(num, 'Visible stage 1 counter missing');
  assert.equal(Number(num[1]), n1, 'Visible stage 1 number differs from FINISH');
  const second = /<div class="stage-two">[\s\S]*?<strong>(\d+)\s*<small>из 10<\/small>/.exec(page);
  if (n1 === 18) {
    assert.ok(second, 'Stage 2 not visible after finishing stage 1');
    assert.equal(Number(second[1]), n2, 'Stage 2 count differs from FINISH_2');
  } else assert.equal(second, null, 'Stage 2 visible before stage 1 completion');
  const json = /<script id="pult-data" type="application\/json">([\s\S]*?)<\/script>/.exec(page)?.[1];
  assert.ok(json, 'No independent data for comparison');
  const meta = JSON.parse(json);
  assert.equal(meta.stage1, n1, 'Wrong stage 1 metadata');
  assert.equal(meta.stage2, n2, 'Wrong stage 2 metadata');
  const storefrontGames = independentStorefront(storefront);
  const cards = playCards(page);
  assert.equal(cards.length, meta.games.length, 'Card count differs from build data');
  const visible = visibleText(page);
  assert.doesNotMatch(visible, /\b(?:commit|PR|workflow)\b/i, 'Technical terms visible');
  assert.doesNotMatch(visible, /\b[0-9a-f]{7,40}\b/i, 'Commit hash visible');
  assert.doesNotMatch(visible, /(?:scripts\/|games\/|meta-games\/|\.mjs\b|\.html\b|\.github\/)/i, 'File paths visible');
  const local = await localServer(ROOT);
  try {
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i], entry = meta.games[i];
      assert.ok(storefrontGames.has(card.path), 'Game not in storefront: ' + card.path);
      assert.equal(card.title, storefrontGames.get(card.path), 'Game title differs from storefront');
      assert.equal(card.path, entry.path, 'Game path hidden in the card differs from source');
      assert.equal(card.kind, entry.kind, 'Game type differs from source');
      assert.equal(card.href.replace(/&amp;/g, '&'), entry.url, 'Play link differs from source');
      if (card.kind === 'main') {
        assert.equal(card.href, '../../' + card.path + '/', 'Main game link wrong');
        await request200('http://127.0.0.1:' + local.port + '/' + card.path + '/');
      } else if (card.kind === 'preview') {
        assert.match(entry.branch || '', /^lab\/[a-zA-Z0-9._/-]+$/, 'Invalid preview branch');
        const branchName = entry.branch.slice(4).replace(/\//g, '-');
        const verifiedUrl = SITE + '/preview/' + branchName + '/' + card.path + '/';
        assert.equal(card.href, verifiedUrl, 'Preview URL not from game and branch');
        await request200(verifiedUrl);
      } else assert.fail('Unexpected game kind: ' + card.kind);
    }
  } finally { await new Promise(resolve => local.server.close(resolve)); }
  console.log('PULT_VERIFY_PASS ' + n1 + '/18; stage2=' + n2 + '/10; verified play links=' + cards.length);
}
main().catch(error => { console.error('PULT_VERIFY_FAIL ' + (error.stack || error)); process.exitCode = 1; });

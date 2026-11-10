// B1/1: browser-open smoke test for every game returned by the real MCP list_games.
// Deliberately independent of the protected META BOT core and game strategies.
import assert from 'node:assert/strict';
import {readFileSync, mkdtempSync, rmSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import readline from 'node:readline';
import {chromium} from 'playwright';
import {serve} from '../meta-bot/server.mjs';

const options = process.argv.slice(2);
function option(name, fallback) {
  const i = options.indexOf(name);
  if (i < 0) return fallback;
  assert.ok(options[i + 1] && !options[i + 1].startsWith('--'), name + ' requires a value');
  return options[i + 1];
}
const root = resolve(option('--root', fileURLToPath(new URL('../../', import.meta.url))));
const settleMs = Number(option('--settle-ms', '3500'));
const viewport = option('--viewport', 'both');
assert.ok(Number.isInteger(settleMs) && settleMs >= 100 && settleMs <= 15000, 'Invalid settle time');
assert.ok(['both', 'desktop', 'mobile'].includes(viewport), 'Invalid viewport');
const viewports = viewport === 'both' ? ['desktop', 'mobile'] : [viewport];

function storefrontGames() {
  const html = readFileSync(join(root, 'meta-games/index.html'), 'utf8');
  const games = [];
  for (const [anchor] of html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)) {
    const tag = anchor.slice(0, anchor.indexOf('>') + 1);
    const classes = /\bclass\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]?.split(/\s+/) || [];
    if (!classes.includes('game')) continue;
    const href = /\bhref\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1] || '';
    const title = /<h3\b[^>]*>([^<]+)<\/h3>/i.exec(anchor)?.[1]?.trim() || '';
    assert.match(href, /^\.\.\/(?:[a-z0-9_-]+\/)+$/i, 'Invalid game card URL: ' + href);
    assert.ok(title, 'Game card has no title: ' + href);
    const path = href.slice(3, -1);
    games.push({path, id: path.split('/').at(-1), title});
  }
  assert.ok(games.length, 'The storefront contains no game cards');
  assert.equal(new Set(games.map(g => g.path)).size, games.length, 'Duplicate storefront game');
  return games;
}

async function listGames() {
  const serverFile = join(root, 'shared/approved/mcp.mjs');
  const otherCwd = mkdtempSync(join(tmpdir(), 'b1-mcp-cwd-'));
  const child = spawn(process.execPath, [serverFile], {
    cwd: otherCwd, stdio: ['pipe', 'pipe', 'pipe']
  });
  const pending = new Map();
  let nextId = 0, stderr = '';
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', s => { stderr += s; });
  const lines = readline.createInterface({input: child.stdout});
  lines.on('line', line => {
    try {
      const response = JSON.parse(line);
      const item = pending.get(response.id);
      if (item) {
        clearTimeout(item.timer);
        pending.delete(response.id);
        item.resolve(response);
      }
    } catch (error) {
      for (const item of pending.values()) item.reject(error);
      pending.clear();
    }
  });
  const stop = error => {
    for (const item of pending.values()) {
      clearTimeout(item.timer);
      item.reject(error);
    }
    pending.clear();
  };
  child.on('error', stop);
  child.on('exit', code => stop(Error('MCP exited (' + code + '): ' + stderr)));
  function ask(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++nextId;
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(Error('MCP timeout on ' + method + ': ' + stderr));
      }, 15000);
      pending.set(id, {resolve, reject, timer});
      child.stdin.write(JSON.stringify({jsonrpc: '2.0', id, method, params}) + '\n');
    });
  }
  try {
    const init = await ask('initialize', {
      protocolVersion: '2025-03-26', capabilities: {},
      clientInfo: {name: 'b1-open-all', version: '1.0'}
    });
    assert.ok(init.result, 'MCP initialize failed');
    const response = await ask('tools/call', {name: 'list_games', arguments: {}});
    assert.ok(response.result?.content, 'MCP list_games failed: ' + JSON.stringify(response.error));
    const text = response.result.content.find(part => part.type === 'text')?.text;
    const games = JSON.parse(text || 'null');
    assert.ok(Array.isArray(games), 'MCP list_games did not return an array');
    return games;
  } finally {
    child.stdin.end();
    child.kill();
    lines.close();
    rmSync(otherCwd, {recursive: true, force: true});
  }
}

function validateCatalog(actual, expected) {
  assert.equal(actual.length, expected.length, 'MCP list_games is missing/adding storefront games');
  const found = new Map(actual.map(g => [g.path, g]));
  assert.equal(found.size, actual.length, 'Duplicate MCP game paths');
  for (const game of expected) {
    const g = found.get(game.path);
    assert.ok(g, 'MCP missing storefront game: ' + game.path);
    assert.equal(g.id, game.id, 'MCP game ID differs: ' + game.path);
    assert.equal(g.title, game.title, 'MCP title differs: ' + game.path);
    assert.ok(resolve(root, g.path).startsWith(root + sep), 'Unsafe game path: ' + g.path);
  }
}

async function main() {
  const expected = storefrontGames();
  const games = await listGames();
  validateCatalog(games, expected);
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
      '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required']
  });
  const local = await serve(root);
  const failures = [];
  let visited = 0;
  try {
    for (const mode of viewports) {
      const context = await browser.newContext(mode === 'mobile'
        ? {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}
        : {viewport: {width: 1280, height: 720}});
      try {
        for (const game of games) {
          const errors = [];
          const page = await context.newPage();
          page.on('pageerror', error => errors.push('pageerror: ' + String(error.message || error)));
          page.on('console', message => {
            if (message.type() === 'error') errors.push('console: ' + message.text());
          });
          try {
            const response = await page.goto(local.url + '/' + game.path + '/', {
              waitUntil: 'domcontentloaded', timeout: 30000
            });
            if (!response || response.status() !== 200) {
              errors.push('HTTP ' + (response?.status() ?? 'no response'));
            }
            await page.waitForTimeout(settleMs);
          } catch (error) {
            errors.push('navigation: ' + String(error.message || error));
          } finally {
            await page.close();
          }
          visited++;
          if (errors.length) failures.push(mode + ' / ' + game.path + ': ' + [...new Set(errors)].join(' | '));
          console.log((errors.length ? 'FAIL ' : 'OPEN ') + mode + ' ' + game.path);
        }
      } finally {
        await context.close();
      }
    }
  } finally {
    local.close();
    await browser.close();
  }
  assert.equal(visited, games.length * viewports.length, 'Not all catalog games were visited');
  if (failures.length) throw Error('B1_OPEN_FAIL\n' + failures.join('\n'));
  console.log('B1_OPEN_PASS ' + games.length + ' catalog games, ' + viewports.join('+') +
    ', HTTP 200, no browser console errors or uncaught exceptions');
}
main().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});

// B1 permanent mutations: fail-closed browser-opening checks, including catalog deception.
// The fixture browser emits deterministic console/pageerror/HTTP signals; the B1 workflow
// separately runs this same verifier in real Chromium against every catalog game.
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, copyFileSync, writeFileSync, rmSync, unlinkSync, readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {join, resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';

const repository = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const original = join(repository, 'scripts/platform/verify-bot-open-all.mjs');
const server = join(repository, 'scripts/meta-bot/server.mjs');
const verifierSource = readFileSync(original, 'utf8').replace(/\r\n/g, '\n');
const script = "import {EventEmitter} from 'node:events';\nimport {readFileSync} from 'node:fs';\nimport {join} from 'node:path';\nclass Page extends EventEmitter {\n  async goto(address) {\n    const pathname = decodeURIComponent(new URL(address).pathname);\n    try {\n      this.html = readFileSync(join(process.env.B1_MUTATION_ROOT, pathname, 'index.html'), 'utf8');\n      return {status: () => 200};\n    } catch {\n      this.html = '';\n      return {status: () => 404};\n    }\n  }\n  async waitForTimeout() {\n    if (this.html.includes('B1_CONSOLE_ERROR')) {\n      this.emit('console', {type: () => 'error', text: () => 'B1_CONSOLE_ERROR'});\n    }\n    if (this.html.includes('B1_PAGEERROR')) {\n      this.emit('pageerror', new Error('B1_PAGEERROR'));\n    }\n  }\n  async close() {}\n}\nclass Context {\n  async newPage() { return new Page(); }\n  async close() {}\n}\nexport const chromium = {\n  async launch() {\n    return {\n      async newContext() { return new Context(); },\n      async close() {}\n    };\n  }\n};\n";
function fakeMcp(games) {
  return "import readline from 'node:readline';\nconst games = " + JSON.stringify(games) + ";\nconst lines = readline.createInterface({input: process.stdin});\nfor await (const line of lines) {\n  const request = JSON.parse(line);\n  let result;\n  if (request.method === 'initialize') {\n    result = {protocolVersion: '2025-03-26', capabilities: {}, serverInfo: {name: 'fixture', version: '1'}};\n  } else if (request.method === 'tools/call' && request.params?.name === 'list_games') {\n    result = {content: [{type: 'text', text: JSON.stringify(games)}]};\n  } else {\n    result = {};\n  }\n  process.stdout.write(JSON.stringify({jsonrpc: '2.0', id: request.id, result}) + '\\n');\n}\n";
}

function runCase(kind, shouldPass, needle, source = verifierSource) {
  const dir = mkdtempSync(join(tmpdir(), 'b1-permanent-mutation-'));
  try {
    for (const sub of ['meta-games', 'shared/approved', 'games/alpha', 'games/beta',
      'scripts/platform', 'scripts/meta-bot', 'node_modules/playwright']) {
      mkdirSync(join(dir, sub), {recursive: true});
    }
    writeFileSync(join(dir, 'scripts/platform/verify-bot-open-all.mjs'), source);
    // Emulate the Windows cwd lock on every OS, using the real child close event.
    writeFileSync(join(dir, 'check-lifecycle.mjs'), [
      "import cp from 'node:child_process';",
      "import fs from 'node:fs';",
      "import {syncBuiltinESMExports} from 'node:module';",
      'const spawn = cp.spawn, remove = fs.rmSync;',
      'let closed = false;',
      'cp.spawn = (...args) => {',
      '  const child = spawn(...args);',
      "  child.once('close', () => { closed = true; });",
      '  return child;',
      '};',
      'fs.rmSync = (path, options) => {',
      "  if (String(path).includes('b1-mcp-cwd-') && !closed) {",
      "    throw Error('B1_CLEANUP_BEFORE_CHILD_CLOSE');",
      '  }',
      '  return remove(path, options);',
      '};',
      'syncBuiltinESMExports();',
      "await import('./scripts/platform/verify-bot-open-all.mjs');"
    ].join('\n'));
    copyFileSync(server, join(dir, 'scripts/meta-bot/server.mjs'));
    writeFileSync(join(dir, 'package.json'), '{"type":"module"}');
    writeFileSync(join(dir, 'node_modules/playwright/package.json'),
      '{"name":"playwright","type":"module","exports":"./index.js"}');
    writeFileSync(join(dir, 'node_modules/playwright/index.js'), script);
    writeFileSync(join(dir, 'meta-games/index.html'), [
      '<a class="game" href="../games/alpha/"><h3>Alpha</h3></a>',
      '<a class="game" href="../games/beta/"><h3>Beta</h3></a>'
    ].join('\n'));
    const games = ['alpha', 'beta'].map(id => ({
      id, title: id === 'alpha' ? 'Alpha' : 'Beta', path: 'games/' + id,
      url: 'https://example.invalid/games/' + id + '/'
    }));
    // Obman: plausible hardcoded list omits Beta but still returns valid data.
    const returnedGames = kind === 'hardcoded-list' ? games.slice(0, 1) : games;
    writeFileSync(join(dir, 'shared/approved/mcp.mjs'), fakeMcp(returnedGames));
    const clean = '<!doctype html><html><head><title>game</title></head><body><canvas></canvas></body></html>';
    writeFileSync(join(dir, 'games/alpha/index.html'), clean);
    writeFileSync(join(dir, 'games/beta/index.html'), clean +
      (kind === 'console-error' ? '<script>B1_CONSOLE_ERROR</script>' : '') +
      (kind === 'pageerror' ? '<script>B1_PAGEERROR</script>' : ''));
    if (kind === 'missing-entry') unlinkSync(join(dir, 'games/beta/index.html'));
    const result = spawnSync(process.execPath, [
      join(dir, 'check-lifecycle.mjs'),
      '--root', dir, '--viewport', 'desktop', '--settle-ms', '100'
    ], {
      cwd: tmpdir(),
      env: {...process.env, B1_MUTATION_ROOT: dir},
      encoding: 'utf8', timeout: 45000
    });
    if (result.error) throw result.error;
    const log = result.stdout + '\n' + result.stderr;
    assert.equal(result.status === 0, shouldPass,
      kind + ': unexpected verifier result, status=' + result.status + '\n' + log);
    assert.ok(log.includes(needle), kind + ': expected signal "' + needle + '" not found:\n' + log);
    console.log('B1_MUTATION_PASS ' + kind);
  } finally {
    rmSync(dir, {recursive: true, force: true});
  }
}

runCase('clean', true, 'B1_OPEN_PASS');
runCase('console-error', false, 'B1_CONSOLE_ERROR');
runCase('pageerror', false, 'B1_PAGEERROR');
runCase('missing-entry', false, 'HTTP 404');
runCase('hardcoded-list', false, 'MCP list_games is missing/adding storefront games');
for (const [name, replacement] of [
  ['cleanup-without-wait', 'void closed;'],
  ['cleanup-waits-only-a-microtask', 'await Promise.resolve();'],
  ['cleanup-pending-count-deception', 'if (pending.size === 11) await closed;']
]) {
  assert.ok(verifierSource.includes('await closed;'), 'Child close wait target missing');
  const mutant = verifierSource.replace('await closed;', replacement);
  runCase(name, false, 'B1_CLEANUP_BEFORE_CHILD_CLOSE', mutant);
}
console.log('B1_MUTATIONS_PASS 7 negative scenarios including catalog and cleanup deception');

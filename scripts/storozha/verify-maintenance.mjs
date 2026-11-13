import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

export const maintenanceSource = () => readFileSync(new URL('./weekly-watch.mjs', import.meta.url), 'utf8');
let serial = 0;
export async function verifyMaintenance(source = maintenanceSource()) {
  const now = Date.parse('2026-11-14T02:00:00Z'); // Daily-report branch is separately covered.
  const old = new Date(now - 80 * 3600000).toISOString();
  for (const date of [old, undefined, 'invalid', new Date(now + 3600000).toISOString()]) {
    const requests = [];
    let document = '# manual\n';
    let collision = true;
    const savedFetch = globalThis.fetch, savedNow = Date.now;
    const names = ['STOROZHA_REPO', 'STOROZHA_TOKEN', 'STOROZHA_MODE'];
    const savedEnv = Object.fromEntries(names.map(name => [name, process.env[name]]));
    Object.assign(process.env, {STOROZHA_REPO: 'mpaykin1/meta6-lab',
      STOROZHA_TOKEN: 'fixture-credential', STOROZHA_MODE: 'maintenance'});
    Date.now = () => now;
    globalThis.fetch = async (url, options = {}) => {
      const path = new URL(url).pathname;
      const method = options.method || 'GET';
      const body = options.body ? JSON.parse(options.body) : undefined;
      requests.push({path, method, body});
      let result;
      if (path === '/graphql') result = {data: {repository: {pullRequests: {
        pageInfo: {hasNextPage: false}, nodes: [{number: 37, url: 'https://github.com/pr/37',
          createdAt: old, mergeable: 'MERGEABLE', headRefName: 'lab/stale', headRefOid: 'head',
          headRepository: {nameWithOwner: 'mpaykin1/meta6-lab'},
          commits: {nodes: [{commit: {committedDate: old}}]}}]
      }}}};
      else if (path.endsWith('/contents/DLYA_CLAUDE.md')) {
        if (method === 'PUT') {
          if (collision) {
            collision = false;
            document += 'external note\n';
            return new Response(JSON.stringify({message: 'main moved'}), {status: 409});
          }
          document = Buffer.from(body.content, 'base64').toString('utf8');
          result = {};
        } else result = {sha: 'blob', content: Buffer.from(document).toString('base64')};
      } else if (path.endsWith('/pulls/37') && method === 'GET') {
        result = {state: 'open', head: {sha: 'head'}};
      } else if (path.endsWith('/commits/head')) result = {commit: {committer: {date}}};
      else if (path.endsWith('/issues/37/comments')) result = {};
      else if (path.endsWith('/pulls/37') && method === 'PATCH') result = {};
      else if (method === 'DELETE') result = {}; // Record unwanted deletion, then assert below.
      else throw Error('Unexpected maintenance request: ' + method + ' ' + path);
      return new Response(JSON.stringify(result), {status: 200});
    };
    try {
      const absolute = source.replace(/from '(\.\/[^']+)'/g,
        (_, path) => "from '" + new URL(path, import.meta.url).href + "'");
      await import('data:text/javascript;base64,' +
        Buffer.from(absolute + '\n// scenario ' + (++serial)).toString('base64'));
    } finally {
      globalThis.fetch = savedFetch;
      Date.now = savedNow;
      for (const name of names) {
        if (savedEnv[name] === undefined) delete process.env[name];
        else process.env[name] = savedEnv[name];
      }
    }
    const closing = requests.filter(r => r.method === 'PATCH' && r.body?.state === 'closed');
    assert.equal(closing.length, date === old ? 1 : 0, 'Only a valid fresh 72h+ date authorizes close');
    assert.ok(document.includes('| #37 |'), 'Queue is persisted before any closure');
    assert.equal((document.match(/\| #37 \|/g) || []).length, 1, 'Retry keeps one queue row');
    assert.ok(document.includes('manual') && document.includes('external note'), 'Retry preserves concurrent text');
    assert.ok(!requests.some(r => r.method === 'DELETE'), 'Branch is never deleted');
    if (closing.length) {
      const write = requests.findIndex(r => r.method === 'PUT');
      const close = requests.findIndex(r => r.method === 'PATCH');
      assert.ok(write >= 0 && write < close, 'Persist queue before closing');
      assert.equal(requests.find(r => r.path.endsWith('/comments')).body.body,
        'закрыт сторожем как заброшенный, ветка сохранена');
    }
  }
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await verifyMaintenance();
  console.log('STOROZHA_MAINTENANCE_PASS real runner requests, dates, main retry, preserved branch');
}

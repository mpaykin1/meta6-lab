import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const { baseUrl, indexNowKey: key } =
  JSON.parse(fs.readFileSync('claude-games/seo-config.json', 'utf8'));
const base = new URL(baseUrl);
const keyLocation = new URL(key + '.txt', base).href;
if (!/^[0-9a-f]{32}$/.test(key)) throw Error('Invalid IndexNow key');
if (fs.readFileSync('claude-games/' + key + '.txt', 'utf8').trim() !== key) {
  throw Error('IndexNow key file does not match configuration');
}
const host = base.host;
let files;
try {
  files = execFileSync('git', ['diff', '--name-only', 'HEAD^', 'HEAD', '--', 'claude-games/'],
    { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
} catch (error) {
  throw new Error('Cannot determine changed pages from HEAD^: ' + error.message);
}
const urls = new Set();
for (const file of files) {
  if (!fs.existsSync(file)) continue;
  if (file === 'claude-games/index.html') urls.add(base.href);
  if (file === 'claude-games/lore.html') urls.add(base.href + 'lore.html');
  const match = file.match(/^claude-games\/(games|genres)\/([a-z0-9-]+)\/index\.html$/);
  if (match) urls.add(base.href + match[1] + '/' + match[2] + '/');
}
if (!urls.size) {
  console.log('IndexNow: no changed live catalogue URLs; skipped.');
  process.exit(0);
}
const urlList = [...urls].sort();
if (urlList.some(url => new URL(url).host !== host || !url.startsWith(base.href))) {
  throw Error('Unsafe IndexNow URL');
}
const payload = { host, key, keyLocation, urlList };
const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload), signal: AbortSignal.timeout(20000)
});
console.log('IndexNow status:', response.status, 'URLs:', urlList.length);
if (response.status !== 200 && response.status !== 202) {
  const detail = (await response.text()).slice(0, 400);
  throw new Error('IndexNow rejected submission: ' + response.status + ' ' + detail);
}

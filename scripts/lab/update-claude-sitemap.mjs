import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const target = process.argv[2] || '_site/claude-games';
const config = JSON.parse(fs.readFileSync('claude-games/seo-config.json', 'utf8'));
const base = config.baseUrl;
if (!/^https:\/\/[a-z0-9.-]+\/[a-z0-9/_-]+\/$/i.test(base)) throw Error('Invalid base URL');
const list = [{ relative: '', source: 'claude-games/index.html' },
  { relative: 'lore.html', source: 'claude-games/lore.html' }];
for (const category of ['games', 'genres']) {
  const folder = path.join(target, category);
  if (!fs.existsSync(folder)) continue;
  for (const item of fs.readdirSync(folder, { withFileTypes: true })) {
    if (!item.isDirectory() || !/^[a-z0-9-]+$/.test(item.name)) continue;
    const relative = category + '/' + item.name + '/';
    list.push({ relative, source: 'claude-games/' + relative + 'index.html' });
  }
}
const escape = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const entries = [];
for (const page of list) {
  if (!fs.existsSync(path.join(target, page.relative, page.relative.endsWith('/') || !page.relative
    ? 'index.html' : ''))) {
    continue;
  }
  let date = '';
  try {
    date = execFileSync('git', ['log', '-1', '--format=%cs', '--', page.source],
      { encoding: 'utf8' }).trim();
  } catch (error) {
    throw new Error('Cannot read git history for ' + page.source + ': ' + error.message);
  }
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw Error('Invalid lastmod: ' + date);
  entries.push('  <url><loc>' + escape(base + page.relative) + '</loc>' +
    (date ? '<lastmod>' + date + '</lastmod>' : '') + '</url>');
}
const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  entries.join('\n') + '\n</urlset>\n';
fs.writeFileSync(path.join(target, 'sitemap.xml'), xml);
console.log('Sitemap generated with git lastmod for', entries.length, 'existing pages.');

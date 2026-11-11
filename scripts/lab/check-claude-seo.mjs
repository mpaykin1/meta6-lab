import fs from 'node:fs';
import path from 'node:path';

const base = 'https://mpaykin1.github.io/meta6-lab/claude-games/';
const root = path.resolve('claude-games');
const meta = (html, name) => {
  const re = new RegExp('<meta\\b[^>]*\\b(?:name|property)="' + name + '"[^>]*>', 'gi');
  return [...html.matchAll(re)].map(m => m[0].match(/\bcontent="([^"]*)"/i)?.[1] || '');
};
export function inspect(html, page) {
  const errors = [];
  const one = (items, label) => {
    if (items.length !== 1) errors.push(page + ': expected exactly one ' + label);
    return items[0] || '';
  };
  const titles = [...html.matchAll(/<title>([^<]*)<\/title>/gi)].map(x => x[1]);
  const title = one(titles, 'title');
  if (!title || title.length > 60) errors.push(page + ': title must be 1–60 characters');
  const description = one(meta(html, 'description'), 'meta description');
  if (description.length < 120 || description.length > 160) {
    errors.push(page + ': description must be 120–160 characters');
  }
  const canonical = one([...html.matchAll(/<link\b[^>]*\brel="canonical"[^>]*>/gi)]
    .map(x => x[0].match(/\bhref="([^"]*)"/i)?.[1] || ''), 'canonical');
  const expected = base + page;
  if (canonical !== expected) errors.push(page + ': canonical must use permanent URL');
  if (one(meta(html, 'og:url'), 'og:url') !== expected) {
    errors.push(page + ': og:url must match canonical');
  }
  const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  if (!schemas.length) errors.push(page + ': missing JSON-LD');
  for (const [i, script] of schemas.entries()) {
    try {
      const doc = JSON.parse(script[1]);
      if (doc['@context'] !== 'https://schema.org') {
        errors.push(page + ': JSON-LD #' + i + ' invalid context');
      }
      const nodes = doc['@graph'] || [doc];
      if (!Array.isArray(nodes) || !nodes.length || nodes.some(n => !n['@type'])) {
        errors.push(page + ': JSON-LD #' + i + ' missing @type');
      }
    } catch {
      errors.push(page + ': JSON-LD #' + i + ' is not valid JSON');
    }
  }
  for (const img of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt="[^"]+"/i.test(img[0])) errors.push(page + ': image missing nonempty alt');
  }
  if (/rel="preconnect"\s+href="https:\/\/static\.playgama\.com"/i.test(html)) {
    errors.push(page + ': Playgama preconnect is forbidden');
  }
  return errors;
}
const pages = [{ file: 'index.html', slug: '' }, { file: 'lore.html', slug: 'lore.html' }];
for (const category of ['games', 'genres']) {
  for (const name of fs.readdirSync(path.join(root, category))) {
    if (!/^[a-z0-9-]+$/.test(name)) continue;
    const file = category + '/' + name + '/index.html';
    if (fs.existsSync(path.join(root, file))) {
      pages.push({ file, slug: category + '/' + name + '/' });
    }
  }
}
if (pages.length !== 23 || pages.filter(x => x.slug.startsWith('games/')).length !== 17) {
  throw Error('Expected exactly 17 games and 23 indexable catalogue pages');
}
const allErrors = [];
const completed = JSON.parse(fs.readFileSync('progress/seo-claude-games.json', 'utf8'))
  .steps['3_content_and_validator']?.done_pages || [];
const filePages = new Set(pages.map(p => p.slug));
for (const { file, slug } of pages) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  allErrors.push(...inspect(html, slug));
  if (!completed.includes(slug.split('/')[1])) continue;
  const article = html.match(/<section class="prose"><h2>Об игре[\s\S]*?<\/section>/i)?.[0] || '';
  const words = article.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  if (words < 150 || words > 300) allErrors.push(slug + ': text must be 150–300 words');
  const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  const faq = schemas.map(x => {
    try { return JSON.parse(x[1]); } catch { return null; }
  }).find(x => x?.['@type'] === 'FAQPage');
  if (!faq || faq.mainEntity?.length !== 3 ||
      faq.mainEntity.some(x => !x.name || !x.acceptedAnswer?.text)) {
    allErrors.push(slug + ': expected exactly three complete FAQPage questions');
  }
  if (!/<h2>Частые вопросы<\/h2>/i.test(html)) allErrors.push(slug + ': missing visible FAQ');
}
const xml = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const locations = [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map(x => x[1]);
if (locations.length !== pages.length || new Set(locations).size !== pages.length ||
    locations.some(loc => !filePages.has(loc.replace(base, '')) || !loc.startsWith(base))) {
  allErrors.push('sitemap: mismatch with 23 canonical pages');
}
if (allErrors.length) {
  for (const error of allErrors) console.error('SEO FAIL: ' + error);
  process.exitCode = 1;
} else {
  console.log('SEO PASS:', pages.length, 'indexable pages,', completed.length, 'completed long-form pages');
}

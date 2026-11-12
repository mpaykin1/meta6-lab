import fs from 'node:fs';
import path from 'node:path';

const base = JSON.parse(fs.readFileSync('claude-games/seo-config.json', 'utf8')).baseUrl;
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
  const graphNodes = [];
  const site = new URL(base);
  const siteOrigin = site.origin;
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
      if (Array.isArray(nodes)) graphNodes.push(...nodes);
    } catch {
      errors.push(page + ': JSON-LD #' + i + ' is not valid JSON');
    }
  }
  if (page.startsWith('games/')) {
    const gameNodes = graphNodes.filter(n => n?.['@type'] === 'VideoGame');
    if (gameNodes.length !== 1) {
      errors.push(page + ': expected exactly one VideoGame object');
    } else {
      const game = gameNodes[0];
      if (typeof game.name !== 'string' || !game.name.trim()) {
        errors.push(page + ': VideoGame object must have a real name');
      }
      if (game.url !== expected) {
        errors.push(page + ': VideoGame url must match canonical');
      }
      if (typeof game.description !== 'string' || !game.description.trim()) {
        errors.push(page + ': VideoGame description is required');
      }
      if (typeof game.image !== 'string' || !game.image.startsWith('https://')) {
        errors.push(page + ': VideoGame needs an HTTPS cover image');
      }
      if (game.isAccessibleForFree !== true || !game.gamePlatform) {
        errors.push(page + ': VideoGame must state free access and platform');
      }
      const play = game.potentialAction;
      if (play?.['@type'] !== 'PlayAction' ||
          typeof play.target !== 'string' ||
          !play.target.startsWith(siteOrigin + '/meta6-lab/')) {
        errors.push(page + ': VideoGame must link to an actual META GAMES launch target');
      } else {
        // An internal-looking PlayAction is not necessarily a playable page.
        // Verify its exact source path exists before sending it to Pages.
        const pathname = new URL(play.target).pathname.slice('/meta6-lab/'.length);
        let relative;
        try { relative = decodeURIComponent(pathname); }
        catch { errors.push(page + ': PlayAction has malformed encoded path'); }
        if (relative !== undefined) {
          const projectRoot = path.resolve('.');
          const entry = path.resolve(projectRoot, relative,
            relative.endsWith('/') ? 'index.html' : '');
          if (!entry.startsWith(projectRoot + path.sep) ||
              !fs.existsSync(entry) || !fs.statSync(entry).isFile()) {
            errors.push(page + ': PlayAction target is missing from this build');
          }
        }
      }
    }
  }
  // Resolve images using the same paths as the deployed GitHub Pages site.
  // External images are checked separately after real screenshots are available.
  const inspectLocalImage = (address, label) => {
    if (!address) {
      errors.push(page + ': ' + label + ' has no src');
      return;
    }
    let url;
    try { url = new URL(address, expected); }
    catch { errors.push(page + ': invalid ' + label + ' URL ' + address); return; }
    if (url.origin !== site.origin || !url.pathname.startsWith(site.pathname)) return;
    let relative;
    try { relative = decodeURIComponent(url.pathname.slice(site.pathname.length)); }
    catch { errors.push(page + ': malformed encoded ' + label + ' URL'); return; }
    const local = path.resolve(root, relative);
    if (!local.startsWith(root + path.sep) || !fs.existsSync(local) ||
        !fs.statSync(local).isFile()) {
      errors.push(page + ': missing local ' + label + ' ' + address);
    }
  };
  for (const img of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt="[^"]+"/i.test(img[0])) errors.push(page + ': image missing nonempty alt');
    const src = img[0].match(/\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
    inspectLocalImage(src?.[1] ?? src?.[2] ?? '', 'image');
  }
  for (const cover of meta(html, 'og:image')) inspectLocalImage(cover, 'og:image');
  for (const cover of meta(html, 'twitter:image')) inspectLocalImage(cover, 'twitter:image');
  // Validate link attributes regardless of order, quoting style or rel token order.
  for (const [tag] of html.matchAll(/<link\b[^>]*>/gi)) {
    const rel = tag.match(/\brel\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const href = tag.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const relValue = (rel?.[1] ?? rel?.[2] ?? rel?.[3] ?? '').toLowerCase();
    if (!relValue.split(/\s+/).includes('preconnect')) continue;
    const target = href?.[1] ?? href?.[2] ?? href?.[3];
    if (!target) continue;
    try {
      if (new URL(target, expected).hostname === 'static.playgama.com') {
        errors.push(page + ': Playgama preconnect is forbidden');
      }
    } catch {
      errors.push(page + ': invalid preconnect URL');
    }
  }
  // Catch broken links to pages and files within the catalogue before publishing.
  for (const match of html.matchAll(/<a\b[^>]*\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
    const href = match[1] ?? match[2];
    if (!href || href.startsWith('#')) continue;
    let target;
    try { target = new URL(href, expected); }
    catch { errors.push(page + ': invalid link URL ' + href); continue; }
    if (target.origin !== site.origin || !target.pathname.startsWith(site.pathname)) continue;
    let relative;
    try { relative = decodeURIComponent(target.pathname.slice(site.pathname.length)); }
    catch { errors.push(page + ': malformed encoded URL ' + href); continue; }
    const local = path.resolve(root, relative, !relative || relative.endsWith('/') ? 'index.html' : '');
    if (!local.startsWith(root + path.sep) || !fs.existsSync(local) || !fs.statSync(local).isFile()) {
      errors.push(page + ': broken catalogue link ' + href);
    }
  }
  // Game links must not silently leave the ad-free catalogue for an ad-supported host.
  const compact = html.replace(/[\r\n\t]/g, '');
  if (/playgama\.ai\/play\//i.test(compact)) {
    errors.push(page + ': external Playgama game link is forbidden in ad-free catalogue');
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

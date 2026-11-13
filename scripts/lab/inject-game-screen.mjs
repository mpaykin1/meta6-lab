import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve, join, relative, sep } from 'node:path';

// Inject into published game pages only; approved game source files remain unchanged.
const repository = resolve(import.meta.dirname, '../..');
const site = resolve(process.argv[2] || '_site');
const css = readFileSync(join(repository, 'shared/mobile-screen-lock.css'), 'utf8');
const js = readFileSync(join(repository, 'shared/mobile-screen-lock.js'), 'utf8');
const marker = 'meta-games-fixed-mobile-screen';
const excluded = new Set([
  'meta-games', 'claude-games', 'playgama-catalog', 'docs', 'reports',
  'rules', 'scripts', 'shared', 'automation', 'assets', 'platforms',
  'node_modules', '.github', '_site'
]);
const gameRoots = new Set(['games', 'playgama-games', 'meta-games-worlds', 'reference', 'abyss-glow']);

// Resolve playable world roots from the storefront, not a duplicate game list.
const storefrontFile = join(site, 'meta-games/index.html');
if (existsSync(storefrontFile)) {
  const storefront = readFileSync(storefrontFile, 'utf8');
  for (const match of storefront.matchAll(/<a\b[^>]*class=["'][^"']*\bgame\b[^"']*["'][^>]*>/gi)) {
    const href = /\bhref=["']([^"']+)["']/i.exec(match[0])?.[1];
    if (!href || !href.startsWith('../')) continue;
    const root = href.replace(/^\.\.\//, '').split('/')[0];
    if (/^[a-z0-9-]+$/i.test(root)) gameRoots.add(root);
  }
}

const styles = '<style id="' + marker + '-css">\n' + css + '\n</style>';
const runtime = '<script id="' + marker + '-js">\n' + js + '\n</script>';
const injection = styles + '\n' + runtime + '\n';
const gameSignature = /<canvas\b|createElement\s*\(\s*['"]canvas['"]|WebGLRenderer|getContext\s*\(\s*['"](?:webgl|2d)|<script\b[^>]+src=/i;
let changed = 0;
let candidates = 0;

function sourceParts(path) {
  const parts = relative(site, path).split(sep);
  if (parts[0] === 'preview' && parts.length >= 3) return parts.slice(2);
  return parts;
}

function playable(parts, source) {
  if (parts.length < 2 || !parts.at(-1).endsWith('.html')) return false;
  const root = parts[0];
  if (excluded.has(root)) return false;
  const known = gameRoots.has(root) || /^observer-world-en-v\d+$/i.test(root);
  return (known && parts.at(-1) === 'index.html') ||
    (known && gameSignature.test(source)) ||
    (gameSignature.test(source) && /(?:game|island|world|abyss|ash|sumerek|archipel|fog)/i.test(root));
}

function inject(path) {
  let html = readFileSync(path, 'utf8');
  const parts = sourceParts(path);
  if (!playable(parts, html)) return;
  candidates++;
  if (html.includes('id="' + marker + '-js"')) return;
  if (!/<\/head\s*>/i.test(html)) return;
  html = html.replace(/<\/head\s*>/i, injection + '</head>');
  writeFileSync(path, html);
  changed++;
}

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolute = join(directory, entry.name);
    const parts = sourceParts(absolute);
    if (entry.isDirectory()) {
      if (excluded.has(parts[0])) continue;
      walk(absolute);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      const first = parts[0];
      if (gameRoots.has(first) || /^observer-world-en-v\d+$/i.test(first) ||
          /(?:game|island|world|abyss|ash|sumerek|archipel|fog)/i.test(first)) inject(absolute);
    }
  }
}

if (!existsSync(site)) throw new Error('Missing site directory: ' + site);
walk(site);
console.log('META MOBILE FIX: ' + changed + ' game pages updated (' + candidates + ' eligible)');

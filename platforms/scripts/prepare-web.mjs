import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, '..');
const repoRoot = path.resolve(projectRoot, '..');
const outputRoot = path.join(projectRoot, 'dist', 'www');
const channel = process.argv[2] || 'web';

if (!['web', 'steam', 'google-play'].includes(channel)) {
  throw new Error('Unsupported channel: ' + channel);
}

const indexPath = path.join(repoRoot, 'meta-games', 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');
const matches = [...html.matchAll(/<a\b[^>]*class=["'][^"']*\bgame\b[^"']*["'][^>]*href=["']([^"']+)["']/gi)];
if (matches.length === 0) {
  throw new Error('No game links discovered in meta-games/index.html');
}

const entryDirs = new Set();
for (const [, href] of matches) {
  const url = new URL(href, 'https://metagames.invalid/meta-games/index.html');
  if (url.origin !== 'https://metagames.invalid') {
    throw new Error('External game link cannot be bundled: ' + href);
  }
  const rel = decodeURIComponent(url.pathname).replace(/^\//, '').replace(/\/$/, '');
  const dir = path.resolve(repoRoot, rel);
  if (dir === repoRoot || !dir.startsWith(repoRoot + path.sep)) {
    throw new Error('Invalid game directory: ' + href);
  }
  if (!fs.statSync(dir).isDirectory() || !fs.existsSync(path.join(dir, 'index.html'))) {
    throw new Error('Missing game index: ' + href);
  }
  entryDirs.add(rel);
}

// The catalog is bundled verbatim; we do not fork, regenerate or edit any accepted game.
const includes = new Set(['meta-games', 'meta-games-worlds', 'audio', 'shared']);
for (const entry of entryDirs) includes.add(entry);
const excludedNames = new Set([
  '.git', '.github', 'node_modules', '__pycache__', 'tests',
  'test', 'evidence', 'docs', 'work-notes', '.DS_Store'
]);
const excludedExt = new Set(['.md', '.py', '.ps1', '.bat', '.sh', '.log']);
const filter = (src) => {
  const parts = path.relative(repoRoot, src).split(path.sep);
  if (parts.some((part) => excludedNames.has(part))) return false;
  if (fs.lstatSync(src).isSymbolicLink()) return false;
  if (fs.statSync(src).isFile() && excludedExt.has(path.extname(src).toLowerCase())) return false;
  return true;
};

fs.rmSync(outputRoot, { recursive: true, force: true });
fs.mkdirSync(outputRoot, { recursive: true });
for (const rel of [...includes].sort()) {
  const source = path.join(repoRoot, rel);
  if (!fs.existsSync(source)) continue;
  const destination = path.join(outputRoot, rel);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(source, destination, { recursive: true, filter });
}

const bundledIndex = path.join(outputRoot, 'meta-games', 'index.html');
let bundledHtml = fs.readFileSync(bundledIndex, 'utf8');
// The Playgama catalog is an external storefront, not a game to launch inside a native app.
if (channel !== 'web') {
  bundledHtml = bundledHtml
    .replaceAll('href="../playgama-catalog/"', 'href="#worlds"')
    .replaceAll('Explore full catalog', 'Explore worlds')
    .replaceAll('Full catalog', 'Worlds');
}
fs.writeFileSync(bundledIndex, bundledHtml);

fs.writeFileSync(path.join(outputRoot, 'index.html'), [
  '<!doctype html><html><head><meta charset="utf-8">',
  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">',
  '<meta name="theme-color" content="#050a12"></head>',
  '<body style="margin:0;background:#050a12">',
  '<script>location.replace("./meta-games/index.html");<\/script>',
  '</body></html>'
].join(''));

fs.writeFileSync(path.join(outputRoot, 'channel.json'), JSON.stringify({
  channel,
  adsEnabled: false,
  games: [...entryDirs].sort()
}, null, 2) + '\n');

console.log('META GAMES ' + channel + ': packaged ' + entryDirs.size + ' games in ' + outputRoot);

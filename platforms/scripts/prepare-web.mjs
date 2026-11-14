import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCatalog } from './build-catalog.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, '..');
const repoRoot = path.resolve(projectRoot, '..');
const outputRoot = path.join(projectRoot, 'dist', 'www');
const channel = process.argv[2] || 'web';
const candidate = process.argv.includes('--candidate');
const releaseRequested = process.argv.includes('--release');
if (candidate && releaseRequested) throw Error('Candidate and release options are mutually exclusive');

if (!['web', 'steam', 'google-play'].includes(channel)) {
  throw new Error('Unsupported channel: ' + channel);
}
if (candidate && channel === 'web') {
  throw new Error('Candidate mode is for native previews only');
}

const catalog = buildCatalog();
const selected = catalog.games.filter((game) => {
  if (channel === 'web' || candidate) return true;
  const eligible = channel === 'steam' ? game.steamEligible : game.androidEligible;
  return eligible && game.rightsStatus === 'approved' && game.botStatus === 'pass';
});
if (!selected.length) {
  throw new Error('No independently eligible ' + channel +
    ' games. Native store release blocked; use --candidate for local evaluation only.');
}

const includedDirs = new Set(selected.map((game) => path.posix.dirname(game.entry)));
const includes = new Set(['meta-games', 'meta-games-worlds', 'audio', 'shared', ...includedDirs]);
const excludedNames = new Set([
  '.git', '.github', 'node_modules', '__pycache__', 'tests',
  'test', 'evidence', 'docs', 'work-notes', '.DS_Store'
]);
const excludedExt = new Set(['.md', '.py', '.ps1', '.bat', '.sh', '.log']);
function filter(source) {
  const parts = path.relative(repoRoot, source).split(path.sep);
  if (parts.some((part) => excludedNames.has(part))) return false;
  if (fs.lstatSync(source).isSymbolicLink()) return false;
  return !(fs.statSync(source).isFile() &&
    excludedExt.has(path.extname(source).toLowerCase()));
}

fs.rmSync(outputRoot, { recursive: true, force: true });
fs.mkdirSync(outputRoot, { recursive: true });
for (const relative of [...includes].sort()) {
  const source = path.resolve(repoRoot, relative);
  if (!source.startsWith(repoRoot + path.sep)) throw new Error('Unsafe source: ' + relative);
  if (!fs.existsSync(source)) {
    if (includedDirs.has(relative)) throw new Error('Missing game: ' + relative);
    continue;
  }
  const destination = path.join(outputRoot, relative);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(source, destination, { recursive: true, filter });
}

// Packaged copies are isolated from the canonical accepted games.
if (channel !== 'web') {
  const platform = channel === 'google-play' ? 'android' : 'steam';
  const runtime = 'window.META_GAMES_NATIVE = Object.freeze(' +
    JSON.stringify({ platform, adsEnabled: false, candidate }) + ');\n';
  fs.writeFileSync(path.join(outputRoot, '_meta_native.js'), runtime);

  for (const game of selected) {
    const file = path.join(outputRoot, game.entry);
    const relativeRuntime = path.posix.relative(path.posix.dirname(game.entry), '_meta_native.js');
    let html = fs.readFileSync(file, 'utf8');
    if (!/<head(?:\s[^>]*)?>/i.test(html)) {
      throw new Error('Game lacks HTML head for native bootstrap: ' + game.entry);
    }
    html = html.replace(/<head(?:\s[^>]*)?>/i,
      (head) => head + '\n<script src="' + relativeRuntime + '"></script>');
    fs.writeFileSync(file, html);

    // Disable Playgama advertising in packaged copies; web originals stay unchanged.
    const bridgeConfig = path.join(outputRoot, path.posix.dirname(game.entry),
      'playgama-bridge-config.json');
    if (fs.existsSync(bridgeConfig)) {
      const config = JSON.parse(fs.readFileSync(bridgeConfig, 'utf8'));
      config.sendAnalyticsEvents = false;
      config.advertisement = {
        ...config.advertisement,
        banner: { ...config.advertisement?.banner, disable: true },
        interstitial: { ...config.advertisement?.interstitial, disable: true },
        rewarded: { ...config.advertisement?.rewarded, disable: true }
      };
      fs.writeFileSync(bridgeConfig, JSON.stringify(config, null, 2) + '\n');
    }
  }
}

const indexPath = path.join(outputRoot, 'meta-games', 'index.html');
let index = fs.readFileSync(indexPath, 'utf8');
if (channel !== 'web') {
  index = index.replaceAll('href="../playgama-catalog/"', 'href="#worlds"')
    .replaceAll('Explore full catalog', 'Explore worlds')
    .replaceAll('Full catalog', 'Worlds');
  index = index.replace(/<a\b[^>]*\bclass=["']game["'][^>]*>[\s\S]*?<\/a>/gi,
    (card) => {
      const href = /\bhref=["']([^"']+)["']/.exec(card)?.[1];
      if (!href) throw new Error('Native game card has no href');
      const url = new URL(href, 'https://meta-games.invalid/meta-games/index.html');
      const relative = decodeURIComponent(url.pathname).replace(/^\/+|\/+$/g, '');
      return includedDirs.has(relative) ? card : '';
    });
  index = index.replace(/Ten self-hosted game entrypoints\./,
    selected.length + ' self-hosted game entrypoints.');
}
fs.writeFileSync(indexPath, index);

fs.writeFileSync(path.join(outputRoot, 'index.html'), [
  '<!doctype html><html><head><meta charset="utf-8">',
  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">',
  '<meta name="theme-color" content="#050a12"></head>',
  '<body style="margin:0;background:#050a12">',
  '<script>location.replace("./meta-games/index.html");<\/script>',
  '</body></html>'
].join(''));

fs.writeFileSync(path.join(outputRoot, 'catalog.json'), JSON.stringify({
  ...catalog, games: selected
}, null, 2) + '\n');
fs.writeFileSync(path.join(outputRoot, 'channel.json'), JSON.stringify({
  channel, candidate, adsEnabled: false, games: selected.map((game) => game.id)
}, null, 2) + '\n');
console.log('META GAMES ' + channel + (candidate ? ' candidate' : ' release') +
  ': packaged ' + selected.length + ' games in ' + outputRoot);

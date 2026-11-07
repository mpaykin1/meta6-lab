import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(projectRoot, '..');
const output = path.join(projectRoot, 'catalog.json');
const portal = path.join(repoRoot, 'meta-games', 'index.html');

function attribute(tag, name) {
  const re = new RegExp('\\b' + name + '\\s*=\\s*(["\\x27])(.*?)\\1', 'i');
  return re.exec(tag)?.[2] ?? null;
}

function relativeGameDirectory(href) {
  const url = new URL(href, 'https://meta-games.invalid/meta-games/index.html');
  if (url.origin !== 'https://meta-games.invalid' || url.search || url.hash) {
    throw new Error('Game link must be a local clean URL: ' + href);
  }
  const relative = decodeURIComponent(url.pathname).replace(/^\/+|\/+$/g, '');
  const directory = path.resolve(repoRoot, relative);
  if (!relative || !directory.startsWith(repoRoot + path.sep)) {
    throw new Error('Game path leaves repository: ' + href);
  }
  let current = repoRoot;
  for (const part of path.relative(repoRoot, directory).split(path.sep)) {
    current = path.join(current, part);
    if (!fs.existsSync(current) || fs.lstatSync(current).isSymbolicLink()) {
      throw new Error('Missing or symlinked game path: ' + relative);
    }
  }
  const index = path.join(directory, 'index.html');
  if (!fs.statSync(directory).isDirectory() || !fs.existsSync(index) ||
      fs.lstatSync(index).isSymbolicLink() || !fs.statSync(index).isFile()) {
    throw new Error('Missing game index.html: ' + relative);
  }
  return relative.replaceAll(path.sep, '/');
}

// Content approvals become stale after ANY game asset, code, or configuration changes.
// SHA-256 is built from each relative file path and content, in stable lexical order.
export function contentDigest(directory) {
  const hash = createHash('sha256');
  function walk(dir, relative='') {
    const entries = fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name,'en'));
    for (const item of entries) {
      const rel = relative ? relative+'/'+item.name : item.name;
      // Match native bundle exclusion policy: dependencies and build caches never enter the app.
      if(new Set(['.git','.github','node_modules','__pycache__','tests','test','evidence','docs','work-notes','.DS_Store']).has(item.name)) continue;
      const full = path.join(dir,item.name);
      if(item.isSymbolicLink()) throw new Error('Symlinked game asset is forbidden: '+rel);
      if(item.isDirectory()) walk(full,rel);
      else if(item.isFile()) {
        const bytes=fs.readFileSync(full);
        hash.update(Buffer.from(rel+'\0'+bytes.length+'\0','utf8')).update(bytes);
      } else throw new Error('Unsupported game asset: '+rel);
    }
  }
  walk(directory);
  return hash.digest('hex');
}

export function buildCatalog() {
  const html = fs.readFileSync(portal, 'utf8');
  const previous = fs.existsSync(output) ? JSON.parse(fs.readFileSync(output, 'utf8')) : { games: [] };
  const existing = new Map((previous.games || []).map((entry) => [entry.id, entry]));
  const games = [];
  const seen = new Set();

  for (const match of html.matchAll(/<a\b[^>]*>/gi)) {
    const tag = match[0];
    if (!(attribute(tag, 'class') || '').split(/\s+/).includes('game')) continue;
    const href = attribute(tag, 'href');
    if (!href) throw new Error('Game card without href');
    const directory = relativeGameDirectory(href);
    const id = directory.replaceAll('/', '-').replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    if (seen.has(id)) throw new Error('Duplicate game ID: ' + id);
    seen.add(id);
    const entry = directory + '/index.html';
    const old = existing.get(id);
    const digest = contentDigest(path.resolve(repoRoot, directory));
    const sameSource = old?.entry === entry && old?.contentSha256 === digest;
    const rightsStatus = sameSource && old.rightsStatus === 'approved' ? 'approved' : 'unreviewed';
    const botStatus = sameSource && old.botStatus === 'pass' ? 'pass' : 'pending';
    const verified = rightsStatus === 'approved' && botStatus === 'pass';
    games.push({
      id,
      title: attribute(tag, 'aria-label')?.replace(/^Play\s+/i, '') || id,
      version: sameSource && typeof old.version === 'string' ? old.version : 'unverified',
      entry,
      contentSha256: digest,
      assetManifest: sameSource && typeof old.assetManifest === 'string' ? old.assetManifest : null,
      rightsStatus,
      botStatus,
      steamEligible: verified && old.steamEligible === true,
      androidEligible: verified && old.androidEligible === true
    });
  }

  if (!games.length) throw new Error('No local game cards found in portal');
  const catalog = { schemaVersion: 1, games };
  fs.writeFileSync(output, JSON.stringify(catalog, null, 2) + '\n');
  return catalog;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const catalog = buildCatalog();
  const store = catalog.games.filter((entry) => entry.steamEligible || entry.androidEligible);
  console.log('META GAMES catalog: ' + catalog.games.length + ' local games, ' +
    store.length + ' independently approved for a native store');
}

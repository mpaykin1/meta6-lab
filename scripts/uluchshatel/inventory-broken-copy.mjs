// Inventory is extracted from the original game's own INV.sec and LEVELS tables.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const game = fileURLToPath(new URL('../../games/broken-city-copy/index.html', import.meta.url));
export const LOADER = '<script src="./bot-observer.js"></script>';
export const ORIGINAL_BLOB = '3d203fe2500eae36eba6da65f7342dc6296328a3';

export function inventory(source = readFileSync(game, 'utf8')) {
  if (source.split(LOADER).length !== 2) throw new Error('Observer loader must occur exactly once');
  const original = source.replace('\n' + LOADER, '');
  const blob = createHash('sha1')
    .update('blob ' + Buffer.byteLength(original) + '\0' + original).digest('hex');
  if (blob !== ORIGINAL_BLOB) throw new Error('Original HTML source or assets changed');

  const secStart = original.indexOf('  sec: {');
  const secEnd = original.indexOf('\n  hist: [', secStart);
  if (secStart < 0 || secEnd < 0) throw new Error('Original INV.sec not found');
  const section = original.slice(secStart, secEnd);
  const sections = [...section.matchAll(/^    '([^']+)': \[/gm)];
  const counts = sections.map((entry, i) => {
    const segment = section.slice(entry.index, sections[i + 1]?.index ?? section.length);
    return [entry[1], [...segment.matchAll(/^      \['/gm)].length];
  });
  const gallery = original.split('const GALLERY = [')[1]?.split('\n];')[0] || '';
  const levels = original.split('const LEVELS = [')[1]?.split('\n];')[0] || '';
  const sounds = [...original.matchAll(/^  SFX\.(?!_)(\w+) = /gm)].map(x => x[1]);
  return {
    blob, counts, total: counts.reduce((sum, [, count]) => sum + count, 0),
    gallery: [...gallery.matchAll(/^  \{ n: /gm)].length,
    levels: [...levels.matchAll(/^  \{ mode: /gm)].length,
    soundDefinitions: sounds.length,
    externalAudio: [...original.matchAll(/\b[\w-]+\.(?:ogg|mp3|wav)\b/gi)].length
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(inventory(), null, 2));
}

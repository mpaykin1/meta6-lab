/** Deterministic and local *.ink -> compiled inkjs JSON; refuses unsafe paths. */
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
import { Compiler } from 'inkjs/full';

const root = resolve(import.meta.dirname, '..');
const sources = join(root, 'stories-src');
const output = join(root, 'public', 'stories');
const ID = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/;
const TAG = /^(flag|item):[A-Za-z_][A-Za-z0-9_]{0,63}$/;
const readSafe = async path => {
  const { lstat } = await import('node:fs/promises');
  const st = await lstat(path);
  if (!st.isFile() || st.isSymbolicLink() || st.size > 1_000_000) throw new Error('Invalid / oversized Ink input');
  return readFile(path, 'utf8');
};
const index = JSON.parse(await readSafe(join(sources,'story-list.json')));
if (index.schema !== 'meta-game-fusion.ink-source-list.v1' || !Array.isArray(index.stories) || index.stories.length > 100)
  throw new Error('Invalid story source list');
await mkdir(output, {recursive:true});
const result = [];
const ids = new Set();
for (const entry of index.stories) {
  const { id, source_file: file, source_sha256: pinned } = entry;
  if (!ID.test(id) || ids.has(id) || file !== `${id}.ink`) throw new Error('Invalid or duplicate Ink ID/file');
  ids.add(id);
  const ink = await readSafe(join(sources,file));
  const sha = createHash('sha256').update(Buffer.from(ink,'utf8')).digest('hex');
  if (pinned !== sha) throw new Error(`Source modified: ${id}; re-register explicitly before compiling`);
  if (!entry.exports || typeof entry.exports !== 'object' || Array.isArray(entry.exports) ||
      Object.entries(entry.exports).some(([k,v])=> !/^[A-Za-z_][A-Za-z0-9_]{0,63}$/.test(k) || !TAG.test(v)))
    throw new Error(`Invalid ink variables export map: ${id}`);
  const story = new Compiler(ink).Compile();
  if (!story) throw new Error(`Ink compiler failed: ${id}`);
  const compiledText = story.ToJson();
  const data = JSON.parse(compiledText);
  if (!data || !Number.isInteger(data.inkVersion) || !data.root) throw new Error('Invalid compiled Ink');
  const bytes = JSON.stringify(data);
  if (bytes.length > 5_000_000) throw new Error('Compiled story too large');
  await writeFile(join(output, `${id}.json`), bytes + '\n', 'utf8');
  result.push({id, title:entry.title, source_game:entry.source_game, source_sha256:sha,
    license:entry.license, approved_for_reuse:entry.approved_for_reuse === true,
    exports:entry.exports, runtime_file:`stories/${id}.json`,
    runtime_sha256:createHash('sha256').update(bytes+'\n').digest('hex')});
}
await writeFile(join(output,'manifest.json'),JSON.stringify({schema:'meta-game-fusion.ink-manifest.v1',stories:result},null,2)+'\n');
console.log(`Compiled ${result.length} Ink stories; no source games changed.`);

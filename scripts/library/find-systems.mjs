import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const EXCLUDED = /(?:^|[-\/])copy$|(?:^|\/)skin-trainer(?:\/|$)/i;
const INTENTS = [
  {tag: 'camera', match: /камер|третьего лица|от третьего лица|third.person|camera|follow|orbit/i},
  {tag: 'controls', match: /управлен|движени|джойстик|ввод|controls?|input|joystick|keyboard/i},
  {tag: 'combat', match: /бой|оружи|атак|урон|враг|combat|attack|weapon|enemy|damage/i},
  {tag: 'weather', match: /погод|туман|дожд|снег|ветер|weather|fog|rain|snow|wind/i},
  {tag: 'audio', match: /звук|музык|аудио|sound|music|audio|sfx/i},
  {tag: 'level-generation', match: /генерац|мир|ландшафт|уровн|terrain|biome|world|level|generation/i},
  {tag: 'shader', match: /шейдер|свет|освещени|glsl|shader|lighting|bloom/i},
  {tag: 'animation', match: /анимац|движени персонажа|animation|sprite|tween/i},
];
const lower = value => String(value ?? '').toLocaleLowerCase('ru');
const safePath = value => typeof value === 'string' && !!value &&
  !value.startsWith('/') && !value.includes('\\') &&
  !value.split('/').some(piece => piece === '..' || !piece);
const excludes = (game, excluded) => EXCLUDED.test(game) || excluded.has(game);
const tokensOf = query => lower(query).match(/[\p{L}\p{N}]{3,}/gu) ?? [];

export function rankSystems(index, query, {limit = 20, repositoryUrl, ref = 'main'} = {}) {
  if (typeof query !== 'string' || !query.trim()) throw Error('Non-empty intent required');
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw Error('limit 1..100');
  if (repositoryUrl !== undefined &&
      !/^https:\/\/github\.com\/[a-z\d_.-]+\/[a-z\d_.-]+\/?$/i.test(repositoryUrl)) {
    throw Error('Expected GitHub repository URL');
  }
  if (!/^[a-z\d_./-]+$/i.test(ref) || ref.includes('..')) throw Error('Invalid source ref');
  if (!index || !Array.isArray(index.entries)) throw Error('Missing indexed entries');

  const requested = INTENTS.filter(intent => intent.match.test(query)).map(intent => intent.tag);
  const words = tokensOf(query);
  const excluded = new Set((index.excluded_games ?? []).map(row =>
    typeof row === 'string' ? row : row.game).filter(Boolean));
  const eligible = new Set((index.games ?? []).filter(game =>
    !game.excluded && !excludes(game.game, excluded)).map(game => game.game));
  const scored = index.entries.map(entry => {
    if (entry.kind !== 'solution' || excludes(entry.game, excluded) ||
        (index.games && !eligible.has(entry.game)) || !safePath(entry.source_path)) return null;
    const tags = Array.isArray(entry.purpose) ? entry.purpose : [];
    const haystack = lower([entry.name, entry.source_path, ...tags].join(' '));
    const score = requested.reduce((sum, tag) =>
      sum + (tags.some(value => lower(value) === tag) ? 12 : haystack.includes(tag) ? 5 : 0), 0) +
      words.reduce((sum, word) => sum + (haystack.includes(word) ? 1 : 0), 0);
    if (score <= 0) return null;
    const lines = Array.isArray(entry.lines) && entry.lines.length === 2 ? entry.lines : null;
    const sourceLink = repositoryUrl
      ? repositoryUrl.replace(/\/$/, '') + '/blob/' + encodeURIComponent(ref) + '/' +
        entry.source_path.split('/').map(encodeURIComponent).join('/') +
        (lines ? '#L' + lines[0] + '-L' + lines[1] : '')
      : null;
    return {
      id: entry.id, game: entry.game, name: entry.name ?? '', purpose: tags,
      source_path: entry.source_path, lines, sha256: entry.sha256,
      source_link: sourceLink, verification: 'source_only', score,
    };
  }).filter(Boolean).sort((a, b) => b.score - a.score ||
    a.game.localeCompare(b.game) || a.id.localeCompare(b.id));
  const groups = new Map();
  for (const entry of scored) {
    if (!groups.has(entry.game)) groups.set(entry.game, []);
    groups.get(entry.game).push(entry);
  }
  const games = [...groups.keys()];
  const results = [];
  while (results.length < limit && games.some(game => groups.get(game).length)) {
    for (const game of games) {
      const item = groups.get(game).shift();
      if (item) results.push(item);
      if (results.length === limit) break;
    }
  }
  return {intent: query, total: scored.length, distinct_games: groups.size, results};
}

export function searchSystems(query, options = {}, root = ROOT) {
  const index = JSON.parse(fs.readFileSync(path.join(root, 'shared/library/index.json'), 'utf8'));
  return rankSystems(index, query, options);
}

const direct = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (direct) {
  try {
    const query = process.argv[2];
    const repositoryUrl = process.argv[3];
    console.log(JSON.stringify(searchSystems(query, {repositoryUrl}), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

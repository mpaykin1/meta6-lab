// META GAMES portal-only local progress. No gameplay saves or tracking network.
const KEY = 'meta-games:worlds:v1';
const LIMIT = 40;
const clean = value => typeof value === 'string' && /^[a-z0-9][a-z0-9-]{0,79}$/.test(value);
function read(storage) {
  try {
    const parsed = JSON.parse(storage.getItem(KEY) || '{}');
    if (parsed?.version !== 1 || !Array.isArray(parsed.visited)) return [];
    return [...new Set(parsed.visited.filter(clean))].slice(-LIMIT);
  } catch { return []; }
}
export function createWorldProgress(storage) {
  if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function')
    throw new TypeError('A storage interface is required');
  return Object.freeze({
    visited: () => read(storage),
    enter(id) {
      if (!clean(id)) throw new TypeError('Invalid world ID');
      const visited = [...read(storage).filter(x => x !== id), id].slice(-LIMIT);
      try { storage.setItem(KEY, JSON.stringify({ version: 1, visited })); }
      catch { /* storage may be unavailable; navigation still works */ }
      return visited;
    },
    clear() {
      try { storage.removeItem(KEY); } catch {}
    }
  });
}

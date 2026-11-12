// Fail-closed traversal of every GitHub REST page; do not trust a partial PR list.
export async function allPages(path, api) {
  if (typeof api !== 'function') throw new Error('Missing GitHub API reader');
  const results = [];
  for (let page = 1; page <= 20; page++) {
    const separator = path.includes('?') ? '&' : '?';
    const items = await api(path + separator + 'per_page=100&page=' + page);
    if (!Array.isArray(items)) throw new Error('GitHub API returned incomplete page: ' + path);
    results.push(...items);
    if (items.length < 100) return results;
  }
  throw new Error('GitHub API pagination exceeded 20 pages; no game claim permitted');
}

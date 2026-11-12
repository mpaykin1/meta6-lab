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


// A rename touches BOTH the destination and the source path. GitHub reports the
// source as previous_filename; ignoring it lets another PR occupy a moved game.
export function allChangedPaths(files) {
  if (!Array.isArray(files)) throw new Error('Incomplete GitHub changed-file list');
  const paths = [];
  for (const file of files) {
    if (!file || typeof file.filename !== 'string' || !file.filename.trim()) {
      throw new Error('Missing changed-file filename');
    }
    paths.push(file.filename);
    if (file.status === 'renamed' &&
      (typeof file.previous_filename !== 'string' || !file.previous_filename.trim())) {
      throw new Error('Renamed file has no previous_filename');
    }
    if (file.previous_filename) paths.push(file.previous_filename);
  }
  return [...new Set(paths)];
}

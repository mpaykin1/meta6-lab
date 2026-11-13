// Complete, immutable PR file snapshot without consuming the exhausted REST quota.
export async function referenceSnapshot(repo, token, number, request = fetch) {
  const [owner, name, extra] = repo.split('/');
  if (!owner || !name || extra || !Number.isSafeInteger(number) || number < 1) {
    throw Error('Invalid reference snapshot inputs');
  }
  const files = [], paths = new Set(), cursors = new Set();
  let after = null, identity;
  for (let page = 0; page < 10; page++) {
    const response = await request('https://api.github.com/graphql', {
      method: 'POST',
      headers: {Authorization: 'Bearer ' + token, 'Content-Type': 'application/json'},
      body: JSON.stringify({query: `query($owner:String!,$name:String!,$number:Int!,$after:String){
        repository(owner:$owner,name:$name){pullRequest(number:$number){
          number state baseRefName baseRefOid headRefName headRefOid changedFiles
          files(first:100,after:$after){totalCount pageInfo{hasNextPage endCursor} nodes{path changeType}}
        }}
      }`, variables: {owner, name, number, after}})
    });
    if (!response.ok) throw Error('Reference GraphQL HTTP ' + response.status);
    const json = await response.json();
    if (json.errors?.length) throw Error('Reference GraphQL errors: ' + JSON.stringify(json.errors));
    const pr = json.data?.repository?.pullRequest;
    if (!pr || pr.number !== number || pr.state !== 'OPEN' || pr.baseRefName !== 'main' ||
        !/^[a-f0-9]{40}$/.test(pr.baseRefOid) || !/^[a-f0-9]{40}$/.test(pr.headRefOid) || !pr.headRefName) {
      throw Error('Invalid reference PR identity');
    }
    const current = JSON.stringify([pr.baseRefOid, pr.headRefOid, pr.headRefName, pr.changedFiles]);
    if (identity && identity !== current) throw Error('Reference PR changed during pagination');
    identity = current;
    const connection = pr.files;
    if (!Number.isSafeInteger(pr.changedFiles) || pr.changedFiles < 0 ||
        connection?.totalCount !== pr.changedFiles || !Array.isArray(connection.nodes) ||
        typeof connection.pageInfo?.hasNextPage !== 'boolean') {
      throw Error('Incomplete reference file connection');
    }
    for (const file of connection.nodes) {
      // GraphQL omits the old name: refusing renames prevents losing a protected source path.
      const status = {ADDED: 'added', MODIFIED: 'modified', DELETED: 'removed'}[file?.changeType];
      if (!status || typeof file.path !== 'string' || !file.path || paths.has(file.path)) {
        throw Error('Unsafe or duplicate reference file');
      }
      paths.add(file.path);
      files.push({filename: file.path, status});
    }
    if (!connection.pageInfo.hasNextPage) {
      if (files.length !== pr.changedFiles) throw Error('Truncated reference file list');
      return {pr: {base: {ref: pr.baseRefName, sha: pr.baseRefOid},
        head: {ref: pr.headRefName, sha: pr.headRefOid}}, files};
    }
    after = connection.pageInfo.endCursor;
    if (!after || cursors.has(after)) throw Error('Reference file cursor did not advance');
    cursors.add(after);
  }
  throw Error('Too many PR file pages — cannot verify reference safety');
}

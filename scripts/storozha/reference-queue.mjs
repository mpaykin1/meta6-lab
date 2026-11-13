// Trusted-main queue writer. All reads and compare-and-swap commits use GraphQL.
export async function updateReferenceQueue(repo, token, transform, request = fetch) {
  if (repo !== 'mpaykin1/meta6-lab' || !token || typeof transform !== 'function') {
    throw Error('Reference queue writes are restricted to meta6-lab');
  }
  const [owner, name] = repo.split('/');
  const validOid = value => typeof value === 'string' && /^[a-f0-9]{40}$/.test(value);
  async function graphql(query, variables) {
    const response = await request('https://api.github.com/graphql', {
      method: 'POST',
      headers: {Authorization: 'Bearer ' + token, 'Content-Type': 'application/json'},
      body: JSON.stringify({query, variables})
    });
    if (!response.ok) throw Error('Reference queue GraphQL HTTP ' + response.status);
    const json = await response.json();
    if (json.errors?.length) {
      const error = Error('Reference queue GraphQL errors: ' + JSON.stringify(json.errors));
      error.headConflict = json.errors.every(item => item.type === 'STALE_DATA' ||
        /expected branch to point to|expectedHeadOid|head (?:moved|changed|mismatch)/i.test(item.message || ''));
      throw error;
    }
    if (!json.data) throw Error('Reference queue GraphQL data missing');
    return json.data;
  }
  for (let attempt = 0; attempt < 7; attempt++) {
    const branch = await graphql(`query($owner:String!,$name:String!){
      repository(owner:$owner,name:$name){ref(qualifiedName:"refs/heads/main"){target{oid}}}
    }`, {owner, name});
    const head = branch.repository?.ref?.target?.oid;
    if (!validOid(head)) throw Error('Reference queue main HEAD missing');
    const contents = await graphql(`query($owner:String!,$name:String!,$expression:String!){
      repository(owner:$owner,name:$name){object(expression:$expression){
        __typename ... on Blob{text isBinary isTruncated}
      }}
    }`, {owner, name, expression: head + ':DLYA_CLAUDE.md'});
    if (!contents.repository || !Object.hasOwn(contents.repository, 'object')) {
      throw Error('Reference queue object missing');
    }
    const blob = contents.repository.object;
    if (blob !== null && (blob.__typename !== 'Blob' || blob.isBinary !== false ||
        blob.isTruncated !== false || typeof blob.text !== 'string')) {
      throw Error('Reference queue blob is not complete text');
    }
    const before = blob === null ? '# Для Claude — только подтверждённые блокировки\n' : blob.text;
    const after = transform(before);
    if (typeof after !== 'string' || Buffer.byteLength(after) > 2 * 1024 * 1024) {
      throw Error('Invalid reference queue output');
    }
    if (before === after) return {changed: false, head};
    try {
      const result = await graphql(`mutation($input:CreateCommitOnBranchInput!){
        createCommitOnBranch(input:$input){commit{oid}}
      }`, {input: {
        branch: {repositoryNameWithOwner: repo, branchName: 'main'},
        expectedHeadOid: head,
        message: {headline: 'chore(storozha): reconcile protected PR queue'},
        fileChanges: {additions: [{path: 'DLYA_CLAUDE.md',
          contents: Buffer.from(after, 'utf8').toString('base64')}]}
      }});
      const committed = result.createCommitOnBranch?.commit?.oid;
      if (!validOid(committed)) throw Error('Reference queue commit was not confirmed');
      return {changed: true, head: committed};
    } catch (error) {
      if (!error.headConflict || attempt === 6) throw error;
    }
  }
  throw Error('Reference queue could not be committed');
}

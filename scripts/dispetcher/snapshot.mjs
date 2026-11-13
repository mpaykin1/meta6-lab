// Read open PRs and their head checks in paginated GraphQL batches, not REST per task row.
export async function loadSnapshot(repository, token, request = fetch) {
  const [owner, name, extra] = repository.split('/');
  if (!owner || !name || extra) throw Error('Invalid repository');
  const result = new Map();
  const cursors = new Set();
  let cursor = null;
  do {
    const response = await request('https://api.github.com/graphql', {
      method: 'POST',
      headers: {Authorization: 'Bearer ' + token, 'Content-Type': 'application/json'},
      body: JSON.stringify({query: `query($owner:String!,$name:String!,$cursor:String){
        repository(owner:$owner,name:$name){pullRequests(first:100,states:OPEN,after:$cursor){
          pageInfo{hasNextPage endCursor}
          nodes{number state title body headRefName headRefOid mergeable
            commits(last:1){nodes{commit{oid committedDate statusCheckRollup{
              contexts(first:100){pageInfo{hasNextPage} nodes{
                __typename ... on CheckRun{name conclusion detailsUrl}
                ... on StatusContext{context state targetUrl}
              }}
            }}}}
          }
        }}
      }`, variables: {owner, name, cursor}})
    });
    if (!response.ok) throw Error('Dispatcher GraphQL HTTP ' + response.status);
    const data = await response.json();
    if (data.errors?.length) throw Error('Dispatcher GraphQL errors: ' + JSON.stringify(data.errors));
    const page = data.data?.repository?.pullRequests;
    if (!page || !Array.isArray(page.nodes) || typeof page.pageInfo?.hasNextPage !== 'boolean') {
      throw Error('Incomplete Dispatcher GraphQL page');
    }
    for (const node of page.nodes) {
      const commit = node?.commits?.nodes?.[0]?.commit;
      if (!node || node.state !== 'OPEN' || result.has(node.number) || !node.headRefOid ||
          !['UNKNOWN', 'MERGEABLE', 'CONFLICTING'].includes(node.mergeable) ||
          commit?.oid !== node.headRefOid || !Number.isFinite(Date.parse(commit?.committedDate))) {
        throw Error('Invalid Dispatcher head snapshot');
      }
      const contexts = commit.statusCheckRollup?.contexts;
      if (contexts && (contexts.pageInfo?.hasNextPage !== false || !Array.isArray(contexts.nodes))) {
        throw Error('Dispatcher check contexts truncated; do not report a partial result');
      }
      const checks = [], statuses = [];
      for (const context of contexts?.nodes || []) {
        if (context.__typename === 'CheckRun') {
          checks.push({name: context.name, conclusion: context.conclusion?.toLowerCase(),
            html_url: context.detailsUrl});
        } else if (context.__typename === 'StatusContext') {
          statuses.push({context: context.context, state: context.state?.toLowerCase(),
            target_url: context.targetUrl});
        } else throw Error('Unknown Dispatcher check context');
      }
      result.set(node.number, {
        pr: {number: node.number, state: 'open', title: node.title, body: node.body,
          head: {sha: node.headRefOid, ref: node.headRefName},
          mergeable: node.mergeable === 'UNKNOWN' ? null : node.mergeable === 'MERGEABLE',
          mergeable_state: node.mergeable === 'CONFLICTING' ? 'dirty' : 'unknown'},
        checks: {check_runs: checks}, statuses: {statuses},
        commit: {commit: {committer: {date: commit.committedDate}}}
      });
    }
    break;
    cursor = page.pageInfo.endCursor;
    if (!cursor || cursors.has(cursor)) throw Error('Dispatcher pagination made no progress');
    cursors.add(cursor);
  } while (true);
  return result;
}

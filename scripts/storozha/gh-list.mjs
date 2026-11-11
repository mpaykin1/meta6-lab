// Claude 11.11.2026: один GraphQL-запрос на 100 PR вместо REST-запроса на каждый PR.
// У GITHUB_TOKEN всего 1000 REST-запросов в час на репозиторий — сторожа его выедали.
export async function openPulls(repo, token) {
  const [owner, name] = repo.split('/');
  const query = `query($owner:String!,$name:String!,$after:String){repository(owner:$owner,name:$name){
    pullRequests(states:OPEN,baseRefName:"main",first:100,after:$after){pageInfo{hasNextPage endCursor}
      nodes{number url createdAt mergeable headRefName headRefOid
        headRepository{nameWithOwner} commits(last:1){nodes{commit{committedDate}}}}}}}`;
  const result = [];
  let after = null;
  for (let page = 0; page < 20; page++) {
    const r = await fetch('https://api.github.com/graphql', {method: 'POST',
      headers: {Authorization: 'Bearer ' + token, 'Content-Type': 'application/json'},
      body: JSON.stringify({query, variables: {owner, name, after}})});
    const json = await r.json().catch(() => ({}));
    const data = json.data?.repository?.pullRequests;
    if (!r.ok || json.errors || !data) {
      throw Error('GraphQL open PR list HTTP ' + r.status + ': ' + JSON.stringify(json.errors || json.message || ''));
    }
    for (const n of data.nodes) {
      const lastCommitAt = n.commits.nodes[0]?.commit?.committedDate || '';
      if (!lastCommitAt) throw Error('Unknown last commit date for PR #' + n.number);
      result.push({number: n.number, html_url: n.url, created_at: n.createdAt, state: 'open',
        mergeable: n.mergeable, lastCommitAt,
        head: {ref: n.headRefName, sha: n.headRefOid, repo: {full_name: n.headRepository?.nameWithOwner}}});
    }
    if (!data.pageInfo.hasNextPage) return result;
    after = data.pageInfo.endCursor;
  }
  throw Error('Refusing truncated GraphQL pagination');
}

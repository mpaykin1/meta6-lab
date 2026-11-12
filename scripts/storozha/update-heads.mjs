// API dependencies are explicit; this module never checks out or executes PR code.
export async function updateHeads({repo, prs, api, updateApi, now = Date.now(), log = console.log}) {
  if (repo !== 'mpaykin1/meta6-lab') throw Error('Only mpaykin1/meta6-lab is writable');
  const failures = [];
  for (const snapshot of prs) {
    try {
      const pr = await api('/pulls/' + snapshot.number);
      if (pr.state !== 'open' || pr.base.ref !== 'main' || pr.head.repo?.full_name !== repo) continue;
      // Do not revive abandoned work with synthetic merge commits before maintenance closes it.
      if (now - Date.parse(snapshot.lastCommitAt) >= 72 * 3600 * 1000) continue;
      if (pr.mergeable_state === 'dirty') continue;
      if (pr.mergeable === null) throw Error('mergeability unknown; retry next run');
      const comparison = await api('/compare/main...' + pr.head.sha);
      if (!Number.isInteger(comparison.behind_by)) throw Error('Unknown behind_by');
      if (comparison.behind_by > 0) {
        if (!updateApi) throw Error('AUTOFINISH_UPDATE_TOKEN required to trigger PR CI');
        await updateApi('/pulls/' + pr.number + '/update-branch', 'PUT', {
          expected_head_sha: pr.head.sha
        });
        log('UPDATE_REQUESTED #' + pr.number + ' from ' + pr.head.sha);
      }
      // Approval is best effort: GitHub may forbid it for this workflow token.
      const fresh = await api('/pulls/' + pr.number);
      const runs = await api('/actions/runs?head_sha=' + fresh.head.sha + '&per_page=100');
      for (const run of runs.workflow_runs || []) {
        if (run.head_sha !== fresh.head.sha || run.conclusion !== 'action_required') continue;
        try {
          await api('/actions/runs/' + run.id + '/approve', 'POST');
          log('APPROVED ' + run.html_url);
        } catch (error) {
          if (![403, 404].includes(error.status)) throw error;
          log('APPROVAL_UNAVAILABLE ' + run.html_url + ': HTTP ' + error.status);
        }
      }
    } catch (error) {
      failures.push('#' + snapshot.number + ': ' + error.message);
    }
  }
  if (failures.length) throw Error(failures.join('\n'));
}

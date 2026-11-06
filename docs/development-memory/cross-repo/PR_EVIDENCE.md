# Merged PR evidence intake

`python3 automation/tools/cross_repo_pr_evidence.py --repo mpaykin1/meta6 --repo mpaykin1/World_server --limit 30`

Reads bounded pages of closed pull requests and stores **only merged PR metadata** in `pr-evidence.json`. Maintains a per-repository cursor. It does not copy source code or infer quality. All records are `CANDIDATE_UNVERIFIED`, and must be reviewed against diffs, tests, licenses and accepted behavior before an append-only lesson is added to `events.jsonl`. No automatic owner approval.

This is not full history coverage: paging by `updated` is unstable when PRs change. Next phase requires durable SHA/time watermarks, deduplication by PR number, changed-file retrieval, evidence validation, and a bounded multi-repo orchestration runner. Keep existing five automation slots and avoid concurrent checkpoint writes.

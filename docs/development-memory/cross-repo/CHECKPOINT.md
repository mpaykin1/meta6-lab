# GitHub checkpoint concurrency guard

Before proposing a PR that changes shared inventory, PR candidates, memory events or cursor files, capture `main` SHA and check it again:

```sh
python3 automation/tools/cross_repo_checkpoint.py --repo mpaykin1/meta6 --expected-main-sha <40-char-sha>
```

If `STALE_REBASE_REQUIRED`, stop and re-read current main before regenerating a checkpoint. This is **optimistic preflight**, not a transaction or distributed lock. Another writer can merge after the check; therefore GitHub PR mergeability and expected-head SHA must be checked again at merge time. Never overwrite the shared ledger with a stale snapshot. Keep per-task updates in separate PRs; preserve append-only history.

# Memory run lease

For tasks sharing **one local checkout**, wrap the bounded memory runner:

```sh
python3 automation/tools/cross_repo_lease.py -- python3 automation/tools/cross_repo_runner.py --topic "camera physics"
```

The lease uses atomic exclusive file creation. Busy leases fail closed, and owner tokens prevent deleting another task's lock. Stale leases require operator review; no automatic stealing. This is **not** a distributed lock across five independent cloud runners or GitHub workspaces. Shared checkpoint changes must still be rebased and reviewed before merge; GitHub SHA preconditions and PR isolation remain necessary. Do not claim distributed concurrency solved.

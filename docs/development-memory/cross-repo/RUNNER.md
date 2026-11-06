# Five-slot memory execution contract

This is a **CLI workflow**, not a new automation or a cloud scheduler. Invoke inside one of the five existing tasks before development when GitHub access and a workspace are available:

```sh
python3 automation/tools/cross_repo_runner.py --topic "animation camera physics" --plan
python3 automation/tools/cross_repo_runner.py --topic "animation camera physics"
```

Order: bounded repo/branch inventory, merged-PR candidate intake, deterministic index generation from the append-only verified ledger, explicit recall preflight. Each command stops on failure, and output always labels coverage PARTIAL. Network calls require API access, optionally GH_TOKEN. When only existing local knowledge is available, `--offline` skips GitHub calls; this does **not** imply all repos are indexed. Shared checkpoints must be committed via reviewed PR, and parallel task runs must not overwrite one another. No automatic promotion from PR metadata to verified lessons. The CLI must be invoked by the actual task runner; merely merging this file does not prove scheduled execution.

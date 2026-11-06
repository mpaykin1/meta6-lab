# Memory preflight for all five existing automations

Before game changes, read the topic's cards and execute:

```sh
python3 automation/tools/cross_repo_recall.py
python3 automation/tools/memory_preflight.py --topic "ashen enemy types collision animation"
```

Preflight returns exit 2 if the index is absent or invalid; exit 1 if `--require-match` is used and no lesson matches; exit 0 for completed search. Exit 0 is **not approval of changes**. `coverage: PARTIAL` is explicit; a candidate still requires evidence, source code and regression tests. Do not fail game development merely because no matching prior lesson exists unless the task requires a match. The same process applies to all five tasks; no sixth task.

Current gap: this preflight is a CLI contract, not yet a mandatory game-code PR status check. First add it to the automation runner, then progressively enable a code-change gate after reliable topic inference and owner approval.

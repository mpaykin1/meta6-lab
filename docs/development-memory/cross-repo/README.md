# Cross-repository development memory

Incremental read-only inventory of GitHub repositories and all their branches. No sixth scheduled task.

Run: `python3 automation/tools/cross_repo_inventory.py --max-repos 3 --max-branches 75`.

Validate: `python3 automation/tools/cross_repo_inventory.py --check` after an inventory exists.

The script uses public GitHub API or optional GH_TOKEN for authorized repositories; private repositories require separate permission and API discovery. Cursor is stored in `inventory.json` and must be committed through a reviewed PR. Five existing slots share it and must serialize updates to avoid lost checkpoints. Inventory is NOT validated knowledge. Never mark experimental branches owner-approved. Do not copy proprietary source into public repositories. Existing `events.jsonl` and compactor remain the sole validated lesson store. Branch inventory is deliberately separate.

Next implementation stages: test pagination and resume with mocked API; CI check for inventory; incremental commit/PR evidence extraction; SHA-linked reusable component catalog; regression gates; safe lab promotion.

# ScanCode Toolkit 32.5 — rights gate for the existing library

Source: https://github.com/aboutcode-org/scancode-toolkit (Apache-2.0 for software; accompanying license data CC-BY-4.0 and dependencies carry separate notices). Standalone ScanCode CLI and license database are **not bundled**; this skill contains an independently authored Python adapter and a copy of the Apache-2.0 license. Verified upstream commit `e423b48a1fdbff26219fbeafe7e9bdef293b91fc` (2026-11-02), stable release `v32.5.0`.

The adapter uses exact `scancode --license --copyright --package --info --json output.json SOURCE_ROOT` syntax; never a shell. It requires CLI **32.5.0** for direct local scans; `ingest` accepts an existing ScanCode 32-series JSON for disconnected machines. Missing CLI is not reported as a successful scan.

### Combining the modules

- Tree-sitter `fusion-index.json` supplies the list of games and exact per-file SHA-256 hashes. Files omitted from the ScanCode report remain `unscanned`.
- Assimp/glTF-Transform model entries retain original game, source path and hash. The license scan never deletes/rewrites/optimizes original art.
- Qdrant takes only sanitized `license_scan_status`, `license_scan_expressions` metadata, never source snippets, copyright evidence, scan file contents or absolute paths. This is not a legal permission grant.
- Rete.js displays detection status. A suspicious or unscanned source is not treated as approved by an older `reuse-approvals.json` entry. New approval is disallowed while ScanCode flag remains blocking.
- Rapier scene packer refuses model resources with `license_scan_blocked`; inkjs source permission remains a separate review of authored narrative and any incorporated content. Recast, Postprocessing and Playwright never alter the legal status.

### Required operations (only when user authorizes reading their source)

```
python skills/meta-game-fusion/scripts/scancode_bridge.py scan --library /safe/fusion-library --game game-id
python skills/meta-game-fusion/scripts/scancode_bridge.py ingest --library /safe/fusion-library --game game-id --report /scan/out.json
python skills/meta-game-fusion/scripts/scancode_bridge.py preflight --library /safe/fusion-library
```

The `scan` and `ingest` commands create or update **only** `scancode-rights.json` inside the separate library folder, with no game-code copies. If rights are genuinely held, a manual assertion can clear one exact SHA-256-pinned source file:

```
python skills/meta-game-fusion/scripts/scancode_bridge.py review \
 --library /safe/fusion-library --game game-id --file src/main.js \
 --basis owner --license OWNED --evidence 'I created this source and own reuse rights.'
```

This review does not automatically approve a component: the separate Rete `approve` workflow with its component ID still applies. A changed file invalidates both the scan and manual clearance.

Statuses: `permissive_detected` = candidate for manual review, **not** automatically cleared for reuse; `reviewed_exception` = human asserts documented rights; `needs_review`, `restricted_review`, `scan_error`, `hash_mismatch`, `unscanned` = block reuse when rights inventory is present. A detected permissive code license does not authorize copying original game art, music, trademarks, bundled fonts or third-party models.

The `preflight` command is a strict technical gate, not a legal opinion. A missing rights inventory yields a nonzero result. The plugin never runs ScanCode by default, uploads code or embeds ScanCode's license database. No automatic green status is claimed.

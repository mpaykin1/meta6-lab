# Module 6 — inkjs narrative runtime × Rete.js 2

- Project: https://github.com/y-lohse/inkjs, MIT, `inkjs@2.4.0` (source verified Nov 2026).
- Do not confuse `inkjs` (narrative DSL + runtime) with the user's `INK` watercolor art standard.
- Script authors compose original or owned `.ink` stories. inkjs/full compiler compiles to compiled JSON (not JavaScript). `inkjs` Story runtime reads JSON, presents actual choices, exports declared variables into **allowlisted** global `flag:` and `item:` booleans. Do not execute tags as code, shell, eval, or unapproved game assets.
- The Rete editor `dialogue` node connects story flow, carries `story_id` and SHA-256; a branch after the dialogue reads the exported `flag:`/`item:`. It cannot skip approvals or alter external source games.
- Workbench `scripts/compile-stories.mjs` compiles with pinned `inkjs/full`; source SHA required. Outputs `public/stories/{id}.json` plus `public/stories/manifest.json` with compiled bytes SHA and source metadata. For editable projects, copies are in `stories-src`; upstream games remain read-only.
- `ink-player.js` is a playable narrative **preview**, not a full game: Start, Scene, Mechanic (display label, not executed), Dialogue (real choices), Branch and Ending. No self-triggered character actions. Save/restore per graph in browser localStorage.
- A fresh Rete workbench includes an *original* sample story `last_viaduct.ink`; sample storyboard Start → Scene → Dialogue → Branch → 2 Endings. It is approved solely because this original sample is newly authored for the skill, **not** because input games are implicitly cleared.
- To add an existing owned `.ink` story, run:

```bash
python skills/meta-game-fusion/scripts/ink_bridge.py add \
  --workbench /path/to/new-workbench --source /path/to/owned-game/story.ink \
  --id healer_entry --title 'Пролог целителя' --game last-healer \
  --export healed=flag:healed --license OWNED --approved --rights-basis owner
cd /path/to/new-workbench
npm install --ignore-scripts
npm run dev
```

- The browser `story` selector binds a dialogue node to the chosen compiled JSON and its SHA-256. Graph export still uses the same `meta-game-fusion.graph.v1` format with additive `story_id` and `story_sha256` only on dialogue nodes; old v0.5 graphs remain loadable.
- Before strict blueprint validation run the compilation above, export graph, then:

```bash
python skills/meta-game-fusion/scripts/rete_bridge.py validate \
  --library /path/to/fusion-library --graph /path/to/fusion-story-graph.json \
  --stories-manifest /path/to/new-workbench/public/stories/manifest.json \
  --out /path/to/fusion-library/fusion-scene-blueprint.json
```

- Validation confirms manifest schema, all paths remain inside manifest directory, compiled JSON file hashes, registered origin source SHA and explicit approvals. Each dialogue node references existing pinned story. An orphaned, stale or unapproved story fails blueprint validation. Sources are never auto-approved by scanning.
- Rights of the narrative text and included third-party game assets are distinct from MIT licensing of the inkjs engine. The plugin bundles notices and its own adapters, not inkjs upstream npm package or any compiled game scripts from user repositories.
- Installation of npm dependencies is separate and requires network/package access; updating plugin metadata does not perform it.

# Module 5: Rete.js 2 visual game-fusion compositor

Open source: [Rete.js](https://github.com/retejs/rete), MIT. `rete@2.0.6` with `rete-area-plugin@2.3.2`, `rete-connection-plugin@2.0.5`, `rete-render-utils@2.0.3`, `@retejs/lit-plugin@2.0.8`, `lit@3.3.1`. The user-facing visual graph is **real Rete.js** (`NodeEditor`, `ClassicPreset`, AreaPlugin, ConnectionPlugin, LitPlugin); it is not a mock canvas. Its source is authored under `templates/rete-workbench`. No unknown third-party code is executed during indexing.

## Workflow

Prerequisites: complete the Tree-sitter / Assimp / glTF-Transform catalog step and optionally Qdrant indexing. Qdrant can remain unavailable: `scripts/rete_bridge.py` reads the same normalized candidate metadata with `qdrant_bridge.collect()` directly (metadata, not code or asset bytes). Rete editor operates offline after npm dependencies are installed.

```bash
python skills/meta-game-fusion/scripts/rete_bridge.py prepare --library /path/to/fusion-library --out /path/to/fusion-library/rete-workbench
cd /path/to/fusion-library/rete-workbench
npm install --ignore-scripts
npm run dev
```

Open the Vite local URL displayed by the terminal (do not invent a published link). On the first run the canvas has one Start, one Scene, one Ending. Sidebar lets you create Start / Scene / Branch / Ending nodes and add any actual component from source catalogs. Sources are keyed by game+relative path+sha256 via Qdrant IDs. Drag nodes; join **flow-to-flow** (story events) or **asset-to-asset** (model/sprite/shader attachment) sockets. Other or cyclic connections are blocked. Rename nodes, set branch predicates `flag:<name>` or `item:<name>`, inspect rights, import/export graph JSON, save browser-local drafts and check reachability.

Output `fusion-story-graph.json` is **declarative** `meta-game-fusion.graph.v1` and never contains runnable game code. Export allows an unfinished draft for continuing work. A separate strict compiler validates branches, reachable endings, graph DAG, asset bindings and owner rights before making a story blueprint:

```bash
python skills/meta-game-fusion/scripts/rete_bridge.py validate --library /path/to/fusion-library --graph /path/to/fusion-story-graph.json --out /path/to/fusion-library/fusion-scene-blueprint.json
```

`fusion-scene-blueprint.json` is a non-executable plan for the future game composer; it is **not a game link** or proof that imported mechanics work. It preserves catalog component references, attached resources and plot choices. Runtime adapters for Three.js / gameplay / inkjs will be future modules. Games are never altered or executed by this step.

## Rights workflow

Both `mechanic` and `resource` nodes always reference catalog documents using a pinned `component_id` and `source_sha256`; unknown or changed components are rejected. Search hits and file extension are not proof of license. Until the owner actually checks an asset license/permission, import is a **proposal**, and validation refuses to promote it to a reusable blueprint.

After a user explicitly confirms their rights to an individual component:

```bash
python skills/meta-game-fusion/scripts/rete_bridge.py approve --library /path/to/fusion-library --component-id UUID_FROM_CATALOG --basis owner --license OWNED
```

The approval registry stays **outside** originals in `reuse-approvals.json` and is SHA-pinned; rescan on upstream changes. Run `prepare --out NEW_EMPTY_DIR` to regenerate the editor with updated approval indicators. Do not auto-approve all entries. No third-party code, imported model bytes, copyrighted artwork, or external embeddings are sent to cloud services.

## Integration and safety

- Tree-sitter detects candidate gameplay functions → Qdrant search metadata (`mechanic`) → Rete mechanic nodes.
- Assimp finds/imports models → glTF-Transform optionally optimizes GLB → Qdrant records the source+optimized relative path → Rete `resource` nodes.
- Rete graph stores story flow with typed ports; no game logic is executed from imported files.
- `start` has flow output only; `scene` / `mechanic` accept `flow` + `asset` and have flow output; `branch` accepts flow, emits yes/no; `ending` only accepts flow; `resource` only outputs asset.
- Branch conditions are declarative (`flag:door_open` / `item:key`). Do not `eval` them or invent implementation until a runtime is written and verified.
- Multiple typed links per scene are allowed, but cycles, arbitrary script execution, dangling edges, unsupported IDs, missing source permissions, inaccessible endings and incompatible ports are rejected by the strict validator.
- Workbench output is separate from original game files. Never overwrite a previous workbench with unsaved author changes. `prepare` requires a new/empty destination. Imported asset file paths are metadata only; they are **not** automatically copied to the browser app.
- Browser/editor npm dependencies need installation in the generated workbench; without it do not claim the visual editor launched. The packaged app has NO bundled node_modules. Do not run third-party npm install scripts: `npm install --ignore-scripts`.
- Rete core and its renderer are MIT (relevant license files in `vendor/rete*`). Own art and models keep separate licenses; do not infer commercial reuse just from Rete being open source.

### Topic-matched workbench (offline)

`prepare --theme "ночной лес и бой"` ranks the local component cards by the **same deterministic lexical vector hashing used in Qdrant fallback**; it does not download weights, start Qdrant or pretend lexical matching is true semantic intelligence. A real Qdrant search can be run before preparation using `scripts/qdrant_bridge.py search`; the compositor consumes the same stable source IDs and records. The workbench is for human-readable candidates and typed composition, not arbitrary asset execution.

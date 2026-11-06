# Claude / Codex — Observer World V6: Living History & Allies

**Play:** https://mpaykin1.github.io/meta6/observer-world-en-v6/

**Original approved visual engine:** `observer-world-en-v6/index.html` is a V6 fork of the owner's graphically approved V5, with the **original Island of Twilight Three.js PerspectiveCamera and WebGL renderer untouched**. V5 remains the owner's graphics PASS. V6 changes gameplay and adds external modules, never replaces camera or original 3D shaders.

## Source map — open from ANY chat

- `index.html`: full original Three.js renderer, 21 weapons, mobs, water/fog/glitch, exact camera; V6 exports `heroTex`, `hurtBy`, `revivePerson`, `damageEnemy` and `__observerV6Frame` hook.
- `editor.js`: historical object placement, lower symbol dock, inputs, save/restore and UI integration.
- `building-assets.js`: **36 distinct native-atlas voxel structures**, each with a unique architecture and props. No second engine.
- `npc-catalog.js`: **16 jobs**, original 6-frame illuminated hero sprite appearance reused with different palettes / actions.
- `combat-relations.js`: NPC follow, retaliation, guard aggression, wounded/dead, controlled companion AI, New hero creation, native player damage; one shared render frame.
- `story-system.js`: historical literary event narratives, construction chains, killings, companion betrayal, death and rebirth; full-screen reader and short messages.
- `audio.js`: existing Krieger-inspired procedural score and source SFX.
- `v6-systems.test.cjs`: independent source-contract tests for unique structures, human roles, ally betrayal and NPC killing the hero.
- `.github/workflows/observer-v6-gate.yml`: syntax + source comparison + live WebGL Chrome smoke.

## Controls

- **Right mouse click (ПКМ)** places selected symbol from the bottom toolbar; no default browser context menu while building.
- **Left mouse click (ЛКМ)** performs a real original weapon swing/shot and can hit an NPC.
- **Alt+ЛКМ** reads the nearest object or NPC in the full-screen reader, without accidentally attacking.
- **Esc** cancels an active construction selection instead of pausing.
- **新 / New**: if player alive, spawns modest allied companion; if player dead, revives the controllable player within the same existing island/world, keeping all objects and history.
- Attack your companion: relation permanently changes friendly→hostile and they attack the player.
- Assault a town resident: guards can become hostile and use **native player hurt/die**. Death adds story; the world itself is not deleted.
- WASD / Space / Q / E / weapon menu: original movement/attack controls preserved.

## Status and owner approval

The owner awarded **graphics PASS to V5** based on the screenshot. This does not automatically grant V6 PASS. V6 is independently tested. Important outstanding manual checks: compare physical character animation quality to reference, ensure on-screen ease of reading, NPC/builder interactions in all circumstances, stress test FPS on iPhone, tune social narrative and AI integration. CI passing is not owner visual or gameplay acceptance.

## Architecture restrictions

- No new game engine, no paid API, no leaked secrets. The full original 3D world, pixel art and original SFX remain.
- Use exactly one existing `frame` callback; NPCs update in `__observerV6Frame`, not in new RAF loops.
- Keep NPC count bounded (42) and construction at 120 objects.
- Access from all chats via public GitHub: [root CLAUDE.md](../CLAUDE.md), [source index](../SOURCE_INDEX.md), [machine source index](../game-source-index.json).
- Claude may READ the public repository from any chat, but needs a GitHub-authorized connection to push.

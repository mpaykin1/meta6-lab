> **ПЕСОЧНИЦА ChatGPT.** Основной проект — [mpaykin1/meta6](https://github.com/mpaykin1/meta6). Отсюда в основной проект забирает только Claude. Правило: [rules/06-rabota-ii-s-kodom/PESOCHNITSA_GPT.md](rules/06-rabota-ii-s-kodom/PESOCHNITSA_GPT.md). Задание: [automation/prompts/meta6-lab-sandbox.md](automation/prompts/meta6-lab-sandbox.md). Очередь идей: [LAB_QUEUE.md](LAB_QUEUE.md). Сайт: https://mpaykin1.github.io/meta6-lab/meta-games/ · превью идеи: `https://mpaykin1.github.io/meta6-lab/preview/<имя>/…`
>
> Как работает песочница: одна идея = ветка `lab/<имя>` + PR в `main` песочницы (на PR запускается честный бот `meta-bot.yml`, его не менять). `main` песочницы раз в сутки становится равным `meta6/main` (workflow `Sync from meta6`), поэтому идеи живут в ветках `lab/**`, а не в `main`. Workflows публикации meta6 (Discord, Playgama, Pages meta6, межрепозиторная память) в песочнице удалены специально.

# Observer World — living symbolic 3D island

**Current accepted public game: [Observer World V7, smartphone + desktop](https://mpaykin1.github.io/meta6/observer-world-en-v7/)**

**Owner verdict: PASS — 16 October 2026.** [Official success record](docs/SUCCESS_OBSERVER_WORLD_V7_MOBILE_2026-10-16.md) · [technical Chrome/WebGL success](https://github.com/mpaykin1/meta6/actions/runs/38896347402).

Observer World combines the original 3D *Island of Twilight* voxel environment, lighting, water, animated sprites, original sound/weapons and native Three.js camera with the historical symbol-building game. Choose a symbol; build a place; inhabitants, conflicts and narrative consequences follow.

## Where to start in any new ChatGPT, Claude, Codex chat

Give the assistant this URL:

**https://github.com/mpaykin1/meta6/blob/main/CLAUDE.md**

Then open the [complete V7 handoff](observer-world-en-v7/CLAUDE.md) or the [source index for every edition](SOURCE_INDEX.md). The repository is **public**, so the source can be **read** in a new conversation without sending the HTML again; committing requires that agent's GitHub write authorization. Nothing automatically gives an unrelated AI session permissions to edit a GitHub account.

## V7 project source

| Component | File |
| --- | --- |
| Original game, WebGL renderer, camera, game physics, shaders, assets and native controls | [index.html](observer-world-en-v7/index.html) |
| Historical world editor, mobile building placement, narrative integration | [editor.js](observer-world-en-v7/editor.js) |
| Joystick; 3 pixel-art right controls; original engine button events | [mobile-controls.js](observer-world-en-v7/mobile-controls.js) |
| Accepted mobile visual layout | [mobile-controls.css](observer-world-en-v7/mobile-controls.css) |
| 36 original-atlas architectural types | [building-assets.js](observer-world-en-v7/building-assets.js) |
| NPC animations and professions | [npc-catalog.js](observer-world-en-v7/npc-catalog.js) |
| Allies, combat, betrayal, respawn | [combat-relations.js](observer-world-en-v7/combat-relations.js) |
| Literary history and full-screen reading | [story-system.js](observer-world-en-v7/story-system.js) |
| Procedural soundtrack | [audio.js](observer-world-en-v7/audio.js) |
| Full acceptance, integration, controls and limitations | [CLAUDE.md](observer-world-en-v7/CLAUDE.md) |
| Real Chrome smartphone touch simulation CI | [observer-v7-gate.yml](.github/workflows/observer-v7-gate.yml) |

## Accepted mechanics

Mobile displays a joystick on the left; exactly three right buttons (combined attack/fire+jump, build and weapon change); bottom glyph bar; music/fullscreen in ☰. Select a glyph, touch a site by the character, then tap hammer to build. Native trees fall; original land works despite differing heights using a stone base, but occupied structures cannot be overwritten. Desktop keyboard/mouse controls remain unchanged.

**Protection of completed work:** V5 graphics PASS and V7 mobile PASS are accepted user baselines. Preserve these exact editions. Any substantial redesign should be in V8, a new branch, or a pull request, with a fresh user PASS/FAIL.

**Machine-readable index:** [game-source-index.json](game-source-index.json). [Prior editions and original HTML archives](SOURCE_INDEX.md).

# Hero Animator 0.17.0

## glTF-Transform → source-safe Rapier collision → Three.js/PostFX (v0.13.0)

`node scripts/gltf_prepare.mjs INPUT.glb OUTPUT.glb --meshopt --require-colliders` uses actual glTF-Transform 4.5.1 + meshoptimizer 1.3.0 to optimize **static world GLB assets**. Collider meshes named `COLLIDER_*` are extracted from original, unquantized world-space vertices into `OUTPUT.glb.colliders.json`, then registered in the **same** Rapier world by `runtime/gltf-rapier-scene.mjs` with genuine THREE GLTFLoader/MeshoptDecoder. Source GLB, original character GIF/PNG and atlas pixels are unchanged. Builds require installed npm packages and a real browser bundle; otherwise fail closed. More: `references/gltf-transform-rapier.md`.

## World-only atmospheric postprocessing

`runtime/hero-postfx.mjs` integrates the actual `pmndrs/postprocessing@6.39.6` library with Three.js (`three@0.180.0`): SelectiveBloom for real environment emitters, world `FogExp2`, opt-in vignette and adaptive FX quality, without recoloring the approved original hero sprite texture. `runtime/hero-rapier-postfx-loop.mjs` runs the existing Rapier controller once before the compositor. `examples/rapier-3d-game.package.json` pins the npm dependencies; `scripts/prepare_postfx_game.mjs` copies the runtime sources into each game and merges its package dependency pins without overwriting modified files; see `references/postprocessing-rapier.md`. Do not call `renderer.render` separately when the compositor renders.

## Retained integrations

Source GIF/PNG → optional rembg cutout candidates → optional RIFE interpolation candidates → explicit artistic approval with SHA256 → MaxRects packed original RGBA atlases → Three.js directional billboard hero + Rapier 3D collisions → selective environmental postprocessing.

Art/identity/input/offline gates and existing 2.5D behavior are preserved. The runtime npm dependencies, pretrained rembg/RIFE weights, WebGL/WASM game and final inlined images are not bundled into this skill patch; game output must be a real built and verified artifact rather than an example/template.

Read `SKILL.md` for authoritative requirements and refs for each component.


## 0.17.0 — legacy repair/playtest adapter for the supplied Ash Frontier

Для ремонта существующего `index (3).html` есть отдельный исполняемый путь, сохраняющий исходный WebGL renderer: `pack_action_grids.py` → `complete_ash_game.py ORIGINAL.html PACK.json OUTPUT.html --canonical REFERENCE.png`. Это legacy-адаптер игрового просмотра, не новый Rapier/Three.js проект, не замена основного конвейера и не заявление, что Rapier/PostFX встроены в исходный WebGL. Все новые модули 0.16.0 и дополнительные skills остаются без изменений.

`runtime/ash-adventure.js` реализует только один игровой update с настоящим вводом: здоровье/выносливость, причинный урон/смерть, атака с окном попадания по цели, удержание/освобождение/перемещение броска, E-подбор трёх печатей, портал, победа/поражение/рестарт и пауза. Стражи — объёмные каменные объекты окружения, не Canvas-подмена авторского героя. Для нового 3D проекта обязателен основной Rapier конвейер, legacy body-проверки с ним не совмещать.

В проверяемом пакете 44 клипа × 8 отдельных полнотелых кадров = 352 PNG-позы четырёх видов, без warping/RIFE персонажа. Исходные листы по 6 поз дополнены двумя отдельно нарисованными позами на действие из 4×6 supplementary grids; использовать pack_action_grids.py INPUT OUTPUT --extras EXTRA_DIR --canonical REFERENCE.png. Исходники сохраняются. Спрайт с непрозрачным/полупрозрачным белым фоном блокируется ДО нормализации: сначала штатный cut_white.py/rembg в отдельный candidate, затем повторная проверка. Не удалять такую ошибку снижением порогов. Новый regression test_grid_candidates.py подтверждает отказ на белом прямоугольнике и сохранность реального прозрачного спрайта. Metadata human_reviewed_each_frame остаётся false до фактического ответа пользователя; canonical approval не выдавать за approval всех новых кадров. Требования character_frame_gate и отдельных frame-by-frame/animated-world skills сохраняются. Игровой просмотр новых кадров — PREVIEW художественной приёмки, даже если все технические проверки и прохождение успешны.

`test_adventure.mjs` проверяет тот же held/pressed input до победы, включая реальный AI-урон, смерть, рестарт и бросок. `test_complete_builder.py PACK.json` проверяет реальный набор и отрицательные случаи: потерянный вид, внешний URL, неверный canonical SHA, выход за атлас. Сборщик встраивает изображения/JS без CDN/fetch и сохраняет исходный HTML. После сборки обязательна отдельная браузерная offline проверка keyboard/touch в desktop/portrait/landscape и реальное прохождение; structural PASS не равен художественному PASS. Новые исходники и неутверждённые кадры не включать в approved папку автоматически.

# Patch → META GAMES

Upstream: `patch-gg/pixelfx@5294518ce7c72e48b6100a744596e0acf57f2826` (MIT).
20 original JavaScript source files, license, pinned SHA checks. Other Patch projects: REVIEW.

PR: https://github.com/mpaykin1/meta6-lab/pull/310
Demo source: `demos/patch-pixelfx/` (fire, explosions, lightning; no paid APIs).
Library: `shared/components/patch-pixelfx/`, `shared/index.json`, `shared/loader.js`.
Automatic checks: `scripts/shared/verify-patch-pixelfx.mjs`,
`scripts/shared/mutate-patch-pixelfx.mjs`, `scripts/shared/verify-patch-game-browser.mjs`.
Last checkpoint: 2026-11-15, branch HEAD `b553c89d47486d7f69b27e750aa9f75584715be1`.
Added visual game ambience in `demos/patch-pixelfx/atmosphere.js` with imports in `game.js`: ruined engine, moving fog, ambient particles, firelight, foreground grass, reactive lightning glow. New original glue, imported upstream MIT sources unchanged. Both modules passed JavaScript syntax parsing before push; browser CI for this HEAD is not yet confirmed.

Not published: no verified GitHub Pages 200 yet. STOROZHA PR quota is exceeded
(44 active PRs vs limit 5), Vercel external build rate limit. Do not disable guards or pay.

2026-11-16: Replaced periodic sine-based fog wave with layered seeded nonperiodic smooth noise; randomized foreground silhouette steps. Only original META GAMES demo module changed, PixelFX MIT sources untouched. Code commit: `e7221fd6b5b928bb496d2388ff5cd680770785f5`. Browser CI and public HTTP 200 still unconfirmed; PR #310 remains draft.

2026-11-16: Pinned upstream `NOTICE.md` (`bd049df57f92b448b6b106e0fc01fc71cbdb8dd2`) and retained both Sprite Fusion / Hollow Crown attribution and Patch Pixel font exclusion in `shared/components/patch-pixelfx/`. Extended component passport, commercial license registry, generated index, exact-blob guard and tamper mutation (new trap `changed-notice`). Code SHA: `aa433d9aba481e2145bcfa99626aed298e41eeb9`. CI pending; no publication claim.

2026-11-16: Resolved PR #310 merge conflict with safe two-parent merge from `main@2dda99b491fe74aeca06860ebca10ff5bbd3fb1b`; retained all 43 intended Patch files and the single unique `PATCH-FX-01` journal row on top of latest main `OSHIBKI.md`. Merge SHA `0604bf2c8ffb4a244afc1c7d7f5f34dd4be8c548`. Verified GitHub PR `mergeable=true` (remains draft pending checks/publication).

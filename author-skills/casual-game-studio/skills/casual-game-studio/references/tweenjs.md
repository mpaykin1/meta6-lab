# Official Tween.js module integration

Repository: https://github.com/tweenjs/tween.js
Source tag: v23.1.3
Official distribution file: dist/tween.esm.js
Git blob SHA-1: 1ec97cab9d9f8a50c1f90b6b6e8f3085453de17d
Raw module SHA-256: 4e54d74514b1e5940ec5be9ce257539405fce5d49fb8845b12bb8d7d9862d40e
License: MIT, complete unmodified text in references/TWEEN-LICENSE.txt
Embedded copy: templates/pastel-blocks/vendor/tween.esm.js

Integration: Three.js owns 3D scene and rendering. A single `Group` from Tween.js controls all event-driven transitions and updates inside Three.js animation loop using the requestAnimationFrame timestamp. The library is bundled with generated games: no runtime Tween.js CDN fetch. Never create a second animation loop.

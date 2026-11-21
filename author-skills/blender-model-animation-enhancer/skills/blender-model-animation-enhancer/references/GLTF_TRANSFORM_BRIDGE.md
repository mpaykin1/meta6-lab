# glTF Transform bridge — v1.7

**Project**: `donmccurdy/glTF-Transform`, MIT, https://github.com/donmccurdy/glTF-Transform

The official Node.js CLI `@gltf-transform/cli` is an external dependency. The skill never pretends it bundles an installed CLI or native codec. Use `npm install --global @gltf-transform/cli@4.5.1` (Node.js >=20) or set `GLTF_TRANSFORM_BIN`. A script for cloning official source is included. Source clone needs network access.

## Synergy

1. Blender imports/exports a single unchanged character asset in GLB.
2. PyMeshLab, Instant Meshes operate on author-approved static meshes before UV work.
3. SkinTokens generates a rig only for unrigged characters; Open Mocap and Rigger add separately named animation clips.
4. Material Maker authors PBR surfaces using `.ptex` and exports textures into Blender's Principled BSDF.
5. **glTF Transform is the terminal, opt-in export stage**: deduplication and pruning, optional texture conversion / geometry codecs. The original GLB is untouched. Do not run mesh cleanup/retopology on a rigged hero just to shrink file size.

## Main launcher

For existing GLB (requires **no Blender**):

```bash
python skills/blender-model-animation-enhancer/scripts/run_enhancer.py \
  --input hero-pbr.glb --output hero-final.glb --gltf-optimize
```

For the regular Blender conversion plus optimized output:

```bash
python skills/blender-model-animation-enhancer/scripts/run_enhancer.py \
  --input hero.fbx --output hero-final.glb --gltf-optimize
```

To invoke after material modification in one command:

```bash
python skills/blender-model-animation-enhancer/scripts/run_enhancer.py \
  --input hero.glb --output hero-final.glb \
  --material-textures-dir exported_material --material-object HeroMesh --gltf-optimize
```

To select the real CLI binary: `--gltf-transform-bin /path/to/gltf-transform`. `--overwrite` is explicit. When an earlier step is requested, the launcher builds an intermediate GLB in a temporary directory, then invokes `gltf_transform_worker.py`. Only a checked final output is committed. No automatic compression without `--gltf-optimize`.

## Modes and browser compatibility

| mode | commands | Three.js requirements |
| --- | --- | --- |
| `safe` (default) | `dedup`, `prune` | GLTFLoader only; does not introduce new compression extensions |
| `webp` | `dedup`, `prune`, `webp --slots baseColor` | browser WebP support; image appearance may change |
| `meshopt` | `dedup`, `prune`, `meshopt --level medium` | GLTFLoader.setMeshoptDecoder(MeshoptDecoder) |
| `draco` | `dedup`, `prune`, `draco --method edgebreaker` | GLTFLoader.setDRACOLoader(dracoLoader) |
| `webp-meshopt` | webp + meshopt | both WebP and MeshoptDecoder |

Example compressed output:

```bash
python skills/blender-model-animation-enhancer/scripts/run_enhancer.py \
  --input hero.glb --output hero-small.glb --gltf-optimize --gltf-mode meshopt
```

Three.js setup when using meshopt (the decoder **must** be configured):

```javascript
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);
loader.load('hero-small.glb', (gltf) => {
  scene.add(gltf.scene);
  // Preserve one character object and choose animation clips ONLY from player input.
});
```

Use `DRACOLoader` for Draco; KTX2 is deliberately not introduced by this wrapper. Meshopt/Draco/WebP are **off by default**. Additional codec dependencies may change browser support and initial decode latency. Avoid changing a material if artistic fidelity must be pixel-identical.

## Guardrails

The worker reads GLB 2.0 directly, records animation names/channels and target nodes, skin joint names, skinned mesh links and morph target counts, and checks these again after optimization. It fails closed on unexpected changes; it cannot prove bit-for-bit equivalence of rendering or deformation. It also rejects unexpected new mesh compression extensions. The primary asset is NEVER overwritten. Safe mode keeps the original bytes as output if optimization increases size. For source files with unnamed animation-target nodes, the conservative guard may reject valid renumberings rather than risk corrupting the asset.

This is a structural integrity guard, not a substitute for loading the model in Three.js and checking all clips. Review changes in actual game before publication.

**License**: glTF Transform MIT. Other existing components keep their own licenses; no glTF Transform source code is copied into MIT adapters.

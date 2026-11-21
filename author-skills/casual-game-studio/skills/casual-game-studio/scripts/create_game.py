#!/usr/bin/env python3
"""Create a full standalone source folder for an original toy-style Three.js game."""
from __future__ import annotations
import argparse
import pathlib
import shutil
import re
import json
from bbmodel_to_glb import make_glb
from optimize_glb import optimize as optimize_glb

ROOT=pathlib.Path(__file__).resolve().parents[1]
TEMPLATE=ROOT/'templates'/'pastel-blocks'

def main():
    p=argparse.ArgumentParser(description='Create a pastel 2.5D / 3D mini game')
    p.add_argument('--out',type=pathlib.Path,required=True)
    p.add_argument('--title',default='Pastel Drop')
    p.add_argument('--seed',type=int,default=7)
    p.add_argument('--bbmodel',type=pathlib.Path,help='Optional Blockbench cube model as main 3D mascot (.bbmodel)')
    p.add_argument('--vrm',type=pathlib.Path,help='Optional VRM 0.x/1.0 avatar to include as the HERO button character (.vrm)')
    p.add_argument('--force',action='store_true',help='Overwrite files in an existing target folder')
    p.add_argument('--optimize-assets',action='store_true',help='Lossless GLB dedup/prune via glTF-Transform 4.5.1')
    p.add_argument('--meshopt',action='store_true',help='Opt-in lossy Meshoptimizer 1.3.0 compression of mascot GLB')
    p.add_argument('--ktx2',action='store_true',help='Build KTX2 tile textures using an installed official Khronos KTX tool')
    p.add_argument('--ktx-tool',type=str,help='Path to official KTX-Software ktx CLI executable')
    p.add_argument('--install-optimizer',action='store_true',help='Install the pinned npm glTF-Transform packages (requires network)')
    args=p.parse_args()
    output=args.out.expanduser().resolve()
    if output.exists() and any(output.iterdir()) and not args.force:
        raise SystemExit('Output folder not empty. Choose another directory or pass --force.')
    output.mkdir(parents=True,exist_ok=True)
    for path in TEMPLATE.iterdir():
        if path.is_file():
            shutil.copy2(path,output/path.name)
        elif path.is_dir():
            shutil.copytree(path,output/path.name,dirs_exist_ok=True)
    if args.bbmodel:
        chosen=args.bbmodel.expanduser().resolve()
        if chosen.suffix.lower()!='.bbmodel' or not chosen.is_file():
            raise SystemExit('--bbmodel must name an existing .bbmodel file')
        make_glb(chosen,output/'models'/'pastel-bunny.glb')
        shutil.copy2(chosen,output/'models'/'pastel-bunny.bbmodel')
    if args.vrm:
        custom=args.vrm.expanduser().resolve()
        if not custom.is_file() or custom.suffix.lower()!='.vrm' or custom.stat().st_size>40_000_000:
            raise SystemExit('--vrm must be an existing .vrm up to 40 MB')
        shutil.copy2(custom,output/'models'/'pastel-scout.vrm')
        print(f'Included selected VRM avatar: {custom.name} (loaded only on HERO command)')
    # Build-time optimization only. Keep original Blockbench GLB whenever Meshopt is enabled.
    src=output/'models'/'pastel-bunny.glb'
    has_installed=(ROOT/'scripts'/'gltf-transform'/'node_modules'/'@gltf-transform'/'core'/'package.json').is_file()
    if args.meshopt:
        candidate=src.with_name('pastel-bunny.meshopt.glb')
        # This raises a clear error if upstream package cannot be installed.
        compressed=optimize_glb(src,candidate,install=args.install_optimizer,meshopt=True)
        if compressed:
            loader=output/'model-loader.js'
            loader.write_text(loader.read_text(encoding='utf-8').replace(
                'const MESHOPT_PREFERRED = false;','const MESHOPT_PREFERRED = true;'),encoding='utf-8')
            print(f'Meshopt GLB ready: {candidate.stat().st_size} bytes (lossy quantization)')
        else:
            print('Meshopt GLB was not smaller: using original Blockbench GLB')
    elif args.optimize_assets or args.install_optimizer or has_installed:
        candidate=src.with_name('pastel-bunny.optimized.glb')
        smaller=optimize_glb(src,candidate,install=args.install_optimizer)
        if smaller:
            shutil.copy2(src,src.with_name('pastel-bunny.source.glb'))
            candidate.replace(src)
            print(f'Lossless dedup/prune optimized GLB: {src.stat().st_size} bytes')
        else:
            print('Original GLB retained: no size benefit')
    if args.ktx2:
        from encode_ktx2 import encode as encode_ktx2
        encode_ktx2(output,args.ktx_tool)
    title=re.sub(r'[^\w\s\-!?.]', '',args.title,flags=re.U).strip()[:24] or 'Pastel Drop'
    js=(output/'game.js').read_text(encoding='utf-8')
    js=js.replace("params.get('title') || 'PASTEL DROP'",f"params.get('title') || {json.dumps(title.upper(),ensure_ascii=False)}")
    js=js.replace("params.get('seed') || 7",f"params.get('seed') || {args.seed}")
    (output/'game.js').write_text(js,encoding='utf-8')
    html=(output/'index.html').read_text(encoding='utf-8')
    html=html.replace('Pastel Drop • Casual Game Studio',title+' • Casual Game Studio')
    html=html.replace('PASTEL DROP',title.upper())
    (output/'index.html').write_text(html,encoding='utf-8')
    shutil.copy2(ROOT/'references'/'THREE-LICENSE.txt',output/'THREE-LICENSE.txt')
    shutil.copy2(ROOT/'references'/'TWEEN-LICENSE.txt',output/'TWEEN-LICENSE.txt')
    shutil.copy2(ROOT/'references'/'POSTPROCESSING-LICENSE.txt',output/'POSTPROCESSING-LICENSE.txt')
    shutil.copy2(ROOT/'references'/'RAPIER-APACHE-LICENSE.txt',output/'RAPIER-APACHE-LICENSE.txt')
    shutil.copy2(ROOT/'references'/'QUARKS-MIT-LICENSE.txt',output/'QUARKS-MIT-LICENSE.txt')
    shutil.copy2(ROOT/'references'/'GLTF-TRANSFORM-MIT-LICENSE.txt',output/'GLTF-TRANSFORM-MIT-LICENSE.txt')
    shutil.copy2(ROOT/'references'/'MESHOPTIMIZER-MIT-LICENSE.txt',output/'MESHOPTIMIZER-MIT-LICENSE.txt')
    shutil.copy2(ROOT/'references'/'THREE-MESH-BVH-MIT-LICENSE.txt',output/'THREE-MESH-BVH-MIT-LICENSE.txt')
    shutil.copy2(ROOT/'references'/'THREE-BVH-CSG-MIT-LICENSE.txt',output/'THREE-BVH-CSG-MIT-LICENSE.txt')
    shutil.copy2(ROOT/'references'/'THREE-VRM-MIT-LICENSE.txt',output/'THREE-VRM-MIT-LICENSE.txt')
    shutil.copy2(ROOT/'scripts'/'vendor_three.py',output/'vendor_three.py')
    shutil.copy2(ROOT/'scripts'/'vendor_engines.py',output/'vendor_engines.py')
    shutil.copy2(ROOT/'scripts'/'encode_ktx2.py',output/'encode_ktx2.py')
    shutil.copy2(ROOT/'references'/'KTX-SOFTWARE-LICENSE-NOTICE.md',output/'KTX-SOFTWARE-LICENSE-NOTICE.md')
    shutil.copy2(ROOT/'scripts'/'bbmodel_to_glb.py',output/'bbmodel_to_glb.py')
    shutil.copy2(ROOT/'scripts'/'optimize_glb.py',output/'optimize_glb.py')
    shutil.copytree(ROOT/'scripts'/'gltf-transform',output/'gltf-transform',dirs_exist_ok=True)
    (output/'README.md').write_text(f'''# {title}

Pastel 2.5D/3D minigame: Three.js 0.187.0 + bundled Tween.js 23.1.3 + postprocessing 6.39.6 + Blockbench 3D model + Rapier 0.21.0 real collision dynamics and falling debris + Three.quarks 0.17.1 true batched particle VFX. Three BVH CSG 0.0.18 adds user-triggered real tile subtraction (CARVE / C) with unchanged conservative Rapier colliders; Three Mesh BVH 0.9.18 accelerates static block picking with a single shared tree and falls back to native raycasting. KTX-Software 4.4.2 can build UASTC KTX2 tile textures (opt-in). glTF-Transform 4.5.1 can optimize the Blockbench GLB, with optional real Meshoptimizer 1.3.0 compression and optional real Three-VRM 3.5.5 humanoid assets. One animation clock; click a block, pet the bunny, load the included VRM with HERO, press WAVE/BLINK, toggle ✿ VFX or use Arrow keys and Space.

## Play

    python -m http.server 8000 --directory .

Open http://localhost:8000. When not vendored, the page loads Three.js, postprocessing, Rapier, three-mesh-bvh, three-bvh-csg, Three.quarks/quarks.core and Three-VRM from pinned jsDelivr URLs as needed. Tween.js ships inside `vendor/`. If Rapier cannot be loaded, a badge explicitly identifies the Tween-only fallback.

## Optional GPU KTX2 tile textures (build-time; official Khronos CLI)\n\nInstall the official KTX-Software v4.4.2 CLI once, then run `python encode_ktx2.py --game .` from the generated game directory. PNG sources are shipped in `textures/png/`. KTX2 files replace the CanvasTexture maps only after all eight files decode successfully; otherwise the original materials remain unchanged. For new games, use `--ktx2` when the CLI is already installed.\n\n## Optional 3D asset optimization (build-time; Node.js 20+)

From skill root, for lossless dedup/prune:
`python scripts/create_game.py --out /mnt/data/game --optimize-assets --install-optimizer`.
To opt into quantizing Meshoptimizer compression:
`python scripts/create_game.py --out /mnt/data/game --meshopt --install-optimizer`.
Requires Node.js 20+ and npm access. The original GLB always remains intact for the compressed path; if the output is not smaller, the original is used.
The asset pipeline calls genuine upstream glTF-Transform 4.5.1 `dedup` and `prune`, keeps all materials, textures, animations and rigs, and refuses to claim an optimized result if upstream installation fails. It leaves the 3D game runtime unchanged. This installation requires npm internet connectivity once. The editable Blockbench `.bbmodel` remains the source of truth. Do not apply glTF-Transform/Meshopt to VRM avatars unless validated for all rigs, blendshapes and expressions; original VRM remains immutable.

## Make fully offline (one internet-connected installation step)

    python vendor_engines.py --game .

That downloads official, version-pinned npm tarballs for Three.js, postprocessing and Rapier, checks their SHA-512 integrity against npm registry metadata, writes vendor bundles, then switches the import map to local files. The game then needs no CDN; Three.quarks and its quarks.core dependency, Meshoptimizer, Three Mesh BVH, Three BVH CSG and Three-VRM are also locally vendored.

The included `models/pastel-scout.vrm` is an original optional VRM 1.0 humanoid with a bone rig and bound blink expression. The HERO button loads it; ↑ VRM imports a user-supplied avatar, and WAVE / BLINK only act on button presses. Models are not switched automatically. Use `--vrm /path/to/model.vrm` to replace only the optional sample HERO slot. The included `models/pastel-bunny.bbmodel` is editable in the separate GPL-3.0 Blockbench editor. The paired `models/pastel-bunny.glb` is game-ready. To rebuild after changing simple cubes, run: `python bbmodel_to_glb.py --src models/pastel-bunny.bbmodel --out models/pastel-bunny.glb`. For painted textures, armatures, groups and complex animations, use Blockbench's native Export GLB instead.

Licenses: KTX-Software Apache-2.0 (components and third-party subdirectories may have other licenses); Three-VRM MIT; Meshoptimizer MIT; Three.js MIT; Tween.js MIT; postprocessing Zlib; Rapier Apache-2.0; Three.quarks MIT; glTF-Transform MIT; Blockbench editor GPL-3.0 (not included); the original sample bunny model is authored for Casual Game Studio. Three BVH CSG MIT, official source: https://github.com/gkjohnson/three-bvh-csg
''',encoding='utf-8')
    print(output)

if __name__=='__main__':main()

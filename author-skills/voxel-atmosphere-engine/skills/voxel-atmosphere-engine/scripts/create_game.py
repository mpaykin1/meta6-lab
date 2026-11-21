#!/usr/bin/env python3
"""Create an EMBERGROVE starter game, with an original Blockbench-compatible art workflow."""
import argparse
import pathlib
import shutil
import subprocess
import sys

ROOT=pathlib.Path(__file__).resolve().parents[1]
def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--out',type=pathlib.Path,required=True)
    ap.add_argument('--seed',type=int,default=214)
    ap.add_argument('--title',default='EMBERGROVE')
    args=ap.parse_args()
    if args.out.exists() and any(args.out.iterdir()):
        raise SystemExit('Destination must be an empty directory (will not overwrite user files)')
    template=ROOT/'templates'/'embergrove'
    shutil.copytree(template,args.out,dirs_exist_ok=True)
    subprocess.check_call([sys.executable,str(ROOT/'scripts'/'generate_forest.py'),'--out',str(args.out/'assets'),'--seed',str(args.seed)])
    # Rebuild the interoperable Goxel .vox assets as Three.js GLBs for this seed.
    subprocess.check_call([sys.executable, str(ROOT/'scripts'/'generate_relics.py'),
                           '--out',str(args.out/'assets'),'--seed',str(args.seed)])
    # Animation is attached to the original GLB geometry; this is not a
    # replacement sketch or a swapped hero. The Blender bridge can author the
    # same clips, including an editable .blend when Blender is installed.
    for asset, motion in [('moon_gate','breathe'),('moon_crystals','hover')]:
        subprocess.check_call([sys.executable,str(ROOT/'scripts'/'glb_motion.py'),
                               '--input',str(args.out/'assets'/f'{asset}.glb'),
                               '--out',str(args.out/'assets'/f'{asset}_animated.glb'),
                               '--motion',motion])
    # Independent Pixelorama PNG pixel-art module and voxel palette sync.
    pixel=args.out/'assets'/'pixelorama'
    subprocess.check_call([sys.executable,str(ROOT/'scripts'/'pixelorama_assets.py'),'--out',str(pixel)])
    for name,scale,motion in [('moon_gate',.14,'breathe'),('moon_crystals',.115,'hover')]:
        subprocess.check_call([sys.executable,str(ROOT/'scripts'/'pixel_palette_vox.py'),
                               '--input',str(args.out/'assets'/f'{name}.vox'),
                               '--palette',str(pixel/'palette.json'),'--out',str(args.out/'assets'),
                               '--scale',str(scale)])
        subprocess.check_call([sys.executable,str(ROOT/'scripts'/'glb_motion.py'),
                               '--input',str(args.out/'assets'/f'{name}_pixelorama.glb'),
                               '--out',str(args.out/'assets'/f'{name}_pixelorama_animated.glb'),
                               '--motion',motion])
    # Prefer verified meshoptimizer/gltfpack 1.3.0 compression, then fall back to
    # the previous glTF Transform lossless pipeline; either may be unavailable.
    subprocess.check_call([sys.executable,str(ROOT/'scripts'/'meshoptimizer_bridge.py'),
                           '--game',str(args.out),'--mode','meshopt'])
    import json
    manifest=json.loads((args.out/'assets'/'optimized'/'manifest.json').read_text())
    if not manifest.get('assets'):
        subprocess.check_call([sys.executable,str(ROOT/'scripts'/'gltf_optimize.py'),
                               '--game',str(args.out),'--profile','safe'])
    print('Game:',args.out/'index.html')
    print('Open by static HTTP server: python -m http.server 8000 --directory',args.out)
    print('The HTML imports Three.js 0.187.0 from CDN; browser internet required.')
if __name__=='__main__':main()

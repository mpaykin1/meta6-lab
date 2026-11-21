#!/usr/bin/env python3
"""Voxel Game Creator v0.9: glTF-Transform + Luanti + Lumenwild + Voxelize + Ragnagrok + Blockbench.

Sources are pinned. Native runtimes remain independent; Ragnagrok Model
assets authored in Studio are genuinely rendered in both other Three.js worlds.
"""
from __future__ import annotations
import argparse
import json
import os
import shutil
import tempfile
from pathlib import Path

import create_game as voxelize
import create_lumenwild as lumenwild
import create_ragnagrok as ragnagrok
import ragnagrok_bridge
import blockbench_bridge
import download_blockbench
import create_luanti
import download_luanti
import download_meshoptimizer
import gltf_transform_bridge
import bvh_bridge
import download_three_mesh_bvh
import yuka_bridge
import download_yuka
import recast_bridge
import fastnoise_bridge
import download_fastnoise
import download_recast_navigation
from ragnagrok_assets import acquire_assets, write_pack

ENGINES={'browser','server','both','studio','luanti','all'}


def run_engines(spec:dict,dest:Path,engine:str,voxelize_source:Path|None=None,
                lumenwild_source:Path|None=None,ragnagrok_source:Path|None=None,
                ragnagrok_project:Path|None=None,
                blockbench_assets_dir:Path|None=None,blockbench_manifest:Path|None=None,
                with_blockbench_editor:bool=False,with_luanti_source:bool=False,
                asset_optimizer:str='auto',texture_optimization:str='lossless-webp',
                gltf_transform_executable:Path|None=None,geometry_compression:str='meshopt',
                meshopt_level:str='high',with_meshoptimizer_source:bool=False,
                bvh_mode:str='auto',with_bvh_source:bool=False,
                npc_mode:str='auto',npc_manifest:Path|None=None,
                with_yuka_source:bool=False,
                nav_mode:str='auto',nav_obstacles:Path|None=None,
                with_recast_source:bool=False,noise_mode:str='auto',noise_config:Path|None=None,
                with_fastnoise_source:bool=False)->None:
    if not isinstance(spec,dict):voxelize.fail('game spec must be an object')
    if engine not in ENGINES:voxelize.fail('engine must be browser/server/both/studio/luanti/all')
    if bvh_mode not in ('auto','off','required'):
        voxelize.fail('--bvh-mode must be auto|off|required')
    if npc_mode not in ('auto','off','required'):
        voxelize.fail('--npc-mode must be auto|off|required')
    if nav_mode not in ('auto','off','required'):
        voxelize.fail('--nav-mode must be auto|off|required')
    if noise_mode not in ('auto','off','required'):
        voxelize.fail('--noise-mode must be auto|off|required')
    if nav_mode=='required' and (npc_mode=='off' or engine not in ('browser','server','both','all')):
        voxelize.fail('Recast required requires Yuka NPCs in browser/server')
    if with_blockbench_editor and engine not in ('all','both'):
        voxelize.fail('--with-blockbench-editor requires multi-output --engine all|both')
    assets=acquire_assets(spec,ragnagrok_project)
    blockbench=blockbench_bridge.manifest_items(blockbench_manifest,blockbench_assets_dir)
    npc_targets=engine in ('browser','server','both','all')
    if npc_targets and npc_mode!='off':
        yuka_bridge.ensure_watcher_model(assets,spec)
    agents=yuka_bridge.read_agents(npc_manifest,assets,blockbench) if npc_targets and npc_mode!='off' else []
    # Validate the explicit navigation blockers even if npm is offline.
    if nav_obstacles is not None and nav_mode!='off':
        recast_bridge.obstacles(assets,nav_obstacles)
    out=dest.resolve()
    if out.exists():voxelize.fail('output exists; will not overwrite: '+str(out))
    out.parent.mkdir(parents=True,exist_ok=True)
    stage=Path(tempfile.mkdtemp(prefix='.vgc-v010-',dir=out.parent))
    try:
        blockbench,optimization_results=gltf_transform_bridge.optimize(
            blockbench,stage/'.asset-optimizer-temporary',policy=asset_optimizer,
            textures=texture_optimization,executable=gltf_transform_executable,
            geometry=geometry_compression,meshopt_level=meshopt_level)
        outputs={
           'browser': engine in ('browser','both','all'),
           'server': engine in ('server','both','all'),
           'studio': engine in ('studio','all'),
           'luanti': engine in ('luanti','all'),
        }
        multidir=sum(outputs.values())>1
        source_paths={'browser':lumenwild_source,'server':voxelize_source,'studio':ragnagrok_source,'luanti':None}
        allfiles=[]
        bvh_results={}
        npc_results={}
        nav_results={}
        noise_results={}
        for kind,enabled in outputs.items():
            if not enabled:continue
            # Each official-source generator requires a nonexistent target folder.
            target=stage/kind if multidir else stage.parent/(stage.name+'-'+kind)
            if kind=='browser':
                lumenwild.game(spec,target,source_paths[kind])
                ragnagrok_bridge.install_bridge(target,'browser',assets)
                blockbench_bridge.install_bridge(target,'browser',blockbench)
                bvh_results['browser']=bvh_bridge.install(target,'browser',mode=bvh_mode)
                npc_results['browser']=yuka_bridge.install(target,'browser',assets,agents,mode=npc_mode)
                nav_results['browser']=recast_bridge.install(target,'browser',assets,agents,mode=nav_mode,
                    custom_obstacles=nav_obstacles,npc_status=npc_results['browser']['status'])
                noise_results['browser']=fastnoise_bridge.install(target,'browser',assets,spec,mode=noise_mode,config=noise_config)
            elif kind=='server':
                voxelize.game(spec,target,source_paths[kind],voxelize.PIN)
                ragnagrok_bridge.install_bridge(target,'server',assets)
                blockbench_bridge.install_bridge(target,'server',blockbench)
                bvh_results['server']=bvh_bridge.install(target,'server',mode=bvh_mode)
                npc_results['server']=yuka_bridge.install(target,'server',assets,agents,mode=npc_mode)
                nav_results['server']=recast_bridge.install(target,'server',assets,agents,mode=nav_mode,
                    custom_obstacles=nav_obstacles,npc_status=npc_results['server']['status'])
                noise_results['server']=fastnoise_bridge.install(target,'server',assets,spec,mode=noise_mode,config=noise_config)
            elif kind=='studio':
                ragnagrok.studio(spec,target,source_paths[kind],assets)
                blockbench_bridge.copy_studio_asset_pack(target,blockbench)
            else:
                target.mkdir(parents=True,exist_ok=False)
                create_luanti.write_mod(target/'vgc_bridge',assets,source='Ragnagrok-compatible palette and voxels')
            if not multidir:
                for f in target.iterdir():shutil.move(str(f),str(stage/f.name))
                target.rmdir()
            allfiles.append(kind)
        if with_blockbench_editor:
            # GPL source is stored separately and never imported into MIT game runtimes.
            import subprocess
            subprocess.run(['python3',str(Path(download_blockbench.__file__)), '--out',str(stage/'blockbench-editor')],check=True)
        if multidir:
            write_pack(stage/'shared-assets',assets)
        if with_luanti_source:
            import subprocess
            subprocess.run(['python3',str(Path(download_luanti.__file__)), '--out',str(stage/'luanti-engine-source')],check=True)
        if with_bvh_source:
            import subprocess
            subprocess.run(['python3',str(Path(download_three_mesh_bvh.__file__)),
                '--out',str(stage/'three-mesh-bvh-source')],check=True)
        if with_yuka_source:
            import subprocess
            subprocess.run(['python3',str(Path(download_yuka.__file__)),
                '--out',str(stage/'yuka-source')],check=True)
        if with_recast_source:
            import subprocess
            subprocess.run(['python3',str(Path(download_recast_navigation.__file__)),
                '--out',str(stage/'recast-navigation-js-source')],check=True)
        if with_fastnoise_source:
            import subprocess
            subprocess.run(['python3',str(Path(download_fastnoise.__file__)),
                '--out',str(stage/'fastnoise-lite-source')],check=True)
        if with_meshoptimizer_source:
            import subprocess
            subprocess.run(['python3',str(Path(download_meshoptimizer.__file__)),
                '--out',str(stage/'meshoptimizer-source')],check=True)
        title=spec.get('title','Voxel World')
        palette={**voxelize.SCHEMES.get(spec.get('theme','ash'),voxelize.SCHEMES['ash']),**spec.get('colors',{})}
        blueprint={'title':title,'seed':spec.get('seed',7391),'theme':spec.get('theme','ash'),
                   'colors':palette,'outputs':allfiles,'rag_asset_count':len(assets['models']),
                   'model_format':'ragnagrok-models-v1',
                   'shared_geometry':'decorative instances only; no terrain/chunk or world save interchange',
                   'rigged_animation':'Ragnagrok Studio only',
                   'physics':'native per engine',
                   'blockbench_glb_assets':[{'id':x['id'],'clips':x['clips']} for x in blockbench],
                   'glb_render':'Lumenwild and Voxelize via native Three.js GLTFLoader; source figures remain independent',
                   'glb_collision':'no avatar physics; optional accelerated triangle raycast for inspection only',
                   'yuka_ai': {'source':yuka_bridge.SOURCE_PIN,'version':yuka_bridge.VERSION,
                              'mode':npc_mode,'agents':agents,'clients':npc_results,
                              'source_checkout':with_yuka_source,'physics':'visual NPCs only',
                              'navigation':'Yuka authored patrol paths, optionally routed through local Recast/Detour navmesh'},
                   'fastnoise_lite':{'version':fastnoise_bridge.VERSION,'source':fastnoise_bridge.SOURCE_PIN,
                       'mode':noise_mode,'clients':noise_results,'config':str(noise_config) if noise_config else None,
                       'source_checkout':with_fastnoise_source,'effects':'native deterministic decorative authored-voxel placement only',
                       'physics':'not modified; cave/terrain chunk carving not implemented'},
                   'recast_navigation': {'source':recast_bridge.PIN,'version':recast_bridge.VERSION,
                                         'mode':nav_mode,'clients':nav_results,
                                         'custom_obstacles':str(nav_obstacles) if nav_obstacles else None,
                                         'source_checkout':with_recast_source,
                                         'limitations':'local bounded pathing, approximate server plane, no authoritative voxel physics or dynamic obstacle sync'},
                   'three_mesh_bvh': {'source':bvh_bridge.PIN,'version':bvh_bridge.VERSION,'mode':bvh_mode,
                                      'clients':bvh_results, 'source_checkout':with_bvh_source},
                   'asset_optimizer': {'tool':'@gltf-transform/cli',
                        'version':gltf_transform_bridge.VERSION,
                        'policy':asset_optimizer,'textures':texture_optimization,
                        'geometry_compression':geometry_compression,'meshopt_level':meshopt_level,
                        'decoder':'Three.js bundled MIT MeshoptDecoder, loaded only for compressed GLB',
                        'results':optimization_results},
                   'meshoptimizer_source_included':with_meshoptimizer_source,
                   'blockbench_editor_source_included':with_blockbench_editor,
                   'luanti_mod':outputs['luanti'],
                   'luanti_engine_source_included':with_luanti_source,
                   'luanti_bridge':'native Lua mod: colored authored Ragnagrok voxels, solid nodes, glow; one source voxel maps to one Luanti node; no savegame synchronization'}
        (stage/'world-blueprint.json').write_text(json.dumps(blueprint,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
        if multidir:
            (stage/'README.md').write_text('''# Voxel Game Creator: Yuka NPCs + Recast Navigation JS + existing OSS components

- `browser/`: Lumenwild standalone browser game. Build: `cd browser && npm ci && npm run build` → `browser/dist/`. Props from Ragnagrok Project format render in the THREE.Scene, independent of savegame terrain.
- `server/`: Voxelize authoritative Rust + Three.js server and client. Build/run: `cd server && ./run-voxel-game.sh`. Props from same Ragnagrok asset pack render in client scene; world physics is not changed.
- `studio/`: Ragnagrok's editable voxel authoring/rigging/audio environment, fixed-camera playable adventure. `cd studio && ./run-voxel-game.sh`, open `/editor/` to edit or `/examples/adventure/` to play.
- `luanti/vgc_bridge/`: standalone Luanti Lua mod. Copy `vgc_bridge/` into your Luanti world's `mods/`, enable it, then use `/vgc_list` and `/vgc_build <model_id>`. Requires Luanti and a Luanti game; this is not a browser edition.

For custom asset transfer: save a complete Ragnagrok Project JSON from the studio editor, then re-run the generator with `--ragnagrok-project path/to/export.json`. The exporter copies referenced *scene prop models* and placement info into both worlds. It does NOT replace either game's block physics, terrain, saves or player animations. Native Studio figures and clips stay in Studio.

GLB optimization: official MIT glTF-Transform CLI v4.5.1 is installed to the user cache on demand and deduplicates GLB, optionally using lossless WebP. It keeps source files untouched and checks animation clip names, joint lists and node count. In auto mode, missing npm/network or invalid output preserves original models, never blocks the game. Use `--asset-optimizer required` to fail if unavailable, `--texture-optimization off` to preserve original texture encoding, or `--asset-optimizer off` to disable. Draco and triangle simplification remain disabled. Meshopt is enabled by default for embedded GLBs when a CLI is present; both Three.js runtimes set GLTFLoader.setMeshoptDecoder with Three's bundled decoder. Geometry quantization can be slightly lossy; originals remain untouched and the output must be smaller and pass structure checks. See `world-blueprint.json` for per-model outcomes.

Yuka NPC AI: default `--npc-mode auto` installs official MIT `yuka@0.7.8` + TypeScript definitions and creates one original Ragnagrok voxel patrol character. `--npc-manifest path.json` selects named waypoints and user-owned Blockbench GLB characters/optional walk clips. Yuka EntityManager + Vehicle + FollowPathBehavior updates autonomous NPCs at 30Hz; player controls, original enemies, collisions and attack input remain unchanged. A Yuka NPC has NO authoritative multiplayer combat or physical collisions. Optional `--nav-mode auto|required|off` installs Recast JS and routes Yuka waypoints around authored static Ragnagrok props or `--nav-obstacles` boxes within a bounded local patch. Lumenwild uses the native terrain sampler; Voxelize uses the existing approximate 82m plane. Navigation is NOT authoritative server voxel collision, live voxel edits or dynamic obstacle avoidance. If npm/network is unavailable, auto mode falls back safely to the original waypoint-only Yuka behavior (and if Yuka itself is unavailable, no NPCs are installed). In required mode generation fails if Recast cannot be resolved; `--npc-mode required` fails safely. Other native engines (Luanti/Ragnagrok) do not execute this Three.js agent simulation.

Optional BVH interactions: `--bvh-mode auto` (default) installs MIT three-mesh-bvh@0.9.18 and synchronizes the npm lockfile, or preserves native raycasting if npm/network is unavailable. `--bvh-mode required` stops generation if the dependency cannot be installed. The library builds acceleration structures for static GLB meshes only and enables J key to inspect a triangle-accurate nearby asset (max 5m). Rigged/skinned and morphing objects are NEVER indexed. This does not change player colliders, voxel physics, Rust server, or Luanti. `--with-bvh-source` optionally clones pinned source.

Blockbench GLB integration: pass `--blockbench-assets-dir /path/to/glb/` or `--blockbench-manifest asset-list.json`. The generator validates GLB v2 headers and local embedded textures and copies models into `browser/public/vgc/blockbench/` and `server/examples/client/public/vgc/blockbench/`. The real Three.js GLTFLoader places models in each game and optionally plays explicitly configured `idleClip` keyframes. No imported model becomes a physical block collider; the model library preserves native textures/hierarchy/animations without mixing GPL source into the game.
 For Studio static publishing, use `npm run build:site` and publish `site/`.

Upstream MIT LICENSE files remain in each source folder. No engine's live world is synchronized with the others. Luanti voxels are full blocks, so source meter scale is not retained. The Luanti engine can optionally be cloned with `--with-luanti-source`; GPL/LGPL engine source is not bundled by default.
''',encoding='utf8')
        # Optimizer intermediates are not bundled with the games.
        shutil.rmtree(stage/'.asset-optimizer-temporary',ignore_errors=True)
        os.replace(stage,out)
        print('GENERATED '+str(out))
    except BaseException:
        shutil.rmtree(stage,ignore_errors=True)
        for kind in ('browser','server','studio','luanti'):
            tmp=stage.parent/(stage.name+'-'+kind)
            if tmp.exists():shutil.rmtree(tmp,ignore_errors=True)
        raise


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--spec',required=True,type=Path)
    p.add_argument('--out',required=True,type=Path)
    p.add_argument('--engine',choices=sorted(ENGINES),help='override spec engine; default browser')
    p.add_argument('--source-voxelize',type=Path)
    p.add_argument('--source-lumenwild',type=Path)
    p.add_argument('--source-ragnagrok',type=Path)
    p.add_argument('--with-luanti-source',action='store_true',help='Optionally download pinned Luanti LGPL engine source into a separate directory; network required')
    p.add_argument('--ragnagrok-project',type=Path,help='Studio editor Project JSON: transfer prop models into both game engines')
    p.add_argument('--asset-optimizer',choices=['auto','off','required'],default='auto',
                   help='glTF-Transform optimization: automatic safe fallback, disabled, or strict')
    p.add_argument('--texture-optimization',choices=['off','lossless-webp'],default='lossless-webp',
                   help='Default: lossless WebP if embedded textures exist; no geometry codec')
    p.add_argument('--gltf-transform',type=Path,
                   help='Optional path to installed gltf-transform CLI; otherwise pinned npm cache')
    p.add_argument('--geometry-compression',choices=['meshopt','off'],default='meshopt',
                   help='Meshoptimizer buffer compression using official glTF-Transform CLI')
    p.add_argument('--meshopt-level',choices=['medium','high'],default='high',
                   help='Meshoptimizer quality level; high is the default')
    p.add_argument('--bvh-mode', choices=['auto','off','required'], default='auto',
                   help='BVH static GLB mesh raycasts in Lumenwild+Voxelize; auto safely falls back')
    p.add_argument('--with-bvh-source', action='store_true',
                   help='Clone official pinned three-mesh-bvh MIT source separately (network required)')
    p.add_argument('--npc-mode',choices=['auto','off','required'],default='auto',
                   help='Yuka game AI NPCs in Lumenwild/Voxelize; auto safely skips when npm unavailable')
    p.add_argument('--npc-manifest',type=Path,
                   help='Yuka NPC agents: validated names, GLB/voxel model and local patrol route')
    p.add_argument('--with-yuka-source',action='store_true',
                   help='Clone official pinned MIT Yuka source separately (network required)')
    p.add_argument('--nav-mode',choices=['auto','off','required'],default='auto',
                   help='Recast/Detour local navmesh for Yuka NPCs in browser/server; auto falls back to Yuka waypoints offline')
    p.add_argument('--nav-obstacles',type=Path,
                   help='Optional JSON of local static obstacle boxes relative to NPC spawn; Ragnagrok props are included automatically')
    p.add_argument('--noise-mode',choices=['auto','off','required'],default='auto',
                   help='FastNoiseLite seeded authored voxel biome props in Lumenwild/Voxelize')
    p.add_argument('--noise-config',type=Path,
                   help='Optional FastNoiseLite seed, biome distribution and authored voxel model mapping JSON')
    p.add_argument('--with-fastnoise-source',action='store_true',
                   help='Optional separate exact pinned MIT FastNoiseLite source download; requires network')
    p.add_argument('--with-recast-source',action='store_true',
                   help='Optional separate checkout of pinned official MIT Recast Navigation JS repository')
    p.add_argument('--with-meshoptimizer-source',action='store_true',
                   help='Also clone pinned official MIT meshoptimizer source into output; network required')
    p.add_argument('--blockbench-assets-dir',type=Path,help='Directory of original Blockbench-exported embedded GLB models')
    p.add_argument('--blockbench-manifest',type=Path,help='Optional JSON positions, sizes and idle clips for Blockbench GLB models')
    p.add_argument('--with-blockbench-editor',action='store_true',help='Also clone the separate official GPL-3.0 Blockbench editor into the generated multi-output project')
    args=p.parse_args()
    try:spec=json.loads(args.spec.read_text(encoding='utf8'))
    except (OSError,ValueError) as err:voxelize.fail(str(err))
    engine=args.engine or spec.get('engine','browser')
    run_engines(spec,args.out,engine,args.source_voxelize,args.source_lumenwild,
                args.source_ragnagrok,args.ragnagrok_project,
                args.blockbench_assets_dir,args.blockbench_manifest,args.with_blockbench_editor,args.with_luanti_source,
                args.asset_optimizer,args.texture_optimization,args.gltf_transform,
                args.geometry_compression,args.meshopt_level,args.with_meshoptimizer_source,
                args.bvh_mode,args.with_bvh_source,
                args.npc_mode,args.npc_manifest,args.with_yuka_source,
                args.nav_mode,args.nav_obstacles,args.with_recast_source,
                args.noise_mode,args.noise_config,args.with_fastnoise_source)

if __name__=='__main__':main()

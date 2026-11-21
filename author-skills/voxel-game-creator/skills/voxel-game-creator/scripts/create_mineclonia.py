#!/usr/bin/env python3
"""Mineclonia (GPLv3-or-later) + native VGC Luanti mod (MIT authored geometry).

Two safe outputs:
  --mod-only: generate a drop-in Luanti/Mineclonia vgc_bridge mod offline.
  default: checkout pinned original Mineclonia game + mount the SAME mod.

Source code, original game worlds/controls/mobs and saved games are unchanged.
No Veloren project art is bundled or copied. Optional user-owned VOX gets
converted upstream by voxel_game.py through the existing Veloren converter.
"""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

from create_game import fail, SCHEMES
from ragnagrok_assets import acquire_assets, write_pack
from create_luanti import write_mod

PRIMARY = 'https://codeberg.org/mineclonia/mineclonia.git'
MIRROR = 'https://github.com/mineclonia-mirror/mineclonia.git'
PIN = 'a40455bd5e227976b4e70c02d17ce1ab07bc904b'  # verified mirror 2026-11-21
MIN_LUANTI = '5.10'


def run(*args: str, cwd: Path | None = None, timeout: int = 240) -> None:
    subprocess.run(list(args), cwd=str(cwd) if cwd else None,
                   check=True, timeout=timeout, capture_output=True, text=True)


def verify_game(path: Path) -> None:
    """Require complete, unmodified game scaffolding and legal notices."""
    for rel in ('README.md', 'LICENSE.txt', 'LEGAL.md', 'game.conf', 'mods/CORE/mcl_core'):
        if not (path/rel).exists():
            fail('Mineclonia upstream expected file/directory missing: '+rel)
    license_text=(path/'LICENSE.txt').read_text(encoding='utf8')
    legal=(path/'LEGAL.md').read_text(encoding='utf8')
    conf=(path/'game.conf').read_text(encoding='utf8')
    if 'GENERAL PUBLIC LICENSE' not in license_text or 'GNU General Public License' not in legal:
        fail('Mineclonia upstream GPL license notice missing')
    if 'min_minetest_version = 5.10' not in conf or 'last_mod = _mcl_autogroup' not in conf:
        fail('Mineclonia game.conf has changed; compatibility needs review')
    if (path/'mods'/'vgc_bridge').exists():
        fail('Mineclonia already contains vgc_bridge; refusing overwrite')


def checkout(dest: Path, source: Path | None) -> str:
    if dest.exists():fail('Mineclonia checkout destination exists')
    if source is not None:
        source=source.expanduser().resolve()
        if not source.is_dir():fail('Mineclonia --source-mineclonia missing directory')
        try:
            sha=subprocess.check_output(['git','-C',str(source),'rev-parse','HEAD'],
                                        text=True,timeout=10).strip()
        except (subprocess.SubprocessError,OSError) as e:
            fail('Mineclonia offline --source-mineclonia requires real pinned Git checkout: '+str(e))
        if sha!=PIN:fail('Mineclonia source revision differs from pinned '+PIN)
        # Copy code and art at pinned HEAD; cannot silently add untrusted submodule.
        shutil.copytree(source,dest,ignore=shutil.ignore_patterns('.git','*.log','tmp','cache'))
        verify_game(dest)
        return 'local-checkout'
    if shutil.which('git') is None:fail('git required to fetch original Mineclonia source')
    errors=[]
    for url in (PRIMARY,MIRROR):
        try:
            if dest.exists():shutil.rmtree(dest)
            run('git','init',str(dest),timeout=25)
            run('git','-C',str(dest),'remote','add','origin',url,timeout=15)
            run('git','-C',str(dest),'fetch','--depth','1','origin',PIN,timeout=240)
            run('git','-C',str(dest),'checkout','--detach','FETCH_HEAD',timeout=75)
            sha=subprocess.check_output(['git','-C',str(dest),'rev-parse','HEAD'],text=True,timeout=10).strip()
            if sha != PIN:raise RuntimeError('revision mismatch; refusing unreviewed source')
            verify_game(dest)
            shutil.rmtree(dest/'.git',ignore_errors=True)
            return url
        except (OSError,subprocess.SubprocessError,RuntimeError) as e:
            errors.append(url+' '+str(e)[:350])
    fail('Pinned Mineclonia source unavailable. Supply --source-mineclonia checkout at '+PIN+'. '+'; '.join(errors))
    raise AssertionError('unreachable')


def animate_glow(moddir: Path) -> None:
    """Use native Luanti particle API: animated authored emissive voxels only."""
    init=moddir/'init.lua'
    txt=init.read_text(encoding='utf8')
    needle='groups = {cracky = 3, oddly_breakable_by_hand = 3},'
    if txt.count(needle)!=1:
        fail('Luanti original generated node-group anchor changed')
    txt=txt.replace(needle,
        'groups = {cracky = 3, oddly_breakable_by_hand = 3, vgc_emissive = c.glow and 1 or 0},',1)
    txt+='''
-- Animated authored glows. ABM is world-scoped, not an extra renderer/game loop.
-- Gameplay/player actions/mob AI remain native to Mineclonia.
core.register_abm({
    label = "VGC emissive sculpture particles",
    nodenames = {"group:vgc_emissive"},
    interval = 3, chance = 4, catch_up = false,
    action = function(pos, node)
        -- One little mote per emission; no physics, no player teleport/attack.
        local texture = "vgc_bridge_" .. node.name:gsub("^vgc_bridge:", "") .. ".png"
        core.add_particle({
            pos = {x=pos.x + math.random() - 0.5, y=pos.y + 0.5,
                   z=pos.z + math.random() - 0.5},
            velocity = {x=0, y=0.18 + 0.22*math.random(), z=0},
            acceleration = {x=0, y=0.01, z=0},
            expirationtime = 0.7 + 0.4*math.random(), size = 0.7,
            texture = texture, glow = 11, collisiondetection = false,
        })
    end,
})
'''
    init.write_text(txt,encoding='utf8')


def build(spec: dict, out: Path, source: Path | None,
          project: Path | None, mod_only: bool, emissive_particles: bool) -> None:
    if not isinstance(spec,dict):fail('Mineclonia spec must be JSON object')
    if spec.get('theme','ash') not in SCHEMES:fail('Unknown color theme')
    out=out.expanduser().resolve()
    if out.exists():fail('Output exists; refusing overwrite: '+str(out))
    out.parent.mkdir(parents=True,exist_ok=True)
    assets=acquire_assets(spec,project)
    staging=Path(tempfile.mkdtemp(prefix='.vgc-mineclonia-',dir=out.parent))
    try:
        game=staging/'game'
        origin='user-original-mod-only'
        if not mod_only:
            origin=checkout(game,source)
        else:
            game.mkdir()
        mod_dest=(game/'vgc_bridge') if mod_only else (game/'mods'/'vgc_bridge')
        summary=write_mod(mod_dest,assets,source='Ragnagrok-compatible authored VGC assets')
        if emissive_particles:
            animate_glow(mod_dest)
        write_pack(game/'vgc-shared-assets',assets)
        (game/'VGC_MINECLONIA.json').write_text(json.dumps({
            'engine':'mineclonia','upstream':PRIMARY,'mirror':MIRROR,'pin':PIN,
            'checkout_origin':origin,'game_license':'GPL-3.0-or-later',
            'art':'Mineclonia has separately licensed CC BY-SA/CC BY media (see LEGAL.md)',
            'mod_license':'MIT','mod_only':mod_only,
            'ragnagrok_models':summary['models'],
            'ragnagrok_voxels':summary['voxels'],
            'living_glow_particles':emissive_particles,
            'command':'/vgc_list, then /vgc_build <model_id>',
            'controls':'Original Mineclonia controls and world/save implementation',
            'physics':'Imported blocks are actual Luanti nodes; registered colors are not rigs/GLB or NPC actors',
            'threejs':'Separate engine: no GLSL or second WebGL renderer inside Mineclonia',
            'requires':'Luanti >= '+MIN_LUANTI,
        },ensure_ascii=False,indent=2)+'\n',encoding='utf8')
        (game/'VGC_README.md').write_text(
            '# Voxel Game Creator + Mineclonia\n\n'
            +('Full original Mineclonia game is preserved at reviewed SHA '+PIN+'.\n'
              'Install Luanti >=5.10, move this directory to Luanti games/, start the game.\n'
              if not mod_only else
              'Mod-only offline export: copy `vgc_bridge/` into an existing Mineclonia world `worldmods/` or a compatible `mods/` folder and enable it.\n')
            +'Open chat: `/vgc_list`, then `/vgc_build vgc_lantern` (or another model ID). '
             'Place only in empty loaded unprotected space; blocks are native and persistent with the Mineclonia world.\n\n'
             'Authored Ragnagrok RLE models and optional OWNED MagicaVoxel VOX pass through the same VGC Luanti exporter. '
             'Each colored filled voxel becomes one cubic Luanti node. Scale differs from the Three.js visual prop; '
             'rigger data, hitbox semantics, GLB and Three.js shaders are not transferred.\n\n'
             'Mineclonia GPLv3-or-later source and its independently licensed media stay within this separate native game. '
             'Full game: preserve all `LEGAL.md`, `LICENSE.txt`, asset credits, and mod licenses in redistribution. '
             'Do not mix its Lua code/media into MIT Three.js exports.\n',encoding='utf8')
        os.replace(game,out)
        print('MINECLONIA_GENERATED',out,'MODE','mod-only' if mod_only else 'full','MODELS',summary['models'])
    finally:
        shutil.rmtree(staging,ignore_errors=True)


def main() -> None:
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--spec',type=Path,required=True)
    p.add_argument('--out',type=Path,required=True)
    p.add_argument('--source-mineclonia',type=Path,help='offline official/mirror pinned Git checkout')
    p.add_argument('--ragnagrok-project',type=Path)
    p.add_argument('--mod-only',action='store_true',help='emit native Mineclonia-compatible Lua mod without fetching GPL game')
    p.add_argument('--no-emissive-particles',action='store_true')
    a=p.parse_args()
    try:spec=json.loads(a.spec.read_text(encoding='utf8'))
    except (OSError,ValueError) as e:fail('Cannot read spec JSON: '+str(e))
    build(spec,a.out,a.source_mineclonia,a.ragnagrok_project,a.mod_only,not a.no_emissive_particles)

if __name__=='__main__':main()

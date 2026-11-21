#!/usr/bin/env python3
"""Pin and theme the real MIT Ragnagrok Engine browser editor + adventure runtime."""
from __future__ import annotations
import json
import re
import shutil
from pathlib import Path
from create_game import PIN as VOXEL_PIN, SCHEMES,fail,replace_once,run,save
from ragnagrok_assets import acquire_assets,write_pack

REPO='https://github.com/Ragnagrok/ragnagrok-engine.git'
PIN='66e80c3a7451c5455e713e9c94fe1cf3da423050'


def prepare_source(out:Path, source:Path|None, ref:str=PIN)->None:
    if out.exists():fail('Ragnagrok target exists: '+str(out))
    if source:
        for name in ['LICENSE','editor/starter.ts','editor/main.ts','examples/adventure/main.ts','src/paint/humanoid.ts']:
            if not (source/name).is_file():fail('Ragnagrok --source missing '+name)
        shutil.copytree(source,out,ignore=shutil.ignore_patterns('.git','node_modules','dist','site','.cache'))
    else:
        if not shutil.which('git'):fail('Git required to download Ragnagrok')
        run('git','clone',REPO,str(out))
        run('git','checkout','--detach',ref,cwd=out)
    if 'MIT License' not in (out/'LICENSE').read_text(encoding='utf8'):
        fail('Ragnagrok MIT license missing')


def studio(spec:dict,out:Path,source:Path|None,assets:dict,ref:str=PIN)->None:
    title=spec.get('title','Voxel World')
    if not isinstance(title,str) or not 1<=len(title)<=80:fail('Bad game title')
    theme=spec.get('theme','ash')
    if theme not in SCHEMES:fail('Bad theme')
    palette={**SCHEMES[theme],**spec.get('colors',{})}
    for k,v in palette.items():
        if not isinstance(v,str) or not re.fullmatch(r'#[0-9a-fA-F]{6}',v):fail('Bad color '+k)
    out.parent.mkdir(parents=True,exist_ok=True)
    prepare_source(out,source,ref)
    write_pack(out/'assets',assets)
    editor=out/'editor'
    save(editor/'vgc-asset-pack.ts','// Ragnagrok-compatible authored voxel Models.\nimport type { Model, Instance } from "../src/core/index.js";\nexport const VGC_MODELS = '+json.dumps(assets['models'],ensure_ascii=False)+' as unknown as Model[];\nexport const VGC_INSTANCES = '+json.dumps(assets['instances'],ensure_ascii=False)+' as unknown as Instance[];\n')
    titlelit=json.dumps(title,ensure_ascii=False)
    def val(k):return '0x'+palette[k][1:]
    script='''// Voxel Game Creator: extend the real Ragnagrok starter, editor and adventure.
import type { Project } from '../src/core/index.js';
import { createHumanoid } from '../src/paint/index.js';
import { starterProject } from './starter.js';
import { VGC_MODELS, VGC_INSTANCES } from './vgc-asset-pack.js';
export function vgcStarterProject(): Project {
  const p=starterProject();
  p.name=TITLE;
  p.models.push(...VGC_MODELS);
  const room=p.scenes.find(s=>s.id==='study');
  if(!room)throw new Error('Ragnagrok starter room missing');
  // Ragnagrok editor is the creative source of assets. Cross-engine placement is different.
  const sites: [number,number,number][]=[[1.05,0.2,4.0],[3.8,0.2,1.1],[3.65,0.2,4.0],[0.9,0.2,3.8]];
  for(let i=0;i<Math.min(VGC_INSTANCES.length,sites.length);i++) {
    const o=VGC_INSTANCES[i];
    room.instances.push({...o, pos: sites[i], solid:false});
  }
  const npc=createHumanoid({id:'vgc-keeper',name:'The Keeper',clothes:GROUND,pants:STONE,hair:WOOD,hood:true,strap:true,tablet:true,tabletScreen:ACCENT});
  p.models.push(...npc.models);p.figures.push(npc.figure);
  room.entities.push({id:'vgc-keeper-entity',kind:'creature',name:'The Keeper',pos:[3.2,0.2,1.3],heading:-1.2,figure:npc.figure.id});
  room.fog={color:FOG,density:.045};
  room.ambient={color:SKY,intensity:1.3};
  return p;
}
'''.replace('TITLE',titlelit).replace('GROUND',val('ground')).replace('STONE',val('stone')).replace('WOOD',val('wood')).replace('ACCENT',val('sunset')).replace('FOG',val('fog')).replace('SKY',val('horizon'))
    save(editor/'vgc-starter.ts',script)
    for rel in ['editor/main.ts','examples/adventure/main.ts']:
        path=out/rel
        txt=path.read_text(encoding='utf8')
        txt=replace_once(txt,"import { starterProject } from './starter.js';" if rel.startswith('editor') else "import { starterProject } from '../../editor/starter.js';",
                         "import { vgcStarterProject } from './vgc-starter.js';" if rel.startswith('editor') else "import { vgcStarterProject } from '../../editor/vgc-starter.js';",'studio starter import')
        if 'starterProject()' not in txt:fail('studio starter call changed')
        txt=txt.replace('starterProject()','vgcStarterProject()')
        save(path,txt)
    # Multi-page Vite build remains relative-path safe for GitHub Pages.
    v=out/'vite.config.ts';txt=v.read_text(encoding='utf8');txt=replace_once(txt,'export default defineConfig({',"export default defineConfig({\n  base: './',",'Vite relative path');save(v,txt)
    save(out/'VOXEL_GAME.json',json.dumps({'title':title,'theme':theme,'seed':spec.get('seed',7391),'engine':'studio','source':REPO,'source_ref':PIN,'integration':'assets/ragnagrok-assets.json can be exported to Lumenwild & Voxelize. Figures stay in Ragnagrok.'},ensure_ascii=False,indent=2)+'\n')
    runsh='''#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
command -v npm >/dev/null || { echo 'Node.js/npm required' >&2; exit 2; }
npm ci
npm run dev -- --host 0.0.0.0
'''
    save(out/'run-voxel-game.sh',runsh);(out/'run-voxel-game.sh').chmod(0o755)
    save(out/'VGC-START.md',f'''# {title} · Ragnagrok Studio

The browser editor is at `/editor/`, playable fixed-camera adventure at `/examples/adventure/`. Both default to themed `vgcStarterProject` (unless the browser has an old saved project). Use `Open`/`New project` in editor, or clear its saved project to see the new starter. Save the editor project to JSON (menu) and pass to Voxel Game Creator with `--ragnagrok-project <export.json>` to transfer static prop models to both other engines. Studio rigged humanoids and sound belong to Ragnagrok's native runtime, not the other two engines.

`npm ci && npm run build:site` generates a static website in `site/`.

MIT license retained from upstream.
''')
    print('CREATED studio game '+str(out))

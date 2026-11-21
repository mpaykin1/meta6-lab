#!/usr/bin/env python3
"""Pixelorama CLI/.pxo and PNG sprite-sheet → validated Three.js atlas.
Independent MIT bridge; Pixelorama editor itself is not bundled.
"""
from __future__ import annotations
import argparse, json, shutil, subprocess, tempfile
from pathlib import Path
from PIL import Image

MAX_SIDE=8192

def export_pxo(project:Path, output:Path, executable:str, project_root:Path|None, tag:str|None):
    """Pixelorama src/Main.gd CLI: --export --spritesheet --output; supports --tag."""
    if not shutil.which(executable) and not Path(executable).exists():
        raise RuntimeError(f'Pixelorama executable not found: {executable}. Use --input exported PNG instead.')
    options=['--export','--spritesheet','--output',str(output)]
    if tag: options+=['--tag',tag]
    if project_root:
        # Godot --path points to locally downloaded Pixelorama source, run inside Godot.
        cmd=[executable,'--headless','--path',str(project_root),'--quit','--',*options,str(project)]
    else:
        cmd=[executable,'--headless','--quit','--',*options,str(project)]
    subprocess.run(cmd,check=True,timeout=180)
    if not output.exists():
        raise RuntimeError('Pixelorama command completed without creating the sprite sheet; check project and CLI version')

def pack(input_path:Path,out:Path,framew:int,frameh:int,columns:int,clips_path:Path|None,fps:float,
         pixelorama:str='pixelorama',project_root:Path|None=None,tag:str|None=None):
    out.mkdir(parents=True,exist_ok=True)
    if input_path.suffix.lower()=='.pxo':
        with tempfile.TemporaryDirectory() as td:
            intermediate=Path(td)/'pixelorama_sheet.png'
            export_pxo(input_path.resolve(),intermediate,pixelorama,project_root,tag)
            return pack(intermediate,out,framew,frameh,columns,clips_path,fps)
    if input_path.suffix.lower()!='.png':
        raise ValueError('Input must be a Pixelorama-exported PNG or .pxo')
    with Image.open(input_path) as src:
        if not (1<=src.width<=MAX_SIDE and 1<=src.height<=MAX_SIDE):
            raise ValueError('PNG dimension exceeds 8192')
        image=src.convert('RGBA')
    if framew<=0 or frameh<=0 or image.width%framew or image.height%frameh:
        raise ValueError('PNG dimensions must be multiples of frame width and height')
    original_cols=image.width//framew;original_rows=image.height//frameh
    frames=[image.crop((c*framew,r*frameh,(c+1)*framew,(r+1)*frameh))
            for r in range(original_rows) for c in range(original_cols)]
    if not 1<=columns<=256:
        raise ValueError('columns must be 1..256')
    # Pixelorama can export a horizontal strip; reflow into engine atlas.
    if not clips_path:
        columns=min(columns,len(frames))
        rows=(len(frames)+columns-1)//columns
        clips={'animation':{'start':0,'frames':len(frames),'fps':fps}}
    else:
        definitions=json.loads(clips_path.read_text(encoding='utf-8'))
        clips=definitions.get('clips',definitions)
        if not isinstance(clips,dict) or not clips:
            raise ValueError('Clip metadata must be nonempty JSON object')
        rows=(len(frames)+columns-1)//columns
        for name,c in clips.items():
            if 'row' in c: start=c['row']*columns
            else:start=c.get('start',0)
            if not (0<=start<len(frames) and 1<=c['frames']<=len(frames)-start and c.get('fps',fps)>0):
                raise ValueError(f'Invalid clip {name}: frames outside atlas bounds')
    atlas=Image.new('RGBA',(columns*framew,rows*frameh),(0,0,0,0))
    for i,frame in enumerate(frames):atlas.paste(frame,((i%columns)*framew,(i//columns)*frameh))
    atlas.save(out/'sprite_sheet.png',optimize=True)
    metadata={'format':1,'image':'sprite_sheet.png','frameWidth':framew,'frameHeight':frameh,
              'columns':columns,'rows':rows,'clips':clips,'pixelArt':True,'nearest':True,
              'source':'Pixelorama PNG sprite sheet'}
    (out/'sprite_sheet.json').write_text(json.dumps(metadata,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    return metadata

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--input',type=Path,required=True)
    p.add_argument('--out',type=Path,required=True)
    p.add_argument('--frame-width',type=int,default=32)
    p.add_argument('--frame-height',type=int,default=32)
    p.add_argument('--columns',type=int,default=8)
    p.add_argument('--fps',type=float,default=8)
    p.add_argument('--clips',type=Path,default=None,help='JSON describing clips: row/start, frames, fps')
    p.add_argument('--pixelorama',default='pixelorama')
    p.add_argument('--pixelorama-source',type=Path,default=None,help='local Pixelorama Godot source for godot --path')
    p.add_argument('--tag',default=None)
    a=p.parse_args()
    result=pack(a.input,a.out,a.frame_width,a.frame_height,a.columns,a.clips,a.fps,a.pixelorama,a.pixelorama_source,a.tag)
    print('Atlas:',a.out/'sprite_sheet.png','Clips:',len(result['clips']))

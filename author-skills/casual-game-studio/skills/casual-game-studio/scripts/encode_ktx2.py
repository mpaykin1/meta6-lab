#!/usr/bin/env python3
"""Encode PNG source art to portable GPU KTX2 with Khronos KTX-Software 4.4.2.

Run this during BUILD, never at runtime. Requires the upstream `ktx` CLI.
No uncompressed or fabricated KTX2 file is emitted when the encoder is absent.
The manifest only switches to KTX2 after all eight encodes succeed.
"""
from __future__ import annotations
import argparse, json, os, pathlib, shutil, subprocess, tempfile

COLORS=('pink','peach','ice','stone','brick','cream','mint','gift')
MAGIC=bytes((0xAB,0x4B,0x54,0x58,0x20,0x32,0x30,0xBB,0x0D,0x0A,0x1A,0x0A))

def encode(game:pathlib.Path,tool:str|None=None,quality:int=2):
    game=game.expanduser().resolve()
    source=game/'textures'/'png';destination=game/'textures'/'ktx2';manifest=game/'textures'/'ktx2-manifest.json'
    for kind in COLORS:
        if not (source/(kind+'.png')).is_file():
            raise RuntimeError('Missing texture: '+str(source/(kind+'.png')))
    cli = tool or shutil.which('ktx')
    if not cli:
        raise RuntimeError('KTX-Software ktx CLI unavailable. Install official v4.4.2 tool from https://github.com/KhronosGroup/KTX-Software/releases; no game asset was modified.')
    version=subprocess.run([cli,'--version'],capture_output=True,text=True,timeout=15)
    if version.returncode!=0:
        raise RuntimeError('KTX tool unavailable or nonfunctional: '+version.stderr[-250:])
    destination.mkdir(parents=True,exist_ok=True)
    # Staging ensures the original images and the manifest are never half-replaced.
    with tempfile.TemporaryDirectory(dir=game/'textures') as tmp:
        staging=pathlib.Path(tmp)
        files={}
        for kind in COLORS:
            src=source/(kind+'.png');dst=staging/(kind+'.ktx2')
            command=[cli,'create','--format','R8G8B8A8_SRGB','--encode','uastc',
                     '--uastc-quality',str(quality),'--generate-mipmap',
                     '--zstd','10','--convert-texcoord-origin','bottom-left',str(src),str(dst)]
            completed=subprocess.run(command,capture_output=True,text=True,timeout=180)
            if completed.returncode or not dst.is_file() or dst.read_bytes()[:12]!=MAGIC:
                raise RuntimeError('KTX encode failed: '+str(src)+' '+(completed.stderr or completed.stdout)[-450:])
            files[kind]=dst.name
        for kind in COLORS:
            tmpfile=staging/files[kind]
            os.replace(tmpfile,destination/files[kind])
    output={'format':'ktx2','compression':'uastc-zstd','encoder':'KTX-Software 4.4.2','files':files}
    staged=manifest.with_suffix('.tmp')
    staged.write_text(json.dumps(output,indent=2)+'\n',encoding='utf8')
    os.replace(staged,manifest)
    print('KTX2 GPU texture atlas ready:',sum((destination/v).stat().st_size for v in files.values()),'bytes; '+str(destination))

if __name__=='__main__':
    p=argparse.ArgumentParser()
    p.add_argument('--game',type=pathlib.Path,required=True)
    p.add_argument('--ktx-tool',default=None)
    p.add_argument('--quality',type=int,choices=[0,1,2,3,4],default=2)
    args=p.parse_args()
    encode(args.game,args.ktx_tool,args.quality)

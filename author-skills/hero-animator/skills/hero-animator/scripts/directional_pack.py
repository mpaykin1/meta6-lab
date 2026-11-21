#!/usr/bin/env python3
"""Artist-approved 4/8-way Hero Animator atlas packer.

Approval fingerprints certify the SAME source PNG clips, not the resulting
atlas layout. MaxRects only repositions byte-exact RGBA crops, with no rotation
or resizing, and keeps the existing per-action animation metadata contract.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path
from PIL import Image

DIR4=('front','right','back','left')
DIR8=('front','front_right','right','back_right','back','back_left','left','front_left')
LEGACY_ACTIONS=('idle','walk','run','jump','crouch','dodge','roll','attack')
ACTIONS=LEGACY_ACTIONS+('grab','hurt','death')


def clip_hash(folder:Path)->str:
    paths=sorted(p for p in folder.glob('*.png') if p.is_file())
    if not paths:
        raise ValueError(f'No artwork for {folder.name}')
    h=hashlib.sha256()
    canvas=None
    for p in paths:
        with Image.open(p) as im:
            rgba=im.convert('RGBA')
            if canvas is None:
                canvas=rgba.size
            if canvas!=rgba.size:
                raise ValueError(f'Canvas mismatch in {p}')
            h.update(rgba.width.to_bytes(4,'little'))
            h.update(rgba.height.to_bytes(4,'little'))
            h.update(rgba.tobytes())
    return h.hexdigest()


def main(argv=None):
    a=argparse.ArgumentParser(description=__doc__)
    a.add_argument('input_dir',type=Path)
    a.add_argument('output_dir',type=Path)
    a.add_argument('--id',required=True)
    a.add_argument('--approval',type=Path)
    a.add_argument('--directions',type=int,choices=(4,8),default=8)
    a.add_argument('--fingerprints',action='store_true',help='Print unapproved clip hashes, never pack')
    a.add_argument('--fps',type=int,default=12)
    a.add_argument('--profile',choices=('complete','legacy'),default='complete')
    a.add_argument('--events',type=Path)
    a.add_argument('--packer',choices=('maxrects','shelf'),default='maxrects')
    a.add_argument('--max-width',type=int,default=2048)
    a.add_argument('--max-height',type=int,default=2048)
    a.add_argument('--padding',type=int,default=2)
    a.add_argument('--no-auto-install',action='store_true')
    opts=a.parse_args(argv)
    dirs=DIR8 if opts.directions==8 else DIR4
    actions=ACTIONS if opts.profile=='complete' else LEGACY_ACTIONS
    required=[f'{act}_{direction}' for act in actions for direction in dirs]
    src=opts.input_dir
    missing=[name for name in required if not (src/name).is_dir()]
    if missing:
        raise SystemExit('BLOCKED: Missing actual illustrated views: '+', '.join(missing))
    hashes={name:clip_hash(src/name) for name in required}
    if opts.fingerprints:
        print(json.dumps({'hero_id':opts.id,'approved':False,'reference_sha256':None,
                          'actions':hashes},indent=2))
        return 0
    if not opts.approval or not opts.approval.is_file():
        raise SystemExit('BLOCKED: explicit artist approval manifest required')
    approval=json.loads(opts.approval.read_text(encoding='utf8'))
    if approval.get('hero_id')!=opts.id or approval.get('approved') is not True:
        raise SystemExit('BLOCKED: character identity not approved')
    ref=approval.get('reference_sha256','')
    if len(ref)!=64 or any(c not in '0123456789abcdef' for c in ref.lower()):
        raise SystemExit('BLOCKED: valid reference image SHA256 required')
    mismatched=[name for name in required if approval.get('actions',{}).get(name,'').lower()!=hashes[name].lower()]
    if mismatched:
        raise SystemExit('BLOCKED: missing or changed approval for '+', '.join(mismatched))
    impl=Path(__file__).with_name('images2atlas.py')
    cmd=[sys.executable,str(impl),str(src),str(opts.output_dir),'--id',opts.id,
         '--fps',str(opts.fps),'--packer',opts.packer,
         '--max-width',str(opts.max_width),'--max-height',str(opts.max_height),
         '--padding',str(opts.padding)]
    if opts.events:
        cmd.extend(['--events',str(opts.events)])
    if opts.no_auto_install:
        cmd.append('--no-auto-install')
    subprocess.run(cmd,check=True)
    meta_path=opts.output_dir/f'{opts.id}.json'
    meta=json.loads(meta_path.read_text(encoding='utf8'))
    meta['identity']={'hero_id':opts.id,'approved':True,'reference_sha256':ref,
                      'actions':{name:{'hero_id':opts.id,'sha256':hashes[name]} for name in required}}
    meta['directional']={'directions':opts.directions,'requiredActions':list(actions),
                         'profile':opts.profile,'viewSelection':'camera-relative',
                         'autoMirror':False,'missingAction':'block'}
    for name,digest in hashes.items():
        meta['anims'][name]['source_sha256']=digest
    meta_path.write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print('PACKED: '+str(meta_path))
    return 0


if __name__=='__main__':
    try:
        raise SystemExit(main())
    except (ValueError,OSError,subprocess.CalledProcessError) as exc:
        raise SystemExit('BLOCKED: '+str(exc))

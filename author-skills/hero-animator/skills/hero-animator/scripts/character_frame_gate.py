#!/usr/bin/env python3
"""Fail-closed character frame gate for Hero Animator: only distinct full-sprite PNG poses.

Character frame sets and SHA256 prove file identity, not artistic similarity.
Manual inspection against source artwork and full-body action semantics is essential.
"""
from __future__ import annotations
import argparse, ast, hashlib, json, re, sys
from pathlib import Path
from PIL import Image, ImageChops

BANNED_RENDER_CALLS={
    'cv2.remap','cv2.warpAffine','cv2.warpPerspective','cv2.calcOpticalFlowFarneback',
    'cv2.createOptFlow_DualTVL1','Image.transform','Image.rotate',
    'Image.Image.transform','Image.Image.rotate',
}
BANNED_REGEX=(r'\.morphTargetInfluences\b',r'\bskinning\b',r'\bmesh_warp\b',
              r'\bdeform_character\s*\(',r'\bRIFE\.Model\b',r'\boptical[_-]?flow\s*\(')

def check_renderer(path:Path):
    source=path.read_text('utf8')
    if path.suffix=='.py':
        tree=ast.parse(source,filename=str(path))
        for item in ast.walk(tree):
            if not isinstance(item,ast.Call):continue
            fn=item.func
            if isinstance(fn,ast.Attribute) and isinstance(fn.value,ast.Name):
                code=fn.value.id+'.'+fn.attr
                if code in BANNED_RENDER_CALLS:
                    raise ValueError(f'BLOCKED: character-safe renderer uses prohibited {code}')
    else:
        for rule in BANNED_REGEX:
            if re.search(rule,source,re.I):
                raise ValueError(f'BLOCKED: possible character deformation: {rule}')
    # Require explicit declaration for renderer; under no circumstance auto-approve.
    return True

def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()

def gate(path:Path,renderer:Path|None=None,preview=False):
    info=json.loads(path.read_text('utf8'))
    if info.get('approved') is not True and not preview:
        raise ValueError('Character art not approved; a full release is blocked')
    actors=info.get('characters')
    if not isinstance(actors,list) or not actors:
        raise ValueError('No separate character animation tracks')
    seen=set();results=[]
    for actor in actors:
        aid=actor.get('id');action=actor.get('action');paths=actor.get('poseFrames',[])
        hashes=actor.get('poseSHA256',[])
        if not isinstance(aid,str) or not aid or aid in seen:raise ValueError('Missing/duplicate stable character ID')
        seen.add(aid)
        if not isinstance(action,str) or not action:raise ValueError(f'{aid} missing action')
        if len(paths)<8 or len(paths)!=len(hashes):raise ValueError(f'{aid}: >=8 authored PNG poses with SHA required')
        imlist=[];filehash=[];sizes=set()
        for rel,expected in zip(paths,hashes):
            file=(path.parent/rel).resolve()
            if path.parent.resolve() not in file.parents:raise ValueError(f'{aid}: unsafe sprite path')
            if not file.is_file() or file.suffix.lower()!='.png':raise ValueError(f'{aid}: missing actual PNG {rel}')
            if sha(file)!=expected:raise ValueError(f'{aid}: PNG SHA changed {rel}')
            with Image.open(file) as im:
                if im.mode!='RGBA':raise ValueError(f'{aid}: PNG must contain original full RGBA art')
                imlist.append(im.copy());sizes.add(im.size)
            filehash.append(expected)
        if len(sizes)!=1:raise ValueError(f'{aid}: changing sprite canvas size')
        unique=len(set(im.tobytes() for im in imlist))
        if unique<5:raise ValueError(f'{aid}: missing full-body poses; {unique} unique of {len(paths)}')
        if any(not im.getbbox() for im in imlist):raise ValueError(f'{aid}: empty character frame')
        # Warn not certify silhouette/identity; check catastrophic changes and flash swaps.
        masks=[im.getchannel('A').point(lambda x:255 if x>=32 else 0) for im in imlist]
        for u,v in zip(masks,masks[1:]):
            aa=sum(1 for z in u.tobytes() if z)
            bb=sum(1 for z in v.tobytes() if z)
            inter=sum(1 for x,y in zip(u.tobytes(),v.tobytes()) if x and y)
            if inter/max(1,aa+bb-inter)<0.29:
                raise ValueError(f'{aid}: possible sprite identity or framing jump; review artistically')
        results.append({'id':aid,'action':action,'poses':len(paths),'distinct':unique})
    if renderer:check_renderer(renderer)
    return {'status':'PREVIEW / NOT APPROVED' if not info.get('approved') else 'STRUCTURE ONLY (artist review still mandatory)',
            'characters':len(actors),'actions':results,
            'artistic_review':'required for face/clothing/gesture/body/identity continuity'}

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('manifest',type=Path)
    p.add_argument('--renderer',type=Path)
    p.add_argument('--preview',action='store_true',help='Only an unapproved draft; never promote to release')
    a=p.parse_args()
    try: print(json.dumps(gate(a.manifest,a.renderer,a.preview),ensure_ascii=False,indent=2))
    except (ValueError,OSError,SyntaxError,KeyError) as e:sys.exit('BLOCKED: '+str(e))
if __name__=='__main__':main()

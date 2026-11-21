#!/usr/bin/env python3
"""Hero Animator canonical-character guard. No visible sprite sheet swaps across actor actions.

Call automatically from offline_pack.py AFTER gif2game.py and BEFORE embedding.
Do not confuse same source bytes with proof of same character INSIDE those bytes;
art frames still require visual review and explicit author approval.
"""
from __future__ import annotations
import argparse, hashlib, json
from pathlib import Path

ACTIONS=('idle','walk','run','jump','crouch','attack','pickup')

def lock_manifest(manifest:dict, canonical_id:str|None=None, *, strict:bool=True)->dict:
    """Freeze all player visuals to a single authored GIF source, preserving 3D controls.

    Existing approved action frame ranges of the canonical GIF are kept. Any action
    attributed to an alternate GIF is forbidden from displaying that different sprite.
    For attack, keep 3D hit interaction but show only the approved stationary frame,
    never substitute another human figure. Unavailable poses remain unavailable.
    """
    # 4/8-view 3D scene is different: each view requires an individually approved
    # image of this SAME character. Do not flatten those confirmed views into a
    # single side-on GIF. Fail closed on incomplete identity metadata.
    if manifest.get('directional') or manifest.get('viewAtlas') or manifest.get('directionalViews'):
        lock=manifest.get('characterLock') or manifest.get('character_lock') or {}
        if not lock.get('approved'):
            raise ValueError('Approved 4/8-view character identity metadata is required')
        return manifest
    clips={c['id']:c for c in manifest.get('clips',[])}
    roles=manifest.get('roles',{})
    ident=manifest.get('characterLock') or manifest.get('character_lock') or {}
    canonical_id=canonical_id or ident.get('canonical_clip_id') or roles.get('walk') or roles.get('idle')
    hero=clips.get(canonical_id)
    if not hero or not hero.get('alpha'):
        raise ValueError('Single-Hero Lock: no canonical transparent GIF chosen (select --hero-clip).')
    if not hero.get('sourceSHA256') or len(hero['sourceSHA256'])!=64:
        raise ValueError('Single-Hero Lock: canonical source SHA256 is missing.')
    src=hero['sourceSHA256']
    previous=ident.get('canonical_source_sha256') or ident.get('reference_sha256')
    if previous and previous!=src and strict:
        raise ValueError('Single-Hero Lock: approved hero source SHA256 does not match the canonical GIF.')
    old_roles=dict(roles);old_segs=manifest.get('segments',{});
    frame_count=hero['frameCount']
    # Visual movement is allowed only from canonical source, never a different actor.
    for action in ACTIONS:
        roles[action]=canonical_id if action in ('idle','walk','run','attack') else None
    segments={}
    for action in ('idle','walk','run','attack'):
        existing=old_segs.get(action)
        if old_roles.get(action)==canonical_id and isinstance(existing,dict) and existing.get('clip')==canonical_id:
            idx=existing.get('frames',[])
            if isinstance(idx,list) and idx and all(type(i) is int and 0<=i<frame_count for i in idx):
                segments[action]={'clip':canonical_id,'frames':idx}
                continue
        indices=list(range(frame_count)) if action in ('walk','run') else [0]
        segments[action]={'clip':canonical_id,'frames':indices}
    segments['idle']={'clip':canonical_id,'frames':[segments['idle']['frames'][0]]}
    # Engine's nonvisual physical jump and attack triggers stay available.
    # Both cannot show different heroes even when imported GIF has its own skin.
    roles['extras']=[x for x in roles.get('extras',[]) if x not in clips or not clips[x].get('alpha')]
    if not roles['extras']:roles['extras']=[]
    manifest['roles']=roles
    manifest['segments']=segments
    manifest['characterLock']={
        'hero_id':ident.get('hero_id') or 'canonical-player',
        'canonical_clip_id':canonical_id,
        'canonical_source_sha256':src,
        'mode':'single-source-immutable',
        'approved':ident.get('approved',False),
        'no_swaps':True,
    }
    manifest['identityInvariant']='All visible player frames come from one canonical GIF; no idle/attack/stop substitution.'
    used={canonical_id,roles.get('background'),roles.get('portal'),*(roles.get('extras') or [])}
    manifest['clips']=[c for c in manifest['clips'] if c['id'] in used]
    verify_manifest(manifest)
    return manifest

def verify_manifest(manifest):
    roles=manifest['roles'];ident=manifest['characterLock'];cid=ident['canonical_clip_id']
    for action in ACTIONS:
        if roles.get(action) not in (cid,None):raise ValueError('Hero swap on '+action)
        seg=manifest.get('segments',{}).get(action)
        if seg and seg['clip']!=cid:raise ValueError('Segment hero swap on '+action)
    cc=next((c for c in manifest['clips'] if c['id']==cid),None)
    if not cc or cc['sourceSHA256']!=ident['canonical_source_sha256']:
        raise ValueError('Hero source is no longer canonical')
    if any(c['id']==cid for c in manifest['clips'] if c.get('name') is None):raise ValueError('Bad hero asset')
    return True

def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('game_dir',type=Path)
    ap.add_argument('--hero-clip',help='Exact manifest clip id of one approved player GIF')
    args=ap.parse_args()
    p=args.game_dir/'assets'/'game.json'
    m=json.loads(p.read_text(encoding='utf8'))
    lock_manifest(m,args.hero_clip)
    p.write_text(json.dumps(m,ensure_ascii=False,separators=(',',':')),encoding='utf8')
    print('Hero visual identity fixed:',m['characterLock']['canonical_source_sha256'])

if __name__=='__main__':main()

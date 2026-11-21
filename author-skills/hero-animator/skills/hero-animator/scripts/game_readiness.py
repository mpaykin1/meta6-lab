#!/usr/bin/env python3
"""Fail closed on missing art or unverified game quality. Does not infer artistic approval.
Project JSON: directions (4/8), atlas (path), checks {name: {status,evidence,sha256}},
artReview {approved, reviewer, evidence, sha256}. Paths are relative to project JSON.
Usage: python game_readiness.py project.json --output readiness.json (exit 2 = BLOCKED).
"""
import argparse, hashlib, json
from pathlib import Path

ACTIONS=('idle','walk','run','jump','crouch','dodge','roll','attack','grab','hurt','death')
DIR4=('front','right','back','left')
DIR8=('front','front_right','right','back_right','back','back_left','left','front_left')
CHECKS=('distanceAnimation','transitions','groundShadow','alphaEdges','groundVariation',
        'depthOcclusion','lighting','inputDesktop','inputTouchPortrait','inputTouchLandscape',
        'combatAndGrab','jumpLanding','offline','visualDesktop','visualTouch')

def evidence_ok(record,root):
    if not isinstance(record,dict):return False
    name=record.get('evidence');digest=record.get('sha256')
    if not isinstance(name,str) or not isinstance(digest,str):return False
    p=(root/name).resolve()
    return p.is_file() and hashlib.sha256(p.read_bytes()).hexdigest()==digest.lower()

def audit(project,root):
    blockers=[];directions=project.get('directions',8)
    if directions not in (4,8):raise ValueError('directions must be 4 or 8')
    atlas=json.loads((root/project['atlas']).read_text(encoding='utf8'))
    dirs=DIR8 if directions==8 else DIR4
    required=[a+'_'+d for a in ACTIONS for d in dirs]
    missing=[];unapproved=[]
    identity=atlas.get('identity',{});proofs=identity.get('actions',{})
    ref=identity.get('reference_sha256','')
    identity_ok=identity.get('approved') is True and bool(identity.get('hero_id')) and len(ref)==64 and all(c in '0123456789abcdef' for c in ref.lower())
    for key in required:
        clip=atlas.get('anims',{}).get(key,{})
        if not clip.get('frames') or not clip.get('sheet'):
            missing.append(key);continue
        sheet=(root/Path(project['atlas']).parent/clip['sheet']).resolve()
        if not sheet.is_file():blockers.append('missing sheet: '+key)
        p=proofs.get(key,{})
        sha=clip.get('source_sha256','')
        if not identity_ok or p.get('hero_id')!=identity.get('hero_id') or len(sha)!=64 or any(c not in '0123456789abcdef' for c in sha.lower()) or p.get('sha256','').lower()!=sha.lower():unapproved.append(key)
    if missing:blockers.append('missing illustrated clips: '+', '.join(missing))
    if unapproved:blockers.append('unapproved identity/clips: '+', '.join(unapproved))
    review=project.get('artReview',{})
    if not (review.get('approved') is True and review.get('reviewer') and evidence_ok(review,root)):
        blockers.append('artistic review/approval not supplied')
    checks={}
    for name in CHECKS:
        rec=project.get('checks',{}).get(name,{})
        ok=rec.get('status')=='PASS' and evidence_ok(rec,root)
        checks[name]='PASS' if ok else 'UNVERIFIED'
        if not ok:blockers.append('unverified quality check: '+name)
    return {'status':'BLOCKED' if blockers else 'PASS','profile':'complete','directions':directions,
            'requiredClips':len(required),'missingClips':missing,'unapprovedClips':unapproved,
            'checks':checks,'blockers':blockers,
            'limits':'Evidence hashes verify files, not artistic semantics. Real user review required.'}

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('project',type=Path);p.add_argument('--output',type=Path)
    a=p.parse_args()
    try:r=audit(json.loads(a.project.read_text(encoding='utf8')),a.project.resolve().parent)
    except (OSError,ValueError,KeyError,TypeError) as e:r={'status':'BLOCKED','blockers':[str(e)]}
    result=json.dumps(r,ensure_ascii=False,indent=2)+'\n'
    if a.output:a.output.parent.mkdir(parents=True,exist_ok=True);a.output.write_text(result,encoding='utf8')
    print(result);return 0 if r['status']=='PASS' else 2
if __name__=='__main__':raise SystemExit(main())

#!/usr/bin/env python3
"""Grange P23–P28. Real optional engines, one fail-closed release pipeline."""
import argparse, hashlib, json, re, subprocess, sys, tempfile
from pathlib import Path
from urllib.request import urlopen
from urllib.parse import urlparse
import numpy as np
from PIL import Image, ImageSequence
import cv2
from texture_motion_gate import texture_parity, motion_gate

HERE=Path(__file__).resolve().parent
CHECKER_COMMIT='c9d1caac66d6c02188a3e39360ab596c4c37dfca'
CHECKER_BLOB='1974f78d62e15132f6479bebe4f70bbec9b5d2e4'
CHECKER_URL=f'https://raw.githubusercontent.com/mpaykin1/meta6-lab/{CHECKER_COMMIT}/asset-packs/incoming/bullet-car-gif/check_gif.py'

def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def raw(url):
    u=urlparse(url)
    if u.scheme!='https' or u.hostname!='raw.githubusercontent.com' or not re.match(r'^/[^/]+/[^/]+/[0-9a-f]{40}/.+',u.path): raise ValueError('immutable GitHub raw URL required')
    with urlopen(url,timeout=60) as r:
        if urlparse(r.geturl()).hostname!='raw.githubusercontent.com': raise ValueError('unexpected redirect')
        return r.read()
def gitblob(b): return hashlib.sha1(f'blob {len(b)}\0'.encode()+b).hexdigest()
def frames(p):
    with Image.open(p) as im: return [np.array(f.convert('RGBA')) for f in ImageSequence.Iterator(im)]
def run(args,allow_fail=False):
    p=subprocess.run([str(a) for a in args],capture_output=True,text=True,timeout=600)
    if p.returncode and not allow_fail: raise RuntimeError(f'{args[0]}: {p.stderr[-1000:]} {p.stdout[-500:]}')
    return p

def checker(path,ref,indices,cm,rm,action,exe,extra=()):
    cmd=[sys.executable,exe,path,ref,'--ref-indices',','.join(map(str,indices)),'--candidate-masks',cm,'--reference-masks',rm,'--action-json',action,*extra]
    p=run(cmd,True); d=json.loads(p.stdout);return p.returncode,d

def maskread(p,shape):
    m=np.array(Image.open(p).convert('L'))>=128
    if m.shape!=shape or not m.any(): raise ValueError(f'bad mask {p}')
    return m

def iou(a,b): return float(np.count_nonzero(a&b)/max(1,np.count_nonzero(a|b)))
def box(m):
    yy,xx=np.nonzero(m);return np.array([xx.min(),yy.min(),xx.max()+1,yy.max()+1],float)
def center(m):
    b=box(m);return (b[:2]+b[2:])/2

def segmenters(cfg):
    import torch
    from mobile_sam import sam_model_registry, SamPredictor
    from sam2.build_sam import build_sam2
    from sam2.sam2_image_predictor import SAM2ImagePredictor
    dev=cfg.get('device','cpu')
    for k in ('mobile_checkpoint','sam2_checkpoint'):
        if not Path(cfg[k]).is_file(): raise FileNotFoundError(cfg[k])
    mobile=SamPredictor(sam_model_registry['vit_t'](checkpoint=cfg['mobile_checkpoint']).to(dev).eval())
    sam=SAM2ImagePredictor(build_sam2(cfg['sam2_config'],cfg['sam2_checkpoint'],device=dev))
    def segment(f,p):
        rgb=f[...,:3].copy(); rgb[f[...,3]==0]=0
        coords=np.array(p['points'],np.float32); labels=np.array(p['labels'],np.int32); b=np.array(p['box'],np.float32)
        out=[]
        with torch.inference_mode():
            for model in (mobile,sam):
                model.set_image(rgb); masks,scores,_=model.predict(point_coords=coords,point_labels=labels,box=b,multimask_output=True)
                out.append(np.asarray(masks[int(np.argmax(scores))],bool)&(f[...,3]>0))
        return out
    return segment

def checked_masks(fs, entries, out, seg=None):
    if len(fs)!=len(entries): raise ValueError('one body entry per actual frame required')
    out.mkdir(); ms=[]; agreement=[]
    for i,(f,e) in enumerate(zip(fs,entries)):
        m=maskread(e['body_mask'],f.shape[:2]);alpha=f[...,3]>0
        if np.any(m&~alpha):raise ValueError('body mask outside visible pixels')
        if seg:
            a,b=seg(f,e['prompt']); scores=[iou(a,b),iou(a,m),iou(b,m)];agreement.append(scores)
            if min(scores)<.90: raise ValueError(f'P25 segmentation disagreement frame {i}: {scores}')
        elif e.get('approved_mask_sha256')!=sha(e['body_mask']):raise ValueError('manual body mask approval/hash required')
        Image.fromarray(m.astype('uint8')*255).save(out/f'{i:04}.png');ms.append(m)
    return ms,agreement

def parity(fs,rs,cm,rm,ids,entries,tmp,action):
    ratios=[]; textures=[]
    for i,(f,j,m,e) in enumerate(zip(fs,ids,cm,entries)):
        r=rs[j]; ref=rm[j]
        if f.shape!=r.shape:raise ValueError('registered reference must use same canvas')
        # Explicit translation only; no fitted scale, deformation or free homography.
        delta=np.asarray(e.get('registration_xy',[0,0]),float)
        if delta.shape!=(2,) or not np.all(np.isfinite(delta)):raise ValueError('bad registration')
        if np.max(np.abs(delta))>max(f.shape[:2])*.15:raise ValueError('registration exceeds 15% canvas')
        scale=float(e.get('registration_scale',1))
        if scale!=1 and (action!='jump' or not .84<=scale<=1.04):raise ValueError('registration scaling only for jump after independent P10 check')
        pivot=center(m); shift=delta+(1-scale)*pivot
        matrix=np.array([[scale,0,shift[0]],[0,scale,shift[1]]],np.float32)
        aligned=cv2.warpAffine(f,matrix,(f.shape[1],f.shape[0]),flags=cv2.INTER_NEAREST)
        am=cv2.warpAffine(m.astype('uint8'),matrix,(f.shape[1],f.shape[0]),flags=cv2.INTER_NEAREST)>0
        if iou(am,ref)<.85:raise ValueError(f'P23 body IoU below .85 frame {i}')
        protected=am&ref
        if e.get('allowed_edit_mask'):
            edit=maskread(e['allowed_edit_mask'],m.shape)
            if e.get('approved_edit_sha256')!=sha(e['allowed_edit_mask']):raise ValueError('unapproved edit mask')
            protected &= ~edit
        if protected.sum()<.70*ref.sum():raise ValueError('P23 protected area below 70%')
        for name,img in [('a',aligned),('b',r),('m',protected.astype('uint8')*255)]: (tmp/f'{name}.rgba').write_bytes(np.ascontiguousarray(img).tobytes())
        d=json.loads(run(['node',HERE/'pixelmatch_gate.mjs',tmp/'a.rgba',tmp/'b.rgba',tmp/'m.rgba',f.shape[1],f.shape[0]]).stdout);ratios.append(d['ratio'])
        if d['ratio']>.03:raise ValueError(f'P23 Pixelmatch frame {i}: {d["ratio"]:.4f} > .03')
        t=texture_parity(aligned,r,protected); textures.append(t)
        if not t['pass']:raise ValueError(f'P29 SSIM texture mismatch frame {i}: {t}')
    return {'pixelmatch':ratios,'ssim':textures}

def anti_jerk(cm,ts,once):
    # Inspired by Hero Animator's trajectory/identity gate, not its 40–60s scene profile.
    xy=np.array([center(m) for m in cm]);t=np.array(ts,float)/1000
    if len(xy)<3 or min(t)<=0:raise ValueError('invalid trajectory')
    delta=np.diff(xy,axis=0);dt=t[:-1]
    if not once:delta=np.vstack([delta,xy[0]-xy[-1]]);dt=t
    v=delta/dt[:,None]; acceleration=np.diff(v,axis=0)
    if not once:acceleration=np.vstack([acceleration,v[0]-v[-1]])
    size=float(np.median([max(box(m)[2:]-box(m)[:2]) for m in cm]));step=float(np.linalg.norm(delta,axis=1).max());speed=float(np.linalg.norm(v,axis=1).max());kick=float(np.linalg.norm(acceleration,axis=1).max())
    if step>size*.12 or kick>max(size*.30,speed*1.8):raise ValueError('P24 abrupt centroid displacement or velocity discontinuity')
    return {'max_step_px':step,'max_speed_px_s':speed,'max_velocity_change_px_s':kick}

def decode_probe(p,n,ts):
    d=json.loads(run(['ffprobe','-v','error','-count_frames','-select_streams','v:0','-show_streams','-of','json',p]).stdout)['streams'][0]
    if d['codec_name']!='gif' or int(d['nb_read_frames'])!=n:raise ValueError('FFprobe decoded frame count mismatch')
    if abs(float(d['duration'])-sum(ts)/1000)>.025:raise ValueError('FFprobe duration mismatch')
    return {'frames':n,'duration':float(d['duration'])}

def regress(exe,root):
    cases=[('11_bump_jump.gif','P10','85efe78d8aa174392e4472f523e2c99c6c75158bb90579d57ba292c18ba27776'),('12_night_lights.gif','P9','5b09e720e563f1048a55776aea3765222cf8746bae1d7edb636e22c025133038'),('13_damage_1.gif','P8','cec4949a4991b33dbcd4a9e4eff3108c935693f663a1ca58f976f8c57e8518fa')]; out={}
    for name,rule,expected in cases:
        if sha(root/name)!=expected:raise ValueError('P26 historical fixture changed: '+name)
        p=run([sys.executable,exe,root/name],True);d=json.loads(p.stdout);actual=[e['rule'] for e in d['errors']]
        if p.returncode==0 or not any(rule in x for x in actual):raise ValueError('P26 regression escaped: '+name)
        out[name]={'errors':actual,'blocked':[e['rule'] for e in d['blocked']]}
        if name.startswith('13') and not any('P10' in r for r in actual+out[name]['blocked']):raise ValueError('P26 damage action unexpectedly accepted')
    return out

def main():
    p=argparse.ArgumentParser();p.add_argument('manifest',type=Path);p.add_argument('--publication',action='store_true');a=p.parse_args();result={'status':'BLOCKED'}
    try:
        c=json.loads(a.manifest.read_text()); cand=Path(c['candidate']); ref=Path(c['reference']); fs=frames(cand);rs=frames(ref);ids=c['ref_indices'];
        if sha(ref)!=c['approved_reference_sha256']:raise ValueError('reference bytes changed')
        if len(ids)!=len(fs) or any(type(j)!=int or j<0 or j>=len(rs) for j in ids):raise ValueError('invalid angle map')
        with tempfile.TemporaryDirectory() as td:
            tmp=Path(td);exe=HERE/'check_gif.py'; result['checker']='bundled preliminary only'
            if a.publication:
                payload=raw(CHECKER_URL)
                if gitblob(payload)!=CHECKER_BLOB:raise ValueError('P27 canonical checker blob mismatch')
                exe=tmp/'check_gif.py';exe.write_bytes(payload); result['checker']=CHECKER_URL
                candidate_bytes=raw(c['candidate_raw_url'])
                if hashlib.sha256(candidate_bytes).hexdigest()!=sha(cand):raise ValueError('P22 local and published bytes differ')
            if c.get('regression_dir'): result['regression']=regress(exe,Path(c['regression_dir']))
            elif a.publication:raise ValueError('P26 required regression fixtures absent')
            seg=segmenters(c['segmentation']) if c.get('segmentation') else None
            cm,ca=checked_masks(fs,c['candidate_frames'],tmp/'cm',seg);rm,ra=checked_masks(rs,c['reference_frames'],tmp/'rm',seg)
            result['segmentation']={'mode':'MobileSAM+SAM2' if seg else 'approved supplied masks','candidate_iou':ca,'reference_iou':ra}
            extra=['--raw-url',c['candidate_raw_url']] if a.publication else []
            if c.get('once'):extra+=['--once']
            if c.get('rigid'):extra+=['--rigid']
            rc,d=checker(cand,ref,ids,tmp/'cm',tmp/'rm',c['action_json'],exe,extra);result['P22']=d
            if rc or not d.get('numeric_pass'):raise ValueError('P0–P22 failed')
            result['anti_jerk']=anti_jerk(cm,d['durations_ms'],c.get('once',False))
            result['P30_optical_flow']=motion_gate(fs,cm,d['durations_ms'],c.get('once',False),d['action'],c.get('rigid',False),ids)
            if not result['P30_optical_flow']['pass']:raise ValueError('P30 feature-motion gate failed')
            visual=parity(fs,rs,cm,rm,ids,c['candidate_frames'],tmp,d['action']);result['pixelmatch']=visual['pixelmatch'];result['P29_ssim']=visual['ssim'];result['ffprobe']=decode_probe(cand,len(fs),d['durations_ms'])
            if c.get('visual_review_approved') is not True or c.get('visual_review_sha256')!=sha(cand):raise ValueError('visual P1/P9a/P10 approval of exact bytes missing')
            result['status']='PASS_PUBLICATION_GATE' if a.publication else 'PASS_PRELIMINARY';result['sha256']=sha(cand)
    except Exception as e:result['error']=str(e)
    print(json.dumps(result,ensure_ascii=False,indent=2));return 0 if result['status'].startswith('PASS') else 1
if __name__=='__main__':raise SystemExit(main())

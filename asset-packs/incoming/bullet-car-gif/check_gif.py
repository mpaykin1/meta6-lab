#!/usr/bin/env python3
"""Grange decoded-pixel gate. Pillow + NumPy. Missing evidence never passes.
Action JSON (paths relative to JSON): {"action":"jump|light|damage|turn|drive|other",
"pause_transitions": [indices], "beam_masks":"dir", "beam_axis":[0,-1],
"permanent_masks":["dir"], "flash_masks":"dir", "damage_zones":["mask.png",...]}.
Mask directories contain one sorted PNG per decoded frame or one common mask.
Use --candidate-masks/--reference-masks for body only; for damage register body
frames to the intact same-angle reference before measurement. Visual identity and
readability remain mandatory and are not certified by this numeric checker.
"""
import argparse, hashlib, json, re, tempfile
from urllib.request import urlopen
from urllib.parse import urlparse
from pathlib import Path
import numpy as np
from PIL import Image, ImageSequence, ImageChops, ImageStat


def load(path):
    with Image.open(path) as im:
        loop=im.info.get('loop'); fs=[]; ts=[]
        for frame in ImageSequence.Iterator(im):
            a=np.array(frame.convert('RGBA')); a[a[...,3]==0,:3]=0
            fs.append(a); ts.append(frame.info.get('duration',0))
        return fs,ts,loop


def preservation_diff(a,b):
    m=(a[...,3]>0)|(b[...,3]>0)
    return float(np.abs(a.astype(np.int16)-b.astype(np.int16))[m].mean()) if m.any() else 0.


def rgb_frames(path):
    with Image.open(path) as im:
        return [frame.convert('RGB').copy() for frame in ImageSequence.Iterator(im)]


def diff(a,b):
    return sum(ImageStat.Stat(ImageChops.difference(a,b)).mean)/3.0

def bbox(m):
    y,x=np.nonzero(m)
    if not len(x): raise ValueError('empty object mask')
    return np.array([x.min(),y.min(),x.max()+1,y.max()+1])


def masks(path,fs,intersect=True):
    if path is None: return [f[...,3]==255 for f in fs]
    path=Path(path); files=sorted(path.glob('*.png')) if path.is_dir() else [path]
    if len(files) not in (1,len(fs)): raise ValueError(f'mask count mismatch: {path}')
    out=[]
    for i,f in enumerate(fs):
        with Image.open(files[i if len(files)>1 else 0]) as im: m=np.asarray(im.convert('L'))>=128
        if m.shape!=f.shape[:2]: raise ValueError(f'mask size mismatch: {path}')
        out.append(m & (f[...,3]==255) if intersect else m)
    return out


def luma(a): return a[...,:3].astype(float) @ np.array([.2126,.7152,.0722])


def span(mask,axis):
    y,x=np.nonzero(mask)
    if not len(x): return 0.
    t=x*axis[0]+y*axis[1]; return float(t.max()-t.min()+1)


def main():
    p=argparse.ArgumentParser(description=__doc__,formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('candidate',type=Path);p.add_argument('--raw-url',help='raw.githubusercontent.com URL; mandatory for publication verification');p.add_argument('reference',type=Path,nargs='?')
    p.add_argument('--ref-indices',help='one index or comma-separated index per frame')
    p.add_argument('--candidate-masks',type=Path);p.add_argument('--reference-masks',type=Path)
    p.add_argument('--rigid',action='store_true');p.add_argument('--once',action='store_true')
    p.add_argument('--preserve-prefix',type=Path);p.add_argument('--action-json',type=Path)
    p.add_argument('--action',choices=['jump','light','damage','turn','drive','other'])
    p.add_argument('--min-frames',type=int,default=12);p.add_argument('--max-frames',type=int,default=24)
    p.add_argument('--max-side',type=int,default=320);p.add_argument('--max-bytes',type=int,default=1500000)
    a=p.parse_args(); errors=[]; blocked=[]; data={}
    def fail(rule,msg): errors.append({'rule':rule,'detail':msg})
    def block(rule,msg): blocked.append({'rule':rule,'detail':msg})
    try:
        if a.raw_url:
            u=urlparse(a.raw_url)
            if u.scheme!='https' or u.hostname!='raw.githubusercontent.com' or Path(u.path).name!=a.candidate.name:
                raise ValueError('P22: expected matching HTTPS GitHub raw URL')
            with urlopen(a.raw_url,timeout=60) as response:
                payload=response.read()
                if urlparse(response.geturl()).hostname!='raw.githubusercontent.com': raise ValueError('P22: unexpected redirect')
            temp=tempfile.TemporaryDirectory()
            a.candidate=Path(temp.name)/a.candidate.name
            a.candidate.write_bytes(payload)
        data.update(metric='P22 RGB full canvas Pillow',raw_url=a.raw_url,publication_source_verified=bool(a.raw_url))
        rgb=rgb_frames(a.candidate)
        fs,ts,loop=load(a.candidate); n=len(fs); h,w=fs[0].shape[:2]
        data.update(file=a.candidate.name,sha256=hashlib.sha256(a.candidate.read_bytes()).hexdigest(),size_px=[w,h],frames=n,bytes=a.candidate.stat().st_size,durations_ms=ts,loop=loop)
        cfg=json.loads(a.action_json.read_text()) if a.action_json else {}; root=a.action_json.parent if a.action_json else Path('.')
        def rel(key): return root/cfg[key] if cfg.get(key) else None
        name=a.candidate.stem.lower(); inferred='jump' if re.search('jump|bump',name) else 'light' if re.search('light|brake|night',name) else 'damage' if 'damage' in name else 'turn' if 'turn' in name else 'drive' if 'drive' in name else 'other'
        action=a.action or cfg.get('action') or inferred;data['action']=action
        if inferred in ('jump','light','damage') and action!=inferred: block('P13','action conflicts with filename')
        if not a.min_frames<=n<=a.max_frames or max(w,h)>a.max_side or data['bytes']>a.max_bytes: fail('P0','default frame/size/weight limits (override only for explicit order)')
        cm=masks(a.candidate_masks,fs); sizes=np.array([bbox(m)[2:]-bbox(m)[:2] for m in cm]);data['body_bbox_wh']=sizes.tolist()
        data['alpha_transparent_pixels']=[int((f[...,3]==0).sum()) for f in fs]
        for i,f in enumerate(fs):
            m=f[...,3]>0
            if not m.any() or m.all(): fail('P0',f'frame {i}: missing foreground/transparency')
            if m[0].any() or m[-1].any() or m[:,0].any() or m[:,-1].any(): fail('P3a',f'frame {i}: clipping risk, touches border')
        if n<2: fail('P9','not animated');adj=[]; seam=0.;mx=0.;mn=0.
        else:
            adj=[diff(x,y) for x,y in zip(rgb,rgb[1:])];seam=diff(rgb[-1],rgb[0]);mx=max(adj);mn=min(adj)
        data.update(adjacent_differences=adj,adjacent_min=mn,adjacent_max=mx,adjacent_mean=float(np.mean(adj)) if adj else 0.,seam=None if a.once else seam)
        if mx<2: fail('P9',f'P22 full-frame RGB max {mx:.8f} <2')
        if not a.once and (seam>mx+1e-9 or seam==0 or loop!=0): fail('P4','seam above internal max, duplicate closing frame, or not infinite loop')
        if a.once and loop==0: fail('P4','one-shot requested but infinite loop')
        pause=cfg.get('pause_transitions',[]); allowed=set()
        if pause:
            peak=float(sizes.max(axis=0).prod()); peak_ids={i for i,s in enumerate(sizes) if s.prod()>=.98*peak}
            if action=='jump' and len(set(pause))<=2 and all(isinstance(i,int) and 0<=i<n-1 and i in peak_ids and i+1 in peak_ids for i in pause) and max(pause)-min(pause)<=1: allowed=set(pause)
            else: fail('P8','invalid pause exemption')
        motion=adj+([] if a.once else [seam]); regular=[d for i,d in enumerate(motion) if i not in allowed]
        if not regular or min(regular)<mx/3-1e-9: fail('P8','P22 min regular transition < max/3')
        if any(d==0 for i,d in enumerate(adj) if i not in allowed): fail('P8','duplicate frames')
        normal_times=[t for i,t in enumerate(ts) if i not in allowed]
        if not normal_times or min(normal_times)<=0 or min(normal_times)/max(normal_times)<.8 or (allowed and sum(ts[i] for i in allowed)>2*max(normal_times)): fail('P8','uneven or invalid frame timing')
        rs=rm=ids=None
        if not a.reference or not a.ref_indices: block('P1/P3/P3a','reference and explicit angle mapping required')
        else:
            rs,_,_=load(a.reference);rm=masks(a.reference_masks,rs);ids=list(map(int,a.ref_indices.split(',')))
            if len(ids)==1: ids*=n
            if len(ids)!=n or min(ids)<0 or max(ids)>=len(rs): raise ValueError('invalid reference index mapping')
            data['reference_sha256']=hashlib.sha256(a.reference.read_bytes()).hexdigest();data['reference_indices']=ids
            delta=[];scale=[];rig=[];rgb=[]
            for i,(f,j) in enumerate(zip(fs,ids)):
                m,ref=cm[i],rm[j]; r=rs[j]; b,c=bbox(m),bbox(ref); wh=c[2:]-c[:2]
                x=f[m,:3].mean(0);y=r[ref,:3].mean(0);delta.append(np.abs(x-y));rgb.append({'candidate':x.tolist(),'reference':y.tolist()})
                d=np.abs((b[2:]-b[:2])/wh-1)*100;scale.append(d.tolist())
                if action!='jump' and np.any(d>3+1e-9): fail('P3a',f'frame {i} bbox deviation {d.round(2).tolist()}%')
                if a.rigid and action!='jump':
                    if m.shape!=ref.shape: block('P3a','rigid comparison requires equal canvas');continue
                    shift=float(np.max(np.abs((b[:2]+b[2:]-c[:2]-c[2:])/2)));iou=float((m&ref).sum()/(m|ref).sum());rig.append({'frame':i,'center_delta_px':shift,'iou':iou})
                    if np.any(np.abs((b[2:]-b[:2])-wh)>np.maximum(1,wh*.02)) or shift>2 or iou<.95: fail('P3a',f'frame {i}: rigid body drift')
            d=np.max(delta,axis=0);data.update(delta_rgb_max=d.tolist(),rgb_means=rgb,scale_delta_percent=scale,rigid=rig)
            if np.any(d>10): fail('P3','RGB channel delta >10')
        result={};data['action_measurement']=result
        if action=='jump':
            baseline=np.array(bbox(rm[ids[0]])[2:]-bbox(rm[ids[0]])[:2]) if rm is not None else sizes[0]
            growth=(sizes/baseline-1)*100; peak_idx=int(np.argmax(growth.mean(axis=1))); g=growth[peak_idx]
            ground=np.max(np.abs(growth),axis=1)<=3
            result.update(peak_frame=peak_idx,peak_growth_percent=g.tolist(),baseline_wh=baseline.tolist(),ground_frames=np.flatnonzero(ground).tolist())
            if not ground.any(): fail('P10/P13','jump never returns to baseline size (within 3%)')
            if np.any(g<12) or np.any(g>18): fail('P10/P13','jump peak growth not 12–18% in both dimensions')
        if action=='light':
            if not all(cfg.get(k) for k in ('beam_masks','beam_axis','permanent_masks','flash_masks')) or a.candidate_masks is None: block('P10/P13','body, beam, permanent-light and flash masks plus axis required')
            else:
                axis=np.asarray(cfg['beam_axis'],float); norm=np.linalg.norm(axis)
                if axis.shape!=(2,) or not norm: raise ValueError('invalid beam axis')
                axis/=norm; bm=masks(rel('beam_masks'),fs,False); pm=[masks(root/k,fs,False) for k in cfg['permanent_masks']]; fm=masks(rel('flash_masks'),fs,False)
                ratios=[]; brightness=[]; visible=[]; beam_coverage=[]
                for i,f in enumerate(fs):
                    lum=luma(f); on=(f[...,3]>0)&(lum>=40); lit=bm[i]&on&~cm[i]
                    ratios.append(span(lit,axis)/max(1,span(cm[i],axis)))
                    yy,xx=np.indices(lit.shape); proj=xx*axis[0]+yy*axis[1]; region=bm[i]&~cm[i]
                    if region.any():
                        lo,hi=proj[region].min(),proj[region].max(); bins=np.minimum(9,np.floor((proj-lo)*10/max(1,hi-lo+1)).astype(int)); fractions=[float(lit[region&(bins==k)].mean()) if (region&(bins==k)).any() else 0. for k in range(10)];beam_coverage.append(min(fractions))
                    else: beam_coverage.append(0.)
                    if not fm[i].any(): raise ValueError('empty flash mask')
                    brightness.append(float(lum[fm[i]].mean()));visible.append([bool((m[i]&on).any()) for m in pm])
                change=(max(brightness)-min(brightness))/max(1,max(brightness))*100;result.update(beam_body_ratios=ratios,flash_brightness=brightness,flash_change_percent=change,permanent_visible=visible,beam_min_bin_coverage=beam_coverage)
                if min(ratios)<1 or change<40 or not all(all(v) for v in visible): fail('P10/P13','short/missing beams, flash <40%, or absent permanent lights')
                if min(beam_coverage)<.10: fail('P10/P13','beam is only scattered points or has empty longitudinal segments')
        if action=='damage':
            zones=cfg.get('damage_zones',[])
            if len(zones)<3 or rs is None: block('P10/P13','intact registered reference and >=3 independent zone masks required')
            else:
                zms=[masks(root/z,fs,False) for z in zones];changed=[]
                for i,(f,j) in enumerate(zip(fs,ids)):
                    r=rs[j]
                    if r.shape!=f.shape: raise ValueError('damage reference must be registered on same canvas')
                    zz=[z[i] & rm[j] for z in zms]
                    if any(not z.any() for z in zz) or any((x&y).any() for k,x in enumerate(zz) for y in zz[k+1:]): raise ValueError('damage zones empty or overlap')
                    dd=np.abs(f.astype(np.int16)-r.astype(np.int16))[...,:3].mean(axis=2);changed.append([float((dd[z]>=12).mean()) for z in zz])
                counts=[sum(v>=.10 for v in row) for row in changed];result.update(zone_changed_fractions=changed,zones_changed_min=min(counts),zones_changed_per_frame=counts)
                if min(counts)<3: fail('P10/P13','fewer than 3 substantially changed zones')
        if a.preserve_prefix:
            old,ot,_=load(a.preserve_prefix)
            if len(old)<2 or n<=len(old) or old[0].shape!=fs[0].shape: fail('P4','invalid preserved prefix')
            else:
                d=max(preservation_diff(x,y) for x,y in zip(old,fs)); oldrgb=rgb_frames(a.preserve_prefix); oldmax=max(diff(x,y) for x,y in zip(oldrgb,oldrgb[1:])); newmax=max(adj[len(old)-1:]+[seam]);timing=ts[:len(old)]==ot
                data['preservation']={'prefix_delta':d,'timing_exact':timing,'old_max':oldmax,'new_seam_max':newmax}
                if d!=0 or not timing or newmax>oldmax+1e-9 or not all(min(ot)<=t<=max(ot) for t in ts[len(old):]): fail('P4','old frames/times changed or new seam above original max')
    except Exception as e: block('P12/P13',str(e))
    data.update(numeric_pass=not(errors or blocked),status='FAIL' if errors else 'BLOCKED' if blocked else 'PASS_NUMERIC',errors=errors,blocked=blocked,visual_identity='REQUIRED_P1',visual_action='REQUIRED_P10',visual_light_and_edges='REQUIRED_P3a')
    print(json.dumps(data,ensure_ascii=False,indent=2));return 1 if errors or blocked else 0

if __name__=='__main__': raise SystemExit(main())

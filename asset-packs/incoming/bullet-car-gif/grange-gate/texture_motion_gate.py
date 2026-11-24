#!/usr/bin/env python3
"""P29/P30: independent structural texture and real feature-motion gates.
Uses genuine scikit-image SSIM and OpenCV pyramidal LK; never changes source art.
"""
import numpy as np
import cv2
from skimage.metrics import structural_similarity


def texture_parity(a,b,protected):
    # SSIM windows entirely within the already approved protected pixels.
    p=np.asarray(protected,bool)
    if a.shape!=b.shape or a.shape[:2]!=p.shape: raise ValueError('P29 canvas mismatch')
    valid=cv2.erode(p.astype('uint8'),np.ones((7,7),np.uint8),borderType=cv2.BORDER_CONSTANT,borderValue=0)>0
    if valid.sum()<max(64,.15*p.sum()): raise ValueError('P29 insufficient protected texture windows')
    _, score=structural_similarity(a[...,:3],b[...,:3],channel_axis=-1,data_range=255,win_size=7,full=True)
    local=np.asarray(score).mean(axis=2)[valid]
    return {'mean_ssim':float(local.mean()),'p10_ssim':float(np.quantile(local,.10)), 'low_fraction':float(np.mean(local<.80)),'windows':int(valid.sum()),'pass':bool(local.mean()>=.94 and np.quantile(local,.10)>=.85 and np.mean(local<.80)<=.05)}


def gray(f):
    # Alpha is used only for tracking, not the P22 measurement.
    return cv2.cvtColor(np.where(f[...,3:4]>0,f[...,:3],0).astype('uint8'),cv2.COLOR_RGB2GRAY)


def track_pair(a,b,ma,mb,points=None):
    inner=cv2.erode(ma.astype('uint8'),np.ones((9,9),np.uint8))
    target=cv2.erode(mb.astype('uint8'),np.ones((9,9),np.uint8))>0
    if points is None:
        points=cv2.goodFeaturesToTrack(a,maxCorners=160,qualityLevel=.008,minDistance=4,mask=inner,blockSize=5)
    if points is None or len(points)==0: return np.empty((0,2)),np.empty((0,2)),np.zeros(0,bool)
    opts=dict(winSize=(15,15),maxLevel=2,criteria=(cv2.TERM_CRITERIA_EPS|cv2.TERM_CRITERIA_COUNT,30,.01))
    nxt,s1,_=cv2.calcOpticalFlowPyrLK(a,b,points,None,**opts)
    if nxt is None: return points.reshape(-1,2),np.zeros((len(points),2)),np.zeros(len(points),bool)
    back,s2,_=cv2.calcOpticalFlowPyrLK(b,a,nxt,None,**opts)
    p=points.reshape(-1,2); q=nxt.reshape(-1,2)
    if back is None:return p,q,np.zeros(len(p),bool)
    finite=np.isfinite(q).all(axis=1)&np.isfinite(back.reshape(-1,2)).all(axis=1)
    safe=np.where(np.isfinite(q),q,-1); ij=np.rint(safe).astype(int); h,w=target.shape
    inside=(ij[:,0]>=0)&(ij[:,0]<w)&(ij[:,1]>=0)&(ij[:,1]<h)
    body=np.zeros(len(p),bool);body[inside]=target[ij[inside,1],ij[inside,0]]
    ok=finite&inside&body&(s1.ravel()>0)&(s2.ravel()>0)&(np.linalg.norm(back.reshape(-1,2)-p,axis=1)<=1.25)
    return p,q,ok


def motion_gate(fs, masks, ts, once=False, action='other', rigid=False, reference_indices=None):
    if len(fs)!=len(masks) or len(fs)!=len(ts) or len(fs)<3 or min(ts)<=0: raise ValueError('P30 invalid frames/timing')
    n=len(fs); gs=[gray(f) for f in fs]; sizes=[]
    for m in masks:
        y,x=np.nonzero(m)
        if len(x)==0: raise ValueError('P30 empty body')
        sizes.append(max(x.max()-x.min()+1,y.max()-y.min()+1))
    size=float(np.median(sizes)); steps=n-1 if once else n
    # Strict local feature tracking for a fixed-view drive/turn/damage/light/jump or rigid action.
    # Across authored view changes/pose changes tracks may disappear naturally; report rather than
    # enforce strict texture continuity. The same P22 and P23/P29 still apply per frame.
    strict=bool(rigid or (action in ('drive','damage','light','jump','turn') and (reference_indices is None or len(set(reference_indices))==1)))
    pairs=[]; errors=[]; velocities=[]
    for i in range(steps):
        j=(i+1)%n;p,q,ok=track_pair(gs[i],gs[j],masks[i],masks[j]);count=int(ok.sum());ratio=count/max(1,len(p))
        d=q[ok]-p[ok]; dt=ts[i]/1000
        med=np.median(d,axis=0) if count else np.zeros(2); velocities.append(med/dt)
        # Photometric continuity in motion-compensated local patches, not global brightness alone.
        # Only compare patches inside both body masks (track_pair erodes them first).
        patch_scores=[]
        for x,y in zip(p[ok],q[ok]):
            pa=cv2.getRectSubPix(gs[i],(7,7),tuple(map(float,x)))
            pb=cv2.getRectSubPix(gs[j],(7,7),tuple(map(float,y)))
            patch_scores.append(float(structural_similarity(pa,pb,data_range=255,win_size=7)))
        patch_low=float(np.mean(np.array(patch_scores)<.75)) if patch_scores else 1.
        pairs.append({'from':i,'to':j,'features':len(p),'tracked':count,'coverage':float(ratio),'median_speed_px_s':float(np.linalg.norm(med)/dt),'patch_ssim_low_fraction':patch_low})
        if strict and count>=8 and patch_low>.25:errors.append(f'P30 local flicker/texture discontinuity {i}->{j}: {patch_low:.3f}')
        if strict and (count<8 or ratio<.65):errors.append(f'P30 unreliable feature continuity {i}->{j}: {count}/{len(p)}')
    reversals=[]
    for i in range(n-2 if once else n):
        j=(i+1)%n;k=(i+2)%n
        p,q,ok=track_pair(gs[i],gs[j],masks[i],masks[j]);p,q=p[ok],q[ok]
        if len(q)<8:continue
        _,r,ok2=track_pair(gs[j],gs[k],masks[j],masks[k],q.astype('float32').reshape(-1,1,2));u=(q-p)[ok2];v=(r-q)[ok2]
        if len(u)<8:continue
        mag1=np.linalg.norm(u,axis=1);mag2=np.linalg.norm(v,axis=1)
        # Require a substantial displacement in both steps; slow turning-point reversals are allowed.
        speed1=mag1/(ts[i]/1000);speed2=mag2/(ts[j]/1000)
        dot=np.sum(u*v,axis=1)/np.maximum(mag1*mag2,1e-6)
        # Detect local motion reversals even when the whole-body centroid stays still.
        bad=(mag1>=max(2.,.012*size))&(mag2>=max(2.,.012*size))&(dot<-.85)&(np.minimum(speed1,speed2)>=.12*size)
        frac=float(bad.mean());reversals.append({'from':i,'fraction':frac,'tracks':len(u)})
        if strict and frac>=.45:errors.append(f'P30 abrupt local reversal {i}->{j}->{k}: {frac:.3f}')
    return {'strict_fixed_view':strict,'pairs':pairs,'reversals':reversals,'errors':errors,'pass':not errors,'note':'Variable-view/nonrigid optical flow is diagnostic, never proof of animation or identity.'}

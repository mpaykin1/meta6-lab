#!/usr/bin/env python3
"""Layered, identity-locked cutout animator. Independent timelines + joint rotation.

Works with the original render_scene.py (v0.1) for source masks/sky/particles/GIF.
Only marked ACTOR source pixels are used to build puppet parts; no synthetic identities.
Accurate anatomy requires masks/landmarks (SAM2, human authoring, or posed sprites).
"""
import argparse, json, math, shutil, zipfile
from pathlib import Path
from collections import Counter
import numpy as np
import cv2
from PIL import Image, ImageDraw
from render_scene import actor_mask, atmosphere, lamp_fx, render_particles, save_gif, zip_assets, xy


def ease(t):
    t=max(0,min(1,t)); return t*t*(3-2*t)


def point(p,size):
    return xy(p,size)


def region_mask(spec,size,basedir):
    if 'mask' in spec:
        fp=Path(spec['mask']);fp=fp if fp.is_absolute() else basedir/fp
        mask=Image.open(fp).convert('L')
        if mask.size!=size:mask=mask.resize(size,Image.Resampling.NEAREST)
        return np.asarray(mask,dtype=np.uint8)
    if 'polygon' in spec or 'box' in spec:
        return np.asarray(actor_mask(spec,size,basedir),dtype=np.uint8)
    raise ValueError('Missing accurate part polygon or part mask')


def crop_bbox(mask):
    y,x=np.where(mask>5)
    if not len(x): return None
    return (int(x.min()),int(y.min()),int(x.max()+1),int(y.max()+1))


def event_at(actor,t):
    anim=actor.get('animation',{})
    period=max(.25,float(anim.get('period',3.5)))
    u=(t/period+float(anim.get('phase',0)))%1
    events=anim.get('events') or [{'action':'idle','start':0,'end':.25},{'action':'walk','start':.25,'end':.6},{'action':'wave','start':.6,'end':.8},{'action':'idle','start':.8,'end':1}]
    for ev in events:
        st=float(ev.get('start',0));en=float(ev.get('end',1))
        if st<=u<en:
            return ev,(u-st)/max(.000001,en-st),u
    return {'action':'idle'},u,u


def degrees(partname,act,p,localtime,phase=0):
    name=partname.lower().replace('-','_')
    s=math.sin(2*math.pi*(p*2+phase))
    opposite=1 if 'left' in name else (-1 if 'right' in name else 1)
    wave=math.sin(2*math.pi*(3*p+phase))
    if act=='walk':
        if 'leg' in name or 'foot' in name: return opposite*27*s
        if 'arm' in name: return -opposite*17*s
        if 'head' in name: return 1.5*s
        return 0
    if act in ('wave','talk','gesture'):
        if 'right_arm' in name: return -29 + 10*wave
        if 'left_arm' in name: return 10*wave if act=='gesture' else 3*wave
        if 'head' in name:return 3*wave
        return 0
    if act in ('eat','drink','pour'):
        if 'right_arm' in name: return -13-26*math.sin(math.pi*p)**2
        if 'left_arm' in name: return 7*math.sin(math.pi*p)
        if 'head' in name: return 2*wave
        return 0
    if act in ('read','page','turn_page'):
        if 'left_arm' in name or 'right_arm' in name: return 7*math.sin(2*math.pi*p)
        if 'head' in name: return 3*math.sin(2*math.pi*p)
        return 0
    if act in ('groom','tail','stretch','blink'):
        if 'tail' in name: return 21*math.sin(2*math.pi*p)
        if 'head' in name: return 7*math.sin(2*math.pi*p)
        if 'front_leg' in name: return 12*math.sin(2*math.pi*p)
    return (1 if 'head' in name else 0)*1.0*math.sin(2*math.pi*p)


class RigActor:
    def __init__(self,actor,img,basedir,assets,size):
        self.spec=actor;self.id=str(actor['id']);self.size=size;w,h=size
        mask=region_mask(actor,size,basedir)
        if not np.max(mask):raise ValueError(f'{self.id}: empty actor mask')
        self.actor_mask=mask
        bbox=crop_bbox(mask)
        margin=max(6,int(max(bbox[2]-bbox[0],bbox[3]-bbox[1])*.45))
        self.rect=(max(0,bbox[0]-margin),max(0,bbox[1]-margin),min(w,bbox[2]+margin),min(h,bbox[3]+margin))
        x0,y0,x1,y1=self.rect;self.pos=(x0,y0)
        self.rsize=(x1-x0,y1-y0)
        self.opaque=img
        self.parts=[]
        body_mask=mask.copy()
        parts=actor.get('rig',{}).get('parts',[])
        if not parts:
            raise ValueError(f'{self.id}: rig.parts required. An unsupported cutout must NOT claim a walk')
        roles=[str(part.get('name','')).lower() for part in parts]
        actions={x.get('action','idle') for x in actor.get('animation',{}).get('events',[])}
        if 'walk' in actions:
            if not ('left_leg' in roles and 'right_leg' in roles):
                raise ValueError(f'{self.id}: a WALK requires left_leg and right_leg independent masks/pivots')
        partdir=assets/'layers'/self.id; partdir.mkdir(parents=True,exist_ok=True)
        # Cut identical original-pixel layers; no regenerated art.
        for order,p in enumerate(parts):
            pm=np.minimum(mask,region_mask(p,size,basedir))
            if not np.max(pm): raise ValueError(f'{self.id}/{p.get("name")}: empty mask')
            body_mask=np.where(pm>0,0,body_mask).astype(np.uint8)
            part=Image.fromarray(img).convert('RGBA')
            part.putalpha(Image.fromarray(pm))
            part=part.crop(self.rect)
            part.save(partdir/(str(p['name'])+'.png'))
            pivot=point(p['pivot'],size)
            self.parts.append({'spec':p,'name':str(p['name']),'px':part,'pivot':(pivot[0]-x0,pivot[1]-y0),'layer':float(p.get('layer',0)),'order':order})
        base=Image.fromarray(img).convert('RGBA');base.putalpha(Image.fromarray(body_mask));base=base.crop(self.rect)
        base.save(partdir/'body.png')
        self.base=np.asarray(base,dtype=np.uint8)
        self.fullmask=mask
        self.parts.sort(key=lambda x:(x['layer'],x['order']))
        self.last_pose=None

    def pose(self, t,assets=None, pose_index=None):
        spec=self.spec;action_obj,progress,u=event_at(spec,t)
        action=action_obj.get('action','idle')
        w,h=self.rsize
        # Draw torso at correct z-index with legs behind, arms in front.
        result=np.zeros((h,w,4),np.uint8)
        layered=[(0,'body',self.base,None)]
        for part in self.parts:layered.append((part['layer'],part['name'],np.asarray(part['px'],dtype=np.uint8),part))
        layered.sort(key=lambda e:e[0])
        for z,name,rgba,p in layered:
            if p is not None:
                phase=float(spec.get('animation',{}).get('phase',0))
                ang=degrees(name,action,progress,t,phase)
                events=spec.get('animation',{}).get('events') or []
                if events:
                    index=next((i for i,e in enumerate(events) if e is action_obj),None)
                    if index is not None:
                        if progress<.14:
                            prev=events[(index-1)%len(events)].get('action','idle')
                            pa=degrees(name,prev,1,t,phase)
                            q=ease(progress/.14)
                            ang=pa*(1-q)+ang*q
                        elif progress>.86:
                            nextact=events[(index+1)%len(events)].get('action','idle')
                            na=degrees(name,nextact,0,t,phase)
                            q=ease((progress-.86)/.14)
                            ang=ang*(1-q)+na*q
                cx,cy=p['pivot'];m=cv2.getRotationMatrix2D((cx,cy),ang,1.)
                rgba=cv2.warpAffine(rgba,m,(w,h),flags=cv2.INTER_NEAREST,borderMode=cv2.BORDER_CONSTANT,borderValue=(0,0,0,0))
            aa=(rgba[:,:,3:4].astype(np.float32)/255)
            out_rgb=rgba[:,:,:3]*aa+result[:,:,:3]*(1-aa)
            out_a=rgba[:,:,3:4]+result[:,:,3:4]*(1-aa)
            result=np.concatenate((np.clip(out_rgb,0,255).astype(np.uint8),np.clip(out_a,0,255).astype(np.uint8)),axis=2)
        # Full-body y bob only during genuine articulated walk (independent legs).
        dy=-(2 if action=='walk' else 0)*abs(math.sin(4*math.pi*progress))
        displacement=action_obj.get('translation',[0,0])
        if action!='walk':displacement=[0,0]
        dxpath=float(displacement[0])*math.sin(math.pi*progress)**2*self.size[0]
        dypath=float(displacement[1])*math.sin(math.pi*progress)**2*self.size[1]
        img=Image.fromarray(result,'RGBA')
        if assets is not None and pose_index is not None:
            pdir=assets/'poses'/self.id;pdir.mkdir(parents=True,exist_ok=True)
            img.save(pdir/f'{pose_index:04d}_{action}.png')
        return img,(round(self.pos[0]+dxpath),round(self.pos[1]+dy+dypath)),action


def render(input_img,scene,out,seconds,fps,max_width):
    input_img=Path(input_img);scene=Path(scene);out=Path(out)
    cfg=json.loads(scene.read_text(encoding='utf-8'))
    src=Image.open(input_img).convert('RGB'); original_size=src.size
    if max_width and src.width>max_width:
        sf=max_width/src.width
        src=src.resize((max_width,round(src.height*sf)),Image.Resampling.LANCZOS)
    size=src.size;source=np.asarray(src).copy()
    basedir=scene.resolve().parent
    assets=out/'assets';assets.mkdir(parents=True,exist_ok=True)
    src.save(assets/'source.png')
    cfg['render_engine']='rigged-cutout-v0.2'
    rigged=[]; ordinary=[]; allmasks=np.zeros((size[1],size[0]),np.uint8)
    for a in cfg.get('actors',[]):
        typ=a.get('animation',{}).get('mode','rig' if 'rig' in a else 'static')
        if typ=='rig':
            if cfg.get('seamless',True):
                # Integer cycles per GIF: every actor returns to its original pose,
                # but unique phases and cycle rates avoid synchronized crowd motion.
                anim=a.setdefault('animation',{})
                nominal=max(.25,float(anim.get('period',3.5)))
                anim['period']=seconds/max(1,round(seconds/nominal))
            obj=RigActor(a,source,basedir,assets,size)
            rigged.append(obj)
            allmasks=np.maximum(allmasks,obj.fullmask)
        elif typ=='static':
            ordinary.append(a)
        elif typ=='sprite':
            # Sprite clips handled by previous renderer for now; never silently call them rigged.
            raise ValueError(f'{a["id"]}: animated sprite mode should use render_scene.py or convert to a rig')
        else:raise ValueError(f'Unsupported animation mode {typ}')
    # Do not claim a fully populated living scene when many unanimated actors remain.
    if cfg.get('requires_all_actors_animated',False) and ordinary:
        raise ValueError('Scene still has unrigged/static actors: '+', '.join(str(a['id']) for a in ordinary))
    if cfg.get('requires_all_actors_animated',False) and not rigged:
        raise ValueError('No rigged actors available. Refusing to call a still frame fully animated.')
    (assets/'scene.json').write_text(json.dumps(cfg,ensure_ascii=False,indent=2),encoding='utf-8')
    # Masked original actor is removed once, then source pixels re-render every frame.
    if np.max(allmasks):
        background=cv2.cvtColor(cv2.inpaint(cv2.cvtColor(source,cv2.COLOR_RGB2BGR),allmasks,4,cv2.INPAINT_TELEA),cv2.COLOR_BGR2RGB)
    else:background=source.copy()
    Image.fromarray(background).save(assets/'background_clean.png')
    count=max(2,int(round(seconds*fps)))
    frames=[]; motions=Counter()
    for k in range(count):
        t=k/fps;u=k/count
        img=Image.fromarray(background,'RGB').convert('RGBA')
        # Independent clocks by actor; actor identity locked to source pixels.
        for actor in sorted(rigged,key=lambda x:int(x.spec.get('z',20))):
            save=assets if k%(max(1,round(fps/2)))==0 else None
            part,pos,act=actor.pose(t,save,k)
            motions[f'{actor.id}:{act}']+=1
            img.alpha_composite(part,dest=pos)
        img=atmosphere(img,u,cfg.get('day_night',{}),basedir)
        img=lamp_fx(img,cfg.get('lights',[]),u,t)
        img=render_particles(img,cfg.get('particles',[]),u,t)
        frames.append(img.convert('RGB'))
    save_gif(frames,out/'living_scene.gif',fps)
    (assets/'actions_actual.json').write_text(json.dumps({'actors':len(rigged),'actions_played':dict(motions),'limits':'Source-pixel rigid-limb cutout, no AI-invented new poses. Rig authoring remains necessary.'},ensure_ascii=False,indent=2),encoding='utf-8')
    zip_assets(assets,out/'living_scene_assets.zip')
    return {'gif':str(out/'living_scene.gif'),'assets':str(out/'living_scene_assets.zip'),'frames':count,'rigged_characters':len(rigged),'action_samples':dict(motions)}


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('input');ap.add_argument('--scene',required=True);ap.add_argument('--out',default='output')
    ap.add_argument('--seconds',type=float,default=12);ap.add_argument('--fps',type=float,default=12)
    ap.add_argument('--max-width',type=int,default=960)
    args=ap.parse_args()
    if args.seconds<=0 or args.fps<=0 or args.seconds*args.fps>1200: raise ValueError('Invalid duration/fps')
    print(json.dumps(render(args.input,args.scene,args.out,args.seconds,args.fps,args.max_width),ensure_ascii=False))
if __name__=='__main__':main()

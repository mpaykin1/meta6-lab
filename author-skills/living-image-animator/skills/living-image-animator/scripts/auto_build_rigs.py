#!/usr/bin/env python3
"""Conservative 2D rig proposals from pre-segmented SAM2/artist masks.

No invented character art. Proposes source-pixel subdivisions, action lists and
pivots. All generated rigs carry auto-estimated provenance. Pixel art or occluded
figures may need manually corrected masks / additional pose frames.
"""
import argparse, json, re
from pathlib import Path
import numpy as np
from PIL import Image


def npt(x,y,sz):return [round(x/sz[0],6),round(y/sz[1],6)]

def rectmask(actor_image,roi,actor_m,folder,label,actor_id):
    x0,y0,x1,y1=roi
    h,w=actor_m.shape
    xx0=max(0,int(x0)); yy0=max(0,int(y0));xx1=min(w,int(x1)); yy1=min(h,int(y1))
    sub=np.zeros_like(actor_m)
    sub[yy0:yy1,xx0:xx1]=actor_m[yy0:yy1,xx0:xx1]
    out=folder/f'{actor_id}_{label}.png'
    Image.fromarray(sub).save(out)
    return out


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('image')
    ap.add_argument('--detections',required=True,help='JSON output from segment_optional.py')
    ap.add_argument('--masks-dir',default=None)
    ap.add_argument('--out',default='rig_proposal')
    a=ap.parse_args()
    im=Image.open(a.image).convert('RGB');w,h=im.size
    detections=Path(a.detections); base=Path(a.masks_dir) if a.masks_dir else detections.parent
    det=json.loads(detections.read_text(encoding='utf-8'))
    out=Path(a.out); (out/'masks').mkdir(parents=True,exist_ok=True)
    scene={'version':2,'source':Path(a.image).name,'day_night':{'enabled':True},'actors':[],'lights':[],'particles':[],
    'source_provenance':{'kind':'machine-proposed-skeleton','reviewed':False,'notice':'Single-frame cutout anatomy may be wrong; multi-angle identity-consistent poses need additional source drawings.'}}
    for idx,obj in enumerate(det.get('actors',[])):
        role=str(obj.get('role',obj.get('label','person'))).lower()
        if not any(x in role for x in ('person','human','man','woman','child','cat','dog','animal')):continue
        p=base/obj['mask'];m=np.asarray(Image.open(p).convert('L').resize((w,h),Image.Resampling.NEAREST),dtype=np.uint8)
        yy,xx=np.where(m>128)
        if len(xx)<10:continue
        x0,x1=float(xx.min()),float(xx.max()+1);y0,y1=float(yy.min()),float(yy.max()+1)
        width=x1-x0;height=y1-y0
        if width<4 or height<6:continue
        sid=re.sub('[^a-z0-9_-]','_',str(obj.get('id',f'person_{idx}')).lower())
        ms=out/'masks'/f'{sid}.png';Image.fromarray(m).save(ms)
        character={'id':sid,'role':role,'mask':f'masks/{sid}.png','z':20+idx,'autorig_confidence':'heuristic','rig':{'parts':[]},
                   'animation':{'mode':'rig','period':3.4+.57*(idx%5),'phase':(idx*.137)%1,'events':[]}}
        pdir=out/'masks'
        parts=[]
        # For genuinely tiny sprites, a single mask may only support head/arms.
        humanoid=not any(k in role for k in ('cat','dog','animal'))
        if humanoid:
            # 5-part conservative two-legged puppet, standing silhouettes.
            # The user/vision model should override these with semantic SAM2 sub-masks.
            top=y0+.32*height;hip=y0+.65*height
            definitions=[
                ('head',(x0,y0,x1,top),((x0+x1)/2,top),2),
                ('left_arm',(x0,y0+.29*height,x0+.30*width,y0+.71*height),(x0+.30*width,y0+.36*height),1),
                ('right_arm',(x0+.70*width,y0+.29*height,x1,y0+.71*height),(x0+.70*width,y0+.36*height),1),
                ('left_leg',(x0,y0+.65*height,x0+.51*width,y1),(x0+.31*width,hip),-1),
                ('right_leg',(x0+.51*width,y0+.65*height,x1,y1),(x0+.68*width,hip),-1),
            ]
            actions=['idle','walk','wave','eat','idle']
        else:
            # Horizontal quadruped: head, visible tail, front/back legs.
            definitions=[
                ('head',(x0+.55*width,y0,x1,y0+.65*height),(x0+.63*width,y0+.35*height),2),
                ('tail',(x0,y0,x0+.30*width,y0+.72*height),(x0+.28*width,y0+.48*height),0),
                ('front_leg',(x0+.52*width,y0+.55*height,x0+.82*width,y1),(x0+.62*width,y0+.59*height),-1),
                ('back_leg',(x0+.16*width,y0+.55*height,x0+.45*width,y1),(x0+.33*width,y0+.59*height),-1),
            ]
            actions=['idle','groom','stretch','tail','idle']
        for name,roi,pivot,layer in definitions:
            f=rectmask(im,roi,m,pdir,name,sid)
            if np.max(np.asarray(Image.open(f).convert('L')))==0:continue
            character['rig']['parts'].append({'name':name,'mask':f'masks/{f.name}','pivot':npt(*pivot,(w,h)),'layer':layer})
        acts=[]
        for j,action in enumerate(actions):
            e={'action':action,'start':round(j/len(actions),5),'end':round((j+1)/len(actions),5)}
            if action=='walk':e['translation']=[round(.018*(1 if idx%2==0 else -1),3),0]
            acts.append(e)
        character['animation']['events']=acts
        found={x['name'] for x in character['rig']['parts']}
        if 'walk' in actions and not {'left_leg','right_leg'}.issubset(found):
            character['animation']['events']=[{'action':'wave','start':0,'end':.5},{'action':'idle','start':.5,'end':1}]
        scene['actors'].append(character)
    scene_file=out/'scene.autorig.json';scene_file.write_text(json.dumps(scene,ensure_ascii=False,indent=2),encoding='utf8')
    print(json.dumps({'scene':str(scene_file),'actors':len(scene['actors']),'needs_visual_review':True},ensure_ascii=False))

if __name__=='__main__':main()

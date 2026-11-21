#!/usr/bin/env python3
"""Source-locked layered GIF + transparent asset-pack renderer.

Render uses a semantically authored scene JSON. For genuine person action supply
separate transparent pose frames; pixel-safe idle motion is not walking.
"""
import argparse
import io
import json
import math
import os
import random
import re
import shutil
import zipfile
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance


def slug(s):
    return re.sub(r'[^a-zA-Z0-9_-]+', '_', str(s)).strip('_') or 'actor'


def resolve(path, base):
    p = Path(path)
    return p if p.is_absolute() else base / p


def frac(t):
    return t - math.floor(t)


def circ(t):
    return (math.sin(2 * math.pi * t) + 1) * .5


def xy(pt, size):
    return int(round(float(pt[0]) * size[0])), int(round(float(pt[1]) * size[1]))


def box_px(b, size):
    w, h = size
    x0, y0 = xy(b[:2], size)
    x1, y1 = xy(b[2:], size)
    return max(0,x0), max(0,y0), min(w,x1), min(h,y1)


def actor_mask(a, size, basedir):
    w, h = size
    if 'mask' in a:
        m = Image.open(resolve(a['mask'], basedir)).convert('L')
        if m.size != size:
            raise ValueError(f"mask size mismatch for {a['id']}: {m.size} != {size}")
        return m
    mask = Image.new('L', size, 0)
    d = ImageDraw.Draw(mask)
    if 'polygon' in a:
        pts = [xy(p, size) for p in a['polygon']]
        if len(pts) < 3:
            raise ValueError(f'Actor {a["id"]} needs >=3 mask polygon points')
        d.polygon(pts, fill=255)
    elif 'box' in a:
        # Only fallback region: a crop is NOT assumed to be a true cutout.
        # Pixel segmentation must be replaced by a true mask before PASS.
        d.rectangle(box_px(a['box'], size), fill=255)
    else:
        raise ValueError(f'Actor {a["id"]}: missing mask, polygon or box')
    return mask


def scene_layers(source, config, basedir, assets):
    sz = source.size
    layers = []
    union = np.zeros((sz[1],sz[0]), dtype=np.uint8)
    (assets / 'masks').mkdir(parents=True, exist_ok=True)
    (assets / 'layers').mkdir(parents=True, exist_ok=True)
    for i, actor in enumerate(config.get('actors', [])):
        sid = slug(actor.get('id',f'actor_{i}'))
        mask = actor_mask(actor, sz, basedir)
        nonzero = mask.getbbox()
        if not nonzero:
            continue
        x0,y0,x1,y1 = nonzero
        if x1<=x0 or y1<=y0: continue
        # Do not inpaint the original under an explicitly static sprite.
        union = np.maximum(union, np.asarray(mask))
        rgba = source.copy().convert('RGBA')
        rgba.putalpha(mask)
        cutout = rgba.crop((x0,y0,x1,y1))
        mask.save(assets/'masks'/f'{sid}.png')
        cutout.save(assets/'layers'/f'{sid}.png')
        frames = []
        for f in actor.get('sprite_frames', []):
            fp = resolve(f, basedir)
            if not fp.exists(): raise FileNotFoundError(f'Pose sprite does not exist: {fp}')
            frame = Image.open(fp).convert('RGBA')
            frames.append(frame)
        layers.append(dict(actor=actor, id=sid, src=cutout, mask=mask, bbox=(x0,y0,x1,y1), sprite_frames=frames))
    # Inpaint only actual lifted actor regions. Original scene conserved otherwise.
    if np.max(union)>0:
        arr = np.asarray(source.convert('RGB'))
        # OpenCV input order BGR. Alpha feather avoids hard seams from polygon masks.
        repaired = cv2.inpaint(cv2.cvtColor(arr, cv2.COLOR_RGB2BGR),union,5,cv2.INPAINT_TELEA)
        clean = Image.fromarray(cv2.cvtColor(repaired,cv2.COLOR_BGR2RGB)).convert('RGBA')
    else:
        clean = source.copy().convert('RGBA')
    clean.save(assets / 'background_clean.png')
    return sorted(layers,key=lambda x:int(x['actor'].get('z',20))), clean


def phase_motion(layer,t,base_dir):
    a = layer['actor']
    m = a.get('motion',{'type':'idle'})
    kind = m.get('type','idle')
    period = max(0.2,float(m.get('period',3.2)))
    phase = float(m.get('phase',0))
    wave = math.sin(2*math.pi*(t/period+phase))
    frame = layer['src']
    x0,y0,x1,y1=layer['bbox']
    dx = dy = 0.0
    rot = 0.0
    scalex=scaley=1.0
    if kind in ('bob','breathe','idle'):
        amp = float(m.get('amplitude',0.012))
        dy = -abs(wave)*amp*(y1-y0)
        scaley = 1 + amp*wave
    elif kind in ('sway','tail','cloth'):
        rot = wave*float(m.get('amplitude',3.0))
    elif kind in ('float','fly'):
        dx = wave*float(m.get('distance',0.04))*(x1-x0)
        dy = math.cos(2*math.pi*(t/period+phase))*float(m.get('amplitude',0.025))*(y1-y0)
    elif kind=='walk':
        # Spatial displacement only. Real steps require supplied pose sprites.
        dx = wave*float(m.get('distance',0.35))*(x1-x0)
        dy = -max(0,wave)*float(m.get('amplitude',0.012))*(y1-y0)
    elif kind=='sprite':
        frames=layer['sprite_frames']
        if len(frames)<2:
            raise ValueError(f'{layer["id"]}: sprite animation requires >=2 aligned transparent poses')
        fps = max(.1,float(m.get('fps',3)))
        k=int(math.floor(t*fps+phase*len(frames)))%len(frames)
        frame=frames[k]
    elif kind=='still':
        pass
    else:
        raise ValueError(f'Unknown motion type: {kind}')
    if kind!='sprite':
        if scaley!=1 or scalex!=1:
            frame=frame.resize((max(1,round(frame.width*scalex)),max(1,round(frame.height*scaley))),Image.Resampling.BICUBIC)
        if rot:
            # Anchor bottom-middle, compensate for size change when placing.
            frame=frame.rotate(rot,resample=Image.Resampling.BICUBIC,expand=True)
    base_x=(x0+x1)/2
    base_bottom=y1
    x=int(round(base_x-frame.width/2+dx))
    y=int(round(base_bottom-frame.height+dy))
    return frame,(x,y)


def render_particles(frame,entries,progress,t,seed=77):
    w,h=frame.size
    layer=Image.new('RGBA',(w,h),(0,0,0,0))
    draw=ImageDraw.Draw(layer)
    for kind_i,p in enumerate(entries):
        kind=p.get('type','petals')
        region=p.get('region',[0,0,1,1])
        x0,y0,x1,y1=box_px(region,(w,h))
        n=max(0,min(700,int(p.get('count',18))))
        if x1-x0<=0 or y1-y0<=0: continue
        rng=random.Random(seed + kind_i*9127)
        for j in range(n):
            ox=rng.random(); oy=rng.random(); period=(.45+rng.random()*.65)
            speed=float(p.get('speed',.1))*period
            s=frac(progress*speed + oy)
            if kind=='petals':
                fx=frac(ox+progress*float(p.get('drift',.025))+math.sin(2*math.pi*(s+j*.07))*.035)
                fy=s
                r=max(1,round((.002+rng.random()*.003)*w))
                col=(255,164+rng.randint(0,44),192+rng.randint(0,45),165+rng.randint(0,90))
                x=x0+int(fx*(x1-x0)); y=y0+int(fy*(y1-y0))
                draw.ellipse((x-r,y-r//2,x+r,y+r//2),fill=col)
            elif kind in ('fireflies','dust','stars'):
                night=1
                if kind in ('fireflies','stars'):
                    night=max(0,min(1,(.56-circ(progress-.25))*4))
                glow=(.3+.7*circ(t/(1.1+rng.random()*2)+j*.11))*night
                if glow<=.03: continue
                fx=frac(ox+progress*(.002 if kind=='stars' else .006)); fy=oy
                x=x0+int(fx*(x1-x0)); y=y0+int(fy*(y1-y0))
                r=2 if kind=='fireflies' else 1
                col=((255,229,144) if kind=='fireflies' else (234,235,255))
                draw.ellipse((x-r,y-r,x+r,y+r),fill=(*col,int(230*glow)))
            elif kind in ('rain','steam'):
                fx=frac(ox+progress*.03)
                fy=s if kind=='rain' else 1-s
                x=x0+int(fx*(x1-x0));y=y0+int(fy*(y1-y0))
                if kind=='rain':
                    draw.line((x,y,x-2,y+max(3,w//270)), fill=(150,177,235,60),width=1)
                else:
                    y+=int(5*math.sin(progress*8+j))
                    draw.ellipse((x-2,y-2,x+2,y+2),fill=(235,236,255,70))
    return Image.alpha_composite(frame,layer)


def lamp_fx(frame,lights,progress,t):
    w,h=frame.size
    glows=Image.new('RGBA',frame.size,(0,0,0,0))
    g=ImageDraw.Draw(glows)
    dark=Image.new('RGBA',frame.size,(0,0,0,0))
    d=ImageDraw.Draw(dark)
    for i,light in enumerate(lights):
        x0,y0,x1,y1=box_px(light['box'],(w,h))
        if x1<=x0 or y1<=y0:continue
        start=float(light.get('on_start',.58))
        end=float(light.get('on_end',.98))
        p=frac(progress + float(light.get('phase',i*.08)))
        on=(start<=p<=end) if start<=end else (p>=start or p<=end)
        if light.get('mode')=='twinkle':
            on=(math.sin(2*math.pi*(t*float(light.get('speed',.85))+i*.7))>-.15)
        if not on:
            d.ellipse((x0,y0,x1,y1),fill=(9,17,37,120))
        else:
            cx=(x0+x1)//2; cy=(y0+y1)//2
            rad=max(3,int((x1-x0+y1-y0)*.4))
            g.ellipse((cx-rad,cy-rad,cx+rad,cy+rad),fill=(255,197,101,205))
    frame=Image.alpha_composite(frame,dark)
    soft=glows.filter(ImageFilter.GaussianBlur(max(2,w//190)))
    frame=Image.alpha_composite(frame,soft)
    return frame


def atmosphere(frame,progress,settings,basedir):
    if not settings.get('enabled',False):return frame
    # The paired day plate should match the original geometry; without it,
    # global grading is just atmospheric, not a truly reconstructed daytime sky.
    day=circ(progress)
    if settings.get('day_background'):
        fn=resolve(settings['day_background'],basedir)
        if not fn.exists():raise FileNotFoundError(f'day plate missing: {fn}')
        plate=Image.open(fn).convert('RGBA')
        if plate.size!=frame.size:raise ValueError('day plate and source must have identical dimensions')
        if settings.get('sky_mask'):
            mask=Image.open(resolve(settings['sky_mask'],basedir)).convert('L')
            if mask.size!=frame.size:raise ValueError('sky mask size mismatch')
        else:
            mask=Image.new('L',frame.size,255)
        blended=Image.composite(plate,frame,mask)
        frame=Image.blend(frame,blended,.90*day)
    else:
        # Preserve source artwork as closely as possible; only slight cyclic
        # grading when no day sky is available.
        frame=ImageEnhance.Brightness(frame).enhance(.87+.26*day)
        blue=Image.new('RGBA',frame.size,(25,42,93,int(23*(1-day))))
        frame=Image.alpha_composite(frame,blue)
    return frame


def save_gif(frames,out,fps):
    duration=max(20,round(1000/fps))
    # Global palette minimizes dramatic color remaps for animated pixel art.
    frames[0].convert('RGB').quantize(colors=255,method=Image.Quantize.FASTOCTREE)
    pal_frames=[f.convert('RGB').quantize(colors=255,method=Image.Quantize.FASTOCTREE) for f in frames]
    pal_frames[0].save(out,save_all=True,append_images=pal_frames[1:],duration=duration,loop=0,optimize=False,disposal=2)


def zip_assets(folder,zip_path):
    with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
        for path in folder.rglob('*'):
            if path.is_file(): z.write(path,path.relative_to(folder))


def main():
    ap=argparse.ArgumentParser(description='One original image + layered scene JSON -> GIF and RGBA asset ZIP')
    ap.add_argument('input',type=Path)
    ap.add_argument('--scene',type=Path,default=None)
    ap.add_argument('--out',type=Path,default=Path('output'))
    ap.add_argument('--seconds',type=float,default=8)
    ap.add_argument('--fps',type=float,default=8)
    ap.add_argument('--max-width',type=int,default=960)
    args=ap.parse_args()
    if args.seconds<=0 or args.fps<=0:raise ValueError('seconds and fps must be positive')
    if args.seconds*args.fps>1200:raise ValueError('limit to 1200 frames for safety')
    basedir=args.scene.resolve().parent if args.scene else args.input.resolve().parent
    settings=json.loads(args.scene.read_text('utf8')) if args.scene else {'version':1,'actors':[],'lights':[],'particles':[]}
    original=Image.open(args.input).convert('RGB')
    if args.max_width and original.width>args.max_width:
        scale=args.max_width/original.width
        original=original.resize((args.max_width,max(1,round(original.height*scale))),Image.Resampling.LANCZOS)
        # External per-pixel masks must be prepared at output dimensions.
    args.out.mkdir(parents=True,exist_ok=True)
    asset=args.out/'assets'; asset.mkdir(exist_ok=True)
    (asset/'frames').mkdir(exist_ok=True)
    original.save(asset/'source.png')
    layers,background=scene_layers(original,settings,basedir,asset)
    # Store export metadata with original scene, no ambiguity about full animation.
    settings['export_note']='Cutout motion from source. Articulated actions need 2+ transparent pose PNGs; image grading is not a reconstructed daytime sky.'
    (asset/'scene.json').write_text(json.dumps(settings,ensure_ascii=False,indent=2),'utf8')
    n=max(2,int(round(args.seconds*args.fps)))
    frames=[]
    for fi in range(n):
        progress=fi/n
        t=progress*args.seconds
        frame=atmosphere(background.copy(),progress,settings.get('day_night',{}),basedir)
        for L in layers:
            spr,pos=phase_motion(L,t,basedir)
            frame.alpha_composite(spr,dest=pos)
        frame=lamp_fx(frame,settings.get('lights',[]),progress,t)
        frame=render_particles(frame,settings.get('particles',[]),progress,t)
        frames.append(frame.convert('RGB'))
        frames[-1].save(asset/'frames'/f'{fi:04d}.png')
    save_gif(frames,args.out/'living_scene.gif',args.fps)
    zip_assets(asset,args.out/'living_scene_assets.zip')
    print(json.dumps({'gif':str(args.out/'living_scene.gif'),'assets_zip':str(args.out/'living_scene_assets.zip'),'frames':n,'actors':len(layers)},ensure_ascii=False))

if __name__=='__main__': main()

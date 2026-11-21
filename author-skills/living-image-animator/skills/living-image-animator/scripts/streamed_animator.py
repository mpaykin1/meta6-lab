#!/usr/bin/env python3
"""Disk-streamed, single-source articulated GIF renderer (ffmpeg two-pass palette).

Avoids holding 1,000+ full-resolution RGB frames in Python memory. The output is
an actual animated GIF and a ZIP of independent RGBA rig layers and keyframes.
"""
from __future__ import annotations
import json
import math
import shutil
import subprocess
import tempfile
from collections import Counter
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from render_rigged_scene import RigActor
from render_scene import atmosphere, box_px, zip_assets


def smoothstep(x):
    x=max(0.,min(1.,x))
    return x*x*(3-2*x)


def cyclic_particles(frame, objects, u, seconds):
    w,h=frame.size
    layer=Image.new('RGBA',frame.size)
    draw=ImageDraw.Draw(layer)
    for group,p in enumerate(objects):
        typ=p.get('type','petals')
        if typ not in {'petals','rain','steam','fireflies','dust','stars'}:continue
        left,top,right,bottom=box_px(p.get('region',[0,0,1,1]),(w,h))
        ww=right-left; hh=bottom-top
        if ww<=0 or hh<=0:continue
        import random
        rg=random.Random(group*17319+77)
        for k in range(min(700,max(0,int(p.get('count',16))))):
            x0=rg.random(); y0=rg.random()
            cycles=int(p.get('cycles',1))
            # INTEGER numbers of full cycles guarantee closure at u=1.
            cycle=max(1,cycles)
            x=(x0+u*cycle*(.26 if typ=='petals' else .037))%1
            y=(y0 + u*cycle*(1 if typ in {'petals','rain'} else -.65 if typ=='steam' else .015))%1
            if typ=='stars':
                x=x0;y=y0
            px=left+int(x*ww);py=top+int(y*hh)
            edge=min(1,y/.06,(1-y)/.06)
            edge=smoothstep(edge)
            # 48s cycle: brightest night (near u=0 or 1), dim in day middle.
            night=smoothstep(.45+.55*math.cos(2*math.pi*u))
            if typ in {'stars','fireflies'}:
                flicker=.75+.25*math.sin(2*math.pi*(max(1,k%3+1)*cycle)*u + 2*math.pi*x0)
                alpha=int(180*night*flicker)
                if alpha>2:
                    rad=1 if typ=='stars' else 2
                    draw.ellipse((px-rad,py-rad,px+rad,py+rad),fill=(249,236,174,alpha))
            elif typ=='petals':
                rad=max(1,int(.0017*w))
                draw.ellipse((px-rad,py-rad//2,px+rad,py+rad//2),fill=(255,170+int(y0*55),198,int(160*edge)))
            elif typ=='rain':
                a=int(110*edge)
                draw.line((px,py,px-2,py+max(3,w//210)),fill=(175,190,233,a),width=1)
            elif typ=='steam':
                cx=px+int(4*math.sin(2*math.pi*cycle*u+k))
                draw.ellipse((cx-2,py-2,cx+2,py+2),fill=(230,226,214,int(65*edge)))
            elif typ=='dust':
                draw.ellipse((px,py,px+1,py+1),fill=(236,209,168,int(65*edge)))
    return Image.alpha_composite(frame,layer)


def cyclic_lamps(frame,lights,u):
    if not lights:return frame
    w,h=frame.size
    dark=Image.new('RGBA',frame.size)
    glow=Image.new('RGBA',frame.size)
    a=ImageDraw.Draw(dark); b=ImageDraw.Draw(glow)
    for k,lamp in enumerate(lights):
        left,top,right,bottom=box_px(lamp['box'],(w,h))
        offset=float(lamp.get('phase',k*.13))
        # Use smooth sinusoidal brightness, not frame-step switching.
        cycles=max(1,int(lamp.get('cycles',1)))
        strength=smoothstep(.5+.5*math.cos(2*math.pi*(cycles*u+offset)))
        a.ellipse((left,top,right,bottom),fill=(5,14,28,int(100*(1-strength))))
        cx=(left+right)//2;cy=(top+bottom)//2
        radius=max(4,int((right-left+bottom-top)*.46))
        b.ellipse((cx-radius,cy-radius,cx+radius,cy+radius),
                  fill=(255,191,108,int(180*strength)))
    frame=Image.alpha_composite(frame,dark)
    return Image.alpha_composite(frame,glow.filter(ImageFilter.GaussianBlur(max(2,w//160))))


def ffmpeg_command(args):
    try:subprocess.run(args,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE,check=True)
    except FileNotFoundError:raise RuntimeError('ffmpeg is required for low-memory smooth GIF output')
    except subprocess.CalledProcessError as e:raise RuntimeError('ffmpeg error: '+e.stderr.decode(errors='replace')[-1500:])


def render(src_path, scene_path, out, seconds, fps, max_width):
    source_file=Path(src_path);scene_file=Path(scene_path);out=Path(out)
    cfg=json.loads(scene_file.read_text('utf8'))
    original=Image.open(source_file).convert('RGB')
    if max_width and original.width>max_width:
        s=max_width/original.width
        original=original.resize((max_width,max(1,round(original.height*s))),Image.Resampling.LANCZOS)
    w,h=original.size;rgb=np.asarray(original).copy()
    basedir=scene_file.resolve().parent
    assets=out/'assets';assets.mkdir(parents=True,exist_ok=True)
    original.save(assets/'source.png')
    cfg['render_engine']='rigged-streamed-v0.3'
    all_masks=np.zeros((h,w),dtype=np.uint8)
    rigs=[]
    for a in cfg.get('actors',[]):
        if a.get('animation',{}).get('mode','rig')!='rig':raise ValueError('Non-rigged actor '+a.get('id','?'))
        if cfg.get('seamless',True):
            anim=a.setdefault('animation',{})
            nominal=max(.25,float(anim.get('period',4.)))
            anim['period']=seconds/max(1,round(seconds/nominal))
        rig=RigActor(a,rgb,basedir,assets,(w,h))
        rigs.append(rig)
        all_masks=np.maximum(all_masks,rig.fullmask)
    if len(rigs)!=len(cfg.get('actors',[])):raise ValueError('Unrigged actor omitted')
    repaired=cv2.cvtColor(cv2.inpaint(cv2.cvtColor(rgb,cv2.COLOR_RGB2BGR),all_masks,4,cv2.INPAINT_TELEA),cv2.COLOR_BGR2RGB)
    Image.fromarray(repaired).save(assets/'background_clean.png')
    (assets/'scene.json').write_text(json.dumps(cfg,ensure_ascii=False,indent=2),'utf8')
    plays=Counter();frames=round(seconds*fps)
    with tempfile.TemporaryDirectory(prefix='living_gif_') as td:
        tmp=Path(td)
        day_conf=dict(cfg.get('day_night',{}))
        for key in ('day_background','sky_mask'):
            if day_conf.get(key):
                fp=Path(day_conf[key]); fp=fp if fp.is_absolute() else basedir/fp
                plate=Image.open(fp).convert('L' if key=='sky_mask' else 'RGBA')
                if plate.size!=(w,h):
                    plate=plate.resize((w,h),Image.Resampling.NEAREST if key=='sky_mask' else Image.Resampling.LANCZOS)
                path=tmp/(key+'.png'); plate.save(path)
                day_conf[key]=str(path)
        for k in range(frames):
            t=k/fps;u=k/frames
            canvas=Image.fromarray(repaired,'RGB').convert('RGBA')
            # Frame-by-frame procedural sky: pair registration is required.
            canvas=atmosphere(canvas,u,day_conf,basedir)
            for rig in sorted(rigs,key=lambda r:int(r.spec.get('z',20))):
                save=assets if k%(max(1,round(fps/2)))==0 else None
                sprite,pos,action=rig.pose(t,save,k)
                canvas.alpha_composite(sprite,dest=pos)
                plays[f'{rig.id}:{action}']+=1
            canvas=cyclic_lamps(canvas,cfg.get('lights',[]),u)
            canvas=cyclic_particles(canvas,cfg.get('particles',[]),u,seconds)
            canvas.convert('RGB').save(tmp/f'{k:05d}.png',compress_level=1)
        pattern=str(tmp/'%05d.png')
        palette=tmp/'palette.png'
        ffmpeg_command(['ffmpeg','-v','error','-y','-framerate',str(fps),'-i',pattern,
                        '-vf','palettegen=stats_mode=full:max_colors=240','-frames:v','1',str(palette)])
        ffmpeg_command(['ffmpeg','-v','error','-y','-framerate',str(fps),'-i',pattern,
                        '-i',str(palette),'-filter_complex','paletteuse=dither=bayer:bayer_scale=3',
                        '-loop','0',str(out/'living_scene.gif')])
    (assets/'actions_actual.json').write_text(json.dumps({'actors':len(rigs),'actions_played':dict(plays)},ensure_ascii=False,indent=2),'utf8')
    zip_assets(assets,out/'living_scene_assets.zip')
    return out/'living_scene.gif',out/'living_scene_assets.zip'

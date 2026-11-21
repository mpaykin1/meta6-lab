#!/usr/bin/env python3
"""Original pixel art sprite sheets compatible with Pixelorama PNG import/export.
Generates animation frames; no Pixelorama binary or upstream code embedded.
"""
import argparse, math, json, random
from pathlib import Path
from PIL import Image, ImageDraw

SIZE=32
CLIPS={
    'ember': {'row':0,'frames':8,'fps':12,'kind':'bonfire'},
    'rune': {'row':1,'frames':8,'fps':7,'kind':'moongate'},
    'lantern':{'row':2,'frames':8,'fps':9,'kind':'lantern'},
    'wisp': {'row':3,'frames':8,'fps':10,'kind':'firefly'},
}
# Harmonize emissive sprite colors with authentic voxel material swatches.
PALETTE={
    'night': '#0a1523', 'deep_blue':'#1c2937','stone_shadow':'#2f3e4a',
    'stone':'#435361','stone_highlight':'#617785','soil':'#2e3d42',
    'moss':'#235851','rust':'#846755','wood':'#473c39',
    'teal':'#2dd1ce','cyan':'#69f5e7','ice':'#b7ffe7',
    'warm':'#ff8f3d','fire':'#ffba49','gold':'#ffdd84','cream':'#fff1b3'
}

def rgba(color,a=255):
    c=color.lstrip('#');return tuple(int(c[i:i+2],16) for i in (0,2,4))+(a,)

def star(draw,x,y,c,sz=1):
    draw.line((x-sz,y,x+sz,y), fill=c, width=1)
    draw.line((x,y-sz,x,y+sz), fill=c, width=1)

def draw_frame(kind,frame):
    rnd=random.Random(3003+frame*43+len(kind)*17)
    image=Image.new('RGBA',(SIZE,SIZE),(0,0,0,0))
    d=ImageDraw.Draw(image)
    phase=frame*math.tau/8
    cx,cy=16,16
    if kind=='ember':
        # A handcrafted flickering silhouette that is identical in visual identity every frame.
        for j in range(4):
            rise=(j*7+frame*3)%20
            x=8+j*5 + int(1.5*math.sin(phase+j))
            y=26-rise
            if y>2: d.rectangle((x,y,x+1,y+2),fill=rgba(PALETTE['gold'] if j%2 else PALETTE['fire'],210))
        d.polygon([(10,29),(8,24),(10,19),(9,15),(13,18),(13,11+int(math.sin(phase)*2)),(17,17),(19,13+int(math.cos(phase)*3)),(23,19),(22,25),(20,29)],fill=rgba(PALETTE['warm']))
        d.polygon([(13,28),(12,24),(14,20),(14,16+int(math.cos(phase)*2)),(18,21),(20,23),(19,28)],fill=rgba(PALETTE['fire']))
        d.polygon([(15,28),(15,23),(17,21),(18,26),(18,28)],fill=rgba(PALETTE['cream']))
    elif kind=='rune':
        c=rgba(PALETTE['cyan'],170+int(50*(.5+.5*math.sin(phase))))
        pale=rgba(PALETTE['ice'],200)
        # Unchanging glyph topology with breathing light; no random sprite identity shifts.
        d.arc((5,5,26,26),20,340,fill=c,width=2)
        d.arc((9,9,22,22),200,535,fill=pale,width=1)
        for ang in (45,135,225,315):
            r=12;x=round(cx+r*math.cos(math.radians(ang)));y=round(cy+r*math.sin(math.radians(ang)))
            d.line((x-1,y,x+1,y),fill=c)
        d.polygon([(16,8),(20,16),(16,24),(12,16)],outline=pale)
        d.line((9,16,23,16),fill=c,width=1)
        d.line((16,9,16,23),fill=c,width=1)
        star(d,16,16,rgba(PALETTE['cream'],220),1)
    elif kind=='lantern':
        d.rectangle((10,12,22,27),fill=rgba('#362e2e'))
        d.rectangle((11,14,21,26),fill=rgba('#5c4535'))
        d.rectangle((13,15,19,25),fill=rgba(PALETTE['warm'],220))
        d.rectangle((14,17,18,23),fill=rgba(PALETTE['gold']))
        d.rectangle((15,19,17,21),fill=rgba(PALETTE['cream']))
        d.rectangle((9,11,23,13),fill=rgba(PALETTE['stone']))
        d.rectangle((12,8,20,10),fill=rgba(PALETTE['stone_highlight']))
        for dx in (-1,1):
            if frame in (0,2,4,6):d.point((16+dx*7,14+frame//2),fill=rgba(PALETTE['warm'],150))
        glow=rgba(PALETTE['warm'],round(50+35*(1+math.sin(phase))/2))
        d.rectangle((6,26,26,28),fill=glow)
    elif kind=='wisp':
        ox=int(2*math.cos(phase));oy=int(2*math.sin(phase))
        for r,a in [(8,26),(6,36),(4,78)]:
            d.ellipse((cx-r+ox,cy-r+oy,cx+r+ox,cy+r+oy),fill=rgba(PALETTE['teal'],a))
        d.polygon([(cx-3+ox,cy+oy),(cx+ox,cy-4+oy),(cx+3+ox,cy+oy),(cx+ox,cy+4+oy)],fill=rgba(PALETTE['cyan'],215))
        d.rectangle((cx-1+ox,cy-1+oy,cx+1+ox,cy+1+oy),fill=rgba(PALETTE['ice']))
        for j in range(3):
            x=round(cx+10*math.cos(phase+j*2.25));y=round(cy+9*math.sin(phase+j*2.25))
            d.point((x,y),fill=rgba(PALETTE['cyan'],170))
    return image

def generate(out):
    out=Path(out);out.mkdir(parents=True,exist_ok=True)
    atlas=Image.new('RGBA',(SIZE*8,SIZE*4),(0,0,0,0))
    for label,c in CLIPS.items():
        for f in range(c['frames']):atlas.alpha_composite(draw_frame(label,f),(f*SIZE,c['row']*SIZE))
    atlas.save(out/'sprite_sheet.png',optimize=True)
    # Neighbor-safe nearest-neighbour sampling. Individual frames also help editing in Pixelorama.
    for label,c in CLIPS.items():
        dest=out/'frames'/label;dest.mkdir(parents=True,exist_ok=True)
        for frame in range(c['frames']):draw_frame(label,frame).save(dest/f'{frame:02d}.png')
    data={'generator':'Pixelorama PNG Sprite Interchange','format':1,
          'image':'sprite_sheet.png','frameWidth':SIZE,'frameHeight':SIZE,
          'columns':8,'rows':4,'clips':CLIPS,'pixelArt':True,'nearest':True,
          'source':'original artwork; compatible with Pixelorama PNG import and export'}
    (out/'sprite_sheet.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    (out/'palette.json').write_text(json.dumps(PALETTE,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    # Edited frames can be reimported by Pixelorama or repacked by pixelorama_bridge.py.
    (out/'README.md').write_text('Pixelorama-compatible original PNG sprite sheet. Open PNG in Pixelorama; edit 32×32 frames. Each row has 8 frames, top-to-bottom: ember, rune, lantern, wisp. All 4 clips remain stable identity across time. Import/export PNG with no resizing or filtering.\n',encoding='utf-8')
    return data

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--out',type=Path,required=True)
    a=p.parse_args();generate(a.out);print('Pixelorama PNG asset:',a.out/'sprite_sheet.png')

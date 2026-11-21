#!/usr/bin/env python3
"""Normalize authored 6-column/11-row sheets. Originals retained, no human approval fabricated."""
import argparse,base64,hashlib,json,statistics
from collections import deque
from pathlib import Path
from PIL import Image
ACTIONS=['idle','walk','run','jump','crouch','dodge','roll','attack','grab','hurt','death']
DIRS=['front','back','left','right']
def clean(im):
    w,h=im.size;data=im.getchannel('A').tobytes();seen=bytearray(w*h);parts=[]
    if sum(v>=32 for v in data)>w*h*.93:raise ValueError('Opaque/semitransparent background in candidate cell; remove it before packing')
    for i,v in enumerate(data):
        if v<24 or seen[i]:continue
        seen[i]=1;q=deque([i]);part=[]
        while q:
            k=q.popleft();part.append(k);x=k%w;y=k//w
            for yy in range(max(0,y-1),min(h,y+2)):
                for xx in range(max(0,x-1),min(w,x+2)):
                    n=yy*w+xx
                    if not seen[n] and data[n]>=24:seen[n]=1;q.append(n)
        parts.append(part)
    if not parts:raise ValueError('Empty sprite cell')
    part=max(parts,key=len)
    if len(part)<150:raise ValueError('Subject too small')
    mask=bytearray(w*h)
    for k in part:
        x=k%w;y=k//w
        for yy in range(max(0,y-1),min(h,y+2)):
            for xx in range(max(0,x-1),min(w,x+2)):
                n=yy*w+xx;mask[n]=data[n]
    im.putalpha(Image.frombytes('L',(w,h),bytes(mask)));return im
def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('input',type=Path);p.add_argument('output',type=Path);p.add_argument('--canonical',type=Path,required=True);p.add_argument('--extras',type=Path,required=True,help='Real 4x6 grid with 22 additional authored poses, two per action');p.add_argument('--only',choices=DIRS,help='Repack one changed direction in an existing pack');a=p.parse_args();a.output.mkdir(parents=True,exist_ok=True)
    meta={'version':1,'directions':4,'actions':ACTIONS,'anims':{},'sheets':{},'provenance':{'canonical_sha256':hashlib.sha256(a.canonical.read_bytes()).hexdigest(),'canonical_approved_by':'user','canonical_approval':'Одобряю эти четыре ракурса','generated_by':'image_gen','frame_review_by':'assistant','human_reviewed_each_frame':False},'source_sha256':{}}
    if a.only:
        expected=meta['provenance']['canonical_sha256'];meta=json.loads((a.output/'hero-pack.json').read_text(encoding='utf8'))
        if meta.get('provenance',{}).get('canonical_sha256')!=expected:raise ValueError('Cannot repack into a different canonical identity')
    for direction in ([a.only] if a.only else DIRS):
        source=a.input/(direction+'.png');meta['source_sha256'][direction]=hashlib.sha256(source.read_bytes()).hexdigest()
        with Image.open(source) as im:
            im=im.convert('RGBA');w,h=im.size
            cells=[[clean(im.crop((round(c*w/6),round(r*h/11),round((c+1)*w/6),round((r+1)*h/11)))) for c in range(6)] for r in range(11)]
        scale=185/statistics.median(im.getbbox()[3]-im.getbbox()[1] for im in cells[0]);scales=[[scale]*6 for _ in ACTIONS];cols=6
        if a.extras:
            extra=a.extras/(direction+'.png');meta['source_sha256'][direction+'_extra']=hashlib.sha256(extra.read_bytes()).hexdigest()
            with Image.open(extra) as im:
                im=im.convert('RGBA');ew,eh=im.size
                extra_cells=[clean(im.crop((round((i%4)*ew/4),round((i//4)*eh/6),round((i%4+1)*ew/4),round((i//4+1)*eh/6)))) for i in range(22)]
            extra_scale=185/statistics.median(im.getbbox()[3]-im.getbbox()[1] for im in extra_cells[:2])
            for row in range(11):
                original=cells[row];cells[row]=[original[0],original[1],extra_cells[row*2],original[2],original[3],extra_cells[row*2+1],original[4],original[5]]
                scales[row]=[scale,scale,extra_scale,scale,scale,extra_scale,scale,scale]
            cols=8
        atlas=Image.new('RGBA',(cols*256,2816))
        for r,action in enumerate(ACTIONS):
            frames=[]
            for c,im in enumerate(cells[r]):
                scale=scales[r][c]
                box=im.getbbox();sprite=im.crop(box);sprite=sprite.resize((max(1,round(sprite.width*scale)),max(1,round(sprite.height*scale))),Image.Resampling.LANCZOS)
                if sprite.width>248 or sprite.height>242:raise ValueError(f'Frame exceeds normalized canvas: {direction}/{action}/{c}')
                x=128+round((box[0]-im.width/2)*scale);y=232-sprite.height
                if x<0 or x+sprite.width>256:x=(256-sprite.width)//2
                atlas.alpha_composite(sprite,(c*256+x,r*256+y));frames.append([c*256,r*256,256,256])
            meta['anims'][action+'_'+direction]={'sheet':direction,'frames':frames,'fps':10,'loop':action in ['idle','walk','run'],'source_sha256':hashlib.sha256(b''.join(im.tobytes() for im in cells[r])).hexdigest()}
        output=a.output/(direction+'.webp');atlas.save(output,'WEBP',lossless=True,exact=True,method=6)
        meta['sheets'][direction]={'url':'data:image/webp;base64,'+base64.b64encode(output.read_bytes()).decode(),'width':cols*256,'height':2816}
    (a.output/'hero-pack.json').write_text(json.dumps(meta,ensure_ascii=False,separators=(',',':')),encoding='utf8')
    print(json.dumps({'clips':len(meta['anims']),'frames':len(meta['anims'])*cols,'humanReviewedEachFrame':False,'bytes':(a.output/'hero-pack.json').stat().st_size}))
if __name__=='__main__':main()

#!/usr/bin/env python3
"""Deterministic pixel-art atlas builder; preserves RGBA without resampling."""
import argparse, hashlib, json
from pathlib import Path
from PIL import Image

def build(root, manifest, output, max_size=2048, padding=2):
    root=Path(root).resolve(); output=Path(output)
    entries=json.loads(Path(manifest).read_text(encoding="utf8"))["sprites"]
    if not isinstance(entries,list) or not entries: raise ValueError("Empty sprites")
    if not 0<=padding<=64 or max_size<8: raise ValueError("Invalid layout parameters")
    images=[]; seen=set()
    for entry in sorted(entries,key=lambda e:e["id"]):
        if entry["id"] in seen: raise ValueError("Duplicate sprite ID: "+entry["id"])
        seen.add(entry["id"])
        source=(root/entry["file"]).resolve()
        if not source.is_relative_to(root) or not source.is_file(): raise ValueError("Missing or unsafe sprite: "+entry["id"])
        with Image.open(source) as im: image=im.convert("RGBA")
        if image.width+2*padding>max_size or image.height+2*padding>max_size: raise ValueError("Sprite exceeds atlas: "+entry["id"])
        images.append((entry["id"],image,entry["file"]))
    atlases=[];records=[];canvas=Image.new("RGBA",(max_size,max_size),(0,0,0,0))
    x=y=row_height=page=used_width=used_height=0
    output.mkdir(parents=True,exist_ok=True)
    for stale in output.glob("atlas-*.png"):
        stale.unlink()
    def save_page():
        if used_width > 0 and used_height > 0:
            filename=f"atlas-{page:03d}.png"
            canvas.crop((0,0,max(1,used_width),max(1,used_height))).save(output/filename)
            atlases.append(filename)
    for ident,image,source in images:
        width=image.width+2*padding;height=image.height+2*padding
        if x+width>max_size: x=0;y+=row_height;row_height=0
        if y+height>max_size:
            save_page();page+=1
            canvas=Image.new("RGBA",(max_size,max_size),(0,0,0,0))
            x=y=row_height=used_width=used_height=0
        canvas.paste(image,(x+padding,y+padding))
        records.append({"id":ident,"atlas":f"atlas-{page:03d}.png","rect":[x+padding,y+padding,image.width,image.height],"source":source,"sha256":hashlib.sha256(image.tobytes()).hexdigest()})
        x+=width;row_height=max(row_height,height)
        used_width=max(used_width,x);used_height=max(used_height,y+row_height)
    save_page()
    (output/"atlas-manifest.json").write_text(json.dumps({"atlases":atlases,"sprites":records},indent=2,ensure_ascii=False),encoding="utf8")
    return len(atlases),len(records)
if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--root",required=True);p.add_argument("--manifest",required=True);p.add_argument("--output",required=True)
    p.add_argument("--max-size",type=int,default=2048);p.add_argument("--padding",type=int,default=2)
    a=p.parse_args();print(build(a.root,a.manifest,a.output,a.max_size,a.padding))

#!/usr/bin/env python3
"""Render a deterministic sprite contact sheet for human visual review."""
import argparse, json, math
from pathlib import Path
from PIL import Image, ImageDraw

def render(root, manifest, output, cell=96, columns=8):
    root=Path(root).resolve()
    entries=json.loads(Path(manifest).read_text(encoding="utf8"))["sprites"]
    if not entries: raise ValueError("No sprites")
    if cell<16 or columns<1: raise ValueError("Invalid sheet layout")
    width=cell*columns
    height=cell*math.ceil(len(entries)/columns)
    if width*height>60000000: raise ValueError("Sheet exceeds pixel limit")
    canvas=Image.new("RGBA",(width,height),(24,24,24,255))
    draw=ImageDraw.Draw(canvas)
    for i,entry in enumerate(sorted(entries,key=lambda e:str(e["id"]))):
        source=(root/entry["file"]).resolve()
        if not source.is_relative_to(root) or not source.is_file():
            raise ValueError("Missing or unsafe sprite")
        with Image.open(source) as im: sprite=im.convert("RGBA")
        if sprite.width>cell-4 or sprite.height>cell-20:
            scale=min((cell-4)/sprite.width,(cell-20)/sprite.height)
            sprite=sprite.resize((max(1,int(sprite.width*scale)),max(1,int(sprite.height*scale))),Image.Resampling.NEAREST)
        x=(i%columns)*cell;y=(i//columns)*cell
        canvas.alpha_composite(sprite,(x+(cell-sprite.width)//2,y+2))
        draw.text((x+2,y+cell-14),str(entry["id"])[:14],fill=(255,255,255,255))
    output=Path(output)
    output.parent.mkdir(parents=True,exist_ok=True)
    canvas.save(output)
    return {"status":"VISUAL_REVIEW_REQUIRED","frames":len(entries),"sheet":str(output),"note":"Oversized sprites are downscaled with nearest-neighbor for review only; original assets remain unchanged."}
if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--root",required=True)
    p.add_argument("--manifest",required=True)
    p.add_argument("--output",required=True)
    a=p.parse_args()
    print(json.dumps(render(a.root,a.manifest,a.output)))

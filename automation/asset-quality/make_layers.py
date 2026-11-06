#!/usr/bin/env python3
"""Conservative asset-layer extraction. Does not invent missing painted details."""
import argparse, json, hashlib
from pathlib import Path
from PIL import Image
PALETTE=((0,0,0),(62,21,0),(112,39,0),(173,66,1),(229,120,7),(249,189,43),(253,231,102))
def convert(root,manifest,out,allow_quantize=False):
    root=Path(root).resolve();out=Path(out).resolve()
    data=json.loads(Path(manifest).read_text(encoding="utf8"))
    entries=data.get("sprites",[])
    if not entries:raise ValueError("Missing sprites")
    out.mkdir(parents=True,exist_ok=True)
    results=[];issues=[]
    for entry in entries:
        ident=entry["id"]
        src=(root/entry["file"]).resolve()
        if not src.is_relative_to(root) or not src.is_file():raise ValueError("Unsafe or missing source: "+ident)
        with Image.open(src) as image: im=image.convert("RGBA")
        pixels=list(im.getdata())
        bad=sum(1 for p in pixels if p[3]>0 and p[:3] not in PALETTE)
        if bad and not allow_quantize:
            issues.append({"id":ident,"rule":"off_palette","pixels":bad,"action":"manual approval or --quantize"})
            continue
        if bad:
            pixels=[(min(PALETTE,key=lambda c:sum((c[i]-p[i])**2 for i in range(3)))+(p[3],)) if p[3] else p for p in pixels]
            im.putdata(pixels)
        stem=hashlib.sha256(ident.encode()).hexdigest()[:12]
        body=im.copy()
        # Only preserve existing dark silhouette and existing glow; do not fake normals.
        detail=Image.new("RGBA",im.size,(0,0,0,0))
        glow=Image.new("RGBA",im.size,(0,0,0,0))
        gp=[]
        for p in im.getdata():
            gp.append(p if p[3]>0 and p[:3] in PALETTE[4:] else (0,0,0,0))
        glow.putdata(gp)
        names={}
        for layer,asset in (("body",body),("detail",detail),("emissive",glow)):
            name=stem+"-"+layer+".png";asset.save(out/name);names[layer]=name
        results.append({"id":ident,"source":entry["file"],"layers":names,"normal":"UNKNOWN_REQUIRES_ARTIST_OR_GEOMETRY","detail":"EMPTY_REQUIRES_ARTIST","quantized":bool(bad)})
    report={"status":"NEEDS_REVIEW","processed":len(results),"issues":issues,"assets":results,
            "unknown":["normal maps","painted detail","lighting fidelity","artistic parity","runtime"]}
    (out/"layers-report.json").write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding="utf8")
    return report
if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--root",required=True);p.add_argument("--manifest",required=True);p.add_argument("--output",required=True)
    p.add_argument("--quantize",action="store_true")
    a=p.parse_args();print(json.dumps(convert(a.root,a.manifest,a.output,a.quantize),ensure_ascii=False,indent=2))

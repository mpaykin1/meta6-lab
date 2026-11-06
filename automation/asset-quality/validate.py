#!/usr/bin/env python3
"""ABYSS asset production gate. stdlib + Pillow. UNKNOWN is never PASS."""
import argparse, json, pathlib, sys, math
from PIL import Image

PALETTE={(0,0,0),(62,21,0),(112,39,0),(173,66,1),(229,120,7),(249,189,43),(253,231,102)}
def inspect(root, manifest):
    issues=[]; checked=0
    try: data=json.loads(pathlib.Path(manifest).read_text(encoding="utf8"))
    except (OSError,ValueError) as e: return {"status":"FAIL","checked":0,"issues":[{"rule":"manifest","detail":str(e)}]}
    entries=data.get("sprites",[]) if isinstance(data,dict) else data
    if not isinstance(entries,list) or not entries:
        return {"status":"FAIL","checked":0,"issues":[{"rule":"manifest","detail":"empty or invalid sprites array"}]}
    ids=set()
    for entry in entries:
        if not isinstance(entry,dict): issues.append({"rule":"entry_object"}); continue
        name=entry.get("id","?")
        if not isinstance(name,str) or not name.strip():
            issues.append({"rule":"invalid_id"}); name=str(name)
        if name in ids: issues.append({"id":name,"rule":"unique_id"})
        ids.add(name)
        for field in ("id","file","kind","type","stage","anim","frame","frames","fps","sizeArt","pivot","hitbox","atlas","rect","source"):
            if field not in entry: issues.append({"id":name,"rule":"manifest","detail":"missing "+field})
        file=entry.get("file")
        if not isinstance(file,str) or not file or pathlib.PurePosixPath(file).is_absolute() or ".." in pathlib.PurePosixPath(file).parts:
            issues.append({"id":name,"rule":"file_path"}); continue
        path=pathlib.Path(root)/file
        if not path.resolve().is_relative_to(pathlib.Path(root).resolve()): issues.append({"id":name,"rule":"file_escape"}); continue
        if not path.is_file(): issues.append({"id":name,"rule":"missing_file"}); continue
        try:
            im=Image.open(path).convert("RGBA")
        except Exception as e:
            issues.append({"id":name,"rule":"decode","detail":str(e)}); continue
        checked+=1
        w,h=im.size
        if w>2048 or h>2048: issues.append({"id":name,"rule":"atlas_size"})
        alpha=im.getchannel("A")
        bbox=alpha.getbbox()
        if not bbox: issues.append({"id":name,"rule":"empty_sprite"}); continue
        if bbox[0]<2 or bbox[1]<2 or w-bbox[2]<2 or h-bbox[3]<2:
            issues.append({"id":name,"rule":"padding_2px"})
        pixels=list(im.getdata())
        colored=[p for p in pixels if p[3]]
        if any(p[:3] not in PALETTE for p in colored):
            issues.append({"id":name,"rule":"seven_color_palette"})
        if colored and sum(p[3]==255 for p in colored)/len(colored)<.95:
            issues.append({"id":name,"rule":"opaque_body_95pct"})
        for field, n in (("sizeArt",2),("pivot",2),("rect",4)):
            val=entry.get(field)
            if not isinstance(val,list) or len(val)!=n or any(not isinstance(x,(int,float)) or not math.isfinite(x) for x in val):
                issues.append({"id":name,"rule":"invalid_"+field})
        rect=entry.get("rect")
        if isinstance(rect,list) and len(rect)==4 and all(isinstance(x,int) for x in rect) and (rect[2]<=0 or rect[3]<=0 or any(x<0 for x in rect)):
            issues.append({"id":name,"rule":"rect_geometry"})
        if type(entry.get("stage")) is not int or entry["stage"] not in range(5): issues.append({"id":name,"rule":"stage_0_4"})
        if type(entry.get("frames")) is not int or entry.get("frames",0)<1: issues.append({"id":name,"rule":"frames"})
        for layer in ("body","detail","normal","emissive"):
            layers=entry.get("layers")
            layerfile=layers.get(layer) if isinstance(layers,dict) else None
            if not isinstance(layerfile,str) or not layerfile or pathlib.PurePosixPath(layerfile).is_absolute() or ".." in pathlib.PurePosixPath(layerfile).parts or not (pathlib.Path(root)/layerfile).resolve().is_relative_to(pathlib.Path(root).resolve()) or not (pathlib.Path(root)/layerfile).is_file():
                issues.append({"id":name,"rule":"layer_"+layer})
    return {"status":"FAIL" if issues else "STATIC_PASS_RUNTIME_UNKNOWN","checked":checked,"issues":issues,
            "runtime_unknown":["animated pivots/loops","dynamic light 8 directions","3D geometry and collisions","touch movement","FPS on device","visual owner approval"]}
def main():
    p=argparse.ArgumentParser();p.add_argument("--root",required=True);p.add_argument("--manifest",required=True);p.add_argument("--output");a=p.parse_args()
    result=inspect(a.root,a.manifest)
    rendered=json.dumps(result,ensure_ascii=False,indent=2)
    if a.output:pathlib.Path(a.output).write_text(rendered,encoding="utf8")
    print(rendered)
    return 1 if result["status"]=="FAIL" else 0
if __name__=="__main__":sys.exit(main())

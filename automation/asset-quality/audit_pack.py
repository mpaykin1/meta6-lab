#!/usr/bin/env python3
"""Validate production asset-pack coverage and provenance. No third-party dependencies."""
import argparse
import hashlib
import json
import pathlib
import sys

REQUIRED=("id","file","type","stage","anim","frame","frames","fps","pivot","hitbox","atlas","rect","source","layers")
def analyze(root,manifest,requirements=None):
    root=pathlib.Path(root).resolve()
    issues=[];unknown=[];checks=0
    try:
        doc=json.loads(pathlib.Path(manifest).read_text(encoding="utf-8"))
    except (OSError,ValueError) as e:
        return {"status":"FAIL","issues":[{"rule":"manifest_read","detail":str(e)}],"unknown":[],"checks":0}
    sprites=doc.get("sprites") if isinstance(doc,dict) else doc
    if not isinstance(sprites,list) or not sprites:
        return {"status":"FAIL","issues":[{"rule":"sprites_missing"}],"unknown":[],"checks":0}
    groups={};ids=set();provenance=[]
    for i,s in enumerate(sprites):
        if not isinstance(s,dict):
            issues.append({"rule":"sprite_object","index":i});continue
        ident=s.get("id")
        if not isinstance(ident,str) or not ident.strip() or ident in ids:
            issues.append({"rule":"sprite_id","index":i})
        ids.add(ident)
        for k in REQUIRED:
            if k not in s: issues.append({"rule":"required_field","id":ident,"field":k})
        kind=s.get("type")
        stage=s.get("stage")
        if isinstance(kind,str) and isinstance(stage,int) and not isinstance(stage,bool):
            groups.setdefault(kind,set()).add(stage)
        for key in ("file","source"):
            name=s.get(key)
            if not isinstance(name,str) or not name:
                issues.append({"rule":"invalid_path","id":ident,"field":key});continue
            target=(root/name).resolve()
            if not target.is_relative_to(root):
                issues.append({"rule":"path_escape","id":ident,"field":key});continue
            if not target.is_file():
                unknown.append({"rule":"missing_source" if key=="source" else "missing_asset","id":ident,"file":name});continue
            checks+=1
            if key=="source":
                provenance.append({"id":ident,"source":name,"sha256":hashlib.sha256(target.read_bytes()).hexdigest()})
        if isinstance(s.get("fps"),(int,float)) and not isinstance(s["fps"],bool) and s["fps"]<=0:
            issues.append({"rule":"fps_positive","id":ident})
        if isinstance(s.get("frame"),int) and isinstance(s.get("frames"),int) and not (0<=s["frame"]<s["frames"]):
            issues.append({"rule":"frame_bounds","id":ident})
    config={}
    if requirements:
        try:config=json.loads(pathlib.Path(requirements).read_text(encoding="utf-8"))
        except (OSError,ValueError) as e:issues.append({"rule":"requirements_read","detail":str(e)})
    if isinstance(config,dict):
        stages=config.get("stages")
        if isinstance(stages,list):
            for kind,found in groups.items():
                missing=set(stages)-found
                if missing:issues.append({"rule":"missing_stages","type":kind,"stages":sorted(missing)})
        count=config.get("min_creature_types")
        if isinstance(count,int) and len(groups)<count:
            issues.append({"rule":"creature_coverage","actual":len(groups),"required":count})
        for item in config.get("requirements",[]):
            if not isinstance(item,dict) or not item.get("id") or not item.get("test"):
                issues.append({"rule":"untraceable_requirement","item":item})
            elif item.get("status") not in ("FAIL","UNKNOWN","STATIC_PASS","OWNER_APPROVED"):
                issues.append({"rule":"invalid_requirement_status","id":item["id"]})
            elif item["status"]=="UNKNOWN":unknown.append({"rule":"requirement_unverified","id":item["id"]})
    return {"status":"FAIL" if issues else "STATIC_PASS_RUNTIME_UNKNOWN","checks":checks,"sprites":len(sprites),"creature_types":len(groups),"issues":issues,"unknown":unknown,"provenance":provenance,
            "runtime_unknown":["visual reference parity","eight-way relighting","animation continuity","hybrid 3D","real-device FPS","owner approval"]}
def main():
    p=argparse.ArgumentParser()
    p.add_argument("--root",required=True);p.add_argument("--manifest",required=True)
    p.add_argument("--requirements");p.add_argument("--output")
    a=p.parse_args();report=analyze(a.root,a.manifest,a.requirements)
    out=json.dumps(report,ensure_ascii=False,indent=2)
    if a.output:pathlib.Path(a.output).write_text(out,encoding="utf-8")
    print(out);return int(report["status"]=="FAIL")
if __name__=="__main__":sys.exit(main())

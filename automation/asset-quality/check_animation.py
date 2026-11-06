#!/usr/bin/env python3
"""Validate frame completeness, pivots and per-direction animation sequences."""
import argparse,json,math
from collections import defaultdict
from pathlib import Path
def analyze(manifest, min_directions=8, min_frames=8, max_pivot_drift=1):
    doc=json.loads(Path(manifest).read_text(encoding="utf8"))
    entries=doc["sprites"] if isinstance(doc,dict) else doc
    issues=[];groups=defaultdict(list)
    for e in entries:
        if not isinstance(e,dict):
            issues.append({"rule":"invalid_entry"});continue
        direction=e.get("direction")
        if not isinstance(direction,int) or isinstance(direction,bool) or direction<0 or direction>=min_directions:
            issues.append({"rule":"invalid_direction","id":e.get("id")});continue
        key=(e.get("type"),e.get("stage"),e.get("anim"))
        groups[key].append(e)
    for key,frames in groups.items():
        directions=defaultdict(list)
        for e in frames:directions[e["direction"]].append(e)
        if len(directions)<min_directions:
            issues.append({"rule":"missing_directions","group":key,"actual":len(directions),"required":min_directions})
        for direction in range(min_directions):
            items=directions.get(direction,[])
            indexes=[e.get("frame") for e in items]
            if (len(items)<min_frames or any(not isinstance(i,int) or isinstance(i,bool) for i in indexes) or sorted(indexes)!=list(range(len(items)))):
                issues.append({"rule":"frame_sequence","group":key,"direction":direction,"actual":len(items)})
            if len(indexes)!=len(set(str(i) for i in indexes)):
                issues.append({"rule":"duplicate_frames","group":key,"direction":direction})
            pivots=[e.get("pivot") for e in items]
            if pivots and all(isinstance(p,list) and len(p)==2 and all(isinstance(v,(int,float)) and math.isfinite(v) for v in p) for p in pivots):
                x0,y0=pivots[0]
                if any(math.hypot(p[0]-x0,p[1]-y0)>max_pivot_drift for p in pivots[1:]):
                    issues.append({"rule":"pivot_drift","group":key,"direction":direction})
            elif pivots:issues.append({"rule":"invalid_pivot","group":key,"direction":direction})
    if not groups:issues.append({"rule":"no_animation_groups"})
    return {"status":"FAIL" if issues else "STATIC_PASS_RUNTIME_UNKNOWN","groups":len(groups),"issues":issues,
            "runtime_unknown":["actual pose continuity","limb articulation","state transitions","independent actor behavior","visual owner approval"]}
if __name__=="__main__":
    p=argparse.ArgumentParser();p.add_argument("--manifest",required=True);p.add_argument("--min-directions",type=int,default=8);p.add_argument("--min-frames",type=int,default=8);p.add_argument("--output")
    a=p.parse_args();r=analyze(a.manifest,a.min_directions,a.min_frames);out=json.dumps(r,ensure_ascii=False,indent=2)
    if a.output:Path(a.output).write_text(out,encoding="utf8")
    print(out);raise SystemExit(r["status"]=="FAIL")

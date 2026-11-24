"""Only data from immutable candidate checkout; no execution of candidate code."""
import json,sys,re
from pathlib import Path
root=Path(sys.argv[1]).resolve(); sha=sys.argv[3]
def resolve(s):
    p=Path(s)
    if p.is_absolute(): raise ValueError("relative paths only")
    q=(root/p).resolve(strict=True)
    if not q.is_relative_to(root): raise ValueError("path outside checkout")
    return str(q)
c=json.loads(Path(resolve(sys.argv[2])).read_text())
if c.get("segmentation"): raise ValueError("hosted mode requires independently approved supplied masks; no candidate checkpoints")
for key in ("candidate","reference","action_json","regression_dir"):
    c[key]=resolve(c[key])
rel=Path(c["candidate"]).relative_to(root).as_posix()
if not rel.startswith("asset-packs/incoming/bullet-car-gif/staging/"): raise ValueError("candidate must be staged")
url=f"https://raw.githubusercontent.com/mpaykin1/meta6-lab/{sha}/{rel}"
if c.get("candidate_raw_url") not in (None,url): raise ValueError("raw URL mismatch")
c["candidate_raw_url"]=url
for key in ("candidate_frames","reference_frames"):
    for e in c[key]:
        for k in ("body_mask","allowed_edit_mask"):
            if e.get(k): e[k]=resolve(e[k])
# Action JSON is data, its relative mask paths are resolved by the existing checker.
# Reject absolute or escaping paths within action JSON, preserving all numeric conditions.
def validate_paths(obj):
    if isinstance(obj,dict):
        for k,v in obj.items():
            if isinstance(v,str) and (v.endswith((".png",".gif",".json")) or "mask" in k and "/" in v):
                p=(Path(c["action_json"]).parent/v).resolve()
                if Path(v).is_absolute() or not p.is_relative_to(root): raise ValueError("unsafe action path")
            else: validate_paths(v)
    elif isinstance(obj,list):
        for v in obj: validate_paths(v)
validate_paths(json.loads(Path(c["action_json"]).read_text()))
Path(sys.argv[4]).write_text(json.dumps(c,ensure_ascii=False))

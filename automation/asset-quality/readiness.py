#!/usr/bin/env python3
"""Evidence-based readiness. Missing evidence cannot be scored as completed."""
import argparse,json,hashlib
from pathlib import Path
GATES={"manifest_and_palette":15,"atlas":10,"layers":10,"animation_metadata":15,"visual_reference":15,"runtime_2d_25d_3d":15,"mobile_fps":10,"owner_acceptance":10}
def score(evidence, root=None):
    if not isinstance(evidence,dict):raise ValueError("Evidence must be an object")
    points=0;results={}
    base=Path(root).resolve() if root is not None else None
    for name,weight in GATES.items():
        record=evidence.get(name,{})
        if not isinstance(record,dict):record={}
        artifact=record.get("artifact")
        claimed=record.get("status")=="PASS" and isinstance(artifact,str) and bool(artifact.strip())
        passed=False
        if claimed and base is not None:
            candidate=(base/artifact).resolve()
            expected=record.get("sha256")
            if candidate.is_relative_to(base) and candidate.is_file() and isinstance(expected,str) and len(expected)==64:
                try:
                    passed=hashlib.sha256(candidate.read_bytes()).hexdigest()==expected.lower()
                except OSError:
                    passed=False
        results[name]={"weight":weight,"verified":passed,"status":"PASS" if passed else "UNVERIFIED_CLAIM" if claimed else "UNKNOWN"}
        if passed:points+=weight
    return {"verified_score":points,"possible_score":100,"status":"INCOMPLETE" if points<100 else "EVIDENCE_RECORDED_OWNER_VERIFY","gates":results,
            "note":"Only existing files with matching SHA256 earn points; inspect contents and CI separately."}
if __name__=="__main__":
    p=argparse.ArgumentParser();p.add_argument("--evidence",required=True);p.add_argument("--output");p.add_argument("--root");a=p.parse_args()
    report=score(json.loads(Path(a.evidence).read_text(encoding="utf8")),a.root)
    result=json.dumps(report,ensure_ascii=False,indent=2)
    if a.output:Path(a.output).write_text(result,encoding="utf8")
    print(result)

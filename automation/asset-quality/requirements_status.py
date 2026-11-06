#!/usr/bin/env python3
"""Summarize ABYSS requirements without converting UNKNOWN into success."""
import argparse
import json
from pathlib import Path

VALID={"PASS","FAIL","UNKNOWN"}

def summarize(document):
    requirements=document.get("requirements") if isinstance(document,dict) else None
    if not isinstance(requirements,list) or not requirements:
        raise ValueError("requirements must be a nonempty list")
    ids=set()
    counts={key:0 for key in ("PASS","FAIL","UNKNOWN")}
    for requirement in requirements:
        if not isinstance(requirement,dict):
            raise ValueError("requirement must be an object")
        ident=requirement.get("id")
        status=requirement.get("status")
        if not isinstance(ident,str) or not ident.strip() or ident in ids:
            raise ValueError("missing or duplicate requirement ID")
        if status not in VALID:
            raise ValueError("invalid requirement status")
        ids.add(ident)
        counts[status]+=1
    total=len(requirements)
    return {"status":"FAIL" if counts["FAIL"] else "UNKNOWN" if counts["UNKNOWN"] else "PASS",
            "total":total,"counts":counts,"verified_pass_ratio":counts["PASS"]/total,
            "note":"Only requirement records explicitly marked PASS count. This is not proof of asset readiness."}

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--requirements",required=True)
    parser.add_argument("--output")
    args=parser.parse_args()
    result=summarize(json.loads(Path(args.requirements).read_text(encoding="utf-8")))
    output=json.dumps(result,indent=2)
    if args.output:
        Path(args.output).write_text(output,encoding="utf-8")
    print(output)

#!/usr/bin/env python3
"""Deterministic objective image comparison; artistic approval remains human."""
import argparse, json
from pathlib import Path
from PIL import Image

def compare(reference, candidate, max_mismatch=0):
    if not 0 <= max_mismatch <= 1:
        raise ValueError("max_mismatch must be in [0,1]")
    with Image.open(reference) as ref, Image.open(candidate) as got:
        if ref.size != got.size:
            return {"status":"FAIL","reason":"size_mismatch","reference_size":list(ref.size),"candidate_size":list(got.size)}
        a=ref.convert("RGBA").tobytes()
        b=got.convert("RGBA").tobytes()
        total=len(a)//4
        mismatches=sum(a[i:i+4]!=b[i:i+4] for i in range(0,len(a),4))
        ratio=mismatches/total
        return {"status":"PIXEL_PASS_ART_REVIEW_UNKNOWN" if ratio<=max_mismatch else "FAIL",
                "pixels":total,"mismatched_pixels":mismatches,"mismatch_ratio":ratio,
                "threshold":max_mismatch,"artistic_approval":"UNKNOWN"}

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--reference",required=True)
    p.add_argument("--candidate",required=True)
    p.add_argument("--max-mismatch",type=float,default=0)
    p.add_argument("--output")
    a=p.parse_args()
    report=compare(a.reference,a.candidate,a.max_mismatch)
    result=json.dumps(report,ensure_ascii=False,indent=2)
    if a.output:Path(a.output).write_text(result,encoding="utf8")
    print(result)
    raise SystemExit(1 if report["status"]=="FAIL" else 0)

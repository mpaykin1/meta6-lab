#!/usr/bin/env python3
"""Batch comparison against approved pixel references; missing reference coverage is UNKNOWN."""
import argparse, json
from pathlib import Path
from compare_reference import compare

def audit(root, references):
    root=Path(root).resolve()
    references=Path(references).resolve()
    if not root.is_dir() or not references.is_dir():
        return {"status":"UNKNOWN","checked":0,"reason":"assets_or_references_missing","results":[]}
    manifest=references/"manifest.json"
    if not manifest.is_file():
        return {"status":"UNKNOWN","checked":0,"reason":"reference_manifest_missing","results":[]}
    try:
        records=json.loads(manifest.read_text(encoding="utf8"))["comparisons"]
        if not isinstance(records,list) or not records:
            raise ValueError("empty comparisons")
    except (OSError,ValueError,KeyError,TypeError,OverflowError) as error:
        return {"status":"FAIL","checked":0,"reason":str(error),"results":[]}
    results=[]
    seen=set()
    declared_candidates=set()
    verified_candidates=set()
    compared_pixels=0
    mismatched_pixels=0
    expected_assets=set()
    assets_manifest=root/"manifest.json"
    if not assets_manifest.is_file():
        return {"status":"UNKNOWN","checked":0,"reason":"asset_manifest_missing","results":[]}
    if assets_manifest.is_file():
        try:
            sprites=json.loads(assets_manifest.read_text(encoding="utf8"))["sprites"]
            if not isinstance(sprites,list) or not sprites: raise ValueError("empty asset manifest")
            asset_files=[sprite["file"] for sprite in sprites]
            if any(not isinstance(name,str) or not name.strip() for name in asset_files):
                raise ValueError("invalid_asset_file")
            if len(set(asset_files))!=len(asset_files):
                raise ValueError("duplicate_asset_file")
            expected_assets=set(asset_files)
        except (OSError,ValueError,KeyError,TypeError):
            return {"status":"FAIL","checked":0,"reason":"invalid_asset_manifest","results":[]}
    for record in records:
        try:
            ident=record["id"]
            if not isinstance(ident,str) or not ident.strip() or ident in seen:
                raise ValueError("missing_or_duplicate_id")
            seen.add(ident)
            candidate_name=record["candidate"]
            reference_name=record["reference"]
            if not isinstance(candidate_name,str) or not candidate_name.strip() or not isinstance(reference_name,str) or not reference_name.strip():
                raise ValueError("invalid_candidate_or_reference_path")
            tolerance=record.get("max_mismatch",0)
            if isinstance(tolerance,bool) or not isinstance(tolerance,(int,float)) or not 0<=tolerance<=1:
                raise ValueError("invalid_max_mismatch")
            if candidate_name in declared_candidates: raise ValueError("duplicate_candidate")
            declared_candidates.add(candidate_name)
            candidate=(root/candidate_name).resolve()
            reference=(references/reference_name).resolve()
            if not candidate.is_relative_to(root) or not reference.is_relative_to(references):
                raise ValueError("path_escape")
            if not candidate.is_file() or not reference.is_file():
                raise ValueError("missing_reference_or_candidate")
            result=compare(reference,candidate,tolerance)
            if isinstance(result.get("pixels"),int) and isinstance(result.get("mismatched_pixels"),int):
                compared_pixels+=result["pixels"]
                mismatched_pixels+=result["mismatched_pixels"]
            if result["status"]!="FAIL":
                verified_candidates.add(candidate_name)
            result["id"]=record.get("id")
        except (OSError,ValueError,KeyError,TypeError) as error:
            result={"status":"FAIL","id":record.get("id") if isinstance(record,dict) else None,"reason":str(error)}
        results.append(result)
    missing=sorted(expected_assets-declared_candidates)
    extra=sorted(declared_candidates-expected_assets) if expected_assets else []
    if missing:
        results.append({"status":"FAIL","reason":"uncovered_asset_manifest_sprites","missing":missing[:100],"missing_count":len(missing)})
    if extra:
        results.append({"status":"FAIL","reason":"undeclared_candidate_sprites","extra":extra[:100],"extra_count":len(extra)})
    coverage=(len(expected_assets & verified_candidates)/len(expected_assets)) if expected_assets else None
    pixel_ratio=(mismatched_pixels/compared_pixels) if compared_pixels else None
    blockers=[{"id":x.get("id"),"reason":x.get("reason","pixel_mismatch"),"mismatch_ratio":x.get("mismatch_ratio")} for x in results if x["status"]=="FAIL"]
    blockers.sort(key=lambda item:(item["mismatch_ratio"] is None, -(item["mismatch_ratio"] or 0), str(item["id"])))
    return {"status":"FAIL" if any(x["status"]=="FAIL" for x in results) else "PIXEL_PASS_ART_REVIEW_UNKNOWN",
            "checked":len(records),"results":results,"artistic_approval":"UNKNOWN",
            "blockers":{"count":len(blockers),"items":blockers[:100],"truncated":len(blockers)>100},
            "pixel_quality":{"compared_pixels":compared_pixels,"mismatched_pixels":mismatched_pixels,"mismatch_ratio":pixel_ratio},
            "coverage":{"expected":len(expected_assets),"declared":len(expected_assets & declared_candidates),"verified":len(expected_assets & verified_candidates),"ratio":coverage,"complete":coverage==1.0 if coverage is not None else None}}

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--root",required=True)
    p.add_argument("--references",required=True)
    p.add_argument("--output")
    p.add_argument("--require-assets",action="store_true",help="Fail instead of UNKNOWN when production assets or references are missing")
    a=p.parse_args()
    result=audit(a.root,a.references)
    text=json.dumps(result,ensure_ascii=False,indent=2)
    if a.output:Path(a.output).write_text(text,encoding="utf8")
    print(text)
    raise SystemExit(1 if result["status"]=="FAIL" or (a.require_assets and result["status"]=="UNKNOWN") else 0)

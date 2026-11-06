"""Release-only human approval gate tied to exact production manifests."""
import argparse
import hashlib
from datetime import datetime, timezone
import json
from pathlib import Path

def verify(approval_path, asset_manifest, reference_manifest):
    approval_path=Path(approval_path)
    if not approval_path.is_file():
        return {"status":"FAIL","reason":"owner_approval_missing"}
    try:
        record=json.loads(approval_path.read_text(encoding="utf-8"))
        if not isinstance(record,dict) or record.get("approved") is not True:
            return {"status":"FAIL","reason":"owner_approval_not_granted"}
        for key,path in (("asset_manifest_sha256",asset_manifest),("reference_manifest_sha256",reference_manifest)):
            expected=hashlib.sha256(Path(path).read_bytes()).hexdigest()
            if record.get(key)!=expected:
                return {"status":"FAIL","reason":"approval_digest_mismatch","field":key}
        if not isinstance(record.get("reviewer"),str) or not record["reviewer"].strip():
            return {"status":"FAIL","reason":"reviewer_missing"}
        if not isinstance(record.get("reviewed_at"),str) or not record["reviewed_at"].strip():
            return {"status":"FAIL","reason":"review_timestamp_missing"}
        try:
            timestamp=datetime.fromisoformat(record["reviewed_at"].replace("Z","+00:00"))
            if timestamp.tzinfo is None or timestamp > datetime.now(timezone.utc):
                return {"status":"FAIL","reason":"invalid_review_timestamp"}
        except ValueError:
            return {"status":"FAIL","reason":"invalid_review_timestamp"}
        if not isinstance(record.get("evidence"),list) or not record["evidence"] or any(not isinstance(x,dict) for x in record["evidence"]):
            return {"status":"FAIL","reason":"review_evidence_missing"}
        for item in record["evidence"]:
            if not isinstance(item,dict) or not isinstance(item.get("path"),str) or not item["path"].strip() or not isinstance(item.get("sha256"),str) or len(item["sha256"])!=64:
                return {"status":"FAIL","reason":"invalid_evidence_record"}
            evidence=Path(item["path"])
            if evidence.is_absolute() or ".." in evidence.parts or not evidence.parts:
                return {"status":"FAIL","reason":"unsafe_evidence_path"}
            resolved=(approval_path.parent/evidence).resolve()
            if not resolved.is_relative_to(approval_path.parent.resolve()) or not resolved.is_file():
                return {"status":"FAIL","reason":"evidence_file_missing","path":item["path"]}
            if hashlib.sha256(resolved.read_bytes()).hexdigest()!=item["sha256"]:
                return {"status":"FAIL","reason":"evidence_digest_mismatch","path":item["path"]}
        return {"status":"PASS","reviewer":record["reviewer"],"reviewed_at":record["reviewed_at"],"evidence_count":len(record["evidence"])}
    except (OSError,ValueError,TypeError) as error:
        return {"status":"FAIL","reason":"invalid_approval","detail":str(error)}

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--approval",required=True)
    p.add_argument("--asset-manifest",required=True)
    p.add_argument("--reference-manifest",required=True)
    p.add_argument("--output")
    a=p.parse_args()
    result=verify(a.approval,a.asset_manifest,a.reference_manifest)
    rendered=json.dumps(result,indent=2)
    if a.output:Path(a.output).write_text(rendered,encoding="utf-8")
    print(rendered)
    raise SystemExit(result["status"]!="PASS")

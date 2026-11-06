import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from check_owner_approval import verify

class OwnerApprovalTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        root=Path(self.tmp.name)
        self.assets=root/"assets.json"
        self.refs=root/"refs.json"
        self.approval=root/"approval.json"
        (root/"manual-art-review").write_text("reviewed",encoding="utf-8")
        self.assets.write_text('{"sprites":[]}',encoding="utf-8")
        self.refs.write_text('{"comparisons":[]}',encoding="utf-8")
    def record(self,approved=True,reviewer="owner"):
        record={"approved":approved,"reviewer":reviewer,
                "reviewed_at":"2026-10-21T00:00:00Z","evidence":[{"path":"manual-art-review","sha256":hashlib.sha256((self.approval.parent/"manual-art-review").read_bytes()).hexdigest()}],
                "asset_manifest_sha256":hashlib.sha256(self.assets.read_bytes()).hexdigest(),
                "reference_manifest_sha256":hashlib.sha256(self.refs.read_bytes()).hexdigest()}
        self.approval.write_text(json.dumps(record),encoding="utf-8")
    def test_missing_approval_fails(self):
        self.assertEqual(verify(self.approval,self.assets,self.refs)["status"],"FAIL")
    def test_explicit_approval_passes(self):
        self.record()
        self.assertEqual(verify(self.approval,self.assets,self.refs)["status"],"PASS")
    def test_denial_fails(self):
        self.record(approved=False)
        self.assertEqual(verify(self.approval,self.assets,self.refs)["status"],"FAIL")
    def test_empty_reviewer_fails(self):
        self.record(reviewer=" ")
        self.assertEqual(verify(self.approval,self.assets,self.refs)["status"],"FAIL")
    def test_changed_assets_invalidate_approval(self):
        self.record()
        self.assets.write_text('{"sprites":[1]}',encoding="utf-8")
        self.assertEqual(verify(self.approval,self.assets,self.refs)["reason"],"approval_digest_mismatch")
    def test_changed_references_invalidate_approval(self):
        self.record()
        self.refs.write_text('{"comparisons":[1]}',encoding="utf-8")
        self.assertEqual(verify(self.approval,self.assets,self.refs)["reason"],"approval_digest_mismatch")
    def test_missing_review_evidence_fails(self):
        self.record()
        record=json.loads(self.approval.read_text(encoding="utf-8"))
        record["evidence"]=[]
        self.approval.write_text(json.dumps(record),encoding="utf-8")
        self.assertEqual(verify(self.approval,self.assets,self.refs)["reason"],"review_evidence_missing")
    def test_missing_review_timestamp_fails(self):
        self.record()
        record=json.loads(self.approval.read_text(encoding="utf-8"))
        record.pop("reviewed_at")
        self.approval.write_text(json.dumps(record),encoding="utf-8")
        self.assertEqual(verify(self.approval,self.assets,self.refs)["reason"],"review_timestamp_missing")
    def test_missing_evidence_file_fails(self):
        self.record()
        (self.approval.parent/"manual-art-review").unlink()
        self.assertEqual(verify(self.approval,self.assets,self.refs)["reason"],"evidence_file_missing")
    def test_evidence_path_traversal_fails(self):
        self.record()
        record=json.loads(self.approval.read_text(encoding="utf-8"))
        record["evidence"]=[{"path":"../outside","sha256":"0"*64}]
        self.approval.write_text(json.dumps(record),encoding="utf-8")
        self.assertEqual(verify(self.approval,self.assets,self.refs)["reason"],"unsafe_evidence_path")
    def test_modified_evidence_fails(self):
        self.record()
        (self.approval.parent/"manual-art-review").write_text("tampered",encoding="utf-8")
        self.assertEqual(verify(self.approval,self.assets,self.refs)["reason"],"evidence_digest_mismatch")
    def test_invalid_review_timestamp_fails(self):
        self.record()
        record=json.loads(self.approval.read_text(encoding="utf-8"))
        record["reviewed_at"]="not-a-date"
        self.approval.write_text(json.dumps(record),encoding="utf-8")
        self.assertEqual(verify(self.approval,self.assets,self.refs)["reason"],"invalid_review_timestamp")
    def test_naive_review_timestamp_fails(self):
        self.record()
        record=json.loads(self.approval.read_text(encoding="utf-8"))
        record["reviewed_at"]="2026-10-21T00:00:00"
        self.approval.write_text(json.dumps(record),encoding="utf-8")
        self.assertEqual(verify(self.approval,self.assets,self.refs)["reason"],"invalid_review_timestamp")
    def test_future_review_timestamp_fails(self):
        self.record()
        record=json.loads(self.approval.read_text(encoding="utf-8"))
        record["reviewed_at"]="2999-01-01T00:00:00Z"
        self.approval.write_text(json.dumps(record),encoding="utf-8")
        self.assertEqual(verify(self.approval,self.assets,self.refs)["reason"],"invalid_review_timestamp")
    def test_malformed_json_fails(self):
        self.approval.write_text("{",encoding="utf-8")
        self.assertEqual(verify(self.approval,self.assets,self.refs)["status"],"FAIL")

if __name__=="__main__":
    unittest.main()

import unittest, tempfile, hashlib
from pathlib import Path
from readiness import score
class ReadinessTests(unittest.TestCase):
    def test_empty(self):
        self.assertEqual(score({})["verified_score"],0)
    def test_claim_without_artifact(self):
        self.assertEqual(score({"atlas":{"status":"PASS"}})["verified_score"],0)
    def test_claim_with_artifact(self):
        self.assertEqual(score({"atlas":{"status":"PASS","artifact":"ci/run/123"}})["verified_score"],0)
    def test_unknown(self):
        self.assertEqual(score({"atlas":{"status":"UNKNOWN","artifact":"ci/run/123"}})["verified_score"],0)
    def test_matching_hash(self):
        with tempfile.TemporaryDirectory() as tmp:
            path=Path(tmp)/"evidence.json"
            path.write_bytes(b"checked")
            digest=hashlib.sha256(b"checked").hexdigest()
            report=score({"atlas":{"status":"PASS","artifact":"evidence.json","sha256":digest}},tmp)
            self.assertEqual(report["verified_score"],10)
    def test_bad_hash(self):
        with tempfile.TemporaryDirectory() as tmp:
            (Path(tmp)/"evidence.json").write_bytes(b"checked")
            report=score({"atlas":{"status":"PASS","artifact":"evidence.json","sha256":"0"*64}},tmp)
            self.assertEqual(report["verified_score"],0)
    def test_path_escape(self):
        with tempfile.TemporaryDirectory() as tmp:
            report=score({"atlas":{"status":"PASS","artifact":"../outside.json","sha256":"0"*64}},tmp)
            self.assertEqual(report["verified_score"],0)
if __name__=="__main__":unittest.main()

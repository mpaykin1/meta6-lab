import json
import tempfile
import unittest
from pathlib import Path
from PIL import Image
from compare_reference_batch import audit

class ReferenceInputHardeningTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        root=Path(self.tmp.name)
        self.assets=root/"assets"
        self.references=root/"references"
        self.assets.mkdir()
        self.references.mkdir()
        (self.assets/"manifest.json").write_text(json.dumps({"sprites":[{"file":"sprite.png"}]}))
        Image.new("RGBA",(2,2),(0,0,0,0)).save(self.assets/"sprite.png")
        Image.new("RGBA",(2,2),(0,0,0,0)).save(self.references/"sprite.png")
    def check(self,record,reason):
        (self.references/"manifest.json").write_text(json.dumps({"comparisons":[record]}))
        report=audit(self.assets,self.references)
        self.assertEqual(report["status"],"FAIL")
        self.assertTrue(any(x.get("reason")==reason for x in report["results"]),report)
    def test_unhashable_candidate(self):
        self.check({"id":"a","candidate":[],"reference":"sprite.png"},"invalid_candidate_or_reference_path")
    def test_unhashable_reference(self):
        self.check({"id":"a","candidate":"sprite.png","reference":{}},"invalid_candidate_or_reference_path")
    def test_boolean_tolerance(self):
        self.check({"id":"a","candidate":"sprite.png","reference":"sprite.png","max_mismatch":True},"invalid_max_mismatch")
    def test_out_of_range_tolerance(self):
        self.check({"id":"a","candidate":"sprite.png","reference":"sprite.png","max_mismatch":2},"invalid_max_mismatch")
    def test_valid_pair(self):
        (self.references/"manifest.json").write_text(json.dumps({"comparisons":[{"id":"a","candidate":"sprite.png","reference":"sprite.png"}]}))
        report=audit(self.assets,self.references)
        self.assertEqual(report["status"],"PIXEL_PASS_ART_REVIEW_UNKNOWN")
        self.assertEqual(report["coverage"]["ratio"],1.0)

if __name__=="__main__":
    unittest.main()

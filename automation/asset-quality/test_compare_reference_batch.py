import json,tempfile,unittest
from pathlib import Path
from PIL import Image
from compare_reference_batch import audit

class BatchReferenceTests(unittest.TestCase):
    def test_missing_references_unknown(self):
        with tempfile.TemporaryDirectory() as tmp:
            self.assertEqual(audit(Path(tmp)/"assets",Path(tmp)/"refs")["status"],"UNKNOWN")
    def test_matching_reference(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);assets=root/"assets";refs=root/"refs"
            assets.mkdir();refs.mkdir()
            Image.new("RGBA",(3,3),(0,0,0,255)).save(assets/"a.png")
            Image.new("RGBA",(3,3),(0,0,0,255)).save(refs/"a.png")
            (refs/"manifest.json").write_text(json.dumps({"comparisons":[{"id":"a","candidate":"a.png","reference":"a.png"}]}))
            (assets/"manifest.json").write_text(json.dumps({"sprites":[{"file":"a.png"}]}))
            self.assertEqual(audit(assets,refs)["status"],"PIXEL_PASS_ART_REVIEW_UNKNOWN")
    def test_traversal_fails(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);assets=root/"assets";refs=root/"refs"
            assets.mkdir();refs.mkdir()
            (refs/"manifest.json").write_text(json.dumps({"comparisons":[{"id":"x","candidate":"../escape.png","reference":"a.png"}]}))
            (assets/"manifest.json").write_text(json.dumps({"sprites":[{"file":"a.png"}]}))
            self.assertEqual(audit(assets,refs)["status"],"FAIL")
    def test_duplicate_ids_fail(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);assets=root/"assets";refs=root/"refs"
            assets.mkdir();refs.mkdir()
            Image.new("RGBA",(2,2)).save(assets/"a.png")
            Image.new("RGBA",(2,2)).save(refs/"a.png")
            item={"id":"same","candidate":"a.png","reference":"a.png"}
            (assets/"manifest.json").write_text(json.dumps({"sprites":[{"file":"a.png"}]}))
            (refs/"manifest.json").write_text(json.dumps({"comparisons":[item,item]}))
            self.assertEqual(audit(assets,refs)["status"],"FAIL")
    def test_missing_reference_fails(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);assets=root/"assets";refs=root/"refs"
            assets.mkdir();refs.mkdir()
            (refs/"manifest.json").write_text(json.dumps({"comparisons":[{"id":"missing","candidate":"x.png","reference":"x.png"}]}))
            (assets/"manifest.json").write_text(json.dumps({"sprites":[{"file":"a.png"}]}))
            self.assertEqual(audit(assets,refs)["status"],"FAIL")
    def test_missing_asset_coverage_fails(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);assets=root/"assets";refs=root/"refs"
            assets.mkdir();refs.mkdir()
            for name in ("a.png","b.png"):
                Image.new("RGBA",(2,2)).save(assets/name)
            Image.new("RGBA",(2,2)).save(refs/"a.png")
            (assets/"manifest.json").write_text(json.dumps({"sprites":[{"file":"a.png"},{"file":"b.png"}]}))
            (refs/"manifest.json").write_text(json.dumps({"comparisons":[{"id":"a","candidate":"a.png","reference":"a.png"}]}))
            report=audit(assets,refs)
            self.assertEqual(report["status"],"FAIL")
            self.assertEqual(report["results"][-1]["missing_count"],1)
    def test_duplicate_candidate_fails(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);assets=root/"assets";refs=root/"refs"
            assets.mkdir();refs.mkdir()
            Image.new("RGBA",(2,2)).save(assets/"a.png")
            Image.new("RGBA",(2,2)).save(refs/"a.png")
            (refs/"manifest.json").write_text(json.dumps({"comparisons":[{"id":"a","candidate":"a.png","reference":"a.png"},{"id":"b","candidate":"a.png","reference":"a.png"}]}))
            (assets/"manifest.json").write_text(json.dumps({"sprites":[{"file":"a.png"}]}))
            self.assertEqual(audit(assets,refs)["status"],"FAIL")
    def test_undeclared_candidate_fails(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);assets=root/"assets";refs=root/"refs"
            assets.mkdir();refs.mkdir()
            for name in ("a.png","b.png"):
                Image.new("RGBA",(2,2)).save(assets/name)
                Image.new("RGBA",(2,2)).save(refs/name)
            (assets/"manifest.json").write_text(json.dumps({"sprites":[{"file":"a.png"}]}))
            (refs/"manifest.json").write_text(json.dumps({"comparisons":[{"id":"a","candidate":"a.png","reference":"a.png"},{"id":"b","candidate":"b.png","reference":"b.png"}]}))
            self.assertEqual(audit(assets,refs)["status"],"FAIL")
    def test_empty_asset_manifest_fails(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);assets=root/"assets";refs=root/"refs"
            assets.mkdir();refs.mkdir()
            (assets/"manifest.json").write_text(json.dumps({"sprites":[]}))
            (refs/"manifest.json").write_text(json.dumps({"comparisons":[{"id":"a","candidate":"a.png","reference":"a.png"}]}))
            self.assertEqual(audit(assets,refs)["reason"],"invalid_asset_manifest")
    def test_coverage_ratio_reported(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);assets=root/"assets";refs=root/"refs"
            assets.mkdir();refs.mkdir()
            for name in ("a.png","b.png"):
                Image.new("RGBA",(2,2)).save(assets/name)
            Image.new("RGBA",(2,2)).save(refs/"a.png")
            (assets/"manifest.json").write_text(json.dumps({"sprites":[{"file":"a.png"},{"file":"b.png"}]}))
            (refs/"manifest.json").write_text(json.dumps({"comparisons":[{"id":"a","candidate":"a.png","reference":"a.png"}]}))
            report=audit(assets,refs)
            self.assertEqual(report["coverage"]["ratio"],0.5)
            self.assertFalse(report["coverage"]["complete"])
    def test_missing_asset_manifest_unknown(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);assets=root/"assets";refs=root/"refs"
            assets.mkdir();refs.mkdir()
            Image.new("RGBA",(2,2)).save(assets/"a.png")
            Image.new("RGBA",(2,2)).save(refs/"a.png")
            (refs/"manifest.json").write_text(json.dumps({"comparisons":[{"id":"a","candidate":"a.png","reference":"a.png"}]}))
            report=audit(assets,refs)
            self.assertEqual(report["status"],"UNKNOWN")
            self.assertEqual(report["reason"],"asset_manifest_missing")
if __name__=="__main__":unittest.main()

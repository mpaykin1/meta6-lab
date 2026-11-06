import json, tempfile, unittest
from pathlib import Path
from PIL import Image
from review_sheet import render
class ReviewSheetTests(unittest.TestCase):
    def test_sheet(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            Image.new("RGBA",(8,8),(229,120,7,255)).save(root/"fish.png")
            manifest=root/"manifest.json"
            manifest.write_text(json.dumps({"sprites":[{"id":"fish","file":"fish.png"}]}))
            report=render(root,manifest,root/"sheet.png")
            self.assertEqual(report["status"],"VISUAL_REVIEW_REQUIRED")
            with Image.open(root/"sheet.png") as im:
                self.assertEqual(im.size,(768,96))
    def test_unsafe_path(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            manifest=root/"manifest.json"
            manifest.write_text(json.dumps({"sprites":[{"id":"fish","file":"../fish.png"}]}))
            with self.assertRaises(ValueError):render(root,manifest,root/"sheet.png")
    def test_large_sprite_scaled_only_for_review(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            Image.new("RGBA",(192,192),(249,189,43,255)).save(root/"large.png")
            original=(root/"large.png").read_bytes()
            manifest=root/"manifest.json"
            manifest.write_text(json.dumps({"sprites":[{"id":"large","file":"large.png"}]}))
            report=render(root,manifest,root/"sheet.png")
            self.assertEqual(report["status"],"VISUAL_REVIEW_REQUIRED")
            self.assertEqual(original,(root/"large.png").read_bytes())
            with Image.open(root/"sheet.png") as im:
                self.assertEqual(im.size,(768,96))
if __name__=="__main__":unittest.main()

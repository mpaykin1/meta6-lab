import tempfile, unittest
from pathlib import Path
from PIL import Image
from compare_reference import compare

class CompareReferenceTests(unittest.TestCase):
    def test_identical(self):
        with tempfile.TemporaryDirectory() as tmp:
            p=Path(tmp)
            Image.new("RGBA",(2,2),(0,0,0,255)).save(p/"a.png")
            self.assertEqual(compare(p/"a.png",p/"a.png")["status"],"PIXEL_PASS_ART_REVIEW_UNKNOWN")
    def test_one_pixel_changed(self):
        with tempfile.TemporaryDirectory() as tmp:
            p=Path(tmp)
            Image.new("RGBA",(2,2),(0,0,0,255)).save(p/"a.png")
            im=Image.new("RGBA",(2,2),(0,0,0,255))
            im.putpixel((0,0),(255,0,0,255))
            im.save(p/"b.png")
            self.assertEqual(compare(p/"a.png",p/"b.png")["mismatch_ratio"],0.25)
            self.assertEqual(compare(p/"a.png",p/"b.png")["status"],"FAIL")
            self.assertEqual(compare(p/"a.png",p/"b.png",0.25)["status"],"PIXEL_PASS_ART_REVIEW_UNKNOWN")
    def test_size_mismatch(self):
        with tempfile.TemporaryDirectory() as tmp:
            p=Path(tmp)
            Image.new("RGBA",(2,2)).save(p/"a.png")
            Image.new("RGBA",(3,2)).save(p/"b.png")
            self.assertEqual(compare(p/"a.png",p/"b.png")["reason"],"size_mismatch")
    def test_bad_threshold(self):
        with self.assertRaises(ValueError):compare("x","y",1.1)

if __name__=="__main__":unittest.main()

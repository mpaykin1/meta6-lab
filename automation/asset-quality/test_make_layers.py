import json,tempfile,unittest
from pathlib import Path
from PIL import Image
from make_layers import convert
class LayerTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name)
        self.manifest=self.root/"manifest.json"
        self.manifest.write_text(json.dumps({"sprites":[{"id":"fish","file":"fish.png"}]}))
    def tearDown(self):self.tmp.cleanup()
    def test_preserve_palette(self):
        im=Image.new("RGBA",(4,4),(0,0,0,255));im.putpixel((1,1),(229,120,7,255));im.save(self.root/"fish.png")
        result=convert(self.root,self.manifest,self.root/"out")
        self.assertEqual(result["processed"],1)
        self.assertEqual(result["status"],"NEEDS_REVIEW")
        self.assertIn("normal maps",result["unknown"])
        glow=Image.open(self.root/"out"/result["assets"][0]["layers"]["emissive"])
        self.assertEqual(glow.getpixel((1,1)),(229,120,7,255))
        self.assertEqual(glow.getpixel((0,0))[3],0)
    def test_off_palette_needs_review(self):
        Image.new("RGBA",(4,4),(1,2,3,255)).save(self.root/"fish.png")
        r=convert(self.root,self.manifest,self.root/"out")
        self.assertEqual(r["processed"],0)
        self.assertEqual(r["issues"][0]["rule"],"off_palette")
    def test_quantize_opt_in(self):
        Image.new("RGBA",(4,4),(1,2,3,255)).save(self.root/"fish.png")
        r=convert(self.root,self.manifest,self.root/"out",True)
        self.assertTrue(r["assets"][0]["quantized"])
if __name__=="__main__":unittest.main()

import json, tempfile, unittest
from pathlib import Path
from PIL import Image
from validate import inspect, PALETTE

class QualityTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.root=Path(self.tmp.name)
        im=Image.new("RGBA",(12,12),(0,0,0,0))
        for y in range(2,10):
            for x in range(2,10): im.putpixel((x,y),(0,0,0,255))
        im.save(self.root/"sprite.png")
        for name in ("body","detail","normal","emissive"): im.save(self.root/(name+".png"))
        self.entry={"id":"fish_s0_idle_0","file":"sprite.png","kind":"creature","type":"fish","stage":0,"anim":"idle","frame":0,"frames":1,"fps":8,"sizeArt":[12,12],"pivot":[6,6],"hitbox":{"circle":[6,6,4]},"atlas":"fish","rect":[0,0,12,12],"source":"test","layers":{k:k+".png" for k in ("body","detail","normal","emissive")}}
    def tearDown(self): self.tmp.cleanup()
    def check(self, entry):
        path=self.root/"manifest.json"
        path.write_text(json.dumps({"sprites":[entry]}))
        return inspect(self.root,path)
    def test_valid(self): self.assertEqual(self.check(self.entry)["status"],"STATIC_PASS_RUNTIME_UNKNOWN")
    def test_palette(self):
        im=Image.open(self.root/"sprite.png");im.putpixel((5,5),(12,34,56,255));im.save(self.root/"sprite.png")
        self.assertIn("seven_color_palette",[x["rule"] for x in self.check(self.entry)["issues"]])
    def test_transparency(self):
        im=Image.open(self.root/"sprite.png")
        for y in range(2,10):
            for x in range(2,10):im.putpixel((x,y),(0,0,0,120))
        im.save(self.root/"sprite.png")
        self.assertIn("opaque_body_95pct",[x["rule"] for x in self.check(self.entry)["issues"]])
    def test_missing_layer(self):
        self.entry["layers"].pop("normal")
        self.assertIn("layer_normal",[x["rule"] for x in self.check(self.entry)["issues"]])
    def test_path_traversal(self):
        self.entry["file"]="../secret.png"
        self.assertIn("file_path",[x["rule"] for x in self.check(self.entry)["issues"]])
    def test_invalid_frames(self):
        self.entry["frames"]="bad"
        self.assertIn("frames",[x["rule"] for x in self.check(self.entry)["issues"]])
    def test_padding(self):
        im=Image.open(self.root/"sprite.png");im.putpixel((0,0),(0,0,0,255));im.save(self.root/"sprite.png")
        self.assertIn("padding_2px",[x["rule"] for x in self.check(self.entry)["issues"]])
    def test_boolean_stage_rejected(self):
        self.entry["stage"]=True
        self.assertIn("stage_0_4",[x["rule"] for x in self.check(self.entry)["issues"]])
    def test_boolean_frames_rejected(self):
        self.entry["frames"]=True
        self.assertIn("frames",[x["rule"] for x in self.check(self.entry)["issues"]])
    def test_empty_sprite_path_rejected(self):
        self.entry["file"]=""
        self.assertIn("file_path",[x["rule"] for x in self.check(self.entry)["issues"]])
if __name__=="__main__":unittest.main()

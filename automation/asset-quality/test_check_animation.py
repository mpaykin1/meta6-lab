import json,tempfile,unittest
from pathlib import Path
from check_animation import analyze
class AnimationTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.path=Path(self.tmp.name)/"manifest.json"
        self.entries=[{"id":f"fish-{d}-{f}","type":"fish","stage":0,"anim":"swim","direction":d,"frame":f,"pivot":[4,4]} for d in range(8) for f in range(8)]
    def tearDown(self):self.tmp.cleanup()
    def check(self,entries):
        self.path.write_text(json.dumps({"sprites":entries}));return analyze(self.path)
    def test_complete(self):self.assertEqual(self.check(self.entries)["status"],"STATIC_PASS_RUNTIME_UNKNOWN")
    def test_missing_frame(self):self.assertIn("frame_sequence",[x["rule"] for x in self.check(self.entries[:-1])["issues"]])
    def test_pivot_drift(self):
        self.entries[2]["pivot"]=[9,9]
        self.assertIn("pivot_drift",[x["rule"] for x in self.check(self.entries)["issues"]])
    def test_missing_direction(self):self.assertIn("missing_directions",[x["rule"] for x in self.check(self.entries[:56])["issues"]])
if __name__=="__main__":unittest.main()

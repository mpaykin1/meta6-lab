import json, tempfile, unittest
from pathlib import Path
from audit_pack import analyze
class AuditPackTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name)
        (self.root/"sprite.png").write_bytes(b"sprite")
        (self.root/"original.png").write_bytes(b"original")
        self.entry={"id":"fish0","file":"sprite.png","source":"original.png","type":"fish","stage":0,"anim":"idle","frame":0,"frames":8,"fps":8,"pivot":[0,0],"hitbox":[0,0,1,1],"atlas":"a","rect":[0,0,2,2],"layers":{}}
        self.manifest=self.root/"manifest.json"
    def tearDown(self):self.tmp.cleanup()
    def check(self,entries,requirements=None):
        self.manifest.write_text(json.dumps({"sprites":entries}))
        return analyze(self.root,self.manifest,requirements)
    def test_valid_and_provenance(self):
        r=self.check([self.entry])
        self.assertEqual(r["status"],"STATIC_PASS_RUNTIME_UNKNOWN")
        self.assertEqual(len(r["provenance"][0]["sha256"]),64)
    def test_duplicate(self):
        self.assertIn("sprite_id",[x["rule"] for x in self.check([self.entry,self.entry])["issues"]])
    def test_escape(self):
        self.entry["source"]="../private"
        self.assertIn("path_escape",[x["rule"] for x in self.check([self.entry])["issues"]])
    def test_missing_stages(self):
        req=self.root/"req.json";req.write_text(json.dumps({"stages":[0,1,2,3,4],"min_creature_types":1}))
        self.assertIn("missing_stages",[x["rule"] for x in self.check([self.entry],req)["issues"]])
    def test_frame_bounds(self):
        self.entry["frame"]=9
        self.assertIn("frame_bounds",[x["rule"] for x in self.check([self.entry])["issues"]])
    def test_unverified_not_pass(self):
        req=self.root/"req.json";req.write_text(json.dumps({"requirements":[{"id":"A","test":"visual","status":"UNKNOWN"}]}))
        r=self.check([self.entry],req)
        self.assertEqual(r["status"],"STATIC_PASS_RUNTIME_UNKNOWN")
        self.assertTrue(r["unknown"])
if __name__=="__main__":unittest.main()

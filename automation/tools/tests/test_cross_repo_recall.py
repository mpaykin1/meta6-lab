import importlib.util
import pathlib
import tempfile
import unittest

PATH = pathlib.Path(__file__).resolve().parents[1] / "cross_repo_recall.py"
spec = importlib.util.spec_from_file_location("cross_repo_recall", PATH)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class RecallTests(unittest.TestCase):
    def test_recall_and_dedup(self):
        event = dict(id="a", signature="fx/bloom", project="shared", kind="failure",
                     status="technical", source_sha="a"*40, evidence="https://github.com/x/y",
                     observation="Bloom whiteout", action="reduce intensity")
        result = mod.build([event, event], {"repositories": {}})
        self.assertEqual(len(result["entries"]), 1)
        self.assertEqual(len(result["entries"][0]["evidence"]), 1)
        self.assertEqual(mod.recall(result, "bloom whiteout", 3)[0]["signature"], "fx/bloom")
        self.assertEqual(mod.recall(result, "nonexistenttoken", 3), [])
    def test_conflict_visible(self):
        a = dict(id="a", signature="camera/lag", project="shared", kind="solution",
                 status="technical", source_sha="a"*40, evidence="https://github.com/x/y",
                 observation="Camera", action="use lerp")
        b = dict(a, id="b", action="do not use lerp")
        self.assertTrue(mod.build([a,b], {})["entries"][0]["conflict"])
    def test_atomic_write_uses_replace(self):
        import inspect
        source=inspect.getsource(mod.main)
        self.assertIn("os.replace(temp_name, args.output)",source)
        self.assertIn("os.fsync(out.fileno())",source)
if __name__ == "__main__":
    unittest.main()

import importlib.util
import pathlib
import unittest

PATH=pathlib.Path(__file__).resolve().parents[1]/"cross_repo_checkpoint.py"
spec=importlib.util.spec_from_file_location("cross_repo_checkpoint",PATH)
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class CheckpointTests(unittest.TestCase):
    def test_changed_head_blocks(self):
        result=mod.verify("mpaykin1/meta6","a"*40,lambda url:{"commit":{"sha":"b"*40}})
        self.assertEqual(result["status"],"STALE_REBASE_REQUIRED")
        self.assertFalse(result["checkpoint_written"])
    def test_unchanged_head(self):
        result=mod.verify("mpaykin1/meta6","a"*40,lambda url:{"commit":{"sha":"a"*40}})
        self.assertEqual(result["status"],"UNCHANGED")
    def test_reject_invalid_sha(self):
        with self.assertRaises(ValueError):
            mod.main_sha("mpaykin1/meta6",lambda url:{"commit":{"sha":"bad"}})
if __name__=="__main__":
    unittest.main()

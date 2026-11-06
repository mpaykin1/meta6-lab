import importlib.util
import pathlib
import tempfile
import unittest

PATH = pathlib.Path(__file__).resolve().parents[1]/"cross_repo_lease.py"
spec = importlib.util.spec_from_file_location("cross_repo_lease", PATH)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class LeaseTests(unittest.TestCase):
    def test_exclusive_and_cleanup(self):
        with tempfile.TemporaryDirectory() as tmp:
            lock=pathlib.Path(tmp)/"lock"
            with mod.lease(lock):
                with self.assertRaises(RuntimeError):
                    with mod.lease(lock):
                        pass
                self.assertTrue(lock.exists())
            self.assertFalse(lock.exists())
    def test_does_not_delete_foreign_lock(self):
        with tempfile.TemporaryDirectory() as tmp:
            lock=pathlib.Path(tmp)/"lock"
            with mod.lease(lock):
                lock.write_text('{"token":"someone-else"}',encoding="utf-8")
            self.assertTrue(lock.exists())
if __name__=="__main__":
    unittest.main()

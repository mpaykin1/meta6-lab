import importlib.util
import pathlib
import unittest
from unittest.mock import patch

PATH = pathlib.Path(__file__).resolve().parents[1] / "cross_repo_inventory.py"
spec = importlib.util.spec_from_file_location("cross_repo_inventory", PATH)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class InventoryTests(unittest.TestCase):
    def test_resumable_branches(self):
        repos = [{"full_name": "mpaykin1/meta6", "default_branch": "main"}]
        branches = [{"name": "b%03d" % i, "commit": {"sha": ("%040x" % i)}} for i in range(180)]
        def fake_pages(path, max_pages):
            return iter(repos if "/users/" in path else branches)
        with patch.object(mod, "pages", side_effect=fake_pages):
            first = mod.scan("mpaykin1", 1, 75, {})
            self.assertEqual(first["repositories"]["mpaykin1/meta6"]["next_branch"], 75)
            second = mod.scan("mpaykin1", 1, 75, first)
            self.assertEqual(second["repositories"]["mpaykin1/meta6"]["next_branch"], 150)
            third = mod.scan("mpaykin1", 1, 75, second)
        self.assertEqual(len(third["repositories"]["mpaykin1/meta6"]["branches"]), 180)
        self.assertEqual(third["repositories"]["mpaykin1/meta6"]["next_branch"], 0)
        self.assertEqual(third["coverage"], "PARTIAL")
    def test_sha_update_does_not_forge_indexed_sha(self):
        repos = [{"full_name": "mpaykin1/meta6", "default_branch": "main"}]
        branches = [{"name": "main", "commit": {"sha": "b"*40}}]
        prev = {"repositories": {"mpaykin1/meta6": {"branches": {
            "main": {"head_sha": "a"*40, "indexed_sha": "a"*40}}, "next_branch": 0}}}
        with patch.object(mod, "pages", side_effect=lambda path, _: iter(repos if "/users/" in path else branches)):
            result = mod.scan("mpaykin1", 1, 10, prev)
        self.assertEqual(result["repositories"]["mpaykin1/meta6"]["branches"]["main"]["head_sha"], "b"*40)
        self.assertIsNone(result["repositories"]["mpaykin1/meta6"]["branches"]["main"]["indexed_sha"])
    def test_unchanged_sha_keeps_review_checkpoint(self):
        repos = [{"full_name": "mpaykin1/meta6", "default_branch": "main"}]
        branches = [{"name": "main", "commit": {"sha": "a"*40}}]
        prev = {"repositories": {"mpaykin1/meta6": {"branches": {
            "main": {"head_sha": "a"*40, "indexed_sha": "a"*40}}, "next_branch": 0}}}
        with patch.object(mod, "pages", side_effect=lambda path, _: iter(repos if "/users/" in path else branches)):
            result = mod.scan("mpaykin1", 1, 10, prev)
        self.assertEqual(result["repositories"]["mpaykin1/meta6"]["branches"]["main"]["indexed_sha"], "a"*40)
if __name__ == "__main__":
    unittest.main()

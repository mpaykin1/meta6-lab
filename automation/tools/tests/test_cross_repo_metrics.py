import importlib.util
import pathlib
import unittest

PATH = pathlib.Path(__file__).resolve().parents[1]/"cross_repo_metrics.py"
spec = importlib.util.spec_from_file_location("cross_repo_metrics", PATH)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class MetricsTests(unittest.TestCase):
    def test_partial_is_not_verified(self):
        inventory = {"repository_count": 3, "repositories": {"mpaykin1/meta6": {
            "branch_count": 4, "branches": {"main": {"head_sha": "a"*40, "indexed_sha": None},
                                          "dev": {"head_sha": "b"*40, "indexed_sha": "b"*40}}}}}
        result = mod.compute(inventory, {"mpaykin1/meta6": {"candidates": {"1": {}}}},
                             [{"signature": "camera"}, {"signature": "camera"}])
        self.assertEqual(result["branches_discovered"], 2)
        self.assertEqual(result["branches_verified_at_current_sha"], 1)
        self.assertEqual(result["branches_not_verified_at_current_sha"], 1)
        self.assertEqual(result["stale_indexed_sha_markers"], 0)
        self.assertEqual(result["branches_discovery_ratio_in_seen_repositories"], 0.5)
        self.assertEqual(result["merged_pr_candidates_unverified"], 1)
        self.assertIsNone(result["prevented_regressions_measured"])
        self.assertFalse(result["all_repositories_scanned"])
    def test_stale_marker_is_not_counted_as_verified(self):
        inventory={"repositories":{"mpaykin1/meta6":{"branch_count":1,"branches":{
            "main":{"head_sha":"b"*40,"indexed_sha":"a"*40}}}}}
        result=mod.compute(inventory,{},[])
        self.assertEqual(result["branches_verified_at_current_sha"],0)
        self.assertEqual(result["branches_not_verified_at_current_sha"],1)
        self.assertEqual(result["stale_indexed_sha_markers"],1)
if __name__ == "__main__":
    unittest.main()

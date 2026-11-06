import importlib.util
import pathlib
import unittest

PATH = pathlib.Path(__file__).resolve().parents[1] / "cross_repo_pr_evidence.py"
spec = importlib.util.spec_from_file_location("cross_repo_pr_evidence", PATH)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class EvidenceTests(unittest.TestCase):
    def test_merged_only_and_cursor(self):
        def pr(number, merged):
            return {"number": number, "merged_at": "2026-10-21T00:00:00Z" if merged else None,
                    "merge_commit_sha": "a"*40, "title": "Test",
                    "html_url": "https://github.com/mpaykin1/meta6/pull/"+str(number),
                    "base": {"ref": "main"}, "head": {"ref": "work"}}
        requests = []
        def fake(path):
            requests.append(path)
            return [pr(1, True), pr(2, False)] if "page=1" in path else []
        first = mod.collect("mpaykin1/meta6", {}, 2, fake)
        self.assertEqual(first["mpaykin1/meta6"]["cursor"], 2)
        self.assertEqual(list(first["mpaykin1/meta6"]["candidates"]), ["1"])
        self.assertEqual(first["mpaykin1/meta6"]["candidates"]["1"]["status"], "CANDIDATE_UNVERIFIED")
        second = mod.collect("mpaykin1/meta6", first, 2, fake)
        self.assertEqual(second["mpaykin1/meta6"]["cursor"], 1)
        self.assertIn("page=2", requests[-1])
    def test_reject_bad_limit(self):
        with self.assertRaises(ValueError):
            mod.collect("mpaykin1/meta6", {}, 0, lambda _: [])
if __name__ == "__main__":
    unittest.main()

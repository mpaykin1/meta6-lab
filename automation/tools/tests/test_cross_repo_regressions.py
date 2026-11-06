import importlib.util
import pathlib
import unittest

PATH = pathlib.Path(__file__).resolve().parents[1]/"cross_repo_regressions.py"
spec = importlib.util.spec_from_file_location("cross_repo_regressions", PATH)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class RegressionTests(unittest.TestCase):
    def test_missing_regression_is_reported(self):
        report = mod.audit([{"id":"f1","kind":"failure"}],{"links":[]})
        self.assertEqual(report["unlinked_failure_ids"],["f1"])
        self.assertIsNone(report["tested_regressions"])
    def test_untrusted_path_is_rejected(self):
        report = mod.audit([{"id":"f1","kind":"failure"}],{"links":[{"event_id":"f1","test_path":"../secret","ci_workflow":"x"}]})
        self.assertEqual(report["linked"][0]["status"],"INVALID_PATH")
if __name__=="__main__":
    unittest.main()

import importlib.util
import pathlib
import types
import unittest

PATH = pathlib.Path(__file__).resolve().parents[1]/"cross_repo_runner.py"
spec = importlib.util.spec_from_file_location("cross_repo_runner", PATH)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class RunnerTests(unittest.TestCase):
    def test_order_and_offline(self):
        commands = mod.plan(["mpaykin1/meta6"], "camera", False)
        self.assertEqual([pathlib.Path(c[1]).name for c in commands],
                         ["cross_repo_inventory.py", "cross_repo_pr_evidence.py",
                          "cross_repo_pr_files.py", "cross_repo_recall.py", "memory_preflight.py",
                          "cross_repo_components.py", "cross_repo_regressions.py", "cross_repo_metrics.py"])
        self.assertEqual(len(mod.plan([], "camera", True)), 5)

    def test_runner_uses_lease(self):
        import inspect
        source=inspect.getsource(mod.main)
        self.assertIn('with lease(ROOT / ".cross-repo-memory.lock")',source)
    def test_partial_success_is_not_pass(self):
        import inspect
        source=inspect.getsource(mod.main)
        self.assertIn('"PARTIAL_SUCCESS"',source)
        self.assertNotIn('"status": "PASS"',source)
    def test_timeout_is_reported_and_stops(self):
        import subprocess
        calls=[]
        def timeout(command, **kwargs):
            calls.append(command)
            raise subprocess.TimeoutExpired(command, 120)
        result=mod.run(mod.plan([], "camera", True), timeout)
        self.assertEqual(len(result), 1)
        self.assertEqual(len(calls), 1)
        self.assertEqual(result[0]["returncode"], 124)
        self.assertIn("timed out", result[0]["stderr"])
    def test_fail_fast(self):
        calls = []
        def fake(command, **kwargs):
            calls.append(command)
            return types.SimpleNamespace(returncode=2, stdout="", stderr="unavailable")
        result = mod.run(mod.plan([], "camera", True), fake)
        self.assertEqual(len(result), 1)
        self.assertEqual(len(calls), 1)
        self.assertEqual(result[0]["returncode"], 2)
if __name__ == "__main__":
    unittest.main()

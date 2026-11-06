import importlib.util
import json
import pathlib
import sys
import tempfile
import unittest

TOOLS = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(TOOLS))
import memory_preflight

class PreflightTests(unittest.TestCase):
    def test_missing_index_blocks(self):
        with tempfile.TemporaryDirectory() as d:
            code, data = memory_preflight.run("bloom", index=pathlib.Path(d)/"missing.json")
        self.assertEqual(code, 2)
        self.assertEqual(data["status"], "BLOCKED")
    def test_recall_with_partial_coverage(self):
        with tempfile.TemporaryDirectory() as d:
            path = pathlib.Path(d)/"index.json"
            path.write_text(json.dumps({"schema_version": 1, "coverage": "PARTIAL",
                "entries": [{"signature": "fx/bloom", "tokens": ["bloom"], "evidence": [], "conflict": False}]}))
            code, data = memory_preflight.run("bloom", index=path)
            self.assertEqual(code, 0)
            self.assertEqual(data["coverage"], "PARTIAL")
            self.assertEqual(data["matches"][0]["signature"], "fx/bloom")
            code, data = memory_preflight.run("missing", require_match=True, index=path)
            self.assertEqual(code, 1)
            self.assertEqual(data["status"], "REVIEW_REQUIRED")
if __name__ == "__main__":
    unittest.main()

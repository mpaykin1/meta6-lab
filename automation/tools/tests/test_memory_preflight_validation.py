import importlib.util
import json
import pathlib
import tempfile
import unittest

PATH=pathlib.Path(__file__).resolve().parents[1]/"memory_preflight.py"
spec=importlib.util.spec_from_file_location("memory_preflight_validation",PATH)
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class ValidationTests(unittest.TestCase):
    def test_missing_entries_blocked(self):
        with tempfile.TemporaryDirectory() as d:
            path=pathlib.Path(d)/"index.json"
            path.write_text(json.dumps({"schema_version":1,"coverage":"PARTIAL"}))
            code,result=mod.run("camera",index=path)
            self.assertEqual(code,2)
            self.assertEqual(result["status"],"BLOCKED")
    def test_malformed_entry_blocked(self):
        with tempfile.TemporaryDirectory() as d:
            path=pathlib.Path(d)/"index.json"
            path.write_text(json.dumps({"schema_version":1,"coverage":"PARTIAL","entries":[{"signature":"camera"}]}))
            code,result=mod.run("camera",index=path)
            self.assertEqual(code,2)
            self.assertEqual(result["status"],"BLOCKED")
if __name__=="__main__":
    unittest.main()

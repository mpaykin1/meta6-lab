import importlib.util
import pathlib
import unittest

PATH = pathlib.Path(__file__).resolve().parents[1]/"cross_repo_components.py"
spec = importlib.util.spec_from_file_location("cross_repo_components", PATH)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class CatalogTests(unittest.TestCase):
    def test_valid_empty_catalog(self):
        self.assertEqual(mod.validate({"schema_version":1,"components":[]}),[])
    def test_owner_approval_cannot_be_forged(self):
        item={"id":"shader","category":"GLSL","repository":"mpaykin1/meta6",
              "source_sha":"a"*40,"license":"MIT","status":"OWNER_APPROVED",
              "evidence":"https://github.com/x/y","test":"ci-test"}
        self.assertTrue(any("owner approval" in e for e in mod.validate({"schema_version":1,"components":[item]})))
        item["owner_approval"]="https://github.com/x/y/issues/1"
        self.assertEqual(mod.validate({"schema_version":1,"components":[item]}),[])
    def test_reject_duplicate_and_unknown_license(self):
        item={"id":"camera","category":"animation","repository":"mpaykin1/meta6",
              "source_sha":"a"*40,"license":"","status":"DISCOVERED",
              "evidence":"https://github.com/x/y","test":"UNKNOWN"}
        errors=mod.validate({"schema_version":1,"components":[item,item]})
        self.assertTrue(any("duplicate" in e for e in errors))
        self.assertTrue(any("license" in e for e in errors))
if __name__=="__main__":
    unittest.main()

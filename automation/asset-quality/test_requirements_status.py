import unittest
from requirements_status import summarize

class RequirementsStatusTests(unittest.TestCase):
    def test_unknown_not_counted_as_pass(self):
        result=summarize({"requirements":[{"id":"A","status":"UNKNOWN"},{"id":"B","status":"PASS"}]})
        self.assertEqual(result["status"],"UNKNOWN")
        self.assertEqual(result["verified_pass_ratio"],0.5)
    def test_fail_dominates_unknown(self):
        result=summarize({"requirements":[{"id":"A","status":"FAIL"},{"id":"B","status":"UNKNOWN"}]})
        self.assertEqual(result["status"],"FAIL")
    def test_all_pass(self):
        result=summarize({"requirements":[{"id":"A","status":"PASS"}]})
        self.assertEqual(result["status"],"PASS")
    def test_duplicate_ids_rejected(self):
        with self.assertRaises(ValueError):
            summarize({"requirements":[{"id":"A","status":"PASS"},{"id":"A","status":"PASS"}]})
    def test_empty_requirements_rejected(self):
        with self.assertRaises(ValueError):
            summarize({"requirements":[]})

if __name__=="__main__":
    unittest.main()

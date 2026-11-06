import importlib.util
import pathlib
import unittest

PATH = pathlib.Path(__file__).resolve().parents[1]/"cross_repo_pr_files.py"
spec = importlib.util.spec_from_file_location("cross_repo_pr_files", PATH)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class PRFilesTests(unittest.TestCase):
    def test_file_metadata_and_unverified(self):
        state={"mpaykin1/meta6":{"cursor":1,"candidates":{"10":{"pr":10,"status":"CANDIDATE_UNVERIFIED"}}}}
        calls=[]
        def fake(url):
            calls.append(url)
            return [{"filename":"game.js","status":"modified","additions":2,"deletions":1,"sha":"a"*40}]
        result=mod.enrich("mpaykin1/meta6",state,request=fake)
        item=result["mpaykin1/meta6"]["candidates"]["10"]
        self.assertEqual(item["changed_files"][0]["path"],"game.js")
        self.assertEqual(item["status"],"CANDIDATE_UNVERIFIED")
        self.assertTrue(item["files_inspected"])
        self.assertEqual(len(calls),1)
    def test_truncated_file_evidence_fails_closed(self):
        state={"mpaykin1/meta6":{"cursor":1,"candidates":{"10":{"pr":10,"status":"CANDIDATE_UNVERIFIED"}}}}
        def fake(url):
            return [{"filename":"file"+str(i),"status":"modified","additions":1,
                     "deletions":0,"sha":"a"*40} for i in range(100)]
        with self.assertRaisesRegex(ValueError, "incomplete evidence"):
            mod.enrich("mpaykin1/meta6",state,request=fake)
        self.assertNotIn("files_inspected",state["mpaykin1/meta6"]["candidates"]["10"])
    def test_bad_limit(self):
        with self.assertRaises(ValueError):
            mod.enrich("mpaykin1/meta6",{},0)
if __name__=="__main__":
    unittest.main()

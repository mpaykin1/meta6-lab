"""Synthetic fixtures only: no artistic approvals or game assets are created here."""
import contextlib,io,json,subprocess,sys,tempfile,unittest
from pathlib import Path
from PIL import Image
import game_readiness as gate
import directional_pack as pack

SCRIPTS=Path(__file__).parent
class PipelineTests(unittest.TestCase):
    def test_missing_matrix_is_blocked(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);(root/'atlas.json').write_text('{"anims":{}}')
            r=gate.audit({'directions':4,'atlas':'atlas.json'},root)
            self.assertEqual(r['status'],'BLOCKED');self.assertEqual(len(r['missingClips']),44)
            self.assertEqual(r['checks']['offline'],'UNVERIFIED')
    def test_fingerprints_never_approve(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            for action in pack.ACTIONS:
                for direction in pack.DIR4:
                    p=root/(action+'_'+direction);p.mkdir();Image.new('RGBA',(8,8),(10,20,30,255)).save(p/'000.png')
            result=subprocess.run([sys.executable,str(SCRIPTS/'directional_pack.py'),str(root),str(root/'out'),'--id','TEST_ONLY','--directions','4','--fingerprints'],capture_output=True,text=True)
            self.assertEqual(result.returncode,0,result.stderr);data=json.loads(result.stdout)
            self.assertFalse(data['approved']);self.assertEqual(len(data['actions']),44);self.assertFalse((root/'out').exists())
            blocked=subprocess.run([sys.executable,str(SCRIPTS/'directional_pack.py'),str(root),str(root/'out'),'--id','TEST_ONLY','--directions','4'],capture_output=True,text=True)
            self.assertNotEqual(blocked.returncode,0);self.assertIn('approval',blocked.stderr);self.assertFalse((root/'out').exists())
    def test_diagonal_loop_and_event_windows(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);src=root/'src';dst=root/'dst';src.mkdir()
            for action in ('walk_front_right','run_back_left','attack_front_right','death_front_left'):
                p=src/action;p.mkdir()
                for i in range(3):Image.new('RGBA',(8,8),(10+i,20,30,255)).save(p/f'{i:03}.png')
            events=root/'events.json';events.write_text(json.dumps({'attack':{'hitStart':.05,'hitEnd':.2,'release':.1}}))
            result=subprocess.run([sys.executable,str(SCRIPTS/'images2atlas.py'),str(src),str(dst),'--id','TEST_ONLY','--events',str(events)],capture_output=True,text=True)
            self.assertEqual(result.returncode,0,result.stderr);anims=json.loads((dst/'TEST_ONLY.json').read_text())['anims']
            self.assertTrue(anims['walk_front_right']['loop']);self.assertTrue(anims['run_back_left']['loop'])
            self.assertFalse(anims['attack_front_right']['loop']);self.assertTrue(anims['death_front_left']['hold'])
            self.assertEqual(anims['attack_front_right']['hitStart'],.05)
            self.assertEqual(anims['attack_front_right']['hitEnd'],.2)
    def test_evidence_must_exist_and_match(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);self.assertFalse(gate.evidence_ok({'evidence':'missing','sha256':'0'*64},root))
            (root/'e').write_text('actual');self.assertFalse(gate.evidence_ok({'evidence':'e','sha256':'0'*64},root))

if __name__=='__main__':unittest.main(verbosity=2)

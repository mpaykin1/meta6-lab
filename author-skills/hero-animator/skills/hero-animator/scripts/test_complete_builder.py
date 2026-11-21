"""Run with a real packed art JSON as argument; validates bounds/embedding/canonical provenance only."""
import copy,json,sys,unittest
from pathlib import Path
from complete_ash_game import validate_pack
PACK=None
HASH=None
class BuilderTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if PACK is None:raise unittest.SkipTest('Run test_complete_builder.py with the actual art-pack JSON path')
    def test_actual_44_clip_pack(self):
        r=validate_pack(PACK,HASH);self.assertEqual(r['clips'],44);self.assertFalse(r['humanReviewedEachFrame'])
    def test_missing_back_attack_rejected(self):
        p=copy.deepcopy(PACK);del p['anims']['attack_back']
        with self.assertRaises(ValueError):validate_pack(p,HASH)
    def test_external_sheet_rejected(self):
        p=copy.deepcopy(PACK);p['sheets']['front']['url']='https://example.invalid/hero.webp'
        with self.assertRaises(ValueError):validate_pack(p,HASH)
    def test_wrong_canonical_rejected(self):
        with self.assertRaises(ValueError):validate_pack(PACK,'0'*64)
    def test_out_of_bounds_rejected(self):
        p=copy.deepcopy(PACK);p['anims']['walk_back']['frames'][0]=[2047,0,256,256]
        with self.assertRaises(ValueError):validate_pack(p,HASH)
if __name__=='__main__':
    PACK=json.loads(Path(sys.argv.pop(1)).read_text(encoding='utf8'));HASH=PACK['provenance']['canonical_sha256'];unittest.main(verbosity=2)

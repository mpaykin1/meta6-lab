"""CLI orchestration tests, no browser/game runtime claims. Temporary template is a fixture."""
import json,sys,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
import create_game
class PreflightTests(unittest.TestCase):
    def run_bad(self,kind):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);template=root/'template';template.mkdir();(template/'sentinel.txt').write_text('fixture template')
            out=root/'game';bad=root/('missing.bbmodel' if kind=='--bbmodel' else 'missing.vrm')
            with patch.object(create_game,'TEMPLATE',template),patch.object(sys,'argv',['create_game.py','--out',str(out),kind,str(bad)]):
                with self.assertRaisesRegex(SystemExit,kind):create_game.main()
            self.assertFalse(out.exists(),'invalid optional asset must be rejected before creating/copying output')
    def test_missing_bbmodel_no_partial_output(self):self.run_bad('--bbmodel')
    def test_missing_vrm_no_partial_output(self):self.run_bad('--vrm')
    def test_force_with_invalid_asset_preserves_existing_files(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);template=root/'template';template.mkdir();(template/'game.js').write_text('replacement fixture')
            out=root/'existing';out.mkdir();(out/'game.js').write_text('keep original')
            with patch.object(create_game,'TEMPLATE',template),patch.object(sys,'argv',['create_game.py','--out',str(out),'--force','--vrm',str(root/'missing.vrm')]):
                with self.assertRaisesRegex(SystemExit,'--vrm'):create_game.main()
            self.assertEqual((out/'game.js').read_text(),'keep original')
    def test_actual_bundled_bbmodel_exports_real_glb(self):
        with tempfile.TemporaryDirectory() as tmp:
            source=create_game.ROOT/'examples/blockbench/pastel-bunny.bbmodel';original=source.read_bytes();out=Path(tmp)/'bunny.glb'
            create_game.make_glb(source,out)
            data=out.read_bytes();self.assertEqual(data[:4],b'glTF');self.assertGreater(len(data),1000);self.assertEqual(source.read_bytes(),original)
if __name__=='__main__':unittest.main(verbosity=2)

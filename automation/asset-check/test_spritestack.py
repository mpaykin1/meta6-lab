"""Permanent regression fixtures for independently rendered sprite-stack atlases."""
import json
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))
import check_pack as cp  # noqa: E402

COMMON = {
    "license": {"type": "own", "author": "META GAMES", "commercial": True},
    "provenance": {"tool": "test", "date": "2026-11-17"},
    "content_flags": {"real_persons": [], "brands": [], "political": False}
}


def fixture(tmp, mode="good", n=14):
    root = Path(tmp)
    (root / "stacks").mkdir(exist_ok=True)
    im = np.zeros((16, 16*n, 4), dtype=np.uint8)
    for i in range(n):
        for y in range(2, 14):
            width = 12-(i*7//max(1,n-1))
            x0 = 8-width//2
            for x in range(x0, x0+width):
                if mode == "empty" and i == 5:
                    continue
                im[y, i*16+x, :] = ((40+i*11)%255, 60+(x%4)*20, 80+(y%3)*40, 255)
        if mode == "flat" and i:
            im[:, i*16:(i+1)*16] = im[:, :16]
    if mode == "alpha":
        im[5, 5, 3] = 128
    if mode == "singlecolor":
        im[im[:,:,3] == 255, :3] = (60, 60, 60)
    if mode == "wrongsize":
        im = im[:, :-1]
    Image.fromarray(im, "RGBA").save(root / "stacks" / "tower.png")
    (root / "index.html").write_text('<script src="./gothic-city.js"></script>', "utf-8")
    (root / "gothic-city.js").write_text("window.__ISOLATE__=(id,on)=>!!on;window.GothicCity={};", "utf-8")
    manifest = dict(COMMON, format="mg-spritestack/1", game="test",
                    assets={"tower": {"file": "stacks/tower.png", "slice": [16,16],
                                      "count": n, "pitch_px": 1, "role": "landmark",
                                      "label_ru": "Башня"}})
    (root / "stack.json").write_text(json.dumps(manifest), "utf-8")
    return root


def hard(root):
    return {i["id"] for i in cp.check(root).hard()}


class SpriteStackTests(unittest.TestCase):
    def test_clean(self):
        with tempfile.TemporaryDirectory() as tmp:
            self.assertFalse(hard(fixture(tmp)))

    def test_SS12_color_noise_cannot_hide_flat_facade(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = fixture(tmp, "good", n=48)
            image_path = root / "stacks/tower.png"
            a = np.asarray(Image.open(image_path).convert("RGBA")).copy()
            # Every slice has the same wall contour, but unique RGB masonry.
            for i in range(48):
                a[:, i*16:(i+1)*16, 3] = 0
                a[2:14, i*16+2:i*16+14, 3] = 255
            Image.fromarray(a, "RGBA").save(image_path)
            self.assertIn("SS12", hard(root))

    def test_SS13_city_cannot_float_over_sea(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = fixture(tmp)
            path = root / "stack.json"
            m = json.loads(path.read_text("utf-8"))
            m["game"] = "nebesny-pilot"
            m["assets"]["cliffBase"] = dict(m["assets"]["tower"])
            path.write_text(json.dumps(m), "utf-8")
            self.assertIn("SS13", hard(root))
            # Supplying render hooks AND excluding islands is required.
            (root / "index.html").write_text(
                '<script src="./gothic-city.js"></script> '
                'GothicCity.drawGround(); GothicCity.isCity(0,0);', "utf-8")
            (root / "gothic-city.js").write_text(
                "window.__ISOLATE__=(id,on)=>!!on;"
                "function drawGround(){ const cliffBase = true; }", "utf-8")
            self.assertNotIn("SS13", hard(root))

    def test_identical_slices_are_flat(self):
        with tempfile.TemporaryDirectory() as tmp:
            self.assertIn("SS8", hard(fixture(tmp, "flat")))

    def test_bottom_and_top_are_not_same(self):
        with tempfile.TemporaryDirectory() as tmp:
            self.assertIn("SS9", hard(fixture(tmp, "flat")))

    def test_half_alpha_is_invalid(self):
        with tempfile.TemporaryDirectory() as tmp:
            self.assertIn("SS6", hard(fixture(tmp, "alpha")))

    def test_missing_texture(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = fixture(tmp)
            (root / "stacks/tower.png").unlink()
            self.assertIn("SS4", hard(root))

    def test_bad_dimensions(self):
        with tempfile.TemporaryDirectory() as tmp:
            self.assertIn("SS5", hard(fixture(tmp, "wrongsize")))

    def test_empty_slice(self):
        with tempfile.TemporaryDirectory() as tmp:
            self.assertIn("SS7", hard(fixture(tmp, "empty")))

    def test_low_slice_count(self):
        with tempfile.TemporaryDirectory() as tmp:
            self.assertIn("SS3", hard(fixture(tmp, n=4)))

    def test_single_color_is_primitive(self):
        with tempfile.TemporaryDirectory() as tmp:
            self.assertIn("SS10", hard(fixture(tmp, "singlecolor")))

    def test_broken_stand(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=fixture(tmp)
            (root/"index.html").write_text("No render", "utf-8")
            self.assertIn("SS11", hard(root))

    def test_missing_asset_isolation_hook(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = fixture(tmp)
            (root / "gothic-city.js").write_text("window.GothicCity={};", "utf-8")
            self.assertIn("SS11", hard(root))

    def test_unsafe_path(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=fixture(tmp)
            m=json.loads((root/"stack.json").read_text("utf-8"))
            m["assets"]["tower"]["file"]="../../secret.png"
            (root/"stack.json").write_text(json.dumps(m), "utf-8")
            self.assertIn("SS4", hard(root))


if __name__=="__main__":
    unittest.main()

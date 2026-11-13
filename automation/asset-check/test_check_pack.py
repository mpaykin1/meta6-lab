"""Ловушки бота-проверщика ассетов.

Каждая ловушка = маленький синтетический пак с ОДНОЙ подложенной ошибкой.
Бот обязан её поймать. Чистый пак обязан пройти без HARD.
Правило развития: каждая новая найденная в реальном паке ошибка → новая ловушка здесь.
Запуск: python3 -m unittest discover -s automation/asset-check -p 'test_*.py' -v
"""
import copy
import json
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))
import check_pack as cp  # noqa: E402

FW, FH = 32, 48


def figure(phase):
    """Человечек, у которого реально двигаются руки и ноги (phase 0..5)."""
    a = np.zeros((FH, FW, 4), np.uint8)
    col = (40, 60, 120, 255)
    a[8:30, 11:21] = col                         # корпус
    a[2:9, 12:20] = (230, 180, 140, 255)         # голова
    sw = [-4, -2, 0, 2, 4, 2][phase % 6]
    for i in range(14):                          # ноги расходятся
        a[30 + i, max(0, 13 - sw * i // 13):max(1, 16 - sw * i // 13)] = col
        a[30 + i, min(FW - 3, 17 + sw * i // 13):min(FW, 20 + sw * i // 13)] = col
    for i in range(12):                          # руки машут
        a[10 + i, max(0, 7 + sw * i // 12):max(1, 10 + sw * i // 12)] = (230, 180, 140, 255)
        a[10 + i, min(FW - 3, 22 - sw * i // 12):min(FW, 25 - sw * i // 12)] = (230, 180, 140, 255)
    return a


def sheet(frames):
    return np.concatenate(frames, axis=1)


def anim_entry(path, n, loop=True):
    return {"file": path, "type": "animation", "sheet_size": [FW * n, FH], "frame_size": [FW, FH],
            "columns": n, "count": n, "loop": loop,
            "frames": [{"x": FW * i, "y": 0, "w": FW, "h": FH, "duration_ms": 100,
                        "anchor": {"x": 16, "y": 46}} for i in range(n)]}


def tile_img():
    t = np.zeros((32, 32, 4), np.uint8)
    t[..., :3] = 90
    t[..., 3] = 255
    t[::4, :, :3] = 120   # горизонтальные полосы — края слева/справа совпадают
    return t


TILES = ["ground_top", "ground_fill", "platform_left", "platform_center", "platform_right", "wall", "ground_left_corner"]
HERO = {"idle": False, "run": True, "jump": False, "fall": True, "shoot": False, "take_damage": False, "defeat": False}
ENEMY = {"idle": True, "movement": True, "attack": False, "damage": False, "defeat": False}


def build_clean(root: Path):
    assets, anims = {}, {"hero": {}, "foe": {}}
    for role, states, folder in (("hero", HERO, "characters"), ("foe", ENEMY, "enemies")):
        for st, loop in states.items():
            rel = f"{folder}/{role}_{st}.png"
            (root / folder).mkdir(parents=True, exist_ok=True)
            Image.fromarray(sheet([figure(i) for i in range(6)])).save(root / rel)
            assets[rel] = anim_entry(rel, 6, loop)
            if st in ("attack", "shoot"):
                assets[rel]["events"] = [{"frame": 3, "type": "hit", "x": 28, "y": 20}]
            anims[role][st] = rel
    (root / "tiles/w1").mkdir(parents=True)
    for t in TILES:
        rel = f"tiles/w1/{t}.png"
        Image.fromarray(tile_img()).save(root / rel)
        assets[rel] = {"file": rel, "type": "tile", "sheet_size": [32, 32], "frame_size": [32, 32], "count": 1,
                       "frames": [{"x": 0, "y": 0, "w": 32, "h": 32, "duration_ms": 100}],
                       "tags": {"seamless": True, "seamless_x": True, "collision": "solid"}}
    (root / "locales").mkdir()
    (root / "locales/ru.json").write_text(json.dumps({"start": "ИГРАТЬ"}), "utf-8")
    (root / "locales/en.json").write_text(json.dumps({"start": "PLAY"}), "utf-8")
    Image.new("RGBA", (64, 64)).save(root / "preview.png")
    man = {"format": "MG.AssetPack/1", "version": "1.0.0", "tile_size": [32, 32], "default_filter": "nearest",
           "license": {"type": "own", "commercial": True}, "provenance": {"tool": "test"},
           "content_flags": {"real_persons": [], "brands": [], "political": False},
           "locales": ["ru", "en"], "assets": assets, "animations": anims,
           "hitboxes": {"hero": {"x": 10, "y": 2, "w": 12, "h": 44}, "foe": {"x": 10, "y": 2, "w": 12, "h": 44}}}
    (root / "atlas.json").write_text(json.dumps(man), "utf-8")
    return man


class Traps(unittest.TestCase):
    def setUp(self):
        self.d = Path(tempfile.mkdtemp())
        self.man = build_clean(self.d)

    def save(self, man):
        (self.d / "atlas.json").write_text(json.dumps(man), "utf-8")

    def ids(self, sev="HARD"):
        return {i["id"] for i in cp.check(self.d).items if i["severity"] == sev}

    def test_clean_pack_passes(self):
        hard = cp.check(self.d).hard()
        self.assertEqual(hard, [], hard)

    def test_A1_no_manifest(self):
        (self.d / "atlas.json").unlink()
        self.assertIn("A1", self.ids())

    def test_C3_symlink_out_of_pack(self):
        (self.d / "evil.png").symlink_to("/etc/hostname")
        self.assertIn("C3", self.ids())

    def test_A2_missing_file(self):
        (self.d / "characters/hero_idle.png").unlink()
        self.assertIn("A2", self.ids())

    def test_A3_wrong_sheet_size(self):
        m = copy.deepcopy(self.man)
        m["assets"]["characters/hero_run.png"]["sheet_size"] = [100, 48]
        self.save(m)
        self.assertIn("A3", self.ids())

    def test_A4_anchor_outside(self):
        m = copy.deepcopy(self.man)
        m["assets"]["characters/hero_run.png"]["frames"][0]["anchor"] = {"x": 99, "y": 99}
        self.save(m)
        self.assertIn("A4", self.ids())

    def test_A6_no_license(self):
        m = copy.deepcopy(self.man)
        del m["license"]
        self.save(m)
        self.assertIn("A6", self.ids())

    def test_A7_no_content_flags(self):
        m = copy.deepcopy(self.man)
        del m["content_flags"]
        self.save(m)
        self.assertIn("A7", self.ids())

    def test_P3_empty_frame(self):
        fr = [figure(i) for i in range(6)]
        fr[2] = np.zeros_like(fr[2])
        Image.fromarray(sheet(fr)).save(self.d / "characters/hero_run.png")
        self.assertIn("P3", self.ids())

    def test_P4_static_animation(self):
        Image.fromarray(sheet([figure(0)] * 6)).save(self.d / "enemies/foe_attack.png")
        self.assertIn("P4", self.ids())

    def test_P5_fake_animation_only_shift(self):
        # ловушка из реального пака MLGA: враг просто подпрыгивает на 1–2 px, тело не двигается
        fr = [np.roll(figure(0), [0, -1, -2, -1, 0, 1][i], axis=0) for i in range(6)]
        Image.fromarray(sheet(fr)).save(self.d / "enemies/foe_movement.png")
        self.assertIn("P5", self.ids())

    def test_P5_fake_animation_only_sparkle(self):
        # ловушка из реального пака MLGA (casino_robot): меняется 1 искра, корпус неподвижен
        fr = []
        for i in range(6):
            f = figure(0).copy()
            f[1, 1 + i * 2] = (255, 220, 80, 255)
            fr.append(f)
        Image.fromarray(sheet(fr)).save(self.d / "enemies/foe_attack.png")
        self.assertIn("P5", self.ids())

    def test_G1_missing_state(self):
        m = copy.deepcopy(self.man)
        del m["animations"]["foe"]["defeat"]
        self.save(m)
        self.assertIn("G1", self.ids())

    def test_G2_fake_seamless_tile(self):
        t = tile_img()
        t[:, :16, :3] = 20     # левая половина тёмная — шов
        Image.fromarray(t).save(self.d / "tiles/w1/ground_fill.png")
        self.assertIn("G2", self.ids())

    def test_G5_missing_core_tile(self):
        m = copy.deepcopy(self.man)
        del m["assets"]["tiles/w1/wall.png"]
        (self.d / "tiles/w1/wall.png").unlink()
        self.save(m)
        self.assertIn("G5", self.ids())

    def test_G7_state_size_mismatch(self):
        m = copy.deepcopy(self.man)
        m["assets"]["characters/hero_jump.png"]["frames"][0]["anchor"] = {"x": 10, "y": 40}
        self.save(m)
        self.assertIn("G7", self.ids())

    def test_G9_attack_without_hit_event(self):
        m = copy.deepcopy(self.man)
        del m["assets"]["enemies/foe_attack.png"]["events"]
        self.save(m)
        self.assertIn("G9", self.ids())

    def test_L2_locale_key_missing(self):
        (self.d / "locales/en.json").write_text(json.dumps({}), "utf-8")
        self.assertIn("L2", self.ids())

    def test_zip_path_traversal_rejected(self):
        import zipfile
        z = self.d / "evil.zip"
        with zipfile.ZipFile(z, "w") as f:
            f.writestr("../evil.txt", "x")
        self.assertEqual(cp.main([str(z)]), 2)


if __name__ == "__main__":
    unittest.main()

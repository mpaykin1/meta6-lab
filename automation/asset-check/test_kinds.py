"""Ловушки для видов model3d, audio, skin, abyss и нераспознанного пака.

Каждый вид: чистый образец проходит без HARD своего вида; каждая подложенная ошибка ловится.
Запуск: python3 -m unittest discover -s automation/asset-check -p 'test_*.py' -v
"""
import json
import math
import shutil
import struct
import sys
import tempfile
import unittest
import wave
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))
import check_pack as cp  # noqa: E402

COMMON = {"license": {"type": "own", "commercial": True}, "provenance": {"tool": "test"},
          "content_flags": {"real_persons": [], "brands": [], "political": False}}


def ids(root, sev="HARD"):
    return {i["id"] for i in cp.check(Path(root)).items if i["severity"] == sev}


# ---------- 3D ----------
def make_glb(path, tris=12, scale=1.0, y0=0.0, skins=False, anim=True, normals=True, magic=b"glTF", truncate=False):
    pos = []
    for i in range(tris):
        a = i * 0.1
        pos += [[0, y0, 0], [scale * math.cos(a), y0 + scale, 0], [scale * math.sin(a), y0, scale]]
    pos = np.array(pos, np.float32)
    nrm = np.tile(np.array([0, 1, 0], np.float32), (len(pos), 1))
    times = np.array([0, 1], np.float32)
    rot = np.array([[0, 0, 0, 1], [0, 0.7071, 0, 0.7071]], np.float32)
    blob = pos.tobytes() + nrm.tobytes() + times.tobytes() + rot.tobytes()
    o1, o2, o3 = pos.nbytes, pos.nbytes + nrm.nbytes, pos.nbytes + nrm.nbytes + times.nbytes
    attrs = {"POSITION": 0}
    if normals:
        attrs["NORMAL"] = 1
    g = {"asset": {"version": "2.0"}, "scene": 0, "scenes": [{"nodes": [0]}], "nodes": [{"mesh": 0}],
         "meshes": [{"primitives": [{"attributes": attrs, "mode": 4}]}],
         "buffers": [{"byteLength": len(blob)}],
         "bufferViews": [{"buffer": 0, "byteOffset": 0, "byteLength": pos.nbytes},
                         {"buffer": 0, "byteOffset": o1, "byteLength": nrm.nbytes},
                         {"buffer": 0, "byteOffset": o2, "byteLength": times.nbytes},
                         {"buffer": 0, "byteOffset": o3, "byteLength": rot.nbytes}],
         "accessors": [{"bufferView": 0, "componentType": 5126, "count": len(pos), "type": "VEC3",
                        "min": pos.min(0).tolist(), "max": pos.max(0).tolist()},
                       {"bufferView": 1, "componentType": 5126, "count": len(pos), "type": "VEC3"},
                       {"bufferView": 2, "componentType": 5126, "count": 2, "type": "SCALAR", "min": [0], "max": [1]},
                       {"bufferView": 3, "componentType": 5126, "count": 2, "type": "VEC4"}]}
    if skins:
        g["skins"] = [{"joints": [0]}]
    if anim:
        g["animations"] = [{"name": "idle", "samplers": [{"input": 2, "output": 3}],
                            "channels": [{"sampler": 0, "target": {"node": 0, "path": "rotation"}}]}]
    js = json.dumps(g).encode()
    js += b" " * (-len(js) % 4)
    blob += b"\0" * (-len(blob) % 4)
    total = 12 + 8 + len(js) + 8 + len(blob)
    data = magic + struct.pack("<II", 2, total) + struct.pack("<II", len(js), 0x4E4F534A) + js + \
        struct.pack("<II", len(blob), 0x004E4942) + blob
    if truncate:
        data = data[:-16]
    Path(path).write_bytes(data)


# ---------- звук ----------
def make_wav(path, kind="tone", dur=0.5, sr=22050, amp=0.5):
    t = np.arange(int(sr * dur)) / sr
    if kind == "tone":
        x = amp * np.sin(2 * np.pi * 330 * t) * np.minimum(1, (dur - t) * 20)
    elif kind == "clip":
        x = np.clip(3 * np.sin(2 * np.pi * 330 * t), -1, 1)
    elif kind == "hiss":
        x = amp * np.sin(2 * np.pi * 8000 * t)
    elif kind == "late":
        x = np.where(t > 0.6, amp * np.sin(2 * np.pi * 330 * t), 0)
    else:
        x = np.zeros_like(t)
    with wave.open(str(path), "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype("<i2").tobytes())


# ---------- скин ----------
def make_skin(root: Path):
    pal = ["#c8551e", "#5a2a10", "#2b1a12", "#ffb040", "#8a8a8a", "#e8e0d0"]
    rgb = [tuple(int(c[i:i + 2], 16) for i in (1, 3, 5)) for c in pal]
    (root / "textures").mkdir(parents=True)
    (root / "parts").mkdir()
    (root / "sheets").mkdir()
    Image.new("RGBA", (32, 32), rgb[0] + (255,)).save(root / "reference.png")
    Image.new("RGBA", (96, 32), rgb[1] + (255,)).save(root / "preview.png")
    Image.new("RGBA", (64, 64), rgb[2] + (255,)).save(root / "textures/body.png")

    def part_png(name, col):
        a = np.zeros((16, 16, 4), np.uint8)
        a[3:13, 3:13] = rgb[col] + (255,)
        Image.fromarray(a).save(root / f"parts/{name}.png")

    def sheet_png(name):
        fr = []
        for i in range(6):
            a = np.zeros((16, 16, 4), np.uint8)
            a[2 + i:6 + i, 4:12] = rgb[3] + (255,)
            fr.append(a)
        Image.fromarray(np.concatenate(fr, 1)).save(root / f"sheets/{name}.png")
    kinds = ["plate", "gear", "cable", "arc", "slit", "core", "lens", "orb", "bolt", "panel", "piston"]
    bones = ["body", "head", "armL", "armR", "legL", "legR"]
    layers = ["3d"] * 8 + ["2.5d"] * 12 + ["2d"] * 12
    parts = []
    for i in range(32):
        k, b, lay = kinds[i % len(kinds)], bones[i % len(bones)], layers[i]
        an = {"type": "bob", "freq": 0.3 + i * 0.07, "phase": (i * 0.13) % 1}
        if i < 3:
            an["type"] = "rotate"
        elif i < 5:
            an.update(type="chain", segments=4, lag=0.1)
        elif i < 8:
            an.update(type="flipbook", frames=6, fps=10)
        if i % 5 == 0:
            an["speedLink"] = 1.0
        if i % 7 == 0:
            an["pulseLink"] = 1.0
        fname = f"sheets/s{i}.png" if an["type"] == "flipbook" else f"parts/p{i}.png"
        if an["type"] == "flipbook":
            sheet_png(f"s{i}")
        else:
            part_png(f"p{i}", i % 5)
        parts.append({"id": f"p{i}", "kind": k, "layer": lay, "bone": b, "file": fname,
                      "offset": [0, 0, 0.2 if i % 4 == 0 else -0.2], "material": "glow" if i % 4 == 1 else "rust",
                      "anim": [an] if i < 28 else []})
    s = {"format": "meta6-skin/1", "name": root.name, "reference": "reference.png", "palette": pal,
         "hideBase": ["body"], "materials": {"rust": {}, "glow": {"blend": "additive"}},
         "textures": [{"id": "t", "file": "textures/body.png", "apply": "body"}], "parts": parts}
    s.update(COMMON)
    (root / "skin.json").write_text(json.dumps(s), "utf-8")
    return s


class KindTraps(unittest.TestCase):
    def setUp(self):
        self.d = Path(tempfile.mkdtemp()) / "pack"
        self.d.mkdir()
        (self.d / "pack.json").write_text(json.dumps(COMMON), "utf-8")

    def tearDown(self):
        shutil.rmtree(self.d.parent, ignore_errors=True)

    # --- нераспознанный пак ---
    def test_U1_unknown_pack(self):
        (self.d / "thing.xyz").write_bytes(b"???")
        got = ids(self.d)
        self.assertIn("U1", got)

    # --- 3D ---
    def test_model3d_clean_passes(self):
        make_glb(self.d / "hero.glb", skins=True)
        r = cp.check(self.d)
        self.assertIn("model3d", r.kinds)
        self.assertEqual(r.hard(), [], r.hard())

    def test_M1_broken_glb(self):
        make_glb(self.d / "a.glb", magic=b"XXXX")
        self.assertIn("M1", ids(self.d))

    def test_M1_truncated_glb(self):
        make_glb(self.d / "a.glb", truncate=True)
        self.assertIn("M1", ids(self.d))

    def test_M3_too_many_triangles(self):
        make_glb(self.d / "a.glb", tris=110_000)
        self.assertIn("M3", ids(self.d))

    def test_M5_scale_in_centimeters(self):
        make_glb(self.d / "a.glb", scale=5000)
        self.assertIn("M5", ids(self.d))

    def test_M6_rig_without_animation(self):
        make_glb(self.d / "a.glb", skins=True, anim=False)
        self.assertIn("M6", ids(self.d))

    def test_M10_floating_model(self):
        make_glb(self.d / "a.glb", y0=3.0)
        self.assertIn("M10", ids(self.d, "SOFT"))

    # --- звук ---
    def test_audio_clean_passes(self):
        make_wav(self.d / "hit.wav")
        r = cp.check(self.d)
        self.assertIn("audio", r.kinds)
        self.assertEqual(r.hard(), [], r.hard())

    def test_S2_clipping(self):
        make_wav(self.d / "hit.wav", "clip")
        self.assertIn("S2", ids(self.d))

    def test_S4_harsh_high_sound(self):
        make_wav(self.d / "beep.wav", "hiss")
        self.assertIn("S4", ids(self.d))

    def test_S1_empty_sound(self):
        make_wav(self.d / "step.wav", dur=0.01)
        self.assertIn("S1", ids(self.d))

    def test_S5_late_start(self):
        make_wav(self.d / "jump.wav", "late", dur=1.0)
        self.assertIn("S5", ids(self.d, "SOFT"))

    # --- скин ---
    def test_skin_clean_passes(self):
        (self.d / "pack.json").unlink()
        make_skin(self.d)
        r = cp.check(self.d)
        self.assertIn("skin", r.kinds)
        self.assertEqual(r.hard(), [], r.hard())

    def test_KS7_skin_missing_required_kind(self):
        (self.d / "pack.json").unlink()
        s = make_skin(self.d)
        for p in s["parts"]:
            if p["kind"] == "core":
                p["kind"] = "plate"
        (self.d / "skin.json").write_text(json.dumps(s), "utf-8")
        self.assertIn("KS7", ids(self.d))

    def test_KS10_skin_synchronous_motion(self):
        (self.d / "pack.json").unlink()
        s = make_skin(self.d)
        for p in s["parts"]:
            for a in p["anim"]:
                a["freq"], a["phase"] = 1.0, 0.0
        (self.d / "skin.json").write_text(json.dumps(s), "utf-8")
        self.assertIn("KS10", ids(self.d))

    def test_KS12_flipbook_fake_frames(self):
        (self.d / "pack.json").unlink()
        make_skin(self.d)
        a = np.zeros((16, 16, 4), np.uint8)
        a[4:10, 4:10] = (255, 176, 64, 255)
        Image.fromarray(np.concatenate([a] * 6, 1)).save(self.d / "sheets/s5.png")
        self.assertIn("KS12", ids(self.d))

    # --- ABYSS (переиспользует asset-quality/validate.py) ---
    def test_abyss_delegates_to_existing_validator(self):
        if not (Path(__file__).resolve().parents[1] / "asset-quality" / "validate.py").exists():
            self.skipTest("нет asset-quality/validate.py в этой копии")
        (self.d / "manifest.json").write_text(json.dumps({"sprites": [{"id": "fish", "file": "nope.png"}]}), "utf-8")
        r = cp.check(self.d)
        self.assertIn("abyss", r.kinds)
        self.assertTrue(any(i["id"].startswith("AB:") for i in r.hard()))

    # --- смешанный пак: все виды сразу ---
    def test_mixed_pack_runs_every_kind(self):
        make_glb(self.d / "m.glb")
        make_wav(self.d / "s.wav")
        r = cp.check(self.d)
        self.assertEqual(set(r.kinds) & {"model3d", "audio"}, {"model3d", "audio"})


if __name__ == "__main__":
    unittest.main()

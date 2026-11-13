"""Ловушки htmlpack/1: эталон, потерянный, пустой, статичный, текст, сеть, FPS."""
from __future__ import annotations

import json
import os
import shutil
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

import check_pack as cp

REPO = Path(os.environ.get("ASSET_CHECK_REPO") or Path(__file__).resolve().parents[2])
REF = REPO / "reference/tumannye-shpili/index.html"
COMMON = {"format": "htmlpack/1", "license": {"type": "own", "commercial": True},
          "provenance": {"tool": "ChatGPT", "date": "2026-11-13"},
          "content_flags": {"real_persons": [], "brands": [], "political": False}}


class HtmlPackTraps(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.source = REF.read_text("utf-8")
        self.old = __import__("re").findall(r"\{\s*id:'([^']+)'", self.source.split("const PACK=", 1)[1].split("]};", 1)[0])
        self.root.joinpath("index.html").write_text(self.source, "utf-8")
        self.root.joinpath("pack.json").write_text(json.dumps(COMMON), "utf-8")

    def tearDown(self):
        self.tmp.cleanup()

    def add_new(self):
        src = self.root.joinpath("index.html").read_text("utf-8")
        src = src.replace("]};\nPACK.count", ",\n {id:'new_shadow',n:'Теневая маска',k:'2.5D',m:'plaza',cam:[0,7,14],look:[0,7,-40],isNew:true}\n]};\nPACK.count", 1)
        src = src.replace("window.__PACK__=PACK;", "window.__PACK__=PACK;window.__PACK_PROBE__={};", 1)
        self.root.joinpath("index.html").write_text(src, "utf-8")
        manifest = dict(COMMON, assets={"new_shadow": {"role": "enemy"}})
        self.root.joinpath("pack.json").write_text(json.dumps(manifest), "utf-8")

    def metrics(self, new=None, fps=45):
        ref = {name: {"visible": .14, "detail": .07, "motion": .08, "colors": 130,
                      "fps": 45, "isolated": 1} for name in self.old}
        cand = dict(ref)
        if new is not None:
            cand["new_shadow"] = dict(visible=.16, detail=.09, motion=.1, colors=140,
                                      fps=fps, isolated=.16, **new)
        return {"ok": True, "reference": {"items": ref, "errors": [], "screen_text": False},
                "candidate": {"items": cand, "errors": [], "screen_text": False}}

    def check(self, data=None, error=None):
        mocked = SimpleNamespace(stdout=json.dumps(data or self.metrics()), stderr="", returncode=0)
        with patch("subprocess.run", return_value=mocked):
            return cp.check(self.root)

    def ids(self, data=None, error=None):
        return {x["id"] for x in self.check(data, error).hard()}

    def test_good_reference_passes_without_hard(self):
        self.assertEqual([], self.check().hard())

    def test_good_new_asset_passes(self):
        self.add_new()
        self.assertEqual([], self.check(self.metrics(new={})).hard())

    def test_HP3_missing_one_of_26(self):
        self.root.joinpath("index.html").write_text(
            self.source.replace("{id:'mask',", "{id:'lost_mask',", 1), "utf-8")
        self.assertIn("HP3", self.ids())

    def test_HP4_text_on_game_screen(self):
        self.root.joinpath("index.html").write_text(
            self.source.replace('<canvas id="c"></canvas>', '<canvas id="c"></canvas><div>GAME TEXT</div>', 1), "utf-8")
        self.assertIn("HP4", self.ids())

    def test_HP5_empty_new_asset(self):
        self.add_new()
        self.assertIn("HP5", self.ids(self.metrics(new={"isolated": 0.0, "visible": 0.0})))

    def test_HP5_undetailed_new_asset(self):
        self.add_new()
        self.assertIn("HP5", self.ids(self.metrics(new={"detail": 0.0})))

    def test_HP6_static_new_asset(self):
        self.add_new()
        self.assertIn("HP6", self.ids(self.metrics(new={"motion": 0.0})))

    def test_HP7_slow_browser_page(self):
        self.add_new()
        data = self.metrics(new={})
        for m in data["candidate"]["items"].values():
            m["fps"] = 23
        self.assertIn("HP7", self.ids(data))

    def test_HP2_forbidden_network(self):
        self.root.joinpath("index.html").write_text(
            self.source.replace("</body>", "<script src='https://evil.example/track.js'></script></body>", 1), "utf-8")
        self.assertIn("HP2", self.ids())

    def test_HP2_eval_forbidden(self):
        self.root.joinpath("index.html").write_text(
            self.source.replace("</body>", "<script>eval('1')</script></body>", 1), "utf-8")
        self.assertIn("HP2", self.ids())

    def test_HP1_missing_probe(self):
        self.add_new()
        p = self.root / "index.html"
        p.write_text(p.read_text("utf-8").replace("window.__PACK_PROBE__={};", ""), "utf-8")
        self.assertIn("HP1", self.ids(self.metrics(new={})))

    def test_HP8_console_error(self):
        data = self.metrics()
        data["candidate"]["errors"] = ["ReferenceError: broken"]
        self.assertIn("HP8", self.ids(data))

    def test_HP8_unavailable_browser(self):
        with patch("subprocess.run", return_value=SimpleNamespace(
            stdout='{"ok":false,"error":"Chrome unavailable"}', stderr="", returncode=1)):
            self.assertIn("HP8", {x["id"] for x in cp.check(self.root).hard()})


if __name__ == "__main__":
    unittest.main()

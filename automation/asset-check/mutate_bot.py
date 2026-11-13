#!/usr/bin/env python3
"""Охота на мутантов: каждая мутация выключает одну проверку бота — ловушки обязаны упасть.
Мутант выжил (тесты зелёные) = ловушка слабая → усилить ловушку. Новая проверка → добавь строку в MUTANTS.
Запуск из корня репозитория: python3 automation/asset-check/mutate_bot.py
"""
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
MUTANTS = [
    ("check_pack.py", 'r.add("A6",', 'r.add("C1",'),
    ("check_pack.py", 'r.add("A7",', 'r.add("C2",'),
    ("kinds/images.py", 'r.add("A1",', 'r.add("I1",'),
    ("kinds/sprite2d.py", "if med < 0.06:", "if med < -1:"),
    ("kinds/sprite2d.py", 'if tags.get("seamless") and', "if False and"),
    ("kinds/sprite2d.py", "if len(fr) > 1 and len(uniq) == 1:", "if False:"),
    ("kinds/sprite2d.py", "if len(sizes) > 1 or len(anchors) > 1:", "if False:"),
    ("kinds/audio.py", "if high > HIGH_SOFT:", "if False:"),
    ("kinds/audio.py", "if clip > 0.001:", "if False:"),
    ("kinds/model3d.py", "if tris > TRI_HARD:", "if False:"),
    ("kinds/model3d.py", "if length != len(data):", "if False:"),
    ("kinds/model3d.py", 'if g.get("skins") and not anims:', "if False:"),
    ("kinds/skin.py", "if pairs and len(set(pairs))", "if False and len(set(pairs))"),
    ("kinds/skin.py", "miss = [k for k in REQ_KINDS if k not in kinds]", "miss = []"),
    ("check_pack.py", "if p.is_symlink() or", "if False and"),
    ("kinds/ink.py", 'if not m.get("same_seed_same"):', "if False:"),
    ("kinds/ink.py", "if role in VARY and not", "if False and not"),
    ("kinds/ink.py", "if name in taken:", "if False:"),
    ("kinds/ink.py", "if role in ALIVE and not", "if False and not"),
    ("kinds/ink.py", 'if m["min"][1] > 0.25 and', "if False and"),
    ("kinds/ink.py", 'if bar and role not in ("effect", "ground") and', "if False and"),
    ("check_pack.py", 'if "content_flags" not in merged:', "if False:"),
    ("kinds/sprite2d.py", 'm.get("format") not in {"ink-pack/1", "htmlpack/1"}', 'm.get("format") != "ink-pack/1"'),
    ("kinds/htmlpack_harness.mjs", "if(delta<=23){pixels[i+3]=0;continue}", "if(false){pixels[i+3]=0;continue}"),
    ("kinds/htmlpack_harness.mjs", "CAMERA_TOLERANCE=3.5", "CAMERA_TOLERANCE=1e9"),
    ("kinds/htmlpack.py", 'r.add("HP13", "HARD", str(compare),', 'r.add("HP13OFF", "SOFT", str(compare),'),
    ("kinds/htmlpack.py", "if missing:", "if False and missing:"),
    ("kinds/htmlpack.py", "if any_bad_text:", "if False and any_bad_text:"),
    ("kinds/htmlpack.py", "if isolated < .006:", "if isolated < -1:"),
    ("kinds/htmlpack.py", "if val + 1e-6 < ref:", "if False and val + 1e-6 < ref:"),
    ("kinds/htmlpack.py", "if ref_fps > 0 and new_fps < ref_fps * .8:", "if False:"),
    ("kinds/htmlpack.py", "if found != CDN:", "if False:"),
    ("kinds/htmlpack.py", "if error:", "if False and error:"),
    ("kinds/htmlpack.py", 'if new_ids and "window.__PACK_PROBE__" not in source:', "if False:"),
    ("kinds/htmlpack.py", "if unisolated:", "if False and unisolated:"),
    ("kinds/htmlpack.py", "if shape_deform + 1e-6 < deform_min:", "if False and shape_deform + 1e-6 < deform_min:"),
    ("kinds/htmlpack_harness.mjs", "await page.evaluate(id=>window.__AC_WAKE__(id),id);", "await page.evaluate(id=>void id,id);"),
    ("kinds/htmlpack.py", "if not isinstance(shape, (int, float)) or shape + 1e-6 < silhouette_min:", "if False:"),
    ("kinds/htmlpack.py", "if color_delta > palette_limit:", "if False:"),
    ("kinds/htmlpack.py", "if not isinstance(structure, (int, float)) or structure + 1e-6 < structure_min:", "if False:"),
    ("kinds/htmlpack_harness.mjs", "window.__ISOLATE__(id,false)", "window.__ISOLATE__(id,true)"),
    ("kinds/htmlpack_harness.mjs", r"const refDraw=/update\(t,dt\);(\s*)renderer\.setRenderTarget\(rtA\);/;", "const refDraw=/NO_MATCH/;"),
]


def run_tests(root: Path) -> bool:
    import os
    env = dict(os.environ, ASSET_CHECK_REPO=str(HERE.parents[1]))
    p = subprocess.run([sys.executable, "-m", "unittest", "discover", "-s", str(root), "-p", "test_*.py"],
                       capture_output=True, text=True, cwd=root, env=env)
    return p.returncode == 0


def main():
    escaped = []
    for f, needle, repl in MUTANTS:
        with tempfile.TemporaryDirectory() as t:
            dst = Path(t) / "asset-check"
            shutil.copytree(HERE, dst, ignore=shutil.ignore_patterns("__pycache__"))
            q = HERE.parent / "asset-quality"
            if q.exists():
                shutil.copytree(q, Path(t) / "asset-quality", ignore=shutil.ignore_patterns("__pycache__"))
            src = (dst / f).read_text("utf-8")
            if needle not in src:
                print(f"MUTATION_TARGET_MISSING {f}: {needle}")
                escaped.append(needle)
                continue
            (dst / f).write_text(src.replace(needle, repl, 1), "utf-8")
            if run_tests(dst):
                print(f"MUTATION_ESCAPED {f}: {needle}")
                escaped.append(needle)
            else:
                print(f"MUTATION_KILLED {f}: {needle}")
    print(f"{len(MUTANTS) - len(escaped)}/{len(MUTANTS)} мутантов пойманы")
    return 1 if escaped else 0


if __name__ == "__main__":
    sys.exit(main())

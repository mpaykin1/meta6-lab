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
    ("check_pack.py", 'if "content_flags" not in merged:', "if False:"),
]


def run_tests(root: Path) -> bool:
    p = subprocess.run([sys.executable, "-m", "unittest", "discover", "-s", str(root), "-p", "test_*.py"],
                       capture_output=True, text=True, cwd=root)
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

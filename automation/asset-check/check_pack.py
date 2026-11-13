#!/usr/bin/env python3
"""Универсальный бот-проверщик ассет-паков для игр МГ / МГЛ.

Запуск:
    python3 -I automation/asset-check/check_pack.py <папка_или_zip> [--out report_dir] [--strict]

Бот сам определяет вид пака (один пак может содержать несколько видов) и запускает
проверки каждого вида из папки kinds/:
    sprite2d — 2D-спрайты, тайлы, фоны, UI (atlas.json)
    skin     — скины meta6-skin/1 (skin.json, правило SKINY)
    abyss    — ассеты ABYSS GLOW (manifest.json со sprites) — переиспользует automation/asset-quality/validate.py
    ink      — процедурные 3D-ассеты акварельного мира INK (pack.json ink-pack/1 + makers.js)
    model3d  — 3D-модели .glb/.gltf
    audio    — звук и музыка .wav/.ogg/.mp3 (правило ЗВУК)
    images   — картинки без манифеста (запасной вид)
Общие проверки для всех видов: A6, A7, C3–C6 (права, флаги содержимого, безопасность путей, бюджет, непроверенные файлы).

Новый вид ассетов = новый файл kinds/<вид>.py с NAME, detect(root), check(root, report) -> set(проверенных файлов)
+ ловушки в test_check_pack.py. Бот подхватит его сам. Так бот становится универсальным.

Код выхода: 0 — HARD-ошибок нет; 1 — есть HARD; 2 — пак не прочитан.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import sys
import tempfile
import zipfile
from collections import defaultdict
from pathlib import Path

try:
    import numpy  # noqa: F401
    from PIL import Image  # noqa: F401
except ImportError:  # pragma: no cover
    print("Нужны pillow и numpy: pip install pillow numpy", file=sys.stderr)
    sys.exit(2)

BOT_VERSION = "2.3.0"
HERE = Path(__file__).resolve().parent
BUDGET = {"pack_mb_soft": 8.0, "pack_mb_hard": 25.0, "files_soft": 120}
DOC_FILES = {".md", ".txt"}
MANIFEST_NAMES = ("pack.json", "atlas.json", "manifest.json", "skin.json")


class Report:
    def __init__(self, root: Path):
        self.root = root
        self.items: list[dict] = []
        self.stats: dict = {}
        self.kinds: list[str] = []

    def add(self, cid, sev, where, msg, fix):
        self.items.append({"id": cid, "severity": sev, "where": where, "problem": msg, "fix": fix})

    def hard(self):
        return [i for i in self.items if i["severity"] == "HARD"]

    def score(self):
        h = len(self.hard())
        s = len([i for i in self.items if i["severity"] == "SOFT"])
        return max(0, 100 - 10 * h - min(40, s))


def load_kinds():
    """Все модули kinds/*.py, по ORDER (запасной вид images — последним)."""
    mods = []
    for p in sorted((HERE / "kinds").glob("*.py")):
        if p.name.startswith("_"):
            continue
        spec = importlib.util.spec_from_file_location(f"asset_kind_{p.stem}", p)
        m = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(m)
        mods.append(m)
    mods.sort(key=lambda m: getattr(m, "ORDER", 50))
    return mods


def read_manifests(root: Path) -> dict:
    out = {}
    for n in MANIFEST_NAMES:
        p = root / n
        if p.exists():
            try:
                d = json.loads(p.read_text("utf-8"))
            except Exception:  # noqa — ошибку разбора покажет вид пака
                continue
            if isinstance(d, dict):
                out[n] = d
    return out


def common_checks(root: Path, r: Report, covered: set):
    mans = read_manifests(root)
    merged = {}
    for d in mans.values():
        for k in ("license", "provenance", "content_flags"):
            if k in d and k not in merged:
                merged[k] = d[k]
    where = next(iter(mans), "pack.json")
    miss = [k for k in ("license", "provenance") if k not in merged]
    if miss:
        r.add("A6", "HARD", where, f"Нет полей {miss} — происхождение и права не указаны",
              'Добавь в манифест (или pack.json) "license": {"type":"…","author":"…","commercial":true} и '
              '"provenance": {"tool":"…","prompt_sha256":"…","date":"YYYY-MM-DD"} (правило META_GAMES_SOURCE_ALLOWLIST)')
    if "content_flags" not in merged:
        r.add("A7", "HARD", where, "Нет content_flags — не указано, есть ли реальные люди, бренды, политика",
              'Добавь "content_flags": {"real_persons": [...], "brands": [...], "political": true|false}. '
              'Реальные узнаваемые люди/бренды/политика = отдельная версия пака без них для МГ, Google Play, Steam, Playgama')
    else:
        cf = merged["content_flags"]
        if isinstance(cf, dict) and (cf.get("real_persons") or cf.get("brands")):
            r.add("A7", "SOFT", where, f"В паке реальные люди/бренды: {cf.get('real_persons') or cf.get('brands')}",
                  "Нужна версия <имя>-fiction с вымышленными героями — её можно публиковать везде")

    files = [p for p in root.rglob("*") if p.is_file() or p.is_symlink()]
    for p in files:
        if p.is_symlink() or not p.resolve().is_relative_to(root.resolve()):
            r.add("C3", "HARD", p.name, "символическая ссылка или путь за пределы пака", "Только обычные файлы внутри пака")
    files = [p for p in files if p.is_file() and not p.is_symlink()]
    total = sum(p.stat().st_size for p in files)
    mb = total / 1e6
    if mb > BUDGET["pack_mb_hard"]:
        r.add("C4", "HARD", "/", f"пак {mb:.1f} МБ — тяжело для телефона", "Сожми (pngquant/oxipng, ogg, draco/meshopt)")
    elif mb > BUDGET["pack_mb_soft"]:
        r.add("C4", "SOFT", "/", f"пак {mb:.1f} МБ", "Сожми файлы")
    imgs = [p for p in files if p.suffix.lower() in (".png", ".webp", ".jpg", ".jpeg")]
    if len(imgs) > BUDGET["files_soft"]:
        r.add("C5", "SOFT", "/", f"{len(imgs)} отдельных картинок = столько же загрузок на телефоне (ВИДИМО И ЭКОНОМНО)",
              "Добавь упакованные атласы packed/<группа>.png + координаты в манифест; исходники оставь")
    rest = sorted(p.relative_to(root).as_posix() for p in files
                  if p.relative_to(root).as_posix() not in covered and p.suffix.lower() not in DOC_FILES
                  and not p.relative_to(root).as_posix().startswith("_check/"))
    if rest:
        r.add("C6", "SOFT", ", ".join(rest[:6]) + (" …" if len(rest) > 6 else ""),
              f"{len(rest)} файлов не проверил ни один вид пака",
              "Опиши их в манифесте или добавь новый вид kinds/<вид>.py с проверками (саморазвитие бота)")
    r.stats.update({"files": len(files), "megabytes": round(mb, 2)})


def check(root: Path) -> Report:
    r = Report(root)
    covered: set = set()
    for kind in load_kinds():
        if getattr(kind, "FALLBACK", False) and r.kinds:
            continue
        try:
            hit = kind.detect(root)
        except Exception as e:  # noqa
            r.add("U0", "HARD", kind.NAME, f"вид {kind.NAME}: detect упал: {e}", f"Почини kinds/{kind.NAME}.py")
            continue
        if not hit:
            continue
        r.kinds.append(kind.NAME)
        try:
            covered |= set(kind.check(root, r) or ())
        except Exception as e:  # noqa
            r.add("U0", "HARD", kind.NAME, f"вид {kind.NAME}: проверка упала: {type(e).__name__}: {e}",
                  f"Почини kinds/{kind.NAME}.py и добавь ловушку на этот пак")
    if not r.kinds:
        r.add("U1", "HARD", "/", "вид пака не распознан — бот не знает, что проверять",
              "Положи манифест известного вида (SPEC.md §1) или добавь новый вид kinds/<вид>.py с проверками и ловушками")
    covered |= set(MANIFEST_NAMES)
    common_checks(root, r, covered)
    r.stats.update({"kinds": r.kinds, "bot_version": BOT_VERSION})
    return r


def to_markdown(r: Report) -> str:
    hard, soft = r.hard(), [i for i in r.items if i["severity"] == "SOFT"]
    out = [f"# Проверка ассет-пака — оценка {r.score()}/100",
           f"Вид: **{', '.join(r.kinds) or 'не распознан'}** · HARD: **{len(hard)}** · SOFT: **{len(soft)}** · бот v{BOT_VERSION}",
           f"Статистика: {json.dumps(r.stats, ensure_ascii=False)}", ""]
    for sev in ("HARD", "SOFT"):
        out.append(f"## {sev}")
        groups = defaultdict(list)
        for i in r.items:
            if i["severity"] == sev:
                groups[(i["id"], i["fix"])].append(i)
        for (cid, fix), lst in sorted(groups.items()):
            out.append(f"- **{cid}** ×{len(lst)} — {lst[0]['problem']}  ")
            out.append(f"  где: {', '.join(x['where'] for x in lst[:6])}{' …' if len(lst) > 6 else ''}  ")
            out.append(f"  исправить: {fix}")
        out.append("")
    return "\n".join(out)


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("pack")
    ap.add_argument("--out", default=None)
    ap.add_argument("--strict", action="store_true", help="SOFT тоже валит проверку")
    a = ap.parse_args(argv)
    src = Path(a.pack)
    if src.suffix == ".zip":
        tmp = tempfile.mkdtemp()
        with zipfile.ZipFile(src) as z:
            for n in z.namelist():
                if n.startswith("/") or ".." in Path(n).parts:
                    print("Опасный путь в ZIP:", n, file=sys.stderr)
                    return 2
            z.extractall(tmp)
        src = Path(tmp)
        subs = [p for p in src.iterdir() if p.is_dir()]
        if not any((src / n).exists() for n in MANIFEST_NAMES) and len(subs) == 1 and \
                not [p for p in src.iterdir() if p.is_file()]:
            src = subs[0]
    if not src.is_dir():
        print("Нет папки пака:", src, file=sys.stderr)
        return 2
    r = check(src)
    md = to_markdown(r)
    js = {"score": r.score(), "hard": len(r.hard()), "kinds": r.kinds, "items": r.items, "stats": r.stats}
    if a.out:
        o = Path(a.out)
        o.mkdir(parents=True, exist_ok=True)
        (o / "REPORT.md").write_text(md, "utf-8")
        (o / "report.json").write_text(json.dumps(js, ensure_ascii=False, indent=1), "utf-8")
    print(md)
    if r.hard() or (a.strict and r.items):
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())

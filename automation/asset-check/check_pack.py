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
import shutil
import stat
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

BOT_VERSION = "2.7.0"
HERE = Path(__file__).resolve().parent
BUDGET = {"pack_mb_soft": 8.0, "pack_mb_hard": 25.0, "files_soft": 120}
DOC_FILES = {".md", ".txt"}
MANIFEST_NAMES = ("pack.json", "atlas.json", "manifest.json", "skin.json", "stack.json")
ZIP_MAX_BYTES = 100 * 1024 * 1024
ZIP_MAX_FILES = 4096
WINDOWS_DEVICES = {"con", "prn", "aux", "nul", "conin$", "conout$"} | {
    prefix + str(n) for prefix in ("com", "lpt") for n in range(1, 10)
}


def extract_pack(archive: Path, target: Path) -> Path:
    """Validate every ZIP member before writing anything, on Windows and POSIX alike."""
    with zipfile.ZipFile(archive) as z:
        members = z.infolist()
        if len(members) > ZIP_MAX_FILES or sum(m.file_size for m in members) > ZIP_MAX_BYTES:
            raise ValueError("ZIP exceeds extraction budget (100 MiB / 4096 entries)")
        seen = set()
        for member in members:
            name = member.filename.replace("\\", "/")
            parts = name.rstrip("/").split("/")
            mode = member.external_attr >> 16
            if (name.startswith("/") or any(p in ("", ".", "..") or ":" in p for p in parts)
                    or any(p.endswith((" ", ".")) for p in parts)
                    or any(p.split(".", 1)[0].casefold() in WINDOWS_DEVICES for p in parts)
                    or any(ord(c) < 32 or c in '<>"|?*' for c in name)
                    or stat.S_ISLNK(mode) or member.flag_bits & 1):
                raise ValueError("Unsafe ZIP member: " + member.filename)
            key = name.rstrip("/").casefold()
            if key in seen:
                raise ValueError("Duplicate ZIP destination: " + member.filename)
            seen.add(key)
        for member in members:
            destination = target.joinpath(*member.filename.replace("\\", "/").rstrip("/").split("/"))
            if member.is_dir() or member.filename.endswith("\\"):
                destination.mkdir(parents=True, exist_ok=True)
            else:
                destination.parent.mkdir(parents=True, exist_ok=True)
                with z.open(member) as source, destination.open("xb") as output:
                    shutil.copyfileobj(source, output)
    subs = [p for p in target.iterdir() if p.is_dir()]
    if (not any((target / n).exists() for n in MANIFEST_NAMES) and len(subs) == 1
            and not any(p.is_file() for p in target.iterdir())):
        return subs[0]
    return target


class Report:
    def __init__(self, root: Path):
        self.root = root
        self.items: list[dict] = []
        self.stats: dict = {}
        self.kinds: list[str] = []
        self.asset_ids: set = set()   # имена ассетов, которые нашли виды пака (для сверки с ЗАКАЗом)

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


ZAKAZ_KINDS = {"2d", "2.5d", "3d", "sound", "music", "effect", "ui", "tile", "background"}


def zakaz_checks(root: Path, r: Report, covered: set):
    """ЗАКАЗ (Z1–Z7): список ассетов (по видео, эскизу, словам владельца или эталону игры) против того, что реально есть в паке."""
    p = root / "ZAKAZ.json"
    if not p.exists():
        return
    covered.add("ZAKAZ.json")
    try:
        z = json.loads(p.read_text("utf-8"))
    except Exception as e:  # noqa
        r.add("Z1", "HARD", "ZAKAZ.json", f"не читается: {e}", "Исправь JSON")
        return
    if z.get("format") != "mg-zakaz/1" or not isinstance(z.get("items"), list):
        r.add("Z1", "HARD", "ZAKAZ.json", "нет format mg-zakaz/1 или списка items", "Формат — SPEC.md §ЗАКАЗ")
        return
    vid = z.get("video") or {}
    src = z.get("source") or ({"type": "video", **vid} if vid else {})
    stype = str(src.get("type", "")).lower()
    if stype not in ("video", "sketch", "text", "game", "owner"):
        r.add("Z1", "HARD", "ZAKAZ.json", "не указано, откуда список (source.type)",
              'source.type: video | sketch | text | game | owner (+ откуда: ссылка, файл или слова владельца)')
    elif stype == "video" and not (src.get("source") and src.get("duration_s")):
        r.add("Z1", "HARD", "ZAKAZ.json", "список по видео без source и duration_s", "Укажи видео и его длину")
    need_frame = stype in ("video", "sketch")
    items, seen = z["items"], set()
    for it in items:
        iid = str(it.get("id", ""))
        if not iid:
            r.add("Z2", "HARD", "ZAKAZ.json", "пункт без id", "У каждого пункта — id (имя будущего ассета)")
            continue
        if iid in seen:
            r.add("Z7", "HARD", iid, "id повторяется в списке", "Один пункт — один ассет")
        seen.add(iid)
        req = ["name_ru", "kind", "must"] + (["seen_at", "frame"] if stype == "video" else ["frame"] if need_frame else ["from"])
        miss = [k for k in req if not it.get(k)]
        if miss:
            r.add("Z2", "HARD", iid, f"в пункте нет полей {miss}",
                  "name_ru, kind, must (что обязательно видно/слышно)"
                  + (", seen_at и frame (кадр)" if need_frame else ", from (откуда пункт: слова владельца, ассет эталона, заметка Claude)"))
        if it.get("kind") and str(it["kind"]).lower() not in ZAKAZ_KINDS:
            r.add("Z2", "HARD", iid, f"kind={it['kind']!r}", f"kind один из: {', '.join(sorted(ZAKAZ_KINDS))}")
        fr = it.get("frame")
        if fr:
            fp = (root / fr)
            if not fp.exists() or not fp.resolve().is_relative_to(root.resolve()):
                r.add("Z3", "HARD", iid, f"нет картинки-образца {fr}", "Сохрани кадр/эскиз, где этот объект виден, в zakaz/frames/")
            else:
                covered.add(fp.relative_to(root).as_posix())
    dur = float(src.get("duration_s") or 0) if stype == "video" else 0
    if stype == "video":
        need = max(5, int(dur / 6)) if dur else 5
        if len(items) < need:
            r.add("Z5", "SOFT", "ZAKAZ.json", f"в списке {len(items)} пунктов — для видео {dur:.0f} с мало (ожидается ≥ {need})",
                  "Пересмотри видео покадрово: персонажи, враги, постройки, предметы, эффекты, погода, звуки, интерфейс")
    have = set(r.asset_ids) | {Path(c).stem for c in covered if not c.startswith(("zakaz/", "_check/"))}
    missing = [str(it.get("id")) for it in items if it.get("id") and str(it.get("id")) not in have]
    bad_q = sorted({str(it.get("id")) for it in items for i in r.hard()
                    if it.get("id") and str(it.get("id")) not in missing
                    and str(it.get("id")) in (str(i["where"]), Path(str(i["where"])).stem)})
    for iid in missing:
        name = next((it.get("name_ru") for it in items if str(it.get("id")) == iid), iid)
        r.add("Z4", "HARD", iid, f"не готово по списку из видео: «{name}»", "Сделай ассет с этим id (или исправь id в списке)")
    extra = sorted(a for a in r.asset_ids if a not in seen)
    if items and extra and z.get("strict_extra"):
        r.add("Z6", "SOFT", ", ".join(extra[:6]), f"{len(extra)} ассетов нет в списке из видео", "Добавь их в ZAKAZ.json или убери")
    ready = len(seen) - len(missing) - len(bad_q)
    r.stats["zakaz"] = {"total": len(seen), "ready": max(0, ready), "missing": missing, "quality_hard": bad_q}


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
    zakaz_checks(root, r, covered)
    common_checks(root, r, covered)
    r.stats.update({"kinds": r.kinds, "bot_version": BOT_VERSION})
    return r


def to_markdown(r: Report) -> str:
    hard, soft = r.hard(), [i for i in r.items if i["severity"] == "SOFT"]
    out = [f"# Проверка ассет-пака — оценка {r.score()}/100",
           f"Вид: **{', '.join(r.kinds) or 'не распознан'}** · HARD: **{len(hard)}** · SOFT: **{len(soft)}** · бот v{BOT_VERSION}",
           f"Статистика: {json.dumps(r.stats, ensure_ascii=False)}", ""]
    zk = r.stats.get("zakaz")
    if zk:
        out[1:1] = [f"**Заказ (список ассетов): готово {zk['ready']} из {zk['total']}** · нет: {', '.join(zk['missing']) or '—'} · "
                    f"есть, но качество не прошло: {', '.join(zk['quality_hard']) or '—'}"]
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
    try:
        if src.suffix.lower() == ".zip":
            with tempfile.TemporaryDirectory(prefix="asset-check-") as tmp:
                return report_pack(extract_pack(src, Path(tmp)), a.out, a.strict)
        return report_pack(src, a.out, a.strict)
    except (OSError, ValueError, zipfile.BadZipFile, RuntimeError) as error:
        print("Pack could not be read:", error, file=sys.stderr)
        return 2


def report_pack(src: Path, out=None, strict=False):
    if not src.is_dir():
        print("Нет папки пака:", src, file=sys.stderr)
        return 2
    r = check(src)
    md = to_markdown(r)
    js = {"score": r.score(), "hard": len(r.hard()), "kinds": r.kinds, "items": r.items, "stats": r.stats}
    if out:
        o = Path(out)
        o.mkdir(parents=True, exist_ok=True)
        (o / "REPORT.md").write_text(md, "utf-8")
        (o / "report.json").write_text(json.dumps(js, ensure_ascii=False, indent=1), "utf-8")
    print(md)
    if r.hard() or (strict and r.items):
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())

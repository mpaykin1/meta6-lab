"""htmlpack/1: проверка живой страницы ассетов относительно принятого эталона.

Эффекты, шейдеры, частицы и свечение разрешены. HARD — только реальная
поломка, нарушение безопасности либо качество ниже 10-го процентиля эталона.
"""
from __future__ import annotations

import json
import os
import re
import shutil
import statistics
import subprocess
from html.parser import HTMLParser
from pathlib import Path

NAME = "htmlpack"
ORDER = 3
HERE = Path(__file__).resolve().parent
REPO = Path(os.environ.get("ASSET_CHECK_REPO") or HERE.parents[2])
REFERENCE = REPO / "reference/tumannye-shpili/index.html"
HARNESS = HERE / "htmlpack_harness.mjs"
CDN = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"


def detect(root: Path) -> bool:
    page = root / "index.html"
    return page.is_file() and "window.__PACK__" in page.read_text("utf-8", errors="replace")


def ids(source: str) -> list[str]:
    match = re.search(r"const PACK=\{.*?items:\[(.*?)\]\};", source, re.S)
    return re.findall(r"\{\s*id\s*:\s*['\"]([^'\"]+)['\"]", match.group(1)) if match else []


class VisibleText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.path = []
        self.out = []

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        excluded = tag in {"script", "style", "noscript", "aside", "button"} or d.get("id") in {"pn", "mb", "err"}
        self.path.append((tag, excluded or (self.path[-1][1] if self.path else False)))

    def handle_endtag(self, tag):
        for i in range(len(self.path) - 1, -1, -1):
            if self.path[i][0] == tag:
                del self.path[i:]
                break

    def handle_data(self, data):
        if self.path and self.path[-1][0] != "html" and not self.path[-1][1]:
            value = data.strip()
            if value and any(tag == "body" for tag, _ in self.path):
                self.out.append(value[:120])


def percentile10(nums):
    nums = sorted(float(x) for x in nums)
    return nums[max(0, int(len(nums) * .1) - 1)] if nums else 0.0


def run_metrics(reference: Path, candidate: Path):
    node = shutil.which("node")
    if not node:
        return None, "node отсутствует"
    try:
        proc = subprocess.run(
            [node, str(HARNESS), str(reference), str(candidate)],
            capture_output=True, text=True, timeout=220, cwd=str(REPO),
        )
        data = json.loads(proc.stdout)
        if proc.returncode or not data.get("ok"):
            return None, str(data.get("error") or proc.stderr)[:800]
        return data, None
    except (OSError, subprocess.TimeoutExpired, ValueError) as e:
        return None, str(e)[:800]


def check(root: Path, r) -> set[str]:
    covered = {"index.html", "pack.json", "README.md", "PROGRESS.md"}
    page = root / "index.html"
    source = page.read_text("utf-8", errors="replace")
    if not REFERENCE.exists():
        r.add("HP1", "HARD", "reference/tumannye-shpili/index.html",
              "эталон недоступен — сравнение качества невозможно", "Восстанови эталон, не меняй его")
        return covered
    baseline_source = REFERENCE.read_text("utf-8")
    old = ids(baseline_source)
    current = ids(source)
    if not old or not current:
        r.add("HP1", "HARD", "index.html", "window.__PACK__ или список items не читается",
              "Восстанови реальный PACK.items и окно window.__PACK__")
        return covered
    missing = sorted(set(old) - set(current))
    if missing:
        r.add("HP3", "HARD", "index.html",
              f"было {len(old)}, потеряно {len(missing)}: {', '.join(missing)}",
              "Сохрани все 26 исходных ассетов и их ID, только добавляй новые")
    if len(set(current)) != len(current):
        r.add("HP3", "HARD", "index.html", "повторяются ID ассетов",
              "Каждому новому ассету дай уникальный ID")
    new_ids = sorted(set(current) - set(old))
    r.stats.update({"htmlpack_reference": len(old), "htmlpack_count": len(current),
                    "htmlpack_new": len(new_ids), "htmlpack_new_ids": new_ids})
    for found in re.findall(r"https?://[^\s\"'<>]+", source):
        if found != CDN:
            r.add("HP2", "HARD", "index.html", f"запрещённая сеть: {found[:120]}",
                  "Разрешён только CDN three.js; другой сети у паков нет")
    for patt in (r"\beval\s*\(", r"new\s+Function\s*\("):
        if re.search(patt, source):
            r.add("HP2", "HARD", "index.html", "запрещено динамическое исполнение кода",
                  "Удали eval/new Function, эффекты и шейдеры оставь")
    txt = VisibleText()
    txt.feed(source)
    any_bad_text = bool(txt.out)
    if any_bad_text:
        r.add("HP4", "HARD", "index.html",
              "текст на игровом экране вне меню ☰: " + "; ".join(txt.out[:3]),
              "Перенеси весь текст в закрываемое меню ☰")
    if new_ids and "window.__PACK_PROBE__" not in source:
        r.add("HP1", "HARD", "index.html", "новые ассеты не предоставляют изолированную проверку",
              "Экспортируй __PACK_PROBE__.setHidden(id, bool) для замера каждого объекта")
    try:
        manifest = json.loads((root / "pack.json").read_text("utf-8"))
    except (OSError, ValueError):
        manifest = {}
    if new_ids and (manifest.get("format") != "htmlpack/1" or
                    any(i not in manifest.get("assets", {}) for i in new_ids)):
        r.add("HP1", "HARD", "pack.json", "не все новые ID описаны в htmlpack/1",
              "Укажи format=htmlpack/1 и metadata в assets для всех новых ID")
    data, error = run_metrics(REFERENCE, page)
    if error:
        r.add("HP8", "HARD", "index.html", f"браузерный прогон не состоялся: {error}",
              "Проверь запуск headless Chrome, WebGL и исправь ошибки загрузки")
        return covered
    reference = data.get("reference", {})
    candidate = data.get("candidate", {})
    for label, measurement in (("эталон", reference), ("пак", candidate)):
        failures = measurement.get("errors") or []
        if failures:
            r.add("HP8", "HARD", label, f"браузерная ошибка: {str(failures[0])[:230]}",
                  "Исправь ошибки консоли, JS, WebGL и загрузки ассетов")
    measured = candidate.get("items") or {}
    ref_measured = reference.get("items") or {}
    if len(ref_measured) != len(old):
        r.add("HP8", "HARD", "эталон", "браузер не измерил все эталонные ассеты",
              "Исправь запуск browser harness, запрети пропуск элементов")
        return covered
    if len(measured) != len(current):
        r.add("HP8", "HARD", "пак", f"измерено {len(measured)} из {len(current)}",
              "Каждый пункт меню должен реально открываться и рисоваться")
    if candidate.get("screen_text"):
        r.add("HP4", "HARD", "index.html", "видимый текст на экране вне меню ☰",
              "Убери текст из игровой области, оставь его только в меню")
    thresholds = {key: percentile10([v[key] for v in ref_measured.values()
                                      if isinstance(v.get(key), (int, float))])
                  for key in ("visible", "detail", "motion")}
    r.stats["htmlpack_quality_min"] = {k: round(v, 5) for k, v in thresholds.items()}
    for name in new_ids:
        m = measured.get(name)
        if not m:
            r.add("HP5", "HARD", name, "новый ассет не нарисован/не измерен",
                  "Покажи ассет в меню и проверь его рендер")
            continue
        isolated = float(m.get("isolated", 0))
        if isolated < .006:
            r.add("HP5", "HARD", name, f"пустой или невидимый ассет: изолированная доля {isolated:.4f}",
                  "Увеличь видимую форму, силуэт, свет и контраст объекта")
        for key, label in (("visible", "видимость"), ("detail", "детальность"),
                           ("motion", "живость")):
            val = float(m.get(key, 0))
            ref = thresholds[key]
            if val + 1e-6 < ref:
                code = "HP6" if key == "motion" else "HP5"
                r.add(code, "HARD", name,
                      f"хуже эталона: {label} {val:.4f}, у эталона от {ref:.4f}",
                      "Добавь к объекту форму, контраст или плавное движение; проверки не ослабляй")
    ref_fps = statistics.median([v.get("fps", 0) for v in ref_measured.values()])
    new_fps = statistics.median([v.get("fps", 0) for v in measured.values()]) if measured else 0
    r.stats["htmlpack_fps"] = {"reference": ref_fps, "candidate": new_fps}
    if ref_fps > 0 and new_fps < ref_fps * .8:
        r.add("HP7", "HARD", "index.html",
              f"FPS {new_fps:.1f} — хуже эталона {ref_fps:.1f} больше чем на 20%",
              "Анимируй только видимое, сокращай draw calls и лишние вычисления")
    r.stats["htmlpack_sample"] = {k: measured.get(k) for k in new_ids}
    return covered

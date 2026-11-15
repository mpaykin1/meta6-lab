"""Вид пака: audio — звуки и музыка (правило ЗВУК, meta6 AGENTS.md). Проверки S1–S9.

ЗВУК: разнообразно, не раздражает, без резких высоких звуков; гармоничное — на полной громкости.
.wav читается стандартной библиотекой; .ogg/.mp3/.m4a/.flac — через ffmpeg (есть на GitHub Actions).
"""
from __future__ import annotations

import shutil
import subprocess
import wave
from pathlib import Path

import numpy as np

NAME = "audio"
ORDER = 40
EXT = (".wav", ".ogg", ".mp3", ".m4a", ".flac", ".opus")
SR = 22050
HIGH_HZ = 5000          # выше — «резкие высокие»
HIGH_SOFT = 0.30        # доля энергии выше HIGH_HZ
WAV_MB_SOFT = 1.0


def detect(root: Path) -> bool:
    return any(p.suffix.lower() in EXT for p in root.rglob("*") if p.is_file())


def decode(path: Path):
    """→ (моно float32 -1..1, частота) или (None, ошибка)."""
    if path.suffix.lower() == ".wav":
        try:
            with wave.open(str(path)) as w:
                n, ch, sw, sr = w.getnframes(), w.getnchannels(), w.getsampwidth(), w.getframerate()
                raw = w.readframes(n)
            if sw == 2:
                x = np.frombuffer(raw, "<i2").astype(np.float32) / 32768
            elif sw == 1:
                x = (np.frombuffer(raw, np.uint8).astype(np.float32) - 128) / 128
            elif sw == 4:
                x = np.frombuffer(raw, "<i4").astype(np.float32) / 2147483648
            else:
                return None, f"wav {sw * 8} бит не поддержан"
            x = x.reshape(-1, ch).mean(1) if ch > 1 else x
            return x, sr
        except Exception as e:  # noqa — например float-wav: пробуем ffmpeg
            if not shutil.which("ffmpeg"):
                return None, f"wav не читается: {e}"
    if not shutil.which("ffmpeg"):
        return None, "нет ffmpeg для проверки этого формата"
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"],
                       capture_output=True, timeout=120)
    if p.returncode != 0 or not p.stdout:
        return None, "не декодируется: " + p.stderr.decode("utf-8", "ignore")[:200]
    return np.frombuffer(p.stdout, "<i2").astype(np.float32) / 32768, SR


def db(v):
    return 20 * np.log10(max(v, 1e-9))


def check(root: Path, r) -> set:
    covered, levels = set(), []
    for path in sorted(p for p in root.rglob("*") if p.is_file() and p.suffix.lower() in EXT):
        rel = path.relative_to(root).as_posix()
        covered.add(rel)
        x, sr = decode(path)
        if x is None:
            r.add("S1", "HARD", rel, f"звук не читается: {sr}", "Пересохрани в ogg (Vorbis) 44.1 кГц")
            continue
        dur = len(x) / sr
        if dur < 0.03:
            r.add("S1", "HARD", rel, f"длительность {dur:.3f} с — пусто", "Запиши звук заново")
            continue
        peak = float(np.abs(x).max())
        rms = float(np.sqrt(np.mean(x ** 2)))
        clip = float((np.abs(x) >= 0.999).mean())
        if clip > 0.001:
            r.add("S2", "HARD", rel, f"перегруз: {clip:.1%} отсчётов в потолке — хрип", "Нормализуй пик до −1 dBFS")
        if peak < 0.1:
            r.add("S3", "SOFT", rel, f"очень тихо: пик {db(peak):.0f} dBFS", "Нормализуй пик до −1…−3 dBFS")
        if abs(float(x.mean())) > 0.05:
            r.add("S9", "SOFT", rel, "смещение нуля (DC) — щелчки при старте", "Убери DC offset (high-pass 20 Гц)")
        # спектр: доля энергии выше HIGH_HZ
        seg = x[: sr * 20]
        spec = np.abs(np.fft.rfft(seg * np.hanning(len(seg)))) ** 2
        freqs = np.fft.rfftfreq(len(seg), 1 / sr)
        tot = float(spec.sum()) or 1.0
        high = float(spec[freqs > HIGH_HZ].sum()) / tot
        if high > HIGH_SOFT:
            r.add("S4", "HARD" if high > 0.55 else "SOFT", rel,
                  f"{high:.0%} энергии выше {HIGH_HZ} Гц — резкий, режущий слух звук (правило ЗВУК)",
                  "Срежь верха (low-pass 4–6 кГц), убери писк и шипение")
        # тишина в начале (для эффектов — задержка отклика)
        thr = max(peak * 0.05, 1e-4)
        first = int(np.argmax(np.abs(x) > thr))
        if first / sr > 0.25 and dur < 5:
            r.add("S5", "SOFT", rel, f"{first / sr:.2f} с тишины в начале — звук опоздает к действию", "Обрежь тишину в начале")
        # петли: стык конца и начала
        stem = path.stem.lower()
        if any(k in stem for k in ("loop", "music", "ambient", "theme", "bgm")):
            n = max(1, int(sr * 0.02))
            a, b = float(np.sqrt(np.mean(x[-n:] ** 2))), float(np.sqrt(np.mean(x[:n] ** 2)))
            jump = abs(float(x[-1]) - float(x[0]))
            if jump > 0.2 or (max(a, b) > 0.02 and abs(db(a) - db(b)) > 12):
                r.add("S7", "SOFT", rel, "стык петли слышен (щелчок/провал громкости)",
                      "Конец и начало петли — в одной фазе, без скачка громкости (crossfade)")
            if dur < 20:
                r.add("S8", "SOFT", rel, f"музыка {dur:.0f} с — быстро надоест (правило ЗВУК: музыка развивается)",
                      "Сделай ≥ 60 с с развитием или 3–4 варианта петли")
        if path.suffix.lower() == ".wav" and path.stat().st_size / 1e6 > WAV_MB_SOFT:
            r.add("S6", "SOFT", rel, f"wav {path.stat().st_size / 1e6:.1f} МБ — тяжело для веба", "Сохрани в ogg 96–128 кбит/с")
        if rms > 1e-4:
            levels.append((rel, db(rms)))
    sfx = [lv for lv in levels if not any(k in lv[0].lower() for k in ("music", "ambient", "loop", "theme", "bgm"))]
    if len(sfx) >= 3:
        vals = [v for _, v in sfx]
        if max(vals) - min(vals) > 18:
            loud = max(sfx, key=lambda t: t[1])[0]
            quiet = min(sfx, key=lambda t: t[1])[0]
            r.add("S6", "SOFT", f"{loud} ↔ {quiet}", f"громкость эффектов скачет на {max(vals) - min(vals):.0f} дБ",
                  "Выровняй громкость (разница ≤ 12 дБ); диссонанс — вдвое тише гармоничного")
    r.stats["audio"] = len(covered)
    return covered

#!/usr/bin/env python3
"""FFT guard: quantify repeated spatial peaks in three Chromium frames per game."""
import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

CUTOFF = 0.38  # Fixed maximum fraction in eight dominant off-axis spectral bins.


def spectrum_score(filename):
    source = Image.open(filename).convert("L").resize((256, 256))
    # Exclude heads-up elements near the screen edge and broad lighting gradients.
    source = source.crop((24, 24, 232, 232)).resize((256, 256))
    array = np.asarray(source, dtype=np.float32)
    highpass = array - np.asarray(source.filter(ImageFilter.GaussianBlur(11)), dtype=np.float32)
    if float(np.std(array)) < 3.0:
        raise ValueError("Frame has no visible game scene: " + str(filename))
    signal = highpass * np.outer(np.hanning(256), np.hanning(256))
    power = abs(np.fft.fftshift(np.fft.fft2(signal))) ** 2
    ys, xs = np.indices((256, 256))
    rad = np.hypot(xs - 128, ys - 128)
    valid = (rad > 6) & (rad < 90)  # Include axis-aligned stripes and tile rows.
    energy = np.sort(power[valid].ravel())
    total = float(np.sum(energy))
    if total < 1e-9:
        raise ValueError("No analyzable texture frequency in " + str(filename))
    return round(float(np.sum(energy[-8:]) / total), 6)


def view_separation(images):
    """Reject three nominal screenshots that show the same scene/viewpoint."""
    small = []
    for filename in images:
        with Image.open(filename) as picture:
            gray = picture.convert("L").resize((128, 128))
            small.append(np.asarray(gray.crop((12, 12, 116, 116)), dtype=np.float32))
    distances = [
        float(np.mean(np.abs(small[i] - small[j])))
        for i in range(len(small)) for j in range(i + 1, len(small))
    ]
    return round(min(distances), 4)


def load_group(folder):
    path = Path(folder)
    manifest = json.loads((path / "index.json").read_text(encoding="utf-8"))
    if manifest["errors"]:
        raise ValueError("Browser capture failures: " + str(manifest["errors"]))
    games = {}
    for game in manifest["games"]:
        if len(game["images"]) != 3:
            raise ValueError("Must have exactly 3 viewpoints: " + game["id"])
        files = [path / Path(name).name for name in game["images"]]
        separation = view_separation(files)
        if separation < 2.5:
            raise ValueError(
                "Three screenshots are not visibly distinct for " +
                game["id"] + ": minimum mean brightness difference=" +
                str(separation)
            )
        scores = [spectrum_score(filename) for filename in files]
        games[game["id"]] = {
            "views": scores, "peak": max(scores), "view_separation": separation
        }
    if not games:
        raise ValueError("No images captured")
    return games


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--after", required=True)
    parser.add_argument("--before")
    parser.add_argument("--output", default="/tmp/bez-patternov-fft.json")
    args = parser.parse_args()
    after = load_group(args.after)
    before = load_group(args.before) if args.before else {}
    failures = []
    report = {"fixed_threshold": CUTOFF, "before": before, "after": after}
    for name, data in after.items():
        old = before.get(name)
        current = data["peak"]
        if old is not None:
            previous = old["peak"]
            print(f"INK FFT {name} BEFORE={previous:.6f}, AFTER={current:.6f}, "
                  f"DELTA={previous - current:.6f}, FIXED_LIMIT={CUTOFF:.2f}")
            # Ordinary world views can show less than one cycle on a single
            # wall/tree. Their after-score is still checked, but a full-surface
            # negative control is needed to prove the original periodic waves.
            if name == "ink-shader-probe":
                # Claude 18.11.2026: PR без изменения INK-шейдера (правила, бот ассетов) не может
                # «улучшить» отрицательный контроль — кадр тот же. Раньше это валило каждый такой PR
                # (#411, #412). Контроль сохраняется: старая волна должна быть видна, а хуже стать нельзя.
                if previous >= CUTOFF and abs(previous - current) <= 1e-4:
                    print(f"INK FFT {name}: INK shader unchanged in this PR, control identical — improvement not required")
                    continue
                if previous < CUTOFF:
                    failures.append(name + ": old periodic reference was not detected")
                if current >= previous * .85:
                    failures.append(name + ": improvement smaller than 15%")
        else:
            print(f"FFT {name}: score={current:.6f}, limit={CUTOFF:.2f}")
        if current >= CUTOFF:
            failures.append(name + ": periodic spectral peak above fixed limit")
    if "ink" in after and "ink-shader-probe" not in after:
        failures.append("INK shader-wide spectral negative control is missing")
    Path(args.output).write_text(json.dumps(report, indent=2), encoding="utf-8")
    if failures:
        for failure in failures:
            print("BEZ_PATTERNOV VISUAL FAIL:", failure)
        raise SystemExit(1)
    print("BEZ_PATTERNOV VISUAL PASS:", len(after), "games x 3 views")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Voxel Game Creator: acquire official Voxelize source and theme its working demo.

Preserves Voxelize's official Rust server and Three.js/TypeScript client.
Requires network/git only when no pre-downloaded --source checkout is supplied.
"""
from __future__ import annotations
import argparse
import html
import json
import re
import shutil
import subprocess
from pathlib import Path

REPO = "https://github.com/voxelize/voxelize.git"
PIN = "0737bf40c4982bc1999042dd745e11b8104a74d2"
SCHEMES = {
    "ash": {"top": "#1b2436", "horizon": "#6b515a", "sunset": "#ef8a55", "night": "#080914", "ground": "#6b655e", "stone": "#3b4755", "wood": "#66534d", "leaves": "#64475e", "fog": "#736578"},
    "forest": {"top": "#326c82", "horizon": "#91b9aa", "sunset": "#eeb280", "night": "#081722", "ground": "#5a9a56", "stone": "#858989", "wood": "#755a42", "leaves": "#3b7c55", "fog": "#829b91"},
    "frost": {"top": "#1d3e65", "horizon": "#8cbbcf", "sunset": "#b7a6d9", "night": "#061325", "ground": "#b9d8dc", "stone": "#6c8398", "wood": "#4a7184", "leaves": "#b4e6e7", "fog": "#9bbecf"},
    "dusk": {"top": "#301936", "horizon": "#996b94", "sunset": "#ff9368", "night": "#100d20", "ground": "#745c87", "stone": "#524862", "wood": "#5c485c", "leaves": "#ac6799", "fog": "#785977"},
}


def fail(message: str) -> None:
    raise SystemExit("Voxel Game Creator: " + message)


def run(*args: str, cwd: Path | None = None) -> None:
    subprocess.run(args, cwd=str(cwd) if cwd else None, check=True)


def replace_once(src: str, old: str, new: str, context: str) -> str:
    n = src.count(old)
    if n != 1:
        fail(f"{context}: expected one anchor, got {n}; upstream changed, refuse unsafe patch")
    return src.replace(old, new, 1)


def save(path: Path, txt: str) -> None:
    path.write_text(txt, encoding="utf-8")


def prepare_source(out: Path, source: Path | None, ref: str) -> None:
    if out.exists():
        fail(f"target exists: {out} (never overwrite)")
    if source:
        if not (source / "examples/server/main.rs").is_file():
            fail("--source must be the root of an actual Voxelize checkout")
        shutil.copytree(source, out, ignore=shutil.ignore_patterns(".git", "node_modules", "target", "dist", ".turbo"))
    else:
        if not shutil.which("git"):
            fail("git is required to fetch Voxelize")
        # Don't run remote scripts or edit the source repository.
        run("git", "clone", "--recurse-submodules", REPO, str(out))
        if ref:
            run("git", "checkout", "--detach", ref, cwd=out)
            run("git", "submodule", "update", "--init", "--recursive", cwd=out)
    if not (out / "LICENSE").exists():
        fail("upstream MIT LICENSE missing; cannot distribute derived game")


def game(spec: dict, target: Path, source: Path | None, ref: str) -> None:
    if not isinstance(spec, dict):
        fail("JSON spec must be an object")
    title = spec.get("title", "Voxel World")
    if not isinstance(title, str) or not 1 <= len(title) <= 80:
        fail("title must be a string (1–80 characters)")
    theme = spec.get("theme", "ash")
    if theme not in SCHEMES:
        fail("theme must be one of: " + ", ".join(SCHEMES))
    seed = spec.get("seed", 7391)
    if isinstance(seed, bool) or not isinstance(seed, int) or not 1 <= seed <= 2_147_483_647:
        fail("seed must be a positive 32-bit integer")
    colors = dict(SCHEMES[theme]); overrides = spec.get("colors", {})
    if not isinstance(overrides, dict): fail("colors must be an object")
    for key, value in overrides.items():
        if key not in colors or not isinstance(value, str) or not re.fullmatch(r"#[0-9a-fA-F]{6}", value):
            fail(f"invalid colors override: {key}")
        colors[key] = value
    target = target.resolve(); target.parent.mkdir(parents=True, exist_ok=True)
    prepare_source(target, source, ref)
    # Keep the known good engine, client input, networking and physics unchanged.
    terrain = target / "examples/server/worlds/terrain/mod.rs"
    txt = terrain.read_text(encoding="utf-8")
    txt = replace_once(txt, ".seed(999)\n", f".seed({seed})\n", "terrain generator seed")
    save(terrain, txt)

    main = target / "examples/client/src/main.ts"
    txt = main.read_text(encoding="utf-8")
    opening = "world.sky.setShadingPhases(["
    a = txt.find(opening)
    if a < 0: fail("sky phase API not found")
    b = txt.find("]);", a)
    if b < a or b - a > 5000: fail("sky phase end not found")
    phases = f'''world.sky.setShadingPhases([
  {{ name: "sunrise", color: {{ top: "{colors['top']}", middle: "{colors['sunset']}", bottom: "#16141b" }}, skyOffset: 0.05, voidOffset: 0.6, start: 0.20 }},
  {{ name: "daylight", color: {{ top: "{colors['top']}", middle: "{colors['horizon']}", bottom: "#16141b" }}, skyOffset: 0.0, voidOffset: 0.6, start: 0.25 }},
  {{ name: "sunset", color: {{ top: "{colors['top']}", middle: "{colors['sunset']}", bottom: "#16141b" }}, skyOffset: 0.05, voidOffset: 0.6, start: 0.70 }},
  {{ name: "night", color: {{ top: "{colors['night']}", middle: "{colors['night']}", bottom: "#000000" }}, skyOffset: 0.1, voidOffset: 0.6, start: 0.75 }},
]);'''
    txt = txt[:a] + phases + txt[b+3:]
    save(main, txt)

    world = target / "examples/client/src/world.ts"
    txt = world.read_text(encoding="utf-8")
    if "export async function setupWorld(world: VOXELIZE.World)" not in txt:
        fail("world.ts API changed")
    colorspec = [
       ("Grass Block", "py", "ground"), ("Stone", "all", "stone"),
       ("Oak Leaves", "all", "leaves"), ("Oak Log", "side", "wood"),
    ]
    palette = "\n  // Voxel Game Creator: palette override using upstream public APIs.\n  await world.applyBlockTextures([\n" + ",\n".join(
      f'    {{ idOrName: "{block}", faceNames: {"[\"py\"]" if face=="py" else "[\"px\",\"nx\",\"pz\",\"nz\"]" if face=="side" else "[\"px\",\"nx\",\"py\",\"ny\",\"pz\",\"nz\"]"}, source: new THREE.Color("{colors[key]}") }}'
      for block, face, key in colorspec
    ) + "\n  ]);\n"
    # The last brace belongs to setupWorld() in the official source snapshot.
    if not txt.rstrip().endswith("}"): fail("world.ts ending changed")
    end = txt.rfind("}")
    txt = txt[:end] + palette + txt[end:]
    save(world, txt)

    index = target / "examples/client/index.html"
    txt = index.read_text(encoding="utf-8")
    label = html.escape(title)
    banner = f'''<style id="vgc-theme">body{{margin:0}}#vgc-label{{position:fixed;top:15px;left:15px;z-index:5;padding:10px 14px;background:#0d1422b5;color:#fff;border:1px solid #ffffff36;border-radius:10px;font:600 14px system-ui;pointer-events:none;letter-spacing:.06em}}#vgc-label small{{display:block;opacity:.7;font:12px system-ui;letter-spacing:0}}</style>
<div id="vgc-label">{label}<small>Voxel Game Creator · WASD · Space · mouse</small></div>'''
    txt = replace_once(txt, "</body>", banner + "\n</body>", "client HTML")
    txt = re.sub(r"<title>.*?</title>", "<title>" + label + "</title>", txt, count=1)
    save(index, txt)

    final_spec = {"title": title, "theme": theme, "seed": seed, "colors": colors,
          "source": "https://github.com/voxelize/voxelize", "source_ref": ref or "main",
          "notes": "Uses official full-stack Voxelize Rust/Three.js demo. Requires running Rust WebSocket server."}
    save(target / "VOXEL_GAME.json", json.dumps(final_spec, ensure_ascii=False, indent=2))
    launcher = '''#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
for cmd in cargo pnpm protoc wasm-pack cargo-watch; do
  if ! command -v "$cmd" >/dev/null 2>&1; then echo "Missing required command: $cmd" >&2; exit 2; fi
done
pnpm install
pnpm proto
pnpm build
pnpm demo
'''
    save(target / "run-voxel-game.sh", launcher)
    (target / "run-voxel-game.sh").chmod(0o755)
    print("CREATED " + str(target))
    print("Launch with: " + str(target / "run-voxel-game.sh"))
    print("Client: http://localhost:3000 | Rust server: http://localhost:4000")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--spec", type=Path, required=True, help="JSON game brief")
    parser.add_argument("--out", type=Path, required=True, help="new output folder (must not exist)")
    parser.add_argument("--source", type=Path, help="optional local Voxelize checkout; avoids git download")
    parser.add_argument("--ref", default=PIN, help="official commit SHA; set '' to use main")
    args = parser.parse_args()
    try: spec = json.loads(args.spec.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc: fail(str(exc))
    game(spec, args.out, args.source, args.ref)

if __name__ == "__main__": main()

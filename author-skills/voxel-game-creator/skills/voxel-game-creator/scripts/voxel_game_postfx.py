#!/usr/bin/env python3
"""Optional cinematic Lumenwild mode layered safely over the CURRENT VGC router.

Works with all current/new Voxel Game Creator engines. Native renderer and
original engine paths remain unchanged when --postfx-mode off or unavailable.
"""
from __future__ import annotations
import argparse
import json
import os
import shutil
import sys
import tempfile
from pathlib import Path
from create_game import fail
from postfx_bridge import install
import voxel_game


def get_option(args: list[str], name: str) -> str | None:
    for i, item in enumerate(args):
        if item == name: return args[i + 1] if i + 1 < len(args) else None
        if item.startswith(name + '='): return item.split('=', 1)[1]
    return None


def replace_option(args: list[str], name: str, value: str) -> list[str]:
    out = []
    skip = False
    for item in args:
        if skip:
            skip = False
            continue
        if item == name:
            out.extend((item, value))
            skip = True
        elif item.startswith(name + '='):
            out.append(name + '=' + value)
        else:
            out.append(item)
    return out


def main() -> None:
    original = list(sys.argv)
    src = original[1:]
    filtered = []
    mode = 'off'
    i = 0
    while i < len(src):
        if src[i] == '--postfx-mode':
            if i + 1 >= len(src): fail('--postfx-mode requires off|auto|required')
            mode = src[i + 1]
            i += 2
        elif src[i].startswith('--postfx-mode='):
            mode = src[i].split('=', 1)[1]
            i += 1
        else:
            filtered.append(src[i])
            i += 1
    if mode not in ('off', 'auto', 'required'):
        fail('--postfx-mode accepts off|auto|required')
    if mode == 'off':
        sys.argv = [original[0], *filtered]
        try: voxel_game.main()
        finally: sys.argv = original
        return
    out_arg = get_option(filtered, '--out')
    if not out_arg: fail('Postprocessing integration requires --out')
    dest = Path(out_arg).resolve()
    if dest.exists(): fail('Output exists; refusing overwrite: ' + str(dest))
    engine = get_option(filtered, '--engine')
    if not engine:
        spec_path = get_option(filtered, '--spec')
        if not spec_path: fail('Postprocessing integration requires --spec')
        try: engine = json.loads(Path(spec_path).read_text(encoding='utf8')).get('engine', 'browser')
        except (OSError, ValueError) as error: fail('Failed to load engine from spec: ' + str(error))
    if mode == 'required' and engine not in ('browser', 'both', 'all'):
        fail('Postprocessing pmndrs supports Lumenwild WebGL only (--engine browser|both|all)')

    dest.parent.mkdir(parents=True, exist_ok=True)
    stage = Path(tempfile.mkdtemp(prefix='.vgc-postfx-', dir=dest.parent))
    staged_output = stage / 'game'
    try:
        new_args = replace_option(filtered, '--out', str(staged_output))
        sys.argv = [original[0], *new_args]
        voxel_game.main()  # Full current router, including Veloren, unchanged.
        target = staged_output / 'browser' if engine in ('both', 'all') else staged_output
        result = install(target, 'browser' if engine in ('browser', 'both', 'all') else str(engine), mode=mode)
        os.replace(staged_output, dest)
        print('VGC Postprocessing: ' + json.dumps(result, ensure_ascii=False))
    finally:
        sys.argv = original
        shutil.rmtree(stage, ignore_errors=True)


if __name__ == '__main__': main()

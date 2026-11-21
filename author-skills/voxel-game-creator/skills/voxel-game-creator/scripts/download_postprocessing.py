#!/usr/bin/env python3
"""Optional exact-revision source checkout of Zlib pmndrs/postprocessing.

No full source is bundled in the skill archive. External network required.
"""
from __future__ import annotations
import argparse
from pathlib import Path
import shutil
import subprocess
from create_game import fail
from postfx_bridge import PIN, UPSTREAM


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--out', required=True, type=Path)
    args = p.parse_args()
    dst = args.out.resolve()
    if dst.exists(): fail('Source destination exists: ' + str(dst))
    if not shutil.which('git'): fail('git unavailable')
    try:
        subprocess.run(['git', 'clone', '--filter=blob:none', UPSTREAM, str(dst)],
                       check=True, timeout=180)
        subprocess.run(['git', '-C', str(dst), 'checkout', '--detach', PIN],
                       check=True, timeout=180)
        head = subprocess.check_output(['git', '-C', str(dst), 'rev-parse', 'HEAD'],
                                       text=True, timeout=10).strip()
        if head != PIN: fail('Source SHA differs from pinned revision')
        if not (dst/'LICENSE.md').is_file(): fail('Postprocessing Zlib license missing')
        print('SOURCE', str(dst), head)
    except (OSError, subprocess.SubprocessError) as error:
        shutil.rmtree(dst, ignore_errors=True)
        fail('Source checkout failed: ' + str(error))

if __name__ == '__main__': main()

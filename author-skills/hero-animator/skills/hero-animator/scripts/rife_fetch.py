#!/usr/bin/env python3
"""Fetch the pinned MIT-licensed RIFE source. Does not download model weights."""
from __future__ import annotations
import argparse
import subprocess
from pathlib import Path

REPO = 'https://github.com/hzwer/ECCV2022-RIFE.git'
COMMIT = '5d8adbdd40e12c2c8f91930eff838aebe561c086'


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('destination', type=Path)
    args = p.parse_args(argv)
    out = args.destination.resolve()
    if out.exists():
        p.error('Refusing to overwrite existing source checkout')
    out.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(['git', 'clone', '--no-checkout', '--filter=blob:none', REPO, str(out)], check=True)
    try:
        subprocess.run(['git', '-C', str(out), 'checkout', '--detach', COMMIT], check=True)
        got = subprocess.check_output(['git', '-C', str(out), 'rev-parse', 'HEAD'], text=True).strip()
        if got != COMMIT:
            raise ValueError('RIFE revision mismatch')
        if not (out / 'LICENSE').is_file() or not (out / 'model' / 'RIFE.py').is_file():
            raise ValueError('Incomplete upstream RIFE checkout')
    except Exception:
        import shutil
        shutil.rmtree(out)
        raise
    print('Fetched official RIFE source at pinned revision: ' + got)


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""Fetch pinned MIT-licensed rembg source for optional local installation.

Does not fetch or license third-party neural-network weights. Never uses paid cloud models.
"""
from __future__ import annotations
import argparse
import shutil
import subprocess
from pathlib import Path

REPO = 'https://github.com/danielgatis/rembg.git'
COMMIT = '991927b77667946dab59c50df31f7d4640e80457'


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('destination', type=Path)
    a = p.parse_args(argv)
    out = a.destination.resolve()
    if out.exists():
        p.error('Refusing to overwrite existing directory')
    out.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(['git', 'clone', '--no-checkout', '--filter=blob:none', REPO, str(out)], check=True)
    try:
        subprocess.run(['git', '-C', str(out), 'checkout', '--detach', COMMIT], check=True)
        actual = subprocess.check_output(['git', '-C', str(out), 'rev-parse', 'HEAD'], text=True).strip()
        if actual != COMMIT or not (out / 'rembg' / '__init__.py').is_file():
            raise ValueError('Incomplete or unexpected rembg source revision')
        print('Downloaded pinned rembg source: ' + actual)
    except Exception:
        shutil.rmtree(out, ignore_errors=True)
        raise


if __name__ == '__main__':
    main()

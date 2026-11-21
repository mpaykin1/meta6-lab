#!/usr/bin/env python3
"""Register user-provided Ink stories in a separate Rete workbench; never mutate original games.

Compilation is by the pinned `inkjs/full` npm compiler in the workbench script.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import sys

SCHEMA = 'meta-game-fusion.ink-source-list.v1'
ID = re.compile(r'^[A-Za-z][A-Za-z0-9_-]{0,63}$')
TAG = re.compile(r'^(flag|item):[A-Za-z_][A-Za-z0-9_]{0,63}$')
VAR = re.compile(r'^[A-Za-z_][A-Za-z0-9_]{0,63}$')


def add(args: argparse.Namespace) -> None:
    root = Path(args.workbench).expanduser().resolve(strict=True)
    source = Path(args.source).expanduser().resolve(strict=True)
    if not ID.fullmatch(args.id):
        raise ValueError('Story ID must be ASCII letters, numbers, underscores or dashes')
    if source.suffix.lower() != '.ink' or not source.is_file() or source.is_symlink():
        raise ValueError('Expected an ordinary .ink file')
    if source.stat().st_size > 1_000_000:
        raise ValueError('Story input too large')
    store = root / 'stories-src'
    target = store / f'{args.id}.ink'
    registry = store / 'story-list.json'
    if not store.is_dir() or store.is_symlink() or not registry.is_file() or registry.is_symlink():
        raise ValueError('Expected workbench created with rete_bridge.py prepare')
    if target.exists() and not args.replace:
        raise ValueError('Story ID exists. Use --replace explicitly to update and invalidate old graphs')
    if root == source or root in source.parents:
        raise ValueError('Source and generated workbench must be separate')
    if target.is_symlink():
        raise ValueError('Refuse symlinked target')
    raw = source.read_bytes()
    try:
        raw.decode('utf-8-sig')
    except UnicodeDecodeError as exc:
        raise ValueError('Ink source must be UTF-8') from exc
    # The npm compiler checks the final byte hash; normalize only the BOM if present.
    raw = raw.removeprefix(b'\xef\xbb\xbf')
    sha = hashlib.sha256(raw).hexdigest()
    entries = json.loads(registry.read_text(encoding='utf-8'))
    if entries.get('schema') != SCHEMA or not isinstance(entries.get('stories'),list):
        raise ValueError('Invalid story source registry')
    if len(entries['stories']) >= 100 and not args.replace:
        raise ValueError('Limit: 100 stories')
    exports = {}
    for entry in args.export:
        if '=' not in entry: raise ValueError('Use --export ink_variable=flag:name')
        variable, target_state = entry.split('=',1)
        if not VAR.fullmatch(variable) or not TAG.fullmatch(target_state):
            raise ValueError('Invalid Ink variable mapping')
        exports[variable] = target_state
    if args.approved and args.rights_basis not in {'owner','permission','compatible-license'}:
        raise ValueError('Rights basis required for reuse approval')
    if args.approved and not args.license:
        raise ValueError('Exact source-content license required')
    entry = {'id':args.id, 'title':args.title[:120], 'source_file':target.name,
             'source_game':args.game[:64], 'source_sha256':sha,
             'approved_for_reuse':bool(args.approved),
             'license':(args.license or 'review_required')[:120], 'exports':exports}
    target_tmp = target.with_suffix('.ink.tmp')
    target_tmp.write_bytes(raw)
    os.replace(target_tmp, target)
    entries['stories'] = [x for x in entries['stories'] if x.get('id') != args.id]
    entries['stories'].append(entry)
    registry_tmp = registry.with_suffix('.json.tmp')
    registry_tmp.write_text(json.dumps(entries,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    os.replace(registry_tmp, registry)
    print(f'Ink source registered: {entry["id"]} ({entry["source_game"]}). Run npm run dev/build to compile it locally.')


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    sub=parser.add_subparsers(dest='cmd',required=True)
    a=sub.add_parser('add',help='Copy an explicitly selected Ink source into workbench; source game is read-only')
    a.add_argument('--workbench',required=True)
    a.add_argument('--source',required=True)
    a.add_argument('--id',required=True)
    a.add_argument('--title',required=True)
    a.add_argument('--game',required=True)
    a.add_argument('--export',action='append',default=[],help='e.g. torch=flag:has_torch')
    a.add_argument('--license',default='review_required')
    a.add_argument('--approved',action='store_true',help='Use only after explicit permissions verification')
    a.add_argument('--rights-basis',choices=['owner','permission','compatible-license'])
    a.add_argument('--replace',action='store_true')
    args=parser.parse_args()
    try:add(args)
    except (ValueError,FileNotFoundError,OSError,UnicodeDecodeError) as exc:parser.exit(2,str(exc)+'\n')
if __name__ == '__main__': main()

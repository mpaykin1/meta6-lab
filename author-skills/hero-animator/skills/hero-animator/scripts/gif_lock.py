#!/usr/bin/env python3
"""Stage/approve/verify immutable user-approved GIFs and extract their exact RGBA frames."""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageSequence


def digest(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for block in iter(lambda: f.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def load(path):
    return json.loads(Path(path).read_text(encoding='utf8'))


def save(path, obj):
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n', encoding='utf8')


def gif_info(path):
    with Image.open(path) as im:
        if im.format != 'GIF':
            raise ValueError('Not a GIF: ' + str(path))
        size = list(im.size)
        durations = []
        for i in range(im.n_frames):
            im.seek(i)
            durations.append(int(im.info.get('duration', 100)))
        return size, im.n_frames, durations


def check(m):
    if m.get('schema') != 'hero-animator-approved-gif-v1':
        raise ValueError('Unrecognized lock file')
    for ent in m.get('assets', []):
        p = Path(ent['source']).resolve()
        if not p.is_file() or digest(p) != ent['sha256']:
            raise ValueError('Original approved GIF changed/missing: ' + str(p))
        size, count, duration = gif_info(p)
        if size != ent['size'] or count != ent['frame_count'] or duration != ent['durations_ms']:
            raise ValueError('Frame metadata changed: ' + str(p))


def stage(args):
    if not args.gifs:
        raise ValueError('Specify actual GIF paths')
    items = []
    names = set()
    for filename in args.gifs:
        p = Path(filename).resolve()
        if not p.is_file() or p.suffix.lower() != '.gif':
            raise ValueError('Missing GIF: ' + str(p))
        if p.name in names:
            raise ValueError('Duplicate basename: ' + p.name)
        names.add(p.name)
        size, count, durations = gif_info(p)
        items.append({'id': p.name, 'source': str(p), 'sha256': digest(p),
                      'size': size, 'frame_count': count, 'durations_ms': durations,
                      'approved': False, 'frames': []})
    save(args.out, {'schema': 'hero-animator-approved-gif-v1', 'assets': items})
    print('STAGED', len(items), 'GIF. Approval required; no game assets are unlocked.')


def approve(args):
    obj = load(args.manifest)
    check(obj)
    ids = set(args.ids)
    known = {a['id'] for a in obj['assets']}
    if not ids or not ids.issubset(known):
        raise ValueError('Specify IDs exactly as listed in stage manifest')
    for a in obj['assets']:
        a['approved'] = a['id'] in ids
        if not a['approved']:
            a['frames'] = []
    save(args.manifest, obj)
    print('LOCKED', len(ids), 'approved source GIF(s). Only use after explicit USER approval.')


def extract(args):
    obj = load(args.manifest)
    check(obj)
    out = Path(args.out).resolve()
    out.mkdir(parents=True, exist_ok=True)
    for ent in obj['assets']:
        if not ent['approved']:
            continue
        sub = out / (hashlib.sha256(ent['id'].encode('utf-8')).hexdigest()[:16])
        sub.mkdir(parents=True, exist_ok=True)
        ent['frames'] = []
        with Image.open(ent['source']) as im:
            for i in range(im.n_frames):
                im.seek(i)
                frame = im.convert('RGBA')  # transparent pixels and visible RGB preserved
                dest = sub / f'{i:04d}.png'
                frame.save(dest, format='PNG', optimize=True)
                ent['frames'].append({'path': str(dest), 'rgba_sha256': hashlib.sha256(frame.tobytes()).hexdigest(),
                                      'duration_ms': ent['durations_ms'][i]})
    save(args.manifest, obj)
    print('EXTRACTED lossless GIF frames from user-approved originals only.')


def verify(args):
    obj = load(args.manifest)
    check(obj)
    approved = [a for a in obj['assets'] if a['approved']]
    if not approved:
        raise ValueError('BLOCKED: no user-approved GIFs')
    known_files = set()
    for a in obj['assets']:
        if not a['approved']:
            if a['frames']:
                raise ValueError('BLOCKED: frames of unapproved GIF')
            continue
        if len(a['frames']) != a['frame_count']:
            raise ValueError('BLOCKED: missing derived frames: ' + a['id'])
        with Image.open(a['source']) as gif:
            for i, f in enumerate(a['frames']):
                p = Path(f['path']).resolve()
                if not p.is_file():
                    raise ValueError('BLOCKED: missing frame ' + str(p))
                known_files.add(p)
                gif.seek(i)
                expected = gif.convert('RGBA')
                with Image.open(p) as read:
                    got = read.convert('RGBA')
                    if got.size != expected.size or got.tobytes() != expected.tobytes():
                        raise ValueError('BLOCKED: modified pixels ' + str(p))
                if hashlib.sha256(expected.tobytes()).hexdigest() != f['rgba_sha256']:
                    raise ValueError('BLOCKED: modified RGBA digest ' + str(p))
                if f['duration_ms'] != a['durations_ms'][i]:
                    raise ValueError('BLOCKED: modified frame timing ' + str(p))
    if args.frames:
        root = Path(args.frames).resolve()
        extras = [p for p in root.rglob('*.png') if p.resolve() not in known_files]
        if extras:
            raise ValueError('BLOCKED: unapproved PNG(s): ' + str(extras[0]))
    print('VERIFIED', len(approved), 'approved GIFs, exact extracted RGBA pixels and frame timing.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    p = sub.add_parser('stage'); p.add_argument('--out', required=True); p.add_argument('gifs', nargs='+'); p.set_defaults(run=stage)
    p = sub.add_parser('approve'); p.add_argument('manifest'); p.add_argument('--ids', nargs='+', required=True); p.set_defaults(run=approve)
    p = sub.add_parser('extract'); p.add_argument('manifest'); p.add_argument('--out', required=True); p.set_defaults(run=extract)
    p = sub.add_parser('verify'); p.add_argument('manifest'); p.add_argument('--frames'); p.set_defaults(run=verify)
    args = parser.parse_args()
    try:
        args.run(args)
    except (ValueError, OSError, KeyError, json.JSONDecodeError) as err:
        parser.exit(2, 'BLOCKED: ' + str(err) + '\n')


if __name__ == '__main__':
    main()

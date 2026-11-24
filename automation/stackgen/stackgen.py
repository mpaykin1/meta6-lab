#!/usr/bin/env python3
"""stackgen — sprite-stacking assets from a TEXT recipe (no skills, no image model).

Why: ChatGPT autotasks cannot run private skills or code. They CAN write a text
file. This script (run by GitHub Actions, free) turns that text recipe into real
RGBA slice strips in the mg-spritestack/1 format, checks them and renders a
preview at 8 angles, exactly like the game draws stacks (1 px per slice).

Usage:  python3 stackgen.py <pack_dir>
Input:  <pack_dir>/recipe.json
Output: <pack_dir>/stacks/<name>.png, <pack_dir>/stack.json,
        <pack_dir>/_check/preview.png, <pack_dir>/_check/REPORT.md
Exit 1 if any HARD check fails.

recipe.json:
{
 "game": "nebesny-pilot", "lane": "A", "author": "MG-строитель-1",
 "assets": {
  "lighthouse": {
   "slice": [32,32], "count": 18, "role": "landmark", "label_ru": "Маяк",
   "anim": {"type":"spin","speed":0.3}, "spawn": "на островах, 1 на 6 островов",
   "layers": [
     {"from":0,"to":3,"shape":"ellipse","w":20,"h":20,"w2":18,"h2":18,
      "color":"#6b5a48","color2":"#8a7560","edge":"#3a2e24"},
     {"from":4,"to":14,"shape":"ellipse","w":10,"h":10,"w2":7,"h2":7,
      "color":"#e8e2d0","stripes":{"every":4,"color":"#c23440"}},
     {"from":15,"to":15,"shape":"rect","w":9,"h":9,"color":"#ffd24a","windows":{"color":"#fff3b0","n":4}},
     {"from":16,"to":17,"shape":"poly","points":[[16,10],[22,22],[10,22]],"color":"#c23440"}
   ]
  }
 }
}
Shapes: ellipse | rect | poly (points in slice pixels, centre 16,16 for 32x32).
w/h -> w2/h2 and color -> color2 interpolate from 'from' to 'to'.
Optional per layer: cx, cy (default centre), dx/dy (drift per slice), rot (deg),
edge (1 px darker outline), stripes {every,color}, windows {n,color},
speckle {n,color,seed}, hole {w,h} (cut-out), mirror_x.
"""
import json, math, os, random, sys
from PIL import Image, ImageDraw

def hexrgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))

def px_(im):
    return im.get_flattened_data() if hasattr(im, 'get_flattened_data') else im.getdata()

def lerp(a, b, k):
    return a + (b - a) * k

def lerpc(a, b, k):
    return tuple(int(round(lerp(x, y, k))) for x, y in zip(a, b))

def binarize(img):
    a = img.getchannel('A').point(lambda v: 255 if v >= 128 else 0)
    img.putalpha(a)
    return img

def draw_layer(img, L, i, sw, sh):
    span = max(1, L['to'] - L['from'])
    k = (i - L['from']) / span
    d = ImageDraw.Draw(img)
    col = hexrgb(L.get('color', '#888888'))
    col = lerpc(col, hexrgb(L['color2']), k) if 'color2' in L else col
    cx = L.get('cx', sw / 2) + L.get('dx', 0) * (i - L['from'])
    cy = L.get('cy', sh / 2) + L.get('dy', 0) * (i - L['from'])
    w = lerp(L.get('w', sw / 2), L.get('w2', L.get('w', sw / 2)), k)
    h = lerp(L.get('h', sh / 2), L.get('h2', L.get('h', sh / 2)), k)
    shape = L.get('shape', 'ellipse')
    box = [cx - w / 2, cy - h / 2, cx + w / 2 - 1, cy + h / 2 - 1]
    edge = hexrgb(L['edge']) if 'edge' in L else None
    if shape == 'ellipse':
        d.ellipse(box, fill=col + (255,), outline=(edge + (255,)) if edge else None)
    elif shape == 'rect':
        d.rectangle(box, fill=col + (255,), outline=(edge + (255,)) if edge else None)
    elif shape == 'poly':
        pts = [(x + L.get('dx', 0) * (i - L['from']), y + L.get('dy', 0) * (i - L['from'])) for x, y in L['points']]
        sc = lerp(1, L.get('scale2', 1), k)
        pts = [(cx + (x - sw / 2) * sc, cy + (y - sh / 2) * sc) if 'scale2' in L else (x, y) for x, y in pts]
        d.polygon(pts, fill=col + (255,), outline=(edge + (255,)) if edge else None)
        if L.get('mirror_x'):
            d.polygon([(sw - 1 - x, y) for x, y in pts], fill=col + (255,))
    if 'hole' in L:
        hw, hh = L['hole']['w'], L['hole']['h']
        d.ellipse([cx - hw / 2, cy - hh / 2, cx + hw / 2 - 1, cy + hh / 2 - 1], fill=(0, 0, 0, 0))
    if 'stripes' in L and (i - L['from']) % L['stripes']['every'] == 0:
        sc_ = hexrgb(L['stripes']['color'])
        mask = Image.new('L', img.size, 0)
        ImageDraw.Draw(mask).ellipse(box, fill=255) if shape == 'ellipse' else ImageDraw.Draw(mask).rectangle(box, fill=255)
        img.paste(Image.new('RGBA', img.size, sc_ + (255,)), (0, 0), mask)
    if 'windows' in L:
        wc = hexrgb(L['windows']['color']) + (255,)
        n = L['windows']['n']
        for j in range(n):
            a = j / n * math.tau
            px, py = cx + math.cos(a) * (w / 2 - 1.5), cy + math.sin(a) * (h / 2 - 1.5)
            d.point((int(px), int(py)), fill=wc)
    if 'speckle' in L:
        sp = L['speckle']
        r = random.Random(sp.get('seed', 1) * 1000 + i)
        sc_ = hexrgb(sp['color']) + (255,)
        px = img.load()
        for _ in range(sp['n']):
            x, y = int(r.uniform(box[0], box[2])), int(r.uniform(box[1], box[3]))
            if 0 <= x < sw and 0 <= y < sh and px[x, y][3]:
                px[x, y] = sc_
    if 'rot' in L and L['rot']:
        pass  # rotation is applied per-slice in build()

def build(name, A):
    sw, sh = A['slice']
    n = A['count']
    slices = []
    for i in range(n):
        im = Image.new('RGBA', (sw, sh), (0, 0, 0, 0))
        for L in A['layers']:
            if L['from'] <= i <= L['to']:
                tmp = Image.new('RGBA', (sw, sh), (0, 0, 0, 0))
                draw_layer(tmp, L, i, sw, sh)
                if L.get('rot'):
                    tmp = tmp.rotate(L['rot'] * (i - L['from']), resample=Image.NEAREST)
                im.alpha_composite(tmp)
        slices.append(binarize(im))
    strip = Image.new('RGBA', (sw * n, sh), (0, 0, 0, 0))
    for i, s in enumerate(slices):
        strip.paste(s, (i * sw, 0))
    return slices, strip

def check(name, A, slices):
    hard, soft = [], []
    sw, sh = A['slice']
    mins = {'vehicle': 10, 'creature': 10, 'landmark': 12, 'island': 6, 'cloud': 8, 'prop': 6, 'effect': 4, 'pickup': 6}
    need = mins.get(A.get('role', 'prop'), 6)
    if len(slices) < need:
        hard.append(f'{name}: срезов {len(slices)} < {need} для роли {A.get("role")}')
    empty = [i for i, s in enumerate(slices) if s.getbbox() is None]
    if empty:
        hard.append(f'{name}: пустые срезы {empty}')
    same = sum(1 for a, b in zip(slices, slices[1:]) if a.tobytes() == b.tobytes())
    if len(slices) > 1 and same > (len(slices) - 1) * 0.6:
        hard.append(f'{name}: {same} из {len(slices)-1} соседних срезов одинаковые — плоско, нет объёма')
    if slices and slices[0].tobytes() == slices[-1].tobytes():
        hard.append(f'{name}: низ = верх, силуэт не меняется по высоте')
    colors = set()
    for s in slices:
        colors |= {p[:3] for p in px_(s) if p[3]}
    if len(colors) < 3:
        hard.append(f'{name}: всего {len(colors)} цвета — нет деталей')
    area = [sum(1 for p in px_(s) if p[3]) for s in slices]
    if max(area, default=0) < sw * sh * 0.08:
        hard.append(f'{name}: ассет слишком мелкий в срезе (макс. площадь {max(area, default=0)} px)')
    if A.get('role') == 'pickup' and not A.get('benefit'):
        hard.append(f'{name}: у находки нет поля benefit (правило ПОНЯТНАЯ ПОЛЬЗА)')
    for f in ('label_ru', 'spawn'):
        if not A.get(f):
            soft.append(f'{name}: нет поля {f}')
    return hard, soft

def render_angle(slices, ang, scale=3):
    sw, sh = slices[0].size
    n = len(slices)
    W = int(math.hypot(sw, sh)) + 4
    H = W + n + 4
    out = Image.new('RGBA', (W, H), (27, 88, 198, 255))
    for i, s in enumerate(slices):
        r = s.rotate(ang, resample=Image.NEAREST, expand=True)
        out.alpha_composite(r, ((W - r.width) // 2, H - 2 - r.height - i))
    return out.resize((W * scale, H * scale), Image.NEAREST)

def main(pack):
    R = json.load(open(os.path.join(pack, 'recipe.json'), encoding='utf-8'))
    os.makedirs(os.path.join(pack, 'stacks'), exist_ok=True)
    os.makedirs(os.path.join(pack, '_check'), exist_ok=True)
    out = {'format': 'mg-spritestack/1', 'game': R.get('game', 'nebesny-pilot'),
           'license': R.get('license', {'type': 'CC0', 'note': 'сгенерировано stackgen из текстового рецепта'}),
           'provenance': {'tool': 'automation/stackgen/stackgen.py', 'recipe': 'recipe.json',
                          'author': R.get('author', ''), 'lane': R.get('lane', '')},
           'content_flags': R.get('content_flags', {}), 'assets': {}}
    hard_all, soft_all, rows = [], [], []
    for name, A in R['assets'].items():
        slices, strip = build(name, A)
        strip.save(os.path.join(pack, 'stacks', f'{name}.png'))
        h, s = check(name, A, slices)
        hard_all += h
        soft_all += s
        meta = {k: v for k, v in A.items() if k != 'layers'}
        meta.update({'file': f'stacks/{name}.png', 'pitch_px': 1, 'shadow': A.get('shadow', True)})
        out['assets'][name] = meta
        rows.append([render_angle(slices, a) for a in range(0, 360, 45)])
    json.dump(out, open(os.path.join(pack, 'stack.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    if rows:
        cw = max(im.width for r in rows for im in r)
        ch = max(im.height for r in rows for im in r)
        sheet = Image.new('RGBA', (cw * 8, ch * len(rows)), (11, 42, 107, 255))
        for y, r in enumerate(rows):
            for x, im in enumerate(r):
                sheet.alpha_composite(im, (x * cw, y * ch))
        sheet.save(os.path.join(pack, '_check', 'preview.png'))
    with open(os.path.join(pack, '_check', 'REPORT.md'), 'w', encoding='utf-8') as f:
        f.write(f'# stackgen: {len(R["assets"])} ассет(ов), HARD {len(hard_all)}, SOFT {len(soft_all)}\n\n')
        f.writelines(f'- HARD: {x}\n' for x in hard_all)
        f.writelines(f'- SOFT: {x}\n' for x in soft_all)
        f.write('\nПревью 8 углов: _check/preview.png\n')
    print(open(os.path.join(pack, '_check', 'REPORT.md'), encoding='utf-8').read())
    return 1 if hard_all else 0

if __name__ == '__main__':
    sys.exit(main(sys.argv[1]))

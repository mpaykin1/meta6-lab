import json
import os
from pathlib import Path
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # встроенный Python (ComfyUI) не видит соседние модули
from common import cli, extract_video, load_json, validate_config
import numpy as np
from PIL import Image, ImageFilter
from blendmap import clip_weights, wants_blend
extract = extract_video

def hue_weight(cb, cr, kcb, kcr, full=25.0, zero=45.0):
    kb, kr = (float(np.ravel(kcb)[0]), float(np.ravel(kcr)[0]))
    kn = np.hypot(kb, kr) + 1e-06
    n = np.hypot(cb, cr)
    cos = (cb * kb + cr * kr) / (n * kn + 1e-06)
    lo, hi = (np.cos(np.radians(zero)), np.cos(np.radians(full)))
    return np.clip((cos - lo) / (hi - lo), 0, 1) * np.clip(n / 0.03, 0, 1)

def key_out(rgb: np.ndarray, key, soft=(0.055, 0.13), despill_all=False, despill_hue=False, hue_win=None) -> np.ndarray:
    f = rgb.astype(np.float32) / 255.0
    if key == 'auto':
        b = np.concatenate([f[:8].reshape(-1, 3), f[-8:].reshape(-1, 3), f[:, :8].reshape(-1, 3), f[:, -8:].reshape(-1, 3)])
        k = np.median(b, axis=0)
    else:
        k = np.array(key, np.float32) / 255.0

    def ycc(c):
        y = 0.299 * c[..., 0] + 0.587 * c[..., 1] + 0.114 * c[..., 2]
        cb = (c[..., 2] - y) * 0.564
        cr = (c[..., 0] - y) * 0.713
        return (y, cb, cr)
    y, cb, cr = ycc(f)
    ky, kcb, kcr = ycc(k[None, None, :])
    d = np.sqrt((cb - kcb) ** 2 + (cr - kcr) ** 2) + 0.25 * np.abs(y - ky)
    a = np.clip((d - soft[0]) / (soft[1] - soft[0]), 0, 1)
    kn0 = float(np.ravel(np.hypot(kcb, kcr))[0]) + 1e-06

    def hwt(cb_, cr_, y_):
        w = hue_weight(cb_, cr_, kcb, kcr)
        if hue_win:
            w = np.maximum(w, hue_weight(cb_, cr_, kcb, kcr, full=hue_win[0], zero=hue_win[1]) * (y_ >= hue_win[2]))
        return w
    if despill_all:
        proj = (cb * float(np.ravel(kcb)[0]) + cr * float(np.ravel(kcr)[0])) / kn0
        a = np.minimum(a, np.clip(1 - proj / kn0, 0, 1))
    elif despill_hue:
        proj = (cb * float(np.ravel(kcb)[0]) + cr * float(np.ravel(kcr)[0])) / kn0
        a = np.minimum(a, 1 - hwt(cb, cr, y) * np.clip(proj / kn0, 0, 1))
    part = (a > 0.02) & (a < 0.98)
    aa = np.maximum(a, 0.02)[..., None]
    unmixed = np.clip((f - (1 - aa) * k[None, None, :]) / aa, 0, 1)
    f = np.where(part[..., None], unmixed, f)
    near = np.array(Image.fromarray(((a < 0.5) * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))) > 0
    spill = np.ones_like(near) if despill_all else (a < 0.98) | near
    y2, cb2, cr2 = ycc(f)
    if despill_hue:
        spill = np.maximum(spill, hwt(cb2, cr2, y2))
    kn = np.hypot(kcb, kcr) + 1e-06
    u0, u1 = (float(np.ravel(kcb)[0]) / float(np.ravel(kn)[0]), float(np.ravel(kcr)[0]) / float(np.ravel(kn)[0]))
    sp = np.maximum(0, cb2 * u0 + cr2 * u1) * spill
    cb2 = cb2 - sp * u0
    cr2 = cr2 - sp * u1
    R = y2 + cr2 / 0.713
    B = y2 + cb2 / 0.564
    G = (y2 - 0.299 * R - 0.114 * B) / 0.587
    f = np.clip(np.dstack([R, G, B]), 0, 1)
    out = np.dstack([f, a])
    return (out * 255 + 0.5).astype(np.uint8)

def erase_blobs(rgba: np.ndarray, rules: list) -> tuple[np.ndarray, int]:
    import cv2
    out = rgba.copy()
    f = rgba[..., :3].astype(np.float32) / 255.0
    a = rgba[..., 3]
    mx = f.max(2)
    mn = f.min(2)
    d = mx - mn
    hue = np.zeros_like(mx)
    m = d > 1e-06
    r, g, b = (f[..., 0], f[..., 1], f[..., 2])
    i = m & (mx == r)
    hue[i] = (g - b)[i] / d[i] % 6
    i = m & (mx == g) & ~(mx == r)
    hue[i] = (b - r)[i] / d[i] + 2
    i = m & (mx == b) & ~(mx == r) & ~(mx == g)
    hue[i] = (r - g)[i] / d[i] + 4
    hue = hue * 60.0
    sat = np.where(mx > 1e-06, d / np.maximum(mx, 1e-06), 0)
    ys, xs = np.nonzero(a > 40)
    if len(ys) == 0:
        return (out, 0)
    top, bot = (ys.min(), ys.max())
    removed = 0
    for rule in rules:
        h0, h1 = rule.get('hue', [30, 60])
        col = (hue >= h0) & (hue <= h1) & (sat >= rule.get('sat', 0.45)) & (mx >= rule.get('val', 0.45)) & (a > 128)
        n, lab, stats, cents = cv2.connectedComponentsWithStats(col.astype(np.uint8), connectivity=8)
        r0, r1 = rule.get('ring', [3, 7])
        bgmask = a < 60
        ph0, ph1 = rule.get('protect_hue', [250, 300])
        protect = (hue >= ph0) & (hue <= ph1) & (sat >= 0.3) & (a > 128)
        protect = cv2.dilate(protect.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
        amin, amax = rule.get('area', [25, 900])
        ylim = top + (bot - top) * rule.get('ymax', 0.6)
        left, right = (xs.min(), xs.max())
        xlo = left + (right - left) * rule.get('xmin', 0.0)
        xhi = left + (right - left) * rule.get('xmax', 1.0)
        for k in range(1, n):
            area = stats[k, cv2.CC_STAT_AREA]
            if area < amin or area > amax:
                continue
            if cents[k][1] > ylim or not xlo <= cents[k][0] <= xhi:
                continue
            bw, bh = (stats[k, cv2.CC_STAT_WIDTH], stats[k, cv2.CC_STAT_HEIGHT])
            if area / float(bw * bh) < rule.get('fill', 0) or max(bw, bh) / float(max(1, min(bw, bh))) > rule.get('aspect', 99):
                continue
            comp = (lab == k).astype(np.uint8)
            outer = cv2.dilate(comp, np.ones((2 * r1 + 1, 2 * r1 + 1), np.uint8))
            inner = cv2.dilate(comp, np.ones((2 * r0 + 1, 2 * r0 + 1), np.uint8))
            ring = (outer > 0) & ~(inner > 0)
            if ring.sum() == 0:
                continue
            frac = bgmask[ring].mean()
            if frac < rule.get('bg', 0.45):
                continue
            wide = cv2.dilate(comp, np.ones((2 * (r0 + 4) + 1, 2 * (r0 + 4) + 1), np.uint8)) > 0
            dark = mx < 0.42
            kill = ((inner > 0) | wide & dark) & ~protect
            out[..., 3][kill] = 0
            zone = cv2.dilate(comp, np.ones((41, 41), np.uint8)) > 0
            m = (out[..., 3] > 40).astype(np.uint8)
            op = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((9, 9), np.uint8)) > 0
            thin = zone & (m > 0) & ~op & ~protect
            out[..., 3][thin] = 0
            m = (out[..., 3] > 40).astype(np.uint8)
            n2, lab2, st2, _ = cv2.connectedComponentsWithStats(m, connectivity=8)
            if n2 > 2:
                main = 1 + int(np.argmax(st2[1:, cv2.CC_STAT_AREA]))
                for q in range(1, n2):
                    if q != main and st2[q, cv2.CC_STAT_AREA] < 3000 and (zone & (lab2 == q)).any():
                        out[..., 3][lab2 == q] = 0
            removed += 1
    return (out, removed)

def drop_border(rgba: np.ndarray, margin=2, fade=48) -> np.ndarray:
    import cv2
    a = rgba[..., 3]
    m = (a > 20).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m, connectivity=8)
    h, w = a.shape
    out = rgba.copy()
    if n > 1:
        main = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        for k in range(1, n):
            if k == main:
                continue
            x, y, bw, bh, area = stats[k]
            if x <= margin or y <= margin or x + bw >= w - margin or (y + bh >= h - margin):
                out[..., 3][lab == k] = 0
    yy = np.minimum(np.arange(h), np.arange(h)[::-1])[:, None]
    xx = np.minimum(np.arange(w), np.arange(w)[::-1])[None, :]
    edge = np.clip(np.minimum(yy, xx) / float(fade), 0, 1)
    out[..., 3] = (out[..., 3].astype(np.float32) * edge).astype(np.uint8)
    return out

def keep_main(rgba: np.ndarray) -> np.ndarray:
    import cv2
    m = (rgba[..., 3] > 20).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m, connectivity=8)
    if n > 2:
        main = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        rgba[..., 3][(lab > 0) & (lab != main)] = 0
    return rgba

def gold_muzzle(rgba: np.ndarray, hue=(28, 62)) -> tuple[float, float] | None:
    import cv2
    f = rgba[..., :3].astype(np.float32) / 255.0
    mx = f.max(2)
    mn = f.min(2)
    d = mx - mn
    r, g, b = (f[..., 0], f[..., 1], f[..., 2])
    hh = np.zeros_like(mx)
    m = d > 1e-06
    i = m & (mx == r)
    hh[i] = (g - b)[i] / d[i] % 6
    i = m & (mx == g) & ~(mx == r)
    hh[i] = (b - r)[i] / d[i] + 2
    hh = hh * 60
    sat = np.where(mx > 1e-06, d / np.maximum(mx, 1e-06), 0)
    gold = ((hh >= hue[0]) & (hh <= hue[1]) & (sat > 0.45) & (mx > 0.5) & (rgba[..., 3] > 128)).astype(np.uint8)
    n, lab, stats, cents = cv2.connectedComponentsWithStats(gold, connectivity=8)
    best = None
    for k in range(1, n):
        if stats[k, cv2.CC_STAT_AREA] < 300:
            continue
        right = stats[k, cv2.CC_STAT_LEFT] + stats[k, cv2.CC_STAT_WIDTH]
        if best is None or right > best[0]:
            best = (right, cents[k])
    return (float(best[1][0]), float(best[1][1])) if best else None

def clean_alpha(rgba: np.ndarray, min_area=60) -> np.ndarray:
    import cv2
    a = rgba[..., 3]
    mm = (a[::2, ::2] > 40).astype(np.uint8)
    n, labels, stats, _ = cv2.connectedComponentsWithStats(mm, connectivity=4)
    accepted = np.zeros(n, dtype=bool)
    accepted[1:] = stats[1:, cv2.CC_STAT_AREA] * 4 >= min_area
    keep = np.repeat(np.repeat(accepted[labels], 2, axis=0), 2, axis=1)[:a.shape[0], :a.shape[1]]
    keep = cv2.dilate(keep.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
    out = rgba.copy()
    out[..., 3] = np.where(keep, a, 0)
    return out

def warp_times(warp, fps_out):
    total = sum((s[2] for s in warp))
    n = max(1, int(round(total * fps_out)))
    res = []
    for i in range(n):
        tg = i / fps_out
        acc = 0.0
        for a, b, dur in warp:
            if tg <= acc + dur + 1e-09 or (a, b, dur) == tuple(warp[-1]):
                u = 0 if dur <= 0 else min(1.0, max(0.0, (tg - acc) / dur))
                res.append((a + (b - a) * u, tg))
                break
            acc += dur
    return (res, total)

def main():
    import argparse
    ap = argparse.ArgumentParser(description='Клипы в WebP-листы и JSON')
    ap.add_argument('config')
    ap.add_argument('anims', nargs='*')
    ap.add_argument('--preview', action='store_true')
    args = ap.parse_args()
    cfg_path = Path(args.config).expanduser().resolve()
    cfg = load_json(cfg_path)
    validate_config(cfg)
    only = set(args.anims)
    unknown = only - cfg['anims'].keys()
    if unknown:
        raise ValueError('Нет анимаций: ' + ', '.join(sorted(unknown)))
    for field in ('out_dir', 'work'):
        cfg[field] = str((cfg_path.parent / Path(cfg[field]).expanduser()).resolve())
    if cfg['out_dir'] == cfg['work']:
        raise ValueError('out_dir и work должны быть разными папками')
    for anim in cfg['anims'].values():
        anim['video'] = str((cfg_path.parent / Path(anim['video']).expanduser()).resolve())
    out_dir = cfg['out_dir']
    preview = args.preview
    os.makedirs(out_dir, exist_ok=True)
    meta_path = os.path.join(out_dir, cfg['id'] + '.json')
    meta = load_json(meta_path) if only and os.path.exists(meta_path) else {}
    ppu = cfg['ppu']
    min_area = cfg.get('minArea', 60)
    scale = ppu * cfg['height'] / cfg['src_height']
    fx, fy = cfg['foot']
    meta.update({'id': cfg['id'], 'ppu': ppu, 'height': cfg['height'], 'shadow': {'w': cfg['shadow'][0], 'h': cfg['shadow'][1]}})
    meta.setdefault('anims', {})
    for name, a in cfg['anims'].items():
        if only and name not in only:
            continue
        d, vfps, n = extract(a['video'], cfg['work'])
        if any(segment[1] > n / vfps + 1e-6 for segment in a['warp']):
            raise ValueError(f'{name}: warp выходит за длительность клипа {n / vfps:.3f} с')
        times, total = warp_times(a['warp'], a['fps'])
        ox0, oy0 = a.get('offset', [0, 0])
        frames = []
        imgs = []
        erased = 0
        cache: dict[int, int] = {}
        order: list[int] = []
        cut_frames: list[str] = []
        a_src_h = a.get('src_height', cfg['src_height'])
        a_fx, a_fy = a.get('foot', cfg['foot'])
        a_ppu = a.get('ppu', ppu)
        scale = a_ppu * cfg['height'] / a_src_h
        fx, fy = (a_fx, a_fy)
        muzzle_px = None
        rel = a.get('release')
        rel_idx = None
        if rel is not None:
            rel_idx = min(range(len(times)), key=lambda q: abs(times[q][1] - rel))
        for q, (tv, tg) in enumerate(times):
            idx = min(n, max(1, int(round(tv * vfps)) + 1))
            if idx in cache and (not (q == rel_idx and a.get('muzzle') == 'auto')):
                order.append(cache[idx])
                continue
            rgb = np.array(Image.open(os.path.join(d, f'f{idx:05d}.png')).convert('RGB'))
            rgba = clean_alpha(key_out(rgb, cfg.get('key', 'auto'), despill_all=cfg.get('despill') == 'all', despill_hue=cfg.get('despill') == 'hue', hue_win=a.get('despillHue', cfg.get('despillHue'))), a.get('minArea', min_area))
            amin = a.get('alphaMin', cfg.get('alphaMin', 0))
            if amin:
                al_ = rgba[..., 3]
                al_[al_ < int(amin * 255)] = 0
            for m in a.get('masks', cfg.get('masks', [])):
                if len(m) >= 6 and (not m[4] <= tv <= m[5]):
                    continue
                mx0, my0, mx1, my1 = m[:4]
                rgba[max(0, int(my0)):max(0, int(my1)), max(0, int(mx0)):max(0, int(mx1)), 3] = 0
            if any((k0 <= tv <= k1 for k0, k1 in a.get('keepMain', []))):
                rgba = keep_main(rgba)
            gh = a.get('groundHaze', cfg.get('groundHaze'))
            if gh:
                band, vmin, smax = gh
                y0g = max(0, int(a_fy - band))
                z = rgba[y0g:int(a_fy) + band // 2, :, :3].astype(np.float32) / 255.0
                mx, mn = (z.max(2), z.min(2))
                haze = (mx >= vmin) & ((mx - mn) / np.maximum(mx, 0.001) <= smax)
                rgba[y0g:int(a_fy) + band // 2, :, 3][haze] = 0
            al0 = rgba[..., 3] > 128
            hh0, ww0 = al0.shape
            touch = [n_ for n_, edge in (('верх', al0[:3].any()), ('лево', al0[:, :3].any()), ('право', al0[:, -3:].any()), ('низ', al0[-3:].any())) if edge]
            if touch:
                cut_frames.append(f'{tv:.2f}с({'/'.join(touch)})')
            if a.get('dropBorder', cfg.get('dropBorder', True)):
                rgba = drop_border(rgba)
            rules = a.get('erase', cfg.get('erase'))
            if rules:
                rgba, nrem = erase_blobs(rgba, rules)
                if nrem:
                    erased += 1
                rgba = clean_alpha(rgba, min_area)
            if q == rel_idx and a.get('muzzle') == 'auto':
                muzzle_px = gold_muzzle(rgba)
            lift = 0.0
            if a.get('groundClamp', cfg.get('groundClamp', True)):
                ys_ = np.nonzero(rgba[..., 3] > 128)[0]
                if len(ys_):
                    low = ys_.max()
                    if low > fy + oy0 + 3:
                        lift = low - (fy + oy0)
            im = Image.fromarray(rgba, 'RGBA')
            W = max(1, round(im.width * scale))
            H = max(1, round(im.height * scale))
            im = im.resize((W, H), Image.LANCZOS)
            al = np.array(im)[..., 3]
            al[al < 10] = 0
            ys, xs = np.nonzero(al > 10)
            if len(xs) == 0:
                xs = np.array([0])
                ys = np.array([0])
            x0, x1 = (max(0, xs.min() - 2), min(W, xs.max() + 3))
            y0, y1 = (max(0, ys.min() - 2), min(H, ys.max() + 3))
            crop = im.crop((x0, y0, x1, y1))
            fxs = (fx + ox0) * scale
            fys = (fy + oy0 + lift) * scale
            frames.append([0, 0, crop.width, crop.height, int(round(x0 - fxs)), int(round(y0 - fys))])
            imgs.append(crop)
            cache[idx] = len(frames) - 1
            order.append(len(frames) - 1)
        pp = a.get('pingpong')
        if pp is not None and pp is not False:
            start = 0 if pp is True else int(round(float(pp) * a['fps']))
            seg = order[start:]
            order = order + seg[-2:0:-1]
            total = len(order) / a['fps']
        for sheet_w in (2048, 4096, 8192):
            x = y = row = 0
            for i, im in enumerate(imgs):
                if x + im.width > sheet_w:
                    x = 0
                    y += row + 2
                    row = 0
                frames[i][0] = x
                frames[i][1] = y
                x += im.width + 2
                row = max(row, im.height)
            sheet_h = y + row
            if sheet_h <= 8192 and max((im.width for im in imgs)) <= sheet_w:
                break
        if sheet_h > 8192 or max((im.width for im in imgs)) > sheet_w:
            raise ValueError(f'{name}: лист больше 8192 px, уменьшите ppu')
        sheet = Image.new('RGBA', (min(sheet_w, max((f[0] + f[2] for f in frames))), sheet_h), (0, 0, 0, 0))
        for f, im in zip(frames, imgs):
            sheet.paste(im, (f[0], f[1]))
        fn = f'{name}.webp'
        sheet.save(os.path.join(out_dir, fn), 'WEBP', quality=cfg.get('quality', 86), method=6, alpha_quality=90)
        am = {'sheet': fn, 'fps': a['fps'], 'frames': [frames[o] for o in order]}
        for k in ('loop', 'hold', 'release', 'label'):
            if a.get(k) is not None and a.get(k) is not False:
                am[k] = a[k]
        if a.get('loopFrom') is not None:
            am['loopFrom'] = int(round(a['loopFrom'] * a['fps']))
        if a_ppu != ppu:
            am['ppu'] = a_ppu
        mz = muzzle_px if a.get('muzzle') == 'auto' else a.get('muzzle')
        if mz:
            mx, my = mz
            am['muzzle'] = [round((mx - fx - ox0) * scale / a_ppu, 1), round((my - fy - oy0) * scale / a_ppu, 1)]
        if wants_blend(name, a):
            am['blend'] = clip_weights(am, lambda i: np.array(imgs[order[i]]), a_ppu)
        meta['anims'][name] = am
        kb = os.path.getsize(os.path.join(out_dir, fn)) // 1024
        if cut_frames:
            print(f'  ВНИМАНИЕ {name}: герой срезан краем видео в {len(cut_frames)} кадрах: ' + ', '.join(cut_frames[:8]))
        print(f'{name}: {len(order)} кадров ({len(frames)} уникальных), {total:.2f} с, точка вылета {am.get('muzzle')}, лист {sheet.width}x{sheet.height}, {kb} КБ' + (f', стёрто лишнее в {erased} кадрах' if erased else ''))
        if preview:
            cols = min(len(order), 10)
            left = min((f[4] for f in frames))
            right = max((f[4] + f[2] for f in frames))
            cw = right - left
            chh = max((-f[5] for f in frames)) + max((f[3] + f[5] for f in frames)) + 10
            pv = Image.new('RGBA', (cw * cols + 40 * cols, chh * ((len(order) + cols - 1) // cols)), (70, 70, 84, 255))
            for i, (f, im) in enumerate(((frames[o], imgs[o]) for o in order)):
                cx = i % cols * (cw + 40) - left + 20
                cy = i // cols * chh + max((-g[5] for g in frames)) + 5
                pv.alpha_composite(im, (cx + f[4], cy + f[5]))
            pv.convert('RGB').save(os.path.join(cfg['work'], f'preview_{name}.png'))
    if cfg.get('portrait'):
        p = cfg['portrait']
        a = cfg['anims'][p['anim']]
        d, vfps, n = extract(a['video'], cfg['work'])
        idx = min(n, max(1, int(round(p.get('t', 0) * vfps)) + 1))
        rgb = np.array(Image.open(os.path.join(d, f'f{idx:05d}.png')).convert('RGB'))
        rgba = clean_alpha(key_out(rgb, cfg.get('key', 'auto'), despill_all=cfg.get('despill') == 'all', despill_hue=cfg.get('despill') == 'hue'), a.get('minArea', min_area))
        if cfg.get('erase'):
            rgba, _ = erase_blobs(rgba, cfg['erase'])
            rgba = clean_alpha(rgba, min_area)
        x0, y0, x1, y1 = p['box']
        im = Image.fromarray(rgba, 'RGBA').crop((x0, y0, x1, y1)).resize((p['size'], p['size']), Image.LANCZOS)
        im.save(os.path.join(out_dir, 'portrait.webp'), 'WEBP', quality=90, alpha_quality=95)
        meta['portrait'] = {'file': 'portrait.webp', 'size': p['size']}
    json.dump(meta, open(meta_path, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('описание', meta_path)
if __name__ == '__main__':
    cli(main)

// Прогон процедурных ассетов INK (ink-pack/1) в Node без браузера.
// node ink_harness.mjs <папка_эталона_INK> <файл_makers.js> → JSON на stdout.
// makers.js пишется так, будто лежит рядом с файлами эталона: может импортировать 'three',
// './shared/living-watercolor-generators.js', './ink-objects.js' и т.д. (REUSE эталона без копирования кода).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const [refDir, makersFile] = process.argv.slice(2);
// Холст-заглушка: эталон рисует процедурные текстуры (патина робота) через <canvas>. В Node рисовать не нужно —
// проверяются форма, бюджет и детерминизм, поэтому все методы 2D-контекста — пустые.
const noop = () => {};
const ctx2d = new Proxy({}, {get: (t, k) => k in t ? t[k] : (k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'createPattern')
  ? () => ({addColorStop: noop}) : k === 'getImageData' ? (x, y, w, h) => ({data: new Uint8ClampedArray(w * h * 4), width: w, height: h})
  : k === 'measureText' ? () => ({width: 0}) : noop, set: (t, k, v) => {t[k] = v; return true;}});
globalThis.document ??= {createElement: tag => tag === 'canvas' ? {width: 0, height: 0, style: {}, getContext: () => ctx2d,
  addEventListener: noop} : {style: {}, addEventListener: noop}};
const out = {ok: false, error: null, makers: {}};
try {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ink-pack-'));
  fs.cpSync(refDir, tmp, {recursive: true, filter: s => !s.endsWith('index.html')});
  fs.mkdirSync(path.join(tmp, 'node_modules', 'three'), {recursive: true});
  fs.writeFileSync(path.join(tmp, 'node_modules', 'three', 'package.json'),
    JSON.stringify({name: 'three', type: 'module', main: '../../three.module.js', exports: '../../three.module.js'}));
  fs.copyFileSync(path.join(tmp, 'three.module.js'), path.join(tmp, 'node_modules', 'three', 'three.module.js'));
  fs.writeFileSync(path.join(tmp, 'node_modules', 'three', 'package.json'),
    JSON.stringify({name: 'three', type: 'module', exports: './three.module.js'}));
  fs.writeFileSync(path.join(tmp, 'package.json'), JSON.stringify({type: 'module'}));
  const target = path.join(tmp, '__pack_makers.js');
  fs.copyFileSync(makersFile, target);
  const T = await import(pathToFileURL(path.join(tmp, 'node_modules', 'three', 'three.module.js')).href);
  const mod = await import(pathToFileURL(target).href);
  const makers = mod.makers;
  if (!makers || typeof makers !== 'object') throw new Error('makers.js не экспортирует объект makers');

  const digest = o => {
    let h = 2166136261 >>> 0, n = 0;
    o.updateMatrixWorld(true);
    const v = new T.Vector3();
    o.traverse(m => {
      const p = m.geometry?.attributes?.position;
      if (!p) return;
      for (let i = 0; i < p.count; i += Math.max(1, Math.floor(p.count / 64))) {
        v.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld);
        for (const c of [v.x, v.y, v.z]) {h ^= Math.round(c * 1000) & 0xffffffff; h = Math.imul(h, 16777619) >>> 0;}
        n++;
      }
    });
    return h.toString(16) + ':' + n;
  };
  for (const [name, fn] of Object.entries(makers)) {
    const r = {error: null};
    out.makers[name] = r;
    try {
      if (typeof fn !== 'function') throw new Error('не функция');
      const t0 = performance.now();
      const o = fn(1);
      r.ms = Math.round((performance.now() - t0) * 10) / 10;
      if (!o || !o.isObject3D) throw new Error('вернула не THREE.Object3D');
      const o2 = fn(1), o3 = fn(7);
      r.same_seed_same = digest(o) === digest(o2);
      r.other_seed_differs = digest(o) !== digest(o3);
      let tris = 0, meshes = 0, textures = 0, outlineSet = 0, lines = 0;
      const mats = new Set(), colors = new Set(), types = new Set();
      o.updateMatrixWorld(true);
      o.traverse(m => {
        if (m.isLine || m.isLineSegments) lines++;
        if (!m.isMesh && !m.isLine && !m.isPoints) return;
        if (m.isMesh) {
          meshes++;
          const g = m.geometry;
          const n = g.index ? g.index.count : (g.attributes.position?.count || 0);
          tris += Math.floor(n / 3) * (m.isInstancedMesh ? m.count : 1);
          if (m.userData.watercolorOutline !== undefined) outlineSet++;
        }
        for (const mt of [].concat(m.material || [])) {
          mats.add(mt.uuid); types.add(mt.type);
          if (mt.color) colors.add('#' + mt.color.getHexString());
          for (const k of ['map', 'normalMap', 'roughnessMap', 'emissiveMap', 'alphaMap', 'aoMap']) if (mt[k]) textures++;
        }
      });
      const box = new T.Box3().setFromObject(o);
      r.tris = tris; r.meshes = meshes; r.lines = lines; r.materials = mats.size; r.textures = textures;
      r.material_types = [...types]; r.colors = [...colors].slice(0, 64); r.outline_set = outlineSet;
      r.min = box.isEmpty() ? null : box.min.toArray(); r.max = box.isEmpty() ? null : box.max.toArray();
      r.name = o.name || '';
      const tick = o.userData && o.userData.tick;
      r.has_tick = typeof tick === 'function';
      if (r.has_tick) {
        const before = digest(o);
        tick(0.0, 1 / 60); tick(1.7, 1 / 60);
        r.tick_moves = digest(o) !== before;
      }
      r.interact = o.userData && o.userData.interact ? JSON.parse(JSON.stringify(o.userData.interact)) : null;
      r.footprint = o.userData && typeof o.userData.footprint === 'number' ? o.userData.footprint : null;
    } catch (e) {
      r.error = String(e && e.message || e);
    }
  }
  out.ok = true;
  fs.rmSync(tmp, {recursive: true, force: true});
} catch (e) {
  out.error = String(e && e.stack || e).slice(0, 800);
}
process.stdout.write(JSON.stringify(out));

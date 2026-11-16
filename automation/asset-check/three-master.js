// 3D Master: read-only quality inspection for procedural Three.js meshes.
// No dependency on a particular THREE version or rendering backend.
export function inspectObject3D(root, options = {}) {
  if (!root || typeof root.traverse !== 'function') {
    throw new TypeError('3D Master requires a THREE.Object3D root');
  }
  root.updateMatrixWorld(true);
  const findings = [];
  const metrics = {
    meshes: 0, triangles: 0, vertices: 0, drawCalls: 0,
    materials: 0, textures: 0, animationReady: typeof root.userData?.tick === 'function',
    bounds: null, openEdges: 0, nonManifoldEdges: 0, degenerateTriangles: 0,
    invertedNormals: 0, collapsedUVs: 0
  };
  const geometryCache = new WeakMap();
  const materialSet = new Set();
  const textureSet = new Set();
  const lo = [Infinity, Infinity, Infinity];
  const hi = [-Infinity, -Infinity, -Infinity];
  const role = options.role || 'prop';
  function add(id, severity, where, problem, fix) {
    findings.push({ id, severity, where, problem, fix });
  }
  function position(attr, i) {
    return [attr.getX(i), attr.getY(i), attr.getZ(i)];
  }
  function indexOf(geometry, i) {
    return geometry.index ? geometry.index.getX(i) : i;
  }
  function inspectGeometry(geometry, where) {
    const p = geometry.getAttribute('position');
    if (!p || !p.count) {
      add('Q01', 'HARD', where, 'Нет вершин', 'Создать реальную объёмную геометрию');
      return { triangles: 0, vertices: 0 };
    }
    const n = geometry.getAttribute('normal');
    const uv = geometry.getAttribute('uv');
    const triangles = Math.floor((geometry.index ? geometry.index.count : p.count) / 3);
    if (!n || n.count !== p.count) {
      add('Q02', 'SOFT', where, 'Нет корректных нормалей', 'Пересчитать нормали с учётом жёстких граней');
    }
    if (triangles > 80000) {
      add('Q03', 'SOFT', where, 'Слишком плотная сетка для полного анализа в браузере',
        'Подготовить LOD и проверить в офлайновом валидаторе');
      return { triangles, vertices: p.count };
    }
    if (!geometry.boundingBox) geometry.computeBoundingBox();
    const b = geometry.boundingBox;
    const diag2 = b.min.distanceToSquared(b.max) || 1;
    const tolerance = Math.max(Math.sqrt(diag2) * 1e-5, 1e-7);
    const vertexIds = new Map();
    const edges = new Map();
    let degenerate = 0;
    let invalid = 0;
    let inverted = 0;
    let collapsed = 0;
    let elongated = 0;
    function welded(i) {
      const a = position(p, i);
      const key = a.map(v => Math.round(v / tolerance)).join(',');
      if (!vertexIds.has(key)) vertexIds.set(key, vertexIds.size);
      return vertexIds.get(key);
    }
    function edge(a, b) {
      if (a === b) return;
      const k = a < b ? a + ':' + b : b + ':' + a;
      edges.set(k, (edges.get(k) || 0) + 1);
    }
    const count = triangles;
    for (let i = 0; i < count; i++) {
      const ia = indexOf(geometry, i * 3);
      const ib = indexOf(geometry, i * 3 + 1);
      const ic = indexOf(geometry, i * 3 + 2);
      if (ia >= p.count || ib >= p.count || ic >= p.count) {
        invalid++;
        continue;
      }
      const a = position(p, ia), b0 = position(p, ib), c = position(p, ic);
      if (![...a, ...b0, ...c].every(Number.isFinite)) {
        invalid++;
        continue;
      }
      const ab = b0.map((v, j) => v - a[j]);
      const ac = c.map((v, j) => v - a[j]);
      const bc = c.map((v, j) => v - b0[j]);
      const cross = [
        ab[1] * ac[2] - ab[2] * ac[1],
        ab[2] * ac[0] - ab[0] * ac[2],
        ab[0] * ac[1] - ab[1] * ac[0]
      ];
      const area2 = cross.reduce((s, v) => s + v * v, 0);
      const sides = [ab, ac, bc].map(v => v.reduce((s, x) => s + x * x, 0));
      if (area2 <= diag2 * diag2 * 1e-14) degenerate++;
      else {
        const minimum = Math.min(...sides);
        if (minimum > 0 && Math.max(...sides) / minimum > 1000) elongated++;
        if (n && n.count === p.count) {
          const normal = [ia, ib, ic].reduce((acc, ix) => {
            acc[0] += n.getX(ix);
            acc[1] += n.getY(ix);
            acc[2] += n.getZ(ix);
            return acc;
          }, [0, 0, 0]);
          const dot = cross.reduce((s, v, j) => s + v * normal[j], 0);
          const normal2 = normal.reduce((s, v) => s + v * v, 0);
          if (normal2 > 1e-9 && dot < -0.25 * Math.sqrt(area2 * normal2)) inverted++;
        }
      }
      if (uv && uv.count === p.count) {
        const uab = [uv.getX(ib) - uv.getX(ia), uv.getY(ib) - uv.getY(ia)];
        const uac = [uv.getX(ic) - uv.getX(ia), uv.getY(ic) - uv.getY(ia)];
        if (Math.abs(uab[0] * uac[1] - uab[1] * uac[0]) < 1e-11 && area2 > 1e-12) collapsed++;
      }
      const wa = welded(ia), wb = welded(ib), wc = welded(ic);
      edge(wa, wb);
      edge(wb, wc);
      edge(wc, wa);
    }
    let open = 0;
    let nonmanifold = 0;
    for (const n0 of edges.values()) {
      if (n0 === 1) open++;
      if (n0 > 2) nonmanifold++;
    }
    metrics.openEdges += open;
    metrics.nonManifoldEdges += nonmanifold;
    metrics.degenerateTriangles += degenerate;
    metrics.invertedNormals += inverted;
    metrics.collapsedUVs += collapsed;
    if (invalid) add('Q04', 'HARD', where, invalid + ' треугольников с неверными индексами/координатами',
      'Исправить повреждённую геометрию');
    if (degenerate > Math.max(2, count * .005)) {
      add('Q05', 'SOFT', where, degenerate + ' вырожденных треугольников',
        'Удалить нулевые грани при ретопологии');
    }
    if (inverted > Math.max(3, count * .02)) {
      add('Q06', 'SOFT', where, inverted + ' граней с противоположными нормалями',
        'Проверить ориентацию полигонов и сглаживание');
    }
    if (nonmanifold) {
      add('Q07', 'SOFT', where, nonmanifold + ' рёбер с более чем двумя прилегающими гранями',
        'Убрать самоналожения, дублирующиеся грани или разделить оболочки');
    }
    if (collapsed > Math.max(3, count * .02)) {
      add('Q08', 'SOFT', where, collapsed + ' граней с вырожденной UV-развёрткой',
        'Развернуть UV-острова и убрать растянутые участки');
    }
    if (elongated > count * .12 && count >= 20) {
      add('Q09', 'SOFT', where, 'Много чрезмерно вытянутых треугольников',
        'Улучшить равномерность сетки в местах деформации');
    }
    // Open surfaces can be intentional (cloth, foliage, smoke, decals).
    if (open > count * .8 && role === 'character' && count >= 40) {
      add('Q10', 'SOFT', where, 'Возможно, модель имеет открытые оболочки',
        'Проверить толщину деталей и закрытие торцов');
    }
    return { triangles, vertices: p.count };
  }
  function updateBounds(mesh) {
    const geo = mesh.geometry;
    if (!geo.boundingBox) geo.computeBoundingBox();
    const bb = geo.boundingBox;
    if (!bb || bb.isEmpty()) return;
    const m = mesh.matrixWorld.elements;
    for (const x of [bb.min.x, bb.max.x]) {
      for (const y of [bb.min.y, bb.max.y]) {
        for (const z of [bb.min.z, bb.max.z]) {
          const w = m[3] * x + m[7] * y + m[11] * z + m[15] || 1;
          const p = [
            (m[0] * x + m[4] * y + m[8] * z + m[12]) / w,
            (m[1] * x + m[5] * y + m[9] * z + m[13]) / w,
            (m[2] * x + m[6] * y + m[10] * z + m[14]) / w
          ];
          for (let k = 0; k < 3; k++) {
            lo[k] = Math.min(lo[k], p[k]);
            hi[k] = Math.max(hi[k], p[k]);
          }
        }
      }
    }
  }
  root.traverse(mesh => {
    if (!mesh.isMesh || mesh.userData?.qualityIgnore || !mesh.geometry) return;
    if (mesh.name === '__livingWatercolorOutline') return;
    metrics.meshes++;
    const where = mesh.name || ('mesh #' + metrics.meshes);
    let geom = geometryCache.get(mesh.geometry);
    if (!geom) {
      geom = inspectGeometry(mesh.geometry, where);
      geometryCache.set(mesh.geometry, geom);
    }
    const instances = mesh.isInstancedMesh ? mesh.count : 1;
    metrics.triangles += geom.triangles * instances;
    metrics.vertices += geom.vertices * instances;
    metrics.drawCalls += Array.isArray(mesh.material) && mesh.geometry.groups.length
      ? mesh.geometry.groups.length : 1;
    updateBounds(mesh);
    if (mesh.scale.x * mesh.scale.y * mesh.scale.z < 0) {
      add('Q11', 'SOFT', where, 'Отражённая геометрия: возможны инвертированные нормали',
        'Проверить backface culling и экспорт');
    }
    for (const mat of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      if (!mat) continue;
      const firstUse = !materialSet.has(mat);
      materialSet.add(mat);
      const maps = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap',
        'emissiveMap', 'alphaMap'];
      for (const name of maps) {
        const tex = mat[name];
        if (!tex) continue;
        textureSet.add(tex);
        if (!mesh.geometry.getAttribute(name === 'aoMap' ? 'uv2' : 'uv')) {
          add('Q12', 'SOFT', where, name + ' подключена без UV-координат',
            'Создать UV-развёртку для текстуры');
        }
      }
      if (!firstUse) continue;
      if (mat.roughness !== undefined && (mat.roughness < 0 || mat.roughness > 1)) {
        add('Q13', 'HARD', where, 'Некорректная roughness', 'Использовать значение 0–1');
      }
      if (mat.metalness !== undefined && (mat.metalness < 0 || mat.metalness > 1)) {
        add('Q14', 'HARD', where, 'Некорректная metalness', 'Использовать значение 0–1');
      }
      if (mat.opacity !== undefined && !Number.isFinite(mat.opacity)) {
        add('Q15', 'HARD', where, 'Некорректная прозрачность', 'Исправить opacity');
      }
    }
  });
  metrics.materials = materialSet.size;
  metrics.textures = textureSet.size;
  if (metrics.meshes === 0) add('Q16', 'HARD', 'scene', 'В модели нет мешей',
    'Создать объёмную геометрию');
  if (Number.isFinite(lo[0])) {
    const size = lo.map((v, i) => hi[i] - v);
    metrics.bounds = { min: lo, max: hi, size };
    const depth = size[2], width = size[0];
    if (role === 'character' && width > 0 && depth / width < .065) {
      add('Q17', 'HARD', 'silhouette', 'Персонаж почти плоский сбоку',
        'Достроить глубину головы, туловища, конечностей и шарниров');
    }
    if (role === 'character' && size[1] > 0 && Math.abs(lo[1]) > size[1] * .15) {
      add('Q18', 'SOFT', 'ground', 'Опорная точка значительно выше или ниже y=0',
        'Проверить землю, pivot и положение стоп');
    }
  }
  if (options.reference?.triangles && metrics.triangles > options.reference.triangles * 2) {
    add('Q19', 'SOFT', 'performance', 'Геометрия более чем вдвое тяжелее эталона',
      'Сравнить качество силуэта и сделать LOD без потери деталей');
  }
  if (options.reference?.drawCalls && metrics.drawCalls > options.reference.drawCalls * 2) {
    add('Q20', 'SOFT', 'performance', 'Вызовов отрисовки более чем вдвое больше эталона',
      'Рассмотреть instancing и группировку материалов');
  }
  return {
    passed: !findings.some(f => f.severity === 'HARD'),
    findings, metrics,
    hard: findings.filter(f => f.severity === 'HARD').length,
    soft: findings.filter(f => f.severity === 'SOFT').length
  };
}

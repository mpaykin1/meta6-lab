
// ===== ТЕЛЕФОН БЕЗ ТОРМОЗОВ (Т4) — автосклейка неподвижного: универсальный слой для three.js =====
// Смотрит 2 секунды, какие детали не двигаются относительно своего «якоря» (ближайшего движущегося родителя),
// и склеивает их по материалу в одну отрисовку. Оригиналы остаются в сцене (игра может их менять),
// но не рисуются; если игра сдвинула, спрятала или изменила деталь — она сразу возвращается в отдельный вид.
function tbtAutoBatch(THREE, scene, opt){
  opt = opt || {}; const WATCH = opt.frames || 120, MIN = opt.min || 3;
  const snap = new Map(); let frame = 0, done = false; const batches = [];
  const key16 = m => m.elements.join(',');
  function eligible(o){ return o.isMesh && !o.isInstancedMesh && !o.isSkinnedMesh && !Array.isArray(o.material) && o.geometry && o.geometry.attributes.position && !o.morphTargetInfluences && !o.userData.tbtNoBatch && o.material && !o.material.transparent; }
  function sample(){
    scene.traverse(o => { if (o === scene || o.userData.tbtBatch) return; o.updateMatrix();
      const k = key16(o.matrix) + '|' + o.visible; const s = snap.get(o);
      if (!s) snap.set(o, { k, moved: false, ver: o.geometry ? geoVer(o.geometry) : 0 }); else if (s.k !== k) s.moved = true; });
  }
  function geoVer(g){ let v = 0; for (const n in g.attributes) v += g.attributes[n].version; return v + (g.index ? g.index.version : 0); }
  function anchorOf(o){ let x = o.parent; while (x && x !== scene) { const s = snap.get(x); if (!s || s.moved) return x; x = x.parent; } return scene; }
  function chainStatic(o, anchor){ let x = o; while (x && x !== anchor) { const s = snap.get(x); if (!s || s.moved || !x.visible) return false; x = x.parent; } return true; }
  function rel(o, anchor){ const m = new THREE.Matrix4(); let x = o; const list = []; while (x && x !== anchor) { list.push(x); x = x.parent; }
    for (let i = list.length - 1; i >= 0; i--) { list[i].updateMatrix(); m.multiply(list[i].matrix); } return m; }
  function build(group){
    const { anchor, mat, members } = group; const attrs = Object.keys(members[0].geometry.attributes).filter(n => members.every(o => o.geometry.attributes[n] && o.geometry.attributes[n].itemSize === members[0].geometry.attributes[n].itemSize));
    if (!attrs.includes('position')) return null; const data = {}; attrs.forEach(n => data[n] = []);
    const nm = new THREE.Matrix3(), v = new THREE.Vector3();
    for (const o of members) { const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry; const M = rel(o, anchor); nm.getNormalMatrix(M);
      for (const n of attrs) { const a = g.attributes[n], out = data[n];
        for (let i = 0; i < a.count; i++) {
          if (n === 'position') { v.fromBufferAttribute(a, i).applyMatrix4(M); out.push(v.x, v.y, v.z); }
          else if (n === 'normal') { v.fromBufferAttribute(a, i).applyMatrix3(nm).normalize(); out.push(v.x, v.y, v.z); }
          else for (let k = 0; k < a.itemSize; k++) out.push(a.array[i * a.itemSize + k]); } }
      if (g !== o.geometry) g.dispose(); }
    const geo = new THREE.BufferGeometry(); for (const n of attrs) geo.setAttribute(n, new THREE.Float32BufferAttribute(data[n], members[0].geometry.attributes[n].itemSize));
    geo.computeBoundingSphere(); const mesh = new THREE.Mesh(geo, mat); mesh.userData.tbtBatch = true; mesh.matrixAutoUpdate = false; mesh.updateMatrix();
    mesh.renderOrder = members[0].renderOrder; mesh.frustumCulled = members.every(o => o.frustumCulled); anchor.add(mesh); return mesh;
  }
  function makeBatches(){
    const groups = new Map();
    scene.traverse(o => { if (!eligible(o) || o.userData.tbtBatch) return; const s = snap.get(o); if (!s || s.moved || geoVer(o.geometry) !== s.ver) return;
      const anchor = anchorOf(o); if (!chainStatic(o, anchor)) return;
      const k = anchor.uuid + '|' + o.material.uuid + '|' + Object.keys(o.geometry.attributes).sort().join(','); if (!groups.has(k)) groups.set(k, { anchor, mat: o.material, members: [] }); groups.get(k).members.push(o); });
    for (const g of groups.values()) { if (g.members.length < MIN) continue; const mesh = build(g); if (!mesh) continue;
      const info = { ...g, mesh, state: g.members.map(o => ({ o, k: key16(o.matrix) + '|' + o.visible, ver: geoVer(o.geometry), chain: [] })) };
      for (const st of info.state) { let x = st.o.parent; while (x && x !== g.anchor) { st.chain.push([x, key16(x.matrix) + '|' + x.visible]); x = x.parent; } st.o.layers.disable(0); }
      batches.push(info); }
  }
  function check(){
    for (let b = batches.length - 1; b >= 0; b--) { const info = batches[b]; let broken = false;
      for (const st of info.state) { const o = st.o; o.updateMatrix();
        if (key16(o.matrix) + '|' + o.visible !== st.k || geoVer(o.geometry) !== st.ver || o.material !== info.mat || !o.parent || st.chain.some(([x, k]) => { x.updateMatrix(); return key16(x.matrix) + '|' + x.visible !== k; })) { broken = true; break; } }
      if (broken) { for (const st of info.state) st.o.layers.enable(0); info.mesh.removeFromParent(); info.mesh.geometry.dispose(); batches.splice(b, 1); } }
  }
  let checkTick = 0;
  return function tick(){
    if (!done) { sample(); if (++frame >= WATCH) { makeBatches(); done = true; } return; }
    if ((++checkTick & 1) === 0) check();
  };
}

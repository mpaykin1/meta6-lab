
// ===================== ТЕЛЕФОН БЕЗ ТОРМОЗОВ (24.11.2026) — слой поверх игры, старый код не тронут =====================
// Т1/Т2: вместо 18 настоящих ламп в кадре 4: небо + 1 прожектор + 2 точечных. Лампы игры стали «виртуальными»:
//        каждый кадр в настоящие лампы переносятся самые заметные для камеры (с плавной сменой), луна вливается в небо.
// Т5:    лес больше не пересылается в видеокарту каждый кадр: позиции пересчитываются 6 раз в секунду,
//        а движение леса между пересчётами и изгиб дороги (повороты и холмы) делает шейдер.

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

(function(){
  const abTick=tbtAutoBatch(THREE,scene);
  // ---------- Т5: лес в шейдере ----------
  const FOREST=[trunks,branches,crowns,treeBands,extraCanopies,willowCurtains,bushes,oakCrowns,oakLimbs,birchTrunks,birchMarks,birchLeaves,willowDome,willowStrands];
  const UF={uShift:{value:0},uCurve:{value:0},uHill:{value:0}};
  const PROJ='vec4 mvPosition = vec4( transformed, 1.0 );\n#ifdef USE_INSTANCING\n mvPosition = instanceMatrix * mvPosition;\n float tbZ = instanceMatrix[3].z - uShift;\n#else\n float tbZ = mvPosition.z - uShift;\n#endif\n'+
    ' mvPosition.z -= uShift;\n mvPosition.x += uCurve*tbZ*tbZ*0.003;\n mvPosition.y += -uHill*tbZ*exp(-abs(tbZ)/140.0);\n'+
    ' mvPosition = modelViewMatrix * mvPosition;\n gl_Position = projectionMatrix * mvPosition;';
  for(const m of FOREST){const mat=m.material,prev=mat.onBeforeCompile;
    mat.onBeforeCompile=(sh,r)=>{if(prev)prev(sh,r);Object.assign(sh.uniforms,UF);
      sh.vertexShader='uniform float uShift,uCurve,uHill;\n'+sh.vertexShader.replace('#include <project_vertex>',PROJ);};
    mat.customProgramCacheKey=()=>'tbt-forest-gpu';mat.needsUpdate=true;}
  for(const m of FOREST)m.userData.tbtCap=m.count;
  function compact(m,cut){const a=m.instanceMatrix.array,cap=m.userData.tbtCap,c=m.instanceColor?m.instanceColor.array:null;let w=0;
    for(let i=0;i<cap;i++){const o=i*16,sx=a[o]*a[o]+a[o+1]*a[o+1]+a[o+2]*a[o+2],z=a[o+14];
      if(sx<1e-4||z<-cut||z>16)continue;
      if(w!==i){for(let k=0;k<16;k++)a[w*16+k]=a[o+k];if(c)for(let k=0;k<3;k++)c[w*3+k]=c[i*3+k];}
      w++;}
    m.count=w;m.instanceMatrix.needsUpdate=true;if(c)m.instanceColor.needsUpdate=true;}
  const forestCPU=updateForest,rcCPU=roadCenter,rhCPU=roadHeight;
  let shift=0,lastMv=0,since=99,curveNow=0,hillNow=0;
  const flat0=()=>0;
  // Сдвиг леса за кадр = тот же mv, на который игра сдвигает деревья (tr.z-=mv).
  const TR=[tree[0],tree[1],tree[2]],prevZ=TR.map(t=>t.z),placed=new Set();
  updateForest=function(){
    let mv=lastMv;for(let k=0;k<TR.length;k++){const t=TR[k];if(!placed.has(t)){const d=prevZ[k]-t.z;if(Math.abs(d)<20){mv=d;break;}}}
    for(let k=0;k<TR.length;k++)prevZ[k]=TR[k].z;placed.clear();lastMv=mv;
    since++;
    if(since>=10){since=0;shift=0;roadCenter=flat0;roadHeight=flat0;try{forestCPU();}finally{roadCenter=rcCPU;roadHeight=rhCPU;}
      // Т4: в видеокарту идут только деревья, которые видны: скрытые части и стволы глубже тумана не рисуются.
      const cut=1.85/Math.max(.012,scene.fog.density*.9)+6;for(const m of FOREST)compact(m,cut);}
    else shift+=mv;
    UF.uShift.value=shift;UF.uCurve.value=roadCurve;UF.uHill.value=hillGrade;/*groundGPU*/
  };
  // Т4: трава, кусты, камни у дороги — тоже только видимые (их игра пересчитывает каждый кадр, мы лишь не рисуем лишнее).
  for(const k of KINDS)k.mesh.userData.tbtCap=k.n;
  const scnCPU=updateScenery;updateScenery=function(dt){scnCPU(dt);const cut=1.85/Math.max(.012,scene.fog.density*.9)+6;for(const k of KINDS)compact(k.mesh,cut);};
  // Перезапуск рейса раскладывает лес заново — сразу пересчитать.
  const placeOrig=placeTree;placeTree=function(t,z){const r=placeOrig(t,z);placed.add(t);return r;};

  // ---------- Т5: холмы под землёй тоже в шейдере (раньше 1 089 точек земли пересчитывались и пересылались каждый кадр) ----------
  {const gm=ground.material,prev=gm.onBeforeCompile;
   gm.onBeforeCompile=(sh,r)=>{if(prev)prev(sh,r);sh.uniforms.uHill=UF.uHill;
     sh.vertexShader='uniform float uHill;\n'+sh.vertexShader.replace('#include <project_vertex>','vec4 tbW = modelMatrix * vec4( transformed, 1.0 );\n tbW.y += -uHill*tbW.z*exp(-abs(tbW.z)/140.0);\n vec4 mvPosition = viewMatrix * tbW;\n gl_Position = projectionMatrix * mvPosition;');};
   gm.customProgramCacheKey=()=>'tbt-ground-gpu';gm.needsUpdate=true;}
  // ---------- Т1/Т2: пул ламп ----------
  const poolP=[0,1].map(()=>{const l=new THREE.PointLight(0xffffff,0,5,2);scene.add(l);return {l,src:null,fade:0};});
  const poolS=(()=>{const l=new THREE.SpotLight(0xffffff,0,30,.4,.5,1.2);scene.add(l);scene.add(l.target);return {l,src:null,fade:0};})();
  const mine=new Set([...poolP.map(p=>p.l),poolS.l]);
  const wp=new THREE.Vector3(),wt=new THREE.Vector3(),camP=new THREE.Vector3();
  let virt=[],lastT=performance.now();
  function collect(){virt=[];scene.traverse(o=>{if(!o.isLight||mine.has(o))return;if(o.isPointLight||o.isSpotLight)virt.push(o);});}
  function shown(o){let x=o;while(x){if(!x.visible)return false;x=x.parent;}return true;}
  function score(o){if(!(o.intensity>0)||!shown(o))return -1;o.getWorldPosition(wp);const d=wp.distanceTo(camP),R=o.distance||30;
    if(d>R*1.6)return -1;return o.intensity*(1-Math.min(1,d/(R*1.6)))*(o.isSpotLight?1:1);}
  function feed(slot,best,dt){
    if(slot.src!==best){slot.fade-=dt*12;if(slot.fade<=0){slot.fade=0;slot.src=best;}}else slot.fade=Math.min(1,slot.fade+dt*12);
    const s=slot.src,l=slot.l;if(!s){l.intensity=0;return;}
    s.getWorldPosition(wp);l.position.copy(wp);l.color.copy(s.color);l.intensity=s.intensity*slot.fade;l.distance=s.distance;l.decay=s.decay;
    if(s.isSpotLight){l.angle=s.angle;l.penumbra=s.penumbra;s.target.updateMatrixWorld();s.target.getWorldPosition(wt);l.target.position.copy(wt);l.target.updateMatrixWorld();}
  }
  let frameNo=0,lastFrame=-1,hemiSaved=0,moonSaved=null;const hidden=[];
  function before(){
    const now=performance.now(),dt=Math.min(.1,(now-lastT)/1000);lastT=now;
    if(frameNo%30===0)collect();frameNo++;abTick();
    camera.getWorldPosition(camP);
    const pts=[],sps=[];for(const o of virt){const sc=score(o);if(sc<=0)continue;(o.isSpotLight?sps:pts).push([sc,o]);}
    pts.sort((a,b)=>b[0]-a[0]);sps.sort((a,b)=>b[0]-a[0]);
    // точечных два: держим уже горящие, если они всё ещё среди двух лучших (без мигания)
    const top=pts.slice(0,2).map(x=>x[1]);
    const keep=poolP.map(p=>top.includes(p.src)?p.src:null);const rest=top.filter(o=>!keep.includes(o));
    poolP.forEach((p,i)=>feed(p,keep[i]||rest.shift()||null,dt));
    feed(poolS,sps.length?sps[0][1]:null,dt);
    for(const o of virt)if(o.visible){o.visible=false;hidden.push(o);}
    // луна: её мягкий свет вливается в небо
    moonSaved=null;if(moon.visible){moonSaved=moon.intensity;hemiSaved=hemi.intensity;hemi.intensity+=moon.intensity*.8;moon.visible=false;}
  }
  function after(){for(const o of hidden)o.visible=true;hidden.length=0;if(moonSaved!==null){moon.visible=true;hemi.intensity=hemiSaved;moonSaved=null;}}
  const renderOrig=renderer.render.bind(renderer);
  renderer.render=function(s,c){if(s!==scene)return renderOrig(s,c);before();try{return renderOrig(s,c);}finally{after();}};
  collect();
})();

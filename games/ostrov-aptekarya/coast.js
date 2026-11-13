import * as T from 'three';
import {shoreX} from '../../reference/ink-fallen-guardian/ink-world.js';

// Живой берег острова и море поверх эталона INK (файлы эталона не меняются).
// Правило «БЕЗ РОВНЫХ КРАЁВ»: берег = старый контур + неровный отступ наружу (шум fbm + мысы),
// песчаная полоса разной ширины, обрывчик, камни из генератора эталона, островки, море с отмелью.

// ---------- шум без повторяющегося узора ----------
const h1 = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
function noise1(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return h1(i) * (1 - u) + h1(i + 1) * u; }
function fbm1(x, seed = 0) { let a = .5, s = 0, n = 0; for (let o = 0; o < 4; o++) { s += a * noise1(x * (1 << o) + seed * 17.3 + o * 31.7); n += a; a *= .5; } return s / n; }

// ---------- контур старого острова (мировые координаты) ----------
function oldOutline() {
  const pts = [];
  for (let z = -21; z <= 21; z += .35) pts.push([shoreX(z), z, 1]);                // восток: берег озера, флаг 1
  const quad = (a, c, b, n) => { for (let i = 1; i <= n; i++) { const t = i / n, u = 1 - t; pts.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1], 0]); } };
  const line = (a, b, n) => { for (let i = 1; i <= n; i++) { const t = i / n; pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, 0]); } };
  line([shoreX(21), 21], [-18, 21], 70);
  quad([-18, 21], [-22, 19], [-22, 14], 14);
  line([-22, 14], [-22, -14], 80);
  quad([-22, -14], [-22, -21], [-15, -21], 14);
  line([-15, -21], [shoreX(-21), -21], 64);
  return pts;
}
function normals(pts, smooth) {
  let area = 0; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; area += a[0] * b[1] - b[0] * a[1]; }
  const sgn = area > 0 ? 1 : -1, n = pts.length;
  return pts.map((_, i) => {
    const a = pts[(i - smooth + n) % n], b = pts[(i + smooth) % n];
    let tx = b[0] - a[0], tz = b[1] - a[1]; const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
    return [tz * sgn, -tx * sgn];   // наружу
  });
}
function chaikin(pts, keep) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    if (keep(a) && keep(b)) { out.push(a); continue; }
    out.push([a[0] * .75 + b[0] * .25, a[1] * .75 + b[1] * .25, a[2]], [a[0] * .25 + b[0] * .75, a[1] * .25 + b[1] * .75, a[2]]);
  }
  return out;
}

export function createCoast({scene, paint, makers, seed = 7}) {
  const base = oldOutline(), bn = normals(base, 3), N = base.length;
  // Отступ наружу: 0 у озера с причалом, дальше — неровно, с двумя мысами и бухтами (только наружу — сюжетные места не трогаем).
  const capes = [[.36, 7.5, .035], [.62, 5.5, .03], [.83, 4, .025]];
  let coast = base.map((p, i) => {
    const s = i / N;
    // Берег озера (восток) — как в эталоне; у углов озера отступ плавно растёт, чтобы суша не наползла на воду.
    const corner = Math.min(Math.hypot(p[0] - shoreX(21), p[1] - 21), Math.hypot(p[0] - shoreX(-21), p[1] + 21));
    const east = p[2] === 1 ? 1 : 1 - T.MathUtils.smoothstep(corner, 0, 7);
    let o = .6 + 4.6 * Math.pow(fbm1(s * 9, seed), 1.5) + 2.6 * fbm1(s * 24, seed + 2) + .9 * fbm1(s * 70, seed + 4);
    for (const [c, amp, w] of capes) { const d = Math.min(Math.abs(s - c), 1 - Math.abs(s - c)); o += amp * Math.exp(-(d * d) / (w * w)); }
    o *= 1 - east;
    return [p[0] + bn[i][0] * o, p[1] + bn[i][1] * o, p[2] === 1 ? 1 : 0];
  });
  coast = chaikin(coast, p => p[2] === 1);
  const cn = normals(coast, 5), M = coast.length;
  // Ширина пляжа гуляет: где-то узкая кромка, где-то широкая песчаная коса.
  const beach = coast.map((p, i) => p[2] === 1 ? .5 : .3 + .9 * fbm1(i / M * 14, seed + 5));
  const inner = coast.map((p, i) => [p[0] - cn[i][0] * beach[i], p[1] - cn[i][1] * beach[i]]);

  const group = new T.Group(); group.name = 'Живой берег и море'; scene.add(group);
  const shapeOf = pts => { const s = new T.Shape(); pts.forEach(([x, z], i) => i ? s.lineTo(x, -z) : s.moveTo(x, -z)); s.closePath(); return s; };
  function flat(pts, color, y) {
    const geo = new T.ShapeGeometry(shapeOf(pts)); geo.rotateX(-Math.PI / 2);
    const m = new T.Mesh(geo, new T.MeshStandardMaterial({color, roughness: .9, side: T.DoubleSide}));
    m.position.y = y; m.userData.watercolorOutline = false; group.add(m); return m;
  }
  flat(coast, '#cdbd96', -.028);                  // песок по всему краю
  flat(inner, '#b6bea3', -.022);                  // трава острова (тот же цвет, что в эталоне)
  // Обрывчик над водой: стенка от воды до песка, земляной цвет.
  const wall = [], idx = [];
  coast.forEach(([x, z]) => wall.push(x, -.028, z, x + 0, -.5, z));
  for (let i = 0; i < M; i++) { const a = i * 2, b = ((i + 1) % M) * 2; idx.push(a, b, a + 1, a + 1, b, b + 1); }
  const wg = new T.BufferGeometry(); wg.setAttribute('position', new T.Float32BufferAttribute(wall, 3)); wg.setIndex(idx); wg.computeVertexNormals();
  const wallMesh = new T.Mesh(wg, new T.MeshStandardMaterial({color: '#9a8c6e', roughness: 1, side: T.DoubleSide}));
  wallMesh.userData.watercolorOutline = false; group.add(wallMesh);
  // Чернильная линия кромки — как перо в иллюстрации.
  const edge = new T.LineLoop(new T.BufferGeometry().setFromPoints(coast.map(([x, z]) => new T.Vector3(x, -.02, z))),
    new T.LineBasicMaterial({color: '#4d5a52', transparent: true, opacity: .45}));
  group.add(edge);

  // ---------- море: кольца от берега наружу, у каждой вершины своё «расстояние до берега» ----------
  const D = [0, .18, .45, .9, 1.5, 2.3, 3.4, 4.8, 6.8, 9.5, 13, 18, 26, 40, 70, 130, 240];
  const sp = [], sd = [], si = [];
  for (const d of D) {
    const w = T.MathUtils.smoothstep(d, 4, 30);
    coast.forEach(([x, z], i) => {
      const r = Math.hypot(x, z) || 1;
      const ax = x + cn[i][0] * d, az = z + cn[i][1] * d, bx = x / r * (r + d), bz = z / r * (r + d);
      sp.push(ax + (bx - ax) * w, 0, az + (bz - az) * w); sd.push(d);
    });
  }
  for (let k = 0; k < D.length - 1; k++) for (let i = 0; i < M; i++) {
    const a = k * M + i, b = k * M + (i + 1) % M, c = a + M, e = b + M; si.push(a, c, b, b, c, e);
  }
  const seaGeo = new T.BufferGeometry();
  seaGeo.setAttribute('position', new T.Float32BufferAttribute(sp, 3)); seaGeo.setAttribute('aDist', new T.Float32BufferAttribute(sd, 1));
  seaGeo.setIndex(si); seaGeo.computeBoundingSphere();
  // Цвета — с эскиза владельца (Nookvale): бирюзово-синяя глубина, светлая отмель, тёплые отблески.
  const C = c => new T.Color(c);
  const sea = new T.Mesh(seaGeo, new T.ShaderMaterial({
    fog: true, side: T.DoubleSide,
    uniforms: T.UniformsUtils.merge([T.UniformsLib.fog, {
      uTime: {value: 0}, uDusk: {value: 0},
      cDeep: {value: C('#2f5a66')}, cMid: {value: C('#41707b')}, cShallow: {value: C('#6f9c9b')},
      cShore: {value: C('#a7b9a0')}, cWarm: {value: C('#c98d6c')}, cFoam: {value: C('#e8e6d6')}, cInk: {value: C('#24434c')}
    }]),
    vertexShader: `attribute float aDist; varying float vDist; varying vec3 vW;
      #include <fog_pars_vertex>
      void main(){ vDist=aDist; vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; vec4 mvPosition=viewMatrix*w;
        gl_Position=projectionMatrix*mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: `uniform float uTime,uDusk; uniform vec3 cDeep,cMid,cShallow,cShore,cWarm,cFoam,cInk;
      varying float vDist; varying vec3 vW;
      #include <fog_pars_fragment>
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
      float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<3;i++){s+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s/.875;}
      void main(){
        float d=vDist;
        vec3 col=mix(cShore,cShallow,smoothstep(0.,.9,d));
        col=mix(col,cMid,smoothstep(.7,5.,d));
        col=mix(col,cDeep,smoothstep(4.,20.,d));
        // Дёшево для телефона: 2 fbm по 3 октавы на пиксель, координаты искривлены шумом (без узора).
        vec2 p=vW.xz*.11;
        vec2 q=vec2(noise(p*1.3+uTime*.02),noise(p*1.3+vec2(5.2,1.3)-uTime*.016));
        float n=fbm(p*1.7+q*1.8);
        col*=.86+.28*n;
        float streak=fbm(vW.xz*vec2(.55,1.9)+q*2.2+vec2(uTime*.05,0.));
        col=mix(col,cInk,smoothstep(.6,.82,streak)*.32*smoothstep(.4,3.,d));
        col=mix(col,cFoam,smoothstep(.70,.9,1.-streak)*.08*smoothstep(1.,6.,d));
        col=mix(col,cWarm,smoothstep(.6,.85,n*.6+q.x*.5)*.24*smoothstep(3.,16.,d));
        float lap=sin(d*8.5-uTime*1.5+n*5.)*.5+.5;
        float foam=smoothstep(.62,1.,lap)*(1.-smoothstep(.0,.6,d))*.8+(1.-smoothstep(0.,.1,d));
        col=mix(col,cFoam,clamp(foam,0.,.85));
        vec2 g=vW.xz*.85, id=floor(g), f=fract(g)-.5; float hh=hash(id);
        float ph=fract(uTime*.5+hh); float rr=length(f-(vec2(hash(id+3.),hash(id+7.))-.5)*.5);
        col=mix(col,cFoam,smoothstep(.025,0.,abs(rr-ph*.3))*(1.-ph)*step(.82,hh)*.22*smoothstep(.3,1.,d));
        col*=mix(1.,.7,uDusk);
        gl_FragColor=vec4(col,1.);
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`
  }));
  sea.position.y = -.12; sea.frustumCulled = false; sea.renderOrder = -1; scene.add(sea);

  // ---------- камни на кромке и островки — генератор камней эталона ----------
  const rocks = new T.Group(); group.add(rocks);
  let r = seed * 13.7; const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
  for (let k = 0; k < 46; k++) {
    const i = Math.floor(rnd() * M), p = coast[i]; if (p[2] === 1) continue;
    const out = -.3 + rnd() * .9, o = makers.rock(k + 3);
    o.position.set(p[0] + cn[i][0] * out, -.08, p[1] + cn[i][1] * out); o.scale.setScalar(.45 + rnd() * .9); o.rotation.y = rnd() * 6.3;
    rocks.add(o);
  }
  const islets = [];
  for (let k = 0; k < 5; k++) {
    const i = Math.floor((.12 + k * .19 + rnd() * .05) * M) % M, p = coast[i]; if (p[2] === 1) continue;
    const d = 4.5 + rnd() * 6, cx = p[0] + cn[i][0] * d, cz = p[1] + cn[i][1] * d;
    const isle = new T.Group(); isle.position.set(cx, -.1, cz); rocks.add(isle);
    for (let j = 0; j < 3 + Math.floor(rnd() * 3); j++) {
      const o = makers.rock(40 + k * 7 + j); o.position.set((rnd() - .5) * 1.6, 0, (rnd() - .5) * 1.6); o.scale.setScalar(.7 + rnd() * .9); isle.add(o);
    }
    if (k % 2 === 0) { const f = makers.fir(60 + k); f.scale.setScalar(.45 + rnd() * .2); f.position.set(.2, .05, -.1); isle.add(f); }
    islets.push(isle);
  }
  paint.apply(group, {seed: 'ink-coast-' + seed});

  // Ходить можно и по новой земле (кроме воды), а в старых границах — как в эталоне.
  const poly = inner.filter((_, i) => i % 3 === 0);
  function inside(x, z) {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, zi] = poly[i], [xj, zj] = poly[j];
      if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c;
    }
    return c;
  }
  function extendWalk(canWalk) {
    return (x, z) => {
      if (x >= -20.5 && x <= 21 && z >= -20 && z <= 20) return canWalk(x, z);
      return x < shoreX(z) - .25 && inside(x, z);
    };
  }
  return {
    group, sea, extendWalk,
    tick(t, dusk) { sea.material.uniforms.uTime.value = t; sea.material.uniforms.uDusk.value = dusk; islets.forEach((s, i) => s.position.y = -.1 + Math.sin(t * .4 + i) * .01); }
  };
}

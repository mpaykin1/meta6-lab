// Source: owner Пепельный путь — ассет-пак(1).html, geometry/animation factory only.
// Original asset definitions preserved; no viewer, renderer, HUD or loop copied.
export function createAshFactory(THREE){
/* ПЕПЕЛЬНЫЙ ПУТЬ — воксель/пиксель ассет-пак. Ядро: утилиты, палитра, глобальные юниформы. */

const TAU = Math.PI * 2, PI = Math.PI;
const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
const lerp = (a, b, t) => a + (b - a) * t;
const damp = (a, b, l, dt) => a + (b - a) * (1 - Math.exp(-l * dt));
const sstep = (a, b, x) => { x = clamp((x - a) / (b - a)); return x * x * (3 - 2 * x); };
const wrapA = a => { a = (a + PI) % TAU; if (a < 0) a += TAU; return a - PI; };
function rng(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const hash3 = (x, y, z) => { let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(z | 0, 2147483647); h = Math.imul(h ^ h >>> 13, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967296; };
const hex = h => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];

/* Рампы со сдвигом оттенка: тени — в сине-фиолетовый, света — в тёплый. 5 ступеней, тёмная → светлая. */
const RAMP_NAMES = ['steel', 'rust', 'ochre', 'dirt', 'bone', 'dead', 'red', 'cyan', 'cloth'];
const RAMPS = {
  steel: ['#17161f', '#262633', '#3a3b4d', '#565968', '#7d8190'],
  rust:  ['#2a1612', '#4a2417', '#733319', '#a24a1f', '#c9732c'],
  ochre: ['#5a2f10', '#9a5a14', '#d98a1e', '#f0b03a', '#ffd978'],
  dirt:  ['#1a1512', '#2b221b', '#3f3226', '#594632', '#7a6044'],
  bone:  ['#25252b', '#3d3d45', '#5c5c64', '#85858a', '#b0aea8'],
  dead:  ['#14170f', '#232814', '#38401d', '#545c2a', '#7a8238'],
  red:   ['#3a0a12', '#7a1220', '#c4202e', '#ff3d4a', '#ff9a9a'],
  cyan:  ['#0c2a3a', '#14587a', '#2a9cc4', '#6fdcff', '#d4f6ff'],
  cloth: ['#1b1620', '#2d2536', '#473b52', '#6a5a73', '#928093']
};
const GLOWS = { gAmber: [1, .62, .16, 3.2], gOrange: [1, .34, .08, 3.2], gRed: [1, .16, .2, 3.6], gCyan: [.3, .85, 1, 3.2], gWhite: [1, .95, .85, 3.4], gGreen: [.4, 1, .5, 2.6] };
const PAL = [{ c: [0, 0, 0], e: 0, n: 'empty' }];
const K = {};
RAMP_NAMES.forEach(n => RAMPS[n].forEach((h, i) => { K[n + i] = PAL.length; PAL.push({ c: hex(h), e: 0, n: n + i }); }));
Object.entries(GLOWS).forEach(([n, v]) => { K[n] = PAL.length; PAL.push({ c: [v[0], v[1], v[2]], e: v[3], n }); });
const RAMP_FLAT = RAMP_NAMES.flatMap(n => RAMPS[n].map(h => new THREE.Vector3(...hex(h))));

/* Глобальные юниформы: рычаги атмосферы. Все материалы ссылаются на одни и те же объекты. */
const GU = {
  uTime: { value: 0 },
  uSunDir: { value: new THREE.Vector3(-.5, .75, .35).normalize() },
  uSunCol: { value: new THREE.Vector3(.72, .7, .78) },
  uAmbCol: { value: new THREE.Vector3(.5, .52, .6) },
  uRim: { value: new THREE.Vector3(.16, .14, .22) },
  uFogCol: { value: new THREE.Vector3(.36, .36, .4) },
  uFogD: { value: .02 },
  uFogH: { value: 1.2 },
  uGlowK: { value: 1 },
  uPL: { value: [0, 1, 2, 3].map(() => new THREE.Vector4(0, -99, 0, 1)) },
  uPC: { value: [0, 1, 2, 3].map(() => new THREE.Vector3()) },
  tAtlas: { value: null },
  tAnim: { value: null },
  tFx: { value: null }
};
const GLSL_COMMON = `
uniform float uTime,uFogD,uFogH,uGlowK;
uniform vec3 uSunDir,uSunCol,uAmbCol,uRim,uFogCol;
uniform vec4 uPL[4];
uniform vec3 uPC[4];
float h11(float p){p=fract(p*.1031);p*=p+33.33;p*=p+p;return fract(p);}
float h21(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*vn(p);p=p*2.03+17.1;a*=.5;}return s;}
vec3 pointLights(vec3 wp,vec3 n){vec3 s=vec3(0.);for(int i=0;i<4;i++){vec3 d=uPL[i].xyz-wp;float l=length(d)+1e-4;float a=clamp(1.-l/uPL[i].w,0.,1.);a*=a;s+=uPC[i]*a*(.35+.65*max(dot(n,d/l),0.));}return s;}
vec3 applyFog(vec3 lit,vec3 em,vec3 wp){float d=length(wp-cameraPosition);float f=1.-exp(-uFogD*uFogD*d*d);f=clamp(f*(1.+uFogH*exp(-max(wp.y,0.)*.22)),0.,1.);return mix(lit,uFogCol,f)+em*(1.-f*.62);}
`;

/* Воксельная сетка, меширование с AO, материал, экспорт .vox и ZIP. */
class Grid {
  constructor(x0, y0, z0, x1, y1, z1) {
    this.x0 = x0; this.y0 = y0; this.z0 = z0; this.x1 = x1; this.y1 = y1; this.z1 = z1;
    this.w = x1 - x0 + 1; this.h = y1 - y0 + 1; this.d = z1 - z0 + 1;
    this.v = new Uint8Array(this.w * this.h * this.d);
  }
  i(x, y, z) { return (x - this.x0) + this.w * ((y - this.y0) + this.h * (z - this.z0)); }
  inb(x, y, z) { return x >= this.x0 && x <= this.x1 && y >= this.y0 && y <= this.y1 && z >= this.z0 && z <= this.z1; }
  set(x, y, z, c) { x = Math.round(x); y = Math.round(y); z = Math.round(z); if (this.inb(x, y, z)) this.v[this.i(x, y, z)] = c; return this; }
  get(x, y, z) { return this.inb(x, y, z) ? this.v[this.i(x, y, z)] : 0; }
  box(xa, ya, za, xb, yb, zb, c) {
    const x0 = Math.min(xa, xb), x1 = Math.max(xa, xb), y0 = Math.min(ya, yb), y1 = Math.max(ya, yb), z0 = Math.min(za, zb), z1 = Math.max(za, zb);
    for (let z = z0; z <= z1; z++) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.set(x, y, z, c);
    return this;
  }
  ell(cx, cy, cz, rx, ry, rz, c) {
    for (let z = Math.floor(cz - rz); z <= Math.ceil(cz + rz); z++) for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const a = (x - cx) / rx, b = (y - cy) / ry, d = (z - cz) / rz;
      if (a * a + b * b + d * d <= 1.02) this.set(x, y, z, c);
    }
    return this;
  }
  sph(cx, cy, cz, r, c) { return this.ell(cx, cy, cz, r, r, r, c); }
  /* цилиндр вдоль оси ax ('x'|'y'|'z') от a0 до a1; (u,v) — центр в двух других осях (по порядку осей) */
  cyl(ax, a0, a1, u, v, r, c, hole = 0) {
    const lo = Math.min(a0, a1), hi = Math.max(a0, a1);
    for (let a = lo; a <= hi; a++) for (let p = Math.floor(u - r); p <= Math.ceil(u + r); p++) for (let q = Math.floor(v - r); q <= Math.ceil(v + r); q++) {
      const d = (p - u) * (p - u) + (q - v) * (q - v);
      if (d > r * r + .25 || (hole && d < hole * hole)) continue;
      if (ax === 'y') this.set(p, a, q, c); else if (ax === 'x') this.set(a, p, q, c); else this.set(p, q, a, c);
    }
    return this;
  }
  line(x0, y0, z0, x1, y1, z1, c, r = 0) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0), 1);
    for (let i = 0; i <= n; i++) {
      const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t, z = z0 + (z1 - z0) * t;
      if (r <= 0) this.set(x, y, z, c); else this.box(Math.round(x) - r, Math.round(y) - r, Math.round(z) - r, Math.round(x) + r, Math.round(y) + r, Math.round(z) + r, c);
    }
    return this;
  }
  each(fn) { for (let z = this.z0; z <= this.z1; z++) for (let y = this.y0; y <= this.y1; y++) for (let x = this.x0; x <= this.x1; x++) { const c = this.v[this.i(x, y, z)]; if (c) fn(x, y, z, c); } }
  count() { let n = 0; for (let i = 0; i < this.v.length; i++) if (this.v[i]) n++; return n; }
  /* зеркало по плоскости x=0 (сетка должна быть симметрична по x: x0 = -x1-1) */
  mir() { this.each((x, y, z, c) => { if (!this.get(-x - 1, y, z)) this.set(-x - 1, y, z, c); }); return this; }
  /* ржавчина/износ: часть вокселей из списка → другой цвет */
  wear(from, to, p, seed = 7) { const r = rng(seed); this.each((x, y, z, c) => { if (from.includes(c) && r() < p) this.set(x, y, z, Array.isArray(to) ? to[(r() * to.length) | 0] : to); }); return this; }
  /* повреждение: выбить случайные открытые воксели */
  dent(p, seed = 9, keep = []) { const r = rng(seed), del = []; this.each((x, y, z, c) => { if (keep.includes(c)) return; if (!(this.get(x, y + 1, z) && this.get(x, y - 1, z) && this.get(x + 1, y, z) && this.get(x - 1, y, z) && this.get(x, y, z + 1) && this.get(x, y, z - 1)) && r() < p) del.push([x, y, z]); }); del.forEach(d => this.set(d[0], d[1], d[2], 0)); return this; }
  /* верхний слой покрасить (засыпать пеплом/мхом) */
  cap(c, p = 1, seed = 5, only) { const r = rng(seed), up = []; this.each((x, y, z, v) => { if (!this.get(x, y + 1, z) && (!only || only.includes(v)) && r() < p) up.push([x, y, z]); }); up.forEach(d => this.set(d[0], d[1], d[2], c)); return this; }
}

const FACES = [];
for (let a = 0; a < 3; a++) for (const s of [1, -1]) FACES.push({ a, s, u: (a + 1) % 3, v: (a + 2) % 3 });
const CORN = [[0, 0], [1, 0], [1, 1], [0, 1]];
const AOV = [.4, .6, .8, 1];

function meshGrid(g, joint, vs) {
  const P = [], N = [], C = [], E = [], A = [], I = [];
  let vi = 0;
  const j = joint || [0, 0, 0];
  g.each((x, y, z, c) => {
    const pal = PAL[c], jit = .93 + .14 * hash3(x, y, z);
    for (const f of FACES) {
      const n = [0, 0, 0]; n[f.a] = f.s;
      if (g.get(x + n[0], y + n[1], z + n[2])) continue;
      const base = [x + n[0], y + n[1], z + n[2]];
      const aoL = [];
      const vv = [];
      for (let k = 0; k < 4; k++) {
        const su = CORN[k][0], sv = CORN[k][1];
        const p = [x, y, z]; p[f.a] += f.s > 0 ? 1 : 0; p[f.u] += su; p[f.v] += sv;
        const du = su ? 1 : -1, dv = sv ? 1 : -1;
        const t1 = base.slice(); t1[f.u] += du;
        const t2 = base.slice(); t2[f.v] += dv;
        const t3 = base.slice(); t3[f.u] += du; t3[f.v] += dv;
        const s1 = g.get(t1[0], t1[1], t1[2]) ? 1 : 0, s2 = g.get(t2[0], t2[1], t2[2]) ? 1 : 0, s3 = g.get(t3[0], t3[1], t3[2]) ? 1 : 0;
        const ao = (s1 && s2) ? 0 : 3 - (s1 + s2 + s3);
        vv.push(p); aoL.push(AOV[ao]);
      }
      const ord = f.s > 0 ? [0, 1, 2, 3] : [0, 3, 2, 1];
      for (const k of ord) {
        const p = vv[k];
        P.push((p[0] - j[0]) * vs, (p[1] - j[1]) * vs, (p[2] - j[2]) * vs);
        N.push(n[0], n[1], n[2]);
        C.push(pal.c[0] * jit, pal.c[1] * jit, pal.c[2] * jit);
        E.push(pal.e); A.push(aoL[k]);
      }
      const a0 = aoL[ord[0]], a1 = aoL[ord[1]], a2 = aoL[ord[2]], a3 = aoL[ord[3]];
      if (a0 + a2 < a1 + a3) I.push(vi + 1, vi + 2, vi + 3, vi + 1, vi + 3, vi);
      else I.push(vi, vi + 1, vi + 2, vi, vi + 2, vi + 3);
      vi += 4;
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  geo.setAttribute('aCol', new THREE.Float32BufferAttribute(C, 3));
  geo.setAttribute('aEm', new THREE.Float32BufferAttribute(E, 1));
  geo.setAttribute('aAo', new THREE.Float32BufferAttribute(A, 1));
  geo.setIndex(vi > 65000 ? new THREE.Uint32BufferAttribute(I, 1) : new THREE.Uint16BufferAttribute(I, 1));
  geo.computeBoundingSphere();
  return geo;
}

const VOX_VERT = `
attribute vec3 aCol; attribute float aEm; attribute float aAo;
varying vec3 vN,vC,vW; varying float vE,vA;
void main(){ vec4 wp=modelMatrix*vec4(position,1.); vW=wp.xyz; vN=normalize(mat3(modelMatrix)*normal); vC=aCol; vE=aEm; vA=aAo; gl_Position=projectionMatrix*viewMatrix*wp; }`;
const VOX_FRAG = GLSL_COMMON + `
uniform float uGlow,uHit,uDis; uniform vec3 uTint;
varying vec3 vN,vC,vW; varying float vE,vA;
void main(){
  if(uDis>0.){ float h=fract(sin(dot(floor(vW*9.),vec3(12.9898,78.233,37.719)))*43758.5453); if(h<uDis) discard; }
  vec3 N=normalize(vN); vec3 V=normalize(cameraPosition-vW);
  float dif=max(dot(N,uSunDir),0.); float hemi=N.y*.5+.5;
  vec3 base=vC*uTint;
  vec3 lit=base*(uAmbCol*(.5+.5*hemi)+uSunCol*dif+pointLights(vW,N))*vA;
  lit+=uRim*pow(1.-max(dot(N,V),0.),3.)*vA*.6;
  lit+=vec3(1.,.55,.25)*uHit;
  vec3 em=vC*vE*uGlow*uGlowK;
  gl_FragColor=vec4(applyFog(lit,em,vW),1.);
}`;
function voxMat(extra) {
  return new THREE.ShaderMaterial({
    uniforms: Object.assign({}, GU, { uGlow: { value: 1 }, uHit: { value: 0 }, uDis: { value: 0 }, uTint: { value: new THREE.Vector3(1, 1, 1) } }, extra || {}),
    vertexShader: VOX_VERT, fragmentShader: VOX_FRAG
  });
}

/* ---------- .vox (MagicaVoxel) ---------- */
function modelVoxels(def) {
  const out = []; let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
  def.parts.forEach(p => p.grid.each((x, y, z, c) => { out.push([x, y, z, c]); mn = [Math.min(mn[0], x), Math.min(mn[1], y), Math.min(mn[2], z)]; mx = [Math.max(mx[0], x), Math.max(mx[1], y), Math.max(mx[2], z)]; }));
  return { v: out, mn, mx };
}
function writeVox(def) {
  const { v, mn, mx } = modelVoxels(def);
  const sx = Math.min(256, mx[0] - mn[0] + 1), sy = Math.min(256, mx[2] - mn[2] + 1), sz = Math.min(256, mx[1] - mn[1] + 1); // vox: z вверх
  const vox = v.filter(a => a[0] - mn[0] < 256 && a[2] - mn[2] < 256 && a[1] - mn[1] < 256);
  const xyziSize = 4 + vox.length * 4, sizeChunk = 12 + 12, xyziChunk = 12 + xyziSize, rgbaChunk = 12 + 1024;
  const total = 8 + 12 + sizeChunk + xyziChunk + rgbaChunk;
  const buf = new ArrayBuffer(total), dv = new DataView(buf), u8 = new Uint8Array(buf);
  let o = 0; const w32 = x => { dv.setUint32(o, x, true); o += 4; }; const wid = s => { for (let i = 0; i < 4; i++) u8[o++] = s.charCodeAt(i); };
  wid('VOX '); w32(150); wid('MAIN'); w32(0); w32(sizeChunk + xyziChunk + rgbaChunk);
  wid('SIZE'); w32(12); w32(0); w32(sx); w32(sy); w32(sz);
  wid('XYZI'); w32(xyziSize); w32(0); w32(vox.length);
  vox.forEach(a => { u8[o++] = a[0] - mn[0]; u8[o++] = a[2] - mn[2]; u8[o++] = a[1] - mn[1]; u8[o++] = a[3]; });
  wid('RGBA'); w32(1024); w32(0);
  for (let i = 0; i < 256; i++) { const p = PAL[i + 1]; const c = p ? p.c : [0, 0, 0]; u8[o++] = Math.min(255, Math.round(c[0] * 255)); u8[o++] = Math.min(255, Math.round(c[1] * 255)); u8[o++] = Math.min(255, Math.round(c[2] * 255)); u8[o++] = 255; }
  // палитра .vox сдвинута на 1: индекс цвета i в XYZI указывает на RGBA[i-1] — наши индексы начинаются с 1, ровно так
  return new Uint8Array(buf);
}

/* ---------- ZIP (без сжатия) ---------- */
const CRC_T = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ c >>> 1 : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = u8 => { let c = 0xFFFFFFFF; for (let i = 0; i < u8.length; i++) c = CRC_T[(c ^ u8[i]) & 255] ^ c >>> 8; return (c ^ 0xFFFFFFFF) >>> 0; };
function makeZip(files) { // files: [{name, data:Uint8Array}]
  const enc = new TextEncoder(), parts = [], cen = []; let off = 0;
  files.forEach(f => {
    const nm = enc.encode(f.name), crc = crc32(f.data), sz = f.data.length;
    const h = new DataView(new ArrayBuffer(30)); h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true); h.setUint16(10, 0, true); h.setUint16(12, 0x21, true); h.setUint32(14, crc, true); h.setUint32(18, sz, true); h.setUint32(22, sz, true); h.setUint16(26, nm.length, true); h.setUint16(28, 0, true);
    parts.push(new Uint8Array(h.buffer), nm, f.data);
    const c = new DataView(new ArrayBuffer(46)); c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(12, 0, true); c.setUint16(14, 0x21, true); c.setUint32(16, crc, true); c.setUint32(20, sz, true); c.setUint32(24, sz, true); c.setUint16(28, nm.length, true); c.setUint32(42, off, true);
    cen.push(new Uint8Array(c.buffer), nm);
    off += 30 + nm.length + sz;
  });
  let csz = 0; cen.forEach(a => csz += a.length);
  const e = new DataView(new ArrayBuffer(22)); e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, csz, true); e.setUint32(16, off, true);
  return new Blob([...parts, ...cen, new Uint8Array(e.buffer)], { type: 'application/zip' });
}
function saveAnchor(blob, name) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2500);
}
function saveBlob(blob, name) {
  const cl = window.claude;
  if (cl && cl.use) { cl.use('downloads').then(d => d ? d.save({ filename: name, data: blob }).catch(e => { if (e && (e.code === 'rejected_extension' || e.code === 'unavailable')) saveAnchor(blob, name); }) : saveAnchor(blob, name)).catch(() => saveAnchor(blob, name)); }
  else saveAnchor(blob, name);
}

/* ===== 3D-модели: определения, экземпляры, гуманоиды, шагоходы ===== */
const MODELS = [];
class Def {
  constructor(id, name, cat, vs, o = {}) {
    Object.assign(this, { id, name, cat, vs, parts: [], tags: o.tags || '', modes: o.modes || ['idle'], desc: o.desc || '', period: o.period || 1, anim: null, geos: null });
    MODELS.push(this);
  }
  add(name, grid, joint, parent) { this.parts.push({ name, grid, joint: joint || [0, 0, 0], parent: parent || null }); return grid; }
  stats() {
    if (this._st) return this._st;
    let n = 0; const { mn, mx } = modelVoxels(this);
    this.parts.forEach(p => n += p.grid.count());
    return this._st = { voxels: n, size: [(mx[0] - mn[0] + 1) * this.vs, (mx[1] - mn[1] + 1) * this.vs, (mx[2] - mn[2] + 1) * this.vs], mn, mx };
  }
}
function ensureGeos(def) { if (!def.geos) def.geos = {}; def.parts.forEach(pt => { if (!def.geos[pt.name]) def.geos[pt.name] = meshGrid(pt.grid, pt.joint, def.vs); }); return def.geos; }
function instance(def, mat) {
  const root = new THREE.Group(), p = {};
  mat = mat || voxMat();
  ensureGeos(def);
  def.parts.forEach(pt => {
    const geo = def.geos[pt.name];
    const g = new THREE.Group(); g.name = pt.name; g.add(new THREE.Mesh(geo, mat));
    const par = pt.parent ? def.parts.find(q => q.name === pt.parent) : null, pj = par ? par.joint : [0, 0, 0];
    g.position.set((pt.joint[0] - pj[0]) * def.vs, (pt.joint[1] - pj[1]) * def.vs, (pt.joint[2] - pj[2]) * def.vs);
    g.userData.base = g.position.clone();
    p[pt.name] = g; (par ? p[par.name] : root).add(g);
  });
  const inst = { def, root, p, mat, st: {} };
  return inst;
}
function animate(inst, t, o) { if (inst.def.anim) inst.def.anim(inst, t, o || {}); }
const RZ = (g, x, y, z) => g && g.rotation.set(x, y, z);

/* ---------- гуманоиды: странник, мародёр, солдат ---------- */
function humanoid(id, name, o) {
  const d = new Def(id, name, 'anim', .1, { modes: ['idle', 'walk', 'aim'], tags: o.tags, desc: o.desc });
  const T = o.top, P = o.pants, B = o.boots;
  let g = new Grid(-3, 8, -2, 2, 10, 1); g.box(-3, 8, -2, 2, 10, 1, K[P + '1']); g.box(-3, 9, -2, 2, 9, 1, K.ochre1);
  d.add('hips', g, [0, 9, 0], null);
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? -2 : 0; g = new Grid(x0, 0, -2, x0 + 1, 8, 2);
    g.box(x0, 2, -1, x0 + 1, 8, 0, K[P + '2']); g.box(x0, 5, -1, x0 + 1, 5, 0, K[P + '1']);
    g.box(x0, 0, -1, x0 + 1, 2, 1, K[B + '1']); g.box(x0, 0, 2, x0 + 1, 1, 2, K[B + '2']);
    d.add(s < 0 ? 'legL' : 'legR', g, [x0 + 1, 9, 0], 'hips');
  }
  g = new Grid(-4, 10, -3, 3, 16, 1); g.box(-3, 10, -2, 2, 16, 1, K[T + '2']); g.box(-2, 12, 1, 1, 15, 1, K[T + '3']); g.box(-3, 16, -2, 2, 16, 1, o.collar ? K[o.collar + '2'] : K[T + '1']);
  if (o.armor) { g.box(-4, 15, -2, -3, 16, 0, K.steel3); g.box(2, 15, -2, 3, 16, 0, K.steel3); }
  if (o.pack) { g.box(-3, 10, -3, 2, 15, -3, K.dirt2); g.box(-2, 11, -3, 1, 12, -3, K.rust2); g.box(-1, 14, -3, 0, 15, -3, K.steel3); }
  d.add('torso', g, [0, 10, 0], 'hips');
  g = new Grid(-3, 17, -3, 2, 22, 2);
  g.box(-2, 17, -2, 1, 20, 1, K[o.head || 'cloth2']); g.box(-2, 20, -2, 1, 20, 1, K[o.head ? o.head.slice(0, -1) + '1' : 'cloth1']);
  g.box(-1, 18, 1, 0, 19, 1, K.steel0);
  if (o.helmet) { g.box(-3, 19, -3, 2, 21, 2, K.steel2); g.box(-2, 21, -2, 1, 21, 1, K.steel3); g.box(-2, 18, 2, 1, 19, 2, K.steel0); }
  g.set(-1, 18, 1, K[o.eye]); g.set(0, 18, 1, K[o.eye]);
  if (o.goggles) { g.box(-2, 19, 2, 1, 19, 2, K.steel1); g.set(-1, 19, 2, K.gCyan); g.set(0, 19, 2, K.gCyan); }
  d.add('head', g, [0, 17, 0], 'torso');
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? -5 : 3; g = new Grid(x0, 8, -2, x0 + 1, 15, 1);
    g.box(x0, 9, -1, x0 + 1, 15, 0, K[T + '2']); g.box(x0, 8, -1, x0 + 1, 9, 0, K.bone2); g.box(x0, 12, -1, x0 + 1, 12, 0, K[T + '1']);
    d.add(s < 0 ? 'armL' : 'armR', g, [x0 + 1, 15, 0], 'torso');
  }
  if (o.cloak) {
    const cs = [[10, 16, 4], [5, 9, 5], [0, 4, 5]];
    cs.forEach((c, i) => {
      g = new Grid(-6, c[0], -4, 5, c[1], -2);
      g.box(-c[2], c[0], -3, c[2] - 1, c[1], -3, K['cloth' + (2 - (i > 0 ? 1 : 0))]); g.box(-c[2], c[0], -4, c[2] - 1, c[0], -4, K.cloth1);
      g.wear([K.cloth2, K.cloth1], K.rust1, .08, 3 + i); if (i > 0) g.dent(.18, 11 + i);
      d.add('cloak' + i, g, [0, c[1], -3], i ? 'cloak' + (i - 1) : 'torso');
    });
  }
  if (o.scarf) {
    for (let k = 0; k < 6; k++) {
      const zf = -3 - 3 * k; g = new Grid(-1, 13, zf - 3, 0, 16, zf);
      g.box(-1, 14, zf - 3, 0, 15, zf, K[k > 3 ? 'red3' : 'red2']); if (k % 2) g.box(-1, 14, zf - 3, 0, 14, zf - 3, K.red1);
      d.add('scarf' + k, g, [0, 15, zf], k ? 'scarf' + (k - 1) : 'torso');
    }
    const sg = d.parts.find(p => p.name === 'torso').grid; sg.box(-3, 16, -2, 2, 16, 1, K.red2); sg.box(-3, 15, 1, 2, 15, 1, K.red1);
  }
  if (o.gun) {
    g = new Grid(2, 11, -5, 4, 15, 11);
    g.box(3, 12, -4, 3, 13, -1, K.dirt2); g.box(3, 12, -1, 4, 13, 7, K.steel2); g.box(3, 12, 8, 3, 12, 11, K.steel1); g.box(3, 14, 1, 3, 14, 4, K.steel1); g.set(3, 14, 5, K.gAmber); g.set(3, 11, 2, K.steel1); g.box(3, 11, 3, 3, 11, 3, K.steel0);
    d.add('rifle', g, [3, 13, 0], 'torso');
  }
  if (o.pipe) { g = new Grid(2, 3, -2, 5, 17, 3); g.line(4, 9, 0, 4, 17, 0, K.steel2, 0); g.box(3, 16, -1, 5, 18, 1, K.rust3); g.box(2, 15, 1, 3, 15, 1, 0); d.add('rifle', g, [4, 9, 0], 'armR'); }
  d.anim = (m, t, op) => {
    const sp = op.speed != null ? op.speed : (op.mode === 'walk' ? 1 : 0), aim = op.aim != null ? op.aim : (op.mode === 'aim' ? 1 : 0), p = m.p, w = t * 6.4, sw = Math.sin(w) * .72 * sp;
    const ph = m.st; ph.sp = damp(ph.sp || 0, sp, 6, .016); ph.aim = damp(ph.aim || 0, aim, 5, .016);
    p.legL.rotation.x = sw; p.legR.rotation.x = -sw;
    const ab = ph.aim; p.armL.rotation.x = lerp(-sw * .8, -1.25, ab) + Math.sin(t * 1.9) * .03; p.armR.rotation.x = lerp(sw * .8, -1.35, ab) + Math.sin(t * 1.9 + 1) * .03;
    p.armL.rotation.z = lerp(0, .25, ab); p.armR.rotation.z = lerp(0, -.1, ab);
    p.hips.position.y = p.hips.userData.base.y + Math.abs(Math.sin(w)) * .055 * sp + Math.sin(t * 1.7) * .006;
    p.hips.rotation.y = Math.sin(w) * .09 * sp; p.torso.rotation.y = -Math.sin(w) * .12 * sp + ab * .3;
    p.torso.scale.y = 1 + Math.sin(t * 1.7) * .018; p.torso.rotation.x = .06 * sp + Math.sin(t * 1.1) * .012;
    p.head.rotation.y = Math.sin(t * .6) * .22 * (1 - ab); p.head.rotation.x = Math.sin(t * .9) * .04;
    if (p.rifle) { const rp = p.rifle; rp.rotation.x = -ab * .25 + sw * .15 * (1 - ab); rp.position.y = rp.userData.base.y + ab * .02; }
    for (let i = 0; i < 3; i++) if (p['cloak' + i]) p['cloak' + i].rotation.x = .1 + sp * .32 + Math.sin(t * 2.1 - i * .9) * (.08 + .12 * sp);
    for (let k = 0; k < 6; k++) if (p['scarf' + k]) { const s = p['scarf' + k]; s.rotation.z = Math.sin(t * 3.1 - k * .75) * (.12 + .26 * (k / 5)) * (.5 + sp * .8); s.rotation.x = -.12 - sp * .08 + Math.sin(t * 2.3 - k * .6) * .16; }
  };
  return d;
}
const nomad = humanoid('nomad', 'Кочевник', { top: 'cloth', pants: 'steel', boots: 'dirt', cloak: 1, scarf: 1, gun: 1, eye: 'gAmber', head: 'cloth2', tags: 'герой · плащ · шарф', desc: 'Герой. Плащ из трёх звеньев и шарф из шести догоняют корпус волной.' });
const scav = humanoid('scavenger', 'Мародёр', { top: 'rust', pants: 'dirt', boots: 'dirt', pack: 1, pipe: 1, goggles: 1, eye: 'gRed', head: 'dirt2', collar: 'ochre', tags: 'NPC · рюкзак', desc: 'Падальщик с трубой и рюкзаком, очки светятся голубым.' });
const soldier = humanoid('soldier', 'Солдат пустоши', { top: 'steel', pants: 'steel', boots: 'steel', helmet: 1, armor: 1, gun: 1, eye: 'gRed', head: 'steel2', tags: 'враг · броня', desc: 'Пехотинец в броне, визор горит красным.' });

/* ---------- ноги шагоходов ---------- */
function addLeg(d, nm, parent, cx, cz, H, L1, L2, fh, w, c) {
  let g = new Grid(cx - w - 2, H - L1, cz - w - 1, cx + w + 2, H, cz + w + 1);
  g.box(cx - w, H - L1, cz - w, cx + w, H - 1, cz + w, K[c + '2']); g.box(cx - w - 1, H - L1, cz - w - 1, cx + w + 1, H - L1 + 2, cz + w + 1, K[c + '3']); g.box(cx + w + 1, H - L1 + 2, cz, cx + w + 1, H - 3, cz, K.steel4);
  d.add(nm + 'T', g, [cx + .5, H, cz + .5], parent);
  const H2 = H - L1, w2 = Math.max(1, w - 1);
  g = new Grid(cx - w2 - 1, H2 - L2, cz - w2 - 1, cx + w2 + 1, H2, cz + w2 + 1);
  g.box(cx - w2, H2 - L2, cz - w2, cx + w2, H2 - 1, cz + w2, K.rust2); g.box(cx - w2 - 1, H2 - 3, cz - w2 - 1, cx + w2 + 1, H2 - 1, cz + w2 + 1, K.rust1); g.wear([K.rust2], K.rust3, .12, 21);
  d.add(nm + 'S', g, [cx + .5, H2, cz + .5], nm + 'T');
  const H3 = H2 - L2;
  g = new Grid(cx - w - 2, H3 - fh, cz - w - 2, cx + w + 2, H3, cz + w + 4);
  g.box(cx - w - 1, H3 - fh, cz - w - 1, cx + w + 1, H3 - 1, cz + w + 3, K.steel1); g.box(cx - w - 2, H3 - fh, cz + w + 1, cx + w + 2, H3 - fh + 1, cz + w + 4, K.steel2); g.box(cx - w, H3 - 1, cz - w, cx + w, H3, cz + w, K.steel3);
  d.add(nm + 'F', g, [cx + .5, H3, cz + .5], nm + 'S');
  return [nm + 'T', nm + 'S', nm + 'F'];
}
function legAnim(p, n, ph, sp, rest) {
  const T = p[n + 'T'], S = p[n + 'S'], F = p[n + 'F']; if (!T) return;
  const sw = Math.sin(ph) * sp, lift = Math.max(0, Math.cos(ph)) * sp;
  T.rotation.x = rest[0] + sw * rest[3]; S.rotation.x = rest[1] - lift * rest[4]; F.rotation.x = -(T.rotation.x + S.rotation.x) + lift * .25;
}

function strider(id, name, o) {
  const d = new Def(id, name, 'anim', .1, { modes: ['idle', 'walk', 'attack'], tags: o.tags, desc: o.desc });
  const H = o.H, bw = o.bw, L1 = o.L1, L2 = o.L2, fh = H - L1 - L2;
  let g = new Grid(-bw - 3, H - 3, -14, bw + 3, H + 20, 14);
  g.box(-bw, H, -9, bw - 1, H + 11, 8, K.steel2); g.box(-bw - 1, H + 11, -8, bw, H + 12, 6, K.steel3);
  for (let i = 0; i < 4; i++) g.box(-bw, H + 8 + i, 8 + 0, bw - 1, H + 8 + i, 8 + 0, 0), g.box(-bw, H + 7 + i, 8 - i, bw - 1, H + 7 + i, 8, 0);
  g.box(-bw + 2, H + 5, 8, bw - 3, H + 8, 9, K.gAmber); g.box(-bw + 2, H + 5, 8, bw - 3, H + 5, 9, K.rust3);
  g.box(-bw - 1, H + 1, -6, -bw - 1, H + 9, 6, K.rust2); g.box(bw, H + 1, -6, bw, H + 9, 6, K.rust2); g.box(-bw, H - 2, -8, bw - 1, H - 1, 7, K.steel1);
  g.box(-4, H + 2, -13, 3, H + 9, -10, K.steel1); for (let x = -3; x <= 2; x += 2) g.box(x, H + 4, -13, x, H + 7, -13, K.gOrange);
  g.line(-bw + 2, H + 12, -6, -bw + 2, H + 26, -6, K.steel3); g.set(-bw + 2, H + 27, -6, K.gRed); g.box(-bw + 1, H + 12, -7, -bw + 3, H + 12, -5, K.steel1);
  g.wear([K.steel2, K.steel3], [K.rust2, K.rust3], .16, 31); g.dent(.04, 32); g.cap(K.bone2, .4, 33, [K.steel3]);
  d.add('body', g, [0, H, 0], null);
  g = new Grid(bw + 1, H + 2, -5, bw + 6, H + 9, 24);
  g.box(bw + 1, H + 3, -4, bw + 4, H + 8, 2, K.steel2); g.box(bw + 2, H + 5, 3, bw + 3, H + 6, 18, K.steel1); g.box(bw + 1, H + 4, 3, bw + 4, H + 7, 5, K.steel3); g.box(bw + 1, H + 4, 17, bw + 4, H + 7, 19, K.steel3); g.box(bw + 2, H + 7, 6, bw + 3, H + 8, 12, K.rust3);
  d.add('gun', g, [bw + 2.5, H + 6, 0], 'body');
  g = new Grid(bw, H + 3, 19, bw + 5, H + 8, 24); g.sph(bw + 2.5, H + 5.5, 21, 2, K.gOrange); g.sph(bw + 2.5, H + 5.5, 21, 1, K.gWhite);
  d.add('flash', g, [bw + 2.5, H + 5.5, 21], 'gun');
  const hx = bw - 1;
  [['L', -hx], ['R', hx]].forEach(([s, cx]) => addLeg(d, 'leg' + s, 'body', cx, 0, H, L1, L2, fh, o.w, 'steel'));
  d.anim = (m, t, op) => {
    const p = m.p, st = m.st; const sp = op.speed != null ? op.speed : (op.mode === 'walk' ? 1 : 0); st.sp = damp(st.sp || 0, sp, 4, .016);
    const w = t * (o.freq || 3.2), q = st.sp;
    legAnim(p, 'legL', w, q, [.3, -.75, 0, .55, .7]); legAnim(p, 'legR', w + PI, q, [.3, -.75, 0, .55, .7]);
    p.body.position.y = p.body.userData.base.y + Math.sin(w * 2) * .02 * q + Math.sin(t * 1.3) * .012;
    p.body.rotation.z = Math.sin(w) * .035 * q; p.body.rotation.x = Math.sin(w * 2 + .5) * .02 * q + .02;
    p.body.rotation.y = Math.sin(t * .35) * .05;
    const ph = (t % 2.4) / 2.4, k = op.mode === 'attack' ? Math.exp(-ph * 9) : (op.fire || 0);
    p.gun.rotation.y = Math.sin(t * .5) * .12 - .05; p.gun.rotation.x = -.04 + Math.sin(t * .8) * .03 - k * .05;
    p.gun.position.z = p.gun.userData.base.z - k * .1; p.flash.scale.setScalar(.001 + k * 1.6);
    st.fire = k;
  };
  return d;
}
strider('strider_s', 'Шагоход-разведчик', { H: 20, bw: 5, L1: 9, L2: 8, w: 1, freq: 4.2, tags: 'враг · мех · малый', desc: 'Лёгкий двуногий разведчик. Колено сгибается в фазе подъёма ноги.' });
strider('strider_m', 'Шагоход «Курица»', { H: 30, bw: 8, L1: 14, L2: 13, w: 1, freq: 3.0, tags: 'враг · мех · средний', desc: 'Основной боевой шагоход: кабина с янтарным стеклом, орудие с отдачей, красный маяк на антенне.' });

/* ---------- Колосс: 4 ноги, башни с орбами (vs=.2) ---------- */
(function () {
  const d = new Def('colossus', 'Колосс', 'anim', .2, { modes: ['idle', 'walk'], tags: 'босс · мех · гигант', desc: 'Гигант на четырёх ногах. В тумане читается силуэтом: три башни-антенны с красными орбами качаются с запаздыванием.' });
  const H = 44, L1 = 16, L2 = 16, fh = 12;
  let g = new Grid(-20, H - 4, -20, 19, H + 34, 20);
  g.box(-16, H, -14, 15, H + 16, 13, K.steel2); g.box(-18, H + 4, -10, 17, H + 12, 10, K.steel2); g.box(-14, H + 16, -12, 13, H + 19, 10, K.steel3);
  g.box(-12, H + 5, 13, 11, H + 14, 17, K.steel1); for (let x = -10; x <= 9; x += 4) { g.box(x, H + 8, 17, x + 1, H + 10, 18, K.gRed); }
  g.box(-17, H + 12, -6, -17, H + 15, 8, K.rust2); g.box(16, H + 12, -6, 16, H + 15, 8, K.rust2); g.box(-15, H - 3, -12, 14, H - 1, 11, K.steel1);
  g.box(-8, H + 19, -6, 7, H + 22, 4, K.steel2);
  g.wear([K.steel2, K.steel3], [K.rust2, K.rust3, K.rust1], .22, 41); g.dent(.05, 42); g.cap(K.bone2, .5, 43, [K.steel3]);
  d.add('body', g, [0, H, 0], null);
  [[-10, -9, 12], [0, -14, 15], [9, -8, 13]].forEach((a, i) => {
    const gg = new Grid(a[0] - 4, 0, a[1] - 4, a[0] + 4, a[2] * 2 + 8, a[1] + 4);
    gg.line(a[0], 0, a[1], a[0], a[2] * 2, a[1], K.steel2, 1); for (let y = 6; y < a[2] * 2; y += 7) gg.box(a[0] - 2, y, a[1] - 2, a[0] + 2, y, a[1] + 2, K.steel3);
    gg.sph(a[0], a[2] * 2 + 3, a[1], 3.5, K.gRed); gg.sph(a[0], a[2] * 2 + 3, a[1], 1.8, K.gWhite); gg.line(a[0], a[2] * 2 + 6, a[1], a[0], a[2] * 2 + 8, a[1], K.steel3);
    d.add('twr' + i, gg, [a[0], 0, a[1]], 'body'); d.parts[d.parts.length - 1].joint = [a[0], 0, a[1]];
    d.parts[d.parts.length - 1].joint[1] = 0;
  });
  // башни крепятся к корпусу: joint в системе тела — поднимем на H (позиция относительно body-joint уже учтена через joint-pj)
  d.parts.filter(p => p.name.startsWith('twr')).forEach(p => p.joint[1] = H + 14);
  [[-11, -9, 'FL'], [10, -9, 'FR'], [-11, 8, 'BL'], [10, 8, 'BR']].forEach(([cx, cz, n]) => addLeg(d, n, 'body', cx, cz, H, L1, L2, fh, 2, 'steel'));
  d.anim = (m, t, op) => {
    const p = m.p, st = m.st, sp = op.speed != null ? op.speed : (op.mode === 'walk' ? 1 : 0); st.sp = damp(st.sp || 0, sp, 2, .016);
    const w = t * 1.35, q = st.sp, R = [.2, -.5, 0, .4, .5];
    legAnim(p, 'FL', w, q, R); legAnim(p, 'BR', w, q, R); legAnim(p, 'FR', w + PI, q, R); legAnim(p, 'BL', w + PI, q, R);
    p.body.position.y = p.body.userData.base.y + Math.sin(w * 2) * .06 * q + Math.sin(t * .6) * .03;
    p.body.rotation.z = Math.sin(w) * .02 * q; p.body.rotation.x = Math.sin(w * 2) * .012 * q;
    for (let i = 0; i < 3; i++) { const s = p['twr' + i]; s.rotation.z = Math.sin(t * .8 - i * 1.1) * .035 + Math.sin(w - i) * .03 * q; s.rotation.x = Math.sin(t * .6 - i * .9) * .025; }
  };
})();

/* ===== 3D-модели: дроны, червь, турель, радар, костёр, вездеход, фонарь ===== */
(function () {
  /* --- Дрон-квадро --- */
  let d = new Def('drone_quad', 'Дрон-квадро', 'anim', .1, { modes: ['idle', 'hover'], tags: 'враг · летает', desc: 'Четыре винта, красный глаз. Наклоняется в сторону движения с инерцией.' });
  let g = new Grid(-12, 2, -12, 12, 14, 12);
  g.ell(0, 8, 0, 5.5, 2.6, 5.5, K.steel2); g.box(-5, 5, -5, 4, 6, 4, K.steel1); g.ell(0, 9, -1, 3, 1.6, 3.4, K.steel3);
  g.sph(0, 6, 4, 2, K.steel0); g.set(0, 6, 6, K.gRed); g.set(-1, 6, 6, K.gRed); g.set(0, 5, 6, K.gRed); g.set(-1, 5, 6, K.gRed);
  [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(a => g.line(a[0] * 4, 8, a[1] * 4, a[0] * 9, 9, a[1] * 9, K.steel1, 0));
  g.box(-1, 4, -6, 0, 5, -5, K.gAmber); g.wear([K.steel2], K.rust2, .12, 51);
  d.add('body', g, [0, 8, 0], null);
  [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach((a, i) => {
    const rx = a[0] * 9, rz = a[1] * 9, r = new Grid(rx - 6, 9, rz - 6, rx + 6, 11, rz + 6);
    r.cyl('y', 9, 10, rx, rz, 1.5, K.steel3); r.box(rx - 5, 10, rz, rx + 5, 10, rz, K.steel4); r.box(rx, 10, rz - 5, rx, 10, rz + 5, K.steel4); r.set(rx + 5, 10, rz, K.gAmber); r.set(rx - 5, 10, rz, K.gAmber); r.set(rx, 10, rz + 5, K.gAmber); r.set(rx, 10, rz - 5, K.gAmber);
    d.add('rot' + i, r, [rx + .5, 10, rz + .5], 'body');
  });
  d.anim = (m, t, o) => {
    const p = m.p, st = m.st, vx = o.vx || 0, vz = o.vz || 0;
    st.tx = damp(st.tx || 0, vz * .18, 3, .016); st.tz = damp(st.tz || 0, -vx * .18, 3, .016);
    p.body.position.y = p.body.userData.base.y + Math.sin(t * 1.6) * .05 + Math.sin(t * 2.7 + 1) * .02;
    p.body.rotation.x = st.tx + Math.sin(t * 1.1) * .035; p.body.rotation.z = st.tz + Math.sin(t * 1.3 + 2) * .035; p.body.rotation.y = Math.sin(t * .4) * .2;
    for (let i = 0; i < 4; i++) p['rot' + i].rotation.y = t * 26 * (i % 2 ? 1 : -1);
  };

  /* --- Дрон-глаз: тентакли-цепочки --- */
  d = new Def('drone_eye', 'Дрон-глаз', 'anim', .1, { modes: ['idle', 'hover'], tags: 'враг · наблюдатель', desc: 'Парящий глаз с гироскопным кольцом и четырьмя щупальцами-цепочками — волна идёт по звеньям.' });
  g = new Grid(-9, 0, -9, 9, 17, 9);
  g.sph(0, 9, 0, 6, K.steel2); g.sph(0, 9, -1, 6, K.steel2); g.cyl('z', 4, 6, 0, 9, 3.4, K.gRed); g.cyl('z', 5, 6, 0, 9, 1.4, K.steel0); g.set(0, 9, 6, K.gWhite);
  g.box(-1, 14, -3, 0, 15, 2, K.steel4); g.wear([K.steel2], K.rust2, .14, 61); g.dent(.02, 62, [K.gRed]);
  d.add('eye', g, [0, 9, 0], null);
  g = new Grid(-10, 0, -2, 9, 19, 2); g.cyl('z', 0, 1, 0, 9, 9, K.steel3, 8); g.set(9, 9, 0, K.gAmber); g.set(-9, 9, 0, K.gAmber); g.set(0, 18, 0, K.gAmber);
  d.add('ring', g, [0, 9, 0], 'eye');
  [[-3, -2], [2, -2], [-3, 2], [2, 2]].forEach((a, i) => {
    let par = 'eye';
    for (let k = 0; k < 5; k++) {
      const y = 4 - k * 3, gg = new Grid(a[0] - 1, y - 3, a[1] - 1, a[0] + 1, y, a[1] + 1);
      gg.box(a[0], y - 2, a[1], a[0] + 1, y, a[1] + 1, K[k % 2 ? 'steel1' : 'steel3']); if (k === 4) gg.set(a[0], y - 3, a[1], K.gRed);
      d.add('t' + i + '_' + k, gg, [a[0] + .5, y, a[1] + .5], par); par = 't' + i + '_' + k;
    }
  });
  d.anim = (m, t, o) => {
    const p = m.p, st = m.st;
    st.ly = damp(st.ly || 0, o.lookY || Math.sin(t * .5) * .6, 3, .016); st.lx = damp(st.lx || 0, o.lookX || Math.sin(t * .37 + 1) * .2, 3, .016);
    p.eye.rotation.y = st.ly; p.eye.rotation.x = st.lx; p.eye.position.y = p.eye.userData.base.y + Math.sin(t * 1.4) * .06;
    p.ring.rotation.z = t * 1.5; p.ring.rotation.x = Math.sin(t * .8) * .25;
    for (let i = 0; i < 4; i++) for (let k = 0; k < 5; k++) { const s = p['t' + i + '_' + k]; s.rotation.x = Math.sin(t * 2.4 - k * .7 + i * 1.3) * .26; s.rotation.z = Math.cos(t * 2.0 - k * .6 + i) * .22; }
  };

  /* --- Пепельный червь: 16 звеньев, волна --- */
  d = new Def('ash_worm', 'Пепельный червь', 'anim', .1, { modes: ['idle', 'crawl'], tags: 'враг · существо · сегменты', desc: 'Цепочка из 16 сегментов. Каждый повторяет движение предыдущего с задержкой — по телу бежит волна.' });
  const NSEG = 16;
  for (let i = 0; i < NSEG; i++) {
    const r = i === 0 ? 6 : Math.max(2.4, 5.4 - i * .2), rr = Math.round(r), zc = -i * 7, yc = rr;
    g = new Grid(-9, 0, zc - 12, 9, rr * 2 + 5, zc + 5);
    const body = i % 2 ? K.rust2 : K.steel2;
    g.ell(0, yc, zc, r, r * .92, 4.2, body); g.ell(0, yc, zc - 1, r - 1, r * .85, 3.4, i % 2 ? K.rust3 : K.steel3);
    if (i) g.cyl('z', zc + 3, zc + 3, 0, yc, r - .3, K.gAmber, r - 1.2);
    g.set(0, yc + Math.round(r), zc, K.steel4); g.box(0, yc + Math.round(r), zc - 1, 0, yc + Math.round(r) + 1, zc + 1, K.steel4);
    [-1, 1].forEach(s => g.line(s * (rr - 1), yc - 1, zc, s * (rr + 2), 0, zc + 1, K.rust1, 0));
    g.wear([K.steel2, K.rust2], K.dirt2, .1, 70 + i);
    if (i === 0) { g.sph(-3, yc + 1, zc + 3, 1.2, K.gRed); g.sph(3, yc + 1, zc + 3, 1.2, K.gRed); g.box(-1, yc - 3, zc + 3, 0, yc - 2, zc + 4, K.steel0); }
    d.add('s' + i, g, [0, yc, zc + 3.5], i ? 's' + (i - 1) : null);
  }
  [-1, 1].forEach(s => { const gg = new Grid(-6, 0, 0, 6, 8, 14); gg.box(s * 2, 2, 5, s * 3, 3, 12, K.rust3); gg.box(s * 3, 2, 10, s * 3, 3, 13, K.steel4); gg.box(s * 2, 2, 5, s * 2, 3, 6, K.rust1); d.add(s < 0 ? 'jawL' : 'jawR', gg, [s * 3, 3, 4], 's0'); });
  d.anim = (m, t, o) => {
    const p = m.p, sp = o.speed != null ? o.speed : 1;
    for (let i = 0; i < NSEG; i++) { const s = p['s' + i], k = .35 + .65 * i / NSEG; s.rotation.y = Math.sin(t * 2.2 * (.5 + sp * .5) - i * .55) * .32 * k; s.rotation.x = Math.sin(t * 1.6 - i * .42) * .07; s.position.y = s.userData.base.y + Math.sin(t * 2.2 - i * .55 + 1) * .012; }
    const o2 = .2 + .22 * Math.sin(t * 3.1); p.jawL.rotation.y = -o2; p.jawR.rotation.y = o2;
  };

  /* --- Турель --- */
  d = new Def('turret', 'Турель', 'anim', .1, { modes: ['idle', 'attack'], tags: 'враг · стационарный', desc: 'Сканирует сектор, при атаке — отдача ствола и вспышка.' });
  g = new Grid(-9, 0, -9, 8, 10, 8); g.box(-8, 0, -8, 7, 3, 7, K.steel1); g.box(-6, 3, -6, 5, 7, 5, K.steel2); g.box(-7, 4, -7, 6, 4, 6, K.rust2); g.cyl('y', 7, 9, -.5, -.5, 4, K.steel3); g.wear([K.steel1, K.steel2], K.rust2, .15, 81);
  d.add('base', g, [0, 0, 0], null);
  g = new Grid(-6, 8, -6, 5, 16, 6); g.box(-5, 9, -5, 4, 14, 4, K.steel2); g.box(-6, 11, -2, 5, 13, 2, K.steel3); g.box(-2, 14, -3, 1, 15, 3, K.steel1); g.set(0, 12, 5, K.gRed); g.set(-1, 12, 5, K.gRed);
  d.add('head', g, [0, 8, 0], 'base');
  g = new Grid(-5, 9, 3, 4, 15, 22);
  [-3, 2].forEach(x => { g.box(x, 11, 4, x + 1, 12, 20, K.steel1); g.box(x, 10, 17, x + 1, 13, 18, K.steel3); }); g.box(-3, 10, 3, 2, 13, 6, K.steel2);
  d.add('gun', g, [0, 12, 4], 'head');
  g = new Grid(-5, 9, 19, 4, 15, 24); [-3, 2].forEach(x => { g.sph(x + .5, 11.5, 21, 2, K.gOrange); g.sph(x + .5, 11.5, 21, 1, K.gWhite); });
  d.add('flash', g, [0, 11.5, 21], 'gun');
  d.anim = (m, t, o) => {
    const p = m.p, att = o.mode === 'attack', ph = (t % 1.6) / 1.6, k = att ? Math.exp(-ph * 12) * (ph < .5 ? 1 : 0) : 0;
    p.head.rotation.y = Math.sin(t * .6) * .9 + Math.sin(t * 1.7) * .05; p.gun.rotation.x = -.1 + Math.sin(t * .9) * .09 - k * .08;
    p.gun.position.z = p.gun.userData.base.z - k * .09; p.flash.scale.setScalar(.001 + k * 1.5);
  };

  /* --- Радар-вышка --- */
  d = new Def('radar', 'Радар-вышка', 'anim', .1, { modes: ['idle'], tags: 'окружение · вращается', desc: 'Решётчатая вышка с вращающейся тарелкой и мигающим красным маяком.' });
  g = new Grid(-9, 0, -9, 9, 45, 9);
  [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(a => g.line(a[0] * 6, 0, a[1] * 6, a[0] * 2, 42, a[1] * 2, K.steel2, 0));
  for (let y = 6; y < 42; y += 9) { const s = Math.round(6 - y / 42 * 4); g.line(-s, y, -s, s, y, -s, K.steel1); g.line(s, y, -s, s, y, s, K.steel1); g.line(s, y, s, -s, y, s, K.steel1); g.line(-s, y, s, -s, y, -s, K.steel1); g.line(-s, y, -s, s, y + 9, -s, K.steel1); g.line(s, y, s, -s, y + 9, s, K.steel1); }
  g.box(-5, 42, -5, 4, 43, 4, K.steel3); g.box(-6, 0, -6, 6, 1, 6, K.bone2); g.sph(0, 45, 0, 1.5, K.gRed); g.wear([K.steel2, K.steel1], K.rust2, .25, 91);
  d.add('tower', g, [0, 0, 0], null);
  g = new Grid(-11, 36, -3, 11, 60, 12);
  for (let x = -10; x <= 10; x++) for (let y = -10; y <= 10; y++) { const rr = x * x + y * y; if (rr <= 100) { const z = Math.round(rr / 34); g.set(x, y + 48, z, K.steel3); if (rr > 70) g.set(x, y + 48, z + 1, K.steel2); } }
  g.line(0, 48, 0, 0, 48, 9, K.steel4); g.set(0, 48, 10, K.gRed); g.line(0, 42, 0, 0, 48, 0, K.steel1);
  d.add('dish', g, [0, 48, 0], 'tower');
  d.anim = (m, t) => { m.p.dish.rotation.y = t * .7; m.p.dish.rotation.x = -.22 + Math.sin(t * .45) * .05; const b = Math.pow(Math.max(0, Math.sin(t * 3.0)), 6); m.mat.uniforms.uGlow.value = .25 + .75 * b; };

  /* --- Костёр --- */
  d = new Def('campfire', 'Костёр', 'anim', .1, { modes: ['idle'], tags: 'свет · огонь', desc: 'Дрова, угли, пять языков пламени с независимым мерцанием. Даёт тёплый динамический свет на землю.' });
  g = new Grid(-8, 0, -8, 8, 8, 8);
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; g.box(Math.round(Math.cos(a) * 6) - 1, 0, Math.round(Math.sin(a) * 6) - 1, Math.round(Math.cos(a) * 6) + 1, 2, Math.round(Math.sin(a) * 6) + 1, K.steel1); g.set(Math.round(Math.cos(a) * 6), 3, Math.round(Math.sin(a) * 6), K.steel2); }
  g.line(-5, 2, -3, 5, 3, 3, K.dirt2, 1); g.line(-4, 2, 4, 4, 3, -4, K.dirt3, 1); g.line(-5, 3, 0, 5, 3, 0, K.dirt1, 1); g.box(-3, 1, -3, 3, 1, 3, K.gOrange); g.box(-2, 2, -2, 2, 2, 2, K.gAmber); g.dent(.05, 101, [K.gOrange, K.gAmber]);
  d.add('base', g, [0, 0, 0], null);
  [[0, 0, 14, 3], [-3, 1, 9, 2], [3, -1, 10, 2], [1, 3, 8, 2], [-2, -3, 8, 2]].forEach((f, i) => {
    const h = f[2], gg = new Grid(f[0] - 4, 2, f[1] - 4, f[0] + 4, 2 + h, f[1] + 4);
    for (let y = 0; y < h; y++) { const r = (1 - y / h) * f[3] + .3, c = y > h * .75 ? K.gWhite : y > h * .4 ? K.gAmber : K.gOrange; gg.cyl('y', 2 + y, 2 + y, f[0], f[1], r, c); }
    d.add('f' + i, gg, [f[0], 2, f[1]], 'base');
  });
  d.light = { y: .8, col: [1, .55, .2], r: 14, k: 2.2 };
  d.anim = (m, t) => {
    for (let i = 0; i < 5; i++) { const s = m.p['f' + i]; s.scale.y = .85 + .22 * Math.sin(t * 9 + i * 1.7) + .1 * Math.sin(t * 23 + i * 3); s.scale.x = s.scale.z = .9 + .12 * Math.sin(t * 11 + i); s.rotation.z = Math.sin(t * 2.1 + i) * .09; s.rotation.x = Math.cos(t * 1.7 + i * 2) * .09; }
    m.mat.uniforms.uGlow.value = .85 + .15 * Math.sin(t * 17) + .08 * Math.sin(t * 29);
    m.flick = .8 + .18 * Math.sin(t * 13) + .12 * Math.sin(t * 31 + 1);
  };

  /* --- Вездеход --- */
  d = new Def('rover', 'Вездеход', 'anim', .1, { modes: ['idle', 'drive'], tags: 'транспорт · колёса', desc: 'Багги с каркасом. Колёса крутятся от скорости, подвеска качает корпус, фары светят.' });
  g = new Grid(-9, 3, -14, 9, 18, 13);
  g.box(-6, 5, -11, 5, 8, 9, K.rust2); g.box(-5, 8, -2, 4, 9, 7, K.rust3); g.box(-5, 8, 7, 4, 9, 9, K.rust2); g.box(-6, 8, -11, 5, 9, -4, K.steel2);
  g.line(-5, 9, -3, -5, 16, -3, K.steel3); g.line(4, 9, -3, 4, 16, -3, K.steel3); g.line(-5, 16, -3, 4, 16, -3, K.steel3); g.line(-5, 16, -3, -5, 16, -10, K.steel3); g.line(4, 16, -3, 4, 16, -10, K.steel3); g.line(-5, 9, -10, -5, 16, -10, K.steel3); g.line(4, 9, -10, 4, 16, -10, K.steel3); g.line(-5, 16, -10, 4, 16, -10, K.steel3);
  g.box(-4, 8, 0, 3, 8, 3, K.steel0); g.box(-5, 6, 9, -4, 7, 10, K.gWhite); g.box(3, 6, 9, 4, 7, 10, K.gWhite); g.box(-1, 6, -12, 0, 7, -12, K.gRed);
  g.line(4, 9, -9, 7, 22 > 18 ? 18 : 18, -12, K.steel3); g.wear([K.rust2, K.rust3], K.dirt2, .12, 111);
  d.add('body', g, [0, 6, 0], null);
  [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach((a, i) => {
    const cx = a[0] < 0 ? -8.5 : 8.5, cz = a[1] > 0 ? 6 : -7, x0 = a[0] < 0 ? -10 : 7;
    const w = new Grid(x0, 0, Math.round(cz - 5), x0 + 2, 9, Math.round(cz + 5));
    w.cyl('x', x0, x0 + 2, 4, cz, 4.4, K.steel0); w.cyl('x', x0 + (a[0] < 0 ? 0 : 2), x0 + (a[0] < 0 ? 0 : 2), 4, cz, 2.2, K.steel3); for (let k = 0; k < 8; k++) { const an = k / 8 * TAU; w.set(x0 + 1, 4 + Math.round(Math.sin(an) * 4.6), Math.round(cz + Math.cos(an) * 4.6), K.steel1); w.set(x0 + 1, 4 + Math.round(Math.sin(an) * 3), Math.round(cz + Math.cos(an) * 3), K.steel2); }
    d.add('w' + i, w, [cx, 4, cz], 'body');
  });
  d.anim = (m, t, o) => {
    const sp = o.speed != null ? o.speed : (o.mode === 'drive' ? 1 : 0), st = m.st; st.sp = damp(st.sp || 0, sp, 2, .016); st.wr = (st.wr || 0) + st.sp * 14 * .016;
    for (let i = 0; i < 4; i++) m.p['w' + i].rotation.x = st.wr;
    m.p.body.position.y = m.p.body.userData.base.y + Math.sin(t * 9) * .012 * st.sp + Math.sin(t * 1.3) * .006; m.p.body.rotation.z = Math.sin(t * 4.2) * .02 * st.sp; m.p.body.rotation.x = Math.sin(t * 6.1) * .015 * st.sp;
  };

  /* --- Фонарь --- */
  d = new Def('lamp', 'Уличный фонарь', 'anim', .1, { modes: ['idle'], tags: 'свет · мерцает', desc: 'Покосившийся столб с мерцающей лампой на цепи. Мерцание — гармоники двух частот и редкий провал.' });
  g = new Grid(-5, 0, -5, 5, 36, 5); g.cyl('y', 0, 33, 0, 0, 1.2, K.steel2); g.box(-3, 0, -3, 3, 2, 3, K.bone2); g.box(-2, 3, -2, 2, 4, 2, K.steel1); g.line(0, 33, 0, 4, 35, 0, K.steel2, 0); g.wear([K.steel2], K.rust2, .2, 121);
  d.add('post', g, [0, 0, 0], null);
  g = new Grid(0, 22, -3, 9, 36, 3); g.line(4, 35, 0, 4, 31, 0, K.steel1); g.box(1, 28, -2, 7, 30, 2, K.steel3); g.box(2, 24, -1, 6, 27, 1, K.gAmber); g.box(3, 26, -1, 5, 27, 1, K.gWhite); g.box(2, 23, -1, 6, 23, 1, K.steel1);
  d.add('lamp', g, [4, 35, 0], 'post');
  d.light = { y: 2.6, col: [1, .62, .26], r: 9, k: 1.4 };
  d.anim = (m, t) => {
    m.p.lamp.rotation.z = Math.sin(t * .9) * .06 + Math.sin(t * 2.3) * .015; m.p.lamp.rotation.x = Math.cos(t * .7) * .05; m.p.post.rotation.z = .02 + Math.sin(t * .31) * .004;
    const f = .72 + .18 * Math.sin(t * 11) + .1 * Math.sin(t * 27 + 2), dip = Math.pow(Math.max(0, Math.sin(t * .83 + 1.3)), 40);
    m.flick = Math.max(.05, f * (1 - dip * .9)); m.mat.uniforms.uGlow.value = m.flick * 1.25;
  };
})();

/* ===== 3D-модели: архитектура, реквизит, флора, оружие (статичные) ===== */
(function () {
  const S = (id, name, tags, desc) => new Def(id, name, 'static', .1, { tags, desc });
  let d, g;

  d = S('bunker', 'Бункер', 'архитектура · бетон', 'Бетонная коробка с красной амбразурой, дверным проёмом и антенной. Засыпан пеплом сверху.');
  g = new Grid(-22, 0, -16, 21, 22, 15);
  g.box(-20, 0, -14, 19, 10, 12, K.bone2); g.box(-21, 10, -15, 20, 12, 13, K.bone1); g.box(-5, 0, 9, 4, 7, 12, 0); g.box(-6, 0, 12, 5, 8, 12, K.steel1); g.box(-5, 0, 12, 4, 7, 12, 0); g.box(-4, 0, 9, 3, 6, 9, K.steel0);
  g.box(-15, 6, 11, -8, 7, 12, 0); g.box(-15, 6, 10, -8, 7, 10, K.gAmber); g.box(8, 5, 12, 16, 6, 12, K.steel0); g.box(-14, 12, -6, -10, 17, -2, K.bone2); g.box(10, 12, 0, 15, 14, 6, K.steel2);
  g.line(14, 14, 3, 14, 22, 3, K.steel3); g.set(14, 23 > 22 ? 22 : 22, 3, K.gRed);
  for (let x = -19; x <= -8; x += 3) g.box(x, 0, 13, x + 2, 2, 14, K.dirt3);
  g.wear([K.bone2, K.bone1], [K.bone1, K.steel2], .18, 131); g.dent(.025, 132); g.cap(K.bone4, .12, 133, [K.bone1, K.bone2]);
  d.add('body', g, [0, 0, 0]);

  d = S('hangar_ruin', 'Руины ангара', 'архитектура · каркас', 'Рёбра арок, обрушенная секция, плита пола. Силуэт для среднего плана.');
  g = new Grid(-20, 0, -22, 19, 24, 22);
  g.box(-20, 0, -22, 19, 0, 22, K.bone1);
  for (let k = 0; k < 5; k++) { const z = -20 + k * 10; for (let a = 0; a <= 180; a += 4) { const an = a * PI / 180, x = Math.round(Math.cos(an) * 17), y = Math.round(Math.sin(an) * 22); g.box(x, y, z, x, y, z + 1, K.steel2); if (a % 20 === 0) g.line(x, y, z, Math.round(x * .85), Math.round(y * .85), z, K.steel1); } }
  for (let z = -20; z <= 20; z += 2) { g.line(-17, 0, z, -17, 4, z, K.steel1); g.line(17, 0, z, 17, 4, z, K.steel1); }
  g.box(-17, 0, -22, 17, 6, -21, K.bone2); g.ell(8, 18, 6, 12, 14, 18, 0); g.ell(-12, 20, -4, 7, 8, 9, 0);
  g.wear([K.steel2, K.steel1], K.rust2, .35, 141); g.dent(.05, 142); g.cap(K.bone3, .12, 143);
  d.add('body', g, [0, 0, 0]);

  d = S('wall_ruin', 'Обломок стены', 'архитектура · модуль', 'Бетонная стена с рваным верхом, оконным проёмом и торчащей арматурой.');
  g = new Grid(-14, 0, -3, 13, 20, 3); { const r = rng(151); for (let x = -13; x <= 12; x++) { const h = 8 + Math.round(8 * Math.abs(Math.sin(x * .37)) + r() * 4); g.box(x, 0, -1, x, Math.min(18, h), 1, (x + 14) % 5 ? K.bone2 : K.bone3); if (r() < .3) g.line(x, h, 0, x, h + 3 + (r() * 2 | 0), 0, K.rust2); } }
  g.box(-5, 6, -1, -1, 12, 1, 0); g.box(4, 9, -1, 8, 13, 1, 0); g.line(-5, 12, -1, -1, 12, -1, K.bone4); g.wear([K.bone2], K.bone1, .2, 152); g.cap(K.bone4, .3, 153);
  d.add('body', g, [0, 0, 0]);

  d = S('water_tower', 'Водонапорная башня', 'архитектура · вертикаль', 'Четыре опоры, раскосы, ржавый бак с конусной крышей.');
  g = new Grid(-12, 0, -12, 12, 44, 12);
  [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(a => g.line(a[0] * 9, 0, a[1] * 9, a[0] * 7, 24, a[1] * 7, K.steel2, 0));
  for (let y = 5; y < 24; y += 9) { const s = Math.round(9 - y * .09); g.line(-s, y, -s, s, y + 9, -s, K.steel1); g.line(s, y, s, -s, y + 9, s, K.steel1); g.line(s, y, -s, s, y + 9, s, K.steel1); g.line(-s, y, s, -s, y + 9, -s, K.steel1); }
  g.cyl('y', 24, 36, 0, 0, 9, K.rust2); g.cyl('y', 24, 24, 0, 0, 9, K.steel1); g.cyl('y', 30, 30, 0, 0, 9.4, K.steel2); for (let y = 37; y < 42; y++) g.cyl('y', y, y, 0, 0, Math.max(1, 9 - (y - 36) * 1.9), K.rust3);
  g.wear([K.rust2], [K.rust1, K.rust3], .25, 161); g.dent(.04, 162); d.add('body', g, [0, 0, 0]);

  d = S('viaduct', 'Эстакада', 'архитектура · дорога', 'Секция эстакады: две опоры, плита с ограждением, обломанный край с арматурой.');
  g = new Grid(-26, 0, -9, 25, 34, 9);
  [-18, 16].forEach(x => { g.box(x, 0, -6, x + 3, 28, 6, K.bone2); g.box(x - 1, 26, -8, x + 4, 29, 8, K.bone3); });
  g.box(-26, 29, -8, 22, 32, 8, K.bone2); g.box(-26, 32, -8, 22, 33, -7, K.bone3); g.box(-26, 32, 7, 22, 33, 8, K.bone3); for (let x = -25; x < 22; x += 4) { g.line(x, 33, -8, x, 34, -8, K.steel2); g.line(x, 33, 8, x, 34, 8, K.steel2); }
  for (let x = 14; x <= 25; x++) for (let z = -8; z <= 8; z++) if (hash3(x, 5, z) > .45 + (x - 14) * .03) g.box(x, 29, z, x, 32, z, 0); for (let z = -7; z <= 7; z += 3) g.line(21, 31, z, 25, 29 - ((z + 9) % 3), z, K.rust2);
  g.box(-26, 31, 0, 22, 31, 0, K.ochre2); g.wear([K.bone2, K.bone3], K.bone1, .18, 171); g.dent(.03, 172); g.cap(K.bone4, .25, 173); d.add('body', g, [0, 0, 0]);

  d = S('pylon', 'Пилон с орбом', 'архитектура · силуэт', 'Тонкая вышка с орбом на вершине и шипами антенны — тот самый силуэт в тумане. Орб пульсирует.');
  g = new Grid(-9, 0, -9, 8, 100, 8);
  g.box(-6, 0, -6, 5, 3, 5, K.bone2); g.box(-3, 3, -3, 2, 8, 2, K.steel2); g.box(-1, 8, -1, 0, 86, 0, K.steel2); g.box(-2, 8, -2, 1, 86, 1, K.steel2);
  for (let y = 12; y < 84; y += 9) { g.box(-3, y, -3, 2, y + 1, 2, K.steel3); g.line(-5, y - 2, 0, 4, y + 2, 0, K.steel1); }
  g.box(-8, 60, -1, 7, 61, 0, K.steel3); g.line(-8, 61, 0, -8, 66, 0, K.steel2); g.line(7, 61, 0, 7, 66, 0, K.steel2);
  g.sph(-.5, 92, -.5, 6, K.steel2); g.sph(-.5, 92, -.5, 4.5, K.gRed); g.sph(-.5, 92, -.5, 2.4, K.gWhite); g.line(0, 98, 0, 0, 100, 0, K.steel3);
  g.wear([K.steel2], K.rust2, .25, 181); d.add('body', g, [0, 0, 0]);
  d.pulse = true;

  d = S('barrel', 'Бочка', 'реквизит', 'Ржавая бочка с красной полосой и вмятинами.');
  g = new Grid(-4, 0, -4, 4, 10, 4); g.cyl('y', 0, 9, 0, 0, 3.4, K.rust2); g.cyl('y', 0, 0, 0, 0, 3.6, K.steel2); g.cyl('y', 9, 9, 0, 0, 3.6, K.steel2); g.cyl('y', 4, 4, 0, 0, 3.7, K.steel2); g.cyl('y', 6, 7, 0, 0, 3.6, K.red2); g.cyl('y', 9, 10, 0, 0, 2, K.steel1, 1);
  g.wear([K.rust2], K.rust3, .2, 191); g.dent(.06, 192); d.add('body', g, [0, 0, 0]);

  d = S('crate', 'Ящик', 'реквизит', 'Деревянный ящик с диагональной обвязкой.');
  g = new Grid(-6, 0, -6, 6, 10, 6); g.box(-5, 0, -5, 5, 9, 5, K.dirt2); g.box(-5, 0, -5, 5, 0, -5, K.dirt1);
  for (const f of [-5, 5]) { g.box(f, 0, -5, f, 9, 5, K.dirt3); g.box(-5, 0, f, 5, 9, f, K.dirt3); }
  g.box(-5, 9, -5, 5, 9, 5, K.dirt3); for (let i = 0; i < 10; i++) { g.set(-5 + i, i, 5, K.dirt1); g.set(5 - i, i, 5, K.dirt1); g.set(-5 + i, i, -5, K.dirt1); }
  g.wear([K.dirt2], K.dirt1, .2, 201); g.dent(.05, 202); d.add('body', g, [0, 0, 0]);

  d = S('tire_stack', 'Стопка покрышек', 'реквизит', 'Четыре покрышки со смещением.');
  g = new Grid(-6, 0, -6, 6, 10, 6); for (let k = 0; k < 4; k++) { const ox = (k % 2) * 1 - .5, oz = (k % 3) * 1 - 1; g.cyl('y', k * 2, k * 2 + 1, ox, oz, 4.5, K.steel0, 2); g.cyl('y', k * 2 + 1, k * 2 + 1, ox, oz, 4.5, K.steel1, 3); }
  d.add('body', g, [0, 0, 0]);

  d = S('fence', 'Забор с колючкой', 'реквизит · модуль', 'Секция столбов с колючей проволокой, лента ржавеет.');
  g = new Grid(-14, 0, -2, 14, 14, 2); for (let x = -12; x <= 12; x += 8) { g.box(x, 0, -1, x + 1, 13, 0, K.dirt2); g.box(x, 13, -1, x + 1, 13, 0, K.dirt3); }
  for (const y of [5, 9, 12]) for (let x = -12; x < 13; x++) { const zz = ((x + y) % 4 < 2) ? 0 : -1; g.set(x, y + (x % 3 === 0 ? 1 : 0), zz, K.steel2); if (x % 4 === 0) { g.set(x, y + 1, 1, K.steel3); g.set(x, y, 1, K.steel3); } }
  g.wear([K.steel2], K.rust2, .4, 211); d.add('body', g, [0, 0, 0]);

  d = S('grave_cross', 'Крест со свечой', 'реквизит · метка', 'Могильный крест с шарфом и огоньком свечи.');
  g = new Grid(-6, 0, -4, 6, 20, 4); g.box(-1, 0, -1, 0, 18, 0, K.dirt2); g.box(-5, 13, -1, 4, 14, 0, K.dirt3); g.box(-5, 11, 0, -4, 13, 0, K.red2); g.box(3, 12, 0, 3, 13, 0, K.red2); g.box(-6, 0, -3, 5, 1, 3, K.dirt1); g.box(2, 1, 1, 3, 3, 2, K.bone3); g.set(2, 4, 1, K.gAmber); g.set(2, 5, 1, K.gOrange);
  d.add('body', g, [0, 0, 0]);

  [['dead_tree_a', 'Мёртвое дерево А', 301], ['dead_tree_b', 'Мёртвое дерево Б', 302]].forEach(([id, nm, sd], vi) => {
    d = S(id, nm, 'флора · силуэт', 'Обугленное дерево, ветки генерируются из зерна. Два варианта.');
    g = new Grid(-22, 0, -22, 22, 56, 22); const r = rng(sd);
    for (let y = 0; y < 30; y++) g.cyl('y', y, y, 0, 0, Math.max(1, 3.6 - y * .09), y % 7 ? K.dirt1 : K.steel1);
    for (let i = 0; i < 9 + vi * 2; i++) { let y = 12 + r() * 18, a = r() * TAU, x = 0, z = 0, len = 7 + r() * 11, dy = .4 + r() * .6; let cx = 0, cy = y, cz = 0; const nx = Math.cos(a), nz = Math.sin(a); const tx = Math.round(nx * len), tz = Math.round(nz * len), ty = Math.round(y + dy * len * .8); g.line(0, Math.round(y), 0, tx, ty, tz, i % 3 ? K.dirt1 : K.steel1, i < 4 ? 1 : 0); if (r() < .7) g.line(tx, ty, tz, Math.round(tx + (r() - .5) * 8), ty + 3 + (r() * 4 | 0), Math.round(tz + (r() - .5) * 8), K.dirt1); }
    g.line(0, 28, 0, Math.round((r() - .5) * 6), 44 + (r() * 8 | 0), Math.round((r() - .5) * 6), K.dirt1, 0); g.cap(K.bone3, .15, sd + 1, [K.dirt1]); d.add('body', g, [0, 0, 0]);
  });

  d = S('thorn_bush', 'Колючий куст', 'флора', 'Пучок сухих прутьев с красными шипами.');
  g = new Grid(-9, 0, -9, 9, 12, 9); { const r = rng(311); for (let i = 0; i < 18; i++) { const a = r() * TAU, l = 4 + r() * 5, h = 4 + r() * 8; const x = Math.round(Math.cos(a) * l), z = Math.round(Math.sin(a) * l); g.line(0, 0, 0, x, Math.round(h), z, K.dead1); g.line(x, Math.round(h), z, Math.round(x * 1.3), Math.round(h) + 1, Math.round(z * 1.3), K.red2); if (r() < .4) g.set(x, Math.round(h) + 1, z, K.red4); } }
  d.add('body', g, [0, 0, 0]);

  d = S('fungus', 'Светящийся гриб', 'флора · свет', 'Три гриба с голубыми шляпками, дают холодный акцент.');
  g = new Grid(-9, 0, -9, 9, 16, 9); [[0, 0, 12, 4], [-5, 3, 8, 3], [5, -2, 6, 2]].forEach(a => { g.cyl('y', 0, a[2], a[0], a[1], 1, K.bone3); g.ell(a[0], a[2] + 1, a[1], a[3], a[3] * .55, a[3], K.gCyan); g.ell(a[0], a[2], a[1], a[3] - 1, 1, a[3] - 1, K.cyan2); });
  d.add('body', g, [0, 0, 0]); d.pulse = true;

  d = S('wreck_truck', 'Остов грузовика', 'транспорт · руины', 'Ржавый грузовик без трёх колёс, с выбитыми стёклами и пробитым кузовом.');
  g = new Grid(-9, 0, -26, 9, 20, 24);
  g.box(-6, 4, -24, 5, 5, 20, K.steel1); g.box(-7, 6, 4, 6, 16, 18, K.rust2); g.box(-6, 10, 14, 5, 15, 18, 0); g.box(-6, 10, 14, 5, 15, 14, K.cyan1); g.box(-7, 16, 6, 6, 16, 16, K.rust3); g.box(-7, 6, 18, 6, 9, 20, K.steel2); g.box(-5, 5, 19, -3, 7, 21, K.gWhite);
  g.box(-8, 6, -22, 7, 14, -4, K.rust1); g.box(-7, 7, -21, 6, 13, -5, 0); for (let z = -22; z <= -4; z += 3) g.box(-8, 6, z, 7, 14, z, K.rust2); g.box(-8, 14, -22, 7, 14, -4, K.steel2);
  [[-8, 14], [7, 14], [-8, -14]].forEach(a => { g.cyl('x', a[0], a[0] + 1, 4, a[1], 4.4, K.steel0); g.cyl('x', a[0], a[0] + 1, 4, a[1], 2, K.steel2); });
  g.wear([K.rust2, K.rust1, K.rust3], [K.dirt2, K.steel1], .2, 321); g.dent(.04, 322); g.cap(K.bone3, .25, 323); d.add('body', g, [0, 0, 0]);

  const gun = (id, name, tags, desc, fn) => { const dd = S(id, name, tags, desc); const gg = new Grid(-3, 0, -4, 3, 10, 30); fn(gg); dd.add('body', gg, [0, 0, 0]); };
  gun('rifle', 'Винтовка', 'оружие · ручное', 'Длинный ствол, янтарная линза прицела.', gg => { gg.box(-1, 3, -4, 0, 5, 0, K.dirt2); gg.box(-1, 4, 0, 0, 6, 12, K.steel2); gg.box(-1, 5, 12, 0, 5, 26, K.steel1); gg.box(-1, 7, 3, 0, 7, 9, K.steel1); gg.set(0, 7, 10, K.gAmber); gg.box(-1, 2, 4, 0, 3, 5, K.steel1); gg.box(-1, 6, 25, 0, 6, 26, K.steel3); });
  gun('rocket', 'Ракетомёт', 'оружие · тяжёлое', 'Толстая труба с плечевым упором и тёплым свечением в стволе.', gg => { gg.cyl('z', 0, 24, 0, 5, 3, K.steel2, 2); gg.cyl('z', 24, 26, 0, 5, 3.4, K.steel3, 2); gg.cyl('z', 12, 12, 0, 5, 3.4, K.rust2, 2); gg.box(-1, 2, 3, 0, 4, 9, K.steel1); gg.box(-1, 1, 6, 0, 3, 7, K.dirt2); gg.set(0, 5, 24, K.gOrange); gg.cyl('z', 25, 25, 0, 5, 1.5, K.gOrange); });
  gun('plasma', 'Плазмаган', 'оружие · энергия', 'Корпус с голубой ячейкой и катушкой — светится холодным.', gg => { gg.box(-2, 3, 0, 1, 7, 12, K.steel2); gg.box(-1, 7, 2, 0, 8, 10, K.gCyan); gg.box(-1, 2, 1, 0, 3, 4, K.steel1); gg.cyl('z', 12, 24, -.5, 5.5, 1.4, K.steel3); for (let z = 14; z <= 22; z += 2) gg.cyl('z', z, z, -.5, 5.5, 2.2, K.gCyan, 1); gg.sph(-.5, 5.5, 25, 1.8, K.gCyan); gg.sph(-.5, 5.5, 25, .9, K.gWhite); });

  d = S('debris_set', 'Обломки (6 кусков)', 'разрушение · 6 частей', 'Шесть кусков для эффекта разрушения — отдельные части, разлетаются с физикой.');
  { const cols = [K.bone2, K.steel2, K.rust2, K.bone3, K.dirt2, K.steel1]; for (let i = 0; i < 6; i++) { const gg = new Grid(-3, -3, -3, 3, 3, 3), r = rng(400 + i); gg.box(-1 - (r() * 2 | 0), -1 - (r() * 2 | 0), -1 - (r() * 2 | 0), 1 + (r() * 2 | 0), 1 + (r() * 2 | 0), 1 + (r() * 2 | 0), cols[i]); gg.dent(.2, 410 + i); gg.cap(K.bone4, .3, 420 + i); const ox = i * 8 - 20, sh = new Grid(ox - 3, -3, -3, ox + 3, 3, 3); gg.each((x, y, z, c) => sh.set(x + ox, y, z, c)); d.add('c' + i, sh, [ox, 0, 0], null); } }
  d.cluster = true;
})();


return {models:MODELS,instance,animate,uniforms:GU,dispose(){for(const d of MODELS)if(d.geos)for(const g of Object.values(d.geos))g.dispose()}};
}

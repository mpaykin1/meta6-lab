/* ===== Ashen Path GPU layer (verbatim from the original page): tile/FX/decal atlases, 8-direction bakes, billboards, stack sprites, fog, rays, parallax, burst, pixel art ===== */
function ashenGpu(THREE, A, renderer, heightAt) {
const { GU, GLSL_COMMON, RAMP_FLAT, PAL, RAMPS, instance, animate, voxMat, ensureGeos, rng, clamp, hex, TAU, PI } = A;
const QUAD_VERT_ = 'void main(){gl_Position=vec4(position.xy,0.,1.);}';
const SMat = class extends THREE.ShaderMaterial { constructor(p) { if (p.fragmentShader && p.vertexShader !== QUAD_VERT_) p.fragmentShader = wrapFrag(p.fragmentShader); super(p); } };
function wrapFrag(src) {
  src = src.replace(/void\s+main\s*\(\s*\)/, 'void ashMain()');
  const decl = src.includes('uniform float uTime,uFogD') ? '' : 'uniform float uLin;\n';
  return src + '\n' + decl + 'void main(){ ashMain(); if(uLin>.5) gl_FragColor.rgb=pow(max(gl_FragColor.rgb,vec3(0.)),vec3(2.2)); }';
}
const quadScene = new THREE.Scene(), quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const quadMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial());
quadMesh.frustumCulled = false; quadScene.add(quadMesh);
const QUAD_VERT = QUAD_VERT_;
function mkRT(w, h, o = {}) {
  return new THREE.WebGLRenderTarget(w, h, Object.assign({ minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat, type: THREE.UnsignedByteType, depthBuffer: false, stencilBuffer: false, generateMipmaps: false }, o));
}
/* рисует quad материалом mat в цель target; vp = [x,y,w,h] в пикселях цели */
function fsDraw(mat, target, vp) {
  quadMesh.material = mat;
  const old = renderer.autoClear; renderer.autoClear = false;
  renderer.setRenderTarget(target);
  if (vp) { target.viewport.set(vp[0], vp[1], vp[2], vp[3]); target.scissor.set(vp[0], vp[1], vp[2], vp[3]); target.scissorTest = true; }
  renderer.render(quadScene, quadCam);
  if (vp) { target.viewport.set(0, 0, target.width, target.height); target.scissor.set(0, 0, target.width, target.height); target.scissorTest = false; }
  renderer.setRenderTarget(null); renderer.autoClear = old;
}
function clearRT(rt, r = 0, g = 0, b = 0, a = 0) { renderer.setRenderTarget(rt); renderer.setClearColor(new THREE.Color(r, g, b), a); renderer.clear(true, false, false); renderer.setClearColor(0x000000, 1); renderer.setRenderTarget(null); }
function rtToCanvas(rt) {
  const w = rt.width, h = rt.height, buf = new Uint8Array(w * h * 4);
  renderer.readRenderTargetPixels(rt, 0, 0, w, h, buf);
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'), id = x.createImageData(w, h);
  for (let y = 0; y < h; y++) id.data.set(buf.subarray((h - 1 - y) * w * 4, (h - y) * w * 4), y * w * 4);
  x.putImageData(id, 0, 0); return c;
}
const canvasToU8 = c => new Promise(res => c.toBlob(b => b.arrayBuffer().then(a => res(new Uint8Array(a))), 'image/png'));

/* ===== GPU-атласы: тайлы 16×16, автотайлы, анимированные тайлы, FX-листы, декали ===== */
const TILE_LIB = `
precision highp float; precision highp int;
uniform vec2 uCell; uniform float uTile,uMode,uA,uB,uBits,uF,uFx; uniform vec3 uR[45];
vec3 R(float r,float s){return uR[int(r)*5+int(s)];}
float H(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float bayer(vec2 p){vec2 q=mod(floor(p),4.);int x=int(q.x),y=int(q.y),u=x^y;return float(((u&1)<<3)|((y&1)<<2)|(((u>>1)&1)<<1)|((y>>1)&1))/16.;}
vec3 Rq(float r,float v,vec2 px){float s=clamp(floor(v*5.+(bayer(px)-.5)*.9),0.,4.);return R(r,s);}
float pn(vec2 px,float per){vec2 q=px*per/16.;vec2 i=floor(q),f=fract(q);f=f*f*(3.-2.*f);float a=H(mod(i,per)),b=H(mod(i+vec2(1,0),per)),c=H(mod(i+vec2(0,1),per)),d=H(mod(i+vec2(1,1),per));return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}
float pf(vec2 px,float per){return .5*pn(px,per)+.3*pn(px+7.,per*2.)+.2*pn(px+13.,per*4.);}
`;
const TILE_FRAG = TILE_LIB + `
vec3 tile(int k,vec2 px,float t){
  float n=pf(px,2.),n4=pf(px+31.,4.),h=H(px+float(k)*1.37);
  float a=t*6.2831853;
  if(k==0){float v=.14+.5*n;v+=step(.93,h)*.28-step(.97,H(px+9.))*.14;return Rq(4.,v,px);}
  if(k==1){float v=.22+.5*n4;v+=step(.94,h)*.3;return Rq(3.,v,px);}
  if(k==2){float v=.1+.42*n;if(n4>.68&&h>.55)return R(0.,3.);return Rq(3.,v,px);}
  if(k==3){float v=.2+.3*n4;if(abs(pn(px+5.,3.)-.5)<.03)return R(0.,0.);v+=step(.95,h)*.3;return Rq(0.,v,px);}
  if(k==4){vec3 c=Rq(0.,.2+.3*n4,px);if(px.y>6.&&px.y<9.&&mod(px.x,8.)<5.&&pn(px,4.)>.25)c=Rq(2.,.5+.35*h,px);return c;}
  if(k==5){vec3 c=Rq(4.,.25+.35*n4,px);if(px.x<1.||px.y<1.)c=R(4.,1.);return c;}
  if(k==6){vec3 c=Rq(4.,.22+.3*n4,px);if(px.x<1.||px.y<1.)c=R(4.,1.);if(abs(pn(px+2.,3.)-.5)<.035)c=R(4.,0.);if(pn(px,2.)>.72)c=mix(c,R(1.,1.),.7);return c;}
  if(k==7){vec3 c=Rq(1.,.3+.45*n4,px);vec2 m=min(mod(px,16.),16.-mod(px,16.));if(m.x<1.||m.y<1.)c=R(1.,0.);if(m.x>=2.&&m.x<3.&&m.y>=2.&&m.y<3.)c=R(1.,4.);if(H(px*1.3)>.96)c=R(2.,1.);return c;}
  if(k==8){vec3 c=Rq(0.,.4+.3*n4,px);if(px.x==8.||px.y==8.)c=R(0.,0.);vec2 m=mod(px,8.);if(m.x==2.&&m.y==2.)c=R(0.,4.);if(px.x==0.||px.y==0.)c=R(0.,3.);return c;}
  if(k==9){bool bar=mod(px.x,4.)<1.||mod(px.y,4.)<1.;if(!bar)return R(0.,0.);return Rq(0.,.55+.3*n,px);}
  if(k==10){float row=floor(px.y/4.);float off=mod(row,2.)*4.;float bx=floor((px.x+off)/8.);vec2 f=vec2(mod(px.x+off,8.),mod(px.y,4.));if(f.y<1.||f.x<1.)return R(0.,0.);float hh=H(vec2(bx,row));if(hh>.9)return R(0.,1.);return Rq(1.,.28+.4*hh+.12*n,px);}
  if(k==11){float c1=H(floor(px/4.));float c2=H(floor((px+2.)/2.));float v=.12+.45*c1+.12*c2;vec2 f=mod(px,4.);if(f.x<1.&&f.y<1.)v*=.5;return Rq(4.,v,px);}
  if(k==12){float v=.25+.35*n;float col=H(vec2(px.x,floor(px.y/4.)));v+=step(.55,col)*.28;return Rq(5.,v,px);}
  if(k==13){vec3 c=Rq(0.,.08+.18*n4,px);if(H(px*1.7)>.965)c=R(2.,2.+floor(H(px)*2.));return c;}
  if(k==14){float v=.42+.2*sin((px.x+px.y)*.3926991)+.18*n;return Rq(3.,v,px);}
  if(k==15){float v=.15+.55*H(floor(px/4.))+.1*H(px);vec2 f=mod(px,4.);if(f.x>=3.||f.y<1.)v*=.55;return Rq(4.,v,px);}
  if(k==16){float v=.05+.22*n4;vec3 c=Rq(7.,v,px);if(pn(px+9.,4.)>.78&&H(px)>.4)c=R(7.,3.);return c;}
  if(k==17){float y=px.y;if(y<3.||y>12.)return Rq(3.,.2+.2*n,px);float u=(y-3.)/9.;float v=.15+.7*(1.-abs(u*2.-1.));vec3 c=Rq(0.,v,px);if(mod(px.x,8.)<1.)c=R(0.,0.);if(pn(px,4.)>.7)c=mix(c,R(1.,2.),.7);return c;}
  if(k==18){bool s=mod(px.x+px.y,8.)<4.;vec3 c=s?Rq(2.,.55+.3*H(px*.7),px):R(0.,0.);if(n4>.72)c=mix(c,R(3.,1.),.6);return c;}
  if(k==19){vec3 c=Rq(0.,.1+.12*n4,px);float s=abs(pn(px+4.,4.)-.5);if(s<.05)c=R(7.,3.);if(s>.4&&H(px)>.3)c=R(7.,1.);return c;}
  if(k==20){vec3 c=Rq(3.,.2+.3*n4,px);float b=pn(px,4.);if(b>.66&&mod(px.x+px.y*2.,5.)<2.)c=R(4.,4.-floor(H(px)*2.));return c;}
  if(k==21){float v=.2+.45*n4;vec3 c=Rq(5.,v,px);if(pn(px+3.,4.)>.74)c=R(7.,2.);return c;}
  if(k==22){vec3 c=Rq(3.,.2+.35*n4,px);float x=mod(px.x,16.);bool tr=(x>=3.&&x<6.)||(x>=10.&&x<13.);if(tr){bool chev=mod(px.y+(x>=5.&&x<6.||x>=12.?1.:0.),4.)<2.;c=chev?R(3.,0.):R(3.,1.);}return c;}
  if(k==23){float r=length(px-vec2(7.5))/10.;float v=.04+.55*smoothstep(.2,1.,r)+.2*n4;vec3 c=Rq(0.,v,px);if(abs(r-.55)<.07&&n4>.5)c=R(2.,1.+floor(H(px)*2.));return c;}
  if(k==24){vec3 c=Rq(7.,.05+.2*n4,px);float r1=length(px-vec2(5.,6.)),r2=length(px-vec2(11.,11.));float q1=fract(t),q2=fract(t+.5);if(abs(r1-q1*9.)<1.1)c=R(7.,3.);if(abs(r2-q2*9.)<1.1)c=R(7.,4.);return c;}
  if(k==25){vec3 c=Rq(0.,.1+.15*n4,px);float cr=abs(pn(px+11.,3.)-.5);float pulse=.5+.5*sin(a);if(cr<.07+.03*pulse){c=R(2.,2.+floor(pulse*2.+H(px)*.6));if(cr<.03)c=R(2.,4.);}else if(cr<.13)c=R(6.,1.);return c;}
  if(k==26){vec3 c=Rq(0.,.15+.12*n4,px);float x=mod(px.x-floor(t*8.)*1.,8.);float y=abs(mod(px.y,8.)-3.5);bool ch=abs(x-y)<1.5;if(ch)c=R(2.,2.+floor(H(vec2(0.))*0.));if(px.y<1.||px.y>14.)c=R(0.,3.);return c;}
  if(k==27){vec3 c=Rq(0.,.28+.2*n4,px);float on=step(.5,fract(t*1.));if(px.x==0.||px.y==0.)c=R(0.,1.);float r=length(px-vec2(7.5));if(r<3.)c=on>.5?R(6.,3.):R(6.,1.);if(r>=3.&&r<4.5&&on>.5)c=R(6.,2.);return c;}
  if(k==28){vec3 c=Rq(0.,.16+.14*n4,px);float y=fract(t)*16.;float d=min(abs(px.y-y),min(abs(px.y-y+16.),abs(px.y-y-16.)));if(d<1.)c=R(7.,4.);else if(d<3.)c=R(7.,2.);if(px.x==0.||px.y==15.)c=R(7.,1.);return c;}
  if(k==29){float ph=fract(pf(px,2.)*2.+t);vec3 c=ph<.33?R(6.,1.):ph<.66?R(7.,1.):R(2.,1.);float m=pn(px+5.,4.);if(m<.4)c=Rq(0.,.06+.1*n,px);return c;}
  if(k==30){float v=H(px+floor(t*8.)*17.3);float band=step(.9,fract(px.y/16.-t));return Rq(0.,.15+.55*v+band*.3,px);}
  if(k==31){bool bar=mod(px.x,4.)<1.;if(bar)return Rq(0.,.25+.2*n,px);float v=pn(vec2(px.x,px.y-floor(t*8.)*2.),4.)*.8+.25*(1.-px.y/16.);return v>.85?vec3(1.,.95,.8):v>.62?R(2.,4.):v>.42?R(2.,3.):v>.28?R(1.,4.):R(6.,1.);}
  return vec3(1.,0.,1.);
}
void main(){
  vec2 px=floor(gl_FragCoord.xy-uCell);vec3 c;
  if(uMode<.5)c=tile(int(uTile+.5),px,uF/8.);
  else{int b=int(uBits+.5);float tl=float(b&1),tr=float((b>>1)&1),bl=float((b>>2)&1),br=float((b>>3)&1);vec2 uv=(px+.5)/16.;float v=mix(mix(bl,br,uv.x),mix(tl,tr,uv.x),uv.y);v+=(pf(px+3.,4.)-.5)*.55;bool inside=v>.5;c=inside?tile(int(uB+.5),px,0.):tile(int(uA+.5),px,0.);if(inside&&v<.58)c*=.6;}
  gl_FragColor=vec4(c,1.);
}`;
const TILES = ['ash', 'dirt', 'mud', 'asphalt_cracked', 'asphalt_line', 'concrete', 'concrete_cracked', 'rust_plate', 'steel_floor', 'grating', 'brick_ruin', 'rubble', 'dead_grass', 'scorched', 'sand_ash', 'gravel', 'puddle', 'pipe', 'hazard', 'glass_shards', 'bones_junk', 'moss_dead', 'tire_track', 'crater_edge'];
const TILES_ANIM = ['puddle_ripple', 'ember_crack', 'conveyor', 'warning_light', 'plasma_scan', 'oil_slick', 'tv_static', 'fire_grate'];
const TILES_NAMES = { ash: 'Пепел', dirt: 'Земля', mud: 'Грязь', asphalt_cracked: 'Асфальт (трещины)', asphalt_line: 'Асфальт (разметка)', concrete: 'Бетон', concrete_cracked: 'Бетон (трещины)', rust_plate: 'Ржавая плита', steel_floor: 'Стальной пол', grating: 'Решётка', brick_ruin: 'Кирпич руин', rubble: 'Щебень', dead_grass: 'Мёртвая трава', scorched: 'Выжженное', sand_ash: 'Песок-пепел', gravel: 'Гравий', puddle: 'Лужа', pipe: 'Труба', hazard: 'Опасность', glass_shards: 'Осколки стекла', bones_junk: 'Кости и хлам', moss_dead: 'Мох', tire_track: 'След шин', crater_edge: 'Край воронки', puddle_ripple: 'Лужа (рябь)', ember_crack: 'Угольная трещина', conveyor: 'Конвейер', warning_light: 'Тревожная панель', plasma_scan: 'Плазма-скан', oil_slick: 'Нефтяная плёнка', tv_static: 'Помехи экрана', fire_grate: 'Решётка с огнём' };
const AUTOSETS = [['road_on_ash', 'Дорога по пеплу (16)', 0, 3], ['concrete_on_dirt', 'Бетон по земле (16)', 1, 5], ['water_on_mud', 'Вода по грязи (16)', 2, 16]];
let ATL = {};

function tileMat() {
  return new SMat({
    uniforms: { uCell: { value: new THREE.Vector2() }, uTile: { value: 0 }, uMode: { value: 0 }, uA: { value: 0 }, uB: { value: 0 }, uBits: { value: 0 }, uF: { value: 0 }, uR: { value: RAMP_FLAT } },
    vertexShader: QUAD_VERT, fragmentShader: TILE_FRAG, depthTest: false, depthWrite: false, blending: THREE.NoBlending
  });
}
function buildTileAtlases() {
  const m = tileMat(), U = m.uniforms;
  const st = mkRT(128, 64), an = mkRT(128, 128), au = mkRT(256, 48);
  TILES.forEach((n, i) => { const cx = i % 8, row = (i / 8) | 0; U.uMode.value = 0; U.uTile.value = i; U.uF.value = 0; U.uCell.value.set(cx * 16, (3 - row) * 16); fsDraw(m, st, [cx * 16, (3 - row) * 16, 16, 16]); });
  TILES_ANIM.forEach((n, a) => { for (let f = 0; f < 8; f++) { U.uMode.value = 0; U.uTile.value = 24 + a; U.uF.value = f; U.uCell.value.set(f * 16, (7 - a) * 16); fsDraw(m, an, [f * 16, (7 - a) * 16, 16, 16]); } });
  AUTOSETS.forEach((s, r) => { for (let b = 0; b < 16; b++) { U.uMode.value = 1; U.uA.value = s[2]; U.uB.value = s[3]; U.uBits.value = b; U.uCell.value.set(b * 16, (2 - r) * 16); fsDraw(m, au, [b * 16, (2 - r) * 16, 16, 16]); } });
  ATL.tiles = st; ATL.anim = an; ATL.auto = au;
  GU.tAtlas.value = st.texture; GU.tAnim.value = an.texture;
  m.dispose();
}

/* ---------- FX-листы: 14 эффектов × 8 кадров по 48 px ---------- */
const FX = [
  ['explosion', 'Взрыв', 0, 12], ['fire', 'Огонь', 1, 10], ['smoke', 'Дым', 1, 8], ['spark_burst', 'Искры', 0, 14], ['muzzle_flash', 'Вспышка выстрела', 0, 16], ['plasma_orb', 'Плазменный шар', 1, 10],
  ['laser_impact', 'Попадание лазера', 0, 14], ['shockwave', 'Ударная волна', 0, 12], ['dust_puff', 'Облако пыли', 0, 10], ['rain_splash', 'Брызги дождя', 0, 12], ['emp_ring', 'ЭМИ-кольцо', 0, 12], ['glitch_blip', 'Глитч-вспышка', 0, 14], ['electric_arc', 'Электродуга', 1, 16], ['embers_float', 'Летящие угли', 1, 8]
];
const FX_FRAG = TILE_LIB + `
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(H(i),H(i+vec2(1,0)),f.x),mix(H(i+vec2(0,1)),H(i+vec2(1,1)),f.x),f.y);}
float fb(vec2 p){return .5*vn(p)+.3*vn(p*2.1+5.)+.2*vn(p*4.3+11.);}
float fl(vec2 p,float a){return fb(p+vec2(cos(a),sin(a))*1.3);}
vec3 fireP(float v,vec2 px){float s=clamp(floor(v*7.+(bayer(px)-.5)*.9),0.,6.);
  if(s<.5)return R(0.,1.);if(s<1.5)return R(6.,1.);if(s<2.5)return R(6.,2.);if(s<3.5)return R(1.,4.);if(s<4.5)return R(2.,3.);if(s<5.5)return R(2.,4.);return vec3(1.,.96,.85);}
vec3 cyanP(float v,vec2 px){float s=clamp(floor(v*6.+(bayer(px)-.5)*.9),0.,5.);if(s<.5)return R(7.,0.);if(s<1.5)return R(7.,1.);if(s<2.5)return R(7.,2.);if(s<3.5)return R(7.,3.);if(s<4.5)return R(7.,4.);return vec3(.95,1.,1.);}
vec3 smokeP(float v,vec2 px){return Rq(0.,v,px);}
void main(){
  vec2 px=floor(gl_FragCoord.xy-uCell);vec2 q=(px+.5-24.)/24.;float t=uF/7.,a=t*6.2831853,r=length(q);int k=int(uFx+.5);
  vec3 col=vec3(0.);float al=0.;
  if(k==0){float n=fb(q*3.+vec2(t*2.,1.));float rad=.2+.72*(1.-pow(1.-t,2.));float sh=rad*(.72+.55*n)-r;float v=clamp(sh*3.2,0.,1.)*(1.25-t*.95)+.35*n*(1.-t);al=step(0.,sh);col=fireP(v+.05,px);if(t>.55){col=mix(col,smokeP(.2+.3*n+(-q.x+q.y)*.1,px),smoothstep(.5,.85,t));}al*=step(bayer(px)*.85,1.-smoothstep(.72,1.,t));}
  else if(k==1){float y=(q.y+.85)/1.7;float w=pow(max(1.-y,0.),.85)*.5;float n=fl(vec2(q.x*3.,q.y*2.5),a);float d=abs(q.x)+(n-.5)*.5*y-w;al=step(d,0.)*step(0.,y)*step(y,1.);float v=(1.-y)*.85+(1.-abs(q.x)/max(w,.01))*.35+(n-.5)*.2;col=fireP(v,px);}
  else if(k==2){float n=fl(q*3.,a);float rad=.52+.1*sin(a);float sh=rad*(.78+.5*n)-length(q-vec2(0.,-.05));float v=.22+.4*n+(-q.x+q.y)*.18;al=step(0.,sh);col=smokeP(v,px);}
  else if(k==3){float m=0.;for(int i=0;i<10;i++){float fi=float(i);float an=fi*.62832+H(vec2(fi,1.))*.5;float sp=.5+.5*H(vec2(fi,2.));vec2 d=vec2(cos(an),sin(an));vec2 p=d*t*.95*sp;vec2 pp=q-p;float al2=dot(pp,d);float cr=length(pp-d*clamp(al2,-.14*(1.-t),0.));if(cr<.06*(1.-t*.7))m=max(m,1.-t*.8);}al=step(.01,m);col=fireP(m*1.2+.15,px);}
  else if(k==4){float an=atan(q.y,q.x);float sp=pow(abs(cos(an*2.5)),3.);float rad=(.25+.68*sp)*(1.-t*.88);float sh=rad-r;al=step(0.,sh);col=fireP(sh*4.+.55,px);if(r<.18*(1.-t))col=vec3(1.,.96,.85);}
  else if(k==5){float rad=.55+.04*sin(a*2.);float n=fl(q*3.,a);float v=1.-r/rad*.9+n*.3;float ring=step(rad+.05,r)*step(r,rad+.12)*step(.55,n);al=max(step(r,rad),ring);col=cyanP(v+ring*.5,px);}
  else if(k==6){float rg=.82*(1.-pow(1.-t,2.));float d=abs(r-rg);float ringm=step(d,.1*(1.-t)+.02);float fl2=step(r,.32*(1.-t*2.5));float an=atan(q.y,q.x);float rays=step(r,.6*(1.-t))*step(.8,pow(abs(cos(an*3.)),2.));al=max(max(ringm,fl2),rays);col=fl2>0.?vec3(1.,.9,.9):R(6.,3.+step(.5,ringm*(1.-t)));}
  else if(k==7){float rg=.12+.82*t;float n=fb(vec2(atan(q.y,q.x)*2.,t*3.));float d=abs(r-rg*(.94+.1*n));al=step(d,.075*(1.-t)+.015);col=Rq(4.,.75+.25*(1.-t),px);al*=step(bayer(px)*.7,1.-t*.5);}
  else if(k==8){float m=0.;for(int i=0;i<5;i++){float fi=float(i);float cx=(H(vec2(fi,3.))-.5)*1.1*t*1.6;float cy=-.55+.5*t*(.4+.6*H(vec2(fi,4.)));float rr=.14+.3*t*(.5+H(vec2(fi,5.)))*.6;float s=rr-length(q-vec2(cx,cy));m=max(m,s);}al=step(0.,m)*step(bayer(px)*.8,1.-smoothstep(.55,1.,t));col=Rq(4.,.45+.3*(-q.x+q.y)*.5+.1,px);}
  else if(k==9){vec2 p=vec2(q.x,q.y*2.2+.5);float rg=.15+.6*t;float d=abs(length(p)-rg);float rin=step(d,.07*(1.-t)+.02)*step(p.y,.25);float dr=0.;for(int i=0;i<4;i++){float fi=float(i);float vx=(fi-1.5)*.35;float tt=t*(1.+.2*fi);vec2 dp=vec2(vx*tt*1.6,-.2+(1.4*tt-1.9*tt*tt)*.8);dr=max(dr,step(length(q-dp),.07*(1.-t*.5)));}al=max(rin,dr);col=R(7.,3.+step(.5,dr));}
  else if(k==10){float rg=.15+.78*t;float d=abs(r-rg);float r1=step(d,.06*(1.-t)+.015);float r2=step(abs(r-rg*.65),.04*(1.-t)+.01)*step(.2,t);float n=fb(q*5.+t*4.);float sp=step(.62,n)*step(r,rg)*step(rg*.5,r)*.6;al=max(max(r1,r2),sp);col=cyanP(r1*.9+r2*.6+sp*.8+.2,px);al*=step(bayer(px)*.7,1.-t*.4);}
  else if(k==11){float row=floor((q.y+1.)*9.);float hh=H(vec2(row,floor(uF)));float on=step(.55,hh)*step(abs(q.y),.95);float off=(H(vec2(row,floor(uF)+9.))-.5)*.7;float seg=step(abs(q.x-off),.2+.65*H(vec2(row,floor(uF)+3.)));al=on*seg;col=hh>.85?vec3(1.,.9,.8):(hh>.7?R(6.,3.):R(2.,3.));}
  else if(k==12){float xs=(q.x+1.)*4.;float i=floor(xs),f=fract(xs);float y0=(H(vec2(i,floor(uF)))-.5)*.7,y1=(H(vec2(i+1.,floor(uF)))-.5)*.7;if(i<.5)y0=0.;if(i>6.5)y1=0.;float y=mix(y0,y1,f);float d=abs(q.y-y);float br=step(.45,H(vec2(i,floor(uF)+7.)))*step(abs(q.x),.9);float core=step(d,.045);float glow=step(d,.12)*step(.5,H(px+uF));al=core*step(abs(q.x),.95)+glow*.0;al=max(core*step(abs(q.x),.95),glow*step(abs(q.x),.9));col=core>.5?vec3(.95,1.,1.):cyanP(.5,px);}
  else if(k==13){float m=0.;for(int i=0;i<7;i++){float fi=float(i);float bx=(H(vec2(fi,6.))-.5)*1.3;float ph=H(vec2(fi,7.));float y=fract(t+ph)*2.-1.;float x=bx+sin(a+fi)*.12;float s=step(length(q-vec2(x,y)),.07);m=max(m,s*(1.-abs(y)*.7));}al=step(.01,m);col=fireP(m*1.1+.2,px);}
  gl_FragColor=vec4(col,al);
}`;
const DECALS = [['scorch_a', 'Подпалина А'], ['scorch_b', 'Подпалина Б'], ['crater', 'Воронка'], ['cracks', 'Трещины'], ['oil_pool', 'Лужа масла'], ['footprints', 'Следы ног'], ['tread', 'Следы гусениц'], ['rubble_scatter', 'Россыпь щебня']];
const DECAL_FRAG = TILE_LIB + `
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(H(i),H(i+vec2(1,0)),f.x),mix(H(i+vec2(0,1)),H(i+vec2(1,1)),f.x),f.y);}
float fb(vec2 p){return .5*vn(p)+.3*vn(p*2.1+5.)+.2*vn(p*4.3+11.);}
void main(){
  vec2 px=floor(gl_FragCoord.xy-uCell);vec2 q=(px+.5-32.)/32.;float r=length(q);int k=int(uFx+.5);float n=fb(q*3.+float(k)*7.);vec3 col=vec3(0.);float al=0.;
  if(k==0||k==1){float rad=(k==0?.8:.7)*(.7+.5*n);float s=rad-r;al=step(0.,s);float v=.12+.3*(1.-s/rad);col=Rq(0.,v,px);if(s>0.&&s<.1&&n>.5)col=R(2.,1.);if(r<.2)col=R(0.,0.);al*=step(bayer(px)*.8,.2+smoothstep(0.,.3,s));}
  else if(k==2){float rad=.85*(.8+.3*n);float s=rad-r;al=step(0.,s);float rim=step(.62,r/rad)*step(r/rad,.9);col=rim>0.?Rq(3.,.5+.3*n,px):Rq(0.,.06+.1*n,px);if(s<.1)col=Rq(0.,.1,px);if(r<.45&&n>.58)col=R(1.,2.);}
  else if(k==3){float c1=abs(fb(q*2.4)-.5),c2=abs(fb(q*3.1+9.)-.5);float cr=min(c1,c2);al=step(cr,.035)*step(r,.95);col=R(0.,0.);if(cr<.012)col=R(0.,1.);}
  else if(k==4){float rad=.8*(.65+.5*n);float s=rad-r;al=step(0.,s);float iri=fract(n*3.+r);col=iri<.3?R(6.,1.):iri<.6?R(7.,1.):R(0.,1.);if(s>.2)col=R(0.,0.);if(r<.2&&n>.5)col=R(7.,3.);al*=step(bayer(px)*.6,.5+s*3.);}
  else if(k==5){vec2 p=q;float d1=length((p-vec2(-.35,.5))*vec2(1.6,.8)),d2=length((p-vec2(.3,-.2))*vec2(1.6,.8)),d3=length((p-vec2(-.3,-.7))*vec2(1.6,.8));float s=min(min(d1,d2),d3);al=step(s,.28);col=Rq(3.,.12+.1*n,px);if(s<.12)col=R(3.,0.);}
  else if(k==6){float x=abs(q.x);bool tr=(x>.28&&x<.52);float chev=mod(q.y*20.+(q.x>0.?1.:0.)*2.,4.);al=step(abs(q.y),.95)*(tr?1.:0.)*step(chev,2.5);col=Rq(3.,.1+.1*n,px);}
  else if(k==7){float m=0.;for(int i=0;i<14;i++){float fi=float(i);vec2 c=(vec2(H(vec2(fi,1.)),H(vec2(fi,2.)))-.5)*1.6;float rr=.06+.1*H(vec2(fi,3.));m=max(m,step(length(c-q),rr)*(.4+.6*H(vec2(fi,4.))));}al=step(.01,m);col=Rq(4.,.15+.55*m,px);}
  gl_FragColor=vec4(col,al);
}`;
function buildFxAtlases() {
  const m = new SMat({ uniforms: { uCell: { value: new THREE.Vector2() }, uF: { value: 0 }, uFx: { value: 0 }, uR: { value: RAMP_FLAT } }, vertexShader: QUAD_VERT, fragmentShader: FX_FRAG, depthTest: false, depthWrite: false, blending: THREE.NoBlending });
  const fx = mkRT(384, 672); clearRT(fx);
  FX.forEach((e, i) => { for (let f = 0; f < 8; f++) { m.uniforms.uFx.value = i; m.uniforms.uF.value = f; m.uniforms.uCell.value.set(f * 48, (13 - i) * 48); fsDraw(m, fx, [f * 48, (13 - i) * 48, 48, 48]); } });
  const dm = new SMat({ uniforms: { uCell: { value: new THREE.Vector2() }, uFx: { value: 0 }, uR: { value: RAMP_FLAT } }, vertexShader: QUAD_VERT, fragmentShader: DECAL_FRAG, depthTest: false, depthWrite: false, blending: THREE.NoBlending });
  const dc = mkRT(256, 128); clearRT(dc);
  DECALS.forEach((e, i) => { const cx = i % 4, row = (i / 4) | 0; dm.uniforms.uFx.value = i; dm.uniforms.uCell.value.set(cx * 64, (1 - row) * 64); fsDraw(dm, dc, [cx * 64, (1 - row) * 64, 64, 64]); });
  ATL.fx = fx; ATL.decal = dc; GU.tFx.value = fx.texture; m.dispose(); dm.dispose();
}
/* ===== 2.5D: запекание 8-направленных спрайт-листов из вокселей, билборды, стек-спрайты ===== */
const LOOPS = { nomad: TAU / 6.4, scavenger: TAU / 6.4, soldier: TAU / 6.4, strider_s: TAU / 4.2, strider_m: TAU / 3.0, colossus: TAU / 1.35, drone_quad: 1.2, drone_eye: 2.6, ash_worm: 2.8, turret: 3.2, radar: 4.0, campfire: .7, rover: 1.0, lamp: 2.0 };
const BAKE_OPT = { nomad: { mode: 'walk', speed: 1 }, scavenger: { mode: 'walk', speed: 1 }, soldier: { mode: 'walk', speed: 1 }, strider_s: { mode: 'walk', speed: 1 }, strider_m: { mode: 'walk', speed: 1 }, colossus: { mode: 'walk', speed: 1 }, drone_quad: { mode: 'hover' }, drone_eye: { mode: 'hover' }, ash_worm: { mode: 'crawl' }, turret: { mode: 'attack' }, rover: { mode: 'drive', speed: 1 }, radar: {}, campfire: {}, lamp: {} };
function withNeutral(fn) {
  const s = { sd: GU.uSunDir.value.clone(), sc: GU.uSunCol.value.clone(), am: GU.uAmbCol.value.clone(), rm: GU.uRim.value.clone(), fd: GU.uFogD.value, fh: GU.uFogH.value, gk: GU.uGlowK.value, pc: GU.uPC.value.map(v => v.clone()) };
  const lin0 = GU.uLin.value; GU.uLin.value = 0; GU.uSunDir.value.set(-.5, .8, .5).normalize(); GU.uSunCol.value.set(.8, .78, .85); GU.uAmbCol.value.set(.58, .6, .72); GU.uRim.value.set(.12, .1, .16); GU.uFogD.value = 0; GU.uFogH.value = 0; GU.uGlowK.value = .34; GU.uPC.value.forEach(v => v.set(0, 0, 0));
  try { fn(); } finally { GU.uLin.value = lin0; GU.uSunDir.value.copy(s.sd); GU.uSunCol.value.copy(s.sc); GU.uAmbCol.value.copy(s.am); GU.uRim.value.copy(s.rm); GU.uFogD.value = s.fd; GU.uFogH.value = s.fh; GU.uGlowK.value = s.gk; GU.uPC.value.forEach((v, i) => v.copy(s.pc[i])); }
}
/* o: {dirs, frames, cell, elev, yaw0} */
function bakeSheet(def, o) {
  const dirs = o.dirs, frames = o.frames, cell = o.cell, elev = o.elev != null ? o.elev : .35, vs = def.vs;
  const rt = mkRT(cell * dirs, cell * frames); clearRT(rt, 0, 0, 0, 0);
  const inst = instance(def, voxMat()); inst.st = { sp: 1, aim: 0 }; inst.root.updateMatrixWorld(true);
  const st = def.stats(), cx = (st.mn[0] + st.mx[0] + 1) / 2 * vs, cy = (st.mn[1] + st.mx[1] + 1) / 2 * vs, cz = (st.mn[2] + st.mx[2] + 1) / 2 * vs;
  const dx = (st.mx[0] - st.mn[0] + 1) * vs, dy = (st.mx[1] - st.mn[1] + 1) * vs, dz = (st.mx[2] - st.mn[2] + 1) * vs;
  const Rr = Math.sqrt(dx * dx + dy * dy + dz * dz) / 2 * 1.05, Rh = o.side ? Math.max(dz, dy) / 2 * 1.12 : Rr;
  const pivot = new THREE.Group(); pivot.position.set(cx, 0, cz); inst.root.position.set(-cx, 0, -cz); pivot.add(inst.root);
  const scene = new THREE.Scene(); scene.add(pivot);
  const cam = new THREE.OrthographicCamera(-Rh, Rh, Rh, -Rh, .1, Rr * 10 + 10); const dist = Rr * 4;
  cam.position.set(cx, cy + Math.sin(elev) * dist, cz + Math.cos(elev) * dist); cam.lookAt(cx, cy, cz);
  const per = LOOPS[def.id] || 1, opt = Object.assign({}, BAKE_OPT[def.id] || {}), prevCol = renderer.getClearColor(new THREE.Color()), prevA = renderer.getClearAlpha();
  withNeutral(() => {
    renderer.setRenderTarget(rt); renderer.setClearColor(0x000000, 0);
    for (let f = 0; f < frames; f++) for (let i = 0; i < dirs; i++) {
      pivot.rotation.y = o.yaw0 != null ? o.yaw0 : -i * TAU / dirs;
      inst.st.sp = 1; animate(inst, f / frames * per, opt);
      pivot.updateMatrixWorld(true);
      const vp = [i * cell, (frames - 1 - f) * cell, cell, cell];
      rt.viewport.set(...vp); rt.scissor.set(...vp); rt.scissorTest = true;
      renderer.clear(true, true, false); renderer.render(scene, cam);
    }
    rt.viewport.set(0, 0, rt.width, rt.height); rt.scissor.set(0, 0, rt.width, rt.height); rt.scissorTest = false;
    renderer.setRenderTarget(null); renderer.setClearColor(prevCol, prevA);
  });
  inst.mat.dispose();
  return { rt, dirs, frames, cell, R: Rh, cx, cy, cz, def, size: 2 * Rh, id: def.id };
}
const BB_VERT = `varying vec2 vUv; varying vec3 vW; uniform vec2 uSize;
void main(){ vUv=uv; vec3 c=(modelMatrix*vec4(0.,0.,0.,1.)).xyz; vec3 r=vec3(viewMatrix[0][0],0.,viewMatrix[2][0]); r=normalize(r);
  vec3 w=c+r*position.x*uSize.x+vec3(0.,1.,0.)*position.y*uSize.y; vW=w; gl_Position=projectionMatrix*viewMatrix*vec4(w,1.); }`;
const BB_FRAG = GLSL_COMMON + `
uniform sampler2D tSheet; uniform float uDirs,uFrames,uDir,uFrame,uCellPx,uDis; uniform vec3 uTint;
varying vec2 vUv; varying vec3 vW;
float sa(vec2 lp){ if(lp.x<0.||lp.x>1.||lp.y<0.||lp.y>1.) return 0.; vec2 uv=(vec2(uDir,uFrames-1.-uFrame)+lp)/vec2(uDirs,uFrames); return texture2D(tSheet,uv).a; }
void main(){
  vec2 lp=vUv; vec2 uv=(vec2(uDir,uFrames-1.-uFrame)+lp)/vec2(uDirs,uFrames); vec4 s=texture2D(tSheet,uv);
  float e=1./uCellPx; vec3 col=s.rgb;
  if(s.a<.5){ float n=max(max(sa(lp+vec2(e,0.)),sa(lp-vec2(e,0.))),max(sa(lp+vec2(0.,e)),sa(lp-vec2(0.,e)))); if(n<.5) discard; col=vec3(.1,.07,.14); }
  float lum=max(max(col.r,col.g),col.b); vec3 em=col*smoothstep(.85,1.,lum)*1.7;
  vec3 lit=col*uTint*(1.+pointLights(vW,vec3(0.,1.,0.))*.12*.7);
  gl_FragColor=vec4(applyFog(lit,em,vW),1.);
}`;
function makeBillboard(sheet) {
  const geo = new THREE.PlaneGeometry(1, 1);
  const mat = new SMat({ uniforms: Object.assign({}, GU, { tSheet: { value: sheet.rt.texture }, uDirs: { value: sheet.dirs }, uFrames: { value: sheet.frames }, uDir: { value: 0 }, uFrame: { value: 0 }, uCellPx: { value: sheet.cell }, uSize: { value: new THREE.Vector2(sheet.size, sheet.size) }, uDis: { value: 0 }, uTint: { value: new THREE.Vector3(1, 1, 1) } }), vertexShader: BB_VERT, fragmentShader: BB_FRAG, side: THREE.DoubleSide });
  const m = new THREE.Mesh(geo, mat); m.frustumCulled = false; m.userData.sheet = sheet;
  return m;
}
/* выбор направления по камере; heading — поворот объекта вокруг Y; frame — дробный кадр */
function billboardUpdate(m, cam, heading, frame) {
  const s = m.userData.sheet, u = m.material.uniforms; m.updateWorldMatrix(true, false);
  const dx = cam.position.x - m.position.x, dz = cam.position.z - m.position.z;
  const lx = dx * Math.cos(heading) - dz * Math.sin(heading), lz = dx * Math.sin(heading) + dz * Math.cos(heading);
  let rel = Math.atan2(lx, lz); if (rel < 0) rel += TAU;
  u.uDir.value = s.dirs > 1 ? Math.round(rel / (TAU / s.dirs)) % s.dirs : 0;
  u.uFrame.value = ((Math.floor(frame) % s.frames) + s.frames) % s.frames;
}

/* ---------- стек-спрайты: слои вокселей как горизонтальные карточки ---------- */
const STACK_VERT = `attribute float aLayer; attribute vec3 aOff; varying vec2 vUv; varying float vL; varying vec3 vW; uniform float uLayers;
void main(){ vUv=uv; vL=aLayer/uLayers; vec4 w=modelMatrix*vec4(position+aOff,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`;
const STACK_FRAG = GLSL_COMMON + `
uniform sampler2D tStack; uniform float uLayers; varying vec2 vUv; varying float vL; varying vec3 vW;
void main(){ float li=floor(vL*uLayers+.5); vec4 s=texture2D(tStack,vec2((li+vUv.x)/uLayers,vUv.y)); if(s.a<.5) discard;
  float sh=.62+.38*vL; vec3 lit=s.rgb*(uAmbCol*.9+uSunCol*.5+pointLights(vW,vec3(0.,1.,0.))*.12)*sh; vec3 em=vec3(0.); gl_FragColor=vec4(applyFog(lit,em,vW),1.); }`;
function makeStack(def) {
  const part = def.parts[0].grid, vs = def.vs, L = part.h, w = part.w, d = part.d;
  const cv = document.createElement('canvas'); cv.width = w * L; cv.height = d; const cx = cv.getContext('2d');
  for (let y = 0; y < L; y++) for (let z = 0; z < d; z++) for (let x = 0; x < w; x++) {
    const c = part.v[part.i(part.x0 + x, part.y0 + y, part.z0 + z)]; if (!c) continue; const p = PAL[c];
    cx.fillStyle = `rgb(${Math.min(255, p.c[0] * 255 * (p.e ? 1 : 1)) | 0},${Math.min(255, p.c[1] * 255) | 0},${Math.min(255, p.c[2] * 255) | 0})`; cx.fillRect(y * w + x, d - 1 - z, 1, 1);
  }
  const tex = new THREE.CanvasTexture(cv); tex.magFilter = tex.minFilter = THREE.NearestFilter; tex.generateMipmaps = false;
  const g = new THREE.InstancedBufferGeometry(), base = new THREE.PlaneGeometry(w * vs, d * vs); base.rotateX(-PI / 2);
  g.index = base.index; g.attributes.position = base.attributes.position; g.attributes.uv = base.attributes.uv;
  const aL = new Float32Array(L), aO = new Float32Array(L * 3); for (let i = 0; i < L; i++) { aL[i] = i; aO[i * 3 + 1] = i * vs; }
  g.setAttribute('aLayer', new THREE.InstancedBufferAttribute(aL, 1)); g.setAttribute('aOff', new THREE.InstancedBufferAttribute(aO, 3)); g.instanceCount = L;
  const mat = new SMat({ uniforms: Object.assign({}, GU, { tStack: { value: tex }, uLayers: { value: L } }), vertexShader: STACK_VERT, fragmentShader: STACK_FRAG, side: THREE.DoubleSide });
  const m = new THREE.Mesh(g, mat); m.frustumCulled = false; m.userData = { canvas: cv, layers: L };
  return m;
}
/* ===== Атмосфера и VFX: небо, туман-слои, частицы на GPU, лучи, лазеры, карточки травы, параллакс ===== */
const FXU = { uPxH: { value: 800 } };
const uni = (o) => Object.assign({}, GU, FXU, o || {});

/* --- небо --- */
function makeSky() {
  const m = new SMat({
    uniforms: uni(), side: THREE.BackSide, depthWrite: false, depthTest: false,
    vertexShader: `varying vec3 vD; void main(){ vD=position; gl_Position=projectionMatrix*viewMatrix*vec4(cameraPosition+position,1.); }`,
    fragmentShader: GLSL_COMMON + `varying vec3 vD;
void main(){
  vec3 d=normalize(vD); float h=d.y;
  vec3 hor=uFogCol*1.22+vec3(.03,.02,0.), zen=uFogCol*.52+vec3(.0,.005,.02);
  vec3 col=mix(hor,zen,pow(clamp(h,0.,1.),.5));
  vec2 cu=d.xz/(abs(h)+.22);
  float n=fbm(cu*1.1+uTime*.006), st=fbm(vec2(cu.x*.45+uTime*.004,cu.y*3.4));
  col*=.8+.3*n+.16*(st-.5);
  vec2 g=vec2(atan(d.z,d.x)*34.+uTime*.15,h*34.); vec2 gi=floor(g),gf=fract(g)-.5; float hh=h21(gi);
  float dots=step(.972,hh)*smoothstep(.34,.1,length(gf))*step(.03,h);
  col=mix(col,uFogCol*.32,dots*.7);
  col+=vec3(1.,.55,.22)*pow(max(dot(d,normalize(vec3(-.5,.12,.35))),0.),18.)*.07;
  col=mix(col,uFogCol*1.05,smoothstep(.02,-.2,h));
  gl_FragColor=vec4(col,1.);
}` });
  const s = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), m); s.frustumCulled = false; s.renderOrder = -100; return s;
}

/* --- слои тумана --- */
function makeFogLayers(n = 6) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const geo = new THREE.PlaneGeometry(240, 240, 1, 1); geo.rotateX(-PI / 2);
    const m = new SMat({
      uniforms: uni({ uK: { value: i / n }, uAmt: { value: 1 } }), transparent: true, depthWrite: false, side: THREE.DoubleSide,
      vertexShader: `varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
      fragmentShader: GLSL_COMMON + `varying vec3 vW; uniform float uK,uAmt;
void main(){
  vec2 q=vW.xz+vec2(uTime*.35*(1.+uK),uTime*.12)+uK*53.; float st=fbm(vec2(q.x*.012+q.y*.003,q.y*.055)+fbm(q*.02)*1.3); float gap=fbm(q*.017+7.); float n=smoothstep(.42,.74,st)*smoothstep(.46,.68,gap);
  float dist=length(vW.xz-cameraPosition.xz); float fade=1.-smoothstep(45.,115.,dist);
  float near=smoothstep(.15,1.6,abs(cameraPosition.y-vW.y));
  float bank=smoothstep(.62-.4*uAmt,.86-.4*uAmt,fbm(vW.xz*.0065+vec2(uTime*.021,uTime*.009)+uK*17.));   // широкие полосы тумана плывут мимо
  float a=n*.10*fade*near*bank; gl_FragColor=vec4(uFogCol*1.1+vec3(.02),a);
}` });
    const p = new THREE.Mesh(geo, m); p.position.y = .55 + i * 1.05; p.userData.layer = true; p.frustumCulled = false; p.renderOrder = 10 + i; g.add(p);
  }
  return g;
}


/* --- низкие рябые облака («чешуя»): полосы барашков у самой земли, герой проходит сквозь них как сквозь туман --- */
function makeCirrusLayers(n = 3) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const geo = new THREE.PlaneGeometry(220, 220, 1, 1); geo.rotateX(-PI / 2);
    const m = new SMat({
      uniforms: uni({ uK: { value: i / n }, uAmt: { value: 1 } }), transparent: true, depthWrite: false, side: THREE.DoubleSide,
      vertexShader: `varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
      fragmentShader: GLSL_COMMON + `varying vec3 vW; uniform float uK,uAmt;
void main(){
  float ang=.55+uK*.35; mat2 R=mat2(cos(ang),-sin(ang),sin(ang),cos(ang));
  vec2 q=R*(vW.xz+vec2(uTime*.5*(1.+uK*.6),uTime*.1)+uK*37.);
  float warp=fbm(q*.015+3.)*2.4;
  float band=.5+.5*sin(q.y*.62+warp*2.2);                       // длинные ряды
  float cell=fbm(vec2(q.x*.26,q.y*.95)+fbm(q*.09)*.8);          // мелкие барашки внутри рядов
  float cover=smoothstep(.62-.4*uAmt,.86-.4*uAmt,fbm(q*.012+uK*9.));              // где небо закрыто, где просвет
  float n=smoothstep(.44,.60,cell*(.5+.8*band))*cover;
  float dist=length(vW.xz-cameraPosition.xz); float fade=1.-smoothstep(40.,105.,dist);
  float near=smoothstep(.0,1.2,abs(cameraPosition.y-vW.y));
  float a=n*.5*fade*near; gl_FragColor=vec4(uFogCol*1.5+vec3(.05),a);
}` });
    const p = new THREE.Mesh(geo, m); p.position.y = .5 + i * .85; p.frustumCulled = false; p.renderOrder = 12 + i; g.add(p);
  }
  return g;
}

/* --- пепел / пыль: Points, всё считается в вершинном шейдере --- */
function makeAmbientPoints(count, o) {
  const seeds = new Float32Array(count * 4), pos = new Float32Array(count * 3), r = rng(o.seed || 1);
  for (let i = 0; i < count * 4; i++) seeds[i] = r();
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
  const m = new SMat({
    uniforms: uni({ uCenter: { value: new THREE.Vector3() }, uArea: { value: new THREE.Vector3(...(o.area || [60, 22, 60])) }, uSize: { value: o.size || .08 }, uVel: { value: new THREE.Vector3(...(o.vel || [.5, -.2, .2])) }, uCol: { value: new THREE.Vector3(...(o.col || [.62, .6, .58])) }, uFar: { value: o.far || 60 }, uTw: { value: o.tw || 0 }, uPatch: { value: o.patch || 0 }, uMaxPx: { value: o.maxPx || 7 }, uSolid: { value: o.solid ? 1 : 0 } }),
    transparent: true, depthWrite: false, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending,
    vertexShader: `attribute vec4 aSeed; uniform vec3 uCenter,uArea,uVel; uniform float uSize,uPxH,uTime,uFar,uTw,uPatch,uMaxPx,uSolid; varying float vA; varying float vS;
float hh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float nz(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hh(i),hh(i+vec2(1,0)),f.x),mix(hh(i+vec2(0,1)),hh(i+vec2(1,1)),f.x),f.y);}
void main(){
  vec3 A=uArea; vec3 p=aSeed.xyz*A+uVel*uTime+vec3(sin(uTime*.5+aSeed.w*6.28)*.8,sin(uTime*.7+aSeed.x*9.)*.4,cos(uTime*.4+aSeed.y*7.)*.8);
  p=mod(p-uCenter+A*.5,A)+uCenter-A*.5;
  vec4 mv=viewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv; float d=-mv.z;
  gl_PointSize=clamp(uSize*(uPxH*.5*projectionMatrix[1][1])/max(d,.1),1.,uMaxPx);
  vA=smoothstep(uFar,uFar*.15,d)*(.35+.65*aSeed.w)*(1.-uTw+uTw*(.5+.5*sin(uTime*(8.+aSeed.z*9.)+aSeed.x*40.)))*mix(1.,smoothstep(.42,.66,nz(p.xz*.045+vec2(uTime*.03,uTime*.012))),uPatch);
  vS=aSeed.w; if(uSolid>.5) vA=mix(.55,1.,smoothstep(uFar,uFar*.2,d))*(.7+.3*vS);
}`,
    fragmentShader: `uniform vec3 uCol; uniform float uSolid; varying float vA; varying float vS; void main(){ float a=vA; if(uSolid>.5){ vec2 c=gl_PointCoord-.5; float r=length(vec2(c.x*(1.+vS*.9),c.y)); float rag=.42-.10*fract(sin(dot(floor(gl_PointCoord*5.),vec2(12.9,78.2)))*437.5); if(r>rag) discard; a=vA; } gl_FragColor=vec4(uCol,a); }`
  });
  const p = new THREE.Points(geo, m); p.frustumCulled = false; p.renderOrder = 20; return p;
}
function makeRain(count) {
  const seeds = new Float32Array(count * 2 * 4), pos = new Float32Array(count * 2 * 3), r = rng(77);
  for (let i = 0; i < count; i++) { const a = r(), b = r(), c = r(), d = r(); for (let k = 0; k < 2; k++) { seeds.set([a, b, c, k], (i * 2 + k) * 4); } }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
  const m = new SMat({
    uniforms: uni({ uCenter: { value: new THREE.Vector3() }, uArea: { value: new THREE.Vector3(40, 22, 40) }, uVel: { value: new THREE.Vector3(-3, -16, 1.4) }, uAmt: { value: 1 } }),
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute vec4 aSeed; uniform vec3 uCenter,uArea,uVel; uniform float uTime,uAmt; varying float vA;
void main(){ vec3 A=uArea; vec3 p=aSeed.xyz*A+uVel*uTime*(.85+.3*aSeed.z); p=mod(p-uCenter+A*.5,A)+uCenter-A*.5; p.y=mod(p.y-uCenter.y+A.y*.5,A.y)+uCenter.y-A.y*.5+.0;
  p-=normalize(uVel)*aSeed.w*.55; vec4 mv=viewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv; float d=-mv.z; vA=smoothstep(40.,4.,d)*.32*step(aSeed.z,uAmt); }`,
    fragmentShader: `varying float vA; void main(){ gl_FragColor=vec4(.55,.68,.85,vA); }`
  });
  const l = new THREE.LineSegments(geo, m); l.frustumCulled = false; l.renderOrder = 21; return l;
}

/* --- спрайт-частицы из FX-атласа (дым, огонь, взрыв, пыль) --- */
function makeSpritePool(cfgs, add, loop) {
  const n = cfgs.length, pos = new Float32Array(n * 3), cfg = new Float32Array(n * 4), vel = new Float32Array(n * 4);
  cfgs.forEach((c, i) => { cfg.set([c.fx, c.delay || 0, c.life, c.size], i * 4); vel.set([c.vx || 0, c.vy || 0, c.vz || 0, c.grow == null ? 1 : c.grow], i * 4); });
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('aCfg', new THREE.BufferAttribute(cfg, 4)); geo.setAttribute('aVel', new THREE.BufferAttribute(vel, 4));
  const m = new SMat({
    uniforms: uni({ uOrigin: { value: new THREE.Vector3() }, uT0: { value: -1e4 }, uLoop: { value: loop ? 1 : 0 }, uBright: { value: add ? 1.6 : 1 }, uAlpha: { value: 1 } }),
    transparent: true, depthWrite: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending,
    vertexShader: `attribute vec4 aCfg,aVel; uniform vec3 uOrigin; uniform float uT0,uLoop,uPxH,uTime; varying float vFx,vFr,vA;
void main(){
  float p=(uTime-uT0-aCfg.y)/aCfg.z; if(uLoop>.5) p=fract(p+aCfg.y*.37);
  float ok=step(0.,p)*step(p,1.); p=clamp(p,0.,.999);
  vec3 wp=uOrigin+aVel.xyz*p*aCfg.z+vec3(sin(p*5.+aCfg.y*9.)*.25,0.,cos(p*4.+aCfg.y*7.)*.25)*aVel.w;
  vec4 mv=viewMatrix*vec4(wp,1.); gl_Position=projectionMatrix*mv; float d=-mv.z;
  float sz=aCfg.w*(.45+.75*p*aVel.w+.0); gl_PointSize=ok>.5?clamp(sz*(uPxH*.5*projectionMatrix[1][1])/max(d,.1),1.,320.):0.;
  vFx=aCfg.x; vFr=floor(p*8.); vA=ok*(1.-smoothstep(.7,1.,p)*step(.5,aVel.w))*smoothstep(2.5,9.,d);
}`,
    fragmentShader: `uniform sampler2D tFx; uniform float uBright,uAlpha; varying float vFx,vFr,vA;
void main(){ vec2 pc=vec2(gl_PointCoord.x,1.-gl_PointCoord.y); vec4 s=texture2D(tFx,(vec2(vFr,13.-vFx)+pc)/vec2(8.,14.)); if(s.a<.5||vA<.01) discard; gl_FragColor=vec4(s.rgb*uBright,vA*uAlpha); }`
  });
  const p = new THREE.Points(geo, m); p.frustumCulled = false; p.renderOrder = 22; return p;
}
/* --- искры взрыва / выстрела: баллистика на GPU --- */
function makeSparks(count) {
  const seeds = new Float32Array(count * 4), pos = new Float32Array(count * 3), r = rng(91);
  for (let i = 0; i < count * 4; i++) seeds[i] = r();
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
  const m = new SMat({
    uniforms: uni({ uOrigin: { value: new THREE.Vector3() }, uT0: { value: -1e4 }, uSpeed: { value: 10 }, uGround: { value: 0 } }), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute vec4 aSeed; uniform vec3 uOrigin; uniform float uT0,uTime,uSpeed,uGround,uPxH; varying float vA; varying vec3 vC;
void main(){ float t=uTime-uT0; float life=.9+aSeed.w*1.1; vec3 dir=normalize(vec3(aSeed.x-.5,aSeed.y*.9+.15,aSeed.z-.5)); vec3 v=dir*uSpeed*(.4+aSeed.w);
  vec3 p=uOrigin+v*t+vec3(0.,-9.8*.5*t*t,0.); p.y=max(p.y,uGround+.03); float k=t/life; vA=(1.-k)*step(0.,t)*step(t,life);
  vC=mix(vec3(1.,.95,.8),vec3(1.,.4,.1),clamp(k*1.6,0.,1.)); vec4 mv=viewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv; gl_PointSize=vA>0.?clamp(.12*(uPxH*.5*projectionMatrix[1][1])/max(-mv.z,.1),1.,8.):0.; }`,
    fragmentShader: `varying float vA; varying vec3 vC; void main(){ gl_FragColor=vec4(vC*2.,vA); }`
  });
  const p = new THREE.Points(geo, m); p.frustumCulled = false; p.renderOrder = 23; return p;
}

/* --- лазерные ленты --- */
function makeLaser(color) {
  const geo = new THREE.PlaneGeometry(1, 1, 1, 1);
  const m = new SMat({
    uniforms: uni({ uA: { value: new THREE.Vector3() }, uB: { value: new THREE.Vector3(0, 0, 10) }, uW: { value: .06 }, uK: { value: 1 }, uCol: { value: new THREE.Vector3(...(color || [1, .18, .2])) } }), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: `uniform vec3 uA,uB; uniform float uW; varying vec2 vP;
void main(){ float t=position.x+.5; vec3 p=mix(uA,uB,t); vec3 dir=normalize(uB-uA); vec3 tc=normalize(cameraPosition-p); vec3 s=normalize(cross(dir,tc)); p+=s*position.y*2.*uW; vP=vec2(t,position.y*2.); gl_Position=projectionMatrix*viewMatrix*vec4(p,1.); }`,
    fragmentShader: `uniform float uTime,uK; uniform vec3 uCol; varying vec2 vP;
void main(){ float c=exp(-pow(abs(vP.y)*2.2,2.)); float core=exp(-pow(abs(vP.y)*7.,2.)); float pul=.7+.3*sin(vP.x*60.-uTime*40.); float e=smoothstep(0.,.04,vP.x)*smoothstep(1.,.96,vP.x);
  vec3 col=uCol*c*pul*2.2+vec3(1.)*core*1.6; gl_FragColor=vec4(col*uK*e,(c+core)*uK*e); }`
  });
  const l = new THREE.Mesh(geo, m); l.frustumCulled = false; l.renderOrder = 24; return l;
}

/* --- лучи света (god rays) --- */
function makeGodRays(n = 3) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const m = new SMat({
      uniforms: uni({ uK: { value: i } }), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `uniform float uTime,uK; varying vec2 vUv; float h(float x){return fract(sin(x*127.1)*43758.5);}
void main(){ float x=abs(vUv.x-.5)*2.; float a=smoothstep(1.,0.,x)*smoothstep(0.,.25,vUv.y)*smoothstep(1.,.5,vUv.y); float fl=.6+.4*sin(uTime*.4+uK*2.+vUv.y*3.)*sin(uTime*.23+uK); float st=.75+.25*sin(vUv.x*40.+uK*9.+uTime*.2);
  gl_FragColor=vec4(vec3(1.,.74,.45)*a*fl*st*.012,a*.02); }`
    });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(14 + i * 5, 60), m); p.position.set(-20 + i * 22, 26, -30 - i * 18); p.rotation.z = .42 - i * .08; p.rotation.y = .3 * i; p.renderOrder = 12; p.frustumCulled = false; g.add(p);
  }
  return g;
}

/* --- карточки 2.5D: трава, кусты, камыш (инстансинг + шейдерное качание) --- */
function makeCards(type, count, area, seed, getH) {
  const r = rng(seed), base = new THREE.PlaneGeometry(1, 1); base.translate(0, .5, 0);
  const g = new THREE.InstancedBufferGeometry(); g.index = base.index; g.attributes.position = base.attributes.position; g.attributes.uv = base.attributes.uv;
  const ip = new Float32Array(count * 8), is = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) { const x = (r() - .5) * area[0] + (area[2] || 0), z = (r() - .5) * area[1] + (area[3] || 0), y = getH ? getH(x, z) : 0, a = r() * TAU, s = .7 + r() * .7, sd = r() * 100; ip.set([x, y, z, a, x, y, z, a + PI / 2], i * 8); is.set([s, sd, s, sd], i * 4); }
  g.setAttribute('aPos', new THREE.InstancedBufferAttribute(ip, 4)); g.setAttribute('aScl', new THREE.InstancedBufferAttribute(is, 2)); g.instanceCount = count * 2;
  const m = new SMat({
    uniforms: uni({ uType: { value: type }, uH: { value: type === 0 ? .9 : type === 1 ? 1.2 : 1.5 } }), side: THREE.DoubleSide,
    vertexShader: `attribute vec4 aPos; attribute vec2 aScl; uniform float uH,uTime; varying vec2 vUv; varying float vS; varying vec3 vW;
void main(){ vUv=uv; vS=aScl.y; float a=aPos.w; vec3 q=position; float cx=cos(a),sx=sin(a);
  vec3 lp=vec3(q.x*cx,q.y,q.x*sx)*vec3(1.,1.,1.); vec2 w=aPos.xz; float gust=.5+.5*sin(uTime*.37+w.x*.05)*sin(uTime*.23+w.y*.06);
  float bend=uv.y*uv.y*(sin(uTime*1.7+aScl.y+w.x*.35)*.12+gust*.28); lp.x+=bend; lp.z+=bend*.4;
  vec3 wp=vec3(aPos.x,aPos.y,aPos.z)+vec3(lp.x*aScl.x*uH,lp.y*aScl.x*uH,lp.z*aScl.x*uH); vW=wp; gl_Position=projectionMatrix*viewMatrix*vec4(wp,1.); }`,
    fragmentShader: GLSL_COMMON + `uniform float uType; varying vec2 vUv; varying float vS; varying vec3 vW;
void main(){ vec2 g=floor(vUv*vec2(12.,16.)); vec2 uv=(g+.5)/vec2(12.,16.); float m=0.; vec3 em=vec3(0.);
  if(uType<.5){ for(int i=0;i<5;i++){ float fi=float(i); float cx=(fi+.5)/5.+(h21(vec2(fi,vS))-.5)*.14; float hh=.4+.58*h21(vec2(fi,vS+3.)); float w=(1.-uv.y/hh)*.085+.012; float ln=(h21(vec2(fi,vS+7.))-.5)*.3*uv.y; if(uv.y<hh&&abs(uv.x-cx-ln)<w) m=1.; } }
  else if(uType<1.5){ for(int i=0;i<3;i++){ float fi=float(i); float cx=.5+(fi-1.)*.12+(h21(vec2(fi,vS))-.5)*.1; float ln=(fi-1.)*.2*uv.y+(h21(vec2(fi,vS+2.))-.5)*.1*uv.y; if(uv.y<.96&&abs(uv.x-cx-ln)<.04) m=1.; float ty=.35+.2*fi; if(uv.y>ty&&uv.y<ty+.22&&abs(uv.x-(cx+ln)-(mod(fi,2.)>.5?-1.:1.)*(uv.y-ty)*.8)<.035) m=1.; } }
  else { float cx=.5+(h21(vec2(vS,1.))-.5)*.1; float st=abs(uv.x-cx-uv.y*(h21(vec2(vS,2.))-.5)*.3); if(uv.y<.78&&st<.04) m=1.; float bd=length((uv-vec2(cx+uv.y*.0,.84))*vec2(1.,.8)); if(bd<.13) { m=1.; em=vec3(.3,.85,1.)*3.; } }
  if(m<.5) discard;
  vec3 c; float y=uv.y; if(uType>1.5) c=(em.x>0.)?vec3(.3,.85,1.):mix(vec3(.08,.1,.07),vec3(.2,.26,.15),y); else if(uType>.5) c=mix(vec3(.1,.07,.06),vec3(.3,.2,.14),y); else { float s=floor(y*4.)/3.; c=mix(vec3(.09,.1,.06),vec3(.45,.5,.22),s); }
  c*=uAmbCol*1.5+pointLights(vW,vec3(0.,1.,0.))*.12; gl_FragColor=vec4(applyFog(c,em*(uType>1.5?1.:0.),vW),1.); }`
  });
  const mesh = new THREE.Mesh(g, m); mesh.frustumCulled = false; return mesh;
}
function makeParallax(radius, seed, dark, scale) {
  const geo = new THREE.CylinderGeometry(radius, radius, 70, 64, 1, true);
  const m = new SMat({
    uniforms: uni({ uSeed: { value: seed }, uDark: { value: dark }, uScale: { value: scale } }), side: THREE.BackSide, depthWrite: false,
    vertexShader: `varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader: GLSL_COMMON + `varying vec3 vW; uniform float uSeed,uDark,uScale;
void main(){
  vec2 d=vW.xz-cameraPosition.xz; float u=floor(atan(d.y,d.x)*uScale*26.)/26.; float y=floor(vW.y*1.6)/1.6/60.;
  float rid=.04+.075*fbm(vec2(u*1.2,uSeed))+.02*sin(u*5.+uSeed); float m=step(y,rid);
  float c=floor(u*2.1),f=fract(u*2.1)-.5; float pres=step(.6,h21(vec2(c,uSeed))); float hg=.15+.3*h21(vec2(c,uSeed+4.));
  m=max(m,pres*step(abs(f),.017)*step(y,hg)); m=max(m,pres*step(length(vec2(f*.5,y-hg-.012)),.016)); m=max(m,pres*step(abs(y-hg*.7),.004)*step(abs(f),.1));
  float c2=floor(u*.6+uSeed),f2=fract(u*.6+uSeed)-.5; float p2=step(.8,h21(vec2(c2,uSeed+9.))); float lg=step(abs(abs(f2)-.05),.009)*step(y,.115)*step(.02,y)+step(abs(f2),.075)*step(.115,y)*step(y,.15)+step(abs(f2-.03),.01)*step(.15,y)*step(y,.18);
  m=max(m,p2*lg);
  if(m<.5) discard;
  vec3 col=mix(uFogCol*.5,uFogCol*.92,uDark)+vec3(.01); gl_FragColor=vec4(col,1.);
}` });
  const s = new THREE.Mesh(geo, m); s.frustumCulled = false; s.renderOrder = -50 + Math.round(-radius * .1); return s;
}

/* ---------- взрыв: спрайты + искры + обломки (физика CPU, их мало) ---------- */
class Burst {
  constructor(scene, debrisDef, mat) {
    const mk = (n, f) => Array.from({ length: n }, (_, i) => f(i));
    this.fire = makeSpritePool(mk(6, i => ({ fx: 0, delay: i * .05, life: .8, size: 3.4 - i * .25, vx: Math.sin(i * 2.1) * 1.3, vy: 1.3 + i * .2, vz: Math.cos(i * 2.1) * 1.3 })), true, false);
    this.smoke = makeSpritePool(mk(9, i => ({ fx: i < 6 ? 2 : 8, delay: .2 + i * .09, life: 2.7 + i * .2, size: 2.8 + i * .25, vx: Math.sin(i * 1.7) * .6, vy: 1.2 + i * .12, vz: Math.cos(i * 1.7) * .6 })), false, false);
    this.shock = makeSpritePool([{ fx: 7, delay: 0, life: .6, size: 8, grow: 1.4 }], false, false);
    this.sparks = makeSparks(80);
    [this.fire, this.smoke, this.shock, this.sparks].forEach(o => scene.add(o));
    ensureGeos(debrisDef); this.mat = mat; this.def = debrisDef; this.deb = [];
    for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(debrisDef.geos['c' + (i % 6)], mat); m.visible = false; m.userData = { v: new THREE.Vector3(), w: new THREE.Vector3(), life: 0 }; scene.add(m); this.deb.push(m); }
    this.t0 = -1e4; this.pos = new THREE.Vector3(); this.str = 1;
  }
  trigger(p, t, str = 1) {
    this.t0 = t; this.pos.copy(p); this.str = str;
    this.fire.material.uniforms.uOrigin.value.copy(p); this.fire.material.uniforms.uT0.value = t;
    this.smoke.material.uniforms.uOrigin.value.copy(p); this.smoke.material.uniforms.uT0.value = t;
    this.shock.material.uniforms.uOrigin.value.set(p.x, p.y + .3, p.z); this.shock.material.uniforms.uT0.value = t;
    const su = this.sparks.material.uniforms; su.uOrigin.value.copy(p); su.uT0.value = t; su.uGround.value = p.y - .2;
    this.deb.forEach((m, i) => { m.visible = true; m.position.copy(p); m.position.y += .3; m.scale.setScalar(1.4 + Math.random() * .6); const a = Math.random() * TAU, s = 4 + Math.random() * 6; m.userData.v.set(Math.cos(a) * s, 5 + Math.random() * 7, Math.sin(a) * s); m.userData.w.set((Math.random() - .5) * 14, (Math.random() - .5) * 14, (Math.random() - .5) * 14); m.userData.life = 0; });
  }
  update(dt, t) {
    this.deb.forEach(m => {
      if (!m.visible) return; const u = m.userData; u.life += dt; u.v.y -= 15 * dt; m.position.addScaledVector(u.v, dt); m.rotation.x += u.w.x * dt; m.rotation.y += u.w.y * dt; m.rotation.z += u.w.z * dt;
      const g = heightAt(m.position.x, m.position.z) + .12; if (m.position.y < g) { m.position.y = g; u.v.y *= -.32; u.v.x *= .72; u.v.z *= .72; u.w.multiplyScalar(.6); }
      if (u.life > 3.2) { const k = 1 - (u.life - 3.2) / .8; if (k <= 0) m.visible = false; else m.scale.multiplyScalar(Math.pow(Math.max(k, .01), dt * 2)); }
    });
    return Math.max(0, 1 - (t - this.t0) / 1.2);
  }
}
function makeDecal(idx, size) {
  const geo = new THREE.PlaneGeometry(size, size); geo.rotateX(-PI / 2);
  const m = new SMat({ uniforms: uni({ uIdx: { value: idx }, uOp: { value: 1 } }), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    vertexShader: `varying vec2 vUv; varying vec3 vW; void main(){ vUv=uv; vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader: GLSL_COMMON + `uniform sampler2D tFx; uniform float uIdx,uOp; varying vec2 vUv; varying vec3 vW; uniform sampler2D tDecal;
void main(){ vec2 cell=vec2(mod(uIdx,4.),1.-floor(uIdx/4.)); vec4 s=texture2D(tDecal,(cell+vUv)/vec2(4.,2.)); if(s.a<.5) discard;
  vec3 lit=s.rgb*(uAmbCol*1.1+pointLights(vW,vec3(0.,1.,0.))*.12); gl_FragColor=vec4(applyFog(lit,vec3(0.),vW),uOp); }` });
  m.uniforms.tDecal = { value: ATL.decal.texture };
  const mesh = new THREE.Mesh(geo, m); mesh.renderOrder = 2; return mesh;
}
/* ===== 2D пиксель-арт: иконки HUD, шрифт, рамки, логотип (статичный арт, рисуется при старте) ===== */
const ICONS = {
  heart: ['.##..##.', '########', '########', '########', '.######.', '..####..', '...##...', '........'],
  medkit: ['........', '.######.', '.##..##.', '###..###', '###..###', '.##..##.', '.######.', '........'],
  ammo: ['...##...', '..####..', '..####..', '..####..', '..####..', '.######.', '.######.', '.######.'],
  bolt: ['...###..', '..###...', '.###....', '#######.', '...###..', '..###...', '.##.....', '##......'],
  warning: ['...##...', '..####..', '..#..#..', '.#.##.#.', '.#.##.#.', '#......#', '########', '........'],
  skull: ['.######.', '########', '#.####.#', '#.####.#', '########', '.##..##.', '.######.', '.#.##.#.'],
  gear: ['..#..#..', '.######.', '##.##.##', '.#....#.', '.#....#.', '##.##.##', '.######.', '..#..#..'],
  eye: ['........', '..####..', '.#....#.', '#..##..#', '#.####.#', '.#.##.#.', '..####..', '........'],
  crosshair: ['...##...', '...##...', '...##...', '###..###', '###..###', '...##...', '...##...', '...##...'],
  radiation: ['..####..', '.#.##.#.', '##.##.##', '#..##..#', '...##...', '..#..#..', '.#....#.', '........'],
  fuel: ['...##...', '...##...', '..####..', '..####..', '.######.', '.######.', '.######.', '..####..'],
  key: ['.####...', '##..##..', '##..##..', '.####...', '..##....', '..###...', '..##....', '..###...'],
  lock: ['..####..', '.#....#.', '.#....#.', '########', '###..###', '###..###', '########', '########'],
  signal: ['.......#', '.......#', '.....#.#', '.....#.#', '...#.#.#', '...#.#.#', '.#.#.#.#', '.#.#.#.#'],
  compass: ['...##...', '..####..', '.##..##.', '##....##', '##....##', '.##..##.', '..####..', '...##...'],
  battery: ['..####..', '.######.', '.#....#.', '.#.##.#.', '.#.##.#.', '.#....#.', '.######.', '.######.']
};
const FONT = {
  A: '01110 10001 11111 10001 10001', B: '11110 10001 11110 10001 11110', C: '01111 10000 10000 10000 01111', D: '11110 10001 10001 10001 11110', E: '11111 10000 11110 10000 11111', F: '11111 10000 11110 10000 10000',
  G: '01111 10000 10011 10001 01111', H: '10001 10001 11111 10001 10001', I: '11111 00100 00100 00100 11111', J: '00111 00001 00001 10001 01110', K: '10001 10010 11100 10010 10001', L: '10000 10000 10000 10000 11111',
  M: '10001 11011 10101 10001 10001', N: '10001 11001 10101 10011 10001', O: '01110 10001 10001 10001 01110', P: '11110 10001 11110 10000 10000', Q: '01110 10001 10101 10010 01101', R: '11110 10001 11110 10010 10001',
  S: '01111 10000 01110 00001 11110', T: '11111 00100 00100 00100 00100', U: '10001 10001 10001 10001 01110', V: '10001 10001 10001 01010 00100', W: '10001 10001 10101 11011 10001', X: '10001 01010 00100 01010 10001',
  Y: '10001 01010 00100 00100 00100', Z: '11111 00010 00100 01000 11111', '0': '01110 10011 10101 11001 01110', '1': '00100 01100 00100 00100 01110', '2': '01110 10001 00110 01000 11111', '3': '11110 00001 01110 00001 11110',
  '4': '10010 10010 11111 00010 00010', '5': '11111 10000 11110 00001 11110', '6': '01110 10000 11110 10001 01110', '7': '11111 00010 00100 01000 01000', '8': '01110 10001 01110 10001 01110', '9': '01110 10001 01111 00001 01110'
};
const hx = a => '#' + a.map(v => Math.round(clamp(v) * 255).toString(16).padStart(2, '0')).join('');
function cv2(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function drawGlyph(x, c, g, px, py, s, col) { x.fillStyle = col; const rows = g.split(' '); rows.forEach((r, j) => [...r].forEach((b, i) => { if (b === '1') x.fillRect(px + i * s, py + j * s, s, s); })); }
function art2d() {
  const out = {}, oc = hx(RAMPS.ochre[3] && hex(RAMPS.ochre[3])), sh = RAMPS.steel[0], hi = RAMPS.ochre[4];
  { const names = Object.keys(ICONS), c = cv2(4 * 12, 4 * 12), x = c.getContext('2d'); names.forEach((n, k) => { const ox = (k % 4) * 12 + 2, oy = ((k / 4) | 0) * 12 + 2; ICONS[n].forEach((r, j) => [...r].forEach((b, i) => { if (b === '#') { x.fillStyle = sh; x.fillRect(ox + i + 1, oy + j + 1, 1, 1); } })); ICONS[n].forEach((r, j) => [...r].forEach((b, i) => { if (b === '#') { x.fillStyle = j < 3 ? hi : RAMPS.ochre[3]; x.fillRect(ox + i, oy + j, 1, 1); } })); }); out.icons = { canvas: c, cols: 4, rows: 4, names }; }
  { const keys = Object.keys(FONT), c = cv2(12 * 6, 3 * 6), x = c.getContext('2d'); keys.forEach((k, i) => { drawGlyph(x, c, FONT[k], (i % 12) * 6, ((i / 12) | 0) * 6, 1, RAMPS.ochre[3]); }); out.font = { canvas: c, cols: 12, rows: 3, names: keys }; }
  { const c = cv2(3 * 40, 28), x = c.getContext('2d'); const frame = (ox, w, h, style) => { x.fillStyle = 'rgba(20,19,28,.92)'; x.fillRect(ox + 1, 1, w - 2, h - 2); x.fillStyle = RAMPS.steel[3]; x.fillRect(ox + 2, 0, w - 4, 1); x.fillRect(ox + 2, h - 1, w - 4, 1); x.fillRect(ox, 2, 1, h - 4); x.fillRect(ox + w - 1, 2, 1, h - 4); x.fillStyle = RAMPS.ochre[3]; x.fillRect(ox + 1, 1, 2, 1); x.fillRect(ox + 1, 1, 1, 2); x.fillRect(ox + w - 3, h - 2, 2, 1); x.fillRect(ox + w - 2, h - 3, 1, 2); if (style === 1) { for (let i = 0; i < 6; i++) { x.fillStyle = i < 4 ? RAMPS.red[3] : RAMPS.steel[2]; x.fillRect(ox + 5 + i * 5, 8, 4, h - 16); } } if (style === 2) { x.fillStyle = RAMPS.ochre[2]; x.fillRect(ox + 4, h / 2 - 1, w - 8, 2); } };
    frame(0, 38, 26, 0); frame(40, 38, 26, 1); frame(80, 38, 26, 2); out.hud = { canvas: c, cols: 3, rows: 1, names: ['панель', 'полоса здоровья', 'кнопка'] }; }
  { const t = 'ASH ROAD', s = 4, c = cv2(t.length * 6 * s + 8, 5 * s + 10), x = c.getContext('2d'); [...t].forEach((ch, i) => { if (FONT[ch]) { drawGlyph(x, c, FONT[ch], 4 + i * 6 * s + s, 4 + s, s, RAMPS.steel[0]); drawGlyph(x, c, FONT[ch], 4 + i * 6 * s, 4, s, RAMPS.ochre[3]); } }); out.logo = { canvas: c, cols: 1, rows: 1, names: ['логотип'] }; }
  return out;
}
return { makeCirrusLayers, ATL: () => ATL, TILES, TILES_ANIM, TILES_NAMES, AUTOSETS, FX, DECALS, ICONS, FONT, LOOPS, BAKE_OPT, mkRT, fsDraw, clearRT, rtToCanvas, buildTileAtlases, buildFxAtlases, bakeSheet, makeBillboard, billboardUpdate, makeStack, makeSky, makeFogLayers, makeAmbientPoints, makeRain, makeSpritePool, makeSparks, makeLaser, makeGodRays, makeCards, makeParallax, Burst, makeDecal, art2d, uni, FXU, withNeutral };
}

import * as T from 'three';
// The Last Healer · INK video pack. Supplement existing accepted car, traveller and rowboat.
// All geometry is deterministic by seed; the accepted watercolor renderer remains unchanged.
const inks = new Map();
function pigment(hex, luminous=false) {
  const key=hex+':'+luminous;
  if (!inks.has(key)) inks.set(key, luminous
    ? new T.MeshBasicMaterial({color:hex})
    : new T.MeshStandardMaterial({color:hex,roughness:.91,metalness:.02}));
  return inks.get(key);
}
function rng(seed) {
  let x=(seed|0)^0x4c27a5b3;
  return ()=>((x=Math.imul(x,1664525)+1013904223|0)>>>0)/4294967296;
}
function part(root, geometry, color, at=[0,0,0], luminous=false) {
  const m=new T.Mesh(geometry, pigment(color,luminous));
  m.position.set(...at); m.userData.watercolorOutline=!luminous;
  if(luminous) m.userData.watercolorSkipWash=true;
  root.add(m);return m;
}
function beam(root, a, b, radius, color, ends=7) {
  const p=new T.Vector3(...a),q=new T.Vector3(...b),v=q.clone().sub(p);
  const o=part(root,new T.CylinderGeometry(radius*.78,radius,v.length(),ends),color);
  o.position.copy(p).add(q).multiplyScalar(.5);
  o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());
  return o;
}
function block(root, dims, color, at) {return part(root,new T.BoxGeometry(...dims),color,at);}
const glowVertex='varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}';
const glowFragment='varying vec2 vUv; uniform float uPower; uniform vec3 uColor; void main(){float side=pow(max(0.0,1.0-abs(vUv.x*2.0-1.0)),1.8);float end=smoothstep(0.01,0.31,vUv.y)*(1.0-smoothstep(0.55,1.0,vUv.y));gl_FragColor=vec4(uColor,side*end*uPower*0.22);}';
function glowMaterial(color) {
  return new T.ShaderMaterial({uniforms:{uPower:{value:1},uColor:{value:new T.Color(color)}},
    vertexShader:glowVertex,fragmentShader:glowFragment,transparent:true,
    depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending});
}
function lampLens(root,x,y,z,red=false) {
  part(root,new T.CylinderGeometry(.155,.155,.09,12),red?'#5f5e58':'#4b5e5b',[x,y,z]);
  const bezel=part(root,new T.TorusGeometry(.134,.023,5,14),red?'#5a403a':'#ced0b7',[x,y,z+.052]);
  bezel.userData.watercolorOutline=true;
  const lens=part(root,new T.CircleGeometry(.108,18),red?'#bd5c4e':'#f8e0a2',[x,y,z+.065],true);
  for(let k=0;k<4;k++){
    const a=k*Math.PI/2;
    part(root,new T.SphereGeometry(.018,5,4),red?'#bd7c69':'#e9e2be',
      [x+Math.cos(a)*.12,y+Math.sin(a)*.12,z+.076],true);
  }
  return lens;
}
// Spotlight is part of an actual car headlight rig, not a floating luminous circle.
export function carHeadlights(seed=1) {
  const r=rng(seed), g=new T.Group(), cones=[], spots=[], lamps=[];
  g.name='Фары старого автомобиля';
  for(const side of [-1,1]) {
    const x=side*.58;
    const housing=part(g,new T.CylinderGeometry(.21,.18,.22,12),'#607e74',[x,.72,1.58]);
    housing.rotation.x=Math.PI/2;
    lampLens(g,x,.72,1.72);
    const headGlow=part(g,new T.SphereGeometry(.072,8,6),'#f4dda4',[x,.72,1.81],true);
    headGlow.scale.z=.18;lamps.push(headGlow);
    // Tail lamp and rusted retaining bolts, mounted on the *existing* car.
    part(g,new T.BoxGeometry(.29,.16,.10),'#52615c',[x,.61,-1.59]);
    const rear=part(g,new T.BoxGeometry(.22,.10,.035),'#bd6c63',[x,.61,-1.65],true);
    rear.userData.watercolorSkipWash=true;
    for(let j=0;j<3;j++) block(g,[.025,.09,.035],'#4b514b',[x-.08+j*.08,.61,-1.68]);
    const cone=new T.Mesh(new T.ConeGeometry(.94,5.5,22,1,true),glowMaterial('#eed9a1'));
    cone.rotation.x=-Math.PI/2;cone.position.set(x,.52,4.55);
    cone.userData.watercolorSkipWash=true;cone.userData.watercolorOutline=false;g.add(cone);cones.push(cone);
    const ground=new T.Mesh(new T.PlaneGeometry(2.25,5.35),
      new T.ShaderMaterial({uniforms:{uTime:{value:0},uColor:{value:new T.Color('#f2d5a2')}},
        vertexShader:glowVertex,
        fragmentShader:'varying vec2 vUv;uniform vec3 uColor;uniform float uTime;void main(){float x=abs(vUv.x-.5)*2.;float y=vUv.y;float edge=smoothstep(1.,.05,x/(.14+y*.93));float near=smoothstep(0.,.12,y)*(1.-smoothstep(.65,1.,y));float grain=.87+.13*sin(vUv.x*37.+vUv.y*91.+uTime*.4);gl_FragColor=vec4(uColor,.21*edge*near*grain);}',
        transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide}));
    ground.rotation.x=-Math.PI/2;ground.position.set(x,.035,4.4);g.add(ground);spots.push(ground);
    for(let j=0;j<5;j++){
      const a=(j-2)*.07, z=1.48+j*.05;
      part(g,new T.SphereGeometry(.025,5,4),'#556662',[x+.18,.72+a,z]);
    }
  }
  for(const side of [-1,1]){
    beam(g,[side*.82,.40,1.59],[side*.72,.39,1.68],.03,'#a89a80');
    block(g,[.30,.038,.12],'#9c9b8e',[side*.55,.40,1.76]);
  }
  // Quiet motion: beams follow chassis movement without screen shake.
  g.userData.tick=(t)=>{
    const turn=Math.sin(t*.47+seed*.22)*.014;
    cones.forEach((o,i)=>{
      o.rotation.y=turn+(i?-.012:.012);
      o.material.uniforms.uPower.value=.94+.06*Math.sin(t*1.25+i*.8);
    });
    spots.forEach((o,i)=>{o.material.uniforms.uTime.value=t;o.rotation.z=Math.sin(t*.52+i)*.008;});
    lamps.forEach((o,i)=>{o.scale.x=.97+.03*Math.sin(t*.73+i*.32);});
  };
  g.userData.footprint=0;return g;
}
function flashlightHousing(g) {
  // Offset relative to the accepted traveller's right shoulder and extended hand.
  const wrist=new T.Group();wrist.position.set(.38,.83,.29);g.add(wrist);
  block(wrist,[.17,.12,.31],'#b2a088',[0,-.05,.02]);
  const body=part(wrist,new T.CylinderGeometry(.095,.08,.34,11),'#4f6160',[0,0,.22]);
  body.rotation.x=Math.PI/2;
  for(const z of [.10,.18,.30]){
    part(wrist,new T.TorusGeometry(.085,.011,5,12),'#c6af88',[0,0,z]);
  }
  part(wrist,new T.CylinderGeometry(.13,.13,.085,12),'#768b80',[0,0,.41]).rotation.x=Math.PI/2;
  part(wrist,new T.CircleGeometry(.107,18),'#f6dfae',[0,0,.46],true);
  part(wrist,new T.TorusGeometry(.118,.022,6,15),'#b9bdab',[0,0,.47]);
  const switchMesh=block(wrist,[.09,.018,.075],'#bd7c69',[0,.104,.18]);
  switchMesh.rotation.y=.1;
  return wrist;
}
// A real carried item: arm grip, lens, volumetric beam and droplets within it.
export function handFlashlight(seed=1) {
  const r=rng(seed),g=new T.Group();g.name='Фонарик аптекаря';
  const pivot=flashlightHousing(g);
  const light=new T.Group();pivot.add(light);
  const cone=new T.Mesh(new T.ConeGeometry(.67,3.7,24,1,true),glowMaterial('#efe0bc'));
  cone.rotation.x=-Math.PI/2;cone.position.set(0,0,2.30);
  cone.userData.watercolorSkipWash=true;light.add(cone);
  const pool=new T.Mesh(new T.PlaneGeometry(1.8,3.4),
    new T.ShaderMaterial({uniforms:{uPower:{value:1}},vertexShader:glowVertex,
      fragmentShader:'uniform float uPower;varying vec2 vUv;void main(){float q=abs(vUv.x-.5)*2.;float w=smoothstep(1.,.1,q/(.16+vUv.y*.85));float h=smoothstep(0.,.19,vUv.y)*(1.-smoothstep(.65,1.,vUv.y));gl_FragColor=vec4(.91,.81,.58,.21*w*h*uPower);}',
      transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending}));
  pool.rotation.x=-Math.PI/2;pool.position.set(.38,.035,2.1);g.add(pool);
  const moteGeo=new T.BufferGeometry(), positions=new Float32Array(63*3);
  for(let i=0;i<63;i++){
    const z=.63+r()*3.1,spread=(z-.5)*.19;
    positions.set([(r()-.5)*spread*2, (r()-.5)*spread*1.4,z],i*3);
  }
  moteGeo.setAttribute('position',new T.BufferAttribute(positions,3));
  const motes=new T.Points(moteGeo,new T.PointsMaterial({color:'#e5d2ae',size:.018,
    transparent:true,opacity:.44,depthWrite:false}));
  light.add(motes);
  const click=part(pivot,new T.BoxGeometry(.045,.025,.055),'#4a4e48',[0,.13,.12]);
  g.userData.enabled=true;
  g.userData.setEnabled=enabled=>{g.userData.enabled=!!enabled;light.visible=!!enabled;pool.visible=!!enabled;};
  g.userData.interact={radius:2.3,effect:'reveal_herbs_at_night',label_ru:'Осветить тропу и собрать травы'};
  g.userData.tick=(t)=>{
    // Inertia is applied to the articulated hand, not the entire scene.
    pivot.rotation.y=.13*Math.sin(t*.56-seed*.08);
    pivot.rotation.x=.045*Math.sin(t*1.4-.65);
    cone.material.uniforms.uPower.value=.86+.14*Math.sin(t*.85);
    pool.material.uniforms.uPower.value=.84+.16*Math.sin(t*.65);
    motes.position.z=.025*Math.sin(t*.56);
    click.position.y=.13+(g.userData.enabled?0:-.017);
  };
  g.userData.footprint=0;return g;
}
function oarBlade(root,side) {
  const blade=new T.Shape();
  blade.moveTo(-.11,-.02);blade.quadraticCurveTo(-.24,.21,-.17,.65);
  blade.quadraticCurveTo(-.09,1.02,0,1.12);
  blade.quadraticCurveTo(.11,.97,.17,.65);
  blade.quadraticCurveTo(.23,.19,.11,-.02);blade.closePath();
  const geo=new T.ExtrudeGeometry(blade,{depth:.025,bevelEnabled:true,bevelSize:.012,bevelThickness:.014,bevelSegments:1,curveSegments:7});
  const m=part(root,geo,'#b5a078',[0,0,side*1.55]);
  m.rotation.set(Math.PI/2,0,side>0?-.18:.18);
  for(let k=0;k<4;k++)beam(root,[0,-.03,side*(1.6+k*.25)],[0,-.035,side*(1.68+k*.24)],.009,'#685b4c');
  return m;
}
// The maker is only the sailor/oars: rowboat geometry comes from the accepted ink-extras.
export function rowingHealer(seed=1) {
  const r=rng(seed),g=new T.Group();g.name='Аптекарь с вёслами';
  // Seated legs, coat, collar, hood, face and backpack; true 3D at every angle.
  for(const s of [-1,1]){
    beam(g,[.0,.63,s*.18],[.34,.49,s*.25],.12,'#414f50');
    block(g,[.23,.095,.22],'#4b5148',[.40,.45,s*.25]);
  }
  const torso=new T.Group();torso.position.set(-.14,.61,0);g.add(torso);
  part(torso,new T.CylinderGeometry(.23,.37,.69,10),'#bc994f',[0,.35,0]);
  part(torso,new T.ConeGeometry(.31,.36,8),'#8e7861',[-.03,.76,-.02]);
  part(torso,new T.SphereGeometry(.20,12,8),'#d5b895',[.07,.91,.0]);
  const hood=part(torso,new T.SphereGeometry(.245,12,8),'#ddd2ae',[-.05,.96,0]);
  hood.scale.set(.8,1.16,1.0);hood.position.x=-.08;
  part(torso,new T.ConeGeometry(.10,.20,6),'#c9ad88',[.24,.90,0]).rotation.z=-Math.PI/2;
  for(const z of [-.18,.18])part(torso,new T.SphereGeometry(.025,6,4),'#464747',[.225,.94,z]);
  const satchel=block(torso,[.25,.39,.32],'#736b59',[-.30,.35,-.23]);
  satchel.rotation.z=-.18;
  const strap=beam(torso,[.10,.64,-.22],[-.29,.25,-.23],.025,'#d5c49f');
  for(let k=0;k<5;k++)block(torso,[.035,.045,.03],'#d1c09c',[.22,.50+k*.095,-.195]);
  const shoulder=[],arms=[],oars=[];
  for(const s of [-1,1]){
    const arm=new T.Group();arm.position.set(-.02,.56,s*.29);torso.add(arm);
    shoulder.push(arm);
    beam(arm,[0,0,0],[.25,-.22,s*.19],.090,'#b9965d');
    beam(arm,[.25,-.22,s*.19],[.52,-.12,s*.09],.071,'#b99564');
    part(arm,new T.SphereGeometry(.075,7,5),'#d5b895',[.52,-.12,s*.09]);
    arms.push(arm);
    const o=new T.Group();o.position.set(.36,.70,s*.48);g.add(o);
    // Long ash-wood shaft, iron oarlock and one broad, tapered blade.
    beam(o,[0,0,-s*.35],[0,0,s*1.72],.034,'#a89a80');
    part(o,new T.TorusGeometry(.079,.018,6,12),'#5c6c62',[0,.0,s*.05]).rotation.x=Math.PI/2;
    for(let j=0;j<5;j++)block(o,[.03,.017,.04],'#766956',[0,.016,s*(.22+j*.17)]);
    oarBlade(o,s);oars.push(o);
  }
  // Slim mooring-water line anchors the assembly to the already accepted boat.
  const wash=part(g,new T.BoxGeometry(1.4,.015,.60),'#789b9a',[0,.018,0]);
  wash.material=wash.material.clone();wash.material.transparent=true;wash.material.opacity=.20;
  g.userData.tick=(t)=>{
    const phase=t*1.6+seed*.09,stroke=Math.sin(phase);
    torso.rotation.z=.06*Math.sin(phase-.42);
    torso.rotation.x=.045*Math.sin(phase-.25);
    hood.rotation.z=.025*Math.sin(phase-.70);
    oars.forEach((o,i)=>{
      const s=i?1:-1;
      o.rotation.x=s*(.16+.23*Math.sin(phase-.33+i*.09));
      o.rotation.y=s*(.13*Math.cos(phase-.20-i*.11));
      o.position.y=.70+.035*Math.sin(phase+.18+i*.16);
    });
    arms.forEach((a,i)=>{a.rotation.z=-.10*stroke;a.rotation.x=(i?1:-1)*.13*Math.sin(phase-.24);});
    wash.scale.x=.98+.06*Math.sin(phase-.32);
  };
  g.userData.footprint=0;return g;
}
const rainVertex='attribute float phase;uniform float uTime;varying float vFade;void main(){vec3 p=position;float f=mod(p.y+phase*3.8-uTime*3.2+16.,3.8);p.y=f+.04;p.x+=uTime*.06;vFade=smoothstep(0.,.45,f)*(1.-smoothstep(3.2,3.8,f));gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}';
const rainFragment='varying float vFade;void main(){gl_FragColor=vec4(.80,.88,.86,.42*vFade);}';
// Extra rain streaks and ripples. Original rain/weather in the accepted game remains intact.
export function rainSplashRings(seed=1) {
  const r=rng(seed),g=new T.Group();g.name='Дождевые штрихи и всплески';
  const rain=new T.Group();g.add(rain);
  for(let layer=0;layer<3;layer++){
    const points=new Float32Array(105*2*3),phase=new Float32Array(105*2);
    for(let i=0;i<105;i++){
      const x=(r()-.5)*5.1,z=(r()-.5)*4.7, y=r()*3.8, len=.16+r()*.18;
      points.set([x,y,z,x-.085,y-len,z+.045],i*6);
      phase[i*2]=phase[i*2+1]=r();
    }
    const geo=new T.BufferGeometry();
    geo.setAttribute('position',new T.BufferAttribute(points,3));
    geo.setAttribute('phase',new T.BufferAttribute(phase,1));
    const m=new T.LineSegments(geo,new T.ShaderMaterial({
      uniforms:{uTime:{value:0}},vertexShader:rainVertex,fragmentShader:rainFragment,
      transparent:true,depthWrite:false,blending:T.NormalBlending}));
    m.position.x=(layer-1)*.13;m.userData.watercolorSkipWash=true;rain.add(m);
  }
  const rippleShader=new T.ShaderMaterial({
    uniforms:{uTime:{value:0},uSeed:{value:seed}},
    vertexShader:glowVertex,
    fragmentShader:'varying vec2 vUv;uniform float uTime;uniform float uSeed;void main(){vec2 q=(vUv-.5)*2.;float angle=atan(q.y,q.x);float d=length(q);float cycle=fract(uTime*.31+uSeed*.13+vUv.x*.02);float edge=1.-smoothstep(.0,.5,abs(d-cycle*.94));float ann=1.-smoothstep(.0,.028,abs(d-cycle*.88));float fragments=.77+.23*sin(angle*11.+uSeed);float fade=pow(1.-cycle,1.6);float a=.30*ann*edge*fade*fragments;gl_FragColor=vec4(.78,.91,.85,a);}',
    transparent:true,depthWrite:false,side:T.DoubleSide});
  for(let i=0;i<15;i++){
    const disc=new T.Mesh(new T.PlaneGeometry(.8+r()*.65,.8+r()*.65),rippleShader);
    disc.rotation.x=-Math.PI/2;disc.rotation.z=(r()-.5)*.3;
    disc.position.set((r()-.5)*5,.028+r()*.004,(r()-.5)*4.8);
    disc.userData.watercolorSkipWash=true;disc.userData.watercolorOutline=false;
    g.add(disc);
    if(i%2===0){
      for(let j=0;j<3;j++){
        const sx=disc.position.x+(r()-.5)*.12,sz=disc.position.z+(r()-.5)*.12;
        const drop=part(g,new T.ConeGeometry(.016,.08,5),'#d5e2d6',[sx,.045,sz],true);
        drop.rotation.x=(r()-.5)*.5;
      }
    }
  }
  g.userData.tick=(t)=>{
    rain.children.forEach((o,i)=>{o.material.uniforms.uTime.value=t+i*.35;o.rotation.y=.013*Math.sin(t*.22-i*.17);});
    rippleShader.uniforms.uTime.value=t;
    rain.rotation.z=.026*Math.sin(t*.42+seed*.1);
  };
  g.userData.footprint=0;return g;
}
export const makers={carHeadlights,handFlashlight,rowingHealer,rainSplashRings};

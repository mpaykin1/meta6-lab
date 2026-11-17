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
    const cone=new T.Mesh(new T.ConeGeometry(.82,3.5,22,1,true),glowMaterial('#eed9a1'));
    cone.rotation.x=-Math.PI/2;cone.position.set(x,.52,3.50);
    cone.userData.watercolorSkipWash=true;cone.userData.watercolorOutline=false;g.add(cone);cones.push(cone);
    const ground=new T.Mesh(new T.PlaneGeometry(2.25,3.10),
      new T.ShaderMaterial({uniforms:{uTime:{value:0},uColor:{value:new T.Color('#f2d5a2')}},
        vertexShader:glowVertex,
        fragmentShader:'varying vec2 vUv;uniform vec3 uColor;uniform float uTime;void main(){float x=abs(vUv.x-.5)*2.;float y=vUv.y;float edge=smoothstep(1.,.05,x/(.14+y*.93));float near=smoothstep(0.,.12,y)*(1.-smoothstep(.65,1.,y));float grain=.87+.13*sin(vUv.x*37.+vUv.y*91.+uTime*.4);gl_FragColor=vec4(uColor,.21*edge*near*grain);}',
        transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide}));
    ground.rotation.x=-Math.PI/2;ground.position.set(x,.035,3.4);g.add(ground);spots.push(ground);
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

function roughPath(root,coords,color,y=.02){
 const sh=new T.Shape();coords.forEach(([x,z],i)=>i?sh.lineTo(x,z):sh.moveTo(x,z));sh.closePath();
 const geo=new T.ShapeGeometry(sh,5);geo.rotateX(-Math.PI/2);
 const p=part(root,geo,color,[0,y,0]);p.material.side=T.DoubleSide;return p;
}
export function townRoad(seed=1) {
 const r=rng(seed),g=new T.Group();g.name='Перекрёсток у старой аптеки';
 const length=3.05,edge=.87;
 // The accepted landscape stays underneath; broken edges fade into its soil.
 const north=[[-edge*.98,-length],[-edge+.03,-2.3],[-.97,-1.7],[-edge,-.95],
 [-2.7,-.97],[-3.02,-.81],[-length,edge],[-2.7,.96],[-.95,edge],
 [-.90,1.7],[-.82,2.42],[-.90,length],[.89,length],[.85,2.35],
 [.97,1.65],[edge,.94],[2.8,.97],[length,.85],[length,-edge],
 [2.72,-.93],[edge,-.87],[.94,-1.7],[.82,-2.32],[.90,-length]];
 roughPath(g,north,'#777f78',.017);
 // Uneven asphalt seams, islands of exposed aggregate and edge dirt.
 const cracks=[[-2.7,-.81],[-2.1,-.58],[-1.6,-.67],[-.80,-.39],[-.14,-.57],
 [.42,-.39],[.96,-.68],[1.52,-.51],[2.07,-.74],[2.72,-.70]];
 for(let j=0;j<cracks.length-1;j++){
   const a=cracks[j],b=cracks[j+1];
   beam(g,[a[0],.030,a[1]],[b[0],.030,b[1]],.008,'#4a5859',5);
 }
 for(let i=0;i<18;i++){
   const x=(r()-.5)*5.8,z=(r()-.5)*5.8,rad=.038+r()*.10;
   if(Math.abs(x)>.91&&Math.abs(z)>.91)continue;
   const o=part(g,new T.DodecahedronGeometry(rad,0),i%3?'#6a7774':'#879087',[x,.019,z]);
   o.scale.y=.12;o.rotation.y=r()*6.28;
 }
 for(const axis of ['x','z']){
   // Cracked curb and reclaimed stone sidewalk, individually placed.
   for(const side of [-1,1]){
     for(let i=-6;i<=6;i++){
       const along=i*.46+(r()-.5)*.04,cross=side*(1.06+(r()-.5)*.03);
       if(Math.abs(along)<1.2)continue;
       const x=axis==='x'?along:cross,z=axis==='x'?cross:along;
       const curb=part(g,new T.BoxGeometry(axis==='x'?.43:.18,.11,axis==='z'?.43:.18),
         i%3?'#a1a69b':'#bcbaaa',[x,.07,z]);curb.rotation.y=(r()-.5)*.07;
       const joint=part(g,new T.BoxGeometry(axis==='x'?.10:.40,.018,axis==='z'?.40:.10),
         '#c3bca6',[x,.13,z]);joint.rotation.y=(r()-.5)*.035;
     }
   }
 }
 // Paint wear, not perfect stripes repeated to the horizon.
 for(const axis of [0,1]){
   for(const sign of [-1,1]){
     for(let i=0;i<3;i++){
       const z=sign*(1.46+i*.45),x=(r()-.5)*.09;
       const marker=part(g,new T.BoxGeometry(axis?.13:.04,.009,axis?.04:.13),
          i%2?'#d2c3a0':'#c1b8a0',axis?[z,.035,x]:[x,.035,z]);
       marker.rotation.y=(r()-.5)*.05;
     }
   }
 }
 // Dust lifted by the passing car; a small visible animated detail.
 const dust=new T.Group();g.add(dust);
 for(let i=0;i<14;i++){
   const x=(r()-.5)*.7,z=-2.4+r()*.65;
   const o=part(dust,new T.TetrahedronGeometry(.025+r()*.022,0),'#a89e83',[x,.12+r()*.12,z]);
   o.userData.watercolorOutline=false;
 }
 g.userData.tick=t=>{dust.position.x=.10*Math.sin(t*.39);dust.rotation.y=.03*Math.sin(t*.45);};
 g.userData.footprint=0;return g;
}
export function boatShed(seed=1) {
 const r=rng(seed),g=new T.Group();g.name='Лодочный сарай с зелёной крышей';
 const wood=['#736b59','#918872','#a89a80','#b6a68a'];
 // Stilted open structure; floor at local zero, dry storage above the tide line.
 for(const x of [-1.45,1.45])for(const z of [-1.06,1.06]){
   beam(g,[x,0,z],[x,2.55,z],.095,wood[(x<0?0:1)+(z<0?0:1)]);
   part(g,new T.DodecahedronGeometry(.15,0),'#a89a80',[x,.10,z]).scale.y=.40;
 }
 for(let i=0;i<17;i++){
   const z=-1.07+i*.13;
   block(g,[3.15,.08,.118],i%4?'#a89a80':'#8a8068',[0,.28,z]);
   if(i%3===0)block(g,[2.35,.012,.02],'#736b59',[(r()-.5)*.25,.33,z+.04]);
 }
 for(const s of [-1,1]){
   // Vertical timber siding at back and side; front deliberately stays open.
   for(let j=0;j<12;j++){
     const x=-1.37+j*.25;
     block(g,[.22,1.84,.075],j%4?'#918872':'#a89a80',[x,1.39,-1.08]);
   }
   for(let i=0;i<7;i++){
     const z=-.96+i*.30;
     if(i>3&&s===1)continue;
     block(g,[.08,1.70,.26],wood[i%4],[s*1.47,1.40,z]);
   }
   beam(g,[s*1.47,2.54,-1.13],[0,3.28,-1.13],.095,'#526c5c');
   beam(g,[s*1.47,2.54,1.15],[0,3.28,1.15],.09,'#526c5c');
 }
 beam(g,[0,3.29,-1.26],[0,3.29,1.25],.10,'#596d60');
 // Two sloped roofs with layered green timber shingles; irregular edges.
 for(const s of [-1,1]){
   const roof=new T.Group();roof.position.set(s*.75,2.93,0);roof.rotation.z=s*.45;g.add(roof);
   block(roof,[1.77,.16,2.64],'#587879',[0,0,0]);
   for(let j=0;j<10;j++){
     for(let i=0;i<4;i++){
       const z=-1.12+j*.24+(r()-.5)*.024;
       const x=-.68+i*.46+(r()-.5)*.04;
       const sh=block(roof,[.43,.025,.21],(i+j)%4===0?'#6f9581':'#627c6f',[x,.09,z]);
       sh.rotation.y=(r()-.5)*.065;
     }
   }
   // Faded crimson ridge stripe reads as painted water-damaged roof trim.
   block(roof,[.13,.028,2.66],'#bd7c69',[-s*.77,.115,0]);
 }
 // Interior storage supplies the reason for docking: rope, crate and oar rack.
 for(let i=0;i<3;i++){
   const b=block(g,[.55,.44,.46],'#b6a68a',[-.91+i*.72,.62,-.72]);
   b.rotation.y=(r()-.5)*.15;
   for(let j=0;j<4;j++)block(g,[.018,.035,.46],'#736b59',[-1.10+i*.72+j*.13,.84,-.72]);
 }
 for(let i=0;i<4;i++){
   const z=-.68+i*.38;
   beam(g,[1.18,1.26,z],[1.20,2.28,z+.06],.026,'#a89a80');
   part(g,new T.ConeGeometry(.062,.20,6),'#7e896e',[1.20,2.31,z]);
 }
 const lantern=part(g,new T.SphereGeometry(.12,9,7),'#e5bf71',[.25,2.29,-.91],true);
 lantern.scale.set(1,.72,1);
 const rope=new T.Group();rope.position.set(-1.29,2.16,.82);g.add(rope);
 for(let i=0;i<5;i++){
   const link=part(rope,new T.TorusGeometry(.12+i*.012,.018,5,11),'#a69a7a',[0,-i*.15,0]);
   link.rotation.y=i*.38;
 }
 g.userData.tick=t=>{
   lantern.scale.y=.72+.045*Math.sin(t*.83);
   rope.rotation.z=.017*Math.sin(t*.58-seed*.21);
 };
 g.userData.footprint=1.8;
 g.userData.interact={radius:2.3,effect:'save_boat_progress',label_ru:'Сохранить лодку у причала'};
 return g;
}


export function roadsideDryShrubs(seed=1){
 const r=rng(seed),g=new T.Group(),tips=[];g.name='Сухие колючие кусты';
 const cols=['#8b745d','#9d815b','#ae926d','#827762','#b09871','#8a7f65'];
 for(let bush=0;bush<6;bush++){
   const root=new T.Group(),x=(bush-2.5)*.60+(r()-.5)*.16,z=(r()-.5)*.47;
   root.position.set(x,0,z);root.rotation.y=r()*6.28;g.add(root);
   const h=.38+r()*.44,lean=(r()-.5)*.13;
   beam(root,[0,.02,0],[lean,h*.67,0],.031,'#736b59',6);
   for(let k=0;k<7;k++){
     const a=k*2.399+r()*.3,branchH=h*(.26+r()*.47),len=.30+r()*.30;
     const b=new T.Group();b.position.set(lean*.7,branchH,0);root.add(b);tips.push(b);
     const end=[Math.cos(a)*len,h*.23+len*.18,Math.sin(a)*len];
     beam(b,[0,0,0],end,.017+r()*.014,cols[(k+bush)%cols.length],5);
     for(let j=0;j<3;j++){
       const u=.34+j*.24,p=[end[0]*u,end[1]*u,end[2]*u];
       const q=[p[0]+Math.cos(a+.8+j)*(.11+r()*.12),p[1]+.10+r()*.11,p[2]+Math.sin(a+.8+j)*(.11+r()*.12)];
       beam(b,p,q,.008,'#897e66',4);
       const leaf=part(b,new T.TetrahedronGeometry(.065+r()*.023,0),j%3?'#b59e79':'#c0a57c',q);
       leaf.scale.set(.60,1.2,.45);leaf.rotation.z=r()*1.2;
     }
   }
   for(let j=0;j<3;j++){
     const spike=part(root,new T.ConeGeometry(.036,.20,4),cols[(bush+j)%6],[(r()-.5)*.30,.10+r()*.10,(r()-.5)*.3]);
     spike.rotation.z=(r()-.5)*.9;
   }
 }
 g.userData.tick=t=>{
   tips.forEach((o,i)=>{o.rotation.z=.050*Math.sin(t*.85-i*.33);o.rotation.x=.028*Math.sin(t*.52-i*.21);});
 };
 g.userData.footprint=.15;return g;
}
function recessedWindow(root,x,y,z,light,seed){
 part(root,new T.BoxGeometry(.77,1.08,.095),'#596762',[x,y,z]);
 const glow=part(root,new T.BoxGeometry(.64,.92,.025),light?'#e6ce9f':'#76918d',[x,y,z+.067],light);
 for(const dx of [-.375,.375])block(root,[.055,1.03,.075],'#d5c9ad',[x+dx,y,z+.085]);
 for(const dy of [-.5,0,.50])block(root,[.76,.044,.068],'#b9a98d',[x,y+dy,z+.10]);
 const pane=block(root,[.08,.75,.021],'#e0dbb8',[x-.15,y,z+.085]);pane.rotation.z=-.10;
 return glow;
}
export function pinkTownBuilding(seed=1) {
 const r=rng(seed),g=new T.Group();g.name='Розовое здание с витриной';
 // The shop has individual piers, frieze, metalwork and original-like watercolor depth.
 const wall=part(g,new T.BoxGeometry(4.8,2.8,3.45),'#bd8d84',[0,1.42,0]);
 part(g,new T.BoxGeometry(5.0,.22,3.63),'#a67f77',[0,2.87,0]);
 for(const y of [.29,.74,1.18,1.63,2.06,2.49]){
   for(let j=0;j<10;j++){
     const x=-2.24+j*.48+(r()-.5)*.06;
     const patch=block(g,[.29+r()*.12,.020,.018],j%4===0?'#d5a69a':'#aa8279',[x,y,1.742]);
     patch.rotation.z=(r()-.5)*.04;
   }
 }
 // Deep storefront frames and brass-colored window highlights.
 const glows=[];
 for(const x of [-1.35,.05,1.43]){
   part(g,new T.BoxGeometry(1.11,1.54,.13),'#6c7c76',[x,1.33,1.79]);
   const glass=part(g,new T.BoxGeometry(.98,1.41,.045),'#789995',[x,1.32,1.89]);
   glass.material=glass.material.clone();
   glass.material.roughness=.21;
   block(g,[.06,1.51,.12],'#ead7b4',[x,1.35,1.95]);
   block(g,[1.07,.055,.08],'#d5c9ad',[x,1.04,1.96]);
   const shine=part(g,new T.BoxGeometry(.23,1.08,.015),'#e2be92',[x-.32,1.36,1.98],true);
   shine.rotation.z=.23;glows.push(shine);
 }
 // Featureless signboards are deliberate: never print HUD text in the world.
 block(g,[4.08,.37,.10],'#8b716b',[0,2.31,1.88]);
 for(let j=0;j<10;j++){
   const x=-2.20+j*.49,mat=j%3===0?'#b97b72':'#dbc4a7';
   const s=block(g,[.47,.10,1.10],mat,[x,2.12,2.22]);s.rotation.x=.13;
   block(g,[.46,.17,.05],mat,[x,2.01,2.74]);
 }
 // Flat roof with crooked parapet, ventilator stacks and rain gutters.
 for(const z of [-1.71,1.71])for(let j=0;j<14;j++){
   const x=-2.36+j*.36;
   block(g,[.34,.29,.13],j%4===0?'#bd998c':'#956f6e',[x,3.04+(r()-.5)*.035,z]);
 }
 for(const x of [-2.35,2.35])for(let j=0;j<10;j++){
   const z=-1.62+j*.36;block(g,[.13,.30,.33],'#a17d76',[x,3.04+(r()-.5)*.035,z]);
 }
 for(let j=0;j<3;j++){
   const x=-1.4+j*1.4;
   part(g,new T.CylinderGeometry(.095,.14,.58,7),'#637872',[x,3.30,-.82]);
   part(g,new T.ConeGeometry(.23,.20,7),'#87948c',[x,3.63,-.82]);
 }
 g.userData.tick=t=>glows.forEach((m,i)=>{m.scale.x=.91+.09*Math.sin(t*.34-i*.8);});
 g.userData.footprint=2.65;return g;
}
export function duskTownLight(seed=1) {
 const r=rng(seed),g=new T.Group(),wisps=[];g.name='Розовые акварельные сумерки';
 const uniforms={uTime:{value:0},uIntensity:{value:1}};
 const shader=new T.ShaderMaterial({
   uniforms,
   vertexShader:glowVertex,
   fragmentShader:'varying vec2 vUv;uniform float uTime;uniform float uIntensity;void main(){float cloud=sin(vUv.x*7.+uTime*.07)*.09+sin(vUv.x*17.-uTime*.04)*.03;float edge=smoothstep(.03,.23,vUv.x)*(1.-smoothstep(.77,.98,vUv.x));float h=smoothstep(.05,.38,vUv.y-cloud)*(1.-smoothstep(.63,.97,vUv.y+cloud));float a=.16*edge*h*uIntensity;gl_FragColor=vec4(.86,.56,.54,a);}',
   transparent:true,depthWrite:false,side:T.DoubleSide});
 for(let i=0;i<8;i++){
   const plane=new T.Mesh(new T.PlaneGeometry(3+r()*1.0,.62+r()*.52,9,2),shader);
   plane.position.set((r()-.5)*2.1,.6+i*.19,-1.7-i*.18);
   plane.rotation.y=(r()-.5)*.45;plane.userData.watercolorSkipWash=true;g.add(plane);wisps.push(plane);
 }
 // Long ground shadows from the actual setting sun, not flat HUD overlays.
 for(let i=0;i<9;i++){
   const x=(r()-.5)*4,z=(r()-.5)*3.3;
   const sh=part(g,new T.BoxGeometry(.06+r()*.12,.018,.8+r()*1.8),'#8a726c',[x,.025,z]);
   sh.material=sh.material.clone();sh.material.transparent=true;sh.material.opacity=.20;
   sh.rotation.y=-.6+(r()-.5)*.09;
 }
 const motes=new T.Group();g.add(motes);
 for(let i=0;i<18;i++){
   const s=part(motes,new T.TetrahedronGeometry(.02+r()*.012,0),'#e7c29e',[(r()-.5)*3,.3+r()*1.3,(r()-.5)*2],true);
   s.userData.watercolorSkipWash=true;
 }
 g.userData.tick=t=>{
   uniforms.uTime.value=t;
   wisps.forEach((w,i)=>{w.position.x=.16*Math.sin(t*.12+i*.71);w.rotation.z=.016*Math.sin(t*.24-i*.35);});
   motes.rotation.y=.02*Math.sin(t*.10+seed);
 };
 g.userData.footprint=0;return g;
}
export function healerWalkWithLight(seed=1) {
 const r=rng(seed),g=new T.Group();g.name='Походка аптекаря в мокром плаще';
 // This animation overlay attaches to the ORIGINAL traveller, not a duplicate NPC.
 const hips=new T.Group();hips.position.set(0,.48,0);g.add(hips);
 const legs=[],coat=[];
 for(const s of [-1,1]){
   const leg=new T.Group();leg.position.set(s*.155,-.21,0);hips.add(leg);legs.push(leg);
   beam(leg,[0,0,0],[s*.025,-.24,.045],.092,'#414f50');
   block(leg,[.19,.12,.31],'#424a47',[s*.02,-.265,.13]);
   for(let j=0;j<3;j++)block(leg,[.20,.024,.12],'#64756e',[s*.01,-.29,.08+j*.08]);
   const flap=new T.Group();flap.position.set(s*.22,.10,-.15);hips.add(flap);coat.push(flap);
   const cloth=part(flap,new T.ConeGeometry(.22,.68,5,1,false),'#8c785e',[0,.22,0]);
   cloth.scale.z=.78;cloth.rotation.z=s*.14;
   for(let k=0;k<3;k++)beam(flap,[0,.15-k*.13,-.19],[s*.06,.14-k*.13,-.18],.009,'#c2a783',4);
 }
 for(let i=0;i<8;i++){
   const x=(r()-.5)*.27,y=.30+r()*.38,z=-.28-r()*.11;
   part(hips,new T.BoxGeometry(.024,.13,.01),i%2?'#a38c72':'#746d60',[x,y,z]);
 }
 const shoulder=new T.Group();shoulder.position.set(.25,1.07,.03);g.add(shoulder);
 beam(shoulder,[0,0,0],[.10,-.34,.21],.085,'#bd9b6f');
 beam(shoulder,[.10,-.34,.21],[.17,-.48,.44],.060,'#bd9b6f');
 part(shoulder,new T.SphereGeometry(.069,7,5),'#d3b793',[.17,-.48,.44]);
 g.userData.tick=t=>{
   const p=t*3.0;
   legs.forEach((o,i)=>{o.rotation.x=.43*Math.sin(p+i*Math.PI);o.position.y=-.21+.045*Math.max(0,Math.sin(p+i*Math.PI));});
   coat.forEach((o,i)=>{o.rotation.x=.09*Math.sin(p-.45+i*Math.PI)+.035*Math.sin(t*.57+i);o.rotation.z=.023*Math.sin(t*.63-i*.22);});
   hips.rotation.z=.025*Math.sin(p-.23);
   shoulder.rotation.x=.10*Math.sin(p-.38);shoulder.rotation.y=.06*Math.sin(t*.45);
 };
 g.userData.footprint=0;return g;
}
function irregularPuddle(root,r,x,z,scale){
 const s=new T.Shape(),steps=21;
 for(let j=0;j<=steps;j++){
   const a=j/steps*Math.PI*2,rr=1+.14*Math.sin(j*2.3+x*3)+.11*Math.sin(j*5.7+z*7);
   const px=Math.cos(a)*rr*.73*scale,pz=Math.sin(a)*rr*.53*scale;
   j?s.lineTo(px,pz):s.moveTo(px,pz);
 }
 s.closePath();const geo=new T.ShapeGeometry(s,4);geo.rotateX(-Math.PI/2);
 const water=part(root,geo,'#587879',[x,.026,z]);
 water.material=water.material.clone();water.material.transparent=true;water.material.opacity=.73;water.material.roughness=.16;
 return water;
}
export function puddles(seed=1) {
 const r=rng(seed),g=new T.Group(),ripples=[];g.name='Живые отражающие лужи';
 const shader=new T.ShaderMaterial({uniforms:{uTime:{value:0}},
 vertexShader:glowVertex,
 fragmentShader:'varying vec2 vUv;uniform float uTime;void main(){vec2 p=(vUv-.5)*vec2(1.8,2.1);float wave=fract(uTime*.37+vUv.x*.04);float ring=1.-smoothstep(0.,.028,abs(length(p)-wave*.65));float spec=pow(max(0.,sin(vUv.x*22.+uTime*.45)*cos(vUv.y*8.-uTime*.24)),8.);float edge=smoothstep(.3,.05,abs(vUv.x-.5))*(1.-smoothstep(.33,.5,abs(vUv.y-.5)));gl_FragColor=vec4(.78,.90,.88,(ring*.24*(1.-wave)+spec*.08)*edge);}',
 transparent:true,depthWrite:false,side:T.DoubleSide});
 for(let i=0;i<6;i++){
   const x=(r()-.5)*4.0,z=(r()-.5)*3.8,sc=.50+r()*.7;
   irregularPuddle(g,r,x,z,sc);
   const refl=new T.Mesh(new T.PlaneGeometry(sc*1.1,sc*.81),shader);
   refl.rotation.x=-Math.PI/2;refl.rotation.z=r()*6.28;
   refl.position.set(x,.033,z);refl.userData.watercolorSkipWash=true;g.add(refl);ripples.push(refl);
   for(let k=0;k<4;k++){
     const xx=x+(r()-.5)*sc,zz=z+(r()-.5)*sc*.55;
     const flake=part(g,new T.TetrahedronGeometry(.028,0),'#bac4b3',[xx,.025,zz]);
     flake.scale.y=.20;
   }
 }
 g.userData.tick=t=>{
   shader.uniforms.uTime.value=t;
   ripples.forEach((p,i)=>p.rotation.z=.02*Math.sin(t*.30-i*.41));
 };
 g.userData.footprint=0;return g;
}
export function whiteClinicBuilding(seed=1){
 const r=rng(seed),g=new T.Group();g.name='Ночная клиника с красным навесом';
 const lit=[];
 // Real building volume, roof rim, window niches and rain-stained pale plaster.
 block(g,[5.60,2.44,2.72],'#d5d3bb',[0,1.23,0]);
 block(g,[5.84,.24,3.0],'#a9aba0',[0,2.52,0]);
 block(g,[5.65,.09,2.82],'#d5cdb8',[0,2.68,0]);
 for(let j=0;j<19;j++){
   const x=-2.72+j*.30;
   block(g,[.24,.25,.17],j%5===0?'#9aaca4':'#b2b8ab',[x,2.82,1.38]);
 }
 for(let i=0;i<7;i++){
   const x=-2.43+i*.8;
   const on=i===4;const w=recessedWindow(g,x,1.57,1.37,on,seed);
   if(on)lit.push(w);
   block(g,[.83,.12,.20],'#acae9b',[x,.97,1.46]);
   for(let j=0;j<3;j++){
     const stain=block(g,[.05,.14+r()*.25,.014],j%2?'#aab0a3':'#c7c6af',
       [x+(r()-.5)*.63,2.1-r()*.23,1.50]);
     stain.rotation.z=(r()-.5)*.07;
   }
 }
 // Clinic doorway and deeply pitched scarlet canopy.
 block(g,[1.16,2.06,.13],'#63746e',[1.15,1.10,1.47]);
 block(g,[.91,1.87,.06],'#789995',[1.15,1.08,1.58]);
 block(g,[.05,.15,.09],'#e5bf71',[1.49,1.05,1.65]);
 const canopy=new T.Group();canopy.position.set(1.15,2.25,1.75);canopy.rotation.x=-.10;g.add(canopy);
 block(canopy,[2.00,.15,1.32],'#bd7c69',[0,0,0]);
 for(let j=0;j<8;j++)block(canopy,[.21,.11,.06],j%3?'#a35d58':'#c98974',[-.85+j*.245,-.10,.69]);
 for(const x of [-.91,.91])beam(canopy,[x,-.12,.55],[x,-.94,-.51],.030,'#596762');
 // Ivy creeps up the walls instead of uniform repeated textures.
 for(const x of [-2.78,2.78]){
   const vine=new T.Group();vine.position.set(x,.12,1.50);g.add(vine);
   beam(vine,[0,0,0],[0,2.20,0],.017,'#6e846e');
   for(let k=0;k<12;k++){
     const a=k*2.4,yy=.17+k*.16;
     const o=part(vine,new T.TetrahedronGeometry(.095+r()*.052,0),k%3?'#6c8f78':'#9ca887',
       [Math.sin(a)*(.09+r()*.08),yy,.015]);
     o.rotation.z=a*.18;o.scale.y=1.3;
   }
 }
 // Interior solitary window glows in rain without any screen-space writing.
 g.userData.tick=t=>lit.forEach((w,i)=>{
   w.scale.x=.96+.04*Math.sin(t*.82+i);
   w.material.color.setRGB(.82+.07*Math.sin(t*.60),.71,.52);
 });
 g.userData.footprint=2.8;
 g.userData.interact={radius:2.6,effect:'reach_clinic',label_ru:'Войти в ночную клинику'};
 return g;
}

export const makers={carHeadlights,handFlashlight,rowingHealer,rainSplashRings,townRoad,boatShed,roadsideDryShrubs,pinkTownBuilding,duskTownLight,healerWalkWithLight,puddles,whiteClinicBuilding};

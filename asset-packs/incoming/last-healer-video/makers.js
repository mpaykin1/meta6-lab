import * as T from 'three';
// THE LAST HEALER / first living INK additions. The accepted car, boat,
// traveller and watercolor renderer remain separate and unchanged.
const P={
  ink:'#303c38',iron:'#4d5255',copper:'#a96851',brass:'#c5ac69',
  parchment:'#e7e5d6',linen:'#d5d3bb',slate:'#607e74',
  coat:'#587879',rose:'#bd7c69',wood:'#736b59',sea:'#78a5a4'
};
const PI=Math.PI;
function pigment(color,emissive){return new T.MeshStandardMaterial({
  color,roughness:.92,metalness:0,
  ...(emissive?{emissive,emissiveIntensity:.2}:{})
});}
function mesh(g,geo,mat,x=0,y=0,z=0){
  const o=new T.Mesh(geo,mat);o.position.set(x,y,z);
  o.userData.watercolorOutline=true;g.add(o);return o;
}
function ball(g,r,m,x,y,z,sx=1,sy=1,sz=1){
  const o=mesh(g,new T.IcosahedronGeometry(r,1),m,x,y,z);
  o.scale.set(sx,sy,sz);return o;
}
function rod(g,a,b,r,mat,r2=r){
  const from=new T.Vector3(...a),to=new T.Vector3(...b),dir=to.clone().sub(from);
  const o=mesh(g,new T.CylinderGeometry(r2,r,dir.length(),8),mat);
  o.position.copy(from).add(to).multiplyScalar(.5);
  o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir.normalize());return o;
}
function box(g,w,h,d,m,x,y,z){return mesh(g,new T.BoxGeometry(w,h,d),m,x,y,z);}
function random(seed){
  let s=(Math.trunc(seed)||17)>>>0;
  return()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
}
const rayVertex='varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
const rayFragment='varying vec2 vUv;uniform float uTime;uniform float uGain;void main(){float side=pow(max(0.,1.-abs(vUv.x-.5)*2.),1.8);float far=pow(max(0.,1.-vUv.y),.35);float rip=.96+.04*sin(uTime*1.5+vUv.y*13.);float a=.23*side*far*rip*uGain;gl_FragColor=vec4(.99,.87,.57,a);}';
function roadWash(g,x,z,w=1.45,h=3.75){
  const m=new T.ShaderMaterial({transparent:true,depthWrite:false,
    blending:T.AdditiveBlending,side:T.DoubleSide,
    uniforms:{uTime:{value:0},uGain:{value:1}},
    vertexShader:rayVertex,fragmentShader:rayFragment});
  const p=mesh(g,new T.PlaneGeometry(w,h),m,x,.022,z);
  p.rotation.x=-PI/2;p.userData.watercolorOutline=false;
  return {p,m};
}
function lampBeam(parent,x,y,z,len=2.6,r=.8){
  const m=new T.ShaderMaterial({
    transparent:true,depthWrite:false,side:T.DoubleSide,
    blending:T.AdditiveBlending,
    uniforms:{uTime:{value:0},uGain:{value:1}},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'varying vec2 vUv;uniform float uTime;uniform float uGain;void main(){float a=.10*uGain*pow(vUv.y,1.15)*(1.-.12*sin(vUv.x*17.+uTime*.37));gl_FragColor=vec4(.98,.89,.67,a);}'
  });
  const cone=mesh(parent,new T.ConeGeometry(r,len,24,1,true),m,x,y,z+len*.48);
  // Cone apex rests at the lamp; the broad wash extends away from it.
  cone.rotation.x=-PI/2;
  cone.userData.watercolorOutline=false;
  return {cone,m};
}
function carHeadlights(seed=1){
  const rng=random(seed),g=new T.Group();
  g.name='Фары: свет движется вместе с готовой машиной INK';
  const metal=pigment(P.iron),bezel=pigment(P.brass),glass=new T.MeshBasicMaterial({color:0xffdf9d});
  const red=new T.MeshBasicMaterial({color:0xb5574e});
  const lightLayers=[],spots=[];
  // Attach the group to the original car(); the car's geometry is not copied.
  for(const side of [-1,1]){
    const x=side*.59,front=1.57;
    const casing=mesh(g,new T.CylinderGeometry(.167,.188,.13,14),metal,x,.70,front);
    casing.rotation.x=PI/2;
    const lens=mesh(g,new T.CylinderGeometry(.137,.137,.02,18),glass,x,.70,front+.08);
    lens.rotation.x=PI/2;
    const ring=mesh(g,new T.TorusGeometry(.175,.018,5,20),bezel,x,.70,front+.1);
    const ray=lampBeam(g,x,.48,1.76,3.1,1.10);
    ray.cone.scale.x=1.0+rng()*.12;
    const wash=roadWash(g,x*1.36,3.46,1.7,3.65);
    lightLayers.push(ray.m,wash.m);
    const spot=new T.SpotLight(0xffe6b9,.8,7,PI/6,.72,2);
    spot.position.set(x,.74,front);spot.target.position.set(x*.8,.04,5.1);
    g.add(spot,spot.target);spots.push(spot);
    // Faded enamel sockets and rear red reflectors.
    mesh(g,new T.CylinderGeometry(.12,.12,.045,12),red,x,.75,-1.48).rotation.x=PI/2;
    const tail=box(g,.26,.035,.20,red,x,.02,-1.76);
    tail.rotation.y=side*.07;
    for(let i=0;i<3;i++){
      const screw=ball(g,.017,metal,x+(.06-i*.06),.70,front+.098);
      screw.scale.z=.4;
    }
  }
  g.userData.footprint=0;g.userData.attachTo='car';
  g.userData.tick=(t)=>{
    for(let k=0;k<lightLayers.length;k++){
      lightLayers[k].uniforms.uTime.value=t;
      lightLayers[k].uniforms.uGain.value=.89+.07*Math.sin(t*1.2+k*.41);
    }
    spots.forEach((o,i)=>{o.intensity=.8+.06*Math.sin(t*1.1-i*.28);});
    g.rotation.y=.012*Math.sin(t*.62);
  };
  return g;
}
function handFlashlight(seed=2){
  const rng=random(seed),g=new T.Group(),pivot=new T.Group();
  g.name='Ручной фонарь: светит вперёд, инерция поворота';
  g.add(pivot);
  const iron=pigment(P.iron),copper=pigment(P.copper),parch=pigment(P.parchment);
  const light=new T.MeshBasicMaterial({color:0xffe5b5});
  const handle=mesh(pivot,new T.CylinderGeometry(.083,.095,.38,12),iron,0,.96,.0);
  handle.rotation.x=PI/2;
  mesh(pivot,new T.CylinderGeometry(.12,.085,.23,12),copper,0,.96,.23).rotation.x=PI/2;
  mesh(pivot,new T.CylinderGeometry(.17,.17,.055,16),iron,0,.96,.35).rotation.x=PI/2;
  mesh(pivot,new T.CylinderGeometry(.145,.145,.02,16),light,0,.96,.39).rotation.x=PI/2;
  mesh(pivot,new T.TorusGeometry(.166,.014,6,18),parch,0,.96,.39);
  for(let i=0;i<7;i++){
    mesh(pivot,new T.TorusGeometry(.086,.009,4,12),i%2?copper:iron,0,.96,-.16+i*.047)
      .rotation.x=PI/2;
  }
  const sw=box(pivot,.10,.05,.11,copper,.03,1.09,-.05);
  for(let j=0;j<3;j++)box(pivot,.05,.012,.038,iron,-.048+j*.047,1.12,-.05);
  const {cone,m}=lampBeam(pivot,0,.94,.41,3.4,1.17);
  const groundWash=roadWash(pivot,0,2.1,1.15,2.1);
  const spot=new T.SpotLight(0xffdcaa,1.1,7,PI/7,.78,2);
  spot.position.set(0,.96,.41);spot.target.position.set(0,.3,3.4);pivot.add(spot,spot.target);
  // Suspended rain/dust grains catch the flashlight in three-dimensional space.
  const motes=[];const pollen=new T.MeshBasicMaterial({color:P.linen,transparent:true,opacity:.53});
  for(let i=0;i<24;i++){
    const z=.65+rng()*2.75,rad=.025+rng()*.025;
    const x=(rng()-.5)*.37*z,y=.93+(rng()-.5)*.26*z;
    const p=ball(pivot,rad,pollen,x,y,z,.64,1.8,.56);
    p.userData.watercolorOutline=false;
    motes.push({p,x,y,z,phase:rng()*6.28});
  }
  g.userData.footprint=0;
  g.userData.interact={radius:2.3,effect:'reveal_herbs',label_ru:'Включить фонарь — увидеть травы и тропу'};
  g.userData.setEnabled=enabled=>{cone.visible=!!enabled;spot.intensity=enabled?1.1:0;m.uniforms.uGain.value=enabled?1:0;groundWash.m.uniforms.uGain.value=enabled?1:0;};
  g.userData.tick=t=>{
    pivot.rotation.y=.085*Math.sin(t*.52+.17);
    pivot.rotation.x=.025*Math.sin(t*.73-.27);
    m.uniforms.uTime.value=t;
    groundWash.m.uniforms.uTime.value=t;
    motes.forEach(({p,x,y,z,phase},i)=>{
      p.position.set(x+.035*Math.sin(t*.9+phase),y+.12*Math.sin(t*.63-i*.21),z);
      p.scale.y=.8+.7*(.5+.5*Math.sin(t*1.1+i));
    });
  };
  return g;
}
function rowingHealer(seed=3){
  const rng=random(seed),g=new T.Group();
  g.name='Гребец и весла; накладываются на готовый INK rowboat';
  const coat=pigment(P.coat),cloth=pigment(P.linen),wood=pigment(P.wood);
  const skin=pigment('#c5ac69'),seam=pigment(P.ink),oarShade=pigment(P.copper);
  // Separate moving joints rather than replacing the accepted boat object.
  const waist=new T.Group();waist.position.set(0,.53,0);g.add(waist);
  ball(waist,.32,coat,0,.10,0,.86,1.1,.71);
  const spine=mesh(waist,new T.CylinderGeometry(.19,.30,.56,9),coat,0,.33,0);
  spine.rotation.z=.08;
  const hood=ball(waist,.23,coat,0,.79,-.04,.98,.87,.92);
  ball(waist,.18,skin,0,.73,.12,.9,.93,.62);
  box(waist,.51,.08,.12,cloth,0,.63,.23);
  const knees=[];
  for(const s of [-1,1]){
    const leg=new T.Group();leg.position.set(s*.16,-.15,.05);waist.add(leg);knees.push(leg);
    rod(leg,[0,0,0],[s*.11,-.27,.34],.092,coat);
    ball(leg,.11,seam,s*.11,-.27,.34,.95,.7,1.2);
    rod(leg,[s*.11,-.27,.34],[s*.12,-.36,.59],.07,wood);
    const arm=new T.Group();arm.position.set(s*.26,.49,.12);waist.add(arm);
    rod(arm,[0,0,0],[s*.2,-.20,.23],.115,coat);
    rod(arm,[s*.2,-.20,.23],[s*.25,-.23,.55],.086,coat);
    ball(arm,.072,skin,s*.25,-.23,.55);
    for(let i=0;i<3;i++)ball(arm,.024,skin,s*.21+i*s*.015,-.24,.60+i*.015);
  }
  const oars=[];
  for(const side of [-1,1]){
    const o=new T.Group();o.position.set(side*.53,.67,.05);g.add(o);oars.push(o);
    ball(o,.115,wood,0,0,0,.95,.6,1.0);
    rod(o,[0,0,0],[side*1.98,-.20,.38],.053,wood,.037);
    const blade=mesh(o,new T.SphereGeometry(.32,10,6),oarShade,side*2.18,-.25,.44);
    blade.scale.set(.49,.10,1.26);blade.rotation.y=side*.25;
    for(let k=0;k<4;k++){
      rod(o,[side*(1.99+k*.09),-.21,.22],[side*(2.04+k*.09),-.20,.66],.008,seam);
    }
    // Brass oarlock and lashings visibly connect blade to the pivot.
    mesh(o,new T.TorusGeometry(.12,.019,6,12),seam,0,.02,0).rotation.y=PI/2;
    for(let i=0;i<3;i++)mesh(o,new T.TorusGeometry(.053,.008,5,10),cloth,side*(.31+i*.21),-.03,.05).rotation.z=PI/2;
  }
  for(let i=0;i<11;i++){
    const x=(i-5)*.035;
    rod(waist,[x,.08,-.21],[x+.01,.53,-.23],.007,rng()>.5?cloth:seam);
  }
  const drop=mesh(g,new T.SphereGeometry(.12,7,5),new T.MeshBasicMaterial({
    color:0x78a5a4,transparent:true,opacity:.45
  }),0,.08,-1.5);
  drop.scale.set(1,.18,2);
  g.userData.footprint=.7;g.userData.attachTo='rowboat';
  g.userData.tick=t=>{
    const cycle=t*1.55,drive=Math.sin(cycle),lift=Math.cos(cycle);
    waist.rotation.x=-.14*drive;waist.rotation.z=.025*Math.sin(cycle*.5);
    knees.forEach((p,i)=>{p.rotation.x=.04*Math.sin(cycle-i*.28);});
    oars.forEach((o,i)=>{
      o.rotation.z=(i===0?-1:1)*(.06+.16*drive);
      o.rotation.y=(i===0?-1:1)*(.17+.19*Math.cos(cycle-i*.16));
      o.rotation.x=.12*lift;
    });
    hood.rotation.z=.035*Math.sin(cycle-.4);
    drop.scale.z=2+.7*(1+Math.sin(cycle));
    drop.material.opacity=.26+.1*Math.cos(cycle);
  };
  return g;
}
function rainSplashRings(seed=4){
  const rng=random(seed),g=new T.Group(),drops=[],rings=[];
  g.name='Реальные падающие капли и расширяющиеся кольца';
  const water=pigment(P.sea);
  const rain=new T.MeshBasicMaterial({color:'#d5d3bb',transparent:true,opacity:.68,depthWrite:false});
  const splashMat=new T.MeshBasicMaterial({color:'#e7e5d6',transparent:true,opacity:.5,depthWrite:false});
  // Individual rain strokes are real short diagonal meshes, never screen artifacts.
  for(let i=0;i<48;i++){
    const x=(rng()-.5)*5.3,z=(rng()-.5)*5.3;
    const meshDrop=rod(g,[x,0,z],[x-.095,.28,z+.055],.009,rain,.005);
    meshDrop.userData.watercolorOutline=false;
    drops.push({o:meshDrop,x,z,phase:rng()*3.25});
  }
  for(let i=0;i<13;i++){
    const x=(rng()-.5)*4.4,z=(rng()-.5)*4.4;
    const m=splashMat.clone();
    const ripple=mesh(g,new T.TorusGeometry(.17,.014,5,30),m,x,.03,z);
    ripple.rotation.x=PI/2;ripple.userData.watercolorOutline=false;
    const center=ball(g,.033,water,x,.04,z,.55,.35,.55);
    rings.push({o:ripple,center,x,z,phase:rng()*4.3,i});
  }
  // Scattered falling splash triangles give an individual droplet a physical wake.
  const impacts=[];
  for(let i=0;i<14;i++){
    const x=(rng()-.5)*4.1,z=(rng()-.5)*4.1;
    const o=mesh(g,new T.ConeGeometry(.024,.16,5),splashMat,x,.11,z);
    o.rotation.z=(rng()-.5)*.9;impacts.push({o,x,z,phase:rng()*3.4});
  }
  g.userData.footprint=0;
  g.userData.tick=t=>{
    drops.forEach(({o,x,z,phase},i)=>{
      const v=(t*.98+phase)%3.25;
      o.position.set(x-.08*v,3.16-v,z+.09*v);
      o.rotation.z=.24+.12*Math.sin(t*.39+i*.17);
    });
    rings.forEach(({o,center,x,z,phase,i})=>{
      const a=(t*.8+phase)%2.1/2.1;
      const size=.30+a*2.55;
      o.scale.set(size,size,1);
      o.material.opacity=(1-a)*.43;
      center.scale.set(.46+a*.1,.33,.46+a*.1);
      center.position.y=.03+.004*Math.sin(t*3.+i);
    });
    impacts.forEach(({o,phase})=>{
      const cycle=(t*1.17+phase)%1.3/1.3;
      o.scale.y=.25+(1-cycle)*1.1;o.position.y=.025+.17*(1-cycle);
      o.rotation.z=.15*Math.sin(t*1.2+phase);
    });
  };
  return g;
}

// VIDEO CONTINUATION · never alters the four already accepted makers.
// World geometry is irregular and rooted; all motion is per-part and deterministic.
function townRoad(seed=5){
 const r=random(seed),g=new T.Group(),stone=pigment('#77746c'),curb=pigment('#c4b6a1'),
    chalk=pigment('#b4a88f'),asphalt=pigment('#62676a'),crack=pigment('#303c38');
 g.name='Тихая улица городка · потрескавшийся перекрёсток';
 box(g,6,.10,8,asphalt,0,-.05,0);
 box(g,8,.09,4.7,asphalt,0,-.047,.16);
 for(let s of [-1,1]){
  // Curbs are raised; alternating stones visibly follow both road arms.
  for(let k=0;k<15;k++){
   const z=-3.8+k*.55;
   box(g,.22,.20,.49,k%3===0?chalk:curb,s*3.08,.02,z);
  }
  for(let k=0;k<15;k++){
   const x=-3.8+k*.55;
   box(g,.49,.19,.22,k%4===0?chalk:curb,x,.02,.16+s*2.43);
  }
 }
 for(let k=-3;k<=3;k++){
  if(Math.abs(k)<2)continue;
  box(g,.08,.012,.49,chalk,.0,.009,k*1.10).rotation.y=.04*(r()-.5);
 }
 for(let k=0;k<32;k++){
  const x=(r()-.5)*6.9,z=(r()-.5)*7.5;
  const a=[x,.014,z],b=[x+(r()-.5)*.44,.015,z+(r()-.5)*.55];
  rod(g,a,b,.009,k%3?crack:stone,.004);
  if(k%5===0){
   const p=ball(g,.07,curb,x,.028,z,1,.32,.83);
   p.rotation.y=r()*6.28;
  }
 }
 g.scale.setScalar(.82);
 g.userData.footprint=0;
 return g;
}
function roadsideDryShrubs(seed=6){
 const r=random(seed),g=new T.Group(),stem=pigment('#736b59'),tip=pigment('#bd7c69'),
       dry=pigment('#c5ac69'),clumps=[];
 g.name='Колючие кусты · семь разных силуэтов';
 for(let i=0;i<6;i++){
  const b=new T.Group();b.position.set((i-2.5)*.52+(r()-.5)*.17,0,(r()-.5)*.8);
  g.add(b);clumps.push(b);
  let H=.40+r()*.65;
  rod(b,[0,0,0],[(r()-.5)*.10,H,0],.036,stem,.017);
  for(let k=0;k<5;k++){
   const a=(k/5)*PI*2+r()*.4,R=.28+r()*.35;
   const x=Math.cos(a)*R,z=Math.sin(a)*R,y=H*(.55+r()*.45);
   rod(b,[0,.08,0],[x*.6,y*.6,z*.55],.019,stem,.008);
   rod(b,[x*.6,y*.6,z*.55],[x,y,z],.009,stem,.002);
   const leaf=ball(b,.08,k%3?dry:tip,x,y,z,.45,1.15,.37);
   leaf.rotation.y=a;
   for(let v=0;v<1;v++)
    rod(b,[x*.7,y*.8,z*.7],[x*(.83+v*.12),y*(.91+v*.12),z*(.94+v*.10)],.007,stem,.002);
  }
 }
 g.userData.footprint=.35;
 g.userData.tick=t=>clumps.forEach((b,i)=>{
  b.rotation.x=.032*Math.sin(t*.73-i*.39);
  b.rotation.z=.055*Math.sin(t*.58-i*.25);
 });
 return g;
}
function pinkTownBuilding(seed=7){
 const r=random(seed),g=new T.Group(),wall=pigment('#bd9290'),
    roof=pigment('#736b59'),frame=pigment('#d5c6ac'),glass=pigment('#587879'),
    lamps=new T.MeshBasicMaterial({color:'#e7b97d'}),lintel=pigment('#8d6a63');
 g.name='Угловой дом · живая витрина в розовых сумерках';
 box(g,4.9,2.7,3.3,wall,0,1.35,0);
 box(g,5.2,.22,3.6,roof,0,2.82,0);
 for(let k=0;k<5;k++)box(g,5.03,.06,.12,lintel,0,.48+k*.51,1.69);
 // Large recessed shop windows and visible timber braces.
 for(let i=0;i<4;i++){
  const x=-1.76+i*1.18;
  box(g,.95,1.35,.08,glass,x,1.23,1.70);
  box(g,.11,1.50,.12,frame,x-.47,1.20,1.76);
  box(g,.11,1.50,.12,frame,x+.47,1.20,1.76);
  box(g,1.04,.12,.13,frame,x,2.0,1.75);
  const inside=box(g,.70,.41,.04,i%2?lamps:frame,x,1.20,1.82);
  inside.userData.watercolorOutline=false;
  box(g,1.12,.08,.49,lintel,x,2.15,1.91);
  rod(g,[x-.49,2.13,2.12],[x-.48,2.52,1.78],.035,roof);
  rod(g,[x+.49,2.13,2.12],[x+.48,2.52,1.78],.035,roof);
 }
 for(let i=0;i<9;i++){
  const x=-2.45+i*.61;
  box(g,.16,.28,.14,roof,x,2.97,1.62);
 }
 for(let i=0;i<12;i++){
  const z=(r()-.5)*2.8;
  const tile=box(g,.09,.025,.23,i%2?lintel:wall,(r()-.5)*4.5,2.96,z);
  tile.rotation.y=r()*.6;
 }
 g.userData.footprint=2.2;
 g.userData.tick=t=>{g.children.filter(o=>o.material===lamps).forEach((o,i)=>{
  o.scale.y=.91+.08*Math.sin(t*.42+i*1.7);
 });};
 return g;
}
function puddles(seed=8){
 const r=random(seed),g=new T.Group(),water=new T.MeshStandardMaterial({
  color:'#6a9996',roughness:.19,metalness:.12,transparent:true,opacity:.67,depthWrite:false,
  side:T.DoubleSide
 }),foam=new T.MeshBasicMaterial({color:'#efece2',transparent:true,opacity:.66,depthWrite:false}),
 ripples=[];
 g.name='Разнокалиберные лужи · отражают фонари';
 for(let j=0;j<11;j++){
  const x=(r()-.5)*4.6,z=(r()-.5)*4.8,rad=.23+r()*.47;
  const path=new T.Shape();
  for(let k=0;k<=14;k++){
   const a=k*2*PI/14,rr=rad*(.75+.32*Math.sin(a*3.7+j));
   const X=Math.cos(a)*rr,Z=Math.sin(a)*rr*.72;
   if(!k)path.moveTo(X,Z);else path.lineTo(X,Z);
  }
  const sheet=mesh(g,new T.ShapeGeometry(path),water,x,.018,z);
  sheet.rotation.x=-PI/2;sheet.userData.watercolorOutline=false;
  const shimmer=rod(g,[x-rad*.48,.027,z-rad*.16],[x+rad*.42,.027,z+rad*.08],.011,foam,.006);
  shimmer.userData.watercolorOutline=false;
  const ringMat=foam.clone(),ring=mesh(g,new T.TorusGeometry(.11,.010,4,25),ringMat,x,.033,z);
  ring.rotation.x=PI/2;ring.userData.watercolorOutline=false;
  ripples.push({ring,phase:r()});
 }
 g.userData.footprint=0;
 g.userData.tick=t=>ripples.forEach(({ring,phase},i)=>{
   const q=(t*.55+phase)%1;
   ring.scale.setScalar(.2+q*2.9);
   ring.material.opacity=.50*(1-q);
   ring.position.y=.029+.003*Math.sin(t*1.3+i);
 });
 return g;
}
function whiteClinicBuilding(seed=9){
 const r=random(seed),g=new T.Group(),wall=pigment('#d5d3bb'),roof=pigment('#9c9b8e'),
  trim=pigment('#efece2'),glass=pigment('#607e74'),red=pigment('#bd7c69'),
  leaf=pigment('#839487'),warm=new T.MeshBasicMaterial({color:'#e7c48d'});
 g.name='Белая клиника · красный навес · единственное окно света';
 box(g,6.3,2.68,2.9,wall,0,1.34,0);
 box(g,6.65,.18,3.27,roof,0,2.78,0);
 for(let i=0;i<6;i++){
  const x=-2.6+i*1.03;
  box(g,.74,1.0,.08,i===4?warm:glass,x,1.45,1.50);
  box(g,.08,1.13,.10,trim,x-.40,1.42,1.55);
  box(g,.08,1.13,.10,trim,x+.40,1.42,1.55);
  box(g,.86,.10,.10,trim,x,2.01,1.55);
  box(g,.08,1.03,.10,trim,x,1.46,1.56);
  box(g,.86,.11,.15,roof,x,.90,1.60);
 }
 const canopy=box(g,2.2,.14,1.5,red,-1.4,2.33,2.08);canopy.rotation.z=-.04;
 for(let k=0;k<3;k++)rod(g,[-2.36+k*.94,2.3,2.6],[-2.32+k*.94,.03,2.59],.04,roof);
 box(g,1.28,1.65,.09,glass,-1.45,.83,1.58);
 for(let i=0;i<14;i++){
  let x=-3.1+r()*6.2,z=1.6+r()*.33;
  const b=ball(g,.14,leaf,x,.12,z,.7,.8,1.2);
  b.rotation.y=r()*PI;
 }
 g.userData.footprint=2.9;
 g.userData.tick=t=>g.children.filter(o=>o.material===warm).forEach(o=>{
  o.scale.x=.97+.03*Math.sin(t*.42);
 });
 return g;
}
function boatShed(seed=10){
 const r=random(seed),g=new T.Group(),posts=pigment('#736b59'),
  plank=pigment('#a89a80'),roof=pigment('#607e74'),stripe=pigment('#bd7c69');
 g.name='Лодочный сарай · двускатная крыша и полки';
 for(const s of [-1,1])for(const z of [-1,1]){
  rod(g,[s*1.55,0,z],[s*1.54,2.5,z],.13,posts,.105);
 }
 for(let i=0;i<8;i++){
  const z=-1+i*.29;
  const a=box(g,2.2,.12,.37,roof,-.82,2.94,z);a.rotation.z=.37;
  const b=box(g,2.2,.12,.37,roof,.82,2.94,z);b.rotation.z=-.37;
 }
 for(let i=0;i<8;i++){
  const x=-1.55+i*.44;
  box(g,.36,1.55,.11,i%3?plank:posts,x,.8,-1.04);
 }
 for(let i=0;i<5;i++){
  box(g,2.9,.09,.22,plank,0,.65+i*.36,.85);
  box(g,.7,.32,.48,posts,-.92+i*.43,.30+i*.36,.71);
 }
 const strip=box(g,3.4,.13,.24,stripe,0,2.27,1.17);
 for(let i=0;i<13;i++){
  const x=-1.4+r()*2.8;
  box(g,.12,.036,.19,plank,x,.04,(r()-.5)*1.2);
 }
 g.userData.footprint=1.95;
 return g;
}


function duskTownLight(seed=11){
 const r=random(seed),g=new T.Group(),layers=[];
 g.name='Розовые сумерки · туман и косые лучи';
 const haze=new T.MeshBasicMaterial({color:'#bd9e83',transparent:true,opacity:.055,depthWrite:false,side:T.DoubleSide});
 for(let i=0;i<8;i++){
  const v=mesh(g,new T.PlaneGeometry(3.8+r()*1.2,1.1+r()*.7),haze.clone(),0,.5+i*.32,-2.2-i*.23);
  v.rotation.y=(r()-.5)*.22;v.userData.watercolorOutline=false;layers.push(v);
 }
 const sun=ball(g,.43,new T.MeshBasicMaterial({color:'#e7bc92'}),-1.9,3.5,-4);
 for(let i=0;i<12;i++){
  const a=rod(g,[-1.7,3.43,-3.8],[(i-6)*.46,.02,-1.7+(i%4)*.25],.015,pigment('#bd7c69'),.003);
  a.userData.watercolorOutline=false;
 }
 const light=new T.PointLight('#edb8a5',1.5,11,2);light.position.set(-2,2,-3);g.add(light);
 g.userData.footprint=0;
 g.userData.tick=t=>{
  sun.scale.setScalar(1+.035*Math.sin(t*.42));
  layers.forEach((o,i)=>{o.position.x=.18*Math.sin(t*.22-i*.34);o.rotation.y=.1*Math.sin(t*.19-i*.23);});
 };
 return g;
}
function healerWalkWithLight(seed=12){
 const g=new T.Group(),r=random(seed),coat=pigment('#485b55'),linen=pigment('#bd9e83'),
   leather=pigment('#736b59'),cape=pigment('#607e74'),buttons=pigment('#c5ac69');
 g.name='Аптекарь идёт с поднятым фонарём';
 const chest=new T.Group();chest.position.y=.67;g.add(chest);
 const body=box(chest,.54,.77,.36,coat,0,.35,0);
 const neck=rod(chest,[0,.7,0],[0,.9,0],.07,linen);
 const hood=ball(chest,.29,cape,0,1.03,-.03,1,1.06,.89);
 ball(chest,.21,linen,0,.98,.14,1,.92,.8);
 const brim=box(chest,.56,.09,.23,cape,0,1.17,.10);
 for(let i=0;i<10;i++){
  rod(chest,[-.25+i*.055,.74,.19],[-.22+i*.055,-.04,.21],.012,i%3?coat:leather);
 }
 const legs=[],arms=[];
 for(const side of [-1,1]){
  const leg=new T.Group();leg.position.set(side*.17,.60,0);g.add(leg);legs.push(leg);
  rod(leg,[0,-.03,0],[side*.02,-.42,.04],.09,coat,.066);
  box(leg,.23,.15,.33,leather,side*.04,-.45,.075);
  const arm=new T.Group();arm.position.set(side*.32,1.28,0);g.add(arm);arms.push(arm);
  rod(arm,[0,0,0],[side*.07,-.42,.10],.095,coat,.065);
  ball(arm,.086,linen,side*.08,-.43,.12);
  for(let i=0;i<4;i++)rod(arm,[side*.08,-.4,.12],[side*(.095+i*.017),-.53,.12],.012,linen,.008);
 }
 const lamp=handFlashlight(seed+2);
 lamp.scale.setScalar(.62);lamp.position.set(.055,-.26,.12);lamp.rotation.x=PI/2;
 arms[1].add(lamp);
 const satchel=box(chest,.24,.32,.19,leather,.42,.36,-.02);
 rod(chest,[.28,.72,.02],[.48,.34,.02],.024,buttons);
 g.userData.footprint=.35;
 g.userData.tick=t=>{
  const stride=Math.sin(t*2.45);
  legs[0].rotation.x=.42*stride;legs[1].rotation.x=-.42*stride;
  arms[0].rotation.x=-.26*stride;arms[1].rotation.x=.15*stride-.16;
  chest.rotation.z=.024*Math.sin(t*2.45-.6);brim.rotation.z=.014*Math.sin(t*2.45-1);
  lamp.userData.tick(t);hood.rotation.z=.018*Math.sin(t*2.2-.7);
 };
 return g;
}
function nightRainGrade(seed=13){
 const r=random(seed),g=new T.Group(),mist=pigment('#587879'),sheets=[],drops=[];
 g.name='Сине-серая ночь · мокрый холод и туман';
 for(let i=0;i<9;i++){
  const material=new T.MeshBasicMaterial({color:i%3?'#526c74':'#9c9b8e',transparent:true,opacity:.07,depthWrite:false,side:T.DoubleSide});
  const s=mesh(g,new T.PlaneGeometry(3.4+r()*2,1.2+r()),material,(r()-.5)*1.5,1+i*.22,-2-i*.32);
  s.rotation.y=(r()-.5)*.35;s.userData.watercolorOutline=false;sheets.push(s);
 }
 for(let i=0;i<30;i++){
  const x=(r()-.5)*5,z=(r()-.5)*4,drop=rod(g,[x,.05,z],[x-.12,.42,z+.07],.009,mist,.004);
  drops.push({drop,x,z,phase:r()*4});
 }
 g.userData.footprint=0;
 g.userData.tick=t=>{
  sheets.forEach((s,i)=>{s.position.x=.14*Math.sin(t*.2-i*.41);s.rotation.y=.12*Math.sin(t*.12-i*.25);});
  drops.forEach(({drop,x,z,phase})=>{drop.position.set(x,((4.5-(t*2+phase)%4.5)),z);});
 };
 return g;
}
function wetGrassClumps(seed=14){
 const r=random(seed),g=new T.Group(),sway=[],green=pigment('#607e74'),pale=pigment('#839487'),dark=pigment('#303c38');
 g.name='Мокрая трава и агавы · задержка по листьям';
 for(let i=0;i<6;i++){
  const stalk=new T.Group();stalk.position.set((r()-.5)*3.2,0,(r()-.5)*2.7);g.add(stalk);sway.push(stalk);
  const count=5;
  for(let j=0;j<count;j++){
   const a=j*2*PI/count,reach=.2+r()*.3,H=.3+r()*.57;
   const x=Math.cos(a)*reach,z=Math.sin(a)*reach;
   rod(stalk,[0,.02,0],[x,H,z],.018,j%3?green:pale,.002);
   const leaf=ball(stalk,.095,j%4===0?pale:dark,x*.63,H*.73,z*.65,.35,1.9,.45);
   leaf.rotation.y=a;leaf.rotation.z=Math.cos(a)*.5;
   const dewdrop=ball(stalk,.018,pale,x*.71,H*.78,z*.71);
   dewdrop.scale.set(.55,1,.55);
  }
 }
 g.userData.footprint=0;
 g.userData.tick=t=>sway.forEach((b,i)=>{
  b.rotation.x=.04*Math.sin(t*.64-i*.27);
  b.rotation.z=.06*Math.sin(t*.72-i*.37);
 });
 return g;
}
function boatWake(seed=15){
 const r=random(seed),g=new T.Group(),ripples=[],spray=[],white=new T.MeshBasicMaterial({color:'#e7e5d6',transparent:true,opacity:.45,depthWrite:false,side:T.DoubleSide});
 g.name='Кильватер: расходящаяся пена и брызги весла';
 for(let j=0;j<18;j++){
  const x=(r()-.5)*1.4,z=-.5-j*.21;
  const mat=white.clone(),o=mesh(g,new T.TorusGeometry(.18+r()*.14,.014,4,24),mat,x,.035,z);
  o.rotation.x=PI/2;o.userData.watercolorOutline=false;ripples.push({o,phase:r()});
 }
 for(let i=0;i<33;i++){
  const o=ball(g,.025+r()*.04,white,(r()-.5)*2,.09+r()*.2,-r()*4.5,.8,.5,1.3);
  spray.push({o,phase:r(),z:o.position.z});
 }
 g.userData.footprint=0;
 g.userData.tick=t=>{
  ripples.forEach(({o,phase},i)=>{const q=(t*.47+phase)%1;o.scale.setScalar(.44+q*2.6);o.material.opacity=.41*(1-q);o.position.z=-.5-i*.21-.23*q;});
  spray.forEach(({o,phase,z})=>{o.position.y=.06+.16*Math.max(0,Math.sin(t*1.5+phase*PI*2));o.position.z=z-.09*t%1;o.rotation.z=.13*Math.sin(t*.45+phase);});
 };
 return g;
}
function shoreFoamLine(seed=16){
 const r=random(seed),g=new T.Group(),segments=[],white=new T.MeshBasicMaterial({color:'#d5d3bb',transparent:true,opacity:.75,depthWrite:false});
 g.name='Живая пена у изрезанного берега';
 for(let i=0;i<56;i++){
  const x=-4.7+i*.18,z=Math.sin(i*.22)*.32+Math.sin(i*.61)*.13;
  const m=ball(g,.077,white,x,.03,z,.7,.19,.43);
  segments.push({m,z,i});
 }
 for(let i=0;i<23;i++){
  const x=-4.5+i*.39,z=.35*Math.sin(i*.62);
  const o=ball(g,.035+r()*.035,white,x,.04,z+.26);
  o.scale.set(.8,.16,1.2);segments.push({m:o,z:z+.26,i:i+57});
 }
 g.scale.x=.60;
 g.userData.footprint=0;
 g.userData.tick=t=>segments.forEach(({m,z,i})=>{
  m.position.z=z+.12*Math.sin(t*.78-i*.11);m.scale.x=.66+.18*Math.sin(t*.56-i*.17);
 });
 return g;
}
function autumnConeTrees(seed=17){
 const r=random(seed),g=new T.Group(),trees=[],pine=[P.rose,P.brass,P.slate,P.coat,P.copper],
  bark=pigment(P.wood),spark=pigment(P.parchment);
 g.name='Осенние деревья INK · красные и золотые кроны';
 for(let i=0;i<5;i++){
  const tree=new T.Group();tree.position.set((i-2)*1.15,(0),(r()-.5)*1.6);g.add(tree);trees.push(tree);
  const H=1.7+r()*1.0,color=pigment(pine[i]);
  rod(tree,[0,0,0],[0,H,0],.095,bark,.045);
  for(let tier=0;tier<4;tier++){
   const radius=(.69-tier*.12)*(1+r()*.11),y=.8+tier*.36;
   const crown=mesh(tree,new T.ConeGeometry(radius,.77,7),color,0,y,0);
   crown.rotation.y=r()*PI;
   for(let j=0;j<4;j++){
    const a=j*PI/2+tier*.6;
    const leaf=ball(tree,.066,j%3?spark:color,Math.cos(a)*radius*.64,y-.09,Math.sin(a)*radius*.64,.8,.65,1.2);
    leaf.rotation.y=a;
   }
  }
  for(let j=0;j<8;j++)rod(tree,[0,.22+j*.12,0],[(r()-.5)*.6,.25+j*.12,(r()-.5)*.6],.014,bark,.004);
 }
 g.userData.footprint=.8;
 g.userData.tick=t=>trees.forEach((o,i)=>{o.rotation.z=.018*Math.sin(t*.39-i*.26);o.rotation.x=.016*Math.sin(t*.45-i*.36);});
 return g;
}
function driftingLeaves(seed=18){
 const r=random(seed),g=new T.Group(),leaves=[],fall=new T.MeshStandardMaterial({color:P.rose,roughness:1,side:T.DoubleSide});
 g.name='Листья дрейфуют по воде';
 for(let i=0;i<62;i++){
  const x=(r()-.5)*4.8,z=(r()-.5)*4.9,mat=i%3?fall:pigment(P.brass);
  const leaf=mesh(g,new T.TetrahedronGeometry(.06+r()*.055,0),mat,x,.047+r()*.03,z);
  leaf.scale.set(1,.17,1.3);leaf.rotation.y=r()*PI*2;leaves.push({leaf,x,z,phase:r()});
 }
 g.userData.footprint=0;
 g.userData.tick=t=>leaves.forEach(({leaf,x,z,phase},i)=>{
  leaf.position.x=x+.13*Math.sin(t*.28+phase*6);
  leaf.position.z=z+.08*Math.sin(t*.35+phase*5);
  leaf.rotation.z=.11*Math.sin(t*.42-i*.3);
 });
 return g;
}
function sandBeachTiles(seed=19){
 const r=random(seed),g=new T.Group(),sand=pigment('#ccbc97'),wet=pigment('#a89a80'),
   pebbles=[pigment('#9c9b8e'),pigment('#736b59'),pigment('#d5d3bb')];
 g.name='Песок · естественный рваный край и галька';
 const edge=new T.Shape();
 for(let i=0;i<=28;i++){
  const x=-3.7+i*.27,z=-1.3+.22*Math.sin(i*.35)+.13*Math.sin(i*.82);
  if(!i)edge.moveTo(x,z);else edge.lineTo(x,z);
 }
 for(let i=28;i>=0;i--)edge.lineTo(-3.7+i*.27,1.25+.17*Math.sin(i*.29));
 edge.closePath();const bed=mesh(g,new T.ShapeGeometry(edge),sand,0,.019,0);bed.rotation.x=-PI/2;
 for(let i=0;i<77;i++){
  const x=(r()-.5)*7,z=(r()-.5)*2.2,o=ball(g,.023+r()*.073,pebbles[i%3],x,.042,z,.8,.25,1.1);
  o.rotation.y=r()*PI*2;
  if(i%6===0)rod(g,[x,.04,z],[x+(r()-.5)*.12,.22,z+.08],.009,wet,.003);
 }
 g.scale.x=.83;
 g.userData.footprint=0;
 return g;
}
function tiltShiftPost(seed=20){
 const g=new T.Group(),layers=[],r=random(seed);
 g.name='Оптика миниатюры · резкая середина и мягкие края';
 for(let s of [-1,1])for(let i=0;i<6;i++){
  const mat=new T.MeshBasicMaterial({color:s>0?'#efece2':'#607e74',transparent:true,opacity:.035,depthWrite:false,side:T.DoubleSide});
  const sheet=mesh(g,new T.PlaneGeometry(5+i*.55,.32+i*.18),mat,0,2+s*(.44+i*.24),-2.8+i*.03);
  sheet.userData.watercolorOutline=false;layers.push({sheet,i,s});
 }
 const eye=ball(g,.15,pigment('#c5ac69'),0,2.0,-2.6,.7,.7,.4);
 g.scale.x=.82;
 g.userData.footprint=0;
 g.userData.tick=t=>layers.forEach(({sheet,i,s})=>{
  sheet.position.x=.06*Math.sin(t*.28-i*.31);sheet.rotation.z=.018*Math.sin(t*.2+s*i*.4);
 });
 return g;
}
function dayCoastGrade(seed=21){
 const g=new T.Group(),light=new T.PointLight('#ffe6bc',1.4,12),sun=ball(g,.33,pigment('#c5ac69'),-2,3.8,-3.5),rays=[];
 g.name='Дневной берег · золотые тени над бирюзой';
 g.add(light);light.position.copy(sun.position);
 for(let i=0;i<13;i++){
  const a=rod(g,[-1.9,3.66,-3.4],[(i-6)*.49,.02,-1.3+(i%4)*.3],.014,pigment('#d5d3bb'),.003);
  rays.push(a);
 }
 for(let i=0;i<28;i++){
  const x=-3+i*.21,o=ball(g,.031,pigment(i%3?P.sea:P.parchment),x,.03,-2.9+.1*Math.sin(i*.3),1,.2,1.2);
  rays.push(o);
 }
 g.userData.footprint=0;
 g.userData.tick=t=>{
  sun.scale.x=1+.05*Math.sin(t*.31);rays.forEach((o,i)=>{o.rotation.z=.011*Math.sin(t*.22-i*.13);});
 };
 return g;
}
function sndCarEngine(seed=22){
 const r=random(seed),g=new T.Group(),metal=pigment('#607e74'),dark=pigment('#303c38'),coils=[];
 g.name='Звуковой источник · мотор машины';
 box(g,1.5,.6,.65,metal,0,.35,0);
 for(let i=0;i<8;i++){
  const p=box(g,.12,.14,.72,i%3?dark:metal,-.59+i*.17,.73,0);coils.push(p);
 }
 for(let i=0;i<6;i++){const a=i*PI/3;rod(g,[Math.cos(a)*.28,.5,Math.sin(a)*.29],[Math.cos(a)*.45,.7,Math.sin(a)*.43],.04,dark,.013);}
 g.userData.footprint=0;
 g.userData.tick=t=>coils.forEach((o,i)=>{o.position.y=.73+.015*Math.sin(t*9-i*.3);});
 return g;
}
function sndRainNight(seed=23){
 const r=random(seed),g=new T.Group(),slate=pigment('#607e74'),silver=pigment('#d5d3bb'),drops=[];
 g.name='Звуковой источник · капли по жести';
 const roof=box(g,3,.12,.8,slate,0,1.7,0);roof.rotation.z=.19;
 for(let i=0;i<15;i++){
  const x=(i-7)*.18;
  const ridge=box(g,.035,.07,.84,i%4?slate:silver,x,1.79+.19*x,0);
  ridge.rotation.z=.19;
  if(i%2===0){
   const d=ball(g,.038,silver,x,.7,-.40);d.scale.set(.5,1.5,.5);drops.push({d,i});
  }
 }
 for(let i=0;i<4;i++)rod(g,[-1.3+i*.85,0,0],[-1.3+i*.85,1.74,0],.07,slate,.05);
 g.userData.footprint=0;
 g.userData.tick=t=>drops.forEach(({d,i})=>{d.position.y=.05+((i*.41+t*2.6)%1.4);d.scale.y=.9+.3*Math.sin(t*.9-i);});
 return g;
}
function sndRowingShore(seed=24){
 const r=random(seed),g=new T.Group(),wood=pigment('#736b59'),metal=pigment('#607e74'),arm=new T.Group();
 g.name='Звуковой источник · скрип уключины и плеск';
 box(g,.62,.18,.49,wood,0,.11,0);
 const hinge=ball(g,.17,metal,0,.41,0,1,.5,1);
 arm.position.set(0,.42,0);g.add(arm);
 rod(arm,[0,0,0],[1.7,-.26,.8],.055,wood,.032);
 for(let i=0;i<5;i++)rod(arm,[1.43+i*.08,-.22,.6],[1.51+i*.08,-.24,.94],.02,wood,.009);
 const foam=ball(g,.20,pigment('#78a5a4'),1.75,.04,.8,1,.10,2);
 g.userData.footprint=0;
 g.userData.tick=t=>{
  arm.rotation.y=.27*Math.sin(t*1.45);
  arm.rotation.z=.10*Math.sin(t*1.45-.7);
  foam.scale.x=1+.3*Math.sin(t*1.45);
 };
 return g;
}

export const makers={carHeadlights,handFlashlight,rowingHealer,rainSplashRings,townRoad,roadsideDryShrubs,pinkTownBuilding,puddles,whiteClinicBuilding,boatShed,duskTownLight,healerWalkWithLight,nightRainGrade,wetGrassClumps,boatWake,shoreFoamLine,autumnConeTrees,driftingLeaves,sandBeachTiles,tiltShiftPost,dayCoastGrade,sndCarEngine,sndRainNight,sndRowingShore};

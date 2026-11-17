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
  const lightLayers=[],spots=[],movingBeams=[];
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
    const wash=roadWash(g,x*1.36,3.31,1.7,3.35);
    movingBeams.push(ray.cone,wash.p);
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
    movingBeams.forEach((o,i)=>{o.rotation.y=.012*Math.sin(t*.71+i*.21);});
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
  g.userData.setEnabled=enabled=>{cone.visible=!!enabled;spot.intensity=enabled?1.1:0;m.uniforms.uGain.value=enabled?1:0;};
  g.userData.tick=t=>{
    pivot.rotation.y=.085*Math.sin(t*.52+.17);
    pivot.rotation.x=.025*Math.sin(t*.73-.27);
    m.uniforms.uTime.value=t;
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
    // The accepted rowboat's bow/stern are on X and gunwales on Z.
    // The oars therefore reach port/starboard (±Z), not through the bow.
    const o=new T.Group();o.position.set(side*.18,.58,side*.39);g.add(o);oars.push(o);
    ball(o,.105,wood,0,0,0,.95,.65,1.0);
    rod(o,[0,0,0],[side*.24,-.17,side*1.69],.053,wood,.037);
    const blade=mesh(o,new T.SphereGeometry(.32,10,6),oarShade,side*.28,-.20,side*1.91);
    blade.scale.set(.52,.12,1.26);blade.rotation.y=side*.16;
    for(let k=0;k<4;k++){
      rod(o,[side*.10,-.20,side*(1.66+k*.09)],[side*.43,-.20,side*(1.69+k*.09)],.008,seam);
    }
    mesh(o,new T.TorusGeometry(.12,.019,6,12),seam,0,.02,0).rotation.x=PI/2;
    for(let i=0;i<3;i++)mesh(o,new T.TorusGeometry(.053,.008,5,10),cloth,side*(.06+i*.03),-.03,side*(.29+i*.22)).rotation.x=PI/2;
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
  for(let i=0;i<34;i++){
    const x=(rng()-.5)*5.3,z=(rng()-.5)*5.3;
    const meshDrop=rod(g,[x,0,z],[x-.095,.28,z+.055],.009,rain,.005);
    meshDrop.userData.watercolorOutline=false;
    drops.push({o:meshDrop,x,z,phase:rng()*3.25});
  }
  for(let i=0;i<9;i++){
    const x=(rng()-.5)*4.4,z=(rng()-.5)*4.4;
    const m=splashMat.clone();
    const ripple=mesh(g,new T.TorusGeometry(.17,.014,5,18),m,x,.03,z);
    ripple.rotation.x=PI/2;ripple.userData.watercolorOutline=false;
    const center=ball(g,.033,water,x,.04,z,.55,.35,.55);
    rings.push({o:ripple,center,x,z,phase:rng()*4.3,i});
  }
  // Scattered falling splash triangles give an individual droplet a physical wake.
  const impacts=[];
  for(let i=0;i<10;i++){
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
export const makers={carHeadlights,handFlashlight,rowingHealer,rainSplashRings};

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

function townRoad(seed=21){
 const r=random(seed),g=new T.Group(),asphalt=pigment('#62676a'),
       aged=pigment('#918872'),curb=pigment('#a89e83'),chalk=pigment('#b6bea3'),
       dusty=pigment('#736b59'),crack=pigment(P.ink);
 // A grounded double-width crossroads with damaged shoulder edges; no tiled textures.
 const road=mesh(g,new T.BoxGeometry(3.75,.10,6.1),asphalt,0,-.04,0);
 const cross=mesh(g,new T.BoxGeometry(6.1,.10,3.75),asphalt,0,-.04,0);
 const sides=[];
 for(const d of [-1,1]){
   for(const edge of [-1,1]){
     const path=mesh(g,new T.BoxGeometry(.42,.14,1.03),curb,
        d*2.78,.065,edge*2.50);path.rotation.y=(r()-.5)*.1;sides.push(path);
     const sidewalk=mesh(g,new T.BoxGeometry(.80,.075,2.0),aged,
        d*2.69,.005,edge*2.08);
     sidewalk.rotation.y=(r()-.5)*.045;
   }
   for(const k of [-1,1]){
     mesh(g,new T.BoxGeometry(1.03,.14,.42),curb,k*2.50,.065,d*2.79);
     mesh(g,new T.BoxGeometry(2,.075,.80),aged,k*2.08,.005,d*2.69);
   }
 }
 for(let i=0;i<9;i++){
   const x=i%2?0:(r()-.5)*.5,z=-2.7+i*.65+(r()-.5)*.2;
   const mark=mesh(g,new T.BoxGeometry(.07+r()*.035,.007,.30+r()*.30),chalk,x,.017,z);
   mark.rotation.y=(r()-.5)*.08;
 }
 for(let i=0;i<43;i++){
   const x=(r()-.5)*5.92,z=(r()-.5)*5.92;
   const chip=ball(g,.04+r()*.076,i%3===0?dusty:aged,x,.01,z,
     .5+r()*1.5,.08,.7+r());
   chip.rotation.y=r()*6.28;chip.userData.watercolorOutline=false;
 }
 for(let i=0;i<12;i++){
   let x=(r()-.5)*3.8,z=(r()-.5)*3.8;
   const n=2+Math.floor(r()*4);
   for(let k=0;k<n;k++){
     const dx=(r()-.5)*.65,dz=(r()-.5)*.42;
     rod(g,[x,.02,z],[x+dx,.0201,z+dz],.008,crack,.004);
     x+=dx;z+=dz;
   }
 }
 g.userData.footprint=0;
 return g;
}
function roadsideDryShrubs(seed=23){
 const r=random(seed),g=new T.Group(),stem=pigment('#736b59'),
   twig=pigment('#918872'),leafM=[pigment('#bd7c69'),pigment('#a96851'),pigment('#c5ac69'),pigment('#607e74')],
   branches=[];
 for(let cl=0;cl<6;cl++){
   const h=.37+r()*.55,clump=new T.Group();
   clump.position.set((r()-.5)*3.0,0,(r()-.5)*2.2);clump.rotation.y=r()*6.28;g.add(clump);
   const slope=(r()-.5)*.22;
   rod(clump,[0,0,0],[slope,h,0],.032,stem,.015);
   for(let j=0;j<4;j++){
     const angle=(j*2.399+r()*.3),s=.22+r()*.29;
     const elbow=[Math.cos(angle)*s*.54,h*(.45+r()*.30),Math.sin(angle)*s*.54];
     const tip=[Math.cos(angle)*s*1.3,h*(.76+r()*.40),Math.sin(angle)*s*1.15];
     rod(clump,[slope*.55,h*.55,0],elbow,.016,stem,.010);
     const bent=new T.Group();bent.position.set(...elbow);clump.add(bent);branches.push({part:bent,phase:r()*2.5+j*.41});
     rod(bent,[0,0,0],tip.map((v,i)=>v-elbow[i]),.010,twig,.003);
     for(let k=0;k<3;k++){
       const q=.32+k*.29,p=tip.map((v,i)=>(v-elbow[i])*q);
       const leaf=ball(bent,.055+r()*.030,leafM[(cl+j+k)%4],p[0],p[1],p[2],
         .68,.25,1.1+r()*.9);
       leaf.rotation.y=angle+k*.5;leaf.rotation.z=(r()-.5)*.7;
     }
   }
   for(let k=0;k<5;k++){
     const a=k*2.399,s=.12+r()*.22;
     const thorn=rod(clump,[0,.04,0],[Math.cos(a)*s,.08,Math.sin(a)*s],.016,stem,.005);
   }
 }
 g.userData.footprint=.25;
 g.userData.tick=t=>{
   branches.forEach(({part,phase},i)=>{
     part.rotation.z=.07*Math.sin(t*.84-phase-i*.08);
     part.rotation.x=.036*Math.sin(t*.68-phase*.5-i*.14);
   });
 };
 return g;
}
function pinkTownBuilding(seed=29){
 const r=random(seed),g=new T.Group(),pink=pigment('#bd7c69'),pale=pigment('#d5b895'),
   edge=pigment('#736b59'),roof=pigment('#8d806f'),glass=pigment('#607e74'),
   sill=pigment('#c5ac69'),iron=pigment(P.iron),
   lit=new T.MeshBasicMaterial({color:'#e6c475'}),windows=[];
 const base=mesh(g,new T.BoxGeometry(3.25,2.26,2.55),pink,0,1.16,0);
 const facade=mesh(g,new T.BoxGeometry(3.30,1.89,.14),pale,0,1.07,1.32);
 facade.userData.watercolorOutline=false;
 mesh(g,new T.BoxGeometry(3.61,.18,2.91),edge,0,2.37,0);
 mesh(g,new T.BoxGeometry(3.38,.07,2.68),roof,0,2.52,0);
 for(const s of [-1,1]){
   mesh(g,new T.BoxGeometry(.26,.45,2.77),edge,s*1.58,2.53,0);
   for(let i=0;i<4;i++){
     const bolt=ball(g,.044,iron,s*1.61,.30+i*.54,1.34,.38,.6,.4);
   }
 }
 mesh(g,new T.BoxGeometry(3.43,.13,.48),roof,0,1.92,1.54);
 for(let i=0;i<9;i++){
   const x=-1.44+i*.36;
   rod(g,[x,1.85,1.69],[x,.99,1.68],.011,iron,.006);
 }
 // High front window above recessed shop front, not a single colored flat box.
 for(let i=0;i<3;i++){
   const x=-1.06+i*1.06;
   const win=mesh(g,new T.BoxGeometry(.84,.97,.12),i===1?lit:glass,x,1.26,1.45);
   win.userData.watercolorOutline=false;windows.push(win);
   mesh(g,new T.BoxGeometry(.06,1.09,.13),edge,x-.44,1.27,1.55);
   mesh(g,new T.BoxGeometry(.06,1.09,.13),edge,x+.44,1.27,1.55);
   mesh(g,new T.BoxGeometry(.93,.05,.22),sill,x,.70,1.50);
   mesh(g,new T.BoxGeometry(.93,.05,.22),sill,x,1.82,1.50);
   rod(g,[x,1.25,1.58],[x,1.75,1.58],.012,iron);
   rod(g,[x-.39,1.30,1.58],[x+.39,1.30,1.58],.012,iron);
 }
 for(const s of [-1,1]){
   for(let i=0;i<3;i++){
     const win=mesh(g,new T.BoxGeometry(.14,.36,.56),i===0?lit:glass,
       s*1.67,.96+i*.4,-.68);
     windows.push(win);
   }
 }
 const sign=mesh(g,new T.BoxGeometry(2.04,.31,.08),roof,0,2.10,1.47);
 for(let i=0;i<13;i++){
   const x=-.90+i*.145;
   mesh(g,new T.BoxGeometry(.038,.12+(i%4)*.035,.035),i%3===0?sill:iron,x,2.1,1.54);
 }
 // Copper piping, drain, roof vents, roof gravel and uneven masonry.
 rod(g,[1.50,2.20,1.45],[1.50,.12,1.46],.043,iron);
 for(let i=0;i<16;i++){
   const x=(r()-.5)*2.80,z=(r()-.5)*2.10;
   ball(g,.050+r()*.037,roof,x,2.61,z,1,.24,1.4);
 }
 const vent=mesh(g,new T.CylinderGeometry(.20,.23,.53,9),iron,-.96,2.84,-.54);
 mesh(g,new T.CylinderGeometry(.30,.30,.07,9),edge,-.96,3.13,-.54);
 g.userData.footprint=1.6;
 g.userData.tick=t=>windows.forEach((w,i)=>{
   if(i===1||i===3){
     const want=.5+.5*Math.sin(t*.19+i*.35);
     w.material=i%2?lit:glass;
     w.scale.z=.98+.025*want;
   }
 });
 return g;
}
function duskTownLight(seed=34){
 const r=random(seed),g=new T.Group(),sheets=[],motes=[];
 g.name='Сумеречный тёплый свет и дальняя акварельная дымка';
 const tint=new T.MeshBasicMaterial({color:'#bd7c69',transparent:true,opacity:.10,
   side:T.DoubleSide,depthWrite:false});
 const gold=new T.MeshBasicMaterial({color:'#c5ac69',transparent:true,opacity:.12,
   side:T.DoubleSide,depthWrite:false});
 for(let i=0;i<14;i++){
   const x=(r()-.5)*4.6,z=(r()-.5)*4.3,depth=.45+r()*1.2;
   const plane=mesh(g,new T.PlaneGeometry(1.4+r(),depth,3,2),i%3===0?gold:tint,x,
     .30+i*.13,z);
   plane.rotation.y=r()*6.28;
   plane.userData.watercolorOutline=false;
   sheets.push({o:plane,x,phase:r()*3.7,i});
 }
 for(let i=0;i<20;i++){
   const x=(r()-.5)*4.7,z=(r()-.5)*4.5,y=.24+r()*1.5;
   const ballMesh=ball(g,.014+r()*.028,gold,x,y,z,.7,1.5,.9);
   ballMesh.userData.watercolorOutline=false;
   motes.push({o:ballMesh,y,phase:r()*6.28});
 }
 g.userData.footprint=0;
 g.userData.tick=t=>{
   sheets.forEach(({o,x,phase,i})=>{
     o.position.x=x+.16*Math.sin(t*.13-phase);
     o.rotation.y=.3+.08*Math.sin(t*.21-i*.23);
   });
   motes.forEach(({o,y,phase})=>{
     o.position.y=y+.12*Math.sin(t*.35+phase);
   });
 };
 return g;
}
function healerWalkWithLight(seed=37){
 const r=random(seed),g=new T.Group(),body=new T.Group();
 g.name='Аптекарь шагает с собственным шарнирным фонариком';
 const coat=pigment(P.coat),pants=pigment('#414f50'),
   skin=pigment('#c5ac69'),hood=pigment('#bd7c69'),
   leather=pigment(P.wood),silver=pigment(P.iron);
 g.add(body);
 const legs=[],arms=[];
 for(const s of [-1,1]){
   const hip=new T.Group();hip.position.set(s*.13,.63,0);body.add(hip);legs.push(hip);
   rod(hip,[0,0,0],[s*.035,-.38,.012],.115,pants,.093);
   const foot=ball(hip,.13,leather,s*.035,-.48,.085,1.1,.47,1.5);
   rod(hip,[s*.035,-.37,.012],[s*.035,-.48,.085],.079,leather);
 }
 const torso=mesh(body,new T.CylinderGeometry(.21,.40,.69,10),coat,0,1.02,0);
 torso.rotation.x=-.05;
 ball(body,.23,skin,0,1.49,.065,.90,1.0,.81);
 const cowl=ball(body,.28,hood,0,1.56,-.06,1.04,.87,.85);
 cowl.rotation.x=-.35;
 box(body,.38,.10,.15,leather,0,1.09,.26);
 const cloak=mesh(body,new T.ConeGeometry(.42,.55,9,1,true),hood,0,.82,-.12);
 cloak.rotation.x=.13;
 for(let i=0;i<8;i++){
   const a=(i-3.5)*.10;
   rod(body,[a,1.18,-.29],[a+.02,.68,-.34],.009,leather);
 }
 for(const s of [-1,1]){
   const shoulder=new T.Group();shoulder.position.set(s*.26,1.24,.04);
   body.add(shoulder);arms.push(shoulder);
   rod(shoulder,[0,0,0],[s*.06,-.28,.13],.102,coat);
   rod(shoulder,[s*.06,-.28,.13],[s*.11,-.43,.36],.078,hood);
   ball(shoulder,.065,skin,s*.11,-.44,.36);
 }
 const light=handFlashlight(seed+1);
 light.position.set(.36,.12,.36);light.scale.setScalar(.85);
 arms[1].add(light);
 // Leather medicine satchel; the buckles and straps are true volumes.
 box(body,.36,.48,.22,leather,-.38,.80,-.14);
 for(let i=0;i<4;i++){
   box(body,.047,.16,.036,i%2?silver:skin,-.5+i*.08,.78,-.012);
 }
 rod(body,[-.3,1.31,.03],[-.45,.67,-.15],.037,leather);
 const scarf=mesh(body,new T.BoxGeometry(.10,.48,.055),pigment(P.brass),.14,1.23,.15);
 scarf.rotation.z=-.22;
 const hair=[];
 for(let i=0;i<8;i++){
   const a=r()*6.28;
   const strand=mesh(body,new T.ConeGeometry(.020,.15,5),leather,
    Math.cos(a)*.16,1.67,Math.sin(a)*.13);
   strand.rotation.z=Math.sin(a)*.18;hair.push(strand);
 }
 g.userData.footprint=.35;
 g.userData.tick=t=>{
   const cycle=t*2.2;
   legs[0].rotation.x=.48*Math.sin(cycle);
   legs[1].rotation.x=.48*Math.sin(cycle+PI);
   arms[0].rotation.x=.19*Math.sin(cycle+PI-.30);
   arms[1].rotation.x=.13*Math.sin(cycle-.25);
   body.position.y=.020*(1+Math.cos(cycle*2));
   torso.rotation.z=.015*Math.sin(cycle-1.4);
   scarf.rotation.x=.14*Math.sin(t*.66-.5);
   cowl.rotation.y=.023*Math.sin(cycle-.7);
   light.userData.tick(t);
 };
 return g;
}
function puddles(seed=41){
 const r=random(seed),g=new T.Group(),shimmers=[],ripples=[];
 const water=new T.MeshStandardMaterial({color:'#607e74',roughness:.29,metalness:.32,
 transparent:true,opacity:.84,depthWrite:false,side:T.DoubleSide});
 const shimmer=new T.MeshBasicMaterial({color:'#e7e5d6',transparent:true,opacity:.35,
 depthWrite:false});
 const ringMat=new T.MeshBasicMaterial({color:'#b6bea3',transparent:true,opacity:.32,
 depthWrite:false});
 for(let i=0;i<6;i++){
   const x=(r()-.5)*3.8,z=(r()-.5)*3.8;
   const sh=new T.Shape(),n=16,rr=.29+r()*.31;
   for(let k=0;k<=n;k++){
     const a=k*2*PI/n,d=rr*(.67+.48*r());
     if(k===0)sh.moveTo(Math.cos(a)*d,Math.sin(a)*d);
     else sh.lineTo(Math.cos(a)*d,Math.sin(a)*d);
   }
   sh.closePath();
   const blob=mesh(g,new T.ShapeGeometry(sh),water,x,.035,z);
   blob.rotation.x=-PI/2;blob.scale.x=.7+r()*.7;
   const ripple=mesh(g,new T.TorusGeometry(.14,.012,4,16),ringMat.clone(),x,.042,z);
   ripple.rotation.x=PI/2; ripple.userData.watercolorOutline=false;
   ripples.push({o:ripple,phase:r()*2.5});
   for(let j=0;j<3;j++){
     const a=r()*6.28,d=r()*rr;
     const s=box(g,.04+r()*.17,.005,.014,shimmer,x+Math.cos(a)*d,.048,z+Math.sin(a)*d);
     s.rotation.y=a;shimmers.push({o:s,phase:r()*4.2});
   }
 }
 g.userData.footprint=0;
 g.userData.tick=t=>{
   ripples.forEach(({o,phase},i)=>{
     const p=(t*.45+phase)%1.8/1.8;
     o.scale.setScalar(.45+1.7*p);
     o.material.opacity=.3*(1-p);
   });
   shimmers.forEach(({o,phase},i)=>{
     o.position.y=.045+.004*Math.sin(t*1.9+phase);
   });
 };
 return g;
}

export const makers={carHeadlights,handFlashlight,rowingHealer,rainSplashRings,townRoad,roadsideDryShrubs,pinkTownBuilding,duskTownLight,healerWalkWithLight,puddles};

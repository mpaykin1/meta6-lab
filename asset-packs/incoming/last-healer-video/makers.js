import * as T from 'three';
import {traveller} from './ink-objects.js';
// Extra INK geometry for The Last Healer. All four makers are additive.
// Coordinates are metres; forward is -Z. Makers never modify the accepted models.
const pigment={
 iron:new T.MeshStandardMaterial({color:'#607e74',metalness:.48,roughness:.52}),
 steel:new T.MeshStandardMaterial({color:'#303c38',metalness:.34,roughness:.72}),
 brass:new T.MeshStandardMaterial({color:'#c5ac69',metalness:.35,roughness:.47}),
 paper:new T.MeshStandardMaterial({color:'#d5d3bb',roughness:1}),
 coat:new T.MeshStandardMaterial({color:'#53675f',roughness:1}),
 coatShadow:new T.MeshStandardMaterial({color:'#303c38',roughness:1}),
 wood:new T.MeshStandardMaterial({color:'#736b59',roughness:1}),
 skin:new T.MeshStandardMaterial({color:'#bd9e83',roughness:1}),
 dusk:new T.MeshBasicMaterial({color:'#efe5ba',transparent:true,opacity:.11,depthWrite:false,side:T.DoubleSide}),
 warm:new T.MeshBasicMaterial({color:'#f0d49a',toneMapped:false}),
 red:new T.MeshBasicMaterial({color:'#bd7c69',toneMapped:false}),
 blue:new T.MeshBasicMaterial({color:'#b6c8c6',transparent:true,opacity:.65,depthWrite:false,side:T.DoubleSide}),
 ripple:new T.MeshBasicMaterial({color:'#cbd8d1',transparent:true,opacity:.48,depthWrite:false}),
 spray:new T.PointsMaterial({color:'#efece2',size:.065,transparent:true,opacity:.7,depthWrite:false})
};
function rand(seed){let s=(seed|0)||1;return()=>(((s=Math.imul(s,1664525)+1013904223|0)>>>0)/4294967296);}
function part(g,geo,mat,x=0,y=0,z=0){const o=new T.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=true;o.userData.watercolorOutline=true;g.add(o);return o;}
function block(g,a,b,c,mat,x,y,z){return part(g,new T.BoxGeometry(a,b,c),mat,x,y,z);}
function rod(g,a,b,r,mat,r2=r){const v=new T.Vector3(...b).sub(new T.Vector3(...a));const o=part(g,new T.CylinderGeometry(r2,r,v.length(),8),mat,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return o;}
function finish(g,footprint=0){g.userData.footprint=footprint;return g;}

export function carHeadlights(seed=1){
 const random=rand(seed),g=new T.Group();g.name='Свет фар INK';const flares=[],glows=[];
 // A detachable front-and-rear light rig, scaled to approved INK car.
 for(const side of [-1,1]){
   const x=side*.48;
   block(g,.38,.24,.095,pigment.steel,x,.63,-.74);
   block(g,.285,.17,.06,pigment.brass,x,.63,-.804);
   const lens=part(g,new T.SphereGeometry(.112,12,8),pigment.warm,x,.635,-.853);
   lens.scale.set(1.28,.66,.35);flares.push(lens);
   for(let k=0;k<3;k++){
     const z=-1.28-k*.92;
     const length=.94+k*.46;
     const spread=.12+k*.37;
     const color=new T.MeshBasicMaterial({color:k===0?'#e7d4a4':'#d9c28f',transparent:true,opacity:(.17-k*.043),depthWrite:false,side:T.DoubleSide});
     const shape=new T.BufferGeometry();
     const v=new Float32Array([x-.12,.025,-.9,x+.12,.025,-.9,x+spread,.012,z-length, x-.12,.025,-.9,x+spread,.012,z-length,x-spread,.012,z-length]);
     shape.setAttribute('position',new T.BufferAttribute(v,3));shape.computeVertexNormals();
     const fan=part(g,shape,color);fan.castShadow=false;glows.push(fan);
   }
   for(let k=0;k<3;k++)part(g,new T.TorusGeometry(.075+k*.034,.006,5,16),pigment.brass,x,.635,-.89-k*.008);
   block(g,.255,.20,.09,pigment.steel,x,.68,.91);
   block(g,.205,.122,.04,pigment.red,x,.68,.974);
   const backWash=part(g,new T.PlaneGeometry(.53,.82),new T.MeshBasicMaterial({color:'#bd7c69',transparent:true,opacity:.15,depthWrite:false,side:T.DoubleSide}),x,.012,1.25);
   backWash.rotation.x=-Math.PI/2;glows.push(backWash);
 }
 const stripes=[-.65,-.31,0,.31,.65];
 for(let i=0;i<stripes.length;i++)block(g,.032,.028,.04,pigment.iron,stripes[i],.48,-.72);
 const facing=new T.Group();while(g.children.length)facing.add(g.children[0]);g.add(facing);facing.rotation.y=Math.PI;
 g.userData.mount={vehicle:'car',front:'+z',at:[0,0,0]};
 g.userData.tick=t=>{const e=.92+.075*Math.sin(t*2.7);flares.forEach(l=>l.scale.z=.32+e*.07);glows.forEach((x,i)=>{x.material.opacity=(i%4===3?.13:.12)*e;});};
 return finish(g,0);
}

export function handFlashlight(seed=1){
 const random=rand(seed),g=new T.Group();g.name='Ручной фонарь аптекаря';
 const arm=new T.Group();arm.position.set(.21,1.16,-.16);g.add(arm);
 // Distinct knurled metal body, handle, power switch and exposed warm glass.
 const body=rod(arm,[0,0,.14],[0,0,-.31],.088,pigment.steel,.10);
 for(let i=0;i<8;i++)part(arm,new T.TorusGeometry(.093,.009,4,14),pigment.iron,0,0,.12-i*.047).rotation.x=Math.PI/2;
 rod(arm,[0,0,-.29],[0,0,-.40],.128,pigment.brass,.093);
 part(arm,new T.CylinderGeometry(.128,.128,.06,16),pigment.warm,0,0,-.435).rotation.x=Math.PI/2;
 const button=block(arm,.082,.048,.105,pigment.brass,0,.103,.02);
 block(arm,.055,.022,.065,pigment.iron,0,.143,.02);
 const beam=new T.Group();arm.add(beam);
 for(let k=0;k<3;k++){
  const length=3.1+k*.36;
  const m=new T.MeshBasicMaterial({color:k===0?'#f2e5be':'#c5c3ab',transparent:true,opacity:.06-k*.011,depthWrite:false,side:T.DoubleSide});
  const obj=part(beam,new T.CylinderGeometry(.078,.65+k*.19,length,18,1,true),m,0,0,-.48-length/2);
  obj.rotation.x=Math.PI/2;obj.castShadow=false;
 }
 const floor=part(beam,new T.CircleGeometry(1.08,32),new T.MeshBasicMaterial({color:'#e6d8b8',transparent:true,opacity:.24,depthWrite:false,side:T.DoubleSide}),0,-1.12,-3.18);floor.rotation.x=-Math.PI/2;floor.castShadow=false;
 const dust=new T.Group();beam.add(dust);
 for(let i=0;i<18;i++){const z=-.6-random()*2.6,r=.22+random()*.37,a=random()*6.283;
  const m=part(dust,new T.OctahedronGeometry(.013+random()*.017,0),pigment.warm,Math.sin(a)*r,Math.cos(a)*r*.75,z);
  m.userData.offset=random()*6.283;m.castShadow=false;
 }
 let enabled=true;
 g.userData.setEnabled=on=>{enabled=!!on;beam.visible=enabled;};
 g.userData.interact={radius:1.6,effect:'light',label_ru:'Осветить ночной лес'};
 g.userData.tick=t=>{arm.rotation.y=.10*Math.sin(t*.85);arm.rotation.x=.045*Math.sin(t*1.34+.6);button.position.y=.143+.002*Math.sin(t*1.9);
 dust.children.forEach((p,i)=>{p.position.y+=Math.sin(t*.5+i*.6)*.0003;});};
 return finish(g,.08);
}

export function rowingHealer(seed=1){
 const random=rand(seed),g=new T.Group();g.name='Аптекарь — гребля';
 // A seated articulated sailor that can be mounted in the existing rowboat.
 const root=new T.Group();g.add(root);
 const trunk=part(root,new T.CylinderGeometry(.26,.34,.66,11,2),pigment.coat,0,.85,0);
 const belly=part(root,new T.ConeGeometry(.39,.53,10),pigment.coatShadow,0,.63,.08);
 const seam=rod(root,[0,.55,-.29],[0,1.17,-.28],.016,pigment.brass);
 const scarf=part(root,new T.TorusGeometry(.225,.06,6,20),pigment.brass,0,1.20,0);scarf.rotation.x=Math.PI/2;
 const neck=rod(root,[0,1.19,0],[0,1.33,0],.077,pigment.skin);
 const head=part(root,new T.SphereGeometry(.177,15,11),pigment.skin,0,1.44,-.015);
 const hood=part(root,new T.SphereGeometry(.21,15,10,0,Math.PI*2,0,Math.PI*.7),pigment.coatShadow,0,1.49,.012);
 const brim=part(root,new T.TorusGeometry(.19,.032,7,22),pigment.coat,0,1.34,-.055);brim.rotation.x=Math.PI/2;
 for(const x of [-.073,.073])part(root,new T.SphereGeometry(.015,6,5),pigment.steel,x,1.465,-.164);
 for(const s of [-1,1]){
   part(root,new T.SphereGeometry(.16,8,7),pigment.coat,s*.25,1.05,.03).scale.set(1,.82,1.1);
   rod(root,[s*.17,.65,.10],[s*.17,.38,-.19],.11,pigment.coatShadow);
   block(root,.14,.12,.24,pigment.steel,s*.17,.32,-.31);
 }
 // A functional oar pivot on each side. Shaft, blade, collar and oarlock all move.
 const oars=[];
 for(const s of [-1,1]){
  const pivot=new T.Group();pivot.position.set(s*.40,.92,-.10);g.add(pivot);
  rod(g,[s*.38,.68,-.10],[s*.40,.98,-.10],.035,pigment.wood);
  const lock=part(g,new T.TorusGeometry(.093,.021,7,14),pigment.brass,s*.4,.94,-.10);lock.rotation.z=Math.PI/2;
  rod(pivot,[0,0,0],[s*1.64,-.36,-.38],.047,pigment.wood,.061);
  const blade=part(pivot,new T.SphereGeometry(.24,12,9),pigment.wood,s*1.84,-.41,-.45);
  blade.scale.set(1.5,.20,.59);blade.rotation.y=s*.24;
  for(let j=0;j<6;j++)rod(pivot,[s*(1.62+j*.07),-.41,-.52],[s*(1.62+j*.07),-.40,-.37],.007,pigment.brass);
  const hand=part(pivot,new T.SphereGeometry(.094,10,7),pigment.skin,s*.35,.09,.04);
  const sleeve=rod(pivot,[s*.26,.18,.04],[s*.35,.10,.04],.109,pigment.coat);
  const upper=new T.Group();upper.position.set(s*.25,1.06,.04);root.add(upper);
  rod(upper,[0,0,0],[s*.11,-.21,-.18],.12,pigment.coat);
  oars.push({pivot,upper,s});
 }
 // Belt, waterproof satchel, buttons, buckle and stitched hem.
 block(root,.43,.12,.11,pigment.wood,0,.68,-.295);
 block(root,.10,.10,.025,pigment.brass,0,.68,-.36);
 for(let i=0;i<4;i++)part(root,new T.SphereGeometry(.019,6,5),pigment.brass,0,1.11-i*.14,-.312);
 const satchel=block(root,.28,.24,.12,pigment.wood,.38,.60,.14);satchel.rotation.z=-.14;
 rod(root,[.15,1.07,.16],[.41,.69,.18],.035,pigment.brass);
 // Водяной контакт у поверхности: гребец сидит в готовой лодке, не «висит» отдельно.
 const waterWash=part(g,new T.TorusGeometry(.87,.017,5,32,Math.PI*1.64),pigment.ripple.clone(),0,.026,0);
 waterWash.rotation.x=-Math.PI/2;waterWash.castShadow=false;
 g.userData.mount={vehicle:'rowboat',seat:[0,.25,0]};
 g.userData.tick=t=>{
  root.rotation.x=.075*Math.sin(t*2.15-.25);
  root.rotation.y=.025*Math.sin(t*1.09);
  head.rotation.x=.07*Math.sin(t*2.15-.65);
  oars.forEach(({pivot,upper,s},i)=>{const phase=t*2.15+i*.19;
    pivot.rotation.y=s*(.20+.46*Math.sin(phase));
    pivot.rotation.z=s*(.09+.18*Math.cos(phase-.47));
    pivot.rotation.x=.11*Math.sin(phase-.83);
    upper.rotation.z=s*.14*Math.sin(phase-.42);
  });
  g.rotation.z=.024*Math.sin(t*2.15-.7);
  waterWash.scale.setScalar(.97+.06*Math.sin(t*2.15-.75));
 };
 return finish(g,.34);
}

export function rainSplashRings(seed=1){
 const random=rand(seed),g=new T.Group();g.name='Дождевые кольца';
 const rings=[],drops=[];
 for(let i=0;i<25;i++){
  const x=(random()-.5)*5.6,z=(random()-.5)*5.5;
  const r=.09+.13*random();
  const mesh=part(g,new T.TorusGeometry(1,.018,3,14),pigment.ripple.clone(),x,.024,z);
  mesh.rotation.x=-Math.PI/2;mesh.scale.setScalar(r);
  mesh.castShadow=false;
  rings.push({mesh,origin:(i/25)*2.6,duration:.68+.45*random(),radius:.06+.16*random()});
  const spray=part(g,new T.ConeGeometry(.017,.16,5),pigment.blue,x,.10,z);
  spray.castShadow=false;drops.push({spray,phase:random()*6.283});
 }
 const points=68;const pos=new Float32Array(points*3);
 for(let i=0;i<points;i++){pos[3*i]=(random()-.5)*5.6;pos[3*i+1]=.6+random()*3.5;pos[3*i+2]=(random()-.5)*5.5;}
 const initialY=Array.from({length:points},(_,i)=>pos[i*3+1]);const originalY=Array.from({length:points},(_,i)=>pos[3*i+1]);
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3));
 const streaks=new T.Points(geo,pigment.spray);g.add(streaks);
 g.userData.tick=t=>{
  for(const {mesh,origin,duration,radius} of rings){
    const phase=((t*.8+origin)%duration)/duration;
    mesh.scale.setScalar(radius+phase*.56);
    mesh.material.opacity=.44*(1-phase);
  }
  drops.forEach(({spray,phase})=>{const cycle=(t*1.7+phase)%1;spray.scale.y=.35+.8*(1-cycle);spray.position.y=.07+.22*(1-cycle);});
  const a=geo.attributes.position;
  for(let i=0;i<points;i++)a.setY(i,.2+((initialY[i]-(t*5.8)%3.9+3.9)%3.9));
  a.needsUpdate=true;
 };
 return finish(g,0);
}

export function townRoad(seed=1){
 // Земля по краю всегда неровная; разметка выцвела и не повторяется плиткой.
 const random=rand(seed),g=new T.Group();g.name='Старая городская дорога';
 const asphalt=new T.MeshStandardMaterial({color:'#666d69',roughness:.92});
 const rim=new T.MeshStandardMaterial({color:'#9c9b8e',roughness:1});
 const sand=new T.MeshStandardMaterial({color:'#918872',roughness:1});
 const line=new T.MeshStandardMaterial({color:'#b8b1a1',roughness:1});
 block(g,5.6,.11,1.8,asphalt,0,.018,0);
 block(g,1.8,.11,5.6,asphalt,0,.019,0);
 for(const sign of [-1,1])for(let i=0;i<7;i++){
  const x=-2.55+i*.85;
  if(Math.abs(x)<1.1)continue;
  const piece=block(g,.72,.15,.19,rim,x,.09,sign*1.02);
  piece.rotation.y=(random()-.5)*.055;
  if(i%3===0)block(g,.16,.025,.15,sand,x+.19,.175,sign*1.02);
 }
 for(let i=0;i<17;i++){
  const x=(random()-.5)*5.15,z=(random()-.5)*1.55;
  rod(g,[x,.082,z],[x+(random()-.5)*.45,.082,z+(random()-.5)*.19],.007,pigment.steel,.002);
 }
 for(let i=0;i<10;i++){
  const a=i/10*Math.PI*2,rr=2.4+random()*.55;
  const x=Math.cos(a)*rr,z=Math.sin(a)*rr*.7;
  const stone=part(g,new T.DodecahedronGeometry(.06+random()*.12,0),i%2?sand:rim,x,.038,z);
  stone.scale.set(1,.40,1.2);
 }
 for(let i=0;i<7;i++){
  const z=-2.4+i*.76;
  if(Math.abs(z)<1.0)continue;
  const d=block(g,.09,.013,.35,line,.1,.083,z);
  d.rotation.y=(random()-.5)*.06;
 }
 g.userData.surface={walkable:true,speed:1,wetGrip:.65};
 return finish(g,0);
}
export function wetGrassClumps(seed=1){
 // У каждого растения отдельный корень, форма и фаза движения.
 const random=rand(seed),g=new T.Group();g.name='Пучки мокрой травы';
 const stems=[];
 for(let c=0;c<6;c++){
  const plant=new T.Group();plant.position.set((random()-.5)*2.65,0,(random()-.5)*1.4);g.add(plant);stems.push(plant);
  const leaves=7+c%3;
  for(let i=0;i<leaves;i++){
   const a=2*Math.PI*i/leaves+(random()-.5)*.35,h=.37+random()*.65;
   const ux=Math.cos(a),uz=Math.sin(a);
   const shape=new T.Shape();shape.moveTo(-.023,0);shape.quadraticCurveTo(-.11,h*.42,-.045,h*.72);
   shape.quadraticCurveTo(-.01,h*.92,0,h);shape.quadraticCurveTo(.08,h*.76,.07,h*.37);shape.lineTo(.027,0);shape.closePath();
   const leaf=part(plant,new T.ExtrudeGeometry(shape,{depth:.015,bevelEnabled:false,steps:1,curveSegments:1}),i%3?pigment.iron:pigment.coat,.06*ux,0,.06*uz);
   leaf.rotation.y=a+.4;leaf.rotation.z=.1*(random()-.5);
   if(i%3===0){
    const dew=part(plant,new T.IcosahedronGeometry(.019,0),pigment.paper,ux*.22,h*.45,uz*.22);
    dew.userData.watercolorOutline=false;
   }
  }
  for(let k=0;k<1;k++)part(plant,new T.DodecahedronGeometry(.045+random()*.02,0),pigment.wood,(random()-.5)*.20,.02,(random()-.5)*.20);
 }
 g.userData.tick=t=>stems.forEach((p,i)=>{p.rotation.z=.048*Math.sin(t*.61-i*.32);p.rotation.x=.034*Math.sin(t*.48+i*.52);});
 return finish(g,0);
}


export function roadsideDryShrubs(seed=1){
 const rng=rand(seed),g=new T.Group();g.name='Сухие кусты у дороги';
 const bark=new T.MeshStandardMaterial({color:'#736b59',roughness:1});
 const twig=new T.MeshStandardMaterial({color:'#8c7763',roughness:1});
 const leaves=['#b29b74','#a68f73','#ad806b','#9b9c7c'].map(color=>new T.MeshStandardMaterial({color,roughness:1,side:T.DoubleSide}));
 const crowns=[];
 for(let b=0;b<6;b++){
   const bush=new T.Group();bush.position.set(-2+b*.76,0,(rng()-.5)*.65);g.add(bush);
   const lean=(rng()-.5)*.26,high=.31+rng()*.34;
   rod(bush,[0,0,0],[lean,high,0],.025,bark,.010);
   for(let k=0;k<5;k++){
     const a=k*2.4+b*.63,r=.23+rng()*.24,top=high*(.6+rng()*.5);
     rod(bush,[lean,high*.62,0],[lean+Math.sin(a)*r,top,Math.cos(a)*r],.012,twig,.006);
     for(let j=0;j<2;j++){
       const v=part(bush,new T.TetrahedronGeometry(.055+rng()*.042,0),leaves[(b+k+j)%leaves.length],
         lean+Math.sin(a)*r*(.55+j*.30),top-.03*j,Math.cos(a)*r*(.55+j*.30));
       v.scale.y=.52+rng()*.3;
     }
   }
   crowns.push({bush,phase:b*.24+rng()*.4,lean});
 }
 g.userData.tick=t=>{for(const c of crowns){c.bush.rotation.z=c.lean*.13+.07*Math.sin(t*.63-c.phase);c.bush.rotation.x=.039*Math.sin(t*.71-c.phase-.35);}};
 return finish(g,.1);
}

export function pinkTownBuilding(seed=1){
 const rng=rand(seed),g=new T.Group();g.name='Розовая лавка на углу';
 const stucco=new T.MeshStandardMaterial({color:'#bd998c',roughness:.94});
 const wash=new T.MeshStandardMaterial({color:'#a88581',roughness:1});
 const brick=new T.MeshStandardMaterial({color:'#886f68',roughness:1});
 const trim=new T.MeshStandardMaterial({color:'#ded0b5',roughness:1});
 const glass=new T.MeshStandardMaterial({color:'#688c88',roughness:.18,metalness:.08});
 const gold=new T.MeshBasicMaterial({color:'#e0b780'});
 const awning=new T.MeshStandardMaterial({color:'#7a8d7d',roughness:.89,side:T.DoubleSide});
 block(g,3.8,.21,3.2,brick,0,.10,0);
 block(g,3.66,2.65,3.0,stucco,0,1.54,0);
 for(const s of [-1,1]){
  const x=s*1.86;
  block(g,.24,2.5,.37,brick,x,1.6,-1.38);
  block(g,.27,2.3,.32,trim,x,1.65,1.23);
 }
 for(let i=0;i<4;i++){
   const x=-1.36+i*.90;
   block(g,.68,1.11,.05,glass,x,.84,1.535);
   block(g,.70,.08,.15,trim,x,1.43,1.58);
   rod(g,[x-.39,.20,1.62],[x-.39,1.42,1.62],.033,pigment.wood);
   if(i===2)block(g,.12,.22,.05,gold,x-.15,.83,1.588);
 }
 for(let i=0;i<4;i++){
  const x=-1.35+i*.90;
  block(g,.48,.62,.03,glass,x,2.15,1.535);
  block(g,.53,.09,.16,trim,x,2.56,1.54);
  block(g,.09,.66,.09,trim,x,2.15,1.60);
  for(let j=0;j<2;j++)block(g,.08,.07,.05,gold,x+(j-.5)*.32,2.15,1.57);
 }
 block(g,4.22,.22,3.58,wash,0,2.98,0);
 for(const s of [-1,1])block(g,.16,.40,3.55,brick,s*2.06,3.23,0);
 for(const s of [-1,1])block(g,4.18,.36,.17,brick,0,3.18,s*1.72);
 block(g,3.53,.30,.12,trim,0,1.69,1.67);
 const awn=block(g,3.5,.06,1.1,awning,0,1.68,2.03);awn.rotation.x=-.15;
 for(let i=0;i<8;i++){const x=-1.47+i*.42;block(g,.19,.07,.18,i%2?stucco:trim,x,1.52,2.52);}
 for(let i=0;i<5;i++)rod(g,[1.97,3.0,-1.65+i*.43],[2.09,1.6,-1.65+i*.43],.027,pigment.iron);
 const plaque=block(g,1.13,.24,.14,trim,-.82,2.89,1.74);plaque.rotation.z=(rng()-.5)*.03;
 const lamps=[];
 for(let k=0;k<3;k++){
  const glow=part(g,new T.BoxGeometry(.42,.22,.015),new T.MeshBasicMaterial({color:'#f1d1a9',transparent:true,opacity:.36,depthWrite:false}),-.88+k*.93,2.17,1.556);
  lamps.push(glow);
 }
 g.userData.tick=t=>lamps.forEach((m,i)=>m.material.opacity=.28+.065*Math.sin(t*.21+i*1.6));
 return finish(g,2.1);
}

export function duskTownLight(seed=1){
 const rng=rand(seed),g=new T.Group();g.name='Розовые вечерние сумерки';
 const mats=[],planes=[];
 for(let i=0;i<6;i++){
  const mat=new T.MeshBasicMaterial({color:i%2?'#bd8f9b':'#dec0a8',transparent:true,opacity:.08,depthWrite:false,side:T.DoubleSide});
  const geo=new T.PlaneGeometry(2.8+i*.44,1.2+i*.21);
  const p=part(g,geo,mat,-1.5+i*.57,1.1+(i%3)*.25,-1.3-i*.09);
  p.rotation.y=(rng()-.5)*.3;mats.push(mat);planes.push(p);p.castShadow=false;
 }
 for(let i=0;i<8;i++){
  const x=(rng()-.5)*5,z=(rng()-.5)*3;
  const patch=part(g,new T.PlaneGeometry(.24+rng()*.8,.18+rng()*.6),
    new T.MeshBasicMaterial({color:'#a17686',transparent:true,opacity:.12,depthWrite:false,side:T.DoubleSide}),x,.015,z);
  patch.rotation.x=-Math.PI/2;patch.rotation.z=rng()*3;patch.castShadow=false;
 }
 g.userData.tick=t=>planes.forEach((m,i)=>{m.position.x+=Math.sin(t*.08+i)*.00025;mats[i].opacity=.06+.025*(1+Math.sin(t*.31-i*.51));});
 return finish(g,0);
}

export function healerWalkWithLight(seed=1){
 const g=new T.Group();g.name='Аптекарь идёт с фонарём';
 const origin=traveller();g.add(origin);
 // A derivative instance of the approved traveller; its source file is untouched.
 const attached=origin.children[origin.children.length-1];if(attached?.isGroup)attached.visible=false;
 const flashlight=handFlashlight(seed+1);flashlight.scale.setScalar(.70);flashlight.position.set(.44,-.16,-.18);origin.add(flashlight);
 const arm=new T.Group();arm.position.set(.29,.93,-.1);origin.add(arm);
 rod(arm,[0,0,0],[.18,-.14,-.34],.079,pigment.coat);
 part(arm,new T.SphereGeometry(.085,9,7),pigment.skin,.20,-.19,-.37);
 const billow=[];
 for(let i=0;i<8;i++){
   const a=i*6.283/8;
   const piece=part(origin,new T.TetrahedronGeometry(.10,0),i%2?pigment.coat:pigment.coatShadow,
     Math.cos(a)*.28,.41,Math.sin(a)*.27);
   billow.push(piece);
 }
 const legs=origin.userData.legs||[];
 g.userData.tick=t=>{
   const gait=t*3.25;
   legs.forEach((leg,i)=>{leg.rotation.x=(i?-.35:.35)*Math.sin(gait+i*Math.PI);leg.position.y=.22+.035*Math.sin(gait+i*Math.PI);});
   arm.rotation.x=-.15+.10*Math.sin(gait-.66);arm.rotation.z=.10*Math.sin(gait-.31);
   origin.rotation.z=.045*Math.sin(gait-.44);
   origin.userData.scarf.rotation.x=-.18+.11*Math.sin(gait-.85);
   billow.forEach((v,i)=>{v.rotation.x=.10*Math.sin(gait*.52-i*.22);});
   flashlight.userData.tick(t,1/60);
 };
 return finish(g,.34);
}

export function puddles(seed=1){
 const rng=rand(seed),g=new T.Group();g.name='Лужи с мокрыми отражениями';
 const water=new T.MeshStandardMaterial({color:'#567f81',metalness:.35,roughness:.17,transparent:true,opacity:.82,depthWrite:false,side:T.DoubleSide});
 const reflections=new T.MeshBasicMaterial({color:'#ded5af',transparent:true,opacity:.32,depthWrite:false,side:T.DoubleSide});
 const ripples=[];
 for(let i=0;i<7;i++){
   const x=(rng()-.5)*4.7,z=(rng()-.5)*4.8,s=.35+rng()*.51;
   const shape=new T.Shape();
   for(let j=0;j<15;j++){const a=j*6.283/15,r=s*(.79+rng()*.41),px=Math.cos(a)*r,pz=Math.sin(a)*r*.76;
    if(j===0)shape.moveTo(px,pz);else shape.lineTo(px,pz);
   }shape.closePath();
   const p=part(g,new T.ShapeGeometry(shape),water,x,.024,z);p.rotation.x=-Math.PI/2;p.castShadow=false;
   for(let k=0;k<2;k++){
     const stripe=part(g,new T.PlaneGeometry(s*.30,s*.07),reflections,x-.2*s+k*.18*s,.031,z+(k-.5)*s*.21);
     stripe.rotation.x=-Math.PI/2;stripe.rotation.z=(rng()-.5)*.18;stripe.castShadow=false;
   }
   const ring=part(g,new T.RingGeometry(.25,.264,25),pigment.ripple.clone(),x,.038,z);
   ring.rotation.x=-Math.PI/2;ring.scale.setScalar(s);ring.castShadow=false;ripples.push({ring,phase:rng()*1.5});
 }
 g.userData.tick=t=>ripples.forEach(({ring,phase})=>{const p=(t*.42+phase)%1;ring.scale.setScalar(.26+p*.68);ring.material.opacity=.27*(1-p);});
 return finish(g,0);
}

export function whiteClinicBuilding(seed=1){
 const rng=rand(seed),g=new T.Group();g.name='Заброшенная станция с красным навесом';
 const white=new T.MeshStandardMaterial({color:'#d5d3bb',roughness:1}),shadow=new T.MeshStandardMaterial({color:'#a4a89b',roughness:1});
 const red=new T.MeshStandardMaterial({color:'#aa625f',roughness:.88}),windowMat=new T.MeshStandardMaterial({color:'#445f60',roughness:.20});
 const wood=new T.MeshStandardMaterial({color:'#736b59',roughness:1}),light=new T.MeshBasicMaterial({color:'#e1c59a'});
 block(g,6.65,.20,2.8,pigment.wood,0,.10,0);
 block(g,6.4,2.25,2.6,white,0,1.30,0);
 block(g,6.73,.21,2.96,shadow,0,2.48,0);
 for(const s of [-1,1])block(g,6.7,.25,.13,pigment.iron,0,2.62,s*1.46);
 for(let i=0;i<7;i++){
   const x=-2.7+i*.90;
   block(g,.52,.79,.038,windowMat,x,1.40,1.32);
   block(g,.58,.083,.14,shadow,x,1.86,1.37);
   block(g,.07,.85,.06,pigment.wood,x,1.39,1.357);
   block(g,.37,.08,.08,shadow,x,1.01,1.35);
 }
 block(g,1.08,1.65,.09,pigment.iron,-.05,.94,1.38);
 for(const s of [-1,1])rod(g,[s*.56,.17,1.37],[s*.56,2.12,1.37],.042,wood);
 const awning=block(g,2.60,.095,1.0,red,-.05,2.05,1.8);awning.rotation.x=-.16;
 for(let i=0;i<5;i++)block(g,.14,.078,.19,pigment.brass,-1.17+i*.56,1.99,2.31);
 for(let i=0;i<13;i++){
  const x=-2.98+i*.45,z=1.33+(rng()-.5)*.15;
  const vine=rod(g,[x,0,z],[x+.08,.55+rng()*.42,z+.05],.013,pigment.wood);
  vine.rotation.z=(rng()-.5)*.06;
  if(i%2)part(g,new T.IcosahedronGeometry(.09+rng()*.06,0),pigment.coat,x,.38,z+.08);
 }
 const windowGlow=block(g,.42,.60,.025,light,1.80,1.42,1.354);
 g.userData.tick=t=>{windowGlow.scale.x=.96+.04*Math.sin(t*.73);};
 return finish(g,2.6);
}


export function nightRainGrade(seed=1){
 const rng=rand(seed),g=new T.Group();g.name='Ночь под холодным дождём';
 const washes=[];
 const colors=['#637d80','#72838a','#455c65','#6f8584','#81989a'];
 for(let i=0;i<11;i++){
  const w=1.5+rng()*2.1,h=.65+rng()*1.5;
  const mat=new T.MeshBasicMaterial({color:colors[i%colors.length],transparent:true,opacity:.055,depthWrite:false,side:T.DoubleSide});
  const o=part(g,new T.PlaneGeometry(w,h),mat,(rng()-.5)*3.6,.55+rng()*1.55,-1.35-rng()*.40);
  o.rotation.y=(rng()-.5)*.35;o.castShadow=false;washes.push({o,mat,offset:i*.49});
 }
 for(let i=0;i<14;i++){
  const s=.15+rng()*.4;
  const m=part(g,new T.PlaneGeometry(s*.6,s*1.8),new T.MeshBasicMaterial({color:'#b7c7be',transparent:true,opacity:.08,depthWrite:false,side:T.DoubleSide}),(rng()-.5)*5,.015,(rng()-.5)*4.2);
  m.rotation.x=-Math.PI/2;m.rotation.z=(rng()-.5)*.4;m.castShadow=false;
 }
 g.userData.tick=t=>washes.forEach(({o,mat,offset})=>{o.rotation.y=.06*Math.sin(t*.31-offset);mat.opacity=.046+.018*Math.sin(t*.20-offset);});
 return finish(g,0);
}

export function boatWake(seed=1){
 const rng=rand(seed),g=new T.Group();g.name='Пенный след за лодкой';
 const wash=[],bubbles=[];
 const foam=new T.MeshBasicMaterial({color:'#d6e3dc',transparent:true,opacity:.52,depthWrite:false});
 for(const side of [-1,1]){
  for(let i=0;i<8;i++){
   const depth=.28+i*.33,x=side*(.38+depth*.30);
   const pts=[new T.Vector3(side*.41,.03,-.35-depth*.3),
     new T.Vector3(x*.8,.045,-.55-depth*.5),
     new T.Vector3(x,.026,-1.0-depth)];
   const curve=new T.CatmullRomCurve3(pts);
   const geom=new T.TubeGeometry(curve,12,.015+rng()*.012,5,false);
   const mat=foam.clone();mat.opacity=.24+rng()*.27;
   const o=part(g,geom,mat);o.castShadow=false;wash.push({o,mat,phase:i*.27+(side>0?.31:0)});
  }
 }
 for(let i=0;i<22;i++){
  const x=(rng()-.5)*2.1,z=-.9-rng()*3.4;
  const o=part(g,new T.IcosahedronGeometry(.024+rng()*.029,0),pigment.blue,x,.038,z);
  o.castShadow=false;bubbles.push({o,phase:rng()*6.28});
 }
 const rings=[];
 for(const s of [-1,1])for(let i=0;i<4;i++){
   const o=part(g,new T.TorusGeometry(.17+i*.045,.012,4,24),pigment.ripple.clone(),s*.7,.02,-.6-i*.7);
   o.rotation.x=-Math.PI/2;o.castShadow=false;rings.push({o,phase:i*.21+s*.07});
 }
 g.userData.tick=t=>{
  wash.forEach(({o,mat,phase})=>{o.scale.x=1+.04*Math.sin(t*1.48-phase);mat.opacity=.16+.19*(.5+.5*Math.sin(t*1.7-phase));});
  bubbles.forEach(({o,phase})=>{o.position.y=.043+.024*Math.sin(t*1.4-phase);o.scale.setScalar(.7+.3*Math.sin(t*1.6+phase));});
  rings.forEach(({o,phase})=>{const u=(t*.62+phase)%1;o.scale.setScalar(.5+u*.9);o.material.opacity=.46*(1-u);});
 };
 return finish(g,0);
}

export function shoreFoamLine(seed=1){
 const rng=rand(seed),g=new T.Group();g.name='Живой прибой на неровном берегу';
 const bands=[];
 for(let layer=0;layer<4;layer++){
   const count=36,positions=new Float32Array(count*2*3),base=[];
   for(let i=0;i<count;i++){
     const z=-3.1+i*6.2/(count-1),shore=.62*Math.sin(z*.74)+.21*Math.sin(z*2.37+.2)+.07*Math.sin(z*5.1);
     const phase=z*.6+layer*.38,near=shore+layer*.14,far=near+.06+.04*rng();
     base.push({z,near,far,phase});
     const j=i*6;positions.set([near,.018+layer*.004,z,far,.021+layer*.004,z],j);
   }
   const indices=[];
   for(let i=0;i<count-1;i++){const j=i*2;indices.push(j,j+1,j+2,j+1,j+3,j+2);}
   const geom=new T.BufferGeometry();geom.setAttribute('position',new T.BufferAttribute(positions,3));geom.setIndex(indices);geom.computeVertexNormals();
   const mat=new T.MeshBasicMaterial({color:layer===0?'#efece2':'#a7c9c3',transparent:true,opacity:.24-layer*.037,depthWrite:false,side:T.DoubleSide});
   const mesh=part(g,geom,mat);mesh.castShadow=false;bands.push({geom,mat,base,layer});
 }
 for(let i=0;i<20;i++){
   const z=(rng()-.5)*6,shore=.62*Math.sin(z*.74)+.21*Math.sin(z*2.37+.2);
   const o=part(g,new T.SphereGeometry(.025+rng()*.045,7,6),pigment.blue,shore+(rng()-.5)*.44,.05,z);
   o.scale.y=.17;o.castShadow=false;
 }
 g.userData.tick=t=>{
   for(const {geom,mat,base,layer} of bands){
     const pos=geom.attributes.position;
     for(let i=0;i<base.length;i++){
       const q=base[i],drift=.04*Math.sin(t*.85-q.phase-layer*.24);
       pos.setX(i*2,q.near+drift);pos.setX(i*2+1,q.far+drift+.025*Math.sin(t*1.1-q.z));
     }
     pos.needsUpdate=true;mat.opacity=.15+.11*Math.sin(t*.45-layer*.28+1.7)**2;
   }
 };
 return finish(g,0);
}

export function autumnConeTrees(seed=1){
 const rng=rand(seed),g=new T.Group();g.name='Осенние конусные деревья INK';
 const shades=['#b78a61','#c5ac69','#607e74','#b79496','#9da78a'];
 const trunks=new T.MeshStandardMaterial({color:'#736b59',roughness:1}),crowns=[];
 for(let i=0;i<5;i++){
  const tree=new T.Group();tree.position.set(-2+i*.98,0,(rng()-.5)*.7);g.add(tree);
  const h=1.58+rng()*.95,shade=new T.MeshStandardMaterial({color:shades[i],roughness:1,flatShading:true});
  const trunk=rod(tree,[0,0,0],[0,h*.80,0],.085,trunks,.058);
  const crown=new T.Group();tree.add(crown);
  for(let k=0;k<3;k++){
   const mid=h*(.57+k*.21),w=.49-k*.11+rng()*.05;
   const o=part(crown,new T.ConeGeometry(w,h*.50-k*.085,7,2),shade,0,mid,0);
   o.rotation.y=rng()*.75;o.rotation.z=(rng()-.5)*.06;
   for(let j=0;j<3;j++){
     const a=(k*3+j)*6.283/9,r=w*.8;
     part(crown,new T.TetrahedronGeometry(.055+rng()*.035),shade,r*Math.cos(a),mid-.16,r*Math.sin(a));
   }
  }
  const leaflets=[];
  for(let j=0;j<5;j++){
   const leaf=part(tree,new T.TetrahedronGeometry(.032+rng()*.03,0),shade,(rng()-.5)*.9,.3+rng()*h,(rng()-.5)*.75);
   leaflets.push({leaf,phase:rng()*4,height:leaf.position.y});
  }
  crowns.push({crown,leaflets,phase:i*.29+rng()*.36});
 }
 g.userData.tick=t=>crowns.forEach(({crown,leaflets,phase})=>{
    crown.rotation.z=.035*Math.sin(t*.62-phase);crown.rotation.x=.027*Math.sin(t*.51-phase-.35);
    leaflets.forEach(({leaf,height,phase:i})=>{leaf.position.y=.14+((height-.14-t*.12+i)%2.9+2.9)%2.9;leaf.rotation.y=t*.24+i;});
 });
 return finish(g,.40);
}

export function boatShed(seed=1){
 const rng=rand(seed),g=new T.Group();g.name='Прибрежный лодочный сарай';
 const timber=new T.MeshStandardMaterial({color:'#736b59',roughness:1}),dark=new T.MeshStandardMaterial({color:'#4a5d53',roughness:1}),roof=new T.MeshStandardMaterial({color:'#728e72',roughness:.91}),stripe=new T.MeshStandardMaterial({color:'#ad6e61',roughness:.9});
 const floor=block(g,3.6,.18,3.2,timber,0,.13,0);
 for(const s of [-1,1])for(const z of [-1.3,1.3])rod(g,[s*1.57,.14,z],[s*1.52,2.6,z],.10,timber);
 for(let i=0;i<8;i++){
  const z=-1.45+i*.40;
  block(g,.08,1.93,.20,timber,-1.62,1.14,z);
  block(g,.08,1.93,.20,timber,1.62,1.14,z);
  if(i%2===0)rod(g,[-1.6,.6,z],[-1.6,1.77,z+.24],.024,dark);
 }
 for(const s of [-1,1]){
  const slope=block(g,2.15,.15,3.63,roof,s*.92,2.74,0);
  slope.rotation.z=-s*.34;
  const lip=block(g,2.0,.10,3.75,stripe,s*1.01,2.31,0);lip.rotation.z=-s*.34;
 }
 for(let i=0;i<10;i++){
  const x=(i%5)*.68-1.36,z=-1.34+Math.floor(i/5)*2.68;
  block(g,.62,.027,.14,dark,x,.28,z);
 }
 for(const s of [-1,1]){
  block(g,1.21,.09,.5,dark,s*1.05,1.18,-1.16);
  for(let i=0;i<3;i++){
   const x=s*(.70+i*.30);
   const crate=block(g,.27,.25,.33,timber,x,.98,-1.09);
   for(let k=0;k<2;k++)block(g,.028,.25,.34,pigment.brass,x+(k?-.08:.08),.98,-1.07);
  }
 }
 for(let i=0;i<6;i++)rod(g,[-1.30+i*.14,.3,.98],[-.94+i*.13,1.63,1.40],.027,timber);
 const bell=part(g,new T.CylinderGeometry(.11,.17,.24,9),pigment.brass,1.20,2.08,1.53);
 const lantern=part(g,new T.SphereGeometry(.10,10,7),pigment.warm,-1.10,1.82,1.56);
 for(let i=0;i<6;i++){
  const a=i*6.283/6;
  rod(g,[1.27,1.8,1.31],[1.27+Math.cos(a)*.09,1.64,1.31+Math.sin(a)*.09],.016,pigment.wood);
 }
 g.userData.tick=t=>{lantern.scale.setScalar(.98+.025*Math.sin(t*.46));bell.rotation.z=.011*Math.sin(t*.41);};
 g.userData.interact={radius:2.1,effect:'save',label_ru:'Сохранить лодку и путь'};
 return finish(g,1.90);
}

export function driftingLeaves(seed=1){
 const rng=rand(seed),g=new T.Group();g.name='Плывущие осенние листья';
 const mats=['#c5ac69','#bd7c69','#9c9b8e','#ad8767','#8c8270'].map(color=>new T.MeshStandardMaterial({color,roughness:1,side:T.DoubleSide}));
 const leaves=[];
 for(let i=0;i<27;i++){
   const leaf=new T.Group();leaf.position.set((rng()-.5)*5.6,.055,(rng()-.5)*4.8);g.add(leaf);
   const w=.05+rng()*.065,l=.12+rng()*.12;
   const s=new T.Shape();s.moveTo(0,-l/2);s.bezierCurveTo(-w,-l*.3,-w,l*.30,0,l*.5);s.bezierCurveTo(w,l*.2,w,-l*.24,0,-l/2);
   const body=part(leaf,new T.ShapeGeometry(s),mats[i%mats.length]);
   body.rotation.x=-Math.PI/2;
   rod(leaf,[0,.013,-l*.54],[0,.022,l*.31],.004,pigment.wood);
   const mid=part(leaf,new T.TetrahedronGeometry(.011,0),mats[(i+2)%mats.length],0,.02,0);
   leaves.push({leaf,originX:leaf.position.x,originZ:leaf.position.z,phase:rng()*6.28,speed:.014+rng()*.022});
 }
 g.userData.tick=t=>leaves.forEach(({leaf,originX,originZ,phase,speed})=>{
    leaf.position.x=originX+.21*Math.sin(t*.34+phase);
    leaf.position.z=originZ+speed*t+.18*Math.sin(t*.18+phase*.8);
    leaf.position.y=.052+.018*Math.sin(t*.58+phase);
    leaf.rotation.y=.25*Math.sin(t*.39+phase);
    leaf.rotation.x=.09*Math.sin(t*.62+phase-.4);
 });
 return finish(g,0);
}


export function sandBeachTiles(seed=1){
 const rng=rand(seed),g=new T.Group();g.name='Неровный акварельный берег';
 const sand=new T.MeshStandardMaterial({color:'#d5c3a0',roughness:1,side:T.DoubleSide});
 const dark=new T.MeshStandardMaterial({color:'#b1aa8e',roughness:1,side:T.DoubleSide});
 const grass=new T.MeshStandardMaterial({color:'#7d937d',roughness:1,side:T.DoubleSide});
 const stones=['#91a18b','#a89e83','#839487'].map(color=>new T.MeshStandardMaterial({color,roughness:1}));
 const shore=new T.Shape(),n=50;
 for(let i=0;i<n;i++){
  const a=i*Math.PI*2/n,r=2.45+.22*Math.sin(a*3+.3)+.12*Math.sin(a*8+1.6)+(rng()-.5)*.15;
  const x=Math.cos(a)*r,z=Math.sin(a)*r*.88;
  if(i===0)shore.moveTo(x,z);else shore.lineTo(x,z);
 }shore.closePath();
 const bed=part(g,new T.ShapeGeometry(shore),sand,0,.035,0);bed.rotation.x=-Math.PI/2;bed.castShadow=false;bed.receiveShadow=true;
 for(let i=0;i<9;i++){
  const x=(rng()-.5)*3.3,z=(rng()-.5)*2.8,s=.25+rng()*.43;
  const p=part(g,new T.CircleGeometry(s,11),i%3?dark:grass,x,.037,z);
  p.rotation.x=-Math.PI/2;p.scale.y=.45+rng()*.25;p.castShadow=false;
 }
 for(let i=0;i<36;i++){
   const a=rng()*Math.PI*2,r=.12+rng()*2.1;
   const x=Math.cos(a)*r,z=Math.sin(a)*r*.87;
   const pebble=part(g,new T.IcosahedronGeometry(.026+rng()*.046,0),stones[i%stones.length],x,.04,z);
   pebble.scale.y=.4;pebble.rotation.y=rng()*3.14;
 }
 const grasses=[];
 for(let i=0;i<14;i++){
   const a=rng()*Math.PI*2,r=1.5+rng()*.7,patch=new T.Group();
   patch.position.set(Math.cos(a)*r,0,Math.sin(a)*r*.9);g.add(patch);
   for(let k=0;k<4;k++){
     const x=(k-1.5)*.055,z=(rng()-.5)*.05;
     rod(patch,[x,.03,z],[x+.08*(rng()-.5),.17+rng()*.14,z+.08*(rng()-.5)],.01,grass,.004);
   }
   grasses.push({patch,phase:i*.31});
 }
 for(let i=0;i<4;i++){
   const a=.5+i*.42;
   rod(g,[1.3*Math.cos(a),.06,1.1*Math.sin(a)],[1.67*Math.cos(a),.08,1.4*Math.sin(a)],.016,pigment.wood);
 }
 g.userData.tick=t=>grasses.forEach(({patch,phase})=>{patch.rotation.z=.03*Math.sin(t*.59-phase);});
 return finish(g,0);
}

export function tiltShiftPost(seed=1){
 const g=new T.Group();g.name='Миниатюрная глубина резкости';
 const q=part(g,new T.PlaneGeometry(1.65,1.05),
   new T.MeshBasicMaterial({color:'#d5d3bb',transparent:true,opacity:.04,depthWrite:false,side:T.DoubleSide}),0,.64,0);
 q.castShadow=false;
 const vs='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}';
 const fs=[
 'precision mediump float;',
 'varying vec2 vUv;',
 'uniform sampler2D tDiffuse;',
 'uniform vec2 uTexel;',
 'uniform float uStrength;',
 'uniform float uFocus;',
 'uniform float uLowPower;',
 'void main(){',
 'vec4 base=texture2D(tDiffuse,vUv);',
 'float d=smoothstep(.13,.47,abs(vUv.y-uFocus));',
 'vec2 off=uTexel*(.30+uStrength*4.5)*d*d;',
 'vec4 col=base*.28;',
 'col+=texture2D(tDiffuse,vUv+vec2(off.x,0.0))*.12;',
 'col+=texture2D(tDiffuse,vUv-vec2(off.x,0.0))*.12;',
 'col+=texture2D(tDiffuse,vUv+vec2(0.0,off.y))*.12;',
 'col+=texture2D(tDiffuse,vUv-vec2(0.0,off.y))*.12;',
 'col+=texture2D(tDiffuse,vUv+off*.76)*.06;',
 'col+=texture2D(tDiffuse,vUv-off*.76)*.06;',
 'col+=texture2D(tDiffuse,vUv+vec2(off.x,-off.y)*.76)*.06;',
 'col+=texture2D(tDiffuse,vUv+vec2(-off.x,off.y)*.76)*.06;',
 'gl_FragColor=mix(base,col,mix(.65,1.0,uLowPower)*d);',
 '}'].join('\n');
 const mat=new T.ShaderMaterial({uniforms:{tDiffuse:{value:null},uTexel:{value:new T.Vector2(1/900,1/600)},uStrength:{value:1.0},uFocus:{value:.48},uLowPower:{value:1.0}},
   vertexShader:vs,fragmentShader:fs,depthTest:false,depthWrite:false});
 g.userData.makeMaterial=()=>mat;g.userData.focus=.48;
 g.userData.tick=t=>{q.rotation.z=.012*Math.sin(t*.33);mat.uniforms.uStrength.value=.86+.10*Math.sin(t*.12);};
 return finish(g,0);
}

export function dayCoastGrade(seed=1){
 const rng=rand(seed),g=new T.Group();g.name='Яркий акварельный день на берегу';
 const rays=[],tints=['#b7dfd5','#e7d4ac','#d9e9d0','#b1c8ad'];
 for(let i=0;i<7;i++){
  const mat=new T.MeshBasicMaterial({color:tints[i%tints.length],transparent:true,opacity:.077,depthWrite:false,side:T.DoubleSide});
  const o=part(g,new T.PlaneGeometry(.34+i*.16,2.3+rng()*.43),mat,-2.2+i*.63,1.29,-1.6);
  o.rotation.z=-.24+(i-3)*.055;o.rotation.y=(rng()-.5)*.24;o.castShadow=false;rays.push({o,mat,phase:i*.3});
 }
 for(let i=0;i<10;i++){
   const x=(rng()-.5)*5.5,z=(rng()-.5)*3.5;
   const o=part(g,new T.PlaneGeometry(.38+rng()*.5,.08+rng()*.14),
     new T.MeshBasicMaterial({color:'#e1efe6',transparent:true,opacity:.15,depthWrite:false,side:T.DoubleSide}),x,.035,z);
   o.rotation.x=-Math.PI/2;o.rotation.z=rng()*.6;o.castShadow=false;
 }
 g.userData.tick=t=>rays.forEach(({o,mat,phase})=>{o.rotation.y=.04*Math.sin(t*.35-phase);mat.opacity=.052+.035*Math.sin(t*.18-phase+.8)**2;});
 g.userData.grade={sky:'#a8d0c7',water:'#79b2b1',sand:'#d5c3a0',sun:'#f1dbb1'};
 return finish(g,0);
}

export const makers={carHeadlights,handFlashlight,rowingHealer,rainSplashRings,townRoad,wetGrassClumps,roadsideDryShrubs,pinkTownBuilding,duskTownLight,healerWalkWithLight,puddles,whiteClinicBuilding,nightRainGrade,boatWake,shoreFoamLine,autumnConeTrees,boatShed,driftingLeaves,sandBeachTiles,tiltShiftPost,dayCoastGrade};

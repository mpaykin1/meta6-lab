import * as T from 'three';
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
 g.userData.mount={vehicle:'car',front:'-z',at:[0,0,0]};
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
 };
 return finish(g,.34);
}

export function rainSplashRings(seed=1){
 const random=rand(seed),g=new T.Group();g.name='Дождевые кольца';
 const rings=[],drops=[];
 for(let i=0;i<25;i++){
  const x=(random()-.5)*5.6,z=(random()-.5)*5.5;
  const r=.09+.13*random();
  const mesh=part(g,new T.TorusGeometry(1,.018,4,28),pigment.ripple.clone(),x,.024,z);
  mesh.rotation.x=-Math.PI/2;mesh.scale.setScalar(r);
  mesh.castShadow=false;
  rings.push({mesh,origin:(i/25)*2.6,duration:.68+.45*random(),radius:.06+.16*random()});
  const spray=part(g,new T.ConeGeometry(.017,.16,5),pigment.blue,x,.10,z);
  spray.castShadow=false;drops.push({spray,phase:random()*6.283});
 }
 const points=68;const pos=new Float32Array(points*3);
 for(let i=0;i<points;i++){pos[3*i]=(random()-.5)*5.6;pos[3*i+1]=.6+random()*3.5;pos[3*i+2]=(random()-.5)*5.5;}
 const initialY=Array.from({length:points},(_,i)=>pos[i*3+1]);const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3));
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
export const makers={carHeadlights,handFlashlight,rowingHealer,rainSplashRings};

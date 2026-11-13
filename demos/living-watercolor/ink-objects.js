import * as T from 'three';
import {deformGeometryOrganic,createSemanticStroke,createWatercolorHouse,createWatercolorTree} from './shared/living-watercolor-generators.js';

// Actual volume in every view; the accepted INK shader stays in its original module.
const ink='#272c30';
const materials=new Map();
function mat(color){if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color,roughness:1}));return materials.get(color);}
function mesh(g,geo,color,p=[0,0,0],s=[1,1,1],outline=true){const o=new T.Mesh(geo,mat(color));o.position.set(...p);o.scale.set(...s);o.userData.watercolorOutline=outline;g.add(o);return o;}
function box(g,size,color,p,rot=0){const o=mesh(g,new T.BoxGeometry(...size),color,p);o.rotation.y=rot;return o;}
function stroke(g,pts,r=.014,color=ink,opacity=.65){const o=createSemanticStroke(T,pts.map(p=>new T.Vector3(...p)),{color,radius:r,opacity});g.add(o);return o;}
function beam(g,a,b,r,color){const av=new T.Vector3(...a),bv=new T.Vector3(...b);const o=mesh(g,new T.CylinderGeometry(r*.82,r,av.distanceTo(bv),7),color);o.position.copy(av).add(bv).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),bv.sub(av).normalize());return o;}
export function fir(seed=1){
  const g=new T.Group();g.name='Ель';
  mesh(g,new T.CylinderGeometry(.065,.15,2.4,7),'#736b59',[0,1.2,0]);
  for(let i=0;i<3;i++){
    const geo=deformGeometryOrganic(T,new T.ConeGeometry(1.04-i*.23,1.65-i*.15,9,3),{seed:seed+i,amount:.10,vertical:.5});
    mesh(g,geo,['#607e74','#789180','#91a18b'][i],[Math.sin(seed+i)*.06,1.25+i*.61,0]);
  }
  return g;
}
export function birch(seed=1){
  const g=createWatercolorTree(T,{seed:'ink-birch:'+seed,ink,wash:'#c5ac69'});g.name='Берёза';
  g.children[0].material=mat('#d5d3bb');g.children[0].scale.set(.44,1.10,.44);
  for(let i=0;i<8;i++){const a=i*2.3;stroke(g,[[Math.cos(a)*.16,.24+i*.27,Math.sin(a)*.16],[Math.cos(a+.5)*.17,.28+i*.27,Math.sin(a+.5)*.17]],.019,ink,.8);}
  g.scale.setScalar(.83);return g;
}
export function shelter(){
  const g=createWatercolorHouse(T,{seed:'ink-rain-hut',ink,wash:'#bd7c69'});g.name='Лесной домик';
  g.children.find(o=>o.name==='house-roof').material=mat('#587879');
  g.children.find(o=>o.name==='house-chimney').material=mat('#9c9b8e');
  box(g,[3.0,.16,2.8],'#918872',[0,.02,.30]);
  box(g,[1.15,.15,.32],'#a89a80',[-.58,.03,1.86]);
  for(let x=-1.23;x<1.3;x+=.31)stroke(g,[[x,.14,1.08],[x,1.64,1.08]],.010,ink,.31);
  for(let y=.25;y<1.65;y+=.22)stroke(g,[[-1.26,y,1.09],[1.26,y,1.09]],.009,ink,.24);
  const win=g.children.find(o=>o.name==='house-window');win.material=new T.MeshBasicMaterial({color:'#e6c475'});win.userData.watercolorSkipWash=true;
  const l=lantern();l.scale.setScalar(.53);l.position.set(-1.03,1.18,1.28);g.add(l);
  return g;
}
export function traveller(){
  const g=new T.Group();g.name='Путник';
  const left=box(g,[.16,.39,.23],'#414f50',[-.14,.22,0]);
  const right=box(g,[.16,.39,.23],'#414f50',[.14,.22,0]);
  mesh(g,new T.CylinderGeometry(.20,.40,.70,9),'#b25d51',[0,.72,0]);
  mesh(g,new T.SphereGeometry(.245,12,8),'#d5b895',[0,1.21,.015]);
  const hood=mesh(g,new T.SphereGeometry(.29,12,8,0,Math.PI*2,0,Math.PI*.62),'#b25d51',[0,1.29,-.025]);hood.rotation.x=-.38;
  box(g,[.39,.48,.22],'#8c8060',[0,.79,-.30]);
  for(const x of [-.29,.29])beam(g,[x,.96,0],[x*1.3,.54,.08],.085,'#b25d51');
  const scarf=box(g,[.16,.06,.55],'#c99b67',[.10,1.025,-.25]);scarf.rotation.x=-.18;
  const lamp=lantern();lamp.scale.setScalar(.46);lamp.position.set(.41,.28,.14);g.add(lamp);
  g.userData.legs=[left,right];g.userData.scarf=scarf;return g;
}
export function lantern(){
  const g=new T.Group();g.name='Фонарь';
  const glass=mesh(g,new T.CylinderGeometry(.16,.16,.31,8),'#e5bf71',[0,.28,0]);glass.material=new T.MeshBasicMaterial({color:'#e6bc69'});glass.userData.watercolorSkipWash=true;
  for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;beam(g,[Math.cos(a)*.16,.12,Math.sin(a)*.16],[Math.cos(a)*.16,.44,Math.sin(a)*.16],.018,ink);}
  mesh(g,new T.CylinderGeometry(.20,.22,.07,8),'#4f6160',[0,.09,0]);
  mesh(g,new T.ConeGeometry(.25,.17,8),'#4f6160',[0,.53,0]);
  const h=mesh(g,new T.TorusGeometry(.13,.017,5,14,Math.PI),'#414c4b',[0,.65,0]);h.userData.watercolorOutline=false;
  return g;
}
export function sign(){
  const g=new T.Group();g.name='Указатель';beam(g,[0,0,0],[.035,1.65,0],.07,'#81785f');
  box(g,[1.10,.27,.14],'#b3a080',[.09,1.35,0],-.08);
  box(g,[.85,.23,.14],'#c3ae87',[-.10,1.02,0],.12);
  stroke(g,[[-.27,1.36,.09],[.40,1.36,.09],[.26,1.43,.09]],.018,ink,.8);
  stroke(g,[[.19,1.02,.10],[-.36,1.02,.10],[-.23,1.09,.10]],.016,ink,.8);return g;
}
export function bench(){
  const g=new T.Group();g.name='Скамейка';
  for(const x of [-.65,.65])for(const z of [-.22,.22])beam(g,[x,0,z],[x,.52,z],.055,'#626d65');
  for(let i=0;i<3;i++)box(g,[1.68,.095,.15],'#ab9977',[0,.55,-.19+i*.19]);
  for(const x of [-.64,.64])beam(g,[x,.40,-.25],[x,1.07,-.32],.047,'#626d65');
  for(let i=0;i<2;i++)box(g,[1.68,.15,.07],'#ab9977',[0,.80+i*.20,-.30]);return g;
}
export function rock(seed=1){const g=new T.Group();g.name='Камни';for(let i=0;i<3;i++){const geo=deformGeometryOrganic(T,new T.DodecahedronGeometry(.50-i*.12,1),{seed:seed+i,amount:.09});mesh(g,geo,['#81969a','#98a69c','#b4b6a7'][i],[(i-1)*.48,.21-i*.035,Math.sin(i*4)*.22],[1,.67,1]);}return g;}
export function mushrooms(){
  const g=new T.Group();g.name='Грибы';
  for(let i=0;i<3;i++){const x=(i-1)*.42,z=Math.sin(i*4)*.2,h=.35+i*.12;
    beam(g,[x,0,z],[x+.04,h,z],.045,'#d1c7a5');
    mesh(g,new T.SphereGeometry(.22+i*.035,12,7,0,Math.PI*2,0,Math.PI/2),'#b46e5a',[x+.04,h,z],[1,.50,1]);}
  return g;
}
export function bridge(){
  const g=new T.Group();g.name='Мостик';
  for(let i=0;i<11;i++){const z=(i-5)*.24,y=.16+.22*Math.cos(z/1.3);box(g,[1.6,.11,.21],i%2?'#a69a7a':'#93896f',[0,y,z]);}
  for(const x of [-.83,.83]){for(const z of [-1.2,0,1.2])beam(g,[x,0,z],[x,.98,z],.055,'#6c786a');stroke(g,[[x,.89,-1.2],[x,1.07,0],[x,.89,1.2]],.036,'#6c786a',.9);}
  return g;
}
export const objectMakers={fir,birch,shelter,traveller,lantern,sign,bench,rock,mushrooms,bridge};

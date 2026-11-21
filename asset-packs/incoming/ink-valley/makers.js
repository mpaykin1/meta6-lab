// INK valley additions. 12 original assets; immutable reference renderer is reused in the scene.
// Makers are deterministic, have real geometry, and expose animation/interactions to the host game.
import * as T from 'three';

const MAT=new Map();
function material(color){if(!MAT.has(color))MAT.set(color,new T.MeshStandardMaterial({color,roughness:.98,metalness:0,flatShading:true}));return MAT.get(color)}
const R=(s,n)=>{let v=Math.sin(s*137.17+n*827.37)*43758.5453;return v-Math.floor(v)};
const C={ink:'#303c38',stone:'#9c9b8e',moss:'#607e74',fern:'#789180',leaf:'#91a18b',ochre:'#c5ac69',rust:'#bd7c69',bone:'#d5d3bb',dark:'#272c30',wood:'#736b59',water:'#587879',light:'#ccbc97'};
function add(g,geo,color,x=0,y=0,z=0,sx=1,sy=1,sz=1){const m=new T.Mesh(geo,material(color));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;m.userData.watercolorOutline=true;g.add(m);return m}
function box(g,c,x,y,z,w,h,d){return add(g,new T.BoxGeometry(w,h,d),c,x,y,z)}
function ell(g,c,x,y,z,w,h,d){return add(g,new T.IcosahedronGeometry(1,1),c,x,y,z,w,h,d)}
function beam(g,c,a,b,r=.08,seg=7){const u=new T.Vector3(...a),v=new T.Vector3(...b),d=v.clone().sub(u),m=add(g,new T.CylinderGeometry(r*.78,r,d.length(),seg),c,...u.clone().add(v).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m}
function shards(g,c,x,y,z,n,s,seed){for(let i=0;i<n;i++){const a=i*2.399+R(seed,i)*.3,r=s*(.32+.6*R(seed,i+12));const h=s*(.25+.65*R(seed,i+50));const o=add(g,new T.DodecahedronGeometry(.35,0),c,x+Math.cos(a)*r,y+h*.36,z+Math.sin(a)*r,.65*h,h,.65*h);o.rotation.set(R(seed,i+2),a,R(seed,i+4))}}
function pack(name,footprint){const g=new T.Group();g.name=name;g.userData.footprint=footprint;return g}

export function brokenAqueduct(seed=1){
 const g=pack('Разрушенный акведук',1.6);
 for(let bay=0;bay<4;bay++){const x=(bay-1.5)*1.3,h=2.6+R(seed,bay)*.25;
  for(const s of[-1,1]){box(g,C.stone,x+s*.53,h*.44,0,.18,h*.85,.56);box(g,C.ink,x+s*.53,1.45,0,.07,.14,.63);}
  for(let k=0;k<9;k++){const a=Math.PI*k/8,px=x+.54*Math.cos(a),py=h-.53+.55*Math.sin(a);const b=box(g,k%3?C.stone:C.wood,px,py,0,.16,.16,.67);b.rotation.z=-a;}
  for(let j=0;j<3;j++)box(g,C.wood,x,h+.1+j*.16,0,1.27,.12,.69);
  if(bay===0||bay===3)shards(g,C.moss,x,h+.26,.1,5,.32,seed+bay);
 }
 for(let i=0;i<23;i++){const x=(R(seed,i)-.5)*5.1;const b=box(g,i%3?C.stone:C.moss,x,.08,(R(seed,i+30)-.5)*.9,.2,.1,.25);b.rotation.y=R(seed,i+40)*3}
 g.userData.tick=t=>{g.rotation.z=Math.sin(t*.12+seed)*.002};return g;
}

export function reedBank(seed=1){
 const g=pack('Камышовая заводь',0),reeds=[];
 ell(g,C.moss,0,.06,0,1.1,.12,.53);
 for(let i=0;i<33;i++){const x=(R(seed,i)-.5)*2.05,z=(R(seed,i+100)-.5)*.91,h=.6+R(seed,i+200)*1.16;
  const root=new T.Group();root.position.set(x,.05,z);g.add(root);
  beam(root,i%3?C.fern:C.wood,[0,0,0],[0,h,0],.014,5);
  ell(root,i%4?C.wood:C.ochre,0,h+.08,0,.05,.15,.05);
  for(const s of[-1,1]){const leaf=add(root,new T.ConeGeometry(.1,.46,4),i%2?C.leaf:C.moss,s*.14,h*.45,0,.8,.9,.42);leaf.rotation.z=s*.8}
  reeds.push([root,i*1.79]);
 }
 g.userData.tick=t=>reeds.forEach(([b,p],i)=>{b.rotation.z=Math.sin(t*.75+p)*(.055+i%3*.008);b.rotation.x=Math.sin(t*.48+p*.74)*.045});return g;
}

export function ashStag(seed=1){
 const g=pack('Пепельный олень',.68),joints=[];
 ell(g,C.wood,0,1.16,0,.8,.44,.29);ell(g,C.stone,-.35,1.34,0,.37,.37,.29);
 ell(g,C.wood,.66,1.51,0,.27,.33,.22);ell(g,C.bone,.87,1.37,0,.29,.13,.16);
 for(let s of[-1,1]){ell(g,C.rust,.65,1.9,s*.17,.12,.28,.07);ell(g,C.ink,.94,1.56,s*.13,.038,.035,.03)}
 for(let side of[-1,1]){let z=side*.2;
  beam(g,C.bone,[.66,1.76,z],[.57,2.34,z+side*.06],.055);
  for(let j=0;j<5;j++){const h=2.03+j*.18;beam(g,C.bone,[.62-j*.08,h,z+side*.06],[.84-j*.09,h+.26,z+side*(.2+j*.026)],.028-j*.003);}
  for(let row of[-1,1]){let x=row*.54;const pivot=new T.Group();pivot.position.set(x,.93,z);g.add(pivot);
   beam(pivot,C.wood,[0,0,0],[.08*row,-.34,.01],.095);
   beam(pivot,C.stone,[.08*row,-.34,.01],[.04*row,-.75,.02],.065);
   box(pivot,C.ink,.05*row,-.76,.02,.19,.105,.15);joints.push([pivot,row*side]);}
 }
 for(let i=0;i<17;i++){const x=(R(seed,i)-.5)*1.32;const fur=add(g,new T.ConeGeometry(.035,.13,4),i%2?C.moss:C.leaf,x,1.4,(R(seed,i+37)-.5)*.46);fur.rotation.z=(R(seed,i+81)-.5)*1.4}
 const tail=ell(g,C.bone,-.83,1.33,0,.2,.12,.12);
 g.userData.tick=t=>{joints.forEach(([o,s],i)=>o.rotation.z=Math.sin(t*2.05+i*.75)*.17*s);g.position.y=.015*Math.sin(t*4);tail.rotation.z=Math.sin(t*1.45)*.2;g.rotation.y=Math.sin(t*.24+seed)*.06};return g;
}

export function pilgrimageBoat(seed=1){
 const g=pack('Лодка паломника',.85),oars=[];
 for(let k=0;k<11;k++){let z=(k-5)*.18,w=.64*(1-.52*Math.pow(Math.abs(k-5)/5,1.75));
  box(g,k%3===0?C.ink:C.wood,0,.18,z,w*2,.13,.19);
  for(const side of[-1,1]){let b=box(g,k%2?C.wood:C.ochre,side*w*.87,.3,z,.09,.29,.2);b.rotation.z=side*.25}}
 for(let s of[-1,1]){beam(g,C.ink,[s*.72,.46,-.65],[s*.52,.51,.9],.065);for(let i=0;i<9;i++){box(g,C.stone,s*.54,.22,(i-4)*.19,.11,.13,.07)}}
 const pole=beam(g,C.wood,[0,.24,.18],[0,1.5,.18],.05),sail=add(g,new T.PlaneGeometry(.96,.94),C.bone,.43,1,.17);sail.rotation.y=.13;sail.rotation.z=-.12;
 for(const side of[-1,1]){const pivot=new T.Group();pivot.position.set(side*.65,.46,-.14);g.add(pivot);beam(pivot,C.wood,[0,0,0],[side*.95,-.17,.48],.043);ell(pivot,C.wood,side*.99,-.17,.49,.1,.027,.23);oars.push(pivot)}
 for(let k=0;k<12;k++)ell(g,k%2?C.moss:C.ochre,(R(seed,k)-.5)*.74,.37,(R(seed,k+27)-.5)*1.35,.06,.035,.04);
 g.userData.tick=t=>{g.rotation.z=Math.sin(t*.7+seed)*.03;g.position.y=Math.sin(t*1.22)*.08;sail.rotation.y=.1+Math.sin(t*.62)*.2;oars.forEach((o,i)=>o.rotation.x=Math.sin(t*.93+i*.7)*.2)};return g;
}

export function moonBell(seed=1){
 const g=pack('Колокол без часов',1),swing=new T.Group();
 for(const side of[-1,1]){box(g,C.stone,side*.75,1.05,0,.3,2.15,.4);shards(g,C.moss,side*.78,.2,0,6,.22,seed+side*30)}
 beam(g,C.wood,[-.92,2.15,0],[.92,2.15,0],.15);swing.position.y=2.0;g.add(swing);
 add(swing,new T.CylinderGeometry(.14,.45,.9,12,1),C.rust,0,-.55,0);
 add(swing,new T.TorusGeometry(.4,.085,6,16),C.ink,0,-1.02,0).rotation.x=Math.PI/2;
 beam(swing,C.ink,[0,-.69,0],[0,-1.24,0],.035);ell(swing,C.bone,0,-1.24,0,.12,.14,.12);
 for(let k=0;k<8;k++){const a=k*Math.PI/4;box(g,k%2?C.stone:C.ochre,Math.cos(a)*.25,1.63,Math.sin(a)*.24,.15,.07,.14)}
 g.userData.interact={radius:2,effect:'restore_stamina',label_ru:'Звон снимает усталость и разгоняет туман'};
 g.userData.tick=t=>{swing.rotation.z=Math.sin(t*.77+seed)*.25};return g;
}

export function brokenWindmill(seed=1){
 const g=pack('Осенняя мельница',1.1),wheel=new T.Group();
 for(let y=0;y<3;y++){const r=.84-y*.17;add(g,new T.CylinderGeometry(r-.14,r,1,7),y%2?C.stone:C.wood,0,.5+y,0)}
 add(g,new T.ConeGeometry(.8,.95,7),C.ink,0,3.36,0);
 for(let i=0;i<11;i++){const a=R(seed,i)*Math.PI*2,y=.55+R(seed,i+19)*2.5;ell(g,i%3?C.moss:C.fern,Math.cos(a)*(.79-y*.12),y,Math.sin(a)*(.75-y*.1),.12,.17,.14)}
 box(g,C.ink,0,1.05,.78,.43,.92,.13);box(g,C.ochre,-.27,2.15,.67,.22,.31,.13);
 wheel.position.set(0,2.48,.8);g.add(wheel);add(wheel,new T.CylinderGeometry(.21,.21,.3,10),C.wood,0,0,0).rotation.x=Math.PI/2;
 for(let s=0;s<4;s++){let a=s*Math.PI/2;const arm=new T.Group();arm.rotation.z=a;wheel.add(arm);beam(arm,C.wood,[0,0,0],[0,1.34,0],.062);
  for(let j=0;j<5;j++)box(arm,j%2?C.bone:C.ochre,.22+.018*j,.52+j*.17,0,.43,.14,.07)}
 g.userData.tick=t=>wheel.rotation.z=t*.23;return g;
}

const LOW=new T.IcosahedronGeometry(1,0);
export function myceliumBloom(seed=1){
 const g=pack('Грибной хоровод',0),heads=[];
 for(let i=0;i<19;i++){const a=R(seed,i)*Math.PI*2,d=Math.sqrt(R(seed,i+80))*.92,h=.3+R(seed,i+30)*1.02;const root=new T.Group();root.position.set(Math.cos(a)*d,0,Math.sin(a)*d);g.add(root);
  add(root,new T.CylinderGeometry(.04,.07,h,6),C.bone,0,h*.5,0);
  add(root,new T.ConeGeometry(.14+.08*R(seed,i+5),.18,9),i%3?C.rust:C.wood,0,h+.05,0,1,.8,1);
  for(let j=0;j<4;j++){const q=j*Math.PI/2;add(root,LOW,C.bone,.11*Math.cos(q),h+.045,.11*Math.sin(q),.022,.012,.025)}
  heads.push([root,i*.89]);}
 for(let i=0;i<20;i++)add(g,LOW,i%2?C.moss:C.fern,(R(seed,i+123)-.5)*2,.018,(R(seed,i+145)-.5)*2,.08,.03,.12);
 g.userData.tick=t=>heads.forEach(([o,p])=>{o.rotation.z=Math.sin(t*.65+p)*.1;o.rotation.x=Math.sin(t*.51+p)*.08});return g;
}

export function drownedGates(seed=1){
 const g=pack('Затопленные врата',1.3);
 for(let side of[-1,1]){const x=side*.9;for(let k=0;k<7;k++){const y=k*.33;const b=box(g,k%3?C.stone:C.wood,x,y+.16,0,.46,.31,.55);b.rotation.y=(R(seed,k+side*12)-.5)*.08}
  add(g,new T.ConeGeometry(.32,.8,5),C.ink,x,2.6,0);}
 for(let i=0;i<14;i++){const a=Math.PI*i/13,r=.93;const b=box(g,i%4?C.stone:C.ochre,Math.cos(a)*r,2.08+Math.sin(a)*.82,0,.24,.21,.63);b.rotation.z=-a}
 for(let i=0;i<28;i++)ell(g,i%2?C.moss:C.fern,(R(seed,i)-.5)*2.5,.04,(R(seed,i+72)-.5)*.9,.07,.055,.08);
 const rune=ell(g,C.ochre,0,2.45,0,.14,.12,.13);
 g.userData.tick=t=>{rune.scale.setScalar(.12+.012*Math.sin(t*1.5));};return g;
}

export function cogRelic(seed=1){
 const g=pack('Сердце шестерни',0);g.userData.interact={radius:1.3,effect:'reveal_far',label_ru:'Свет древней шестерни отодвигает туман'};
 const wheel=new T.Group();wheel.position.y=.55;g.add(wheel);
 const r=add(wheel,new T.TorusGeometry(.32,.082,8,20),C.rust,0,0,0);
 for(let i=0;i<14;i++){const a=i*Math.PI*2/14;const m=box(wheel,i%2?C.wood:C.stone,Math.cos(a)*.38,Math.sin(a)*.38,0,.15,.12,.12);m.rotation.z=a}
 for(let i=0;i<6;i++){let a=i*Math.PI/3;beam(wheel,C.stone,[0,0,0],[Math.cos(a)*.27,Math.sin(a)*.27,0],.031)}
 add(wheel,new T.IcosahedronGeometry(.12,1),C.ochre,0,0,.01);
 for(let j=0;j<8;j++)ell(g,C.moss,(R(seed,j)-.5)*.65,.03,(R(seed,j+20)-.5)*.65,.12,.06,.11);
 g.userData.tick=t=>{wheel.rotation.z=t*.49;wheel.rotation.y=Math.sin(t*.54)*.27;wheel.position.y=.55+Math.sin(t*1.2)*.07};return g;
}

export function ravenCoven(seed=1){
 const g=pack('Вороны над озером',0),birds=[];
 for(let i=0;i<9;i++){const a=R(seed,i)*6.283,d=.42+R(seed,i+20)*1.1;const b=new T.Group();b.position.set(Math.cos(a)*d,.9+R(seed,i+30)*.65,Math.sin(a)*d);g.add(b);
  ell(b,C.dark,0,0,0,.12,.095,.17);ell(b,C.ink,0,.045,-.13,.09,.085,.1);add(b,new T.ConeGeometry(.042,.12,4),C.ochre,0,.018,-.25).rotation.x=Math.PI/2;
  const wings=[];
  for(const s of[-1,1]){const w=new T.Group();w.position.x=s*.1;b.add(w);
   ell(w,C.dark,s*.18,0,0,.24,.025,.1);for(let k=0;k<4;k++)add(w,new T.ConeGeometry(.026,.17,4),C.ink,s*(.18+k*.08),-.015,0).rotation.z=s*.8;
   wings.push(w);}
  birds.push([b,wings,i*.72,d,a]);}
 g.userData.tick=t=>birds.forEach(([b,wings,p,d,a],i)=>{b.position.x=Math.cos(a+t*.26)*d;b.position.z=Math.sin(a+t*.26)*d;b.position.y=1+Math.sin(t*1.2+p)*.22;wings.forEach((w,j)=>w.rotation.z=(j?1:-1)*Math.sin(t*5+p)*.65);b.rotation.y=a+t*.26});return g;
}

export function paperMoths(seed=1){
 const g=pack('Бумажные мотыльки',0),wings=[];
 for(let i=0;i<16;i++){const b=new T.Group();const a=R(seed,i)*6.28,d=.3+R(seed,i+44)*.9;b.position.set(Math.cos(a)*d,.25+R(seed,i+37)*1.1,Math.sin(a)*d);g.add(b);
  ell(b,C.dark,0,0,0,.018,.035,.02);
  const ww=[];for(let s of[-1,1]){const w=new T.Group();b.add(w);ell(w,i%3?C.rust:C.ochre,s*.07,0,0,.08,.012,.044);ww.push(w)}
  wings.push([b,ww,i*1.83]);}
 g.userData.tick=t=>wings.forEach(([b,w,p])=>{b.position.y=.45+.32*Math.sin(t*.7+p);b.position.x+=.00007*Math.sin(t+p);w.forEach((o,i)=>o.rotation.y=(i?1:-1)*Math.sin(t*7+p)*.95)});return g;
}

export function marshBeacon(seed=1){
 const g=pack('Туманный маяк',.72),lamp=new T.Group();
 for(let k=0;k<9;k++){const y=.22+k*.4,r=.52-k*.029;add(g,new T.CylinderGeometry(r-.028,r,.39,8),k%3?C.stone:C.wood,0,y,0)}
 for(let side=0;side<8;side++){const a=side*Math.PI/4;for(let y=0;y<4;y++){const b=box(g,y%2?C.moss:C.stone,Math.cos(a)*.44,.3+y*.8,Math.sin(a)*.44,.085,.26,.1);b.rotation.y=a}}
 for(let y of[1,2.3,3.1]){const b=box(g,C.ink,0,y,.47,.18,.34,.06);const l=box(g,C.ochre,0,y,.51,.10,.2,.014)}
 lamp.position.y=3.86;g.add(lamp);
 add(lamp,new T.CylinderGeometry(.33,.44,.17,10),C.wood,0,0,0);
 for(let i=0;i<8;i++){const a=i*Math.PI/4;beam(lamp,C.ink,[Math.cos(a)*.3,.09,Math.sin(a)*.3],[Math.cos(a)*.25,.64,Math.sin(a)*.25],.024)}
 ell(lamp,C.ochre,0,.38,0,.23,.27,.22);
 add(lamp,new T.ConeGeometry(.47,.48,10),C.ink,0,.9,0);
 const flag=box(g,C.rust,.3,4.22,0,.5,.2,.025);flag.rotation.z=.1;
 for(let i=0;i<16;i++)ell(g,C.moss,(R(seed,i)-.5)*1.2,.08,(R(seed,i+15)-.5)*1.2,.10,.13,.1);
 g.userData.tick=t=>{lamp.rotation.y=t*.17;flag.rotation.z=.1+Math.sin(t*.9)*.13};return g;
}

export const makers={brokenAqueduct,reedBank,ashStag,pilgrimageBoat,moonBell,brokenWindmill,myceliumBloom,drownedGates,cogRelic,ravenCoven,paperMoths,marshBeacon};

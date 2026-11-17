import * as T from 'three';

// BLACK TRAIN · independent, deterministic pieces for the original night railway.
const ink = new T.MeshStandardMaterial({color:'#14191c',roughness:.91,metalness:.12});
const bark = new T.MeshStandardMaterial({color:'#24292c',roughness:1});
const steel = new T.MeshStandardMaterial({color:'#384145',roughness:.57,metalness:.55});
const soot = new T.MeshStandardMaterial({color:'#090c0f',roughness:1});
const edge = new T.MeshStandardMaterial({color:'#556064',roughness:.72,metalness:.28});
const red = new T.MeshStandardMaterial({color:'#360909',emissive:'#920c12',emissiveIntensity:1.5,roughness:.22,metalness:.1});
const pale = new T.MeshStandardMaterial({color:'#8a9090',emissive:'#cbd8cf',emissiveIntensity:1.3,roughness:.2});
function rng(seed){let s=(seed|0)||1;return()=>((s=(Math.imul(s,1664525)+1013904223)|0)>>>0)/4294967296;}
function add(g,geo,mat,x=0,y=0,z=0){
 const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.userData.watercolorOutline=true;g.add(m);return m;
}
function plank(g,a,b,w,d,mat){
 const v=new T.Vector3(...a),q=new T.Vector3(...b),dif=q.clone().sub(v);
 const m=add(g,new T.BoxGeometry(w,dif.length(),d),mat,...v.clone().add(q).multiplyScalar(.5).toArray());
 m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dif.normalize());
 return m;
}
function tube(g,a,b,r,mat,seg=6){
 const p=new T.Vector3(...a),q=new T.Vector3(...b),dif=q.clone().sub(p);
 const m=add(g,new T.CylinderGeometry(r*.77,r,dif.length(),seg),mat,...p.clone().add(q).multiplyScalar(.5).toArray());
 m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dif.normalize());return m;
}
function cone(g,x,y,z,w,h,material=ink){
 const m=add(g,new T.ConeGeometry(w,h,5),material,x,y,z);return m;
}
function crossingSign(seed=1){
 const r=rng(seed),g=new T.Group();g.name='Гнилой переезд · косой крест';
 g.userData.footprint=.48;
 const post=plank(g,[-.04,-.04,0],[.37,4.4,.07],.25,.3,bark);
 post.rotation.z=.06;
 for(let s of [-1,1]){
  const b=plank(g,[s*-1.05,3.57,.19],[s*1.05,4.68,.19],.21,.17,edge);
  for(let i=0;i<7;i++){
   const x=-.75+i*.25,y=3.75+s*x*.53;
   tube(g,[x,y,.32],[x+.09,y-.09,.32],.012,soot,5);
  }
 }
 for(const y of [.65,1.25,2.65,3.33,4.16]){
  const x=.08+y*.07;
  tube(g,[x-.07,y,.19],[x+.06,y+.03,.19],.026,soot,5);
 }
 for(let i=0;i<9;i++){
  let x=(r()-.5)*.55,y=.2+r()*4;
  add(g,new T.BoxGeometry(.038,.16,.028),soot,x,y,.2);
 }
 add(g,new T.BoxGeometry(.65,.16,.6),soot,.05,.06,0);
 return g;
}
function redSignalLamp(seed=1){
 const g=new T.Group();g.name='Треснувший красный фонарь';
 g.userData.footprint=0;g.userData.interact={radius:40,effect:'warn_train',label_ru:'Предупреждение о поезде'};
 tube(g,[0,0,0],[0,2.95,0],.055,steel);
 add(g,new T.CylinderGeometry(.46,.46,.18,16),steel,0,2.75,.15).rotation.x=Math.PI/2;
 const lens=add(g,new T.SphereGeometry(.37,16,10),red,0,2.75,.31);lens.scale.z=.35;
 for(let a=0;a<7;a++){
  let rad=a*6.28/7;
  tube(g,[Math.cos(rad)*.22,2.75+Math.sin(rad)*.22,.45],
      [Math.cos(rad+1)*.4,2.75+Math.sin(rad+1)*.4,.46],.012,soot,5);
 }
 for(const dx of [-.26,.11,.31]){
  tube(g,[dx,2.66,.47],[dx+.08,2.40-(dx+.2)*.15,.49],.014,edge,5);
 }
 for(let i=0;i<9;i++){
  let a=i*2*Math.PI/9;
  add(g,new T.SphereGeometry(.05,6,4),steel,Math.cos(a)*.43,2.75+Math.sin(a)*.43,.31);
 }
 const light=new T.PointLight('#cc161c',0,12,1.9);light.position.set(0,2.75,.5);g.add(light);
 g.userData.setApproach=(near,t)=>{
   const speed=1.2+near*5.5;
   const flash=Math.sin(t*speed*6.28)>.08?1:.2;
   lens.material.emissiveIntensity=(.45+near*2.5)*flash;
   light.intensity=near*9*flash;
 };
 g.userData.tick=(t,dt)=>g.userData.setApproach(.25,t);
 return g;
}
function hangingChains(seed=1){
 const r=rng(seed),g=new T.Group();g.name='Живая цепь';
 g.userData.footprint=0;
 const rings=[];
 for(let i=0;i<17;i++){
  let m=add(g,new T.TorusGeometry(.135,.023,6,10),i%4?steel:edge,
    .04*Math.sin(i*.4),2.9-i*.175,0);
  m.rotation.y=i%2?Math.PI/2:0;rings.push(m);
 }
 g.userData.tick=(t,dt)=>{
  for(let i=0;i<rings.length;i++){
   rings[i].position.x=.05*Math.sin(t*.65-i*.2)*(i/17);
   rings[i].rotation.z=.04*Math.sin(t*.69-i*.16);
  }
 };
 return g;
}
function gnarledTree(seed=1){
 const r=rng(seed),g=new T.Group();g.name='Корявое дерево · ветвящийся силуэт';
 const h=5.5+r()*1.7,lean=(r()-.5)*1.8;
 g.userData.footprint=.85;
 // A bent tapering trunk, split roots and 4-level branch generation.
 let pts=[[0,0,0],[lean*.23,h*.23,0],[lean*.7,h*.63,.25],[lean,h,.26]];
 for(let i=0;i<3;i++)tube(g,pts[i],pts[i+1],.35-i*.075,bark,7);
 for(let i=0;i<9;i++){
  const a=i*6.28/9,rr=1.4+.3*r();
  tube(g,[.02,.39,0],[Math.cos(a)*rr,.01,Math.sin(a)*rr],.12,bark);
 }
 const crowns=[];
 for(let i=0;i<9;i++){
  const side=i%2?1:-1,level=.29+i*.075;
  const x=lean*level,z=(r()-.5)*.7,y=h*level;
  const crown=new T.Group();crown.position.set(x,y,z);g.add(crown);crowns.push(crown);
  const end=[side*(1.6+r()*1.4),.55+r()*1.5,(r()-.5)*2.3];
  tube(crown,[0,0,0],end,.095-i*.004,bark,6);
  for(let j=0;j<4;j++){
   const f=.4+j*.15;
   let start=end.map(v=>v*f);
   let finish=[start[0]+side*(.35+r()*.35),start[1]+.35+r()*.65,start[2]+(r()-.5)*.7];
   tube(crown,start,finish,.047-j*.005,bark,5);
   for(let k=0;k<3;k++){
    let pos=start.map((v,n)=>v+(finish[n]-v)*(k+1)/4);
    tube(crown,pos,[pos[0]+side*.14,pos[1]+.2+r()*.15,pos[2]+.12*(r()-.5)],.016,bark,4);
   }
  }
 }
 g.userData.tick=(t,dt)=>{
  for(let i=0;i<crowns.length;i++)crowns[i].rotation.z=.024*Math.sin(t*.6-i*.35);
 };
 return g;
}
function groundMist(seed=1){
 const r=rng(seed),g=new T.Group();g.name='Рваный стелющийся туман';
 g.userData.footprint=0;
 const mats=[],strips=[];
 for(let i=0;i<18;i++){
  const w=1.0+r()*1.9,h=.35+r()*.7,x=(r()-.5)*5.5,z=(r()-.5)*2.5;
  const shape=new T.Shape();shape.moveTo(-w/2,0);
  for(let j=0;j<=8;j++){
   const u=j/8;shape.lineTo((u-.5)*w,h*(.37+.55*Math.sin(u*Math.PI))*(.7+.5*r()));
  }
  shape.lineTo(w/2,0);
  const mat=new T.MeshBasicMaterial({color:i%3?'#5d6669':'#8a8f90',
    transparent:true,opacity:.09+r()*.06,depthWrite:false,side:T.DoubleSide});
  mats.push(mat);
  const m=add(g,new T.ShapeGeometry(shape),mat,x,.10+r()*.26,z);m.rotation.y=(r()-.5)*1.6;
  m.renderOrder=1;strips.push(m);
 }
 g.userData.tick=(t,dt)=>{
  for(let i=0;i<strips.length;i++){
   strips[i].position.x+=dt*(.025+.009*(i%3));
   if(strips[i].position.x>4.0)strips[i].position.x-=8;
   mats[i].opacity=.08+.05*(.5+.5*Math.sin(t*.5-i*.61));
  }
 };
 return g;
}

function stormClouds(seed=1){
 const r=rng(seed),g=new T.Group();g.name='Ночные рваные тучи';
 g.userData.footprint=0;const banks=[];
 for(let layer=0;layer<3;layer++){
  const group=new T.Group();group.position.set(0,-layer*.44,layer*.2);g.add(group);banks.push(group);
  const mat=new T.MeshBasicMaterial({color:layer===0?'#11181f':layer===1?'#273037':'#3b424b',
    transparent:true,opacity:.43-layer*.06,side:T.DoubleSide,depthWrite:false,fog:false});
  for(let i=0;i<14;i++){
   const x=-3+r()*6,y=(r()-.5)*.45;
   const shape=new T.Shape();shape.moveTo(-.5,0);
   for(let k=0;k<7;k++){let px=-.5+k/6,py=.14+r()*.46;shape.lineTo(px,py);}
   shape.lineTo(.6,-.12);
   const m=add(group,new T.ShapeGeometry(shape),mat,x,y,0);
   m.rotation.z=(r()-.5)*.1;
  }
 }
 g.userData.tick=(t,dt)=>{
  banks.forEach((b,i)=>{b.position.x=Math.sin(t*(.06+i*.035)+i*1.5)*(.18+i*.13);});
 };
 return g;
}
function brokenFence(seed=1){
 const r=rng(seed),g=new T.Group();g.name='Обломанный забор';
 g.userData.footprint=.4;
 for(let i=0;i<7;i++){
  const x=-2.7+i*.9,h=.9+r()*1.6,lean=(r()-.5)*.3;
  tube(g,[x,0,0],[x+lean,h,0],.07+r()*.08,bark,5);
  for(let j=0;j<3;j++){
   const a=.45+j*.29;
   tube(g,[x+lean*a,h*a,0],[x+lean*a+.1,h*a+.2,.08],.017,soot,5);
  }
  const splinter=cone(g,x+lean,h+.16,0,.14,.38,bark);splinter.rotation.z=.2*(r()-.5);
  add(g,new T.BoxGeometry(.065,.06,.055),edge,x+lean*.4,h*.4,.15);
  add(g,new T.BoxGeometry(.065,.06,.055),edge,x+lean*.7,h*.7,.15);
 }
 for(const y of [.52,1.11]){
  for(let i=0;i<5;i++){
   const x=-2.65+i*1.05;
   plank(g,[x,y,.05],[x+.8,y+.05*(r()-.5),.05],.14,.10,bark);
   for(let j=0;j<3;j++){
    add(g,new T.BoxGeometry(.02,.07,.05),soot,x+.15+j*.23,y+.018,.13);
   }
  }
 }
 return g;
}
function tallGrass(seed=1){
 const r=rng(seed),g=new T.Group();g.name='Осока и колючая сухая трава';
 const blades=[];g.userData.footprint=0;
 for(let i=0;i<44;i++){
  const x=(r()-.5)*2.8,z=(r()-.5)*1.2,h=.34+r()*1.3,lean=(r()-.5)*.55;
  const col=i%5===0?edge:i%2?bark:soot;
  const m=tube(g,[x,0,z],[x+lean,h,z+(r()-.5)*.15],.018+r()*.02,col,4);
  blades.push(m);
  if(i%3===0){const tip=cone(g,x+lean,h+.08,z,.035,.18,edge);tip.rotation.z=lean*.3;}
 }
 for(let i=0;i<12;i++){
  const x=(r()-.5)*2.5,z=(r()-.5);
  add(g,new T.IcosahedronGeometry(.09+r()*.13,0),soot,x,.08,z);
 }
 g.userData.tick=(t,dt)=>{
  blades.forEach((b,i)=>b.rotation.z=.045*Math.sin(t*.7-i*.18)*(1+(i%5)*.08));
 };
 return g;
}
function wetRailGlow(seed=1){
 const g=new T.Group();g.name='Мокрые рельсы · красный отсвет';
 g.userData.footprint=0;
 const reflections=[];
 for(const z of [-.78,.78]){
  for(let i=0;i<14;i++){
   const x=-3.4+i*.51;
   const m=add(g,new T.BoxGeometry(.35,.008,.045),
     new T.MeshBasicMaterial({color:i%3===0?'#76151b':'#68777b',transparent:true,
       opacity:.25,depthWrite:false}),x,.246,z);
   reflections.push(m);
  }
 }
 for(let i=0;i<10;i++){
  const x=-3+i*.64,z=(i%2?1:-1)*(.65+i*.035);
  const m=add(g,new T.PlaneGeometry(.16+i*.035,.05),
    new T.MeshBasicMaterial({color:'#760b12',transparent:true,opacity:.12,
      depthWrite:false,side:T.DoubleSide}),x,.204,z);
  m.rotation.x=-Math.PI/2;reflections.push(m);
 }
 g.userData.tick=(t,dt,near=.2)=>{
  const intensity=.18+.82*Math.max(0,Math.sin(t*(2+near*6))) *near;
  reflections.forEach((m,i)=>m.material.opacity=(i%3===0?.32:.12)+intensity*.45);
 };
 return g;
}
function barbedWire(seed=1){
 const r=rng(seed),g=new T.Group();g.name='Колючая проволока между кривыми кольями';
 g.userData.footprint=.26;
 for(const x of [-2.4,2.4]){
  tube(g,[x,0,0],[x+(x<0?-.18:.2),1.75,.01],.10,bark);
  cone(g,x+(x<0?-.18:.2),1.85,0,.11,.25,soot);
  for(let i=0;i<4;i++)tube(g,[x-.10,.55+i*.31,.1],[x+.12,.48+i*.31,.1],.022,steel,5);
 }
 const wires=[];
 for(let i=0;i<18;i++){
  const x=-2.25+i*.25,xx=x+.25;
  tube(g,[x,1.26-.14*Math.sin((x+2.25)/4.5*Math.PI),.04],
    [xx,1.26-.14*Math.sin((xx+2.25)/4.5*Math.PI),.04],.018,steel,5);
  for(let k of [-1,1]){
   const m=tube(g,[x+.13,1.23-.14*Math.sin((x+2.2)/4.5*Math.PI),.04],
     [x+.13+k*.12,1.36+k*.1-.14*Math.sin((x+2.2)/4.5*Math.PI),.04],
     .022,soot,4);
   wires.push(m);
  }
 }
 g.userData.tick=(t,dt)=>{
  wires.forEach((w,i)=>w.rotation.z=.006*Math.sin(t*.25-i*.12));
 };
 return g;
}
function swampPuddles(seed=1){
 const r=rng(seed),g=new T.Group();g.name='Болотная лужа с рябью';
 g.userData.footprint=0;
 const shore=new T.Shape(),count=18;
 for(let i=0;i<=count;i++){
  const a=i%count/count*2*Math.PI,rad=1.0+(.5*r());
  let x=Math.cos(a)*rad,z=Math.sin(a)*rad*.7;
  if(i===0)shore.moveTo(x,z);else shore.lineTo(x,z);
 }
 const waterMat=new T.MeshStandardMaterial({color:'#29373d',metalness:.54,roughness:.22,
   transparent:true,opacity:.6,side:T.DoubleSide});
 const lake=add(g,new T.ShapeGeometry(shore),waterMat,0,.035,0);lake.rotation.x=-Math.PI/2;
 const rings=[];
 for(let i=0;i<4;i++){
  const a=r()*6.28,rad=r()*.6;
  const ripple=add(g,new T.TorusGeometry(.15+i*.1,.007,4,22),edge,
    Math.cos(a)*rad,.054,Math.sin(a)*rad);
  ripple.rotation.x=Math.PI/2;rings.push(ripple);
 }
 for(let i=0;i<26;i++){
  const a=i*6.28/26,rad=1.02+(.4*r()),x=Math.cos(a)*rad,z=Math.sin(a)*rad*.75;
  const m=add(g,new T.IcosahedronGeometry(.05+r()*.1,0),i%2?bark:ink,x,.05,z);
  m.scale.y=.6;
  if(i%4===0)tube(g,[x,.05,z],[x+.12,.23+r()*.3,z],.02,bark,4);
 }
 g.userData.tick=(t,dt)=>{
  rings.forEach((w,i)=>{
   const q=.8+.18*Math.sin(t*.75-i*.9);
   w.scale.setScalar(q);w.material.opacity=.18+.07*Math.sin(t*.67-i);
  });
 };
 return g;
}
function titleLogo(seed=1){
 // Sculptural iron filigree counterpart to the actual CSS text, shown only in the menu.
 const g=new T.Group();g.name='BLACK TRAIN — орнамент под логотипом';
 g.userData.footprint=0;
 tube(g,[-2,0,0],[2,0,0],.03,red);
 for(let i=0;i<17;i++){
  const x=-2+i*.25;
  cone(g,x,.16,0,.055,.3,i%2?soot:red);
  if(i%3===0)tube(g,[x,-.01,0],[x,-.20-rng(i+seed)()*.2,0],.024,red,5);
 }
 const p=add(g,new T.SphereGeometry(.13,8,6),red,0,.1,.08);
 g.userData.tick=(t,dt)=>{p.scale.setScalar(.92+.1*Math.sin(t*2));};
 return g;
}
function crossingBell(seed=1){
 const g=new T.Group();g.name='Тяжёлый колокол переезда';
 g.userData.footprint=0;
 tube(g,[0,0,0],[0,1.4,0],.09,steel);
 const bell=add(g,new T.CylinderGeometry(.24,.5,.68,14,3,true),steel,0,.95,0);
 add(g,new T.TorusGeometry(.48,.035,7,20),edge,0,.60,0).rotation.x=Math.PI/2;
 add(g,new T.SphereGeometry(.19,9,6),soot,0,.48,0);
 for(let i=0;i<14;i++){
  const a=i*Math.PI*2/14;
  add(g,new T.SphereGeometry(.045,5,4),edge,Math.sin(a)*.44,.65,Math.cos(a)*.44);
 }
 const mount=add(g,new T.BoxGeometry(.62,.13,.46),bark,0,1.49,0);
 for(const x of [-.21,.21])tube(g,[x,1.5,0],[x,.78,0],.033,soot);
 g.userData.tick=(t,dt)=>{bell.rotation.z=.05*Math.sin(t*3);};
 return g;
}
function chainsClank(seed=1){
 const g=hangingChains(seed);
 g.name='Звонкие звенья на дереве';
 return g;
}

export const makers={crossingSign,redSignalLamp,hangingChains,gnarledTree,groundMist,
  stormClouds,brokenFence,tallGrass,wetRailGlow,barbedWire,swampPuddles,titleLogo,crossingBell,chainsClank};


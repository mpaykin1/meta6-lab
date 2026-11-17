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
function blackLocomotive(seed=1){
 const r=rng(seed),g=new T.Group();g.name='BLACK TRAIN · чёрный локомотив';g.userData.footprint=0;
 const body=add(g,new T.BoxGeometry(9.3,2.45,2.85),ink,-.2,2.12,0);
 add(g,new T.BoxGeometry(9.75,.36,3.2),soot,-.1,.97,0);
 add(g,new T.BoxGeometry(9.55,.34,3.08),steel,-.1,3.49,0);
 add(g,new T.BoxGeometry(3.05,1.45,2.92),soot,-2.92,4.2,0);
 add(g,new T.BoxGeometry(3.4,.26,3.35),ink,-2.87,4.97,0);
 // A flat, imposing upright front, rather than the reference train's sloped nose.
 add(g,new T.BoxGeometry(.36,3.32,3.02),soot,4.6,2.15,0);
 for(const z of [-1.40,1.40]){
  tube(g,[-4.8,1.1,z],[4.65,1.1,z],.12,steel);
  for(const x of [-3.9,-2.35,-.8,.8,2.45,3.85]){
   add(g,new T.CylinderGeometry(.37,.37,.15,10),steel,x,.58,z).rotation.x=Math.PI/2;
   add(g,new T.CylinderGeometry(.24,.24,.18,10),soot,x,.58,z).rotation.x=Math.PI/2;
  }
 }
 // Iron ribs, handrails, seams, rivets, boiler access hatches and soot deposits.
 for(let i=0;i<15;i++){
  const x=-4.34+i*.6;
  tube(g,[x,1.18,-1.46],[x,3.38,-1.46],.023,i%3?steel:edge,5);
  tube(g,[x,1.18,1.46],[x,3.38,1.46],.023,i%3?steel:edge,5);
 }
 for(let i=0;i<19;i++){
  const x=-4.3+i*.49;
  for(const z of [-1.52,1.52])add(g,new T.SphereGeometry(.055,5,4),edge,x,3.2,z);
 }
 for(const z of [-1.57,1.57]){
  tube(g,[-4.56,2.2,z],[4.45,2.2,z],.038,edge);
  for(let i=0;i<9;i++){
   const x=-4.1+i*.96;
   tube(g,[x,3.6,z*.86],[x,3.82,z*.86],.043,edge);
  }
  // Hanging ladder with twelve rungs, visible from side.
  for(let y=1.1;y<3.55;y+=.28)tube(g,[-4.28,y,z],[-3.73,y,z],.03,steel);
  tube(g,[-4.28,1.1,z],[-4.28,3.58,z],.038,steel);
  tube(g,[-3.73,1.1,z],[-3.73,3.58,z],.038,steel);
 }
 for(let i=0;i<5;i++){
  const x=-3.99+i*.49;
  const w=add(g,new T.BoxGeometry(.29,.53,.07),pale,x,4.31,-1.51);
  add(g,new T.BoxGeometry(.29,.53,.07),pale,x,4.31,1.51);
  tube(g,[x-.18,4.05,-1.57],[x-.18,4.57,-1.57],.035,soot);
  tube(g,[x-.18,4.05,1.57],[x-.18,4.57,1.57],.035,soot);
 }
 for(let i=0;i<7;i++){
  const x=-1.25+i*.77;
  add(g,new T.BoxGeometry(.23,.16,2.5),steel,x,3.67,0);
  cone(g,x,3.88,(r()-.5)*1.9,.12,.42,soot);
 }
 // Distinct headlights: two low eyes, plus the roof-mounted searchlight.
 for(const z of [-.99,.99]){
  add(g,new T.CylinderGeometry(.31,.31,.12,16),edge,4.82,1.65,z).rotation.z=Math.PI/2;
  add(g,new T.CylinderGeometry(.225,.225,.14,16),pale,4.92,1.65,z).rotation.z=Math.PI/2;
 }
 add(g,new T.CylinderGeometry(.42,.42,.46,16),steel,4.24,4.53,0).rotation.z=Math.PI/2;
 add(g,new T.CylinderGeometry(.29,.29,.48,16),pale,4.49,4.53,0).rotation.z=Math.PI/2;
 const beacon=new T.PointLight('#c5d4d9',4,16,1.7);beacon.position.set(4.9,4.55,0);g.add(beacon);
 const beam=add(g,new T.ConeGeometry(3.0,38,24,1,true),
    new T.MeshBasicMaterial({color:'#6b7577',transparent:true,opacity:.045,side:T.DoubleSide,
    depthWrite:false,blending:T.AdditiveBlending}),23.4,4.53,0);
 beam.rotation.z=Math.PI/2;beam.renderOrder=2;
 for(let i=0;i<12;i++){
  const x=-4.7+i*.76;
  add(g,new T.BoxGeometry(.24,.025,.38),i%3?soot:edge,x,3.43,1.22);
 }
 g.userData.tick=(t,dt)=>{beacon.intensity=3.6+.35*Math.sin(t*1.9);beam.material.opacity=.043+.006*Math.sin(t*.7);};
 g.userData.length=10;
 return g;
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
export const makers={blackLocomotive,crossingSign,redSignalLamp,hangingChains,gnarledTree,groundMist};

import * as T from 'three';

// BLACK TRAIN / hand-built silhouettes in volumetric Three.js, deterministic seeds.
const PI=Math.PI;
const noise=(seed,i)=>{const x=Math.sin(seed*127.31+i*47.79)*43758.5453;return x-Math.floor(x)};
const C={coal:'#090b0d',iron:'#22282b',edge:'#4b5355',ash:'#343538',rust:'#433333',wood:'#242221',bone:'#73706b',red:'#6c1117',light:'#b77b72'};
const MM=new Map();
function mat(color,emissive=false){const key=color+':'+emissive;if(!MM.has(key)) MM.set(key,new T.MeshStandardMaterial({color,roughness:emissive?.33:.91,metalness:emissive?.32:.15,emissive:emissive?color:'#000000',emissiveIntensity:emissive?.56:0,side:T.DoubleSide,transparent:false}));return MM.get(key)}
const V=(x,y,z)=>new T.Vector3(x,y,z);
function part(g,geo,color,x=0,y=0,z=0){const m=new T.Mesh(geo,mat(color));m.position.set(x,y,z);m.userData.watercolorOutline=true;g.add(m);return m}
function box(g,w,h,d,color,x,y,z){return part(g,new T.BoxGeometry(w,h,d),color,x,y,z)}
function rod(g,a,b,r,color,facets=7){
  const d=b.clone().sub(a);const m=part(g,new T.CylinderGeometry(r*.72,r,d.length(),facets),color);
  m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());return m;
}
function poly(g,pts,color,depth=.12){
  const s=new T.Shape();s.moveTo(pts[0][0],pts[0][1]);pts.slice(1).forEach(p=>s.lineTo(p[0],p[1]));s.closePath();
  return part(g,new T.ExtrudeGeometry(s,{depth,bevelEnabled:false}),color);
}
function assemble(name,fn){const g=new T.Group();g.name=name;fn(g);g.userData.footprint=0;return g}
const setMotion=(g,cb)=>{g.userData.tick=(t,dt)=>cb(t,dt);return g};
function blackLocomotive(seed=1){
 return assemble('Чёрный локомотив',g=>{
  // 57+ manually distinguishable steel parts; flat, vertical front, not the sloped reference train.
  const p=poly(g,[[-5.1,.82],[.22,.82],[.22,3.67],[-.15,3.88],[-4.7,3.88],[-5.1,3.47]],C.coal,2.65);
  p.position.z=-1.325;
  box(g,5.7,.3,3.12,C.iron,-2.45,.83,0);
  box(g,.31,3,2.91,C.iron,.19,2.31,0);
  box(g,.42,.31,3.08,C.edge,.17,3.8,0);
  for(let side of [-1,1]){
    const z=side*1.51;
    for(let k=0;k<6;k++){const x=-4.65+k*.75;box(g,.14,2.1,.09,k%3===0?C.rust:C.edge,x,2.45,z)}
    for(let k=0;k<4;k++)box(g,.55,.09,.18,C.edge,-4.65+k*1.05,1.02,z);
    for(let k=0;k<4;k++)rod(g,V(-4.8+k*1.15,.54,z),V(-4.8+k*1.15,1.6,z),.048,C.edge);
    for(let k=0;k<5;k++){let x=-4.5+k*.93;
      const wheel=part(g,new T.CylinderGeometry(.48,.48,.14,11),C.coal,x,.52,side*1.53);
      wheel.rotation.x=PI/2;
      part(g,new T.TorusGeometry(.36,.052,4,15),C.edge,x,.52,side*1.65).rotation.y=PI/2;
    }
    for(let k=0;k<6;k++){const x=-4.8+k*.9;rod(g,V(x,.56,z),V(x+.26,.59,z),.035,C.rust)}
  }
  // two lower headlights + roof searchlight and cab's small windows
  const fmat=new T.MeshBasicMaterial({color:'#f3e5c8'});
  for(const z of [-.86,.86]){
    const ring=part(g,new T.TorusGeometry(.18,.046,8,20),C.edge,.46,1.36,z);ring.rotation.y=PI/2;
    const lens=new T.Mesh(new T.CircleGeometry(.15,24),fmat);lens.position.set(.482,1.36,z);lens.rotation.y=PI/2;g.add(lens)
  }
  for(let k=0;k<5;k++){const z=-.96+k*.48;
    box(g,.05,.34,.3,C.light,.46,3.12,z);
    box(g,.065,.035,.35,C.iron,.49,2.93,z);
  }
  const lantern=part(g,new T.CylinderGeometry(.3,.34,.48,12),C.iron,.22,4.15,0);lantern.rotation.z=PI/2;
  const lens=new T.Mesh(new T.CircleGeometry(.245,24),new T.MeshBasicMaterial({color:'#d6dad5'}));
  lens.position.set(.54,4.15,0);lens.rotation.y=PI/2;g.add(lens);
  for(let k=0;k<7;k++){box(g,.14,.13,.18,C.rust,-4.8+k*.72,3.97,(k%2?.42:-.42))}
  for(let k=0;k<6;k++){const x=-4.6+k*.76;rod(g,V(x,4.01,-1.2),V(x+.22,4.22,-1.2),.045,C.iron)}
  for(let k=0;k<13;k++){const x=-4.5+noise(seed,k)*4.8,z=(noise(seed,k+50)-.5)*2.8;
    box(g,.025,.32+noise(seed,k+4)*.4,.019,C.rust,x,2.4,z);}
  g.userData.footprint=3;
 });
}
function crossingSign(seed=1){
 return assemble('Покосившийся железнодорожный крест',g=>{
  const mast=rod(g,V(0,0,0),V(.22,3.18,.06),.14,C.wood,7);
  for(const a of [-.83,.83]){
    const b=box(g,2.22,.28,.14,C.bone,.21,2.9,.14);b.rotation.z=a;
    for(let i=0;i<4;i++){let q=-.85+i*.57;
      box(g,.055,.21,.03,C.rust,.21+q*Math.cos(a),2.9+q*Math.sin(a),.24).rotation.z=a;
    }
  }
  for(let i=0;i<6;i++)rod(g,V((noise(seed,i)-.5)*.25,0,(noise(seed,i+5)-.5)*.2),V(.1,1+i*.34,.1),.018,C.rust,5);
  box(g,.56,.16,.2,C.iron,.22,2.88,.28);
  g.userData.footprint=.52;
 });
}
function redSignalLamp(seed=1){
 return assemble('Красный сигнал с треснувшим стеклом',g=>{
  rod(g,V(0,0,0),V(.03,2.23,0),.08,C.wood);
  const lamp=new T.Group();lamp.position.set(.02,2.16,.18);g.add(lamp);
  const rim=part(lamp,new T.TorusGeometry(.32,.07,9,22),C.iron,0,0,.14);
  part(lamp,new T.CircleGeometry(.27,25),C.red,0,0,.17);
  const glow=part(lamp,new T.CircleGeometry(.19,23),'#9b2223',0,0,.181);
  const glass=part(lamp,new T.CircleGeometry(.12,16),C.light,.042,.01,.187);
  const cracks=[[[-.2,-.08],[.03,.04]],[[.03,.04],[.21,.13]],[[-.06,-.18],[.03,.04]],[[.03,.04],[-.11,.23]]];
  for(const [a,b] of cracks)rod(lamp,V(a[0],a[1],.195),V(b[0],b[1],.195),.013,C.coal,4);
  for(let i=0;i<6;i++)box(lamp,.029,.1+i*.02,.018,C.red,-.22+i*.09,-.38-i*.025,.18);
  const vane=box(lamp,.6,.1,.13,C.iron,0,.42,0);
  const hook=part(lamp,new T.TorusGeometry(.18,.034,7,14),C.edge,0,.5,.04);
  const light=new T.PointLight('#ff272d',0,10,2);light.position.set(0,0,.32);lamp.add(light);
  const splash=part(g,new T.PlaneGeometry(1.4,1.9),C.rust,0,.03,-.2);splash.rotation.x=-PI/2;
  g.userData.interact={radius:6,effect:'warning_train',label_ru:'Красный сигнал предупреждает о поезде'};
  setMotion(g,(t)=>{const near=g.userData.approach||0;const pulse=.15+.85*(.5+.5*Math.sin(t*(1.8+seed*.02+near*6.5)));
    glow.material.emissiveIntensity=pulse*1.6;light.intensity=pulse*2.8;
    vane.rotation.z=.05*Math.sin(t*.72+.8);splash.scale.setScalar(.8+.2*pulse);
  });
 });
}
function hangingChains(seed=1){
 return assemble('Проклятые цепи',g=>{
  const strands=[];
  for(let c=0;c<3;c++){
    const chain=new T.Group();chain.position.set((c-1)*.53,3.9-c*.45,.02);g.add(chain);
    const arr=[];
    for(let i=0;i<11;i++){
      const link=new T.Group();link.position.y=-i*.285;chain.add(link);
      const m=part(link,new T.TorusGeometry(.126,.028,6,10),i%3===0?C.rust:C.edge,0,-.02,0);
      m.rotation.y=i%2?PI/2:0;
      arr.push(link);
    }
    strands.push(arr);
  }
  rod(g,V(-.82,3.93,0),V(.84,3.93,.05),.065,C.wood);
  setMotion(g,t=>strands.forEach((arr,c)=>arr.forEach((link,i)=>{
    link.rotation.z=.035*Math.sin(t*.52+i*.21+c*.9)*(i+1)/11;
    link.rotation.y=.047*Math.cos(t*.49+i*.12+c*.8)*(i+1)/11;
  })));
 });
}
function gnarledTree(seed=1){
 return assemble('Гнилое дерево над путями',g=>{
  const branches=[];
  const h=3.7+noise(seed,1)*1.2;
  const trunk=[V(0,0,0),V(-.18,h*.38,0),V(.36,h*.7,-.13),V(.11,h,0)];
  for(let i=0;i<3;i++)rod(g,trunk[i],trunk[i+1],.47-i*.12,i===0?C.wood:C.iron,9);
  for(let k=0;k<8;k++){
    const angle=(k*.77+noise(seed,k+13)*.85)*PI;
    const rad=.9+noise(seed,k+2)*1.25;
    const y=h*(.34+k*.067);
    const base=V(.19*Math.sin(k),y,-.08);
    const elbow=V(Math.cos(angle)*rad*.6,y+.38,Math.sin(angle)*rad*.52);
    const tip=V(Math.cos(angle)*rad,y+.9+noise(seed,k+4)*.6,Math.sin(angle)*rad*.8);
    rod(g,base,elbow,.14-k*.008,C.wood,6);
    const b=new T.Group();b.position.copy(elbow);g.add(b);
    rod(b,V(0,0,0),tip.clone().sub(elbow),.08,C.iron,6);
    for(let j=0;j<3;j++){
      const dst=V((noise(seed,k*4+j)-.5)*.6,.32+noise(seed,k+j+30)*.6,(noise(seed,k+j+60)-.5)*.6);
      rod(b,tip.clone().sub(elbow).multiplyScalar(.63),tip.clone().sub(elbow).add(dst),.021,C.edge,5);
    }
    branches.push([b,k]);
  }
  for(let i=0;i<7;i++){let a=i/7*PI*2;
    rod(g,V(Math.cos(a)*.21,.35,Math.sin(a)*.23),V(Math.cos(a)*(.65+noise(seed,i)*.45),.02,Math.sin(a)*(.65+noise(seed,i)*.45)),.09,C.wood,6)}
  g.userData.footprint=1.1;
  setMotion(g,t=>branches.forEach(([b,i])=>{b.rotation.z=.035*Math.sin(t*.28+i*.22);b.rotation.x=.045*Math.sin(t*.24-i*.31)}));
 });
}
function groundMist(seed=1){
 return assemble('Живой стелющийся туман',g=>{
  const fogmat=new T.MeshBasicMaterial({color:'#74818a',transparent:true,opacity:.11,depthWrite:false,side:T.DoubleSide});
  const sheets=[];
  for(let k=0;k<13;k++){
    const h=.21+noise(seed,k)*.4,w=1.3+noise(seed,k+33)*1.7;
    const pts=[-w/2,0,-w*.36,h*.7,-w*.2,h*.92,0,h*.62,w*.15,h,w*.4,h*.36,w/2,0];
    const pos=[],inds=[];for(let i=0;i<pts.length;i+=2)pos.push(pts[i],pts[i+1],0);
    for(let i=1;i<pos.length/3-1;i++)inds.push(0,i,i+1);
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setIndex(inds);geo.computeVertexNormals();
    const mesh=new T.Mesh(geo,fogmat.clone());
    mesh.position.set((k-6)*.32,.06+noise(seed,k+100)*.3,(noise(seed,k+50)-.5)*1.5);
    mesh.rotation.y=noise(seed,k+12)*PI;
    mesh.userData.watercolorOutline=false;g.add(mesh);sheets.push(mesh);
  }
  setMotion(g,t=>sheets.forEach((s,i)=>{s.position.x=(i-6)*.32+.45*Math.sin(t*.15+i*1.9);s.position.y=.12+.11*Math.sin(t*.24+i*.4);
    s.material.opacity=.07+.05*(.5+.5*Math.sin(t*.33+i*.7));}));
 });
}
function stormClouds(seed=1){
 return assemble('Тучи ночного перегона',g=>{
  const layers=[];
  for(let band=0;band<3;band++){
    const cloud=new T.Group();g.add(cloud);
    for(let k=0;k<16;k++){
      const x=(k-7.5)*.26+(noise(seed,k+band*90)-.5)*.6;
      const r=.31+noise(seed,k+50+band)*.37;
      const m=part(cloud,new T.IcosahedronGeometry(r,1),band===0?C.iron:band===1?C.edge:C.coal,x,3+band*.47+(noise(seed,k+90)-.5)*.2,(band-1)*.5);
      m.scale.set(1.8,.6,.8);
    }
    layers.push(cloud);
  }
  setMotion(g,t=>layers.forEach((l,i)=>{l.position.x=Math.sin(t*(.025+i*.015)+i)*.55}));
 });
}
function brokenFence(seed=1){
 return assemble('Сломанный забор',g=>{
  for(let i=0;i<11;i++){
    const x=(i-5)*.48+(noise(seed,i)-.5)*.16,h=.65+noise(seed,i+20)*1.15;
    const p=poly(g,[[-.16,0],[.17,0],[.13,h-.18],[.07,h],[0,h-.14],[-.08,h-.05],[-.14,h-.25]],i%3?C.wood:C.rust,.09);
    p.position.x=x;p.position.z=(noise(seed,i+30)-.5)*.14;p.rotation.z=(noise(seed,i+40)-.5)*.22;
    box(g,.44,.07,.14,C.iron,x,.45,.05);
    if(i<9)box(g,.52,.09,.13,C.edge,x,.94,.05);
  }
  g.userData.footprint=.35;
 });
}
function tallGrass(seed=1){
 return assemble('Осока у насыпи',g=>{
  const stalks=[];
  for(let k=0;k<34;k++){
    const x=(noise(seed,k)-.5)*2,z=(noise(seed,k+70)-.5)*.9,h=.42+noise(seed,k+22)*.95;
    const stem=new T.Group();stem.position.set(x,0,z);g.add(stem);
    const tip=V((noise(seed,k+32)-.5)*.26,h,(noise(seed,k+99)-.5)*.29);
    rod(stem,V(0,.02,0),tip,.015+k%3*.004,k%5?C.wood:C.edge,5);
    if(k%3===0)rod(stem,tip.clone().multiplyScalar(.64),tip.clone().add(V(.1,.15,0)),.015,C.rust,5);
    stalks.push([stem,k]);
  }
  setMotion(g,t=>stalks.forEach(([s,i])=>{s.rotation.z=.08*Math.sin(t*.8+i*.23);}));
 });
}
function wetRailGlow(seed=1){
 return assemble('Влажные рельсы — отблески',g=>{
  const ribbons=[];
  for(const side of [-1,1])for(let k=0;k<12;k++){
    const x=(k-6)*.48+noise(seed,k+side*11)*.12;
    const m=box(g,.43,.009,.035,k%4?C.edge:C.rust,x,.21,side*.76);
    ribbons.push([m,k]);
  }
  setMotion(g,t=>ribbons.forEach(([m,i])=>{m.scale.x=.85+.18*Math.sin(t*1.8+i*.5)}));
 });
}
function barbedWire(seed=1){
 return assemble('Колючая проволока',g=>{
  const a=V(-2,.98,0),b=V(2,.96,0);
  for(const x of [-2,2]){rod(g,V(x,0,0),V(x,1.5,0),.08,C.wood,7);box(g,.2,.15,.24,C.rust,x,1.5,0)}
  for(let k=0;k<30;k++){
    const x=-2+k*4/29,y=.98-.16*Math.sin(k/29*PI);
    if(k)rod(g,V(-2+(k-1)*4/29,.98-.16*Math.sin((k-1)/29*PI),0),V(x,y,0),.022,C.edge,5);
    if(k%2===0){rod(g,V(x,y-.12,0),V(x,y+.12,0),.018,C.rust,5);
      rod(g,V(x-.08,y,.05),V(x+.08,y,-.05),.016,C.rust,5)}
  }
  g.userData.footprint=.1;
 });
}
function swampPuddles(seed=1){
 return assemble('Лужи под шпалами',g=>{
  const pools=[];
  for(let k=0;k<5;k++){
    const n=11,vertices=[0,.008,0],ind=[];
    const ra=.3+noise(seed,k)*.25;
    for(let j=0;j<n;j++){let a=j/n*PI*2,r=ra*(.75+.35*noise(seed,k*17+j));
      vertices.push(Math.cos(a)*r,.008,Math.sin(a)*r*.52)}
    for(let j=0;j<n;j++)ind.push(0,j+1,(j+1)%n+1);
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(ind);geo.computeVertexNormals();
    const m=part(g,geo,C.edge,(k-2)*.85,.007,noise(seed,k+34)*.4);
    const edge=part(g,new T.TorusGeometry(ra*.84,.024,5,19),C.wood,m.position.x,.013,m.position.z);
    edge.rotation.x=PI/2;edge.scale.y=.55;pools.push([m,edge]);
  }
  setMotion(g,t=>pools.forEach(([p,e],i)=>{p.position.y=.006+.006*Math.sin(t*.63+i);e.scale.x=1+.019*Math.sin(t*.92+i)}));
 });
}
function titleLogo(seed=1){
 return assemble('BLACK TRAIN — титр меню',g=>{
  const c=document.createElement('canvas');c.width=1024;c.height=256;const cx=c.getContext('2d');
  cx.clearRect(0,0,1024,256);
  cx.textAlign='center';cx.fillStyle='#b5afa4';cx.font='bold 142px Georgia,serif';cx.shadowColor='#5a000a';cx.shadowBlur=16;
  cx.fillText('BLACK TRAIN',512,156);cx.shadowBlur=0;
  cx.fillStyle='#81161c';cx.fillRect(107,202,810,5);
  for(let k=0;k<21;k++){const x=120+k*38,y=202+(k%4)*8;cx.fillRect(x,y,2,15+(k%3)*12)}
  const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;
  const o=new T.Mesh(new T.PlaneGeometry(5.6,1.4),new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));
  o.position.y=1.4;o.userData.watercolorOutline=false;g.add(o);
  setMotion(g,t=>{o.position.y=1.4+.025*Math.sin(t*.34);});
 });
}
function crossingBell(seed=1){
 return assemble('Колокол переезда',g=>{
  const bell=poly(g,[[-.28,1.13],[.28,1.13],[.21,1.45],[.15,1.69],[-.15,1.69],[-.21,1.45]],C.rust,.35);
  rod(g,V(0,.92,.15),V(0,1.25,.15),.037,C.edge);
  rod(g,V(0,0,0),V(0,1.2,0),.035,C.wood);
  const clapper=part(g,new T.IcosahedronGeometry(.065,0),C.edge,0,1,.15);
  rod(g,V(-.37,1.12,0),V(.37,1.12,0),.037,C.wood);
  for(let k=0;k<6;k++)part(g,new T.IcosahedronGeometry(.045,0),C.iron,Math.sin(k)*.28,1.2+k*.06,.38);
  setMotion(g,t=>{bell.rotation.z=.025*Math.sin(t*.5);clapper.position.x=.06*Math.sin(t*.73)});
 });
}
function chainsClank(seed=1){
 return assemble('Цепные подвески',g=>{
  const chain=new T.Group();chain.position.y=2.5;g.add(chain);
  for(let k=0;k<12;k++){
    const link=part(chain,new T.TorusGeometry(.12,.027,6,10),k%3?C.edge:C.rust,0,-k*.19,0);
    link.rotation.y=k%2?PI/2:0;
  }
  rod(g,V(0,0,0),V(0,2.45,0),.045,C.wood);
  rod(g,V(0,2.45,0),V(.2,2.78,0),.06,C.wood);
  setMotion(g,t=>{chain.rotation.z=.08*Math.sin(t*.58+seed*.2);chain.rotation.x=.035*Math.sin(t*.43)});
 });
}
export const makers={
 blackLocomotive,crossingSign,redSignalLamp,hangingChains,gnarledTree,groundMist,
 stormClouds,brokenFence,tallGrass,wetRailGlow,barbedWire,swampPuddles,
 titleLogo,crossingBell,chainsClank
};

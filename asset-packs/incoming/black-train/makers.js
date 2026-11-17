import * as T from 'three';
// BLACK TRAIN • procedural stage props, all geometry; deterministic, no network.
const ink=c=>new T.MeshStandardMaterial({color:c,roughness:.83,metalness:.14,flatShading:true});
const iron=ink('#151b1e'),steel=ink('#414649'),wood=ink('#282a27'),bark=ink('#171c1d'),fogmat=()=>new T.MeshBasicMaterial({color:'#899597',transparent:true,opacity:.19,depthWrite:false,side:T.DoubleSide,fog:true});
const red=new T.MeshStandardMaterial({color:'#541313',emissive:'#cf1108',emissiveIntensity:2.2,roughness:.27});
const cream=new T.MeshBasicMaterial({color:'#ebeee4'});
const rnd=(s,n)=>{const x=Math.sin(s*97.23+n*49.17)*43758.5453;return x-Math.floor(x)};
const box=(g,x,y,z,w,h,d,m,rx=0,ry=0,rz=0)=>{const q=new T.Mesh(new T.BoxGeometry(w,h,d),m);q.position.set(x,y,z);q.rotation.set(rx,ry,rz);q.userData.watercolorOutline=true;g.add(q);return q;};
const beam=(g,a,b,r,m,r2=r)=>{const va=new T.Vector3(...a),vb=new T.Vector3(...b),d=vb.clone().sub(va);
 const q=new T.Mesh(new T.CylinderGeometry(r2,r,d.length(),7,1),m);q.position.copy(va).add(vb).multiplyScalar(.5);q.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());q.userData.watercolorOutline=true;g.add(q);return q;};
const globe=(g,x,y,z,r,m,sx=1,sy=1,sz=1)=>{const q=new T.Mesh(new T.IcosahedronGeometry(r,1),m);q.scale.set(sx,sy,sz);q.position.set(x,y,z);q.userData.watercolorOutline=true;g.add(q);return q;};
const done=(g,name,fp=0)=>{g.name=name;g.userData.footprint=fp;return g;};
const sway=(items,amp=.03)=>t=>{items.forEach((q,i)=>{q.rotation.z=Math.sin(t*.54-i*.22)*amp*(.4+i/Math.max(1,items.length));});};
function crossingSign(seed=1){
 const g=new T.Group();const post=beam(g,[0,0,0],[.22,3.9,.1],.14,wood,.095);post.rotation.z=-.07;
 for(const angle of [-.77,.77]){const q=box(g,.19,3.52,.1,2.65,.27,.22,ink('#bbb6a3'),0,0,angle);for(let i=0;i<4;i++)box(g,.2+(i-1.5)*.47*Math.cos(angle),3.52+(i-1.5)*.47*Math.sin(angle),.24,.12,.04,.07,iron,0,0,angle);}
 for(let i=0;i<3;i++)beam(g,[.01+i*.12,.48+i*.13,-.06],[.1+i*.12,1+i*.3,.07],.035,steel);
 g.userData.tick=t=>{post.rotation.z=-.07+.005*Math.sin(t*.3);};return done(g,'Крест переезда',.55);
}
function redSignalLamp(seed=1){
 const g=new T.Group(),lamp=new T.Group();lamp.position.set(0,2.78,.21);g.add(lamp);
 box(g,0,1.35,0,.16,2.7,.17,wood);
 const ring=new T.Mesh(new T.TorusGeometry(.36,.077,10,32),iron);lamp.add(ring);
 const face=new T.Mesh(new T.SphereGeometry(.31,20,12),red);face.scale.z=.33;lamp.add(face);
 for(let i=0;i<7;i++){const a=i*6.283/7;beam(lamp,[Math.cos(a)*.29,Math.sin(a)*.29,.13],[Math.cos(a+.16)*.12,Math.sin(a+.16)*.12,.18],.012,steel);}
 for(let i=0;i<4;i++)beam(lamp,[.1+i*.03,-.2,.22],[.04+i*.03,-.36-rnd(seed,i)*.17,.25],.012,red);
 const halo=new T.PointLight('#ff2409',3,8,2);halo.position.z=.32;lamp.add(halo);
 g.userData.tick=t=>{const v=.35+.65*Math.pow(.5+.5*Math.sin(t*3.2),3);halo.intensity=2.8*v;red.emissiveIntensity=.4+2.3*v;face.scale.z=.25+.12*v;};
 g.userData.interact={radius:6,effect:'warn-train',label_ru:'Сигнал приближения поезда'};
 return done(g,'Красный сигнальный фонарь',.35);
}
function hangingChains(seed=1){
 const g=new T.Group(),parts=[];for(let c=0;c<3;c++){const strand=new T.Group();strand.position.set((c-1)*.47,2.9-rnd(seed,c)*.4,(c-1)*.18);g.add(strand);
 for(let i=0;i<15+c*3;i++){const l=new T.Mesh(new T.TorusGeometry(.097,.027,5,12),i%4===0?steel:iron);l.scale.set(.65,1.45,1);l.rotation.y=(i%2)*1.57;l.position.set(Math.sin(i*.29+c)*.025,-i*.143,0);strand.add(l);}
 parts.push(strand);}
 g.userData.tick=t=>{parts.forEach((p,i)=>{p.rotation.z=.07*Math.sin(t*.61-i*.37);p.rotation.x=.04*Math.sin(t*.5-i*.8);});};
 return done(g,'Цепи на ветру',.2);
}
function gnarledTree(seed=1){
 const g=new T.Group(),tops=[];const r=(n)=>rnd(seed,n);const root=new T.Group();g.add(root);
 function branch(a,len,radius,depth,ang,index){
   const d=new T.Vector3(Math.sin(ang)*len,len*(.58+.19*r(index)),(r(index+4)-.5)*len*.48);
   const b=new T.Vector3(...a).add(d);beam(root,a,b.toArray(),radius,bark,radius*.62);
   if(depth<=0){beam(root,b.toArray(),b.clone().add(new T.Vector3((r(index+9)-.5)*.38,.18,.04)).toArray(),.009,steel);return;}
   for(let k=0;k<(depth>1?3:2);k++){const twist=(k-1)*(.38+.3*r(index+3))+(.14-.28*r(index+7));branch(b.toArray(),len*(.61+.13*r(index+k+7)),radius*.62,depth-1,ang+twist,index*3+k+1);}
 }
 branch([0,0,0],1.65,.38,3,.21+r(2)*.2,1);
 for(let i=0;i<7;i++)beam(g,[0,.14,0],[(r(i+3)-.5)*1.5,0,(r(i+6)-.5)*1.2],.1,wood,.03);
 g.userData.tick=t=>{root.rotation.z=.015*Math.sin(t*.43+seed);root.rotation.x=.013*Math.sin(t*.31+seed*2);};return done(g,'Корявое дерево',.55);
}
function groundMist(seed=1){
 const g=new T.Group(),layers=[];for(let i=0;i<9;i++){const verts=[],indices=[];const n=28;
  for(let j=0;j<=n;j++){const x=-3+6*j/n,y=.12+Math.sin(j*.75+i*2.2)*.15+(.15+.19*rnd(seed,i*41+j))*Math.sin(j*.4+i);verts.push(x,.03,0,x,Math.max(.1,y+(.25+i*.055)),0);if(j<n){const k=2*j;indices.push(k,k+1,k+2,k+1,k+3,k+2);}}
  const geom=new T.BufferGeometry();geom.setAttribute('position',new T.Float32BufferAttribute(verts,3));geom.setIndex(indices);geom.computeVertexNormals();
  const m=new T.Mesh(geom,fogmat());m.position.set(0,0,(i-4)*.36);m.material.opacity=.09+(i%3)*.04;g.add(m);layers.push(m);}
 g.userData.tick=t=>{layers.forEach((q,i)=>{q.position.x=.65*Math.sin(t*.14+i*.61);q.material.opacity=.08+.065*(.5+.5*Math.sin(t*.27+i));});};return done(g,'Стелющийся туман',0);
}
function stormClouds(seed=1){
 const g=new T.Group(),cl=[];for(let i=0;i<8;i++){const c=new T.Group();c.position.set((i-3.5)*.45,4.5+rnd(seed,i)*1.3,-i*.8);for(let j=0;j<6;j++){const m=ink(j%3?'#111a20':'#283037');globe(c,(rnd(seed,i*10+j)-.5)*1.2,(rnd(seed,j*4+i)-.5)*.75,(rnd(seed,i+j+14)-.5)*1.7,.47+rnd(seed,j)*.28,m,1.5,.4,.9);}g.add(c);cl.push(c);}
 g.userData.tick=t=>cl.forEach((c,i)=>c.position.x+=(Math.sin(t*.035+i)-Math.sin((t-.016)*.035+i))*.75);
 return done(g,'Грозовые тучи',0);
}
function brokenFence(seed=1){
 const g=new T.Group();for(let i=0;i<19;i++){const h=.72+rnd(seed,i)*1.1;const x=(i-9)*.31;box(g,x,h/2,-.02,.2,h,.13,wood,0,0,(rnd(seed,i+100)-.5)*.27);for(let j=0;j<3;j++)box(g,x, h*(.2+j*.28),.08,.09,.034,.035,iron);}
 for(const y of [.47,1.2])beam(g,[-2.95,y,-.11],[2.95,y,-.11],.07,wood);
 return done(g,'Сломанный забор',.35);
}
function tallGrass(seed=1){
 const g=new T.Group(),stems=[];for(let i=0;i<53;i++){const a=rnd(seed,i)*6.283,d=Math.sqrt(rnd(seed,i+71))*.85,h=.5+rnd(seed,i+51)*1.2;
 const s=new T.Group();s.position.set(Math.cos(a)*d,0,Math.sin(a)*d);s.rotation.z=(rnd(seed,i+32)-.5)*.23;
 beam(s,[0,0,0],[(rnd(seed,i+101)-.5)*.22,h,0],.012,ink(i%3?'#4b4b3e':'#777363'),.004);
 if(i%4===0)globe(s,0,h*.7,0,.07,wood,.4,1.7,.4);g.add(s);stems.push(s);}
 g.userData.tick=t=>stems.forEach((s,i)=>s.rotation.z=.05*Math.sin(t*.67+i*.14));
 return done(g,'Сухая трава',0);
}
function wetRailGlow(seed=1){
 const g=new T.Group();for(const z of [-.82,.82])for(let i=0;i<16;i++)box(g,-3.1+i*.39,.015,z,.48,.018,.072,i%4?steel:red);
 const puddle=new T.Mesh(new T.CircleGeometry(.83,17),new T.MeshStandardMaterial({color:'#303b41',roughness:.13,metalness:.84,transparent:true,opacity:.65}));puddle.rotation.x=-Math.PI/2;puddle.scale.set(2,.62,1);puddle.position.set(1.5,.016,0);g.add(puddle);
 g.userData.tick=t=>{for(let i=1;i<g.children.length-1;i+=5){const m=g.children[i].material;m.emissiveIntensity=m===red?1+.5*Math.sin(t*3):0;}};return done(g,'Мокрые рельсы',0);
}
function barbedWire(seed=1){
 const g=new T.Group();for(const x of [-2.9,2.9])beam(g,[x,0,0],[x+.16,1.7,.1],.08,wood,.055);
 for(let k=0;k<2;k++){const y=1.2+k*.3;
  for(let i=0;i<26;i++){const x=-2.8+i*.22;beam(g,[x,y-.14*Math.sin(i*.12),0],[x+.22,y-.14*Math.sin((i+1)*.12),0],.009,steel);if(i%2===0){const b=y-.14*Math.sin(i*.12);beam(g,[x,b-.11,-.04],[x+.1,b+.12,.05],.012,iron);beam(g,[x+.1,b-.11,.05],[x,b+.11,-.04],.012,iron);}}}
 return done(g,'Колючая проволока',.2);
}
function swampPuddles(seed=1){
 const g=new T.Group(),mat=new T.MeshStandardMaterial({color:'#26353c',roughness:.17,metalness:.63,transparent:true,opacity:.75});
 const vertices=[0,0,0];for(let i=0;i<=24;i++){const a=i*Math.PI/12,r=1.2+(.5-rnd(seed,i))*.27;vertices.push(Math.cos(a)*r,0,Math.sin(a)*r*.6);}
 const geom=new T.BufferGeometry();geom.setAttribute('position',new T.Float32BufferAttribute(vertices,3));const ind=[];for(let i=1;i<=24;i++)ind.push(0,i,i+1);geom.setIndex(ind);geom.computeVertexNormals();const m=new T.Mesh(geom,mat);m.position.y=.012;g.add(m);
 for(let i=0;i<22;i++){const a=rnd(seed,i)*6.283,r=1+(.5-rnd(seed,i+6))*.3;beam(g,[Math.cos(a)*r,0,Math.sin(a)*r*.6],[Math.cos(a)*r+.08,.13+rnd(seed,i+3)*.26,Math.sin(a)*r*.6],.025,wood,.01);}
 g.userData.tick=t=>{m.material.opacity=.73+.08*Math.sin(t*1.13);};return done(g,'Болотные лужи',0);
}
function titleLogo(seed=1){const g=new T.Group();beam(g,[0,0,0],[0,.72,0],.08,wood);box(g,0,1,0,3,.7,.08,wood);for(let i=0;i<11;i++)box(g,-1.25+i*.25,1.02,.065,.14,.25+rnd(seed,i)*.2,.03,i%3?steel:red);g.userData.tick=t=>g.rotation.y=.03*Math.sin(t*.3);return done(g,'BLACK TRAIN · знак меню',0);}
function crossingBell(seed=1){const g=new T.Group();beam(g,[0,0,0],[0,1.59,0],.07,wood);const cup=new T.Mesh(new T.CylinderGeometry(.1,.43,.61,14,1,true),steel);cup.position.y=1.17;g.add(cup);box(g,0,1.6,0,.09,.48,.09,iron);const cl=globe(g,0,.76,0,.12,wood);g.userData.tick=t=>{cl.position.x=.08*Math.sin(t*2.4);};return done(g,'Колокол переезда',.1);}
function chainsClank(seed=1){const g=hangingChains(seed);const q=globe(g,.16,1.2,0,.14,steel);g.userData.tick=t=>{q.position.x=.12*Math.sin(t*.81);};g.name='Звон цепей';return g;}
export const makers={crossingSign,redSignalLamp,hangingChains,gnarledTree,groundMist,stormClouds,brokenFence,tallGrass,wetRailGlow,barbedWire,swampPuddles,titleLogo,crossingBell,chainsClank};
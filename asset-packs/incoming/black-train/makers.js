import * as T from 'three';
// BLACK TRAIN — objects are true volumetric geometry, not screen-space glyphs.
const M={
 iron:new T.MeshStandardMaterial({color:0x111719,roughness:.65,metalness:.55}),
 ironEdge:new T.MeshStandardMaterial({color:0x394247,roughness:.53,metalness:.65}),
 soot:new T.MeshStandardMaterial({color:0x080b0d,roughness:.97}),
 wood:new T.MeshStandardMaterial({color:0x25201e,roughness:.98}),
 woodCut:new T.MeshStandardMaterial({color:0x4c3b31,roughness:1}),
 silver:new T.MeshStandardMaterial({color:0x5e686a,roughness:.32,metalness:.8}),
 red:new T.MeshBasicMaterial({color:0xb31717}),
 glow:new T.MeshBasicMaterial({color:0xf4e5cc}),
 glass:new T.MeshBasicMaterial({color:0xb9c5bc}),
 mist:new T.MeshStandardMaterial({color:0xa1adb2,emissive:0x161d22,emissiveIntensity:.18,roughness:1,transparent:true,opacity:.14,depthWrite:false,side:T.DoubleSide})
};
function random(seed){let s=(seed|0)||13;return()=>((s=(Math.imul(1664525,s)+1013904223)|0)>>>0)/4294967296;}
function add(g,geo,mat,x=0,y=0,z=0){const o=new T.Mesh(geo,mat);o.position.set(x,y,z);o.userData.watercolorOutline=true;g.add(o);return o;}
function box(g,w,h,d,mat,x,y,z){return add(g,new T.BoxGeometry(w,h,d),mat,x,y,z);}
function rod(g,a,b,r,mat,r2=r){const p=new T.Vector3(...a),q=new T.Vector3(...b),v=q.clone().sub(p),o=add(g,new T.CylinderGeometry(r2,r,v.length(),6,1),mat,...p.clone().add(q).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return o;}
function finish(g,footprint=0){g.userData.footprint=footprint;return g;}

function crossingSign(seed=2){
 const r=random(seed),g=new T.Group();g.name='Старинный переезд';
 const post=new T.Group();post.rotation.z=.065+r()*.05;g.add(post);
 rod(post,[0,0,0],[0,3.85,0],.115,M.wood);
 rod(post,[0,.15,.03],[.25,.02,.13],.06,M.woodCut);
 for(const angle of [-.78,.78]){
  // Each board is an extruded, water-damaged silhouette, not a perfect box.
  const board=new T.Group();board.position.set(0,3.16,.025);board.rotation.z=angle;post.add(board);
  const cut=new T.Shape(),chip=(r()-.5)*.075;
  cut.moveTo(-1.69,-.065);cut.lineTo(-1.58,-.14);cut.lineTo(-1.23,-.135);
  cut.lineTo(-.5,-.12);cut.lineTo(.22,-.135);cut.lineTo(1.39,-.115);
  cut.lineTo(1.64,-.075);cut.lineTo(1.7+chip,-.015);
  cut.lineTo(1.49,.045);cut.lineTo(1.68,.125);cut.lineTo(.48,.127);
  cut.lineTo(-.38,.113);cut.lineTo(-1.44,.134);cut.lineTo(-1.67,.078);
  cut.lineTo(-1.5,.012);cut.closePath();
  add(board,new T.ExtrudeGeometry(cut,{steps:1,depth:.19,bevelEnabled:false}),M.wood,0,0,-.095);
  // Deep split grain, irregular exposed fibers and rusted nail heads.
  for(const side of [-1,1]){
   const x=side*1.45;
   for(let k=0;k<3;k++){
    const y=-.065+k*.063,tip=x+side*(.17+r()*.23);
    rod(board,[x,y,.112],[tip,y+(r()-.5)*.085,.11],.009+r()*.006,M.woodCut,.002);
   }
   const nail=add(board,new T.SphereGeometry(.045,7,5),M.ironEdge,side*1.26,.01,.115);
   nail.scale.z=.38;
   rod(board,[side*.32,-.075,.115],[side*(.49+r()*.3),-.06+r()*.065,.114],.009,M.woodCut,.004);
  }
  for(let k=0;k<5;k++){
   const x=-1.15+k*.52+(r()-.5)*.13;
   rod(board,[x,-.095,.104],[x+.1+r()*.14,-.088+r()*.055,.105],.005,M.woodCut,.002);
  }
 }
 for(let i=0;i<12;i++){const y=.4+r()*3.2;box(post,.025,.15+r()*.14,.025,M.woodCut,.11,y,.09);}
 return finish(g,.28);
}
function redSignalLamp(seed=3){
 const g=new T.Group();g.name='Красный сигнальный фонарь';
 rod(g,[0,0,0],[0,2.75,0],.075,M.iron);
 const housing=add(g,new T.CylinderGeometry(.39,.39,.19,20),M.ironEdge,0,2.61,.12);housing.rotation.x=Math.PI/2;
 const lensMaterial=new T.MeshBasicMaterial({color:0x40090d});
 const lens=add(g,new T.CylinderGeometry(.295,.295,.06,24),lensMaterial,0,2.61,.26);lens.rotation.x=Math.PI/2;
 add(g,new T.TorusGeometry(.35,.06,7,24),M.iron,0,2.61,.30);
 for(let k=0;k<4;k++){const a=k*Math.PI/2;rod(g,[Math.cos(a)*.26,2.61+Math.sin(a)*.26,.32],[Math.cos(a+.45)*.09,2.61+Math.sin(a+.45)*.09,.35],.01,M.silver);}
 for(let k=0;k<6;k++)box(g,.018,.16+k*.055,.02,M.woodCut,-.16+k*.065,2.18-k*.04,.28);
 const l=new T.PointLight(0xd82420,0,13,1.8);l.position.set(0,2.65,.3);g.add(l);
 g.userData.interact={radius:8,effect:'warn_train',label_ru:'Сигнал приближения поезда'};
 g.userData.setApproach=(a,t)=>{
  const near=T.MathUtils.smoothstep(a,.06,.88);
  // An actual red warning flash in the LENS, not only an invisible point light.
  // Its smooth pulse accelerates as the train approaches; the idle lamp stays dim.
  const pulse=.5+.5*Math.sin(t*(2.4+8.1*near));
  const light=.09+near*(.48+3.7*pulse*pulse);
  l.intensity=light;
  lensMaterial.color.setRGB(.18+near*.75*pulse,.012+near*.037*pulse,.017+near*.035*pulse);
 };
 g.userData.tick=(t)=>{g.userData.setApproach(.4,t);housing.rotation.z=.02*Math.sin(t*.8);};
 return finish(g,.25);
}
function hangingChains(seed=4){
 const r=random(seed),g=new T.Group(),strands=[];
 rod(g,[0,0,0],[0,2.5,0],.039,M.iron);
 for(let j=0;j<3;j++){
  const chain=new T.Group(),links=[];chain.position.set((j-1)*.65,2.5+(j===1?.4:0),0);g.add(chain);strands.push({chain,links});
  const n=11+j*3;
  for(let k=0;k<n;k++){
   const link=add(chain,new T.TorusGeometry(.095,.022,5,9),k%3?M.silver:M.ironEdge,.08*Math.sin(k*.27),-k*.15,0);
   link.rotation.x=k%2?Math.PI/2:0;link.rotation.z=k*.11;links.push(link);
   if(k%4===0)add(chain,new T.SphereGeometry(.032,5,4),M.iron,k*.001,-k*.15,.03);
  }
 }
 g.userData.tick=t=>strands.forEach(({chain,links},j)=>{chain.rotation.z=.035*Math.sin(t*.56-j*.42);links.forEach((o,k)=>{o.rotation.z=k*.11+.07*Math.sin(t*.61-k*.18-j*.4);o.rotation.y=.024*Math.sin(t*.45-k*.13);});});
 return finish(g,0);
}
function gnarledTree(seed=5){
 const r=random(seed),g=new T.Group(),tips=[];g.name='Старое корявое дерево';
 const H=4.4+r()*2;
 let prev=[0,0,0];
 const path=[[.18,.7,.1],[-.26,1.5,.24],[-.5,2.6,.22],[-.28,3.65,.02],[-.4,H,-.18]];
 for(let i=0;i<path.length;i++){rod(g,prev,path[i],.43-i*.068,M.wood,.34-i*.066);prev=path[i];}
 for(let a=0;a<11;a++){
  const j=1+Math.floor(r()*3),start=path[j],side=a%2?1:-1,angle=r()*6.28;
  const mid=[start[0]+side*(.55+r()*.7),start[1]+.35+r()*.5,start[2]+Math.cos(angle)*.38];
  const end=[mid[0]+side*(.4+r()*.75),mid[1]+.45+r()*.5,mid[2]+Math.sin(angle)*.7];
  rod(g,start,mid,.16-r()*.045,M.wood,.1);
  const twig=new T.Group();twig.position.set(...mid);g.add(twig);tips.push(twig);
  rod(twig,[0,0,0],[end[0]-mid[0],end[1]-mid[1],end[2]-mid[2]],.085,M.wood,.015);
  for(let k=0;k<4;k++){
   const f=.35+k*.17,rel=[(end[0]-mid[0])*f,(end[1]-mid[1])*f,(end[2]-mid[2])*f];
   rod(twig,rel,[rel[0]+side*(.15+r()*.35),rel[1]+.24+r()*.3,rel[2]+(r()-.5)*.35],.024,M.woodCut,.004);
  }
 }
 for(let a=0;a<7;a++){const ang=a*6.283/7,dist=.5+r()*.4;rod(g,[0,.09,0],[Math.cos(ang)*dist,.015,Math.sin(ang)*dist],.12,M.wood,.02);}
 g.scale.setScalar(.78);
 g.userData.tick=t=>tips.forEach((tip,i)=>{tip.rotation.z=.014*Math.sin(t*.36-i*.22);tip.rotation.x=.017*Math.sin(t*.3-i*.38);});
 return finish(g,1.2);
}
function groundMist(seed=6){
 const r=random(seed),g=new T.Group(),sheets=[];
 // GPU alpha ribbons: a gently dissolving silhouette, never solid white triangles.
 const mat=new T.ShaderMaterial({
  uniforms:{uTime:{value:0}},
  transparent:true,depthWrite:false,side:T.DoubleSide,
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec2 vUv;uniform float uTime;
   float noise2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
   void main(){
     vec2 p=vUv;float t=uTime*.19;
     float ripple=.09*sin(p.x*14.+t)+.065*sin(p.x*29.-t*.7);
     float upper=.37+.19*sin(p.x*5.7+t*.5)+ripple;
     float rim=1.-smoothstep(upper-.16,upper+.12,p.y);
     float nearGround=smoothstep(.0,.11,p.y);
     float sides=smoothstep(.0,.17,p.x)*(1.-smoothstep(.83,1.,p.x));
     float trail=.73+.27*sin(p.x*19.-t+p.y*9.);
     float wisps=.82+.18*noise2(floor(vec2(p.x*22.+t,p.y*13.)));
     float a=.115*rim*nearGround*sides*trail*wisps;
     gl_FragColor=vec4(.22,.26,.27,a);
   }`
 });
 for(let i=0;i<12;i++){
   const w=2.4+r()*3.1,h=.75+r()*.48;
   const m=add(g,new T.PlaneGeometry(w,h,12,4),mat,(r()-.5)*10,h*.43+.03,(r()-.5)*4);
   m.rotation.y=(r()-.5)*1.1;sheets.push({m,x:m.position.x,i});
 }
 g.scale.x=.46;
 g.userData.tick=t=>{mat.uniforms.uTime.value=t;sheets.forEach(({m,x,i})=>{m.position.x=x+.17*Math.sin(t*.18-i*.34);m.rotation.y=.06*Math.sin(t*.16-i*.21);});};
 return finish(g,0);
}

function stormClouds(seed=7){
 const r=random(seed),g=new T.Group(),layers=[];
 const cloudMat=new T.MeshBasicMaterial({color:0x39454a,transparent:true,opacity:.63,side:T.DoubleSide,depthWrite:false});
 for(let j=0;j<5;j++){
  const sh=new T.Shape(),w=2+r()*2.5;
  sh.moveTo(-w/2,0);
  for(let k=0;k<=14;k++){const x=-w/2+w*k/14,y=.22+Math.sin(k/14*Math.PI)*(.25+r()*.3)+r()*.14;sh.lineTo(x,y);}
  sh.lineTo(w/2,-.26);sh.closePath();
  const mesh=add(g,new T.ShapeGeometry(sh),cloudMat,(r()-.5)*2.6,1+j*.42,-j*.32);
  layers.push({mesh,x:mesh.position.x,j});
 }
 g.userData.tick=t=>layers.forEach(({mesh,x,j})=>{mesh.position.x=x+.13*Math.sin(t*.1+j*.3);mesh.rotation.z=.015*Math.sin(t*.14+j);});
 return finish(g,0);
}
function brokenFence(seed=8){
 const r=random(seed),g=new T.Group();g.name='Поломанный забор';
 const posts=[];
 for(let i=0;i<6;i++){
  const x=-2.8+i*1.07,h=.65+r()*1.7;
  rod(g,[x,0,0],[x+(r()-.5)*.23,h,0],.12,M.wood,.065);
  for(let q=0;q<3;q++)rod(g,[x-.09,h*(q+.3)/4,.13],[x+.03,h*(q+.3)/4,.13],.024,M.woodCut);
  posts.push({x,h});
 }
 for(let k=0;k<2;k++){
  const y=.55+k*.85;
  for(let i=0;i<5;i++){
   const a=posts[i],b=posts[i+1],end= (i+k)%4===0?.61:1;
   rod(g,[a.x,y,0],[a.x+(b.x-a.x)*end,y+(r()-.5)*.3,.05],.055,M.woodCut,.045);
  }
 }
 return finish(g,.4);
}
function tallGrass(seed=9){
 const r=random(seed),g=new T.Group(),stems=[];g.name='Сухая болотная трава';
 for(let cl=0;cl<6;cl++){
  const tip=new T.Group();tip.position.set((r()-.5)*2.5,0,(r()-.5)*1.7);g.add(tip);stems.push(tip);
  for(let k=0;k<7;k++){
   const x=(r()-.5)*.29,z=(r()-.5)*.22,h=.42+r()*1.05;
   rod(tip,[x,0,z],[x+(r()-.5)*.2,h,z+(r()-.5)*.15],.014,M.woodCut,.004);
   if(k%3===0)add(tip,new T.ConeGeometry(.06,.25,5),M.wood,x,h-.1,z);
  }
 }
 g.userData.tick=t=>stems.forEach((s,i)=>{s.rotation.z=.06*Math.sin(t*.7-i*.4);s.rotation.x=.035*Math.sin(t*.6+i*.6);});
 return finish(g,0);
}
function wetRailGlow(seed=10){
 const r=random(seed),g=new T.Group(),reflection=[];
 const wet=new T.MeshBasicMaterial({color:0x848d92,transparent:true,opacity:.3,depthWrite:false});
 const blood=new T.MeshBasicMaterial({color:0x6f1719,transparent:true,opacity:.23,depthWrite:false});
 for(const z of [-.78,.78]){
  const m=box(g,5,.012,.035,wet,0,.205,z);reflection.push(m);
  for(let i=0;i<12;i++){
   const k=box(g,.03+r()*.14,.007,.06,blood,-2.4+i*.42,.213,z+(r()-.5)*.08);
   k.rotation.y=(r()-.5)*.2;
  }
 }
 for(let i=0;i<10;i++){
  const m=box(g,.12+r()*.3,.012,.3+r()*.2,blood,-2.5+i*.55,.13,(r()-.5)*.7);
  reflection.push(m);
 }
 g.userData.setApproach=(a,t)=>{
  const near=T.MathUtils.smoothstep(a,.06,.88);
  const pulse=.5+.5*Math.sin(t*(2.4+8.1*near));
  blood.opacity=.045+.40*near*pulse*pulse;
  wet.opacity=.14+.13*near*pulse;
 };
 g.userData.tick=t=>{reflection[0].position.y=.205+.003*Math.sin(t*1.1);};
 return finish(g,0);
}
function barbedWire(seed=11){
 const r=random(seed),g=new T.Group(),wire=new T.Group();g.name='Проволока с шипами';
 for(const x of [-2.3,2.3]){
  const tip=x+(x<0?-.18:.1);rod(g,[x,0,0],[tip,1.6,0],.055,M.iron,.038);
 }
 const pts=[];for(let i=0;i<=32;i++){const x=-2.3+4.6*i/32;pts.push([x,1.39-.17*Math.sin(Math.PI*i/32)+.01*Math.sin(i*.8),0]);}
 for(let i=0;i<32;i++)rod(wire,pts[i],pts[i+1],.017,M.ironEdge);
 for(let i=1;i<32;i+=2){
  const [x,y,z]=pts[i];
  for(const sign of [-1,1]){
   rod(wire,[x,y,z],[x+sign*(.10+r()*.06),y+sign*.16,z+sign*.03],.018,M.silver,.002);
  }
 }
 g.add(wire);
 g.userData.tick=t=>{wire.rotation.x=.006*Math.sin(t*.7);};
 return finish(g,0);
}
function swampPuddles(seed=12){
 const r=random(seed),g=new T.Group(),ripples=[];
 g.name='Отражения в болотных лужах';
 // Broken shorelines and subtle physical pooling. Two separately driven highlights
 // reflect the cold approaching headlamp and the red level-crossing warning.
 const water=new T.MeshStandardMaterial({color:0x222b2e,metalness:.56,roughness:.19,transparent:true,opacity:.88,side:T.DoubleSide});
 const blood=new T.MeshBasicMaterial({color:0xcc2527,transparent:true,opacity:.05,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending});
 const cold=new T.MeshBasicMaterial({color:0xa8babd,transparent:true,opacity:.04,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending});
 for(let j=0;j<3;j++){
  const shape=new T.Shape(),radius=.49+r()*.47,n=25;
  for(let i=0;i<=n;i++){
   const a=i/n*Math.PI*2,irregular=radius*(.74+.22*Math.sin(a*3+j)+.14*Math.sin(a*7+j*.8)+.11*r());
   const x=Math.cos(a)*irregular,z=Math.sin(a)*irregular;
   if(i===0)shape.moveTo(x,z);else shape.lineTo(x,z);
  }
  const px=(j-1)*1.28,pz=(r()-.5)*.55;
  const pool=add(g,new T.ShapeGeometry(shape),water,px,.026,pz);
  pool.rotation.x=-Math.PI/2;
  // Fractured, elongated streaks on the surface, not glowing disks.
  for(let k=0;k<17;k++){
   const a=r()*Math.PI*2,rad=r()*.63,red=k%3===0;
   const strip=add(g,new T.PlaneGeometry(.055+r()*(red?.19:.25),.005+r()*.022),
     red?blood:cold,px+Math.cos(a)*rad,.037+r()*.004,pz+Math.sin(a)*rad);
   strip.rotation.x=-Math.PI/2;strip.rotation.z=(r()-.5)*.32;
   ripples.push({mesh:strip,phase:k*.47+j*1.2,baseY:strip.position.y,angle:strip.rotation.z});
  }
  // Sparse tufts and shore stones break the contour into irregular silhouettes.
  for(let k=0;k<9;k++){
   const a=k*Math.PI*2/9+r()*.34,dist=radius*(.82+r()*.35);
   const x=px+Math.cos(a)*dist,z=pz+Math.sin(a)*dist;
   if(k%3===0){
    const stone=add(g,new T.DodecahedronGeometry(.095+r()*.09,0),M.woodCut,x,.037,z);
    stone.scale.set(1.2,.38,.8);stone.rotation.y=a;
   }else{
    rod(g,[x,0,z],[x+(r()-.5)*.11,.16+r()*.21,z+(r()-.5)*.09],.009,M.woodCut,.002);
   }
  }
 }
 g.userData.setApproach=(a,t)=>{
  const near=T.MathUtils.smoothstep(a,.08,.92);
  const pulse=.5+.5*Math.sin(t*(2.4+8.1*near));
  blood.opacity=.035+near*(.09+.56*pulse*pulse);
  cold.opacity=.03+near*(.06+.19*pulse);
 };
 g.userData.tick=t=>ripples.forEach(({mesh,phase,baseY,angle})=>{
  mesh.position.y=baseY+.003*Math.sin(t*.8-phase);
  mesh.rotation.z=angle+.022*Math.sin(t*.41-phase*.73);
 });
 return finish(g,0);
}
function titleLogo(seed=13){
 // The source geometry is the menu-only plaque; actual letters are CSS in the menu.
 const g=new T.Group(),r=random(seed);
 box(g,4.5,.65,.12,M.soot,0,.4,0);
 for(let i=0;i<11;i++){
  const x=-2.1+i*.42;
  box(g,.07,.32+r()*.16,.07,M.ironEdge,x,.5,0);
  box(g,.07,.07,.09,M.red,x,.17,0);
 }
 for(let i=0;i<12;i++){
  const x=-2.2+i*.39;rod(g,[x,.08,0],[x+.12,.04+r()*.1,0],.027,M.red);
 }
 return finish(g,0);
}
function crossingBell(seed=14){
 const g=new T.Group(),r=random(seed);g.name='Колокол переезда';
 rod(g,[0,0,0],[0,2.1,0],.07,M.iron);
 rod(g,[0,2.05,0],[.52,2.1,0],.065,M.ironEdge);
 const bell=add(g,new T.CylinderGeometry(.19,.31,.46,12,1,true),M.silver,.51,1.75,0);
 add(g,new T.TorusGeometry(.31,.035,5,12),M.ironEdge,.51,1.51,0).rotation.x=Math.PI/2;
 rod(g,[.51,1.62,0],[.51,1.29,0],.036,M.iron);
 const striker=add(g,new T.SphereGeometry(.08,9,7),M.ironEdge,.51,1.31,0);
 // Articulated yoke, steel bolt heads and a raised lip: this is a real bell,
 // not a primitive cylinder. Detail matches the reference INK geometry bar.
 for(const z of [-.2,.2]){
   rod(g,[.31,1.99,z],[.51,1.91,z],.035,M.ironEdge);
   rod(g,[.51,1.91,z],[.51,1.76,z],.03,M.silver);
   add(g,new T.SphereGeometry(.05,8,6),M.ironEdge,.51,1.93,z);
 }
 for(let i=0;i<10;i++){
   const a=i*6.283/10;
   const x=.51+Math.cos(a)*.295,z=Math.sin(a)*.295;
   add(g,new T.SphereGeometry(.036,6,6),M.ironEdge,x,1.52,z);
 }
 add(g,new T.CylinderGeometry(.18,.17,.09,14),M.ironEdge,.51,2.03,0);
 g.userData.tick=t=>{bell.rotation.z=.06*Math.sin(t*2.5);striker.position.x=.51+.08*Math.sin(t*2.5-.4);};
 return finish(g,.2);
}
function chainsClank(seed=15){
 const g=new T.Group(),r=random(seed),links=[];
 rod(g,[0,0,0],[0,2.3,0],.045,M.iron);
 for(let i=0;i<15;i++){
  const o=add(g,new T.TorusGeometry(.095,.019,5,9),i%2?M.silver:M.ironEdge,.09*Math.sin(i*.3),2.25-i*.15,(r()-.5)*.07);
  o.rotation.x=i%2?Math.PI/2:0;links.push(o);
 }
 g.userData.tick=t=>links.forEach((o,i)=>{o.rotation.z=.03*Math.sin(t*.7-i*.16);});
 return finish(g,0);
}

export const makers={crossingSign,redSignalLamp,hangingChains,gnarledTree,groundMist,stormClouds,brokenFence,tallGrass,wetRailGlow,barbedWire,swampPuddles,titleLogo,crossingBell,chainsClank};

import * as T from 'three';
// BLACK TRAIN — original, deterministic, articulated ink assets.
// Coordinates in metres. Geometry is the visible shape; light is never used as a substitute.
const C={black:'#08090b',steel:'#20262a',iron:'#32373a',edge:'#4b4e4b',wood:'#1b1717',rust:'#57372e',glass:'#6b0b0c',red:'#bb1a17',white:'#aeb9b6'};
const mat=(key,extra={})=>new T.MeshStandardMaterial({color:C[key]||key,roughness:.83,metalness:key==='steel'||key==='iron'?.52:.05,...extra});
const M=Object.fromEntries(Object.keys(C).map(k=>[k,mat(k)]));
const emissive=(color,power=2)=>new T.MeshBasicMaterial({color:new T.Color(color).multiplyScalar(power)});
const rng=seed=>{let s=(Math.floor(seed)||1)>>>0;return()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296)};
function part(g,geo,m,pos=[0,0,0],rot=[0,0,0]){
 const o=new T.Mesh(geo,m);o.position.set(...pos);o.rotation.set(...rot);o.userData.watercolorOutline=true;g.add(o);return o;
}
const block=(g,dim,m,p,r=[0,0,0])=>part(g,new T.BoxGeometry(...dim),m,p,r);
const rod=(g,a,b,r,m,steps=6)=>{const d=new T.Vector3(...b).sub(new T.Vector3(...a)),mesh=part(g,new T.CylinderGeometry(r*.78,r,d.length(),steps),m,[...(new T.Vector3(...a).addScaledVector(d,.5).toArray())]);mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return mesh;};
const curve=(g,p,r,m,segments=9)=>part(g,new T.TubeGeometry(new T.CatmullRomCurve3(p.map(x=>new T.Vector3(...x))),segments,r,5,false),m);
function foot(g,size){g.userData.footprint=size;return g;}
function blackLocomotive(seed=1){
 const g=foot(new T.Group(),0),rnd=rng(seed);g.name='blackLocomotive';
 // Heavy vertical front, deliberately unlike the original streamlined express.
 block(g,[8.9,2.55,2.72],M.black,[-4.75,2.15,0]);
 block(g,[.57,3.12,2.83],M.iron,[-.45,2.36,0]);
 block(g,[8.7,.36,3.0],M.iron,[-4.8,.94,0]);
 block(g,[8.4,.31,2.7],M.steel,[-4.9,3.6,0]);
 block(g,[2.4,1.18,2.3],M.black,[-7.15,4.07,0]);
 block(g,[.4,3.1,.28],M.wood,[-.14,2.37,-1.46]);
 block(g,[.4,3.1,.28],M.wood,[-.14,2.37,1.46]);
 // Riveted roof rim, serrated guards, shutters, dripping tar.
 for(let i=0;i<13;i++){const x=-.7-i*.65;
   for(const z of [-1.39,1.39]){
     part(g,new T.SphereGeometry(.062,6,4),M.rust,[x,3.53,z]);
     rod(g,[x,1.35,z],[x,1.7+rnd()*.35,z],.033,M.rust);
   }
 }
 for(let i=0;i<9;i++){
   const x=-1.0-i*.82;
   block(g,[.10,.26,.24],M.edge,[x,3.82,1.19]);
   block(g,[.10,.26,.24],M.edge,[x,3.82,-1.19]);
 }
 // Grimy upper windows framed in individual strips.
 for(let i=0;i<4;i++){const z=-.92+i*.61;
   block(g,[.075,.40,.39],emissive('#e6b98a',.46+rnd()*.15),[-.096,3.64,z]);
   for(const h of [3.42,3.87])block(g,[.11,.035,.44],M.iron,[-.04,h,z]);
   for(const w of [-.22,.22])block(g,[.12,.46,.028],M.iron,[-.02,3.64,z+w]);
 }
 const lampEyes=[];
 for(const z of [-.86,.86]){
   rod(g,[-.14,1.55,z],[.08,1.55,z],.30,M.iron,12);
   const lens=part(g,new T.CylinderGeometry(.205,.205,.07,20),emissive('#dfc8ae',2.7),[.12,1.55,z],[0,0,Math.PI/2]);lampEyes.push(lens);
   part(g,new T.TorusGeometry(.22,.04,6,20),M.steel,[.17,1.55,z],[0,Math.PI/2,0]);
 }
 const head=part(g,new T.CylinderGeometry(.39,.42,.36,16),M.iron,[-.45,4.47,0],[0,0,Math.PI/2]);
 const cap=part(g,new T.CylinderGeometry(.25,.25,.08,16),emissive('#e1e8df',2.8),[-.14,4.47,0],[0,0,Math.PI/2]);
 const mast=rod(g,[-.55,3.59,0],[-.55,4.42,0],.11,M.steel);
 // Two side ladders with real separate rungs.
 for(const z of [-1.53,1.53]){
   for(const x of [-8.1,-7.48])rod(g,[x,1.05,z],[x,3.49,z],.045,M.iron);
   for(let i=0;i<10;i++)rod(g,[-8.1,1.24+i*.225,z],[-7.48,1.24+i*.225,z],.035,M.steel);
 }
 // Bolted side panels; wheels sit below and maintain a continuous dark underbody.
 for(let i=0;i<6;i++)for(const z of [-1.46,1.46]){
   const x=-1.85-i*1.1;
   block(g,[.95,.64,.075],i%3?M.black:M.iron,[x,2.2,z]);
   part(g,new T.SphereGeometry(.045,6,4),M.rust,[x+.39,2.44,z+(z>0?.05:-.05)]);
 }
 const wheels=[];
 for(const z of [-1.07,1.07])for(const x of [-1.8,-4.4,-7]){
   const w=part(g,new T.CylinderGeometry(.57,.57,.19,14),M.iron,[x,.60,z],[Math.PI/2,0,0]);
   part(w,new T.TorusGeometry(.44,.045,5,14),M.steel,[0,0,.12]);wheels.push(w);
 }
 rod(g,[-.2,.48,0],[.28,.48,0],.13,M.iron);
 // Jagged exhaust fins and cables that follow the roofline.
 for(let i=0;i<5;i++)rod(g,[-3.5-i*.75,3.75,-.24],[-3.6-i*.75,4.05+(i%2)*.12,-.26],.072,M.iron);
 curve(g,[[-8.4,3.77,.7],[-6.3,3.95,.77],[-4.9,4.01,.68],[-2.3,3.94,.82]],.04,M.rust);
 const light=new T.SpotLight('#e1e9e8',360,90,.27,.8,1.8);light.position.set(-.06,4.48,0);light.target.position.set(24,1,0);g.add(light,light.target);
 g.userData.tick=t=>{const b=1+.07*Math.sin(t*1.23);light.intensity=360*b;cap.material.color.setRGB(1.4*b,1.5*b,1.4*b);for(const w of wheels)w.rotation.y=t*.12;};
 return g;
}
function crossingSign(seed=1){
 const g=foot(new T.Group(),.55),rnd=rng(seed);g.name='crossingSign';
 const tilt=(rnd()-.5)*.14;
 const post=new T.Group();post.rotation.z=tilt;g.add(post);
 block(post,[.17,4.3,.20],M.wood,[0,2.15,0],[.05,0,0]);
 for(let i=0;i<11;i++)block(post,[.19,.055,.23],i%3?M.black:M.rust,[0,.55+i*.31,0]);
 for(const a of [-Math.PI/4,Math.PI/4]){
   block(post,[2.45,.27,.18],M.wood,[0,3.47,.15],[0,0,a]);
   block(post,[2.15,.06,.04],M.edge,[0,3.49,.25],[0,0,a]);
   for(let i of [-1,1])part(post,new T.SphereGeometry(.045,5,5),M.iron,[Math.cos(a)*i*.79,3.47+Math.sin(a)*i*.79,.26]);
 }
 const root=part(g,new T.ConeGeometry(.46,.8,7),M.black,[0,.37,0]);root.rotation.z=Math.PI;
 return g;
}
function redSignalLamp(seed=1){
 const g=foot(new T.Group(),0),rnd=rng(seed);g.name='redSignalLamp';
 block(g,[.2,2.75,.25],M.wood,[0,1.38,0]);
 block(g,[.75,.14,.17],M.iron,[.34,2.45,.1]);
 const frame=part(g,new T.CylinderGeometry(.43,.43,.21,18),M.iron,[.59,2.45,.2],[Math.PI/2,0,0]);
 const glass=part(g,new T.CylinderGeometry(.34,.34,.055,24),emissive('#ad0305',.82),[.59,2.45,.36],[Math.PI/2,0,0]);
 part(g,new T.TorusGeometry(.36,.065,8,24),M.steel,[.59,2.45,.4]);
 for(let i=0;i<5;i++){const a=i*2.2;
   const x=.59+Math.cos(a)*.28,y=2.45+Math.sin(a)*.28;
   rod(g,[x,y,.41],[.59+Math.cos(a+.3)*.12,2.45+Math.sin(a+.3)*.12,.42],.011,M.black,4);
 }
 for(let i=0;i<6;i++)block(g,[.018,.15+i*.04,.025],M.rust,[.34+i*.077,2.01-(i%3)*.10,.42]);
 const light=new T.PointLight('#d31819',0,8,2);light.position.set(.59,2.45,.6);g.add(light);
 g.userData.interact={radius:3,effect:'reveal_far',label_ru:'Предупреждение: поезд близко'};
 g.userData.tick=t=>{const b=.65+.35*Math.sin(t*3.1+seed*.14);glass.position.z=.36+.007*Math.sin(t*1.3);light.intensity=Math.max(0,9*b);};
 g.userData.setApproach=p=>{g.userData.approach=p;};g.userData.light=light;g.userData.glass=glass;
 return g;
}
function hangingChains(seed=1){
 const g=foot(new T.Group(),0),rnd=rng(seed);g.name='hangingChains';
 const strands=[];
 for(let j=0;j<2;j++){const strand=new T.Group();strand.position.set(j*.77,3.5-j*.36,0);g.add(strand);
  const links=[];let parent=strand;
  for(let i=0;i<13+j*4;i++){
    const pivot=new T.Group();pivot.position.y=i?-.19:0;parent.add(pivot);
    part(pivot,new T.TorusGeometry(.135,.03,6,12),i%5===0?M.rust:M.steel,[0,-.10,0],[0,i%2?Math.PI/2:0,0]);
    links.push(pivot);parent=pivot;
  }strands.push(links);
 }
 rod(g,[0,3.48,0],[.76,3.12,0],.09,M.rust);
 g.userData.tick=t=>{strands.forEach((chain,j)=>chain.forEach((pivot,i)=>{pivot.rotation.z=.018*Math.sin(.72*t-i*.17+j*.8);pivot.rotation.x=.012*Math.sin(.56*t-i*.22+j);}));};
 return g;
}
function gnarledTree(seed=1){
 const g=foot(new T.Group(),.83),rnd=rng(seed);g.name='gnarledTree';
 const h=4.1+rnd()*1.7,lean=(rnd()-.5)*1.3;
 curve(g,[[0,0,0],[.13,.35,0],[lean*.36,1.5,.06],[lean,3.0,-.14],[lean+.19,h,.07]],.22+rnd()*.06,M.wood,13);
 for(let k=0;k<5;k++){const a=k*Math.PI*2/5+rnd()*.5;const ex=Math.cos(a)*(1.0+rnd()*.3),ez=Math.sin(a)*(1.0+rnd()*.3);
   curve(g,[[0,.34,0],[ex*.5,.15,ez*.45],[ex,0,ez]],.11,M.wood,6);
 }
 const tips=[];
 for(let i=0;i<7;i++){
   const a=i*2.399+(rnd()-.5)*.4,side=i%2?1:-1,from=[lean*(.26+i*.072),1.65+i*.40,.03];
   const len=1.05+rnd()*1.25,outer=[from[0]+Math.cos(a)*len,from[1]+.42+rnd()*.60,from[2]+Math.sin(a)*len];
   const branch=new T.Group();branch.position.set(...from);g.add(branch);
   const rel=outer.map((v,k)=>v-from[k]);
   curve(branch,[[0,0,0],[rel[0]*.45,.18,rel[2]*.38],rel],.078-i*.004,M.wood,7);
   for(let j=0;j<4;j++){const u=.45+j*.13,r2=[rel[0]*u,rel[1]*u,rel[2]*u];
      curve(branch,[r2,[r2[0]+Math.cos(a+j)*.30,r2[1]+.34,r2[2]+Math.sin(a+j)*.3],[r2[0]+Math.cos(a+j)*.56,r2[1]+.65+rnd()*.3,r2[2]+Math.sin(a+j)*.56]],.018,M.edge,5);
   }tips.push(branch);
 }
 g.userData.tick=t=>tips.forEach((b,i)=>{b.rotation.x=.014*Math.sin(t*.31-i*.21);b.rotation.z=.011*Math.sin(t*.27-i*.19);});
 return g;
}
function groundMist(seed=1){
 const g=foot(new T.Group(),0),rnd=rng(seed);g.name='groundMist';
 const mistMat=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,fog:false,
  uniforms:{uTime:{value:0},uGlow:{value:.3}},
  vertexShader:'varying vec2 uv0;void main(){uv0=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'varying vec2 uv0;uniform float uTime,uGlow;float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec2 p=uv0;float n=h(floor(p*vec2(17.,4.))+floor(uTime*.2));float edge=smoothstep(.0,.22,p.y)*(1.-smoothstep(.65,1.,p.y));float tear=smoothstep(.18,.52,n+.2*sin(p.x*9.+uTime*.17));float a=edge*tear*.23;gl_FragColor=vec4(vec3(.21,.24,.25)*uGlow,a);}'
 });
 const sheets=[];
 for(let i=0;i<11;i++){const w=1.0+rnd()*2,h=.46+rnd()*.39;
  const m=part(g,new T.PlaneGeometry(w,h,12,3),mistMat,[(rnd()-.5)*3,.24+rnd()*.25,(rnd()-.5)*2]);
  m.rotation.y=rnd()*6.283;sheets.push({m,phase:rnd()*6.283,base:m.position.x});
 }
 g.userData.tick=t=>{mistMat.uniforms.uTime.value=t;sheets.forEach(({m,phase,base},i)=>{m.position.x=base+.14*Math.sin(t*.16+phase);m.rotation.y+=0;});};
 g.userData.setGlow=k=>{mistMat.uniforms.uGlow.value=k;};
 return g;
}
export const makers={blackLocomotive,crossingSign,redSignalLamp,hangingChains,gnarledTree,groundMist};

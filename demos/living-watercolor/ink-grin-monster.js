import * as T from 'three';

// INK — The Grinning Hollow. True volumetric, articulated creature.
// Reference: wide ringed eyes and irregular tooth-filled grin, elongated wet black body.
// The accepted INK watercolor renderer and frozen references remain unchanged.
const COLORS = {
  pitch:'#13191c', soot:'#202529', hide:'#292e32', belly:'#303638',
  bone:'#bfc6c5', ivory:'#d7d7ce', gums:'#303039',
  lacquer:'#506167', deep:'#080b0e', rim:'#8d9695'
};
const MAT = new Map();
let patina = null;
function seeded(seed) {
  let s=(Math.floor(seed)||191)*1|0;
  return () => ((s=(Math.imul(s,1664525)+1013904223)|0)>>>0)/4294967296;
}
function makePatina() {
  if (patina) return patina;
  const canvas=document.createElement('canvas');
  canvas.width=canvas.height=256;
  const ctx=canvas.getContext('2d');
  const rnd=seeded(11737);
  ctx.fillStyle='#e3e3e0';ctx.fillRect(0,0,256,256);
  for (let i=0;i<1300;i++) {
    const x=rnd()*256,y=rnd()*256,rx=.7+rnd()*12,ry=.6+rnd()*23;
    ctx.fillStyle=['#31383d','#707a7a','#c0c5bf','#8c9894'][Math.floor(rnd()*4)];
    ctx.globalAlpha=.018+rnd()*.19;
    ctx.beginPath();ctx.ellipse(x,y,rx,ry,rnd()*6.28,0,Math.PI*2);ctx.fill();
  }
  for (let i=0;i<94;i++) {
    const x=rnd()*256,y=rnd()*256,len=12+rnd()*70;
    ctx.strokeStyle='#eef4eb';ctx.globalAlpha=.03+rnd()*.07;
    ctx.lineWidth=.35+rnd()*1.9;
    ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x-2,y+len*.3,x+3,y+len*.7,x+2,y+len);ctx.stroke();
  }
  ctx.globalAlpha=1;
  patina=new T.CanvasTexture(canvas);
  patina.colorSpace=T.SRGBColorSpace;
  patina.wrapS=patina.wrapT=T.RepeatWrapping;
  return patina;
}
function material(id) {
  if (MAT.has(id)) return MAT.get(id);
  let m;
  if (id==='ivory' || id==='bone' || id==='rim') {
    m=new T.MeshPhongMaterial({color:COLORS[id],shininess:32,specular:'#8e9a97'});
  } else if (id==='ring') {
    m=new T.MeshPhongMaterial({color:'#d9ddd6',emissive:'#3a403e',shininess:20,specular:'#9aa3a0'});
  } else if (id==='glint') {
    m=new T.MeshBasicMaterial({color:'#b7c9cc',transparent:true,opacity:.46,depthWrite:false});
  } else if (id==='black') {
    m=new T.MeshBasicMaterial({color:'#070a0e'});
  } else {
    m=new T.MeshPhysicalMaterial({
      color:COLORS[id]||COLORS.hide,map:makePatina(),roughness:.46,metalness:.04,
      clearcoat:.5,clearcoatRoughness:.3,flatShading:false
    });
  }
  MAT.set(id,m);
  return m;
}
function part(group,geo,mat,p=[0,0,0],outline=true) {
  const o=new T.Mesh(geo,typeof mat==='string'?material(mat):mat);
  o.position.set(...p);o.userData.watercolorOutline=outline;
  group.add(o);return o;
}
const ico=new T.IcosahedronGeometry(1,2);
function lump(group,p,s,mat='hide',outline=true) {
  const o=part(group,ico,mat,p,outline);o.scale.set(...s);return o;
}
function stroke(group,points,r,mat='soot',outline=false) {
  const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
  return part(group,new T.TubeGeometry(curve,Math.max(12,points.length*7),r,5,false),mat,[0,0,0],outline);
}
function strand(group,start,end,r0,r1,mat='hide') {
  // A tapered fleshy tendon, not a flat plane or image.
  const a=new T.Vector3(...start),b=new T.Vector3(...end);
  const d=b.clone().sub(a),h=d.length();
  const geo=new T.CylinderGeometry(r1,r0,h,9,5);
  const m=part(group,geo,mat,[0,0,0]);
  m.position.copy(a).add(b).multiplyScalar(.5);
  m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());
  return m;
}
function drop(parent,p,len,seed) {
  const rnd=seeded(seed),x=p[0],y=p[1],z=p[2];
  const shape=[
    [x,y,z],[x+.025+rnd()*.03,y-len*.35,z+.015],
    [x-.016+rnd()*.02,y-len*.72,z+.042],
    [x+.006,y-len,z+.035]
  ];
  stroke(parent,shape,.012+rnd()*.013,'lacquer',false);
  lump(parent,shape[3],[.022,.040,.025],'glint',false);
}
function tooth(group,x,y,z,w,h,up,index) {
  // Full extruded, uneven enamel. Individual 3D teeth (not a mouth texture).
  const dir=up?1:-1,bevel=Math.min(.022,w*.17);
  const shape=new T.Shape();
  shape.moveTo(-w*.49,0);
  shape.lineTo(w*.49,0);
  shape.lineTo(w*(.46+index%3*.025),dir*h*.76);
  shape.lineTo(w*(.34+index%2*.04),dir*h);
  shape.lineTo(-w*.34,dir*h*(index%4===0?.87:1));
  shape.lineTo(-w*.47,dir*h*.74);
  shape.closePath();
  const geo=new T.ExtrudeGeometry(shape,{
    depth:.09,steps:1,bevelEnabled:true,bevelThickness:.017,
    bevelSize:bevel,bevelSegments:1,curveSegments:2
  });
  const m=part(group,geo,index%6===0?'bone':'ivory',[x,y,z],false);
  m.rotation.z=(index%4-1.5)*.025;
  return m;
}
function makeHand(wrist,side,seed) {
  const rnd=seeded(seed);
  lump(wrist,[0,-.14,.06],[.132,.29,.112],'soot');
  lump(wrist,[0,-.30,.084],[.10,.13,.12],'belly',false);
  const fingers=[];
  for (let i=0;i<5;i++) {
    const x=(i-2)*.061,reach=.43+(.14-Math.abs(i-2)*.042)+rnd()*.04;
    const finger=new T.Group();
    finger.position.set(x,-.30,.06);
    wrist.add(finger);fingers.push(finger);
    const xend=x*.30+(i-2)*.042;
    stroke(finger,[[0,0,0],[xend*.65,-reach*.45,.08],
      [xend,-reach*.84,.16],[xend*1.10,-reach,.16]],.018,'hide');
    const claw=part(finger,new T.ConeGeometry(.027,.145,6),'bone',
      [xend*1.10,-reach-.056,.16],false);
    claw.rotation.x=Math.PI;
    if (i%2===0) drop(finger,[xend,-reach*.84,.16],.09,seed+i);
  }
  return fingers;
}
function makeArm(chest,side,seed) {
  const shoulder=new T.Group();
  shoulder.position.set(side*.47,1.16,.035);chest.add(shoulder);
  lump(shoulder,[0,-.08,0],[.22,.23,.23],'soot');
  strand(shoulder,[0,-.1,0],[side*.22,-1.21,.11],.14,.105,'hide');
  strand(shoulder,[side*.04,-.17,.15],[side*.20,-1.02,.17],.052,.031,'belly');
  const elbow=new T.Group();
  elbow.position.set(side*.22,-1.21,.11);shoulder.add(elbow);
  lump(elbow,[0,0,0],[.125,.17,.13],'soot');
  strand(elbow,[0,0,0],[side*.08,-1.26,.24],.115,.056,'hide');
  strand(elbow,[side*.04,-.11,.13],[side*.09,-1.02,.24],.041,.018,'belly');
  const wrist=new T.Group();
  wrist.position.set(side*.08,-1.26,.24);elbow.add(wrist);
  const fingers=makeHand(wrist,side,seed+13);
  for(let j=0;j<4;j++)drop(shoulder,[side*(.08+j*.03),-.32-j*.23,.17],
    .10+j*.024,seed+j*17);
  return {shoulder,elbow,wrist,fingers,side};
}
function makeLeg(root,side,seed) {
  const hip=new T.Group();
  hip.position.set(side*.24,2.03,0);root.add(hip);
  lump(hip,[0,-.12,0],[.21,.22,.23],'soot');
  strand(hip,[0,-.11,0],[side*.105,-1.04,.08],.18,.115,'hide');
  strand(hip,[side*.05,-.2,.13],[side*.09,-.87,.22],.057,.036,'belly');
  const knee=new T.Group();
  knee.position.set(side*.105,-1.04,.08);hip.add(knee);
  lump(knee,[0,0,0],[.13,.15,.15],'soot');
  strand(knee,[0,-.09,0],[side*.065,-.76,-.08],.109,.052,'hide');
  const foot=new T.Group();
  foot.position.set(side*.065,-.76,-.08);knee.add(foot);
  lump(foot,[0,-.07,.21],[.17,.105,.38],'soot');
  for(let i=-1;i<=1;i++) {
    const x=i*.086;
    stroke(foot,[[x,-.10,.24],[x*1.18,-.10,.53],[x*1.20,-.065,.65]],
      .027,'hide');
    const talon=part(foot,new T.ConeGeometry(.031,.15,7),'bone',
      [x*1.20,-.065,.68],false);
    talon.rotation.x=Math.PI/2;
  }
  return {hip,knee,foot,side};
}
function fang(group,x,y,z,w,h,up,index) {
  // Long, narrow, crooked enamel shard: each one a real extruded 3D tooth.
  const dir=up?1:-1;
  const shape=new T.Shape();
  shape.moveTo(-w*.5,0);
  shape.lineTo(w*.5,0);
  shape.lineTo(w*.43,dir*h*.58);
  shape.lineTo(w*(.14+index%3*.07),dir*h);
  shape.lineTo(-w*(.18+index%2*.10),dir*h*(index%4===0?.86:.95));
  shape.lineTo(-w*.45,dir*h*.52);
  shape.closePath();
  const geo=new T.ExtrudeGeometry(shape,{
    depth:.075,steps:1,bevelEnabled:true,bevelThickness:.014,
    bevelSize:Math.min(.016,w*.16),bevelSegments:1,curveSegments:2
  });
  const m=part(group,geo,index%4===0?'bone':'ivory',[x,y,z],false);
  m.rotation.z=Math.sin(index*12.9898)*.13;
  m.rotation.y=-x*.45;
  return m;
}
function grinFace(head) {
  // Elongated skull; the face is modelled, never pasted as an image.
  const surfZ=(x,y)=>.04+.62*Math.sqrt(Math.max(0,1-(x/.86)**2-((y-.42)/1.0)**2));
  const skull=lump(head,[0,.42,.04],[.86,1.0,.62],'pitch');
  skull.rotation.x=-.06;
  for(const side of [-1,1]) {
    lump(head,[side*.50,-.20,.27],[.40,.40,.40],'soot');
    lump(head,[side*.66,.05,.20],[.36,.42,.36],'soot');
  }
  lump(head,[0,-.10,.42],[.70,.25,.30],'pitch');
  // Forehead furrows.
  for(let k=0;k<5;k++) {
    const y=.86+k*.105,half=.50-k*.07,pts=[];
    for(let n=0;n<=8;n++) {
      const x=-half+n*half/4,yy=y+.035*Math.sin(n*1.7+k*2.1)-.05*Math.abs(x);
      pts.push([x,yy,surfZ(x,yy)+.012]);
    }
    stroke(head,pts,.02+.004*(k%2),'lacquer',false);
  }
  const eyes=[];
  for(const side of [-1,1]) {
    // Asymmetric, deep-set eyes: thin uneven pale rings inside black pits.
    const big=side<0?1.12:.90,ex=side*.43,ey=.55+(side<0?-.02:.03);
    lump(head,[ex,ey,.47],[.30*big,.30*big,.17],'black',false);
    const ring=part(head,new T.TorusGeometry(.195*big,.031,8,40),'ring',[ex,ey,.615],false);
    ring.rotation.y=side*.22;ring.rotation.z=side*.2;
    ring.scale.set(1,.94+.1*(side<0?1:0),1);
    const iris=new T.Group();iris.position.set(ex,ey,.56);head.add(iris);
    iris.userData.base={x:ex,y:ey};
    lump(iris,[0,0,.03],[.155*big,.155*big,.06],'black',false);
    // A pale pinprick pupil that can dart around inside the black pit.
    const dot=new T.Group();dot.position.set(0,0,.095);iris.add(dot);
    lump(dot,[0,0,0],[.04,.04,.018],'ring',false);
    iris.userData.dot=dot;iris.userData.ring=ring;iris.userData.ringY=ring.scale.y;
    eyes.push(iris);
    // Heavy brow overhanging the top of the ring.
    stroke(head,[[side*.10,.70,.66],[side*.30,.86,.68],
      [side*.56,.84,.60],[side*.76,.62,.42]],.105,'pitch');
    // Crease lines dragging the sockets towards the grin.
    for(let j=0;j<3;j++)stroke(head,[
      [side*(.60+j*.07),.30-j*.05,.50-j*.03],
      [side*(.84+j*.03),.20-j*.08,.40],
      [side*(.92+j*.02),.02-j*.10,.38]
    ],.016+j*.004,'belly',false);
  }
  // Skull-like nasal hole.
  lump(head,[0,.30,.63],[.15,.20,.14],'pitch');
  lump(head,[0,.13,.70],[.13,.13,.08],'black',false);
  for(const side of [-1,1])lump(head,[side*.075,.07,.715],[.07,.075,.05],'black',false);
  // Mouth: deep black cavity stretching into the cheeks.
  const cavity=lump(head,[0,-.42,.50],[.92,.42,.20],'black',false);
  for(const side of [-1,1]) {
    const c=lump(head,[side*.72,.0,.40],[.27,.20,.14],'black',false);
    c.rotation.z=side*.5;
  }
  const upY=x=>-.30+.50*Math.pow(Math.abs(x),1.8);
  const upZ=x=>.74-.34*x*x;
  const upper=[];
  for(let i=0;i<=24;i++){const x=-1+i/12;upper.push([x,upY(x),upZ(x)]);}
  stroke(head,upper,.07,'pitch',true);
  for(const side of [-1,1])stroke(head,[[side*.97,.18,.40],
    [side*1.0,-.15,.36],[side*.84,-.42,.45]],.055,'soot');
  for(let i=0;i<13;i++) {
    const x=(i-6)*.142+Math.sin(i*5.3)*.012,t=Math.abs(x);
    const height=(.33-.12*t)*(.82+.3*Math.abs(Math.sin(i*2.31)));
    fang(head,x,upY(x)-.02,upZ(x)+.0,.082+.018*Math.sin(i*3.7),height,false,i);
  }
  for(let i=0;i<4;i++){const x=-.45+i*.31;drop(head,[x,upY(x)-.28,upZ(x)+.03],.16+.08*(i%2),i*39+21);}
  // Jaw hinge sits far back near the ears, so rotation swings the long
  // chin down and open instead of sliding the teeth forward.
  const jaw=new T.Group();jaw.position.set(0,-.36,-.05);head.add(jaw);
  const jawBody=new T.Group();jawBody.position.set(0,-.42,.42);jaw.add(jawBody);
  lump(jawBody,[0,.065,-.14],[.66,.28,.45],'pitch');
  lump(jawBody,[0,.12,.02],[.70,.12,.17],'black',false);
  const tongue=lump(jawBody,[0,.11,.06],[.30,.07,.15],'gums',false);
  lump(jawBody,[0,-.15,.13],[.74,.21,.28],'soot');
  lump(jawBody,[0,-.32,.10],[.50,.27,.26],'pitch');
  for(const side of [-1,1])lump(jawBody,[side*.60,.08,0],[.26,.30,.34],'soot');
  const loY=x=>.34*Math.pow(Math.abs(x)/.8,1.8);
  const loZ=x=>.36-.26*(x/.8)**2;
  stroke(jawBody,Array.from({length:23},(_,i)=>{
    const x=-.8+i*.0727;return [x,loY(x)-.02,loZ(x)];
  }),.066,'pitch');
  for(let i=0;i<11;i++) {
    const x=(i-5)*.142+Math.sin(i*4.1)*.014,t=Math.abs(x)/.8;
    const height=(.20+.07*(1-t))*(.8+.32*Math.abs(Math.sin(i*1.93+1)));
    fang(jawBody,x,loY(x),loZ(x)-.01,.09+.016*Math.sin(i*2.9),height,true,i+20);
  }
  for(let i=0;i<5;i++)drop(jawBody,[(i-2)*.2,-.50+Math.abs(i-2)*.07,.22],
    .12+(i%3)*.09,i*57+3);
  return {jaw,jawBody,tongue,eyes,skull,cavity};
}
export function createInkGrinMonster(seed=19) {
  const rnd=seeded(seed);
  const root=new T.Group();
  root.name='INK · Чернильный оскал (объёмный 3D-монстр)';
  const spine=new T.Group();spine.position.set(0,2.18,0);root.add(spine);
  // Thin pelvis, distended chest and an asymmetrical, winding backbone.
  lump(spine,[0,-.20,-.06],[.34,.39,.28],'soot');
  const waist=lump(spine,[0,.39,-.08],[.265,.93,.27],'pitch');
  waist.rotation.z=.045;
  lump(spine,[0,1.02,-.02],[.49,.55,.35],'hide');
  lump(spine,[0,1.45,.08],[.29,.40,.26],'pitch');
  stroke(spine,[[0,-.33,-.25],[.09,.24,-.32],[-.06,.75,-.34],
    [.01,1.37,-.22],[0,1.86,.02]],.055,'lacquer',false);
  for(const side of [-1,1]) {
    for(let i=0;i<6;i++) {
      const y=.56+i*.15,spread=.32+(i>2?(5-i)*.024:i*.028);
      stroke(spine,[
        [side*.11,y+.05,-.21],[side*spread,y,.05],
        [side*(spread-.04),y-.055,.22],[side*.16,y-.092,.235]
      ],.021+i*.003,'belly');
    }
    for(let i=0;i<7;i++) {
      const y=.04+i*.24,x=side*(.20+Math.sin(i*1.9)*.06);
      drop(spine,[x,y,.16+Math.cos(i)*.06],.10+rnd()*.22,seed+i*11);
    }
  }
  const arms=[makeArm(spine,-1,seed+15),makeArm(spine,1,seed+38)];
  const legs=[makeLeg(root,-1,seed+42),makeLeg(root,1,seed+93)];
  const neck=new T.Group();neck.position.set(0,1.64,.05);spine.add(neck);
  strand(neck,[0,0,0],[0,.55,.14],.22,.17,'soot');
  for(let i=0;i<4;i++)stroke(neck,[
    [-.16,.08+i*.13,.12],[0,.045+i*.13,.25],
    [.18,.08+i*.13,.10]
  ],.023,'belly');
  const head=new T.Group();head.position.set(0,.50,.14);neck.add(head);
  const face=grinFace(head);
  // Thin irregular needles and gloss lines emphasize the oily silhouette.
  for(let i=0;i<16;i++) {
    const side=i%2?-1:1,k=Math.floor(i/2);
    const y=.13+k*.18;
    const x=side*(.25+Math.sin(k*2.6)*.08);
    stroke(spine,[[x,y,-.02],[x+side*.025,y-.14,.24],
      [x-side*.025,y-.20,.27]],.009,'glint',false);
  }
  root.userData.footprint=.8;
  root.userData.isInkGrinMonster=true;
  root.userData.rig={spine,neck,head,face,arms,legs};
  const smooth=(a,b,x)=>{const k=Math.min(1,Math.max(0,(x-a)/(b-a)));return k*k*(3-2*k);};
  // Jaw driven by a spring: slow gaping, a sharp snap, then teeth chatter.
  const jawState={open:0,vel:0,side:0,snap:0};
  function jawTarget(t){
    const cycle=4.6,p=(t%cycle)/cycle,n=Math.floor(t/cycle);
    const wide=.30+.14*Math.sin(n*2.7);
    let o=0;
    if(p<.58)o=wide*smooth(.04,.58,p);              // slowly gapes
    else if(p<.63)o=wide*(1-smooth(.58,.63,p));     // SNAP shut
    else {                                          // chewing chatter
      const k=1-smooth(.63,1,p);
      o=Math.max(0,.075*k*(.6+.4*Math.sin(t*13.0))+.025*k);
    }
    return .10+o+.022*(.5+.5*Math.sin(t*1.48)); // breathing never fully stops
  }
  const hold=(p,a,b,c,d)=>smooth(a,b,p)*(1-smooth(c,d,p));
  // ---- Action layer: every action is a set of smooth channels that are
  // added on top of the idle life, then chased with inertia. ----
  const zero=()=>({h:0,a:0,spX:0,spY:0,nkX:0,hdS:0,maw:0,jaw:0,jawW:0,
    lsx:0,lsz:0,lel:0,rsx:0,rsz:0,rel:0,claw:0,mad:0,bulge:0,pulse:0});
  function strike(p,o,side){
    const m=side>0?'r':'l',n=side>0?'l':'r';
    o[m+'sx']=-2.75*hold(p,0,.38,.45,.50)-1.15*hold(p,.45,.53,.66,1);
    o[m+'el']=-1.05*hold(p,0,.34,.43,.51)-.12*hold(p,.5,.56,.7,1);
    o[m+'sz']=.4*hold(p,0,.38,.45,.56);
    o[n+'sx']=.45*hold(p,.1,.5,.6,1);o[n+'sz']=.3*hold(p,.1,.5,.6,1);
    o.spY=side*(.42*hold(p,0,.38,.43,.50)-.55*hold(p,.45,.54,.68,1));
    o.spX=-.08*hold(p,0,.36,.42,.5)+.34*hold(p,.45,.54,.68,1);
    o.a=.24*hold(p,.42,.54,.68,1);o.claw=hold(p,.05,.3,.75,1);
    o.jaw=.42;o.jawW=hold(p,.1,.4,.52,.6);o.bulge=.5*hold(p,.3,.5,.6,.9);
    o.pulse=.9*hold(p,.51,.54,.56,.68);
  }
  const ACTIONS={
    jump:{dur:1.9,f(p,o){
      o.a=.62*hold(p,0,.26,.30,.38)+.42*hold(p,.40,.52,.56,.70)+.72*hold(p,.69,.745,.76,1);
      const u=(p-.33)/.39;o.h=u>0&&u<1?1.55*4*u*(1-u):0;
      o.spX=.30*hold(p,0,.26,.30,.40)-.16*hold(p,.36,.5,.56,.7)+.38*hold(p,.69,.75,.77,1);
      const up=hold(p,.32,.48,.60,.78),back=hold(p,0,.26,.30,.38);
      o.lsz=o.rsz=1.25*up;o.lsx=o.rsx=.55*back-.35*up;o.lel=o.rel=-.5*up;
      o.claw=up;o.jaw=.55;o.jawW=hold(p,.3,.45,.68,.74);
      o.bulge=.6*up;o.mad=.5*up;o.pulse=hold(p,.70,.73,.75,.86);
    }},
    strikeL:{dur:1.35,f(p,o){strike(p,o,-1);}},
    strikeR:{dur:1.35,f(p,o){strike(p,o,1);}},
    grab:{dur:1.7,f(p,o){
      const reach=hold(p,.06,.40,.72,1),wide=hold(p,.06,.36,.46,.53),clap=hold(p,.48,.54,.72,1);
      o.lsx=o.rsx=-1.5*reach;o.lsz=o.rsz=.75*wide-.42*clap;o.lel=o.rel=-.55*clap-.2*wide;
      o.spX=-.1*wide+.38*clap;o.a=.25*clap;o.claw=reach;
      o.jaw=.5;o.jawW=hold(p,.1,.36,.50,.55);o.bulge=.5*reach;
      o.pulse=.9*hold(p,.52,.55,.57,.7);
    }},
    bite:{dur:2.7,f(p,o,t){
      const wind=hold(p,0,.22,.28,.36),lunge=hold(p,.30,.40,.66,.76);
      o.spX=-.2*wind+.52*lunge;o.nkX=-.32*wind+.30*lunge;
      o.hdS=.8*hold(p,.28,.42,.68,.92);          // head keeps swelling a beat longer
      o.maw=hold(p,.30,.43,.635,.68);            // the maw itself grows absurdly
      o.jaw=.26*hold(p,.30,.40,.635,.665);o.jawW=hold(p,0,.1,.8,1);
      o.a=.3*lunge;o.lsx=o.rsx=.55*lunge;o.lsz=o.rsz=.6*lunge;o.claw=lunge;
      o.bulge=1.1*hold(p,.26,.42,.62,.8);
      o.pulse=hold(p,.64,.665,.69,.86)+.25*lunge*(.5+.5*Math.sin(t*31));
    }},
    eyes:{dur:3.0,f(p,o){
      o.mad=hold(p,0,.08,.86,1);o.bulge=.25*o.mad;
      o.nkX=-.06*o.mad;
    }}
  };
  const act={name:null,t:0,wait:2.2,bag:[],last:null};
  const order=['bite','jump','strikeL','eyes','grab','bite','strikeR','eyes'];
  function nextAction(){
    if(!act.bag.length){
      act.bag=order.slice();
      for(let i=act.bag.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[act.bag[i],act.bag[j]]=[act.bag[j],act.bag[i]];}
      if(act.bag[act.bag.length-1]===act.last)act.bag.reverse();
    }
    return act.bag.pop();
  }
  const cur=zero(),tgt=zero();
  root.userData.actions=Object.keys(ACTIONS);
  root.userData.auto=true;
  root.userData.play=name=>{if(ACTIONS[name]){act.name=name;act.t=0;}};
  root.userData.action=()=>act.name;
  const eyeState=[{x:0,y:0},{x:0,y:0}];
  const hash=n=>{const f=Math.sin(n*127.1+311.7)*43758.5453;return f-Math.floor(f);};
  // Rare nervous twitch: a damped burst at irregular moments.
  function twitch(t){
    const period=6.3,n=Math.floor(t/period);
    const start=n*period+1.2+3.4*Math.abs(Math.sin(n*91.7));
    const u=t-start;
    return u>0&&u<1.2?Math.exp(-7*u)*Math.sin(u*46):0;
  }
  const gaze={x:0,y:0,yaw:0,pitch:0},tmp=new T.Vector3();
  root.userData.lookTarget=null;root.userData.pulse=0;
  root.userData.tick=(time,dt=0)=>{
    const t=time,breath=Math.sin(t*1.48),tw=twitch(t);
    if(dt>0){
      if(act.name){
        act.t+=dt;
        if(act.t>=ACTIONS[act.name].dur){act.last=act.name;act.name=null;act.wait=.8+rnd()*1.7;}
      }else if(root.userData.auto){
        act.wait-=dt;
        if(act.wait<=0){act.name=nextAction();act.t=0;}
      }
    }
    const fresh=zero();
    if(act.name)ACTIONS[act.name].f(Math.min(1,act.t/ACTIONS[act.name].dur),fresh,t);
    const kc=dt>0?1-Math.exp(-dt*20):1,kh=dt>0?1-Math.exp(-dt*9):1;
    for(const key in cur){
      tgt[key]=fresh[key];
      // heavier parts (head swell, spine) lag behind limbs -> overlapping motion
      cur[key]+=(tgt[key]-cur[key])*((key==='hdS'||key==='spX'||key==='spY'||key==='nkX')?kh:kc);
    }
    // Heavy, delayed following of whoever is looking at it.
    let gx=0,gy=0,wantYaw=0,wantPitch=0;
    if(root.userData.lookTarget){
      neck.worldToLocal(tmp.copy(root.userData.lookTarget));
      wantYaw=T.MathUtils.clamp(Math.atan2(tmp.x,tmp.z),-.9,.9)*.55;
      wantPitch=T.MathUtils.clamp(Math.atan2(tmp.y-.9,Math.hypot(tmp.x,tmp.z)),-.5,.5)*.4;
      head.worldToLocal(tmp.copy(root.userData.lookTarget));
      const d=Math.max(.8,Math.hypot(tmp.x,tmp.y,tmp.z));
      gx=T.MathUtils.clamp(tmp.x/d,-1,1);gy=T.MathUtils.clamp((tmp.y-.55)/d,-1,1);
    }
    const k=dt>0?1-Math.exp(-dt*1.6):1,ke=dt>0?1-Math.exp(-dt*5):1;
    gaze.yaw+=(wantYaw-gaze.yaw)*k;gaze.pitch+=(wantPitch-gaze.pitch)*k;
    gaze.x+=(gx-gaze.x)*ke;gaze.y+=(gy-gaze.y)*ke;
    // Legs: fold by angle `a`, keep feet planted, body drops by the same amount.
    const la=cur.a,phi=Math.asin(Math.min(.98,1.04*Math.sin(la)/.76));
    const dropY=1.8-(1.04*Math.cos(la)+.76*Math.cos(phi));
    const air=Math.min(1,cur.h*2);
    spine.position.y=2.18+cur.h-dropY;
    spine.rotation.z=.058*Math.sin(t*.65)+.015*Math.sin(t*2.6);
    spine.rotation.x=.026*Math.sin(t*.88)+cur.spX;
    spine.rotation.y=cur.spY;
    spine.scale.set(1+.014*breath,1+.015*breath,1+.02*breath);
    neck.rotation.z=.057*Math.sin(t*.42+.70);
    neck.rotation.x=.07+.045*Math.sin(t*.95)+cur.nkX;
    head.rotation.y=gaze.yaw+.09*Math.sin(t*.41)+.03*Math.sin(t*2.6)+.05*tw;
    head.rotation.z=.13*Math.sin(t*.23)+.05*Math.sin(t*.53)+.16*tw;
    head.rotation.x=-.065-gaze.pitch+.05*Math.sin(t*.71)-.85*(cur.spX+cur.nkX)-.20*jawState.open-.06*jawState.snap*Math.sin(jawState.snap*9);
    const hs=1+cur.hdS;
    head.scale.set(hs*(1+.16*cur.maw),hs*(1+.08*cur.maw),hs);
    head.rotation.z+=.03*cur.maw*Math.sin(t*37);
    const target=jawTarget(t)*(1-cur.jawW)+cur.jaw*cur.jawW;
    if(dt>0){
      const h=Math.min(dt,.033);
      const prev=jawState.open;
      jawState.vel+=((target-jawState.open)*260-jawState.vel*20)*h;
      jawState.open+=jawState.vel*h;
      // closing fast -> remember a snap impulse for secondary motion
      if(jawState.vel<-2.2&&prev>.12)jawState.snap=1;
    }else{jawState.open=target;jawState.vel=0;}
    jawState.snap=Math.max(0,jawState.snap-dt*3.2);
    const open=Math.max(-.02,jawState.open);
    jawState.side+=((.05*Math.sin(t*2.3)*(open>.06?1:.3))-jawState.side)*Math.min(1,dt*6||1);
    face.jaw.rotation.x=open;
    face.jaw.rotation.y=jawState.side*.6;
    face.jaw.rotation.z=jawState.side;
    face.tongue.position.y=.11+.05*Math.sin(t*3.1)*Math.min(1,open*4);
    face.tongue.rotation.x=-.25*open;
    face.jawBody.position.y=-.42-.95*cur.maw;
    face.jawBody.position.z=.42+.36*cur.maw;
    face.jawBody.scale.x=1+.22*cur.maw;
    face.cavity.scale.set(.92*(1+.14*cur.maw),.42+.25*Math.max(0,open)+.5*cur.maw,.20);
    face.cavity.position.y=-.42-.15*Math.max(0,open)-.30*cur.maw;
    root.userData.pulse=Math.min(1,Math.max(jawState.snap,Math.abs(tw)*2.5,cur.pulse));
    face.eyes.forEach((eye,i)=>{
      // Each eye has its own saccade clock, so they dart in different directions.
      const dir=i?1:-1,n=Math.floor(t*(i?3.7:5.3)),mad=cur.mad;
      const sx=(hash(n+i*71.3)-.5)*2,sy=(hash(n*1.7+i*13.1+5)-.5)*2;
      const wx=.10*gaze.x*(1-mad)+mad*(.085*sx+.05*Math.cos(t*6.1*dir+i))+.02*tw;
      const wy=.08*gaze.y*(1-mad)+mad*(.07*sy+.045*Math.sin(t*6.1+i*2));
      const e=eyeState[i],kq=dt>0?1-Math.exp(-dt*(10+16*mad)):1;
      e.x+=(wx-e.x)*kq;e.y+=(wy-e.y)*kq;
      eye.userData.dot.position.x=e.x+.006*Math.sin(t*.71+i*.32);
      eye.userData.dot.position.y=e.y+.006*Math.sin(t*.39+i*1.4);
      const rs=1+.22*cur.bulge+.24*mad*Math.sin(t*3.3+i*Math.PI);
      eye.userData.ring.scale.set(rs,rs*eye.userData.ringY,1);
    });
    arms.forEach((a,i)=>{
      const phase=t*.92+i*2.1;
      const m=i?'r':'l';
      a.shoulder.rotation.z=(i?1:-1)*(.095+.085*Math.sin(phase)+cur[m+'sz']);
      a.shoulder.rotation.x=.05*Math.sin(t*.69+i)+cur[m+'sx'];
      a.elbow.rotation.x=-.08+.10*Math.sin(phase-.55)+cur[m+'el'];
      a.wrist.rotation.z=.06*Math.sin(t*.85+i);
      a.fingers.forEach((f,j)=>{
        f.rotation.x=.09*Math.sin(t*.95-i*.3-j*.23)-.55*cur.claw;
        f.rotation.z=(j-2)*.13*cur.claw;
      });
    });
    legs.forEach((leg,i)=>{
      leg.hip.position.y=2.03+cur.h-dropY;
      leg.hip.rotation.x=.025*Math.sin(t*.66+i*Math.PI)-la;
      leg.hip.rotation.z=(i?1:-1)*.12*air;
      leg.knee.rotation.x=.04+.027*Math.sin(t*.66+i*Math.PI+1.1)+la+phi;
      leg.foot.rotation.x=-phi+.45*air;
    });
  };
  root.userData.tick(0,0);
  return root;
}

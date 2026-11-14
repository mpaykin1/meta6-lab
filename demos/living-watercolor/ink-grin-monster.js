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
  } else if (id==='glint') {
    m=new T.MeshBasicMaterial({color:'#b7c9cc',transparent:true,opacity:.46,depthWrite:false});
  } else if (id==='black') {
    m=new T.MeshBasicMaterial({color:'#070a0e'});
  } else {
    m=new T.MeshPhysicalMaterial({
      color:COLORS[id]||COLORS.hide,map:makePatina(),roughness:.31,metalness:.04,
      clearcoat:.83,clearcoatRoughness:.12,flatShading:false
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
function grinFace(head) {
  // Cranium and cheekpads must read volumetrically from profile.
  const skull=lump(head,[0,.37,.04],[.92,.94,.61],'pitch');
  skull.rotation.x=-.06;
  lump(head,[-.53,-.23,.29],[.39,.39,.40],'soot');
  lump(head,[.53,-.23,.29],[.39,.39,.40],'soot');
  lump(head,[0,-.46,.23],[.66,.28,.45],'pitch');
  const eyes=[];
  for(const side of [-1,1]) {
    lump(head,[side*.455,.57,.50],[.40,.40,.23],'deep',false);
    const socket=lump(head,[side*.455,.58,.59],[.326,.342,.16],'soot',false);
    socket.rotation.z=side*.06;
    const white=part(head,new T.TorusGeometry(.325,.064,8,44),'rim',
      [side*.455,.58,.73],false);
    white.rotation.z=side*.095;
    // Hollow inky pupils at varying heights, as in the reference face.
    const iris=new T.Group();iris.position.set(side*.455,.57,.739);head.add(iris);
    lump(iris,[side*.018,-.011,.05],[.265,.268,.107],'black',false);
    lump(iris,[-.078,.119,.144],[.046,.038,.017],'glint',false);
    eyes.push(iris);
    stroke(head,[[side*.16,.83,.60],[side*.35,.95,.56],
      [side*.59,.95,.50],[side*.77,.76,.38]],.09,'pitch');
    // Wrinkled smile lines that pull eye sockets towards the mouth.
    for(let j=0;j<3;j++)stroke(head,[
      [side*(.74+j*.045),.12-j*.12,.51],
      [side*(.90+j*.01),-.03-j*.13,.40],
      [side*(.83+j*.01),-.22-j*.1,.45]
    ],.017+j*.004,'belly',false);
  }
  // Narrow, triangular hollow nose separating the two enormous eyes.
  lump(head,[0,.18,.64],[.22,.20,.23],'pitch');
  lump(head,[0,.04,.832],[.135,.105,.073],'deep',false);
  for(const side of [-1,1])lump(head,[side*.11,.064,.869],
    [.07,.051,.036],'black',false);
  // Mouth is a deep black cavity, NOT a pasted image.
  const cavity=lump(head,[0,-.286,.556],[.80,.38,.19],'black',false);
  cavity.rotation.x=.07;
  const upper=[],lower=[];
  for(let i=0;i<=22;i++) {
    const x=-.89+i*.081,edge=-.215+.26*Math.pow(Math.abs(x)/.89,2);
    upper.push([x,edge,.70-.22*Math.pow(Math.abs(x)/.89,2)]);
    lower.push([x,-.49+.15*Math.pow(Math.abs(x)/.89,2),.73]);
  }
  stroke(head,upper,.075,'pitch',true);
  stroke(head,[[-.87,.00,.49],[-.94,-.18,.45],[-.73,-.40,.57]],.058,'soot');
  stroke(head,[[.87,.00,.49],[.94,-.18,.45],[.73,-.40,.57]],.058,'soot');
  for(let i=0;i<15;i++) {
    const x=(i-7)*.112,t=Math.abs(x)/.89;
    const anchor=-.215+.26*t*t;
    const height=(.235+.10*(1-t))*(i%5===0?.83:1);
    tooth(head,x,anchor-.011,.777-.17*t*t,.096,height,false,i);
  }
  const jaw=new T.Group();jaw.position.set(0,-.525,.37);head.add(jaw);
  lump(jaw,[0,-.15,.13],[.76,.21,.28],'soot');
  stroke(jaw,Array.from({length:23},(_,i)=>{
    const x=-.76+i*.069;
    return [x,.10-.12*Math.pow(Math.abs(x)/.76,2),.35];
  }),.069,'pitch');
  for(let i=0;i<14;i++) {
    const x=(i-6.5)*.117,t=Math.abs(x)/.85;
    const height=.195+.09*(1-t);
    tooth(jaw,x,.04-.12*t*t,.36,.105,height,true,i+20);
  }
  for(const x of [-.63,.63]) {
    stroke(jaw,[[x,-.05,.16],[x*.96,-.20,.12],[x*.9,-.30,.04]],.045,'pitch');
  }
  // Wet tendrils around cheeks and chin are secondary to the sculpted face.
  for(let i=0;i<8;i++) {
    const side=i%2?-1:1,j=Math.floor(i/2);
    drop(head,[side*(.28+j*.12),-.48-j*.025,.65-j*.065],
      .10+j*.075,i*39+21);
  }
  return {jaw,eyes,skull,cavity};
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
  for(let i=0;i<8;i++) {
    const z=-.39+rnd()*.18,side=i%2?-1:1;
    const a=side*(.15+rnd()*.1);
    stroke(head,[[a,.99,z+.23],[a+side*.06,1.22,z],
      [a+side*.10,1.29+rnd()*.11,z+.08]],.028,'soot');
  }
  root.userData.footprint=.8;
  root.userData.isInkGrinMonster=true;
  root.userData.rig={spine,neck,head,face,arms,legs};
  const base={};
  root.userData.tick=(time,dt=0)=>{
    const t=time,breath=Math.sin(t*1.48);
    spine.rotation.z=.058*Math.sin(t*.65)+.015*Math.sin(t*2.6);
    spine.rotation.x=.026*Math.sin(t*.88);
    spine.scale.set(1+.014*breath,1+.015*breath,1+.02*breath);
    neck.rotation.z=.057*Math.sin(t*.42+.70);
    neck.rotation.x=.07+.045*Math.sin(t*.95);
    head.rotation.y=.19*Math.sin(t*.41)+.055*Math.sin(t*2.6);
    head.rotation.z=.06*Math.sin(t*.53);
    head.rotation.x=-.065+.06*Math.sin(t*.71);
    face.jaw.rotation.x=.15+.19*(.5+.5*Math.sin(t*1.05+1.1));
    face.eyes.forEach((eye,i)=>{
      eye.position.x=(i===0?-.455:.455)+.028*Math.sin(t*.71+i*.32);
      eye.position.y=.57+.026*Math.sin(t*.39+i*1.4);
    });
    arms.forEach((a,i)=>{
      const phase=t*.92+i*2.1;
      a.shoulder.rotation.z=(i?1:-1)*(.095+.085*Math.sin(phase));
      a.shoulder.rotation.x=.05*Math.sin(t*.69+i);
      a.elbow.rotation.x=-.08+.10*Math.sin(phase-.55);
      a.wrist.rotation.z=.06*Math.sin(t*.85+i);
      a.fingers.forEach((f,j)=>{
        f.rotation.x=.09*Math.sin(t*.95-i*.3-j*.23);
      });
    });
    legs.forEach((leg,i)=>{
      leg.hip.rotation.x=.025*Math.sin(t*.66+i*Math.PI);
      leg.knee.rotation.x=.04+.027*Math.sin(t*.66+i*Math.PI+1.1);
    });
  };
  root.userData.tick(0,0);
  return root;
}

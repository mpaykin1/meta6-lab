import * as T from 'three';

// INK · Carrion Stalker. Original fully volumetric biomechanical quadruped.
// Based on the owner's 16-frame reference GIF; no sprites or image planes.
// Uses the unchanged reference/ink-fallen-guardian watercolor renderer.
const P = {
  skin:'#777471', skinLight:'#a7a29e', sinew:'#4c4a49',
  crevice:'#262626', under:'#333537', bone:'#b5ada6',
  gunmetal:'#4f5355', iron:'#7b7e7f', silver:'#9c9fa0',
  darkSteel:'#292d30', rust:'#6a5b54', tooth:'#ded6c7',
  socket:'#282727', pupil:'#111113'
};
const V=(x,y,z)=>new T.Vector3(x,y,z);
function randomFn(seed) {
  let a=(Math.floor(seed)||83)|0;
  return () => ((a=(Math.imul(a,1664525)+1013904223)|0)>>>0)/4294967296;
}
function wearTexture() {
  const c=document.createElement('canvas');c.width=c.height=384;
  const x=c.getContext('2d'),r=randomFn(170183);
  x.fillStyle='#d7d4d1';x.fillRect(0,0,384,384);
  for(let i=0;i<1050;i++){
    const px=r()*384,py=r()*384,a=.022+r()*.12;
    x.globalAlpha=a;
    x.fillStyle=i%7===0?'#333438':i%4?'#6c6460':'#f5eeea';
    x.beginPath();x.ellipse(px,py,2+r()*17,1+r()*31,r()*Math.PI*2,0,Math.PI*2);x.fill();
  }
  x.globalAlpha=1;
  const tex=new T.CanvasTexture(c);
  tex.colorSpace=T.SRGBColorSpace;
  tex.wrapS=tex.wrapT=T.ClampToEdgeWrapping;
  return tex;
}
const wear=wearTexture();
const materials={};
for(const [id,color] of Object.entries(P)){
  materials[id]=new T.MeshStandardMaterial({
    color,roughness:id==='silver'||id==='iron'?.56:.93,
    metalness:['gunmetal','iron','silver','darkSteel'].includes(id)?.57:.03,
    map:['skin','skinLight','sinew'].includes(id)?wear:null,
    side:T.FrontSide
  });
}
materials.eyeGlint=new T.MeshBasicMaterial({color:'#dad7d0'});
function attach(p,g,m,pos=[0,0,0],ink=true,name=''){
  const mesh=new T.Mesh(g,materials[m]||m);mesh.position.set(...pos);
  mesh.userData.watercolorOutline=ink;
  mesh.userData.watercolorSkipWash=!ink;
  mesh.name=name;p.add(mesh);return mesh;
}
const ico=new T.IcosahedronGeometry(1,3);
const icoLow=new T.IcosahedronGeometry(1,1);
function lump(p,at,scale,mat='skin',ink=true,detail=true){
  const m=attach(p,detail?ico:icoLow,mat,at,ink);
  m.scale.set(...scale);return m;
}
function capsule(p,a,b,r0,r1,mat,ink=true){
  const v=V(...a),w=V(...b),d=w.clone().sub(v);
  const m=attach(p,new T.CylinderGeometry(r1,r0,d.length(),10,1),mat);
  m.position.copy(v.add(w).multiplyScalar(.5));
  m.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());
  m.userData.watercolorOutline=ink;m.userData.watercolorSkipWash=!ink;
  return m;
}
function hose(p,coords,radius,mat='sinew',ink=false){
  const c=new T.CatmullRomCurve3(coords.map(a=>V(...a)));
  return attach(p,new T.TubeGeometry(c,Math.max(12,coords.length*7),radius,6,false),mat,[0,0,0],ink);
}
function ring(p,at,r,mat='iron',axis='z'){
  const m=attach(p,new T.TorusGeometry(r,.046,7,18),mat,at,false);
  if(axis==='x')m.rotation.y=Math.PI/2;
  if(axis==='y')m.rotation.x=Math.PI/2;
  return m;
}
function bolt(p,at,r=.055){
  return lump(p,at,[r,r,r*.8],'silver',false,false);
}
function claw(p,base,tip,r=.11,mat='bone'){
  const a=V(...base),b=V(...tip);
  const d=b.clone().sub(a);
  const m=attach(p,new T.ConeGeometry(r,d.length(),7),mat,[0,0,0],false);
  m.position.copy(a.add(b).multiplyScalar(.5));
  m.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());
  return m;
}
function armor(p,at,scale,angle=0,mat='gunmetal'){
  const m=lump(p,at,scale,mat,false);m.rotation.z=angle;return m;
}
function tendon(p,a,b,r=.045){
  return hose(p,[a,[(a[0]+b[0])/2,(a[1]+b[1])/2+.07,(a[2]+b[2])/2+.12],b],r,'crevice',false);
}
function joint(p,at,rad=.23){
  const m=lump(p,at,[rad,rad,rad],'darkSteel',false,false);
  ring(p,at,rad*.88,'iron','x');
  bolt(p,[at[0]+rad*.97,at[1],at[2]],.055);
  bolt(p,[at[0]-rad*.97,at[1],at[2]],.055);
  return m;
}
function mechanicalLeg(parent,side){
  const hip=new T.Group();hip.position.set(side*.75,2.50,-.69);parent.add(hip);
  joint(hip,[0,0,0],.38);
  armor(hip,[side*.10,-.20,-.11],[.40,.50,.48],side*-.20);
  capsule(hip,[0,-.09,0],[side*.25,-.92,-.33],.30,.22,'iron');
  capsule(hip,[side*.06,-.09,.08],[side*.25,-.90,-.20],.19,.13,'silver',false);
  hose(hip,[[side*.18,-.06,-.27],[side*.39,-.40,-.34],[side*.37,-.70,-.29],[side*.21,-.92,-.18]],.055,'darkSteel');
  const knee=new T.Group();knee.position.set(side*.27,-.94,-.34);hip.add(knee);
  joint(knee,[0,0,0],.30);
  armor(knee,[0,-.12,.02],[.44,.34,.37],side*.17);
  capsule(knee,[0,-.07,0],[side*.10,-1.11,.34],.19,.16,'gunmetal');
  capsule(knee,[side*.12,-.24,.05],[side*.16,-.90,.28],.095,.08,'silver',false);
  for(let i=0;i<3;i++)hose(knee,[[side*(.05+i*.06),-.11,-.21],[side*(.09+i*.04),-.43,.10],[side*(.12+i*.06),-.90,.24]],.027,'darkSteel');
  const ankle=new T.Group();ankle.position.set(side*.12,-1.12,.34);knee.add(ankle);
  joint(ankle,[0,0,0],.19);
  capsule(ankle,[0,-.06,0],[0,-.18,.22],.13,.095,'iron',false);
  armor(ankle,[0,-.18,.22],[.31,.16,.48],0,'gunmetal');
  for(let i=-1;i<=1;i++){
    const x=i*.23;
    capsule(ankle,[x*.45,-.15,.40],[x,-.29,.71],.073,.050,'iron',false);
    claw(ankle,[x,-.28,.74],[x*1.15,-.38,.98],.105,'darkSteel');
  }
  return {hip,knee,ankle,side};
}
function hand(parent,side){
  const h=new T.Group();
  lump(h,[0,0,0],[.30,.19,.48],'skin',true);
  for(let i=0;i<4;i++){
    const spread=(i-1.5)*.205;
    const len=1.0+(i%3)*.18;
    const pivot=new T.Group();pivot.position.set(spread,-.08,.30);h.add(pivot);
    capsule(pivot,[0,0,0],[spread*.50,-.22,len*.55],.075,.053,'sinew',false);
    capsule(pivot,[spread*.50,-.22,len*.55],[spread*.9,-.39,len*.83],.050,.026,'skin',false);
    claw(pivot,[spread*.9,-.39,len*.82],[spread*1.15,-.50,len*1.14],.095,'bone');
    h.userData['finger'+i]=pivot;
  }
  capsule(h,[-side*.24,-.03,.04],[-side*.56,-.27,.49],.105,.045,'skin',false);
  claw(h,[-side*.56,-.27,.49],[-side*.75,-.40,.73],.13,'bone');
  return h;
}
function arm(parent,side){
  const shoulder=new T.Group();shoulder.position.set(side*1.08,3.69,.37);parent.add(shoulder);
  lump(shoulder,[0,0,0],[.62,.68,.69],'skin',true);
  capsule(shoulder,[0,-.10,0],[side*.24,-1.12,.43],.25,.14,'skin');
  armor(shoulder,[side*.05,-.36,.08],[.26,.46,.29],side*-.25,'sinew');
  hose(shoulder,[[0,.08,-.13],[side*.23,-.42,.05],[side*.30,-.83,.35]],.075,'sinew');
  const elbow=new T.Group();elbow.position.set(side*.23,-1.16,.43);shoulder.add(elbow);
  lump(elbow,[0,0,0],[.21,.22,.22],'bone',false,false);
  capsule(elbow,[0,-.05,.03],[side*.14,-1.10,.58],.18,.09,'skin');
  capsule(elbow,[side*.13,-.14,.22],[side*.22,-.88,.60],.083,.044,'sinew',false);
  hose(elbow,[[side*.12,.07,-.17],[side*.29,-.52,.13],[side*.17,-1.04,.44]],.047,'crevice');
  const wrist=new T.Group();wrist.position.set(side*.15,-1.14,.62);elbow.add(wrist);
  const palm=hand(wrist,side);palm.rotation.x=.56;wrist.add(palm);
  return {shoulder,elbow,wrist,palm,side};
}
function headAndMouth(parent){
  const neck=new T.Group();neck.position.set(0,3.48,.92);parent.add(neck);
  capsule(neck,[0,-.08,-.16],[0,-.19,.43],.32,.27,'sinew');
  const head=new T.Group();head.position.set(0,-.15,.41);neck.add(head);
  lump(head,[0,.06,.08],[.61,.71,.66],'bone',true);
  lump(head,[0,.26,.03],[.57,.54,.64],'skinLight',true);
  lump(head,[0,-.20,.41],[.51,.32,.43],'bone',true);
  // Front of the skull points toward +Z.
  lump(head,[0,.10,.68],[.35,.29,.25],'skinLight',true);
  lump(head,[0,-.10,.89],[.16,.18,.18],'bone',false);
  for(const side of [-1,1]){
    const socket=lump(head,[side*.28,.16,.61],[.205,.23,.075],'socket',false);socket.rotation.y=side*.15;
    lump(head,[side*.285,.17,.671],[.055,.065,.026],'pupil',false,false);
    lump(head,[side*.307,.20,.695],[.012,.018,.009],'eyeGlint',false,false);
    lump(head,[side*.38,-.19,.59],[.18,.18,.27],'skinLight',true);
    capsule(head,[side*.33,.45,.38],[side*.46,.18,.49],.17,.09,'bone',false);
    ring(head,[side*.37,-.21,.20],.13,'rust','x');
  }
  // Upper jaw is stationary, articulated lower jaw swings down on X axis.
  const upper=lump(head,[0,-.27,.73],[.43,.18,.48],'bone',true);
  upper.rotation.x=-.09;
  const mouth=lump(head,[0,-.43,.77],[.35,.18,.35],'crevice',false);
  const jaw=new T.Group();jaw.position.set(0,-.37,.29);head.add(jaw);
  lump(jaw,[0,-.15,.43],[.40,.15,.49],'skinLight',true);
  lump(jaw,[0,-.065,.64],[.33,.080,.29],'socket',false);
  for(const side of [-1,1]){
    capsule(jaw,[side*.32,-.05,.02],[side*.30,-.17,.72],.083,.063,'bone',false);
    ring(jaw,[side*.35,0,.10],.09,'sinew','x');
  }
  // Tooth rows retain real volume in profile and during gaping bite.
  const toothGeom=new T.ConeGeometry(.068,.30,7);
  for(let i=0;i<9;i++){
    const x=(i-4)*.100;
    const f=1-Math.abs(i-4)/5;
    const u=attach(head,toothGeom,'tooth',[x,-.37,.85+f*.26],false);
    u.rotation.z=Math.PI;u.scale.setScalar(.66+f*.45);
    const l=attach(jaw,toothGeom,'tooth',[x,-.020,.77+f*.25],false);
    l.scale.setScalar(.58+f*.48);
  }
  for(const side of [-1,1])for(let i=0;i<4;i++){
    const z=.34+i*.17;
    const u=attach(head,toothGeom,'tooth',[side*(.31+i*.011),-.33,z],false);
    u.rotation.z=Math.PI*.95;
    const l=attach(jaw,toothGeom,'tooth',[side*(.32+i*.010),-.015,z],false);
    l.scale.setScalar(.68);
  }
  // Neck tendons trail back to the raised shoulder hump.
  for(const side of [-1,1])for(let j=0;j<3;j++){
    hose(neck,[[side*(.18+j*.08),-.29,.11],[side*(.43+j*.09),-.40,-.35],[side*(.56+j*.10),.04,-.76]],.04,'crevice');
  }
  return {head,jaw,neck};
}
export function createInkCarrionStalker(seed=113){
  const rnd=randomFn(seed);
  const g=new T.Group();g.name='INK · Carrion Stalker · biomechanical creature';
  const rig=new T.Group();g.add(rig);
  // Hunched torso, stretched grey skin, huge lopsided dorsal muscles.
  const rump=lump(rig,[0,2.76,-.77],[.83,.83,.84],'sinew');
  rump.rotation.x=.22;
  const torso=lump(rig,[0,3.42,-.15],[1.08,.89,1.03],'skin');
  torso.rotation.x=-.36;
  const hump=lump(rig,[0,4.16,-.47],[1.27,1.05,1.07],'skinLight');
  hump.rotation.x=-.16;
  const hump2=lump(rig,[.35,4.30,-.79],[.80,.73,.77],'skin');
  hump2.rotation.z=-.21;
  const sternum=lump(rig,[0,3.01,.53],[.73,.80,.54],'skin');
  sternum.rotation.x=.25;
  for(let side of [-1,1]){
    lump(rig,[side*.87,3.82,-.39],[.54,.84,.67],'skin',true);
    for(let k=0;k<7;k++){
      const y=3.44-k*.16,z=.37+k*.032;
      capsule(rig,[side*.22,y,z],[side*(.81-k*.028),y-.10,z-.15],.043,.037,'sinew',false);
    }
    // Thin black ligament strands visible between bare flesh and pistons.
    for(let k=0;k<7;k++){
      const x=side*(.36+k*.10);
      hose(rig,[[x,2.58,-.54],[x+side*.11,2.89,-.66],[x+side*.25,3.33,-.61]],.027,'crevice');
    }
  }
  for(let i=0;i<15;i++){
    const a=(i/15)*Math.PI*2,x=Math.cos(a)*.77,z=-.66+Math.sin(a)*.58;
    const v=lump(rig,[x,4.42+(rnd()-.5)*.18,z],[.12+rnd()*.18,.11+rnd()*.25,.18+rnd()*.22],i%3?'skinLight':'skin',false,false);
    v.rotation.y=a;
  }
  const face=headAndMouth(rig);
  const legs=[mechanicalLeg(rig,-1),mechanicalLeg(rig,1)];
  const arms=[arm(rig,-1),arm(rig,1)];
  // Short broken ribs, dark hanging sinews, and cables beneath the torso.
  for(let i=0;i<10;i++){
    const side=i%2?-1:1,x=side*(.13+(i%5)*.12);
    hose(rig,[[x,3.12,.52],[x+side*.08,2.66,.43],[x+side*.12,2.29+(i%3)*.04,.16]],.035,i%3?'sinew':'crevice');
  }
  for(let i=0;i<12;i++){
    const a=rnd()*Math.PI*2,z=-.94+rnd()*.85,x=(rnd()-.5)*1.75;
    const b=attach(rig,new T.BoxGeometry(.025,.20+rnd()*.29,.06),'crevice',[x,3.90+rnd()*.45,z],false);
    b.rotation.z=(rnd()-.5)*.55;b.rotation.x=a*.15;
  }
  const state={time:0,elapsed:0,action:'idle',duration:1.65,pulse:0,paused:false,auto:true};
  const ease=u=>u*u*(3-2*u);
  function play(name='bite'){
    if(!['bite','jump','strike','prowl'].includes(name))name='bite';
    state.action=name;state.elapsed=0;
    state.duration=name==='jump'?1.8:name==='prowl'?2.0:1.40;
    return name;
  }
  function tick(t,dt){
    if(state.paused)return;
    const step=Math.max(0,Math.min(.05,dt||0));
    state.time+=step;
    state.elapsed+=step;
    let a=0,b=0,j=0,s=0;
    const u=Math.min(1,state.elapsed/state.duration);
    if(state.action==='bite'){
      a=Math.sin(Math.PI*Math.pow(u,.68));
      b=Math.pow(Math.sin(Math.PI*Math.min(1,u*1.18)),1.25);
    }else if(state.action==='jump'){
      j=Math.pow(Math.sin(Math.PI*u),1.08);
      b=Math.sin(Math.PI*Math.min(1,u*1.30));
      a=Math.max(0,Math.sin(Math.PI*(u-.14)))*.65;
    }else if(state.action==='strike'){
      s=Math.sin(Math.PI*u);a=s*.45;
    }else if(state.action==='prowl'){
      s=Math.sin(Math.PI*u)*.4;
    }
    if(state.action!=='idle'&&u>=1){state.action='idle';state.elapsed=0;}
    const breath=.022*Math.sin(state.time*1.65);
    rig.position.y=(j*.88)+.03*Math.sin(state.time*2.2)-(b*.09);
    rig.position.z=(b*.36)+(j*.16);
    rig.rotation.x=.035*Math.sin(state.time*.81)-b*.11+j*.08;
    rig.rotation.y=.025*Math.sin(state.time*.57)+s*.08;
    hump.scale.y=1.05+breath+.035*b;
    torso.scale.x=1.08+breath*.55;
    face.neck.rotation.x=-.08-b*.26+.03*Math.sin(state.time*1.4);
    face.head.rotation.z=.025*Math.sin(state.time*.95)+s*.11;
    face.head.rotation.y=.07*Math.sin(state.time*.5)-s*.12;
    face.jaw.rotation.x=.10+(b*1.32)+(a*.28);
    face.jaw.position.y=-.37-b*.11;
    for(const l of legs){
      const sign=l.side;
      l.hip.rotation.x=.08+Math.sin(state.time*2+sign*1.7)*.045-j*.32+b*.11;
      l.knee.rotation.x=-.10+j*.44+b*.13;
      l.ankle.rotation.x=.03-j*.15;
    }
    for(const h of arms){
      const sign=h.side;
      h.shoulder.rotation.x=-.09-b*.62-j*.38+s*(sign<0?-.85:-.22);
      h.shoulder.rotation.z=sign*(.055+.18*b)+Math.sin(state.time*1.5+sign)*.018;
      h.elbow.rotation.x=-.13-b*.51-j*.18-s*.19;
      h.wrist.rotation.x=.08+a*.3;
      for(let i=0;i<4;i++){
        const finger=h.palm.userData['finger'+i];
        finger.rotation.x=-a*.32-.10*Math.sin(state.time*1.4+i*.6);
      }
    }
    state.pulse=Math.max(a,b*.8,j*.55,s*.5);
    if(state.auto && state.action==='idle' && state.elapsed>3.1){
      const actions=['bite','jump','strike','bite'];
      play(actions[Math.floor((state.time/6)%4)]);
    }
  }
  g.userData={
    kind:'ink-carrion-stalker',is3D:true,referenceFrames:16,
    rig:{body:rig,head:face.head,jaw:face.jaw,arms,legs},
    play,tick,state,
    pause:()=>state.paused=true,resume:()=>state.paused=false,
    setAuto:v=>state.auto=!!v
  };
  return g;
}

import * as T from 'three';

// INK flying raven: genuinely volumetric watercolor character. No sprites, GIFs or billboards.
// The accepted Living Watercolor shader and Fallen Guardian v1 are unchanged.
const colors={
  charcoal:'#494750', slate:'#62616d', lavender:'#77717b',
  dusk:'#8d7d7e', feather:'#777480', ash:'#98908c',
  deep:'#373941', beak:'#867d7b', claw:'#8e817e', eye:'#c8a27d'
};
const Z=new T.Vector3(0,0,1);
const seedRandom=seed=>{
  let s=(seed|0)||121;return ()=>{
    s=(Math.imul(s,1664525)+1013904223)|0;return (s>>>0)/4294967296;
  };
};
let wash=null;
const mats=new Map();
function patina(){
  if(wash)return wash;
  const rand=seedRandom(94317),c=document.createElement('canvas');
  c.width=c.height=256;
  const ctx=c.getContext('2d');
  ctx.fillStyle='#f6eee7';ctx.fillRect(0,0,256,256);
  for(let i=0;i<1050;i++){
    const x=rand()*256,y=rand()*256,r=.5+Math.pow(rand(),2)*21;
    ctx.fillStyle=['#7a707a','#b4a0a0','#c5bcc4','#9c8b91','#d5c5ba'][Math.floor(rand()*5)];
    ctx.globalAlpha=.05+rand()*.20;
    ctx.beginPath();ctx.ellipse(x,y,r,r*(.25+rand()*.8),rand()*6.283,0,6.283);ctx.fill();
  }
  ctx.globalAlpha=1;
  wash=new T.CanvasTexture(c);wash.colorSpace=T.SRGBColorSpace;
  wash.wrapS=wash.wrapT=T.RepeatWrapping;
  return wash;
}
function pigment(hex){
  if(!mats.has(hex))mats.set(hex,new T.MeshStandardMaterial({
    color:hex,roughness:1,metalness:0,flatShading:true,
    map:patina(),side:T.DoubleSide
  }));
  return mats.get(hex);
}
const ico=new T.IcosahedronGeometry(1,2);
function part(parent,geo,mat,at=[0,0,0],outline=true){
  const m=new T.Mesh(geo,mat);m.position.set(...at);
  m.userData.watercolorOutline=outline;parent.add(m);return m;
}
function ellipsoid(parent,scale,at,mat,outline=true){
  const m=part(parent,ico,mat,at,outline);m.scale.set(...scale);return m;
}
function joint(parent,a,b,r1,r2,mat){
  const p=new T.Vector3(...a),q=new T.Vector3(...b),d=q.clone().sub(p);
  const m=part(parent,new T.CylinderGeometry(r2,r1,d.length(),8),mat,[0,0,0],false);
  m.position.copy(p).add(q).multiplyScalar(.5);
  m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());
  return m;
}
function stroke(parent,coords,thickness,mat){
  const c=new T.CatmullRomCurve3(coords.map(p=>new T.Vector3(...p)));
  return part(parent,new T.TubeGeometry(c,12,thickness,5,false),mat,[0,0,0],false);
}
// Curved, double-sided, CLOSED feather volume. Its long axis is +Z.
function makeFeatherGeometry(){
  const positions=[],uvs=[],indices=[],N=9,M=3;
  for(let layer=0;layer<2;layer++){
    for(let i=0;i<N;i++){
      const t=i/(N-1),shape=.03+.31*Math.pow(Math.sin(Math.PI*(.025+.96*t)),.68)*(1-.12*t);
      for(let j=0;j<M;j++){
        const side=j-1;
        positions.push(side*shape,
          (layer===0?1:-1)*(.025+.068*(1-side*side)*Math.sin(t*Math.PI))
            +.045*Math.sin(Math.PI*t)*t,
          t+.035*side*Math.sin(Math.PI*t));
        uvs.push(j/2,t);
      }
    }
  }
  const stride=N*M;
  for(let layer=0;layer<2;layer++){
    const offset=layer*stride;
    for(let i=0;i<N-1;i++)for(let j=0;j<M-1;j++){
      const a=offset+i*M+j,b=a+M,c=a+1,d=b+1;
      if(layer===0)indices.push(a,b,c,b,d,c);
      else indices.push(a,c,b,b,c,d);
    }
  }
  for(let i=0;i<N-1;i++)for(const j of [0,M-1]){
    const a=i*M+j,b=(i+1)*M+j,c=a+stride,d=b+stride;
    indices.push(a,c,b,b,c,d);
  }
  for(const i of [0,N-1])for(let j=0;j<M-1;j++){
    const a=i*M+j,b=a+1,c=a+stride,d=b+stride;
    indices.push(a,b,c,b,d,c);
  }
  const g=new T.BufferGeometry();
  g.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));
  g.setIndex(indices);g.computeVertexNormals();
  return g;
}
const featherGeo=makeFeatherGeometry();
function feather(parent,from,dir,width,length,mat,outline=true){
  const d=new T.Vector3(...dir).normalize();
  const m=part(parent,featherGeo,mat,from,outline);
  m.quaternion.setFromUnitVectors(Z,d);
  m.scale.set(width,1,length);
  return m;
}
function smallFeathers(parent,amount,random,place,mat){
  const instances=new T.InstancedMesh(featherGeo,mat,amount);
  const tmp=new T.Object3D();
  for(let i=0;i<amount;i++){
    const info=place(i,amount,random);
    tmp.position.set(...info.p);
    tmp.quaternion.setFromUnitVectors(Z,new T.Vector3(...info.d).normalize());
    tmp.scale.set(info.w||.35,info.h||.5,info.l||.17);
    tmp.updateMatrix();instances.setMatrixAt(i,tmp.matrix);
  }
  instances.instanceMatrix.needsUpdate=true;
  instances.userData.watercolorOutline=false;
  instances.userData.watercolorSkipWash=true;
  instances.frustumCulled=false;
  parent.add(instances);
  return instances;
}
function wing(parent,side,random){
  const shoulder=new T.Group();
  shoulder.position.set(side*.37,.15,.06);
  shoulder.scale.x=side;
  parent.add(shoulder);
  ellipsoid(shoulder,[.75,.14,.36],[.49,-.015,-.05],pigment(colors.charcoal));
  const elbow=new T.Group();elbow.position.set(1.03,0,-.07);shoulder.add(elbow);
  ellipsoid(elbow,[.55,.115,.31],[.36,0,-.07],pigment(colors.slate));
  const wrist=new T.Group();wrist.position.set(.79,0,-.09);elbow.add(wrist);
  ellipsoid(wrist,[.35,.09,.23],[.25,0,-.07],pigment(colors.slate),false);
  // Separate overlapping flights, not a painted wing texture.
  for(let i=0;i<10;i++){
    const t=i/9;
    feather(shoulder,[.13+t*.93,-.038,-.18],
      [.14+t*.20,0,-.60+t*.12],.72,.57+t*.15,
      pigment(i%3===0?colors.dusk:colors.feather),i%3===0);
  }
  for(let i=0;i<10;i++){
    const t=i/9;
    feather(elbow,[.10+t*.68,-.01,-.17],
      [.25+t*.15,.01,-.73+t*.04],.74,.67+t*.24,
      pigment(i%3===0?colors.lavender:colors.slate),i%3===0);
  }
  for(let i=0;i<11;i++){
    const t=i/10;
    feather(wrist,[.08+t*.55,-.016,-.10],
      [.91+.12*t, .03*Math.sin(t*Math.PI),-.12-.81*t],
      .67-t*.13,.65+t*.48,
      pigment(i%3===0?colors.dusk:colors.feather),true);
  }
  // Two small-feather coats cover the mechanical wing bones with watercolor texture.
  smallFeathers(shoulder,54,random,(_i,_n,r)=>{
    const x=.09+r()*1.61,z=-.03-r()*.27;
    return {p:[x,.13+r()*.025,z],d:[.30,0,-1],
      w:.24+r()*.16,l:.18+r()*.19};
  },pigment(colors.ash));
  smallFeathers(shoulder,49,random,(_i,_n,r)=>{
    const x=.05+r()*1.55,z=.05-r()*.25;
    return {p:[x,.145,z],d:[.28,0,-.96],w:.25+r()*.12,l:.15+r()*.20};
  },pigment(colors.lavender));
  return {shoulder,elbow,wrist,side};
}
function talons(parent,side){
  const dark=pigment(colors.claw),root=new T.Group();
  root.position.set(side*.20,-.25,-.41);parent.add(root);
  joint(root,[0,0,0],[side*.045,-.30,-.13],.075,.058,dark);
  const foot=ellipsoid(root,[.09,.07,.13],[side*.045,-.33,-.14],dark,false);
  foot.rotation.x=.18;
  for(let j=-1;j<=1;j++){
    const x=side*.045+j*.075;
    stroke(root,[[x,-.33,-.13],[x+j*.05,-.39,-.025],[x+j*.063,-.34,.06],
      [x+j*.07,-.28,.07]],.021,dark);
  }
}
export function createInkRaven(seed=47){
  const random=seedRandom(seed);
  const root=new T.Group();root.name='Ворон · живой объёмный INK';
  const flying=new T.Group();root.add(flying);
  const body=ellipsoid(flying,[.43,.43,.77],[0,0,-.08],pigment(colors.charcoal));
  body.rotation.x=-.06;
  ellipsoid(flying,[.36,.36,.51],[0,.08,.23],pigment(colors.slate),true);
  const neck=ellipsoid(flying,[.28,.33,.32],[0,.30,.53],pigment(colors.slate));
  neck.rotation.x=.21;
  const head=new T.Group();head.position.set(0,.40,.76);flying.add(head);
  ellipsoid(head,[.29,.29,.30],[0,0,0],pigment(colors.charcoal));
  // Beak has real cone volume and a slightly separated lower jaw.
  const beak=part(head,new T.ConeGeometry(.153,.54,7),
    pigment(colors.beak),[0,-.08,.48]);
  beak.rotation.x=Math.PI/2;
  const mandible=ellipsoid(head,[.13,.065,.25],[0,-.17,.42],
    pigment(colors.deep),false);mandible.rotation.x=-.05;
  for(const side of [-1,1]){
    ellipsoid(head,[.086,.084,.048],[side*.255,.065,.095],
      pigment(colors.deep),false);
    ellipsoid(head,[.048,.048,.035],[side*.291,.065,.110],
      new T.MeshBasicMaterial({color:colors.eye}),false);
    ellipsoid(head,[.026,.026,.021],[side*.321,.066,.129],
      pigment('#24252a'),false);
    ellipsoid(head,[.013,.013,.013],[side*.342,.086,.148],
      new T.MeshBasicMaterial({color:'#f4e1c9'}),false);
    talons(flying,side);
  }
  // Neck and breast scallops catch washes and read as individual feather layers.
  for(let side of [-1,1])for(let i=0;i<14;i++){
    const t=i/13;
    feather(flying,[side*(.14+.18*t),.29-t*.29,.50-t*.57],
      [side*.16,-.29,-.86],.29,.18+t*.15,
      pigment(i%4===0?colors.dusk:colors.feather),i%5===0);
  }
  smallFeathers(flying,180,random,(_i,_n,r)=>{
    const a=r()*Math.PI*2,z=-.62+r()*1.24;
    const rr=Math.sqrt(Math.max(.05,1-Math.pow((z+.08)/.76,2)));
    return {p:[Math.cos(a)*.435*rr,Math.sin(a)*.435*rr,z],
      d:[Math.cos(a)*.17,-.20,-.93],
      w:.23+r()*.18,l:.14+r()*.15};
  },pigment(colors.lavender));
  // Fan tail built from nine independent 3D feathers.
  const tail=new T.Group();tail.position.set(0,-.06,-.67);flying.add(tail);
  for(let i=0;i<11;i++){
    const t=(i-5)/5;
    feather(tail,[t*.14,0,-.015],
      [t*.32,-.04,-1],.55,1.00-.21*Math.abs(t),
      pigment(i%3===0?colors.dusk:colors.feather),i%2===0);
  }
  const wings=[wing(flying,-1,random),wing(flying,1,random)];
  // Poses use local shoulder/elbow/wrist transforms, with a delayed wingtip.
  root.userData.ravenRig={wings,tail,head,flying};
  root.userData.isFlyingRaven=true;
  root.userData.updateInkRaven=(elapsed)=>{
    const t=elapsed*5.1;
    for(const w of wings){
      w.shoulder.rotation.z=.15+.61*Math.sin(t);
      w.shoulder.rotation.y=.035*Math.sin(t*.5);
      w.elbow.rotation.z=.17*Math.sin(t-.48);
      w.wrist.rotation.z=.15*Math.sin(t-1.02);
      w.wrist.rotation.y=.035*Math.sin(t-.7);
    }
    flying.position.y=.035*Math.sin(t-.22);
    flying.rotation.x=.022*Math.sin(t-.35);
    tail.rotation.x=.08*Math.sin(t*.5+.5);
    head.rotation.x=.020*Math.sin(t*.5);
  };
  root.userData.updateInkRaven(0);
  return root;
}

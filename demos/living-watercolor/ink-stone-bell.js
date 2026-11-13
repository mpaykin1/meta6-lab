import * as THREE from 'three';

// Stone bell from the accepted INK recipe; isolated from the robot and engine.
const P = { stone: '#8c8e85', chalk: '#c4b8a4', moss: '#718164', soil: '#867966',
  rust: '#aa755b', shadow: '#535b58', dawn: '#d7aa7c', eye: '#efad65' };
const MATERIALS = new Map();
function pigment(color, opts={}) {
  const key = color + '|' + (opts.map?.uuid || JSON.stringify(opts));
  if (!MATERIALS.has(key)) MATERIALS.set(key, new THREE.MeshStandardMaterial({color,roughness:1,...opts}));
  return MATERIALS.get(key);
}
function seeded(seed) {
  let state = seed|0; return () => {
    state=(Math.imul(state,1664525)+1013904223)|0;
    return (state>>>0)/4294967296;
  };
}
function part(parent, geometry, material, xyz=[0,0,0], outline=true) {
  const mesh=new THREE.Mesh(geometry,material);
  mesh.position.set(...xyz);mesh.userData.watercolorOutline=outline;parent.add(mesh);return mesh;
}
function sphere(parent, scale, at, mat, outline=true) {
  const o=part(parent,new THREE.IcosahedronGeometry(1,2),mat,at,outline);
  o.scale.set(...scale);return o;
}
function box(parent, size, at, mat, outline=true) {
  return part(parent,new THREE.BoxGeometry(...size),mat,at,outline);
}
function limb(parent, a, b, radiusA, radiusB, mat) {
  const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),dir=vb.clone().sub(va);
  const mesh=part(parent,new THREE.CylinderGeometry(radiusB,radiusA,dir.length(),12),mat);
  mesh.position.copy(va).add(vb).multiplyScalar(.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());return mesh;
}
function torus(parent, at, radius, mat) {
  return part(parent,new THREE.TorusGeometry(radius,.04,6,24),mat,at,false);
}
function vine(parent, points, mat) {
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  return part(parent,new THREE.TubeGeometry(curve,30,.025,5),mat,[0,0,0],false);
}
function patinaTexture(seed=17) {
  const random=seeded(seed),c=document.createElement('canvas');c.width=c.height=256;
  const ctx=c.getContext('2d');if(!ctx)return null;
  ctx.fillStyle=P.chalk;ctx.fillRect(0,0,256,256);
  for(let i=0;i<600;i++){
    ctx.globalAlpha=.12+random()*.33;ctx.fillStyle=i%3?P.rust:P.moss;
    ctx.beginPath();ctx.ellipse(random()*256,random()*256,1+random()*18,1+random()*10,random()*6,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function foliage(parent,random,count=240){
  const geo=new THREE.IcosahedronGeometry(1,0),mat=pigment(P.moss),mesh=new THREE.InstancedMesh(geo,mat,count),node=new THREE.Object3D();
  for(let i=0;i<count;i++){
    const a=random()*Math.PI*2,r=Math.sqrt(random())*2.4;
    node.position.set(Math.sin(a)*r,.02+random()*.19,Math.cos(a)*r);
    node.rotation.set(random(),random()*6.28,random());
    node.scale.set(.06+random()*.13,.03,.06+random()*.12);node.updateMatrix();mesh.setMatrixAt(i,node.matrix);
  }
  mesh.instanceMatrix.needsUpdate=true;mesh.userData.watercolorOutline=false;
  mesh.userData.watercolorSkipWash=true;parent.add(mesh);return mesh;
}
export function createStoneBell(seed=43){
  const random=seeded(seed),root=new THREE.Group();
  root.name='Павший каменный колокол · лес, забывший свой звон';
  const tex=patinaTexture(seed);
  const weathered=pigment('#ffffff',tex?{map:tex}:{color:P.chalk});
  const dark=pigment(P.shadow),stone=pigment(P.stone);
  const soil=pigment(P.soil),moss=pigment(P.moss),rust=pigment(P.rust);
  // A heavy ancient bell lies on its side, its hollow broken mouth toward the viewer.
  const casting=new THREE.Group();casting.position.set(0,.75,-.12);
  casting.rotation.set(1.31,.12,-.19);root.add(casting);
  part(casting,new THREE.CylinderGeometry(.70,1.16,2.46,28,1,true),
    weathered,[0,0,0],true);
  part(casting,new THREE.CylinderGeometry(.63,1.05,2.34,28,1,true),
    dark,[0,0,0],false).material.side=THREE.DoubleSide;
  sphere(casting,[.79,.43,.79],[0,1.05,0],weathered,true);
  const mouth=torus(casting,[0,-1.24,0],1.12,rust);
  mouth.rotation.x=Math.PI/2;mouth.scale.set(1.02,1,.80);
  const backRim=torus(casting,[0,.85,0],.72,stone);backRim.rotation.x=Math.PI/2;
  // Broken lip: a pair of separated heavy fracture plates.
  for(let i=0;i<9;i++){
    const a=i*2.3999;
    const x=Math.cos(a)*(1.03+.08*random()),z=Math.sin(a)*(1.03+.08*random());
    const shard=box(casting,[.26,.23,.22],[x,-1.25,z],
      i%3?weathered:stone,false);
    shard.rotation.set(random()*.4,random()*2.8,a);
  }
  // Visible cracks on the upside: strokes remain physically attached to the casting.
  for(let k=0;k<5;k++){
    const a=k*.66-.9;
    vine(casting,[
      [Math.cos(a)*.79,.60,Math.sin(a)*.79],
      [Math.cos(a+.10)*.95,.05,Math.sin(a+.10)*.95],
      [Math.cos(a+.19)*1.04,-.70,Math.sin(a+.19)*1.04]
    ],dark);
  }
  // Fallen clapper, half reclaimed by the roots.
  limb(casting,[0,.8,.1],[.14,-.64,.23],.11,.14,rust);
  sphere(casting,[.28,.27,.28],[.19,-.74,.25],rust,false);
  for(let k=0;k<7;k++){
    const a=k*.80,px=Math.cos(a)*1.13,pz=Math.sin(a)*1.13;
    vine(root,[[px,.86,pz],[(px*.83),.47,pz*.95],
      [px*1.35,.07,pz*1.25]],moss);
  }
  // The ground consumes the bell; small debris is muted and has no outline.
  sphere(root,[2.15,.22,1.87],[0,-.19,.10],soil,false);
  for(let k=0;k<27;k++){
    const a=random()*Math.PI*2,r=1.15+random()*1.9;
    const rock=sphere(root,[.07+random()*.17,.07+random()*.13,.09+random()*.24],
      [Math.cos(a)*r,-.09+random()*.15,Math.sin(a)*r],k%3?stone:soil,false);
    rock.rotation.set(random()*.4,random()*6.28,random()*.4);
  }
  foliage(root,random,260);
  // Exactly one warm accent: a very soft ember at the heart of the silent bell.
  const ember=pigment(P.eye,{emissive:P.eye,emissiveIntensity:.16});
  const heart=sphere(casting,[.10,.10,.11],[.06,-.10,.49],ember,false);
  root.userData.updateInk=(elapsed)=>{
    ember.emissiveIntensity=.15+.035*Math.sin(elapsed*.7);
    heart.scale.setScalar(1+.03*Math.sin(elapsed*.7));
  };
  return root;
}

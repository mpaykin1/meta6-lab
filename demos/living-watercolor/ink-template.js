import * as THREE from 'three';

// INK template: copy to ink-<name>.js in a new LAB branch; never modify approved v1.
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
export function createInkObject(seed=23){
  const random=seeded(seed),root=new THREE.Group();root.name='INK new object';
  const tex=patinaTexture(seed),surface=pigment('#ffffff',tex?{map:tex}:{color:P.chalk});
  const stone=pigment(P.stone),soil=pigment(P.soil),moss=pigment(P.moss);
  // Replace this temporary silhouette with the new object's story.
  sphere(root,[1.2,.86,.74],[0,.63,0],surface);
  box(root,[1.5,.18,.62],[0,.18,0],stone);
  limb(root,[-.75,.35,0],[-.95,-.04,.18],.16,.11,stone);
  torus(root,[0,.62,.76],.37,pigment(P.dawn));
  vine(root,[[-.5,1,.1],[-.4,.65,.5],[.3,.10,.5]],moss);
  sphere(root,[1.8,.20,1.25],[0,-.11,0],soil,false);
  foliage(root,random);
  const eye=sphere(root,[.09,.09,.09],[0,.62,.79],pigment(P.eye),false);
  root.userData.updateInk=(elapsed)=>{const a=1+.10*Math.sin(elapsed*.75);eye.scale.set(.09*a,.09*a,.09*a);};
  return root;
}

import * as THREE from '../../reference/ink-fallen-guardian/three.module.js';

const canvas = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
canvas.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
canvas.setSize(innerWidth, innerHeight);
canvas.setClearColor(0x08121e);
canvas.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(canvas.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x101c29, 0.009);
const camera = new THREE.PerspectiveCamera(56, innerWidth / innerHeight, 0.1, 300);
camera.position.set(0, 5, 34);
camera.lookAt(0, 3, -22);
const pointer = new THREE.Vector2();
const clock = new THREE.Clock();
const uniforms = { uTime: { value: 0 }, uFlash: { value: 0 }, uLayer: { value: 0 } };
const vs = [
  'varying vec2 vUv;',
  'void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}'
].join('\n');
const originalNoise = await fetch('../../integration/stegu/classicnoise3D.glsl').then(response => {
  if (!response.ok) throw Error('GLSL source unavailable: ' + response.status);
  return response.text();
});

function skyMaterial() {
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: vs,
    fragmentShader: [
      'precision highp float;varying vec2 vUv;',
      'uniform float uTime;uniform float uFlash;uniform float uLayer;',
      originalNoise,
      'void main(){',
      'vec2 uv=vUv;',
      'float n=cnoise(vec3(uv.x*4.2,uv.y*2.8,uTime*0.031));',
      'float d=cnoise(vec3(uv.x*10.7+6.1,uv.y*6.2,uTime*0.023));',
      'float cloud=smoothstep(-0.14,0.68,n*0.72+d*0.28+0.16);',
      'vec3 bottom=vec3(.038,.077,.107);',
      'vec3 top=vec3(.008,.022,.067);',
      'vec3 base=mix(bottom,top,smoothstep(0.,1.,uv.y));',
      'base+=vec3(.074,.092,.115)*cloud*(.4+.6*uv.y);',
      'base+=vec3(.09,.11,.18)*pow(max(0.,1.-distance(uv,vec2(.67,.72))*2.1),4.);',
      'base+=vec3(.32,.38,.47)*uFlash*0.85;',
      'gl_FragColor=vec4(base,1.);}'
    ].join('\n'),
    depthWrite: false, fog: false
  });
}
function fogMaterial(layer) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: uniforms.uTime, uFlash: uniforms.uFlash, uLayer: { value: layer }
    },
    vertexShader: vs,
    fragmentShader: [
      'precision highp float;varying vec2 vUv;',
      'uniform float uTime;uniform float uFlash;uniform float uLayer;',
      originalNoise,
      'void main(){',
      'float a=cnoise(vec3(vUv*vec2(3.7,2.2)+uLayer*4.9,uTime*.05));',
      'float b=cnoise(vec3(vUv*vec2(8.3,4.9)-uLayer*2.7,uTime*.027));',
      'float waves=smoothstep(-.55,.65,a*.76+b*.24);',
      'float altitude=smoothstep(.02,.8,vUv.y)*(1.-smoothstep(.7,1.,vUv.y));',
      'float alpha=altitude*waves*(.14+uLayer*.06);',
      'vec3 tint=mix(vec3(.14,.24,.31),vec3(.28,.35,.40),vUv.y);',
      'gl_FragColor=vec4(tint+vec3(uFlash*.4),alpha);}'
    ].join('\n'),
    transparent: true, depthWrite: false,
    blending: THREE.NormalBlending, fog: false
  });
}
const sky = new THREE.Mesh(new THREE.PlaneGeometry(270, 145), skyMaterial());
sky.position.set(0, 8, -95);
sky.frustumCulled = false;
scene.add(sky);

const moonHalo = new THREE.Mesh(
  new THREE.SphereGeometry(8.7, 40, 24),
  new THREE.MeshBasicMaterial({ color: 0x7195a7, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending })
);
moonHalo.position.set(19, 19, -65);
scene.add(moonHalo);
const moon = new THREE.Mesh(new THREE.SphereGeometry(2.4, 48, 24),
  new THREE.MeshBasicMaterial({ color: 0xd5e0dc }));
moon.position.copy(moonHalo.position);
moon.position.z += 2;
scene.add(moon);

let seed = 8039481;
const rand = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) | 0) >>> 0) / 4294967296;
function mountains(z, level, color, height, density) {
  const shape = new THREE.Shape();
  shape.moveTo(-125, -26);
  let elevation = level;
  for (let x = -125; x <= 125; x += density) {
    elevation = Math.max(level - height, Math.min(level + height, elevation + (rand()-.49)*height*.65));
    shape.lineTo(x, elevation);
  }
  shape.lineTo(125, -26);
  shape.closePath();
  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape),
    new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, fog: true }));
  mesh.position.z = z;
  scene.add(mesh);
}
mountains(-57, -1, 0x172536, 11, 2.6);
mountains(-47, -4, 0x182b36, 9, 1.9);
mountains(-33, -7, 0x142831, 8, 1.4);

scene.add(new THREE.HemisphereLight(0x8eacb8, 0x0c151b, 1.15));
const flareLight = new THREE.PointLight(0xa9dce8, 0, 150);
flareLight.position.set(8, 17, -18);
scene.add(flareLight);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(220, 170),
  new THREE.MeshStandardMaterial({ color: 0x0b1a20, roughness: 1 }));
ground.rotation.x = -Math.PI / 2;
ground.position.y = -10.3;
scene.add(ground);

const stone = new THREE.MeshStandardMaterial({ color: 0x202a2e, roughness: .97, flatShading: true });
const moss = new THREE.MeshStandardMaterial({ color: 0x263631, roughness: 1, flatShading: true });
function column(x, y, z, h, r) {
  const tapered = new THREE.CylinderGeometry(r*.42, r*1.1, h, 5, 4);
  const mesh = new THREE.Mesh(tapered, stone);
  mesh.position.set(x,y+h/2,z);
  mesh.rotation.z = (rand()-.5)*.17;
  scene.add(mesh);
  for(let j=0;j<3;j++){
    const crack = new THREE.Mesh(new THREE.BoxGeometry(r*.11,h*(.08+rand()*.12),r*.15),moss);
    crack.position.set(x+(rand()-.5)*r,y+rand()*h,z+r*.7);
    crack.rotation.z=rand()*1.1;
    scene.add(crack);
  }
}
for (let i=0;i<23;i++) {
  const z=-33+rand()*47, x=(rand()-.5)*95, r=.4+rand()*2.2;
  column(x,-10.4,z,1.8+rand()*10,r);
}
for (let i=0;i<8;i++) {
  const x=(rand()-.5)*56, z=-6-rand()*35;
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.11,.39,7+rand()*8,5),stone);
  trunk.position.set(x,-5.2,z);
  trunk.rotation.z=(rand()-.5)*.4;
  scene.add(trunk);
  for (let j=0;j<3;j++) {
    const branch=new THREE.Mesh(new THREE.CylinderGeometry(.045,.14,3+rand()*4,4),stone);
    branch.position.set(x+(j-1)*.9,rand()*2+1,z);
    branch.rotation.z=(j-1)*.82;
    scene.add(branch);
  }
}
const blade = new THREE.MeshBasicMaterial({ color: 0x32443c, side: THREE.DoubleSide });
for (let i=0;i<180;i++) {
  const x=(rand()-.5)*100, z=-21+rand()*47, h=.8+rand()*3.6;
  const grass = new THREE.Mesh(new THREE.ConeGeometry(.08+rand()*.14,h,3),blade);
  grass.position.set(x,-10+h/2,z);
  grass.rotation.z=(rand()-.5)*.5;
  scene.add(grass);
}

const fogPlanes = [];
for (const [z,opacity] of [[-40,.65],[-21,.8],[-4,1]]) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(145,44),fogMaterial(opacity));
  mesh.position.set(0,-4,z);
  mesh.renderOrder = 2;
  scene.add(mesh);
  fogPlanes.push(mesh);
}
const isMobile = matchMedia('(pointer: coarse)').matches;
const count = isMobile ? 95 : 220;
const particleXYZ = new Float32Array(count*3);
const motion = [];
for(let i=0;i<count;i++){
  particleXYZ[i*3]=(rand()-.5)*105;
  particleXYZ[i*3+1]=-9+rand()*38;
  particleXYZ[i*3+2]=-31+rand()*48;
  motion.push([.008+rand()*.021,.03+rand()*.045]);
}
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(particleXYZ,3));
const motes = new THREE.Points(geometry, new THREE.PointsMaterial({
  color:0xb9bea5,size:.19,sizeAttenuation:true,transparent:true,opacity:.7,
  depthWrite:false,blending:THREE.AdditiveBlending
}));
scene.add(motes);

const bolts = new THREE.Group();
scene.add(bolts);
let flash = 0;
let lightningLife = 0;
let nextStrike = 3.7;
function lightning() {
  bolts.clear();
  const x=(rand()-.5)*35+5, y=26+rand()*14, end=-7+rand()*16;
  let last=new THREE.Vector3(x,y,-21);
  const vertices=[];
  for(let j=0;j<16;j++){
    const next=new THREE.Vector3(x+(rand()-.5)*9,y+(end-y)*(j+1)/16,-21);
    vertices.push(last,next);
    if(j>4 && rand()>.71){
      const side=next.clone().add(new THREE.Vector3((rand()-.5)*9,-3-rand()*4,0));
      vertices.push(next,side);
    }
    last=next;
  }
  const points = new Float32Array(vertices.flatMap(p=>[p.x,p.y,p.z]));
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(points,3));
  const line=new THREE.LineSegments(geo,new THREE.LineBasicMaterial({
    color:0xb7e8ff,transparent:true,opacity:.94,depthWrite:false
  }));
  bolts.add(line);
  flash=1; lightningLife=.27;
  nextStrike=5+rand()*10;
}
addEventListener('pointerdown', e => {
  pointer.x=e.clientX/innerWidth-.5;
  pointer.y=e.clientY/innerHeight-.5;
  lightning();
});
addEventListener('pointermove',e=>{
  pointer.x=e.clientX/innerWidth-.5;
  pointer.y=e.clientY/innerHeight-.5;
},{passive:true});
addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  canvas.setSize(innerWidth,innerHeight);
});
let last=clock.getElapsedTime();
function animate(){
  requestAnimationFrame(animate);
  const now=clock.getElapsedTime();
  const dt=Math.min(.05,now-last);last=now;
  uniforms.uTime.value=now;
  nextStrike-=dt;
  if(nextStrike<=0)lightning();
  lightningLife-=dt;
  flash=Math.max(0,flash-dt*2.8);
  bolts.visible=lightningLife>0;
  uniforms.uFlash.value=flash;
  flareLight.intensity=flash*16;
  for(let i=0;i<count;i++){
    particleXYZ[i*3]+=motion[i][0];
    particleXYZ[i*3+1]+=motion[i][1];
    if(particleXYZ[i*3]>56)particleXYZ[i*3]=-56;
    if(particleXYZ[i*3+1]>32)particleXYZ[i*3+1]=-10;
  }
  geometry.attributes.position.needsUpdate=true;
  fogPlanes.forEach((plane,i)=>{
    plane.position.x=Math.sin(now*.051+i*.7)*2.7+pointer.x*(1+i)*-.9;
  });
  moonHalo.scale.setScalar(1+Math.sin(now*.37)*.045);
  camera.position.x += (pointer.x*3.3-camera.position.x)*.017;
  camera.position.y += ((5-pointer.y*1.7)-camera.position.y)*.017;
  camera.lookAt(0,3,-22);
  canvas.render(scene,camera);
}
animate();

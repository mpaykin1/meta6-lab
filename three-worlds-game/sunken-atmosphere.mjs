// PORT OF OWNER'S shaders (unchanged GLSL):
// reference/sunken-city/index.html — rayMat, drift, snowMat, plankMat.
// Same THREE.Scene and renderer as three-worlds-game. No secondary canvas, HUD or synthetic models.
export function createSunkenAtmosphere({THREE,scene,camera,seed=1337,SEA=3.8}){
 let state=seed>>>0;
 const rand=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
 const rr=(lo,hi)=>lo+(hi-lo)*rand();
 const U={uTime:{value:0}},V3=THREE.Vector3,particles=[];
const rayMat = new THREE.ShaderMaterial({
  uniforms: { uTime: U.uTime }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
  vertexShader: 'varying vec2 vUv; varying float vD; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vD = -mv.z; gl_Position = projectionMatrix * mv; }',
  fragmentShader: /* glsl */`
    uniform float uTime; varying vec2 vUv; varying float vD;
    void main(){
      float x = abs(vUv.x - 0.5) * 2.0;
      float a = pow(1.0 - x, 2.2) * smoothstep(0.0, 0.55, vUv.y) * (0.55 + 0.45 * sin(uTime * 0.35 + vUv.y * 4.0 + x * 3.0));
      a *= 0.05 * smoothstep(4.0, 18.0, vD) * exp(-vD * 0.012);
      gl_FragColor = vec4(vec3(0.55, 0.95, 1.0) * a, 1.0);
    }` });
const rays = [];
for (let k = 0; k < 9; k++) {
  const r = new THREE.Mesh(new THREE.PlaneGeometry(rr(3, 7), 70), rayMat);
  r.position.set(rr(-30, 30), 26, rr(-34, 22));
  r.rotation.z = rr(-0.25, 0.25);
  r.userData.tilt = r.rotation.z;
  r.renderOrder = 20; r.frustumCulled = false;
  rays.push(r); scene.add(r);
}


function drift(n, size, colA, colB, additive, box) {
  const g = new THREE.BufferGeometry();
  const p = new Float32Array(n * 3), s = new Float32Array(n);
  for (let i = 0; i < n; i++) { p[i * 3] = rr(0, box); p[i * 3 + 1] = rr(0, box * 0.5); p[i * 3 + 2] = rr(0, box); s[i] = rand(); }
  g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('aSeed', new THREE.BufferAttribute(s, 1));
  const m = new THREE.ShaderMaterial({
    uniforms: { uTime: U.uTime, uCam: { value: new V3() }, uBox: { value: box }, uSize: { value: size }, uA: { value: new THREE.Color(colA) }, uB: { value: new THREE.Color(colB) }, uScale: { value: 400 } },
    transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    vertexShader: /* glsl */`
      attribute float aSeed; uniform float uTime, uBox, uSize, uScale; uniform vec3 uCam; varying float vA; varying float vS;
      void main(){
        vec3 p = position + vec3(sin(uTime * 0.21 + aSeed * 40.0) * 0.8, -uTime * (0.05 + aSeed * 0.12), cos(uTime * 0.17 + aSeed * 30.0) * 0.8);
        vec3 hb = vec3(uBox * 0.5, uBox * 0.25, uBox * 0.5);
        p = mod(p - uCam + hb, vec3(uBox, uBox * 0.5, uBox)) - hb + uCam;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float d = max(-mv.z, 0.1);
        gl_PointSize = clamp(uSize * uScale / d, 1.0, 10.0);
        vA = (0.45 + 0.55 * sin(uTime * (0.8 + aSeed * 2.0) + aSeed * 60.0)) * exp(-d * 0.035);
        vS = aSeed;
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uA, uB; varying float vA; varying float vS;
      void main(){ vec2 q = gl_PointCoord * 2.0 - 1.0; float a = (1.0 - smoothstep(0.4, 1.0, length(q))) * vA; if (a < 0.01) discard;
        gl_FragColor = vec4(mix(uA, uB, step(0.7, vS)), a); }` });
  const pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.renderOrder = 15;
  scene.add(pts); particles.push(pts);
  return m;
}
const snowMat = drift(1700, 0.045, '#9fb9c4', '#c8e6ea', false, 56);
const plankMat = drift(520, 0.07, '#3fe0d8', '#b07cff', true, 48);


 for(const r of rays){r.userData.dx=r.position.x;r.userData.dz=r.position.z;}
 function update(dt,immersion,position){
  U.uTime.value+=dt;
  const wet=immersion>.04;
  for(const r of rays){
   r.visible=wet;
   if(wet){
    r.position.set(position.x+r.userData.dx,SEA-9,position.z+r.userData.dz);
    r.rotation.y=Math.atan2(camera.position.x-r.position.x,camera.position.z-r.position.z);
    r.rotation.z=r.userData.tilt+Math.sin(U.uTime.value*.13+r.position.x)*.04;
   }
  }
  for(const p of particles)p.visible=wet;
  if(wet){snowMat.uniforms.uCam.value.copy(camera.position);plankMat.uniforms.uCam.value.copy(camera.position);}
 }
 function dispose(){
  for(const r of rays){scene.remove(r);r.geometry.dispose();}
  rayMat.dispose();
  for(const p of particles){scene.remove(p);p.geometry.dispose();p.material.dispose();}
 }
 return {update,dispose, get counts(){return {rays:rays.length,marineSnow:snowMat?1700:0,plankton:plankMat?520:0}}};
}

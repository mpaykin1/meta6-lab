// Extracted verbatim from pod-i-nad-68b2ecd3.html; shader composition resolves original GLSL_HASH and voxel dimensions.
// Source blob: a2c0b18293fd870b1437d9efeee9a207711c1897
export const MIST_VERT = "\nvarying vec3 vWorld; varying float vDepth;\nvoid main() { vec4 wp = modelMatrix * vec4(position, 1.0); vWorld = wp.xyz; vec4 mv = viewMatrix * wp; vDepth = -mv.z; gl_Position = projectionMatrix * mv; }";
export const GLSL_HASH = "\nfloat h12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }\nfloat vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);\n  return mix(mix(h12(i), h12(i + vec2(1.0, 0.0)), u.x), mix(h12(i + vec2(0.0, 1.0)), h12(i + vec2(1.0, 1.0)), u.x), u.y); }\nfloat fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = p * 2.03 + 17.17; a *= 0.5; } return s; }\n";
export const MIST_FRAG_TEMPLATE = "\nuniform sampler2D uHeight;\nuniform float uTime, uAlpha, uLayer;\nuniform vec3 uColor;\nuniform vec2 uDrift;\nvarying vec3 vWorld; varying float vDepth;\n${GLSL_HASH}\nvoid main() {\n  vec2 cell = floor(vWorld.xz * 4.0) / 4.0;                   // quarter-block mist pixels\n  float n = smoothstep(0.42, 0.8, fbm(cell * 0.07 + uDrift * uTime));\n  float ground = texture2D(uHeight, cell / vec2(${W}.0, ${D}.0)).r * 16.0;\n  float clear = smoothstep(uLayer - 0.15, uLayer - 0.75, ground);\n  float a = n * clear * smoothstep(3.0, 11.0, vDepth) * (1.0 - smoothstep(70.0, 150.0, vDepth)) * uAlpha;\n  if (a < 0.003) discard;\n  gl_FragColor = vec4(uColor, a);\n}";
export function composeMistFragment({worldWidth=64,worldDepth=64}={}) {
  for(const n of [worldWidth,worldDepth]) if(!Number.isInteger(n)||n<=0)throw new Error('Invalid voxel dimension');
  return MIST_FRAG_TEMPLATE.replaceAll('${GLSL_HASH}',GLSL_HASH).replaceAll('${W}',String(worldWidth)).replaceAll('${D}',String(worldDepth));
}
export function createMistMaterial(THREE,{heightTexture,color=0xa9c8cd,alpha=0.2,layer=4,drift=[0.012,0.006],time=0,worldWidth=64,worldDepth=64}={}) {
  if(!THREE?.ShaderMaterial||!heightTexture)throw new Error('Three.js and heightTexture are required');
  const uniforms={uHeight:{value:heightTexture},uTime:{value:time},uAlpha:{value:alpha},uLayer:{value:layer},uColor:{value:new THREE.Color(color)},uDrift:{value:new THREE.Vector2(...drift)}};
  const material=new THREE.ShaderMaterial({uniforms,vertexShader:MIST_VERT,fragmentShader:composeMistFragment({worldWidth,worldDepth}),transparent:true,depthWrite:false});
  return {material,uniforms,update(t){uniforms.uTime.value=t},dispose(){material.dispose()}};
}
export function createMistLayers(THREE,{scene,heightTexture,seaLevel=3.8,worldWidth=64,worldDepth=64,color=0xa9c8cd,alpha=0.2}={}) {
  if(!scene)throw new Error('scene is required');
  const sharedColor=new THREE.Color(color), sharedAlpha={value:alpha};
  const layers=[[0.12,0.012,0.006],[0.55,-0.009,0.011],[1,0.007,-0.01]].map(([dy,ax,az],i)=>{
    const component=createMistMaterial(THREE,{heightTexture,layer:seaLevel+dy,drift:[ax,az],worldWidth,worldDepth,color,alpha});
    component.uniforms.uColor.value=sharedColor;component.uniforms.uAlpha=sharedAlpha;
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(180,180).rotateX(-Math.PI/2),component.material);
    mesh.position.set(worldWidth/2,seaLevel+dy,worldDepth/2);mesh.renderOrder=8+i;scene.add(mesh);
    return {...component,mesh};
  });
  return {layers,update(time){layers.forEach(l=>l.update(time))},setAlpha(a){sharedAlpha.value=a},setColor(c){sharedColor.set(c)},dispose(){layers.forEach(l=>{scene.remove(l.mesh);l.mesh.geometry.dispose();l.dispose()})}};
}

import * as T from 'three';
// Lightweight, GPU-only asymmetric vertical depth-of-field and hand-painted color grade.
export function createHealerOptics(renderer,scene,camera){
 const target=new T.WebGLRenderTarget(4,4,{depthBuffer:true});
 const quadScene=new T.Scene(),quadCamera=new T.OrthographicCamera(-1,1,1,-1,0,1);
 const shader=new T.ShaderMaterial({
  depthTest:false,depthWrite:false,
  uniforms:{tScene:{value:target.texture},uResolution:{value:new T.Vector2(4,4)},uMood:{value:0},
    uStrength:{value:.78},uTime:{value:0}},
  vertexShader:[
   'varying vec2 vUv;',
   'void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}'
  ].join('\n'),
  fragmentShader:[
   'precision highp float;',
   'uniform sampler2D tScene;',
   'uniform vec2 uResolution;',
   'uniform float uMood;',
   'uniform float uStrength;',
   'uniform float uTime;',
   'varying vec2 vUv;',
   'vec3 sampleRGB(vec2 uv){return texture2D(tScene,clamp(uv,0.001,0.999)).rgb;}',
   'void main(){',
   ' vec2 uv=vUv;',
   ' float d=abs(uv.y-.51);',
   ' float focus=smoothstep(.17,.42,d);',
   ' float radius=focus*uStrength*(1.8+1.4*smoothstep(.33,.49,d));',
   ' vec2 texel=radius/uResolution;',
   ' vec3 original=sampleRGB(uv),blur=vec3(0.);',
   ' blur+=sampleRGB(uv)*.22;',
   ' blur+=sampleRGB(uv+vec2(texel.x,0.))*.11;',
   ' blur+=sampleRGB(uv-vec2(texel.x,0.))*.11;',
   ' blur+=sampleRGB(uv+vec2(0.,texel.y))*.11;',
   ' blur+=sampleRGB(uv-vec2(0.,texel.y))*.11;',
   ' blur+=sampleRGB(uv+texel)*.085;',
   ' blur+=sampleRGB(uv-texel)*.085;',
   ' blur+=sampleRGB(uv+vec2(texel.x,-texel.y))*.085;',
   ' blur+=sampleRGB(uv+vec2(-texel.x,texel.y))*.085;',
   ' vec3 c=mix(original,blur,focus*.92);',
   ' // Blue-gray rainy night, dusty rose dusk, or bright sun on the turquoise shore.',
   ' vec3 dusk=vec3(1.08,.95,.91),night=vec3(.66,.76,.89),day=vec3(1.04,1.07,1.05);',
   ' vec3 grade=mix(dusk,night,smoothstep(.25,.75,uMood));',
   ' grade=mix(grade,day,smoothstep(1.25,1.75,uMood));',
   ' c*=grade;',
   ' float vignette=1.0-.16*smoothstep(.32,.76,length((uv-.5)*vec2(1.09,1.0)));',
   ' c*=vignette;',
   ' gl_FragColor=vec4(c,1.);',
   '}'
  ].join('\n')
 });
 const quad=new T.Mesh(new T.PlaneGeometry(2,2),shader);quad.frustumCulled=false;quadScene.add(quad);
 let width=0,height=0;
 function resize(w,h){
  const mobile=w<760;
  const ratio=Math.min(renderer.getPixelRatio(),mobile?1:1.25);
  const W=Math.max(1,Math.round(w*ratio)),H=Math.max(1,Math.round(h*ratio));
  if(W!==width||H!==height){width=W;height=H;target.setSize(W,H);shader.uniforms.uResolution.value.set(W,H);}
  shader.uniforms.uStrength.value=mobile?.45:.8;
 }
 function render(time=0){
  shader.uniforms.uTime.value=time;
  renderer.setRenderTarget(target);renderer.clear();renderer.render(scene,camera);
  renderer.setRenderTarget(null);renderer.render(quadScene,quadCamera);
 }
 return {render,resize,setMood:mood=>{shader.uniforms.uMood.value=mood;},setTiltShift:enable=>{
  shader.uniforms.uStrength.value=enable?.8:0;},dispose(){target.dispose();shader.dispose();quad.geometry.dispose();}};
}

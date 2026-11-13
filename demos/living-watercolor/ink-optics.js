import * as T from 'three';

// A small depth-aware wash softens distant and very near planes while keeping the hero sharp.
export function createInkOptics(renderer) {
  const target = new T.WebGLRenderTarget(1, 1, {depthBuffer: true});
  target.depthTexture = new T.DepthTexture(1, 1, T.UnsignedShortType);
  const scene = new T.Scene(), camera = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const material = new T.ShaderMaterial({
    depthTest: false, depthWrite: false,
    uniforms: {
      colorMap: {value: target.texture}, depthMap: {value: target.depthTexture},
      texel: {value: new T.Vector2(1, 1)}, focusDepth: {value: .333}, depthSpan: {value: 180},
      strength: {value: 1}
    },
    vertexShader: `varying vec2 vUv;
      void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
    fragmentShader: `
      uniform sampler2D colorMap,depthMap;
      uniform vec2 texel;
      uniform float focusDepth,depthSpan,strength;
      varying vec2 vUv;
      void main(){
        float d=texture2D(depthMap,vUv).r;
        float coc=smoothstep(7.,20.,abs(d-focusDepth)*depthSpan)*strength;
        vec2 stepUV=texel*coc*1.4;
        vec3 c=texture2D(colorMap,vUv).rgb*.40;
        c+=texture2D(colorMap,vUv+vec2(stepUV.x,stepUV.y)).rgb*.15;
        c+=texture2D(colorMap,vUv+vec2(-stepUV.x,stepUV.y)).rgb*.15;
        c+=texture2D(colorMap,vUv+vec2(stepUV.x,-stepUV.y)).rgb*.15;
        c+=texture2D(colorMap,vUv-stepUV).rgb*.15;
        gl_FragColor=vec4(c,1.);
        #include <colorspace_fragment>
      }`
  });
  scene.add(new T.Mesh(new T.PlaneGeometry(2, 2), material));
  let w = 0, h = 0;
  const size = new T.Vector2();
  return {
    render(world, worldCamera, overview) {
      renderer.getDrawingBufferSize(size);
      if (w !== size.x || h !== size.y) {
        w = size.x; h = size.y; target.setSize(w, h); material.uniforms.texel.value.set(1 / w, 1 / h);
      }
      material.uniforms.focusDepth.value = (60 - worldCamera.near) / (worldCamera.far - worldCamera.near);
      material.uniforms.depthSpan.value = worldCamera.far - worldCamera.near;
      material.uniforms.strength.value = overview ? .25 : 1;
      renderer.setRenderTarget(target); renderer.render(world, worldCamera);
      renderer.setRenderTarget(null); renderer.render(scene, camera);
    }
  };
}

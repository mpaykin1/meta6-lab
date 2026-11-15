import * as T from 'three';

// Кинематографический финальный проход поверх принятой INK-оптики (ink-optics.js не меняется):
// хроматическая аберрация, глитч строк, зерно, чернильная виньетка, сумерки, затемнение.
// Оптика рисует «на экран» через setRenderTarget(null) — мы на время подменяем null своим таргетом.
export function createPost(renderer) {
  const target = new T.WebGLRenderTarget(1, 1, {type: T.HalfFloatType, depthBuffer: false});
  const uniforms = {
    tColor: {value: target.texture}, res: {value: new T.Vector2(1, 1)}, time: {value: 0},
    signal: {value: 0}, glitch: {value: 0}, dusk: {value: 0}, fade: {value: 0}, warm: {value: 0}
  };
  const material = new T.ShaderMaterial({
    uniforms, depthTest: false, depthWrite: false,
    vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader: `
      uniform sampler2D tColor; uniform vec2 res;
      uniform float time,signal,glitch,dusk,fade,warm;
      varying vec2 vUv;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=vUv;
        float tick=floor(time*24.);
        float row=floor(uv.y*res.y/7.);
        float band=step(1.-glitch*.30,h(vec2(row,tick)));
        uv.x+=(h(vec2(row+3.,tick))-.5)*.07*glitch*band;
        uv.x+=step(.988-glitch*.05,h(vec2(floor(uv.y*9.),tick)))*glitch*.025;
        vec2 d=uv-.5; float dist=length(d);
        float ca=(.0016+signal*.008+glitch*.008)*dist*2.;
        vec3 c=vec3(texture2D(tColor,uv+d*ca).r,texture2D(tColor,uv).g,texture2D(tColor,uv-d*ca).b);
        c*=mix(vec3(1.),vec3(.62,.66,.86),dusk*.55);
        float l=dot(c,vec3(.299,.587,.114));
        c=mix(c,vec3(l)*vec3(.78,.86,.98),signal*.40);
        float v=smoothstep(.32,.98,dist*(1.+signal*.4+dusk*.3));
        c=mix(c,vec3(.012,.017,.022),v*(.22+signal*.5+dusk*.32));
        c+=vec3(.55,.12,.03)*signal*v*.10*(.5+.5*sin(time*5.3));
        c+=vec3(.9,.55,.22)*warm*.07*(1.-dist);
        c+=(h(vUv*res+fract(time*13.)*91.)-.5)*(.022+signal*.03+glitch*.05)*(.35+l);
        c*=1.-glitch*.10*step(.5,fract(vUv.y*res.y*.5));
        c=mix(c,vec3(.010,.014,.017),fade);
        gl_FragColor=vec4(c,1.);
        #include <colorspace_fragment>
      }`
  });
  const scene = new T.Scene(), camera = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  scene.add(new T.Mesh(new T.PlaneGeometry(2, 2), material));
  const original = renderer.setRenderTarget.bind(renderer);
  let redirect = null;
  renderer.setRenderTarget = (rt, ...rest) => original(rt === null && redirect ? redirect : rt, ...rest);
  const size = new T.Vector2();
  let scale = 1;
  return {
    uniforms,
    setScale(v) { scale = v; },
    render(drawWorld) {
      renderer.getDrawingBufferSize(size);
      const w = Math.max(1, Math.round(size.x * scale)), hgt = Math.max(1, Math.round(size.y * scale));
      if (target.width !== w || target.height !== hgt) { target.setSize(w, hgt); uniforms.res.value.set(w, hgt); }
      redirect = target; drawWorld(); redirect = null;
      original(null); renderer.render(scene, camera);
    }
  };
}

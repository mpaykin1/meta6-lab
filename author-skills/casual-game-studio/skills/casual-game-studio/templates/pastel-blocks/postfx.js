/** pmndrs/postprocessing 6.39.6 adapter for Casual Game Studio.
 * Uses the actual upstream module, not CSS glow or a home-grown imitation.
 * Dynamic import is non-blocking; clean Three.js remains usable if offline/unsupported.
 * The import map must resolve `three` identically for both this and the game.
 */
export async function createPastelPostFX(THREE,renderer,scene,camera){
  const {EffectComposer,RenderPass,EffectPass,BloomEffect,VignetteEffect} = await import('postprocessing');
  const composer=new EffectComposer(renderer,{frameBufferType:THREE.HalfFloatType,multisampling:0});
  composer.addPass(new RenderPass(scene,camera));
  const defaultBloom=.48;
  const bloom=new BloomEffect({intensity:defaultBloom,luminanceThreshold:.88,luminanceSmoothing:.18,mipmapBlur:true,radius:.65,levels:5});
  const vignette=new VignetteEffect({offset:.46,darkness:.22});
  composer.addPass(new EffectPass(camera,bloom,vignette));
  return {
    defaultBloom,
    getBloom:()=>bloom.intensity,
    setBloom:v=>{bloom.intensity=Math.max(0,Math.min(2,v));},
    resize:(w,h)=>composer.setSize(Math.max(1,Math.round(w)),Math.max(1,Math.round(h))),
    render:dt=>composer.render(dt),
    dispose:()=>composer.dispose()
  };
}

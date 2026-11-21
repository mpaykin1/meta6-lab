/**
 * Single 3D game tick: player input → one Rapier controller → authored sprite
 * animation (inside controller.update) → environmental visual events →
 * pmndrs postprocessing or direct Three.js render. No duplicate physics step.
 * Real approved artist atlases and real Rapier are prerequisites.
 */
import {createHeroPostFX} from './hero-postfx.mjs';

export function startHeroRapierPostFXLoop({
  THREE, renderer, scene, camera, actor, controller,
  emitters=[], preset='balanced', fogColor=0x1c2832,
  onEnvironmentFrame=()=>{}, allowScreenEffects=false,
  adaptive=true, maxDelta=0.05
}={}) {
  if(!controller || typeof controller.update !== 'function')
    throw new Error('Rapier directional controller with update(dt) required');
  if(!actor?.root || !actor?.meta?.identity?.approved)
    throw new Error('Hero must have approved directional atlas identity');
  if(!Number.isFinite(maxDelta) || maxDelta<=0 || maxDelta>0.1)
    throw new Error('maxDelta must be 0..0.1');
  const fx = createHeroPostFX({THREE,renderer,scene,camera,hero:actor,emitters,preset,fogColor,
    allowScreenEffects,adaptive});
  let alive=true;
  let handle=null;
  let prev=null;
  function onResize(){
    const element=renderer.domElement;
    const w=Math.max(1,element?.clientWidth||element?.width||1);
    const h=Math.max(1,element?.clientHeight||element?.height||1);
    renderer.setSize(w,h,false);
    camera.aspect=w/h;
    camera.updateProjectionMatrix?.();
    fx.resize(w,h);
  }
  function frame(now){
    if(!alive)return;
    handle=globalThis.requestAnimationFrame(frame);
    const dt=prev===null?1/60:Math.max(0,Math.min(maxDelta,(now-prev)/1000));
    prev=now;
    if(globalThis.document?.hidden)return;
    controller.update(dt); // One and only one Rapier move + actor sprite update.
    onEnvironmentFrame(dt); // Weather/light motion ONLY, never spontaneous hero actions.
    fx.render(dt); // Never call renderer.render again for this frame.
  }
  try {
    onResize();
    globalThis.addEventListener?.('resize',onResize);
    handle=globalThis.requestAnimationFrame(frame);
  } catch(error) {
    alive=false;
    fx.dispose();
    throw error;
  }
  return {
    fx,
    resize:onResize,
    stop(){
      if(!alive)return;
      alive=false;
      if(handle!==null)globalThis.cancelAnimationFrame?.(handle);
      globalThis.removeEventListener?.('resize',onResize);
      fx.dispose();
    }
  };
}

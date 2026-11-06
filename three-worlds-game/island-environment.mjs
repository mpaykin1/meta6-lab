// §21.8: Shared sky/fog, environmental time and post controls.
// BOTH updatePost and updateEnvironment are verbatim owner source:
// reference/island-canon/engine__50_env.js (one renderer, no duplicated loop).
// The existing 20_scene/GLSL sky + palette uniforms are passed by reference.
export function createIslandEnvironment({
 G,FX,REDUCED,beacon,pal,camera,player,getWorld,tmpE,bloom,dofH,dofV,
 SFX,ambienceMix,applyPalette,rr,damp,clamp,lerp
}){
 const world=new Proxy({}, {get(_t,name){return getWorld()[name]}});
function updatePost(dt) {
  G.danger += (G.dangerT - G.danger) * damp(3, dt);
  G.hurt = Math.max(0, G.hurt - dt * 1.6);
  G.blipT -= dt;
  if (G.blipT <= 0) { G.blipT = rr(6, 13); if (G.tod > 0.35 && G.state === 'play') G.blip = 0.18; }
  G.blip = Math.max(0, G.blip - dt * 1.4);
  G.flash = Math.max(0, G.flash - dt * 0.9);
  const red = REDUCED ? 0.35 : 1;
  FX.uTime.value = G.time;
  FX.uAberr.value = (0.0016 + G.danger * 0.0035 + G.hurt * 0.012 + beacon.flare * 0.003) * red;
  FX.uGlitch.value = (G.blip + G.danger * 0.14 * (Math.sin(G.time * 17) > 0.7 ? 1 : 0) + G.hurt * 0.9) * red;
  FX.uDanger.value = G.danger;
  FX.uVignette.value = pal.vig + G.danger * 0.12;
  FX.uFlash.value = Math.max(G.hurt * 0.26, G.flash);
  FX.uDesat.value = G.desat;
  G.fade = Math.min(1, G.fade + dt * 0.5);
  FX.uFade.value = G.fade * G.fade * (3 - 2 * G.fade);
  const barsT = (G.state === 'title' || G.state === 'loading' ? 0.075 : G.state === 'victory' ? 0.09 : G.bossCam > 0.4 ? 0.06 : 0) * (camera.aspect < 1 ? 0.55 : 1);
  G.bars += (barsT - G.bars) * damp(2.2, dt);
  FX.uBars.value = G.bars;
  bloom.strength = pal.bloom + beacon.flare * 0.45 + G.hurt * 0.25;
  const inPlay = G.state === 'play' || G.state === 'paused' || G.state === 'dead';
  if (inPlay) tmpE.set(player.vis.x, player.vis.y + 0.8, player.vis.z); else tmpE.set(world.beacon.x, world.beacon.y - 3, world.beacon.z);
  tmpE.project(camera);
  G.focus += (clamp(tmpE.y * 0.5 + 0.5, 0.2, 0.8) - G.focus) * damp(4, dt);
  const amt = inPlay ? 1.15 : G.state === 'victory' ? 1.1 : 1.6;
  dofH.uniforms.uFocus.value = dofV.uniforms.uFocus.value = G.focus;
  dofH.uniforms.uAmount.value = dofV.uniforms.uAmount.value = amt;
}
function updateEnvironment(dt) {
  G.tod += (G.todT - G.tod) * damp(0.35, dt);
  G.dawn += ((G.state === 'victory' && G.endT > 2.2 ? 1 : 0) - G.dawn) * damp(G.state === 'victory' ? 0.28 : 3, dt);
  applyPalette(G.tod, G.dawn);
  SFX.ambience(G.tod * (1 - G.dawn), G.danger, ambienceMix());
  G.beatT -= dt;
  if (G.danger > 0.25 && G.state === 'play' && G.beatT <= 0) { SFX.beat(G.danger); G.beatT = lerp(1.0, 0.42, G.danger); }
  G.comboT = Math.max(0, G.comboT - dt);
}
 return {updatePost,updateEnvironment};
}

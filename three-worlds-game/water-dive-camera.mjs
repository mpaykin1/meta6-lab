// Owner §21.22 A01/A08: water-only additive camera translation.
// Original Island camera-rig.mjs and its inertia/golden are immutable.
// The same vertical offset is applied to eye and implied look target, so all
// orientation, yaw/pitch, weapon aiming, orbit inertia and HUD remain original.
const bound=(n,lo,hi)=>Math.min(hi,Math.max(lo,n));
export function waterCameraShift(previous,eyeY,heroY,floorY,seaY,immersion,dt){
 const deep=bound((seaY-floorY-2.8)/1.4,0,1);
 const submerged=bound((seaY-heroY-.72)/1.3,0,1);
 const immersed=bound((immersion-.68)/.32,0,1);
 const strength=deep*submerged*immersed;
 const desiredEyeY=Math.min(seaY-.45,heroY+1.75);
 const goal=bound(Math.max(0,eyeY-desiredEyeY)*strength,0,18);
 return previous+(goal-previous)*(1-Math.exp(-4.2*bound(dt,0,.1)));
}

// §21.22: additional Ash archipelago beyond the ORIGINAL western mainland.
// Never touch the accepted Island core (x=0..63), the original Ash mission
// zone (x around -80..-130), or the eastern Sunken City shore. One height source
// drives the visual mesh, physics, foliage, NPC ground and water immersion.
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
export const ASH_ARCHIPELAGO=Object.freeze([
 Object.freeze({x:-220,z:35,radius:55}),
 Object.freeze({x:-360,z:110,radius:57}),
 Object.freeze({x:-500,z:-35,radius:56})
]);
export function ashArchipelagoHeight(x,z,seed,original){
 if(x>=-145)return original;
 const blend=smooth((-x-145)/35);
 const seabed=-5.7+Math.sin(x*.065+seed*.01)*Math.cos(z*.047-seed*.004)*.9;
 let island=seabed;
 for(const a of ASH_ARCHIPELAGO){
  const radius=Math.hypot(x-a.x,z-a.z);
  const shore=Math.max(0,a.radius-radius)*.34;
  island=Math.max(island,seabed+shore);
 }
 return original*(1-blend)+island*blend;
}

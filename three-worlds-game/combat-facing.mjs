// Owner §21.18: aim independent of movement, preserving original Island cursor camera.
// This module owns target priority and angular inertia. It never mutates movement input.
const angular=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
export function chooseCombatTarget(foes,current,origin,range,alive,visible=()=>true){
 const possible=foes.filter(f=>{
  if(!alive(f))return false;
  const p=f.segs?.[0];if(!p)return false;
  return Math.hypot(p.x-origin.x,p.z-origin.z)<=range+(f.def?.rad||0)&&visible(f);
 });
 if(current&&possible.includes(current))return current;
 return possible.sort((a,b)=>
  Math.hypot(a.segs[0].x-origin.x,a.segs[0].z-origin.z)-
  Math.hypot(b.segs[0].x-origin.x,b.segs[0].z-origin.z))[0]||null;
}
export function turnWeaponToward({x,z},target,dt,{speed=12}={}){
 const from=Math.atan2(z,x),to=Math.atan2(target.z,target.x);
 const a=from+angular(from,to)*(1-Math.exp(-speed*Math.max(0,dt)));
 return {x:Math.cos(a),z:Math.sin(a)};
}
export function turnHeroToward(current,target,dt,{speed=12}={}){
 return turnWeaponToward(current,target,dt,{speed});
}
export function angleToTarget(look,target){
 return Math.abs(angular(Math.atan2(look.z,look.x),Math.atan2(target.z,target.x)));
}

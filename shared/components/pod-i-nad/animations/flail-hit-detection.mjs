// Reusable original-style flail hit detection: sphere/segment overlap, per-foe tick cooldown.
// No dependency on game globals. The host applies damage, knockback, particles and sound.
const dist2=(a,b)=>((a.x-b.x)**2+(a.y-b.y)**2+(a.z-b.z)**2);
export function createFlailHitDetector({ballRadius=.45,tick=.35,damage=10,knockback=1}={}){
 const lastHit=new WeakMap();
 function detect({ball,spin=1,player={x:0,z:0},foes=[],time=0,onHit=()=>{}}={}){
  if(!ball)throw new Error('ball position required');
  const hits=[];
  for(const foe of foes){
   if(!foe||foe.alive===false||foe.dead===true)continue;
   if(time-(lastHit.get(foe)??-Infinity)<tick)continue;
   const segments=foe.segs||foe.segments||(foe.position?[foe.position]:[]);
   for(let i=0;i<segments.length;i++){
    const segment=segments[i];if(!segment)continue;
    const radius=(typeof foe.segmentRadius==='function'?foe.segmentRadius(i):foe.radius??foe.rad??.4)+ballRadius;
    if(dist2(segment,ball)>radius*radius)continue;
    const dx=segment.x-player.x,dz=segment.z-player.z,d=Math.hypot(dx,dz)||1;
    const hit={foe,segment,segmentIndex:i,position:{x:segment.x,y:segment.y,z:segment.z},damage:damage*(.6+.4*spin),knockback,direction:{x:dx/d,z:dz/d},time};
    lastHit.set(foe,time);hits.push(hit);onHit(hit);break;
   }
  }
  return hits;
 }
 function clear(foe){if(foe)lastHit.delete(foe)}
 return {detect,clear};
}

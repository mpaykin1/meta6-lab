// Deterministic stage-7 simulation, deliberately independent of DOM, WebGL and wall-clock time.
export const bounded = (n,lo,hi)=>Math.max(lo,Math.min(hi,n));
export function immersionAt(surfaceY,heroY,floorY){
 return bounded((surfaceY+1.25-heroY)/2.7,0,1)*bounded((surfaceY-floorY)/.8,0,1);
}
export function swimVertical(player,dt,floorY,seaY){
 const pos=player.pos,vel=player.vel,
  goal=player.jumpHeld?2*bounded((seaY+.55-pos.y)/.8,0,1):-.72;
 vel.y+=(goal-vel.y)*bounded(dt*3.6,0,1);
 pos.y=bounded(pos.y+vel.y*dt,floorY+.08,Math.max(floorY+.08,seaY+.55));
 player.onGround=pos.y<=floorY+.09;
 if(player.onGround)vel.y=Math.max(0,vel.y);
 return pos.y;
}
export function bubbleEmissions(state,dt,immersion,verticalVelocity,capacity=96){
 state.budget+=(immersion>.04?(8+Math.abs(verticalVelocity)*29)*immersion:0)*dt;
 const emit=Math.min(24,capacity,Math.floor(state.budget));
 state.budget-=emit;
 return emit;
}
export function createGuestSchedule(seed=1337,{interval=50}={}){return {seed,cycle:0,remaining:interval};}
export function guestScheduleStep(state,dt,occupied){
 if(occupied)return false;
 state.remaining-=dt;
 if(state.remaining>1e-9)return false;
 state.remaining=Infinity; // one active guest maximum, rearm exclusively on completion
 return true;
}
export function finishGuestSchedule(state){
 state.cycle++;
 const q=Math.sin((state.cycle+state.seed)*12.9898)*43758.5453;
 state.remaining=50+((q%1+1)%1)*20;
 return state.remaining;
}

// Reused by the live underwater runtime and pure Node tests. No new scene objects.
export function ambientBubbleAnchors(anchors,player,seed,tick,radius=40){
 const h=(x,z,s)=>{let n=Math.imul(x|0,374761393)^Math.imul(z|0,668265263)^Math.imul(s|0,362437);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296};
 const out=[];for(let i=0;i<anchors.length;i++){
  const a=anchors[i];if(!/wreck|cathedral|arch/.test(a.id)||Math.hypot(a.x-player.x,a.z-player.z)>radius)continue;
  if(h(i,tick,seed)<.7)out.push({x:a.x+(h(tick,i,seed)-.5),y:a.y,z:a.z});
 }return out;
}
// Atmospheric effects are GPU shaders, not GLBs. They are verified by atmosphere.counts.
export const STAGE7_REQUIRED_ASSETS=['galleon','whale_skeleton','anchor','cannon','kraken_tentacle'];
export const STAGE7_REQUIRED_EFFECTS=['sun_rays','marine_snow','plankton'];
export function namedAssetInventory(names){const loaded=new Set(names);return {present:[...loaded].sort(),missing:STAGE7_REQUIRED_ASSETS.filter(n=>!loaded.has(n))};}

// Identical bounded ring slot selection in Node and live particle renderer.
export function nextBubbleSlot(state,capacity=96){
 if(!Number.isInteger(capacity)||capacity<=0)throw Error('Invalid bubble pool size');
 const slot=(state.cursor||0)%capacity;
 state.cursor=(state.cursor||0)+1;
 return slot;
}

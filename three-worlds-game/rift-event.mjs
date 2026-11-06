// Owner §21.15 — deterministic cinematic guest arc. No dependency on wall time/UI.
// warning=5s growing terrain glitch; opening=5s silence/hero line;
// emerging=5s original guest walking out of the open rift.
export const RIFT_PHASES=Object.freeze(['idle','warning','opening','emerging','dialogue','closing','escort','boss']);
export const RIFT_WORDS='Что происходит?!!!';
export const RIFT_TIMING=Object.freeze({warning:5,opening:5,emerging:5,closing:5});
export function frontOfHero(pos,look,distance=3.2){
 let dx=look.x||0,dz=look.z||0,l=Math.hypot(dx,dz);
 if(l<.001){dx=0;dz=-1;l=1}
 const x=pos.x+dx/l*distance,z=pos.z+dz/l*distance;
 const sx=x-pos.x,sz=z-pos.z;
 return {x,z,distance,alignment:(sx*dx+sz*dz)/(Math.max(.001,Math.hypot(sx,sz))*l)};
}
export function createRiftEvent(seed=1337,{initial=55,interval=58}={}){
 const state={phase:'idle',remaining:initial,elapsed:0,cycle:0,choice:null,history:[],spot:null,
  mission:null};
 const emit=phase=>{state.phase=phase;state.elapsed=0;state.history.push(phase)};
 function step(dt,{land=true,battle=false,pos,look,occupied=false}={}){
  dt=Math.max(0,Number.isFinite(dt)?dt:0);
  if(state.phase==='idle'){
   // Water and combat are allowed; a still-active guest alone defers the next visit.
   if(occupied)return state;
   state.remaining-=dt;
   if(state.remaining<=1e-8){
    state.spot=frontOfHero(pos,look);
    state.choice=null;state.mission=null;emit('warning');
   }
  }else if(RIFT_TIMING[state.phase]&&state.phase!=='closing'){
   state.elapsed+=dt;
   if(state.elapsed>=RIFT_TIMING[state.phase])
    emit(state.phase==='warning'?'opening':state.phase==='opening'?'emerging':'dialogue');
  }else if(state.phase==='closing'){
   state.elapsed+=dt;
   if(state.elapsed>=RIFT_TIMING.closing)emit('escort');
  }
  return state;
 }
 function choose(choice){
  if(state.phase!=='dialogue'||!['help','refuse'].includes(choice))return false;
  state.choice=choice;emit(choice==='help'?'closing':'boss');return true;
 }
 function finishArc(mission=null){
  if(state.phase!=='escort'&&state.phase!=='boss')return false;
  state.mission=mission;
  state.cycle++;
  const wave=Math.sin((seed+state.cycle)*12.9898)*43758.5453;
  state.remaining=interval+(((wave%1)+1)%1-.5)*4;
  emit('idle');return true;
 }
 return {state,step,choose,finishArc,
  get blocked(){return ['warning','opening','emerging','dialogue','closing'].includes(state.phase)},
  get fx(){return ['warning','opening','emerging','closing'].includes(state.phase)},
  get dialogue(){return state.phase==='dialogue'}};
}

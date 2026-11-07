// §21.14(B). Single simulation-time input lock with an unconditional 25s escape hatch.
// No UI, camera changes, system timers, or new event source.
export function createRiftInputGuard({timeout=25,resetInput=()=>{},setFrozen=()=>{}}={}){
 if(!Number.isFinite(timeout)||timeout<=0)throw Error('invalid freeze timeout');
 let frozen=false,elapsed=0,expired=false;
 function set(value){
  if(!value){
   if(frozen){frozen=false;resetInput();setFrozen(false);}
   elapsed=0;expired=false;return false;
  }
  if(frozen||expired)return frozen;
  frozen=true;elapsed=0;resetInput();setFrozen(true);return true;
 }
 function tick(dt){
  if(!frozen)return false;
  elapsed+=Math.max(0,Number.isFinite(dt)?dt:0);
  if(elapsed>=timeout-1e-7){
   frozen=false;elapsed=timeout;expired=true;
   resetInput();setFrozen(false);
   return true;
  }
  return false;
 }
 return {set,tick,get frozen(){return frozen},get expired(){return expired},get elapsed(){return elapsed},get remaining(){return frozen?Math.max(0,timeout-elapsed):0}};
}

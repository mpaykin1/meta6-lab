// Tween.js 25.0.0 (MIT). Existing frame loop owns time; no second RAF.
import {Tween,Easing} from './vendor/tween.esm.js';
export function createTransition(){
 let elapsed=0,track=null;
 const value={progress:0};
 function reset(){if(track)track.stop();track=null;elapsed=0;value.progress=0;}
 function start(duration,onComplete){
  reset();
  track=new Tween(value).to({progress:1},Math.max(1,duration)).easing(Easing.Quintic.InOut)
   .onComplete(()=>{track=null;onComplete?.();}).start(0);
 }
 function tick(dt){if(track){elapsed+=Math.min(.05,Math.max(0,dt))*1000;track.update(elapsed);}return value.progress;}
 return {start,reset,tick,get progress(){return value.progress;}};
}

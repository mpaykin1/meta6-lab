// §21.25 — keep the ACTUAL terrain rift safely inside the original camera.
// Screen projection is injected so short tests can cover multiple camera yaws
// without creating a second renderer or modifying the canonical camera rig.
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
export function riftVisualScale(phase,elapsed){
 const t=clamp((Number(elapsed)||0)/5,0,1);
 if(phase==='warning')return .015+.535*t; // visible five-second growth
 if(phase==='opening')return .55+.45*t;   // seamless second five-second opening
 if(phase==='closing')return .015+.985*t; // five-second return after choice
 if(['emerging','dialogue','escort'].includes(phase))return 1;
 return 0;
}
export function chooseVisibleRiftSpot(player,project,previous=null,{count=64,distance=3.2,margin=.72}={}){
 const isGood=q=>q&&Number.isFinite(q.x)&&Number.isFinite(q.y)&&
  q.z>-1&&q.z<1;
 if(previous){
  const q=project(previous.x,previous.z);
  if(isGood(q)&&Math.abs(q.x)<=margin&&Math.abs(q.y)<=margin)
   return {x:previous.x,z:previous.z,score:q.x*q.x+q.y*q.y,held:true};
 }
 let best=null;
 for(let i=0;i<count;i++){
  const angle=i*Math.PI*2/count,x=player.x+Math.cos(angle)*distance,
   z=player.z+Math.sin(angle)*distance;
  const ndc=project(x,z);
  if(!isGood(ndc))continue;
  const overflow=Math.max(0,Math.abs(ndc.x)-margin)+Math.max(0,Math.abs(ndc.y)-margin);
  const score=ndc.x*ndc.x+ndc.y*ndc.y+overflow*overflow*80;
  if(!best||score<best.score)best={x,z,score,ndcX:ndc.x,ndcY:ndc.y,held:false};
 }
 return best;
}

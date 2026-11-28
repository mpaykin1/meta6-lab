// Preserve the original 16-second finale at lower frame rates; bounded physics substeps.
export function advanceCinematic(elapsed,step,active=true){
 if(!active||!Number.isFinite(elapsed)||elapsed<=0)return;
 let remaining=Math.min(.25,elapsed);
 while(remaining>1e-7){const dt=Math.min(.05,remaining);remaining-=dt;if(step(dt)===false)break;}
}

// Procedural, original sounds. Unlocked only on a real user gesture (including iOS).
// No downloads, music files, autoplay or high-frequency alarm bursts.
function voice(ctx,dest,frequency,when,volume,duration,pan,shape='sine'){
 const o=ctx.createOscillator(),g=ctx.createGain(),p=ctx.createStereoPanner?ctx.createStereoPanner():ctx.createGain();
 o.type=shape;o.frequency.setValueAtTime(frequency,when);
 if(p.pan)p.pan.value=pan;
 g.gain.setValueAtTime(.0001,when);g.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),when+.035);
 g.gain.exponentialRampToValueAtTime(.0001,when+duration);
 o.connect(g);g.connect(p);p.connect(dest);o.start(when);o.stop(when+duration+.06);
}
export function crossingBell(ctx,dest,pan=.52,approach=.5){
 const start=ctx.currentTime+.014,vol=.010+.025*approach;
 // Consonant minor third is avoided: a low C / G fifth, two distant bell strokes.
 for(const t of [0,.31]){
  voice(ctx,dest,196,start+t,vol,.68,pan,'sine');
  voice(ctx,dest,294,start+t,.34*vol,.48,pan,'triangle');
 }
}
export function chainsClank(ctx,dest,pan=.55,seed=1){
 const t=ctx.currentTime+.012,amp=.0045;
 // Irregular tiny overlapping metallic contacts, darkened with soft low frequencies.
 for(let k=0;k<3;k++){
  const w=(seed*13+k*17)%19;
  voice(ctx,dest,460+w*7,t+k*.043,amp/(k+1),.13+k*.05,pan,'triangle');
 }
}
export function createBlackTrainAudio(){
 let ctx=null,out=null,lastBell=-100,lastChain=-100,unlocked=false;
 const unlock=()=>{
  if(!ctx){
   const AC=window.AudioContext||window.webkitAudioContext;
   if(!AC)return;
   try{navigator.audioSession.type='playback';}catch(_){}
   ctx=new AC();out=ctx.createGain();out.gain.value=.60;out.connect(ctx.destination);
  }
  if(ctx.state==='suspended')ctx.resume().catch(()=>{});
  unlocked=true;
 };
 for(const e of ['click','pointerup','touchend','keydown'])window.addEventListener(e,unlock,{passive:true,capture:true});
 return {tick(time,approach,visible=true){
  if(!unlocked||!ctx||ctx.state!=='running'||document.hidden||!visible)return;
  if(approach>.10&&time-lastBell>Math.max(.68,2.1-approach*1.45)){crossingBell(ctx,out,.55,approach);lastBell=time;}
  if(time-lastChain>6.7+Math.sin(time*.16)*2){chainsClank(ctx,out,.45,Math.floor(time*2));lastChain=time;}
 }};
}

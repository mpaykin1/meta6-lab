// Original Web Audio soundscape. Starts only after an actual key press or pointer gesture.
export function createSoundscape() {
 let ctx=null,master=null,noise=null;
 let started=false,muted=false,windNode=null,musicNodes=[];
 let wingAt=0,crowAt=0,stepAt=0,lastTick=0;
 const Audio=contextualAudio();
 function contextualAudio(){return window.AudioContext||window.webkitAudioContext||null;}
 function buffer(){
  const length=Math.floor(ctx.sampleRate*4);
  const b=ctx.createBuffer(1,length,ctx.sampleRate),v=b.getChannelData(0);
  let state=0;
  for(let i=0;i<length;i++){
   const n=Math.random()*2-1;
   state=.986*state+.014*n;
   v[i]=state*.82+n*.12;
  }
  return b;
 }
 function gain(value=1){const g=ctx.createGain();g.gain.value=value;return g;}
 function lowpass(frequency=700){
  const p=ctx.createBiquadFilter();p.type='lowpass';p.frequency.value=frequency;return p;
 }
 function ensure(){
  if(!Audio||started)return;
  ctx=new Audio();master=gain(muted?0:.24);master.connect(ctx.destination);
  noise=buffer();started=true;wind();
  music();
 }
 function unlock(){ensure();if(ctx&&ctx.state==='suspended')ctx.resume().catch(()=>{});}
 function burst(at,duration,freq,level){
  if(!ctx||muted)return;
  const src=ctx.createBufferSource();src.buffer=noise;src.loop=true;
  const filter=lowpass(freq),amp=gain(0);src.connect(filter);filter.connect(amp);amp.connect(master);
  const t=ctx.currentTime+at;
  amp.gain.setValueAtTime(0,t);amp.gain.linearRampToValueAtTime(level,t+.025);
  amp.gain.exponentialRampToValueAtTime(.0001,t+duration);
  src.start(t);src.stop(t+duration+.02);
 }
 function wing(){
  if(!ctx||muted)return;
  burst(0,.26,1150,.29);
  burst(.1,.31,560,.13);
 }
 function crow(){
  if(!ctx||muted)return;
  const t=ctx.currentTime;
  for(let i=0;i<2;i++){
   const osc=ctx.createOscillator(),filter=lowpass(920),a=gain(0);
   osc.type=i?'triangle':'sawtooth';
   const start=t+i*.14;
   osc.frequency.setValueAtTime(i?215:151,start);
   osc.frequency.exponentialRampToValueAtTime(i?124:82,start+.36);
   osc.connect(filter);filter.connect(a);a.connect(master);
   a.gain.setValueAtTime(.0001,start);
   a.gain.exponentialRampToValueAtTime(i?.025:.045,start+.07);
   a.gain.exponentialRampToValueAtTime(.0001,start+.42);
   osc.start(start);osc.stop(start+.44);
  }
 }
 function stalker(){
  if(!ctx||muted)return;
  burst(0,.55,280,.17);burst(.18,.32,190,.1);
 }
 function wind(){
  if(windNode||!ctx)return;
  const src=ctx.createBufferSource();src.buffer=noise;src.loop=true;
  const lp=lowpass(700),a=gain(.045);
  src.connect(lp);lp.connect(a);a.connect(master);
  src.start();windNode={src,lp,a};
 }
 function music(){
  if(!ctx||musicNodes.length)return;
  const freq=[55,82.41,110,146.83];
  for(let i=0;i<freq.length;i++){
   const osc=ctx.createOscillator(),low=lowpass(280),amp=gain(.007);
   osc.type=i===0?'sine':'triangle';osc.frequency.value=freq[i];
   osc.connect(low);low.connect(amp);amp.connect(master);osc.start();
   musicNodes.push({osc,amp,index:i});
  }
 }
 function tick(t,moving){
  if(!ctx||ctx.state!=='running'||muted)return;
  if(windNode)windNode.lp.frequency.value=550+Math.sin(t*.14)*110;
  for(const x of musicNodes)x.amp.gain.value=.006+Math.sin(t*.14+x.index*1.75)*.002;
  if(moving&&t-wingAt>.53){wingAt=t;wing();}
  if(t-crowAt>9.7){crowAt=t+Math.random()*3.2;crow();}
  if(t-stepAt>2.8){stepAt=t;stalker();}
  lastTick=t;
 }
 function setMuted(value){
  muted=Boolean(value);if(master&&ctx)master.gain.setTargetAtTime(muted?0:.24,ctx.currentTime,.06);
 }
 return {unlock,wing,crow,stalker,tick,setMuted,get muted(){return muted;},get started(){return started;}};
}

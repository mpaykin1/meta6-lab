// Soft distant level-crossing bell and hanging chain sounds, original Web Audio synthesis.
export function createCrossingSounds(){
 let ctx=null,master=null,nextBell=0,nextChain=3,unlocked=false;
 function unlock(){
  if(!ctx){
   const C=window.AudioContext||window.webkitAudioContext;
   if(!C)return;
   ctx=new C({latencyHint:'interactive'});
   master=ctx.createGain();master.gain.value=.21;
   master.connect(ctx.destination);
  }
  ctx.resume().then(()=>unlocked=ctx.state==='running').catch(()=>{});
 }
 for(const type of ['pointerup','touchend','keydown','click'])
  window.addEventListener(type,unlock,{passive:true});
 function tone(f,t,d,vol,pan=0){
  const os=ctx.createOscillator(),env=ctx.createGain(),p=ctx.createStereoPanner?.();
  os.type='sine';os.frequency.setValueAtTime(f,t);
  os.frequency.exponentialRampToValueAtTime(f*.97,t+d);
  env.gain.setValueAtTime(.00001,t);
  env.gain.exponentialRampToValueAtTime(Math.max(.0001,vol),t+.024);
  env.gain.exponentialRampToValueAtTime(.00001,t+d);
  os.connect(env);
  if(p){p.pan.value=pan;env.connect(p);p.connect(master);}else env.connect(master);
  os.start(t);os.stop(t+d+.03);
 }
 function bell(t,near){
  tone(274,t,.7,.08*near,-.55);
  tone(411,t+.012,.48,.022*near,-.55);
  tone(244,t+.46,.72,.065*near,-.55);
  tone(367,t+.48,.42,.016*near,-.55);
 }
 function chain(t,phase){
  const f=280+phase*93;
  tone(f,t,.15,.012,-.65);
  tone(f*1.49,t+.028,.1,.006,-.65);
 }
 function update({time,approach=0,enabled=true,state='play'}){
  if(!unlocked||!enabled||state==='caught'||state==='dawn')return;
  const t=ctx.currentTime;
  if(approach>.12&&time>=nextBell){
   bell(t,.2+Math.min(1,approach)*.8);
   nextBell=time+Math.max(.55,1.48-approach*.66);
  }
  if(time>=nextChain){
   chain(t,Math.sin(time*1.17)*.5+.5);
   nextChain=time+6.6+Math.abs(Math.sin(time*13.7))*4.8;
  }
 }
 return {update,unlock};
}

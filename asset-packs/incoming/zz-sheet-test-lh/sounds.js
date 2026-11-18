// Original Web Audio ambience for THE LAST HEALER. No external audio, samples or downloads.
// Sound is unlocked only through a user's direct interaction; one source plays at a time.
export function createHealerAudio(){
 let ctx=null,master=null,nodes=[],active='';
 function retain(node){nodes.push(node);return node}
 function ensure(){
  ctx ||= new (window.AudioContext||window.webkitAudioContext)();
  if(!master){master=ctx.createGain();master.gain.value=.25;master.connect(ctx.destination);}
  ctx.resume();return ctx;
 }
 function tone(freq,type,gain){
  const o=retain(ctx.createOscillator()),v=retain(ctx.createGain());
  o.type=type;o.frequency.value=freq;v.gain.value=gain;
  o.connect(v);v.connect(master);o.start();return {o,v};
 }
 function noise(cutoff,amount){
  // A deterministic loopable 2-second analog texture, without external assets.
  const n=ctx.sampleRate*2,buf=ctx.createBuffer(1,n,ctx.sampleRate);
  const a=buf.getChannelData(0);let seed=923421;
  for(let i=0;i<n;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;a[i]=((seed>>>0)/2147483648-1)*.72;}
  const src=retain(ctx.createBufferSource()),filter=retain(ctx.createBiquadFilter()),v=retain(ctx.createGain());
  src.buffer=buf;src.loop=true;filter.type='lowpass';filter.frequency.value=cutoff;v.gain.value=amount;
  src.connect(filter);filter.connect(v);v.connect(master);src.start();return {src,filter,v};
 }
 function pulse(param,from,to,at,duration){
  param.setValueAtTime(from,at);
  param.linearRampToValueAtTime(to,at+duration*.33);
  param.exponentialRampToValueAtTime(Math.max(.0001,from),at+duration);
 }
 function stop(){
  if(!ctx||!nodes.length){active='';return;}
  for(const n of nodes){try{if(typeof n.stop==='function')n.stop()}catch(e){}try{n.disconnect()}catch(e){}}
  nodes=[];active='';
 }
 function engine(){
  const a=tone(52,'triangle',.17),b=tone(104,'sine',.035);
  const wheel=noise(540,.052);
  const lfo=retain(ctx.createOscillator()),depth=retain(ctx.createGain());
  lfo.frequency.value=2.6;depth.gain.value=3.2;lfo.connect(depth);depth.connect(a.o.frequency);lfo.start();
  for(let i=0;i<16;i++){const t=ctx.currentTime+i*.27;a.v.gain.setValueAtTime(.115,t);a.v.gain.linearRampToValueAtTime(.19,t+.10);}
  wheel.filter.frequency.value=380;
 }
 function rain(){
  noise(1650,.12);const thin=noise(3800,.020);
  thin.filter.type='highpass';
  // Drops ping asynchronously at low volume; soft frequencies stay behind the rain bed.
  for(let i=0;i<18;i++){
   const t=ctx.currentTime+.12+i*.32+(i%3)*.09;
   const osc=retain(ctx.createOscillator()),gain=retain(ctx.createGain());
   osc.type='sine';osc.frequency.value=270+(i%5)*58;
   gain.gain.setValueAtTime(.0001,t);gain.gain.linearRampToValueAtTime(.017,t+.012);
   gain.gain.exponentialRampToValueAtTime(.0001,t+.13);
   osc.connect(gain);gain.connect(master);osc.start(t);osc.stop(t+.15);
  }
 }
 function rowing(){
  noise(480,.07);
  for(let i=0;i<9;i++){
   const at=ctx.currentTime+.09+i*.88;
   const creak=retain(ctx.createOscillator()),gain=retain(ctx.createGain());
   creak.type='triangle';creak.frequency.setValueAtTime(150,at);
   creak.frequency.exponentialRampToValueAtTime(112,at+.32);
   pulse(gain.gain,.0001,.07,at,.5);
   creak.connect(gain);gain.connect(master);creak.start(at);creak.stop(at+.55);
   const splash=retain(ctx.createBufferSource()),f=retain(ctx.createBiquadFilter()),g=retain(ctx.createGain());
   const buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.29),ctx.sampleRate);
   const samples=buffer.getChannelData(0);let n=4001+i*179;
   for(let j=0;j<samples.length;j++){n=(Math.imul(n,1103515245)+12345)|0;samples[j]=((n>>>0)/2147483648-1)*Math.pow(1-j/samples.length,2);}
   splash.buffer=buffer;f.type='lowpass';f.frequency.value=760;
   g.gain.value=.18;splash.connect(f);f.connect(g);g.connect(master);splash.start(at+.38);
  }
 }
 async function play(name){
  if(name===active){stop();return false;}
  stop();ensure();active=name;
  if(name==='sndCarEngine')engine();
  else if(name==='sndRainNight')rain();
  else if(name==='sndRowingShore')rowing();
  else{active='';return false;}
  return true;
 }
 return {play,stop,get active(){return active}};
}

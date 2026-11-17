// Low, quiet crossing bell and distant, stereo chain-rattle.
// No prerecorded content, no network. Audio starts ONLY after a user gesture.
export function createCrossingAudio(host){
 let ctx=null,master=null,enabled=true;
 function unlock(){
   try{host.navigator.audioSession.type='playback';}catch(e){}
   if(!ctx){const A=host.AudioContext||host.webkitAudioContext;if(!A)return;
      ctx=new A();master=ctx.createGain();master.gain.value=.16;
      const limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-18;limiter.ratio.value=6;
      master.connect(limiter);limiter.connect(ctx.destination);}
   if(ctx.state!=='running')ctx.resume().catch(()=>{});
 }
 for(const ev of ['pointerdown','touchend','keydown','click'])host.addEventListener(ev,unlock,{capture:true,passive:true});
 function note(frequency,when,duration,vol,pan){
  if(!ctx||ctx.state!=='running'||!enabled)return;
  const osc=ctx.createOscillator(),gain=ctx.createGain(),filter=ctx.createBiquadFilter(),p=ctx.createStereoPanner?ctx.createStereoPanner():ctx.createGain();
  osc.type='sine';osc.frequency.setValueAtTime(frequency,when);osc.frequency.exponentialRampToValueAtTime(frequency*.96,when+duration);
  gain.gain.setValueAtTime(.0001,when);
  gain.gain.exponentialRampToValueAtTime(Math.max(.0002,vol),when+.025);
  gain.gain.exponentialRampToValueAtTime(.0001,when+duration);
  filter.type='lowpass';filter.frequency.value=1250;if(p.pan)p.pan.value=pan;
  osc.connect(filter);filter.connect(gain);gain.connect(p);p.connect(master);osc.start(when);osc.stop(when+duration+.05);
 }
 function bell(strength=1){
  if(!ctx||ctx.state!=='running')return;
  const t=ctx.currentTime,pan=.6,vol=.13+.17*strength;
  note(196,t,1.2,vol,pan);note(294,t,1,.055*strength+.03,pan);
  note(164.81,t+.48,1.25,vol*.84,pan);note(247.22,t+.48,.9,vol*.21,pan);
 }
 function chain(amount=.2){
  if(!ctx||ctx.state!=='running')return;
  const t=ctx.currentTime;
  for(let i=0;i<4;i++){const f=180+i*72+Math.random()*25;note(f,t+i*.07,.25+.05*i,amount*(.08-i*.012),-.7);}
 }
 return {unlock,bell,chain,setEnabled:v=>{enabled=!!v;}};
}
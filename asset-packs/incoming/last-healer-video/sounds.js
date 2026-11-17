// Three original soundscapes for The Last Healer. No downloads, external assets or timers.
// Audio starts only after an explicit user gesture (scene menu / audio toggle).
export function createSoundscapes() {
 let ctx=null,master=null,actives=[],desired='silent',running=false,carPitch=null,carSpeed=0;
 const scenes={engine:null,rain:null,rowing:null};
 const tracks=[];
 const gainNode=()=>ctx.createGain();
 const bus=(id)=>{
  const g=gainNode();g.gain.value=0;g.connect(master);scenes[id]=g;
  return g;
 };
 const noise=(duration=3,seed=37)=>{
  const rate=ctx.sampleRate,buf=ctx.createBuffer(1,Math.round(duration*rate),rate);
  const data=buf.getChannelData(0);let state=seed|0;
  for(let i=0;i<data.length;i++){state=(Math.imul(1664525,state)+1013904223)|0;
   data[i]=(((state>>>0)/4294967296)*2-1)*(.65+.35*Math.sin(i*.00013));}
  return buf;
 };
 function oscillator(type,freq,to,gain=.3){
  const o=ctx.createOscillator(),g=gainNode();o.type=type;o.frequency.value=freq;
  g.gain.value=gain;o.connect(g).connect(to);o.start();tracks.push(o);return {o,g};
 }
 function filteredNoise(buffer,to,frequency,Q=1,amount=.25,type='lowpass'){
  const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),vol=gainNode();
  src.buffer=buffer;src.loop=true;filter.type=type;filter.frequency.value=frequency;filter.Q.value=Q;vol.gain.value=amount;
  src.connect(filter).connect(vol).connect(to);src.start();tracks.push(src);return {src,filter,vol};
 }
 function assemble() {
  if(ctx)return;
  const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)return;
  ctx=new AudioContext({latencyHint:'interactive'});master=gainNode();master.gain.value=.21;master.connect(ctx.destination);
  const n=noise(3);
  const engine=bus('engine'),rain=bus('rain'),rowing=bus('rowing');
  const pulse=oscillator('sawtooth',57,engine,.12),harmonic=oscillator('triangle',114,engine,.16);
  carPitch=[pulse.o,harmonic.o];
  filteredNoise(n,engine,350,.7,.082);
  const road=filteredNoise(n,engine,900,1.3,.04,'bandpass');road.filter.frequency.value=710;
  // Layered rain: distant wash, close roof drips, puddle transients.
  filteredNoise(n,rain,2100,.7,.24,'lowpass');
  filteredNoise(n,rain,950,1.2,.13,'bandpass');
  filteredNoise(n,rain,4600,.6,.055,'highpass');
  // Boat: water body, the soft rub of wood against timber and subdued surf.
  filteredNoise(n,rowing,480,1,.10);
  filteredNoise(n,rowing,1800,1.5,.053,'bandpass');
  oscillator('sine',108,rowing,.026);
  oscillator('triangle',72,rowing,.018);
 }
 function transition(next) {
  if(!ctx)return;
  const now=ctx.currentTime,chosen=next==='engine'||next==='rain'||next==='rowing'?next:'silent';
  for(const [id,node] of Object.entries(scenes)){
   node.gain.cancelScheduledValues(now);
   node.gain.setTargetAtTime(id===chosen?.86:0,now,.17);
  }
 }
 function start(next='silent') {
  desired=next;assemble();if(!ctx)return;
  ctx.resume().then(()=>{transition(desired);running=true;}).catch(()=>{});
 }
 function tick(t,mode=desired) {
  if(!ctx||!running)return;
  const now=ctx.currentTime;
  if(carPitch){
   carSpeed=.10+.14*(1+Math.sin(t*.28));
   carPitch[0].frequency.setTargetAtTime(55+carSpeed*45,now,.10);
   carPitch[1].frequency.setTargetAtTime(110+carSpeed*85,now,.10);
  }
  const b=scenes.rowing;
  if(b&&mode==='rowing'){
   const swell=.74+.12*Math.sin(t*1.61);
   b.gain.setTargetAtTime(swell,now,.07);
  }
 }
 function click(){
  if(!ctx)return;
  const o=ctx.createOscillator(),g=gainNode();
  o.type='sine';o.frequency.setValueAtTime(480,ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(260,ctx.currentTime+.035);
  g.gain.setValueAtTime(.012,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.06);
  o.connect(g).connect(master);o.start();o.stop(ctx.currentTime+.07);
 }
 return {start,tick,click,get active(){return running;},get context(){return ctx;}};
}

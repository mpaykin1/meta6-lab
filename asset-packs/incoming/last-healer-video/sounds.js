// The Last Healer — original layered Web Audio synthesis (no network or audio files).
// Playback starts only after a player gesture, on both mobile and desktop.
const A={motor:'sndCarEngine',rain:'sndRainNight',shore:'sndRowingShore'};
export function makeSoundscape(){
  let ctx=null,master=null,active=null,voices=[],timerNodes=[];
  function init(){
    if(ctx)return ctx;
    const AudioCtor=globalThis.AudioContext||globalThis.webkitAudioContext;
    if(!AudioCtor)return null;
    ctx=new AudioCtor({latencyHint:'interactive'});
    master=ctx.createGain();master.gain.value=.24;master.connect(ctx.destination);
    return ctx;
  }
  function randomBuffer(seconds=3){
    const sampleRate=ctx.sampleRate,n=Math.max(1,Math.floor(sampleRate*seconds));
    const buffer=ctx.createBuffer(1,n,sampleRate),data=buffer.getChannelData(0);
    let s=0x39da15,prev=0;
    for(let i=0;i<n;i++){
      s=(Math.imul(s,1664525)+1013904223)>>>0;
      const v=((s/4294967296)*2-1);
      prev=.988*prev+.012*v;
      data[i]=Math.max(-1,Math.min(1,.52*v+.43*prev));
    }
    return buffer;
  }
  function voice(type,frequency,level,destination=master){
    const oscillator=ctx.createOscillator(),gain=ctx.createGain();
    oscillator.type=type;oscillator.frequency.value=frequency;
    gain.gain.value=level;oscillator.connect(gain);gain.connect(destination);
    oscillator.start();voices.push(oscillator,gain);
    return {oscillator,gain};
  }
  function noise(level,low=0,high=0,destination=master){
    const src=ctx.createBufferSource();src.buffer=randomBuffer(2.4);
    src.loop=true;let node=src;
    if(low){const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=low;node.connect(lp);node=lp;voices.push(lp);}
    if(high){const hp=ctx.createBiquadFilter();hp.type='highpass';hp.frequency.value=high;node.connect(hp);node=hp;voices.push(hp);}
    const gain=ctx.createGain();gain.gain.value=level;node.connect(gain);gain.connect(destination);
    src.start();voices.push(src,gain);return {src,gain};
  }
  function pairEnvelope(target,rate=.25,depth=.30){
    const osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.type='sine';osc.frequency.value=rate;gain.gain.value=depth;
    osc.connect(gain);gain.connect(target);
    osc.start();voices.push(osc,gain);
  }
  function connectScene(preset){
    const bus=ctx.createGain();bus.gain.value=0;bus.connect(master);
    voices.push(bus);
    bus.gain.setTargetAtTime(1,ctx.currentTime,.24);
    if(preset===A.motor){
      const lowpass=ctx.createBiquadFilter();lowpass.type='lowpass';lowpass.frequency.value=180;lowpass.Q.value=.75;
      lowpass.connect(bus);voices.push(lowpass);
      const motor=voice('sawtooth',47,.20,lowpass);
      voice('sine',96,.032,lowpass);
      const tread=noise(.14,680,80,bus);
      pairEnvelope(motor.oscillator.frequency,1.7,3.0);
      pairEnvelope(tread.gain.gain,.32,.013);
    }else if(preset===A.rain){
      const hiss=noise(.14,1900,480,bus);
      noise(.11,490,70,bus);
      pairEnvelope(hiss.gain.gain,.12,.014);
      const patter=voice('triangle',190,.0,bus);
      for(let i=0;i<20;i++){
        const t=ctx.currentTime+i*.135;
        const a=.004+(i%6)*.001;
        patter.gain.gain.setValueAtTime(.0001,t);
        patter.gain.gain.linearRampToValueAtTime(a,t+.014);
        patter.gain.gain.exponentialRampToValueAtTime(.0001,t+.088);
      }
    }else if(preset===A.shore){
      const surf=noise(.12,820,42,bus);
      const lfo=ctx.createOscillator(),lg=ctx.createGain();
      lfo.type='sine';lfo.frequency.value=.23;lg.gain.value=.034;
      lfo.connect(lg);lg.connect(surf.gain.gain);lfo.start();voices.push(lfo,lg);
      const oar=voice('triangle',116,.014,bus);
      pairEnvelope(oar.oscillator.frequency,.46,9);
      const tim=ctx.createBiquadFilter();tim.type='lowpass';tim.frequency.value=330;
      const creak=voice('sawtooth',142,.009,tim);
      tim.connect(bus);voices.push(tim);
      pairEnvelope(creak.gain.gain,.46,.006);
      // A very quiet tonal overtone; no borrowed melody.
      voice('sine',196,.007,bus);
      voice('sine',294,.0035,bus);
    }
  }
  function stop(){
    active=null;
    const t=ctx?.currentTime||0;
    for(const node of voices){
      if(typeof node.stop==='function'){
        try{node.stop(t+.016);}catch(_){}
      }
      try{node.disconnect();}catch(_){}
    }
    voices=[];
  }
  async function play(preset){
    if(![A.motor,A.rain,A.shore].includes(preset))return false;
    const context=init();
    if(!context)return false;
    await context.resume();
    stop();
    connectScene(preset);
    active=preset;
    return true;
  }
  async function toggle(preset=A.shore){
    if(active){stop();return false}
    return play(preset);
  }
  return {play,stop,toggle,get active(){return active},get supported(){return !!(globalThis.AudioContext||globalThis.webkitAudioContext)}};
}

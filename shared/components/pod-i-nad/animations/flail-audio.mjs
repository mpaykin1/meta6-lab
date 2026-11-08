// Reusable, gesture-unlocked combat audio. Pre-rendered PCM WAV assets work in Safari/iOS.
const SOUND_FILES=Object.freeze({
  whoosh:['whoosh.wav'], impact:['impact-a.wav','impact-b.wav'], defeat:['defeat.wav']
});
const COOLDOWNS={whoosh:0.42,impact:0.16,defeat:0.5};
const VOLUME={whoosh:0.19,impact:0.34,defeat:0.34};
export function createCombatAudio({baseUrl=new URL('../audio/',import.meta.url),volume=0.75}={}){
  let context=null,master=null,muted=false,loading=null,disposed=false;
  let hitVariant=0;
  const decoded=new Map(), lastPlayed=new Map();
  function unlock(){
    if(disposed)return Promise.resolve(false);
    const AudioCtor=globalThis.AudioContext||globalThis.webkitAudioContext;
    if(!AudioCtor)return Promise.resolve(false);
    if(!context){
      try{
        if(globalThis.navigator?.audioSession)navigator.audioSession.type='playback';
      }catch{}
      context=new AudioCtor();
      const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=6200;
      const limiter=context.createDynamicsCompressor();
      limiter.threshold.value=-21;limiter.knee.value=24;limiter.ratio.value=5;limiter.attack.value=0.008;limiter.release.value=0.18;
      master=context.createGain();master.gain.value=volume;
      filter.connect(limiter);limiter.connect(master);master.connect(context.destination);
      master.input=filter;
    }
    const resume=context.resume().catch(()=>{});
    if(!loading){
      loading=Promise.all(Object.values(SOUND_FILES).flat().map(async name=>{
        try{
          const response=await fetch(new URL(name,baseUrl));
          if(!response.ok)throw Error('Audio '+response.status);
          const data=await response.arrayBuffer();
          const buffer=await context.decodeAudioData(data);
          decoded.set(name,buffer);
        }catch{/* Offline or unsupported codec: gameplay stays playable. */}
      }));
    }
    return Promise.all([resume,loading]).then(()=>decoded.size>0);
  }
  function play(kind){
    if(disposed||muted||!context||context.state!=='running'||!master)return false;
    let names=SOUND_FILES[kind];if(!names)return false;
    const now=context.currentTime,previous=lastPlayed.get(kind)??-Infinity;
    if(now-previous<COOLDOWNS[kind])return false;
    if(kind==='impact')hitVariant++;
    const name=names[kind==='impact'?hitVariant%names.length:0];
    const buffer=decoded.get(name);if(!buffer)return false;
    const src=context.createBufferSource(),gain=context.createGain();
    const drift=(Math.random()*2-1),amp=1+drift*.08;
    src.buffer=buffer;src.playbackRate.value=1+drift*.06;
    gain.gain.value=(VOLUME[kind]??.2)*amp;
    src.connect(gain);gain.connect(master.input);
    src.onended=()=>{src.disconnect();gain.disconnect()};
    lastPlayed.set(kind,now);
    src.start();
    return true;
  }
  function setMuted(value){muted=Boolean(value);if(master&&context)master.gain.setTargetAtTime(muted?0:volume,context.currentTime,.04)}
  function dispose(){disposed=true;decoded.clear();if(context){context.close().catch(()=>{});context=null}}
  return {unlock,play,setMuted,dispose,get muted(){return muted},get ready(){return decoded.size>0}};
}

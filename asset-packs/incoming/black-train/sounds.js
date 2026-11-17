// Procedural railway sounds. Web Audio starts only after a user gesture (iPhone compatible).
let ac=null,lastBell=-1,lastChain=-1;
function unlock(){
 try{navigator.audioSession.type='playback';}catch(e){}
 const AC=window.AudioContext||window.webkitAudioContext;
 if(!AC)return;
 if(!ac)ac=new AC();
 if(ac.state!=='running')ac.resume().catch(()=>{});
}
for(const type of ['pointerup','touchend','keydown'])addEventListener(type,unlock,{passive:true});
function sound(freq,volume,duration,pan,type='sine'){
 if(!ac||ac.state!=='running')return;
 const now=ac.currentTime,osc=ac.createOscillator(),gain=ac.createGain();
 const filter=ac.createBiquadFilter();filter.type='lowpass';filter.frequency.value=1200;
 const stereo=ac.createStereoPanner?ac.createStereoPanner():ac.createGain();
 if(stereo.pan)stereo.pan.value=pan;
 osc.type=type;osc.frequency.setValueAtTime(freq,now);osc.frequency.exponentialRampToValueAtTime(freq*.995,now+duration);
 gain.gain.setValueAtTime(.0001,now);
 gain.gain.exponentialRampToValueAtTime(volume,now+.06);
 gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
 osc.connect(filter);filter.connect(gain);gain.connect(stereo);stereo.connect(ac.destination);
 osc.start(now);osc.stop(now+duration+.03);
}
export function crossingBell(t,near){
 if(near<.06||t-lastBell<Math.max(.47,1.7-near*.95))return;
 lastBell=t;
 // Low consonant distant dyad, softer than the game's wheel rumble.
 sound(174.61,.014+near*.042,1.16,-.45);
 sound(261.63,.006+near*.016,1.35,-.45);
}
export function chainsClank(t){
 if(t-lastChain<7.3)return;lastChain=t;
 sound(198,.008,.27,.55,'triangle');
 sound(296.66,.003,.23,.55,'triangle');
}
export function muteRailSounds(){if(ac&&ac.state==='running')ac.suspend().catch(()=>{});}

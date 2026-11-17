// BLACK TRAIN ambient sound objects. Web Audio unlocks on the first real tap (iOS).
export function createCrossingSounds(){
  let ctx=null,master=null,nextBell=0,nextClink=0,enabled=false;
  function unlock(){
    if(!ctx){
      const AudioContext=window.AudioContext||window.webkitAudioContext;
      if(!AudioContext)return false;
      ctx=new AudioContext();master=ctx.createGain();master.gain.value=.14;master.connect(ctx.destination);
    }
    ctx.resume();enabled=true;return true;
  }
  function hit(freq,duration,level,pan=0){
    if(!ctx||ctx.state!=='running'||!enabled)return;
    const at=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain(),p=ctx.createStereoPanner?ctx.createStereoPanner():null;
    o.type='sine';o.frequency.setValueAtTime(freq,at);
    o.frequency.exponentialRampToValueAtTime(Math.max(50,freq*.98),at+duration);
    g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(Math.max(.0002,level),at+.017);
    g.gain.exponentialRampToValueAtTime(.0001,at+duration);
    o.connect(g);if(p){p.pan.value=pan;g.connect(p);p.connect(master)}else g.connect(master);
    o.start(at);o.stop(at+duration+.01);
  }
  function update(t,approach=0,playing=true){
    if(!playing||!ctx||ctx.state!=='running')return;
    if(approach>.08&&t>=nextBell){
      hit(196,.75,.045+approach*.13,.55);
      hit(246.94,.62,.022+approach*.06,.55);
      nextBell=t+1.25-.68*approach;
    }
    if(t>=nextClink){
      const scale=.5+.5*Math.sin(t*5.321);
      hit(263+scale*22,.25,.013,-.65);
      hit(395+scale*32,.18,.005,-.65);
      nextClink=t+7.2+scale*6.4;
    }
  }
  return {unlock,update,setEnabled:v=>{enabled=!!v},get enabled(){return enabled}};
}

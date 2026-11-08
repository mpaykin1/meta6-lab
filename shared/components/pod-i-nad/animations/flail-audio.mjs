// Optional, gesture-unlocked low-volume Web Audio feedback for reusable flail combat.
// Host may replace these short synthesized effects with licensed audio files later.
export function createFlailAudio({volume=0.22}={}) {
  let context=null, master=null, filter=null, compressor=null, muted=false;
  const last={whoosh:-1e4,impact:-1e4,defeat:-1e4};
  const cool={whoosh:.38,impact:.3,defeat:.8};
  const AC=()=>globalThis.AudioContext||globalThis.webkitAudioContext;
  async function unlock() {
    if (!AC()) return false;
    if (!context) {
      context=new (AC())({latencyHint:'interactive'});
      compressor=context.createDynamicsCompressor();
      compressor.threshold.value=-21;
      compressor.ratio.value=4;
      filter=context.createBiquadFilter();
      filter.type='lowpass';
      filter.frequency.value=3900;
      master=context.createGain();
      master.gain.value=muted?0:Math.max(0,Math.min(1,volume));
      filter.connect(compressor);
      compressor.connect(master);
      master.connect(context.destination);
    }
    try { await context.resume(); } catch { return false; }
    return context.state==='running';
  }
  function tone(startHz,endHz,duration,level,wave='triangle',at=0) {
    if (!context || context.state!=='running') return;
    const start=context.currentTime+at;
    const oscillator=context.createOscillator();
    const envelope=context.createGain();
    oscillator.type=wave;
    oscillator.frequency.setValueAtTime(startHz,start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(30,endHz),start+duration);
    envelope.gain.setValueAtTime(.0001,start);
    envelope.gain.exponentialRampToValueAtTime(Math.max(.0002,level),start+.013);
    envelope.gain.exponentialRampToValueAtTime(.0001,start+duration);
    oscillator.connect(envelope);
    envelope.connect(filter);
    oscillator.start(start);
    oscillator.stop(start+duration+.025);
    oscillator.addEventListener('ended',()=>{oscillator.disconnect();envelope.disconnect()},{once:true});
  }
  function play(kind) {
    if (!context || context.state!=='running' || muted || !Object.hasOwn(cool,kind)) return false;
    const now=context.currentTime;
    if (now-last[kind]<cool[kind]) return false;
    last[kind]=now;
    const v=.94+Math.random()*.12;
    if (kind==='whoosh') {
      tone(110*v,195*v,.17,.08,'triangle');
      tone(260*v,95*v,.15,.025,'sine',.017);
    } else if (kind==='impact') {
      tone(185*v,58*v,.28,.23,'triangle');
      tone(570*v,165*v,.13,.035,'sine',.015);
    } else {
      tone(265*v,128*v,.5,.15,'sine');
      tone(395*v,205*v,.65,.09,'triangle',.07);
    }
    return true;
  }
  function setMuted(value) { muted=Boolean(value);if(master)master.gain.value=muted?0:Math.max(0,Math.min(1,volume)); }
  async function dispose() { if(context){const current=context;context=null;master=null;filter=null;compressor=null;await current.close().catch(()=>{});} }
  return {unlock,whoosh:()=>play('whoosh'),impact:()=>play('impact'),defeat:()=>play('defeat'),setMuted,dispose};
}

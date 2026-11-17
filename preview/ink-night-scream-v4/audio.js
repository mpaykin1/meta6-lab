// Procedural horror sound: no files, everything is synthesised.
// iPhone rule (ZVUK п.15): unlock on click/touchend/pointerup/keydown every time,
// audioSession='playback', silent looping <audio> so the mute switch does not kill Web Audio.
export function createHorrorAudio(){
  let ctx=null,master=null,noiseBuf=null,enabled=true,suspended=false;
  const L={};                      // long-lived layers
  const el=document.createElement('audio');
  {
    const n=4000,b=new ArrayBuffer(44+n),v=new DataView(b),w=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));};
    w(0,'RIFF');v.setUint32(4,36+n,true);w(8,'WAVEfmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);
    v.setUint32(24,8000,true);v.setUint32(28,8000,true);v.setUint16(32,1,true);v.setUint16(34,8,true);w(36,'data');v.setUint32(40,n,true);
    for(let i=0;i<n;i++)v.setUint8(44+i,128);
    el.src=URL.createObjectURL(new Blob([b],{type:'audio/wav'}));el.loop=true;el.setAttribute('playsinline','');el.preload='auto';
  }
  const now=()=>ctx.currentTime;
  function noise(){const s=ctx.createBufferSource();s.buffer=noiseBuf;s.loop=true;s.loopStart=Math.random()*1.5;return s;}
  function build(){
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    ctx=new AC();
    master=ctx.createGain();master.gain.value=enabled?.9:0;
    const comp=ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=5;comp.attack.value=.004;comp.release.value=.22;
    master.connect(comp);comp.connect(ctx.destination);
    noiseBuf=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);
    const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    const chain=(src,...nodes)=>{let a=src;for(const n of nodes){a.connect(n);a=n;}a.connect(master);return nodes;};
    const G=(v=0)=>{const g=ctx.createGain();g.gain.value=v;return g;};
    const F=(type,f,q=.7)=>{const b=ctx.createBiquadFilter();b.type=type;b.frequency.value=f;b.Q.value=q;return b;};
    const P=()=>ctx.createStereoPanner?ctx.createStereoPanner():G(1);
    // night wind
    const wn=noise();L.windF=F('bandpass',380,.5);L.wind=G(.05);chain(wn,L.windF,L.wind);wn.start();
    // deep consonant drone (a fifth): the "safe" bed, kept louder than any dissonance
    L.drone=G(.07);const dl=F('lowpass',260);dl.connect(L.drone);L.drone.connect(master);
    for(const f of [55,82.5,110.3]){const o=ctx.createOscillator();o.type='sine';o.frequency.value=f;const g=G(f>100?.25:.6);o.connect(g);g.connect(dl);o.start();}
    // dissonant shimmer that rises with fear (half the level of the bed)
    L.dis=G(0);const ds=F('lowpass',700);ds.connect(L.dis);L.dis.connect(master);
    for(const f of [116.5,123.5,174.6]){const o=ctx.createOscillator();o.type='triangle';o.frequency.value=f;o.connect(ds);o.start();L['dis'+f]=o;}
    // the thing breathing somewhere around you
    const bn=noise();L.breathF=F('bandpass',620,1.6);L.breath=G(0);L.breathMuf=F('lowpass',5000);L.breathPan=P();
    chain(bn,L.breathF,L.breath,L.breathMuf,L.breathPan);bn.start();
    // train: rumble + rush, one panner
    L.trainPan=P();L.trainPan.connect(master);
    const rn=noise();L.rumbleF=F('lowpass',150);L.rumble=G(0);rn.connect(L.rumbleF);L.rumbleF.connect(L.rumble);L.rumble.connect(L.trainPan);rn.start();
    const hn=noise();L.rushF=F('bandpass',900,.6);L.rush=G(0);hn.connect(L.rushF);L.rushF.connect(L.rush);L.rush.connect(L.trainPan);hn.start();
    L.hum=G(0);const ho=ctx.createOscillator();ho.type='sawtooth';ho.frequency.value=48;const hf=F('lowpass',190);ho.connect(hf);hf.connect(L.hum);L.hum.connect(L.trainPan);ho.start();
  }
  function unlock(){
    try{navigator.audioSession.type='playback';}catch(e){}
    if(!ctx)build();
    if(!ctx)return;
    if(ctx.state!=='running'&&!suspended)ctx.resume();
    try{const s=ctx.createBufferSource();s.buffer=ctx.createBuffer(1,1,22050);s.connect(ctx.destination);s.start(0);}catch(e){}
    if(enabled&&!suspended&&el.paused)el.play().catch(()=>{});
  }
  for(const ev of ['click','touchend','pointerup','keydown'])addEventListener(ev,unlock,{capture:true,passive:true});
  const ok=()=>ctx&&ctx.state==='running';
  const set=(p,v,tc=.08)=>p.setTargetAtTime(v,now(),tc);
  // ---- one-shots ----
  function env(g,t,a,peak,d){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+a+d);}
  function thump(pan=0,vol=.5,f0=72,f1=38,len=.22,when=0){
    if(!ok())return;const t=now()+when,o=ctx.createOscillator(),g=ctx.createGain(),p=ctx.createStereoPanner?ctx.createStereoPanner():ctx.createGain();
    o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+len);env(g,t,.006,vol,len);
    if(p.pan)p.pan.value=pan;o.connect(g);g.connect(p);p.connect(master);o.start(t);o.stop(t+len+.05);
  }
  function burst(pan,vol,f0,f1,q,len,type='bandpass',when=0,att=.004){
    if(!ok())return;const t=now()+when,s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain(),p=ctx.createStereoPanner?ctx.createStereoPanner():ctx.createGain();
    s.buffer=noiseBuf;s.loop=true;s.loopStart=Math.random();f.type=type;f.Q.value=q;
    f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(f1,t+len);env(g,t,att,vol,len);
    if(p.pan)p.pan.value=pan;s.connect(f);f.connect(g);g.connect(p);p.connect(master);s.start(t);s.stop(t+len+att+.05);
  }
  let beatAt=0,clackAt=0,creakAt=3;
  const api={
    unlock,ok,
    get mediaPlaying(){return !el.paused;},
    get enabled(){return enabled;},
    setEnabled(v){enabled=v;if(master)set(master.gain,v?.9:0,.03);if(!v)el.pause();else unlock();},
    suspend(v){suspended=v;if(!ctx)return;if(v){ctx.suspend();el.pause();}else unlock();},
    // called every frame with the state of the world
    update(s){
      if(!ok())return;
      const t=now();
      set(L.wind.gain,.04+.03*Math.sin(s.t*.31)+.02*Math.sin(s.t*.77),.3);
      set(L.windF.frequency,330+140*Math.sin(s.t*.19),.4);
      set(L.drone.gain,.07*(1-.5*s.train),.4);
      set(L.dis.gain,.034*s.fear,.5);
      L['dis116.5'].frequency.setTargetAtTime(116.5+3*Math.sin(s.t*.9),t,.2);
      // breathing: slow wet inhale/exhale, closer = louder and faster
      const rate=.38+.5*s.prox,ph=(s.t*rate)%1,shape=ph<.45?Math.sin(ph/.45*Math.PI):.55*Math.sin((ph-.45)/.55*Math.PI);
      set(L.breath.gain,s.monster?(.012+.2*s.prox*s.prox)*shape*(1-.75*s.train):0,.05);
      set(L.breathF.frequency,ph<.45?760:520,.08);
      set(L.breathMuf.frequency,s.behind?1100:5200,.15);
      if(L.breathPan.pan)set(L.breathPan.pan,s.pan,.08);
      // heart
      if(s.fear>.12&&t>beatAt){
        const gap=1.05-.62*s.fear,v=.16+.34*s.fear;
        thump(0,v,64,40,.16);thump(0,v*.7,58,36,.14,.17);beatAt=t+gap;
      }
      // train
      const k=s.train;
      set(L.rumble.gain,.75*k*k,.12);set(L.rumbleF.frequency,90+260*k,.12);
      set(L.rush.gain,.3*k*k*k,.1);set(L.rushF.frequency,500+900*k,.1);
      set(L.hum.gain,.1*Math.sqrt(k),.2);
      if(L.trainPan.pan)set(L.trainPan.pan,s.trainPan,.1);
      // wheels on rail joints: "та-так … та-так", heard from far away, growing as it comes.
      // Far = quiet and muffled (only the low knock), near = loud and bright.
      const dd=s.trainDist??9999;
      if(dd<760&&t>clackAt-.05){
        const close=Math.max(0,1-dd/700),fadeIn=Math.min(1,(760-dd)/80);
        const v=(.05+.34*close*close*close)*fadeIn,cut=260+2600*close*close,p=s.trainPan,when=Math.max(0,clackAt-t);
        [[0,1],[.085,.8],[.31,.95],[.395,.75]].forEach(([o,a])=>{
          burst(p,v*a,cut,cut*.45,1.1,.05+.03*(1-close),'lowpass',when+o);
          thump(p,v*a*.9,95,48,.08,when+o);
        });
        clackAt=Math.max(t,clackAt)+.66;
      }
      // the forest lives a little: soft creaks, never the same twice
      if(t>creakAt&&s.calm){
        const p=Math.random()*2-1,f=180+Math.random()*340;
        burst(p,.035+.03*Math.random(),f,f*(.6+Math.random()*.9),9,.25+Math.random()*.4,'bandpass',0,.05);
        creakAt=t+3.5+Math.random()*7;
      }
    },
    step(pan,prox){thump(pan,.12+.4*prox,60+20*Math.random(),34,.2);burst(pan,.05+.12*prox,700,220,2,.09,'lowpass');},
    hiss(pan){burst(pan,.2,2600,900,1.2,.7,'bandpass',0,.03);burst(pan,.12,500,180,3,.9,'bandpass',.05,.05);},
    chatter(pan,vol=.14){for(let i=0;i<9;i++)burst(pan,vol*(.6+.4*Math.random()),1700+500*Math.random(),900,6,.028,'bandpass',i*.055+Math.random()*.02);},
    buzz(){if(!ok())return;const t=now(),o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();o.type='square';o.frequency.value=100;f.type='lowpass';f.frequency.value=900;
      g.gain.setValueAtTime(0,t);for(let i=0;i<5;i++){g.gain.setValueAtTime(.05,t+i*.07);g.gain.setValueAtTime(0,t+i*.07+.03+Math.random()*.02);}
      o.connect(f);f.connect(g);g.connect(master);o.start(t);o.stop(t+.5);},
    click(){burst(0,.12,1500,700,4,.03,'bandpass');},
    horn(pan=-.8){
      if(!ok())return;const t=now(),g=ctx.createGain(),f=ctx.createBiquadFilter(),p=ctx.createStereoPanner?ctx.createStereoPanner():ctx.createGain();
      f.type='lowpass';f.frequency.value=1100;if(p.pan)p.pan.value=pan;
      g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(.2,t+.25);g.gain.setValueAtTime(.2,t+1.5);g.gain.exponentialRampToValueAtTime(.0001,t+2.8);
      for(const fr of [220,277.2,329.6]){const o=ctx.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(fr*1.03,t);o.frequency.linearRampToValueAtTime(fr*.99,t+2.8);o.connect(f);o.start(t);o.stop(t+2.9);}
      f.connect(g);g.connect(p);p.connect(master);
    },
    sting(){thump(0,.7,52,24,2.4);burst(0,.12,300,90,1.5,2.6,'bandpass',0,.6);},
    // the screamer: a roar, not a shriek — heavy low end, nothing above ~3 kHz
    scream(){
      if(!ok())return;const t=now(),out=ctx.createGain(),lp=ctx.createBiquadFilter(),sh=ctx.createWaveShaper();
      lp.type='lowpass';lp.frequency.value=3000;
      const c=new Float32Array(256);for(let i=0;i<256;i++){const x=i/128-1;c[i]=Math.tanh(3.2*x);}sh.curve=c;
      out.gain.setValueAtTime(0.0001,t);out.gain.exponentialRampToValueAtTime(1,t+.012);out.gain.setValueAtTime(1,t+.9);out.gain.exponentialRampToValueAtTime(.0001,t+1.9);
      sh.connect(lp);lp.connect(out);out.connect(master);
      const mix=(node,v)=>{const g=ctx.createGain();g.gain.value=v;node.connect(g);g.connect(sh);};
      for(const [fr,v] of [[196,.2],[207.6,.1],[293.7,.16],[98,.3]]){
        const o=ctx.createOscillator(),lfo=ctx.createOscillator(),lg=ctx.createGain();o.type='sawtooth';
        o.frequency.setValueAtTime(fr*1.5,t);o.frequency.exponentialRampToValueAtTime(fr*.62,t+1.7);
        lfo.frequency.value=27+Math.random()*9;lg.gain.value=fr*.06;lfo.connect(lg);lg.connect(o.frequency);
        mix(o,v);o.start(t);lfo.start(t);o.stop(t+2);lfo.stop(t+2);
      }
      const s=ctx.createBufferSource(),bf=ctx.createBiquadFilter();s.buffer=noiseBuf;s.loop=true;bf.type='bandpass';bf.Q.value=.9;
      bf.frequency.setValueAtTime(1900,t);bf.frequency.exponentialRampToValueAtTime(600,t+1.6);s.connect(bf);mix(bf,.5);s.start(t);s.stop(t+2);
      const sub=ctx.createOscillator(),sg=ctx.createGain();sub.frequency.setValueAtTime(92,t);sub.frequency.exponentialRampToValueAtTime(34,t+1.5);
      sg.gain.setValueAtTime(.0001,t);sg.gain.exponentialRampToValueAtTime(.85,t+.02);sg.gain.exponentialRampToValueAtTime(.0001,t+1.8);
      sub.connect(sg);sg.connect(master);sub.start(t);sub.stop(t+2);
      for(let i=0;i<7;i++)burst(Math.random()*2-1,.2,1500,800,5,.03,'bandpass',.25+i*.06);
    }
  };
  return api;
}

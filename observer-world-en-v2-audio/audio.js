/* Observer World: Krieger-style procedural audio.
 * Source inspiration: World_server/games/ostrov-sumerek/engine/32_audio.js
 * Pure WebAudio oscillators, filtered noise, ADSR envelopes; no audio files, no APIs.
 * One scheduler driven by the game's existing requestAnimationFrame; no setInterval.
 * Public-domain-like original notes/recipes generated here; not copied from commercial games.
 */
(function (root) {
  "use strict";
  const THEMES = Object.freeze({
    frontier: {label:"Frontier", scale:[0,2,5,7,9], root:146.83, bass:[0,0,7,5], pattern:[0,2,4,1,3,2,1,0], tempo:88, timbre:"triangle"},
    town:     {label:"Market Waltz",scale:[0,2,4,7,9],root:174.61,bass:[0,4,7,4],pattern:[0,2,4,3,1,4,2,0],tempo:102,timbre:"triangle"},
    chapel:   {label:"Chapel",scale:[0,3,5,7,10],root:130.81,bass:[0,5,7,3],pattern:[0,3,2,4,1,2,0,3],tempo:72,timbre:"sine"},
    mystery:  {label:"Observer",scale:[0,1,5,7,8],root:164.81,bass:[0,7,1,5],pattern:[0,3,1,4,2,0,4,1],tempo:78,timbre:"sine"},
    plague:   {label:"Plague",scale:[0,1,3,6,8],root:123.47,bass:[0,1,6,3],pattern:[0,2,1,4,3,1,2,0],tempo:68,timbre:"triangle"},
    battle:   {label:"Steel & Ash",scale:[0,2,3,7,8],root:110,bass:[0,7,8,3],pattern:[0,3,4,2,1,4,0,3],tempo:126,timbre:"sawtooth"},
    aftermath:{label:"Aftermath",scale:[0,3,5,7,10],root:116.54,bass:[0,5,3,0],pattern:[0,1,3,2,4,2,1,0],tempo:60,timbre:"sine"}
  });
  const SOUND_GROUPS = Object.freeze({
    well:"water",settlement:"hammer",council:"paper",market:"coin",guild:"coin",tax:"coin",
    school:"paper",scholarAction:"paper",printing:"press",castle:"gate",court:"gate",decree:"paper",
    monastery:"bell",relief:"healing",doctrine:"bell",guard:"steel",patrol:"step",militia:"steel",
    prison:"gate",inquiry:"gate",pardon:"bell",granary:"step",ration:"step",caravan:"step",
    healer:"healing",quarantine:"bell",hospital:"healing",fire:"fire",brigade:"water",
    watch:"bell",plague:"plague",cordon:"gate",burial:"lament",observer:"mystery",contact:"mystery",extraction:"mystery",
    hut:"hammer",scholar:"paper",glyph:"paper",select:"ui",swing:"swing",hit:"hit",
    wounded:"wounded",killed:"death",death:"death",heal:"healing",clash:"alarm"
  });
  function create() {
    let ctx=null,master=null,musicBus=null,fxBus=null,ambBus=null,wind=null,drone=null;
    let noiseBuf=null,enabled=false,volume=0.48,theme="frontier",lastTheme="",
        nextBeat=0,step=0,lastTick=0,lastFx=Object.create(null),lastVariant=Object.create(null),
        scheduled=0,events=0,musicBeats=0,switches=0,ctxErrors=0,wasRunning=false;
    try { const v=Number(localStorage.getItem("observer-audio-volume-v1"));if(Number.isFinite(v)&&v>=0&&v<=1)volume=v; } catch {}
    const now=()=>ctx?ctx.currentTime:0;
    const finite=(n,lo,hi)=>Math.max(lo,Math.min(hi,Number(n)||lo));
    const midi=(root,semitones)=>root*Math.pow(2,semitones/12);
    const variantFor=kind=>{
      const previous=lastVariant[kind],next=previous===0?1:previous===1?0:Math.random()<.5?0:1;
      lastVariant[kind]=next;return next;
    };
    function bus(value){const g=ctx.createGain();g.gain.value=value;g.connect(master);return g}
    function oscillator(freq,dur,type,gain,t=now(),dest=fxBus,slide=0){
      if(!ctx||!dest)return;
      const start=Math.max(ctx.currentTime,t),stop=start+Math.max(.04,dur);
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.type=type;o.frequency.setValueAtTime(Math.max(22,freq),start);
      if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(22,slide),stop);
      g.gain.setValueAtTime(.0001,start);
      g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),start+.012);
      g.gain.exponentialRampToValueAtTime(.0001,stop);
      o.connect(g);g.connect(dest);o.start(start);o.stop(stop+.025);scheduled++;
    }
    function noise(dur,f0,f1,vol,t=now(),type="bandpass"){
      if(!ctx||!noiseBuf)return;
      const start=Math.max(ctx.currentTime,t),stop=start+dur;
      const source=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();
      source.buffer=noiseBuf;f.type=type;f.frequency.setValueAtTime(Math.max(40,f0),start);
      if(f1>0)f.frequency.exponentialRampToValueAtTime(Math.max(40,f1),stop);
      f.Q.value=.75;
      g.gain.setValueAtTime(.0001,start);
      g.gain.exponentialRampToValueAtTime(Math.max(.0002,vol),start+.015);
      g.gain.exponentialRampToValueAtTime(.0001,stop);
      source.connect(f);f.connect(g);g.connect(fxBus);source.start(start);source.stop(stop+.02);scheduled++;
    }
    function init(){
      if(ctx)return true;
      const AC=root.AudioContext||root.webkitAudioContext;if(!AC)return false;
      try {
        ctx=new AC({latencyHint:"interactive"});
        const comp=ctx.createDynamicsCompressor();comp.threshold.value=-20;comp.ratio.value=4;
        master=ctx.createGain();master.gain.value=volume*.72;master.connect(comp);comp.connect(ctx.destination);
        musicBus=bus(.36);fxBus=bus(.62);ambBus=bus(.19);
        const b=ctx.createBuffer(1,Math.round(ctx.sampleRate),ctx.sampleRate),data=b.getChannelData(0);
        let seed=1749;for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;data[i]=((seed>>>0)/2147483648)-1}noiseBuf=b;
        wind=ctx.createBufferSource();wind.buffer=b;wind.loop=true;
        const f=ctx.createBiquadFilter();f.type="bandpass";f.frequency.value=430;f.Q.value=.55;
        const wg=ctx.createGain();wg.gain.value=.14;wind.connect(f);f.connect(wg);wg.connect(ambBus);wind.start();
        drone=ctx.createOscillator();drone.type="triangle";drone.frequency.value=55;
        const dg=ctx.createGain();dg.gain.value=.08;drone.connect(dg);dg.connect(ambBus);drone.start();
        nextBeat=ctx.currentTime+.08;
        return true;
      } catch(e){ctxErrors++;try{ctx?.close()}catch{}ctx=null;return false}
    }
    function updateBuses() {
      if(!ctx)return;
      const t=now(),danger=theme==="battle"||theme==="plague",sad=theme==="aftermath";
      musicBus.gain.setTargetAtTime(danger?.31:sad?.24:.36,t,.3);
      ambBus.gain.setTargetAtTime(danger?.28:.17,t,.5);
      master.gain.setTargetAtTime(enabled?volume*.72:0,t,.08);
    }
    async function start(){
      if(!init())return false;
      enabled=true;
      try{if(ctx.state!=="running")await ctx.resume()}catch(e){ctxErrors++;enabled=false;return false}
      nextBeat=ctx.currentTime+.09;updateBuses();return true;
    }
    function setEnabled(value) {
      if(value)return start();
      enabled=false;updateBuses();
      // A muted but running AudioContext still costs CPU on phones. Suspend entirely.
      if(ctx&&ctx.state==="running")return ctx.suspend().then(()=>false).catch(()=>{ctxErrors++;return false});
      return Promise.resolve(false)
    }
    function toggle(){return setEnabled(!enabled)}
    function setVolume(v){volume=finite(v,0,1);try{localStorage.setItem("observer-audio-volume-v1",String(volume))}catch{}updateBuses()}
    function classify(state={}){
      const actors=state.combat?.actors||[],obj=state.objects||[];
      const fighting=actors.some(a=>a.state==="attack"||a.state==="chase");
      if(fighting)return"battle";
      if(actors.some(a=>a.state==="wounded")||actors.some(a=>a.state==="dead")&&state.order<13)return"aftermath";
      if(obj.some(o=>!o.dead&&o.kind==="plague"))return"plague";
      if(obj.some(o=>!o.dead&&["monastery","doctrine","burial"].includes(o.kind)))return"chapel";
      if(obj.some(o=>!o.dead&&["market","guild","caravan"].includes(o.kind)))return"town";
      if((state.suspicion||0)>3)return"mystery";
      return"frontier";
    }
    function beat(t){
      const x=THEMES[theme],degree=x.pattern[step%8],bar=Math.floor(step/8),semi=x.scale[degree];
      // Distinct melodic, low bass, and chime ostinati; every sound source self-terminates.
      const flip=bar%2,up=step%4===2?12:step%6===0?0:7;
      oscillator(midi(x.root,semi+up),.30,x.timbre,.026,t,musicBus);
      if(step%2===0)oscillator(midi(x.root/2,x.bass[Math.floor(step/2)%4]),.62,"sine",.044,t,musicBus);
      if(step%4===0&&theme!=="battle")oscillator(midi(x.root,semi+24+(flip?2:0)),.45,"sine",.010,t+.12,musicBus);
      if(theme==="battle"&&step%2===0){oscillator(61,.10,"sine",.062,t,musicBus,39);if(step%4===2)noise(.07,1800,330,.028,t)}
      musicBeats++;step++
    }
    function tick(ms,state){
      if(!enabled||!ctx||ctx.state!=="running")return;
      if(ms-lastTick<110)return;lastTick=ms;
      const desired=classify(state);
      if(desired!==theme){theme=desired;switches++;step=0;nextBeat=Math.max(ctx.currentTime+.02,nextBeat);updateBuses()}
      const t=ctx.currentTime,spacing=60/THEMES[theme].tempo/2;
      if(nextBeat<t-.4)nextBeat=t+.02; // No burst catch-up after mobile suspend.
      let guard=0;while(nextBeat<t+.30&&guard++<3){beat(nextBeat);nextBeat+=spacing}
    }
    function event(name,detail={}){
      if(!enabled||!ctx||ctx.state!=="running")return false;
      const k=SOUND_GROUPS[name]||name,t=ctx.currentTime,prev=lastFx[k]||-100;
      if(t-prev<(k==="hit"?.13:k==="swing"?.2:.09))return false;
      lastFx[k]=t;const hi=variantFor(k)===1,p=(hi?1.18:.81)*(1+(Math.random()-.5)*.11),
      v=(.75+Math.random()*.35)*finite(detail.intensity??1,.25,1.2);
      switch(k){
        case"water":noise(.32,890*p,320*p,.060*v,t);oscillator(460*p,.22,"sine",.018*v,t);break;
        case"coin":oscillator(1100*p,.085,"triangle",.048*v,t);oscillator(1649*p,.27,"sine",.029*v,t+.06);break;
        case"bell":oscillator(590*p,1.1,"sine",.040*v,t);oscillator(1182*p,.84,"sine",.019*v,t+.025);break;
        case"steel":case"swing":noise(.17,2600*p,340*p,.070*v,t);oscillator(380*p,.11,"triangle",.021*v,t);break;
        case"hit":oscillator(142*p,.15,"square",.052*v,t,fxBus,57*p);noise(.095,1750*p,670*p,.060*v,t);break;
        case"wounded":oscillator(258*p,.38,"sawtooth",.038*v,t,fxBus,118*p);break;
        case"death":oscillator(150*p,.9,"triangle",.037*v,t,fxBus,49*p);noise(.27,400*p,90*p,.025*v,t);break;
        case"healing":for(let i=0;i<4;i++)oscillator(523*p*Math.pow(2,i*3/12),.23,"sine",.022*v,t+i*.09);break;
        case"fire":noise(.4,1200*p,430*p,.082*v,t);oscillator(75*p,.29,"triangle",.016*v,t);break;
        case"plague":oscillator(173*p,.83,"sawtooth",.017*v,t,fxBus,113*p);noise(.24,540*p,220*p,.035*v,t);break;
        case"gate":noise(.22,440*p,100*p,.074*v,t);oscillator(88*p,.23,"square",.035*v,t);break;
        case"press":noise(.14,1100*p,230*p,.055*v,t);oscillator(145*p,.16,"triangle",.030*v,t);break;
        case"hammer":oscillator(200*p,.08,"square",.040*v,t,fxBus,90*p);break;
        case"step":noise(.065,500*p,180*p,.035*v,t);break;
        case"lament":oscillator(261*p,.7,"sine",.029*v,t,fxBus,174*p);break;
        case"alarm":for(let i=0;i<3;i++)oscillator((392+i*82)*p,.19,"triangle",.035*v,t+i*.13);break;
        case"mystery":oscillator(330*p,.4,"sine",.028*v,t,fxBus,535*p);break;
        case"paper":noise(.095,1400*p,530*p,.027*v,t);break;
        case"ui":oscillator(740*p,.07,"sine",.021*v,t);break;
        default:oscillator(490*p,.1,"triangle",.021*v,t)
      }
      events++;return true
    }
    function onVisibility(hidden){
      if(!ctx)return;
      if(hidden){wasRunning=enabled;try{ctx.suspend()}catch{}}
      else if(wasRunning&&enabled){ctx.resume().then(()=>{nextBeat=ctx.currentTime+.12}).catch(()=>{ctxErrors++})}
    }
    function diagnostics(){return{supported:!!(root.AudioContext||root.webkitAudioContext),enabled,volume,theme,label:THEMES[theme].label,contextState:ctx?.state||"not-created",events,musicBeats,scheduled,switches,ctxErrors,source:"World_server/games/ostrov-sumerek/engine/32_audio.js"}}
    return Object.freeze({start,toggle,setEnabled,setVolume,tick,event,onVisibility,diagnostics,get enabled(){return enabled},get volume(){return volume}});
  }
  root.ObserverKriegerAudio=Object.freeze({create,THEMES,SOUND_GROUPS});
})(window);

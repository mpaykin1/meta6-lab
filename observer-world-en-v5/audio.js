/* Observer World: Krieger-style procedural audio.
 * Source inspiration: World_server/games/ostrov-sumerek/engine/32_audio.js
 * Pure WebAudio oscillators, filtered noise, ADSR envelopes; no audio files, no APIs.
 * One scheduler driven by the game's existing requestAnimationFrame; no setInterval.
 * Public-domain-like original notes/recipes generated here; not copied from commercial games.
 */
(function (root) {
  "use strict";
  const THEMES = Object.freeze({
    dawn: {label:"Dawn / First Light",scale:[0,2,4,7,9],root:146.83,bass:[0,2,7,4],pattern:[0,1,3,4,2,3,1,0],tempo:76,timbre:"sine"},
    frontier: {label:"Frontier", scale:[0,2,5,7,9], root:146.83, bass:[0,0,7,5], pattern:[0,2,4,1,3,2,1,0], tempo:88, timbre:"triangle"},
    knowledge:{label:"The Discovery",scale:[0,2,4,6,9],root:196,bass:[0,4,2,7],pattern:[0,4,1,3,2,4,3,0],tempo:91,timbre:"triangle"},
    night: {label:"Night on the Island",scale:[0,2,3,7,10],root:98,bass:[0,3,7,2],pattern:[0,3,1,4,2,3,0,1],tempo:66,timbre:"sine"},
    monster: {label:"A Shadow Appears",scale:[0,1,3,6,8],root:103.83,bass:[0,6,1,8],pattern:[0,1,3,4,1,2,4,0],tempo:118,timbre:"sawtooth"},
    victory: {label:"After the Darkness",scale:[0,2,4,7,11],root:174.61,bass:[0,4,7,2],pattern:[0,2,4,3,2,4,1,0],tempo:100,timbre:"triangle"},
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
    let ctx=null,master=null,musicBus=null,fxBus=null,ambBus=null,wind=null,drone=null,analyser=null;
    let noiseBuf=null,enabled=false,fxEnabled=false,volume=0.8,musicVolume=1,fxVolume=0.65,theme="frontier",manualTheme="",lastTheme="",
        nextBeat=0,step=0,lastTick=0,lastFx=Object.create(null),lastVariant=Object.create(null),
        scheduled=0,events=0,musicBeats=0,switches=0,ctxErrors=0,wasRunning=false,musicChords=0,counterpointNotes=0,section=0,phrase=0,musicTimer=null,lastWorldState={objects:[],combat:{actors:[]},order:20,suspicion:0};
    try {
      const stored=localStorage.getItem("observer-v4-master-volume");
      if(stored!==null){const v=Number(stored);if(Number.isFinite(v)&&v>=0&&v<=1)volume=v}
      for(const [key,assign] of [["observer-v4-music-volume",v=>musicVolume=v],["observer-v4-fx-volume",v=>fxVolume=v]]){
        const raw=localStorage.getItem(key);if(raw!==null){const v=Number(raw);if(Number.isFinite(v)&&v>=0&&v<=1)assign(v)}
      }
    } catch {}
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
        master=ctx.createGain();master.gain.value=volume*.92;master.connect(comp);comp.connect(ctx.destination);
        musicBus=bus(.95);fxBus=bus(.38);ambBus=bus(.08);
        analyser=ctx.createAnalyser();analyser.fftSize=2048;
        // Analyse only the music channel, not SFX. Keep music connected to output.
        musicBus.disconnect();musicBus.connect(analyser);analyser.connect(master);
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
      musicBus.gain.setTargetAtTime(enabled?musicVolume*(danger?.92:sad?.87:.95):0,t,.08);
      fxBus.gain.setTargetAtTime(fxEnabled?fxVolume*.50:0,t,.06);
      ambBus.gain.setTargetAtTime(enabled?.09:0,t,.5);
      master.gain.setTargetAtTime((enabled||fxEnabled)?volume*.92:0,t,.08);
    }
    function stopMusicClock(){
      if(musicTimer!==null&&typeof root.clearInterval==="function")root.clearInterval(musicTimer);
      musicTimer=null;
    }
    function armMusicClock(){
      if(musicTimer!==null||typeof root.setInterval!=="function")return;
      // One bounded shared music lookahead scheduler, independent of graphical FPS.
      musicTimer=root.setInterval(()=>{
        if(!enabled||!ctx||ctx.state!=="running")return;
        try{tick(root.performance?.now?.()||Date.now(),lastWorldState)}
        catch(e){ctxErrors++;if(ctxErrors>4)stopMusicClock()}
      },120);
    }
    async function start(){
      if(!init())return false;
      enabled=true;
      try{if(ctx.state!=="running")await ctx.resume()}catch(e){ctxErrors++;enabled=false;return false}
      nextBeat=ctx.currentTime+.09;lastTick=-1;updateBuses();
      // Schedule audible music immediately in the same user gesture; no dependence on a future RAF.
      beat(nextBeat);nextBeat+=60/THEMES[theme].tempo/2;
      armMusicClock();return true;
    }
    function setEnabled(value) {
      if(value)return start();
      enabled=false;stopMusicClock();updateBuses();
      // A muted but running AudioContext still costs CPU on phones. Suspend entirely.
      if(ctx&&ctx.state==="running"&&!fxEnabled)return ctx.suspend().then(()=>false).catch(()=>{ctxErrors++;return false});
      return Promise.resolve(false)
    }
    function toggle(){return setEnabled(!enabled)}
    function setMusicVolume(v){
      musicVolume=finite(v,0,1);try{localStorage.setItem("observer-v4-music-volume",String(musicVolume))}catch{}updateBuses();
    }
    async function setFxEnabled(value){
      if(value){
        if(!init())return false;fxEnabled=true;
        try{if(ctx.state!=="running")await ctx.resume()}catch{ctxErrors++;fxEnabled=false;return false}
      }else{fxEnabled=false}
      updateBuses();
      if(!enabled&&!fxEnabled&&ctx?.state==="running")await ctx.suspend().catch(()=>{ctxErrors++});
      return fxEnabled;
    }
    function setFxVolume(v){
      fxVolume=finite(v,0,1);try{localStorage.setItem("observer-v4-fx-volume",String(fxVolume))}catch{}updateBuses();
    }
    function forceTheme(t){manualTheme=THEMES[t]?t:"";step=0;phrase=0;nextBeat=ctx?ctx.currentTime+.08:0;lastTick=-1;return manualTheme}
    function musicMeter(){
      if(!analyser||!enabled||ctx?.state!=="running")return 0;
      const data=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(data);
      let power=0;for(let i=0;i<data.length;i++)power+=data[i]*data[i];
      return Math.round(Math.sqrt(power/data.length)*10000)/10000;
    }
    function setVolume(v){volume=finite(v,0,1);try{localStorage.setItem("observer-v4-master-volume",String(volume))}catch{}updateBuses()}
    function classify(state={}){
      const actors=state.combat?.actors||[],obj=state.objects||[];
      if(manualTheme)return manualTheme;
      if((state.monsters||[]).some(m=>m.hp>0&&!m.dead))return"monster";
      if(state.victory)return"victory";
      const fighting=actors.some(a=>a.state==="attack"||a.state==="chase");
      if(fighting)return"battle";
      if(actors.some(a=>a.state==="wounded")||actors.some(a=>a.state==="dead")&&state.order<13)return"aftermath";
      if(obj.some(o=>!o.dead&&o.kind==="plague"))return"plague";
      if(state.night)return"night";
      if(obj.some(o=>!o.dead&&["school","scholarAction","printing"].includes(o.kind)))return"knowledge";
      if(obj.some(o=>!o.dead&&["monastery","doctrine","burial"].includes(o.kind)))return"chapel";
      if(obj.some(o=>!o.dead&&["market","guild","caravan"].includes(o.kind)))return"town";
      if((state.suspicion||0)>3)return"mystery";
      return"frontier";
    }
    // Original multi-voice procedural score. 32-step phrases, four-chord progressions,
    // contrapuntal answer, bass movement and cadences; no additional SFX.
    const SCORE=Object.freeze({
      dawn:{chords:[0,3,4,2],motif:[0,2,1,4,2,3,1,0],rhythm:[1,0,1,1,1,0,1,1],reply:[2,1,3,4],swing:0,drone:.023},
      knowledge:{chords:[0,2,4,3],motif:[0,4,2,1,3,2,4,0],rhythm:[1,0,1,1,0,1,1,0],reply:[4,2,1,3],swing:.015,drone:.021},
      night:{chords:[0,3,1,4],motif:[4,2,1,0,2,3,1,0],rhythm:[1,0,0,1,1,0,0,1],reply:[1,2,4,3],swing:0,drone:.025},
      monster:{chords:[0,1,4,2],motif:[0,1,3,4,2,4,1,0],rhythm:[1,1,0,1,1,1,0,1],reply:[4,1,3,0],swing:0,drone:.038},
      victory:{chords:[0,3,4,2],motif:[0,2,4,3,2,4,1,0],rhythm:[1,1,1,0,1,1,1,1],reply:[2,3,4,1],swing:.02,drone:.029},
      frontier:{chords:[0,3,4,2],motif:[0,2,3,4,2,1,3,0],rhythm:[1,0,1,1,0,1,1,0],reply:[4,3,1,2],swing:.025,drone:.016},
      town:{chords:[0,2,3,4],motif:[0,2,4,2,3,1,2,0],rhythm:[1,1,0,1,1,0,1,1],reply:[2,1,4,3],swing:.06,drone:.014},
      chapel:{chords:[0,3,1,4],motif:[0,4,2,3,1,2,4,0],rhythm:[1,0,1,0,1,1,0,1],reply:[3,4,2,1],swing:0,drone:.026},
      mystery:{chords:[0,1,3,2],motif:[0,1,4,3,2,1,3,0],rhythm:[1,0,0,1,1,0,1,1],reply:[4,2,3,1],swing:.04,drone:.022},
      plague:{chords:[0,3,1,2],motif:[0,2,1,4,3,0,1,2],rhythm:[1,0,1,0,0,1,1,0],reply:[1,3,0,2],swing:0,drone:.023},
      battle:{chords:[0,4,1,3],motif:[0,3,4,2,0,4,3,1],rhythm:[1,1,1,0,1,1,1,1],reply:[1,2,3,4],swing:.015,drone:.032},
      aftermath:{chords:[0,2,3,1],motif:[4,3,2,0,1,2,3,0],rhythm:[1,0,1,0,1,0,1,0],reply:[1,0,2,3],swing:0,drone:.033}
    });
    function musicNote(hz,dur,at,voice,vol){
      // Independent envelopes on pitched instruments: bell, harp, soft pad, and bass.
      const c=ctx;if(!c)return;
      const start=Math.max(c.currentTime,at),end=start+dur;
      const g=c.createGain(),o=c.createOscillator();
      o.type=voice==="bass"?"sine":voice==="pad"?"triangle":voice==="bell"?"sine":"triangle";
      o.frequency.setValueAtTime(Math.max(28,hz),start);
      const attack=voice==="pad"?.18:voice==="bass"?.028:.016;
      const sustain=voice==="pad"?.65:.37;
      g.gain.setValueAtTime(.0001,start);
      g.gain.linearRampToValueAtTime(vol,start+Math.min(dur*.27,attack));
      g.gain.exponentialRampToValueAtTime(Math.max(.0002,vol*sustain),start+dur*.55);
      g.gain.exponentialRampToValueAtTime(.0001,end);
      o.connect(g);g.connect(musicBus);o.start(start);o.stop(end+.03);scheduled++;
      // Just one light harmonic partial on leads; avoid unbounded polyphony.
      if((voice==="bell"||voice==="harp")&&vol>.012){
        const harmonic=c.createOscillator(),hg=c.createGain();
        harmonic.type="sine";harmonic.frequency.value=hz*(voice==="bell"?2.005:3);
        hg.gain.setValueAtTime(.0001,start);
        hg.gain.linearRampToValueAtTime(vol*.19,start+.02);
        hg.gain.exponentialRampToValueAtTime(.0001,start+dur*.65);
        harmonic.connect(hg);hg.connect(musicBus);harmonic.start(start);harmonic.stop(end+.02);scheduled++;
      }
    }
    function beat(t){
      const x=THEMES[theme],score=SCORE[theme];
      const stepInPhrase=step%32,bar=Math.floor(stepInPhrase/8),degree=score.chords[bar],
            chordRoot=x.scale[degree],rhythmStep=stepInPhrase%8;
      // Chord voicings change each bar and resolve every 32-step phrase.
      if(stepInPhrase%8===0){
        const rootHz=midi(x.root/2,chordRoot);
        const minor=theme==="plague"||theme==="mystery"||theme==="aftermath";
        const third=minor?3:4,notes=[0,third,7,12];
        notes.forEach((offset,i)=>musicNote(rootHz*Math.pow(2,offset/12),Math.min(2.35,60/x.tempo*3.5),t+i*.012,"pad",score.drone*(i===0?1:.55)));
        musicChords++;
      }
      if(rhythmStep%2===0){
        const interval=score.chords[bar]+(rhythmStep===4?2:0);
        musicNote(midi(x.root/4,x.scale[interval%5]+(interval>=5?12:0)),
          theme==="battle"?.23:.54,t,"bass",theme==="battle"?.072:.053);
      }
      // Actual authored eight-note melody with alternating answered phrases.
      const noteIndex=score.motif[rhythmStep],variation=phrase%4;
      if(score.rhythm[rhythmStep]){
        const melodicDegree=(noteIndex+(variation===2?1:0))%x.scale.length;
        const octave=(rhythmStep===6&&variation>=1)?12:variation===3&&rhythmStep===7?-12:0;
        const melodicHz=midi(x.root,x.scale[melodicDegree]+octave+(variation===1?12:0));
        const noteLength=theme==="chapel"||theme==="aftermath"?.82:.38;
        const velocity=.074+(rhythmStep===0?.012:0)+(theme==="battle"?.01:0);
        musicNote(melodicHz,noteLength,t+(rhythmStep%2?score.swing:0),theme==="chapel"?"bell":"harp",velocity);
      }
      // Countermelody: call and response every second bar, distinct contour and register.
      if((bar===1||bar===3)&&(rhythmStep===2||rhythmStep===5)){
        const replyDegree=score.reply[(Math.floor(stepInPhrase/4)+variation)%4];
        musicNote(midi(x.root*.5,x.scale[replyDegree]+12),.55,t+.07,"bell",.019);
        counterpointNotes++;
      }
      if(theme==="battle"&&rhythmStep%2===0){
        // Percussion is inside the musical score; existing gameplay SFX remain unchanged.
        musicNote(55,.11,t,"bass",.067);
      }
      if(stepInPhrase===31){phrase++;section=(section+1)%4}
      musicBeats++;step++;
    }
    function tick(ms,state){
      if(state)lastWorldState=state;
      if(!enabled||!ctx||ctx.state!=="running")return;
      if(ms-lastTick<110)return;lastTick=ms;
      const desired=classify(state);
      if(desired!==theme){theme=desired;switches++;step=0;phrase=0;nextBeat=Math.max(ctx.currentTime+.02,nextBeat);updateBuses()}
      const t=ctx.currentTime,spacing=60/THEMES[theme].tempo/2;
      if(nextBeat<t-.4)nextBeat=t+.02; // No burst catch-up after mobile suspend.
      let guard=0;while(nextBeat<t+.30&&guard++<3){beat(nextBeat);nextBeat+=spacing}
    }
    function event(name,detail={}){
      if(!fxEnabled||!ctx||ctx.state!=="running")return false;
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
      if(hidden){wasRunning=enabled;stopMusicClock();try{ctx.suspend()}catch{}}
      else if(wasRunning&&enabled){ctx.resume().then(()=>{nextBeat=ctx.currentTime+.12;armMusicClock()}).catch(()=>{ctxErrors++})}
    }
    function diagnostics(){return{supported:!!(root.AudioContext||root.webkitAudioContext),enabled,fxEnabled,volume,musicVolume,fxVolume,schedulerActive:musicTimer!==null,theme,label:THEMES[theme].label,contextState:ctx?.state||"not-created",musicRms:musicMeter(),events,musicBeats,scheduled,switches,musicChords,counterpointNotes,phrase,section,ctxErrors,source:"World_server/games/ostrov-sumerek/engine/32_audio.js"}}
    return Object.freeze({start,toggle,setEnabled,setVolume,setMusicVolume,setFxEnabled,setFxVolume,forceTheme,tick,event,onVisibility,diagnostics,get enabled(){return enabled},get fxEnabled(){return fxEnabled},get musicVolume(){return musicVolume},get fxVolume(){return fxVolume},get volume(){return volume}});
  }
  root.ObserverKriegerAudio=Object.freeze({create,THEMES,SOUND_GROUPS});
})(window);

// Z23 — original SYMPHONIA Adagio musical material (game/index.html blob 0a7d6fc587fd01646a97b65bdbb9194150fbf70b).
// Reuse the original Theme A generator, modal snap and dissonance attenuation.
const MODES=[[0,2,3,5,7,8,10],[0,1,3,5,7,8,10],[0,2,3,5,7,8,11],[0,2,3,5,7,9,10]];
let mseed=1;const mr=()=>{mseed=(mseed*16807)%2147483647;return mseed/2147483647;};
let circle=1,curRoot=50,curCh=[50,0,3,7],MUS={key:0};
function makeThemes(){mseed=7919*circle+13;
  let d=[0,2,4][Math.floor(mr()*3)],A=[],lens=[[2,1,1,2,1,1,1,3],[1.5,.5,1,1,2,1,1,4],[1,1,2,1,1,2,2,2]][Math.floor(mr()*3)];
  for(let i=0;i<8;i++){A.push({d,l:lens[i]});const up=i<4?1:-1;d+=mr()<.75?up*(mr()<.8?1:2):-up;}
  return A;
}
const pcm=x=>((x%12)+12)%12;
function harmo(m){const R=curRoot,C=[pcm(R),pcm(R+curCh[2]),pcm(R+curCh[3])];
  const ton=pcm(62+MUS.key),SC=MODES[(circle-1)%MODES.length].map(x=>pcm(x+ton));
  const isC=x=>C.includes(pcm(x)),isS=x=>isC(x)||SC.includes(pcm(x));
  const near=f=>{for(const o of [0,-1,1,-2,2,-3,3,-4,4,-5,5,6])if(f(m+o))return m+o;return m;};
  m=m>=79?near(isC):near(isS);
  let dis=false;if(!isC(m)){const q=pcm(m);dis=C.some(c=>{const d=Math.min(pcm(q-c),pcm(c-q));return d===1;})||pcm(q-C[0])===6;}
  return {m,dis};}
const progression={adazhio:[[0,'m'],[8,'M'],[3,'M'],[10,'M'],[5,'m'],[0,'m'],[7,'M'],[0,'m']]}.adazhio;
const freq=m=>440*Math.pow(2,(m-69)/12);
export function motifForCircle(value){circle=Math.max(1,Math.min(10000,Math.floor(Number(value)||1)));return makeThemes();}
export function harmonyFor(m,bar=0,value=1){
  circle=Math.max(1,Math.min(10000,Math.floor(Number(value)||1)));
  const [root,quality]=progression[((bar%progression.length)+progression.length)%progression.length];
  curRoot=50+root;while(curRoot>55)curRoot-=12;
  curCh=[curRoot,0,quality==='M'?4:3,7];
  return harmo(m);
}
function note(ctx,dest,m,t,vel,dur,bar,c){
  const h=harmonyFor(m,bar,c);if(h.dis)vel*=.5;
  const f=freq(h.m),g=ctx.createGain(),lp=ctx.createBiquadFilter();
  lp.type='lowpass';lp.frequency.setValueAtTime(Math.min(6000,f*7),t);
  lp.frequency.exponentialRampToValueAtTime(Math.max(300,f*1.5),t+dur);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vel,t+.012);
  g.gain.exponentialRampToValueAtTime(vel*.35,t+.35);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  lp.connect(g);g.connect(dest);
  const oscs=[];
  for(const [k,type,weight] of [[1,'sine',1],[2,'triangle',.24]]){
    const o=ctx.createOscillator(),og=ctx.createGain();o.type=type;o.frequency.value=f*k;og.gain.value=weight;
    o.connect(og);og.connect(lp);o.start(t);o.stop(t+dur+.05);oscs.push([o,og]);
  }
  oscs[0][0].onended=()=>{for(const [o,og] of oscs){o.disconnect();og.disconnect()}lp.disconnect();g.disconnect()};
}
export function createFogPiano(onNote){
  let ctx=null,bus=null,filter=null,next=0,idx=0,beat=0,lastCircle=0,theme=null,was=false;
  return {tick(audio,depth,c,active){
    if(!audio?.ctx || !audio.master)return;
    const ac=audio.ctx,t=ac.currentTime;
    if(ctx!==ac){ctx=ac;bus=ac.createGain();filter=ac.createBiquadFilter();filter.type='lowpass';filter.frequency.value=700;bus.gain.value=0;filter.connect(bus);bus.connect(audio.master);next=0;was=false;}
    const running=active&&ac.state==='running';
    if(!running){if(was)bus.gain.setTargetAtTime(0,t,.12);was=false;return;}
    const proximity=Math.min(1,Math.max(0,(depth-1)/5));
    if(!was){bus.gain.setTargetAtTime(.15+proximity*.55,t,.25);next=t+.05;was=true;}
    if(c!==lastCircle||!theme){theme=motifForCircle(c);lastCircle=c;idx=0;beat=0;}
    if(next<t-.2)next=t+.05;
    if(next>t+.12)return;
    bus.gain.setTargetAtTime(.15+proximity*.55,t,.6);
    filter.frequency.setTargetAtTime(700+proximity*2000,t,.8);
    const event=theme[idx],bar=Math.floor(beat/4),scale=MODES[(Math.max(1,c)-1)%MODES.length];
    const d=event.d,m=62+scale[((d%7)+7)%7]+12*Math.floor(d/7);
    note(ac,filter,m,next,.11,Math.min(4.8,Math.max(.6,event.l*1.35)),bar,c);onNote?.(harmonyFor(m,bar,c).m);
    if(idx===0||Math.floor(beat/4)!==Math.floor((beat+event.l)/4)){
      const [root]=progression[bar%progression.length];
      note(ac,filter,38+root,next,.055,3.6,bar,c);
    }
    next+=event.l*1.35;beat+=event.l;idx=(idx+1)%theme.length;
  }};
}

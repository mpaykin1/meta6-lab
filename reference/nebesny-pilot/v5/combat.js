/* =====================================================================
   БОЙ, ВРАГИ, ОРУЖИЕ, ПОДБИРАШКИ — для всех трёх миров
   ===================================================================== */
const VOX=k=>A[k].vs/0.1*1.7;
const segOf=(i,lying)=>SEG[i*2+(lying?1:0)];
const ORDER=[
 {id:'drone_quad',kills:0, ru:'Дрон-квадро',  how:'стая падает с неба (под водой — с поверхности), кружит и стреляет — 2 попадания'},
 {id:'drone_eye', kills:4, ru:'Дрон-глаз',    how:'раскрывается из красного луча — 4 попадания'},
 {id:'ash_worm',  kills:8, ru:'Пепельный червь',how:'выпрыгивает дугой из океана (под водой — со дна) — бей пока виден, не врезайся'},
 {id:'turret',    kills:12,ru:'Турель',       how:'вырастает из острова, крыши или дна — 5 попаданий'},
 {id:'soldier',   kills:16,ru:'Солдаты пустоши',how:'спускаются на парашютах и стреляют — 1 попадание'},
 {id:'strider_s', kills:21,ru:'Шагоход-разведчик',how:'выходит из моря или поднимается из ила — 6 попаданий'},
 {id:'strider_m', kills:27,ru:'Шагоход «Курица»',how:'падает с неба огненным метеором — 10 попаданий'},
 {id:'colossus',  kills:34,ru:'Колосс',       how:'босс: поднимается из глубины — 60 попаданий'}];
const WEAP={cannon:{ru:'Пушки',how:'двойные пушки, автоприцел'},spread:{ru:'Веер',how:'5 пуль веером — для стай'},missile:{ru:'Ракеты',how:'самонаводящиеся ракеты, урон 3'},
  lightning:{ru:'Молния',how:'цепная молния бьёт до 4 врагов сразу'},torpedo:{ru:'Торпеды',how:'под водой пушки сменяются торпедами'}};
const MECH={air:'Над морем: кольца дают ускорение. Нырни в океан — станешь батискафом. Поднимайся выше — улетишь в космос.',
  city:'Сломанный город: не врезайся в дома и землю — взрыв и конец игры. Пролёт впритирку к стене заряжает нитро. На крышах турели.',
  space:'Космос: Земля — шарик внизу. Невесомость: самолёт скользит по инерции. Сбивай астероиды — из них выпадают кристаллы нитро. Отпусти «вверх» — притяжение вернёт домой, вход в атмосферу горит огнём.',
  sea:'Глубина: следи за воздухом (пузырьки). Пузыри от горячих источников и всплытие дают воздух. Сундуки — оружие или сердце, жемчуг — сердце, монеты — очки. Мины и удильщик опасны.'};
const opened=new Set(['drone_quad']);let kills=0,bossNext=34;
const E=[],B=[],O=[],FX=[],DB=[],PU=[],MS=[],AST=[];
const SHIELD=new Set(['under','bulge','portal','meteor','rise','enter','warp']);
const CB=window.CB={E,B,O,FX,DB,PU,boss:null,bossDark:0,reset(){E.length=B.length=O.length=FX.length=DB.length=PU.length=MS.length=AST.length=0;CB.boss=null;CB.bossDark=0;kills=0;bossNext=34;
  opened.clear();opened.add('drone_quad');director.queue.length=0;director.t=3;buildMenuList();overEl.classList.remove('on')}};

/* ---------- звук ---------- */
function snd(fn){if(!AC||muted)return;try{fn(AC,AC.currentTime)}catch(e){}}
let noiseBuf=null;
function noise(ac){if(noiseBuf)return noiseBuf;const n=ac.sampleRate,b=ac.createBuffer(1,n,n),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;return noiseBuf=b}
function boomSnd(size){snd((ac,n)=>{const s=ac.createBufferSource();s.buffer=noise(ac);const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime((zone==='sea'?350:900)*size+200,n);f.frequency.exponentialRampToValueAtTime(70,n+0.6+size*0.5);
  const gg=ac.createGain();gg.gain.setValueAtTime(0.0001,n);gg.gain.linearRampToValueAtTime(0.15*Math.min(1.6,size),n+0.02);gg.gain.exponentialRampToValueAtTime(0.0001,n+0.7+size*0.6);
  s.connect(f).connect(gg).connect(sfxBus);s.start(n);s.stop(n+1.5+size);
  const o=ac.createOscillator(),g2=ac.createGain();o.type='sine';o.frequency.setValueAtTime(90,n);o.frequency.exponentialRampToValueAtTime(38,n+0.5);
  g2.gain.setValueAtTime(0.0001,n);g2.gain.linearRampToValueAtTime(0.22*Math.min(1.5,size),n+0.02);g2.gain.exponentialRampToValueAtTime(0.0001,n+0.8);o.connect(g2).connect(sfxBus);o.start(n);o.stop(n+0.9)})}
let gunT=0;
function gunSnd(f){snd((ac,n)=>{if(n-gunT<0.07)return;gunT=n;const s=ac.createBufferSource();s.buffer=noise(ac);const bf=ac.createBiquadFilter();bf.type='bandpass';bf.frequency.value=f||1400;bf.Q.value=0.8;
  const gg=ac.createGain();gg.gain.setValueAtTime(0.035,n);gg.gain.exponentialRampToValueAtTime(0.0001,n+0.06);s.connect(bf).connect(gg).connect(sfxBus);s.start(n,Math.random());s.stop(n+0.08)})}
function swellSnd(boss){snd((ac,n)=>{const base=boss?[55,82.4,110,130.8]:[196,246.9,293.7];base.forEach((f,i)=>{const o=ac.createOscillator(),gg=ac.createGain();o.type=boss?'sawtooth':'triangle';o.frequency.value=f;
  const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=boss?500:1200;gg.gain.setValueAtTime(0.0001,n);gg.gain.linearRampToValueAtTime(boss?0.05:0.035,n+(boss?2:0.5));gg.gain.exponentialRampToValueAtTime(0.0001,n+(boss?6:2.2));
  o.connect(lp).connect(gg).connect(sfxBus);o.start(n+i*0.06);o.stop(n+(boss?6.2:2.4))})})}
function zapSnd(){snd((ac,n)=>{const o=ac.createOscillator(),gg=ac.createGain();o.type='sine';o.frequency.setValueAtTime(660,n);o.frequency.exponentialRampToValueAtTime(330,n+0.18);
  gg.gain.setValueAtTime(0.03,n);gg.gain.exponentialRampToValueAtTime(0.0001,n+0.2);o.connect(gg).connect(sfxBus);o.start(n);o.stop(n+0.22)})}
function hurtSnd(){if(SND.hurt){play('hurt');return}snd((ac,n)=>{const o=ac.createOscillator(),gg=ac.createGain();o.type='triangle';o.frequency.setValueAtTime(220,n);o.frequency.exponentialRampToValueAtTime(110,n+0.3);
  gg.gain.setValueAtTime(0.06,n);gg.gain.exponentialRampToValueAtTime(0.0001,n+0.35);o.connect(gg).connect(sfxBus);o.start(n);o.stop(n+0.4)})}
function pickSnd(kind){const m={heart:'pickup',nitro:'pickup',air:'bubble',coin:'clink',weapon:'levelup'}[kind]||'levelup';if(SND[m]){play(m,1,kind==='air'?1.3:1);return}snd((ac,n)=>{const seq=kind==='heart'?[523.3,659.3,784]:kind==='nitro'?[392,523.3,784]:kind==='air'?[880,1046.5]:[440,554.4,659.3,880];
  seq.forEach((f,i)=>{const o=ac.createOscillator(),gg=ac.createGain();o.type='triangle';o.frequency.value=f;gg.gain.setValueAtTime(0.0001,n+i*.07);gg.gain.linearRampToValueAtTime(0.07,n+i*.07+.02);gg.gain.exponentialRampToValueAtTime(0.0001,n+i*.07+.5);o.connect(gg).connect(sfxBus);o.start(n+i*.07);o.stop(n+i*.07+.55)})})}
function splashSnd(down){play(down?'descend':'ascend');snd((ac,n)=>{const s=ac.createBufferSource();s.buffer=noise(ac);const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(2200,n);f.frequency.exponentialRampToValueAtTime(300,n+0.8);
  const gg=ac.createGain();gg.gain.setValueAtTime(0.12,n);gg.gain.exponentialRampToValueAtTime(0.0001,n+0.9);s.connect(f).connect(gg).connect(sfxBus);s.start(n);s.stop(n+1)})}

/* ---------- эффекты (спрайт-стакинг) ---------- */
function fireball(x,y,z,r,kind){FX.push({t:'ball',x,y,z,r,life:0,max:kind==='flak'?0.55:kind==='mega'?1.6:0.95,kind:kind||'fire',vz:kind==='mega'?14:22})}
function ring(x,y,z,r,col,max){FX.push({t:'ring',x,y,z:z==null?0.5:z,r,life:0,max:max||0.8,col:col||'255,240,210'})}
function geyser(x,y,h,z0){FX.push({t:'geyser',x,y,z0:z0||0,h:h||60,life:0,max:1.3})}
function smoke(x,y,z,n,s,col){for(let i=0;i<n;i++)FX.push({t:'puff',x:x+rnd(-8,8),y:y+rnd(-8,8),z:z+rnd(-4,6),vz:rnd(8,22),s:(s||6)*rnd(.7,1.3),life:0,max:rnd(1.2,2.2),col})}
function sparks(x,y,z,n,col,sp){for(let i=0;i<n;i++){const a=rnd(0,TAU),b=rnd(-1,1),s=rnd(.4,1)*(sp||150);parts.push({x,y,z,vx:Math.cos(a)*s,vy:Math.sin(a)*s,vz:b*s*.7,l:rnd(.3,.7),ml:.7,gold:col==='gold'?1:0,fire:col==='gold'?0:1})}}
function bubbles(x,y,z,n,sp){for(let i=0;i<n;i++)DB.push({x:x+rnd(-4,4),y:y+rnd(-4,4),z,vx:rnd(-1,1)*(sp||20),vy:rnd(-1,1)*(sp||20),vz:rnd(20,60),c:'#cdeeff',s:rnd(1,2.6),life:0,max:rnd(1,2.5),bub:1})}
function splash(x,y,s){ring(x,y,0.5,10*s,'235,250,255',0.9);ring(x,y,0.5,5*s,'200,235,255',0.6);
  for(let i=0;i<14*s;i++){const a=rnd(0,TAU),v=rnd(20,60)*s;DB.push({x,y,z:1,vx:Math.cos(a)*v*.5,vy:Math.sin(a)*v*.5,vz:rnd(40,90)*Math.sqrt(s),c:Math.random()<.5?'#e8f7ff':'#a8d8f5',s:rnd(1,2.2),life:0,max:2,water:1})}}
function silt(x,y,z,s){ring(x,y,z+0.5,12*s,'150,170,150',1.2);smoke(x,y,z+4,Math.round(4*s),8*s,'silt')}
function groundFx(x,y,z,s){if(zone==='sea')silt(x,y,z,s);else if(z<=1)splash(x,y,s);else{ring(x,y,z+0.5,12*s,'200,190,170',0.9);smoke(x,y,z+3,3,7)}}
function debris(x,y,z,id,n,force){const a=A[id];let cols=a&&a.cols;if(!cols)cols=['#555','#844','#a63','#333'];
  for(let i=0;i<n;i++){const ang=rnd(0,TAU),v=rnd(30,110)*(force||1);DB.push({x,y,z,vx:Math.cos(ang)*v,vy:Math.sin(ang)*v,vz:rnd(30,120)*(force||1),c:cols[(Math.random()*cols.length)|0],s:rnd(1.6,3.6)*(id==='colossus'?1.8:1),rot:rnd(0,TAU),vr:rnd(-8,8),life:0,max:4})}}
function explode(e,big){const k=big||1,x=e.x,y=e.y,z=e.z+e.h*0.45;
  if(zone==='sea'){FX.push({t:'bubbleball',x,y,z,r:12*k*e.size,life:0,max:1});bubbles(x,y,z,Math.round(20*k),40);}
  else fireball(x,y,z,10*k*e.size,'fire');
  setTimeout(()=>{if(zone!=='sea')fireball(x+rnd(-6,6)*k,y+rnd(-6,6)*k,z+rnd(0,8)*k,7*k*e.size,'fire')},90);
  debris(x,y,z,e.id,Math.round(12*k*e.size),k);sparks(x,y,z,Math.round(18*k),'fire',160*k);if(zone!=='sea')smoke(x,y,z,Math.round(4*k),7*k);
  if(e.z<=e.base+6)groundFx(x,y,e.base,1.2*k);else ring(x,y,z,22*k,'255,220,160',0.9);
  boomSnd(0.6*k*e.size);shake=Math.max(shake,0.5*k)}
function sampleCols(id){try{const im=IMG[id],a=A[id],c=mk(im.width,im.height),x=c.getContext('2d');x.drawImage(im,0,0);
  const d=x.getImageData(0,0,c.width,Math.min(c.height,a.D)).data,cols=[];for(let i=0;i<d.length&&cols.length<24;i+=4*97)if(d[i+3]>200)cols.push(`rgb(${d[i]},${d[i+1]},${d[i+2]})`);if(cols.length)a.cols=cols}catch(e){}}
for(const k in A)IMG[k].onload=()=>sampleCols(k);

/* ---------- враги ---------- */
const DEF={drone_quad:{hp:2,r:16,size:.8,anim:14},drone_eye:{hp:4,r:13,size:.9,anim:8},ash_worm:{hp:9,r:14,size:1.3},turret:{hp:5,r:20,size:1,anim:6},
 soldier:{hp:1,r:10,size:.6,anim:10},strider_s:{hp:6,r:22,size:1.1,anim:7},strider_m:{hp:10,r:28,size:1.4,anim:6},colossus:{hp:60,r:70,size:3.2,anim:4}};
function mkEnemy(id,x,y,z,base){const d=DEF[id],a=A[id];const e={id,x,y,z,base:base||0,zone,yaw:P.h+Math.PI,hp:d.hp,maxhp:d.hp,r:d.r,size:d.size,st:'enter',t:0,fire:rnd(1.5,3),vx:0,vy:0,vz:0,flash:0,h:a.H*VOX(id),anim:d.anim||8,seed:Math.random()*100};E.push(e);return e}
function ahead(d,side){const[fx,fy]=fwd(P.h);return[P.x+fx*d-fy*side,P.y+fy*d+fx*side]}
function toast(txt){ST.toast={txt,t:0}}
function announce(id){if(opened.has(id))return;opened.add(id);play('rankup',.7);toast(ORDER.find(q=>q.id===id).ru);buildMenuList()}
function roofAt(x,y){const[gz,isl]=groundAt(x,y);let z=gz;if(isl&&isl.city)for(const b of isl.bld){const[wx,wy]=bldWorld(isl,b),c=Math.cos(-(b.yaw+isl.a)),s=Math.sin(-(b.yaw+isl.a)),dx=x-wx-b.lean[0]*b.h,dy=y-wy-b.lean[1]*b.h,lx=dx*c-dy*s,ly=dx*s+dy*c;if(Math.abs(lx)<b.w/2&&Math.abs(ly)<b.d/2)z=Math.max(z,isl.top+b.h)}return z}
function overCity(){const[gz,isl]=groundAt(P.x,P.y);if(isl&&isl.city)return isl;const[x,y]=ahead(300,0);const[g2,i2]=groundAt(x,y);return i2&&i2.city?i2:null}

function spawn(id){
 announce(id);const Z=zone;
 if(Z==='space'&&!['drone_quad','drone_eye'].includes(id))id=Math.random()<.5?'drone_quad':'drone_eye';
 if(Z==='sea'&&id==='soldier')id='drone_eye';if(Z==='sea'&&id==='strider_m')id='strider_s';
 const sb=Z==='sea'?SEABED:0;
 if(id==='drone_quad'){for(let i=0;i<3;i++){const[x,y]=ahead(rnd(300,420),(i-1)*70);
   const e=Z==='air'?mkEnemy(id,x,y,rnd(320,420)+Math.max(0,P.z-60),0):Z==='sea'?mkEnemy(id,x,y,-6,sb):mkEnemy(id,x,y,P.z+rnd(-40,40),P.z);
   e.spin=rnd(5,8)*(Math.random()<.5?-1:1);e.tz=Z==='air'?rnd(55,120)+Math.max(0,P.z-80):Z==='sea'?clamp(P.z+rnd(-60,60),SEABED+40,-30):P.z+rnd(-30,30);e.off=i*2.1;
   if(Z==='space'){e.st='warp';ring(x,y,e.z,30,'160,200,255',.6);if(i===0)play('glitch')}}}
 else if(id==='drone_eye'){const[x,y]=ahead(rnd(260,360),rnd(-120,120));const z=Z==='air'?rnd(70,110)+Math.max(0,P.z-80):Z==='sea'?clamp(P.z+rnd(-40,40),SEABED+40,-30):P.z;
   const e=mkEnemy(id,x,y,z,sb);e.st='portal';e.tz=z;FX.push({t:'beam',x,y,z0:Z==='space'?P.z-150:sb,life:0,max:1.6});play('portal')}
 else if(id==='ash_worm'){const e=mkEnemy(id,0,0,sb-60,sb);e.leaps=rnd(2,4)|0;startLeap(e)}
 else if(id==='turret'){let px,py,pz;const isl=findIsland(Z==='air'&&overCity());
   if(Z==='sea'){[px,py]=ahead(rnd(250,400),rnd(-120,120));pz=SEABED}
   else if(isl){if(isl.roof){[px,py]=isl.roof;pz=isl.roofZ}else{const c=Math.cos(isl.a),s=Math.sin(isl.a);px=isl.x+isl.peak[0]*c-isl.peak[1]*s;py=isl.y+isl.peak[0]*s+isl.peak[1]*c;pz=isl.top}}
   else{spawn(opened.has('strider_s')?'strider_s':'drone_eye');return}
   const e=mkEnemy(id,px,py,pz,pz);e.rise=0;e.isl=isl;if(isl)isl.busy=1;smoke(px,py,pz,8,8,Z==='sea'?'silt':null)}
 else if(id==='soldier'){for(let i=0;i<3;i++){const[x,y]=ahead(rnd(240,380),(i-1)*60+rnd(-20,20));const[gz]=groundAt(x,y);const e=mkEnemy(id,x,y,rnd(260,330)+Math.max(0,P.z-100),gz);e.st='para';e.vz=-rnd(26,34);e.sway=rnd(0,6)}}
 else if(id==='strider_s'){const[x,y]=ahead(rnd(280,380),rnd(-140,140));const e=mkEnemy(id,x,y,sb-A[id].H*VOX(id),sb);e.st='rise';if(Z==='sea')silt(x,y,sb,1.6);else{splash(x,y,1.6);geyser(x,y,50)}}
 else if(id==='strider_m'){const[x,y]=ahead(rnd(380,460),rnd(-120,120));const e=mkEnemy(id,x,y,520+Math.max(0,P.z-100),0);e.st='meteor';e.vz=-260;e.mx=rnd(-60,60);e.my=rnd(-60,60)}
 else if(id==='colossus'){const[x,y]=ahead(560,0);const e=mkEnemy(id,x,y,sb-A[id].H*VOX(id),sb);e.st='bulge';CB.boss=e;swellSnd(true);play('thunder');setTimeout(()=>play('thunder',.8,.8),900);if(Z!=='sea'){shot=3;shotT=0;camLock=true}}
}
function findIsland(city){let best=null,bd=1e9;const[fx,fy]=fwd(P.h);
 for(const [,isl] of islands){if(!isl||isl.busy)continue;const dx=isl.x-P.x,dy=isl.y-P.y,d=Math.hypot(dx,dy);const fw=(dx*fx+dy*fy)/d;
  if(d>140&&d<1000&&fw>0.3&&d<bd&&(!city||isl.city)){bd=d;best=isl}}
 if(best){best.roof=null;if(best.city&&best.bld.length){const b=best.bld[(Math.random()*best.bld.length)|0];const[wx,wy]=bldWorld(best,b);best.roof=[wx+b.lean[0]*b.h,wy+b.lean[1]*b.h];best.roofZ=best.top+b.h}}
 return best}
function startLeap(e){const[cx,cy]=ahead(rnd(170,300),rnd(-60,60)),a=P.h+rnd(-1.2,1.2)+Math.PI/2*(Math.random()<.5?1:-1),L=rnd(260,340);
 e.l0=[cx-Math.sin(a)*L/2,cy+Math.cos(a)*L/2];e.l1=[cx+Math.sin(a)*L/2,cy-Math.cos(a)*L/2];e.lh=e.base<0?rnd(160,300):rnd(90,140);e.lt=-0.35;e.ldur=rnd(2.6,3.2);e.st='leap';e.splashOut=0;
 groundFx(e.l0[0],e.l0[1],e.base,1.4);if(e.base===0)geyser(e.l0[0],e.l0[1],70);zapSnd()}
function wormPt(e,u){u=clamp(u,-0.15,1.15);return[lerp(e.l0[0],e.l1[0],u),lerp(e.l0[1],e.l1[1],u),e.base+e.lh*4*u*(1-u)-8]}
function enemyShoot(e,n,spread,spd,type){const z0=e.z+e.h*0.6;for(let i=0;i<n;i++){
  const lead=Math.hypot(P.x-e.x,P.y-e.y)/(spd||210),[fx,fy]=fwd(P.h),tx=P.x+fx*P.v*lead*0.7,ty=P.y+fy*P.v*lead*0.7,tz=P.z;
  let dx=tx-e.x,dy=ty-e.y,dz=tz-z0;const L=Math.hypot(dx,dy,dz)||1,a=(i-(n-1)/2)*(spread||0);const c=Math.cos(a),s=Math.sin(a);
  const v=(spd||210)*(zone==='sea'?0.7:1);O.push({x:e.x,y:e.y,z:z0,vx:(dx*c-dy*s)/L*v,vy:(dx*s+dy*c)/L*v,vz:dz/L*v,life:0,max:3.2,type:type||'orb',fuse:type==='flak'?L/v*rnd(.85,1):0})}
  zapSnd()}
function radial(e,n,v){const z0=e.z+e.h*0.7;for(let i=0;i<n;i++){const a=i/n*TAU+t;const dz=(P.z-z0)/Math.max(1,Math.hypot(P.x-e.x,P.y-e.y));O.push({x:e.x,y:e.y,z:z0,vx:Math.cos(a)*v,vy:Math.sin(a)*v,vz:dz*v,life:0,max:4,type:'orb'})}}

function killEnemy(e){const i=E.indexOf(e);if(i<0)return;E.splice(i,1);kills++;addScore(e.id==='colossus'?10:1);
 combo=Math.min(combo+1,9);chime();P.boost=Math.min(1.5,P.boost+0.35);
 if(Math.random()<(e.id==='colossus'?1:0.3))dropPickup(e.x,e.y,e.z+e.h*0.5);
 if(e.id==='colossus'){CB.boss=null;camLock=false;bossNext=kills+30;setTimeout(()=>play('victory'),1800);let n=0;const ch=setInterval(()=>{n++;const ox=rnd(-50,50),oy=rnd(-50,50),oz=e.base+rnd(20,180);
   if(zone==='sea')FX.push({t:'bubbleball',x:e.x+ox,y:e.y+oy,z:oz,r:rnd(14,24),life:0,max:1});else fireball(e.x+ox,e.y+oy,oz,rnd(14,24),'fire');debris(e.x+ox,e.y+oy,oz,'colossus',8,1.2);boomSnd(0.8);shake=Math.max(shake,.6);
   if(n>=9){clearInterval(ch);if(zone==='sea')FX.push({t:'bubbleball',x:e.x,y:e.y,z:e.base+90,r:70,life:0,max:1.6});else fireball(e.x,e.y,e.base+90,70,'mega');ring(e.x,e.y,e.base+0.5,160,'255,210,150',1.6);groundFx(e.x,e.y,e.base,4);debris(e.x,e.y,e.base+90,'colossus',60,2.2);boomSnd(2.2);shake=1.4}},180)}
 else if(e.id==='ash_worm'){for(let i=0;i<16;i+=2){const[x,y,z]=wormPt(e,clamp(e.u-i*0.035,0,1));setTimeout(()=>{if(zone==='sea')bubbles(x,y,z,8,40);else fireball(x,y,Math.max(4,z),7,'fire');debris(x,y,z,'ash_worm',5,0.8);if(z<e.base+8)groundFx(x,y,e.base,1)},i*45)}boomSnd(1.1)}
 else if(e.id==='drone_eye'){FX.push({t:'eyepop',x:e.x,y:e.y,z:e.z+e.h*.5,life:0,max:.7});explode(e,1);sparks(e.x,e.y,e.z+e.h*.5,30,'gold',220)}
 else if(e.id==='turret'){if(e.isl)e.isl.busy=0;explode(e,1.2)}
 else explode(e,e.id==='strider_m'?1.7:e.id==='strider_s'?1.3:e.id==='soldier'?0.6:0.9);
 for(const o of ORDER)if(o.id!=='colossus'&&kills>=o.kills&&!opened.has(o.id)){director.queue.push(o.id);break}
 if(kills>=bossNext&&!CB.boss&&zone!=='space'&&!E.some(q=>q.id==='colossus'))director.queue.push('colossus')}
function addScore(n){score+=n;document.getElementById('sc').textContent=score}

const director={t:3,queue:[],last:null};
function updDirector(dt){if(gameOver)return;director.t-=dt;
 const cap=CB.boss?2:Math.min(6,2+Math.floor(kills/6));
 if(director.queue.length&&director.t<=0){spawn(director.queue.shift());director.t=rnd(2.5,4);return}
 const cnt=E.filter(e=>e.id!=='soldier'&&e.id!=='drone_quad').length+Math.ceil(E.filter(e=>e.id==='soldier'||e.id==='drone_quad').length/3);
 if(director.t<=0&&cnt<cap){let av=ORDER.filter(o=>opened.has(o.id)&&o.id!=='colossus').map(o=>o.id);
  if(zone==='space')av=av.filter(i=>i==='drone_quad'||i==='drone_eye');
  let id;do id=av[(Math.random()*av.length)|0];while(av.length>1&&id===director.last);director.last=id;spawn(id);director.t=rnd(2,4)}}

function upEnemy(e,dt){e.t+=dt;e.flash=Math.max(0,e.flash-dt*4);const dx=P.x-e.x,dy=P.y-e.y,dist=Math.hypot(dx,dy),face=Math.atan2(dx,-dy);
 const turn=(k)=>{e.yaw+=angD(face+Math.PI,e.yaw)*ease(k,dt)};
 if((dist>1500||e.zone!==zone)&&e.id!=='colossus'||(e.zone!==zone&&e.id==='colossus')){E.splice(E.indexOf(e),1);if(e.isl)e.isl.busy=0;if(e===CB.boss)CB.boss=null;return}
 switch(e.id){
 case 'drone_quad':
  if(e.st==='enter'||e.st==='warp'){e.z+=(e.tz-e.z)*ease(1.4,dt)-(zone==='air'?30:0)*dt;e.yaw+=e.spin*dt*clamp(Math.abs(e.z-e.tz)/80,0.15,1);
   if(zone==='sea')bubbles(e.x,e.y,e.z,1,10);else parts.push({x:e.x,y:e.y,z:e.z+4,vx:rnd(-6,6),vy:rnd(-6,6),vz:30,l:.35,ml:.35,fire:1});
   if(Math.abs(e.z-e.tz)<12||e.t>3){e.st='fight';ring(e.x,e.y,e.z,14,'255,120,90',.4)}}
  else{const a=t*0.6+e.off,R=60+25*Math.sin(t*.7+e.off),[fx,fy]=fwd(P.h);const tx=P.x+fx*240+Math.cos(a)*R-fy*(e.off-2.1)*30,ty=P.y+fy*240+Math.sin(a)*R*.5+fx*(e.off-2.1)*30;
   e.vx+=(tx-e.x)*1.6*dt-e.vx*1.1*dt;e.vy+=(ty-e.y)*1.6*dt-e.vy*1.1*dt;e.x+=e.vx*dt;e.y+=e.vy*dt;
   const tz=zone==='sea'?clamp(P.z+20*Math.sin(t+e.off),SEABED+30,-20):zone==='space'?P.z+20*Math.sin(t+e.off):clamp(P.z+20*Math.sin(t+e.off),40,P.z+60);
   e.z+=(tz-e.z)*ease(1.2,dt);turn(4);if((e.fire-=dt)<=0){enemyShoot(e,1,0,230);e.fire=rnd(2.2,3.4)}}
  break;
 case 'drone_eye':
  if(e.st==='portal'){if(e.t>1.1){e.st='fight';ring(e.x,e.y,e.z+e.h*.5,30,'255,80,80',.7);sparks(e.x,e.y,e.z+e.h*.5,20,'fire',120)}}
  else{const[fx,fy]=fwd(P.h);const tx=P.x+fx*220+Math.sin(t*.5+e.seed)*90,ty=P.y+fy*220+Math.cos(t*.4+e.seed)*90;e.x+=(tx-e.x)*ease(.6,dt);e.y+=(ty-e.y)*ease(.6,dt);
   e.tz+=(clamp(P.z,zone==='sea'?SEABED+30:30,zone==='sea'?-30:9999)-e.tz)*ease(.4,dt);e.z=e.tz+Math.sin(t*1.3+e.seed)*10;turn(3);if((e.fire-=dt)<=0){enemyShoot(e,3,0.16,240);e.fire=rnd(3,4.2)}}
  break;
 case 'ash_worm':{
  e.lt+=dt/e.ldur;e.u=e.lt;const[hx,hy,hz]=wormPt(e,e.u);e.x=hx;e.y=hy;e.z=hz;
  if(!e.splashOut&&e.u>1.0){e.splashOut=1;groundFx(e.l1[0],e.l1[1],e.base,1.5);if(e.base===0)geyser(e.l1[0],e.l1[1],55)}
  if(ST.inv<=0&&!gameOver)for(let i=0;i<16;i+=2){const[x,y,z]=wormPt(e,e.u-i*0.035);if(z>e.base&&Math.hypot(P.x-x,P.y-y)<16&&Math.abs(P.z-z)<16){hitPlayer(1);break}}
  if(e.u>1.15+16*0.035){e.leaps--;if(e.leaps<=0){E.splice(E.indexOf(e),1);return}e.st='under';e.wait=rnd(1.2,2.4);e.lt=-99}
  if(e.st==='under'){e.wait-=dt;if(e.wait<=0)startLeap(e)}
  break}
 case 'turret':
  if(e.st==='enter'){e.rise=Math.min(1,e.rise+dt/1.8);e.z=e.base-A.turret.H*VOX('turret')*(1-e.rise);if(Math.random()<.5)parts.push({x:e.x+rnd(-14,14),y:e.y+rnd(-14,14),z:e.base+2,vx:rnd(-20,20),vy:rnd(-20,20),vz:rnd(10,40),l:.5,ml:.5,gold:1});
   if(e.rise>=1){e.st='fight';ring(e.x,e.y,e.base+1,30,'255,230,180',.6)}}
  else{turn(1.5);if((e.fire-=dt)<=0&&dist<650){enemyShoot(e,2,0.1,200,'flak');e.fire=rnd(1.8,2.8)}}
  break;
 case 'soldier':
  if(e.st==='para'){e.z+=e.vz*dt;e.x+=Math.sin(t*1.3+e.sway)*8*dt;turn(2);if((e.fire-=dt)<=0&&dist<500){enemyShoot(e,1,0,260,'tracer');e.fire=rnd(1.4,2.2)}
   const gz=roofAt(e.x,e.y);if(e.z<=gz+0.5){if(gz<1){splash(e.x,e.y,0.8);E.splice(E.indexOf(e),1);return}e.st='ground';e.z=gz;e.base=gz}}
  else{turn(2);if((e.fire-=dt)<=0&&dist<500){enemyShoot(e,1,0,260,'tracer');e.fire=rnd(1.4,2.2)}}
  break;
 case 'strider_s': case 'strider_m':
  if(e.st==='rise'){e.z=Math.min(e.base,e.z+dt*(e.h/2.6));
   if(zone==='sea'){if(Math.random()<.4)smoke(e.x+rnd(-14,14),e.y+rnd(-14,14),e.base+4,1,7,'silt')}
   else{for(let i=0;i<3;i++)DB.push({x:e.x+rnd(-14,14)*e.size,y:e.y+rnd(-14,14)*e.size,z:Math.max(2,e.z+e.h*rnd(.3,1)),vx:0,vy:0,vz:-5,c:'#cfeeff',s:1.4,life:0,max:2,water:1});if(Math.random()<.3)ring(e.x,e.y,.5,rnd(16,30)*e.size,'220,240,255',.7)}
   turn(1.5);if(e.z>=e.base){e.st='fight'}}
  else if(e.st==='meteor'){e.z+=e.vz*dt;e.x+=e.mx*dt;e.y+=e.my*dt;e.yaw+=dt*2;for(let i=0;i<4;i++)parts.push({x:e.x+rnd(-10,10),y:e.y+rnd(-10,10),z:e.z+e.h*rnd(.2,.9),vx:rnd(-10,10),vy:rnd(-10,10),vz:rnd(30,70),l:rnd(.4,.8),ml:.8,fire:1});
   if(Math.random()<.6)FX.push({t:'puff',x:e.x,y:e.y,z:e.z+e.h,vz:10,s:9,life:0,max:1.6});
   const[gz]=groundAt(e.x,e.y);if(e.z<=gz){e.z=gz;e.base=gz;e.st='fight';fireball(e.x,e.y,gz+10,26,'fire');if(gz<1){splash(e.x,e.y,3);geyser(e.x,e.y,110)}else smoke(e.x,e.y,gz+4,8,10);ring(e.x,e.y,gz+.5,120,'255,230,200',1.2);boomSnd(1.4);shake=1}}
  else{const sp=e.id==='strider_m'?32:44;if(dist>180){e.x+=Math.sin(face)*sp*dt;e.y-=Math.cos(face)*sp*dt;if(e.base>=0){const[gz]=groundAt(e.x,e.y);e.base=gz;e.z=gz}}turn(1.3);
   if(Math.random()<dt*6){if(zone==='sea')smoke(e.x+rnd(-8,8),e.y+rnd(-8,8),e.base+2,1,5,'silt');else if(e.base<1)ring(e.x+rnd(-8,8),e.y+rnd(-8,8),.5,rnd(6,12)*e.size,'220,240,255',.6)}
   if((e.fire-=dt)<=0&&dist<620){if(e.id==='strider_m')enemyShoot(e,3,0.2,220);else enemyShoot(e,1,0,230);e.fire=rnd(2,3.2)}}
  break;
 case 'colossus':
  if(e.st==='bulge'){CB.bossDark=Math.min(1,CB.bossDark+dt*0.5);if(Math.random()<dt*7)ring(e.x+rnd(-40,40),e.y+rnd(-40,40),e.base+.5,rnd(30,90),zone==='sea'?'150,170,150':'200,230,255',1);shake=Math.max(shake,0.25);
   if(e.t>2.6){e.st='rise';if(zone==='sea')silt(e.x,e.y,e.base,3.5);else{geyser(e.x,e.y,200);splash(e.x,e.y,3.5)}}}
  else if(e.st==='rise'){e.z=Math.min(e.base,e.z+dt*e.h/5);shake=Math.max(shake,0.35);turn(.6);
   if(zone==='sea'){if(Math.random()<.5)smoke(e.x+rnd(-50,50),e.y+rnd(-50,50),e.base+4,1,12,'silt')}
   else{for(let i=0;i<5;i++)DB.push({x:e.x+rnd(-55,55),y:e.y+rnd(-55,55),z:Math.max(4,e.z+e.h*rnd(.2,1)),vx:0,vy:0,vz:-10,c:Math.random()<.5?'#d8f2ff':'#9fd0f0',s:rnd(1.5,2.6),life:0,max:3,water:1});
    if(Math.random()<dt*5)ring(e.x,e.y,.5,rnd(60,110),'220,240,255',1)}if(e.z>=e.base)e.st='fight'}
  else{if(dist>320){e.x+=Math.sin(face)*20*dt;e.y-=Math.cos(face)*20*dt}turn(.5);
   if((e.fire-=dt)<=0){if(Math.random()<.45)radial(e,14,150);else enemyShoot(e,5,0.13,240);e.fire=rnd(2.2,3.2)}}
  break}
}

/* ---------- оружие ---------- */
let gunSide=1,cool=0;
function nearestTarget(cone,maxd){const[fx,fy]=fwd(P.h);let tgt=null,bs=-9;for(const e of E){if((SHIELD.has(e.st)&&e.id!=='ash_worm')||e.st==='under'||e.z+e.h<e.base-1)continue;const dx=e.x-P.x,dy=e.y-P.y,d=Math.hypot(dx,dy);if(d>maxd)continue;const cs=(dx*fx+dy*fy)/d;const sc=cs-d/2500;if(cs>cone&&sc>bs){bs=sc;tgt=e}}
 for(const a of AST){const dx=a.x-P.x,dy=a.y-P.y,d=Math.hypot(dx,dy);if(d>maxd)continue;const cs=(dx*fx+dy*fy)/d,sc=cs-d/2500-0.1;if(cs>cone&&sc>bs){bs=sc;tgt=a}}return tgt}
function curWeapon(){return zone==='sea'?'torpedo':ST.weapon}
function shoot(dt){cool-=dt;if(!CTL.fire||gameOver||cool>0)return;const w=curWeapon();const[fx,fy]=fwd(P.h),c=Math.cos(P.h),s=Math.sin(P.h);
 const tgt=nearestTarget(0.72,700);const v=(w==='torpedo'?300:560)+P.v;
 const aimV=(gx,gy,da0)=>{let vx=Math.sin(P.h+da0)*v,vy=-Math.cos(P.h+da0)*v,vz=0;if(tgt){const tz=tgt.z+(tgt.h||0)*0.5,d=Math.hypot(tgt.x-gx,tgt.y-gy);vz=clamp((tz-P.z)/d,-.8,.8)*v;
   if(!da0){const ta=Math.atan2(tgt.x-gx,-(tgt.y-gy)),da=clamp(angD(ta,P.h),-.45,.45);vx=Math.sin(P.h+da)*v;vy=-Math.cos(P.h+da)*v}}return[vx,vy,vz]};
 if(w==='cannon'||w==='spread'){cool=w==='spread'?0.17:0.11;gunSide=-gunSide;const n=w==='spread'?5:1;
  for(let i=0;i<n;i++){const da=w==='spread'?(i-2)*0.11:0,gx=P.x+(n>1?0:gunSide*9)*c+fx*8,gy=P.y+(n>1?0:gunSide*9)*s+fy*8;const[vx,vy,vz]=aimV(gx,gy,da);B.push({x:gx,y:gy,z:P.z+4,vx,vy,vz,life:0,dmg:1,col:zone==='space'?'150,230,255':'255,236,150'})}
  gunSnd(zone==='space'?2400:1400);parts.push({x:P.x+fx*14,y:P.y+fy*14,z:P.z+4,vx:fx*P.v,vy:fy*P.v,vz:0,l:.06,ml:.06,gold:1})}
 else if(w==='missile'){cool=0.32;gunSide=-gunSide;MS.push({x:P.x+gunSide*10*c,y:P.y+gunSide*10*s,z:P.z+2,h:P.h+gunSide*0.5,vz:0,v:240,life:0,tgt,kind:'missile'});gunSnd(600)}
 else if(w==='torpedo'){cool=0.55;gunSide=-gunSide;play('bubble',.5,.8);MS.push({x:P.x+gunSide*8*c+fx*10,y:P.y+gunSide*8*s+fy*10,z:P.z-2,h:P.h,vz:0,v:200,life:0,tgt,kind:'torpedo'});gunSnd(300);bubbles(P.x,P.y,P.z,4,20)}
 else if(w==='lightning'){cool=0.42;const hit=[];let src=[P.x+fx*16,P.y+fy*16,P.z+4],cur=nearestTarget(0.5,480);
  if(!cur){const ex=[P.x+fx*300,P.y+fy*300,P.z];FX.push({t:'bolt',a:src,b:ex,life:0,max:.18})}
  while(cur&&hit.length<4){hit.push(cur);const tz=cur.z+(cur.h||0)*.5;FX.push({t:'bolt',a:src,b:[cur.x,cur.y,tz],life:0,max:.25});damage(cur,2,cur.x,cur.y,tz);src=[cur.x,cur.y,tz];
   let nx=null,nd=220;for(const e of E){if(hit.includes(e)||SHIELD.has(e.st))continue;const d=Math.hypot(e.x-cur.x,e.y-cur.y,e.z-cur.z);if(d<nd){nd=d;nx=e}}cur=nx}
  if(SND.energy)play('energy',.8,1+Math.random()*.2);else snd((ac,n)=>{const s=ac.createBufferSource();s.buffer=noise(ac);const f=ac.createBiquadFilter();f.type='highpass';f.frequency.value=2500;const gg=ac.createGain();gg.gain.setValueAtTime(0.06,n);gg.gain.exponentialRampToValueAtTime(0.0001,n+0.25);s.connect(f).connect(gg).connect(sfxBus);s.start(n);s.stop(n+0.3)})}
}
function damage(e,n,x,y,z){if(e.ast){hitAsteroid(e,n);return}e.hp-=n;e.flash=1;parts.push({x,y,z,vx:0,vy:0,vz:0,l:.15,ml:.15,gold:1});sparks(x,y,z,3,'gold',80);if(e.hp<=0)killEnemy(e)}
function hitTest(x,y,z){for(const e of E){if(SHIELD.has(e.st)&&e.id!=='ash_worm')continue;if(e.id==='ash_worm'&&e.st==='under')continue;
  if(e.id==='ash_worm'){for(let j=0;j<16;j++){const[wx,wy,wz]=wormPt(e,e.u-j*0.035);if(wz<e.base-4)continue;if(Math.hypot(x-wx,y-wy)<12&&Math.abs(z-wz)<14)return e}}
  else if(Math.hypot(x-e.x,y-e.y)<e.r&&z>e.z-6&&z<e.z+e.h+6&&e.z+e.h>e.base)return e}
 for(const a of AST)if(Math.hypot(x-a.x,y-a.y,z-a.z)<a.r)return a;return null}

/* ---------- игрок: урон, сердца, конец игры ---------- */
function hitPlayer(n){if(ST.inv>0||gameOver)return;ST.hearts-=n;ST.hurt=1;ST.inv=1.2;shake=Math.max(shake,.8);hurtSnd();sparks(P.x,P.y,P.z+4,10,'fire',100);combo=0;
 if(ST.hearts<=0)crash('hearts')}
function crash(why){if(gameOver)return;gameOver=1;overT=0;ST.hearts=Math.max(0,ST.hearts);
 if(zone==='sea'){FX.push({t:'bubbleball',x:P.x,y:P.y,z:P.z,r:26,life:0,max:1.4});bubbles(P.x,P.y,P.z,40,60)}else{fireball(P.x,P.y,P.z+4,24,'fire');setTimeout(()=>fireball(P.x+6,P.y-4,P.z+10,16,'fire'),120);smoke(P.x,P.y,P.z,8,10)}
 debris(P.x,P.y,P.z+4,'drone_quad',26,1.3);sparks(P.x,P.y,P.z+4,40,'fire',200);boomSnd(1.6);play(zone==='sea'?'wreck':'death');shake=1.4;
 if(score>ST.best){ST.best=score;ST.newBest=1;try{localStorage.setItem('np_best',score)}catch(e){}}else ST.newBest=0}

/* ---------- подбирашки: сердца, нитро, оружие, сундуки, жемчуг, монеты, пузыри, кристаллы ---------- */
function dropPickup(x,y,z,kind){if(!kind){const r=Math.random();kind=zone==='sea'?(r<.35?'heart':r<.6?'nitro':'chest'):r<.3?'heart':r<.55?'nitro':['spread','missile','lightning'][(Math.random()*3)|0]}
 PU.push({kind,x,y,z,ph:Math.random()*TAU,life:0})}
let puT=4;
function updPickups(dt){puT-=dt;if(puT<=0&&!gameOver){puT=rnd(5,9);const[x,y]=ahead(rnd(260,420),rnd(-160,160));
  if(zone==='air'){const[gz]=groundAt(x,y);dropPickup(x,y,Math.max(gz+30,clamp(P.z+rnd(-40,40),40,P.z+60)))}
  else if(zone==='space'){PU.push({kind:'crystal',x,y,z:P.z+rnd(-30,30),ph:0,life:0});if(Math.random()<.5)dropPickup(x+40,y,P.z+rnd(-30,30))}
  else{const r=Math.random();PU.push({kind:r<.35?'doubloon':r<.55?'pearl':r<.75?'chest':r<.9?'heart':'nitro',x,y,z:r<.75&&r>=.35?SEABED+2:clamp(P.z+rnd(-40,40),SEABED+20,-20),ph:Math.random()*TAU,life:0})}}
 for(let i=PU.length-1;i>=0;i--){const p=PU[i];p.life+=dt;p.ph+=dt*2;if(p.kind==='air'){p.z+=dt*26;p.x+=Math.sin(p.life*3+p.ph)*6*dt;if(p.z>-2){PU.splice(i,1);continue}}
  const d=Math.hypot(P.x-p.x,P.y-p.y,P.z-(p.z+6));if(d>1600){PU.splice(i,1);continue}
  if(d<(p.kind==='air'?20:24)&&!gameOver){collect(p);PU.splice(i,1)}}}
function collect(p){const k=p.kind;sparks(p.x,p.y,p.z+6,14,'gold',120);ring(p.x,p.y,p.z+6,18,'255,240,180',.5);
 if(k==='heart'||k==='pearl'){ST.hearts=Math.min(ST.maxHearts,ST.hearts+1);pickSnd('heart')}
 else if(k==='nitro'||k==='crystal'){ST.nitro=Math.min(1,ST.nitro+(k==='crystal'?0.25:0.45));pickSnd(k==='crystal'?'coin':'nitro');if(k==='crystal')addScore(1)}
 else if(k==='air'){ST.oxy=Math.min(1,ST.oxy+0.35);pickSnd('air')}
 else if(k==='doubloon'){addScore(2);pickSnd('coin')}
 else if(k==='chest'){const r=Math.random();if(r<.3){ST.hearts=Math.min(ST.maxHearts,ST.hearts+1);pickSnd('heart')}else{const w=['spread','missile','lightning'][(Math.random()*3)|0];setWeapon(w)}addScore(3)}
 else setWeapon(k)}
function setWeapon(w){ST.weapon=w;ST.wT=25;pickSnd('weapon');toast(WEAP[w].ru);ST.seen.add(w);buildMenuList()}

/* ---------- космос: астероиды и невесомость ---------- */
let astT=0;
function updSpace(dt){if(zone!=='space'){AST.length=0;return}astT-=dt;
 if(astT<=0&&AST.length<14){astT=rnd(0.6,1.4);const[x,y]=ahead(rnd(380,620),rnd(-320,320));const v=(Math.random()*4)|0;AST.push({ast:1,v,x,y,z:P.z+rnd(-60,60),vx:rnd(-30,30),vy:rnd(-30,30),vz:rnd(-6,6),yaw:rnd(0,TAU),spin:rnd(-1.5,1.5),sz:rnd(1.4,2.6),hp:3,r:0,h:0})}
 for(let i=AST.length-1;i>=0;i--){const a=AST[i];a.x+=a.vx*dt;a.y+=a.vy*dt;a.z+=a.vz*dt;a.yaw+=a.spin*dt;a.r=P_ROCKS[a.v].W*a.sz*0.5;a.base=-9999;
  if(Math.hypot(a.x-P.x,a.y-P.y)>1300){AST.splice(i,1);continue}
  if(Math.hypot(a.x-P.x,a.y-P.y,a.z-P.z)<a.r+8){hitPlayer(1);hitAsteroid(a,9)}}}
function hitAsteroid(a,n){a.hp-=n;sparks(a.x,a.y,a.z,4,'gold',90);if(a.hp>0)return;const i=AST.indexOf(a);if(i<0)return;AST.splice(i,1);
 debrisRock(a);boomSnd(0.5);addScore(1);for(let k=0;k<(a.sz>2?2:0);k++)AST.push({ast:1,v:(Math.random()*4)|0,x:a.x+rnd(-10,10),y:a.y+rnd(-10,10),z:a.z,vx:rnd(-60,60),vy:rnd(-60,60),vz:rnd(-10,10),yaw:0,spin:rnd(-3,3),sz:a.sz*0.5,hp:1,r:0,h:0});
 PU.push({kind:'crystal',x:a.x,y:a.y,z:a.z,ph:0,life:0})}
function debrisRock(a){for(let i=0;i<14;i++){const ang=rnd(0,TAU),v=rnd(40,120);DB.push({x:a.x,y:a.y,z:a.z,vx:Math.cos(ang)*v,vy:Math.sin(ang)*v,vz:rnd(-60,60),c:Math.random()<.5?'#7d756d':'#5e5852',s:rnd(1.6,3.4),rot:0,vr:rnd(-6,6),life:0,max:2.5,zeroG:1})}ring(a.x,a.y,a.z,20,'200,200,220',.5)}

/* ---------- глубина: воздух, мины, удильщик, декор ---------- */
const SC=360,seaCache=new Map();
const DECOR=[['kelp_tall',9],['kelp_mid',7],['coral_branch_pink',4],['coral_branch_orange',4],['coral_branch_violet',4],['coral_brain',3],['tube_sponge',3],['anemone',3],['sea_fan',3],
 ['column',3],['column_broken',3],['arch',2],['angel_statue',1.5],['street_lamp',2],['gargoyle',1.5],['iron_gate',1],['lancet_window',1.5],['barrel',2],['anchor',1],['hot_vent',2],
 ['cathedral_tower',.5],['galleon',.4],['submarine_wreck',.4],['whale_skeleton',.5]];
const DSUM=DECOR.reduce((s,d)=>s+d[1],0);
function seaCell(i,j){const k=i+','+j;let c=seaCache.get(k);if(c)return c;const r=rng((hash(i,j,91)*1e9)|0);c={items:[],mob:[]};
 const n=4+(r()*5|0);for(let q=0;q<n;q++){let x=r()*DSUM,id=DECOR[0][0];for(const d of DECOR){x-=d[1];if(x<=0){id=d[0];break}}
  c.items.push({id,x:i*SC+r()*SC,y:j*SC+r()*SC,yaw:r()*TAU,ph:r()*8,vt:0})}
 if(r()<.55)c.mob.push({id:'sea_mine',x:i*SC+r()*SC,y:j*SC+r()*SC,z:SEABED+60+r()*260,ph:r()*6,live:1});
 if(r()<.35)c.mob.push({id:'angler',x:i*SC+r()*SC,y:j*SC+r()*SC,z:SEABED+30+r()*60,ph:r()*6,hx:0,hy:0,live:1,cd:0});
 if(r()<.6)c.mob.push({id:r()<.5?'glow_fish_teal':'glow_fish_amber',school:6+(r()*6|0),x:i*SC+r()*SC,y:j*SC+r()*SC,z:SEABED+80+r()*240,ph:r()*6,h:r()*TAU});
 if(r()<.4)c.mob.push({id:r()<.5?'jellyfish_teal':'jellyfish_violet',x:i*SC+r()*SC,y:j*SC+r()*SC,z:SEABED+120+r()*240,ph:r()*6});
 if(r()<.2)c.mob.push({id:'manta',x:i*SC+r()*SC,y:j*SC+r()*SC,z:SEABED+150+r()*150,ph:r()*6,h:r()*TAU});
 if(r()<.25)c.mob.push({id:'eel',x:i*SC+r()*SC,y:j*SC+r()*SC,z:SEABED+20+r()*80,ph:r()*6,h:r()*TAU});
 seaCache.set(k,c);if(seaCache.size>120){for(const kk of seaCache.keys()){seaCache.delete(kk);if(seaCache.size<80)break}}return c}
const SVOX=1.4;
function updSea(dt){if(zone!=='sea')return;if(t-ST.sonar>6){ST.sonar=t;play('sonar',.7);FX.push({t:'sonar',x:P.x,y:P.y,z:P.z,life:0,max:2.2})}
 ST.oxy=Math.max(0,ST.oxy-dt/45);if(ST.oxy<=0){ST.oxyT=(ST.oxyT||0)+dt;if(ST.oxyT>3){ST.oxyT=0;hitPlayer(1)}}
 const i0=Math.floor(P.x/SC),j0=Math.floor(P.y/SC);
 for(let i=i0-1;i<=i0+1;i++)for(let j=j0-1;j<=j0+1;j++){const c=seaCell(i,j);
  for(const it of c.items)if(it.id==='hot_vent'){it.vt-=dt;if(it.vt<=0){it.vt=rnd(1.5,3);PU.push({kind:'air',x:it.x+rnd(-4,4),y:it.y+rnd(-4,4),z:SEABED+40,ph:rnd(0,6),life:0})}}
  for(const m of c.mob){if(m.live===0)continue;
   if(m.id==='sea_mine'){const d=Math.hypot(P.x-m.x,P.y-m.y,P.z-(m.z+20));if(d<30&&!gameOver){m.live=0;FX.push({t:'bubbleball',x:m.x,y:m.y,z:m.z+20,r:30,life:0,max:1.1});bubbles(m.x,m.y,m.z+20,30,70);boomSnd(1.2);shake=1;hitPlayer(1)}
    for(let b=B.length-1;b>=0;b--){}}
   else if(m.id==='angler'){const dx=P.x-m.x,dy=P.y-m.y,d=Math.hypot(dx,dy,P.z-m.z);m.cd-=dt;
    if(d<220){m.hx+=(dx/d*90-m.hx)*ease(2,dt);m.hy+=(dy/d*90-m.hy)*ease(2,dt);m.z+=(P.z-m.z)*ease(1.2,dt)}else{m.hx*=.97;m.hy*=.97}
    m.x+=m.hx*dt;m.y+=m.hy*dt;m.bite=d<30;if(d<26&&m.cd<=0){m.cd=2.5;hitPlayer(1);bubbles(m.x,m.y,m.z,10,40)}}
   else if(m.h!=null){m.x+=Math.sin(m.h)*30*dt;m.y-=Math.cos(m.h)*30*dt;m.h+=Math.sin(t*.4+m.ph)*0.3*dt}}}}
// пули по минам: подрыв
function mineHit(x,y,z){const i0=Math.floor(x/SC),j0=Math.floor(y/SC);const c=seaCache.get(i0+','+j0);if(!c)return false;
 for(const m of c.mob)if(m.live&&(m.id==='sea_mine'||m.id==='angler')&&Math.hypot(x-m.x,y-m.y,z-(m.z+(m.id==='sea_mine'?20:8)))<22){m.live=0;FX.push({t:'bubbleball',x:m.x,y:m.y,z:m.z+20,r:m.id==='sea_mine'?34:18,life:0,max:1.1});bubbles(m.x,m.y,m.z+20,24,70);boomSnd(1);addScore(1);if(m.id==='angler')dropPickup(m.x,m.y,m.z,'heart');return true}return false}

/* ---------- главный шаг боя ---------- */
CB.update=function(dt){
 ST.inv=Math.max(0,ST.inv-dt);ST.hurt=Math.max(0,ST.hurt-dt*2);if(!CB.boss)CB.bossDark=Math.max(0,CB.bossDark-dt*0.3);
 if(ST.toast){ST.toast.t+=dt;if(ST.toast.t>2.6)ST.toast=null}
 if(ST.wT>0){ST.wT-=dt;if(ST.wT<=0)ST.weapon='cannon'}
 updDirector(dt);for(let i=E.length-1;i>=0;i--){const e=E[i];if(e)upEnemy(e,dt)}
 shoot(dt);updPickups(dt);updSpace(dt);updSea(dt);
 for(let i=B.length-1;i>=0;i--){const b=B[i];b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;b.life+=dt;const e=hitTest(b.x,b.y,b.z);let hit=!!e;if(e)damage(e,b.dmg,b.x,b.y,b.z);
  if(!hit&&zone==='sea')hit=mineHit(b.x,b.y,b.z);
  const out=zone==='air'?b.z<0:zone==='sea'?(b.z>0||b.z<SEABED):false;if(hit||b.life>1.1||out){if(!hit&&zone==='air'&&b.z<0)ring(b.x,b.y,.5,3,'230,245,255',.35);B.splice(i,1)}}
 for(let i=MS.length-1;i>=0;i--){const m=MS[i];m.life+=dt;if(m.tgt&&(E.includes(m.tgt)||AST.includes(m.tgt))){const ta=Math.atan2(m.tgt.x-m.x,-(m.tgt.y-m.y));m.h+=clamp(angD(ta,m.h),-3*dt,3*dt);
   m.vz+=(clamp((m.tgt.z+(m.tgt.h||0)*.5-m.z)*2,-200,200)-m.vz)*ease(3,dt)}else{m.tgt=nearestTarget(0.3,600)}
  m.v=Math.min(m.kind==='torpedo'?320:460,m.v+dt*300);m.x+=Math.sin(m.h)*m.v*dt;m.y-=Math.cos(m.h)*m.v*dt;m.z+=m.vz*dt;
  if(m.kind==='torpedo'){if(Math.random()<.7)bubbles(m.x,m.y,m.z,1,6)}else if(Math.random()<.8)FX.push({t:'puff',x:m.x,y:m.y,z:m.z,vz:4,s:3,life:0,max:.9});
  const e=hitTest(m.x,m.y,m.z);let hit=false;if(e){damage(e,3,m.x,m.y,m.z);hit=true}else if(zone==='sea'&&mineHit(m.x,m.y,m.z))hit=true;
  const out=zone==='air'?m.z<0:zone==='sea'?(m.z>0||m.z<SEABED):false;
  if(hit||m.life>3||out){if(zone==='sea'){FX.push({t:'bubbleball',x:m.x,y:m.y,z:m.z,r:9,life:0,max:.7});bubbles(m.x,m.y,m.z,8,40)}else fireball(m.x,m.y,m.z,7,'fire');boomSnd(.4);MS.splice(i,1)}}
 for(let i=O.length-1;i>=0;i--){const o=O[i];o.life+=dt;o.x+=o.vx*dt;o.y+=o.vy*dt;o.z+=o.vz*dt;
  if(o.type==='flak'&&o.life>=o.fuse){fireball(o.x,o.y,o.z,8,'flak');sparks(o.x,o.y,o.z,6,'fire',90);if(Math.hypot(P.x-o.x,P.y-o.y,P.z-o.z)<34)hitPlayer(1);O.splice(i,1);continue}
  if(Math.hypot(P.x-o.x,P.y-o.y,P.z+3-o.z)<13){hitPlayer(1);fireball(o.x,o.y,o.z,5,'flak');O.splice(i,1);continue}
  if(o.life>o.max||(zone==='air'&&o.z<0)){O.splice(i,1)}}
 for(let i=DB.length-1;i>=0;i--){const d=DB[i];d.life+=dt;if(d.bub){d.vz+=20*dt;d.x+=d.vx*dt;d.y+=d.vy*dt;d.z+=d.vz*dt;d.vx*=.97;d.vy*=.97;if(d.z>0||d.life>d.max)DB.splice(i,1);continue}
  if(!d.zeroG)d.vz-=(d.water?160:zone==='sea'?60:190)*dt;d.x+=d.vx*dt;d.y+=d.vy*dt;d.z+=d.vz*dt;const dr=zone==='sea'?.95:.99;d.vx*=dr;d.vy*=dr;if(d.rot!=null)d.rot+=d.vr*dt;
  const fl=zone==='sea'?SEABED:0;if(zone!=='space'&&d.z<=fl){if(!d.water&&zone==='air'&&Math.random()<.35)ring(d.x,d.y,.5,4,'230,245,255',.4);DB.splice(i,1);continue}if(d.life>d.max)DB.splice(i,1)}
 for(let i=FX.length-1;i>=0;i--){const f=FX[i];f.life+=dt;if(f.t==='ball'||f.t==='puff')f.z+=(f.vz||0)*dt*(1-f.life/f.max);if(f.life>f.max)FX.splice(i,1)}
 if(E.length>40)E.splice(0,E.length-40);if(DB.length>600)DB.splice(0,DB.length-600);if(FX.length>260)FX.splice(0,FX.length-260);
};
CB.auto=function(idle){CTL.autoFire=false;CTL.autoNitro=false;if(!idle)return;const best=nearestTarget(-1,700);
 if(best){const want=Math.atan2(best.x-P.x,-(best.y-P.y));steerIn=clamp(angD(want,P.h)*1.3,-0.8,0.8);pitchIn=clamp((best.z+(best.h||0)*.5-P.z)/30,-1,1);CTL.autoFire=Math.abs(angD(want,P.h))<0.5}
 if(zone==='sea'&&ST.oxy<.3)pitchIn=1;if(zone==='air'){const[gz]=groundAt(P.x+Math.sin(P.h)*120,P.y-Math.cos(P.h)*120);if(P.z<gz+60)pitchIn=1}};

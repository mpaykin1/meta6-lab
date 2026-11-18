/* =====================================================================
   НЕБЕСНЫЙ ПИЛОТ v3 — СЛОЙ БОЯ поверх v2 (v2 не переписан).
   Враги — воксельные модели «Пепельного пути» (артефакт a8cc7bde…),
   запечённые в стопки срезов с их родной анимацией (8 кадров).
   ===================================================================== */
(function(){
'use strict';
const A=window.ENEMY_ATLAS, WS=window.WORM_SEGS;
const IMG={};for(const k in A){const im=new Image();im.src=A[k].url;IMG[k]=im}
const SEG=WS.map(s=>{const im=new Image();im.src=s.url;return Object.assign({},s,{im})});
const segOf=(i,lying)=>SEG[i*2+(lying?1:0)];
const VOX=k=>A[k].vs/0.1*1.7;
const rnd=(a,b)=>a+Math.random()*(b-a);

/* ---------- порядок открытия врагов (правило ПОСТЕПЕННО) ---------- */
const ORDER=[
 {id:'drone_quad',kills:0, ru:'Дрон-квадро',  how:'стая падает с неба, кружит и стреляет — 2 попадания'},
 {id:'drone_eye', kills:4, ru:'Дрон-глаз',    how:'раскрывается из красного луча над морем — 4 попадания'},
 {id:'ash_worm',  kills:8, ru:'Пепельный червь',how:'выпрыгивает из океана дугой — бей пока над водой, не врезайся'},
 {id:'turret',    kills:12,ru:'Турель',       how:'вырастает из острова, бьёт зенитными вспышками — 5 попаданий'},
 {id:'soldier',   kills:16,ru:'Солдаты пустоши',how:'спускаются на парашютах и стреляют — 1 попадание'},
 {id:'strider_s', kills:21,ru:'Шагоход-разведчик',how:'выходит из моря, вода стекает с брони — 6 попаданий'},
 {id:'strider_m', kills:27,ru:'Шагоход «Курица»',how:'падает с неба огненным метеором — 10 попаданий'},
 {id:'colossus',  kills:34,ru:'Колосс',       how:'босс: море вскипает, он поднимается из глубины — 60 попаданий'}];
const opened=new Set(['drone_quad']);
let kills=0,bossNext=34;

/* ---------- состояние ---------- */
const CB=window.CB={fire:false,up:false,down:false,enemies:[],bullets:[],orbs:[],fx:[],deb:[],hp:10,maxHp:10,inv:0,dead:0,hurt:0,toast:null,bossDark:0};
const SHIELD=new Set(['under','bulge','portal','meteor','rise','enter']);
const E=CB.enemies,B=CB.bullets,O=CB.orbs,FX=CB.fx,DB=CB.deb;

/* ---------- звук (мягкий, гармоничный; шумы тише) ---------- */
function snd(fn){if(typeof AC==='undefined'||!AC||muted)return;try{fn(AC,AC.currentTime)}catch(e){}}
let noiseBuf=null;
function noise(ac){if(noiseBuf)return noiseBuf;const n=ac.sampleRate,b=ac.createBuffer(1,n,n),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;return noiseBuf=b}
function boomSnd(size){snd((ac,n)=>{const s=ac.createBufferSource();s.buffer=noise(ac);const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(900*size+300,n);f.frequency.exponentialRampToValueAtTime(80,n+0.6+size*0.5);
  const gg=ac.createGain();gg.gain.setValueAtTime(0.0001,n);gg.gain.linearRampToValueAtTime(0.16*Math.min(1.6,size),n+0.02);gg.gain.exponentialRampToValueAtTime(0.0001,n+0.7+size*0.6);
  s.connect(f).connect(gg).connect(master);s.start(n);s.stop(n+1.5+size);
  const o=ac.createOscillator(),g2=ac.createGain();o.type='sine';o.frequency.setValueAtTime(90,n);o.frequency.exponentialRampToValueAtTime(38,n+0.5);
  g2.gain.setValueAtTime(0.0001,n);g2.gain.linearRampToValueAtTime(0.22*Math.min(1.5,size),n+0.02);g2.gain.exponentialRampToValueAtTime(0.0001,n+0.8);o.connect(g2).connect(master);o.start(n);o.stop(n+0.9)})}
let gunT=0;
function gunSnd(){snd((ac,n)=>{if(n-gunT<0.07)return;gunT=n;const s=ac.createBufferSource();s.buffer=noise(ac);const f=ac.createBiquadFilter();f.type='bandpass';f.frequency.value=1400;f.Q.value=0.8;
  const gg=ac.createGain();gg.gain.setValueAtTime(0.035,n);gg.gain.exponentialRampToValueAtTime(0.0001,n+0.06);s.connect(f).connect(gg).connect(master);s.start(n,Math.random());s.stop(n+0.08)})}
function swellSnd(boss){snd((ac,n)=>{const base=boss?[55,82.4,110,130.8]:[196,246.9,293.7];base.forEach((f,i)=>{const o=ac.createOscillator(),gg=ac.createGain();o.type=boss?'sawtooth':'triangle';o.frequency.value=f;
  const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=boss?500:1200;gg.gain.setValueAtTime(0.0001,n);gg.gain.linearRampToValueAtTime(boss?0.05:0.035,n+(boss?2:0.5));gg.gain.exponentialRampToValueAtTime(0.0001,n+(boss?6:2.2));
  o.connect(lp).connect(gg).connect(master);o.start(n+i*0.06);o.stop(n+(boss?6.2:2.4))})})}
function zapSnd(){snd((ac,n)=>{const o=ac.createOscillator(),gg=ac.createGain();o.type='sine';o.frequency.setValueAtTime(660,n);o.frequency.exponentialRampToValueAtTime(330,n+0.18);
  gg.gain.setValueAtTime(0.03,n);gg.gain.exponentialRampToValueAtTime(0.0001,n+0.2);o.connect(gg).connect(master);o.start(n);o.stop(n+0.22)})}
function hurtSnd(){snd((ac,n)=>{const o=ac.createOscillator(),gg=ac.createGain();o.type='triangle';o.frequency.setValueAtTime(220,n);o.frequency.exponentialRampToValueAtTime(110,n+0.3);
  gg.gain.setValueAtTime(0.06,n);gg.gain.exponentialRampToValueAtTime(0.0001,n+0.35);o.connect(gg).connect(master);o.start(n);o.stop(n+0.4)})}

/* ---------- эффекты в стиле спрайт-стакинга ---------- */
// огненный шар: стопка дисков-срезов, ядро→огонь→дым
function fireball(x,y,z,r,kind){FX.push({t:'ball',x,y,z,r,life:0,max:kind==='flak'?0.55:kind==='mega'?1.6:0.95,kind:kind||'fire',vz:kind==='mega'?14:22})}
function ring(x,y,z,r,col,max){FX.push({t:'ring',x,y,z:z||0.5,r,life:0,max:max||0.8,col:col||'255,240,210'})}
function geyser(x,y,h){FX.push({t:'geyser',x,y,h:h||60,life:0,max:1.3})}
function smoke(x,y,z,n,s){for(let i=0;i<n;i++)FX.push({t:'puff',x:x+rnd(-8,8),y:y+rnd(-8,8),z:z+rnd(-4,6),vz:rnd(8,22),s:(s||6)*rnd(.7,1.3),life:0,max:rnd(1.2,2.2)})}
function sparks(x,y,z,n,col,sp){for(let i=0;i<n;i++){const a=rnd(0,TAU),b=rnd(-1,1),s=rnd(.4,1)*(sp||150);parts.push({x,y,z,vx:Math.cos(a)*s,vy:Math.sin(a)*s,vz:b*s*.7,l:rnd(.3,.7),ml:.7,gold:col==='gold'?1:0,fire:col==='gold'?0:1})}}
function splash(x,y,s){ring(x,y,0.5,10*s,'235,250,255',0.9);ring(x,y,0.5,5*s,'200,235,255',0.6);
  for(let i=0;i<14*s;i++){const a=rnd(0,TAU),v=rnd(20,60)*s;DB.push({x,y,z:1,vx:Math.cos(a)*v*.5,vy:Math.sin(a)*v*.5,vz:rnd(40,90)*Math.sqrt(s),c:Math.random()<.5?'#e8f7ff':'#a8d8f5',s:rnd(1,2.2),life:0,max:2,water:1})}}
// воксельные осколки: цвета берутся из самой модели врага
function debris(x,y,z,id,n,force){const im=IMG[id],a=A[id];let cols=a.cols;if(!cols)cols=['#555','#844','#a63','#333'];
  for(let i=0;i<n;i++){const ang=rnd(0,TAU),v=rnd(30,110)*(force||1);DB.push({x,y,z,vx:Math.cos(ang)*v,vy:Math.sin(ang)*v,vz:rnd(30,120)*(force||1),c:cols[(Math.random()*cols.length)|0],s:rnd(1.6,3.6)*(id==='colossus'?1.8:1),rot:rnd(0,TAU),vr:rnd(-8,8),life:0,max:4})}}
function explode(e,big){const k=big||1,x=e.x,y=e.y,z=e.z+e.h*0.45;
  fireball(x,y,z,10*k*e.size,'fire');setTimeout(()=>fireball(x+rnd(-6,6)*k,y+rnd(-6,6)*k,z+rnd(0,8)*k,7*k*e.size,'fire'),90);
  debris(x,y,z,e.id,Math.round(12*k*e.size),k);sparks(x,y,z,Math.round(18*k),'fire',160*k);smoke(x,y,z,Math.round(4*k),7*k);
  if(e.z<6)splash(x,y,1.2*k);else ring(x,y,0.5,22*k,'255,220,160',0.9);
  boomSnd(0.6*k*e.size);shake=Math.max(shake,0.5*k)}
// цвета для осколков из атласа
function sampleCols(id){try{const im=IMG[id],a=A[id],c=mk(im.width,im.height),x=c.getContext('2d');x.drawImage(im,0,0);
  const d=x.getImageData(0,0,c.width,Math.min(c.height,a.D)).data,cols=[];for(let i=0;i<d.length&&cols.length<24;i+=4*97)if(d[i+3]>200)cols.push(`rgb(${d[i]},${d[i+1]},${d[i+2]})`);if(cols.length)a.cols=cols}catch(e){}}
for(const k in IMG)IMG[k].onload=()=>sampleCols(k);

/* ---------- враги ---------- */
const DEF={
 drone_quad:{hp:2,r:16,fly:1,size:.8,anim:14},
 drone_eye:{hp:4,r:13,fly:1,size:.9,anim:8},
 ash_worm:{hp:9,r:14,size:1.3},
 turret:{hp:5,r:20,size:1,anim:6},
 soldier:{hp:1,r:10,fly:1,size:.6,anim:10},
 strider_s:{hp:6,r:22,size:1.1,anim:7},
 strider_m:{hp:10,r:28,size:1.4,anim:6},
 colossus:{hp:60,r:70,size:3.2,anim:4}};
function mkEnemy(id,x,y,z){const d=DEF[id],a=A[id];const e={id,x,y,z,yaw:P.h+Math.PI,hp:d.hp,maxhp:d.hp,r:d.r,size:d.size,st:'enter',t:0,fire:rnd(1.5,3),vx:0,vy:0,vz:0,flash:0,h:a.H*VOX(id),anim:d.anim||8,seed:Math.random()*100};E.push(e);return e}
function ahead(d,side){const[fx,fy]=fwd(P.h);return[P.x+fx*d-fy*side,P.y+fy*d+fx*side]}
function announce(id){if(opened.has(id))return;opened.add(id);const o=ORDER.find(q=>q.id===id);CB.toast={txt:o.ru,t:0};buildMenuList()}

function spawn(id){
 announce(id);
 if(id==='drone_quad'){const n=3;for(let i=0;i<n;i++){const[x,y]=ahead(rnd(300,420),(i-1)*70);const e=mkEnemy(id,x,y,rnd(320,420));e.vz=-rnd(150,190);e.spin=rnd(5,8)*(Math.random()<.5?-1:1);e.tz=rnd(55,120);e.off=i*2.1}}
 else if(id==='drone_eye'){const[x,y]=ahead(rnd(260,360),rnd(-120,120));const e=mkEnemy(id,x,y,rnd(70,110));e.st='portal';e.tz=e.z;FX.push({t:'beam',x,y,life:0,max:1.6});swellSnd()}
 else if(id==='ash_worm'){const e=mkEnemy(id,0,0,-60);e.leaps=rnd(2,4)|0;startLeap(e)}
 else if(id==='turret'){const isl=findIsland();if(!isl){spawn(opened.has('strider_s')?'strider_s':'drone_eye');return}const e=mkEnemy(id,isl.x+isl.px,isl.y+isl.py,isl.top);e.base=isl.top;e.rise=0;e.isl=isl;isl.busy=1;smoke(e.x,e.y,e.base,8,8)}
 else if(id==='soldier'){const n=3;for(let i=0;i<n;i++){const[x,y]=ahead(rnd(240,380),(i-1)*60+rnd(-20,20));const e=mkEnemy(id,x,y,rnd(260,330));e.st='para';e.vz=-rnd(26,34);e.sway=rnd(0,6)}}
 else if(id==='strider_s'){const[x,y]=ahead(rnd(280,380),rnd(-140,140));const e=mkEnemy(id,x,y,-A[id].H*VOX(id));e.st='rise';splash(x,y,1.6);geyser(x,y,50)}
 else if(id==='strider_m'){const[x,y]=ahead(rnd(380,460),rnd(-120,120));const e=mkEnemy(id,x,y,520);e.st='meteor';e.vz=-260;e.mx=rnd(-60,60);e.my=rnd(-60,60)}
 else if(id==='colossus'){const[x,y]=ahead(560,0);const e=mkEnemy(id,x,y,-A[id].H*VOX(id));e.st='bulge';CB.boss=e;swellSnd(true);shot=3;shotT=0;camLock=true}
}
function findIsland(){let best=null,bd=1e9;const[fx,fy]=fwd(P.h);
 for(const [,isl] of islands){if(!isl||isl.busy||!isl.peak)continue;const dx=isl.x-P.x,dy=isl.y-P.y,d=Math.hypot(dx,dy);const fw=(dx*fx+dy*fy)/d;
  if(d>140&&d<1000&&fw>0.3&&d<bd){bd=d;best=isl}}
 if(best){best.px=best.peak[0];best.py=best.peak[1];best.top=best.peak[2]}return best}
function startLeap(e){ // дуга из воды через путь самолёта
 const[cx,cy]=ahead(rnd(170,300),rnd(-60,60)),a=P.h+rnd(-1.2,1.2)+Math.PI/2*(Math.random()<.5?1:-1),L=rnd(260,340);
 e.l0=[cx-Math.sin(a)*L/2,cy+Math.cos(a)*L/2];e.l1=[cx+Math.sin(a)*L/2,cy-Math.cos(a)*L/2];e.lh=rnd(90,140);e.lt=-0.35;e.ldur=rnd(2.6,3.2);e.st='leap';e.splashIn=0;e.splashOut=0;
 splash(e.l0[0],e.l0[1],1.4);geyser(e.l0[0],e.l0[1],70);zapSnd()}
function wormPt(e,u){u=clamp(u,-0.15,1.15);const x=lerp(e.l0[0],e.l1[0],u),y=lerp(e.l0[1],e.l1[1],u),z=e.lh*4*u*(1-u)-8;return[x,y,z]}

function enemyShoot(e,n,spread,spd,type){const z0=e.z+e.h*0.6;for(let i=0;i<n;i++){
  const lead=Math.hypot(P.x-e.x,P.y-e.y)/(spd||210),[fx,fy]=fwd(P.h),tx=P.x+fx*P.v*lead*0.7,ty=P.y+fy*P.v*lead*0.7,tz=P.z;
  let dx=tx-e.x,dy=ty-e.y,dz=tz-z0;const L=Math.hypot(dx,dy,dz)||1,a=(i-(n-1)/2)*(spread||0);const c=Math.cos(a),s=Math.sin(a);
  const ndx=(dx*c-dy*s)/L,ndy=(dx*s+dy*c)/L,ndz=dz/L,v=spd||210;
  O.push({x:e.x,y:e.y,z:z0,vx:ndx*v,vy:ndy*v,vz:ndz*v,life:0,max:3.2,type:type||'orb',fuse:type==='flak'?L/v*rnd(.85,1):0})}
  zapSnd()}
function radial(e,n,v){const z0=e.z+e.h*0.7;for(let i=0;i<n;i++){const a=i/n*TAU+t;const dz=(P.z-z0)/Math.max(1,Math.hypot(P.x-e.x,P.y-e.y));O.push({x:e.x,y:e.y,z:z0,vx:Math.cos(a)*v,vy:Math.sin(a)*v,vz:dz*v,life:0,max:4,type:'orb'})}}

function killEnemy(e,big){e.st='dead';const i=E.indexOf(e);if(i>=0)E.splice(i,1);kills++;score+=e.id==='colossus'?10:1;document.getElementById('sc').textContent=score;
 combo=Math.min(combo+1,9);chime();P.boost=Math.min(1.5,P.boost+0.35);
 if(e.id==='colossus'){CB.boss=null;camLock=false;bossNext=kills+30;let n=0;const ch=setInterval(()=>{n++;const ox=rnd(-50,50),oy=rnd(-50,50),oz=rnd(20,180);
   fireball(e.x+ox,e.y+oy,oz,rnd(14,24),'fire');debris(e.x+ox,e.y+oy,oz,'colossus',8,1.2);boomSnd(0.8);shake=Math.max(shake,.6);
   if(n>=9){clearInterval(ch);fireball(e.x,e.y,90,70,'mega');ring(e.x,e.y,0.5,160,'255,210,150',1.6);splash(e.x,e.y,4);debris(e.x,e.y,90,'colossus',60,2.2);boomSnd(2.2);shake=1.4}},180)}
 else if(e.id==='ash_worm'){for(let i=0;i<16;i+=2){const[x,y,z]=wormPt(e,clamp(e.u-i*0.035,0,1));setTimeout(()=>{fireball(x,y,Math.max(4,z),7,'fire');debris(x,y,z,'ash_worm',5,0.8);if(z<8)splash(x,y,1)},i*45)}boomSnd(1.1)}
 else if(e.id==='drone_eye'){FX.push({t:'eyepop',x:e.x,y:e.y,z:e.z+e.h*.5,life:0,max:.7});explode(e,1);sparks(e.x,e.y,e.z+e.h*.5,30,'gold',220)}
 else if(e.id==='turret'){if(e.isl)e.isl.busy=0;explode(e,1.2);smoke(e.x,e.y,e.z+6,10,9)}
 else explode(e,e.id==='strider_m'?1.7:e.id==='strider_s'?1.3:e.id==='soldier'?0.6:0.9);
 // открытие новых врагов
 for(const o of ORDER)if(o.id!=='colossus'&&kills>=o.kills&&!opened.has(o.id)){director.queue.push(o.id);break}
 if(kills>=bossNext&&!CB.boss&&!E.some(q=>q.id==='colossus')){director.queue.push('colossus')}
}

/* ---------- режиссёр волн ---------- */
const director={t:3,queue:[]};
function avail(){return ORDER.filter(o=>opened.has(o.id)&&o.id!=='colossus').map(o=>o.id)}
function updDirector(dt){if(CB.dead)return;director.t-=dt;
 const cap=CB.boss?2:Math.min(6,2+Math.floor(kills/6));
 if(director.queue.length&&director.t<=0){spawn(director.queue.shift());director.t=rnd(2.5,4);return}
 if(director.t<=0&&E.filter(e=>e.id!=='soldier'&&e.id!=='drone_quad').length+Math.ceil(E.filter(e=>e.id==='soldier'||e.id==='drone_quad').length/3)<cap){
  const av=avail(),last=director.last;let id;do id=av[(Math.random()*av.length)|0];while(av.length>1&&id===last);director.last=id;spawn(id);director.t=rnd(2,4)}}

/* ---------- обновление врагов ---------- */
function upEnemy(e,dt){e.t+=dt;e.flash=Math.max(0,e.flash-dt*4);const dx=P.x-e.x,dy=P.y-e.y,dist=Math.hypot(dx,dy),face=Math.atan2(dx,-dy);
 const turn=(k)=>{e.yaw+=angD(face+Math.PI,e.yaw)*ease(k,dt)};
 if(dist>1500&&e.id!=='colossus'){E.splice(E.indexOf(e),1);if(e.isl)e.isl.busy=0;return}
 switch(e.id){
 case 'drone_quad':
  if(e.st==='enter'){e.z+=(e.tz-e.z)*ease(1.4,dt)-30*dt;e.yaw+=e.spin*dt*clamp((e.z-e.tz)/80,0.15,1);parts.push({x:e.x,y:e.y,z:e.z+4,vx:rnd(-6,6),vy:rnd(-6,6),vz:30,l:.35,ml:.35,fire:1});
   if(e.z<=e.tz+12){e.st='fight';ring(e.x,e.y,e.z,14,'255,120,90',.4)}}
  else{const a=t*0.6+e.off,R=60+25*Math.sin(t*.7+e.off),[fx,fy]=fwd(P.h);const tx=P.x+fx*240+Math.cos(a)*R-fy*(e.off-2.1)*30,ty=P.y+fy*240+Math.sin(a)*R*.5+fx*(e.off-2.1)*30;
   e.vx+=(tx-e.x)*1.6*dt-e.vx*1.1*dt;e.vy+=(ty-e.y)*1.6*dt-e.vy*1.1*dt;e.x+=e.vx*dt;e.y+=e.vy*dt;e.z+=(clamp(P.z+20*Math.sin(t+e.off),40,170)-e.z)*ease(1.2,dt);turn(4);
   if((e.fire-=dt)<=0){enemyShoot(e,1,0,230);e.fire=rnd(2.2,3.4)}}
  break;
 case 'drone_eye':
  if(e.st==='portal'){if(e.t>1.1){e.st='fight';ring(e.x,e.y,e.z+e.h*.5,30,'255,80,80',.7);sparks(e.x,e.y,e.z+e.h*.5,20,'fire',120)}}
  else{const[fx,fy]=fwd(P.h);const tx=P.x+fx*220+Math.sin(t*.5+e.seed)*90,ty=P.y+fy*220+Math.cos(t*.4+e.seed)*90;e.x+=(tx-e.x)*ease(.6,dt);e.y+=(ty-e.y)*ease(.6,dt);
   e.z=e.tz+Math.sin(t*1.3+e.seed)*10;turn(3);if((e.fire-=dt)<=0){enemyShoot(e,3,0.16,240);e.fire=rnd(3,4.2)}}
  break;
 case 'ash_worm':{
  e.lt+=dt/e.ldur;e.u=e.lt;const[hx,hy,hz]=wormPt(e,e.u);e.x=hx;e.y=hy;e.z=hz;
  if(!e.splashOut&&e.u>1.0){e.splashOut=1;splash(e.l1[0],e.l1[1],1.5);geyser(e.l1[0],e.l1[1],55)}
  // тело бьёт самолёт
  if(CB.inv<=0&&!CB.dead)for(let i=0;i<16;i+=2){const[x,y,z]=wormPt(e,e.u-i*0.035);if(z>0&&Math.hypot(P.x-x,P.y-y)<16&&Math.abs(P.z-z)<16){hitPlayer(2);break}}
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
   if(e.z<=0.5){splash(e.x,e.y,0.8);E.splice(E.indexOf(e),1);return}}
  break;
 case 'strider_s': case 'strider_m': {
  const full=0;
  if(e.st==='rise'){e.z=Math.min(0,e.z+dt*(e.h/2.6));for(let i=0;i<3;i++)DB.push({x:e.x+rnd(-14,14)*e.size,y:e.y+rnd(-14,14)*e.size,z:Math.max(2,e.z+e.h*rnd(.3,1)),vx:0,vy:0,vz:-5,c:'#cfeeff',s:1.4,life:0,max:2,water:1});
   if(Math.random()<.3)ring(e.x,e.y,.5,rnd(16,30)*e.size,'220,240,255',.7);turn(1.5);if(e.z>=0){e.st='fight'}}
  else if(e.st==='meteor'){e.z+=e.vz*dt;e.x+=e.mx*dt;e.y+=e.my*dt;e.yaw+=dt*2;for(let i=0;i<4;i++)parts.push({x:e.x+rnd(-10,10),y:e.y+rnd(-10,10),z:e.z+e.h*rnd(.2,.9),vx:rnd(-10,10),vy:rnd(-10,10),vz:rnd(30,70),l:rnd(.4,.8),ml:.8,fire:1});
   if(Math.random()<.6)FX.push({t:'puff',x:e.x,y:e.y,z:e.z+e.h,vz:10,s:9,life:0,max:1.6});
   if(e.z<=0){e.z=0;e.st='fight';fireball(e.x,e.y,10,26,'fire');splash(e.x,e.y,3);geyser(e.x,e.y,110);ring(e.x,e.y,.5,120,'255,230,200',1.2);boomSnd(1.4);shake=1}}
  else{const sp=e.id==='strider_m'?32:44;if(dist>180){e.x+=Math.sin(face)*sp*dt;e.y-=Math.cos(face)*sp*dt}turn(1.3);
   if(Math.random()<dt*6)ring(e.x+rnd(-8,8),e.y+rnd(-8,8),.5,rnd(6,12)*e.size,'220,240,255',.6);
   if((e.fire-=dt)<=0&&dist<620){if(e.id==='strider_m')enemyShoot(e,3,0.2,220);else enemyShoot(e,1,0,230);e.fire=rnd(2,3.2)}}
  break}
 case 'colossus':
  if(e.st==='bulge'){CB.bossDark=Math.min(1,CB.bossDark+dt*0.5);if(Math.random()<dt*7)ring(e.x+rnd(-40,40),e.y+rnd(-40,40),.5,rnd(30,90),'200,230,255',1);shake=Math.max(shake,0.25);
   if(e.t>2.6){e.st='rise';geyser(e.x,e.y,200);splash(e.x,e.y,3.5)}}
  else if(e.st==='rise'){e.z=Math.min(0,e.z+dt*e.h/5);shake=Math.max(shake,0.35);turn(.6);
   for(let i=0;i<5;i++)DB.push({x:e.x+rnd(-55,55),y:e.y+rnd(-55,55),z:Math.max(4,e.z+e.h*rnd(.2,1)),vx:0,vy:0,vz:-10,c:Math.random()<.5?'#d8f2ff':'#9fd0f0',s:rnd(1.5,2.6),life:0,max:3,water:1});
   if(Math.random()<dt*5)ring(e.x,e.y,.5,rnd(60,110),'220,240,255',1);if(e.z>=0)e.st='fight'}
  else{if(dist>320){e.x+=Math.sin(face)*20*dt;e.y-=Math.cos(face)*20*dt}turn(.5);if(Math.random()<dt*4)ring(e.x+rnd(-40,40),e.y+rnd(-40,40),.5,rnd(30,60),'220,240,255',.8);
   if((e.fire-=dt)<=0){if(Math.random()<.45)radial(e,14,150);else enemyShoot(e,5,0.13,240);e.fire=rnd(2.2,3.2)}}
  break}
}

/* ---------- игрок: стрельба, урон ---------- */
let gunSide=1,cool=0;
function shoot(dt){cool-=dt;if(!CB.fire||CB.dead||cool>0)return;cool=0.11;gunSide=-gunSide;
 const[fx,fy]=fwd(P.h),c=Math.cos(P.h),s=Math.sin(P.h),gx=P.x+gunSide*9*c+fx*8,gy=P.y+gunSide*9*s+fy*8;
 // помощь прицеливания: ближайший враг в конусе
 let tgt=null,bs=0.35;for(const e of E){if((SHIELD.has(e.st)&&e.id!=='ash_worm')||e.st==='under'||e.z+e.h<0)continue;const dx=e.x-P.x,dy=e.y-P.y,d=Math.hypot(dx,dy);if(d>700)continue;const cs=(dx*fx+dy*fy)/d;const sc=cs-d/2500;if(cs>0.72&&sc>bs){bs=sc;tgt=e}}
 const v=560+P.v;let vx=fx*v,vy=fy*v,vz=0;
 if(tgt){const tz=tgt.z+tgt.h*0.5,d=Math.hypot(tgt.x-gx,tgt.y-gy);vz=clamp((tz-P.z)/d,-.8,.8)*v;const ta=Math.atan2(tgt.x-gx,-(tgt.y-gy)),da=clamp(angD(ta,P.h),-.45,.45);vx=Math.sin(P.h+da)*v;vy=-Math.cos(P.h+da)*v}
 B.push({x:gx,y:gy,z:P.z+4,vx,vy,vz,life:0});gunSnd();
 parts.push({x:gx+fx*6,y:gy+fy*6,z:P.z+4,vx:fx*P.v,vy:fy*P.v,vz:0,l:.06,ml:.06,gold:1})}
function hitPlayer(n){if(CB.inv>0||CB.dead)return;CB.hp-=n;CB.hurt=1;CB.inv=0.9;shake=Math.max(shake,.8);hurtSnd();sparks(P.x,P.y,P.z+4,10,'fire',100);combo=0;
 if(CB.hp<=0){CB.dead=2.2;fireball(P.x,P.y,P.z,18,'fire');debris(P.x,P.y,P.z,'drone_quad',18,1.2);boomSnd(1.3);smoke(P.x,P.y,P.z,6,8)}}
function respawn(){CB.hp=CB.maxHp;CB.inv=2.5;CB.dead=0;P.z=70;P.vz=0;P.boost=0.6;for(const o of O)o.life=99}

/* ---------- кадр боя ---------- */
CB.update=function(dt){
 if(CB.dead){CB.dead-=dt;if(CB.dead<=0)respawn()}
 CB.inv=Math.max(0,CB.inv-dt);CB.hurt=Math.max(0,CB.hurt-dt*2);if(!CB.boss)CB.bossDark=Math.max(0,CB.bossDark-dt*0.3);
 if(CB.toast){CB.toast.t+=dt;if(CB.toast.t>2.6)CB.toast=null}
 updDirector(dt);for(let i=E.length-1;i>=0;i--){const e=E[i];if(e)upEnemy(e,dt)}
 shoot(dt);
 // пули
 for(let i=B.length-1;i>=0;i--){const b=B[i];b.px=b.x;b.py=b.y;b.pz=b.z;b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;b.life+=dt;let hit=false;
  for(const e of E){if(SHIELD.has(e.st)&&!(e.id==='ash_worm'))continue;if(e.id==='ash_worm'&&e.st==='under')continue;
   if(e.id==='ash_worm'){for(let j=0;j<16;j+=1){const[x,y,z]=wormPt(e,e.u-j*0.035);if(z<-4)continue;if(Math.hypot(b.x-x,b.y-y)<12&&Math.abs(b.z-z)<14){hit=true;break}}}
   else if(Math.hypot(b.x-e.x,b.y-e.y)<e.r&&b.z>e.z-6&&b.z<e.z+e.h+6&&e.z+e.h>0)hit=true;
   if(hit){e.hp--;e.flash=1;parts.push({x:b.x,y:b.y,z:b.z,vx:0,vy:0,vz:0,l:.15,ml:.15,gold:1});sparks(b.x,b.y,b.z,3,'gold',80);if(e.hp<=0)killEnemy(e);break}}
  if(hit||b.life>1.1||b.z<0){if(!hit&&b.z<0)ring(b.x,b.y,.5,3,'230,245,255',.35);B.splice(i,1)}}
 // вражеские снаряды
 for(let i=O.length-1;i>=0;i--){const o=O[i];o.life+=dt;o.x+=o.vx*dt;o.y+=o.vy*dt;o.z+=o.vz*dt;
  if(o.type==='flak'&&o.life>=o.fuse){fireball(o.x,o.y,o.z,8,'flak');sparks(o.x,o.y,o.z,6,'fire',90);if(Math.hypot(P.x-o.x,P.y-o.y,P.z-o.z)<34)hitPlayer(1);O.splice(i,1);continue}
  if(Math.hypot(P.x-o.x,P.y-o.y,P.z+3-o.z)<13){hitPlayer(1);fireball(o.x,o.y,o.z,5,'flak');O.splice(i,1);continue}
  if(o.life>o.max||o.z<0){if(o.z<0)ring(o.x,o.y,.5,6,'230,245,255',.4);O.splice(i,1)}}
 // осколки / брызги
 for(let i=DB.length-1;i>=0;i--){const d=DB[i];d.life+=dt;d.vz-=(d.water?160:190)*dt;d.x+=d.vx*dt;d.y+=d.vy*dt;d.z+=d.vz*dt;d.vx*=.99;d.vy*=.99;if(d.rot!=null)d.rot+=d.vr*dt;
  if(d.z<=0){if(!d.water&&Math.random()<.35)ring(d.x,d.y,.5,4,'230,245,255',.4);DB.splice(i,1);continue}if(d.life>d.max)DB.splice(i,1)}
 for(let i=FX.length-1;i>=0;i--){const f=FX[i];f.life+=dt;if(f.t==='ball'||f.t==='puff')f.z+=(f.vz||0)*dt*(1-f.life/f.max);if(f.life>f.max)FX.splice(i,1)}
 if(E.length>40)E.splice(0,E.length-40);if(DB.length>500)DB.splice(0,DB.length-500);if(FX.length>220)FX.splice(0,FX.length-220);
};

/* автопилот: когда игрок не трогает — летит на врага и стреляет */
CB.auto=function(idle){if(!idle){CB.autoFire=false;return}let best=null,bd=1e9;for(const e of E){if((SHIELD.has(e.st)&&e.id!=='ash_worm')||e.st==='under'||e.z+e.h<0)continue;const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<bd){bd=d;best=e}}
 if(!best){CB.autoFire=false;return}const want=Math.atan2(best.x-P.x,-(best.y-P.y));steerIn=clamp(angD(want,P.h)*1.3,-0.8,0.8);pitchIn=clamp((best.z+best.h*.5-P.z)/30,-1,1);
 CB.autoFire=Math.abs(angD(want,P.h))<0.5&&bd<650};

/* ---------- рисование стопок ---------- */
const tmp={};
function drawStack(id,x,y,z,yaw,frame,alpha,flash,clipZ){const a=A[id],im=IMG[id];if(!im.complete)return;const vx=VOX(id),W=a.W,D=a.D,H=a.H;
 const p0=proj(x,y,z+H*vx*0.5);if(!p0)return;const lod=p0[2]<0.32?2:1,sub=lod>1?1:clamp(Math.ceil(vx*p0[2]*pc.cp*0.9),1,4);
 g.globalAlpha=alpha;
 for(let s=0;s<H;s+=lod){const zs=z+s*vx;if(clipZ!=null&&zs<clipZ)continue;
  for(let q=0;q<sub;q++){const m=planeT(x,y,zs+q*vx/sub);if(!m)continue;
   g.setTransform(m[0],m[1],m[2],m[3],m[4],m[5]);g.rotate(yaw);g.scale(vx*(lod),vx);g.scale(1/lod,1);
   g.drawImage(im,s*W,frame*D,W,D,-W/2,-D/2,W,D)}}
 if(flash>0){g.globalCompositeOperation='lighter';g.globalAlpha=flash*0.6*alpha;
  for(let s=0;s<H;s+=3){const zs=z+s*vx;if(clipZ!=null&&zs<clipZ)continue;const m=planeT(x,y,zs);if(!m)continue;g.setTransform(m[0],m[1],m[2],m[3],m[4],m[5]);g.rotate(yaw);g.scale(vx,vx);g.drawImage(im,s*W,frame*D,W,D,-W/2,-D/2,W,D)}
  g.globalCompositeOperation='source-over'}
 g.globalAlpha=1}
function drawSeg(sg,x,y,z,yaw,alpha){if(!sg.im.complete)return;const vx=VOX('ash_worm'),W=sg.W,D=sg.D,H=sg.H;g.globalAlpha=alpha;
 for(let s=0;s<H;s++){const zs=z-sg.cz*vx+s*vx;if(zs<0)continue;const m=planeT(x,y,zs);if(!m)continue;g.setTransform(m[0],m[1],m[2],m[3],m[4],m[5]);g.rotate(yaw);g.scale(vx,vx);g.drawImage(sg.im,s*W,0,W,D,-sg.cx,-sg.cy,W,D)}g.globalAlpha=1}
function parachute(e){const cz=e.z+e.h+16,R=18;for(let s=0;s<6;s++){const k=1-s/6,m=planeT(e.x,e.y,cz+s*2.2);if(!m)continue;g.setTransform(m[0],m[1],m[2],m[3],m[4],m[5]);g.rotate(e.yaw);
  for(let w=0;w<8;w++){g.fillStyle=w%2?(s>3?'#f3e3c4':'#d9c6a3'):(s>3?'#c8463c':'#9e3029');g.beginPath();g.moveTo(0,0);g.arc(0,0,R*Math.sqrt(k),w/8*TAU,(w+1)/8*TAU);g.fill()}}
 const a=proj(e.x,e.y,e.z+e.h),b=proj(e.x,e.y,cz);if(a&&b){g.setTransform(1,0,0,1,0,0);g.strokeStyle='rgba(60,50,40,.6)';g.lineWidth=1;g.beginPath();for(const d of[-1,1]){const c=proj(e.x+d*R*.8,e.y,cz);if(c){g.moveTo(a[0],a[1]);g.lineTo(c[0],c[1])}}g.stroke()}}

const FIRECOL=f=>f<.12?'255,252,230':f<.3?'255,220,120':f<.55?'255,150,50':f<.75?'200,70,30':'70,62,66';
CB.items=function(items){
 const fade=d=>clamp(1.3-d/2400,0,1);
 for(const e of E){
  if(e.id==='ash_worm'){if(e.st==='under')continue;
   for(let j=15;j>=0;j--){const u=e.u-j*0.035,[x,y,z]=wormPt(e,u);if(z<-20)continue;const[x2,y2,z2]=wormPt(e,u+0.01),dir=Math.atan2(x2-x,-(y2-y)),pitch=Math.atan2(z2-z,Math.hypot(x2-x,y2-y)*1);
    const p=proj(x,y,z);if(!p)continue;const lying=Math.abs(pitch)>0.85,sg=segOf(j,lying);const yaw=dir+Math.PI+(lying&&pitch<0?Math.PI:0);
    items.push({d:p[3]-j*0.01,f:()=>{drawSeg(sg,x,y,z,yaw,fade(p[3]));if(e.flash>0&&j===0){g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='lighter';g.fillStyle=`rgba(255,200,120,${e.flash*.5})`;g.beginPath();g.arc(p[0],p[1],10*p[2],0,TAU);g.fill();g.globalCompositeOperation='source-over'}}})}
   continue}
  const p=proj(e.x,e.y,e.z+e.h*0.5);if(!p)continue;const frame=Math.floor((t*e.anim+e.seed))%8;
  if(e.st==='portal'){items.push({d:p[3],f:()=>{const k=clamp(e.t/1.1,0,1);if(k<0.35)return;g.globalAlpha=1;const sc=k;const save=VOX;drawStack(e.id,e.x,e.y,e.z+(1-k)*e.h*.5,e.yaw+(1-k)*8,frame,k,1-k)}});continue}
  const clip=(e.id==='strider_s'||e.id==='strider_m'||e.id==='colossus')?0:(e.id==='turret'?e.base:null);
  items.push({d:p[3],f:()=>{if(e.id==='soldier'&&e.st==='para')parachute(e);drawStack(e.id,e.x,e.y,e.z,e.yaw,frame,fade(p[3]),e.flash,clip)}});
  // тень на воде
 }
 for(const b of B){const q=proj(b.x,b.y,b.z),q2=proj(b.x-b.vx*0.025,b.y-b.vy*0.025,b.z-b.vz*0.025);if(!q||!q2)continue;
  items.push({d:q[3],f:()=>{g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='lighter';g.strokeStyle='rgba(255,236,150,.95)';g.lineWidth=Math.max(1,q[2]*1.6);g.beginPath();g.moveTo(q2[0],q2[1]);g.lineTo(q[0],q[1]);g.stroke();g.globalCompositeOperation='source-over'}})}
 for(const o of O){const q=proj(o.x,o.y,o.z);if(!q)continue;items.push({d:q[3],f:()=>{g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='lighter';const r=Math.max(1.5,(o.type==='tracer'?2:3.4)*q[2]),pul=1+0.25*Math.sin(t*20+o.x);
  const col=o.type==='flak'?'255,190,90':o.type==='tracer'?'255,240,170':'255,70,90';g.fillStyle=`rgba(${col},.35)`;g.beginPath();g.arc(q[0],q[1],r*2.2*pul,0,TAU);g.fill();g.fillStyle=`rgba(${col},.95)`;g.beginPath();g.arc(q[0],q[1],r,0,TAU);g.fill();g.fillStyle='rgba(255,255,240,.95)';g.fillRect(q[0]-r*.35,q[1]-r*.35,r*.7,r*.7);g.globalCompositeOperation='source-over'}})}
 for(const d of DB){const q=proj(d.x,d.y,d.z);if(!q)continue;items.push({d:q[3],f:()=>{const s=Math.max(1,d.s*q[2]);g.setTransform(1,0,0,1,0,0);
  if(d.water){g.fillStyle=d.c;g.globalAlpha=clamp(1-d.life/d.max,0,1)*0.9;g.fillRect(q[0]-s/2,q[1]-s/2,s,s);g.globalAlpha=1;return}
  // кубик-осколок: 3 среза со сдвигом = маленький воксель
  g.translate(q[0],q[1]);g.rotate(d.rot);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(-s/2,-s/2+s*.35,s,s);g.fillStyle=d.c;g.fillRect(-s/2,-s/2,s,s);g.fillStyle='rgba(255,255,255,.18)';g.fillRect(-s/2,-s/2,s,s*.35)}})}
 for(const f of FX){const fr=f.life/f.max;
  if(f.t==='ball'){const q=proj(f.x,f.y,f.z);if(!q)continue;items.push({d:q[3],f:()=>{const N=f.kind==='mega'?12:8,r=f.r*(0.5+fr*(f.kind==='flak'?1.4:1.1)),fl=f.kind==='flak';
    for(let s=0;s<N;s++){const u=(s+.5)/N*2-1,rr=r*Math.sqrt(1-u*u),m=planeT(f.x,f.y,f.z+u*r*0.9);if(!m)continue;g.setTransform(m[0],m[1],m[2],m[3],m[4],m[5]);
     const ff=clamp(fr+(1-u)*0.12+(fl?0.25:0),0,1);g.globalAlpha=clamp(1.15-fr,0,1);g.fillStyle=`rgb(${FIRECOL(ff)})`;
     g.beginPath();for(let k=0;k<10;k++){const a=k/10*TAU,wob=1+0.16*Math.sin(a*3+f.x+s+t*6);g.lineTo(Math.cos(a)*rr*wob,Math.sin(a)*rr*wob)}g.fill();
     if(fr<.45){g.globalCompositeOperation='lighter';g.fillStyle=`rgba(255,200,90,${(0.45-fr)*0.8})`;g.beginPath();g.arc(0,0,rr*0.6,0,TAU);g.fill();g.globalCompositeOperation='source-over'}}g.globalAlpha=1}})}
  else if(f.t==='puff'){const q=proj(f.x,f.y,f.z);if(!q)continue;items.push({d:q[3],f:()=>{const r=f.s*(0.6+fr*1.4);for(let s=0;s<4;s++){const u=(s+.5)/4*2-1,m=planeT(f.x,f.y,f.z+u*r*.8);if(!m)continue;g.setTransform(m[0],m[1],m[2],m[3],m[4],m[5]);
     g.globalAlpha=(1-fr)*0.55;g.fillStyle=s>2?'#8a8590':'#5d5862';g.beginPath();g.arc(0,0,r*Math.sqrt(1-u*u),0,TAU);g.fill()}g.globalAlpha=1}})}
  else if(f.t==='geyser'){const q=proj(f.x,f.y,f.h*.4);if(!q)continue;items.push({d:q[3],f:()=>{const H=f.h*Math.sin(Math.PI*Math.min(1,fr*1.3)),n=Math.max(4,H/5|0);for(let s=0;s<n;s++){const zz=s/n*H,rr=(10-6*s/n)*(1+fr*.5),m=planeT(f.x,f.y,zz);if(!m)continue;
     g.setTransform(m[0],m[1],m[2],m[3],m[4],m[5]);g.globalAlpha=(1-fr)*0.8;g.fillStyle=s%3?'#d9f2ff':'#ffffff';g.beginPath();g.arc(Math.sin(s+t*9)*1.5,0,rr,0,TAU);g.fill()}g.globalAlpha=1}})}
  else if(f.t==='beam'){const q=proj(f.x,f.y,60);if(!q)continue;items.push({d:q[3]+5,f:()=>{const a=proj(f.x,f.y,0),b=proj(f.x,f.y,200);if(!a||!b)return;g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='lighter';const w=(6+20*Math.sin(Math.PI*fr))*a[2];
     g.fillStyle=`rgba(255,40,60,${0.5*(1-fr)})`;g.beginPath();g.moveTo(a[0]-w,a[1]);g.lineTo(a[0]+w,a[1]);g.lineTo(b[0]+w*.3,b[1]);g.lineTo(b[0]-w*.3,b[1]);g.fill();g.fillStyle=`rgba(255,220,220,${0.7*(1-fr)})`;g.fillRect(a[0]-w*.15,b[1],w*.3,a[1]-b[1]);g.globalCompositeOperation='source-over'}})}
  else if(f.t==='eyepop'){const q=proj(f.x,f.y,f.z);if(!q)continue;items.push({d:q[3]-2,f:()=>{g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='lighter';g.strokeStyle=`rgba(255,60,80,${1-fr})`;g.lineWidth=2;g.beginPath();g.arc(q[0],q[1],(10+fr*60)*q[2],0,TAU);g.stroke();g.globalCompositeOperation='source-over'}})}
 }
};
// кольца-волны на воде рисуются сразу (под всем)
CB.ground=function(){for(const f of FX){if(f.t!=='ring')continue;const fr=f.life/f.max,m=planeT(f.x,f.y,f.z);if(!m)continue;g.setTransform(m[0],m[1],m[2],m[3],m[4],m[5]);
  g.strokeStyle=`rgba(${f.col},${(1-fr)*0.85})`;g.lineWidth=Math.max(1,2.5*(1-fr));g.beginPath();g.arc(0,0,f.r*(0.3+fr),0,TAU);g.stroke()}
 // тени врагов
 g.globalAlpha=0.16;g.fillStyle='#021a55';for(const e of E){if(e.id==='ash_worm'||e.z<0&&e.id!=='colossus')continue;const zz=Math.max(0,e.z),m=planeT(e.x+zz*.4,e.y+zz*.7,0);if(!m)continue;g.setTransform(m[0],m[1],m[2],m[3],m[4],m[5]);g.beginPath();g.ellipse(0,0,e.r*.9,e.r*.7,e.yaw,0,TAU);g.fill()}g.globalAlpha=1};

/* ---------- экранный слой: здоровье, урон, тьма босса, открытие врага ---------- */
CB.overlay=function(){g.setTransform(1,0,0,1,0,0);
 if(CB.bossDark>0){g.fillStyle=`rgba(60,0,20,${CB.bossDark*0.18})`;g.fillRect(0,0,W,H)}
 if(CB.hurt>0||CB.hp<=3){const k=Math.max(CB.hurt,CB.hp<=3?0.35+0.25*Math.sin(t*6):0);const rg=g.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,Math.hypot(W,H)*.6);rg.addColorStop(0,'rgba(255,0,30,0)');rg.addColorStop(1,`rgba(255,20,40,${k*0.55})`);g.fillStyle=rg;g.fillRect(0,0,W,H)}
 // полоска здоровья — только графика
 const x0=Math.round(14/PX*1.2),y0=Math.round(46/PX);for(let i=0;i<CB.maxHp;i++){g.fillStyle=i<CB.hp?(CB.hp<=3?'#ff5a5a':'#7dffb0'):'rgba(255,255,255,.18)';g.fillRect(x0+i*5,y0,4,3)}
 // босс: полоса жизни сверху
 if(CB.boss&&CB.boss.st!=='bulge'){const b=CB.boss,w=Math.min(W*0.6,160),x=(W-w)/2;g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x-1,8,w+2,5);g.fillStyle='#ff3d4a';g.fillRect(x,9,w*b.hp/b.maxhp,3)}
 // мигание неуязвимости — сам самолёт мигает (через альфу всего кадра нельзя), рисуем кольцо щита
 if(CB.inv>0&&!CB.dead){const p=proj(P.x,P.y,P.z);if(p){g.globalCompositeOperation='lighter';g.strokeStyle=`rgba(140,220,255,${0.35+0.25*Math.sin(t*20)})`;g.lineWidth=1;g.beginPath();g.arc(p[0],p[1],20*p[2],0,TAU);g.stroke();g.globalCompositeOperation='source-over'}}
 toastEl.style.opacity=CB.toast?(CB.toast.t<0.3?CB.toast.t/0.3:CB.toast.t>2?(2.6-CB.toast.t)/0.6:1):0;if(CB.toast)toastEl.textContent=CB.toast.txt;
};
CB.hidePlane=()=>CB.dead>0||(CB.inv>0&&Math.sin(t*30)>0.3);

/* ---------- кнопки управления (только иконки) ---------- */
const css=document.createElement('style');css.textContent=`
.cb{position:fixed;bottom:calc(18px + env(safe-area-inset-bottom));width:64px;height:64px;border-radius:50%;border:1px solid rgba(255,255,255,.35);background:rgba(8,28,70,.32);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);touch-action:none;padding:0;display:flex;align-items:center;justify-content:center}
.cb.on{background:rgba(255,140,40,.45);border-color:#ffd27a}
#cbFire{right:18px;width:78px;height:78px}
#cbUp{left:18px;bottom:calc(92px + env(safe-area-inset-bottom));width:56px;height:56px}
#cbDn{left:18px;width:56px;height:56px}
.cb svg{width:56%;height:56%;pointer-events:none}
#cbToast{position:fixed;top:calc(70px + env(safe-area-inset-top));left:50%;transform:translateX(-50%);color:#fff;font:800 17px system-ui,sans-serif;letter-spacing:.06em;text-shadow:0 2px 0 #3a0a0a,0 0 10px rgba(255,60,40,.9),0 0 22px rgba(255,60,40,.6);opacity:0;pointer-events:none;transition:opacity .2s;white-space:nowrap}
#enList{display:none;position:fixed;top:calc(64px + env(safe-area-inset-top));right:68px;max-width:62vw;background:rgba(8,20,50,.82);border:1px solid rgba(255,255,255,.25);border-radius:12px;padding:10px 12px;color:#dfe9ff;font:13px/1.35 system-ui,sans-serif;backdrop-filter:blur(6px)}
#enList b{color:#ffd27a}#enList div{margin:4px 0}
@media (hover:hover) and (pointer:fine){.cb{opacity:.75}}`;document.head.appendChild(css);
const svg=p=>`<svg viewBox="0 0 24 24" fill="#fff">${p}</svg>`;
function btn(id,icon,label){const b=document.createElement('button');b.id=id;b.className='cb';b.setAttribute('aria-label',label);b.innerHTML=svg(icon);document.body.appendChild(b);return b}
const bF=btn('cbFire','<circle cx="12" cy="12" r="3.2"/><path d="M12 1.5v5M12 17.5v5M1.5 12h5M17.5 12h5" stroke="#fff" stroke-width="2.2" fill="none"/><circle cx="12" cy="12" r="7.5" stroke="#fff" stroke-width="1.6" fill="none"/>','Огонь');
const bU=btn('cbUp','<path d="M12 4l8 10h-5v6H9v-6H4z"/>','Вверх');
const bD=btn('cbDn','<path d="M12 20l8-10h-5V4H9v6H4z"/>','Вниз');
function hold(b,key){const on=e=>{e.preventDefault();e.stopPropagation();CB[key]=true;b.classList.add('on');try{b.setPointerCapture(e.pointerId)}catch(_){};if(typeof initAudio==='function')initAudio();lastInput=t};
 const off=e=>{CB[key]=false;b.classList.remove('on')};b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('lostpointercapture',off)}
hold(bF,'fireBtn');hold(bU,'up');hold(bD,'down');
const toastEl=document.createElement('div');toastEl.id='cbToast';document.body.appendChild(toastEl);
// меню: список открытых врагов
const list=document.createElement('div');list.id='enList';document.body.appendChild(list);
function buildMenuList(){list.innerHTML='<div><b>Управление</b>: палец по экрану — поворот и высота; ▲▼ — вверх/вниз; ◎ — огонь (держать); двойной тап — бочка. Клавиатура: ←→/AD поворот, ↑↓/WS высота, Пробел огонь, Shift бочка.</div>'+ORDER.filter(o=>opened.has(o.id)).map(o=>`<div><b>${o.ru}</b> — ${o.how}</div>`).join('')}
buildMenuList();
const menuEl=document.getElementById('menu');const eb=document.createElement('button');eb.className='btn';eb.id='enBtn';eb.setAttribute('aria-label','Враги и управление');eb.textContent='👾';menuEl.insertBefore(eb,menuEl.firstChild);
eb.onclick=()=>{list.style.display=list.style.display==='block'?'none':'block'};
document.getElementById('menuBtn').addEventListener('click',()=>{if(!menuEl.classList.contains('open'))list.style.display='none'});
// клавиатура
addEventListener('keydown',e=>{if(e.key===' '){CB.keyFire=true;e.preventDefault()}if(e.key==='Shift'&&typeof barrel==='function')barrel()});
addEventListener('keyup',e=>{if(e.key===' ')CB.keyFire=false});
Object.defineProperty(CB,'fire',{get(){return !!(CB.fireBtn||CB.keyFire||CB.autoFire)},set(v){}});

// сброс по кнопке ↻
document.getElementById('rst').addEventListener('click',()=>{E.length=0;B.length=0;O.length=0;FX.length=0;DB.length=0;CB.hp=CB.maxHp;CB.dead=0;CB.inv=1;CB.boss=null;CB.bossDark=0;kills=0;bossNext=34;opened.clear();opened.add('drone_quad');director.queue.length=0;director.t=3;buildMenuList()});

// для бота-тестировщика
window.__cb={spawn,get kills(){return kills},E,opened,ORDER,killAll(){for(const e of [...E])killEnemy(e)}};
})();

/* =====================================================================
   КНОПКИ, МЕНЮ, КОНЕЦ ИГРЫ
   ===================================================================== */
const css=document.createElement('style');css.textContent=`
.cb{position:fixed;bottom:calc(18px + env(safe-area-inset-bottom));width:64px;height:64px;border-radius:50%;border:1px solid rgba(255,255,255,.35);background:rgba(8,28,70,.32);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);touch-action:none;padding:0;display:flex;align-items:center;justify-content:center}
.cb.on{background:rgba(255,140,40,.45);border-color:#ffd27a}
#cbFire{right:18px;width:80px;height:80px;background:conic-gradient(rgba(255,210,120,.55) calc(var(--w,0)*1turn),rgba(8,28,70,.32) 0)}
#cbNitro{right:28px;bottom:calc(112px + env(safe-area-inset-bottom));width:60px;height:60px;background:conic-gradient(rgba(90,190,255,.6) calc(var(--n,0)*1turn),rgba(8,28,70,.32) 0)}
#cbNitro.on{border-color:#9be3ff;box-shadow:0 0 18px rgba(90,190,255,.8)}
#cbUp{left:18px;bottom:calc(92px + env(safe-area-inset-bottom));width:58px;height:58px}
#cbDn{left:18px;width:58px;height:58px}
.cb svg{width:56%;height:56%;pointer-events:none}
#cbToast{position:fixed;top:calc(70px + env(safe-area-inset-top));left:50%;transform:translateX(-50%);color:#fff;font:800 17px system-ui,sans-serif;letter-spacing:.06em;text-shadow:0 2px 0 #3a0a0a,0 0 10px rgba(255,60,40,.9),0 0 22px rgba(255,60,40,.6);opacity:0;pointer-events:none;white-space:nowrap}
#enList{display:none;position:fixed;top:calc(64px + env(safe-area-inset-top));right:68px;max-width:66vw;max-height:70vh;overflow:auto;background:rgba(8,20,50,.86);border:1px solid rgba(255,255,255,.25);border-radius:12px;padding:10px 12px;color:#dfe9ff;font:13px/1.35 system-ui,sans-serif;backdrop-filter:blur(6px)}
#enList b{color:#ffd27a}#enList div{margin:5px 0}#enList h4{margin:8px 0 2px;color:#9cf6ea;font-size:13px}
#over{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:radial-gradient(rgba(20,0,10,.35),rgba(10,0,8,.75));opacity:0;pointer-events:none;transition:opacity .6s}
#over.on{opacity:1;pointer-events:auto}
#over .sc{color:#fff;font:800 40px system-ui,sans-serif;display:flex;align-items:center;gap:12px;text-shadow:0 3px 0 rgba(0,0,0,.4)}
#over .sc i{width:26px;height:26px;border-radius:50%;border:5px solid #ffd24a;box-shadow:0 0 14px #ffb400}
#again{width:110px;height:110px;border-radius:50%;border:2px solid #ffd27a;background:rgba(255,140,40,.35);display:flex;align-items:center;justify-content:center;animation:pulse 1.6s ease-in-out infinite}
#again svg{width:54%;height:54%}
@keyframes pulse{50%{transform:scale(1.07);box-shadow:0 0 30px rgba(255,180,80,.7)}}
@media (hover:hover) and (pointer:fine){.cb{opacity:.75}}`;document.head.appendChild(css);
const svg=p=>`<svg viewBox="0 0 24 24" fill="#fff">${p}</svg>`;
const ICON={cannon:'<circle cx="12" cy="12" r="3.2"/><path d="M12 1.5v5M12 17.5v5M1.5 12h5M17.5 12h5" stroke="#fff" stroke-width="2.2" fill="none"/><circle cx="12" cy="12" r="7.5" stroke="#fff" stroke-width="1.6" fill="none"/>',
 spread:'<path d="M12 21L4 5M12 21L8 3M12 21V2M12 21L16 3M12 21L20 5" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/>',
 missile:'<path d="M12 2c3 3 4 7 4 11l-4 3-4-3c0-4 1-8 4-11z"/><path d="M8 13l-3 4 3 1M16 13l3 4-3 1M10 19l2 4 2-4" />',
 lightning:'<path d="M13 1L4 14h6l-2 9 10-14h-6z"/>',torpedo:'<ellipse cx="12" cy="12" rx="9" ry="3.4"/><path d="M3 12l-2-3v6zM20 9h2v6h-2"/>'};
function btn(id,icon,label){const b=document.createElement('button');b.id=id;b.className='cb';b.setAttribute('aria-label',label);b.innerHTML=svg(icon);document.body.appendChild(b);return b}
const bF=btn('cbFire',ICON.cannon,'Огонь'),bN=btn('cbNitro','<path d="M13 2c1 4 6 6 6 12a7 7 0 01-14 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4 1-6 3-9z"/>','Нитро');
const bU=btn('cbUp','<path d="M12 4l8 10h-5v6H9v-6H4z"/>','Вверх'),bD=btn('cbDn','<path d="M12 20l8-10h-5V4H9v6H4z"/>','Вниз');
function hold(b,key){const on=e=>{e.preventDefault();e.stopPropagation();CTL[key]=true;b.classList.add('on');try{b.setPointerCapture(e.pointerId)}catch(_){};initAudio();lastInput=t};
 const off=()=>{CTL[key]=false;b.classList.remove('on')};b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('lostpointercapture',off)}
hold(bF,'fireBtn');hold(bN,'nitroBtn');hold(bU,'up');hold(bD,'down');
const toastEl=document.createElement('div');toastEl.id='cbToast';document.body.appendChild(toastEl);
const list=document.createElement('div');list.id='enList';document.body.appendChild(list);
const overEl=document.createElement('div');overEl.id='over';overEl.innerHTML='<div class="sc"><i></i><span id="ovs">0</span></div><button id="again" aria-label="Начать сначала">'+svg('<path d="M12 4a8 8 0 107.4 5h-2.3A6 6 0 1112 6v3l5-4-5-4z"/>')+'</button>';document.body.appendChild(overEl);
document.getElementById('again').onclick=()=>{reset();initAudio()};
function buildMenuList(){list.innerHTML='<h4>Управление</h4><div>Палец по экрану — поворот и высота. ▲ — вверх (держи долго — космос), ▼ — вниз (над морем — нырнуть батискафом). ◎ — огонь. Пламя — нитро. Двойной тап — бочка.</div><div>Клавиатура: ←→/AD поворот, ↑↓/WS высота, Пробел огонь, E нитро, Shift бочка.</div>'+
 '<h4>Сердца и нитро</h4><div>Сердца (до 5) — жизни; удар врага забирает одно. Врезался в землю или дом — взрыв, конец игры. Нитро — синяя банка, кристаллы и пролёт впритирку к домам.</div>'+
 '<h4>Миры</h4>'+['air','city','space','sea'].filter(z=>z==='air'||ST.seen.has(z)).map(z=>`<div>${MECH[z]}</div>`).join('')+
 '<h4>Оружие</h4>'+['cannon','spread','missile','lightning','torpedo'].filter(w=>w==='cannon'||ST.seen.has(w)).map(w=>`<div><b>${WEAP[w].ru}</b> — ${WEAP[w].how}</div>`).join('')+
 '<h4>Враги</h4>'+ORDER.filter(o=>opened.has(o.id)).map(o=>`<div><b>${o.ru}</b> — ${o.how}</div>`).join('')}
buildMenuList();
{const menuEl=document.getElementById('menu');const eb=document.createElement('button');eb.className='btn';eb.setAttribute('aria-label','Подсказки');eb.textContent='📖';menuEl.insertBefore(eb,menuEl.firstChild);
 eb.onclick=()=>{list.style.display=list.style.display==='block'?'none':'block'};document.getElementById('menuBtn').addEventListener('click',()=>{if(!menuEl.classList.contains('open'))list.style.display='none'})}

/* =====================================================================
   КАДР
   ===================================================================== */
function enterZone(z){if(z===zone)return;const prev=zone;zone=z;if(!ST.seen.has(z)){ST.seen.add(z);toast(z==='space'?'Космос':z==='sea'?'Глубина':z==='city'?'Сломанный город':'');buildMenuList()}
 director.t=Math.max(director.t,2.5);if(z==='sea'){ST.oxy=Math.max(ST.oxy,0.6)}padT=-9;if(prev==='sea'||z==='sea')shotT=99}
let cityNow=null,slipCd=0,prev=performance.now();
function frame(now){
  const dt=Math.min(0.05,(now-prev)/1000);prev=now;t+=dt;

  /* --- управление --- */
  const kx=(keys.ArrowRight||keys.d||keys['в']?1:0)-(keys.ArrowLeft||keys.a||keys['ф']?1:0);
  const ky=(keys.ArrowUp||keys.w||keys['ц']?1:0)-(keys.ArrowDown||keys.s||keys['ы']?1:0);
  if(ptr){steerIn=clamp((ptr.x-innerWidth/2)/(innerWidth*0.26),-1,1);pitchIn=clamp((ptr.sy-ptr.y)/(innerHeight*0.16),-1,1)}
  else if(kx||ky){steerIn=kx;pitchIn=ky}
  else if(t-lastInput>2.5&&rings.length&&zone==='air'){let best=null,bd=1e9;for(const r of rings){const d=Math.hypot(r.x-P.x,r.y-P.y);if(d<bd){bd=d;best=r}}
    const want=Math.atan2(best.x-P.x,-(best.y-P.y));steerIn=clamp(angD(want,P.h)*1.1+Math.sin(t*0.37)*0.15,-0.75,0.75);pitchIn=clamp((best.z-P.z)/30+Math.sin(t*0.5)*0.25,-1,1);
    if(t>nextAutoRoll){barrel();nextAutoRoll=t+9+Math.random()*8}}
  else{steerIn*=0.92;pitchIn*=0.9}
  CB.auto(!ptr&&!kx&&!ky&&!CTL.up&&!CTL.down&&!CTL.fireBtn&&!CTL.keyFire&&t-lastInput>2.5);
  if(CTL.up)pitchIn=1;if(CTL.down)pitchIn=-1;
  if(gameOver){steerIn=0;pitchIn=0}

  /* --- полёт / плавание --- */
  const inSea=P.z<0,sp=zone==='space';
  P.steer+=(steerIn-P.steer)*ease(inSea?3:5,dt);P.roll+=(P.steer-P.roll)*ease(3.5,dt);
  P.h+=P.steer*(inSea?1.2:1.55)*dt;P.boost=Math.max(0,P.boost-dt*0.4);
  const nitroOn=CTL.nitro&&ST.nitro>0.01&&!gameOver;if(nitroOn){ST.nitro=Math.max(0,ST.nitro-dt*0.22);P.nitro=Math.min(1,P.nitro+dt*4)}else P.nitro=Math.max(0,P.nitro-dt*2);
  const climb=inSea?(110+(-P.z)*0.25):(55+Math.max(0,P.z)*0.3);
  let wantVz=pitchIn*climb;if(sp&&pitchIn<0.2)wantVz=Math.min(wantVz,-140-(P.z-SPACE1)*0.5); // притяжение
  P.vz+=(wantVz-P.vz)*ease(inSea?1.8:2.6,dt);P.z+=P.vz*dt;
  if(P.z>ZMAX){P.z=ZMAX;P.vz=Math.min(0,P.vz)}if(P.z<SEABED+14){P.z=SEABED+14;P.vz=Math.max(0,P.vz);if(Math.random()<.2)silt(P.x,P.y,SEABED,.5)}
  const base=inSea?75:sp?150:108,vmax=inSea?160:sp?420:330;
  P.v+=(clamp(base+P.boost*(inSea?60:140)+P.nitro*(inSea?110:200)-(inSea?0:P.vz*1.1),inSea?40:70,vmax+P.nitro*200)-P.v)*ease(1.5,dt);
  if(gameOver)P.v*=0.96;
  const[fx,fy]=fwd(P.h);
  if(sp){P.dx=(P.dx||0)+(fx*P.v-(P.dx||0))*ease(0.8,dt);P.dy=(P.dy||0)+(fy*P.v-(P.dy||0))*ease(0.8,dt);P.x+=P.dx*dt;P.y+=P.dy*dt} // невесомость: скольжение
  else{P.dx=fx*P.v;P.dy=fy*P.v;P.x+=fx*P.v*dt;P.y+=fy*P.v*dt}
  if(P.rolling){P.barrel+=dt*TAU/0.85;const side=Math.sin(P.barrel*0.5)*90*dt;P.x+=Math.cos(P.h)*side;P.y+=Math.sin(P.h)*side;if(P.barrel>=TAU){P.rolling=false;P.barrel=0}}

  /* --- миры и переходы --- */
  const was=zone;
  if(P.z<0)enterZone('sea');else if(P.z>SPACE1*0.92)enterZone('space');else enterZone('air');
  if(was!=='sea'&&zone==='sea'){splash(P.x,P.y,2.4);geyser(P.x,P.y,60);splashSnd();bubbles(P.x,P.y,-4,30,50)}
  if(was==='sea'&&zone!=='sea'){splash(P.x,P.y,2.4);geyser(P.x,P.y,80);splashSnd();P.vz=Math.max(P.vz,90)}
  subT+=((zone==='sea'?1:0)-subT)*ease(4,dt);
  spaceS=sstep(SPACE0,SPACE1,P.z);
  planetRot+=dt*(0.02+Math.hypot(P.dx||0,P.dy||0)*0.00012);
  cityNow=zone==='air'?overCity():null;if(cityNow&&!ST.seen.has('city')){ST.seen.add('city');toast('Сломанный город');buildMenuList()}

  /* --- столкновения с землёй и домами --- */
  if(!gameOver&&zone==='air'){const[gz,isl]=groundAt(P.x,P.y);
    if(gz>0&&P.z<gz+3)crash('ground');
    if(isl&&isl.city&&!gameOver){slipCd-=dt;for(const b of isl.bld){const[wx,wy]=bldWorld(isl,b),hz=P.z-isl.top;if(hz>b.h+4)continue;
      const ox=b.lean[0]*clamp(hz,0,b.h),oy=b.lean[1]*clamp(hz,0,b.h),c=Math.cos(-(b.yaw+isl.a)),s=Math.sin(-(b.yaw+isl.a)),dx=P.x-wx-ox,dy=P.y-wy-oy,lx=dx*c-dy*s,ly=dx*s+dy*c;
      const ex=Math.abs(lx)-b.w/2,ey=Math.abs(ly)-b.d/2;if(ex<2&&ey<2&&hz<b.h){crash('building');break}
      if(Math.max(ex,ey)<16&&slipCd<=0&&hz>4){slipCd=0.6;ST.nitro=Math.min(1,ST.nitro+0.12);sparks(P.x,P.y,P.z,8,'gold',90);addScore(1);ring(P.x,P.y,P.z,14,'156,246,234',.4)}}}}
  if(gameOver){overT+=dt;if(overT>1.3&&!overEl.classList.contains('on')){document.getElementById('ovs').textContent=score;overEl.classList.add('on')}}

  /* --- камера --- */
  const zs=zone==='sea'?'sea':zone==='space'?'space':P.z>260?'high':cityNow?'city':'air',pool=ZONE_SHOTS[zs];
  shotT+=dt;if(!pool.includes(shot)&&!camLock){shot=pool[(Math.random()*pool.length)|0];shotT=0}
  if(!camLock&&shotT>5.5+((shot*1.7)%3.5)){let n;do n=pool[(Math.random()*pool.length)|0];while(pool.length>1&&n===shot);shot=n;shotT=0}
  if(camLock&&shotT>14)camLock=false;
  const S=SHOTS[shot],se=ease(0.75,dt);
  cam.phi=lerp(cam.phi,S.phi,se);cam.cy=lerp(cam.cy,S.cy,se);
  cam.dist=lerp(cam.dist,S.dist*(zone==='sea'?0.8:1)*(1+(P.v-108)*0.0022)+P.nitro*60+Math.sin(t*0.4)*8,se);
  cam.a+=angD(P.h,cam.a)*ease(2.1,dt);
  cam.roll=lerp(cam.roll,-P.roll*0.16*(1.4-Math.sin(cam.phi)),ease(2,dt));
  cam.x+=(P.x+fx*6-cam.x)*ease(5,dt);cam.y+=(P.y+fy*6-cam.y)*ease(5,dt);cam.z+=(P.z-cam.z)*ease(Math.abs(P.vz)>150?7:3.5,dt);
  shake=Math.max(0,shake-dt*1.5);setupProj();

  /* --- звук --- */
  if(AC&&windG){windG.gain.value=(zone==='space'?0.04:zone==='sea'?0.06:0.14)+P.boost*0.2+Math.abs(P.steer)*0.06+P.nitro*0.15;windF.frequency.value=zone==='sea'?160+P.v:300+P.v*2.4;roarG.gain.value=Math.min(0.5,P.boost*0.35+P.nitro*0.3);
    if(t-padT>5){padT=t;pad()}}

  /* --- кольца (только в воздухе) --- */
  if(zone==='air'&&P.z<240){while(rings.length<6)spawnRing()}
  for(let i=rings.length-1;i>=0;i--){const r=rings[i],d=Math.hypot(r.x-P.x,r.y-P.y),dz=Math.abs(r.z-P.z);
    if(d<20&&dz<18&&!gameOver){rings.splice(i,1);addScore(1);combo=Math.min(combo+1,9);P.boost=Math.min(1.5,P.boost+0.75);chime();shake=0.7;
      for(let j=0;j<26;j++){const a=Math.random()*TAU,b=Math.random()*TAU,s=30+Math.random()*80;
        parts.push({x:r.x,y:r.y,z:r.z,vx:Math.cos(a)*s+fx*P.v*.6,vy:Math.sin(a)*s+fy*P.v*.6,vz:Math.sin(b)*s*.6,l:0.8,ml:0.8,gold:1})}}
    else if(d>1100||zone!=='air'){rings.splice(i,1);combo=0}}

  CB.update(dt);

  /* --- шлейф: огонь / пузыри / плазма входа в атмосферу --- */
  const c0=Math.cos(P.h),s0=Math.sin(P.h),bc=Math.cos(P.barrel),bs=Math.sin(P.barrel);
  if(!gameOver){if(zone==='sea'){if(Math.random()<.6+P.nitro)bubbles(P.x-fx*22,P.y-fy*22,P.z+2,1+(P.nitro>0?2:0),12)}
  else{const burn=0.55+P.boost*0.9+Math.max(0,-P.vz)*0.003+P.nitro*1.4;
    for(const e of[-1.6,1.6]){const ex=e*bc,ez=e*bs;const wx=P.x+ex*c0-13*s0,wy=P.y+ex*s0+13*c0,wz=P.z+4+ez;const n=1+Math.round(burn*2);
      for(let j=0;j<n;j++){const l=0.18+burn*0.32+Math.random()*0.12;parts.push({x:wx-fx*j*2,y:wy-fy*j*2,z:wz,vx:-fx*40+(Math.random()-.5)*14,vy:-fy*40+(Math.random()-.5)*14,vz:(Math.random()-.5)*8,l,ml:l,fire:1,blue:P.nitro>0.3?1:0})}
      if(zone==='air'&&Math.random()<0.25+P.boost*0.3)parts.push({x:wx,y:wy,z:wz,vx:(Math.random()-.5)*8,vy:(Math.random()-.5)*8,vz:6,l:1.3,ml:1.3,smoke:1})}
    if(P.vz<-180&&P.z>250&&P.z<SPACE1)for(let j=0;j<4;j++)parts.push({x:P.x+rnd(-10,10)+fx*14,y:P.y+rnd(-10,10)+fy*14,z:P.z+rnd(-4,8),vx:rnd(-20,20),vy:rnd(-20,20),vz:rnd(40,120),l:.4,ml:.4,fire:1,reentry:1})}}
  const alt=P.z+Math.sin(t*1.7)*1.4;
  for(let s=0;s<2;s++){const sx=(s?13:-13)*bc,sz=(s?13:-13)*bs;
    if(zone!=='sea')trails[s].push({x:P.x+sx*c0,y:P.y+sx*s0,z:alt+5+sz+(s?-1:1)*P.roll*3,t});
    while(trails[s].length&&(t-trails[s][0].t>1.5||zone==='sea'))trails[s].shift()}

  /* ===== РЕНДЕР ===== */
  const under=cam.z<0?1:0,dark=clamp(-P.z/440,0,1);
  const PR=lerp(Math.max(W,H)*2.6,Math.min(W,H)*0.3,Math.pow(spaceS,0.7)),PCX=W/2,PCY=lerp(H*0.62+PR*0.6,H*0.62,spaceS);
  if(gl){gl.uniform2f(U.uRes,W,H);gl.uniform2f(U.uC,pc.cx,pc.cy);gl.uniform2f(U.uPC,PCX,PCY);gl.uniform3f(U.uT,cam.x,cam.y,cam.z);gl.uniform1f(U.uA,cam.a);
    gl.uniform1f(U.uPhi,cam.phi);gl.uniform1f(U.uDist,cam.dist);gl.uniform1f(U.uF,F);gl.uniform1f(U.uTime,t);gl.uniform1f(U.uRoll,cam.roll);
    gl.uniform1f(U.uSpace,spaceS);gl.uniform1f(U.uUnder,under);gl.uniform1f(U.uPR,PR);gl.uniform1f(U.uRot,planetRot);gl.uniform1f(U.uDark,dark);gl.drawArrays(gl.TRIANGLES,0,3)}
  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);if(!gl){g.fillStyle=under?'#062538':'#1b58c6';g.fillRect(0,0,W,H)}

  const items=[];
  if(!under&&spaceS<0.55){
    const clipOn=spaceS>0.02;if(clipOn){g.save();g.beginPath();g.arc(PCX,PCY,PR,0,TAU);g.clip()}
    const far=lerp(2400,800,clamp((cam.phi-0.3)/0.9,0,1))*(1+Math.max(0,cam.z)/350);
    const vcx=cam.x+fx*far*0.42,vcy=cam.y+fy*far*0.42,Rv=Math.min(far*0.62+300,4200);
    const vis=[];
    for(let i=Math.floor((vcx-Rv)/IC);i<=Math.floor((vcx+Rv)/IC);i++)for(let j=Math.floor((vcy-Rv)/IC);j<=Math.floor((vcy+Rv)/IC);j++){
      const isl=islandAt(i,j);if(!isl)continue;const p=proj(isl.x,isl.y,0);if(!p)continue;const hs=isl.size*0.5*p[2]+30;
      if(p[0]>-hs&&p[0]<W+hs&&p[1]>-hs&&p[1]<H+hs*1.2)vis.push([p[3],isl,p[2]])}
    vis.sort((a,b)=>b[0]-a[0]);
    let built=0;
    for(const[,isl,k]of vis){const h2=isl.size/2;let m=planeT(isl.x,isl.y,0);if(!m)continue;
      const lod=k<0.35,tiny=k<0.12;g.globalAlpha=clamp(1.25-m[7]/(2600+Math.max(0,cam.z)*3),0,1);
      if(tiny||(!isl.sh&&built>=3)){ // далёкий остров: простые формы без холстов
        g.setTransform(m[0],m[1],m[2],m[3],m[4],m[5]);g.rotate(isl.a);g.fillStyle='rgba(120,215,250,.55)';blob(g,0,0,isl.R*1.2,isl.ph,1.05);g.fill();
        for(const tr of isl.tiers){if(isl.tiers.length>3&&tr!==isl.tiers[0]&&tr!==isl.tiers[1]&&tr!==isl.tiers[isl.tiers.length-1])continue;const mm=planeT(isl.x,isl.y,tr.ztop);if(!mm)continue;g.setTransform(mm[0],mm[1],mm[2],mm[3],mm[4],mm[5]);g.rotate(isl.a);g.fillStyle=tr.top;blob(g,tr.ox,tr.oy,isl.R*tr.k,tr.p2,tr.amp);g.fill()}
        if(isl.city&&k>0.04){g.fillStyle='#0e2334';for(const b of isl.bld){const mm=planeT(isl.x,isl.y,isl.top+b.h);if(!mm)continue;g.setTransform(mm[0],mm[1],mm[2],mm[3],mm[4],mm[5]);g.rotate(isl.a);g.translate(b.lx,b.ly);g.rotate(b.yaw);g.fillRect(-b.w/2,-b.d/2,b.w,b.d)}}
        continue}
      if(!isl.sh){islandCanvases(isl);built++}
      g.setTransform(m[0],m[1],m[2],m[3],m[4],m[5]);g.rotate(isl.a);g.drawImage(isl.sh,-h2,-h2);
      let z=0;for(let ti=0;ti<isl.tiers.length;ti++){const tr=isl.tiers[ti];for(let s=0;s<tr.h;s++){z+=1.6;const top=s===tr.h-1;if(lod&&!top)continue;if(tiny&&ti<isl.tiers.length-1)continue;
        m=planeT(isl.x,isl.y,z);if(!m)break;g.setTransform(m[0],m[1],m[2],m[3],m[4],m[5]);g.rotate(isl.a);g.drawImage(top?tr.L:tr.D,-h2,-h2)}}
      // дома сломанного города
      if(isl.city&&k>0.07){for(const b of isl.bld){if(!b.img)b.img=buildingImg(b);const[wx,wy]=bldWorld(isl,b);const p=proj(wx,wy,isl.top+b.h*.5);if(!p)continue;
        items.push({d:p[3],f:()=>drawBuilding(isl,b,wx,wy,k)})}}}
    g.globalAlpha=1;g.setTransform(1,0,0,1,0,0);
    // облака
    const cl=[],wind=t*7;
    if(cam.z<900)for(let i=Math.floor((vcx-wind-Rv)/CC);i<=Math.floor((vcx-wind+Rv)/CC);i++)for(let j=Math.floor((vcy-Rv)/CC);j<=Math.floor((vcy+Rv)/CC);j++){
      if(hash(i,j,7)>0.4)continue;const c=CLOUDS[(hash(i,j,8)*CLOUDS.length)|0];
      const wx=i*CC+CC*hash(i,j,9)+wind,wy=j*CC+CC*hash(i,j,10),z=58+hash(i,j,11)*40+Math.sin(t*0.6+i+j)*2;
      const p=proj(wx,wy,z);if(!p)continue;const hs=c.size*p[2];
      if(p[0]>-hs&&p[0]<W+hs&&p[1]>-hs*2&&p[1]<H+hs)cl.push({p,c,wx,wy,z,rot:hash(i,j,12)*TAU})}
    g.globalAlpha=0.15;
    for(const o of cl){const m=planeT(o.wx+o.z*0.4,o.wy+o.z*0.7,0);if(!m)continue;g.setTransform(m[0],m[1],m[2],m[3],m[4],m[5]);g.rotate(o.rot);g.drawImage(o.c.shd,-o.c.size/2,-o.c.size/2)}
    if(!gameOver&&zone==='air'){const[gz]=groundAt(P.x,P.y);g.globalAlpha=clamp(0.42-(P.z-gz)*0.0018,0.08,0.4);const m=planeT(P.x+(P.z-gz)*0.4,P.y+(P.z-gz)*0.7,gz);
      if(m){g.setTransform(m[0],m[1],m[2],m[3],m[4],m[5]);g.rotate(P.h);g.scale(Math.max(0.15,Math.abs(bc)),1);g.drawImage(JSH,-JS/2,-JS/2)}}
    g.globalAlpha=1;CB.ground();
    for(const o of cl)items.push({d:o.p[3],f:()=>{const k=o.p[2],B=stackBasis(k,2.4);const hs=o.c.size/2,n=o.c.sl.length,lod=k<0.3;
      const dd=Math.hypot(o.p[0]-pc.cx,o.p[1]-pc.cy);g.globalAlpha=(dd<hs*k&&Math.abs(o.z-P.z)<30?0.45:0.96)*clamp(1.3-o.p[3]/2400,0,1);
      for(let s=0;s<n;s++){if(lod&&s%3)continue;g.setTransform(B.a,B.b,B.c,B.d,Math.round(o.p[0]+B.ux*s),Math.round(o.p[1]+B.uy*s));g.rotate(o.rot-cam.a);g.drawImage(o.c.sl[s],-hs,-hs)}g.globalAlpha=1}});
    if(clipOn){g.restore()}
  }
  if(under)seaItems(items);
  if(zone==='space'||spaceS>0.3)spaceItems(items);

  // инверсионный след
  g.setTransform(1,0,0,1,0,0);
  for(const tr of trails){let pp=null;for(let i=0;i<tr.length;i++){const b=tr[i],q=proj(b.x,b.y,b.z);
    if(pp&&q){const k2=1-(t-b.t)/1.5;g.strokeStyle=`rgba(255,255,255,${(k2*0.85).toFixed(3)})`;g.lineWidth=Math.max(1,q[2]*1.1);g.beginPath();g.moveTo(pp[0],pp[1]);g.lineTo(q[0],q[1]);g.stroke()}pp=q}}
  // частицы
  for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.l-=dt;if(p.l<=0){parts.splice(i,1);continue}p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.vx*=0.95;p.vy*=0.95}
  if(parts.length>1400)parts.splice(0,parts.length-1400);
  for(const p of parts){if(!p.smoke)continue;const q=proj(p.x,p.y,p.z);if(!q)continue;const f=p.l/p.ml,s=Math.max(1,(5-3*f)*q[2]*1.3);g.fillStyle=`rgba(70,72,84,${(f*0.22).toFixed(3)})`;g.fillRect(q[0]-s/2,q[1]-s/2,s,s)}
  g.globalCompositeOperation='lighter';
  for(const p of parts){if(p.smoke)continue;const q=proj(p.x,p.y,p.z);if(!q)continue;const f=p.l/p.ml;
    if(p.gold){g.fillStyle=`rgba(255,${(180+60*f)|0},80,${Math.min(1,f*1.4)})`;const s=Math.max(1,2*q[2]);g.fillRect(q[0],q[1],s,s);continue}
    const col=p.reentry?(f>.5?'255,250,220':'255,120,60'):p.blue?(f>.6?'220,245,255':f>.3?'90,180,255':'60,90,220'):(f>.8?'255,215,120':f>.45?'255,170,50':f>.2?'255,85,25':'150,30,15');
    const s=Math.max(1,(1+2.6*f)*q[2]*1.25*(p.reentry?2:1));g.fillStyle=`rgba(${col},${(0.25+f*0.4).toFixed(3)})`;g.fillRect(q[0]-s/2,q[1]-s/2,s,s)}
  g.globalCompositeOperation='source-over';

  CB.items(items);
  // кольца
  for(const r of rings){const p=proj(r.x,r.y,r.z);if(!p)continue;items.push({d:p[3],f:()=>{g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='lighter';const s=p[2]*(1+0.08*Math.sin(t*4+r.ph));g.setTransform(s,0,0,s,p[0],p[1]);g.drawImage(RING,-20,-20);g.globalCompositeOperation='source-over'}})}
  // игрок: самолёт ↔ батискаф
  if(!(gameOver&&overT>0.05)&&!(ST.inv>0&&Math.sin(t*30)>0.5)){const p=proj(P.x,P.y,alt);if(p)items.push({d:p[3],f:()=>drawPlayer(p,alt,bc,bs,c0,s0)})}
  items.sort((a,b)=>b.d-a.d);for(const it of items)it.f();

  // глубина: темнота и фонарь
  if(under){g.setTransform(1,0,0,1,0,0);const p=proj(P.x+fx*60,P.y+fy*60,P.z);const cx=p?p[0]:W/2,cy=p?p[1]:H/2;
    const rg=g.createRadialGradient(cx,cy,Math.min(W,H)*0.12,cx,cy,Math.min(W,H)*0.75);rg.addColorStop(0,'rgba(0,6,16,0)');rg.addColorStop(1,`rgba(0,6,16,${0.25+dark*0.6})`);g.fillStyle=rg;g.fillRect(0,0,W,H);
    g.globalCompositeOperation='lighter';const hp=proj(P.x+fx*16,P.y+fy*16,P.z+2);if(hp&&p){const lg=g.createLinearGradient(hp[0],hp[1],cx,cy);lg.addColorStop(0,`rgba(255,240,190,${0.18+dark*0.2})`);lg.addColorStop(1,'rgba(255,240,190,0)');
      g.fillStyle=lg;const ang=Math.atan2(cy-hp[1],cx-hp[0]),L=Math.hypot(cx-hp[0],cy-hp[1])*1.6;g.beginPath();g.moveTo(hp[0],hp[1]);g.lineTo(hp[0]+Math.cos(ang-.35)*L,hp[1]+Math.sin(ang-.35)*L);g.lineTo(hp[0]+Math.cos(ang+.35)*L,hp[1]+Math.sin(ang+.35)*L);g.fill()}
    g.globalCompositeOperation='source-over'}
  // линии скорости
  if(P.v>165||P.nitro>0.2){g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='lighter';const n=(((P.v-165)/7)+P.nitro*14)|0,R0=Math.min(W,H)*0.38;
    g.strokeStyle=P.nitro>0.2?'rgba(150,210,255,.3)':'rgba(255,255,255,.22)';g.lineWidth=1;g.beginPath();
    for(let i=0;i<n;i++){const a=Math.random()*TAU,r0=R0+Math.random()*R0*0.8,l=8+Math.random()*24*(1+P.nitro);
      g.moveTo(pc.cx+Math.cos(a)*r0,pc.cy+Math.sin(a)*r0);g.lineTo(pc.cx+Math.cos(a)*(r0+l),pc.cy+Math.sin(a)*(r0+l))}
    g.stroke();g.globalCompositeOperation='source-over'}
  hud();
  g.setTransform(1,0,0,1,0,0);g.drawImage(vign,0,0);
  g.globalAlpha=0.045;g.translate((Math.random()*96)|0,(Math.random()*96)|0);g.fillStyle=GRAIN;g.fillRect(-96,-96,W+96,H+96);
  g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;
  requestAnimationFrame(frame);
}

/* --- игрок --- */
function drawPlayer(p,alt,bc,bs,c0,s0){const m=subT;
  if(m<0.98){const k=p[2]*(1+Math.max(0,P.vz)*0.0008)*(1-m*0.6),B=stackBasis(k,1.05),ra=P.h-cam.a,lean=P.roll*0.55*k,rx=pc.cr,ry=pc.sr,flip=bc<0,n=JET.length;
    g.globalAlpha=1-m;
    if(m<0.5){g.globalCompositeOperation='lighter';const fl=0.75+0.25*Math.sin(t*41)+P.boost*0.6+P.nitro;
      for(const e of[-1.6,1.6]){const q=proj(P.x+e*bc*c0-14*s0,P.y+e*bc*s0+14*c0,alt+4+e*bs);if(!q)continue;g.setTransform(1,0,0,1,q[0],q[1]);const r0=Math.max(1.5,2.8*fl*q[2]);
        g.fillStyle=P.nitro>0.3?'rgba(90,170,255,.6)':'rgba(255,140,40,.55)';g.beginPath();g.arc(0,0,r0*1.6,0,TAU);g.fill();g.fillStyle='rgba(255,245,220,.95)';g.beginPath();g.arc(0,0,r0*0.6,0,TAU);g.fill()}
      g.globalCompositeOperation='source-over'}
    for(let jj=0;jj<n;jj++){const i=flip?n-1-jj:jj,lift=flip?-(i-6):(i-6);const shift=(lean+bs*0.9*k)*(i-5);
      g.setTransform(B.a,B.b,B.c,B.d,Math.round(p[0]+B.ux*lift+rx*shift),Math.round(p[1]+B.uy*lift+ry*shift));g.rotate(ra);g.scale(Math.max(0.12,Math.abs(bc)),1);g.drawImage(JET[i],-JS/2,-JS/2)}
    g.globalAlpha=1}
  if(m>0.02){const a=SA.bathyscaphe,vox=0.9*(0.4+0.6*m),f=Math.floor(t*12*(0.5+P.v/120))%a.F;
    drawStackImg(IMG.s_bathyscaphe,a.W,a.D,a.H,f,P.x,P.y,alt-a.H*vox*0.5,P.h-Math.PI/2,vox,m);
    if(m<0.9){g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='lighter';g.fillStyle=`rgba(200,240,255,${(1-m)*0.5})`;g.beginPath();g.arc(p[0],p[1],30*p[2]*(1-m),0,TAU);g.fill();g.globalCompositeOperation='source-over'}}}

/* --- дом сломанного города: стопка срезов с наклоном (дом «сломан») --- */
function drawBuilding(isl,b,wx,wy,k){const im=b.img,vox=1.6,zb=isl.top,zt=zb+b.h;const m0=planeT(wx,wy,zb),m1=planeT(wx+b.lean[0]*b.h,wy+b.lean[1]*b.h,zt);if(!m0||!m1)return;
  const lod=k<0.22?4:k<0.4?2:1;g.globalAlpha=clamp(1.25-m0[7]/(2600+Math.max(0,cam.z)*3),0,1);const yaw=b.yaw+isl.a;
  for(let s=0;s<im.Hs;s+=lod){const u=s/im.Hs;g.setTransform(lerp(m0[0],m1[0],u),lerp(m0[1],m1[1],u),lerp(m0[2],m1[2],u),lerp(m0[3],m1[3],u),lerp(m0[4],m1[4],u),lerp(m0[5],m1[5],u));
    g.rotate(yaw);g.scale(vox,vox);g.drawImage(im.c,s*im.Wp,0,im.Wp,im.Dp,-im.Wp/2,-im.Dp/2,im.Wp,im.Dp)}
  g.globalAlpha=1}

/* --- глубина: декор, рыбы, мины, удильщик --- */
function seaItems(items){const i0=Math.floor(cam.x/SC),j0=Math.floor(cam.y/SC),fade=d=>clamp(1.25-d/900,0,1);
  for(let i=i0-2;i<=i0+2;i++)for(let j=j0-2;j<=j0+2;j++){const c=seaCell(i,j);
    for(const it of c.items){const a=SA[it.id];const p=proj(it.x,it.y,SEABED+a.H*SVOX*0.5);if(!p||p[3]>1100)continue;if(p[0]<-300||p[0]>W+300||p[1]<-400||p[1]>H+300)continue;
      items.push({d:p[3],f:()=>drawS(it.id,it.x,it.y,SEABED,it.yaw,SVOX,fade(p[3]),Math.floor(t*8+it.ph))})}
    for(const m of c.mob){if(m.live===0)continue;
      if(m.school){for(let q=0;q<m.school;q++){const ox=Math.sin(q*2.3+t*.8+m.ph)*26,oy=Math.cos(q*1.7+t*.7)*26,oz=Math.sin(q*1.1+t)*10,x=m.x+ox,y=m.y+oy,z=m.z+oz;const p=proj(x,y,z);if(!p||p[3]>1000)continue;
        items.push({d:p[3],f:()=>drawS(m.id,x,y,z,m.h-Math.PI/2,0.9,fade(p[3]),Math.floor(t*10+q))})}continue}
      const z=m.z+(m.id==='sea_mine'?Math.sin(t+m.ph)*4:0);const p=proj(m.x,m.y,z);if(!p||p[3]>1000)continue;
      const yaw=m.id==='angler'?Math.atan2(m.hx,-m.hy)-Math.PI/2:m.h!=null?m.h-Math.PI/2:m.ph;
      items.push({d:p[3],f:()=>{drawS(m.id,m.x,m.y,z,yaw,m.id==='manta'?1.6:SVOX,fade(p[3]),Math.floor(t*8+m.ph));
        if(m.id==='angler'||m.id==='sea_mine'){g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='lighter';const q=proj(m.x,m.y,z+(m.id==='angler'?24:34));if(q){g.fillStyle=m.id==='angler'?'rgba(255,220,120,.35)':`rgba(255,60,60,${.2+.2*Math.sin(t*6+m.ph)})`;g.beginPath();g.arc(q[0],q[1],8*q[2],0,TAU);g.fill()}g.globalCompositeOperation='source-over'}}})}}}

/* --- космос: астероиды --- */
function spaceItems(items){for(const a of AST){const r=P_ROCKS[a.v];const p=proj(a.x,a.y,a.z);if(!p)continue;
  items.push({d:p[3],f:()=>drawStackImg(r.img,r.W,r.D,r.H,0,a.x,a.y,a.z-r.H*a.sz*0.5,a.yaw,a.sz,1)})}}

/* --- экран: сердца, кислород, нитро на кнопке, оружие --- */
const HEART=(()=>{const c=mk(9,8),x=c.getContext('2d');const px=['.XX.XX.','XXXXXXX','XXXXXXX','.XXXXX.','..XXX..','...X...'];x.fillStyle='#ff4d5e';px.forEach((r,j)=>[...r].forEach((ch,i)=>{if(ch==='X')x.fillRect(i+1,j+1,1,1)}));x.fillStyle='#ffd0d6';x.fillRect(2,2,1,1);return c})();
const HEART0=(()=>{const c=mk(9,8),x=c.getContext('2d');x.globalAlpha=.3;x.drawImage(HEART,0,0);return c})();
function hud(){g.setTransform(1,0,0,1,0,0);
  if(CB.bossDark>0){g.fillStyle=`rgba(60,0,20,${CB.bossDark*0.18})`;g.fillRect(0,0,W,H)}
  if(ST.hurt>0||ST.hearts<=1){const k=Math.max(ST.hurt,ST.hearts<=1&&!gameOver?0.35+0.25*Math.sin(t*6):0);const rg=g.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,Math.hypot(W,H)*.6);rg.addColorStop(0,'rgba(255,0,30,0)');rg.addColorStop(1,`rgba(255,20,40,${k*0.55})`);g.fillStyle=rg;g.fillRect(0,0,W,H)}
  const x0=Math.round(14/PX*1.2),y0=Math.round(44/PX);
  for(let i=0;i<ST.maxHearts;i++){const s=i<ST.hearts?HEART:HEART0;const bob=i<ST.hearts&&ST.hearts<=1?Math.round(Math.sin(t*8)):0;g.drawImage(s,x0+i*10,y0+bob)}
  if(zone==='sea'){const y1=y0+11;for(let i=0;i<10;i++){const on=i<ST.oxy*10;g.fillStyle=on?(ST.oxy<.25?'#ff8a8a':'#cdeeff'):'rgba(255,255,255,.15)';g.beginPath();g.arc(x0+3+i*6,y1+3,2.2,0,TAU);g.fill()}}
  if(CB.boss&&CB.boss.st!=='bulge'){const b=CB.boss,w=Math.min(W*0.6,160),x=(W-w)/2;g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x-1,8,w+2,5);g.fillStyle='#ff3d4a';g.fillRect(x,9,w*b.hp/b.maxhp,3)}
  if(ST.inv>0&&!gameOver){const p=proj(P.x,P.y,P.z);if(p){g.globalCompositeOperation='lighter';g.strokeStyle=`rgba(140,220,255,${0.35+0.25*Math.sin(t*20)})`;g.lineWidth=1;g.beginPath();g.arc(p[0],p[1],20*p[2],0,TAU);g.stroke();g.globalCompositeOperation='source-over'}}
  bN.style.setProperty('--n',ST.nitro.toFixed(3));bF.style.setProperty('--w',(ST.wT/25).toFixed(3));
  const w=curWeapon();if(bF.dataset.w!==w){bF.dataset.w=w;bF.innerHTML=svg(ICON[w])}
  toastEl.style.opacity=ST.toast?(ST.toast.t<0.3?ST.toast.t/0.3:ST.toast.t>2?(2.6-ST.toast.t)/0.6:1):0;if(ST.toast)toastEl.textContent=ST.toast.txt}

/* --- рисование врагов, пуль, подбирашек, эффектов --- */
const FIRECOL=f=>f<.12?'255,252,230':f<.3?'255,220,120':f<.55?'255,150,50':f<.75?'200,70,30':'70,62,66';
function parachute(e){const cz=e.z+e.h+16,R=18;const m0=planeT(e.x,e.y,cz),m1=planeT(e.x,e.y,cz+11);if(!m0||!m1)return;for(let s=0;s<6;s++){const k=1-s/6,u=s/6;g.setTransform(lerp(m0[0],m1[0],u),lerp(m0[1],m1[1],u),lerp(m0[2],m1[2],u),lerp(m0[3],m1[3],u),lerp(m0[4],m1[4],u),lerp(m0[5],m1[5],u));g.rotate(e.yaw);
  for(let w=0;w<8;w++){g.fillStyle=w%2?(s>3?'#f3e3c4':'#d9c6a3'):(s>3?'#c8463c':'#9e3029');g.beginPath();g.moveTo(0,0);g.arc(0,0,R*Math.sqrt(k),w/8*TAU,(w+1)/8*TAU);g.fill()}}
 const a=proj(e.x,e.y,e.z+e.h);if(a){g.setTransform(1,0,0,1,0,0);g.strokeStyle='rgba(60,50,40,.6)';g.lineWidth=1;g.beginPath();for(const d of[-1,1]){const c=proj(e.x+d*R*.8,e.y,cz);if(c){g.moveTo(a[0],a[1]);g.lineTo(c[0],c[1])}}g.stroke()}}
function drawEnemy(e,frame,alpha){const a=A[e.id];const clip=(e.id==='strider_s'||e.id==='strider_m'||e.id==='colossus'||e.id==='turret')&&e.st!=='meteor'?e.base:null;
 if(e.id==='soldier'&&e.st==='para')parachute(e);drawStackImg(IMG[e.id],a.W,a.D,a.H,frame,e.x,e.y,e.z,e.yaw,VOX(e.id),alpha,clip,null,null,null,e.flash)}
function drawSeg(sg,x,y,z,yaw,alpha,base){if(!sg.im.complete)return;const vx=VOX('ash_worm'),W2=sg.W,D2=sg.D,H2=sg.H;g.globalAlpha=alpha;const z0=z-sg.cz*vx,m0=planeT(x,y,z0),m1=planeT(x,y,z0+H2*vx);if(!m0||!m1)return;
 for(let s=0;s<H2;s++){const zs=z0+s*vx;if(base===0&&zs<0)continue;const u=s/H2;g.setTransform(lerp(m0[0],m1[0],u),lerp(m0[1],m1[1],u),lerp(m0[2],m1[2],u),lerp(m0[3],m1[3],u),lerp(m0[4],m1[4],u),lerp(m0[5],m1[5],u));g.rotate(yaw);g.scale(vx,vx);g.drawImage(sg.im,s*W2,0,W2,D2,-sg.cx,-sg.cy,W2,D2)}g.globalAlpha=1}
CB.items=function(items){const fade=d=>clamp(1.3-d/(zone==='sea'?1000:2400),0,1);
 for(const e of E){
  if(e.id==='ash_worm'){if(e.st==='under')continue;
   for(let j=15;j>=0;j--){const u=e.u-j*0.035,[x,y,z]=wormPt(e,u);if(z<e.base-20)continue;const[x2,y2,z2]=wormPt(e,u+0.01),dir=Math.atan2(x2-x,-(y2-y)),pitch=Math.atan2(z2-z,Math.hypot(x2-x,y2-y));
    const p=proj(x,y,z);if(!p)continue;const lying=Math.abs(pitch)>0.85,sg=segOf(j,lying);const yaw=dir+Math.PI+(lying&&pitch<0?Math.PI:0);
    items.push({d:p[3]-j*0.01,f:()=>drawSeg(sg,x,y,z,yaw,fade(p[3]),e.base)})}continue}
  const p=proj(e.x,e.y,e.z+e.h*0.5);if(!p)continue;const frame=Math.floor((t*e.anim+e.seed))%8;
  if(e.st==='portal'){items.push({d:p[3],f:()=>{const k=clamp(e.t/1.1,0,1);if(k<0.35)return;const a=A[e.id];drawStackImg(IMG[e.id],a.W,a.D,a.H,frame,e.x,e.y,e.z+(1-k)*e.h*.5,e.yaw+(1-k)*8,VOX(e.id)*k,k,null,null,null,null,1-k)}});continue}
  items.push({d:p[3],f:()=>drawEnemy(e,frame,fade(p[3]))})}
 for(const b of B){const q=proj(b.x,b.y,b.z),q2=proj(b.x-b.vx*0.025,b.y-b.vy*0.025,b.z-b.vz*0.025);if(!q||!q2)continue;
  items.push({d:q[3],f:()=>{g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='lighter';g.strokeStyle=`rgba(${b.col},.95)`;g.lineWidth=Math.max(1,q[2]*1.6);g.beginPath();g.moveTo(q2[0],q2[1]);g.lineTo(q[0],q[1]);g.stroke();g.globalCompositeOperation='source-over'}})}
 for(const m of MS){const q=proj(m.x,m.y,m.z);if(!q)continue;items.push({d:q[3],f:()=>{if(m.kind==='torpedo'){const a=SA.torpedo;drawStackImg(IMG.s_torpedo,a.W,a.D,a.H,Math.floor(t*12)%a.F,m.x,m.y,m.z-4,m.h-Math.PI/2,0.8,1)}
   else{drawV(P_MISSILE,m.x,m.y,m.z-2,m.h-Math.PI/2,1.4,1);g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='lighter';const r=proj(m.x-Math.sin(m.h)*10,m.y+Math.cos(m.h)*10,m.z);if(r){g.fillStyle='rgba(255,170,60,.7)';g.beginPath();g.arc(r[0],r[1],3*r[2],0,TAU);g.fill()}g.globalCompositeOperation='source-over'}}})}
 for(const o of O){const q=proj(o.x,o.y,o.z);if(!q)continue;items.push({d:q[3],f:()=>{g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='lighter';const r=Math.max(1.5,(o.type==='tracer'?2:3.4)*q[2]),pul=1+0.25*Math.sin(t*20+o.x);
  const col=o.type==='flak'?'255,190,90':o.type==='tracer'?'255,240,170':'255,70,90';g.fillStyle=`rgba(${col},.35)`;g.beginPath();g.arc(q[0],q[1],r*2.2*pul,0,TAU);g.fill();g.fillStyle=`rgba(${col},.95)`;g.beginPath();g.arc(q[0],q[1],r,0,TAU);g.fill();g.fillStyle='rgba(255,255,240,.95)';g.fillRect(q[0]-r*.35,q[1]-r*.35,r*.7,r*.7);g.globalCompositeOperation='source-over'}})}
 for(const pu of PU){const z=pu.z+Math.sin(pu.ph)*3;const q=proj(pu.x,pu.y,z);if(!q)continue;items.push({d:q[3],f:()=>{const k=pu.kind,yaw=pu.ph;
   g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='lighter';const glow=k==='heart'||k==='pearl'?'255,80,100':k==='nitro'||k==='crystal'?'90,180,255':k==='air'?'200,240,255':k==='doubloon'||k==='chest'?'255,210,90':k==='spread'?'255,210,100':k==='missile'?'255,120,90':'156,246,234';
   g.fillStyle=`rgba(${glow},${.18+.1*Math.sin(t*5+pu.ph)})`;g.beginPath();g.arc(q[0],q[1]-6*q[2],16*q[2],0,TAU);g.fill();g.globalCompositeOperation='source-over';
   if(k==='heart')drawV(P_HEART,pu.x,pu.y,z,yaw,1.4,1);else if(k==='nitro')drawV(P_NITRO,pu.x,pu.y,z,yaw,1.2,1);else if(k==='crystal')drawV(P_CRYSTAL,pu.x,pu.y,z,yaw,1.5,1);
   else if(P_CRATE[k])drawV(P_CRATE[k],pu.x,pu.y,z,yaw,1.5,1);else if(k==='air')drawS('air_bubble',pu.x,pu.y,z,0,1.2,.9,Math.floor(t*8+pu.ph));
   else if(k==='doubloon')drawS('doubloon',pu.x,pu.y,z,0,1.6,1,Math.floor(t*10+pu.ph));else if(k==='pearl')drawS('pearl_clam',pu.x,pu.y,z,yaw,1.6,1,Math.floor(t*6));else if(k==='chest')drawS('treasure_chest',pu.x,pu.y,z,yaw,1.6,1,Math.floor(t*4))}})}
 for(const d of DB){const q=proj(d.x,d.y,d.z);if(!q)continue;items.push({d:q[3],f:()=>{const s=Math.max(1,d.s*q[2]);g.setTransform(1,0,0,1,0,0);
  if(d.bub){g.strokeStyle=`rgba(220,245,255,${clamp(1-d.life/d.max,0,1)*.8})`;g.lineWidth=1;g.beginPath();g.arc(q[0],q[1],s*.7,0,TAU);g.stroke();return}
  if(d.water){g.fillStyle=d.c;g.globalAlpha=clamp(1-d.life/d.max,0,1)*0.9;g.fillRect(q[0]-s/2,q[1]-s/2,s,s);g.globalAlpha=1;return}
  g.translate(q[0],q[1]);g.rotate(d.rot||0);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(-s/2,-s/2+s*.35,s,s);g.fillStyle=d.c;g.fillRect(-s/2,-s/2,s,s);g.fillStyle='rgba(255,255,255,.18)';g.fillRect(-s/2,-s/2,s,s*.35)}})}
 for(const f of FX){const fr=f.life/f.max;
  if(f.t==='ball'){const q=proj(f.x,f.y,f.z);if(!q)continue;items.push({d:q[3],f:()=>{const N=f.kind==='mega'?12:8,r=f.r*(0.5+fr*(f.kind==='flak'?1.4:1.1)),fl=f.kind==='flak';
    for(let s=0;s<N;s++){const u=(s+.5)/N*2-1,rr=r*Math.sqrt(1-u*u),m=planeT(f.x,f.y,f.z+u*r*0.9);if(!m)continue;g.setTransform(m[0],m[1],m[2],m[3],m[4],m[5]);
     const ff=clamp(fr+(1-u)*0.12+(fl?0.25:0),0,1);g.globalAlpha=clamp(1.15-fr,0,1);g.fillStyle=`rgb(${FIRECOL(ff)})`;
     g.beginPath();for(let k=0;k<10;k++){const a=k/10*TAU,wob=1+0.16*Math.sin(a*3+f.x+s+t*6);g.lineTo(Math.cos(a)*rr*wob,Math.sin(a)*rr*wob)}g.fill();
     if(fr<.45){g.globalCompositeOperation='lighter';g.fillStyle=`rgba(255,200,90,${(0.45-fr)*0.8})`;g.beginPath();g.arc(0,0,rr*0.6,0,TAU);g.fill();g.globalCompositeOperation='source-over'}}g.globalAlpha=1}})}
  else if(f.t==='bubbleball'){const q=proj(f.x,f.y,f.z);if(!q)continue;items.push({d:q[3],f:()=>{const r=f.r*(0.4+fr*1.3);for(let s=0;s<7;s++){const u=(s+.5)/7*2-1,rr=r*Math.sqrt(1-u*u),m=planeT(f.x,f.y,f.z+u*r*.9);if(!m)continue;g.setTransform(m[0],m[1],m[2],m[3],m[4],m[5]);
     g.globalAlpha=(1-fr)*0.8;g.strokeStyle=s>3?'#e9fbff':'#9fdcf5';g.lineWidth=1.5/Math.max(.2,q[2]);g.beginPath();g.arc(0,0,rr,0,TAU);g.stroke();if(fr<.3){g.fillStyle='rgba(255,240,200,.5)';g.fill()}}g.globalAlpha=1}})}
  else if(f.t==='puff'){const q=proj(f.x,f.y,f.z);if(!q)continue;items.push({d:q[3],f:()=>{const r=f.s*(0.6+fr*1.4);for(let s=0;s<4;s++){const u=(s+.5)/4*2-1,m=planeT(f.x,f.y,f.z+u*r*.8);if(!m)continue;g.setTransform(m[0],m[1],m[2],m[3],m[4],m[5]);
     g.globalAlpha=(1-fr)*0.55;g.fillStyle=f.col==='silt'?(s>2?'#7d8a7a':'#5a6658'):(s>2?'#8a8590':'#5d5862');g.beginPath();g.arc(0,0,r*Math.sqrt(1-u*u),0,TAU);g.fill()}g.globalAlpha=1}})}
  else if(f.t==='geyser'){const q=proj(f.x,f.y,f.h*.4);if(!q)continue;items.push({d:q[3],f:()=>{const Hh=f.h*Math.sin(Math.PI*Math.min(1,fr*1.3)),n=Math.max(4,Hh/5|0);for(let s=0;s<n;s++){const zz=s/n*Hh,rr=(10-6*s/n)*(1+fr*.5),m=planeT(f.x,f.y,zz);if(!m)continue;
     g.setTransform(m[0],m[1],m[2],m[3],m[4],m[5]);g.globalAlpha=(1-fr)*0.8;g.fillStyle=s%3?'#d9f2ff':'#ffffff';g.beginPath();g.arc(Math.sin(s+t*9)*1.5,0,rr,0,TAU);g.fill()}g.globalAlpha=1}})}
  else if(f.t==='beam'){const q=proj(f.x,f.y,f.z0+60);if(!q)continue;items.push({d:q[3]+5,f:()=>{const a=proj(f.x,f.y,f.z0),b=proj(f.x,f.y,f.z0+220);if(!a||!b)return;g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='lighter';const w=(6+20*Math.sin(Math.PI*fr))*a[2];
     g.fillStyle=`rgba(255,40,60,${0.5*(1-fr)})`;g.beginPath();g.moveTo(a[0]-w,a[1]);g.lineTo(a[0]+w,a[1]);g.lineTo(b[0]+w*.3,b[1]);g.lineTo(b[0]-w*.3,b[1]);g.fill();g.globalCompositeOperation='source-over'}})}
  else if(f.t==='eyepop'){const q=proj(f.x,f.y,f.z);if(!q)continue;items.push({d:q[3]-2,f:()=>{g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='lighter';g.strokeStyle=`rgba(255,60,80,${1-fr})`;g.lineWidth=2;g.beginPath();g.arc(q[0],q[1],(10+fr*60)*q[2],0,TAU);g.stroke();g.globalCompositeOperation='source-over'}})}
  else if(f.t==='bolt'){const a=proj(...f.a),b=proj(...f.b);if(!a||!b)continue;items.push({d:Math.min(a[3],b[3])-3,f:()=>{g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='lighter';
     for(const [w,col] of [[4,'rgba(80,200,255,.35)'],[1.5,'rgba(230,255,255,.95)']]){g.strokeStyle=col;g.lineWidth=w;g.beginPath();g.moveTo(a[0],a[1]);for(let k=1;k<8;k++){const u=k/8;g.lineTo(lerp(a[0],b[0],u)+rnd(-6,6),lerp(a[1],b[1],u)+rnd(-6,6))}g.lineTo(b[0],b[1]);g.stroke()}
     g.globalCompositeOperation='source-over'}})}
 }};
CB.ground=function(){for(const f of FX){if(f.t!=='ring')continue;const fr=f.life/f.max,m=planeT(f.x,f.y,f.z);if(!m)continue;g.setTransform(m[0],m[1],m[2],m[3],m[4],m[5]);
  g.strokeStyle=`rgba(${f.col},${(1-fr)*0.85})`;g.lineWidth=Math.max(1,2.5*(1-fr));g.beginPath();g.arc(0,0,f.r*(0.3+fr),0,TAU);g.stroke()}
 g.globalAlpha=0.16;g.fillStyle='#021a55';for(const e of E){if(e.id==='ash_worm'||e.z<e.base&&e.id!=='colossus')continue;const zz=Math.max(0,e.z-e.base),m=planeT(e.x+zz*.4,e.y+zz*.7,e.base);if(!m)continue;g.setTransform(m[0],m[1],m[2],m[3],m[4],m[5]);g.beginPath();g.ellipse(0,0,e.r*.9,e.r*.7,e.yaw,0,TAU);g.fill()}g.globalAlpha=1};
// кольца на воде под водой тоже нужны: рисуем их среди предметов
const _seaItems=seaItems;seaItems=function(items){_seaItems(items);CB.ground()};

window.__cb={spawn,get kills(){return kills},E,opened,ORDER,ST,CB,killAll(){for(const e of [...E])killEnemy(e)},get zone(){return zone},P:()=>P,crash};
requestAnimationFrame(frame);

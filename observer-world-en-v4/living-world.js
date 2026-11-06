/* Observer World V4 — miniature Island of Twilight features on the SAME world coordinates.
 * Original visual source: user-supplied Island of Twilight (1)(4).html.
 * Uses existing Observer World objects, combat state and single render animation frame.
 * Preserves the accepted V2/V3 simulation; does not run another game or physics loop.
 */
(function(root){
"use strict";
const KINDS={imp:{hp:70,radius:13,speed:8,damage:9,segments:4,glow:"#bb4bff"},
 shade:{hp:120,radius:18,speed:6,damage:14,segments:6,glow:"#8843f2"},
 warden:{hp:280,radius:29,speed:4,damage:24,segments:9,glow:"#e64aff"}};
const qHash=n=>{let x=Math.imul((n|0)+4127,0x45d9f3b);x^=x>>>15;return(x>>>0)/4294967296};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function create({S,COMBAT,ctx,w2s,cam,report,sound,onSave,onMonstersChanged}){
 const catalog=root.IslandWeaponCatalog||{};
 const projectiles=[];
 const monsters=[],ripples=[],litter=[],EVENTS=[],timeline={cycle:0,lastFrame:0,ambientSpawn:0,glitchUntil:0,glitchPulse:0,spawned:0,dead:0,attacks:0,scenes:0};
 let lastSave=0,hero={x:0,y:0,mode:"builder",hp:100,weapon:"sword",facing:1,cooldown:0,ammo:{}};
 const worldRead=()=>({monsters,hero,projectiles:projectiles.slice(0,16),events:EVENTS.slice(-20),timeline});
 const medieval=new Set(['fists','stick','dagger','sword','katana','axe','hammer','spear','scythe','flail','sling','bow','xbow']);
 function unlocked(id){
   return medieval.has(id)||S.objects.some(o=>o.kind==='observer'||o.kind==='extraction')||
     monsters.some(m=>!m.dead);
 }
 function equipWeapon(id){
   if(!catalog[id]||!unlocked(id))return false;
   hero.weapon=id;save();return true;
 }
 function damageFor(w){
   if(!w)return 10;
   return Array.isArray(w.damage)?w.damage[Math.min(w.damage.length-1,1)]:
          Number(w.damage)||14;
 }
 function restore(){
  try{
   const data=JSON.parse(localStorage.getItem("observer-world-v4-expansion")||'null');
   if(data?.version===4){
    monsters.push(...(Array.isArray(data.monsters)?data.monsters.slice(-32):[]).map(m=>({...m,state:m.state||'patrol'})));
    hero={...hero,...(data.hero||{})};
    EVENTS.push(...(Array.isArray(data.events)?data.events.slice(-70):[]));
    timeline.spawned=Number(data.spawned)||0;timeline.dead=Number(data.dead)||0;
   }
  }catch{}
 }
 function save(){
  try{localStorage.setItem("observer-world-v4-expansion",JSON.stringify({
   version:4,monsters:monsters.slice(-32),hero,events:EVENTS.slice(-70),
   spawned:timeline.spawned,dead:timeline.dead
  }));onSave?.()}catch{}
 }
 function history(title,text){
  EVENTS.push({title,text,t:Date.now()});if(EVENTS.length>100)EVENTS.shift();
  report(title,text);save()
 }
 function isMonster(kind){return !!KINDS[kind]}
 function spawn(kind,x,y,manual=true){
  const def=KINDS[kind];if(!def||monsters.filter(m=>!m.dead).length>=12)return false;
  const m={id:200000+timeline.spawned++,kind,x,y,homeX:x,homeY:y,hp:def.hp,maxHp:def.hp,
    state:"emerging",cool:1.5,fade:0,phase:qHash(Math.floor(x*13+y*19))*7,age:0,dead:false,
    attackCount:0,lastAttacker:""};
  monsters.push(m);timeline.glitchUntil=performance.now()+1900;timeline.glitchPulse=1;
  sound?.event("mystery");onMonstersChanged?.(monsters);
  const label=kind==='warden'?'a Warden':kind==='shade'?'a Shade':'an Imp';
  history("Anomaly: "+kind.toUpperCase(),label+" has emerged near the settlement. The witnesses disagree about whether it crawled out of the earth or stepped into the world from elsewhere. The guard is arming, people are fleeing, and the city must decide whether this is a monster, a sign, or a message from the Institute.");
  return m
 }
 function onBuild(kind,x,y){
  if(kind==="well"||kind==="fire"||kind==="brigade"){ripple(x,y,12);}
  if(kind==="fire"||kind==="plague"||kind==="observer"){timeline.glitchPulse=Math.max(timeline.glitchPulse,.3);}
  if(["school","scholarAction","printing"].includes(kind)&&monsters.some(m=>!m.dead))history("Scholarly investigation","The scholars have started cataloguing sightings. Information is becoming a weapon against fear.");
 }
 function ripple(x,y,power=10){
  ripples.push({x,y,t:performance.now(),power});if(ripples.length>16)ripples.shift()
 }
 function height(x,y){
  const d=Math.hypot(x*.82,y*.93),rough=Math.sin(x*.013)*5+Math.cos(y*.019)*4+
    Math.sin((x+y)*.031)*2,edge=260-d*.2+rough;
  return edge;
 }
 function isWater(x,y){return y>110+Math.sin(x*.0057)*47}
 function drawGround(time,W,H){
  const q=cam.zoom,spacing=30,patches=0;
  // Tile field from ORIGINAL Island grass/stone/sand atlas; bounded visible work.
  const viewX=cam.x,viewY=cam.y;
  const left=Math.max(-660,Math.floor((viewX-W/2/q)/spacing)*spacing-15);
  const top=Math.max(-410,Math.floor((viewY-H/2/q)/spacing)*spacing-15);
  const right=Math.min(660,viewX+W/2/q+40),bottom=Math.min(480,viewY+H/2/q+40);
  const grassImg=root.IslandVisuals;
  let drawn=0;
  for(let wy=top;wy<=bottom;wy+=spacing){
    for(let wx=left;wx<=right;wx+=spacing){
      if(++drawn>650)break;
      const s=w2s(wx,wy),wet=isWater(wx,wy),coast=isWater(wx,wy+42)!==wet,rough=height(wx,wy);
      if(s.x<-42||s.x>W+42||s.y<-42||s.y>H+42)continue;
      const seed=qHash(Math.floor(wx/spacing)*443+Math.floor(wy/spacing)*4013);
      if(wet){
        ctx.fillStyle=seed>.5?'#264f61':'#285966';ctx.fillRect(s.x-15*q,s.y-15*q,30*q+1,30*q+1);
        // Original four-frame water pixels occupy the surface of the entire river/lake.
        if(grassImg?.waterTile)grassImg.waterTile(ctx,s.x-15*q,s.y-15*q,30*q,30*q,Math.floor(time/210+seed*4)%4);
        if((Math.floor(time/420)+Math.round(seed*9))%4===0){
          ctx.strokeStyle="rgba(180,224,211,.24)";ctx.lineWidth=Math.max(1,q);
          ctx.beginPath();ctx.moveTo(s.x-11*q,s.y+3*q);ctx.lineTo(s.x+(6+7*seed)*q,s.y+3*q);ctx.stroke();
        }
      }else{
        if(grassImg?.tile)grassImg.tile(ctx,coast?4:(rough<120?2:0),s.x-15*q,s.y-15*q,30*q,.8);
        else{ctx.fillStyle=coast?'#776b48':seed>.5?'#455d38':'#395132';ctx.fillRect(s.x-15*q,s.y-15*q,30*q+1,30*q+1)}
        if(seed>.42){ctx.strokeStyle='rgba(185,197,107,.32)';ctx.lineWidth=Math.max(1,q*.85);
          for(let i=0;i<3;i++){let px=s.x+(i*9-9)*q,py=s.y+(seed*13-5)*q;
            const sway=Math.sin(time*.0013+wx*.03+i)*2*q;
            ctx.beginPath();ctx.moveTo(px,py+3*q);ctx.quadraticCurveTo(px+sway,py-2*q,px+sway+2*q,py-5*q);ctx.stroke();
          }
        }
      }
    }
    if(drawn>650)break;
  }
  // Visible elevation faceting / original palette on terrain edges.
  for(let i=0;i<36;i++){
    const x=-480+i*28,y=-130+Math.sin(i*2.14)*120,z=height(x,y);
    if(z<100||isWater(x,y))continue;
    const p=w2s(x,y),size=clamp((z-95)*.11,3,9)*q;
    ctx.fillStyle='rgba(46,43,48,.50)';ctx.beginPath();ctx.moveTo(p.x-size,p.y);ctx.lineTo(p.x,p.y-size*.7);
    ctx.lineTo(p.x+size,p.y);ctx.lineTo(p.x+size*.3,p.y+size*.3);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(135,151,113,.48)';ctx.beginPath();ctx.moveTo(p.x-size,p.y);ctx.lineTo(p.x,p.y-size*.7);
    ctx.lineTo(p.x+size,p.y);ctx.closePath();ctx.fill();
  }
  // Animated ripple rings caused by wells, footsteps, monster impacts.
  for(let i=ripples.length-1;i>=0;i--){
    const r=ripples[i],age=(time-r.t)/1000;if(age>1.5){ripples.splice(i,1);continue}
    const p=w2s(r.x,r.y);ctx.strokeStyle='rgba(184,230,233,'+(1-age/1.5)*.5+')';
    ctx.lineWidth=Math.max(.5,cam.zoom);ctx.beginPath();ctx.ellipse(p.x,p.y,(4+r.power*age)*q,(2+r.power*age*.5)*q,0,0,7);ctx.stroke()
  }
 }
 function drawMonsters(time){
  for(const m of monsters){
    const def=KINDS[m.kind],p=w2s(m.x,m.y,12),q=cam.zoom;
    if(p.x<-110||p.x>ctx.canvas.width+110||p.y<-110||p.y>ctx.canvas.height+110)continue;
    const alpha=m.dead?.22:clamp(m.fade,0,1),pulse=.65+.2*Math.sin(time*.003+m.phase);
    ctx.save();ctx.globalAlpha=alpha;
    // Aura glow follows the segmented creature, not a static purple blob.
    const grd=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,def.radius*2.8*q);
    grd.addColorStop(0,'rgba(142,43,205,.32)');grd.addColorStop(.6,'rgba(89,32,156,.14)');grd.addColorStop(1,'rgba(70,10,100,0)');
    ctx.fillStyle=grd;ctx.beginPath();ctx.arc(p.x,p.y,def.radius*2.8*q,0,7);ctx.fill();
    for(let i=def.segments-1;i>=0;i--){
      const t=i/def.segments,offset=Math.sin(time*.004-i*.65+m.phase)*def.radius*.2,
            x=p.x-i*def.radius*.33*q+offset*q,
            y=p.y+Math.sin(time*.003-i*.75+m.phase)*def.radius*.2*q+i*1.4*q,
            rad=Math.max(2,def.radius*(1-t*.6)*(m.dead?.35:pulse))*q;
      ctx.fillStyle=i%2?'#170d26':'#24102b';ctx.beginPath();ctx.arc(x,y,rad,0,7);ctx.fill();
      ctx.strokeStyle=def.glow;ctx.lineWidth=1.4*q;ctx.globalAlpha=alpha*.55;
      ctx.beginPath();ctx.arc(x,y,rad,0,7);ctx.stroke();ctx.globalAlpha=alpha;
    }
    // Four eye pixels + a warm core read at miniature Observer World scale.
    ctx.fillStyle='#dd91ff';ctx.shadowColor=def.glow;ctx.shadowBlur=12*q;
    ctx.fillRect(p.x-5*q,p.y-5*q,3*q,3*q);ctx.fillRect(p.x+3*q,p.y-5*q,3*q,3*q);ctx.shadowBlur=0;
    if(m.hp<m.maxHp&&!m.dead){ctx.fillStyle='#2c1c1c';ctx.fillRect(p.x-13*q,p.y-22*q,26*q,3*q);
      ctx.fillStyle='#d866a3';ctx.fillRect(p.x-13*q,p.y-22*q,26*q*Math.max(0,m.hp)/m.maxHp,3*q)}
    ctx.restore()
  }
 }
 function drawGlitch(time,W,H){
  const active=time<timeline.glitchUntil;
  if(!active)return;
  const intensity=clamp((timeline.glitchUntil-time)/1900,0,1),q=cam.zoom;
  if(root.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
  ctx.save();ctx.globalCompositeOperation='screen';
  for(let i=0;i<8;i++){
    const y=(qHash((Math.floor(time/40)+1)*43+i*99)*H)|0,
          x=qHash(i*53+Math.floor(time/60))*W,
          width=(10+qHash(i*19)*110)*q;
    ctx.fillStyle=i%2?'rgba(190,42,249,'+(.1*intensity)+')':'rgba(54,215,206,'+(.11*intensity)+')';
    ctx.fillRect(x-18*intensity,y,width,1+qHash(i)*4);
  }
  ctx.restore()
 }
 function inCombat(){
  return monsters.some(m=>!m.dead&&m.state==="attacking")
 }
 function damage(m,damage,attacker='resident'){
  if(!m||m.dead)return;
  m.hp=Math.max(0,m.hp-damage);m.lastAttacker=attacker;
  if(!m.hp){
    m.dead=true;timeline.dead++;timeline.glitchUntil=performance.now()+900;
    const label=m.kind.toUpperCase();
    history(label+" defeated","The "+m.kind+" has fallen. Surviving witnesses are telling different stories: some call this a triumph of arms, others believe the creature was a warning. The battle has altered the authority of the guard and the fears of the townspeople.");
    S.order=Math.min(100,(S.order||0)+4);sound?.event("death");
  }
 }
 function closestArmed(m){
  let closest=null,dist=120;
  for(const a of COMBAT.actors){
   if(a.state==="dead"||!a.armed)continue;
   const d=Math.hypot(a.x-m.x,a.y-m.y);
   if(d<dist){dist=d;closest=a}
  }
  return {actor:closest,dist}
 }
 function update(time){
  const dt=clamp((time-timeline.lastFrame)/1000,0,.05);
  timeline.lastFrame=time;timeline.cycle++;
  const night=(Math.sin(time*.00004+1)<-.42);
  if(time-timeline.ambientSpawn>120000 && !monsters.some(m=>!m.dead) && S.objects.length>4){
    timeline.ambientSpawn=time;
    const risk= S.objects.some(o=>!o.dead&&o.kind==='plague')?0.25:(S.suspicion||0)>5?.16:.03;
    if(Math.random()<risk){
     const center=S.objects.find(o=>o.kind==='observer')||{x:0,y:0};
     spawn("shade",center.x+110,center.y+55,false);
    }
  }
  for(let i=projectiles.length-1;i>=0;i--){
    const b=projectiles[i];b.t=Math.min(1,b.t+dt*b.speed/Math.max(15,b.distance));
    if(b.t>=1){
      damage(b.target,b.damage,'Observer / '+b.weapon);
      ripple(b.target.x,b.target.y,7);
      projectiles.splice(i,1)
    }
  }
  for(const m of monsters){
    m.fade=Math.min(1,m.fade+dt*.6);m.age+=dt;
    if(m.dead)continue;
    m.cool=Math.max(0,m.cool-dt);
    const armed=closestArmed(m),a=armed.actor;
    if(a){
      const dx=a.x-m.x,dy=a.y-m.y,dist=Math.hypot(dx,dy)||1;
      if(dist>18){m.state="chase";m.x+=dx/dist*KINDS[m.kind].speed*dt;m.y+=dy/dist*KINDS[m.kind].speed*dt}
      else{m.state="attacking";if(m.cool===0){
        m.cool=m.kind==='imp'?1.9:2.5;
        a.hp=Math.max(0,a.hp-KINDS[m.kind].damage);a.hitFlash=.23;
        if(a.hp<45&&a.state!=='wounded'){a.state="wounded";a.bleed=16}
        if(a.hp<=0){a.state="dead";S.pop=Math.max(0,S.pop-1);S.order=Math.max(0,S.order-3);S.suspicion++}
        m.attackCount++;timeline.attacks++;sound?.event("hit");
      }}
      if(dist<37&&a.armed){
        // Nearby sword fighters attack on a bounded cooldown; no duplicated combat simulation.
        if(m.age>2&&m.cool>.8&&m.cool<.8+dt){damage(m,12+Math.floor(qHash(a.id+m.id)*8),a.faction)}
      }
    }else{
      m.state="patrol";m.x+=(m.homeX+Math.sin(time*.00075+m.phase)*34-m.x)*dt*.18;
      m.y+=(m.homeY+Math.cos(time*.0005+m.phase)*20-m.y)*dt*.18;
      if(m.age>22&&m.cool===0){
       m.cool=12;timeline.attacks++;
       S.order=Math.max(0,S.order-1);S.suspicion=Math.min(99,S.suspicion+1);
       if(timeline.attacks%4===0)history("Shadow in the streets","A "+m.kind+" crossed the dark streets. No one was killed, but the market emptied early and the guards demanded new powers.");
      }
    }
  }
  if(time-lastSave>18000){lastSave=time;save()}
 }
 function examine(x,y){
  if(hero.mode!=="explore")return false;
  let best=null,dist=24;
  for(const m of monsters){if(m.dead)continue;const d=Math.hypot(m.x-x,m.y-y);if(d<dist){best=m;dist=d}}
  if(!best)return false;
  const w=catalog[hero.weapon]||catalog.sword,now=performance.now(),d=Math.hypot(hero.x-best.x,hero.y-best.y);
  if(now<(hero.cooldown||0))return true;
  const range=w.kind==="ranged"?Math.min(200,Math.max(55,Number(w.range||w.speed||25)*6)):
    Math.max(20,Number(w.reach||2)*13);
  if(d>range)return false;
  if(w.mag){
    hero.ammo[hero.weapon]??=w.mag;
    if(hero.ammo[hero.weapon]<=0){
      hero.ammo[hero.weapon]=w.mag;
      hero.cooldown=now+Math.max(600,Number(w.reload||1)*1000);
      sound?.event("gate");return true
    }
    hero.ammo[hero.weapon]--;
  }
  hero.cooldown=now+Math.max(100,Number(w.cooldown||.33)*1000);
  const dmg=damageFor(w);
  if(w.kind==="ranged"){
    if(projectiles.length>=24)projectiles.shift();
    projectiles.push({x:hero.x,y:hero.y,target:best,weapon:hero.weapon,
      damage:dmg,distance:d,speed:Math.max(40,Number(Array.isArray(w.speed)?w.speed[1]:w.speed)||40)*8,t:0});
    sound?.event("steel");
  }else{
    damage(best,dmg,'Observer / '+hero.weapon);sound?.event("swing");
    ripple(best.x,best.y,7);
  }
  save();return true
 }
 function drawHeroAndWeapons(time){
   if(hero.mode!=="explore")return;
   root.IslandVisuals?.human(ctx,{x:hero.x,y:hero.y,id:11,dead:false},true,w2s,cam,time);
   root.IslandVisuals?.heldWeapon?.(ctx,hero.weapon,hero.x,hero.y,w2s,cam,0);
   const q=cam.zoom;
   for(const b of projectiles){
     const p=w2s(b.x+(b.target.x-b.x)*b.t,b.y+(b.target.y-b.y)*b.t,14);
     ctx.strokeStyle=b.weapon==="laser"?"#ec91fa":"#f1d09f";ctx.lineWidth=Math.max(1,2*q);
     ctx.beginPath();ctx.moveTo(p.x-3*q,p.y+3*q);ctx.lineTo(p.x+4*q,p.y-3*q);ctx.stroke();
   }
 }
 function switchMode(mode){hero.mode=mode==="explore"?"explore":"builder";save();return hero.mode}
 function snapshot(){return{...worldRead(),night:Math.sin(performance.now()*.00004+1)<-.42}}
 restore();
 return Object.freeze({KINDS,isMonster,spawn,onBuild,update,drawGround,drawMonsters,drawGlitch,
   examine,ripple,save,snapshot,switchMode,equipWeapon,unlocked,drawHeroAndWeapons,get weapons(){return catalog},get monsters(){return monsters},get hero(){return hero}});
}
root.ObserverV4World=Object.freeze({create,KINDS});
})(window);

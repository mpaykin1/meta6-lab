/* Hero Animator: deterministic input-driven adventure state. Renderer/art independent. */
(function(root){'use strict';
 const ACTIONS=['idle','walk','run','jump','crouch','dodge','roll','attack','grab','hurt','death'];
 const duration={jump:.82,crouch:.3,dodge:.42,roll:.65,attack:.65,grab:.5,hurt:.45,death:1.1};
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
 function create({blocked=()=>false,onSound=()=>{},onWin=()=>{}}={}){
  let p,enemies,seals,time,paused,started,won,events,grabbed,hitDone,phase;
  const spawn=[[-4,2],[5,-4],[-5,-15]];
  function reset(){p={x:0,z:8,y:0,vy:0,yaw:Math.PI,hp:100,stamina:100,action:'idle',age:0,invulnerable:0,frame:0,travel:0,landing:0};enemies=spawn.map(([x,z],i)=>({id:i,x,z,hp:3,state:'idle',age:0,cooldown:.8+i*.2,yaw:0,flash:0,stun:0}));seals=[];time=0;paused=false;started=false;won=false;events=[];grabbed=null;hitDone=false;phase=0;}
  function emit(type,data={}){events.push({type,time,...data});if(events.length>120)events.shift();}
  function state(a){if(p.action===a)return;p.action=a;p.age=0;p.frame=0;hitDone=false;emit('action',{action:a});}
  function release(throwing=false){if(!grabbed)return;const e=grabbed;grabbed=null;e.stun=throwing?2.4:1;e.state='stunned';e.age=0;if(throwing){e.throwVX=Math.sin(p.yaw)*7;e.throwVZ=Math.cos(p.yaw)*7;e.throwAge=.35;e.hp=Math.max(0,e.hp-2);emit('throw',{target:e.id});onSound('hit');if(!e.hp)kill(e);}else emit('release',{target:e.id});}
  function kill(e){if(e.state==='dead')return;e.hp=0;e.state='dead';e.age=0;seals.push({x:e.x,z:e.z,collected:false});emit('enemyDeath',{target:e.id});}
  function damage(amount){if(p.hp<=0||p.invulnerable>0||won)return false;p.hp=Math.max(0,p.hp-amount);release();p.invulnerable=.8;state(p.hp?'hurt':'death');emit('damage',{amount});onSound('hurt');return true;}
  function move(dx,dz){const ox=p.x,oz=p.z;
   const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.15));for(let i=0;i<steps;i++){if(!blocked(p.x+dx/steps,p.z,p.y))p.x+=dx/steps;if(!blocked(p.x,p.z+dz/steps,p.y))p.z+=dz/steps;}
   return Math.hypot(p.x-ox,p.z-oz);
  }
  function begin(){started=true;paused=false;emit('start');}
  function update(delta,input,yaw=0){
   const dt=clamp(Number(delta)||0,0,.05);if(!dt)return;
   if(input.pressed('restart')){reset();begin();return;}
   if(input.pressed('pause')&&started&&!won&&p.hp>0){paused=!paused;release();emit(paused?'pause':'resume');}
   if(!started||paused||won)return;
   time+=dt;p.age+=dt;p.invulnerable=Math.max(0,p.invulnerable-dt);p.landing=Math.max(0,p.landing-dt);
   p.stamina=Math.min(100,p.stamina+dt*(p.action==='run'?0:21));
   let mx=Number(input.held('right'))-Number(input.held('left')),mz=Number(input.held('up'))-Number(input.held('down'));
   const len=Math.hypot(mx,mz);if(len){mx/=len;mz/=len;}
   const wx=mx*Math.cos(yaw)+mz*Math.sin(yaw),wz=mx*Math.sin(yaw)-mz*Math.cos(yaw);
   const alive=p.hp>0,grounded=p.y<=.0001;
   let lock=['attack','dodge','roll','grab','hurt','death'].includes(p.action);
   if(alive&&!lock&&grounded){
    if(input.pressed('attack')&&p.stamina>=16){p.stamina-=16;state('attack');onSound('attack');}
    else if(input.pressed('roll')&&p.stamina>=26){p.stamina-=26;state('roll');p.invulnerable=.48;onSound('dodge');}
    else if(input.pressed('dodge')&&p.stamina>=20){p.stamina-=20;state('dodge');p.invulnerable=.32;onSound('dodge');}
    else if(input.pressed('grab')&&p.stamina>=12){
     const target=enemies.filter(e=>e.hp>0&&dist(e,p)<2.5&&!blocked((e.x+p.x)/2,(e.z+p.z)/2,0)).sort((a,b)=>dist(a,p)-dist(b,p))[0];
     if(target){p.stamina-=12;grabbed=target;target.state='grabbed';p.yaw=Math.atan2(target.x-p.x,target.z-p.z);state('grab');emit('grab',{target:target.id});}
    }else if(input.pressed('jump')){p.vy=6;state('jump');emit('jump');onSound('jump');}
   }
   if(p.action==='grab'){
    if(input.pressed('attack')){release(true);state('attack');}
    else if(!input.held('grab')){release();state('idle');}
    else if(grabbed){grabbed.x=p.x+Math.sin(p.yaw)*1.3;grabbed.z=p.z+Math.cos(p.yaw)*1.3;}
   }
   lock=['attack','dodge','roll','grab','hurt','death'].includes(p.action);
   let distance=0;
   if(alive&&(p.action==='dodge'||p.action==='roll'))distance=move(Math.sin(p.yaw)*dt*7,Math.cos(p.yaw)*dt*7);
   else if(alive&&!lock&&len&&!input.held('crouch')){
    const run=input.held('run')&&p.stamina>2&&grounded,speed=run?6.2:3.7;
    distance=move(wx*speed*dt,wz*speed*dt);p.yaw=Math.atan2(wx,wz);
    if(run)p.stamina=Math.max(0,p.stamina-25*dt);
   }
   if(p.y>0||p.vy>0){p.vy-=15*dt;p.y=Math.max(0,p.y+p.vy*dt);if(p.y===0){p.vy=0;p.landing=.1;emit('land');onSound('land');}}
   if(p.action==='attack'&&p.age>=.23&&!hitDone){hitDone=true;let hit=false;
    for(const e of enemies){if(e.hp<=0||e===grabbed)continue;const d=dist(e,p),toward=Math.atan2(e.x-p.x,e.z-p.z),angle=Math.atan2(Math.sin(toward-p.yaw),Math.cos(toward-p.yaw));
     if(d<2.6&&Math.abs(angle)<1.15&&!blocked((e.x+p.x)/2,(e.z+p.z)/2,0)){e.hp--;e.flash=.3;e.stun=.8;e.state='stunned';hit=true;emit('hit',{target:e.id});if(e.hp===0)kill(e);}}
    if(hit)onSound('hit');
   }
   if(['attack','dodge','roll','hurt'].includes(p.action)&&p.age>=duration[p.action])state('idle');
   lock=['attack','dodge','roll','grab','hurt','death'].includes(p.action);
   if(alive&&!lock){
    if(p.y>0||p.landing>0)state('jump');else if(input.held('crouch'))state('crouch');
    else if(distance>.00001)state(input.held('run')&&p.stamina>0?'run':'walk');else state('idle');
   }
   if((p.action==='walk'||p.action==='run')&&distance>0){phase=(phase+distance/(p.action==='run'?3.2:2.5))%1;p.frame=Math.floor(phase*8);p.travel+=distance;}
   else if(p.action==='idle'){p.frame=0;phase=0;}
   else if(p.action==='jump'){p.frame=p.landing>0?7:p.vy>3?1:p.vy>0?3:p.y>.4?4:6;}
   else if(p.action==='grab'){p.frame=Math.min(4,Math.floor(p.age*12));}
   else if(p.action==='crouch'){p.frame=Math.min(7,Math.floor(p.age*14));}
   else p.frame=Math.min(7,Math.floor(p.age/(duration[p.action]||.6)*8));
   for(const e of enemies){e.flash=Math.max(0,e.flash-dt);e.age+=dt;
    if(e.throwAge>0){e.throwAge-=dt;const nx=e.x+e.throwVX*dt,nz=e.z+e.throwVZ*dt;if(!blocked(nx,nz,0)){e.x=nx;e.z=nz;}else e.throwAge=0;}
    if(e.hp<=0||e===grabbed)continue;
    e.stun=Math.max(0,e.stun-dt);if(e.stun>0){e.state='stunned';continue;}
    if(p.hp<=0){e.state='idle';continue;}
    const d=dist(e,p);e.yaw=Math.atan2(p.x-e.x,p.z-e.z);
    if(e.state==='windup'){
     if(e.age>=.85){if(d<2.4&&p.y<1.2)damage(22);e.state='recover';e.age=0;e.cooldown=1.1;emit('enemyStrike',{target:e.id});}
    }else if(e.state==='recover'){if(e.age>.6){e.state='idle';e.age=0;}}
    else if(d<10&&d>1.8){e.state='chase';const dx=Math.sin(e.yaw)*1.45*dt,dz=Math.cos(e.yaw)*1.45*dt;if(!blocked(e.x+dx,e.z,0))e.x+=dx;if(!blocked(e.x,e.z+dz,0))e.z+=dz;}
    else if(d<2.2){e.cooldown-=dt;if(e.cooldown<=0){e.state='windup';e.age=0;emit('enemyWindup',{target:e.id});}}
    else e.state='idle';
   }
   for(const s of seals)if(input.pressed('interact')&&!s.collected&&dist(s,p)<1.3&&p.hp>0){s.collected=true;emit('seal');onSound('seal');}
   if(input.pressed('interact')&&dist(p,{x:-6,z:-9})<3.5){
    if(seals.filter(s=>s.collected).length===3&&p.hp>0){won=true;release();state('idle');emit('win');onSound('win');onWin(time);}else emit('portalLocked');
   }
  }
  reset();return {update,begin,reset,damage,clearInputs(){release();},get player(){return p;},get enemies(){return enemies;},get seals(){return seals;},get time(){return time;},get paused(){return paused;},get started(){return started;},get won(){return won;},get events(){return events;},get grabbed(){return grabbed?.id??null;},get collected(){return seals.filter(s=>s.collected).length;},snapshot(){return JSON.parse(JSON.stringify({player:p,enemies,seals,time,paused,started,won,collected:seals.filter(s=>s.collected).length,grabbed:grabbed?.id??null,events}));}};
 }
 root.HeroAdventure=Object.freeze({version:'0.10.0',ACTIONS,create});
})(globalThis);

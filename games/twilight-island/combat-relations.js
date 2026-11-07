/* V6 causal character combat, no second renderer, uses native player damage and sprites. */
(function(root){"use strict";
function create({native,events,state}){
 const C=root.ObserverNpcCatalog;
 const npcs=[];let nextId=1,clock=0,alarm=0,lastHeroDead=false;
 const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
 const here=()=>native.player.pos;
 const pos=()=>({x:here().x,z:here().z});
 function tell(type,data){events(type,data)}
 function spawn(role,x,z,relation="neutral",persisted=null){
  if(!C.ROLES[role]||npcs.filter(n=>!n.dead).length>=42)return null;
  let n={id:nextId++,role,x,z,y:native.terrainTop(x,z),hp:C.ROLES[role].hp,
    maxHp:C.ROLES[role].hp,relation,seed:Math.random()*30,state:"idle",motion:0,
    facing:1,attackCD:0,walkPhase:0,dead:false,homeX:x,homeZ:z,target:null,
    attackT:0,spawnTime:performance.now()};
  if(persisted)n={...n,...persisted,id:nextId++,role,x,z,visual:null};
  n.visual=C.createMesh(native,role,native.player.pos.clone().set(x,n.y,z));
  native.scene.add(n.visual.mesh,n.visual.ring);npcs.push(n);return n
 }
 function remove(n){
  C.dispose(n,native.scene);const i=npcs.indexOf(n);if(i>=0)npcs.splice(i,1)
 }
 function roleFromBuilding(kind,x,z){
  const roles=C.SPAWNS[kind]||[];
  const made=[];
  for(let i=0;i<roles.length;i++){
    let nx=x+(i-(roles.length-1)/2)*1.9,nz=z+2.35;
    nx=Math.max(2,Math.min(61,nx));nz=Math.max(2,Math.min(61,nz));
    made.push(spawn(roles[i],nx,nz,roles[i]==="warrior"||roles[i]==="captain"?"guard":"neutral"))
  }
  return made.filter(Boolean)
 }
 function newPerson(x,z){
  const p=here(),alive=native.G.state==="play"&&native.player.hp>0;
  if(!alive){
    if(typeof native.revivePerson!=="function")return null;
    native.revivePerson(x,z);
    const person=spawn("observer",x,z,"player");
    if(person){person.dead=true;person.visual.mesh.visible=false;person.visual.ring.visible=false}
    tell("reborn",{x,z,person:person?.id,formerDeaths:state.deaths||0});
    return {mode:"reborn"}
  }
  const n=spawn("companion",x,z,"friendly");
  if(n)tell("newCompanion",{person:n.id,x,z});
  return n
 }
 function nearAim(screenX,screenY){
  const rect=native.canvas.getBoundingClientRect(),T=native.THREE;let best=null,px=1e9;
  for(const n of npcs){
    if(n.dead||n.relation==="player"||dist(n,here())>3.4)continue;
    const point=new T.Vector3(n.x,n.y+1,n.z).project(native.camera);
    if(point.z>1||point.z<0)continue;
    const dx=((point.x+1)*.5*rect.width+rect.left)-screenX;
    const dy=((-point.y+1)*.5*rect.height+rect.top)-screenY;
    const d=Math.hypot(dx,dy);
    if(d<Math.max(32,36*native.camera.aspect)&&d<px){px=d;best=n}
  }
  return best
 }
 function strike(n,damage=2,attacker="player"){
  if(!n||n.dead)return false;
  n.hp=Math.max(0,n.hp-damage);n.state="hurt";n.attackT=.32;
  if(attacker==="player"){
    alarm=Math.max(alarm,12);
    if(n.role==="companion"&&n.relation==="friendly"){
      n.relation="hostile";n.target="player";
      tell("betrayal",{person:n.id,role:n.role});
    }else if(n.relation==="neutral"||n.relation==="guard"){
      n.relation="hostile";n.target="player";tell("assault",{person:n.id,role:n.role});
      for(const w of npcs)if(!w.dead&&["warrior","captain"].includes(w.role)&&dist(n,w)<11)w.relation="hostile";
    }
  }
  if(!n.hp){
    n.dead=true;n.state="dead";n.motion=0;
    tell("killed",{person:n.id,role:n.role,attacker});
  }else tell("wounded",{person:n.id,role:n.role,attacker});
  return true
 }
 function npcAttack(n,target,dmg){
  if(n.attackCD>0||n.dead||native.G.state!=="play")return;
  n.attackCD=(n.role==="companion"?2.2:1.25)+Math.random()*.5;
  n.state="attack";n.attackT=.25;
  if(target==="player"){
    native.hurtBy(Math.max(1,Math.round(dmg)),n.x,n.z);
    tell("playerAttacked",{role:n.role,person:n.id,hp:native.player.hp});
  }else if(target){
    // Ally only contributes modest assistance; enemy guards and monsters remain dangerous.
    strike(target,Math.max(.3,dmg),"companion")
  }
 }
 function step(n,tx,tz,dt,stop=1.4){
  const dx=tx-n.x,dz=tz-n.z,d=Math.hypot(dx,dz);
  n.motion=0;
  if(d<=stop)return d;
  const sp=C.ROLES[n.role].walk,amount=Math.min(d-stop,sp*dt);
  const nx=Math.max(2,Math.min(62,n.x+dx/d*amount));
  const nz=Math.max(2,Math.min(62,n.z+dz/d*amount));
  if(native.terrainTop(nx,nz)>native.SEA+.2){n.x=nx;n.z=nz;n.y=native.terrainTop(nx,nz);n.motion=1;n.facing=dx<0?-1:1}
  return d
 }
 function update(dt){
  clock+=Math.min(dt,.05);
  alarm=Math.max(0,alarm-dt);
  const p=here();
  if(native.G.state==="dead"&&!lastHeroDead){
    lastHeroDead=true;state.deaths=(state.deaths||0)+1;tell("playerDeath",{deaths:state.deaths});
  }
  if(native.G.state==="play")lastHeroDead=false;
  for(const n of npcs){
    if(n.dead){C.animate(n,clock,native.camera);continue}
    n.attackCD=Math.max(0,n.attackCD-dt);
    n.attackT=Math.max(0,n.attackT-dt);
    const d=dist(n,p);
    if(n.relation==="friendly"){
      if(d>2.7)step(n,p.x-1.1,p.z+1.2,dt,2);
      else n.motion=0;
      // Deliberately weak: only one blow every ~2 seconds, and no guarding player from all enemies.
      const enemy=npcs.find(o=>!o.dead&&o.relation==="hostile"&&dist(n,o)<2.0);
      if(enemy)npcAttack(n,enemy,.55);
      else{
        const foe=native.foes.find(f=>f.hp>0&&f.state!=="dissolve"&&dist(n,{x:f.segs[0].x,z:f.segs[0].z})<2);
        if(foe&&n.attackCD<=0&&typeof native.damageEnemy==="function"){
          native.damageEnemy(foe,.55);n.attackCD=2.25;n.state="attack";n.attackT=.25
        }
      }
    }else if(n.relation==="hostile"){
      if(d>1.65&&d<15)step(n,p.x,p.z,dt,1.4);
      else if(d<1.9&&native.G.state==="play")npcAttack(n,"player",C.ROLES[n.role].damage);
      else n.motion=0;
    }else if(n.relation==="guard"){
      if(alarm>0&&d<11){n.relation="hostile";tell("guardAlert",{person:n.id});}
      else if(d>10){step(n,n.homeX,n.homeZ,dt,1.3)}
      else n.motion=0;
    }else{
      const t=clock*.6+n.seed,targetX=n.homeX+Math.sin(t)*1.1,targetZ=n.homeZ+Math.cos(t)*.9;
      step(n,targetX,targetZ,dt,.5)
    }
    if(n.attackT>0)n.state=n.state==="hurt"?"hurt":"attack";
    else if(n.motion>0)n.state=n.role==="monk"?"work":"walk";
    else n.state=C.ROLES[n.role].job==="Pray"||C.ROLES[n.role].job==="Heal"?"work":"idle";
    C.animate(n,clock,native.camera)
  }
 }
 function reviveState(list){
  for(const o of list||[])if(!o.dead&&C.ROLES[o.role])spawn(o.role,o.x,o.z,o.relation,o)
 }
 function snapshot(){return npcs.map(n=>({role:n.role,x:n.x,y:n.y,z:n.z,hp:n.hp,relation:n.relation,dead:n.dead,homeX:n.homeX,homeZ:n.homeZ}))}
 return {npcs,spawn,roleFromBuilding,newPerson,nearAim,strike,update,snapshot,reviveState,
   get alert(){return alarm},setAlert:v=>{alarm=v}};
}
root.ObserverCombatRelations=Object.freeze({create});
})(window);

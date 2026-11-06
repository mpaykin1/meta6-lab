import {DialogueGenerator} from './dialogue.mjs';
import {createAshFactory} from './ash-assets.mjs';
import {createAshQuestProps,questProp} from './ash-quest-props.mjs';
import {instantiateOriginalGuest,chooseGuestOrigin} from './guest-roster.mjs';
import {createSunkenOriginalGuest} from './sunken-guest.mjs';
import {createBrain,stepBrain} from './creature-brain.mjs';
import {clamp} from './world-core.mjs';
import {createRiftEvent,RIFT_WORDS} from './rift-event.mjs';
import {chooseVisibleRiftSpot,riftVisualScale} from './rift-visibility.mjs';
import {createKeeperBubble} from './keeper-bubble.mjs';
export function riftCountdownAllowed(_land,guest){return !guest;}
export function guestHomeFor(world){return world==='ash'?'island':world==='water'?'ash':'water';}
// Only an approved original Ash guest is currently connected; never invent a source.
export const GUEST_DIALOGUE=Object.freeze({
 ash:Object.freeze([
  'Приветствую тебя, о герой. Легенды о тебе дошли до моего мира.',
  'Я Страж Пепла из Пепельного пути. Моё сердце разряжается (((, видишь, оно уже мигает красным.',
  'Без него я погибну. В моём мире у ржавой вышки лежит голубой кристалл, он зарядит сердце.',
  'Один я не дойду, на пути враги. Поможешь мне?'
 ]),
 island:Object.freeze([
  'Приветствую тебя, герой. О твоей смелости говорят даже у нас.',
  'Я Хранитель Огня с Острова сумерек. Мне холодно (((, видишь, моё пламя уже слабеет.',
  'В воде я замерзну. Мне нужен костёр, он согреет меня.',
  'Один я не выплыву, на берегу враги. Поможешь мне?'
 ]),
 sunken:Object.freeze([
  'Приветствую тебя, герой. Тебя помнят даже в глубинах моего мира.',
  'Я Страж Бездны из Затонувшего города. Мне трудно дышать (((, видишь, мои жабры мерцают красным.',
  'Без воды я погибну. Рядом с тобой есть озеро с синей водой, в воде я смогу исцелиться.',
  'Один я не доползу, мне мешают враги. Поможешь мне?'
 ])
});
export function guestDialogueLines(origin){
 if(!GUEST_DIALOGUE[origin])throw Error('Original guest origin not connected: '+origin);
 return GUEST_DIALOGUE[origin];
}
// One authoritative world-portal registry is used by collision, visuals and missions.
export const RIFT_PORTALS=Object.freeze([
 Object.freeze({id:'rift-island',world:'island',x:-22,z:32,to:Object.freeze({x:-82,z:32})}),
 Object.freeze({id:'rift-ash',world:'ash',x:-126,z:32,to:Object.freeze({x:100,z:34})}),
 Object.freeze({id:'rift-water',world:'water',x:102,z:40,to:Object.freeze({x:46,z:32})})
]);
// Gameplay names must resolve to actual rendered/interactive objects, never a
// made-up quest item. Approved crystal/tower not yet present: A06 remains OPEN.
export const WORLD_OBJECTS=Object.freeze({
 rift:Object.freeze({id:'rift',source:'rift-story.mjs',kind:'terrain-portal'}),
 rusty_tower:questProp('rusty_tower'),
 blue_crystal:questProp('blue_crystal')
});
export function missionTargetFor(world,portals=RIFT_PORTALS){
 const p=portals.find(p=>p.world===world);
 if(!p||portals.filter(q=>q.id===p.id).length!==1)throw Error('missing or duplicate actual portal in '+world);
 return p;
}
export function guestLine(home,current,state){
 const need=home==='water'&&current!=='water'?'Мне нужна вода. Проводи меня к берегу.':home==='ash'&&current==='water'?'Я замерзаю. Выведи меня к огню.':'Пепел закрыл дорогу домой. Помоги добраться до разлома.';
 return state==='friend'?'Ты не бросил меня. Я прикрою тебя.':state==='hostile'?'Ты видел, что мне нужна помощь. Теперь я защищаюсь.':state==='home'?'Дорога открыта. Это оружие теперь твоё.':need;
}
export function createRiftStory({THREE,scene,renderer,camera,player,heroTex,height,seed,toast,prepare,onTransition,attacking,onAttack,reward,getHostiles=()=>[],damageHostile=()=>{},getWorldId=()=>player.pos.y<3.6?'water':player.pos.x<-64?'ash':'island',canStart=()=>true,onEventFX=()=>{},onFreeze=()=>{}}){
 let snapshot={};try{snapshot=JSON.parse(localStorage.getItem('three-worlds-dialogue')||'{}')}catch{}
 const dialogue=new DialogueGenerator(snapshot);
 function line(g,state){const text=dialogue.next({home:g.home,world:getWorldId(),state,night:clock%120>60});try{localStorage.setItem('three-worlds-dialogue',JSON.stringify(dialogue.serialize()))}catch{}return text}
 const portals=RIFT_PORTALS,meshes=[];
 const ashQuest=createAshQuestProps({THREE,scene,height});
 let clock=0,cooldown=0,guest=null,factory=null,sheet=null,riftAge=99,mission=null,bossState=null,dialogFull='',dialogTyped=0,dialogIndex=0,dialogLines=[];
 const event=createRiftEvent(seed,{initial:typeof location!=='undefined'&&new URLSearchParams(location.search).get('guestDebug')==='1'?5:50});
 let previousPhase='idle';
 const keeperBubble=createKeeperBubble({THREE,camera});
 const choiceUI=keeperBubble.root;choiceUI.id='threeWorldsGuestChoice';
 choiceUI.setAttribute('aria-label','Разрыв: гость из другого мира');
 const question=keeperBubble.text;question.id='guestStoryText';
 const controls=document.createElement('div');controls.className='npc-say-choices';
 const help=document.createElement('button');help.textContent='Помочь';help.type='button';help.className='btn';
 const refuse=document.createElement('button');refuse.textContent='Отказаться';refuse.type='button';refuse.className='btn';
 controls.append(help,refuse);controls.hidden=true;choiceUI.append(controls);
 const GUEST_TITLES=Object.freeze({ash:'СТРАЖ ПЕПЛА',island:'ХРАНИТЕЛЬ ОГНЯ',sunken:'СТРАЖ БЕЗДНЫ'});
 let heroTyped=0;
 function nextDialogueLine(){
  if(event.state.phase!=='dialogue'||!choiceUI.open||!controls.hidden)return false;
  if(dialogTyped<dialogFull.length){dialogTyped=dialogFull.length;question.textContent=dialogFull;return true}
  if(dialogIndex<dialogLines.length-1){dialogFull=dialogLines[++dialogIndex];dialogTyped=0;question.textContent='';return true}
  return false;
 }
 function onDialogKey(e){if(event.state.phase!=='dialogue'||!choiceUI.open)return;
  if(e.key==='Escape'||e.key==='Tab'||e.ctrlKey||e.altKey||e.metaKey)return;
  if(['Shift','Control','Alt','Meta'].includes(e.key))return;
  if(controls.hidden){e.preventDefault();e.stopPropagation();nextDialogueLine();}
 }
 function onDialogTouch(e){
  if(event.state.phase!=='dialogue'||!choiceUI.open||!controls.hidden)return;
  if(e.target?.closest?.('button'))return;
  e.preventDefault();e.stopPropagation();nextDialogueLine();
 }
 document.addEventListener('keydown',onDialogKey,true);
 document.addEventListener('pointerdown',onDialogTouch,true);
 function selectChoice(value){if(controls.hidden||!event.choose(value))return;choiceUI.close();onFreeze(false);if(guest){guest.brain.relation=value==='help'?'friend':'hostile';guest.brain.state=value==='help'?'follow':'attack';toast(value==='help'?'Пойдём со мной.':'Жаль, что ты выбрал быть моим врагом.',3600)}if(value==='refuse'&&guest){guest.brain.hp=180;bossState={hp:180,maxHp:180,phase:1};onEventFX('boss');}else onEventFX('closing')}
 help.addEventListener('click',()=>selectChoice('help'));
 refuse.addEventListener('click',()=>selectChoice('refuse'));

 const geometry=new THREE.PlaneGeometry(3.5,5);
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,uniforms:{time:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 vUv;uniform float time;
 void main(){vec2 p=(vUv-.5)*2.;float slit=sin(p.y*19.+time*.9)*.06+sin(p.y*7.-time*.4)*.08;
 float w=(.16+.045*sin(p.y*31.))*(1.-smoothstep(.7,1.,abs(p.y)));
 float edge=abs(abs(p.x-slit)-w);
 float inside=1.-smoothstep(w-.03,w+.015,abs(p.x-slit));
 float fiber=exp(-edge*34.)*(.72+.28*sin(p.y*66.+time*3.));
 float teeth=step(.66,fract(p.y*18.+sin(p.y*51.)*.3))*exp(-edge*13.);
 float stars=step(.993,fract(sin(dot(floor(p*vec2(12.,44.)),vec2(12.9898,78.233)))*43758.5));
 vec3 abyss=mix(vec3(.015,.08,.14),vec3(.06,.3,.36),sin(p.y*6.+time)*.5+.5);
 vec3 rgb=abyss*(inside+stars*inside*1.5)+vec3(.17,1.,.94)*(fiber*1.7+teeth*.3);
 float alpha=clamp(inside*.8+fiber+teeth*.2,0.,.98);
 gl_FragColor=vec4(rgb,alpha);
 }`});
 for(const p of portals){const m=new THREE.Mesh(geometry,material);m.position.set(p.x,height(p.x,p.z)+2.4,p.z);scene.add(m);meshes.push(m)}
 const guestRift=new THREE.Mesh(geometry,material);guestRift.visible=false;scene.add(guestRift);
 const riftLight=new THREE.PointLight(0x38e8e6,0,9);scene.add(riftLight);
 function bake(){
  factory ||= createAshFactory(THREE);const {inst}=instantiateOriginalGuest(factory),s=new THREE.Scene();s.add(inst.root);
  const cam=new THREE.OrthographicCamera(-1.8,1.8,2.7,-.9,.1,20);cam.position.set(0,2,7);cam.lookAt(0,1,0);
  const rt=new THREE.WebGLRenderTarget(384,384,{minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter});
  const prev=renderer.getRenderTarget(),color=renderer.getClearColor(new THREE.Color()),alpha=renderer.getClearAlpha(),viewport=renderer.getViewport(new THREE.Vector4()),scissor=renderer.getScissor(new THREE.Vector4()),test=renderer.getScissorTest(),auto=renderer.autoClear;
  try{renderer.autoClear=false;renderer.setRenderTarget(rt);renderer.setClearColor(0,0);renderer.setScissorTest(true);
   for(let f=0;f<8;f++)for(let d=0;d<8;d++){inst.root.rotation.y=d*Math.PI/4;factory.animate(inst,f/8,{mode:'walk',sp:1});renderer.setViewport(d*48,f*48,48,48);renderer.setScissor(d*48,f*48,48,48);renderer.clear(true,true,true);renderer.render(s,cam)}
  }finally{renderer.setRenderTarget(prev);renderer.setClearColor(color,alpha);renderer.setViewport(viewport);renderer.setScissor(scissor);renderer.setScissorTest(test);renderer.autoClear=auto;inst.mat.dispose()}
  sheet=rt;
 }
 function spawnGuest(spot){
  if(guest)return false;
  // Directly animate the owner's original scavenger asset. This removes the
  // first-appearance WebGL readback/render-target dependency which could prevent
  // the timed guest from materializing for an idle player.
  // Always bring a visitor from ANOTHER original game, never an Ash robot
  // onto its own Ash home terrain. The Island sprite comes verbatim from
  // the owner's live npc-catalog.js + original hero texture.
  const current=getWorldId(),source=chooseGuestOrigin(current,event.state.cycle);
  const islandGuest=source.origin==='island',sunkenGuest=source.origin==='sunken';
  let inst,ref,sourceVoxels,sourceParts,islandEntity=null,sunken=null,flameLight=null;
  if(islandGuest){
    const catalog=typeof window!=='undefined'?window.ObserverNpcCatalog:null;
    if(!catalog?.ROLES?.companion||!heroTex)throw Error('Original Island companion asset is unavailable');
    const visual=catalog.createMesh({THREE,heroTex},'companion',new THREE.Vector3());
    islandEntity={visual,role:'companion',relation:'neutral',motion:0,seed,dead:false,
      state:'idle',facing:1,x:0,y:0,z:0};
    // The Island's original 6-frame NPC sprite is the actual Fire Keeper body.
    // Its weak flame is a native wisp point-light (no fabricated mesh).
    flameLight=new THREE.PointLight(0xff8c32,.75,4);
    visual.mesh.add(flameLight);
    inst={root:visual.mesh,mat:{dispose:()=>catalog.dispose(islandEntity,scene)}};
    ref=source;sourceVoxels=null;sourceParts=1;
  }else if(sunkenGuest){
    sunken=createSunkenOriginalGuest({THREE,scene});
    inst={root:sunken.root,mat:{dispose:()=>sunken.dispose()}};
    ref=source;sourceVoxels=null;sourceParts=1;
  }else{
    factory ||= createAshFactory(THREE);
    const original=instantiateOriginalGuest(factory);
    ({inst,ref,sourceVoxels,sourceParts}=original);
  }
  const target=spot||event.state.spot||{x:player.pos.x+2.6,z:player.pos.z};
  const x=target.x,z=target.z;
  const m=inst.root;m.position.set(x,height(x,z)+1.6,z);
  if(!islandGuest)m.scale.setScalar(0.92);scene.add(m);
  guestRift.position.set(x,height(x,z)+2.3,z);guestRift.visible=true;
  riftLight.position.copy(guestRift.position);riftAge=0;
  // The owner's canonical distress sign is visibly red and pulses on the
  // original Ash robot; its source voxels and animation rig stay untouched.
  let heart=null;
  if(ref.origin==='ash'){
    m.updateMatrixWorld(true);
    const box=new THREE.Box3().setFromObject(m),size=new THREE.Vector3();
    box.getSize(size);const mid=box.getCenter(new THREE.Vector3());
    const at=new THREE.Vector3(mid.x,box.min.y+size.y*.63,box.max.z+.12);
    const radius=Math.max(.11,Math.min(.2,size.y*.065));
    heart=new THREE.Mesh(new THREE.SphereGeometry(radius,10,8),
      new THREE.MeshBasicMaterial({color:0xff1a38}));
    heart.position.copy(m.worldToLocal(at));
    heart.name='ash-heart-blinking-red';
    m.add(heart);
  }
  guest={mesh:m,inst,heart,islandEntity,sunken,flameLight,brain:createBrain('original-'+ref.sourceModel,{x,z},seed),
   origin:ref.origin,originalId:ref.sourceModel,sourceVoxels,sourceParts,home:ref.origin,
   landed:false,fall:0,help:0,age:0,talk:-99,damageClock:0,rewarded:false,sourceWorld:ref.origin};
  if(guest.origin===current)throw Error('Same-world guest prohibited: '+current);
  // The guest is revealed from the depth of the original rift, without ballistic fall.
  m.visible=false;
  return true;
 }
 function finishGuest(g){
  scene.remove(g.mesh);
  if(g.heart){g.heart.geometry.dispose();g.heart.material.dispose()}
  g.inst.mat.dispose();guest=null;bossState=null;
 }
 function travel(p){prepare(p.to.x,p.to.z);player.pos.set(p.to.x,height(p.to.x,p.to.z)+.3,p.to.z);player.vel.set(0,0,0);cooldown=6;onTransition();}
 function update(dt){clock+=dt;cooldown=Math.max(0,cooldown-dt);material.uniforms.time.value=clock;
  ashQuest.update(clock);
  // §21.25: collect the ORIGINAL blue GRAF crystal next to the ORIGINAL
  // rusty Ash tower first; then escort the original guest to the real portal.
  const crystal=questProp('blue_crystal');
  if(mission&&mission.world==='ash'&&!mission.crystalCollected&&
    getWorldId()==='ash'&&ashQuest.has(crystal.id)&&
    Math.hypot(player.pos.x-crystal.x,player.pos.z-crystal.z)<1.5&&
    Math.abs(player.pos.y-height(crystal.x,crystal.z))<3){
    mission.crystalCollected=true;
    ashQuest.roots.get(crystal.id).visible=false;
    toast('Голубой кристалл найден. Теперь подойди к светящейся щели.',3500);
  }
  // A mission ends only at its genuine registered terrain portal.
  if(mission&&!mission.completed&&(mission.world!=='ash'||mission.crystalCollected)&&mission.world===getWorldId()&&
    Math.hypot(player.pos.x-mission.target.x,player.pos.z-mission.target.z)<1.25&&
    Math.abs(player.pos.y-height(mission.target.x,mission.target.z))<3){
    mission.completed=true;toast('Миссия выполнена. Награда получена.',3600);reward();
    if(guest&&guest.brain.relation==='friend')finishGuest(guest);
  }
  for(let i=0;i<portals.length;i++){const p=portals[i],m=meshes[i];m.lookAt(camera.position.x,m.position.y,camera.position.z);if(cooldown===0&&Math.hypot(player.pos.x-p.x,player.pos.z-p.z)<1.5&&Math.abs(player.pos.y-height(p.x,p.z))<3)travel(p)}
  // Owner §21.15: 5s in-world glitch, 5s held line, 5s real depth emergence.
  // Exactly one phase source controls both post FX and the terrain-anchored object.
  const phaseBefore=event.state.phase;
  function visibleSpot(previous=null){
    camera.updateMatrixWorld(true);
    const probe=new THREE.Vector3();
    const project=(x,z)=>{probe.set(x,height(x,z)+2.3,z).project(camera);
      return {x:probe.x,y:probe.y,z:probe.z}};
    const chosen=chooseVisibleRiftSpot(player.pos,project,previous);
    if(chosen)player.look.set(chosen.x-player.pos.x,0,chosen.z-player.pos.z).normalize();
    return chosen;
  }
  if(riftCountdownAllowed(true,guest)&&phaseBefore==='idle'&&event.state.remaining<=dt)
    visibleSpot();
  event.step(dt,{land:true,battle:false,occupied:!!guest,pos:player.pos,look:player.look});
  const phase=event.state.phase,spot=event.state.spot;
  if(spot&&['warning','opening','emerging'].includes(phase)){
    const selected=visibleSpot(spot);if(selected){spot.x=selected.x;spot.z=selected.z;}
  }
  const glitch=['warning','opening','closing'].includes(phase)?clamp(event.state.elapsed/5,0,1):
    phase==='emerging'?1:0;
  onEventFX('intensity',glitch);
  if(phase!==previousPhase){
    previousPhase=phase;onEventFX(phase);
    if(phase==='warning'){
      onFreeze(true);heroTyped=0;
      keeperBubble.show('ГЕРОЙ','');controls.hidden=true;
      guestRift.position.set(spot.x,height(spot.x,spot.z)+2.3,spot.z);
      guestRift.visible=true;
      riftLight.position.copy(guestRift.position);
    }
    if(phase==='opening')keeperBubble.hide();
    if(phase==='emerging')spawnGuest(spot);
    if(phase==='dialogue'){
      if(!guest)spawnGuest(spot);
      onFreeze(true);
      dialogLines=guest?guestDialogueLines(guest.origin):[];
      if(dialogLines.length!==4)throw Error('Four approved guest lines missing');
      dialogIndex=0;dialogFull=dialogLines[0];
      dialogTyped=0;question.textContent='';controls.hidden=true;
      keeperBubble.show(GUEST_TITLES[guest.origin]||'ГОСТЬ','');
    }
    if(phase==='closing'){
      keeperBubble.hide();onFreeze(true);
    }
    if(phase==='escort'&&guest){
      onFreeze(false);
      // Travel requires physical collision with the rift after the five-second reopening.
      toast('Пойдём со мной. Войди в разлом перед тобой.',4000);
    }
    if(phase==='idle'){onFreeze(false);onEventFX('idle');}
  }
  if(phase==='warning'){
    heroTyped=Math.min(RIFT_WORDS.length,heroTyped+dt/.055);
    question.textContent=RIFT_WORDS.slice(0,Math.floor(heroTyped));
    keeperBubble.place(player.pos.x,player.pos.y+2.6,player.pos.z);
  }
  if(phase==='dialogue'){
    keeperBubble.place(guest.mesh.position.x,guest.mesh.position.y+1.6,guest.mesh.position.z);
    dialogTyped=Math.min(dialogFull.length,dialogTyped+dt/.055);
    question.textContent=dialogFull.slice(0,Math.floor(dialogTyped));
    controls.hidden=dialogIndex!==dialogLines.length-1||dialogTyped<dialogFull.length;
  }
  guestRift.visible=['warning','opening','emerging','dialogue','closing','escort'].includes(phase);
  if(guestRift.visible&&spot){
    guestRift.position.set(spot.x,height(spot.x,spot.z)+2.3,spot.z);
    guestRift.lookAt(camera.position.x,guestRift.position.y,camera.position.z);
    // §21.25: warning is music+screen interference, then the slit itself opens
    // over a separate full five seconds. The escort reopens over five seconds.
    const progress=riftVisualScale(phase,event.state.elapsed);
    guestRift.scale.set(Math.max(.015,progress),Math.max(.015,progress),1);
    riftLight.position.copy(guestRift.position);
    riftLight.intensity=3*progress;
  }else riftLight.intensity=0;
  if(phase==='escort'&&guest&&spot&&
      Math.hypot(player.pos.x-spot.x,player.pos.z-spot.z)<1.0&&
      Math.abs(player.pos.y-height(spot.x,spot.z))<3){
    const from=getWorldId(),to=guest.home==='sunken'?'water':guest.home===from?guestHomeFor(from):guest.home,
      destinations={island:{x:30,z:32},ash:{x:-90,z:32},water:{x:95,z:34}},
      destination=destinations[to],target=missionTargetFor(to,portals),floor=height(destination.x,destination.z);
    travel({to:destination});
    if(to==='water')player.pos.y=Math.min(3,Math.max(floor+.35,1));
    guest.mesh.position.set(player.pos.x+1.5,height(player.pos.x+1.5,player.pos.z)+1.6,player.pos.z);
    guest.landed=true;guest.brain.relation='friend';guest.age=0;
    mission={origin:from,world:to,kind:'escort',targetId:target.id,target:{x:target.x,z:target.z},completed:false,
      requiredItemId:to==='ash'?WORLD_OBJECTS.blue_crystal.id:null,crystalCollected:to!=='ash',
      text:to==='ash'?'Новая миссия: найди голубой кристалл возле ржавой вышки.':'Новая миссия: подойди к светящейся щели в этом мире.',
      targetType:WORLD_OBJECTS.rift.id};
    if(to==='ash')ashQuest.roots.get('blue_crystal').visible=true;
    toast('Пойдём со мной. '+mission.text,7000);
    event.finishArc(mission);
  }
  if(!guest)return;const g=guest,p=g.mesh.position;g.age+=dt;g.damageClock=Math.max(0,g.damageClock-dt);
  const floor=height(p.x,p.z),distance=Math.hypot(p.x-player.pos.x,p.z-player.pos.z);
  if(!g.landed){
   // Emerge five full seconds from INSIDE the slit, at floor height: never drop onto the hero.
   const t=phase==='emerging'?clamp(event.state.elapsed/5,0,1):0;
   const deltaX=spot.x-player.pos.x,deltaZ=spot.z-player.pos.z,L=Math.hypot(deltaX,deltaZ)||1;
   const u=deltaX/L,v=deltaZ/L;
   p.x=spot.x+u*(1.6-2.2*t);p.z=spot.z+v*(1.6-2.2*t);
   p.y=height(p.x,p.z)+1.6;g.mesh.visible=t>.01;
   if(phase==='dialogue'||t>=1){g.landed=true;g.mesh.visible=true;onTransition(.1)}
  }
  else{
   if(event.dialogue)return; // Choice remains explicit; no auto-friendship.
   const attack=attacking();if(attack&&distance<3&&g.damageClock===0){g.brain.hp-=12;g.brain.relation='hostile';g.damageClock=.7;if(bossState){bossState.hp=Math.max(0,g.brain.hp);bossState.phase=g.brain.hp<90?2:1;}toast(line(g,'hostile'),2600)}
   if(g.brain.hp<=0){if(event.state.phase==='boss'){reward();event.finishArc({kind:'victory',world:getWorldId(),text:'Победа над гостем из разлома.'});toast('Победа. Награда получена.',4000)}finishGuest(g);return}
   // The visitor never silently switches allegiance: the player's choice is authoritative.
   stepBrain(g.brain,p,dt,{player:player.pos,height:(x,z)=>height(x,z)+1.6,sea:3.8});
   if(g.brain.relation==='hostile'&&distance<2&&g.damageClock===0){onAttack();g.damageClock=2}
   if(g.brain.relation==='friend'&&!g.rewarded&&g.damageClock===0){
    const nearby=getHostiles().filter(h=>Math.hypot(h.x-p.x,h.z-p.z)<9).sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z));
    if(nearby.length){damageHostile(nearby[0],8);g.damageClock=1.5;}
   }
   // The guide persists until its registered mission objective is reached.
  }
  g.mesh.rotation.y=Number.isFinite(g.brain.heading)?g.brain.heading:Math.atan2(camera.position.x-p.x,camera.position.z-p.z);
  if(g.heart)g.heart.scale.setScalar(.58+.42*(.5+.5*Math.sin(clock*9)));
  if(g.flameLight)g.flameLight.intensity=.22+.48*(.5+.5*Math.sin(clock*5));
  if(g.islandEntity){
    const e=g.islandEntity;e.x=p.x;e.y=p.y-1.6;e.z=p.z;
    e.motion=g.landed?.35:0;e.state=g.landed?'walk':'idle';
    window.ObserverNpcCatalog.animate(e,clock,camera);
  }else if(g.sunken){
    g.sunken.update(dt,clock);
  }else{
    factory.uniforms.uTime.value=clock;
    factory.animate(g.inst,clock,{mode:g.landed?'walk':'idle',sp:g.landed?.7:0});
  }
 }
 function dispose(){ashQuest.dispose();document.removeEventListener('keydown',onDialogKey,true);document.removeEventListener('pointerdown',onDialogTouch,true);onFreeze(false);keeperBubble.dispose();for(const m of meshes)scene.remove(m);scene.remove(guestRift,riftLight);geometry.dispose();material.dispose();if(guest){scene.remove(guest.mesh);if(guest.heart){guest.heart.geometry.dispose();guest.heart.material.dispose()}guest.inst.mat.dispose()}sheet?.dispose();factory?.dispose()}
 return {update,dispose,travel,portals,ashQuest,spawnGuest,choose:selectChoice,get locked(){return event.blocked},get event(){return {...event.state}},get riftMesh(){return guestRift},get guest(){return guest},get mission(){return mission},get boss(){return bossState?{...bossState}:null},get eventTimer(){return {...event.state,remaining:event.state.remaining}}};
}

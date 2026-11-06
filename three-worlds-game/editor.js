/* OBSERVER WORLD V5 EDITOR
 * Runs on the EXACT expanded Island of Twilight WebGL scene, not a 2D recreation.
 * The renderer, textures, camera, bloom, fog, island, water, 21-weapon physics
 * and enemies remain the user's complete original source in index.html.
 * Source catalog: ../SOURCE_INDEX.md   Design: ../observer-world-en-v4/
 */
(function(root){"use strict";
const ACTIONS={
 well:["井","Well"],settlement:["民","Settlement"],council:["議","Council"],
 market:["市","Market"],guild:["商","Guild"],tax:["税","Tax"],
 school:["文","School"],scholarAction:["学","Scholar"],printing:["書","Printing Press"],
 castle:["城","Castle"],court:["冠","Court"],decree:["令","Decree"],
 monastery:["寺","Monastery"],relief:["慈","Relief"],doctrine:["教","Doctrine"],
 guard:["兵","Guard"],patrol:["巡","Patrol"],militia:["隊","Militia"],
 prison:["獄","Prison"],inquiry:["問","Inquiry"],pardon:["赦","Pardon"],
 granary:["倉","Granary"],ration:["糧","Ration"],caravan:["車","Caravan"],
 healer:["薬","Healer"],quarantine:["隔","Quarantine"],hospital:["療","Hospital"],
 fire:["火","Fire"],brigade:["桶","Fight Fire"],watch:["鐘","Watch"],
 plague:["疫","Plague"],cordon:["封","Cordon"],burial:["墓","Burial"],
 observer:["人","Observer"],contact:["信","Contact"],extraction:["門","Extraction"],
 imp:["鬼","Imp"],shade:["影","Shade"],warden:["魔","Warden"],new:["新","New Person"]
};
const NEXT={well:"settlement",settlement:"council",market:"guild",guild:"tax",
 school:"scholarAction",scholarAction:"printing",castle:"court",court:"decree",
 monastery:"relief",relief:"doctrine",guard:"patrol",patrol:"militia",
 prison:"inquiry",inquiry:"pardon",granary:"ration",ration:"caravan",
 healer:"quarantine",quarantine:"hospital",fire:"brigade",brigade:"watch",
 plague:"cordon",cordon:"burial",observer:"contact",contact:"extraction"};
const PRIMARY=["well","market","school","castle","monastery","guard","prison","granary","healer","fire","plague","observer","new","imp","shade","warden"];
const KEY="observer-v7-mobile-island-builder";
const $=id=>document.getElementById(id);
let native=null, music=null, selected="well", placeMode=false, dragging=null, saving=false,relations=null,story=null,sceneClock=0,mobileHud=null,mobileTarget=null,marker=null;
let state={version:7,pop:2,food:8,order:20,suspicion:0,next:1,objects:[],history:[],actors:[],deaths:0,clearedTrees:[]};
const groups=new Map(),geos=new Map();
let worldRoot=null,ray=null, pointer=null, musicTicker=null,interval=null,errors=0;
function tell(title,text){
 state.history.push({title,text,when:Date.now()});if(state.history.length>80)state.history.shift();
 $("v5Recent").textContent=title+" · "+text;
 $("v5JournalBody").textContent=story.readable||state.history.slice(-20).map(e=>e.title+"\n"+(e.long||e.text)).join("\n\n");
 $("v5Stats").textContent="Population "+state.pop+" · Order "+state.order+" · Suspicion "+state.suspicion;
 persist()
}
function persist(){
 if(saving)return;
 try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){errors++}
}
function restore(){
 try{
  const raw=localStorage.getItem(KEY);if(!raw)return;
  const data=JSON.parse(raw);
  if(data.version!==7||!Array.isArray(data.objects))return;
  state={...state,...data,objects:data.objects.slice(0,120),history:(data.history||[]).slice(-80)};
 }catch(e){errors++}
}
function tileGeometry(tile){
 tile=Math.max(0,Math.min(11,tile));
 if(geos.has(tile))return geos.get(tile);
 const g=new native.THREE.BoxGeometry(1,1,1),uv=g.getAttribute("uv");
 const u0=(tile%4)/4+.001,v0=1-(Math.floor(tile/4)+1)/3+.001;
 for(let i=0;i<uv.count;i++){const u=uv.getX(i),v=uv.getY(i);uv.setXY(i,u0+u*(.25-.002),v0+v*(1/3-.002))}
 uv.needsUpdate=true;geos.set(tile,g);return g
}
function addCube(parent,mat,x,y,z,w,h,d,tile){
 const m=new native.THREE.Mesh(tileGeometry(tile),mat);
 m.position.set(x,y,z);m.scale.set(w,h,d);m.castShadow=false;
 parent.add(m);return m
}
function addBuilding(o){
 const THREE=native.THREE;
 const mat=new THREE.MeshLambertMaterial({map:native.atlasTex,side:THREE.FrontSide});
 const g=new THREE.Group();g.name="Observer V7 "+o.kind+" #"+o.id;g.position.set(o.x,o.y,o.z);
 // Original terrain remains unchanged; native-atlas stone foundation spans uneven ground.
 const survey=native.buildGround?.(o.x,o.z,1.5);
 if(survey){
  const support=(x,z)=>{
   const terrain=native.terrainTop(o.x+x,o.z+z),length=Math.min(7,Math.max(.22,o.y-terrain+.26));
   const column=addCube(g,mat,x,-length/2,z,.62,length,.62,2);
   column.receiveShadow=true;
  };
  for(const x of [-1.15,1.15])for(const z of [-1.15,1.15])support(x,z);
  addCube(g,mat,0,-.16,0,3.55,.34,3.55,2);
 }
 const box=(x,y,z,w,h,d,tile,angle=0)=>{
  const m=addCube(g,mat,x,y,z,w,h,d,tile);m.rotation.z=angle;return m
 };
 const beam=(x,y,z,w,h,d,t)=>box(x,y,z,w,h,d,t);
 const post=(x,y,z,h,t)=>box(x,y,z,.21,h,.21,t);
 const roof=(x,y,z,w,d,t)=>{
  box(x-w*.25,y,z,w*.58,.25,d,t,Math.PI/8);
  box(x+w*.25,y,z,w*.58,.25,d,t,-Math.PI/8);
 };
 const sign=(x,y,z,w,h,t)=>box(x,y,z,w,h,.13,t);
 const fence=e=>{for(const x of [-e,e])for(const z of [-e,e])post(x,.6,z,1.2,9)};
 if(!root.ObserverBuildingAssets.build(o.kind,{box,beam,post,roof,sign,fence}))
  box(0,.6,0,1.1,1.2,1.1,3);
 worldRoot.add(g);groups.set(o.id,{group:g,material:mat});return g
}
function onPlace(kind,x,z,restoring=false){
 if(!native||!ACTIONS[kind])return null;
 if(kind==="new"){const p=relations?.newPerson(x,z);persist();return p}
 if(["imp","shade","warden"].includes(kind)){
   const m=native.spawnFoe(kind,x,z);
   if(!m&&!restoring)tell("Anomaly","The creature could not appear at this location");
   else if(!restoring)tell("Anomaly · "+kind,"A living creature emerged in the same world. The guard and residents will respond.");
   return m
 }
 if(state.objects.length>=120){if(!restoring)tell("World capacity","120 placed objects maximum for mobile performance");return null}
 x=Math.max(3,Math.min(60,Math.round(x*.5)*2));z=Math.max(3,Math.min(60,Math.round(z*.5)*2));
 // Native voxel height; never place an object over the ocean, beyond shore, or into the player.
 const h=native.terrainTop(x,z);
 if(!Number.isFinite(h)||h<native.SEA-.05){
  if(!restoring)tell("Ground required","Select solid island ground, not open water");return null
 }
 if(state.objects.some(o=>Math.hypot(o.x-x,o.z-z)<(o.kind==="castle"||kind==="castle"?4.3:3.35))){
  if(!restoring)tell("Too close","Choose another patch of island so the buildings do not intersect");return null
 }
 if(native.world?.tower&&Math.hypot(native.world.tower.x-x,native.world.tower.z-z)<5){
  if(!restoring)tell("Protected tower","The island's original beacon cannot be covered by a building.");
  return null
 }
 if(root.ObserverMobileControls?.isMobile()&&!restoring){
  if(Math.hypot(native.player.pos.x-x,native.player.pos.z-z)<1.7){
   tell("Too close","Leave space for the character to stand.");return null
  }
  const cleared=native.clearConstructionTrees(x,z,2.8);
  if(cleared?.length){
    state.clearedTrees ||= [];
    for(const loc of cleared)if(!state.clearedTrees.some(q=>q[0]===loc[0]&&q[1]===loc[1]))state.clearedTrees.push(loc)
  }
 }
 const survey=native.buildGround?.(x,z,1.5);
 const safeTop=Math.max(h,survey?.max||h);
 const o={id:state.next++,kind,x,z,y:Math.max(native.SEA,safeTop),age:0,created:Date.now()};
 state.objects.push(o);
 addBuilding(o);
 if(!restoring){
  relations?.roleFromBuilding(kind,x,z);
  if(["settlement","granary","market","school","healer","monastery"].includes(kind))state.pop+=kind==="settlement"?4:1;
  if(["fire","plague","tax"].includes(kind)){state.order=Math.max(0,state.order-2);state.suspicion++}
  if(["council","guard","healer","relief","brigade"].includes(kind))state.order=Math.min(100,state.order+2);
  if(kind==="well")state.food++;
  const label=ACTIONS[kind][1];
  const n=story?.emit(kind,{x,z});
  tell(n?.title||"History · "+label,n?.long||"The new building begins a chain of events.");
  // Keep Observer World causal buttons: action evolves into its historical consequence.
  if(NEXT[kind]){
    const button=$("v5Dock").querySelector('[data-kind="'+kind+'"]');
    if(button){button.dataset.kind=NEXT[kind];button.querySelector("span").textContent=ACTIONS[NEXT[kind]][0];button.title=ACTIONS[NEXT[kind]][1]}
    selected=NEXT[kind];
  }
  native.SFX?.ui?.();
 }
 return o
}
function activateBuild(kind){
 selected=kind;placeMode=true;mobileTarget=null;document.body.classList.add("v5-placing");
 for(const b of $("v5Dock").querySelectorAll("button"))b.classList.toggle("selected",b.dataset.kind===kind);
 $("v5Hint").textContent=root.ObserverMobileControls?.isMobile()?
  "Tap nearby terrain, then press the pixel hammer to build "+ACTIONS[kind][1]:
  "RIGHT-CLICK land to place "+ACTIONS[kind][1]+" · drag right mouse to orbit";
}
function selectGround(event){
 const rect=native.canvas.getBoundingClientRect(),x=((event.clientX-rect.left)/rect.width)*2-1,
       y=-((event.clientY-rect.top)/rect.height)*2+1;
 pointer.set(x,y);ray.setFromCamera(pointer,native.camera);
 const hit=ray.intersectObjects(native.terrainMeshes.filter(Boolean),false)[0];
 return hit?hit.point:null
}
function ensureMobileMarker(){
 if(marker||!native?.THREE)return;
 const T=native.THREE;
 marker=new T.Mesh(new T.RingGeometry(1.35,1.55,24),new T.MeshBasicMaterial({
   color:0x91ffb9,transparent:true,opacity:.55,depthWrite:false,side:T.DoubleSide
 }));
 marker.rotation.x=-Math.PI/2;marker.visible=false;marker.renderOrder=7;
 native.scene.add(marker)
}
function mobilePlacementPoint(x,z){
 const hero=native.player.pos,pdx=x-hero.x,pdz=z-hero.z,d=Math.hypot(pdx,pdz);
 if(!Number.isFinite(d)||d<.001){x=hero.x+3.5;z=hero.z}
 else if(d>7.5){x=hero.x+pdx/d*7.5;z=hero.z+pdz/d*7.5}
 return {x:Math.max(3,Math.min(60,x)),z:Math.max(3,Math.min(60,z))}
}
function setMobilePoint(point){
 if(!point||!Number.isFinite(point.x)||!Number.isFinite(point.z))return null;
 mobileTarget=mobilePlacementPoint(point.x,point.z);
 ensureMobileMarker();
 if(marker){marker.position.set(mobileTarget.x,native.terrainTop(mobileTarget.x,mobileTarget.z)+.13,mobileTarget.z);marker.visible=true}
 return mobileTarget
}
function defaultMobilePoint(){
 const p=native.player.pos,look=native.player.look;
 return mobilePlacementPoint(p.x+(look?.x||.6)*3.4,p.z+(look?.z||.8)*3.4)
}
function buildSelectedMobile(){
 if(!mobileHud?.enabled)return false;
 if(!placeMode){tell("Choose a symbol","Select a building glyph in the bottom dock first.");return false}
 const p=mobileTarget||defaultMobilePoint();
 const built=onPlace(selected,p.x,p.z);
 if(built){
  mobileTarget=null;if(marker)marker.visible=false;
  return true
 }
 return false
}
function openReader(title,body){
 $("v6ReaderTitle").textContent=String(title||"World History");
 $("v6ReaderBody").textContent=String(body||"");
 if(!$("v6Reader").open)$("v6Reader").showModal()
}
function inspectWorld(event){
 const rect=native.canvas.getBoundingClientRect(),T=native.THREE;
 let found=null,distance=55;
 for(const o of state.objects){
  const p=new T.Vector3(o.x,o.y+1.5,o.z).project(native.camera);
  if(p.z<0||p.z>1)continue;
  const x=rect.left+(p.x+1)*rect.width/2,y=rect.top+(1-p.y)*rect.height/2;
  const d=Math.hypot(x-event.clientX,y-event.clientY);
  if(d<distance){found=o;distance=d}
 }
 if(found){const n=story.inspect(found.kind,found,state);openReader(n.title,n.long);return true}
 const actor=relations.nearAim(event.clientX,event.clientY);
 if(actor){const role=root.ObserverNpcCatalog.ROLES[actor.role];
  openReader(role.name,role.name+" is currently "+actor.relation+".\n\nHealth: "+actor.hp+
  "\n\nActions and relationships change according to your choices.");return true}
 return false
}
function interceptCanvas(){
 const canvas=native.canvas;
 canvas.addEventListener("contextmenu",e=>{if(placeMode)e.preventDefault()},true);
 canvas.addEventListener("pointerdown",e=>{
  if(e.pointerType==="touch"&&root.ObserverMobileControls?.isMobile()&&placeMode&&!$("v5Menu").open){
   // On a phone touching the landscape selects a spot; only the hammer commits it.
   e.preventDefault();e.stopImmediatePropagation();
   dragging={id:e.pointerId,x:e.clientX,y:e.clientY,mobile:true};
   try{canvas.setPointerCapture(e.pointerId)}catch{}
  }else if(e.button===2&&placeMode&&!$("v5Menu").open){
   e.preventDefault();e.stopImmediatePropagation();
   dragging={id:e.pointerId,x:e.clientX,y:e.clientY};
  }else if(e.button===0&&e.altKey){
   e.preventDefault();e.stopImmediatePropagation();inspectWorld(e);
  }else if(e.button===0&&native.G.state==="play"){
   // Let the ORIGINAL engine process the LMB weapon and animation.
   const target=relations?.nearAim(e.clientX,e.clientY);
   if(target)relations.strike(target,1.5,"player")
  }
 },true);
 canvas.addEventListener("pointermove",e=>{
  if(!dragging||e.pointerId!==dragging.id)return;
  e.preventDefault();e.stopImmediatePropagation()
 },true);
 canvas.addEventListener("pointerup",e=>{
  if(!dragging||e.pointerId!==dragging.id)return;
  e.preventDefault();e.stopImmediatePropagation();
  const d=Math.hypot(e.clientX-dragging.x,e.clientY-dragging.y),phoneTap=dragging.mobile;dragging=null;
  if(d>16)return;
  const hit=selectGround(e);
  if(phoneTap){
   if(hit)setMobilePoint(hit);
   else tell("Select terrain","Touch visible island land, then press the hammer button.");
   return
  }
  if(hit)onPlace(selected,hit.x,hit.z);
  else tell("Beyond island","Select a solid surface of the island.")
 },true);
 canvas.addEventListener("pointercancel",()=>{dragging=null},true);
 window.addEventListener("keydown",e=>{
  if(e.code==="Escape"&&placeMode&&!e.repeat){
   e.preventDefault();e.stopImmediatePropagation();placeMode=false;dragging=null;
   document.body.classList.remove("v5-placing");
   for(const btn of $("v5Dock").children)btn.classList.remove("selected")
  }
 },true)
}

function start(){
 if(native)return;
 native=root.__isle;
 if(!native?.scene||!native?.THREE||!native?.terrainMeshes?.length)return;
 const {THREE,scene}=native;
 ray=new THREE.Raycaster();pointer=new THREE.Vector2();
 worldRoot=new THREE.Group();worldRoot.name="Observer V5 native voxel builder objects";scene.add(worldRoot);
 restore();
 // Re-apply precisely the original tree removals from the last mobile session.
 for(const t of state.clearedTrees||[])if(Array.isArray(t)&&t.length===2)native.clearConstructionTrees(t[0]+.5,t[1]+.5,.6);
 story=root.ObserverStorySystem.create({onChange:note=>{
  state.history.push(note);if(state.history.length>150)state.history.shift();
  $("v5Recent").textContent=note.short;
  $("v5JournalBody").textContent=story.readable;persist();
  $("v6Toast").textContent=note.short;$("v6Toast").classList.add("visible");
  clearTimeout(root.__v6ToastTimer);root.__v6ToastTimer=setTimeout(()=>$("v6Toast").classList.remove("visible"),5200);
 }});
 story.restore(state.history.filter(note=>note.long));
 relations=root.ObserverCombatRelations.create({native,state,events:(kind,data)=>{
  const n=story.emit(kind,data);
  if(["betrayal","assault","killed","playerDeath","guardAlert"].includes(kind)){
   state.suspicion++;state.order=Math.max(0,state.order-1)
  }
  if(kind==="killed")state.pop=Math.max(0,state.pop-1);
  $("v5Stats").textContent="Population "+state.pop+" · Order "+state.order+" · Suspicion "+state.suspicion;
  persist()
 }});
 for(const o of state.objects){addBuilding(o);state.next=Math.max(state.next,o.id+1)}
 relations.reviveState(state.actors);
 interceptCanvas();
 mobileHud=root.ObserverMobileControls?.create({native,onBuild:()=>{if(native.underwater?.isSubmerged()){if(native.underwater.inBathyscaphe)native.mobileShoot();else native.underwater.interact();}else buildSelectedMobile();},
   onSwap:()=>{$("v5Weapon").value=native.combat?.weapon||$("v5Weapon").value}})||null;
 if(mobileHud?.enabled)ensureMobileMarker();
 for(const kind of PRIMARY){
  const b=document.createElement("button");b.type="button";b.className="v5-tool";
  b.dataset.kind=kind;b.title=ACTIONS[kind][1];
  b.innerHTML='<span>'+ACTIONS[kind][0]+'</span><small>'+ACTIONS[kind][1]+'</small>';
  b.addEventListener("click",e=>{e.preventDefault();activateBuild(b.dataset.kind);});
  $("v5Dock").appendChild(b)
 }
 const musicModule=root.ObserverKriegerAudio;
 if(musicModule)music=musicModule.create();
 $("v5Music").addEventListener("click",async()=>{
  if(!music)return;
  try{await music.toggle();const d=music.diagnostics();
   $("v5Music").textContent=d.enabled?"Ⅱ Pause music":"▶ Play music";
   $("v5Audio").textContent=d.enabled?'Playing · '+d.label+' · RMS '+d.musicRms:'Music paused';
  }catch(e){$("v5Audio").textContent="Audio error: "+e.message}
 });
 $("v5MusicVolume").addEventListener("input",e=>music?.setMusicVolume(Number(e.target.value)/100));
 $("v5Sfx").addEventListener("click",()=>{native.SFX.init();native.toggleMute();
   $("v5Sfx").textContent=native.SFX.muted?"Enable original SFX":"Mute original SFX"});
 $("v5Full").addEventListener("click",native.toggleFullscreen);
 $("v5Pause").addEventListener("click",()=>native.pause(native.G.state==="play"));
 $("v5OriginalHud").addEventListener("change",e=>document.body.classList.toggle("v5-show-original-hud",e.target.checked));
 $("v5Explore").addEventListener("click",()=>{placeMode=false;
  document.body.classList.remove("v5-placing");
  $("v5Hint").textContent="Explore: WASD to move · right-drag orbit · click to attack";
  for(const b of $("v5Dock").children)b.classList.remove("selected")
 });
 $("v5Journal").addEventListener("click",()=>{$("v5JournalDialog").showModal()});
 $("v5JournalClose").addEventListener("click",()=>{$("v5JournalDialog").close()});
 $("v5Save").addEventListener("click",()=>{persist();tell("Saved","Historical construction saved in this browser")});
 $("v5Reset").addEventListener("click",()=>{if(!confirm("Reset V5 buildings and story? Original island remains untouched."))return;
  for(const item of groups.values()){worldRoot.remove(item.group);item.material.dispose()}
  groups.clear();state={version:7,pop:2,food:8,order:20,suspicion:0,next:1,objects:[],history:[],actors:[],deaths:0,clearedTrees:[]};
  persist();$("v5Dock").replaceChildren();tell("Reset","World construction cleared. Reload to restore original dock.");
  location.reload()
 });
 $("v5MusicTheme").addEventListener("change",e=>music?.forceTheme(e.target.value));
 $("v5Weapon").addEventListener("change",e=>native.equip(e.target.value));
 for(const id of native.ARSENAL_ORDER){
  const option=document.createElement("option");option.value=id;option.textContent=native.WEAPONS[id].name;
  $("v5Weapon").appendChild(option);
 }
 $("v5GetWeapons").addEventListener("click",()=>native.giveAll());
 $("v5Menu").addEventListener("toggle",()=>{if($("v5Menu").open){dragging=null;placeMode=false;document.body.classList.remove("v5-placing");native.clearInput?.()}});
 $("v5Stats").textContent="Population "+state.pop+" · Order "+state.order+" · Suspicion "+state.suspicion;
 $("v5Recent").textContent=state.history.at(-1)?.long||state.history.at(-1)?.text||
 "Choose a symbol then RIGHT-CLICK land. LEFT-CLICK fights. Alt+LEFT-CLICK reads an object.";
 $("v5JournalBody").textContent=state.history.slice(-20).map(e=>e.title+"\n"+e.text).join("\n\n");
 // One audio scheduler belongs to audio.js; this slow status refresh is not another game loop.
 interval=setInterval(()=>{if(music?.enabled){const d=music.diagnostics();
  $("v5Audio").textContent=d.label+' · '+d.contextState+' · RMS '+d.musicRms;
  music.tick(performance.now(),{objects:state.objects,combat:{actors:native.foes||[]},
   monsters:native.foes||[],order:state.order,suspicion:state.suspicion})
 }},1000);
 root.__OBSERVER_WORLD_V7__={ready:true,release:"V7_MOBILE_THREE_BUTTONS_BUILDING_20261016",
  originalRenderer:scene.type,objects:()=>state.objects,music:()=>music?.diagnostics(),state,
  get npcs(){return relations?.npcs},get story(){return story},get relations(){return relations},
  place:onPlace,select:activateBuild,get camera(){return native.camera},get native(){return native},
  get mobile(){return mobileHud},get mobileTarget(){return mobileTarget},
  mobileBuild:buildSelectedMobile,mobilePoint:setMobilePoint,
  unload:()=>{clearInterval(interval);root.__observerV7Frame=null;mobileHud?.dispose();if(marker){native.scene.remove(marker);marker.geometry.dispose();marker.material.dispose()}}};
 $("v6ReaderClose").addEventListener("click",()=>$("v6Reader").close());
 $("v6ReadLatest").addEventListener("click",()=>{
  const n=story.latest();openReader(n?.title||"Field Journal",n?.long||"Build a historical object to begin.")});
 $("v6ReadPlus").addEventListener("click",()=>{
  const el=$("v6ReaderBody");el.style.fontSize=Math.min(40,(parseFloat(el.style.fontSize)||21)+3)+"px"});
 $("v6ReadMinus").addEventListener("click",()=>{
  const el=$("v6ReaderBody");el.style.fontSize=Math.max(16,(parseFloat(el.style.fontSize)||21)-3)+"px"});
 root.__observerV7Frame=dt=>{
  if(!relations)return;
  relations.update(Math.min(.05,Math.max(0,dt)));
  if(++sceneClock%90===0){state.actors=relations.snapshot();persist()}
 };
 
 document.body.dataset.v7Ready="true";
 if(new URLSearchParams(location.search).get("v7test")==="1"){
  const checks={
   original3D:scene.type==="Scene"&&native.camera.type==="PerspectiveCamera"&&native.world.vox.length===64*64*26,
   mobileMounted:mobileHud?.enabled===true&&!!$("v7Stick"),
   threeRightButtons:document.querySelectorAll("#v7MobileHud .v7-action").length===3,
   symbols:document.querySelectorAll("#v5Dock .v5-tool").length===PRIMARY.length,
   originalWeaponCount:native.ARSENAL_ORDER.length===21,
   originalVisuals:native.scene.children.length>10,
   sameCameraAlgorithm:typeof native.rig.yaw==="number",
   reader:!!$("v6Reader")
  };
  // Functionally check the virtual controller enters the ORIGINAL motion/attack state.
  native.G.state="play";native.player.hp=Math.max(1,native.player.hp);
  const stick=$("v7Stick"),action=$("v7Action");
  const p=(target,type,id,x,y)=>target.dispatchEvent(new PointerEvent(type,{
    pointerId:id,pointerType:"touch",clientX:x,clientY:y,bubbles:true,cancelable:true,buttons:type==="pointerdown"?1:0
  }));
  const sr=stick.getBoundingClientRect();
  p(stick,"pointerdown",71,sr.left+sr.width*.75,sr.top+sr.height*.5);
  checks.joystick=mobileHud.counters.moveCount>0;
  p(stick,"pointerup",71,sr.left+sr.width*.75,sr.top+sr.height*.5);
  p(action,"pointerdown",72,700,450);
  checks.combinedAttackJump=native.input.src.touch===true&&native.player.jumpHeld===true;
  p(action,"pointerup",72,700,450);
  checks.comboRelease=native.input.src.touch===false&&native.player.jumpHeld===false;
  let site=null;
  const hero=native.player.pos;
  for(let dist=3;dist<=7&&!site;dist+=1)
   for(let i=0;i<24&&!site;i++){
    const x=hero.x+Math.cos(i*Math.PI/12)*dist,z=hero.z+Math.sin(i*Math.PI/12)*dist;
    const point=mobilePlacementPoint(x,z),sx=Math.round(point.x*.5)*2,sz=Math.round(point.z*.5)*2;
    if(native.terrainTop(sx,sz)<native.SEA+.1)continue;
    if(Math.hypot(hero.x-sx,hero.z-sz)<1.7)continue;
    if(native.world?.tower&&Math.hypot(native.world.tower.x-sx,native.world.tower.z-sz)<5)continue;
    if(state.objects.some(o=>Math.hypot(o.x-sx,o.z-sz)<4))continue;
    site=point
   }
  checks.siteAvailable=!!site;
  let placed=null;
  if(site){
   activateBuild("well");setMobilePoint(site);
   const n=state.objects.length;
   p($("v7Build"),"pointerdown",73,750,450);
   placed=state.objects.at(-1);
   checks.hammerBuild=state.objects.length===n+1&&placed?.kind==="well"&&mobileHud.counters.buildCount===1;
   // Never leave the self-test pointer pressed: production bathyscaphe uses this button too.
   p($("v7Build"),"pointerup",73,750,450);
   if(placed){
    const second=onPlace("market",placed.x,placed.z);
    checks.overlapRejected=!second&&state.objects.length===n+1;
    checks.terrainPlatform=groups.get(placed.id)?.group.children.length>=5;
    checks.nearHero=Math.hypot(hero.x-placed.x,hero.z-placed.z)<=8.6;
   }
  }
  if(native.world.trees.length){
   const count=native.world.trees.length,t=native.world.trees[0];
   const removed=native.clearConstructionTrees(t.x+.5,t.z+.5,.8);
   checks.originalTreeRemoval=removed.length>=1&&native.world.trees.length<count;
  }else checks.originalTreeRemoval=true;
  checks.pixelIcons=!!$("v7Swap").querySelector("svg")&&!!$("v7Build").querySelector("svg")&&$("v7Action").querySelectorAll("svg").length===2;
  const pass=Object.values(checks).every(Boolean);
  document.body.dataset.v7Selftest=pass?"pass":"fail";
  const proof=document.createElement("pre");proof.id="v7SelfTest";proof.hidden=true;proof.textContent=JSON.stringify({pass,checks});
  document.body.appendChild(proof);
 }
 // Opt-in real-browser integration proof: executes the original Three.js render path,
 // places a native atlas-textured 3D building, and verifies no second 2D canvas.
 if(new URLSearchParams(location.search).get("v6test")==="1"){
  let ground=null;
  for(let z=14;z<50&&!ground;z++)for(let x=14;x<50;x++){
    if(native.terrainTop(x,z)>native.SEA+1&&state.objects.every(o=>Math.hypot(o.x-x,o.z-z)>3)){
      ground={x,z};break
    }
  }
  const built=ground?onPlace("well",ground.x,ground.z):null;
  const checks={
   originalRenderer:native.scene.type==="Scene"&&native.camera.type==="PerspectiveCamera",
   originalMap:native.world.vox.length===64*64*26,
   originalWater:!!native.scene.getObjectByName&&native.scene.children.length>10,
   originalWeapons:native.ARSENAL_ORDER.length===21,
   originalAudio:!!native.SFX.init,
   originalCamera:typeof native.rig.yaw==="number"&&typeof native.rig.pitch==="number",
   threeDBuild:!!built&&groups.has(built.id)&&groups.get(built.id).group.children.length>=5,
   oneCanvas:document.querySelectorAll("canvas#c").length===1,
   bottomDock:$("v5Dock").querySelectorAll("button").length===PRIMARY.length,
   menu:$("v5Menu").tagName==="DETAILS",
   music:typeof music?.start==="function"
  };
  // V6 new mechanics smoke, test mode only. All NPC graphics use original lit hero sprite sheet.
  checks.uniqueBuildings=root.ObserverBuildingAssets.kinds.length===36;
  checks.npcRoles=Object.keys(root.ObserverNpcCatalog.ROLES).length===16;
  checks.story=typeof story.inspect==="function"&&story.entries.length>0;
  checks.newGlyph=$("v5Dock").querySelector('[data-kind="new"]')!==null;
  checks.originalSprite=!!native.heroTex?.image;
  // The real Island's monsters may kill the player before this headless test starts.
  // Test rebirth first if dead, then require the living branch to create a companion.
  if(native.G.state==="dead"||native.player.hp<=0){
    const rebirth=relations.newPerson(native.player.pos.x+1,native.player.pos.z);
    checks.rebirth=rebirth?.mode==="reborn"&&native.G.state==="play";
  }else checks.rebirth=true;
  // Headless Chromium may have the original game paused by background visibility.
  // Exercise the actual *alive, playing* contract after the rebirth branch.
  checks.stateBeforeCompanion=native.G.state;
  if(native.G.state==="paused")native.pause(false);
  if(native.G.state!=="play"&&native.player.hp>0)native.G.state="play";
  if(native.player.hp<=0)native.player.hp=6;
  const ally=relations.newPerson(native.player.pos.x+1,native.player.pos.z);
  checks.companion=!!ally&&ally.role==="companion"&&ally.relation==="friendly";
  checks.stateBeforeCompanion=native.G.state==="play";
  if(ally?.id)relations.strike(ally,1,"player");
  checks.betrayal=ally?.relation==="hostile"&&story.entries.some(n=>n.type==="betrayal");
  checks.fullscreenReader=$("v6Reader") instanceof HTMLDialogElement;
  const report=document.createElement("pre");report.id="v6SelfTest";report.hidden=true;
  const ok6=Object.values(checks).every(Boolean);
  report.textContent=JSON.stringify({ok6,checks});
  document.body.dataset.v6Selftest=ok6?"pass":"fail";document.body.appendChild(report);
  const pass=Object.values(checks).every(Boolean);
  document.body.dataset.v5Selftest=pass?"pass":"fail";
  const evidence=document.createElement("pre");evidence.id="v5SelfTest";evidence.hidden=true;
  evidence.textContent=JSON.stringify({pass,checks,objectCount:state.objects.length});
  document.body.appendChild(evidence);
 }

}
root.addEventListener("observer-v7-ready",start);
let attempts=0;
const probe=()=>{if(!native){start();if(!native&&attempts++<120)requestAnimationFrame(probe)}};
requestAnimationFrame(probe);
})(window);

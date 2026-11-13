// Глава II «Архив станции»: прятки за закрывающимися дверьми, три фрагмента истории.
// Все видимые модели получены ТОЛЬКО от makers эталона INK; графика эталона не меняется.
import * as T from 'three';
const damp = (k, dt) => 1 - Math.exp(-k * dt);
const near = (a, b) => Math.hypot(a.x-b.x, a.z-b.z);
const CANDIDATES = [
  [-17.5,-3.0], [-18.4,1.3], [-16.7,5.0], [-12.4,.9], [-14.0,-4.6], [-18.5,6.4]
];
const DOORS = [[-16.4,-1.6,.25],[-17.9,3.2,-.8],[-13.5,2.0,1.1]];
const START = new T.Vector3(-16.7,0,-6.1);
export function createChapter2({scene, makers, paint, hero, iva, canWalk, fixSpot, beacon, burst, audio, play, onCaught, onComplete}) {
  let active = false, done = false, pageCount = 0, doorUses = 0, caughtCount = 0;
  let invulnerable = 0, doorHint = false, lastDoorLine = false, finishing = false, drift = 0;
  let layoutHash = 'archive-unstarted';
  const sheets = [];
  // Бумага — доска из генератора "Указатель", а не новая процедурная модель.
  const sourceSign = makers.sign();
  const signBoard = sourceSign.children.find(o => o.isMesh && o.geometry?.type === 'BoxGeometry');
  if (!signBoard) throw Error('INK: board asset missing from reference sign');
  for (let i=0;i<3;i++) {
    const m = signBoard.clone();
    m.material = signBoard.material.clone();
    m.material.color.set(['#d1c39e','#c5b6a0','#e1d2aa'][i]);
    m.scale.set(.80,2.5,.33); m.rotation.x = -Math.PI/2; m.rotation.z = .3+i*.67;
    m.name = 'Архивный лист (пигмент эталона)';
    m.visible = false; scene.add(m);
    paint.apply(m,{seed:'ap-station-sheet-'+i});
    const b=beacon('#b5d3b0',4.2);b.userData.want=0;
    sheets.push({mesh:m,beacon:b,pos:new T.Vector3(),taken:false});
  }
  // Подвижная створка клонируется с фасада принятой аптеки в эталоне.
  const sourceDoor = makers.apothecary().children.find(o=>o.isMesh &&
    o.geometry?.type === 'BoxGeometry' && Math.abs(o.position.x-.58)<.01 &&
    Math.abs(o.position.z-2.34)<.01);
  if(!sourceDoor)throw Error('INK: door panel missing from reference apothecary');
  const doors=DOORS.map(([x,z,angle],i)=>{
    const pivot=new T.Group();pivot.position.set(x,0,z);pivot.rotation.y=angle;
    const leaf=sourceDoor.clone();leaf.material=sourceDoor.material.clone();
    leaf.material.color.set(i===0?'#78928b':i===1?'#84746b':'#72837a');
    leaf.position.set(.43,1.03,0);leaf.rotation.set(0,0,0);leaf.scale.set(1.1,1.14,1.15);
    const hinge=new T.Group();hinge.add(leaf);pivot.add(hinge);scene.add(pivot);
    pivot.visible=false;paint.apply(pivot,{seed:'ap-station-door-'+i});
    const b=beacon('#d3a879',2.9);b.position.set(x,0,z);b.userData.want=0;
    return {pivot,hinge,beacon:b,pos:new T.Vector3(x,0,z),time:0,cooldown:0,angle:1.18};
  });
  const beacons=[...sheets.map(s=>s.beacon),...doors.map(d=>d.beacon)];
  const pick = (count) => CANDIDATES.map((_,i)=>[Math.random(),i])
    .sort((a,b)=>a[0]-b[0]).slice(0,count).map(a=>a[1]);
  function begin() {
    active=true;done=false;pageCount=0;doorUses=0;caughtCount=0;
    invulnerable=3;doorHint=false;lastDoorLine=false;finishing=false;drift=0;
    const selected=pick(3);layoutHash='archive-'+selected.join('');
    sheets.forEach((s,i)=>{
      const [x,z]=CANDIDATES[selected[i]];
      s.pos.set(x,0,z);fixSpot(s.pos);
      s.mesh.position.set(s.pos.x,.20+i*.015,s.pos.z);s.mesh.visible=true;
      s.beacon.position.copy(s.pos);s.beacon.userData.want=1;s.taken=false;
    });
    doors.forEach(d=>{d.pivot.visible=true;d.hinge.rotation.y=d.angle=1.18;d.time=0;d.cooldown=0;d.beacon.userData.want=.28;});
    hero.position.copy(START);fixSpot(hero.position);
    iva.group.position.set(-14.7,0,3.7);fixSpot(iva.group.position);iva.set('sleepwalk');
    audio.setMood('dusk');play('archiveIntro',null,true);
  }
  function action() {
    if(!active || done || finishing) return false;
    const d=doors.filter(d=>near(d.pos,hero.position)<1.9 && d.time<=0 && d.cooldown<=0)
      .sort((a,b)=>near(a.pos,hero.position)-near(b.pos,hero.position))[0];
    if(!d)return false;
    d.time=6.5;d.cooldown=12;doorUses++;iva.set('listen',6.5);
    burst(d.pos.clone().setY(1),'#c3b99b',12,.6);audio.door();
    if(!lastDoorLine){lastDoorLine=true;play('doorShut');play('archiveWhisper');}
    return true;
  }
  function tick(dt,t) {
    if(!active || done)return;
    drift+=dt;invulnerable=Math.max(0,invulnerable-dt);
    let doorLocked=false;
    doors.forEach((d,i)=>{
      d.cooldown=Math.max(0,d.cooldown-dt);
      if(d.time>0){d.time=Math.max(0,d.time-dt);doorLocked=true;}
      const target=d.time>0?0:1.18;
      d.angle+=(target-d.angle)*damp(5,dt);d.hinge.rotation.y=d.angle;
      d.beacon.userData.want=d.cooldown>0?.06:near(d.pos,hero.position)<3?.75:.22;
    });
    if(doorLocked) {
      if(iva.state.mode!=='listen')iva.set('listen',6.5);
    } else if(iva.state.mode==='listen') iva.set('sleepwalk');
    sheets.forEach((s,i)=>{
      if(s.taken)return;
      s.mesh.rotation.z+=dt*.09*(i===1?-1:1);
      s.mesh.position.y=.20+i*.015+Math.sin(t*.7+i)*.025;
      if(near(hero.position,s.pos)>1.15)return;
      if(i===2 && doorUses===0)return; // финальный архив требует открыть путь дверью
      s.taken=true;s.mesh.visible=false;s.beacon.userData.want=0;pageCount++;
      audio.chime(i%3);burst(s.pos.clone().setY(.6),'#cddcc4',22);
      play('archive'+pageCount);
    });
    if(pageCount===2 && doorUses===0 && !doorHint){
      doorHint=true;play('archiveDoorHint');
    }
    if(pageCount===3 && !finishing) {
      finishing=true;doors.forEach(d=>d.beacon.userData.want=0);
      play('archiveReveal',()=>{done=true;active=false;iva.set('idle');onComplete();});
    }
    // Ива не нападает, когда отрезана дверью, и не убивает аптекаря.
    if(!finishing && !doorLocked && invulnerable<=0 &&
      iva.state.mode==='sleepwalk' && near(hero.position,iva.group.position)<1.02){
      caughtCount++;invulnerable=4;iva.set('listen',4);onCaught();
    }
  }
  function resetAfterCaught(){
    hero.position.copy(START);fixSpot(hero.position);
    iva.group.position.set(-14.7,0,3.7);fixSpot(iva.group.position);
    doors.forEach(d=>{d.time=0;d.cooldown=0;});
    iva.set('sleepwalk');invulnerable=3;
  }
  function goal() {
    if(!active || finishing)return null;
    if(pageCount>=2 && doorUses===0) {
      const d=doors[0];return{x:d.pos.x,y:d.pos.z,door:true};
    }
    const s=sheets.find(s=>!s.taken);
    return s?{x:s.pos.x,y:s.pos.z}:null;
  }
  function doorNearby() {return active && doors.some(d=>near(d.pos,hero.position)<1.9 && d.time<=0 && d.cooldown<=0);}
  function hide(){
    active=false;doors.forEach(d=>{d.pivot.visible=false;d.beacon.userData.want=0;});
    sheets.forEach(s=>{s.mesh.visible=false;s.beacon.userData.want=0;});
  }
  return {begin,tick,action,goal,doorNearby,resetAfterCaught,hide,beacons,
    get active(){return active}, get done(){return done},
    get pages(){return pageCount}, get doorsClosed(){return doorUses},
    get caught(){return caughtCount},get layoutHash(){return layoutHash}};
}

'use strict';
const assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs');
let saved=new Map(),reports=[],noiseCalls=0;
const ctx={canvas:{width:800,height:600},
 fillRect(){},drawImage(){},fill(){},stroke(){},beginPath(){},closePath(){},
 moveTo(){},lineTo(){},arc(){},ellipse(){},save(){},restore(){},quadraticCurveTo(){},
 createRadialGradient(){return{addColorStop(){}}},set fillStyle(x){},set strokeStyle(x){},
 set lineWidth(x){},set globalCompositeOperation(x){},set globalAlpha(x){}};
const root={localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)},
 matchMedia:()=>({matches:false})};
let clock=500;
const sandbox={window:root,localStorage:root.localStorage,
 Math,Date,JSON,performance:{now:()=>clock},console};
vm.runInNewContext(fs.readFileSync(__dirname+'/weapon-catalog.js','utf8'),sandbox,{filename:'weapon-catalog.js'});
vm.runInNewContext(fs.readFileSync(__dirname+'/living-world.js','utf8'),sandbox,{filename:'living-world.js'});
const S={objects:[{kind:'well',x:0,y:0}],history:[],pop:30,order:15,suspicion:0};
const COMBAT={actors:[{id:1,x:24,y:12,hp:100,armed:true,state:'patrol',faction:'guard'}]};
const universe=root.ObserverV4World.create({S,COMBAT,ctx,cam:{x:0,y:0,zoom:1},
 w2s:(x,y,z=0)=>({x:400+x,y:280+y-z}),
 report:(a,b)=>reports.push([a,b]),sound:{event:()=>{noiseCalls++}},onSave(){}});
assert.equal(universe.isMonster('shade'),true);
assert.equal(universe.isMonster('well'),false);
for(const type of ['imp','shade','warden'])assert.ok(universe.spawn(type,24,12));
assert.equal(universe.monsters.length,3);
assert.equal(universe.monsters[0].kind,'imp');
assert.equal(S.objects.length,1,'Old historical builder objects never overwritten');
universe.drawGround(500,800,600);
universe.drawMonsters(500);
universe.drawGlitch(500,800,600);
for(let i=0;i<300;i++){clock=1000+i*60;universe.update(clock)}
const data=universe.snapshot();
assert.equal(data.monsters.length,3);
universe.onBuild('fire',0,0);
universe.ripple(12,15,8);
universe.save();
assert.ok(saved.has('observer-world-v4-expansion'));
assert.ok(reports.length>=3);
assert.equal(universe.switchMode('explore'),'explore');
assert.equal(universe.examine(24,12),true,'Explore mode can attack the same monster entity');
assert.ok(universe.monsters[0].hp<70);
assert.ok(noiseCalls>=1);
const newU=root.ObserverV4World.create({S,COMBAT,ctx,cam:{x:0,y:0,zoom:1},
 w2s:(x,y,z=0)=>({x:400+x,y:280+y-z}),report(){},sound:{event(){}},onSave(){}});
assert.equal(newU.monsters.length,3,'Monster saves must restore without resetting Observer state');
console.log('V4_WORLD_PASS',JSON.stringify({monsters:universe.monsters.map(m=>({kind:m.kind,hp:m.hp})),history:reports.length,oldObjects:S.objects.length,noiseCalls}));

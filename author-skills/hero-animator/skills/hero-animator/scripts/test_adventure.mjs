import assert from 'node:assert/strict';import '../runtime/ash-adventure.js';
class Input{constructor(){this.keys=new Set();this.edges=new Set();}held(k){return this.keys.has(k);}pressed(k){return this.edges.has(k);}down(k){if(!this.keys.has(k))this.edges.add(k);this.keys.add(k);}up(k){this.keys.delete(k);}clear(){this.keys.clear();this.edges.clear();}}
let i=new Input(),g=HeroAdventure.create();const tick=(n=1)=>{for(let f=0;f<n;f++){g.update(1/60,i);i.edges.clear();}},tap=k=>{i.down(k);tick();i.up(k);};g.begin();
const start=g.snapshot();tick(60);assert.equal(g.player.x,start.player.x);assert.equal(g.player.z,start.player.z);
for(const action of ['jump','dodge','roll','attack']){tap(action);assert.equal(g.player.action,action);tick(90);}
i.down('crouch');tick();assert.equal(g.player.action,'crouch');i.up('crouch');tick();assert.equal(g.player.action,'idle');
tap('pause');const paused=g.time;tick(30);assert.equal(g.time,paused);tap('pause');assert(!g.paused);
tap('restart');assert.equal(g.player.hp,100);assert.equal(g.time,0);
// Real AI strike and terminal death, with no direct health mutation.
i.clear();tick(1800);assert(g.player.hp<100);tick(2400);assert.equal(g.player.hp,0);assert.equal(g.player.action,'death');tap('restart');assert.equal(g.player.hp,100);
// Deterministic playthrough via the same held/pressed interface as real keyboard/touch.
function approach(target,range){for(let guard=0;guard<5000;guard++){
 const dx=target.x-g.player.x,dz=target.z-g.player.z;if(Math.hypot(dx,dz)<=range){i.clear();tick();return;}
 for(const k of ['left','right','up','down'])i.up(k);
 if(Math.abs(dx)>.08)i.down(dx>0?'right':'left');if(Math.abs(dz)>.08)i.down(dz>0?'down':'up');tick();
 }throw Error('approach timeout');}
for(let targetIndex=0;targetIndex<3;targetIndex++){
 const target=g.enemies[targetIndex];let limit=0;
 while(target.hp>0&&limit++<30){approach(target,2.1);i.down('grab');tick();
  if(g.grabbed!==null){const before={x:target.x,z:target.z};tap('attack');i.up('grab');tick(45);assert(g.events.some(e=>e.type==='throw'));assert(Math.hypot(target.x-before.x,target.z-before.z)>.5);}
  else{tap('attack');tick(45);}
  tick(30);
 }
 assert.equal(target.hp,0);approach(g.seals[g.seals.length-1],.5);tap('interact');assert(g.player.hp>0);
}
assert.equal(g.collected,3);approach({x:-6,z:-9},2);tap('interact');assert(g.won);assert(g.events.some(e=>e.type==='win'));
console.log(JSON.stringify({passed:true,simulation:'same input interface, no player/enemy mutations',victory:true,seals:g.collected,time:g.time,health:g.player.hp,throwDisplacement:true,deathAndRestart:true}));

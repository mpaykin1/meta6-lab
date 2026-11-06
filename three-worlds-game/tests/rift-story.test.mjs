import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {guestLine,guestHomeFor,riftCountdownAllowed,guestDialogueLines,RIFT_PORTALS,WORLD_OBJECTS,missionTargetFor} from '../rift-story.mjs';
import {createRiftEvent,RIFT_TIMING,frontOfHero} from '../rift-event.mjs';
test('guest dialogue reflects source world, predicament and relationship',()=>{
 assert.match(guestLine('water','island','neutral'),/вода/);
 assert.match(guestLine('ash','water','neutral'),/огню/);
 assert.notEqual(guestLine('ash','island','neutral'),guestLine('ash','island','friend'));
 assert.match(guestLine('ash','ash','home'),/оружие/);
});
test('guest comes from a different world',()=>{
 for(const world of ['water','ash','island'])assert.notEqual(guestHomeFor(world),world);
});
test('owner §21.15: 5/5/5 exactly, within 1800 virtual steps, at sea AND during combat',()=>{
 assert.deepEqual([RIFT_TIMING.warning,RIFT_TIMING.opening,RIFT_TIMING.emerging],[5,5,5]);
 for(const context of [{land:true,battle:false},{land:false,battle:false},{land:true,battle:true},{land:false,battle:true}]){
  const e=createRiftEvent(17,{initial:55,interval:58}),pos={x:17,z:28},look={x:1,z:0};
  let n=0;while(e.state.phase!=='dialogue'&&n<1800){e.step(.1,{...context,pos,look});n++}
  assert(n<1800,'cinematic never reached dialogue '+JSON.stringify(context));
  assert.deepEqual(e.state.history.slice(0,4),['warning','opening','emerging','dialogue']);
  assert(n>=700,'guest spoke before 55+15 virtual seconds');
  assert(e.state.spot.distance>=2.5&&e.state.spot.distance<=4);
  assert(Math.abs(e.state.spot.x-pos.x-3.2)<1e-9);
  assert.equal(e.state.spot.alignment,1);
  assert.equal(e.state.phase,'dialogue');
  assert(e.choose('help'));assert.equal(e.state.phase,'closing');
  e.step(4.9,{...context,pos,look});assert.equal(e.state.phase,'closing');
  e.step(.1,{...context,pos,look});assert.equal(e.state.phase,'escort');
  assert(e.finishArc({kind:'escort',world:'ash',text:'Новая миссия'}));
  assert.equal(e.state.phase,'idle');assert.equal(e.state.cycle,1);
  assert(e.state.remaining>=56&&e.state.remaining<=60);
 }
});
test('owner §21.15: refuse starts boss fight; next event only after genuine arc completion',()=>{
 const e=createRiftEvent(5,{initial:0,interval:58}),pos={x:24,z:25},look={x:0,z:1};
 e.step(.01,{pos,look,land:false,battle:true});
 e.step(5,{pos,look});e.step(5,{pos,look});e.step(5,{pos,look});
 assert.equal(e.state.phase,'dialogue');
 assert(e.choose('refuse'));assert.equal(e.state.phase,'boss');
 for(let j=0;j<130;j++)e.step(1,{pos,look});
 assert.equal(e.state.phase,'boss');assert.equal(e.state.cycle,0);
 assert(e.finishArc({kind:'victory'}));assert.equal(e.state.phase,'idle');
 assert(e.state.remaining>=56&&e.state.remaining<=60);
});
test('audit 055: original guest is never deleted by timer before finishing the arc',()=>{
 const e=createRiftEvent(1337,{initial:0,interval:58});
 const pos={x:145,z:32},look={x:1,z:0},guest={brain:{relation:'friend'},alive:true};
 const step=(dt,occupied=false)=>e.step(dt,{pos,look,land:true,battle:false,occupied});
 assert.equal(riftCountdownAllowed(true,null),true);
 assert.equal(riftCountdownAllowed(false,null),true,'event works underwater');
 assert.equal(riftCountdownAllowed(false,guest),false);
 step(.1);step(5);step(5);step(5);
 assert.equal(e.state.phase,'dialogue');
 assert(e.choose('help'));step(5);assert.equal(e.state.phase,'escort');
 for(let j=0;j<130;j++)step(1,true);
 assert.equal(e.state.phase,'escort','guest must not be replaced until escort finishes');
 assert(e.finishArc({world:'water',text:'mission'}));
 const remaining=e.state.remaining;
 for(let j=0;j<130;j++)step(1,true);
 assert.equal(e.state.remaining,remaining,'live guest suspends next countdown');
 guest.alive=false;step(65,false);assert.equal(e.state.phase,'warning');
});

test('§21.25: all 12 sentences exactly match QUEST_RULES, independent markdown source',()=>{
 const md=readFileSync(new URL('../../rules/04-syuzhet-i-scenarii/QUEST_RULES_RU.md',import.meta.url),'utf8');
 const owners=[['ash','Страж Пепла'],['island','Хранитель Огня (Остров)'],['sunken','Страж Бездны (Затонувший город)']];
 for(const [origin,label] of owners){
  const row=md.split('\n').find(l=>l.startsWith(label+': '));
  assert(row,'canonical source missing '+label);
  const approved=[...row.matchAll(/«([^»]+)»/g)].map(m=>m[1]);
  assert.equal(approved.length,4);
  const game=guestDialogueLines(origin);
  assert.deepEqual(game,approved,'game deviates from owner original '+label);
  for(const phrase of game)assert(phrase.length<=160);
 }
 assert.throws(()=>guestDialogueLines('unknown'),/origin not connected/);
});

test('§21.25: all named Ash props resolve to real original shipped assets',()=>{
 const tower=WORLD_OBJECTS.rusty_tower,crystal=WORLD_OBJECTS.blue_crystal;
 assert(tower&&crystal);assert.equal(tower.model,'water_tower');
 assert.equal(crystal.model,'weather_storm_crystal');
 const models=JSON.parse(readFileSync(new URL('../models/MANIFEST.json',import.meta.url),'utf8'));
 assert(models.models.includes(crystal.model),'original GRAF GLB missing');
 assert(models.grafOfflineModels.includes(crystal.model));
 const ash=readFileSync(new URL('../ash-assets.mjs',import.meta.url),'utf8');
 assert(ash.includes("S('water_tower'"),'owner tower geometry source missing');
 const originalIsland=readFileSync(new URL('../npc-catalog.js',import.meta.url),'utf8');
 assert(originalIsland.includes('companion:{name:'),'original Island guest role missing');
});
test('audit079: mission targets reuse the actual drawn/traversable portal registry',()=>{
 assert.equal(RIFT_PORTALS.length,3);
 assert.equal(new Set(RIFT_PORTALS.map(p=>p.id)).size,3);
 for(const world of ['island','ash','water']){
  const matched=RIFT_PORTALS.filter(p=>p.world===world);
  assert.equal(matched.length,1);
  const portal=missionTargetFor(world);
  assert.strictEqual(portal,matched[0]);
  assert(Number.isFinite(portal.x)&&Number.isFinite(portal.z));
  assert(portal.to&&Number.isFinite(portal.to.x)&&Number.isFinite(portal.to.z));
 }
 assert.equal(WORLD_OBJECTS.rift.kind,'terrain-portal');
 assert.equal(WORLD_OBJECTS.rift.source,'rift-story.mjs');
 assert.throws(()=>missionTargetFor('ash',[RIFT_PORTALS[0]]),/missing/);
});

'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const ctx={window:{},Math,Date,console,performance:{now:()=>500},localStorage:{getItem:()=>null,setItem(){}}};
for(const file of ['building-assets.js','npc-catalog.js','story-system.js','combat-relations.js']){
 vm.runInNewContext(fs.readFileSync(__dirname+'/'+file,'utf8'),ctx,{filename:file});
}
const w=ctx.window,assets=w.ObserverBuildingAssets;
assert.equal(assets.kinds.length,36);
assert.equal(new Set(assets.kinds.map(k=>assets.BASE[k].shape)).size,36,'Every building needs distinct architecture');
const variants=new Set();
for(const kind of assets.kinds){
 const cubes=[],draw={
  box:(...v)=>cubes.push('box'+v.join(',')),beam:(...v)=>cubes.push('beam'+v.join(',')),
  post:(...v)=>cubes.push('post'+v.join(',')),roof:(...v)=>cubes.push('roof'+v.join(',')),
  fence:(...v)=>cubes.push('fence'+v.join(',')),sign:(...v)=>cubes.push('sign'+v.join(','))
 };
 assert.equal(assets.build(kind,draw),true);assert.ok(cubes.length>0,kind);
 variants.add(cubes.join('|'));
}
assert.equal(variants.size,36,'All 36 buildings must have distinguishable silhouettes/props');
const C=w.ObserverNpcCatalog;
assert.equal(Object.keys(C.ROLES).length,16);
assert.ok(C.SPAWNS.guard.includes('warrior'));
assert.ok(C.SPAWNS.monastery.includes('monk'));
assert.ok(C.SPAWNS.healer.includes('healer'));
const story=w.ObserverStorySystem.create();
const well=story.emit('well'),ally=story.emit('newCompanion',{person:5}),betray=story.emit('betrayal',{person:5});
assert.ok(well.long.includes('water'));
assert.ok(ally.long.includes('companion'));
assert.ok(betray.long.includes('enemy'));
assert.ok(story.inspect('market',{x:4,z:5},{objects:[{x:4,z:6,kind:'school'}],pop:9,order:10,suspicion:2}).long.includes('school'));
const events=[],native={
 player:{hp:6,pos:{x:30,z:30,clone(){return{set(x,y,z){return{x,y,z}}}}}},
 G:{state:'play'},SEA:3.8,terrainTop:()=>5,
 scene:{add(){},remove(){}},camera:{position:{x:22,z:22}},
 THREe:{},THREE:{},
 canvas:{getBoundingClientRect:()=>({left:0,top:0,width:800,height:600})},
 foes:[],hurtBy(dmg){native.player.hp-=dmg;if(native.player.hp<=0)native.G.state='dead';return true},
 revivePerson(x,z){native.player.hp=6;native.G.state='play';return true}
};
w.ObserverNpcCatalog={...C,createMesh:()=>({mesh:{visible:true},ring:{visible:true}}),animate:()=>{},dispose:()=>{}};
const r=w.ObserverCombatRelations.create({native,state:{deaths:0},events:(k,v)=>events.push([k,v])});
const companion=r.newPerson(31,30);
assert.equal(companion.role,'companion');assert.equal(companion.relation,'friendly');
assert.equal(r.strike(companion,1,'player'),true);
assert.equal(companion.relation,'hostile');
assert.ok(events.some(x=>x[0]==='betrayal'));
const fighter=r.spawn('warrior',30.4,30,'hostile');fighter.attackCD=0;
for(let i=0;i<80&&native.G.state==='play';i++)r.update(.5);
assert.ok(events.some(x=>x[0]==='playerAttacked'),'A warrior must attack the player');
assert.equal(native.G.state,'dead','Enemy NPC must be capable of killing the player');
r.update(.02);
assert.ok(events.some(x=>x[0]==='playerDeath'));
const answer=r.newPerson(32,31);
assert.equal(answer.mode,'reborn');
assert.equal(native.G.state,'play');
assert.ok(events.some(x=>x[0]==='reborn'));
console.log('V6_ARCHITECTURE_COMBAT_STORY_PASS',JSON.stringify({buildings:assets.kinds.length,uniqueArchitectures:variants.size,npcClasses:Object.keys(C.ROLES).length,events:events.map(e=>e[0]),storyEntries:story.entries.length}));

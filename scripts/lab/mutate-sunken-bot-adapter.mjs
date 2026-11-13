import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const original=await fs.readFile(new URL('../../games/sunken-city-reference/bot-adapter.js',import.meta.url),'utf8');
const html=await fs.readFile(new URL('../../games/sunken-city-reference/index.html',import.meta.url),'utf8');
assert.match(html,/<script src="\.\/bot-adapter\.js" defer><\/script>/);
function snapshot(source,mode='pilot'){
 const window={__sunken:{
  SPOTS:{bathy:{position:{x:5,z:8}},angler:null},
  GS:{carry:[],banked:2,dead:0,hull:1},
  SAVE:{data:{won:false}},
  G:{mode},REALM:{relics:[{key:'t1',p:{x:18,z:30}}],found:new Set(),active:[{key:'town-1'}]}
 }};
 const document={getElementById:()=>({hidden:true})};
 vm.runInNewContext(source,{window,document,Math,Object,Number}, {timeout:1500});
 return {window,state:window.__META_BOT__.state()};
}
const baseline=snapshot(original);
assert.equal(baseline.state.started,true);
assert.equal(baseline.state.hero.x,5);
assert.equal(baseline.state.hero.y,8);
assert.equal(baseline.state.goal.x,18);
assert.equal(baseline.state.goal.y,30);
assert.equal(baseline.state.progress,2);
assert.equal(baseline.window.__META_BOT__.version,1);
assert.equal(Object.isFrozen(baseline.window.__META_BOT__),true);
const cases=[
 ['hardcoded waypoint', 'const goal=won?null:carrying>0?home:nearest?xyz(nearest.p):null;', 'const goal={x:0,y:0};',
   s=>assert.equal(s.state.goal.x,18)],
 ['fake progress (test deception)', 'const banked=s?.GS?.banked || 0;', 'const banked=30;',
   s=>assert.equal(s.state.progress,2)],
 ['mutable public bot object', 'writable:false,configurable:false,enumerable:false',
  'writable:true,configurable:false,enumerable:false',
   s=>assert.equal(Object.getOwnPropertyDescriptor(s.window,'__META_BOT__').writable,false)],
 ['fake start state', "started:!!s && s.G.mode==='pilot'", 'started:true',
   ()=>assert.equal(snapshot(original.replace("started:!!s && s.G.mode==='pilot'",'started:true'),'city').state.started,false)]
];
for(const [name,from,to,verify] of cases){
 assert.ok(original.includes(from),'anchor missing '+name);
 let killed=false;
 try{verify(snapshot(original.replace(from,to)))}catch{ killed=true; }
 assert.ok(killed,'MUTATION SURVIVED '+name);
 console.log('CAUGHT '+name);
}

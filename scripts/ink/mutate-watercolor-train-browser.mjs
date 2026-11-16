import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('./check-watercolor-train-browser.mjs',import.meta.url),'utf8');
function verify(text){
 const required=[
  "name:'desktop',width:1366,height:768,mobile:false",
  "name:'phone',width:390,height:844,mobile:true",
  "assert.equal(response.status(),200)",
  "window.__INK_TRAIN__?.stats?.().renderedFrames>=2",
  "assert.deepEqual(failed,[],'network asset requests')",
  "assert.deepEqual(errors,[],'browser console errors')",
  "assert.ok(state.ready,'train model loaded')",
  "assert.ok(state.meshes>100,'train should have actual volumetric meshes')",
  "assert.ok(state.stats.renderedFrames>=2,'actual WebGL frame updates required')"
 ];
 for(const item of required)assert.ok(text.includes(item),'real browser safeguard missing: '+item);
}
verify(source);
const mutations=[
 ['mobile-lost',"name:'phone',width:390,height:844,mobile:true","name:'phone',width:390,height:844,mobile:false"],
 ['no-http-check',"assert.equal(response.status(),200)","console.log(response.status())"],
 ['fake-webgl-frame',"window.__INK_TRAIN__?.stats?.().renderedFrames>=2","true"],
 ['ignore-network-errors',"assert.deepEqual(failed,[],'network asset requests')","console.log(failed)"],
 ['ignore-console-errors',"assert.deepEqual(errors,[],'browser console errors')","console.log(errors)"],
 ['accept-flat-mesh',"assert.ok(state.meshes>100,'train should have actual volumetric meshes')","assert.ok(state.meshes>=0,'train should have actual volumetric meshes')"],
 ['accept-frozen-train',"assert.ok(state.stats.renderedFrames>=2,'actual WebGL frame updates required')","assert.ok(state.stats.renderedFrames>=0,'actual WebGL frame updates required')"]
];
for(const [name,before,after] of mutations){
 assert.ok(source.includes(before),'mutation anchor missing: '+name);
 let killed=false;
 try{verify(source.replace(before,after))}catch{killed=true}
 assert.ok(killed,'train browser regression escaped: '+name);
 console.log('KILLED '+name);
}
console.log('INK Steam Train browser gate: baseline PASS, 7/7 genuine mutations rejected');

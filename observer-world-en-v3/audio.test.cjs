/* Offline node regression of the game procedural audio graph and scheduler. */
'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const src=fs.readFileSync(__dirname+'/audio.js','utf8');
let made=0,stopped=0,started=0,active=0,suspended=0,lastContext=null;
const param=(value=0)=>({value,setValueAtTime(x){this.value=x},linearRampToValueAtTime(x){this.value=x},exponentialRampToValueAtTime(x){this.value=x},setTargetAtTime(x){this.value=x}});
class Node { constructor(){this.frequency=param(220);this.detune=param(0);this.gain=param(0);this.Q=param(0);this.playbackRate=param(1);this.threshold=param(-12);this.ratio=param(3);this.channelCount=1;this.type='sine'}connect(){return this}start(){started++;active++}stop(){stopped++;active=Math.max(0,active-1)} }
class AudioContext {
 constructor(){made++;lastContext=this;this.sampleRate=24000;this.state='running';this.currentTime=1;this.destination=new Node()}
 createGain(){return new Node()}createOscillator(){return new Node()}
 createDynamicsCompressor(){return new Node()}createBufferSource(){return new Node()}
 createBiquadFilter(){return new Node()}
 createBuffer(channels,length){return{getChannelData:()=>new Float32Array(length)}}
 async resume(){this.state='running'}async suspend(){this.state='suspended';suspended++}
 async close(){this.state='closed'}
}
const store=new Map();
const sandbox={window:{AudioContext},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},Math,Number,Object,Promise,console};
vm.runInNewContext(src,sandbox,{filename:'audio.js'});
const impl=sandbox.window.ObserverKriegerAudio,system=impl.create();
assert.equal(Object.keys(impl.THEMES).length,7);
assert.ok(Object.keys(impl.SOUND_GROUPS).length>=35);
assert.equal(made,0,'Context must not be created until user gesture');
assert.equal(system.diagnostics().contextState,'not-created');
(async()=>{
 assert.equal(await system.start(),true);
 assert.equal(made,1);
 for(const kind of ['well','market','monastery','guard','plague','fire','healer','militia','wounded','killed','burial','printing','observer']){
  lastContext.currentTime+=.4;assert.equal(system.event(kind),true);
  system.tick((system.diagnostics().events+1)*120,{objects:[{kind}],combat:{actors:[]},order:20,suspicion:0});
 }
 assert.ok(system.diagnostics().events>=13,'Every event gets synthesis');
 assert.ok(system.diagnostics().scheduled>25,'Synth voices were scheduled');
 let t=3000;
 for(const state of [
  {objects:[{kind:'market'}],combat:{actors:[]},order:20},
  {objects:[{kind:'monastery'}],combat:{actors:[]},order:20},
  {objects:[{kind:'plague'}],combat:{actors:[]},order:20},
  {objects:[{kind:'plague'}],combat:{actors:[{state:'attack'}]},order:0},
  {objects:[],combat:{actors:[{state:'dead'}]},order:0},
  {objects:[],combat:{actors:[]},order:20,suspicion:5}
 ]){
  t+=1000;system.tick(t,state);
 }
 assert.ok(system.diagnostics().switches>=4,'World must change musical themes');
 system.setVolume(.2);assert.equal(system.diagnostics().volume,.2);
 await system.setEnabled(false);assert.equal(system.diagnostics().enabled,false);
 assert.equal(lastContext.state,'suspended','muting must suspend context to save mobile CPU');
 const events=system.diagnostics().events;
 system.event('hit');assert.equal(system.diagnostics().events,events,'mute must silence game sounds');
 await system.setEnabled(true);system.onVisibility(true);assert.equal(suspended,2,'mute and background both suspend the audio graph');
 // Resume after explicitly testing background suspension, then run musical score.
 await lastContext.resume();
 // New authored-score contract: four-bar harmony and counterpoint must really schedule.
 for(let i=0;i<110;i++){
  lastContext.currentTime+=.28;
  system.tick(t+1400+i*280,{objects:[{kind:'market'}],combat:{actors:[]},order:20,suspicion:0});
 }
 const score=system.diagnostics();
 assert.ok(score.musicChords>=4,'multi-bar chord progressions must play');
 assert.ok(score.counterpointNotes>=4,'answering counterpoint must be audible');
 assert.ok(score.phrase>=1,'at least one 32-step phrase must develop');
 assert.ok(started>4,'real oscillator/noise nodes started');
 console.log('AUDIO_ENGINE_PASS',JSON.stringify({...system.diagnostics(),made,started,stopped,suspended}));
})().catch(e=>{console.error(e);process.exitCode=1});

'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const assets=fs.readFileSync(__dirname+'/original-assets.js','utf8');
const apng=fs.readFileSync(__dirname+'/hero-apng.js','utf8');
const visuals=fs.readFileSync(__dirname+'/island-graphics.js','utf8');
let drawn=[],images=0;
class Image{
 constructor(){this.complete=false;this.naturalWidth=0;this.naturalHeight=0}
 set src(raw){
  assert.ok(raw.startsWith('data:image/png;base64,'));
  const p=Buffer.from(raw.slice(22),'base64');
  assert.equal(p.readUInt32BE(0),0x89504e47);
  this.naturalWidth=p.readUInt32BE(16);this.naturalHeight=p.readUInt32BE(20);
  this.complete=true;images++;this.onload?.();
 }
}
const win={},sandbox={window:win,Image,Math,console};
vm.runInNewContext(assets,sandbox);
const a=win.IslandOriginalAssets;
assert.equal(a.atlasNames.length,12,'All twelve original atlas materials must transfer');
assert.equal(Object.keys(a.wmeta.weapons).length,22,'21 weapons plus drawn-bow sprite');
assert.ok(a.weapons.length>7000);
vm.runInNewContext(apng,sandbox);
const raw=Buffer.from(apng.match(/SOURCE='data:image\/png;base64,([^']+)'/)[1],'base64');
assert.ok(raw.indexOf(Buffer.from('acTL'))>=0,'Animated PNG requires acTL chunk');
assert.ok(raw.indexOf(Buffer.from('fcTL'))>=0,'Animated PNG requires frame control chunks');
assert.equal(raw.readUInt32BE(raw.indexOf(Buffer.from('acTL'))+4),4,'Animated PNG must contain four original frames');
vm.runInNewContext(visuals,sandbox);
const gfx=win.IslandVisuals;
const g=gfx.info();
assert.equal(g.tiles,12);
assert.equal(g.weapons,22);
assert.equal(g.apngFrames,4);
const ctx={save(){},restore(){},drawImage(...args){drawn.push(args)},fillRect(){},fill(){},stroke(){},
 beginPath(){},arc(){},moveTo(){},lineTo(){},closePath(){},clip(){},translate(){},rotate(){},
 strokeRect(){},set fillStyle(v){},set strokeStyle(v){},set lineWidth(v){},set globalAlpha(v){}};
const w2s=(x,y,z=0)=>({x:x+400,y:y+300-z});
assert.equal(gfx.human(ctx,{id:1,x:0,y:0},false,w2s,{zoom:1},1000),true);
assert.equal(gfx.fighter(ctx,{id:2,x:10,y:0,dir:1,seed:20,faction:'guard',state:'attack',attack:.5,armed:true,hitFlash:0,hp:100},w2s,{zoom:1},1000),true);
assert.ok(drawn.length>=3,'Original APNG humans plus sword sprite must be drawn');
assert.ok(drawn.some(x=>x.length===9),'Sprite atlas cells should be cropped with 9-argument drawImage');
console.log('V4_ORIGINAL_ASSETS_PASS',JSON.stringify({tiles:g.tiles,weapons:g.weapons,apngFrames:g.apngFrames,drawCalls:drawn.length,loaded:images}));

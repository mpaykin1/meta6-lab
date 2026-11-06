'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const src=fs.readFileSync(__dirname+'/island-graphics.js','utf8');
let drawings=0,errors=0;
class FakeImage{
  constructor(){this.complete=false;this.naturalWidth=0;this.naturalHeight=0}
  set src(x){if(!x.startsWith('data:image/png;base64,'))throw Error('asset not embedded');const b=Buffer.from(x.split(',')[1],'base64');if(b.readUInt32BE(0)!==0x89504e47)throw Error('Invalid PNG');this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);this.complete=true;this.onload?.()}
}
const root={Image:FakeImage},sandbox={window:root,Image:FakeImage,Math,Object,console};
vm.runInNewContext(src,sandbox);
const visual=root.IslandVisuals,art=visual.info();
assert.equal(art.loaded,3);assert.equal(art.failed,0);assert.equal(art.tiles,6);
const ctx={globalAlpha:1,imageSmoothingEnabled:true,fillStyle:'',strokeStyle:'',lineWidth:1,
 save(){},restore(){},drawImage(){drawings++},beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){},stroke(){},fill(){},fillRect(){drawings++},translate(){},rotate(){}};
const w2s=(x,y,z=0)=>({x:400+x,y:300+y-z}),cam={x:0,y:0,zoom:1};
visual.environment(ctx,cam,w2s,700,800,600);
visual.decorate(ctx,{kind:'castle',x:0,y:0},w2s,cam);
assert.equal(visual.human(ctx,{id:1,x:20,y:20},true,w2s,cam,1200),true);
assert.equal(visual.fighter(ctx,{faction:'guard',id:2,x:15,y:12,dir:1,state:'attack',attack:.5,armed:true,hp:44,seed:2,hitFlash:.2},w2s,cam,1200),true);
assert.ok(drawings>20,'actual source image sprites were drawn');
console.log('ISLAND_GRAPHICS_PASS',JSON.stringify({drawings,art}));

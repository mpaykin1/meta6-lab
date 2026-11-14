import assert from 'node:assert/strict';
import {
  createFrame, clearFrame, createFx, composite,
  campfire, smallExplosion, lightningStrike
} from '../../shared/components/patch-pixelfx/entry.js';

const width=440, height=350;
const frame=createFrame(width,height);
const rgba=new Uint8ClampedArray(width*height*4);
const sources=[campfire,smallExplosion,lightningStrike];

for(const mod of sources){
  assert.ok(typeof mod.create==='function' || typeof mod.draw==='function',
    mod.meta?.name+' lacks a drawable effect');
  const instance=createFx(mod,{x:220,y:279,seed:11});
  let luminousFrames=0;
  let changes=0;
  let previous='';
  for(let i=0;i<76;i++){
    instance.update(1/30);
    clearFrame(frame);
    instance.draw(frame);
    composite(frame,rgba,null,1);
    let pixels=0,checksum=0;
    for(let j=0;j<rgba.length;j+=4){
      if(rgba[j+3]>0)pixels++;
      checksum=(checksum + rgba[j]*3 + rgba[j+1]*5 + rgba[j+2]*7 + rgba[j+3])>>>0;
    }
    if(pixels>10)luminousFrames++;
    if(previous && String(checksum)!==previous)changes++;
    previous=String(checksum);
  }
  assert.ok(luminousFrames>4,mod.meta.name+' has no sustained visible pixels');
  assert.ok(changes>5,mod.meta.name+' animation is static');
  console.log('PIXELFX_VISIBLE',mod.meta.name,luminousFrames,changes);
}

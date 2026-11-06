import {test} from 'node:test';
import assert from 'node:assert/strict';
import {waterCameraShift} from '../water-dive-camera.mjs';
const cycle=(eye,hero,floor,sea,immersion)=>{let shift=0;for(let n=0;n<120;n++)shift=waterCameraShift(shift,eye,hero,floor,sea,immersion,1/60);return shift;};
test('owner A01/A08: shallow floor never alters the accepted original Island camera',()=>{
 assert.equal(cycle(9,3.4,2.1,3.8,.9),0);
 assert.equal(cycle(9,3.4,0,3.8,.2),0);
 assert.equal(waterCameraShift(0,9,5,-5,3.8,0,1/60),0);
});
test('owner A01/A08: at real water depth camera follows underwater and smoothly restores',()=>{
 let offset=cycle(9,1.45,-5,3.8,.99);
 assert(9-offset<3.8-.12,'camera not submerged');
 assert(offset>0&&offset<18);
 const previous=offset;offset=waterCameraShift(offset,9,3.5,1.9,3.8,.4,1/60);
 assert(offset<previous&&offset>0,'water camera snapped on surfacing');
 for(let n=0;n<180;n++)offset=waterCameraShift(offset,9,3.5,1.9,3.8,.4,1/60);
 assert(offset<.001,'shore camera did not regain original position');
});

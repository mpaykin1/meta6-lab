import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {createCameraRig} from '../../camera-rig.mjs';
test('A03 original single camera keeps acceleration/lag/trauma and never snaps position',()=>{
 assert.equal(typeof createCameraRig,'function');
 const original=fs.readFileSync(new URL('../../../reference/island-canon/engine__47_camera.js',import.meta.url),'utf8');
 const port=fs.readFileSync(new URL('../../camera-rig.mjs',import.meta.url),'utf8');
 for(const snippet of ['rig.pos.lerp(tmpB','rig.look.lerp(tmpA','rig.trauma * rig.trauma','camera.updateMatrixWorld()']){
  assert(original.includes(snippet),'missing from accepted source '+snippet);
  assert(port.includes(snippet),'lost original camera operation '+snippet);
 }
 assert(!port.includes('camera.position.copy('));
});
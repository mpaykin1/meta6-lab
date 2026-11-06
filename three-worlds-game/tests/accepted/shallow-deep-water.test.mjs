import {test} from 'node:test';import assert from 'node:assert/strict';import {immersionAt} from '../../stage7-simulation.mjs';
test('A08 shallow water remains low immersion; true depth allows full submersion',()=>{
 const sea=3.8,shallow=immersionAt(sea,3.99,3.62),deep=immersionAt(sea,1.2,-5);
 assert(shallow<.15,'accepted shallow water should not trigger full camera dive');
 assert(deep>.85,'deep water immersion did not reach full depth');
 assert.equal(immersionAt(sea,4.5,4.1),0);
});
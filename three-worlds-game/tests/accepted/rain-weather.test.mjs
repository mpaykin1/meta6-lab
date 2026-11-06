import {test} from 'node:test';import assert from 'node:assert/strict';import {createIslandWeatherCatalog} from '../../island-weather.mjs';
test('A09 original Island rain particle properties survive reuse in one renderer',()=>{
 const modes=createIslandWeatherCatalog(),rain=modes.get('rain');
 assert(rain);assert.equal(rain.shape,1);assert.equal(rain.fall,15);assert.equal(rain.box,24);
 assert.equal(rain.alpha,.45);assert.equal(modes.size,7);
});
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {worldWeatherAt,rainEventAt} from '../../weather-cycle.mjs';
import {createIslandWeatherCatalog} from '../../island-weather.mjs';
test('A09 rain begins during ≤600 simulation steps, returns then repeats in two surface worlds',()=>{
 const catalog=createIslandWeatherCatalog();
 assert.deepEqual({shape:catalog.get('rain').shape,fall:catalog.get('rain').fall,alpha:catalog.get('rain').alpha,box:catalog.get('rain').box},{shape:1,fall:15,alpha:.45,box:24});
 for(const world of ['island','ash']){
  const sequence=[];for(let n=0;n<600;n++){const kind=worldWeatherAt(world,false,n*.1);assert(catalog.has(kind));sequence.push(kind)}
  assert(sequence.includes('rain')&&sequence[0]!=='rain');
  assert(sequence.includes(world==='ash'?'ash':'sea_mist'));
  assert(sequence.slice(190,440).every(x=>x==='rain'));
  assert.equal(rainEventAt(world,true,25),false);
 }
 assert.equal(worldWeatherAt('water',true,23),'sea_mist');
});

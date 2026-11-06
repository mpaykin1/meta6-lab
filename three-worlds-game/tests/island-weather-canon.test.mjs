import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createIslandWeatherCatalog} from '../island-weather.mjs';
const source=fs.readFileSync(new URL('../../reference/island-canon/packs__base__weather.js',import.meta.url),'utf8');
const moduleSource=fs.readFileSync(new URL('../island-weather.mjs',import.meta.url),'utf8');
assert(moduleSource.includes(source.trimEnd()),'weather declarations must be literal owner source');
const original=new Map();
vm.runInNewContext(source,{defineWeather:(n,p)=>original.set(n,JSON.parse(JSON.stringify(p)))});
test('§21.8 original owner seven weather modes: independent source golden over <=600 changes, tolerance 1e-6',()=>{
 const current=createIslandWeatherCatalog();
 const keys=['rain','snow','ash','embers','spores','stardust','sea_mist'];
 assert.deepEqual([...current.keys()],keys);
 assert.deepEqual([...original.keys()],keys);
 for(let frame=0;frame<600;frame++){
  const id=keys[frame%keys.length],a=original.get(id),b=current.get(id);
  for(const name of ['size','fall','sway','alpha','shape','box','glow']){
   if(a[name]===undefined){assert.equal(b[name],undefined);continue}
   assert(Math.abs(a[name]-b[name])<=1e-6,'mode '+id+' uniform '+name);
  }
  assert.equal(a.color,b.color);
  assert.equal(a.additive,b.additive);
 }
});

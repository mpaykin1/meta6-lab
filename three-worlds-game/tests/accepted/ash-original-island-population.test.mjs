import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {seabedHeight} from '../../seabed.mjs';
import {voxelSample} from '../../voxel-terrain.mjs';
import {lifePlan,LAND_ARMORY_IDS} from '../../living-population.mjs';
import {landBiomeAt} from '../../living-land.mjs';
test('§21.22 Ash offshore real voxel island: 2 original roles, 2 foes, full 20-piece armory',()=>{
 const sea=3.8,seed=1337,ground=(x,z)=>voxelSample((a,b)=>seabedHeight(a,b,seed),x,z);
 const centre={x:145,z:32},actual=ground(centre.x,centre.z);
 assert(actual>sea+.2,'test fixture must be an actually dry 3D island');
 assert.equal(landBiomeAt(centre.x,centre.z,seed),'ash');
 const p=lifePlan(centre.x,centre.z,seed,ground,sea);
 assert.equal(p.region,'ash');assert.deepEqual(p.npcs.map(n=>n.id),['scavenger','companion']);
 assert.equal(p.enemies.length,2);
 assert(p.enemies.every(e=>e.id==='shade'));
 assert.deepEqual(new Set(p.weapons.map(w=>w.id)),new Set(LAND_ARMORY_IDS));
 assert.equal(p.weapons.length,20);
 assert([...p.npcs,...p.enemies,...p.weapons].every(e=>e.y>sea+.2&&e.y===ground(e.x,e.z)));
 assert([...p.npcs,...p.enemies,...p.weapons].every(e=>Math.hypot(e.x-centre.x,e.z-centre.z)<=36));
 // The same original Ash factory owns the nomad visual for companion AI, never
 // a fabricated third model or new renderer.
 const ashSource=readFileSync(new URL('../../ash-assets.mjs',import.meta.url),'utf8');
 assert.match(ashSource,/humanoid\('nomad'/);assert.match(ashSource,/humanoid\('scavenger'/);
 const runtime=readFileSync(new URL('../../living-population.mjs',import.meta.url),'utf8');
 assert.match(runtime,/q\.id==='companion'&&plan\.region!=='ash'/);
 assert.match(runtime,/q\.id==='companion'\?'nomad':q\.id/);
});

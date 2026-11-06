import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {GUEST_ROSTER,guestSourceFor,chooseGuestOrigin,getOriginalGuestDefinition} from '../guest-roster.mjs';
import {GUEST_DIALOGUE} from '../rift-story.mjs';
test('§21.25 original visitor models from three source artifacts, never same-world',()=>{
 const island=readFileSync(new URL('../npc-catalog.js',import.meta.url),'utf8');
 const model=JSON.parse(readFileSync(new URL('../models/MANIFEST.json',import.meta.url),'utf8'));
 const sunken=readFileSync(new URL('../sunken-guest.mjs',import.meta.url),'utf8');
 const ash=readFileSync(new URL('../ash-assets.mjs',import.meta.url),'utf8');
 assert(island.includes('companion:{name:'));
 assert(model.sunkenCityModels.includes('angler'));
 assert.match(sunken,/__threeWorldsModels\?\.\[ref\.sourceModel\]/);
 assert.match(sunken,/new THREE\.AnimationMixer\(root\)/);
 assert(!/SphereGeometry|BoxGeometry|PlaneGeometry/.test(sunken),'fabricated visitor geometry');
 assert(ash.includes("strider('strider_m'"));
 assert.deepEqual(GUEST_ROSTER.map(v=>v.origin),['ash','island','sunken']);
 assert.equal(guestSourceFor('island').catalog,'npc-catalog.js');
 assert.equal(guestSourceFor('sunken').sourceModel,'angler');
 for(const world of ['island','ash','water'])for(let cycle=0;cycle<6;cycle++){
  const origin=chooseGuestOrigin(world,cycle);
  assert.notEqual(origin.origin,world);
  assert.equal(GUEST_DIALOGUE[origin.origin].length,4);
 }
 assert.equal(chooseGuestOrigin('island',0).origin,'ash','accepted Ash original first guest frozen');
 assert.equal(chooseGuestOrigin('island',1).origin,'sunken','original Sunken must eventually visit Island');
 assert.equal(chooseGuestOrigin('ash',0).origin,'island','original Fire Keeper must visit Ash');
 assert.equal(chooseGuestOrigin('water',0).origin,'ash');
});

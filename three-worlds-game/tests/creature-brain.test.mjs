import {test} from 'node:test';import assert from 'node:assert/strict';
import {createBrain,stepBrain,lootPlacement} from '../creature-brain.mjs';
test('independent creatures decide without orbiting the player and cannot cross onto land',()=>{const a=createBrain('manta:1',{x:0,z:0},1),b=createBrain('fish:2',{x:4,z:2},2),p={x:0,y:0,z:0},q={x:4,y:0,z:2};for(let i=0;i<1200;i++){for(const [brain,pos]of [[a,p],[b,q]])stepBrain(brain,pos,1/60,{player:{x:100,z:100},height:()=>-3,aquatic:true,sea:3.8})}assert(a.decisions>2);assert.notDeepEqual(p,q);assert(p.y>-3);const before={...p};a.target={x:40,z:40};a.state='wander';a.clock=2;stepBrain(a,p,.1,{player:{x:100,z:100},height:()=>9,aquatic:true,sea:3.8});assert.deepEqual(p,before)});
test('original weapon positions and deterministic biome placements',()=>{const src={x:20,z:20,y:6};assert.equal(lootPlacement(0,1,src,()=>0).x,20);assert.equal(lootPlacement(1,1,src,()=>4).biome,'ash');assert.equal(lootPlacement(2,1,src,()=>-3).biome,'water');assert.deepEqual(lootPlacement(2,1,src,()=>-3),lootPlacement(2,1,src,()=>-3))});

test('same-seed equal-length creature identities remain independent',()=>{
 const a=createBrain('fish:1',{x:0,z:0},1337),b=createBrain('fish:2',{x:0,z:0},1337);
 assert.notEqual(a.identity,b.identity);
 assert.notEqual(a.phase,b.phase);
 assert.notEqual(a.clock,b.clock);
 for(const brain of [a,b]){
  brain.clock=0;
  stepBrain(brain,{x:0,y:-2,z:0},.1,{player:{x:200,z:200},height:()=>-4,aquatic:true,sea:3.8});
 }
 assert.notDeepEqual(a.target,b.target);
});

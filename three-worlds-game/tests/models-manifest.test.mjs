import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
const game=path.join(root,'three-worlds-game'),glb=path.join(game,'models');
const old=path.join(root,'reference/graf-offline/glb');
const src=path.join(root,'reference/graf-offline/atlases'),dst=path.join(game,'assets/weather/atlases');
const list=(dir,ext)=>fs.readdirSync(dir).filter(n=>n.endsWith(ext)).sort();
const m=JSON.parse(fs.readFileSync(path.join(glb,'MANIFEST.json'),'utf8'));
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
test('§20.12: source GLB union, manifest and destination have zero missing IDs',()=>{
 const expected=[...new Set([...m.sunkenCityModels,...list(old,'.glb').map(n=>n.slice(0,-4))])].sort();
 assert.equal(m.schemaVersion,2);assert.equal(m.sunkenCityModels.length,76);
 assert.equal(m.grafOfflineModels.length,69);assert.equal(expected.length,88);
 assert.deepEqual(list(glb,'.glb').map(n=>n.slice(0,-4)),expected);
 assert.deepEqual(m.models,expected);
 assert.deepEqual(m.grafOfflineModels,list(old,'.glb').map(n=>n.slice(0,-4)));
 assert.equal(m.additionalWeatherModels.length,12);
 assert.deepEqual(m.comparison.missingModelIDs,[]);
 assert.deepEqual(m.comparison.unexpectedModelIDs,[]);
});
test('§20.12: every imported original glTF is valid and 12 weather GLBs are byte identical',()=>{
 for(const id of m.models){
  const buf=fs.readFileSync(path.join(glb,id+'.glb'));
  assert.equal(buf.toString('ascii',0,4),'glTF',id);
  assert.equal(buf.readUInt32LE(4),2,id);
  assert.equal(buf.readUInt32LE(8),buf.length,id);
 }
 for(const id of m.additionalWeatherModels)assert.equal(sha(path.join(old,id+'.glb')),sha(path.join(glb,id+'.glb')),id);
});
test('§20.12: 41 weather atlases and JSON presets transferred without any modification',()=>{
 const a=fs.readdirSync(src).sort(),b=fs.readdirSync(dst).sort();
 assert.equal(a.length,41);assert.deepEqual(b,a);assert.deepEqual(m.weatherAtlases,a);
 for(const n of a)assert.equal(sha(path.join(src,n)),sha(path.join(dst,n)),n);
 assert.equal(sha(path.join(root,'reference/graf-offline/weather-manifest.json')),sha(path.join(game,'assets/weather/weather-manifest.json')));
});
test('§20.12: owner Sunken City put/many/glbOf models fully present',()=>{
 const original=fs.readFileSync(path.join(root,'reference/sunken-city/index.html'),'utf8');
 const ids=[...new Set([...original.matchAll(/\b(?:put|many|glbOf)\(\s*['"]([a-z_][a-z_0-9]*)['"]/g)].map(x=>x[1]))].sort();
 assert(ids.length>40);assert.deepEqual(m.sceneExplicitModels,ids);
 assert.deepEqual(ids.filter(id=>!m.models.includes(id)),[]);
});
test('§20.12: owner portal reference and original ash/island source preserved',()=>{
 assert(fs.existsSync(path.join(root,'reference/portal-rift/portal-sketch.html')));
 assert(fs.existsSync(path.join(game,'ash-assets.mjs')));
 assert(fs.existsSync(path.join(game,'index.source.html')));
});
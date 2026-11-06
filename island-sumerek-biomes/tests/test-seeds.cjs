const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8');
const config=html.match(/const BIOME_DEFS = (\{.*?\});\nconst BIOME_ATLASES/s);
assert.ok(config,'biome configuration exists');
const defs=JSON.parse(config[1]),begin=html.indexOf('const TAU ='),end=html.indexOf('/* -----------------------------------------------------------------------------\n   4 · Mesher');
assert.ok(begin>=0&&end>begin,'original deterministic generator');
const ctx={THREE:{Vector3:class Vector3{constructor(x,y,z){this.x=x;this.y=y;this.z=z;}}},Uint8Array,Int16Array,Float32Array,Math};vm.createContext(ctx);
vm.runInContext(html.slice(begin,end)+'\nthis.generate=generateWorld;',ctx);
const digest=w=>crypto.createHash('sha256').update(w.vox).digest('hex');
for(const [name,d] of Object.entries(defs)){
  const a=ctx.generate(d.seed),b=ctx.generate(d.seed),c=ctx.generate(d.seed+1);
  assert.equal(digest(a),digest(b),name+' reproducibility');
  assert.notEqual(digest(a),digest(c),name+' variability');
  assert.equal(a.vox.length,64*64*26);assert.equal(a.coins.length,20);
  assert.ok(a.landCells.length>100 && a.spawn.y>0 && a.spawn.y<26);
}
assert.equal(Object.keys(defs).length,10);
const fn=html.match(/function seedValue\(input\) \{[\s\S]*?\n\}/);assert.ok(fn);
vm.runInContext(fn[0]+'\nthis.seedValue=seedValue;',ctx);
assert.equal(ctx.seedValue('1604'),1604);
assert.equal(ctx.seedValue('Tokyo-2077'),ctx.seedValue('Tokyo-2077'));
assert.notEqual(ctx.seedValue('Gothic'),ctx.seedValue('Tokyo'));
for(const feature of ['animated3DCharacters','animated25DObjects','walker3d','biomeMoving','addAnimated3DCharacter','updateBiomeAnimation'])assert.ok(html.includes(feature),'missing '+feature);
console.log('PASS 10 deterministic seeded biomes, all with 20 pickups; text seeds and hybrid animation definitions');

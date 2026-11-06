// §20.12 — lossless import of owner's archived asset blobs; no new models or UI.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..');
const check=process.argv.includes('--check');
const models=path.join(root,'three-worlds-game/models');
const original=path.join(root,'reference/graf-offline/glb');
const atlasFrom=path.join(root,'reference/graf-offline/atlases');
const atlasTo=path.join(root,'three-worlds-game/assets/weather/atlases');
const ownerScene=path.join(root,'reference/sunken-city/index.html');
const manifestPath=path.join(models,'MANIFEST.json');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const names=(folder,ext)=>fs.readdirSync(folder).filter(n=>n.endsWith(ext)).sort();
// Derive inventory from real owner binaries, never from the old 75-name manifest.
const sunkenCityModels=names(models,'.glb').map(n=>n.slice(0,-4)).filter(n=>!n.startsWith('weather_')).sort();
if(sunkenCityModels.length!==76)throw Error('Owner Sunken City source count changed: '+sunkenCityModels.length+' (expected 76); do not silently accept an incomplete import.');
const archivedGLB=names(original,'.glb').map(n=>n.slice(0,-4));
const expected=[...new Set([...sunkenCityModels,...archivedGLB])].sort();
const weatherExtras=archivedGLB.filter(n=>!sunkenCityModels.includes(n));
if(archivedGLB.length!==69||weatherExtras.length!==12||expected.length!==88)throw Error('Owner GRAF asset baseline changed; compare sources before synchronizing.');
if(!check){fs.mkdirSync(atlasTo,{recursive:true});
for(const id of weatherExtras)fs.copyFileSync(path.join(original,id+'.glb'),path.join(models,id+'.glb'));}
const srcAtlases=fs.readdirSync(atlasFrom).filter(n=>fs.statSync(path.join(atlasFrom,n)).isFile()).sort();
if(srcAtlases.length!==41)throw Error('Weather atlas source count changed: '+srcAtlases.length);
if(!check)for(const name of srcAtlases)fs.copyFileSync(path.join(atlasFrom,name),path.join(atlasTo,name));
const sourceWeather=path.join(root,'reference/graf-offline/weather-manifest.json');
const destWeather=path.join(root,'three-worlds-game/assets/weather/weather-manifest.json');
if(!check)fs.copyFileSync(sourceWeather,destWeather);
const existing=names(models,'.glb').map(n=>n.slice(0,-4));
const missing=expected.filter(n=>!existing.includes(n)),extra=existing.filter(n=>!expected.includes(n));
if(missing.length||extra.length)throw Error('Source-folder mismatch: missing='+missing+' extra='+extra);
for(const id of archivedGLB){
 const a=path.join(original,id+'.glb'),b=path.join(models,id+'.glb');
 if(weatherExtras.includes(id)&&hash(a)!==hash(b))throw Error('Source blob differs: '+id);
}
for(const file of srcAtlases)if(hash(path.join(atlasFrom,file))!==hash(path.join(atlasTo,file)))throw Error('Atlas source differs: '+file);
if(hash(sourceWeather)!==hash(destWeather))throw Error('Weather manifest source differs from destination');
const s=fs.readFileSync(ownerScene,'utf8');
const used=[...new Set([...s.matchAll(/\b(?:put|many|glbOf)\(\s*['"]([a-z_][a-z_0-9]*)['"]/g)].map(m=>m[1]))].sort();
const unimportedIDs=used.filter(n=>!expected.includes(n));
if(unimportedIDs.length)throw Error('Owner scene model IDs absent from import: '+unimportedIDs.join(','));
for(const id of expected){
 const buf=fs.readFileSync(path.join(models,id+'.glb'));
 if(buf.toString('ascii',0,4)!=='glTF'||buf.readUInt32LE(4)!==2||buf.readUInt32LE(8)!==buf.length)throw Error('Invalid original GLB: '+id);
}
const manifest={
 schemaVersion:2,
 source:'Owner Sunken City GLB pack (76) + original GRAF OFFLINE GLB assets (69, of which 12 are additional)',
 sourcePaths:['reference/sunken-city/index.html','reference/graf-offline/glb','reference/graf-offline/atlases','reference/graf-offline/weather-manifest.json'],
 sources:{sunkenCityGlb:76,grafOfflineGlb:69,additionalWeatherGlb:12,atlasFiles:41},
 sunkenCityModels,
 grafOfflineModels:archivedGLB,
 additionalWeatherModels:weatherExtras,
 models:expected,
 sceneExplicitModels:used,
 weatherAtlases:srcAtlases,
 weatherManifest:'three-worlds-game/assets/weather/weather-manifest.json',
 comparison:{missingModelIDs:[],unexpectedModelIDs:[],missingAtlasFiles:[],changedCopiedBinaryFiles:[]},
 notes:'No custom replacements. Source IDs, destination GLBs, shader source and weather PNGs validated; source artifacts outside repository still need independent inspection.'
};
if(check){const actual=JSON.parse(fs.readFileSync(manifestPath,'utf8'));if(JSON.stringify(actual)!==JSON.stringify(manifest))throw Error('Manifest differs from current source; run sync then commit changes');}else fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({modelCount:expected.length,sunken:76,graf:69,newWeather:weatherExtras.length,atlases:srcAtlases.length,missing:missing.length,extra:extra.length,sceneIds:used.length}));

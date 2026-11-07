// Trusted workflow adapter: create a candidate game with the existing seven-engine
// World_server generator. Never exposes a public write API or edits canonical meta6.
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const lab=path.resolve(__dirname,'../..');
const source=path.resolve(lab,'world-source');
if(!fs.existsSync(path.join(source,'lib/engines/generation-service.cjs')))
 throw Error('Pinned World_server checkout is required in world-source/');
const {createGenerationService}=require(path.join(source,'lib/engines/generation-service.cjs'));
const fixture=require(path.join(source,'test/fixtures/meta-game-vault.json'));
const slug=process.env.GAME_SLUG||'generated-preview';
if(!/^[a-z][a-z0-9-]{2,35}$/.test(slug))throw Error('Invalid game slug');
const requestString=process.env.GAME_REQUEST_JSON||'{}';
if(Buffer.byteLength(requestString)>32_768)throw Error('Game card exceeds 32 KiB');
const data=JSON.parse(requestString);
if(!data||typeof data!=='object'||Array.isArray(data)||
 Object.keys(data).some(k=>!['genre','startLocation','world_laws','randomSeed','world'].includes(k)))throw Error('Unknown game card field');
const card=structuredClone(fixture.gameCard);
card.id='generated-'+slug;
for(const k of ['genre','startLocation']){
 if(data[k]!==undefined){
  if(typeof data[k]!=='string'||!data[k]||data[k].length>160)throw Error('Invalid '+k);
  card[k]=data[k];
 }
}
if(data.world_laws!==undefined){
 if(!Array.isArray(data.world_laws)||data.world_laws.length<1||data.world_laws.length>6||
   data.world_laws.some(x=>typeof x!=='string'||x.length>160))throw Error('Invalid world_laws');
 card.world_laws=data.world_laws;
}
if(data.world!==undefined){
 if(!data.world||typeof data.world!=='object'||Array.isArray(data.world))throw Error('Invalid world');
 // The existing generation service independently validates physics, spawn and solids.
 card.world=data.world;
}
// META GAMES policy: a procedural original from World_server is NOT a donor.
// This generator does not yet assemble actual files from approved games.
// Fail closed rather than publish another plausible-looking noncompliant candidate.
throw new Error('SOURCE_POLICY_BLOCK: this generator uses procedural World_server geometry instead of game code and assets from the five originals or confirmed Claude games. No new candidate may be created until real SHA-pinned donor reuse is implemented.');
const seed=Number(data.randomSeed??fixture.randomSeed);
if(!Number.isSafeInteger(seed)||seed<1||seed>2147483647)throw Error('Invalid randomSeed');
const head=execFileSync('git',['rev-parse','HEAD'],{cwd:source,encoding:'utf8'}).trim();
const service=createGenerationService({sourceCommit:head});
const created=service.createGame({gameCard:card,randomSeed:seed,recentGames:[]});
const checked=service.validateGame(created.artifact_id);
if(!checked.integrity)throw Error('Generator integrity check failed');
const artifact=service.previewGame(created.artifact_id).package;
const output=path.join(lab,'meta-games-worlds',card.id);
if(fs.existsSync(output))throw Error('Candidate already exists; refusing to overwrite');
const keys=Object.keys(artifact.files);
if(!keys.length||keys.length>40)throw Error('Unexpected artifact size');
for(const [name,body] of Object.entries(artifact.files)){
 if(!/^[a-zA-Z0-9_./-]+$/.test(name)||name.split('/').some(x=>!x||x==='.'||x==='..')||
   path.isAbsolute(name)||typeof body!=='string'||Buffer.byteLength(body)>3_000_000)throw Error('Unsafe artifact entry');
 const dest=path.resolve(output,name);
 if(!dest.startsWith(output+path.sep))throw Error('Artifact path escapes sandbox');
 fs.mkdirSync(path.dirname(dest),{recursive:true});
 fs.writeFileSync(dest,body,{flag:'wx'});
}
fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify({
 ...artifact.manifest,manifest_sha256:artifact.manifest_sha256,
 source_policy:'original_generated_geometry_only;unverified_external_assets_excluded'
},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({game:card.id,source_commit:head,artifact_id:created.artifact_id,
  manifest_sha256:artifact.manifest_sha256,integrity:checked.integrity,files:keys.length,
  publication:'candidate_only_needs_bot_and_owner_review'}));

#!/usr/bin/env node
// Fail closed on new generated game files without verified source lineage.
// Read-only, never edits game files.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const read=p=>fs.readFileSync(path.join(root,p));
const blob=bytes=>createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
const upstream=path.resolve(root,'source-meta6');
const git=(...args)=>execFileSync('git',['-C',upstream,...args],{encoding:'utf8',maxBuffer:1024*1024}).trim();
function sourceBytes(ref){
  // Git verifies that the exact blob belongs to the claimed commit and path;
  // a modified local copy or forged SHA in a manifest cannot unlock a donor.
  if(!fs.existsSync(path.join(upstream,'.git')) ||
     git('rev-parse','--is-inside-work-tree')!=='true')
    throw Error('Required read-only mpaykin1/meta6 checkout missing at source-meta6');
  const rev=ref.commit+':'+ref.source_path;
  const actual=git('rev-parse','--verify',rev);
  if(actual!==ref.git_blob_sha || git('cat-file','-t',actual)!=='blob')
    throw Error('Pinned upstream commit does not contain approved source blob: '+ref.source_path);
  const length=Number(git('cat-file','-s',actual));
  if(!Number.isSafeInteger(length)||length>8_000_000)throw Error('Oversized source file');
  const bytes=execFileSync('git',['-C',upstream,'cat-file','blob',actual],{maxBuffer:8_100_000});
  if(bytes.length!==length||blob(bytes)!==actual)throw Error('Upstream source content mismatch');
  return bytes;
}
const safe=p=>typeof p==='string' && /^[a-zA-Z0-9_./-]+$/.test(p) &&
  !p.startsWith('/') && p.split('/').every(x=>x && x!=='.' && x!=='..');
const policy=read('rules/06-rabota-ii-s-kodom/META_GAMES_SOURCE_ALLOWLIST.md').toString('utf8');
const first=policy.split('## 1. Пять исходных эталонов')[1]?.split('## 2. Все игры Claude')[0];
if(!first)throw Error('Canonical source policy is unavailable');
const canonical=[...first.matchAll(/\|[^|\n]+\|\s*\x60([^\x60]+\/)\x60/g)].map(x=>x[1]);
if(canonical.length!==5 || new Set(canonical).size!==5)
  throw Error('Expected five canonical donors from META_GAMES_SOURCE_ALLOWLIST.md');

const registryFile=path.join(root,'shared/claude-game-sources.json');
const registry=fs.existsSync(registryFile)?JSON.parse(fs.readFileSync(registryFile,'utf8')):{games:[]};
if(!Array.isArray(registry.games))throw Error('Invalid Claude source registry');
const claude=registry.games.map(x=>{
  if(!x || !safe(x.path?.slice(0,-1)) || !/^games\/[a-z0-9-]+\/$/.test(x.path) ||
     !/^https:\/\/github\.com\/mpaykin1\/meta6\/pull\/\d+$/.test(x.evidence_pr) ||
     !/^[a-f0-9]{40}$/.test(x.commit) || x.author!=='Claude')
    throw Error('Unverified Claude-source registration');
  return x.path;
});
const pinnedOriginalCommit='ea74a313bb24eb25575f8021e218083c987bc280';
const donors=[...canonical,...claude];
const approvedCommit=(ref)=>canonical.some(prefix=>ref.source_path.startsWith(prefix))
  ? ref.commit===pinnedOriginalCommit
  : registry.games.some(x=>ref.source_path.startsWith(x.path)&&ref.commit===x.commit);
const thirdPartyMarkers=/@license|SPDX-License-Identifier|Copyright \(c\)|cdn\.jsdelivr|unpkg\.com|three\.min\.js|three\.module\.js/i;
const playable=/\.(?:html|js|mjs|cjs|glsl|wgsl|vert|frag|css|png|webp|jpg|jpeg|glb|gltf|ogg|mp3|wav|svg|json)$/i;
const metadata=new Set(['manifest.json','SOURCE_ASSETS.json','data/provenance.json','data/pipeline.json']);

function enumerate(dir,base=''){
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(d=>{
    const rel=base?base+'/'+d.name:d.name;
    if(d.isSymbolicLink())throw Error('Symlink is forbidden: '+rel);
    if(d.isDirectory())return enumerate(path.join(dir,d.name),rel);
    if(!d.isFile())throw Error('Unsupported file: '+rel);
    return [rel];
  });
}
function audit(game){
  if(!/^meta-games-worlds\/generated-[a-z0-9-]+$/.test(game))
    throw Error('Invalid candidate path');
  const dir=path.join(root,game);
  if(!fs.existsSync(dir))return;
  const mf=path.join(dir,'SOURCE_ASSETS.json');
  if(!fs.existsSync(mf))throw Error(game+': missing verified SOURCE_ASSETS.json; generated geometry alone is NOT an allowed donor');
  const manifest=JSON.parse(fs.readFileSync(mf,'utf8'));
  if(manifest?.policy!=='META_GAMES_SOURCE_ALLOWLIST' || !Array.isArray(manifest.files) || !manifest.files.length)
    throw Error(game+': no approved source files');
  const byOutput=new Map();
  for(const ref of manifest.files){
    if(!ref || !safe(ref.output) || !safe(ref.source_path) ||
       ref.repository!=='mpaykin1/meta6' || !/^[a-f0-9]{40}$/.test(ref.git_blob_sha) ||
       !/^[a-f0-9]{40}$/.test(ref.commit) ||
       !donors.some(prefix=>ref.source_path.startsWith(prefix)) || !approvedCommit(ref) ||
       byOutput.has(ref.output))
      throw Error(game+': unknown, unpinned, duplicate or forbidden game source');
    const bytes=sourceBytes(ref);
    if(/\.(?:js|mjs|cjs|html|glsl|css)$/i.test(ref.source_path) &&
       thirdPartyMarkers.test(bytes.toString('utf8')))
      throw Error(game+': third-party marker requires rights audit: '+ref.source_path);
    const target=path.join(dir,ref.output);
    if(!fs.existsSync(target) || !fs.statSync(target).isFile() ||
       !bytes.equals(fs.readFileSync(target)))
      throw Error(game+': game asset not actually assembled from approved donor '+ref.output);
    byOutput.set(ref.output,ref);
  }
  const gameFiles=enumerate(dir).filter(f=>playable.test(f)&&!metadata.has(f));
  if(!gameFiles.length || gameFiles.some(f=>!byOutput.has(f)))
    throw Error(game+': unaudited gameplay file, shader or asset');
  console.log('PASS: '+game+' contains '+gameFiles.length+' byte-verified assets/code files from approved games');
}
let candidates=[];
if(process.argv[2]==='--changed'){
  const base=process.argv[3];
  if(!/^[a-f0-9]{40}$/.test(base||''))throw Error('Exact base SHA required');
  const diff=execFileSync('git',['-C',root,'diff','--name-only',base+'...HEAD'],{encoding:'utf8'});
  candidates=[...new Set(diff.split('\n').map(x=>x.match(/^(meta-games-worlds\/generated-[a-z0-9-]+)\//)?.[1]).filter(Boolean))];
}else {
  candidates=process.argv.slice(2);
  if(!candidates.length)throw Error('Use --changed with base SHA or an explicit candidate directory');
}
for(const game of candidates)audit(game);
console.log('Source-policy gate: '+candidates.length+' changed candidate(s); no unauthorized game components admitted.');

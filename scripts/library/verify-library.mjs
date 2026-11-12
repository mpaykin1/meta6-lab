import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {ROOT,buildLibrary,LIMIT} from './machine.mjs';
import {searchLibrary} from './search.mjs';
import {verifyBibliotekaContract} from './verify-biblioteka-contract.mjs';
import {verifyFindSystemsAndMutations} from './mutate-find-systems.mjs';
import {mutateBibliotekaContract} from './mutate-biblioteka-contract.mjs';

const sum=buffer=>crypto.createHash('sha256').update(buffer).digest('hex');
const extSet=new Set(['.glb','.gltf','.png','.webp','.jpg','.jpeg','.mp3','.ogg','.wav','.json','.svg','.bin','.woff','.woff2','.ttf','.otf']);
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const fail=message=>{throw Error('LIBRARY INVALID: '+message);};
const rel=(root,filepath)=>path.relative(root,filepath).split(path.sep).join('/');
function safe(root,p){
  if(typeof p!=='string'||!p||p.includes('\\'))fail('bad path '+p);
  const full=path.resolve(root,p),diff=path.relative(root,full);
  if(diff==='..'||diff.startsWith('..'+path.sep)||path.isAbsolute(diff))fail('path escaped root: '+p);
  return full;
}
function independentWalk(dir){
  if(!fs.existsSync(dir))return [];
  const output=[];
  for(const d of fs.readdirSync(dir,{withFileTypes:true})){
    if(d.isSymbolicLink())fail('symlink '+d.name);
    const p=path.join(dir,d.name);
    if(d.isDirectory()&&!['.git','node_modules','.cache','coverage'].includes(d.name))output.push(...independentWalk(p));
    else if(d.isFile())output.push(p);
  }
  return output.sort();
}
function expectedGames(root){
  const base=path.join(root,'games');
  const found=fs.readdirSync(base,{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>({game:x.name,source_root:'games/'+x.name}));
  const contents=fs.readFileSync(path.join(root,'rules/06-rabota-ii-s-kodom/META_GAMES_SOURCE_ALLOWLIST.md'),'utf8');
  const lines=contents.split('\n');
  const first=lines.findIndex(line=>/^## 1\./.test(line)),second=lines.findIndex(line=>/^## 2\./.test(line));
  if(first<0||second<=first)fail('canonical allowlist section missing');
  const canonical=[];
  for(const line of lines.slice(first,second)){
    const columns=line.split('|').map(s=>s.trim());
    if(columns.length<4)continue;
    const matched=/^`([^`]+\/)`$/.exec(columns[2]);
    if(matched)canonical.push(matched[1].slice(0,-1));
  }
  if(!canonical.length)fail('empty allowlist');
  for(const source_root of canonical)found.push({game:'reference-'+source_root.replaceAll('/','--'),source_root});
  return found.sort((a,b)=>a.game.localeCompare(b.game,'en'));
}
const sourceCache=new Map();
function lineBuffer(file,lines){
  if(!Array.isArray(lines)||lines.length!==2||lines.some(n=>!Number.isInteger(n)))fail('missing line bounds '+file);
  if(!sourceCache.has(file)){
    const bytes=fs.readFileSync(file),starts=[0];
    for(let i=0;i<bytes.length;i++)if(bytes[i]===10)starts.push(i+1);
    sourceCache.set(file,{bytes,starts});
  }
  const {bytes,starts}=sourceCache.get(file),[a,b]=lines;
  if(a<1||b<a||b>starts.length)fail('invalid code range '+file+':'+lines);
  return bytes.subarray(starts[a-1],b<starts.length?starts[b]:bytes.length);
}
const allIds=rows=>rows.map(x=>x.id).sort();
export function verifyLibrary(root=ROOT,{live=true}={}){
  const directory=path.join(root,'shared/library'),index=read(path.join(directory,'index.json'));
  const expected=expectedGames(root);
  if(!Array.isArray(index.games)||JSON.stringify(index.games.map(x=>x.game).sort())!==JSON.stringify(expected.map(x=>x.game).sort()))fail('missing, extra or hardcoded games in global index');
  if(index.copy_limit_bytes!==LIMIT)fail('copy budget changed');
  const present=fs.readdirSync(directory).filter(x=>x.endsWith('.json')&&x!=='index.json').sort();
  const wanted=expected.map(x=>x.game+'.json').sort();
  if(JSON.stringify(present)!==JSON.stringify(wanted))fail('stale or missing manifest');
  const entries=[],copyPaths=new Set(),copyHashes=new Set(),ids=new Set(),summary=[];
  let copiedBytes=0;
  for(const exp of expected){
    const manifest=read(path.join(directory,exp.game+'.json'));
    if(manifest.game!==exp.game||manifest.source_root!==exp.source_root)fail('wrong game source '+exp.game);
    if(!Array.isArray(manifest.assets)||!manifest.assets.length)fail('no assets in '+exp.game);
    if(!Array.isArray(manifest.solutions)||!manifest.solutions.length)fail('no solutions in '+exp.game);
    const rootPath=safe(root,exp.source_root);
    if(!fs.statSync(rootPath).isDirectory())fail('source directory missing '+exp.source_root);
    const actual=independentWalk(rootPath).filter(p=>extSet.has(path.extname(p).toLowerCase())).map(p=>rel(root,p)).sort();
    const files=manifest.assets.filter(x=>x.bytes!==undefined).map(x=>x.source_path).sort();
    if(JSON.stringify(actual)!==JSON.stringify(files))fail('asset file skipped or invented in '+exp.game);
    const ownIds=new Set();
    for(const a of [...manifest.assets,...manifest.solutions]){
      if(typeof a.id!=='string'||!a.id||ownIds.has(a.id)||ids.has(a.id))fail('duplicate or empty ID '+a.id);
      ownIds.add(a.id);ids.add(a.id);
      if(a.game!==exp.game||!a.kind||typeof a.sha256!=='string'||!/^[0-9a-f]{64}$/.test(a.sha256))fail('malformed entry '+a.id);
      const source=safe(root,a.source_path);
      if(!a.source_path.startsWith(exp.source_root+'/'))fail('cross-game source '+a.source_path);
      if(!fs.existsSync(source)||!fs.statSync(source).isFile())fail('missing source '+a.source_path);
      if(a.bytes!==undefined){
        if(a.lines||!Number.isInteger(a.bytes)||a.bytes<0)fail('invalid file record '+a.id);
        const raw=fs.readFileSync(source);
        if(raw.length!==a.bytes||sum(raw)!==a.sha256)fail('source asset SHA-256 mismatched '+a.source_path);
        if(a.storage==='copy'){
          if(!a.copy_path||a.file!==a.copy_path||!a.copy_path.startsWith('shared/library/assets/'+exp.game+'/'))fail('copy path incorrect '+a.id);
          if(copyPaths.has(a.copy_path))fail('duplicate copy '+a.copy_path);
          copyPaths.add(a.copy_path);
          if(copyHashes.has(a.sha256))fail('duplicate binary content '+a.source_path);
          copyHashes.add(a.sha256);
          const copy=safe(root,a.copy_path);
          if(!fs.existsSync(copy)||sum(fs.readFileSync(copy))!==a.sha256)fail('copy not identical to source '+a.copy_path);
          copiedBytes+=a.bytes;
        }else if(a.storage==='reference'){
          if(a.copy_path||a.file!==a.source_path)fail('invalid reference '+a.id);
        }else fail('unknown storage mode '+a.id);
      }else{
        if(!a.lines||sum(lineBuffer(source,a.lines))!==a.sha256)fail('source code/table range SHA-256 mismatch '+a.source_path+':'+a.lines);
        if(a.kind!=='solution'&&!['inline-style','inline-svg','data-uri','base64-data','source-table','embedded-shader'].includes(a.kind))fail('invalid embedded asset '+a.kind);
      }
      if(a.kind==='solution'&&!Array.isArray(a.purpose))fail('missing purpose '+a.id);
      const {id,game,kind,name,purpose,source_path,lines,file,sha256}=a;
      entries.push({id,game,kind,...(name?{name}:{}),purpose:purpose||[],source_path,sha256,...(lines?{lines}:{}),...(file?{file}:{})});
    }
    const counts={assets:manifest.assets.length,file_assets:files.length,solutions:manifest.solutions.length};
    if(JSON.stringify(manifest.counts)!==JSON.stringify(counts))fail('count mismatch '+exp.game);
    const declared=index.games.find(g=>g.game===exp.game);
    if(declared.source_root!==exp.source_root||declared.manifest!=='shared/library/'+exp.game+'.json'||Object.keys(counts).some(k=>declared[k]!==counts[k]))fail('global counts mismatch '+exp.game);
    summary.push({game:exp.game,...counts});
  }
  if(copiedBytes>LIMIT||index.copied_bytes!==copiedBytes)fail('copy size exceeds budget or global byte count is wrong');
  const actualCopies=independentWalk(path.join(directory,'assets')).map(p=>rel(root,p)).sort();
  if(JSON.stringify(actualCopies)!==JSON.stringify([...copyPaths].sort()))fail('orphan or missing copied asset');
  if(JSON.stringify(index.entries)!==JSON.stringify(entries))fail('global search index differs from game manifests');
  if(live)liveDiscovery();
  return summary;
}
export function makeFixture(){
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'meta-library-'));
  fs.mkdirSync(path.join(root,'games/base'),{recursive:true});
  fs.mkdirSync(path.join(root,'reference/example'),{recursive:true});
  fs.mkdirSync(path.join(root,'rules/06-rabota-ii-s-kodom'),{recursive:true});
  fs.writeFileSync(path.join(root,'rules/06-rabota-ii-s-kodom/META_GAMES_SOURCE_ALLOWLIST.md'),
    '# Sources\n## 1. Канон\n| Name | Path |\n|---|---|\n| Reference | ' + String.fromCharCode(96) + 'reference/example/' + String.fromCharCode(96) + ' |\n## 2. Новые игры\n');
  fs.writeFileSync(path.join(root,'games/base/index.html'),'<style>canvas{display:block}</style><script>function moveHero(){return true;}</script>');
  fs.writeFileSync(path.join(root,'reference/example/index.html'),'<style>body{color:black}</style><script>function cameraFollow(){return true;}</script>');
  fs.writeFileSync(path.join(root,'games/base/ship.png'),Buffer.from([137,80,78,71,13,10,26,10,1,2,3,4]));
  return root;
}
function liveDiscovery(){
  const root=makeFixture();
  try{
    buildLibrary(root);verifyLibrary(root,{live:false});
    const newDir=path.join(root,'games/future-game');
    fs.mkdirSync(newDir,{recursive:true});
    fs.writeFileSync(path.join(newDir,'index.html'),'<style>canvas{color:red}</style><script>function attackEnemy(){return 7;}</script>');
    fs.writeFileSync(path.join(newDir,'hero.png'),Buffer.from([137,80,78,71,13,10,26,10,5,6,7,8]));
    buildLibrary(root);verifyLibrary(root,{live:false});
    const manifest=read(path.join(root,'shared/library/future-game.json'));
    const dynamic=read(path.join(root,'shared/library/index.json'));
    if(manifest.assets.filter(a=>a.bytes!==undefined).length!==1||manifest.solutions.length<1||
      !dynamic.games.some(x=>x.game==='future-game')||!dynamic.entries.some(x=>x.game==='future-game')||
      !searchLibrary({game:'future-game',kind:'solution',purpose:'combat'},root).results.some(e=>e.game==='future-game'))
      fail('extractor silently ignored a newly added game');
    fs.rmSync(newDir,{recursive:true,force:true});
    buildLibrary(root);verifyLibrary(root,{live:false});
    if(fs.existsSync(path.join(root,'shared/library/future-game.json'))||
      read(path.join(root,'shared/library/index.json')).entries.some(e=>e.game==='future-game'))fail('deleted game survived rebuild');
  }finally{fs.rmSync(root,{recursive:true,force:true});}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    verifyBibliotekaContract(ROOT);
    const caught = await verifyFindSystemsAndMutations();
    console.log('SYSTEM DISCOVERY MUTATIONS CAUGHT ' + caught);
    console.log('BIBLIOTEKA CONTRACT VERIFIED; MUTATIONS CAUGHT ' + mutateBibliotekaContract(ROOT));
    const rows=verifyLibrary();for(const row of rows)console.log(row.game+': assets '+row.assets+', file assets '+row.file_assets+', solutions '+row.solutions);console.log('LIBRARY VERIFIED');}
  catch(error){console.error(error.stack||error);process.exitCode=1;}
}

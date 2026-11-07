// META GAMES: low-token, read-only search of owner-approved source directories.
// No copies of game assets; original paths and exact SHA-256 checksums remain authoritative.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = [
  ['Twilight Island','observer-world-en-v7'],
  ['Ashen Path','ashen-sumerek'],
  ['Underwater World','underwater-world'],
  ['Three Worlds','three-worlds-game'],
  ['Veil Terraces','meta-games-worlds/veil-terraces']
];
const TEXT = new Set(['.js','.mjs','.cjs','.ts','.glsl','.vert','.frag','.json','.css','.svg','.html','.md']);
const ASSET = new Set([...TEXT,'.glb','.gltf','.png','.jpg','.jpeg','.webp','.gif','.ogg','.mp3','.wav','.woff','.woff2']);
const IGNORE = new Set(['.git','node_modules','evidence','tests','test','__pycache__','.github']);
const TOPICS = {
  shader: /shader|glsl|fragment|vertex|bloom|postprocess|material|uniform/i,
  fog: /fog|mist|haze|smoke|volumetric|дым|туман/i,
  lighting: /light|shadow|sun|glow|emissive|свет/i,
  physics: /physics|gravity|collision|ground|rigid|физик|столкнов/i,
  camera: /camera|follow|orbit|камер/i,
  input: /joystick|touch|pointer|keyboard|control|ввод|управлен/i,
  combat: /combat|enemy|weapon|attack|damage|hit|враг|оружие/i,
  procedural: /terrain|voxel|noise|biome|chunk|seed|procedural|генерац/i,
  audio: /audio|sound|music|sfx|ogg|mp3|звук|музык/i,
  story: /quest|story|dialogue|lore|memory|narrative|истори|квест/i,
  ui: /ui|menu|hud|overlay|button|panel|меню/i,
  performance: /lod|culling|batch|instanc|fps|gpu|optim|оптимизац/i
};
const rel = p => path.relative(ROOT,p).split(path.sep).join('/');
const normal = p => p.replace(/\\/g,'/').replace(/^\/+/,'');

function donors() {
  const candidates = BASE.map(([name,dir]) => ({name,dir,provenance:'five_owner_reference_games'}));
  const games = path.join(ROOT,'games');
  if (fs.existsSync(games)) for (const d of fs.readdirSync(games,{withFileTypes:true})) {
    if (!d.isDirectory()) continue;
    const dir = 'games/'+d.name, readme = path.join(ROOT,dir,'README.md');
    if (!fs.existsSync(readme)) continue;
    const body = fs.readFileSync(readme,'utf8');
    // Require explicit "made by Claude" statement; mere mention of Claude is not proof.
    if (/(?:Кто сделал|Сделан[аоы]?|Создан[аоы]?|Автор|Made by|Created by|Author)[^\n]{0,100}Claude/i.test(body)) {
      candidates.push({name:d.name,dir,provenance:'readme_explicit_claude_authorship'});
    }
  }
  return candidates.filter(d=>fs.existsSync(path.join(ROOT,d.dir)));
}

let cachedScan;
function scan() {
  if(cachedScan)return cachedScan;
  const items=[];
  for (const donor of donors()) {
    const base=path.join(ROOT,donor.dir);
    let count=0;
    const walk=dir=>{
      if (count>=1000) return;
      for (const e of fs.readdirSync(dir,{withFileTypes:true})) {
        if (IGNORE.has(e.name)||e.name.startsWith('.')) continue;
        const p=path.join(dir,e.name);
        if (e.isDirectory()) {walk(p);continue;}
        if (!e.isFile()||!ASSET.has(path.extname(e.name).toLowerCase())) continue;
        const st=fs.statSync(p);
        const ext=path.extname(p).toLowerCase();
        if (st.size>18_000_000) continue;
        const isText=TEXT.has(ext) && st.size<=2_000_000;
        const data=isText?fs.readFileSync(p):null;
        const kind=['.mp3','.ogg','.wav'].includes(ext)?'audio':
          ['.glb','.gltf'].includes(ext)?'model':
          ['.png','.jpg','.jpeg','.webp','.gif'].includes(ext)?'texture':
          ['.glsl','.vert','.frag'].includes(ext)?'shader':
          ['.js','.mjs','.cjs','.ts'].includes(ext)?'code':
          ext==='.css'?'style':ext==='.html'?'scene':'asset';
        const text=data?.toString('utf8')??'';
        const tags=Object.entries(TOPICS).filter(([_,re])=>re.test(e.name+' '+text.slice(0,45000))).map(([tag])=>tag);
        items.push({path:rel(p),sourceGame:donor.name,provenance:donor.provenance,kind,
          tags,size:st.size,sha256:data?crypto.createHash('sha256').update(data).digest('hex'):null,
          reusePolicy:'original_first_party_only;third_party_review_required'});
        count++;
      }
    };
    walk(base);
  }
  cachedScan=items.sort((a,b)=>a.path.localeCompare(b.path));
  return cachedScan;
}

function allowedSource(file) {
  const clean=normal(file);
  if (clean.includes('..')||path.isAbsolute(file)) throw Error('Unsafe source path');
  const item=scan().find(i=>i.path===clean);
  if (!item) throw Error('Source not indexed or not an allowed donor');
  const absolute=path.resolve(ROOT,clean);
  if (!fs.realpathSync(absolute).startsWith(fs.realpathSync(ROOT)+path.sep)) throw Error('Source escapes repository');
  return {item,absolute};
}

function search(query,kind,limit=8) {
  const words=String(query).toLowerCase().split(/[^\p{L}\p{N}_]+/u).filter(Boolean).slice(0,10);
  if (!words.length) return [];
  const ranked=[];
  for (const item of scan()) {
    if(kind && kind!=='all' && item.kind!==kind) continue;
    const corpus=(item.path+' '+item.tags.join(' ')+' '+item.sourceGame).toLowerCase();
    const score=words.reduce((n,w)=>n+(corpus.includes(w)?2:0),0);
    if (score>0) ranked.push({score,...item});
  }
  ranked.sort((a,b)=>b.score-a.score||a.size-b.size);
  return ranked.slice(0,Math.max(1,Math.min(25,Number(limit)||8)));
}

function searchSource(query,kind,limit=8) {
  const words=String(query).toLowerCase().split(/[^\p{L}\p{N}_]+/u).filter(w=>w.length>1).slice(0,8);
  if(!words.length)return [];
  const out=[];
  for(const item of scan()){
    if(kind&&kind!=='all'&&item.kind!==kind)continue;
    const full=path.join(ROOT,item.path);
    if(!TEXT.has(path.extname(full).toLowerCase())||item.size>300000)continue;
    const lines=fs.readFileSync(full,'utf8').split(/\r?\n/);
    let best=null;
    for(let i=0;i<lines.length;i++){
      const low=lines[i].toLowerCase();
      const hits=words.filter(w=>low.includes(w)).length;
      if(!hits)continue;
      const score=hits*4+(item.tags.some(t=>words.includes(t))?2:0);
      if(!best||score>best.score)best={score,line:i+1,snippet:lines.slice(Math.max(0,i-1),Math.min(lines.length,i+2)).join('\n').slice(0,320)};
      if(hits===words.length)break;
    }
    if(best)out.push({path:item.path,sourceGame:item.sourceGame,kind:item.kind,sha256:item.sha256,...best});
  }
  return out.sort((a,b)=>b.score-a.score||a.path.localeCompare(b.path)).slice(0,Math.max(1,Math.min(20,Number(limit)||8)));
}
function duplicateSources() {
  const hashes=new Map();
  for(const item of scan()){
    if(!item.sha256||item.size<100)continue;
    const found=hashes.get(item.sha256)||[];
    found.push(item.path);hashes.set(item.sha256,found);
  }
  return [...hashes].filter(([_,paths])=>paths.length>1)
    .map(([sha256,paths])=>({sha256,paths})).slice(0,100);
}

function inspect(file,start=1,count=30) {
  const {item,absolute}=allowedSource(file);
  if(!TEXT.has(path.extname(file).toLowerCase())||item.size>2_000_000)
    return {item,source:'Binary or large source: consult exact repository file',lines:[]};
  const lines=fs.readFileSync(absolute,'utf8').split(/\r?\n/);
  const from=Math.max(1,Math.min(lines.length,Math.trunc(Number(start)||1)));
  const to=Math.min(lines.length,from+Math.max(1,Math.min(80,Math.trunc(Number(count)||30)))-1);
  return {item,totalLines:lines.length,lines:lines.slice(from-1,to).map((text,i)=>({line:from+i,text}))};
}
function dependencies(file) {
  const {item,absolute}=allowedSource(file);
  if(!TEXT.has(path.extname(file).toLowerCase())||item.size>2_000_000) return {item,dependencies:[]};
  const text=fs.readFileSync(absolute,'utf8');
  const out=new Set();
  for(const m of text.matchAll(/(?:\bimport\s*(?:[^'"]*?\s+from\s*)?|\brequire\s*\(|\bimport\s*\()\s*['"]([^'"]+)['"]/g)) out.add(m[1]);
  return {item,dependencies:[...out].slice(0,80)};
}
export const library={donors,scan,search,searchSource,duplicateSources,inspect,dependencies};

function reply(id,result,error) {
  const msg={jsonrpc:'2.0',id};
  if(error) msg.error={code:-32000,message:String(error.message||error)};
  else msg.result=result;
  process.stdout.write(JSON.stringify(msg)+'\n');
}
const defs=[
  {name:'list_reference_games',description:'List verified source donor directories and their provenance',inputSchema:{type:'object',properties:{}}},
  {name:'search_reusable_code',description:'Find small, relevant original source files without copying whole files or wasting tokens',inputSchema:{type:'object',properties:{query:{type:'string'},kind:{type:'string'},limit:{type:'integer'}},required:['query']}},
  {name:'search_source_content',description:'Find matching code lines with short token-efficient snippets and exact file checksum',inputSchema:{type:'object',properties:{query:{type:'string'},kind:{type:'string'},limit:{type:'integer'}},required:['query']}},
  {name:'find_duplicate_sources',description:'Find byte-identical source files to avoid duplicated code and assets',inputSchema:{type:'object',properties:{}}},
  {name:'inspect_source_lines',description:'Read only requested source line window with exact path and checksum',inputSchema:{type:'object',properties:{path:{type:'string'},start:{type:'integer'},count:{type:'integer'}},required:['path']}},
  {name:'inspect_dependencies',description:'List imports of a source module',inputSchema:{type:'object',properties:{path:{type:'string'}},required:['path']}}
];
function callTool(name,args={}) {
  let result;
  if(name==='list_reference_games')result=donors();
  else if(name==='search_reusable_code')result=search(args.query,args.kind,args.limit);
  else if(name==='search_source_content')result=searchSource(args.query,args.kind,args.limit);
  else if(name==='find_duplicate_sources')result=duplicateSources();
  else if(name==='inspect_source_lines')result=inspect(args.path,args.start,args.count);
  else if(name==='inspect_dependencies')result=dependencies(args.path);
  else throw Error('Unknown tool '+name);
  return {content:[{type:'text',text:JSON.stringify(result)}]};
}
async function serveMcp() {
  for await(const line of readline.createInterface({input:process.stdin,crlfDelay:Infinity})) {
    if(!line.trim())continue;
    let msg;
    try {msg=JSON.parse(line)} catch {continue}
    if(msg.id===undefined)continue;
    try{
      if(msg.method==='initialize')reply(msg.id,{protocolVersion:'2025-03-26',capabilities:{tools:{}},serverInfo:{name:'meta-games-source-library',version:'1.0.0'}});
      else if(msg.method==='ping')reply(msg.id,{});
      else if(msg.method==='tools/list')reply(msg.id,{tools:defs});
      else if(msg.method==='tools/call')reply(msg.id,callTool(msg.params?.name,msg.params?.arguments));
      else reply(msg.id,null,new Error('Unsupported method '+msg.method));
    }catch(e){reply(msg.id,null,e)}
  }
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const [cmd,...args]=process.argv.slice(2);
  try{
    if(cmd==='mcp') await serveMcp();
    else if(cmd==='list') console.log(JSON.stringify(donors(),null,2));
    else if(cmd==='search') console.log(JSON.stringify(search(args.join(' ')),null,2));
    else if(cmd==='content') console.log(JSON.stringify(searchSource(args.join(' ')),null,2));
    else if(cmd==='duplicates') console.log(JSON.stringify(duplicateSources(),null,2));
    else if(cmd==='inspect') console.log(JSON.stringify(inspect(args[0],args[1],args[2]),null,2));
    else if(cmd==='deps') console.log(JSON.stringify(dependencies(args[0]),null,2));
    else console.error('Usage: node shared/library-search.mjs mcp|list|search <words>|inspect <path> [start] [count]|deps <path>');
  }catch(e){console.error(String(e));process.exitCode=1}
}

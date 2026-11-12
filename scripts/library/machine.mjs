import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

export const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export const LIMIT=50*1000*1000;
export const ASSET_EXT=new Set(['.glb','.gltf','.png','.webp','.jpg','.jpeg','.mp3','.ogg','.wav','.json','.svg','.bin','.woff','.woff2','.ttf','.otf']);
const CODE_EXT=new Set(['.js','.mjs','.cjs','.ts','.html','.htm','.css','.glsl','.vert','.frag']);
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const norm=x=>x.split(path.sep).join('/');
const rel=(root,file)=>norm(path.relative(root,file));
const save=(file,data)=>{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');};
const inside=(root,file)=>{const x=path.relative(root,file);if(!x||x==='..'||x.startsWith('..'+path.sep)||path.isAbsolute(x))throw Error('Outside root: '+file);return x;};

export function walk(folder){
  if(!fs.existsSync(folder))return [];
  const result=[];
  for(const d of fs.readdirSync(folder,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name,'en'))){
    const full=path.join(folder,d.name);
    if(d.isSymbolicLink())throw Error('Symlink in source: '+full);
    if(d.isDirectory()&&!['.git','node_modules','.cache','coverage'].includes(d.name))result.push(...walk(full));
    else if(d.isFile())result.push(full);
  }
  return result.sort();
}
export function discover(root=ROOT){
  const dir=path.join(root,'games');
  if(!fs.existsSync(dir))throw Error('Missing games directory');
  const games=fs.readdirSync(dir,{withFileTypes:true})
    .filter(d=>d.isDirectory()&&!d.name.endsWith('-copy')&&d.name!=='skin-trainer')
    .map(d=>({game:d.name,source_root:'games/'+d.name}));
  const rule=fs.readFileSync(path.join(root,'rules/06-rabota-ii-s-kodom/META_GAMES_SOURCE_ALLOWLIST.md'),'utf8');
  const table=rule.split(/##\s*1\.\s*/)[1]?.split(/##\s*2\.\s*/)[0];
  if(!table)throw Error('Missing allowlist table');
  const paths=[...table.matchAll(/^\|[^|\n]+\|\s*`([^`]+\/)`\s*\|/gm)].map(m=>m[1].replace(/\/$/,''));
  if(!paths.length)throw Error('Empty canonical allowlist');
  for(const p of paths){
    const full=path.resolve(root,p);inside(root,full);
    if(!fs.existsSync(full)||!fs.statSync(full).isDirectory())throw Error('Missing allowlisted source: '+p);
    games.push({game:'reference-'+p.replaceAll('/','--'),source_root:p});
  }
  const ids=new Set();
  for(const g of games){if(ids.has(g.game))throw Error('Duplicate game: '+g.game);ids.add(g.game);}
  return games.sort((a,b)=>a.game.localeCompare(b.game,'en'));
}
const lineStarts=text=>{const o=[0];for(let i=0;i<text.length;i++)if(text.charCodeAt(i)===10)o.push(i+1);return o;};
const lineAt=(offsets,position)=>{let lo=0,hi=offsets.length;while(lo+1<hi){const mid=(lo+hi)>>1;if(offsets[mid]<=position)lo=mid;else hi=mid;}return lo+1;};
export function rangeBytes(text,start,end){
  const offsets=lineStarts(text);
  if(!Number.isInteger(start)||!Number.isInteger(end)||start<1||end<start||end>offsets.length)throw Error('Invalid source lines');
  return Buffer.from(text.slice(offsets[start-1],end<offsets.length?offsets[end]:text.length),'utf8');
}
function expressionEnd(text,from){
  const stack=[];let quote='',escape=false,line=false,block=false;
  for(let i=from;i<text.length;i++){
    const c=text[i],n=text[i+1];
    if(line){if(c==='\n')line=false;continue;}
    if(block){if(c==='*'&&n==='/'){block=false;i++;}continue;}
    if(quote){if(escape){escape=false;continue;}if(c==='\\'){escape=true;continue;}if(c===quote)quote='';continue;}
    if(c==='/'&&n==='/'){line=true;i++;continue;}
    if(c==='/'&&n==='*'){block=true;i++;continue;}
    if(c==="'"||c==='"'||c===String.fromCharCode(96)){quote=c;continue;}
    if(c==='{'||c==='['||c==='(')stack.push(c);
    if(c==='}'||c===']'||c===')'){
      const expected={'}':'{',']':'[',')':'('}[c];
      if(!stack.length||stack.pop()!==expected)return i+1;
      if(!stack.length)return i+1;
    }
    if(c===';'&&!stack.length)return i+1;
  }
  return text.length;
}
const tags=name=>{
  const v=name.toLowerCase();
  const rules=[['camera',/camera|perspective|lookat|orbit|follow|view/],['controls',/control|input|touch|pointer|keyboard|joystick|move/],['combat',/combat|fight|attack|weapon|foe|enemy|damage|hit|flail/],['weather',/weather|cloud|rain|storm|fog|mist|snow|wind/],['audio',/audio|sound|music|sfx|chord/],['level-generation',/generate|terrain|biome|maze|map|chunk|world|island|noise|level/],['shader',/shader|glsl|frag|vert|material|render|lighting|bloom/],['animation',/anim|tween|pose|frame|sprite|rig/]];
  const result=rules.filter(([,rx])=>rx.test(v)).map(([tag])=>tag);
  return result.length?result:['gameplay'];
};
const fileKind=ext=>['.mp3','.ogg','.wav'].includes(ext)?'audio':['.glb','.gltf','.bin'].includes(ext)?'model':['.woff','.woff2','.ttf','.otf'].includes(ext)?'font':ext==='.json'?'json-data':'image';

function scan(root,file,game,assets,solutions){
  const text=fs.readFileSync(file,'utf8');
  if(!text.trim())return;
  const offsets=lineStarts(text),source_path=rel(root,file),seen=new Set(),memo=new Map();
  const add=(target,kind,name,a,b,purpose=[])=>{
    if(b<=a)return;
    const lines=[lineAt(offsets,a),lineAt(offsets,Math.min(text.length-1,b-1))];
    const key=kind+'|'+name+'|'+lines.join(':');
    if(seen.has(key))return;seen.add(key);
    const rk=lines.join(':');
    if(!memo.has(rk))memo.set(rk,hash(Buffer.from(text.slice(offsets[lines[0]-1],lines[1]<offsets.length?offsets[lines[1]]:text.length),'utf8')));
    target.push({id:hash([game,source_path,kind,name,...lines].join('\0')).slice(0,24),game,kind,name,purpose,source_path,lines,sha256:memo.get(rk)});
  };
  const ext=path.extname(file).toLowerCase();
  if(ext==='.css')add(assets,'inline-style',path.basename(file),0,text.length,['style']);
  if(['.glsl','.vert','.frag'].includes(ext))add(solutions,'solution',path.basename(file),0,text.length,['shader']);
  for(const m of text.matchAll(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi))add(assets,'inline-style','style@'+m.index,m.index,m.index+m[0].length,['style']);
  for(const m of text.matchAll(/<svg\b[^>]*>[\s\S]*?<\/svg\s*>/gi))add(assets,'inline-svg','svg@'+m.index,m.index,m.index+m[0].length,['svg']);
  for(const m of text.matchAll(/data:[\w.+-]+\/[\w.+-]+(?:;[\w=+.-]+)*,[^\s'"\x60<>)]{8,}/gi))add(assets,'data-uri','data@'+m.index,m.index,m.index+m[0].length,['embedded-asset']);
  for(const m of text.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(['"\x60])([A-Za-z0-9+/=]{128,})\2/g))add(assets,'base64-data',m[1],m.index,m.index+m[0].length,['embedded-asset']);
  for(const m of text.matchAll(/\b(?:const|let|var)\s+([A-Z][A-Z0-9_]{2,})\s*=\s*([\[{])/g)){
    if(!/(?:WEAPONS?|FOE|ENEMY|ENEMIES|BIOMES?|PALETT?E|SPRITES?|ATLAS|TILES?|MODEL|ITEM|ANIM|LEVEL|RAMPS?|COLORS?|SCENES?|DEFS|DATA|TABLE|MAP|OBJECT)/.test(m[1]))continue;
    add(assets,'source-table',m[1],m.index,expressionEnd(text,m.index+m[0].lastIndexOf(m[2])),tags(m[1]));
  }
  for(const m of text.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*(?:FRAG|VERT|GLSL|SHADER)[A-Za-z0-9_$]*)\s*=\s*\x60/gi)){
    const start=m.index+m[0].length-1;let end=text.indexOf(String.fromCharCode(96),start+1);
    if(end<0)end=text.length-1;
    add(assets,'embedded-shader',m[1],m.index,end+1,['shader']);
    add(solutions,'solution',m[1],m.index,end+1,['shader']);
  }
  for(const m of text.matchAll(/\b(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(|\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)\n]*\)|[A-Za-z_$][\w$]*)\s*=>|\bclass\s+([A-Za-z_$][\w$]*)/g)){
    const name=m[1]||m[2]||m[3],brace=text.indexOf('{',m.index+m[0].length),breakAt=text.indexOf('\n',m.index);
    let end=breakAt<0?text.length:breakAt;
    if(brace>=0&&brace<m.index+m[0].length+400&&(breakAt<0||brace<breakAt+400))end=expressionEnd(text,brace);
    add(solutions,'solution',name,m.index,end,tags(name));
  }
  for(const m of text.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi))if(m[1].trim())add(solutions,'solution','inline-script@'+m.index,m.index,m.index+m[0].length,['game-runtime']);
  if(['.js','.mjs','.cjs','.ts'].includes(ext))add(solutions,'solution','module:'+path.basename(file),0,text.length,['game-module']);
}
function inspect(root,entry){
  const assets=[],solutions=[];
  for(const file of walk(path.join(root,entry.source_root))){
    const ext=path.extname(file).toLowerCase(),source_path=rel(root,file);
    if(ASSET_EXT.has(ext)){
      const buf=fs.readFileSync(file);
      assets.push({id:hash([entry.game,source_path,'file'].join('\0')).slice(0,24),game:entry.game,kind:fileKind(ext),file:source_path,source_path,bytes:buf.length,sha256:hash(buf),storage:'reference'});
    }
    if(CODE_EXT.has(ext))scan(root,file,entry.game,assets,solutions);
  }
  assets.sort((a,b)=>a.source_path.localeCompare(b.source_path,'en')||a.id.localeCompare(b.id,'en'));
  solutions.sort((a,b)=>a.source_path.localeCompare(b.source_path,'en')||a.id.localeCompare(b.id,'en'));
  return {schema_version:1,game:entry.game,source_root:entry.source_root,assets,solutions};
}
export function buildLibrary(root=ROOT){
  const manifests=discover(root).map(g=>inspect(root,g)),target=path.join(root,'shared/library'),assetDir=path.join(target,'assets');
  const candidates=manifests.flatMap(m=>m.assets.filter(a=>a.bytes!==undefined)).sort((a,b)=>a.bytes-b.bytes||a.source_path.localeCompare(b.source_path,'en'));
  let copied=0;const selected=new Set(),copiedHashes=new Set();
  for(const a of candidates)if(!copiedHashes.has(a.sha256)&&copied+a.bytes<=LIMIT){selected.add(a.id);copiedHashes.add(a.sha256);copied+=a.bytes;}
  fs.rmSync(assetDir,{recursive:true,force:true});fs.mkdirSync(assetDir,{recursive:true});
  for(const m of manifests){
    for(const a of m.assets){
      if(a.bytes===undefined||!selected.has(a.id))continue;
      const suffix=path.posix.relative(m.source_root,a.source_path);
      const destination=path.join(assetDir,m.game,...suffix.split('/'));
      inside(assetDir,destination);
      fs.mkdirSync(path.dirname(destination),{recursive:true});
      fs.copyFileSync(path.join(root,...a.source_path.split('/')),destination,fs.constants.COPYFILE_EXCL);
      a.storage='copy';a.copy_path=rel(root,destination);a.file=a.copy_path;
    }
    m.counts={assets:m.assets.length,file_assets:m.assets.filter(a=>a.bytes!==undefined).length,solutions:m.solutions.length};
  }
  fs.mkdirSync(target,{recursive:true});
  // Historical duplicates are protected source records, not discoverable games.
  const archive=fs.readdirSync(target).filter(file=>file.endsWith('-copy.json')).sort().map(file=>{
    const game=file.slice(0,-5),duplicateOf=game.slice(0,-5);
    const archived=JSON.parse(fs.readFileSync(path.join(target,file),'utf8'));
    if(archived.game!==game||archived.source_root!=='games/'+game||
      !manifests.some(item=>item.game===duplicateOf))throw Error('Invalid protected copy manifest: '+file);
    return {game,duplicateOf,manifest:'shared/library/'+file,excluded:true};
  });
  // Preserve teaching-game history without exposing it as a reusable owner reference.
  const trainingFile=path.join(target,'skin-trainer.json');
  const training=fs.existsSync(trainingFile)?(()=>{
    const record=JSON.parse(fs.readFileSync(trainingFile,'utf8'));
    if(record.game!=='skin-trainer'||record.source_root!=='games/skin-trainer')
      throw Error('Invalid preserved training manifest: skin-trainer.json');
    return [{game:'skin-trainer',reason:'training',manifest:'shared/library/skin-trainer.json',excluded:true}];
  })():[];
  const excludedGames=[...archive,...training];
  const current=new Set([...manifests.map(m=>m.game+'.json'),...excludedGames.map(x=>path.basename(x.manifest))]);
  for(const file of fs.readdirSync(target))if(file.endsWith('.json')&&file!=='index.json'&&!current.has(file))fs.rmSync(path.join(target,file));
  for(const m of manifests)save(path.join(target,m.game+'.json'),m);
  const index={schema_version:1,copy_limit_bytes:LIMIT,copied_bytes:copied,excluded_games:excludedGames,
    games:manifests.map(m=>({game:m.game,source_root:m.source_root,manifest:'shared/library/'+m.game+'.json',...m.counts})),
    entries:manifests.flatMap(m=>[...m.assets,...m.solutions].map(({id,game,kind,name,purpose,source_path,lines,file,sha256})=>({id,game,kind,...(name?{name}:{}),purpose:purpose||[],source_path,sha256,...(lines?{lines}:{}),...(file?{file}:{})})))};
  save(path.join(target,'index.json'),index);
  return index;
}
export function assertRequested(root,requested){
  if(!requested)throw Error('Usage: node scripts/library/extract.mjs games/<name>');
  const full=path.resolve(root,requested),p=norm(inside(root,full));
  if(!discover(root).some(g=>g.source_root===p))throw Error('Unknown game or allowlisted source: '+p);
  return p;
}

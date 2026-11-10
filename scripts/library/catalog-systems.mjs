import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {ROOT,discover,walk,rangeBytes} from './machine.mjs';
import {isOriginalGameSource,codeSourceType,MIN_SYSTEM_LINES} from './source-policy.mjs';

const acorn=createRequire(new URL('./mcp-test/package.json',import.meta.url))('acorn');
const scanErrors=[];
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const categories={
camera:/camera|follow|lookAt|orbit|viewport/i,
controls:/control|input|touch|pointer|key(?:down|up)|joystick|move|steer|drag/i,
combat:/combat|attack|weapon|bullet|projectile|shoot|damage|hit|archer|dragon|arc2/i,
enemies:/enemy|boss|brain|patrol|foe|chase/i,
world:/terrain|world|biome|level|generate|island|noise/i,
weather:/weather|fog|rain|cloud|wind|storm|snow/i,
lighting:/light|shader|render|bloom|shadow|glow/i,
audio:/audio|music|sound|sfx|chord/i,
saves:/save|load|storage|checkpoint|progress/i,
menu:/menu|hud|overlay|gallery|dialog|button/i,
effects:/particle|smoke|spark|dust|debris|explosion|fx/i,
animation:/anim|sprite|pose|tween|rig|frame|tick/i,
lore:/lore|story|quest|dialogue|narrat/i
};
const russian={camera:'Камера',controls:'Управление',combat:'Бой',enemies:'Враги и ИИ',world:'Генерация мира',weather:'Погода',lighting:'Свет и рендер',audio:'Звук',saves:'Сохранения',menu:'Меню',effects:'Эффекты',animation:'Анимация',lore:'Лор'};
function blocks(text,file){
 const found=[];
 if(/\.html?$/.test(file)){
  const rx=/<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  for(const m of text.matchAll(rx))if(!/\bsrc\s*=/.test(m[1])&&!/@license|SPDX-License-Identifier/i.test(m[2].slice(0,4096)))found.push({text:m[2],offset:m.index+m[0].indexOf(m[2])});
 }else found.push({text,offset:0});
 return found;
}
function endBrace(s,pos){
 let depth=0,quote='',escape=false,line=false,comment=false;
 for(let i=pos;i<s.length;i++){
  const c=s[i],n=s[i+1];
  if(line){if(c==='\n')line=false;continue;}
  if(comment){if(c==='*'&&n==='/'){comment=false;i++;}continue;}
  if(quote){if(escape){escape=false;continue;}if(c==='\\'){escape=true;continue;}if(c===quote)quote='';continue;}
  if(c==='/'&&n==='/'){line=true;i++;continue;}
  if(c==='/'&&n==='*'){comment=true;i++;continue;}
  if(c==='"'||c==="'"||c.charCodeAt(0)===96){quote=c;continue;}
  if(c==='{')depth++;
  if(c==='}'&&--depth===0)return i+1;
 }
 return -1;
}
function functions(text,file){
 const found=[];
 for(const block of blocks(text,file)){
  let program;
  try{
   program=acorn.parse(block.text,{
    ecmaVersion:'latest',sourceType:'module',allowReturnOutsideFunction:true,
    allowAwaitOutsideFunction:true,allowHashBang:true
   });
  }catch(error){
   scanErrors.push({source_path:file,offset:block.offset,reason:'Acorn: '+error.message});
   continue;
  }
  for(const statement of program.body){
   const node=statement.type==='ExportNamedDeclaration'||statement.type==='ExportDefaultDeclaration'
    ?statement.declaration||statement:statement;
   const candidates=[];
   if(node.type==='FunctionDeclaration'||node.type==='ClassDeclaration'){
    if(node.id?.name)candidates.push({name:node.id.name,kind:'callable'});
   }else if(node.type==='VariableDeclaration'){
    for(const decl of node.declarations){
     if(decl.id?.type==='Identifier'&&['ArrowFunctionExpression','FunctionExpression','ClassExpression']
      .includes(decl.init?.type))candidates.push({name:decl.id.name,kind:'callable'});
    }
   }else if(statement.type==='ImportDeclaration'){
    candidates.push({name:'__import_'+statement.start,kind:'import'});
   }
   for(const candidate of candidates){
    const startOffset=block.offset+statement.start,endOffset=block.offset+statement.end;
    // Ranges are line-based. Never include an HTML script tag or half of a statement.
    const before=text.slice(text.lastIndexOf('\\n',startOffset-1)+1,startOffset);
    const nextNewline=text.indexOf('\\n',endOffset);
    const after=text.slice(endOffset,nextNewline<0?text.length:nextNewline);
    if(/<\\/?script|<\\/|\\u003cscript/i.test(before+after)){
     scanErrors.push({source_path:file,offset:startOffset,reason:'HTML tag shares declaration line'});
     continue;
    }
    const start=text.slice(0,startOffset).split('\\n').length;
    const end=text.slice(0,Math.max(startOffset,endOffset-1)).split('\\n').length;
    found.push({...candidate,start,end,code:text.slice(startOffset,endOffset),source_path:file});
   }
  }
 }
 return found;
}
function mergeRanges(nodes){
 const sorted=nodes.map(n=>({source_path:n.source_path,start:n.start,end:n.end})).sort((a,b)=>a.source_path.localeCompare(b.source_path)||a.start-b.start);
 const ranges=[];
 for(const r of sorted){
  const last=ranges.at(-1);
  if(last&&last.source_path===r.source_path&&r.start<=last.end+1)last.end=Math.max(last.end,r.end);
  else ranges.push({...r});
 }
 return ranges;
}
export function buildCatalog(root=ROOT,requested){
 scanErrors.length=0;
 const sources=discover(root).filter(x=>!/-copy$/i.test(x.game)&&(!requested||requested.includes(x.game)));
 // Identical -copy game directories are not independent owner-created systems.
 if(requested&&sources.length!==new Set(requested).size)throw Error('Unknown game');
 const entries=[],cache=new Map();
 for(const source of sources){
  const nodes=[];
  for(const file of walk(path.join(root,source.source_root))){
   const rel=path.relative(root,file).split(path.sep).join('/');
   if(!codeSourceType(rel))continue;
   const text=fs.readFileSync(file,'utf8');
   if(!isOriginalGameSource(rel,text))continue;
   cache.set(rel,text);
   nodes.push(...functions(text,rel));
   // Entire original standalone upgrade modules are usable subsystem boundaries.
   // Avoid slicing an IIFE into helpers without the module's initialization.
   const fileSystem=/arc2[_-]module|weapon[_-]module|combat[_-]module/i.test(path.basename(rel))?'combat':null;
   if(fileSystem&&text.split('\n').length>=MIN_SYSTEM_LINES){
    nodes.push({name:'weaponModule',start:1,end:text.split('\n').length,code:text,source_path:rel});
   }
  }
  for(const [system,rx] of Object.entries(categories)){
   const primary=nodes.filter(n=>n.kind==='callable'&&rx.test(n.name));
   if(!primary.length)continue;
   const names=new Map(nodes.map(n=>[n.name,n]));
   const selected=new Map(primary.map(n=>[n.source_path+':'+n.start,n]));
   for(const n of primary)for(const m of n.code.matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)){
    const helper=names.get(m[1]);
    if(helper&&(!Object.entries(categories).some(([k,r])=>k!==system&&r.test(helper.name))))selected.set(helper.source_path+':'+helper.start,helper);
   }
   const chosen=[...selected.values()];
   for(const node of nodes)if(node.kind==='import'&&chosen.some(n=>n.source_path===node.source_path))
    chosen.push(node);
   const lines=mergeRanges(chosen);
   if(lines.reduce((n,r)=>n+r.end-r.start+1,0)<MIN_SYSTEM_LINES)continue;
   const bytes=Buffer.concat(lines.map(r=>rangeBytes(cache.get(r.source_path),r.start,r.end)));
   const code=chosen.map(n=>n.code).join('\n');
   const dom=[...new Set([...code.matchAll(/getElementById\s*\(\s*['"]([^'"]+)['"]/g)].map(m=>m[1]))];
   const globals=[...new Set([...code.matchAll(/\b(?:THREE|scene|renderer|camera|document|window|AudioContext|localStorage)\b/g)].map(m=>m[0]))];
   entries.push({id:source.game+':'+system,game:source.game,system,title:system,what_it_does:{en:'Original '+system+' game subsystem; requires its original initialization and dependencies.',ru:'Оригинальная система «'+russian[system]+'»; требует исходной инициализации и зависимостей.'},source_path:lines[0].source_path,lines,sha256:digest(bytes),depends_on:[],asset_ids:[],how_to_connect:{entrypoint:primary[0].name,required_globals:globals,dom_ids:dom,example:primary[0].name+'(/* original game parameters */)'},load_ok:false,load_error:'Not independently verified in Chromium',_names:chosen.map(n=>n.name)});
  }
 }
 for(const e of entries){
  const code=e.lines.map(r=>cache.get(r.source_path).split('\n').slice(r.start-1,r.end).join('\n')).join('\n');
  e.depends_on=entries.filter(other=>other.game===e.game&&other.id!==e.id&&other._names.some(n=>code.includes(n+'('))).map(x=>x.id);
 }
 for(const e of entries)delete e._names;
 const result={schema_version:1,minimum_system_lines:MIN_SYSTEM_LINES,game_count:sources.length,solution_count:entries.length,scan_errors:scanErrors,solutions:entries};
 const dest=path.join(root,'shared/library/catalog-solutions.json');
 fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,JSON.stringify(result,null,2)+'\n');
 return result;
}

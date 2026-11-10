// Catalog MCP access. Original source bytes only; writes are new refs, never main or worktree.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {createHash,randomBytes} from 'node:crypto';
import {rangeBytes} from '../../../scripts/library/machine.mjs';
import {isOriginalGameSource} from '../../../scripts/library/source-policy.mjs';

const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const safeId=value=>typeof value==='string'&&/^[a-zA-Z0-9:._-]{1,160}$/.test(value);
const baseUrl='https://github.com/mpaykin1/meta6-lab/blob/';
const gitEnv=Object.fromEntries(Object.entries(process.env).filter(([key])=>
 !/^GIT_(?:DIR|WORK_TREE|INDEX_FILE|OBJECT_DIRECTORY|ALTERNATE_OBJECT_DIRECTORIES|COMMON_DIR|NAMESPACE|CONFIG_|CEILING_DIRECTORIES)/.test(key)));
function git(root,args,opt={}){
 return execFileSync('git',['-C',root,...args],{
  env:{...gitEnv,...opt.env},input:opt.input,
  encoding:opt.encoding||'utf8',timeout:30000,maxBuffer:64*1024*1024
 });
}
function within(root,relativePath){
 if(typeof relativePath!=='string'||!relativePath||relativePath.includes('\\')||
  relativePath.startsWith('/')||relativePath.split('/').some(part=>!part||part==='.'||part==='..'||part==='.git'))throw Error('Unsafe source path');
 const full=path.resolve(root,relativePath);
 const relative=path.relative(root,full);
 if(!relative||relative.startsWith('..'+path.sep)||relative==='..'||path.isAbsolute(relative))throw Error('Outside repository');
 let current=root;
 for(const part of relativePath.split('/')){
  current=path.join(current,part);
  if(fs.existsSync(current)&&fs.lstatSync(current).isSymbolicLink())throw Error('Symlink forbidden');
 }
 return full;
}
function json(root,filename){return JSON.parse(fs.readFileSync(within(root,filename),'utf8'))}
function catalog(root){
 const data=json(root,'shared/library/catalog-solutions.json');
 if(!Array.isArray(data.solutions))throw Error('Catalog is not built');
 return data.solutions;
}
function index(root){
 const data=json(root,'shared/library/index.json');
 if(!Array.isArray(data.entries))throw Error('Asset library is not built');
 return data.entries;
}
function verifiedSource(root,solution){
 if(!solution||!safeId(solution.id)||!Array.isArray(solution.lines)||!solution.lines.length)throw Error('Invalid solution metadata');
 const buffers=[];
 for(const r of solution.lines){
  const full=within(root,r.source_path);
  const source=fs.readFileSync(full,'utf8');
  if(!isOriginalGameSource(r.source_path,source))throw Error('Unapproved vendor source: '+r.source_path);
  buffers.push(rangeBytes(source,r.start,r.end));
 }
 const bytes=Buffer.concat(buffers);
 if(hash(bytes)!==solution.sha256)throw Error('Source hash mismatch: '+solution.id);
 return bytes;
}
function dependencies(byId,ids){
 const visited=new Set(),sorted=[];
 function visit(id){
  if(visited.has(id))return;
  const item=byId.get(id);
  if(!item)throw Error('Unknown solution dependency: '+id);
  visited.add(id);
  for(const d of item.depends_on||[])visit(d);
  sorted.push(item);
 }
 for(const id of ids)visit(id);
 return sorted;
}
function tokens(q){
 return String(q).toLocaleLowerCase().normalize('NFKD').split(/[^\p{L}\p{N}]+/u).filter(x=>x.length>1);
}
function score(row,term){
 const keys=[row.id,row.title,row.system,row.game,row.what_it_does?.en,row.what_it_does?.ru].join(' ').toLowerCase();
 const system=String(row.system||'').toLowerCase();
 return term.reduce((n,t)=>n+(system.includes(t)?8:keys.includes(t)?2:0),0);
}
function limitOf(value,max=30){
 const n=value===undefined?20:value;
 if(!Number.isInteger(n)||n<1||n>max)throw Error('limit must be 1..'+max);
 return n;
}
function link(root,file){
 const commit=git(root,['rev-parse','HEAD']).trim();
 return baseUrl+commit+'/'+file.split('/').map(encodeURIComponent).join('/');
}
function assetMeta(root,item){
 const file=item.file||item.source_path;
 if(typeof file!=='string')throw Error('Asset has no file');
 within(root,file);
 return {id:item.id,game:item.game,kind:item.kind,name:item.name||null,
  source_path:item.source_path,file,sha256:item.sha256,url:link(root,file)};
}
export const libraryDefs=[
 {name:'search_solutions',description:'Search owner-authored gameplay systems; results are exact source references, not generated code.',inputSchema:{type:'object',properties:{query:{type:'string'},system:{type:'string'},game:{type:'string'},limit:{type:'integer',minimum:1,maximum:50}},required:['query'],additionalProperties:false}},
 {name:'get_solution',description:'Return checksum-verified original code for a solution and its recursive dependencies, integration metadata and required asset links.',inputSchema:{type:'object',properties:{id:{type:'string'}},required:['id'],additionalProperties:false}},
 {name:'search_assets',description:'Find exact existing library assets by tag, kind and game. Binary data is returned by repository URL, not embedded in MCP.',inputSchema:{type:'object',properties:{query:{type:'string'},kind:{type:'string'},game:{type:'string'},limit:{type:'integer',minimum:1,maximum:50}},required:['query'],additionalProperties:false}},
 {name:'get_asset',description:'Return hash-verified asset metadata and a direct repository URL to original bytes.',inputSchema:{type:'object',properties:{id:{type:'string'}},required:['id'],additionalProperties:false}},
 {name:'assemble_game',description:'Copy selected verified source systems and assets to a fresh sandbox branch only. A scaffold requires full runtime validation before publication.',inputSchema:{type:'object',properties:{solution_ids:{type:'array',items:{type:'string'},minItems:1,maxItems:32,uniqueItems:true},asset_ids:{type:'array',items:{type:'string'},maxItems:100,uniqueItems:true},title:{type:'string',minLength:1,maxLength:120}},required:['solution_ids','asset_ids','title'],additionalProperties:false}}
];
function requireId(id){if(!safeId(id))throw Error('Invalid id')}
function uniqueValues(items,name,max){
 if(!Array.isArray(items)||items.length>max||new Set(items).size!==items.length||items.some(x=>!safeId(x)))throw Error('Invalid '+name);
 return items;
}
function checkedRepository(root){
 const actual=fs.realpathSync(root);
 if(git(actual,['rev-parse','--show-toplevel']).trim()!==actual)throw Error('Not repository root');
 const origin=git(actual,['remote','get-url','origin']).trim();
 if(!/^(?:https:\/\/github\.com\/mpaykin1\/meta6-lab(?:\.git)?|git@github\.com:mpaykin1\/meta6-lab(?:\.git)?)$/i.test(origin))throw Error('Repository is not the META GAMES sandbox');
 return actual;
}
function assemble(root,args,byId,assetById){
 const solutions=uniqueValues(args.solution_ids,'solution_ids',32);
 const assets=uniqueValues(args.asset_ids,'asset_ids',100);
 if(!solutions.length||typeof args.title!=='string'||!args.title.trim()||args.title.length>120)throw Error('Invalid game assembly');
 const ordered=dependencies(byId,solutions),assetIds=new Set(assets);
 for(const row of ordered)for(const id of row.asset_ids||[])assetIds.add(id);
 const selectedAssets=[...assetIds].map(id=>{
  const item=assetById.get(id);
  if(!item||item.kind==='solution')throw Error('Asset not in catalog: '+id);
  return item;
 });
 const checked=checkedRepository(root);
 const parent=git(checked,['rev-parse','HEAD']).trim();
 const title=args.title.trim();
 const slug=title.toLowerCase().normalize('NFKD').replace(/[^a-z0-9-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40)||'new-game';
 const suffix=hash(Buffer.from(parent+JSON.stringify({solutions,assets,title})+randomBytes(12).toString('hex'))).slice(0,12);
 const name=slug+'-'+suffix,folder='games/'+name;
 if(fs.existsSync(path.join(checked,folder)))throw Error('Game folder already exists');
 const created=[];
 for(const s of ordered){
  const filename=folder+'/systems/'+s.id.replace(/[^a-z0-9_-]/gi,'-')+'.js';
  created.push({file:filename,bytes:verifiedSource(checked,s)});
 }
 for(const a of selectedAssets){
  const source=a.source_path,full=within(checked,source);
  const bytes=fs.readFileSync(full);
  if(hash(bytes)!==a.sha256)throw Error('Asset hash mismatch: '+a.id);
  created.push({file:folder+'/assets/'+a.id+path.extname(source),bytes});
 }
 const files=created.filter(x=>x.file.endsWith('.js')).map(x=>path.posix.relative(folder,x.file));
 const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+
  title.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;')+
  '</title></head><body><canvas id="game" width="960" height="540"></canvas>\n'+
  files.map(p=>'<script src="./'+p+'"></script>').join('\n')+
  '\n</body></html>\n';
 created.push({file:folder+'/index.html',bytes:Buffer.from(html)});
 const manifest={title,source_commit:parent,solutions:ordered.map(s=>s.id),assets:selectedAssets.map(a=>a.id),
  status:'unverified_scaffold',note:'Only original code/assets are copied; no rendering or playability is claimed.'};
 created.push({file:folder+'/assembly.json',bytes:Buffer.from(JSON.stringify(manifest,null,2)+'\n')});
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'meta-assemble-index-'));
 let commit;
 try{
  const env={GIT_INDEX_FILE:path.join(tmp,'index')};
  git(checked,['read-tree',parent],{env});
  for(const item of created){
   const blob=git(checked,['hash-object','-w','--stdin'],{input:item.bytes,env}).trim();
   git(checked,['update-index','--add','--cacheinfo','100644,'+blob+','+item.file],{env});
  }
  const tree=git(checked,['write-tree'],{env}).trim();
  commit=git(checked,['-c','user.name=META GAMES MCP','-c','user.email=mcp@users.noreply.github.com',
   'commit-tree',tree,'-p',parent,'-m','MCP: assemble '+name],{env}).trim();
 }finally{fs.rmSync(tmp,{recursive:true,force:true})}
 const branch='mcp-assemble/'+name;
 git(checked,['check-ref-format','--branch',branch]);
 git(checked,['update-ref','refs/heads/'+branch,commit,'0000000000000000000000000000000000000000']);
 return {branch,commit,path:folder+'/index.html',status:'unverified_scaffold',
  source_systems:ordered.map(s=>s.id),asset_ids:selectedAssets.map(a=>a.id),
  worktree_unchanged:true,main_unchanged:true};
}
export async function callLibraryTool(name,args={},repositoryRoot){
 if(!libraryDefs.some(d=>d.name===name))throw Error('Unknown library tool: '+name);
 const root=path.resolve(repositoryRoot);
 if(name==='search_solutions'){
  if(typeof args.query!=='string'||!args.query.trim())throw Error('query required');
  const term=tokens(args.query);const max=limitOf(args.limit,50);
  const matches=catalog(root).filter(s=>(!args.game||args.game===s.game)&&(!args.system||args.system===s.system)&&score(s,term)>0);
  matches.sort((a,b)=>score(b,term)-score(a,term)||a.id.localeCompare(b.id,'en'));
  return {total:matches.length,solutions:matches.slice(0,max).map(s=>({
   id:s.id,game:s.game,system:s.system,title:s.title,what_it_does:s.what_it_does,
   load_ok:s.load_ok===true
  }))};
 }
 if(name==='get_solution'){
  requireId(args.id);
  const byId=new Map(catalog(root).map(s=>[s.id,s]));
  const ordered=dependencies(byId,[args.id]);
  const assets=new Map(index(root).filter(x=>x.kind!=='solution').map(a=>[a.id,a]));
  const assetIds=new Set();
  for(const s of ordered)for(const id of s.asset_ids||[])assetIds.add(id);
  return {id:args.id,dependencies:ordered.filter(s=>s.id!==args.id).map(s=>s.id),
   systems:ordered.map(s=>({id:s.id,game:s.game,system:s.system,source_path:s.source_path,
     lines:s.lines,sha256:s.sha256,code:verifiedSource(root,s).toString('utf8'),
     depends_on:s.depends_on,how_to_connect:s.how_to_connect,load_ok:s.load_ok===true})),
   assets:[...assetIds].map(id=>{const item=assets.get(id);if(!item)throw Error('Unknown required asset: '+id);return assetMeta(root,item)})};
 }
 if(name==='search_assets'){
  if(typeof args.query!=='string')throw Error('query required');
  const term=tokens(args.query);const max=limitOf(args.limit,50);
  const matches=index(root).filter(s=>s.kind!=='solution'&&(!args.kind||s.kind===args.kind)&&
   (!args.game||s.game===args.game)&&
   term.every(x=>[s.name,s.kind,s.source_path,...(s.purpose||[])].join(' ').toLowerCase().includes(x)));
  return {total:matches.length,assets:matches.slice(0,max).map(a=>assetMeta(root,a))};
 }
 if(name==='get_asset'){
  requireId(args.id);
  const item=index(root).find(a=>a.id===args.id&&a.kind!=='solution');
  if(!item)throw Error('Unknown asset id');
  const bytes=item.lines?
    rangeBytes(fs.readFileSync(within(root,item.source_path),'utf8'),item.lines[0],item.lines[1]):
    fs.readFileSync(within(root,item.source_path));
  if(hash(bytes)!==item.sha256)throw Error('Asset checksum mismatch');
  return {...assetMeta(root,item),bytes:bytes.length};
 }
 if(name==='assemble_game'){
  return assemble(root,args,new Map(catalog(root).map(s=>[s.id,s])),
   new Map(index(root).map(a=>[a.id,a])));
 }
 throw Error('Unimplemented library tool');
}

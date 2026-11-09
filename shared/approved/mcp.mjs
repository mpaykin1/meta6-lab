// Read-only local MCP: only source bytes already approved by the owner.
import readline from 'node:readline';
import {readFileSync,readdirSync,statSync,lstatSync,realpathSync} from 'node:fs';
import {resolve,relative,isAbsolute,win32,join,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {approvedComponents,searchApproved,inspectApproved,getApprovedSource} from './search.mjs';
import {runBot} from './tools/run-bot.mjs';

function listGames(){
 const html=readFileSync(new URL('../../meta-games/index.html',import.meta.url),'utf8');
 const games=[];
 for(const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)){
  const attrs=match[1];
  const className=attrs.match(/\bclass\s*=\s*(["'])(.*?)\1/i)?.[2]||'';
  if(!className.split(/\s+/).includes('game'))continue;
  const href=attrs.match(/\bhref\s*=\s*(["'])(.*?)\1/i)?.[2]||'';
  if(!/^\.\.\/(?:[a-z0-9-]+\/)+$/i.test(href))throw Error('Invalid game card href: '+href);
  const title=match[2].match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/i)?.[1]?.replace(/<[^>]+>/g,'').trim();
  if(!title)throw Error('Game card has no title: '+href);
  const gamePath=href.slice(3,-1);
  games.push({id:gamePath.split('/').at(-1),title,path:gamePath,url:'https://mpaykin1.github.io/meta6/'+gamePath+'/'});
 }
 return games;
}


const repositoryRoot=realpathSync(fileURLToPath(new URL('../../',import.meta.url)));
const binaryExtensions=new Set([
 '.png','.jpg','.jpeg','.gif','.webp','.avif','.ico','.bmp','.tif','.tiff',
 '.glb','.bin','.wasm','.mp3','.ogg','.opus','.wav','.flac','.aac','.m4a',
 '.mp4','.webm','.mov','.zip','.gz','.pdf','.woff','.woff2','.ttf','.otf',
 '.ktx','.ktx2','.basis','.hdr','.exr'
]);

function gameDirectory(id){
 if(typeof id!=='string'||!id)throw Error('Unknown game id');
 const games=listGames().filter(game=>game.id===id);
 if(games.length!==1)throw Error('Unknown game id: '+id);
 const directory=resolve(repositoryRoot,games[0].path);
 const subpath=relative(repositoryRoot,directory);
 if(!subpath||subpath==='..'||subpath.startsWith('..'+sep)||isAbsolute(subpath)){
  throw Error('Game outside repository');
 }
 const actual=realpathSync(directory);
 const actualSubpath=relative(repositoryRoot,actual);
 if(!actualSubpath||actualSubpath==='..'||actualSubpath.startsWith('..'+sep)||isAbsolute(actualSubpath)){
  throw Error('Game outside repository');
 }
 if(actual!==directory)throw Error('Game directory symlink forbidden');
 if(!statSync(directory).isDirectory())throw Error('Game is not a directory');
 return directory;
}

function listGameFiles(id){
 const directory=gameDirectory(id);
 const result=[];
 function walk(folder){
  for(const entry of readdirSync(folder,{withFileTypes:true})){
   if(entry.isSymbolicLink())continue;
   const full=join(folder,entry.name);
   if(entry.isDirectory())walk(full);
   else if(entry.isFile()){
    result.push({file:relative(directory,full).split(sep).join('/'),bytes:statSync(full).size});
   }
  }
 }
 walk(directory);
 return result.sort((a,b)=>a.file.localeCompare(b.file,'en'));
}

function checkedGameFile(directory,file){
 if(typeof file!=='string'||!file||file.includes('..')||file.includes('\\')||
    file.includes('\0')||isAbsolute(file)||win32.isAbsolute(file)){
  throw Error('Invalid file path');
 }
 const parts=file.split('/');
 if(parts.some(part=>!part||part==='.'))throw Error('Invalid file path');
 let current=directory;
 for(const part of parts){
  current=join(current,part);
  if(lstatSync(current).isSymbolicLink())throw Error('Symlink forbidden');
 }
 const subpath=relative(directory,current);
 if(!subpath||subpath==='..'||subpath.startsWith('..'+sep)||isAbsolute(subpath)){
  throw Error('File outside game directory');
 }
 if(!statSync(current).isFile())throw Error('Not a game file');
 return current;
}

function readGameFile(id,file,start=1,count=400){
 const directory=gameDirectory(id);
 const full=checkedGameFile(directory,file);
 if(!Number.isSafeInteger(start)||start<1||!Number.isSafeInteger(count)||count<1||count>10000){
  throw Error('Invalid line window');
 }
 const bytes=statSync(full).size;
 const ext=file.slice(file.lastIndexOf('.')).toLowerCase();
 if(binaryExtensions.has(ext))throw Error('binary: '+bytes+' bytes');
 const raw=readFileSync(full);
 if(raw.includes(0))throw Error('binary: '+bytes+' bytes');
 let text;
 try{text=new TextDecoder('utf-8',{fatal:true}).decode(raw)}
 catch{throw Error('binary: '+bytes+' bytes')}
 // Preserve original LF/CRLF bytes, including the last newline.
 const chunks=text.match(/[^\n]*\n|[^\n]+$/g)||[];
 return {id,file,bytes,start,count,totalLines:chunks.length,text:chunks.slice(start-1,start-1+count).join('')};
}

const defs=[
 {name:'list_approved_components',description:'Exact original source modules with verified upstream Git blob',inputSchema:{type:'object',properties:{}}},
 {name:'search_approved_code',description:'Search approved code and return small matching line snippets',inputSchema:{type:'object',properties:{query:{type:'string'},limit:{type:'integer'}},required:['query']}},
 {name:'inspect_approved_component',description:'Read a small window of original approved code',inputSchema:{type:'object',properties:{id:{type:'string'},start:{type:'integer'},count:{type:'integer'}},required:['id']}},
 {name:'get_approved_component_source',description:'Get complete original, hash-checked JavaScript source for deliberate integration in a sandbox game; prefer search for discovery',inputSchema:{type:'object',properties:{id:{type:'string'}},required:['id']}},
 {name:'list_game_files',description:'List recursive relative game files and byte lengths for a game from list_games',inputSchema:{type:'object',properties:{id:{type:'string'}},required:['id']}},
 {name:'read_game_file',description:'Read a precise text line window from an allowlisted game; binary assets are rejected with byte size',inputSchema:{type:'object',properties:{id:{type:'string'},file:{type:'string'},start:{type:'integer',minimum:1},count:{type:'integer',minimum:1,maximum:10000}},required:['id','file']}},
 {name:'list_games',description:'List all self-hosted games directly from the META GAMES homepage',inputSchema:{type:'object',properties:{}}},
 {name:'run_bot',description:'Run Claude META BOT (full mobile, desktop and second run; max 300 seconds, one run at a time)',inputSchema:{type:'object',properties:{id:{type:'string'},mode:{type:'string',enum:['full']}},required:['id']}}
];
function answer(id,result,error){
 const out={jsonrpc:'2.0',id};
 if(error)out.error={code:-32000,message:String(error.message||error)};
 else out.result=result;
 process.stdout.write(JSON.stringify(out)+'\n');
}
for await(const line of readline.createInterface({input:process.stdin,crlfDelay:Infinity})){
 let msg;try{msg=JSON.parse(line)}catch{continue}
 if(msg.id===undefined)continue;
 try{
  if(msg.method==='initialize'){
   answer(msg.id,{protocolVersion:'2025-03-26',capabilities:{tools:{}},serverInfo:{name:'meta-games-approved-source',version:'1.0.0'}});
  }
  else if(msg.method==='ping')answer(msg.id,{});
  else if(msg.method==='tools/list')answer(msg.id,{tools:defs});
  else if(msg.method==='tools/call'){
   const {name,arguments:args={}}=msg.params||{};
   const value=name==='run_bot'?await runBot(args,listGames()):
    name==='list_approved_components'?approvedComponents():
    name==='search_approved_code'?searchApproved(args.query,args.limit):
    name==='inspect_approved_component'?inspectApproved(args.id,args.start,args.count):
    name==='get_approved_component_source'?getApprovedSource(args.id):
    name==='list_games'?listGames():
    name==='list_game_files'?listGameFiles(args.id):
    name==='read_game_file'?readGameFile(args.id,args.file,args.start,args.count):
    (()=>{throw Error('Unknown tool')})();
   answer(msg.id,{content:[{type:'text',text:JSON.stringify(value)}]});
  }else answer(msg.id,null,new Error('Unsupported method'));
 }catch(e){answer(msg.id,null,e)}
}

// Local stdio MCP for AI agents; no public write endpoint or credentials.
// Connect a trusted agent to this server from the repository workspace.
import readline from 'node:readline';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const tools=[
 {name:'list_game_candidates',description:'List generated candidates in the sandbox; no mutations',inputSchema:{type:'object',properties:{}}},
 {name:'create_game_candidate',description:'Create a new original WebGL2 game via existing seven engines. Sandbox only, candidate not published. Requires explicit local opt-in.',inputSchema:{type:'object',properties:{
  slug:{type:'string',pattern:'^[a-z][a-z0-9-]{2,35}$'},
  genre:{type:'string',maxLength:160},
  startLocation:{type:'string',maxLength:160},
  world_laws:{type:'array',items:{type:'string'},minItems:1,maxItems:6},
  randomSeed:{type:'integer',minimum:1,maximum:2147483647}
 },required:['slug']}},
 {name:'verify_game_candidate',description:'Play all six scenes with real desktop keyboard and check mobile two-touch in Chromium. Does not cheat or mutate game state.',inputSchema:{type:'object',properties:{slug:{type:'string'}},required:['slug']}}
];
function response(id,result,error){
 const data={jsonrpc:'2.0',id};
 if(error)data.error={code:-32000,message:String(error.message||error)};
 else data.result=result;
 process.stdout.write(JSON.stringify(data)+'\n');
}
function run(cmd,args,env={}){
 const r=spawnSync(process.execPath,[cmd,...args],{cwd:root,env:{...process.env,...env},encoding:'utf8',timeout:180000,maxBuffer:2*1024*1024});
 if(r.error)throw r.error;
 if(r.status!==0)throw Error((r.stderr||r.stdout||'Process failed').slice(-3000));
 return r.stdout.trim().slice(-3000);
}
function list(){
 const dir=path.join(root,'meta-games-worlds');
 if(!fs.existsSync(dir))return [];
 return fs.readdirSync(dir,{withFileTypes:true}).filter(x=>x.isDirectory()&&x.name.startsWith('generated-'))
 .filter(x=>fs.existsSync(path.join(dir,x.name,'manifest.json')))
 .map(x=>({id:x.name,entry:'meta-games-worlds/'+x.name+'/index.html'})).slice(0,100);
}
function call(name,args={}){
 if(name==='list_game_candidates')return list();
 if(!/^[a-z][a-z0-9-]{2,35}$/.test(args.slug||''))throw Error('Invalid slug');
 if(name==='create_game_candidate'){
  if(process.env.META_GAMES_ALLOW_GENERATION!=='1')throw Error('Creation disabled. Explicitly set META_GAMES_ALLOW_GENERATION=1 on a trusted local agent.');
  const allowed=['slug','genre','startLocation','world_laws','randomSeed'];
  if(Object.keys(args).some(x=>!allowed.includes(x)))throw Error('Unknown argument');
  const card={};for(const k of allowed.slice(1))if(args[k]!==undefined)card[k]=args[k];
  const out=run('scripts/lab/agent-game-candidate.cjs',[],{GAME_SLUG:args.slug,GAME_REQUEST_JSON:JSON.stringify(card)});
  return {candidate:JSON.parse(out),status:'unpublished_pending_real_input_verification'};
 }
 if(name==='verify_game_candidate'){
  const out=run('scripts/lab/verify-agent-game.mjs',[],{GAME_SLUG:args.slug});
  return {verified:true,realInput:true,output:out};
 }
 throw Error('Unknown tool');
}
for await(const line of readline.createInterface({input:process.stdin,crlfDelay:Infinity})){
 if(!line.trim())continue;
 let msg;try{msg=JSON.parse(line)}catch{continue}
 if(msg.id===undefined)continue;
 try{
  if(msg.method==='initialize')response(msg.id,{protocolVersion:'2025-03-26',capabilities:{tools:{}},serverInfo:{name:'meta-games-local-factory',version:'1.0.0'}});
  else if(msg.method==='ping')response(msg.id,{});
  else if(msg.method==='tools/list')response(msg.id,{tools});
  else if(msg.method==='tools/call')response(msg.id,{content:[{type:'text',text:JSON.stringify(call(msg.params?.name,msg.params?.arguments||{}))}]});
  else response(msg.id,null,new Error('Unsupported method'));
 }catch(e){response(msg.id,null,e)}
}

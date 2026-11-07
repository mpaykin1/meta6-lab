// Check actual MCP stdio framing, safe default, and real candidate verification.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import readline from 'node:readline';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const proc=spawn(process.execPath,['scripts/lab/agent-factory-mcp.mjs'],{cwd:root,env:{...process.env,META_GAMES_ALLOW_GENERATION:'0'},stdio:['pipe','pipe','inherit']});
const pending=new Map();let seq=0;
const lines=readline.createInterface({input:proc.stdout});
lines.on('line',line=>{try{const m=JSON.parse(line);const p=pending.get(m.id);if(p){pending.delete(m.id);p(m)}}catch(e){console.error(e)}});
function request(method,params){
 const id=++seq;
 return new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>{pending.delete(id);reject(Error('MCP timeout '+method))},150000);
  pending.set(id,m=>{clearTimeout(timeout);resolve(m)});
  proc.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');
 });
}
try{
 const init=await request('initialize',{protocolVersion:'2025-03-26',capabilities:{},clientInfo:{name:'lab-check',version:'1'}});
 assert.equal(init.result.serverInfo.name,'meta-games-local-factory');
 const list=await request('tools/list');assert.equal(list.result.tools.length,3);
 const games=await request('tools/call',{name:'list_game_candidates',arguments:{}});
 const candidates=JSON.parse(games.result.content[0].text);
 assert.ok(candidates.some(x=>x.id==='generated-confluence-studio'));
 const denied=await request('tools/call',{name:'create_game_candidate',arguments:{slug:'no-write-smoke'}});
 assert.ok(denied.error?.message.includes('disabled'),'Public/unauthorized creation must fail closed');
 const verified=await request('tools/call',{name:'verify_game_candidate',arguments:{slug:'confluence-studio'}});
 assert.equal(JSON.parse(verified.result.content[0].text).verified,true);
 console.log('MCP_REAL_PROTOCOL_PASS list + denied anonymous write + verified desktop/mobile gameplay');
}finally{
 proc.stdin.end();proc.kill();
}

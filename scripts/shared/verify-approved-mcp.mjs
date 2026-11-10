import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import readline from 'node:readline';
import {approvedComponents,searchApproved,inspectApproved,getApprovedSource} from '../../shared/approved/search.mjs';
const components=approvedComponents();
assert.equal(components.length,10);
for(const x of components){
 assert.ok(x.bytes>0&&x.lines>0);
 assert.ok(inspectApproved(x.id,1,3).lines.length>0);
}
assert.throws(()=>inspectApproved('../AGENTS.md'),/approved/);
assert.ok(Array.isArray(searchApproved('window')));
const proc=spawn(process.execPath,['shared/approved/mcp.mjs'],{stdio:['pipe','pipe','inherit']});
let id=0;const pending=new Map();
readline.createInterface({input:proc.stdout}).on('line',line=>{
 try{const m=JSON.parse(line),cb=pending.get(m.id);if(cb){pending.delete(m.id);cb(m)}}catch(e){console.error(e)}
});
function ask(method,params){
 const n=++id;return new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>{pending.delete(n);reject(Error('MCP timeout'))},10000);
  pending.set(n,m=>{clearTimeout(timer);resolve(m)});
  proc.stdin.write(JSON.stringify({jsonrpc:'2.0',id:n,method,params})+'\n');
 });
}
try{
 assert.equal((await ask('initialize',{})).result.serverInfo.name,'meta-games-approved-source');
 assert.equal((await ask('tools/list')).result.tools.length,9);
 const list=await ask('tools/call',{name:'list_approved_components',arguments:{}});
 assert.equal(JSON.parse(list.result.content[0].text).length,10);
 const denied=await ask('tools/call',{name:'inspect_approved_component',arguments:{id:'../AGENTS.md'}});
 assert.ok(denied.error);
 const result=await ask('tools/call',{name:'search_approved_code',arguments:{query:'window'}});
 assert.ok(result.result);
 const full=await ask('tools/call',{name:'get_approved_component_source',arguments:{id:'observer-buildings'}});
 const module=JSON.parse(full.result.content[0].text);
 assert.equal(module.code,getApprovedSource('observer-buildings').code);
 assert.equal(module.source.git_blob_sha,components.find(x=>x.id==='observer-buildings').source.git_blob_sha);
 assert.ok(module.code.includes('ObserverBuildingAssets'));
 const deniedFull=await ask('tools/call',{name:'get_approved_component_source',arguments:{id:'../../AGENTS.md'}});
 assert.ok(deniedFull.error);
 console.log('APPROVED_SOURCE_MCP_PASS ten verified originals; four tools; no unauthorized sources');
}finally{proc.stdin.end();proc.kill()}

// Exercises the library's real MCP protocol and provenance-safe search.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import readline from 'node:readline';
import {library} from '../../shared/library-search.mjs';
const donors=library.donors();
assert.ok(donors.length>=5,'Five source games required');
const files=library.scan();
assert.ok(files.length>=28,'Reference source catalog unexpectedly empty');
const search=library.search('shader');
assert.ok(Array.isArray(search));
const code=library.searchSource('function');
assert.ok(Array.isArray(code));
const duplicates=library.duplicateSources();
assert.ok(Array.isArray(duplicates));
assert.throws(()=>library.inspect('../AGENTS.md'),/not|allow|source|path|denied|invalid/i);
const proc=spawn(process.execPath,['shared/library-search.mjs','mcp'],{stdio:['pipe','pipe','inherit']});
const pending=new Map();let seq=0;
readline.createInterface({input:proc.stdout}).on('line',line=>{try{const msg=JSON.parse(line);const fn=pending.get(msg.id);if(fn){pending.delete(msg.id);fn(msg)}}catch(e){console.error(e)}});
function ask(method,params){
 const id=++seq;return new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>{pending.delete(id);reject(Error('MCP timeout'))},15000);
  pending.set(id,msg=>{clearTimeout(timeout);resolve(msg)});
  proc.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');
 });
}
try{
 const init=await ask('initialize',{});assert.equal(init.result.serverInfo.name,'meta-games-source-library');
 const tools=await ask('tools/list');assert.equal(tools.result.tools.length,6);
 for(const name of ['list_reference_games','search_reusable_code','search_source_content','find_duplicate_sources','inspect_source_lines','inspect_dependencies']){
  assert.ok(tools.result.tools.some(x=>x.name===name),name);
 }
 const found=await ask('tools/call',{name:'search_source_content',arguments:{query:'function',limit:3}});
 assert.ok(JSON.parse(found.result.content[0].text).length>0);
 const denied=await ask('tools/call',{name:'inspect_source_lines',arguments:{path:'../AGENTS.md'}});
 assert.ok(denied.error);
 console.log('LIBRARY_MCP_PASS six tools, content search, duplicate scan, safe source isolation, '+files.length+' files');
}finally{proc.stdin.end();proc.kill()}

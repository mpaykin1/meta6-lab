// Read-only local MCP: only source bytes already approved by the owner.
import readline from 'node:readline';
import {approvedComponents,searchApproved,inspectApproved,getApprovedSource} from './search.mjs';
const defs=[
 {name:'list_approved_components',description:'Exact original source modules with verified upstream Git blob',inputSchema:{type:'object',properties:{}}},
 {name:'search_approved_code',description:'Search approved code and return small matching line snippets',inputSchema:{type:'object',properties:{query:{type:'string'},limit:{type:'integer'}},required:['query']}},
 {name:'inspect_approved_component',description:'Read a small window of original approved code',inputSchema:{type:'object',properties:{id:{type:'string'},start:{type:'integer'},count:{type:'integer'}},required:['id']}},
 {name:'get_approved_component_source',description:'Get complete original, hash-checked JavaScript source for deliberate integration in a sandbox game; prefer search for discovery',inputSchema:{type:'object',properties:{id:{type:'string'}},required:['id']}}
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
  if(msg.method==='initialize')answer(msg.id,{protocolVersion:'2025-03-26',capabilities:{tools:{}},serverInfo:{name:'meta-games-approved-source',version:'1.0.0'}});
  else if(msg.method==='ping')answer(msg.id,{});
  else if(msg.method==='tools/list')answer(msg.id,{tools:defs});
  else if(msg.method==='tools/call'){
   const {name,arguments:args={}}=msg.params||{};
   const value=name==='list_approved_components'?approvedComponents():
    name==='search_approved_code'?searchApproved(args.query,args.limit):
    name==='inspect_approved_component'?inspectApproved(args.id,args.start,args.count):
    name==='get_approved_component_source'?getApprovedSource(args.id):
    (()=>{throw Error('Unknown tool')})();
   answer(msg.id,{content:[{type:'text',text:JSON.stringify(value)}]});
  }else answer(msg.id,null,new Error('Unsupported method'));
 }catch(e){answer(msg.id,null,e)}
}

// Read-only local MCP: only source bytes already approved by the owner.
import readline from 'node:readline';
import {readFileSync} from 'node:fs';
import {approvedComponents,searchApproved,inspectApproved,getApprovedSource} from './search.mjs';

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

const defs=[
 {name:'list_approved_components',description:'Exact original source modules with verified upstream Git blob',inputSchema:{type:'object',properties:{}}},
 {name:'search_approved_code',description:'Search approved code and return small matching line snippets',inputSchema:{type:'object',properties:{query:{type:'string'},limit:{type:'integer'}},required:['query']}},
 {name:'inspect_approved_component',description:'Read a small window of original approved code',inputSchema:{type:'object',properties:{id:{type:'string'},start:{type:'integer'},count:{type:'integer'}},required:['id']}},
 {name:'get_approved_component_source',description:'Get complete original, hash-checked JavaScript source for deliberate integration in a sandbox game; prefer search for discovery',inputSchema:{type:'object',properties:{id:{type:'string'}},required:['id']}},
 {name:'list_games',description:'List all self-hosted games directly from the META GAMES homepage',inputSchema:{type:'object',properties:{}}}
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
   const value=name==='list_approved_components'?approvedComponents():
    name==='search_approved_code'?searchApproved(args.query,args.limit):
    name==='inspect_approved_component'?inspectApproved(args.id,args.start,args.count):
    name==='get_approved_component_source'?getApprovedSource(args.id):
    name==='list_games'?listGames():
    (()=>{throw Error('Unknown tool')})();
   answer(msg.id,{content:[{type:'text',text:JSON.stringify(value)}]});
  }else answer(msg.id,null,new Error('Unsupported method'));
 }catch(e){answer(msg.id,null,e)}
}

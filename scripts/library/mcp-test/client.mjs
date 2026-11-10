import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {execFileSync} from 'node:child_process';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const transport=new StdioClientTransport({command:process.execPath,
 args:[path.join(root,'shared/approved/mcp.mjs')],cwd:root,stderr:'pipe'});
const client=new Client({name:'meta-games-library-integration',version:'1.0.0'});
function result(value){
 assert.ok(!value.isError,'MCP tool reported an error: '+JSON.stringify(value));
 const body=value.content?.find(x=>x.type==='text')?.text;
 assert.ok(body,'Tool returned no text');
 return JSON.parse(body);
}
async function call(name,args){return result(await client.callTool({name,arguments:args}));}
await client.connect(transport);
try{
 const advertised=(await client.listTools()).tools.map(x=>x.name);
 for(const name of ['search_solutions','get_solution','search_assets','get_asset','assemble_game'])
  assert.ok(advertised.includes(name),'Tool not discoverable: '+name);
 const camera=await call('search_solutions',{query:'camera',limit:10});
 const weather=await call('search_solutions',{query:'weather',limit:10});
 assert.ok(camera.solutions.length>0,'No camera systems found');
 assert.ok(weather.solutions.length>0,'No weather systems found');
 const solution=await call('get_solution',{id:camera.solutions[0].id});
 assert.ok(solution.systems.length>0&&solution.systems.every(x=>x.code.length>0),'Missing exact source');
 const assets=await call('search_assets',{query:'png',limit:10});
 assert.ok(assets.assets.length>=2,'Need two real original PNG assets');
 const asset=await call('get_asset',{id:assets.assets[0].id});
 assert.ok(asset.sha256&&asset.url.startsWith('https://github.com/mpaykin1/meta6-lab/blob/'),'Missing asset provenance');
 const controls=await call('search_solutions',{query:'controls',limit:10});
 assert.ok(controls.solutions.length>0,'No controls systems found');
 const ids=[camera.solutions[0].id,weather.solutions[0].id,controls.solutions[0].id];
 assert.equal(new Set(ids).size,3,'Three distinct subsystems required');
 const before=execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
 const game=await call('assemble_game',{solution_ids:ids,asset_ids:assets.assets.slice(0,2).map(a=>a.id),
  title:'MCP Library Smoke Game'});
 assert.match(game.branch,/^mcp-assemble\//);
 assert.match(game.path,/^games\/[\w-]+\/index\.html$/);
 assert.equal(game.status,'unverified_scaffold','Unverified code must not be reported as a validated game');
 assert.equal(execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),before,'assemble_game modified HEAD');
 execFileSync('git',['-C',root,'cat-file','-e',game.commit+':'+game.path]);
 const actualFiles=execFileSync('git',['-C',root,'ls-tree','-r','--name-only',game.commit],{encoding:'utf8'});
 assert.ok(actualFiles.split('\n').filter(x=>x.startsWith(game.path.replace(/index\.html$/,'systems/'))).length>=3,
  'Assembly did not copy the requested original systems');
 // Verify the exact newly assembled files, not merely the git tree or a fake test page.
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'meta-mcp-assembled-'));
 try{
  const folder=path.posix.dirname(game.path)+'/';
  const relativeFiles=actualFiles.split('\n').filter(file=>file.startsWith(folder));
  assert.ok(relativeFiles.length>=6,'Missing assembled game files');
  for(const name of relativeFiles){
   assert.ok(!name.split('/').includes('..'),'Unsafe assembled filename');
   const destination=path.join(temp,name);
   fs.mkdirSync(path.dirname(destination),{recursive:true});
   fs.writeFileSync(destination,execFileSync('git',['-C',root,'show',game.commit+':'+name]));
  }
  const browser=await chromium.launch({headless:true});
  try{
   const page=await browser.newPage({viewport:{width:960,height:540}});
   const browserErrors=[];
   page.on('pageerror',error=>browserErrors.push(error.message));
   page.on('console',message=>{
    if(message.type()==='error')browserErrors.push(message.text());
   });
   page.on('requestfailed',request=>browserErrors.push(request.url()+' '+request.failure()?.errorText));
   await page.goto(pathToFileURL(path.join(temp,game.path)).href,{waitUntil:'load'});
   await page.waitForTimeout(1000);
   const image=await page.evaluate(()=>{
    return [...document.querySelectorAll('canvas')].some(canvas=>{
     if(canvas.width<128||canvas.height<128)return false;
     try{
      const blank=document.createElement('canvas');
      blank.width=canvas.width;
      blank.height=canvas.height;
      return canvas.toDataURL()!==blank.toDataURL();
     }catch{return false;}
    });
   });
   assert.deepEqual(browserErrors,[],'MCP assembled game has browser errors');
   assert.ok(image,'MCP assembled game has an empty canvas');
   await page.close();
  }finally{await browser.close();}
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
 console.log('MCP assembled Chromium PASS: 3 systems, 2 assets, rendered canvas '+game.commit);
}finally{await client.close();}

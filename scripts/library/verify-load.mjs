import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const {chromium}=createRequire(new URL('./mcp-test/package.json',import.meta.url))('playwright');
import {rangeBytes,ROOT as DEFAULT_ROOT} from './machine.mjs';
import {verifyCatalog} from './verify-catalog.mjs';

const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const rootArg=process.argv.indexOf('--root');
const ROOT=rootArg<0?DEFAULT_ROOT:path.resolve(process.argv[rootArg+1]);
const filename=path.join(ROOT,'shared/library/catalog-solutions.json');
const data=JSON.parse(fs.readFileSync(filename,'utf8'));
const storedResults=JSON.stringify(data.solutions.map(s=>[s.id,s.load_ok,s.load_error,s.load_evidence]));
const known=new Map(data.solutions.map(s=>[s.id,s]));
const evidence='chromium-original-source-load-v1';
const modelDir=path.join(ROOT,'scripts/library/mcp-test/node_modules/three');
const contains=(root,p)=>{const rel=path.relative(root,p);return rel!==''&&rel!=='..'&&!rel.startsWith('..'+path.sep)&&!path.isAbsolute(rel);};
const mime=p=>({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.glb':'model/gltf-binary','.gltf':'model/gltf+json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.bin':'application/octet-stream'})[path.extname(p).toLowerCase()]||'application/octet-stream';
function original(s){
 const chunks=[];
 for(const r of s.lines){
  const filepath=path.resolve(ROOT,r.source_path);
  if(!contains(ROOT,filepath)||fs.lstatSync(filepath).isSymbolicLink())throw Error('Unsafe source');
  chunks.push(rangeBytes(fs.readFileSync(filepath,'utf8'),r.start,r.end));
 }
 const code=Buffer.concat(chunks);
 if(hash(code)!==s.sha256)throw Error('Source hash mismatch: '+s.id);
 return code.toString('utf8');
}
function ordered(s){
 const seen=new Set(),out=[];
 function visit(row){
  if(seen.has(row.id))return;
  seen.add(row.id);
  for(const id of row.depends_on||[]){
   const dep=known.get(id);
   if(!dep)throw Error('Missing dependency '+id);
   visit(dep);
  }
  out.push(row);
 }
 visit(s);
 return out;
}
const server=createServer((request,response)=>{
 try{
  const url=new URL(request.url,'http://127.0.0.1');
  if(url.pathname==='/'){
   response.writeHead(200,{'content-type':'text/html; charset=utf-8'});
   response.end('<!doctype html><html><head><link rel="icon" href="data:,"><script type="importmap">{"imports":{"three":"/three/build/three.module.js"}}</script></head><body><canvas id="game" width="640" height="360"></canvas></body></html>');
   return;
  }
  const mount=url.pathname.startsWith('/three/')?modelDir:ROOT;
  const rel=decodeURIComponent(url.pathname.replace(/^\/three\//,'').replace(/^\/files\//,'').slice(url.pathname.startsWith('/three/')?0:0));
  const full=path.resolve(mount,rel);
  if(!contains(mount,full)||!fs.existsSync(full)||!fs.statSync(full).isFile())throw Error('Invalid file');
  response.writeHead(200,{'content-type':mime(full),'cache-control':'no-store'});
  fs.createReadStream(full).pipe(response);
 }catch{response.writeHead(404).end('Not found')}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const settings={headless:true};
if(!fs.existsSync(chromium.executablePath()))settings.channel='chrome';
const browser=await chromium.launch(settings);
async function probeSolution(s){
 const context=await browser.newContext();
 await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
 const page=await context.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 try{
  await page.goto(origin+'/');
  await page.evaluate(()=>{
   window.__metaProbe={draw:0,audio:0};
   for(const [owner,names] of [
    [window.CanvasRenderingContext2D,['fillRect','strokeRect','fill','stroke','drawImage','fillText','strokeText','putImageData']],
    [window.WebGLRenderingContext,['drawArrays','drawElements','clear']],
    [window.WebGL2RenderingContext,['drawArraysInstanced','drawElementsInstanced']]]){
    if(!owner)continue;
    for(const name of names){
     const original=owner.prototype[name];
     if(typeof original!=='function')continue;
     owner.prototype[name]=function(...args){window.__metaProbe.draw++;return Reflect.apply(original,this,args)};
    }
   }
   for(const key of ['AudioContext','webkitAudioContext']){
    const Audio=window[key];if(!Audio)continue;
    window[key]=class extends Audio{constructor(...args){super(...args);window.__metaProbe.audio++}};
   }
  });
  for(const id of s.how_to_connect?.dom_ids||[])await page.evaluate(id=>{
   if(!document.getElementById(id)){const div=document.createElement('div');div.id=id;document.body.append(div)}
  },id);
  const code=ordered(s);
  for(const dep of code)await page.addScriptTag({content:original(dep)});
  if(errors.length)throw Error(errors[0]);
  const name=s.how_to_connect?.entrypoint;
  if(typeof name!=='string'||!/^[\w$]+$/.test(name))throw Error('No callable entrypoint');
  const result=await page.evaluate(async name=>{
   const handler=(0,eval)(name);
   if(typeof handler!=='function')return {callable:false};
   const out=handler();
   const value=out&&typeof out.then==='function'?await Promise.race([out,new Promise((_,reject)=>setTimeout(()=>reject(Error('entrypoint timeout')),1500))]):out;
   return {callable:true,hasValue:value!==undefined};
  },name);
  await page.waitForTimeout(80);
  const status=await page.evaluate(()=>({draw:window.__metaProbe.draw,audio:window.__metaProbe.audio,storage:localStorage.length}));
  if(errors.length)throw Error(errors[0]);
  if(!result.callable)throw Error('Entrypoint is not a callable browser function');
  const used=s.system==='audio'?status.audio>0:
    ['saves','lore'].includes(s.system)?result.hasValue||status.storage>0:status.draw>0;
  if(!used)throw Error('No observable '+(s.system==='audio'?'AudioContext':(['saves','lore'].includes(s.system)?'data':'canvas rendering'))+' from entrypoint');
  return {ok:true,error:null};
 }catch(e){return {ok:false,error:String(e.message||e).slice(0,220)}}
 finally{await context.close()}
}
async function probeModel(item,page){
 try{
  const pathname='/files/'+item.source_path.split('/').map(encodeURIComponent).join('/');
  return await page.evaluate(async pathname=>{
   const {GLTFLoader}=await import('/three/examples/jsm/loaders/GLTFLoader.js');
   const loader=new GLTFLoader();
   return await Promise.race([
    new Promise((resolve,reject)=>loader.load(pathname,
     gltf=>resolve({ok:!!gltf.scene,error:null}),undefined,e=>reject(e))),
    new Promise((_,reject)=>setTimeout(()=>reject(Error('GLTFLoader timeout')),7000))
   ]);
  },pathname);
 }catch(e){return {ok:false,error:String(e.message||e).slice(0,220)}}
}
const outcomes=[];
try{
 for(const s of data.solutions){
  const item=await probeSolution(s);
  s.load_ok=item.ok;
  s.load_error=item.error;
  s.load_evidence=item.ok?{chromium_run:evidence,sha256:s.sha256}:null;
  outcomes.push({game:s.game,id:s.id,...item});
  console.log((item.ok?'OK ':'FAIL ')+s.id+(item.ok?'':' — '+item.error));
 }
 let models=[];
 const index=JSON.parse(fs.readFileSync(path.join(ROOT,'shared/library/index.json'),'utf8'));
 const seen=new Set();
 const files=index.entries.filter(x=>x.source_path?.toLowerCase().endsWith('.glb')&&x.kind==='model'&&!seen.has(x.sha256)&&seen.add(x.sha256));
 if(files.length){
  const page=await browser.newPage();
  await page.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
  await page.goto(origin+'/');
  for(const asset of files){
   const result=await probeModel(asset,page);
   models.push({id:asset.id,path:asset.source_path,...result});
   console.log((result.ok?'GLB OK ':'GLB FAIL ')+asset.source_path+' '+(result.error||''));
  }
  await page.close();
 }
 data.model_load=models;
 data.load_evidence_type=evidence;
 if(process.argv.includes('--verify')&&storedResults!==JSON.stringify(data.solutions.map(s=>[s.id,s.load_ok,s.load_error,s.load_evidence])))throw Error('Recorded load_ok or evidence disagrees with real Chromium execution');
 if(process.argv.includes('--write'))fs.writeFileSync(filename,JSON.stringify(data,null,2)+'\n');
 verifyCatalog(ROOT);
 const byGame=new Map();
 for(const e of outcomes){
  const stats=byGame.get(e.game)||{total:0,ok:0,failed:0,reasons:[]};
  stats.total++;if(e.ok)stats.ok++;else{stats.failed++;stats.reasons.push(e.id+': '+e.error)}
  byGame.set(e.game,stats);
 }
 for(const [game,counts] of byGame)console.log('GAME '+game+' N='+counts.total+' M='+counts.ok+' K='+counts.failed);
 console.log('MODELS total='+models.length+' ok='+models.filter(m=>m.ok).length+' failed='+models.filter(m=>!m.ok).length);
 if(process.argv.includes('--require-all')&&(outcomes.some(x=>!x.ok)||models.some(x=>!x.ok)))throw Error('L3 incomplete: not every original subsystem/model loads and has a real effect');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve))}

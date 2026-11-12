import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const sourceFile='games/veil-terraces/index.html';
const systemFile='shared/library/systems/veil-terraces-camera.mjs';
const demoFile='shared/library/systems/veil-terraces-camera-preview.html';
const blobSHA='22f3cd154cd247e3fcc6977c8334e04417a2faf7';
const chosen=[25,29,30,31,32];
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const bad=s=>{throw Error('VEIL CAMERA INVALID: '+s);};

export function verifyCameraProvenance(source,system){
 const raw=Buffer.from(source,'utf8');
 const blob=crypto.createHash('sha1').update(Buffer.from('blob '+raw.length+'\0')).update(raw).digest('hex');
 if(blob!==blobSHA)bad('source blob drift '+blob);
 const original=chosen.map(n=>source.split('\n')[n-1]).join('\n')+'\nexport {perspective,lookAt,multiply,model};\n';
 if(original!==system)bad('source declarations edited or truncated');
 return blob;
}

function testMutations(source,system){
 let caught=0;
 for(const mutation of [
  system.replace(/^function multiply\(.*$/m,'function multiply(a,b){return a}'),
  system.replace('out[0]=f/aspect','out[0]=0'),
  system.replace('function lookAt(eye,target)','function lookAt(eye,subject)')
 ]){
   if(mutation===system)bad('mutation not applied');
   try{verifyCameraProvenance(source,mutation);}catch(e){
     if(!String(e).includes('VEIL CAMERA INVALID:'))throw e;
     caught++;continue;
   }
   bad('mutation escaped');
 }
 return caught;
}

async function chromeTest(directory){
 const names={'/preview.html':demoFile,'/veil-terraces-camera.mjs':systemFile};
 const server=http.createServer((req,res)=>{
   const key=new URL(req.url,'http://localhost').pathname;
   if(!Object.hasOwn(names,key)){res.writeHead(404);res.end();return;}
   res.writeHead(200,{'Content-Type':key.endsWith('.mjs')?'text/javascript':'text/html'});
   res.end(fs.readFileSync(path.join(directory,names[key])));
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const chromePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].find(fs.existsSync);
 if(!chromePath){server.close();bad('Chromium executable unavailable');}
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'veil-camera-'));
 const chrome=spawn(chromePath,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-first-run','--remote-allow-origins=*','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
 let socket;
 try {
   const active=path.join(profile,'DevToolsActivePort');
   for(let i=0;i<150&&!fs.existsSync(active);i++)await delay(100);
   if(!fs.existsSync(active))bad('Chromium failed to start');
   const port=Number(fs.readFileSync(active,'utf8').split('\n')[0]);
   const targets=await(await fetch('http://127.0.0.1:'+port+'/json')).json();
   const page=targets.find(t=>t.type==='page');
   if(!page?.webSocketDebuggerUrl)bad('no Chromium page');
   socket=new WebSocket(page.webSocketDebuggerUrl);
   await new Promise((ok,no)=>{socket.addEventListener('open',ok,{once:true});socket.addEventListener('error',no,{once:true});});
   const requests=new Map(),exceptions=[];let id=0;
   socket.addEventListener('message',e=>{
     const v=JSON.parse(e.data);
     if(v.method==='Runtime.exceptionThrown')exceptions.push(v.params.exceptionDetails.text);
     const p=requests.get(v.id);if(p){requests.delete(v.id);v.error?p.no(Error(JSON.stringify(v.error))):p.ok(v.result);}
   });
   const send=(method,params={})=>new Promise((ok,no)=>{const n=++id;requests.set(n,{ok,no});socket.send(JSON.stringify({id:n,method,params}));});
   await send('Page.enable');await send('Runtime.enable');
   await send('Page.navigate',{url:'http://127.0.0.1:'+server.address().port+'/preview.html'});
   async function measure(){
     const expr="(()=>{let c=document.querySelector('canvas');if(!c||!window.__cameraProbe)return null;const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let bright=0,hash=2166136261;for(let i=0;i<d.length;i+=4){if(d[i]+d[i+1]+d[i+2]>350)bright++;hash=Math.imul(hash^d[i],16777619);hash=Math.imul(hash^d[i+1],16777619);hash=Math.imul(hash^d[i+2],16777619);}return {bright,hash:hash>>>0,yaw:window.__cameraProbe.yaw,frames:window.__cameraProbe.frames};})()";
     const v=await send('Runtime.evaluate',{expression:expr,returnByValue:true});
     if(v.exceptionDetails)bad('Chrome JS exception '+v.exceptionDetails.text);
     return v.result?.value;
   }
   let before;
   for(let i=0;i<150;i++){before=await measure();if(before?.bright>30)break;await delay(100);}
   if(!before||before.bright<=30)bad('blank canvas');
   await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39,nativeVirtualKeyCode:39});
   await send('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39,nativeVirtualKeyCode:39});
   await delay(150);
   const after=await measure();
   if(!after||after.yaw===before.yaw||after.hash===before.hash||after.frames<=before.frames||after.bright<=30)bad('real key input did not change visible canvas');
   if(exceptions.length)bad('Chromium JS exceptions: '+exceptions.join(';'));
   return {before,after};
 } finally {
   if(socket)socket.close();
   chrome.kill('SIGKILL');
   server.closeAllConnections();
   await new Promise(resolve=>server.close(resolve));
   fs.rmSync(profile,{recursive:true,force:true});
 }
}

export async function verifyVeilCamera(directory=root){
 const source=fs.readFileSync(path.join(directory,sourceFile),'utf8');
 const system=fs.readFileSync(path.join(directory,systemFile),'utf8');
 const demo=fs.readFileSync(path.join(directory,demoFile),'utf8');
 const sha=verifyCameraProvenance(source,system),mutations=testMutations(source,system);
 if(!demo.includes("from './veil-terraces-camera.mjs'")||!demo.includes("addEventListener('keydown'"))bad('missing keyboard-driven demo');
 const {before,after}=await chromeTest(directory);
 console.log('VEIL CAMERA PASS; Chromium canvas + real input; 3/3 mutations; blob '+sha+'; bright '+before.bright+' -> '+after.bright);
 return {sha,mutations,chromium:true};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{await verifyVeilCamera();}catch(e){console.error(e.stack||e);process.exitCode=1;}
}

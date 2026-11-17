// Verify real game rendering in system Chrome; no package downloads or Playwright.
import {existsSync,readFileSync,writeFileSync,unlinkSync,mkdtempSync,rmSync} from 'node:fs';
import {join,dirname,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {inflateSync} from 'node:zlib';

const entry=resolve(process.argv[2]||'');
const chrome=[process.env.CHROME_BIN,'/usr/bin/google-chrome','/usr/bin/chromium','/usr/bin/chromium-browser'].find(c=>c&&existsSync(c));
const result={ok:false,errors:[],facts:{}},tmp=mkdtempSync(join(tmpdir(),'cutout-browser-'));
const probe=join(dirname(entry),'.cutout-probe-'+process.pid+'.html');
function countColors(bytes){
 if(bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('Invalid screenshot');
 let width=0,height=0,channels=4,off=8;const chunks=[];
 while(off+12<=bytes.length){
  const n=bytes.readUInt32BE(off),tag=bytes.toString('ascii',off+4,off+8);
  const data=bytes.subarray(off+8,off+8+n);off+=n+12;
  if(tag==='IHDR'){width=data.readUInt32BE(0);height=data.readUInt32BE(4);
   channels=data[9]===2?3:data[9]===6?4:0;
   if(data[8]!==8||!channels)throw Error('Unsupported screenshot format');}
  if(tag==='IDAT')chunks.push(data);if(tag==='IEND')break;
 }
 const z=inflateSync(Buffer.concat(chunks)),s=width*channels,p=new Uint8Array(height*s);let k=0;
 for(let y=0;y<height;y++){
  const filter=z[k++],r=y*s;
  for(let x=0;x<s;x++){
   const a=x>=channels?p[r+x-channels]:0,b=y?p[r+x-s]:0,c=y&&x>=channels?p[r+x-s-channels]:0;
   let val=z[k++];
   if(filter===1)val+=a;
   else if(filter===2)val+=b;
   else if(filter===3)val+=Math.floor((a+b)/2);
   else if(filter===4){const n=a+b-c,aa=Math.abs(n-a),bb=Math.abs(n-b),cc=Math.abs(n-c);
    val+=aa<=bb&&aa<=cc?a:bb<=cc?b:c;}
   else if(filter!==0)throw Error('Invalid PNG filter');
   p[r+x]=val&255;
  }
 }
 const colors=new Set();
 for(let i=0;i<p.length;i+=channels*31)
  colors.add(((p[i]>>4)<<8)|((p[i+1]>>4)<<4)|(p[i+2]>>4));
 return {width,height,colors:colors.size};
}
try{
 if(!existsSync(entry)||!chrome)throw Error('Missing game index.html or system Chrome');
 const page=[
  '<!doctype html><html><head><meta charset="utf-8"><style>',
  'html,body,iframe{height:100%;width:100%;padding:0;margin:0;border:0;overflow:hidden;background:#141b21;}',
  '</style></head><body><iframe src="./index.html"></iframe><script>',
  'let started=false;setInterval(()=>{let child;',
  'try{child=document.querySelector("iframe").contentWindow;}catch(e){document.body.dataset.error=String(e);return;}',
  'const items=child.__PACK__?.items,objects=child.__PACK_PROBE__?.assets;',
  'const bird=objects?.crow,beast=objects?.stalker;',
  'if(!started&&items?.length===26&&bird?.children?.length>=2&&beast?.children?.length>=2){',
  'started=true;document.body.dataset.loaded="26";',
  'document.body.dataset.crow=String(bird.children.length);',
  'document.body.dataset.beast=String(beast.children.length);',
  'const before=child.__STATE__?.().x;let frames=0;',
  'const key=()=>new KeyboardEvent("keyup",{key:"ArrowRight",bubbles:true});',
  'child.dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowRight",bubbles:true}));',
  'function verifyMove(){const after=child.__STATE__?.().x;',
  'if(Number.isFinite(before)&&Number.isFinite(after)&&after>before+.05){',
  'child.dispatchEvent(key());document.body.dataset.moved="yes";return;}',
  'if(++frames>45){child.dispatchEvent(key());document.body.dataset.moved="no";return;}',
  'child.requestAnimationFrame(verifyMove);}',
  'child.requestAnimationFrame(verifyMove);',
  '}},80);',
  '</script></body></html>'
 ].join('');
 writeFileSync(probe,page);
 const screenshot=join(tmp,'screenshot.png');
 const proc=spawnSync(chrome,[
  '--headless=new','--no-sandbox','--disable-dev-shm-usage',
  '--disable-web-security','--allow-file-access-from-files',
  '--enable-webgl','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader',
  '--no-first-run','--no-default-browser-check','--hide-scrollbars','--window-size=960,540',
  '--user-data-dir='+join(tmp,'profile'),
  '--virtual-time-budget=7000','--screenshot='+screenshot,'--dump-dom',pathToFileURL(probe).href
 ],{encoding:'utf8',timeout:65000,maxBuffer:4*1024*1024});
 if(proc.error)throw proc.error;
 const html=proc.stdout??'';
 const attr=(name)=>new RegExp('data-'+name+'="([^"]*)"').exec(html)?.[1];
 result.facts={loaded:Number(attr('loaded')||0),crowParts:Number(attr('crow')||0),
  beastParts:Number(attr('beast')||0),moved:attr('moved')||'unknown',exit:proc.status};
 if(existsSync(screenshot))Object.assign(result.facts,countColors(readFileSync(screenshot)));
 if(proc.status!==0)result.errors.push('Chrome nonzero exit: '+String(proc.stderr||'').slice(-600));
 if(result.facts.loaded!==26)result.errors.push('26 original-art assets did not initialize');
 if(result.facts.crowParts<2||result.facts.beastParts<2)result.errors.push('Owners PNG/GIF did not become hinged parts');
 if(result.facts.moved!=='yes')result.errors.push('Arrow key did not move raven');
 if(!result.facts.colors||result.facts.colors<36)result.errors.push('Blank or undetailed screenshot');
 result.ok=result.errors.length===0;
}catch(error){result.errors.push(String(error?.stack||error));}
finally{
 try{unlinkSync(probe)}catch{}
 rmSync(tmp,{recursive:true,force:true});
}
process.stdout.write(JSON.stringify(result));
process.exitCode=result.ok?0:1;

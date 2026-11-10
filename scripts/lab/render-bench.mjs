import { chromium } from 'playwright';
import { appendFileSync } from 'node:fs';

const out = process.env.GITHUB_STEP_SUMMARY;
const sizes = [
  { name: 'mobile', width: 390, height: 844, deviceScaleFactor: 1 },
  { name: 'desktop', width: 1280, height: 720, deviceScaleFactor: 1 }
];
const browser = await chromium.launch({
  headless: true, args: ['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']
});
const percentile = (s, q) => s[Math.min(s.length-1,Math.ceil(s.length*q)-1)];
const results = [];
try {
 for (const size of sizes) for (const [version,port] of [['base',8765],['head',8766],['head',8766],['base',8765],['base',8765],['head',8766]]) {
  const page = await browser.newPage({ viewport:size, deviceScaleFactor:1 });
  const errors = [];
  page.on('pageerror', e=>errors.push(e.message));
  await page.addInitScript(()=>{
   let rng=19260511;
   Math.random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296};
   const stats=window.__renderBench={dt:[],draw:[],tri:[],currentDraw:0,currentTri:0,active:false,prev:0};
   const api=WebGL2RenderingContext.prototype;
   for(const name of ['drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced']){
    const orig=api[name];if(!orig)continue;
    api[name]=function(...args){
     if(stats.active){stats.currentDraw++;const count=args[2]||0,instances=name.includes('Instanced')?args[3]||1:1;
      stats.currentTri+=((args[0]===this.TRIANGLES)?count/3:0)*instances}
     return orig.apply(this,args);
    };
   }
   const original=requestAnimationFrame.bind(window);
   window.requestAnimationFrame=(callback)=>original(ts=>{
    if(stats.active){if(stats.prev){stats.dt.push(ts-stats.prev);stats.draw.push(stats.currentDraw);stats.tri.push(stats.currentTri)}
      stats.currentDraw=0;stats.currentTri=0;stats.prev=ts;}
    callback(ts);
   });
  });
  try {
   await page.goto('http://127.0.0.1:'+port+'/games/veil-terraces/',{waitUntil:'load',timeout:45000});
   await page.waitForFunction(()=>window.__metaGamesState && window.__metaGamesState().chunks===25,null,{timeout:45000});
   const webgl=await page.evaluate(()=>!!document.getElementById('screen').getContext('webgl2'));
   if(!webgl)throw Error('WebGL2 disabled');
   await page.waitForTimeout(1000); // compare identical, fully uploaded 25-chunk scenes
   await page.evaluate(()=>{window.__renderBench.active=true;window.__renderBench.prev=0;});
   await page.waitForTimeout(7000);
   const stats=await page.evaluate(()=>window.__renderBench);
   const dt=stats.dt.filter(t=>t>0&&t<1000).sort((a,b)=>a-b);
   const draw=stats.draw.slice(1).sort((a,b)=>a-b);
   const tri=stats.tri.slice(1).sort((a,b)=>a-b);
   if(dt.length<60||!draw.length)throw Error('insufficient WebGL frames '+dt.length);
   results.push({version,viewport:size.name,fps:1000/(dt.reduce((a,b)=>a+b,0)/dt.length),
    p95:+percentile(dt,.95).toFixed(2),p99:+percentile(dt,.99).toFixed(2),
    draw:percentile(draw,.5),triangles:percentile(tri,.5),frames:dt.length,errors});
  }catch(e){errors.push(e.message);results.push({version,viewport:size.name,errors});}
  finally { await page.close(); }
 }
} finally { await browser.close(); }
console.log(JSON.stringify(results,null,2));
const lines=['## Veil Terraces — actual Chromium WebGL2 baseline/head', '', '| Device | Version | FPS | frame p95 ms | frame p99 ms | draw/frame | triangles/frame | Errors |','|---|---|---:|---:|---:|---:|---:|---|'];
for(const r of results)lines.push('| '+[r.viewport,r.version,r.fps?.toFixed(1)??'—',r.p95??'—',r.p99??'—',r.draw??'—',r.triangles??'—',r.errors?.join(', ')||'none'].join(' | ')+' |');
const summary=lines.join('\n')+'\n';
if(out)appendFileSync(out,summary);
else console.log(summary);
let failed=false;
for(const size of sizes){
 const runs=results.filter(r=>r.viewport===size.name);
 const base=runs.filter(r=>r.version==='base').sort((a,b)=>a.p95-b.p95);
 const head=runs.filter(r=>r.version==='head').sort((a,b)=>a.p95-b.p95);
 if(base.length!==3||head.length!==3||runs.some(r=>!r.fps||r.errors.length)){
  failed=true;console.log('::error title=Benchmark unavailable::'+size.name+' missing WebGL2 runs');continue;
 }
 const bp=base[1].p95,hp=head[1].p95;
 const bd=base.map(r=>r.draw).sort((a,b)=>a-b)[1],hd=head.map(r=>r.draw).sort((a,b)=>a-b)[1];
 console.log(size.name+' median p95 '+bp+' -> '+hp+'ms; draws '+bd+' -> '+hd);
 if(hd>bd*1.05){failed=true;console.log('::error title=Draw call regression::'+size.name+': '+hd+' > '+bd);}
 if(hp>bp*1.25){failed=true;console.log('::error title=Frame time regression::'+size.name+': '+hp+'ms > '+bp+'ms');}
 if(size.name==='mobile'&&hp>20){
  failed=true;console.log('::error title=Mobile p95 budget::'+hp+'ms exceeds 20ms');
 }
 if(hd>40){failed=true;console.log('::error title=Draw-call budget::'+hd+' exceeds 40');}
}
if(failed)process.exitCode=1;

import { chromium } from 'playwright';
import { appendFileSync } from 'node:fs';
const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});
const ps=(s,p)=>s[Math.min(s.length-1,Math.max(0,Math.ceil(s.length*p)-1))];
const results=[],sizes=[{name:'mobile',width:390,height:844},{name:'desktop',width:1280,height:720}];
try{
 for(const size of sizes)for(const version of ['base','head','head','base']){
  const port=version==='base'?8765:8766;
  const page=await browser.newPage({viewport:{width:size.width,height:size.height},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
    let drawCalls=0,triangles=0;
    const drawStats=window.__renderPerf={active:false,dt:[],draw:[],tri:[],prev:0};
    const g=WebGL2RenderingContext.prototype;
    for(const method of ['drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced']){
      const fn=g[method];if(!fn)continue;
      g[method]=function(...a){
        if(drawStats.active){drawCalls++;if(a[0]===this.TRIANGLES)triangles+=(a[2]/3)*(method.includes('Instanced')?(a[3]||1):1)}
        return fn.apply(this,a);
      };
    }
    const orig=requestAnimationFrame.bind(window);
    window.requestAnimationFrame=cb=>orig(t=>{
      if(drawStats.active){
        if(drawStats.prev){drawStats.dt.push(t-drawStats.prev);drawStats.draw.push(drawCalls);drawStats.tri.push(triangles)}
        drawCalls=0;triangles=0;drawStats.prev=t;
      }
      cb(t);
    });
  });
  try{
   await page.goto('http://127.0.0.1:'+port+'/games/broken-city/',{waitUntil:'load',timeout:60000});
   await page.waitForFunction(()=>!!window.__G&&document.getElementById('c')?.width>0,{timeout:90000});
   await page.waitForTimeout(2500);
   await page.evaluate(()=>{window.__renderPerf.active=true;window.__renderPerf.prev=0;});
   await page.waitForTimeout(6500);
   const samples=await page.evaluate(()=>window.__renderPerf);
   const d=samples.dt.filter(x=>x>0&&x<1000).sort((a,b)=>a-b);
   const calls=samples.draw.slice(1).sort((a,b)=>a-b);
   if(d.length<8||!calls.length)throw Error('Insufficient frames '+d.length);
   const fps=1000/(d.reduce((a,b)=>a+b,0)/d.length);
   results.push({size:size.name,version,fps,p95:ps(d,.95),draw:ps(calls,.5),frames:d.length,errors,quality:await page.evaluate(()=>window.__META_QUALITY_STATS__?.().scale??1)});
  }catch(e){errors.push(e.message);results.push({size:size.name,version,errors});}
  finally{await page.close()}
 }
}finally{await browser.close()}
console.log(JSON.stringify(results,null,2));
const lines=['## Broken City — exact PR base/head WebGL performance','','| Device | Build | FPS | p95 ms | Draws/frame | Scale | Errors |','|---|---|---:|---:|---:|---:|---|'];
for(const r of results)lines.push('| '+[r.size,r.version,r.fps?.toFixed(2)??'—',r.p95?.toFixed(1)??'—',r.draw??'—',r.quality??'—',r.errors?.join('; ')||'none'].join(' | ')+' |');
if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,lines.join('\n')+'\n');
let failed=false;
for(const size of sizes){
 const runs=results.filter(r=>r.size===size.name);
 if(runs.length!==4||runs.some(r=>!r.fps||r.errors.length)){failed=true;console.log('::error title=Browser failure::'+size.name+' incomplete run');continue}
 const base=runs.filter(r=>r.version==='base').map(r=>r.fps).sort((a,b)=>a-b),head=runs.filter(r=>r.version==='head').map(r=>r.fps).sort((a,b)=>a-b);
 const baseAvg=(base[0]+base[1])/2,headAvg=(head[0]+head[1])/2;
 const baseDraw=Math.max(...runs.filter(r=>r.version==='base').map(r=>r.draw)),headDraw=Math.max(...runs.filter(r=>r.version==='head').map(r=>r.draw));
 console.log(size.name+' BASE '+baseAvg.toFixed(2)+' HEAD '+headAvg.toFixed(2)+' fps; calls '+baseDraw+' -> '+headDraw);
 if(headAvg<baseAvg*.8){failed=true;console.log('::error title=FPS regression::'+size.name+' FPS '+headAvg+' vs '+baseAvg)}
 if(headDraw>baseDraw*1.05){failed=true;console.log('::error title=Draw regression::'+size.name+' calls '+headDraw+' vs '+baseDraw)}
}
if(failed)process.exitCode=1;

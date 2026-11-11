import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync, statSync, createReadStream, existsSync} from 'node:fs';
import {resolve, dirname, join, extname, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {PNG} from 'pngjs';

const repositoryRoot = fileURLToPath(new URL('../../', import.meta.url));
const args = process.argv.slice(2);
function option(name, fallback) {
  const i=args.indexOf(name);
  if(i<0)return fallback;
  assert.ok(args[i+1] && !args[i+1].startsWith('--'), 'Missing value for '+name);
  return args[i+1];
}
const root = resolve(option('--root', repositoryRoot));
const probe = args.includes('--probe');
const waitMs = Number(option('--hold-ms','8000'));
assert.ok(Number.isFinite(waitMs) && waitMs>=0 && waitMs<=30000, 'Invalid --hold-ms');

export function parseStorefront(html) {
  const games=[];
  for(const [anchor] of html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)) {
    const opening=anchor.slice(0,anchor.indexOf('>')+1);
    const classes=/\bclass\s*=\s*["']([^"']+)["']/i.exec(opening)?.[1].split(/\s+/) || [];
    if(!classes.includes('game'))continue;
    const href=/\bhref\s*=\s*["']([^"']+)["']/i.exec(opening)?.[1];
    assert.match(href||'',/^\.\.\/(?:[a-z0-9-]+\/)+$/i,'Invalid storefront game link');
    const title=/<h3\b[^>]*>([^<]+)<\/h3>/i.exec(anchor)?.[1].trim();
    assert.ok(title,'Missing game title for '+href);
    const pathname=new URL(href,'http://localhost/meta-games/index.html').pathname;
    assert.match(pathname,/^\/(?:[a-z0-9-]+\/)+$/i,'Unsafe storefront path');
    games.push({title,path:pathname});
  }
  assert.ok(games.length>0,'No storefront games found');
  assert.equal(new Set(games.map(g=>g.path)).size,games.length,'Duplicate storefront game path');
  return games;
}

const mime={
  '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
  '.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8',
  '.json':'application/json','.wasm':'application/wasm',
  '.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg',
  '.webp':'image/webp','.svg':'image/svg+xml','.glb':'model/gltf-binary',
  '.gltf':'model/gltf+json','.bin':'application/octet-stream',
  '.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf',
  '.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav',
  '.mp4':'video/mp4','.webm':'video/webm','.txt':'text/plain; charset=utf-8'
};

function serve(request,response) {
  try {
    const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
    const filepath=resolve(root,'.'+pathname);
    if(filepath!==root && !filepath.startsWith(root+sep)) {
      response.writeHead(403).end('Forbidden');return;
    }
    let file=filepath;
    let info;
    try {
      info=statSync(file);
      if(info.isDirectory()) {
        file=join(file,'index.html');
        info=statSync(file);
      }
    } catch {
      response.writeHead(404).end('Not found');return;
    }
    if(!info.isFile()) {
      response.writeHead(404).end('Not found');return;
    }
    response.writeHead(200,{'Content-Type':mime[extname(file).toLowerCase()]||'application/octet-stream','Content-Length':info.size,'Cache-Control':'no-store'});
    if(request.method==='HEAD')response.end();
    else createReadStream(file).pipe(response);
  }catch(error) {
    response.writeHead(400).end('Bad request');
  }
}

function pixelColors(pngBuffer) {
  const img=PNG.sync.read(pngBuffer);
  const bins=new Map();
  const stride=Math.max(1,Math.floor(Math.sqrt(img.width*img.height/6000)));
  let count=0;
  for(let y=0;y<img.height;y+=stride)for(let x=0;x<img.width;x+=stride) {
    const i=(y*img.width+x)*4;
    const bucket=((img.data[i]>>4)<<8)|((img.data[i+1]>>4)<<4)|(img.data[i+2]>>4);
    bins.set(bucket,(bins.get(bucket)||0)+1);
    count++;
  }
  const dominant=Math.max(0,...bins.values());
  return {bins:bins.size,nonDominant:(count-dominant)/Math.max(count,1)};
}

async function checkCanvas(page) {
  const canvases=page.locator('canvas');
  const n=await canvases.count();
  assert.ok(n>0,'No canvas in game page');
  const vp=page.viewportSize();
  const faults=[];
  for(let i=0;i<n;i++) {
    const canvas=canvases.nth(i);
    const dimensions=await canvas.evaluate(c=>({w:c.width,h:c.height}));
    const rect=await canvas.boundingBox();
    // Verify the actual visible gameplay surface, not small decorative UI.
    // A low-resolution pixel-art canvas is valid when scaled to game size.
    if(!rect || dimensions.w===0 || dimensions.h===0 ||
       rect.width*rect.height<vp.width*vp.height*0.15) {
      faults.push('canvas '+i+' is a small UI/sprite surface');continue;
    }
    try {
      // Read intrinsic canvas pixels first: avoids overlaid DOM UI and
      // Playwright's screenshot stability waits on animated canvases.
      let direct;
      try {
        const url=await canvas.evaluate(c=>c.toDataURL('image/png'),null,{timeout:5000});
        if(url.startsWith('data:image/png;base64,')) {
          direct=pixelColors(Buffer.from(url.slice(url.indexOf(',')+1),'base64'));
          if(direct.bins>=4 && direct.nonDominant>=0.005)
            return {index:i,width:dimensions.w,height:dimensions.h,source:'canvas',...direct};
        }
      }catch{ /* Tainted or non-preserved WebGL buffers need a compositor snapshot. */ }

      // Direct CDP capture has no "wait for element to be stable" and works
      // for WebGL without preserveDrawingBuffer, unlike toDataURL alone.
      const x=Math.max(0,rect.x),y=Math.max(0,rect.y);
      const width=Math.min(vp.width,rect.x+rect.width)-x;
      const height=Math.min(vp.height,rect.y+rect.height)-y;
      if(width<8||height<8){faults.push('canvas '+i+' outside viewport');continue;}
      const cdp=await page.context().newCDPSession(page);
      let capture;
      try {
        capture=await Promise.race([
          cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,
            clip:{x,y,width,height,scale:1}}),
          new Promise((_,reject)=>setTimeout(()=>reject(Error('CDP screenshot timeout')),12000))
        ]);
      } finally {await cdp.detach().catch(()=>{});}
      const colors=pixelColors(Buffer.from(capture.data,'base64'));
      if(colors.bins>=4 && colors.nonDominant>=0.005)
        return {index:i,width:dimensions.w,height:dimensions.h,source:'compositor',...colors};
      faults.push('canvas '+i+' uniform/blank: direct='+
        (direct?.bins ?? 'unavailable')+' screenshot='+colors.bins);
    }catch(e){faults.push('canvas '+i+' snapshot: '+e.message);}
  }
  throw Error('No canvas with real multicolor pixels: '+faults.join('; '));
}

async function run() {
  const html=readFileSync(join(root,'meta-games/index.html'),'utf8');
  const games = parseStorefront(html);
  if(probe) {
    const synthetic='<a class="game" href="../games/zz-p1-probe/"><h3>Dynamic probe</h3></a>';
    const amended=parseStorefront(html.replace(/<\/body>/i,synthetic+'</body>'));
    assert.equal(amended.length,games.length+1,'New storefront card was not discovered');
    assert.ok(amended.some(g=>g.path==='/games/zz-p1-probe/'),'Hardcoded game list detected');
    console.log('STOREFRONT_DISCOVERY_PASS',games.length,'plus dynamic probe');
    return;
  }
  const server=createServer(serve);
  await new Promise((res,rej)=>{server.once('error',rej);server.listen(0,'127.0.0.1',res)});
  const address='http://127.0.0.1:'+server.address().port;
  // GitHub runners have system Chrome; use it when the Playwright-downloaded
  // Chromium is absent (e.g. on the permanent guard mutation runner).
  const launch={headless:true,args:[
    '--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist','--disable-dev-shm-usage'
  ]};
  if(!existsSync(chromium.executablePath()))launch.channel='chrome';
  const browser=await chromium.launch(launch);
  let failures=0;
  try {
    for(const game of games) {
      const ctx=await browser.newContext({viewport:{width:1100,height:740},deviceScaleFactor:1});
      const page=await ctx.newPage();
      const errors=[];
      page.on('pageerror',error=>errors.push('Uncaught JS: '+error.message));
      page.on('console',message=>{if(message.type()==='error')errors.push('Console: '+message.text());});
      try {
        const response=await page.goto(address+game.path,{waitUntil:'domcontentloaded',timeout:60000});
        assert.equal(response?.status(),200,'HTTP not 200: '+response?.status());
        await page.waitForTimeout(waitMs);
        assert.deepEqual(errors,[],'Browser console/runtime errors');
        const painted=await checkCanvas(page);
        console.log('P1 PASS',game.title,game.path,'HTTP 200 canvas',painted.width+'x'+painted.height,'colors',painted.bins);
      } catch(error) {
        failures++;
        console.error('P1 FAIL',game.title,game.path,error.stack||error);
      } finally {
        await ctx.close();
      }
    }
  } finally {
    await browser.close();
    await new Promise(res=>server.close(res));
  }
  console.log('P1 TOTAL',games.length,'passed',games.length-failures,'failed',failures);
  if(failures)process.exitCode=1;
}
run().catch(error=>{console.error('P1 FATAL',error.stack||error);process.exitCode=1;});

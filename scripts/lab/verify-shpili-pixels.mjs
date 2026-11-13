const {features}=await import(process.argv[2] ||
  new URL('../../automation/asset-check/kinds/htmlpack_pixels.mjs',import.meta.url).href);
const w=160,h=160;
function frame(shape, time, shifted=0, translucent=false) {
 const on={width:w,height:h,channels:4,data:new Uint8Array(w*h*4)};
 const off={...on,data:new Uint8Array(w*h*4)};
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4,bg=((x*19+y*37+time*73)%109);
  const inside=shape(x-shifted,y);
  for(let c=0;c<3;c++){
   off.data[i+c]=bg;
   on.data[i+c]=inside?(translucent?bg+90:180):bg;
  }
  on.data[i+3]=off.data[i+3]=255;
 }
 return {on,off};
}
const circle=(x,y)=>Math.hypot(x-80,y-80)<44;
const ring=(x,y)=>Math.abs(Math.hypot(x-80,y-80)-38)<8;
const figure=(x,y)=>(x>68&&x<91&&y>20&&y<139)||
 (x>28&&x<130&&y>47&&y<65)||(x>45&&x<66&&y>92&&y<141);
const pair=(a,b)=>features(a.on,b.on,a.off,b.off,60);
const clean=pair(frame(figure,0),frame(figure,0));
const deceptive=pair(frame(circle,0,0,true),frame(circle,1,0,true));
const translated=pair(frame(circle,0),frame(circle,0,8));
const f=pair(frame(figure,0),frame(figure,0));
const c=pair(frame(circle,0),frame(circle,0));
const r=pair(frame(ring,0),frame(ring,0));
if(c.silhouette>=.09||r.silhouette>=.09||f.silhouette<=.16)
 throw Error('primitive silhouette accepted: '+JSON.stringify({c,r,f}));
if(clean.motion!==0||deceptive.motion!==0||deceptive.detail!==0||translated.motion!==0)
 throw Error('background/translation promoted to quality: '+JSON.stringify({clean,deceptive,translated}));
if(deceptive.isolated<=.1||deceptive.isolated>=.5)throw Error('wrong object mask area');
console.log('object-pixel traps PASS');

// Exercise the actual game's resource-root expression on main, preview and local HTTP.
const {readFileSync}=await import('node:fs');
const {runInNewContext}=await import('node:vm');
const gameFile=new URL('../../asset-packs/incoming/tumannye-shpili-plus/index.html',import.meta.url);
const source=readFileSync(gameFile,'utf8');
const expression=source.match(/const assetRoot=([\s\S]*?);\nconst THREE=/)?.[1];
if(!expression)throw Error('shared asset root expression absent');
for(const [pathname,expected] of [
 ['/meta6-lab/asset-packs/incoming/pack/index.html','/meta6-lab/'],
 ['/meta6-lab/preview/my-branch/asset-packs/incoming/pack/index.html','/meta6-lab/'],
 ['/preview/asset-check/asset-packs/incoming/pack/index.html','/'],
]){
 const moduleURL='https://example.invalid'+pathname;
 const actual=runInNewContext(expression.replaceAll('import.meta.url','moduleURL'),
   {URL,location:{pathname},moduleURL});
 if(actual.pathname!==expected)throw Error('preview dependency is outside published root: '+actual.pathname);
}
console.log('preview dependency paths PASS');

import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createAshFactory} from '../ash-assets.mjs';
const out='three-worlds-game/evidence/model-lab';
await mkdir(out,{recursive:true});
class RefVector3{
 constructor(x=0,y=0,z=0){Object.assign(this,{x,y,z})}
 normalize(){const length=Math.hypot(this.x,this.y,this.z)||1;this.x/=length;this.y/=length;this.z/=length;return this}
}
class RefVector4{constructor(x=0,y=0,z=0,w=0){Object.assign(this,{x,y,z,w})}}
const referencePalette=[null,
 '#17161f','#262633','#3a3b4d','#565968','#7d8190',
 '#2a1612','#4a2417','#733319','#a24a1f','#c9732c',
 '#5a2f10','#9a5a14','#d98a1e','#f0b03a','#ffd978',
 '#1a1512','#2b221b','#3f3226','#594632','#7a6044',
 '#25252b','#3d3d45','#5c5c64','#85858a','#b0aea8',
 '#14170f','#232814','#38401d','#545c2a','#7a8238',
 '#3a0a12','#7a1220','#c4202e','#ff3d4a','#ff9a9a',
 '#0c2a3a','#14587a','#2a9cc4','#6fdcff','#d4f6ff',
 '#1b1620','#2d2536','#473b52','#6a5a73','#928093',
 '#ff9e29','#ff5714','#ff2933','#4dd9ff','#fff2d9','#66ff80'];
function shade(hex,factor){
 const value=parseInt(hex.slice(1),16);
 const channel=shift=>Math.max(0,Math.min(255,Math.round(((value>>shift)&255)*factor))).toString(16).padStart(2,'0');
 return '#'+channel(16)+channel(8)+channel(0);
}
function buildReferenceAtlas(){
 const factory=createAshFactory({Vector3:RefVector3,Vector4:RefVector4});
 const model=factory.models.find(candidate=>candidate.id==='scavenger');
 if(!model)throw Error('original Ash scavenger reference is missing');
 const voxels=[],colors=new Set();
 for(const part of model.parts)part.grid.each((x,y,z,color)=>{voxels.push({x,y,z,color});colors.add(color)});
 if(model.parts.length!==8||voxels.length!==525||colors.size!==14)
  throw Error('original Ash scavenger visual source changed '+JSON.stringify({parts:model.parts.length,voxels:voxels.length,colors:colors.size}));
 const width=768,height=224,cellWidth=192;
 let svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'" viewBox="0 0 '+width+' '+height+'"><rect width="100%" height="100%" fill="#101018"/>';
 [0,2,4,6].forEach((direction,column)=>{
  const angle=direction*Math.PI/4,cos=Math.cos(angle),sin=Math.sin(angle);
  const projected=voxels.map(voxel=>({...voxel,rx:voxel.x*cos-voxel.z*sin,depth:voxel.x*sin+voxel.z*cos}))
   .sort((a,b)=>a.depth-b.depth||a.y-b.y||a.x-b.x);
  svg+='<text x="'+(column*cellWidth+8)+'" y="18" fill="#b0aea8" font-family="monospace" font-size="12">source scavenger d'+direction+'</text>';
  for(const voxel of projected){
   const x=column*cellWidth+96+voxel.rx*4,y=202-voxel.y*4+voxel.depth*1.6,color=referencePalette[voxel.color];
   if(!color)throw Error('unmapped Ash palette index '+voxel.color);
   const p=(points,fill)=>{svg+='<polygon points="'+points+'" fill="'+fill+'" stroke="#08080c" stroke-width=".35"/>'};
   p((x)+','+(y-4)+' '+(x+4)+','+(y-2)+' '+x+','+y+' '+(x-4)+','+(y-2),shade(color,1.18));
   p((x-4)+','+(y-2)+' '+x+','+y+' '+x+','+(y+4)+' '+(x-4)+','+(y+2),shade(color,.72));
   p((x+4)+','+(y-2)+' '+x+','+y+' '+x+','+(y+4)+' '+(x+4)+','+(y+2),shade(color,.92));
  }
 });
 return {svg:svg+'</svg>',parts:model.parts.length,voxels:voxels.length,paletteColors:colors.size,directions:[0,2,4,6]};
}
const browser=await chromium.launch({headless:true,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
try{
 const page=await browser.newPage({viewport:{width:800,height:800},deviceScaleFactor:1});
 await page.goto('http://127.0.0.1:8765/three-worlds-game/models-lab/gpt-rift-scout-v1.svg',{waitUntil:'load'});
 const info=await page.evaluate(()=>({
  model:document.documentElement.getAttribute('data-model'),
  directions:Number(document.documentElement.getAttribute('data-directions')),
  frames:Number(document.documentElement.getAttribute('data-frames')),
  cells:document.querySelectorAll('g[data-d][data-a]').length,
  parts:Number(document.documentElement.getAttribute('data-parts')),
  palette:Number(document.documentElement.getAttribute('data-palette-colors')),
  reusedDefs:Number(document.documentElement.getAttribute('data-reused-defs')),
  useInstances:document.querySelectorAll('use').length,
  facingDetails:[...document.querySelectorAll('[data-f]')].map(node=>node.getAttribute('data-f')),
  beaconPulse:[...document.querySelectorAll('[data-m="b"]')].map(node=>({radius:Number(node.getAttribute('r')),opacity:Number(node.getAttribute('opacity'))}))
 }));
 if(info.model!=='gpt-rift-scout-v1'||info.directions!==8||info.frames!==8||info.cells!==64||info.parts!==15||info.palette!==14||info.reusedDefs!==45||info.useInstances!==896||info.facingDetails.length!==64||new Set(info.facingDetails).size!==8||info.beaconPulse.length!==64||new Set(info.beaconPulse.map(sample=>sample.radius)).size!==5||new Set(info.beaconPulse.map(sample=>sample.opacity)).size!==5)
  throw Error('atlas DOM contract mismatch '+JSON.stringify(info));
 const atlas=await page.screenshot({path:out+'/scout-atlas.png',clip:{x:0,y:0,width:768,height:768},omitBackground:true});
 const atlasHash=createHash('sha256').update(atlas).digest('hex');
 if(atlasHash!=='69946980330e5e15d640badf5e59584ef0ebb0e91aed48276ef318491c8cec6b')throw Error('SVG reuse changed the rendered atlas '+atlasHash);
 const samples=[],sampleImages=[];
 for(const [name,direction,frame] of [['front-idle',0,0],['right-idle',2,0],['rear-idle',4,0],['left-idle',6,0]]){
  const x=frame*96,y=direction*96;
  const png=await page.screenshot({path:`${out}/scout-${name}.png`,clip:{x,y,width:96,height:96},omitBackground:true});
  samples.push({name,direction,frame,cell:{x,y},sha256:createHash('sha256').update(png).digest('hex'),bytes:png.length});
  sampleImages.push({name,direction,data:'data:image/png;base64,'+png.toString('base64')});
 }
 if(new Set(samples.map(x=>x.sha256)).size!==samples.length)throw Error('rendered direction/frame samples are identical');
 const motionGeometry=await page.evaluate(()=>[...document.querySelectorAll('g[data-d="0"][data-a]')]
  .sort((a,b)=>Number(a.getAttribute('data-a'))-Number(b.getAttribute('data-a')))
  .map(cell=>({frame:Number(cell.getAttribute('data-a')),refs:[...cell.querySelectorAll('use')].map(use=>use.getAttribute('href')||use.getAttribute('xlink:href')).join(',')})));
 if(motionGeometry.length!==8||new Set(motionGeometry.map(sample=>sample.refs)).size<5)
  throw Error('front animation geometry lacks authored progression '+JSON.stringify(motionGeometry));
 const motionFrames=[],motionImages=[];
 for(let frame=0;frame<8;frame++){
  const png=await page.screenshot({path:`${out}/scout-front-frame-${frame}.png`,clip:{x:frame*96,y:0,width:96,height:96},omitBackground:true});
  motionFrames.push({direction:0,frame,cell:{x:frame*96,y:0},sha256:createHash('sha256').update(png).digest('hex'),bytes:png.length});
  motionImages.push('data:image/png;base64,'+png.toString('base64'));
 }
 if(new Set(motionFrames.map(sample=>sample.sha256)).size<5)throw Error('front animation raster lacks visible progression '+JSON.stringify(motionFrames));
 const labPreviewPerformance=await page.evaluate(async()=>{
  const root=document.documentElement;
  const frameTimes=[];
  let previous;
  for(let frame=0;frame<180;frame++){
   await new Promise(resolve=>requestAnimationFrame(now=>{
    if(previous!==undefined)frameTimes.push(now-previous);
    previous=now;
    const cell=frame%64;
    root.setAttribute('viewBox',`${(cell%8)*96} ${Math.floor(cell/8)*96} 96 96`);
    resolve();
   }));
  }
  root.setAttribute('viewBox','0 0 768 768');
  const percentile=(values,q)=>{
   const sorted=[...values].sort((a,b)=>a-b);
   return sorted[Math.min(sorted.length-1,Math.floor((sorted.length-1)*q))];
  };
  const fps=frameTimes.map(ms=>1000/ms);
  return {
   frames:frameTimes.length,
   frameTimeMs:{p50:percentile(frameTimes,.5),p95:percentile(frameTimes,.95)},
   fps:{p50:percentile(fps,.5),p95:percentile(fps,.95)}
  };
 });
 if(labPreviewPerformance.frames<170||!Number.isFinite(labPreviewPerformance.frameTimeMs.p95))
  throw Error('lab preview performance sample incomplete '+JSON.stringify(labPreviewPerformance));
 const reference=buildReferenceAtlas();
 const referencePage=await browser.newPage({viewport:{width:768,height:224},deviceScaleFactor:1});
 await referencePage.setContent(reference.svg,{waitUntil:'load'});
 const referencePng=await referencePage.screenshot({path:out+'/scout-reference-source.png',clip:{x:0,y:0,width:768,height:224}});
 await referencePage.close();
 if(referencePng.length<10000)throw Error('original Ash reference projection is unexpectedly empty '+referencePng.length);
 const referenceProjection={parts:reference.parts,voxels:reference.voxels,paletteColors:reference.paletteColors,directions:reference.directions,
  sha256:createHash('sha256').update(referencePng).digest('hex'),bytes:referencePng.length,
  renderer:'deterministic isometric projection of actual scavenger voxel grids and source palette'};
 if(samples.map(sample=>sample.direction).join(',')!==reference.directions.join(',')||samples.some(sample=>sample.frame!==0))
  throw Error('candidate/reference cardinal directions are not directly comparable '+JSON.stringify({samples,reference:reference.directions}));
 const sheetPage=await browser.newPage({viewport:{width:768,height:448},deviceScaleFactor:1});
 const sourceData='data:image/png;base64,'+referencePng.toString('base64');
 const candidateRow=sampleImages.map(sample=>'<figure><figcaption>candidate d'+sample.direction+' idle</figcaption><img src="'+sample.data+'"></figure>').join('');
 await sheetPage.setContent('<style>*{box-sizing:border-box}body{margin:0;width:768px;height:448px;background:#101018;color:#b0aea8;font:12px monospace}.source{display:block;width:768px;height:224px}.candidates{display:grid;grid-template-columns:repeat(4,192px);height:224px}.candidates figure{margin:0;border-top:1px solid #353544;text-align:center}.candidates figcaption{height:24px;padding:5px}.candidates img{width:192px;height:192px;object-fit:contain;image-rendering:pixelated}</style><img class="source" src="'+sourceData+'"><div class="candidates">'+candidateRow+'</div>',{waitUntil:'load'});
 const sheetPng=await sheetPage.screenshot({path:out+'/scout-side-by-side.png',clip:{x:0,y:0,width:768,height:448}});
 await sheetPage.close();
 if(sheetPng.length<20000)throw Error('side-by-side comparison sheet is unexpectedly empty '+sheetPng.length);
 const contactSheet={path:'scout-side-by-side.png',layout:'original source top; candidate idle bottom; directions 0/2/4/6 left-to-right',
  sha256:createHash('sha256').update(sheetPng).digest('hex'),bytes:sheetPng.length};
 const motionPage=await browser.newPage({viewport:{width:768,height:120},deviceScaleFactor:1});
 const motionCells=motionImages.map((data,frame)=>'<figure><figcaption>front f'+frame+'</figcaption><img src="'+data+'"></figure>').join('');
 await motionPage.setContent('<style>*{box-sizing:border-box}body{margin:0;width:768px;height:120px;background:#101018;color:#b0aea8;font:12px monospace;display:grid;grid-template-columns:repeat(8,96px)}figure{margin:0;text-align:center}figcaption{height:24px;padding:5px}img{width:96px;height:96px;image-rendering:pixelated}</style>'+motionCells,{waitUntil:'load'});
 const motionPng=await motionPage.screenshot({path:out+'/scout-front-motion.png',clip:{x:0,y:0,width:768,height:120}});
 await motionPage.close();
 if(motionPng.length<10000)throw Error('front motion strip is unexpectedly empty '+motionPng.length);
 const motionStrip={path:'scout-front-motion.png',layout:'front direction 0; authored frames 0-7 left-to-right',
  sha256:createHash('sha256').update(motionPng).digest('hex'),bytes:motionPng.length,frames:motionFrames,
  uniqueRasterFrames:new Set(motionFrames.map(sample=>sample.sha256)).size,uniqueGeometrySignatures:new Set(motionGeometry.map(sample=>sample.refs)).size};
 const comparison={reference:referenceProjection,candidate:{atlasSha256:atlasHash,samples},contactSheet,motionStrip,visualParity:'UNKNOWN',
  reviewNote:'Evidence exposes matching source/candidate directions and a separate eight-frame candidate motion strip; only Claude review may decide parity.'};
 await writeFile(out+'/scout-comparison.json',JSON.stringify(comparison,null,2)+'\n');
 const evidence={...info,atlas:{sha256:atlasHash,bytes:atlas.length},samples,motionStrip,referenceProjection,
  browser:'Playwright Chromium 1.56.1 / SwiftShader',resolution:'800x800 DPR1',labPreviewPerformance,visualParity:'UNKNOWN',gameFpsP50P95:'UNKNOWN',gameIntegration:false};
 await writeFile(out+'/scout-render.json',JSON.stringify(evidence,null,2)+'\n');
 console.log(JSON.stringify(evidence));
}finally{await browser.close()}

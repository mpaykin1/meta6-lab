#!/usr/bin/env node
// META GAMES: ножницы для художественного листа. Источник деталей — parts-sheet.md.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const source = path.resolve(process.argv[2] || 'skins/sources/rusty-robot');
const id = path.basename(source);
const file = path.join(source, 'parts-sheet.png');
const mdFile = path.join(source, 'parts-sheet.md');
const out = path.join(source, 'cut');
const fail = message => { throw Error('НОЖНИЦЫ: ' + message); };
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const isPower2 = v => v > 0 && (v & (v - 1)) === 0;
const safeName = s => s.toLowerCase().replace(/ё/g,'e').replace(/[^a-z0-9а-я]+/gi,'-').replace(/^-|-$/g,'');
function readParts(md) {
  const entries = [];
  for(const line of md.split(/\r?\n/)) {
    const cols=line.split('|').slice(1,-1).map(x=>x.trim());
    if(cols.length<5 || !/^\d+$/.test(cols[0]) || !/^\d+$/.test(cols[1]))continue;
    const [row,place]=cols.map(Number);
    const name=cols[2],bone=cols[3],motion=cols[4];
    if(!name || !['голова','тело','левая рука','правая рука','левая нога','правая нога','над головой'].includes(bone))fail('неизвестная кость в таблице: '+line);
    if(!['не двигается','вращается','качается','светится','кадры'].includes(motion))fail('неизвестное движение: '+line);
    if(entries.some(p=>p.row===row&&p.place===place))fail('повторена позиция '+row+'/'+place);
    entries.push({row,place,name,bone,motion});
  }
  if(!entries.length)fail('в parts-sheet.md нет таблицы деталей');
  entries.sort((a,b)=>a.row-b.row||a.place-b.place);
  const rows=[...new Set(entries.map(e=>e.row))];
  if(rows[0]!==1||rows.some((r,i)=>r!==i+1))fail('ряды должны идти подряд с 1');
  for(const row of rows) {
    const places=entries.filter(e=>e.row===row).map(e=>e.place);
    if(places.some((p,i)=>p!==i+1))fail('места ряда '+row+' должны идти подряд с 1');
  }
  return {entries,rows};
}
function readPalette(md){
  const fromText=[...new Set([...md.matchAll(/#[a-fA-F0-9]{6}\b/g)].map(m=>m[0].toLowerCase()))];
  if(fromText.length>=6&&fromText.length<=16)return fromText;
  const readme=path.join(source,'README.md');
  if(fs.existsSync(readme)){
    const matches=[...new Set([...fs.readFileSync(readme,'utf8').matchAll(/#[a-fA-F0-9]{6}\b/g)].map(m=>m[0].toLowerCase()))];
    if(matches.length>=6&&matches.length<=16)return matches;
  }
  // Старый принятый пакет — только источник палитры, никогда не источник вырезок.
  const manifest=path.resolve('skins/packs',id,'skin.json');
  if(fs.existsSync(manifest)){
    const p=JSON.parse(fs.readFileSync(manifest,'utf8')).palette||[];
    if(p.length>=6&&p.length<=16)return p.map(x=>x.toLowerCase());
  }
  fail('нужны 6–16 цветов палитры в parts-sheet.md, README.md или существующем skin.json');
}
function colors(hex){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));}
function isMagenta(r,g,b){
  // Не только #ff00ff: JPEG-подобный шум и смешанные с розовым ореолы.
  return r>=104 && b>=94 && r-g>=49 && b-g>=39 && Math.abs(r-b)<145;
}
function detectRows(mask,w,h,n) {
  const activity=new Int32Array(h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)activity[y]+=mask[y*w+x];
  const minRun=Math.max(4,Math.round(h*.004));
  const first=activity.findIndex(v=>v>0),last=activity.findLastIndex(v=>v>0);
  if(first<0)fail('на листе нет деталей: проверьте розовый фон');
  const gaps=[];let start=-1;
  for(let y=first;y<=last+1;y++){
    if(y<=last && activity[y]===0){if(start<0)start=y;}
    else if(start>=0){if(y-start>=minRun)gaps.push({a:start,b:y,width:y-start});start=-1;}
  }
  // Пять авторских рядов: выбираем именно разделительные полосы фона.
  const candidates=gaps.sort((a,b)=>b.width-a.width).slice(0,n-1).sort((a,b)=>a.a-b.a);
  if(candidates.length!==n-1)fail('не найдено '+n+' отдельных рядов, найдено '+(candidates.length+1)+'. Проверьте промежутки и ореолы');
  const edges=[first,...candidates.map(g=>Math.floor((g.a+g.b)/2)),last+1];
  const bands=[];
  for(let i=0;i<n;i++){
    const y0=edges[i],y1=edges[i+1];
    if(y1<=y0||!activity.slice(y0,y1).some(Boolean))fail('пустой ряд '+(i+1));
    bands.push({y0,y1});
  }
  return bands;
}
function components(mask,w,y0,y1){
  const h=y1-y0,visit=new Uint8Array(w*h),parts=[],queue=new Int32Array(w*h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const seed=y*w+x;if(!mask[(y+y0)*w+x]||visit[seed])continue;
    let front=0,back=1,area=0,x0=x,x1=x,ymin=y,ymax=y;
    visit[seed]=1;queue[0]=seed;
    while(front<back){
      const t=queue[front++],px=t%w,py=Math.floor(t/w);
      area++;x0=Math.min(x0,px);x1=Math.max(x1,px);ymin=Math.min(ymin,py);ymax=Math.max(ymax,py);
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
        const xx=px+dx,yy=py+dy;
        if(xx<0||xx>=w||yy<0||yy>=h)continue;
        const k=yy*w+xx;
        if(!visit[k] && mask[(yy+y0)*w+xx]){visit[k]=1;queue[back++]=k;}
      }
    }
    if(area>=Math.max(4,Math.floor(w*h*.000002)))parts.push({x0,y0:ymin+y0,x1,y1:ymax+y0,area});
  }
  return parts;
}
function gap(a,b){
  const dx=Math.max(0,a.x0-b.x1-1,b.x0-a.x1-1);
  const dy=Math.max(0,a.y0-b.y1-1,b.y0-a.y1-1);
  return Math.hypot(dx,dy);
}
function mergeNearby(all,radius){
  let arr=all.map(p=>({...p}));
  for(let changed=true;changed;){
    changed=false;
    outer:for(let i=0;i<arr.length;i++)for(let j=i+1;j<arr.length;j++){
      if(gap(arr[i],arr[j])>radius)continue;
      const a=arr[i],b=arr[j];arr[i]={x0:Math.min(a.x0,b.x0),x1:Math.max(a.x1,b.x1),y0:Math.min(a.y0,b.y0),y1:Math.max(a.y1,b.y1),area:a.area+b.area};
      arr.splice(j,1);changed=true;break outer;
    }
  }
  return arr;
}
function expectedFrames(e) {
  if(e.motion!=='кадры')return 1;
  const m=e.name.match(/(\d+)\s*[–—-]\s*(\d+)/);
  if(!m)fail('для кадров укажите диапазон в имени детали: '+e.name);
  const n=Number(m[2])-Number(m[1])+1;
  if(n<6||n>32)fail('количество кадров вне допустимого диапазона: '+e.name);
  return n;
}
function nearestPalette(r,g,b,palette){
  // Сначала удаляется розовый spill, затем обязательная проекция в палитру эскиза.
  const spill=Math.max(0,Math.min(r,b)-g-12);
  r=Math.max(0,r-spill*.44);b=Math.max(0,b-spill*.44);
  let best=palette[0],dist=Infinity;
  for(const c of palette){const d=(r-c[0])**2+(g-c[1])**2+(b-c[2])**2;if(d<dist){dist=d;best=c;}}
  return best;
}
async function writeCrop(entry,rect,mask,pixels,w,h,palette,filename,side){
  const pad=Math.max(3,Math.floor(Math.max(rect.x1-rect.x0,rect.y1-rect.y0)*.07));
  const ww=rect.x1-rect.x0+1,hh=rect.y1-rect.y0+1;
  const scale=Math.min((side-2*pad)/ww,(side-2*pad)/hh);
  const targetW=Math.max(1,Math.floor(ww*scale)),targetH=Math.max(1,Math.floor(hh*scale));
  const buf=Buffer.alloc(ww*hh*4);
  for(let y=0;y<hh;y++)for(let x=0;x<ww;x++){
    const gx=x+rect.x0,gy=y+rect.y0,pos=gy*w+gx,p=pos*4,k=(y*ww+x)*4;
    if(!mask[pos])continue;
    const [r,g,b]=nearestPalette(pixels[p],pixels[p+1],pixels[p+2],palette);
    buf[k]=r;buf[k+1]=g;buf[k+2]=b;buf[k+3]=255;
  }
  const scaled=await sharp(buf,{raw:{width:ww,height:hh,channels:4}}).resize(targetW,targetH,{kernel:'nearest'}).png().toBuffer();
  const ox=Math.floor((side-targetW)/2),oy=Math.floor((side-targetH)/2);
  await sharp({create:{width:side,height:side,channels:4,background:'#00000000'}}).composite([{input:scaled,left:ox,top:oy}]).png().toFile(filename);
}
async function main(){
  if(!fs.existsSync(file)||!fs.existsSync(mdFile))fail('нет parts-sheet.png или parts-sheet.md в '+source);
  const md=fs.readFileSync(mdFile,'utf8'),{entries,rows}=readParts(md);
  const palette=readPalette(md).map(colors);
  const {data,info}=await sharp(file,{limitInputPixels:64e6}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const {width:w,height:h,channels}=info;
  if(w<128||h<128||w>8192||h>8192)fail('слишком маленький/большой лист '+w+'×'+h);
  let border=0,total=0,background=0;
  const mask=new Uint8Array(w*h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const k=(y*w+x)*channels,mag=isMagenta(data[k],data[k+1],data[k+2]);
    if(x<Math.max(3,w*.012)||y<Math.max(3,h*.012)||x>=w-Math.max(3,w*.012)||y>=h-Math.max(3,h*.012)){total++;if(mag)border++;}
    if(mag)background++;
    else if(data[k+3]>=90)mask[y*w+x]=1;
  }
  if(border/total<.92||background/(w*h)<.20)fail('фон не розовый: доля розового на краях '+Math.round(100*border/total)+' %, на листе '+Math.round(100*background/(w*h))+' %');
  const bands=detectRows(mask,w,h,rows.length),found=[];
  const radius=Math.max(2,Math.min(11,Math.round(Math.min(w,h)*.005)));
  for(let ri=0;ri<rows.length;ri++){
    const row=rows[ri],expected=entries.filter(e=>e.row===row).reduce((n,e)=>n+expectedFrames(e),0);
    const comps=mergeNearby(components(mask,w,bands[ri].y0,bands[ri].y1),radius);
    comps.sort((a,b)=>a.x0-b.x0||a.y0-b.y0);
    if(comps.length!==expected)fail('ряд '+row+': найдено '+comps.length+' отдельных изображений, по таблице нужно '+expected+'. Проверьте пропущенные/лишние детали, подписи, касания, ореолы и разрывы. Области: '+comps.map(p=>p.x0+'-'+p.x1).join(', '));
    let cursor=0;
    for(const e of entries.filter(e=>e.row===row)){
      const n=expectedFrames(e);
      found.push({entry:e,rects:comps.slice(cursor,cursor+n)});
      cursor+=n;
    }
  }
  // Только теперь, после строгой сверки таблицы, заменяем старые вырезки.
  const tmp=out+'-next-'+process.pid;
  fs.rmSync(tmp,{recursive:true,force:true});fs.mkdirSync(path.join(tmp,'parts'),{recursive:true});fs.mkdirSync(path.join(tmp,'sheets'),{recursive:true});
  const manifest=[];
  try{
    for(let i=0;i<found.length;i++){
      const {entry,rects}=found[i],frames=rects.length;
      const name=String(i+1).padStart(2,'0')+'-'+safeName(entry.name).slice(0,64);
      if(frames===1){
        const rel='parts/'+name+'.png';
        await writeCrop(entry,rects[0],mask,data,w,h,palette,path.join(tmp,rel),64);
        manifest.push({...entry,file:rel,frames,rect:rects[0]});
      }else{
        // Исходные 6 кадров хранятся без выдуманных рисунков; атлас строит сборщик.
        const rels=[];
        for(let f=0;f<frames;f++){
          const rel='sheets/'+name+'-'+String(f+1).padStart(2,'0')+'.png';
          await writeCrop(entry,rects[f],mask,data,w,h,palette,path.join(tmp,rel),32);
          rels.push(rel);
        }
        manifest.push({...entry,files:rels,frames,rect:rects});
      }
    }
    fs.writeFileSync(path.join(tmp,'cut-manifest.json'),JSON.stringify({format:'meta6-cut/1',sourceSheetSha256:sha(file),sourceTableSha256:sha(mdFile),width:w,height:h,palette:palette.map(c=>'#'+c.map(x=>x.toString(16).padStart(2,'0')).join('')),parts:manifest},null,2)+'\n');
    const tiles=manifest.flatMap(p=>p.file?[p.file]:p.files);
    const cols=6,tw=96,th=96,rowsCount=Math.ceil(tiles.length/cols),comps=[];
    for(let i=0;i<tiles.length;i++)comps.push({input:await sharp(path.join(tmp,tiles[i])).resize(72,72,{fit:'contain',kernel:'nearest'}).toBuffer(),left:(i%cols)*tw+12,top:Math.floor(i/cols)*th+12});
    const preview=await sharp({create:{width:cols*tw,height:rowsCount*th,channels:4,background:'#101820'}}).composite(comps).png().toBuffer();
    fs.rmSync(out,{recursive:true,force:true});fs.renameSync(tmp,out);
    fs.writeFileSync(path.join(source,'cut-preview.png'),preview);
    console.log('НОЖНИЦЫ: '+manifest.length+' деталей, '+tiles.length+' вырезок, фон/ореолы удалены; '+path.relative(process.cwd(),path.join(source,'cut-preview.png')));
  }catch(e){fs.rmSync(tmp,{recursive:true,force:true});throw e;}
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});

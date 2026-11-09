import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
const OUT=path.resolve('skins/packs/rusty-robot');
for(const s of ['','textures','parts','sheets'])fs.mkdirSync(path.join(OUT,s),{recursive:true});
const P=['#160f1a','#2b2026','#49302e','#743b2d','#9b4329','#c8551e','#e66a2d','#f69a47','#ffbf69','#ffe6a0','#595779','#a5a4e9'];
const RGB=P.map(hex=>[parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)]);
const pal=(i)=>[...RGB[i],255];
const crcTable=new Uint32Array(256);
for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1);crcTable[n]=c>>>0;}
function crc(buf){let c=0xffffffff;for(const b of buf)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
function chunk(tag,bytes){const len=Buffer.alloc(4);len.writeUInt32BE(bytes.length);const data=Buffer.concat([Buffer.from(tag),bytes]);const sum=Buffer.alloc(4);sum.writeUInt32BE(crc(data));return Buffer.concat([len,data,sum]);}
function png(w,h,pixels){
 const raw=Buffer.alloc((w*4+1)*h);
 for(let y=0;y<h;y++)pixels.copy(raw,y*(w*4+1)+1,y*w*4,(y+1)*w*4);
 const ih=Buffer.alloc(13);ih.writeUInt32BE(w,0);ih.writeUInt32BE(h,4);ih[8]=8;ih[9]=6;
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',zlib.deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]);
}
function canvas(w,h){
 const b=Buffer.alloc(w*h*4);
 const dot=(x,y,c)=>{x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=w||y>=h)return;const k=(y*w+x)*4;if(c<0){b[k+3]=0;return;}const a=pal(c);b[k]=a[0];b[k+1]=a[1];b[k+2]=a[2];b[k+3]=a[3];};
 const rect=(x,y,ww,hh,c)=>{for(let j=Math.max(0,Math.floor(y));j<Math.min(h,y+hh);j++)for(let i=Math.max(0,Math.floor(x));i<Math.min(w,x+ww);i++)dot(i,j,c);};
 const disc=(cx,cy,r,c)=>{for(let y=Math.max(0,Math.floor(cy-r));y<Math.min(h,cy+r+1);y++)for(let x=Math.max(0,Math.floor(cx-r));x<Math.min(w,cx+r+1);x++)if((x-cx)**2+(y-cy)**2<=r*r)dot(x,y,c);};
 const line=(x1,y1,x2,y2,c,t=1)=>{const n=Math.max(1,Math.ceil(Math.hypot(x2-x1,y2-y1)));for(let s=0;s<=n;s++){const x=x1+(x2-x1)*s/n,y=y1+(y2-y1)*s/n;for(let dx=0;dx<t;dx++)for(let dy=0;dy<t;dy++)dot(x+dx,y+dy,c);}};
 const poly=(points,c)=>{const yy=points.map(p=>p[1]);for(let y=Math.max(0,Math.floor(Math.min(...yy)));y<=Math.min(h-1,Math.ceil(Math.max(...yy)));y++){const xs=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];if((a[1]<=y&&b[1]>y)||(b[1]<=y&&a[1]>y))xs.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));}xs.sort((a,b)=>a-b);for(let i=0;i+1<xs.length;i+=2)for(let x=Math.ceil(xs[i]);x<=xs[i+1];x++)dot(x,y,c);}};
 return {w,h,b,dot,rect,disc,line,poly,save(file){fs.writeFileSync(path.join(OUT,file),png(w,h,b));}};
}
let state=902711;
const rnd=()=>{state=(1664525*state+1013904223)>>>0;return state/4294967296;};
function plate(c,ox=0,oy=0,w=64,h=64){
 const pts=[[7+ox,8+oy],[24+ox,5+oy],[31+ox,9+oy],[46+ox,6+oy],[57+ox,15+oy],[51+ox,28+oy],[60+ox,37+oy],[50+ox,57+oy],[29+ox,54+oy],[17+ox,60+oy],[6+ox,48+oy],[10+ox,32+oy],[4+ox,23+oy]];
 c.poly(pts,3);c.poly(pts.map(([x,y])=>[x+2,y-2]),5);
 for(let j=0;j<75;j++){const x=7+rnd()*49,y=9+rnd()*45;if(x>10&&x<54&&y>11&&y<54){c.dot(x,y,rnd()<.5?4:6);}}
 c.line(13,17,28,21,2,1);c.line(28,21,32,31,1,2);c.line(32,31,46,39,1,1);c.line(45,12,40,21,2);c.line(40,21,49,26,1);
 [[14,13],[50,18],[19,49],[48,49]].forEach(([x,y])=>{c.disc(x,y,3,1);c.disc(x-1,y-1,1,8);});
}
function drawShape(id,c,f=0){
 const x=32,y=32;
 if(['plate','shoulder','boot','crown'].includes(id)){plate(c);if(id==='crown'){c.rect(17,8,28,5,7);}if(id==='boot')c.rect(8,50,42,6,2);}
 else if(id==='gear'){for(let k=0;k<12;k++){const a=k*Math.PI/6;c.rect(x+22*Math.cos(a)-4,y+22*Math.sin(a)-4,8,8,4);}c.disc(x,y,23,2);c.disc(x,y,18,5);c.disc(x,y,11,1);c.disc(x,y,7,3);c.disc(x,y,3,8);for(let k=0;k<6;k++){const a=k*Math.PI/3;c.line(x+11*Math.cos(a),y+11*Math.sin(a),x+19*Math.cos(a),y+19*Math.sin(a),7,2);}}
 else if(id==='cable'||id==='wire'){for(let j=0;j<5;j++){const yy=10+j*10,xx=30+Math.sin(j*.8+f)*8;c.line(32,yy,xx,yy+7,id==='wire'?10:2,3);c.disc(xx,yy+7,4,id==='wire'?11:5);c.disc(xx,yy+7,2,0);}}
 else if(id==='slit'){c.rect(14,6,36,52,1);for(let j=0;j<4;j++){c.rect(19,9+j*12,26,7,5);c.rect(22,10+j*12,20,5,8);c.rect(26,11+j*12,12,3,9);}}
 else if(id==='core'){c.rect(18,7,28,49,2);c.rect(22,9,20,45,3);c.rect(25,12,14,39,5);c.rect(28,16,8,30,8);c.rect(30,20,4,21,9);c.rect(18,7,28,4,7);c.rect(17,52,30,4,1);}
 else if(id==='lens'){c.disc(x,y,28,1);c.disc(x,y,24,4);c.disc(x,y,19,6);c.disc(x,y,14,1);c.disc(x,y,9,8);c.disc(x,y,5,9);c.disc(x-4,y-6,3,9);}
 else if(id==='orb'){c.disc(x,y,15,6);c.disc(x,y-4,13,7);c.disc(x,y-4,9,8);c.disc(x-2,y-6,6,9);c.rect(27,46,10,9,5);c.dot(15,16,8);c.dot(51,22,6);}
 else if(id==='bolt'||id==='rivet'){c.disc(x,y,23,1);c.disc(x,y,19,3);c.disc(x,y,14,5);c.line(21,32,43,32,1,3);c.dot(23,29,9);}
 else if(id==='panel'){plate(c);c.line(9,49,44,21,8,5);c.line(17,53,52,25,7,5);}
 else if(id==='piston'){c.rect(19,7,26,50,1);c.rect(24,12,16,42,4);c.rect(29,17,6,28,8);c.disc(32,11,8,3);c.disc(32,52,8,3);c.disc(32,11,3,9);c.disc(32,52,3,9);}
 else if(id==='exhaust'){c.rect(14,8,34,47,1);c.rect(19,14,24,38,4);for(let j=0;j<5;j++)c.rect(23,18+j*7,16,3,j%2?2:7);}
 else if(id==='stripe'){c.rect(7,7,50,50,4);for(let j=-34;j<65;j+=17)c.line(8+j,54,32+j,11,8,5);}
 else if(id==='connector'){c.disc(32,32,26,1);c.disc(32,32,20,4);c.disc(32,32,11,2);for(let j=0;j<4;j++)c.rect(17+j*9,29,4,6,7);}
 else if(id==='band'){c.rect(7,24,50,16,2);c.rect(10,27,44,10,5);for(let j=0;j<6;j++)c.rect(14+j*7,29,3,6,7);}
 else if(id==='arc'||id==='spark'){let xx=12;for(let j=0;j<7;j++){let nx=xx+6,yy=30+Math.sin(j*2+f)*15,ny=30+Math.sin((j+1)*2+f)*15;c.line(xx,yy,nx,ny,11,3);c.line(xx,yy-1,nx,ny-1,9,1);xx=nx;}c.dot(16,14,9);c.dot(46,52,10);}
 else if(id==='smoke'){for(let j=0;j<5;j++){const yy=52-j*9,xx=25+Math.sin(j+f)*9;c.disc(xx,yy,5+j%3,1+j%2);c.dot(xx-1,yy-2,10);}}
 else {c.rect(8,8,48,48,4);c.rect(12,12,40,40,5);}
}
const tex=canvas(128,128);
for(let y=0;y<128;y++)for(let x=0;x<128;x++){const n=rnd();tex.dot(x,y,n<.12?2:n<.28?3:n<.62?4:n<.86?5:6);}
for(let j=0;j<22;j++){const x=rnd()*128,y=rnd()*128;tex.line(x,y,x+2+rnd()*21,y+2+rnd()*19,1,1);}
for(let j=0;j<30;j++){const x=rnd()*128,y=rnd()*128;tex.disc(x,y,2,2);tex.dot(x-1,y-1,7);}tex.save('textures/rust.png');
const metal=canvas(64,64);for(let y=0;y<64;y++)for(let x=0;x<64;x++)metal.dot(x,y,(x+y)%11<3?2:(x%17===0?7:3));for(let j=0;j<12;j++)metal.line(4,j*5,60,j*5,1,1);metal.save('textures/metal.png');
const emit=canvas(64,64);emit.rect(0,0,64,64,0);emit.rect(30,0,3,64,8);emit.rect(0,29,64,4,8);emit.save('textures/glow_emit.png');
const rustEmit=canvas(128,128);rustEmit.save('textures/rust_emit.png');
const textureFiles=['textures/rust.png','textures/metal.png','textures/glow_emit.png','textures/rust_emit.png'];
const drawNames=['plate','shoulder','boot','crown','gear','cable','wire','slit','core','lens','orb','bolt','rivet','panel','piston','exhaust','stripe','connector','band','arc','spark','smoke'];
for(const name of drawNames){const c=canvas(64,64);drawShape(name,c);c.save('parts/'+name+'.png');}
for(const name of ['arc','spark','smoke']){
 const c=canvas(256,32);
 for(let frame=0;frame<8;frame++){
  const tile=canvas(32,32);
  if(name==='arc'||name==='spark'){
   let yy=12+frame%5;
   for(let j=0;j<5;j++){const nx=3+j*6,ny=6+((j*7+frame*3)%20);if(j)c.line(frame*32+3+(j-1)*6,yy,frame*32+nx,ny,11,2);yy=ny;}
   c.dot(frame*32+4+(frame%4),22-frame%5,9);
  }else{
   for(let j=0;j<5;j++){const xx=frame*32+9+((frame+j*5)%14),yy=28-j*5;c.disc(xx,yy,2+(j%3),j%2?10:2);}
  }
  // Identical sheet frames are forbidden; frame-specific pixel anchors.
  c.dot(frame*32+8+frame,3,9);
 }
 c.save('sheets/'+name+'.png');
}
function a(type,extra={}){
 const i=++a.n;return {type,freq:+(.22+(i%65)*.093).toFixed(4),phase:+((i*.07319)%1).toFixed(5),amp:.07,...extra};
}a.n=0;
const parts=[];
function put(id,kind,layer,bone,img,offset,size,anims=[],opts={}){
 parts.push({id,kind,layer,bone,file:img.startsWith('sheets/')?img:'parts/'+img+'.png',
 size,pivot:[.5,.5],offset,rotation:opts.rotation||[0,0,0],depth:opts.depth||3,
 material:opts.material||'rust',anim:anims,...(layer==='3d'?{primitive:opts.primitive||'box',dims:opts.dims||[size[0],size[1],.12]}:{})});
}
const back=.37;
put('skull-shell','plate','3d','head','plate',[0,0,0],[.74,.74],[a('bob',{amp:.01})],{primitive:'sphere',dims:[.75,.75,.75]});
put('torso-casing','plate','3d','body','panel',[0,0,0],[.66,.8],[a('pulse',{pulseLink:.45})],{dims:[.62,.78,.51]});
for(const s of [-1,1]){
 const side=s<0?'L':'R';
 put('upper-arm-'+side,'piston','3d','arm'+side,'piston',[0,-.27,0],[.19,.49],[a('swing',{amp:.03,inertia:.12,speedLink:.8})],{primitive:'cylinder',dims:[.20,.54,.2]});
 put('shin-'+side,'piston','3d','leg'+side,'piston',[0,-.3,0],[.19,.5],[a('bob',{amp:.012,speedLink:1.2})],{primitive:'cylinder',dims:[.19,.55,.19]});
}
put('crown-antenna','orb','3d','antenna','orb',[0,.07,0],[.16,.16],[a('pulse',{pulseLink:.65})],{primitive:'sphere',dims:[.15,.15,.15],material:'glow'});
put('rear-engine','gear','3d','body','gear',[0,.10,.34],[.36,.36],[a('rotate',{speedLink:.5})],{primitive:'cylinder',dims:[.29,.12,.12],rotation:[Math.PI/2,0,0]});
put('chest-plating','plate','2.5d','body','plate',[-.06,.17,-.3],[.57,.41],[a('flap',{amp:.024})]);
put('open-furnace','core','2.5d','body','core',[0,-.12,-.316],[.19,.43],[a('pulse',{pulseLink:1.8})],{material:'glow',depth:2});
put('chest-gear-large','gear','2.5d','body','gear',[.19,.15,-.33],[.26,.26],[a('rotate',{speedLink:.9})]);
put('chest-gear-small','gear','2.5d','body','gear',[-.26,.08,-.32],[.13,.13],[a('rotate',{speedLink:.65})]);
put('body-status-slits','slit','2.5d','body','slit',[-.23,.29,-.33],[.13,.19],[a('flicker',{pulseLink:.7})],{material:'glow'});
put('lower-warning-panel','panel','2.5d','body','panel',[.05,-.34,-.31],[.48,.25],[a('flap',{amp:.04,speedLink:.8})]);
put('left-armor','plate','2.5d','armL','shoulder',[-.05,-.12,-.145],[.28,.36],[a('swing',{inertia:.3,speedLink:1})]);
put('right-armor','plate','2.5d','armR','plate',[.05,-.13,-.146],[.27,.38],[a('flap',{amp:.035})]);
put('left-shoulder-bolt','bolt','2.5d','armL','bolt',[0,-.05,-.16],[.12,.12],[a('rotate')]);
put('right-shoulder-gear','gear','2.5d','armR','gear',[0,-.04,-.17],[.15,.15],[a('rotate',{clockwise:false})]);
put('left-arm-chain','cable','2.5d','armL','cable',[-.13,-.28,-.08],[.13,.35],[a('chain',{segments:5,lag:.83,amp:.038,speedLink:1.1})],{depth:5,material:'metal'});
put('right-arm-chain','cable','2.5d','armR','wire',[.13,-.28,-.08],[.14,.35],[a('chain',{segments:5,lag:.69,amp:.04,speedLink:1.1})],{depth:5,material:'metal'});
put('left-knee','plate','2.5d','legL','plate',[-.02,-.13,-.15],[.23,.25],[a('flap',{amp:.015})]);
put('right-knee','plate','2.5d','legR','plate',[.02,-.12,-.15],[.23,.27],[a('bob',{amp:.02,speedLink:.8})]);
put('left-piston-cap','piston','2.5d','legL','piston',[0,-.38,-.16],[.13,.29],[a('bob',{amp:.02})]);
put('right-piston-cap','piston','2.5d','legR','piston',[0,-.38,-.16],[.14,.29],[a('bob',{amp:.023})]);
put('left-rusted-boot','plate','2.5d','legL','boot',[-.015,-.57,-.07],[.25,.12],[a('swing',{amp:.016,speedLink:.6})]);
put('right-rusted-boot','plate','2.5d','legR','boot',[.015,-.57,-.07],[.25,.12],[a('swing',{amp:.012,speedLink:.7})]);
put('forehead-shard','plate','2.5d','head','crown',[-.02,.19,-.345],[.5,.24],[a('flap',{amp:.011})]);
put('broken-face','plate','2.5d','head','plate',[-.1,-.12,-.341],[.48,.27],[a('flap',{amp:.018})]);
put('eye-ring','lens','2.5d','head','lens',[.12,-.035,-.379],[.28,.28],[a('pulse',{pulseLink:1.3})],{depth:2});
put('head-side-gear','gear','2.5d','head','gear',[-.27,-.11,-.28],[.18,.18],[a('rotate',{clockwise:false})]);
put('head-wiring','cable','2.5d','head','wire',[.3,-.17,-.16],[.16,.27],[a('swing',{inertia:.3,speedLink:.4})],{material:'metal'});
put('rear-scarred-helmet','plate','2.5d','head','plate',[0,.01,back],[.48,.47],[a('flap',{amp:.011})]);
put('rear-power-panel','panel','2.5d','body','panel',[0,-.08,.29],[.4,.42],[a('bob',{amp:.012})]);
put('rear-vents','slit','2.5d','body','exhaust',[-.24,.23,.3],[.16,.23],[a('flicker',{pulseLink:1.3})],{material:'glow'});
put('back-cable-l','cable','2.5d','armL','cable',[-.11,-.33,.1],[.15,.34],[a('swing',{speedLink:.4})]);
put('back-cable-r','cable','2.5d','armR','cable',[.1,-.32,.11],[.15,.34],[a('swing',{speedLink:.4})]);
put('rear-leg-hatch','panel','2.5d','legR','stripe',[0,-.27,.14],[.17,.29],[a('flap',{amp:.015})]);
put('head-top-beacon','orb','2d','head','orb',[0,.72,0],[.19,.19],[a('bob',{amp:.038}),a('pulse',{pulseLink:1.5})],{material:'glow'});
put('beacon-dot-1','orb','2d','head','orb',[0,.49,0],[.065,.07],[a('bob',{amp:.04})],{material:'glow'});
put('beacon-dot-2','orb','2d','head','orb',[0,.33,0],[.045,.05],[a('bob',{amp:.02})],{material:'glow'});
put('arc-head','arc','2d','head','sheets/arc.png',[.38,.04,-.14],[.37,.22],[a('flipbook',{frames:8,fps:12,duty:.65,pulseLink:1.5})],{material:'glow'});
put('arc-right-hand','arc','2d','armR','sheets/spark.png',[.21,-.46,-.13],[.32,.3],[a('flipbook',{frames:8,fps:15,duty:.8,pulseLink:1.6})],{material:'glow'});
put('arc-left-hand','arc','2d','armL','sheets/arc.png',[-.22,-.47,-.13],[.26,.27],[a('flipbook',{frames:8,fps:17,duty:.77,pulseLink:1.7})],{material:'glow'});
put('steam-spurt','smoke','2d','head','sheets/smoke.png',[-.27,.22,.12],[.27,.24],[a('flipbook',{frames:8,fps:9,duty:.8})],{material:'glow'});
put('ember-left','orb','2d','body','spark',[-.28,-.24,-.2],[.08,.09],[a('orbit',{amp:.1}),a('pulse',{pulseLink:.5})],{material:'glow'});
put('ember-right','orb','2d','body','spark',[.28,-.21,-.2],[.08,.09],[a('orbit',{amp:.08})],{material:'glow'});
put('chest-leak','slit','2d','body','slit',[0,-.26,-.36],[.09,.2],[a('flicker',{pulseLink:.8})],{material:'glow'});
put('rear-lamp','orb','2d','body','orb',[.15,.15,.33],[.11,.11],[a('pulse',{pulseLink:.4})],{material:'glow'});
const used=new Set(parts.map(x=>x.file));used.add('textures/rust.png');used.add('textures/metal.png');used.add('textures/glow_emit.png');used.add('textures/rust_emit.png');
for(const name of drawNames){const p=path.join(OUT,'parts',name+'.png');if(!used.has('parts/'+name+'.png'))fs.rmSync(p);}
const manifest={format:'meta6-skin/1',name:'rusty-robot',reference:'reference.png',palette:P,
 hideBase:['head','body','armL','armR','legL','legR'],
 materials:{rust:{rough:.94,metal:.26},metal:{rough:.72,metal:.68},glow:{emissive:'#ffbf69',blend:'additive'}},
 textures:[{id:'head-rust',file:'textures/rust.png',emit:'textures/rust_emit.png',uv:'sphere',material:'rust',apply:'antenna'},
 {id:'metal',file:'textures/metal.png',uv:'cyl',material:'metal',apply:'root'},
 {id:'luminescent',file:'textures/glow_emit.png',uv:'plane',material:'glow',apply:'root'}],parts};
fs.writeFileSync(path.join(OUT,'skin.json'),JSON.stringify(manifest,null,2)+'\n');
fs.writeFileSync(path.join(OUT,'README.md'),[
 '# Rusty Robot — META GAMES meta6-skin/1',
 'Скины — 3D-накладки, 2.5D-плоскости и фронтальные 2D-свечения; 45+ деталей с волной фаз.',
 'Деталь | kind | кость | слой | анимация | цвет',
 'Шлем, трещины, макушка | plate | head | 3d / 2.5d | bob/flap | ржаво-оранжевый',
 'Корпус, задняя крышка | plate/panel | body | 3d / 2.5d | pulse/bob | медный',
 'Шестерни головы/груди/спины | gear | head/body | 2.5d/3d | rotate | буро-оранжевый',
 'Сердечник, щели, глаз | core/slit/lens | body/head | 2.5d | pulse/flicker | золотой',
 'Плечи, поршни, ноги | plate/piston/bolt | armL/armR/legL/legR | 3d/2.5d | swing/bob | ржа',
 'Кабели и дуги | cable/arc | руки/head | 2.5d/2d | chain/flipbook | голубой/фиолетовый',
 'Парящий огонёк, искры, пар | orb/smoke | head/body | 2d | bob/orbit/flipbook | янтарный',
 ].join('\n')+'\n');
console.log('Generated',parts.length,'parts, palette',P.length,'textures and flipbooks in',OUT);

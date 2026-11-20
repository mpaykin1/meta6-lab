'use strict';
/* =====================================================================
   НЕБЕСНЫЙ ПИЛОТ v4 — три мира в спрайт-стакинге
   ВОЗДУХ (острова, сломанный город) → КОСМОС (Земля-шарик) → ГЛУБИНА (батискаф)
   Основа — v2/v3 (камера-режиссёр, острова, облака, самолёт, враги).
   Ассеты: враги «Пепельного пути» (a8cc7bde…), стопки «Затонувшего города»
   (2beff885…: батискаф, руины, кораллы, рыбы), шейдер домов «Сломанного
   города» (c7b60983…) перенесён в срезы.
   ===================================================================== */
const glc=document.getElementById('gl'),cv=document.getElementById('c'),g=cv.getContext('2d');
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,w|0);c.height=Math.max(1,h|0);return c};
const TAU=Math.PI*2,clamp=(v,a,b)=>v<a?a:v>b?b:v,ease=(k,dt)=>1-Math.exp(-k*dt),lerp=(a,b,k)=>a+(b-a)*k,sstep=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const angD=(a,b)=>{let d=(a-b)%TAU;if(d>Math.PI)d-=TAU;if(d<-Math.PI)d+=TAU;return d};
const rnd=(a,b)=>a+Math.random()*(b-a);
function hash(x,y,s){let h=(Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(s,1442695041))|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296}
function rng(seed){let s=(seed>>>0)||1;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296}}

const SEABED=-440,SPACE0=650,SPACE1=1350,ZMAX=1750;
let PX=2,W=0,H=0,F=300,vign=null;

/* ---------------- GPU: море, небо, глубина, космос ---------------- */
const gl=glc.getContext('webgl',{antialias:false,alpha:false,powerPreference:'high-performance'});
let U={};
if(gl){
  const vs='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const fs=`precision highp float;
uniform vec2 uRes,uC,uPC;uniform vec3 uT;uniform float uA,uPhi,uDist,uF,uTime,uRoll,uSpace,uUnder,uPR,uRot,uDark;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
float fb(vec2 p){return vn(p)*.55+vn(p*2.1+3.)*.28+vn(p*4.3+7.)*.17;}
void main(){
  vec2 s=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y);
  vec2 o=s-uC;float cr=cos(uRoll),sr=sin(uRoll);
  o=vec2(o.x*cr+o.y*sr,-o.x*sr+o.y*cr);
  float px=o.x/uF,py=-o.y/uF,cp=cos(uPhi),sp=sin(uPhi);
  float dz=-sp+py*cp,df=cp+py*sp,ca=cos(uA),sa=sin(uA);
  vec3 col;
  if(uUnder>.5){
    /* --- под водой: дно, потолок-поверхность, лучи --- */
    float depthK=clamp(-uT.z/440.,0.,1.);
    vec3 fogc=mix(vec3(.07,.36,.5),vec3(.01,.06,.12),depthK);
    float camZ=uT.z+uDist*sp;
    if(dz<-.003){
      float t=(camZ-(${SEABED.toFixed(1)}))/(-dz);float X=t*px,Yf=-uDist*cp+t*df;
      vec2 w=vec2(uT.x+ca*X+sa*Yf,uT.y+sa*X-ca*Yf);vec2 q=floor(w/1.6);
      float n=fb(q*.03);vec3 sand=mix(vec3(.16,.2,.2),vec3(.33,.36,.3),n);
      float rip=sin(q.x*.35+n*6.)*.5+.5;sand*=.85+.2*step(.82,rip);
      float cau=pow(abs(sin((w.x+uTime*9.)*.06+fb(w*.01+uTime*.05)*6.)*sin((w.y-uTime*7.)*.05+fb(w*.012)*5.)),3.);
      sand+=vec3(.25,.45,.45)*cau*(1.-depthK*.6);
      col=mix(sand,fogc,smoothstep(120.,1100.,t));
    }else{
      float t=(-camZ)/max(dz,.003);float X=t*px,Yf=-uDist*cp+t*df;vec2 w=vec2(uT.x+ca*X+sa*Yf,uT.y+sa*X-ca*Yf);
      float sh=fb(w*.02+vec2(uTime*.2,uTime*.13));vec3 surf=mix(vec3(.3,.65,.8),vec3(.85,.98,1.),smoothstep(.55,.8,sh));
      col=mix(surf,fogc,smoothstep(80.,900.,t));
    }
    float ray=pow(max(0.,sin(s.x*.04+sin(s.y*.01+uTime*.4)*2.+uTime*.3)),8.)*(1.-depthK)*.18;
    col+=vec3(.5,.8,.8)*ray;col*=1.-uDark*.55;
    gl_FragColor=vec4(col,1.);return;
  }
  vec3 haze=vec3(.80,.89,.98);
  if(dz>-.004){float e=clamp((dz+.004)*2.2,0.,1.);
    vec3 sky=mix(haze,vec3(.30,.56,.93),pow(e,.55));
    float cl=vn(vec2(px*6.+uA*3.,py*14.)+uTime*.01);sky=mix(sky,vec3(.95,.97,1.),smoothstep(.62,.9,cl)*.35*(1.-e));
    col=sky;
  }else{
    float camZ=uT.z+uDist*sp,t=camZ/(-dz);
    float X=t*px,Yf=-uDist*cp+t*df;
    vec2 w=vec2(uT.x+ca*X+sa*Yf,uT.y+sa*X-ca*Yf);
    vec2 q=floor(mod(w,8192.)/max(1.,floor(1.+uT.z/500.)))*max(1.,floor(1.+uT.z/500.));
    float n=vn(q*.011)*.55+vn(q*.037+3.)*.3+vn(q*.004+9.)*.15;
    col=mix(vec3(.06,.28,.72),vec3(.13,.42,.88),n);
    vec2 qw=q+vec2(floor(uTime*4.),floor(uTime*1.5));
    vec2 c=floor(qw/vec2(20.,5.));float r=h(c);vec2 fq=mod(qw,vec2(20.,5.));
    float dash=step(r,.38)*step(fq.y,1.)*step(fq.x,4.+r*26.);
    col=mix(col,col*1.28+.04,dash*.75*(1.-clamp(uT.z/600.,0.,1.)));
    vec2 c2=floor(q/vec2(11.,7.));float r2=h(c2+17.),tw=sin(uTime*3.+r2*40.);
    float sk=step(.84,r2)*step(.55,tw)*step(mod(q.y,7.),.5)*step(mod(q.x,11.),2.5);
    col=mix(col,vec3(1.),sk*.9*(1.-clamp(uT.z/400.,0.,1.)));
    float fog=smoothstep(380.+uT.z*2.,2600.+uT.z*4.,t);col=mix(col,haze,fog);
  }
  if(uSpace>.001){
    /* --- космос: Земля превращается в шарик --- */
    vec2 d=s-uPC;float r=length(d);
    float inside=1.-smoothstep(uPR-1.5,uPR+1.5,r);
    vec3 pn=vec3(d/uPR,sqrt(max(0.,1.-dot(d,d)/(uPR*uPR))));
    float lon=atan(pn.x,pn.z)+uRot,lat=asin(clamp(-pn.y,-1.,1.));
    vec2 uv=vec2(lon*2.2,lat*2.6);float land=fb(uv*1.6+3.),cld=fb(uv*3.+vec2(uTime*.03,0.));
    vec3 pl=mix(vec3(.05,.25,.65),vec3(.12,.45,.85),fb(uv*5.));
    pl=mix(pl,mix(vec3(.85,.78,.5),vec3(.25,.6,.25),smoothstep(.62,.7,land)),smoothstep(.58,.62,land));
    pl=mix(pl,vec3(1.),smoothstep(.6,.8,cld)*.7);
    float lit=.18+.82*max(dot(pn,normalize(vec3(-.55,-.45,.7))),0.);pl*=lit;
    pl=mix(pl,vec3(.45,.7,1.),pow(1.-pn.z,3.)*.6);
    vec3 inner=mix(col,pl,smoothstep(.42,.8,uSpace));
    vec2 sq=floor(s/2.);float st=step(.992,h(sq+floor(uRot*30.)))*(.5+.5*sin(uTime*2.+h(sq)*40.));
    vec3 spc=vec3(.01,.012,.035)+vec3(.9,.92,1.)*st+vec3(.08,.03,.12)*fb(s*.004+uRot);
    float rim=exp(-abs(r-uPR)/(5.+uPR*.035));
    vec3 sc=mix(spc,inner,inside)+vec3(.3,.6,1.)*rim*.9;
    col=mix(col,sc,smoothstep(0.,.12,uSpace));
  }
  gl_FragColor=vec4(col,1.);
}`;
  const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))console.error(gl.getShaderInfoLog(o));return o};
  const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,vs));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pr);gl.useProgram(pr);
  const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  for(const n of['uRes','uC','uPC','uT','uA','uPhi','uDist','uF','uTime','uRoll','uSpace','uUnder','uPR','uRot','uDark'])U[n]=gl.getUniformLocation(pr,n);
}

function resize(){
  PX=innerWidth<700?2:3;W=Math.ceil(innerWidth/PX);H=Math.ceil(innerHeight/PX);F=Math.min(W,H)*1.05+Math.max(W,H)*0.15;
  for(const c of[cv,glc]){c.width=W;c.height=H}
  g.imageSmoothingEnabled=false;if(gl)gl.viewport(0,0,W,H);
  vign=mk(W,H);const v=vign.getContext('2d');
  const rg=v.createRadialGradient(W/2,H/2,Math.min(W,H)*0.35,W/2,H/2,Math.hypot(W,H)*0.62);
  rg.addColorStop(0,'rgba(4,14,40,0)');rg.addColorStop(1,'rgba(4,14,40,.5)');v.fillStyle=rg;v.fillRect(0,0,W,H);
}
addEventListener('resize',resize);resize();

/* ---------------- острова (v2) + сломанный город ---------------- */
function blobR(t,R,ph,amp){return R*(1+amp*(0.16*Math.sin(3*t+ph[0])+0.09*Math.sin(5*t+ph[1])+0.05*Math.sin(9*t+ph[2])+0.025*Math.sin(17*t+ph[0]*2)))}
function blob(x,cx,cy,R,ph,amp){x.beginPath();for(let i=0;i<=56;i++){const t=i/56*TAU;const r=blobR(t,R,ph,amp);const px=cx+Math.cos(t)*r,py=cy+Math.sin(t)*r;i?x.lineTo(px,py):x.moveTo(px,py)}x.closePath()}
const TIERS=[[1.0,'#f2dc98','#c6a85e',2],[0.9,'#66c453','#3c8633',3],[0.72,'#55b045','#33772c',3],[0.53,'#489c3c','#2b6627',3],[0.33,'#909c88','#5a6357',3],[0.17,'#c4ccba','#7b8476',2]];
// палитра «Сломанного города» (c0 #060b15, c1 #0e2334, c2 #2a7e8b, c3 #9cf6ea, янтарь #ffb13b)
const CTIERS=[[1.0,'#3a4a4f','#1d2a30',2],[0.92,'#1b2f3b','#0e2334',3],[0.8,'#22394a','#0e2334',2]];
function buildIsland(seed,city){
  const r=rng(seed),R=city?95+r()*80:50+r()*115,ph=[r()*6,r()*6,r()*6],size=Math.ceil(R*2.95);
  const T=city?CTIERS:TIERS,nT=city?3:(R<75?4:R<120?5:6),tiers=[];
  let ox=0,oy=0,z=0;
  for(let i=0;i<nT;i++){const [k,top,side,h]=T[i];const p2=ph.map(p=>p+(r()-.5)*0.9*i);
    if(!city){ox+=(r()-.5)*R*0.12;oy+=(r()-.5)*R*0.12}const amp=city?1+i*0.05:1+i*0.18;
    z+=h*1.6;tiers.push({k,p2,amp,ox,oy,ztop:z,h,top,side,L:null,D:null})}
  const isl={seed,R,ph,size,tiers,a:r()*TAU,city,peak:[ox,oy,z],top:z,bld:[],sh:null};
  if(city){const n=7+(r()*7|0);
    for(let i=0;i<n;i++){let bx,by,ok=false;for(let tr=0;tr<12&&!ok;tr++){const a=r()*TAU,d=Math.sqrt(r())*R*0.62;bx=Math.cos(a)*d;by=Math.sin(a)*d;
        ok=isl.bld.every(b=>Math.hypot(b.lx-bx,b.ly-by)>(b.w+26)*0.75)}
      if(!ok)continue;const w=18+r()*18|0,d=18+r()*18|0,h=(40+r()*r()*130)|0;
      isl.bld.push({lx:bx,ly:by,w,d,h,yaw:r()*TAU,lean:[(r()-.5)*0.35,(r()-.5)*0.35],seed:(r()*1e9)|0,img:null})}}
  return isl;
}
function islandCanvases(isl){if(isl.sh)return;const r=rng(isl.seed+7),R=isl.R,ph=isl.ph,size=isl.size,half=size/2,city=isl.city;
  const sh=mk(size,size),sx=sh.getContext('2d');
  sx.fillStyle='rgba(90,200,250,.42)';blob(sx,half,half,R*1.32,ph,1.1);sx.fill();
  sx.fillStyle='rgba(160,235,255,.38)';blob(sx,half,half,R*1.13,ph,1.05);sx.fill();isl.sh=sh;
  isl.tiers.forEach((tr,i)=>{const L=mk(size,size),D=mk(size,size);const{ox,oy,k,p2,amp}=tr;
    for(const [c,col] of [[L,tr.top],[D,tr.side]]){const x=c.getContext('2d');x.fillStyle=col;blob(x,half+ox,half+oy,R*k,p2,amp);x.fill()}
    const x=L.getContext('2d');x.save();blob(x,half+ox,half+oy,R*k,p2,amp);x.clip();
    if(!city&&i>=1&&i<=3){const n=R*k*0.9;for(let j=0;j<n;j++){const a=r()*TAU,d=Math.sqrt(r())*R*k;
        x.fillStyle=r()<.55?'rgba(18,70,28,.5)':'rgba(170,235,120,.35)';x.fillRect((half+ox+Math.cos(a)*d)|0,(half+oy+Math.sin(a)*d)|0,2,2)}}
    if(city&&i>=1){x.strokeStyle='rgba(156,246,234,.12)';x.lineWidth=1;for(let j=0;j<10;j++){x.beginPath();const a=r()*TAU;x.moveTo(half+Math.cos(a)*R,half+Math.sin(a)*R);x.lineTo(half-Math.cos(a)*R,half-Math.sin(a)*R);x.stroke()}
      for(let j=0;j<R*0.6;j++){x.fillStyle=r()<.5?'rgba(6,11,21,.5)':'rgba(42,126,139,.25)';x.fillRect(half+(r()-.5)*R*2|0,half+(r()-.5)*R*2|0,1+r()*3|0,1)}}
    x.restore();
    if(i===0){x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=1.5;blob(x,half,half,R*1.02,ph,1);x.stroke()}
    tr.L=L;tr.D=D})}
// высота земли острова в точке (по тем же формам, что рисуются)
function islandGround(isl,x,y){const c=Math.cos(-isl.a),s=Math.sin(-isl.a),dx=x-isl.x,dy=y-isl.y,lx=dx*c-dy*s,ly=dx*s+dy*c;
  if(lx*lx+ly*ly>isl.R*isl.R*1.7)return 0;let gz=0;
  for(const tr of isl.tiers){const qx=lx-tr.ox,qy=ly-tr.oy,t=Math.atan2(qy,qx);if(Math.hypot(qx,qy)<blobR(t,isl.R*tr.k,tr.p2,tr.amp))gz=tr.ztop;else break}return gz}

/* дом «Сломанного города»: окна по сетке, редкие янтарные огни, бирюзовый край, обрушенная крыша */
const _cc=new Map(),_cx=mk(1,1).getContext('2d',{willReadFrequently:true});
function rgbOf(c){let v=_cc.get(c);if(v)return v;_cx.clearRect(0,0,1,1);_cx.fillStyle=c;_cx.fillRect(0,0,1,1);const d=_cx.getImageData(0,0,1,1).data;v=[d[0],d[1],d[2],d[3]];_cc.set(c,v);return v}
function buildingImg(b){const r=rng(b.seed),Wp=Math.max(6,Math.round(b.w/1.6)),Dp=Math.max(6,Math.round(b.d/1.6)),Hs=Math.round(b.h/1.6);
  const c=mk(Wp*Hs,Dp),x=c.getContext('2d'),id=x.createImageData(Wp*Hs,Dp),px=id.data,gr=(i,j)=>hash(i,j,b.seed&1023);
  const crumb=[];for(let k=0;k<3;k++)crumb.push([r()*Wp|0,r()*Dp|0,2+r()*Wp*0.5|0,Hs-(4+r()*Hs*0.25|0)]);
  const cut=(i,j,s)=>{for(const q of crumb)if(s>q[3]&&Math.abs(i-q[0])+Math.abs(j-q[1])<q[2]*(s-q[3])/(Hs-q[3]+1)*2)return true;return false};
  const put=(X,Y,R,G,B)=>{const o=(Y*Wp*Hs+X)*4;px[o]=R;px[o+1]=G;px[o+2]=B;px[o+3]=255};
  for(let s=0;s<Hs;s++){const ox=s*Wp,top=s===Hs-1;
    for(let i=0;i<Wp;i++)for(let j=0;j<Dp;j++){if(cut(i,j,s))continue;
      const edge=i===0||j===0||i===Wp-1||j===Dp-1,above=!top&&!cut(i,j,s+1);
      if(!edge&&above){put(ox+i,j,6,11,21);continue}
      if(!above||top){const gm=gr(i,j);if(i%7===3&&j%5===2&&gm>.9)put(ox+i,j,156,246,234);else if(gm<.08)put(ox+i,j,42,126,139);else if(gm<.5)put(ox+i,j,28,46,56);else put(ox+i,j,22,37,46);continue}
      const f=(i===0||i===Wp-1)?j:i,cellx=f%3,celly=s%5,win=cellx===1&&celly>=1&&celly<=3&&s>2;
      const hid=hash((f/3)|0,(s/5)|0,(b.seed&511)+(i===0?1:j===0?2:i===Wp-1?3:4)),lit=win&&hid>.93;
      const side=i===Wp-1?1:j===0?.75:i===0?.55:.45,gm=0.8+0.4*gr(i*7+s,j*3+s);
      if(lit)put(ox+i,j,255,177,59);else if(win)put(ox+i,j,(5+20*side)|0,(12+40*side)|0,(18+46*side)|0);
      else if((i===Wp-1||j===0)&&gr(s,i+j)<.12)put(ox+i,j,42,126,139);
      else put(ox+i,j,(26*side*gm+12)|0,(42*side*gm+16)|0,(50*side*gm+20)|0)}}
  x.putImageData(id,0,0);return {c,Wp,Dp,Hs}}
const bldQueue=[];let bldBudget=0;
function needBld(b){if(b.img)return true;if(!b.q){b.q=1;bldQueue.push(b)}return false}
function runBldQueue(){bldBudget=2;while(bldBudget>0&&bldQueue.length){const b=bldQueue.shift();b.img=buildingImg(b);b.q=0;bldBudget--}}

/* ---------------- облака (v2) ---------------- */
function buildCloud(seed){
  const r=rng(seed),n=3+(r()*5|0),puffs=[];let mx=0;
  for(let i=0;i<n;i++){const pr=8+r()*13,px=(r()-.5)*n*9,py=(r()-.5)*n*5;puffs.push([px,py,pr]);mx=Math.max(mx,Math.hypot(px,py)+pr)}
  const size=Math.ceil(mx*2+6),N=8,sl=[];
  for(let s=0;s<N;s++){const f=Math.pow(Math.sin(Math.PI*(s+1)/(N+1)),0.55),t=s/(N-1);const c=mk(size,size),x=c.getContext('2d');
    x.fillStyle=`rgb(${(196+59*t)|0},${(210+45*t)|0},${(232+23*t)|0})`;
    for(const[px,py,pr]of puffs){x.beginPath();x.arc(size/2+px,size/2+py-t*2,pr*f,0,TAU);x.fill()}sl.push(c)}
  const shd=mk(size,size),y=shd.getContext('2d');y.fillStyle='#021a55';for(const[px,py,pr]of puffs){y.beginPath();y.arc(size/2+px,size/2+py,pr*.92,0,TAU);y.fill()}
  return{size,sl,shd};
}
const CLOUDS=[];for(let i=0;i<10;i++)CLOUDS.push(buildCloud(9001+i*77));

/* ---------------- самолёт: 13 срезов (v2) ---------------- */
const JS=32,JET=[];
(function(){
  const R=(x,c,a,b,w,h)=>{x.fillStyle=c;x.fillRect(a,b,w,h)};
  const wing=(x,c,inset)=>{x.fillStyle=c;x.beginPath();x.moveTo(16,9+inset);x.lineTo(3+inset,22);x.lineTo(3+inset,24);x.lineTo(29-inset,24);x.lineTo(29-inset,22);x.closePath();x.fill()};
  for(let i=0;i<13;i++){const c=mk(JS,JS),x=c.getContext('2d');
    if(i<2){R(x,'#16181f',15,6,3,21)}
    else if(i<4){R(x,'#24262e',14,5,5,23);R(x,'#1c1e25',12,12,9,8);if(i===3)wing(x,'#3a1218',2)}
    else if(i<6){wing(x,i===5?'#8a2630':'#5a1820',0);R(x,'#2d3039',14,4,5,25);R(x,i===5?'#9a2c36':'#5a1820',9,25,15,3);
      if(i===5){R(x,'#ffb347',4,22,2,1);R(x,'#ffb347',27,22,2,1)}}
    else if(i<7){R(x,'#3c3f49',14,4,5,24);R(x,'#b8323c',15,14,3,8)}
    else if(i<9){R(x,'#3c3f49',15,5,3,18);R(x,i===7?'#5fc6ef':'#c8f4ff',15,7,3,i===7?6:3)}
    else{R(x,i===12?'#c23440':'#7a2028',12,22+(i-9),2,6-(i-9));R(x,i===12?'#c23440':'#7a2028',19,22+(i-9),2,6-(i-9))}
    JET.push(c)}
})();
const JSH=mk(JS,JS);{const x=JSH.getContext('2d');x.drawImage(JET[4],0,0);x.drawImage(JET[2],0,0);x.globalCompositeOperation='source-in';x.fillStyle='#02164a';x.fillRect(0,0,JS,JS)}
const RING=mk(40,40);{const x=RING.getContext('2d');const rg=x.createRadialGradient(20,20,6,20,20,20);rg.addColorStop(0,'rgba(255,200,60,0)');rg.addColorStop(.55,'rgba(255,150,20,.35)');rg.addColorStop(1,'rgba(255,160,0,0)');x.fillStyle=rg;x.fillRect(0,0,40,40);x.strokeStyle='#d98a10';x.lineWidth=2.5;x.beginPath();x.arc(20,20,12,0,TAU);x.stroke()}
const GRAIN=(()=>{const c=mk(96,96),x=c.getContext('2d'),r=rng(5);for(let i=0;i<900;i++){x.fillStyle=r()<.5?'#fff':'#000';x.fillRect(r()*96|0,r()*96|0,1,1)}return g.createPattern(c,'repeat')})();

/* ---------------- стопки из ассетов ---------------- */
const A=window.ENEMY_ATLAS,SA=window.SUB_ATLAS;
const IMG={};function loadImg(k,url){const im=new Image();im.src=url;IMG[k]=im}
for(const k in A){loadImg(k,A[k].url);IMG[k].cols=A[k].cols}for(const k in SA){loadImg('s_'+k,SA[k].url);IMG['s_'+k].cols=SA[k].cols}
const SEG=window.WORM_SEGS.map(s=>{const im=new Image();im.src=s.url;return Object.assign({},s,{im})});
// процедурные воксельные стопки: сердце, нитро, ящик оружия, ракета, астероиды, кристаллы
function vstack(W,D,H,fn){const c=mk(W*H,D),x=c.getContext('2d'),id=x.createImageData(W*H,D),p=id.data;for(let s=0;s<H;s++)for(let i=0;i<W;i++)for(let j=0;j<D;j++){const col=fn(i,j,s);if(col){const v=rgbOf(col),o=(j*W*H+s*W+i)*4;p[o]=v[0];p[o+1]=v[1];p[o+2]=v[2];p[o+3]=255}}x.putImageData(id,0,0);return{img:c,W,D,H,F:1}}
const P_HEART=vstack(13,7,12,(i,j,s)=>{const X=(i-6)/6,Y=(11-s)/11*1.25-0.15,Z=(j-3)/3;const hx=Math.abs(X),v=Math.pow(X*X+Y*Y-1+0.2,3)-X*X*Y*Y*Y;
  if(v<=0&&Math.abs(Z)<1.05-0.3*hx){return Z<-.4?'#ff8a8a':s>8?'#ff4d5e':'#d92a3c'}});
const P_NITRO=vstack(9,9,16,(i,j,s)=>{const d=Math.hypot(i-4,j-4);if(s>13&&d<2.2)return '#c8d4e0';if(d<4.2&&s<14)return s%4===1?'#e9f6ff':(i<4?'#3fa9ff':'#1f6fd0');});
const P_CRATE={};for(const [k,c1,c2] of [['spread','#ffd166','#a8742a'],['missile','#ff7a5c','#9e3a2a'],['lightning','#9cf6ea','#2a7e8b']])
  P_CRATE[k]=vstack(11,11,10,(i,j,s)=>{const e=i===0||j===0||i===10||j===10,tb=s===0||s===9;if(e&&(s%3===0||tb))return c2;if(e||tb)return (i+j+s)%4===0?c1:c2;return null});
const P_MISSILE=vstack(14,4,4,(i,j,s)=>{if(i>11&&Math.abs(j-1.5)+Math.abs(s-1.5)<2)return '#e23b3b';if(i<12&&Math.abs(j-1.5)<1.6&&Math.abs(s-1.5)<1.6)return i<2?'#ffb13b':'#c9ced6';if(i<3&&(j===0||j===3||s===0||s===3))return '#5d6470'});
const P_ROCKS=[];for(let v=0;v<4;v++){const r=rng(77+v*13),n=14+(r()*10|0),ph=[r()*6,r()*6,r()*6];
  P_ROCKS.push(vstack(n,n,n,(i,j,s)=>{const c=(n-1)/2,X=(i-c)/c,Y=(j-c)/c,Z=(s-c)/c,a=Math.atan2(Y,X),b=Math.asin(clamp(Z/Math.max(.01,Math.hypot(X,Y,Z)),-1,1));
    const R=0.8+0.12*Math.sin(3*a+ph[0])*Math.cos(2*b+ph[1])+0.08*Math.sin(5*b+ph[2]);if(Math.hypot(X,Y,Z)>R)return null;const k=hash(i,j,s+v*31);
    return k>.93?'#7fe8ff':Z>.4?(k<.5?'#8a8178':'#9b9289'):(k<.5?'#5e5852':'#6d665f')}))}
const P_CRYSTAL=vstack(7,7,12,(i,j,s)=>{const d=Math.abs(i-3)+Math.abs(j-3),r=s<6?s/2:(11-s)/2;if(d<=r)return d<r-1?'#e9fdff':s>6?'#9cf6ea':'#4fc3e0'});

/* общий рисовальщик стопок: 2 проекции на объект, срезы по интерполяции */
let LODB=0;
function drawStackImg(img,Wd,Dd,Hs,frame,x,y,z,yaw,vox,alpha,clipMin,clipMax,cx,cy,flash){
  if(!img||(img.complete===false)||alpha<0.04)return;const zt=z+Hs*vox;const m0=planeT(x,y,z),m1=planeT(x,y,zt);if(!m0||!m1)return;
  const cols=img.cols||Hs,rows=Math.ceil(Hs/cols),k=m0[6];
  const lod=LODB?(k<0.5?3:k<0.9?2:1):(k<0.22?3:k<0.4?2:1),sub=(lod>1||LODB)?1:clamp(Math.ceil(vox*k*pc.cp*0.9),1,3);
  const ccx=cx==null?Wd/2:cx,ccy=cy==null?Dd/2:cy;g.globalAlpha=alpha;
  const one=(s,zz)=>{const u=(zz-z)/(zt-z);g.setTransform(lerp(m0[0],m1[0],u),lerp(m0[1],m1[1],u),lerp(m0[2],m1[2],u),lerp(m0[3],m1[3],u),lerp(m0[4],m1[4],u),lerp(m0[5],m1[5],u));
    g.rotate(yaw);g.scale(vox,vox);g.drawImage(img,(s%cols)*Wd,(frame*rows+((s/cols)|0))*Dd,Wd,Dd,-ccx,-ccy,Wd,Dd)};
  for(let s=0;s<Hs;s+=lod){for(let q=0;q<sub;q++){const zz=z+(s+q/sub)*vox;if(clipMin!=null&&zz<clipMin)continue;if(clipMax!=null&&zz>clipMax)continue;one(s,zz)}}
  if(flash>0){g.globalCompositeOperation='lighter';g.globalAlpha=flash*0.6*alpha;for(let s=0;s<Hs;s+=3){const zz=z+s*vox;if(clipMin!=null&&zz<clipMin)continue;one(s,zz)}g.globalCompositeOperation='source-over'}
  g.globalAlpha=1}
const drawV=(o,x,y,z,yaw,vox,alpha,f)=>drawStackImg(o.img,o.W,o.D,o.H,f||0,x,y,z,yaw,vox,alpha);
const drawS=(k,x,y,z,yaw,vox,alpha,frame,clip)=>{const a=SA[k];drawStackImg(IMG['s_'+k],a.W,a.D,a.H,a.F>1?frame%a.F:0,x,y,z,yaw,vox,alpha,clip)};

/* ---------------- мир ---------------- */
const IC=540,CC=270,islands=new Map();
function islandAt(i,j){const k=i+','+j;let v=islands.get(k);if(v!==undefined)return v;
  v=null;if(hash(i,j,1)<0.5){const city=hash(i,j,6)<0.42;const isl=buildIsland((hash(i,j,2)*1e9)|0,city);isl.x=i*IC+IC*(0.2+hash(i,j,3)*0.6);isl.y=j*IC+IC*(0.2+hash(i,j,4)*0.6);v=isl}
  islands.set(k,v);if(islands.size>900){for(const kk of islands.keys()){islands.delete(kk);if(islands.size<700)break}}return v}
function groundAt(x,y){const i=Math.floor(x/IC),j=Math.floor(y/IC);let gz=0,isl0=null;
  for(let a=i-1;a<=i+1;a++)for(let b=j-1;b<=j+1;b++){const isl=islandAt(a,b);if(!isl)continue;const z=islandGround(isl,x,y);if(z>gz){gz=z;isl0=isl}}return[gz,isl0]}
function bldWorld(isl,b){const c=Math.cos(isl.a),s=Math.sin(isl.a);return[isl.x+b.lx*c-b.ly*s,isl.y+b.lx*s+b.ly*c]}

/* ---------------- камера-режиссёр ---------------- */
const SHOTS=[
  {phi:1.12,dist:230,cy:.58},{phi:1.28,dist:430,cy:.55},{phi:0.86,dist:120,cy:.60},
  {phi:0.42,dist:150,cy:.66},{phi:0.27,dist:105,cy:.70},{phi:0.62,dist:190,cy:.62}];
const ZONE_SHOTS={air:[0,1,2,3,4,5],high:[0,1],space:[0,1,5],sea:[2,5,0],city:[2,3,4,5]};
let P,cam,rings,parts,trails,score,t=0,lastInput=-9,steerIn=0,pitchIn=0,keys={},shot=0,shotT=0,camLock=false,shake=0,combo=0,lastTap=-9,nextAutoRoll=8;
let zone='air',subT=0,spaceS=0,planetRot=0,gameOver=0,overT=0;
const ST={hearts:3,maxHearts:5,nitro:0.5,oxy:1,weapon:'cannon',wT:0,inv:0,hurt:0,toast:null,seen:new Set(['air']),sonar:-9,best:0};try{ST.best=+localStorage.getItem('np_best')||0}catch(e){}
function reset(){P={x:0,y:0,z:60,h:0,v:110,vz:0,steer:0,roll:0,boost:0,barrel:0,rolling:false,nitro:0};
  cam={x:0,y:-20,z:60,a:0,phi:1.12,dist:230,cy:.58,roll:0};rings=[];parts=[];trails=[[],[]];score=0;combo=0;shot=0;shotT=0;zone='air';subT=0;spaceS=0;gameOver=0;
  Object.assign(ST,{hearts:3,nitro:0.5,oxy:1,weapon:'cannon',wT:0,inv:1.5,hurt:0,toast:null});document.getElementById('sc').textContent=0;
  if(window.CB)CB.reset()}
reset();
const fwd=a=>[Math.sin(a),-Math.cos(a)];
let pc={};
function setupProj(){const sa=Math.sin(cam.a),ca=Math.cos(cam.a),sp=Math.sin(cam.phi),cp=Math.cos(cam.phi),cr=Math.cos(cam.roll),sr=Math.sin(cam.roll);
  pc={sa,ca,sp,cp,cr,sr,cx:W/2+(Math.random()-.5)*shake*4,cy:H*cam.cy+(Math.random()-.5)*shake*4}}
function proj(wx,wy,wz){const dx=wx-cam.x,dy=wy-cam.y,dz=wz-cam.z;
  const X=dx*pc.ca+dy*pc.sa,Yf=dx*pc.sa-dy*pc.ca;
  const depth=Yf*pc.cp-dz*pc.sp+cam.dist;if(depth<4)return null;
  const up=Yf*pc.sp+dz*pc.cp,k=F/depth,ox=X*k,oy=-up*k;
  return[pc.cx+ox*pc.cr-oy*pc.sr,pc.cy+ox*pc.sr+oy*pc.cr,k,depth]}
function planeT(x,y,z){const a=proj(x,y,z);if(!a)return null;const b=proj(x+8,y,z),c=proj(x,y+8,z);if(!b||!c)return null;
  return[(b[0]-a[0])/8,(b[1]-a[1])/8,(c[0]-a[0])/8,(c[1]-a[1])/8,a[0],a[1],a[2],a[3]]}
function stackBasis(k,stepU){const q=Math.max(pc.sp,0.55),st=stepU*k*Math.max(pc.cp,0.5);
  return{a:k*pc.cr,b:k*pc.sr,c:-k*q*pc.sr,d:k*q*pc.cr,ux:st*pc.sr,uy:-st*pc.cr}}

function spawnRing(){const[fx,fy]=fwd(P.h),d=280+Math.random()*360,side=(Math.random()-.5)*360;
  rings.push({x:P.x+fx*d-fy*side,y:P.y+fy*d+fx*side,z:30+Math.random()*95,ph:Math.random()*TAU})}

/* ---------------- ввод ---------------- */
let ptr=null;
function barrel(){if(!P.rolling&&zone!=='sea'){P.rolling=true;P.barrel=0;P.boost=Math.min(1.5,P.boost+0.45);shake=Math.max(shake,0.3)}}
addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;initAudio();if(ptr)return;
  if(t-lastTap<0.3)barrel();lastTap=t;ptr={id:e.pointerId,x:e.clientX,y:e.clientY,sy:e.clientY};lastInput=t});
addEventListener('pointermove',e=>{if(ptr&&e.pointerId===ptr.id){ptr.x=e.clientX;ptr.y=e.clientY;lastInput=t}});
addEventListener('pointerup',e=>{if(ptr&&e.pointerId===ptr.id)ptr=null});addEventListener('pointercancel',e=>{if(ptr&&e.pointerId===ptr.id)ptr=null});
addEventListener('touchend',initAudio,{passive:true});
addEventListener('keydown',e=>{keys[e.key]=1;lastInput=t;initAudio();if(e.key===' '){CTL.keyFire=true;e.preventDefault()}if(e.key==='Shift')barrel();if(e.key==='e'||e.key==='у'||e.key==='E')CTL.keyNitro=true});
addEventListener('keyup',e=>{keys[e.key]=0;if(e.key===' ')CTL.keyFire=false;if(e.key==='e'||e.key==='у'||e.key==='E')CTL.keyNitro=false});
const CTL={fireBtn:false,keyFire:false,autoFire:false,up:false,down:false,nitroBtn:false,keyNitro:false,autoNitro:false,
  get fire(){return this.fireBtn||this.keyFire||this.autoFire},get nitro(){return this.nitroBtn||this.keyNitro||this.autoNitro}};

/* ---------------- звук ----------------
   Музыка владельца: «Сломанный город» (m_light — небо, m_streets — город, m_tension — босс),
   «Затонувший город» (music_game — глубина). Космос — живые аккорды без барабанов.
   Гармоничное — полная громкость, резкое/диссонансное — вдвое тише (правило ЗВУК).
   Под водой всё, кроме музыки, глушится фильтром; в космосе ветер стихает.
   iPhone: беззвучный <audio> на первом касании + resume на каждом касании (ЗВУК п.15). */
let AC=null,master=null,sfxBus=null,muffle=null,musicBus=null,windG=null,windF=null,muted=false,padT=0,chord=0,roarG=null;
const SND={},SNDGAIN={ascend:1.1,bubble:.7,clink:.6,death:.5,descend:1,energy:.55,glitch:.35,heartbeat:.8,hurt:.45,levelup:.8,motor:.8,pickup:1.4,portal:1.1,rankup:1.5,sonar:1.1,thunder:.7,victory:1.3,wreck:.8};
const MUS={air:'m_light',city:'m_streets',sea:'music_sea',boss:'m_tension'},musEl={},musG={};let musNow=null;
const silentEl=new Audio('data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjYwLjE2LjEwMAAAAAAAAAAAAAAA//NwwAAAAAAAAAAAAEluZm8AAAAPAAAADAAABZwAMjIyMjIyMjJFRUVFRUVFRVhYWFhYWFhYampqampqampqfX19fX19fX2QkJCQkJCQkKKioqKioqKiorW1tbW1tbW1yMjIyMjIyMja2tra2tra2trt7e3t7e3t7f//////////AAAAAExhdmM2MC4zMQAAAAAAAAAAAAAAACQDNwAAAAAAAAWcHqGxZwAAAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NCxKMAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NAxKQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80LEowAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80DEpAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsSjAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NCxKMAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NAxKQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80LEowAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=');silentEl.loop=true;silentEl.setAttribute('playsinline','');
function initAudio(){
  try{if(silentEl.paused)silentEl.play().catch(()=>{})}catch(e){}
  if(AC){if(AC.state!=='running')AC.resume();return}
  const C=window.AudioContext||window.webkitAudioContext;if(!C)return;AC=new C();
  const b=AC.createBuffer(1,1,22050),s0=AC.createBufferSource();s0.buffer=b;s0.connect(AC.destination);s0.start(0);AC.resume();
  master=AC.createGain();master.gain.value=muted?0:0.85;master.connect(AC.destination);
  muffle=AC.createBiquadFilter();muffle.type='lowpass';muffle.frequency.value=18000;muffle.Q.value=0.7;muffle.connect(master);
  sfxBus=AC.createGain();sfxBus.connect(muffle);musicBus=AC.createGain();musicBus.gain.value=0.55;musicBus.connect(master);
  const len=AC.sampleRate*3,nb=AC.createBuffer(1,len,AC.sampleRate),d=nb.getChannelData(0);let l=0;
  for(let i=0;i<len;i++){l=(l+0.02*(Math.random()*2-1))/1.02;d[i]=l*3.2}
  const ns=AC.createBufferSource();ns.buffer=nb;ns.loop=true;windF=AC.createBiquadFilter();windF.type='lowpass';windF.frequency.value=420;
  windG=AC.createGain();windG.gain.value=0.2;ns.connect(windF).connect(windG).connect(sfxBus);ns.start();
  const ns2=AC.createBufferSource();ns2.buffer=nb;ns2.loop=true;ns2.playbackRate.value=0.5;const bp=AC.createBiquadFilter();bp.type='lowpass';bp.frequency.value=160;
  roarG=AC.createGain();roarG.gain.value=0;ns2.connect(bp).connect(roarG).connect(sfxBus);ns2.start();
  for(const k in SNDGAIN){fetch('sounds/'+k+'.mp3').then(r=>r.arrayBuffer()).then(ab=>new Promise((ok,no)=>AC.decodeAudioData(ab,ok,no))).then(buf=>{SND[k]=buf;if(k==='motor'||k==='heartbeat')startLoop(k)}).catch(()=>{})}
  for(const z in MUS){const el=new Audio('sounds/'+MUS[z]+'.mp3');el.loop=true;el.preload='auto';el.setAttribute('playsinline','');el.crossOrigin='anonymous';musEl[z]=el;
    try{const src=AC.createMediaElementSource(el),gg=AC.createGain();gg.gain.value=0;src.connect(gg).connect(musicBus);musG[z]=gg}catch(e){}
    el.play().then(()=>{if(musNow!==z)el.pause()}).catch(()=>{})}
}
['pointerdown','touchend','keydown','click'].forEach(ev=>addEventListener(ev,()=>{if(AC&&AC.state!=='running')AC.resume();try{if(silentEl.paused&&AC)silentEl.play().catch(()=>{})}catch(e){}},{passive:true,capture:true}));
document.addEventListener('visibilitychange',()=>{if(!AC)return;if(document.hidden){for(const z in musEl)musEl[z].pause()}else{AC.resume();if(musNow&&musEl[musNow])musEl[musNow].play().catch(()=>{})}});
function play(k,vol,rate){if(!AC||muted||!SND[k])return null;const s=AC.createBufferSource(),gg=AC.createGain();s.buffer=SND[k];s.playbackRate.value=rate||1;gg.gain.value=(SNDGAIN[k]||1)*(vol==null?1:vol)*0.5;s.connect(gg).connect(sfxBus);s.start();return s}
const LOOP={};
function startLoop(k){if(LOOP[k]||!SND[k])return;const s=AC.createBufferSource(),gg=AC.createGain();s.buffer=SND[k];s.loop=true;gg.gain.value=0;s.connect(gg).connect(sfxBus);s.start();LOOP[k]={s,gg}}
function setLoop(k,v,rate){const L=LOOP[k];if(!L)return;L.gg.gain.setTargetAtTime(v*(SNDGAIN[k]||1)*0.5,AC.currentTime,0.25);if(rate)L.s.playbackRate.setTargetAtTime(rate,AC.currentTime,0.3)}
function music(z){if(!AC||z===musNow)return;musNow=z;const n=AC.currentTime;
  for(const k in musEl){const gg=musG[k],el=musEl[k];if(!gg){if(k===z){el.volume=0.5;el.play().catch(()=>{})}else el.pause();continue}if(k===z){if(el.paused)el.play().catch(()=>{});gg.gain.cancelScheduledValues(n);gg.gain.setValueAtTime(gg.gain.value,n);gg.gain.linearRampToValueAtTime(1,n+2.5)}
    else{gg.gain.cancelScheduledValues(n);gg.gain.setValueAtTime(gg.gain.value,n);gg.gain.linearRampToValueAtTime(0,n+2.5);setTimeout(()=>{if(musNow!==k)el.pause()},2800)}}}
function audioTick(dt,zoneKey){if(!AC)return;const n=AC.currentTime;
  muffle.frequency.setTargetAtTime(zone==='sea'?650:zone==='space'?7000:18000,n,0.3);
  music(muted?null:zoneKey);
  setLoop('motor',zone==='sea'&&!gameOver?0.55+P.nitro*0.4:0,0.7+P.v/220);
  setLoop('heartbeat',ST.hearts<=1&&!gameOver?0.9:0)}
// аккорды: воздух — мажор, космос — широкие кварты, глубина — тёмный минор
const CH={air:[[261.6,329.6,392,493.9],[220,261.6,329.6,392],[174.6,220,261.6,329.6],[196,246.9,293.7,392]],
  space:[[130.8,196,261.6,392],[146.8,220,293.7,440],[110,164.8,220,329.6],[123.5,185,246.9,370]],
  sea:[[110,130.8,164.8,196],[98,123.5,146.8,185],[87.3,110,130.8,164.8],[103.8,123.5,155.6,207.7]]};
function tone(f,when,dur,vol,type){const o=AC.createOscillator(),gg=AC.createGain();o.type=type;o.frequency.value=f;
  gg.gain.setValueAtTime(0,when);gg.gain.linearRampToValueAtTime(vol,when+Math.min(dur*.35,1.4));gg.gain.exponentialRampToValueAtTime(0.0001,when+dur);
  o.connect(gg).connect(sfxBus);o.start(when);o.stop(when+dur+.05)}
function pad(){if(!AC||muted)return;const n=AC.currentTime,set=CH[zone]||CH.air,c=set[chord%set.length];chord+=(Math.random()<.7?1:2);
  const v=zone==='space'?0.05:0.018;c.forEach((f,i)=>tone(f*(i===0?0.5:1),n+i*(zone==='space'?0.35:0.08),zone==='space'?8:5.5,v,'sine'));
  if(zone==='space')tone(c[3]*2,n+1.2,6,0.012,'triangle')}
const SCALE=[523.3,587.3,659.3,784,880,1046.5,1174.7,1318.5];
function chime(){if(!AC||muted)return;const n=AC.currentTime,f=SCALE[Math.min(combo,SCALE.length-1)];
  tone(f,n,0.9,0.12,'triangle');tone(f*2,n+0.04,0.7,0.04,'sine');tone(f*1.5,n+0.09,0.8,0.05,'sine')}

/* ---------------- меню ---------------- */
const menu=document.getElementById('menu');
document.getElementById('menuBtn').onclick=()=>{menu.classList.toggle('open');initAudio()};
document.getElementById('snd').onclick=e=>{muted=!muted;e.currentTarget.textContent=muted?'🔇':'🔊';if(master)master.gain.value=muted?0:0.85;if(muted){for(const z in musEl)musEl[z].pause();musNow=null}};
document.getElementById('cam').onclick=()=>{shot=(shot+1)%SHOTS.length;shotT=0;camLock=true;menu.classList.remove('open')};
document.getElementById('rst').onclick=()=>{reset();menu.classList.remove('open')};

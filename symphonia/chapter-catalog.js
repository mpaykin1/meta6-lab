/* SYMPHONIA — original miniature horizontal-slice cover illustrations. */
(()=>{"use strict";
const root=document.querySelector("#chapter-catalog-grid");if(!root)return;
const presets=[
["chapel","tree","obelisk",0],["bridge","tower","mountain",1],["city","lamp","tower",2],["piano","arch","candle",3],["mirror","spire","arch",4],["organ","gear","tower",5],["twin","bridge","obelisk",6],["cathedral","organ","arch",7],["puppets","arch","lamp",8],["floating","spire","tree",9],["bridge","mountain","tree",10],["grave","tree","candle",11],["grave","cathedral","obelisk",12],["organ","cathedral","tower",13],["portal","bridge","candle",14],["cathedral","spire","candle",15],["city","lamp","bridge",16],["garden","grave","tree",17],["puppets","gear","arch",18],["gear","organ","tower",19],["forest","tree","obelisk",20],["ocean","portal","bridge",21],["mirror","twin","spire",22],["giants","mountain","spire",23],["train","bridge","lamp",24],["sun","grave","tower",25],["palace","floating","arch",26],["moon","mountain","obelisk",27],["carnival","puppets","spire",28],["keys","organ","candle",29],["robots","gear","tower",30],["twin","puppets","lamp",31],["nest","tree","candle",32],["grave","portal","cathedral",33],["portal","floating","organ",34]];
const palettes=[["#191d2a","#697c88","#c0b99e"],["#211924","#825a61","#d1a388"],["#171f24","#586c68","#b9b8a2"],["#211c29","#846c87","#e3b4a0"],["#211b21","#88534d","#d98d6b"],["#19242c","#4d7887","#b7c6c6"]];
const ring=(r,n=10)=>Array.from({length:n},(_,i)=>[Math.cos(i*Math.PI*2/n)*r,Math.sin(i*Math.PI*2/n)*r]);
const rect=(w,d)=>[[-w,-d],[w,-d],[w,d],[-w,d]];
function paint(canvas,index){
 const W=480,H=270;canvas.width=W;canvas.height=H;const ctx=canvas.getContext("2d");if(!ctx)return;
 const [main,left,right,k]=presets[index%presets.length],p=palettes[k%palettes.length];let seed=(k+1)*2843;
 const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,"#0c0e17");grad.addColorStop(.62,p[0]);grad.addColorStop(1,"#0b0c13");ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
 const moon=ctx.createRadialGradient(270,72,5,270,72,108);moon.addColorStop(0,p[2]+"b0");moon.addColorStop(.35,p[1]+"75");moon.addColorStop(1,p[0]+"00");ctx.fillStyle=moon;ctx.fillRect(0,0,W,200);
 ctx.fillStyle=p[2]+"65";ctx.beginPath();ctx.arc(270,72,main==="sun"?44:26,0,Math.PI*2);ctx.fill();
 for(let j=0;j<38;j++){const x=rng()*W,y=25+rng()*110;ctx.fillStyle=p[2]+(j%3?"35":"70");ctx.fillRect(x,y,1+rng()*2,1);}
 const layers=[];const project=(x,y,z)=>[W/2+(x-y)*1.18,H*.79+(x+y)*.38-z*1.35];
 const stack=(x,y,h,shape,color=p[1],step=3)=>{for(let z=0;z<=h;z+=step){const q=shape(z,h);if(q?.length)layers.push({x,y,z,q,color,step,depth:x+y-z*.035});}};
 const box=(x,y,w,d,h,col)=>stack(x,y,h,()=>rect(w,d),col);
 const pillar=(x,y,h,r=8)=>stack(x,y,h,(z,H)=>ring(r*(z<6||z>H-6?1.3:1),8));
 function tree(x,y,h=75){stack(x,y,h,(z,H)=>{if(z<H*.42)return ring(3,6);const r=(1-z/H)*24+2;return ring(r,7).map(([a,b])=>[a+Math.sin(z*.12)*3,b]);},p[1]);}
 function tower(x,y,h=100,w=13){stack(x,y,h,(z,H)=>z>H*.7?rect(w*(1-z/H)*3+.6,w*(1-z/H)*3+.6):rect(w,w));}
 function arch(x,y,h=65,w=28){pillar(x-w,y,h*.65,6);pillar(x+w,y,h*.65,6);for(let j=-4;j<=4;j++){let xx=j*w/4,zz=h*.65+Math.sqrt(1-(j/4)**2)*h*.35;stack(x+xx,y,zz,(z)=>z>=zz-8?rect(5,7):null);}}
 function object(type,x,y,s=1){switch(type){
 case "piano":box(x,y,29*s,17*s,21*s);for(const dx of [-22,22])for(const dy of [-12,12])pillar(x+dx,y+dy,13,3);stack(x,y,36,(z)=>z>22?rect(27,15-z*.12):null,"#282330");box(x,y-20,25,4,24,p[2]);break;
 case "cathedral":case "chapel":case "palace":box(x,y,30*s,24*s,42*s);tower(x-28*s,y,105*s,10*s);tower(x+28*s,y,93*s,10*s);stack(x,y,80*s,(z)=>z>40*s?rect((80*s-z)*.75+2,24*s):null);arch(x,y+25*s,44*s,10*s);break;
 case "city":for(let j=0;j<7;j++)tower(x+(j%3-1)*29,y+(Math.floor(j/3)-1)*25,(40+rng()*60)*s,9*s);break;
 case "forest":case "garden":for(let j=0;j<9;j++)tree(x+(j%3-1)*28,y+(Math.floor(j/3)-1)*25,(40+rng()*50)*s);if(type==="garden")pillar(x,y,22,13);break;
 case "tree":tree(x,y,75*s);break;
 case "mountain":stack(x,y,112*s,(z,H)=>ring((1-z/H)*34*s+1,6).map(([a,b])=>[a+z*.09,b]),p[1]);break;
 case "arch":arch(x,y,70*s,23*s);break;
 case "bridge":for(let j=-2;j<=2;j++){pillar(x+j*20*s,y,34*s,6*s);stack(x+j*20*s,y,40*s,z=>z>=32*s?rect(11*s,12*s):null);}break;
 case "organ":case "keys":for(let j=-3;j<=3;j++)pillar(x+j*9*s,y, (65+35*(1-Math.abs(j)/3))*s,4*s);box(x,y+11*s,33*s,8*s,18*s,p[2]);break;
 case "gear":case "robots":for(let j=0;j<8;j++){let a=j*Math.PI/4;pillar(x+Math.cos(a)*25*s,y+Math.sin(a)*25*s,45*s,5*s);}pillar(x,y,75*s,13*s);stack(x,y,57*s,z=>z>45*s?ring(35*s,16):null);break;
 case "train":box(x,y,48*s,15*s,26*s);box(x-24*s,y,14*s,16*s,50*s);pillar(x+23*s,y,46*s,7*s);for(let j=-2;j<=2;j++)for(const sign of [-1,1])pillar(x+j*17*s,y+sign*17*s,9*s,7*s);break;
 case "grave":for(let j=0;j<5;j++)box(x+(j%3-1)*20*s,y+(Math.floor(j/3)-.5)*25*s,5*s,3*s,(12+j*3)*s);pillar(x,y,37*s,7*s);break;
 case "puppets":case "twin":case "giants":for(const sign of [-1,1]){const xx=x+sign*19*s,hh=(type==="giants"?100:64)*s;pillar(xx-5*s,y,hh*.4,4*s);pillar(xx+5*s,y,hh*.4,4*s);stack(xx,y,hh,(z,H)=>z<H*.4?null:z<H*.72?rect(12*s*(1-(z/H-.4)),6*s):z<H*.78?ring(3*s):ring(7*s*Math.sin((z/H-.78)/.22*Math.PI)+1,8));}break;
 case "mirror":case "portal":arch(x,y,95*s,25*s);stack(x,y,75*s,(z)=>z>8*s?rect(18*s*Math.sin(z/(80*s)*Math.PI)+1,1.6*s):null,p[2]);break;
 case "floating":for(let j=0;j<4;j++)stack(x+(j-1.5)*17*s,y,90*s,(z)=>z>j*12*s+28*s&&z<j*12*s+42*s?ring(15*s,6):null);break;
 case "ocean":for(let j=0;j<6;j++)stack(x+(j-2.5)*14*s,y,32*s,(z)=>z<7*s?rect(12*s,28*s):z>20*s?ring(3*s):null);break;
 case "nest":stack(x,y,65*s,(z,H)=>ring((z<H*.7?22+z*.15:8)*s,9),p[1]);for(let j=0;j<6;j++)tree(x+Math.cos(j)*29*s,y+Math.sin(j)*29*s,37*s);break;
 case "carnival":for(let j=-1;j<=1;j++)tower(x+j*24*s,y,65*s,12*s);break;
 case "sun":case "moon":stack(x,y,70*s,(z,H)=>ring(Math.sqrt(Math.max(0,(H/2)**2-(z-H/2)**2))*.65+1,14),p[2]);break;
 case "lamp":case "candle":pillar(x,y,48*s,2*s);stack(x,y,52*s,z=>z>44*s?rect(5*s,5*s):null,p[2]);break;
 default:tower(x,y,75*s,9*s);}
 }
 stack(0,0,5,()=>rect(78,60),p[1]);object(left,-47,-14,.75);object(right,47,-9,.7);object(main,0,5,1);
 layers.sort((a,b)=>a.depth-b.depth||a.z-b.z);
 for(const l of layers){const verts=l.q.map(([x,y])=>project(l.x+x,l.y+y,l.z));ctx.beginPath();verts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.globalAlpha=.92;ctx.fillStyle=l.color;ctx.fill();ctx.globalAlpha=.65;ctx.strokeStyle="#11121c";ctx.lineWidth=.8;ctx.stroke();ctx.globalAlpha=1;}
 for(let j=0;j<65;j++){const x=rng()*W,y=140+rng()*H*.42;ctx.fillStyle=p[2]+"25";ctx.fillRect(x,y,1,1);}
 const fog=ctx.createLinearGradient(0,H*.72,0,H);fog.addColorStop(0,p[0]+"00");fog.addColorStop(1,"#0b0c13");ctx.fillStyle=fog;ctx.fillRect(0,H*.72,W,H*.28);
}
const safe=(v)=>{try{const u=new URL(v,location.href);return u.origin===location.origin&&u.pathname.startsWith(new URL("./",location.href).pathname)?u.href:null}catch{return null}};
function render(data){root.replaceChildren();const chapters=data.chapters.filter(x=>x&&typeof x.title==="string").sort((a,b)=>a.order-b.order);for(const [i,c] of chapters.entries()){
const url=c.status==="published"&&c.url?safe(c.url):null;const cover=c.cover?safe(c.cover):null;
const card=document.createElement(url?"a":"article");card.className="catalog-card";if(url)card.href=url;
const art=document.createElement("div");art.className="catalog-art";art.style.setProperty("--delay",(-i%7)+"s");if(cover){const img=document.createElement("img");img.src=cover;img.alt="";img.loading="lazy";art.append(img);img.addEventListener("error",()=>{img.remove();const cv=document.createElement("canvas");art.prepend(cv);paint(cv,i);},{once:true});}else{const cv=document.createElement("canvas");cv.setAttribute("aria-hidden","true");art.append(cv);if("IntersectionObserver"in window)observer.observe(cv);else paint(cv,i);cv.dataset.index=i;}
const light=document.createElement("i");light.className="catalog-light";const mist=document.createElement("i");mist.className="catalog-mist";art.append(light,mist);
const text=document.createElement("div");text.className="catalog-info";const no=document.createElement("span");no.className="num";no.textContent="ГЛАВА "+String(c.order).padStart(2,"0")+" · "+c.music;const title=document.createElement("h3");title.textContent=c.title;const desc=document.createElement("p");desc.textContent=c.description;const status=document.createElement("span");status.className=url?"catalog-play":"catalog-soon";status.textContent=url?"Играть →":"Глава в разработке";text.append(no,title,desc,status);card.append(art,text);root.append(card);}
 document.querySelector("#catalog-count").textContent=chapters.length+" глав · "+chapters.filter(c=>c.status==="published"&&c.url&&safe(c.url)).length+" доступны";
}
const observer="IntersectionObserver"in window?new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){paint(e.target,+e.target.dataset.index);observer.unobserve(e.target);}},{rootMargin:"200px"}):null;
let fallback;try{fallback=JSON.parse(document.querySelector("#chapter-catalog-data").textContent);render(fallback);}catch{}
fetch("./chapters.json",{cache:"no-cache"}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{if(data.schema==="symphonia-chapters/1"&&Array.isArray(data.chapters)){if(observer)observer.disconnect();render(data);}}).catch(()=>{});
})();
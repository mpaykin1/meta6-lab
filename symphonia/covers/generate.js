// Horizontal z-slice material atlas, perspective projection, GIF/PNG exporter.
function generate(){
const NX=128,NY=172,NZ=104,S=NX*NY, specs=[["sonata",0,1,0],["fugue",1,0,0],["waltz",2,1,0],["fantasia",3,0,0],["rhapsody",4,0,1],["elegy",5,0,1],["requiem",6,0,0],["symphony",7,1,0],["coda",8,1,0],["cathedral-of-shadows",9,1,0]];
const pal=new Uint8Array(768),ramps=[[1,.976,.916],[1,.84,.58],[1,.60,.48],[.84,.91,1],[.92,.91,.90],[.75,.85,.71],[1,.94,.77],[.94,.86,.76]];
for(let r=0;r<8;r++)for(let l=0;l<32;l++){let v=5+l*8.06;for(let c=0;c<3;c++)pal[(r*32+l)*3+c]=Math.min(255,Math.round(v*ramps[r][c]))}
const mats=[null,[0,188],[1,171],[4,111],[0,224],[7,129],[0,46],[6,247],[0,239],[2,106],[5,90],[3,135],[1,240],[4,159],[0,84]];
function scene(spec){const [,k,light,outside]=spec,v=new Uint8Array(S*NZ);
function fill(x0,x1,y0,y1,z0,z1,fn){for(let z=Math.max(0,Math.ceil(z0));z<=Math.min(NZ-1,z1);z++)for(let y=Math.max(0,Math.ceil(y0));y<=Math.min(NY-1,y1);y++)for(let x=Math.max(0,Math.ceil(x0));x<=Math.min(NX-1,x1);x++){let m=fn(x,y,z);if(m)v[z*S+y*NX+x]=m}}
const box=(x,y,z,w,d,h,m)=>fill(x-w/2,x+w/2,y-d/2,y+d/2,z,z+h,()=>m);
function cyl(x,y,z,r,h,m,flute=false){fill(x-r-1,x+r+1,y-r-1,y+r+1,z,z+h,(a,b,c)=>{let dx=a-x,dy=b-y,rr=r*(flute?1+.08*Math.cos(Math.atan2(dy,dx)*10):1);return Math.hypot(dx,dy)<=rr?m:0})}
function col(x,y,h,r=3.5){box(x,y,0,r*2+4,r*2+4,2,1);box(x,y,2,r*2+2,r*2+2,2,1);cyl(x,y,4,r,h-8,1,true);for(let z=h-5;z<=h;z+=2)box(x,y,z,r*2+(z-h+5)*.8+2,r*2+(z-h+5)*.8+2,1,z===h-1?2:1)}
function arch(cx,y,w,z0,rise,m=1){fill(cx-w-3,cx+w+3,y-2,y+2,z0-1,z0+rise+4,(x,b,z)=>{let t=Math.abs(x-cx)/w;if(t>1.08)return 0;let h=z0+rise*Math.pow(Math.max(0,1-Math.pow(Math.min(1,t),1.7)),.63),d=z-h;if(Math.abs(d)<2.2)return d>1.1?2:m;if(Math.abs(d+4)<.7)return 2;return 0})}
function piano(x,y,s=1){let w=14*s,d=19*s,h=9*s;for(const [a,b] of [[-.4,-.4],[.4,-.4],[.2,.42]])box(x+a*w,y+b*d,0,1.8*s,1.8*s,h,6);fill(x-w/2,x+w/2,y-d/2,y+d/2,h,h+5*s,(a,b,z)=>{let q=(b-y)/d;return Math.abs(a-x)<w*(q<-.2?.5:.49-.36*Math.max(0,q))?(z>=h+4*s?5:6):0});box(x,y-d/2-1,h,w,4*s,1,8);for(let j=0;j<12;j++)box(x-w/2+1+j*w/12,y-d/2,h+1,.65*s,1.7*s,.4,6);box(x,y+2,h+5,w*.55,1.2,3,5);box(x,y-d/2-5,0,6*s,4*s,4*s,6)}
function ghost(x,y,h=17){fill(x-6,x+6,y-4,y+4,0,h,(a,b,z)=>{let q=z/h,r=q<.48?4.6-q*4:q<.78?2.2:q<.9?2.4:1.7;return Math.hypot(a-x,(b-y)*1.2)<r?(q>.77?8:13):0})}
function candle(x,y,z=0,h=12){cyl(x,y,z,2.3,1,2);cyl(x,y,z+1,.8,h-3,2);for(let d of [-2,0,2]){box(x+d,y,z+h-3,1.2,1.3,3,8);box(x+d,y,z+h,.9,.9,2,12)}}
function organ(x,y,w=34,h=40){box(x,y,0,w,8,8,5);for(let i=-5;i<=5;i++){let H=h-Math.abs(i)*3,a=x+i*w/12;cyl(a,y,8,1.5,H,2,true);cyl(a,y,8+H,1.7,1,12)}box(x,y-6,7,w*.75,6,3,6);box(x,y-8,10,w*.7,2,1,8)}
function tree(x,y,h=26){fill(x-9,x+9,y-9,y+9,0,h,(a,b,z)=>{let dx=a-x-z*.09,dy=b-y;if(Math.hypot(dx,dy)<(z<h*.3?2.1:1.3))return 5;for(let j=0;j<4;j++){let t=(z-h*.3-j*2)/(h*.7);if(t>0&&t<1&&Math.hypot(dx-Math.cos(j*1.87)*t*10,dy-Math.sin(j*1.87)*t*10)<1.25-t*.7)return 5}return 0})}
function tomb(x,y){box(x,y,0,11,18,2,3);box(x,y,2,9,15,4,1);box(x,y,6,10,16,1,2);box(x,y+6,7,3,1,6,1)}
function spire(x,y,h,r){fill(x-r,x+r,y-r,y+r,0,h,(a,b,z)=>Math.max(Math.abs(a-x),Math.abs(b-y))<r*(z<h*.65?1:Math.max(.08,1-(z-h*.65)/(h*.35)))?1:0)}
if(!outside){let w=k===2?34:29;for(let y=24;y<158;y+=24){for(let s of [-1,1]){col(64+s*w,y,40,3.5);if(k===9||k===7)col(64+s*(w+12),y+4,46,2.5)}arch(64,y,w,40,k===9?40:33);if(k===1)arch(64,y+7,w-6,34,28,2);if(k===2)arch(64,y+8,w+5,36,31);for(let s of [-1,1])candle(64+s*(w-6),y+5,0,13)}
fill(16,112,160,162,1,93,(x,b,z)=>{let q=Math.abs(x-(32+Math.round((x-32)/16)*16)),top=63+9*Math.sqrt(Math.max(0,1-(q/6)**2));return q<6&&z>15&&z<top?(q<.7||z===44?2:0):1});
for(let s of [-1,1]){let x=64+s*44;fill(x-1,x+1,26,160,0,82,(a,y,z)=>{let q=Math.abs(((y+12)%24)-12);return q<8&&z>12&&z<52+7*Math.sqrt(Math.max(0,1-(q/8)**2))?(q<1||z===32?2:0):1})}
if(k===0){piano(51,58);piano(78,69);candle(64,54);ghost(50,49,13);ghost(78,60,13)}
if(k===1){organ(64,97,39,40);for(let j=0;j<3;j++){piano(50+j*14,53+j*9,.68);ghost(50+j*14,47+j*9,10)}}
if(k===2){for(let j=0;j<6;j++){let a=j*Math.PI/3;ghost(64+Math.cos(a)*16,68+Math.sin(a)*13,14)}piano(64,89,.9)}
if(k===3){for(let j=0;j<9;j++){let x=38+(j*17)%53,y=48+(j*13)%68,z=7+(j*11)%34;box(x,y,z,8+j%3*2,12,2,1);if(j%3===0)candle(x,y,z+3,7)}piano(64,70)}
if(k===6){tomb(64,62);for(let s of [-1,1]){tomb(64+s*20,83);candle(64+s*12,62,0,17)}ghost(64,77,20)}
if(k===7){organ(64,100,49,53);piano(64,60,1.15);for(let s of [-1,1])candle(64+s*16,60,0,18)}
if(k===8){for(let j=0;j<6;j++)box(64,80+j*4,0,34-j*2,5,2+j*2,1);arch(64,104,16,28,22,2);for(let j=0;j<4;j++)candle(44+j*13,73,0,15)}
if(k===9){organ(64,119,42,42);piano(67,48,1.22);ghost(60,36,16);for(let s of [-1,1]){candle(64+s*17,52,0,19);for(let j=0;j<2;j++)ghost(64+s*(20+j*4),78+j*15,18+j*4)}}
}else if(k===4){for(let y=32;y<154;y+=23){col(42,y,31,4);col(86,y,31,4);arch(64,y,22,31,28);box(64,y,0,47,3,2,1);candle(42,y+8);candle(86,y+8)}for(let j=0;j<6;j++)spire(15+j*19,147,38+(j*23)%49,6)}
else{for(let j=0;j<9;j++){tree(23+(j*37)%82,38+(j*29)%110,20+(j*11)%25);if(j<7)tomb(30+(j*19)%69,49+(j*17)%75)}arch(64,115,20,30,23);col(44,115,30);col(84,115,30);candle(64,77,0,17)}return v}
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function frame(spec,v,W,H,t){let [,k,light,outside]=spec,out=new Uint8Array(W*H),f=W*(outside?.61:.71),hor=H*.47,cx=64+Math.sin(t)*.68,cz=13.2+.12*Math.cos(t),cy=5.5,fade=light?227:outside?75:107,mx=k===5?W*.75:W*.28,my=H*.24;
for(let j=0;j<H;j++){let dz=(hor-j)/f;for(let i=0;i<W;i++){let dx=(i-W*.5)/f,m=0,dst=155,xx=0,yy=0,zz=0;for(let d=1;d<161;d++){let x=(cx+dx*d)|0,y=(cy+d)|0,z=Math.floor(cz+dz*d);if(y>=NY)break;if(z<1){m=15;dst=d;xx=x;yy=y;break}if(x<0||x>=NX||z>=NZ)continue;let q=v[z*S+y*NX+x];if(q){m=q;dst=d;xx=x;yy=y;zz=z;break}}
let r=0,L=0;if(!m){let a=Math.hypot(i-mx,j-my);L=fade+(light?12:0)+(outside?Math.max(0,1-a/(W*.32))*42:0)+4*Math.sin(i*.034+j*.014+t*.3);if(outside&&a<W*.085){r=1;L=230}else r=light?0:4}
else if(m===15){let rr=Math.hypot(xx-64,yy-(k===2||k===9?63:70)),trim=Math.min(Math.abs(rr-16),Math.abs(rr-19),Math.abs(rr-25),Math.abs(rr-27)),grout=xx%12===0||yy%12===0,line=Math.abs(xx-64)===25||Math.abs(xx-64)===27;r=trim<.55||line?1:0;L=light?(r===1?146:grout?168:221):(r===1?103:grout?48:82);if(outside){r=k===5?5:4;L=grout?38:62}}
else{let a=mats[m]||mats[1];r=a[0];L=a[1];let p=zz*S+yy*NX+xx,sy=yy>0?v[p-NX]:0,sx=xx>0?v[p-1]:0,sz=zz+1<NZ?v[p+S]:0;L*=(!sy?.89:!sx?.74:!sz?1.13:1.02)*(light?1:.68);if(m===12||m===7){L=238+12*Math.sin(t+xx*.11+yy*.19);r=1}if(m===8||m===13)L=light?216:153;if(m===6)L=light?42:19}
if(m){let fog=1-Math.exp(-dst*(light?.009:.007));L=L*(1-fog)+(fade+(light?7:0))*fog;if(fog>.69&&r!==1)r=light?0:4}
let mist=(Math.sin(i*.036+j*.075+t*.9+k)+Math.sin(i*.018-j*.09-t*.7))*1.8,vg=1-.15*Math.pow(Math.hypot((i-W*.5)/(W*.66),(j-H*.48)/(H*.84)),1.7);L=(L+mist)*vg;let grain=((Math.imul((i+1)*(j+17)+k*17,1103515245)>>>27)&3)-1.5;out[j*W+i]=r*32+clamp(Math.round((L-5)/8.06+grain*.28),0,31)}}return out}
function gif(W,H,frames){let a=[],p=(...b)=>a.push(...b),u=n=>p(n&255,n>>8&255),str=s=>p(...Array.from(s,c=>c.charCodeAt(0)));str("GIF89a");u(W);u(H);p(0xf7,0,0);p(...pal);p(0x21,0xff,11);str("NETSCAPE2.0");p(3,1,0,0,0);for(let px of frames){p(0x21,0xf9,4,4,30,0,0,0,0x2c);u(0);u(0);u(W);u(H);p(0,8);let codes=[],dict=new Map(),next=258,bits=0,nb=0;const emit=c=>{bits|=c<<nb;nb+=9;while(nb>=8){codes.push(bits&255);bits>>>=8;nb-=8}};emit(256);let q=px[0];for(let i=1;i<px.length;i++){let c=px[i],key=q*256+c,d=dict.get(key);if(d!==undefined)q=d;else{emit(q);dict.set(key,next++);q=c;if(next>=490){emit(256);dict.clear();next=258}}}emit(q);emit(257);if(nb)codes.push(bits&255);for(let i=0;i<codes.length;i+=255){let b=codes.slice(i,i+255);p(b.length,...b)}p(0)}p(0x3b);return Uint8Array.from(a)}
function png(w,h,px){let table=Array.from({length:256},(_,n)=>{let c=n;for(let i=0;i<8;i++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0});const U=n=>[(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255],chunk=(s,b)=>{let nm=Array.from(s,c=>c.charCodeAt(0)),c=0xffffffff;for(let x of nm)c=table[(c^x)&255]^(c>>>8);for(let x of b)c=table[(c^x)&255]^(c>>>8);return [...U(b.length),...nm,...b,...U((c^0xffffffff)>>>0)]};let raw=[];for(let y=0;y<h;y++)raw.push(0,...px.slice(y*w,(y+1)*w));let data=[0x78,1],aa=1,bb=0;for(let n of raw){aa=(aa+n)%65521;bb=(bb+aa)%65521}for(let i=0;i<raw.length;i+=65535){let x=raw.slice(i,i+65535),n=x.length;data.push(i+n===raw.length?1:0,n&255,n>>8,(~n)&255,(~n)>>8&255,...x)}data.push(...U((bb<<16)|aa));return Uint8Array.from([137,80,78,71,13,10,26,10,...chunk("IHDR",[...U(w),...U(h),8,3,0,0,0]),...chunk("PLTE",pal),...chunk("IDAT",data),...chunk("IEND",[])])}
return {specs,scene,frame,gif,png}
}

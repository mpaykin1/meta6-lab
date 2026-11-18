import asyncio,json,base64
from playwright.async_api import async_playwright
JS=r'''
() => {
 const def=MODELS.find(m=>m.id==='ash_worm'),out=[];
 for(let i=0;i<16;i++){
  for(const lying of [0,1]){
   const vox=new Map();let mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];
   const parts=def.parts.filter(p=>p.name==='s'+i||(i===0&&(p.name==='jawL'||p.name==='jawR')));
   const sj=def.parts.find(p=>p.name==='s'+i).joint;
   for(const pt of parts){
     pt.grid.each((x,y,z,c)=>{
       let X=Math.floor(x+.5-sj[0]),Y=Math.floor(y+.5-sj[1]),Z=Math.floor(z+.5-sj[2]);
       if(lying){const t=Y;Y=Z;Z=-t;}
       const k=X+','+Y+','+Z;vox.set(k,c);
       mn=[Math.min(mn[0],X),Math.min(mn[1],Y),Math.min(mn[2],Z)];mx=[Math.max(mx[0],X),Math.max(mx[1],Y),Math.max(mx[2],Z)];
     });
   }
   const W=mx[0]-mn[0]+1,H=mx[1]-mn[1]+1,D=mx[2]-mn[2]+1;
   const cv=document.createElement('canvas');cv.width=W*H;cv.height=D;const x=cv.getContext('2d'),img=x.createImageData(cv.width,D),d=img.data;
   for(const [k,c] of vox){const [X,Y,Z]=k.split(',').map(Number),p=PAL[c];if(!p)continue;
     const top=!vox.has(X+','+(Y+1)+','+Z),lit=(0.62+0.38*(Y-mn[1])/Math.max(1,H-1))*(top?1.12:0.86)*(p.e>0?1.25:1);
     const i=((Z-mn[2])*cv.width+(Y-mn[1])*W+(X-mn[0]))*4;d[i]=Math.min(255,p.c[0]*255*lit);d[i+1]=Math.min(255,p.c[1]*255*lit);d[i+2]=Math.min(255,p.c[2]*255*lit);d[i+3]=255;}
   x.putImageData(img,0,0);
   out.push({i,lying,W,H,D,cx:-mn[0],cy:-mn[2],cz:-mn[1],url:cv.toDataURL()});
  }
 }
 return out;
}'''
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader'])
    pg=await b.new_page();await pg.goto('file:///home/claude/src/enemies.html');await pg.wait_for_timeout(3000)
    r=await pg.evaluate(JS)
    json.dump(r,open('/home/claude/bake/worm_segs.json','w'))
    print(len(r),[(s['i'],s['lying'],s['W'],s['H'],s['D']) for s in r[:4]], sum(len(s['url']) for s in r))
    await b.close()
asyncio.run(main())

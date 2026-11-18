import asyncio,json,base64,sys
from playwright.async_api import async_playwright
SRC='file:///home/claude/src/enemies.html'
JS=r'''
async () => {
 const D2=id=>MODELS.find(m=>m.id===id);
 const ENEM=[['soldier','walk'],['strider_s','walk'],['strider_m','walk'],['colossus','walk'],['drone_quad','hover'],['drone_eye','hover'],['ash_worm','crawl'],['turret','attack']];
 const out={};
 for(const [id,mode] of ENEM){
  const def=D2(id); if(!def){out[id]={err:'nodef'};continue}
  const F=8, per=def.period||1, inst=instance(def), vs=def.vs, frames=[];
  let mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];
  const v3=new THREE.Vector3();
  for(let f=0;f<F;f++){
   const t=f/F*per*2+0.37;
   animate(inst,t,{mode,speed:1,aim:1,fire:(f%4===0)});
   inst.root.updateMatrixWorld(true);
   const vox=new Map();
   for(const pt of def.parts){
    const grp=inst.p[pt.name], m=grp.children[0].matrixWorld, j=pt.joint;
    pt.grid.each((x,y,z,c)=>{
      for(const o of [[.5,.5,.5],[.15,.15,.15],[.85,.85,.85]]){
       v3.set((x+o[0]-j[0])*vs,(y+o[1]-j[1])*vs,(z+o[2]-j[2])*vs).applyMatrix4(m);
       const X=Math.floor(v3.x/vs),Y=Math.floor(v3.y/vs),Z=Math.floor(v3.z/vs);
       const k=X+','+Y+','+Z; if(!vox.has(k))vox.set(k,c);
       if(X<mn[0])mn[0]=X;if(Y<mn[1])mn[1]=Y;if(Z<mn[2])mn[2]=Z;if(X>mx[0])mx[0]=X;if(Y>mx[1])mx[1]=Y;if(Z>mx[2])mx[2]=Z;
      }
    });
   }
   frames.push(vox);
  }
  const W=mx[0]-mn[0]+1,H=mx[1]-mn[1]+1,Dd=mx[2]-mn[2]+1;
  // атлас: строки = кадры, колонки = срезы по высоте (Y вверх); срез = вид сверху X×Z
  const cv=document.createElement('canvas');cv.width=W*H;cv.height=Dd*F;const x=cv.getContext('2d');
  const img=x.createImageData(cv.width,cv.height),d=img.data;
  frames.forEach((vox,f)=>{
   for(const [k,c] of vox){const [X,Y,Z]=k.split(',').map(Number);
    const p=PAL[c]; if(!p)continue;
    const top=!vox.has(X+','+(Y+1)+','+Z);
    const lit=(0.62+0.38*(Y-mn[1])/Math.max(1,H-1))*(top?1.12:0.86)*(p.e>0?1.25:1);
    const px=(Y-mn[1])*W+(X-mn[0]), py=f*Dd+(Z-mn[2]), i=(py*cv.width+px)*4;
    d[i]=Math.min(255,p.c[0]*255*lit);d[i+1]=Math.min(255,p.c[1]*255*lit);d[i+2]=Math.min(255,p.c[2]*255*lit);d[i+3]=255;
   }
  });
  x.putImageData(img,0,0);
  let glow=0;frames[0].forEach(c=>{if(PAL[c]&&PAL[c].e>0)glow++});
  out[id]={name:def.name,vs,W,H,D:Dd,F,glow,url:cv.toDataURL('image/png')};
 }
 return out;
}'''
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    pg=await b.new_page(viewport={'width':600,'height':800})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(SRC);await pg.wait_for_timeout(4000)
    r=await pg.evaluate(JS)
    print('errs',errs[:3])
    for k,v in r.items():
      if 'url' in v:
        open(f'/home/claude/bake/{k}.png','wb').write(base64.b64decode(v['url'].split(',')[1]))
        print(k,v['name'],'vs',v['vs'],'WxHxD',v['W'],v['H'],v['D'],'glow',v['glow'])
      else: print(k,v)
    json.dump({k:{kk:vv for kk,vv in v.items() if kk!='url'} for k,v in r.items()},open('/home/claude/bake/meta.json','w'),ensure_ascii=False)
    await b.close()
asyncio.run(main())

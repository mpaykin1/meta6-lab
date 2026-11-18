import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    pg=await b.new_page(viewport={'width':400,'height':800})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('file:///home/claude/game/v4/index.html');await pg.wait_for_timeout(2500)
    r=await pg.evaluate("""(()=>{const P=__cb.P();for(let i=-6;i<6;i++)for(let j=-6;j<6;j++){const isl=islandAt(i,j);if(isl&&isl.city&&isl.bld.length>6){
       const b=isl.bld.reduce((a,c)=>c.h>a.h?c:a);const [wx,wy]=bldWorld(isl,b);P.x=wx-Math.sin(0.3)*120;P.y=wy+Math.cos(0.3)*120;P.h=0.3;P.z=isl.top+b.h*0.5;cam.x=P.x;cam.y=P.y;cam.z=P.z;
       window.__tg=[wx,wy,b.h,isl.top];return [b.h,isl.top,b.lean]}}})()""")
    print('target',r)
    await pg.evaluate("lastInput=1e9;shot=4;camLock=true;shotT=0")
    for i in range(4):
      await pg.wait_for_timeout(700);await pg.screenshot(path=f'c{i}.png')
      print(await pg.evaluate("[gameOver,Math.round(P.z),Math.round(Math.hypot(P.x-__tg[0],P.y-__tg[1]))]"))
    await pg.wait_for_timeout(1500);await pg.screenshot(path='c_over.png');print(await pg.evaluate("document.getElementById('over').className"))
    await pg.click("#again",force=True);await pg.wait_for_timeout(1500);print('after restart',await pg.evaluate("[gameOver,__cb.ST.hearts,score]"))
    # ground crash on nature island
    await pg.evaluate("""(()=>{for(let i=-6;i<6;i++)for(let j=-6;j<6;j++){const isl=islandAt(i,j);if(isl&&!isl.city){P.x=isl.x;P.y=isl.y;P.z=isl.top+40;P.vz=0;__cb.ST.inv=0;return}}})()""")
    await pg.keyboard.down('ArrowDown');await pg.wait_for_timeout(1500);await pg.keyboard.up('ArrowDown');print('ground',await pg.evaluate("[gameOver,Math.round(P.z)]"))
    await pg.screenshot(path='c_ground.png')
    print('errs',errs[:4])
    await b.close()
asyncio.run(main())

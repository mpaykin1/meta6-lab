import asyncio,json
from playwright.async_api import async_playwright
FPS="new Promise(r=>{let n=0,t0=performance.now(),mx=0,lt=t0;function f(){const now=performance.now();mx=Math.max(mx,now-lt);lt=now;n++;if(now-t0<3000)requestAnimationFrame(f);else r([+(n/3).toFixed(1),Math.round(mx)])}requestAnimationFrame(f)})"
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    pg=await b.new_page(viewport={'width':390,'height':844})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('http://127.0.0.1:8777/index.html');await pg.wait_for_timeout(3000)
    await pg.evaluate("__cb.ST.inv=1e9;lastInput=1e9")
    print('air',await pg.evaluate(FPS))
    await pg.evaluate("P.z=500");await pg.wait_for_timeout(1500);print('high',await pg.evaluate(FPS))
    await pg.evaluate("P.z=1500");await pg.wait_for_timeout(2000);print('space',await pg.evaluate(FPS))
    await pg.evaluate("""(()=>{for(let i=-6;i<6;i++)for(let j=-6;j<6;j++){const isl=islandAt(i,j);if(isl&&isl.city){P.x=isl.x;P.y=isl.y+300;P.h=0;P.z=isl.top+170;P.vz=0;return}}})()""")
    print('cityenter',await pg.evaluate(FPS));print('city',await pg.evaluate(FPS))
    await pg.evaluate("P.x+=20000;P.z=-300;P.vz=0");await pg.wait_for_timeout(2000);print('sea',await pg.evaluate(FPS));print('sea2',await pg.evaluate(FPS))
    print(errs[:3])
    await b.close()
asyncio.run(main())

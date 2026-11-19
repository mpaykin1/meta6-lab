import asyncio,sys
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    pg=await b.new_page(viewport={'width':400,'height':800})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
    await pg.goto('http://127.0.0.1:8777/index.html');await pg.wait_for_timeout(5000)
    await pg.screenshot(path='a0_air.png')
    st=lambda: pg.evaluate("[__cb.zone,Math.round(__cb.P().z),__cb.ST.hearts,+__cb.ST.nitro.toFixed(2),__cb.kills,__cb.E.length]")
    print('air',await st())
    await pg.keyboard.down('ArrowUp')
    for i in range(5):
      await pg.wait_for_timeout(1600);print('up',i,await st());await pg.screenshot(path=f'a1_up{i}.png')
    await pg.wait_for_timeout(3000);print('space',await st());await pg.screenshot(path='a2_space.png')
    await pg.keyboard.up('ArrowUp');await pg.wait_for_timeout(4000);print('fall',await st());await pg.screenshot(path='a3_fall.png')
    # teleport to open sea low and dive
    await pg.evaluate("(()=>{const P=__cb.P();for(let k=0;k<200;k++){const x=k*97.3+5000,y=k*53.1-3000;let ok=true;for(let a=-2;a<=2&&ok;a++)for(let c=-2;c<=2;c++){ /*check*/ }P.x=x;P.y=y;break}P.z=60;P.vz=0;__cb.ST.inv=99})()")
    await pg.wait_for_timeout(1500)
    await pg.keyboard.down('ArrowDown');await pg.wait_for_timeout(1500);print('dive',await st());await pg.screenshot(path='a4_dive.png')
    await pg.wait_for_timeout(2500);print('deep',await st());await pg.keyboard.up('ArrowDown');await pg.screenshot(path='a5_deep.png')
    await pg.evaluate("__cb.spawn('ash_worm');__cb.spawn('strider_s')");await pg.wait_for_timeout(3500);await pg.screenshot(path='a6_seaenemy.png');print('seaE',await st())
    await pg.keyboard.down('ArrowUp');await pg.wait_for_timeout(3000);await pg.keyboard.up('ArrowUp');print('surface',await st());await pg.screenshot(path='a7_surface.png')
    # city: find a city island
    r=await pg.evaluate("(()=>{const P=__cb.P();for(let i=-30;i<30;i++)for(let j=-30;j<30;j++){const isl=islandAt(i,j);if(isl&&isl.city&&isl.bld.length>5){P.x=isl.x;P.y=isl.y+500;P.h=0;P.z=isl.top+60;__cb.ST.inv=0;return [i,j,isl.bld.length,isl.top]}}return null})()")
    print('city',r);await pg.wait_for_timeout(2500);await pg.screenshot(path='a8_city.png');print('cityst',await st())
    await pg.keyboard.down('ArrowDown');await pg.wait_for_timeout(3000);await pg.keyboard.up('ArrowDown');print('crash?',await st(),await pg.evaluate('gameOver'))
    await pg.wait_for_timeout(1500);await pg.screenshot(path='a9_over.png')
    fps=await pg.evaluate("new Promise(r=>{let n=0,t0=performance.now();function f(){n++;if(performance.now()-t0<2000)requestAnimationFrame(f);else r(n/2)}requestAnimationFrame(f)})")
    print('errs',errs[:6],'fps',fps)
    await b.close()
asyncio.run(main())

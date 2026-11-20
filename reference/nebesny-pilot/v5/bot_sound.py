import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--autoplay-policy=no-user-gesture-required'])
    pg=await b.new_page(viewport={'width':390,'height':844})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
    await pg.goto('http://127.0.0.1:8777/index.html');await pg.wait_for_timeout(1500)
    await pg.mouse.click(200,300);await pg.wait_for_timeout(3000)
    print(await pg.evaluate("[AC&&AC.state,Object.keys(SND).length,Object.keys(LOOP),musNow,Object.entries(musEl).map(([k,e])=>k+':'+(e.paused?'p':'play')+':'+(musG[k]?musG[k].gain.value.toFixed(2):'-')).join(' ')]"))
    await pg.evaluate("__cb.ST.inv=1e9;P.x+=20000;P.z=-200");await pg.wait_for_timeout(4000)
    print(await pg.evaluate("[zone,musNow,muffle.frequency.value|0,LOOP.motor&&LOOP.motor.gg.gain.value.toFixed(2),Object.entries(musEl).map(([k,e])=>k+':'+(e.paused?'p':'play')).join(' ')]"))
    await pg.evaluate("P.z=1500");await pg.wait_for_timeout(4000)
    print(await pg.evaluate("[zone,musNow,muffle.frequency.value|0,Object.entries(musEl).map(([k,e])=>k+':'+(e.paused?'p':'play')).join(' ')]"))
    await pg.evaluate("P.z=80;__cb.ST.hearts=1");await pg.wait_for_timeout(3000)
    print(await pg.evaluate("[zone,musNow,LOOP.heartbeat&&LOOP.heartbeat.gg.gain.value.toFixed(2)]"))
    print('errs',errs[:5])
    await b.close()
asyncio.run(main())

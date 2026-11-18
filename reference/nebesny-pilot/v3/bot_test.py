import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    pg=await b.new_page(viewport={'width':400,'height':800})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
    await pg.goto('file:///home/claude/game/index.html');await pg.wait_for_timeout(9000)
    print('auto 9s kills',await pg.evaluate('__cb.kills'),'E',await pg.evaluate('__cb.E.map(e=>e.id+":"+e.st)'))
    await pg.screenshot(path='t_auto.png')
    for i,id in enumerate(['drone_eye','ash_worm','turret','soldier','strider_s','strider_m','colossus']):
      await pg.evaluate(f'__cb.killAll();CB.inv=99;__cb.spawn("{id}")')
      await pg.wait_for_timeout(2600 if id!='colossus' else 7000)
      await pg.screenshot(path=f't_{i}_{id}.png')
      print(id,await pg.evaluate('__cb.E.map(e=>e.id+":"+e.st+":"+Math.round(e.z))'))
    print('kills',await pg.evaluate('__cb.kills'),'hp',await pg.evaluate('CB.hp'))
    fps=await pg.evaluate("new Promise(r=>{let n=0,t0=performance.now();function f(){n++;if(performance.now()-t0<2000)requestAnimationFrame(f);else r(n/2)}requestAnimationFrame(f)})")
    print('errs',errs[:5],'fps',fps)
    await b.close()
asyncio.run(main())

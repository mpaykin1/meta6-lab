import os
import sys, time, subprocess
from playwright.sync_api import sync_playwright
srv=subprocess.Popen([sys.executable,'-m','http.server','8778','-d',os.environ.get('SYM_GAME','symphonia/game')],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required'])
    ctx=b.new_context(viewport={'width':390,'height':844},has_touch=True,is_mobile=True,device_scale_factor=2)
    pg=ctx.new_page();pg.add_init_script("window.t=1;window.P=2;window.g=3;window.W=4;window.H=5;window.S=6;window.R=7;")
    pg.on('pageerror',lambda e:errs.append(str(e)+' | '+str(e.stack)[:400]))
    pg.goto('http://localhost:8778/index.html#bot')
    pg.wait_for_function('document.querySelector("#load i").style.width==="100%"',timeout=90000);time.sleep(1);pg.tap('#play');time.sleep(2)
    E=pg.evaluate;S=lambda:E('window.__bot.s')
    E('window.__bot.speed(3)');pg.wait_for_function('window.__bot.s.hall',timeout=60000);E('window.__bot.hall()');time.sleep(5)
    print('state',S()['state'])
    cdp=ctx.new_cdp_session(pg)
    def touch(typ,pts):cdp.send('Input.dispatchTouchEvent',{'type':typ,'touchPoints':[{'x':x,'y':y,'id':i} for i,(x,y) in pts]})
    yaw=lambda:E('(()=>{return window.__bot.yaw()})()')
    # 1. правый джойстик: голова не двигается, прицел двигается быстро
    hr=(390-86,844-135)
    y0=E('window.__bot.cam()');a0=E('window.__bot.aim()')
    touch('touchStart',[(0,hr)]);
    for k in range(1,8):touch('touchMove',[(0,(hr[0]-k*12,hr[1]-k*8))]);time.sleep(.05)
    time.sleep(.6);y1=E('window.__bot.cam()');a1=E('window.__bot.aim()');jr=E("document.getElementById('joyR').style.left")
    touch('touchEnd',[]);print('right joy: cam',y0,'->',y1,' aim',a0,'->',a1,' joyR left',jr)
    # 2. джойстик идёт за пальцем к середине
    touch('touchStart',[(1,hr)]);
    for k in range(1,15):touch('touchMove',[(1,(hr[0]-k*12,hr[1]-k*14))]);time.sleep(.03)
    print('follow: joyR at',E("document.getElementById('joyR').style.left"),E("document.getElementById('joyR').style.top"));touch('touchEnd',[]);time.sleep(.5)
    print('home:',E("document.getElementById('joyR').style.left"))
    # 3. свайп по экрану — голова
    y0=E('window.__bot.cam()');touch('touchStart',[(2,(200,300))])
    for k in range(1,10):touch('touchMove',[(2,(200-k*10,300))]);time.sleep(.03)
    touch('touchEnd',[]);time.sleep(.8);print('swipe cam',y0,'->',E('window.__bot.cam()'))
    # 4. дверь назад во двор и обратно
    E('window.__bot.out()');time.sleep(5);print('after door',S()['state'],S()['p'])
    time.sleep(8);s=S();print('yard blobs',s['blobs'],s['genre'],'H',s['H'])
    pg.screenshot(path='shots/yard.png')
    E('window.__bot.hall()');time.sleep(5);s=S();print('back',s['state'],s['wave'],s['blobs'],s['p'])
    E('window.__bot.look(3.14,.05)');time.sleep(3);pg.screenshot(path='shots/door.png')
    print('fps',E('window.__bot.dyn()'))
    b.close()
srv.terminate();print('ERR',errs[:6])

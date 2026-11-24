import os
import sys, time, subprocess
from playwright.sync_api import sync_playwright
srv=subprocess.Popen([sys.executable,'-m','http.server','8777','-d',os.environ.get('SYM_GAME','symphonia/game')],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required'])
    pg=b.new_page(viewport={'width':1100,'height':700})
    pg.add_init_script("window.t=1;window.P=2;window.g=3;window.W=4;window.H=5;window.S=6;window.R=7;")
    pg.on('pageerror',lambda e:errs.append(str(e)+' | '+str(e.stack)[:600]));pg.on('requestfailed',lambda r:errs.append('RF '+r.url[:100]));pg.on('response',lambda r:errs.append('404 '+r.url[:100]) if r.status==404 else None);pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
    if os.environ.get('SYM_THREE'): pg.route('https://cdn.jsdelivr.net/**', lambda r: r.fulfill(body=open(os.environ['SYM_THREE'],'rb').read(), content_type='application/javascript'))
    pg.goto('http://localhost:8777/index.html#bot')
    pg.wait_for_function('document.querySelector("#load i").style.width==="100%"',timeout=90000);time.sleep(1);pg.click('#play');time.sleep(2)
    E=pg.evaluate;S=lambda:E('window.__bot.s')
    E('window.__bot.speed(3)');pg.wait_for_function('window.__bot.s.hall',timeout=60000);E('window.__bot.hall()');time.sleep(5)
    E('window.__bot.decoTest()');time.sleep(6)
    s=S();print('deco',s['deco'],s['items'])
    shots=[('a_front',0,8.4,0,.05),('b_left',-1,-3,1.2,.05),('e_piano',2.5,3,.35,.0)]
    for n,x,z,y,pt in shots:
        E(f'window.__bot.go({x},{z});window.__bot.look({y},{pt})');time.sleep(3);pg.screenshot(path=f'shots/deco_{n}.png')
    E('window.__bot.go(0,-11);window.__bot.look(0,.18)');time.sleep(3);pg.screenshot(path='shots/deco_c_back.png');E('window.__bot.arkL()');time.sleep(4);pg.screenshot(path='shots/deco_d_backL.png')
    # штора
    E('window.__bot.go(-5.4,-7)');time.sleep(2);print('hide',S()['hide'],S()['genre'],S()['tr'])
    # люстра
    E('window.__bot.go(0,2);window.__bot.forceWave(3)');time.sleep(3);E('window.__bot.spawn(4)');time.sleep(1)
    print('before ly blobs',S()['blobs']);E('window.__bot.ly()');time.sleep(4);s=S();print('after ly',s['blobs'],s['ly'],s['genre'],s['tr'],s['score'])
    # ворона
    E('window.__bot.spawn(1);window.__bot.nearBlob()');time.sleep(1.5);print('crow frz', E('1'))
    E('window.__bot.shootAll()')
    # второй круг: двор
    E('window.__bot.circ()');time.sleep(6);E('window.__bot.go(-1,-4);window.__bot.look(-.74,.05)');time.sleep(3);pg.screenshot(path='shots/deco_f_angel.png')
    E('window.__bot.go(1,-15);window.__bot.look(-.6,.05)');time.sleep(3);pg.screenshot(path='shots/deco_g_bes.png');E('window.__bot.go(-5,-8.4)');time.sleep(1.5);E('window.__bot.go(5,-20.5)');time.sleep(2)
    s=S();print('ext',s['lives'],s['items'],s['genre'])
    b.close()
srv.terminate();print('ERR',errs[:10])
real=[e for e in errs if 'GPU stall' not in e and not e.startswith('RF ') and not e.startswith('404 ') and 'favicon' not in e]
print('ИТОГ:', 'OK' if not real else 'FAIL', '| ошибок:', len(real))
sys.exit(0 if not real else 1)

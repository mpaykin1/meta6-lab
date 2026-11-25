import os, sys, time, subprocess
from playwright.sync_api import sync_playwright
# бот лабиринта: вход после гибели, игрушки, ложный дом, монстры, гибель в лабиринте (лабиринт растёт), выход к дому
GAME=os.environ.get('SYM_GAME','symphonia/game');PORT='8795'
srv=subprocess.Popen([sys.executable,'-m','http.server',PORT,'-d',GAME],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
errs=[];os.makedirs('shots',exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required'])
    pg=b.new_page(viewport={'width':900,'height':600})
    if os.environ.get('SYM_THREE'): pg.route('https://cdn.jsdelivr.net/**', lambda r: r.fulfill(body=open(os.environ['SYM_THREE'],'rb').read(), content_type='application/javascript'))
    pg.add_init_script("window.t=1;window.P=2;window.g=3;window.W=4;window.H=5;window.S=6;window.R=7;")
    pg.on('pageerror',lambda e:errs.append(str(e)+' | '+str(e.stack)[:300]))
    pg.on('console',lambda m:errs.append(m.text) if m.type=='error' and 'Failed to load resource' not in m.text else None)
    pg.goto(f'http://localhost:{PORT}/index.html#bot')
    pg.wait_for_function('document.querySelector("#load i").style.width==="100%"',timeout=120000);time.sleep(1);pg.click('#play');time.sleep(2)
    E=pg.evaluate;E('window.__bot.speed(3)');pg.wait_for_function('window.__bot.s.hall',timeout=90000);E('window.__bot.hall()');time.sleep(4)
    ok=True
    def W8(js,t=30000):
        try: pg.wait_for_function(js,timeout=t);return True
        except Exception as e: print('TIMEOUT',js,E('window.__bot.s.state'),errs[-3:]);return False
    def chk(name,cond):
        global ok
        print(('OK  ' if cond else 'FAIL'),name);ok=ok and bool(cond)
    E('window.__bot.maze()');pg.wait_for_function('window.__bot.s.state==="maze"',timeout=60000);time.sleep(2)
    i1=E('window.__bot.mzInfo()');print('maze1',i1);chk('лабиринт 1 открылся',i1['G']>=5)
    pg.screenshot(path='shots/maze_start.png');print('info',E('window.__bot.info()'))
    E('window.__bot.mzKillAll()');time.sleep(2.5)
    E('window.__bot.mzGo(3);window.__bot.look(0,.05)');time.sleep(2);pg.screenshot(path='shots/maze_in.png');print('info in',E('window.__bot.info()'))
    if 'toy_bear' in i1['items']:
        E("window.__bot.mzItem('toy_bear')");time.sleep(1.5);chk('медвежонок найден','toy_bear' in E('window.__bot.mzInfo()')['found'])
    if E('window.__bot.mzHouse()'):
        seen=False
        for k in range(40):
            if E('window.__darkSeen||0')>0:
                seen=True;time.sleep(.6);pg.screenshot(path='shots/maze_dark.png');break
            time.sleep(.2)
        chk('ложный дом: чёрный зал',seen)
        chk('ложный дом: зашёл и вернулся',W8('window.__bot.s.state==="maze"',20000))
    E('window.__bot.mzKillAll()');time.sleep(3);chk('монстры убиваются',E('window.__bot.mzInfo()')['mons']==0)
    # гибель в лабиринте — он растёт
    E('window.__bot.maze()');pg.wait_for_function('window.__bot.s.state==="maze"',timeout=60000);time.sleep(3)
    i2=E('window.__bot.mzInfo()');print('maze2',i2);chk('лабиринт вырос',i2['G']>i1['G'])
    E('window.__bot.mzHurt()');t0=time.time()
    while time.time()-t0<40 and E('window.__bot.mzInfo()')['deaths']==i2['deaths']:
        E('window.__bot.mzGo(999)');time.sleep(1)
    time.sleep(1)
    for k in range(4):E('window.__bot.maze()');pg.wait_for_function('window.__bot.s.state==="maze"',timeout=60000);time.sleep(1.5)
    i3=E('window.__bot.mzInfo()');print('maze big',i3);pg.screenshot(path='shots/maze_big.png');print('info big',E('window.__bot.info()'))
    E('window.__bot.mzExitGo()');pg.wait_for_function('window.__bot.s.state==="ext"',timeout=30000);time.sleep(2);chk('выход из лабиринта к дому',True)
    E('window.__bot.hall()');pg.wait_for_function('window.__bot.s.state==="hall"',timeout=30000);chk('снова в зале',True)
    b.close()
srv.terminate()
real=[e for e in errs if 'GPU stall' not in e]
print('ERR',real[:8]);print('ИТОГ:', 'OK' if ok and not real else 'FAIL');sys.exit(0 if ok and not real else 1)

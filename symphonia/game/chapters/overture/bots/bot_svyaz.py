# Z23: real chapter pages, real links and memory, existing game controls/hooks; no production branch is mocked.
import base64, json, os, pathlib, threading, functools
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlsplit, parse_qs, quote
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[5]
class Handler(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
BASE=f'http://127.0.0.1:{server.server_port}/symphonia/game/'
OVER=BASE+'chapters/overture/'
fixture={'luchnik':{'pobedy':1,'porazheniya':2,'yarus_max':6,'luk':'bone','perya':12},'adagio':{'krug':1,'smerti':0,'zerkalo':False}}
token=quote(base64.b64encode(json.dumps(fixture).encode()).decode(),safe='')
os.makedirs('shots',exist_ok=True)
def check(cond,label):
    if not cond: raise AssertionError(label)
    print('OK',label,flush=True)
def context(browser):
    c=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True)
    c.add_init_script('window.t=1;window.P=2;window.g=3;window.W=4;window.H=5;window.S=6;window.R=7;')
    return c
def page(c):
    pg=c.new_page();errors=[];nav=[]
    pg.on('pageerror',lambda e:errors.append(str(e)))
    pg.on('request',lambda r:nav.append(r.url) if r.is_navigation_request() else None)
    return pg,errors,nav
def wait(pg,condition,timeout=90000):
    pg.wait_for_function(condition,timeout=timeout)
def nit(pg):
    return pg.evaluate("JSON.parse(localStorage.getItem('mg_nit_v1')||'null')")
def smoke(browser,name):
    with context(browser) as c:
        pg,err,_=page(c)
        pg.goto(OVER+'#bot',timeout=90000)
        wait(pg,'window.__A && window.__A.z23')
        pg.locator('#bPlay').click()
        wait(pg,"window.__A.G.mode==='play'")
        check(pg.evaluate('window.__A.z23().circle')==1,name+' clean overture')
        check(not err,name+' overture JS '+str(err))
        pg.goto(BASE+'#bot',timeout=90000)
        wait(pg,'window.__bot && window.__bot.s.hall')
        pg.locator('#play').click()
        wait(pg,"window.__bot.s.state==='ext'")
        check(not pg.evaluate('window.__bot.z23().feathers'),name+' clean adagio')
        check(not err,name+' clean JS '+str(err))
def linked(browser):
    with context(browser) as c:
        pg,err,nav=page(c)
        pg.goto(OVER+'?nit='+token+'#bot',timeout=90000)
        wait(pg,'window.__A && window.__A.z23')
        check('nit=' not in pg.url and nit(pg)['luchnik']['perya']==12,'import and remove URL token')
        pg.locator('#bPlay').click()
        wait(pg,"window.__A.G.mode==='play' && window.__A.z23().ready")
        pg.evaluate('window.__A.gameOver()')
        pg.locator('#z23Enter').click(timeout=30000)
        wait(pg,"window.__A.z23().mode==='courtyard' && window.__A.z23().progress===1",60000)
        pg.screenshot(path='shots/z23_courtyard.png')
        pg.locator('#z23Enter').click(timeout=30000)
        pg.wait_for_url(BASE+'*',timeout=90000)
        wait(pg,"document.querySelector('#load i').style.width==='100%' && !location.search")
        check(any(urlsplit(u).path==urlsplit(BASE).path and 'nit' in parse_qs(urlsplit(u).query) for u in nav),'actual forward link carries token')
        check(nit(pg)['luchnik']['porazheniya']==3,'loss propagated')
        pg.goto(BASE+'#bot');pg.reload(timeout=90000)
        wait(pg,'window.__bot && window.__bot.s.hall')
        pg.locator('#play').click()
        wait(pg,"window.__bot.s.state==='maze'",120000)
        z=pg.evaluate('window.__bot.z23()')
        check(z['maze'] and z['maze']['extra']==3 and z['maze']['exact'] and z['maze']['length']>z['maze']['baseLength'],'linked longer route +3 turns')
        check(z['fog']>.034,'thicker fog')
        check(z['horns'],'original horns mounted on giant')
        pg.screenshot(path='shots/z23_maze.png')
        pg.evaluate('window.__bot.mzExitGo()')
        wait(pg,"window.__bot.s.state==='ext'")
        pg.evaluate('window.__bot.hall()')
        wait(pg,"window.__bot.s.state==='hall'")
        check(pg.evaluate('window.__bot.z23().feathers'),'feathers in hall')
        pg.evaluate('window.__bot.go(1.45,6.5);window.__bot.look(0,0)')
        wait(pg,'window.__bot.z23().picked',30000)
        pg.evaluate('window.__bot.forceWave(1)')
        wait(pg,"window.__bot.z23().waveState==='run'")
        pg.evaluate('window.__bot.fire()')
        wait(pg,'window.__bot.z23().bonusUsed',15000)
        check(True,'feather pickup activates first-shot bonus')
        pg.screenshot(path='shots/z23_hall.png')
        pg.evaluate('window.__bot.fin()')
        wait(pg,"window.__bot.s.state==='end'",60000)
        back=pg.get_by_role('button',name='Вернуться в Увертюру · следующий круг')
        back.click(timeout=60000)
        pg.wait_for_url(OVER+'*',timeout=90000)
        wait(pg,"window.__A && !location.search")
        check(nit(pg)['adagio']['krug']==2,'return advances circle')
        check(any(urlsplit(u).path==urlsplit(OVER).path and 'nit' in parse_qs(urlsplit(u).query) for u in nav[1:]),'actual reverse link carries token')
        pg.goto(OVER+'#bot');pg.reload(timeout=90000)
        wait(pg,'window.__A && window.__A.z23')
        pg.locator('#bPlay').click()
        wait(pg,'window.__A.z23().circle===2 && window.__A.z23().notes>0',60000)
        pg.screenshot(path='shots/z23_circle2.png')
        check(not err,'linked JS '+str(err))
try:
    with sync_playwright() as p:
        b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required'])
        smoke(b,'Chromium');linked(b);b.close()
        b=p.webkit.launch();smoke(b,'WebKit');b.close()
finally:
    server.shutdown();server.server_close()
print('ИТОГ: OK',flush=True)

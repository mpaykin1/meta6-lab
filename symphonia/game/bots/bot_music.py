import os
import sys, time, subprocess
from playwright.sync_api import sync_playwright
srv = subprocess.Popen([sys.executable,'-m','http.server','8775','-d',os.environ.get('SYM_GAME','symphonia/game')],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
errs=[]
G=['adazhio','noktyurn','uvertyura','skerco','sonata','fuga','tokkata','rekviem','rapsodiya','fantaziya','syuita','simfoniya']
TR=['obval','udar','shkatulka','rastvor','razgon','bezdna','obryv','vospom','voshod','gemiola','led','odin']
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required'])
    pg=b.new_page(viewport={'width':800,'height':600})
    pg.add_init_script("window.t=1;window.P=2;window.g=3;window.W=4;window.H=5;window.S=6;window.R=7;")
    pg.on('pageerror',lambda e:errs.append(str(e)))
    if os.environ.get('SYM_THREE'): pg.route('https://cdn.jsdelivr.net/**', lambda r: r.fulfill(body=open(os.environ['SYM_THREE'],'rb').read(), content_type='application/javascript'))
    pg.goto('http://localhost:8775/index.html#bot')
    pg.wait_for_function('document.querySelector("#load i").style.width==="100%"',timeout=60000);time.sleep(1);pg.click('#play');time.sleep(3)
    def run(g,tr,sec):
        n0=pg.evaluate('window.__bot.notes');pg.evaluate(f'window.__bot.musSet("{g}",{("\""+tr+"\"") if tr else "null"})');time.sleep(sec)
        n=pg.evaluate('window.__bot.notes')-n0;s=pg.evaluate('window.__bot.s');return n/sec,s['genre'],s['tr']
    for g in G:
        r=run(g,None,5);print('%-10s %5.1f нот/с  ->%s'%(g,r[0],r[1]))
    for tr in TR:
        r=run('sonata',tr,4);print('tr %-9s %5.1f нот/с  ->%s %s'%(tr,r[0],r[1],r[2]))
    print('harm notes,snapped,dissonant(half vol):',pg.evaluate('window.__bot.harm'))
    b.close()
srv.terminate();print('ERRORS',errs)

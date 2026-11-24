import sys, time, json, subprocess, os
from playwright.sync_api import sync_playwright

ROOT = os.environ.get('SYM_GAME','symphonia/game')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8773', '-d', ROOT], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
THREE = open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'three.min.mjs'), 'rb').read()
errs = []
mobile = len(sys.argv) > 1 and sys.argv[1] == 'mobile'
out = 'shots/' + ('m_' if mobile else 'd_')
os.makedirs('shots', exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch( args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
    if mobile:
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    else:
        ctx = b.new_context(viewport={'width': 1280, 'height': 720})
    ctx.add_init_script("window.t=1;window.P=2;window.g=3;window.W=4;window.H=5;window.S=6;window.R=7;")
    pg = ctx.new_page()
    pg.route('https://cdn.jsdelivr.net/**', lambda r: r.fulfill(body=THREE, content_type='application/javascript'))
    pg.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
    pg.on('console', lambda m: errs.append(m.type + ': ' + m.text) if m.type in ('error', 'warning') else None)
    pg.on('pageerror', lambda e: errs.append('PAGEERROR: ' + str(e)))
    pg.goto('http://localhost:8773/index.html#bot')
    pg.wait_for_function('document.querySelector("#load i").style.width==="100%"', timeout=60000)
    time.sleep(1)
    if mobile:
        pg.tap('#play')
    else:
        pg.click('#play')
    pg.evaluate('window.__bot.speed(3)')
    time.sleep(4)
    pg.screenshot(path=out + '1_ext.png')
    S = lambda: pg.evaluate('window.__bot.s')
    print('after start', S())
    time.sleep(6)  # idle -> auto walk
    print('autowalk', S(), pg.evaluate('1'))
    pg.screenshot(path=out + '2_walk.png')
    pg.wait_for_function('window.__bot.s.hall', timeout=60000)
    pg.evaluate('window.__bot.hall()')
    time.sleep(4)
    print('hall', S())
    pg.screenshot(path=out + '3_hall.png')
    time.sleep(6)
    print('wave', S())
    pg.evaluate('window.__bot.aimAt(0.8,0.3)')
    time.sleep(.5)
    pg.evaluate('window.__bot.fire()')
    time.sleep(.15)
    pg.screenshot(path=out + '4_blobs.png')
    pg.evaluate('window.__bot.aimAt(0.5,0.62);window.__bot.scare()')
    time.sleep(1.2)
    pg.screenshot(path=out + '4b_scare.png')
    pg.evaluate('window.__bot.fire()')
    time.sleep(.3)
    # let blobs bite to drain harmony -> silence
    t0 = time.time()
    while time.time() - t0 < 40 and not S()['silence']:
        time.sleep(1)
    print('silence?', S())
    time.sleep(3)
    pg.screenshot(path=out + '5_silence.png')
    time.sleep(3)
    pg.evaluate('window.__bot.killV()')
    time.sleep(2.5)
    print('after killV', S())
    pg.evaluate('window.__bot.forceWave(8)')
    # clear waves quickly
    for i in range(60):
        pg.evaluate('window.__bot.shootAll()')
        st = S()
        if st['silence']:
            pg.evaluate('window.__bot.killV()')
        if st['finale'] >= 1:
            break
        time.sleep(1)
    print('waves', S())
    pg.screenshot(path=out + '6_items.png')
    time.sleep(3)
    pg.evaluate('window.__bot.go(0,-6)');pg.evaluate('window.__bot.look(0,0.12)')
    pg.evaluate('(()=>{})()')
    time.sleep(4)
    print('finale', S())
    pg.screenshot(path=out + '7_mirror.png')
    time.sleep(10)
    print('end', S())
    pg.screenshot(path=out + '8_end.png')
    time.sleep(10)
    pg.screenshot(path=out + '9_story.png')
    b.close()
srv.terminate()
print('ERRORS:', len(errs))
for e in errs[:30]:
    print(e)

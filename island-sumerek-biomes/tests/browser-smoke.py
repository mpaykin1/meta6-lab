#!/usr/bin/env python3
"""Headless Chrome WebGL smoke / screen-difference proxy. Never assigns owner PASS."""
import json, os, time, threading, statistics, subprocess
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
from PIL import Image, ImageChops

root=Path(__file__).resolve().parents[2]
evidence=root/'island-sumerek-biomes'/'evidence'
evidence.mkdir(exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
os.chdir(root)
server=ThreadingHTTPServer(('127.0.0.1',18677),Quiet)
threading.Thread(target=server.serve_forever,daemon=True).start()
scenes=[]
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(channel='chrome',headless=True,args=['--no-sandbox','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader'])
  for name,biome,seed,mobile,width,height in [('classic_desktop','classic',1337,False,1200,800),('gothic_desktop','gothic',1337,False,1200,800),('tokyo_desktop','tokyo',1337,False,1200,800),('tokyo_mobile','tokyo',2077,True,414,896)]:
   context=browser.new_context(viewport={'width':width,'height':height},is_mobile=mobile,has_touch=mobile,device_scale_factor=1,ignore_https_errors=True)
   page=context.new_page()
   errors=[]; failed=[]
   page.on('pageerror',lambda err:errors.append(str(err)))
   page.on('requestfailed',lambda request:failed.append(request.url))
   page.goto('http://127.0.0.1:18677/island-sumerek-biomes/?biome='+biome+'&seed='+str(seed),wait_until='domcontentloaded',timeout=30000)
   page.wait_for_function('window.__isle && window.__isle.G.state === "title"',timeout=75000)
   assert page.locator('#biomeSelect option').count()==10
   page.locator('#btnStart').click(timeout=10000)
   page.wait_for_function('window.__isle.G.state === "play"',timeout=20000)
   # A fixed sleep captured a dark fade frame on software WebGL runners.
   # Force the intro transition to its steady state before assessing artwork.
   page.evaluate('window.__isle.G.fade = 1')
   page.wait_for_timeout(5000)
   state=page.evaluate("""() => ({
      biome:window.__isle.biome, coinCount:window.__isle.world.coins.length,
      props:window.__isle.biomeMetrics.spriteProps,
      mesh3d:window.__isle.biomeMetrics.mesh3d,
      animated3d:window.__isle.biomeMetrics.animated3DCharacters,
      animated25d:window.__isle.biomeMetrics.animated25DObjects,
      landmarks:window.__isle.biomeMetrics.landmarks,
      fps:window.__isle.perf.lastFps || 0,
      touch:!document.getElementById('touch').hidden,
      fade:window.__isle.G.fade,
      state:window.__isle.G.state
    })""")
   assert state['biome']==biome and state['coinCount']==20 and state['state']=='play',state
   assert state['touch']==mobile,(name,state)
   if biome!='classic':assert state['props']>=18 and state['mesh3d']>=15 and state['animated3d']>=1 and state['animated25d']>=1,state
   assert not errors and not failed,dict(errors=errors,requests=failed)
   page.screenshot(path=str(evidence/(name+'.png')),animations='disabled')
   scenes.append({'name':name,**state,'errors':errors,'failedRequests':failed})
   context.close()
  browser.close()
 # Changed-pixel percentage is an explicit VISUAL PROXY, not human-judged quality.
 # Sample same fixed-seed camera without HUD corners; threshold=20 RGB levels.
 im=Image.open(evidence/'classic_desktop.png').convert('RGB')
 metrics={}
 for other in ['gothic_desktop','tokyo_desktop']:
  target=Image.open(evidence/(other+'.png')).convert('RGB')
  box=(int(im.width*.13),int(im.height*.15),int(im.width*.87),int(im.height*.87))
  base=im.crop(box);alt=target.crop(box)
  changed=0;total=base.width*base.height
  for a,b in zip(base.getdata(),alt.getdata()):
   if max(abs(a[k]-b[k]) for k in range(3))>20:changed+=1
  metrics[other]=round(changed/total*100,2)
 result={'status':'PASS','technicalOnly':True,'ownerVerdict':'PENDING','scenes':scenes,'pixelDifferenceVsClassic':metrics,'minimumVisualDifference':85}
 (evidence/'qa.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
 print(json.dumps(result,ensure_ascii=False))
 assert all(v>85 for v in metrics.values()),'pixel-difference gate below 85%; cannot claim human visual noticeability'
finally:server.shutdown()

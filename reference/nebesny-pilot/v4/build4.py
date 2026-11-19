import json,base64
v2=open('/home/claude/game/v2.html').read()
head=v2[:v2.index('<script>')]
head=head.replace('<title>Небесный пилот</title>','<title>Небесный пилот — три мира</title>')
meta=json.load(open('/home/claude/bake/meta.json'));A={}
for k,v in meta.items():A[k]=dict(v,url='data:image/png;base64,'+base64.b64encode(open(f'/home/claude/bake/{k}.png','rb').read()).decode())
segs=json.load(open('/home/claude/bake/worm_segs.json'));sub=json.load(open('/home/claude/sub/sub_atlas.json'))
code=open('main.js').read()+'\n'+open('combat.js').read()+'\n'+open('frame.js').read()
html=head+"<script>window.ENEMY_ATLAS="+json.dumps(A,ensure_ascii=False)+";window.WORM_SEGS="+json.dumps(segs)+";window.SUB_ATLAS="+json.dumps(sub)+";</script>\n<script>\n"+code+"\n</script></body></html>"
open('index.html','w').write(html);print(len(html))

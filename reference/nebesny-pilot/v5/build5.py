import json,base64,io
from PIL import Image
v2=open('/home/claude/game/v2.html').read()
head=v2[:v2.index('<script>')].replace('<title>Небесный пилот</title>','<title>Небесный пилот — три мира</title>')
def grid(img,W,D,H,F):
    cols=max(1,min(H,2048//W));rows=-(-H//cols);out=Image.new('RGBA',(W*cols,D*rows*F))
    for f in range(F):
        for s in range(H):out.paste(img.crop((s*W,f*D,s*W+W,f*D+D)),((s%cols)*W,(f*rows+s//cols)*D))
    b=io.BytesIO();out.save(b,'PNG',optimize=True);return cols,'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
meta=json.load(open('/home/claude/bake/meta.json'));A={}
for k,v in meta.items():
    im=Image.open(f'/home/claude/bake/{k}.png').convert('RGBA');cols,url=grid(im,v['W'],v['D'],v['H'],v['F']);A[k]=dict(v,cols=cols,url=url)
sub=json.load(open('/home/claude/sub/sub_atlas.json'))
for k,v in sub.items():
    im=Image.open(io.BytesIO(base64.b64decode(v['url'].split(',')[1]))).convert('RGBA');cols,url=grid(im,v['W'],v['D'],v['H'],v['F']);v['cols']=cols;v['url']=url
segs=json.load(open('/home/claude/bake/worm_segs.json'))
code=open('main.js').read()+'\n'+open('combat.js').read()+'\n'+open('frame.js').read()
html=head+"<script>window.ENEMY_ATLAS="+json.dumps(A,ensure_ascii=False)+";window.WORM_SEGS="+json.dumps(segs)+";window.SUB_ATLAS="+json.dumps(sub)+";</script>\n<script>\n"+code+"\n</script></body></html>"
open('index.html','w').write(html);print(len(html),max(v['cols']*v['W'] for v in sub.values()))

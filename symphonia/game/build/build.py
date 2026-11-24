import json,re,base64,os,subprocess
G=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));B=os.path.join(G,'build');T=os.path.join(B,'tmp');os.makedirs(T,exist_ok=True)
if not os.path.exists(os.path.join(B,'node_modules','three')):subprocess.run(['npm','install','--no-save','--prefix',B,'three@0.160.0','esbuild@0.24.0'],check=True)
s=open(os.path.join(G,'src','index.html')).read()
i=s.index('<script type="module">');j=s.index('</script>',i)
head=s[:i];js=s[i+len('<script type="module">'):j];tail=s[j+len('</script>'):]
def R(a,b):
    global js
    assert a in js,a[:60];js=js.replace(a,b)
R("import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';","import * as THREE from './shim.js';const A=window.__A;")
R("new THREE.TextureLoader().load('a/'+name+'.webp',","new THREE.TextureLoader().load(A['spr_'+name],")
R("Object.assign(man,await (await fetch('a/manifest.json')).json());","Object.assign(man,A.man);")
R("const extMeta=await (await fetch('a/ext/ext_meta.json')).json();wInfo=await (await fetch('a/st/weapons.json')).json();","const extMeta=A.extMeta;wInfo=A.wInfo;")
R("loadImg('a/ext/'+k+'.png')","loadImg(A['ext_'+k])");R("loadImg('a/ext/sky.jpg')","loadImg(A.sky)");R("loadImg('a/ext/stone.jpg')","loadImg(A.stone)")
R("loadImg('a/st/'+w.n+'.png')","loadImg(A['st_'+w.n])");R("loadImg('a/pian_body.png'),loadImg('a/pian_arm.png')","loadImg(A.pian_body),loadImg(A.pian_arm)")
assert "'a/" not in js
names=sorted(set(re.findall(r'THREE\.([A-Za-z0-9_]+)',js)))
open(os.path.join(T,'shim.js'),'w').write('export {'+','.join(names)+"} from 'three';")
open(os.path.join(T,'game.js'),'w').write(js)
subprocess.run([os.path.join(B,'node_modules','.bin','esbuild'),os.path.join(T,'game.js'),'--bundle','--minify','--format=esm','--external:three','--target=es2020','--outfile='+os.path.join(T,'game.min.js')],check=True)
def extra():
    # новые спрайты: всё, что перечислено в HALL_SPR/EXT_SPR исходника, но ещё не встроено, берётся из src/a/<имя>.webp
    have=open(os.path.join(B,'assets.js')).read()+open(os.path.join(B,'assets2.js')).read()
    src=open(os.path.join(G,'src','index.html')).read();names=set()
    for lst in re.findall(r"const (?:HALL_SPR|EXT_SPR)=\[([^\]]*)\]",src):names|=set(re.findall(r"'([a-z0-9_]+)'",lst))
    man=json.load(open(os.path.join(G,'src','a','manifest.json')));add={};mm={}
    for n in sorted(names):
        if '"spr_'+n+'"' in have:continue
        f=os.path.join(G,'src','a',n+'.webp')
        if not os.path.exists(f) or n not in man:raise SystemExit('нет файла или записи manifest.json для спрайта '+n)
        add['spr_'+n]='data:image/webp;base64,'+base64.b64encode(open(f,'rb').read()).decode();mm[n]=man[n]
    if add:print('встроены новые спрайты:',sorted(mm))
    return ('Object.assign(window.__A.man,'+json.dumps(mm)+');Object.assign(window.__A,'+json.dumps(add)+');') if add else ''
font=open(os.path.join(B,'fontcss.txt')).read()
head=head.replace('<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,500&display=swap" rel="stylesheet">','').replace('<style>','<style>\n'+font,1)
g=open(os.path.join(T,'game.min.js')).read().replace('</script','<\\/script')
# three.js подключается с CDN, как во всех играх репозитория; картинки и код игры — внутри файла. Модуль = своя область видимости (правило iPhone)
CDN='https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js'
g=re.sub(r'from\s*"three"','from"'+CDN+'"',g);assert CDN in g
open(os.path.join(G,'index.html'),'w').write(head+'<script>'+open(os.path.join(B,'assets.js')).read()+open(os.path.join(B,'assets2.js')).read()+extra()+'</script>\n<script type="module">'+g+'</script>'+tail)
print(os.path.getsize(os.path.join(G,'index.html'))/1048576)

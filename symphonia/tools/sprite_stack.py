import json, math, os, sys
from PIL import Image, ImageDraw
OUT=sys.argv[1]
GOLD=(216,182,115); INK=(236,227,207); BLACK=(14,12,16); FOG=(140,143,152); STONE=(92,94,104)
S=32
def blank(): return Image.new('RGBA',(S,S),(0,0,0,0))
def piano():
    L=[]
    for i in range(12):
        im=blank(); d=ImageDraw.Draw(im)
        if i<6:
            for x,y in [(9,8),(22,9),(15,24)]: d.rectangle([x-1,y-1,x,y],fill=BLACK+(255,))
        elif i<10:
            d.polygon([(6,5),(25,5),(26,12),(22,20),(17,27),(10,27),(6,22)],fill=BLACK+(235,),outline=GOLD+(255,) if i==9 else (40,34,30,255))
            if i==8:
                for x in range(7,25): d.point((x,5),fill=INK+(255,) if x%3 else BLACK+(255,))
        else:
            d.polygon([(8,6),(25,6),(26,12),(22,19),(17,25),(11,25)],fill=(24,20,24,180),outline=GOLD+(200,))
        L.append(im)
    return L,'royal','Призрачный рояль героини — сердце зала «Адажио»'
def candelabra():
    L=[]
    for i in range(20):
        im=blank(); d=ImageDraw.Draw(im); c=16
        if i<2: d.ellipse([c-6,c-6,c+5,c+5],fill=GOLD+(255,),outline=(120,95,50,255))
        elif i<13: d.rectangle([c-1,c-1,c,c],fill=GOLD+(255,))
        elif i==13: d.line([(c-9,c),(c+8,c)],fill=GOLD+(255,),width=2); d.line([(c,c-1),(c,c)],fill=GOLD+(255,))
        elif i<18:
            for x in (c-9,c,c+8): d.rectangle([x-1,c-1,x,c],fill=INK+(255,))
        else:
            a=255 if i==18 else 150
            for x in (c-9,c,c+8): d.ellipse([x-2,c-2,x+1,c+1],fill=(240,160,64,a))
        L.append(im)
    return L,'kandelyabr','Канделябр-свеча: её пламя дрожит в такт мелодии'
def column():
    L=[]
    for i in range(28):
        im=blank(); d=ImageDraw.Draw(im); c=16
        if i<3 or i>24: d.rectangle([c-8,c-8,c+7,c+7],fill=STONE+(220,),outline=FOG+(255,))
        else:
            a=int(200-60*abs(math.sin(i*0.5)))
            d.ellipse([c-5,c-5,c+4,c+4],fill=STONE+(a,),outline=FOG+(a,))
            if i%6==0: d.point((c+3,c-2),fill=GOLD+(255,))
        L.append(im)
    return L,'kolonna','Колонна усадьбы, тающая в тумане'
def save(layers,name,desc):
    dd=os.path.join(OUT,name); os.makedirs(dd,exist_ok=True)
    strip=Image.new('RGBA',(S*len(layers),S),(0,0,0,0))
    for i,l in enumerate(layers): strip.paste(l,(i*S,0))
    strip.save(os.path.join(dd,'slices.png'))
    frames=[]; Z=4; H=S*Z+len(layers)*Z*1+S*Z
    for k in range(36):
        f=Image.new('RGBA',(S*Z*2,H),(0,0,0,0)); ang=k*10
        for i,l in enumerate(layers):
            big=l.resize((S*Z,S*Z),Image.NEAREST).rotate(ang,resample=Image.NEAREST,expand=True)
            sq=big.resize((big.width,big.height//2),Image.NEAREST)
            x=(f.width-sq.width)//2; y=H-sq.height-S*Z//4-i*Z
            f.alpha_composite(sq,(x,y))
        frames.append(f)
    p=[fr.convert('RGBA') for fr in frames]
    p[0].save(os.path.join(dd,'preview.gif'),save_all=True,append_images=p[1:],duration=70,loop=0,disposal=2,transparency=0)
    json.dump({"name":name,"opisanie":desc,"slices":len(layers),"slice_px":S,"format":"slices.png: срезы слева направо = снизу вверх","stil":"призрачный, «Адажио»: туман, золото свечей #d8b673, кость #ece3cf, фон #07080a","glava":"Адажио","anim":{"kolyhanie":"срезы смещаются по синусоиде, амплитуда растёт от zhestokost","svechenie":"пульс в такт SYM_STATE.takt"},"avtor":"Claude, эталон стиля для автозадач"},open(os.path.join(dd,'asset.json'),'w'),ensure_ascii=False,indent=1)
    return name,desc
for fn in (piano,candelabra,column): print(*save(*fn()))

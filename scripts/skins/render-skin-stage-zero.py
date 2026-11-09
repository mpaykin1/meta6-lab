from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
from collections import Counter
import json,math,os,subprocess

p=Path("skins/packs/rusty-robot")
ref=p/"reference.png"
sha="f66ad0f0cf976b86600e91efd3e819cb81afe8d1"
assert subprocess.check_output(["git","hash-object",str(ref)],text=True).strip()==sha,"wrong owner sketch"
im=Image.open(ref).convert("RGB")
s=im.copy();s.thumbnail((400,400))
counts=Counter(s.quantize(colors=96,method=Image.Quantize.MEDIANCUT).convert("RGB").getdata())
targets=[
 ("угольная тень",(24,19,24)),("железо",(47,36,37)),("тёмный металл",(77,62,63)),
 ("глубокая ржавчина",(93,55,35)),("коричневая ржа",(126,72,42)),("рыжая пластина",(159,94,49)),
 ("светлая ржа",(191,115,60)),("светлая грань",(217,151,84)),("тёплая колба",(249,181,86)),
 ("жёлтый отблеск",(252,218,143)),("провод/тень",(83,83,108)),("электрическая дуга",(163,164,202))
]
colors=[]
for name,target in targets:
    ranked=sorted(counts,key=lambda c:sum((c[k]-target[k])**2 for k in range(3)))
    choice=next((c for c in ranked if all(math.dist(c,v)>16 for v in colors)),None)
    if choice is None: raise RuntimeError("Sketch does not have 12 separated colours")
    colors.append(choice)
palette=["#%02x%02x%02x"%c for c in colors]
points=[]
for col in colors:
    pix=im.load();best=(1e20,0,0)
    for y in range(0,im.height,max(1,im.height//160)):
        for x in range(0,im.width,max(1,im.width//160)):
            val=sum((pix[x,y][k]-col[k])**2 for k in range(3))
            if val<best[0]:best=(val,x,y)
    points.append((best[1],best[2]))
data=json.loads((p/"skin.json").read_text())
data["palette"]=palette
(p/"skin.json").write_text(json.dumps(data,indent=2,ensure_ascii=False)+"\n")
inventory=[
 ("Макушка","сломанный зубчатый обод","рыжая ржа","нет"),
 ("Над головой","парящий огонёк","золото","да, этап 4/5"),
 ("Антенна","стержень, шарнир","железо","да, этап 5"),
 ("Голова","крупная рваная броня","ржавчина","нет"),
 ("Лицо","линза-глаз кольцом","янтарь","да, этап 4"),
 ("Лицо","светящиеся щели","оранжевый","да, этап 4"),
 ("Затылок","трещины, щербатые края","темная ржа","нет"),
 ("Плечи","нависающие щитки","охра","нет"),
 ("Плечи","болты и шарниры","железо","да, этап 5"),
 ("Грудь","светящаяся колба","янтарь","да, этап 4"),
 ("Грудь","внутренние шестерни","тёмный металл","да, этап 5"),
 ("Грудь","рваный нагрудник","ржа","нет"),
 ("Живот","панель с полосами","медь и ржа","нет"),
 ("Бока","дыры между пластинами","тёмная механика","нет"),
 ("Плечи и руки","открытые тяги","железо","да, этап 5"),
 ("Предплечья","поршни в рамах","металл","да, этап 5"),
 ("Локти","круглые крепежи","железо","да, этап 5"),
 ("Кисти","составные пальцы","тёмная ржа","нет"),
 ("Спина и руки","кабели с провисанием","тёмный графит","да, этап 5"),
 ("Концы кабелей","короткие электродуги","прохладный свет","да, этап 6"),
 ("Таз","шарниры и обломки панциря","ржа","нет"),
 ("Бедра","крупные неровные пластины","рыжая ржа","нет"),
 ("Колени","видимые механические узлы","железо","да, этап 5"),
 ("Голени","полосы свечения в броне","тёплый янтарь","да, этап 4"),
 ("Ступни","тяжёлые раздельные башмаки","тёмная ржа","нет"),
 ("Вокруг корпуса","искры и пар","свет/дым","да, этап 6")
]
table="\n".join("| "+" | ".join(r)+" |" for r in inventory)
palt="\n".join("| %s | %s | %s | %s |"%(i+1,targets[i][0],palette[i],points[i]) for i in range(12))
(p/"README.md").write_text("# Ржавый робот: этап 0 — разбор эскиза\n\n"+
"| Часть тела | Деталь | Цвет | Двигается |\n|---|---|---|---|\n"+table+
"\n\n## Палитра: 12 цветов из исходного эскиза\n\n| № | Поверхность | Цвет | Точка пикселя на исходнике |\n|---|---|---|---|\n"+palt+
"\n\nСилуэт: грубая асимметричная броня, крупные сколы; внутри видна механика, колба светится тёплым оранжевым, дуги связаны с кабелями. Движения указанны для будущих этапов, на этапе 0 не создаются.\n",encoding="utf-8")
canvas=Image.new("RGBA",(1920,1280),(25,27,31,255));d=ImageDraw.Draw(canvas)
font="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
ft=ImageFont.truetype(font,31);md=ImageFont.truetype(font,19);sm=ImageFont.truetype(font,15)
d.text((50,28),"ЭТАП 0 · ОРИГИНАЛ И КАРТА ДЕТАЛЕЙ",font=ft,fill="#f3ddbc")
d.text((50,83),"Слева — эскиз владельца, справа — разбор и взятые с него цвета",font=md,fill="#aaabb0")
d.rounded_rectangle((40,132,960,1237),radius=12,fill="#373637",outline="#867666",width=2)
d.rounded_rectangle((982,132,1882,1237),radius=12,fill="#2c3033",outline="#867666",width=2)
d.text((67,153),"ЭСКИЗ · ИСХОДНЫЕ ПИКСЕЛИ",font=md,fill="#f2d6af")
scale=min(854/im.width,920/im.height)
view=im.convert("RGBA").resize((round(im.width*scale),round(im.height*scale)),Image.Resampling.NEAREST)
ox=68+(854-view.width)//2;oy=208+(920-view.height)//2
canvas.alpha_composite(view,(ox,oy));d=ImageDraw.Draw(canvas)
anchors=[(.5,.09),(.45,.20),(.55,.27),(.53,.35),(.32,.40),(.67,.41),(.46,.51),(.56,.57),(.30,.62),(.70,.62),(.39,.74),(.63,.75),(.39,.92),(.62,.92)]
labels=["Огонёк","Шлем","Глаз","Щели","Левое плечо","Правое плечо","Колба","Шестерни","Кабель L","Кабель R","Броня ног","Коленные узлы","Ступня L","Ступня R"]
for i,(fx,fy) in enumerate(anchors):
    x=int(ox+fx*view.width);y=int(oy+fy*view.height)
    d.line((x-27,y-19,x,y),fill="#ffc782",width=2)
    d.ellipse((x-51,y-44,x-12,y-5),fill="#282a30",outline="#ffd294",width=2)
    d.text((x-45,y-37),str(i+1).zfill(2),font=sm,fill="#f9d09b")
d.text((1006,156),"ДЕТАЛИ / ПРИВЯЗКА К СИЛУЭТУ",font=md,fill="#f4d3a6")
for i,name in enumerate(labels):
    y=200+i*38
    d.text((1009,y),str(i+1).zfill(2),font=md,fill="#efb878")
    d.text((1058,y),name,font=md,fill="#e8e0d7")
d.line((1008,770,1834,770),fill="#7a7169",width=2)
d.text((1008,793),"ПАЛИТРА: СЧИТАНО С ЭСКИЗА",font=md,fill="#f3d1a2")
for i,((name,_),col) in enumerate(zip(targets,colors)):
    x=1013+(i//6)*420;y=841+(i%6)*57
    d.rounded_rectangle((x,y,x+53,y+39),radius=3,fill=col+(255,),outline="#e1d7c8",width=1)
    d.text((x+64,y),str(i+1).zfill(2)+"  "+palette[i],font=sm,fill="#f4dfc0")
    d.text((x+64,y+22),name,font=sm,fill="#aaa9a8")
d.text((68,1192),"Номера = части корпуса. Образцы цветов взяты из reference.png.",font=sm,fill="#ecd0a6")
(p/"stages").mkdir(exist_ok=True)
canvas.save(p/"stages/0.png",format="PNG",optimize=True)
run=os.environ.get("GITHUB_RUN_ID","")
commit=os.environ.get("GITHUB_SHA",subprocess.check_output(["git","rev-parse","HEAD"],text=True).strip())
url="https://github.com/mpaykin1/meta6-lab"
(p/"STAGE.md").write_text("# Ржавый робот — поэтапная сборка\n\n"+
"- этап 0 сделан\n"+
"- SHA: "+url+"/commit/"+commit+"\n"+
"- Прогон: "+url+"/actions/runs/"+run+"\n"+
"- Картинка: "+url+"/blob/lab/skin-rusty-robot/skins/packs/rusty-robot/stages/0.png\n"+
"- Таблица 26 деталей и 12 образцов палитры: README.md\n"+
"- Эскиз: reference.png, Git blob "+sha+"\n"+
"- Статус: сдано на проверку Claude, следующий этап запрещён до комментария принятия.\n"+
"\nДанные взяты исключительно из исходного эскиза. Старые картинки пакета не использованы.\n",encoding="utf-8")
print("STAGE 0",len(inventory),"details",len(palette),"sampled colours",im.size)

# Tiny source and comparison thumbnails for the private visual acceptance step.
# Encoded into ephemeral CI logs only, never stored in the skin package.
import io,base64
for label,src in [("ORIGINAL",im),("COMPARISON",canvas)]:
    thumb=src.copy()
    thumb.thumbnail((420,620))
    buf=io.BytesIO()
    thumb.save(buf,format="PNG",optimize=True)
    print("SKIN_VISUAL_"+label+"="+base64.b64encode(buf.getvalue()).decode("ascii"))

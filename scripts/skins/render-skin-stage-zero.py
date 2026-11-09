from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
from collections import Counter
import json,math,os,subprocess

p=Path("skins/packs/rusty-robot")
ref=p/"reference.png"
sha="f66ad0f0cf976b86600e91efd3e819cb81afe8d1"
assert subprocess.check_output(["git","hash-object",str(ref)],text=True).strip()==sha,"wrong owner sketch"
im=Image.open(ref).convert("RGB")
# Sample the ACTUAL reference PNG within semantic regions of the robot.
# Stage 0 cannot inherit, colourise or repaint the rejected skin graphics.
specs=[
 ("угольная тень",(.46,.47),(.08,.06),(28,23,29),"dark"),
 ("железо",(.55,.54),(.08,.06),(52,38,41),"dark"),
 ("тёмный металл",(.58,.59),(.09,.07),(76,58,58),"dark"),
 ("глубокая ржавчина",(.39,.34),(.11,.08),(94,55,39),"rust"),
 ("коричневая ржа",(.47,.36),(.14,.07),(127,74,44),"rust"),
 ("рыжая пластина",(.47,.46),(.10,.06),(161,88,46),"rust"),
 ("светлая ржа",(.56,.32),(.11,.09),(209,113,56),"rust"),
 ("светлая грань",(.61,.47),(.09,.09),(235,140,77),"rust"),
 ("тёплая колба",(.49,.65),(.09,.055),(252,165,48),"glow"),
 ("жёлтый огонёк",(.51,.21),(.09,.045),(255,214,100),"glow"),
 ("провод / тень",(.72,.34),(.11,.07),(107,91,124),"cool"),
 ("электрическая дуга",(.77,.60),(.12,.065),(167,159,240),"blue")
]
targets=[(name,target) for name,ctr,r,target,mode in specs]
colors=[];points=[]
for name,(cx,cy),(rx,ry),target,mode in specs:
    x0=max(0,int((cx-rx)*im.width));x1=min(im.width,int((cx+rx)*im.width))
    y0=max(0,int((cy-ry)*im.height));y1=min(im.height,int((cy+ry)*im.height))
    zone=im.crop((x0,y0,x1,y1))
    candidates=[]
    for j,col in enumerate(zone.getdata()):
        r,g,b=col
        if mode=="dark" and max(col)>125:continue
        if mode=="rust" and not(r>g*1.13 and g>b*1.08 and r>55):continue
        if mode=="glow" and not(r>=185 and g>=103 and r>g*1.05):continue
        if mode=="cool" and not(b>r*1.04):continue
        if mode=="blue" and not(b>r*1.17 and b>g*1.02 and b>=105):continue
        if any(math.dist(col,other)<18 for other in colors):continue
        candidates.append((sum((col[k]-target[k])**2 for k in range(3)),j,col))
    # No false gold/blue claims: if a region has no suitable pixels,
    # choose the closest authentic pixel and let the visual review catch it.
    if not candidates:
        for j,col in enumerate(zone.getdata()):
            if all(math.dist(col,other)>=18 for other in colors):
                candidates.append((sum((col[k]-target[k])**2 for k in range(3)),j,col))
    if not candidates:raise RuntimeError("No unselected reference colour for "+name)
    score,j,col=min(candidates)
    colors.append(col)
    points.append((x0+j%zone.width,y0+j//zone.width))
palette=["#%02x%02x%02x"%c for c in colors]
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
crop_box=(round(im.width*.21),round(im.height*.17),round(im.width*.79),round(im.height*.82))
focus=im.crop(crop_box)
scale=min(854/focus.width,920/focus.height)
view=focus.convert("RGBA").resize((round(focus.width*scale),round(focus.height*scale)),Image.Resampling.NEAREST)
ox=68+(854-view.width)//2;oy=208+(920-view.height)//2
canvas.alpha_composite(view,(ox,oy));d=ImageDraw.Draw(canvas)
anchors=[(.51,.21),(.51,.30),(.36,.37),(.49,.52),(.35,.47),(.65,.47),(.49,.64),(.61,.56),(.32,.67),(.69,.57),(.43,.72),(.59,.73),(.42,.77),(.59,.77)]
labels=["Огонёк над головой","Большой сферический шлем","Боковой глаз-кольцо","Три световые щели груди","Левый ржавый наплечник","Правый ржавый наплечник","Горячая колба живота","Боковая шестерня","Кабель и разряд слева","Кабель и разряд справа","Повреждённая пластина голени","Световой паз ноги","Левая тяжёлая ступня","Правая тяжёлая ступня"]
for i,(fx,fy) in enumerate(anchors):
    x=int(ox+(fx-.21)/(.79-.21)*view.width);y=int(oy+(fy-.17)/(.82-.17)*view.height)
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

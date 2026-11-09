#!/usr/bin/env python3
"""Stage 1 only. Generates two 64px materials and a visual comparison; stage 0 is immutable."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import os, subprocess, math, json
root=Path("skins/packs/rusty-robot")
palette=json.loads((root/"skin.json").read_text())["palette"]
required={"#20141e","#35242a","#4d3a3c","#613528","#83482d","#a65333","#d27238","#eb8b4b"}
assert required.issubset(set(palette)), "Approved palette changed"
C={s:tuple(bytes.fromhex(s[1:]))+(255,) for s in palette}
rust=Image.new("RGBA",(64,64),C["#a65333"])
d=ImageDraw.Draw(rust)
# The broad rust plane covers >60% of the area in three solid approved colours.
d.polygon([(0,0),(63,0),(63,19),(55,20),(46,24),(33,19),(24,29),(0,25)],fill=C["#d27238"])
d.polygon([(0,39),(13,35),(22,40),(34,38),(43,44),(63,39),(63,64),(0,64)],fill=C["#a65333"])
d.polygon([(0,0),(63,0),(63,2),(6,2),(3,6),(0,6)],fill=C["#eb8b4b"])
d.line([(0,3),(59,3)],fill=C["#eb8b4b"],width=1)
d.polygon([(60,7),(63,4),(63,63),(5,63),(5,61),(57,60),(61,53)],fill=C["#613528"])
d.line([(0,60),(57,60)],fill=C["#83482d"],width=2)
# Two intentional fine cracks, no random pixels or grain.
d.line([(19,13),(23,19),(21,26),(27,30),(26,36)],fill=C["#613528"],width=1)
d.line([(47,36),(43,42),(46,48),(40,52)],fill=C["#83482d"],width=1)
for x,y in [(8,8),(55,8),(8,55),(55,55)]:
 d.ellipse((x-3,y-3,x+3,y+3),fill=C["#35242a"],outline=C["#613528"],width=1)
 d.point((x-1,y-2),fill=C["#eb8b4b"])
 d.point((x,y-2),fill=C["#eb8b4b"])
metal=Image.new("RGBA",(64,64),C["#20141e"])
m=ImageDraw.Draw(metal)
# All edges repeat seamlessly. Dark recesses between big pipes.
m.rectangle((0,0,63,63),fill=C["#20141e"])
for x in (7,27,48):
 m.rectangle((x-3,0,x+5,63),fill=C["#35242a"])
 m.rectangle((x-2,0,x-1,63),fill=C["#4d3a3c"])
 m.rectangle((x+3,0,x+5,63),fill=C["#20141e"])
for y in (15,46):
 m.rectangle((0,y-4,63,y+4),fill=C["#35242a"])
 m.line((0,y-3,63,y-3),fill=C["#4d3a3c"],width=2)
 m.line((0,y+3,63,y+3),fill=C["#20141e"],width=2)
for x,y in ((13,15),(42,15),(13,46),(42,46)):
 m.ellipse((x-5,y-5,x+5,y+5),fill=C["#4d3a3c"],outline=C["#20141e"],width=1)
 m.rectangle((x-2,y-1,x+2,y+1),fill=C["#35242a"])
 m.line((x-3,y-3,x-1,y-3),fill=C["#83482d"],width=1)
# Additional broad diagonal piston rod, with a two-tone edge.
m.polygon([(17,29),(21,27),(45,37),(43,40)],fill=C["#4d3a3c"])
m.line([(19,28),(44,38)],fill=C["#83482d"],width=1)
root.joinpath("textures").mkdir(exist_ok=True)
rust.save(root/"textures/rust.png",optimize=True)
metal.save(root/"textures/metal.png",optimize=True)
# Compare directly against two tight crops from original owner's sketch.
source=Image.open(root/"reference.png").convert("RGB")
w,h=source.size
# Chest plate and mechanical opening, measured as proportions of the owner image.
plate=source.crop(tuple(map(round,(w*.39,h*.49,w*.59,h*.61))))
mechanics=source.crop(tuple(map(round,(w*.47,h*.57,w*.66,h*.70))))
W,H=1660,930
out=Image.new("RGB",(W,H),(29,30,34));g=ImageDraw.Draw(out)
font="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
head=ImageFont.truetype(font,28);body=ImageFont.truetype(font,19);small=ImageFont.truetype(font,15)
g.text((36,23),"ЭТАП 1 · РЖАВАЯ БРОНЯ / ТЁМНАЯ МЕХАНИКА",font=head,fill="#efdfc8")
g.text((36,72),"СЛЕВА — увеличенные фрагменты оригинального эскиза     СПРАВА — 64×64, nearest ×4 и 2×2 без швов",font=body,fill="#b8b0a7")
for x0,x1 in ((32,690),(706,1625)):
 g.rounded_rectangle((x0,120,x1,890),radius=12,fill="#383637",outline="#766a5f",width=2)
g.text((60,145),"01 / ЭСКИЗ: ПЛАСТИНА ГРУДИ",font=body,fill="#f5d5a9")
g.text((60,504),"02 / ЭСКИЗ: МЕХАНИКА В РАЗРЫВЕ",font=body,fill="#f5d5a9")
out.paste(plate.resize((555,300),Image.Resampling.NEAREST),(75,184))
out.paste(mechanics.resize((555,300),Image.Resampling.NEAREST),(75,544))
g=ImageDraw.Draw(out)
for i,(name,tex) in enumerate((("RUST · КРУПНЫЕ ПЛАСТИНЫ",rust),("METAL · ТРУБКИ И БОЛТЫ",metal))):
 y=156+i*356
 g.text((738,y),name,font=body,fill="#f0d1a9")
 out.paste(tex.resize((256,256),Image.Resampling.NEAREST),(740,y+39),tex.resize((256,256),Image.Resampling.NEAREST))
 tiled=Image.new("RGBA",(128,128))
 for yy in (0,64):
  for xx in (0,64):tiled.alpha_composite(tex,(xx,yy))
 out.paste(tiled.resize((256,256),Image.Resampling.NEAREST),(1128,y+39))
 g=ImageDraw.Draw(out)
 g.text((742,y+302),"64×64  →  ×4",font=small,fill="#e4d3be")
 g.text((1129,y+302),"2×2 ПОВТОР · ×2",font=small,fill="#e4d3be")
out.save(root/"stages/1.png",optimize=True)
print("STAGE 1 MATERIALS GENERATED: rust.png, metal.png, stages/1.png")

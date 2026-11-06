#!/usr/bin/env python3
"""Render a self-contained Russian-language King of Ash newspaper poster."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import io
import math
import random
import urllib.request
import sys

OUT = sys.argv[1] if len(sys.argv) > 1 else "/tmp/king-ash-news-2.png"
W, H = 1200, 720
random.seed(31)
img = Image.new("RGB", (W, H), (19, 13, 30))
draw = ImageDraw.Draw(img)

for y in range(H):
    t = y / H
    draw.line((0,y,W,y), fill=(int(24+30*t),int(11+12*t),int(34-11*t)))
    
# The game's real official artwork, not an invented gameplay screenshot.
cover = "https://static.playgama.com/p-img/pg/preview/35e479d191e84b2da577bab9e693bd6c?width=896"
try:
    req = urllib.request.Request(cover,headers={"User-Agent":"Mozilla/5.0"})
    with urllib.request.urlopen(req,timeout=18) as resp:
        art = Image.open(io.BytesIO(resp.read())).convert("RGB")
    aw, ah = art.size
    scale = max(710/aw, 690/ah)
    art = art.resize((int(aw*scale),int(ah*scale)),Image.Resampling.LANCZOS)
    x0=(art.width-710)//2
    y0=(art.height-690)//2
    art=art.crop((x0,y0,x0+710,y0+690))
    img.paste(art, (490, 30))
except Exception:
    # Image is still usable without third-party access.
    d=ImageDraw.Draw(img)
    for j in range(21):
        x=650+j*32
        h=random.randint(75,430)
        d.rectangle((x,650-h,x+26,650),fill=(64+random.randint(0,35),36,51))
    d.ellipse((670,95,1040,465), fill=(160,62,43))
    for i in range(25):
        x=random.randint(550,1180);y=random.randint(250,650)
        d.rectangle((x,y,x+17,y+17),fill=(218,105,43))

# Dark gradient over the art's edge for editorial legibility.
overlay=Image.new("RGBA",(W,H),(0,0,0,0))
od=ImageDraw.Draw(overlay)
for x in range(350,800):
    a=int(235*(1-(x-350)/450))
    od.line((x,0,x,H),fill=(14,10,22,max(0,a)))
for y in range(580,H):
    a=int(185*(y-580)/(H-580))
    od.line((490,y,W,y),fill=(12,6,14,max(0,a)))
img=Image.alpha_composite(img.convert("RGBA"),overlay)
d=ImageDraw.Draw(img)

# Border, print-ink sparks and masthead.
for i in range(85):
    x=random.randrange(W); y=random.randrange(86,H-72)
    r=random.choice([2,3,4,7])
    if x < 460: continue
    d.rectangle((x,y,x+r,y+r),fill=random.choice([(244,99,41,120),(255,174,74,135),(251,221,142,110)]))
d.rectangle((0,0,W,85),fill=(22,14,27,250))
d.rectangle((0,82,W,88),fill=(221,80,40,255))
d.rectangle((0,H-88,W,H),fill=(27,15,27,245))
d.rectangle((0,H-91,W,H-88),fill=(251,165,80,255))

REGULAR="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
def font(size,bold=False):
    return ImageFont.truetype(BOLD if bold else REGULAR,size)
def type_line(x,y,s,size,color,bold=False,stroke=0):
    d.text((x,y),s,font=font(size,bold),fill=color,stroke_width=stroke,stroke_fill=(19,10,22))
    
# Pixel-style red newspaper emblem and expressive typography.
d.rectangle((24,22,70,64),fill=(255,173,51))
for x,y in [(30,15),(47,9),(64,15)]:
    d.rectangle((x,y,x+10,y+25),fill=(255,173,51))
d.rectangle((37,37,58,48),fill=(35,18,20))
type_line(87,13,"META GAMES",45,(255,245,223),True)
type_line(798,22,"ПЕПЕЛЬНЫЙ ВЕСТНИК",25,(245,191,127),True)
type_line(36,115,"СРОЧНО ИЗ КОЛИЗЕЯ",23,(255,171,82),True)
type_line(30,166,"СКЕЛЕТЫ",66,(255,240,216),True,1)
type_line(33,254,"ТРЕБУЮТ",58,(255,238,214),True)
type_line(32,333,"ВЫХОДНОЙ!",54,(255,117,54),True,1)

d.rounded_rectangle((31,431,438,552),radius=13,fill=(64,30,37,240),outline=(251,166,72),width=3)
type_line(48,440,"«МЫ УЖЕ НЕ ЧУВСТВУЕМ",20,(255,227,193),True)
type_line(48,470,"НОГ!» — ОБЪЯСНИЛИ",20,(255,227,193),True)
type_line(48,500,"ПРЕДСТАВИТЕЛИ НЕЖИТИ.",18,(255,215,175),True)

type_line(38,580,"КОРОЛЬ ОТКАЗАЛСЯ",22,(255,229,195),True)
type_line(38,613,"КОММЕНТИРОВАТЬ.",22,(255,229,195),True)

d.rounded_rectangle((892,97,1174,154),radius=10,fill=(217,62,38),outline=(255,200,123),width=3)
type_line(911,109,"ВЫПУСК  № 2",23,(255,246,228),True)

type_line(33,650,"KING OF ASH",34,(255,178,75),True)
type_line(568,665,"ИГРАТЬ НА PLAYGAMA",23,(255,243,218),True)
type_line(1100,658,"➜",35,(255,205,92),True)

img.convert("RGB").save(OUT,format="PNG",optimize=True)
print(OUT)

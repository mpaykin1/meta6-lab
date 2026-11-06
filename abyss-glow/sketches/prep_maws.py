import numpy as np
from PIL import Image
from scipy import ndimage as nd
PAL=np.array([[0,0,0],[0x3E,0x15,0],[0x70,0x27,0],[0xAD,0x42,1],[0xE5,0x78,7],[0xF9,0xBD,0x2B],[0xFD,0xE7,0x66]],float)
PL=PAL@[0.3,0.5,0.2]
def tones(img,f,TH=38):
    a=np.asarray(img.convert('RGB')).astype(float)
    h,w=a.shape[0]//f,a.shape[1]//f; a=a[:h*f,:w*f]
    b=a.reshape(h,f,w,f,3)
    lum=(b@[0.3,0.5,0.2])
    mx=lum.max(axis=(1,3)); mean=lum.mean(axis=(1,3))
    v=0.55*mx+0.45*mean
    t=np.abs(v[...,None]-PL[None,None,:]).argmin(2)
    t[v<TH]=0
    return t
def body_mask(t,close=2):
    m=t>0
    m=nd.binary_dilation(m,iterations=close)
    m=nd.binary_fill_holes(m)
    m=nd.binary_erosion(m,iterations=max(0,close-1))
    return m|(t>0)
def save(name,base,jaw,bmask,jmask,emis,extra=None):
    h,w=base.shape; o=np.zeros((h,w,4),np.uint8)
    o[...,0]=np.where(bmask,40+base*30,0); o[...,1]=np.where(jmask,40+jaw*30,0); o[...,2]=np.where(emis,255,0); o[...,3]=255
    if extra is not None: o[...,2]=np.maximum(o[...,2],extra)
    Image.fromarray(o,'RGBA').save(name)
    # preview
    pv=np.zeros((h,w*3,3),np.uint8)
    pv[:,:w]=PAL[base].astype(np.uint8)*bmask[...,None]+ (bmask[...,None]&(base[...,None]==0))*np.array([20,20,60],np.uint8)
    pv[:,w:2*w]=PAL[jaw].astype(np.uint8)*jmask[...,None]+(jmask[...,None]&(jaw[...,None]==0))*np.array([20,60,20],np.uint8)
    pv[:,2*w:]=np.where(emis[...,None],255,0)
    Image.fromarray(pv).resize((w*3*3,h*3),Image.NEAREST).save('pv_'+name)

# ---------- SIDE ----------
im=Image.open('side.png').convert('RGB'); a=np.asarray(im).copy()
a[:, :500]=0                      # fish body/tail
a[465:840, :760]=0               # fish head + its bubbles
im=Image.fromarray(a).crop((500,0,1254,1254))
F=6; t=tones(im,F,26); h,w=t.shape
# hinge and split line (in art px): mouth gap from (~(560-500)/6, 640/6) to right edge
x=np.arange(w)[None,:].repeat(h,0); y=np.arange(h)[:,None].repeat(w,1)
x0,y0=(560-500)/F,600/F; x1,y1=(1254-500)/F,650/F
ly=y0+(x-x0)*(y1-y0)/(x1-x0)
up=y<ly
# pad right border to close shapes for fill
from PIL import ImageDraw
def poly(pts):
    m=Image.new('L',(1254,1254),0); ImageDraw.Draw(m).polygon(pts,fill=255); m=m.crop((500,0,1254,1254))
    return np.asarray(m.resize((w,h),Image.BOX))>100
PU=poly([(535,262),(600,195),(700,155),(800,142),(900,100),(1000,62),(1100,40),(1254,25),(1254,642),(1170,640),(1150,600),(1080,520),(1000,460),(940,420),(850,370),(700,300),(560,275)])
PLo=poly([(632,995),(750,1012),(860,962),(960,892),(1060,802),(1130,722),(1170,655),(1254,652),(1254,1220),(1100,1160),(900,1090),(760,1055),(650,1015)])
U=(PU|((t>0)&up)); L=(PLo|((t>0)&~up))
eye=np.zeros_like(t,bool)
ey,ex=int(268/F),int((955-500)/F)
eye[max(0,ey-4):ey+5, ex-4:ex+5]= t[max(0,ey-4):ey+5, ex-4:ex+5]>=3
save('maw_side.png', np.where(up,t,0), np.where(~up,t,0), U, L, eye)
print('side',t.shape,'hinge art',x1,y1)
# ---------- FRONT ----------
im=Image.open('front.png').convert('RGB'); a=np.asarray(im).copy()
a[1215:]=0
from PIL import ImageDraw
im0=Image.fromarray(a); dr=ImageDraw.Draw(im0)
for bx,by,br in [(330,145,48),(285,60,40),(345,265,32),(718,318,40),(797,190,48),(797,98,30),(122,570,22),(60,360,22),(90,440,30),(990,895,28),(920,935,22),(48,598,15),(230,110,15),(258,190,15),(296,338,15),(835,350,15)]:
    dr.ellipse((bx-br,by-br,bx+br,by+br),fill=(0,0,0))
a=np.asarray(im0).copy()
im=Image.fromarray(a)
F=5; t=tones(im,F,24); h,w=t.shape
# remove bubbles: connected components of bright pixels that are small & round outside head ellipse
cx,cy=543/F,800/F
yy,xx=np.mgrid[0:h,0:w]
lab,n=nd.label(t>0,structure=np.ones((3,3)))
sizes=nd.sum(np.ones_like(t),lab,range(1,n+1))
keep=np.zeros(n+1,bool)
for i in range(1,n+1):
    sl=nd.find_objects(lab==i)[0] if False else None
objs=nd.find_objects(lab)
for i,s in enumerate(objs,1):
    hh=s[0].stop-s[0].start; ww=s[1].stop-s[1].start
    my=(s[0].start+s[0].stop)/2; mx=(s[1].start+s[1].stop)/2
    d=((mx-cx)/(420/F))**2+((my-cy)/(470/F))**2
    small = sizes[i-1]<220 and hh<40 and ww<40
    keep[i]= not (small and d>0.85)
t=np.where(keep[lab],t,0)
t[(yy>840/F)&(((xx-cx)/(400/F))**2+((yy-cy)/(430/F))**2>1.0)]=0
bm=body_mask(t,3)
mouthY=840/F
jawm=bm&(yy>mouthY)
basem=bm&~jawm
eye=np.zeros_like(t,bool)
for ex,ey in [(295,537),(790,527)]:
    ex/=F; ey/=F; r=7
    m=((xx-ex)**2+(yy-ey)**2<r*r)&(t>=3); eye|=m
save('maw_front.png', np.where(yy<=mouthY,t,0), np.where(yy>mouthY,t,0), basem, jawm, eye)
print('front',t.shape,'center',cx,cy,'mouthY',mouthY)

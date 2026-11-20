import json,base64,io
from PIL import Image, ImageChops
s=json.load(open('showcase.json'));R=s['rects'];M={m['id']:m for m in s['models']}
AT=[Image.open(f'stack_{i}.png').convert('RGBA') for i in range(5)]
def crop(key):
    a,i,x,y,w,h=R[key];return AT[i].crop((x,y,x+w,y+h))
WANT=['bathyscaphe','kelp_tall','kelp_mid','coral_branch_pink','coral_branch_orange','coral_branch_violet','coral_brain','tube_sponge','anemone','sea_fan','arch','column','column_broken','cathedral_tower','lancet_window','angel_statue','street_lamp','whale_skeleton','galleon','submarine_wreck','anchor','treasure_chest','barrel','glow_fish_teal','glow_fish_amber','jellyfish_teal','jellyfish_violet','manta','angler','eel','kraken_tentacle','air_bubble','doubloon','pearl_clam','sea_mine','torpedo','gargoyle','hot_vent','iron_gate']
out={}
for k in WANT:
    m=M[k];clip=None
    if m['clips']:
        cn,cv=list(m['clips'].items())[0];st=cv['stack'];F=cv['frames'];L=st['layers'];W=st['w'];D=st['h']
        img=crop(st['png']);
        if st.get('glow') in R: img=ImageChops.add(img,crop(st['glow'])) if False else Image.alpha_composite(img,crop(st['glow']))
        strip=img.crop((0,0,W*L,D*F))
    else:
        st=m['stack'];F=1;L=st['layers'];W=st['w'];D=st['h'];cols=st.get('cols') or 16
        img=crop(st['png'])
        if st.get('glow') in R: img=Image.alpha_composite(img,crop(st['glow']))
        strip=Image.new('RGBA',(W*L,D))
        for i in range(L):
            cx,cy=(i%cols)*W,(i//cols)*D;strip.paste(img.crop((cx,cy,cx+W,cy+D)),(i*W,0))
    b=io.BytesIO();strip.save(b,'PNG',optimize=True)
    out[k]=dict(W=W,H=L,D=D,F=F,url='data:image/png;base64,'+base64.b64encode(b.getvalue()).decode())
    strip.save(f'out_{k}.png')
json.dump(out,open('sub_atlas.json','w'))
print(sum(len(v['url']) for v in out.values()), {k:(v['W'],v['H'],v['D'],v['F']) for k,v in out.items()})

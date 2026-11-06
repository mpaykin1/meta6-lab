#!/bin/sh
cd /home/claude/arc/work && cp /home/claude/arc_dl/pretty.js game.js && python3 -I - <<'PY'
p='/home/claude/arc/work/game.js'; s=open(p,encoding='utf8').read()
a='''    t = (c, h) => typeof c == "function" && c.toString().includes(h),'''
b='''    t = (c, h) => { if (typeof c != "function") return !1; const n = (x) => x.replace(/\\s+/g, "").replace(/"/g, "'"); return n(c.toString()).includes(n(h)); },'''
s=s.replace(a,b).replace('t(updateFireballs, "f.home")','t(updateFireballs, ".home")').replace('t(updateArrows, "a.fire")','t(updateArrows, ".fire")')
open(p,'w',encoding='utf8').write(s)
PY
python3 -I patch_arc.py >/dev/null && ./build.sh

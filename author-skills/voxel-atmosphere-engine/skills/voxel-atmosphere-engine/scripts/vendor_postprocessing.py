#!/usr/bin/env python3
"""Bundle Three.js r187 + pmndrs/postprocessing v6.39.6 locally. Requires npm network.

Usage: python vendor_postprocessing.py --game /path/to/embergrove
An isolated temp npm project receives exact dependencies. The generated game assets and
source remain in place; imports map to local bundled ESM instead of external CDN.
"""
import argparse, json, pathlib, re, subprocess, sys

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--game',required=True,type=pathlib.Path)
    args=ap.parse_args()
    g=args.game.expanduser().resolve()
    if not (g/'game.js').is_file() or not (g/'fx/postfx.js').is_file():
        raise SystemExit('Missing game.js or fx/postfx.js; create a game first')
    pkg={'private':True,'type':'module','dependencies':{
        'three':'0.187.0','postprocessing':'6.39.6'},
        'devDependencies':{'esbuild':'0.25.12'}}
    (g/'package.json').write_text(json.dumps(pkg,indent=2)+'\n')
    subprocess.run(['npm','install','--no-audit','--no-fund'],cwd=g,check=True)
    cmd=['node','node_modules/esbuild/bin/esbuild','game.js',
         '--bundle','--format=esm','--splitting','--minify','--platform=browser',
         '--outdir=bundle','--entry-names=[name]','--chunk-names=chunks/[name]-[hash]']
    subprocess.run(cmd,cwd=g,check=True)
    idx=g/'index.html'
    html=idx.read_text()
    html=re.sub(r'<script type="importmap">.*?</script>','',html,flags=re.S)
    html=html.replace('src="game.js"','src="bundle/game.js"')
    idx.write_text(html)
    print('Offline runtime ready:',g/'index.html')
    print('Serve with python -m http.server 8000 --directory',g)
if __name__=='__main__':main()

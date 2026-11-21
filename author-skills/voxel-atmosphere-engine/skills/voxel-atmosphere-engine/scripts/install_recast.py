#!/usr/bin/env python3
"""Install official Recast Navigation 0.44.0 packages as local vendor files.
Network and npm required. Fails closed; game uses original safe A* if unavailable.
"""
import argparse,pathlib,subprocess,shutil,sys,json

def main():
 p=argparse.ArgumentParser();p.add_argument('--game',type=pathlib.Path,required=True);p.add_argument('--npm',default='npm');a=p.parse_args()
 game=a.game.resolve();fx=game/'fx';fx.mkdir(parents=True,exist_ok=True)
 target=game/'.recast-source';target.mkdir(exist_ok=True)
 pkg=target/'package.json'
 pkg.write_text(json.dumps({'private':True,'type':'module','dependencies':{'@recast-navigation/core':'0.44.0','@recast-navigation/generators':'0.44.0','@recast-navigation/wasm':'0.44.0'}},indent=2))
 subprocess.check_call([a.npm,'install','--ignore-scripts','--no-audit','--no-fund','--prefer-offline'],cwd=target)
 vend=fx/'vendor';vend.mkdir(exist_ok=True)
 # Core imports @recast-navigation/wasm; keep all imports and pinned node_modules
 # instead of copying one file and accidentally breaking import resolution.
 core=target/'node_modules'/'@recast-navigation'/'core'/'dist'/'index.mjs'
 gen=target/'node_modules'/'@recast-navigation'/'generators'/'dist'/'index.mjs'
 wasm=target/'node_modules'/'@recast-navigation'/'wasm'/'dist'/'recast-navigation.wasm-compat.js'
 for path in [core,gen,wasm]:
  if not path.exists():raise SystemExit(f'Unexpected npm package layout: {path}')
 # Compatible runtime files are served from the same web root. The ESM core
 # references WASM by bare package name, so the browser importmap is rewritten.
 for old,new in [(core,'recast-navigation-core.mjs'),(gen,'recast-navigation-generators.mjs'),(wasm,'recast-navigation.wasm-compat.js')]:shutil.copy2(old,vend/new)
 html=game/'index.html';s=html.read_text();start=s.index('<script type="importmap">')+len('<script type="importmap">');end=s.index('</script>',start);m=json.loads(s[start:end]);m['imports'].update({'@recast-navigation/core':'./fx/vendor/recast-navigation-core.mjs','@recast-navigation/generators':'./fx/vendor/recast-navigation-generators.mjs','@recast-navigation/wasm':'./fx/vendor/recast-navigation.wasm-compat.js'});s=s[:start]+json.dumps(m,separators=(',',':'))+s[end:];html.write_text(s)
 print('Pinned Recast vendor files installed; browser import map updated:',vend)
if __name__=='__main__':main()

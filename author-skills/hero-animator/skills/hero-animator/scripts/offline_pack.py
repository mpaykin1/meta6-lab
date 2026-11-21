#!/usr/bin/env python3
"""Make generated Hero Animator game playable by double-clicking index.html on Windows.

Run AFTER gif2game.py. Preserves the existing strict-input FSM of engine.js,
source art provenance, segments, lossless atlases and Three.js when available.
Offline fallback uses the bundled WebGL2/GLSL/Canvas renderer. Pillow NOT needed.
"""
import argparse, base64, json, re, shutil, zipfile
from pathlib import Path

BASE=Path(__file__).resolve().parent.parent
OFFLINE=BASE/'runtime'/'gif2game_offline.js'
THREE_URL='https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js'


def make(game_dir: Path, keep_assets: bool=False):
    root=game_dir.resolve()
    index=root/'index.html';engine=root/'engine.js'; assets=root/'assets';manifest_file=assets/'game.json'
    for required in [index,engine,manifest_file,OFFLINE]:
        if not required.is_file():raise FileNotFoundError(f'Missing game input: {required}')
    html=index.read_text(encoding='utf-8')
    src=engine.read_text(encoding='utf-8')
    manifest=json.loads(manifest_file.read_text(encoding='utf-8'))
    from single_hero_guard import lock_manifest, verify_manifest
    lock_manifest(manifest)
    verify_manifest(manifest)
    img_urls={}
    for c in manifest['clips']:
        f=assets/c['sheet']
        if f.suffix.lower() not in ('.png','.webp') or not f.is_file():
            raise ValueError('Missing locked lossless atlas: '+str(f))
        mime='image/webp' if f.suffix.lower()=='.webp' else 'image/png'
        img_urls[c['sheet']]='data:'+mime+';base64,'+base64.b64encode(f.read_bytes()).decode('ascii')
    video_url=None
    if manifest.get('webm'):
        v=assets/manifest['webm']
        if not v.is_file():raise ValueError('WebM missing')
        video_url='data:video/webm;base64,'+base64.b64encode(v.read_bytes()).decode('ascii')
    src,count=re.subn(r'^\s*import\s+\*\s+as\s+THREE\s+from\s+[\'\"]three[\'\"]\s*;', '', src,flags=re.M)
    if count!=1:raise ValueError('Expected ES Module import of Three.js; cannot safely bundle')
    src,count=re.subn(r'const\s+manifest\s*=\s*await\s*\(\s*await\s+fetch\(\s*[\'\"]\./assets/game\.json[\'\"](?:\s*,\s*\{[^}]*\})?\s*\)\s*\)\.json\(\)\s*;', '', src)
    if count!=1:raise ValueError('Expected manifest fetch in Three.js engine')
    src,count=re.subn(r'[\'\"]\./assets/[\'\"]\s*\+\s*file', 'imageUrls[file]', src)
    if count<1:raise ValueError('Expected asset texture load in Three.js engine')
    src=re.sub(r'[\'\"]\./assets/[\'\"]\s*\+\s*manifest\.webm', 'videoUrl', src)
    if re.search(r'\bfetch\s*\(',src):raise ValueError('Engine contains unexpected fetch calls; refusing nonportable file:// build')
    # The primary path uses actual Three.js; all primary local resources are embedded.
    primary='async function bootThree(THREE,manifest,imageUrls,videoUrl){\n'+src+'\n}\n'
    fallback=OFFLINE.read_text(encoding='utf-8')
    driver=f'''const GAME_MANIFEST=JSON.parse(document.getElementById('game-data').textContent);
const IMAGE_URLS=JSON.parse(document.getElementById('image-data').textContent);
const VIDEO_URL=JSON.parse(document.getElementById('video-data').textContent);
const overlay=document.getElementById('loading');
window.addEventListener('error',e=>{{if(document.getElementById('loading'))overlay.textContent='Ошибка: '+e.message;}});
window.addEventListener('unhandledrejection',e=>{{if(document.getElementById('loading'))overlay.textContent='Ошибка: '+String(e.reason);}});
setTimeout(()=>{{if(document.getElementById('loading'))overlay.textContent='Не удалось загрузить графику. Попробуйте обновить страницу.';}},12000);
async function main(){{
 let timeId;const timeout=new Promise(resolve=>timeId=setTimeout(()=>resolve(null),1800));
 let module=null;
 try {{module=await Promise.race([import('{THREE_URL}').catch(()=>null),timeout]);}}catch(_){{}}
 clearTimeout(timeId);
 if(module){{try{{await bootThree(module,GAME_MANIFEST,IMAGE_URLS,VIDEO_URL);return;}}
    catch(e){{console.error('Three.js path could not start, falling back to offline renderer',e);}}}}
 await bootOffline(GAME_MANIFEST,IMAGE_URLS);
}}
main().catch(e=>{{console.error(e);overlay.style.letterSpacing='.04em';overlay.textContent='Не удалось запустить игру: '+e.message;}});'''
    js=primary+fallback+driver
    if '</script' in js.lower():raise ValueError('Unexpected script close in engine')
    def safe_json(x):return json.dumps(x,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
    scripts=(f'<script id="game-data" type="application/json">{safe_json(manifest)}</script>'
             f'<script id="image-data" type="application/json">{safe_json(img_urls)}</script>'
             f'<script id="video-data" type="application/json">{safe_json(video_url)}</script>'
             f'<script type="module">\n{js}\n</script>')
    html=re.sub(r'<script\s+type=[\'\"]importmap[\'\"]>.*?</script>','',html,flags=re.S)
    html,n=re.subn(r'<script\s+type=[\'\"]module[\'\"]\s+src=[\'\"]\./engine\.js[\'\"]\s*></script>',lambda _:scripts,html)
    if n!=1:raise ValueError('Expected local <script type=module src=./engine.js>')
    if 'index.html' not in index.name:raise ValueError('Unexpected target path')
    index.write_text(html,encoding='utf-8')
    if not keep_assets:
        engine.unlink()
        shutil.rmtree(assets)
    game_zip=root.with_suffix('.zip')
    with zipfile.ZipFile(game_zip,'w',zipfile.ZIP_DEFLATED,compresslevel=7) as z:
        for f in root.rglob('*'):
            if f.is_file():z.write(f,f.relative_to(root))
    return index,game_zip


def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('game_dir',type=Path,help='directory produced by gif2game.py')
    ap.add_argument('--keep-assets',action='store_true',help='also ship unembedded assets for inspection')
    args=ap.parse_args()
    index,archive=make(args.game_dir,args.keep_assets)
    print('PLAY:',index,'\nZIP:',archive)
if __name__=='__main__':main()

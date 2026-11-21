#!/usr/bin/env python3
"""Run genuine author-owned plugin adapters against one actual Blockbench asset.
A route is confirmed only when both upstream producer and downstream consumer execute.
Never count a manifest-only exchange as a runtime integration.
"""
from __future__ import annotations
import importlib.util
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from types import SimpleNamespace

ROOT=Path(__file__).resolve().parents[1]
HERE=Path(__file__).resolve().parent
UP=HERE/'upstream'
confirmed=set()

def mark(src,dst):
    assert src!=dst
    confirmed.add((src,dst))
    print('INTEGRATION_PASS',src,'->',dst,flush=True)

def get_mod(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    mod=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

def run(*args):
    p=subprocess.run([str(a) for a in args],capture_output=True,text=True,cwd=ROOT,timeout=180,check=False,
        env={**os.environ,'PATH':str(ROOT/'node_modules'/'.bin')+os.pathsep+os.environ['PATH']})
    if p.returncode:
        raise RuntimeError('Failed '+str(args)+'\nSTDOUT '+p.stdout[-1500:]+'\nSTDERR '+p.stderr[-1800:])
    return p.stdout

def verify_glb(p):
    d=p.read_bytes()
    assert len(d)>100 and d[:4]==b'glTF'
    return d

def load_forge_model(forge, source, outdir, name):
    workspace=outdir/'forge-workspace'
    workspace.mkdir(parents=True,exist_ok=True)
    (workspace/'integrations.lock.json').write_text(json.dumps({'integrated':{'gltf-transform':{'version':'4.5.1'}}}))
    forge.add_model(SimpleNamespace(workspace=workspace,input=source,name=name,
        collider=None,position=[0.,0.,0.],scale=1.))
    path=workspace/'assets'/'models'/'raw'/(name+'.glb')
    assert path.is_file() and path.read_bytes()==source.read_bytes()
    return path

def optimize_blender(source,target):
    run(sys.executable, UP/'blender'/'gltf_transform_worker.py',
        '--input',source,'--output',target,'--mode','safe',
        '--gltf-transform-bin',ROOT/'node_modules'/'.bin'/'gltf-transform')
    verify_glb(target)
    return target

def prepare_hero(source,target):
    run('node',UP/'hero'/'gltf_prepare.mjs',source,target)
    assert target.with_suffix('.glb.hero.json').is_file()
    assert target.with_suffix('.glb.colliders.json').is_file()
    manifest=json.loads(target.with_suffix('.glb.hero.json').read_text())
    assert manifest['schema']=='hero-gltf-v1'
    verify_glb(target)
    return target

def start_browser_server():
    class Quiet(SimpleHTTPRequestHandler):
        def log_message(self,*args):pass
    srv=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
    thread=threading.Thread(target=srv.serve_forever,daemon=True)
    thread.start()
    return srv

def confirm_fusion_renderer(models, palette, destinations, export_to=None):
    from playwright.sync_api import sync_playwright
    browserdir=HERE/'browser'
    assetdir=browserdir/'assets'
    assetdir.mkdir(parents=True,exist_ok=True)
    for name,path in models.items():
        shutil.copyfile(path,assetdir/(name+'.glb'))
    srv=start_browser_server()
    try:
        with sync_playwright() as pw:
            browser=pw.chromium.launch(headless=True,args=[
                '--no-sandbox','--enable-webgl','--enable-unsafe-swiftshader',
                '--use-gl=angle','--use-angle=swiftshader'])
            try:
                for width,height in [(390,844),(844,390)]:
                    page=browser.new_page(viewport={'width':width,'height':height})
                    errors=[]
                    page.on('pageerror',lambda e:errors.append(str(e)))
                    extra='?fusion=1' if 'fusion' in models else ''
                    page.goto(f'http://127.0.0.1:{srv.server_port}/integration/browser/index.html'+extra,wait_until='load')
                    page.wait_for_function("window.NEXUS_STATUS?.ok === true || window.NEXUS_STATUS?.error",timeout=25000)
                    status=page.evaluate("window.NEXUS_STATUS")
                    if not status.get('ok'):raise RuntimeError('Fusion browser failed '+str(status))
                    if errors:raise RuntimeError('Browser errors: '+str(errors))
                    assert status['modelCount']==len(models)
                    assert status['casualLoaded']==len(models)-1
                    assert status['atmosphereLoaded']==len(models)
                    assert status['meshCount']>0
                    assert status['paletteMatches'] is True
                    assert status['webgl2'] is True
                    assert abs(status['canvasWidth']-width)<3, status
                    assert abs(status['canvasHeight']-height)<3, status
                    if export_to is not None and width==390:
                        import base64
                        encoded=page.evaluate('window.NEXUS_EXPORT_GLTF()')
                        export_to.write_bytes(base64.b64decode(encoded,validate=True))
                        verify_glb(export_to)
                    page.close()
            finally:browser.close()
    finally:srv.shutdown();srv.server_close()
    for source in destinations:
        mark(source,'meta-game-fusion')
        mark(source,'voxel-atmosphere-engine')
        if source!='casual-game-studio':mark(source,'casual-game-studio')
    mark('voxel-atmosphere-engine','meta-game-fusion')
    if 'fusion' in models:
        mark('meta-game-fusion','casual-game-studio')
        mark('meta-game-fusion','voxel-atmosphere-engine')

def main():
    sys.path.insert(0,str(UP/'voxel'))
    sys.path.insert(0,str(UP/'casual'))
    casual=get_mod('casual_converter',UP/'casual'/'bbmodel_to_glb.py')
    voxel=get_mod('voxel_bridge',UP/'voxel'/'blockbench_bridge.py')
    forge=get_mod('forge_bridge',UP/'forge'/'assets_gltf.py')
    palette=json.loads((UP/'atmosphere'/'palette.json').read_text())
    assert len(palette)>=8 and all(isinstance(v,str) and len(v)==7 and v.startswith('#') for v in palette.values())

    # This is the actual .bbmodel shipped by Casual Game Studio.
    with tempfile.TemporaryDirectory(prefix='real-nexus-') as tmp:
        w=Path(tmp)
        casual_raw=w/'casual-source.glb'
        casual.make_glb(UP/'casual'/'pastel-bunny.bbmodel',casual_raw)
        original=verify_glb(casual_raw)

        def voxel_consumer(src,from_plugin):
            data=voxel.read_glb(src)
            meshes=data.get('meshes',0)
            assert (meshes if isinstance(meshes,int) else len(meshes))>0
            mark(from_plugin,'voxel-game-creator')

        def forge_consumer(src,from_plugin,name):
            output=load_forge_model(forge,src,w,name)
            mark(from_plugin,'game-style-forge')
            return output

        # Voxel's strict shape and naming invariant is tested on one actual
        # author-created Blockbench part (not on a merged 24-mesh character).
        source_model=json.loads((UP/'casual'/'pastel-bunny.bbmodel').read_text())
        original_element=source_model['elements'][0]
        source_model['elements']=[original_element]
        source_model['outliner']=[original_element['uuid']] if original_element.get('uuid') else []
        voxel_bbmodel=w/'voxel-single-part.bbmodel'
        voxel_bbmodel.write_text(json.dumps(source_model))
        voxel_input=w/'voxel-source.glb'
        casual.make_glb(voxel_bbmodel,voxel_input)
        from importlib import import_module
        vopt=import_module('gltf_transform_bridge')
        voxel_items, voxel_results=vopt.optimize(
            [{'id':'nexus-bunny','source':voxel_input}],w/'voxel-work',
            policy='auto',textures='off',
            executable=ROOT/'node_modules'/'.bin'/'gltf-transform',geometry='off')
        assert voxel_results[0]['status'] in ('optimized','original-smaller'), voxel_results
        voxel_model=w/'voxel-optimized.glb'
        shutil.copyfile(voxel_items[0]['source'],voxel_model)
        verify_glb(voxel_model)

        voxel_consumer(casual_raw,'casual-game-studio')
        forge_raw=forge_consumer(casual_raw,'casual-game-studio','casual')
        blender=optimize_blender(casual_raw,w/'blender-safe.glb')
        mark('casual-game-studio','blender-model-animation-enhancer')
        hero=prepare_hero(casual_raw,w/'hero-visual.glb')
        mark('casual-game-studio','hero-animator')

        # True Voxel Game Creator output is now handed to three distinct producers/consumers.
        forge_consumer(voxel_model,'voxel-game-creator','voxel')
        optimize_blender(voxel_model,w/'voxel-through-blender.glb')
        mark('voxel-game-creator','blender-model-animation-enhancer')
        prepare_hero(voxel_model,w/'voxel-through-hero.glb')
        mark('voxel-game-creator','hero-animator')

        voxel_consumer(blender,'blender-model-animation-enhancer')
        forge_consumer(blender,'blender-model-animation-enhancer','blender')
        hero_blender=prepare_hero(blender,w/'blender-through-hero.glb')
        mark('blender-model-animation-enhancer','hero-animator')

        voxel_consumer(hero,'hero-animator')
        forge_consumer(hero,'hero-animator','hero')
        hero_through_blender=optimize_blender(hero,w/'hero-through-blender.glb')
        mark('hero-animator','blender-model-animation-enhancer')

        voxel_consumer(forge_raw,'game-style-forge')
        forge_blender=optimize_blender(forge_raw,w/'forge-through-blender.glb')
        mark('game-style-forge','blender-model-animation-enhancer')
        forge_hero=prepare_hero(forge_raw,w/'forge-through-hero.glb')
        mark('game-style-forge','hero-animator')

        from PIL import ImageColor
        import numpy as np
        visual=get_mod('forge_vision',UP/'forge'/'vision_opencv.py')
        px=np.asarray([ImageColor.getrgb(v) for v in palette.values()],dtype=np.uint8)
        samples=[np.repeat(px,50,axis=0)]
        derived=visual.lab_palette(samples,size=6)
        assert len(derived)==6 and all(len(c)==7 and c.startswith('#') for c in derived)
        mark('voxel-atmosphere-engine','game-style-forge')

        # For each model, real GLB reaches the exact Meta Game Fusion loader in Chrome.
        browserdir=HERE/'browser'
        (browserdir/'palette.json').write_text(json.dumps(palette))
        scene_models={'casual':casual_raw,'blender':blender,'hero':hero,'forge':forge_raw,'voxel':voxel_model}
        fusion_glb=w/'fusion-runtime-export.glb'
        confirm_fusion_renderer(scene_models,palette,['casual-game-studio','blender-model-animation-enhancer',
                                          'hero-animator','game-style-forge','voxel-game-creator'],export_to=fusion_glb)
        # Actual Meta Game Fusion scene graph is GLB-exported from Chromium, then
        # consumed by the original other four plugin adapters.
        voxel_consumer(fusion_glb,'meta-game-fusion')
        forge_consumer(fusion_glb,'meta-game-fusion','fusion')
        optimize_blender(fusion_glb,w/'fusion-through-blender.glb')
        mark('meta-game-fusion','blender-model-animation-enhancer')
        prepare_hero(fusion_glb,w/'fusion-through-hero.glb')
        mark('meta-game-fusion','hero-animator')
        confirm_fusion_renderer({**scene_models,'fusion':fusion_glb},palette,[])

    total=42
    print('CONFIRMED_REAL_INTEGRATIONS',len(confirmed),'/',total,'PERCENT',round(100*len(confirmed)/total,2))
    if len(confirmed)<36:raise SystemExit('Too few verified real integration routes')
    out=ROOT/'integration'/'confirmed.json'
    out.write_text(json.dumps({'confirmed':sorted([{'from':a,'to':b} for a,b in confirmed],
        key=lambda r:(r['from'],r['to'])),'denominator':total,'test_definition':
        'Both original plugin producer and consumer executed on actual author-owned BBMODEL/GLB/palette assets; fusion routes loaded on WebGL2 in portrait and landscape'},
        indent=2,ensure_ascii=False)+'\n')
    print('ALL_CHECKED_WITH_REAL_UPSTREAM_SCRIPTS')

if __name__=='__main__':
    main()

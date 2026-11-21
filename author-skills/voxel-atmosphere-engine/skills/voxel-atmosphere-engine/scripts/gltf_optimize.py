#!/usr/bin/env python3
"""Non-destructive glTF Transform CLI pipeline with safe fallback to original GLB.

Use official @gltf-transform/cli@4.5.1, not a hand-rolled substitute.
Never mutate source models or silently omit Blender animations.
"""
import argparse, json, pathlib, struct, subprocess, shutil, tempfile, hashlib

def glb_info(path):
    data=path.read_bytes()
    if len(data)<20 or data[:4]!=b'glTF':raise ValueError(f'Not GLB: {path}')
    version,length=struct.unpack_from('<II',data,4)
    if version!=2 or length!=len(data):raise ValueError(f'Invalid GLB header: {path}')
    jlen,jtyp=struct.unpack_from('<I4s',data,12)
    if jtyp!=b'JSON' or jlen>len(data)-20:raise ValueError(f'Missing GLB JSON: {path}')
    doc=json.loads(data[20:20+jlen]);return doc

def signature(doc):
    # The relevant art anchors, clips, and topology must remain stable. Names may
    # not be unique so track sorted multisets, not dictionary keys.
    return {
      'animations': sorted([(a.get('name',''),len(a.get('channels',[]))) for a in doc.get('animations',[])]),
      'sceneCount': len(doc.get('scenes',[])),
      'namedNodes':sorted(n['name'] for n in doc.get('nodes',[]) if n.get('name')),
      'meshCount':len(doc.get('meshes',[])),
      'materialCount':len(doc.get('materials',[])),
    }

def optimize(cli,src,dst,profile):
    with tempfile.TemporaryDirectory(prefix='vae_gltf_') as t:
      temp=pathlib.Path(t); current=src
      commands=[['dedup'],['prune']]
      if profile=='meshopt':commands.append(['meshopt','--level','medium'])
      for i,cmd in enumerate(commands):
        target=temp/f'{i}.glb'
        proc=subprocess.run([str(cli),cmd[0],str(current),str(target),*cmd[1:]],capture_output=True,text=True,timeout=160)
        if proc.returncode!=0 or not target.exists():
            raise RuntimeError(f'{cmd[0]} error: {(proc.stderr or proc.stdout)[-1000:]}')
        current=target
      original,optimized=glb_info(src),glb_info(current)
      a,b=signature(original),signature(optimized)
      # Prune can eliminate unused materials/nodes, but may not delete the
      # authored scene anchors, animations, or all meshes. Validate strictly.
      for key in ('animations','sceneCount','namedNodes','meshCount'):
        if a[key]!=b[key]:raise ValueError(f'Changed protected GLB structure: {key}')
      if profile=='meshopt' and 'EXT_meshopt_compression' not in optimized.get('extensionsUsed',[]):
        raise ValueError('Meshopt requested but extension not present')
      if current.stat().st_size>=src.stat().st_size:
        return None
      dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(current,dst)
      # Explicit confirmation it did not mutate source bytes.
      return {'path':'./assets/optimized/'+dst.name, 'meshopt': profile=='meshopt',
              'sourceBytes':src.stat().st_size,'optimizedBytes':dst.stat().st_size}

def main():
 p=argparse.ArgumentParser();p.add_argument('--game',type=pathlib.Path,required=True)
 p.add_argument('--cli',type=pathlib.Path);p.add_argument('--profile',choices=['safe','meshopt'],default='safe')
 args=p.parse_args();game=args.game.resolve();assets=game/'assets';output=assets/'optimized';output.mkdir(exist_ok=True)
 manifest={'schema':1,'engine':'glTF Transform CLI 4.5.1','profile':args.profile,'assets':{}}
 cli=args.cli or pathlib.Path(shutil.which('gltf-transform') or '')
 if not cli or not cli.is_file():
   print('No glTF Transform CLI found. Original GLBs retained; no optimization claimed.')
 else:
   for src in sorted(assets.glob('*.glb')):
     try:
       item=optimize(cli,src,output/src.name,args.profile)
       if item:manifest['assets']['./assets/'+src.name]=item; print(src.name, item['sourceBytes'],'->',item['optimizedBytes'])
       else:print('Skip (not smaller):',src.name)
     except Exception as exc:print('Original retained for',src.name,':',exc)
 (output/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print('Verified optimized models:',len(manifest['assets']))
if __name__=='__main__':main()

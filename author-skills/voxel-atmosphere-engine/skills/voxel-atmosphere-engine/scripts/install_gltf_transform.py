#!/usr/bin/env python3
"""Install official glTF Transform CLI in an isolated project; no license contamination."""
import argparse, pathlib, subprocess, shutil
def main():
 p=argparse.ArgumentParser();p.add_argument('--dir',type=pathlib.Path,required=True);a=p.parse_args()
 out=a.dir.resolve();out.mkdir(parents=True,exist_ok=True)
 template=pathlib.Path(__file__).resolve().parents[1]/'tools/gltf-transform/package.json'
 shutil.copy2(template,out/'package.json')
 npm=shutil.which('npm')
 if not npm:raise SystemExit('Node.js/npm missing: no silent substitute')
 try:subprocess.run([npm,'install','--omit=dev','--no-audit','--no-fund'],cwd=out,check=True,timeout=180)
 except (subprocess.CalledProcessError,subprocess.TimeoutExpired) as e:raise SystemExit(f'glTF Transform was NOT installed: {e}')
 print('Installed:',out/'node_modules/.bin/gltf-transform')
if __name__=='__main__':main()

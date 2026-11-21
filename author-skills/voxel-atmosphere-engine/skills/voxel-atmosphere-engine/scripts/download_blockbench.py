#!/usr/bin/env python3
"""Opt-in upstream source clone. Does not embed GPL source in the plugin package."""
import argparse
import pathlib
import shutil
import subprocess
import sys
import urllib.request
import zipfile

UPSTREAM='https://github.com/JannisX11/blockbench.git'
ZIP='https://codeload.github.com/JannisX11/blockbench/zip/refs/heads/master'

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--out', type=pathlib.Path, required=True)
    p.add_argument('--ref', default='master')
    args=p.parse_args()
    dest=args.out.resolve()
    if dest.exists():
        sys.exit('Refusing to overwrite existing destination: '+str(dest))
    dest.parent.mkdir(parents=True, exist_ok=True)
    if shutil.which('git'):
        cmd=['git','clone','--depth','1','--branch',args.ref,UPSTREAM,str(dest)]
        result=subprocess.run(cmd,check=False)
        if result.returncode==0:
            print('Downloaded upstream Blockbench to', dest)
            return
        if dest.exists() and not any(dest.iterdir()): dest.rmdir()
        elif dest.exists():sys.exit('Partial git clone at '+str(dest)+'; remove it manually before retry')
    if args.ref!='master':sys.exit('Archive fallback only supports master; install git for other refs')
    archive=dest.parent/'blockbench_upstream.zip'
    try:
        urllib.request.urlretrieve(ZIP,archive)
        with zipfile.ZipFile(archive) as z:
            names=z.namelist()
            root=names[0].split('/')[0]+'/'
            # avoid archive path traversal
            for item in z.infolist():
                relative=item.filename[len(root):]
                if not relative or item.is_dir():continue
                path=(dest/relative).resolve()
                if not path.is_relative_to(dest):raise ValueError('Unsafe entry')
                path.parent.mkdir(parents=True,exist_ok=True)
                with z.open(item) as src,open(path,'wb') as target:shutil.copyfileobj(src,target)
        print('Downloaded Blockbench upstream source:',dest)
    except Exception as e:
        sys.exit('Network/source download failed: '+str(e))
    finally:
        archive.unlink(missing_ok=True)
if __name__=='__main__':main()

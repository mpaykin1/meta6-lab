#!/usr/bin/env python3
"""ScanCode Toolkit 32.5.0 -> META GAME FUSION rights metadata.

The tool never authorizes reuse, never modifies scanned source games, never
copies game assets, and never uploads their contents. Scans are opt-in and local.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import subprocess
import sys
import tempfile
from typing import Any

SCHEMA = 'meta-game-fusion.scancode-rights.v1'
INDEX_SCHEMA = 'meta-game-fusion.index.v1'
VERSION = '32.5.0'
MAX_REPORT = 64_000_000
MAX_RECORDS = 180_000
MAX_ROOT_FILES = 30_000
MAX_INDEX = 40_000_000
RESTRICTED = re.compile(r'\b(?:AGPL|GPL|LGPL|MPL|EPL|CDDL|OSL|SSPL|EUPL|CC-BY|GFDL|BUSL|PROPRIETARY|COMMERCIAL|NON-COMMERCIAL|NC|ND)\b', re.I)
PERMISSIVE = {'MIT','APACHE-2.0','BSD-2-CLAUSE','BSD-3-CLAUSE','ISC','ZLIB','CC0-1.0','UNLICENSE','0BSD','BSL-1.0'}


def load_json(path: Path, limit: int) -> dict[str, Any]:
    if not path.is_file() or path.is_symlink() or path.stat().st_size > limit:
        raise ValueError(f'Missing, symlink or oversized file: {path}')
    obj = json.loads(path.read_text('utf-8-sig'))
    if not isinstance(obj, dict): raise ValueError('Expected JSON object')
    return obj


def write_atomic(path: Path, obj: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_name(path.name+'.new')
    with temp.open('w',encoding='utf8') as f:
        json.dump(obj,f,ensure_ascii=False,indent=2)
        f.write('\n')
    os.replace(temp,path)


def sha(path: Path) -> str:
    h=hashlib.sha256()
    with path.open('rb') as src:
        for data in iter(lambda:src.read(1<<20),b''): h.update(data)
    return h.hexdigest()


def library_root(arg: str) -> Path:
    root=Path(arg).expanduser().resolve()
    if not root.is_dir():raise ValueError('Library directory missing')
    return root


def indexed_game(library: Path, game_id: str) -> tuple[dict[str, Any], Path]:
    idx=load_json(library/'fusion-index.json', MAX_INDEX)
    if idx.get('schema')!=INDEX_SCHEMA:raise ValueError('Wrong Tree-sitter index schema')
    matches=[g for g in idx.get('games',[]) if isinstance(g,dict) and g.get('id')==game_id]
    if len(matches)!=1:raise ValueError('Unknown or ambiguous game ID')
    game=matches[0]
    root=Path(game.get('source_root','')).expanduser().resolve()
    if not root.is_dir():raise ValueError('Indexed game root unavailable')
    if root==library or root in library.parents or library in root.parents:
        raise ValueError('Library must be outside source game tree')
    if not isinstance(game.get('files'),list) or len(game['files'])>MAX_ROOT_FILES:
        raise ValueError('Invalid or oversized game index')
    return game,root


def safe_relative(s: Any) -> str:
    if not isinstance(s,str) or not s or len(s)>800 or '\\' in s or '\x00' in s:
        return ''
    p=PurePosixPath(s)
    if p.is_absolute() or any(part in ('','..','.') for part in p.parts):return ''
    return p.as_posix()


def match_path(record: dict[str,Any], known: dict[str,dict[str,Any]], root_name: str) -> str:
    path=record.get('path')
    if not isinstance(path,str):return ''
    path=path.replace('\\','/').lstrip('./')
    options=[path]
    if path.startswith(root_name+'/'):options.append(path[len(root_name)+1:])
    for k in known:
        if path.endswith('/'+k):options.append(k)
    matching=[p for p in options if p in known and safe_relative(p)]
    return sorted(set(matching),key=len)[-1] if len(set(matching))==1 else ''


def extract_license_strings(file: dict[str,Any]) -> list[str]:
    licenses=[]
    for key in ('detected_license_expression_spdx','detected_license_expression'):
        value=file.get(key)
        if isinstance(value,str) and value.strip():licenses.append(value.strip()[:300])
    for obj in file.get('license_detections') or []:
        if isinstance(obj,dict):
            for key in ('license_expression_spdx','license_expression'):
                v=obj.get(key)
                if isinstance(v,str) and v.strip(): licenses.append(v.strip()[:300])
    return sorted(set(licenses))[:40]


def classify(licenses: list[str], errors: bool = False) -> str:
    if errors:return 'scan_error'
    if not licenses:return 'needs_review'
    expr=' '.join(licenses)
    if RESTRICTED.search(expr):return 'restricted_review'
    # Refuse permissive classification when expressions are unknown or compound.
    names={x.upper() for x in re.findall(r'[A-Za-z0-9][A-Za-z0-9.\-+]*', expr)}-{'AND','OR','WITH'}
    if names and names.issubset(PERMISSIVE):return 'permissive_detected'
    return 'needs_review'


def ingest_report(library: Path, game_id: str, path: Path, *, scan_version: str = '') -> dict[str,Any]:
    game,root=indexed_game(library,game_id)
    data=load_json(path,MAX_REPORT)
    files=data.get('files')
    if not isinstance(files,list) or len(files)>MAX_RECORDS:raise ValueError('Invalid ScanCode files array')
    headers=data.get('headers')
    if not isinstance(headers,list) or not headers:
        raise ValueError('Missing ScanCode headers: reject fabricated/unknown JSON')
    if not any('scancode' in str(x.get('tool_name','')).lower() for x in headers if isinstance(x,dict)):
        raise ValueError('Unexpected tool in ScanCode report')
    if not scan_version:
        scan_version=str(headers[0].get('tool_version',''))[:40]
    entries={}
    for file in game['files']:
        if not isinstance(file,dict):continue
        rel=safe_relative(file.get('path'))
        if rel and isinstance(file.get('sha256'),str):entries[rel]=file
    records:dict[str,dict[str,Any]]={}
    for finding in files:
        if not isinstance(finding,dict) or finding.get('type') not in ('file',None):continue
        rel=match_path(finding,entries,root.name)
        if not rel:continue
        src=root.joinpath(*PurePosixPath(rel).parts)
        if not src.is_file() or src.is_symlink() or not src.resolve().is_relative_to(root):
            status='hash_mismatch';actual=''
        else:
            actual=sha(src)
            status='unscanned'
        expected=entries[rel]['sha256']
        errors=bool(finding.get('scan_errors') or finding.get('errors'))
        licenses=extract_license_strings(finding)
        if actual!=expected:status='hash_mismatch'
        else:status=classify(licenses,errors)
        copyright_entries=finding.get('holders') or finding.get('copyrights') or []
        holders=[]
        if isinstance(copyright_entries,list):
            for item in copyright_entries[:12]:
                if isinstance(item,dict):
                    val=item.get('holder') or item.get('copyright')
                    if isinstance(val,str):holders.append(val[:160])
        # Only metadata, never original source bytes or license-match excerpts.
        records[rel]={'source_sha256':expected,'status':status,
                      'license_expressions':licenses,'copyright_holders':sorted(set(holders))[:12],
                      'scan_errors':errors}
    # Missing scan finding means no license clearance, even when index contains a file.
    for rel,file in entries.items():
        records.setdefault(rel,{'source_sha256':file['sha256'],'status':'unscanned',
                                'license_expressions':[],'copyright_holders':[], 'scan_errors':False})
    inventory_file=library/'scancode-rights.json'
    existing=load_json(inventory_file,MAX_REPORT) if inventory_file.exists() else {'schema':SCHEMA,'games':{}}
    if existing.get('schema')!=SCHEMA or not isinstance(existing.get('games'),dict):
        raise ValueError('Existing rights inventory has incompatible format')
    old_files=((existing.get('games') or {}).get(game_id) or {}).get('files',{})
    for rel, rec in records.items():
        previous=old_files.get(rel,{})
        cleared=previous.get('clearance')
        if isinstance(cleared,dict) and cleared.get('source_sha256')==rec['source_sha256']:
            rec['clearance']=cleared
    existing['games'][game_id]={'source_root':str(root),'scancode_version':scan_version,
                               'files':records,'scanned_file_count':len(files),
                               'rights_policy':'Detection is evidence to review, never automatic reuse approval.'}
    write_atomic(inventory_file,existing)
    statuses={v['status'] for v in records.values()}
    return {'game':game_id,'indexed_files':len(records),'statuses':sorted(statuses),
            'rights_file':str(inventory_file),'scancode_version':scan_version}


def run_scan(library: Path, game_id: str, executable: str, timeout: int) -> dict[str,Any]:
    _,root=indexed_game(library,game_id)
    exe=shutil.which(executable)
    if not exe:raise RuntimeError('ScanCode CLI not installed: provide installed scancode 32.5.0')
    v=subprocess.run([exe,'--version'],capture_output=True,text=True,timeout=20,check=False)
    version=re.search(r'\b(\d+\.\d+\.\d+)\b',v.stdout+' '+v.stderr)
    if v.returncode!=0 or not version or version.group(1)!=VERSION:
        raise RuntimeError(f'Unexpected ScanCode version, required {VERSION}')
    with tempfile.TemporaryDirectory(prefix='.scancode-',dir=library) as tmp:
        output=Path(tmp)/'scan.json'
        # Real ScanCode CLI: explicit output file and scans. No shell, no network API.
        command=[exe,'--license','--copyright','--package','--info','--json',str(output),str(root)]
        proc=subprocess.run(command,capture_output=True,text=True,timeout=timeout,check=False)
        if proc.returncode!=0 or not output.is_file():
            raise RuntimeError(f'ScanCode failed ({proc.returncode}); no reuse permission granted. '+proc.stderr[-400:])
        return ingest_report(library,game_id,output,scan_version=VERSION)


def lookup(inventory: dict[str,Any], game: str, file: str, hash_in_index: str='') -> dict[str,Any] | None:
    """Look up rights by file origin, never by source-code symbol hash."""
    if not isinstance(inventory,dict) or inventory.get('schema')!=SCHEMA:return None
    record=((inventory.get('games') or {}).get(game) or {}).get('files',{}).get(file)
    if not isinstance(record,dict):return None
    if hash_in_index and record.get('source_sha256')!=hash_in_index:
        return {'status':'hash_mismatch','license_expressions':[], 'source_sha256':hash_in_index}
    if record.get('clearance') and isinstance(record['clearance'],dict):
        c=record['clearance']
        if c.get('source_sha256')==record.get('source_sha256') and c.get('basis') in ('owner','permission','compatible-license') and c.get('evidence'):
            return {**record,'status':'reviewed_exception'}
    return record


def manual_clearance(library:Path, game_id:str, rel:str, basis:str, license_name:str, evidence:str) -> dict[str,Any]:
    game,root=indexed_game(library,game_id)
    rel=safe_relative(rel)
    if not rel or len(evidence)<12 or len(evidence)>500 or len(license_name)<2 or len(license_name)>100:
        raise ValueError('Specify a safe indexed file, exact license and meaningful rights evidence')
    # Never treat tool output as legal review or guess ownership from a file path.
    rights_file=library/'scancode-rights.json'
    data=load_json(rights_file,MAX_REPORT)
    if data.get('schema')!=SCHEMA:raise ValueError('Rights inventory missing or invalid')
    record=((data.get('games') or {}).get(game_id) or {}).get('files',{}).get(rel)
    if not isinstance(record,dict):raise ValueError('First run ScanCode and ingest its report for this game')
    indexed={entry.get('path'):entry.get('sha256') for entry in game['files'] if isinstance(entry,dict)}
    file=root.joinpath(*PurePosixPath(rel).parts)
    if (rel not in indexed or not file.is_file() or file.is_symlink()
            or not file.resolve().is_relative_to(root) or sha(file)!=indexed[rel]
            or record.get('source_sha256')!=indexed[rel]):
        raise ValueError('Source file changed: manual clearance cannot be issued')
    record['clearance']={'basis':basis,'license':license_name,'evidence':evidence,
                         'source_sha256':indexed[rel], 'manual_review':True}
    write_atomic(rights_file,data)
    return {'game':game_id,'file':rel,'status':'reviewed_exception',
            'notice':'Manual assertion recorded; it does not automatically grant component reuse approval.'}


def apply_to_docs(library:Path, docs:list[dict[str,Any]]) -> list[dict[str,Any]]:
    file=library/'scancode-rights.json'
    if not file.exists():return docs
    inventory=load_json(file,MAX_REPORT)
    game_file_hashes={}
    game_roots={}
    idx=load_json(library/'fusion-index.json',MAX_INDEX)
    for game in idx.get('games',[]):
        if isinstance(game,dict):
            game_roots[game.get('id')]=Path(game.get('source_root','')).expanduser().resolve()
        for entry in game.get('files',[]):
            game_file_hashes[(game.get('id'),entry.get('path'))]=entry.get('sha256','')
    for doc in docs:
        record=lookup(inventory,doc.get('game',''),doc.get('file',''),
                      game_file_hashes.get((doc.get('game'),doc.get('file')),''))
        if record is None:continue
        status=record.get('status','needs_review')
        if status=='reviewed_exception' or doc.get('approved_for_reuse'):
            root=game_roots.get(doc.get('game'))
            relative=safe_relative(doc.get('file'))
            original=root.joinpath(*PurePosixPath(relative).parts) if root and relative else None
            if (not original or not original.is_file() or original.is_symlink() or
                    not original.resolve().is_relative_to(root) or
                    sha(original)!=game_file_hashes.get((doc.get('game'),doc.get('file')))):
                status='hash_mismatch'
        doc['license_scan_status']=status
        doc['license_scan_expressions']=record.get('license_expressions',[])[:8]
        doc['license_scan_blocked']=status in ('scan_error','hash_mismatch','restricted_review','needs_review','unscanned')
        if doc['license_scan_blocked']:
            doc['approved_for_reuse']=False
            doc['compatibility']='license_review_required'
    return docs


def preflight(library:Path, game:str|None) -> dict[str,Any]:
    index=load_json(library/'fusion-index.json',MAX_INDEX)
    findings=load_json(library/'scancode-rights.json',MAX_REPORT) if (library/'scancode-rights.json').exists() else None
    ids=[x.get('id') for x in index.get('games',[]) if isinstance(x,dict) and (game is None or x.get('id')==game)]
    if not ids:raise ValueError('No indexed games for preflight')
    if not findings:return {'pass':False,'reason':'ScanCode rights inventory missing','games':ids}
    output={}
    for gid in ids:
        items=((findings.get('games') or {}).get(gid) or {}).get('files',{})
        blocked=[p for p,r in items.items()
                 if lookup(findings,gid,p,r.get('source_sha256','')).get('status') not in
                 ('permissive_detected','reviewed_exception')]
        output[gid]={'scanned':bool(items),'files':len(items),'review_required':len(blocked),
                     'blocked_examples':blocked[:12]}
    return {'pass':all(x['scanned'] and x['review_required']==0 for x in output.values()),
            'games':output,'notice':'Even a green scan does not grant reuse rights or replace asset-specific approval.'}


def main() -> int:
    p=argparse.ArgumentParser(description='META GAME FUSION / ScanCode local license discovery')
    sub=p.add_subparsers(dest='command',required=True)
    a=sub.add_parser('scan');a.add_argument('--library',required=True);a.add_argument('--game',required=True)
    a.add_argument('--cli',default='scancode');a.add_argument('--timeout',type=int,default=300)
    b=sub.add_parser('ingest');b.add_argument('--library',required=True);b.add_argument('--game',required=True);b.add_argument('--report',required=True)
    c=sub.add_parser('preflight');c.add_argument('--library',required=True);c.add_argument('--game')
    review=sub.add_parser('review', help='Explicit rights-holder clearance with source hash and evidence')
    review.add_argument('--library',required=True);review.add_argument('--game',required=True)
    review.add_argument('--file',required=True);review.add_argument('--basis',choices=['owner','permission','compatible-license'],required=True)
    review.add_argument('--license',required=True);review.add_argument('--evidence',required=True)
    args=p.parse_args()
    try:
        library=library_root(args.library)
        if args.command=='scan':
            if args.timeout<20 or args.timeout>1800:raise ValueError('Invalid timeout')
            result=run_scan(library,args.game,args.cli,args.timeout)
        elif args.command=='ingest':result=ingest_report(library,args.game,Path(args.report).resolve())
        elif args.command=='review':result=manual_clearance(library,args.game,args.file,args.basis,args.license,args.evidence)
        else:result=preflight(library,args.game)
        print(json.dumps(result,ensure_ascii=False,indent=2))
        return 0 if args.command!='preflight' or result['pass'] else 2
    except (ValueError,RuntimeError,OSError,subprocess.TimeoutExpired,json.JSONDecodeError) as exc:
        print('ScanCode bridge: '+str(exc),file=sys.stderr)
        return 2


if __name__=='__main__':raise SystemExit(main())

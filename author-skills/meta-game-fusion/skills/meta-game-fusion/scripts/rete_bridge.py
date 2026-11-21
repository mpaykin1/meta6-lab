#!/usr/bin/env python3
"""META GAME FUSION: non-executing Rete.js 2 graph workbench and strict storyboard validator.

Builds directly on qdrant_bridge.collect() records, without contacting a network, and
without reading or executing the source games when rendering graphs.
"""
from __future__ import annotations

import argparse
from collections import deque
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import sys
from typing import Any

from qdrant_bridge import collect, hash_vector, load_json, safe_library

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / 'templates' / 'rete-workbench'
GRAPH_SCHEMA = 'meta-game-fusion.graph.v1'
CATALOG_SCHEMA = 'meta-game-fusion.rete-catalog.v1'
APPROVAL_SCHEMA = 'meta-game-fusion.reuse-approvals.v1'
BLUEPRINT_SCHEMA = 'meta-game-fusion.scene-blueprint.v1'
MAX_NODES = 400
MAX_EDGES = 1200
MAX_DOCS = 20000
ID_RE = re.compile(r'^[A-Za-z0-9_:.@-]{1,128}$')
CONDITION_RE = re.compile(r'^(flag|item):[a-zA-Z0-9_.:-]{1,80}$')
PORTS = {
    'start': (set(), {'flow'}),
    'scene': ({'flow', 'asset'}, {'flow'}),
    'mechanic': ({'flow', 'asset'}, {'flow'}),
    'branch': ({'flow'}, {'yes', 'no'}),
    'ending': ({'flow'}, set()),
    'resource': (set(), {'asset'}),
    'dialogue': ({'flow'}, {'flow'}),
}
SCAFFOLD_TYPES = {'start', 'scene', 'branch', 'ending', 'dialogue'}
COMPONENT_TYPES = {'mechanic', 'resource'}


def read_json(path: Path, limit_bytes: int = 8_000_000) -> dict[str, Any]:
    if path.is_symlink() or not path.is_file() or path.stat().st_size > limit_bytes:
        raise ValueError('Graph/approval file missing, symlinked, or oversized')
    obj = json.loads(path.read_text(encoding='utf8'))
    if not isinstance(obj, dict):
        raise ValueError('JSON must be an object')
    return obj


def atomic_write(path: Path, obj: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + '.tmp')
    tmp.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
    os.replace(tmp, path)


def verified_approvals(library: Path, docs: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    approvals_file = library / 'reuse-approvals.json'
    if not approvals_file.is_file():
        return {}
    data = read_json(approvals_file)
    if data.get('schema') != APPROVAL_SCHEMA or not isinstance(data.get('approvals'), list):
        raise ValueError('Invalid reuse-approvals.json schema')
    known = {doc['id']: doc for doc in docs}
    valid: dict[str, dict[str, Any]] = {}
    # Detect stale approval hashes after source game changes without rebuilding an index.
    idx=read_json(library/'fusion-index.json', 40_000_000)
    roots={g['id']:Path(g['source_root']).resolve() for g in idx.get('games',[]) if isinstance(g,dict) and g.get('source_root')}
    for approval in data['approvals']:
        if not isinstance(approval, dict):
            continue
        doc = known.get(approval.get('component_id'))
        if not doc or not doc.get('source_sha256'):
            continue
        if approval.get('source_sha256') != doc['source_sha256']:
            continue
        root=roots.get(doc.get('game'))
        if root:
            origin=(root / doc.get('file','')).resolve()
            # Components may reference a symbol SHA rather than file SHA.
            # Verify at least the indexed source file is unchanged.
            game_index=next((g for g in idx.get('games',[]) if isinstance(g,dict) and g.get('id')==doc.get('game')),None)
            indexed=next((f.get('sha256') for f in game_index.get('files',[]) if isinstance(f,dict) and f.get('path')==doc.get('file')),None) if game_index else None
            if not origin.is_relative_to(root) or not origin.is_file() or origin.is_symlink() or not indexed:
                continue
            if hashlib.sha256(origin.read_bytes()).hexdigest()!=indexed:continue
        if approval.get('basis') not in {'owner', 'permission', 'compatible-license'}:
            continue
        # A conflicting/unknown ScanCode finding must never be bypassed by
        # an older reuse-approvals.json entry. A rights owner can resolve it
        # outside the automatic pipeline after reviewing underlying files.
        if doc.get('license_scan_blocked'):
            continue
        if not isinstance(approval.get('license'), str) or not approval['license'].strip():
            continue
        valid[doc['id']] = approval
    return valid


def catalog(library: Path, theme: str = "") -> dict[str, Any]:
    docs = collect(library)
    if len(docs) > MAX_DOCS:
        raise ValueError(f'Large catalog ({len(docs)}). Limit is {MAX_DOCS}; split your game library.')
    approvals = verified_approvals(library, docs)
    theme = theme.strip()[:300]
    theme_vector = hash_vector(theme) if theme else None
    records = []
    for doc in docs:
        a = approvals.get(doc['id'])
        records.append({
            'id': doc['id'], 'kind': doc['kind'], 'title': doc['name'][:120],
            'game': doc['game'], 'file': doc['file'],
            'tags': doc['tags'][:20], 'source_sha256': doc['source_sha256'],
            'approved_for_reuse': bool(a or doc['approved_for_reuse']) and not doc.get('license_scan_blocked', False),
            'license_scan_status': doc.get('license_scan_status', 'not_scanned'),
            'license_scan_expressions': doc.get('license_scan_expressions', []),
            'license_scan_blocked': bool(doc.get('license_scan_blocked', False)),
            'license': a['license'] if a else doc['license'],
            'compatibility': doc['compatibility'],
            'optimized_output': doc['optimized_output'],
            'relevance': round(sum(x * y for x, y in zip(theme_vector, hash_vector(doc['search_text']))), 5)
                         if theme_vector else 0,
        })
    if theme:
        records.sort(key=lambda d: (-d['relevance'], d['game'], d['kind'], d['file']))
    return {'schema': CATALOG_SCHEMA, 'theme': theme,
            'ranking': 'local-lexical-vector-hash' if theme else 'unranked', 'components': records,
            'source': 'Tree-sitter + Assimp + glTF-Transform + Qdrant metadata',
            'notice': 'Search results are candidates; rights and runtime compatibility must be checked.'}


def sample_graph() -> dict[str, Any]:
    # Sample Ink authored for this skill, stored in the editor template; pinned by source hash.
    src = TEMPLATE / 'stories-src' / 'last_viaduct.ink'
    sha = hashlib.sha256(src.read_bytes()).hexdigest()
    return {'schema': GRAPH_SCHEMA, 'title': 'Последний виадук — сюжетный прототип',
            'nodes': [
                {'id':'start', 'type':'start', 'title':'Начало', 'position':{'x':-620,'y':-100}},
                {'id':'scene', 'type':'scene', 'title':'Разрушенный виадук', 'position':{'x':-330,'y':-100}},
                {'id':'dialogue', 'type':'dialogue', 'title':'Встреча в тумане', 'position':{'x':-20,'y':-100},
                 'story_id':'last_viaduct', 'story_sha256':sha},
                {'id':'branch', 'type':'branch', 'title':'У героя есть фонарь?', 'position':{'x':270,'y':-100},
                 'condition':'flag:has_torch'},
                {'id':'ending_yes', 'type':'ending', 'title':'Свет ведёт к поезду', 'position':{'x':560,'y':-240}},
                {'id':'ending_no', 'type':'ending', 'title':'Тьма закрывает путь', 'position':{'x':560,'y':80}},
            ], 'connections': [
                {'id':'c1','source':'start','sourceOutput':'flow','target':'scene','targetInput':'flow'},
                {'id':'c2','source':'scene','sourceOutput':'flow','target':'dialogue','targetInput':'flow'},
                {'id':'c3','source':'dialogue','sourceOutput':'flow','target':'branch','targetInput':'flow'},
                {'id':'c4','source':'branch','sourceOutput':'yes','target':'ending_yes','targetInput':'flow'},
                {'id':'c5','source':'branch','sourceOutput':'no','target':'ending_no','targetInput':'flow'},
            ]}


def story_manifest(path: Path | None) -> dict[str, dict[str, Any]]:
    if path is None:
        return {}
    raw = read_json(path, 500_000)
    if raw.get('schema') != 'meta-game-fusion.ink-manifest.v1' or not isinstance(raw.get('stories'), list):
        raise ValueError('Unsupported Ink manifest schema')
    if len(raw['stories']) > 100:
        raise ValueError('Too many Ink stories')
    stories = {}
    base = path.parent.resolve()
    for item in raw['stories']:
        if not isinstance(item, dict): raise ValueError('Malformed Ink story descriptor')
        sid = item.get('id')
        if not isinstance(sid,str) or not re.fullmatch(r'[A-Za-z][A-Za-z0-9_-]{0,63}',sid) or sid in stories:
            raise ValueError('Invalid/duplicate Ink story ID')
        rel = item.get('runtime_file')
        if rel != f'stories/{sid}.json': raise ValueError('Unsafe Ink runtime path')
        runtime_path = base / f'{sid}.json'
        if not runtime_path.is_file() or runtime_path.is_symlink() or runtime_path.stat().st_size > 5_000_000:
            raise ValueError('Missing/invalid compiled Ink JSON')
        digest = hashlib.sha256(runtime_path.read_bytes()).hexdigest()
        if digest != item.get('runtime_sha256'): raise ValueError('Changed compiled Ink JSON')
        try: compiled = read_json(runtime_path, 5_000_000)
        except (ValueError, UnicodeDecodeError) as e: raise ValueError('Invalid Ink bytecode JSON') from e
        if not isinstance(compiled.get('inkVersion'),int) or 'root' not in compiled:
            raise ValueError('Not inkjs compiled JSON')
        exports=item.get('exports')
        if not isinstance(exports,dict) or any(not re.fullmatch(r'[A-Za-z_][A-Za-z0-9_]{0,63}', k)
                    or not re.fullmatch(r'(flag|item):[A-Za-z_][A-Za-z0-9_]{0,63}',v)
                    for k,v in exports.items()):
            raise ValueError('Invalid Ink state export mapping')
        if not re.fullmatch(r'[a-f0-9]{64}',str(item.get('source_sha256',''))):
            raise ValueError('Invalid Ink source digest')
        stories[sid] = item
    return stories


def inside(path: Path, root: Path) -> bool:
    return path == root or root in path.parents


def ensure_output_not_in_source(out: Path, library: Path) -> None:
    idx = load_json(library / 'fusion-index.json')
    if idx:
        for game in idx.get('games', []):
            if not isinstance(game, dict):
                continue
            source = game.get('source_root')
            if source:
                p = Path(source).expanduser().resolve()
                if inside(out, p):
                    raise ValueError('Output would modify original game: ' + str(p))


def prepare(args: argparse.Namespace, library: Path) -> None:
    out = (Path(args.out).expanduser() if args.out else library / 'rete-workbench').resolve()
    ensure_output_not_in_source(out, library)
    if out == ROOT or inside(out, ROOT):
        raise ValueError('Generated workbench must be outside the skill template')
    if out.exists() and any(out.iterdir()):
        raise ValueError('Workbench output must be empty; choose a fresh --out to avoid overwriting edits')
    out.mkdir(parents=True, exist_ok=True)
    shutil.copytree(TEMPLATE, out, dirs_exist_ok=True, symlinks=False)
    lib = catalog(library, args.theme)
    atomic_write(out / 'public' / 'catalog.json', lib)
    atomic_write(out / 'public' / 'graph.json', sample_graph())
    print(f'Workbench created: {out} ({len(lib["components"])} game components). Run npm install --ignore-scripts, then npm run dev.')


def normalize_graph(graph: dict[str, Any], components: dict[str, dict[str, Any]], stories: dict[str, dict[str, Any]] | None = None) -> dict[str, Any]:
    if graph.get('schema') != GRAPH_SCHEMA:
        raise ValueError('Wrong graph schema')
    nodes = graph.get('nodes')
    edges = graph.get('connections')
    if not isinstance(nodes, list) or not isinstance(edges, list):
        raise ValueError('Graph must have nodes and connections arrays')
    if len(nodes) > MAX_NODES or len(edges) > MAX_EDGES:
        raise ValueError('Graph exceeds node/connection safety limits')
    by_id: dict[str, dict[str, Any]] = {}
    for raw in nodes:
        if not isinstance(raw, dict):
            raise ValueError('Each node must be an object')
        nid = raw.get('id')
        t = raw.get('type')
        if not isinstance(nid, str) or not ID_RE.fullmatch(nid) or nid in by_id:
            raise ValueError('Duplicate or invalid node ID')
        if t not in PORTS:
            raise ValueError('Unsupported node type')
        title = raw.get('title')
        if not isinstance(title, str) or not (1 <= len(title.strip()) <= 150):
            raise ValueError(f'Invalid node title: {nid}')
        cid = raw.get('component_id')
        if t in COMPONENT_TYPES:
            doc = components.get(cid) if isinstance(cid, str) else None
            if not doc:
                raise ValueError(f'Missing source-catalog component: {nid}')
            if t == 'mechanic' and doc['kind'] != 'mechanic':
                raise ValueError('Non-mechanic asset assigned to mechanic node')
            if t == 'resource' and doc['kind'] == 'mechanic':
                raise ValueError('A mechanic cannot be attached as a resource')
            if not doc['approved_for_reuse']:
                raise ValueError(f'Component is not approved for reuse: {nid} ({doc["game"]}/{doc["file"]})')
            if doc['compatibility'] not in {'verified', 'compatible'}:
                # The graph is a storyboard only, not a runtime-ready game.
                pass
            if raw.get('source_sha256') != doc['source_sha256'] or not doc['source_sha256']:
                raise ValueError(f'Component changed or source hash missing: {nid}')
        else:
            if cid:
                raise ValueError('Built-in storyboard node cannot refer to a component')
        if t == 'dialogue':
            record = (stories or {}).get(raw.get('story_id'))
            if not record: raise ValueError(f'Unregistered Ink story: {nid}')
            if raw.get('story_sha256') != record.get('source_sha256'):
                raise ValueError(f'Changed Ink story: {nid}')
            if not record.get('approved_for_reuse'):
                raise ValueError(f'Ink story rights not approved: {nid}')
        if t == 'branch' and not CONDITION_RE.fullmatch(str(raw.get('condition', ''))):
            raise ValueError('Branch condition must be flag:name or item:name')
        pos = raw.get('position')
        if not isinstance(pos, dict) or not all(isinstance(pos.get(a), (int, float)) and abs(pos[a]) < 1e6 for a in ('x', 'y')):
            raise ValueError(f'Invalid 2D node position: {nid}')
        by_id[nid] = {'id':nid, 'type':t, 'title':title.strip(),
                      'position':{'x':int(pos['x']), 'y':int(pos['y'])},
                      **({'component_id':cid, 'source_sha256':raw['source_sha256']} if t in COMPONENT_TYPES else {}),
                      **({'condition':raw['condition']} if t == 'branch' else {}),
                      **({'story_id':raw['story_id'], 'story_sha256':raw['story_sha256']} if t == 'dialogue' else {})}
    starts = [n for n in by_id.values() if n['type'] == 'start']
    ends = [n for n in by_id.values() if n['type'] == 'ending']
    if len(starts) != 1 or not ends:
        raise ValueError('Story graph requires exactly one Start and at least one Ending')
    flow_edges: dict[str, list[str]] = {k:[] for k in by_id}
    reverse_edges: dict[str, list[str]] = {k:[] for k in by_id}
    asset_edges: dict[str, list[str]] = {k:[] for k in by_id}
    edge_ids = set()
    inports = set()
    normalized = []
    for e in edges:
        if not isinstance(e, dict):
            raise ValueError('Connection is not an object')
        eid = e.get('id'); s = e.get('source'); t = e.get('target'); op=e.get('sourceOutput'); ip=e.get('targetInput')
        if not isinstance(eid, str) or not ID_RE.fullmatch(eid) or eid in edge_ids:
            raise ValueError('Invalid or duplicate edge ID')
        if s not in by_id or t not in by_id or s == t:
            raise ValueError('Dangling or self-connection')
        if op not in PORTS[by_id[s]['type']][1] or ip not in PORTS[by_id[t]['type']][0]:
            raise ValueError(f'Illegal connector: {s}:{op} to {t}:{ip}')
        if (op == 'asset') != (ip == 'asset'):
            raise ValueError('Cannot connect resources to story flow or vice versa')
        if (t, ip) in inports and ip == 'flow':
            # Multiple narrative incoming connections are allowed, including branch merge.
            pass
        if (s, op, t, ip) in {(x['source'], x['sourceOutput'], x['target'], x['targetInput']) for x in normalized}:
            raise ValueError('Duplicate connection')
        inports.add((t, ip)); edge_ids.add(eid)
        normalized.append({'id':eid, 'source':s, 'sourceOutput':op,'target':t,'targetInput':ip})
        if op == 'asset':
            asset_edges[s].append(t)
        else:
            flow_edges[s].append(t)
            reverse_edges[t].append(s)
    for n in by_id.values():
        if n['type'] == 'resource' and not asset_edges[n['id']]:
            raise ValueError(f'Unattached resource: {n["id"]}')
        if n['type'] == 'branch':
            ports = {e['sourceOutput'] for e in normalized if e['source'] == n['id']}
            if not {'yes','no'}.issubset(ports):
                raise ValueError(f'Branch needs both yes and no outputs: {n["id"]}')
    flow_nodes = {n['id'] for n in by_id.values() if n['type'] != 'resource'}
    start_id = starts[0]['id']
    visited = set(); queue = deque([start_id])
    while queue:
        curr=queue.popleft()
        if curr in visited: continue
        visited.add(curr)
        queue.extend(flow_edges[curr])
    if flow_nodes - visited:
        raise ValueError('Disconnected story nodes: '+', '.join(sorted(flow_nodes-visited)))
    can_finish=set(); queue=deque(n['id'] for n in ends)
    while queue:
        curr=queue.popleft()
        if curr in can_finish: continue
        can_finish.add(curr)
        queue.extend(reverse_edges[curr])
    if flow_nodes - can_finish:
        raise ValueError('A branch cannot reach an Ending: '+', '.join(sorted(flow_nodes-can_finish)))
    indegree={nid:len(reverse_edges[nid]) for nid in flow_nodes}
    todo=deque(nid for nid in flow_nodes if indegree[nid]==0)
    topo=[]
    while todo:
        nid=todo.popleft();topo.append(nid)
        for t in flow_edges[nid]:
            indegree[t]-=1
            if not indegree[t]:todo.append(t)
    if len(topo)!=len(flow_nodes):
        raise ValueError('Story cycle detected; add a future explicit loop adapter instead')
    return {'title':str(graph.get('title') or 'Без названия')[:200], 'nodes':list(by_id.values()),
            'connections':normalized, 'flow_order':topo}


def validate(args: argparse.Namespace, library: Path) -> None:
    docs = catalog(library)['components']
    components = {d['id']:d for d in docs}
    stories = story_manifest(Path(args.stories_manifest).expanduser().resolve() if args.stories_manifest else None)
    graph = normalize_graph(read_json(Path(args.graph).expanduser()), components, stories)
    by_id={n['id']:n for n in graph['nodes']}
    links:dict[str, list[str]]={}
    for edge in graph['connections']:
        if edge['targetInput']=='asset':
            links.setdefault(edge['target'],[]).append(edge['source'])
    scene_plan=[]
    for nid in graph['flow_order']:
        n=by_id[nid]
        card=components.get(n.get('component_id', ''))
        scene_plan.append({
            'node': n, 'component': card if n['type']=='mechanic' else None,
            'ink_story': stories.get(n.get('story_id')) if n['type']=='dialogue' else None,
            'resources':[components[by_id[ref]['component_id']] for ref in links.get(nid,[])],
            'next':[{'node':x['target'], 'branch':x['sourceOutput'] if n['type']=='branch' else 'flow'}
                    for x in graph['connections'] if x['source']==nid and x['targetInput']=='flow'],
        })
    blueprint={'schema':BLUEPRINT_SCHEMA,'title':graph['title'], 'runtime_executable':False,
               'notice':'Validated storyboard only; gameplay adapters, licensing and art fidelity need runtime verification.',
               'scene_plan':scene_plan}
    if args.out:
        dest=Path(args.out).expanduser().resolve()
        ensure_output_not_in_source(dest, library)
        atomic_write(dest,blueprint)
        print(f'Storyboard blueprint: {dest} ({len(scene_plan)} story nodes). Not a playable game.')
    else:
        print(f'Graph valid: {len(scene_plan)} story nodes, {len(graph["connections"])} connections. Not a playable game.')


def approve(args: argparse.Namespace, library: Path) -> None:
    docs={d['id']:d for d in collect(library)}
    doc=docs.get(args.component_id)
    if not doc or not doc['source_sha256']:
        raise ValueError('Unknown component or missing source hash')
    if args.basis not in {'owner','permission','compatible-license'}:
        raise ValueError('Invalid rights basis')
    if doc.get('license_scan_blocked'):
        raise ValueError('ScanCode rights review required before reuse approval: '+doc['game']+'/'+doc['file'])
    if not args.license or len(args.license)>120:
        raise ValueError('Provide exact permitted asset license')
    file=library/'reuse-approvals.json'
    if file.exists():
        raw=read_json(file)
        if raw.get('schema')!=APPROVAL_SCHEMA or not isinstance(raw.get('approvals'),list):
            raise ValueError('Invalid approval registry')
    else:
        raw={'schema':APPROVAL_SCHEMA,'approvals':[]}
    record={'component_id':doc['id'],'source_sha256':doc['source_sha256'],
            'basis':args.basis,'license':args.license}
    raw['approvals']=[v for v in raw['approvals'] if isinstance(v,dict) and v.get('component_id')!=doc['id']]
    raw['approvals'].append(record)
    atomic_write(file,raw)
    print('Reuse approval registered for source-hash-pinned component: '+doc['game']+'/'+doc['file'])


def main() -> None:
    parser=argparse.ArgumentParser(description=__doc__)
    subs=parser.add_subparsers(dest='command',required=True)
    b=subs.add_parser('prepare',help='Generate Rete.js visual editor and catalog from existing game library')
    b.add_argument('--library',required=True);b.add_argument('--out');b.add_argument('--theme',default='',help='Offline lexical Qdrant-compatible candidate ranking prompt')
    v=subs.add_parser('validate',help='Validate graph and optionally emit a non-executable scene blueprint')
    v.add_argument('--library',required=True);v.add_argument('--graph',required=True);v.add_argument('--out');v.add_argument('--stories-manifest',help='Compiled stories manifest from Rete workbench')
    a=subs.add_parser('approve',help='Explicitly approve one source-hash-pinned component for reuse')
    a.add_argument('--library',required=True);a.add_argument('--component-id',required=True)
    a.add_argument('--basis',choices=['owner','permission','compatible-license'],required=True)
    a.add_argument('--license',required=True)
    args=parser.parse_args()
    try:
        library=safe_library(Path(args.library))
        {'prepare':prepare,'validate':validate,'approve':approve}[args.command](args,library)
    except (ValueError,FileNotFoundError,OSError,RuntimeError) as exc:
        parser.exit(2,str(exc)+'\n')

if __name__=='__main__':main()

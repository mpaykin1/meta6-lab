#!/usr/bin/env python3
"""META GAME FUSION — provenance-preserving vector index, Qdrant local/server + offline JSON.

Tree-sitter mechanics + Assimp model inventory + glTF-Transform optimized records.
NO game code execution. NO third-party asset copying. NO automatic remote access.
"""
from __future__ import annotations

import argparse
from collections import defaultdict
import hashlib
import json
import math
import os
from pathlib import Path
import re
import sys
import uuid
from typing import Any

SCHEMA = 'meta-game-fusion.search.v1'
DOC_SCHEMA = 'meta-game-fusion.search-documents.v1'
DIMS = 384
MODEL = 'intfloat/multilingual-e5-small'
COLLECTION_PREFIX = 'mgf_game_library'
MODEL_FORMATS = {'.glb', '.gltf', '.obj', '.fbx', '.stl', '.dae', '.ply', '.3ds', '.blend', '.vox', '.usd', '.usdz'}
TAG_TRANSLATIONS = {
    'character-controller': 'персонаж ходьба бег управление controller movement',
    'physics-collisions': 'физика столкновения коллизии хитбокс physics collision',
    'combat': 'бой атака оружие стрельба противник combat attack',
    'camera': 'камера ракурс следование camera',
    'animation': 'анимация движение кадры animation rig skeleton',
    'world-scene': 'мир уровень сцена ландшафт terrain world',
    'npc-ai': 'враги искусственный интеллект навигация npc enemy',
    'navmesh': 'сетка навигации обход препятствий маршрут путь navigation pathfinding detour recast',
    'inventory': 'инвентарь лут предметы вещи inventory pickup',
    'dialogue-story': 'сюжет диалог квест история story quest',
    'audio': 'звук музыка атмосфера audio music',
    'postfx-glsl': 'шейдер туман свечение постэффекты glsl shader fog',
    'spatial-index': 'пространственный индекс трассировка лучей точный выбор поверхности raycast bvh visibility three mesh',
    'saving': 'сохранение прогресс save checkpoint',
    'ui': 'интерфейс меню кнопки ui menu',
}
EXT_TAGS = {
    '.png': ('texture', 'графика текстура изображение'),
    '.jpg': ('texture', 'графика текстура изображение'),
    '.jpeg': ('texture', 'графика текстура изображение'),
    '.webp': ('texture', 'графика текстура изображение'),
    '.gif': ('animation', 'анимация спрайт gif'),
    '.svg': ('vector-art', 'векторная графика'),
    '.wav': ('audio', 'звук музыка'),
    '.mp3': ('audio', 'звук музыка'),
    '.ogg': ('audio', 'звук музыка'),
    '.webm': ('video', 'видео анимация'),
    '.mp4': ('video', 'видео анимация'),
    '.glsl': ('shader', 'шейдер glsl туман освещение'),
    '.frag': ('shader', 'шейдер glsl fragment'),
    '.vert': ('shader', 'шейдер glsl vertex'),
    '.atlas': ('sprite-atlas', 'атлас спрайтов анимация'),
    '.ink': ('narrative', 'сюжет интерактивный диалог inkjs развилка история'),
}
MAX_DOCUMENTS = 200000
MAX_TEXT = 1800


def load_json(path: Path, *, max_mb: int = 200) -> dict[str, Any] | None:
    if not path.is_file():
        return None
    if path.is_symlink():
        raise ValueError(f'Refusing symlinked input: {path.name}')
    if path.stat().st_size > max_mb * 1024 * 1024:
        raise ValueError(f'Catalog too large: {path.name}')
    result = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(result, dict):
        raise ValueError(f'Expected catalog object: {path.name}')
    return result


def safe_text(s: Any, limit: int = 300) -> str:
    if not isinstance(s, str):
        return ''
    return re.sub(r'[\x00-\x1f]+', ' ', s)[:limit].strip()


def clean_relative(s: Any) -> str:
    """Only game-relative paths enter Qdrant payload; no absolute user paths."""
    s = safe_text(s, 500).replace('\\', '/')
    if (not s or s.startswith('/') or re.match(r'^[A-Za-z]:', s)
            or any(p == '..' for p in s.split('/'))):
        return ''
    return s


def make_doc(kind: str, game: str, location: str, name: str, tags: list[str],
             source_sha256: str, *, license: str = 'review_required',
             approved_for_reuse: bool = False, compatibility: str = 'unverified',
             optimized_path: str = '', detail: str = '', identity: str = '') -> dict[str, Any] | None:
    game = safe_text(game, 64)
    location = clean_relative(location)
    if not game or not location:
        return None
    source_sha256 = safe_text(source_sha256, 80)
    tags = sorted({safe_text(t, 70) for t in tags if isinstance(t, str) and t.strip()})
    opt = clean_relative(optimized_path)
    identifier = str(uuid.uuid5(uuid.NAMESPACE_URL, 'mgf:' + game + ':' + kind + ':' + location + ':' + (identity or name)))
    searchable = ' '.join([kind, game.replace('-', ' '), name, location.replace('/', ' ').replace('-', ' '),
                           ' '.join(tags), ' '.join(TAG_TRANSLATIONS.get(t, '') for t in tags), detail])[:MAX_TEXT]
    return {
        'id': identifier, 'kind': kind, 'game': game, 'file': location,
        'name': safe_text(name, 180), 'tags': tags,
        'source_sha256': source_sha256, 'license': safe_text(license, 80) or 'review_required',
        'approved_for_reuse': bool(approved_for_reuse),
        'compatibility': safe_text(compatibility, 70) or 'unverified',
        'optimized_output': opt, 'search_text': searchable,
    }


def collect(library: Path) -> list[dict[str, Any]]:
    """Conservatively join catalogs by game/relative path without making up rights."""
    src = load_json(library / 'fusion-index.json')
    components = load_json(library / 'component-library.json')
    models = load_json(library / 'model-library.json')
    optimized = load_json(library / 'optimized-model-library.json')
    candidates = load_json(library / 'model-candidates.json')
    if not any((src, components, models, optimized, candidates)):
        raise ValueError('No META GAME FUSION catalogs found. Run Tree-sitter scan first.')
    if src and src.get('schema') != 'meta-game-fusion.index.v1':
        raise ValueError('Unsupported fusion-index.json schema')
    if components and components.get('schema') != 'meta-game-fusion.components.v1':
        raise ValueError('Unsupported component-library.json schema')
    result: dict[str, dict[str, Any]] = {}
    for card in (components or {}).get('components', []):
        if not isinstance(card, dict):
            continue
        game = str(card.get('game', ''))
        location = str(card.get('file', ''))
        tags = card.get('tags') if isinstance(card.get('tags'), list) else []
        doc = make_doc('mechanic', game, location, card.get('name', ''), tags,
                       card.get('source_sha256', ''), license=card.get('license', 'review_required'),
                       compatibility=card.get('compatibility', 'unverified'), identity=card.get('symbol_id', ''))
        if doc: result[doc['id']] = doc
    # Prefer optimized model inventory, then Assimp inventory, then Tree-sitter candidates.
    chosen = optimized or models or candidates
    for item in (chosen or {}).get('models', []):
        if not isinstance(item, dict):
            continue
        path = clean_relative(item.get('path'))
        game = item.get('game', '')
        opt = item.get('optimization', {})
        if not isinstance(opt, dict): opt = {}
        optimized_path = opt.get('output') if opt.get('status') in {'optimized', 'existing'} else ''
        meta = item.get('gltf2') or {}
        if not isinstance(meta, dict): meta = {}
        detail = '3D модель mesh material skeleton skin animation glb '
        detail += ' '.join(k for k in ('animations', 'skins', 'meshes') if meta.get(k))
        doc = make_doc('model', game, path, Path(path).stem, ['3d-model', 'animation' if meta.get('animations') else 'static-3d'],
                       item.get('source_sha256', ''), license=item.get('license', 'review_required'),
                       approved_for_reuse=item.get('approved_for_reuse', False),
                       compatibility='unverified', optimized_path=optimized_path, detail=detail)
        if doc: result[doc['id']] = doc
    # Include sprite/sound/shader/texture references; no art assets are copied.
    for game in (src or {}).get('games', []):
        game_id = game.get('id', '')
        for file in game.get('files', []):
            if file.get('kind') != 'asset':
                continue
            location = clean_relative(file.get('path'))
            if not location:
                continue
            suffix = Path(location).suffix.casefold()
            if suffix in MODEL_FORMATS:
                continue  # model handled above only
            tag, detail = EXT_TAGS.get(suffix, ('asset', 'ресурс игры'))
            doc = make_doc(tag, game_id, location, Path(location).stem, [tag],
                           file.get('sha256', ''), detail=detail,
                           license='review_required', compatibility='unverified')
            if doc: result[doc['id']] = doc
    # The plugin-authored Recast adapter is itself a reusable engine component.
    # Its source SHA is derived from real bundled bytes; no user-game content is inferred.
    adapter = Path(__file__).resolve().parents[1] / 'templates' / 'rapier-world' / 'src' / 'navigation.js'
    if adapter.is_file() and not adapter.is_symlink():
        doc = make_doc('engine-adapter', 'meta-game-fusion',
                       'templates/rapier-world/src/navigation.js',
                       'Recast NavMesh NPC pathfinding / Rapier collision',
                       ['npc-ai', 'navmesh', 'physics-collisions'],
                       hashlib.sha256(adapter.read_bytes()).hexdigest(),
                       license='MIT', approved_for_reuse=True,
                       compatibility='Three.js@0.186.1+Rapier@0.21.0+Recast@0.44.0',
                       detail='NPC проводник маршрут navigation детур коллизии обход препятствий игровые главы')
        if doc: result[doc['id']] = doc
    # Reusable Playwright verification adapter, anchored to real bundled source hash.
    checker = Path(__file__).resolve().parents[1] / 'templates' / 'rapier-world' / 'e2e' / 'runtime.spec.mjs'
    if checker.is_file() and not checker.is_symlink():
        doc = make_doc('engine-adapter', 'meta-game-fusion',
                       'templates/rapier-world/e2e/runtime.spec.mjs',
                       'Playwright browser gameplay verification / read-only quality gate',
                       ['ui','world-scene','physics-collisions','npc-ai'],
                       hashlib.sha256(checker.read_bytes()).hexdigest(),
                       license='OWNED', approved_for_reuse=True,
                       compatibility='Playwright@1.65.1+Vite@6.3.5+Three.js@0.186.1',
                       detail='playwright browser verification test automation движение прыжки безопасность физика сюжет npc телефон')
        if doc: result[doc['id']] = doc
    # Authored, reusable Postprocessing adapter. License of our adapter is distinct
    # from the Zlib-licensed engine dependency; only source hash and metadata indexed.
    postfx = Path(__file__).resolve().parents[1] / 'templates' / 'rapier-world' / 'src' / 'postfx.js'
    if postfx.is_file() and not postfx.is_symlink():
        doc = make_doc('engine-adapter', 'meta-game-fusion',
                       'templates/rapier-world/src/postfx.js',
                       'Postprocessing GLSL style morphs / cinematic FX',
                       ['postfx-glsl','world-scene','ui'],
                       hashlib.sha256(postfx.read_bytes()).hexdigest(),
                       license='OWNED', approved_for_reuse=True,
                       compatibility='Three.js@0.186.1+postprocessing@6.39.6',
                       detail='туман bloom grain vignette watercolor ink horror voxel pixel мечта свет shadow fx performance')
        if doc: result[doc['id']] = doc
    bvh = Path(__file__).resolve().parents[1] / 'templates' / 'rapier-world' / 'src' / 'spatial-bvh.js'
    if bvh.is_file() and not bvh.is_symlink():
        doc = make_doc('engine-adapter', 'meta-game-fusion',
                       'templates/rapier-world/src/spatial-bvh.js',
                       'Three Mesh BVH static spatial queries / GLB picking and NPC visibility',
                       ['spatial-index','world-scene','navmesh','physics-collisions'],
                       hashlib.sha256(bvh.read_bytes()).hexdigest(),
                       license='OWNED', approved_for_reuse=True,
                       compatibility='Three.js@0.186.1+three-mesh-bvh@0.9.18+Rapier@0.21.0+Recast@0.44.0',
                       detail='BVH spatial collision queries static mesh raycaster firstHitOnly scene occlusion click pointer обзор нпс геометрия и ассеты')
        if doc: result[doc['id']] = doc
    rights_bridge = Path(__file__).resolve().parent / 'scancode_bridge.py'
    if rights_bridge.is_file() and not rights_bridge.is_symlink():
        doc = make_doc('engine-adapter','meta-game-fusion','scripts/scancode_bridge.py',
                       'ScanCode Toolkit licensing and provenance gate',
                       ['license','asset-library','code-intelligence'],
                       hashlib.sha256(rights_bridge.read_bytes()).hexdigest(),
                       license='OWNED',approved_for_reuse=True,
                       compatibility='Tree-sitter+Assimp+glTF-Transform+Qdrant+Rete.js+Rapier',
                       detail='проверка прав лицензия копирайт происхождение ScanCode copyright license provenance')
        if doc:result[doc['id']]=doc
    if len(result) > MAX_DOCUMENTS:
        raise ValueError(f'Too many indexed components (limit {MAX_DOCUMENTS})')
    # ScanCode local metadata is an additional restrictive guard, not an approval oracle.
    # The game-source hashes are checked against the Tree-sitter index by the bridge.
    from scancode_bridge import apply_to_docs
    entries = sorted(result.values(), key=lambda x: (x['game'], x['kind'], x['file'], x['id']))
    return apply_to_docs(library, entries)


def hash_vector(text: str) -> list[float]:
    """Offline multilingual lexical feature hashing. NOT a semantic neural model."""
    v = [0.0] * DIMS
    words = re.findall(r'[^\W_]+', text.casefold(), re.UNICODE)
    features: list[tuple[str, float]] = []
    for w in words:
        features.append(('w:' + w, 1.8))
        if len(w) >= 4:
            features.extend(('t:' + w[i:i + 3], 0.16) for i in range(len(w) - 2))
    for feature, weight in features:
        key = hashlib.blake2b(feature.encode('utf-8'), digest_size=8).digest()
        val = int.from_bytes(key[:4], 'little')
        sign = -1 if key[4] & 1 else 1
        v[val % DIMS] += sign * weight
    norm = math.sqrt(sum(x * x for x in v))
    return [x / norm for x in v] if norm else v


class Encoder:
    def __init__(self, mode: str, allow_model_download: bool):
        self.mode = mode
        if mode == 'hash':
            self.name = 'lexical-hash-384-v1'
            self.model = None
        elif mode == 'multilingual':
            if not allow_model_download:
                raise ValueError('Multilingual model requires explicit --allow-model-download; it may fetch weights')
            try:
                from fastembed import TextEmbedding
                from fastembed.common.model_description import ModelSource, PoolingType
            except ImportError as e:
                raise RuntimeError('Missing FastEmbed: install optional requirements-search-semantic.txt') from e
            TextEmbedding.add_custom_model(model=MODEL, pooling=PoolingType.MEAN,
                                           normalization=True, sources=ModelSource(hf=MODEL),
                                           dim=DIMS, model_file='onnx/model.onnx')
            self.model = TextEmbedding(model_name=MODEL)
            self.name = MODEL + '-384-v1'
        else:
            raise ValueError('Unknown encoder')

    def encode(self, texts: list[str], *, query: bool = False) -> list[list[float]]:
        if self.mode == 'hash':
            return [hash_vector(t) for t in texts]
        prefix = 'query: ' if query else 'passage: '
        return [list(float(v) for v in arr) for arr in self.model.embed([prefix + t for t in texts])]


def safe_library(library: Path) -> Path:
    library = library.expanduser().resolve(strict=True)
    if not library.is_dir():
        raise ValueError('Library must be an existing directory')
    index = load_json(library / 'fusion-index.json')
    for game in (index or {}).get('games', []):
        root = game.get('source_root')
        if root and Path(root).exists():
            source_root = Path(root).resolve()
            if library == source_root or source_root in library.parents:
                raise ValueError('Library may not be inside an original game')
    return library


def collection_name(encoder: Encoder, library: Path) -> str:
    # Stable workspace-specific collection; prevents one game library mixing with another.
    workspace = hashlib.sha256(str(library).encode('utf-8')).hexdigest()[:12]
    model = hashlib.sha256(encoder.name.encode('utf-8')).hexdigest()[:10]
    return f'{COLLECTION_PREFIX}_{workspace}_{model}'


def connect_qdrant(args: argparse.Namespace, library: Path):
    try:
        from qdrant_client import QdrantClient
    except ImportError as e:
        raise RuntimeError('Qdrant client is not installed; install requirements-search.txt, or use --backend json') from e
    if args.backend == 'local':
        local_path = library / '.fusion-qdrant'
        local_path.mkdir(exist_ok=True)
        return QdrantClient(path=str(local_path))
    if args.backend == 'server':
        if not args.allow_remote:
            raise ValueError('Server mode is opt-in only: --allow-remote')
        url = args.url or ''
        if not re.fullmatch(r'https://[^\s]+', url):
            raise ValueError('Server URL must be HTTPS; no raw HTTP remote connections')
        return QdrantClient(url=url, api_key=os.environ.get(args.api_key_env) if args.api_key_env else None,
                            timeout=20)
    raise ValueError('Unknown Qdrant backend')


def filtered(doc: dict[str, Any], args: argparse.Namespace) -> bool:
    if args.game and doc['game'] != args.game:
        return False
    if args.exclude_game and doc['game'] == args.exclude_game:
        return False
    if args.kind and doc['kind'] != args.kind:
        return False
    if args.tag and args.tag not in doc['tags']:
        return False
    if args.approved_only and not doc['approved_for_reuse']:
        return False
    return True


def as_payload(doc: dict[str, Any]) -> dict[str, Any]:
    # No code bodies, no art bytes, no absolute paths, no secrets.
    return {k: v for k, v in doc.items() if k not in ('id', 'search_text')}


def build(args: argparse.Namespace, lib: Path) -> None:
    docs = collect(lib)
    encoder = Encoder(args.embedding, args.allow_model_download)
    out = lib / 'fusion-search-documents.json'
    records = {'schema': DOC_SCHEMA, 'encoder': encoder.name, 'dim': DIMS,
               'sources': ['component-library.json', 'fusion-index.json', 'optimized-model-library.json',
                           'model-library.json', 'model-candidates.json'], 'documents': docs}
    tmp = out.with_suffix('.json.tmp')
    tmp.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding='utf8')
    os.replace(tmp, out)
    if args.backend == 'json':
        print(f'Built offline lexical search manifest: {len(docs)} entries, {out}')
        return
    client = connect_qdrant(args, lib)
    from qdrant_client import models as qm
    collection = collection_name(encoder, lib)
    try:
        if not client.collection_exists(collection):
            client.create_collection(collection_name=collection, vectors_config=qm.VectorParams(size=DIMS, distance=qm.Distance.COSINE))
        else:
            info = client.get_collection(collection)
            config = info.config.params.vectors
            if isinstance(config, dict) or config.size != DIMS:
                raise ValueError('Existing collection vector schema differs; choose a new local library')
        ids = {doc['id'] for doc in docs}
        # Remove stale points from this dedicated collection, no unrelated Qdrant data affected.
        offset = None
        stale: list[str] = []
        while True:
            rows, offset = client.scroll(collection_name=collection, limit=256, offset=offset,
                                         with_payload=False, with_vectors=False)
            stale.extend(str(row.id) for row in rows if str(row.id) not in ids)
            if offset is None:
                break
        for start in range(0, len(stale), 128):
            client.delete(collection_name=collection,
                          points_selector=qm.PointIdsList(points=stale[start:start + 128]), wait=True)
        for start in range(0, len(docs), 64):
            batch = docs[start:start + 64]
            vectors = encoder.encode([d['search_text'] for d in batch])
            points = [qm.PointStruct(id=d['id'], vector=v, payload=as_payload(d)) for d, v in zip(batch, vectors)]
            if points:
                client.upsert(collection_name=collection, points=points, wait=True)
        metadata = {'schema': SCHEMA, 'backend': args.backend, 'collection': collection,
                    'embedding': encoder.name, 'documents': len(docs),
                    'search_scope': 'user-authorized-source-catalogs',
                    'quality': 'lexical' if args.embedding == 'hash' else 'multilingual-semantic',
                    'remote_opt_in': args.backend == 'server'}
        path = lib / 'qdrant-index.json'
        tmp = path.with_suffix('.json.tmp')
        tmp.write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding='utf8')
        os.replace(tmp, path)
        print(f'Indexed {len(docs)} documents in Qdrant ({args.backend}), collection={collection}')
    finally:
        client.close()


def search(args: argparse.Namespace, lib: Path) -> None:
    catalog = load_json(lib / 'fusion-search-documents.json')
    if not catalog or catalog.get('schema') != DOC_SCHEMA:
        raise ValueError('Search manifest not found. Run build first.')
    encoder = Encoder(args.embedding, args.allow_model_download)
    if catalog.get('encoder') != encoder.name:
        raise ValueError('Search manifest uses another embedding mode. Rebuild index with that mode.')
    query = safe_text(args.query, 800)
    if not query:
        raise ValueError('Empty query')
    documents = catalog.get('documents', [])
    if args.backend == 'json':
        vector = encoder.encode([query], query=True)[0]
        matches = []
        for doc in documents:
            if not filtered(doc, args): continue
            v = encoder.encode([doc['search_text']])[0]
            sim = sum(a * b for a, b in zip(vector, v))
            if sim > 0:
                matches.append({'score': round(sim, 5), **{k: v for k, v in doc.items() if k != 'search_text'}})
        matches.sort(key=lambda d: (-d['score'], d['game'], d['file']))
        answer = matches[:args.limit]
    else:
        client = connect_qdrant(args, lib)
        from qdrant_client import models as qm
        collection = collection_name(encoder, lib)
        try:
            if not client.collection_exists(collection):
                raise ValueError('Qdrant collection absent. Run build with the same backend and embedding.')
            conditions = []
            if args.game: conditions.append(qm.FieldCondition(key='game', match=qm.MatchValue(value=args.game)))
            if args.kind: conditions.append(qm.FieldCondition(key='kind', match=qm.MatchValue(value=args.kind)))
            if args.tag: conditions.append(qm.FieldCondition(key='tags', match=qm.MatchValue(value=args.tag)))
            if args.approved_only: conditions.append(qm.FieldCondition(key='approved_for_reuse', match=qm.MatchValue(value=True)))
            response = client.query_points(collection_name=collection,
                                           query=encoder.encode([query], query=True)[0],
                                           query_filter=qm.Filter(must=conditions or None, must_not=[qm.FieldCondition(key='game', match=qm.MatchValue(value=args.exclude_game))] if args.exclude_game else None) if (conditions or args.exclude_game) else None,
                                           limit=args.limit, with_payload=True, with_vectors=False)
            answer = [{'score': round(float(p.score), 5), 'id': str(p.id), **(p.payload or {})}
                      for p in response.points]
        finally:
            client.close()
    # Compatibility remains unverified: results are candidate assets, not ready-to-use imports.
    print(json.dumps({'schema': 'meta-game-fusion.search-results.v1', 'query': query,
                      'backend': args.backend, 'embedding': encoder.name,
                      'results': answer, 'license_notice': 'review_required items must not be reused until approved',
                      'compatibility_notice': 'Similarity does not prove runtime/animation compatibility'},
                     ensure_ascii=False, indent=2))


def main() -> int:
    parser = argparse.ArgumentParser(description='META GAME FUSION — Qdrant component/asset library')
    parser.add_argument('command', choices=['build', 'search'])
    parser.add_argument('--library', required=True, type=Path, help='Path to existing META GAME FUSION library')
    parser.add_argument('--backend', choices=['local', 'server', 'json'], default='local',
                        help='Qdrant embedded/local (default), remote server (opt-in) or lexical JSON fallback')
    parser.add_argument('--embedding', choices=['hash', 'multilingual'], default='hash',
                        help='Hash = offline lexical; multilingual = optional FastEmbed model')
    parser.add_argument('--allow-model-download', action='store_true')
    parser.add_argument('--allow-remote', action='store_true')
    parser.add_argument('--url', help='Explicit HTTPS Qdrant server URL (server mode only)')
    parser.add_argument('--api-key-env', help='Name of environment variable containing optional remote API key')
    parser.add_argument('--query', default='')
    parser.add_argument('--game')
    parser.add_argument('--exclude-game', help='Find candidates from other source games')
    parser.add_argument('--kind')
    parser.add_argument('--tag')
    parser.add_argument('--approved-only', action='store_true')
    parser.add_argument('--limit', type=int, default=12)
    args = parser.parse_args()
    try:
        if args.game and args.exclude_game and args.game == args.exclude_game:
            raise ValueError('Game and exclude-game cannot be identical')
        if args.limit < 1 or args.limit > 100:
            raise ValueError('Limit must be between 1 and 100')
        if args.backend != 'server' and (args.allow_remote or args.url or args.api_key_env):
            raise ValueError('Remote credentials/options only valid with --backend server')
        lib = safe_library(args.library)
        if args.command == 'build': build(args, lib)
        else: search(args, lib)
    except (ValueError, RuntimeError, ImportError, OSError, json.JSONDecodeError, KeyError) as error:
        print(f'META GAME FUSION Qdrant: {error}', file=sys.stderr)
        return 2
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

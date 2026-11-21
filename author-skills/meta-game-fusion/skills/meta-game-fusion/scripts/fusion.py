#!/usr/bin/env python3
"""META GAME FUSION — conservative static indexer powered by Tree-sitter.

Never executes imported game code. Never changes input projects.
"""
from __future__ import annotations

import argparse
from collections import defaultdict
import hashlib
import json
from pathlib import Path
import re
import sys
from typing import Any

from assimp_bridge import MODEL_EXT, model_candidates, write_atomic

SOURCE_EXT = {'.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx'}
ASSET_EXT = {'.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.glb', '.gltf', '.obj', '.fbx', '.vox', '.wav', '.mp3', '.ogg', '.webm', '.mp4', '.ttf', '.woff', '.woff2', '.frag', '.vert', '.glsl', '.json', '.atlas'} | MODEL_EXT
EXCLUDE_DIRS = {'.git', 'node_modules', '.next', 'dist', 'build', 'coverage', '.cache', '.venv', 'venv', '__pycache__', '.turbo', '.parcel-cache'}
GAME_TAGS = {
    'character-controller': (r'\b(?:move(?:ment)?Speed|walkSpeed|playerVelocity|characterController|joystick|KeyW|ArrowUp|keydown|gamepad)\b',),
    'physics-collisions': (r'\b(?:RigidBody|Collider|collision|hitbox|Rapier|cannon|ammo|gravity|raycast|sweepTest)\b',),
    'combat': (r'\b(?:damage|attack|weapon|projectile|bullet|shoot|enemyHealth|knockback|hitPoints)\b',),
    'camera': (r'\b(?:PerspectiveCamera|OrthographicCamera|cameraFollow|camera\.position|OrbitControls|PointerLockControls)\b',),
    'animation': (r'\b(?:AnimationMixer|AnimationClip|spriteSheet|spriteAtlas|flipbook|Tween|keyframe|requestAnimationFrame)\b',),
    'world-scene': (r'\b(?:Scene\s*\(|createScene|terrain|biome|levelManager|worldMap|chunk|InstancedMesh)\b',),
    'npc-ai': (r'\b(?:enemyAI|navmesh|pathfind|NPC|behaviorTree|steering|waypoint|patrol)\b',),
    'inventory': (r'\b(?:inventory|backpack|itemSlot|pickup|loot|equipment|crafting)\b',),
    'dialogue-story': (r'\b(?:dialogue|dialog|quest|chapter|storyFlag|cutscene|narrative)\b',),
    'audio': (r'\b(?:AudioListener|AudioContext|Howler|playSound|ambientSound|soundtrack|spatialAudio)\b',),
    'postfx-glsl': (r'\b(?:EffectComposer|ShaderMaterial|RawShaderMaterial|bloom|fogDensity|vignette|gl_FragColor|gl_Position)\b',),
    'saving': (r'\b(?:localStorage|indexedDB|saveGame|saveState|checkpoint|serializeState)\b',),
    'ui': (r'\b(?:HUD|healthBar|menu|overlay|button|toast|dialogPanel)\b',),
}
GAME_TAG_PATTERNS = {key: re.compile(patterns[0], re.I) for key, patterns in GAME_TAGS.items()}
SYMBOL_TYPES = {'function_declaration', 'generator_function_declaration', 'class_declaration', 'method_definition', 'function_expression', 'arrow_function'}
FILE_LIMIT = 2_000_000
SKIP_SUFFIX = ('.min.js', '.bundle.js', '.generated.js', '.map', '.d.ts')


def load_parsers() -> dict[str, Any]:
    try:
        from tree_sitter import Language, Parser
        import tree_sitter_javascript
        import tree_sitter_typescript
    except ImportError as e:
        raise RuntimeError('Нет Tree-sitter runtime. Установите зависимости: python -m pip install -r requirements.txt. ' + str(e)) from e
    langs = {
        '.js': Language(tree_sitter_javascript.language()),
        '.mjs': Language(tree_sitter_javascript.language()),
        '.cjs': Language(tree_sitter_javascript.language()),
        '.jsx': Language(tree_sitter_javascript.language()),
        '.ts': Language(tree_sitter_typescript.language_typescript()),
        '.tsx': Language(tree_sitter_typescript.language_tsx()),
    }
    return {extension: Parser(lang) for extension, lang in langs.items()}


def read_bytes(path: Path, max_file_bytes: int) -> bytes | None:
    try:
        if path.stat().st_size > max_file_bytes:
            return None
        return path.read_bytes()
    except (OSError, PermissionError):
        return None


def walk_project(root: Path, include_vendor: bool, max_files: int) -> list[Path]:
    files: list[Path] = []
    for current, dirs, names in __import__('os').walk(root, followlinks=False):
        dirs[:] = sorted(x for x in dirs if x not in EXCLUDE_DIRS and (include_vendor or x not in {'vendor', 'third_party', 'external'}))
        for filename in sorted(names):
            path = Path(current) / filename
            if path.is_symlink() or not path.is_file():
                continue
            if path.suffix.lower() in SOURCE_EXT | ASSET_EXT and not filename.endswith(SKIP_SUFFIX):
                files.append(path)
                if len(files) >= max_files:
                    return files
    return files


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def text_of(node: Any, source: bytes) -> str:
    return source[node.start_byte:node.end_byte].decode('utf8', errors='replace')


def tag_text(text: str) -> list[str]:
    return [tag for tag, pattern in GAME_TAG_PATTERNS.items() if pattern.search(text)]


def node_name(node: Any, source: bytes) -> str:
    name_node = node.child_by_field_name('name')
    if name_node is not None:
        return text_of(name_node, source)[:160]
    if node.type in {'arrow_function', 'function_expression'}:
        parent = node.parent
        if parent is not None and parent.type == 'variable_declarator':
            n = parent.child_by_field_name('name')
            if n is not None:
                return text_of(n, source)[:160]
    return '<anonymous>'


def scan_tree(root_node: Any, source: bytes, game: str, relative: str, symbol_limit: int) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    stack = [root_node]
    symbols: list[dict[str, Any]] = []
    imports: list[dict[str, Any]] = []
    while stack:
        node = stack.pop()
        if node.type == 'import_statement' or node.type == 'export_statement':
            src = node.child_by_field_name('source')
            if src is not None:
                imports.append({'module': text_of(src, source).strip('\"\''), 'line': node.start_point.row + 1})
        elif node.type == 'call_expression':
            fn = node.child_by_field_name('function')
            if fn is not None and text_of(fn, source) in {'require', 'import'}:
                arguments = node.child_by_field_name('arguments')
                if arguments and arguments.named_child_count:
                    arg = arguments.named_children[0]
                    if arg.type in {'string', 'string_fragment'}:
                        imports.append({'module': text_of(arg, source).strip('\"\''), 'line': node.start_point.row + 1})
        if node.type in SYMBOL_TYPES and len(symbols) < symbol_limit:
            snippet = text_of(node, source)
            tags = tag_text(snippet[:16000])
            # Capture only nodes that are plausible reusable components; not random anonymous callbacks.
            name = node_name(node, source)
            if name != '<anonymous>' or tags:
                symbols.append({
                    'id': f'{game}:{relative}:{node.start_point.row + 1}:{node.start_point.column + 1}',
                    'name': name,
                    'kind': node.type,
                    'line': node.start_point.row + 1,
                    'end_line': node.end_point.row + 1,
                    'tags': tags,
                    'code_sha256': sha256(source[node.start_byte:node.end_byte]),
                    'detection': 'tree-sitter-ast',
                })
        stack.extend(reversed(node.named_children))
    return symbols, imports


def safe_id(label: str) -> str:
    if not re.fullmatch(r'[A-Za-z0-9_-]{1,64}', label):
        raise ValueError('Имя игры: только A-Z, a-z, 0-9, _ и -, до 64 символов')
    return label


def index_games(game_specs: list[str], output: Path, include_vendor: bool, max_files: int, max_file_bytes: int) -> dict[str, Any]:
    parsers = load_parsers()
    seen_names = set()
    games = []
    assets_by_hash: dict[str, list[dict[str, Any]]] = defaultdict(list)
    tag_index: dict[str, list[str]] = defaultdict(list)
    for game_spec in game_specs:
        if '=' not in game_spec:
            raise ValueError('--game требует NAME=/absolute/path')
        name, raw = game_spec.split('=', 1)
        name = safe_id(name)
        if name in seen_names:
            raise ValueError(f'Повтор имени игры: {name}')
        seen_names.add(name)
        root = Path(raw).expanduser().resolve(strict=True)
        if not root.is_dir():
            raise ValueError(f'Не каталог: {root}')
        # No output in an input project: protects the source and guarantees read-only import.
        if output == root or root in output.parents:
            raise ValueError('Выход должен быть за пределами оригинальных игр')
        records = []
        all_symbols = []
        all_imports = []
        problems = []
        paths = walk_project(root, include_vendor, max_files)
        for path in paths:
            relative = path.relative_to(root).as_posix()
            b = read_bytes(path, max_file_bytes)
            if b is None:
                problems.append({'path': relative, 'reason': 'oversize-or-unreadable'})
                continue
            record: dict[str, Any] = {'path': relative, 'size': len(b), 'sha256': sha256(b), 'kind': 'code' if path.suffix.lower() in SOURCE_EXT else 'asset'}
            if record['kind'] == 'asset':
                assets_by_hash[record['sha256']].append({'game': name, 'path': relative})
            else:
                tree = parsers[path.suffix.lower()].parse(b)
                record['parse_has_errors'] = bool(tree.root_node.has_error)
                if record['parse_has_errors']:
                    problems.append({'path': relative, 'reason': 'tree-sitter-syntax-errors'})
                symbols, imports = scan_tree(tree.root_node, b, name, relative, symbol_limit=2500)
                all_symbols.extend(symbols)
                all_imports.extend([{'file': relative, **imp} for imp in imports])
                record['symbols'] = len(symbols)
                record['tags'] = tag_text(b[:250000].decode('utf8', errors='replace'))
                for tag in record['tags']:
                    tag_index[tag].append(f'{name}:{relative}')
            records.append(record)
        games.append({
            'id': name, 'source_root': str(root), 'readonly': True,
            'file_count': len(records), 'files': records, 'symbols': all_symbols,
            'imports': all_imports, 'warnings': problems,
        })
    # Separate reusable catalog; no code is copied to the new games by this stage.
    cross_game_asset_matches = [
        {'sha256': digest, 'sources': sources}
        for digest, sources in assets_by_hash.items()
        if len({item['game'] for item in sources}) > 1
    ]
    index = {
        'schema': 'meta-game-fusion.index.v1', 'parser': 'tree-sitter',
        'engine': 'static-read-only', 'games': games,
        'asset_duplicates': cross_game_asset_matches,
        'tags': dict(sorted(tag_index.items())),
        'limitations': ['Tags are keyword-based candidates, not proof of feature behavior.', 'The index does not certify licenses, compatibility, gameplay, or originality.'],
    }
    output.mkdir(parents=True, exist_ok=True)
    (output / 'fusion-index.json').write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding='utf8')
    cards = []
    for game in games:
        for sym in game['symbols']:
            if sym['tags']:
                cards.append({'symbol_id': sym['id'], 'game': game['id'], 'file': sym['id'].split(':')[1],
                              'name': sym['name'], 'tags': sym['tags'], 'source_sha256': sym['code_sha256'],
                              'compatibility': 'unverified', 'license': 'review_required', 'transfer': 'requires_review'})
    (output / 'component-library.json').write_text(json.dumps({'schema':'meta-game-fusion.components.v1','components':cards},ensure_ascii=False,indent=2), encoding='utf8')
    # Unified asset lineage: Tree-sitter discovers game code, Assimp bridge
    # consumes these exact source hashes for optional GLB conversion later.
    write_atomic(output / 'model-candidates.json', {
        'schema': 'meta-game-fusion.model-candidates.v1',
        'models': model_candidates(index),
        'next_step': 'assimp_bridge.py inventory or convert --index fusion-index.json --out OUTPUT',
    })
    print(f'Indexed {len(games)} games, {sum(g["file_count"] for g in games)} files, {len(cards)} candidate components -> {output}')
    return index


def main() -> int:
    parser = argparse.ArgumentParser(description='META GAME FUSION: Tree-sitter game-source + 3D model inventory')
    sub = parser.add_subparsers(dest='command', required=True)
    scan = sub.add_parser('scan', help='Build a read-only code / assets index from game directories')
    scan.add_argument('--game', action='append', required=True, metavar='NAME=PATH', help='Repeat per game project')
    scan.add_argument('--out', required=True, type=Path)
    scan.add_argument('--include-vendor', action='store_true', help='Index third-party sources as well (not default)')
    scan.add_argument('--max-files', type=int, default=12000)
    scan.add_argument('--max-file-bytes', type=int, default=FILE_LIMIT)
    args = parser.parse_args()
    try:
        if args.command == 'scan':
            if args.max_files < 1 or args.max_file_bytes < 1:
                raise ValueError('Лимиты должны быть положительными')
            index_games(args.game, args.out.expanduser().resolve(), args.include_vendor, args.max_files, args.max_file_bytes)
    except (RuntimeError, ValueError, FileNotFoundError, OSError) as exc:
        print(f'Ошибка: {exc}', file=sys.stderr)
        return 2
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

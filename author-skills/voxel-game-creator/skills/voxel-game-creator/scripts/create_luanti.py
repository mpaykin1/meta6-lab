#!/usr/bin/env python3
"""Export original Ragnagrok model voxels as a native, standalone Luanti mod.

No engine C++/Lua source is copied. Luanti (LGPL-2.1+) remains a separate
runtime; all mod Lua and 16x16 flat color textures are generated here.
"""
from __future__ import annotations

import json
import re
import struct
import zlib
from pathlib import Path

from ragnagrok_assets import decode

MAX_VOXELS_PER_MODEL = 12000
MAX_EXPORT_VOXELS = 35000
MAX_SWATCHES = 160


def _png_rgb(rgb: int, width: int = 16, height: int = 16) -> bytes:
    """Render an original, untextured flat swatch with no third-party assets."""
    color = bytes([(rgb >> 16) & 255, (rgb >> 8) & 255, rgb & 255])
    raw = b''.join(b'\x00' + color * width for _ in range(height))

    def chunk(kind: bytes, data: bytes) -> bytes:
        return struct.pack('>I', len(data)) + kind + data + struct.pack('>I', zlib.crc32(kind + data) & 0xffffffff)

    return (b'\x89PNG\r\n\x1a\n'
            + chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0))
            + chunk(b'IDAT', zlib.compress(raw, level=9))
            + chunk(b'IEND', b''))


def _lua_s(s: str) -> str:
    """Serialize only small safe UTF-8 strings to Lua 5.1 source."""
    if not isinstance(s, str) or len(s) > 150 or any(ord(c) < 32 for c in s):
        raise ValueError('Luanti model identifier/name contains unsupported characters')
    return '"' + s.replace('\\', '\\\\').replace('"', '\\"') + '"'


def _model_id(s: str) -> str:
    if not isinstance(s, str) or not re.fullmatch(r'[A-Za-z][A-Za-z0-9_-]{0,63}', s):
        raise ValueError('Luanti requires model IDs formed from letters, digits, _ and -; max 64')
    return s.lower()


def write_mod(dest: Path, assets: dict, *, source: str='Ragnagrok') -> dict:
    """Produce Luanti `mods/vgc_bridge` directory at the specified *new* path."""
    dest = Path(dest)
    if dest.exists():
        raise FileExistsError(f'Luanti mod target exists: {dest}')
    models = assets.get('models', [])
    if not models or not isinstance(models, list):
        raise ValueError('Luanti export requires Ragnagrok model pack')

    lua_models = []
    swatches: dict[tuple[int, bool], str] = {}
    totals = 0
    original = []
    used: set[str] = set()
    for model in models:
        if not isinstance(model, dict):
            raise ValueError('invalid Ragnagrok model')
        mid = _model_id(model.get('id'))
        if mid in used:
            raise ValueError(f'duplicate model ID {mid}')
        used.add(mid)
        size = model.get('size')
        cells = decode(model)
        palette = model['palette']
        emissive = set(model.get('emissive') or [])
        if any(not isinstance(x, int) for x in emissive):
            raise ValueError('invalid emissive palette index')
        sx, sy, sz = size
        coords: list[str] = []
        for idx, val in enumerate(cells):
            if val == 0:
                continue
            if val >= len(palette):
                raise ValueError(f'model {mid}: missing palette entry')
            rgb = palette[val]
            light = val in emissive
            key = (rgb, light)
            if key not in swatches:
                suffix = '_glow' if light else ''
                swatches[key] = f'c_{rgb:06x}{suffix}'
            node = swatches[key]
            # Ragnagrok flat indexing: x + z*xsize + y*xsize*zsize.
            x = idx % sx
            z = (idx // sx) % sz
            y = idx // (sx * sz)
            coords.append(f'{{{x},{y},{z},{_lua_s(node)}}}')
        if not coords:
            raise ValueError(f'model {mid} is empty')
        if len(coords) > MAX_VOXELS_PER_MODEL:
            raise ValueError(f'model {mid} has {len(coords)} voxels; cap {MAX_VOXELS_PER_MODEL}')
        totals += len(coords)
        original.append({'id': mid, 'size': size, 'voxels': len(coords), 'source_scale_m': model.get('scale')})
        lua_models.append('  ['+_lua_s(mid)+'] = { name='+_lua_s(str(model.get('name') or mid))+
                          ', size={'+','.join(map(str, size))+'}, voxels={\n    '+
                          ',\n    '.join(coords)+'\n  } },')
    if totals > MAX_EXPORT_VOXELS:
        raise ValueError(f'Luanti export contains {totals} nodes; max {MAX_EXPORT_VOXELS}')
    if len(swatches) > MAX_SWATCHES:
        raise ValueError(f'Luanti export has {len(swatches)} color/light variants; max {MAX_SWATCHES}')
    dest.mkdir(parents=True)
    (dest/'textures').mkdir()
    for (rgb, glow), name in swatches.items():
        (dest/'textures'/f'vgc_bridge_{name}.png').write_bytes(_png_rgb(rgb))

    colors_lua = ['-- Auto-generated from Ragnagrok palette; native Luanti nodes.', 'return {']
    for (rgb, glow), ident in swatches.items():
        colors_lua.append(f'  {{id={_lua_s(ident)}, hex={_lua_s(f"#{rgb:06X}")}, glow={"true" if glow else "false"}}},')
    colors_lua.append('}')
    (dest/'colors.lua').write_text('\n'.join(colors_lua)+'\n', encoding='utf-8')
    (dest/'models.lua').write_text('-- Generated Ragnagrok model geometry (x,y,z,palette node).\nreturn {\n' +
                                   '\n'.join(lua_models)+'\n}\n', encoding='utf-8')
    (dest/'mod.conf').write_text('name = vgc_bridge\ntitle = Voxel Game Creator Bridge\ndescription = Authored colored voxel props from Ragnagrok Studio\n',encoding='utf-8')
    (dest/'init.lua').write_text(LUANTI_MOD, encoding='utf-8')
    (dest/'LICENSE').write_text(MIT_ORIGINAL, encoding='utf-8')
    (dest/'README.md').write_text(
        '# VGC native Luanti mod\n\n'
        'Copy the `vgc_bridge` folder into a Luanti world/game `mods/` directory, enable it in Luanti, and launch that world. '
        'The Luanti application and a compatible game are required.\n\n'
        '`/vgc_list` lists the objects; `/vgc_build vgc_tree` or another listed ID places the colored structure '
        'in empty, loaded, unprotected space in front of the player. The `interact` privilege is required. '
        'Placement refuses to overwrite existing nodes or protected land.\n\n'
        '**Scale:** one Ragnagrok source voxel becomes one Luanti block (native Luanti units); '
        'do not expect source meter scale or animated rigs. GLB files are not imported. '
        'Single-player terrain, game servers and saved worlds are not synchronized with Lumenwild or Voxelize.\n\n'
        'This mod contains newly generated Lua code and original solid-color PNG textures. '
        'Luanti engine source is a separate LGPL-2.1-or-later project: https://github.com/luanti-org/luanti .\n',
        encoding='utf8')
    (dest/'source-models.json').write_text(json.dumps({'format':'vgc-luanti-bridge-v1',
      'source':source,'models':original,'swatches':len(swatches)},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    return {'models':len(lua_models),'colors':len(swatches),'voxels':totals,'mod_dir':str(dest)}


LUANTI_MOD = r'''-- Voxel Game Creator Luanti bridge. Generated MIT mod; no engine code copied.
local MOD = core.get_current_modname()
local root = core.get_modpath(MOD)
local colors = dofile(root .. "/colors.lua")
local models = dofile(root .. "/models.lua")

for _, c in ipairs(colors) do
    core.register_node(MOD .. ":" .. c.id, {
        description = "VGC " .. c.hex .. (c.glow and " (glowing)" or ""),
        tiles = {"vgc_bridge_" .. c.id .. ".png"},
        groups = {cracky = 3, oddly_breakable_by_hand = 3},
        is_ground_content = false,
        light_source = c.glow and 11 or 0,
        paramtype = "light",
        sunlight_propagates = false,
    })
end

core.register_chatcommand("vgc_list", {
    description = "List VGC source models available for Luanti",
    func = function(_player_name, _param)
        local ids = {}
        for id, _ in pairs(models) do ids[#ids + 1] = id end
        table.sort(ids)
        return true, "VGC models: " .. table.concat(ids, ", ")
    end,
})

core.register_chatcommand("vgc_build", {
    params = "<model_id>",
    description = "Build an authored voxel model in empty space in front of you",
    privs = {interact = true},
    func = function(name, param)
        local id = string.match(param, "^%s*([%w_-]+)%s*$")
        local model = id and models[id]
        if not model then
            return false, "Unknown model. Run /vgc_list first."
        end
        local player = core.get_player_by_name(name)
        if not player then return false, "Player not found." end
        local player_pos = player:get_pos()
        local dir = player:get_look_dir()
        local width, depth = model.size[1], model.size[3]
        -- Place in a cleared area, offset enough to avoid covering the player.
        local distance = math.max(width, depth) / 2 + 6
        local cx = math.floor(player_pos.x + dir.x * distance + 0.5)
        local cz = math.floor(player_pos.z + dir.z * distance + 0.5)
        local ox = cx - math.floor(width / 2)
        local oz = cz - math.floor(depth / 2)
        local oy = math.floor(player_pos.y + 0.5)
        -- Validate *all* occupied cells before changing any node.
        local batch = {}
        local count = 0
        for _, v in ipairs(model.voxels) do
            local pos = {x = ox + v[1], y = oy + v[2], z = oz + v[3]}
            local current = core.get_node_or_nil(pos)
            if current == nil then
                return false, "Area not loaded. Move closer to the build site and retry."
            end
            if current.name ~= "air" then
                return false, "Build site is obstructed; find open ground."
            end
            if core.is_protected(pos, name) then
                core.record_protection_violation(pos, name)
                return false, "The build site contains protected land."
            end
            local node = MOD .. ":" .. v[4]
            if not batch[node] then batch[node] = {} end
            batch[node][#batch[node] + 1] = pos
            count = count + 1
        end
        if count > 12000 then
            return false, "Model exceeds build safety limit."
        end
        -- Use native bulk placement when available; the fallback works on older servers.
        for node, places in pairs(batch) do
            if core.bulk_set_node then
                core.bulk_set_node(places, {name = node})
            else
                for _, pos in ipairs(places) do core.set_node(pos, {name = node}) end
            end
        end
        return true, "Built " .. id .. " (" .. count .. " original voxels)."
    end,
})
'''

MIT_ORIGINAL = '''MIT License

Copyright (c) 2026 Voxel Game Creator contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
'''

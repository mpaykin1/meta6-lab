-- Voxel Game Creator Luanti bridge. Generated MIT mod; no engine code copied.
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

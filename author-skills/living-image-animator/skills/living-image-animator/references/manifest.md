# Scene JSON manifest

All input polygon/box coordinates normalized 0..1; spritesheets and masks may be absolute or relative to scene.json.

```json
{
 "version": 1,
 "day_night": {"enabled": true, "day_background": "day_background.png", "sky_mask": "sky_mask.png"},
 "actors": [
  {"id":"roof-cat","role":"cat","z":20,"polygon":[[.1,.1],[.13,.1],[.13,.14],[.1,.14]], "motion":{"type":"breathe","amplitude":.012,"period":2.3,"phase":.3}},
  {"id":"resident-1","role":"human","z":25,"mask":"masks/resident-1.png", "sprite_frames":["poses/idle.png", "poses/gesture.png"],"motion":{"type":"sprite","fps":3,"period":2.0,"phase":.5}}
 ],
 "lights": [{"id":"upper-window", "box":[.4,.1,.44,.14], "phase":.6,"on_start":.63,"on_end":.95}],
 "particles": [{"type":"petals", "count":35,"region":[0.55,0.68,0.99,0.96], "speed":0.2}]
}
```

Each actor has original canvas anchor position, RGBA cutout, original source region, and optional transparent per-pose frames. Position is stable for idle, and walks have an explicitly scripted path within scene coordinates; people may not teleport across rooms. Never infer missing asset files.

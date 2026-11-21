# Living Image Animator — v0.2 rig/action schema

Each moving actor in the scene JSON is an exact source-derived RGBA cutout identified by `id` and `mask` or accurately hand-traced `polygon` (normalized coordinates). `rig.parts` consists of names, accurate source-pixel `mask` (PNG), or polygon, plus a normalized `pivot`; `layer` determines overlap (-1 legs, 0 torso, 1 arms, 2 head).

```json
{
 "version":2,"requires_all_actors_animated":true,
 "actors":[{
   "id":"resident_blue","role":"human","z":20,"mask":"masks/resident_blue.png",
   "rig":{"parts":[
     {"name":"head","mask":"masks/head.png","pivot":[0.45,0.51],"layer":2},
     {"name":"left_arm","mask":"masks/left_arm.png","pivot":[0.44,0.52],"layer":1},
     {"name":"right_arm","mask":"masks/right_arm.png","pivot":[0.46,0.52],"layer":1},
     {"name":"left_leg","mask":"masks/left_leg.png","pivot":[0.45,0.56],"layer":-1},
     {"name":"right_leg","mask":"masks/right_leg.png","pivot":[0.46,0.56],"layer":-1}
   ]},
   "animation":{"mode":"rig","period":4.3,"phase":0.2,"events":[
     {"action":"idle","start":0.0,"end":0.15},
     {"action":"walk","start":0.15,"end":0.60,"translation":[0.04,0]},
     {"action":"wave","start":0.60,"end":0.85},
     {"action":"idle","start":0.85,"end":1.0}
   ]}
 }]
}
```

Action types: `idle`, `walk`, `wave`, `talk`, `gesture`, `eat`, `drink`, `pour`, `read`, `page`, `turn_page`, `groom`, `tail`, `stretch`, `blink`. Character identity is always source-pixel locked; this rig only rotates/distorts original planar parts and cannot hallucinate correct unseen backs, hidden joints, or new poses. The `translation` path is a short source-local excursion returning to origin to preserve seamless loop; long traversals and 180° turns require additional directional sprites and authored occlusion/depth. Pivots are in normalized full-canvas coordinates. Proposed landmarks from auto-build must be refined for articulated realism.

`requires_all_actors_animated` guards explicitly listed unrigged actors, but it cannot discover an overlooked person; visual inventory remains mandatory. If actor is seated or only partially visible, use upper-body actions that actually exist in source or request/create matching custom pose sprites before depicting stand/walk; don't force nonexistent legs.

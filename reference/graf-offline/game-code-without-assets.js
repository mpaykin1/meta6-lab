
(async function(){
'use strict';

// =============================================================================
//  ОСТРОВ СУМЕРЕК — a voxel island built from the Voxel Mini-Pack (16×16)
//  Three.js r160 · HD-2D billboards · procedural world · cinematic post
// =============================================================================







const GRAF_WEATHER_MANIFEST={"presets":[{"id":"autumn_leaves","name":"Осенний листопад","category":"realistic","durationSeconds":[55,210],"transitionSeconds":4,"weight":7,"ambientLighting":{"skyTop":"#1e274d","skyHorizon":"#bb6f79","ambient":"#8497b8","sun":"#ffcc83","fog":"#606378","fogDensity":0.016,"exposure":1.0},"effects":{"sprite":"maple","spriteAtlas":"2d/atlases/maple_8f.png","2_5d":"2_5d/atlases/maple_8dir_8f.png","3d":"3d/glb/autumn_leaf.glb","particles":{"mobile":36,"desktop":126},"screenEffect":"","direction":"swirl","glow":false,"groundDecal":"leaf_litter"},"event":"weather:autumn_leaves","gameplayHook":"ambient"},{"id":"flower_wind_white","name":"Белый цветочный ветер","category":"mystical","durationSeconds":[30,130],"transitionSeconds":4,"weight":2,"ambientLighting":{"skyTop":"#121032","skyHorizon":"#613778","ambient":"#8672bb","sun":"#d6a3f2","fog":"#382a60","fogDensity":0.026,"exposure":0.91},"effects":{"sprite":"rose_white","spriteAtlas":"2d/atlases/rose_white_8f.png","2_5d":"2_5d/atlases/rose_white_8dir_8f.png","3d":"3d/glb/rose_petal.glb","particles":{"mobile":42,"desktop":150},"screenEffect":"","direction":"swirl","glow":false},"event":"weather:flower_wind_white","gameplayHook":"ambient"},{"id":"flower_wind_red","name":"Красный цветочный ветер","category":"mystical","durationSeconds":[30,130],"transitionSeconds":4,"weight":2,"ambientLighting":{"skyTop":"#121032","skyHorizon":"#613778","ambient":"#8672bb","sun":"#d6a3f2","fog":"#382a60","fogDensity":0.026,"exposure":0.91},"effects":{"sprite":"rose_red","spriteAtlas":"2d/atlases/rose_red_8f.png","2_5d":"2_5d/atlases/rose_red_8dir_8f.png","3d":"3d/glb/rose_petal.glb","particles":{"mobile":42,"desktop":150},"screenEffect":"","direction":"swirl","glow":false},"event":"weather:flower_wind_red","gameplayHook":"ambient"},{"id":"flower_wind_black","name":"Чёрный цветочный ветер","category":"mystical","durationSeconds":[30,130],"transitionSeconds":4,"weight":2,"ambientLighting":{"skyTop":"#121032","skyHorizon":"#613778","ambient":"#8672bb","sun":"#d6a3f2","fog":"#382a60","fogDensity":0.026,"exposure":0.91},"effects":{"sprite":"rose_black","spriteAtlas":"2d/atlases/rose_black_8f.png","2_5d":"2_5d/atlases/rose_black_8dir_8f.png","3d":"3d/glb/rose_petal.glb","particles":{"mobile":42,"desktop":150},"screenEffect":"","direction":"swirl","glow":false},"event":"weather:flower_wind_black","gameplayHook":"ambient"},{"id":"flower_wind_pink","name":"Розовый цветочный ветер","category":"mystical","durationSeconds":[30,130],"transitionSeconds":4,"weight":2,"ambientLighting":{"skyTop":"#121032","skyHorizon":"#613778","ambient":"#8672bb","sun":"#d6a3f2","fog":"#382a60","fogDensity":0.026,"exposure":0.91},"effects":{"sprite":"rose_pink","spriteAtlas":"2d/atlases/rose_pink_8f.png","2_5d":"2_5d/atlases/rose_pink_8dir_8f.png","3d":"3d/glb/rose_petal.glb","particles":{"mobile":42,"desktop":150},"screenEffect":"","direction":"swirl","glow":false},"event":"weather:flower_wind_pink","gameplayHook":"ambient"},{"id":"flower_wind_rainbow","name":"Разноцветный цветочный ветер","category":"mystical","durationSeconds":[30,130],"transitionSeconds":4,"weight":2,"ambientLighting":{"skyTop":"#121032","skyHorizon":"#613778","ambient":"#8672bb","sun":"#d6a3f2","fog":"#382a60","fogDensity":0.026,"exposure":0.91},"effects":{"sprite":"rose_rainbow","spriteAtlas":"2d/atlases/rose_rainbow_8f.png","2_5d":"2_5d/atlases/rose_rainbow_8dir_8f.png","3d":"3d/glb/rose_petal.glb","particles":{"mobile":42,"desktop":150},"screenEffect":"","direction":"swirl","glow":false},"event":"weather:flower_wind_rainbow","gameplayHook":"wet"},{"id":"snowfall","name":"Снегопад","category":"realistic","durationSeconds":[55,210],"transitionSeconds":4,"weight":7,"ambientLighting":{"skyTop":"#1d3454","skyHorizon":"#c8def4","ambient":"#8497b8","sun":"#bcd4e8","fog":"#606378","fogDensity":0.016,"exposure":1.0},"effects":{"sprite":"snow","spriteAtlas":"2d/atlases/snow_8f.png","2_5d":"2_5d/atlases/snow_8dir_8f.png","3d":"3d/glb/ice_crystal.glb","particles":{"mobile":36,"desktop":126},"screenEffect":"","direction":"fall","glow":false,"groundDecal":"snow_cover"},"event":"weather:snowfall","gameplayHook":"temperature"},{"id":"sea_fog","name":"Морской туман","category":"realistic","durationSeconds":[55,210],"transitionSeconds":4,"weight":7,"ambientLighting":{"skyTop":"#1e274d","skyHorizon":"#bb6f79","ambient":"#8497b8","sun":"#ffcc83","fog":"#606378","fogDensity":0.016,"exposure":1.0},"effects":{"sprite":"bubble","spriteAtlas":"2d/atlases/bubble_8f.png","2_5d":null,"3d":null,"particles":{"mobile":24,"desktop":84},"screenEffect":"fog_banks","direction":"fall","glow":false},"event":"weather:sea_fog","gameplayHook":"visibility"},{"id":"sunbeams","name":"Солнечные лучи","category":"realistic","durationSeconds":[55,210],"transitionSeconds":4,"weight":7,"ambientLighting":{"skyTop":"#1e274d","skyHorizon":"#bb6f79","ambient":"#8497b8","sun":"#ffcc83","fog":"#606378","fogDensity":0.016,"exposure":1.0},"effects":{"sprite":"pollen","spriteAtlas":"2d/atlases/pollen_8f.png","2_5d":null,"3d":null,"particles":{"mobile":24,"desktop":84},"screenEffect":"godrays","direction":"fall","glow":false},"event":"weather:sunbeams","gameplayHook":"ambient"},{"id":"hail","name":"Град","category":"realistic","durationSeconds":[55,210],"transitionSeconds":4,"weight":7,"ambientLighting":{"skyTop":"#1e274d","skyHorizon":"#bb6f79","ambient":"#8497b8","sun":"#ffcc83","fog":"#606378","fogDensity":0.016,"exposure":1.0},"effects":{"sprite":"hail","spriteAtlas":"2d/atlases/hail_8f.png","2_5d":null,"3d":null,"particles":{"mobile":24,"desktop":84},"screenEffect":"","direction":"fall","glow":false},"event":"weather:hail","gameplayHook":"ambient"},{"id":"strong_wind","name":"Сильный ветер","category":"realistic","durationSeconds":[55,210],"transitionSeconds":4,"weight":7,"ambientLighting":{"skyTop":"#1e274d","skyHorizon":"#bb6f79","ambient":"#8497b8","sun":"#ffcc83","fog":"#606378","fogDensity":0.016,"exposure":1.0},"effects":{"sprite":"dust","spriteAtlas":"2d/atlases/dust_8f.png","2_5d":null,"3d":null,"particles":{"mobile":24,"desktop":84},"screenEffect":"","direction":"fall","glow":false},"event":"weather:strong_wind","gameplayHook":"ambient"},{"id":"overcast","name":"Пасмурное небо","category":"realistic","durationSeconds":[55,210],"transitionSeconds":4,"weight":7,"ambientLighting":{"skyTop":"#1e274d","skyHorizon":"#bb6f79","ambient":"#8497b8","sun":"#ffcc83","fog":"#606378","fogDensity":0.016,"exposure":1.0},"effects":{"sprite":"rain","spriteAtlas":"2d/atlases/rain_8f.png","2_5d":null,"3d":null,"particles":{"mobile":48,"desktop":168},"screenEffect":"","direction":"fall","glow":false},"event":"weather:overcast","gameplayHook":"ambient"},{"id":"after_rain","name":"После ливня","category":"realistic","durationSeconds":[55,210],"transitionSeconds":4,"weight":7,"ambientLighting":{"skyTop":"#254361","skyHorizon":"#f1ad7b","ambient":"#8497b8","sun":"#fff1b2","fog":"#606378","fogDensity":0.016,"exposure":1.0},"effects":{"sprite":"rain","spriteAtlas":"2d/atlases/rain_8f.png","2_5d":null,"3d":null,"particles":{"mobile":48,"desktop":168},"screenEffect":"","direction":"fall","glow":false,"groundDecal":"wet_stone"},"event":"weather:after_rain","gameplayHook":"wet"},{"id":"sea_storm","name":"Морская буря","category":"realistic","durationSeconds":[55,210],"transitionSeconds":4,"weight":7,"ambientLighting":{"skyTop":"#1e274d","skyHorizon":"#bb6f79","ambient":"#8497b8","sun":"#ffcc83","fog":"#606378","fogDensity":0.016,"exposure":1.0},"effects":{"sprite":"bubble","spriteAtlas":"2d/atlases/bubble_8f.png","2_5d":null,"3d":null,"particles":{"mobile":24,"desktop":84},"screenEffect":"","direction":"fall","glow":false},"event":"weather:sea_storm","gameplayHook":"visibility"},{"id":"rainbow","name":"Радуга","category":"realistic","durationSeconds":[55,210],"transitionSeconds":4,"weight":7,"ambientLighting":{"skyTop":"#1e274d","skyHorizon":"#bb6f79","ambient":"#8497b8","sun":"#ffcc83","fog":"#606378","fogDensity":0.016,"exposure":1.0},"effects":{"sprite":"silver","spriteAtlas":"2d/atlases/silver_8f.png","2_5d":null,"3d":null,"particles":{"mobile":24,"desktop":84},"screenEffect":"rainbow_arc","direction":"fall","glow":false,"groundDecal":"puddle"},"event":"weather:rainbow","gameplayHook":"wet"},{"id":"frost_morning","name":"Морозное утро","category":"realistic","durationSeconds":[55,210],"transitionSeconds":4,"weight":7,"ambientLighting":{"skyTop":"#29485a","skyHorizon":"#abc1d4","ambient":"#8497b8","sun":"#d8f9ff","fog":"#606378","fogDensity":0.016,"exposure":1.0},"effects":{"sprite":"snow","spriteAtlas":"2d/atlases/snow_8f.png","2_5d":"2_5d/atlases/snow_8dir_8f.png","3d":null,"particles":{"mobile":24,"desktop":84},"screenEffect":"","direction":"fall","glow":false,"groundDecal":"ice_crust"},"event":"weather:frost_morning","gameplayHook":"ambient"},{"id":"cloud_shadows","name":"Тени облаков","category":"realistic","durationSeconds":[55,210],"transitionSeconds":4,"weight":7,"ambientLighting":{"skyTop":"#1e274d","skyHorizon":"#bb6f79","ambient":"#8497b8","sun":"#ffcc83","fog":"#606378","fogDensity":0.016,"exposure":1.0},"effects":{"sprite":"dust","spriteAtlas":"2d/atlases/dust_8f.png","2_5d":null,"3d":null,"particles":{"mobile":24,"desktop":84},"screenEffect":"cloud_shadow","direction":"fall","glow":false},"event":"weather:cloud_shadows","gameplayHook":"ambient"},{"id":"aurora","name":"Северное сияние","category":"rare","durationSeconds":[30,130],"transitionSeconds":4,"weight":3,"ambientLighting":{"skyTop":"#08152e","skyHorizon":"#208d87","ambient":"#7299aa","sun":"#6af0cd","fog":"#443d64","fogDensity":0.022,"exposure":0.94},"effects":{"sprite":"green","spriteAtlas":"2d/atlases/green_8f.png","2_5d":null,"3d":null,"particles":{"mobile":24,"desktop":84},"screenEffect":"aurora_curtain","direction":"fall","glow":false},"event":"weather:aurora","gameplayHook":"ambient"},{"id":"eclipse","name":"Солнечное затмение","category":"rare","durationSeconds":[30,130],"transitionSeconds":4,"weight":3,"ambientLighting":{"skyTop":"#080a18","skyHorizon":"#8d4054","ambient":"#7299aa","sun":"#eed7a4","fog":"#443d64","fogDensity":0.022,"exposure":0.94},"effects":{"sprite":"shadow","spriteAtlas":"2d/atlases/shadow_8f.png","2_5d":null,"3d":null,"particles":{"mobile":24,"desktop":84},"screenEffect":"eclipse_disc","direction":"fall","glow":false},"event":"weather:eclipse","gameplayHook":"ambient"},{"id":"thunderstorm","name":"Гроза","category":"rare","durationSeconds":[30,130],"transitionSeconds":4,"weight":3,"ambientLighting":{"skyTop":"#121d43","skyHorizon":"#794a81","ambient":"#7299aa","sun":"#df85bd","fog":"#443d64","fogDensity":0.022,"exposure":0.94},"effects":{"sprite":"lightning","spriteAtlas":"2d/atlases/lightning_8f.png","2_5d":null,"3d":"3d/glb/storm_crystal.glb","particles":{"mobile":48,"desktop":168},"screenEffect":"","direction":"fall","glow":true,"lightning":{"cadenceSeconds":[3,8],"bolts":3,"stormFlash":true,"integrateExistingLightningGenerator":true}},"event":"weather:thunderstorm","gameplayHook":"visibility"},{"id":"blood_moon","name":"Кровавая луна","category":"rare","durationSeconds":[30,130],"transitionSeconds":4,"weight":3,"ambientLighting":{"skyTop":"#200d2b","skyHorizon":"#8f263e","ambient":"#7299aa","sun":"#fd6187","fog":"#443d64","fogDensity":0.022,"exposure":0.94},"effects":{"sprite":"ember","spriteAtlas":"2d/atlases/ember_8f.png","2_5d":null,"3d":"3d/glb/blood_moon.glb","particles":{"mobile":24,"desktop":84},"screenEffect":"","direction":"fall","glow":true},"event":"weather:blood_moon","gameplayHook":"ambient"},{"id":"shooting_stars","name":"Падающие звёзды","category":"rare","durationSeconds":[30,130],"transitionSeconds":4,"weight":3,"ambientLighting":{"skyTop":"#121d43","skyHorizon":"#794a81","ambient":"#7299aa","sun":"#df85bd","fog":"#443d64","fogDensity":0.022,"exposure":0.94},"effects":{"sprite":"star","spriteAtlas":"2d/atlases/star_8f.png","2_5d":null,"3d":"3d/glb/meteor.glb","particles":{"mobile":24,"desktop":84},"screenEffect":"","direction":"fall","glow":true},"event":"weather:shooting_stars","gameplayHook":"ambient"},{"id":"sandstorm","name":"Пыльная буря","category":"rare","durationSeconds":[30,130],"transitionSeconds":4,"weight":3,"ambientLighting":{"skyTop":"#121d43","skyHorizon":"#794a81","ambient":"#7299aa","sun":"#df85bd","fog":"#443d64","fogDensity":0.022,"exposure":0.94},"effects":{"sprite":"dust","spriteAtlas":"2d/atlases/dust_8f.png","2_5d":null,"3d":null,"particles":{"mobile":24,"desktop":84},"screenEffect":"","direction":"fall","glow":false},"event":"weather:sandstorm","gameplayHook":"visibility"},{"id":"volcanic_ash","name":"Вулканический пепел","category":"rare","durationSeconds":[30,130],"transitionSeconds":4,"weight":3,"ambientLighting":{"skyTop":"#121d43","skyHorizon":"#794a81","ambient":"#7299aa","sun":"#df85bd","fog":"#443d64","fogDensity":0.022,"exposure":0.94},"effects":{"sprite":"ash","spriteAtlas":"2d/atlases/ash_8f.png","2_5d":null,"3d":null,"particles":{"mobile":24,"desktop":84},"screenEffect":"","direction":"fall","glow":false,"groundDecal":"ash_layer"},"event":"weather:volcanic_ash","gameplayHook":"ambient"},{"id":"ball_lightning","name":"Шаровая молния","category":"rare","durationSeconds":[30,130],"transitionSeconds":4,"weight":3,"ambientLighting":{"skyTop":"#121d43","skyHorizon":"#794a81","ambient":"#7299aa","sun":"#df85bd","fog":"#443d64","fogDensity":0.022,"exposure":0.94},"effects":{"sprite":"lightning","spriteAtlas":"2d/atlases/lightning_8f.png","2_5d":null,"3d":"3d/glb/storm_crystal.glb","particles":{"mobile":48,"desktop":168},"screenEffect":"","direction":"fall","glow":true,"lightning":{"cadenceSeconds":[3,8],"bolts":1,"stormFlash":true,"integrateExistingLightningGenerator":true}},"event":"weather:ball_lightning","gameplayHook":"ambient"},{"id":"dry_storm","name":"Сухая гроза","category":"rare","durationSeconds":[30,130],"transitionSeconds":4,"weight":3,"ambientLighting":{"skyTop":"#121d43","skyHorizon":"#794a81","ambient":"#7299aa","sun":"#df85bd","fog":"#443d64","fogDensity":0.022,"exposure":0.94},"effects":{"sprite":"lightning","spriteAtlas":"2d/atlases/lightning_8f.png","2_5d":null,"3d":null,"particles":{"mobile":48,"desktop":168},"screenEffect":"","direction":"fall","glow":true,"lightning":{"cadenceSeconds":[3,8],"bolts":3,"stormFlash":true,"integrateExistingLightningGenerator":true}},"event":"weather:dry_storm","gameplayHook":"visibility"},{"id":"light_pillars","name":"Световые столбы","category":"rare","durationSeconds":[30,130],"transitionSeconds":4,"weight":3,"ambientLighting":{"skyTop":"#121d43","skyHorizon":"#794a81","ambient":"#7299aa","sun":"#df85bd","fog":"#443d64","fogDensity":0.022,"exposure":0.94},"effects":{"sprite":"silver","spriteAtlas":"2d/atlases/silver_8f.png","2_5d":null,"3d":null,"particles":{"mobile":24,"desktop":84},"screenEffect":"light_pillars","direction":"fall","glow":false},"event":"weather:light_pillars","gameplayHook":"ambient"},{"id":"glowing_rain","name":"Светящийся дождь","category":"mystical","durationSeconds":[30,130],"transitionSeconds":4,"weight":2,"ambientLighting":{"skyTop":"#121032","skyHorizon":"#613778","ambient":"#8672bb","sun":"#d6a3f2","fog":"#382a60","fogDensity":0.026,"exposure":0.91},"effects":{"sprite":"blue_magic","spriteAtlas":"2d/atlases/blue_magic_8f.png","2_5d":null,"3d":null,"particles":{"mobile":24,"desktop":84},"screenEffect":"","direction":"fall","glow":true},"event":"weather:glowing_rain","gameplayHook":"wet"},{"id":"reverse_rain","name":"Обратный дождь","category":"mystical","durationSeconds":[30,130],"transitionSeconds":4,"weight":2,"ambientLighting":{"skyTop":"#121032","skyHorizon":"#613778","ambient":"#8672bb","sun":"#d6a3f2","fog":"#382a60","fogDensity":0.026,"exposure":0.91},"effects":{"sprite":"droplet","spriteAtlas":"2d/atlases/droplet_8f.png","2_5d":null,"3d":null,"particles":{"mobile":48,"desktop":168},"screenEffect":"","direction":"rise","glow":false},"event":"weather:reverse_rain","gameplayHook":"wet"},{"id":"living_fog","name":"Живой туман","category":"mystical","durationSeconds":[30,130],"transitionSeconds":4,"weight":2,"ambientLighting":{"skyTop":"#121032","skyHorizon":"#613778","ambient":"#8672bb","sun":"#d6a3f2","fog":"#382a60","fogDensity":0.026,"exposure":0.91},"effects":{"sprite":"shadow","spriteAtlas":"2d/atlases/shadow_8f.png","2_5d":null,"3d":null,"particles":{"mobile":24,"desktop":84},"screenEffect":"fog_shapes","direction":"fall","glow":false},"event":"weather:living_fog","gameplayHook":"visibility"},{"id":"crystal_snow","name":"Кристаллический снег","category":"mystical","durationSeconds":[30,130],"transitionSeconds":4,"weight":2,"ambientLighting":{"skyTop":"#121032","skyHorizon":"#613778","ambient":"#8672bb","sun":"#d6a3f2","fog":"#382a60","fogDensity":0.026,"exposure":0.91},"effects":{"sprite":"crystal","spriteAtlas":"2d/atlases/crystal_8f.png","2_5d":"2_5d/atlases/crystal_8dir_8f.png","3d":"3d/glb/ice_crystal.glb","particles":{"mobile":24,"desktop":84},"screenEffect":"","direction":"fall","glow":true,"groundDecal":"ice_crust"},"event":"weather:crystal_snow","gameplayHook":"temperature"},{"id":"black_snow","name":"Чёрный снег","category":"mystical","durationSeconds":[30,130],"transitionSeconds":4,"weight":2,"ambientLighting":{"skyTop":"#121032","skyHorizon":"#613778","ambient":"#8672bb","sun":"#d6a3f2","fog":"#382a60","fogDensity":0.026,"exposure":0.91},"effects":{"sprite":"black_snow","spriteAtlas":"2d/atlases/black_snow_8f.png","2_5d":null,"3d":null,"particles":{"mobile":24,"desktop":84},"screenEffect":"","direction":"fall","glow":false,"groundDecal":"ash_layer"},"event":"weather:black_snow","gameplayHook":"temperature"},{"id":"moon_shadows","name":"Лунные тени","category":"mystical","durationSeconds":[30,130],"transitionSeconds":4,"weight":2,"ambientLighting":{"skyTop":"#121032","skyHorizon":"#613778","ambient":"#8672bb","sun":"#d6a3f2","fog":"#382a60","fogDensity":0.026,"exposure":0.91},"effects":{"sprite":"shadow","spriteAtlas":"2d/atlases/shadow_8f.png","2_5d":null,"3d":null,"particles":{"mobile":24,"desktop":84},"screenEffect":"","direction":"fall","glow":false},"event":"weather:moon_shadows","gameplayHook":"ambient"},{"id":"ash_sunset","name":"Пепельный закат","category":"mystical","durationSeconds":[30,130],"transitionSeconds":4,"weight":2,"ambientLighting":{"skyTop":"#2a1222","skyHorizon":"#b54636","ambient":"#8672bb","sun":"#fa865d","fog":"#382a60","fogDensity":0.026,"exposure":0.91},"effects":{"sprite":"ash","spriteAtlas":"2d/atlases/ash_8f.png","2_5d":null,"3d":null,"particles":{"mobile":24,"desktop":84},"screenEffect":"","direction":"fall","glow":false},"event":"weather:ash_sunset","gameplayHook":"ambient"},{"id":"silent_storm","name":"Беззвучная гроза","category":"mystical","durationSeconds":[30,130],"transitionSeconds":4,"weight":2,"ambientLighting":{"skyTop":"#121032","skyHorizon":"#613778","ambient":"#8672bb","sun":"#d6a3f2","fog":"#382a60","fogDensity":0.026,"exposure":0.91},"effects":{"sprite":"lightning","spriteAtlas":"2d/atlases/lightning_8f.png","2_5d":null,"3d":null,"particles":{"mobile":48,"desktop":168},"screenEffect":"","direction":"fall","glow":true,"lightning":{"cadenceSeconds":[3,8],"bolts":3,"stormFlash":false,"integrateExistingLightningGenerator":true}},"event":"weather:silent_storm","gameplayHook":"visibility"},{"id":"luminous_waves","name":"Светящиеся волны","category":"mystical","durationSeconds":[30,130],"transitionSeconds":4,"weight":2,"ambientLighting":{"skyTop":"#121032","skyHorizon":"#613778","ambient":"#8672bb","sun":"#d6a3f2","fog":"#382a60","fogDensity":0.026,"exposure":0.91},"effects":{"sprite":"bubble","spriteAtlas":"2d/atlases/bubble_8f.png","2_5d":null,"3d":null,"particles":{"mobile":24,"desktop":84},"screenEffect":"","direction":"fall","glow":false},"event":"weather:luminous_waves","gameplayHook":"ambient"},{"id":"firefly_storm","name":"Светлячковый шторм","category":"mystical","durationSeconds":[30,130],"transitionSeconds":4,"weight":2,"ambientLighting":{"skyTop":"#121032","skyHorizon":"#613778","ambient":"#8672bb","sun":"#d6a3f2","fog":"#382a60","fogDensity":0.026,"exposure":0.91},"effects":{"sprite":"firefly","spriteAtlas":"2d/atlases/firefly_8f.png","2_5d":"2_5d/atlases/firefly_8dir_8f.png","3d":null,"particles":{"mobile":36,"desktop":126},"screenEffect":"","direction":"swirl","glow":true},"event":"weather:firefly_storm","gameplayHook":"visibility"},{"id":"silver_rain","name":"Серебряный дождь","category":"mystical","durationSeconds":[30,130],"transitionSeconds":4,"weight":2,"ambientLighting":{"skyTop":"#121032","skyHorizon":"#613778","ambient":"#8672bb","sun":"#d6a3f2","fog":"#382a60","fogDensity":0.026,"exposure":0.91},"effects":{"sprite":"silver","spriteAtlas":"2d/atlases/silver_8f.png","2_5d":null,"3d":null,"particles":{"mobile":24,"desktop":84},"screenEffect":"","direction":"fall","glow":false},"event":"weather:silver_rain","gameplayHook":"wet"},{"id":"memory_light","name":"Свет памяти","category":"mystical","durationSeconds":[30,130],"transitionSeconds":4,"weight":2,"ambientLighting":{"skyTop":"#121032","skyHorizon":"#613778","ambient":"#8672bb","sun":"#d6a3f2","fog":"#382a60","fogDensity":0.026,"exposure":0.91},"effects":{"sprite":"rune","spriteAtlas":"2d/atlases/rune_8f.png","2_5d":null,"3d":null,"particles":{"mobile":24,"desktop":84},"screenEffect":"","direction":"fall","glow":false},"event":"weather:memory_light","gameplayHook":"ambient"},{"id":"sky_cracks","name":"Трещины в небе","category":"fantastic","durationSeconds":[18,80],"transitionSeconds":4,"weight":1,"ambientLighting":{"skyTop":"#1c0a35","skyHorizon":"#ad45d8","ambient":"#8b6db0","sun":"#e5a5ff","fog":"#372345","fogDensity":0.029,"exposure":0.96},"effects":{"sprite":"void","spriteAtlas":"2d/atlases/void_8f.png","2_5d":null,"3d":"3d/glb/rift_shard.glb","particles":{"mobile":24,"desktop":84},"screenEffect":"sky_cracks","direction":"fall","glow":true},"event":"weather:sky_cracks","gameplayHook":"world-anomaly"},{"id":"three_suns","name":"Три солнца","category":"fantastic","durationSeconds":[18,80],"transitionSeconds":4,"weight":1,"ambientLighting":{"skyTop":"#4c235e","skyHorizon":"#eda46a","ambient":"#8b6db0","sun":"#fff2bc","fog":"#372345","fogDensity":0.029,"exposure":0.96},"effects":{"sprite":"star","spriteAtlas":"2d/atlases/star_8f.png","2_5d":null,"3d":"3d/glb/blood_moon.glb","particles":{"mobile":24,"desktop":84},"screenEffect":"multiple_suns","direction":"fall","glow":true},"event":"weather:three_suns","gameplayHook":"world-anomaly"},{"id":"ink_storm","name":"Чернильная буря","category":"fantastic","durationSeconds":[18,80],"transitionSeconds":4,"weight":1,"ambientLighting":{"skyTop":"#0b0c19","skyHorizon":"#341b37","ambient":"#8b6db0","sun":"#9677a8","fog":"#372345","fogDensity":0.029,"exposure":0.96},"effects":{"sprite":"ink","spriteAtlas":"2d/atlases/ink_8f.png","2_5d":null,"3d":null,"particles":{"mobile":24,"desktop":84},"screenEffect":"","direction":"fall","glow":false,"groundDecal":"ash_layer"},"event":"weather:ink_storm","gameplayHook":"visibility"},{"id":"sky_jellyfish","name":"Небесные медузы","category":"fantastic","durationSeconds":[18,80],"transitionSeconds":4,"weight":1,"ambientLighting":{"skyTop":"#110d2b","skyHorizon":"#743a76","ambient":"#8b6db0","sun":"#e77aca","fog":"#372345","fogDensity":0.029,"exposure":0.96},"effects":{"sprite":"blue_magic","spriteAtlas":"2d/atlases/blue_magic_8f.png","2_5d":null,"3d":"3d/glb/sky_jellyfish.glb","particles":{"mobile":24,"desktop":84},"screenEffect":"","direction":"fall","glow":true},"event":"weather:sky_jellyfish","gameplayHook":"world-anomaly"},{"id":"star_rain","name":"Звёздный ливень","category":"fantastic","durationSeconds":[18,80],"transitionSeconds":4,"weight":1,"ambientLighting":{"skyTop":"#110d2b","skyHorizon":"#743a76","ambient":"#8b6db0","sun":"#e77aca","fog":"#372345","fogDensity":0.029,"exposure":0.96},"effects":{"sprite":"star","spriteAtlas":"2d/atlases/star_8f.png","2_5d":null,"3d":"3d/glb/meteor.glb","particles":{"mobile":24,"desktop":84},"screenEffect":"","direction":"fall","glow":true},"event":"weather:star_rain","gameplayHook":"wet"},{"id":"reality_rift","name":"Разлом реальности","category":"fantastic","durationSeconds":[18,80],"transitionSeconds":4,"weight":1,"ambientLighting":{"skyTop":"#110d2b","skyHorizon":"#743a76","ambient":"#8b6db0","sun":"#e77aca","fog":"#372345","fogDensity":0.029,"exposure":0.96},"effects":{"sprite":"void","spriteAtlas":"2d/atlases/void_8f.png","2_5d":null,"3d":"3d/glb/rift_shard.glb","particles":{"mobile":24,"desktop":84},"screenEffect":"sky_rift","direction":"fall","glow":true},"event":"weather:reality_rift","gameplayHook":"world-anomaly"},{"id":"time_rain","name":"Дождь из времени","category":"fantastic","durationSeconds":[18,80],"transitionSeconds":4,"weight":1,"ambientLighting":{"skyTop":"#110d2b","skyHorizon":"#743a76","ambient":"#8b6db0","sun":"#e77aca","fog":"#372345","fogDensity":0.029,"exposure":0.96},"effects":{"sprite":"rune","spriteAtlas":"2d/atlases/rune_8f.png","2_5d":null,"3d":null,"particles":{"mobile":24,"desktop":84},"screenEffect":"","direction":"fall","glow":false},"event":"weather:time_rain","gameplayHook":"wet"},{"id":"gravity_blizzard","name":"Гравитационная метель","category":"fantastic","durationSeconds":[18,80],"transitionSeconds":4,"weight":1,"ambientLighting":{"skyTop":"#110d2b","skyHorizon":"#743a76","ambient":"#8b6db0","sun":"#e77aca","fog":"#372345","fogDensity":0.029,"exposure":0.96},"effects":{"sprite":"snow","spriteAtlas":"2d/atlases/snow_8f.png","2_5d":"2_5d/atlases/snow_8dir_8f.png","3d":null,"particles":{"mobile":24,"desktop":84},"screenEffect":"","direction":"swirl","glow":false},"event":"weather:gravity_blizzard","gameplayHook":"world-anomaly"},{"id":"lightning_trees","name":"Молнии-деревья","category":"fantastic","durationSeconds":[18,80],"transitionSeconds":4,"weight":1,"ambientLighting":{"skyTop":"#110d2b","skyHorizon":"#743a76","ambient":"#8b6db0","sun":"#e77aca","fog":"#372345","fogDensity":0.029,"exposure":0.96},"effects":{"sprite":"lightning","spriteAtlas":"2d/atlases/lightning_8f.png","2_5d":null,"3d":"3d/glb/lightning_tree.glb","particles":{"mobile":48,"desktop":168},"screenEffect":"lightning_tree","direction":"fall","glow":true,"lightning":{"cadenceSeconds":[3,8],"bolts":3,"stormFlash":true,"integrateExistingLightningGenerator":true}},"event":"weather:lightning_trees","gameplayHook":"world-anomaly"},{"id":"living_constellations","name":"Живые созвездия","category":"fantastic","durationSeconds":[18,80],"transitionSeconds":4,"weight":1,"ambientLighting":{"skyTop":"#110d2b","skyHorizon":"#743a76","ambient":"#8b6db0","sun":"#e77aca","fog":"#372345","fogDensity":0.029,"exposure":0.96},"effects":{"sprite":"star","spriteAtlas":"2d/atlases/star_8f.png","2_5d":null,"3d":null,"particles":{"mobile":24,"desktop":84},"screenEffect":"","direction":"fall","glow":true},"event":"weather:living_constellations","gameplayHook":"world-anomaly"},{"id":"sky_ocean","name":"Океан в небе","category":"fantastic","durationSeconds":[18,80],"transitionSeconds":4,"weight":1,"ambientLighting":{"skyTop":"#110d2b","skyHorizon":"#743a76","ambient":"#8b6db0","sun":"#e77aca","fog":"#372345","fogDensity":0.029,"exposure":0.96},"effects":{"sprite":"bubble","spriteAtlas":"2d/atlases/bubble_8f.png","2_5d":null,"3d":"3d/glb/sky_jellyfish.glb","particles":{"mobile":24,"desktop":84},"screenEffect":"overhead_ocean","direction":"fall","glow":false},"event":"weather:sky_ocean","gameplayHook":"world-anomaly"},{"id":"source_less_night","name":"Ночь без солнца и луны","category":"fantastic","durationSeconds":[18,80],"transitionSeconds":4,"weight":1,"ambientLighting":{"skyTop":"#060514","skyHorizon":"#19152f","ambient":"#8b6db0","sun":"#9d8ac8","fog":"#372345","fogDensity":0.029,"exposure":0.96},"effects":{"sprite":"firefly","spriteAtlas":"2d/atlases/firefly_8f.png","2_5d":"2_5d/atlases/firefly_8dir_8f.png","3d":null,"particles":{"mobile":24,"desktop":84},"screenEffect":"glow_only","direction":"fall","glow":true},"event":"weather:source_less_night","gameplayHook":"world-anomaly"},{"id":"color_storm","name":"Цветовая буря","category":"fantastic","durationSeconds":[18,80],"transitionSeconds":4,"weight":1,"ambientLighting":{"skyTop":"#110d2b","skyHorizon":"#743a76","ambient":"#8b6db0","sun":"#e77aca","fog":"#372345","fogDensity":0.029,"exposure":0.96},"effects":{"sprite":"rose_rainbow","spriteAtlas":"2d/atlases/rose_rainbow_8f.png","2_5d":"2_5d/atlases/rose_rainbow_8dir_8f.png","3d":null,"particles":{"mobile":24,"desktop":84},"screenEffect":"chromatic_wave","direction":"swirl","glow":false},"event":"weather:color_storm","gameplayHook":"visibility"},{"id":"broken_time","name":"Распад времени","category":"fantastic","durationSeconds":[18,80],"transitionSeconds":4,"weight":1,"ambientLighting":{"skyTop":"#110d2b","skyHorizon":"#743a76","ambient":"#8b6db0","sun":"#e77aca","fog":"#372345","fogDensity":0.029,"exposure":0.96},"effects":{"sprite":"void","spriteAtlas":"2d/atlases/void_8f.png","2_5d":null,"3d":null,"particles":{"mobile":24,"desktop":84},"screenEffect":"time_bands","direction":"fall","glow":true},"event":"weather:broken_time","gameplayHook":"world-anomaly"},{"id":"shadow_rain","name":"Дождь из теней","category":"fantastic","durationSeconds":[18,80],"transitionSeconds":4,"weight":1,"ambientLighting":{"skyTop":"#110d2b","skyHorizon":"#743a76","ambient":"#8b6db0","sun":"#e77aca","fog":"#372345","fogDensity":0.029,"exposure":0.96},"effects":{"sprite":"shadow","spriteAtlas":"2d/atlases/shadow_8f.png","2_5d":null,"3d":null,"particles":{"mobile":24,"desktop":84},"screenEffect":"","direction":"fall","glow":false},"event":"weather:shadow_rain","gameplayHook":"wet"},{"id":"inverted_world","name":"Вывернутый мир","category":"fantastic","durationSeconds":[18,80],"transitionSeconds":4,"weight":1,"ambientLighting":{"skyTop":"#110d2b","skyHorizon":"#743a76","ambient":"#8b6db0","sun":"#e77aca","fog":"#372345","fogDensity":0.029,"exposure":0.96},"effects":{"sprite":"blue_magic","spriteAtlas":"2d/atlases/blue_magic_8f.png","2_5d":null,"3d":"3d/glb/rift_shard.glb","particles":{"mobile":24,"desktop":84},"screenEffect":"","direction":"fall","glow":true},"event":"weather:inverted_world","gameplayHook":"world-anomaly"}],"version":"1.0.0"};
const GRAF_IMG={"2d/atlases/maple_8f.png":"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","2_5d/atlases/maple_8dir_8f.png":"<B64>","2d/atlases/rose_white_8f.png":"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","2_5d/atlases/rose_white_8dir_8f.png":"<B64>","2d/atlases/rose_red_8f.png":"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","2_5d/atlases/rose_red_8dir_8f.png":"<B64>","2d/atlases/rose_black_8f.png":"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","2_5d/atlases/rose_black_8dir_8f.png":"<B64>","2d/atlases/rose_pink_8f.png":"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","2_5d/atlases/rose_pink_8dir_8f.png":"<B64>","2d/atlases/rose_rainbow_8f.png":"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","2_5d/atlases/rose_rainbow_8dir_8f.png":"<B64>","2d/atlases/snow_8f.png":"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","2_5d/atlases/snow_8dir_8f.png":"<B64>","2d/atlases/bubble_8f.png":"iVBORw0KGgoAAAANSUhEUgAAAYAAAAAwCAYAAAAYeq1+AAACaUlEQVR42u3dwZHTQBAFUEkXMuBGCHBZ4iAlivw4kQKJcHKVymVjr6319O9577oU293y/JZdYC0LAAAAAAAAAAAAAAAAAAAAAAAw0moEVPTz998/13726/uXb2pXNxYAEwV/9VBKrT155haYBUCTw3Cq+e3t89dlWZYf66f1Vl9VekmtPXnm3RZYmwXQYRN3fBtf/S70FEInl8LoUp+j+0itPXnmnRbYyMxZhU+/jyAS70L3QfS/ELrWz6g+UmtPnnmnBTY6c9bZw6fTRxCpd6G3Zn7v4Xl1H6m1J8+80wKrkDnbkRfjPIAuba998e/ZfK96QSX2cOkw3DoQ+z5G9/BoEFU4xKm1J8/8/PX6SA8VXvcVMmebPXzSe0g+DEf/zlf2kFp78sy7LLBKmbMdefETN3GHHtIPwz0v/qo9pNaeWneHBVYpc55+B5AePsk9dLmbg5luGiplzsMLoOMmTg3Q9MMAs6iWOU+/A+gQPgIUmDFzNpcCYE4WAPFviyv9I4KU2pNnjgVAA0d/dPbKj+JSa0+euQVmAdD0MDxag9rnqrvLAmuzAGYOn9E9dDgMR/1Otc8x89lvGo7uYaty8ZMPcIUDkXwY9v+78d569n925NxTa+8wc5nz/N+3zR4+6T10uZs7/66Ta3M9/1mFt/CptXeYeeICq5Q561FNPDLQSl8r26WHe2vx1bhq7zjzS/VVfhDP6MxZj74IqeHTrYekw/DeUPJMYHV3W7yjMmf9qIuQGD4de0i6m4PZFtjozPFEsKYB6gHZkL+4PvrseiawAAVkDgAAAAAAAAAAAAAAAAAAAAAAMMA/fgAKyKh57MUAAAAASUVORK5CYII=","2d/atlases/pollen_8f.png":"<B64>","2d/atlases/hail_8f.png":"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","2d/atlases/dust_8f.png":"iVBORw0KGgoAAAANSUhEUgAAAYAAAAAwCAYAAAAYeq1+AAACGUlEQVR42u3bMVJbMRQFUIkmM7CAdKwhKViSmyzIjZeUIl4DXRYAM65MlSbDJGB/0LvSOS0DvCdL9+n/gdYAAAAAAAAAAAAAAAAAAAAAAAAAAABY3Om4P5+O+7Pa1c3H6JaAiiHUWmu/f/56bq21rw/fb/987cu3H13t6v5fH0k1GwA4DK+E0GuqBlNq7clrPuMAm2YAzDCJU3tIOwxvCaF/BdPInlJrT17zGQfYqMzpq4fPzI/xCYfhdNyf3xtCf7vfHe7UvsaazzbARmdO/8wPZIabaOpjfNXD8HjYPW3xc0YEUmrtyWs+ywCrkjn9MxqoPonTX0GkH4YtAmlUD6m1r77mo/d9lcy52SJ8LgmgS7/vowI0tYctfv9WByp9iKg9o+4qt/cZMueqATBD+KT3kH4YYLUBVilzrhoAM4SPAPUUoPa1983KmXNjE+nBgVivdhcfl4YyAwCHQQ+eAgywRZ8AhI/DcL873CXfphNrT15z2bNN7b3SAo7cjOk9bLmJK4TCJf1UCbPU2lequ0IfFTKn1AAQoOsehkt7qXqDTa199jWf8dJ5TR+9WkP+KckN+i29pLy6SK19prqr9zEyc3qVhmb4UBJ7SHoH/HjYPaW+s06tPbnutL0+InP6yGZm+EDc5sAAS82cPqKhtPCZJUCTb9Cw2uCa6tLmzzwBZA4AAAAAAAAAAAAAAAAAAAAAAAAAAKzpBcKFcVIFLmdPAAAAAElFTkSuQmCC","2d/atlases/rain_8f.png":"iVBORw0KGgoAAAANSUhEUgAAAYAAAAAwCAYAAAAYeq1+AAADoUlEQVR42u3dPU4jQRCG4TFC2kssGcGScgGfYBGHIeEEm3CYFZyAC5CyARlcgmyTtWR5sT2e6b/qed4QIfurdvVXVW3PzDAAAAAAAAAAAAAAAAAAAAAA/3P3+PYqJjEBaI8zS8Aoe4tJMQMaKACbjWhDMstSscg1wASQ3Sx7MJpezHLX+B9uLq9kK1CxAOyaS3SzcUyi4/cZoTfOLcGyJxkxtBuXSQYKALMRxwkxRDRNnT66KgD7Evru8e012gZl/vTXiEX3DxMA01l8HD6D+HErZu2y0t30HctY42ktjimG2UMMLcWRomgxfxOAjk0Mk3Svry9+DMMwPL+8/4mmP5r2HGue0/xPye2Wi1DtCUkBYP5N645moHO1lzCDY7kR2fy/KmD7/r+m8R67pqiUtvOSidVK1VtKAYvahW5rj2j8U7XXNv9Ua54rjrH+MjbfSxvvKU1ZKW3ZJoDI43vkGCJ20Cm655INRYkOWud/unmmKGA5poVTjP+Q5+S4RuS81iaOMgUc2xStxhG5g14iPUzEUTr/EnHNyesxcWxef+6aZ5kAophPD0cQ+/RH7fxpprsV3aWL8hTPmTsVZCkA0Y59eogh2gZPqTd695xbf4ncSB1D7XyukVNzPWdKMTir+WG1ZFouloKJhfk/3Fxe9XAcN/ZGiX4GitDo/ukXy/SpwPMAdP/FE18nXWbdc69zLv01jLjnn6UfmmpMAAqXjq1D7VHNXw6VjeusdqLVNjHn5+gxR3IaG/OP2e2bANDNJtD9091yHJv3KNU8TI1p0d8B6P5ROkdKmmjK9ypt/r18v5D7/eb+askEAB3ckfdKVQR0/svUn3oaSBnPrAkgVUC1OnE3pDN19Z4nc7XXjH3T3U7V0Npv+ufqyRGPCUAnTXOBSSDaWremd1dPi7d4TplLIW4HnWo81oljl/X1xf2Xf//4vP35/dvvaNrXH5+3wzAMNbSP3V9P/zRu693Q2ppvxxTx9vLbx0I1tc9+JGT0AjBXf1TtkXS3tLkPadfI1OVpp2i1XMBaYVVjQ7e2aaI+u/XIwz3uW98MrYzBU3Qze/RArttB7zWf55f3X5GPIDYxtG4AX61zi+e6u0Ugyhku60APE8wq1QtN6aJb2UhRjyQ8GBvAHKpdCGbDp1nDMevY+lrLBaAOq5QvFrkjHau99U6asQJoegJwRWT+iYD5Ayg6AYztpKOZkzNqACaAhXb/zB8AAAAAAAAAAABAFP4Cg2Hq62EPxkEAAAAASUVORK5CYII=","2d/atlases/silver_8f.png":"iVBORw0KGgoAAAANSUhEUgAAAYAAAAAwCAYAAAAYeq1+AAADlElEQVR42u3dzU0jQRCG4TEiDTgvCcABgiAdIth0Ngg4QALsGQLxniwhL8bjmf6paj/vCSFkf9Wu/qqq8cxMEwAAAAAAAAAAAAAAAAAAAPA/z68f72ISE4B4XFgCRjlaTIoZEKAA7DaiDcksW8Ui1wATQHWzHMFoRjHLfeN/uLu+ka1AxwKwby7ZzcYxiY7fZ4TRuLQE5z3JiCFuXCYZKADMRhwnxJDRNHX6GKoAHEro59eP92wblPnT3yMW3T9MAEzn7OPwGeSPWzGLy0Z3M3Ysc40nWhxLDHOEGCLFUaJoMX8TgI5NDIt0399e/ZqmaXp5+/ybTX827TXWvKb5n5LbkYtQ7wlJAWD+oXVnM9C12luYwbHcyGz+3xWwQ3/f03iPXVPUSttly8SKUvXOpYBl7UK/as9o/Eu19zb/UmteK465/jI331sb7ylNWStt1SaAzON75hgydtAluueWDUWLDlrnf7p5lihgNaaFU4z/J8+pcY3IZa9NnGUKOLYposaRuYM+R0aYiLN0/i3iWpPXc+LYvf7aNa8yAWQxnxGOIA7pz9r500x3FN2ti/ISz1k7FVQpANmOfUaIIdsGL6k3e/dcW3+L3CgdQ+987pFTaz1nSTG46PlhRTItF0vBxML8H+6ub0Y4jpt7o0RfA0VqdP/0i2X5VOB5ALr/5omvk26z7rXXuZb+HkY88tfSf5pqTAAKl45tQO1ZzV8OtY3ronei9TYx5+cYMUdqGhvzz9ntmwAwzCbQ/dMdOY7de7RqHpbGdNb/A9D9o3WOtDTRku/V2vxH+f9C7fdb+60lEwB0cEfeq1QR0Pmfp/7S00DJeFZNAKUC6tWJuyGdqWv0PFmrvWfsu+52qYZo3+lfq6dGPCYAnTTNDSaBbGsdTe++noi3eC6ZSyluB11qPNaJY5/726un736/3W4fN5vNn2zat9vt4zRNUw/tc/fXTuP+z710z40p4+3lvx4L9dS++pGQ2QvAWv1ZtWfSHWlz/6RdI9OX/aIVuYBFYdNjQ0fbNFmf3Xrk4R5P0TdDlDF4iW5mjxGodTvog+bz8vb5O/MRxC6G6Abw3TpHPNfdLwJZznBZB0aYYDalXmhJFx1lI2U9kvBgbABr6HYhmA1fZg3nrGP0tZYLQB82JV8sc0c6V3v0TpqxAgg9Abgisv5EwPwBNJ0A5nbS2czJGTUAE8CZdv/MHwAAAAAAAAAAAEAW/gE2ge37/hwTrAAAAABJRU5ErkJggg==","2d/atlases/green_8f.png":"<B64>","2d/atlases/shadow_8f.png":"iVBORw0KGgoAAAANSUhEUgAAAYAAAAAwCAYAAAAYeq1+AAADN0lEQVR42u3dMW4bMRCFYUnQGXQCNQJ8KpcuXeUULt0E8KUswI1P4EsoTQIIgeJwV1xyhvv9lQtbekPOvCGXu+vNBgAAAAAAAAAAAAAAAAAAAAAAAAAAAJvNy4+f70YBkdgZAjBRujUuDWBxjofTZaTByxgPI2qv2ZiLYfUN4Hg4XZ4en88jJNPxcLqMZv6R45liopHiyG78zH/8GPatzf94OF0+vz62JqK/7gxNLGvTYjhiyBDHvlEA51EnIXpDu6U9u3Fm1l+iPesCifnni2G3ZKJnXnmOtpJYC8xT42X+nXcAoyTK7zjOUhJrb2B/avrv2tZwc7NfKlFKfk/yQAMeb1cQua75ToMdgO0uA13z+F9pX13zir6Duf5ZI/Ag2LBmNfpBaUbtr28vD5HNM+vtzXNzJ3O8tXTve4qKuh1z2BV37L8z0QgGumYz6TH+NbRff8YSMczQeC75jBr+6RKQHQndAXRnNc/RNGe7PHSv3qYN4NbqLdou4J4VKBOtS4Ynx/813pG1f5cjc3UvVcM98rl2LJ9fH9sWjWuObjuAgcn06o1sjcvque/uZamcz3wwPKcJOASulEwRDMGln5x6lzadzIedLQ05gvnf28CmzvVuqaLIZp6ZDTQzmQ4gsxrpkmMzyq2Uo90SWpqndgCMlGaLg1Wbcwvzb72TKf2+nQLLX+DMP68JtTKGJb5nhFXzaCt/ZwBg/szCLmBl8zll1R+2AXhN8fhjln2O5xTZ69vLw63bh1sbUM3vy26eo5n/3L/dK2p3z7RO1im6S5676GGkJTFEfGakRHvUV1bUup8+u/6aceyjJafNbl2imlBJA4v80N3/ijn6A4Oj6S6NwV1LHRpAxFVc6Sp6SkG0jCHrCnTJFVEm/T2NKKvuextvFvNvGUOVD7s1IU+Pz+dSA+o5MZlfhFVLf4TCmBpHpteHRNSftQFkHe+oMWx7JhPzVxRTY8jwvvkRNGdbQWcc/9J5WFL/tnUSjdQAMhd2pmLO9GZG51jmo2bdLq2/awPIvC3LkFjZ/l0fMwXa5n63BpDVQDOZKDMFkMJUaQcAAAAAAAAAAAAAAAAAAAAAAAAAAACu+AUduIbeRBKxqQAAAABJRU5ErkJggg==","2d/atlases/lightning_8f.png":"iVBORw0KGgoAAAANSUhEUgAAAYAAAAAwCAYAAAAYeq1+AAAC5ElEQVR42u3dQW7cMAyFYcvoFRIgOVJy3vZILdAeol3NIgHaqT2WRFLfv8omwHsS+Sgrnsy2AQAAAAAAAAAAAAAAAAAAAAAAAAAAXMHXn7+/0047rmO3BAKUdtorh78BZgAsX0RVmkCY0i78Ew0AJwheBCfts/U7wE0YADfRTp90X6k9ix/a1Xx0L66AFjoFVQghdUP7qvnTY1/2UUVU5epBcwgpAWt9q/jwBLBoI0RvEgEfU3vmunGFNWgA/E18lQ3I4GOFAI3ocQXtar5O9uyjN0F48vkvPZn/0L6KdsOrjo8vG05v1Ptze1VEc7XO3IeVtWetHX37kTbLQIVNiObhbAHN8NGj2Ef5oD133UTq29k922YasRGxmrq3l7M63562l2+/th8zPaymPYLuCgM3eq+2CIZmhmiW8Bz1uDjCxxHtb0/by+3nbEGaVXsk3Y+s/T3tmZ8Yr9LfohircA0RLTzPnOaiDoEj+qOFaUbtZ3RHGQJHBtjqQ6BFa4CIIRrNQ+/TXPSBlm0IrKa9Z930GmCZDz2PaG+9TZwJn2h3oZE8jDrNZR8CdBsCWWtm5BVc673oEcOn9xNA1KeBiEF0tRe659XPSA/Z6/6e/lFXcC3Kwlc7BWVshuxvNGV7mSDKW3CP1k+1zzKs9Dpxyyx+5RPQlV6yv46bbXBV+PxIleFVcYgd8bL0W0AVTp6Vguioh4xBas0denrkaPe/AawQnisFaFTtmfXf023NDa9oQ+ySfwb3/txej4o58zsj+F9NkZs5O/fWNuraV66J7N6q7M0tN6/ys89YZOEpQO1JHn3Cv+6h0xfCCFDN3Flf5nrJoL3y8OrtYx8tVHjOLZgs618lSNW7tY/sYx8pONOGVPCgmWnlwx4MHwCIWTzZGtrd8zy91n4ND/so8RUe352INPMKAZR9vWWNJwB8KqSsgWToWm8n/8Ss+t2jACBnAAAAAAAAAAAAAAAAAAAAAADAVfwB4nsqr2lIuToAAAAASUVORK5CYII=","2d/atlases/ember_8f.png":"<B64>","2d/atlases/star_8f.png":"iVBORw0KGgoAAAANSUhEUgAAAYAAAAAwCAYAAAAYeq1+AAADGUlEQVR42u3dPXLbMBCGYVGjS9i9O5/Ah0vhw+UE6dInx0gqZTyaSCJI/OyCz1t5XNjfAvsLUeDpBAAAAAAAAAAAAAAAAAAAAAAAAAAAUIM/P779op121ONsCSRQ2mmfOfkrYArA4Z1oliCQTGmX/BMVAB0EWyRO2kfr18CZAHRBsO4mXrb0KgBX4QIBNdc/w57c00g7IuUfE8DkBSFrApVwcPQCdqu3hf5LT/HL++erZE//0ddzVCwcwR887FDG0tOATAXg2QZksCWiDTUdO7P+Uf5TQ791H2drbf2XngZknAJ0EJU7jvfP18xdWi39X/+GmOi77pmLb4oJoGcFG7lRMzlSb1sy29AykHvYkHUKm2EKiDaBLSMMzL4BMwXDrIm0tS2ZtWcuwI4QBxaAniNMNuef1Y4Q+t8+Xk4/v/+OFuCr9GfVvlF3Rr/POv3W0L2MXvwZOolZ7Qih/+3j5d/PBQkpxBSTVftG3aF8fkMByzrB79G9jBbvGEUw1OxGw3VzWbVn9pkdBSx741aqfWluQObg3RgM4QK5IBg8nkh7Bu2tjrBCFbEOR3Btvwl8TT5fk1AgVi1SoQ0jguHh/7w6UeDkn21ypH289qf/d8P0EmYfduTNUjvOTTc+QfJZ7UjBE+iqIiAJheugs2oPlTBnK2IFOWevHefmC5cg+dToJiTQsccQOBa1jq7Cxm3hkfNWO841FvGo4+9MNgBHIkLMRvj85cIVdEQ43przFwWsygQAAIpXThtMAAgZCLcdTqagn0W7KWF+FIDJHX1NQEe6pfWejmi3iN5qebR+WbVffx9Z+z39kWM6krbLaGOiXxGdIYGuDYqoVzGvXbtoCalkz7Nrj+Q3a7Q/0hwt34wsYLtvA1179XPkK6JLXl4T0am23C1f0sFG76Jo768988udRsfq1hhtob/Jh8D/ey41yxdHnumMakepruyPrmb+IlJ27TT3m7xaa686AZSIjdQFbT3CmeWtTt7UhiOQcXoJn2tqfAYwi2MBEKsttcs1AKCAAQAAAAAAAAAAAAAAAAAAAAAAAACOwF+U2Cjq0nPUkAAAAABJRU5ErkJggg==","2d/atlases/ash_8f.png":"iVBORw0KGgoAAAANSUhEUgAAAYAAAAAwCAYAAAAYeq1+AAACG0lEQVR42u3bsVVbMRQGYIkyjJIF0qXODrABA3gED8AG9g6u02WBjAKtqdLkcBKwH+j+0ve1HOBeWfqv3jvQGgAAAAAAAAAAAAAAAAAAAAAAAAAAAIs7HQ/n0/FwVru6+RjdElAxhFpr7eev38+ttfb929cvf7724+6+q13d/+sjqWYDAIfhlRB6TdVgSq09ec1nHGDTDIAZJnFqD2mH4S0h9K9gGtlTau3Jaz7jABuVOX318Jn5MT7hMJyOh/N7Q+hv+8f9rdrXWPPZBtjozOmf+YHMcBNNfYyvehh2D7unLX7OiEBKrT15zWcZYFUyp39GA9UncforiPTDsEUgjeohtfbV13z0vq+SOTdbhM8lAXTp931UgKb2sMXv3+pApQ8RtWfUXeX2PkPmXDUAZgif9B7SDwOsNsAqZc5VA2CG8BGgngLUvva+WTlzbmwiPTgQ69Xu4uPSUGYA4DDowVOAAbboE4DwcRj2j/vb5Nt0Yu3Jay57tqm9V1rAkZsxvYctN3GFULiknyphllr7SnVX6KNC5pQaAAJ03cNwaS9Vb7Cptc++5jNeOq/po1dryD8luUG/pZeUVxeptc9Ud/U+RmZOr9LQDB9KYg9J74B3D7un1HfWqbUn152210dkTh/ZzAwfiNscGGCpmdNHNJQWPrMEaPINGlYbXFNd2vyZJ4DMAQAAAAAAAAAAAAAAAAAAAAAAAACANb0A+fdl13CWHMYAAAAASUVORK5CYII=","2d/atlases/blue_magic_8f.png":"<B64>","2d/atlases/droplet_8f.png":"iVBORw0KGgoAAAANSUhEUgAAAYAAAAAwCAYAAAAYeq1+AAADhUlEQVR42u3dPVIbQRCGYYnCCdyDMsVRSBw64SCcwAchceiEo1C4uAckDuxIVZSM0Gp3frpnnzeFkr4e9XzdPdLubjYAAAAAAAAAAAAAAAAAAADA/9w9vT6LSUwA4nFmCRjlaDEpZkCAArDbiDYks2wVi1wDTADVzXIEoxnFLPeN/+Hm8lq2Ah0LwL65ZDcbxyQ6fp8RRuPcEqx7khFD3LhMMlAAmI04Togho2nq9DFUATiU0HdPr8/ZNijzp79HLLp/mACYzurj8Bnkj1sxi8tWdzN2LFONJ1occwxzhBgixVGiaDF/E4COTQyzdN9eXXzdbDabx5e339n0Z9NeY81rmv8puR25CPWekBQA5h9adzYDXaq9hRkcy43M5v9RATv0/z2N99g1Ra20nbdMrChVby0FLGsX+l57RuOfq723+Zda81pxTPWXqfne2nhPacpaaas2AWQe3zPHkLGDLtE9t2woWnTQOv/TzbNEAasxLZxi/J95To1rRM57beIsU8CxTRE1jswd9BoZYSLO0vm3iGtJXk+JY/f6S9e8ygSQxXxGOII4pD9r508z3VF0ty7Kczxn6VRQpQBkO/YZIYZsG7yk3uzdc239LXKjdAy987lHTi31nDnF4KznhxXJtFwsBRML83+4ubwe4Thu6o0S/QwUqdH90y+W+VOB5wHo/psnvk66zbrXXuda+nsY8cg/S/9sqjEBKFw6tgG1ZzV/OdQ2rrPeidbbxJyfY8QcqWlszD9nt28CwDCbQPdPd+Q4du/RqnmYG9OqvwPQ/aN1jrQ00ZLv1dr8R/l+ofb7Lf3VkgkAOrgj71WqCOj816m/9DRQMp5FE0CpgHp14m5IZ+oaPU+Wau8Z+667nash2m/6l+qpEY8JQCdNc4NJINtaR9O7ryfiLZ5L5lKrOBY/ESz7U4My61+qvYfuqZpvry7uD/3t+5ftr8jrHVH7FH7++fsto+7Mt5fvrV0BSGiiJbRn0h1pc3+m3ZGiApaNbY8NHW3TZH1265GHe4TvQqOMwWvqOIH31Lod9EHzeXx5+5FhYY7FEN0APlrniOe6+0Ugyxku68AIE8y21AvN6aKjbKSsRxIejA1gCd0uBLPhy6zhlHWMvtZyAejDtuSLZe5Ip2qP3kkzVgChJwBXRNafCJg/gKYTwNROOps5OaMGYAJYaffP/AEAAAAAAAAAAABk4R8Up+5ogP33NQAAAABJRU5ErkJggg==","2d/atlases/crystal_8f.png":"iVBORw0KGgoAAAANSUhEUgAAAYAAAAAwCAYAAAAYeq1+AAADO0lEQVR42u3dMXLbQAyFYVnD43jig6lLpxOoc+eDKVGbS+QCSpPMaDKOQlHkEm/5/ZULWwJ2gQeAS9K7HQAAAAAAAAAAAAAAAAAAAAAAAAAAAHa7nz+u360CKrG3BCCi7Fa4FIDFOR7O154WL9EfQtTeZmvOh80XgOPhfD1+/XLpIZiOh/O1N/Gv7M8jIlrJj3ThJ/79+zC0Fv/j4Xw9fby92Ij17U4oYqlFi+DwIcGPoZEDl143oXpB+8z2dOFMtn+M7akNEvHP82G/ZKAnd569dRJbgXgqvMR/5Qmgl0D57cdFSGLrBexPTv+d2wpuNsNSgTLm9wQPFOD+poLKeU13GkwAxl0CuuX1v7F9c8Wr+gRz+7NC4EGwbsWq94PSRNtP799eK4tn6u3NU2Mn2d+57B7WNKrqOOawq+7a3xPRCgK6ZTFZY/3nsP32M5bwYYKNlzGfMYd+ugRkImF3AbtTxbM3m9MuDz1rb9MC8Fn3Vm0KeKYDJaIz+xLw5Pi/1ruy7fdiZKrdS+XwGvE8ty+nj7eXFoVrit0mgJ4ngaBXb6QVLt3zutPLUjGffDA8pQg4BJ4pmCoIgks/mfYuLTrJh50tBbmC+D9bwB7d6/1SSZEmnskCGl1kgw4gU4V0ybXp5VbK3m4JHRunJgBCymbNwabFuYX4t55kxn7fXoLlJzjxzxWhVsKwxPf00DX31vk7AwDxJxamgI3t5yNdf9kC4DXF/a9Z+h5PSbLT+7fXz24fbi1Ac35funj2Jv5T/3aQ1O6eaR2sj9g95rmLNYR01Hv9Cz4zMsb2qq+smOt++nT75/RjqBacht2Z17SoCI0pYJUfuvtfMld/YLA3u8f64K6lFQpAxS5ubBf9SEK09CG1A12yI0qyf00hSrX72cKbIv4tfRjWciRhY6qK/yNddIIYTfGjSsykF7HNTMKF4uVevLcuYLN84DMJsObGJL8FcQ5fqhXe5P+Xe7crDbQ5rYNOXP/RVyEWtP+ldRD1VACSEzspmZPezOgcy37MmbdL279qAUjsQJNEKe3f9RFToG3sr1YAUgU0SUSJKYAIUWU7AAAAAAAAAAAAAAAAAAAAAAAAAAAAcMMvZejZ1tai/l0AAAAASUVORK5CYII=","2_5d/atlases/crystal_8dir_8f.png":"<B64>","2d/atlases/black_snow_8f.png":"iVBORw0KGgoAAAANSUhEUgAAAYAAAAAwCAYAAAAYeq1+AAACGklEQVR42u3bvVVcMRAGUIkQOrFjMgqgBCrYLjbaLlwBJVAAGTHuBKfryIkPh5/dB5pPujflADNa6Ru9d6A1AAAAAAAAAAAAAAAAAAAAAAAAAAAAFrffHY773eGodnXzNboloGIItdba0+/nP621dv3j5+W/rx1+7bva1f1eH0k1GwA4DK+E0GuqBlNq7clrPuMAm2YAzDCJU3tIOwwfCaG3gmlkT6m1J6/5jANsVOb01cNn5sf4hMOw3x2Onw2h/z083l+pfY01n22Ajc6c/p0fyAw30dTH+KqH4fbm7mWLnzMikFJrT17zWQZYlczp39FA9Umc/goi/TBsEUijekitffU1H73vq2TOxRbhc0oAnfp9XxWgqT1s8fu3OlDpQ0TtGXVXub3PkDlnDYAZwie9h/TDAKsNsEqZc9YAmCF8BKinALWvvW9WzpwLm0gPDsR6tbv4uDSUGQA4DHrwFGCALfoEIHwchofH+6vk23Ri7clrLnu2qb1XWsCRmzG9hy03cYVQOKWfKmGWWvtKdVfoo0LmlBoAAnTdw3BqL1VvsKm1z77mM146z+mjV2vIPyW5QX+kl5RXF6m1z1R39T5GZk6v0tAMH0piD0nvgG9v7l5S31mn1p5cd9peH5E5fWQzM3wgbnNggKVmTh/RUFr4zBKgyTdoWG1wTXVp82eeADIHAAAAAAAAAAAAAAAAAAAAAAAAAADW9Bd7jlx/ax6mSgAAAABJRU5ErkJggg==","2d/atlases/firefly_8f.png":"<B64>","2_5d/atlases/firefly_8dir_8f.png":"<B64>","2d/atlases/rune_8f.png":"iVBORw0KGgoAAAANSUhEUgAAAYAAAAAwCAYAAAAYeq1+AAADNUlEQVR42u3dQXLaQBCFYaA4TezTZM/SlTO5WHrvU+QGAd8iZyCbpIpKOUQIadRv9P0rLwy8nul53cNIYrMBAAAAAAAAAAAAAAAAAAAAAAAAAADAZvPz++WHUUAldoYATJRuhUsBmJ3j4XzpafAS42FE7TUbczGsvgAcD+fL129fTj0k0/FwvvRm/pXjucdEK8WRbvzMv/8Y9q3N/3g4X17enrYmYnndCUUstWgxHDEkxLFvFMCp10moXtA+055unMn6h2hPbZCYf14MuzkTPbnz7K2TWAvMU+Fl/gvvAHpJlN9xnKQk1l7A/qzpv9e2gpvNfq5EGfJ/kgcKcH+7gsrrmu802AHY7jLQNY//lfbVFa/qO5jrvxUCN4J1a1a9H5Qman9//XiubJ6plzePzZ3keKfSvV9SVNXtmMOuumN/y0QrGOiazWSJ8Z9C+/V7zBHDCI2nIe8xhX/6CsiOhO4CulPNszfNaV8PPaq3aQH4rHurtgt4pANlotOScOf4v8a7svZbOTJW91xreIl8njqWl7enbYvCNUa3HUDHJD16I61w6Z6X3b3MlfPJB8NjioBD4ImSqYIh+OonU+/cppN82NnSkCuY/6MF7N653s21KNLMM9lAk0k6gEw10jnHppdLKXu7JHRontoBMFKaNQerNucW5t96JzP083YWWP4CZ/65JtTKGOb4nB665t46f2cAYP7Mwi5gZfN5T9dftgB4THH/Y5Y+x2MW2fvrx/Nnlw+3NqApPy/dPHsz/7Gv3VvUrp5pnaz36B5y38USRjokhor3jAzRXvWRFVNdT5+uf8o49tWS02Z3Wqqa0JACVvmmu/8t5uo3DPame2gMrlpaoABU7OKGdtH3LIiWMaR2oHN2REn6lzSiVN2PFt4U828Zw36pQBImpqr539NFJ5jRmDiq5Ex6EVsLlfLlVr63LmCTvOEjC2DJiUl+CuIUsVQrvMm/l3tLe6LmtA46cfyHzsOc+retk6inApC8sJMWc9KTGZ1jmY8p1+3c+hctAIkdaJIppf1cHzMF2ub+YgUg1UCTTJSZAogwVdoBAAAAAAAAAAAAAAAAAAAAAAAAAACAK34B3A7baCAKWDoAAAAASUVORK5CYII=","2d/atlases/void_8f.png":"<B64>","2d/atlases/ink_8f.png":"iVBORw0KGgoAAAANSUhEUgAAAYAAAAAwCAYAAAAYeq1+AAADM0lEQVR42u3dMXLbMBCFYUmjXq1KjWs3KexjpMul7TKqPS7d+gRKk8xoMooDUiCwC35/5cKW3gK7bwGCpDcbAAAAAAAAAAAAAAAAAAAAAAAAAAAAbDbfv/34aRQQiZ0hABOlW+PSABbneDhdRhq8jPEwovaajbkYVt8AjofT5fnh6TxCMh0Pp8to5h85nikmGimO7MbP/MePYd/a/I+H0+Xj831rIvrrztDEsjYthiOGDHHsGwVwHnUSoje0W9qzG2dm/SXasy6QmH++GHZLJnrmledoK4m1wDw1XubfeQcwSqL8juMsJbH2Bvanpv+ubQ03N/ulEqXk9yQPNODxdgWR65rvNNgB2O4y0DWP/5X21TWv6DuY6581Ag+CDWtWox+UZtT+8vb6GNk8s97ePDd3MsdbS/e+p6io2zGHXXHH/isTjWCgazaTHuNfQ/v1ZywRwwyN55LPqOGfLgHZkdAdQHdW8xxNc7bLQ/fqbdoAbq3eou0C7lmBMtG6ZHhy/F/jHVn7VzkyV/dSNdwjn2vH8vH5vm3RuObotgMYmEyv3sjWuKye++5elsr5zAfDc5qAQ+BKyRTBEFz6yal3adPJfNjZ0pAjmP+9DWzqXO+WKops5pnZQDOT6QAyq5EuOTaj3Eo52i2hpXlqB8BIabY4WLU5tzD/1juZ0u/bKbD8Bc7885pQK2NY4ntGWDWPtvJ3BgDmzyzsAlY2n1NW/WEbgNcUjz9m2ed4TpG9vL0+3rp9uLUB1fy+7OY5mvnP/du9onb3TOtknaK75LmLHkZaEkPEZ0ZKtEd9ZUWt++mz668Zxz5actrs1iWqCZU0sMgP3f2vmKM/MDia7tIY3LXUoQFEXMWVrqKnFETLGLKuQJdcEWXS39OIsuq+t/FmMf+WMVT5sFsT8vzwdC41oJ4Tk/lFWLX0RyiMqXFken1IRP1ZG0DW8Y4aw7ZnMjF/RTE1hgzvmx9Bc7YVdMbxL52HJfVvWyfRSA0gc2FnKuZMb2Z0jmU+atbt0vq7NoDM27IMiZXt3/UxU6Bt7ndrAFkNNJOJMlMAKUyVdgAAAAAAAAAAAAAAAAAAAAAAAAAAAOCKX2hZbp6bUN/cAAAAAElFTkSuQmCC","v12/leaves":"<B64>","v12/petals":"<B64>","v12/weather_fx":"<B64>","city/lantern_fish_swim.png":"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","city/angler_idle.png":"<B64>"};
const GRAF_GLB={"coral_blade":"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","submarine_wreck":"<B64>","kelp_tall":"<B64>","trident":"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","moss_clump_crimson":"<B64>","glow_fish_teal":"<B64>","dome_section":"<B64>","pearl_clam":"<B64>","lancet_window":"<B64>","anchor":"<B64>","coral_branch_violet":"<B64>","sea_mine":"<B64>","coral_brain":"<B64>","moss_clump_amber":"<B64>","shock_spear":"<B64>","viaduct":"<B64>","kelp_mid":"<B64>","torpedo":"<B64>","angler":"<B64>","nautilus":"<B64>","manta":"<B64>","lantern_fish":"<B64>","moss_clump_azure":"<B64>","anemone":"<B64>","gargoyle":"<B64>","glow_fish_violet":"<B64>","moss_clump_emerald":"<B64>","submarine":"<B64>","moss_clump_teal":"<B64>","glow_fish_amber":"<B64>","angel_statue":"<B64>","cannon":"<B64>","moss_clump_violet":"<B64>","stairs":"<B64>","hand_sonar":"<B64>","air_bubble":"<B64>","diving_helmet":"<B64>","seagrass":"<B64>","cathedral_tower":"<B64>","bridge_broken":"<B64>","barrel":"<B64>","doubloon":"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","seahorse":"<B64>","jellyfish_teal":"<B64>","kelp_short":"<B64>","kraken_tentacle":"<B64>","harpoon_gun":"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","iron_gate":"<B64>","bathyscaphe":"<B64>","coral_branch_orange":"<B64>","galleon":"<B64>","bridge":"<B64>","sea_fan":"<B64>","glow_fish_emerald":"<B64>","tube_sponge":"<B64>","street_lamp":"<B64>","treasure_chest":"<B64>","harpoon":"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","bubble":"<B64>","eel":"<B64>","cathedral_bell":"<B64>","sea_scooter":"<B64>","crate":"H4sIAOom02oA/+1Ya2wUVRQ+0FLa0vKyllflMdSKsC0zs++Cfbd0a2lLu5RCKXW6nbZDd2eX2dm2pK42gBSCMSYENdEoCUSjCYJGE0OgLjUEE43wA/kBGkF+iEapIAlBbPDM7KOzs9OX0UQjP+53z733nO887p2zTdud9rKpAFCeBnBxOkBFXXVVL8F4vaxI5PYSXazg5dw8kUvQOSShI9pZnhUY0S3gjtfHd7J8toMTd2Z7GEcn4dcRXgcqeIncxl6Cd7fKEtnkbwodELmkLrKPGowLtwgHErLILQoM73UyouyvMZvMMejNRh3OpC60QB5HB+dsFVhJg2ry68YhCXFETUjiYr0dGIs/JGqE0xzm8wicixO5rpAOI4oC1+ITpWUvUVNdZ7PbqqvkvOylDcXV1bUlzSSRS2EpOL6Vc0h6NHpBMoFjnJJT3egs+mgWg5LFqGSh/HJRwxtR8Xe5e1inFHmLsJ4VGaeTc9S6fe0deC+yuxbGyxa7nW7BzvaIPoGV9tAL2yMHhwUJ2pQxDvmapfITQphgZNdi8ivK73EyfKf3r3mlJukVExeDJMG8vYzL42QF+RK8bp/gYENljhxQIweUZM65mPaQcYuvrY0V6jm2W7Z3cS7WvtMjpSQrrfbw7YTEpdSjRtOT3nnQZ5AcT8o4pyiFYDXTFsmMj97oFhhPHV68njRTwZU9tJKcTtieIg1Wc8ReXknBBIMOJbpTZCtZvl3El6+nTOTIuZSUshhyIST16rY2uQ2ElmFrq36kIDG6VlO0sp40jKFtIFXcFGXEz0VkhHbpWG+wmugxzCmjpK20N5ssEzen9bTKPW1RmY+VKm0iLeOYj+ndoq4VZZ1E7nrSovJuptWx4xUzDuweXrcQ+9pR2+F2edw8y4vBp2ykaJO06eNDFykGX3h9abGekB9fdF9WznI36hmt5aq/IP1kfNMxH6BBy1wfMacMhoh9XXFhZWFtDINx7ABowz+YvGkyvmOTN4+dvN4Uk3uTf+nShhSAIlsV7K+pWpeavDAZf/JTbeUltTjPlkZiAuKS3x4wOGXaSgrtPZcd5Ilf750PBApMbXvozxMqU9J2bYgrS51v7KtA5d3r55wZPGQlUR9spVUl7xc9swvFifDfDfIfO5jfOViTdvb57w/OT0xsSXh9w41vjlnuLE8cXjws8M/F71j17UcXs1v32VKP7l9WnnH73Ku/T92+9vrpoYybp3849dW5n7OPBJ6999l9cTB79kvzbv14t2fB2xtvdd4/4DecOHlt2pmMDt8Uc/mJk0n8y/MyVg9mdLx2tG/voswKYfNQw5F3Xkyfffy8g3V8vKPjp6/jL3UFLtyIu9o/vcW/Z/HQ9iPv3bzW37/1cGbcCzWJZW8NN9t/effcmj/2Jl3+7vCd4TdTYN/Z7i1Xjn/Z98aMBR8eg6KsNdviL5TXs9c+sH5y6f6BFVfWXc8aOv/Kbrjd/+DUJn+mVT/rizNJh9K7Cxq5mwXRJbuah2MgNFAOqOU8hU5erI7mWWiOkvMUOgpZbRc+D2hwKm0DYVkZi8JnRNYYgQGNPBV2alslpzrngMJXRFbGppYHFDqqOmrmPEp+o9VHswYa9daqdSRu1R1FyYq7VNc3pmYaOUTZjJJfYEBDVuanvgMl/1g1UN2N+v38596+0r9Wzhrj3/b24amH4+H4/44pIP3/YyrEQTxMgwTEBJgOiZAEyYjJMANSIBVmIs6EWfjHzByYizgXHoE0eBTSEdNhHsyHBbAQcSEsggx4DBYjLoYlsBSWAYFIwHLIhMchCzELnoAV8CSsRFwJq0AH2ZCDmAOrgQQKaEQa9GAAI5gQTWAGC1ghFzEX1sBaDDsPMQ/yoQAKoQixCIqhBEqhDLEM1kE52KACsQKehkpYD1WIVVANNbABahFroQ7ssBHqEethEzTAZtiCuAUaYSs0wTbEbdAMGv00TyUr+uR4/UjZdwIDGrwa/TWmlw9o+FD7U/W5CceuzmOc2CW5D99Q3+ngXPMpjvyRWdpXztJ+WC/KLj96yGeqEd5X6kR0x/GjFVfY7u95/38CxARthEgUAAA=","hot_vent":"<B64>","whale_skeleton":"<B64>","starfish":"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","column_broken":"<B64>","ship_wheel":"<B64>","coral_branch_pink":"<B64>","bubble_gun":"<B64>","column":"<B64>","jellyfish_violet":"<B64>","arch":"<B64>","scout_drone":"<B64>","siphonophore":"<B64>","hermit_crab":"<B64>","weather_autumn_leaf":"H4sIAOom02oA/6VVy28bRRj/+iLQUsojvEGKpuUCJtqnvbYUp2mUSkGJXZLQHoKxxvbEXmm9a+3OJo0sSxEXkBAKBy4gjuGK+AOoW8GdOzcuSNxRJU6Ib/aVzfqhNhlpVt/85vc9Z/abtrV1+zwAPLoC8MsMwEeb1UqfUM9jnJT6ZJe5nunYpESUeYnkSJvZzKXccRHZ2jMts93hc/cY5R3mzt2mTdzZn9uVySBHvCZyPVLa7hPbaQWSVBvUog1SknIJjgzaRYhQn/tdu24xulOnttmlnLXqruNwdN3smFbLZRjLtlwb5BKdBrNbpt2up3SR3WVeB30If0Kc6AapPdfsmtzcjTiUc9ds+Fws++ROdXN1a7VaCeKtVDfWl9ZIScb0TPTaFBwFPWCcrkmtgNTFpEhJGwS5xjuh6V7DXWecWpbZ3HD8dgfrEzhpUI8tO5bjhhUUGc5LOWleV08OhOSComtFSS7mpYKhqbKak4MUQ6uxvjQv6Tnixj6OYUPH0FuO37DYptliLVLirs9yhFq9Dl0PIifVO0sff7JCRPgNf2eHuXdNthcmEK6DNBv7nFV3doJ7Ei3XmN3mWHU1jwCnblvsqVoxr4jjmqAbkE+tXVAy2llldZqykVFWpClsQ8qwjansrO38NHZRG2Vj+WkTb5jnuOnii8MYdwBNp9tzbGbzrf0enqIuK3kB+rYohChKAJO7K8uq+D1M8R99KM0rslHQlGIRvwXD0NV8DkFN0fGqScH9vS/+2zG0hGVIhlo0JBVhCbPO147zDGOVzxRr1pryBNbUcdY2l5fWljZG7KlPFZ2eNReXMl0ubJUjRdBO6QZroI3ErJ/e2GhB82cyljSJ6I6m7rAsSeEtDho5viInevBe+GjULcfpYRU92u1ZsRXT7vk8OBrH54GoiYaLrbTnWIEpNLC2WlmJznOUrz8lPz+ZXxNPD7VtFjXxKNKgUnGnCZ+4AOpRkTv2Xh4aGgiHiY48TYe71PascWrKqJqcqHlNajFUwAdnMPf3BYBbqxV80eHg++/+GEI0YrnjXB5+evj58OejtYUMXo7xNCcjJ5z3/6sP+7M/Pbh3+GMWL8d4mpORs5yFMXg5hQ8nyAknirOcimEhFVs5lcs4OeF8+9e5I6xJee/SzesZ/EaMpzlReQ/geIyVr332zfD3H/zFafIHUBj++2f/zHLo9+Cs8gHaLEc2J8nwBPIB5liOcpwkw63t+2WcU+RzcB4uwEW4BM/ADDwLz8FluALPw1V4Aa7Bi/ASvAyvwCy8Cq/B6/AGvAlvwdvwDrwbH8FimNcjYfcmnBhJ7vDPRX1RzPSeIn99I7P/MF4r8tX3kPMQMuPw18cLsdz86ovrKfzBMT5zdOw/nL89/jKZabw/ayczjf8PethXEMALAAA=","weather_blood_moon":"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","weather_burning_ember":"H4sIAOom02oA/61WaZQcVRX+RBRcEBFQ4zopiGtnrF6npyHdDCGJg5OZkBmCGsexuqdmprS7qqmuzuI4GnBJABEXQBJXFBUVBFxw7WoEd8V9FxH3BcUfHH56ju9V1+u5VV2vakjoc97pr27de999937v3lqsz2w9DsCh9YB6InD+9NTksqK1WrqjlJaVPbrdMixTKSmZYVVJKYu6qduaY9lMMrPXqBuLS87QRbrmLOn20Fatxt7sH9qTVlZSSqvGdFtKafeyYlrzHlJnV2b9F0pJTfXlTENrMJFSbdumYS7O6Y2qbs9pptHQHH1+zrYsh21eWzLq87bOotmdnl1J9a2a7XqLW9UsW2dqDb21xNzzrTiM2YEpN22jYTjGHl9LcxzbqLYd/ris7JiaHp8Zn5r0gp2c2rl9bEIppdnZDHPeqHGdDNuDhWgbWt1TarATKaXcindQ8abnulm1t+uOVq8btZ1We3GJJcfbpKq19M1W3bJ76eOHG1ZT6nChWMiM5PLqaFHNjmbSBSbKqunRgjpSzGXT2ZFMPjeSSnuH7HkV9uqwmk8ptthjVVzMs9DnrXa1rk8b8/q8UnLstp5StHpzSdvuRa5M7Ri74MItLDF6w2i1WF76UanDeRZCrpjJ5jOjuXR6pJAbUb2oesGMiuC8s1fbCwu6vcvQ9/ZO33v2clTd7+hTCwsew/zHCd1cdFjRMsUikziavchfZnOjhQyvs8S4p3309vmRQsg+FzbPxpgXMrnw9mqseni3Yqx6Nuy9EKueUwfVWR20GuNpy7JpFXhVoipRsxpNy9RNZ2Z/k3Ehn84UuLBt8lzzaBxPruzasjnL75nBb+JGdTgzGvxlU2sWerdkn8euQYM1ymZX09I7WfrYThZ2l1mDu2yku+nNYxNjOwccZh9WfPmwO5F5ds/76WPdeSANuaPchiUhNxBz/uidDWa0cEzO+t3F5zTlfM5nvTc52OAK9P69vTk1V7esJstiS2s068KLYTbbjlcaq+14MMfbPGvgTavuuWIOJsYnt/j1HNTPP0z9glx/ls86zTR1f3T4kXqZEt2pN1U9UVPjZ2cd3+k5WuEb9m3ScTaOrZmtepRZZtAs3Tdr1bS6zgxYq18ZGjp7HXDu+CQ2XrLeffDGS8vscwK3HNznHjm8rpy6p7OJrQ57LvNnKme6Ltdldvydy2Vcj+pTudDle1A/MlsaD5Xz5yOHD0fKhX/hL0J/E/FfjvIvs6XxSGJwQ/rUv/DpUn0qJzauJOaArSQ/LsltJxyb8E/2DuhTOalvYF+ZrYQ/HVprKqf+2VldkdcgN1bllG/BmKNtJfkv0zqHay1sKA+oPpUL39yG+pHZhvwH7oWoN5VH3K+ORL8vFzUIcyvKNuh/IIduTP5dotOh+lTuxyK4HOU/YBvkw6C/8D7h+yL2ofpUTvIz4EdmK/zTXFIuUznlG6l7h+pTOeFPwI/Mlp6V9g96r6ic8pPcxcA9pHLKH+pHZkvjoXKa77Bc+Kd9IaTfIf7dKP8y2yguhGzdkD71L+UxtY3itMxWkh+X5LYTjo3ws39Oqk/lEfxxCT8HbCX8iZxFYX6KWRTmHpVTvgVjjralfAjz0M9vQB7B56j+GZCH+vnAjKe2Ej6UaW3D3Av1247f80n/XJXTfkv9yGwpHyjHKC+pnMZP+Uv1qTxivgt+RtoG+RA/20n/dCP6c18/fFfJ90nAT5RtkA8DHBPfD1H8DPTYqO8+cl8C34Ah/wHbB7ad3t16a6Xyv+nryzLM/ru+rCLD7N/1ZVJcuvvULlsVf0Xie8+6zL3p8osr1xnbyjLMjnNgWtlWufm+oYoMM/0ysY3EXP/+DValdtvtUkz2dWNwOQnzGvixdeOwv68rw6QuUkxy3pVhUjspJnWRYhZ71889ZJjloEtqmITLMsxy0PXrAxkmvCvLcNw7gZN8cEz4K11r4UcSJzhO4J+H43gjsJ9Pl+Q2Drsy7Ne369+5SOzXxSU1GsDkjF0ZfiTi5djfk8Y1gJP6HMdJfY7jpJ7q36/YXshxUix+f07sv0mx+P05sUfH3U+B43qBwGvpBXH3XOBHghd+f5bymPIxidNJfdfvz7F91+/PsT2e8Ce2T69l5qxhvq1p1iXNLo7j5rrAcXNd4Li5LnDcXBc4qQ7+vEicu0k19+dF4kwlPrsynPTe7z+x78l8j11Js93vz8c82/3+nHjnk77pQljKM8InyDDhihQDj8JxeDSOx2PwWJyAE/E4PB5PwBNxEp6Ek/FknIKn4FSchtPxVDwNT8c6PAPPxLPwbDwHz8UQ1kPBGTgTG/A8PB8vwAvxIrwYKWzEMF4CFWlkkEUOeRQwgiJGUcJZOBubUEYF52AM52IzzsMWbMU2vBTjOB8vwwS2YxJT2IELsBPTmMGF2IWL8HK8Aq/EbrwKs3g15vAaaKiihnnoWMAilmDgtXgd6mjAhIUmLoaNFhy0sQd7sQ/78Xos4w1YwRvxJhzAJbgUb8Zb8Fa8DQdxCJfhclyBt+NKvANX4Z14F96N9+BqXINr8V5ch8M4gvfh/fgAPogP4cO4Hh/BR3EDPoaP4xO4EZ/Ep/Bp3ISb8RncgltxGz6Lz+Hz+AJuxxfxJXwZX8FX8TV04KKLO/B13Im78A18E9/Ct/EdfBffw/fxA9yNH+JH+DF+gp/iZ/g5foFf4lf4NX6D3+J3uAe/x734A+7DH/En/Bl/wV/xN/wd/8A/8S/cj3/jP3gA/4X/Y3w4wNYdnBfnIPA7UBHowePzFb7ou0z6yjND77viOZM+aQPT6SL0u+rOhzYJXLvi4BlE3lmVn3DD6v69dddDh/qLypdPM/uLyv8PlJXqUoghAAA=","weather_floating_lantern":"H4sIAOom02oA/6VVW2/jRBQ+LIVy2eW63C8bhuUtRL7HyUNKqbpSUZssbVkeVlU1SSaJJce2xpN2qyhSH5BAQog/wT/gPSD4E/wPxDsz40tcx3Gz3UiOz5zzne9cZuZ46B4/uAUAT24D/LMJ8M1Rpz1FOAwJQ80pOiM0dHwPNZFWU1AVDYlHKGY+5Zrjc8d1hiNW+Z5gNiK08gD3uOWicqaiWRWFPY4NUfPxFHl+X0rKyewkNqCmUk31HIHHXIUGro+Z4w1PXewxQr1T7DljzEj/lPo+4/F7I8ftU8ITeqyezKqpY4ADQhMvjhuTcMRDiHBCLI/C8QF1xg5zzmIgZow63QkTyyl62DnaO97rtGXO7c7hwfY+aqq8RMfrOz2B0XgYniZ1sCtBY14YahozWW9iiaiDLj0gDLuu0zv0J8MR75EM0sUh2fFdn0ZdFAXWlKpSs+uGqTRsRW9oqmnZFlcZddvQVb2umUZDURuWXlVlnRFr4q/UFLOKaBJjobZNnnrfn3RdcuT0SR81GZ2QKsJuMMIHMnPUebj97Xe7vDFk7IQh70ualVIzRQq2remm1jBUtW4ZdUXodNvSMslasvjuZDAg9JFDzqPyo7VsUveCkc5gIE9avNwn3pDxjTN03lGG6VDYdKNhaWKvV/hK8I29bcu46l3POeslzg3duuqsKWVoM4e2y9Cqkie3yuGNZTjfANzjJzT0abb9YjuKtqDnjwPfIx47vgj4KTBVzRLKiSdawUUm1ejR7o4u7pgjruGXSk3TzCp/6fKfL+SZfyLPijBJS2RY5B+loD5TCnk2bQ02vYjtaGd7f/twiU9/quzMPF3SIX4R047wKbrUBOOGYXgPjKWczZuTLTfUeiay9PbHRy9zNFU+yuThlOOdf2CuzOfz6Hty6vp+wLsY4nHgJiyOF0yY3Bp/wqRoiDnMJ2zgu5KKE+zvtXfj/VzGm0+Jt1bjT8QHCXseiWd7nKnsVDJCoq+fVAVY1M5HMouIZiJg6qOW+TCKvdAtctOW3dTULexhl3AHPopnlcoPGwBf77VhMBjMdf33OX+3YrmVkYVe2jJyHp/Xzwt4Wjn9Ks48f6uAp5XxbRXg8zkX8RTVWxRrntEX5byqrjznKp6inItqTH0BLv+A9LdKLrMl8ro862Ivt0rkyxh7WSJDvN4qka+zwzUxEvm6fNewrys/B7fgediAF+BF2ISX4GV4BV6F23AHXoPX4Q14E96Ct+EuvAPvwnvwPnwAH8JH8DF8Ap/CPajAZ4Dg84RsK+L+U/B/BVd+i5j/bphb4snaNPWX+zl7uneaeueLon3/9a9JK5F7P2/ez+jnC/2Pvy3iR8/f//2UPln99K6XPln9/xgBtAB4DAAA","weather_ice_crystal":"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","weather_lightning_tree":"<B64>","weather_meteor":"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","weather_moth":"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","weather_rift_shard":"H4sIAOom02oA/6VVz4/bRBQe2sJCS6GlpcAtGuBUN7Id23EidcOy2kqLsknZXcqhWkUTZ5KM5NiuPdntKoroAQkkhDjABW4I/gguJAgu/Bf8AZwQ6p03YydxnB9lt5ZGfn7zve+9+eZ5puMe3ruAEMpdQeiXDYQ+OqjXBphEEeW4PMDHNIyY7+Ey1vMqVnCHejQk3A/Bc3jCXNbp8tynlPAuDXP3iAMzp7ljDQ8VHDmAjXD54QB7fkta6tHwKJnAZVWZ+gFBeuDCIWvzRtQlYatBPNYjnLYaoe9zyOx0mdsKKZTyUDsaKrMQnxPOvE6jTRwqgD0adYFdZBLmqgSADELWY5wdJxDCeciafS4+B/h+/WD3cLdek4XW6vt7W1Vc1mBdzGsxR2B0SAAVhoy4EtSD1eCyMZSLnMzE1EEz3KOcuC5z9v1+pwvCyCRNEtFt3/XDWDohUb6oFYq6aZRUrWSpRdtQ1Lxh2rZeMPWSoWlFyygqWl5VNLnAmHQSruZVUwFJkhQzt21C5S2/33TpAWvRFi7zsE8VTNygS/Zk4bh+f+vjT3ZAF9pjUQSypIoyRRWFkq6Zlm3pRcNUSza4TLnWZr/dpuEDRk/i1cbfUpPmKaf1dlt2U/JZpV6Hww7ptq1gTsKOmCsYJUsXu7oiVoLPHW0WrfloIxNcWBNs6UYmtboObWTQ9jp0McttrUXbi2iQnzjQjpEfpsUXm7FsAxy/F/ge9fjhaQB7bmq6JZx9T2gM7Fy68YOd7YL4lZj43e6oed20FXiZhhJ/yAZ/LDtDTKl5S4n9s+rjCrTnqiDLpv8PtsIytoPtrerW/gJf4UzVmVm6iUDw100FgWNyQQTjnGlAA2OhZvP8ZIuCWs9FNv31k85Ld71hyNaUhzhcIHOH8El8XzRc3w9AxIj0AndCwrygz+XO+H0uTUMcuXCYBr4rqYCgulvbSbZzEW+eEW+txh+Ja4d4Hk2O8aRSKdTk+IhvN+kKiFh6ciMB0VAknMZo62J4SLzIXRamL4Zp07DIIS6FADiGh7lc9SJCH+7WkHh++P6dinh/+/bnI5R5wLeZxqT9k7nJk+KZ86e5l/CMsnkf3b08XpJrKWZFrs0VPKMsPsWzbO2jP9U74x//+W4T3pU1duUM9niNPX6Wffuz2+O///ppBO/KGrtyBnu8xh4/y0boBXQBXUSX0IvoJbSBXkavoMvoCnoVXUWvodfRNXQdvYFuoJvoTXQLvTWRFnrgCYzfRC98MK/6k2l//HvJrIiRntO1r9/LzE/3WNeuvg+YuT0Xzze/P707sZ2vvng35f915t/4eZY/Hn88/XI60v7BTW860v7/AMzxUlQgCwAA","weather_rose_petal":"H4sIAOom02oA/6VVS4/bVBQ+9MEApS2P4Q1SdFtWhMjvOJGS6TBMpaBMUmaGdlFC5CR3EkuObdnODKMoUsQGJISGLYgVDFvEH2iKYMOiYs+OBQv2qBLdca5fcZ2H2hlLlo6/+53Hd+7xvV1j9/oZALh3AeD3FYAPduq1IdFcl3qkOCT71HF1yyRFIuQ4kiVdalJH8ywHkd0D3dC7PS9zi2pejzqZ61obVw4z+zwZZYnbRq5LireHxLQ6vsU1Ro1wgRS5bIwjQ+sjRBzLpU2beprR1Ey9r3m003Qsy8PM7Z5udByKpdzmG6Ns7NKiZkc3u82pK5L71O1hBpaNmYuSINN29L7u6fshRfM8R28NPPY5JDfqO5XdSr3mF1urb2+tV0mRR2065mwzjoAJsEpHx2CM1EdFpCiNfKHRShDabjlbLKmht7etQbeHzfGTtDSXbliG5QTtY23KFTi+oHB5VRJ5MS/IcpbLCUJekrmCyokFgZcVVUFMlHg+r0h5TlZVQZTFLO8LDpJE4bgcJ2dRdJhyCqsyKulYg5ZBd/QO7ZCi5wxolmiG3dO2fCGkfmP9w482CVPTGuztUeemTg8CPcG3r7p16NH63p4/M+FnlZpdD/dAVBDwNKfL1kSpoAhs7xb4+uQTe+eFlHfaWVzmrKacBW4JW+VSbHUpOx1bWcYuSLNsbL/WxoFzLSfZfLYZ8zagbfVty6Smt3to4y7KvKAwcGCyRrCm+DC5ubkhsp9FZz/VuzhOvKrgeIlCAecpr8hZxCSBDR/nT/On/mzOsGKSyqkiG1BVlTnUrDSmKoNK+VNVmo4mPEI0cV60nY316vr2TDzxsaqT0+GiRia7hYfmTBOkE6bBHkgzNcsnDzbbUOVUweIjIpzQxATzHBfMsH+m433y0Hl8EFwfTcOybOyiq/VtI4qim/bA87fGGni+KbHTF89V2zL8UBigWqlthvs5y5cfk68s5jfYLaSZJg1P9LBSv1PRORNcdj5ka0w7nrxeEGjEEsY+/DIfz9FM15jnJsy68bGb29YMig54+4wymcw/ZwHeq9Twdofxt9/8OYHwiez3v69MPj76bPLzcbWUwssRnuSk7JhzKfPDZLj6051bRz+m8XKEJzkpO80pzcHLCXyywI45YZ3lRA2lRG3lhJZ5dsw5EkrH2JPywflrV1L41QhPcsL2jmH6zLUvf/L15I/vBmvL7HcgP/nvr+Gp7SDv+LT2GGOWw5iLbHgEe4way6HGRTbkHvxdzj3oLLGfgDNwFs7BeXgSVuApeBqegQvwLFyES3AZnoPn4QV4EVbhJXgZXoFX4TV4Hd6AN+GtaAvWAl2/sLjX4KEn1g7/npPX2JtcE/ivrqbW70bfAn/xbeTchdRz9Ov9UmS3v/z8SgK/M8VXjqf5g/e3+1/EbxIfrprxm8T/B/koWzzMCwAA","weather_sky_jellyfish":"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","weather_storm_crystal":"H4sIAOom02oA/6VVW4/bRBSeXmB7oVxbLm/RAE91I9uxHSdSNyyrrbQom5TdbXmoVtHEmSSWHNvYk11WUdQ+IIGEEA/wAk8g+BskCF74F/wAnhDqO2fGl3WcrMtuRxr5+Mx3vnOZMzMDZ//eRYTQlesI/biG0Ed77dYEkzCkDNcn+JAGoe25uI7VsowlPKAuDQjzAtDsH9mOPRiy0ieUsCENSveIBSvHpUMFTyUcWoANcf3RBLteT0jywfQgXsB1WUr1gCAjUOEQ7EcdKzgOGXE6xLVHhNFeJ/A8Bs6toe30AgrRPFIOplJqFXiMMNsddPrEohw4ouEQHHBnXCzwAWA/sEc2sw9jFGEssLtjxn8n+H57b3t/u90S4bbauzsbTVxXIDvb7dkWx6jgA4IMbCDjoBHkhOvaVKSarETUfjfYoeDUsa1dbzwYQnmEky4J6abneEFUQF6ocrWyOCS5rBumoVY1Xa6ZcqWmKqCqqTVNUaqGVpV101Q1SREpRz4SNrks6xIUKfZ4ojZ1SKTnjbsO3bN7tIfrLBhTCRPHH5IdkQdu39/4+MEW5sl0x/0+DR7a9ChKJ/oXSXePGW33+6Jp4t8mdQcMdkE1TQkzEgz4WkWrGSrfuVNsBfjc1nrVWLTWcsaVAmMDqrfoWi5Cazm0WYSu5rmNQrS5jIbyEwv6LfSCbPH5ZqzaAMsb+Z5LXbZ/7MMu6opqcOXY5TUGdibU+OHWZoUfF5sfqTtyWdVNCT66JkU/ooM/E/3Il+SyIUX6k+ijCJTniiDPpv4Ptsoqtr3NjebG7hJf5UzR6Xm6pEBwjtKCwG24VATtnG6gBtpSzPr5yZYLajwXWXr0487Ldr2midYUFzW8EwsX7VH0LHQcz/OhiCEZ+U5CYrv+mImd8cZMiBq/U+G29D1HUAFBc7u1FW/nMl4/I944HX/AnxbiujS+p+NIRaGS6yN6xITKJzz1+NUBoil3mNooRTYsIG7orDJTl82U1Cy0iEPBAN6UaalUal5C6MPtFuLjh+/fafDvt29/PkO5Abr1LCarT9aSkeFZ0Ge5V/DM8n4/vXttvsLXSswpvtZP4Znl8RmeVbnP/pTvzH/657t1+DYK5MYZ5HmBPH+WfPvx7fnff/08g2+jQG6cQZ4XyPNnyQhdQBfRJXQZvYBeRGvoCrqKrqHr6CV0A72MXkGvotfQ6+gNdBPdQm+it5LSQg88gfkb74UPFqv+JO2Pfy/rDT6za6ry9Xu59XSPVeXG+4BZ2HM+vvn96d1Etr764t2M/tcT/dovJ/6j+cfTL9OZ1U9uuunM6v8DaKeuVggLAAA="};
const GRAF_ARCHIVE_PACKS={"city":"<B64>","ash":"<B64>"};

const ASSETS = {"weapons":"data:image/png;base64,<B64>","wmeta":{"size":[256,128],"weapons":{"fists":{"cell":[0,0,32,32],"grip":[10,15],"tip":[21,15],"base":0},"stick":{"cell":[32,0,32,32],"grip":[9,22],"tip":[27,4],"base":45},"dagger":{"cell":[64,0,32,32],"grip":[9,22],"tip":[23,8],"base":45},"sword":{"cell":[96,0,32,32],"grip":[7,25],"tip":[28,4],"base":45},"katana":{"cell":[128,0,32,32],"grip":[6,25],"tip":[29,2],"base":45},"axe":{"cell":[160,0,32,32],"grip":[8,25],"tip":[15,4],"base":45},"hammer":{"cell":[192,0,32,32],"grip":[8,25],"tip":[22,10],"base":45},"spear":{"cell":[224,0,32,32],"grip":[9,22],"tip":[30,1],"base":45},"scythe":{"cell":[0,32,32,32],"grip":[10,23],"tip":[5,12],"base":45},"flamesword":{"cell":[32,32,32,32],"grip":[7,25],"tip":[28,4],"base":45},"flail":{"cell":[64,32,32,32],"grip":[6,26],"tip":[22,10],"base":45},"sling":{"cell":[96,32,32,32],"grip":[7,16],"tip":[24,16],"muzzle":[25,16],"base":0},"bow":{"cell":[128,32,32,32],"grip":[20,16],"tip":[29,16],"muzzle":[30,16],"base":0},"xbow":{"cell":[160,32,32,32],"grip":[9,19],"tip":[29,14],"muzzle":[30,14],"base":0},"pistol":{"cell":[192,32,32,32],"grip":[9,18],"tip":[27,12],"muzzle":[28,11.5],"base":0},"shotgun":{"cell":[224,32,32,32],"grip":[10,16],"tip":[30,12],"muzzle":[31,12],"base":0},"smg":{"cell":[0,64,32,32],"grip":[11,18],"tip":[28,12],"muzzle":[29,12.5],"base":0},"saw":{"cell":[32,64,32,32],"grip":[9,20],"tip":[29,14],"muzzle":[29,14.5],"base":0},"bomb":{"cell":[64,64,32,32],"grip":[13,20],"tip":[28,14],"muzzle":[29,14],"base":0},"tesla":{"cell":[96,64,32,32],"grip":[8,19],"tip":[27,14],"muzzle":[28,14],"base":0},"laser":{"cell":[128,64,32,32],"grip":[11,19],"tip":[29,14],"muzzle":[30,14.5],"base":0},"bow_drawn":{"cell":[160,64,32,32],"grip":[20,16],"tip":[24,16],"muzzle":[25,16],"base":0}},"proj":{"pebble":[0,96,16,16],"arrow":[16,96,16,16],"bolt":[32,96,16,16],"saw":[48,96,16,16],"bomb":[64,96,16,16],"ball":[80,96,16,16],"casing":[96,96,16,16]}},"atlas":"data:image/png;base64,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","atlasNames":["grass","dirt","stone","wood","sand","leaves","water","brick","grass_side","bark","log_top","stone2"],"hero":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAAYCAYAAAAF6fiUAAAD9UlEQVR42u1ZTUhUURT+3jgwopXRWwhPYTL1GVhExJgg6KKmpX8QgqtJAhfugxa6EXLVJogIQmYltLFy0SIjmSFhcCgQFHL8faFPIkfwZ2Qs6LUY75v7rvf9zPhUZDwwMHPvnPOd755z/84FzuVcClmE4zAqibLGa1eTCeEkSJ0lfMFtApIoa6HGMgBAtb9Ub19UUgjHthzbKBR8wU0CtC6Ro9goBHzBLQKSKGvNVT4AwLXyYssssbJRaPge1sDSr7Thz4tKSv8AQKixzHSKEmFtEOkf6ENfW4tp9hQivtfMAC+K/QN92JyeQTg2xl0fo8hmQbNUjpuB63p/4OkY+qZnHG1ihYTvPQ4Codt+gy4r8aFWBJ6OafRULlR8r1sEaBKAghBgsBEfatWJ2J0o8sUHgOjyPs4SvulmYuaEFQGyNnZrPrRcLDX03agoRtOcanuUywef4E7WSZhZSyOykzoz+F7WyOsLVxBZSuHv7w18//TVEQFaFwAiO6lDjr/8kbS99kmirOWKL4myRgLeNKeiW/NxbTvFB4DKJZwYvkATpwePjWBkJ4URYd/Sgd7dTb398qPn2FMWUOKvwZ6ygLQyD8/iZ9MM1Ac/R3x64NRkQiDfc8HnJZBb+EQmg2v6DKJteMkA6oN30PXx4TODAUKAt/uPiLI2spt1zu6YxiOg+8DgswNod0OlByEXbEMCCfnjA8C/6vuG/hJ/DZrGgT9fXh36r0dNJgQSWdLJRo82zCNH67IyLkeQVuYtB4H2gSVABqHYX5tXXcYOn2D37m5a8nAazOFO2RAoOoC2xThJlDWyWwcTLXoQiHL41k/0jCYcbWRXL2XjNPmhCk1ty1jZFmyv8sOdMnpGE4YkSCvz+Pa4hDuF3cSn9Qn+ZHANd97sZbLVYglllyOn+MJRDZg5UR9ogFQpZbLw3fucillu4Ac72qGuqgCA2fhUTtVQNwJYH2jIfLcZAy9vSkqirJXW3dUNhF4AK9srRyrnOtUl+LX3OjK/V1U8eHJy+ETc5h/saCeBMNwfvOdPIu6/BZDsn41PYTZuDAArHjsDZOoEO9odnW5o/XwJUNmiLx/1gQbH+GZkT0NItlesT6BifcK8FkSLuDFt+M1TtLpFYmMa0eV9BIrK8nKaxWP9sa3Hr08gHNsCqeucZPYT/mYy2CWh/y30ZchrVtN2omwmmXrIYeecnCAMjyGxLUN/c5UPUdjbCTN6TvF5Qa8omnNsI1sLM2a/mkwI4dhBO/Oe4LFygg3GopLCYJdk+WQXXT58Www1llnq8YRg8Xyywuc9mDRX+Sz1nCShUw7kLsErVPLaTY+hVjfLXI5zueqdNr7dTd7th/3/gJtR5LK992wAAAAASUVORK5CYII=","coin":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAQCAYAAACm53kpAAABW0lEQVR42mNgGAUjGzDikvBWE/qPzN966x0jKQZTqh/ZDEr0ErKfBZfGLWtMUMR9Qs4Q7RhvNaH/2PST4hFvNaH/W051MBxuq2Ng2CBEul4i7WfC0HjzLdzzh5dcYji85BIDLEDKA9gwQhar5TffYugnRi81ACzgGHR3Yrgfm/0YKYDhsjtcEwwcXnKJwTZGj3hXoJmBbh7R4NEasgPicLkkUfYz4Uo2Knq8DLZVTQy2MXoMKnq8cHFSYtK2qgliDimBR0WA7AeCAYAvtO5c+gzx0AB5hJaAaaRXgxgBgC+WScnLA51aiLWfCbme9Ak5A9csqafIcLitDsPTnRt+EawKYXoOt9UxSOopDlggwPyAD7Dgi2VYKCJXJ0SXwkg1x+EllxhOXPlHP58/WgO33zZGD6/bGXE1hMoD2DBinpSGEDb95DRmuisuMBy884dkvcTaP+KbwqNgpAMANRbYfFHFLHUAAAAASUVORK5CYII=","hearts":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAQCAYAAABQrvyxAAABg0lEQVR42u2VMUvDQBiG39MOQlwkKBqpg0MWxU2HVgShderg3qHgvyi451+Ii79CJ8EO1qnoEouERtOSkq2I2zklvbtcLpcWxCHvdh/33L3fd9/dAaVKLSXCDmrre5Qd92YjooqLWpa3TJubF0QuUcUBoMJu/nR1xi1Yv3mkAHB3tM/F2wNQ0YSKN07n8XAyRm2Y5i3TpgfHJ3xGfVAAYOPhZAwANE6CpDZvNoD7hwTwXj65NV+/fgAAThRwFc7iL1xu40TG8D3hWfPxvK3tHW6+yE99H0HkkgoXbTaAVgeec5vZc4e7a0kSKUn48HtVu59Zk6LhLK1wo1YHXv1cCWSa1+RVEqte6BKzbSC2jap98vhLyQmw7SO7A3nVj9tH+gqJF1bHvIoXE5CZL5IEaz7VQr3ZiLQHHwuZV/E65uPn8a3/rFV56T/AVrJrWlwsz3wWf71haJkXT2KzWs01n77ETCWdKFjIvIwvYj4+ianv55rXqqT4i/4lb5k2FX/hUv9Nv8K/FRRcU6KYAAAAAElFTkSuQmCC","water":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAQCAYAAACm53kpAAACIUlEQVR42tVXLW/CQBh+uqDwtXQJKIKbQi1pgt3UsoUfQIKZwvEjlmBICJoMCfhaFGIJshVX22QS26kjb6/38V63Jdup9prnnveevp9Bf3Yow24HADAchDieCwBAkeXwWQ+PdwCA/e6EJkva4MtL+d8XWwBAO+qxcUF/digB4CLS2sd21EPY7WA4CAEAx3OBIstrxobdTuVZJEnFEFUcm1jUDomnfDp7XHgb/1UAnQjyALlvU9YmoE4ozhkmPpM9HLxqz43tAvQgrlttVtPKe5HluIgUF5F6Xd62dPZw8UWWYz0fXe2peYDrojaV/yM+uH16KynIFmMmlVVSU4xz8aaE+Bv8wf3yozQRRXFcEUMmt81qiv35EwDwvthCFZDGmMTvdyes5yOMJ0sAwMvrsxZvqw70AlEcAwBEkljxVAyKl/y1KkATXzvqaffpiuK4YhzFyG9UmItIEcVxrVKY+OmiAroStSkctCHgSjg+McU9x4XbrKYYT5bf5nfhW+oGdc0mTQ51TVoK1Zg2eZTkp3+ay68LWVffEPRnh5K6rDRcPuvc2OcvcMrnT+Clx+jwtj7mKoDuAFsjZEouXONNyY2Ll/w0OXPx1CtaYbcDIVJrvKmupR4mGJ0iFaxSHTRh4TMrFEw85S+yHEfVA7htrs4rXHg5H9DWWA07Dj+dDdT+xAevHYY4MeozZbkEbIJXuz7fHOMU4C+MtE35XdnetL4ABT3ujEkQefgAAAAASUVORK5CYII="};

/* -----------------------------------------------------------------------------
   1 · Math kit
----------------------------------------------------------------------------- */
const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const damp = (k, dt) => 1 - Math.exp(-k * dt);          // frame-rate independent easing factor
const rr = (a, b) => a + (b - a) * Math.random();
const angDiff = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash3(x, y, z) {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1103515245);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function makeNoise(rand) {
  const perm = new Uint8Array(512), val = new Float32Array(256), p = [];
  for (let i = 0; i < 256; i++) { p.push(i); val[i] = rand(); }
  for (let i = 255; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); const t = p[i]; p[i] = p[j]; p[j] = t; }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const n2 = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const X = xi & 255, Y = yi & 255;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = val[perm[perm[X] + Y]], b = val[perm[perm[X + 1] + Y]];
    const c = val[perm[perm[X] + Y + 1]], d = val[perm[perm[X + 1] + Y + 1]];
    return lerp(lerp(a, b, u), lerp(c, d, u), v);
  };
  return (x, y, oct = 4) => {
    let s = 0, amp = 0.5, f = 1, norm = 0;
    for (let o = 0; o < oct; o++) { s += amp * n2(x * f, y * f); norm += amp; amp *= 0.5; f *= 2.03; }
    return s / norm;
  };
}

/* -----------------------------------------------------------------------------
   2 · World constants
----------------------------------------------------------------------------- */
const W = 64, D = 64, H = 26;          // voxel grid (x, z, y)
const SEA = 3.8;                       // water surface height
const HP_MAX = 6;                      // half-hearts
const BLOCKED = 99;
const B = { AIR: 0, GRASS: 1, DIRT: 2, STONE: 3, PLANK: 4, SAND: 5, LEAVES: 6, BRICK: 7, BARK: 8 };
const TL = { grass: 0, dirt: 1, stone: 2, wood: 3, sand: 4, leaves: 5, water: 6, brick: 7, grassSide: 8, bark: 9, logTop: 10, stone2: 11 };
const FACE_TILES = [];                  // [top, side, bottom]
FACE_TILES[B.GRASS] = [TL.grass, TL.grassSide, TL.dirt];
FACE_TILES[B.DIRT] = [TL.dirt, TL.dirt, TL.dirt];
FACE_TILES[B.STONE] = [TL.stone, TL.stone2, TL.stone];
FACE_TILES[B.PLANK] = [TL.wood, TL.wood, TL.wood];
FACE_TILES[B.SAND] = [TL.sand, TL.sand, TL.sand];
FACE_TILES[B.LEAVES] = [TL.leaves, TL.leaves, TL.leaves];
FACE_TILES[B.BRICK] = [TL.brick, TL.brick, TL.brick];
FACE_TILES[B.BARK] = [TL.logTop, TL.bark, TL.logTop];
const DIRS4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/* -----------------------------------------------------------------------------
   3 · Island generator (deterministic per seed)
----------------------------------------------------------------------------- */
function generateWorld(seed) {
  const rand = mulberry32(seed);
  const fbm = makeNoise(rand);
  const R = (a, b) => a + (b - a) * rand();
  const RI = (a, b) => Math.floor(a + (b - a + 1) * rand());
  const vox = new Uint8Array(W * H * D);
  const at = (x, y, z) => x + W * (z + D * y);
  const ci = (x, z) => x + z * W;
  const inb = (x, z) => x >= 0 && z >= 0 && x < W && z < D;
  const hgt = new Int16Array(W * D), stand = new Int16Array(W * D), kind = new Uint8Array(W * D);
  // kind: 0 free · 1 path · 2 plaza · 5 structure · 6 pier
  const cx = W / 2, cz = D / 2;

  // 1. heightfield: noisy radial island
  const ox = R(0, 300), oz = R(0, 300);
  for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) {
    const nx = (x + 0.5 - cx) / (W * 0.5), nz = (z + 0.5 - cz) / (D * 0.5);
    const d = Math.hypot(nx, nz) + (fbm(x * 0.07 + ox, z * 0.07 + oz, 3) - 0.5) * 0.5;
    const mask = 1 - smooth(0.3, 0.86, d);
    const hills = smooth(0.25, 0.75, fbm(x * 0.055 + oz, z * 0.055 + ox, 4));
    hgt[ci(x, z)] = Math.max(1, Math.round(1 + mask * (0.42 + 0.8 * hills) * 8.4));
  }

  // 2. beacon hill: the highest ground near the centre becomes a paved plaza
  let tx = cx | 0, tz = cz | 0, bestS = -1e9;
  for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) {
    const r = Math.hypot(x + 0.5 - cx, z + 0.5 - cz);
    if (r > 8) continue;
    const s = hgt[ci(x, z)] - r * 0.1;
    if (s > bestS) { bestS = s; tx = x; tz = z; }
  }
  const HP = clamp(hgt[ci(tx, tz)], 8, 10);
  for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) {
    const r = Math.hypot(x - tx, z - tz), i = ci(x, z);
    if (r < 3.4) { hgt[i] = HP; kind[i] = 2; }
    else { const hill = HP - 1 - Math.floor((r - 3.4) / 1.4); if (hill > hgt[i]) hgt[i] = hill; }
  }
  // 3. relax: no natural step is taller than one block, so the whole island is walkable
  for (let it = 0; it < 60; it++) {
    let changed = false;
    for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) {
      const i = ci(x, z);
      const m = Math.min(x > 0 ? hgt[i - 1] : 1, x < W - 1 ? hgt[i + 1] : 1, z > 0 ? hgt[i - W] : 1, z < D - 1 ? hgt[i + W] : 1);
      if (hgt[i] > m + 1) { hgt[i] = m + 1; changed = true; }
    }
    if (!changed) break;
  }

  // 4. spawn: a beach that looks inland toward the beacon
  let sx = -1, sz = -1, bestSp = 1e9;
  for (let z = 3; z < D - 3; z++) for (let x = 3; x < W - 3; x++) {
    if (hgt[ci(x, z)] !== 4) continue;
    const r = Math.hypot(x - tx, z - tz);
    if (r < 12 || r > 27) continue;
    let ok = true;
    for (let k = 1; k <= 5 && ok; k++) {
      const px = Math.round(x + (tx - x) * k / 9), pz = Math.round(z + (tz - z) * k / 9);
      if (hgt[ci(px, pz)] < 4) ok = false;
    }
    if (!ok) continue;
    const s = Math.abs(r - 18) + rand() * 5;
    if (s < bestSp) { bestSp = s; sx = x; sz = z; }
  }
  if (sx < 0) {
    for (let r = 14; r > 3 && sx < 0; r -= 1) for (let a = 0; a < TAU && sx < 0; a += 0.15) {
      const x = Math.round(tx + Math.cos(a) * r), z = Math.round(tz + Math.sin(a) * r);
      if (inb(x, z) && hgt[ci(x, z)] >= 4 && kind[ci(x, z)] === 0) { sx = x; sz = z; }
    }
  }
  if (sx < 0) { sx = clamp(tx + 5, 0, W - 1); sz = tz; }

  // 5. dirt path from the spawn up to the plaza (quadratic bezier, ~2 cells wide)
  const carvePath = (ax, az, bx, bz, bend) => {
    const len = Math.hypot(bx - ax, bz - az) || 1;
    const qx = (ax + bx) / 2 - (bz - az) / len * bend, qz = (az + bz) / 2 + (bx - ax) / len * bend;
    for (let t = 0; t <= 1; t += 0.3 / len) {
      const u = 1 - t;
      const x = u * u * ax + 2 * u * t * qx + t * t * bx, z = u * u * az + 2 * u * t * qz + t * t * bz;
      for (const o of [-0.55, 0.55]) for (const p of [-0.55, 0.55]) {
        const X = Math.floor(x + o), Z = Math.floor(z + p);
        if (inb(X, Z) && hgt[ci(X, Z)] >= 5 && kind[ci(X, Z)] === 0) kind[ci(X, Z)] = 1;
      }
    }
  };
  carvePath(sx + 0.5, sz + 0.5, tx + 0.5, tz + 0.5, R(-6, 6));
  const ddx = sx - tx, ddz = sz - tz;
  const door = Math.abs(ddx) > Math.abs(ddz) ? [Math.sign(ddx), 0] : [0, Math.sign(ddz) || 1];

  // 6. islets joined to the coast by plank piers (axis-aligned)
  const piers = [];
  for (let attempt = 0; attempt < 90 && piers.length < 2; attempt++) {
    const [dx, dz] = DIRS4[RI(0, 3)];
    const off = RI(-9, 9);
    let x = Math.floor(cx) + (dz !== 0 ? off : 0), z = Math.floor(cz) + (dx !== 0 ? off : 0);
    let lx = -1, lz = -1;
    for (let s = 0; s < 34; s++) {
      x += dx; z += dz;
      if (!inb(x, z)) break;
      const h = hgt[ci(x, z)];
      if (h === 4) { lx = x; lz = z; } else if (h <= 2 && lx >= 0) break;
    }
    if (lx < 0) continue;
    const len = RI(5, 7);
    const ix = lx + dx * (len + 3), iz = lz + dz * (len + 3);
    if (ix < 4 || iz < 4 || ix > W - 5 || iz > D - 5) continue;
    let clear = true;
    for (let a = -3; a <= 3 && clear; a++) for (let b = -3; b <= 3; b++) {
      if (hgt[ci(ix + a, iz + b)] > 2) { clear = false; break; }
    }
    for (let k = 2; k < len && clear; k++) if (hgt[ci(lx + dx * k, lz + dz * k)] > 3) clear = false;
    if (!clear || piers.some(p => Math.hypot(p.ix - ix, p.iz - iz) < 11)) continue;
    for (let a = -3; a <= 3; a++) for (let b = -3; b <= 3; b++) {
      const r = Math.hypot(a, b), i = ci(ix + a, iz + b);
      const h = r < 1.2 ? 5 : r < 2.3 ? 4 : r < 3.2 ? 3 : 0;
      if (h > hgt[i]) hgt[i] = h;
    }
    piers.push({ lx, lz, dx, dz, ix, iz, len });
  }

  // 7. paint terrain into voxels
  for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) {
    const i = ci(x, z), h = hgt[i];
    for (let y = 0; y < h; y++) {
      let b;
      if (h <= 4) b = y >= h - 3 ? B.SAND : B.STONE;
      else if (y === h - 1) b = kind[i] === 2 ? B.STONE : kind[i] === 1 ? B.DIRT : B.GRASS;
      else b = y >= h - 3 ? B.DIRT : B.STONE;
      vox[at(x, y, z)] = b;
    }
    stand[i] = h;
  }
  for (const p of piers) {
    for (let k = 1; k < 20; k++) {
      const X = p.lx + p.dx * k, Z = p.lz + p.dz * k;
      if (!inb(X, Z)) break;
      const i = ci(X, Z);
      if (hgt[i] >= 4) break;
      vox[at(X, 4, Z)] = B.PLANK;
      if (k % 2 === 1) for (let y = hgt[i]; y < 4; y++) vox[at(X, y, Z)] = B.BARK;
      stand[i] = 5; kind[i] = 6;
    }
  }

  // 8. the lighthouse
  for (let y = HP; y < HP + 8; y++) for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) vox[at(tx + a, y, tz + b)] = B.BRICK;
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) vox[at(tx + a, HP + 8, tz + b)] = B.BRICK;
  vox[at(tx, HP + 8, tz)] = B.STONE;
  vox[at(tx + door[0], HP, tz + door[1])] = B.PLANK;
  vox[at(tx + door[0], HP + 1, tz + door[1])] = B.PLANK;
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { stand[ci(tx + a, tz + b)] = BLOCKED; kind[ci(tx + a, tz + b)] = 5; }

  const free = (x, z, minH = 5) => inb(x, z) && kind[ci(x, z)] === 0 && hgt[ci(x, z)] >= minH;
  const underGrassToDirt = (x, z) => { const y = hgt[ci(x, z)] - 1; if (vox[at(x, y, z)] === B.GRASS) vox[at(x, y, z)] = B.DIRT; };

  // 9. ruins: broken L-shaped brick walls
  const ruins = [];
  for (let tries = 0; tries < 260 && ruins.length < 2; tries++) {
    const x0 = RI(6, W - 7), z0 = RI(6, D - 7);
    if (Math.hypot(x0 - tx, z0 - tz) < 8 || Math.hypot(x0 - sx, z0 - sz) < 7) continue;
    const la = RI(3, 5), lb = RI(3, 4), dxr = rand() < 0.5 ? 1 : -1, dzr = rand() < 0.5 ? 1 : -1;
    const cells = [];
    for (let k = 0; k < la; k++) cells.push([x0 + k * dxr, z0]);
    for (let k = 1; k < lb; k++) cells.push([x0, z0 + k * dzr]);
    const h0 = hgt[ci(x0, z0)];
    if (!cells.every(([x, z]) => free(x, z) && Math.abs(hgt[ci(x, z)] - h0) <= 1)) continue;
    if (!free(x0 + dxr, z0 + dzr)) continue;
    cells.forEach(([x, z], k) => {
      const i = ci(x, z);
      const wh = k === 0 ? 3 : rand() < 0.2 ? 0 : RI(1, 3);
      if (!wh) return;
      for (let y = hgt[i]; y < hgt[i] + wh; y++) vox[at(x, y, z)] = B.BRICK;
      underGrassToDirt(x, z);
      kind[i] = 5; stand[i] = hgt[i] + wh;
    });
    ruins.push({ x: x0 + dxr, z: z0 + dzr });
  }

  // 10. stone outcrops (one cell exactly +2: a jump spot)
  const rocks = [];
  for (let tries = 0; tries < 400 && rocks.length < 6; tries++) {
    const x0 = RI(4, W - 6), z0 = RI(4, D - 6), w = RI(2, 3), d = RI(2, 3);
    const cells = [];
    for (let b = 0; b < d; b++) for (let a = 0; a < w; a++) cells.push([x0 + a, z0 + b]);
    if (!cells.every(([x, z]) => free(x, z, 4))) continue;
    if (Math.hypot(x0 - sx, z0 - sz) < 6 || Math.hypot(x0 - tx, z0 - tz) < 6) continue;
    if (rocks.some(r => Math.hypot(r.x - x0, r.z - z0) < 7)) continue;
    const base = Math.max(...cells.map(([x, z]) => hgt[ci(x, z)]));
    if (cells.some(([x, z]) => base - hgt[ci(x, z)] > 1)) continue;
    cells.forEach(([x, z], k) => {
      const i = ci(x, z), hh = k === 0 ? 2 : RI(1, 3);
      for (let y = hgt[i]; y < base + hh; y++) vox[at(x, y, z)] = B.STONE;
      underGrassToDirt(x, z);
      stand[i] = base + hh; kind[i] = 5;
    });
    rocks.push({ x: x0, z: z0 });
  }

  // 11. trees: bark trunk, rounded leaf canopy
  const trees = [];
  for (let tries = 0; tries < 1200 && trees.length < 26; tries++) {
    const x = RI(3, W - 4), z = RI(3, D - 4), i = ci(x, z), h = hgt[i];
    if (h < 5 || kind[i] !== 0) continue;
    if (Math.hypot(x - sx, z - sz) < 4.5 || Math.hypot(x - tx, z - tz) < 5.5) continue;
    if (trees.some(t => Math.hypot(t.x - x, t.z - z) < 4.3)) continue;
    let ok = true;
    for (let b = -2; b <= 2 && ok; b++) for (let a = -2; a <= 2; a++) {
      const j = ci(x + a, z + b);
      if (Math.abs(hgt[j] - h) > 1 || kind[j] === 1 || kind[j] === 2 || kind[j] === 5 || kind[j] === 6) { ok = false; break; }
    }
    if (!ok) continue;
    const th = rand() < 0.35 ? 4 : 3;
    for (let y = h; y < h + th; y++) vox[at(x, y, z)] = B.BARK;
    underGrassToDirt(x, z);
    const cy = h + th;
    const leaf = (X, Y, Z) => { if (inb(X, Z) && Y < H && vox[at(X, Y, Z)] === 0) vox[at(X, Y, Z)] = B.LEAVES; };
    for (let b = -2; b <= 2; b++) for (let a = -2; a <= 2; a++) {
      const corner = Math.abs(a) === 2 && Math.abs(b) === 2;
      if (!corner) { leaf(x + a, cy - 1, z + b); leaf(x + a, cy, z + b); } else if (rand() < 0.3) leaf(x + a, cy, z + b);
    }
    for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) if (Math.abs(a) + Math.abs(b) < 2 || rand() < 0.5) leaf(x + a, cy + 1, z + b);
    stand[i] = BLOCKED; kind[i] = 5;
    trees.push({ x, z, h, th });
  }

  // 12. reachability from the spawn: walk ≤1 block up, jump ≤2, drop any
  const okCell = (x, z) => {
    const s = stand[ci(x, z)];
    if (s === BLOCKED || s < 3 || s >= H - 2) return false;
    return vox[at(x, s, z)] === 0 && vox[at(x, s + 1, z)] === 0;
  };
  const clear2 = (x, z, y) => y >= 0 && y < H - 1 && vox[at(x, y, z)] === 0 && vox[at(x, y + 1, z)] === 0;
  const reach = new Uint8Array(W * D);
  const queue = [ci(sx, sz)]; reach[ci(sx, sz)] = 1;
  for (let qi = 0; qi < queue.length; qi++) {
    const i = queue[qi], x = i % W, z = (i / W) | 0;
    for (const [dx, dz] of DIRS4) {
      const X = x + dx, Z = z + dz;
      if (!inb(X, Z)) continue;
      const j = ci(X, Z);
      if (reach[j] || !okCell(X, Z)) continue;
      const dh = stand[j] - stand[i], top = Math.max(stand[i], stand[j]);
      // the body passes at the higher of the two levels: both columns need two free blocks there
      if (dh <= 2 && clear2(X, Z, top) && clear2(x, z, top)) { reach[j] = dh <= 1 ? 1 : 2; queue.push(j); }
    }
  }

  // 13. coins: special spots first, then an even spread (farthest-point sampling)
  const coins = [];
  const canCoin = (x, z) => {
    if (!inb(x, z)) return false;
    const i = ci(x, z), s = stand[i];
    return reach[i] > 0 && s >= 4 && s < H - 3 && kind[i] !== 2 && vox[at(x, s + 2, z)] === 0
      && Math.hypot(x - sx, z - sz) > 4.5 && !coins.some(c => c.cx === x && c.cz === z);
  };
  const addCoin = (x, z) => coins.push({ cx: x, cz: z, x: x + 0.5, y: stand[ci(x, z)], z: z + 0.5 });
  for (const p of piers) if (canCoin(p.ix, p.iz)) addCoin(p.ix, p.iz);
  for (const r of rocks) if (canCoin(r.x, r.z) && coins.length < 6) addCoin(r.x, r.z);
  for (const r of ruins) if (canCoin(r.x, r.z)) addCoin(r.x, r.z);
  const cand = [];
  for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) if (canCoin(x, z) && reach[ci(x, z)] === 1) cand.push([x, z]);
  const spread = (list, others, extra) => {
    let best = null, bestD = -1;
    for (let k = 0; k < 48 && list.length; k++) {
      const c = list[Math.floor(rand() * list.length)];
      let dmin = Math.hypot(c[0] - sx, c[1] - sz) * 0.7;
      for (const o of others) dmin = Math.min(dmin, Math.hypot(o.cx - c[0], o.cz - c[1]));
      if (extra) for (const o of extra) dmin = Math.min(dmin, Math.hypot(o.cx - c[0], o.cz - c[1]) * 1.6);
      if (dmin > bestD) { bestD = dmin; best = c; }
    }
    return bestD >= 2 ? best : null;
  };
  while (coins.length < 20 && cand.length) {
    const c = spread(cand, coins);
    if (!c) break;
    addCoin(c[0], c[1]);
  }
  const hearts = [];
  for (let n = 0; n < 3; n++) {
    const c = spread(cand.filter(([x, z]) => !coins.some(o => o.cx === x && o.cz === z)), hearts, coins);
    if (c) hearts.push({ cx: c[0], cz: c[1], x: c[0] + 0.5, y: stand[ci(c[0], c[1])], z: c[1] + 0.5 });
  }

  // 13b. weapons: two simple ones a few steps from the beach (on the way inland),
  //      the other eighteen spread over the island — the farther from the spawn, the stronger
  const taken = (x, z) => coins.some(o => o.cx === x && o.cz === z) || hearts.some(o => o.cx === x && o.cz === z);
  const lootAt = (x, z, near) => ({ cx: x, cz: z, x: x + 0.5, y: stand[ci(x, z)], z: z + 0.5, near });
  const loot = [];
  const nearCand = [];
  const toTower = Math.hypot(tx - sx, tz - sz) || 1;
  for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) {
    const i = ci(x, z), s = stand[i], d = Math.hypot(x - sx, z - sz);
    if (reach[i] !== 1 || s < 4 || s >= H - 3 || kind[i] === 2 || d < 2.8 || d > 8 || taken(x, z)) continue;
    if (vox[at(x, s, z)] || vox[at(x, s + 1, z)] || vox[at(x, s + 2, z)]) continue;
    nearCand.push([x, z]);
  }
  for (let n = 0; n < 2 && nearCand.length; n++) {
    let best = null, bestS = -1e9;
    for (const c of nearCand) {
      const inland = ((c[0] - sx) * (tx - sx) + (c[1] - sz) * (tz - sz)) / toTower;
      let s = inland - Math.abs(Math.hypot(c[0] - sx, c[1] - sz) - 4.5) * 0.6 + rand() * 0.8;
      for (const o of loot) if (Math.hypot(o.cx - c[0], o.cz - c[1]) < 3) s -= 50;
      if (s > bestS) { bestS = s; best = c; }
    }
    loot.push(lootAt(best[0], best[1], true));
  }
  const lootCand = cand.filter(([x, z]) => !taken(x, z));
  const far = [];
  for (let n = 0; n < 18 && lootCand.length; n++) {
    let c = spread(lootCand, loot.concat(far), coins);
    if (!c) c = lootCand[Math.floor(rand() * lootCand.length)];
    lootCand.splice(lootCand.indexOf(c), 1);
    far.push(lootAt(c[0], c[1], false));
  }
  far.sort((a, b) => Math.hypot(a.cx - sx, a.cz - sz) - Math.hypot(b.cx - sx, b.cz - sz));
  loot.push(...far);

  // 14. where shades rise: deep water hugging the coast
  const seaSpots = [];
  for (let z = 2; z < D - 2; z++) for (let x = 2; x < W - 2; x++) {
    if (hgt[ci(x, z)] > 2 || kind[ci(x, z)] === 6) continue;
    let land = false;
    for (let b = -3; b <= 3 && !land; b++) for (let a = -3; a <= 3; a++) if (inb(x + a, z + b) && hgt[ci(x + a, z + b)] >= 4) { land = true; break; }
    if (land) seaSpots.push([x, z]);
  }
  const landCells = [];
  for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) if (reach[ci(x, z)] && stand[ci(x, z)] >= 4) landCells.push([x, z]);

  return {
    seed, vox, hgt, stand, kind, reach, at, ci, piers, trees, rocks, ruins, seaSpots, landCells, coins, hearts, loot,
    tower: { x: tx, z: tz, base: HP, door },
    beacon: new THREE.Vector3(tx + 0.5, HP + 9, tz + 0.5),
    ring: new THREE.Vector3(tx + 0.5 + door[0] * 2.55, HP, tz + 0.5 + door[1] * 2.55),
    spawn: new THREE.Vector3(sx + 0.5, hgt[ci(sx, sz)], sz + 0.5),
  };
}

/* -----------------------------------------------------------------------------
   4 · Mesher: culled faces, atlas UVs, per-vertex ambient occlusion
----------------------------------------------------------------------------- */
const FACES = [
  { n: [1, 0, 0], k: 1, v: [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]], uv: [[1, 0], [1, 1], [0, 1], [0, 0]] },
  { n: [-1, 0, 0], k: 1, v: [[0, 0, 1], [0, 1, 1], [0, 1, 0], [0, 0, 0]], uv: [[1, 0], [1, 1], [0, 1], [0, 0]] },
  { n: [0, 1, 0], k: 0, v: [[0, 1, 0], [0, 1, 1], [1, 1, 1], [1, 1, 0]], uv: [[0, 1], [0, 0], [1, 0], [1, 1]] },
  { n: [0, -1, 0], k: 2, v: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], uv: [[0, 0], [1, 0], [1, 1], [0, 1]] },
  { n: [0, 0, 1], k: 1, v: [[1, 0, 1], [1, 1, 1], [0, 1, 1], [0, 0, 1]], uv: [[1, 0], [1, 1], [0, 1], [0, 0]] },
  { n: [0, 0, -1], k: 1, v: [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]], uv: [[1, 0], [1, 1], [0, 1], [0, 0]] },
];
// meshes one rectangular region (a 16×16 chunk) so felled trees and blasted leaves rebuild only locally
function buildTerrainGeometry(world, x0 = 0, z0 = 0, x1 = W, z1 = D) {
  const { vox } = world;
  const at = (x, y, z) => x + W * (z + D * y);
  const solid = (x, y, z) => (y < 0 ? true : (x < 0 || z < 0 || x >= W || z >= D || y >= H) ? false : vox[at(x, y, z)] !== 0);
  const pos = [], nrm = [], uvs = [], col = [], idx = [], cut = [];
  const AO = [0.36, 0.58, 0.8, 1.0];
  const TU = 0.25, TV = 1 / 3, E = 0.0006;
  let vc = 0;
  for (let y = 0; y < H; y++) for (let z = z0; z < z1; z++) for (let x = x0; x < x1; x++) {
    const b = vox[at(x, y, z)];
    if (!b) continue;
    const tiles = FACE_TILES[b];
    const tint = (b === B.LEAVES ? 0.86 : 0.94) + (b === B.LEAVES ? 0.22 : 0.1) * hash3(x, y, z);
    for (let f = 0; f < 6; f++) {
      const F = FACES[f], nx = F.n[0], ny = F.n[1], nz = F.n[2];
      if (solid(x + nx, y + ny, z + nz)) continue;
      let tile = F.k === 0 ? tiles[0] : F.k === 2 ? tiles[2] : tiles[1];
      if (b === B.GRASS && F.k === 1 && solid(x, y + 1, z)) tile = TL.dirt;
      const u0 = (tile % 4) * TU + E, v0 = 1 - (Math.floor(tile / 4) + 1) * TV + E, du = TU - 2 * E, dv = TV - 2 * E;
      const lx = x + nx, ly = y + ny, lz = z + nz;
      const ao = [0, 0, 0, 0];
      for (let k = 0; k < 4; k++) {
        const c = F.v[k];
        const ox = nx ? 0 : (c[0] ? 1 : -1), oy = ny ? 0 : (c[1] ? 1 : -1), oz = nz ? 0 : (c[2] ? 1 : -1);
        let s1, s2;
        if (nx) { s1 = solid(lx, ly + oy, lz); s2 = solid(lx, ly, lz + oz); }
        else if (ny) { s1 = solid(lx + ox, ly, lz); s2 = solid(lx, ly, lz + oz); }
        else { s1 = solid(lx + ox, ly, lz); s2 = solid(lx, ly + oy, lz); }
        const cr = solid(lx + ox, ly + oy, lz + oz);
        ao[k] = s1 && s2 ? 0 : 3 - (s1 + s2 + cr);
        pos.push(x + c[0], y + c[1], z + c[2]);
        nrm.push(nx, ny, nz);
        cut.push(b === B.LEAVES ? 1 : 0);
        uvs.push(u0 + F.uv[k][0] * du, v0 + F.uv[k][1] * dv);
        // blocks under the sea get a cool, darker cast so depth reads through the water
        const wet = y + c[1] < SEA ? 0.78 : 1;
        const s = AO[ao[k]] * tint;
        col.push(s * wet * (wet < 1 ? 0.86 : 1), s * wet * (wet < 1 ? 0.95 : 1), s * wet);
      }
      if (ao[0] + ao[2] > ao[1] + ao[3]) idx.push(vc + 1, vc + 2, vc + 3, vc + 1, vc + 3, vc);
      else idx.push(vc, vc + 1, vc + 2, vc, vc + 2, vc + 3);
      vc += 4;
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute('aCut', new THREE.Float32BufferAttribute(cut, 1));
  g.setIndex(idx);
  g.computeBoundingSphere();
  return g;
}
function makeHeightTexture(world) {
  const data = new Uint8Array(W * D * 4);
  for (let i = 0; i < W * D; i++) {
    const v = Math.min(255, Math.round(world.hgt[i] / 16 * 255));
    data[i * 4] = v; data[i * 4 + 1] = v; data[i * 4 + 2] = v; data[i * 4 + 3] = 255;
  }
  const t = new THREE.DataTexture(data, W, D, THREE.RGBAFormat);
  t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearFilter;
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.needsUpdate = true;
  return t;
}

/* -----------------------------------------------------------------------------
   5 · GLSL
----------------------------------------------------------------------------- */
const GLSL_HASH = /* glsl */`
float h12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(h12(i), h12(i + vec2(1.0, 0.0)), u.x), mix(h12(i + vec2(0.0, 1.0)), h12(i + vec2(1.0, 1.0)), u.x), u.y); }
float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = p * 2.03 + 17.17; a *= 0.5; } return s; }
`;
const FOG_ATTEN = /* glsl */`
  #ifdef USE_FOG
    a *= exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
  #endif
`;

const WATER_VERT = /* glsl */`
varying vec3 vWorld;
#include <fog_pars_vertex>
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;
const WATER_FRAG = /* glsl */`
uniform sampler2D uTex;
uniform sampler2D uHeight;
uniform float uTime, uSea;
uniform vec3 uDeep, uShallow, uFoam, uSky, uSunCol, uSunDir;
uniform vec4 uRipples[8];
varying vec3 vWorld;
#include <fog_pars_fragment>
${GLSL_HASH}
void main() {
  vec2 wp = vWorld.xz;
  vec2 pp = (floor(wp * 16.0) + 0.5) / 16.0;                  // effects live on the 16-texel grid
  float ground = texture2D(uHeight, pp / vec2(${W}.0, ${D}.0)).r * 16.0;
  float depth = uSea - ground;
  float dist = length(vWorld - cameraPosition);
  float frame = mod(floor(uTime * 4.0), 4.0);
  vec3 tex = texture2D(uTex, vec2((fract(wp.x) + frame) * 0.25, fract(wp.y))).rgb;
  float tl = dot(tex, vec3(0.3, 0.5, 0.2));
  vec3 col = mix(uShallow, uDeep, smoothstep(0.25, 2.6, depth));
  float detail = 1.0 - smoothstep(26.0, 64.0, dist);
  col *= mix(1.0, 0.62 + tl * 1.45, detail);
  float shore = 1.0 - smoothstep(0.05, 1.3, depth);
  float band = fract(depth * 1.35 - uTime * 0.3 + h12(floor(pp * 2.0)) * 0.12);
  float foam = shore * step(0.74, band) * detail + smoothstep(0.32, 0.02, depth);
  for (int i = 0; i < 8; i++) {
    vec4 r = uRipples[i];
    float age = uTime - r.z;
    if (r.w > 0.0 && age > 0.0 && age < 1.5) {
      float ring = abs(length(pp - r.xy) - age * 1.4);
      foam += step(ring, 0.06) * (1.0 - age / 1.5) * r.w;
    }
  }
  foam = clamp(foam, 0.0, 1.0);
  vec3 V = normalize(cameraPosition - vWorld);
  float fres = pow(1.0 - clamp(V.y, 0.0, 1.0), 3.0);
  col = mix(col, uSky, fres * 0.4);
  col += uSunCol * smoothstep(0.3, 0.5, tl) * detail * 0.14;   // pixel crests catch the key light
  vec3 Rf = reflect(-V, vec3(0.0, 1.0, 0.0));
  float sd = max(dot(Rf, uSunDir), 0.0);
  float glint = step(0.975, h12(pp * 3.7 + floor(uTime * 5.0))) * pow(sd, 40.0);
  col += uSunCol * (pow(sd, 160.0) * 1.2 + glint * 3.5);
  col = mix(col, uFoam, foam * 0.9);
  float alpha = mix(0.42, 0.93, smoothstep(0.1, 2.0, depth));
  alpha = max(alpha, foam * 0.95);
  gl_FragColor = vec4(col, alpha);
  #include <fog_fragment>
}`;

const SKY_VERT = /* glsl */`
varying vec3 vDir;
void main() { vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const SKY_FRAG = /* glsl */`
uniform vec3 uTop, uHorizon, uBottom, uSunCol, uSunDir, uMoonDir;
uniform float uTime, uNight, uSunVis;
varying vec3 vDir;
${GLSL_HASH}
void main() {
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 col = mix(uHorizon, uTop, pow(clamp(h, 0.0, 1.0), 0.42));
  col = mix(col, uBottom, smoothstep(0.0, -0.22, h));
  float s = max(dot(d, uSunDir), 0.0);
  col += uSunCol * uSunVis * (pow(s, 1400.0) * 40.0 + pow(s, 60.0) * 0.9 + pow(s, 7.0) * 0.35);
  if (h > -0.03) {                                    // pixel-stepped dusk clouds
    vec2 cp = floor(d.xz / (h + 0.18) * 22.0) / 22.0;
    float c = fbm(cp * vec2(0.9, 2.6) + vec2(uTime * 0.006, 0.0));
    float m = smoothstep(0.55, 0.78, c) * smoothstep(-0.02, 0.06, h) * (1.0 - smoothstep(0.26, 0.55, h));
    vec3 lit = mix(uHorizon * 0.55, uSunCol * 1.15, pow(s, 3.0) * uSunVis + 0.15);
    col = mix(col, lit, m * 0.75);
  }
  vec3 sd = d * 160.0;
  vec3 cell = floor(sd);
  float r = fract(sin(dot(cell, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
  float tw = 0.55 + 0.45 * sin(uTime * (1.5 + r * 4.0) + r * 60.0);
  float star = step(0.986, r) * smoothstep(0.02, 0.2, h) * step(length(fract(sd) - 0.5), 0.32);
  col += vec3(0.85, 0.9, 1.0) * star * tw * uNight * 2.2;
  float m2 = dot(d, uMoonDir);
  col += vec3(0.8, 0.85, 1.0) * uNight * (step(0.99955, m2) * 2.4 + pow(max(m2, 0.0), 90.0) * 0.4);
  gl_FragColor = vec4(col, 1.0);
}`;

const MIST_VERT = /* glsl */`
varying vec3 vWorld; varying float vDepth;
void main() { vec4 wp = modelMatrix * vec4(position, 1.0); vWorld = wp.xyz; vec4 mv = viewMatrix * wp; vDepth = -mv.z; gl_Position = projectionMatrix * mv; }`;
const MIST_FRAG = /* glsl */`
uniform sampler2D uHeight;
uniform float uTime, uAlpha, uLayer;
uniform vec3 uColor;
uniform vec2 uDrift;
varying vec3 vWorld; varying float vDepth;
${GLSL_HASH}
void main() {
  vec2 cell = floor(vWorld.xz * 4.0) / 4.0;                   // quarter-block mist pixels
  float n = smoothstep(0.42, 0.8, fbm(cell * 0.07 + uDrift * uTime));
  float ground = texture2D(uHeight, cell / vec2(${W}.0, ${D}.0)).r * 16.0;
  float clear = smoothstep(uLayer - 0.15, uLayer - 0.75, ground);
  float a = n * clear * smoothstep(3.0, 11.0, vDepth) * (1.0 - smoothstep(70.0, 150.0, vDepth)) * uAlpha;
  if (a < 0.003) discard;
  gl_FragColor = vec4(uColor, a);
}`;

const PICK_VERT = /* glsl */`
attribute vec3 aPos; attribute float aPhase; attribute float aAlive;
uniform float uTime, uFrames, uCells, uFps, uBob, uSize;
uniform vec3 uRight;
varying vec2 vUv; varying float vAlive;
#include <fog_pars_vertex>
void main() {
  float bob = sin(uTime * 2.3 + aPhase * 6.2831) * uBob;
  vec3 c = aPos + vec3(0.0, bob, 0.0);
  float s = uSize * aAlive;
  vec3 wp = c + uRight * (position.x * s) + vec3(0.0, position.y * s, 0.0);
  vec4 mvPosition = viewMatrix * vec4(wp, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  float fr = mod(floor(uTime * uFps + aPhase * 13.0), uFrames);
  vUv = vec2((uv.x + fr) / uCells, uv.y);
  vAlive = aAlive;
  #include <fog_vertex>
}`;
const PICK_FRAG = /* glsl */`
uniform sampler2D uMap; uniform float uGlow;
varying vec2 vUv; varying float vAlive;
#include <fog_pars_fragment>
void main() {
  vec4 c = texture2D(uMap, vUv);
  if (c.a < 0.5 || vAlive < 0.01) discard;
  float l = dot(c.rgb, vec3(0.3, 0.55, 0.15));
  gl_FragColor = vec4(c.rgb * (1.0 + uGlow * l * l * 3.0), 1.0);
  #include <fog_fragment>
}`;
const HALO_FRAG = /* glsl */`
uniform vec3 uColor; uniform float uIntensity, uTime;
varying vec2 vUv; varying float vAlive;
#include <fog_pars_fragment>
void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float a = pow(max(0.0, 1.0 - length(p)), 2.4) * uIntensity * vAlive * (0.85 + 0.15 * sin(uTime * 3.1));
  ${FOG_ATTEN}
  if (a < 0.002) discard;
  gl_FragColor = vec4(uColor, a);
}`;
const BEAM_FRAG = /* glsl */`
uniform vec3 uColor; uniform float uIntensity, uTime;
varying vec2 vUv; varying float vAlive;
#include <fog_pars_fragment>
void main() {
  float x = abs(vUv.x * 2.0 - 1.0);
  float a = pow(1.0 - vUv.y, 1.6) * pow(1.0 - x, 2.0) * uIntensity * vAlive;
  a *= 0.75 + 0.25 * sin(uTime * 2.6 + vUv.y * 9.0);
  #ifdef USE_FOG
    a *= exp(-fogDensity * fogDensity * vFogDepth * vFogDepth * 0.45);
  #endif
  if (a < 0.002) discard;
  gl_FragColor = vec4(uColor, a);
}`;

// segmented foes: one billboard per body segment. aFx = (hit flash, frost, burn, shock), aKind = 0 shade · 1 imp · 2 warden
const SHADE_VERT = /* glsl */`
attribute vec3 aPos; attribute float aRad; attribute float aAlpha; attribute float aSeed; attribute vec4 aFx; attribute float aKind;
uniform vec3 uRight, uUp; uniform float uScale;
varying vec2 vUv; varying float vAlpha; varying float vSeed; varying vec4 vFx; varying float vKind;
#include <fog_pars_vertex>
void main() {
  float s = aRad * 2.0 * uScale * (1.0 + aFx.x * 0.1);       // a hit makes the segment swell for a moment
  vec3 wp = aPos + uRight * (position.x * s) + uUp * (position.y * s);
  vec4 mvPosition = viewMatrix * vec4(wp, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  vUv = uv; vAlpha = aAlpha; vSeed = aSeed; vFx = aFx; vKind = aKind;
  #include <fog_vertex>
}`;
const SHADE_FRAG = /* glsl */`
uniform float uTime; uniform vec3 uCore, uRim;
varying vec2 vUv; varying float vAlpha; varying float vSeed; varying vec4 vFx; varying float vKind;
#include <fog_pars_fragment>
void main() {
  vec2 q = (floor(vUv * 14.0) + 0.5) / 14.0;                  // pixel-art silhouette
  vec2 p = q * 2.0 - 1.0;
  float r = length(p), an = atan(p.y, p.x);
  float spikes = vKind > 1.5 ? 0.07 * pow(abs(sin(an * 4.0 + vSeed)), 6.0) : 0.0;   // the warden bristles
  float edge = 0.84 + 0.09 * sin(an * 5.0 + uTime * 4.0 + vSeed * 7.0) + 0.05 * sin(an * 9.0 - uTime * 6.5 + vSeed) + spikes;
  if (r > edge || vAlpha < 0.01) discard;
  float rimK = smoothstep(edge - 0.34, edge - 0.04, r);
  vec3 rim = vKind > 1.5 ? vec3(0.36, 0.07, 0.52) : vKind > 0.5 ? vec3(0.42, 0.06, 0.1) : uRim;
  vec3 col = mix(uCore, rim, rimK);
  // status effects: frost tints the whole body, burning and shock light up the rim
  col = mix(col, vec3(0.3, 0.55, 0.8) * (0.45 + 0.55 * rimK), vFx.y * 0.8);
  float flick = 0.6 + 0.4 * sin(uTime * 24.0 + vSeed * 5.0 + an * 3.0);
  col += vec3(1.0, 0.42, 0.08) * vFx.z * rimK * flick * 1.7;
  col += vec3(0.4, 0.95, 1.0) * vFx.w * rimK * step(0.5, fract(uTime * 17.0 + vSeed + an * 0.8)) * 2.2;
  col = mix(col, vec3(1.0, 0.86, 0.95) * 1.15, vFx.x * 0.7);
  gl_FragColor = vec4(col, vAlpha);
  #include <fog_fragment>
}`;
const AURA_FRAG = /* glsl */`
uniform vec3 uColor; uniform float uTime;
varying vec2 vUv; varying float vAlpha; varying float vSeed; varying vec4 vFx; varying float vKind;
#include <fog_pars_fragment>
void main() {
  float r = length(vUv * 2.0 - 1.0);
  vec3 c = vKind > 1.5 ? vec3(0.8, 0.22, 1.0) : vKind > 0.5 ? vec3(1.0, 0.24, 0.3) : uColor;
  c = mix(c, vec3(1.0, 0.45, 0.1), vFx.z * 0.75);
  c = mix(c, vec3(0.35, 0.8, 1.0), max(vFx.y, vFx.w) * 0.7);
  float a = smoothstep(1.0, 0.4, r) * 0.3 * vAlpha * (0.8 + 0.2 * sin(uTime * 5.0 + vSeed * 3.0)) * (1.0 + vFx.x * 0.8);
  a *= vKind > 1.5 ? 0.5 : 1.0;                               // sixteen huge segments overlap: keep the warden's halo in check
  #ifdef USE_FOG
    a *= exp(-fogDensity * fogDensity * vFogDepth * vFogDepth * 0.6);
  #endif
  if (a < 0.003) discard;
  gl_FragColor = vec4(c, a);
}`;

const PART_VERT = /* glsl */`
attribute float aSize; attribute float aAlpha; attribute vec3 aColor; attribute float aShape;
uniform float uScale, uFogD;
varying vec3 vColor; varying float vAlpha; varying float vShape;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float d = max(-mv.z, 0.1);
  gl_PointSize = clamp(aSize * uScale / d, 1.0, 220.0);
  vColor = aColor; vShape = aShape;
  vAlpha = aAlpha * exp(-uFogD * uFogD * d * d * 0.7);
}`;
const PART_FRAG = /* glsl */`
varying vec3 vColor; varying float vAlpha; varying float vShape;
void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float a;
  if (vShape < 0.5) a = pow(max(0.0, 1.0 - length(p)), 1.6);
  else if (vShape < 1.5) a = 1.0;
  else { vec2 ap = abs(p); a = max(max(step(ap.x, 0.2) * step(ap.y, 0.95), step(ap.y, 0.2) * step(ap.x, 0.95)), step(max(ap.x, ap.y), 0.36)); }
  a *= vAlpha;
  if (a < 0.004) discard;
  gl_FragColor = vec4(vColor, a);
}`;

const FLY_VERT = /* glsl */`
attribute float aPhase; attribute float aKind; attribute float aSpeed;
uniform float uTime, uScale, uFogD, uFly, uMote;
uniform vec3 uFlyCol, uMoteCol;
varying vec3 vColor; varying float vAlpha;
void main() {
  float t = uTime * aSpeed + aPhase * 6.2831;
  vec3 p = position;
  float a;
  if (aKind > 0.5) {
    p += vec3(sin(t * 0.7) * 1.3 + sin(t * 1.9) * 0.3, sin(t * 1.1) * 0.55, cos(t * 0.6) * 1.3 + cos(t * 1.7) * 0.3);
    a = uFly * pow(0.5 + 0.5 * sin(t * 2.7 + aPhase * 20.0), 4.0);
    vColor = uFlyCol;
  } else {
    p += vec3(sin(t * 0.31) * 1.8, sin(t * 0.23) * 0.7 + 0.25 * sin(t * 1.3), cos(t * 0.27) * 1.8);
    a = uMote * (0.35 + 0.35 * sin(t * 1.7));
    vColor = uMoteCol;
  }
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float d = max(-mv.z, 0.1);
  gl_PointSize = clamp((aKind > 0.5 ? 0.22 : 0.09) * uScale / d, 1.0, 64.0);
  vAlpha = a * exp(-uFogD * uFogD * d * d * 0.6);
}`;
const FLY_FRAG = /* glsl */`
varying vec3 vColor; varying float vAlpha;
void main() {
  float a = pow(max(0.0, 1.0 - length(gl_PointCoord * 2.0 - 1.0)), 1.8) * vAlpha;
  if (a < 0.004) discard;
  gl_FragColor = vec4(vColor, a);
}`;

const FLAME_VERT = /* glsl */`
uniform vec3 uRight; uniform vec2 uSize;
varying vec2 vUv;
void main() {
  vec3 wp = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz + uRight * position.x * uSize.x + vec3(0.0, position.y * uSize.y, 0.0);
  vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
}`;
const FLAME_FRAG = /* glsl */`
uniform float uTime, uLevel;
varying vec2 vUv;
${GLSL_HASH}
void main() {
  vec2 q = (floor(vUv * vec2(10.0, 16.0)) + 0.5) / vec2(10.0, 16.0);
  float y = q.y;
  float n = vnoise(vec2(q.x * 5.0, y * 4.0 - uTime * 4.5));
  float w = (1.0 - y) * (0.55 + 0.45 * n);
  float x = abs(q.x - 0.5) * 2.0;
  if (x > w || y + n * 0.25 > 0.97 || uLevel < 0.01) discard;
  float heat = (1.0 - y) * (1.0 - x / max(w, 0.001));
  vec3 col = mix(vec3(1.0, 0.22, 0.04), vec3(1.0, 0.8, 0.3), smoothstep(0.12, 0.55, heat));
  col = mix(col, vec3(1.0, 1.0, 0.85), smoothstep(0.55, 0.9, heat));
  gl_FragColor = vec4(col * (2.0 + 3.0 * uLevel), 1.0);
}`;

const RING_VERT = /* glsl */`
varying vec2 vLocal;
void main() { vLocal = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const RING_FRAG = /* glsl */`
uniform float uTime, uOn;
varying vec2 vLocal;
void main() {
  vec2 q = floor(vLocal * 16.0) / 16.0;
  float an = atan(q.y, q.x);
  float dash = step(0.5, fract(an / 6.2831 * 12.0 - uTime * 0.5));
  float r = length(q);
  float a = (0.25 + 0.75 * dash) * step(0.72, r) * step(r, 1.12) * (0.1 + 0.9 * uOn) * (0.7 + 0.3 * sin(uTime * 4.0));
  if (a < 0.01) discard;
  gl_FragColor = vec4(vec3(1.0, 0.75, 0.3) * 2.2, a);
}`;

const LBEAM_VERT = /* glsl */`
varying float vT; varying vec3 vN; varying vec3 vView; varying float vDepth;
void main() {
  vT = uv.y;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vView = normalize(cameraPosition - wp.xyz);
  vec4 mv = viewMatrix * wp; vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}`;
const LBEAM_FRAG = /* glsl */`
uniform float uI; uniform vec3 uColor;
varying float vT; varying vec3 vN; varying vec3 vView; varying float vDepth;
void main() {
  float f = abs(dot(normalize(vN), normalize(vView)));
  float a = pow(f, 1.8) * pow(1.0 - vT, 1.25) * uI;
  if (a < 0.003) discard;
  gl_FragColor = vec4(uColor, a);
}`;

const UV_VERT = /* glsl */`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const SHADOW_FRAG = /* glsl */`
uniform float uA;
varying vec2 vUv;
void main() {
  vec2 q = (floor(vUv * 12.0) + 0.5) / 12.0;
  float a = (1.0 - smoothstep(0.5, 1.0, length(q * 2.0 - 1.0))) * uA;
  if (a < 0.01) discard;
  gl_FragColor = vec4(0.06, 0.03, 0.1, a);
}`;

const DOFShader = {
  uniforms: {
    tDiffuse: { value: null }, uDir: { value: new THREE.Vector2(1, 0) }, uRes: { value: new THREE.Vector2(1, 1) },
    uFocus: { value: 0.5 }, uBand: { value: 0.16 }, uAmount: { value: 1.6 },
  },
  vertexShader: UV_VERT,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse; uniform vec2 uDir, uRes; uniform float uFocus, uBand, uAmount;
    varying vec2 vUv;
    void main() {
      float k = max(0.0, abs(vUv.y - uFocus) - uBand) * uAmount;
      vec2 st = uDir / uRes * k * 6.0;
      vec4 s = texture2D(tDiffuse, vUv) * 0.2270270270;
      s += (texture2D(tDiffuse, vUv + st * 1.3846153846) + texture2D(tDiffuse, vUv - st * 1.3846153846)) * 0.3162162162;
      s += (texture2D(tDiffuse, vUv + st * 3.2307692308) + texture2D(tDiffuse, vUv - st * 3.2307692308)) * 0.0702702703;
      gl_FragColor = s;
    }`,
};
const FinalShader = {
  uniforms: {
    tDiffuse: { value: null }, uRes: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 },
    uAberr: { value: 0.0015 }, uGrain: { value: 0.05 }, uGlitch: { value: 0 }, uVignette: { value: 0.35 },
    uDanger: { value: 0 }, uFlash: { value: 0 }, uFade: { value: 0 }, uDesat: { value: 0 }, uBars: { value: 0 },
    uFlashColor: { value: new THREE.Color(1, 0.6, 0.85) }, uDangerColor: { value: new THREE.Color(0.32, 0.03, 0.36) },
    uLift: { value: new THREE.Color(0.02, 0.0, 0.035) }, uGain: { value: new THREE.Color(1, 1, 1) },
  },
  vertexShader: UV_VERT,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse; uniform vec2 uRes;
    uniform float uTime, uAberr, uGrain, uGlitch, uVignette, uDanger, uFlash, uFade, uDesat, uBars;
    uniform vec3 uFlashColor, uDangerColor, uLift, uGain;
    varying vec2 vUv;
    float h12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
    void main() {
      vec2 uv = vUv;
      float tt = floor(uTime * 18.0);
      float band = floor(uv.y * 42.0);
      float g = step(1.0 - uGlitch * 0.45, h12(vec2(band, tt)));
      float shift = (h12(vec2(tt, band * 1.7)) - 0.5) * 0.09 * uGlitch * g;
      uv.x += shift;
      vec2 c = uv - 0.5;
      vec2 off = c * dot(c, c) * uAberr * 4.0 + vec2(shift * 0.35, 0.0);
      vec3 col;
      col.r = texture2D(tDiffuse, uv + off).r;
      col.g = texture2D(tDiffuse, uv).g;
      col.b = texture2D(tDiffuse, uv - off).b;
      float l = dot(col, vec3(0.299, 0.587, 0.114));
      col = mix(col, vec3(l), uDesat);
      col = col * uGain + uLift * (1.0 - l);
      vec2 q = c * vec2(uRes.x / uRes.y, 1.0);
      float v = smoothstep(0.95, 0.28, length(q));
      col *= mix(1.0 - uVignette, 1.0, v);
      col = mix(col, uDangerColor, (1.0 - v) * uDanger * 0.6);
      float n = h12(gl_FragCoord.xy + fract(uTime * 7.13) * 917.0) - 0.5;
      col += n * uGrain * (1.15 - l);
      col = mix(col, uFlashColor, uFlash);
      col *= uFade;
      float bars = step(vUv.y, uBars) + step(1.0 - uBars, vUv.y);
      col = mix(col, vec3(0.0), clamp(bars, 0.0, 1.0));
      gl_FragColor = vec4(col, 1.0);
    }`,
};

/* -----------------------------------------------------------------------------
   6 · Renderer, scene, textures
----------------------------------------------------------------------------- */
const $ = (id) => document.getElementById(id);
const canvas = $('c');
const loadingEl = $('loading');
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const IS_TOUCH = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 1 && matchMedia('(hover: none)').matches;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', stencil: false });
} catch (err) {
  loadingEl.textContent = 'Нужен браузер с поддержкой WebGL — без него остров не поднимется.';
  throw err;
}
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.02);
const camera = new THREE.PerspectiveCamera(46, innerWidth / innerHeight, 0.1, 900);

function loadTexture(uri) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const t = new THREE.Texture(img);
      t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false;
      t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true;
      resolve(t);
    };
    img.onerror = reject;
    img.src = uri;
  });
}
const [atlasTex, heroTex, coinTex, heartTex, waterTex, weaponsTex] =
  await Promise.all([ASSETS.atlas, ASSETS.hero, ASSETS.coin, ASSETS.hearts, ASSETS.water, ASSETS.weapons].map(loadTexture));
document.documentElement.style.setProperty('--img-hearts', `url("${ASSETS.hearts}")`);
document.documentElement.style.setProperty('--img-coin', `url("${ASSETS.coin}")`);

// uniforms shared by many materials (one write per frame updates all of them)
const U = {
  time: { value: 0 },
  right: { value: new THREE.Vector3(1, 0, 0) },      // camera right, horizontal (cylindrical billboards)
  camRight: { value: new THREE.Vector3(1, 0, 0) },   // camera right (spherical billboards)
  camUp: { value: new THREE.Vector3(0, 1, 0) },
  pScale: { value: 400 },                             // pixels per world unit at distance 1
  fogD: { value: 0.02 },
};
function fogShader(opts) {
  const uniforms = THREE.UniformsUtils.clone(THREE.UniformsLib.fog);
  Object.assign(uniforms, opts.uniforms);
  return new THREE.ShaderMaterial({ ...opts, uniforms, fog: true });
}
function makeInstGeo(base, count, attrs) {
  const g = new THREE.InstancedBufferGeometry();
  g.index = base.index;
  g.setAttribute('position', base.attributes.position);
  g.setAttribute('uv', base.attributes.uv);
  const out = {};
  for (const name in attrs) {
    const [arr, size] = attrs[name];
    const a = new THREE.InstancedBufferAttribute(arr, size);
    a.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute(name, a); out[name] = a;
  }
  g.instanceCount = count;
  return { geo: g, attrs: out };
}

/* -----------------------------------------------------------------------------
   7 · Scene objects
----------------------------------------------------------------------------- */
// sky dome (follows the camera)
const skyU = {
  uTop: { value: new THREE.Color() }, uHorizon: { value: new THREE.Color() }, uBottom: { value: new THREE.Color() },
  uSunCol: { value: new THREE.Color() }, uSunDir: { value: new THREE.Vector3(0, 0.2, -1) }, uMoonDir: { value: new THREE.Vector3(0, 0.6, 1) },
  uTime: U.time, uNight: { value: 0 }, uSunVis: { value: 1 },
};
const sky = new THREE.Mesh(new THREE.SphereGeometry(500, 32, 16),
  new THREE.ShaderMaterial({ uniforms: skyU, vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, side: THREE.BackSide, depthWrite: false, depthTest: false }));
sky.renderOrder = -10; sky.frustumCulled = false;
scene.add(sky);

// lights: hemisphere + key (sun / moon) + companion wisp + beacon
const hemi = new THREE.HemisphereLight(0xffffff, 0x222222, 1.5);
const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
keyLight.target.position.set(W / 2, 0, D / 2);
const wispLight = new THREE.PointLight(0xffcf7a, 0, 12, 1.3);
const beaconLight = new THREE.PointLight(0xffa04a, 0, 60, 1.05);
// two short-lived lights for muzzle flashes, explosions, slams (always in the scene: a stable light count keeps Lambert from recompiling)
const flashLights = [new THREE.PointLight(0xffc070, 0, 9, 1.4), new THREE.PointLight(0xffc070, 0, 9, 1.4)];
scene.add(hemi, keyLight, keyLight.target, wispLight, beaconLight, ...flashLights);

// terrain material (mesh is rebuilt per island)
const terrainMat = new THREE.MeshLambertMaterial({ map: atlasTex, vertexColors: true });
const cutU = { uCutA: { value: new THREE.Vector3() }, uCutB: { value: new THREE.Vector3() }, uCutR: { value: 1.9 }, uCutOn: { value: 0 } };
terrainMat.onBeforeCompile = (sh) => {
  Object.assign(sh.uniforms, cutU);
  sh.vertexShader = sh.vertexShader
    .replace('#include <common>', '#include <common>\nattribute float aCut;\nvarying float vCut;\nvarying vec3 vWPos;')
    .replace('#include <begin_vertex>', '#include <begin_vertex>\nvCut = aCut;\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
  sh.fragmentShader = sh.fragmentShader
    .replace('#include <common>', `#include <common>
uniform vec3 uCutA, uCutB; uniform float uCutR, uCutOn;
varying float vCut; varying vec3 vWPos;
float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }`)
    .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
  if (vCut > 0.5 && uCutOn > 0.0) {
    vec3 pa = vWPos - uCutA, ba = uCutB - uCutA;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    float k = (1.0 - smoothstep(uCutR * 0.55, uCutR, length(pa - ba * h))) * step(0.03, h) * uCutOn;
    if (bayer4(gl_FragCoord.xy) < k * 0.92) discard;
  }`);
};

// water
const waterU = {
  uTex: { value: waterTex }, uHeight: { value: null }, uTime: U.time, uSea: { value: SEA },
  uDeep: { value: new THREE.Color() }, uShallow: { value: new THREE.Color() }, uFoam: { value: new THREE.Color() },
  uSky: { value: new THREE.Color() }, uSunCol: { value: new THREE.Color() }, uSunDir: { value: new THREE.Vector3(0, 1, 0) },
  uRipples: { value: Array.from({ length: 8 }, () => new THREE.Vector4(0, 0, -99, 0)) },
};
const water = new THREE.Mesh(new THREE.PlaneGeometry(900, 900).rotateX(-Math.PI / 2),
  fogShader({ uniforms: waterU, vertexShader: WATER_VERT, fragmentShader: WATER_FRAG, transparent: true, depthWrite: false }));
water.position.set(W / 2, SEA, D / 2);
water.renderOrder = 1;
scene.add(water);
let rippleIdx = 0;
function ripple(x, z, strength = 1) {
  const r = waterU.uRipples.value[rippleIdx++ % 8];
  r.set(x, z, U.time.value, strength);
}

// low sea mist: three drifting layers, cleared where the ground rises above them
const mistColor = new THREE.Color();
const mistAlpha = { value: 0.2 };
const mists = [[0.12, 0.012, 0.006], [0.55, -0.009, 0.011], [1.0, 0.007, -0.01]].map(([dy, ax, az], k) => {
  const u = { uHeight: { value: null }, uTime: U.time, uAlpha: mistAlpha, uLayer: { value: SEA + dy }, uColor: { value: mistColor }, uDrift: { value: new THREE.Vector2(ax, az) } };
  const m = new THREE.Mesh(new THREE.PlaneGeometry(180, 180).rotateX(-Math.PI / 2),
    new THREE.ShaderMaterial({ uniforms: u, vertexShader: MIST_VERT, fragmentShader: MIST_FRAG, transparent: true, depthWrite: false }));
  m.position.set(W / 2, SEA + dy, D / 2);
  m.renderOrder = 8 + k;
  scene.add(m);
  return m;
});

// hero billboard (Lambert so the dusk light and the wisp's glow touch it like the terrain)
const heroGeo = new THREE.PlaneGeometry(1, 1.5);
heroGeo.translate(0, 0.75, 0);
{ const n = heroGeo.attributes.normal; for (let i = 0; i < n.count; i++) n.setXYZ(i, 0, 0.55, 0.835); }
const heroMat = new THREE.MeshLambertMaterial({ map: heroTex, emissive: 0xffffff, emissiveMap: heroTex, emissiveIntensity: 0.12, alphaTest: 0.5 });
const hero = new THREE.Mesh(heroGeo, heroMat);
hero.rotation.order = 'YXZ';
hero.renderOrder = 2;
scene.add(hero);
function setHeroFrame(f, facing) {
  const w = 1 / 6, e = w * 0.002;
  if (facing >= 0) { heroTex.repeat.x = w - 2 * e; heroTex.offset.x = f * w + e; }
  else { heroTex.repeat.x = -(w - 2 * e); heroTex.offset.x = (f + 1) * w - e; }
}
setHeroFrame(4, 1);
const shadowU = { uA: { value: 0.5 } };
const heroShadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
  new THREE.ShaderMaterial({ uniforms: shadowU, vertexShader: UV_VERT, fragmentShader: SHADOW_FRAG, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
heroShadow.renderOrder = 2;
scene.add(heroShadow);

// pickups: coins (spin strip) and hearts — instanced billboards, + additive halos and light beams for coins
const pickupMat = (map, frames, cells, fps, size, glow, bob) => fogShader({
  uniforms: { uMap: { value: map }, uTime: U.time, uRight: U.right, uFrames: { value: frames }, uCells: { value: cells }, uFps: { value: fps }, uBob: { value: bob }, uSize: { value: size }, uGlow: { value: glow } },
  vertexShader: PICK_VERT, fragmentShader: PICK_FRAG,
});
const coinMat = pickupMat(coinTex, 4, 4, 8, 0.95, 1.2, 0.12);
const heartMat = pickupMat(heartTex, 1, 3, 0, 0.9, 0.5, 0.1);
const glowMat = (frag, size, bob, color, intensity) => fogShader({
  uniforms: { uTime: U.time, uRight: U.right, uFrames: { value: 1 }, uCells: { value: 1 }, uFps: { value: 0 }, uBob: { value: bob }, uSize: { value: size }, uColor: { value: new THREE.Color(...color) }, uIntensity: { value: intensity } },
  vertexShader: PICK_VERT, fragmentShader: frag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
});
const coinHaloMat = glowMat(HALO_FRAG, 2.6, 0.12, [1.0, 0.68, 0.22], 0.35);
const coinBeamMat = glowMat(BEAM_FRAG, 1.0, 0.0, [1.0, 0.78, 0.35], 0.2);
const heartHaloMat = glowMat(HALO_FRAG, 2.2, 0.1, [1.0, 0.25, 0.3], 0.3);
const beamBase = new THREE.PlaneGeometry(0.5, 7); beamBase.translate(0, 3.0, 0);
const quadBase = new THREE.PlaneGeometry(1, 1);
let coinObj = null, heartObj = null;     // rebuilt per island

// particle pools: additive glow + normal-blended dust/smoke
class Particles {
  constructor(max, blending, order) {
    this.max = max; this.n = 0;
    this.p = new Float32Array(max * 3); this.c = new Float32Array(max * 3); this.v = new Float32Array(max * 3);
    this.s = new Float32Array(max); this.a = new Float32Array(max); this.sh = new Float32Array(max);
    this.life = new Float32Array(max); this.full = new Float32Array(max); this.g = new Float32Array(max);
    this.dr = new Float32Array(max); this.s0 = new Float32Array(max); this.s1 = new Float32Array(max); this.a0 = new Float32Array(max);
    this.fl = new Float32Array(max);          // floor height for particles that bounce (casings, chips, leaves); -1e9 = none
    const geo = new THREE.BufferGeometry();
    const mk = (arr, n) => { const at = new THREE.BufferAttribute(arr, n); at.setUsage(THREE.DynamicDrawUsage); return at; };
    this.attrs = [mk(this.p, 3), mk(this.c, 3), mk(this.s, 1), mk(this.a, 1), mk(this.sh, 1)];
    ['position', 'aColor', 'aSize', 'aAlpha', 'aShape'].forEach((nm, i) => geo.setAttribute(nm, this.attrs[i]));
    geo.setDrawRange(0, 0);
    this.geo = geo;
    this.points = new THREE.Points(geo, new THREE.ShaderMaterial({
      uniforms: { uScale: U.pScale, uFogD: U.fogD }, vertexShader: PART_VERT, fragmentShader: PART_FRAG,
      transparent: true, depthWrite: false, blending,
    }));
    this.points.frustumCulled = false;
    this.points.renderOrder = order;
    scene.add(this.points);
  }
  emit(x, y, z, vx, vy, vz, life, s0, s1, col, alpha, grav = 0, drag = 0, shape = 0, floor = false) {
    if (this.n >= this.max) return;
    const i = this.n++, i3 = i * 3;
    this.fl[i] = floor ? Math.max(groundBelow(x, y + 0.2, z), SEA - 0.05) : -1e9;
    this.p[i3] = x; this.p[i3 + 1] = y; this.p[i3 + 2] = z;
    this.v[i3] = vx; this.v[i3 + 1] = vy; this.v[i3 + 2] = vz;
    this.c[i3] = col.r; this.c[i3 + 1] = col.g; this.c[i3 + 2] = col.b;
    this.life[i] = life; this.full[i] = life; this.s0[i] = s0; this.s1[i] = s1; this.s[i] = s0;
    this.a0[i] = alpha; this.a[i] = alpha; this.g[i] = grav; this.dr[i] = drag; this.sh[i] = shape;
  }
  spark(x, y, z, size, col, alpha, shape = 0) { this.emit(x, y, z, 0, 0, 0, 1e-4, size, size, col, alpha, 0, 0, shape); }
  kill(i) {
    const j = --this.n;
    if (i === j) return;
    const i3 = i * 3, j3 = j * 3;
    for (const arr of [this.p, this.c, this.v]) { arr[i3] = arr[j3]; arr[i3 + 1] = arr[j3 + 1]; arr[i3 + 2] = arr[j3 + 2]; }
    for (const arr of [this.s, this.a, this.sh, this.life, this.full, this.g, this.dr, this.s0, this.s1, this.a0, this.fl]) arr[i] = arr[j];
  }
  update(dt) {
    let i = 0;
    while (i < this.n) {
      this.life[i] -= dt;
      if (this.life[i] <= 0) { this.kill(i); continue; }
      const i3 = i * 3, t = this.life[i] / this.full[i];
      const k = 1 / (1 + this.dr[i] * dt);
      this.v[i3 + 1] -= this.g[i] * dt;
      this.v[i3] *= k; this.v[i3 + 1] *= k; this.v[i3 + 2] *= k;
      this.p[i3] += this.v[i3] * dt; this.p[i3 + 1] += this.v[i3 + 1] * dt; this.p[i3 + 2] += this.v[i3 + 2] * dt;
      if (this.p[i3 + 1] < this.fl[i]) {      // tumble to rest on the ground
        this.p[i3 + 1] = this.fl[i];
        this.v[i3 + 1] = Math.abs(this.v[i3 + 1]) > 1.2 ? -this.v[i3 + 1] * 0.35 : 0;
        this.v[i3] *= 0.6; this.v[i3 + 2] *= 0.6;
      }
      this.s[i] = lerp(this.s1[i], this.s0[i], t);
      this.a[i] = this.a0[i] * Math.min(1, t * 3);
      i++;
    }
  }
  flush() {
    this.geo.setDrawRange(0, this.n);
    for (const a of this.attrs) a.needsUpdate = true;
  }
  clear() { this.n = 0; }
}
const glow = new Particles(2400, THREE.AdditiveBlending, 14);
const dust = new Particles(1200, THREE.NormalBlending, 13);

// fireflies (night) + golden motes (dusk): GPU-animated points
const FLIES = 640;
const flyGeo = new THREE.BufferGeometry();
const flyBase = new Float32Array(FLIES * 3), flyPhase = new Float32Array(FLIES), flyKind = new Float32Array(FLIES), flySpeed = new Float32Array(FLIES);
for (let i = 0; i < FLIES; i++) { flyPhase[i] = Math.random(); flyKind[i] = i < 260 ? 1 : 0; flySpeed[i] = rr(0.6, 1.3); }
flyGeo.setAttribute('position', new THREE.BufferAttribute(flyBase, 3));
flyGeo.setAttribute('aPhase', new THREE.BufferAttribute(flyPhase, 1));
flyGeo.setAttribute('aKind', new THREE.BufferAttribute(flyKind, 1));
flyGeo.setAttribute('aSpeed', new THREE.BufferAttribute(flySpeed, 1));
const flyU = { uTime: U.time, uScale: U.pScale, uFogD: U.fogD, uFly: { value: 0 }, uMote: { value: 1 }, uFlyCol: { value: new THREE.Color(0.75, 1.0, 0.35).multiplyScalar(2.2) }, uMoteCol: { value: new THREE.Color(1.0, 0.82, 0.55) } };
const flies = new THREE.Points(flyGeo, new THREE.ShaderMaterial({ uniforms: flyU, vertexShader: FLY_VERT, fragmentShader: FLY_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
flies.frustumCulled = false; flies.renderOrder = 15;
scene.add(flies);

// beacon: pixel flame, goal ring, two lighthouse beams
const flameU = { uTime: U.time, uLevel: { value: 0.1 }, uRight: U.right, uSize: { value: new THREE.Vector2(0.9, 1.4) } };
const flameGeo = new THREE.PlaneGeometry(1, 1); flameGeo.translate(0, 0.5, 0);
const flame = new THREE.Mesh(flameGeo, new THREE.ShaderMaterial({ uniforms: flameU, vertexShader: FLAME_VERT, fragmentShader: FLAME_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
flame.frustumCulled = false; flame.renderOrder = 16;
scene.add(flame);
const ringU = { uTime: U.time, uOn: { value: 0 } };
const ring = new THREE.Mesh(new THREE.RingGeometry(0.6, 1.2, 48, 1), new THREE.ShaderMaterial({ uniforms: ringU, vertexShader: RING_VERT, fragmentShader: RING_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
ring.rotation.x = -Math.PI / 2; ring.renderOrder = 7;
scene.add(ring);
const lbeamGeo = new THREE.CylinderGeometry(6.5, 0.28, 46, 24, 1, true);
lbeamGeo.translate(0, 23, 0); lbeamGeo.rotateZ(-Math.PI / 2);
const lbeamU = { uI: { value: 0 }, uColor: { value: new THREE.Color(1.0, 0.82, 0.5) } };
const lbeamMat = new THREE.ShaderMaterial({ uniforms: lbeamU, vertexShader: LBEAM_VERT, fragmentShader: LBEAM_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
const lbeams = new THREE.Group();
for (let k = 0; k < 2; k++) { const m = new THREE.Mesh(lbeamGeo, lbeamMat); m.rotation.y = k * Math.PI; m.frustumCulled = false; m.renderOrder = 17; lbeams.add(m); }
scene.add(lbeams);

/* -----------------------------------------------------------------------------
   8 · Post-processing: bloom → tilt-shift → tone map → aberration/grain/glitch
----------------------------------------------------------------------------- */
const composer = new EffectComposer(renderer);
const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.6, 0.55, 0.8);
const dofH = new ShaderPass(DOFShader), dofV = new ShaderPass(DOFShader);
dofH.uniforms.uDir.value.set(1, 0); dofV.uniforms.uDir.value.set(0, 1);
const finalPass = new ShaderPass(FinalShader);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(bloom);
composer.addPass(dofH);
composer.addPass(dofV);
composer.addPass(new OutputPass());
composer.addPass(finalPass);
const FX = finalPass.uniforms;

const perf = { scale: 0.8, acc: 0, frames: 0, cool: 0 };
function resize() {
  const w = Math.max(1, innerWidth), h = Math.max(1, innerHeight);
  const pr = Math.min(window.devicePixelRatio || 1, 1.75, 1080/Math.max(w,h)) * perf.scale;
  renderer.setPixelRatio(pr);
  renderer.setSize(w, h, false);
  composer.setPixelRatio(pr);
  composer.setSize(w, h);
  camera.aspect = w / h;
  camera.fov = camera.aspect < 1 ? Math.min(72, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(19)) / camera.aspect))) : 46;
  camera.updateProjectionMatrix();
  const rw = Math.round(w * pr), rh = Math.round(h * pr);
  dofH.uniforms.uRes.value.set(rw, rh); dofV.uniforms.uRes.value.set(rw, rh); FX.uRes.value.set(rw, rh);
  U.pScale.value = rh / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
}
addEventListener('resize', resize);
resize();

/* -----------------------------------------------------------------------------
   9 · Palettes: dusk → twilight → night, and the dawn the beacon brings
       (every visual lever lives here and is blended continuously)
----------------------------------------------------------------------------- */
const PALETTES = {
  dusk: {
    skyTop: '#2c3c7e', skyHor: '#ffaf78', fog: '#d99a86', fogD: 0.0155,
    keyCol: '#ffc48a', keyI: 2.7, sunEl: 0.16, sunVis: 1, moonMix: 0, hemiSky: '#ffd9bf', hemiGnd: '#4b3552', hemiI: 1.6,
    deep: '#1c4277', shallow: '#3fb2c2', foam: '#fff2dc', wSky: '#f6b48e', bloom: 0.5, exposure: 1.0,
    motes: 1, flies: 0, mist: 0.16, mistCol: '#ffd6c2', stars: 0, wisp: 0.3, grain: 0.045, vig: 0.32,
    gain: [1.03, 1.0, 0.95], lift: [0.03, 0.0, 0.04], coinGlow: 1.1, beam: 0.12, halo: 0.3,
  },
  twi: {
    skyTop: '#1b2056', skyHor: '#d0687c', fog: '#7a4a72', fogD: 0.021,
    keyCol: '#ff8a66', keyI: 1.5, sunEl: 0.015, sunVis: 0.85, moonMix: 0.25, hemiSky: '#a58ed6', hemiGnd: '#2a2038', hemiI: 1.1,
    deep: '#15294f', shallow: '#2d7c98', foam: '#f7dbe9', wSky: '#c27a96', bloom: 0.68, exposure: 1.02,
    motes: 0.45, flies: 0.55, mist: 0.24, mistCol: '#b88fbd', stars: 0.35, wisp: 1, grain: 0.055, vig: 0.4,
    gain: [1.0, 0.97, 1.02], lift: [0.04, 0.0, 0.06], coinGlow: 1.6, beam: 0.25, halo: 0.42,
  },
  night: {
    skyTop: '#050a1d', skyHor: '#222a5e', fog: '#1b2042', fogD: 0.026,
    keyCol: '#9fb6ff', keyI: 1.05, sunEl: -0.25, sunVis: 0, moonMix: 1, hemiSky: '#4d5ea8', hemiGnd: '#0c0a17', hemiI: 0.66,
    deep: '#0b1631', shallow: '#1b4e78', foam: '#8f9fd8', wSky: '#2c3570', bloom: 0.92, exposure: 1.08,
    motes: 0.12, flies: 1, mist: 0.3, mistCol: '#6170ae', stars: 1, wisp: 1, grain: 0.07, vig: 0.5,
    gain: [0.95, 0.98, 1.07], lift: [0.02, 0.0, 0.07], coinGlow: 2.2, beam: 0.38, halo: 0.55,
  },
  dawn: {
    skyTop: '#3b66b9', skyHor: '#ffd2a2', fog: '#efc0aa', fogD: 0.0135,
    keyCol: '#ffe2ae', keyI: 3.0, sunEl: 0.2, sunVis: 1, moonMix: 0, hemiSky: '#ffe8d0', hemiGnd: '#5c4c62', hemiI: 1.85,
    deep: '#255290', shallow: '#56cad2', foam: '#ffffff', wSky: '#ffd2b2', bloom: 0.45, exposure: 1.0,
    motes: 1, flies: 0.15, mist: 0.22, mistCol: '#fff0e4', stars: 0, wisp: 0.4, grain: 0.04, vig: 0.28,
    gain: [1.04, 1.0, 0.96], lift: [0.03, 0.01, 0.02], coinGlow: 1.0, beam: 0.1, halo: 0.25,
  },
};
const prepPal = (p) => { const o = {}; for (const k in p) o[k] = typeof p[k] === 'string' ? new THREE.Color(p[k]) : Array.isArray(p[k]) ? p[k].slice() : p[k]; return o; };
const PAL = {}; for (const k in PALETTES) PAL[k] = prepPal(PALETTES[k]);
const pal = prepPal(PALETTES.dusk);
function mixInto(out, a, b, t) {
  for (const k in out) {
    const v = out[k];
    if (v && v.isColor) v.copy(a[k]).lerp(b[k], t);
    else if (Array.isArray(v)) for (let i = 0; i < v.length; i++) v[i] = lerp(a[k][i], b[k][i], t);
    else out[k] = lerp(a[k], b[k], t);
  }
}
const sunDir = new THREE.Vector3(), moonDir = new THREE.Vector3(), keyDir = new THREE.Vector3();
function applyPalette(tod, dawn) {
  if (tod < 0.5) mixInto(pal, PAL.dusk, PAL.twi, smooth(0, 1, tod / 0.5));
  else mixInto(pal, PAL.twi, PAL.night, smooth(0, 1, (tod - 0.5) / 0.5));
  if (dawn > 0.001) mixInto(pal, pal, PAL.dawn, dawn);
  const az = G.sunAz;
  sunDir.set(Math.cos(pal.sunEl) * Math.cos(az), Math.sin(pal.sunEl), Math.cos(pal.sunEl) * Math.sin(az));
  keyDir.copy(sunDir).lerp(moonDir, pal.moonMix).normalize();
  scene.fog.color.copy(pal.fog); scene.fog.density = pal.fogD; U.fogD.value = pal.fogD;
  skyU.uTop.value.copy(pal.skyTop); skyU.uHorizon.value.copy(pal.skyHor); skyU.uBottom.value.copy(pal.fog);
  skyU.uSunCol.value.copy(pal.keyCol); skyU.uSunDir.value.copy(sunDir); skyU.uSunVis.value = pal.sunVis;
  skyU.uNight.value = pal.stars; skyU.uMoonDir.value.copy(moonDir);
  keyLight.color.copy(pal.keyCol); keyLight.intensity = pal.keyI;
  keyLight.position.copy(keyLight.target.position).addScaledVector(keyDir, 60);
  hemi.color.copy(pal.hemiSky); hemi.groundColor.copy(pal.hemiGnd); hemi.intensity = pal.hemiI;
  waterU.uDeep.value.copy(pal.deep); waterU.uShallow.value.copy(pal.shallow); waterU.uFoam.value.copy(pal.foam);
  waterU.uSky.value.copy(pal.wSky); waterU.uSunCol.value.copy(pal.keyCol); waterU.uSunDir.value.copy(keyDir);
  renderer.toneMappingExposure = pal.exposure;
  mistColor.copy(pal.mistCol); mistAlpha.value = pal.mist;
  flyU.uFly.value = pal.flies; flyU.uMote.value = pal.motes;
  coinMat.uniforms.uGlow.value = pal.coinGlow;
  coinBeamMat.uniforms.uIntensity.value = pal.beam;
  coinHaloMat.uniforms.uIntensity.value = pal.halo;
  heartHaloMat.uniforms.uIntensity.value = pal.halo * 0.8;
  FX.uGrain.value = pal.grain * (REDUCED ? 0.5 : 1);
  FX.uGain.value.setRGB(pal.gain[0], pal.gain[1], pal.gain[2]);
  FX.uLift.value.setRGB(pal.lift[0], pal.lift[1], pal.lift[2]);
}

/* -----------------------------------------------------------------------------
   10 · State
----------------------------------------------------------------------------- */
const DEFAULT_SEED = 1337;
const G = {
  state: 'loading', time: 0, play: 0, collected: 0, total: 20, hits: 0, seed: DEFAULT_SEED, sunAz: 0,
  tod: 0.04, todT: 0.04, dawn: 0, danger: 0, dangerT: 0, hurt: 0, blip: 0, blipT: 8, flash: 0, fade: 0, desat: 0, bars: 0.08,
  all: false, endT: 0, timeScale: 1, idle: 0, combo: 0, comboT: 0, beatT: 0, toastT: 0, focus: 0.5,
  firstShade: false, warnedWater: false, toastP: 0, best: null, newBest: false, timerT: 0, mmT: 0,
  hitstop: 0, kills: 0, spawnT: 2, wardenSpawned: false, wardenDown: false, warden: null, wardenT: 1.5, bossCam: 0,
};
let world = null, heightTex = null;
const C = {
  gold: new THREE.Color(1.0, 0.72, 0.18).multiplyScalar(2.4), goldHot: new THREE.Color(1, 0.95, 0.7).multiplyScalar(3),
  ember: new THREE.Color(1.0, 0.42, 0.1).multiplyScalar(3), wispCore: new THREE.Color(1, 0.94, 0.72).multiplyScalar(4),
  wispHalo: new THREE.Color(1, 0.7, 0.28).multiplyScalar(1.5), eye: new THREE.Color(1, 0.3, 0.95).multiplyScalar(4),
  eyeGlow: new THREE.Color(0.7, 0.15, 1).multiplyScalar(1.3), smoke: new THREE.Color(0.05, 0.02, 0.09),
  spray: new THREE.Color(0.82, 0.93, 1.0), sand: new THREE.Color('#d9bf86'), dirt: new THREE.Color('#7a5236'),
  heart: new THREE.Color(1, 0.3, 0.35).multiplyScalar(2.6), violet: new THREE.Color(0.75, 0.25, 1).multiplyScalar(2.6),
};
const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3(), tmpC = new THREE.Vector3(), tmpD = new THREE.Vector3(), tmpE = new THREE.Vector3();

/* -----------------------------------------------------------------------------
   11 · Voxel queries
----------------------------------------------------------------------------- */
function blockAt(x, y, z) {
  if (y < 0) return B.STONE;
  if (x < 0 || z < 0 || x >= W || z >= D || y >= H) return 0;
  return world.vox[x + W * (z + D * y)];
}
const solidAt = (x, y, z) => blockAt(x, y, z) !== 0;
function boxSolid(x0f, y0f, z0f, x1f, y1f, z1f) {
  const x0 = Math.floor(x0f), x1 = Math.floor(x1f - 1e-7), y0 = Math.floor(y0f), y1 = Math.floor(y1f - 1e-7), z0 = Math.floor(z0f), z1 = Math.floor(z1f - 1e-7);
  for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) if (solidAt(x, y, z)) return true;
  return false;
}
const PL = { halfW: 0.27, height: 1.35, speed: 4.7, accG: 16, accA: 5, grav: 30, jumpV: 11.6 };
const hits = (px, py, pz) => boxSolid(px - PL.halfW, py, pz - PL.halfW, px + PL.halfW, py + PL.height, pz + PL.halfW);
function groundBelow(px, py, pz) {
  const x = Math.floor(px), z = Math.floor(pz);
  for (let y = Math.min(H - 1, Math.floor(py)); y >= 0; y--) if (solidAt(x, y, z)) return y + 1;
  return 0;
}
function terrainTop(px, pz) {
  const x = Math.floor(px), z = Math.floor(pz);
  if (x < 0 || z < 0 || x >= W || z >= D) return 1;
  return world.hgt[x + z * W];
}
function rayFree(o, d, maxT) {
  for (let t = 0.9; t < maxT; t += 0.2) {
    const b = blockAt(Math.floor(o.x + d.x * t), Math.floor(o.y + d.y * t), Math.floor(o.z + d.z * t));
    if (b && b !== B.LEAVES) return Math.max(2.6, t - 0.45);
  }
  return maxT;
}

/* -----------------------------------------------------------------------------
   12 · Sound: procedural WebAudio (sea, wind, night drone, chimes)
----------------------------------------------------------------------------- */
const SFX = {
  ctx: null, out: null, muted: false, beds: null, noiseBuf: null,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      const ctx = new AC(); this.ctx = ctx;
      const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3.5;
      this.out = ctx.createGain(); this.out.gain.value = this.muted ? 0 : 0.85;
      this.out.connect(comp); comp.connect(ctx.destination);
      const len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate), ch = buf.getChannelData(0);
      for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
      this.noiseBuf = buf;
      const bed = (rate, type, freq, q, gain, lfoHz, lfoAmt) => {
        const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.playbackRate.value = rate;
        const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
        const g = ctx.createGain(); g.gain.value = gain;
        const l = ctx.createOscillator(); l.frequency.value = lfoHz; const lg = ctx.createGain(); lg.gain.value = lfoAmt;
        l.connect(lg); lg.connect(g.gain);
        s.connect(f); f.connect(g); g.connect(this.out); s.start(); l.start();
        return g;
      };
      const waves = bed(1, 'lowpass', 520, 0.4, 0.12, 0.09, 0.08);
      const wind = bed(0.6, 'bandpass', 700, 0.7, 0.025, 0.05, 0.02);
      const droneG = ctx.createGain(); droneG.gain.value = 0;
      const dl = ctx.createBiquadFilter(); dl.type = 'lowpass'; dl.frequency.value = 420;
      [55, 82.41, 110].forEach((f, i) => {
        const o = ctx.createOscillator(); o.type = i === 1 ? 'sawtooth' : 'triangle'; o.frequency.value = f; o.detune.value = (i - 1) * 6;
        const og = ctx.createGain(); og.gain.value = i === 1 ? 0.25 : 0.5; o.connect(og); og.connect(dl); o.start();
      });
      dl.connect(droneG); droneG.connect(this.out);
      this.beds = { waves, wind, droneG };
    } catch (e) { this.ctx = null; }
  },
  setMuted(m) {
    this.muted = m;
    if (this.out) this.out.gain.setTargetAtTime(m ? 0 : 0.85, this.ctx.currentTime, 0.05);
  },
  ambience(night, danger) {
    if (!this.beds) return;
    const t = this.ctx.currentTime;
    this.beds.droneG.gain.setTargetAtTime(0.015 + night * 0.05 + danger * 0.05, t, 0.8);
    this.beds.wind.gain.setTargetAtTime(0.02 + night * 0.03, t, 1.2);
  },
  tone(freq, dur, type = 'square', vol = 0.08, slide = 0, delay = 0) {
    const c = this.ctx; if (!c || this.muted) return;
    const t = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.out);
    o.start(t); o.stop(t + dur + 0.05);
  },
  // filtered noise whose centre frequency slides: whooshes, zips, swooshes
  sweep(dur, f0, f1, q = 1.2, vol = 0.06, type = 'bandpass', delay = 0) {
    const c = this.ctx; if (!c || this.muted || !this.noiseBuf) return;
    const t = c.currentTime + delay;
    const s = c.createBufferSource(); s.buffer = this.noiseBuf;
    const f = c.createBiquadFilter(); f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(this.out);
    s.start(t, Math.random()); s.stop(t + dur + 0.05);
  },
  hiss(dur, freq, q = 1, vol = 0.08, type = 'bandpass', delay = 0) {
    const c = this.ctx; if (!c || this.muted || !this.noiseBuf) return;
    const t = c.currentTime + delay;
    const s = c.createBufferSource(); s.buffer = this.noiseBuf; s.playbackRate.value = 0.8 + Math.random() * 0.4;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(this.out);
    s.start(t, Math.random()); s.stop(t + dur + 0.05);
  },
  coin(k) { const m = Math.pow(2, Math.min(k, 7) / 12); this.tone(988 * m, 0.08, 'square', 0.05); this.tone(1319 * m, 0.24, 'square', 0.045, 0, 0.07); this.tone(2637 * m, 0.4, 'sine', 0.025, 0, 0.07); },
  jump() { this.tone(240, 0.14, 'square', 0.025, 480); },
  land(v) { this.hiss(0.09, 260, 0.8, Math.min(0.12, 0.03 + v * 0.006), 'lowpass'); },
  step(s) { this.hiss(0.04, s === 'wood' ? 1900 : s === 'water' ? 800 : s === 'stone' ? 2400 : 1300, 1.4, s === 'water' ? 0.05 : 0.028); },
  splash() { this.hiss(0.6, 1100, 0.5, 0.16); this.hiss(0.3, 380, 0.8, 0.12, 'lowpass', 0.04); },
  hurt() { this.tone(330, 0.34, 'sawtooth', 0.07, 70); this.hiss(0.25, 650, 0.7, 0.1); },
  heal() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.2, 'triangle', 0.05, 0, i * 0.07)); },
  beat(s) { this.tone(64, 0.13, 'sine', 0.2 * s, 42); this.tone(58, 0.13, 'sine', 0.14 * s, 40, 0.18); },
  rise() { this.hiss(1.4, 240, 3, 0.05); this.tone(98, 1.2, 'sine', 0.04, 49); },
  ignite() { this.hiss(1.6, 500, 0.4, 0.14, 'lowpass'); [262, 330, 392, 523, 659].forEach((f, i) => this.tone(f, 2.2, 'triangle', 0.045, 0, 0.15 + i * 0.11)); this.tone(1047, 2.6, 'sine', 0.03, 0, 0.8); },
  die() { this.tone(220, 1.4, 'sawtooth', 0.07, 40); this.hiss(1.2, 300, 0.6, 0.1, 'lowpass'); },
  ui() { this.tone(660, 0.07, 'square', 0.03); },
  // ── combat ──
  swing(h = 1) { const k = 0.6 + h * 0.5; this.sweep(0.09 + 0.07 * h, 2600 / k, 480 / k, 1.3, 0.04 + 0.022 * h); },
  hit(p = 1, crit = false) {
    const j = 1 + (Math.random() - 0.5) * 0.2;
    this.tone(150 * j - p * 18, 0.12 + p * 0.03, 'square', 0.05 + p * 0.025, 45);
    this.hiss(0.07, 1900 * j, 0.9, 0.07 + p * 0.03);
    if (crit) { this.tone(1500, 0.14, 'square', 0.035, 2600); this.hiss(0.1, 4200, 2, 0.05); }
  },
  shot(id, k = 1) {
    const j = 1 + (Math.random() - 0.5) * 0.12;
    switch (id) {
      case 'sling': this.sweep(0.13, 900, 2800, 2, 0.06); this.tone(330 * j, 0.1, 'triangle', 0.04, 170); break;
      case 'bow': this.tone((150 + 140 * k) * j, 0.24, 'triangle', 0.07, 85); this.sweep(0.2, 2800, 650, 1.6, 0.025 + 0.045 * k); break;
      case 'xbow': this.tone(115 * j, 0.11, 'square', 0.06, 60); this.sweep(0.1, 3200, 1200, 2, 0.06); this.tone(1900, 0.3, 'sine', 0.025, 2700, 0.02); break;
      case 'pistol': this.hiss(0.2, 1500 * j, 0.5, 0.2); this.tone(190 * j, 0.12, 'square', 0.08, 50); break;
      case 'shotgun': this.hiss(0.45, 650, 0.4, 0.3, 'lowpass'); this.tone(88, 0.28, 'sawtooth', 0.12, 34); this.hiss(0.12, 2600, 0.6, 0.12);
        this.tone(900, 0.04, 'square', 0.03, 0, 0.3); this.tone(620, 0.05, 'square', 0.03, 0, 0.38); break;   // pump
      case 'smg': this.hiss(0.06, 2100 * j, 0.8, 0.09); this.tone(230 * j, 0.05, 'square', 0.035, 90); break;
      case 'saw': this.tone(520 * j, 0.25, 'sawtooth', 0.035, 1500); this.sweep(0.22, 1200, 4200, 4, 0.05); break;
      case 'bomb': this.tone(125 * j, 0.22, 'sine', 0.17, 48); this.hiss(0.28, 420, 0.5, 0.15, 'lowpass'); break;
      case 'tesla': this.tone(1300 * j, 0.18, 'sawtooth', 0.045, 180); this.hiss(0.22, 3600, 2, 0.09); this.tone(62, 0.22, 'square', 0.04); break;
      default: this.hiss(0.1, 1600, 0.6, 0.1);
    }
  },
  explode() { this.hiss(1.2, 360, 0.4, 0.34, 'lowpass'); this.tone(68, 0.7, 'sine', 0.24, 28); this.hiss(0.3, 2100, 0.5, 0.12); },
  ricochet(saw) { const f = saw ? 2300 : 2700 + Math.random() * 1600; this.tone(f, 0.24, 'sine', 0.035, f * 0.45); if (saw) this.hiss(0.08, 5000, 2, 0.05); },
  thunk() { this.tone(150, 0.08, 'square', 0.05, 70); this.hiss(0.05, 900, 1, 0.05); },
  tick() { this.tone(1700 + Math.random() * 700, 0.03, 'square', 0.022); },
  tock() { this.tone(250 + Math.random() * 70, 0.08, 'triangle', 0.07, 150); },
  reload() { this.tone(880, 0.04, 'square', 0.03); this.tone(660, 0.05, 'square', 0.03, 0, 0.13); },
  reloadEnd() { this.tone(520, 0.05, 'square', 0.04); this.tone(1040, 0.06, 'square', 0.035, 0, 0.06); },
  empty() { this.tone(2300, 0.025, 'square', 0.03); },
  equip() { this.sweep(0.12, 1300, 3400, 3, 0.03); this.tone(880, 0.05, 'triangle', 0.03, 0, 0.05); },
  loot() { [392, 523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.2, 'square', 0.032, 0, i * 0.05)); this.tone(2093, 0.5, 'sine', 0.025, 0, 0.26); },
  draw() { this.tone(85, 0.7, 'sawtooth', 0.018, 160); },
  dash() { this.sweep(0.26, 600, 3800, 1.5, 0.08); },
  slam() { this.tone(52, 0.55, 'sine', 0.32, 28); this.hiss(0.55, 280, 0.5, 0.26, 'lowpass'); this.hiss(0.15, 1500, 0.6, 0.1); },
  timber() { this.hiss(0.1, 2700, 1, 0.13); this.tone(105, 0.9, 'sawtooth', 0.035, 55, 0.05); this.hiss(0.7, 480, 0.5, 0.16, 'lowpass', 0.45); },
  foeDie(big) { this.sweep(big ? 1.6 : 0.5, 1900, 180, 2, big ? 0.15 : 0.07); this.tone(big ? 78 : 290, big ? 1.6 : 0.4, 'sawtooth', 0.05, big ? 28 : 80); },
  roar() { this.tone(58, 1.7, 'sawtooth', 0.12, 36); this.tone(87, 1.5, 'sawtooth', 0.08, 44, 0.06); this.hiss(1.6, 280, 0.7, 0.2, 'lowpass'); },
  orb() { this.tone(380, 0.42, 'sine', 0.05, 920); this.tone(190, 0.42, 'triangle', 0.03, 460); },
  soul() { this.tone(1047, 0.15, 'sine', 0.04); this.tone(1568, 0.26, 'sine', 0.035, 0, 0.06); },
  overheat() { this.hiss(0.9, 3300, 0.6, 0.11); this.tone(1400, 0.45, 'square', 0.03, 380); },
  parry() { this.tone(1900, 0.18, 'triangle', 0.05, 2700); this.tone(2850, 0.26, 'sine', 0.03, 0, 0.03); },
  windup() { this.tone(70, 1.0, 'sawtooth', 0.07, 210); this.sweep(1.0, 300, 2400, 3, 0.07); },
  // the prism hums while it fires: detuned saws through a wobbling band-pass, faded in and out
  beamG: null,
  beam(on) {
    const c = this.ctx; if (!c) return;
    if (!this.beamG) {
      const g = c.createGain(); g.gain.value = 0;
      const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 2.2;
      [221, 224.5, 110.6].forEach((fr, i) => { const o = c.createOscillator(); o.type = i === 2 ? 'square' : 'sawtooth'; o.frequency.value = fr; const og = c.createGain(); og.gain.value = i === 2 ? 0.35 : 0.5; o.connect(og); og.connect(f); o.start(); });
      const l = c.createOscillator(); l.frequency.value = 7; const lg = c.createGain(); lg.gain.value = 260; l.connect(lg); lg.connect(f.frequency); l.start();
      f.connect(g); g.connect(this.out);
      this.beamG = g;
    }
    this.beamG.gain.setTargetAtTime(on && !this.muted ? 0.07 : 0, c.currentTime, on ? 0.04 : 0.08);
  },
};

/* -----------------------------------------------------------------------------
   13 · HUD
----------------------------------------------------------------------------- */
const hud = {
  root: $('hud'), hearts: [...document.querySelectorAll('#hearts .heart')], coins: $('coins'), coinN: $('coinN'), coinT: $('coinT'),
  timer: $('timer'), toast: $('toast'), mm: $('minimap'),
};
const mmCtx = hud.mm.getContext('2d');
const mmBase = document.createElement('canvas'); mmBase.width = W; mmBase.height = D;
const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function toast(text, ms = 2600, warn = false, prio = 1) {
  if (G.toastT > 0 && prio < G.toastP) return;
  G.toastP = prio;
  const t = hud.toast;
  t.textContent = text; t.classList.toggle('warn', warn);
  t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
  G.toastT = ms / 1000;
}
function updateHearts(hit) {
  hud.hearts.forEach((el, i) => {
    el.dataset.v = String(clamp(player.hp - i * 2, 0, 2));
    if (hit) { el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit'); }
  });
}
function setCoinsHud(bump) {
  hud.coinN.textContent = String(G.collected);
  if (bump) { hud.coins.classList.remove('bump'); void hud.coins.offsetWidth; hud.coins.classList.add('bump'); }
}
const MM_COL = { water: '#16305c', shallow: '#2c6e9c' };
MM_COL[B.SAND] = '#d8bc7c'; MM_COL[B.GRASS] = '#3f8a3f'; MM_COL[B.DIRT] = '#8c5e38'; MM_COL[B.STONE] = '#7c8292';
MM_COL[B.PLANK] = '#b07f48'; MM_COL[B.LEAVES] = '#24613a'; MM_COL[B.BRICK] = '#b04a3a'; MM_COL[B.BARK] = '#6a4a30';
function drawMinimapBase() {
  const c = mmBase.getContext('2d');
  for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) {
    let top = 0, ty = -1;
    for (let y = H - 1; y >= 0; y--) { const b = world.vox[x + W * (z + D * y)]; if (b) { top = b; ty = y; break; } }
    const wet = ty + 1 < SEA && world.kind[x + z * W] !== 6;
    c.fillStyle = wet ? (ty + 1 <= 2 ? MM_COL.water : MM_COL.shallow) : (MM_COL[top] || '#000');
    c.fillRect(x, z, 1, 1);
  }
}
function drawMinimap() {
  mmCtx.imageSmoothingEnabled = false;
  mmCtx.drawImage(mmBase, 0, 0);
  const blink = Math.floor(G.time * 3) % 2 === 0;
  for (const L of loot) {                 // weapons: a small cross in the colour of their rarity
    if (!L.alive) continue;
    const x = Math.floor(L.x), z = Math.floor(L.z);
    mmCtx.fillStyle = RAR[WEAPONS[L.id].rar].css;
    mmCtx.fillRect(x - 1, z, 3, 1); mmCtx.fillRect(x, z - 1, 1, 3);
  }
  mmCtx.fillStyle = '#ffd246';
  for (const c of coins) if (c.alive) mmCtx.fillRect(Math.floor(c.x) - 1, Math.floor(c.z) - 1, 2, 2);
  mmCtx.fillStyle = '#ff6e5c';
  for (const h of heartsP) if (h.alive) mmCtx.fillRect(Math.floor(h.x) - 1, Math.floor(h.z) - 1, 2, 2);
  if (G.all && G.wardenDown && blink) { mmCtx.fillStyle = '#fff09a'; mmCtx.fillRect(Math.floor(world.ring.x) - 1, Math.floor(world.ring.z) - 1, 3, 3); }
  for (const f of foes) {
    if (!foeAlive(f)) continue;
    const hd = f.segs[0], x = Math.floor(hd.x), z = Math.floor(hd.z);
    if (f.def.boss) { mmCtx.fillStyle = blink ? '#e07bff' : '#9b3cff'; mmCtx.fillRect(x - 2, z - 2, 4, 4); continue; }
    if (Math.hypot(hd.x - player.pos.x, hd.z - player.pos.z) > 16) continue;
    mmCtx.fillStyle = f.type === 'imp' ? '#ff5468' : '#ff4fd8';
    mmCtx.fillRect(x - 1, z - 1, 2, 2);
  }
  const px = Math.floor(player.pos.x), pz = Math.floor(player.pos.z);
  mmCtx.fillStyle = 'rgba(255,255,255,0.55)';
  for (let k = 2; k <= 4; k++) mmCtx.fillRect(Math.floor(player.pos.x - Math.sin(rig.yaw) * k), Math.floor(player.pos.z - Math.cos(rig.yaw) * k), 1, 1);
  mmCtx.fillStyle = '#ffffff';
  mmCtx.fillRect(px - 1, pz - 1, 2, 2);
}

/* -----------------------------------------------------------------------------
   14 · Input: keyboard, mouse orbit, touch stick, gamepad
----------------------------------------------------------------------------- */
const keys = new Set();
const pad = { mx: 0, my: 0, cx: 0, cy: 0, a: false, start: false, lb: false, rb: false, y: false };
const touch = { stickId: null, sx: 0, sy: 0, vx: 0, vy: 0, camId: null, cx: 0, cy: 0, ct: 0 };
const drag = { active: false, id: null, x: 0, y: 0, t: 0, vy: 0, vp: 0 };
// attack is one held button fed by four sources; pressed / released are edges the combat update consumes
const input = { atk: false, pressed: false, released: false, src: { mouse: false, key: false, touch: false, pad: false } };
function setAttack(src, on) {
  if (input.src[src] === on) return;
  input.src[src] = on;
  const any = input.src.mouse || input.src.key || input.src.touch || input.src.pad;
  if (any && !input.atk) input.pressed = true;
  if (!any && input.atk) input.released = true;
  input.atk = any;
}
function releaseAll() {
  for (const k in input.src) input.src[k] = false;
  if (input.atk) input.released = true;
  input.atk = false;
}
function onJumpPress() { if (G.state === 'play') { player.jumpBuf = 0.13; player.jumpHeld = true; } }
function onJumpRelease() { player.jumpHeld = false; }
const SLOT_KEYS = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0'];
const isAtkKey = (c) => c === 'KeyJ' || c === 'KeyK';
addEventListener('keydown', (e) => {
  const c = e.code;
  if (c === 'Space' || c.startsWith('Arrow') || (c === 'Tab' && G.state === 'play')) e.preventDefault();
  keys.add(c);
  if (isAtkKey(c) && G.state === 'play') setAttack('key', true);
  if (e.repeat) return;
  if (c === 'KeyM') toggleMute();
  else if (c === 'KeyF') toggleFullscreen();
  if (G.state === 'title' && (c === 'Enter' || c === 'Space' || c === 'NumpadEnter')) { startGame(); return; }
  if (G.state === 'play') {
    if (c === 'Space') onJumpPress();
    else if (c === 'Escape' || c === 'KeyP') setPaused(true);
    else if (c === 'KeyQ') cycleWeapon(-1);
    else if (c === 'KeyE' || c === 'Tab') cycleWeapon(e.shiftKey ? -1 : 1);
    else if (c === 'KeyR') startReload();
    else { const k = SLOT_KEYS.indexOf(c); if (k >= 0 && combat.arsenal[k]) equip(combat.arsenal[k]); }
  } else if (G.state === 'paused') {
    if (c === 'Escape' || c === 'KeyP') setPaused(false);
  } else if (!$('scrEnd').hidden && (c === 'Enter' || c === 'KeyR')) restart(false);
});
addEventListener('keyup', (e) => {
  keys.delete(e.code);
  if (e.code === 'Space') onJumpRelease();
  if (isAtkKey(e.code)) setAttack('key', keys.has('KeyJ') || keys.has('KeyK'));
});
addEventListener('blur', () => { keys.clear(); onJumpRelease(); releaseAll(); mouseMask = 0; drag.active = false; });

function orbitBy(dx, dy, sens, now) {
  const yv = -dx * sens, pv = dy * sens * 0.7;
  rig.yawT += yv;
  rig.pitchT = clamp(rig.pitchT + pv, 0.3, 1.15);
  const dt = Math.max(0.008, (now - drag.t) / 1000);
  drag.vy = lerp(drag.vy, yv / dt, 0.5); drag.vp = lerp(drag.vp, pv / dt, 0.5);
  drag.t = now;
}
// mouse: left button attacks, right / middle drag orbits the camera, the cursor aims (twin-stick style)
let mouseMask = 0;
function mouseButtons(e) {
  const m = e.buttons | 0, cam = (m & 6) !== 0, wasCam = (mouseMask & 6) !== 0;
  setAttack('mouse', (m & 1) !== 0 && G.state === 'play');
  if (cam && !wasCam) { drag.active = true; drag.id = e.pointerId; drag.x = e.clientX; drag.y = e.clientY; drag.t = e.timeStamp; drag.vy = drag.vp = 0; }
  else if (!cam && wasCam && drag.active) { drag.active = false; rig.spin = clamp(drag.vy, -3, 3); rig.pspin = clamp(drag.vp, -1.5, 1.5); }
  mouseMask = m;
}
function cursorAim(e) { aim.cx = e.clientX; aim.cy = e.clientY; aim.cursorT = 3.5; }
canvas.addEventListener('pointerdown', (e) => {
  if (G.state === 'title' && e.pointerType === 'touch') return;
  if (e.pointerType === 'touch' && G.state === 'play') {
    if (e.clientX < innerWidth * 0.5 && touch.stickId === null) {
      touch.stickId = e.pointerId; touch.sx = e.clientX; touch.sy = e.clientY; touch.vx = touch.vy = 0;
      const st = $('stick'); st.style.left = `${e.clientX}px`; st.style.top = `${e.clientY}px`; st.classList.add('on');
      $('knob').style.transform = 'translate(0px, 0px)';
    } else if (touch.camId === null) {
      touch.camId = e.pointerId; touch.cx = e.clientX; touch.cy = e.clientY; drag.t = e.timeStamp; drag.vy = drag.vp = 0;
    }
    try{canvas.setPointerCapture(e.pointerId)}catch(err){/* synthetic-pointer test */}
    return;
  }
  if (e.pointerType !== 'touch') {
    cursorAim(e);
    mouseButtons(e);
    try{canvas.setPointerCapture(e.pointerId)}catch(err){/* synthetic-pointer test */}
    canvas.focus();
  }
});
canvas.addEventListener('pointermove', (e) => {
  if (e.pointerId === touch.stickId) {
    let dx = e.clientX - touch.sx, dy = e.clientY - touch.sy;
    const L = Math.hypot(dx, dy), R = 56;
    if (L > R) { dx *= R / L; dy *= R / L; }
    touch.vx = dx / R; touch.vy = dy / R;
    $('knob').style.transform = `translate(${dx}px, ${dy}px)`;
  } else if (e.pointerId === touch.camId) {
    orbitBy(e.clientX - touch.cx, e.clientY - touch.cy, 0.008, e.timeStamp);
    touch.cx = e.clientX; touch.cy = e.clientY;
  } else if (e.pointerType !== 'touch') {
    if ((e.buttons | 0) !== mouseMask) mouseButtons(e);      // chorded buttons arrive as moves
    if (drag.active && e.pointerId === drag.id) {
      orbitBy(e.clientX - drag.x, e.clientY - drag.y, 0.006, e.timeStamp);
      drag.x = e.clientX; drag.y = e.clientY;
    } else cursorAim(e);
  }
});
function endPointer(e) {
  if (e.pointerId === touch.stickId) { touch.stickId = null; touch.vx = touch.vy = 0; $('stick').classList.remove('on'); }
  else if (e.pointerId === touch.camId) { touch.camId = null; rig.spin = clamp(drag.vy, -3, 3); rig.pspin = clamp(drag.vp, -1.5, 1.5); }
  else if (e.pointerType !== 'touch') mouseButtons(e.type === 'pointercancel' ? { buttons: 0, pointerId: e.pointerId } : e);
}
canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', endPointer);
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  rig.distT = clamp(rig.distT * (1 + Math.sign(e.deltaY) * 0.09), 5.5, 20);
}, { passive: false });
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
const jumpBtn = $('btnJump');
jumpBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); onJumpPress(); });
jumpBtn.addEventListener('pointerup', onJumpRelease);
jumpBtn.addEventListener('pointercancel', onJumpRelease);
jumpBtn.addEventListener('pointerleave', onJumpRelease);
const atkBtn = $('btnAtk');
atkBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); try { atkBtn.setPointerCapture(e.pointerId); } catch (err) { /* capture is optional */ } if (G.state === 'play') setAttack('touch', true); });
for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) atkBtn.addEventListener(ev, () => setAttack('touch', false));
$('btnSwap').addEventListener('pointerdown', (e) => { e.preventDefault(); if (G.state === 'play') cycleWeapon(1); });
let padOk = !!navigator.getGamepads;
function pollPad() {
  if (!padOk) return;
  let pads = null;
  try { pads = navigator.getGamepads(); } catch (e) { padOk = false; return; }   // blocked by the frame's permissions policy
  let gp = null;
  if (pads) for (const p of pads) if (p && p.connected) { gp = p; break; }
  if (!gp) { pad.mx = pad.my = pad.cx = pad.cy = 0; setAttack('pad', false); return; }
  const dz = (v) => (Math.abs(v) < 0.18 ? 0 : (v - Math.sign(v) * 0.18) / 0.82);
  pad.mx = dz(gp.axes[0] || 0); pad.my = dz(gp.axes[1] || 0); pad.cx = dz(gp.axes[2] || 0); pad.cy = dz(gp.axes[3] || 0);
  const btn = (i) => !!(gp.buttons[i] && gp.buttons[i].pressed);
  const a = btn(0), st = btn(9), lb = btn(4), rb = btn(5), y = btn(3);
  if (a && !pad.a) { if (G.state === 'title') startGame(); else onJumpPress(); }
  if (!a && pad.a) onJumpRelease();
  setAttack('pad', (btn(2) || btn(7)) && G.state === 'play');       // X or right trigger
  if (G.state === 'play') {
    if (lb && !pad.lb) cycleWeapon(-1);
    if (rb && !pad.rb) cycleWeapon(1);
    if (y && !pad.y) startReload();
  }
  if (st && !pad.start) {
    if (G.state === 'title') startGame();
    else if (G.state === 'play') setPaused(true);
    else if (G.state === 'paused') setPaused(false);
    else if (!$('scrEnd').hidden) restart(false);
  }
  pad.a = a; pad.start = st; pad.lb = lb; pad.rb = rb; pad.y = y;
}

/* -----------------------------------------------------------------------------
   15 · Hero: input → velocity (inertial), voxel physics, auto-step, animation
----------------------------------------------------------------------------- */
const player = {
  pos: new THREE.Vector3(), vel: new THREE.Vector3(), vis: new THREE.Vector3(), safe: new THREE.Vector3(),
  onGround: false, coyote: 0, jumpBuf: 0, jumpHeld: false, jumpCut: false,
  facing: 1, walk: 0, frame: 4, step: 0, sq: 0, sqV: 0, lean: 0, hp: HP_MAX, invuln: 0,
  safeT: 0, inWater: false, respawn: 0, splashT: 0,
  look: new THREE.Vector3(0, 0, -1),      // last walking direction (horizontal, unit): auto-aim prefers foes in front
};
const rig = {
  yaw: 0, pitch: 0.62, dist: 11, yawT: 0, pitchT: 0.62, distT: 11, spin: 0, pspin: 0, eff: 11,
  pos: new THREE.Vector3(30, 22, 70), look: new THREE.Vector3(32, 8, 32), trauma: 0, blend: 1, vicA: 0, lift: 0, pitchEff: 0.62,
};
function tryStep(nx, nz) {
  if (!player.onGround) return false;
  const p = player.pos;
  const top = Math.floor(p.y + 0.001) + 1, lift = top - p.y;
  if (lift <= 0.001 || lift > 1.05) return false;
  if (hits(p.x, top, p.z) || hits(nx, top, nz)) return false;
  player.step -= lift;                          // the sprite glides up instead of popping
  p.y = top; p.x = nx; p.z = nz;
  return true;
}
function physicsStep(h) {
  const p = player.pos, v = player.vel;
  let landed = 0;
  if (v.x) { const nx = p.x + v.x * h; if (!hits(nx, p.y, p.z)) p.x = nx; else if (!tryStep(nx, p.z)) v.x = 0; }
  if (v.z) { const nz = p.z + v.z * h; if (!hits(p.x, p.y, nz)) p.z = nz; else if (!tryStep(p.x, nz)) v.z = 0; }
  v.y = Math.max(-28, v.y - PL.grav * (v.y < 0 ? 1.3 : 1) * h);
  const ny = p.y + v.y * h;
  if (!hits(p.x, ny, p.z)) { p.y = ny; player.onGround = false; }
  else if (v.y < 0) {
    const top = Math.floor(ny) + 1;
    if (!hits(p.x, top, p.z)) p.y = top;
    if (!player.onGround) landed = -v.y;
    player.onGround = true; v.y = 0;
  } else { p.y = Math.floor(ny + PL.height) - PL.height - 1e-3; v.y = 0; }
  return landed;
}
function surfaceUnder() {
  const p = player.pos;
  return blockAt(Math.floor(p.x), Math.floor(p.y - 0.5), Math.floor(p.z));
}
function footstep() {
  const p = player.pos, b = surfaceUnder();
  SFX.step(player.inWater ? 'water' : b === B.PLANK ? 'wood' : b === B.STONE || b === B.BRICK ? 'stone' : 'soft');
  if (player.inWater) {
    ripple(p.x, p.z, 0.8);
    for (let k = 0; k < 4; k++) dust.emit(p.x + rr(-0.2, 0.2), SEA + 0.05, p.z + rr(-0.2, 0.2), rr(-1, 1), rr(1.5, 3), rr(-1, 1), rr(0.35, 0.6), 0.08, 0.05, C.spray, 0.85, 14, 0.5, 1);
  } else if (b === B.SAND || b === B.DIRT || b === B.GRASS) {
    const col = b === B.SAND ? C.sand : C.dirt;
    for (let k = 0; k < 2; k++) dust.emit(p.x + rr(-0.15, 0.15), p.y + 0.05, p.z + rr(-0.15, 0.15), rr(-0.5, 0.5), rr(0.3, 0.8), rr(-0.5, 0.5), rr(0.4, 0.7), 0.12, 0.3, col, 0.55, 0.5, 2, 0);
  }
}
function onLand(v) {
  if (v < 5) return;
  player.sqV = -Math.min(9, v * 0.55);
  SFX.land(v);
  const p = player.pos;
  if (player.inWater) { ripple(p.x, p.z, 1.2); SFX.step('water'); return; }
  const col = surfaceUnder() === B.SAND ? C.sand : C.dirt;
  for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; dust.emit(p.x + Math.cos(a) * 0.25, p.y + 0.05, p.z + Math.sin(a) * 0.25, Math.cos(a) * 1.6, rr(0.2, 0.6), Math.sin(a) * 1.6, rr(0.4, 0.6), 0.14, 0.35, col, 0.6, 0.4, 3, 0); }
}
function drown() {
  const p = player.pos;
  player.respawn = 0.95; player.vel.set(0, 0, 0);
  SFX.splash(); ripple(p.x, p.z, 1.6); ripple(p.x + 0.3, p.z - 0.2, 1);
  for (let k = 0; k < 28; k++) dust.emit(p.x + rr(-0.3, 0.3), SEA + 0.1, p.z + rr(-0.3, 0.3), rr(-2, 2), rr(3, 6.5), rr(-2, 2), rr(0.5, 0.9), 0.1, 0.06, C.spray, 0.9, 16, 0.4, 1);
  if (!G.warnedWater) { G.warnedWater = true; toast('Глубоко! Держись берега и причалов', 3000, true); }
}
function respawnAtSafe() {
  player.pos.copy(player.safe); player.vel.set(0, 0, 0); player.step = 0; player.invuln = 0;
  hurt(1);
}
function updatePlayer(dt) {
  const p = player.pos, v = player.vel;
  player.invuln = Math.max(0, player.invuln - dt);
  if (player.respawn > 0) {
    player.respawn -= dt;
    if (player.respawn <= 0 && G.state === 'play') respawnAtSafe();
    return;
  }
  let ix = 0, iz = 0;
  if (G.state === 'play') {
    if (keys.has('KeyD') || keys.has('ArrowRight')) ix += 1;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) ix -= 1;
    if (keys.has('KeyW') || keys.has('ArrowUp')) iz += 1;
    if (keys.has('KeyS') || keys.has('ArrowDown')) iz -= 1;
    ix += touch.vx + pad.mx; iz += -touch.vy - pad.my;
  }
  const m = Math.hypot(ix, iz);
  if (m > 1) { ix /= m; iz /= m; }
  G.idle = m > 0.1 ? 0 : G.idle + dt;
  const sy = Math.sin(rig.yaw), cy = Math.cos(rig.yaw);
  let dx = cy * ix - sy * iz, dz = -sy * ix - cy * iz;            // camera-relative
  if (simDir) { dx = simDir[0]; dz = simDir[1]; G.idle = 0; }
  const dm = Math.hypot(dx, dz);
  if (dm > 0.2) player.look.set(dx / dm, 0, dz / dm);
  // weapons weigh on the legs: heavy swings, a drawn bow or a firing beam slow the walk
  const w = curWeapon();
  let mul = 1;
  if (combat.atk) mul = w.slow ?? 0.6;
  else if (combat.charging) mul = 0.5;
  else if (combat.beam.on) mul = 0.6;
  else if (combat.flail.on) mul = lerp(1, w.slow, combat.flail.spin);
  const speed = PL.speed * (player.inWater ? 0.62 : 1) * mul;
  const f = damp(player.onGround ? PL.accG : PL.accA, dt);
  v.x += (dx * speed - v.x) * f;
  v.z += (dz * speed - v.z) * f;
  if (combat.dash > 0) { v.x = combat.dashDir.x * 15; v.z = combat.dashDir.z * 15; }
  player.jumpBuf = Math.max(0, player.jumpBuf - dt);
  player.coyote = player.onGround ? 0.11 : Math.max(0, player.coyote - dt);
  if (player.jumpBuf > 0 && player.coyote > 0) {
    v.y = PL.jumpV;
    player.jumpBuf = 0; player.coyote = 0; player.onGround = false; player.jumpCut = false;
    player.sqV = 7; SFX.jump();
    if (player.inWater) ripple(p.x, p.z, 1);
  }
  if (!player.jumpHeld && v.y > 2 && !player.jumpCut) { v.y *= 0.55; player.jumpCut = true; }
  const steps = Math.max(1, Math.ceil(dt * 120)), h = dt / steps;
  const was = player.onGround;
  let landV = 0;
  for (let s = 0; s < steps; s++) landV = Math.max(landV, physicsStep(h));
  if (player.onGround && !was) onLand(landV);
  player.inWater = p.y < SEA - 0.05;
  if (player.onGround && !player.inWater) { player.safeT += dt; if (player.safeT > 0.3) { player.safe.copy(p); player.safeT = 0; } }
  if (p.y < SEA - 1.25 && G.state === 'play') { drown(); return; }
  if (player.inWater && Math.hypot(v.x, v.z) > 1) { player.splashT -= dt; if (player.splashT <= 0) { player.splashT = 0.28; ripple(p.x, p.z, 0.6); } }
  // animation: frames by distance walked, facing from screen-space motion
  const hs = Math.hypot(v.x, v.z);
  const sxv = v.x * cy - v.z * sy;
  if (sxv > 0.35) player.facing = 1; else if (sxv < -0.35) player.facing = -1;
  if (G.state === 'play' && engaged()) {          // in a fight the hero faces the aim, not the walk
    const ca = Math.cos(combat.atk ? screenAngleOf(combat.atk.dir) : aim.screen);
    if (ca > 0.12) player.facing = 1; else if (ca < -0.12) player.facing = -1;
  }
  let frame;
  if (!player.onGround) frame = 5;
  else if (hs > 0.45) { player.walk += hs * dt; frame = Math.floor(player.walk / 0.5) % 4; }
  else frame = 4;
  if (frame !== player.frame) {
    if (player.onGround && hs > 0.45 && (frame === 0 || frame === 2)) footstep();
    player.frame = frame;
  }
  // lean into the swing, rock back from the recoil (overlapping motion on top of the walk lean)
  let leanT = clamp(-sxv * 0.03, -0.12, 0.12);
  if (combat.atk) leanT -= Math.cos(screenAngleOf(combat.atk.dir)) * 0.16 * Math.sin(combat.atk.t * Math.PI);
  if (combat.recoil > 0) leanT += Math.cos(aim.screen) * 0.06 * combat.recoil;
  player.lean += (leanT - player.lean) * damp(combat.atk ? 14 : 8, dt);
}
function updateHeroMesh(dt) {
  player.sqV += (-player.sq * 170 - player.sqV * 13) * dt;
  player.sq = clamp(player.sq + player.sqV * dt, -0.35, 0.35);
  player.step *= Math.exp(-14 * dt);
  player.vis.set(player.pos.x, player.pos.y + player.step, player.pos.z);
  setHeroFrame(player.frame, player.facing);
  hero.position.copy(player.vis);
  hero.rotation.y = Math.atan2(camera.position.x - hero.position.x, camera.position.z - hero.position.z);
  hero.rotation.x = -rig.pitchEff * 0.45;
  hero.rotation.z = player.lean;
  const breathe = player.frame === 4 ? Math.sin(G.time * 2.2) * 0.018 : 0;
  hero.scale.set(1 - player.sq * 0.5, 1 + player.sq + breathe, 1);
  const blinkOff = player.invuln > 0 && Math.floor(G.time * 18) % 2 === 0;
  hero.visible = player.respawn <= 0 && !blinkOff && G.state !== 'loading';
  heroMat.emissiveIntensity = 0.1 + G.tod * 0.16 + G.hurt * 0.9;
  const gy = groundBelow(player.pos.x, player.pos.y + 0.2, player.pos.z);
  const above = player.pos.y - gy;
  heroShadow.visible = hero.visible;
  heroShadow.position.set(player.vis.x, gy + 0.02, player.vis.z);
  const sc = clamp(1 - above * 0.16, 0.45, 1) * 0.95;
  heroShadow.scale.set(sc, 1, sc * 0.8);
  shadowU.uA.value = 0.5 * clamp(1 - above * 0.2, 0.25, 1);
}
function hurt(n, fx, fz) {
  if (player.invuln > 0 || G.state !== 'play') return false;
  player.hp = Math.max(0, player.hp - n); G.hits++;
  player.invuln = 1.5; G.hurt = 1; rig.trauma = Math.min(1, rig.trauma + 0.75);
  G.hitstop = Math.max(G.hitstop, 0.06);
  FX.uFlashColor.value.setRGB(1, 0.45, 0.85);
  if (fx !== undefined) {
    const dx = player.pos.x - fx, dz = player.pos.z - fz, L = Math.hypot(dx, dz) || 1;
    player.vel.x = dx / L * 7; player.vel.z = dz / L * 7; player.vel.y = 6.5; player.onGround = false;
  }
  SFX.hurt();
  const p = player.pos;
  for (let k = 0; k < 16; k++) glow.emit(p.x, p.y + 0.8, p.z, rr(-3, 3), rr(0, 4), rr(-3, 3), rr(0.3, 0.6), 0.14, 0.02, C.violet, 1, 4, 2, 1);
  updateHearts(true);
  if (player.hp <= 0) die();
  return true;
}

/* -----------------------------------------------------------------------------
   16 · Pickups: coins (with magnet + pop) and hearts
----------------------------------------------------------------------------- */
let coins = [], heartsP = [];
let simDir = null;                       // automated-check steering (world space), null in normal play
function buildPickups() {
  for (const o of [coinObj, heartObj]) if (o) for (const m of o.meshes) { scene.remove(m); m.geometry.dispose(); }
  const make = (list, mats, withBeam) => {
    const n = Math.max(1, list.length);
    const pos = new Float32Array(n * 3), ph = new Float32Array(n), al = new Float32Array(n);
    list.forEach((c, i) => { ph[i] = Math.random(); al[i] = 1; pos[i * 3] = c.x; pos[i * 3 + 1] = c.y; pos[i * 3 + 2] = c.z; });
    const inst = makeInstGeo(quadBase, list.length, { aPos: [pos, 3], aPhase: [ph, 1], aAlive: [al, 1] });
    const meshes = mats.map((mat, k) => {
      let geo = inst.geo;
      if (withBeam && k === mats.length - 1) {
        geo = new THREE.InstancedBufferGeometry();
        geo.index = beamBase.index;
        geo.setAttribute('position', beamBase.attributes.position);
        geo.setAttribute('uv', beamBase.attributes.uv);
        for (const nm in inst.attrs) geo.setAttribute(nm, inst.attrs[nm]);
        geo.instanceCount = list.length;
      }
      const mesh = new THREE.Mesh(geo, mat);
      mesh.frustumCulled = false; mesh.renderOrder = mat.blending === THREE.AdditiveBlending ? 9 + k : 3;
      scene.add(mesh);
      return mesh;
    });
    return { meshes, attrs: inst.attrs, pos, al };
  };
  coins = world.coins.map((c) => ({ x: c.x, y: c.y + 0.62, z: c.z, alive: true, t: 1 }));
  heartsP = world.hearts.map((c) => ({ x: c.x, y: c.y + 0.6, z: c.z, alive: true, t: 1 }));
  coinObj = make(coins, [coinMat, coinHaloMat, coinBeamMat], true);
  heartObj = make(heartsP, [heartMat, heartHaloMat], false);
}
function syncPickups(list, o) {
  for (let i = 0; i < list.length; i++) {
    const c = list[i];
    o.pos[i * 3] = c.x; o.pos[i * 3 + 1] = c.y; o.pos[i * 3 + 2] = c.z;
    o.al[i] = c.alive ? 1 : c.t < 1 ? (1 - c.t) * (1 + 0.8 * Math.sin(c.t * Math.PI)) : 0;
  }
  o.attrs.aPos.needsUpdate = true; o.attrs.aAlive.needsUpdate = true;
}
function updatePickups(dt) {
  const px = player.pos.x, py = player.pos.y + 0.7, pz = player.pos.z;
  const active = G.state === 'play' && player.respawn <= 0;
  for (let i = 0; i < coins.length; i++) {
    const c = coins[i];
    if (c.alive) {
      if (!active) continue;
      const dx = px - c.x, dy = py - c.y, dz = pz - c.z, dh = Math.hypot(dx, dz);
      if (dh < 1.9 && Math.abs(dy) < 1.6) { const k = damp(6, dt) * (1 - dh / 1.9); c.x += dx * k; c.z += dz * k; c.y += dy * k * 0.5; }
      if (dh < 0.75 && Math.abs(dy) < 1.15) collectCoin(i);
    } else if (c.t < 1) { c.t = Math.min(1, c.t + dt * 2.6); c.y += dt * 2.2 * (1 - c.t); }
  }
  for (let i = 0; i < heartsP.length; i++) {
    const h = heartsP[i];
    if (h.alive) {
      if (!active || player.hp >= HP_MAX) continue;
      const dx = px - h.x, dy = py - h.y, dz = pz - h.z;
      if (Math.hypot(dx, dz) < 0.8 && Math.abs(dy) < 1.2) collectHeart(i);
    } else if (h.t < 1) { h.t = Math.min(1, h.t + dt * 2.6); h.y += dt * 2 * (1 - h.t); }
  }
  syncPickups(coins, coinObj); syncPickups(heartsP, heartObj);
}
const MILESTONES = { 5: 'Солнце садится', 10: 'Половина пути. Темнеет', 15: 'Тени становятся смелее' };
function collectCoin(i) {
  const c = coins[i];
  c.alive = false; c.t = 0;
  G.collected++;
  G.combo = G.comboT > 0 ? G.combo + 1 : 0; G.comboT = 2.2;
  SFX.coin(G.combo);
  for (let k = 0; k < 20; k++) glow.emit(c.x, c.y, c.z, rr(-2.6, 2.6), rr(1, 4.8), rr(-2.6, 2.6), rr(0.5, 0.9), 0.2, 0.05, C.gold, 1, 7, 1.6, 2);
  for (let k = 0; k < 10; k++) glow.emit(c.x, c.y, c.z, rr(-1.5, 1.5), rr(0.5, 3), rr(-1.5, 1.5), rr(0.6, 1.1), 0.08, 0.04, C.goldHot, 1, 3, 1, 1);
  if (c.y < SEA + 1.2) ripple(c.x, c.z, 1);
  setCoinsHud(true);
  wisp.flash = 1;
  G.todT = 0.04 + 0.96 * (G.collected / G.total);
  const left = G.total - G.collected;
  if (left === 0) { G.all = true; G.wardenT = 1.6; toast('Все монеты! Но маяк кто-то стережёт…', 3000, false, 3); }
  else if (MILESTONES[G.collected]) toast(MILESTONES[G.collected], 2600);
  else if (left === 3) toast('Осталось три монеты', 2400);
}
function collectHeart(i) {
  const h = heartsP[i];
  h.alive = false; h.t = 0;
  player.hp = Math.min(HP_MAX, player.hp + 2);
  updateHearts(false);
  SFX.heal();
  for (let k = 0; k < 16; k++) glow.emit(h.x, h.y, h.z, rr(-2, 2), rr(1, 4), rr(-2, 2), rr(0.5, 0.9), 0.18, 0.04, C.heart, 1, 6, 1.6, 2);
  toast('+1 сердце', 1600, false, 0);
}

/* -----------------------------------------------------------------------------
   18 · Companion wisp, beacon flame, goal ring
----------------------------------------------------------------------------- */
const wisp = { pos: new THREE.Vector3(32, 10, 40), flash: 0, trail: 0 };
function nearestGoal() {
  if (G.all) return G.warden && foeAlive(G.warden) ? G.warden.segs[0] : world.ring;
  let best = null, bd = 1e9;
  for (const c of coins) if (c.alive) { const d = Math.hypot(c.x - player.pos.x, c.z - player.pos.z); if (d < bd) { bd = d; best = c; } }
  return best;
}
function updateWisp(dt) {
  const t = G.time, a = t * 1.25;
  const anchor = G.state === 'title' || G.state === 'loading' ? world.spawn : player.vis;
  tmpA.set(anchor.x + Math.cos(a) * 0.95, anchor.y + 1.75 + Math.sin(t * 1.9) * 0.2, anchor.z + Math.sin(a) * 0.95);
  if (G.state === 'play' && G.idle > 5) {
    const c = nearestGoal();
    if (c) {
      const dx = c.x - player.pos.x, dz = c.z - player.pos.z, L = Math.hypot(dx, dz) || 1;
      const reach = Math.min(L, 4.5) * smooth(5, 8, G.idle) * 0.7;
      tmpA.x += dx / L * reach; tmpA.z += dz / L * reach;
    }
  }
  wisp.pos.lerp(tmpA, damp(3, dt));
  wisp.flash = Math.max(0, wisp.flash - dt * 1.8);
  const flick = 0.92 + 0.05 * Math.sin(t * 13.1) + 0.03 * Math.sin(t * 29.7);
  wispLight.position.copy(wisp.pos);
  wispLight.intensity = (pal.wisp * 9 + wisp.flash * 12) * flick;
  glow.spark(wisp.pos.x, wisp.pos.y, wisp.pos.z, 0.4, C.wispCore, 1, 0);
  glow.spark(wisp.pos.x, wisp.pos.y, wisp.pos.z, 1.5 + wisp.flash * 1.2, C.wispHalo, (0.22 + 0.2 * pal.wisp) * flick, 0);
  wisp.trail -= dt;
  if (wisp.trail <= 0) {
    wisp.trail = 0.045;
    glow.emit(wisp.pos.x + rr(-0.05, 0.05), wisp.pos.y, wisp.pos.z + rr(-0.05, 0.05), rr(-0.2, 0.2), rr(-0.1, 0.3), rr(-0.2, 0.2), rr(0.5, 0.9), 0.1, 0.02, C.wispHalo, 0.8, -0.3, 1.5, 1);
  }
}
const beacon = { level: 0.08, flare: 0, ember: 0, beam: 0 };
function updateBeacon(dt) {
  const goal = G.state === 'victory' ? 1.25 : 0.08 + 0.85 * (G.total ? G.collected / G.total : 0);
  beacon.level += (goal - beacon.level) * damp(1.5, dt);
  beacon.flare = Math.max(0, beacon.flare - dt * 0.45);
  const L = beacon.level + beacon.flare * 0.8;
  const t = G.time;
  flameU.uLevel.value = L;
  flameU.uSize.value.set(0.55 + L * 0.9, 0.75 + L * 1.7 + Math.sin(t * 7.3) * 0.05);
  const flick = 0.86 + 0.09 * Math.sin(t * 11.3) + 0.05 * Math.sin(t * 23.9);
  beaconLight.intensity = (3 + L * 36) * flick;
  beaconLight.distance = 22 + L * 32;
  const b = world.beacon;
  beacon.ember -= dt;
  while (beacon.ember <= 0) {
    beacon.ember += 1 / (4 + L * 34);
    glow.emit(b.x + rr(-0.25, 0.25), b.y + 0.3, b.z + rr(-0.25, 0.25), rr(-0.5, 0.5), rr(1.2, 3.2), rr(-0.5, 0.5), rr(0.8, 1.8), 0.1, 0.03, C.ember, 1, -0.4, 0.8, 1);
  }
  beacon.beam += ((G.state === 'victory' ? 1 : 0) - beacon.beam) * damp(0.8, dt);
  lbeamU.uI.value = beacon.beam * 1.0;
  lbeams.visible = beacon.beam > 0.01;
  lbeams.rotation.y += dt * 0.55;
  const open = G.all && G.wardenDown && G.state === 'play';
  ringU.uOn.value += ((open ? 1 : 0) - ringU.uOn.value) * damp(2, dt);
  if (open && Math.random() < dt * 14) {
    const a = Math.random() * TAU, r = world.ring;
    glow.emit(r.x + Math.cos(a) * 0.95, r.y + 0.1, r.z + Math.sin(a) * 0.95, 0, rr(0.8, 2), 0, rr(0.6, 1.2), 0.1, 0.02, C.gold, 1, -0.2, 0.5, 1);
  }
  if (open) {
    const r = world.ring;
    if (Math.hypot(player.pos.x - r.x, player.pos.z - r.z) < 1.25 && Math.abs(player.pos.y - r.y) < 1.5) win();
  }
}

/* -----------------------------------------------------------------------------
   19 · Camera: heavy cinematic rig (lerped target/position, inertial orbit,
        occlusion pull-in, breathing drift, trauma shake)
----------------------------------------------------------------------------- */
function updateCamera(dt) {
  const t = G.time;
  if (G.state === 'play') {
    const qe = (keys.has('KeyC') ? 1 : 0) - (keys.has('KeyZ') ? 1 : 0);
    rig.yawT += qe * 1.8 * dt - pad.cx * 2.6 * dt;
    rig.pitchT = clamp(rig.pitchT + pad.cy * 1.4 * dt, 0.3, 1.15);
    if (G.idle > 7) { const c = nearestGoal(); if (c) rig.yawT += angDiff(rig.yawT, Math.atan2(player.pos.x - c.x, player.pos.z - c.z)) * damp(0.25, dt); }
  }
  if (!drag.active && touch.camId === null) {
    rig.yawT += rig.spin * dt; rig.spin *= Math.exp(-3.2 * dt);
    rig.pitchT = clamp(rig.pitchT + rig.pspin * dt, 0.3, 1.15); rig.pspin *= Math.exp(-3.2 * dt);
  }
  rig.yaw += angDiff(rig.yaw, rig.yawT) * damp(9, dt);
  rig.pitch += (rig.pitchT - rig.pitch) * damp(9, dt);
  rig.dist += (rig.distT - rig.dist) * damp(6, dt);
  let kPos, kLook;
  const b = world.beacon;
  if (G.state === 'title' || G.state === 'loading') {
    const a = t * 0.045 + G.sunAz + 1.0;
    tmpA.set(b.x, b.y - 4.5 + Math.sin(t * 0.21) * 0.6, b.z);
    tmpB.set(b.x + Math.cos(a) * 34, b.y + 5 + Math.sin(t * 0.13) * 2.5, b.z + Math.sin(a) * 34);
    kPos = 1.4; kLook = 1.6;
  } else if (G.state === 'victory') {
    const a = rig.vicA + G.endT * 0.1;
    tmpA.set(b.x, b.y - 3.5, b.z);
    tmpB.set(b.x + Math.sin(a) * 22, b.y + 1.5 + Math.sin(G.endT * 0.3) * 0.6, b.z + Math.cos(a) * 22);
    kPos = 0.9; kLook = 1.2;
  } else {
    const v = player.vel;
    tmpA.set(player.vis.x + v.x * 0.22, player.vis.y + 0.95, player.vis.z + v.z * 0.22);
    if (G.bossCam > 0 && G.warden) { G.bossCam -= dt; tmpA.lerp(G.warden.segs[0], 0.42 * smooth(0, 0.6, G.bossCam)); }
    const dirAt = (p) => tmpD.set(Math.sin(rig.yaw) * Math.cos(p), Math.sin(p), Math.cos(rig.yaw) * Math.cos(p));
    let lift = 0;
    if (rayFree(tmpA, dirAt(rig.pitch), rig.dist) < rig.dist * 0.85) {
      for (const add of [0.2, 0.4, 0.6]) {
        if (rayFree(tmpA, dirAt(Math.min(1.4, rig.pitch + add)), rig.dist) >= rig.dist * 0.9) { lift = add; break; }
      }
    }
    rig.lift += (lift - rig.lift) * damp(lift > rig.lift ? 5 : 1.2, dt);
    rig.pitchEff = Math.min(1.4, rig.pitch + rig.lift);
    dirAt(rig.pitchEff);
    const free = rayFree(tmpA, tmpD, rig.dist);
    rig.eff += (free - rig.eff) * damp(free < rig.eff ? 12 : 2.5, dt);
    const d = rig.eff + (G.state === 'dead' ? G.endT * 1.6 : 0);
    tmpB.copy(tmpA).addScaledVector(tmpD, d);
    kPos = 5.5; kLook = 8;
  }
  rig.blend = Math.min(1, rig.blend + dt * 0.4);
  const e = rig.blend * rig.blend * (3 - 2 * rig.blend);
  rig.pos.lerp(tmpB, damp(lerp(0.9, kPos, e), dt));
  rig.look.lerp(tmpA, damp(lerp(1.1, kLook, e), dt));
  if (G.danger > 0.55 && G.state === 'play') rig.trauma = Math.max(rig.trauma, (G.danger - 0.55) * 0.4);
  rig.trauma = Math.max(0, rig.trauma - dt * 1.5);
  const sh = (REDUCED ? 0.25 : 1) * rig.trauma * rig.trauma;
  const dx = Math.sin(t * 0.53) * 0.06 + (Math.sin(t * 37.1) + Math.sin(t * 23.3)) * 0.12 * sh;
  const dy = Math.sin(t * 0.71) * 0.05 + (Math.sin(t * 41.7) + Math.sin(t * 29.9)) * 0.1 * sh;
  camera.position.set(rig.pos.x + dx, rig.pos.y + dy, rig.pos.z);
  camera.lookAt(rig.look);
  camera.rotateZ(Math.sin(t * 0.37) * 0.004 + Math.sin(t * 31.0) * 0.012 * sh);
  camera.updateMatrixWorld();
  const m = camera.matrixWorld.elements;
  U.camRight.value.set(m[0], m[1], m[2]);
  U.camUp.value.set(m[4], m[5], m[6]);
  U.right.value.set(m[0], 0, m[2]).normalize();
  sky.position.copy(camera.position);
  const cutting = G.state === 'play' || G.state === 'paused' || G.state === 'dead';
  cutU.uCutOn.value += ((cutting ? 1 : 0) - cutU.uCutOn.value) * damp(4, dt);
  cutU.uCutA.value.set(player.vis.x, player.vis.y + 1.0, player.vis.z);
  cutU.uCutB.value.copy(camera.position);
}

/* -----------------------------------------------------------------------------
   20 · Post levers + environment
----------------------------------------------------------------------------- */
function updatePost(dt) {
  G.danger += (G.dangerT - G.danger) * damp(3, dt);
  G.hurt = Math.max(0, G.hurt - dt * 1.6);
  G.blipT -= dt;
  if (G.blipT <= 0) { G.blipT = rr(6, 13); if (G.tod > 0.35 && G.state === 'play') G.blip = 0.18; }
  G.blip = Math.max(0, G.blip - dt * 1.4);
  G.flash = Math.max(0, G.flash - dt * 0.9);
  const red = REDUCED ? 0.35 : 1;
  FX.uTime.value = G.time;
  FX.uAberr.value = (0.0016 + G.danger * 0.0035 + G.hurt * 0.012 + beacon.flare * 0.003) * red;
  FX.uGlitch.value = (G.blip + G.danger * 0.14 * (Math.sin(G.time * 17) > 0.7 ? 1 : 0) + G.hurt * 0.9) * red;
  FX.uDanger.value = G.danger;
  FX.uVignette.value = pal.vig + G.danger * 0.12;
  FX.uFlash.value = Math.max(G.hurt * 0.26, G.flash);
  FX.uDesat.value = G.desat;
  G.fade = Math.min(1, G.fade + dt * 0.5);
  FX.uFade.value = G.fade * G.fade * (3 - 2 * G.fade);
  const barsT = (G.state === 'title' || G.state === 'loading' ? 0.075 : G.state === 'victory' ? 0.09 : G.bossCam > 0.4 ? 0.06 : 0) * (camera.aspect < 1 ? 0.55 : 1);
  G.bars += (barsT - G.bars) * damp(2.2, dt);
  FX.uBars.value = G.bars;
  bloom.strength = pal.bloom + beacon.flare * 0.45 + G.hurt * 0.25;
  const inPlay = G.state === 'play' || G.state === 'paused' || G.state === 'dead';
  if (inPlay) tmpE.set(player.vis.x, player.vis.y + 0.8, player.vis.z); else tmpE.set(world.beacon.x, world.beacon.y - 3, world.beacon.z);
  tmpE.project(camera);
  G.focus += (clamp(tmpE.y * 0.5 + 0.5, 0.2, 0.8) - G.focus) * damp(4, dt);
  const amt = inPlay ? 1.15 : G.state === 'victory' ? 1.1 : 1.6;
  dofH.uniforms.uFocus.value = dofV.uniforms.uFocus.value = G.focus;
  dofH.uniforms.uAmount.value = dofV.uniforms.uAmount.value = amt;
}
function updateEnvironment(dt) {
  G.tod += (G.todT - G.tod) * damp(0.35, dt);
  G.dawn += ((G.state === 'victory' && G.endT > 2.2 ? 1 : 0) - G.dawn) * damp(G.state === 'victory' ? 0.28 : 3, dt);
  applyPalette(G.tod, G.dawn);
  SFX.ambience(G.tod * (1 - G.dawn), G.danger);
  G.beatT -= dt;
  if (G.danger > 0.25 && G.state === 'play' && G.beatT <= 0) { SFX.beat(G.danger); G.beatT = lerp(1.0, 0.42, G.danger); }
  G.comboT = Math.max(0, G.comboT - dt);
}
const LEAF = [new THREE.Color('#3a823d'), new THREE.Color('#5ea443'), new THREE.Color('#8fc64d')];
let leafT = 0;
function updateLeaves(dt) {
  leafT -= dt;
  if (leafT > 0 || !world.trees.length) return;
  leafT = 0.12;
  const t = world.trees[Math.floor(Math.random() * world.trees.length)];
  const cx = t.x + 0.5 + rr(-2, 2), cz = t.z + 0.5 + rr(-2, 2);
  const ref = G.state === 'play' ? player.pos : world.beacon;
  if (Math.hypot(cx - ref.x, cz - ref.z) > 26) return;
  dust.emit(cx, t.h + t.th - 1.05, cz, rr(-0.35, 0.35), rr(-0.2, 0), rr(-0.35, 0.35), rr(2.5, 4), 0.07, 0.07, LEAF[Math.floor(Math.random() * 3)], 0.95, 0.35, 1.6, 1);
}
function placeFlies() {
  const cells = world.landCells;
  for (let i = 0; i < FLIES; i++) {
    if (flyKind[i] > 0.5 && cells.length) {
      const c = cells[Math.floor(Math.random() * cells.length)];
      flyBase[i * 3] = c[0] + 0.5; flyBase[i * 3 + 1] = world.stand[c[0] + c[1] * W] + rr(0.6, 2.8); flyBase[i * 3 + 2] = c[1] + 0.5;
    } else {
      flyBase[i * 3] = rr(6, W - 6); flyBase[i * 3 + 1] = rr(SEA + 1.5, 13); flyBase[i * 3 + 2] = rr(6, D - 6);
    }
  }
  flyGeo.attributes.position.needsUpdate = true;
}

/* -----------------------------------------------------------------------------
   21 · Flow: title → play ⇄ pause → victory / defeat
----------------------------------------------------------------------------- */
const bestKey = () => `isle.best.${G.seed}`;
function readBest() { try { const v = parseFloat(localStorage.getItem(bestKey())); return Number.isFinite(v) ? v : null; } catch (e) { return null; } }
function buildWorld(seed) {
  G.seed = seed;
  world = generateWorld(seed);
  buildChunks();
  if (heightTex) heightTex.dispose();
  heightTex = makeHeightTexture(world);
  waterU.uHeight.value = heightTex;
  for (const m of mists) m.material.uniforms.uHeight.value = heightTex;
  buildPickups();
  placeFlies();
  flame.position.copy(world.beacon);
  beaconLight.position.copy(world.beacon).add(tmpA.set(0, 0.9, 0));
  ring.position.copy(world.ring).add(tmpA.set(0, 0.04, 0));
  lbeams.position.copy(world.beacon).add(tmpA.set(0, 0.7, 0));
  G.sunAz = Math.atan2(world.beacon.z - world.spawn.z, world.beacon.x - world.spawn.x) + 0.9;
  moonDir.set(Math.cos(0.75) * Math.cos(G.sunAz + 2.3), Math.sin(0.75), Math.cos(0.75) * Math.sin(G.sunAz + 2.3)).normalize();
  G.total = world.coins.length;
  hud.coinT.textContent = `/ ${G.total}`;
  drawMinimapBase();
  G.best = readBest();
}
function resetRun() {
  player.pos.copy(world.spawn); player.vis.copy(world.spawn); player.safe.copy(world.spawn); player.vel.set(0, 0, 0);
  Object.assign(player, { hp: HP_MAX, invuln: 0, respawn: 0, step: 0, sq: 0, sqV: 0, facing: 1, onGround: false, jumpBuf: 0, frame: 4, lean: 0 });
  coins.forEach((c, i) => { const s = world.coins[i]; Object.assign(c, { x: s.x, y: s.y + 0.62, z: s.z, alive: true, t: 1 }); });
  heartsP.forEach((h, i) => { const s = world.hearts[i]; Object.assign(h, { x: s.x, y: s.y + 0.6, z: s.z, alive: true, t: 1 }); });
  syncPickups(coins, coinObj); syncPickups(heartsP, heartObj);
  player.look.set(world.beacon.x - world.spawn.x, 0, world.beacon.z - world.spawn.z).normalize();
  foes = [];
  Object.assign(G, { collected: 0, hits: 0, play: 0, todT: 0.04, tod: 0.04, dawn: 0, all: false, firstShade: false, warnedWater: false, endT: 0, timeScale: 1,
    desat: 0, danger: 0, dangerT: 0, hurt: 0, idle: 0, combo: 0, comboT: 0, newBest: false,
    hitstop: 0, kills: 0, spawnT: 2, wardenSpawned: false, wardenDown: false, warden: null, wardenT: 1.5, hintLoot: false, bossCam: 0 });
  resetCombat();
  buildLoot();
  releaseAll();
  beacon.level = 0.08; beacon.flare = 0; beacon.beam = 0;
  glow.clear(); dust.clear();
  wisp.pos.set(world.spawn.x, world.spawn.y + 2, world.spawn.z);
  updateHearts(false); setCoinsHud(false);
  hud.timer.textContent = '0:00';
}
function startGame() {
  if (G.state !== 'title') return;
  SFX.init(); SFX.ui();
  $('scrTitle').hidden = true;
  hud.root.hidden = false;
  $('touch').hidden = !IS_TOUCH;
  G.state = 'play';
  rig.blend = 0;
  rig.yawT = rig.yaw = Math.atan2(world.spawn.x - world.beacon.x, world.spawn.z - world.beacon.z);
  rig.pitchT = rig.pitch = 0.62; rig.distT = rig.dist = rig.eff = 11; rig.spin = rig.pspin = 0;
  toast(`Собери ${G.total} монет и зажги маяк`, 3600, false, 2);
  canvas.focus();
}
function stopBeam() { if (combat.beam.on) { combat.beam.on = false; combat.beam.segs.length = 0; } SFX.beam(false); }
function setPaused(on) {
  if (on && G.state === 'play') {
    G.state = 'paused'; releaseAll(); stopBeam(); renderArsenal();
    hud.toast.classList.remove('show'); G.toastT = 0;
    $('scrPause').hidden = false; $('btnResume').focus(); SFX.ui();
  } else if (!on && G.state === 'paused') { G.state = 'play'; releaseAll(); $('scrPause').hidden = true; canvas.focus(); }
}
function win() {
  if (G.state !== 'play') return;
  G.state = 'victory'; G.endT = 0; rig.blend = 0;
  rig.vicA = Math.atan2(rig.pos.x - world.beacon.x, rig.pos.z - world.beacon.z);
  beacon.flare = 1.2; G.flash = 0.6; FX.uFlashColor.value.setRGB(1, 0.92, 0.75);
  SFX.ignite(); stopBeam(); releaseAll();
  for (const f of foes) if (f.state !== 'dissolve') { f.state = 'dissolve'; f.hp = 0; }
  for (let i = projs.length - 1; i >= 0; i--) if (projs[i].team === 1) projs.splice(i, 1);
  const b = world.beacon;
  for (let k = 0; k < 60; k++) glow.emit(b.x, b.y + 0.5, b.z, rr(-4, 4), rr(2, 7), rr(-4, 4), rr(0.8, 1.6), 0.18, 0.04, k % 2 ? C.gold : C.ember, 1, 4, 0.8, 2);
  $('touch').hidden = true;
  if (G.best === null || G.play < G.best) { G.best = G.play; G.newBest = true; try { localStorage.setItem(bestKey(), String(G.play)); } catch (e) { /* storage may be blocked */ } }
}
function die() {
  if (G.state !== 'play') return;
  G.state = 'dead'; G.endT = 0;
  SFX.die(); stopBeam(); releaseAll();
  $('touch').hidden = true;
}
function showEnd(won) {
  $('endTitle').textContent = won ? 'Маяк зажжён' : 'Ночь победила';
  $('endTitle').classList.toggle('lost', !won);
  $('endLede').textContent = won
    ? (G.newBest ? 'Новый рекорд этого острова.' : 'Тени растаяли в рассвете.')
    : (G.all ? 'Страж маяка оказался сильнее. Найди оружие помощнее.' : `Тени настигли тебя. Собрано ${G.collected} из ${G.total}.`);
  const found = `${combat.arsenal.length - 1}/${ARSENAL_ORDER.length - 1}`;
  const stats = won
    ? [[fmtTime(G.play), 'время'], [String(G.kills), 'врагов'], [found, 'оружие'], [G.best !== null ? fmtTime(G.best) : '—', 'рекорд']]
    : [[`${G.collected}/${G.total}`, 'монеты'], [String(G.kills), 'врагов'], [fmtTime(G.play), 'время']];
  const box = $('endStats');
  box.replaceChildren(...stats.map(([v, l]) => {
    const d = document.createElement('div'); d.className = 'stat';
    const bv = document.createElement('b'); bv.textContent = v;
    const sl = document.createElement('span'); sl.textContent = l;
    d.append(bv, sl); return d;
  }));
  $('scrEnd').hidden = false;
  $('btnAgain').focus();
}
function restart(newIsland) {
  $('scrEnd').hidden = true; $('scrPause').hidden = true;
  buildWorld(newIsland ? (Math.random() * 1e9) | 0 : G.seed);     // always rebuild: felled trees and blasted leaves grow back
  resetRun();
  G.fade = 0; G.state = 'title';
  startGame();
}
function updateFlow(dt) {
  if (G.state === 'dead') {
    G.endT += dt;
    G.timeScale += (0.25 - G.timeScale) * damp(3, dt);
    G.desat = Math.min(0.85, G.desat + dt * 0.6);
    if (G.endT > 2.4 && $('scrEnd').hidden) showEnd(false);
  } else if (G.state === 'victory') {
    G.endT += dt;
    if (G.endT > 4.2 && $('scrEnd').hidden) showEnd(true);
  }
}
function updateHUD(dt) {
  if (G.toastT > 0) { G.toastT -= dt; if (G.toastT <= 0) hud.toast.classList.remove('show'); }
  if (G.state === 'play') {
    G.play += dt;
    if (!G.hintLoot && G.play > 5.5 && combat.arsenal.length === 1) {
      G.hintLoot = true;
      toast(IS_TOUCH ? 'Рядом лежит оружие. «Удар» — атака' : 'Рядом лежит оружие. ЛКМ или J — удар', 3400, false, 1);
    }
    G.timerT -= dt;
    if (G.timerT <= 0) { G.timerT = 0.25; hud.timer.textContent = fmtTime(G.play); }
  }
  G.mmT -= dt;
  if (G.mmT <= 0 && !hud.root.hidden) { G.mmT = 0.1; drawMinimap(); }
}

/* -----------------------------------------------------------------------------
   22 · Buttons, mute, fullscreen
----------------------------------------------------------------------------- */
function updateMuteBtn() { $('btnMute').setAttribute('aria-pressed', String(SFX.muted)); }
function toggleMute() {
  SFX.setMuted(!SFX.muted); updateMuteBtn();
  try { localStorage.setItem('isle.muted', SFX.muted ? '1' : '0'); } catch (e) { /* storage may be blocked */ }
}
function toggleFullscreen() {
  const d = document, el = d.documentElement;
  try {
    if (!d.fullscreenElement && !d.webkitFullscreenElement) {
      const req = el.requestFullscreen || el.webkitRequestFullscreen;
      const p = req && req.call(el);
      if (p && p.catch) p.catch(() => {});
    } else {
      const ex = d.exitFullscreen || d.webkitExitFullscreen;
      const p = ex && ex.call(d);
      if (p && p.catch) p.catch(() => {});
    }
  } catch (e) { /* fullscreen is optional */ }
}
if (!(document.fullscreenEnabled || document.webkitFullscreenEnabled)) $('btnFull').hidden = true;
$('btnStart').addEventListener('click', startGame);
$('btnResume').addEventListener('click', () => setPaused(false));
$('btnRestart').addEventListener('click', () => restart(false));
$('btnAgain').addEventListener('click', () => restart(false));
$('btnNew').addEventListener('click', () => restart(true));
$('btnMute').addEventListener('click', () => { SFX.init(); toggleMute(); });
$('btnFull').addEventListener('click', toggleFullscreen);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { if (G.state === 'play') setPaused(true); if (SFX.ctx) SFX.ctx.suspend(); }
  else if (SFX.ctx) SFX.ctx.resume();
});
if (IS_TOUCH) { $('startHint').textContent = 'левый палец — идти, правый — камера, справа — удар и смена оружия'; }

/* =============================================================================
   24 · Sprite batch (weapons, projectiles, loot) and ribbons (trails, beams, bolts)
============================================================================= */
const SPRITE_VERT = /* glsl */`
attribute vec3 aPos; attribute vec2 aSize; attribute float aRot; attribute vec4 aUV; attribute vec4 aCol; attribute vec4 aPiv;
uniform vec3 uRight, uUp;
varying vec2 vUv; varying vec4 vCol;
#include <fog_pars_vertex>
void main() {
  vec2 l = (position.xy - aPiv.xy) * aSize;
  float cs = cos(aRot), sn = sin(aRot);
  vec2 r = vec2(l.x * cs - l.y * sn, l.x * sn + l.y * cs);
  vec3 wp = aPos + uRight * r.x + uUp * r.y;
  vec4 mvPosition = viewMatrix * vec4(wp, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  vec2 t = uv;
  if (aPiv.z < 0.0) t.x = 1.0 - t.x;
  if (aPiv.w < 0.0) t.y = 1.0 - t.y;
  vUv = aUV.xy + t * aUV.zw;
  vCol = aCol;
  #include <fog_vertex>
}`;
const SPRITE_FRAG = /* glsl */`
uniform sampler2D uMap;
varying vec2 vUv; varying vec4 vCol;
#include <fog_pars_fragment>
void main() {
  vec4 t = texture2D(uMap, vUv);
  if (t.a < 0.5) discard;
  float l = dot(t.rgb, vec3(0.3, 0.55, 0.15));
  gl_FragColor = vec4(t.rgb * vCol.rgb + t.rgb * vCol.a * (0.4 + l * l * 3.0), 1.0);
  #include <fog_fragment>
}`;
class SpriteBatch {
  constructor(max, tex, order) {
    this.max = max; this.n = 0;
    const sizes = { aPos: 3, aSize: 2, aRot: 1, aUV: 4, aCol: 4, aPiv: 4 };
    this.a = {}; const spec = {};
    for (const k in sizes) { this.a[k] = new Float32Array(max * sizes[k]); spec[k] = [this.a[k], sizes[k]]; }
    const inst = makeInstGeo(quadBase, 0, spec);
    this.geo = inst.geo; this.attrs = inst.attrs;
    this.mesh = new THREE.Mesh(this.geo, fogShader({ uniforms: { uMap: { value: tex }, uRight: U.camRight, uUp: U.camUp }, vertexShader: SPRITE_VERT, fragmentShader: SPRITE_FRAG }));
    this.mesh.frustumCulled = false; this.mesh.renderOrder = order;
    scene.add(this.mesh);
  }
  begin() { this.n = 0; }
  add(x, y, z, w, h, rot, uv, px, py, fx, fy, r, g, b, glowAmt) {
    if (this.n >= this.max) return;
    const i = this.n++, A = this.a;
    A.aPos[i * 3] = x; A.aPos[i * 3 + 1] = y; A.aPos[i * 3 + 2] = z;
    A.aSize[i * 2] = w; A.aSize[i * 2 + 1] = h; A.aRot[i] = rot;
    A.aUV[i * 4] = uv[0]; A.aUV[i * 4 + 1] = uv[1]; A.aUV[i * 4 + 2] = uv[2]; A.aUV[i * 4 + 3] = uv[3];
    A.aCol[i * 4] = r; A.aCol[i * 4 + 1] = g; A.aCol[i * 4 + 2] = b; A.aCol[i * 4 + 3] = glowAmt;
    A.aPiv[i * 4] = px; A.aPiv[i * 4 + 1] = py; A.aPiv[i * 4 + 2] = fx; A.aPiv[i * 4 + 3] = fy;
  }
  end() {
    this.geo.instanceCount = this.n; this.mesh.visible = this.n > 0;
    for (const k in this.attrs) this.attrs[k].needsUpdate = true;
  }
}
const RIB_VERT = /* glsl */`
attribute vec4 aColor; attribute float aSide;
varying vec4 vColor; varying float vSide;
void main() { vColor = aColor; vSide = aSide; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const RIB_FRAG = /* glsl */`
varying vec4 vColor; varying float vSide;
void main() {
  float s = abs(vSide);
  float a = vColor.a * (1.0 - s * s);
  if (a < 0.003) discard;
  gl_FragColor = vec4(vColor.rgb * (1.0 + (1.0 - s) * 1.2), a);
}`;
const _rd = new THREE.Vector3(), _rv = new THREE.Vector3(), _rn = new THREE.Vector3();
const _q0 = new THREE.Vector3(), _q1 = new THREE.Vector3(), _q2 = new THREE.Vector3(), _q3 = new THREE.Vector3();
class Ribbons {
  constructor(max, order) {
    this.max = max; this.n = 0;
    this.pos = new Float32Array(max * 12); this.col = new Float32Array(max * 16); this.side = new Float32Array(max * 4);
    const idx = new Uint16Array(max * 6);
    for (let q = 0; q < max; q++) { const v = q * 4, o = q * 6; idx[o] = v; idx[o + 1] = v + 1; idx[o + 2] = v + 2; idx[o + 3] = v; idx[o + 4] = v + 2; idx[o + 5] = v + 3; }
    const geo = new THREE.BufferGeometry();
    const mk = (arr, n) => { const a = new THREE.BufferAttribute(arr, n); a.setUsage(THREE.DynamicDrawUsage); return a; };
    this.aPos = mk(this.pos, 3); this.aCol = mk(this.col, 4); this.aSide = mk(this.side, 1);
    geo.setAttribute('position', this.aPos); geo.setAttribute('aColor', this.aCol); geo.setAttribute('aSide', this.aSide);
    geo.setIndex(new THREE.BufferAttribute(idx, 1)); geo.setDrawRange(0, 0);
    this.geo = geo;
    this.mesh = new THREE.Mesh(geo, new THREE.ShaderMaterial({ vertexShader: RIB_VERT, fragmentShader: RIB_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    this.mesh.frustumCulled = false; this.mesh.renderOrder = order;
    scene.add(this.mesh);
  }
  begin() { this.n = 0; }
  quad(p0, p1, p2, p3, c0, a0, c1, a1, soft) {
    if (this.n >= this.max) return;
    const q = this.n++, P = this.pos, Cc = this.col, Sd = this.side;
    const pts = [p0, p1, p2, p3], cs = [c0, c0, c1, c1], as = [a0, a0, a1, a1];
    for (let k = 0; k < 4; k++) {
      const p = pts[k], c = cs[k], o3 = q * 12 + k * 3, o4 = q * 16 + k * 4;
      P[o3] = p.x; P[o3 + 1] = p.y; P[o3 + 2] = p.z;
      Cc[o4] = c.r; Cc[o4 + 1] = c.g; Cc[o4 + 2] = c.b; Cc[o4 + 3] = as[k];
      Sd[q * 4 + k] = soft ? (k === 0 || k === 3 ? -1 : 1) : 0;
    }
  }
  quadA(p0, p1, p2, p3, c, a0, a1, a2, a3) {
    if (this.n >= this.max) return;
    const q = this.n++, P = this.pos, Cc = this.col, Sd = this.side;
    const pts = [p0, p1, p2, p3], as = [a0, a1, a2, a3];
    for (let k = 0; k < 4; k++) {
      const p = pts[k], o3 = q * 12 + k * 3, o4 = q * 16 + k * 4;
      P[o3] = p.x; P[o3 + 1] = p.y; P[o3 + 2] = p.z;
      Cc[o4] = c.r; Cc[o4 + 1] = c.g; Cc[o4 + 2] = c.b; Cc[o4 + 3] = as[k];
      Sd[q * 4 + k] = 0;
    }
  }
  seg(a, b, wa, wb, c0, a0, c1 = c0, a1 = a0) {
    _rd.subVectors(b, a); _rv.subVectors(camera.position, a); _rn.crossVectors(_rd, _rv);
    const L = _rn.length();
    if (L < 1e-6) return;
    _rn.multiplyScalar(1 / L);
    _q0.copy(a).addScaledVector(_rn, -wa / 2); _q1.copy(a).addScaledVector(_rn, wa / 2);
    _q2.copy(b).addScaledVector(_rn, wb / 2); _q3.copy(b).addScaledVector(_rn, -wb / 2);
    this.quad(_q0, _q1, _q2, _q3, c0, a0, c1, a1, true);
  }
  end() {
    this.geo.setDrawRange(0, this.n * 6);
    this.aPos.needsUpdate = this.aCol.needsUpdate = this.aSide.needsUpdate = true;
    this.mesh.visible = this.n > 0;
  }
}
const sprites = new SpriteBatch(600, weaponsTex, 4);
const ribbons = new Ribbons(1500, 18);

/* =============================================================================
   25 · Arsenal: 10 melee + 10 ranged weapons, plus fists
============================================================================= */
const WM = ASSETS.wmeta;
const rectUV = (r) => [r[0] / WM.size[0], 1 - (r[1] + r[3]) / WM.size[1], r[2] / WM.size[0], r[3] / WM.size[1]];
const col3 = (r, g, b, k = 1) => new THREE.Color(r * k, g * k, b * k);
const RAR = {
  common: { name: 'обычное', css: '#d9d2bd', col: col3(0.95, 0.88, 0.7) },
  rare: { name: 'редкое', css: '#62b6ff', col: col3(0.35, 0.65, 1.0) },
  epic: { name: 'эпическое', css: '#c47bff', col: col3(0.72, 0.4, 1.0) },
  legend: { name: 'легендарное', css: '#ffc845', col: col3(1.0, 0.75, 0.25) },
};
const WEAPONS = {
  fists: { name: 'Кулаки', kind: 'melee', rar: 'common', anim: 'punch', dmg: 6, cd: 0.24, dur: 0.24, reach: 1.3, arc: 90, kb: 2.5, combo: 3, fin: { mul: 1.8, kb: 8 }, slow: 0.75, trail: col3(1, 0.9, 0.8, 1.1), stat: 'Урон 6 · апперкот ×1.8', desc: 'Джеб, джеб и апперкот, который отбрасывает.' },
  stick: { name: 'Палка', kind: 'melee', rar: 'common', anim: 'jab', dmg: 9, cd: 0.3, dur: 0.28, reach: 1.85, arc: 60, kb: 3.5, slow: 0.7, trail: col3(1, 0.8, 0.55, 1.1), stat: 'Урон 9 · длинный тычок', desc: 'Быстрый тычок на длину палки. Лучше, чем ничего.' },
  dagger: { name: 'Кинжал', kind: 'melee', rar: 'common', anim: 'stab', dmg: 7, cd: 0.14, dur: 0.16, reach: 1.4, arc: 60, kb: 1.2, combo: 3, crit: 0.35, critMul: 2.6, slow: 0.9, trail: col3(0.8, 0.9, 1, 1.3), stat: 'Урон 7 · крит 35% ×2.6', desc: 'Очень быстрые уколы, треть из них — критические.' },
  sword: { name: 'Меч', kind: 'melee', rar: 'rare', anim: 'slash', dmg: 16, cd: 0.34, dur: 0.32, reach: 2.0, arc: 140, kb: 4.5, combo: 3, fin: { mul: 1.6, kb: 9, over: true }, slow: 0.6, trail: col3(0.7, 0.85, 1, 1.5), stat: 'Урон 16 · комбо из трёх', desc: 'Направо, налево и сверху вниз — третий удар сильнее.' },
  katana: { name: 'Катана', kind: 'melee', rar: 'epic', anim: 'slash', dmg: 13, cd: 0.26, dur: 0.26, reach: 2.1, arc: 150, kb: 3, combo: 3, fin: { mul: 2, kb: 6, dash: true }, slow: 0.75, trail: col3(0.35, 1, 1, 1.7), stat: 'Урон 13 · рывок ×2', desc: 'Широкие быстрые дуги, третий удар — рывок сквозь врагов.' },
  axe: { name: 'Топор', kind: 'melee', rar: 'rare', anim: 'chop', dmg: 30, cd: 0.72, dur: 0.62, reach: 1.9, arc: 100, kb: 8, chop: true, hitstop: 0.07, slow: 0.4, trail: col3(1, 1, 1, 1.2), stat: 'Урон 30 · рубит деревья', desc: 'Тяжёлый рубящий удар. Валит дерево с одного замаха.' },
  hammer: { name: 'Боевой молот', kind: 'melee', rar: 'epic', anim: 'slam', dmg: 38, cd: 1.05, dur: 0.82, reach: 1.8, arc: 120, kb: 10, aoe: { r: 3.6, mul: 0.6 }, stun: 1.3, hitstop: 0.1, slow: 0.3, trail: col3(1, 0.8, 0.45, 1.3), stat: 'Урон 38 · волна оглушает', desc: 'Удар о землю: ударная волна оглушает всех вокруг.' },
  spear: { name: 'Копьё', kind: 'melee', rar: 'rare', anim: 'thrust', dmg: 20, cd: 0.46, dur: 0.38, reach: 3.3, arc: 28, kb: 5, slow: 0.55, trail: col3(1, 0.95, 0.85, 1.3), stat: 'Урон 20 · пронзает линию', desc: 'Длинный выпад пронзает всех, кто стоит на линии.' },
  scythe: { name: 'Коса жнеца', kind: 'melee', rar: 'legend', anim: 'spin', dmg: 18, cd: 0.7, dur: 0.5, reach: 2.5, arc: 360, kb: 4.5, leech: 30, slow: 0.6, trail: col3(0.7, 0.3, 1, 1.9), stat: 'Урон 18 · вампиризм', desc: 'Круговой взмах. Каждые 30 урона возвращают полсердца.' },
  flamesword: { name: 'Пламень', kind: 'melee', rar: 'legend', anim: 'slash', dmg: 14, cd: 0.34, dur: 0.32, reach: 2.0, arc: 140, kb: 4, combo: 2, burn: { dps: 7, t: 3 }, fire: true, glow: 0.7, slow: 0.6, trail: col3(1, 0.45, 0.1, 2.2), stat: 'Урон 14 · горение 7/с', desc: 'Поджигает: враг горит ещё три секунды.' },
  flail: { name: 'Цеп', kind: 'melee', rar: 'epic', anim: 'flail', hold: true, dmg: 14, tick: 0.2, reach: 2.4, kb: 6, slow: 0.55, trail: col3(0.85, 0.85, 1, 1.1), stat: 'Урон 14 · держи атаку', desc: 'Держи атаку — шипастый шар крутится вокруг на цепи.' },
  sling: { name: 'Рогатка', kind: 'ranged', rar: 'common', fire: 'proj', proj: 'pebble', dmg: 9, cd: 0.4, speed: 18, grav: 16, life: 2.6, size: 0.5, r: 0.14, ric: 'damped', bounce: 3, rest: 0.6, foeBounce: true, kb: 2, stat: 'Урон 9 · три отскока', desc: 'Камешек скачет от земли, стен и самих врагов.' },
  bow: { name: 'Лук', kind: 'ranged', rar: 'common', fire: 'proj', proj: 'arrow', charge: 0.75, dmg: [10, 34], speed: [15, 36], grav: 9, life: 3, size: 0.95, r: 0.12, ric: 'stick', kb: [1.5, 6], stat: 'Урон 10–34 · натяжение', desc: 'Держи атаку, чтобы натянуть. Стрелы втыкаются в стены.' },
  xbow: { name: 'Морозный арбалет', kind: 'ranged', rar: 'rare', fire: 'proj', proj: 'bolt', dmg: 24, cd: 0.25, speed: 38, life: 2, size: 0.95, r: 0.14, ric: 'stick', pierce: 3, freeze: 2.4, kb: 3, mag: 1, reload: 0.85, glow: 0.1, stat: 'Урон 24 · пробивает троих · мороз', desc: 'Ледяной болт пробивает троих и замедляет их.' },
  pistol: { name: 'Револьвер', kind: 'ranged', rar: 'rare', fire: 'proj', proj: 'bullet', dmg: 14, cd: 0.2, speed: 44, life: 1.4, size: 0.14, r: 0.1, ric: 'mirror', bounce: 1, kb: 2.5, mag: 6, reload: 1.15, casing: true, spinReload: true, color: col3(1, 0.82, 0.4, 3), stat: 'Урон 14 · 6 патронов · рикошет', desc: 'Пуля рикошетит от стен, если попала по касательной.' },
  shotgun: { name: 'Дробовик', kind: 'ranged', rar: 'rare', fire: 'proj', proj: 'pellet', pellets: 8, spread: 26, dmg: 6, cd: 0.72, speed: 30, life: 0.38, size: 0.1, r: 0.09, ric: 'scatter', bounce: 1, kb: 3, mag: 2, reload: 1.35, recoil: 1.6, casing: true, color: col3(1, 0.7, 0.3, 3), stat: 'Урон 6×8 · 2 патрона', desc: 'Восемь дробин веером, от стен разлетаются как попало.' },
  smg: { name: 'Трещотка', kind: 'ranged', rar: 'epic', fire: 'proj', proj: 'bullet', auto: true, dmg: 5, cd: 1 / 13, speed: 40, spread: 7, life: 1.1, size: 0.1, r: 0.08, kb: 0.8, mag: 36, reload: 1.7, casing: true, tracer: 3, color: col3(1, 0.62, 0.25, 3), stat: 'Урон 5 · 13 выстрелов в секунду', desc: 'Очередь, пока держишь атаку. 36 патронов в барабане.' },
  saw: { name: 'Пилобой', kind: 'ranged', rar: 'epic', fire: 'proj', proj: 'saw', dmg: 12, cd: 0.55, speed: 17, life: 2.8, size: 0.85, r: 0.32, ric: 'mirror', bounce: 6, pierce: 99, rehit: 0.3, kb: 2, mag: 3, reload: 1.5, stat: 'Урон 12 · шесть рикошетов', desc: 'Пила отражается от стен до шести раз и режет всё на пути.' },
  bomb: { name: 'Бомбарда', kind: 'ranged', rar: 'epic', fire: 'proj', proj: 'bomb', dmg: 55, cd: 0.7, speed: 13, grav: 22, life: 1.5, size: 0.65, r: 0.22, ric: 'roll', bounce: 99, aoe: 3.3, kb: 9, mag: 4, reload: 2, recoil: 1.4, stat: 'Урон 55 · взрыв радиусом 3', desc: 'Бомба катится и взрывается, срывая листву с деревьев.' },
  tesla: { name: 'Тесла-жезл', kind: 'ranged', rar: 'legend', fire: 'chain', dmg: 16, cd: 0.42, range: 11, jumps: 4, jumpR: 4.6, stun: 0.35, mag: 6, regen: 0.9, glow: 0.6, stat: 'Урон 16 · цепь на пятерых', desc: 'Молния перескакивает ещё на четырёх соседних врагов.' },
  laser: { name: 'Призма', kind: 'ranged', rar: 'legend', fire: 'beam', dps: 44, range: 22, reflect: 4, heat: 3.2, cool: 1.6, glow: 0.5, stat: '44 урона в секунду · 4 отражения', desc: 'Непрерывный луч отражается от стен. Следи за перегревом.' },
};
// how big each weapon is in the hand (world units spanned by its 32 px cell; the hero is 1 × 1.5)
const HELD_SIZE = { fists: 0.9, stick: 1.45, dagger: 1.15, sword: 1.45, katana: 1.5, axe: 1.4, hammer: 1.5, spear: 1.8, scythe: 1.6, flamesword: 1.45, flail: 1.3,
  sling: 1.0, bow: 1.4, xbow: 1.25, pistol: 1.0, shotgun: 1.35, smg: 1.2, saw: 1.25, bomb: 1.3, tesla: 1.3, laser: 1.25 };
for (const id in WEAPONS) {
  const w = WEAPONS[id];
  w.id = id; w.meta = WM.weapons[id]; w.uv = rectUV(w.meta.cell); w.ranged = w.kind === 'ranged'; w.hs = HELD_SIZE[id] || 1.4;
}
const BOW_DRAWN = { meta: WM.weapons.bow_drawn, uv: rectUV(WM.weapons.bow_drawn.cell) };
const PUV = {}; for (const k in WM.proj) PUV[k] = rectUV(WM.proj[k]);
const FLAIL_GRIP = { uv: rectUV([WM.weapons.flail.cell[0], WM.weapons.flail.cell[1] + 16, 16, 16]), grip: [6, 10], top: [13, 3] };
const LINK_UV = rectUV([WM.weapons.flail.cell[0] + 14, WM.weapons.flail.cell[1] + 15, 3, 3]);
const ARSENAL_ORDER = ['fists', 'stick', 'dagger', 'sword', 'katana', 'axe', 'hammer', 'spear', 'scythe', 'flamesword', 'flail',
  'sling', 'bow', 'xbow', 'pistol', 'shotgun', 'smg', 'saw', 'bomb', 'tesla', 'laser'];
const LOOT_NEAR = ['stick', 'sling'];
const LOOT_FAR = ['dagger', 'bow', 'pistol', 'sword', 'spear', 'xbow', 'axe', 'shotgun', 'katana', 'smg', 'flail', 'saw', 'hammer', 'bomb', 'flamesword', 'tesla', 'scythe', 'laser'];
const UPV = new THREE.Vector3(0, 1, 0);
Object.assign(C, {
  brass: new THREE.Color('#e2a83a'), chip: new THREE.Color('#9d6a40'), leaf: new THREE.Color('#5ea443'),
  flashWarm: new THREE.Color(1, 0.75, 0.35).multiplyScalar(3), spark: new THREE.Color(1, 0.85, 0.5).multiplyScalar(2.5),
  dash: new THREE.Color(0.35, 1, 1).multiplyScalar(2), ice: new THREE.Color(0.6, 0.9, 1).multiplyScalar(2.2),
  fire: new THREE.Color(1, 0.45, 0.1).multiplyScalar(3), smokeLight: new THREE.Color(0.36, 0.3, 0.36),
  zapCore: new THREE.Color(0.85, 1, 1).multiplyScalar(3), zapGlow: new THREE.Color(0.2, 0.75, 1).multiplyScalar(1.6),
  beamCore: new THREE.Color(1, 0.9, 1).multiplyScalar(3), beamGlow: new THREE.Color(1, 0.25, 0.85).multiplyScalar(1.6),
  orbCore: new THREE.Color(1, 0.4, 1).multiplyScalar(3), orbHalo: new THREE.Color(0.6, 0.15, 1).multiplyScalar(1.4),
  soul: new THREE.Color(0.75, 1, 0.85).multiplyScalar(3), soulHalo: new THREE.Color(0.3, 1, 0.6).multiplyScalar(1.2),
  hitSpark: new THREE.Color(1, 0.95, 0.85).multiplyScalar(2.6), reticle: new THREE.Color(1, 0.95, 0.85).multiplyScalar(0.9),
  lock: new THREE.Color(1, 0.35, 0.6).multiplyScalar(1.4), white: new THREE.Color(2, 2, 2),
});

/* =============================================================================
   26 · Combat state, aim
============================================================================= */
const combat = {
  arsenal: ['fists'], cur: 'fists', cd: 0, combo: 0, comboT: 0, atk: null, lastAtk: 9, buf: 0,
  ammo: {}, regen: {}, reload: 0, reloadDur: 1, charge: 0, charging: false, heat: 0, over: false,
  recoil: 0, trail: [], dash: 0, dashDir: new THREE.Vector3(), dashHit: new Set(), shots: 0, leech: 0,
  flail: { on: false, spin: 0, ang: 0, ball: new THREE.Vector3(), vel: new THREE.Vector3(), hits: new Map(), whoosh: 0 },
  beam: { on: false, segs: [] }, bolts: [], waves: [],
};
const held = { ang: 1, x: 0, y: 0, z: 0, rot: 0, fx: 1, fy: 1, px: 0, py: 0, size: 2, cell: 32 };
const aim = { dir: new THREE.Vector3(0, 0, -1), point: new THREE.Vector3(), cx: 0, cy: 0, cursorT: 0, target: null, screen: 0, auto: true, pitch: 0 };
const curWeapon = () => WEAPONS[combat.cur];
const screenAngleOf = (v) => {
  const cr = U.camRight.value, cu = U.camUp.value;
  return Math.atan2(v.x * cu.x + v.y * cu.y + v.z * cu.z, v.x * cr.x + v.y * cr.y + v.z * cr.z);
};
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeIn = (t) => t * t * t;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const span = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const _ray = new THREE.Raycaster(), _ndc = new THREE.Vector2(), _plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
function updateAim(dt) {
  const w = curWeapon();
  const ox = player.pos.x, oy = player.pos.y + 0.85, oz = player.pos.z;
  aim.cursorT = input.src.mouse ? Math.max(aim.cursorT, 1) : aim.cursorT - dt;
  let tgt = null;
  if (aim.cursorT > 0 && !IS_TOUCH) {
    _ndc.set(aim.cx / innerWidth * 2 - 1, -(aim.cy / innerHeight) * 2 + 1);
    _ray.setFromCamera(_ndc, camera);
    _plane.constant = -oy;
    if (_ray.ray.intersectPlane(_plane, aim.point)) {
      let bd = 1.8;
      for (const f of foes) {
        if (!foeAlive(f)) continue;
        const h = f.segs[0], d = Math.hypot(h.x - aim.point.x, h.z - aim.point.z) - f.def.rad;
        if (d < bd) { bd = d; tgt = f; }
      }
      tmpA.set(aim.point.x - ox, 0, aim.point.z - oz);
      if (tmpA.lengthSq() > 0.04) aim.dir.copy(tmpA.normalize());
      aim.auto = false;
    }
  } else {
    const R = w.ranged ? (w.range || 15) : w.reach + 1.2;
    let best = 1e9;
    for (const f of foes) {
      if (!foeAlive(f)) continue;
      const h = f.segs[0], dx = h.x - ox, dz = h.z - oz, d = Math.hypot(dx, dz);
      if (d > R + f.def.rad) continue;
      const cos = (dx * player.look.x + dz * player.look.z) / (d || 1);
      const score = d * (1.7 - cos);
      if (cos > -0.3 && score < best) { best = score; tgt = f; }
    }
    if (tgt) aim.dir.set(tgt.segs[0].x - ox, 0, tgt.segs[0].z - oz).normalize();
    else aim.dir.copy(player.look);
    aim.auto = true;
  }
  aim.target = tgt;
  aim.pitch = 0;
  if (tgt) { const h = tgt.segs[0], d = Math.hypot(h.x - ox, h.z - oz) || 1; aim.pitch = clamp(Math.atan2(h.y - oy, d), -0.55, 0.55); }
  aim.screen = screenAngleOf(aim.dir);
}

/* =============================================================================
   27 · Weapon handling: equip, reload, melee swings, ranged fire
============================================================================= */
function resetCombat() {
  Object.assign(combat, { arsenal: ['fists'], cur: 'fists', cd: 0, combo: 0, comboT: 0, atk: null, lastAtk: 9, buf: 0, ammo: {}, regen: {}, reload: 0,
    charge: 0, charging: false, heat: 0, over: false, recoil: 0, dash: 0, shots: 0, leech: 0 });
  combat.trail.length = 0; combat.bolts.length = 0; combat.waves.length = 0; combat.beam.segs.length = 0;
  combat.beam.on = false; combat.flail.on = false; combat.flail.spin = 0; combat.flail.hits.clear();
  SFX.beam(false);
  projs.length = 0; souls.length = 0;
  whud.nwT = 0; whud.nw.hidden = true;
  hudWeapon();
}
function equip(id) {
  if (!combat.arsenal.includes(id) || combat.cur === id) return;
  combat.cur = id; combat.atk = null; combat.charging = false; combat.charge = 0; combat.reload = 0;
  combat.flail.on = false; combat.flail.spin = 0; combat.trail.length = 0;
  if (combat.beam.on) { combat.beam.on = false; SFX.beam(false); }
  combat.cd = Math.max(combat.cd, 0.15);
  SFX.equip();
  hudWeapon();
}
function cycleWeapon(d) {
  const a = combat.arsenal;
  if (a.length < 2) return;
  equip(a[(a.indexOf(combat.cur) + d + a.length) % a.length]);
}
function startReload() {
  const w = curWeapon();
  if (!w.mag || w.regen || combat.reload > 0 || combat.ammo[w.id] >= w.mag) return;
  combat.reload = combat.reloadDur = w.reload;
  SFX.reload();
}
function engaged() {
  const w = curWeapon();
  return !!(combat.atk || combat.lastAtk < 0.6 || combat.charging || combat.beam.on || combat.flail.on || combat.dash > 0 || (w.ranged && !aim.auto));
}
function updateCombat(dt) {
  const w = curWeapon();
  combat.cd = Math.max(0, combat.cd - dt);
  combat.comboT = Math.max(0, combat.comboT - dt);
  combat.recoil = Math.max(0, combat.recoil - dt * 5);
  combat.lastAtk += dt;
  // a click during a swing or a cooldown is remembered for a moment, so combos chain without holding
  combat.buf = input.pressed ? 0.3 : Math.max(0, combat.buf - dt);
  for (const id of combat.arsenal) {
    const ww = WEAPONS[id];
    if (!ww.regen || combat.ammo[id] >= ww.mag) continue;
    combat.regen[id] = (combat.regen[id] || 0) + dt;
    if (combat.regen[id] >= ww.regen) { combat.regen[id] = 0; combat.ammo[id]++; }
  }
  if (combat.reload > 0) {
    combat.reload -= dt;
    if (combat.reload <= 0) { combat.reload = 0; combat.ammo[w.id] = w.mag; SFX.reloadEnd(); }
  }
  if (combat.dash > 0) updateDash(dt);
  if (w.fire === 'beam') updateBeam(dt, w);
  else {
    if (combat.beam.on) { combat.beam.on = false; SFX.beam(false); }
    combat.heat = Math.max(0, combat.heat - dt);
  }
  if (w.kind === 'melee') {
    if (w.hold) updateFlail(dt, w);
    else {
      if (combat.atk) advanceMelee(dt);
      if (!combat.atk && combat.cd <= 0 && (combat.buf > 0 || input.atk)) { combat.buf = 0; startMelee(w); }
    }
  } else if (w.fire !== 'beam') rangedInput(dt, w);
  input.pressed = input.released = false;
}

// pose of a melee weapon over the swing: angle relative to the aim (degrees, + = up when facing right),
// push = how far the grip travels along the aim, active = hit window
function poseOf(w, t, step, fin) {
  switch (w.anim) {
    case 'punch': {
      if (fin) { const k = easeOut(span(t, 0.12, 0.55)); return { ang: lerp(-65, 70, k), push: 0.3 + 0.3 * Math.sin(k * Math.PI), active: t > 0.18 && t < 0.58 }; }
      const k = t < 0.2 ? -0.15 * span(t, 0, 0.2) : t < 0.45 ? lerp(-0.15, 0.6, easeOut(span(t, 0.2, 0.45))) : lerp(0.6, 0, easeInOut(span(t, 0.45, 1)));
      return { ang: step % 2 ? 8 : -8, push: k, active: t > 0.24 && t < 0.56 };
    }
    case 'jab': {
      const k = t < 0.2 ? -0.2 * span(t, 0, 0.2) : t < 0.42 ? lerp(-0.2, 0.75, easeOut(span(t, 0.2, 0.42))) : lerp(0.75, 0, easeInOut(span(t, 0.42, 1)));
      return { ang: 0, push: k, active: t > 0.24 && t < 0.55 };
    }
    case 'stab': {
      const k = t < 0.3 ? lerp(0, 0.55, easeOut(span(t, 0, 0.3))) : lerp(0.55, 0, easeInOut(span(t, 0.3, 1)));
      return { ang: [-14, 10, 0][step % 3], push: k, active: t > 0.12 && t < 0.5 };
    }
    case 'slash': {
      let a0 = 115, a1 = -75;
      if (fin && w.fin && w.fin.over) { a0 = 165; a1 = -55; } else if (step % 2) { a0 = -75; a1 = 115; }
      const sg = Math.sign(a1 - a0);
      let ang;
      if (t < 0.18) ang = a0 - sg * 14 * easeOut(span(t, 0, 0.18));
      else if (t < 0.5) ang = lerp(a0 - sg * 14, a1, easeOut(span(t, 0.18, 0.5)));
      else ang = a1 + sg * 6 * easeInOut(span(t, 0.5, 1));
      return { ang, push: 0.12, active: t > 0.2 && t < 0.48 };
    }
    case 'chop': {
      let ang;
      if (t < 0.45) ang = lerp(70, 150, easeInOut(span(t, 0, 0.45)));
      else if (t < 0.58) ang = lerp(150, -55, easeIn(span(t, 0.45, 0.58)));
      else ang = -55 + 8 * easeInOut(span(t, 0.58, 1));
      return { ang, push: 0.1, active: t > 0.5 && t < 0.66 };
    }
    case 'slam': {
      let ang;
      if (t < 0.5) ang = lerp(70, 172, easeInOut(span(t, 0, 0.5)));
      else if (t < 0.6) ang = lerp(172, -70, easeIn(span(t, 0.5, 0.6)));
      else ang = -70 + 6 * Math.sin(span(t, 0.6, 1) * Math.PI);
      return { ang, push: 0.15, active: false };
    }
    case 'thrust': {
      const k = t < 0.25 ? lerp(0, -0.4, easeOut(span(t, 0, 0.25))) : t < 0.42 ? lerp(-0.4, 1.15, easeOut(span(t, 0.25, 0.42))) : lerp(1.15, 0, easeInOut(span(t, 0.42, 1)));
      return { ang: 0, push: k, active: t > 0.28 && t < 0.52 };
    }
    case 'spin': {
      const k = easeInOut(span(t, 0.05, 0.9));
      return { ang: 90 - 420 * k, push: 0.15, active: t > 0.12 && t < 0.88 };
    }
  }
  return { ang: 60, push: 0, active: false };
}
function startMelee(w) {
  const step = w.combo && combat.comboT > 0 ? (combat.combo + 1) % w.combo : 0;
  const fin = !!(w.fin && w.combo && step === w.combo - 1);
  combat.combo = step;
  combat.atk = { w, t: 0, dur: w.dur * (fin ? 1.25 : 1), step, fin, hit: new Set(), dir: aim.dir.clone(), impact: false, chopped: false, pose: poseOf(w, 0, step, fin) };
  combat.cd = w.cd * (fin ? 1.3 : 1);
  combat.lastAtk = 0;
  combat.trail.length = 0;
  const lunge = w.anim === 'thrust' ? 4.5 : w.anim === 'slam' || w.anim === 'spin' || w.anim === 'chop' ? 0.8 : fin ? 3.4 : 2.2;
  player.vel.x += aim.dir.x * lunge; player.vel.z += aim.dir.z * lunge;
  SFX.swing(w.anim === 'slam' || w.anim === 'chop' ? 2 : w.anim === 'spin' ? 1.5 : w.anim === 'punch' || w.anim === 'stab' ? 0.6 : 1);
  if (fin && w.fin.dash) {
    combat.dash = 0.2; combat.dashDir.copy(aim.dir); combat.dashHit = combat.atk.hit;
    player.invuln = Math.max(player.invuln, 0.35);
    SFX.dash();
  }
}
function advanceMelee(dt) {
  const a = combat.atk, w = a.w;
  a.t = Math.min(1, a.t + dt / a.dur);
  a.pose = poseOf(w, a.t, a.step, a.fin);
  if (a.pose.active) meleeSweep(a);
  if (w.anim === 'slam' && !a.impact && a.t >= 0.6) { a.impact = true; slamImpact(a); }
  if (w.chop && a.pose.active && !a.chopped) tryChop(a);
  if (a.t >= 1) { combat.atk = null; combat.comboT = 0.42; }
}
function meleeSweep(a) {
  const w = a.w;
  const ox = player.pos.x, oy = player.pos.y + 0.8, oz = player.pos.z;
  const reach = w.reach * (a.fin ? 1.15 : 1);
  const half = w.arc * (a.fin ? 1.2 : 1) * Math.PI / 360;
  parryOrbs(a, reach, half);
  for (const f of foes) {
    if (!foeAlive(f) || a.hit.has(f)) continue;
    for (let k = 0; k < f.n; k++) {
      const s = f.segs[k], r = segRad(f, k);
      const dx = s.x - ox, dz = s.z - oz, d = Math.hypot(dx, dz);
      if (d > reach + r || Math.abs(s.y - oy) > 1.7 + r) continue;
      if (half < Math.PI && d > r + 0.4) {
        const cos = (dx * a.dir.x + dz * a.dir.z) / d;
        if (Math.acos(clamp(cos, -1, 1)) > half + Math.atan2(r, d)) continue;
      }
      a.hit.add(f);
      const mul = a.fin ? w.fin.mul : 1, dl = d || 1;
      damageFoe(f, w.dmg * mul, dx / dl, dz / dl, { kb: (a.fin && w.fin.kb) || w.kb, crit: w.crit, critMul: w.critMul, burn: w.burn, leech: w.leech, at: s, w });
      G.hitstop = Math.max(G.hitstop, w.hitstop || (a.fin ? 0.05 : 0.022));
      if (w.fire) for (let q = 0; q < 6; q++) glow.emit(s.x, s.y, s.z, rr(-1.5, 1.5), rr(0.5, 3), rr(-1.5, 1.5), rr(0.3, 0.6), 0.14, 0.03, C.fire, 1, -1, 1.5, 1);
      break;
    }
  }
}
function parryOrbs(a, reach, half) {
  const ox = player.pos.x, oy = player.pos.y + 0.8, oz = player.pos.z;
  for (const o of projs) {
    if (o.team !== 1 || o.dead) continue;
    const dx = o.pos.x - ox, dz = o.pos.z - oz, d = Math.hypot(dx, dz);
    if (d > reach + 0.5 || Math.abs(o.pos.y - oy) > 1.9) continue;
    if (half < Math.PI && d > 0.6 && Math.acos(clamp((dx * a.dir.x + dz * a.dir.z) / d, -1, 1)) > half + 0.35) continue;
    breakOrb(o);
    G.hitstop = Math.max(G.hitstop, 0.04);
  }
}
function slamImpact(a) {
  const w = a.w;
  const cx = player.pos.x + a.dir.x * 1.2, cz = player.pos.z + a.dir.z * 1.2;
  const gy = groundBelow(cx, player.pos.y + 1.2, cz);
  combat.waves.push({ x: cx, y: Math.max(gy, SEA) + 0.08, z: cz, r: w.aoe.r, t: 0, dur: 0.5, col: w.trail });
  for (const f of foes) {
    if (!foeAlive(f)) continue;
    const h = f.segs[0], dx = h.x - cx, dz = h.z - cz, d = Math.hypot(dx, dz);
    if (d > w.aoe.r + f.def.rad || Math.abs(h.y - gy) > 3.5) continue;
    const near = d < 1.5 ? 1 : w.aoe.mul;
    damageFoe(f, w.dmg * near, dx / (d || 1), dz / (d || 1), { kb: w.kb * (1 - d / (w.aoe.r + 2)), stun: w.stun, at: h, w });
  }
  for (let k = 0; k < 26; k++) {
    const an = k / 26 * TAU;
    dust.emit(cx + Math.cos(an) * 0.4, gy + 0.1, cz + Math.sin(an) * 0.4, Math.cos(an) * rr(3, 5), rr(0.5, 1.6), Math.sin(an) * rr(3, 5), rr(0.4, 0.8), 0.2, 0.6, C.dirt, 0.7, 2, 3, 0);
  }
  for (let k = 0; k < 14; k++) glow.emit(cx, gy + 0.2, cz, rr(-3, 3), rr(2, 5), rr(-3, 3), rr(0.3, 0.6), 0.1, 0.02, C.spark, 1, 10, 1, 1);
  if (Math.max(gy, SEA) <= SEA + 0.1) ripple(cx, cz, 2);
  G.hitstop = Math.max(G.hitstop, w.hitstop);
  rig.trauma = Math.min(1, rig.trauma + 0.55);
  flashLight(tmpE.set(cx, gy + 0.6, cz), 0xffb060, 9);
  SFX.slam();
}
function tryChop(a) {
  for (const d of [0.7, 1.15, 1.6]) for (const hh of [0.3, 0.9, 1.5]) {
    const x = Math.floor(player.pos.x + a.dir.x * d), y = Math.floor(player.pos.y + hh), z = Math.floor(player.pos.z + a.dir.z * d);
    if (blockAt(x, y, z) === B.BARK && fellTree(x, z)) {
      a.chopped = true;
      G.hitstop = Math.max(G.hitstop, 0.08);
      rig.trauma = Math.min(1, rig.trauma + 0.35);
      return;
    }
  }
}
function updateDash(dt) {
  combat.dash -= dt;
  const p = player.vis;
  for (let k = 0; k < 3; k++) glow.emit(p.x + rr(-0.25, 0.25), p.y + rr(0.1, 1.4), p.z + rr(-0.25, 0.25), 0, rr(0, 0.4), 0, rr(0.25, 0.45), 0.15, 0.02, C.dash, 0.9, 0, 0, 1);
  const w = WEAPONS.katana;
  for (const f of foes) {
    if (!foeAlive(f) || combat.dashHit.has(f)) continue;
    for (let k = 0; k < f.n; k++) {
      const s = f.segs[k];
      const dx = s.x - player.pos.x, dz = s.z - player.pos.z, d = Math.hypot(dx, dz);
      if (d < 1.5 + segRad(f, k) && Math.abs(s.y - player.pos.y - 0.8) < 1.8) {
        combat.dashHit.add(f);
        damageFoe(f, w.dmg * w.fin.mul, combat.dashDir.x, combat.dashDir.z, { kb: w.fin.kb, at: s, w });
        G.hitstop = Math.max(G.hitstop, 0.05);
        break;
      }
    }
  }
}
function updateFlail(dt, w) {
  const fl = combat.flail;
  fl.spin = clamp(fl.spin + (input.atk ? dt * 2.6 : -dt * 2.2), 0, 1);
  if (fl.spin > 0 && !fl.on) {
    fl.on = true; fl.ang = Math.atan2(aim.dir.z, aim.dir.x);
    fl.ball.set(player.pos.x + aim.dir.x * 0.8, player.pos.y + 0.8, player.pos.z + aim.dir.z * 0.8); fl.vel.set(0, 0, 0);
  }
  if (fl.spin <= 0) { fl.on = false; return; }
  combat.lastAtk = 0;
  const speed = 5 + 7 * fl.spin;
  fl.ang += dt * speed;
  const R = w.reach * (0.45 + 0.55 * fl.spin);
  tmpB.set(player.pos.x + Math.cos(fl.ang) * R, player.pos.y + 0.75 + Math.sin(fl.ang * 2) * 0.15, player.pos.z + Math.sin(fl.ang) * R);
  fl.vel.addScaledVector(tmpC.subVectors(tmpB, fl.ball), 140 * dt);
  fl.vel.multiplyScalar(Math.exp(-10 * dt));
  fl.ball.addScaledVector(fl.vel, dt);
  fl.whoosh -= dt;
  if (fl.whoosh <= 0) { fl.whoosh = TAU / speed; SFX.swing(0.8 + fl.spin * 0.4); }
  for (const f of foes) {
    if (!foeAlive(f)) continue;
    const last = fl.hits.get(f);
    if (last !== undefined && G.time - last < w.tick) continue;
    for (let k = 0; k < f.n; k++) {
      const s = f.segs[k], rr2 = segRad(f, k) + 0.45;
      if (s.distanceToSquared(fl.ball) > rr2 * rr2) continue;
      fl.hits.set(f, G.time);
      const dx = s.x - player.pos.x, dz = s.z - player.pos.z, d = Math.hypot(dx, dz) || 1;
      damageFoe(f, w.dmg * (0.6 + 0.4 * fl.spin), dx / d, dz / d, { kb: w.kb, at: s, w });
      break;
    }
  }
}
function rangedInput(dt, w) {
  if (combat.reload > 0) return;
  const id = w.id;
  if (w.charge) {
    if (input.atk && combat.cd <= 0) {
      if (!combat.charging) { combat.charging = true; combat.charge = 0; SFX.draw(); }
      combat.charge = Math.min(1, combat.charge + dt / w.charge);
      combat.lastAtk = 0;
    } else if (combat.charging) {
      fireRanged(w, combat.charge);
      combat.charging = false; combat.charge = 0; combat.cd = 0.28;
    }
    return;
  }
  if (!(input.atk || combat.buf > 0) || combat.cd > 0) return;
  combat.buf = 0;
  if (w.mag && combat.ammo[id] <= 0) {
    if (w.regen) { if (input.pressed) SFX.empty(); } else startReload();
    return;
  }
  fireRanged(w, 1);
  combat.cd = w.cd;
  if (w.mag) { combat.ammo[id]--; if (combat.ammo[id] <= 0 && !w.regen) startReload(); }
}
function fireRanged(w, charge) {
  combat.lastAtk = 0; combat.shots++;
  const m = muzzleWorld(tmpE);
  const o = tmpB.copy(m);
  if (solidAt(Math.floor(o.x), Math.floor(o.y), Math.floor(o.z))) o.set(player.pos.x, player.pos.y + 0.85, player.pos.z);
  const cp = Math.cos(aim.pitch);
  const dir = tmpD.set(aim.dir.x * cp, Math.sin(aim.pitch), aim.dir.z * cp);
  if (w.fire === 'chain') teslaChain(w, o, dir);
  else {
    const n = w.pellets || 1, spr = (w.spread || 0) * Math.PI / 180;
    for (let i = 0; i < n; i++) {
      const yaw = n > 1 ? (i / (n - 1) - 0.5) * spr + rr(-0.05, 0.05) : rr(-0.5, 0.5) * spr;
      const d = tmpC.copy(dir).applyAxisAngle(UPV, yaw);
      d.y += rr(-0.5, 0.5) * spr * 0.25;
      spawnShot(w, o, d.normalize(), charge);
    }
  }
  combat.recoil = Math.min(2, combat.recoil + (w.recoil || 0.7));
  muzzleFlash(w, m, dir);
  if (w.casing) ejectCasing(m);
  SFX.shot(w.id, charge);
  rig.trauma = Math.min(1, rig.trauma + (w.recoil ? 0.12 * w.recoil : 0.035));
  if (w.id === 'shotgun') { player.vel.x -= aim.dir.x * 3.2; player.vel.z -= aim.dir.z * 3.2; }
}
function spawnShot(w, o, d, charge) {
  const sp = Array.isArray(w.speed) ? lerp(w.speed[0], w.speed[1], charge) : w.speed;
  const dmg = Array.isArray(w.dmg) ? lerp(w.dmg[0], w.dmg[1], charge) : w.dmg;
  const kb = Array.isArray(w.kb) ? lerp(w.kb[0], w.kb[1], charge) : (w.kb || 1);
  if (projs.length >= MAX_PROJ) projs.shift();
  projs.push({
    w, kind: w.proj, team: 0, pos: o.clone(), vel: d.clone().multiplyScalar(sp), life: w.life, age: 0,
    r: w.r, size: w.size, dmg, kb, grav: w.grav || 0, ric: w.ric || 'none', bounce: w.bounce || 0, rest: w.rest || 0.6,
    pierce: w.pierce || 0, rehit: w.rehit || 99, stuck: 0, stuckDir: null, hit: new Map(), fx: 0,
    tracer: w.tracer ? combat.shots % w.tracer === 0 : true, col: w.color || C.spark, charge,
  });
}
let flashIdx = 0;
function flashLight(p, color, intensity) {
  const L = flashLights[flashIdx++ % flashLights.length];
  L.position.copy(p); L.color.set(color); L.intensity = intensity;
}
function muzzleFlash(w, m, dir) {
  const c = w.id === 'tesla' ? C.zapGlow : w.id === 'xbow' ? C.ice : w.color || C.flashWarm;
  const big = w.id === 'shotgun' || w.id === 'bomb';
  if (w.id !== 'bow' && w.id !== 'sling') {
    glow.spark(m.x, m.y, m.z, big ? 1.5 : 0.9, c, 1, 0);
    for (let k = 0; k < (big ? 9 : 5); k++) glow.emit(m.x, m.y, m.z, dir.x * rr(2, 7) + rr(-1, 1), dir.y * 3 + rr(0, 1.6), dir.z * rr(2, 7) + rr(-1, 1), rr(0.08, 0.18), 0.08, 0.02, c, 1, 0, 3, 1);
    flashLight(m, w.id === 'tesla' ? 0x7fe6ff : w.id === 'xbow' ? 0x9fdcff : 0xffc070, big ? 11 : 6);
  }
  if (w.id === 'bomb' || w.id === 'shotgun') for (let k = 0; k < 6; k++) dust.emit(m.x, m.y, m.z, dir.x * rr(1, 3), rr(0.3, 1), dir.z * rr(1, 3), rr(0.5, 1), 0.2, 0.7, C.smokeLight, 0.5, -0.4, 2, 0);
}
function ejectCasing(m) {
  const cr = U.camRight.value, s = -player.facing;
  dust.emit(m.x, m.y, m.z, cr.x * s * rr(1.2, 2.4) + rr(-0.5, 0.5), rr(2.2, 3.6), cr.z * s * rr(1.2, 2.4) + rr(-0.5, 0.5),
    1.6, 0.07, 0.07, C.brass, 1, 18, 0.3, 1, true);
}

/* =============================================================================
   28 · Projectiles: voxel-aware flight with different ricochets
============================================================================= */
const projs = [];
const MAX_PROJ = 320;
function updateProjectiles(dt) {
  if (dt <= 0) return;
  for (let i = projs.length - 1; i >= 0; i--) {
    const p = projs[i];
    if (p.dead) { projs.splice(i, 1); continue; }
    p.age += dt;
    if (p.stuck > 0) { p.stuck -= dt; if (p.stuck <= 0) projs.splice(i, 1); continue; }
    p.life -= dt;
    if (p.life <= 0) {
      if (p.w && p.w.aoe) explode(p.pos, p.w);
      else if (p.kind === 'orb') orbBurst(p.pos);
      projs.splice(i, 1);
      continue;
    }
    const sp = p.vel.length();
    const steps = Math.max(1, Math.ceil(sp * dt / 0.2)), h = dt / steps;
    let dead = false;
    for (let s = 0; s < steps && !dead && p.stuck <= 0; s++) {
      p.vel.y -= p.grav * h;
      if (p.ric === 'roll' && p.grounded) { const fr = Math.exp(-2.4 * h); p.vel.x *= fr; p.vel.z *= fr; }
      dead = projMove(p, h);
      if (!dead && p.stuck <= 0) dead = projHit(p);
    }
    if (dead) { projs.splice(i, 1); continue; }
    projTrail(p, dt);
  }
}
function projMove(p, h) {
  p.grounded = false;
  for (let ax = 0; ax < 3; ax++) {
    const v = ax === 0 ? p.vel.x : ax === 1 ? p.vel.y : p.vel.z;
    if (v === 0) continue;
    const nx = p.pos.x + (ax === 0 ? v * h : 0), ny = p.pos.y + (ax === 1 ? v * h : 0), nz = p.pos.z + (ax === 2 ? v * h : 0);
    if (solidAt(Math.floor(nx), Math.floor(ny), Math.floor(nz))) {
      if (projWall(p, ax)) return true;
      if (p.stuck > 0) return false;
    } else p.pos.set(nx, ny, nz);
  }
  if (p.pos.y < SEA - 0.15 && p.kind !== 'orb') {
    ripple(p.pos.x, p.pos.z, p.kind === 'bomb' ? 1.6 : 0.8);
    for (let k = 0; k < 6; k++) dust.emit(p.pos.x, SEA + 0.05, p.pos.z, rr(-1, 1), rr(1.5, 3.5), rr(-1, 1), rr(0.3, 0.6), 0.08, 0.05, C.spray, 0.9, 14, 0.5, 1);
    if (p.w && p.w.aoe) explode(p.pos, p.w);
    return true;
  }
  if (Math.abs(p.pos.x - W / 2) > 70 || Math.abs(p.pos.z - D / 2) > 70 || p.pos.y > 40) return true;
  return false;
}
function projWall(p, ax) {
  const v = p.vel, comp = ax === 0 ? 'x' : ax === 1 ? 'y' : 'z';
  const sp = v.length() || 1;
  switch (p.ric) {
    case 'mirror': {
      const grazing = Math.abs(v[comp]) / sp < 0.8;
      if (p.bounce > 0 && (p.kind === 'saw' || grazing)) { v[comp] *= -1; p.bounce--; ricochetFx(p, comp); return false; }
      return impact(p);
    }
    case 'scatter':
      if (p.bounce > 0) { v[comp] *= -0.8; v.applyAxisAngle(UPV, rr(-0.8, 0.8)); p.bounce--; ricochetFx(p, comp, 0.4); return false; }
      return impact(p);
    case 'damped':
      if (p.bounce > 0 && sp > 3) {
        v[comp] *= -p.rest;
        for (const o of ['x', 'y', 'z']) if (o !== comp) v[o] *= 0.8;
        p.bounce--; SFX.tick();
        dust.emit(p.pos.x, p.pos.y, p.pos.z, 0, 0.6, 0, 0.35, 0.12, 0.3, C.smokeLight, 0.5, 0, 2, 0);
        return false;
      }
      return impact(p);
    case 'roll':
      if (comp === 'y' && v.y < 0) {
        if (Math.abs(v.y) > 3) SFX.tock();
        v.y = Math.abs(v.y) < 2.2 ? 0 : -v.y * 0.42;
        v.x *= 0.85; v.z *= 0.85; p.grounded = true;
      } else { v[comp] *= -0.5; if (sp > 3) SFX.tock(); }
      return false;
    case 'stick':
      p.stuck = 5; p.stuckDir = v.clone(); v.set(0, 0, 0); p.grav = 0;
      SFX.thunk();
      for (let k = 0; k < 4; k++) dust.emit(p.pos.x, p.pos.y, p.pos.z, rr(-1, 1), rr(0.5, 2), rr(-1, 1), rr(0.3, 0.5), 0.07, 0.04, p.kind === 'bolt' ? C.spray : C.chip, 0.9, 10, 0.5, 1);
      if (p.kind === 'bolt') for (let k = 0; k < 6; k++) glow.emit(p.pos.x, p.pos.y, p.pos.z, rr(-1.5, 1.5), rr(0, 2), rr(-1.5, 1.5), rr(0.3, 0.6), 0.09, 0.02, C.ice, 1, 6, 1, 2);
      return false;
    default:
      return impact(p);
  }
}
function ricochetFx(p, comp, vol = 1) {
  for (let k = 0; k < 5; k++) glow.emit(p.pos.x, p.pos.y, p.pos.z, rr(-2.5, 2.5) + p.vel.x * 0.1, rr(0.5, 3), rr(-2.5, 2.5) + p.vel.z * 0.1, rr(0.15, 0.35), 0.08, 0.02, C.spark, 1, 8, 1, 1);
  if (p.kind === 'saw' || Math.random() < vol) SFX.ricochet(p.kind === 'saw');
}
function impact(p) {
  const q = p.pos;
  if (p.kind === 'bullet' || p.kind === 'pellet') {
    for (let k = 0; k < 4; k++) glow.emit(q.x, q.y, q.z, rr(-2, 2), rr(0.5, 2.5), rr(-2, 2), rr(0.12, 0.28), 0.07, 0.02, C.spark, 1, 8, 1, 1);
    dust.emit(q.x, q.y, q.z, 0, 0.4, 0, 0.4, 0.1, 0.3, C.smokeLight, 0.5, 0, 2, 0);
  } else if (p.kind === 'pebble') {
    for (let k = 0; k < 4; k++) dust.emit(q.x, q.y, q.z, rr(-1.5, 1.5), rr(0.5, 2), rr(-1.5, 1.5), rr(0.3, 0.5), 0.07, 0.05, C.smokeLight, 0.9, 10, 0.5, 1);
  } else if (p.kind === 'orb') orbBurst(q);
  if (p.w && p.w.aoe) explode(q, p.w);
  return true;
}
function breakOrb(o) {
  o.dead = true;
  orbBurst(o.pos);
  for (let k = 0; k < 6; k++) glow.emit(o.pos.x, o.pos.y, o.pos.z, rr(-3, 3), rr(-1, 3), rr(-3, 3), rr(0.2, 0.4), 0.08, 0.02, C.white, 1, 6, 1, 2);
  SFX.parry();
}
function projHit(p) {
  if (p.team === 0) {           // shots knock the warden's orbs out of the air
    for (const o of projs) {
      if (o.team !== 1 || o.dead) continue;
      const rr2 = o.r + p.r + 0.12;
      if (o.pos.distanceToSquared(p.pos) > rr2 * rr2) continue;
      breakOrb(o);
      if (p.pierce > 0) { p.pierce--; return false; }
      return p.kind !== 'saw';
    }
  }
  if (p.team === 1) {
    if (G.state === 'play' && player.respawn <= 0) {
      const dx = player.pos.x - p.pos.x, dy = player.pos.y + 0.75 - p.pos.y, dz = player.pos.z - p.pos.z;
      if (dx * dx + dy * dy + dz * dz < (0.5 + p.r) ** 2) { hurt(1, p.pos.x, p.pos.z); orbBurst(p.pos); return true; }
    }
    return false;
  }
  for (const f of foes) {
    if (!foeAlive(f)) continue;
    const hd = f.segs[0];
    if (Math.abs(hd.x - p.pos.x) > f.extent || Math.abs(hd.z - p.pos.z) > f.extent) continue;
    for (let k = 0; k < f.n; k++) {
      const s = f.segs[k], rr2 = segRad(f, k) + p.r;
      if (s.distanceToSquared(p.pos) > rr2 * rr2) continue;
      const last = p.hit.get(f);
      if (last !== undefined && p.age - last < p.rehit) break;
      p.hit.set(f, p.age);
      const sp = Math.hypot(p.vel.x, p.vel.z) || 1;
      damageFoe(f, p.dmg, p.vel.x / sp, p.vel.z / sp, { kb: p.kb, freeze: p.w.freeze, at: s, w: p.w });
      if (p.w.aoe) { explode(p.pos, p.w); return true; }
      if (p.w.foeBounce && p.bounce > 0) {
        const n = tmpA.subVectors(p.pos, s);
        if (n.lengthSq() < 1e-6) n.set(-p.vel.x, 0, -p.vel.z);
        n.normalize();
        p.vel.reflect(n).multiplyScalar(0.8); p.vel.y = Math.abs(p.vel.y) + 2;
        p.pos.copy(s).addScaledVector(n, rr2 + 0.03);
        p.bounce--; SFX.tick();
        return false;
      }
      if (p.pierce > 0) { p.pierce--; return false; }
      return true;
    }
  }
  return false;
}
function explode(pos, w) {
  const R = w.aoe, q = tmpC.copy(pos);
  for (const f of foes) {
    if (!foeAlive(f)) continue;
    const h = f.segs[0], d = h.distanceTo(q);
    if (d > R + f.def.rad) continue;
    const fall = 1 - clamp(d / (R + f.def.rad), 0, 1) * 0.6;
    damageFoe(f, w.dmg * fall, (h.x - q.x) / (d || 1), (h.z - q.z) / (d || 1), { kb: w.kb * fall, burn: { dps: 4, t: 1.5 }, at: h, w });
  }
  const pd = Math.hypot(player.pos.x - q.x, player.pos.z - q.z);
  if (pd < R && G.state === 'play') {
    const k = (1 - pd / R) * 7;
    player.vel.x += (player.pos.x - q.x) / (pd || 1) * k; player.vel.z += (player.pos.z - q.z) / (pd || 1) * k;
    player.vel.y = Math.max(player.vel.y, k * 0.8); player.onGround = false;
  }
  blastLeaves(q, R * 0.8);
  for (let k = 0; k < 34; k++) glow.emit(q.x, q.y + 0.2, q.z, rr(-4, 4), rr(0.5, 6), rr(-4, 4), rr(0.3, 0.7), rr(0.3, 0.6), 0.05, k % 3 ? C.fire : C.flashWarm, 1, 2, 2.5, 0);
  for (let k = 0; k < 16; k++) glow.emit(q.x, q.y + 0.2, q.z, rr(-6, 6), rr(2, 8), rr(-6, 6), rr(0.4, 0.9), 0.09, 0.03, C.spark, 1, 14, 0.5, 1);
  for (let k = 0; k < 18; k++) dust.emit(q.x + rr(-0.6, 0.6), q.y + rr(0, 0.8), q.z + rr(-0.6, 0.6), rr(-1.5, 1.5), rr(0.8, 2.4), rr(-1.5, 1.5), rr(1, 1.8), 0.5, 1.6, C.smokeLight, 0.6, -0.5, 1.5, 0);
  combat.waves.push({ x: q.x, y: Math.max(groundBelow(q.x, q.y + 0.5, q.z), SEA) + 0.1, z: q.z, r: R, t: 0, dur: 0.4, col: C.fire });
  flashLight(q, 0xffa040, 18);
  const cd = camera.position.distanceTo(q);
  rig.trauma = Math.min(1, rig.trauma + clamp(1.1 - cd / 20, 0.15, 0.7));
  if (q.y < SEA + 1.2) ripple(q.x, q.z, 2);
  SFX.explode();
}
function orbBurst(q) {
  for (let k = 0; k < 10; k++) glow.emit(q.x, q.y, q.z, rr(-2, 2), rr(-1, 2), rr(-2, 2), rr(0.3, 0.5), 0.12, 0.02, C.orbCore, 1, 0, 2, 1);
}
function projTrail(p, dt) {
  p.fx -= dt;
  if (p.fx > 0) return;
  const q = p.pos;
  switch (p.kind) {
    case 'bomb': p.fx = 0.03; glow.emit(q.x, q.y + 0.3, q.z, rr(-0.3, 0.3), rr(0.5, 1.2), rr(-0.3, 0.3), rr(0.15, 0.3), 0.08, 0.02, C.spark, 1, 3, 1, 1);
      dust.emit(q.x, q.y + 0.2, q.z, 0, 0.5, 0, 0.6, 0.12, 0.3, C.smokeLight, 0.35, -0.2, 1, 0); break;
    case 'bolt': p.fx = 0.025; glow.emit(q.x, q.y, q.z, rr(-0.3, 0.3), rr(-0.3, 0.3), rr(-0.3, 0.3), rr(0.2, 0.4), 0.09, 0.02, C.ice, 0.8, 0, 2, 2); break;
    case 'saw': p.fx = 0.05; glow.emit(q.x, q.y, q.z, rr(-1, 1), rr(0, 1.5), rr(-1, 1), rr(0.1, 0.25), 0.06, 0.02, C.spark, 0.9, 6, 1, 1); break;
    case 'orb': p.fx = 0.04; glow.emit(q.x, q.y, q.z, 0, 0, 0, rr(0.3, 0.5), 0.3, 0.05, C.orbHalo, 0.6, 0, 0, 0); break;
    case 'arrow': p.fx = 0.05; if (p.charge > 0.85) glow.emit(q.x, q.y, q.z, 0, 0, 0, 0.25, 0.08, 0.02, C.white, 0.6, 0, 0, 1); break;
    default: p.fx = 1;
  }
}

/* =============================================================================
   29 · Tesla chain lightning and the prism beam (hitscan, reflections)
============================================================================= */
function marchVoxel(o, d, maxT) {
  let px = Math.floor(o.x), py = Math.floor(o.y), pz = Math.floor(o.z);
  for (let t = 0.05; t <= maxT; t += 0.07) {
    const x = o.x + d.x * t, y = o.y + d.y * t, z = o.z + d.z * t;
    if (y < SEA && d.y < 0) return { t, point: new THREE.Vector3(x, SEA + 0.02, z), axis: 1, water: true };
    const cx = Math.floor(x), cy = Math.floor(y), cz = Math.floor(z);
    if (cx === px && cy === py && cz === pz) continue;
    if (solidAt(cx, cy, cz)) {
      let axis = cx !== px ? 0 : cy !== py ? 1 : 2;
      const changed = (cx !== px) + (cy !== py) + (cz !== pz);
      if (changed > 1) {
        const ad = [Math.abs(d.x) * (cx !== px), Math.abs(d.y) * (cy !== py), Math.abs(d.z) * (cz !== pz)];
        axis = ad[0] >= ad[1] && ad[0] >= ad[2] ? 0 : ad[1] >= ad[2] ? 1 : 2;
      }
      return { t, point: new THREE.Vector3(x - d.x * 0.05, y - d.y * 0.05, z - d.z * 0.05), axis, water: false };
    }
    px = cx; py = cy; pz = cz;
  }
  return null;
}
function teslaChain(w, o, dir) {
  let first = null, best = 1e9;
  for (const f of foes) {
    if (!foeAlive(f)) continue;
    const h = f.segs[0], dx = h.x - o.x, dz = h.z - o.z, d = Math.hypot(dx, dz);
    if (d > w.range + f.def.rad) continue;
    const cos = (dx * dir.x + dz * dir.z) / ((d || 1) * Math.hypot(dir.x, dir.z) || 1);
    if (cos < 0.72 && f !== aim.target) continue;
    const s = d * (2 - cos) * (f === aim.target ? 0.6 : 1);
    if (s < best) { best = s; first = f; }
  }
  const pts = [o.clone()];
  if (!first) {
    const hit = marchVoxel(o, dir, w.range);
    const end = hit ? hit.point : o.clone().addScaledVector(dir, w.range);
    pts.push(end);
    for (let k = 0; k < 6; k++) glow.emit(end.x, end.y, end.z, rr(-2, 2), rr(0, 2.5), rr(-2, 2), rr(0.15, 0.35), 0.08, 0.02, C.zapCore, 1, 6, 1, 1);
  } else {
    const hitSet = new Set();
    let cur = first, dmg = w.dmg;
    while (cur && hitSet.size <= w.jumps) {
      hitSet.add(cur);
      const h = cur.segs[0], prev = pts[pts.length - 1];
      pts.push(h.clone());
      const dx = h.x - prev.x, dz = h.z - prev.z, d = Math.hypot(dx, dz) || 1;
      damageFoe(cur, dmg, dx / d, dz / d, { kb: 1.5, stun: w.stun, shock: true, at: h, w });
      dmg *= 0.82;
      let next = null, nd = w.jumpR;
      for (const f of foes) {
        if (!foeAlive(f) || hitSet.has(f)) continue;
        const dd = f.segs[0].distanceTo(h);
        if (dd < nd) { nd = dd; next = f; }
      }
      cur = next;
    }
  }
  combat.bolts.push({ pts, life: 0.22, full: 0.22 });
}
function updateBeam(dt, w) {
  const firing = input.atk && !combat.over && G.state === 'play' && combat.dash <= 0;
  if (firing) { combat.heat = Math.min(w.heat, combat.heat + dt); if (combat.heat >= w.heat) { combat.over = true; SFX.overheat(); } }
  else combat.heat = Math.max(0, combat.heat - dt * (combat.over ? w.heat / w.cool : 1.3));
  if (combat.over && combat.heat <= 0) combat.over = false;
  const on = firing && !combat.over;
  if (on !== combat.beam.on) { combat.beam.on = on; SFX.beam(on); }
  combat.beam.segs.length = 0;
  if (!on) return;
  combat.lastAtk = 0;
  let o = muzzleWorld(new THREE.Vector3());
  if (solidAt(Math.floor(o.x), Math.floor(o.y), Math.floor(o.z))) o.set(player.pos.x, player.pos.y + 0.85, player.pos.z);
  const cp = Math.cos(aim.pitch);
  const d = new THREE.Vector3(aim.dir.x * cp, Math.sin(aim.pitch), aim.dir.z * cp);
  let left = w.range;
  for (let b = 0; b <= w.reflect && left > 0.2; b++) {
    const hit = marchVoxel(o, d, left);
    const end = hit ? hit.point : o.clone().addScaledVector(d, left);
    combat.beam.segs.push([o.clone(), end.clone()]);
    beamDamage(o, end, w.dps * dt, w);
    if (!hit) break;
    left -= hit.t;
    if (hit.axis === 0) d.x = -d.x; else if (hit.axis === 1) d.y = -d.y; else d.z = -d.z;
    if (Math.random() < 0.6) glow.emit(end.x, end.y, end.z, rr(-2, 2), rr(0, 2.5), rr(-2, 2), rr(0.15, 0.3), 0.08, 0.02, hit.water ? C.spray : C.beamCore, 1, 6, 1, 1);
    if (hit.water && Math.random() < 0.2) ripple(end.x, end.z, 0.7);
    o = end.addScaledVector(d, 0.06);
  }
  combat.recoil = Math.max(combat.recoil, 0.15 + Math.random() * 0.1);
  rig.trauma = Math.max(rig.trauma, 0.12);
}
const _bp = new THREE.Vector3();
function beamDamage(a, b, dmg, w) {
  const ab = _rd.subVectors(b, a), L2 = ab.lengthSq() || 1;
  for (const f of foes) {
    if (!foeAlive(f)) continue;
    for (let k = 0; k < f.n; k++) {
      const s = f.segs[k];
      const t = clamp(_rv.subVectors(s, a).dot(ab) / L2, 0, 1);
      _bp.copy(a).addScaledVector(ab, t);
      const r = segRad(f, k) + 0.3;
      if (_bp.distanceToSquared(s) > r * r) continue;
      damageFoe(f, dmg, ab.x / Math.sqrt(L2), ab.z / Math.sqrt(L2), { kb: 0.4, quiet: true, at: s, w });
      if (Math.random() < 0.3) glow.emit(s.x, s.y, s.z, rr(-2, 2), rr(0, 2), rr(-2, 2), rr(0.15, 0.3), 0.08, 0.02, C.beamCore, 1, 4, 1, 1);
      break;
    }
  }
}

/* =============================================================================
   30 · Foes: imps from the start, shades at dusk, the beacon warden at the end.
        Segmented bodies: the head steers with inertia, the body follows on a rope,
        a travelling wave ripples through it; hits ripple back as knockback.
============================================================================= */
const FOE = {
  imp: { name: 'Бесёнок', seg: 5, rad: 0.34, spacing: 0.27, hp: 24, wander: 1.9, chase: 3.3, chaseR: 7, dmg: 1, eye: 0.09, eyeGap: 0.1, soul: 0.18, hover: 0.95, danger: 0.5 },
  shade: { name: 'Тень', seg: 9, rad: 0.52, spacing: 0.36, hp: 70, wander: 1.8, chase: 3.0, chaseR: 8, dmg: 1, eye: 0.12, eyeGap: 0.15, soul: 0.4, hover: 1.2, danger: 1 },
  warden: { name: 'Страж маяка', seg: 16, rad: 1.15, spacing: 0.62, hp: 700, wander: 1.5, chase: 2.6, chaseR: 15, dmg: 2, eye: 0.24, eyeGap: 0.34, soul: 1, hover: 2.3, danger: 1, boss: true },
};
let foes = [];
const souls = [];
const foeAlive = (f) => f.state !== 'dissolve' && f.hp > 0;
const segRad = (f, k) => f.def.rad * (1 - 0.58 * k / (f.n - 1));
function spawnFoe(type, x, y, z, rising) {
  if (foes.length >= MAX_FOES) return null;
  const def = FOE[type];
  const f = {
    type, def, n: def.seg, segs: [], vel: new THREE.Vector3(), kb: new THREE.Vector3(), state: rising ? 'rise' : 'wander', t: 0, alpha: rising ? 0 : 1,
    target: new THREE.Vector3(x, y, z), seed: Math.random() * 50, timer: 0, blink: 0, trail: 0, extent: def.seg * def.spacing + def.rad + 1,
    hp: def.hp, maxHp: def.hp, flash: 0, stun: 0, slow: 0, burn: 0, burnDps: 0, burnTick: 0, shock: 0, hitT: 0, numAcc: 0, numT: 0, fireT: 3, charge: 0,
    mode: 'orbit', modeT: 4.5, orbitA: 0, orbitDir: 1, diveTo: new THREE.Vector3(), locked: false, soulAcc: 0,
  };
  for (let k = 0; k < f.n; k++) f.segs.push(new THREE.Vector3(x, y - k * 0.25, z));
  foes.push(f);
  return f;
}
function seaSpot(minD, maxD) {
  const spots = world.seaSpots;
  let pick = spots[0], bestS = -1e9;
  for (let k = 0; k < 40; k++) {
    const sp = spots[Math.floor(Math.random() * spots.length)];
    const d = Math.hypot(sp[0] + 0.5 - player.pos.x, sp[1] + 0.5 - player.pos.z);
    const s = d > minD && d < maxD ? 100 - Math.abs(d - (minD + maxD) / 2) : -Math.abs(d - minD);
    if (s > bestS) { bestS = s; pick = sp; }
  }
  return pick;
}
function spawnFromSea(type) {
  if (!world.seaSpots.length) return;
  const sp = type === 'imp' ? seaSpot(11, 22) : seaSpot(14, 30);
  const x = sp[0] + 0.5, z = sp[1] + 0.5;
  spawnFoe(type, x, SEA - 0.6, z, true);
  if (type === 'shade' && !G.firstShade) { G.firstShade = true; toast('Тени просыпаются…', 3000, true); }
  SFX.rise(); ripple(x, z, 1.6);
  for (let k = 0; k < 16; k++) dust.emit(x + rr(-0.4, 0.4), SEA + 0.1, z + rr(-0.4, 0.4), rr(-0.6, 0.6), rr(0.5, 2), rr(-0.6, 0.6), rr(0.9, 1.6), 0.4, 1.1, C.smoke, 0.6, -0.3, 1, 0);
}
function spawnWarden() {
  G.wardenSpawned = true;
  const r = world.ring, b = world.beacon;
  const x = r.x + (r.x - b.x) * 1.4, z = r.z + (r.z - b.z) * 1.4;
  const f = spawnFoe('warden', x, world.tower.base - 2.5, z, true);
  if (f) { f.target.set(x, world.tower.base + 3, z); G.warden = f; f.orbitA = Math.atan2(z - player.pos.z, x - player.pos.x); }
  G.bossCam = 2.6;
  SFX.roar();
  rig.trauma = Math.min(1, rig.trauma + 0.6);
  toast('Страж маяка пробудился!', 3600, true, 3);
  for (let k = 0; k < 40; k++) dust.emit(x + rr(-1.5, 1.5), world.tower.base + 0.2, z + rr(-1.5, 1.5), rr(-2, 2), rr(1, 4), rr(-2, 2), rr(1, 2), 0.6, 1.6, C.smoke, 0.7, -0.4, 1, 0);
}
function wanted(type) {
  if (G.state !== 'play') return 0;
  const c = G.collected;
  if (type === 'imp') return G.play < 9 ? 0 : Math.min(4, 1 + Math.floor(c / 5));
  if (type === 'shade') return c < 2 ? 0 : Math.min(3, 1 + Math.floor((c - 2) / 5)) + (G.all ? 1 : 0);
  return 0;
}
function damageFoe(f, amount, dirX, dirZ, o = {}) {
  if (!foeAlive(f)) return false;
  let dmg = amount, kind = '';
  if (o.crit && Math.random() < o.crit) { dmg *= o.critMul || 2; kind = 'crit'; }
  if (f.def.boss && f.mode === 'recover' && !o.silent) { dmg *= 1.5; if (!o.dot && !o.quiet) kind = 'crit'; }
  if (o.dot) kind = o.dot;
  else if (o.freeze) kind = 'frost';
  else if (o.shock) kind = 'shock';
  f.hp -= dmg;
  f.hitT = 2.5;
  if (!o.dot) f.flash = Math.max(f.flash, o.quiet ? 0.35 : 1);
  const boss = f.def.boss;
  const kb = (o.kb || 0) * (boss ? 0.2 : 1);
  f.kb.x += dirX * kb; f.kb.z += dirZ * kb;
  if (o.stun) f.stun = Math.max(f.stun, o.stun * (boss ? 0.35 : 1));
  if (o.freeze) f.slow = Math.max(f.slow, o.freeze);
  if (o.burn) { f.burn = Math.max(f.burn, o.burn.t); f.burnDps = Math.max(f.burnDps, o.burn.dps); }
  if (o.shock) f.shock = 0.35;
  if (f.state === 'wander' || f.state === 'flee') { f.state = 'chase'; f.timer = 0; }
  if (o.leech) {
    combat.leech += dmg;
    while (combat.leech >= o.leech) {
      combat.leech -= o.leech;
      if (player.hp < HP_MAX) { player.hp++; updateHearts(false); dmgNumber(tmpE.set(player.pos.x, player.pos.y + 1.6, player.pos.z), 1, 'heal'); }
    }
  }
  const at = o.at || f.segs[0];
  if (o.silent) { /* debug kill: no numbers, no sparks */ }
  else if (o.quiet) {
    f.numAcc += dmg;
    if (G.time - f.numT > 0.25) { dmgNumber(at, f.numAcc, 'beam'); f.numAcc = 0; f.numT = G.time; }
  } else {
    dmgNumber(at, dmg, kind);
    const c = kind === 'frost' ? C.ice : kind === 'shock' ? C.zapCore : kind === 'burn' ? C.fire : C.hitSpark;
    if (!o.dot) for (let k = 0; k < (kind === 'crit' ? 12 : 7); k++) glow.emit(at.x, at.y, at.z, dirX * rr(1, 4) + rr(-1.5, 1.5), rr(0.5, 3), dirZ * rr(1, 4) + rr(-1.5, 1.5), rr(0.15, 0.35), 0.1, 0.02, c, 1, 8, 1, kind === 'crit' ? 2 : 1);
    if (!o.dot) SFX.hit(Math.min(3, dmg / 15), kind === 'crit');
  }
  if (f.def.boss && !o.silent) {
    f.soulAcc += dmg;
    if (f.soulAcc >= 110 && f.hp > 0) { f.soulAcc -= 110; dropSoul(at, 1); }
  }
  if (f.hp <= 0) killFoe(f);
  return true;
}
function killFoe(f) {
  f.state = 'dissolve'; f.hp = 0;
  G.kills++;
  const h = f.segs[0];
  const big = !!f.def.boss;
  for (const s of f.segs) {
    for (let k = 0; k < (big ? 6 : 3); k++) glow.emit(s.x, s.y, s.z, rr(-2, 2), rr(0.5, 3), rr(-2, 2), rr(0.5, 1), 0.14, 0.02, C.violet, 1, -0.5, 1, 1);
    dust.emit(s.x, s.y, s.z, rr(-1, 1), rr(0.5, 1.5), rr(-1, 1), rr(0.8, 1.4), segRad(f, 0) * 0.8, segRad(f, 0) * 1.6, C.smoke, 0.6, -0.3, 1.2, 0);
  }
  SFX.foeDie(big);
  rig.trauma = Math.min(1, rig.trauma + (big ? 0.8 : 0.12));
  if (Math.random() < f.def.soul) dropSoul(h, big ? 6 : 1);
  if (big) {
    G.wardenDown = true; G.warden = null;
    G.flash = 0.45; FX.uFlashColor.value.setRGB(0.95, 0.75, 1);
    combat.waves.push({ x: h.x, y: Math.max(groundBelow(h.x, h.y, h.z), SEA) + 0.1, z: h.z, r: 7, t: 0, dur: 0.9, col: C.violet });
    toast('Страж повержен — зажги маяк!', 4200, false, 3);
  }
}
function dropSoul(p, n = 1) {
  for (let i = 0; i < n; i++) souls.push({ pos: p.clone(), vel: new THREE.Vector3(rr(-1.5, 1.5), rr(2, 4), rr(-1.5, 1.5)), t: -i * 0.15 });
}
function updateSouls(dt) {
  for (let i = souls.length - 1; i >= 0; i--) {
    const s = souls[i];
    s.t += dt;
    if (s.t < 0) continue;
    if (s.t < 0.7) s.vel.multiplyScalar(Math.exp(-3 * dt));
    else {
      const to = tmpA.set(player.pos.x - s.pos.x, player.pos.y + 0.8 - s.pos.y, player.pos.z - s.pos.z);
      const d = to.length();
      s.vel.lerp(to.multiplyScalar(10 / (d || 1)), damp(4, dt));
      if (d < 0.6 && G.state === 'play') {
        if (player.hp < HP_MAX) { player.hp++; updateHearts(false); dmgNumber(tmpE.set(player.pos.x, player.pos.y + 1.6, player.pos.z), 1, 'heal'); }
        SFX.soul();
        souls.splice(i, 1);
        continue;
      }
    }
    s.pos.addScaledVector(s.vel, dt);
    if (s.t > 14) souls.splice(i, 1);
  }
}
function renderSouls() {
  for (const s of souls) {
    if (s.t < 0) continue;
    const fl = 0.85 + 0.15 * Math.sin(G.time * 12 + s.t * 7);
    glow.spark(s.pos.x, s.pos.y, s.pos.z, 0.26, C.soul, fl, 0);
    glow.spark(s.pos.x, s.pos.y, s.pos.z, 0.9, C.soulHalo, 0.35 * fl, 0);
  }
}
function updateFoes(dt) {
  const px = player.pos.x, py = player.pos.y + 0.75, pz = player.pos.z;
  const prog = G.total ? G.collected / G.total : 0;
  const canChase = G.state === 'play' && player.respawn <= 0;
  if (dt > 0) {
    G.spawnT -= dt;
    if (G.spawnT <= 0 && G.state === 'play') {
      for (const type of ['shade', 'imp']) {
        if (foes.filter((f) => f.type === type && f.state !== 'dissolve').length < wanted(type)) { spawnFromSea(type); G.spawnT = type === 'imp' ? 3 : 4; break; }
      }
    }
    if (G.all && !G.wardenSpawned && G.state === 'play') { G.wardenT -= dt; if (G.wardenT <= 0) spawnWarden(); }
  }
  let danger = 0;
  for (let i = foes.length - 1; i >= 0; i--) {
    const f = foes[i], def = f.def, head = f.segs[0];
    f.t += dt;
    f.flash = Math.max(0, f.flash - dt * 7);
    f.stun = Math.max(0, f.stun - dt); f.slow = Math.max(0, f.slow - dt); f.shock = Math.max(0, f.shock - dt); f.hitT = Math.max(0, f.hitT - dt);
    if (f.burn > 0 && f.state !== 'dissolve') {
      f.burn -= dt; f.burnTick -= dt;
      if (f.burnTick <= 0) { f.burnTick = 0.5; damageFoe(f, f.burnDps * 0.5, 0, 0, { dot: 'burn', at: head }); }
      if (Math.random() < dt * 30) { const s = f.segs[Math.floor(Math.random() * f.n)]; glow.emit(s.x + rr(-0.2, 0.2), s.y, s.z + rr(-0.2, 0.2), 0, rr(1, 2.4), 0, rr(0.3, 0.6), 0.16, 0.02, C.fire, 1, -1, 1, 0); }
    }
    const dxp = px - head.x, dzp = pz - head.z, dist = Math.hypot(dxp, dzp);
    const chaseR = def.chaseR + prog * 4;
    if (f.state === 'rise') {
      f.alpha = Math.min(1, f.alpha + dt * 0.9);
      if (f.t > 1.8) { f.state = def.boss ? 'chase' : 'wander'; f.timer = 0; }
    } else if (f.state === 'wander') {
      f.timer -= dt;
      if (f.timer <= 0 || Math.hypot(f.target.x - head.x, f.target.z - head.z) < 1.5) {
        const c = world.landCells[Math.floor(Math.random() * world.landCells.length)];
        f.target.set(lerp(c[0] + 0.5, px, 0.35), 0, lerp(c[1] + 0.5, pz, 0.35));
        f.timer = rr(4, 8);
      }
      if (canChase && dist < chaseR && player.invuln < 0.2 && !f.hold) f.state = 'chase';
    } else if (f.state === 'chase') {
      if (def.boss) bossThink(f, dt, px, pz, dist);
      else {
        f.target.set(px, 0, pz);
        if (!canChase || dist > chaseR + 6) { f.state = 'wander'; f.timer = 0; }
      }
    } else if (f.state === 'flee') {
      f.timer -= dt;
      f.target.set(head.x - dxp * 3, 0, head.z - dzp * 3);
      if (f.timer <= 0) { f.state = def.boss ? 'chase' : 'wander'; f.timer = 0; }
    } else if (f.state === 'dissolve') {
      f.alpha -= dt * (def.boss ? 0.35 : 0.6);
      for (const sg of f.segs) sg.y += dt * (0.6 + Math.random());
      if (Math.random() < 0.6) { const sg = f.segs[Math.floor(Math.random() * f.n)]; glow.emit(sg.x, sg.y, sg.z, rr(-1, 1), rr(0.5, 2), rr(-1, 1), rr(0.6, 1.2), 0.12, 0.02, C.violet, 0.9, -0.5, 1, 1); }
      if (f.alpha <= 0) { foes.splice(i, 1); continue; }
    }
    if (f.state !== 'dissolve' && dt > 0) {
      let sp = f.state === 'chase' ? def.chase + prog * (def.boss ? 0.6 : 1.1) : f.state === 'flee' ? 4.4 : f.state === 'rise' ? 0.4 : def.wander;
      const bm = def.boss && f.state === 'chase' ? f.mode : '';
      if (bm === 'dive') sp = 12.5; else if (bm === 'windup') sp = 0.5; else if (bm === 'recover') sp = 0.7;
      if (f.slow > 0) sp *= 0.35;
      if (f.stun > 0 || f.hold) sp = 0;
      let tx = f.target.x - head.x, tz = f.target.z - head.z;
      const L = Math.hypot(tx, tz);
      if (L > 0.01) { tx *= sp / Math.max(L, bm === 'orbit' ? 1.2 : 0.01); tz *= sp / Math.max(L, bm === 'orbit' ? 1.2 : 0.01); }
      const k = damp(f.stun > 0 ? 6 : bm === 'dive' ? 9 : f.state === 'chase' ? 2.4 : 1.3, dt);
      f.vel.x += (tx - f.vel.x) * k; f.vel.z += (tz - f.vel.z) * k;
      head.x = clamp(head.x + (f.vel.x + f.kb.x) * dt, -8, W + 8);
      head.z = clamp(head.z + (f.vel.z + f.kb.z) * dt, -8, D + 8);
      f.kb.multiplyScalar(Math.exp(-5 * dt));
      if (f.stun > 0) { head.x += rr(-0.04, 0.04); head.z += rr(-0.04, 0.04); }
      let ty;
      if (f.state === 'rise') ty = def.boss ? world.tower.base + 3 : SEA + 1.4;
      else {
        const gnd = Math.max(terrainTop(head.x, head.z), SEA);
        ty = gnd + def.hover + 0.3 * Math.sin(f.t * 1.7 + f.seed);
        if (f.state === 'chase' && dist < 4 && !def.boss) ty = lerp(ty, py, 0.6);
        if (bm === 'windup') ty = gnd + def.hover + 1.1;
        else if (bm === 'dive') ty = gnd + 0.95;
        else if (bm === 'recover') ty = gnd + 1.05 + 0.15 * Math.sin(f.t * 3);
      }
      head.y += (ty - head.y) * damp(f.state === 'rise' ? 1.2 : bm === 'dive' ? 7 : 2.6, dt);
      if (bm === 'orbit') wardenFire(f, dt, dist);
    }
    for (let k = 1; k < f.n; k++) {
      const a = f.segs[k - 1], b = f.segs[k];
      const ddx = b.x - a.x, ddy = b.y - a.y, ddz = b.z - a.z;
      const L = Math.hypot(ddx, ddy, ddz) || 1e-4;
      if (L > def.spacing) { const q = def.spacing / L; b.set(a.x + ddx * q, a.y + ddy * q, a.z + ddz * q); }
      b.y += Math.sin(f.t * 2.0 - k * 0.5 + f.seed) * 0.15 * dt;
    }
    if (f.state !== 'rise' && f.state !== 'dissolve' && f.alpha > 0.6 && canChase && f.stun <= 0 && !f.hold && (!def.boss || f.mode === 'dive')) {
      for (let k = 0; k < 3; k++) {
        const sg = f.segs[k], rr2 = segRad(f, k) + 0.32;
        if (Math.hypot(px - sg.x, (py - sg.y) * 0.8, pz - sg.z) < rr2) {
          if (hurt(def.dmg, sg.x, sg.z) && !def.boss) { f.state = 'flee'; f.timer = 2.6; }
          break;
        }
      }
    }
    if (f.state !== 'dissolve') danger = Math.max(danger, smooth(9, 2.4, Math.hypot(px - head.x, py - head.y, pz - head.z)) * def.danger);
    f.trail -= dt;
    if (f.trail <= 0 && f.alpha > 0.2) {
      f.trail = def.boss ? 0.04 : 0.07;
      const tl = f.segs[f.n - 1], s = segRad(f, f.n - 1);
      dust.emit(tl.x + rr(-0.1, 0.1), tl.y, tl.z + rr(-0.1, 0.1), rr(-0.2, 0.2), rr(0.1, 0.5), rr(-0.2, 0.2), rr(0.8, 1.4), s * 1.6, s * 4, C.smoke, 0.45 * f.alpha, -0.2, 1.2, 0);
    }
    f.blink -= dt;
    if (f.blink < -rr(2.5, 5)) f.blink = 0.12;
  }
  G.dangerT = danger;
}
function bossThink(f, dt, px, pz, dist) {
  const b = world.beacon, h = f.segs[0];
  const away = Math.hypot(px - b.x, pz - b.z) > 19;
  const rage = f.hp < f.maxHp * 0.5;
  f.modeT -= dt;
  switch (f.mode) {
    case 'orbit': {
      if (away) { f.target.set(b.x + Math.cos(f.t * 0.4) * 7, 0, b.z + Math.sin(f.t * 0.4) * 7); break; }    // guards the hill
      f.orbitA += dt * (rage ? 0.7 : 0.5) * f.orbitDir;
      f.target.set(px + Math.cos(f.orbitA) * 4.4, 0, pz + Math.sin(f.orbitA) * 4.4);
      if (f.modeT <= 0 && f.charge <= 0 && dist < 13 && G.state === 'play') {
        f.mode = 'windup'; f.modeT = rage ? 0.8 : 1.0; f.locked = false;
        SFX.windup();
      }
      break;
    }
    case 'windup': {
      f.target.set(h.x, 0, h.z);
      const k = 1 - f.modeT / (rage ? 0.8 : 1.0);
      glow.spark(h.x, h.y, h.z, 1.4 + k * 2.6, C.orbHalo, 0.35 + k * 0.4, 0);
      if (Math.random() < 0.7) glow.emit(h.x + rr(-2, 2), h.y + rr(-1.5, 1.5), h.z + rr(-2, 2), 0, 0, 0, 0.25, 0.12, 0.02, C.orbCore, 1, 0, 0, 1);
      if (!f.locked && f.modeT < 0.35) {       // the landing spot is locked (and marked) a beat before the dive
        f.locked = true;
        f.diveTo.set(px, Math.max(groundBelow(px, player.pos.y + 0.5, pz), SEA), pz);
      }
      if (f.modeT <= 0) { f.mode = 'dive'; f.modeT = 1.1; SFX.dash(); rig.trauma = Math.min(1, rig.trauma + 0.2); }
      break;
    }
    case 'dive':
      f.target.set(f.diveTo.x, 0, f.diveTo.z);
      if (Math.hypot(f.diveTo.x - h.x, f.diveTo.z - h.z) < 0.9 || f.modeT <= 0) { bossImpact(f, rage); f.mode = 'recover'; f.modeT = rage ? 1.5 : 2.0; }
      break;
    case 'recover':
      f.target.set(h.x, 0, h.z);
      if (Math.random() < dt * 8) glow.emit(h.x + rr(-0.8, 0.8), h.y + 0.6, h.z + rr(-0.8, 0.8), 0, rr(0.5, 1.4), 0, rr(0.5, 0.9), 0.16, 0.03, C.violet, 0.8, -0.3, 1, 1);
      if (f.modeT <= 0) {
        f.mode = 'orbit'; f.modeT = rage ? rr(4.5, 6) : rr(6.5, 8.5);
        f.orbitDir = Math.random() < 0.5 ? 1 : -1; f.orbitA = Math.atan2(h.z - pz, h.x - px);
        f.fireT = Math.min(f.fireT, 1.2);
      }
      break;
  }
}
function bossImpact(f, rage) {
  const h = f.segs[0];
  const gy = Math.max(groundBelow(h.x, h.y + 0.5, h.z), SEA);
  // the shockwave rolls outward along the ground: jumping over its ring dodges it
  combat.waves.push({ x: h.x, y: gy + 0.08, z: h.z, r: 4.2, t: 0, dur: 0.6, col: C.violet, hurt: true, hit: false });
  for (let k = 0; k < 30; k++) {
    const an = k / 30 * TAU;
    dust.emit(h.x + Math.cos(an) * 0.6, gy + 0.1, h.z + Math.sin(an) * 0.6, Math.cos(an) * rr(4, 7), rr(0.5, 2), Math.sin(an) * rr(4, 7), rr(0.5, 0.9), 0.25, 0.8, C.dirt, 0.7, 2, 3, 0);
  }
  for (let k = 0; k < 18; k++) glow.emit(h.x, gy + 0.3, h.z, rr(-4, 4), rr(2, 6), rr(-4, 4), rr(0.4, 0.8), 0.12, 0.03, C.violet, 1, 8, 1, 1);
  if (gy <= SEA + 0.1) ripple(h.x, h.z, 2.5);
  flashLight(tmpE.set(h.x, gy + 1, h.z), 0xc070ff, 16);
  rig.trauma = Math.min(1, rig.trauma + clamp(1 - Math.hypot(player.pos.x - h.x, player.pos.z - h.z) / 14, 0.15, 0.7));
  SFX.slam();
  if (rage) {         // furious: a ring of orbs bursts out of the crater
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * TAU + f.t;
      spawnOrb(tmpE.set(h.x, gy + 1.0, h.z), Math.cos(a) * 5.5, 0, Math.sin(a) * 5.5);
    }
  }
}
function spawnOrb(pos, vx, vy, vz) {
  projs.push({ w: null, kind: 'orb', team: 1, pos: pos.clone(), vel: new THREE.Vector3(vx, vy, vz), life: 3.2, age: 0,
    r: 0.32, size: 0.5, dmg: 1, kb: 0, grav: 0, ric: 'none', bounce: 0, rest: 0, pierce: 0, rehit: 99, stuck: 0, hit: new Map(), fx: 0, tracer: true, col: C.orbCore });
}
function wardenFire(f, dt, dist) {
  f.fireT -= dt;
  if (f.charge > 0) {
    f.charge -= dt;
    const h = f.segs[0];
    glow.spark(h.x, h.y, h.z, 1.2 + (0.7 - f.charge) * 2, C.orbHalo, 0.5, 0);
    if (f.charge <= 0) {
      const dx = player.pos.x - h.x, dz = player.pos.z - h.z, dy = player.pos.y + 0.8 - h.y;
      const base = Math.atan2(dz, dx), d = Math.hypot(dx, dz) || 1;
      const n = f.hp < f.maxHp * 0.5 ? 7 : 5;
      for (let i = 0; i < n; i++) {
        const a = base + (i / (n - 1) - 0.5) * 0.95;
        spawnOrb(h, Math.cos(a) * 7, dy / d * 7, Math.sin(a) * 7);
      }
      SFX.orb();
    }
  } else if (f.fireT <= 0 && dist < 18 && G.state === 'play') {
    f.fireT = f.hp < f.maxHp * 0.5 ? 2.4 : 3.2;
    f.charge = 0.75;
  }
}
const FSEG = 16, MAX_FOES = 12, NFS = MAX_FOES * FSEG;
const fPos = new Float32Array(NFS * 3), fRad = new Float32Array(NFS), fAlpha = new Float32Array(NFS), fSeed = new Float32Array(NFS), fFx = new Float32Array(NFS * 4), fKind = new Float32Array(NFS);
const foeInst = makeInstGeo(quadBase, 0, { aPos: [fPos, 3], aRad: [fRad, 1], aAlpha: [fAlpha, 1], aSeed: [fSeed, 1], aFx: [fFx, 4], aKind: [fKind, 1] });
const KIND_ID = { shade: 0, imp: 1, warden: 2 };
const foeBody = new THREE.Mesh(foeInst.geo, fogShader({
  uniforms: { uTime: U.time, uRight: U.camRight, uUp: U.camUp, uScale: { value: 1 }, uCore: { value: new THREE.Color('#06030c') }, uRim: { value: new THREE.Color('#2b0f47') } },
  vertexShader: SHADE_VERT, fragmentShader: SHADE_FRAG, transparent: true, depthWrite: false,
}));
const foeAura = new THREE.Mesh(foeInst.geo, fogShader({
  uniforms: { uTime: U.time, uRight: U.camRight, uUp: U.camUp, uScale: { value: 1.9 }, uColor: { value: new THREE.Color('#8a2cff') } },
  vertexShader: SHADE_VERT, fragmentShader: AURA_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
}));
foeBody.frustumCulled = foeAura.frustumCulled = false;
foeAura.renderOrder = 11; foeBody.renderOrder = 12;
scene.add(foeAura, foeBody);
function renderFoes() {
  let n = 0;
  const cr = U.camRight.value;
  for (const f of foes) {
    for (let k = 0; k < f.n && n < NFS; k++) {
      const sg = f.segs[k];
      let dx, dz;
      if (k > 0) { dx = f.segs[k - 1].x - sg.x; dz = f.segs[k - 1].z - sg.z; } else { dx = f.vel.x; dz = f.vel.z; }
      const L = Math.hypot(dx, dz) || 1;
      const wave = Math.sin(f.t * 5.2 - k * 0.75 + f.seed) * 0.24 * (0.25 + k / f.n) * (f.def.rad / 0.52) * (f.stun > 0 ? 0.2 : 1);
      const i3 = n * 3, i4 = n * 4;
      fPos[i3] = sg.x - dz / L * wave; fPos[i3 + 1] = sg.y + Math.sin(f.t * 3.1 - k * 0.6 + f.seed) * 0.07; fPos[i3 + 2] = sg.z + dx / L * wave;
      fRad[n] = segRad(f, k) * (0.9 + 0.1 * Math.sin(f.t * 4 + k));
      fAlpha[n] = Math.max(0, f.alpha) * (1 - 0.3 * k / f.n);
      fSeed[n] = f.seed + k * 1.7;
      fFx[i4] = f.flash; fFx[i4 + 1] = f.slow > 0 ? Math.min(1, f.slow) : 0; fFx[i4 + 2] = f.burn > 0 ? Math.min(1, f.burn * 2) : 0; fFx[i4 + 3] = f.shock > 0 ? 1 : 0;
      fKind[n] = KIND_ID[f.type];
      n++;
    }
    if (f.alpha > 0.05 && f.blink <= 0 && f.stun <= 0) {
      const hd = f.segs[0];
      tmpC.copy(camera.position).sub(hd).normalize();
      const off = f.def.rad * 0.62, ex = hd.x + tmpC.x * off, ey = hd.y + f.def.rad * 0.2 + tmpC.y * off, ez = hd.z + tmpC.z * off;
      const g = f.def.eyeGap;
      glow.spark(ex - cr.x * g, ey, ez - cr.z * g, f.def.eye, C.eye, f.alpha, 1);
      glow.spark(ex + cr.x * g, ey, ez + cr.z * g, f.def.eye, C.eye, f.alpha, 1);
      glow.spark(ex, ey, ez, f.def.eye * 9, C.eyeGlow, 0.22 * f.alpha, 0);
    }
  }
  foeInst.geo.instanceCount = n;
  foeBody.visible = foeAura.visible = n > 0;
  for (const nm of ['aPos', 'aRad', 'aAlpha', 'aSeed', 'aFx', 'aKind']) foeInst.attrs[nm].needsUpdate = true;
}

/* =============================================================================
   31 · Destruction: the axe fells trees, explosions strip foliage
============================================================================= */
const CH = 16, NCH = (W / CH) * (D / CH);
let chunks = [];
const dirtyChunks = new Set();
function buildChunks() {
  for (const m of chunks) if (m) { scene.remove(m); m.geometry.dispose(); }
  chunks = [];
  for (let i = 0; i < NCH; i++) chunks.push(null);
  for (let i = 0; i < NCH; i++) rebuildChunk(i);
  dirtyChunks.clear();
}
function rebuildChunk(i) {
  const cx = (i % (W / CH)) * CH, cz = Math.floor(i / (W / CH)) * CH;
  if (chunks[i]) { scene.remove(chunks[i]); chunks[i].geometry.dispose(); }
  const m = new THREE.Mesh(buildTerrainGeometry(world, cx, cz, cx + CH, cz + CH), terrainMat);
  scene.add(m);
  chunks[i] = m;
}
function markDirty(x0, z0, x1, z1) {
  for (let cz = Math.max(0, Math.floor((z0 - 1) / CH)); cz <= Math.min(D / CH - 1, Math.floor((z1 + 1) / CH)); cz++)
    for (let cx = Math.max(0, Math.floor((x0 - 1) / CH)); cx <= Math.min(W / CH - 1, Math.floor((x1 + 1) / CH)); cx++) dirtyChunks.add(cx + cz * (W / CH));
}
function rebuildDirty() {
  let n = 0;
  for (const i of dirtyChunks) { rebuildChunk(i); dirtyChunks.delete(i); if (++n >= 2) break; }
  if (n && !dirtyChunks.size) drawMinimapBase();
}
const vIdx = (x, y, z) => x + W * (z + D * y);
function fellTree(x, z) {
  const ti = world.trees.findIndex((t) => t.x === x && t.z === z);
  if (ti < 0) return false;
  const t = world.trees[ti];
  for (let y = t.h; y < t.h + t.th; y++) {
    if (world.vox[vIdx(x, y, z)] !== B.BARK) continue;
    world.vox[vIdx(x, y, z)] = 0;
    for (let k = 0; k < 4; k++) dust.emit(x + 0.5, y + 0.5, z + 0.5, rr(-2, 2), rr(1, 4), rr(-2, 2), rr(0.6, 1.1), 0.1, 0.08, C.chip, 1, 14, 0.4, 1, true);
  }
  const cy = t.h + t.th;
  for (let y = cy - 1; y <= cy + 2; y++) for (let b = -2; b <= 2; b++) for (let a = -2; a <= 2; a++) {
    const X = x + a, Z = z + b;
    if (X < 0 || Z < 0 || X >= W || Z >= D || y >= H) continue;
    if (world.vox[vIdx(X, y, Z)] !== B.LEAVES) continue;
    world.vox[vIdx(X, y, Z)] = 0;
    if (Math.random() < 0.6) dust.emit(X + 0.5, y + 0.5, Z + 0.5, rr(-1.5, 1.5), rr(0, 2), rr(-1.5, 1.5), rr(1.5, 3), 0.08, 0.08, LEAF[Math.floor(Math.random() * 3)], 1, 2.5, 1.4, 1, true);
  }
  const ci = x + z * W;
  world.stand[ci] = world.hgt[ci]; world.kind[ci] = 0;
  world.trees.splice(ti, 1);
  markDirty(x - 2, z - 2, x + 2, z + 2);
  SFX.timber();
  return true;
}
// the blast column rises: an ellipsoid stretched upward reaches the canopy above a bomb rolling under a tree
function blastLeaves(q, R) {
  let any = false;
  const up = R * 2.1;
  const x0 = Math.floor(q.x - R), x1 = Math.floor(q.x + R), z0 = Math.floor(q.z - R), z1 = Math.floor(q.z + R), y0 = Math.max(0, Math.floor(q.y - R * 0.5)), y1 = Math.min(H - 1, Math.floor(q.y + up));
  for (let y = y0; y <= y1; y++) for (let z = Math.max(0, z0); z <= Math.min(D - 1, z1); z++) for (let x = Math.max(0, x0); x <= Math.min(W - 1, x1); x++) {
    if (world.vox[vIdx(x, y, z)] !== B.LEAVES) continue;
    const dx = (x + 0.5 - q.x) / R, dz = (z + 0.5 - q.z) / R, dy = (y + 0.5 - q.y) / (y + 0.5 > q.y ? up : R * 0.5);
    if (dx * dx + dy * dy + dz * dz > 1) continue;
    world.vox[vIdx(x, y, z)] = 0; any = true;
    for (let k = 0; k < 2; k++) dust.emit(x + 0.5, y + 0.5, z + 0.5, rr(-3, 3), rr(0.5, 3), rr(-3, 3), rr(1.5, 3), 0.08, 0.08, LEAF[Math.floor(Math.random() * 3)], 1, 2.5, 1.2, 1, true);
  }
  if (any) markDirty(x0, z0, x1, z1);
}

/* =============================================================================
   32 · Loot: the twenty weapons lying around the island
============================================================================= */
let loot = [];
function buildLoot() {
  let a = 0, b = 0;
  loot = world.loot.map((s) => ({ id: s.near ? LOOT_NEAR[a++] : LOOT_FAR[b++], x: s.x, y: s.y + 1.0, z: s.z, gy: s.y, alive: true, phase: Math.random() * TAU }))
    .filter((L) => L.id);
}
function updateLoot() {
  if (G.state !== 'play' || player.respawn > 0) return;
  for (const L of loot) {
    if (!L.alive) continue;
    const dx = player.pos.x - L.x, dz = player.pos.z - L.z, dy = player.pos.y + 0.8 - L.y;
    if (Math.hypot(dx, dz) < 0.9 && Math.abs(dy) < 1.5) takeLoot(L);
  }
}
function takeLoot(L) {
  L.alive = false;
  const w = WEAPONS[L.id];
  if (!combat.arsenal.includes(L.id)) combat.arsenal.push(L.id);
  if (w.mag) combat.ammo[L.id] = w.mag;
  equip(L.id);
  SFX.loot();
  for (let k = 0; k < 24; k++) glow.emit(L.x, L.y, L.z, rr(-2.5, 2.5), rr(1, 4.5), rr(-2.5, 2.5), rr(0.5, 1), 0.16, 0.03, RAR[w.rar].col, 1, 6, 1.5, 2);
  showNew(w);
  hudWeapon();
  if (combat.arsenal.length === ARSENAL_ORDER.length) setTimeout(() => toast('Весь арсенал собран!', 3000, false, 2), 4000);
}

/* =============================================================================
   33 · Held weapon, trails, beams, bolts, rings — per-frame visuals
============================================================================= */
const HAND = new THREE.Vector3();
const HOLD_SHIFT = 0.45, _hv = new THREE.Vector3();
function handWorld(out = HAND) {
  hero.updateMatrixWorld();
  out.set(0.1 * player.facing, 0.56, 0.1).applyMatrix4(hero.matrixWorld);
  return out.addScaledVector(_hv.subVectors(camera.position, out).normalize(), HOLD_SHIFT);
}
function spritePoint(px, py, out, cell = held.cell) {
  let lx = (px + 0.5) / cell - 0.5, ly = 0.5 - (py + 0.5) / cell;
  if (held.fx < 0) lx = -lx;
  if (held.fy < 0) ly = -ly;
  const ux = (lx - held.px) * held.size, uy = (ly - held.py) * held.size;
  const cs = Math.cos(held.rot), sn = Math.sin(held.rot);
  const rx = ux * cs - uy * sn, ry = ux * sn + uy * cs;
  const cr = U.camRight.value, cu = U.camUp.value;
  return out.set(held.x + cr.x * rx + cu.x * ry, held.y + cr.y * rx + cu.y * ry, held.z + cr.z * rx + cu.z * ry);
}
function muzzleWorld(out) {
  const w = curWeapon(), m = w.meta.muzzle || w.meta.tip;
  spritePoint(m[0], m[1], out, 32);
  return out.addScaledVector(_hv.subVectors(out, camera.position).normalize(), HOLD_SHIFT);
}
const lightTint = () => { const k = lerp(1, 0.6, G.tod * (1 - G.dawn)); return k; };
function renderHeld() {
  const w = curWeapon();
  if (G.state === 'title' || G.state === 'loading') { combat.trail.length = 0; return; }
  // the hand pose is always tracked (shots spawn from it); drawing is skipped while the hero blinks
  const draw = hero.visible;
  if (!draw) combat.trail.length = 0;
  const face = player.facing;
  const hand = handWorld();
  const li = lightTint();
  const cr = U.camRight.value, cu = U.camUp.value;
  let uv = w.uv, meta = w.meta, cell = 32, size = w.hs;
  let theta, push = 0, rot, fx = 1, fy = 1;
  if (w.hold && combat.flail.on) {
    tmpA.subVectors(combat.flail.ball, hand);
    theta = screenAngleOf(tmpA);
    uv = FLAIL_GRIP.uv; cell = 16; size = 0.8;
    fx = 1; rot = theta - Math.PI / 4;
    held.cell = 16; held.size = size; held.fx = 1; held.fy = 1;
    held.px = (FLAIL_GRIP.grip[0] + 0.5) / 16 - 0.5; held.py = 0.5 - (FLAIL_GRIP.grip[1] + 0.5) / 16;
    held.x = hand.x; held.y = hand.y; held.z = hand.z; held.rot = rot;
    if (!draw) return;
    sprites.add(hand.x, hand.y, hand.z, size, size, rot, uv, held.px, held.py, 1, 1, li, li, li, 0);
    const top = spritePoint(FLAIL_GRIP.top[0], FLAIL_GRIP.top[1], tmpB, 16);
    const ball = combat.flail.ball;
    for (let k = 1; k <= 7; k++) {
      const t = k / 8;
      const sag = Math.sin(t * Math.PI) * 0.12;
      sprites.add(lerp(top.x, ball.x, t), lerp(top.y, ball.y, t) - sag, lerp(top.z, ball.z, t), 0.19, 0.19, 0, LINK_UV, 0, 0, 1, 1, li, li, li, 0);
    }
    sprites.add(ball.x, ball.y, ball.z, 0.8, 0.8, G.time * 9, PUV.ball, 0, 0, 1, 1, li, li, li, 0.1);
    if (combat.flail.spin > 0.35) trailSample(hand, ball, tmpC.copy(ball).lerp(hand, 0.25));
    return;
  }
  const atk = combat.atk;
  const aimScr = atk ? screenAngleOf(atk.dir) : aim.screen;
  const eng = engaged();
  if (w.kind === 'melee') {
    const base = atk || eng ? aimScr : (face > 0 ? 0 : Math.PI);
    let ang;
    if (atk) { ang = atk.pose.ang; push = atk.pose.push; }
    else ang = 62 + Math.sin(G.time * 2.2) * 4 + Math.sin(player.walk * 6.3) * 4;
    const sgn = Math.cos(base) >= 0 ? 1 : -1;
    const target = base + sgn * ang * Math.PI / 180;
    held.ang += angDiff(held.ang, target) * (atk ? 1 : damp(14, 1 / 60));
    theta = held.ang;
    fx = sgn; rot = theta - (sgn > 0 ? Math.PI / 4 : 3 * Math.PI / 4);
    if (w.meta.base === 0) { rot = theta; fx = 1; fy = Math.cos(theta) >= 0 ? 1 : -1; }
    tmpA.set(Math.cos(base) * push, Math.sin(base) * push, 0);
  } else {
    let t = eng ? aimScr : (face > 0 ? -0.15 : Math.PI + 0.15);
    const sg = Math.cos(t) >= 0 ? 1 : -1;
    t += combat.recoil * 0.2 * sg;
    if (combat.reload > 0) {
      const k = 1 - combat.reload / combat.reloadDur;
      t += (w.spinReload ? k * TAU * 2 : -Math.sin(k * Math.PI) * 0.9) * sg;
    }
    if (combat.over) t += Math.sin(G.time * 30) * 0.05 - 0.4 * sg;
    held.ang += angDiff(held.ang, t) * (eng ? 1 : damp(12, 1 / 60));
    theta = held.ang;
    push = -combat.recoil * 0.12;
    rot = theta; fx = 1; fy = Math.cos(theta) >= 0 ? 1 : -1;
    tmpA.set(Math.cos(theta) * push, Math.sin(theta) * push, 0);
    if (w.id === 'bow' && combat.charging && combat.charge > 0.12) { meta = BOW_DRAWN.meta; uv = BOW_DRAWN.uv; }
  }
  const ax = hand.x + cr.x * tmpA.x + cu.x * tmpA.y, ay = hand.y + cr.y * tmpA.x + cu.y * tmpA.y, az = hand.z + cr.z * tmpA.x + cu.z * tmpA.y;
  let px = (meta.grip[0] + 0.5) / cell - 0.5, py = 0.5 - (meta.grip[1] + 0.5) / cell;
  if (fx < 0) px = -px;
  if (fy < 0) py = -py;
  Object.assign(held, { x: ax, y: ay, z: az, rot, fx, fy, px, py, size, cell });
  if (!draw) return;
  const glowAmt = (w.glow || 0) * (0.85 + 0.15 * Math.sin(G.time * 9)) + (combat.charging ? combat.charge * 0.5 : 0) + (combat.over ? 0.6 : 0);
  sprites.add(ax, ay, az, size, size, rot, uv, px, py, fx, fy, li, li, li, glowAmt);
  if (atk && w.trail && (atk.pose.active || (w.anim === 'slam' && atk.t > 0.48 && atk.t < 0.64))) {
    const tip = w.meta.tip, gp = w.meta.grip;
    trailSample(tmpD.set(ax, ay, az), spritePoint(tip[0], tip[1], tmpB), spritePoint(lerp(gp[0], tip[0], 0.3), lerp(gp[1], tip[1], 0.3), tmpC));
  }
  if (w.fire === 'beam' && combat.over) {
    const m = muzzleWorld(tmpB);
    if (Math.random() < 0.4) dust.emit(m.x, m.y, m.z, rr(-0.3, 0.3), rr(0.6, 1.4), rr(-0.3, 0.3), rr(0.6, 1), 0.12, 0.4, C.smokeLight, 0.5, -0.4, 1, 0);
  }
  if (w.id === 'tesla' && Math.random() < 0.25) {
    const m = muzzleWorld(tmpB);
    glow.emit(m.x + rr(-0.2, 0.2), m.y + rr(-0.2, 0.2), m.z + rr(-0.2, 0.2), 0, 0, 0, 0.12, 0.08, 0.02, C.zapCore, 1, 0, 0, 1);
  }
  if (w.fire && w.id === 'flamesword') { const tp = spritePoint(w.meta.tip[0], w.meta.tip[1], tmpB); if (Math.random() < 0.5) glow.emit(tp.x, tp.y, tp.z, rr(-0.2, 0.2), rr(0.6, 1.4), rr(-0.2, 0.2), rr(0.3, 0.5), 0.12, 0.02, C.fire, 1, -1, 1, 0); }
}
const TRAIL_LIFE = 0.13;
function trailSample(h, tip, base) {
  const cr = U.camRight.value, cu = U.camUp.value;
  const tu = (tip.x - h.x) * cr.x + (tip.y - h.y) * cr.y + (tip.z - h.z) * cr.z, tv = (tip.x - h.x) * cu.x + (tip.y - h.y) * cu.y + (tip.z - h.z) * cu.z;
  const bu = (base.x - h.x) * cr.x + (base.y - h.y) * cr.y + (base.z - h.z) * cr.z, bv = (base.x - h.x) * cu.x + (base.y - h.y) * cu.y + (base.z - h.z) * cu.z;
  combat.trail.push({ h: h.clone(), at: Math.atan2(tv, tu), rt: Math.hypot(tu, tv), ab: Math.atan2(bv, bu), rb: Math.hypot(bu, bv), t: G.time });
  if (combat.trail.length > 40) combat.trail.shift();
}
const _t0 = new THREE.Vector3(), _t1 = new THREE.Vector3(), _b0 = new THREE.Vector3(), _b1 = new THREE.Vector3(), _th = new THREE.Vector3();
function trailPoint(s0, s1, u, tipOut, baseOut) {
  const cr = U.camRight.value, cu = U.camUp.value;
  _th.copy(s0.h).lerp(s1.h, u);
  const at = s0.at + angDiff(s0.at, s1.at) * u, rt = lerp(s0.rt, s1.rt, u);
  const ab = s0.ab + angDiff(s0.ab, s1.ab) * u, rb = lerp(s0.rb, s1.rb, u);
  const ct = Math.cos(at) * rt, st = Math.sin(at) * rt, cb = Math.cos(ab) * rb, sb = Math.sin(ab) * rb;
  tipOut.set(_th.x + cr.x * ct + cu.x * st, _th.y + cr.y * ct + cu.y * st, _th.z + cr.z * ct + cu.z * st);
  baseOut.set(_th.x + cr.x * cb + cu.x * sb, _th.y + cr.y * cb + cu.y * sb, _th.z + cr.z * cb + cu.z * sb);
}
function renderTrail(w) {
  const tr = combat.trail;
  while (tr.length && G.time - tr[0].t > TRAIL_LIFE) tr.shift();
  if (tr.length < 2) return;
  const col = w.trail || C.white;
  const fade = (t) => { const k = 1 - (G.time - t) / TRAIL_LIFE; return k > 0 ? k * k : 0; };
  const linear = w.anim === 'punch' || w.anim === 'jab' || w.anim === 'stab' || w.anim === 'thrust';
  if (linear) {
    // straight strikes leave a speed streak along the weapon instead of a swept arc
    const s0 = tr[0], s1 = tr[tr.length - 1];
    trailPoint(s0, s0, 0, _t0, _b0); trailPoint(s1, s1, 0, _t1, _b1);
    ribbons.seg(_b0, _t1, 0.02, 0.2, col, 0, col, 0.55 * fade(s1.t));
    return;
  }
  for (let i = 0; i < tr.length - 1; i++) {
    const s0 = tr[i], s1 = tr[i + 1];
    const sub = clamp(Math.ceil(Math.abs(angDiff(s0.at, s1.at)) / 0.1), 1, 10);
    trailPoint(s0, s1, 0, _t0, _b0);
    for (let k = 1; k <= sub; k++) {
      const u = k / sub;
      trailPoint(s0, s1, u, _t1, _b1);
      const a0 = fade(lerp(s0.t, s1.t, (k - 1) / sub)) * 0.6, a1 = fade(lerp(s0.t, s1.t, u)) * 0.6;
      ribbons.quadA(_b0, _t0, _t1, _b1, col, a0 * 0.08, a0, a1, a1 * 0.08);
      _t0.copy(_t1); _b0.copy(_b1);
    }
  }
}
function ring3(x, y, z, r, wdt, col, a, n = 28) {
  for (let i = 0; i < n; i++) {
    const a0 = i / n * TAU, a1 = (i + 1) / n * TAU;
    _q0.set(x + Math.cos(a0) * (r - wdt / 2), y, z + Math.sin(a0) * (r - wdt / 2));
    _q1.set(x + Math.cos(a0) * (r + wdt / 2), y, z + Math.sin(a0) * (r + wdt / 2));
    _q2.set(x + Math.cos(a1) * (r + wdt / 2), y, z + Math.sin(a1) * (r + wdt / 2));
    _q3.set(x + Math.cos(a1) * (r - wdt / 2), y, z + Math.sin(a1) * (r - wdt / 2));
    ribbons.quad(_q0, _q1, _q2, _q3, col, a, col, a, true);
  }
}
const _ja = new THREE.Vector3(), _jb = new THREE.Vector3(), _jp = new THREE.Vector3();
function jagged(a, b, alpha, amp) {
  const n = 7;
  _jp.subVectors(b, a);
  const L = _jp.length() || 1;
  const px = -_jp.z / L, pz = _jp.x / L;
  _ja.copy(a);
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    _jb.copy(a).addScaledVector(_jp, t);
    if (i < n) { const o = rr(-1, 1) * amp * Math.sin(t * Math.PI); _jb.x += px * o; _jb.z += pz * o; _jb.y += rr(-1, 1) * amp * 0.6; }
    ribbons.seg(_ja, _jb, 0.42, 0.42, C.zapGlow, 0.35 * alpha);
    ribbons.seg(_ja, _jb, 0.09, 0.09, C.zapCore, alpha);
    _ja.copy(_jb);
  }
}
function renderFx(dt) {
  const w = curWeapon();
  renderTrail(w);
  for (const wv of combat.waves) {
    const k = wv.t / wv.dur;
    ring3(wv.x, wv.y, wv.z, wv.r * easeOut(k), 0.5 * (1 - k) + 0.1, wv.col, 1 - k);
  }
  const wd = G.warden;
  if (wd && foeAlive(wd) && ((wd.mode === 'windup' && wd.locked) || wd.mode === 'dive')) {
    const q = wd.diveTo, pulse = 0.5 + 0.5 * Math.sin(G.time * 22);
    ring3(q.x, q.y + 0.07, q.z, 1.1 + 0.15 * pulse, 0.16, C.lock, 0.5 + 0.4 * pulse, 24);
    ring3(q.x, q.y + 0.07, q.z, 3.9, 0.07, C.violet, 0.22 + 0.15 * pulse, 40);
  }
  for (const b of combat.bolts) {
    const a = b.life / b.full;
    for (let i = 0; i < b.pts.length - 1; i++) jagged(b.pts[i], b.pts[i + 1], a, 0.45);
  }
  for (const [a, b] of combat.beam.segs) {
    const fl = 0.85 + 0.15 * Math.sin(G.time * 60);
    ribbons.seg(a, b, 0.42 * fl, 0.42 * fl, C.beamGlow, 0.45);
    ribbons.seg(a, b, 0.1, 0.1, C.beamCore, 1);
  }
  for (const p of projs) {
    if (p.dead || (p.kind !== 'bullet' && p.kind !== 'pellet')) continue;
    if (!p.tracer && p.kind === 'bullet') { glow.spark(p.pos.x, p.pos.y, p.pos.z, 0.12, p.col, 0.8, 1); continue; }
    // a hot streak a few frames long, brightest at the head, plus a small glint so even pellets read
    _ja.copy(p.pos).addScaledVector(p.vel, -0.04);
    ribbons.seg(_ja, p.pos, 0.01, p.size * 1.3, p.col, 0, p.col, 1);
    glow.spark(p.pos.x, p.pos.y, p.pos.z, p.kind === 'pellet' ? 0.16 : 0.22, p.col, 0.7, 0);
  }
  // aim: ground reticle under the cursor for ranged weapons, lock-on ring around the auto target
  if (G.state === 'play') {
    if (w.ranged && !aim.auto) {
      const gy = Math.max(groundBelow(aim.point.x, aim.point.y + 0.5, aim.point.z), SEA) + 0.06;
      ring3(aim.point.x, gy, aim.point.z, 0.36, 0.06, C.reticle, 0.7, 20);
    }
    if (aim.target && foeAlive(aim.target) && (aim.auto || w.ranged)) {
      const h = aim.target.segs[0], r = aim.target.def.rad + 0.25, cr = U.camRight.value, cu = U.camUp.value;
      for (let i = 0; i < 4; i++) {
        const a0 = i * Math.PI / 2 + G.time * 2, a1 = a0 + 0.8;
        _ja.set(h.x + (cr.x * Math.cos(a0) + cu.x * Math.sin(a0)) * r, h.y + (cr.y * Math.cos(a0) + cu.y * Math.sin(a0)) * r, h.z + (cr.z * Math.cos(a0) + cu.z * Math.sin(a0)) * r);
        _jb.set(h.x + (cr.x * Math.cos(a1) + cu.x * Math.sin(a1)) * r, h.y + (cr.y * Math.cos(a1) + cu.y * Math.sin(a1)) * r, h.z + (cr.z * Math.cos(a1) + cu.z * Math.sin(a1)) * r);
        ribbons.seg(_ja, _jb, 0.06, 0.06, C.lock, 0.8);
      }
    }
  }
  for (const L of loot) {
    if (!L.alive) continue;
    const ww = WEAPONS[L.id], rc = RAR[ww.rar].col;
    ring3(L.x, L.gy + 0.05, L.z, 0.55 + 0.05 * Math.sin(G.time * 3 + L.phase), 0.08, rc, 0.55, 18);
    if (ww.rar !== 'common') {
      _ja.set(L.x, L.gy, L.z); _jb.set(L.x, L.gy + 5.5, L.z);
      ribbons.seg(_ja, _jb, 0.3, 0.05, rc, 0.22 + 0.25 * G.tod, rc, 0);
    }
  }
}
function updateFx(dt) {
  for (let i = combat.waves.length - 1; i >= 0; i--) {
    const wv = combat.waves[i];
    wv.t += dt;
    if (wv.hurt && !wv.hit && G.state === 'play' && player.respawn <= 0) {
      const r = wv.r * easeOut(wv.t / wv.dur), d = Math.hypot(player.pos.x - wv.x, player.pos.z - wv.z);
      if (Math.abs(d - r) < 0.55 && player.pos.y - wv.y < 0.55) { wv.hit = true; hurt(1, wv.x, wv.z); }
    }
    if (wv.t >= wv.dur) combat.waves.splice(i, 1);
  }
  for (let i = combat.bolts.length - 1; i >= 0; i--) { const b = combat.bolts[i]; b.life -= dt; if (b.life <= 0) combat.bolts.splice(i, 1); }
  for (const L of flashLights) L.intensity *= Math.exp(-16 * dt);
}
function renderProjectiles() {
  const li = lightTint();
  for (const p of projs) {
    if (p.dead) continue;
    const q = p.pos;
    switch (p.kind) {
      case 'pebble': sprites.add(q.x, q.y, q.z, 0.5, 0.5, p.age * 9, PUV.pebble, 0, 0, 1, 1, li, li, li, 0); break;
      case 'arrow': case 'bolt': {
        const d = p.stuck > 0 ? p.stuckDir : p.vel;
        sprites.add(q.x, q.y, q.z, 0.95, 0.95, screenAngleOf(d), PUV[p.kind], 0.4, 0, 1, 1, li, li, li, p.kind === 'bolt' ? 0.5 : 0);
        break;
      }
      case 'saw': sprites.add(q.x, q.y, q.z, 0.9, 0.9, -p.age * 22, PUV.saw, 0, 0, 1, 1, li, li, li, 0.15); break;
      case 'bomb': {
        sprites.add(q.x, q.y, q.z, 0.7, 0.7, -p.age * 5 * Math.sign(p.vel.x || 1), PUV.bomb, 0, 0, 1, 1, li, li, li, p.life < 0.5 && Math.floor(p.life * 16) % 2 ? 1.2 : 0);
        break;
      }
      case 'orb': glow.spark(q.x, q.y, q.z, 0.34, C.orbCore, 1, 0); glow.spark(q.x, q.y, q.z, 1.1, C.orbHalo, 0.45, 0); break;
      default: break;
    }
  }
}
function renderLoot() {
  const li = lightTint();
  for (const L of loot) {
    if (!L.alive) continue;
    const w = WEAPONS[L.id];
    const bob = Math.sin(G.time * 2 + L.phase) * 0.12, sway = Math.sin(G.time * 1.3 + L.phase) * 0.16;
    sprites.add(L.x, L.y + bob, L.z, 1.55, 1.55, sway, w.uv, 0, 0, 1, 1, li, li, li, 0.2 + 0.15 * Math.sin(G.time * 3 + L.phase));
    glow.spark(L.x, L.y + bob, L.z, 2.2, RAR[w.rar].col, 0.16 + 0.1 * G.tod, 0);
  }
}

/* =============================================================================
   34 · Combat HUD: weapon panel, hotbar, boss bar, damage numbers, foe bars
============================================================================= */
const whud = {
  panel: $('wpanel'), icon: $('wIcon'), name: $('wName'), stat: $('wStat'), fill: $('wFill'), ammo: $('wAmmo'), meter: $('wMeter'),
  hot: $('hotbar'), boss: $('boss'), bossFill: $('bossFill'), bossLag: $('bossLag'), layer: $('dmgLayer'), ars: $('arsenal'), arsCount: $('arsCount'),
  swap: $('swapIcon'), lastFill: -1, lastText: '', lastState: '', lag: 1,
  nw: $('wNew'), nwRar: $('wNewRar'), nwName: $('wNewName'), nwDesc: $('wNewDesc'), nwT: 0,
};
// "new weapon" card next to the weapon panel (instead of a centre-screen toast)
function showNew(w) {
  const el = whud.nw;
  el.style.setProperty('--rar', RAR[w.rar].css);
  whud.nwRar.textContent = `новое оружие · ${RAR[w.rar].name}`;
  whud.nwName.textContent = w.name;
  whud.nwDesc.textContent = w.desc;
  el.hidden = false; el.classList.remove('out');
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  whud.nwT = 4.4;
}
{
  const rs = document.documentElement.style;
  rs.setProperty('--img-weapons', `url("${ASSETS.weapons}")`);
  rs.setProperty('--wa-w', `${WM.size[0]}px`); rs.setProperty('--wa-h', `${WM.size[1]}px`);
}
// icons are CSS sprites: the element's class sets the scale (--s), this sets which 32×32 cell shows
function iconStyle(el, w) {
  const c = w.meta.cell;
  el.style.setProperty('--cx', c[0]); el.style.setProperty('--cy', c[1]);
}
function hudWeapon() {
  const w = curWeapon();
  iconStyle(whud.icon, w); iconStyle(whud.swap, w);
  whud.name.textContent = w.name; whud.name.style.color = RAR[w.rar].css;
  whud.stat.textContent = w.stat;
  whud.lastText = ''; whud.lastFill = -1;
  const frag = document.createDocumentFragment();
  combat.arsenal.forEach((id, i) => {
    const b = document.createElement('button');
    b.className = 'slot' + (id === combat.cur ? ' on' : '');
    b.type = 'button';
    b.title = WEAPONS[id].name;
    b.setAttribute('aria-label', WEAPONS[id].name);
    const ic = document.createElement('i'); ic.className = 'wico'; iconStyle(ic, WEAPONS[id]);
    b.append(ic);
    if (i < 10) { const s = document.createElement('span'); s.textContent = String((i + 1) % 10); b.append(s); }
    b.addEventListener('click', (e) => { e.stopPropagation(); equip(id); canvas.focus(); });
    frag.append(b);
  });
  whud.hot.replaceChildren(frag);
}
function updateWeaponMeter() {
  const w = curWeapon();
  let fill = 1, text = '∞', state = '';
  if (combat.reload > 0) { fill = 1 - combat.reload / combat.reloadDur; text = 'перезарядка'; state = 'reload'; }
  else if (w.fire === 'beam') { fill = 1 - combat.heat / w.heat; text = combat.over ? 'перегрев' : `${Math.round(fill * 100)}%`; state = combat.over ? 'hot' : ''; }
  else if (w.charge) { fill = combat.charging ? combat.charge : 0; text = combat.charging ? (combat.charge >= 1 ? 'полное натяжение' : 'натяжение') : 'держи атаку'; }
  else if (w.mag) { fill = combat.ammo[w.id] / w.mag; text = `${combat.ammo[w.id]} / ${w.mag}`; }
  else if (w.hold) { fill = combat.flail.spin; text = combat.flail.on ? 'вращение' : 'держи атаку'; }
  else if (w.combo) { fill = combat.comboT > 0 || combat.atk ? (combat.combo + 1) / w.combo : 0; text = `комбо ${combat.atk || combat.comboT > 0 ? combat.combo + 1 : 0}/${w.combo}`; }
  else { fill = w.cd ? clamp(1 - combat.cd / w.cd, 0, 1) : 1; text = w.ranged ? '∞' : combat.cd > 0 ? '' : 'готово'; }
  const f = Math.round(fill * 100) / 100;
  if (f !== whud.lastFill) { whud.fill.style.transform = `scaleX(${f})`; whud.lastFill = f; }
  if (text !== whud.lastText) { whud.ammo.textContent = text; whud.lastText = text; }
  if (state !== whud.lastState) { whud.meter.dataset.state = state; whud.lastState = state; }
}
const BARS = [];
for (let i = 0; i < 8; i++) { const el = document.createElement('span'); el.className = 'hpbar'; const fill = document.createElement('i'); el.append(fill); whud.layer.append(el); BARS.push({ el, fill }); }
const NUMS = [];
for (let i = 0; i < 28; i++) { const el = document.createElement('span'); el.className = 'dmg'; whud.layer.append(el); NUMS.push({ el, pos: new THREE.Vector3(), life: 0, vy: 0 }); }
let numIdx = 0;
function dmgNumber(pos, value, kind) {
  const n = NUMS[numIdx++ % NUMS.length];
  n.pos.copy(pos); n.pos.x += rr(-0.4, 0.4); n.pos.y += 0.25; n.life = 0.9; n.vy = 1.9;
  n.el.textContent = kind === 'heal' ? '+1' : String(Math.max(1, Math.round(value)));
  n.el.className = 'dmg' + (kind ? ' ' + kind : '');
}

function project(v) {
  tmpE.copy(v).project(camera);
  return tmpE.z < 1 ? [(tmpE.x * 0.5 + 0.5) * innerWidth, (-tmpE.y * 0.5 + 0.5) * innerHeight] : null;
}
function updateCombatHud(dt) {
  if (whud.nwT > 0) {
    whud.nwT -= dt;
    if (whud.nwT <= 0.5 && !whud.nw.classList.contains('out')) whud.nw.classList.add('out');
    if (whud.nwT <= 0) whud.nw.hidden = true;
  }
  for (const n of NUMS) {
    if (n.life <= 0) { if (n.el.style.opacity !== '0') n.el.style.opacity = '0'; continue; }
    n.life -= dt; n.pos.y += n.vy * dt; n.vy *= Math.exp(-2.5 * dt);
    const s = project(n.pos);
    if (!s) { n.el.style.opacity = '0'; continue; }
    const k = n.life / 0.9;
    n.el.style.opacity = String(Math.min(1, k * 2.5));
    n.el.style.transform = `translate(${s[0].toFixed(1)}px, ${s[1].toFixed(1)}px) translate(-50%, -50%) scale(${(0.75 + 0.45 * Math.min(1, (1 - k) * 6)).toFixed(2)})`;
  }
  let i = 0;
  for (const f of foes) {
    if (i >= BARS.length) break;
    if (f.def.boss || f.hitT <= 0 || !foeAlive(f)) continue;
    const h = f.segs[0];
    const s = project(tmpA.set(h.x, h.y + f.def.rad + 0.75, h.z));
    if (!s) continue;
    const b = BARS[i++];
    b.el.style.opacity = String(Math.min(1, f.hitT * 1.5));
    b.el.style.transform = `translate(${s[0].toFixed(1)}px, ${s[1].toFixed(1)}px) translate(-50%, -50%)`;
    b.fill.style.transform = `scaleX(${Math.max(0, f.hp / f.maxHp).toFixed(3)})`;
  }
  for (; i < BARS.length; i++) if (BARS[i].el.style.opacity !== '0') BARS[i].el.style.opacity = '0';
  const boss = G.warden && foeAlive(G.warden) ? G.warden : null;
  if (whud.boss.hidden === !!boss) { whud.boss.hidden = !boss; hud.root.classList.toggle('boss-on', !!boss); whud.lag = 1; }
  if (boss) {
    // the white "lag" bar trails the health, so each blow reads as a chunk bitten out of the bar
    const k = boss.hp / boss.maxHp;
    whud.lag = Math.max(k, whud.lag - Math.max(0.02, (whud.lag - k) * 2.5) * dt * (boss.hitT > 2.2 ? 0 : 1));
    whud.bossFill.style.transform = `scaleX(${k.toFixed(3)})`;
    whud.bossLag.style.transform = `scaleX(${whud.lag.toFixed(3)})`;
  }
  updateWeaponMeter();
}
function renderArsenal() {
  const frag = document.createDocumentFragment();
  for (const id of ARSENAL_ORDER) {
    const w = WEAPONS[id], have = combat.arsenal.includes(id);
    const card = document.createElement('div');
    card.className = 'acard' + (have ? '' : ' unknown') + (id === combat.cur ? ' on' : '');
    const ic = document.createElement('i'); ic.className = 'wico'; iconStyle(ic, w);
    const box = document.createElement('div');
    const nm = document.createElement('b'); nm.textContent = have ? w.name : '???'; nm.style.color = RAR[w.rar].css;
    const rar = document.createElement('small'); rar.textContent = `${w.kind === 'melee' ? 'ближний бой' : 'стрелковое'} · ${RAR[w.rar].name}`;
    const ds = document.createElement('span'); ds.textContent = have ? `${w.stat}. ${w.desc}` : 'Лежит где-то на острове.';
    box.append(nm, rar, ds);
    card.append(ic, box);
    if (have) card.addEventListener('click', () => { equip(id); renderArsenal(); });
    frag.append(card);
  }
  whud.ars.replaceChildren(frag);
  whud.arsCount.textContent = `${combat.arsenal.length} / ${ARSENAL_ORDER.length}`;
}


/* -----------------------------------------------------------------------------
   23 · Main loop (delta-time everywhere; nothing is tied to frame count)
----------------------------------------------------------------------------- */
let last = 0, booted = false;
function perfMonitor(dt) {
  if (perf.lock) return;
  perf.acc += dt; perf.frames++;
  if (perf.acc >= 2) {
    const fps = perf.frames / perf.acc; perf.acc = 0; perf.frames = 0;
    let s = perf.scale;
    if (fps < 48 && s > 0.5) s = Math.max(0.5, Math.round((s - 0.1) * 100) / 100);
    else if (fps > 58 && s < 0.9) s = Math.min(0.9, Math.round((s + 0.05) * 100) / 100);
    if (s !== perf.scale) { perf.scale = s; resize(); }
  }
}
/* GRAF V12 / October 2026 — additive game systems. The island owns renderer, physics and RAF. */
const GRAF = {mode:0, weatherIndex:0,auto:true,clock:0,cycle:42,lightMix:0,lightTarget:0,weather:null,weatherName:'',fpsSamples:[], chunks:new Map(),assetsLoaded:0,glbModels:0,activeNPC:[],loadErrors:[], frame:0};
const GRAF_MODES=['ОСТРОВ СУМЕРЕК','ПЕПЕЛЬНЫЙ ПУТЬ','ЗАТОНУВШИЙ ГОРОД'];
const GRAF_PRESETS=GRAF_WEATHER_MANIFEST.presets;
const GRAF_ROOT=new THREE.Group(); GRAF_ROOT.name='GRAF Unified Visuals';scene.add(GRAF_ROOT);
const GRAF_ASH=new THREE.Group(),GRAF_CITY=new THREE.Group();GRAF_ASH.name='Ash World';GRAF_CITY.name='Sunken City';GRAF_ROOT.add(GRAF_ASH,GRAF_CITY);GRAF_ASH.visible=false;GRAF_CITY.visible=false;
const GRAF_LIGHT=new THREE.PointLight(0x79dbee,0,27,1.8);GRAF_ROOT.add(GRAF_LIGHT);
const GRAF_FLASH=new THREE.PointLight(0xcfe7ff,0,125,1.2);GRAF_ROOT.add(GRAF_FLASH);
const grafClamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const grafHash=(x,z,s=0)=>{let n=Math.imul((x|0)^0x9e3779b9,374761393)^Math.imul((z|0)^s,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;};
function grafNoise(x,z,s){let a=Math.floor(x),b=Math.floor(z),fx=x-a,fz=z-b;fx=fx*fx*(3-2*fx);fz=fz*fz*(3-2*fz);let p=grafHash(a,b,s),q=grafHash(a+1,b,s),r=grafHash(a,b+1,s),t=grafHash(a+1,b+1,s);return (p+(q-p)*fx)+(r+(t-r)*fx-p-(q-p)*fx)*fz;}
function grafOutside(x,z){ // Integral surface height, global-coordinate seeded; continuous across chunk seams.
 let n=grafNoise(x*.045,z*.045,G.seed)+.45*grafNoise(x*.14,z*.14,G.seed+11)+.18*grafNoise(x*.36,z*.36,G.seed+19);
 let ridges=Math.abs(Math.sin(x*.031+Math.cos(z*.019)))*1.9;
 return grafClamp(Math.floor(1.3+n*6.1+ridges),1,14);
}
/* The original 64x64 authored voxel island stays pixel-perfect; only outer coordinates stream. */
const grafBaseBlockAt=blockAt;
blockAt=function(x,y,z){if(x>=0&&z>=0&&x<W&&z<D)return grafBaseBlockAt(x,y,z);if(y<0)return B.STONE;return y<grafOutside(x,z)?B.STONE:B.AIR;};
const grafBaseTerrainTop=terrainTop;
terrainTop=function(x,z){if(x>=0&&z>=0&&x<W&&z<D)return grafBaseTerrainTop(x,z);return grafOutside(Math.floor(x),Math.floor(z));};
/* World sampling and chunk meshing share the same seeded function; bounded map and disposal. */
const grafChunkMat=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.FrontSide});
const grafChunkSize=16, grafRadius=IS_TOUCH?2:3;
function grafChunkMesh(cx,cz){let P=[],N=[],C=[];const vec=(x,y,z,nx,ny,nz,col)=>{P.push(x,y,z);N.push(nx,ny,nz);C.push(col[0],col[1],col[2]);};
 const face=(a,b,c,d,n,col)=>{vec(...a,...n,col);vec(...b,...n,col);vec(...c,...n,col);vec(...a,...n,col);vec(...c,...n,col);vec(...d,...n,col);};
 const baseX=cx*16,baseZ=cz*16;
 for(let z=0;z<16;z++)for(let x=0;x<16;x++){
  let wx=baseX+x,wz=baseZ+z;if(wx>=0&&wx<W&&wz>=0&&wz<D)continue;
  let h=grafOutside(wx,wz),v=grafHash(wx,wz,G.seed),leaf=[.22+v*.15,.38+v*.21,.28+v*.1],rock=[.22+v*.08,.21+v*.06,.31+v*.11];
  if(GRAF.mode===1){leaf=[.34+v*.1,.25+v*.08,.27+v*.07];rock=[.29,.25,.31];}
  if(GRAF.mode===2){leaf=[.11+v*.08,.28+v*.08,.33+v*.11];rock=[.15,.2,.32];}
  const t=wx,b=wz,s=1;face([t,h,b],[t,h,b+1],[t+1,h,b+1],[t+1,h,b],[0,1,0],h<5?rock:leaf);
  const adj=[[1,0],[0,1],[-1,0],[0,-1]];for(let k=0;k<4;k++){let [dx,dz]=adj[k];let nx=wx+dx,nz=wz+dz;let nh= nx>=0&&nx<W&&nz>=0&&nz<D ? (world?.hgt[nx+nz*W]||0):grafOutside(nx,nz);
    if(nh>=h)continue;
    if(k===0)face([t+1,nh,b],[t+1,h,b],[t+1,h,b+1],[t+1,nh,b+1],[1,0,0],rock);
    if(k===1)face([t,nh,b+1],[t+1,nh,b+1],[t+1,h,b+1],[t,h,b+1],[0,0,1],rock);
    if(k===2)face([t,nh,b+1],[t,h,b+1],[t,h,b],[t,nh,b],[-1,0,0],rock);
    if(k===3)face([t+1,nh,b],[t,nh,b],[t,h,b],[t+1,h,b],[0,0,-1],rock);
  }
 }
 let geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(P,3));geom.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));geom.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
 let m=new THREE.Mesh(geom,grafChunkMat);m.name='stream/'+cx+'/'+cz;return m;
}
function grafStream(force=false){let cx=Math.floor(player.pos.x/16),cz=Math.floor(player.pos.z/16),need=new Set();for(let dz=-grafRadius;dz<=grafRadius;dz++)for(let dx=-grafRadius;dx<=grafRadius;dx++){
 const ix=cx+dx,iz=cz+dz;if(ix>=0&&ix<4&&iz>=0&&iz<4)continue;let id=ix+','+iz;need.add(id);
 }
 for(const [k,m] of GRAF.chunks){if(!need.has(k)||force){GRAF_ROOT.remove(m);m.geometry.dispose();GRAF.chunks.delete(k);}}
 let built=0;for(const id of need){if(GRAF.chunks.has(id)||built>=3)continue;let [x,z]=id.split(',').map(Number),m=grafChunkMesh(x,z);GRAF_ROOT.add(m);GRAF.chunks.set(id,m);built++;}
}
function grafB64Bytes(b64){let s=atob(b64),out=new Uint8Array(s.length);for(let i=0;i<s.length;i++)out[i]=s.charCodeAt(i);return out;}
async function grafInflate(key){let b=GRAF_GLB[key];if(!b)throw Error('Unknown GLB '+key);let bytes=grafB64Bytes(b);
 if(typeof DecompressionStream!=='undefined'){const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));return new Uint8Array(await new Response(stream).arrayBuffer());}
 throw Error('This browser does not support local gzip decoding');
}
const grafTexCache=new Map();
function grafImageTexture(path){if(!path)return null;if(grafTexCache.has(path))return grafTexCache.get(path);
 let src=GRAF_IMG[path];if(!src)return null;const t=new THREE.Texture();t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;
 const im=new Image();im.onload=()=>{t.image=im;t.needsUpdate=true;};im.src='data:image/png;base64,'+src;grafTexCache.set(path,t);return t;
}
async function grafParseGLB(key){const raw=await grafInflate(key),view=new DataView(raw.buffer,raw.byteOffset,raw.byteLength);if(view.getUint32(0,true)!==0x46546c67)throw Error('Bad glb '+key);
 let offs=12,json=null,bin=null;while(offs<raw.byteLength){let n=view.getUint32(offs,true),typ=view.getUint32(offs+4,true);offs+=8;if(typ===0x4E4F534A)json=JSON.parse(new TextDecoder().decode(raw.subarray(offs,offs+n)));if(typ===0x004E4942)bin=raw.subarray(offs,offs+n);offs+=n;}
 if(!json||!bin)throw Error('Missing mesh '+key);
 const ct={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array};const comp={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16};
 function accessor(idx){const a=json.accessors[idx],bv=json.bufferViews[a.bufferView],T=ct[a.componentType],dim=comp[a.type],byteOffset=(bv.byteOffset||0)+(a.byteOffset||0);if(!T)throw Error('Component '+a.componentType);const unit=T.BYTES_PER_ELEMENT;
  let arr;if(bv.byteStride&&bv.byteStride!==dim*unit){arr=new T(a.count*dim);const src=new DataView(bin.buffer,bin.byteOffset,bin.byteLength);for(let k=0;k<a.count;k++)for(let j=0;j<dim;j++){let at=byteOffset+k*bv.byteStride+j*unit;arr[k*dim+j]=a.componentType===5126?src.getFloat32(at,true):a.componentType===5125?src.getUint32(at,true):a.componentType===5123?src.getUint16(at,true):src.getUint8(at);}}
  else {const slice=bin.slice(byteOffset,byteOffset+a.count*dim*unit);arr=new T(slice.buffer,slice.byteOffset,a.count*dim);}
  return {array:arr,itemSize:dim,normalized:!!a.normalized};
 }
 const texCache={};function texture(i){if(i==null)return null;if(texCache[i])return texCache[i];const tex=json.textures[i],im=json.images[tex.source],bv=json.bufferViews[im.bufferView];const bytes=bin.subarray(bv.byteOffset||0,(bv.byteOffset||0)+bv.byteLength),blob=new Blob([bytes],{type:im.mimeType||'image/png'}),url=URL.createObjectURL(blob);
 const t=new THREE.Texture();t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;const img=new Image();img.onload=()=>{t.image=img;t.needsUpdate=true;URL.revokeObjectURL(url);};img.onerror=()=>URL.revokeObjectURL(url);img.src=url;texCache[i]=t;return t;
 }
 const mats=(json.materials||[]).map(m=>{const p=m.pbrMetallicRoughness||{},base=p.baseColorFactor||[1,1,1,1],em=m.emissiveFactor||[0,0,0],strong=grafClamp(m.extensions?.KHR_materials_emissive_strength?.emissiveStrength||1,0,2.6);
  const o=new THREE.MeshLambertMaterial({color:new THREE.Color(base[0],base[1],base[2]),map:texture(p.baseColorTexture?.index),emissive:new THREE.Color(em[0]*strong,em[1]*strong,em[2]*strong),emissiveMap:texture(m.emissiveTexture?.index),transparent:base[3]<.99||m.alphaMode==='BLEND',opacity:base[3],side:m.doubleSided?THREE.DoubleSide:THREE.FrontSide});if(m.alphaMode==='MASK')o.alphaTest=m.alphaCutoff||.5;return o;
 });
 const nodes=(json.nodes||[]).map((n,i)=>{let g=new THREE.Group();g.name=n.name||'part_'+i;if(n.translation)g.position.fromArray(n.translation);if(n.rotation)g.quaternion.fromArray(n.rotation);if(n.scale)g.scale.fromArray(n.scale);return g;});
 for(let i=0;i<nodes.length;i++){let n=json.nodes[i],group=nodes[i];if(n.mesh==null)continue;const msh=json.meshes[n.mesh];for(let prim of msh.primitives){const g=new THREE.BufferGeometry(),attrs=prim.attributes||{};for(const [name,idx] of Object.entries(attrs)){
   let a=accessor(idx),target={POSITION:'position',NORMAL:'normal',TEXCOORD_0:'uv',COLOR_0:'color'}[name];if(target)g.setAttribute(target,new THREE.BufferAttribute(a.array,a.itemSize,a.normalized));
  }if(prim.indices!=null){let a=accessor(prim.indices);g.setIndex(new THREE.BufferAttribute(a.array,1));}if(!g.getAttribute('normal'))g.computeVertexNormals();const o=new THREE.Mesh(g,mats[prim.material]||new THREE.MeshLambertMaterial({color:0x748e9b}));o.frustumCulled=true;group.add(o);}
 }
 for(let i=0;i<nodes.length;i++)for(let j of json.nodes[i].children||[])nodes[i].add(nodes[j]);let root=new THREE.Group();root.name=key;for(let n of (json.scenes?.[json.scene||0]?.nodes||[0]))root.add(nodes[n]);
 const clips=[];for(let a of json.animations||[]){let channels=[];for(let ch of a.channels||[]){let sm=a.samplers[ch.sampler];if(ch.target.node==null)continue;const times=accessor(sm.input).array,vals=accessor(sm.output).array;channels.push({node:nodes[ch.target.node],path:ch.target.path,times,vals,comps:ch.target.path==='rotation'?4:3});}let len=Math.max(0,...channels.map(c=>c.times[c.times.length-1]||0));clips.push({channels,len});}
 return {group:root,clips,meshes:json.meshes?.length||0,animations:clips.length};
}
const grafModels=new Map();
async function grafModel(key){if(grafModels.has(key))return grafModels.get(key);const obj=await grafParseGLB(key);grafModels.set(key,obj);GRAF.glbModels++;return obj;}
function grafAnimateModel(entry,time,clone){if(!entry?.clips?.length)return;const clip=entry.clips[0],t=clip.len>0?time%clip.len:0;
 for(const c of clip.channels){const target=clone?.getObjectByName(c.node.name)||c.node;const ts=c.times,vs=c.vals,m=c.comps;let a=0;while(a<ts.length-2&&ts[a+1]<t)a++;const b=Math.min(ts.length-1,a+1),f=ts[b]>ts[a]?(t-ts[a])/(ts[b]-ts[a]):0;const vals=[];for(let k=0;k<m;k++)vals[k]=(vs[a*m+k]||0)*(1-f)+(vs[b*m+k]||0)*f;
 if(c.path==='translation')target.position.set(...vals);if(c.path==='scale')target.scale.set(...vals);if(c.path==='rotation')target.quaternion.set(...vals).normalize();
 }
}

let grafWeatherProp=null,grafWeatherToken=0;
function grafWeather3D(path){let token=++grafWeatherToken;if(grafWeatherProp){GRAF_ROOT.remove(grafWeatherProp.root);grafWeatherProp=null;}
 if(!path)return;const key='weather_'+path.split('/').pop().replace('.glb','');grafModel(key).then(entry=>{if(token!==grafWeatherToken)return;
  const root=entry.group.clone(true);root.scale.setScalar(key==='weather_sky_jellyfish'?1.8:key==='weather_blood_moon'?2.6:1.15);GRAF_ROOT.add(root);grafWeatherProp={root,entry,seed:Math.random()*8};
 }).catch(e=>GRAF.loadErrors.push(key+': '+String(e).slice(0,120)));
}
const grafFish=[];const grafFishTextures=[];
function grafCreateFish(){let fishTex=grafImageTexture('city/lantern_fish_swim.png'),anglerTex=grafImageTexture('city/angler_idle.png');
 for(const tex of [fishTex,anglerTex]){tex.repeat.set(1/8,1);tex.wrapS=THREE.RepeatWrapping;grafFishTextures.push(tex);}
 for(let i=0;i<9;i++){const tex=i%3===0?anglerTex:fishTex;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color:i%3===0?0xffd8a2:0x90ffec,transparent:true,depthWrite:false}));sp.scale.set(i%3===0?1.9:1.2,i%3===0?.85:.5,1);sp.position.set(world.spawn.x+Math.sin(i*2.4)*8,world.spawn.y+2+i%3,world.spawn.z+Math.cos(i*2.3)*8);GRAF_CITY.add(sp);grafFish.push({sp,seed:i*1.83,pos:sp.position.clone(),tex});}
}
function grafAnimateFish(t){for(let i=0;i<grafFishTextures.length;i++)grafFishTextures[i].offset.x=(Math.floor(t*(i?7:9))+i*3)%8/8;for(const f of grafFish){const {sp,seed}=f;sp.position.x=f.pos.x+Math.sin(t*.5+seed)*2.2;sp.position.y=f.pos.y+Math.sin(t*1.1+seed)*.4;sp.position.z=f.pos.z+Math.cos(t*.51+seed)*1.4;sp.material.rotation=Math.sin(t*1.3+seed)*.14;}}

const grafInstances=[];
const grafPlaceSpecs=[
 ['cathedral_tower',-12,9,0,0.46],['arch',-6,8,0,.85],['column',-10,4,0,.8],['stairs',-1,10,0,.75],['bridge_broken',9,8,0,.6],['street_lamp',-4,1,0,1.4],['iron_gate',4,7,0,.85],['gargoyle',7,2,0,1.1],['glow_fish_teal',4,3,3,1.2],['jellyfish_violet',-8,5,3,1.3],['angler',7,-3,1,1.0],['sea_fan',-2,5,0,1.3],['kelp_tall',3,-1,0,1.6],['bathyscaphe',-10,-5,1,.63],['treasure_chest',2,8,0,1.2],['manta',6,-4,3,1.3],['bubble',-7,-4,4,1],['coral_branch_violet',10,5,0,1.25]];
async function grafBuildCity(){const at=world.spawn;let i=0;for(const [id,dx,dz,dy,scale] of grafPlaceSpecs){if(i++>9&&IS_TOUCH)break;try{let entry=await grafModel(id),clone=entry.group.clone(true),x=grafClamp(at.x+dx,2,62),z=grafClamp(at.z+dz,2,62),y=(world.stand[Math.floor(x)+Math.floor(z)*W]||SEA)+dy;clone.position.set(x,y,z);clone.scale.setScalar(scale);GRAF_CITY.add(clone);grafInstances.push({entry,clone,position:clone.position.clone(),seed:i});GRAF.assetsLoaded++;}catch(e){GRAF.loadErrors.push(id+': '+String(e).slice(0,100));}}
}
function grafMakeAsh(){let rand=(i)=>grafHash(i,74,G.seed);for(let i=0;i<28;i++){let x=4+rand(i*7)*56,z=5+rand(i*7+3)*54;let y=world.stand[Math.floor(x)+Math.floor(z)*W]||SEA;
 let group=new THREE.Group(),h=.8+rand(i*31)*1.8,mat=new THREE.MeshLambertMaterial({color:i%4?0x51444a:0x786360,emissive:i%7===0?0x2c1109:0x000000});
 const stone=new THREE.Mesh(new THREE.BoxGeometry(.95,h,.95),mat);stone.position.y=h*.5;group.add(stone);
 if(i%3===0){const glow=new THREE.Mesh(new THREE.IcosahedronGeometry(.28+rand(i*3)*.2,0),new THREE.MeshBasicMaterial({color:i%2?0xff8a3d:0xb052ef}));glow.position.set(0,h+.35,0);group.add(glow);group.userData.ember=glow;}
 group.position.set(x,y,z);GRAF_ASH.add(group);}
 for(let i=0;i<12;i++){let x=5+rand(i*17+23)*50,z=6+rand(i*17+38)*52;let y=world.stand[Math.floor(x)+Math.floor(z)*W]||SEA;let g=new THREE.Group();const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.12,.26,2.5,5),new THREE.MeshLambertMaterial({color:0x2a2736}));trunk.position.y=1.25;g.add(trunk);
 for(let j=0;j<4;j++){let branch=new THREE.Mesh(new THREE.ConeGeometry(.4,1.2,4),new THREE.MeshLambertMaterial({color:j%2?0x61393a:0x432a43,transparent:true,opacity:.94}));branch.position.set(Math.cos(j*2)*.32,2.0+Math.sin(j)*.5,Math.sin(j*2)*.32);branch.rotation.z=.15;g.add(branch);}
 g.position.set(x,y,z);g.userData.sway=rand(i*24)*5;GRAF_ASH.add(g);}
}
/* Continuous 2D and eight-direction 2.5D GPU sprites, one draw call per live layer. */
const grafFX=[];
const grafEmitterVS=`attribute float aSeed;attribute float aSpeed;attribute float aSize;uniform float uTime,uWind,uScale,uDirection;varying float vFrame;varying float vSeed;void main(){float t=uTime*aSpeed+aSeed*47.;vec3 p=position;float fall=mod(t*3.,16.);p.y-=fall;p.x+=sin(t*.41+aSeed*4.)*uWind*2.;p.z+=cos(t*.36)*1.4;if(uDirection>1.5){p.y+=fall*1.3;p.x+=cos(t*.13)*1.5;}vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(aSize*uScale/max(2.,-mv.z),1.,62.);vFrame=mod(floor(uTime*12.+aSeed*8.),8.);vSeed=aSeed;}`;
const grafEmitterFS=`uniform sampler2D uAtlas;uniform float uAlpha,uDirs,uTint;uniform float uYaw; varying float vFrame,vSeed;void main(){float row=mod(floor(uYaw*1.27323954+8.),uDirs);vec2 uv=vec2((vFrame+gl_PointCoord.x)/8.,1.-(row+gl_PointCoord.y)/uDirs);vec4 p=texture2D(uAtlas,uv);if(p.a<.055)discard;gl_FragColor=vec4(p.rgb*vec3(1.,uTint,1.03),p.a*uAlpha);}`;
function grafEmitter(count,dirs,size){let positions=new Float32Array(count*3),seed=new Float32Array(count),speed=new Float32Array(count),sizes=new Float32Array(count);
 for(let i=0;i<count;i++){positions[3*i]=(grafHash(i,13,G.seed)-.5)*38;positions[3*i+1]=5+grafHash(i,16,G.seed)*18;positions[3*i+2]=(grafHash(i,19,G.seed)-.5)*38;seed[i]=grafHash(i,23,G.seed);speed[i]=.4+grafHash(i,28,G.seed)*.8;sizes[i]=.8+grafHash(i,32,G.seed)*.6;}
 let geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));geo.setAttribute('aSeed',new THREE.BufferAttribute(seed,1));geo.setAttribute('aSpeed',new THREE.BufferAttribute(speed,1));geo.setAttribute('aSize',new THREE.BufferAttribute(sizes,1));
 const u={uTime:{value:0},uWind:{value:1},uScale:{value:size},uDirection:{value:0},uAtlas:{value:null},uAlpha:{value:0},uDirs:{value:dirs},uTint:{value:1},uYaw:{value:0}};
 let mat=new THREE.ShaderMaterial({vertexShader:grafEmitterVS,fragmentShader:grafEmitterFS,uniforms:u,transparent:true,depthTest:true,depthWrite:false,blending:THREE.NormalBlending});let o=new THREE.Points(geo,mat);o.frustumCulled=false;GRAF_ROOT.add(o);return {o,u,geo};
}
const grafParticles=grafEmitter(IS_TOUCH?48:136,1,IS_TOUCH?270:330),grafBillboards=grafEmitter(IS_TOUCH?20:54,8,IS_TOUCH?410:510);
const grafV12VS=`attribute float aVariant;attribute float aPhase;attribute float aSize;varying float vVariant,vFrame,vView;uniform float uTime,uYaw;void main(){vec3 p=position;float t=uTime*.7+aPhase*13.;p.y-=mod(t*2.,11.);p.x+=sin(t*.4+aPhase)*1.8;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(aSize*320./max(2.,-mv.z),1.,55.);vVariant=aVariant;vFrame=mod(floor(uTime*8.+aPhase*8.),8.);vView=mod(floor(uYaw*1.273239545+64.),8.);}`;
const grafV12FS=`uniform sampler2D uAtlas;uniform float uRows,uAlpha;varying float vVariant,vFrame,vView;void main(){float tx=mod(vVariant,3.),ty=floor(vVariant/3.);float row=mod(vView,uRows);vec2 uv=vec2((tx*8.+vFrame+gl_PointCoord.x)/24.,1.-(ty*uRows+row+gl_PointCoord.y)/(uRows*2.));vec4 p=texture2D(uAtlas,uv);if(p.a<.045)discard;gl_FragColor=vec4(p.rgb,p.a*uAlpha);}`;
function grafV12Emitter(count){const geo=new THREE.BufferGeometry();let pos=new Float32Array(count*3),vary=new Float32Array(count),phase=new Float32Array(count),size=new Float32Array(count);
 for(let i=0;i<count;i++){pos[3*i]=(grafHash(i,77,G.seed)-.5)*26;pos[3*i+1]=2+grafHash(i,78,G.seed)*15;pos[3*i+2]=(grafHash(i,79,G.seed)-.5)*26;vary[i]=Math.floor(grafHash(i,81,G.seed)*6);phase[i]=grafHash(i,82,G.seed);size[i]=.8+grafHash(i,84,G.seed)*.6;}
 geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('aVariant',new THREE.BufferAttribute(vary,1));geo.setAttribute('aPhase',new THREE.BufferAttribute(phase,1));geo.setAttribute('aSize',new THREE.BufferAttribute(size,1));const uniforms={uAtlas:{value:null},uRows:{value:8},uAlpha:{value:0},uTime:{value:0},uYaw:{value:0}};
 const mat=new THREE.ShaderMaterial({uniforms,vertexShader:grafV12VS,fragmentShader:grafV12FS,transparent:true,depthWrite:false,depthTest:true});const o=new THREE.Points(geo,mat);o.frustumCulled=false;GRAF_ROOT.add(o);return {o,geo,u:uniforms};
}
const grafLeaves=grafV12Emitter(IS_TOUCH?42:110);
const grafStormLine=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0xd2e8ff,transparent:true,opacity:0}));GRAF_ROOT.add(grafStormLine);
function grafLightning(){const p=player.pos,verts=[];let x=p.x+(Math.random()-.5)*24,z=p.z+(Math.random()-.5)*24;
 for(let i=0;i<13;i++){const h=33-i*2.5,nx=x+(Math.random()-.5)*2,nz=z+(Math.random()-.5)*2;verts.push(x,h,z,nx,h-2.5,nz);x=nx;z=nz;}
 grafStormLine.geometry.dispose();grafStormLine.geometry=new THREE.BufferGeometry();grafStormLine.geometry.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));grafStormLine.material.opacity=1;GRAF_FLASH.position.set(x,22,z);GRAF.lightTarget=2.6;rig.trauma=Math.min(1,rig.trauma+.15);SFX.beat?.(.85);
}
function grafWeather(id,quiet=false){let n=typeof id==='number'?id:GRAF_PRESETS.findIndex(p=>p.id===id);if(n<0)n=0;GRAF.weatherIndex=n;GRAF.weather=GRAF_PRESETS[n];GRAF.weatherName=GRAF.weather.name;GRAF.clock=0;
 const p=GRAF.weather.effects,light=GRAF.weather.ambientLighting;grafWeather3D(p['3d']);grafParticles.u.uAtlas.value=grafImageTexture(p.spriteAtlas);grafParticles.u.uDirection.value={fall:0,rise:2,swirl:1}[p.direction]||0;
 grafBillboards.u.uAtlas.value=grafImageTexture(p['2_5d']);grafBillboards.u.uDirs.value=8;grafBillboards.o.visible=!!p['2_5d'];
 const special=id==='autumn_leaves'||GRAF.weather.id==='autumn_leaves'?'leaves':GRAF.weather.id.includes('flower_wind')?'petals':GRAF.weather.id.includes('snow')?'weather_fx':null;
 const atlas={leaves:'v12/leaves',petals:'v12/petals',weather_fx:'v12/weather_fx'}[special];grafLeaves.o.visible=!!atlas;grafLeaves.u.uAtlas.value=atlas?grafImageTexture(atlas):null;grafLeaves.u.uRows.value=special==='weather_fx'?1:8;
 grafLeaves.u.uAlpha.value=0;grafParticles.u.uAlpha.value=0;grafBillboards.u.uAlpha.value=0;
 GRAF.lightMix=0;GRAF.cycle=(GRAF.weather.durationSeconds?.[0]||40)*.7+18;
 if(!quiet)toast('ПОГОДА · '+GRAF.weather.name,2600,false,1);grafSetUI();
}
function grafSetMode(v){GRAF.mode=(v+GRAF_MODES.length)%GRAF_MODES.length;GRAF_ASH.visible=GRAF.mode===1;GRAF_CITY.visible=GRAF.mode===2;GRAF_LIGHT.intensity=GRAF.mode===2?3:0;grafStream(true);
 if(GRAF.mode===1)grafWeather('volcanic_ash',true);
 else if(GRAF.mode===2)grafWeather('sea_fog',true);
 else grafWeather(0,true);
 toast('МИР · '+GRAF_MODES[GRAF.mode],3300,false,3);grafSetUI();
}
function grafUpdateLighting(dt){if(!GRAF.weather)return;const p=GRAF.weather.ambientLighting;GRAF.lightMix=Math.min(1,GRAF.lightMix+dt*.25);
 terrainMat.color.lerp(new THREE.Color(GRAF.mode===2?0x699aae:GRAF.mode===1?0xb79b91:0xffffff),1-Math.exp(-dt*1.5));let k=GRAF.lightMix*(GRAF.mode===2?.78:GRAF.mode===1?.68:.55);
 const cold=new THREE.Color(p.ambient),warm=new THREE.Color(p.sun),mist=new THREE.Color(p.fog),skyTop=new THREE.Color(p.skyTop),hori=new THREE.Color(p.skyHorizon);
 scene.fog.color.lerp(mist,k);scene.fog.density=Math.max(.008,scene.fog.density*(1-k)+p.fogDensity*k);U.fogD.value=scene.fog.density;hemi.color.lerp(cold,k);hemi.intensity=grafClamp(hemi.intensity*(1-k)+(GRAF.mode===2?.65:1.2)*k,.32,2.3);
 keyLight.color.lerp(warm,k);keyLight.intensity=grafClamp(keyLight.intensity*(1-k)+(GRAF.mode===1?1.15:GRAF.mode===2?.9:1.6)*k,.2,3);
 if(GRAF.mode===2){waterU.uDeep.value.lerp(new THREE.Color(0x04152b),k*.8);waterU.uShallow.value.lerp(new THREE.Color(0x0d6674),k*.8);waterU.uFoam.value.lerp(new THREE.Color(0x5ef7cf),k*.7);}else if(GRAF.mode===1){waterU.uDeep.value.lerp(new THREE.Color(0x26151d),k*.65);waterU.uShallow.value.lerp(new THREE.Color(0x76534e),k*.6);}
 skyU.uTop.value.lerp(skyTop,k);skyU.uHorizon.value.lerp(hori,k);mistColor.lerp(mist,k*.4);renderer.toneMappingExposure=pal.exposure*(1-k)+p.exposure*k;
 const breath=.7+.3*Math.sin(G.time*1.9);GRAF_LIGHT.position.set(player.pos.x+5,player.pos.y+4,player.pos.z-3);GRAF_LIGHT.intensity=GRAF.mode===2?breath*2.5:0;
 GRAF.lightTarget*=Math.exp(-dt*4);GRAF_FLASH.intensity=Math.max(0,GRAF.lightTarget*3.4);grafStormLine.material.opacity*=Math.exp(-dt*22);
 if(GRAF.lightTarget>.8){hemi.intensity+=GRAF.lightTarget*.35;keyLight.intensity+=GRAF.lightTarget*.6;FX.uFlashColor.value.setRGB(.7,.84,1);G.flash=Math.max(G.flash,GRAF.lightTarget*.12);}
}
function grafMakeSpirit(){const g=new THREE.Group(),body=new THREE.Mesh(new THREE.IcosahedronGeometry(.45,1),new THREE.MeshLambertMaterial({color:0xe1e0ff,emissive:0x43378b}));g.add(body);
 let limbs=[];for(let i=0;i<4;i++){let limb=new THREE.Group();limb.position.set(i<2?-.35:.35, i%2?-.3:.3,0);let m=new THREE.Mesh(new THREE.BoxGeometry(.2,.56,.2),new THREE.MeshLambertMaterial({color:0x9d8ead}));m.position.y=-.25;limb.add(m);g.add(limb);limbs.push(limb);}
 const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:grafImageTexture('2d/atlases/star_8f.png'),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));halo.scale.set(2,2,1);halo.position.y=1;g.add(halo);GRAF_ROOT.add(g);return {g,limbs,halo,hp:60,cool:0,base:new THREE.Vector3(),phase:Math.random()*6};
}
function grafCreateSpirits(){for(let i=0;i<2;i++){let a=grafMakeSpirit();GRAF.activeNPC.push(a);}}
function grafNPC(dt){for(let i=0;i<GRAF.activeNPC.length;i++){const n=GRAF.activeNPC[i];let t=G.time+n.phase,p=player.pos,off=i?Math.PI:0;
 n.g.position.set(p.x+Math.cos(t*.45+off)*2.2,p.y+1.4+Math.sin(t*2)*.22,p.z+Math.sin(t*.45+off)*2.2);
 n.limbs.forEach((b,k)=>b.rotation.x=Math.sin(t*3+k*1.6)*.5);n.halo.material.rotation=t*.45;n.cool=Math.max(0,n.cool-dt);
 if(n.cool<=0&&G.state==='play'){let target=null,min=8;for(const f of foes){if(!foeAlive(f))continue;const d=n.g.position.distanceTo(f.segs[0]);if(d<min){target=f;min=d;}}
  if(target){let v=target.segs[0],dx=v.x-n.g.position.x,dz=v.z-n.g.position.z;damageFoe(target,3.5,dx/(min||1),dz/(min||1),{shock:true,kb:1,quiet:true,at:v});glow.spark(v.x,v.y,v.z,.25,C.wispHalo,1.6,0);n.cool=1.25;}
 }
}}
function grafInteract(){if(G.state!=='play')return;for(const n of GRAF.activeNPC){if(n.g.position.distanceTo(player.pos)<4.0){if(player.hp<HP_MAX){player.hp=Math.min(HP_MAX,player.hp+1);updateHearts(false);toast('Дух возвращает часть сил',1800);SFX.ui();}else toast('Дух защищает тебя от теней',1700);return;}}
 toast(GRAF.mode===2?'В глубине затонувшего города слышен зов…':GRAF.mode===1?'Пепел хранит следы забытых дорог':'Ветер меняет направление',1800);
}
function grafUpdate(dt){if(!world||!GRAF.weather)return;GRAF.clock+=dt;GRAF.frame++;if(GRAF.auto&&GRAF.clock>GRAF.cycle){grafWeather((GRAF.weatherIndex+1+Math.floor(grafHash(GRAF.frame,6,G.seed)*5))%GRAF_PRESETS.length);}
 if((GRAF.frame&19)===0)grafStream();water.position.x=player.pos.x;water.position.z=player.pos.z;let p=GRAF.weather.effects;
 grafParticles.u.uTime.value=G.time;grafParticles.u.uWind.value=1+Math.sin(G.time*.2);grafParticles.u.uYaw.value=rig.yaw;grafParticles.u.uAlpha.value=Math.min(.87,grafParticles.u.uAlpha.value+dt*.28);grafParticles.o.position.set(player.pos.x,player.pos.y+3,player.pos.z);
 grafBillboards.u.uTime.value=G.time;grafBillboards.u.uYaw.value=rig.yaw;grafBillboards.u.uAlpha.value=grafBillboards.o.visible?Math.min(.8,grafBillboards.u.uAlpha.value+dt*.24):0;grafBillboards.o.position.copy(grafParticles.o.position);
 grafLeaves.u.uTime.value=G.time;grafLeaves.u.uYaw.value=rig.yaw;grafLeaves.u.uAlpha.value=grafLeaves.o.visible?Math.min(.86,grafLeaves.u.uAlpha.value+dt*.28):0;grafLeaves.o.position.copy(grafParticles.o.position);
 if(grafWeatherProp){let o=grafWeatherProp;o.root.position.set(player.pos.x+Math.sin(G.time*.3+o.seed)*5,player.pos.y+5+Math.sin(G.time*.9)*.5,player.pos.z-8);o.root.rotation.y+=dt*.28;grafAnimateModel(o.entry,G.time*.75,o.root);}
 const lightning=GRAF.weather.id.includes('storm')||GRAF.weather.id.includes('thunder')||GRAF.weather.id.includes('lightning')||GRAF.weather.id.includes('tempest');if(lightning&&Math.random()<dt*.18)grafLightning();
 if(GRAF.mode===1){for(let i=0;i<GRAF_ASH.children.length;i++){const c=GRAF_ASH.children[i];if(c.userData.ember)c.userData.ember.scale.setScalar(.75+.35*Math.sin(G.time*3.8+i));if(c.userData.sway)c.rotation.z=Math.sin(G.time*.9+c.userData.sway)*.04;}}
 if(GRAF.mode===2){grafAnimateFish(G.time);for(const obj of grafInstances){const y=obj.position.y;obj.clone.position.y=y+Math.sin(G.time*1.6+obj.seed)*.13;obj.clone.rotation.y=Math.sin(G.time*.2+obj.seed)*.045;grafAnimateModel(obj.entry,G.time*.6+obj.seed,obj.clone);}}
 grafNPC(dt);grafUpdateLighting(dt);
 if((GRAF.frame&63)===0)grafSetUI();
}
function grafBtnSVG(type){const pixels={world:'<path d="M3 5h14v10H3z M6 2h8v3H6z M7 7h6v6H7z"/>',weather:'<path d="M5 3h10v2h2v3h2v3H2V8h2V5h1z M5 14h2v3H5z M10 13h2v4h-2z M15 14h2v3h-2z"/>',auto:'<path d="M7 2h7v2h3v4h-3V6H7V4H5v4H3V5h2V3h2z M13 16H6v-2H3v-4h3v2h7v2h2v-4h2v5h-2v2h-2z"/>',interact:'<path d="M9 2h4v5h4v3h-4v4h-2v3H8v-3H6V9h2V6h1z"/>',ashbook:'<path d="M8 1h4v4H8z M6 5h8v4H6z M4 9h12v3H4z M6 12h3v5H6z M11 12h3v5h-3z"/>',citybook:'<path d="M2 16h16v2H2z M4 8h3v8H4z M8 3h4v13H8z M9 1h2v2H9z M13 6h3v10h-3z"/>',jump:'<path d="M8 2h4v2h2v2h2v2h2v4h-3V9h-3v9H8V9H5v3H2V8h2V6h2V4h2z"/>',attack:'<path d="M3 15h3l7-7 2 2-7 7H5z M11 4l2-2 5 5-2 2z M8 8l2-2 4 4-2 2z"/>'};let str=`<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><path fill="#fff9d6" d="${pixels[type].match(/d="([^"]+)/)[1]}"/></svg>`;return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(str);}
function grafSetUI(){if(!window.__grafUI)return;const [a,b,c]=window.__grafUI;a.title=GRAF_MODES[GRAF.mode];b.title=GRAF.weather?.name||'';c.title='Автопогода: '+(GRAF.auto?'вкл':'выкл');c.classList.toggle('selected',GRAF.auto);const t=document.getElementById('grafLabel');if(t)t.textContent=GRAF_MODES[GRAF.mode]+'  ·  '+(GRAF.weather?.name||'');}
function grafInstallUI(){const layer=document.createElement('div');layer.id='grafBar';layer.innerHTML='<div id="grafLabel"></div><div id="grafControls"><button id="grafWorld" aria-label="Переключить мир"></button><button id="grafWeather" aria-label="Сменить погоду"></button><button id="grafAuto" aria-label="Автоматическая погода"></button><button id="grafInteract" aria-label="Взаимодействовать с персонажем"></button></div>';
 document.body.appendChild(layer);const ids=['grafWorld','grafWeather','grafAuto','grafInteract'];for(let i=0;i<ids.length;i++){let el=document.getElementById(ids[i]);el.style.backgroundImage=`url("${grafBtnSVG(['world','weather','auto','interact'][i])}")`;}
 document.getElementById('grafWorld').onclick=()=>grafSetMode(GRAF.mode+1);document.getElementById('grafWeather').onclick=()=>grafWeather(GRAF.weatherIndex+1);document.getElementById('grafAuto').onclick=()=>{GRAF.auto=!GRAF.auto;grafSetUI();};document.getElementById('grafInteract').onclick=grafInteract;
 const css=document.createElement('style');css.textContent=`
 html,body{overscroll-behavior:none!important;touch-action:none!important;position:fixed!important;inset:0!important;width:100%!important;height:100%!important;overflow:hidden!important}
 #c{position:fixed!important;inset:0!important;touch-action:none!important}#grafBar{position:fixed;top:calc(10px + env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);z-index:8;display:flex;flex-direction:column;align-items:center;gap:6px;pointer-events:none}#grafLabel{font:600 10px monospace;color:#f5eddf;text-shadow:0 2px 6px #000;letter-spacing:.11em;white-space:nowrap;max-width:80vw;overflow:hidden;text-overflow:ellipsis}#grafControls{pointer-events:auto;display:flex;gap:6px}#grafControls button{display:block;width:39px;height:39px;border:1px solid #a79fac;border-radius:7px;background-color:#14131cba;background-position:center;background-repeat:no-repeat;background-size:22px 22px;image-rendering:pixelated;touch-action:none;cursor:pointer}#grafControls button.selected{border-color:#e3c574;box-shadow:0 0 12px #d7b75f88}#grafControls button:active{transform:scale(.94)}#btnAtk,#btnJump{font-size:0!important;background-position:center;background-repeat:no-repeat;background-size:52px 52px;image-rendering:pixelated}#btnAtk{background-image:url('${grafBtnSVG('attack')}')}#btnJump{background-image:url('${grafBtnSVG('jump')}')}@media(pointer:coarse){#grafBar{top:calc(122px + env(safe-area-inset-top,0px));left:auto;right:8px;transform:none}#grafControls{display:grid;grid-template-columns:repeat(2,38px);gap:5px}#grafControls button{width:38px;height:38px}#grafLabel{display:none}}
 `;document.head.appendChild(css);window.__grafUI=ids.slice(0,3).map(x=>document.getElementById(x));
 addEventListener('keydown',ev=>{if(ev.repeat||ev.altKey||ev.ctrlKey||ev.metaKey)return;if(ev.code==='KeyV')grafSetMode(GRAF.mode+1);if(ev.code==='KeyT')grafWeather(GRAF.weatherIndex+1);if(ev.code==='KeyY'){GRAF.auto=!GRAF.auto;grafSetUI();}if(ev.code==='KeyI')grafInteract();});
 for(const id of ids) {let el=document.getElementById(id);el.addEventListener('pointerdown',e=>e.stopPropagation());el.addEventListener('pointerup',e=>e.stopPropagation());}
}
function grafInit(){grafInstallUI();grafMakeAsh();grafCreateSpirits();grafCreateFish();grafWeather(0,true);grafSetUI();grafStream();Promise.resolve().then(()=>grafBuildCity()).catch(e=>GRAF.loadErrors.push(String(e)));window.__graf={GRAF,root:GRAF_ROOT,worldMode:grafSetMode,weather:grafWeather,interact:grafInteract,terrain:grafOutside,stream:grafStream,models:Object.keys(GRAF_GLB),presets:GRAF_PRESETS.map(p=>p.id),get hero(){return player.pos.clone()},get renderInfo(){return {calls:composer.sceneCalls||renderer.info.render.calls,triangles:composer.sceneTris||renderer.info.render.triangles,modelsLoaded:GRAF.assetsLoaded,chunks:GRAF.chunks.size}}};}

/* Complete unmodified originals are preserved as on-demand self-contained interactive archives.
   The shared playable world above uses the original Twilight hero, weapons and combat. */
const GRAF_ARCHIVE={open:null,frame:null,modal:null};
async function grafArchiveOpen(which){if(GRAF_ARCHIVE.open)return;const b64=GRAF_ARCHIVE_PACKS[which];if(!b64)return;
 const modal=document.createElement('div');modal.id='grafArchive';modal.style.cssText='position:fixed;inset:0;z-index:35;background:#030712;display:flex;flex-direction:column;touch-action:none';
 const nav=document.createElement('div');nav.style.cssText='height:56px;flex:none;background:#0a101c;display:flex;align-items:center;justify-content:space-between;padding:6px 16px;font:600 14px monospace;color:#e9ce8c';
 let title=document.createElement('span');title.textContent=which==='city'?'ЗАТОНУВШИЙ ГОРОД · ИСХОДНЫЙ КАТАЛОГ':'ПЕПЕЛЬНЫЙ ПУТЬ · ИСХОДНАЯ МАСТЕРСКАЯ';nav.appendChild(title);
 let close=document.createElement('button');close.textContent='✕ ВЕРНУТЬСЯ В ИГРУ';close.style.cssText='color:#f5e5b7;background:#243147;border:1px solid #bfc1b0;font:12px monospace;padding:12px;cursor:pointer';close.onclick=grafArchiveClose;nav.appendChild(close);modal.appendChild(nav);
 const box=document.createElement('div');box.style.cssText='flex:1;min-height:0;width:100%;background:#080c16';modal.appendChild(box);
 document.body.appendChild(modal);GRAF_ARCHIVE.open=which;GRAF_ARCHIVE.modal=modal;
 if(G.state==='play'){setPaused(true);GRAF_ARCHIVE.paused=true;}else GRAF_ARCHIVE.paused=false;
 try {const bytes=grafB64Bytes(b64),stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')),html=await new Response(stream).text();if(GRAF_ARCHIVE.open!==which)return;
  const frame=document.createElement('iframe');frame.style.cssText='width:100%;height:100%;border:0;display:block';frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-downloads allow-modals');const docBlob=new Blob([html],{type:'text/html'});let url=URL.createObjectURL(docBlob);frame.src=url;frame.onload=()=>setTimeout(()=>URL.revokeObjectURL(url),1200);box.appendChild(frame);GRAF_ARCHIVE.frame=frame;
 }catch(e){box.textContent='Не удалось открыть встроенную мастерскую: '+String(e)}
}
function grafArchiveClose(){if(!GRAF_ARCHIVE.open)return;GRAF_ARCHIVE.frame?.remove();GRAF_ARCHIVE.modal?.remove();GRAF_ARCHIVE.open=null;GRAF_ARCHIVE.frame=null;GRAF_ARCHIVE.modal=null;if(GRAF_ARCHIVE.paused)setPaused(false);GRAF_ARCHIVE.paused=false;}
function grafGalleryUI(){const p=document.createElement('div');p.id='grafArchiveLauncher';p.style.cssText='position:fixed;left:50%;transform:translateX(-50%);bottom:calc(8px + env(safe-area-inset-bottom,0px));z-index:8;display:flex;gap:5px;pointer-events:auto';
 for(let [id,label] of [['ash','АССЕТЫ ПЕПЛА'],['city','АРХИВ ГОРОДА']]){let b=document.createElement('button');b.textContent=label;b.setAttribute('aria-label',label);b.classList.add('grafArchive'+id);b.style.cssText='border:1px solid #6c6a8b;background:#100f23c4;color:#c4b9c7;padding:7px 10px;font:600 10px monospace;cursor:pointer;touch-action:none';b.onclick=()=>grafArchiveOpen(id);p.appendChild(b);}
 document.body.appendChild(p);
 const st=document.createElement('style');st.textContent=`@media(pointer:coarse){#grafArchiveLauncher{left:10px;transform:none;bottom:calc(6px + env(safe-area-inset-bottom,0px))}#grafArchiveLauncher button{font-size:0!important;padding:0;width:43px;height:43px;background-repeat:no-repeat!important;background-position:center!important;background-size:28px 28px!important;image-rendering:pixelated}#grafArchiveLauncher button.grafArchiveash{background-image:url('${grafBtnSVG('ashbook')}')!important}#grafArchiveLauncher button.grafArchivecity{background-image:url('${grafBtnSVG('citybook')}')!important}}`;document.head.appendChild(st);
 addEventListener('keydown',ev=>{if(ev.code==='Escape'&&GRAF_ARCHIVE.open){ev.stopImmediatePropagation();grafArchiveClose();}});
}


function frame(now) {
  requestAnimationFrame(frame);
  const raw = last ? Math.min(0.05, Math.max(0, (now - last) / 1000)) : 0.016;
  last = now;
  // hit-stop: a heavy blow freezes the simulation for a few frames; particles crawl, the camera keeps breathing
  const frozen = G.hitstop > 0;
  G.hitstop = Math.max(0, G.hitstop - raw);
  const dt = frozen ? 0 : raw * G.timeScale;
  G.time += raw;
  U.time.value = G.time;
  pollPad();
  glow.update(frozen ? raw * 0.12 : raw); dust.update(frozen ? raw * 0.12 : raw);
  const play = G.state === 'play';
  if (play) updateAim(raw);
  if (play || G.state === 'dead' || G.state === 'victory') updatePlayer(dt);
  if (play) { updateCombat(dt); updatePickups(dt); updateLoot(); }
  else {
    input.pressed = input.released = false;
    if (coinObj) { syncPickups(coins, coinObj); syncPickups(heartsP, heartObj); }
  }
  if (G.state !== 'paused') { updateProjectiles(dt); updateFoes(dt); updateSouls(dt); updateFx(dt); }
  updateFlow(raw);
  updateEnvironment(raw);
  grafUpdate(raw);
  updateBeacon(raw);
  updateCamera(raw);
  updateHeroMesh(raw);
  updateWisp(raw);
  updateLeaves(raw);
  sprites.begin(); ribbons.begin();
  renderLoot(); renderHeld(); renderProjectiles(); renderFx(raw); renderSouls();
  sprites.end(); ribbons.end();
  renderFoes();
  rebuildDirty();
  updatePost(raw);
  updateHUD(raw);
  updateCombatHud(raw);
  glow.flush(); dust.flush();
  composer.render(raw);
  perfMonitor(raw);
}
function start(data) {
  if (booted) return;
  booted = true;
  data = data || {};
  try { SFX.muted = localStorage.getItem('isle.muted') === '1'; } catch (e) { /* storage may be blocked */ }
  if (typeof data.muted === 'boolean') SFX.muted = data.muted;
  updateMuteBtn();
  buildWorld(Number.isFinite(data.seed) ? data.seed : DEFAULT_SEED);
  resetRun();
  grafInit();
  grafGalleryUI();
  G.state = 'title';
  const b = world.beacon, a = G.sunAz + 1.0;
  rig.pos.set(b.x + Math.cos(a) * 34, b.y + 5, b.z + Math.sin(a) * 34);
  rig.look.set(b.x, b.y - 4.5, b.z);
  requestAnimationFrame(frame);
  setTimeout(() => {
    loadingEl.classList.add('gone');
    $('scrTitle').hidden = false;
    $('best').textContent = G.best !== null ? `Рекорд этого острова — ${fmtTime(G.best)}` : '';
    setTimeout(() => loadingEl.remove(), 1400);
  }, 350);
}
try { window.claude?.hot?.snapshot?.(() => ({ seed: G.seed, muted: SFX.muted })); } catch (e) { /* viewer hook is optional */ }
const hot = window.claude?.hot;
if (hot?.ready) { try { hot.ready(start); } catch (e) { start({}); } } else start(hot?.data ?? {});
setTimeout(() => start({}), 2500);

// small handle for debugging / automated checks
window.__isle = {
  G, player, rig, perf, combat, aim, input, WEAPONS, ARSENAL_ORDER,
  get world() { return world; }, get foes() { return foes; }, get loot() { return loot; }, get projs() { return projs; },
  startGame, win, hurt: () => hurt(1), equip, cycleWeapon,
  setTod(v) { G.todT = G.tod = v; },
  get coins() { return coins; },
  rebuild(seed) { buildWorld(seed); resetRun(); },
  sim(dt, x, z, jump, fight) {
    simDir = [x, z];
    if (jump) { if (!player.jumpHeld) onJumpPress(); } else onJumpRelease();
    if (fight) { G.time += dt; U.time.value = G.time; updateAim(dt); }
    updatePlayer(dt);
    if (fight) {
      updateCombat(dt);
      updateCamera(dt); updateHeroMesh(dt);
      sprites.begin(); ribbons.begin(); renderHeld();       // keeps the muzzle where the hand is
    }
    updatePickups(dt); updateLoot(); updateProjectiles(dt); updateFoes(dt); updateSouls(dt); updateFx(dt); updateBeacon(dt);
    G.hitstop = 0;
    simDir = null;
  },
  foeNear(type = 'shade', dx = 3, dz = 3, hold = false) {
    const f = spawnFoe(type, player.pos.x + dx, player.pos.y + 1, player.pos.z + dz, false);
    if (!f) return null;
    const gy = Math.max(terrainTop(player.pos.x + dx, player.pos.z + dz), SEA);
    f.segs.forEach((sg, k) => sg.set(player.pos.x + dx + k * f.def.spacing * 0.8, gy + f.def.hover, player.pos.z + dz + k * 0.05));
    f.state = 'wander'; f.alpha = 1; f.t = 2; f.timer = 99; f.hold = hold; f.target.set(f.segs[0].x, 0, f.segs[0].z);
    if (type === 'warden') { G.warden = f; G.wardenSpawned = true; }
    return f;
  },
  shadeNear(dx = 3, dz = 3) { return this.foeNear('shade', dx, dz); },
  giveAll() {
    for (const id of ARSENAL_ORDER) {
      if (!combat.arsenal.includes(id)) combat.arsenal.push(id);
      const w = WEAPONS[id]; if (w.mag) combat.ammo[id] = w.mag;
    }
    for (const L of loot) L.alive = false;
    hudWeapon();
  },
  killWarden() { if (G.warden && foeAlive(G.warden)) damageFoe(G.warden, 1e6, 0, 0, { silent: true }); },
  killFoes() { for (const f of foes) if (foeAlive(f)) damageFoe(f, 1e6, 0, 0, { silent: true }); },
  attack(on) { setAttack('key', !!on); },
  boom(x, y, z) { explode(new THREE.Vector3(x, y, z), WEAPONS.bomb); },
  aimAt(x, z) { aim.dir.set(x - player.pos.x, 0, z - player.pos.z).normalize(); player.look.copy(aim.dir); },
  collectAll(keepOne) { coins.forEach((c, i) => { if (c.alive && !(keepOne && i === coins.length - 1)) collectCoin(i); }); },
  teleport(x, z) { const s = world.stand[Math.floor(x) + Math.floor(z) * W]; player.pos.set(x, Math.min(s, H - 2), z); player.vel.set(0, 0, 0); },
};



})().catch(function(e){console.error('GRAF offline boot:',e);const el=document.getElementById('loading');if(el){el.textContent='Ошибка загрузки мира: '+String(e);el.classList.remove('gone');}});

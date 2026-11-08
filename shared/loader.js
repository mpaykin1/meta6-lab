/* META GAMES shared loader: original browser scripts, not recompiled or modified. */
(function (root) {
  'use strict';
  const current=document.currentScript;
  const base=new URL('./',current?.src||location.href);
  const entries=Object.freeze({
    'observer-audio':Object.freeze({file:'components/observer-audio/audio.js',global:'ObserverKriegerAudio'}),
    'three-worlds-weather':Object.freeze({file:'components/three-worlds-weather/weather-cycle.js',module:true,exports:['worldWeatherAt','rainEventAt']}),
    'observer-story':Object.freeze({file:'components/observer-story/story-system.js',global:'ObserverStorySystem'}),
    'observer-mobile-input':Object.freeze({file:'components/observer-mobile-input/mobile-controls.js',global:'ObserverMobileControls'}),
    'observer-buildings':Object.freeze({file:'components/observer-buildings/building-assets.js',global:'ObserverBuildingAssets'}),
    'observer-npc':Object.freeze({file:'components/observer-npc/npc-catalog.js',global:'ObserverNpcCatalog'}),
    'observer-combat':Object.freeze({file:'components/observer-combat/combat-relations.js',global:'ObserverCombatRelations',depends:['observer-npc']}),
    'three-worlds-island-weather':Object.freeze({file:'components/three-worlds-island-weather/island-weather.js',module:true,exports:['createIslandWeatherCatalog']}),
    'three-worlds-rift-guard':Object.freeze({file:'components/three-worlds-rift-guard/rift-input-guard.js',module:true,exports:['createRiftInputGuard']}),
    'three-worlds-combat-facing':Object.freeze({file:'components/three-worlds-combat-facing/combat-facing.js',module:true,exports:['chooseCombatTarget','turnWeaponToward','turnHeroToward','angleToTarget']}),
    // Derived owner-provided library; provenance is in pod-i-nad/library.json.
    'pod-i-nad-flail-combat':Object.freeze({file:'components/pod-i-nad/animations/flail-combat.mjs',module:true,exports:['createFlailCombat']}),
    'pod-i-nad-flail-physics':Object.freeze({file:'components/pod-i-nad/animations/flail-physics.mjs',module:true,exports:['createFlailPhysics']}),
    'pod-i-nad-flail-hits':Object.freeze({file:'components/pod-i-nad/animations/flail-hit-detection.mjs',module:true,exports:['createFlailHitDetector']}),
    'pod-i-nad-combat-poses':Object.freeze({file:'components/pod-i-nad/animations/combat-poses.mjs',module:true,exports:['sampleCombatPose']}),
    'pod-i-nad-original-palettes':Object.freeze({file:'components/pod-i-nad/shaders/atmosphere/original-palettes.mjs',module:true,exports:['originalPalettes','getOriginalPalette','createOriginalPaletteColors']}),
    'pod-i-nad-original-sky':Object.freeze({file:'components/pod-i-nad/shaders/atmosphere/original-sky-material.mjs',module:true,exports:['ORIGINAL_SKY','createOriginalSkyMaterial','createOriginalSky','createOriginalSkyFromPalette']}),
    'pod-i-nad-original-glsl':Object.freeze({file:'components/pod-i-nad/shaders/original-glsl.mjs',module:true,exports:['shaderNames','originalShaderSources','shaderPairs','getOriginalGLSL','getOriginalShaderPair']}),
    'pod-i-nad-water':Object.freeze({file:'components/pod-i-nad/shaders/water/water-material.mjs',module:true,exports:['createWaterMaterial']}),
    'pod-i-nad-mist':Object.freeze({file:'components/pod-i-nad/shaders/atmosphere/mist-material.mjs',module:true,exports:['createMistMaterial','createMistLayers']}),
    'pod-i-nad-textures':Object.freeze({file:'components/pod-i-nad/textures/embedded-assets.mjs',module:true,exports:['loadTexture']})
  });
  const cache=new Map();
  function use(id) {
    if (!Object.hasOwn(entries,id)) return Promise.reject(new Error('Unregistered shared component'));
    if(cache.has(id))return cache.get(id);
    const entry=entries[id];
    const promise=Promise.all((entry.depends||[]).map(use)).then(()=>entry.module
      ? import(new URL(entry.file,base).href).then(mod=>{
          for(const name of entry.exports)if(typeof mod[name]!=='function')throw new Error('Missing shared module export '+name);
          return Object.freeze(Object.fromEntries(entry.exports.map(name=>[name,mod[name]])));
        })
      : new Promise((resolve,reject)=>{
      if(root[entry.global])return resolve(root[entry.global]);
      const el=document.createElement('script');
      el.async=true;
      el.src=new URL(entry.file,base).href;
      el.onload=()=>root[entry.global]?resolve(root[entry.global]):reject(new Error('Missing shared export '+id));
      el.onerror=()=>reject(new Error('Shared script failed to load '+id));
      document.head.appendChild(el);
    }));
    cache.set(id,promise);
    promise.catch(()=>cache.delete(id));
    return promise;
  }
  Object.defineProperty(root,'MetaShared',{value:Object.freeze({use,available:Object.keys(entries)}),
    writable:false,configurable:false});
})(window);

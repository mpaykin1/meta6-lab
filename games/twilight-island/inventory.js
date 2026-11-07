/* R11: hidden preservation inventory. Baseline is original observer-world-en-v7 at 237e05b39289baceee1893064c4e0f84f1a96ea4.
 * Counts describe registered content and source declarations, not an owner verdict or proof of gameplay.
 */
(function(){
 'use strict';
 const BASE={"weapons":["fists","stick","dagger","sword","katana","axe","hammer","spear","scythe","flamesword","flail","sling","bow","xbow","pistol","shotgun","smg","saw","bomb","tesla","laser"],"weaponDefinitions":["fists","stick","dagger","sword","katana","axe","hammer","spear","scythe","flamesword","flail","sling","bow","xbow","pistol","shotgun","smg","saw","bomb","tesla","laser"],"buildings":["well","settlement","council","market","guild","tax","school","scholarAction","printing","castle","court","decree","monastery","relief","doctrine","guard","patrol","militia","prison","inquiry","pardon","granary","ration","caravan","healer","quarantine","hospital","fire","brigade","watch","plague","cordon","burial","observer","contact","extraction"],"npcRoles":["observer","companion","warrior","captain","farmer","artisan","merchant","monk","healer","scholar","prisoner","sick","undertaker","rebel","resident","redObserver"],"musicThemes":["dawn","frontier","knowledge","night","monster","victory","town","chapel","mystery","plague","battle","aftermath"],"soundEvents":["well","settlement","council","market","guild","tax","school","scholarAction","printing","castle","court","decree","monastery","relief","doctrine","guard","patrol","militia","prison","inquiry","pardon","granary","ration","caravan","healer","quarantine","hospital","fire","brigade","watch","plague","cordon","burial","observer","contact","extraction","hut","scholar","glyph","select","swing","hit","wounded","killed","death","heal","clash"],"storyEvents":["well","settlement","council","market","guild","tax","school","scholarAction","printing","castle","court","decree","monastery","relief","doctrine","guard","patrol","militia","prison","inquiry","pardon","granary","ration","caravan","healer","quarantine","hospital","fire","brigade","watch","plague","cordon","burial","observer","contact","extraction","new","imp","shade","warden"],"storySpecial":["newCompanion","reborn","betrayal","assault","killed","wounded","guardAlert","playerAttacked","playerDeath"],"constructionActions":["well","settlement","council","market","guild","tax","school","scholarAction","printing","castle","court","decree","monastery","relief","doctrine","guard","patrol","militia","prison","inquiry","pardon","granary","ration","caravan","healer","quarantine","hospital","fire","brigade","watch","plague","cordon","burial","observer","contact","extraction","imp","shade","warden","new"],"namedSourceFunctions":["mulberry32#1","hash3#1","makeNoise#1","generateWorld#1","buildTerrainGeometry#1","makeHeightTexture#1","loadTexture#1","fogShader#1","makeInstGeo#1","ripple#1","setHeroFrame#1","resize#1","mixInto#1","applyPalette#1","blockAt#1","boxSolid#1","groundBelow#1","terrainTop#1","rayFree#1","toast#1","updateHearts#1","setCoinsHud#1","drawMinimapBase#1","drawMinimap#1","setAttack#1","releaseAll#1","onJumpPress#1","onJumpRelease#1","orbitBy#1","mouseButtons#1","cursorAim#1","endPointer#1","pollPad#1","tryStep#1","physicsStep#1","surfaceUnder#1","footstep#1","onLand#1","drown#1","respawnAtSafe#1","updatePlayer#1","updateHeroMesh#1","hurt#1","buildPickups#1","syncPickups#1","updatePickups#1","collectCoin#1","collectHeart#1","nearestGoal#1","updateWisp#1","updateBeacon#1","updateCamera#1","updatePost#1","updateEnvironment#1","updateLeaves#1","placeFlies#1","readBest#1","buildWorld#1","resetRun#1","startGame#1","stopBeam#1","setPaused#1","win#1","die#1","showEnd#1","restart#1","updateFlow#1","updateHUD#1","updateMuteBtn#1","toggleMute#1","toggleFullscreen#1","updateAim#1","resetCombat#1","equip#1","cycleWeapon#1","startReload#1","engaged#1","updateCombat#1","poseOf#1","startMelee#1","advanceMelee#1","meleeSweep#1","parryOrbs#1","slamImpact#1","tryChop#1","updateDash#1","updateFlail#1","rangedInput#1","fireRanged#1","spawnShot#1","flashLight#1","muzzleFlash#1","ejectCasing#1","updateProjectiles#1","projMove#1","projWall#1","ricochetFx#1","impact#1","breakOrb#1","projHit#1","explode#1","orbBurst#1","projTrail#1","marchVoxel#1","teslaChain#1","updateBeam#1","beamDamage#1","spawnFoe#1","seaSpot#1","spawnFromSea#1","spawnWarden#1","wanted#1","damageFoe#1","killFoe#1","dropSoul#1","updateSouls#1","renderSouls#1","updateFoes#1","bossThink#1","bossImpact#1","spawnOrb#1","wardenFire#1","renderFoes#1","buildChunks#1","rebuildChunk#1","markDirty#1","rebuildDirty#1","fellTree#1","blastLeaves#1","buildLoot#1","updateLoot#1","takeLoot#1","handWorld#1","spritePoint#1","muzzleWorld#1","renderHeld#1","trailSample#1","trailPoint#1","renderTrail#1","ring3#1","jagged#1","renderFx#1","updateFx#1","renderProjectiles#1","renderLoot#1","showNew#1","iconStyle#1","hudWeapon#1","updateWeaponMeter#1","dmgNumber#1","project#1","updateCombatHud#1","renderArsenal#1","perfMonitor#1","frame#1","start#1"]};
 const history=[];
 function names(text){const count={};return [...text.matchAll(/\bfunction\s+([\w$]+)\s*\(/g)].map(m=>m[1]+'#'+(count[m[1]]=(count[m[1]]||0)+1));}
 function collect(){
  const game=window.__isle;
  return {
   weapons:game?.ARSENAL_ORDER||[],weaponDefinitions:Object.keys(game?.WEAPONS||{}),
   buildings:window.ObserverBuildingAssets?.kinds||[],npcRoles:Object.keys(window.ObserverNpcCatalog?.ROLES||{}),
   musicThemes:Object.keys(window.ObserverKriegerAudio?.THEMES||{}),soundEvents:Object.keys(window.ObserverKriegerAudio?.SOUND_GROUPS||{}),
   storyEvents:Object.keys(window.ObserverStorySystem?.TEXT||{}),storySpecial:Object.keys(window.ObserverStorySystem?.SPECIAL||{}),
   constructionActions:window.__OBSERVER_WORLD_V7__?.actionKinds||[],
   namedSourceFunctions:names(Array.from(document.querySelectorAll('script[type="module"]')).map(s=>s.textContent).join('\n'))
  };
 }
 function inspect(){
  const current=collect(),sections={},lost=[];
  for(const [section,base] of Object.entries(BASE)){
   const now=current[section],missing=base.filter(id=>!now.includes(id));
   sections[section]=Object.freeze({was:base.length,now:now.length,lost:Object.freeze(missing)});
   lost.push(...missing.map(id=>section+':'+id));
  }
  const result=Object.freeze({version:'twilight-island-0.2.0',time:Date.now(),
   source:'observer-world-en-v7@237e05b39289baceee1893064c4e0f84f1a96ea4',
   sections:Object.freeze(sections),lost:Object.freeze(lost),
   extra:Object.freeze({retention:'R1-R10 require full browser checks; inventory does not certify them',
    gameplay:'Only a completed META BOT run can certify traversal; owner acceptance is separate'})});
  history.push(result);if(history.length>10)history.shift();return result;
 }
 Object.defineProperty(window,'__INV',{value:inspect,writable:false,configurable:false});
 Object.defineProperty(window,'INV',{value:Object.freeze({get hist(){return Object.freeze(history.slice())}}),writable:false,configurable:false});
})();

// One deterministic placement definition for renderer, collision-aware runtime and Node checks.
export const OCEAN_CHUNK=24;
export const LANDMARKS=[
 ['cathedral_bell',75,34,1.7],['cathedral_tower',77,38,3.1],
 ['treasure_chest',81,34,1],['treasure_chest',89,27,1],['treasure_chest',96,42,1],
 ['street_lamp',80,37,1.5],['street_lamp',87,37,1.5],['street_lamp',94,37,1.5],
 ['coral_branch_violet',80,42,1.5],['coral_branch_orange',93,46,1.5],
 ['submarine_wreck',101,31,2],['arch',73,43,2.6],['angler',78,44,1.2],
 // Stage 7b: original owner's GLB pack; see reference/sunken-city/index.html (wreck/trench layout).
 ['galleon',93,49,9.0],['whale_skeleton',106,39,5.0],
 ['anchor',88,47,1.6],['cannon',98,51,2.1],['ship_wheel',92,54,1.6],
 ['barrel',89,54,1.25],['crate',99,55,1.4],
 ['kraken_tentacle',109,57,4.8],['kraken_tentacle',117,62,5.2],['kraken_tentacle',124,68,4.4],
 ['viaduct',112,51,5.1],['gargoyle',115,48,1.8],
 ['hot_vent',107,56,2],['anemone',91,61,1.6],['sea_fan',103,63,2.1],
 ['coral_brain',101,62,1.6],['column_broken',113,46,2.4],['bridge_broken',116,43,3.1]
];
export function oceanHash(x,z,s){let n=Math.imul(x|0,374761393)^Math.imul(z|0,668265263)^Math.imul(s|0,362437);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;}
export function oceanPlacements(cx,cz,seed,floor,isWater,SEA=3.8){
 const out=[];
 for(let i=0;i<7;i++){
  const x=cx*OCEAN_CHUNK+2+Math.floor(oceanHash(cx*97+i,cz*43+i,seed)*19);
  const z=cz*OCEAN_CHUNK+2+Math.floor(oceanHash(cx*41+i,cz*79-i,seed)*19);
  if(!isWater(x,z))continue;
  const y=floor(x,z);if(y>=SEA-.4)continue;
  const choices=y<-4?['kelp_tall','coral_branch_violet','arch','cathedral_tower','submarine_wreck','hot_vent','sea_fan','tube_sponge','anemone','moss_clump_azure','gargoyle','column_broken']:['seagrass','kelp_tall','coral_branch_orange','street_lamp','arch','angel_statue','coral_branch_pink','coral_brain','kelp_mid','kelp_short','sea_fan','starfish','pearl_clam','moss_clump_teal'];
  const name=choices[Math.floor(oceanHash(x,z,seed+5)*choices.length)];
  out.push({type:'structure',name,x:x+.5,z:z+.5,y,scale:name==='cathedral_tower'?2.8:name==='arch'?1.8:1.1,heading:oceanHash(z,x,seed)*6.28});
 }
 for(let i=0;i<7;i++){
  const x=cx*OCEAN_CHUNK+3+oceanHash(cx*13+i,cz*17-i,seed)*18;
  const z=cz*OCEAN_CHUNK+3+oceanHash(cx*29-i,cz*31+i,seed)*18;
  if(!isWater(x,z))continue;
  const fy=floor(x,z);if(fy>=SEA-1.7)continue;
  const name=['glow_fish_teal','glow_fish_violet','manta','seahorse','angler','jellyfish_teal','jellyfish_violet','eel','lantern_fish','nautilus','siphonophore','glow_fish_amber','glow_fish_emerald'][Math.floor(oceanHash(x,z,seed+11)*13)];
  out.push({type:'fish',name,x,z,y:Math.min(SEA-1,fy+2),scale:name==='angler'?1:.65,phase:oceanHash(z,x,seed)*6.28,i});
 }
 return out;
}
export function plannedOceanPopulation(player,seed,floor,isWater,radius=40){
 const cx=Math.floor(player.x/OCEAN_CHUNK),cz=Math.floor(player.z/OCEAN_CHUNK),near=(x,z)=>Math.hypot(x-player.x,z-player.z)<=radius;
 const found=[];
 for(const [name,x,z] of LANDMARKS)if(near(x,z))found.push(name);
 for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){
  for(const p of oceanPlacements(cx+dx,cz+dz,seed,floor,isWater))if(near(p.x,p.z))found.push(p.name);
 }
 return {ruins:found.filter(n=>/cathedral|arch|angel/.test(n)).length,
  wrecks:found.filter(n=>/wreck|ship|galleon/.test(n)).length,
  fish:found.filter(n=>/fish|manta|seahorse|angler|jellyfish|eel|nautilus|siphonophore/.test(n)).length,
  plants:found.filter(n=>/coral|kelp|seagrass|anemone|sea_fan|sponge|moss/.test(n)).length,
  named:[...new Set(found)].sort()};
}

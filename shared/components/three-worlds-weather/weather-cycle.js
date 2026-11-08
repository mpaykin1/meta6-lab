// Owner §21.23: deterministic Island/Ash rain event, never submerged.
// The rain is a native preset of the accepted original Island weather catalog.
export function worldWeatherAt(world,submerged,time){
 if(submerged||world==='water')return 'sea_mist';
 const cycle=((time%72)+72)%72;
 if(cycle>=19&&cycle<44)return 'rain';
 return world==='ash'?'ash':'sea_mist';
}
export function rainEventAt(world,submerged,time){
 return worldWeatherAt(world,submerged,time)==='rain';
}

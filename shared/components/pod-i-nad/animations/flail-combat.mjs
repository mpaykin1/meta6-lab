// Plug-and-play flail combat adapter: movement, collisions, damage, impulse and optional FX hooks.
// Designed for plain objects; no global game state or rendering engine dependency.
import {createFlailPhysics} from './flail-physics.mjs';
import {createFlailHitDetector} from './flail-hit-detection.mjs';
export function createFlailCombat({reach=2.5,damage=10,knockback=1,tick=.35,ballRadius=.45,onImpact=()=>{},onWhoosh=()=>{},onDefeat=()=>{}}={}){
 const physics=createFlailPhysics({reach}),collisions=createFlailHitDetector({damage,knockback,tick,ballRadius});
 let elapsed=0;
 function update(dt,{attack=false,player={x:0,y:0,z:0},aim={x:1,z:0},foes=[]}={}){
  if(!Number.isFinite(dt)||dt<0)throw new Error('Invalid delta time');
  elapsed+=Math.min(dt,.05);
  const state=physics.update(dt,{attack,player,aim});
  if(state.whooshEvent&&state.on)onWhoosh({spin:state.spin,ball:{...state.ball}});
  const hits=state.on?collisions.detect({ball:state.ball,spin:state.spin,player,foes,time:elapsed,onHit(hit){
   const foe=hit.foe;
   // Explicit opt-in damage: only mutate foes with numeric hp.
   if(typeof foe.hp==='number'&&Number.isFinite(foe.hp)){
    foe.hp=Math.max(0,foe.hp-hit.damage);
    if(foe.hp===0){foe.dead=true;foe.alive=false;onDefeat({foe,hit})}
   }
   if(foe.velocity&&typeof foe.velocity==='object'){
    foe.velocity.x=(foe.velocity.x||0)+hit.direction.x*hit.knockback;
    foe.velocity.z=(foe.velocity.z||0)+hit.direction.z*hit.knockback;
   }
   onImpact(hit);
  }}):[];
  return {state,hits,chain:physics.chainPoints({x:player.x,y:player.y+.8,z:player.z})};
 }
 function reset(){physics.reset();elapsed=0}
 return {update,reset,physics,collisions};
}

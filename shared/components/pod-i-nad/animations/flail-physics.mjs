// Standalone spring-damped flail motion ported from original Pod i Nad.
// Physics only: collision/damage/SFX/weapon rendering remain host responsibilities.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function createFlailPhysics({reach=2.5,spinUp=2.6,spinDown=2.2,stiffness=140,damping=10}={}) {
 const state={spin:0,on:false,angle:0,ball:{x:0,y:0,z:0},velocity:{x:0,y:0,z:0},whoosh:0};
 function update(dt,{attack=false,player={x:0,y:0,z:0},aim={x:1,z:0}}={}){
  if(!Number.isFinite(dt)||dt<0)throw new Error('Invalid delta time');
  dt=Math.min(dt,1/20);
  const spin=state.spin=clamp(state.spin+(attack?dt*spinUp:-dt*spinDown),0,1);
  if(spin>0&&!state.on){state.on=true;state.angle=Math.atan2(aim.z,aim.x);state.ball={x:player.x+aim.x*.8,y:player.y+.8,z:player.z+aim.z*.8};state.velocity={x:0,y:0,z:0}}
  if(spin<=0){state.on=false;return state}
  const speed=5+7*spin;state.angle+=dt*speed;
  const R=reach*(.45+.55*spin);
  const target={x:player.x+Math.cos(state.angle)*R,y:player.y+.75+Math.sin(state.angle*2)*.15,z:player.z+Math.sin(state.angle)*R};
  const decay=Math.exp(-damping*dt);
  for(const axis of ['x','y','z']){state.velocity[axis]=(state.velocity[axis]+(target[axis]-state.ball[axis])*stiffness*dt)*decay;state.ball[axis]+=state.velocity[axis]*dt}
  state.whoosh-=dt;if(state.whoosh<=0){state.whoosh=2*Math.PI/speed;state.whooshEvent=true}else state.whooshEvent=false;
  return state;
 }
 function chainPoints(hand={x:0,y:0,z:0},count=7,sag=.12){const result=[];for(let k=1;k<=count;k++){const t=k/(count+1);result.push({x:hand.x+(state.ball.x-hand.x)*t,y:hand.y+(state.ball.y-hand.y)*t-Math.sin(t*Math.PI)*sag,z:hand.z+(state.ball.z-hand.z)*t})}return result}
 function reset(){state.spin=0;state.on=false;state.angle=0;state.whoosh=0;state.whooshEvent=false;state.velocity={x:0,y:0,z:0}}
 return {state,update,chainPoints,reset};
}

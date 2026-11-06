/* Touch-only controls for Observer World V7. Original Three.js controls on desktop untouched. */
(function(root){"use strict";
const MOBILE="(pointer: coarse) and (max-width: 900px)";
const forced=()=>new URLSearchParams(location.search).get("v7test")==="1";
const enabled=()=>root.matchMedia(MOBILE).matches||forced();
const glyph=(s)=>'<svg viewBox="0 0 32 32" shape-rendering="crispEdges" aria-hidden="true" focusable="false">'+s+'</svg>';
const icons={
 sword:glyph('<path fill="#f9f1da" d="M23 3h6v6h-3v3h-3v3h-3v3h-3v3h-3v3h-4v-4h3v-3h3v-3h3v-3h3V8h3z"/><path fill="#e1b758" d="M4 22h6v3h3v3h-4v3H6v-3H3v-3h3z"/>'),
 jump:glyph('<path fill="#fffde7" d="M16 2L4 18h8v11h8V18h8z"/><path fill="#accae6" d="M16 7l-6 8h5v10h2V15h5z"/>'),
 hammer:glyph('<path fill="#a87842" d="M17 11h5v18h-5z"/><path fill="#f4ddae" d="M4 6h7V3h14v5h3v7h-6v-4H11v4H4z"/><path fill="#a8d0e1" d="M7 7h7V5h9v4h3v3h-5V9H7z"/>'),
 swap:glyph('<path fill="#fff2d8" d="M23 3l7 7-7 7v-5H11a8 8 0 0 0-7 6H1C2 11 6 8 12 8h11z"/><path fill="#fff2d8" d="M9 29l-7-7 7-7v5h12a8 8 0 0 0 7-6h3c-1 7-5 10-11 10H9z"/>')
};
function create({native,onBuild,onSwap}){
 if(!enabled())return Object.freeze({enabled:false,dispose(){},isMobile:enabled});
 const hud=document.createElement("section");
 hud.id="v7MobileHud";hud.setAttribute("aria-label","Touch controls");
 hud.innerHTML='<div id="v7Stick" role="group" aria-label="Move using joystick">'+
  '<span class="v7-arrow v7-up">▲</span><span class="v7-arrow v7-down">▼</span>'+
  '<span class="v7-arrow v7-left">◀</span><span class="v7-arrow v7-right">▶</span><div id="v7Knob"></div></div>'+
  '<button id="v7Swap" type="button" class="v7-action" aria-label="Switch weapon">'+icons.swap+'</button>'+
  '<button id="v7Build" type="button" class="v7-action" aria-label="Build selected glyph">'+icons.hammer+'</button>'+
  '<button id="v7Action" type="button" class="v7-action" aria-label="Jump and attack or fire"><span>'+icons.sword+icons.jump+'</span></button>';
 document.body.appendChild(hud);
 document.body.classList.add("v7-touch");
 if(forced())document.documentElement.classList.add("v7-test-mobile");
 const stick=hud.querySelector("#v7Stick"),knob=hud.querySelector("#v7Knob"),
  action=hud.querySelector("#v7Action"),build=hud.querySelector("#v7Build"),swap=hud.querySelector("#v7Swap");
 let moveId=null,attackId=null,pressCount=0,buildCount=0,moveCount=0;
 const eat=e=>{e.preventDefault();e.stopPropagation()};
 const zero=()=>{native.mobileMove(0,0);knob.style.transform="translate(-50%,-50%)"};
 function move(e){
  const rect=stick.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
  let dx=(e.clientX-cx)/(rect.width*.34),dy=(e.clientY-cy)/(rect.height*.34),d=Math.hypot(dx,dy);
  if(d>1){dx/=d;dy/=d}
  native.mobileMove(dx,dy);moveCount++;
  knob.style.transform="translate(calc(-50% + "+(dx*rect.width*.29)+"px),calc(-50% + "+(dy*rect.height*.29)+"px))";
 }
 const stopStick=e=>{
  if(e.pointerId!==moveId||moveId===null)return;eat(e);moveId=null;zero();
 };
 stick.addEventListener("pointerdown",e=>{
  eat(e);if(moveId!==null)return;moveId=e.pointerId;
  try{stick.setPointerCapture(e.pointerId)}catch{}move(e)
 });
 stick.addEventListener("pointermove",e=>{if(e.pointerId===moveId){eat(e);move(e)}});
 for(const t of ["pointerup","pointercancel","lostpointercapture"])stick.addEventListener(t,stopStick);
 const stopAction=e=>{
  if(e.pointerId!==attackId||attackId===null)return;eat(e);attackId=null;
  native.mobileCombo(false);action.classList.remove("is-pressed");
 };
 action.addEventListener("pointerdown",e=>{
  eat(e);if(attackId!==null)return;attackId=e.pointerId;
  try{action.setPointerCapture(e.pointerId)}catch{}
  native.mobileCombo(true);action.classList.add("is-pressed");pressCount++;
 });
 for(const t of ["pointerup","pointercancel","lostpointercapture"])action.addEventListener(t,stopAction);
 let shootId=null;
 build.addEventListener("pointerdown",e=>{
  eat(e);
  if(forced())root.__uwButtonTrace={id:e.pointerId,previousId:shootId,state:native.G.state,wet:native.underwater?.isSubmerged(),bathy:native.underwater?.inBathyscaphe};
  if(shootId!==null){native.mobileShootRelease?.();shootId=null;if(forced())root.__uwButtonTrace.recoveredStalePointer=true;}
  shootId=e.pointerId;try{build.setPointerCapture(e.pointerId)}catch{}
  buildCount++;
  // Fire through the actual V7 input interface, not the optional building-editor callback.
  if(native.underwater?.isSubmerged()&&native.underwater.inBathyscaphe){
    const fired=native.mobileShoot();
    if(forced())Object.assign(root.__uwButtonTrace,{fired,attackImmediately:native.input.atk});
  }else {onBuild();if(forced())root.__uwButtonTrace.usedEditor=true;}
 });
 for(const evt of ["pointerup","pointercancel","lostpointercapture"])build.addEventListener(evt,e=>{if(shootId!==e.pointerId)return;eat(e);shootId=null;native.mobileShootRelease?.()});
 swap.addEventListener("pointerdown",e=>{eat(e);native.mobileSwap();onSwap?.()});
 function release(){moveId=null;attackId=null;shootId=null;native.mobileShootRelease?.();native.mobileRelease();zero();action.classList.remove("is-pressed")}
 const hide=()=>{if(document.hidden)release()};
 document.addEventListener("visibilitychange",hide);
 root.addEventListener("blur",release);
 return Object.freeze({enabled:true,isMobile:enabled,ui:hud,release,
  get counters(){return{pressCount,buildCount,moveCount}},
  dispose(){release();document.removeEventListener("visibilitychange",hide);root.removeEventListener("blur",release);
    hud.remove();document.body.classList.remove("v7-touch")}})
}
root.ObserverMobileControls=Object.freeze({create,isMobile:enabled});
})(window);

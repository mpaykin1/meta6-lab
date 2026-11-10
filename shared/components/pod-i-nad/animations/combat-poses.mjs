// Standalone pose-curve port of nine original Pod i Nad melee animations.
// No original combat runtime, global registry, eval, or Three.js required.
// Slam impact and flail physics/rendering are deliberately NOT included.
const span=(t,a,b)=>Math.max(0,Math.min(1,(t-a)/(b-a)));
const lerp=(a,b,t)=>a+(b-a)*t;
const easeOut=t=>1-(1-t)*(1-t);
const easeIn=t=>t*t;
const easeInOut=t=>t*t*(3-2*t);
const sin=Math.sin,PI=Math.PI;
const curves={
 punch:(w,t,step,fin)=>{if(fin){const k=easeOut(span(t,.12,.55));return {ang:lerp(-65,70,k),push:.3+.3*sin(k*PI),active:t>.18&&t<.58}}const k=t<.2?-.15*span(t,0,.2):t<.45?lerp(-.15,.6,easeOut(span(t,.2,.45))):lerp(.6,0,easeInOut(span(t,.45,1)));return {ang:step%2?8:-8,push:k,active:t>.24&&t<.56}},
 jab:(w,t)=>{const k=t<.2?-.2*span(t,0,.2):t<.42?lerp(-.2,.75,easeOut(span(t,.2,.42))):lerp(.75,0,easeInOut(span(t,.42,1)));return {ang:0,push:k,active:t>.24&&t<.55}},
 stab:(w,t,step)=>{const k=t<.3?lerp(0,.55,easeOut(span(t,0,.3))):lerp(.55,0,easeInOut(span(t,.3,1)));return {ang:[-14,10,0][((step%3)+3)%3],push:k,active:t>.12&&t<.5}},
 slash:(w,t,step,fin)=>{let a0=115,a1=-75;if(fin&&w.fin?.over){a0=165;a1=-55}else if(step%2){a0=-75;a1=115}const sg=Math.sign(a1-a0);let ang;if(t<.18)ang=a0-sg*14*easeOut(span(t,0,.18));else if(t<.5)ang=lerp(a0-sg*14,a1,easeOut(span(t,.18,.5)));else ang=a1+sg*6*easeInOut(span(t,.5,1));return {ang,push:.12,active:t>.2&&t<.48}},
 chop:(w,t)=>{let ang;if(t<.45)ang=lerp(70,150,easeInOut(span(t,0,.45)));else if(t<.58)ang=lerp(150,-55,easeIn(span(t,.45,.58)));else ang=-55+8*easeInOut(span(t,.58,1));return {ang,push:.1,active:t>.5&&t<.66}},
 slam:(w,t)=>{let ang;if(t<.5)ang=lerp(70,172,easeInOut(span(t,0,.5)));else if(t<.6)ang=lerp(172,-70,easeIn(span(t,.5,.6)));else ang=-70+6*sin(span(t,.6,1)*PI);return {ang,push:.15,active:false}},
 thrust:(w,t)=>{const k=t<.25?lerp(0,-.4,easeOut(span(t,0,.25))):t<.42?lerp(-.4,1.15,easeOut(span(t,.25,.42))):lerp(1.15,0,easeInOut(span(t,.42,1)));return {ang:0,push:k,active:t>.28&&t<.52}},
 spin:(w,t)=>{const k=easeInOut(span(t,.05,.9));return {ang:90-420*k,push:.15,active:t>.12&&t<.88}},
 flail:()=>({ang:60,push:0,active:false})
};
export const animationNames=Object.freeze(Object.keys(curves));
export const animationMetadata=Object.freeze({
 punch:{trail:'streak',lunge:[2.2,3.4],swing:.6},jab:{trail:'streak',lunge:[2.2,3.4],swing:1},stab:{trail:'streak',lunge:[2.2,3.4],swing:.6},slash:{trail:'arc',lunge:[2.2,3.4],swing:1},chop:{trail:'arc',lunge:[.8,.8],swing:2},slam:{trail:'arc',lunge:[.8,.8],swing:2,trailWindow:[.48,.64],impactAt:.6},thrust:{trail:'streak',lunge:[4.5,4.5],swing:1},spin:{trail:'arc',lunge:[.8,.8],swing:1.5},flail:{trail:'arc',hold:true,externalPhysicsRequired:true}
});
export function sampleCombatPose(name,t,{step=0,finisher=false,weapon={}}={}){if(!Object.hasOwn(curves,name))throw new Error('Unknown combat animation: '+name);if(!Number.isFinite(t))throw new Error('Invalid normalized time');return curves[name](weapon,Math.max(0,Math.min(1,t)),step,finisher)}

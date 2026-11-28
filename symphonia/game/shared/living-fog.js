// FastNoiseLite 1.1.1; MIT; upstream 785f37a9ad76e283586a379675085f2063ae03f7.
import FastNoiseLite from './vendor/FastNoiseLite.js';
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
export function createLivingFog(){
 const noise=new FastNoiseLite(1337);
 noise.SetNoiseType(FastNoiseLite.NoiseType.OpenSimplex2);
 noise.SetFrequency(.038);noise.SetFractalType(FastNoiseLite.FractalType.FBm);noise.SetFractalOctaves(3);
 const n=(x,y,z)=>clamp(noise.GetNoise(x,y,z),-1,1);
 let elapsed=0,clock=0,density=1,wanted=1,pressure=0,targetPressure=0;
 let layers=[],orig=[],targets=[],values=[];
 function history(h={}){targetPressure=clamp((Number(h.porazheniya)||0)*.045-(Number(h.pobedy)||0)*.012,0,.22);}
 function reset(seed,h={}){
  noise.SetSeed((seed|0)||1337);history(h);
  pressure=targetPressure;elapsed=0;clock=.1;density=wanted=1;targets.fill(1);values.fill(1);
 }
 function tick(dt,pos,depth,rage,active,scene,sheets){
  dt=clamp(dt,0,.05);elapsed+=dt;clock+=dt;
  if(layers!==sheets){layers=sheets;orig=sheets.map(s=>s.material.uniforms.uOp.value);targets=orig.map(()=>1);values=orig.map(()=>1);}
  const k=1-Math.exp(-dt*2.1);pressure+=(targetPressure-pressure)*k;
  if(clock>=.1){clock%=.1;
   const x=pos.x*.8,y=pos.y*.35,z=pos.z*.8,t=elapsed*2.4,stress=clamp(rage||0,0,1);
   wanted=active?clamp(1+n(x,y+t,z)*.16+pressure+stress*.15,.78,1.42):1;
   for(let i=0;i<sheets.length;i++)targets[i]=active?clamp(1+n(x+19*i,y+t,z-13*i)*.27+pressure+stress*.12,.65,1.48):1;
  }
  density+=(wanted-density)*k;
  if(scene.fog)scene.fog.density*=density;
  for(let i=0;i<sheets.length;i++){values[i]+=(targets[i]-values[i])*k;sheets[i].material.uniforms.uOp.value=clamp(orig[i]*values[i],0,.86);}
  return density;
 }
 return {reset,history,tick};
}
export function createMazeMist(seed,losses=0){const noise=new FastNoiseLite(seed|0);noise.SetFrequency(.045);noise.SetFractalType(FastNoiseLite.FractalType.FBm);noise.SetFractalOctaves(3);return (x,z,t,base)=>base*clamp(1+clamp(losses,0,5)*.07+noise.GetNoise(x,z,t*.8)*.18,.8,1.5);}

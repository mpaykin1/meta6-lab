// Approved Pod i Nad sky shader, geometry and uniforms, without invented palette.
import {getOriginalShaderPair} from '../original-glsl.mjs';
export const ORIGINAL_SKY=Object.freeze({
 source:'reference/sumerek-golden/pod-i-nad-68b2ecd3.html',
 geometry:{type:'SphereGeometry',radius:500,widthSegments:32,heightSegments:16},
 auroraColors:['#3dffa8','#b56bff'],
 sunDirection:[0,0.2,-1],moonDirection:[0,0.6,1],
 renderOrder:-10
});
function requiredColor(THREE,value,name){
 if(value===undefined||value===null)throw new Error(name+' must be supplied from original sky palette');
 return new THREE.Color(value);
}
export function createOriginalSkyMaterial(THREE,{
 top,horizon,bottom,sunColor,night=0,sunVisibility=1,aurora=0,time=0,
 sunDirection=ORIGINAL_SKY.sunDirection,moonDirection=ORIGINAL_SKY.moonDirection,
 auroraA=ORIGINAL_SKY.auroraColors[0],auroraB=ORIGINAL_SKY.auroraColors[1]
}={}){
 if(!THREE?.ShaderMaterial||!THREE?.Color||!THREE?.Vector3)throw new Error('Three.js required');
 const uniforms={
  uTop:{value:requiredColor(THREE,top,'top')},
  uHorizon:{value:requiredColor(THREE,horizon,'horizon')},
  uBottom:{value:requiredColor(THREE,bottom,'bottom')},
  uSunCol:{value:requiredColor(THREE,sunColor,'sunColor')},
  uSunDir:{value:new THREE.Vector3(...sunDirection)},
  uMoonDir:{value:new THREE.Vector3(...moonDirection)},
  uTime:{value:time},uNight:{value:night},uSunVis:{value:sunVisibility},
  uAurora:{value:aurora},
  uAuroraA:{value:new THREE.Color(auroraA)},
  uAuroraB:{value:new THREE.Color(auroraB)}
 };
 const material=new THREE.ShaderMaterial({
  uniforms,...getOriginalShaderPair('sky'),
  side:THREE.BackSide,depthWrite:false,depthTest:false
 });
 return {material,uniforms,update(t){uniforms.uTime.value=t},dispose(){material.dispose()}};
}
export function createOriginalSky(THREE,options={}){
 if(!THREE?.SphereGeometry||!THREE?.Mesh)throw new Error('Three.js geometry and mesh required');
 const component=createOriginalSkyMaterial(THREE,options);
 const geometry=new THREE.SphereGeometry(500,32,16);
 const mesh=new THREE.Mesh(geometry,component.material);
 mesh.renderOrder=-10;mesh.frustumCulled=false;
 return {...component,mesh,dispose(){geometry.dispose();component.dispose()}};
}

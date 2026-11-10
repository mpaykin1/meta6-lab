// Ready-to-import animated sky shader adapted from the original Pod i Nad GLSL.
import {shaders,sourceBlobSha} from '../original-shaders.mjs';
import {GLSL_HASH} from '../atmosphere/mist-material.mjs';
export const SKY_SOURCE_BLOB=sourceBlobSha;
export const SKY_VERT=shaders.SKY_VERT;
export const SKY_FRAG=shaders.SKY_FRAG.replaceAll('${GLSL_HASH}',GLSL_HASH);
export function createSkyDome(THREE,{scene,radius=78,aurora=.65,night=.85}={}){
  if(!THREE?.ShaderMaterial)throw Error('Three.js is required');
  const v3=(x,y,z)=>new THREE.Vector3(x,y,z).normalize();
  const uniforms={
    uTop:{value:new THREE.Color(0x071626)},
    uHorizon:{value:new THREE.Color(0x264e5d)},
    uBottom:{value:new THREE.Color(0x010710)},
    uSunCol:{value:new THREE.Color(0xffa15e)},
    uSunDir:{value:v3(-.8,.1,-.2)},
    uMoonDir:{value:v3(.45,.53,-.65)},
    uAuroraA:{value:new THREE.Color(0x4aebc4)},
    uAuroraB:{value:new THREE.Color(0x637fdd)},
    uTime:{value:0},uNight:{value:night},uSunVis:{value:.18},uAurora:{value:aurora}
  };
  const material=new THREE.ShaderMaterial({uniforms,vertexShader:SKY_VERT,fragmentShader:SKY_FRAG,
    side:THREE.BackSide,depthWrite:false,depthTest:false,fog:false});
  const geometry=new THREE.SphereGeometry(radius,32,16);
  const mesh=new THREE.Mesh(geometry,material);mesh.renderOrder=-100;
  if(scene)scene.add(mesh);
  return {mesh,material,uniforms,update(time,position){
    uniforms.uTime.value=time;
    if(position)mesh.position.set(position.x,position.y,position.z);
  },dispose(){if(scene)scene.remove(mesh);geometry.dispose();material.dispose()}};
}

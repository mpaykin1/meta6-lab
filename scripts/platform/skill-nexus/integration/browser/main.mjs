import * as THREE from 'three';
import {loadFusionAsset} from '../upstream/fusion/three-loader.mjs';
import {loadMascot} from '../upstream/casual/model-loader.js';
import {configureAssetLoader} from '../upstream/atmosphere/asset-loader.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
window.NEXUS_STATUS={ok:false};
try{
  const p=await fetch('../upstream/atmosphere/palette.json').then(x=>x.json());
  const scene=new THREE.Scene();
  scene.background=new THREE.Color(p.night);
  scene.fog=new THREE.FogExp2(p.night,.065);
  const camera=new THREE.PerspectiveCamera(43,innerWidth/innerHeight,.1,120);
  camera.position.set(0,2.4,9.4);camera.lookAt(0,1,0);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setSize(innerWidth,innerHeight,false);
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  document.body.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(p.ice,p.night,2.4));
  const moon=new THREE.DirectionalLight(p.cyan,2.5);moon.position.set(3,8,2);scene.add(moon);
  const fire=new THREE.PointLight(p.warm,15,10);fire.position.set(-1,2,0);scene.add(fire);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(28,28),
    new THREE.MeshStandardMaterial({color:p.moss,roughness:1}));
  ground.rotation.x=-Math.PI/2;ground.position.y=-.12;scene.add(ground);
  const urls=['casual','blender','hero','forge','voxel','atmosphere-a','atmosphere-b'];
  if(new URLSearchParams(location.search).get('fusion')==='1')urls.push('fusion');
  const roots=[];
  const casualRoots=[], atmosphericRoots=[];
  const atmosphereLoader=configureAssetLoader(new GLTFLoader());
  for(let i=0;i<urls.length;i++){
    const url='./assets/'+urls[i]+'.glb';
    const fusion=await loadFusionAsset(url,scene);
    fusion.root.position.set((i-2)*1.7,.15,-1.4);
    roots.push(fusion.root);
    if(urls[i]!=='casual'){
      const model=await loadMascot(scene,url);
      model.position.set((i-2)*1.7,.15,.15);
      scene.add(model);
      casualRoots.push(model);
    }
    const atmos=await new Promise((resolve,reject)=>atmosphereLoader.load(url,resolve,undefined,reject));
    atmos.scene.position.set((i-2)*1.7,.15,1.7);
    scene.add(atmos.scene);
    atmosphericRoots.push(atmos.scene);
  }
  let meshCount=0;for(let r of [...roots,...casualRoots,...atmosphericRoots])r.traverse(o=>{if(o.isMesh)meshCount++});
  function resize(){
    camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight,false);
  }
  addEventListener('resize',resize);
  const start=performance.now();
  renderer.setAnimationLoop((t)=>{
    const dt=(t-start)*.001;
    [...roots,...casualRoots,...atmosphericRoots].forEach((r,i)=>{r.rotation.y=Math.sin(dt*.35+i*.7)*.12;
      r.position.y=.15+Math.sin(dt*1.6+i*.5)*.04;});
    fire.intensity=14+Math.sin(dt*2.8)*1.5;
    renderer.render(scene,camera);
  });
  renderer.render(scene,camera);
  window.NEXUS_EXPORT_GLTF=async () => {
    const binary=await new GLTFExporter().parseAsync(roots[0],{binary:true,onlyVisible:true});
    const data=new Uint8Array(binary);
    let text='';
    for(let i=0;i<data.length;i+=16384)text+=String.fromCharCode(...data.subarray(i,i+16384));
    return btoa(text);
  };
  window.NEXUS_STATUS={ok:true,modelCount:roots.length,casualLoaded:casualRoots.length,atmosphereLoaded:atmosphericRoots.length,meshCount,webgl2:renderer.getContext() instanceof WebGL2RenderingContext,
    canvasWidth:renderer.domElement.getBoundingClientRect().width,
    canvasHeight:renderer.domElement.getBoundingClientRect().height,
    paletteMatches:scene.background.getHexString()===p.night.slice(1).toLowerCase()};
}catch(e){window.NEXUS_STATUS={ok:false,error:String(e),stack:e.stack};console.error(e)}

import * as THREE from 'three';
import {loadFusionAsset} from '../upstream/fusion/three-loader.mjs';
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
  const urls=['casual','blender','hero','forge'];
  const roots=[];
  for(let i=0;i<urls.length;i++){
    const a=await loadFusionAsset('./assets/'+urls[i]+'.glb',scene);
    a.root.position.set((i-1.5)*2.2,.2,0);
    roots.push(a.root);
  }
  let meshCount=0;for(let r of roots)r.traverse(o=>{if(o.isMesh)meshCount++});
  function resize(){
    camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight,false);
  }
  addEventListener('resize',resize);
  const start=performance.now();
  renderer.setAnimationLoop((t)=>{
    const dt=(t-start)*.001;
    roots.forEach((r,i)=>{r.rotation.y=Math.sin(dt*.35+i*.7)*.12;
      r.position.y=.15+Math.sin(dt*1.6+i*.5)*.04;});
    fire.intensity=14+Math.sin(dt*2.8)*1.5;
    renderer.render(scene,camera);
  });
  renderer.render(scene,camera);
  window.NEXUS_STATUS={ok:true,modelCount:roots.length,meshCount,webgl2:renderer.capabilities.isWebGL2,
    canvasWidth:renderer.domElement.getBoundingClientRect().width,
    canvasHeight:renderer.domElement.getBoundingClientRect().height,
    paletteMatches:scene.background.getHexString()===p.night.slice(1).toLowerCase()};
}catch(e){window.NEXUS_STATUS={ok:false,error:String(e),stack:e.stack};console.error(e)}

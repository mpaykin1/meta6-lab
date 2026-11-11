#!/usr/bin/env node
// Structural regression: all visible Rusty Robot body pieces must be 3D and connected.
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,args:[
 '--no-sandbox','--disable-dev-shm-usage','--enable-webgl',
 '--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'
]});
try {
 const page=await browser.newPage({viewport:{width:500,height:600}});
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765/games/skin-trainer/?skin=../../skins/packs/rusty-robot/',
   {waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>!!(window.__SKIN||window.__SKIN_ERROR),undefined,{timeout:60000});
 const result=await page.evaluate(()=>{
   if(window.__SKIN_ERROR)throw Error(window.__SKIN_ERROR);
   const THREE=window.THREE, root=window.__RUSTY_ROBOT, check=window.RustyRobot3D?.validate;
   if(!root||!check)throw Error('Missing volumetric model');
   const baseline=check(THREE,root);
   if(baseline.planes!==0||baseline.sprites!==0||baseline.contacts<12)
     throw Error('Insufficient structural coverage');
   // Deliberately insert a flat body part: the guard must reject it.
   const counterfeit=new THREE.Mesh(new THREE.PlaneGeometry(.2,.4),
     new THREE.MeshBasicMaterial());counterfeit.name='flat-counterfeit';
   root.add(counterfeit);
   let blockedFlat=false;
   try{check(THREE,root);}catch(e){blockedFlat=String(e).includes('flat-counterfeit');}
   root.remove(counterfeit);
   counterfeit.geometry.dispose();counterfeit.material.dispose();
   if(!blockedFlat)throw Error('PlaneGeometry mutation survived');
   // Deliberately sever an arm: the contact guard must reject it.
   const arm=root.getObjectByName('hanging-arm-block');
   if(!arm)throw Error('Arm missing');
   const old=arm.position.clone();
   arm.position.x-=4;
   let blockedDetached=false;
   try{check(THREE,root);}catch(e){blockedDetached=String(e).includes('disconnected');}
   arm.position.copy(old);
   if(!blockedDetached)throw Error('Disconnected arm mutation survived');
   check(THREE,root);
   return {meshes:baseline.meshes,contacts:baseline.contacts,
     flatMutationRejected:blockedFlat,detachmentRejected:blockedDetached};
 });
 if(errors.length)throw Error('Page errors: '+errors.join(' | '));
 console.log('RUSTY_ROBOT_SOLID_3D PASS '+JSON.stringify(result));
}finally{await browser.close();}

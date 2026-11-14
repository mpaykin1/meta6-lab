import {chromium} from 'playwright';
import assert from 'node:assert/strict';

const browser=await chromium.launch({headless:true,
  args:['--enable-webgl','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
const base='http://127.0.0.1:8774/preview/ink-watercolor-raven/';
try{
  for(const d of [{name:'desktop',width:1280,height:800,mobile:false},
    {name:'phone-sized',width:390,height:844,mobile:true}]){
    const ctx=await browser.newContext({viewport:{width:d.width,height:d.height},
      isMobile:d.mobile,hasTouch:d.mobile,deviceScaleFactor:1});
    const page=await ctx.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    const response=await page.goto(base+'?ink=raven&palette=color',{waitUntil:'domcontentloaded',timeout:60000});
    assert.equal(response.status(),200);
    await page.waitForFunction(()=>window.__INK_RAVEN__?.display?.userData?.isFlyingRaven===true,
      null,{timeout:30000});
    await page.waitForTimeout(500);
    const before=await page.evaluate(()=>{
      const r=window.__INK_RAVEN__,m=r.display;
      let meshes=0,instanced=0,feathers=0;
      m.traverse(o=>{if(o.isMesh){meshes++;if(o.isInstancedMesh)instanced++;
        if(o.geometry?.attributes?.position?.count===54)feathers++;}});
      const canvas=document.querySelector('canvas');
      return {wing:r.display.userData.ravenRig.wings[1].shoulder.rotation.z,
        wingSegments:r.display.userData.ravenRig.wings.length,meshes,instanced,feathers,
        triangles:r.triangleCount,canvasWidth:canvas.width,canvasHeight:canvas.height,
        view:window.__INK_FOREST__.active,fps:r.fpsEstimate};
    });
    assert.equal(before.view,'raven');
    assert.equal(before.wingSegments,2);
    assert.ok(before.instanced>=3,'Only real 3D feather coats are allowed');
    assert.ok(before.feathers>=24,'Three-dimensional modeled feathers missing');
    assert.ok(before.meshes>40,'Raven is not a volumetric multi-part object');
    assert.ok(before.triangles>1000,'Raven lacks three-dimensional topology');
    await page.waitForTimeout(330);
    const after=await page.evaluate(()=>window.__INK_RAVEN__.display.userData.ravenRig.wings[1].shoulder.rotation.z);
    assert.ok(Math.abs(after-before.wing)>.04,'Flapping animation did not advance');
    await page.evaluate(()=>window.__INK_FOREST__.show('forest'));
    await page.waitForTimeout(250);
    assert.equal(await page.evaluate(()=>window.__INK_FOREST__.active),'forest');
    const flight=await page.evaluate(()=>{
      const p=window.__INK_RAVEN__.model.position;
      return {x:p.x,y:p.y,z:p.z,visible:window.__INK_RAVEN__.model.visible};
    });
    assert.ok(flight.y>2.5,'Raven should fly above the robot and trees');
    assert.equal(flight.visible,true);
    await page.screenshot({path:'/tmp/ink-raven-'+d.name+'.png'});
    assert.deepEqual(errors,[],'WebGL console/page errors');
    console.log('INK_RAVEN_PASS '+d.name+' meshes='+before.meshes+
      ' instanced='+before.instanced+' featherMeshes='+before.feathers+
      ' triangles='+before.triangles+' wingDelta='+Math.abs(after-before.wing).toFixed(3)+
      ' viewport='+d.width+'x'+d.height+' fpsEstimate='+before.fps.toFixed(1)+
      ' errors=0');
    await page.close();await ctx.close();
  }
}finally{await browser.close();}

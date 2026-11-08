// Pooled 3D sparks, ground shockwaves and hit flashes for flail impacts.
export function createCombatEffects(THREE,scene,{maxSparks=160}={}){
  if(!THREE?.InstancedMesh||!scene)throw Error('Three.js scene required');
  const geometry=new THREE.TetrahedronGeometry(.06,0);
  const material=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
  const sparks=new THREE.InstancedMesh(geometry,material,maxSparks);
  sparks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);sparks.frustumCulled=false;
  scene.add(sparks);
  const dummy=new THREE.Object3D(),v=new THREE.Vector3(),col=new THREE.Color();
  const particles=Array.from({length:maxSparks},()=>({x:0,y:-100,z:0,vx:0,vy:0,vz:0,age:5,life:1}));
  const ringGeometry=new THREE.RingGeometry(.87,1.01,48);
  const rings=Array.from({length:10},()=>{
    const mat=new THREE.MeshBasicMaterial({color:0x9bfff0,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending});
    const m=new THREE.Mesh(ringGeometry,mat);m.rotation.x=-Math.PI/2;m.visible=false;scene.add(m);
    return {mesh:m,age:5,life:1};
  });
  const flashes=Array.from({length:3},()=>{
    const light=new THREE.PointLight(0xa8fff6,0,2.6,2);scene.add(light);
    return {light,age:5,life:1};
  });
  let next=0,ringIndex=0,lightIndex=0;
  function spawn(position,{fatal=false,damage=0}={}){
    if(!position)return;
    const count=fatal?42:22;
    for(let i=0;i<count;i++){
      const p=particles[next++%particles.length],a=Math.random()*Math.PI*2,power=.9+Math.random()*2.8;
      p.x=position.x;p.y=Math.max(.3,position.y||.85);p.z=position.z;
      p.vx=Math.cos(a)*power;p.vz=Math.sin(a)*power;p.vy=.35+Math.random()*2.3;
      p.age=0;p.life=(fatal?.85:.45)+Math.random()*.28;
    }
    const r=rings[ringIndex++%rings.length];r.age=0;r.life=fatal?.7:.43;
    r.mesh.position.set(position.x,.045,position.z);r.mesh.visible=true;r.mesh.material.color.set(fatal?0xffae69:0x9bfff0);
    const f=flashes[lightIndex++%flashes.length];f.age=0;f.life=fatal?.23:.15;
    f.light.position.set(position.x,1.1,position.z);f.light.color.set(fatal?0xff935d:0xb0fff1);
    return damage;
  }
  function update(dt){
    const step=Math.min(.05,Math.max(0,dt));
    for(let i=0;i<particles.length;i++){
      const p=particles[i];p.age+=step;
      const alive=p.age<p.life;
      if(alive){
        p.vy-=step*3.8;
        const drag=Math.exp(-step*2.2);p.vx*=drag;p.vz*=drag;
        p.x+=p.vx*step;p.y=Math.max(.04,p.y+p.vy*step);p.z+=p.vz*step;
      }
      const life=alive?1-p.age/p.life:0;
      dummy.position.set(p.x,p.y,p.z);
      const s=Math.max(.0001,life*1.35);
      dummy.scale.setScalar(s);
      dummy.rotation.set(p.age*4,i*.8,p.age*6);
      dummy.updateMatrix();sparks.setMatrixAt(i,dummy.matrix);
      col.setHSL(.12+Math.min(.36,p.age/Math.max(.01,p.life))*.48,.86,.42+.45*life);
      sparks.setColorAt(i,col);
    }
    sparks.instanceMatrix.needsUpdate=true;
    if(sparks.instanceColor)sparks.instanceColor.needsUpdate=true;
    for(const r of rings){
      r.age+=step;const t=r.age/r.life;
      r.mesh.visible=t<1;
      if(t<1){r.mesh.scale.setScalar(.15+1.8*t);r.mesh.material.opacity=(1-t)*.75}
    }
    for(const f of flashes){f.age+=step;f.light.intensity=f.age<f.life?7*Math.pow(1-f.age/f.life,2):0}
  }
  function clear(){
    for(const p of particles)p.age=10;
    for(const r of rings){r.age=10;r.mesh.visible=false}
    for(const f of flashes){f.age=10;f.light.intensity=0}
  }
  function dispose(){
    scene.remove(sparks);sparks.geometry.dispose();sparks.material.dispose();
    for(const r of rings){scene.remove(r.mesh);r.mesh.material.dispose()}
    ringGeometry.dispose();
    for(const f of flashes)scene.remove(f.light);
  }
  clear();
  return {spawn,update,clear,dispose};
}

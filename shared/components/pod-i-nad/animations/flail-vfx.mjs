// Reusable additive WebGL sparks and shockwave rings for Three.js combat.
export function createFlailImpactFX(THREE, scene, {capacity=192, maxRings=8}={}) {
  if (!THREE?.ShaderMaterial || !scene?.add) throw new Error('Three.js and scene are required');
  const count=Math.max(32,Math.min(2048,Math.floor(capacity)));
  const xyz=new Float32Array(count*3);
  const tint=new Float32Array(count*3);
  const size=new Float32Array(count);
  const life=new Float32Array(count);
  const velocity=new Float32Array(count*3);
  const decay=new Float32Array(count);
  const geometry=new THREE.BufferGeometry();
  const add=(key,values,step)=>{
    const attribute=new THREE.BufferAttribute(values,step);
    attribute.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute(key,attribute);
  };
  add('position',xyz,3);
  add('aTint',tint,3);
  add('aSize',size,1);
  add('aLife',life,1);
  const material=new THREE.ShaderMaterial({
    vertexShader:[
      'attribute float aSize;',
      'attribute float aLife;',
      'attribute vec3 aTint;',
      'varying float vLife;',
      'varying vec3 vTint;',
      'void main() {',
      '  vLife=aLife;',
      '  vTint=aTint;',
      '  vec4 view=modelViewMatrix*vec4(position,1.0);',
      '  gl_Position=projectionMatrix*view;',
      '  gl_PointSize=min(76.0,aSize*(58.0/max(0.4,-view.z)));',
      '}'
    ].join('\n'),
    fragmentShader:[
      'varying float vLife;',
      'varying vec3 vTint;',
      'void main() {',
      '  float r=length(gl_PointCoord-vec2(.5));',
      '  float falloff=1.0-smoothstep(.13,.5,r);',
      '  gl_FragColor=vec4(vTint,falloff*max(0.0,vLife)*.86);',
      '}'
    ].join('\n'),
    transparent:true,depthWrite:false,blending:THREE.AdditiveBlending
  });
  const points=new THREE.Points(geometry,material);
  points.frustumCulled=false;
  points.renderOrder=22;
  scene.add(points);
  const ringGeometry=new THREE.RingGeometry(.83,1.0,44);
  const ringPool=Array.from({length:maxRings},()=>{
    const mat=new THREE.MeshBasicMaterial({color:0xaffff4,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending});
    const mesh=new THREE.Mesh(ringGeometry,mat);
    mesh.rotation.x=-Math.PI/2;
    mesh.visible=false;mesh.renderOrder=21;
    scene.add(mesh);
    return {mesh,age:0,duration:.6};
  });
  let cursor=0,ringCursor=0;
  function burst(position,{count:amount=24,strength=1,color=0xb8fff2}={}) {
    const paint=new THREE.Color(color);
    for (let j=0;j<Math.min(amount,count);j++) {
      const i=cursor++%count,k=i*3;
      const a=Math.random()*Math.PI*2;
      const speed=(1+Math.random()*3)*strength;
      xyz[k]=position.x;xyz[k+1]=position.y;xyz[k+2]=position.z;
      velocity[k]=Math.cos(a)*speed;
      velocity[k+1]=(Math.random()*.9+.2)*speed;
      velocity[k+2]=Math.sin(a)*speed;
      tint[k]=paint.r*(.85+.2*Math.random());
      tint[k+1]=paint.g*(.85+.2*Math.random());
      tint[k+2]=paint.b*(.85+.2*Math.random());
      size[i]=.12+.11*Math.random();
      life[i]=1;
      decay[i]=1.1+Math.random()*1.4;
    }
    if (ringPool.length) {
      const ring=ringPool[ringCursor++%ringPool.length];
      ring.age=0;
      ring.duration=.5+.2*Math.random();
      ring.mesh.material.color.set(color);
      ring.mesh.material.opacity=.8;
      ring.mesh.position.set(position.x,position.y+.03,position.z);
      ring.mesh.scale.setScalar(.09*strength);
      ring.mesh.visible=true;
    }
  }
  function update(dt) {
    const step=Math.max(0,Math.min(.05,dt));
    for(let i=0;i<count;i++){
      if(life[i]<=0) continue;
      const k=i*3;
      life[i]=Math.max(0,life[i]-decay[i]*step);
      xyz[k]+=velocity[k]*step;
      xyz[k+1]+=velocity[k+1]*step;
      xyz[k+2]+=velocity[k+2]*step;
      velocity[k]*=.975;
      velocity[k+1]-=4.0*step;
      velocity[k+2]*=.975;
    }
    geometry.getAttribute('position').needsUpdate=true;
    geometry.getAttribute('aLife').needsUpdate=true;
    geometry.getAttribute('aTint').needsUpdate=true;
    geometry.getAttribute('aSize').needsUpdate=true;
    for(const ring of ringPool){
      if(!ring.mesh.visible)continue;
      ring.age+=step;
      const t=Math.min(1,ring.age/ring.duration);
      ring.mesh.scale.setScalar(.14+1.45*t);
      ring.mesh.material.opacity=(1-t)*.7;
      if(t>=1)ring.mesh.visible=false;
    }
  }
  function dispose() {
    scene.remove(points);
    geometry.dispose();material.dispose();
    for(const ring of ringPool){scene.remove(ring.mesh);ring.mesh.material.dispose()}
    ringGeometry.dispose();
  }
  return {burst,update,dispose};
}

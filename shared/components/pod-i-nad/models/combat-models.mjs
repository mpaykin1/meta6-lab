// Reusable procedural 3D combat meshes; pass an existing Three.js namespace.
// Stylized basalt/bronze guardians and spiked chain weapon. No external textures.
export function createCombatModels(THREE){
  if(!THREE?.Group||!THREE?.MeshStandardMaterial)throw Error('Three.js required');
  const mat={
    armor:new THREE.MeshStandardMaterial({color:0x52707b,metalness:.78,roughness:.33,flatShading:true}),
    bronze:new THREE.MeshStandardMaterial({color:0x997454,metalness:.67,roughness:.37,flatShading:true}),
    black:new THREE.MeshStandardMaterial({color:0x101b26,metalness:.28,roughness:.83,flatShading:true}),
    eyes:new THREE.MeshStandardMaterial({color:0x62f2dc,emissive:0x23d7bf,emissiveIntensity:2.4,roughness:.2}),
    angry:new THREE.MeshStandardMaterial({color:0xff9871,emissive:0xfe572f,emissiveIntensity:2.2}),
    metal:new THREE.MeshStandardMaterial({color:0xbac4c8,metalness:.82,roughness:.27,flatShading:true})
  };
  const sphere=new THREE.IcosahedronGeometry(1,1),shard=new THREE.DodecahedronGeometry(1,0),
        cube=new THREE.BoxGeometry(1,1,1),cone=new THREE.ConeGeometry(1,1,5);
  const mesh=(geo,material,scale,pos,parent)=>{
    const o=new THREE.Mesh(geo,material);o.scale.set(...scale);o.position.set(...pos);
    o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;
  };
  function createHero(){
    const group=new THREE.Group(),torso=new THREE.Group();group.add(torso);
    mesh(shard,mat.armor,[.35,.5,.29],[0,1.04,0],torso);
    mesh(cube,mat.bronze,[.6,.12,.38],[0,1.42,0],torso);
    mesh(sphere,mat.black,[.22,.24,.24],[0,1.66,0],torso);
    mesh(cube,mat.bronze,[.29,.08,.34],[0,1.8,0],torso);
    mesh(cube,mat.eyes,[.22,.055,.037],[0,1.68,.219],torso);
    mesh(cube,mat.bronze,[.14,.25,.13],[-.36,1.12,0],torso);
    mesh(cube,mat.bronze,[.14,.25,.13],[.36,1.12,0],torso);
    const legs=[];
    for(const side of [-1,1]){
      const leg=new THREE.Group();leg.position.set(side*.18,.74,0);
      mesh(cube,mat.black,[.17,.42,.18],[0,-.23,0],leg);
      mesh(cube,mat.armor,[.23,.13,.32],[0,-.49,.08],leg);
      group.add(leg);legs.push(leg);
    }
    const core=mesh(sphere,mat.eyes,[.095,.095,.06],[0,1.11,.284],torso);
    const hand=new THREE.Object3D();hand.position.set(.40,1.19,.16);group.add(hand);
    return {group,torso,legs,hand,core,update(t,moving=false){
      torso.position.y=Math.sin(t*2)*.025;
      legs[0].rotation.x=Math.sin(t*9)*(moving?.38:.045);
      legs[1].rotation.x=-legs[0].rotation.x;
    }};
  }
  function createEnemy({color=0xff9871}={}){
    const root=new THREE.Group(),body=new THREE.Group();root.add(body);
    const glow=mat.angry.clone();glow.color.set(color);glow.emissive.set(color);
    mesh(shard,mat.black,[.38,.47,.37],[0,.92,0],body);
    mesh(shard,mat.armor,[.41,.32,.40],[0,1.22,0],body);
    mesh(cube,mat.bronze,[.57,.1,.42],[0,1.32,0],body);
    mesh(sphere,mat.black,[.31,.28,.29],[0,1.53,0],body);
    mesh(cube,glow,[.36,.06,.048],[0,1.57,.274],body);
    const horn1=mesh(cone,mat.bronze,[.12,.33,.12],[-.26,1.85,0],body);
    horn1.rotation.z=-.24;
    const horn2=mesh(cone,mat.bronze,[.12,.33,.12],[.26,1.85,0],body);
    horn2.rotation.z=.24;
    const arms=[],legs=[];
    for(const side of [-1,1]){
      const a=new THREE.Group();a.position.set(side*.40,1.33,0);body.add(a);
      mesh(shard,mat.armor,[.20,.3,.22],[side*.07,-.20,0],a);
      mesh(cone,mat.bronze,[.11,.22,.11],[side*.07,-.48,.08],a);
      arms.push(a);
      const l=new THREE.Group();l.position.set(side*.21,.78,0);root.add(l);
      mesh(cube,mat.black,[.19,.47,.18],[0,-.27,0],l);
      mesh(cube,mat.bronze,[.27,.12,.33],[0,-.54,.09],l);
      legs.push(l);
    }
    return {group:root,body,glow,arms,legs,update(t,seed=0,damaged=0){
      body.position.y=Math.sin(t*2+seed)*.055;
      body.rotation.y=Math.sin(t*.75+seed)*.16;
      arms[0].rotation.z=Math.sin(t*2+seed)*.12;
      arms[1].rotation.z=-arms[0].rotation.z;
      legs[0].rotation.x=Math.sin(t*3+seed)*.10;
      legs[1].rotation.x=-legs[0].rotation.x;
      glow.emissiveIntensity=2.1+damaged*3;
    }};
  }
  function createFlailHead(){
    const group=new THREE.Group();
    mesh(sphere,mat.metal,[.23,.23,.23],[0,0,0],group);
    mesh(sphere,mat.eyes,[.09,.09,.09],[0,0,0],group);
    for(let i=0;i<10;i++){
      const a=i*Math.PI*(3-Math.sqrt(5)),y=1-2*(i+.5)/10,r=Math.sqrt(1-y*y);
      const direction=new THREE.Vector3(Math.cos(a)*r,y,Math.sin(a)*r).normalize();
      const spike=mesh(cone,mat.bronze,[.077,.27,.077],direction.clone().multiplyScalar(.28).toArray(),group);
      spike.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction);
    }
    return group;
  }
  function createChain(count=10){
    const geom=new THREE.TorusGeometry(.083,.025,4,7);
    return Array.from({length:count},(_,i)=>{
      const link=new THREE.Mesh(geom,mat.metal);
      link.rotation.y=i*Math.PI/2;
      link.castShadow=true;
      return link;
    });
  }
  function dispose(){
    for(const g of [sphere,shard,cube,cone])g.dispose();
    for(const m of Object.values(mat))m.dispose();
  }
  return {createHero,createEnemy,createFlailHead,createChain,dispose};
}

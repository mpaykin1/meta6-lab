// Independent MIT Pixelorama PNG interchange renderer.
// The original GLB artwork and glTF animation clips remain untouched.
export async function createPixeloramaArt(THREE,scene,camera,options={}) {
  const base=options.base||'./assets/pixelorama/';
  const response=await fetch(base+'sprite_sheet.json');
  if(!response.ok)throw new Error('Pixelorama atlas JSON is missing');
  const manifest=await response.json();
  const columns=manifest.columns|0,rows=manifest.rows|0;
  if(columns<1||columns>256||rows<1||rows>256||!manifest.clips)throw new Error('Invalid Pixelorama atlas');
  const texture=await new THREE.TextureLoader().loadAsync(base+manifest.image);
  texture.magFilter=THREE.NearestFilter;
  texture.minFilter=THREE.NearestFilter;
  texture.generateMipmaps=false;
  texture.wrapS=texture.wrapT=THREE.ClampToEdgeWrapping;
  texture.colorSpace=THREE.SRGBColorSpace;
  const all=[];
  const quad=new THREE.PlaneGeometry(1,1);
  const vertexShader=`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
  const fragmentShader=`precision highp float;
     uniform sampler2D uSheet; uniform float uFrame;
     uniform float uColumns; uniform float uRows;
     uniform float uBrightness; uniform vec3 uTint;
     varying vec2 vUv;
     void main(){
       float col=mod(uFrame,uColumns), row=floor(uFrame/uColumns);
       vec2 uv=vec2((col+vUv.x)/uColumns,1.0-(row+1.0-vUv.y)/uRows);
       vec4 px=texture2D(uSheet,uv);
       if(px.a < 0.04)discard;
       gl_FragColor=vec4(px.rgb*uBrightness*uTint,px.a);
     }`;
  function sprite(clip,x,y,z,size,tint=0xffffff,opts={}) {
    const definition=manifest.clips[clip];
    if(!definition)throw new Error('Missing clip: '+clip);
    const start=('row' in definition)?definition.row*columns:(definition.start||0);
    const material=new THREE.ShaderMaterial({
      uniforms:{uSheet:{value:texture},uFrame:{value:start},uColumns:{value:columns},uRows:{value:rows},
        uBrightness:{value:opts.brightness||1.35},uTint:{value:new THREE.Color(tint)}},
      vertexShader,fragmentShader,transparent:true,side:THREE.DoubleSide,
      depthWrite:false,depthTest:true,toneMapped:false,
    });
    const mesh=new THREE.Mesh(quad,material);
    mesh.position.set(x,y,z);mesh.scale.setScalar(size);
    mesh.renderOrder=opts.renderOrder||4;
    scene.add(mesh);
    const instance={mesh,clip,definition,start,phase:opts.phase||0,base:mesh.position.clone(),float:opts.float||0};
    all.push(instance);
    return instance;
  }
  // Warm hand-painted pixel tongues overlay the true 3D log and fire geometry.
  sprite('ember',0,1.0,.07,1.5,0xffffff,{brightness:2.2,renderOrder:10});
  sprite('ember',-.35,.89,-.38,.95,0xffdcaf,{brightness:1.8,phase:.31,renderOrder:9});
  // Rune sprites attach to the existing Goxel→Blockbench→Blender moon gate sculpture.
  sprite('rune',-2.5,3.7,-8.01,1.85,0xc3fff5,{brightness:1.8,float:.08});
  sprite('rune',-2.5,1.88,-7.9,.83,0x80dce5,{brightness:1.36,float:.04,phase:.2});
  const lanterns=[[-3.5,2.05,2.6],[4,2.05,-3.4],[7,2.05,3],[-9,2.05,-3.5]];
  lanterns.forEach(([x,y,z],i)=>sprite('lantern',x,y,z,.8,0xffffff,{brightness:1.75,phase:i*.17}));
  // Wisps float around the identical voxel crystal group and disperse in background.
  for(let i=0;i<11;i++){
    const a=i*2.39996,r=1.65+(i%3)*.58;
    sprite('wisp',6.4+Math.cos(a)*r,.8+(i%5)*.64,-1.5+Math.sin(a)*r,.34+(i%3)*.12,0xcffff5,
      {brightness:2.0,float:.18,phase:i*.33});
  }
  function update(time){
    for(const s of all){
      const clip=s.definition;
      const len=clip.frames;
      const frame=Math.floor(time*(clip.fps||8)+s.phase*len)%len;
      s.mesh.material.uniforms.uFrame.value=s.start+frame;
      s.mesh.position.y=s.base.y+Math.sin(time*1.7+s.phase*6.28)*s.float;
      s.mesh.quaternion.copy(camera.quaternion);
    }
  }
  return {
    update,
    setVisible(on){for(const s of all)s.mesh.visible=!!on;},
    dispose(){for(const s of all){scene.remove(s.mesh);s.mesh.material.dispose();}quad.dispose();texture.dispose()},
    get count(){return all.length},
  };
}

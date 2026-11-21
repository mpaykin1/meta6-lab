/**
 * Quarks VFX bridge — original Voxel Atmosphere Engine module, MIT.
 * Quarks 0.17.1 is a separately installed upstream dependency (MIT).
 * Uses ONE Three.js runtime instance via import maps and external=three.
 * If unavailable, the game's original instanced particles remain visible.
 */
const QUARKS_SOURCES = [
  new URL('./vendor/three.quarks.esm.js', import.meta.url).href,
  'https://esm.sh/three.quarks@0.17.1?bundle&external=three'
];
async function resolveQuarks() {
  let lastError;
  for (const uri of QUARKS_SOURCES) {
    try {
      const mod = await import(/* @vite-ignore */ uri);
      const Q = mod.default?.ParticleSystem ? mod.default : mod;
      if (!Q.BatchedRenderer || !Q.ParticleSystem || !Q.ConstantValue || !Q.IntervalValue || !Q.ConstantColor) {
        throw new Error('three.quarks particle API was not found');
      }
      return Q;
    } catch (error) {
      lastError = error;
      console.info('Quarks provider unavailable, trying next source:', uri, error);
    }
  }
  throw lastError ?? new Error('Cannot import three.quarks');
}

export async function createQuarksVFX(THREE, scene) {
  const Q = await resolveQuarks();
  // Quarks reads the *same actual Pixelorama palette* that recolors the Goxel VOX art.
  const palette=await fetch('./assets/pixelorama/palette.json')
    .then(response=>response.ok?response.json():Promise.reject(new Error('palette missing')))
    .catch(()=>({fire:'#ffba49',warm:'#ff8f3d',cyan:'#69f5e7',teal:'#2dd1ce',moss:'#6aa481',ice:'#b7ffe7',gold:'#ffdd84'}));
  const tint=(hex,a)=>{const c=new THREE.Color(hex);return [c.r,c.g,c.b,a]};
  const batch = new Q.BatchedRenderer();
  batch.name='EMBERGROVE · three.quarks batched particles';
  scene.add(batch);

  // Pixelorama-aligned original 16×16 ember raster, transparent halo.
  // DataTexture is an effect-only texture, not a replacement for character art.
  function makeTexture(kind='ember') {
    const w=16, pixels=new Uint8Array(w*w*4);
    for(let y=0;y<w;y++)for(let x=0;x<w;x++){
      const dx=(x-7.5)/7.4, dy=(y-7.5)/7.4;
      const d=Math.sqrt(dx*dx+dy*dy),i=(y*w+x)*4;
      const strength=Math.max(0,1-d);
      const alpha=kind==='smoke'?Math.round(95*strength*strength):
        Math.round(255*Math.pow(strength,kind==='spore'?1.2:0.75));
      pixels[i]=kind==='smoke'?190:255;
      pixels[i+1]=kind==='smoke'?212:255;
      pixels[i+2]=kind==='smoke'?235:242;
      pixels[i+3]=alpha;
    }
    const tex=new THREE.DataTexture(pixels,w,w,THREE.RGBAFormat);
    tex.magFilter=THREE.NearestFilter;tex.minFilter=THREE.NearestFilter;
    tex.generateMipmaps=false;tex.needsUpdate=true;
    tex.colorSpace=THREE.SRGBColorSpace;
    return tex;
  }
  const textures=[makeTexture('ember'),makeTexture('smoke'),makeTexture('spore')];
  // Use Pixelorama's *real* 8x4 sprite atlas as particle faces in the 3D world.
  // The original image is not repainted: repeat/offset select its authored cells.
  function atlasTexture(row,fallback) {
    let tex;
    tex=new THREE.TextureLoader().load('./assets/pixelorama/sprite_sheet.webp',
      undefined,undefined,()=>{
        console.warn('Pixelorama source texture not loaded; procedural VFX texture retained');
        for(const mat of materials)if(mat.map===tex){mat.map=textures[fallback];mat.needsUpdate=true;}
      });
    tex.colorSpace=THREE.SRGBColorSpace;
    tex.magFilter=THREE.NearestFilter;tex.minFilter=THREE.NearestFilter;
    tex.wrapS=tex.wrapT=THREE.ClampToEdgeWrapping;
    tex.repeat.set(1/8,1/4);
    tex.offset.set(0,(3-row)/4);
    textures.push(tex);
    return tex;
  }
  // Warm flames use row 0; portal runes use row 1; spores use row 3;
  // crystals use row 2; smoke uses a subdued original pixel texture.
  const materials=[];
  function addMaterial(tex,blend=THREE.AdditiveBlending){
    materials.push(new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,blending:blend,side:THREE.DoubleSide}));
  }
  addMaterial(atlasTexture(0,0));
  addMaterial(atlasTexture(1,0));
  addMaterial(atlasTexture(3,2));
  addMaterial(atlasTexture(2,0));
  addMaterial(textures[1],THREE.NormalBlending);
  const systems=[];
  const constants={fire:{x:0,y:.64,z:0},portal:{x:-2.5,y:2.4,z:-8.2},glade:{x:-3.8,y:1.5,z:1.3},crystals:{x:6.4,y:1.9,z:-1.5},smoke:{x:0,y:.92,z:0}};
  const spec=[
    {id:'fire',pos:constants.fire,life:[.65,1.45],speed:[.4,1.6],size:[.07,.21],count:125,rate:56,color:tint(palette.fire,.95),material:0,shape:'point'},
    {id:'portal',pos:constants.portal,life:[1.4,3],speed:[.05,.38],size:[.055,.16],count:105,rate:34,color:tint(palette.cyan,.85),material:1,shape:'sphere',radius:1.2},
    {id:'forest-spores',pos:constants.glade,life:[2.5,5.5],speed:[.02,.17],size:[.08,.20],count:105,rate:26,color:tint(palette.ice,.64),material:2,shape:'sphere',radius:8},
    {id:'crystals',pos:constants.crystals,life:[.8,2.3],speed:[.12,.55],size:[.09,.22],count:58,rate:19,color:tint(palette.ice,.84),material:3,shape:'sphere',radius:1.35},
    {id:'mist',pos:constants.smoke,life:[3,5],speed:[.18,.52],size:[.35,.75],count:70,rate:16,color:[.25,.41,.58,.35],material:4,shape:'point'}
  ];
  function makeSystem(s, oneShot=false) {
    const shape=s.shape==='sphere'&&Q.SphereEmitter
      ?new Q.SphereEmitter({radius:s.radius??.2,thickness:.8})
      :new Q.PointEmitter();
    const config={
      duration:oneShot ? 0.45 : 8,looping:!oneShot,worldSpace:true,
      startLife:new Q.IntervalValue(s.life[0],s.life[1]),
      startSpeed:new Q.IntervalValue(s.speed[0],s.speed[1]),
      startSize:new Q.IntervalValue(s.size[0],s.size[1]),
      startColor:new Q.ConstantColor(new THREE.Vector4(...s.color)),
      maxParticle:s.count,
      emissionOverTime:new Q.ConstantValue(s.rate),
      shape,material:materials[s.material],
      renderMode:Q.RenderMode?.BillBoard ?? Q.RenderMode?.Billboard ?? 0,
      behaviors:(Q.SizeOverLife&&Q.PiecewiseBezier&&Q.Bezier)
        ? [new Q.SizeOverLife(new Q.PiecewiseBezier([[new Q.Bezier(.08,.85,.85,0),0]]))]
        :[]
    };
    const sys=new Q.ParticleSystem(config);
    sys.emitter.position.set(s.pos.x,s.pos.y,s.pos.z);
    sys.emitter.name='Quarks · '+s.id;
    scene.add(sys.emitter);
    batch.addSystem(sys);
    sys.play?.();
    return {sys,s,config};
  }
  try {for(const s of spec)systems.push(makeSystem(s));}
  catch(e){scene.remove(batch); for(const item of systems) scene.remove(item.sys.emitter);throw e;}

  const transients=[];
  let mode='cinematic',active=true;
  function setMode(next) {
    mode=next==='balanced'?'balanced':next==='off'?'off':'cinematic';
    active=mode!=='off';batch.visible=active;
    const mist=systems.find(x=>x.s.id==='mist');
    if(mist){
      // On mobile disable the expensive smoke emitter, while keeping glowy spores.
      mist.sys.emitter.visible=mode==='cinematic';
      mist.sys.emissionOverTime=new Q.ConstantValue(mode==='cinematic'?16:0);
    }
    for(const item of systems) {
      if(item.s.id==='mist')continue;
      const v=mode==='balanced' ? Math.max(3,Math.round(item.s.rate*.58)) : item.s.rate;
      item.sys.emissionOverTime=new Q.ConstantValue(active?v:0);
    }
    return mode;
  }
  function burst(position,tone='warm') {
    if(!active || transients.length>=16)return;
    const s={id:'burst',pos:position,shape:'sphere',radius:.16,life:[.3,.7],speed:[.8,2.3],size:[.055,.14],count:36,rate:180,
      color:tone==='cool'?tint(palette.cyan,.98):tint(palette.gold,.98),material:tone==='cool'?1:0};
    try{const obj=makeSystem(s,true);transients.push({...obj,age:0});}catch(e){console.warn('Quarks transient effect disabled',e);}
  }
  function update(dt) {
    if(!active)return;
    const step=Math.min(.05,Math.max(0,dt));
    batch.update(step);
    for(let i=transients.length-1;i>=0;i--){
      const x=transients[i];x.age+=step;
      if(x.age<1.5)continue;
      batch.deleteSystem?.(x.sys);
      scene.remove(x.sys.emitter);
      transients.splice(i,1);
    }
  }
  function dispose(){
    for(const item of [...systems,...transients]) {
      batch.deleteSystem?.(item.sys);
      scene.remove(item.sys.emitter);
    }
    scene.remove(batch);
    batch.dispose?.();
    for(const mat of materials)mat.dispose();
    for(const tex of textures)tex.dispose();
  }
  setMode('cinematic');
  return {setMode,update,burst,dispose,get mode(){return mode},get systemCount(){return systems.length}};
}

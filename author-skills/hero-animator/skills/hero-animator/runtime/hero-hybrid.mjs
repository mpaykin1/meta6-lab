/**
 * Hero Animator — 3D physics root + authored RGBA sprite skin.
 * One ES module, no dependencies except a THREE namespace provided by the caller.
 * Compatible with JSON produced by scripts/images2atlas.py and video2sheet.py.
 * Rendering uses genuine illustrated atlas pixels; geometry is ONLY a hidden rig,
 * collision volumes, and a textured presentation plane.
 *
 * Usage:
 *   const actor = await loadHybridActor({ THREE, atlasUrl:'./hero/hero.json',
 *     worldHeight: 1.8, body: {width:.60,height:1.72,depth:.42}, billboard:true });
 *   scene.add(actor.root);
 *   actor.setAction('idle');
 *   // inside frame loop: actor.update(dt, camera);
 */

const VERT = `
  uniform float uTime;
  uniform float uWobble;
  varying vec2 vUv;
  void main(){
    vUv=uv;
    vec3 p=position;
    // Tiny illustration-paper motion: never replace the actual drawn frames.
    p.x += uWobble * sin(uTime * 1.7 + uv.y * 11.0) * smoothstep(0.20, 0.96, uv.y);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
  }
`;
const FRAG = `
  uniform sampler2D uAtlas;
  uniform vec4 uUvRect; // bottom-left x/y and width/height in atlas UV
  uniform float uOpacity;
  uniform vec3 uWarmColor;
  uniform float uWarmStrength;
  varying vec2 vUv;
  void main(){
    vec2 tileUv = uUvRect.xy + vUv * uUvRect.zw;
    vec4 c = texture2D(uAtlas, tileUv);
    c.a *= uOpacity;
    if(c.a < 0.012) discard;
    c.rgb += uWarmColor * uWarmStrength;
    gl_FragColor = c;
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const DEFAULT_BODY = Object.freeze({ width: 0.56, height: 1.7, depth: 0.42 });
const DEFAULT_ATTACK = Object.freeze({ width: 0.8, height: 0.50, depth: 0.6, x:0.0, y:1.08, z:0.65 });

function mustFinite(value, name, lower = -Infinity){
  if(!Number.isFinite(value) || value <= lower) throw new Error(`${name} must be finite and > ${lower}`);
  return value;
}

function getNominalHeight(meta){
  const heights=[];
  for(const action of Object.values(meta.anims||{}))
    for(const f of action.frames||[])
      if(Array.isArray(f) && f.length >= 6) heights.push(-Number(f[5]));
  return Math.max(1, ...heights);
}

/**
 * Asset URLs are resolved relative to the metadata (no base64 or file copies).
 * Requires a normal HTTP(S) static host, not a local file:// fetch.
 */
export async function loadHybridActor({THREE, atlasUrl, worldHeight=1.8,
  nominalPixelHeight, body=DEFAULT_BODY, attack=DEFAULT_ATTACK,
  billboard=true, multiAngle=false, anchorY=0, wobble=.004,
  onEvent, fetchImpl=fetch}={}) {
  if (!THREE || !THREE.Group || !THREE.TextureLoader) throw new Error('THREE is required');
  if (!atlasUrl) throw new Error('atlasUrl is required');
  mustFinite(worldHeight,'worldHeight',0);
  const jsonUrl = new URL(atlasUrl, document.baseURI).href;
  const resp=await fetchImpl(jsonUrl);
  if(!resp.ok) throw new Error(`Atlas JSON HTTP ${resp.status}: ${jsonUrl}`);
  const meta=await resp.json();
  if(!meta.anims || !Object.keys(meta.anims).length) throw new Error('Atlas JSON has no actions');
  const loader=new THREE.TextureLoader();
  const sheets={};
  const names=new Set(Object.values(meta.anims).map(a=>a.sheet));
  await Promise.all([...names].map(async (name)=>{
    const url=new URL(name,jsonUrl).href;
    const texture=await loader.loadAsync(url);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS=THREE.ClampToEdgeWrapping;
    texture.wrapT=THREE.ClampToEdgeWrapping;
    texture.minFilter=THREE.LinearFilter;
    texture.magFilter=THREE.LinearFilter;
    sheets[name]=texture;
  }));
  return new HybridActor({THREE,meta,sheets,worldHeight,
    nominalPixelHeight,body,attack,billboard,multiAngle,anchorY,wobble,onEvent});
}

export class HybridActor {
  constructor({THREE,meta,sheets,worldHeight=1.8, nominalPixelHeight,
    body=DEFAULT_BODY, attack=DEFAULT_ATTACK, billboard=true,
    multiAngle=false, anchorY=0, wobble=.004, onEvent}={}) {
    if(!THREE || !meta || !sheets) throw new Error('THREE, meta and sheets are required');
    this.THREE=THREE; this.meta=meta; this.sheets=sheets;
    this.worldHeight=worldHeight;
    this.pixelWorld=worldHeight / mustFinite(nominalPixelHeight ?? getNominalHeight(meta),'nominalPixelHeight',0);
    this.billboard=Boolean(billboard);
    this.multiAngle=Boolean(multiAngle);
    this.wobble=Math.max(0,Math.min(0.015,Number(wobble)||0));
    this.onEvent=typeof onEvent==='function'?onEvent:()=>{};
    this.elapsed=0; this.motionElapsed=0; this._hitFrameEnabled=true;
    this.actionName=null; this.current=null; this.index=-1; this.hitActive=false;
    this.root=new THREE.Group(); this.root.name=`${meta.id||'hero'}_3d_root`;
    this.root.position.y=anchorY;
    this.skeleton=new THREE.Group(); this.skeleton.name='invisible_3d_rig';
    this.root.add(this.skeleton);
    this.bones={};
    const makeBone=(name,parent,pos)=>{
      const bone=new THREE.Object3D();bone.name=name;bone.position.set(...pos);
      parent.add(bone);this.bones[name]=bone;return bone;
    };
    const pelvis=makeBone('pelvis',this.skeleton,[0,worldHeight*.49,0]);
    const chest=makeBone('chest',pelvis,[0,worldHeight*.22,0]);
    makeBone('head',chest,[0,worldHeight*.20,0]);
    const leftHand=makeBone('leftHand',chest,[-body.width*.54,-worldHeight*.15,0]);
    const rightHand=makeBone('rightHand',chest,[body.width*.54,-worldHeight*.15,0]);
    makeBone('leftFoot',pelvis,[-body.width*.22,-worldHeight*.49,0]);
    makeBone('rightFoot',pelvis,[body.width*.22,-worldHeight*.49,0]);
    this.bodyConfig={...DEFAULT_BODY,...body};
    const colliderGeom=new THREE.BoxGeometry(this.bodyConfig.width,this.bodyConfig.height,this.bodyConfig.depth);
    const invisibleMaterial=new THREE.MeshBasicMaterial({visible:false});
    this.bodyCollider=new THREE.Mesh(colliderGeom,invisibleMaterial);
    this.bodyCollider.name='invisible_body_collider';
    this.bodyCollider.position.y=this.bodyConfig.height/2;
    this.root.add(this.bodyCollider);
    this.attackConfig={...DEFAULT_ATTACK,...attack};
    this.attackCollider=new THREE.Mesh(
      new THREE.BoxGeometry(this.attackConfig.width,this.attackConfig.height,this.attackConfig.depth),
      invisibleMaterial
    );
    this.attackCollider.name='invisible_attack_collider';
    this.attackCollider.position.set(this.attackConfig.x,this.attackConfig.y,this.attackConfig.z);
    this.root.add(this.attackCollider);
    this.skin=new THREE.Group(); this.skin.name='illustrated_sprite_skin';this.root.add(this.skin);
    const texture=Object.values(sheets)[0];
    this.material=new THREE.ShaderMaterial({
      uniforms:{
        uAtlas:{value:texture}, uUvRect:{value:new THREE.Vector4(0,0,1,1)},
        uTime:{value:0},uWobble:{value:0},uOpacity:{value:1},
        uWarmColor:{value:new THREE.Vector3(1,.45,.08)},uWarmStrength:{value:0}
      },
      vertexShader:VERT,fragmentShader:FRAG,transparent:true,
      depthWrite:false, side:THREE.DoubleSide
    });
    this.plane=new THREE.Mesh(new THREE.PlaneGeometry(1,1),this.material);
    this.plane.name='authored_art_not_primitives';
    this.plane.frustumCulled=false; this.skin.add(this.plane);
    // Only opaque painted pixels write depth before transparent layers; no rectangular occluder.
    this.depthMaterial=new THREE.ShaderMaterial({uniforms:this.material.uniforms,vertexShader:VERT,
      fragmentShader:`uniform sampler2D uAtlas;uniform vec4 uUvRect;uniform float uOpacity;varying vec2 vUv;
        void main(){if(texture2D(uAtlas,uUvRect.xy+vUv*uUvRect.zw).a*uOpacity<.96)discard;gl_FragColor=vec4(0.);}`,
      colorWrite:false,depthWrite:true,side:THREE.DoubleSide});
    this.depthPlane=new THREE.Mesh(this.plane.geometry,this.depthMaterial);
    this.depthPlane.frustumCulled=false;this.skin.add(this.depthPlane);
    const pixels=new Uint8Array(64*64*4);
    for(let y=0;y<64;y++)for(let x=0;x<64;x++){
      const k=(y*64+x)*4,r=Math.hypot((x-31.5)/31.5,(y-31.5)/31.5);
      pixels[k]=pixels[k+1]=pixels[k+2]=255;pixels[k+3]=Math.round(255*Math.pow(Math.max(0,1-r),2));
    }
    this.shadowTexture=new THREE.DataTexture(pixels,64,64,THREE.RGBAFormat);
    this.shadowTexture.minFilter=THREE.LinearFilter;this.shadowTexture.magFilter=THREE.LinearFilter;this.shadowTexture.needsUpdate=true;
    this.shadowMaterial=new THREE.MeshBasicMaterial({map:this.shadowTexture,color:0x1c0d04,transparent:true,opacity:.4,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1});
    this.contactShadow=new THREE.Mesh(new THREE.PlaneGeometry(body.width*3,body.depth*3),this.shadowMaterial);
    this.contactShadow.rotation.x=-Math.PI/2;this.root.add(this.contactShadow);
    this.groundHeight=anchorY;
    this.worldAABB=new THREE.Box3(); this.attackAABB=new THREE.Box3();
    this._pos=new THREE.Vector3(); this._cam=new THREE.Vector3();
    this._lastFacing='front';
    this.setAction(meta.anims.idle?'idle':Object.keys(meta.anims)[0]);
    this._frame(0);
  }

  /** Return the matching atlas action. Suffixes: _front, _back, _left, _right. */
  _resolve(name,dir=this._lastFacing){
    return (this.multiAngle && this.meta.anims[`${name}_${dir}`]) || this.meta.anims[name] || null;
  }

  setAction(name,{restart=true}={}){
    if(!this.meta.anims[name] && !Object.keys(this.meta.anims).some(k=>k.startsWith(name+'_')))
      throw new Error(`Unknown action: ${name}`);
    if(this.actionName===name && !restart) return;
    this.actionName=name;this.elapsed=0;this.index=-1;this.hitActive=false;
    this.current=this._resolve(name);
    if(!this.current) throw new Error(`Missing action: ${name}`);
    this._frame(0);
  }

  /** Controller supplies actual 3D bone poses (if using cut-out pieces). */
  setBoneRotation(name,euler){
    const bone=this.bones[name];
    if(!bone) throw new Error(`Unknown bone: ${name}`);
    bone.rotation.set(euler.x??0,euler.y??0,euler.z??0);
  }

  /** Use root.position / root.rotation for world motion; not frame-driven motion. */
  _frame(frameIndex){
    const action=this.current; const item=action.frames[frameIndex];
    if(!item || item.length<6) throw new Error(`Bad atlas frame ${frameIndex} in ${this.actionName}`);
    const [sx,sy,w,h,ox,oy]=item.map(Number);
    const tex=this.sheets[action.sheet];
    if(!tex?.image?.width || !tex?.image?.height) throw new Error(`Missing atlas: ${action.sheet}`);
    const tw=tex.image.width,th=tex.image.height;
    this.material.uniforms.uAtlas.value=tex;
    // src rectangles in top-left PNG pixels -> THREE UV bottom-left.
    this.material.uniforms.uUvRect.value.set((sx+.5)/tw,1-(sy+h-.5)/th,Math.max(0,w-1)/tw,Math.max(0,h-1)/th);
    this.plane.scale.set(w*this.pixelWorld,h*this.pixelWorld,1);
    this.plane.position.set((ox+w/2)*this.pixelWorld,(-oy-h/2)*this.pixelWorld,0);
    this.depthPlane.position.copy(this.plane.position);this.depthPlane.scale.copy(this.plane.scale);
    this.material.uniforms.uWobble.value=this.actionName.startsWith('idle')?this.wobble:0;
    // Optional per-frame 3D hit volumes. All positions/sizes are WORLD units
    // relative to the actor's 3D root, not to the 2D painting's pixels.
    if(Array.isArray(action.hitboxes)){
      const b=action.hitboxes[frameIndex];
      this._hitFrameEnabled=Array.isArray(b)&&b.length===6;
      if(this._hitFrameEnabled){
        const [x,y,z,ww,hh,dd]=b.map(Number);
        if(ww>0&&hh>0&&dd>0){
          this.attackCollider.position.set(x,y,z);
          this.attackCollider.scale.set(
            ww/this.attackConfig.width,
            hh/this.attackConfig.height,
            dd/this.attackConfig.depth
          );
        } else this._hitFrameEnabled=false;
      }
    } else {
      this._hitFrameEnabled=true;
      this.attackCollider.position.set(this.attackConfig.x,this.attackConfig.y,this.attackConfig.z);
      this.attackCollider.scale.set(1,1,1);
    }
    this.index=frameIndex;
  }

  _angleToFacing(camera){
    if(!camera) return this._lastFacing;
    this.root.getWorldPosition(this._pos);
    camera.getWorldPosition(this._cam);
    const dx=this._cam.x-this._pos.x,dz=this._cam.z-this._pos.z;
    const worldYaw=Math.atan2(dx,dz);
    const rootYaw=this.root.getWorldQuaternion(new this.THREE.Quaternion());
    const fwd=new this.THREE.Vector3(0,0,1).applyQuaternion(rootYaw);
    const actorYaw=Math.atan2(fwd.x,fwd.z);
    const relative=Math.atan2(Math.sin(worldYaw-actorYaw),Math.cos(worldYaw-actorYaw));
    if(Math.abs(relative)<Math.PI/4) return 'front';
    if(Math.abs(relative)>3*Math.PI/4) return 'back';
    return relative>0?'right':'left';
  }

  /** delta in seconds. Events are emitted once per action, on crossing release. */
  update(delta,camera){
    delta=Math.max(0,Math.min(.25,Number(delta)||0));
    this.motionElapsed+=delta;
    this.material.uniforms.uTime.value=this.motionElapsed;
    const height=Math.max(0,this.root.position.y-this.groundHeight);
    this.contactShadow.position.y=this.groundHeight-this.root.position.y+.008;
    this.contactShadow.scale.setScalar(1+Math.min(height,4)*.28);
    this.shadowMaterial.opacity=.4/(1+height*1.5);
    const prev=this.elapsed;this.elapsed+=delta;
    if(this.billboard && camera){
      this.root.updateWorldMatrix(true,false);
      this.root.getWorldPosition(this._pos); camera.getWorldPosition(this._cam);
      const yaw=Math.atan2(this._cam.x-this._pos.x,this._cam.z-this._pos.z);
      const rootQ=this.root.getWorldQuaternion(new this.THREE.Quaternion());
      const fwd=new this.THREE.Vector3(0,0,1).applyQuaternion(rootQ);
      const localYaw=yaw-Math.atan2(fwd.x,fwd.z);
      this.skin.rotation.set(0,localYaw,0);
    }
    const facing=this._angleToFacing(camera);
    if(facing!==this._lastFacing){this._lastFacing=facing;this.current=this._resolve(this.actionName,facing);this.index=-1;}
    const a=this.current;
    const fps=Number(a.fps)||12,n=a.frames.length;
    const k=Math.floor(this.elapsed*fps);
    let target=k;
    if(a.loop){target=k % n;}
    else if(a.loopFrom!=null && k>=n){
      const first=Math.max(0,Math.min(n-1,Math.floor(Number(a.loopFrom))));
      target=first+(k-n)%(n-first);
    }else target=Math.min(n-1,k);
    if(target!==this.index)this._frame(target);
    if(Number.isFinite(Number(a.release)) && a.release != null && prev < Number(a.release) && this.elapsed >= Number(a.release)){
      this.onEvent({type:'release',name:this.actionName,time:Number(a.release),actor:this});
    }
    const start=Number(a.hitStart??a.release??Infinity);
    const end=Number(a.hitEnd??(Number.isFinite(start)?start+.12:-Infinity));
    this.hitActive=this.elapsed>=start && this.elapsed<end && this._hitFrameEnabled;
    return this;
  }

  getBodyAABB(){
    this.root.updateWorldMatrix(true,true);
    this.worldAABB.setFromObject(this.bodyCollider);
    return this.worldAABB;
  }
  getAttackAABB(){
    if(!this.hitActive)return null;
    this.root.updateWorldMatrix(true,true);
    this.attackAABB.setFromObject(this.attackCollider);
    return this.attackAABB;
  }
  intersectsBody(worldBox){return this.getBodyAABB().intersectsBox(worldBox);}
  setGroundHeight(y){if(!Number.isFinite(y))throw Error('finite ground height required');this.groundHeight=y;}
  setLighting({color=[1,.45,.08],intensity=0}={}){
    if(!Array.isArray(color)||color.length!==3||!color.every(Number.isFinite)||!Number.isFinite(intensity))throw Error('finite lighting color/intensity required');
    this.material.uniforms.uWarmColor.value.set(...color);this.material.uniforms.uWarmStrength.value=Math.max(0,Math.min(.18,intensity));
  }
  intersectsAttack(worldBox){const b=this.getAttackAABB();return !!b&&b.intersectsBox(worldBox);}
  dispose(){
    this.plane.geometry.dispose();this.material.dispose();this.depthMaterial.dispose();
    this.contactShadow.geometry.dispose();this.shadowMaterial.dispose();this.shadowTexture.dispose();
    this.bodyCollider.geometry.dispose();this.attackCollider.geometry.dispose();
    for(const t of Object.values(this.sheets))t.dispose();
    this.root.removeFromParent();
  }
}


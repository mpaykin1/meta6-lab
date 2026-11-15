import * as T from 'three';

// INK — Night Express. A new volumetric train (not the steam-train reference):
// boxy locomotive with a fog-cutting searchlight, carriages with lit windows.
// Train runs along +X, nose at x=0. Everything dark, wet, glinting.
function seeded(seed){let s=(Math.floor(seed)||7)|0;return()=>((s=(Math.imul(s,1664525)+1013904223)|0)>>>0)/4294967296;}
const CAR_LEN=11,GAP=.6,LOCO_LEN=10.5,FLOOR=1.12,RAIL_TOP=.25,WHEEL_R=.46;

function glowTexture(){
  const c=document.createElement('canvas');c.width=c.height=128;
  const x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);
  g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.12,'rgba(235,240,255,.75)');
  g.addColorStop(.35,'rgba(200,215,255,.22)');g.addColorStop(.7,'rgba(180,200,255,.05)');
  g.addColorStop(1,'rgba(180,200,255,0)');
  x.fillStyle=g;x.fillRect(0,0,128,128);
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;
}
function spillTexture(){
  // Light thrown from the windows onto the ground: 8 soft bars fading outward.
  const c=document.createElement('canvas');c.width=256;c.height=64;
  const x=c.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,256,64);
  for(let i=0;i<8;i++){
    const cx=26+i*29;
    const g=x.createLinearGradient(0,0,0,64);
    g.addColorStop(0,'rgba(255,225,170,.95)');g.addColorStop(.35,'rgba(255,215,160,.35)');g.addColorStop(1,'rgba(255,210,150,0)');
    x.fillStyle=g;x.beginPath();x.moveTo(cx-9,0);x.lineTo(cx+9,0);x.lineTo(cx+17,64);x.lineTo(cx-17,64);x.fill();
  }
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;
}
function beamMaterial(len,strength,tint){
  return new T.ShaderMaterial({
    uniforms:{uLen:{value:len},uI:{value:strength},uTime:{value:0},uBody:{value:0},uPow:{value:1.7},uFall:{value:1.35},uTint:{value:new T.Color(tint)}},
    transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,fog:false,
    vertexShader:`uniform float uLen;varying float vT;varying vec3 vN;varying vec3 vV;varying vec3 vP;
      void main(){vT=position.x/uLen;vP=position;vec4 mv=modelViewMatrix*vec4(position,1.);
      vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`uniform float uI,uTime,uBody,uPow,uFall;uniform vec3 uTint;varying float vT;varying vec3 vN;varying vec3 vV;varying vec3 vP;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
      void main(){
        float rim=mix(pow(abs(dot(normalize(vN),normalize(vV))),uPow),1.,uBody);
        float fall=pow(1.-clamp(vT,0.,1.),uFall)*smoothstep(0.,.03,vT);
        // fog banks rushing back through the beam
        float fogn=.62+.55*n(vec2(vP.x*.22+uTime*9.,atan(vP.y,vP.z)*1.6));
        gl_FragColor=vec4(uTint*uI*rim*fall*fogn,1.);
      }`
  });
}
function beamCone(len,radius,strength,tint){
  const g=new T.ConeGeometry(radius,len,40,1,true);
  g.translate(0,-len/2,0);g.rotateZ(Math.PI/2);
  const m=new T.Mesh(g,beamMaterial(len,strength,tint));
  m.frustumCulled=false;m.renderOrder=5;return m;
}

// `look` tunes how the light reads; defaults are the first, hazy version.
const LOOK={glareBase:2.6,glareGain:19,glareDepthTest:false,smallBase:1.3,smallGain:2.6,
  beamLen:[52,34],beamRad:[3.6,6.2],beamI:[1.05,.34],beamBody:0,tilt:.035,spot:850,nose:26,warm:22,
  spill:.34,mullions:false,halo:0,minGlare:0,minSmall:0,minHalo:0,cab:1,beamPow:1.7,beamFall:1.35,bodyColor:'#2a353b'};
function paneTexture(){
  // window split by dark bars, so panes read even as tiny far rectangles
  const c=document.createElement('canvas');c.width=c.height=64;
  const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,64,64);
  x.fillStyle='#000';x.fillRect(29,0,6,64);x.fillRect(0,26,64,5);
  x.strokeStyle='#000';x.lineWidth=5;x.strokeRect(0,0,64,64);
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;
}
export function createInkNightTrain({cars=7,seed=7,look={}}={}){
  const rnd=seeded(seed),K={...LOOK,...look};
  const paneTex=K.mullions?paneTexture():null;
  const root=new T.Group();root.name='INK · Ночной экспресс (объёмный 3D-поезд)';
  const painted=new T.Group();root.add(painted);   // dark wet bodies: watercolor is applied here
  const lights=new T.Group();root.add(lights);     // emissive parts, never painted
  const M={
    body:new T.MeshPhysicalMaterial({color:K.bodyColor,roughness:.42,metalness:.25,clearcoat:.55,clearcoatRoughness:.3}),
    roof:new T.MeshPhysicalMaterial({color:'#12171a',roughness:.5,metalness:.2,clearcoat:.4,clearcoatRoughness:.35}),
    under:new T.MeshStandardMaterial({color:'#0b0e10',roughness:.9}),
    stripe:new T.MeshStandardMaterial({color:'#5d6a70',roughness:.5,metalness:.3}),
    steel:new T.MeshStandardMaterial({color:'#7d878c',roughness:.3,metalness:.9})
  };
  const box=(g,w,h,d,mat,p,outline=false)=>{
    const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(...p);
    m.userData.watercolorOutline=outline;g.add(m);return m;
  };
  // ---------- shared geometry ----------
  const section=new T.Shape();
  section.moveTo(-1.45,0);section.lineTo(-1.45,2.25);
  section.bezierCurveTo(-1.34,2.86,1.34,2.86,1.45,2.25);
  section.lineTo(1.45,0);section.closePath();
  const carGeo=new T.ExtrudeGeometry(section,{depth:CAR_LEN,bevelEnabled:false,curveSegments:8});
  carGeo.rotateY(Math.PI/2);carGeo.translate(-CAR_LEN/2,0,0);
  const winGeo=new T.PlaneGeometry(.95,.82);
  const spillGeo=new T.PlaneGeometry(CAR_LEN,5.2);spillGeo.rotateX(-Math.PI/2);
  const spillTex=spillTexture(),glowTex=glowTexture();
  const wheelSpots=[];   // every wheel: [x,z]
  const bogie=(x)=>{
    box(painted,2.9,.3,2.0,M.under,[x,.66,0]);
    for(const dx of [-.95,.95])for(const z of [-.76,.76])wheelSpots.push([x+dx,z]);
  };
  // ---------- locomotive ----------
  const loco=new T.Group();loco.position.set(0,FLOOR-.17,0);painted.add(loco);
  const prof=new T.Shape();
  prof.moveTo(-LOCO_LEN,0);prof.lineTo(-LOCO_LEN,2.78);prof.lineTo(-LOCO_LEN+.3,2.98);
  prof.lineTo(-2.3,2.98);prof.lineTo(-1.55,2.82);prof.lineTo(-.55,1.72);
  prof.lineTo(-.1,1.42);prof.lineTo(0,.9);prof.lineTo(0,0);prof.closePath();
  const locoGeo=new T.ExtrudeGeometry(prof,{depth:2.74,bevelEnabled:true,bevelThickness:.08,bevelSize:.08,bevelSegments:2});
  locoGeo.translate(0,0,-1.37);
  const locoBody=new T.Mesh(locoGeo,M.body);locoBody.userData.watercolorOutline=true;loco.add(locoBody);
  box(loco,LOCO_LEN-.9,.16,2.96,M.stripe,[-LOCO_LEN/2-.35,1.02,0]);
  box(loco,LOCO_LEN-.4,.5,2.5,M.under,[-LOCO_LEN/2,-.2,0]);
  box(loco,.5,.62,2.7,M.under,[.12,-.2,0]);                       // plough
  for(let i=0;i<5;i++)box(loco,.9,.22,1.5,M.roof,[-3.6-i*1.35,3.1,0]);   // roof gear
  box(loco,.62,.5,.7,M.roof,[-1.95,3.16,0]);                      // searchlight housing
  // pantographs: thin frames reaching for the wire
  const pantoTops=[];
  for(const px of [-4.2,-8.4]){
    const pts=[[px-.8,3.2,0],[px,4.0,0],[px-.7,4.72,0]];
    for(const z of [-.42,.42]){
      const c=new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(p[0],p[1],z*(1-.4*(p[1]-3.2)/1.5))));
      const tube=new T.Mesh(new T.TubeGeometry(c,8,.035,4),M.under);tube.userData.watercolorOutline=false;loco.add(tube);
    }
    box(loco,.12,.06,1.5,M.steel,[px-.7,4.75,0]);
    pantoTops.push(new T.Vector3(px-.7,FLOOR-.17+4.8,0));
  }
  bogie(-2.5);bogie(-8.0);
  // ---------- carriages ----------
  const carList=[];
  for(let i=0;i<cars;i++){
    const cx=-LOCO_LEN-GAP-CAR_LEN/2-i*(CAR_LEN+GAP);
    const car=new T.Group();car.position.set(cx,FLOOR,0);painted.add(car);
    const body=new T.Mesh(carGeo,M.body);body.userData.watercolorOutline=true;car.add(body);
    box(car,CAR_LEN-.2,.14,2.94,M.stripe,[0,.62,0]);
    box(car,CAR_LEN-.6,.42,2.3,M.under,[0,-.2,0]);
    box(car,2.2,.5,1.9,M.under,[.6-rnd()*1.2,-.55,0]);
    for(let k=0;k<3;k++)box(car,.7,.16,.9,M.roof,[-3.4+k*3.4,2.78,0]);
    box(painted,GAP+.1,2.1,1.7,M.under,[cx+CAR_LEN/2+GAP/2,FLOOR+1.05,0]);   // bellows to the car ahead
    bogie(cx-3.6);bogie(cx+3.6);
    // lit windows (never painted, HDR so they bloom)
    const lit=new T.Group();lit.position.copy(car.position);lights.add(lit);
    const mat=new T.MeshBasicMaterial({color:'#ffffff',side:T.DoubleSide,map:paneTex});
    const count=18,win=new T.InstancedMesh(winGeo,mat,count);
    const d=new T.Object3D(),col=new T.Color();
    for(let k=0;k<count;k++){
      const side=k<9?1:-1,j=k%9,r=rnd();
      const blind=r>.88?.45:r>.72?.7:1;
      d.position.set(-4.5+j*1.125,1.43+(1-blind)*.41,side*1.462);
      d.rotation.set(0,side>0?0:Math.PI,0);d.scale.set(1,blind,1);d.updateMatrix();
      win.setMatrixAt(k,d.matrix);
      const dark=rnd()<.13,warm=.75+rnd()*.5,pw=dark?.05:(1.15+rnd()*1.0);
      col.setRGB(pw*1.0,pw*(.72+.08*warm),pw*(.30+.2*warm));
      win.setColorAt(k,col);
    }
    win.instanceColor.needsUpdate=true;lit.add(win);
    const spills=[];
    for(const side of [-1,1]){
      const sm=new T.MeshBasicMaterial({map:spillTex,transparent:true,opacity:K.spill,depthWrite:false,blending:T.AdditiveBlending});
      const sp=new T.Mesh(spillGeo,sm);
      sp.position.set(0,-FLOOR+.07,side*4.0);if(side<0)sp.rotation.y=Math.PI;
      sp.renderOrder=2;lit.add(sp);spills.push(sm);
    }
    carList.push({car,lit,mat,spills,flickers:rnd()<.3,phase:rnd()*20});
  }
  // tail lamps
  const tailX=-LOCO_LEN-cars*(CAR_LEN+GAP)-.02;
  for(const z of [-.95,.95]){
    const t=new T.Mesh(new T.CircleGeometry(.13,12),new T.MeshBasicMaterial({color:new T.Color(4,.25,.15),side:T.DoubleSide}));
    t.position.set(tailX,FLOOR+.75,z);t.rotation.y=-Math.PI/2;lights.add(t);
    const s=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:'#ff3a22',transparent:true,opacity:.55,depthWrite:false,blending:T.AdditiveBlending}));
    s.position.set(tailX-.1,FLOOR+.75,z);s.scale.setScalar(1.5);lights.add(s);
  }
  // wheels: one instanced mesh, they stay on the rails while bodies sway above
  const wg=new T.CylinderGeometry(WHEEL_R,WHEEL_R,.13,14);wg.rotateX(Math.PI/2);
  const wheels=new T.InstancedMesh(wg,M.under,wheelSpots.length);
  const wd=new T.Object3D();
  wheelSpots.forEach((w,i)=>{wd.position.set(w[0],RAIL_TOP+WHEEL_R,w[1]);wd.updateMatrix();wheels.setMatrixAt(i,wd.matrix);});
  wheels.userData.watercolorOutline=false;root.add(wheels);
  // ---------- front lights ----------
  const lamp=new T.Group();lamp.position.set(-1.6,FLOOR-.17+3.2,0);lights.add(lamp);
  const lens=new T.Mesh(new T.CircleGeometry(.24,20),new T.MeshBasicMaterial({color:new T.Color(14,15,17),side:T.DoubleSide}));
  lens.rotation.y=Math.PI/2;lamp.add(lens);
  const beamIn=beamCone(K.beamLen[0],K.beamRad[0],K.beamI[0],'#dfe8ff'),beamOut=beamCone(K.beamLen[1],K.beamRad[1],K.beamI[1],'#aebbe0');
  beamIn.material.uniforms.uBody.value=beamOut.material.uniforms.uBody.value=K.beamBody;
  for(const b of [beamIn,beamOut]){b.material.uniforms.uPow.value=K.beamPow;b.material.uniforms.uFall.value=K.beamFall;}
  lamp.add(beamIn,beamOut);lamp.rotation.z=K.tilt;
  const glare=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:'#eef2ff',transparent:true,opacity:.9,depthWrite:false,depthTest:K.glareDepthTest,blending:T.AdditiveBlending,fog:false}));
  glare.position.set(.15,0,0);glare.renderOrder=9;lamp.add(glare);
  let halo=null;
  if(K.halo){
    halo=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:'#dfe4f2',transparent:true,opacity:.2,depthWrite:false,blending:T.AdditiveBlending,fog:false}));
    halo.position.set(.2,0,0);halo.scale.setScalar(K.halo);halo.renderOrder=8;lamp.add(halo);
  }
  const small=[];
  for(const p of [[.06,1.5,-.92],[.06,1.5,.92],[.06,1.18,0]]){
    const g=new T.Group();g.position.set(p[0],FLOOR-.17+p[1],p[2]);lights.add(g);
    const l=new T.Mesh(new T.CircleGeometry(.1,12),new T.MeshBasicMaterial({color:new T.Color(7,7,7.5),side:T.DoubleSide}));
    l.rotation.y=Math.PI/2;g.add(l);
    const s=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:'#f2f4ff',transparent:true,opacity:.7,depthWrite:false,blending:T.AdditiveBlending,fog:false}));
    s.scale.setScalar(K.smallBase);g.add(s);small.push(s);
  }
  // cab glass, dim
  const cab=new T.Mesh(new T.PlaneGeometry(2.3,1.05),new T.MeshBasicMaterial({color:new T.Color(.2*K.cab,.17*K.cab,.11*K.cab),side:T.DoubleSide}));
  const nrm=new T.Vector3(1.1,.95,0).normalize();
  cab.position.set(-1.05,FLOOR-.17+2.27,0).addScaledVector(nrm,.1);cab.lookAt(cab.position.clone().add(nrm));lights.add(cab);
  // real light on the world: searchlight, window warmth, pantograph spark
  const spot=new T.SpotLight('#e4ecff',K.spot,120,.3,.85,1.55);
  spot.position.copy(lamp.position);spot.target.position.set(60,1.2,0);root.add(spot,spot.target);
  const nose=new T.PointLight('#dfe8ff',K.nose,16,1.8);nose.position.set(2.2,2.2,0);root.add(nose);
  const warm=[];
  for(const x of [-22,-52,-80]){
    const p=new T.PointLight('#ffcf90',K.warm,17,1.6);p.position.set(x,2.6,0);root.add(p);warm.push(p);
  }
  const spark=new T.PointLight('#bcd4ff',0,26,1.6);spark.position.copy(pantoTops[0]);root.add(spark);
  const sparkGlow=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:'#cfe0ff',transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending,fog:false}));
  sparkGlow.position.copy(pantoTops[0]);lights.add(sparkGlow);

  root.userData.isInkNightTrain=true;
  root.userData.length=-tailX;
  root.userData.painted=painted;
  root.userData.rig={loco,cars:carList,lamp,spot,glare,beamIn,beamOut,pantoTops};
  root.userData.pulse=0;
  const tmp=new T.Vector3(),fwd=new T.Vector3();
  const hash=n=>{const f=Math.sin(n*127.1+311.7)*43758.5453;return f-Math.floor(f);};
  let glareS=0;
  // time, dt, speed 0..1 and the camera (for the head-on glare)
  root.userData.tick=(t,dt=0,speed=1,camera=null)=>{
    const k=speed;
    // rail-joint wave: every body hops a moment after the one ahead of it
    const hop=i=>{const u=((t-i*.34)%.73+.73)%.73;return Math.exp(-11*u)*Math.sin(u*34)*.028*k;};
    loco.position.y=FLOOR-.17+hop(0)*.6+.006*Math.sin(t*23)*k;
    loco.rotation.x=(.008*Math.sin(t*1.9)+.004*Math.sin(t*6.3))*k;
    carList.forEach((c,i)=>{
      const roll=(.016*Math.sin(t*2.3-i*.9)+.006*Math.sin(t*7.1+i*2.1))*k;
      const y=FLOOR+hop(i+1);
      c.car.position.y=y;c.car.rotation.x=roll;c.car.rotation.y=.0035*Math.sin(t*1.7-i*.8)*k;
      c.lit.position.y=y;c.lit.rotation.x=roll;c.lit.rotation.y=c.car.rotation.y;
      // some carriages have nervous lamps
      let f=.94+.06*Math.sin(t*3.1+c.phase);
      if(c.flickers){
        const w=((t+c.phase)%6.5);
        if(w<.9)f*=hash(Math.floor(t*17)+i*31)>.45?1:.18;
      }
      c.mat.color.setScalar(f);c.spills[0].opacity=c.spills[1].opacity=K.spill*f;
    });
    warm.forEach((p,i)=>{p.intensity=K.warm*(.9+.1*Math.sin(t*2.7+i*2));});
    // searchlight: breathing, shimmer and head-on glare
    const breathe=.93+.05*Math.sin(t*1.3)+.03*Math.sin(t*17.3)*Math.sin(t*3.1);
    beamIn.material.uniforms.uTime.value=t;beamOut.material.uniforms.uTime.value=t*.7+3;
    beamIn.material.uniforms.uI.value=K.beamI[0]*breathe;beamOut.material.uniforms.uI.value=K.beamI[1]*breathe;
    spot.intensity=K.spot*breathe;nose.intensity=K.nose*breathe;
    lamp.rotation.z=K.tilt+.004*Math.sin(t*5.2)*k;
    let facing=.15,camDist=0;
    if(camera){
      lamp.getWorldPosition(tmp);fwd.copy(camera.position).sub(tmp);
      const dist=fwd.length();fwd.normalize();camDist=dist;
      facing=Math.pow(Math.max(0,fwd.x),7)*Math.min(1,26/Math.max(6,dist)+.35);
    }
    glareS+=(facing-glareS)*(dt>0?1-Math.exp(-dt*6):1);
    const gs=Math.max(K.glareBase+K.glareGain*glareS,camDist*K.minGlare)*breathe;if(halo){halo.material.opacity=.14+.12*glareS;halo.scale.setScalar(Math.max(K.halo,camDist*K.minHalo));}glare.scale.set(gs,gs,1);
    glare.material.opacity=.55+.45*glareS;
    small.forEach((s,i)=>s.scale.setScalar(Math.max(K.smallBase+K.smallGain*glareS,camDist*K.minSmall)*(.95+.05*Math.sin(t*9+i))));
    // pantograph sparks: irregular cold flashes that kick the whole picture
    const n=Math.floor(t/2.9),st=n*2.9+.4+2*hash(n*7.3),u=t-st;
    let sp=0;
    if(u>0&&u<.42&&k>.3)sp=Math.exp(-9*u)*(.55+.45*Math.sin(u*95));
    const which=pantoTops[n%2];spark.position.copy(which);sparkGlow.position.copy(which);
    spark.intensity=95*sp;sparkGlow.material.opacity=Math.min(1,sp*1.5);
    sparkGlow.scale.setScalar(1.2+5*sp);
    root.userData.pulse=Math.min(1,sp*1.2);
  };
  root.userData.tick(0,0,1,null);
  return root;
}

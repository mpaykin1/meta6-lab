import * as T from 'three';

// INK / SKY VIADUCT — original genuinely volumetric watercolor architecture.
// The accepted Fallen Guardian shader and all reference files remain unchanged.
const P={
  stone:'#bdb3a6',pale:'#e0cbb4',gold:'#d7bb98',shadow:'#837d80',
  ochre:'#be9780',terracotta:'#b87965',salmon:'#cf997f',
  ink:'#656a6b',moss:'#858b69',fern:'#83936f',leaf:'#b5a16e',
  roof:'#9c8177',rooflight:'#c29c80',window:'#f7cf88',
  windowdark:'#4f5d60',cloud:'#f4efe4',cloudshadow:'#d8d1d1',
  rock:'#9e958c',rocklight:'#c3b5ab',rockshadow:'#777680'
};
const mats=new Map();
let grainMap=null;
function rng(s=1){let n=s|0;return()=>((n=Math.imul(n,1664525)+1013904223|0)>>>0)/4294967296;}
function texture(){
  if(grainMap)return grainMap;
  const c=document.createElement('canvas');c.width=c.height=256;
  const ctx=c.getContext('2d'),rand=rng(731194);
  ctx.fillStyle='#ede3d8';ctx.fillRect(0,0,256,256);
  for(let i=0;i<1100;i++){
    const x=rand()*256,y=rand()*256,r=.5+Math.pow(rand(),2.4)*21;
    ctx.fillStyle=['#9e8d8b','#b0a7a0','#f6e9dc','#bdaba6','#b7a29b'][Math.floor(rand()*5)];
    ctx.globalAlpha=.04+rand()*.18;
    ctx.beginPath();ctx.ellipse(x,y,r,r*(.28+rand()*.65),rand()*Math.PI*2,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;
  grainMap=new T.CanvasTexture(c);grainMap.colorSpace=T.SRGBColorSpace;
  grainMap.wrapS=grainMap.wrapT=T.RepeatWrapping;
  return grainMap;
}
function pigment(key){
  if(!mats.has(key)){
    const light=key==='window';
    mats.set(key,new T.MeshStandardMaterial({
      color:P[key]||key,roughness:1,metalness:0,flatShading:true,
      map:light?null:texture(),
      ...(light?{emissive:P.window,emissiveIntensity:.62}:{})
    }));
  }
  return mats.get(key);
}
function part(parent,geometry,key,pos=[0,0,0],outline=false){
  const m=new T.Mesh(geometry,pigment(key));m.position.set(...pos);
  m.userData.watercolorOutline=outline;parent.add(m);return m;
}
function cub(parent,size,key,pos,outline=false){
  return part(parent,new T.BoxGeometry(...size),key,pos,outline);
}
function cyl(parent,rt,rb,height,key,pos,n=12,outline=false){
  return part(parent,new T.CylinderGeometry(rt,rb,height,n,1),key,pos,outline);
}
function orb(parent,scale,key,pos,detail=1,outline=false){
  const m=part(parent,new T.IcosahedronGeometry(1,detail),key,pos,outline);
  m.scale.set(...scale);return m;
}
function line(parent,a,b,r,key){
  const A=new T.Vector3(...a),B=new T.Vector3(...b),delta=B.clone().sub(A);
  const m=cyl(parent,r,r,delta.length(),key,[0,0,0],7);
  m.position.copy(A).add(B).multiplyScalar(.5);
  m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());
  return m;
}
function rockGeometry(seed,rx,rz,drop){
  const rand=rng(seed),count=14;
  const levels=[0,-.11,-.33,-.61,-.92],factor=[.85,1.02,.77,.46,.01];
  const verts=[],idx=[];
  const ripple=Array.from({length:count},(_,i)=>.78+rand()*.36);
  for(let j=0;j<levels.length;j++)for(let i=0;i<count;i++){
    const a=i/count*Math.PI*2;
    const jitter=(rand()-.5)*.10;
    const r=factor[j]*ripple[i]*(1+jitter);
    verts.push(Math.cos(a)*rx*r,levels[j]*drop+(rand()-.5)*drop*.034,
      Math.sin(a)*rz*r);
  }
  for(let j=0;j<levels.length-1;j++)for(let i=0;i<count;i++){
    const next=(i+1)%count,a=j*count+i,b=j*count+next,
      c=(j+1)*count+i,d=(j+1)*count+next;
    idx.push(a,b,c,b,d,c);
  }
  // Irregular top cap is a physical surface.
  const top=verts.length/3;verts.push(0,.07,0);
  for(let i=0;i<count;i++)idx.push(top,(i+1)%count,i);
  const geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));
  geo.setIndex(idx);geo.computeVertexNormals();
  return geo;
}
function floatingIsland(parent,seed,x,top,z,rx,rz,drop){
  const rand=rng(seed),g=new T.Group();g.position.set(x,top,z);parent.add(g);
  part(g,rockGeometry(seed,rx,rz,drop),'rock',[0,0,0],true);
  for(let i=0;i<22;i++){
    const a=rand()*Math.PI*2,d=.55+rand()*.45;
    const px=Math.cos(a)*rx*d,pz=Math.sin(a)*rz*d;
    const y=rand()*.12+.04;
    const stone=orb(g,[.19+rand()*.48,.10+rand()*.28,.18+rand()*.41],
      i%3?'rocklight':'rockshadow',[px,y,pz],0);
    stone.rotation.set(rand(),rand()*6.28,rand());
  }
  for(let i=0;i<19;i++){
    const a=rand()*6.283,rr=(.60+rand()*.39);
    const x0=Math.cos(a)*rx*rr,z0=Math.sin(a)*rz*rr;
    const h=.20+rand()*.55;
    const shrub=orb(g,[.17+rand()*.20,h*.63,.15+rand()*.21],
      i%3?'moss':'fern',[x0,h*.25,z0],1);
    shrub.rotation.set((rand()-.5)*.3,rand()*6.28,(rand()-.5)*.4);
  }
  for(let i=0;i<11;i++){
    const a=rand()*6.283;
    const p=[Math.cos(a)*rx*.84,-.3-rand()*.75,Math.sin(a)*rz*.83];
    const q=[p[0]+(rand()-.5)*.22,p[1]-(.5+rand()*1.8),p[2]+(rand()-.5)*.2];
    line(g,p,q,.013,'moss');
    for(let j=0;j<3;j++){
      const f=j/3;orb(g,[.11,.045,.06],'leaf',
        [p[0]+(q[0]-p[0])*f+.09,p[1]+(q[1]-p[1])*f,p[2]],0);
    }
  }
  return g;
}
function archBlock(parent,spanX,spring,rInner,rOuter,angA,angB,z,depth,key){
  const sh=new T.Shape();
  const steps=5;
  for(let j=0;j<=steps;j++){
    const a=angA+(angB-angA)*j/steps;
    if(j===0)sh.moveTo(rInner*Math.cos(a),rInner*Math.sin(a));
    else sh.lineTo(rInner*Math.cos(a),rInner*Math.sin(a));
  }
  for(let j=steps;j>=0;j--){
    const a=angA+(angB-angA)*j/steps;
    sh.lineTo(rOuter*Math.cos(a),rOuter*Math.sin(a));
  }
  sh.closePath();
  const geo=new T.ExtrudeGeometry(sh,{depth,bevelEnabled:false,curveSegments:8});
  geo.translate(0,0,-depth*.5);
  return part(parent,geo,key,[spanX,spring,z],false);
}
function viaduct(parent,{x=0,y=0,z=0,len=20,spans=5,depth=1.14,
  drop=4.3,yaw=0,lean=0,seed=1}){
  const rand=rng(seed),g=new T.Group();g.position.set(x,y,z);
  g.rotation.y=yaw;g.rotation.z=lean;parent.add(g);
  const sw=len/spans,rad=sw*.44,spring=-rad-.30,base=-drop;
  const pierTop=spring+.13;
  // Every span is a true empty archway: ring voussoirs and vertical piers are 3D solids.
  for(let i=0;i<spans;i++){
    const cx=-len/2+(i+.5)*sw;
    // Smooth inner masonry core, overlaid with individual tapering voussoirs.
    archBlock(g,cx,spring,rad,rad+.25,0,Math.PI,0,depth*.93,'stone');
    for(let j=0;j<11;j++){
      const a=j/11*Math.PI+.010,b=(j+1)/11*Math.PI-.010;
      archBlock(g,cx,spring,rad+.23,rad+.48,a,b,0,depth*1.06,
        j===5?'pale':(j+i)%4===0?'gold':(j+i)%3===0?'ochre':'stone');
    }
    const cap=cub(g,[sw-.06,.23,depth*1.22],'stone',[cx,-.25,0],true);
    cap.rotation.z=(rand()-.5)*.015;
    for(let k=0;k<2;k++){
      cub(g,[sw-.13,.09,depth*1.28],
        k===0?'ochre':'pale',[cx,-.12-k*.31,0],false);
    }
    // Little capstone above the crown.
    const keystone=archBlock(g,cx,spring,rad+.22,rad+.58,Math.PI*.47,Math.PI*.53,0,depth*1.13,'pale');
    keystone.userData.watercolorOutline=false;
  }
  for(let i=0;i<=spans;i++){
    const bx=-len/2+i*sw;
    const h=Math.max(.50,pierTop-base);
    cub(g,[.45,h,depth*.72],'stone',[bx,base+h*.5,0],true);
    for(const side of [-1,1]){
      cub(g,[.19,h*.94,.16],'pale',[bx,base+h*.49,side*depth*.45]);
      cub(g,[.36,.16,.30],'gold',[bx,pierTop-.07,side*depth*.47]);
      // Stacked masonry joint lines give every support its own eroded history.
      for(let j=0;j<3;j++){
        cub(g,[.25,.035,.08],'ochre',[bx,base+h*(j+1)/4,side*depth*.485]);
      }
    }
    cub(g,[.73,.16,depth*.98],'pale',[bx,pierTop,0]);
  }
  // Continuous walkway and low parapet, not a billboard façade.
  cub(g,[len+.92,.18,depth*1.4],'rocklight',[0,.08,0],true);
  cub(g,[len+.84,.10,depth*1.44],'gold',[0,.20,0]);
  for(const side of [-1,1]){
    cub(g,[len+.84,.13,.14],'stone',[0,.29,side*depth*.68],true);
    const n=Math.floor(len/.37);
    const postGeo=new T.BoxGeometry(.10,.43,.115);
    const posts=new T.InstancedMesh(postGeo,pigment('pale'),n+1);
    const dummy=new T.Object3D();
    for(let k=0;k<=n;k++){
      dummy.position.set(-len/2+k*len/n,.53,side*depth*.68);
      dummy.rotation.y=(rand()-.5)*.09;
      dummy.updateMatrix();posts.setMatrixAt(k,dummy.matrix);
    }
    posts.instanceMatrix.needsUpdate=true;
    posts.userData.watercolorOutline=false;posts.userData.watercolorSkipWash=true;
    g.add(posts);
    cub(g,[len+.84,.10,.12],'pale',[0,.78,side*depth*.68]);
  }
  // Cracks, missing balusters, warm moss in masonry crevices.
  for(let i=0;i<15;i++){
    const px=(rand()-.5)*len;
    const zz=rand()<.5?-depth*.57:depth*.57;
    const clump=orb(g,[.11+rand()*.13,.08+rand()*.10,.10+rand()*.09],
      i%3?'moss':'fern',[px,-.28+rand()*.25,zz],0);
    clump.rotation.y=rand()*6.28;
  }
  return g;
}
function tower(parent,x,y,z,seed,scale=1,variant=0){
  const rand=rng(seed),g=new T.Group();
  g.position.set(x,y,z);g.scale.setScalar(scale);parent.add(g);
  const radius=variant===1?1.10:.89;
  const levels=variant===2?2:3;
  const baseH=2.2;
  cyl(g,radius*1.09,radius*1.18,baseH,'stone',[0,baseH*.5,0],10,true);
  for(let k=0;k<levels;k++){
    const cy=2.1+k*1.38;
    cyl(g,radius*.93-k*.045,radius*1.02-k*.045,1.46,
      k%2?'pale':'stone',[0,cy+.54,0],10,true);
    for(let j=0;j<10;j++){
      const a=j*Math.PI/5;
      const cR=radius*1.01-k*.047;
      const col=orb(g,[.105,.81,.105],'rocklight',
        [Math.cos(a)*cR,cy+.45,Math.sin(a)*cR],0);
      col.rotation.y=a;
      // Window opening inset between buttresses (recessed glass, truly on a wall).
      if(j%2===0){
        const wx=Math.cos(a+Math.PI/10)*(cR+.012);
        const wz=Math.sin(a+Math.PI/10)*(cR+.012);
        const w=orb(g,[.10,.25,.15],'windowdark',[wx,cy+.55,wz],1);
        w.rotation.y=-(a+Math.PI/10);
        const glow=orb(g,[.073,.17,.11],'window',
          [wx*1.023,cy+.55,wz*1.023],1);
        glow.rotation.y=w.rotation.y;
      }
    }
    cyl(g,radius*1.22-k*.05,radius*1.22-k*.05,.15,
      k%2?'ochre':'gold',[0,cy+1.29,0],12);
    for(let i=0;i<12;i++){
      const a=i*Math.PI/6;
      orb(g,[.062,.060,.062],'pale',
        [Math.cos(a)*radius*1.12,cy+1.40,Math.sin(a)*radius*1.12],0);
    }
  }
  const roofY=2.1+levels*1.38;
  cyl(g,radius*1.12, radius*1.12,.24,'ochre',[0,roofY-.13,0],12);
  cyl(g,.10,radius*1.24,1.28,'roof',[0,roofY+.63,0],12,true);
  cyl(g,.08,.11,.61,'gold',[0,roofY+1.53,0],8);
  orb(g,[.16,.22,.16],'rooflight',[0,roofY+1.93,0],1);
  for(let j=0;j<12;j++){
    const a=j*Math.PI/6;
    line(g,[Math.cos(a)*radius*1.21,roofY,.0+Math.sin(a)*radius*1.21],
      [Math.cos(a)*.12,roofY+1.25,Math.sin(a)*.12],.023,'rooflight');
  }
  // Exterior balconies with broken ornamentation.
  for(let k=0;k<2;k++){
    const by=1.05+k*2.3;
    const bx=radius*.91;
    cub(g,[radius*2.26,.12,.73],k?'pale':'gold',[0,by,radius*.99]);
    for(let j=0;j<7;j++){
      const px=-bx+j*bx/3;
      cub(g,[.095,.45,.10],'stone',[px,by+.28,radius*1.67],false);
    }
    cub(g,[radius*2.35,.10,.10],'rocklight',[0,by+.55,radius*1.67]);
  }
  for(let i=0;i<15;i++){
    const a=rand()*6.283,rr=radius*(.95+rand()*.25),yy=rand()*4.5;
    const m=orb(g,[.12+rand()*.22,.08+rand()*.17,.10+rand()*.20],
      i%2?'moss':'fern',
      [Math.cos(a)*rr,yy,Math.sin(a)*rr],0);
    m.rotation.z=rand();
  }
  return g;
}
function ruin(parent,x,y,z,seed,scale=1){
  const rand=rng(seed),g=new T.Group();g.position.set(x,y,z);
  g.rotation.y=rand()*Math.PI;g.scale.setScalar(scale);parent.add(g);
  for(let i=0;i<5;i++){
    const a=i*Math.PI*2/5,r=.65+rand()*.25;
    cyl(g,.13,.19,1.2+rand()*2,'stone',
      [Math.cos(a)*r,1.0,Math.sin(a)*r],7);
    cub(g,[.40,.18,.38],'pale',[Math.cos(a)*r,2.20,Math.sin(a)*r]);
  }
  cub(g,[1.9,.22,1.5],'stone',[0,1.9,0]);
  for(let i=0;i<7;i++){
    const a=rand()*6.28,r=rand()*1.2;
    orb(g,[.25,.18,.27],'rockshadow',[Math.cos(a)*r,.15,Math.sin(a)*r],0);
  }
  return g;
}
function cloudTexture(){
  const c=document.createElement('canvas');c.width=c.height=128;
  const ctx=c.getContext('2d');
  const g=ctx.createRadialGradient(64,64,9,64,64,62);
  g.addColorStop(0,'rgba(255,250,242,.65)');
  g.addColorStop(.30,'rgba(245,241,235,.45)');
  g.addColorStop(.7,'rgba(238,231,224,.14)');
  g.addColorStop(1,'rgba(245,239,233,0)');
  ctx.fillStyle=g;ctx.fillRect(0,0,128,128);
  return new T.CanvasTexture(c);
}
function cloud(parent,seed,pos,spread,texture){
  const rand=rng(seed),g=new T.Group();g.position.set(...pos);parent.add(g);
  const softMat=new T.SpriteMaterial({map:texture,color:'#fff7ee',
    transparent:true,opacity:.47,depthWrite:false,depthTest:true});
  const mistMat=new T.MeshLambertMaterial({color:P.cloud,transparent:true,
    opacity:.35,depthWrite:false,flatShading:true});
  for(let i=0;i<11;i++){
    const px=(rand()-.5)*spread,py=(rand()-.5)*.7,pz=(rand()-.5)*spread*.36;
    const puff=new T.Mesh(new T.IcosahedronGeometry(1,1),mistMat);
    puff.scale.set(.55+rand()*.65,.36+rand()*.43,.45+rand()*.61);
    puff.position.set(px,py,pz);puff.userData.watercolorOutline=false;g.add(puff);
  }
  for(let i=0;i<6;i++){
    const s=new T.Sprite(softMat);
    s.scale.set(spread*.55+rand()*spread*.34,1.1+rand()*1.0,1);
    s.position.set((rand()-.5)*spread*.92,(rand()-.5)*.75,
      (rand()-.5)*spread*.42);
    g.add(s);
  }
  return g;
}
function bird(parent,seed,at,scale=.55){
  const rand=rng(seed),bird=new T.Group();bird.position.set(...at);
  bird.scale.setScalar(scale);parent.add(bird);
  const body=orb(bird,[.28,.11,.38],'ink',[0,0,0],1);
  const head=orb(bird,[.13,.11,.14],'ink',[0,.07,.25],1);
  const tail=orb(bird,[.08,.05,.33],'ink',[0,0,-.34],0);
  const wings=[];
  for(const side of [-1,1]){
    const pivot=new T.Group();pivot.position.set(side*.19,.04,.06);
    bird.add(pivot);
    const wing=orb(pivot,[.42,.055,.14],'ink',[side*.40,0,0],1);
    wing.rotation.z=side*.22;
    for(let i=0;i<4;i++){
      const a=i*.19;
      const m=orb(pivot,[.16+i*.03,.026,.058],'ink',
        [side*(.59+i*.12),0,-.17+a],0);
      m.rotation.y=side*(i*.12);
    }
    wings.push(pivot);
  }
  return {bird,wings,seed,turn:rand()*6.28};
}
export function createInkSkyViaduct(seed=73){
  const rand=rng(seed),root=new T.Group();
  root.name='INK · Небесные виадуки · настоящая 3D-архитектура';
  const arches=new T.Group(),islands=new T.Group(),towers=new T.Group();
  const atmosphere=new T.Group();
  root.add(islands,arches,towers,atmosphere);
  floatingIsland(islands,seed+1,-12.5,5.95,-1.8,3.5,2.7,6.45);
  floatingIsland(islands,seed+2,11.4,6.1,-2,3.4,3.0,6.4);
  floatingIsland(islands,seed+3,-8.4,2.95,4.8,2.9,2.35,4.5);
  floatingIsland(islands,seed+4,8.0,3.2,4.0,2.8,2.4,4.8);
  floatingIsland(islands,seed+5,1.5,2.65,-6.2,2.0,1.7,4.4);
  // Three staggered decks, connecting like a ruined sky-city.
  viaduct(arches,{x:-.5,y:10.35,z:-1.8,len:24.6,spans:7,
    drop:5.0,seed:seed+6,depth:1.22});
  viaduct(arches,{x:-.1,y:6.70,z:1.20,len:21.0,spans:6,
    drop:4.2,seed:seed+7,depth:1.08,yaw:.075});
  viaduct(arches,{x:-.1,y:4.35,z:4.65,len:18.1,spans:5,
    drop:3.2,seed:seed+8,depth:1.05,yaw:-.04});
  // Twisting side walks and cross-braces visibly intersect in depth.
  viaduct(arches,{x:-7.0,y:8.2,z:2.45,len:9.2,spans:3,
    drop:3.5,seed:seed+9,depth:.95,yaw:-.75,lean:.043});
  viaduct(arches,{x:6.8,y:8.25,z:1.5,len:9.4,spans:3,
    drop:3.8,seed:seed+10,depth:.92,yaw:.72,lean:-.018});
  // Main citadels and smaller lookout towers.
  tower(towers,-12.25,5.90,-1.8,seed+11,1.00,1);
  tower(towers,11.48,6.03,-2.0,seed+12,1.08,1);
  tower(towers,-8.55,2.91,4.75,seed+13,.78,2);
  tower(towers,8.00,3.18,4.0,seed+14,.78,2);
  tower(towers,1.55,2.67,-6.3,seed+15,.63,2);
  for(const [i,x,y,z,s] of [
    [0,-14.8,6.05,-1.6,.60],[1,-11.7,6.0,-3.25,.48],
    [2,13.5,6.25,-2.8,.59],[3,8.8,3.2,5.2,.44]
  ])tower(towers,x,y,z,seed+26+i,s,2);
  ruin(towers,10.7,6.0,-.3,seed+16,.69);
  ruin(towers,-9.35,2.95,6.2,seed+17,.53);
  // Warm recessed details and shrubs anchor the stone to the cliffs.
  for(let i=0;i<22;i++){
    const x=(rand()-.5)*24,z=(rand()-.5)*7;
    const onBridge=rand()>.35;
    if(!onBridge)continue;
    orb(arches,[.11+rand()*.15,.08+rand()*.15,.12+rand()*.16],
      i%2?'moss':'fern',[x,6.65,z],0);
  }
  // Solid 3D vapor + soft watercolor cloud wash at several depths.
  const texture=cloudTexture();
  const clouds=[
    cloud(atmosphere,seed+31,[-13.1,3.9,3.1],5.1,texture),
    cloud(atmosphere,seed+32,[-4.3,1.8,6.4],5.6,texture),
    cloud(atmosphere,seed+33,[4.1,2.6,6.2],5.3,texture),
    cloud(atmosphere,seed+34,[13.8,4.35,-.2],4.3,texture),
    cloud(atmosphere,seed+35,[1.4,8.05,-5.0],3.6,texture),
    cloud(atmosphere,seed+36,[-18.8,9.15,-5.8],3.2,texture),
    cloud(atmosphere,seed+37,[17.0,9.7,-5.7],3.4,texture)
  ];
  const birds=[];
  for(let i=0;i<12;i++)birds.push(bird(atmosphere,seed+i*7+80,
    [(rand()-.5)*30,8.5+rand()*7,(rand()-.5)*13],.21+rand()*.19));
  root.userData.isSkyViaduct=true;
  root.userData.footprint=14;
  root.userData.counts={bridges:5,archSpans:24,islands:5,towers:9,birds:birds.length,clouds:clouds.length};
  root.userData.tick=(t,dt)=>{
    clouds.forEach((g,i)=>{
      g.position.x+=dt*(.07+.023*(i%3));
      if(g.position.x>20)g.position.x=-21;
      g.position.y+=Math.sin(t*.19+i*.7)*dt*.022;
    });
    birds.forEach(({bird,wings,turn},i)=>{
      const angle=t*(.19+.025*(i%4))+turn;
      bird.position.x=Math.cos(angle)*(11.2+i*.12);
      bird.position.z=Math.sin(angle)*(7.0+(i%3)*1.0);
      bird.position.y=10.0+(i%5)*.72+Math.sin(t*.40+i)*.35;
      bird.rotation.y=-angle-Math.PI/2;
      wings[0].rotation.z=.12+.44*Math.sin(t*7.1+i);
      wings[1].rotation.z=-.12-.44*Math.sin(t*7.1+i);
    });
  };
  root.userData.tick(0,0);
  return root;
}
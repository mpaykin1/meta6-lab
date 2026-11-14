import * as T from 'three';

// INK · watercolor steam locomotive. Real 3D geometry, articulated running gear,
// procedural copper patina and independently moving steam, not a sprite or GIF.
const palettes={
  iron:'#55535b', slate:'#797078', purple:'#766975', charcoal:'#45464c',
  edge:'#3f4349', rust:'#a67966', copper:'#b98975', copperLight:'#c9a18c',
  cream:'#cbbbaa', brass:'#bba17a', wheel:'#77727a',
  wood:'#85706e', roof:'#8c8085', gold:'#f6c985', glass:'#f2d6a5',
  steam:'#e7dfd8', steamShadow:'#b6b1b4', sleeper:'#8e7e72'
};
const materialCache=new Map();
let metalTexture=null;
function random(seed){let x=(seed|0)||147;return()=>((x=(Math.imul(x,1664525)+1013904223)|0)>>>0)/4294967296;}
function patina(){
  if(metalTexture)return metalTexture;
  const c=document.createElement('canvas');c.width=c.height=256;
  const ctx=c.getContext('2d'),rnd=random(172911);
  ctx.fillStyle='#e4d7ce';ctx.fillRect(0,0,256,256);
  const tones=['#8c6663','#ba9e91','#ece3d7','#6f7881','#c9aba2','#d8b8a7'];
  for(let i=0;i<900;i++){
    const x=rnd()*256,y=rnd()*256,r=.5+Math.pow(rnd(),2.2)*22;
    ctx.fillStyle=tones[Math.floor(rnd()*tones.length)];
    ctx.globalAlpha=.035+rnd()*.27;
    ctx.beginPath();ctx.ellipse(x,y,r,r*(.25+rnd()*.6),rnd()*6.28,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;
  for(let i=0;i<140;i++){const x=rnd()*256,y=rnd()*256;
    ctx.fillStyle='#77727b';ctx.globalAlpha=.07+rnd()*.16;
    ctx.fillRect(x,y,.8+rnd()*2,.5+rnd()*1.5);
  }
  ctx.globalAlpha=1;
  metalTexture=new T.CanvasTexture(c);metalTexture.colorSpace=T.SRGBColorSpace;
  metalTexture.wrapS=metalTexture.wrapT=T.RepeatWrapping;
  return metalTexture;
}
function pigment(key){
  if(!materialCache.has(key)){
    const bright=key==='gold'||key==='glass';
    const m=new T.MeshStandardMaterial({
      color:palettes[key]||key,roughness:1,metalness:0,
      flatShading:true,map:bright?null:patina()
    });
    if(bright){m.emissive=new T.Color(palettes[key]);m.emissiveIntensity=key==='gold'?.58:.28;}
    materialCache.set(key,m);
  }
  return materialCache.get(key);
}
function add(parent,geo,key,p=[0,0,0],outline=true){
  const m=new T.Mesh(geo,pigment(key));m.position.set(...p);
  m.userData.watercolorOutline=outline;parent.add(m);return m;
}
function box(parent,xyz,key,p,outline=true){
  return add(parent,new T.BoxGeometry(...xyz),key,p,outline);
}
function sph(parent,xyz,key,p,outline=true,detail=1){
  const m=add(parent,new T.IcosahedronGeometry(1,detail),key,p,outline);
  m.scale.set(...xyz);return m;
}
function cyl(parent,rt,rb,height,n,key,p,rot=[0,0,0],outline=true){
  const m=add(parent,new T.CylinderGeometry(rt,rb,height,n,1),key,p,outline);
  m.rotation.set(...rot);return m;
}
function ring(parent,r,t,key,p,rot=[0,0,0],outline=false){
  const m=add(parent,new T.TorusGeometry(r,t,5,28),key,p,outline);
  m.rotation.set(...rot);return m;
}
function connect(parent,a,b,width,key){
  const start=new T.Vector3(...a),end=new T.Vector3(...b),v=end.clone().sub(start);
  const m=add(parent,new T.CylinderGeometry(width*.8,width,v.length(),7),key,[0,0,0],false);
  m.position.copy(start).add(end).multiplyScalar(.5);
  m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return m;
}
function rivet(parent,p,r=.035){
  sph(parent,[r,r,r],'brass',p,false,0);
}
function locomotiveWheel(parent,x,z,r,collection){
  const pivot=new T.Group();pivot.position.set(x,r+.17,z);parent.add(pivot);
  const wheel=new T.Group();pivot.add(wheel);
  cyl(wheel,r,r,.17,22,'wheel',[0,0,0],[Math.PI/2,0,0]);
  cyl(wheel,r*.77,r*.77,.20,24,'charcoal',[0,0,z>0?.105:-.105],[Math.PI/2,0,0],false);
  ring(wheel,r*.89,.058,'copperLight',[0,0,z>0?.130:-.13]);
  ring(wheel,r*.60,.023,'rust',[0,0,z>0?.141:-.141],undefined,false);
  for(let i=0;i<10;i++){
    const a=i*Math.PI/5;
    const bar=box(wheel,[.060,r*.69,.075],'copperLight',[Math.sin(a)*r*.36,Math.cos(a)*r*.36,z>0?.18:-.18],false);
    bar.rotation.z=-a;
  }
  cyl(wheel,.13,.13,.23,14,'brass',[0,0,z>0?.21:-.21],[Math.PI/2,0,0],false);
  sph(wheel,[.075,.075,.05],'edge',[r*.44,0,z>0?.28:-.28],false);
  collection.push({mesh:wheel,r,x,z});
  return pivot;
}
function runningGear(parent,wheels,rods,front,back,r,z){
  const centers=[];for(let x=front;x<=back+.001;x+=(back-front)/2){
    locomotiveWheel(parent,x,z,r,wheels);centers.push(x);
  }
  const rod=box(parent,[back-front+.38,.11,.095],'copperLight',[(front+back)/2,r+.18+r*.4,z+(z>0?.28:-.28)],false);
  rods.push({rod,centerY:r+.17,r,side:z>0?1:-1,phase:0});
  for(let i=0;i<3;i++){
    const x=front+i*(back-front)/2;
    cyl(parent,.11,.11,.09,10,'rust',[x,r+.17,z], [Math.PI/2,0,0],false);
  }
}
function boilerRib(parent,x){
  ring(parent,.83,.054,'brass',[x,1.87,0],[0,Math.PI/2,0],false);
  for(let i=0;i<12;i++){
    const a=i*Math.PI/6;
    rivet(parent,[x-.06,1.87+Math.sin(a)*.81,Math.cos(a)*.81],.022);
  }
}
function archedRoof(parent,x,y,z,length,width){
  for(let k=0;k<8;k++){
    const h=(k-3.5)/3.5;
    const o=box(parent,[length,.095,width/8+.01],k%3===0?'copper':'roof',[x,y+.16*(1-h*h),z+h*width*.445],false);
    o.rotation.x=-h*.22;
  }
  for(const side of [-1,1]){
    box(parent,[length+.10,.07,.06],'edge',[x,y-.035,z+side*width*.52],false);
  }
}
function windows(parent,start,length,z,y,count,height=.58){
  for(let i=0;i<count;i++){
    const x=start-length/2+(i+.5)*length/count;
    box(parent,[length/count*.60,height,.045],'brass',[x,y,z],false);
    box(parent,[length/count*.49,height*.84,.053],'glass',[x,y,z+(z>0?.029:-.029)],false);
    box(parent,[.035,height*.89,.062],'copper',[x,y,z+(z>0?.068:-.068)],false);
    box(parent,[length/count*.53,.037,.059],'edge',[x,y+height*.40,z+(z>0?.06:-.06)],false);
    box(parent,[length/count*.53,.037,.059],'edge',[x,y-height*.40,z+(z>0?.06:-.06)],false);
    rivet(parent,[x-length/count*.26,y-height*.45,z+(z>0?.055:-.055)],.027);
    rivet(parent,[x+length/count*.26,y-height*.45,z+(z>0?.055:-.055)],.027);
  }
}
function makeCoach(parent,center,seed,wheels){
  const g=new T.Group();g.position.x=center;parent.add(g);
  const rnd=random(seed);
  box(g,[3.10,.27,1.61],'charcoal',[0,.47,0]);
  box(g,[3.05,1.50,1.54],'slate',[0,1.54,0]);
  box(g,[2.96,.12,1.72],'copper',[0,.95,0]);
  box(g,[3.04,.17,1.67],'copper', [0,2.30,0],false);
  archedRoof(g,0,2.48,0,3.34,1.74);
  for(const side of [-1,1]){
    const z=side*.794;
    windows(g,0,2.68,side*.82,1.70,5,.69);
    box(g,[2.9,.07,.08],'rust',[0,1.15,side*.84],false);
    box(g,[3.0,.065,.08],'brass',[0,.90,side*.84],false);
    for(let j=0;j<15;j++){
      const x=-1.44+j*.205;
      box(g,[.022,.18,.07],'edge',[x,1.02,side*.855],false);
    }
    for(const x of [-1.18,1.18]){
      rivet(g,[x,2.23,z+side*.08],.033);
    }
  }
  for(const x of [-1.58,1.58]){
    box(g,[.11,1.47,1.64],'charcoal',[x,1.60,0]);
    box(g,[.25,.14,1.88],'charcoal',[x,.55,0]);
  }
  for(const x of [-.89,.89])for(const side of [-1,1]){
    locomotiveWheel(g,x,side*.93,.38,wheels); // independently rotating coach bogies
    box(g,[.93,.20,.11],'edge',[x,.53,side*1.00],false);
  }
  for(const x of [-1.55,1.55]){
    cyl(g,.13,.13,.19,9,'edge',[x,.42,0],[0,0,Math.PI/2],false);
  }
  for(let i=0;i<8;i++){
    const x=-1.42+i*.405;
    rivet(g,[x,2.45,.82],.022);
  }
  g.rotation.y=(rnd()-.5)*.012;
  return g;
}
function smokeMaterial(){
  return new T.MeshLambertMaterial({color:palettes.steam,transparent:true,opacity:.25,
    depthWrite:false,flatShading:true});
}
export function createInkSteamTrain(seed=17){
  const rnd=random(seed),root=new T.Group();root.name='INK · Акварельный паровоз';
  const locomotive=new T.Group();root.add(locomotive);
  const bogie=new T.Group();locomotive.add(bogie);
  box(bogie,[4.8,.31,1.57],'charcoal',[-1.50,.61,0],false);
  box(bogie,[4.52,.18,1.75],'rust',[-1.45,.90,0]);
  box(bogie,[4.25,.23,1.58],'iron',[-1.55,.97,0],false);
  const wheels=[],rods=[];
  for(const side of [-1,1]){
    runningGear(locomotive,wheels,rods,-3.04,-1.09,.52,side*.92);
    locomotiveWheel(locomotive,-3.77,side*.80,.29,wheels);
    for(let i=0;i<4;i++)box(locomotive,[.12,.24,.12],'rust',[-3.72+i*.18,.70,side*.78],false);
  }
  // Continuous boiler cylinder is a physical solid with metallic pressure bands.
  cyl(locomotive,.80,.80,2.89,22,'slate',[-2.03,1.87,0],[0,0,Math.PI/2]);
  cyl(locomotive,.73,.73,2.95,22,'iron',[-2.03,1.87,0],[0,0,Math.PI/2],false);
  for(const x of [-3.19,-2.60,-1.95,-1.25,-.75])boilerRib(locomotive,x);
  cyl(locomotive,.82,.82,.23,24,'charcoal',[-3.56,1.87,0],[0,0,Math.PI/2]);
  cyl(locomotive,.69,.69,.14,24,'copper',[-3.69,1.87,0],[0,0,Math.PI/2]);
  ring(locomotive,.68,.045,'edge',[-3.77,1.87,0],[0,Math.PI/2,0]);
  for(let i=0;i<18;i++){const a=i*Math.PI/9;
    rivet(locomotive,[-3.79,1.87+Math.sin(a)*.74,Math.cos(a)*.74],.040);
  }
  // Oil lamp, warm eye, and the old front hatch hinge.
  cyl(locomotive,.23,.24,.13,16,'brass',[-3.85,1.88,0],[0,0,Math.PI/2]);
  sph(locomotive,[.12,.205,.205],'gold',[-3.94,1.88,0],false,2);
  ring(locomotive,.225,.028,'brass',[-3.89,1.88,0],[0,Math.PI/2,0],false);
  box(locomotive,[.13,.29,.09],'edge',[-3.82,1.41,.39]);
  cyl(locomotive,.11,.11,.16,12,'brass',[-3.84,1.21,0],[0,0,Math.PI/2]);
  // Tall copper stack and pinched trumpet rim.
  cyl(locomotive,.23,.29,.49,12,'rust',[-2.95,2.77,0]);
  cyl(locomotive,.33,.22,.56,12,'copper',[-2.95,3.18,0]);
  cyl(locomotive,.36,.41,.14,16,'brass',[-2.95,3.50,0]);
  cyl(locomotive,.29,.29,.035,16,'charcoal',[-2.95,3.59,0],false);
  ring(locomotive,.325,.038,'edge',[-2.95,3.58,0],[Math.PI/2,0,0],false);
  // Brass steam dome, smaller sand dome and longitudinal iron pipes.
  cyl(locomotive,.26,.30,.36,14,'copper',[-1.67,2.72,0]);
  sph(locomotive,[.30,.18,.30],'copperLight',[-1.67,2.91,0]);
  cyl(locomotive,.21,.26,.26,13,'copper',[-1.04,2.72,0]);
  sph(locomotive,[.235,.15,.23],'brass',[-1.04,2.88,0]);
  for(const side of [-1,1]){
    connect(locomotive,[-3.38,2.31,side*.63],[-.59,2.33,side*.63],.038,'brass');
    for(let i=0;i<5;i++)box(locomotive,[.035,.14,.10],'rust',[-3.14+i*.57,2.3,side*.64],false);
    cyl(locomotive,.18,.18,.80,12,'charcoal',[-3.13,1.08,side*.74],[0,0,Math.PI/2]);
    connect(locomotive,[-3.34,1.10,side*.79],[-2.65,1.10,side*.79],.09,'copper');
    connect(locomotive,[-1.27,.98,side*.76],[-.68,1.70,side*.82],.052,'brass');
  }
  // Driver cab: real glazing, deep jambs, curved timber roof.
  box(locomotive,[1.43,1.59,1.66],'charcoal',[.13,2.11,0]);
  box(locomotive,[1.34,1.47,1.72],'slate',[.13,2.12,0]);
  for(const side of [-1,1]){
    windows(locomotive,.13,1.20,side*.875,2.25,2,.73);
    box(locomotive,[.14,.70,.09],'copper',[.53,1.65,side*.91],false);
    for(let k=0;k<6;k++)rivet(locomotive,[-.50+k*.24,1.35,side*.915],.029);
  }
  windows(locomotive,.13,1.09,-.91,2.24,2,.58);
  archedRoof(locomotive,.10,3.02,0,1.75,1.80);
  for(const x of [-.53,.74])for(const z of [-.83,.83])
    connect(locomotive,[x,1.18,z],[x,.91,z],.061,'charcoal');
  box(locomotive,[1.56,.13,1.91],'rust',[.12,1.27,0]);
  // Cowcatcher: slanted iron pickets, not a triangular picture.
  for(let i=0;i<11;i++){
    const z=(i-5)*.195,frontZ=z*1.24;
    connect(locomotive,[-4.20,.80,z*.66],[-4.92,.15,frontZ],.052,'rust');
    box(locomotive,[.08,.17,.12],'edge',[-4.9,.16,frontZ],false);
  }
  box(locomotive,[.17,.12,2.48],'brass',[-4.89,.18,0],false);
  box(locomotive,[.11,.23,1.38],'edge',[-4.13,.73,0]);
  for(let j=0;j<8;j++)rivet(locomotive,[-4.91,.23,(j-3.5)*.31],.027);
  // A riveted tender between cab and first illuminated passenger carriage.
  const tender=new T.Group();tender.position.x=2.13;root.add(tender);
  box(tender,[2.08,.26,1.65],'charcoal',[0,.56,0]);
  box(tender,[2.00,.93,1.55],'slate',[0,1.26,0]);
  for(const side of [-1,1]){
    box(tender,[1.88,.18,.10],'rust',[0,1.73,side*.78],false);
    box(tender,[1.88,.075,.10],'brass',[0,.95,side*.80],false);
    for(let i=0;i<9;i++)rivet(tender,[-.85+i*.21,1.36,side*.81],.024);
    for(const x of [-.57,.57])locomotiveWheel(tender,x,side*.90,.35,wheels);
  }
  // Lumps of coal are independent jagged volumes.
  for(let i=0;i<18;i++){
    const x=(rnd()-.5)*1.65,z=(rnd()-.5)*1.15;
    const coal=sph(tender,[.15+rnd()*.12,.12+rnd()*.16,.17+rnd()*.17],
      i%4?'charcoal':'iron',[x,1.82+rnd()*.08,z],false,0);
    coal.rotation.set(rnd(),rnd()*3,rnd());
  }
  // Coupled passenger coaches behind the engine.
  const coach1=makeCoach(root,5.14,seed+39,wheels);
  const coach2=makeCoach(root,8.52,seed+74,wheels);
  for(const [a,b] of [[.85,1.15],[3.21,3.61],[6.72,6.95]]){
    connect(root,[a,.44,0],[b,.44,0],.087,'charcoal');
    sph(root,[.17,.13,.18],'edge',[(a+b)*.5,.43,0],false,1);
  }
  for(const p of [3.36,6.82]){
    box(root,[.48,.065,1.10],'rust',[p,.57,0],false);
  }
  // Soft 3D smoke volumes are independent effects, never the shape of the train.
  const smoke=new T.Group();locomotive.add(smoke);
  const steamMat=smokeMaterial(),smokeItems=[];
  const smokeGeo=new T.IcosahedronGeometry(1,1);
  for(let i=0;i<28;i++){
    const puff=new T.Mesh(smokeGeo,steamMat.clone());smoke.add(puff);
    puff.userData.watercolorOutline=false;puff.userData.watercolorSkipWash=true;
    smokeItems.push({puff,index:i,speed:.5+rnd()*.5,x:rnd(),z:rnd()});
  }
  for(let i=0;i<12;i++){
    const puff=new T.Mesh(smokeGeo,steamMat.clone());locomotive.add(puff);
    puff.userData.watercolorOutline=false;puff.userData.watercolorSkipWash=true;
    smokeItems.push({puff,index:i+28,speed:.8+rnd()*.4,x:rnd(),z:rnd()});
  }
  root.userData.wheelCount=wheels.length;
  root.userData.footprint=5.0;
  root.userData.isSteamTrain=true;
  root.userData.motion={running:true,speed:.72};
  root.userData.tick=(t,dt)=>{
    const spin=-t*root.userData.motion.speed*1.8;
    for(const w of wheels)w.mesh.rotation.z=spin/(w.r*.82);
    for(const v of rods){
      const phase=spin/(v.r*.82);
      v.rod.position.y=v.centerY+v.r*.40*Math.sin(phase);
      v.rod.rotation.z=.055*Math.cos(phase);
    }
    locomotive.position.y=.009*Math.sin(t*7.1);
    coach1.position.y=.006*Math.sin(t*6.5-.5);
    coach2.position.y=.005*Math.sin(t*6.3-1.3);
    tender.position.y=.006*Math.sin(t*7.2-.8);
    for(const s of smokeItems){
      const lower=s.index>=28;
      const f=(t*(lower?.40:.21)*s.speed+s.index*(lower?.117:.071))%1;
      const scale=lower?.11+.31*f:.17+.67*f;
      s.puff.scale.set(scale*1.22,scale*(.9+f),scale);
      if(lower){
        s.puff.position.set(-2.85+f*.75,-.02+f*.74,
          (s.index%2?1:-1)*(.82+f*.66));
      }else{
        s.puff.position.set(-2.95+f*(.84+s.x*.65)+Math.sin(t*.4+s.index)*.10,
          3.59+f*3.05,Math.sin(f*8+s.z*9)*(.13+f*.44));
      }
      s.puff.material.opacity=Math.max(.005,(lower?.23:.30)*Math.sin(Math.PI*f));
      s.puff.rotation.y=t*.15+s.index;
    }
  };
  root.userData.tick(0,0);
  return root;
}

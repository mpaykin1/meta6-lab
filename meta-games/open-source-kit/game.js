(async function () {
'use strict';
const stage=document.getElementById('stage');
const menu=document.getElementById('menu'), panel=document.getElementById('panel');
menu.onclick=()=>{panel.hidden=!panel.hidden;};
document.getElementById('close').onclick=()=>{panel.hidden=true;};
const base=new URL('../../games/broken-city/lib/three.module.js',document.baseURI).href;
let THREE;
try{THREE=await import(base);}catch(err){stage.textContent='WebGL-модуль недоступен';stage.dataset.error='three-import';console.error(err);return;}
if(typeof noise==='undefined'||typeof EasyStar==='undefined'||typeof Howl==='undefined'||typeof JoyStick==='undefined'){stage.textContent='Не загружены локальные модули';stage.dataset.error='vendor';return;}
noise.seed(Math.random());
const random=(()=>{let s=(Date.now()^Math.floor(Math.random()*4294967295))>>>0;return()=>{s=(s+0x6D2B79F5)>>>0;let t=Math.imul(s^(s>>>15),1|s);t^=t+Math.imul(t^(t>>>7),61|t);return((t^(t>>>14))>>>0)/4294967296;};})();
const rnd=(a,b)=>a+(b-a)*random();
const height=(x,z)=>2.7+noise.simplex2(x*.072,z*.072)*2.25+noise.perlin2(x*.22,z*.22)*.4-Math.max(0,Math.hypot(x,z)-23)**2*.31;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x050a16);scene.fog=new THREE.FogExp2(0x07101b,.026);
let renderer;try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});}catch(e){stage.textContent='Для сцены необходим WebGL';return;}
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.65));renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.28;stage.appendChild(renderer.domElement);
const camera=new THREE.PerspectiveCamera(61,innerWidth/innerHeight,.1,400);
const hemi=new THREE.HemisphereLight(0x5bd4da,0x15182b,1.7);scene.add(hemi);
const moon=new THREE.DirectionalLight(0xc1e8ff,2.1);moon.position.set(-16,28,-12);scene.add(moon);
const sky=new THREE.Mesh(new THREE.SphereGeometry(175,32,20),new THREE.ShaderMaterial({
side:THREE.BackSide,depthWrite:false,uniforms:{uTime:{value:0}},
vertexShader:'varying vec3 vDir; void main(){vDir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
fragmentShader:'uniform float uTime;varying vec3 vDir;void main(){vec3 d=normalize(vDir);float h=smoothstep(-.2,.8,d.y);vec3 c=mix(vec3(.017,.045,.074),vec3(.003,.007,.023),h);float w=sin(d.x*27.+sin(d.z*16.+uTime*.12)*2.+uTime*.15);float a=pow(max(0.,w),7.)*smoothstep(.04,.42,d.y)*(.32+.1*sin(uTime*.2));c+=vec3(.06,.59,.42)*a;float stars=step(.9996,fract(sin(dot(floor(d.xz*170.),vec2(127.1,311.7)))*43758.5453));c+=vec3(.58,.88,1.)*stars*.55*smoothstep(.1,.45,d.y);gl_FragColor=vec4(c,1.);}'
}));scene.add(sky);
const water=new THREE.Mesh(new THREE.CircleGeometry(150,80),new THREE.MeshPhongMaterial({color:0x072236,emissive:0x031925,shininess:96,transparent:true,opacity:.95}));water.rotation.x=-Math.PI/2;water.position.y=-9.5;scene.add(water);
const groundGeo=new THREE.PlaneGeometry(78,78,98,98);groundGeo.rotateX(-Math.PI/2);const gp=groundGeo.attributes.position, cols=[];
const colLow=new THREE.Color(0x203d48),colHigh=new THREE.Color(0x2a665f),colRock=new THREE.Color(0x14232f);
for(let i=0;i<gp.count;i++){let x=gp.getX(i),z=gp.getZ(i),y=height(x,z);gp.setY(i,y);
const c=(y<0?colRock:colLow.clone().lerp(colHigh,THREE.MathUtils.clamp((y+1)/7,0,1)));
cols.push(c.r,c.g,c.b);}
groundGeo.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));groundGeo.computeVertexNormals();
const terrain=new THREE.Mesh(groundGeo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95,metalness:.04,flatShading:true,side:THREE.DoubleSide}));scene.add(terrain);
const gravel=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),new THREE.MeshStandardMaterial({color:0x374c50,roughness:1,flatShading:true}),145);
const matrix=new THREE.Matrix4(),rot=new THREE.Quaternion(),scl=new THREE.Vector3(),pos=new THREE.Vector3();let count=0;const obstacles=[];
for(let i=0;i<250&&count<145;i++){const a=rnd(0,Math.PI*2),r=Math.sqrt(random())*28,x=Math.cos(a)*r,z=Math.sin(a)*r;if(r<4||height(x,z)<-1)continue;const s=rnd(.16,.68);pos.set(x,height(x,z)+s*.3,z);rot.setFromAxisAngle(new THREE.Vector3(0,1,0),rnd(0,6.28));scl.set(s,s*rnd(.5,1.5),s);matrix.compose(pos,rot,scl);gravel.setMatrixAt(count++,matrix);if(s>.43&&r<20)obstacles.push({x,z,r:s*1.35});}
gravel.count=count;gravel.instanceMatrix.needsUpdate=true;scene.add(gravel);
const grass=new THREE.InstancedMesh(new THREE.ConeGeometry(.085,.7,3),new THREE.MeshStandardMaterial({color:0x3b7773,roughness:1,side:THREE.DoubleSide}),420);
count=0;for(let i=0;i<760&&count<420;i++){const x=rnd(-23,23),z=rnd(-23,23);if(Math.hypot(x,z)>22||height(x,z)<.2)continue;pos.set(x,height(x,z)+.16,z);rot.setFromAxisAngle(new THREE.Vector3(0,1,0),rnd(0,6.28));scl.set(rnd(.5,1.4),rnd(.6,1.6),rnd(.5,1.4));matrix.compose(pos,rot,scl);grass.setMatrixAt(count++,matrix);}grass.count=count;grass.instanceMatrix.needsUpdate=true;scene.add(grass);
const crystalGeo=new THREE.OctahedronGeometry(.72,0);
const beacons=[],targets=[[-13,-10],[11,-13],[16,7],[-10,15],[2,19]];
for(let i=0;i<targets.length;i++){const [x,z]=targets[i],g=new THREE.Group();g.position.set(x,height(x,z)+1.4,z);
const crystal=new THREE.Mesh(crystalGeo,new THREE.MeshStandardMaterial({color:0xb0ffec,emissive:0x2cffba,emissiveIntensity:2.1,metalness:.5,roughness:.16,flatShading:true}));g.add(crystal);
const ring=new THREE.Mesh(new THREE.TorusGeometry(1.14,.035,6,64),new THREE.MeshBasicMaterial({color:0x7bffe0,transparent:true,opacity:.77}));ring.rotation.x=-Math.PI/2;g.add(ring);scene.add(g);beacons.push({x,z,g,crystal,ring,done:false,phase:i*1.6});}
const player=new THREE.Group();
const core=new THREE.Mesh(new THREE.IcosahedronGeometry(.68,1),new THREE.MeshStandardMaterial({color:0xa7caff,emissive:0x416eff,emissiveIntensity:1.8,metalness:.75,roughness:.18,flatShading:true}));player.add(core);
const halo=new THREE.Mesh(new THREE.TorusGeometry(.95,.055,8,58),new THREE.MeshBasicMaterial({color:0x75bfff}));halo.rotation.x=Math.PI/2.7;player.add(halo);
player.add(new THREE.PointLight(0x4eb9ff,4.5,13));scene.add(player);
const moteN=650,motePos=new Float32Array(moteN*3);
for(let i=0;i<moteN;i++){const r=rnd(4,65),a=rnd(0,Math.PI*2);motePos[i*3]=Math.cos(a)*r;motePos[i*3+1]=rnd(2,23);motePos[i*3+2]=Math.sin(a)*r;}
const motesGeo=new THREE.BufferGeometry();motesGeo.setAttribute('position',new THREE.BufferAttribute(motePos,3));
const motes=new THREE.Points(motesGeo,new THREE.PointsMaterial({color:0x76ffee,size:.11,transparent:true,opacity:.58,depthWrite:false,blending:THREE.AdditiveBlending}));scene.add(motes);
const route=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0x70ffdc,transparent:true,opacity:.57,depthWrite:false}));scene.add(route);
const waypoint=new THREE.Mesh(new THREE.SphereGeometry(.20,12,8),new THREE.MeshBasicMaterial({color:0xeaffd1}));scene.add(waypoint);
const gridSize=33,step=1.5,origin=-24;
const grid=Array.from({length:gridSize},(_,iz)=>Array.from({length:gridSize},(_,ix)=>{const x=origin+ix*step,z=origin+iz*step;return Math.hypot(x,z)<23&&height(x,z)>-.5&&!obstacles.some(o=>Math.hypot(x-o.x,z-o.z)<o.r+0.65)?0:1;}));
const astar=new EasyStar.js();astar.setGrid(grid);astar.setAcceptableTiles([0]);astar.enableDiagonals();astar.setIterationsPerCalculation(1800);
const xy=v=>THREE.MathUtils.clamp(Math.round((v-origin)/step),0,gridSize-1);
let pathPoints=[],selected=-1,routeFrom='',routeClock=0;
function findRoute(x,z){
let n=-1,dist=Infinity;for(let i=0;i<beacons.length;i++){if(beacons[i].done)continue;const b=beacons[i],d=Math.hypot(x-b.x,z-b.z);if(d<dist){dist=d;n=i;}}
if(n<0){route.visible=false;waypoint.visible=false;return;}
selected=n;route.visible=true;waypoint.visible=true;const b=beacons[n];const sx=xy(x),sz=xy(z),tx=xy(b.x),tz=xy(b.z);
grid[sz][sx]=0;grid[tz][tx]=0;astar.setGrid(grid);
astar.findPath(sx,sz,tx,tz,p=>{if(selected!==n)return;const pts=(p||[]).map(t=>{const px=origin+t.x*step,pz=origin+t.y*step;return new THREE.Vector3(px,height(px,pz)+.48,pz);});pts.unshift(new THREE.Vector3(x,height(x,z)+.45,z));pts.push(new THREE.Vector3(b.x,height(b.x,b.z)+.45,b.z));pathPoints=pts;route.geometry.dispose();route.geometry=new THREE.BufferGeometry().setFromPoints(pts);});
routeFrom=sx+':'+sz+':'+n;
}
const input={x:0,z:0};const keys=new Set();
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();keys.add(k);unlock();});
addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
if(matchMedia('(pointer:coarse)').matches){new JoyStick('joy',{width:118,height:118,externalStrokeColor:'#75ffd9',internalFillColor:'#34c9ae',internalStrokeColor:'#c1fff4',externalLineWidth:2,internalLineWidth:2},s=>{input.x=Number(s.x||0)/100;input.z=-Number(s.y||0)/100;});document.getElementById('joy').addEventListener('touchstart',unlock,{passive:true});}
function wav(hz){const rate=11025,len=Math.floor(rate*.43),buf=new ArrayBuffer(44+len*2),v=new DataView(buf);
function str(o,s){for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));}str(0,'RIFF');v.setUint32(4,36+len*2,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,len*2,true);
for(let i=0;i<len;i++){const t=i/rate,env=Math.pow(1-i/len,2.4),s=(Math.sin(2*Math.PI*hz*t)+.45*Math.sin(2*Math.PI*hz*1.5*t))*env*.3;v.setInt16(44+i*2,Math.max(-32768,Math.min(32767,s*32767)),true);}
let bytes='';const a=new Uint8Array(buf);for(let i=0;i<a.length;i++)bytes+=String.fromCharCode(a[i]);return 'data:audio/wav;base64,'+btoa(bytes);}
const chime=new Howl({src:[wav(523.25)],format:['wav'],volume:.18});let soundUnlocked=false;
function unlock(){if(soundUnlocked)return;soundUnlocked=true;if(window.Howler&&Howler.ctx&&Howler.ctx.state==='suspended')Howler.ctx.resume();}
function gainBeacon(b){b.done=true;b.crystal.material.emissiveIntensity=.15;b.ring.material.opacity=.13;Howler.pos(player.position.x,0,player.position.z);const soundId=chime.play();chime.pos(b.x,0,b.z,soundId);selected=-1;routeFrom='';findRoute(player.position.x,player.position.z);}
const tmp=new THREE.Vector3(),look=new THREE.Vector3();let previous=performance.now(),elapsed=0;
function tick(now){requestAnimationFrame(tick);const dt=Math.min((now-previous)/1000,.04);previous=now;elapsed+=dt;sky.material.uniforms.uTime.value=elapsed;water.material.color.setHSL(.56,.46+.02*Math.sin(elapsed*.3),.11);
let dx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+input.x;
let dz=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0)+input.z;
const mag=Math.hypot(dx,dz);if(mag>.08){dx/=Math.max(1,mag);dz/=Math.max(1,mag);const x=player.position.x+dx*dt*7,z=player.position.z+dz*dt*7;
if(Math.hypot(x,z)<22.7&&!obstacles.some(o=>Math.hypot(x-o.x,z-o.z)<o.r+.66)){player.position.x=x;player.position.z=z;}
player.rotation.y+=dt*1.9;}
player.position.y=height(player.position.x,player.position.z)+1.2+Math.sin(elapsed*3.1)*.14;
core.rotation.x+=dt*.42;core.rotation.y+=dt*.9;halo.rotation.y+=dt*.65;
for(const b of beacons){b.g.position.y=height(b.x,b.z)+1.5+Math.sin(elapsed*1.8+b.phase)*.21;b.crystal.rotation.y+=dt*.45;b.ring.rotation.z+=dt*.22;if(!b.done&&Math.hypot(player.position.x-b.x,player.position.z-b.z)<1.8)gainBeacon(b);}
routeClock+=dt;if(routeClock>.9){routeClock=0;const key=xy(player.position.x)+':'+xy(player.position.z)+':'+selected;if(key!==routeFrom)findRoute(player.position.x,player.position.z);}
astar.calculate();
if(pathPoints.length&&waypoint.visible){const idx=((Math.floor(elapsed*4)%pathPoints.length)+pathPoints.length)%pathPoints.length;const p=pathPoints[idx]||pathPoints[0];if(p){waypoint.position.copy(p);waypoint.position.y+=.27+Math.sin(elapsed*5)*.1;}}
motes.rotation.y+=dt*.002;water.rotation.z+=dt*.001;
tmp.set(player.position.x,player.position.y+11.7,player.position.z+19);camera.position.lerp(tmp,1-Math.exp(-dt*2.3));look.set(player.position.x,player.position.y+.4,player.position.z-3);camera.lookAt(look);
renderer.render(scene,camera);stage.dataset.ready='true';
}
const resize=()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);};
addEventListener('resize',resize,{passive:true});player.position.set(0,height(0,0)+1.2,0);camera.position.set(0,17,26);
findRoute(0,0);requestAnimationFrame(tick);
})();
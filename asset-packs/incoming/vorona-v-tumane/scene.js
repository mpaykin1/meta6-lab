const referenceBase=location.pathname.includes('/preview/')?'../../../../../reference/':'../../../reference/';
const T=await import(referenceBase+'ink-fallen-guardian/three.module.js');
import {createCreatures} from './creatures.js';
import {createSoundscape} from './audio.js';

const source=referenceBase+'vorona-v-tumane/';
const ids=[
 ['crow','Ворона'],['stalker','Существо'],['forest_far','Дальний лес'],
 ['forest_mid','Средний лес'],['forest_near','Ближний лес'],['fog_ribbons','Туман'],
 ['feather','Перо ускорения'],['firefly','Светлячок'],['nest','Гнездо'],
 ['impact_feathers','Перья при ударе'],['raindrops','Дождь'],['glowing_eyes','Глаза в тумане'],
 ['crow_wings','Шарнирные крылья'],['crow_tail','Хвост и лапы'],['stalker_limbs','Лапы существа'],
 ['mist_antler','Олень из тумана'],['bell_crawler','Ползун с колоколом'],
 ['hollow_sentinel','Пустоглазый часовой'],['ash_heron','Пепельная цапля'],
 ['silver_moth','Серебряный мотылёк'],['moth_swarm','Стая мотыльков'],
 ['wing_sound','Взмах крыльев'],['crow_cry','Карканье'],['stalker_sound','Шорох существа'],
 ['wind_sound','Ветер'],['fog_music','Музыка тумана']
];
const world=new T.Scene();
world.background=new T.Color('#202a32');
const camera=new T.OrthographicCamera(-14,14,8,-8,.1,100);
camera.position.set(0,1.5,30);
const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.65));
renderer.outputColorSpace=T.SRGBColorSpace;
document.body.insertBefore(renderer.domElement,document.body.firstChild);
const clock=new T.Clock(),load=new T.TextureLoader();
const objects=Object.create(null),keys=new Set();
const sound=createSoundscape();
const state={x:-5,y:1,face:1,time:0,boost:0,light:0,aim:null,focus:null,checkpoint:-5,hit:0};
const probeFrame=new URLSearchParams(location.search).has('asset_probe');
window.__STATE__=()=>({x:state.x,y:state.y,cam:[camera.position.x,camera.position.y,camera.position.z]});
function resize(){
 const w=innerWidth,h=innerHeight,span=29;
 camera.left=-span/2;camera.right=span/2;camera.top=span*h/w/2;camera.bottom=-camera.top;
 camera.updateProjectionMatrix();renderer.setSize(w,h,false);
}
addEventListener('resize',resize);resize();
function svgMap(s){const m=load.load('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s));
 m.colorSpace=T.SRGBColorSpace;return m;}
function addPlane(map,w,h,z,x=0,y=0,opacity=1){
 const mesh=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({
  map,transparent:true,opacity,depthWrite:false,side:T.DoubleSide
 }));
 mesh.position.set(x,y,z);world.add(mesh);return mesh;
}
function rand(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296;};}
function forest(seed,n,color,detail){
 const random=rand(seed);
 let art='<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="512">';
 art+='<path d="M0 466Q92 448 175 468T367 458T564 473T743 455T1024 464V512H0Z" fill="'+color+'"/>';
 for(let i=0;i<n;i++){
  const x=(i+.23+random()*.75)*1024/n,y=460+random()*65;
  const h=125+random()*340,lean=(random()-.5)*65,w=3+random()*12;
  const p=[x-w,y,x+w,y,x+lean*.5+w*.4,y-h*.47,x+lean,y-h,x+lean*.65-w*.3,y-h*.56];
  art+='<path d="M'+p[0]+' '+p[1]+'L'+p[2]+' '+p[3]+'L'+p[4]+' '+p[5]+'L'+p[6]+' '+p[7]+'L'+p[8]+' '+p[9]+'Z" fill="'+color+'"/>';
  for(let b=0;b<5;b++){
   const yy=y-h*(.28+b*.13),xx=x+lean*b/5,side=b%2?1:-1;
   const reach=side*(18+random()*90),dy=15+random()*80;
   art+='<path d="M'+xx+' '+yy+'Q'+(xx+reach*.4)+' '+(yy-dy*.4)+' '+
     (xx+reach)+' '+(yy-dy)+'" stroke="'+color+'" stroke-width="'+(1+random()*4)+'" fill="none"/>';
  }
  if(i%3===0)art+='<path d="M'+x+' '+(y-h*.4)+'q-13-18 -3-26" stroke="'+detail+
   '" stroke-width="1.3" opacity=".5" fill="none"/>';
 }
 return art+'</svg>';
}
const layers=[
 {id:'forest_far',z:-10,y:-.4,ratio:.07,h:30,seed:141,n:46,color:'#99a9ac',detail:'#b6b6ad',opacity:.31},
 {id:'forest_mid',z:-4,y:-1.1,ratio:.22,h:28,seed:829,n:30,color:'#505c65',detail:'#9ca4a7',opacity:.70},
 {id:'forest_near',z:7,y:-1.5,ratio:.68,h:34,seed:1142,n:19,color:'#161e27',detail:'#555b61',opacity:.82}
];
for(const a of layers){
 const mesh=addPlane(svgMap(forest(a.seed,a.n,a.color,a.detail)),94,a.h,a.z,0,a.y,a.opacity);
 objects[a.id]=mesh;
}
const moon=svgMap('<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">'+
 '<defs><radialGradient id="m"><stop stop-color="#fff0d8" stop-opacity=".7"/>'+
 '<stop offset=".18" stop-color="#b5c1bb" stop-opacity=".4"/>'+
 '<stop offset="1" stop-color="#b9c7c8" stop-opacity="0"/></radialGradient></defs>'+
 '<circle cx="128" cy="128" r="128" fill="url(#m)"/></svg>');
addPlane(moon,13,13,-12,10,5.5,.9);
const groundSvg='<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="256">'+
 '<path d="M0 174Q80 160 150 184T302 165T452 182T660 169T850 182T1024 161V256H0Z" fill="#222c31"/>'+
 Array.from({length:83},(_,i)=>{const x=i*13,y=173+(i*37)%19;
 return '<path d="M'+x+' '+y+'q-7-21 -4-27m4 27q8-18 12-22" fill="none" stroke="#506364" stroke-opacity=".53" stroke-width="1.7"/>';
 }).join('')+'</svg>';
const ground=addPlane(svgMap(groundSvg),110,13,4,0,-6);
const mist=new T.ShaderMaterial({
 transparent:true,depthWrite:false,
 uniforms:{uTime:{value:0},uAmount:{value:.8},uColor:{value:new T.Color('#bdc8c5')}},
 vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:[
  'precision mediump float;varying vec2 v;uniform float uTime,uAmount;uniform vec3 uColor;',
  'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
  'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
  'return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+1.),f.x),f.y);}',
  'void main(){vec2 p=v*vec2(3.,4.7);float a=n(p+vec2(-uTime*.027,uTime*.006));',
  'float b=n(p*2.17+vec2(uTime*.018,0.));float c=n(p*4.11-uTime*.009);',
  'float wave=sin(p.y*5.7+a*4.+b*2.);float fog=(a*.45+b*.3+c*.15+.12+wave*.15)*uAmount;',
  'fog*=smoothstep(0.,.14,v.y)*(1.-smoothstep(.85,1.,v.y));',
  'gl_FragColor=vec4(uColor,clamp(fog,0.,.65));}'
 ].join('')
});
const fog=new T.Mesh(new T.PlaneGeometry(120,32),mist);
fog.position.z=11;fog.frustumCulled=false;world.add(fog);objects.fog_ribbons=fog;
function sprite(svg,w,h,x,y,z){
 const s=new T.Sprite(new T.SpriteMaterial({map:svgMap(svg),transparent:true,depthWrite:false}));
 s.position.set(x,y,z);s.scale.set(w,h,1);world.add(s);return s;
}
const hero=new T.Group();hero.position.set(state.x,state.y,5.2);world.add(hero);
const birdTex=load.load(source+'vorona.png');birdTex.colorSpace=T.SRGBColorSpace;
const wingMaterial=new T.ShaderMaterial({
 transparent:true,depthWrite:false,side:T.DoubleSide,
 uniforms:{uImage:{value:birdTex},uTime:{value:0}},
 vertexShader:[
  'uniform float uTime;varying vec2 vUv;',
  'void main(){vUv=uv;vec3 p=position;',
  'float distanceFromBody=abs(uv.x-.5)*2.;',
  'float tip=pow(smoothstep(.25,1.,distanceFromBody),1.65);',
  'float phase=uTime*5.2-distanceFromBody*2.15;',
  'p.y+=tip*(sin(phase)*.38+sin(phase*.57)*.09);',
  'p.x+=sign(uv.x-.5)*tip*sin(phase*.78)*.05;',
  'gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}'
 ].join(''),
 fragmentShader:[
  'precision mediump float;varying vec2 vUv;uniform sampler2D uImage;',
  'void main(){vec4 color=texture2D(uImage,vUv);if(color.a<.02)discard;gl_FragColor=color;}'
 ].join('')
});
const bird=new T.Mesh(new T.PlaneGeometry(6.5,6.5,24,12),wingMaterial);
hero.add(bird);objects.crow=hero;

const crowPlan=[
 {id:'torso',parent:null,pivot:[657,764],poly:[[425,583],[570,525],[664,555],[773,688],[960,692],[1050,755],[1058,834],[895,924],[691,903],[490,894],[413,805]]},
 {id:'wingL_root',parent:'torso',pivot:[591,634],poly:[[280,245],[391,212],[474,334],[535,420],[611,517],[690,616],[653,724],[547,785],[380,748],[239,647],[169,532]]},
 {id:'wingL_tip',parent:'wingL_root',pivot:[403,359],poly:[[16,218],[77,90],[158,62],[174,0],[207,8],[324,40],[344,52],[398,175],[460,244],[527,350],[422,468],[278,464],[149,404],[40,380]]},
 {id:'wingR_root',parent:'torso',pivot:[744,755],poly:[[621,699],[759,675],[899,685],[1008,746],[1121,811],[1145,944],[1030,1055],[906,1018],[814,1081],[709,1008],[625,942]]},
 {id:'wingR_tip',parent:'wingR_root',pivot:[950,856],poly:[[856,790],[982,741],[1170,849],[1253,862],[1237,1019],[1209,1032],[1185,1124],[1113,1108],[1048,1117],[951,1031],[880,984]]},
 {id:'tail',parent:'torso',pivot:[495,876],poly:[[10,947],[51,870],[257,850],[350,826],[480,794],[564,827],[550,923],[456,1014],[363,1125],[268,1169],[178,1174],[97,1147],[37,1066]]},
 {id:'head',parent:'torso',pivot:[711,592],poly:[[599,548],[651,519],[703,480],[787,457],[875,462],[918,481],[990,485],[1019,512],[1027,533],[971,572],[887,595],[827,679],[783,695],[692,676],[632,629]]},
 {id:'feet',parent:'torso',pivot:[503,859],poly:[[435,817],[501,821],[577,854],[575,932],[558,981],[515,1003],[450,986],[438,948],[458,910]]}
];
const crowJoints=Object.create(null);
function buildCrowCutout(img){
 if(!img.complete||!img.naturalWidth)return false;
 const scale=6.5/1254,parts=Object.create(null),pivot0=[627,627];
 const rig=new T.Group();hero.add(rig);
 for(const [i,part] of crowPlan.entries()){
  const points=part.poly.map(([x,y])=>[x*img.naturalWidth/1254,y*img.naturalHeight/1254]);
  const bounds={
   x:Math.max(0,Math.floor(Math.min(...points.map(p=>p[0]))-5)),
   y:Math.max(0,Math.floor(Math.min(...points.map(p=>p[1]))-5)),
   X:Math.min(img.naturalWidth,Math.ceil(Math.max(...points.map(p=>p[0]))+5)),
   Y:Math.min(img.naturalHeight,Math.ceil(Math.max(...points.map(p=>p[1]))+5))
  };
  const canvas=document.createElement('canvas');
  canvas.width=bounds.X-bounds.x;canvas.height=bounds.Y-bounds.y;
  const ctx=canvas.getContext('2d');
  ctx.beginPath();
  points.forEach(([x,y],n)=>n?ctx.lineTo(x-bounds.x,y-bounds.y):ctx.moveTo(x-bounds.x,y-bounds.y));
  ctx.closePath();ctx.save();ctx.clip();ctx.drawImage(img,-bounds.x,-bounds.y);ctx.restore();
  const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;
  const mesh=new T.Mesh(new T.PlaneGeometry(canvas.width*scale,canvas.height*scale),
   new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,side:T.DoubleSide}));
  const joint=new T.Group();
  const parent=part.parent?parts[part.parent]:rig;
  const par=part.parent?crowPlan.find(v=>v.id===part.parent).pivot:pivot0;
  joint.position.set((part.pivot[0]-par[0])*scale,-(part.pivot[1]-par[1])*scale,i*.015);
  mesh.position.set(((bounds.x+bounds.X)*.5-part.pivot[0])*scale,
   -((bounds.y+bounds.Y)*.5-part.pivot[1])*scale,0);
  joint.add(mesh);parent.add(joint);parts[part.id]=joint;
 }
 crowJoints.parts=parts;crowJoints.ready=true;bird.visible=false;
 objects.crow_wings=parts.wingL_root;objects.crow_tail=parts.tail;
 return true;
}
const crowImg=new Image();
crowImg.src=source+'vorona.png';
crowImg.addEventListener('load',()=>buildCrowCutout(crowImg),{once:true});
if(crowImg.complete)buildCrowCutout(crowImg);
function moveCrowParts(t){
 if(!crowJoints.ready)return;
 const p=crowJoints.parts,f=t*4.5;
 p.wingL_root.rotation.z=Math.sin(f)*.095;
 p.wingL_tip.rotation.z=Math.sin(f-.75)*.18;
 p.wingR_root.rotation.z=-Math.sin(f+.24)*.12;
 p.wingR_tip.rotation.z=-Math.sin(f-.66)*.21;
 p.tail.rotation.z=Math.sin(f*.47-1.4)*.08;
 p.head.rotation.z=Math.sin(f*.7-.35)*.045;
 p.feet.rotation.z=Math.sin(f-1.7)*.085;
}

const specimen=new T.Group();specimen.position.set(14,-2.35,4.4);world.add(specimen);
const gif=new Image();gif.src=source+'sushchestvo.gif';
const offscreen=document.createElement('canvas');offscreen.width=315;offscreen.height=311;
const context=offscreen.getContext('2d',{alpha:true});
const gifTexture=new T.CanvasTexture(offscreen);gifTexture.colorSpace=T.SRGBColorSpace;
const creature=new T.Sprite(new T.SpriteMaterial({map:gifTexture,transparent:true,depthWrite:false}));
creature.scale.set(6.2,6.15,1);specimen.add(creature);objects.stalker=specimen;

const rigPlan=[
 {id:'torso',parent:null,pivot:[170,99],poly:[[104,36],[160,31],[206,42],[234,76],[244,115],[227,152],[188,173],[131,157],[104,125],[105,76]]},
 {id:'head',parent:'torso',pivot:[125,114],poly:[[77,85],[91,78],[114,79],[136,94],[140,114],[122,139],[97,143],[76,121]]},
 {id:'armL_upper',parent:'torso',pivot:[138,121],poly:[[127,109],[154,128],[110,179],[95,204],[70,214],[68,197],[97,164]]},
 {id:'armL_lower',parent:'armL_upper',pivot:[79,204],poly:[[70,195],[97,204],[90,229],[81,256],[108,288],[57,296],[38,302],[43,263],[62,230]]},
 {id:'armR_upper',parent:'torso',pivot:[211,119],poly:[[192,83],[228,95],[255,142],[262,167],[232,183],[207,156],[178,120]]},
 {id:'armR_lower',parent:'armR_upper',pivot:[241,163],poly:[[222,151],[264,155],[233,217],[197,240],[166,276],[131,307],[107,306],[146,257],[181,223]]},
 {id:'legL_upper',parent:'torso',pivot:[181,160],poly:[[169,147],[205,143],[214,170],[181,197],[146,217],[122,208]]},
 {id:'legL_lower',parent:'legL_upper',pivot:[149,205],poly:[[129,188],[185,191],[184,239],[163,276],[130,281],[150,243]]},
 {id:'legR_upper',parent:'torso',pivot:[232,159],poly:[[213,134],[254,131],[274,186],[283,227],[247,244],[218,204]]},
 {id:'legR_lower',parent:'legR_upper',pivot:[266,221],poly:[[244,212],[283,212],[293,258],[288,287],[235,298],[216,286],[247,264]]}
];
const joints=Object.create(null);
function buildCutoutRig(){
 if(!gif.complete||!gif.naturalWidth)return false;
 const k=6.2/315,groups=Object.create(null),origin=[157.5,155.5];
 const rootJoint=new T.Group();specimen.add(rootJoint);
 for(const [i,part] of rigPlan.entries()){
  const bounds={
   minX:Math.max(0,Math.floor(Math.min(...part.poly.map(v=>v[0]))-3)),
   maxX:Math.min(315,Math.ceil(Math.max(...part.poly.map(v=>v[0]))+3)),
   minY:Math.max(0,Math.floor(Math.min(...part.poly.map(v=>v[1]))-3)),
   maxY:Math.min(311,Math.ceil(Math.max(...part.poly.map(v=>v[1]))+3))
  };
  const canvas=document.createElement('canvas');
  canvas.width=bounds.maxX-bounds.minX;canvas.height=bounds.maxY-bounds.minY;
  const ctx=canvas.getContext('2d');
  ctx.save();ctx.beginPath();
  part.poly.forEach(([x,y],j)=>j?ctx.lineTo(x-bounds.minX,y-bounds.minY):
    ctx.moveTo(x-bounds.minX,y-bounds.minY));
  ctx.closePath();ctx.clip();ctx.drawImage(gif,-bounds.minX,-bounds.minY);ctx.restore();
  const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;
  const mesh=new T.Mesh(new T.PlaneGeometry(canvas.width*k,canvas.height*k),
   new T.MeshBasicMaterial({map,transparent:true,depthWrite:false,side:T.DoubleSide}));
  const group=new T.Group();
  const parent=part.parent?groups[part.parent]:rootJoint;
  const parentPx=part.parent?rigPlan.find(v=>v.id===part.parent).pivot:origin;
  group.position.set((part.pivot[0]-parentPx[0])*k,
   -(part.pivot[1]-parentPx[1])*k,.009*i);
  mesh.position.set(((bounds.minX+bounds.maxX)/2-part.pivot[0])*k,
   -((bounds.minY+bounds.maxY)/2-part.pivot[1])*k,0);
  group.add(mesh);parent.add(group);groups[part.id]=group;
 }
 joints.parts=groups;joints.root=rootJoint;joints.ready=true;
 objects.stalker_limbs=groups.armL_upper;
 creature.visible=false;return true;
}
gif.addEventListener('load',buildCutoutRig,{once:true});
if(gif.complete)buildCutoutRig();
function animateCutout(t){
 if(!joints.ready)return;
 const p=joints.parts,step=t*2.05;
 p.torso.rotation.z=Math.sin(step*.55)*.028;
 p.head.rotation.z=Math.sin(step*.62-.4)*.065;
 p.armL_upper.rotation.z=Math.sin(step)*.13;
 p.armL_lower.rotation.z=Math.sin(step-.72)*.25;
 p.armR_upper.rotation.z=-Math.sin(step+.5)*.19;
 p.armR_lower.rotation.z=-Math.sin(step-.32)*.29;
 p.legL_upper.rotation.z=Math.sin(step+1.1)*.22;
 p.legL_lower.rotation.z=-Math.sin(step+.31)*.38;
 p.legR_upper.rotation.z=-Math.sin(step)*.19;
 p.legR_lower.rotation.z=Math.sin(step-.85)*.33;
}

let gifUpdate=0;
const featherSvg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 240">'+
 '<defs><linearGradient id="f"><stop stop-color="#d5c4ba"/><stop offset=".45" stop-color="#b4aab3"/>'+
 '<stop offset="1" stop-color="#6a6875"/></linearGradient></defs>'+
 '<path d="M74 223Q16 148 23 108Q38 47 99 12Q148 58 115 136Q90 195 74 223Z" fill="url(#f)" stroke="#564f57" stroke-width="3"/>'+
 '<path d="M76 225Q81 122 101 17" stroke="#e7dccc" stroke-width="3" fill="none"/>'+
 Array.from({length:11},(_,i)=>'<path d="M'+(78+i*.8)+' '+(210-i*15)+'q'+(i%2?'-39':'30')+
 ' -25 '+(i%2?'-44':'45')+' -36" stroke="#756972" stroke-opacity=".6" fill="none"/>').join('')+
 '</svg>';
const feather=sprite(featherSvg,1.35,2.1,3,-2.1,5.8);objects.feather=feather;
const nestSvg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 165">'+
 '<path d="M13 64Q64 146 150 152Q260 143 291 68Q222 118 151 111Q91 127 13 64Z" fill="#685b53" stroke="#343536" stroke-width="6"/>'+
 Array.from({length:31},(_,i)=>{const x=15+(i*71)%260,y=68+(i*47)%80;
 return '<path d="M'+x+' '+y+'q'+(20+i%5*4)+' '+(i%2?16:-12)+' 52 '+(i%3?1:-14)+
 '" stroke="'+(i%2?'#b4a08b':'#343239')+'" stroke-width="'+(2+i%3)+'" fill="none" opacity=".72"/>';
 }).join('')+'</svg>';
const nest=sprite(nestSvg,3.3,1.8,-13,-3.7,5.5);objects.nest=nest;
const lightSvg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">'+
 '<defs><radialGradient id="r"><stop stop-color="#fff8cd"/>'+
 '<stop offset=".16" stop-color="#e6f1c2" stop-opacity=".93"/>'+
 '<stop offset=".42" stop-color="#8ed5ae" stop-opacity=".35"/>'+
 '<stop offset="1" stop-color="#9dcbb1" stop-opacity="0"/></radialGradient></defs>'+
 '<circle cx="64" cy="64" r="64" fill="url(#r)"/></svg>';
const firefly=sprite(lightSvg,4,4,11,1.5,6.5);objects.firefly=firefly;
const mote=[];
const random=rand(2231);
for(let i=0;i<75;i++){
 const x=random()*54-27,y=random()*12-5,size=.09+random()*.13;
 const star=sprite(lightSvg,size,size,x,y,8.8);
 star.material.opacity=.12+random()*.23;star.userData={x,phase:random()*6.28};mote.push(star);
}

const impactGroup=new T.Group();world.add(impactGroup);objects.impact_feathers=impactGroup;
const impact=[];
const impactTex=svgMap(featherSvg);
for(let i=0;i<10;i++){
 const sprite=new T.Sprite(new T.SpriteMaterial({map:impactTex,transparent:true,depthWrite:false,opacity:.86}));
 sprite.scale.set(.42,.64,1);sprite.visible=false;impactGroup.add(sprite);
 impact.push({sprite,phase:i*Math.PI*2/10,life:0});
}
const rainPositions=[];
const rainRandom=rand(44531);
for(let i=0;i<140;i++)rainPositions.push(rainRandom()*84-42,rainRandom()*16-8,rainRandom()*2+3);
const rainGeo=new T.BufferGeometry();
rainGeo.setAttribute('position',new T.Float32BufferAttribute(rainPositions,3));
const rainShader=new T.ShaderMaterial({
 transparent:true,depthWrite:false,
 uniforms:{uTime:{value:0}},
 vertexShader:[
 'uniform float uTime;varying float alpha;',
 'void main(){vec3 p=position;p.y=mod(p.y-uTime*(3.6+fract(p.x*2.73)*2.4)+40.,16.)-8.;',
 'alpha=.18+.24*fract(p.x*9.73);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);',
 'gl_PointSize=3.;}'
 ].join(''),
 fragmentShader:[
 'precision mediump float;varying float alpha;',
 'void main(){vec2 d=gl_PointCoord-.5;float a=1.-smoothstep(.25,.49,length(vec2(d.x*2.9,d.y*.56)));',
 'gl_FragColor=vec4(.68,.76,.77,alpha*a);}'
 ].join('')
});
const rain=new T.Points(rainGeo,rainShader);rain.position.z=4.8;
world.add(rain);objects.raindrops=rain;
const eyeGroup=new T.Group();world.add(eyeGroup);objects.glowing_eyes=eyeGroup;
for(let i=0;i<7;i++){
 const x=-21+i*6.9+(i%2)*2.3,y=-1.75+(i%3)*1.2;
 for(const side of [-1,1]){
  const eye=new T.Sprite(new T.SpriteMaterial({map:svgMap(lightSvg),transparent:true,opacity:.34,depthWrite:false}));
  eye.scale.set(.65,.65,1);eye.position.set(x+side*.21,y,-2.1);eye.userData.phase=i*1.7;
  eyeGroup.add(eye);
 }
}
const wildlife=createCreatures({T,world,svgMap,rand});
Object.assign(objects,wildlife.objects);
const nestAura=sprite(lightSvg,4.2,2.6,-13,-3.55,5.1);
nestAura.material.opacity=.13;nestedAuraSafe();
function nestedAuraSafe(){nestAura.visible=true;}
function burst(){
 state.hit=2.4;state.x=state.checkpoint;state.y=1;state.aim=null;state.focus=null;
 for(const p of impact){p.life=1.1;p.sprite.visible=true;p.sprite.position.set(state.x,state.y,8.3);}
}

window.__PACK__={items:ids.map(([id,label])=>({id,label}))};
window.__PACK_PROBE__={assets:objects,setHidden(id,hide){if(objects[id])objects[id].visible=!hide;},
 focus(id){state.focus=id;}};
const panel=document.getElementById('panel'),menu=document.getElementById('menuButton');
function openMenu(yes){panel.hidden=!yes;menu.setAttribute('aria-expanded',String(yes));}
menu.addEventListener('click',()=>{sound.unlock();openMenu(panel.hidden);});
for(const [id,label] of ids){
 const b=document.createElement('button');b.className='item';b.textContent=label;
 b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>{
  document.querySelectorAll('.item').forEach(el=>el.setAttribute('aria-pressed','false'));
  b.setAttribute('aria-pressed','true');state.focus=id;
  sound.unlock();
  if(id==='wing_sound')sound.wing();
  else if(id==='crow_cry')sound.crow();
  else if(id==='stalker_sound')sound.stalker();
  else if(id==='wind_sound'||id==='fog_music')sound.tick(state.time,true);
  openMenu(false);
 });
 document.getElementById('items').appendChild(b);
}
addEventListener('keydown',e=>{sound.unlock();const k=e.key.toLowerCase();
 if(k==='m'){openMenu(panel.hidden);return;}keys.add(k);
 if(k.startsWith('arrow')||k===' ')e.preventDefault();
});
addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
renderer.domElement.addEventListener('pointerdown',e=>{sound.unlock();sound.wing();
 const p=new T.Vector3(e.clientX/innerWidth*2-1,1-e.clientY/innerHeight*2,.1);
 p.unproject(camera);state.aim=[p.x,p.y];state.focus=null;
});
function mobile(id,key){
 const b=document.getElementById(id);
 b.addEventListener('pointerdown',e=>{e.preventDefault();sound.unlock();keys.add(key);b.setPointerCapture(e.pointerId);});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])
  b.addEventListener(event,()=>keys.delete(key));
}
mobile('left','arrowleft');mobile('right','arrowright');mobile('up','arrowup');
function draw(){
 requestAnimationFrame(draw);
 const dt=Math.min(clock.getDelta(),.045),t=state.time+=dt;
 wildlife.tick(t,dt);
 let dx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0);
 let dy=(keys.has('w')||keys.has('arrowup')||keys.has(' ')?1:0)-
        (keys.has('s')||keys.has('arrowdown')?1:0);
 if(dx===0&&dy===0&&state.aim){
  const x=state.aim[0]-state.x,y=state.aim[1]-state.y;
  if(Math.hypot(x,y)<.3)state.aim=null;
  else{dx=T.MathUtils.clamp(x,-1,1);dy=T.MathUtils.clamp(y,-1,1);}
 }
 state.boost=Math.max(0,state.boost-dt);state.light=Math.max(0,state.light-dt);
 state.hit=Math.max(0,state.hit-dt);
 const speed=state.boost>0?7.7:4.7;
 sound.tick(t,Math.abs(dx)+Math.abs(dy)>.2);
 state.x=T.MathUtils.clamp(state.x+dx*speed*dt,-24,24);
 state.y=T.MathUtils.clamp(state.y+dy*speed*dt,-3.4,6);
 if(Math.abs(dx)>.05)state.face=Math.sign(dx);
 hero.position.set(state.x,state.y+Math.sin(t*2.6)*.12,5.2);
 wingMaterial.uniforms.uTime.value=t;
 moveCrowParts(t);
 hero.scale.x=T.MathUtils.lerp(hero.scale.x,state.face,.095);
 hero.rotation.z=T.MathUtils.lerp(hero.rotation.z,-dy*.08+Math.sin(t*1.8)*.02,.08);
 hero.position.z=5.2+(state.hit>0?.15*Math.sin(t*30):0);
 specimen.position.set(14+Math.sin(t*.41)*3,-2.35+Math.sin(t*1.1)*.09,4.4);
 specimen.scale.x=Math.sin(t*.41)>0?-1:1;
 animateCutout(t);
 if(!joints.ready&&gif.complete&&gif.naturalWidth&&t-gifUpdate>.083){
  gifUpdate=t;context.clearRect(0,0,315,311);
  context.drawImage(gif,0,0,315,311);gifTexture.needsUpdate=true;
 }
 feather.position.y=-2.1+Math.sin(t*1.4)*.24;
 feather.material.rotation=Math.sin(t*.85)*.18;
 if(feather.visible&&Math.hypot(state.x-feather.position.x,state.y-feather.position.y)<1.25){
  feather.visible=false;state.boost=14;
 }
 firefly.position.y=1.5+Math.sin(t*1.9)*.45;
 const glow=4+Math.sin(t*1.8)*.35;firefly.scale.set(glow,glow,1);
 if(state.light===0&&Math.hypot(state.x-firefly.position.x,state.y-firefly.position.y)<1.5)
  state.light=16;
 mist.uniforms.uTime.value=t;mist.uniforms.uAmount.value=state.light>0?.24:.83;
 rainShader.uniforms.uTime.value=t;
 for(const eye of eyeGroup.children){
  eye.material.opacity=.08+.29*Math.pow(Math.max(0,Math.sin(t*.54+eye.userData.phase)),4);
 }
 for(const p of impact){
  if(p.life<=0)continue;p.life-=dt;const age=1.1-p.life;
  p.sprite.position.x+=Math.cos(p.phase)*dt*(1.9+age*1.1);
  p.sprite.position.y+=Math.sin(p.phase)*dt*2.2-dt*age*2.3;
  p.sprite.material.rotation+=dt*1.8;
  p.sprite.material.opacity=Math.max(0,p.life/1.1);
  if(p.life<=0)p.sprite.visible=false;
 }
 if(Math.hypot(state.x-nest.position.x,state.y-nest.position.y)<1.6)state.checkpoint=-13;
 nestAura.material.opacity=state.checkpoint===-13?.12+Math.sin(t*2.2)*.05:.025;
 if(state.hit===0&&Math.hypot(state.x-specimen.position.x,state.y-specimen.position.y)<1.85){sound.stalker();burst();}
 for(const star of mote){
  star.position.x=star.userData.x+Math.sin(t*.21+star.userData.phase)*.5;
  star.position.y+=dt*.14;if(star.position.y>8)star.position.y=-6;
 }
 const focus=state.focus==='stalker'?specimen.position.x:
 state.focus==='nest'?nest.position.x:
 state.focus==='firefly'?firefly.position.x:
 state.focus==='feather'?feather.position.x:state.x;
 camera.position.x+=(focus-camera.position.x)*.055;
 camera.position.y+=(1.5+state.y*.12-camera.position.y)*.012;
 for(const l of layers)objects[l.id].position.x=camera.position.x*l.ratio;
 ground.position.x=camera.position.x*.38;fog.position.x=camera.position.x;
 renderer.render(world,camera);
 if(probeFrame && t>1 && (!window.__RENDER_STATS__||window.__RENDER_STATS__.colors<36)){
  const gl=renderer.getContext(),width=Math.min(384,gl.drawingBufferWidth),
   height=Math.min(216,gl.drawingBufferHeight);
  const pix=new Uint8Array(width*height*4);
  gl.readPixels(Math.floor((gl.drawingBufferWidth-width)/2),
   Math.floor((gl.drawingBufferHeight-height)/2),width,height,gl.RGBA,gl.UNSIGNED_BYTE,pix);
  const ink=new Set();
  for(let i=0;i<pix.length;i+=4*11){
   ink.add(((pix[i]>>4)<<8)|((pix[i+1]>>4)<<4)|(pix[i+2]>>4));
  }
  window.__RENDER_STATS__={colors:ink.size,samples:pix.length/4};
 }
}
draw();

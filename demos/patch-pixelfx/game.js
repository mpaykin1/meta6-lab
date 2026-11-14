// Original PixelFX modules below are byte-for-byte upstream MIT sources.
// Scene, input, composition and game logic are original META GAMES glue.
import {createFrame, clearFrame, createFx, composite, campfire,
  smallExplosion as explosion, lightningStrike as lightning} from
  "../../shared/components/patch-pixelfx/entry.js";

const W = 640, H = 360;
const canvas = document.querySelector("#world");
const canvasFx = document.querySelector("#vfx");
const ctx = canvas.getContext("2d", {alpha:false});
const fxCtx = canvasFx.getContext("2d");
ctx.imageSmoothingEnabled = false;
fxCtx.imageSmoothingEnabled = false;

const frame = createFrame(W, H);
const image = fxCtx.createImageData(W, H);
const menu = document.querySelector("#menu");
const menuBtn = document.querySelector("#menu-button");
const keys = new Set();
let paused = false;
let time = 0;
let last = 0;
let fire = null;
let waves = [];
let hazards = [];
let enemySeed = 0;
let playerX = 112;
let lastCast = -10;
let sound = null;

const random = (n) => {
  const x = Math.sin(n * 127.1 + 91.7) * 43758.5453;
  return x - Math.floor(x);
};
const clamp = (x,a,b) => Math.min(b,Math.max(a,x));

function newFire() {
  return createFx(campfire, {x:223,y:288,seed:12,light:0.95});
}
function makeEnemies() {
  return Array.from({length:4}, (_,i)=>({
    x:660 + i*128,y:283,speed:10 + i*2.5,phase:i*2.1,
    alive:true,respawn:0
  }));
}
function restart() {
  time=0;
  playerX=112;
  lastCast=-10;
  enemySeed=0;
  waves=[];
  hazards=makeEnemies();
  fire=newFire();
}
restart();

function playStrike() {
  try {
    sound ||= new (window.AudioContext || window.webkitAudioContext)();
    if(sound.state==="suspended")void sound.resume();
    const start=sound.currentTime,osc=sound.createOscillator();
    const vol=sound.createGain();
    osc.type="sawtooth";
    osc.frequency.setValueAtTime(170,start);
    osc.frequency.exponentialRampToValueAtTime(34,start+0.36);
    vol.gain.setValueAtTime(0.0001,start);
    vol.gain.exponentialRampToValueAtTime(0.075,start+0.012);
    vol.gain.exponentialRampToValueAtTime(0.0001,start+0.4);
    osc.connect(vol).connect(sound.destination);
    osc.start(start);
    osc.stop(start+0.41);
  } catch (error) {
    // Browser autoplay policy may prohibit audio; silent play remains supported.
    console.info("Audio unavailable",error);
  }
}
function burst(x, y=281, withLightning=true) {
  if(paused || time-lastCast<0.45)return;
  lastCast=time;
  const tx=clamp(Math.round(x),46,594);
  const yy=clamp(Math.round(y),244,301);
  if(withLightning)waves.push({fx:createFx(lightning,{x:tx,y:yy,seed:enemySeed++ + 23}),kind:"bolt"});
  waves.push({fx:createFx(explosion,{x:tx,y:yy,seed:enemySeed++ + 84,size:0.8}),kind:"blast",delay:0.23});
  for(const enemy of hazards){
    if(enemy.alive && Math.abs(enemy.x-tx)<55){
      enemy.alive=false;
      enemy.respawn=time+2.5+random(enemy.phase)*1.8;
    }
  }
  if(waves.length>11)waves=waves.slice(-11);
  playStrike();
}
function held(btn,key){
  const el=document.querySelector(btn);
  el.addEventListener("pointerdown",(event)=>{
    event.preventDefault();
    el.setPointerCapture(event.pointerId);
    keys.add(key);
  });
  for(const evt of ["pointerup","pointercancel","lostpointercapture"])
    el.addEventListener(evt,()=>keys.delete(key));
}
held("#left","left");
held("#right","right");
document.querySelector("#cast").addEventListener("pointerdown",(event)=>{
  event.preventDefault();
  burst(playerX+110,286);
});
canvas.addEventListener("pointerdown",(event)=>{
  const rect=canvas.getBoundingClientRect();
  burst((event.clientX-rect.left)/rect.width*W,282);
});
window.addEventListener("keydown",(event)=>{
  if(["ArrowLeft","ArrowRight","Space","KeyA","KeyD","KeyL"].includes(event.code))event.preventDefault();
  if(["ArrowLeft","KeyA"].includes(event.code))keys.add("left");
  if(["ArrowRight","KeyD"].includes(event.code))keys.add("right");
  if(["Space","KeyL"].includes(event.code) && !event.repeat)burst(playerX+115,282);
});
window.addEventListener("keyup",(event)=>{
  if(["ArrowLeft","KeyA"].includes(event.code))keys.delete("left");
  if(["ArrowRight","KeyD"].includes(event.code))keys.delete("right");
});
window.addEventListener("blur",()=>keys.clear());
menuBtn.addEventListener("click",()=>{
  paused=!paused;
  menu.hidden=!paused;
  menuBtn.setAttribute("aria-expanded",String(paused));
  keys.clear();
});
document.querySelector("#restart").addEventListener("click",()=>{
  restart();
  paused=false;
  menu.hidden=true;
  menuBtn.setAttribute("aria-expanded","false");
});

function hill(points,fill){
  ctx.fillStyle=fill;
  ctx.beginPath();
  ctx.moveTo(0,H);
  for(const [x,y] of points)ctx.lineTo(x,y);
  ctx.lineTo(W,H);
  ctx.fill();
}
function tree(x,y,scale=1){
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
  ctx.strokeStyle="#090b13";ctx.lineWidth=5;
  ctx.beginPath();ctx.moveTo(0,28);ctx.lineTo(-1,-30);ctx.lineTo(-18,-52);
  ctx.moveTo(-2,-20);ctx.lineTo(19,-46);ctx.lineTo(29,-49);
  ctx.moveTo(-2,-4);ctx.lineTo(-27,-21);ctx.lineTo(-39,-20);
  ctx.moveTo(8,-32);ctx.lineTo(16,-64);
  ctx.stroke();
  ctx.strokeStyle="#33303a";ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(2,24);ctx.lineTo(0,-24);ctx.stroke();
  ctx.restore();
}
function tower(x,y){
  ctx.fillStyle="#151420";
  ctx.fillRect(x,y-122,46,122);
  ctx.fillStyle="#0b0b13";
  ctx.fillRect(x-7,y-132,59,16);
  ctx.fillRect(x-4,y-142,11,14);
  ctx.fillRect(x+15,y-144,11,14);
  ctx.fillRect(x+36,y-139,11,11);
  ctx.fillStyle="#25222c";
  ctx.fillRect(x+4,y-112,3,101);
  ctx.fillRect(x+39,y-103,2,92);
  for(let j=0;j<3;j++){
    ctx.fillStyle="#05070c";
    ctx.fillRect(x+17,y-101+j*31,12,19);
    ctx.fillStyle="#543e36";
    ctx.fillRect(x+20,y-97+j*31,6,5);
  }
}
function enemySprite(e){
  if(!e.alive)return;
  const bob=Math.round(Math.sin(time*5+e.phase)*2),x=Math.round(e.x),y=e.y+bob;
  ctx.fillStyle="#0c0810";
  ctx.fillRect(x-10,y-26,19,22);
  ctx.fillRect(x-7,y-8,6,11);ctx.fillRect(x+3,y-8,6,11);
  ctx.fillRect(x-5,y-42,13,18);
  ctx.fillRect(x-11,y-43,5,16);ctx.fillRect(x+8,y-46,5,18);
  ctx.fillStyle="#8e3e3e";
  ctx.fillRect(x-2,y-34,3,2);ctx.fillRect(x+5,y-34,3,2);
  ctx.fillStyle="#34242d";
  ctx.fillRect(x-12,y-23,3,16);
}
function hero(){
  const x=Math.round(playerX);
  const step=keys.size ? Math.round(Math.sin(time*15)*3) : 0;
  ctx.fillStyle="#03060a";ctx.fillRect(x-11,284,26,4);
  ctx.fillStyle="#18121c";ctx.fillRect(x-7,265,15,19);
  ctx.fillStyle="#382833";ctx.fillRect(x-6,253,12,16);
  ctx.fillStyle="#a18b73";ctx.fillRect(x-4,246,9,10);
  ctx.fillStyle="#201b21";ctx.fillRect(x-9,242,18,7);
  ctx.fillStyle="#2c2730";ctx.fillRect(x-6,281,5,8+step);
  ctx.fillRect(x+3,281,5,8-step);
  ctx.fillStyle="#d6a45f";ctx.fillRect(x+9,263,5,8);
  ctx.fillStyle="#f0d595";ctx.fillRect(x+10,265,3,3);
}
function landscape(){
  // Deep background: twilight haze, distant stars, ruined skyline.
  const sky=ctx.createLinearGradient(0,0,0,340);
  sky.addColorStop(0,"#070b18");
  sky.addColorStop(.42,"#262037");
  sky.addColorStop(.8,"#563e42");
  sky.addColorStop(1,"#0d0d13");
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  for(let i=0;i<85;i++){
    const x=(random(i+20)*W)|0,y=(random(i*11+70)*145)|0;
    ctx.fillStyle=i%5===0?"#c8afa980":"#ada7c25a";
    ctx.fillRect(x,y,1,1);
  }
  ctx.fillStyle="#b49b91";ctx.beginPath();ctx.arc(440,85,17,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#262238";ctx.beginPath();ctx.arc(447,79,17,0,Math.PI*2);ctx.fill();
  for(let j=0;j<5;j++){
    const drift=(time*(2+j*.4))%840;
    const x=(j*160+drift-100)%800-80,y=54+j*29;
    ctx.fillStyle=j%2?"#231e30a6":"#2d2737a0";
    for(let n=0;n<7;n++)ctx.fillRect(x+n*18,y+Math.sin(n+j)*4,34,5+j%3);
  }
  hill([[0,193],[34,167],[88,181],[149,122],[190,158],[233,141],[295,198],
    [362,156],[420,180],[471,116],[531,152],[581,169],[640,130]],"#282236");
  hill([[0,231],[83,193],[143,218],[208,171],[281,226],[373,188],[451,226],
    [510,185],[576,214],[640,178]],"#1d1b2b");
  // Mid-ground: fortifications and torn gate.
  ctx.fillStyle="#181824";
  ctx.fillRect(0,217,640,49);
  tower(338,252);
  tower(516,258);
  ctx.fillRect(359,234,172,11);
  ctx.fillStyle="#10121a";
  for(let i=0;i<8;i++)ctx.fillRect(355+i*23,225,12,13);
  ctx.fillStyle="#090e16";
  ctx.beginPath();ctx.arc(448,247,27,Math.PI,2*Math.PI);ctx.lineTo(475,278);
  ctx.lineTo(421,278);ctx.fill();
  for(const [x,y,s] of [[52,259,.9],[113,273,.64],[603,272,1.15],[564,263,.5],[289,259,.7]])
    tree(x,y,s);
  // Near-ground ash and cracked basalt with firelight.
  const ground=ctx.createLinearGradient(0,273,0,H);
  ground.addColorStop(0,"#302631");ground.addColorStop(.35,"#1b1a24");
  ground.addColorStop(1,"#080b11");
  ctx.fillStyle=ground;ctx.fillRect(0,281,640,79);
  ctx.fillStyle="#57413d";
  ctx.fillRect(0,280,640,2);
  for(let i=0;i<90;i++){
    const x=(random(i*7+2)*640)|0;
    const y=286+((random(i*13+19)*67)|0);
    ctx.fillStyle=i%5===0?"#674c3c":"#34303a";
    ctx.fillRect(x,y,2+i%6,1+i%2);
  }
  ctx.fillStyle="#402b28a0";
  ctx.beginPath();ctx.ellipse(223,285,50,15,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#e6854930";
  ctx.beginPath();ctx.ellipse(223,285,31,7,0,0,Math.PI*2);ctx.fill();
  // Screen layer: drifting ash and film grain.
  for(let i=0;i<37;i++){
    const x=(random(i*5+6)*W+time*(8+i%3)*.7)%W;
    const y=(random(i*15+17)*H+time*(5+i%5))%H;
    ctx.fillStyle=i%4===0?"#d28a6266":"#b0a0a62e";
    ctx.fillRect(x|0,y|0,i%5===0?2:1,1);
  }
  for(let i=0;i<70;i++){
    const x=(random(i*43+7)*W)|0;
    const y=(random(i*23+6)*H)|0;
    ctx.fillStyle=i%2?"#fff3ef08":"#0202030d";
    ctx.fillRect(x,y,2,2);
  }
}

function update(dt){
  time+=dt;
  if(keys.has("left"))playerX-=dt*82;
  if(keys.has("right"))playerX+=dt*82;
  playerX=clamp(playerX,34,606);
  fire.update(dt);
  for(const mob of hazards){
    if(mob.alive) {
      mob.x-=mob.speed*dt;
      if(mob.x<23){
        mob.alive=false;
        mob.respawn=time+2.8;
      }
    } else if(time>=mob.respawn){
      mob.alive=true;
      mob.x=658+random(enemySeed++ + 20)*190;
    }
  }
  for(const w of waves){
    if(w.delay>0){w.delay-=dt;continue;}
    w.fx.update(dt);
  }
  waves=waves.filter(w=>w.delay>0||!w.fx.done());
}
function draw(){
  landscape();
  hazards.forEach(enemySprite);
  hero();
  clearFrame(frame);
  fire.draw(frame);
  for(const w of waves)if(w.delay<=0)w.fx.draw(frame);
  composite(frame,image.data,null,1);
  fxCtx.putImageData(image,0,0);
}
function loop(stamp){
  if(!last)last=stamp;
  if(stamp-last>=30){
    const dt=clamp((stamp-last)/1000,0,0.05);
    last=stamp;
    if(!paused) {
      update(dt);
      draw();
    }
  }
  requestAnimationFrame(loop);
}
draw();
requestAnimationFrame(loop);

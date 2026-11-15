// META GAMES original scenery layer for the imported MIT PixelFX demo.
// Lightweight Canvas rendering; no textures, fonts, remote code or dependencies.
const W=640,H=360;
const hash=n=>{const v=Math.sin(n*127.1+17.3)*43758.5453;return v-Math.floor(v);};
const fade=(g,x,y,rx,color,alpha)=>{
  const grad=g.createRadialGradient(x,y,2,x,y,rx);
  grad.addColorStop(0,color.replace('ALPHA',String(alpha)));
  grad.addColorStop(1,color.replace('ALPHA','0'));
  g.fillStyle=grad;
  g.fillRect(x-rx,y-rx,rx*2,rx*2);
};
function ruinedEngine(g){
  // Collapsed astronomical engine, embedded in the ash beside the old citadel.
  g.save();
  g.translate(73,226);
  g.rotate(-0.19);
  g.strokeStyle='#141722';
  g.lineWidth=12;
  g.beginPath();g.arc(0,0,49,-2.9,0.55);g.stroke();
  g.lineWidth=6;g.strokeStyle='#24212a';
  g.beginPath();g.arc(0,0,42,-2.88,0.65);g.stroke();
  g.strokeStyle='#11121c';g.lineWidth=8;
  for(let i=0;i<7;i++){
    const a=i*Math.PI/4-1.8;
    g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a)*44,Math.sin(a)*44);g.stroke();
  }
  g.fillStyle='#080c15';g.beginPath();g.arc(0,0,14,0,Math.PI*2);g.fill();
  g.strokeStyle='#56505b';g.lineWidth=2;
  g.beginPath();g.arc(0,0,11,0,Math.PI*2);g.stroke();
  g.strokeStyle='#0d111b';g.lineWidth=3;
  g.beginPath();g.moveTo(26,16);g.bezierCurveTo(40,37,50,24,63,48);
  g.moveTo(-30,23);g.bezierCurveTo(-44,40,-39,32,-49,58);g.stroke();
  g.restore();
}
export function drawAmbience(g,t,flash=0,flashX=320){
  g.save();
  ruinedEngine(g);
  // Cyan moonlight and a warm, pulsing fire halo are behind the actors and VFX.
  g.globalCompositeOperation='screen';
  fade(g,436,87,93,'rgba(122,134,201,ALPHA)',0.075);
  fade(g,223,281,135,'rgba(252,116,49,ALPHA)',0.115+Math.sin(t*7)*0.028);
  fade(g,223,281,66,'rgba(255,175,74,ALPHA)',0.10+Math.sin(t*10)*0.035);
  if(flash>0.003){
    const brightness=Math.min(0.42,flash*0.32);
    fade(g,flashX,257,226,'rgba(145,188,255,ALPHA)',brightness);
    g.fillStyle='rgba(158,193,255,'+(flash*0.095)+')';
    g.fillRect(0,0,W,273);
  }
  g.globalCompositeOperation='source-over';
  // Several independent translucent bands slide at different speeds.
  for(let layer=0;layer<4;layer++){
    const y=243+layer*20;
    const shift=t*(3.5+layer*1.6);
    g.beginPath();
    g.moveTo(-50,H);
    for(let x=-50;x<=690;x+=14){
      const h=Math.sin((x+shift)*0.019+layer*1.7)*4+
        Math.sin((x-shift*0.7)*0.047+layer)*2;
      g.lineTo(x,y+h);
    }
    g.lineTo(690,H);g.closePath();
    g.fillStyle=['#5b53631a','#97909b0e','#8f77741a','#3d424e23'][layer];
    g.fill();
  }
  // Drifting luminous embers and distant dust in three depth bands.
  for(let i=0;i<76;i++){
    const near=i>=44;
    const speed=near?8+hash(i+90)*9:2+hash(i+15)*4;
    const x=(hash(i*5+21)*W+t*speed)%W;
    const y=(hash(i*3+72)*H-t*(near?5:2)+H*20)%H;
    const alpha=(near?.12:.04)*(0.65+Math.sin(t*2+i)*0.35);
    const size=(near&&i%8===0)?2:1;
    g.fillStyle=near?'rgba(246,150,91,'+alpha+')':
      'rgba(195,199,215,'+alpha+')';
    g.fillRect(x|0,y|0,size,size);
  }
  g.restore();
}
export function drawForeground(g,t,flash=0){
  g.save();
  // Broken basalt silhouettes and uneven grass immediately before the camera.
  g.fillStyle='#080b10de';
  g.beginPath();
  g.moveTo(0,H);
  for(let x=0;x<=W;x+=9){
    const y=350+hash(x*11+5)*8;
    g.lineTo(x,y);
  }
  g.lineTo(W,H);g.fill();
  for(let i=0;i<69;i++){
    const x=hash(i*13+31)*W;
    const y=340+hash(i*7+19)*24;
    const h=4+hash(i*11+7)*15;
    const bend=Math.sin(t*1.2+i)*1.7;
    g.strokeStyle=i%4===0?'#393039':'#171b22';
    g.lineWidth=i%5===0?2:1;
    g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+bend,y-h*.6,x+bend-3,y-h);g.stroke();
  }
  g.globalCompositeOperation='screen';
  for(let i=0;i<20;i++){
    const x=hash(i*5+49)*W;
    const y=335+hash(i*19+14)*22;
    g.fillStyle='rgba(166,126,111,'+(0.025+flash*0.055)+')';
    g.fillRect(x|0,y|0,2+(i%3),1);
  }
  g.restore();
}

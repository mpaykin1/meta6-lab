/* Небесный пилот — закатный готический город. Срезы создаются один раз,
   видимость / LOD рассчитываются отдельно для каждого кадра. Эталон не изменён. */
'use strict';
window.GothicCity = (() => {
  const COLOR = {
    stone: ['#343048', '#48425b', '#5d5265', '#716274', '#92788a'],
    shade: '#28263f', edge: '#a48a9b', gold: '#ffc86d',
    roof: '#853f58', roofHi: '#bd6771', moss: '#52665c'
  };
  const decks = new Map();
  const hiddenAssets = new Set();
  window.__ISOLATE__ = (id, visible=true) => {
    if(visible) hiddenAssets.delete(id); else hiddenAssets.add(id);
    decks.clear();
    return !hiddenAssets.has(id);
  };
  const ambience = new Audio('./audio/cityAmbience.wav');
  ambience.loop = true;
  ambience.volume = .12;
  ambience.preload = 'none';
  const bellAudio = new Audio('./audio/bellChime.wav');
  bellAudio.volume = .22;
  bellAudio.preload = 'none';
  function startMusic() {
    if (hiddenAssets.has('cityAmbience') || typeof muted !== 'undefined' && muted) return;
    ambience.play().catch(() => {});
  }
  addEventListener('pointerdown', startMusic, {passive:true});
  addEventListener('keydown', startMusic, {passive:true});
  document.getElementById('snd').addEventListener('click', () => { if (muted) ambience.pause(); else startMusic(); });
  function onRing(bonus) {
    if (!hiddenAssets.has('bellChime') && typeof muted !== 'undefined' && !muted) {
      try { bellAudio.currentTime = 0; bellAudio.play().catch(() => {}); } catch {}
    }
    if (bonus && typeof P !== 'undefined') P.shield = 3;
  }
  const sheets = Object.create(null);
  for (const id of ['gothicCathedral','spireTower','archBridge','sunsetSky','redRoofHouse','aqueductTiers','cliffBase','bannerFleurDeLis','gothicGateRing','canalWater','sunsetCloud','pigeonFlock','bellTower','rosetteBonus','windowSparks','descentGate','gothicTile','sailBoat','lanternGlow']) {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { sheets[id] = image; decks.clear(); if (id === 'gothicGateRing') { const x=gate.getContext('2d');x.clearRect(0,0,54,70);x.drawImage(image,0,0,54,70,0,0,54,70); } };
    image.src = './stacks/' + id + '.png';
  }
  const count = { gothicCathedral: 88, spireTower: 74, archBridge: 42, redRoofHouse:38, aqueductTiers:48, cliffBase:32, bellTower:66, sailBoat:26 };
  const sizes = { gothicCathedral: 96, spireTower: 64, archBridge: 96, redRoofHouse:64, aqueductTiers:96, cliffBase:96, bellTower:64, sailBoat:64 };
  function rect(c, color, x, y, w, h) {
    c.fillStyle = color;
    c.fillRect(x | 0, y | 0, Math.max(1, w | 0), Math.max(1, h | 0));
  }
  function poly(c, color, points) {
    c.fillStyle = color;
    c.beginPath();
    for (let k = 0; k < points.length; k++) {
      const p = points[k];
      if (!k) c.moveTo(p[0], p[1]); else c.lineTo(p[0], p[1]);
    }
    c.closePath(); c.fill();
  }
  function crumbs(c, seed, x, y, w, h, s) {
    const r = rng(seed * 113 + s * 19 + 7);
    for (let n = 0; n < 26; n++) {
      const a = (x + r() * w) | 0, b = (y + r() * h) | 0;
      rect(c, r() > .68 ? '#9a8090' : '#302c46', a, b, r() > .5 ? 2 : 1, 1);
    }
  }
  function cathedral(c, s, v) {
    const light = s % 3 === 0 ? '#ffdf8c' : COLOR.gold;
    if (s < 34) {
      // базилика, выступающие контрфорсы и восточная апсида
      rect(c, COLOR.stone[(s + v) % 3 + 1], 22, 20, 52, 57);
      poly(c, '#514558', [[31, 17], [65, 17], [72, 25], [24, 25]]);
      for (let j = 0; j < 4; j++) {
        const y = 28 + j * 13;
        rect(c, '#332c44', 15, y, 10, 6);
        rect(c, '#332c44', 72, y, 9, 6);
        rect(c, '#ac8491', 16, y, 2, 2);
        rect(c, '#ac8491', 77, y, 2, 2);
        if (s > 8 && s < 29 && (s - 8) % 13 < 9) {
          rect(c, light, 22, y + 3, 2, 3);
          rect(c, light, 72, y + 3, 2, 3);
        }
      }
      if (s > 12 && s < 29) {
        const r = Math.sqrt(Math.max(0, 81 - (s - 21) * (s - 21)));
        rect(c, '#ffd47d', 48 - r, 75, r * 2, 3);
        if (s % 3 === 0) rect(c, '#5a3349', 47, 75, 2, 3);
      }
      crumbs(c, v, 25, 23, 44, 50, s);
    }
    if (s >= 34 && s < 54) {
      // ломаная двускатная крыша, медная окантовка
      const k = s - 34;
      rect(c, s % 4 === 0 ? COLOR.roofHi : COLOR.roof, 22 + k, 24, 52 - k * 2, 49);
      rect(c, '#e9a179', 46, 23, 3, 51);
      for (let y = 29; y < 70; y += 7) rect(c, '#6c334d', 25 + k, y, 46 - k * 2, 1);
    }
    for (const tx of [19, 77]) {
      const y = 24;
      if (s < 64) {
        const w = s < 45 ? 15 : s < 56 ? 13 : 11;
        rect(c, '#2d293e', tx - w / 2 - 2, y - w / 2 - 2, w + 4, w + 4);
        rect(c, COLOR.stone[(s + v + 1) % 3], tx - w / 2, y - w / 2, w, w);
        if (s > 15 && s < 53 && s % 17 < 10) {
          rect(c, light, tx - 4, y + w / 2 - 1, 3, 2);
          rect(c, light, tx + 2, y + w / 2 - 1, 3, 2);
        }
      } else if (s < 82) {
        const w = Math.max(2, 10 - ((s - 64) * .45) | 0);
        rect(c, s % 3 ? '#743c56' : '#b36c70', tx - w / 2, y - w / 2, w, w);
        if (s % 5 === 0) rect(c, '#d59c87', tx - w / 2, y, w, 1);
      } else if (s < 86) {
        rect(c, '#eac094', tx - 1, y - 4, 2, 8);
      } else {
        rect(c, '#efcaa1', tx - 4, y - 1, 8, 2);
      }
    }
    if (s < 12) for (let x = 25; x < 71; x += 11) {
      rect(c, COLOR.moss, x, 77, 5, 2);
    }
  }
  function tower(c, s, v) {
    const x = 32, y = 32, asym = (v % 3) * 2;
    if (s < 48) {
      const w = s < 13 ? 28 + asym : s < 36 ? 22 + asym : 18 + asym;
      rect(c, '#27263b', x - w / 2 - 2, y - w / 2 - 2, w + 4, w + 4);
      rect(c, COLOR.stone[(s + v) % 4], x - w / 2, y - w / 2, w, w);
      for (const b of [-1, 1]) rect(c, '#9c7e8d', x + b * (w / 2 + 2), y - 3, 3, 6);
      if (s > 8 && s < 46 && s % 16 > 3 && s % 16 < 12) {
        rect(c, '#ffd98b', x - 3, y + w / 2 - 1, 6, 2);
        rect(c, '#ffc56a', x + w / 2 - 1, y - 2, 2, 4);
      }
      if (s % 11 === 0) for (let p = -w / 2 + 2; p < w / 2; p += 5)
        rect(c, '#b0939e', x + p, y - w / 2, 2, 1);
      crumbs(c, v + 5, x - w / 2, y - w / 2, w, w, s);
    } else if (s < 68) {
      const w = Math.max(2, 19 - (s - 48));
      rect(c, s % 4 ? '#783e58' : '#b45c6d', x - w / 2, y - w / 2, w, w);
      rect(c, '#d5a08f', x, y - w / 2, 1, w);
      if (s < 58 && v % 2 === 0) rect(c, '#302b42', x - 2, y + 1, 4, 3);
    } else if (s < 73) {
      rect(c, '#e8bc8c', x - 1, y - 4, 2, 8);
    } else {
      rect(c, '#f8d19c', x - 4, y - 1, 8, 2);
    }
  }
  function bridge(c, s, v) {
    // Горизонтальная мостовая, арка действительно полая снизу.
    const near = 16, far = 80, zDeck = 28;
    if (s < zDeck) {
      const arch = Math.sqrt(Math.max(0, (s / zDeck) * (64 * 64)));
      const halfGap = (s < 6 ? 21 : s < 13 ? 26 : 27 + arch * .33);
      rect(c, '#2d293e', 7, 22, Math.max(6, 45 - halfGap), 18);
      rect(c, '#3c364d', 51 + halfGap - 21, 22, Math.max(6, 41 - halfGap), 18);
      for (const x of [8, 86]) {
        rect(c, '#a17f8a', x, 21, 2, 19);
        if (s % 8 === 0) rect(c, '#66536d', x + (x > 40 ? -4 : 2), 24, 4, 2);
      }
    } else if (s < 35) {
      rect(c, s % 3 === 0 ? '#8c6978' : '#584a62', 7, 20, 82, 22);
      if (s % 2 === 0) for (let x = 8; x < 88; x += 7) rect(c, '#3b344b', x, 25, 3, 1);
    } else if (s < 39) {
      for (const y of [18, 40]) rect(c, '#3b3349', 7, y, 82, 3);
      for (let x = 12; x < 88; x += 12) {
        rect(c, '#c09a8c', x, 18, 3, 3);
        rect(c, '#8c7485', x, 39, 3, 3);
      }
    } else {
      for (const x of [12, 36, 65, 84]) {
        rect(c, '#2c293c', x, 17, 4, 5);
        rect(c, '#ffd58c', x + 1, 18, 2, 3);
      }
    }
    if (s < 28 && s % 5 === 0) rect(c, '#856d77', 9, 21, 2, 19);
  }
  function make(id, variant = 0) {
    const key = id + ':' + variant;
    if (decks.has(key)) return decks.get(key);
    const n = count[id], size = sizes[id];
    const sl = [];
    for (let s = 0; s < n; s++) {
      const canvas = mk(size, size);
      const ctx = canvas.getContext('2d', {alpha: true});
      ctx.imageSmoothingEnabled = false;
      if (sheets[id] && (variant === 0 || id === 'redRoofHouse' || id === 'aqueductTiers' || id === 'cliffBase' || id === 'bellTower' || id === 'sailBoat')) {
        ctx.drawImage(sheets[id], s * size, 0, size, size, 0, 0, size, size);
      } else if (id === 'gothicCathedral') cathedral(ctx, s, variant);
      else if (id === 'spireTower') tower(ctx, s, variant);
      else if (id === 'redRoofHouse') {
        rect(ctx, s<20?'#756074':'#974962',16+Math.max(0,s-20),16,Math.max(4,32-Math.max(0,s-20)*2),32);
        if(s<20)for(let x=24;x<48;x+=9)rect(ctx,'#ffd18c',x,46,4,2);
      } else if (id === 'aqueductTiers') {
        for(let y=18;y<75;y+=22)for(let x=12;x<88;x+=20) {
          rect(ctx,'#53475f',x,y,11,33);rect(ctx,'#8c7181',x,y,2,33);
        }
      } else if (id === 'bellTower') {
        tower(ctx,s,variant);
        if(s>10&&s<40){rect(ctx,'#221e34',27,32,11,7);rect(ctx,'#e7bc7d',31+Math.sin(s*.5)*2,32,4,6);}
      } else if (id === 'sailBoat') {
        rect(ctx,'#6c4d5d',15,37,38,14);
        rect(ctx,'#e8b99b',31,7,3,34);
        for(let y=9;y<35;y++)rect(ctx,'#edd3b5',17,y,30-(y-9)*.5,1);
      } else if (id === 'cliffBase') {
        rect(ctx,'#4b435d',18+s*.4,16+s*.35,Math.max(5,60-s*.8),Math.max(5,65-s*.75));
      } else bridge(ctx, s, variant);
      sl.push(canvas);
    }
    const asset = { id, variant, sl, size, n, step: id === 'archBridge' ? 1.65 : 1.25 };
    decks.set(key, asset);
    return asset;
  }
  function location(i, j, n) {
    const salt = 71 + n * 23;
    const h = hash(i, j, salt);
    const id = (i===0 && j===-1 && n===0) ? 'gothicCathedral' : n === 0 && h > .71 ? 'gothicCathedral' : h < .10 ? 'archBridge' : h < .22 ? 'aqueductTiers' : h < .40 ? 'redRoofHouse' : h > .94 ? 'cliffBase' : h > .79 ? 'bellTower' : 'spireTower';
    const variant = (hash(i, j, salt + 3) * 3) | 0;
    return {id, variant,
      x: i * 380 + 45 + hash(i, j, salt + 8) * 290,
      y: j * 380 + 35 + hash(i, j, salt + 9) * 300,
      angle: hash(i, j, salt + 10) * 6.28};
  }
  const skyline = mk(640, 180);
  function makeHorizon() {
    const x = skyline.getContext('2d');
    const r = rng(9981);
    for (let n = 0; n < 120; n++) {
      const px = (r() * 650) | 0, height = 8 + (r() * 42 | 0);
      rect(x, n % 4 ? '#342b49' : '#44364c', px, 170 - height, 3 + (r() * 19 | 0), height);
      if (r() < .42) poly(x, '#2a263f', [[px, 170-height], [px+5, 160-height-(r()*32|0)], [px+11,170-height]]);
      if (n % 5 === 0) rect(x, '#c57d79', px + 3, 165 - height, 2, 2);
    }
  }
  makeHorizon();
  /* Многоплановый готический силуэт: контрфорсы, аркады и окна
     нарисованы один раз. Каждый фрагмент не повторяет шаблон соседнего. */
  function architectureLayer(seed,near){
    const art=mk(960,440),c=art.getContext('2d');
    const r=rng(seed);
    c.imageSmoothingEnabled=false;
    const tone=near?['#40334e','#56425b','#6a5268','#86657a']:['#413453','#564064','#644865','#85596f'];
    function brick(x,y,w,h,depth){
      rect(c,tone[depth%tone.length],x,y,w,h);
      for(let z=0;z<Math.max(12,(w*h/145)|0);z++){
        const xx=x+2+r()*Math.max(1,w-4),yy=y+2+r()*Math.max(1,h-4);
        rect(c,r()>.65?'#bb8490':'#312a48',xx,yy,1+(r()*3|0),1);
      }
    }
    function lancet(x,y,scale){
      rect(c,'#2c2945',x,y,Math.max(2,scale*3),Math.max(5,scale*8));
      rect(c,r()>.25?'#ffe3a0':'#e9a87f',x+scale*.6,y+scale*1.2,scale*1.7,scale*5.8);
      poly(c,'#3a304c',[[x,y+scale*2],[x+scale*1.5,y-scale*1.2],[x+scale*3,y+scale*2]]);
      rect(c,'#79556b',x+scale*1.42,y+scale*2,1,scale*5);
    }
    const base=435;
    let x=-25;
    while(x<990){
      const width=46+r()*95,height=110+r()*210;
      const px=x,py=base-height;
      brick(px,py,width,height,1+(r()*3|0));
      brick(px-5,py+20,6,height-20,3);
      brick(px+width,py+20,6,height-20,2);
      const peak=18+r()*46;
      poly(c,r()>.5?'#6c3c5b':'#864861',[[px-5,py+5],[px+width/2,py-peak],[px+width+5,py+5]]);
      poly(c,'#b36978',[[px+width/2-3,py-peak+3],[px+width/2,py-peak-3],[px+width/2+4,py-peak+3]]);
      const nWin=3+(r()*4|0),spacing=width/(nWin+1);
      for(let k=1;k<=nWin;k++)for(let row=0;row<4;row++){
        const yy=py+25+row*(24+r()*12);
        if(yy>base-19)continue;
        if(r()<.15)continue;
        lancet(px+k*spacing-3,yy,1+(r()*.6));
      }
      if(r()>.35){
        const tx=px+width*.78,th=35+r()*70,ww=8+r()*12;
        brick(tx-ww/2,py-th/2,ww,th,2);
        poly(c,'#34273d',[[tx-ww/2-3,py-th/2],[tx,py-th-20],[tx+ww/2+3,py-th/2]]);
        rect(c,'#d9a08e',tx,py-th-20,1,13);
      }
      for(let k=0;k<6;k++)if(r()>.52){
        const vx=px+r()*width,vy=py+r()*height;
        rect(c,r()>.7?'#849078':'#4b675c',vx,vy,4+r()*7,2);
      }
      x+=width*(.61+r()*.46);
    }
    // Силовой каркас многоярусных виадуков: отверстия реальны, не закрашены камнем.
    const stages=near?3:2;
    for(let row=0;row<stages;row++){
      const yy=near?178+row*84:280+row*65;
      const top=yy+6+(r()*12|0),step=near?116:143;
      rect(c,'#3c324e',0,top,960,10+row*3);
      rect(c,'#ab7785',0,top,960,2);
      for(let k=0;k<12;k++){
        const cx=k*step+(row%2?step*.45:0)+(r()-.5)*28;
        const wide=step*.64+r()*15;
        brick(cx-wide/2,top+9,13+(r()*6|0),105+row*22,2);
        brick(cx+wide/2-13,top+9,16,105+row*22,3);
        const crown=top+40+r()*10;
        // Лучистая стрельчатая арка — каменные рёбра над воздухом.
        for(let h=0;h<29;h+=2){
          const progress=h/29,span=(1-progress)*wide*.43;
          const y=crown-progress*30;
          rect(c,'#6d516c',cx-span-4,y,9,3);
          rect(c,'#8b6577',cx+span-4,y,9,3);
        }
        for(let j=0;j<3;j++)lancet(cx-wide/2+2,top+19+j*20,.7);
        if(row===0 && k%2===0){rect(c,'#c17f80',cx-wide/2-4,top-4,10,3);rect(c,'#ffd795',cx-wide/2+1,top-8,3,4);}
      }
    }
    return art;
  }
  const backdropFar=architectureLayer(3437,false);
  const backdropNear=architectureLayer(8931,true);
  function drawArchitecture(horizon,fade){
    const layers=[[backdropFar,1.53,.74,.45],[backdropNear,1.92,.94,.75]];
    for(const [pic,mult,up,alpha] of layers){
      const width=W*mult,height=Math.max(H*.66,140),speed=alpha*.045;
      const dx=((cam.x*speed+t*(alpha+.2))%width+width)%width;
      g.globalAlpha=fade*alpha;
      for(let k=-1;k<=Math.ceil(W/width)+1;k++)
        g.drawImage(pic,k*width-dx,horizon-height*up,width,height);
    }
  }
  function drawBackground() {
    const fade = clamp((165 - P.z) / 115, .22, 1);
    g.save();
    g.setTransform(1,0,0,1,0,0);
    if (sheets.sunsetSky && !hiddenAssets.has('sunsetSky')) {
      g.globalAlpha = fade * .45;
      g.drawImage(sheets.sunsetSky, 0, 0, W, H);
    }
    // Небо + фиолетовое закатное море поверх GPU: плоскости мягко меняются по высоте.
    const horizon = H * (.55 + Math.sin(cam.phi - .62) * .13);
    const sky = g.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,'#241f42');
    sky.addColorStop(.34,'#8c5275');
    sky.addColorStop(.57,'#ed9b83');
    sky.addColorStop(.69,'#f6b277');
    sky.addColorStop(1,'#3d3557');
    g.globalAlpha = fade * .96;
    g.fillStyle = sky; g.fillRect(0,0,W,H);
    // Мерцающий золотой канал — полоса воды под городским горизонтом.
    if(sheets.canalWater && !hiddenAssets.has('canalWater')) {
      const waterY = Math.max(0,horizon+H*.03);
      g.globalAlpha = fade * .18;
      const drift=((t*3)%128+128)%128;
      for(let x=-128-drift;x<W+128;x+=128)
        g.drawImage(sheets.canalWater,x,waterY,128,H-waterY);
    }
    // Дальние шпили — отдельный параллаксный слой.
    g.globalAlpha = fade * .83;
    const sh = Math.max(35, H * .29);
    const shift = ((cam.x * .018 + t * 1.1) % 640 + 640) % 640;
    for(let i = -1; i < Math.ceil(W / 640)+2; i++)
      g.drawImage(skyline, i*640-shift, horizon-sh, 640, sh);
    // Огромное пиксельное солнце в дымке, ступенчатые края.
    const sx = W * .72 - Math.sin(cam.a) * W * .08, sy = horizon - H * .075;
    for(let k = 14; k > 0; k--) {
      const yy = (k - 7) * Math.max(1, H*.006);
      const half = Math.sqrt(Math.max(0, 1 - ((k - 7)/7)**2)) * H*.085;
      g.fillStyle = k > 9 ? '#f8c795' : '#ffe0a0';
      g.fillRect((sx-half)|0, (sy+yy)|0, (half*2)|0, Math.max(1,H*.006)|0);
    }
    drawArchitecture(horizon,fade);
    // Нерегулярные полосы облаков: избегаем повторяющегося синусоидального узора.
    g.globalAlpha = fade*.37;
    for(let n = 0; n < 23; n++) {
      const x = ((hash(n,22,19)*W*1.7 - t*(2+hash(n,22,20)*5)) % (W*1.6) + W*1.6) % (W*1.6) - W*.3;
      const y = horizon * (.14 + hash(n,22,23)*.8);
      const length = (12 + hash(n,23,31)*62) * (W/350);
      rect(g, n%3===0?'#f9b299':'#d894ac', x, y, length, 1+hash(n,18,21)*3);
    }
    g.restore();
  }
  function addRenderItems(items) {
    const fade = clamp((150 - P.z) / 95, .12, 1);
    if(fade < .15) return;
    let budget = 45;
    const ci = Math.floor(P.x/380), cj = Math.floor(P.y/380);
    for (let i = ci-3; i <= ci+3 && budget>0; i++) {
      for (let j = cj-3; j <= cj+3 && budget>0; j++) {
        // Две разные постройки на квартал, без повторяющейся регулярной расстановки.
        for (let n=0; n<2 && budget>0; n++) {
          const b = location(i,j,n);
          const q = proj(b.x,b.y,20);
          if (!q || q[3]>1500 || q[3]<16) continue;
          const height = count[b.id] * 1.4*q[2];
          const radius = sizes[b.id] * q[2] + 30;
          if(q[0]<-radius || q[0]>W+radius || q[1]<-height-radius || q[1]>H+radius) continue;
          budget--;
          if(hiddenAssets.has(b.id)) continue;
          const asset = make(b.id,b.variant);
          items.push({d:q[3],f:()=>{
            g.globalAlpha = fade * clamp(1.2-q[3]/1700,.15,1);
            // Подножие из неоднородного гранита, мох на уступах.
            const foot = planeT(b.x,b.y,-4);
            if (foot) {
              g.setTransform(foot[0],foot[1],foot[2],foot[3],foot[4],foot[5]);
              g.rotate(b.angle);
              g.fillStyle = '#332d46';
              g.fillRect(-asset.size*.43,-asset.size*.45,asset.size*.86,asset.size*.88);
              if (sheets.gothicTile && !hiddenAssets.has('gothicTile')) {
                g.globalAlpha=fade*.65;
                g.drawImage(sheets.gothicTile,-asset.size*.43,-asset.size*.45,asset.size*.86,asset.size*.88);
                g.globalAlpha=fade;
              }
            }
            const skip = q[2]<.18?6:q[2]<.36?4:q[2]<.65?2:1;
            for (let s=0; s<asset.n; s+=skip) {
              const z = s*asset.step;
              const m = planeT(b.x,b.y,z);
              if(!m) break;
              g.setTransform(m[0],m[1],m[2],m[3],Math.round(m[4]),Math.round(m[5]));
              g.rotate(b.angle);
              g.drawImage(asset.sl[s],-asset.size/2,-asset.size/2);
            }
            // Знамя под ветром на высотных фасадах: живая волна из отдельных срезов.
            if(sheets.bannerFleurDeLis && !hiddenAssets.has('bannerFleurDeLis') && (b.id === 'gothicCathedral' || b.id === 'redRoofHouse') && q[2]>.28) {
              const flag=proj(b.x+25,b.y+12,35);
              if(flag){
                const phase=(Math.floor(t*4+hash(i,j,89)*8)%8+8)%8;
                g.setTransform(q[2],0,0,q[2],flag[0],flag[1]);
                g.drawImage(sheets.bannerFleurDeLis,phase*32,0,32,48,-6,-22,32,48);
              }
            }
            // Живые окна, фонари и стаи птиц появляются в городском объёме.
            const sprites = [
              ['windowSparks',48,48,42,-12,5],
              ['lanternGlow',32,32,28,36,7],
              ['pigeonFlock',64,64,70,0,13]
            ];
            for(const [id,sw,sh,alt,dx,dy] of sprites) {
              if(!sheets[id] || hiddenAssets.has(id) || hash(i,j,id.length) < (id==='pigeonFlock'?.73:.35))continue;
              const at=proj(b.x+dx,b.y+dy,alt);
              if(!at || at[2]<.16)continue;
              const frame=(Math.floor(t*(id==='pigeonFlock'?6:4)+hash(i,j,31)*7)% (id==='pigeonFlock'?12:8)+12)% (id==='pigeonFlock'?12:8);
              const scale=at[2]*(id==='pigeonFlock'?1.25:.8);
              g.setTransform(scale,0,0,scale,at[0],at[1]);
              g.globalAlpha=fade*.8;
              g.drawImage(sheets[id],frame*sw,0,sw,sh,-sw/2,-sh/2,sw,sh);
            }
            g.globalAlpha=1;
          }});
        }
      }
    }
  }
  // Дымка меняет глубину при снижении, облака уходят из кадра.
  const effects = mk(64,64);
  function drawCloudsAndBoats(items){
    // Sprite-stack, not animated flat sprites: every moving boat and cloud
    // gets a true vertical volume. Each band projects onto the world plane.
    for(let n=0;n<15;n++){
      const i=Math.floor(P.x/450)+(n%5)-2, j=Math.floor(P.y/450)+Math.floor(n/5)-1;
      const boat=n%3===0, id=boat?'sailBoat':'sunsetCloud';
      const strip=sheets[id];
      if(!strip || hiddenAssets.has(id))continue;
      const phase=hash(i,j,54)*TAU;
      const x=i*450+hash(i,j,47)*300+(boat?0:t*2.2),
            y=j*450+hash(i,j,48)*300+(boat?Math.sin(t*.35+phase)*4:t*.85);
      const z=boat?4+Math.sin(t*1.25+phase)*1.2:80+hash(i,j,49)*40+Math.sin(t*.4+phase)*2.5;
      const base=proj(x,y,z),nSlices=boat?26:8,side=64;
      if(!base||base[3]<10||base[3]>1250||base[2]<.17||
         base[0]<-125||base[0]>W+125||base[1]<-145||base[1]>H+130)continue;
      items.push({d:base[3],f:()=>{
        g.save();
        const fade=clamp(1-base[3]/1900,.18,1) * (boat?1:.73);
        const skip=base[2]<.3?4:base[2]<.6?2:1;
        // Soft trails behind a sailing boat: displaced reflected highlights.
        if(boat){
          const water=planeT(x,y,1);
          if(water){
            g.setTransform(water[0],water[1],water[2],water[3],water[4],water[5]);
            g.rotate(phase*.12);
            g.strokeStyle='rgba(250,192,138,.36)';
            g.lineWidth=1.25;g.globalAlpha=fade;
            for(let w=0;w<4;w++){
              g.beginPath();
              g.moveTo(-8-w*5,-8-w*8);
              g.quadraticCurveTo(-2-w*7,2-w*5,12+w*4,8-w*6);
              g.stroke();
            }
          }
        }
        // Render each real PNG slice in world space, from hull to sail tip.
        // LOD affects the sampling rate only; top remains visible.
        for(let s=0;s<nSlices;s+=skip){
          const lift=s*(boat?1.05:2.15);
          const m=planeT(x,y,z+lift);
          if(!m)break;
          g.globalAlpha=fade*(boat?1:.91);
          g.setTransform(m[0],m[1],m[2],m[3],Math.round(m[4]),Math.round(m[5]));
          g.rotate((boat?.035:.08)*Math.sin(t*(boat?1.2:.38)+phase+s*.13));
          g.drawImage(strip,s*side,0,side,side,-side/2,-side/2,side,side);
        }
        // At low LOD preserve the upper silhouette (sail or cloud cap).
        if((nSlices-1)%skip){
          const s=nSlices-1,m=planeT(x,y,z+s*(boat?1.05:2.15));
          if(m){
            g.globalAlpha=fade;g.setTransform(m[0],m[1],m[2],m[3],Math.round(m[4]),Math.round(m[5]));
            g.drawImage(strip,s*side,0,side,side,-side/2,-side/2,side,side);
          }
        }
        g.restore();
      }});
    }
  }
  function paintTransition(){
    if (!sheets.descentGate || hiddenAssets.has('descentGate')) return;
    const k=Math.max(0,1-Math.abs(P.z-95)/26);
    if(k<.01)return;
    const frame=(Math.floor(t*2)%8+8)%8;
    g.save();
    g.setTransform(1,0,0,1,0,0);
    g.globalAlpha=k*.34;
    const z=Math.max(W,H)*.85;
    g.drawImage(sheets.descentGate,frame*64,0,64,64,W/2-z/2,H/2-z/2,z,z);
    g.restore();
  }
  const gate = mk(54,70);
  { const c=gate.getContext('2d'); c.imageSmoothingEnabled=false;
    for(let s=0;s<4;s++) {
      c.strokeStyle = ['#5a3048','#9c5571','#f5b46c','#ffe2aa'][s];
      c.lineWidth=6-s;
      c.beginPath(); c.moveTo(8+s,67); c.lineTo(8+s,23);
      c.lineTo(27,5+s*2); c.lineTo(46-s,23); c.lineTo(46-s,67); c.stroke();
    }
    rect(c,'#ffcf83',24,11,5,5);
    for(let n=0;n<4;n++){rect(c,'#ffe1a7',7,22+n*10,3,3);rect(c,'#ffe1a7',44,22+n*10,3,3);}
  }
  function drawBonusAt(q, scale){
    if(!sheets.rosetteBonus || hiddenAssets.has('rosetteBonus')){g.drawImage(gate,-27,-35);return;}
    const frame=(Math.floor(t*4)%8+8)%8;
    g.drawImage(sheets.rosetteBonus,frame*48,0,48,48,-24,-24,48,48);
  }
  function drawShield(){
    if(!P.shield || P.shield<=0) return;
    const q=proj(P.x,P.y,P.z+Math.sin(t*1.7)*1.4);
    if(!q)return;
    g.save();g.globalAlpha=Math.min(.65,P.shield*.32);
    const r=q[2]*20;
    g.setTransform(1,0,0,1,q[0],q[1]);
    g.strokeStyle='#ffe1a0';g.lineWidth=Math.max(1,q[2]*2);
    g.beginPath();
    for(let j=0;j<=12;j++){
      const angle=(j/12)*TAU+t*.5;
      const x=Math.cos(angle)*(r+Math.sin(j+t*4)*2);
      const y=Math.sin(angle)*(r+Math.sin(j+t*4)*2);
      if(!j)g.moveTo(x,y);else g.lineTo(x,y);
    }
    g.stroke();g.restore();
  }
  return {drawBackground, addRenderItems, gate, drawCloudsAndBoats, paintTransition, onRing, drawBonusAt, drawShield};
})();
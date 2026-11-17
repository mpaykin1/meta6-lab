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
  const sheets = Object.create(null);
  for (const id of ['gothicCathedral','spireTower','archBridge','sunsetSky','redRoofHouse','aqueductTiers','cliffBase','bannerFleurDeLis','gothicGateRing','canalWater']) {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => { sheets[id] = image; decks.clear(); if (id === 'gothicGateRing') { const x=gate.getContext('2d');x.clearRect(0,0,54,70);x.drawImage(image,0,0,54,70,0,0,54,70); } };
    image.src = './stacks/' + id + '.png';
  }
  const count = { gothicCathedral: 88, spireTower: 74, archBridge: 42, redRoofHouse:38, aqueductTiers:48, cliffBase:32 };
  const sizes = { gothicCathedral: 96, spireTower: 64, archBridge: 96, redRoofHouse:64, aqueductTiers:96, cliffBase:96 };
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
      if (sheets[id] && (variant === 0 || id === 'redRoofHouse' || id === 'aqueductTiers' || id === 'cliffBase')) {
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
    const id = n === 0 && h > .66 ? 'gothicCathedral' : h < .12 ? 'archBridge' : h < .24 ? 'aqueductTiers' : h < .48 ? 'redRoofHouse' : h > .92 ? 'cliffBase' : 'spireTower';
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
  function drawBackground() {
    const fade = clamp((165 - P.z) / 115, .22, 1);
    g.save();
    g.setTransform(1,0,0,1,0,0);
    if (sheets.sunsetSky) {
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
    if(sheets.canalWater) {
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
            if(sheets.bannerFleurDeLis && (b.id === 'gothicCathedral' || b.id === 'redRoofHouse') && q[2]>.28) {
              const flag=proj(b.x+25,b.y+12,35);
              if(flag){
                const phase=(Math.floor(t*4+hash(i,j,89)*8)%8+8)%8;
                g.setTransform(q[2],0,0,q[2],flag[0],flag[1]);
                g.drawImage(sheets.bannerFleurDeLis,phase*32,0,32,48,-6,-22,32,48);
              }
            }
            g.globalAlpha=1;
          }});
        }
      }
    }
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
  return {drawBackground, addRenderItems, gate};
})();
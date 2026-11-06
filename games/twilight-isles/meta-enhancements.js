/* META GAMES additive layer for Twilight Isles; the original renderer, combat and retention remain intact. */
(function () {
  'use strict';
  function ready() {
    const game = window.__isle;
    const arch = window.__arch;
    if (!game || !arch || !game.world) return false;
    init(game, arch);
    return true;
  }
  if (!ready()) {
    let checks = 0;
    const wait = setInterval(function () {
      checks++;
      if (ready() || checks > 400) clearInterval(wait);
    }, 50);
  }

  function init(game, arch) {
    if (window.__META_LAYER__) return;
    const $ = id => document.getElementById(id);
    const ru = () => window.LANG === 'ru';
    const pick = (en, ruText) => ru() ? ruText : en;
    // Observe the same solid voxel terrain as the real player, without changing it.
    // The bot's watchdog must measure the next reachable cell, not a straight
    // line through an impassable cliff while a genuine detour is in progress.
    let navWorld=null, navEdges=null, navSize=0;
    function nextTraversablePoint(world, player, target) {
      const W=Math.round(Math.sqrt(world.stand.length)), D=W, H=world.vox.length/(W*D);
      if(!Number.isInteger(W)||!Number.isInteger(H)||!world.reach)return target;
      if(navWorld!==world) {
        const edges=new Uint8Array(W*D), step=[[1,0],[0,1],[-1,0],[0,-1]];
        const clear=(x,z,y)=>y>=0&&y<H-1&&!world.vox[x+W*(z+D*y)]&&!world.vox[x+W*(z+D*(y+1))];
        for(let z=0;z<D;z++)for(let x=0;x<W;x++){
          const i=x+z*W;if(!world.reach[i]||world.stand[i]>=99)continue;
          step.forEach(([dx,dz],bit)=>{
            const X=x+dx,Z=z+dz,j=X+Z*W;
            if(X<0||Z<0||X>=W||Z>=D||!world.reach[j]||world.stand[j]>=99)return;
            const top=Math.max(world.stand[i],world.stand[j]);
            if(world.stand[j]-world.stand[i]<=2&&clear(x,z,top)&&clear(X,Z,top))edges[i]|=1<<bit;
          });
        }
        navWorld=world;navEdges=edges;navSize=W;
      }
      const cell=(x,z)=> {
        const X=Math.floor(x),Z=Math.floor(z);
        return X<0||Z<0||X>=W||Z>=D?-1:X+Z*W;
      };
      let start=cell(player.x,player.z);
      if(start<0||!world.reach[start]){
        let best=Infinity;
        for(let i=0;i<W*D;i++)if(world.reach[i]){
          const d=Math.hypot(i%W+.5-player.x,Math.floor(i/W)+.5-player.z);
          if(d<best){best=d;start=i}
        }
      }
      if(start<0)return target;
      const previous=new Int32Array(W*D).fill(-1);
      const distance=new Int32Array(W*D).fill(-1);
      const queue=[start],shift=[1,W,-1,-W];distance[start]=0;
      for(let n=0;n<queue.length;n++){
        const i=queue[n];
        for(let k=0;k<4;k++)if(navEdges[i]&(1<<k)){
          const j=i+shift[k];
          if(j>=0&&j<distance.length&&distance[j]<0){
            previous[j]=i;distance[j]=distance[i]+1;queue.push(j);
          }
        }
      }
      let end=cell(target.x,target.z);
      if(end<0||distance[end]<0){
        let best=Infinity;
        for(const i of queue){
          const d=Math.hypot(i%W+.5-target.x,Math.floor(i/W)+.5-target.z);
          const v=10000*d+distance[i];
          if(v<best){best=v;end=i}
        }
      }
      if(end<0||distance[end]<0)return target;
      const path=[];
      for(let i=end;i!==-1;i=previous[i])path.push(i);
      path.reverse();
      while(path.length>1&&Math.hypot(path[0]%W+.5-player.x,Math.floor(path[0]/W)+.5-player.z)<.32)path.shift();
      const next=path[0];
      return {x:next%W+.5,z:Math.floor(next/W)+.5};
    }

    // Measure actual enemy damage between snapshots. Observation only.
    const observedEnemyHP = new WeakMap();
    let measuredDamage = 0;
    function realCombatProgress() {
      for (const foe of new Set([...(game.foes || []), game.G.warden].filter(Boolean))) {
        if (!Number.isFinite(foe.hp)) continue;
        const hp = Math.max(0, foe.hp), before = observedEnemyHP.get(foe);
        if (before !== undefined && hp < before) measuredDamage += before - hp;
        observedEnemyHP.set(foe, hp);
      }
      return measuredDamage;
    }

    const storeKey = 'meta.isles.unlocked.v1';
    let stored = [];
    try { stored = JSON.parse(localStorage.getItem(storeKey) || '[]'); } catch (_) {}
    if (!Array.isArray(stored)) stored = [];
    const unlocked = new Set(stored.filter(x => typeof x === 'string'));
    const history = [];
    const seen = new Set();
    const memoryAlbum = [];

    let lastKills = game.G.kills, lastState = game.G.state, lastIsland = arch.island.join(',');
    let circle = 1;
    try { circle = Math.max(1, Math.floor(+localStorage.getItem('meta.isles.circle') || 1)); } catch (_) {}
    let bannerUntil = 0;
    const known = {weapon: [], relic: []};
    const memory = [
      {id:'beacon', x:()=>game.world.beacon.x, z:()=>game.world.beacon.z,
        en:'I hid under the lighthouse stairs. The light kept counting my steps...',
        ru:'Я спрятался под ступенями маяка. Свет всё считал мои шаги...',
        en2:'I climbed the stairs a second time. The scratches were at my height.',
        ru2:'Я снова поднялся по лестнице. Царапины были на высоте моего роста.',
        en3:'I left three lights on. Someone blew out the one above my bed.',
        ru3:'Я оставил три огонька. Кто-то задул тот, что был над моей кроватью.'},
      {id:'shore', x:()=>game.world.spawn.x, z:()=>game.world.spawn.z,
        condition:()=>game.G.play>10 && game.G.collected>0,
        en:'I drew a circle in the wet sand. The water kept its shape.',
        ru:'Я нарисовал круг на мокром песке. Вода сохранила его след.',
        en2:'I returned to the circle. There were little footprints going into the sea.',
        ru2:'Я вернулся к кругу. Маленькие следы уходили прямо в море.',
        en3:'I saw the circle again. The water moved around it like a wall.',
        ru3:'Я снова увидел круг. Вода обтекала его, словно стену.'},
      {id:'whale', condition:()=>arch.WV && arch.WV.mode !== 'idle',
        en:'I called into the dark water. Something answered in my own voice...',
        ru:'Я позвал в тёмную воду. Кто-то ответил моим голосом...',
        en2:'I heard a lullaby beneath the whale. Nobody was singing on the shore.',
        ru2:'Я услышал под китом колыбельную. На берегу никто не пел.',
        en3:'I swam after that song. Above the waves I saw a ceiling, not a sky.',
        ru3:'Я поплыл за песней. Над волнами я увидел потолок, а не небо.'}
    ];
    const achieved = [];

    const toggle = document.createElement('button');
    toggle.id = 'metaMenuToggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', pick('Open journal and menu', 'Открыть меню и дневник'));
    toggle.textContent = '☰';
    const panel = document.createElement('section');
    panel.id = 'metaMenu';
    panel.hidden = true;
    panel.setAttribute('aria-label', pick('Island journal', 'Дневник острова'));
    panel.setAttribute('role', 'dialog');
    const close = document.createElement('button');
    close.id = 'metaClose';
    close.type = 'button';
    close.setAttribute('aria-label', pick('Return to island', 'Вернуться на остров'));
    close.textContent = '×';
    const head = document.createElement('h2');
    head.textContent = pick('THE ISLAND REMEMBERS', 'ОСТРОВ ПОМНИТ');
    const body = document.createElement('div');
    body.id = 'metaMenuBody';
    panel.append(close, head, body);
    const banner = document.createElement('aside');
    banner.id = 'metaMemory';
    banner.hidden = true;
    banner.setAttribute('aria-live','off');
    document.body.append(toggle, panel, banner);
    function pauseKey() {
      window.dispatchEvent(new KeyboardEvent('keydown', {code:'KeyP', key:'p', bubbles:true}));
      window.dispatchEvent(new KeyboardEvent('keyup', {code:'KeyP', key:'p', bubbles:true}));
    }
    function openMenu(show) {
      if (!show && !panel.hidden) {
        panel.hidden = true;
        document.body.classList.remove('metaMenuOpen');
        if (game.G.state === 'paused') pauseKey();
        $('c').focus();
      } else if (show && panel.hidden) {
        if (game.G.state === 'play') pauseKey();
        drawMenu();
        panel.hidden = false;
        document.body.classList.add('metaMenuOpen');
        close.focus();
      }
    }
    toggle.addEventListener('click', () => openMenu(panel.hidden));
    close.addEventListener('click', () => openMenu(false));
    document.addEventListener('keydown', e => {
      if (e.code === 'Escape' && !panel.hidden) { e.preventDefault(); openMenu(false); }
    });
    function el(parent, tag, content, cls) {
      const node = document.createElement(tag);
      if (cls) node.className = cls;
      node.textContent = content;
      parent.append(node);
      return node;
    }
    function drawMenu() {
      body.replaceChildren();
      const G = game.G;
      el(body, 'h3', pick('THE JOURNEY', 'ПУТЬ'));
      el(body, 'p', pick('Island ', 'Остров ') + arch.island.join(':') + ' · ' +
        pick('Circle ', 'Круг ') + circle + ' · ' +
        pick('Sparks and lanterns light the shore.', 'Искры и фонари освещают берег.'));
      el(body,'p',pick('Coins: ', 'Монеты: ') + G.collected + '/' + G.total +
        ' · ' + pick('Victories: ', 'Победы: ') + G.kills +
        ' · ' + pick('Time: ', 'Время: ') + Math.floor(G.play) + 's');
      el(body,'h3',pick('WEAPONS', 'ОРУЖИЕ'));
      for (const id of game.combat.arsenal) {
        const w = game.WEAPONS[id];
        if (w) el(body,'p',w.name + ' — ' + (w.desc || w.stat || ''), 'metaEntry');
      }
      el(body, 'h3', pick('DISCOVERIES', 'ОТКРЫТИЯ'));
      if (!history.length && !unlocked.size) el(body,'p',pick('Defeat a shadow to reveal the next find.', 'Победи тень, чтобы открыть следующую находку.'));
      for (const key of unlocked) el(body,'p',key.replace(':',' · '),'metaEntry');
      for (const item of achieved.slice(-12)) el(body, 'p', item, 'metaEntry');
      el(body,'h3',pick('MEMORIES', 'ВОСПОМИНАНИЯ'));
      if (!seen.size) el(body,'p',pick('Explore the shore and the lighthouse.', 'Исследуй берег и маяк.'));
      for (const entry of memoryAlbum) el(body,'p',entry,'metaEntry');
      if (G.state === 'victory' || arch.lit) {
        el(body,'h3',pick('A STORY AFTER THE LIGHT', 'ИСТОРИЯ ПОСЛЕ СВЕТА'));
        el(body,'p',pick(
          'I was small when the lighthouse went dark. I hid by the stairs and counted every wave. ' +
          'Someone called from the sea with my voice. Each time I light the tower, I remember one more night. ' +
          'The islands are not new places. They are the places I was afraid to return to.',
          'Я был маленьким, когда маяк погас. Я спрятался у лестницы и считал волны. ' +
          'Из моря меня окликнули моим голосом. С каждым зажжённым маяком я вспоминаю ещё одну ночь. ' +
          'Острова — не новые места. Это места, куда я боялся возвращаться.'
        ));
      }
      el(body,'h3',pick('CONTROLS', 'УПРАВЛЕНИЕ'));
      el(body,'p',pick('WASD move · Space jump · J strike · Q/E weapon · P pause. On phone: drag left to walk; right buttons to strike and jump.',
          'WASD движение · Пробел прыжок · J удар · Q/E оружие · P пауза. На телефоне: левым пальцем идти, кнопки справа — удар и прыжок.'));
      const sound = document.createElement('button');
      sound.type='button'; sound.className='metaAction'; sound.textContent=pick('Toggle sound', 'Переключить звук');
      sound.addEventListener('click',()=>{ $('btnMute').click(); drawMenu(); });
      body.append(sound);
    }
    function showMessage(txt, duration) {
      banner.dataset.message=txt;
      banner.hidden=false;
      banner.classList.remove('metaFade');
      bannerUntil=performance.now() + (duration || 4500);
    }
    function persist() {
      try { localStorage.setItem(storeKey,JSON.stringify([...unlocked])); } catch (_) {}
    }
    function unlockOne() {
      const loot = game.loot.filter(L=>L && L.id);
      const relics = game.relics.filter(R=>R && R.id);
      for (const L of loot) if (!known.weapon.includes(L.id)) known.weapon.push(L.id);
      for (const R of relics) if (!known.relic.includes(R.id)) known.relic.push(R.id);
      const candidates = [
        ...known.weapon.map(id=>({type:'weapon', id})),
        ...known.relic.map(id=>({type:'relic', id}))
      ];
      const old = history.length?history[history.length-1].type:null;
      const sorted = candidates.filter(x=>!unlocked.has(x.type+':'+x.id))
        .sort((a,b) => Number(a.type===old)-Number(b.type===old));
      const next=sorted[0];
      if (!next) return;
      unlocked.add(next.type+':'+next.id);
      history.push(next);
      persist();
      const data=next.type==='weapon'?game.WEAPONS[next.id]:game.REG.relics.get(next.id);
      const name=(data && data.name)||next.id;
      const effect=(data && (data.desc||data.stat))||pick('A new tool for your journey.', 'Новый инструмент в пути.');
      showMessage(pick('DISCOVERED: ', 'ОТКРЫТО: ')+name+' — '+effect, 5300);
      achieved.push(name+' — '+effect);
      // The original item remains in its original location, with its original pickup mechanics.
    }
    const layer = Object.freeze({
      allowLoot(L) { return !!L.gift || unlocked.has('weapon:'+L.id); },
      allowRelic(R) { return unlocked.has('relic:'+R.id); },
      get unlocks(){return unlocked.size;},
      get circle(){return circle;}
    });
    Object.defineProperty(window,'__META_LAYER__',{value:layer, configurable:false, writable:false});
    // A fresh plain-data snapshot on each access. No exposed actions, setters, teleports or combat cheats.
    Object.defineProperty(window, '__META_BOT__', {
      enumerable: false, configurable: false,
      get: function () {
        const G=game.G, w=game.world, p=game.player.pos;
        const alive=G.state!=='dead' && game.player.hp>0;
        const choices = game.coins.filter(c=>c.alive);
        choices.sort((a,b) => Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z));
        const boss = G.warden && G.warden.hp>0 && G.warden.state!=='dissolve' ? G.warden.segs[0] : null;
        const firstEnemy = !G.kills ? game.foes.find(f=>f.hp>0 && f.state!=='dissolve' && !f.def.boss) : null;
        // Seek already-unlocked, genuinely collectible weapons before a long
        // boss battle; the physical pickup still requires walking into its reach.
        const availableLoot = game.loot.filter(L => L.alive && game.WEAPONS[L.id] &&
          !game.combat.arsenal.includes(L.id) && layer.allowLoot(L) &&
          w.reach[Math.floor(L.x)+Math.floor(L.z)*Math.round(Math.sqrt(w.reach.length))]);
        availableLoot.sort((a,b) => Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z));
        const nearestLoot = availableLoot[0];
        const weaponGoal = game.combat.arsenal.length < 3 && nearestLoot &&
          Math.hypot(nearestLoot.x-p.x,nearestLoot.z-p.z) < 12 ? nearestLoot : null;
        const actualTarget = arch.guideTarget() || (firstEnemy ? firstEnemy.segs[0] :
          weaponGoal || (choices.length ? choices[0] : boss || w.ring || w.beacon));
        const target = nextTraversablePoint(w, p, actualTarget);
        const foes=game.foes.filter(f=>f && f.state!=='dissolve' && f.hp>0);
        const h=String((G.seed>>>0).toString(16)) + ':' + G.biome + ':' + arch.island.join(',');
        // Real island world fingerprint, not a fabricated per-stage identifier.
        const layout=h + ':' + w.spawn.x.toFixed(1) + ':' + w.spawn.z.toFixed(1) +
          ':' + w.beacon.x.toFixed(1) + ':' + w.beacon.z.toFixed(1);
        return Object.freeze({
          level:1, totalLevels:1,
          player:{x:+p.x, y:+p.y, z:+p.z},
          goal:{x:+target.x, z:+target.z},
          alive:!!alive,
          completed:G.state==='victory',
          buttons:['W','A','S','D','Space','J','Q','E','touch-stick','attack','jump'],
          layout,
          combat:true,
          progress:G.collected + Math.max(0,game.combat.arsenal.length-1) +
            G.kills + realCombatProgress()/100 + (G.wardenDown?1:0),
          enemies:foes.length,
          weapons:game.combat.arsenal.length,
          menuOpen:!panel.hidden
        });
      }
    });
    const onDone = () => {
      circle++;
      seen.clear();
      try {localStorage.setItem('meta.isles.circle', String(circle));}catch(_){}
      achieved.push(pick('The sea remembers another night.', 'Море помнит ещё одну ночь.'));
    };
    $('btnSwim')?.addEventListener('click', onDone);
    let lastTick=0;
    function tick(now) {
      requestAnimationFrame(tick);
      if (now-lastTick<150) return;
      lastTick=now;
      const G=game.G;
      const playing=G.state==='play';
      toggle.hidden = !(playing||G.state==='paused'||G.state==='victory');
      const count=$('coins');
      if (count) count.style.setProperty('--meta-coin-fill', (G.total?Math.max(0,Math.min(1,G.collected/G.total)):0)*100+'%');
      if (G.kills<lastKills) lastKills=G.kills;
      if (G.kills>lastKills) {
        for(let k=lastKills;k<G.kills;k++) unlockOne();
        lastKills=G.kills;
      }
      if (bannerUntil && now>bannerUntil) {
        banner.hidden=true;
        bannerUntil=0;
      }
      if (playing && G.danger<0.12 && !bannerUntil) {
        for (const m of memory) {
          if (seen.has(m.id)) continue;
          if (m.condition && !m.condition()) continue;
          if (m.x && Math.hypot(game.player.pos.x-m.x(),game.player.pos.z-m.z())>8) continue;
          seen.add(m.id);
          const variant = circle>=3?'3':circle===2?'2':'';
          const fragment = (ru()?m['ru'+variant]:m['en'+variant]) || (ru()?m.ru:m.en);
          memoryAlbum.push(pick('Circle ', 'Круг ')+circle+': '+fragment);
          showMessage(fragment,4500);
          break;
        }
      }
      if (arch.island.join(',')!==lastIsland) {
        lastIsland=arch.island.join(',');
        lastKills=0;
        showMessage(pick('The mist opens a different memory.', 'Туман открыл другое воспоминание.'),3000);
      }
      if (lastState!==G.state) {
        lastState=G.state;
        if(G.state==='victory') achieved.push(pick('The lighthouse remembers the light.', 'Маяк вспомнил свет.'));
        if(G.state!=='play' && G.state!=='paused' && !panel.hidden) openMenu(false);
      }
    }
    requestAnimationFrame(tick);
  }
})();
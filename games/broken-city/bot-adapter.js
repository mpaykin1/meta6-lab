// Read-only META BOT adapter for Broken City, using the existing game's actual debug snapshot.
// No access to movement/revival/mutation methods is returned to the bot.
(() => {
  'use strict';
  const get = () => window.__G;
  let layoutKey = '', layoutHash = '';
  function fingerprint(debug) {
    const game = debug.G;
    const key = game.cycle + ':' + game.li + ':' + game.variant;
    if (key !== layoutKey) {
      const field = debug.BOT.get(); // Reads existing world geometry; does not move the hero.
      const places = [
        ...field.bridges.slice(0, 8).map(v => ['b', v.userData.gz, v.userData.gapLen]),
        ...field.cracks.slice(0, 8).map(v => ['c', v.userData.z, v.userData.len]),
        ...field.stations.slice(0, 8).map(v => ['s', v.userData.z, v.userData.side]),
        ...field.truins.slice(0, 8).map(v => ['r', v.x, v.z]),
        ...(field.CR?.chasms || []).slice(0, 8).map(v => ['h', v.zNear, v.zFar])
      ];
      layoutHash = JSON.stringify([game.li, places]); // Only true layout; no cycle/cosmetic entropy.
      layoutKey = key;
    }
    return layoutHash;
  }
  const bot = Object.freeze({
    version: 1,
    info() { return Object.freeze({name:'Broken City',levels:9}); },
    state() {
      const debug = get();
      if (!debug?.G || !debug.heroState) return {
        started:false,level:0,levelDone:false,gameDone:false,alive:true,
        hero:{x:0,y:0},goal:null,enemies:0,weapons:0,layoutHash:'',
        menuOpen:false
      };
      const g=debug.G, p=debug.heroState.pos, playing=g.state==='play';
      const end=g.state==='ending'||g.state==='endwait';
      const active=!!g.cfg && (playing||g.state==='trans'||g.state==='defeat');
      const next=g.next;
      const advancing=g.state==='trans' && Number.isInteger(next) && next>g.li;
      // Use actual authored route nodes from collapsed house geometry, rather
      // than always steering through the entire building toward the far finish.
      const scene = debug.BOT.get();
      let goal = active && g.cfg ? {x:0,y:g.cfg.goal+4} : null;
      if (playing && g.cfg.mode === 'toys') {
        const r = scene.truins.filter(x => x.barrier && Array.isArray(x.route)
          && x.route.length && x.route[x.route.length-1][1] < p.z - .3)
          .sort((a,b) => b.z-a.z)[0];
        if (r && p.z <= r.route[0][1] + 6) {
          const step = r.route[Math.max(0,Math.min(r.route.length-1,r.ri|0))];
          goal = {x:step[0],y:step[1]}; // Genuine in-game climb waypoint.
        } else {
          goal = {x:p.x*.5,y:Math.max(g.cfg.goal+4,p.z-10)};
        }
      }
      const progress=active&&g.cfg ?
        Math.max(0,Math.min(1,(4-p.z)/(4-g.cfg.goal))) : 0;
      return {
        started:playing || g.state==='defeat' || g.state==='endwait' || g.state==='ending',level:g.li,
        levelDone:advancing,gameDone:end,
        alive:g.state!=='defeat',
        hero:{x:p.x,y:p.z},goal,
        enemies:scene.shades.reduce((n,e)=>n+(e.visible?1:0),0),
        weapons:playing?1:0,
        layoutHash:playing?fingerprint(debug):'',
        menuOpen:!!g.paused || !document.getElementById('menu').classList.contains('hidden'),
        progress, hp:g.cfg?.mode==='lantern'?g.energy:undefined,
        cameraYaw:debug.rig.yaw
      };
    }
  });
  Object.defineProperty(window,'__META_BOT__',{
    value:bot,writable:false,configurable:false,enumerable:false
  });
})();

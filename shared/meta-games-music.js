/* META GAMES: individual adaptive WebAudio scores. No CDN, no ads. */
(function musicEngine(window, document) {
  'use strict';
  const script = document.currentScript;
  const game = script && script.dataset.game;
  const presets = {
    'observer-world-en-v7':       {root: 47, tempo: 72, seed: 11, scale: 'dorian', palette: 'wind'},
    'ashen-sumerek':              {root: 41, tempo: 63, seed: 23, scale: 'minor', palette: 'ash'},
    'underwater-world':           {root: 43, tempo: 57, seed: 37, scale: 'phrygian', palette: 'water'},
    'three-worlds-game':          {root: 45, tempo: 70, seed: 41, scale: 'dorian', palette: 'portal'},
    'veil-terraces':              {root: 50, tempo: 65, seed: 53, scale: 'lydian', palette: 'glass'},
    'sumerki-i-pepel-2':          {root: 40, tempo: 61, seed: 61, scale: 'minor', palette: 'choir'},
    'twilight-isle-classic':      {root: 48, tempo: 76, seed: 73, scale: 'dorian', palette: 'bell'},
    'twilight-isles':             {root: 52, tempo: 78, seed: 83, scale: 'mixolydian', palette: 'marimba'},
    'archer-in-the-fog':          {root: 43, tempo: 85, seed: 97, scale: 'minor', palette: 'cello'},
    'broken-city':                {root: 46, tempo: 69, seed: 101, scale: 'harmonic', palette: 'noir'},
    'sumerechny-arkhipelag':      {root: 51, tempo: 74, seed: 113, scale: 'dorian', palette: 'mist'},
    'sunken-city':                {root: 42, tempo: 58, seed: 127, scale: 'phrygian', palette: 'depth'},
    'rainbow-acceleration':       {root: 55, tempo: 103, seed: 139, scale: 'major', palette: 'pulse'},
    'asqura-ilya-reference':      {root: 44, tempo: 67, seed: 149, scale: 'harmonic', palette: 'metal'},
    'broken-city-copy':           {root: 48, tempo: 71, seed: 157, scale: 'minor', palette: 'noir'},
    'pod-i-nad':                  {root: 49, tempo: 75, seed: 163, scale: 'lydian', palette: 'gold'},
    'abyss-glow':                 {root: 38, tempo: 54, seed: 173, scale: 'phrygian', palette: 'depth'}
  };
  if (!game || !presets[game] || window.MetaGamesMusic) return;
  const config = presets[game];
  const scales = {
    minor: [0, 2, 3, 5, 7, 8, 10],
    harmonic: [0, 2, 3, 5, 7, 8, 11],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    major: [0, 2, 4, 5, 7, 9, 11],
    lydian: [0, 2, 4, 6, 7, 9, 11],
    mixolydian: [0, 2, 4, 5, 7, 9, 10]
  };
  const cueNames = ['intro', 'explore', 'mystery', 'danger', 'release'];
  const cues = {
    intro:    {speed: .82, offset: -2, tone: 'sine', density: 2},
    explore:  {speed: 1, offset: 0, tone: 'triangle', density: 1},
    mystery:  {speed: .78, offset: -5, tone: 'sine', density: 3},
    danger:   {speed: 1.18, offset: -3, tone: 'triangle', density: 1},
    release:  {speed: .87, offset: 2, tone: 'sine', density: 2}
  };
  const AUD_VOL = Object.freeze({music: .16, pad: .11, bass: .13, dis: .5});
  const AUD_COOL = Object.freeze({transition: 2.5, note: .22, tension: 1.25});
  const duration = 108;
  let ctx, master, duck, active, interval, button;
  let requested = 'intro';
  let paused = false;
  let resumeMood = 'explore';
  let enabled = true;
  let lastSwitch = 0;
  const scale = scales[config.scale];
  const palettes = {
    wind:    {attack: .11, brightness: 3.3, decay: .77},
    ash:     {attack: .06, brightness: 2.1, decay: .67},
    water:   {attack: .18, brightness: 2.8, decay: .82},
    portal:  {attack: .08, brightness: 4.1, decay: .75},
    glass:   {attack: .018, brightness: 5.2, decay: .48},
    choir:   {attack: .22, brightness: 2.7, decay: .86},
    bell:    {attack: .012, brightness: 4.4, decay: .51},
    marimba: {attack: .017, brightness: 3.6, decay: .43},
    cello:   {attack: .12, brightness: 2.2, decay: .81},
    noir:    {attack: .045, brightness: 2.5, decay: .66},
    mist:    {attack: .16, brightness: 2.8, decay: .85},
    depth:   {attack: .24, brightness: 1.9, decay: .88},
    pulse:   {attack: .025, brightness: 4.6, decay: .37},
    metal:   {attack: .022, brightness: 3.2, decay: .42},
    gold:    {attack: .04, brightness: 4.8, decay: .63}
  };
  const palette = palettes[config.palette];
  const theme = [0, 2 + config.seed % 3, 4 - config.seed % 2, 1 + config.seed % 4];

  try {
    enabled = window.localStorage.getItem('meta-games-music-enabled') !== 'false';
  } catch (error) {
    // Private browsing can disable localStorage; music still works in memory.
  }

  function noteAt(degree, bright) {
    const oct = Math.floor(degree / 7);
    const index = ((degree % 7) + 7) % 7;
    const notes = bright ? scales.major : scale;
    return Math.max(35, Math.min(84, config.root + notes[index] + 12 * oct));
  }
  function hz(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }
  function createAudio() {
    if (ctx) return true;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return false;
    try {
      if (window.navigator && window.navigator.audioSession) {
        try {
          window.navigator.audioSession.type = 'playback';
        } catch (error) {
          console.warn('[META MUSIC] iOS audio session mode unavailable:', error);
        }
      }
      ctx = new AudioContext();
      master = ctx.createGain();
      duck = ctx.createGain();
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 6200;
      lowpass.Q.value = .2;
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -24;
      compressor.knee.value = 18;
      compressor.ratio.value = 3;
      compressor.attack.value = .018;
      compressor.release.value = .27;
      master.gain.value = AUD_VOL.music;
      duck.gain.value = 1;
      master.connect(duck);
      duck.connect(lowpass);
      lowpass.connect(compressor);
      compressor.connect(ctx.destination);
      return true;
    } catch (error) {
      console.warn('[META MUSIC] Audio is unavailable:', error);
      ctx = null;
      return false;
    }
  }
  function playNote(track, midi, when, length, volume, timbre, dissonant) {
    if (!ctx || !track || !track.bus) return;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const start = Math.max(when, ctx.currentTime + .003);
    const sustain = Math.max(.12, length);
    const end = start + sustain;
    osc.type = timbre;
    osc.frequency.setValueAtTime(hz(midi), start);
    filter.type = 'lowpass';
    filter.frequency.value = Math.min(4300, hz(midi) * palette.brightness);
    const gain = volume * (dissonant ? AUD_VOL.dis : 1);
    amp.gain.setValueAtTime(.0001, start);
    amp.gain.linearRampToValueAtTime(gain, start + Math.min(palette.attack, sustain * .3));
    amp.gain.setTargetAtTime(.0001, start + sustain * palette.decay, Math.max(.06, sustain * .13));
    amp.gain.setValueAtTime(.0001, end + .18);
    osc.connect(filter);
    filter.connect(amp);
    amp.connect(track.bus);
    osc.start(start);
    osc.stop(end + .19);
    osc.onended = () => {
      osc.disconnect();
      filter.disconnect();
      amp.disconnect();
    };
  }
  function scoreBeat(track) {
    const cue = cues[track.name];
    const beatLength = 60 / (config.tempo * cue.speed);
    const seconds = track.beat * beatLength;
    const stage = Math.min(4, Math.floor(seconds / (duration / 5)));
    const sectionGain = [.38, .78, .62, .95, .32][stage];
    const t = track.next;
    const beat = track.beat;
    const phrase = Math.floor(beat / 16);
    const shift = [0, 2, 1, -2, 3, -1, 0][(phrase + config.seed) % 7];
    const shifted = theme[(beat + (stage === 2 ? 1 : 0)) % theme.length];
    const variation = shift + (stage === 2 ? ((beat % 8 < 4) ? 2 : -1) : 0);
    const inversion = track.name === 'mystery' ? -shifted : shifted;
    const pitch = noteAt(inversion + variation + Math.round(cue.offset / 2) + 7,
      track.name === 'release');
    const thin = beat % cue.density === 0;
    if (thin) {
      const long = beat % 4 === 0 ? 2.2 : .82;
      playNote(track, pitch, t, beatLength * long, .43 * sectionGain,
        cue.tone, track.name === 'mystery' && beat % 9 === 0);
    }
    if (beat % 4 === 0) {
      const bassDegree = [0, -3, -4, -3][Math.floor(beat / 4) % 4];
      playNote(track, noteAt(bassDegree + cue.offset - 7, track.name === 'release'), t,
        beatLength * 3.2, AUD_VOL.bass * sectionGain, 'sine', false);
    }
    if (beat % 8 === 0 && stage > 0 && stage < 4) {
      for (const degree of [0, 2, 4]) {
        playNote(track, noteAt(degree + cue.offset, track.name === 'release'), t,
          beatLength * 6, AUD_VOL.pad * sectionGain, 'sine', false);
      }
    }
    if (track.name === 'danger' && beat % 2 === 0) {
      playNote(track, noteAt(-14), t, .3, .11, 'sine', true);
    }
    if (stage === 3 && beat % 7 === 0 && config.seed % 2 === 0) {
      playNote(track, pitch + 12, t + beatLength * .5, .6,
        .13 * sectionGain, 'sine', false);
    }
    track.beat++;
    track.next += beatLength;
  }
  function stopTrack(track) {
    if (!ctx || !track) return;
    const now = ctx.currentTime;
    track.bus.gain.cancelScheduledValues(now);
    track.bus.gain.setValueAtTime(track.bus.gain.value, now);
    track.bus.gain.linearRampToValueAtTime(.0001, now + AUD_COOL.transition);
    window.setTimeout(() => track.bus.disconnect(), 3300);
  }
  function setMood(name) {
    if (!cues[name]) return false;
    requested = name;
    if (!ctx || !enabled) return true;
    if (active && active.name === name) return true;
    const now = ctx.currentTime;
    if (active) stopTrack(active);
    const bus = ctx.createGain();
    bus.gain.setValueAtTime(.0001, now);
    bus.gain.linearRampToValueAtTime(1, now + AUD_COOL.transition);
    bus.connect(master);
    active = {name, bus, beat: 0, next: now + .03};
    lastSwitch = now;
    duck.gain.setTargetAtTime(name === 'danger' ? .72 : 1, now, .7);
    updateButton();
    return true;
  }
  function play() {
    if (!enabled || paused || document.hidden || !createAudio()) return;
    const resumed = ctx.resume();
    if (resumed && typeof resumed.catch === 'function') {
      resumed.catch(error => console.warn('[META MUSIC] Resume failed:', error));
    }
    if (!active) setMood(requested);
    if (!interval) interval = window.setInterval(tick, 110);
    tick();
  }
  function tick() {
    if (!enabled || !ctx || ctx.state !== 'running' || !active) return;
    if (document.hidden) return;
    const track = active;
    if (ctx.currentTime - lastSwitch > duration) {
      const index = cueNames.indexOf(track.name);
      setMood(cueNames[(index + 1) % cueNames.length]);
      return;
    }
    let iterations = 0;
    while (track.next < ctx.currentTime + .26 && iterations < 5) {
      scoreBeat(track);
      iterations++;
    }
    if (track.next < ctx.currentTime - 1) track.next = ctx.currentTime + .04;
  }
  function setEnabled(on) {
    enabled = !!on;
    try {
      window.localStorage.setItem('meta-games-music-enabled', String(enabled));
    } catch (error) {
      // Storage is optional for standalone games.
    }
    if (enabled) play();
    else if (ctx) {
      const now = ctx.currentTime;
      master.gain.setTargetAtTime(0, now, .08);
      ctx.suspend().catch(error => console.warn('[META MUSIC] Suspend failed:', error));
    }
    if (enabled && master && ctx) {
      master.gain.setTargetAtTime(AUD_VOL.music, ctx.currentTime, .12);
    }
    updateButton();
  }
  function updateButton() {
    if (!button) return;
    button.textContent = enabled ? '♫' : '♪';
    button.setAttribute('aria-label', enabled ? 'Выключить музыку' : 'Включить музыку');
    button.setAttribute('aria-pressed', String(enabled));
    button.title = enabled ? 'Музыка: включена' : 'Музыка: выключена';
    button.style.opacity = enabled ? '.78' : '.5';
  }
  function installButton() {
    if (!document.body || button) return;
    button = document.createElement('button');
    button.type = 'button';
    button.style.cssText =
      'position:fixed;right:calc(12px + env(safe-area-inset-right));' +
      'top:calc(12px + env(safe-area-inset-top));z-index:2147483646;' +
      'width:38px;height:38px;border:1px solid #d6c4a977;border-radius:50%;' +
      'background:#12151dba;color:#f2dbc0;font:22px system-ui,sans-serif;' +
      'display:grid;place-items:center;cursor:pointer;touch-action:manipulation;' +
      'box-shadow:0 2px 12px #0005';
    button.addEventListener('pointerdown', event => event.stopPropagation());
    button.addEventListener('click', event => {
      event.stopPropagation();
      setEnabled(!enabled);
    });
    document.body.appendChild(button);
    updateButton();
  }
  // Read only public game state when available; no changes to game mechanics.
  let knownState = '';
  let knownDanger = false;
  let knownPause = false;
  let maxObservedHealth = 0;
  function observeGameplay() {
    let state = '';
    let lowHealth = false;
    let gamePaused = false;
    const isle = window.__isle;
    if (isle && isle.G) {
      const g = isle.G;
      state = typeof g.state === 'string' ? g.state.toLowerCase() : '';
      gamePaused = state === 'paused';
      const hero = isle.player;
      if (hero && typeof hero.hp === 'number' && hero.hp > 0) {
        const possibleMax = hero.maxHp || hero.maxHP || hero.hpMax || hero.hp;
        maxObservedHealth = Math.max(maxObservedHealth, possibleMax);
        lowHealth = maxObservedHealth > 0 && hero.hp / maxObservedHealth <= .32;
      }
    } else if (window.__rr) {
      const racing = window.__rr.state;
      state = racing && typeof racing.state === 'string' ? racing.state.toLowerCase() : '';
    } else if (typeof window.__abyssStats === 'function') {
      const abyss = window.__abyssStats();
      gamePaused = !!(abyss && abyss.paused);
      state = abyss && abyss.cine ? 'intro' : '';
    }
    if (gamePaused !== knownPause) {
      knownPause = gamePaused;
      window.MetaGamesMusic.setPaused(gamePaused);
    }
    if (state && state !== knownState) {
      if (state === 'title' || state === 'menu' || state === 'intro') setMood('intro');
      else if (state === 'play' || state === 'playing' || state === 'game') setMood('explore');
      else if (state === 'win' || state === 'won' || state === 'victory') setMood('release');
      else if (state === 'dead' || state === 'defeat') setMood('mystery');
      knownState = state;
    }
    if (lowHealth !== knownDanger) {
      knownDanger = lowHealth;
      window.MetaGamesMusic.setDanger(lowHealth);
    }
  }
  window.setInterval(observeGameplay, 950);

  function unlock(event) {
    if (event && event.type === 'keydown' &&
        (event.key === 'Tab' || event.key === 'Shift')) return;
    if (enabled) play();
  }
  function onVisibility() {
    if (!ctx || !enabled) return;
    if (document.hidden) ctx.suspend().catch(error => console.warn(error));
    else play();
  }
  window.MetaGamesMusic = Object.freeze({
    setMood,
    setDanger(on) {
      if (on) {
        if (requested !== 'danger') resumeMood = requested;
        setMood('danger');
      } else if (requested === 'danger') setMood(resumeMood);
    },
    setEnabled,
    setPaused(on) {
      paused = !!on;
      if (paused && ctx) {
        ctx.suspend().catch(error => console.warn('[META MUSIC] Pause failed:', error));
      } else if (!paused) play();
    },
    get mood() { return requested; },
    get enabled() { return enabled; },
    get game() { return game; },
    get availableMoods() { return cueNames.slice(); }
  });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installButton, {once: true});
  } else installButton();
  for (const type of ['pointerdown', 'touchstart', 'click', 'keydown']) {
    document.addEventListener(type, unlock, {capture: true, passive: true});
  }
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('meta-games-pause', () => window.MetaGamesMusic.setPaused(true));
  window.addEventListener('meta-games-resume', () => window.MetaGamesMusic.setPaused(false));
  window.addEventListener('pageshow', () => {
    if (ctx && enabled && !document.hidden) play();
  });
  window.addEventListener('pagehide', () => {
    if (interval) {
      window.clearInterval(interval);
      interval = null;
    }
    if (ctx && ctx.state === 'running') ctx.suspend().catch(error => console.warn(error));
  });
  window.addEventListener('meta-games-mood', event => {
    if (event.detail && typeof event.detail.mood === 'string') {
      setMood(event.detail.mood);
    }
  });
})(window, document);

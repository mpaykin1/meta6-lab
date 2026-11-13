// Звук «Острова последнего аптекаря» — только Web Audio, без файлов.
// Правило ЗВУК: гармоничное — полная громкость, диссонанс — вдвое тише; музыка развивается по настроению.
const N = {D2: 73.42, A2: 110, Bb2: 116.54, B2: 123.47, C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61,
  'F#3': 185, G2: 98, G3: 196, A3: 220, Bb3: 233.08, C4: 261.63, 'C#4': 277.18, D4: 293.66, E4: 329.63,
  F4: 349.23, 'F#4': 369.99, G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25};
const MOODS = {
  calm: {chords: [['D3', 'F#3', 'A3', 'C#4'], ['B2', 'D3', 'F#3', 'A3'], ['G2', 'B2', 'D3', 'F#3'], ['A2', 'D3', 'E3', 'A3']],
    scale: ['D4', 'E4', 'F#4', 'A4', 'B4', 'D5', 'E5'], gap: [.55, 1.7], bar: 8},
  dusk: {chords: [['D3', 'F3', 'A3', 'C4'], ['Bb2', 'D3', 'F3', 'A3'], ['G2', 'Bb2', 'D3', 'F3'], ['A2', 'C#4', 'E3', 'A3']],
    scale: ['D4', 'E4', 'F4', 'A4', 'C5', 'D5'], gap: [.8, 2.2], bar: 9},
  chase: {chords: [['D3', 'F3', 'A3', 'D4'], ['Bb2', 'D3', 'F3', 'Bb3'], ['C3', 'E3', 'G3', 'C4'], ['A2', 'C#4', 'E3', 'A3']],
    scale: ['D4', 'F4', 'A4', 'C5', 'D5'], gap: [.25, .5], bar: 4}
};

export function createAudio() {
  let ctx = null, master, music, sfx, verb, delay, rainGain, droneGain, padBus, beatGain;
  let mood = 'calm', nextChord = 0, chordIx = 0, nextNote = 0, nextBeat = 0, tension = 0, enabled = true, timer = 0;
  const pads = [];
  function impulse(sec) {
    const len = ctx.sampleRate * sec, b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    return b;
  }
  function start() {
    if (ctx) { ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = enabled ? .85 : 0;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
    master.connect(comp).connect(ctx.destination);
    verb = ctx.createConvolver(); verb.buffer = impulse(2.8);
    const verbGain = ctx.createGain(); verbGain.gain.value = .35; verb.connect(verbGain).connect(master);
    delay = ctx.createDelay(1); delay.delayTime.value = .38;
    const fb = ctx.createGain(); fb.gain.value = .28; delay.connect(fb).connect(delay);
    const delayOut = ctx.createGain(); delayOut.gain.value = .3; delay.connect(delayOut).connect(master);
    music = ctx.createGain(); music.gain.value = .9; music.connect(master); music.connect(verb);
    sfx = ctx.createGain(); sfx.gain.value = .9; sfx.connect(master); sfx.connect(verb);
    padBus = ctx.createBiquadFilter(); padBus.type = 'lowpass'; padBus.frequency.value = 1100; padBus.connect(music);
    // Дождь: шум через полосовой фильтр, тихо и мягко.
    const noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), nd = noise.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    const rain = ctx.createBufferSource(); rain.buffer = noise; rain.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1300; bp.Q.value = .5;
    rainGain = ctx.createGain(); rainGain.gain.value = .045; rain.connect(bp).connect(rainGain).connect(master); rain.start();
    // Дыхание великана: два низких пилообразных тона, лёгкое биение, медленный «вдох».
    droneGain = ctx.createGain(); droneGain.gain.value = 0;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 150;
    for (const f of [41.2, 41.7, 82.4]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.connect(lp); o.start(); }
    const breath = ctx.createOscillator(), bg = ctx.createGain(); breath.frequency.value = .11; bg.gain.value = .5;
    const breathMix = ctx.createGain(); breathMix.gain.value = .5; breath.connect(bg).connect(breathMix.gain); breath.start();
    lp.connect(breathMix).connect(droneGain).connect(master);
    beatGain = ctx.createGain(); beatGain.gain.value = 0; beatGain.connect(master);
    nextChord = nextNote = nextBeat = ctx.currentTime + .2;
    timer = setInterval(schedule, 90);
  }
  function env(g, t, a, peak, d) { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + a + d); }
  function tone(freq, t, {type = 'sine', peak = .06, a = .01, d = 1.2, dest = music, echo = true} = {}) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = freq;
    env(g, t, a, peak, d); o.connect(g).connect(dest); if (echo) g.connect(delay); o.start(t); o.stop(t + a + d + .05);
  }
  function chord(t) {
    const m = MOODS[mood], c = m.chords[chordIx++ % m.chords.length];
    pads.splice(0).forEach(p => { p.g.gain.cancelScheduledValues(t); p.g.gain.setTargetAtTime(0, t, .9); p.o.stop(t + 4); });
    c.forEach((n, i) => {
      for (const det of [-5, 5]) {
        const o = ctx.createOscillator(), g = ctx.createGain(); o.type = i % 2 ? 'triangle' : 'sine';
        o.frequency.value = N[n]; o.detune.value = det; g.gain.value = 0;
        g.gain.setTargetAtTime(.026, t, 1.4); o.connect(g).connect(padBus); o.start(t); pads.push({o, g});
      }
    });
    return m.bar;
  }
  function schedule() {
    if (!ctx) return;
    const now = ctx.currentTime, m = MOODS[mood];
    while (nextChord < now + .3) nextChord += chord(nextChord);
    while (nextNote < now + .3) {
      const n = m.scale[Math.floor(Math.random() * m.scale.length)];
      if (Math.random() < .82) tone(N[n], nextNote, {peak: mood === 'chase' ? .035 : .055, d: mood === 'chase' ? .5 : 1.6});
      nextNote += m.gap[0] + Math.random() * (m.gap[1] - m.gap[0]);
    }
    // Сердцебиение в погоне: темп растёт с напряжением.
    while (nextBeat < now + .3) {
      const bpm = 64 + tension * 66;
      if (mood === 'chase') { tone(55, nextBeat, {peak: .22, d: .22, dest: beatGain, echo: false}); tone(52, nextBeat + .2, {peak: .14, d: .2, dest: beatGain, echo: false}); }
      nextBeat += 60 / bpm;
    }
  }
  return {
    start,
    get enabled() { return enabled; },
    setEnabled(v) { enabled = v; if (master) master.gain.setTargetAtTime(v ? .85 : 0, ctx.currentTime, .2); },
    setMood(v) { if (v !== mood && MOODS[v]) { mood = v; if (ctx) nextChord = ctx.currentTime + .05; } },
    setLevels({robot = 0, chase = 0, rain = .5} = {}) {
      if (!ctx) return; tension = chase;
      droneGain.gain.setTargetAtTime(.05 + robot * .16, ctx.currentTime, .4);
      beatGain.gain.setTargetAtTime(chase ? 1 : 0, ctx.currentTime, .3);
      rainGain.gain.setTargetAtTime(.03 + rain * .05, ctx.currentTime, .6);
    },
    chime(kind = 0) {
      if (!ctx) return; const t = ctx.currentTime, base = [N.D5, N.A4, N.E5][kind % 3];
      [1, 1.5, 2].forEach((r, i) => tone(base * r / (i === 2 ? 1.5 : 1), t + i * .09, {peak: .07, d: 1.1, dest: sfx}));
    },
    dust() {
      if (!ctx) return; const t = ctx.currentTime;
      const src = ctx.createBufferSource(), b = ctx.createBuffer(1, ctx.sampleRate * .8, ctx.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 2200;
      const g = ctx.createGain(); g.gain.value = .12; src.buffer = b; src.connect(f).connect(g).connect(sfx); src.start(t);
      [N.A4, N.D5, N['F#4'] * 2].forEach((n, i) => tone(n, t + .1 + i * .12, {peak: .05, d: 1.4, dest: sfx}));
    },
    // Диссонанс (тритон) — вдвое тише гармоничных звуков.
    stab() {
      if (!ctx) return; const t = ctx.currentTime;
      [N.D3, N.D3 * Math.SQRT2, N.D4].forEach(f => tone(f, t, {type: 'sawtooth', peak: .02, a: .02, d: .9, dest: sfx, echo: false}));
    },
    door() { if (ctx) { const t = ctx.currentTime; tone(70, t, {peak: .25, d: .35, dest: sfx, echo: false}); tone(N.D4, t + .25, {peak: .05, d: 2, dest: sfx}); tone(N.A4, t + .4, {peak: .045, d: 2.2, dest: sfx}); } },
    step(v = .5) { if (ctx) tone(90 + Math.random() * 30, ctx.currentTime, {type: 'triangle', peak: .012 * v, a: .002, d: .07, dest: sfx, echo: false}); },
    // Голос великана: синтез речи, если в системе есть русский голос; поверх — тихий металлический гул.
    voice(text) {
      if (!ctx || !enabled) return;
      const t = ctx.currentTime;
      tone(N.D2, t, {type: 'square', peak: .015, a: .05, d: 1.6, dest: sfx, echo: false});
      tone(N.D2 * 1.5, t + .05, {type: 'square', peak: .03, a: .05, d: 1.6, dest: sfx, echo: false});
      try {
        const sp = window.speechSynthesis; if (!sp) return;
        const u = new SpeechSynthesisUtterance(text.toLowerCase());
        u.lang = 'ru-RU'; u.pitch = .05; u.rate = .78; u.volume = .9;
        const ru = sp.getVoices().find(v => v.lang?.startsWith('ru')); if (ru) u.voice = ru; else return;
        sp.cancel(); sp.speak(u);
      } catch (e) {}
    }
  };
}

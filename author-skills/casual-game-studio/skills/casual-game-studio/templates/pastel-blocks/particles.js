/* Casual Game Studio v0.6 — true Three.quarks batched VFX adapter.
 * Physics transforms belong to Rapier; Quarks emits visual-only particles,
 * sharing the exact same Three.js scene, importmap, renderer and frame clock.
 * Upstream: https://github.com/Alchemist0823/three.quarks (MIT).
 */
export async function createQuarksParticles({ THREE, scene }) {
  const Q = await import('three.quarks');
  const batch = new Q.BatchedRenderer();
  scene.add(batch);
  const mobile = matchMedia('(max-width: 650px), (pointer: coarse)').matches;
  const texture = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    if (!g) throw new Error('CanvasTexture unavailable');
    const grad = g.createRadialGradient(32,32,0,32,32,31);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(.29, 'rgba(255,255,255,.96)');
    grad.addColorStop(.72, 'rgba(255,255,255,.33)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0,0,64,64);
    const map = new THREE.CanvasTexture(c);
    map.colorSpace = THREE.SRGBColorSpace;
    return map;
  })();
  // One shared material for all burst systems; particle billboards are transparent.
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff, map: texture, transparent: true,
    blending: THREE.AdditiveBlending, depthWrite: false,
    side: THREE.DoubleSide, opacity: .94
  });
  const live = [];
  let enabled = true;
  let fpsSmoothed = 60;
  const colors = {
    pink: 0xff91bc, peach: 0xffd59c, mint: 0x87e8cb,
    stone: 0xd4d4f7, ice: 0x8ee8ff, brick: 0xffb58d,
    gift: 0xffdf8a, cream: 0xfff9df, pet: 0xffa7dc,
    reward: 0xffec93
  };
  function burst(position, kind = 'pink') {
    if (!enabled) return;
    // Active systems are bounded so repeated touches cannot grow memory indefinitely.
    while (live.length >= (mobile ? 10 : 18)) {
      const old = live.shift();
      old.system.dispose();
    }
    const color = new THREE.Color(colors[kind] ?? colors.pink);
    const c = new THREE.Vector4(color.r, color.g, color.b, 1);
    const count = fpsSmoothed < 30 ? 8 : (mobile ? 15 : 28);
    const system = new Q.ParticleSystem({
      duration: .21,
      looping: false,
      autoDestroy: false,
      startLife: new Q.IntervalValue(.33,.65),
      startSpeed: new Q.IntervalValue(1.1,3.2),
      startSize: new Q.IntervalValue(.095,.23),
      startColor: new Q.ConstantColor(c),
      shape: new Q.SphereEmitter({radius: .1, thickness: 1}),
      maxParticle: count + 4,
      emissionOverTime: new Q.ConstantValue(0),
      emissionBursts: [{
        time: .02, count: new Q.ConstantValue(count),
        cycle: 1, interval: 0, probability: 1
      }],
      material,
      renderMode: Q.RenderMode.BillBoard,
      worldSpace: true
    });
    // The emitter lives in the same coordinate system as Rapier hit points.
    system.emitter.position.set(position.x, position.y, position.z);
    scene.add(system.emitter);
    batch.addSystem(system);
    live.push({system, age: 0});
  }
  function update(dt) {
    const step = Math.min(Math.max(dt, 0), .05);
    if (step > .0001) fpsSmoothed = fpsSmoothed * .96 + (1 / step) * .04;
    batch.update(step); // Exactly one Quarks advance per render frame.
    for (let i = live.length - 1; i >= 0; --i) {
      const item = live[i];
      item.age += step;
      if (item.age > 1.15) {
        item.system.dispose();
        live.splice(i, 1);
      }
    }
  }
  function setEnabled(value) { enabled = Boolean(value); }
  function dispose() {
    for (const item of live) item.system.dispose();
    live.length = 0;
    scene.remove(batch);
    texture.dispose();
    material.dispose();
  }
  return { burst, update, dispose, setEnabled };
}

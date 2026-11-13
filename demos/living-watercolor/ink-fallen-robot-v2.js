import * as T from 'three';

// Fallen guardian: true volumetric geometry, illustrated by the existing INK watercolor renderer.
const palette = {
  porcelain: '#c9ab93', warm: '#d7b79b', shadow: '#6e6867',
  joint: '#4d5255', rust: '#a96851', edge: '#444749',
  soil: '#83765f', moss: '#71815b', foliage: '#9a9e58',
};
const shared = new Map();
function pigment(color, opts = {}) {
  const key = color + (opts.map ? ':patina' : JSON.stringify(opts));
  if (!shared.has(key)) {
    shared.set(key, new T.MeshStandardMaterial({ color, roughness: 1, ...opts }));
  }
  return shared.get(key);
}
function part(parent, geometry, material, position = [0, 0, 0], outline = true) {
  const m = new T.Mesh(geometry, material);
  m.position.set(...position);
  m.userData.watercolorOutline = outline;
  parent.add(m);
  return m;
}
function ball(parent, size, position, material, outline = true, detail = 1) {
  const m = part(parent, new T.IcosahedronGeometry(1, detail), material, position, outline);
  m.scale.set(...size);
  return m;
}
function box(parent, dims, position, material, rotation = [0, 0, 0], outline = true) {
  const m = part(parent, new T.BoxGeometry(...dims), material, position, outline);
  m.rotation.set(...rotation);
  return m;
}
function tube(parent, points, radius, material, outline = false) {
  const curve = new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p)));
  return part(parent, new T.TubeGeometry(curve, Math.max(12, points.length * 5), radius, 5), material,
    [0, 0, 0], outline);
}
function limb(parent, from, to, startRadius, endRadius, material) {
  const a = new T.Vector3(...from), b = new T.Vector3(...to);
  const m = part(parent, new T.CylinderGeometry(endRadius, startRadius, a.distanceTo(b), 12, 1),
    material);
  m.position.copy(a).add(b).multiplyScalar(.5);
  m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), b.sub(a).normalize());
  return m;
}
function ring(parent, center, radius, material, rotation = [0, 0, 0], width = .055) {
  const m = part(parent, new T.TorusGeometry(radius, width, 5, 22), material, center, false);
  m.rotation.set(...rotation);
  return m;
}
function patinaTexture(seed = 1) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const context = canvas.getContext('2d');
  if (!context) return null;
  let state = seed;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) | 0;
    return (state >>> 0) / 4294967296;
  };
  context.fillStyle = '#d4b39b';
  context.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 650; i++) {
    const x = random() * 256, y = random() * 256;
    const r = 1 + Math.pow(random(), 2.8) * 24;
    const colors = ['#a76551', '#c07859', '#e1c6a7', '#8a8780', '#d9a984', '#f0d7b7'];
    context.fillStyle = colors[Math.floor(random() * colors.length)];
    context.globalAlpha = .14 + random() * .58;
    context.beginPath();
    context.ellipse(x, y, r, r * (.28 + random() * .8), random() * 6, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;
  for (let i = 0; i < 180; i++) {
    const x = random() * 256, y = random() * 256, r = .2 + random() * 1.7;
    context.fillStyle = '#494f50';
    context.fillRect(x, y, r, r);
  }
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  return texture;
}
function wristAndHand(parent, x, z, mirror, armor, joint, accent) {
  const hand = new T.Group();
  hand.position.set(x, .30, z);
  hand.rotation.y = mirror * .18;
  parent.add(hand);
  const palm = ball(hand, [.79, .31, .57], [0, .04, .13], armor, true, 2);
  palm.rotation.x = -.10;
  box(hand, [1.50, .08, .20], [0, .18, .19], accent, [0, 0, 0], false);
  const fingers = [];
  for (let i = 0; i < 4; i++) {
    const fx = (i - 1.5) * .35;
    const length = .68 + Math.sin((i + 1) / 5 * Math.PI) * .26;
    const finger = new T.Group();
    finger.position.set(fx, .03, .60);
    hand.add(finger);
    const knuckle = ball(finger, [.17, .18, .22], [0, 0, 0], joint, false, 1);
    knuckle.rotation.y = (i - 1.5) * .06;
    const first = box(finger, [.30, .27, length * .55], [0, -.08, .19], armor,
      [0, (i - 1.5) * .07, 0]);
    const second = box(finger, [.29, .23, length * .48], [fx * .06, -.15, .52], armor,
      [.12, (i - 1.5) * .10, 0]);
    first.scale.z *= .92;
    second.scale.z *= .92;
    ring(finger, [0, -.015, .36], .145, joint, [Math.PI / 2, 0, 0], .018);
    fingers.push(finger);
  }
  const thumb = ball(hand, [.21, .18, .43], [mirror * -.85, -.04, .52], armor, true, 1);
  thumb.rotation.y = mirror * -.52;
  hand.userData.fingers = fingers;
  return hand;
}
function addRubble(g, random, soil, stone) {
  for (let i = 0; i < 27; i++) {
    const angle = random() * Math.PI * 2;
    const radius = 1.5 + random() * 3.8;
    const x = Math.cos(angle) * radius, z = Math.sin(angle) * radius * .65 + .65;
    const rock = ball(g, [.11 + random() * .30, .10 + random() * .16, .12 + random() * .29],
      [x, -.08 + random() * .10, z], i % 4 ? stone : soil, false);
    rock.rotation.set(random() * .3, random() * 6, random() * .3);
  }
}
function addGrowth(g, random, moss, leafMaterials) {
  // Instanced foliage avoids expensive watercolor outline passes on every blade.
  const leafGeo = new T.IcosahedronGeometry(1, 0);
  for (let color = 0; color < leafMaterials.length; color++) {
    const count = 170;
    const instances = new T.InstancedMesh(leafGeo, leafMaterials[color], count);
    const obj = new T.Object3D();
    for (let i = 0; i < count; i++) {
      const a = random() * Math.PI * 2;
      const r = Math.sqrt(random()) * 4.2;
      const x = Math.cos(a) * r, z = Math.sin(a) * r * .67 + .45;
      const onChest = random() < .47;
      const bx = (random() - .5) * 2.9, by = 2.24 - random() * .54, bz = -.64 + random() * .75;
      obj.position.set(onChest ? bx : x, onChest ? by : -.02 + random() * .22,
        onChest ? bz : z);
      obj.rotation.set(random(), random() * 6.28, random() * .8);
      const size = .06 + random() * (onChest ? .14 : .20);
      obj.scale.set(size, size * (.26 + random() * .28), size * (.65 + random() * .5));
      obj.updateMatrix();
      instances.setMatrixAt(i, obj.matrix);
    }
    instances.instanceMatrix.needsUpdate = true;
    instances.userData.watercolorOutline = false;
    instances.userData.watercolorSkipWash = true;
    g.add(instances);
  }
  const trailingMoss = new T.Group();
  g.add(trailingMoss);
  g.userData.mossSway = trailingMoss;
  for (let i = 0; i < 10; i++) {
    const x = -1.55 + i * .34;
    tube(trailingMoss, [[x, 2.12, -.65], [x + .14, 1.87, -.03], [x + .18, 1.21, .37],
      [x + .1, .52, .66]], .035, moss);
  }
  for (let i = 0; i < 8; i++) {
    const side = i < 4 ? -1 : 1, local = i % 4;
    const x = side * (1.42 + local * .20);
    tube(trailingMoss, [[x, 1.82, -.78], [x + side * .21, 1.35, -.25],
      [x + side * .44, .62, .55], [x + side * .52, .22, 1.05]], .024, moss);
  }
}
export function createFallenRobotV2(seed = 23) {
  let state = Math.floor(seed) || 23;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) | 0;
    return (state >>> 0) / 4294967296;
  };
  const g = new T.Group();
  g.name = 'Павший великан · заросший робот';
  const patina = patinaTexture(seed);
  const armor = pigment('#ffffff', patina ? { map: patina } : { color: palette.porcelain });
  const lightArmor = pigment(palette.warm);
  const dark = pigment(palette.joint);
  const seams = pigment(palette.edge);
  const rust = pigment(palette.rust);
  const moss = pigment(palette.moss);
  const soil = pigment(palette.soil);
  const rock = pigment(palette.shadow);
  const leaves = ['#7f8950', '#9c9d54', '#c1a35e', '#66795b'].map(c => pigment(c));

  // Half-submerged body and broken machinery, all sides remain genuinely volumetric.
  ball(g, [3.4, .29, 2.13], [0, -.20, .23], soil, false, 2);
  ball(g, [1.65, 1.20, .97], [-.10, .96, -.63], dark, true, 2);
  const torso = ball(g, [1.71, 1.13, .85], [-.05, 1.20, -.59], armor, true, 2);
  torso.rotation.z = -.10;
  for (const side of [-1, 1]) {
    const chest = box(g, [1.02, 1.19, .18], [side * .79, 1.35, .18], lightArmor,
      [.06, side * -.13, side * -.11]);
    chest.rotation.z = side * .08;
    box(g, [.75, .70, .09], [side * .79, 1.32, .292], armor, [0, 0, side * -.12]);
    for (let i = 0; i < 3; i++) {
      ball(g, [.052, .052, .029], [side * (.45 + i * .29), 1.84 - i * .05, .35],
        seams, false, 1);
    }
    ball(g, [.61, .61, .62], [side * 1.61, 1.31, -.40], dark, true, 2);
    ring(g, [side * 1.65, 1.31, .14], .49, rust, [0, 0, 0], .06);
  }
  for (let i = 0; i < 4; i++) {
    box(g, [1.25, .12, .25], [-.10, .53 + i * .17, .38], i % 2 ? seams : rust,
      [0, 0, -.07], false);
  }
  // Open neck bearing and heavy tilted head.
  limb(g, [.34, 1.80, -.95], [.64, 2.18, -1.06], .37, .29, dark);
  ring(g, [.56, 2.13, -.73], .30, rust);
  const head = new T.Group();
  head.position.set(.74, 2.64, -1.14);
  head.rotation.set(.07, -.17, -.43);
  g.add(head);
  ball(head, [.91, 1.02, .84], [0, 0, 0], armor, true, 2);
  box(head, [1.37, .54, .20], [.05, -.34, .68], dark, [0, -.09, -.04]);
  box(head, [1.19, .47, .12], [.05, -.34, .80], armor, [0, -.06, -.04]);
  ball(head, [.32, .32, .15], [-.58, .45, .54], lightArmor, true, 2);
  ring(head, [-.58, .45, .68], .22, rust);
  // Uneven eye positions and dormant ember-orange lenses from the concept art.
  const glow = new T.MeshBasicMaterial({ color: '#f18a4e' });
  const eyes = [[-.28, -.18, .885, .20], [.34, -.40, .87, .145]];
  eyes.forEach(([x, y, z, radius]) => {
    ball(head, [radius * 1.45, radius * 1.45, .09], [x, y, z], dark, false, 2);
    ring(head, [x, y, z + .091], radius * 1.16, seams, [0, 0, 0], .037);
    ball(head, [radius * .67, radius * .67, .07], [x, y, z + .136], glow, false, 2);
    ball(head, [radius * .24, radius * .24, .015], [x - .03, y + .04, z + .209],
      pigment('#ffe0a0', { emissive: '#d27943', emissiveIntensity: .18 }), false, 1);
  });
  for (let j = 0; j < 4; j++) {
    const y = .26 + j * .135;
    tube(head, [[.48, y, .54], [.59, y + .03, .47], [.63, y + .05, .33]], .012, seams);
  }

  // Nested joints. Every mesh has exactly the same world transform as v1 at rest.
  const arms = {};
  for (const side of [-1, 1]) {
    const shoulder = [side * 1.72, 1.29, -.49];
    const elbow = [side * 2.20, .65, .54];
    const wrist = [side * 2.58, .31, 1.50];
    const e = elbow.map((v, i) => v - shoulder[i]);
    const w = wrist.map((v, i) => v - elbow[i]);
    const shoulderPivot = new T.Group();
    shoulderPivot.position.set(...shoulder);
    g.add(shoulderPivot);
    const elbowPivot = new T.Group();
    elbowPivot.position.set(...e);
    shoulderPivot.add(elbowPivot);
    const wristPivot = new T.Group();
    wristPivot.position.set(...w);
    elbowPivot.add(wristPivot);
    limb(shoulderPivot, [0, 0, 0], e, .55, .47, armor);
    limb(elbowPivot, [0, 0, 0], w, .58, .65, armor);
    ball(elbowPivot, [.49, .46, .48], [0, 0, 0], dark, true, 2);
    for (let k = 0; k < 3; k++) {
      const t = (k + 1) / 4;
      const band = ball(shoulderPivot, [.51 - k * .012, .05, .52],
        e.map(v => v * t), rust, false, 1);
      band.rotation.z = side * -.35;
    }
    ball(wristPivot, [.63, .48, .57], [0, 0, 0], dark, false, 2);
    const hand = wristAndHand(wristPivot, side * 2.64 - wrist[0],
      1.66 - wrist[2], side, armor, dark, rust);
    hand.position.y = .30 - wrist[1];
    arms[side] = { shoulderPivot, elbowPivot, wristPivot, hand,
      fingers: hand.userData.fingers, shoulder, elbow, wrist };
  }

  // Earth swallowing joints, moss spreading over the shattered chassis.
  for (const x of [-2.40, -1.18, .40, 2.16, 2.97]) {
    const z = x < 0 ? .45 : .78;
    ball(g, [.70, .18, .44], [x, -.12, z], moss, false, 1);
  }
  addRubble(g, random, soil, rock);
  addGrowth(g, random, moss, leaves);
  // One reusable point buffer for all soil/leaf fragments; invisible in rest pose.
  const debrisPositions = new Float32Array(16 * 3);
  const debrisGeometry = new T.BufferGeometry();
  debrisGeometry.setAttribute('position', new T.BufferAttribute(debrisPositions, 3));
  const debris = new T.Points(debrisGeometry,
    new T.PointsMaterial({color:'#836c4d',size:.09,transparent:true,opacity:.62,
      depthWrite:false,sizeAttenuation:true}));
  debris.visible = false;
  debris.userData.watercolorOutline = false;
  debris.userData.watercolorSkipWash = true;
  g.add(debris);
  g.userData.robotV2 = {
    head, baseHead:head.rotation.clone(), arms, debris, debrisPositions,
    debrisAge:9, debrisSeed:random, liftPrev:0, glowBase:new T.Color().setRGB(1,.39,.20),
    headYaw:0, lastCreak:-20, moss:g.userData.mossSway, enabled:true
  };
  g.userData.robotEyes = glow;
  g.userData.robotEyeBase = '#f18a4e';
  g.userData.isFallenRobot = true;
  return g;
}


// Called from the scene frame loop: no allocations of geometry/material per frame.
export function updateFallenRobotV2(g, elapsed, deltaTime, heroWorldPosition=null) {
  const state=g.userData.robotV2;
  if(!state)return;
  const dt=Math.min(.05,Math.max(0,deltaTime||0));
  const clamp=T.MathUtils.clamp;
  const smooth=(x)=>{x=clamp(x,0,1);return x*x*(3-2*x);};
  // Eight-to-fifteen second head turn, smoothed toward the traveller when near.
  let near=false, heroAngle=0;
  if(heroWorldPosition && g.visible) {
    const d=g.position.distanceTo(heroWorldPosition);
    near=d<4.6;
    if(near){
      const local=g.worldToLocal(heroWorldPosition.clone());
      heroAngle=clamp(Math.atan2(local.x-state.head.position.x,
        local.z-state.head.position.z)*.34,-.436,.436);
    }
  }
  const look=near?heroAngle:Math.sin(elapsed*Math.PI*2/12)*.30;
  state.headYaw+=(look-state.headYaw)*(1-Math.exp(-dt*.65));
  state.head.rotation.y=state.baseHead.y+state.headYaw;
  // Shoulder starts first, then elbow, then hand and four delayed fingers.
  const cycle=elapsed%19, rise=(phase)=>{
    const p=(cycle-phase)/10.7;
    return p>0&&p<1?Math.pow(Math.sin(Math.PI*p),2):0;
  };
  const lift=rise(3.0),elbowLift=rise(3.6),handLift=rise(4.25);
  const reaching=near?smooth((4.6-g.position.distanceTo(heroWorldPosition))/2.5):0;
  const arm=state.arms[1];
  arm.shoulderPivot.rotation.x=-.225*lift-.11*reaching;
  arm.shoulderPivot.rotation.y=.065*reaching;
  arm.elbowPivot.rotation.x=-.13*elbowLift-.065*reaching;
  arm.wristPivot.rotation.x=-.085*handLift;
  arm.hand.rotation.x=-.06*handLift;
  arm.fingers.forEach((finger,i)=>{
    finger.rotation.x=-.20*rise(4.6+i*.18)-.17*reaching*smooth((Math.sin(elapsed*.6+i*.28)+1)*.5);
  });
  if(state.moss) {
    state.moss.rotation.z=Math.sin(elapsed*.83)*(.008+.015*lift);
    state.moss.rotation.x=Math.sin(elapsed*.62)*.008;
  }
  // Gentle ember rather than a flash; initial frame remains the v1 exact color.
  const eyePulse=.075*Math.sin(elapsed*.75)+.45*lift+.23*reaching;
  g.userData.robotEyes.color.copy(state.glowBase).multiplyScalar(1+eyePulse);
  // Soil falls from the lifted wrist. It is a single Points object, never new meshes.
  if(lift>.23&&state.liftPrev<=.23){
    const wristWorld=new T.Vector3();
    arm.wristPivot.getWorldPosition(wristWorld);
    const origin=g.worldToLocal(wristWorld);
    state.debrisOrigin=origin;
    state.debrisAge=0;
    state.debris.visible=true;
    for(let i=0;i<16;i++){
      const n=i*3;
      state.debrisPositions[n]=origin.x+(state.debrisSeed()-.5)*.35;
      state.debrisPositions[n+1]=origin.y+(state.debrisSeed()-.5)*.14;
      state.debrisPositions[n+2]=origin.z+(state.debrisSeed()-.5)*.34;
    }
  }
  state.liftPrev=lift;
  if(state.debris.visible) {
    state.debrisAge+=dt;
    for(let i=0;i<16;i++){
      const n=i*3;
      state.debrisPositions[n]+=Math.sin(elapsed*1.2+i*4.1)*dt*.035;
      state.debrisPositions[n+1]-=dt*(.25+state.debrisAge*.42);
      state.debrisPositions[n+2]+=Math.cos(elapsed*.7+i)*dt*.07;
    }
    state.debris.geometry.attributes.position.needsUpdate=true;
    state.debris.visible=state.debrisAge<1.8;
  }
  // Trigger a quiet creak only during real head movement and after user gesture.
  const turn=Math.abs(state.headYaw);
  if(turn>.18&&elapsed-state.lastCreak>9&&typeof g.userData.onRobotCreak==='function'){
    state.lastCreak=elapsed;
    g.userData.onRobotCreak();
  }
}

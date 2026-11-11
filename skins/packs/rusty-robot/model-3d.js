/* Rusty Robot: fully volumetric Three.js skin; uses only the approved pack textures.
   Front of the model is -Z. No PlaneGeometry, Sprite or flat body cards. */
(function (global) {
  'use strict';
  function rounded(THREE, w, h, d, radius, material) {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2, r = Math.min(radius, w / 4, h / 4);
    s.moveTo(x + r, y); s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    const b = Math.min(0.025, d / 6);
    const g = new THREE.ExtrudeGeometry(s, {steps: 1, depth: d - 2 * b, bevelEnabled: true,
      bevelThickness: b, bevelSize: Math.min(.015, r / 4), bevelSegments: 2, curveSegments: 5});
    g.translate(0, 0, -(d - 2 * b) / 2);
    return new THREE.Mesh(g, material);
  }
  function octagon(THREE, w, h, cut) {
    const s = new THREE.Shape(), x = w / 2, y = h / 2, c = cut;
    s.moveTo(-x + c, -y); s.lineTo(x - c, -y); s.lineTo(x, -y + c);
    s.lineTo(x, y - c); s.lineTo(x - c, y); s.lineTo(-x + c, y);
    s.lineTo(-x, y - c); s.lineTo(-x, -y + c); s.closePath();
    return s;
  }
  function tube(THREE, points, radius, material, segments = 36) {
    return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(
      points.map(p => new THREE.Vector3(...p))), segments, radius, 9, false), material);
  }
  function cyl(THREE, radius, length, material, axis = 'y') {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 18), material);
    if (axis === 'x') m.rotation.z = Math.PI / 2;
    if (axis === 'z') m.rotation.x = Math.PI / 2;
    return m;
  }
  function edge(THREE, a, b, r, material) {
    const p = new THREE.Vector3(...a), q = new THREE.Vector3(...b), mid = p.clone().add(q).multiplyScalar(.5);
    const m = cyl(THREE, r, p.distanceTo(q), material);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), q.sub(p).normalize());
    m.position.copy(mid); return m;
  }
  async function build(THREE, baseUrl) {
    const base = new URL(baseUrl.endsWith('/') ? baseUrl : baseUrl + '/', location.href);
    const loader = new THREE.TextureLoader();
    const load = file => new Promise((resolve, reject) =>
      loader.load(new URL('textures/' + file, base).href, resolve, undefined, reject));
    const [rust, metal, glow, rustEmit] = await Promise.all(
      ['rust.png', 'metal.png', 'glow_emit.png', 'rust_emit.png'].map(load));
    [rust, metal, glow, rustEmit].forEach(t => {
      t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter;
      t.generateMipmaps = false; t.encoding = THREE.sRGBEncoding; t.needsUpdate = true;
    });
    const mat = {
      rust: new THREE.MeshStandardMaterial({color: 0xffffff, map: rust, metalness: .29, roughness: .91}),
      shadow: new THREE.MeshStandardMaterial({color: '#613528', map: rust, metalness: .34, roughness: .87}),
      copper: new THREE.MeshStandardMaterial({color: '#8a4a2a', metalness: .64, roughness: .56}),
      light: new THREE.MeshStandardMaterial({color: '#eb8b4b', metalness: .40, roughness: .62}),
      iron: new THREE.MeshStandardMaterial({color: '#83482d', map: metal, metalness: .76, roughness: .60}),
      black: new THREE.MeshStandardMaterial({color: '#241b22', metalness: .57, roughness: .75}),
      recess: new THREE.MeshStandardMaterial({color: '#29171a', map: rustEmit, metalness: .20, roughness: .82}),
      amber: new THREE.MeshStandardMaterial({color: '#ffc477', emissive: '#ffb040',
        emissiveIntensity: 2.8, roughness: .32, metalness: .08}),
      panel: new THREE.MeshStandardMaterial({color: '#c06a35', map: rustEmit, emissive: '#ffb040',
        emissiveMap: glow, emissiveIntensity: 1.8, metalness: .28, roughness: .76})
    };
    const root = new THREE.Group(); root.name = 'rusty-robot-volume';
    const named = (name, obj, parent = root, x = 0, y = 0, z = 0) => {
      obj.name = name; obj.position.set(x, y, z); parent.add(obj); return obj;
    };
    const bolt = (x, y, z, parent = root, axis = 'z') => {
      const screw = cyl(THREE, .023, .032, mat.light, axis);
      named('captive-bolt', screw, parent, x, y, z);
      return screw;
    };
    function armorPanel(parent, x, y, frontZ, width, height) {
      const poly = octagon(THREE, width, height, .10 * Math.min(width, height));
      const face = new THREE.Mesh(new THREE.ExtrudeGeometry(poly,
        {depth: .018, bevelEnabled: true, bevelThickness: .008, bevelSize: .008, bevelSegments: 1}), mat.recess);
      named('recessed-octagonal-well', face, parent, x, y, frontZ);
      const inset = new THREE.Mesh(new THREE.ExtrudeGeometry(
        octagon(THREE, width * .82, height * .76, .07), {depth: .010, bevelEnabled: false}), mat.panel);
      named('rust-emissive-panel', inset, parent, x, y, frontZ - .014);
      const hw = width / 2, hh = height / 2, k = .1 * Math.min(width, height);
      const pts = [[-hw + k, -hh], [hw - k, -hh], [hw, -hh + k], [hw, hh - k],
        [hw - k, hh], [-hw + k, hh], [-hw, hh - k], [-hw, -hh + k]];
      pts.forEach((p, i) => {
        const q = pts[(i + 1) % 8];
        named('raised-octagonal-frame', edge(THREE,
          [x + p[0], y + p[1], frontZ - .045],
          [x + q[0], y + q[1], frontZ - .045], .020, mat.copper), parent);
      });
      bolt(x - width * .32, y + height * .35, frontZ - .063, parent);
      bolt(x + width * .32, y - height * .35, frontZ - .063, parent);
      // Physically thick amber grille bars; no emissive decals or billboards.
      for (let i = -1; i <= 1; i++) {
        named('recess-light-slit', rounded(THREE, width * .07, height * .42, .035,
          .012, mat.amber), parent, x + i * width * .19, y, frontZ - .049);
      }
    }

    // Interlocking two-stage torso, lower shin/drive block and solid feet.
    const torso = named('torso', rounded(THREE, .92, .86, .74, .12, mat.rust), root, 0, 1.36, 0);
    named('torso-side-rib-left', rounded(THREE, .10, .72, .67, .035, mat.shadow), root, -.43, 1.36, .02);
    named('torso-side-rib-right', rounded(THREE, .10, .72, .67, .035, mat.shadow), root, .43, 1.36, .02);
    const lower = named('lower-block', rounded(THREE, .79, .40, .61, .07, mat.rust), root, 0, .84, .015);
    const foot = named('foot-foundation', rounded(THREE, .82, .37, .64, .06, mat.shadow), root, 0, .50, -.02);
    [-.22, .22].forEach(x => {
      named('foot-sole', rounded(THREE, .36, .25, .72, .045, mat.iron), root, x, .29, -.075);
      named('foot-toe', rounded(THREE, .32, .14, .29, .02, mat.rust), root, x, .20, -.38);
    });
    // No gap: lower-block overlaps the torso and foot foundation.
    armorPanel(root, 0, 1.38, -.405, .67, .58);
    armorPanel(root, 0, .84, -.343, .53, .27);
    [-1, 1].forEach(side => {
      const x = side * .49;
      named('torso-joint', cyl(THREE, .17, .22, mat.iron, 'x'), root, x, 1.30, .02);
      named('torso-joint-cap', cyl(THREE, .116, .06, mat.copper, 'x'), root,
        x + side * .12, 1.30, .02);
      bolt(x + side * .159, 1.30, -.065, root, 'x');
    });
    named('back-armor', rounded(THREE, .77, .73, .16, .045, mat.iron), root, 0, 1.38, .43);
    for (const x of [-.24, .24]) {
      named('back-brace', rounded(THREE, .09, .66, .16, .024, mat.copper), root, x, 1.34, .53);
      bolt(x, 1.65, .63);
    }

    // Neck is structural: its cylinder penetrates both torso and spherical head.
    const neck = named('neck', cyl(THREE, .18, .35, mat.iron), root, 0, 1.86, 0);
    named('neck-amber-seam', rounded(THREE, .055, .25, .044, .01, mat.amber),
      root, 0, 1.83, -.196);
    for (const y of [1.74, 1.99]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(.185, .022, 8, 32, Math.PI), mat.amber);
      ring.rotation.x = Math.PI / 2; ring.rotation.z = Math.PI / 2;
      named('neck-half-ring', ring, root, 0, y, -.04);
    }

    const head = named('head', new THREE.Mesh(new THREE.SphereGeometry(.47, 40, 24), mat.rust),
      root, 0, 2.35, 0);
    // Tangential dark seam is a 3D tube following the helmet curvature.
    named('vertical-helmet-seam', tube(THREE, [[0, 2.78, -.17], [0, 2.66, -.38],
      [0, 2.35, -.468], [0, 2.05, -.37], [0, 1.91, -.19]], .012, mat.black));
    const equator = new THREE.Mesh(new THREE.TorusGeometry(.468, .030, 10, 52), mat.copper);
    equator.rotation.x = Math.PI / 2; named('helmet-equatorial-rim', equator, root, 0, 2.30, 0);
    const bottomRim = new THREE.Mesh(new THREE.TorusGeometry(.345, .033, 9, 44), mat.copper);
    bottomRim.rotation.x = Math.PI / 2; named('helmet-lower-rim', bottomRim, root, 0, 2.018, 0);
    for (const side of [-1, 1]) {
      const eye = cyl(THREE, .105, .065, mat.iron, 'x');
      named('helmet-side-eye', eye, root, side * .446, 2.32, -.015);
      const pupil = cyl(THREE, .059, .075, mat.amber, 'x');
      named('eye-lens', pupil, root, side * .475, 2.32, -.015);
    }
    for (const x of [-.26, .26]) bolt(x, 2.55, -.33);

    // ONE uninterrupted antenna rod: every light orb physically intersects it.
    const rod = named('antenna-rod', cyl(THREE, .036, .71, mat.iron), root, 0, 3.09, 0);
    named('antenna-light-filament', cyl(THREE, .012, .68, mat.amber), root, 0, 3.09, -.042);
    [2.94, 3.11, 3.37].forEach((y, i) => {
      const rad = i === 2 ? .133 : .075;
      named('antenna-orb-' + i, new THREE.Mesh(new THREE.SphereGeometry(rad, 20, 14), mat.amber),
        root, 0, y, 0);
      const tor = new THREE.Mesh(new THREE.TorusGeometry(rad * .83, .021, 7, 24), mat.copper);
      tor.rotation.x = Math.PI / 2; named('antenna-orb-clamp', tor, root, 0, y - rad * .55, 0);
    });
    named('antenna-root-collar', cyl(THREE, .087, .13, mat.copper), root, 0, 2.79, 0);

    // Left crooked suspension runs from the helmet rim to the solid suspended arm block.
    const armTube = named('arm-support-tube', tube(THREE,
      [[-.38, 2.06, 0], [-.58, 1.95, 0], [-.78, 1.73, 0], [-.80, 1.43, 0],
        [-.83, 1.18, 0]], .082, mat.iron));
    const arm = named('hanging-arm-block',
      rounded(THREE, .43, .78, .32, .065, mat.rust), root, -.83, 1.18, -.01);
    armorPanel(root, -.83, 1.21, -.205, .30, .55);
    named('hanging-arm-bottom-slot', rounded(THREE, .23, .039, .041, .013, mat.amber),
      root, -.83, .79, -.217);
    [-1, 1].forEach(side => {
      named('arm-hinge', cyl(THREE, .082, .10, mat.copper, 'x'),
        root, -.83 + side * .23, 1.51, .005);
    });

    // Rear-right thick asymmetric slab with two emissive slots on its SIDE face.
    const bracket1 = named('rear-plate-bracket-upper',
      rounded(THREE, .43, .12, .32, .028, mat.iron), root, .54, 1.54, .10);
    const bracket2 = named('rear-plate-bracket-lower',
      rounded(THREE, .41, .13, .30, .028, mat.iron), root, .56, 1.15, .10);
    const plate = named('rear-right-thick-plate',
      rounded(THREE, .29, 1.01, .38, .052, mat.rust), root, .77, 1.39, .10);
    for (const y of [1.24, 1.60]) {
      const slot = rounded(THREE, .046, .20, .052, .012, mat.amber);
      slot.rotation.y = Math.PI / 2;
      named('rear-plate-side-slot', slot, root, .925, y, -.005);
      bolt(.90, y + .14, -.065, root, 'x');
    }
    // Thick extruded fin intersects both plate and helmet rim bracket.
    const finShape = new THREE.Shape();
    finShape.moveTo(.57, 1.80); finShape.lineTo(.68, 2.35);
    finShape.lineTo(.89, 1.99); finShape.lineTo(.90, 1.70); finShape.closePath();
    const finGeo = new THREE.ExtrudeGeometry(finShape, {depth: .29, bevelEnabled: true,
      bevelThickness: .02, bevelSize: .015, bevelSegments: 2});
    finGeo.translate(0, 0, -.12);
    const fin = named('upper-rear-fin', new THREE.Mesh(finGeo, mat.iron));
    named('fin-hinge', cyl(THREE, .09, .23, mat.copper, 'x'), root, .59, 1.85, .025);

    // Connected rear conduit, mechanical rear frame and bolted plates.
    named('rear-spine', tube(THREE, [[0, 1.83, .35], [.06, 1.52, .56],
      [-.07, 1.10, .54], [0, .79, .31]], .060, mat.copper));
    for (const x of [-.25, .25]) {
      named('rear-rivet-strip', rounded(THREE, .06, .45, .075, .02, mat.light), root, x, 1.32, .565);
      for (const y of [1.13, 1.50]) bolt(x, y, .624);
    }
    root.userData.contacts = [
      ['head', 'neck'], ['neck', 'torso'], ['torso', 'lower-block'],
      ['lower-block', 'foot-foundation'], ['head', 'antenna-root-collar'],
      ['antenna-root-collar', 'antenna-rod'], ['antenna-rod', 'antenna-orb-0'],
      ['antenna-rod', 'antenna-orb-1'], ['antenna-rod', 'antenna-orb-2'],
      ['head', 'arm-support-tube'], ['arm-support-tube', 'hanging-arm-block'],
      ['torso', 'rear-plate-bracket-upper'], ['torso', 'rear-plate-bracket-lower'],
      ['rear-plate-bracket-upper', 'rear-right-thick-plate'],
      ['rear-plate-bracket-lower', 'rear-right-thick-plate'],
      ['rear-right-thick-plate', 'upper-rear-fin']
    ];
    validate(THREE, root);
    return root;
  }

  function validate(THREE, root) {
    const pieces = new Map(), invalid = [];
    root.updateMatrixWorld(true);
    root.traverse(obj => {
      if (obj.isSprite || obj.geometry?.type === 'PlaneGeometry' ||
          (obj.isMesh && (!obj.geometry?.attributes?.position ||
             obj.geometry.boundingBox?.isEmpty()))) {
        invalid.push(obj.name || obj.type);
      }
      if (obj.isMesh && obj.geometry?.attributes?.position) {
        obj.geometry.computeBoundingBox();
        const bb = obj.geometry.boundingBox;
        const s = bb.getSize(new THREE.Vector3());
        if (s.x < .005 || s.y < .005 || s.z < .005) invalid.push('flat-volume:' + obj.name);
      }
      if (obj.name && !pieces.has(obj.name)) pieces.set(obj.name, obj);
    });
    const violations = [];
    for (const [a, b] of root.userData.contacts || []) {
      const A = pieces.get(a), B = pieces.get(b);
      if (!A || !B) { violations.push('missing ' + a + '/' + b); continue; }
      const x = new THREE.Box3().setFromObject(A), y = new THREE.Box3().setFromObject(B);
      if (!(x.min.x <= y.max.x + .012 && x.max.x + .012 >= y.min.x &&
            x.min.y <= y.max.y + .012 && x.max.y + .012 >= y.min.y &&
            x.min.z <= y.max.z + .012 && x.max.z + .012 >= y.min.z)) {
        violations.push('disconnected ' + a + '/' + b);
      }
    }
    if (invalid.length || violations.length) throw Error(
      'RUSTY_ROBOT_3D_INVALID: ' + [...invalid, ...violations].join(', '));
    return {meshes: [...pieces.values()].filter(p => p.isMesh).length,
      contacts: root.userData.contacts.length, planes: 0, sprites: 0};
  }
  global.RustyRobot3D = {build, validate};
})(typeof window !== 'undefined' ? window : globalThis);

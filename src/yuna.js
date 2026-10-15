// YUNA // V0.9 APPEARANCE-ONLY UPDATE
// Purpose: make Yuna look closer to the approved 4-view artwork.
// Approach: image-based multi-plane 3D presentation using the approved views directly,
// plus gentle holographic motion, soft hair-like sway, and preserved public API.
// This is an appearance-first 3D representation, not a hand-sculpted production mesh.

export function createYuna(THREE, scene, location={x:-5.0,z:11.8}) {
  const root = new THREE.Group();
  root.name = 'YUNA / APPEARANCE MODE';
  root.position.set(location.x, 0, location.z);
  scene.add(root);

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const TAU = Math.PI * 2;
  const V = (x=0,y=0,z=0)=> new THREE.Vector3(x,y,z);
  const TEX = new THREE.TextureLoader();
  const colorSpace = THREE.SRGBColorSpace || 'srgb';

  function loadTexture(rel) {
    const t = TEX.load(rel);
    t.colorSpace = colorSpace;
    t.anisotropy = 8;
    if ('premultiplyAlpha' in t) t.premultiplyAlpha = true;
    return t;
  }

  const textures = {
    front: loadTexture('./assets/generated/front.png'),
    frontRight: loadTexture('./assets/generated/frontRight.png'),
    right: loadTexture('./assets/generated/right.png'),
    backRight: loadTexture('./assets/generated/backRight.png'),
    back: loadTexture('./assets/generated/back.png'),
    backLeft: loadTexture('./assets/generated/backLeft.png'),
    left: loadTexture('./assets/generated/left.png'),
    frontLeft: loadTexture('./assets/generated/frontLeft.png')
  };

  function makePlaneGeometry(w, h, sy = 16) {
    if (THREE.PlaneGeometry) return new THREE.PlaneGeometry(w, h, 1, sy);
    // Test/runtime fallback: build a simple vertical plane BufferGeometry manually.
    if (THREE.BufferGeometry && THREE.Float32BufferAttribute) {
      const x = w / 2, step = h / sy, pos = [], uv = [], idx = [];
      for (let j = 0; j <= sy; j++) {
        const y = -h/2 + j * step;
        pos.push(-x, y, 0,  x, y, 0);
        uv.push(0, j/sy, 1, j/sy);
        if (j < sy) {
          const i = j * 2;
          idx.push(i, i+1, i+2, i+1, i+3, i+2);
        }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      g.setIndex(idx);
      if (g.computeVertexNormals) g.computeVertexNormals();
      return g;
    }
    return new THREE.SphereGeometry(1, 8, 8);
  }

  const body = new THREE.Group();
  body.position.y = 0.02;
  root.add(body);

  // Faint inner volume so Yuna still reads as present in 3D between view cards.
  const coreMat = new THREE.MeshPhysicalMaterial({
    color: 0x8a8ee9,
    transparent: true,
    opacity: 0.17,
    roughness: 0.45,
    metalness: 0.02,
    emissive: 0x4e58b7,
    emissiveIntensity: 0.25,
    side: THREE.DoubleSide || 2
  });
  if (THREE.CapsuleGeometry) {
    const core = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 1.18, 8, 16), coreMat);
    core.position.set(0, 1.08, 0.01);
    core.castShadow = true; core.receiveShadow = true;
    body.add(core);
  }

  const spec = [
    ['front', 0.00, 0.83],
    ['frontRight', Math.PI/4, 0.76],
    ['right', Math.PI/2, 0.56],
    ['backRight', 3*Math.PI/4, 0.76],
    ['back', Math.PI, 0.84],
    ['backLeft', 5*Math.PI/4, 0.76],
    ['left', 3*Math.PI/2, 0.58],
    ['frontLeft', 7*Math.PI/4, 0.76]
  ];

  const cards = [];
  const cardHeight = 2.10;
  const bodyRadius = 0.10;

  function cardMaterial(tex, opacity=1) {
    return new THREE.MeshPhysicalMaterial({
      map: tex,
      transparent: true,
      opacity,
      alphaTest: 0.06,
      roughness: 0.62,
      metalness: 0.02,
      emissive: 0x28386b,
      emissiveIntensity: 0.12,
      side: THREE.DoubleSide || 2,
      depthWrite: false
    });
  }
  function glowMaterial(tex) {
    return new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.12,
      color: 0x98b0ff,
      side: THREE.DoubleSide || 2,
      depthWrite: false,
      toneMapped: false
    });
  }

  function addCard(name, angle, width, tex) {
    const pivot = new THREE.Group();
    pivot.name = `CARD_PIVOT_${name.toUpperCase()}`;
    pivot.rotation.y = angle;
    body.add(pivot);

    const mesh = new THREE.Mesh(makePlaneGeometry(width, cardHeight, 20), cardMaterial(tex, 1));
    mesh.name = `YUNA_CARD_${name.toUpperCase()}`;
    mesh.position.set(Math.sin(angle) * bodyRadius, cardHeight/2, Math.cos(angle) * bodyRadius);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    pivot.add(mesh);

    const aura = new THREE.Mesh(makePlaneGeometry(width * 1.03, cardHeight * 1.03, 10), glowMaterial(tex));
    aura.name = `YUNA_AURA_${name.toUpperCase()}`;
    aura.position.set(mesh.position.x, mesh.position.y, mesh.position.z - 0.005);
    pivot.add(aura);

    cards.push({ pivot, mesh, aura, angle, width, phase: angle * 0.65, base: Float32Array.from(mesh.geometry.attributes.position.array) });
    return mesh;
  }

  for (const [name, angle, width] of spec) addCard(name, angle, width, textures[name]);

  // Extra face emphasis from the approved front artwork so the head reads more cleanly.
  const faceTex = loadTexture('./assets/yuna-face-detail.webp');
  const face = new THREE.Mesh(
    makePlaneGeometry(0.26, 0.32, 4),
    new THREE.MeshBasicMaterial({ map: faceTex, transparent: true, opacity: 0.92, alphaTest: 0.04, side: THREE.DoubleSide || 2, depthWrite: false })
  );
  face.name = 'YUNA_FACE_OVERLAY';
  face.position.set(0, 1.74, 0.14);
  body.add(face);

  // Hair ribbons: subtle holographic strands that move while staying close to the approved silhouette.
  const hairRoot = new THREE.Group();
  hairRoot.position.set(0, 1.79, -0.03);
  body.add(hairRoot);
  const hair = [];
  const hairMat = new THREE.MeshPhysicalMaterial({
    color: 0x7e83ef,
    transparent: true,
    opacity: 0.45,
    roughness: 0.35,
    metalness: 0.03,
    emissive: 0x344b95,
    emissiveIntensity: 0.55,
    side: THREE.DoubleSide || 2,
    depthWrite: false
  });
  function addHairRibbon(x, y, z, len, w, phase) {
    if (!THREE.PlaneGeometry) return;
    const g = new THREE.PlaneGeometry(w, len, 1, 10);
    const m = new THREE.Mesh(g, hairMat);
    m.name = 'YUNA_HAIR_RIBBON';
    m.position.set(x, y - len/2, z);
    hairRoot.add(m);
    hair.push({ mesh: m, base: Float32Array.from(g.attributes.position.array), phase, len });
  }
  for (let i = 0; i < 12; i++) {
    const x = -0.12 + i * 0.022;
    const len = 0.30 + (i % 4) * 0.03;
    addHairRibbon(x, 0, -0.02 - Math.abs(x) * 0.18, len, 0.05 + (i % 2) * 0.02, i * 0.4);
  }

  // Soft floor halo to keep the holographic presence.
  if (THREE.TorusGeometry) {
    const halo1 = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.012, 6, 64), new THREE.MeshBasicMaterial({ color: 0x71c7ff, transparent: true, opacity: 0.36, toneMapped: false }));
    halo1.rotation.x = Math.PI / 2; halo1.position.y = 0.01; root.add(halo1);
    const halo2 = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.008, 6, 64), new THREE.MeshBasicMaterial({ color: 0xc493ff, transparent: true, opacity: 0.24, toneMapped: false }));
    halo2.rotation.x = Math.PI / 2; halo2.position.y = 0.015; root.add(halo2);
  }

  class Spring {
    constructor(stiff=52, damp=10) { this.x = 0; this.v = 0; this.stiff = stiff; this.damp = damp; }
    step(target, dt) {
      const t = Math.min(dt, 1/30);
      this.v += (this.stiff * (target - this.x) - this.damp * this.v) * t;
      this.x += this.v * t;
      return this.x;
    }
  }

  const springs = { bust: new Spring(42, 8), rear: new Spring(34, 7), sway: new Spring(18, 5) };
  let secondary = 1.0;
  let hairFlow = 1.0;
  let walk = true;
  let pose = 'idle';
  let poseEnd = 0;
  let lastTime = 0;
  let progress = 0;
  let velocity = 0;
  const stops = [[-5,11.8],[-5.65,13.1],[-4.2,14.55],[-4.75,12.95],[-5.95,10.75]];
  let point = 0, wait = 1.7, lastSpeed = 0;

  function wave() { pose = 'wave'; poseEnd = lastTime + 2.5; wait = Math.max(wait, 2.5); }
  function setPose(p) { pose = p || 'idle'; poseEnd = lastTime + 2.6; if (p !== 'idle') wait = Math.max(wait, 2.6); }
  function setHairFlow(v) { hairFlow = clamp(Number(v) || 0, 0, 2.5); }
  function setSecondaryMotion(v) { secondary = clamp(Number(v) || 0, 0, 2.5); }
  function setWander(v) { walk = !!v; if (!walk) velocity = 0; wait = Math.max(wait, 0.25); }
  function getWander() { return walk; }
  function resetFacing() { root.rotation.y = 0; point = 0; }
  function rotateBy(rad) { root.rotation.y += Number(rad) || 0; walk = false; }
  function setFollow() { /* intentionally ignored: free inspection remains enabled */ }
  function setVisible(v) { root.visible = !!v; }
  function setDisplayMode() { return 'model'; }

  function updateCardGeometry(card, swayX, swayZ, rearPush) {
    const attr = card.mesh.geometry.attributes.position;
    const arr = attr.array;
    const base = card.base;
    const count = arr.length / 3;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const y = base[idx + 1];
      const yN = clamp((y / cardHeight), 0, 1);
      const headInfluence = Math.max(0, (yN - 0.58) / 0.42);
      const torsoInfluence = clamp((yN - 0.36) / 0.32, 0, 1) * clamp((0.76 - yN) / 0.28, 0, 1) * 4;
      const hipInfluence = clamp((0.58 - yN) / 0.26, 0, 1) * clamp((yN - 0.18) / 0.18, 0, 1) * 4;
      arr[idx] = base[idx] + swayX * headInfluence;
      arr[idx + 2] = base[idx + 2] + swayZ * headInfluence + torsoInfluence * 0.018 * secondary - hipInfluence * rearPush;
    }
    attr.needsUpdate = true;
    if (card.mesh.geometry.computeVertexNormals && Math.floor(lastTime * 20) % 4 === 0) card.mesh.geometry.computeVertexNormals();
  }

  function update(t, dt, cameraPos) {
    dt = clamp(dt, 0, 0.045); lastTime = t;
    if (pose !== 'idle' && t > poseEnd) pose = 'idle';

    let speed = 0;
    if (walk && pose === 'idle') {
      if (wait > 0) wait -= dt;
      else {
        const p = stops[point], dx = p[0] - root.position.x, dz = p[1] - root.position.z, dist = Math.hypot(dx, dz);
        if (dist < 0.14) { point = (point + 1) % stops.length; wait = 0.4 + (point % 3) * 0.55; }
        else {
          speed = 0.48;
          const n = Math.min(dist, speed * dt);
          root.position.x += dx / dist * n;
          root.position.z += dz / dist * n;
          const desired = Math.atan2(dx, dz);
          let delta = Math.atan2(Math.sin(desired - root.rotation.y), Math.cos(desired - root.rotation.y));
          root.rotation.y += clamp(delta, -dt * 1.4, dt * 1.4);
        }
      }
    }

    progress += ((speed > 0.05 ? speed * 9.5 : 1.5) * dt);
    const gait = speed > 0.05 ? Math.sin(progress) : 0;
    const accel = (speed - lastSpeed) / Math.max(0.025, dt); lastSpeed = speed;
    const bust = springs.bust.step((speed > 0.05 ? -0.010 * gait : 0.002 * Math.sin(t * 1.7)) + accel * 0.0018, dt) * secondary;
    const rear = springs.rear.step((speed > 0.05 ? 0.013 * Math.sin(progress + 0.85) : 0.003 * Math.sin(t * 1.15)) + accel * 0.0027, dt) * secondary;
    const sway = springs.sway.step((speed > 0.05 ? Math.sin(progress * 0.5) * 0.08 : Math.sin(t * 0.55) * 0.025), dt);

    body.rotation.z = Math.sin(t * 0.4) * 0.008 + (speed > 0.05 ? gait * 0.012 : 0);
    body.position.y = 0.02 + (speed > 0.05 ? Math.abs(Math.cos(progress)) * 0.014 : Math.sin(t * 1.0) * 0.003);
    face.position.z = 0.14 + bust * 0.45;

    for (const c of cards) {
      const localSwayX = Math.sin(t * 0.9 + c.phase) * 0.006 * hairFlow + sway * 0.05;
      const localSwayZ = Math.cos(t * 0.7 + c.phase) * 0.004 * hairFlow;
      updateCardGeometry(c, localSwayX, localSwayZ + bust * 0.2, Math.max(0, rear * 1.2));
      c.aura.material.opacity = 0.09 + 0.05 * Math.sin(t * 0.8 + c.phase);
    }

    hairRoot.rotation.z = Math.sin(t * 0.47) * 0.025 * hairFlow;
    hairRoot.rotation.x = Math.sin(t * 0.35) * 0.02 * hairFlow;
    for (const h of hair) {
      const attr = h.mesh.geometry.attributes.position;
      const arr = attr.array;
      const base = h.base;
      for (let i = 0; i < arr.length / 3; i++) {
        const idx = i * 3;
        const y = base[idx + 1];
        const yN = clamp((0.5 - y / h.len), 0, 1);
        const flow = Math.sin(t * 0.9 + h.phase + yN * 2.6) * 0.025 * hairFlow * yN;
        const drift = Math.cos(t * 0.5 + h.phase * 0.7 + yN * 3.2) * 0.016 * hairFlow * yN;
        arr[idx] = base[idx] + flow;
        arr[idx + 2] = base[idx + 2] + drift;
      }
      attr.needsUpdate = true;
      if (h.mesh.geometry.computeVertexNormals && Math.floor(t * 18) % 5 === 0) h.mesh.geometry.computeVertexNormals();
    }

    if (pose === 'wave') {
      body.rotation.y = Math.sin(t * 6.6) * 0.03;
      body.rotation.x = Math.sin(t * 3.3) * 0.01;
    } else {
      body.rotation.y = 0;
      body.rotation.x = 0;
    }

    velocity = speed;
  }

  return {
    root,
    update,
    wave,
    setPose,
    setHairFlow,
    setSecondaryMotion,
    setWander,
    getWander,
    setFollow,
    setVisible,
    setDisplayMode,
    getDisplayMode: () => 'model',
    rotateBy,
    resetFacing,
    getPose: () => pose,
    getFollow: () => false,
    getHairFlow: () => hairFlow,
    getSecondaryMotion: () => secondary,
    getStatus: () => ({ walk, speed: velocity })
  };
}

/**
 * Yuna Residence FPS controller.
 * Movement is derived directly from the actual Three.js CAMERA direction,
 * rather than maintaining an independent, potentially inverted yaw formula.
 * No dependency on Three.js is required inside this module.
 */
export const MOVE_KEYS = new Set([
  'KeyW','KeyA','KeyS','KeyD',
  'ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
  'ShiftLeft','ShiftRight'
]);

export function cameraRelativeDelta(camera, heldKeys, speed, dt, scratch = null) {
  const forwardKey = Number(heldKeys.has('KeyW') || heldKeys.has('ArrowUp'))
                   - Number(heldKeys.has('KeyS') || heldKeys.has('ArrowDown'));
  const rightKey = Number(heldKeys.has('KeyD') || heldKeys.has('ArrowRight'))
                 - Number(heldKeys.has('KeyA') || heldKeys.has('ArrowLeft'));
  const inputSize = Math.hypot(forwardKey, rightKey);
  if (!inputSize || !(dt > 0) || !(speed > 0)) {
    return { x: 0, z: 0, moving: false };
  }

  // Three.js cameras point down their local -Z axis. Flatten the WORLD-space
  // direction so pitch never changes walking speed or vertical position.
  const facing = scratch ?? camera.position.clone(); // actual THREE.Vector3 required
  camera.getWorldDirection(facing);
  const horizontal = Math.hypot(facing.x, facing.z);
  if (horizontal < 1e-6) return { x: 0, z: 0, moving: false };
  const fx = facing.x / horizontal;
  const fz = facing.z / horizontal;
  // Right = horizontal forward CROSS up, so looking toward -Z => right is +X.
  const rx = -fz;
  const rz = fx;
  const distance = speed * dt / inputSize;
  return {
    x: (fx * forwardKey + rx * rightKey) * distance,
    z: (fz * forwardKey + rz * rightKey) * distance,
    moving: true
  };
}

function editingText(target) {
  const tag = target?.tagName?.toUpperCase?.();
  return target?.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

export function installFPSControls({
  canvas, camera, doc = document, win = window, isActive = () => true,
  onLockChange = () => {}, onHotkey = () => false,
  onLockFailure = () => {}, sensitivity = 0.0022
}) {
  const keys = new Set();
  let yaw = camera.rotation.y || 0;
  let pitch = camera.rotation.x || 0;
  let locked = doc.pointerLockElement === canvas;
  const forwardScratch = camera.position.clone();
  camera.rotation.order = 'YXZ';

  const clearKeys = () => keys.clear();
  function orient() { camera.rotation.set(pitch, yaw, 0, 'YXZ'); }
  function onChange() {
    locked = doc.pointerLockElement === canvas;
    if (!locked) clearKeys();
    onLockChange(locked);
  }
  function onMove(e) {
    if (!locked || !isActive()) return;
    yaw -= e.movementX * sensitivity;
    pitch -= e.movementY * sensitivity;
    pitch = Math.max(-Math.PI / 2 + 0.02, Math.min(Math.PI / 2 - 0.02, pitch));
    orient();
  }
  function onDown(e) {
    if (editingText(e.target) || e.altKey || e.metaKey || e.ctrlKey) return;
    if (MOVE_KEYS.has(e.code)) {
      if (locked && isActive()) {
        e.preventDefault();
        keys.add(e.code); // repeats are harmless and cannot toggle movement
      }
      return;
    }
    if (!e.repeat && onHotkey(e.code)) e.preventDefault();
  }
  const onUp = e => { keys.delete(e.code); };
  const onVisibility = () => { if (doc.hidden) clearKeys(); };
  const onBlur = () => { clearKeys(); };
  doc.addEventListener('pointerlockchange', onChange);
  doc.addEventListener('mousemove', onMove);
  doc.addEventListener('keydown', onDown);
  doc.addEventListener('keyup', onUp);
  doc.addEventListener('visibilitychange', onVisibility);
  win.addEventListener('blur', onBlur);
  orient();

  function lock() {
    if (!isActive() || locked || doc.pointerLockElement === canvas) return;
    try {
      const attempt = canvas.requestPointerLock?.();
      if (attempt && typeof attempt.catch === 'function') attempt.catch(() => onLockFailure());
      if (!canvas.requestPointerLock) onLockFailure();
    } catch { onLockFailure(); }
  }
  function unlock() { if (doc.pointerLockElement === canvas) doc.exitPointerLock?.(); }
  function setOrientation(newYaw, newPitch = 0) {
    yaw = newYaw;
    pitch = Math.max(-Math.PI / 2 + .02, Math.min(Math.PI / 2 - .02, newPitch));
    clearKeys();
    orient();
  }
  function step(dt, speed, resolveCollision = () => {}) {
    orient();
    if (!locked || !isActive()) return { x: 0, z: 0, moving: false };
    const delta = cameraRelativeDelta(camera, keys, speed, dt, forwardScratch);
    // Resolve independent axes so sliding along a wall is still possible.
    const x0 = camera.position.x;
    camera.position.x += delta.x;
    resolveCollision('x', x0);
    const z0 = camera.position.z;
    camera.position.z += delta.z;
    resolveCollision('z', z0);
    return delta;
  }
  function dispose() {
    doc.removeEventListener('pointerlockchange', onChange);
    doc.removeEventListener('mousemove', onMove);
    doc.removeEventListener('keydown', onDown);
    doc.removeEventListener('keyup', onUp);
    doc.removeEventListener('visibilitychange', onVisibility);
    win.removeEventListener('blur', onBlur);
    clearKeys();
  }
  return {
    keys, lock, unlock, step, setOrientation, clearKeys, dispose,
    get locked() { return locked; },
    get yaw() { return yaw; },
    get pitch() { return pitch; }
  };
}

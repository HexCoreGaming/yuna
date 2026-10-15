/**
 * Camera-relative ground movement for Yuna Residence.
 * Three.js's default camera faces local -Z. With YXZ rotation and yaw=y,
 * horizontal forward is (-sin(y), -cos(y)); horizontal right is (cos(y), -sin(y)).
 * Pitch intentionally does not affect walking: looking up never makes W fly.
 */
export function movementDelta(yaw, keys, speed, dt) {
  const forward = Number(keys.has('KeyW') || keys.has('ArrowUp'))
                - Number(keys.has('KeyS') || keys.has('ArrowDown'));
  const strafe = Number(keys.has('KeyD') || keys.has('ArrowRight'))
               - Number(keys.has('KeyA') || keys.has('ArrowLeft'));
  const magnitude = Math.hypot(forward, strafe);
  if (!magnitude || !(dt > 0)) return { x: 0, z: 0, moving: false };
  const distance = speed * dt / magnitude;
  return {
    x: (-Math.sin(yaw) * forward + Math.cos(yaw) * strafe) * distance,
    z: (-Math.cos(yaw) * forward - Math.sin(yaw) * strafe) * distance,
    moving: true
  };
}

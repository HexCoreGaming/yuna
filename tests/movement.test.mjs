import test from 'node:test';
import assert from 'node:assert/strict';
import { cameraRelativeDelta } from '../src/fps-controls.js';

// Stub camera implementing the ACTUAL getWorldDirection API rather than a separate
// yaw formula hidden in game movement; matches Three.js YXZ mouse-look orientation.
const camera = (yaw = 0, pitch = 0) => ({
  position:{clone(){return {x:0,y:0,z:0,set(x,y,z){this.x=x;this.y=y;this.z=z;return this},normalize(){const h=Math.hypot(this.x,this.y,this.z);this.x/=h;this.y/=h;this.z/=h;return this},negate(){this.x=-this.x;this.y=-this.y;this.z=-this.z;return this}}}},
  getWorldDirection(target) {
    target.x = -Math.sin(yaw)*Math.cos(pitch);
    target.y = Math.sin(pitch);
    target.z = -Math.cos(yaw)*Math.cos(pitch);
    return target;
  }
});
const m = (yaw,pitch,keys,speed=5,dt=1) => cameraRelativeDelta(camera(yaw,pitch),new Set(keys),speed,dt);
const near = (a,b) => assert.ok(Math.abs(a-b) < 1e-8, `${a} !== ${b}`);
const expect = (v,x,z) => {near(v.x,x);near(v.z,z)};

for(const [name,yaw,forward,right] of [
 ['north',0,[0,-5],[5,0]],
 ['east',-Math.PI/2,[5,0],[0,5]],
 ['south',Math.PI,[0,5],[-5,0]],
 ['west',Math.PI/2,[-5,0],[0,-5]],
 ['northeast',-Math.PI/4,[5/Math.SQRT2,-5/Math.SQRT2],[5/Math.SQRT2,5/Math.SQRT2]]
]) test(`${name}: WASD aligned with actual camera`,()=>{
 expect(m(yaw,0,['KeyW']),...forward);
 expect(m(yaw,0,['KeyS']),...forward.map(x=>-x));
 expect(m(yaw,0,['KeyD']),...right);
 expect(m(yaw,0,['KeyA']),...right.map(x=>-x));
});

test('looking up and looking down does not make WASD fly or reduce speed',()=>{
 const level=m(-1.2,0,['KeyW']);
 for(const p of [-1.45,-.7,.7,1.45]) expect(m(-1.2,p,['KeyW']),level.x,level.z);
});
test('same speed for diagonal movement',()=>{
 for(const a of [0,-.8,1,Math.PI]) near(Math.hypot(...Object.values(m(a,0,['KeyW','KeyD'])).slice(0,2)),5);
});
test('opposite keys cancel regardless of angle',()=>{
 expect(m(-.6,0,['KeyW','KeyS']),0,0);expect(m(.6,0,['KeyA','KeyD']),0,0);
 expect(m(0,0,[]),0,0);
});
test('sprint speed and frame time',()=>{
 const a=m(0,0,['KeyW'],5,.02),b=m(0,0,['KeyW'],5,.01),s=m(0,0,['KeyW'],8.5,1);
 near(a.z,2*b.z); near(s.z,-8.5);
});
test('arrow keys match WASD',()=>{
 expect(m(.65,0,['ArrowUp']),...Object.values(m(.65,0,['KeyW'])).slice(0,2));
 expect(m(.65,0,['ArrowLeft']),...Object.values(m(.65,0,['KeyA'])).slice(0,2));
});

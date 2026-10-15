import test from 'node:test';
import assert from 'node:assert/strict';
import { movementDelta } from '../src/movement.js';
const m=(angle,...codes)=>movementDelta(angle,new Set(codes),5,1);
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} should equal ${b}`);
const expect=(v,x,z)=>{near(v.x,x);near(v.z,z)};

test('facing north/-Z: W forward, S back, A left, D right',()=>{
 expect(m(0,'KeyW'),0,-5);expect(m(0,'KeyS'),0,5);
 expect(m(0,'KeyA'),-5,0);expect(m(0,'KeyD'),5,0);
});
test('turning right with mouse: W moves where the camera faces',()=>{
 expect(m(-Math.PI/2,'KeyW'),5,0);
 expect(m(-Math.PI/2,'KeyD'),0,5);
 expect(m(-Math.PI/2,'KeyA'),0,-5);
});
test('turning left with mouse: W moves where the camera faces',()=>{
 expect(m(Math.PI/2,'KeyW'),-5,0);
 expect(m(Math.PI/2,'KeyD'),0,-5);
});
test('facing backwards/+Z: WASD orientation follows camera yaw',()=>{
 expect(m(Math.PI,'KeyW'),0,5);expect(m(Math.PI,'KeyD'),-5,0);
});
test('diagonal walking normalized (not faster)',()=>{
 const v=m(-Math.PI/4,'KeyW','KeyD');near(Math.hypot(v.x,v.z),5);
});
test('opposite keys cancel and no keys do not move',()=>{
 expect(m(0,'KeyW','KeyS'),0,0);expect(m(0,'KeyA','KeyD'),0,0);
 expect(m(0),0,0);
});
test('frame-rate independence and sprint speed',()=>{
 const k=new Set(['KeyW']);const a=movementDelta(0,k,5,.02);const b=movementDelta(0,k,5,.01);near(a.z,2*b.z);
 const fast=movementDelta(0,k,8.5,1);near(Math.hypot(fast.x,fast.z),8.5);
});
test('arrow-key movement matches WASD',()=>{
 const a=m(-.8,'ArrowUp');const b=m(-.8,'KeyW');expect(a,b.x,b.z);
});

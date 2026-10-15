import test from 'node:test';
import assert from 'node:assert/strict';
import { createYuna } from '../src/yuna.js';

// Lightweight Three.js geometry stand-ins. These exercise Yuna's actual runtime
// update/facing behavior, without depending on internet access or a GPU.
class V3 {
  constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}
  set(x,y,z){this.x=x;this.y=y;this.z=z;return this}
  clone(){return new V3(this.x,this.y,this.z)}
  add(v){this.x+=v.x;this.y+=v.y;this.z+=v.z;return this}
  sub(v){this.x-=v.x;this.y-=v.y;this.z-=v.z;return this}
  addScaledVector(v,s){this.x+=v.x*s;this.y+=v.y*s;this.z+=v.z*s;return this}
  multiplyScalar(s){this.x*=s;this.y*=s;this.z*=s;return this}
  dot(v){return this.x*v.x+this.y*v.y+this.z*v.z}
  crossVectors(a,b){return this.set(a.y*b.z-a.z*b.y,a.z*b.x-a.x*b.z,a.x*b.y-a.y*b.x)}
  normalize(){const len=Math.hypot(this.x,this.y,this.z)||1;return this.multiplyScalar(1/len)}
}
class Object3D {
  constructor(){this.children=[];this.position=new V3();this.rotation={x:0,y:0,z:0};this.scale=new V3(1,1,1);this.userData={};this.visible=true}
  add(child){this.children.push(child);return this}
}
class Mesh extends Object3D {constructor(geometry,material){super();this.geometry=geometry;this.material=material}}
class Shape {constructor(...args){this.args=args}}
class Material {constructor(params={}){Object.assign(this,params)}}
class BufferGeometry {setAttribute(){return this}setIndex(){return this}computeVertexNormals(){}}
class Curve {
  constructor(points){this.points=points}
  getPoint(t){const a=t*(this.points.length-1),idx=Math.min(this.points.length-2,Math.floor(a));const frac=a-idx;const p=this.points[idx],q=this.points[idx+1];return new V3(p.x+(q.x-p.x)*frac,p.y+(q.y-p.y)*frac,p.z+(q.z-p.z)*frac)}
  getTangent(t){const a=Math.min(this.points.length-2,Math.floor(t*(this.points.length-1)));return this.points[a+1].clone().sub(this.points[a]).normalize()}
}
const THREE={
  Group:Object3D,Mesh,Vector3:V3,BufferGeometry,CatmullRomCurve3:Curve,
  MeshPhysicalMaterial:Material,MeshBasicMaterial:Material,MeshStandardMaterial:Material,
  SphereGeometry:Shape,TubeGeometry:Shape,BoxGeometry:Shape,TorusGeometry:Shape,
  Float32BufferAttribute:Shape,PointLight:class extends Object3D{constructor(...args){super();this.args=args}},
  MathUtils:{lerp:(a,b,t)=>a+(b-a)*t,clamp:(x,a,b)=>Math.max(a,Math.min(b,x))},
  DoubleSide:2
};

test('Yuna is real 3D meshes by default, not image projections',()=>{
  const scene=new Object3D(), yuna=createYuna(THREE,scene);
  assert.equal(yuna.getDisplayMode(),'model');
  assert.equal(yuna.root.children.some(c=>c.name==='Yuna_Sculpted_Torso'),true);
  assert.equal(yuna.root.children.some(c=>c.name==='Yuna_2D_Reference_Projection'),false);
  assert.equal(yuna.getFollow(),false);
});

test('Yuna faces an independent fixed direction while player circles her',()=>{
  const yuna=createYuna(THREE,new Object3D());
  for(const [time,x,z] of [[1,0,8],[2,5,-3],[3,-20,-17],[4,0,-20],[5,16,5]]) {
    yuna.update(time,1/30,new V3(x,1.7,z));
    assert.equal(yuna.root.rotation.y,0,'yaw must not track player position');
  }
  yuna.setFollow(true);
  yuna.update(6,1/30,new V3(20,2,20));
  assert.equal(yuna.root.rotation.y,0);
  assert.equal(yuna.getFollow(),false);
});

test('only explicit turning alters facing and reset restores it',()=>{
  const yuna=createYuna(THREE,new Object3D());
  yuna.rotateBy(Math.PI/4);
  assert.equal(yuna.root.rotation.y,Math.PI/4);
  yuna.update(1,.04,new V3(10,2,-20));
  assert.equal(yuna.root.rotation.y,Math.PI/4);
  yuna.resetFacing();
  assert.equal(yuna.root.rotation.y,0);
});

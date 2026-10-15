import test from 'node:test';
import assert from 'node:assert/strict';
import {createYuna} from '../src/yuna.js';
// Geometry/animation regression harness: tests without network, GPU or Three.js.
class V3{constructor(x=0,y=0,z=0){this.set(x,y,z)}set(x,y,z){this.x=x;this.y=y;this.z=z;return this}clone(){return new V3(this.x,this.y,this.z)}}
class Obj{constructor(){this.children=[];this.position=new V3;this.rotation={x:0,y:0,z:0};this.scale=new V3(1,1,1);this.visible=true;this.userData={}}add(o){this.children.push(o);return this}}
class Mesh extends Obj{constructor(g,m){super();this.geometry=g;this.material=m}}
class Shape{constructor(...args){this.args=args}}
class Material{constructor(a={}){Object.assign(this,a)}}
class TextureLoader{load(url){return {url,colorSpace:'',anisotropy:1}}}
class Attr{constructor(data,n){this.array=Float32Array.from(data);this.itemSize=n;this.needsUpdate=false}}
class BufferGeometry{constructor(){this.attributes={}}setAttribute(k,v){this.attributes[k]=v;return this}setIndex(a){this.index=a;return this}computeVertexNormals(){}computeBoundingSphere(){}}
class Curve{constructor(points){this.points=points}}
const THREE={Group:Obj,Mesh,Vector3:V3,TextureLoader,BufferGeometry,Float32BufferAttribute:Attr,
  MeshPhysicalMaterial:Material,MeshBasicMaterial:Material,MeshStandardMaterial:Material,
  SphereGeometry:Shape,TubeGeometry:Shape,TorusGeometry:Shape,CatmullRomCurve3:Curve,
  PointLight:class extends Obj{constructor(){super();this.intensity=1}},DoubleSide:2,
  SRGBColorSpace:'srgb',ClampToEdgeWrapping:42};
const descendants=o=>[o,...o.children.flatMap(descendants)];
function make(){return createYuna(THREE,new Obj())}
test('real curved 3D geometry with art-source UVs and physical surfaces',()=>{
 const c=make();assert.equal(c.getDisplayMode(),'model');
 const mesh=descendants(c.root).filter(o=>o instanceof Mesh);
 assert.ok(mesh.some(o=>o.name==='CORE_FRONT'));
 assert.ok(mesh.some(o=>o.name==='CORE_BACK'));
 assert.ok(mesh.some(o=>o.name==='FACE_FRONT'));
 assert.ok(mesh.filter(o=>o.name==='FLOATING_HAIR_RIBBON').length>=60);
 assert.ok(!mesh.some(o=>o.name.includes('Reference_Projection')));
 const front=mesh.find(o=>o.name==='CORE_FRONT').geometry;
 assert.ok(front.attributes.position.array.length>9000);
 assert.ok(front.attributes.uv.array.length>6000);
});
test('animation and adjustable physics update mesh vertices',()=>{
 const c=make();c.setWander(false);c.setSecondaryMotion(2.3);c.setHairFlow(1.7);
 const front=descendants(c.root).find(o=>o.name==='CORE_FRONT').geometry;
 const initial=front.attributes.position.array.slice();
 for(let i=0;i<40;i++)c.update(i/30,1/30,new V3(4,1.7,4));
 assert.equal(front.attributes.position.needsUpdate,true);
 assert.notDeepEqual(Array.from(initial),Array.from(front.attributes.position.array));
 assert.equal(c.getSecondaryMotion(),2.3);
});
test('360 inspection: does not turn to face moving camera',()=>{
 const c=make();c.setWander(false);
 for(const [i,x,z] of [[0,1,3],[1,8,-4],[2,-9,-12],[3,3,5]]){
   c.update(i+1,1/30,new V3(x,1.7,z));assert.equal(c.root.rotation.y,0);
 }
 c.setFollow(true);c.update(10,1/30,new V3(90,2,0));assert.equal(c.getFollow(),false);
});
test('manual facing changes and walking toggle are independent',()=>{
 const c=make();c.rotateBy(Math.PI/4);
 assert.equal(c.getWander(),false);assert.equal(c.root.rotation.y,Math.PI/4);
 c.update(1,.03,new V3(5,2,8));assert.equal(c.root.rotation.y,Math.PI/4);
 c.resetFacing();assert.equal(c.root.rotation.y,0);
 c.setWander(true);assert.equal(c.getWander(),true);
});
test('autonomous walk moves Yuna through atrium rather than rotating toward player',()=>{
 const c=make();
 for(let i=1;i<=210;i++)c.update(i/30,1/30,new V3(300,2,300));
 assert.ok(Math.hypot(c.root.position.x+3.15,c.root.position.z-12.9)>.2);
 assert.equal(c.getFollow(),false);
});

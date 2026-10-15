import test from 'node:test';
import assert from 'node:assert/strict';
import {createYuna} from '../src/yuna.js';

class V3{constructor(x=0,y=0,z=0){this.set(x,y,z)}set(x,y,z){this.x=x;this.y=y;this.z=z;return this}copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this}clone(){return new V3(this.x,this.y,this.z)}}
class Obj{constructor(){this.children=[];this.position=new V3;this.rotation={x:0,y:0,z:0};this.scale=new V3(1,1,1);this.visible=true;this.userData={};this.name=''}add(o){this.children.push(o);return this}}
class Mesh extends Obj{constructor(g,m){super();this.geometry=g;this.material=m}}
class Shape{constructor(...args){this.args=args}}
class Material{constructor(a={}){Object.assign(this,a)}}
class TextureLoader{load(url){return {url,colorSpace:'',anisotropy:1}}}
class Attr{constructor(data,n){this.array=Float32Array.from(data);this.itemSize=n;this.needsUpdate=false}}
class BufferGeometry{constructor(){this.attributes={}}setAttribute(k,v){this.attributes[k]=v;return this}setIndex(a){this.index=a;return this}computeVertexNormals(){}}
const THREE={Group:Obj,Mesh,Vector3:V3,TextureLoader,BufferGeometry,Float32BufferAttribute:Attr,
  MeshPhysicalMaterial:Material,MeshBasicMaterial:Material,MeshStandardMaterial:Material,
  BoxGeometry:Shape,SphereGeometry:Shape,TorusGeometry:Shape,DoubleSide:2,SRGBColorSpace:'srgb'};
const descendants=o=>[o,...o.children.flatMap(descendants)];
function make(){return createYuna(THREE,new Obj())}

test('creates appearance-first 3d Yuna with multiple view cards',()=>{
  const c=make();
  const mesh=descendants(c.root).filter(o=>o instanceof Mesh);
  const names=mesh.map(m=>m.name);
  assert.equal(c.getDisplayMode(),'model');
  assert.ok(names.includes('YUNA_CARD_FRONT'));
  assert.ok(names.includes('YUNA_CARD_RIGHT'));
  assert.ok(names.includes('YUNA_CARD_BACK'));
  assert.ok(names.includes('YUNA_CARD_LEFT'));
  assert.ok(names.filter(n=>n.startsWith('YUNA_CARD_')).length>=8);
});

test('keeps free inspection: update does not force facing camera',()=>{
  const c=make(); c.setWander(false);
  c.update(1,1/30,new V3(8,1.7,-4));
  assert.equal(c.root.rotation.y,0);
  c.setFollow(true);
  c.update(2,1/30,new V3(-9,1.7,3));
  assert.equal(c.getFollow(),false);
});

test('manual rotation and autonomous movement both work',()=>{
  const c=make();
  c.rotateBy(Math.PI/4); assert.equal(c.root.rotation.y,Math.PI/4);
  c.setWander(true);
  for(let i=1;i<=180;i++) c.update(i/30,1/30,new V3(300,2,300));
  assert.ok(Math.hypot(c.root.position.x+5,c.root.position.z-11.8)>.15);
});

test('secondary motion and hair flow settings are retained',()=>{
  const c=make(); c.setHairFlow(1.8); c.setSecondaryMotion(2.2); c.setWander(false);
  for(let i=0;i<10;i++) c.update(i/30,1/30,new V3(4,1.8,4));
  assert.equal(c.getHairFlow(),1.8);
  assert.equal(c.getSecondaryMotion(),2.2);
});

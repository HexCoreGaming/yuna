import assert from 'node:assert/strict';
import {checkEngines} from '../engine/diagnostics.js';
import {SoftMesh,Spring} from '../engine/physics.js';
import {createStandardRig} from '../engine/rig.js';
import {AnimationEngine,installTestClips} from '../engine/animation.js';
const cases=checkEngines();for(const c of cases){assert.ok(c.ok,`${c.name}: ${c.error}`)}
const m=new SoftMesh(100,100);m.impulse(.5,.5,120,0);for(let i=0;i<120;i++)m.update(1/120,i/120);assert.ok(m.positions.every(Number.isFinite));assert.equal(m.positions[0],0);assert.equal(m.positions[1],0); // pinned boundary
const r=createStandardRig(),anim=new AnimationEngine(r);installTestClips(anim);anim.play('wave');for(let i=0;i<120;i++)anim.update(1/120);assert.notEqual(r.get('armRight'),0);
console.log(`PASS ${cases.length+4} independent checks`);

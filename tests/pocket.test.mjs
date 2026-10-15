import test from 'node:test';
import assert from 'node:assert/strict';
import {clamp,smoothstep,Spring,SCENES,MOODS,replyTo} from '../pocket/pocket-engine.mjs';

test('pocket has five unique selectable scenes',()=>{
  assert.equal(SCENES.length,5);
  assert.equal(new Set(SCENES.map(s=>s.id)).size,5);
  assert.ok(SCENES.every(s=>s.title&&s.line&&s.motion));
});
test('moods include calm happy curious playful',()=>assert.deepEqual(MOODS,['calm','happy','curious','playful']));
test('clamping keeps physics in supported range',()=>{
  assert.equal(clamp(3,0,2.5),2.5);
  assert.equal(clamp(-.2,0,2.5),0);
  assert.equal(smoothstep(0,1,-1),0);
  assert.equal(smoothstep(0,1,2),1);
});
test('damped spring settles toward target without diverging',()=>{
  const s=new Spring(11,.76);
  for(let i=0;i<240;i++) s.update(1,1/120);
  assert.ok(Number.isFinite(s.value));
  assert.ok(Math.abs(s.value-1)<.05);
  s.kick(2);assert.ok(Number.isFinite(s.update(1,1/60)));
  s.reset();assert.equal(s.value,0);
});
test('scripted lines do not pretend to be a connected AI',()=>{
  assert.match(replyTo('help me with work'),/not a thinking assistant/);
  assert.match(replyTo('who are you'),/scripted/);
  assert.match(replyTo('I am tired'),/no rush/i);
  assert.match(replyTo('hi'),/good to see/i);
});

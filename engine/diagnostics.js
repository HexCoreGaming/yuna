// [011] engine-level sanity checks before character artwork integration
import {FixedClock} from './core.js';
import {Spring,SoftMesh,PhysicsWorld} from './physics.js';
import {createStandardRig} from './rig.js';
import {AnimationEngine,installTestClips} from './animation.js';
import {AssetEngine} from './assets.js';
import {BehaviorEngine} from './behavior.js';
import {SceneEngine} from './scenes.js';
export function checkEngines(){const result=[];const check=(name,fn)=>{try{fn();result.push({name,ok:true})}catch(e){result.push({name,ok:false,error:String(e)})}};
 check('Fixed-step simulation',()=>{const c=new FixedClock();let n=0;c.advance(.1,()=>n++);if(n!==12)throw Error(`Expected 12 steps; got ${n}`)});
 check('Spring-mass physics',()=>{const s=new Spring();s.kick(10);for(let i=0;i<120;i++)s.step(1/120);if(!Number.isFinite(s.x)||Math.abs(s.x)>10)throw Error('Unstable spring')});
 check('Triangle mesh integration',()=>{const m=new SoftMesh(100,100);m.impulse(.5,.5,0,100);m.update(1/120,.01);if(m.positions.some(n=>!Number.isFinite(n)))throw Error('Invalid vertices')});
 check('Rig parameters',()=>{const r=createStandardRig();r.set('headTurn',99);if(r.get('headTurn')!==1)throw Error('Failed clamp')});
 check('Animation playback',()=>{const r=createStandardRig(),a=new AnimationEngine(r);installTestClips(a);a.update(.25);if(!Number.isFinite(r.get('breath')))throw Error('Bad rig animation')});
 check('Asset manifest validation',()=>{const a=new AssetEngine();a.validate({layers:[{id:'test',url:'test.png'}]})});
 check('Behavior state machine',()=>{const b=new BehaviorEngine();b.enabled=true;b.interval=.1;if(!b.update(.2,new Set(['idle'])))throw Error('No behavior')});
 check('Scene registry',()=>{const s=new SceneEngine();s.addCharacter('future-character',{});if(s.serialize().characters.length!==1)throw Error('No registration')});
 return result}

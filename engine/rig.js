// [003] schema-checked independent anatomy-independent 2D rig parameter channel
import {clamp,mix} from './core.js';
export class RigEngine {
 constructor(){this.parts=new Map();this.parameters=new Map();this.constraints=new Map()}
 define(name,{min=-1,max=1,defaultValue=0}={}){this.parameters.set(name,defaultValue);this.constraints.set(name,{min,max});return this}
 set(name,value){if(!this.constraints.has(name))throw Error(`Unknown rig parameter: ${name}`);const c=this.constraints.get(name);this.parameters.set(name,clamp(value,c.min,c.max))}
 get(name){return this.parameters.get(name)??0}
 registerPart(id,{texture,anchor=[.5,.5],parameter=null,mesh=false,region=null}={}){if(!texture)throw Error(`Missing texture for ${id}`);this.parts.set(id,{texture,anchor,parameter,mesh,region})}
 applyPose(pose,weight=1){for(const [name,value] of Object.entries(pose))if(this.constraints.has(name))this.set(name,mix(this.get(name),value,weight))}
 snapshot(){return Object.fromEntries(this.parameters)}
}
export function createStandardRig(){const r=new RigEngine();for(const key of ['headX','headY','headTurn','headTilt','torsoTurn','torsoLean','hipTurn','armLeft','armRight','legLeft','legRight','hairFlow','eyeBlink','eyeLookX','eyeLookY','mouthOpen','smile','breath','softMotion'])r.define(key,{min:-1,max:1});return r}

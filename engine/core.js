// [001] Shared math, deterministic fixed-timestep scheduler, event bus.
export const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export const lerp=(a,b,t)=>a+(b-a)*t;
export const smooth=(a,b,rate,dt)=>lerp(a,b,1-Math.exp(-rate*dt));
export class Events{constructor(){this.listeners=new Map()} on(type,callback){const s=this.listeners.get(type)||new Set();s.add(callback);this.listeners.set(type,s);return()=>s.delete(callback)}emit(type,data){this.listeners.get(type)?.forEach(fn=>fn(data))}}
export class Clock{constructor(step=1/120){this.step=step;this.left=0;this.seconds=0}run(dt,fn){this.left=Math.min(.1,this.left+Math.min(dt,.05));let count=0;while(this.left>=this.step&&count++<12){this.seconds+=this.step;fn(this.step,this.seconds);this.left-=this.step}}}

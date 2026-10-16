// [001] deterministic simulation clock and math
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const mix=(a,b,t)=>a+(b-a)*t;
export class FixedClock {
 constructor(step=1/120){this.step=step;this.accumulator=0;this.time=0;this.ticks=0}
 advance(delta,fn){this.accumulator=Math.min(.25,this.accumulator+clamp(delta,0,.25));let n=0;while(this.accumulator>=this.step&&n<30){this.accumulator-=this.step;this.time+=this.step;this.ticks++;fn(this.step,this.time);n++}return n}
}
export class EventBus{constructor(){this.handlers=new Map()}on(name,fn){const set=this.handlers.get(name)||new Set;set.add(fn);this.handlers.set(name,set);return()=>set.delete(fn)}emit(name,data){for(const fn of this.handlers.get(name)||[])fn(data)}}

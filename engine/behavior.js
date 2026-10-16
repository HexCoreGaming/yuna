// [006] autonomous bounded state machine; only valid registered actions
export class BehaviorEngine{
 constructor(){this.enabled=false;this.elapsed=0;this.interval=5;this.actions=['idle','look','wave'];this.next=null}
 update(dt,valid){if(!this.enabled)return null;this.elapsed+=dt;if(this.elapsed<this.interval)return null;this.elapsed=0;const possible=this.actions.filter(a=>valid.has(a));return possible.length?possible[Math.floor(Math.random()*possible.length)]:null}
}

// [003] Independent animation engine: named parameter tracks, crossfades, procedural key poses.
import {smooth} from './core.js';
const P=(head=0,body=0,leftArm=0,rightArm=0,hips=0,leftLeg=0,rightLeg=0)=>({head,body,leftArm,rightArm,hips,leftLeg,rightLeg});
export class AnimationDirector{
 constructor(){this.name='idle';this.time=0;this.blend=0;this.from=P();this.current=P();this.speed=1;this.mood='calm'}
 select(name){if(!['idle','wave','dance','stretch','laugh','pose'].includes(name))return;this.from={...this.current};this.name=name;this.time=0;this.blend=0}
 setMood(mood){this.mood=mood}
 update(dt){this.time+=dt*this.speed;this.blend=Math.min(1,this.blend+dt*3.8);const t=this.time,w=Math.sin(t*2.1),breath=Math.sin(t*2.35)*.013;let to=P(Math.sin(t*.72)*.017,breath,Math.sin(t*1.13)*.025,Math.sin(t*1.1+2)*.025,Math.sin(t*.93)*.012,0,0);
 if(this.name==='wave'){to={...to,head:-.065,rightArm:-.75+Math.sin(t*8)*.14,leftArm:.04,body:breath+.02}}
 if(this.name==='dance'){to=P(Math.sin(t*4)*.10,Math.sin(t*4+.2)*.07,Math.sin(t*5)*.32,Math.sin(t*5+2.1)*.3,Math.sin(t*4)*.15,Math.sin(t*4)*.09,-Math.sin(t*4)*.09)}
 if(this.name==='stretch'){to=P(-.08,Math.sin(t*1.2)*.045,-.68,-.68,0,-.025,.025)}
 if(this.name==='laugh'){to=P(Math.sin(t*9)*.055,.04+Math.sin(t*9)*.032,.09,-.14,Math.sin(t*6)*.025,0,0)}
 if(this.name==='pose'){to=P(.075,.012,.13,-.34,-.08,-.04,.04)}
 if(this.mood==='happy')to.head+=.035;if(this.mood==='mischievous')to.head-=.045;
 for(const key in to)this.current[key]=smooth(this.current[key],this.from[key]*(1-this.blend)+to[key]*this.blend,13,dt);
 return this.current}
}

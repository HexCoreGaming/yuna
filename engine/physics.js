// [002] True damped spring integration used by rig controllers and mesh vertices.
import {clamp} from './core.js';
export class Spring{constructor(stiffness=100,damping=9){this.k=stiffness;this.c=damping;this.x=0;this.v=0}impulse(f){this.v+=f}step(dt,target=0){const a=this.k*(target-this.x)-this.c*this.v;this.v+=a*dt;this.x+=this.v*dt;return this.x}}
export class MeshDynamics{
 constructor(grid=12){this.grid=grid;this.points=[];this.vertices=[];this.uvs=[];this.indices=[];for(let y=0;y<=grid;y++)for(let x=0;x<=grid;x++){const u=x/grid,v=y/grid,weight=Math.pow(Math.max(0,Math.sin(u*Math.PI)*Math.sin(v*Math.PI)),.66);this.points.push({u,v,weight,sx:new Spring(110,8),sy:new Spring(110,8)});this.vertices.push(0,0);this.uvs.push(u,v)}for(let y=0;y<grid;y++)for(let x=0;x<grid;x++){let i=y*(grid+1)+x;this.indices.push(i,i+grid+1,i+1,i+1,i+grid+1,i+grid+2)}this.vertices=new Float32Array(this.vertices);this.uvs=new Float32Array(this.uvs);this.indices=new Uint16Array(this.indices)}
 impulse(x,y,fx,fy,amount=1){for(const p of this.points){const radius=(p.u-x)**2+(p.v-y)**2;const falloff=Math.exp(-radius*22)*p.weight*amount;p.sx.impulse(fx*falloff);p.sy.impulse(fy*falloff)}}
 update(dt,w,h,time,intensity=1,tilt=[0,0]){this.points.forEach((p,i)=>{const breathe=Math.sin(time*2.6+p.u*1.4)*1.1*p.weight;const tx=(breathe+tilt[0]*5*p.weight)*intensity;const ty=(Math.cos(time*2.1+p.u)*.85*p.weight+tilt[1]*5*p.weight)*intensity;const dx=p.sx.step(dt,tx),dy=p.sy.step(dt,ty);this.vertices[i*2]=p.u*w+clamp(dx,-40,40);this.vertices[i*2+1]=p.v*h+clamp(dy,-40,40)})}
}

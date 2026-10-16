// [002] stable real spring integration, deformable triangle-grid regions
import {clamp} from './core.js';
export class Spring {
 constructor({stiffness=95,damping=11,mass=1}={}){Object.assign(this,{stiffness,damping,mass,x:0,v:0})}
 kick(velocity){this.v+=velocity}
 step(dt,target=0){const force=this.stiffness*(target-this.x)-this.damping*this.v;this.v+=force/this.mass*dt;this.x+=this.v*dt;return this.x}
 reset(){this.x=0;this.v=0}
}
export class SoftMesh {
 constructor(width,height,columns=18,rows=18){this.width=width;this.height=height;this.columns=columns;this.rows=rows;this.nodes=[];this.positions=new Float32Array((columns+1)*(rows+1)*2);this.uvs=new Float32Array(this.positions.length);this.indices=[];
 for(let y=0;y<=rows;y++)for(let x=0;x<=columns;x++){const u=x/columns,v=y/rows;const pin=Math.pow(Math.sin(u*Math.PI)*Math.sin(v*Math.PI),.7);const idx=this.nodes.length;this.nodes.push({u,v,pin,x:new Spring(),y:new Spring()});this.uvs[idx*2]=u;this.uvs[idx*2+1]=v}
 for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){const a=y*(columns+1)+x,b=a+1,c=a+columns+1,d=c+1;this.indices.push(a,c,b,b,c,d)}
 this.indices=new Uint16Array(this.indices);this.update(0,0)}
 impulse(u,v,dx,dy,amount=1){for(const p of this.nodes){const falloff=Math.exp(-((p.u-u)**2+(p.v-v)**2)*26)*p.pin*amount;p.x.kick(dx*falloff);p.y.kick(dy*falloff)}}
 update(dt,time=0,intensity=1,tiltX=0,tiltY=0){for(let i=0;i<this.nodes.length;i++){const p=this.nodes[i];const targetX=(Math.sin(time*1.8+p.v)*.7+tiltX*8)*p.pin*intensity;const targetY=(Math.sin(time*2.3+p.u*2)*.9+tiltY*8)*p.pin*intensity;const xx=dt?p.x.step(dt,targetX):p.x.x;const yy=dt?p.y.step(dt,targetY):p.y.x;this.positions[2*i]=p.u*this.width+clamp(xx,-this.width*.25,this.width*.25);this.positions[2*i+1]=p.v*this.height+clamp(yy,-this.height*.25,this.height*.25)}}
}
export class PhysicsWorld {constructor(){this.meshes=new Map();this.time=0;this.intensity=1;this.tilt=[0,0]}add(id,w,h){const m=new SoftMesh(w,h);this.meshes.set(id,m);return m}update(dt){this.time+=dt;for(const m of this.meshes.values())m.update(dt,this.time,this.intensity,...this.tilt)}pulse(id,u=.5,v=.5,dx=0,dy=115){this.meshes.get(id)?.impulse(u,v,dx,dy,this.intensity)}}

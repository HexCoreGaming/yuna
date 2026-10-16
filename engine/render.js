// [006] PixiJS GPU renderer, true child sprite pivots and two independent WebGL mesh overlays.
import {LAYER_ORDER,PIVOTS,loadArtwork} from './assets.js';
import {MeshDynamics} from './physics.js';
import {clamp} from './core.js';
const SW=321,SH=883;
export class CharacterRenderer{
 constructor(host){this.app=new PIXI.Application({resizeTo:host,backgroundColor:0x080914,antialias:true,resolution:Math.min(window.devicePixelRatio||1,2),autoDensity:true});host.appendChild(this.app.view);this.root=new PIXI.Container();this.app.stage.addChild(this.root);this.layers={};this.meshes=[];this.ready=false;this.zoom=1;this.tilt=[0,0];this.motion=1;this.fit();window.addEventListener('resize',()=>this.fit())}
 async initialize(){const textures=await loadArtwork();for(const name of LAYER_ORDER){const tex=textures[name];const pivot=PIVOTS[name],sprite=new PIXI.Sprite(tex);sprite.anchor.set(pivot[0]/SW,pivot[1]/SH);sprite.position.set(pivot[0],pivot[1]);this.layers[name]=sprite;this.root.addChild(sprite)}for(const name of ['bust_l','bust_r']){const sprite=this.layers[name];let area=name==='bust_l'?{x:72,y:195,w:102,h:139}:{x:143,y:194,w:105,h:141};const dynamics=new MeshDynamics(14);const v=dynamics.vertices,uv=dynamics.uvs;dynamics.points.forEach((p,i)=>{v[i*2]=p.u*SW;v[i*2+1]=p.v*SH;uv[i*2]=(area.x+p.u*area.w)/SW;uv[i*2+1]=(area.y+p.v*area.h)/SH});const mesh=new PIXI.SimpleMesh(textures[name],v,uv,dynamics.indices,PIXI.DRAW_MODES.TRIANGLES);mesh.position.set(area.x,area.y); // positions are replaced below in update using local region dimensions
  // Sprite remains as a background for uncovered fringe; mesh applies localized dynamics.
  this.root.addChild(mesh);this.meshes.push({mesh,dynamics,area,name})}
 this.ready=true;this.fit()}
 fit(){const w=this.app.screen.width,h=this.app.screen.height;const mobile=w<720;const frac=mobile?.59:.78;let k=Math.min((w*(mobile?.9:.66))/SW,(h*frac)/SH)*this.zoom;this.root.scale.set(k);this.root.position.set(w*(mobile?.5:.60)-SW*k/2,h*(mobile?.47:.54)-SH*k/2)}
 local(clientX,clientY){const box=this.app.view.getBoundingClientRect();const x=(clientX-box.left)*this.app.screen.width/box.width,y=(clientY-box.top)*this.app.screen.height/box.height;return {x:(x-this.root.position.x)/this.root.scale.x,y:(y-this.root.position.y)/this.root.scale.y}}
 impulse(p,dx,dy){for(const m of this.meshes){const u=(p.x-m.area.x)/m.area.w,v=(p.y-m.area.y)/m.area.h;if(u>=-.2&&u<=1.2&&v>=-.2&&v<=1.2)m.dynamics.impulse(u,v,dx,dy,this.motion)}}
 update(dt,time,pose){if(!this.ready)return;const b=this.layers;
 b.head.rotation=pose.head;b.torso.rotation=pose.body;b.hip.rotation=pose.hips;
 b.arm_l_upper.rotation=pose.leftArm;b.arm_l_fore.rotation=pose.leftArm*.8;
 b.arm_r_upper.rotation=pose.rightArm;b.arm_r_fore.rotation=pose.rightArm*.8;
 b.leg_near.rotation=pose.leftLeg;b.leg_far.rotation=pose.rightLeg;
 for(const m of this.meshes){const {dynamics,mesh,area}=m;dynamics.update(dt,area.w,area.h,time,this.motion,this.tilt);for(let i=0;i<dynamics.points.length;i++){dynamics.vertices[i*2]+=area.x;dynamics.vertices[i*2+1]+=area.y}mesh.position.set(0,0);mesh.geometry.getBuffer('aVertexPosition').update()}
 }
}

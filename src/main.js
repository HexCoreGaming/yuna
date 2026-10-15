import * as THREE from 'three';
import { createYuna } from './yuna.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// YUNA Residence. All geometry is created in the browser; no purchased assets or AI model required.
const el=id=>document.getElementById(id);
const app={entered:false,locked:false,opened:null,interact:null,accent:'violet',mode:'night',bloom:true,motion:true,quality:1};
const saved=(()=>{try{return JSON.parse(localStorage.getItem('yuna-residence-prefs')||'{}')}catch{return {}}})();
Object.assign(app,Object.fromEntries(Object.entries(saved).filter(([k])=>['accent','mode','bloom','motion','quality'].includes(k))));
const save=()=>localStorage.setItem('yuna-residence-prefs',JSON.stringify({accent:app.accent,mode:app.mode,bloom:app.bloom,motion:app.motion,quality:app.quality}));
const AC={violet:0x9b70ff,cyan:0x58def7,rose:0xff69b4};
const renderer=new THREE.WebGLRenderer({canvas:el('scene'),antialias:true,powerPreference:'high-performance'});
renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,Number(app.quality)+.35));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.30;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();scene.background=new THREE.Color('#090817');scene.fog=new THREE.FogExp2(0x15132e,.0068);
const camera=new THREE.PerspectiveCamera(74,innerWidth/innerHeight,.07,3200);camera.rotation.order='YXZ';camera.position.set(0,1.73,10);
const hemi=new THREE.HemisphereLight(0x9db7ff,0x141221,2.25);scene.add(hemi);
const direct=new THREE.DirectionalLight(0xb4afff,2.5);direct.position.set(-13,35,-25);direct.castShadow=true;direct.shadow.mapSize.set(2048,2048);direct.shadow.camera.left=-65;direct.shadow.camera.right=65;direct.shadow.camera.top=65;direct.shadow.camera.bottom=-65;direct.shadow.bias=-.0005;scene.add(direct);
const ambience=new THREE.AmbientLight(0x717cad,.35);scene.add(ambience);
const bloomPass=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.43,.6,.78);
const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));composer.addPass(bloomPass);
const MAT={stone:new THREE.MeshStandardMaterial({color:0x131620,roughness:.25,metalness:.36}), floor:new THREE.MeshStandardMaterial({color:0x1d2435,roughness:.12,metalness:.42}),ceil:new THREE.MeshStandardMaterial({color:0x10121b,roughness:.37,metalness:.22}),wall:new THREE.MeshStandardMaterial({color:0x171b28,roughness:.39,metalness:.4}),panel:new THREE.MeshStandardMaterial({color:0x252b38,roughness:.3,metalness:.68}),metal:new THREE.MeshStandardMaterial({color:0x30384c,roughness:.24,metalness:.8}),black:new THREE.MeshStandardMaterial({color:0x080b13,metalness:.7,roughness:.19}),glass:new THREE.MeshPhysicalMaterial({color:0x87a2d2,transparent:true,opacity:.18,roughness:.055,metalness:.13,depthWrite:false,side:THREE.DoubleSide}),glassDark:new THREE.MeshPhysicalMaterial({color:0x131b38,transparent:true,opacity:.42,metalness:.52,roughness:.08,depthWrite:false,side:THREE.DoubleSide}),white:new THREE.MeshStandardMaterial({color:0xd8e4f5,roughness:.42,metalness:.12}),fabric:new THREE.MeshStandardMaterial({color:0x454960,roughness:.83}),fabricLight:new THREE.MeshStandardMaterial({color:0x9ca9ba,roughness:.88}),wood:new THREE.MeshStandardMaterial({color:0x29252e,roughness:.51}),water:new THREE.MeshPhysicalMaterial({color:0x285279,metalness:.4,roughness:.045,transparent:true,opacity:.87,clearcoat:1,clearcoatRoughness:.03})};
let glowMat;
let yuna=null;
const collision=[];const interactive=[];const dynamic=[];const rooms=[
 {name:'CENTRAL ATRIUM',x:0,z:10,desc:'Main arrival gallery'},
 {name:'PANORAMA LOUNGE',x:-12,z:5,desc:'Relax and enjoy the cosmos'},
 {name:'CHEF’S KITCHEN',x:11,z:6,desc:'Kitchen and dining'},
 {name:'PRIVATE BEDROOM',x:-12,z:-13,desc:'Rest and unwind'},
 {name:'BATHING SUITE',x:12,z:-12,desc:'Spa and bathing'},
 {name:'OBSERVATION DECK',x:0,z:-29,desc:'Outdoor infinity terrace'},
 {name:'STUDY / AI LAB',x:12,z:-1,desc:'Quiet workspace'}
];
const rect=(w,h,d,m,x,y,z,{cast=true,receive=true}={})=>{let a=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);a.position.set(x,y,z);a.castShadow=cast;a.receiveShadow=receive;scene.add(a);return a};
const cyl=(rt,rb,h,m,x,y,z,n=32)=>{let a=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,n),m);a.position.set(x,y,z);a.castShadow=true;a.receiveShadow=true;scene.add(a);return a};
const sphere=(r,m,x,y,z,n=24)=>{let a=new THREE.Mesh(new THREE.SphereGeometry(r,n,16),m);a.position.set(x,y,z);scene.add(a);return a};
const segment=(a,b,width,material)=>{const u=new THREE.Vector3(...a),v=new THREE.Vector3(...b);const o=rect(width,u.distanceTo(v),width,material,...u.clone().add(v).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.sub(u).normalize());return o};
const matGlow=(c=AC[app.accent],strength=3)=>new THREE.MeshBasicMaterial({color:c,toneMapped:false});
function light(x,y,z,color=AC[app.accent],intensity=4,dist=11){const p=new THREE.PointLight(color,intensity,dist,1.65);p.position.set(x,y,z);scene.add(p);return p}
function strip(x,y,z,w,d=0.055,m=matGlow()){const o=rect(w,.037,d,m,x,y,z,{cast:false});return o}
function verticalStrip(x,y,z,h,m=matGlow()){return rect(.055,h,.055,m,x,y,z,{cast:false})}
function addCollision(x,z,w,d){collision.push({x,z,w,d})}
function wall(x,z,w,d,h=5,material=MAT.wall,y=h/2){rect(w,h,d,material,x,y,z);addCollision(x,z,w,d)}
function trim(x,y,z,w,d=.05){strip(x,y,z,w,d)}
function rug(x,z,w,d,color=0x26283c){rect(w,.032,d,new THREE.MeshStandardMaterial({color,roughness:.95}),x,.14,z,{cast:false})}
function table(x,z,w=2.7,d=1.3,y=.57){rect(w,.13,d,MAT.black,x,y,z);rect(w-.3,.035,d-.3,MAT.panel,x,y+.085,z);for(let ix of [-1,1])for(let iz of [-1,1])rect(.12,y-.17,.12,MAT.metal,x+ix*(w/2-.24),(y-.17)/2+.13,z+iz*(d/2-.2))}
function chair(x,z,r=0){const g=new THREE.Group();scene.add(g);g.position.set(x,0,z);g.rotation.y=r;const base=rect(.8,.16,.85,MAT.fabric,0,.55,0);g.add(base);scene.remove(base);base.position.set(0,.55,0);const back=rect(.8,.78,.13,MAT.fabric,0,.91,.38);g.add(back);scene.remove(back);back.position.set(0,.88,.38);const foot=rect(.1,.48,.1,MAT.metal,0,.26,0);g.add(foot);scene.remove(foot);foot.position.set(0,.26,0);return g}
function plant(x,z,s=1){cyl(.48*s,.38*s,.7*s,MAT.black,x,.36*s,z,16);cyl(.4*s,.43*s,.047*s,MAT.metal,x,.73*s,z,16);const trunk=new THREE.MeshStandardMaterial({color:0x51455c,metalness:.1,roughness:.66});segment([x,.76*s,z],[x,2.48*s,z],.12*s,trunk);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;segment([x,1.76*s,z],[x+Math.cos(a)*.9*s,2.35*s,z+Math.sin(a)*.9*s],.07*s,trunk)}const leaf=new THREE.MeshStandardMaterial({color:0x675591,emissive:0x27184d,emissiveIntensity:.38,transparent:true,opacity:.95,roughness:.65});for(let i=0;i<23;i++){const a=i*2.399;const rr=.28+Math.sqrt(i/23)*1.35;const o=sphere((.25+Math.random()*.2)*s,leaf,x+Math.cos(a)*rr*s,2.3*s+Math.sin(i*9)*.38*s,z+Math.sin(a)*rr*s,8);o.scale.set(1.2,.65,1.15)}light(x,1.5*s,z,0x7952e8,1.3,5)}
function makeCanvasTexture(type){const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');ctx.fillStyle=type==='art'?'#0b1024':'#0c1325';ctx.fillRect(0,0,512,512);if(type==='art'){for(let i=0;i<33;i++){ctx.strokeStyle=`rgba(${i%2?104:51},${i%2?129:215},255,${.08+i/80})`;ctx.lineWidth=Math.random()*2+1;ctx.beginPath();ctx.arc(256,256,i*9,Math.sin(i)*2,Math.PI*1.8);ctx.stroke()}for(let i=0;i<14;i++){ctx.fillStyle='rgba(198,123,255,.16)';ctx.fillRect(90+i*13,40+i*21,280-i*19,2)}}else{ctx.strokeStyle='#6e85e844';ctx.lineWidth=1;for(let i=0;i<512;i+=24){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,512);ctx.moveTo(0,i);ctx.lineTo(512,i);ctx.stroke()}}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
function artwork(x,y,z,w=2.4,h=1.55,orientation=0){const g=new THREE.Group();scene.add(g);g.position.set(x,y,z);g.rotation.y=orientation;const frame=new THREE.Mesh(new THREE.BoxGeometry(w+.17,h+.17,.07),MAT.metal);g.add(frame);const art=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:makeCanvasTexture('art'),side:THREE.DoubleSide}));art.position.z=.049;g.add(art);return g}
function sign(txt,x,y,z,size=.24,rot=0,color='#a9b7e3'){const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=128;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,1024,128);ctx.fillStyle=color;ctx.font='600 46px Arial';ctx.textAlign='center';ctx.fillText(txt,512,78);let mesh=new THREE.Mesh(new THREE.PlaneGeometry(size*8,size),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas),transparent:true,depthWrite:false,side:THREE.DoubleSide}));mesh.position.set(x,y,z);mesh.rotation.y=rot;scene.add(mesh);return mesh}
function addInteract(name,x,y,z,fn,r=2.6){interactive.push({name,pos:new THREE.Vector3(x,y,z),fn,r})}
function hingedDoor(name,x,z,orientation=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=orientation;scene.add(g);const door=new THREE.Group();g.add(door);const slab=new THREE.Mesh(new THREE.BoxGeometry(1.75,3.6,.13),MAT.panel);slab.position.set(.875,1.8,0);slab.castShadow=true;door.add(slab);const line=new THREE.Mesh(new THREE.BoxGeometry(.038,2.7,.15),matGlow());line.position.set(1.53,1.8,0);door.add(line);const handle=new THREE.Mesh(new THREE.BoxGeometry(.08,.35,.22),MAT.white);handle.position.set(1.53,1.48,.16);door.add(handle);const obj={mesh:door,angle:0,target:0};dynamic.push(obj);addInteract(name,x+.85,1.4,z,()=>{obj.target=obj.target?0:-Math.PI*.59;toast(obj.target?'DOOR OPENED':'DOOR CLOSED')},2.5);return obj}
function couch(x,z,w=4.5,rot=0){const g=new THREE.Group();scene.add(g);g.position.set(x,0,z);g.rotation.y=rot;function addBox(w,h,d,m,x,y,z){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;g.add(o);return o}addBox(w,.38,1.4,MAT.fabric,0,.5,0);addBox(w,.95,.28,MAT.fabric,0,1.02,.61);for(let xx of [-w/2+.65,0,w/2-.65])addBox(w/3-.1,.18,1.13,MAT.fabricLight,xx,.77,-.08);addBox(.3,.6,1.5,MAT.fabric,-w/2,.62,0);addBox(.3,.6,1.5,MAT.fabric,w/2,.62,0)}
function glassWall(z,x1,x2,y1=0,y2=5){rect(x2-x1,y2-y1,.055,MAT.glass,(x1+x2)/2,(y1+y2)/2,z,{cast:false});for(let x=x1;x<=x2+.1;x+=4.4){rect(.10,y2-y1,.15,MAT.metal,x,(y1+y2)/2,z);verticalStrip(x+.1,2.5,z,4.8,matGlow(0x598ebf))}rect(x2-x1,.12,.17,MAT.metal,(x1+x2)/2,y2,z)}
function windowWallX(x,z1,z2){rect(.07,5,z2-z1,MAT.glass,x,2.5,(z1+z2)/2,{cast:false});for(let z=z1;z<z2;z+=4.5)rect(.14,5,.12,MAT.metal,x,2.5,z)}
function buildShell(){// ground slab & elevated platform
 rect(46,1,64,MAT.stone,0,-.55,-6);rect(45,.16,63,MAT.floor,0,.02,-6);rect(45,.05,63,new THREE.MeshStandardMaterial({color:0x243148,metalness:.72,roughness:.27}),0,.12,-6);
 // perimeter neon and exposed terrace
 for(const x of [-22.4,22.4]){rect(.09,.13,62,matGlow(0x6648d7),x,.13,-6,{cast:false});rect(.36,.24,63,MAT.metal,x,-.01,-6)}for(const z of [-37.4,25.4])rect(45,.10,.09,matGlow(0x6150a7),0,.13,z,{cast:false});
 // framing main complex and skylights (open middle for internal top-down illusions)
 const y=5.45;for(let z of [-21.7,22.8]){rect(45,.3,.36,MAT.metal,0,y,z);strip(44,y-.15,z,.08)}for(let x of [-22,22])rect(.33,.3,44,MAT.metal,x,y,.5);
 // ceiling slats across selected edges, open atrium sky sections
 for(let x=-21;x<22;x+=2.8){for(const zz of [19.5,-17.8])rect(.24,.18,5.0,MAT.black,x,5.3,zz)}
 // rear facade segments and sky-facing glass
 glassWall(-21.7,-22,-2.3);glassWall(-21.7,2.3,22);glassWall(22.8,-22,-2.3);glassWall(22.8,2.3,22);
 windowWallX(-22,-21.7,22.8);windowWallX(22,-21.7,22.8);
 for(let x of [-21.9,21.9])for(let z of [-21.5,-11,0,11,22.5]){rect(.6,5.6,.6,MAT.black,x,2.75,z);verticalStrip(x,3,z,.55,matGlow())}
 // division walls intentionally distinct and open
 wall(-1,-16.5,.28,9.2,5,MAT.wall);wall(-1,-5.7,.28,5,5,MAT.wall);wall(1,10.0,.22,8.5,5,MAT.wall);wall(1,-.6,.22,5.5,5,MAT.wall);
 // open pass throughs into western lounge / dining
 wall(-16,-5,11,.20,4.8,MAT.panel);wall(-3.7,-5,3,.20,4.8,MAT.panel); // west suite doorway
 wall(5.0,-6,6.7,.20,4.8,MAT.panel);wall(19,-6,5.0,.20,4.8,MAT.panel); // east suite wide threshold
 // short feature walls create passages rather than closing off the rooms
 // section wall accents
 for(let z of [-9,-3,3,9,15]){rect(.08,4,.10,matGlow(0x6040aa),-1,2.5,z);rect(.08,4,.10,matGlow(0x4f8bdc),1,2.5,z)}
 // guided paths in flooring
 for(let z=-18;z<=19;z+=3.3){rect(.18,.009,.8,matGlow(0x474875),0,.168,z,{cast:false})}
 // monument canopy
 const ring=new THREE.Mesh(new THREE.TorusGeometry(4.7,.052,6,90),matGlow(0x8f76df));ring.rotation.x=Math.PI/2;ring.position.set(0,5.13,10);scene.add(ring);light(0,4.7,10,0x6756dd,5,16);
 for(let x of [-21,21])for(let z of [-21,21]){rect(.65,5.5,.65,MAT.metal,x,2.65,z);verticalStrip(x+.33,3,z,4.5,matGlow())}
}
function atrium(){rug(0,10,10.5,12.5,0x191c2d);for(let [x,z] of [[-4,17],[4,17],[-4,4],[4,4]])plant(x,z,.72);
 // kinetic suspended sculpture
 const art=new THREE.Group();art.position.set(0,3,10);scene.add(art);const torus=(r,c,ax,ay)=>{const m=new THREE.Mesh(new THREE.TorusGeometry(r,.043,9,120),matGlow(c));m.rotation.set(ax,ay,0);art.add(m)};torus(1.62,0x7e5ce9,0,0);torus(2.2,0x3cbed5,.8,.37);torus(2.68,0x8861ec,1.4,.2);const orb=new THREE.Mesh(new THREE.IcosahedronGeometry(.83,2),new THREE.MeshStandardMaterial({color:0x3a3ca0,emissive:0x2228a5,emissiveIntensity:1.5,metalness:.75,roughness:.14,wireframe:true}));art.add(orb);dynamic.push({update:t=>{art.rotation.y=t*.11;orb.rotation.x=t*.2}});
 // entry portal hall + reception
 for(let xx of [-2.0,2.0])rect(.2,4,.23,MAT.metal,xx,2,22.42);rect(4.2,.22,.2,MAT.metal,0,4,22.42);rect(4,.03,.14,matGlow(),0,4.08,22.44);let portal=rect(3.85,3.7,.035,new THREE.MeshBasicMaterial({color:0x304585,transparent:true,opacity:.17,side:THREE.DoubleSide}),0,2.03,22.47,{cast:false});let ptex=makeCanvasTexture('grid');portal.material.map=ptex;portal.material.needsUpdate=true;addInteract('ACTIVATE PORTAL',0,1.5,20.3,()=>toast('PORTAL / DESTINATION NOT CONFIGURED'),3);
 // monumental arrival desk
 rect(5.4,1.05,1.2,MAT.black,0,.58,17.9);rect(5.4,.05,1.32,matGlow(0x6e57bb),0,1.12,17.9);sign('Y U N A   /   R E S I D E N C E',0,3.3,20.2,.28);artwork(-.0,2.2,20.1,2.3,1.25,0);
 // side display plinths
 for(let x of [-5.5,5.5]){cyl(.57,.65,1.16,MAT.black,x,.6,9.5,16);cyl(.6,.6,.035,matGlow(0x8260ce),x,1.18,9.5,16);let ico=new THREE.Mesh(new THREE.OctahedronGeometry(.7,1),matGlow(x<0?0x7f68ff:0x6bbff9));ico.position.set(x,2.04,9.5);ico.material.transparent=true;ico.material.opacity=.4;scene.add(ico);dynamic.push({update:t=>ico.rotation.y=t*.3})}
 addInteract('AMBIENT SCULPTURE',0,1.6,10,()=>{art.visible=!art.visible;toast(art.visible?'SCULPTURE ENABLED':'SCULPTURE HIDDEN')},3.3)}
function lounge(){rug(-13.6,8,12.4,15,0x202139);couch(-13.5,9.2,5,Math.PI);couch(-19.0,6.3,3.6,-Math.PI/2);table(-13.5,7.25,3.2,1.45,.43);for(let x of [-19.8,-6.5]){cyl(.27,.32,.5,MAT.metal,x,.45,14.9);sphere(.23,matGlow(0x7553af),x,.81,14.9)}artwork(-11.5,3.05,-4.7,4.3,2.65,0);plant(-18.5,16,.91);plant(-7.9,15.5,1);sign('PANORAMA  /  LOUNGE',-13,4.55,19,.28);for(let x=-20;x<-6;x+=3)strip(x,4.88,-4.85,2.2,.11,matGlow(0x514784));
 // linear fireplace
 rect(4.4,.76,.57,MAT.black,-9,.54,1);rect(3.8,.09,.1,matGlow(0x4699fe),-9,.93,1);const flame=[];for(let i=0;i<21;i++){const f=sphere(.04+Math.random()*.09,matGlow(i%2?0x5d8ef7:0xae69ff),-10.8+i*.18,1.1+Math.random()*.16,1.01,7);flame.push(f)}dynamic.push({update:t=>flame.forEach((f,i)=>{f.scale.y=1+Math.sin(t*4+i)*.7})});addInteract('FIREPLACE',-9,1,1,()=>{for(let f of flame)f.visible=!f.visible;toast(flame[0].visible?'FIREPLACE ON':'FIREPLACE OFF')},3)}
function kitchen(){rug(12.5,9.5,15,13,0x1d222f);
 // modern floor cabinetry
 rect(8,1.1,.8,MAT.black,12,.68,17.7);rect(8,.09,1,MAT.metal,12,1.24,17.7);for(let x of [9.2,11.2,13.2,15.2])rect(.025,.63,.87,matGlow(0x425eae),x,.66,17.9);
 // central island
 rect(5.6,1,2.4,MAT.black,11.7,.68,11.9);rect(6,.13,2.65,MAT.white,11.7,1.27,11.9);rect(1.25,.025,.95,MAT.metal,10.5,1.36,12);for(let i=0;i<4;i++){const b=rect(.3,.017,.5,MAT.black,9.85+i*.43,1.382,12);b.material=new THREE.MeshBasicMaterial({color:0x111118})}
 for(let x of [10,11.8,13.6]){const p=cyl(.3,.28,.35,MAT.metal,x,3.5,11.9);p.material=MAT.metal;light(x,3.16,11.9,0x8ea8ff,1,3)}
 // corrected if text editor replaces non-ASCII in MAT identifier below
 // dining with six chairs and chandelier
 rect(4.6,.16,2.1,MAT.black,12,.84,4.7);for(let x of [10.3,12,13.7])for(let z of [3.15,6.3])chair(x,z,z<5?Math.PI:0);
 const r=new THREE.Mesh(new THREE.TorusGeometry(1.3,.045,6,64),matGlow(0x8e77fe));r.rotation.x=Math.PI/2;r.position.set(12,3.5,4.7);scene.add(r);
 rect(3.1,2.4,.34,MAT.black,18,1.56,18.2);rect(2.45,1.8,.03,MAT.glassDark,18,1.65,18.45);sign('KITCHEN / DINING',12,4.5,20,.27);plant(19,7,.72);addInteract('KITCHEN LIGHTING',11.7,1.4,11.9,()=>{r.visible=!r.visible;toast('DINING LIGHT '+(r.visible?'ON':'OFF'))},3.2)}
function bedroom(){rug(-13,-13,15,13,0x202335);
 // slightly raised bed podium
 rect(7.6,.18,7.8,MAT.black,-13,.3,-13.7);strip(-13,.41,-9.79,7.3,.08,matGlow(0x855acb));
 rect(6.2,.48,6.0,MAT.fabric,-13,.7,-13.8);rect(6.4,1.65,.3,MAT.panel,-13,1.25,-16.6);rect(5.7,.13,3.7,MAT.fabricLight,-13,1,-14.1);rect(5.7,.1,2.0,new THREE.MeshStandardMaterial({color:0x3a334b,roughness:.9}),-13,1.07,-12.1);for(let x of [-14.3,-11.7])rect(2.1,.24,1.0,MAT.white,x,1.16,-15.6);
 for(let x of [-17.7,-8.3]){rect(1.25,.5,.85,MAT.black,x,.5,-16);rect(1.22,.04,.86,matGlow(0x7858b3),x,.77,-16);sphere(.19,matGlow(0x9876fe),x,1.16,-16)}
 artwork(-12,2.8,-21.3,4.8,2.2,0);couch(-19,-9.7,2.1,Math.PI/2);plant(-18,-18,.72);sign('PRIVATE SUITE',-13,4.52,-5.3,.29);addInteract('BEDROOM AMBIENCE',-13,1,-12.2,()=>toast('REST MODE / FUTURE FEATURE'),2.6)}
function office(){rug(12,-1,14.7,9.5,0x171d2e);rect(5.6,.18,2.35,MAT.black,12,.88,-1.4);rect(4.9,.08,1.9,MAT.metal,12,1.01,-1.4);chair(12,1.3,Math.PI);for(let x of [10.6,13.4]){let screen=rect(2,.99,.055,MAT.black,x,1.98,-1.95);let display=rect(1.87,.88,.057,new THREE.MeshBasicMaterial({map:makeCanvasTexture('grid')}),x,2,-1.91);screen.rotation.y=0;display.rotation.y=0}rect(4.1,2.7,.3,MAT.panel,19.2,2,-.4);for(let i=0;i<4;i++)rect(3.1,.055,.4,matGlow(0x434b91),19.2,1+i*.65,-.16);artwork(5,2.6,-.8,2.2,1.9,Math.PI/2);sign('STUDY  /  AI LAB',12,4.5,2.2,.26);addInteract('WORKSTATION',12,1.5,-1,()=>toast('AI ASSISTANT / NOT INSTALLED YET'),3)}
function bathroom(){rug(13,-14,14,13,0x252a36);rect(8,.36,4.8,MAT.black,14,.29,-13.6);rect(6.8,.18,3.5,MAT.white,14,.56,-13.6);rect(5.95,.03,2.75,MAT.water,14,.67,-13.6,{cast:false});for(let x of [10.7,17.3])rect(.12,1,.12,MAT.metal,x,.96,-13.6);rect(5.4,.87,.94,MAT.panel,9,.63,-19.4);rect(5.2,.08,1.04,MAT.white,9,1.1,-19.4);for(let x of [7.8,9.6]){cyl(.25,.23,.07,MAT.white,x,1.19,-19.4);cyl(.06,.07,.23,MAT.metal,x+.35,1.29,-19.5)}rect(5.2,2.4,.07,MAT.glassDark,9,2.9,-20);for(let x of [6.5,11.5])verticalStrip(x,3,-20,3.1,matGlow(0x8f76f4));plant(19,-19,.9);sign('THE BATHING SUITE',12,4.5,-6.3,.26);
 // shower with glass partition
 rect(.07,3.4,4.4,MAT.glass,20,1.8,-10,{cast:false});cyl(.24,.25,.07,MAT.metal,18.4,3.4,-9);rect(.07,.9,.07,MAT.metal,18.4,3,-9);addInteract('SPA LIGHTS',14,1,-13.6,()=>toast('SPA LIGHTING / CALM'),3.1)}
function deck(){rect(45,.17,15.5,MAT.floor,0,.13,-29.7);rect(42,.09,14.6,MAT.panel,0,.19,-29.7);for(let x of [-21,21]){rect(.15,1.1,14.2,MAT.glass,x,.78,-29.6,{cast:false});rect(.11,.055,14.2,matGlow(0x466fad),x,1.3,-29.6)}rect(43,1.1,.08,MAT.glass,0,.8,-36.9,{cast:false});rect(43,.05,.09,matGlow(0x6e62da),0,1.3,-36.9);
 // infinity reflecting pool / shallow edge water
 rect(25,.25,5.4,MAT.black,0,.4,-32.2);rect(24.4,.04,4.95,MAT.water,0,.565,-32.2,{cast:false});strip(25,.59,-29.54,25,.09,matGlow(0x4dbaec));
 // lounging platforms
 for(let x of [-18,-14,14,18]){rect(2.1,.26,4.0,MAT.black,x,.42,-28.2);rect(1.95,.17,2.8,MAT.fabric,x,.6,-28.3);const back=rect(1.95,.17,1.5,MAT.fabric,x,.9,-26.6);back.rotation.x=.5}
 for(let x of [-21,21])for(let z of [-34.5,-24.5])plant(x,z,.75);
 const r=new THREE.Mesh(new THREE.TorusGeometry(2.9,.08,7,88),matGlow(0x9e75f9));r.rotation.x=Math.PI/2;r.position.set(0,4.4,-28);scene.add(r);rect(.05,4.1,.05,MAT.metal,0,3.4,-28);sign('OBSERVATION  DECK',0,2.2,-24.0,.32);addInteract('TERRACE LIGHTS',0,1,-27,()=>{r.visible=!r.visible;toast('TERRACE LIGHTS '+(r.visible?'ON':'OFF'))},3.4)}
function cosmicEnvironment(){// starfield and cosmic sky, built procedurally, no external texture downloads
 const rnd=(a)=>{let t=Math.sin(a*73.753)*43758.5453;return t-Math.floor(t)};
 let stars=[];let colors=[];for(let i=0;i<7600;i++){const th=rnd(i+2)*Math.PI*2;const u=rnd(i+95)*2-1;const rr=900+rnd(i+153)*700;let y=u*rr;if(y<90)y=90+Math.abs(y)*.12;const r=Math.sqrt(Math.max(0,1-u*u))*rr;stars.push(Math.cos(th)*r,y,Math.sin(th)*r);const f=rnd(i+222);colors.push(.48+f*.42,.47+f*.38,.76+f*.23)}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(stars,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));let sp=new THREE.Points(geo,new THREE.PointsMaterial({size:3.2,vertexColors:true,transparent:true,opacity:.95,sizeAttenuation:true,depthWrite:false}));scene.add(sp);
 // distant planets / rings
 const planetMaterial=new THREE.MeshStandardMaterial({color:0x261c54,emissive:0x150c3f,emissiveIntensity:.7,roughness:1});const p=new THREE.Mesh(new THREE.SphereGeometry(160,64,64),planetMaterial);p.position.set(-560,140,-930);scene.add(p);let pm=new THREE.Mesh(new THREE.TorusGeometry(204,2.4,10,140),matGlow(0x7257c7));pm.position.copy(p.position);pm.rotation.set(.52,.3,.12);scene.add(pm);const pm2=new THREE.Mesh(new THREE.TorusGeometry(182,1,8,140),matGlow(0x335a9b));pm2.position.copy(p.position);pm2.rotation.set(.49,.3,.08);scene.add(pm2);let moon=new THREE.Mesh(new THREE.SphereGeometry(48,28,28),new THREE.MeshStandardMaterial({color:0x6875b9,roughness:1,emissive:0x151b4c,emissiveIntensity:.3}));moon.position.set(580,220,-970);scene.add(moon);
 // city obelisks behind exterior panorama
 for(let i=0;i<85;i++){let x=(rnd(i+312)-.5)*760;let z=-190-rnd(i+412)*560;if(Math.abs(x)<55&&z>-270)continue;let h=28+rnd(i+512)*155;const col=new THREE.MeshStandardMaterial({color:0x0b1022,metalness:.8,roughness:.2});const a=rect(10+rnd(i+2)*12,h,10+rnd(i+3)*12,col,x,h/2-8,z);a.castShadow=false;let tip=new THREE.Mesh(new THREE.ConeGeometry(6,h*.25,4),col);tip.position.set(x,h+h*.13-8,z);tip.rotation.y=.785;scene.add(tip);if(i%3===0){rect(.25,h*.9,.25,matGlow(i%2?0x4175e6:0x8453e0),x+4,h/2,z,{cast:false});rect(8,.15,8,matGlow(i%2?0x4363b3:0x5d4ca6),x,h*.65,z,{cast:false})}}
 // floating beams / distant architectural rings
 for(let i=0;i<5;i++){let a=new THREE.Mesh(new THREE.TorusGeometry(68+i*21,1.1,5,90),matGlow(i%2?0x294f9b:0x5b408c));a.position.set(160+i*30,150+i*27,-370-i*38);a.rotation.set(.2,.5,i*.2);scene.add(a)}
}

// V.02 architectural detailing: individual room identities, warmer task lights,
// visible architectural joinery, animated water and usable environmental controls.
function residenceDetails(){
 const metal=new THREE.MeshStandardMaterial({color:0x353c54,metalness:.86,roughness:.24});
 const lightStone=new THREE.MeshStandardMaterial({color:0x353949,metalness:.3,roughness:.36});
 const brushed=new THREE.MeshStandardMaterial({color:0x66718a,metalness:.81,roughness:.28});
 const linen=new THREE.MeshStandardMaterial({color:0x8f91aa,roughness:.92});
 // Repeatable built-in wall coffers: steel panels with a restrained illuminated seam.
 function flutedScreen(x,z,w,turn=0){
   const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=turn;scene.add(g);
   for(let i=0;i<Math.floor(w/.52);i++){
     const a=new THREE.Mesh(new THREE.BoxGeometry(.42,3.35,.11),i%2?MAT.wall:MAT.panel);
     a.position.set(-w/2+.26+i*.52,2.45,0);g.add(a);
     if(i%4===0){const edge=new THREE.Mesh(new THREE.BoxGeometry(.018,2.9,.125),matGlow(0x354f92));edge.position.set(a.position.x+.23,2.4,0);g.add(edge)}
   }
 }
 // Atrium feature: layered central light ribbons and monolithic gallery walls.
 for(let z of [4.9,14.5]){
   for(let x of [-4.9,4.9]){cyl(.19,.24,3.95,MAT.black,x,2.3,z,8);verticalStrip(x+.12,2.2,z,2.9,matGlow(0x4a63a7))}
 }
 for(let z of [7.4,12.4]){
   rect(9.7,.085,.23,MAT.metal,0,4.75,z,{cast:false});
   rect(9.1,.035,.085,matGlow(0x343e7f),0,4.66,z,{cast:false});
 }
 // Lounge's bespoke conversation island, with two floating tables and ceiling sails.
 for(let z of [4.6,10.3,15.5]){
   rect(11.6,.13,1.3,MAT.ceil,-13.5,5.05,z);
   rect(10.5,.028,.08,matGlow(0x384878),-13.5,4.97,z,{cast:false});
 }
 for(let x of [-17,-10]){
   cyl(.6,.67,.39,MAT.black,x,.38,10.2,28);
   cyl(.53,.53,.035,lightStone,x,.6,10.2,28);
 }
 flutedScreen(-6.4,11.8,6.2,Math.PI/2);
 // Kitchen: backsplash, cabinet door divisions, bar stools and cooktop lighting.
 rect(8.8,1.7,.10,lightStone,12,2.4,18.13);
 for(let x=8.3;x<=15.8;x+=1.1){rect(.027,1.6,.12,MAT.metal,x,2.42,18.21);rect(.7,.035,.11,matGlow(0x335c96),x+.38,1.64,18.22)}
 for(let x of [9.5,11.7,13.9]){
    cyl(.4,.33,.14,MAT.black,x,.79,9.9,24);
    cyl(.073,.10,.60,brushed,x,.45,9.9,16);
    cyl(.26,.28,.05,MAT.metal,x,.16,9.9,20);
 }
 for(let x of [10.0,10.65,11.3]){rect(.35,.02,.6,MAT.black,x,1.39,12.2);}
 // Bedroom: fluted headboard wall, ceiling ribbon, realistic side lighting.
 flutedScreen(-13,-20.95,13.5,0);
 for(let x of [-18.6,-7.4]){
   cyl(.14,.18,.7,MAT.metal,x,1.15,-15.6,12);
   sphere(.18,matGlow(0x9b83d2),x,1.52,-15.6);
 }
 for(let z of [-19.9,-8.5])strip(-13,4.78,z,12,.085,matGlow(0x354586));
 // Separate low-profile wardrobe in private suite.
 rect(5.8,3.5,.7,MAT.black,-18.45,2.0,-8.3);
 for(let x of [-20.0,-18.4,-16.8])rect(.027,2.85,.75,matGlow(0x303e74),x,2,-8.3);
 // Workroom: hanging screens, generous task lighting and illuminated server plinths.
 rect(7.8,.11,3.2,MAT.ceil,12,4.95,-1.6);
 for(let x of [8.5,15.5])strip(x,4.84,-1.6,2.2,.12,matGlow(0x4c75b5));
 for(let z of [-4,-2.9,-1.8]){
   rect(2.15,.65,.75,MAT.black,18.9,.63,z);
   rect(1.9,.12,.79,MAT.metal,18.9,1.0,z);
   strip(18.9,1.08,z,1.7,.06,matGlow(0x337aab));
 }
 // Bathing suite: separate freestanding steam column and warm wall niches.
 rect(3.3,4.1,.3,MAT.black,7.0,2.27,-13.6);
 for(let y of [1.12,2.14,3.16]){
   rect(2.8,.09,.5,brushed,7.0,y,-13.3);
   rect(2.7,.025,.08,matGlow(0x467eb8),7.0,y+.06,-13.3,{cast:false});
 }
 rect(1.4,3.5,1.4,MAT.glassDark,18.9,1.95,-18.5,{cast:false});
 const spaLamp=light(18.9,3.25,-18.5,0x7b92dc,1.8,5);
 addInteract('STEAM ROOM',18.8,1.2,-17.6,()=>{spaLamp.visible=!spaLamp.visible;toast('STEAM ROOM LIGHT '+(spaLamp.visible?'ON':'OFF'))},2.7);
 // Deck: illuminated perimeter, observation seating and restrained planters.
 for(let x=-19;x<=19;x+=4.75){
   cyl(.23,.3,.38,MAT.black,x,.42,-35.0,10);
   cyl(.22,.22,.04,matGlow(0x4878b8),x,.65,-35.0,10);
 }
 for(let x of [-10.5,10.5]){
    rect(3.3,.14,1.1,MAT.black,x,.35,-25.4);
    rect(3.2,.2,.92,linen,x,.51,-25.4);
    rect(3.3,.69,.16,MAT.panel,x,.92,-25.9);
 }
 // Several architectural labels, not dozens of billboard decorations.
 sign('THE NIGHT IS YOURS',-13.5,3.8,1.4,.16);
 sign('PRIVATE SANCTUARY',-13,3.95,-20.3,.18);
 sign('SKYLINE OBSERVATORY',0,3.6,-22.6,.19);
}

// browser runtime features
const keys=new Set();let yaw=0,pitch=0,step=0,clock=0,moveSpeed=5;const vec=new THREE.Vector3();
function constrain(pos,axis,previous){pos.x=Math.max(-20.95,Math.min(20.95,pos.x));pos.z=Math.max(-35.8,Math.min(21.1,pos.z));const radius=.34;for(const r of collision){if(Math.abs(pos.x-r.x)<r.w/2+radius&&Math.abs(pos.z-r.z)<r.d/2+radius){pos[axis]=previous;break}}}
function toast(t){el('toast').textContent=t;el('toast').style.opacity=1;clearTimeout(toast.timer);toast.timer=setTimeout(()=>el('toast').style.opacity=0,2200)}
function updateNearby(){let best=null,d=Infinity;for(let it of interactive){const dx=it.pos.x-camera.position.x,dz=it.pos.z-camera.position.z;const di=Math.hypot(dx,dz);if(di<it.r&&di<d){let view=new THREE.Vector3(0,0,-1).applyEuler(camera.rotation);let dot=(dx*view.x+dz*view.z)/(di||1);if(dot>-.35){best=it;d=di}}}app.interact=best;el('interaction').style.display=best&&app.locked?'flex':'none';if(best)el('interaction-name').textContent=best.name}
function setLocation(){let best=rooms[0],d=Infinity;for(let room of rooms){let ds=Math.hypot(camera.position.x-room.x,camera.position.z-room.z);if(ds<d){best=room;d=ds}}el('location').textContent=best.name}
function teleport(r){camera.position.set(r.x,1.73,r.z);yaw=0;pitch=0;camera.rotation.set(0,0,0);closePanels();toast('ARRIVED / '+r.name);setLocation();if(app.entered)lock()}
function lock(){if(document.pointerLockElement!==el('scene')&&app.entered&&!(Object.values(panels).some(p=>!p.classList.contains('hidden'))))el('scene').requestPointerLock?.()}
const panels={map:el('panel-map'),settings:el('panel-settings'),help:el('panel-help'),yuna:el('panel-yuna')};
function closePanels(){for(let p of Object.values(panels))p.classList.add('hidden');app.opened=null}
function openPanel(kind){if(!app.entered)return;if(app.opened===kind){closePanels();lock();return}closePanels();panels[kind].classList.remove('hidden');app.opened=kind;document.exitPointerLock?.()}
function applyColor(v){app.accent=v;document.documentElement.style.setProperty('--accent','#'+AC[v].toString(16).padStart(6,'0'));document.querySelectorAll('[data-color]').forEach(x=>x.classList.toggle('selected',x.dataset.color===v));save()}
function applyMode(v){app.mode=v;const vals={night:{bg:'#090817',fog:0x15132e,exp:1.3,direct:2.5,hemi:2.25},dusk:{bg:'#241a3f',fog:0x35245b,exp:1.65,direct:3,hemi:2.6},day:{bg:'#263550',fog:0x364766,exp:1.85,direct:3.9,hemi:3.1}};const o=vals[v];scene.background.set(o.bg);scene.fog.color.setHex(o.fog);renderer.toneMappingExposure=o.exp;direct.intensity=o.direct;hemi.intensity=o.hemi;el('mode-label').textContent=v==='night'?'NIGHT CYCLE':v==='dusk'?'VIOLET DUSK':'BLUE HOUR';document.querySelectorAll('[data-mode]').forEach(x=>x.classList.toggle('active',x.dataset.mode===v));save()}
function applyQuality(v){app.quality=+v;renderer.setPixelRatio(Math.min(devicePixelRatio,app.quality+.35));composer.setSize(innerWidth,innerHeight);save()}
function events(){
  // Visual-character panel. Dialogues are prewritten: no claim of active local AI.
  const yunaLines=[
   'Welcome home. I am Yuna, your visual companion prototype.',
   'Would you like to explore the observation deck? The skyline looks beautiful tonight.',
   'My holographic structure is online. My conversational intelligence is still in development.',
   'You can adjust my hair motion here. Imagine the strands drifting through water.',
   'This residence is entirely yours. We can give each room its own atmosphere.'
  ];
  let previewLine=0;
  function line(){el('yuna-dialogue').textContent='“'+yunaLines[previewLine++%yunaLines.length]+'”';}
  el('btn-yuna').onclick=()=>openPanel('yuna');
  el('btn-yuna-line').onclick=()=>{line();yuna?.setPose('greet')};
  function characterMode(v){yuna?.setDisplayMode(v);el('btn-projection').classList.toggle('active',v==='reference');el('btn-sculpt').classList.toggle('active',v==='model');el('display-explainer').textContent=v==='reference'?'2D: approved appearance projected into the room from four viewpoints. It is image-based, not a rigged mesh.':'3D: a procedural sculpted body with animated floating hair, idle movement and articulated arms. This is NOT a scan of the approved artwork.';el('yuna-status-bubble').querySelector('small').textContent=v==='reference'?'2D APPROVED ART PROJECTION':'3D PROCEDURAL PROTOTYPE';}
  el('btn-projection').onclick=()=>characterMode('reference');
  el('btn-sculpt').onclick=()=>characterMode('model');
  el('btn-yuna-wave').onclick=()=>{if(yuna?.getDisplayMode()==='reference')characterMode('model');yuna?.wave();closePanels();lock();toast('YUNA / HELLO')};
  el('btn-yuna-find').onclick=()=>{
    camera.position.set(-3.2,1.73,16.5);yaw=0;pitch=-.04;
    closePanels();lock();toast('YUNA / ATRIUM');setLocation();
  };
  el('hair-strength').oninput=e=>yuna?.setHairFlow(e.target.value);
  el('yuna-look').onchange=e=>yuna?.setFollow(e.target.checked);
  el('btn-character-reference').onclick=()=>el('character-reference-overlay').classList.remove('hidden');
  el('close-character-reference').onclick=()=>el('character-reference-overlay').classList.add('hidden');
  el('character-reference-overlay').addEventListener('click',e=>{if(e.target.id==='character-reference-overlay')e.currentTarget.classList.add('hidden')});
  el('enter').onclick=()=>{app.entered=true;el('intro').classList.add('hidden');lock();toast('WELCOME HOME')};el('scene').addEventListener('click',lock);document.addEventListener('pointerlockchange',()=>{app.locked=document.pointerLockElement===el('scene');if(!app.locked)keys.clear();document.body.classList.toggle('paused',!app.locked&&app.entered&&!app.opened)});document.addEventListener('mousemove',e=>{if(!app.locked)return;yaw-=e.movementX*.00215;pitch-=e.movementY*.00215;pitch=Math.max(-1.48,Math.min(1.48,pitch))});document.addEventListener('keydown',e=>{if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();if(e.repeat)return;keys.add(e.code);if(e.code==='KeyM'){openPanel('map');e.preventDefault()}if(e.code==='KeyY'){openPanel('yuna');e.preventDefault()}if(e.code==='KeyE'&&app.locked&&app.interact)app.interact.fn();if(e.code==='Escape'){if(!el('character-reference-overlay').classList.contains('hidden'))el('character-reference-overlay').classList.add('hidden');else if(app.opened){closePanels();lock()}}});document.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>{if(document.hidden)keys.clear()});el('btn-map').onclick=()=>openPanel('map');el('btn-settings').onclick=()=>openPanel('settings');el('btn-help').onclick=()=>openPanel('help');document.querySelectorAll('[data-close]').forEach(x=>x.onclick=()=>{closePanels();lock()});for(let r of rooms){const b=document.createElement('button');b.className='room-row';b.innerHTML='<span>'+r.name+'</span><small>→</small>';b.title=r.desc;b.onclick=()=>teleport(r);el('map-rooms').append(b)}document.querySelectorAll('[data-mode]').forEach(x=>x.onclick=()=>applyMode(x.dataset.mode));document.querySelectorAll('[data-color]').forEach(x=>x.onclick=()=>applyColor(x.dataset.color));el('quality').value=app.quality;el('quality').onchange=e=>applyQuality(e.target.value);el('bloom').checked=app.bloom;el('bloom').onchange=e=>{app.bloom=e.target.checked;save()};el('motion').checked=app.motion;el('motion').onchange=e=>{app.motion=e.target.checked;save()};el('reset').onclick=()=>{app.bloom=true;app.motion=true;el('bloom').checked=true;el('motion').checked=true;applyMode('night');applyColor('violet');applyQuality(1);el('quality').value='1';toast('DEFAULTS RESTORED')};addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight)})}
function animate(){requestAnimationFrame(animate);const dt=Math.min(.06,timeClock.getDelta());clock+=dt;const t=clock;if(yuna)yuna.update(t,dt,camera.position);for(let d of dynamic){if(d.update)d.update(t);if(d.mesh){d.angle=THREE.MathUtils.damp(d.angle,d.target,5,dt);d.mesh.rotation.y=d.angle}}if(app.locked){camera.rotation.set(pitch,yaw,0);let f=0,s=0;if(keys.has('KeyW')||keys.has('ArrowUp'))f++;if(keys.has('KeyS')||keys.has('ArrowDown'))f--;if(keys.has('KeyA')||keys.has('ArrowLeft'))s--;if(keys.has('KeyD')||keys.has('ArrowRight'))s++;const speed=(keys.has('ShiftLeft')||keys.has('ShiftRight'))?8.5:5.1;const n=Math.hypot(f,s)||1;f/=n;s/=n;const prevX=camera.position.x,prevZ=camera.position.z;camera.position.x+=(Math.sin(yaw)*f+Math.cos(yaw)*s)*speed*dt;constrain(camera.position,'x',prevX);camera.position.z+=(-Math.cos(yaw)*f+Math.sin(yaw)*s)*speed*dt;constrain(camera.position,'z',prevZ);step+=(Math.abs(f)+Math.abs(s))*dt*10;camera.position.y=1.73+(app.motion?(Math.sin(step)*.024)*(Math.abs(f)+Math.abs(s)>0?1:.12):0);updateNearby();setLocation()}else if(!app.entered){camera.rotation.y=-.06+Math.sin(t*.12)*.08;camera.rotation.x=-.015;camera.position.set(Math.sin(t*.14)*.28,1.73,10.7)}if(app.bloom)composer.render();else renderer.render(scene,camera)}
const timeClock=new THREE.Clock();
async function init(){try{const status=el('loading-status'),bar=el('load-progress');status.textContent='BUILDING ARCHITECTURE';bar.style.width='21%';cosmicEnvironment();buildShell();status.textContent='FURNISHING INTERIORS';bar.style.width='50%';atrium();lounge();kitchen();bedroom();office();bathroom();deck();residenceDetails();status.textContent='MATERIALIZING YUNA';bar.style.width='67%';yuna=createYuna(THREE,scene);addInteract('MEET YUNA',-3.15,1.5,12.9,()=>{openPanel('yuna');yuna.setPose('greet')},2.75);status.textContent='CALIBRATING LIGHTING';bar.style.width='81%';applyMode(app.mode);applyColor(app.accent);events();bar.style.width='100%';status.textContent='ENVIRONMENT READY';setTimeout(()=>document.body.classList.add('loaded'),350);animate()}catch(e){console.error(e);el('loading-status').textContent='STARTUP ERROR: '+e.message}}
init();

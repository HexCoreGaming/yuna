// YUNA // Visual Construct v0.3
// Procedural 3D character (NOT a photo-perfect scan of the 2D concept artwork).
// Runtime: Three.js 0.166. No remote AI, tracking, network calls, or external model files.
export function createYuna(THREE, scene, location = {x:-3.15,z:12.9}) {
  const root = new THREE.Group();
  root.name = 'Yuna_Visual_Construct';
  root.position.set(location.x, 0.20, location.z);
  scene.add(root);

  // Physically modeled figure; the project keeps the original approved turnaround
  // alongside it because single-sheet art is not a rigged 3D asset.
  const skin = new THREE.MeshPhysicalMaterial({
    color:0x8f94f3, emissive:0x344cab, emissiveIntensity:0.58,
    metalness:.24, roughness:.24, clearcoat:1, clearcoatRoughness:.08,
    transparent:true, opacity:.94, side:THREE.DoubleSide, depthWrite:true,
  });
  const sheen = new THREE.MeshPhysicalMaterial({color:0x859beb, emissive:0x486bcd, emissiveIntensity:.7, metalness:.35, roughness:.15, transparent:true, opacity:.96, clearcoat:1});
  const hairmat = new THREE.MeshPhysicalMaterial({color:0x4939ae, emissive:0x3d3dd0, emissiveIntensity:.88, metalness:.42, roughness:.18, clearcoat:1});
  const hairThin = new THREE.MeshBasicMaterial({color:0x70dbff, transparent:true, opacity:.76, depthWrite:false});
  const purple = new THREE.MeshBasicMaterial({color:0xb5a1ff, toneMapped:false});
  const cyan = new THREE.MeshBasicMaterial({color:0x6ee5ff, toneMapped:false});
  const navy = new THREE.MeshPhysicalMaterial({color:0x1a1652, metalness:.62, roughness:.23, transparent:true, opacity:.94, emissive:0x26285b, emissiveIntensity:.38});
  const eyeWhite = new THREE.MeshBasicMaterial({color:0xc7edff});
  const iris = new THREE.MeshBasicMaterial({color:0x63c8ff, toneMapped:false});
  const pupil = new THREE.MeshBasicMaterial({color:0x101536});
  const lip = new THREE.MeshPhysicalMaterial({color:0xb5a3ff, metalness:.28, roughness:.28, emissive:0x4a2b6a, emissiveIntensity:.2});
  const metal = new THREE.MeshStandardMaterial({color:0x1c2548,metalness:.88,roughness:.18});

  function mesh(geo,mat,parent=root,name='') {const o = new THREE.Mesh(geo,mat);o.name=name;o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
  function orb(x,y,z,sx,sy,sz,mat=skin,parent=root,name='') {
    const o=mesh(new THREE.SphereGeometry(1,32,20),mat,parent,name);
    o.position.set(x,y,z);o.scale.set(sx,sy,sz);return o;
  }
  function tube(points,r,material=skin,parent=root,segments=24) {
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
    const o=mesh(new THREE.TubeGeometry(curve,segments,r,7,false),material,parent);
    return o;
  }
  function taperTube(points,rads,mat,parent=root) {
    // Continuous organic limb tube, smoothly blended by interpolating point/radius values.
    const cr=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
    const n=42, k=12, vs=[], ns=[], uvs=[], ids=[];
    for(let i=0;i<=n;i++){
      const t=i/n,pt=cr.getPoint(t),tg=cr.getTangent(t).normalize();
      let axis=new THREE.Vector3(1,0,0);if(Math.abs(axis.dot(tg))>.91)axis.set(0,0,1);
      let a=new THREE.Vector3().crossVectors(tg,axis).normalize(),b=new THREE.Vector3().crossVectors(tg,a).normalize();
      const seg=Math.min(rads.length-2,Math.floor(t*(rads.length-1)));
      const f=t*(rads.length-1)-seg, r=THREE.MathUtils.lerp(rads[seg],rads[seg+1],f);
      for(let j=0;j<=k;j++){
        const ang=j/k*Math.PI*2,off=a.clone().multiplyScalar(Math.cos(ang)*r).addScaledVector(b,Math.sin(ang)*r);
        const q=pt.clone().add(off);vs.push(q.x,q.y,q.z);ns.push(off.x/r,off.y/r,off.z/r);uvs.push(j/k,t);
        if(i<n&&j<k){const q0=i*(k+1)+j;ids.push(q0,q0+k+1,q0+1,q0+1,q0+k+1,q0+k+2)}
      }
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(ns,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.setIndex(ids);geo.computeVertexNormals();return mesh(geo,mat,parent);
  }

  // A continuous feminine torso/pelvis, rather than stacks of primitive boxes.
  function makeTorso(){
    const rings=[
      [.87,.295,.202,-.017],[.94,.339,.222,-.012],[1.04,.340,.237,-.012],
      [1.13,.295,.215,.010],[1.22,.213,.150,.010],[1.30,.190,.139,.008],
      [1.39,.221,.160,.004],[1.49,.273,.166,-.005],[1.59,.296,.159,-.013],
      [1.65,.216,.134,-.011],[1.70,.094,.083,-.018]];
    const v=[],uv=[],ind=[];const sides=48,rows=78;
    const get=(y)=>{
      for(let i=0;i<rings.length-1;i++)if(y<=rings[i+1][0]){
        const a=rings[i],b=rings[i+1],f=(y-a[0])/(b[0]-a[0]),e=f*f*(3-2*f);
        return [THREE.MathUtils.lerp(a[1],b[1],e),THREE.MathUtils.lerp(a[2],b[2],e),THREE.MathUtils.lerp(a[3],b[3],e)];
      }return rings[rings.length-1].slice(1);
    };
    for(let i=0;i<=rows;i++){
      const y=.87+(1.70-.87)*i/rows,[wx,rz,zoffset]=get(y);
      for(let j=0;j<=sides;j++){
        const a=2*Math.PI*j/sides;
        let x=Math.sin(a)*wx,z=Math.cos(a)*rz+zoffset;
        // Small integrated anterior chest contours, and rounded posterior pelvis.
        const c1=Math.exp(-Math.pow((x-.14)/.13,2)-Math.pow((y-1.46)/.12,2));
        const c2=Math.exp(-Math.pow((x+.14)/.13,2)-Math.pow((y-1.46)/.12,2));
        if(Math.cos(a)>.1)z+=.055*(c1+c2)*Math.pow(Math.max(0,Math.cos(a)),2);
        if(Math.cos(a)<-.25)z-=.053*Math.exp(-Math.pow((y-1.04)/.13,2))*Math.abs(Math.cos(a));
        v.push(x,y,z);uv.push(j/sides,i/rows);
        if(i<rows&&j<sides){const p=i*(sides+1)+j;ind.push(p,p+1,p+sides+1,p+1,p+sides+2,p+sides+1)}
      }
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(ind);geo.computeVertexNormals();return mesh(geo,skin,root,'Yuna_Sculpted_Torso');
  }
  makeTorso();
  // Smooth doll-like lower-body panels; no anatomically explicit textures/details.
  const shortPanel=orb(0,.946,.183,.27,.13,.055,sheen);shortPanel.rotation.x=-.12;
  // Rear contours are separate volume for soft rounded silhouette, not widening the hip bones.
  for(const sign of [-1,1]) orb(sign*.148,1.028,-.178,.178,.194,.168,skin);
  // Legs with ankle taper, calf contour, and formed feet.
  for(const side of [-1,1]){
    taperTube([[side*.19,.96,0],[side*.205,.74,.018],[side*.195,.49,.014],[side*.184,.27,-.011],[side*.18,.11,-.01]], [.16,.152,.112,.091,.064],skin);
    const foot=orb(side*.18,.062,.082,.093,.056,.197,skin);foot.rotation.x=.10;
    for(let k=0;k<4;k++)orb(side*.18+(k-1.5)*.038,.055,.241+(k===0?.011:0),.018,.024,.043,sheen);
    // Energy trail down each leg.
    tube([[side*.22,.85,.145],[side*.22,.60,.125],[side*.188,.37,.105],[side*.185,.14,.083]],.005,cyan,root,32);
  }
  // Chest: integrated holographic top with exactly the same palette as the body.
  // Opaque enough to read as coverage while retaining a seamless synthetic appearance.
  for(const side of [-1,1]){
    const bust=orb(side*.136,1.466,.139,.133,.129,.14,sheen);
    bust.rotation.z=side*-.05;
    const seam=tube([[side*.045,1.484,.246],[side*.12,1.414,.287],[side*.215,1.463,.231]],.006,purple);
  }
  // Collar/neck and delicate illuminated collarbones.
  taperTube([[0,1.63,-.01],[0,1.708,0],[0,1.782,.002]],[.092,.068,.07],skin);
  for(const side of [-1,1])tube([[0,1.65,.095],[side*.12,1.643,.129],[side*.24,1.601,.095]],.005,cyan);

  // Head with tapered jaw + luminous eyes, face on +Z.
  const head=new THREE.Group();head.position.set(0,1.872,.006);root.add(head);
  const skull=orb(0,.020,0,.138,.192,.132,skin,head,'Yuna_Face');
  orb(0,-.105,.047,.101,.091,.088,skin,head); // tapered chin overlay
  for(const side of [-1,1]){
    orb(side*.134,.005,-.005,.021,.055,.031,skin,head);
    const eyeGroup=new THREE.Group();eyeGroup.position.set(side*.058,.025,.121);head.add(eyeGroup);
    orb(0,-.002,.003,.045,.025,.021,eyeWhite,eyeGroup);
    orb(0,0,.023,.024,.023,.009,iris,eyeGroup);
    orb(0,0,.033,.009,.017,.006,pupil,eyeGroup);
    orb(side*.006,.009,.038,.006,.006,.004,cyan,eyeGroup);
    const brow=tube([[side*.025,.083,.126],[side*.065,.091,.133],[side*.11,.078,.106]],.006,hairmat,head);
    // blinking scales the visible eye group via pupil/eye anchor; full layer omitted intentionally
    if(!head.userData.eyes)head.userData.eyes=[];head.userData.eyes.push(eyeGroup);
  }
  orb(0,-.034,.143,.024,.061,.029,skin,head); // small nose
  orb(0,-.098,.150,.047,.013,.016,lip,head);
  orb(0,-.111,.143,.044,.012,.014,lip,head);
  // Finely tapered brows, cheek illumination, illuminated temple seams.
  for(const side of [-1,1])tube([[side*.119,.074,.07],[side*.129,.008,.099],[side*.112,-.066,.106]],.003,cyan,head,15);

  // Arms use pivot groups, so the right hand can actually wave.
  const arms=[];
  for(const side of [-1,1]){
    const pivot=new THREE.Group();pivot.position.set(side*.296,1.613,0);root.add(pivot);
    orb(0,-.025,0,.103,.116,.105,skin,pivot);
    taperTube([[0,-.045,0],[side*.08,-.24,.012],[side*.095,-.45,.015],[side*.08,-.605,.041]], [.092,.083,.068,.050],skin,pivot);
    const hand=orb(side*.08,-.652,.047,.072,.092,.033,skin,pivot);
    for(let k=0;k<4;k++)taperTube([[side*.08+(k-1.5)*.023,-.696,.056],[side*.08+(k-1.5)*.023,-.76+Math.abs(k-1.5)*.012,.068]],[.016,.010],skin,pivot);
    taperTube([[side*.055,-.624,.078],[side*.019,-.685,.1]],[.025,.013],skin,pivot);
    tube([[side*.067,-.14,.077],[side*.11,-.33,.080],[side*.085,-.56,.089]],.004,cyan,pivot,20);
    arms.push({pivot,side});
  }

  // Sculpted flowing hairstyle: layered crown locks, small bun, long suspended tendrils.
  const hairRoot=new THREE.Group();hairRoot.position.set(0,1.92,-.055);root.add(hairRoot);
  orb(0,.125,-.015,.153,.103,.12,hairmat,hairRoot);
  // Floating bun and coiled rope geometry.
  orb(.058,.194,-.074,.095,.094,.098,hairmat,hairRoot);
  const bunSpiral=[];for(let i=0;i<=42;i++){const a=i/42*Math.PI*4;bunSpiral.push([.058+Math.cos(a)*(.08-i*.0012),.194+Math.sin(a)*(.078-i*.001),-.012]);}
  tube(bunSpiral,.010,purple,hairRoot,60);
  // Forehead fringe as individually curved thick locks.
  for(let i=0;i<10;i++){
    const x=(i-4.5)*.029;
    tube([[x,.19,.079],[x+.020,.12,.12],[x+.029,.028,.12],[x+.015,-.040,.12]],.012+i%3*.002,hairmat,hairRoot,22);
  }
  const strands=[];
  for(let i=0;i<31;i++){
    const a=i/31*Math.PI*2,random=Math.sin(i*3.87);
    const anchor=new THREE.Group();anchor.position.set(Math.sin(a)*.118,.105,Math.cos(a)*.073-.055);
    hairRoot.add(anchor);
    const len=.25+(i%7)*.095, out=Math.sin(a)*(.08+.07*Math.abs(random));
    const endY=-len;
    const points=[[0,0,0],[out*.36,-len*.24,-.055],[out,-len*.52,-.092],
      [out*.65,-len*.80,-.055],[out+.024*random,endY,-.08]];
    tube(points,.009+(i%4)*.0035,hairmat,anchor,25);
    if(i%2===0)tube(points.map(([x,y,z])=>[x+.011,y,z+.013]),.0035,hairThin,anchor,25);
    strands.push({group:anchor,i,a});
  }
  // A subtle programmable spinal lattice and tracing on the torso.
  for(const side of [-1,1]){
    tube([[side*.12,1.6,.126],[side*.14,1.34,.134],[side*.08,1.2,.144],[side*.155,1.025,.16]],.006,cyan);
    tube([[side*.07,1.63,-.13],[side*.12,1.35,-.17],[side*.145,1.10,-.22]],.004,purple);
  }
  for(let i=0;i<25;i++){
    const y=.92+i*.027, x=Math.sin(i*2.7)*.09;
    const dot=orb(x,y,.20,.006,.004,.004,i%3===0?purple:cyan);dot.material.transparent=true;
  }
  // Luminous platform anchors construct in-world without locking the character in a showcase.
  const halo = new THREE.Group();halo.position.set(0,.008,0);root.add(halo);
  for(const r of [.48,.64]){
    const ring=mesh(new THREE.TorusGeometry(r,.009,4,100),r>.5?purple:cyan,halo);ring.rotation.x=Math.PI/2;
  }
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4;
    const b=mesh(new THREE.BoxGeometry(.12,.011,.012),cyan,halo);b.position.set(Math.sin(a)*.64,0,Math.cos(a)*.64);b.rotation.y=a;
  }
  const accent=new THREE.PointLight(0x6c7fff,2.2,6);accent.position.set(0,1.8,.35);root.add(accent);
  const floater=new THREE.Group();root.add(floater);
  const motes=[];
  for(let i=0;i<40;i++){
    const a=i*2.39996,r=.22+(i%8)*.052,y=.45+(i*17%41)/41*1.56;
    const m=mesh(new THREE.SphereGeometry(.008+(i%4)*.004,5,4),i%3?cyan:purple,floater);
    m.position.set(Math.cos(a)*r,y,Math.sin(a)*r);motes.push({m,phase:i*.71});
  }
  // Accurate-to-artwork, four-angle image-based projection. This is a 2D impostor,
  // clearly distinguished in UI from the fully modeled 3D prototype.
  const threeDChildren = root.children.slice();
  const projection = new THREE.Group();projection.name='Yuna_2D_Reference_Projection';root.add(projection);
  const previewPlanes=[];
  for(let i=0;i<4;i++){
    const texture=new THREE.TextureLoader().load('./assets/yuna-view-'+i+'.webp');
    texture.colorSpace=THREE.SRGBColorSpace;
    texture.anisotropy=8;
    const aspect=[321,321,316,366][i]/883;
    const plane=new THREE.Mesh(new THREE.PlaneGeometry(2.17*aspect,2.17),new THREE.MeshBasicMaterial({map:texture,transparent:true,alphaTest:.05,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));
    plane.position.y=1.087;
    plane.visible=i===0;
    plane.renderOrder=4;
    projection.add(plane);
    previewPlanes.push(plane);
  }
  let displayMode='reference';
  function setDisplayMode(v){
    displayMode=v==='model'?'model':'reference';
    for(const ch of threeDChildren){if(ch!==halo&&ch!==floater&&ch!==accent)ch.visible=displayMode==='model';}
    projection.visible=displayMode==='reference';
    return displayMode;
  }
  setDisplayMode('reference');
  let pose='idle',waveUntil=0,lookAt=true,hairFlow=1,visibility=true,lastT=0,faceRotation=0;
  function wave(){pose='wave';waveUntil=lastT+2.8;}
  function setPose(value){pose=value;waveUntil=(value==='wave'||value==='greet')?lastT+2.8:0;}
  function setHairFlow(v){hairFlow=Number(v);}
  function setFollow(v){lookAt=Boolean(v);}
  function setVisible(v){visibility=Boolean(v);root.visible=visibility;}
  function update(t,dt,cameraPos){
    lastT=t;
    const alive=t*.56;
    if(pose!=='idle' && t>waveUntil)pose='idle';
    if(lookAt && cameraPos){
      const target=Math.atan2(cameraPos.x-root.position.x,cameraPos.z-root.position.z);
      let diff=Math.atan2(Math.sin(target-faceRotation),Math.cos(target-faceRotation));
      faceRotation+=THREE.MathUtils.clamp(diff,-dt*1.2,dt*1.2);
      root.rotation.y=faceRotation;
    }
    if(displayMode==='reference'){
      let relative=Math.atan2(cameraPos.x-root.position.x,cameraPos.z-root.position.z)-root.rotation.y;
      relative=Math.atan2(Math.sin(relative),Math.cos(relative));
      const a=Math.abs(relative);
      let view=a<Math.PI/4?0:(a>Math.PI*3/4?3:(relative<0?1:2));
      previewPlanes.forEach((p,i)=>{p.visible=i===view;p.rotation.y=relative});
      projection.position.y=Math.sin(t*.8)*.006;
    }
    // Hover remains extremely subtle so her feet visually touch the floor.
    const bob=Math.sin(alive*1.7)*.006;
    const blink=(t%6.3>5.99)?Math.max(.09,Math.abs(t%6.3-6.145)*9):1;
    for(const eye of head.userData.eyes||[])eye.scale.y=blink;
    head.rotation.z=Math.sin(alive*.77)*.017;
    head.rotation.x=Math.sin(alive*.55)*.015;
    hairRoot.position.y=1.93+bob;
    hairRoot.rotation.z=Math.sin(t*.46)*.025*hairFlow;
    hairRoot.rotation.x=Math.sin(t*.39)*.025*hairFlow;
    for(const x of strands){x.group.rotation.z=Math.sin(t*.66+x.i*.43)*(.05+.02*(x.i%4))*hairFlow;
      x.group.rotation.x=Math.cos(t*.83+x.i*.57)*(.05+.015*(x.i%3))*hairFlow;}
    for(const {pivot,side} of arms){
      pivot.rotation.z=side*(.06+Math.sin(t*.7+side)*.017);
      pivot.rotation.x=Math.sin(t*.53+side)*.022;
      if(side===1 && pose==='wave'){
        pivot.rotation.z=2.2+Math.sin(t*7.5)*.17;
        pivot.rotation.x=-.3+Math.sin(t*8)*.15;
      }
      if(pose==='greet'){pivot.rotation.x=-.36;}
    }
    halo.rotation.y=t*.055;
    for(const p of motes){p.m.position.y+=(Math.sin(t*.6+p.phase)-Math.sin((t-dt)*.6+p.phase))*.06;}
    accent.intensity=2.0+Math.sin(t*1.1)*.24;
  }
  return {root,update,wave,setPose,setHairFlow,setFollow,setVisible,setDisplayMode,getDisplayMode:()=>displayMode,getPose:()=>pose,getFollow:()=>lookAt,getHairFlow:()=>hairFlow};
}

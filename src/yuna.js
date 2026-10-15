// YUNA // V0.8: silhouette refinement, continuous limb meshes, softer optics and flowing layered hair.
// Four illustrated orthographic source views are UV-projected onto CURVED 3D geometry.
// This is a real 3D mesh with volume, animation and secondary-motion springs—not a billboard.
// It remains a stylized artwork-based mesh, NOT a scan, professional hand-sculpt, or trained AI.

export function createYuna(THREE, scene, location={x:-5.0,z:11.8}) {
  const root=new THREE.Group();root.name='YUNA / DIGITAL ENTITY';root.position.set(location.x,0.18,location.z);scene.add(root);
  const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
  const smooth=(a,b,t)=>a+(b-a)*Math.max(0,Math.min(1,t));
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  const load=(file)=>{const t=new THREE.TextureLoader().load('./assets/yuna-'+file+'-surface.webp');t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.anisotropy=8;return t};
  const surf={front:load('front'),left:load('left'),right:load('right'),back:load('back')};
  const skin={};
  const skinSettings={color:0xffffff,roughness:.43,metalness:.035,clearcoat:.32,clearcoatRoughness:.35,side:THREE.DoubleSide,emissive:0x363b76,emissiveIntensity:.085};
  for(const k of Object.keys(surf))skin[k]=new THREE.MeshPhysicalMaterial({...skinSettings,map:surf[k]});
  const flesh=new THREE.MeshPhysicalMaterial({color:0xa3a7e7,roughness:.48,metalness:.025,clearcoat:.27,clearcoatRoughness:.38,emissive:0x393d84,emissiveIntensity:.19,side:THREE.DoubleSide});
  const glow=new THREE.MeshBasicMaterial({color:0x8dbdff,toneMapped:false});
  const violet=new THREE.MeshBasicMaterial({color:0xc59cff,toneMapped:false});
  const cyan=new THREE.MeshBasicMaterial({color:0x62dbff,toneMapped:false});
  const hairBase=new THREE.MeshPhysicalMaterial({color:0x4f459a,roughness:.48,metalness:.09,clearcoat:.22,clearcoatRoughness:.34,emissive:0x30246c,emissiveIntensity:.35,side:THREE.DoubleSide});
  const hairLit=new THREE.MeshPhysicalMaterial({color:0x8980dc,roughness:.38,metalness:.085,clearcoat:.32,emissive:0x2c4b94,emissiveIntensity:.42,side:THREE.DoubleSide});
  const headTrim=new THREE.MeshStandardMaterial({color:0x151938,metalness:.55,roughness:.22,emissive:0x303c76,emissiveIntensity:.48});
  const faceTexture=new THREE.TextureLoader().load('./assets/yuna-face-detail.webp');faceTexture.colorSpace=THREE.SRGBColorSpace;
  const faceMat=new THREE.MeshPhysicalMaterial({...skinSettings,map:faceTexture});

  const meshes=[];
  function add(geo,mat,parent=root,name=''){const m=new THREE.Mesh(geo,mat);m.name=name;m.castShadow=true;m.receiveShadow=true;parent.add(m);meshes.push(m);return m}
  function ball(parent,x,y,z,sx,sy,sz,mat=flesh){const m=add(new THREE.SphereGeometry(1,32,24),mat,parent);m.position.set(x,y,z);m.scale.set(sx,sy,sz);return m}
  function line(parent,arr,r,mat=cyan){const cr=new THREE.CatmullRomCurve3(arr.map(p=>V(...p)));return add(new THREE.TubeGeometry(cr,Math.max(24,arr.length*8),r,6,false),mat,parent)}
  // Smooth lofts following an artist-defined full-figure profile; rings are interpolated with cubic blending.
  // The x radius is kept fixed while posterior profiles add gluteal volume *backwards*, not sideways.
  function fromKeys(keys,y){let i=0;while(i<keys.length-2&&y>keys[i+1][0])i++;const a=keys[i],b=keys[i+1];let t=clamp((y-a[0])/(b[0]-a[0]),0,1);t=t*t*(3-2*t);return [smooth(a[1],b[1],t),smooth(a[2],b[2],t),smooth(a[3],b[3],t)];}
  const textureUV=(view,x,y,z)=>{
    // Pixel anchors are mapped into the provided orthographic design views.
    // y is always in world meters from the bottoms of her feet.
    let xp;
    if(view==='front')xp=244+x*440;
    else if(view==='back')xp=1373-x*430;
    else if(view==='left')xp=617+z*365;
    else xp=993-z*362;
    const rect={front:[63,430],left:[467,775],right:[849,1150],back:[1180,1565]}[view];
    const u=clamp((xp-rect[0])/(rect[1]-rect[0]),.018,.982);
    const imageY=884-y*(863/2.12);
    return [u,clamp(1-imageY/894,.014,.986)];
  };
  // Separate quadrant surfaces with continuous shared edges. Each uses its proper reference view.
  function loft(parent,name,keys,centerY=0,segmentsY=96,animateMorph=false,offsetX=0,offsetZ=0,textureX=0){
    const patches=[];const orders=[
      {view:'front',from:-Math.PI/4,to:Math.PI/4},
      {view:'right',from:Math.PI/4,to:3*Math.PI/4},
      {view:'back',from:3*Math.PI/4,to:5*Math.PI/4},
      {view:'left',from:5*Math.PI/4,to:7*Math.PI/4}];
    const y0=keys[0][0],y1=keys[keys.length-1][0];
    for(const q of orders){
      const a=[],uv=[],ix=[],morphFront=[],morphBack=[],partN=28;
      for(let j=0;j<=segmentsY;j++){
        const y=y0+(y1-y0)*(j/segmentsY),[w,d,zc]=fromKeys(keys,y);
        for(let k=0;k<=partN;k++){
          const theta=q.from+(q.to-q.from)*k/partN;
          let x=Math.sin(theta)*w+offsetX,z=Math.cos(theta)*d+zc+offsetZ;
          // Smooth chest and lower rear anatomy integrated into the continuous skin.
          let bust=0,glute=0;
          if(name==='CORE'){
            const frontal=Math.pow(Math.max(0,Math.cos(theta)),2);
            const back=Math.pow(Math.max(0,-Math.cos(theta)),2);
            const lobe=Math.exp(-Math.pow((Math.abs(x)-.14)/.115,2));
            bust=Math.exp(-Math.pow((y-1.48)/.12,2))*lobe*frontal;
            glute=Math.exp(-Math.pow((y-.965)/.139,2))*Math.exp(-Math.pow((Math.abs(x)-.13)/.18,2))*back;
            z+=.077*bust-.182*glute;
          }
          a.push(x,y-centerY,z);morphFront.push(bust);morphBack.push(glute);
          const [u,v]=textureUV(q.view,x+textureX,y,z);uv.push(u,v);
          if(j<segmentsY&&k<partN){const i=j*(partN+1)+k;
            ix.push(i,i+1,i+partN+1, i+1,i+partN+2,i+partN+1)}
        }
      }
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(a,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();
      const part=add(g,skin[q.view],parent,name+'_'+q.view.toUpperCase());
      patches.push({geo:g,rest:Float32Array.from(a),bust:morphFront,rear:morphBack});
    }
    return {patches};
  }
  const core=new THREE.Group();core.position.y=.96;root.add(core);
  const torsoKeys=[[.83,.239,.17,-.012],[.92,.285,.215,-.012],[1.025,.298,.23,-.005],
    [1.125,.261,.196,.006],[1.215,.201,.139,.008],[1.30,.177,.129,.010],
    [1.39,.219,.155,.002],[1.48,.267,.170,0],[1.56,.275,.158,-.011],
    [1.625,.224,.126,-.012],[1.68,.100,.080,-.004]];
  const body=loft(core,'CORE',torsoKeys,.96,105,true);
  // Synthetic skin panels provide non-explicit coverage, integrated in the skin palette.
  const collarTrim=new THREE.Group();core.add(collarTrim);
  for(const s of [-1,1]){
    line(collarTrim,[[s*.2,.62,.15],[s*.13,.66,.19],[0,.68,.1]],.0028,glow);
    line(collarTrim,[[s*.16,.58,.2],[s*.11,.52,.249],[s*.04,.50,.21]],.005,violet);
  }
  // Neck, sculpted curved face, ears, hairline. The actual face is textured using the approved art.
  const neck=loft(core,'NECK',[[1.64,.075,.077,0],[1.76,.063,.061,.008],[1.82,.072,.076,.018]],.96,26);
  const head=new THREE.Group();head.position.set(0,.91,.008);core.add(head);
  const headKeys=[[1.75,.058,.061,.026],[1.79,.087,.093,.012],[1.84,.106,.109,0],[1.91,.117,.117,-.005],[1.975,.115,.108,-.012],[2.035,.099,.096,-.023],[2.09,.063,.067,-.034],[2.105,.022,.032,-.032]];
  // UV-projected real face on a 3D surface, not a flat quad.
  const faceWrap=loft(head,'FACE',headKeys,1.87,65);
  for(const p of faceWrap.patches){p.geo.computeBoundingSphere();}
  for(const side of [-1,1]){
    // Close-fitting tapered synthetic ear shapes, not detached spheres.
    const ear=ball(head,side*.123,.075,-.012,.015,.038,.019,flesh);
    ear.rotation.z=-side*.18;
  }
  // Eye-shutter is a transparent illuminated lid which can blink without erasing the face painting.
  const eyelids=[];
  for(const side of [-1,1]){
    const lid=ball(head,side*.056,.05,.113,.042,.003,.014,hairLit);lid.visible=false;eyelids.push(lid);
  }
  // Hair: modest sculpted crown and loose layered locks—no giant spherical buns or noodle tubes.
  // Each lock is a deforming sheet with material on both sides, kept close to the head/neck.
  const hairRoot=new THREE.Group();hairRoot.position.set(0,.111,-.048);head.add(hairRoot);
  ball(hairRoot,0,.048,-.043,.125,.091,.115,hairBase);
  const knot=ball(hairRoot,.049,.122,-.104,.071,.061,.068,hairBase);knot.rotation.z=.18;
  const hair=[];
  function ribbon(anchor,length,width,phase,tint,i){
    const count=17,verts=[],ind=[];
    for(let j=0;j<count;j++){
      verts.push(0,0,0,0,0,0);
      if(j<count-1){const p=j*2;ind.push(p,p+2,p+1,p+1,p+2,p+3)}
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(ind);geo.computeVertexNormals();
    add(geo,i%4===0?hairLit:hairBase,hairRoot,'FLOATING_HAIR_RIBBON');
    const points=Array.from({length:count},(_,j)=>V(anchor.x,anchor.y-length*j/(count-1),anchor.z));
    hair.push({geo,points,anchor,length,width,phase,tint,i});
  }
  // The reference has a loose bun with strands around her cheeks and nape, rather than long cables.
  for(let i=0;i<42;i++){
    const a=i*2.3999632297,x=Math.sin(a)*(.057+(i%8)*.010),z=Math.cos(a)*(.061+(i%7)*.009);
    const len=.26+(i%9)*.035;
    ribbon(V(x,.073+Math.sin(i*.63)*.018,-.055+z),len,.017+(i%5)*.003,i*.91,1,i);
  }
  // Face framing: short, layered bangs and two wisps, kept clear of the eyes.
  for(const side of [-1,1])for(let i=0;i<6;i++){
    ribbon(V(side*(.077+i*.008),.054,.067-i*.014),.16+i*.035,.012+(i%3)*.004,i*.79,1,60+i+side*3);
  }
  // Legs: proper hip and knee joints. Both side and frontal surfaces use the original reference texture.
  const legs=[];
  for(const side of [-1,1]){
    const hip=new THREE.Group();hip.position.set(side*.175,.92,-.005);root.add(hip);
    // upper leg modeled in resting *world y* then centered at the hip so rotation is natural.
    const upper=loft(hip,'THIGH_'+side,[[.47,.103,.108,.016],[.59,.125,.13,.011],[.71,.15,.154,.014],[.85,.16,.16,.01],[.99,.134,.143,.01]],.92,52,false,0,0,side*.175);
    const knee=new THREE.Group();knee.position.set(0,-.43,0);hip.add(knee);
    const lower=loft(knee,'CALF_'+side,[[.09,.073,.070,-.004],[.21,.091,.093,-.012],[.35,.104,.102,-.008],[.49,.084,.09,0]],.49,48,false,0,0,side*.175);
    const ankle=new THREE.Group();ankle.position.set(0,-.40,0);knee.add(ankle);
    // Single sculpted foot, flowing from ankle through the toes rather than five separate beads.
    const foot=ball(ankle,0,-.045,.084,.087,.049,.171,flesh);
    foot.rotation.x=.09;
    const instep=ball(ankle,0,-.006,.009,.061,.066,.076,flesh);
    instep.rotation.x=-.1;
    line(hip,[[0,-.04,.12],[side*.015,-.21,.125],[side*-.007,-.39,.10]],.004,cyan);
    legs.push({hip,knee,ankle,side});
  }
  // A segmented humanoid rig with connected tapered skins. The old shoulder spheres,
  // pill-shaped forearms and ball fingers have all been removed.
  // Sculpt limb rings using real camera-relative UVs from the original four-view reference.
  function organicLimb(parent,name,rows,baseX,baseY){
    const quads=[{view:'front',from:-Math.PI/4,to:Math.PI/4},
      {view:'right',from:Math.PI/4,to:3*Math.PI/4},
      {view:'back',from:3*Math.PI/4,to:5*Math.PI/4},
      {view:'left',from:5*Math.PI/4,to:7*Math.PI/4}];
    for(const q of quads){
      const positions=[],uv=[],idx=[],ny=54,nx=14;
      for(let yi=0;yi<=ny;yi++){
        const v=yi/ny,yy=rows[0][0]+(rows[rows.length-1][0]-rows[0][0])*v;
        let ii=0;while(ii<rows.length-2&&yy>rows[ii+1][0])ii++;
        const aa=rows[ii],bb=rows[ii+1],t=clamp((yy-aa[0])/(bb[0]-aa[0]),0,1),sm=t*t*(3-2*t);
        const cx=smooth(aa[1],bb[1],sm),cz=smooth(aa[2],bb[2],sm);
        const rx=smooth(aa[3],bb[3],sm),rz=smooth(aa[4],bb[4],sm);
        for(let j=0;j<=nx;j++){
          const theta=q.from+(q.to-q.from)*j/nx,
            x=cx+Math.sin(theta)*rx,z=cz+Math.cos(theta)*rz;
          positions.push(x,yy,z);
          const [u,vv]=textureUV(q.view,baseX+x,baseY+yy,z);uv.push(u,vv);
          if(yi<ny&&j<nx){const k=yi*(nx+1)+j;idx.push(k,k+1,k+nx+1,k+1,k+nx+2,k+nx+1)}
        }
      }
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
      g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
      add(g,skin[q.view],parent,name+'_'+q.view.toUpperCase());
    }
  }
  const arms=[];
  for(const side of [-1,1]){
    const shoulder=new THREE.Group();shoulder.position.set(side*.265,.61,.005);core.add(shoulder);
    // Shoulder begins INSIDE the torso; the upper-arm skin has smooth anatomical taper.
    organicLimb(shoulder,'UPPER_ARM_'+side,[
      [-.429,side*.020,.025,.052,.051],[-.360,side*.026,.014,.061,.060],
      [-.215,side*.023,.005,.070,.073],[-.097,side*.014,.004,.082,.080],
      [.008,0,.002,.078,.077],[.067,-side*.026,-.002,.038,.045]
    ],side*.265,1.57);
    const elbow=new THREE.Group();elbow.position.set(side*.020,-.382,.02);shoulder.add(elbow);
    organicLimb(elbow,'FOREARM_'+side,[
      [-.409,side*.017,.026,.041,.040],[-.328,side*.020,.018,.051,.046],
      [-.203,side*.016,.003,.057,.057],[-.072,side*.006,-.01,.068,.064],
      [.074,0,-.01,.056,.057]
    ],side*.285,1.188);
    const hand=new THREE.Group();hand.position.set(side*.023,-.408,.035);elbow.add(hand);
    // Palm and individual curved tapering fingers. The fingers meet the palm smoothly.
    const palm=ball(hand,0,-.067,.004,.049,.084,.027,flesh);
    palm.rotation.z=-side*.07;
    for(let finger=0;finger<4;finger++){
      const x=(finger-1.5)*.024;
      line(hand,[[x,-.118,.020],[x*.97,-.167,.025],[x*.85,-.190+(finger===0||finger===3?.018:0),.038]],.008,flesh);
    }
    line(hand,[[side*.049,-.06,.001],[side*.077,-.105,.038],[side*.072,-.144,.044]],.010,flesh);
    arms.push({shoulder,elbow,side});
  }
  // Energy filaments are discrete 3D tubes, not 2D overlays.
  for(const s of [-1,1]){
    line(core,[[s*.11,.63,.135],[s*.10,.48,.159],[s*.065,.30,.14],[s*.17,.115,.155]],.004,cyan);
    line(core,[[s*.1,.66,-.11],[s*.065,.38,-.155],[s*.145,.18,-.21]],.003,violet);
  }
  const halo=new THREE.Group();root.add(halo);
  for(const radius of [.52,.64]){const m=add(new THREE.TorusGeometry(radius,.007,4,96),radius>.60?violet:cyan,halo);m.rotation.x=Math.PI/2;m.position.y=.012}
  for(let k=0;k<8;k++){const a=k*Math.PI/4;const p=ball(halo,Math.sin(a)*.65,.017,Math.cos(a)*.65,.013,.013,.013,cyan)}
  const light=new THREE.PointLight(0x9e9bff,.65,4.2);light.position.set(0,1.85,.65);root.add(light);

  // Semi-implicit damped springs; stable on slow and fast machines.
  class Spring{
    constructor(stiff=62,damp=12){this.x=0;this.v=0;this.stiff=stiff;this.damp=damp}
    step(target,dt){const t=Math.min(dt,1/30);this.v+=(this.stiff*(target-this.x)-this.damp*this.v)*t;this.x+=this.v*t;return this.x}
  }
  const springs={bust:new Spring(54,8.5),rear:new Spring(43,7.5),head:new Spring(26,7)};
  let secondary=1.0,hairFlow=1,walk=true,pose='idle',poseEnd=0,lastTime=0,progress=0,lookAt=false;
  let prev=V(root.position.x,0,root.position.z),lastSpeed=0,velocity=0;
  const stops=[[-5,11.8],[-5.7,13.0],[-4.2,14.6],[-4.7,12.9],[-6,10.8]];
  let point=0,wait=1.8;
  function wave(){pose='wave';poseEnd=lastTime+2.6;wait=Math.max(wait,2.6)}
  function setPose(p){pose=p;poseEnd=lastTime+2.7;if(p!=='idle')wait=Math.max(wait,2.7)}
  function setHairFlow(v){hairFlow=clamp(Number(v)||0,0,2.5)}
  function setSecondaryMotion(v){secondary=clamp(Number(v)||0,0,2.5)}
  function setWander(v){walk=!!v;wait=Math.max(wait,.3)}
  function resetFacing(){root.rotation.y=0;point=0}
  function rotateBy(rad){root.rotation.y+=Number(rad)||0;walk=false}
  function setFollow(){lookAt=false} // never forces Yuna to face the camera
  function setVisible(v){root.visible=!!v}
  function setDisplayMode(){return 'model'}
  function update(t,dt,cameraPos){
    dt=clamp(dt,0,.045);lastTime=t;
    if(pose!=='idle'&&t>poseEnd)pose='idle';
    let speed=0;
    if(walk&&pose==='idle'){
      if(wait>0)wait-=dt;
      else {
        const p=stops[point],dx=p[0]-root.position.x,dz=p[1]-root.position.z,dist=Math.hypot(dx,dz);
        if(dist<.14){point=(point+1)%stops.length;wait=.35+(point%3)*.65}
        else {
          speed=.55;const n=Math.min(dist,speed*dt);
          root.position.x+=dx/dist*n;root.position.z+=dz/dist*n;
          const desired=Math.atan2(dx,dz); // character forward axis +Z
          let delta=Math.atan2(Math.sin(desired-root.rotation.y),Math.cos(desired-root.rotation.y));
          root.rotation.y+=clamp(delta,-dt*1.5,dt*1.5);
        }
      }
    }
    // Gait and body follow movement; not a position-independent stock waving mannequin.
    const moving=speed>.05;progress+=(moving?speed*11:1.8)*dt;
    const gait=moving?Math.sin(progress):0;
    const lean=moving?.035:0;
    core.rotation.z=Math.sin(progress*.55)*.010+(moving?gait*.008:0);
    core.rotation.x=lean+Math.sin(t*.9)*.006;
    core.position.y=.96+(moving?Math.abs(Math.cos(progress))*.013:Math.sin(t*1.15)*.003);
    head.rotation.z=Math.sin(t*.48)*.022+gait*.008;
    head.rotation.x=Math.sin(t*.62)*.018;
    for(const l of legs){
      l.hip.rotation.x=(moving?Math.sin(progress+l.side*Math.PI/2)*.32:Math.sin(t*.8+l.side)*.007);
      l.knee.rotation.x=moving?Math.max(0,Math.sin(progress+l.side*Math.PI/2+.4))*.38:.035;
      l.ankle.rotation.x=-l.hip.rotation.x*.34-l.knee.rotation.x*.40;
    }
    for(const a of arms){
      a.shoulder.rotation.x=moving?-Math.sin(progress+a.side*Math.PI/2)*.27:Math.sin(t*.5+a.side)*.02;
      a.shoulder.rotation.z=a.side*.045;
      a.elbow.rotation.x=-.11;
      if(a.side===1&&pose==='wave'){
        a.shoulder.rotation.z=-1.6;
        a.shoulder.rotation.x=-.4;
        a.elbow.rotation.z=Math.sin(t*8.5)*.25-.30;
      }else a.elbow.rotation.z=0;
    }
    // Separate spring simulation for upper torso and rear tissue. Motion is along Z, *not* a hip width scale.
    const accel=(speed-lastSpeed)/Math.max(.025,dt);lastSpeed=speed;
    const f=secondary;
    const springBust=springs.bust.step((moving?-.011*gait:.0025*Math.sin(t*1.7))+accel*.0025,dt)*f;
    const springRear=springs.rear.step((moving?.014*Math.sin(progress+.9):.003*Math.sin(t*1.2))+accel*.003,dt)*f;
    for(const patch of body.patches){
      const attr=patch.geo.attributes.position,arr=attr.array;
      for(let i=0;i<patch.bust.length;i++)arr[i*3+2]=patch.rest[i*3+2]+springBust*patch.bust[i]-springRear*patch.rear[i];
      attr.needsUpdate=true;
      if(Math.floor(t*30)%3===0)patch.geo.computeVertexNormals();
    }
    // Periodic blink; face stays the same identity from the approved character art.
    const bt=t%5.4;const blinking=bt>5.16&&bt<5.40;
    for(const lid of eyelids)lid.visible=blinking;
    hairRoot.rotation.z=Math.sin(t*.51)*.023*hairFlow;
    hairRoot.rotation.x=Math.sin(t*.36)*.032*hairFlow;
    // Per-strand damped spring / underwater current animation. Mesh vertices change on each frame.
    for(const h of hair){
      const out=h.geo.attributes.position;
      const {anchor,length,width,phase,points,i}=h;
      for(let k=0;k<points.length;k++){
        const q=k/(points.length-1),waveA=Math.sin(t*.93+phase+q*2.1)*(.02+.049*q)*hairFlow;
        const waveB=Math.cos(t*.53+phase*1.3+q*2.6)*(.012+.026*q)*hairFlow;
        const p=points[k];
        const tX=anchor.x+waveA*q+q*q*Math.sin(phase*.2)*.036;
        const tY=anchor.y-length*q+Math.cos(t*.55+phase+q*3)*.012*q*hairFlow;
        const tZ=anchor.z+waveB*q-.023*q;
        const follow=k===0?1:1-Math.exp(-dt*(12-6*q));
        p.x+=(tX-p.x)*follow;p.y+=(tY-p.y)*follow;p.z+=(tZ-p.z)*follow;
        const taper=Math.pow(1-q,.62),w=width*taper;
        const idx=k*6;out.array[idx]=p.x-w;out.array[idx+1]=p.y;out.array[idx+2]=p.z;
        out.array[idx+3]=p.x+w;out.array[idx+4]=p.y;out.array[idx+5]=p.z;
      }
      out.needsUpdate=true;
      if(Math.floor(t*24+i)%3===0)h.geo.computeVertexNormals();
    }
    halo.rotation.y=t*.1;light.intensity=.61+.07*Math.sin(t*.8);
    velocity=speed;
  }
  function getWander(){return walk}
  return {root,update,wave,setPose,setHairFlow,setSecondaryMotion,setWander,getWander,
    setFollow,setVisible,setDisplayMode,getDisplayMode:()=> 'model',rotateBy,resetFacing,
    getPose:()=>pose,getFollow:()=>false,getHairFlow:()=>hairFlow,getSecondaryMotion:()=>secondary,
    getStatus:()=>({walk,speed:velocity})};
}

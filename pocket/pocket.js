import {clamp, smoothstep, Spring, SCENES, MOODS, replyTo} from './pocket-engine.mjs';

const $ = id => document.getElementById(id);
const canvas = $('pocket-canvas');
const ctx = canvas.getContext('2d', { alpha: true });
const theater = $('theater');
const spriteNames = ['front','right','back','left'];
const images = {};
for (const name of [...spriteNames,'hair-top','hair-left','hair-right']) {
  const image = new Image(); image.src = `./pocket/assets/${name}.webp`;
  images[name] = image;
}
const spritesReady = () => spriteNames.every(name => images[name].complete && images[name].naturalWidth > 0);

const state = {
  scene:'first', mood:'calm', motion:'breathe', yaw:0, targetYaw:0,
  hair:0.75, physics:0.85, lastTime:0, time:0, motionPhase:0,
  speaking:false, speechUntil:0, voice:true, paused:false,
  turnTime:0, gestureUntil:0, gaze:{x:0,y:0}, pointer:{x:0,y:0},
  tinyWave:0, blinkTimer:3.1, blink:0, speakEnvelope:0,
  walkTravel:0, interactionCount:0, screen:{w:900,h:800,dpr:1,scale:1,baseX:0,topY:0,drawW:0,drawH:0}
};
const rig = {chest: new Spring(15,.78),rear: new Spring(12,.78),hip: new Spring(10,.78),head: new Spring(9,.85),hair: new Spring(7,.87),gesture: new Spring(10,.79)};
let activeSpeech = null, toastHandle = 0;
let lastTick = 0;

function toast(s) {
  const el = $('stage-toast');el.textContent = s; el.classList.add('visible');
  clearTimeout(toastHandle); toastHandle = setTimeout(()=>el.classList.remove('visible'),2200);
}
function sceneFor(id) {return SCENES.find(scene=>scene.id===id)||SCENES[0];}
function selectScene(id, sayLine=false) {
  const s = sceneFor(id); state.scene=s.id; state.motion=s.motion;
  theater.dataset.scene = s.id; $('stage-title').textContent = s.title;
  $('stage-subtitle').textContent = s.subtitle; $('scene-category').textContent = s.category;
  $('motion-readout').textContent = `${s.motion.toUpperCase()} · LIVE MOTION`;
  $('speech-bubble').textContent = `“${s.line}”`;
  document.querySelectorAll('.scene-card').forEach(btn=>btn.classList.toggle('active', btn.dataset.scene===id));
  document.querySelectorAll('[data-action]').forEach(btn=>btn.classList.toggle('selected', btn.dataset.action===s.motion));
  if(sayLine) speak(s.line);
  else stopSpeech();
  state.gestureUntil = state.time + (s.id==='starlight'?2:0);
}
function buildScenes(){
  $('scene-list').innerHTML = SCENES.map(s=>`<button class="scene-card ${s.id==='first'?'active':''}" data-scene="${s.id}" type="button"><span class="scene-icon">${s.icon}</span><span class="scene-copy"><strong>${s.menu}</strong><small>${s.caption}</small></span></button>`).join('');
  document.querySelectorAll('.scene-card').forEach(btn=>btn.addEventListener('click',()=>selectScene(btn.dataset.scene,true)));
}
function setMood(mood) {
  if(!MOODS.includes(mood)) return;
  state.mood=mood;
  document.querySelectorAll('[data-mood]').forEach(btn=>btn.classList.toggle('selected',btn.dataset.mood===mood));
  if(mood==='happy'){rig.head.kick(-.65);toast('YUNA / BRIGHTER EXPRESSION');}
  else if(mood==='curious'){rig.head.kick(.4);toast('YUNA / CURIOUS');}
  else if(mood==='playful'){rig.hair.kick(1.2);rig.hip.kick(.2);toast('YUNA / PLAYFUL');}
  else toast('YUNA / CALM');
}
function setMotion(mode){
  if(!['breathe','walk','dance','sway'].includes(mode)) return;
  state.motion=mode;
  state.gestureUntil = (mode==='sway') ? state.time+3.3 : 0;
  if(mode==='walk'||mode==='dance') rig.chest.kick(1.7*state.physics);
  document.querySelectorAll('[data-action]').forEach(btn=>btn.classList.toggle('selected',btn.dataset.action===mode));
  $('motion-readout').textContent = `${mode.toUpperCase()} · LIVE MOTION`;
}
function rotateBy(steps) {
  state.targetYaw += steps * Math.PI/2;
  state.turnTime=state.time;
  toast(steps>0?'TURNING RIGHT':'TURNING LEFT');
}
function nearestViewName() {return spriteNames[((Math.round(state.yaw/(Math.PI/2))%4)+4)%4];}
function updateViewLabel(){ $('view-name').textContent = `${nearestViewName().toUpperCase()} VIEW`; }
function speak(line){
  $('speech-bubble').textContent=`“${line}”`;
  state.speaking=true;
  const duration = clamp(line.length*.055,1.8,10);
  state.speechUntil=state.time+duration;
  if(!state.voice || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(line);
  utterance.rate=.94; utterance.pitch=1.17; utterance.volume=.95;
  const voices=window.speechSynthesis.getVoices();
  const voice=voices.find(v=>v.lang?.startsWith('en') && /female|zira|aria|samantha|jenny|ava|google us english/i.test(v.name)) || voices.find(v=>v.lang?.startsWith('en'));
  if(voice) utterance.voice=voice;
  utterance.onend=()=>{state.speaking=false;activeSpeech=null};
  utterance.onerror=()=>{state.speaking=false;activeSpeech=null};
  activeSpeech=utterance;
  try{ window.speechSynthesis.speak(utterance) }catch{state.speaking=false}
}
function stopSpeech(){
  if('speechSynthesis' in window)window.speechSynthesis.cancel();
  state.speaking=false;activeSpeech=null;
}

function viewImage(name) {const image=images[name];return image?.complete && image.naturalWidth > 0 ? image : null;}
function gauss(v,c,s){return Math.exp(-.5*((v-c)/s)**2)}
function drawAura(x, top, width, height, time, intensity=1) {
  ctx.save();ctx.globalCompositeOperation='screen';
  const grd=ctx.createRadialGradient(x,top+height*.53,40,x,top+height*.50, width*1.8);
  grd.addColorStop(0,`rgba(116,139,255,${.16*intensity})`);grd.addColorStop(.4,`rgba(125,74,247,${.09*intensity})`);grd.addColorStop(1,'rgba(60,50,160,0)');
  ctx.fillStyle=grd;ctx.beginPath();ctx.ellipse(x,top+height*.53,width*1.55,height*.55,0,0,Math.PI*2);ctx.fill();ctx.restore();
}
function drawBaseWarp(img, x, top, dw, dh, t, motion, sideGain=1) {
  const sw=img.naturalWidth, sh=img.naturalHeight;
  const step=6; const scaleX=dw/sw,scaleY=dh/sh;
  const head=rig.head.value, chest=rig.chest.value, hip=rig.hip.value, rear=rig.rear.value;
  const dance=motion==='dance';
  for(let srcY=0;srcY<sh;srcY+=step){
    const h=Math.min(step,sh-srcY);
    const p=srcY/sh;
    const isHead=gauss(p,.125,.115), isChest=gauss(p,.31,.075), isHip=gauss(p,.55,.10), isLower=smoothstep(.52,.96,p);
    const wave=Math.sin(t*1.12+p*4.8)*(.95+state.hair*.9)*isHead*2;
    const upperX=(head*4+wave)*isHead+(dance?Math.sin(t*1.7+p*2)*6:0) +Math.sin(t*.7)*1.4;
    const lowerX=hip*4*isHip+ (motion==='walk'?Math.sin(state.motionPhase+p*4.5)*5*isLower:0);
    const chestMotion=(isChest*chest*2.9),lowerMotion=isHip*rear*2;
    const widthFactor=1+(isChest*Math.max(-.017,Math.min(.020,chest*.018)))+(isHip*Math.max(-.008,Math.min(.012,hip*.012)));
    const yMotion=chestMotion+lowerMotion;
    const srcH=Math.min(h+1,sh-srcY);
    const targetX=x - dw/2 + (upperX+lowerX)*scaleX - dw*(widthFactor-1)/2;
    const targetY=top + srcY*scaleY+yMotion*scaleY;
    const targetW=dw*widthFactor,targetH=srcH*scaleY+.7;
    if (motion==='walk' && p>.54 && (img===images.front||img===images.back)) {
      // The two lower-body halves move by opposite amounts; their attachment smoothly
      // approaches zero at the pelvis, avoiding the visible hard-cut seam.
      const split=sw*.5;
      const stepWeight=smoothstep(.54,.93,p);
      const footSwing=Math.sin(state.motionPhase)*10*scaleX*state.physics*stepWeight;
      ctx.drawImage(img,0,srcY,split,srcH,targetX+footSwing,targetY,targetW*.5,targetH);
      ctx.drawImage(img,split,srcY,sw-split,srcH,targetX+targetW*.5-footSwing,targetY,targetW*.5,targetH);
    } else {
      ctx.drawImage(img,0,srcY,sw,srcH,targetX,targetY,targetW,targetH);
    }
  }
}
function drawHairOverlay(x,top,dw,dh,t,front){
  if(!front)return;
  const im=images.front;
  const scale=dw/im.width;
  const flow=state.hair;
  ctx.save();
  // Multiple layered strands displace gently as though moving through water.
  for(const [name,dir,i] of [['hair-left',-1,0],['hair-right',1,1],['hair-top',0,2]]){
    const sprite=viewImage(name);if(!sprite)continue;
    const sway=Math.sin(t*.7+i*2.1+rig.hair.value*.4)*(i===2?2.3:7.0)*flow;
    const drift=Math.cos(t*.43+i*1.4)*3.5*flow;
    ctx.save();ctx.translate(x+sway*scale,top+drift*scale);
    ctx.rotate((i-1)*Math.sin(t*.35+i)*.009*flow);
    ctx.drawImage(sprite,-dw/2,0,dw,dh);
    ctx.restore();
  }
  ctx.restore();
  // A few faint light threads trail the silhouette, never obscuring the face.
  ctx.save();ctx.globalCompositeOperation='screen';
  for(let j=0;j<9;j++){
    const side=j%2?-1:1;
    const phase=j*.9;
    const xx=x+side*(dw*.22+j%3*4*scale)+Math.sin(t*.64+phase)*6*scale*flow;
    const yy=top+dh*.09+(j%5)*8*scale;
    const grd=ctx.createLinearGradient(xx,yy,xx+side*16*scale,yy+115*scale);
    grd.addColorStop(0,'rgba(112,209,255,.05)');grd.addColorStop(.3,'rgba(181,149,255,.18)');grd.addColorStop(1,'rgba(132,126,252,0)');
    ctx.strokeStyle=grd;ctx.lineWidth=1*scale;ctx.beginPath();ctx.moveTo(xx,yy);
    ctx.bezierCurveTo(xx+side*12*scale,yy+27*scale,xx+side*(9+Math.sin(t+phase)*9)*scale,yy+80*scale,xx+side*16*scale,yy+115*scale);ctx.stroke();
  }
  ctx.restore();
}
function drawFaceExpressions(x,top,dw,dh,front,t){
  if(!front)return;
  const scale=dw/images.front.width;
  const mouthX=x+5*scale,mouthY=top+137*scale;
  if(state.speaking){
    const openness=clamp(state.speakEnvelope,0,1);
    ctx.save();ctx.fillStyle=`rgba(25,20,63,${.40*openness})`;
    ctx.beginPath();ctx.ellipse(mouthX,mouthY+1.5*scale,9*scale,Math.max(1,6*openness)*scale,0,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  // Eyelid lines close naturally during a blink; the painted eyes remain otherwise unchanged.
  if(state.blink>.1){
    const b=state.blink;
    ctx.save();ctx.strokeStyle=`rgba(48,32,115,${.74*b})`;ctx.lineWidth=Math.max(.8,3.0*scale*b);ctx.lineCap='round';
    const eyeY=top+99*scale;
    for(const ex of [-27,27]) {ctx.beginPath();ctx.moveTo(x+(ex-17)*scale,eyeY);ctx.quadraticCurveTo(x+ex*scale,eyeY+6*scale,x+(ex+16)*scale,eyeY);ctx.stroke();}
    ctx.restore();
  }
  if(state.mood==='happy'||state.mood==='playful'){
    ctx.save();ctx.strokeStyle='rgba(202,193,255,.28)';ctx.lineWidth=.8*scale;
    ctx.beginPath();ctx.arc(mouthX,mouthY+4*scale,8*scale,.13,Math.PI-.13);ctx.stroke();ctx.restore();
  }
}
function render(t){
  const w=state.screen.w,h=state.screen.h;
  ctx.clearRect(0,0,w,h);
  if(!spritesReady()){
    ctx.fillStyle='#d7d4ff';ctx.font='12px sans-serif';ctx.textAlign='center';ctx.fillText('LOADING YUNA…',w/2,h/2);return;
  }
  const yaw=state.yaw;
  const progress=yaw/(Math.PI/2),floorIndex=Math.floor(progress),fraction=progress-floorIndex;
  const wrap=n=>((n%4)+4)%4;
  const viewA=spriteNames[wrap(floorIndex)],viewB=spriteNames[wrap(floorIndex+1)];
  const motion=state.motion;
  const baseImg=images[viewA];
  const nativeHeight=883;
  const charHeight=clamp(Math.min(h*.83,w*.98*.001*nativeHeight),h*.57,h*.83);
  const drawH=charHeight;
  const baseW=(viewA==='back'?366:viewA==='right'?316:321);
  const turnNarrow=1-.14*Math.sin(Math.abs(yaw)%Math.PI);
  const drawW=drawH/nativeHeight*baseW*turnNarrow;
  const x=w*.50+state.pointer.x*5+Math.sin(t*.31)*1.2+(motion==='walk'?Math.sin(state.motionPhase*.17)*Math.min(w*.075,65):0);
  const footY=h*.905;
  const top=footY-drawH-(state.motion==='dance'?Math.abs(Math.sin(state.motionPhase))*(4+state.physics*4):0);
  state.screen.baseX=x;state.screen.topY=top;state.screen.drawW=drawW;state.screen.drawH=drawH;
  drawAura(x,top,drawW,drawH,t,1);
  const paint=(name,alpha, width)=>{
    if(alpha<=.003)return;
    const img=viewImage(name);if(!img)return;
    const dw=drawH/img.height*img.width*width;
    ctx.save();ctx.globalAlpha=alpha;
    drawBaseWarp(img,x,top,dw,drawH,t,motion);
    ctx.restore();
  };
  // Angular frame blending produces a view transition; it is not true volumetric 3D.
  const blend=smoothstep(0,1,fraction);
  paint(viewA,1-blend,turnNarrow);
  paint(viewB,blend,turnNarrow);
  if(viewA==='front'&&blend<.35){
    ctx.globalAlpha=1-blend*2;
    drawHairOverlay(x,top,drawW,drawH,t,true);
    drawFaceExpressions(x,top,drawW,drawH,true,t);
    ctx.globalAlpha=1;
  }
  // Traveling pixels hint at a volumetric hologram instead of a static illustration.
  ctx.save();ctx.globalCompositeOperation='screen';
  const tw=drawW*.57;
  const pulse=(Math.sin(t*.72)+1)*.5;
  ctx.globalAlpha=.08+.065*pulse;
  const gg=ctx.createLinearGradient(x-tw,0,x+tw,0);
  gg.addColorStop(0,'#123d7e00');gg.addColorStop(.5,'#89b3ff66');gg.addColorStop(1,'#123d7e00');
  ctx.fillStyle=gg;ctx.fillRect(x-tw,top,tw*2,drawH);
  ctx.restore();
}
function resize(){
  const rect=theater.getBoundingClientRect();const dpr=Math.min(window.devicePixelRatio||1,2);
  const w=Math.max(200,Math.round(rect.width)),h=Math.max(250,Math.round(rect.height));
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
  canvas.style.width=`${w}px`;canvas.style.height=`${h}px`;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  state.screen={...state.screen,w,h,dpr};
}
function animate(now){
  requestAnimationFrame(animate);
  if(!lastTick){lastTick=now;return}
  let dt=clamp((now-lastTick)/1000,0,.045);lastTick=now;
  if(document.hidden || state.paused) {render(state.time);return;}
  state.time+=dt;
  const t=state.time;
  const moving=state.motion==='walk'||state.motion==='dance';
  const mult=state.motion==='dance'?1.75:state.motion==='walk'?1.1:0;
  state.motionPhase+=dt*(moving?state.motion==='dance'?5:4.4:1.1);
  const travel=moving?Math.sin(state.motionPhase):0;
  const energy=state.physics;
  rig.chest.update((Math.sin(t*1.4)*.10+ travel*.95*mult)*energy,dt);
  rig.rear.update((Math.sin(t*1.08+.4)*.11+Math.sin(state.motionPhase+.8)*.95*mult)*energy,dt);
  rig.hip.update((Math.sin(t*.82)*.13+travel*.4*mult)*energy,dt);
  rig.head.update(Math.sin(t*.7)*.12 + (state.mood==='curious'?.25:0),dt);
  rig.hair.update(Math.sin(t*.59)*.6*state.hair+travel*.3*mult,dt);
  rig.gesture.update(state.motion==='sway'&&t<state.gestureUntil?1:0,dt);
  // Angle settles smoothly at a quarter turn per click.
  const d=state.targetYaw-state.yaw;state.yaw+=d*clamp(dt*7.5,0,1);
  if(Math.abs(d)<.001)state.yaw=state.targetYaw;
  state.blinkTimer-=dt;
  if(state.blinkTimer<0){state.blinkTimer=2.7+(t*5%2.6);state.blink=1}
  state.blink=Math.max(0,state.blink-dt*6);
  state.speakEnvelope=state.speaking?(Math.abs(Math.sin(t*11.7)*Math.cos(t*6.2))*.75+.20):0;
  if(state.speaking&&t>state.speechUntil){state.speaking=false}
  render(t);updateViewLabel();
}
function interactCanvas(ev){
  const rect=canvas.getBoundingClientRect();
  const x=ev.clientX-rect.left,y=ev.clientY-rect.top;
  const {baseX,topY,drawW,drawH}=state.screen;
  const dx=Math.abs(x-baseX), u=(x-(baseX-drawW*.5))/drawW, v=(y-topY)/drawH;
  if(dx>drawW*.6||v<0||v>1){rig.hair.kick(.8);toast('LIGHT TRAILS / ACTIVE');return}
  state.interactionCount++;
  if(v<.24){rig.hair.kick(3.4);rig.head.kick((u<.5?-1:1)*1.6);toast('HER HAIR DRIFTS IN THE DIGITAL CURRENT');}
  else if(v<.51){setMotion('sway');state.gestureUntil=state.time+2.8;rig.chest.kick(.8);toast('YUNA / HELLO');}
  else {rig.hip.kick(1.2);rig.hair.kick(.9);toast('YUNA / NOTICED YOU');}
}
function reset(){
  state.mood='calm';state.motion='breathe';state.yaw=0;state.targetYaw=0;state.physics=.85;state.hair=.75;state.paused=false;
  $('hair-flow').value=75;$('physics').value=85;$('hair-value').value='75%';$('physics-value').value='85%';
  $('pause-btn').textContent='Ⅱ PAUSE';for(const item of Object.values(rig))item.reset();
  selectScene('first');setMood('calm');toast('YUNA / RESET');
}
function wire(){
  buildScenes();
  document.querySelectorAll('[data-mood]').forEach(el=>el.addEventListener('click',()=>setMood(el.dataset.mood)));
  document.querySelectorAll('[data-action]').forEach(el=>el.addEventListener('click',()=>setMotion(el.dataset.action)));
  $('rotate-left').addEventListener('click',()=>rotateBy(-1));$('rotate-right').addEventListener('click',()=>rotateBy(1));
  $('hair-flow').addEventListener('input',ev=>{state.hair=Number(ev.target.value)/100;$('hair-value').textContent=`${ev.target.value}%`});
  $('physics').addEventListener('input',ev=>{state.physics=Number(ev.target.value)/100;$('physics-value').textContent=`${ev.target.value}%`});
  $('chat-form').addEventListener('submit',ev=>{
    ev.preventDefault();const input=$('chat-input');const message=input.value.trim();if(!message)return;
    input.value='';const reply=replyTo(message,state.mood);
    if(/dance|move/i.test(message))setMotion('dance');
    if(/walk|stroll/i.test(message))setMotion('walk');
    speak(reply);
  });
  $('speak-btn').addEventListener('click',()=>speak($('speech-bubble').textContent.replace(/^[“"]|[”"]$/g,'')));
  $('mute-btn').addEventListener('click',()=>{state.voice=!state.voice;$('mute-btn').textContent=state.voice?'VOICE ON':'VOICE OFF';if(!state.voice)stopSpeech();toast(state.voice?'VOICE ENABLED':'VOICE MUTED')});
  $('pause-btn').addEventListener('click',()=>{state.paused=!state.paused;$('pause-btn').textContent=state.paused?'▶ RESUME':'Ⅱ PAUSE'});
  $('reset-btn').addEventListener('click',reset);
  let down = null, suppressClick = false;
  canvas.addEventListener('pointerdown',ev=>{down={x:ev.clientX,y:ev.clientY,time:performance.now()}});
  canvas.addEventListener('pointerup',ev=>{
    if(!down)return;
    const diff=ev.clientX-down.x,dy=ev.clientY-down.y;
    if(Math.abs(diff)>55&&Math.abs(diff)>Math.abs(dy)*1.4){
      rotateBy(diff>0?-1:1);suppressClick=true;
      setTimeout(()=>suppressClick=false,100);
    }
    down=null;
  });
  canvas.addEventListener('pointercancel',()=>{down=null});
  canvas.addEventListener('click',ev=>{if(!suppressClick)interactCanvas(ev)});
  canvas.addEventListener('pointermove',ev=>{
    const rect=canvas.getBoundingClientRect();state.pointer.x=clamp((ev.clientX-rect.left)/rect.width*2-1,-1,1);
    state.pointer.y=clamp((ev.clientY-rect.top)/rect.height*2-1,-1,1);
  });
  document.addEventListener('keydown',ev=>{
    if(['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;
    if(ev.key==='ArrowLeft'){ev.preventDefault();rotateBy(-1)}
    if(ev.key==='ArrowRight'){ev.preventDefault();rotateBy(1)}
    if(ev.code==='Space'){ev.preventDefault();state.paused=!state.paused;$('pause-btn').textContent=state.paused?'▶ RESUME':'Ⅱ PAUSE'}
  });
  window.addEventListener('resize',resize);new ResizeObserver(resize).observe(theater);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSpeech()});
  window.addEventListener('beforeunload',stopSpeech);
  selectScene('first');resize();requestAnimationFrame(animate);
}
wire();
window.__yunaPocketDebug={state,images,sceneFor,spritesReady,selectScene,setMotion,rotateBy,render};

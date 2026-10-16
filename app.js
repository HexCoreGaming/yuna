'use strict';
// [SECTION 001] BUILD VERSION AND TWO ENTRY CHECKS (CLIENT SIDE ONLY)
const VERSION='V1.0.2';const PASSWORDS=['YUNA-MOUTH','LUNA-BUTT'];let gateStep=0;
const $=s=>document.querySelector(s);const $$=s=>Array.from(document.querySelectorAll(s));
$('#gateForm').addEventListener('submit',e=>{e.preventDefault();if($('#password').value!==PASSWORDS[gateStep]){$('#err').textContent='ACCESS PHRASE NOT RECOGNIZED';return;}if(gateStep===0){gateStep=1;$('#gateNum').textContent='ACCESS CHECKPOINT 02 / 02';$('#password').value='';$('#err').textContent='';$('#password').focus();return;}$('#gate').hidden=true;$('#app').hidden=false;resize();});
$('#lock').onclick=()=>{gateStep=0;$('#gateNum').textContent='ACCESS CHECKPOINT 01 / 02';$('#password').value='';$('#app').hidden=true;$('#gate').hidden=false;};
// [SECTION 002] PAINTED CHARACTER PARTS (ARTWORK FROM EARLIER YUNA SOURCE; NOT SVG SHAPES)
const canvas=$('#figure'),ctx=canvas.getContext('2d');const BASE_W=321,BASE_H=883;
const atlas={};const names=['leg_far','leg_near','hip','torso','bust_l','bust_r','arm_l_upper','arm_r_upper','arm_l_fore','arm_r_fore','head'];
for(const name of names){const im=new Image();im.src='assets/rig/'+name+'.webp';atlas[name]=im;}
// [SECTION 003] KINEMATIC JOINT CONFIGURATION
const parts=[
 ['leg_far',163,484,0.7],['leg_near',155,484,-0.7],['hip',160,470,0],['torso',158,405,0],
 ['bust_l',132,235,0],['bust_r',193,235,0],['arm_l_upper',91,218,1],['arm_r_upper',241,218,-1],
 ['arm_l_fore',62,335,1],['arm_r_fore',271,335,-1],['head',160,176,0]
];
// [SECTION 004] SIMULATION STATE + SPRING RESPONSE
const state={action:'idle',mood:'curious',intensity:.65,spring:.70,zoom:1,auto:false,paused:false,start:performance.now(),lean:0,desiredLean:0,tilt:0,desiredTilt:0,hit:0,blink:0,lastAuto:0};
function damp(value,target,speed,dt){return value+(target-value)*(1-Math.exp(-speed*dt));}let prev=performance.now();
function motion(name,t,a){switch(name){case 'dance':return Math.sin(t*4.4)*a;case 'wave':return Math.sin(t*4)*a;case 'stretch':return Math.sin(t*1.9)*a;case 'nod':return Math.sin(t*4.2)*a;case 'laugh':return Math.sin(t*8.8)*a;default:return Math.sin(t*1.3)*a*.28;}}
function drawLayer(im,pivotX,pivotY,angle=0,x=0,y=0,sx=1,sy=1){if(!im.complete||!im.naturalWidth)return;ctx.save();ctx.translate(pivotX+x,pivotY+y);ctx.rotate(angle);ctx.scale(sx,sy);ctx.drawImage(im,-pivotX,-pivotY,BASE_W,BASE_H);ctx.restore();}
function animate(now){requestAnimationFrame(animate);const dt=Math.min(.05,(now-prev)/1000);prev=now;if(!$('#app').hidden&&!state.paused){const t=(now-state.start)/1000,a=state.intensity;state.lean=damp(state.lean,state.desiredLean,3,dt);state.tilt=damp(state.tilt,state.desiredTilt,3,dt);state.hit=damp(state.hit,0,2+state.spring*8,dt);if(state.auto&&now-state.lastAuto>7500){state.lastAuto=now;setAction(['idle','wave','dance','stretch','nod','laugh'][Math.floor(Math.random()*6)]);}if(Math.random()<dt*.25){state.blink=now+160;}}
const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);const s=Math.min(w/BASE_W,h/BASE_H)*state.zoom*.94;ctx.save();ctx.translate(w/2,h/2);ctx.scale(s,s);ctx.translate(-BASE_W/2,-BASE_H/2);
const time=(now-state.start)/1000,amt=state.intensity,breath=Math.sin(time*2.1),bounce=motion(state.action,time,amt),dance=state.action==='dance',wave=state.action==='wave',laugh=state.action==='laugh',stretch=state.action==='stretch';
const totalLean=state.lean*.10+bounce*(dance?.046:.012),bodyY=breath*1.6+Math.abs(bounce)*(dance?5:1);ctx.save();ctx.translate(BASE_W/2,BASE_H/2);ctx.rotate(totalLean*.45);ctx.translate(-BASE_W/2,-BASE_H/2);
for(const [name,px,py,dir] of parts){let ang=0,x=0,y=0,sx=1,sy=1;switch(name){case 'leg_far':case 'leg_near':ang=dance?dir*bounce*.10:dir*Math.sin(time*1.1)*.008;break;case 'torso':ang=totalLean*.37;y=bodyY;sy=1+breath*.002;break;case 'hip':ang=totalLean*.17;y=bodyY+Math.sin(time*3.6)*amt*.6;break;case 'bust_l':case 'bust_r':ang=Math.sin(time*2.1+((name==='bust_l')?0:.4))*amt*.013+state.hit*.045*(name==='bust_l'?1:-1);y=breath*1.8+bodyY+Math.sin(time*4.6+px)*amt*.7;break;case 'head':ang=state.tilt*.10+((state.action==='nod')?bounce*.08:bounce*.017);y=bodyY*.6+Math.sin(time*2.1)*.6;break;case 'arm_l_upper':case 'arm_r_upper':ang=dir*(wave?.12+bounce*.28:stretch?.3+bounce*.15:Math.sin(time*1.3)*.018);break;case 'arm_l_fore':case 'arm_r_fore':ang=dir*(wave?.35+bounce*.35:stretch?.1:Math.sin(time*1.4)*.023);break;default:break;}drawLayer(atlas[name],px,py,ang,x,y,sx,sy);}
// Painted character highlights and facial response are derived from existing head art; no vector mannequin.
if(now<state.blink){ctx.save();ctx.globalAlpha=.3;ctx.fillStyle='#d5b2ff';ctx.fillRect(115,107,90,2);ctx.restore();}ctx.restore();ctx.restore();}
requestAnimationFrame(animate);
// [SECTION 005] RESOLUTION / POINTER INTERACTION
function resize(){const r=canvas.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);canvas.width=Math.max(320,Math.round(r.width*dpr));canvas.height=Math.max(400,Math.round(r.height*dpr));}addEventListener('resize',resize);
let grabbing=false,x0=0,y0=0;canvas.addEventListener('pointerdown',e=>{grabbing=true;x0=e.clientX;y0=e.clientY;canvas.setPointerCapture(e.pointerId);state.hit=Math.min(1,state.hit+.5);});canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();if(grabbing){state.desiredLean=Math.max(-1,Math.min(1,(e.clientX-x0)/r.width*5));state.desiredTilt=Math.max(-1,Math.min(1,(e.clientY-y0)/r.height*6));state.hit=Math.min(1,Math.abs(e.movementX)*.035+state.hit*.8);}else{state.desiredTilt=Math.max(-.3,Math.min(.3,(e.clientX-r.left)/r.width-.5));}});canvas.addEventListener('pointerup',()=>{grabbing=false;state.desiredLean=0;state.desiredTilt=0;});canvas.addEventListener('wheel',e=>{e.preventDefault();state.zoom=Math.min(1.5,Math.max(.6,state.zoom-e.deltaY*.0006));$('#zoom').value=Math.round(state.zoom*100);$('#zoomVal').textContent=Math.round(state.zoom*100)+'%';},{passive:false});
// [SECTION 006] MANUAL ACTIONS / FACIAL MOODS
const lines={curious:'“What are we experimenting with today?”',happy:'“Okay, that one was actually pretty good!”',shy:'“Are you seriously watching me that closely?”',annoyed:'“You better make this update worth it.”'};
function setAction(action){state.action=action;state.start=performance.now();$$('[data-action]').forEach(b=>b.classList.toggle('active',b.dataset.action===action));$('#moodText').textContent='YUNA / '+state.mood.toUpperCase();}
$$('[data-action]').forEach(b=>b.onclick=()=>setAction(b.dataset.action));$$('[data-mood]').forEach(b=>b.onclick=()=>{state.mood=b.dataset.mood;$('#moodText').textContent='YUNA / '+state.mood.toUpperCase();$('#speech').textContent=lines[state.mood];$$('[data-mood]').forEach(x=>x.classList.toggle('active',x===b));});
// [SECTION 007] SLIDERS / PLAYBACK
for(const key of ['intensity','spring','zoom']){$('#'+key).addEventListener('input',e=>{const n=+e.target.value;state[key]=key==='zoom'?n/100:n/100;$('#'+key+'Val').textContent=n+'%';});}$('#auto').onclick=()=>{state.auto=!state.auto;state.lastAuto=performance.now();$('#auto').textContent=state.auto?'AUTO / ON':'AUTO / OFF';$('#auto').classList.toggle('active',state.auto);};$('#pause').onclick=()=>{state.paused=!state.paused;$('#pause').textContent=state.paused?'RESUME':'PAUSE';};$('#reset').onclick=()=>{state.auto=false;state.paused=false;state.desiredLean=state.desiredTilt=state.lean=state.tilt=state.hit=0;state.zoom=1;$('#zoom').value=100;$('#zoomVal').textContent='100%';$('#auto').textContent='AUTO / OFF';$('#pause').textContent='PAUSE';setAction('idle');};

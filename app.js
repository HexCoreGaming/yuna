'use strict';
// ================================================================
// [SECTION 001] ENTRY FLOW — demonstration gates, NOT server security
// ================================================================
const PASSWORD_1='YUNA-MOUTH';
const PASSWORD_2='LUNA-BUTT';
let gateStep=1;
const el=id=>document.getElementById(id);
el('gateForm').addEventListener('submit',event=>{event.preventDefault();const entered=el('gateInput').value;const expected=gateStep===1?PASSWORD_1:PASSWORD_2;if(entered!==expected){el('gateError').textContent='Incorrect phrase. Try again.';return;}el('gateError').textContent='';el('gateInput').value='';if(gateStep===1){gateStep=2;el('gateTitle').innerHTML='ACCESS GATE <i>02</i>';el('gateSub').textContent='Second phrase required.';}else{el('gate').classList.add('hidden');el('app').classList.remove('hidden');}});
// ================================================================
// [SECTION 002] STATE — animation and visual behavior
// ================================================================
const state={action:'idle',mood:'curious',auto:true,tracking:true,motion:.65,speed:1,zoom:1,pointerX:0,pointerY:0,turn:0,dragging:false,time:0,blinkUntil:0,lastBlink:0,lastChange:0,burst:0};
const actions=['idle','wave','dance','stretch','giggle','nod'];
const moods=['curious','happy','shy','annoyed'];
const lines={idle:'“Let’s see what this version can actually do.”',wave:'“Hey. You actually got me moving!”',dance:'“Careful. My animation system has opinions.”',stretch:'“A proper stretch. Finally.”',giggle:'“Heh. That was ridiculous.”',nod:'“Yep. That works.”'};
const groups={rig:el('rig'),head:el('head'),torso:el('torso'),left:el('armLeft'),right:el('armRight'),legLeft:el('legLeft'),legRight:el('legRight'),hair:el('hairBack'),front:el('hairFront'),mouth:el('mouth'),open:el('eyesOpen'),closed:el('eyesClosed')};
// ================================================================
// [SECTION 003] ANIMATION CONTROLLER — independently articulated SVG
// ================================================================
const deg=(x)=>x.toFixed(2);
function setTransform(node,tx,ty,angle=0,sx=1,sy=1){node.setAttribute('transform',`translate(${deg(tx)} ${deg(ty)}) rotate(${deg(angle)}) scale(${deg(sx)} ${deg(sy)})`);}
function setAction(action){state.action=action;state.burst=performance.now()/1000;el('stateDisplay').textContent=action.toUpperCase();el('speech').textContent=lines[action];document.querySelectorAll('[data-action]').forEach(btn=>btn.classList.toggle('active',btn.dataset.action===action));}
function setMood(mood){state.mood=mood;el('moodDisplay').textContent=mood.toUpperCase();document.querySelectorAll('[data-mood]').forEach(btn=>btn.classList.toggle('active',btn.dataset.mood===mood));}
document.querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click',()=>setAction(btn.dataset.action)));
document.querySelectorAll('[data-mood]').forEach(btn=>btn.addEventListener('click',()=>setMood(btn.dataset.mood)));
function animate(now){const t=now*.001*state.speed;const m=state.motion;const a=state.action;const phase=(now*.001-state.burst)*state.speed;const dance=a==='dance'?1:0;const wave=a==='wave'?1:0;const stretch=a==='stretch'?1:0;const giggle=a==='giggle'?1:0;const nod=a==='nod'?1:0;
 const idle=Math.sin(t*1.7)*m;const bob=Math.sin(t*(dance?9:2.1))*m*(dance?10:2.2);const sway=Math.sin(t*(dance?5:1.4))*m*(dance?10:2.5);const px=state.tracking?state.pointerX:0;const py=state.tracking?state.pointerY:0;
 setTransform(groups.rig,sway*.6,bob,Math.sin(t*1.3)*m*.8+state.turn);
 setTransform(groups.torso,0,Math.sin(t*2.3)*m*-1.2,dance?Math.sin(t*5)*m*4:Math.sin(t)*m*.7,1+Math.sin(t*2.3)*m*.004,1+Math.sin(t*2.3)*m*.006);
 const leftAngle=dance?Math.sin(t*6)*34:wave?(-75+Math.sin(t*9)*20):stretch?-125: giggle?(-21+Math.sin(t*11)*8):Math.sin(t*1.7)*3;
 const rightAngle=dance?Math.sin(t*6+Math.PI)*34:stretch?125: giggle?(21+Math.sin(t*11+1)*8):Math.sin(t*1.7+1)*3;
 setTransform(groups.left,242,402,leftAngle);setTransform(groups.right,381,402,rightAngle);
 setTransform(groups.legLeft,270,618,dance?Math.sin(t*6)*7:Math.sin(t*.8)*1.5);setTransform(groups.legRight,354,618,dance?-Math.sin(t*6)*7:-Math.sin(t*.8)*1.5);
 setTransform(groups.head,px*5*m,-3+py*2*m+Math.sin(t*1.3)*.9*m,px*4*m+(nod?Math.sin(t*8)*7: giggle?Math.sin(t*11)*4:Math.sin(t*.8)*m*1.8));
 setTransform(groups.hair,0,0,-sway*.2+Math.sin(t*2.1)*m*1.2); // independent hair motion
 const isClosed=(now-state.lastBlink<135)||(now<state.blinkUntil);groups.open.setAttribute('opacity',isClosed?'0':'1');groups.closed.setAttribute('opacity',isClosed?'1':'0');
 groups.mouth.setAttribute('transform',`translate(0 292) scale(1 ${a==='giggle'?1.6+Math.abs(Math.sin(t*10))*.9: state.mood==='annoyed'?.65:state.mood==='happy'?1.15:1}) translate(0 -292)`);
 if(now-state.lastBlink>3300+Math.sin(now*.0004)*850)state.lastBlink=now;
 if(state.auto && now-state.lastChange>5200){state.lastChange=now;setAction(actions[Math.floor(Math.random()*actions.length)]);if(Math.random()>.63)setMood(moods[Math.floor(Math.random()*moods.length)]);}
 requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
// ================================================================
// [SECTION 004] POINTER INTERACTION — viewer framing and reactions
// ================================================================
const stage=el('stage'),wrap=el('charwrap');let pointerDown=null;
function setZoom(value){state.zoom=Math.min(1.45,Math.max(.65,Number(value)));el('zoom').value=Math.round(state.zoom*100);el('zoomOut').value=`${Math.round(state.zoom*100)}%`;wrap.style.scale=state.zoom;}
stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect();state.pointerX=Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1));state.pointerY=Math.max(-1,Math.min(1,(e.clientY-r.top)/r.height*2-1));if(pointerDown){state.turn=Math.max(-11,Math.min(11,(e.clientX-pointerDown.x)*.06));}});
wrap.addEventListener('pointerdown',e=>{pointerDown={x:e.clientX};wrap.setPointerCapture(e.pointerId);state.auto=false;el('auto').checked=false;setMood('curious');});
wrap.addEventListener('pointerup',()=>{if(pointerDown){setAction('giggle');pointerDown=null;setTimeout(()=>{state.turn=0},700);}});
wrap.addEventListener('pointercancel',()=>{pointerDown=null;state.turn=0});stage.addEventListener('wheel',e=>{e.preventDefault();setZoom(state.zoom-(e.deltaY>0?.05:-.05))},{passive:false});
// ================================================================
// [SECTION 005] UI SETTINGS — editable without opening code
// ================================================================
for(const [id,key,label,scale] of [['motion','motion','motionOut',100],['speed','speed','speedOut',100]]){el(id).addEventListener('input',()=>{state[key]=Number(el(id).value)/scale;el(label).value=`${el(id).value}%`;});}
el('zoom').addEventListener('input',()=>setZoom(Number(el('zoom').value)/100));el('auto').addEventListener('change',e=>{state.auto=e.target.checked;state.lastChange=performance.now();});el('tracking').addEventListener('change',e=>state.tracking=e.target.checked);
el('random').addEventListener('click',()=>{setAction(actions[Math.floor(Math.random()*actions.length)]);setMood(moods[Math.floor(Math.random()*moods.length)]);});
el('menuButton').addEventListener('click',()=>{el('panel').classList.toggle('open');});

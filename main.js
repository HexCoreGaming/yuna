// [012] Integration root. Character is intentionally not loaded in engine-only milestone.
import {FixedClock,EventBus} from './engine/core.js';
import {PhysicsWorld} from './engine/physics.js';
import {createStandardRig} from './engine/rig.js';
import {AnimationEngine,installTestClips} from './engine/animation.js';
import {AssetEngine} from './engine/assets.js';
import {BehaviorEngine} from './engine/behavior.js';
import {SceneEngine} from './engine/scenes.js';
import {SettingsEngine} from './engine/storage.js';
import {InteractionEngine} from './engine/interaction.js';
import {RendererEngine} from './engine/render.js';
import {checkEngines} from './engine/diagnostics.js';
const $=x=>document.getElementById(x), log=(s)=>{const time=new Date().toLocaleTimeString();$('log').textContent=`[${time}] ${s}\n`+$('log').textContent.slice(0,2500)};
const clock=new FixedClock(),bus=new EventBus(),physics=new PhysicsWorld(),rig=createStandardRig(),animation=new AnimationEngine(rig),assets=new AssetEngine(),behavior=new BehaviorEngine(),scenes=new SceneEngine(),storage=new SettingsEngine(),interaction=new InteractionEngine($('inputArea')),renderer=new RendererEngine(document.createElement('div'));
installTestClips(animation);const spring=physics.add('probe',120,120);let paused=false;let last=performance.now(),runs=0;
const checks=checkEngines();function report(){const flags=[...checks,{name:'PixiJS runtime available',ok:!!globalThis.PIXI},{name:'Character model ready',ok:false,error:'Not yet authored — intentionally excluded'},{name:'Artwork manifest ready',ok:false,error:'No production rig supplied'}];$('metrics').innerHTML=flags.map(x=>`<div class="metric"><span class="small">${x.name}</span><strong class="${x.ok?'ok':'fail'}">${x.ok?'PASS':'NOT READY'}</strong><span class="small">${x.error||'Module initialized'}</span></div>`).join('');return flags.filter(x=>x.ok).length+' / '+flags.length}
$('diagnose').onclick=()=>log('Diagnostics: '+report()+' checks passing');$('diagnose').click();
$('pause').onclick=()=>{paused=!paused;$('pause').textContent=paused?'RESUME SIMULATION':'PAUSE SIMULATION'};
$('impulse').onclick=()=>{physics.pulse('probe',.5,.5,0,130);log('Physics impulse applied')};
$('auto').onclick=()=>{behavior.enabled=!behavior.enabled;$('auto').textContent=behavior.enabled?'AUTONOMY ON':'AUTONOMY OFF'};
$('tilt').onclick=async()=>{try{await interaction.enableTilt();log('Tilt input enabled')}catch(e){log(String(e.message))}};
$('intensity').oninput=e=>{physics.intensity=Number(e.target.value)/100};
interaction.callback=(event,data)=>{if(event==='poke'||event==='drag'){const rect=$('inputArea').getBoundingClientRect();physics.pulse('probe',(data.x-rect.left)/rect.width,(data.y-rect.top)/rect.height,data.dx*2,data.dy*2)}};
function tick(t){const delta=Math.min(.04,(t-last)/1000);last=t;if(!paused)clock.advance(delta,(dt)=>{animation.update(dt);physics.tilt=interaction.tilt;physics.update(dt);const next=behavior.update(dt,animation.clips);if(next)animation.play(next);runs++});if(runs%6===0){const idx=Math.floor(spring.nodes.length/2);const p=spring.nodes[idx];const offset=Math.hypot(p.x.x,p.y.x);$('pulseBar').style.width=`${Math.min(200,80+offset*2)}px`;$('mode').textContent=`SIMULATION ${paused?'PAUSED':'RUNNING'} · ${clock.ticks} fixed steps · rig: ${animation.current} · ${globalThis.PIXI?'PixiJS available':'PixiJS unavailable'}`}requestAnimationFrame(tick)}requestAnimationFrame(tick);
window.addEventListener('error',e=>log('Runtime: '+e.message));window.addEventListener('unhandledrejection',e=>log('Promise: '+String(e.reason)));
log('Engine core initialized. Character pipeline intentionally not populated.');

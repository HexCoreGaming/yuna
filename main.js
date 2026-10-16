// [009] Application composition / dependency injection. One entry point; independent engines.
import {Clock} from './engine/core.js';
import {AnimationDirector} from './engine/animation.js';
import {BehaviorDirector} from './engine/behavior.js';
import {CharacterRenderer} from './engine/render.js';
import {bindInteractions} from './engine/interaction.js';
import {loadSettings,saveSettings} from './engine/save.js';
const $=id=>document.getElementById(id);
// [010] Access gate is initialized in index.html, independent of module load.
const clock=new Clock();const anim=new AnimationDirector();const ai=new BehaviorDirector();const renderer=new CharacterRenderer($('viewport'));
let now=0;let lastAction='idle';let settings={...{physics:100,speed:100,zoom:100},...loadSettings()};
const status=t=>$('status').textContent=t;
// [011] Settings and action controls.
for(const id of ['physics','speed','zoom']){$(id).value=settings[id];const update=()=>{settings[id]=Number($(id).value);$(id+'Out').textContent=settings[id]+'%';renderer.motion=settings.physics/100;anim.speed=settings.speed/100;renderer.zoom=settings.zoom/100;renderer.fit();saveSettings(settings)};$(id).addEventListener('input',update);update()}
function action(name){lastAction=name;anim.select(name);document.querySelectorAll('[data-action]').forEach(btn=>btn.classList.toggle('selected',btn.dataset.action===name));$('actionCaption').textContent=`ACTIVE / ${name.toUpperCase()}`}
document.querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click',()=>{ai.enabled=false;$('autoplay').querySelector('b').textContent='OFF';action(btn.dataset.action)}));
document.querySelectorAll('[data-mood]').forEach(btn=>btn.addEventListener('click',()=>{anim.setMood(btn.dataset.mood);$('moodCaption').textContent=btn.dataset.mood.toUpperCase();document.querySelectorAll('[data-mood]').forEach(b=>b.classList.toggle('selected',b===btn))}));
$('autoplay').addEventListener('click',()=>{$('autoplay').querySelector('b').textContent=ai.toggle(now)?'ON':'OFF'});
$('tapPulse').addEventListener('click',()=>renderer.impulse({x:158,y:255},(Math.random()-.5)*100,170));
bindInteractions(renderer,status);
// [012] One continuously running physics loop with fixed simulation steps.
renderer.app.ticker.add(()=>{const dt=Math.min(renderer.app.ticker.deltaMS/1000,.04);clock.run(dt,(s,t)=>{now=t;const newAction=ai.update(t,anim);if(newAction)action(newAction);const pose=anim.update(s);renderer.update(s,t,pose)})});
try{await renderer.initialize();$('engineLabel').textContent='9 SYSTEMS ONLINE';status('ARTICULATED ARTWORK ONLINE · DRAG CHARACTER · SELECT AN ACTION')}catch(err){console.error('Artwork load failed',err);$('engineLabel').textContent='ARTWORK LOAD ERROR';status('CHARACTER ARTWORK MISSING — CHECK assets/rig PATHS')}

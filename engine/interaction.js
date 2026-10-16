// [007] Pointer input, drag forces, optional device-orientation sensors.
export function bindInteractions(renderer,status){let last=null,active=null;const view=renderer.app.view;
 view.style.touchAction='none';view.addEventListener('pointerdown',e=>{active=e.pointerId;view.setPointerCapture(e.pointerId);last=renderer.local(e.clientX,e.clientY);renderer.impulse(last,0,155)});
 view.addEventListener('pointermove',e=>{if(e.pointerId!==active||!last)return;const p=renderer.local(e.clientX,e.clientY);renderer.impulse(p,(p.x-last.x)*3,(p.y-last.y)*3);last=p});
 const end=e=>{if(e.pointerId===active){active=null;last=null}};view.addEventListener('pointerup',end);view.addEventListener('pointercancel',end);view.addEventListener('lostpointercapture',end);
 document.getElementById('tilt').addEventListener('click',async()=>{try{if(typeof DeviceOrientationEvent==='undefined')throw Error('No orientation sensor');if(typeof DeviceOrientationEvent.requestPermission==='function'){if(await DeviceOrientationEvent.requestPermission()!=='granted')throw Error('Permission not granted')}window.addEventListener('deviceorientation',e=>{renderer.tilt=[Math.max(-1,Math.min(1,(e.gamma||0)/45)),Math.max(-1,Math.min(1,(e.beta||0)/55))]});status('TILT SENSOR CONNECTED')}catch(e){status(`TILT UNAVAILABLE: ${e.message}`)}});
}

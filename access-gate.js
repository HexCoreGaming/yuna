// [SECTION 001] TWO-STAGE ENTRY DEMO — UI ONLY; NEVER CONFUSE WITH SERVER AUTHENTICATION.
// These two passcodes only control browser navigation. Static files remain publicly retrievable on GitHub Pages.
(() => {
  const codes = ['YUNA-ONE','YUNA-TWO']; // [SECTION 002] EDIT BOTH DEMO PASSCODES HERE
  const screen=document.createElement('div');screen.id='yuna-access';
  const style=document.createElement('style');
  style.textContent=`#yuna-access{position:fixed;inset:0;z-index:2147483647;background:radial-gradient(ellipse at center,#171132,#04040a 65%);display:grid;place-items:center;color:#eae6ff;font-family:system-ui,sans-serif}#yuna-access .gate-card{border:1px solid #655296;background:#0d0a18ee;border-radius:20px;padding:clamp(22px,5vw,48px);width:min(90vw,420px);box-shadow:0 20px 90px #0009}#yuna-access input{box-sizing:border-box;width:100%;background:#171329;color:white;border:1px solid #7661b1;border-radius:9px;padding:14px;font-size:16px;margin:18px 0 9px}#yuna-access button{background:#815fe0;border:0;color:#fff;border-radius:9px;padding:12px;width:100%;font-weight:700;cursor:pointer}#yuna-access h1{letter-spacing:.15em;font-size:22px}#yuna-access small{color:#b7aacd}#yuna-access p{min-height:20px;color:#df9aaa}`;
  document.head.appendChild(style);
  let level=0;
  screen.innerHTML=`<form class="gate-card"><small>HEXCORE / PRIVATE CHARACTER STUDIO</small><h1>YUNA // ACCESS</h1><div id="gate-level">ENTRY 01 / 02</div><input aria-label="Enter access phrase" type="password" required autocomplete="off" placeholder="Access phrase"/><p id="gate-error" aria-live="polite"></p><button type="submit">CONTINUE →</button><small>Two-step browser gate • not true hosting security</small></form>`;
  const attach=()=>{document.body.appendChild(screen);screen.querySelector('input').focus()};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attach);else attach();
  screen.querySelector('form').addEventListener('submit',e=>{
    e.preventDefault();const input=screen.querySelector('input');const error=screen.querySelector('#gate-error');
    if(input.value!==codes[level]){error.textContent='Incorrect phrase';input.value='';return}
    level++;input.value='';error.textContent='';
    if(level===2){screen.remove();style.remove();return}
    screen.querySelector('#gate-level').textContent='ENTRY 02 / 02';input.placeholder='Second access phrase';input.focus();
  });
})();

export function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
export function smoothstep(a, b, value) {
  const v = clamp((value - a) / (b - a), 0, 1);
  return v * v * (3 - 2 * v);
}
export class Spring {
  constructor(frequency = 13, damping = 0.74) {
    this.value = 0; this.velocity = 0; this.frequency = frequency; this.damping = damping;
  }
  update(target, elapsed) {
    // Bounded substeps keep the result predictable across refresh rates.
    const steps = Math.max(1, Math.ceil(clamp(elapsed,0,0.1)/(1/120)));
    const dt = clamp(elapsed,0,0.1) / steps;
    for(let i = 0; i < steps; i++) {
      this.velocity += (target-this.value) * this.frequency*this.frequency*dt;
      this.velocity *= Math.exp(-this.frequency * 2 * (1-this.damping) * dt);
      this.value += this.velocity * dt;
    }
    return this.value;
  }
  kick(amount) { this.velocity += amount; }
  reset() { this.velocity = 0; this.value = 0; }
}
export const SCENES = [
  {id:'first', title:'First Light', subtitle:'A quiet moment, just for you.', category:'MOMENT / 01', menu:'FIRST LIGHT', caption:'ARRIVAL · IDLE', icon:'✦', motion:'breathe', line:'Welcome. I was hoping you would stop by.'},
  {id:'walk', title:'The Blue Hour', subtitle:'Take your time. I’m right here.', category:'MOMENT / 02', menu:'BLUE HOUR', caption:'SLOW WALK', icon:'↝', motion:'walk', line:'Even the quietest places feel brighter with company.'},
  {id:'quiet', title:'After Hours', subtitle:'A little peace after a long day.', category:'MOMENT / 03', menu:'AFTER HOURS', caption:'STILLNESS · BREATH', icon:'☾', motion:'breathe', line:'You have been busy. We can just enjoy the quiet for a while.'},
  {id:'starlight', title:'Starlight', subtitle:'Look how far the stars go.', category:'MOMENT / 04', menu:'STARLIGHT', caption:'SLOW TURN · GESTURE', icon:'✧', motion:'sway', line:'Sometimes I wish every night could feel like this.'},
  {id:'dance', title:'Gravity / Zero', subtitle:'A little movement, a little magic.', category:'MOMENT / 05', menu:'GRAVITY ZERO', caption:'HOLOGRAPHIC DANCE', icon:'◇', motion:'dance', line:'Let me show you something. Just follow the rhythm.'}
];
export const MOODS = ['calm','happy','curious','playful'];
export function replyTo(input, mood='calm') {
  const s = String(input||'').trim().toLowerCase();
  if(!s) return 'I’m right here.';
  if(/hello|\bhi\b|hey|good morning|good evening/.test(s)) return 'Hey. It’s good to see you again.';
  if(/your name|who are you|what are you/.test(s)) return 'I’m Yuna. For now, this is my animated character studio, and my voice lines are scripted.';
  if(/tired|stressed|exhausted|long day|relax/.test(s)) return 'Then this moment is yours. There’s no rush. You can stay as long as you like.';
  if(/dance|move|show me/.test(s)) return 'All right. Let me try something with a little more energy.';
  if(/walk|stroll/.test(s)) return 'Of course. We can take it slowly.';
  if(/beautiful|pretty|nice|amazing|lovely/.test(s)) return 'That’s kind of you. I’m glad you like the look of this world.';
  if(/how are you|feeling/.test(s)) return mood==='happy' ? 'Bright and cheerful, at least in the story we’re making together.' : 'Calm and curious. How would you like this moment to feel?';
  if(/help|work|project|learn|teach|code/.test(s)) return 'I can be built to help with that later. Right now this version is a visual animation studio, not a thinking assistant.';
  if(/bye|goodbye|later/.test(s)) return 'I’ll be here when you want another quiet moment.';
  return [
    'Tell me more. I like hearing what you imagine for this place.',
    'I’m listening. What would you like this scene to feel like?',
    'That sounds interesting. I wish this prototype could understand the whole story already.',
    'For now I only have scripted replies, but I’m happy to share a moment with you.'
  ][[...s].reduce((n,c)=>n+c.charCodeAt(0),0)%4];
}

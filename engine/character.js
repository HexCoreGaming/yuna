// [013] Character manifest -> independently transformable painted layers, not procedural anatomy.
export class CharacterStage {
  constructor(host, rig, log=()=>{}) {this.host=host;this.rig=rig;this.log=log;this.app=null;this.container=null;this.sprites=[];this.ready=false;this.zoom=1;}
  async load(manifestUrl='assets/character.json') {
    if(!window.PIXI) throw Error('PixiJS unavailable: confirm CDN access');
    const response=await fetch(manifestUrl,{cache:'no-store'});
    if(!response.ok) throw Error(`Manifest HTTP ${response.status}: ${manifestUrl}`);
    const manifest=await response.json();
    if(manifest.schema!=='yuna-layer-rig/v1'||!manifest.canvas||!manifest.layers?.length)throw Error('Invalid character manifest schema');
    this.manifest=manifest;
    this.app=new PIXI.Application({resizeTo:this.host,backgroundAlpha:0,antialias:true,autoDensity:true,resolution:Math.min(window.devicePixelRatio||1,2)});
    this.host.appendChild(this.app.view);
    this.container=new PIXI.Container(); this.app.stage.addChild(this.container);
    const w=manifest.canvas.width,h=manifest.canvas.height;
    for(const layer of manifest.layers){
      try {
        const tex=await PIXI.Assets.load(layer.url);
        const sprite=new PIXI.Sprite(tex);
        // Layer images share one canvas, including their transparent margins.
        // Apply rotation about registered art coordinates, not about cropped rectangles.
        const [px,py]=layer.pivot||[w/2,h/2];
        sprite.anchor.set(px/w,py/h);sprite.position.set(px,py);
        this.container.addChild(sprite);
        this.sprites.push({layer,sprite});
      }catch(e){throw Error(`Layer ${layer.id} failed at ${layer.url}: ${e.message}`)}
    }
    this.ready=true;this.fit();window.addEventListener('resize',()=>this.fit());this.log(`${this.sprites.length} artwork layers loaded`);
  }
  fit(){if(!this.app||!this.manifest)return;const w=this.app.screen.width,h=this.app.screen.height,c=this.manifest.canvas;const scale=Math.min(w*.84/c.width,h*.92/c.height)*this.zoom;this.container.scale.set(scale);this.container.position.set((w-c.width*scale)/2,(h-c.height*scale)/2)}
  update(time){if(!this.ready)return;for(const {layer,sprite}of this.sprites){const value=layer.channel?this.rig.get(layer.channel):0;const idle=layer.id==='head'?Math.sin(time*1.2)*.008:0;sprite.rotation=value*(layer.gain??.2)+idle;const b=this.rig.get('breath');if(layer.id==='torso')sprite.scale.y=1+b*.008;}}
  dispose(){this.app?.destroy(true,{children:true});this.ready=false}
}

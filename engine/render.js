// [010] GPU renderer adapter, clean mesh buffer updates (NO accumulation of base offsets)
export class RendererEngine{
 constructor(host){this.host=host;this.app=null;this.stage=null;this.meshes=new Map();this.ready=false}
 initialize(){if(!globalThis.PIXI)throw Error('PixiJS library unavailable');this.app=new PIXI.Application({resizeTo:this.host,backgroundColor:0x080a15,antialias:true,autoDensity:true,resolution:Math.min(devicePixelRatio||1,2)});this.host.appendChild(this.app.view);this.stage=new PIXI.Container();this.app.stage.addChild(this.stage);this.ready=true}
 addMesh(id,texture,physics,{x=0,y=0}={}){if(!this.ready)throw Error('Renderer not started');const v=physics.positions;const m=new PIXI.SimpleMesh(texture,v,physics.uvs,physics.indices,PIXI.DRAW_MODES.TRIANGLES);m.position.set(x,y);this.stage.addChild(m);this.meshes.set(id,{mesh:m,physics});return m}
 sync(){for(const {mesh}of this.meshes.values())mesh.geometry.getBuffer('aVertexPosition').update()}
 destroy(){this.app?.destroy(true,{children:true});this.ready=false}
}

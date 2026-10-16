// [007] future characters, scenes, props without implementing a room
export class SceneEngine{
 constructor(){this.characters=new Map();this.props=new Map();this.current='void'}
 addCharacter(id,rig){if(this.characters.has(id))throw Error('Character already present');this.characters.set(id,rig)}
 removeCharacter(id){this.characters.delete(id)}
 addProp(id,prop){this.props.set(id,prop)}
 setScene(id){this.current=id}
 serialize(){return {scene:this.current,characters:[...this.characters.keys()],props:[...this.props.keys()]}}
}

// [008] versioned, validated local preferences
export class SettingsEngine{
 constructor(key='yuna-engine-v1.2.0'){this.key=key;this.defaults={zoom:1,intensity:1,auto:false}}
 load(){try{return {...this.defaults,...JSON.parse(localStorage.getItem(this.key)||'{}')}}catch{return {...this.defaults}}}
 save(data){try{localStorage.setItem(this.key,JSON.stringify(data));return true}catch{return false}}
}

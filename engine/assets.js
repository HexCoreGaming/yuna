// [005] manifest validation, transparent asset failure, no missing-file placeholders
export class AssetEngine {
 constructor(){this.manifest=null;this.cache=new Map();this.errors=[]}
 validate(data){if(!data||!Array.isArray(data.layers)||!data.layers.length)throw Error('Manifest requires at least one layer');for(const item of data.layers){if(!item.id||!item.url)throw Error('Layer requires id and url')}this.manifest=data;return true}
 async loadImage(url){if(this.cache.has(url))return this.cache.get(url);const image=new Image();image.decoding='async';image.src=url;try{await image.decode()}catch(e){this.errors.push(`${url}: ${e.message}`);throw Error(`Asset missing or invalid: ${url}`)}this.cache.set(url,image);return image}
 async loadAll(){if(!this.manifest)throw Error('Load manifest first');return Promise.all(this.manifest.layers.map(l=>this.loadImage(l.url)))}
}

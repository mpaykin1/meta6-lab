import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createIslandWeatherCatalog} from '../island-weather.mjs';
import {createIslandWeatherFX} from '../island-weather-fx.mjs';
const catalog=createIslandWeatherCatalog();
class BufferGeometry{
 constructor(){this.attributes={}}
 setAttribute(k,v){this.attributes[k]=v}
 dispose(){this.disposed=true}
}
class BufferAttribute{constructor(array,size){this.array=array;this.size=size}}
class ShaderMaterial{
 constructor(opts){Object.assign(this,opts)}
 dispose(){this.disposed=true}
}
class Color{constructor(x){this.value=x}set(x){this.value=x}}
class Points{
 constructor(geo,material){this.geometry=geo;this.material=material;this.position={copy:p=>{this.x=p.x;this.y=p.y;this.z=p.z}}}
}
const THREE={BufferGeometry,BufferAttribute,ShaderMaterial,Color,Points,NormalBlending:1,AdditiveBlending:2};
test('§21.8: renderer shares one scene, one GPU drawcall and exact seven owner weather uniforms across 600 frames',()=>{
 const scene={children:[],add(o){this.children.push(o)},remove(o){this.children.splice(this.children.indexOf(o),1)}};
 const camera={fov:46,position:{x:5,y:8,z:12}};
 const fx=createIslandWeatherFX({THREE,scene,camera,count:90});
 assert.equal(scene.children.length,1);
 assert.equal(fx.points.geometry.attributes.position.array.length,270);
 assert.equal(fx.points.geometry.attributes.aPhase.array.length,270);
 assert.match(fx.points.material.vertexShader,/modelViewMatrix/);
 assert.match(fx.points.material.vertexShader,/uFall/);
 assert.match(fx.points.material.fragmentShader,/gl_PointCoord/);
 assert.equal(fx.points.name,'island-canon-weather-gpu');
 const names=[...catalog.keys()];
 for(let frame=0;frame<600;frame++){
  const id=names[frame%names.length],original=catalog.get(id);
  fx.select(id);fx.update(1/60,'island',false,frame/60,844);
  const s=fx.snapshot();
  assert.equal(s.kind,id);
  for(const k of ['size','fall','sway','alpha','shape','glow','box']){
   assert(Math.abs(s[k]-(original[k]??({glow:0,box:24}[k])))<=1e-6,
    'preset drift '+id+' '+k+' '+s[k]);
  }
  assert.equal(s.blending,original.additive?THREE.AdditiveBlending:THREE.NormalBlending);
  assert.equal(s.visible,true);
  assert.equal(s.time,frame/60);
  assert.equal(scene.children.length,1,'second scene/renderer not permitted');
 }
 fx.select(null);fx.update(1/60,'ash',false,11,844);
 assert.equal(fx.snapshot().kind,'ash');
 fx.update(1/60,'water',true,12,844);
 assert.equal(fx.snapshot().visible,false,'no rain through underwater camera');
 assert.equal(fx.snapshot().kind,'sea_mist');
 fx.dispose();assert.equal(scene.children.length,0);
});

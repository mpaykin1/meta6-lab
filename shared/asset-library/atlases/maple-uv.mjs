// UV grid adapter only: pixel-art PNG bytes are unchanged.
export const GRID = Object.freeze({width:512,height:512,columns:8,rows:8,tileWidth:64,tileHeight:64});
export function tileUV(column,row) {
  if(!Number.isInteger(column)||column<0||column>=8||!Number.isInteger(row)||row<0||row>=8) throw new RangeError('Atlas tile must be within 0..7');
  return {u0:column/8,v0:(7-row)/8,u1:(column+1)/8,v1:(8-row)/8};
}
export async function loadOriginalMapleTexture(THREE,url=new URL('./three-worlds-maple-8dir-8f.png',import.meta.url).href) {
  if(!THREE?.TextureLoader||!THREE?.NearestFilter) throw new TypeError('Three.js namespace required');
  const texture=await new THREE.TextureLoader().loadAsync(url);
  texture.magFilter=THREE.NearestFilter; texture.minFilter=THREE.NearestFilter;
  if(THREE.SRGBColorSpace) texture.colorSpace=THREE.SRGBColorSpace;
  texture.needsUpdate=true; return texture;
}
export function selectTile(originalTexture,column,row) {
  const uv=tileUV(column,row),tile=originalTexture.clone();
  tile.repeat.set(uv.u1-uv.u0,uv.v1-uv.v0);
  tile.offset.set(uv.u0,uv.v0);
  tile.needsUpdate=true; return tile;
}

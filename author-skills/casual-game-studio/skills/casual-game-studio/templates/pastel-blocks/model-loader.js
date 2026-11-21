/**
 * Blockbench-authored glTF with optional genuine Meshoptimizer decoding.
 * Meshopt is used only for compressed GLB, retaining the same 3D model identity.
 * If compressed download/decoder fails, retain the original uncompressed GLB.
 */
const MESHOPT_PREFERRED = false;
const SOURCE_GLB = './models/pastel-bunny.glb';
const COMPRESSED_GLB = './models/pastel-bunny.meshopt.glb';
export async function loadMascot(scene, modelPath=MESHOPT_PREFERRED ? COMPRESSED_GLB : SOURCE_GLB) {
  const {GLTFLoader}=await import('three/addons/loaders/GLTFLoader.js');
  const useMeshopt=/(\.meshopt\.glb)(?:[?#]|$)/.test(modelPath);
  const loader=new GLTFLoader();
  let gltf;
  try {
    if(useMeshopt){
      const {MeshoptDecoder}=await import('meshoptimizer/decoder');
      await MeshoptDecoder.ready;
      loader.setMeshoptDecoder(MeshoptDecoder);
    }
    gltf=await loader.loadAsync(modelPath);
  } catch(error) {
    if(!useMeshopt)throw error;
    console.warn('Meshopt GLB unavailable, loading original Blockbench model',error);
    gltf=await new GLTFLoader().loadAsync(SOURCE_GLB);
  }
  const model=gltf.scene;
  model.traverse(object=>{if(object.isMesh){object.castShadow=true;object.receiveShadow=true;}});
  return model;
}

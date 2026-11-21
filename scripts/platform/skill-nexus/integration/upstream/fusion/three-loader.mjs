// Integration bridge for a Vite/Three.js game: existing GLB2, optimized GLB2,
// and optional EXT_meshopt_compression all share the same loader.
// No game object is created or animated automatically. Keep one hero identity.
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const fusionLoader = new GLTFLoader();
fusionLoader.setMeshoptDecoder(MeshoptDecoder);

export async function loadFusionAsset(url, scene) {
  if (!scene || typeof scene.add !== 'function') {
    throw new TypeError('loadFusionAsset requires a THREE.Scene or Group');
  }
  const gltf = await fusionLoader.loadAsync(url);
  scene.add(gltf.scene);
  // Caller owns camera, controls, rigs, hitboxes, and deliberate clip selection.
  return { root: gltf.scene, clips: gltf.animations, metadata: gltf.asset };
}

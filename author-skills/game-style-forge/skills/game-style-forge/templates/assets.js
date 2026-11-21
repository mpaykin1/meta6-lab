/**
 * Game Style Forge GLB asset loader. Geometry from authored GLB, no procedural
 * replacements for the approved hero. Meshopt handled by Three.js decoder.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

export async function loadSceneAssets(scene, models, physics, spatial = null) {
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const objects = [];
  const collisions = [];
  const base = import.meta.env.BASE_URL;
  for (const model of models) {
    if (!/^[a-z][a-z0-9_-]{0,63}$/.test(model.name)) continue;
    const url = base + 'models/' + encodeURIComponent(model.name) + '.glb';
    try {
      const gltf = await loader.loadAsync(url);
      const root = gltf.scene;
      const p = model.position ?? [4,0,-7];
      root.position.set(Number(p[0]),Number(p[1]),Number(p[2]));
      root.scale.setScalar(Number(model.scale) || 1);
      root.userData.gameStyleForgeName=model.name;
      scene.add(root);
      spatial?.registerStatic(root); // Visual ray queries only, no physics inference.
      objects.push(root);
      // Only explicitly authored approximate boxes may become Rapier colliders.
      if (model.collider && physics?.registerStaticBox) {
        const c = model.collider;
        const s = root.scale.x;
        const size = [Number(c.width)*s,Number(c.height)*s,Number(c.depth)*s];
        const center = {x:root.position.x,y:root.position.y+size[1]/2,z:root.position.z};
        physics.registerStaticBox(center,size);
        collisions.push(model.name);
      }
    } catch (e) {
      console.warn('GLB asset not loaded:', model.name, String(e));
    }
  }
  return {objects,collisions};
}

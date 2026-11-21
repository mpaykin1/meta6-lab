/**
 * Three-VRM 3.5.5 avatar adapter: one persistent humanoid instance per user selection.
 * No autonomous actions. The existing Tween.js Group is the sole animation timeline.
 * Loading an invalid VRM never removes the previous character.
 */
import {Tween, Easing} from './vendor/tween.esm.js';

export async function prepareVrm({THREE, source, motion}) {
  const [{GLTFLoader}, {VRMLoaderPlugin}] = await Promise.all([
    import('three/addons/loaders/GLTFLoader.js'), import('@pixiv/three-vrm')
  ]);
  const loader = new GLTFLoader();
  loader.register(parser => new VRMLoaderPlugin(parser));
  const result = await loader.loadAsync(source);
  const vrm = result.userData.vrm;
  if (!vrm?.humanoid || !vrm.scene) throw new Error('Файл не содержит корректный VRM humanoid.');
  const model = vrm.scene;
  // Preserve all source meshes, materials, bones, and expression bindings.
  model.traverse(node => { if (node.isMesh || node.isSkinnedMesh) {
    node.castShadow = true; node.receiveShadow = true;
    // Animated VRM meshes can move beyond their rest-pose bounds.
    node.frustumCulled = false;
  }});
  const bounds = new THREE.Box3().setFromObject(model);
  const dim = bounds.getSize(new THREE.Vector3());
  if (!(dim.y > .001) || !Number.isFinite(dim.y)) throw new Error('У VRM некорректные размеры.');
  const scl = Math.min(8, 1.62 / dim.y);
  // Place the avatar on the existing pod without affecting the authored skeleton.
  model.scale.setScalar(scl);
  model.position.set(-.5*(bounds.min.x+bounds.max.x)*scl, -bounds.min.y*scl, -.5*(bounds.min.z+bounds.max.z)*scl);
  model.updateMatrixWorld(true);
  let stopped = false;
  let activeTween = null;
  const runningTweens = [];
  const cancel = () => {for (const t of runningTweens) t.stop();runningTweens.length=0;activeTween=null;};
  const arm = vrm.humanoid.getNormalizedBoneNode('rightUpperArm');
  const armRest = arm?.quaternion.clone();
  const expressionManager = vrm.expressionManager;
  const canWave = Boolean(arm);
  const canBlink = Boolean(expressionManager?.getExpression?.('blink'));
  const avatar = {
    vrm, model, canWave, canBlink,
    update(dt) {if(!stopped)vrm.update(Math.min(dt,.05));},
    wave() {
      if(stopped || !arm || activeTween) return false;
      const value = {angle:0};
      const axis = new THREE.Vector3(0,0,1);
      const anim = () => { arm.quaternion.copy(armRest).multiply(new THREE.Quaternion().setFromAxisAngle(axis, value.angle)); };
      const raise = new Tween(value,motion).to({angle:-.85},240).easing(Easing.Cubic.Out).onUpdate(anim);
      const swing = new Tween(value,motion).to({angle:-.54},150).easing(Easing.Quadratic.InOut).onUpdate(anim);
      const swingBack = new Tween(value,motion).to({angle:-.86},150).easing(Easing.Quadratic.InOut).onUpdate(anim);
      const lower = new Tween(value,motion).to({angle:0},260).easing(Easing.Cubic.Out).onUpdate(anim).onComplete(()=>{arm.quaternion.copy(armRest);activeTween=null;});
      raise.chain(swing);swing.chain(swingBack);swingBack.chain(lower);
      runningTweens.push(raise,swing,swingBack,lower);activeTween=raise;raise.start();return true;
    },
    blink() {
      if(stopped || !canBlink || activeTween) return false;
      const state = {v:0};
      const apply = () => expressionManager.setValue('blink',state.v);
      const shut = new Tween(state,motion).to({v:1},110).easing(Easing.Cubic.In).onUpdate(apply);
      const open = new Tween(state,motion).to({v:0},180).delay(90).easing(Easing.Cubic.Out).onUpdate(apply)
        .onComplete(()=>{expressionManager.setValue('blink',0);activeTween=null;});
      shut.chain(open);runningTweens.push(shut,open);activeTween=shut;shut.start();return true;
    },
    dispose() {
      stopped=true;cancel();if(arm && armRest)arm.quaternion.copy(armRest);
      if(canBlink)expressionManager.setValue('blink',0);
      if(model.parent)model.parent.remove(model);
      // GLTFLoader may share textures/materials within one VRM. Dispose only once.
      const geo = new Set(), mat = new Set(), tex = new Set();
      model.traverse(n=>{
        if(n.geometry)geo.add(n.geometry);
        for(const m of (Array.isArray(n.material)?n.material:[n.material]))if(m)mat.add(m);
      });
      for(const m of mat){for(const v of Object.values(m))if(v?.isTexture)tex.add(v);}
      for(const x of geo)x.dispose();for(const x of mat)x.dispose();for(const x of tex)x.dispose();
    }
  };
  return avatar;
}

// Общая тестовая сцена. bad=true повторяет ошибки Bullet Car 1.2 (24.11.2026):
// 18 ламп (7 выключенных), зеркало перерисовывает весь мир каждый кадр,
// лес из 1369 отдельных объектов, позиции 8500 экземпляров отправляются каждый кадр,
// большая текстура грязи перезаливается каждый кадр, тени в реальном времени.
import * as THREE from './three.module.js';
export function run(bad) {
  const r = new THREE.WebGLRenderer({ antialias: false }); r.setPixelRatio(1); r.setSize(innerWidth, innerHeight);
  document.body.style.margin = 0; document.body.appendChild(r.domElement);
  const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0x201010, 10, 80);
  const cam = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 200); cam.position.set(0, 3, 10);
  scene.add(new THREE.AmbientLight(0x664444, 1));
  const sun = new THREE.DirectionalLight(0xffccaa, 1); sun.position.set(5, 10, 5); scene.add(sun);
  if (bad) { r.shadowMap.enabled = true; sun.castShadow = true;
    for (let i = 0; i < 17; i++) { const p = new THREE.PointLight(0xff8844, i < 7 ? 0 : 2, 15); p.position.set((i % 6) * 4 - 10, 1, -(i >> 1) * 3); scene.add(p); } }
  const mat = new THREE.MeshStandardMaterial({ color: 0x556644 });
  const geo = new THREE.ConeGeometry(0.6, 2.5, 6);
  const N = bad ? 8500 : 2500;
  const inst = new THREE.InstancedMesh(geo, mat, N); const d = new THREE.Object3D();
  for (let i = 0; i < N; i++) { d.position.set((Math.random() - .5) * 120, 1, -Math.random() * 120); d.updateMatrix(); inst.setMatrixAt(i, d.matrix); }
  scene.add(inst);
  if (bad) for (let i = 0; i < 1369; i++) { const m = new THREE.Mesh(geo, mat); m.position.set((Math.random() - .5) * 60, 1, -Math.random() * 60); m.castShadow = true; scene.add(m); }
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: 0x332211 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const mirrorRT = new THREE.WebGLRenderTarget(256, 128); const mirrorCam = cam.clone();
  const dirt = document.createElement('canvas'); dirt.width = 512; dirt.height = 512; const dctx = dirt.getContext('2d');
  const dirtTex = new THREE.CanvasTexture(dirt);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(4, 2), new THREE.MeshBasicMaterial({ map: dirtTex, transparent: true, opacity: .3 })); glass.position.set(0, 3, 7); scene.add(glass);
  const clock = new THREE.Clock();
  r.setAnimationLoop(() => {
    const t = clock.getElapsedTime(); cam.position.x = Math.sin(t * .3) * 2;
    if (bad) {
      inst.instanceMatrix.needsUpdate = true;           // весь лес каждый кадр
      dctx.fillStyle = `rgba(80,50,20,.02)`; dctx.fillRect(0, 0, 512, 512); dirtTex.needsUpdate = true; // грязь каждый кадр
      r.setRenderTarget(mirrorRT); r.render(scene, mirrorCam); r.setRenderTarget(null); // зеркало = вторая сцена
    }
    r.render(scene, cam);
  });
}
